"""
Cognitive Profile & Learning DNA routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, List, Optional, Any

from core.database import get_db
from api.routes.auth import get_current_user
from models.user import User
from models.cognitive import CognitiveProfile, EmotionalState
from services.cognitive_engine import CognitiveEngine

router = APIRouter()


# ── Pydantic models ─────────────────────────────────────────

class CognitiveProfileResponse(BaseModel):
    abstraction_skill: float
    procedural_strength: float
    retention_rate: float
    transfer_ability: float
    metacognition_score: float
    overconfidence_index: float
    hesitation_index: float
    hint_dependency_index: float
    consistency_index: float
    frustration_score: float
    error_pattern_type: int
    error_pattern_label: str
    learning_style: str
    motivation_pattern: str
    avg_self_confidence: float
    confidence_accuracy_gap: float
    total_sessions: int
    total_time_minutes: int

class EmotionalStateRequest(BaseModel):
    session_type: str = "practice"
    pre_session_confidence: Optional[float] = None
    post_session_confidence: Optional[float] = None
    self_reported_mood: Optional[str] = None
    performance_score: float = 0.0
    session_duration_seconds: int = 0

class EmotionalStateResponse(BaseModel):
    id: int
    session_type: str
    pre_session_confidence: Optional[float]
    post_session_confidence: Optional[float]
    self_reported_mood: Optional[str]
    performance_score: float
    confidence_performance_gap: float
    frustration_detected: int
    engagement_score: float
    created_at: str


# ── Endpoints ────────────────────────────────────────────────

@router.get("/profile", response_model=CognitiveProfileResponse)
async def get_cognitive_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the student's cognitive profile vector."""
    profile = CognitiveEngine.recompute_profile(db, current_user.id)
    db.commit()
    return CognitiveProfileResponse(
        abstraction_skill=profile.abstraction_skill,
        procedural_strength=profile.procedural_strength,
        retention_rate=profile.retention_rate,
        transfer_ability=profile.transfer_ability,
        metacognition_score=profile.metacognition_score,
        overconfidence_index=profile.overconfidence_index,
        hesitation_index=profile.hesitation_index,
        hint_dependency_index=profile.hint_dependency_index,
        consistency_index=profile.consistency_index,
        frustration_score=profile.frustration_score,
        error_pattern_type=profile.error_pattern_type,
        error_pattern_label=profile.error_pattern_label,
        learning_style=profile.learning_style,
        motivation_pattern=profile.motivation_pattern,
        avg_self_confidence=profile.avg_self_confidence,
        confidence_accuracy_gap=profile.confidence_accuracy_gap,
        total_sessions=profile.total_sessions,
        total_time_minutes=profile.total_time_minutes,
    )


@router.get("/learning-dna")
async def get_learning_dna(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate the flagship Learning DNA Report."""
    dna = CognitiveEngine.generate_learning_dna(db, current_user.id)
    db.commit()
    return dna


@router.post("/emotional-state", response_model=EmotionalStateResponse)
async def record_emotional_state(
    req: EmotionalStateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record emotional / confidence state for a session."""
    gap = 0.0
    if req.pre_session_confidence is not None:
        gap = round(req.pre_session_confidence - req.performance_score, 4)

    frustration = 1 if req.self_reported_mood == "frustrated" or gap > 0.3 else 0
    engagement = round(min(1.0, req.session_duration_seconds / 600) * 0.5 + req.performance_score * 0.5, 4)

    state = EmotionalState(
        user_id=current_user.id,
        session_type=req.session_type,
        pre_session_confidence=req.pre_session_confidence,
        post_session_confidence=req.post_session_confidence,
        self_reported_mood=req.self_reported_mood,
        performance_score=req.performance_score,
        confidence_performance_gap=gap,
        frustration_detected=frustration,
        engagement_score=engagement,
        session_duration_seconds=req.session_duration_seconds,
    )
    db.add(state)
    db.commit()
    db.refresh(state)

    return EmotionalStateResponse(
        id=state.id,
        session_type=state.session_type,
        pre_session_confidence=state.pre_session_confidence,
        post_session_confidence=state.post_session_confidence,
        self_reported_mood=state.self_reported_mood,
        performance_score=state.performance_score,
        confidence_performance_gap=state.confidence_performance_gap,
        frustration_detected=state.frustration_detected,
        engagement_score=state.engagement_score,
        created_at=str(state.created_at),
    )


@router.get("/emotional-history")
async def get_emotional_history(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get emotional state history for confidence growth tracking."""
    states = (
        db.query(EmotionalState)
        .filter(EmotionalState.user_id == current_user.id)
        .order_by(EmotionalState.created_at.desc())
        .limit(limit)
        .all()
    )
    return {
        "history": [
            {
                "id": s.id,
                "session_type": s.session_type,
                "pre_confidence": s.pre_session_confidence,
                "post_confidence": s.post_session_confidence,
                "mood": s.self_reported_mood,
                "performance": s.performance_score,
                "gap": s.confidence_performance_gap,
                "frustration": s.frustration_detected,
                "engagement": s.engagement_score,
                "created_at": str(s.created_at),
            }
            for s in states
        ],
        "total": len(states),
    }


@router.get("/confidence-growth")
async def get_confidence_growth(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Confidence growth graph data — tracks confidence vs performance over time."""
    states = (
        db.query(EmotionalState)
        .filter(EmotionalState.user_id == current_user.id)
        .order_by(EmotionalState.created_at.asc())
        .all()
    )
    data_points = []
    for s in states:
        data_points.append({
            "date": str(s.created_at),
            "confidence": s.pre_session_confidence or s.post_session_confidence or 0,
            "performance": s.performance_score,
            "gap": s.confidence_performance_gap,
        })

    # Compute trend
    if len(data_points) >= 2:
        first_half = data_points[:len(data_points)//2]
        second_half = data_points[len(data_points)//2:]
        avg_first = sum(d["confidence"] for d in first_half) / len(first_half) if first_half else 0
        avg_second = sum(d["confidence"] for d in second_half) / len(second_half) if second_half else 0
        trend = "growing" if avg_second > avg_first + 0.05 else "declining" if avg_second < avg_first - 0.05 else "stable"
    else:
        trend = "insufficient_data"

    return {
        "data_points": data_points,
        "trend": trend,
        "total_sessions": len(data_points),
    }
