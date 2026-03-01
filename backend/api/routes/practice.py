"""
Practice Session API routes - Questions and Attempts
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from core.database import get_db
from api.routes.auth import get_current_user
from models.user import User
from models.question import Question, Attempt
from models.concept import Concept
from models.mastery import MasteryLog
from services.mastery_calculator import MasteryCalculator
from services.ai_service import AIService

router = APIRouter()


class QuestionRequest(BaseModel):
    concept_id: Optional[int] = None
    difficulty_level: Optional[str] = None
    limit: int = 10


class QuestionResponse(BaseModel):
    id: int
    concept_id: int
    concept_title: str
    question_text: str
    question_type: str
    difficulty_level: str


class AttemptRequest(BaseModel):
    question_id: int
    student_answer: str
    hint_level_used: int = 0
    hints_requested: List[str] = []
    confidence_rating: Optional[float] = None
    time_taken: Optional[int] = None


class AttemptResponse(BaseModel):
    id: int
    question_id: int
    score: float
    is_correct: str
    feedback: str
    mastery_delta: float
    confidence_score: float


@router.get("/questions", response_model=List[QuestionResponse])
async def get_questions(
    concept_id: Optional[int] = None,
    difficulty_level: Optional[str] = None,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get questions for practice session"""
    query = db.query(Question)
    
    if concept_id:
        query = query.filter(Question.concept_id == concept_id)
    
    if difficulty_level:
        query = query.filter(Question.difficulty_level == difficulty_level)
    
    questions = query.limit(limit).all()
    
    result = []
    for q in questions:
        concept = db.query(Concept).filter(Concept.id == q.concept_id).first()
        result.append(QuestionResponse(
            id=q.id,
            concept_id=q.concept_id,
            concept_title=concept.title if concept else "Unknown",
            question_text=q.question_text,
            question_type=q.question_type,
            difficulty_level=q.difficulty_level
        ))
    
    return result


@router.get("/questions/{question_id}")
async def get_question(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific question"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    concept = db.query(Concept).filter(Concept.id == question.concept_id).first()
    
    return QuestionResponse(
        id=question.id,
        concept_id=question.concept_id,
        concept_title=concept.title if concept else "Unknown",
        question_text=question.question_text,
        question_type=question.question_type,
        difficulty_level=question.difficulty_level
    )


@router.post("/attempts", response_model=AttemptResponse)
async def submit_attempt(
    request: AttemptRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit an attempt for a question and get evaluated"""
    # Get question
    question = db.query(Question).filter(Question.id == request.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Get concept
    concept = db.query(Concept).filter(Concept.id == question.concept_id).first()
    
    # Diagnose the answer
    diagnosis = await AIService.diagnose_student_answer(
        question=question.question_text,
        student_answer=request.student_answer,
        correct_answer=question.correct_answer,
        concept=concept.title if concept else "Unknown"
    )
    
    is_correct = diagnosis.get("is_correct", False)
    
    # Calculate score (0-1)
    if is_correct:
        score = 1.0 - (request.hint_level_used * 0.1)  # Reduce score for hints used
        score = max(0.5, score)  # Minimum 50% if correct
    else:
        score = 0.0
    
    # Calculate confidence
    confidence = MasteryCalculator.calculate_confidence_score(
        is_correct=is_correct,
        hint_level_used=request.hint_level_used,
        time_taken=request.time_taken or 0,
        self_reported_confidence=request.confidence_rating
    )
    
    # Get current mastery
    mastery_log = db.query(MasteryLog).filter(
        MasteryLog.user_id == current_user.id,
        MasteryLog.concept_id == question.concept_id
    ).first()
    
    current_mastery = mastery_log.mastery_score if mastery_log else 0.0
    
    # Calculate mastery update
    mastery_result = MasteryCalculator.calculate_mastery_update(
        old_mastery=current_mastery,
        is_correct=is_correct,
        hint_level_used=request.hint_level_used,
        time_taken=request.time_taken or 0,
        confidence_rating=request.confidence_rating
    )
    
    # Create attempt record
    attempt = Attempt(
        user_id=current_user.id,
        question_id=request.question_id,
        student_answer=request.student_answer,
        hint_level_used=request.hint_level_used,
        hints_requested=request.hints_requested,
        confidence_rating=request.confidence_rating,
        time_taken=request.time_taken,
        score=score,
        is_correct="correct" if is_correct else "incorrect",
        feedback=diagnosis.get("feedback", ""),
        diagnostic_data={
            "misconception_type": diagnosis.get("misconception_type"),
            "mastery_delta": mastery_result["mastery_delta"],
            "breakdown": mastery_result["breakdown"]
        }
    )
    db.add(attempt)
    
    # Update mastery
    if not mastery_log:
        mastery_log = MasteryLog(
            user_id=current_user.id,
            concept_id=question.concept_id,
            mastery_score=mastery_result["new_mastery"],
            confidence_score=confidence,
            retention_decay_score=1.0,
            attempts=1
        )
        db.add(mastery_log)
    else:
        mastery_log.mastery_score = mastery_result["new_mastery"]
        mastery_log.confidence_score = confidence
        mastery_log.retention_decay_score = 1.0
        mastery_log.attempts += 1
        mastery_log.last_practiced = datetime.now()
    
    db.commit()
    db.refresh(attempt)
    
    return AttemptResponse(
        id=attempt.id,
        question_id=attempt.question_id,
        score=attempt.score,
        is_correct=attempt.is_correct,
        feedback=attempt.feedback,
        mastery_delta=mastery_result["mastery_delta"],
        confidence_score=confidence
    )


@router.get("/attempts/history")
async def get_attempt_history(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's attempt history"""
    attempts = db.query(Attempt).filter(
        Attempt.user_id == current_user.id
    ).order_by(Attempt.created_at.desc()).limit(limit).all()
    
    result = []
    for attempt in attempts:
        question = db.query(Question).filter(Question.id == attempt.question_id).first()
        result.append({
            "id": attempt.id,
            "question_id": attempt.question_id,
            "question_text": question.question_text if question else "Unknown",
            "student_answer": attempt.student_answer,
            "score": attempt.score,
            "is_correct": attempt.is_correct,
            "hint_level_used": attempt.hint_level_used,
            "time_taken": attempt.time_taken,
            "feedback": attempt.feedback,
            "created_at": attempt.created_at
        })
    
    return {"attempts": result, "total": len(result)}


@router.get("/attempts/stats")
async def get_attempt_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get statistics about user's attempts"""
    attempts = db.query(Attempt).filter(Attempt.user_id == current_user.id).all()
    
    if not attempts:
        return {
            "total_attempts": 0,
            "correct_attempts": 0,
            "avg_score": 0.0,
            "avg_hints_used": 0.0,
            "avg_time_taken": 0.0
        }
    
    total = len(attempts)
    correct = len([a for a in attempts if a.is_correct == "correct"])
    avg_score = sum(a.score for a in attempts) / total
    avg_hints = sum(a.hint_level_used for a in attempts) / total
    
    times = [a.time_taken for a in attempts if a.time_taken]
    avg_time = sum(times) / len(times) if times else 0
    
    return {
        "total_attempts": total,
        "correct_attempts": correct,
        "accuracy_rate": correct / total,
        "avg_score": avg_score,
        "avg_hints_used": avg_hints,
        "avg_time_taken": avg_time
    }
