"""
Institutional Dashboard — class-level analytics, heatmaps, risk prediction
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from core.database import get_db
from api.routes.auth import get_current_user
from models.user import User
from models.concept import Concept
from models.mastery import MasteryLog
from models.question import Attempt
from models.cognitive import CognitiveProfile

router = APIRouter()


@router.get("/class-analytics")
async def get_class_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Class-level analytics — aggregated mastery across all students.
    In production, you'd restrict to teacher/admin role.
    """
    # All users
    users = db.query(User).filter(User.is_active == True).all()
    total_students = len(users)

    # All mastery logs
    all_mastery = db.query(MasteryLog).all()
    concepts = {c.id: c for c in db.query(Concept).all()}

    # Per-concept aggregation
    concept_stats: Dict[int, Dict] = {}
    for m in all_mastery:
        if m.concept_id not in concept_stats:
            concept_stats[m.concept_id] = {"scores": [], "title": concepts.get(m.concept_id, None)}
        concept_stats[m.concept_id]["scores"].append(m.mastery_score)

    heatmap = []
    weak_concepts = []
    for cid, data in concept_stats.items():
        scores = data["scores"]
        avg = sum(scores) / len(scores) if scores else 0
        title = data["title"].title if data["title"] else str(cid)
        entry = {
            "concept_id": cid,
            "concept_title": title,
            "avg_mastery": round(avg, 3),
            "students_attempted": len(scores),
            "students_struggling": sum(1 for s in scores if s < 0.5),
            "students_mastered": sum(1 for s in scores if s >= 0.8),
        }
        heatmap.append(entry)
        if avg < 0.5:
            weak_concepts.append(entry)

    heatmap.sort(key=lambda x: x["avg_mastery"])

    # At-risk students (low average mastery)
    user_mastery: Dict[int, List[float]] = {}
    for m in all_mastery:
        user_mastery.setdefault(m.user_id, []).append(m.mastery_score)

    at_risk = []
    for uid, scores in user_mastery.items():
        avg = sum(scores) / len(scores)
        if avg < 0.4:
            user = next((u for u in users if u.id == uid), None)
            if user:
                at_risk.append({
                    "user_id": uid,
                    "name": user.full_name or user.username,
                    "avg_mastery": round(avg, 3),
                    "concepts_attempted": len(scores),
                    "risk_level": "high" if avg < 0.25 else "medium",
                })
    at_risk.sort(key=lambda x: x["avg_mastery"])

    return {
        "total_students": total_students,
        "total_concepts": len(concepts),
        "concept_heatmap": heatmap,
        "weak_concepts": weak_concepts,
        "at_risk_students": at_risk,
        "class_avg_mastery": round(
            sum(m.mastery_score for m in all_mastery) / max(len(all_mastery), 1), 3
        ),
    }


@router.get("/student/{user_id}/summary")
async def get_student_summary(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific student's summary for institutional view."""
    student = db.query(User).filter(User.id == user_id).first()
    if not student:
        raise HTTPException(404, "Student not found")

    mastery_logs = db.query(MasteryLog).filter(MasteryLog.user_id == user_id).all()
    attempts = db.query(Attempt).filter(Attempt.user_id == user_id).all()
    concepts = {c.id: c.title for c in db.query(Concept).all()}

    avg_mastery = sum(m.mastery_score for m in mastery_logs) / max(len(mastery_logs), 1)
    accuracy = sum(1 for a in attempts if a.is_correct == "correct") / max(len(attempts), 1)

    # Cognitive profile if available
    profile = db.query(CognitiveProfile).filter(CognitiveProfile.user_id == user_id).first()
    cognitive_data = None
    if profile:
        cognitive_data = {
            "learning_style": profile.learning_style,
            "motivation_pattern": profile.motivation_pattern,
            "frustration_score": profile.frustration_score,
            "overconfidence_index": profile.overconfidence_index,
        }

    return {
        "student": {
            "id": student.id,
            "name": student.full_name or student.username,
            "email": student.email,
            "level": student.level,
            "total_xp": student.total_xp,
        },
        "mastery_summary": {
            "avg_mastery": round(avg_mastery, 3),
            "total_concepts": len(mastery_logs),
            "strong": len([m for m in mastery_logs if m.mastery_score >= 0.7]),
            "weak": len([m for m in mastery_logs if m.mastery_score < 0.5]),
        },
        "attempt_summary": {
            "total_attempts": len(attempts),
            "accuracy": round(accuracy, 3),
            "avg_hints": round(sum(a.hint_level_used for a in attempts) / max(len(attempts), 1), 2),
        },
        "cognitive_profile": cognitive_data,
        "concept_scores": [
            {
                "concept_id": m.concept_id,
                "concept_title": concepts.get(m.concept_id, str(m.concept_id)),
                "mastery": round(m.mastery_score, 3),
                "confidence": round(m.confidence_score, 3),
            }
            for m in mastery_logs
        ],
    }


@router.get("/leaderboard")
async def get_leaderboard(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Class leaderboard by XP and mastery."""
    users = (
        db.query(User)
        .filter(User.is_active == True)
        .order_by(User.total_xp.desc())
        .limit(limit)
        .all()
    )

    leaderboard = []
    for rank, user in enumerate(users, 1):
        mastery_logs = db.query(MasteryLog).filter(MasteryLog.user_id == user.id).all()
        avg_mastery = sum(m.mastery_score for m in mastery_logs) / max(len(mastery_logs), 1)
        leaderboard.append({
            "rank": rank,
            "user_id": user.id,
            "name": user.full_name or user.username,
            "level": user.level,
            "total_xp": user.total_xp,
            "avg_mastery": round(avg_mastery, 3),
            "concepts_mastered": len([m for m in mastery_logs if m.mastery_score >= 0.8]),
        })

    return {"leaderboard": leaderboard, "total_students": len(users)}
