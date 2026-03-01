"""
AI Debate Tutor — Critical Thinking Mode.
Two agents: Challenger + Supporter + Verifier
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

from core.database import get_db
from api.routes.auth import get_current_user
from models.user import User
from models.cognitive import DebateSession
from services.ai_service import AIService

router = APIRouter()


class StartDebateRequest(BaseModel):
    topic: str
    concept_id: Optional[int] = None
    student_position: Optional[str] = None

class DebateTurnRequest(BaseModel):
    student_argument: str

class DebateResponse(BaseModel):
    debate_id: int
    topic: str
    status: str
    turns: list
    scores: Optional[dict] = None


@router.post("/start")
async def start_debate(
    req: StartDebateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Start a new AI debate session."""
    # AI generates opening challenge
    opening = await AIService.generate_debate_turn(
        topic=req.topic,
        role="challenger",
        student_position=req.student_position or "",
        history=[],
    )

    initial_turns = []
    if req.student_position:
        initial_turns.append({
            "role": "student",
            "content": req.student_position,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
    initial_turns.append({
        "role": "challenger",
        "content": opening,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    session = DebateSession(
        user_id=current_user.id,
        topic=req.topic,
        concept_id=req.concept_id,
        student_position=req.student_position,
        turns=initial_turns,
        status="active",
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "debate_id": session.id,
        "topic": session.topic,
        "status": "active",
        "turns": session.turns,
        "instruction": "Respond with your argument. The AI will challenge your reasoning to build critical thinking.",
    }


@router.post("/{debate_id}/turn")
async def submit_debate_turn(
    debate_id: int,
    req: DebateTurnRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit a debate turn and get AI response."""
    session = db.query(DebateSession).filter(
        DebateSession.id == debate_id,
        DebateSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(404, "Debate session not found")
    if session.status != "active":
        raise HTTPException(400, "Debate is no longer active")

    turns = session.turns or []

    # Add student turn
    turns.append({
        "role": "student",
        "content": req.student_argument,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    # Alternate between challenger and supporter
    student_turns = [t for t in turns if t["role"] == "student"]
    if len(student_turns) % 2 == 1:
        role = "challenger"
    else:
        role = "supporter"

    # Generate AI response
    ai_response = await AIService.generate_debate_turn(
        topic=session.topic,
        role=role,
        student_position=req.student_argument,
        history=turns,
    )

    turns.append({
        "role": role,
        "content": ai_response,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    session.turns = turns
    db.commit()

    # Auto-resolve after 6 turns (3 student turns)
    if len(student_turns) >= 3:
        return {
            "debate_id": session.id,
            "latest_turn": {"role": role, "content": ai_response},
            "can_continue": True,
            "suggestion": "You can continue debating or finish the session for a full evaluation.",
            "turns_so_far": len(turns),
        }

    return {
        "debate_id": session.id,
        "latest_turn": {"role": role, "content": ai_response},
        "can_continue": True,
        "turns_so_far": len(turns),
    }


@router.post("/{debate_id}/resolve")
async def resolve_debate(
    debate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Finish debate and get Verifier evaluation."""
    session = db.query(DebateSession).filter(
        DebateSession.id == debate_id,
        DebateSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(404, "Debate session not found")

    turns = session.turns or []
    student_args = [t["content"] for t in turns if t["role"] == "student"]

    # Generate resolution / evaluation
    evaluation = await AIService.evaluate_debate(
        topic=session.topic,
        student_arguments=student_args,
        all_turns=turns,
    )

    session.resolution = evaluation.get("resolution", "")
    session.critical_thinking_score = evaluation.get("critical_thinking_score", 0.0)
    session.argument_quality_score = evaluation.get("argument_quality_score", 0.0)
    session.evidence_usage_score = evaluation.get("evidence_usage_score", 0.0)
    session.metacognition_score = evaluation.get("metacognition_score", 0.0)
    session.overall_score = evaluation.get("overall_score", 0.0)
    session.status = "completed"
    session.completed_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "debate_id": session.id,
        "topic": session.topic,
        "status": "completed",
        "resolution": session.resolution,
        "scores": {
            "critical_thinking": session.critical_thinking_score,
            "argument_quality": session.argument_quality_score,
            "evidence_usage": session.evidence_usage_score,
            "metacognition": session.metacognition_score,
            "overall": session.overall_score,
        },
        "turns": turns,
        "total_student_arguments": len(student_args),
    }


@router.get("/history")
async def get_debate_history(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List past debate sessions."""
    sessions = (
        db.query(DebateSession)
        .filter(DebateSession.user_id == current_user.id)
        .order_by(DebateSession.created_at.desc())
        .limit(limit)
        .all()
    )
    return {
        "debates": [
            {
                "id": s.id,
                "topic": s.topic,
                "status": s.status,
                "overall_score": s.overall_score,
                "total_turns": len(s.turns or []),
                "created_at": str(s.created_at),
                "completed_at": str(s.completed_at) if s.completed_at else None,
            }
            for s in sessions
        ]
    }
