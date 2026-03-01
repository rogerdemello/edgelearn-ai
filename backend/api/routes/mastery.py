"""
Mastery Tracker routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from core.database import get_db
from api.routes.auth import get_current_user
from models.user import User
from models.mastery import MasteryLog
from models.concept import Concept
from services.mastery_calculator import MasteryCalculator

router = APIRouter()


class MasteryUpdate(BaseModel):
    concept_id: int
    is_correct: bool
    hint_level_used: int = 0
    time_taken: Optional[int] = None
    confidence_rating: Optional[float] = None
    performance_data: Optional[dict] = None


class MasteryResponse(BaseModel):
    concept_id: int
    concept_title: str
    mastery_score: float
    confidence_score: float
    retention_decay_score: float
    attempts: int
    last_practiced: datetime
    next_review: Optional[datetime]


@router.post("/update")
async def update_mastery(
    update: MasteryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update mastery tracking for a concept using performance-based formulas"""
    # Verify concept exists
    concept = db.query(Concept).filter(Concept.id == update.concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    # Get or create mastery log
    mastery_log = db.query(MasteryLog).filter(
        MasteryLog.user_id == current_user.id,
        MasteryLog.concept_id == update.concept_id
    ).first()
    
    if not mastery_log:
        mastery_log = MasteryLog(
            user_id=current_user.id,
            concept_id=update.concept_id,
            mastery_score=0.0,
            confidence_score=0.0,
            retention_decay_score=1.0,
            attempts=0
        )
        db.add(mastery_log)
    
    # Calculate new mastery using the formula
    old_mastery = mastery_log.mastery_score
    mastery_result = MasteryCalculator.calculate_mastery_update(
        old_mastery=old_mastery,
        is_correct=update.is_correct,
        hint_level_used=update.hint_level_used,
        time_taken=update.time_taken or 0,
        confidence_rating=update.confidence_rating
    )
    
    # Calculate confidence score
    confidence = MasteryCalculator.calculate_confidence_score(
        is_correct=update.is_correct,
        hint_level_used=update.hint_level_used,
        time_taken=update.time_taken or 0,
        self_reported_confidence=update.confidence_rating
    )
    
    # Update mastery log
    mastery_log.mastery_score = mastery_result["new_mastery"]
    mastery_log.confidence_score = confidence
    mastery_log.retention_decay_score = 1.0  # Reset decay on new practice
    mastery_log.attempts += 1
    mastery_log.last_practiced = datetime.now()
    
    # Update metadata with detailed breakdown
    metadata = mastery_log.meta_data or {}
    metadata.update({
        "last_mastery_delta": mastery_result["mastery_delta"],
        "breakdown": mastery_result["breakdown"],
        "last_update": datetime.now().isoformat()
    })
    if update.performance_data:
        metadata.update(update.performance_data)
    mastery_log.meta_data = metadata
    
    db.commit()
    db.refresh(mastery_log)
    
    return {
        "message": "Mastery updated successfully",
        "mastery_log": {
            "concept_id": mastery_log.concept_id,
            "mastery_score": mastery_log.mastery_score,
            "confidence_score": mastery_log.confidence_score,
            "attempts": mastery_log.attempts,
            "mastery_delta": mastery_result["mastery_delta"],
            "breakdown": mastery_result["breakdown"]
        }
    }


@router.get("/all", response_model=List[MasteryResponse])
async def get_all_mastery(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all mastery logs for current user with decay calculation"""
    mastery_logs = db.query(MasteryLog).filter(
        MasteryLog.user_id == current_user.id
    ).all()
    
    result = []
    for log in mastery_logs:
        # Calculate retention decay
        decay_result = MasteryCalculator.calculate_retention_decay(
            last_practiced=log.last_practiced,
            current_mastery=log.mastery_score
        )
        
        # Update retention decay score in database
        log.retention_decay_score = decay_result["decay_factor"]
        
        concept = db.query(Concept).filter(Concept.id == log.concept_id).first()
        result.append(MasteryResponse(
            concept_id=log.concept_id,
            concept_title=concept.title if concept else "Unknown",
            mastery_score=log.mastery_score,
            confidence_score=log.confidence_score,
            retention_decay_score=log.retention_decay_score,
            attempts=log.attempts,
            last_practiced=log.last_practiced,
            next_review=log.next_review
        ))
    
    # Commit decay updates
    db.commit()
    
    return result


@router.get("/concept/{concept_id}")
async def get_concept_mastery(
    concept_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get mastery for a specific concept with decay calculation"""
    mastery_log = db.query(MasteryLog).filter(
        MasteryLog.user_id == current_user.id,
        MasteryLog.concept_id == concept_id
    ).first()
    
    if not mastery_log:
        raise HTTPException(status_code=404, detail="Mastery log not found")
    
    # Calculate retention decay
    decay_result = MasteryCalculator.calculate_retention_decay(
        last_practiced=mastery_log.last_practiced,
        current_mastery=mastery_log.mastery_score
    )
    
    # Update retention decay score
    mastery_log.retention_decay_score = decay_result["decay_factor"]
    db.commit()
    
    concept = db.query(Concept).filter(Concept.id == concept_id).first()
    
    return MasteryResponse(
        concept_id=mastery_log.concept_id,
        concept_title=concept.title if concept else "Unknown",
        mastery_score=mastery_log.mastery_score,
        confidence_score=mastery_log.confidence_score,
        retention_decay_score=mastery_log.retention_decay_score,
        attempts=mastery_log.attempts,
        last_practiced=mastery_log.last_practiced,
        next_review=mastery_log.next_review
    )


@router.get("/dashboard")
async def get_mastery_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get mastery dashboard data"""
    mastery_logs = db.query(MasteryLog).filter(
        MasteryLog.user_id == current_user.id
    ).all()
    
    if not mastery_logs:
        return {
            "total_concepts": 0,
            "avg_mastery": 0.0,
            "avg_confidence": 0.0,
            "strong_areas": [],
            "weak_areas": []
        }
    
    avg_mastery = sum(log.mastery_score for log in mastery_logs) / len(mastery_logs)
    avg_confidence = sum(log.confidence_score for log in mastery_logs) / len(mastery_logs)
    
    # Identify strong and weak areas
    strong_areas = [
        {"concept_id": log.concept_id, "mastery": log.mastery_score}
        for log in mastery_logs if log.mastery_score >= 0.8
    ]
    weak_areas = [
        {"concept_id": log.concept_id, "mastery": log.mastery_score}
        for log in mastery_logs if log.mastery_score < 0.5
    ]
    
    return {
        "total_concepts": len(mastery_logs),
        "avg_mastery": avg_mastery,
        "avg_confidence": avg_confidence,
        "strong_areas": strong_areas[:5],  # Top 5
        "weak_areas": weak_areas[:5]  # Top 5
    }
