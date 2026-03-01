"""
Study Planner routes with spaced repetition
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

from core.database import get_db
from services.spaced_repetition import SpacedRepetitionService
from api.routes.auth import get_current_user
from models.user import User
from models.mastery import MasteryLog, StudySession

router = APIRouter()


class StudyPlanRequest(BaseModel):
    concept_ids: List[int]
    exam_date: Optional[datetime] = None
    daily_study_time_minutes: int = 60


class UpdateReviewRequest(BaseModel):
    concept_id: int
    performance_score: float


class StudyPlanResponse(BaseModel):
    plan: List[Dict]
    total_concepts: int
    estimated_days: int
    exam_readiness: Optional[Dict] = None


@router.post("/create-plan", response_model=StudyPlanResponse)
async def create_study_plan(
    request: StudyPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create personalized study plan using spaced repetition
    """
    # Get mastery logs for concepts
    mastery_logs = db.query(MasteryLog).filter(
        MasteryLog.user_id == current_user.id,
        MasteryLog.concept_id.in_(request.concept_ids)
    ).all()
    
    # Get concepts due for review
    due_concepts = SpacedRepetitionService.get_due_concepts(mastery_logs)
    
    # Create study plan
    plan = []
    for log in due_concepts:
        plan.append({
            "concept_id": log.concept_id,
            "priority": "high" if log.mastery_score < 0.5 else "medium",
            "estimated_time_minutes": 30,
            "review_date": log.next_review.isoformat() if log.next_review else datetime.now().isoformat()
        })
    
    # Calculate exam readiness if exam date provided
    exam_readiness = None
    if request.exam_date:
        exam_readiness = SpacedRepetitionService.calculate_exam_readiness(
            mastery_logs=mastery_logs,
            exam_date=request.exam_date
        )
    
    return StudyPlanResponse(
        plan=plan,
        total_concepts=len(request.concept_ids),
        estimated_days=len(plan),
        exam_readiness=exam_readiness
    )


@router.get("/due-concepts")
async def get_due_concepts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get concepts due for review"""
    mastery_logs = db.query(MasteryLog).filter(
        MasteryLog.user_id == current_user.id
    ).all()
    
    due_concepts = SpacedRepetitionService.get_due_concepts(mastery_logs)
    
    return {
        "due_concepts": [
            {
                "concept_id": log.concept_id,
                "mastery_score": log.mastery_score,
                "next_review": log.next_review.isoformat() if log.next_review else None
            }
            for log in due_concepts
        ],
        "total_due": len(due_concepts)
    }


@router.post("/update-review")
async def update_review_schedule(
    body: UpdateReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update review schedule after practice session."""
    concept_id = body.concept_id
    performance_score = body.performance_score
    mastery_log = db.query(MasteryLog).filter(
        MasteryLog.user_id == current_user.id,
        MasteryLog.concept_id == concept_id
    ).first()
    
    if not mastery_log:
        raise HTTPException(status_code=404, detail="Mastery log not found")
    
    ease_factor = (mastery_log.meta_data or {}).get("ease_factor", 2.5)
    next_review = SpacedRepetitionService.calculate_next_review(
        mastery_log=mastery_log,
        performance_score=performance_score,
        ease_factor=ease_factor
    )
    
    mastery_log.next_review = next_review
    db.commit()
    
    return {
        "message": "Review schedule updated",
        "next_review": next_review.isoformat(),
        "concept_id": concept_id
    }


@router.get("/exam-readiness")
async def get_exam_readiness(
    exam_date: str,
    concept_ids: Optional[List[int]] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get exam readiness score. exam_date as ISO string (e.g. 2024-02-20T09:00:00)."""
    try:
        exam_dt = datetime.fromisoformat(exam_date.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid exam_date format. Use ISO format.")
    query = db.query(MasteryLog).filter(MasteryLog.user_id == current_user.id)
    
    if concept_ids:
        query = query.filter(MasteryLog.concept_id.in_(concept_ids))
    
    mastery_logs = query.all()
    readiness = SpacedRepetitionService.calculate_exam_readiness(
        mastery_logs=mastery_logs,
        exam_date=exam_dt
    )
    
    return readiness
