"""
Exam Prediction & Simulation routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from core.database import get_db
from api.routes.auth import get_current_user
from models.user import User
from models.concept import Concept
from models.question import Question, Attempt
from models.cognitive import ExamSimulation
from services.exam_predictor import ExamPredictor
from services.mastery_calculator import MasteryCalculator

router = APIRouter()


# ── Pydantic models ─────────────────────────────────────────

class PredictRequest(BaseModel):
    exam_date: Optional[str] = None
    concept_ids: Optional[List[int]] = None

class CreateSimRequest(BaseModel):
    concept_ids: Optional[List[int]] = None
    time_limit_minutes: int = 60
    num_questions: int = 10
    title: str = "Practice Exam"

class SubmitSimAnswerRequest(BaseModel):
    question_id: int
    student_answer: str
    time_taken: int = 0

class FinishSimRequest(BaseModel):
    time_spent_seconds: int = 0


# ── Prediction endpoints ────────────────────────────────────

@router.post("/predict")
async def predict_exam_score(
    req: PredictRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Predict exam score range with mastery trend analysis."""
    return ExamPredictor.predict_exam_score(
        db, current_user.id, req.exam_date, req.concept_ids
    )


# ── Simulation endpoints ────────────────────────────────────

@router.post("/simulations")
async def create_simulation(
    req: CreateSimRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new exam simulation — timed, no hints."""
    query = db.query(Question)
    if req.concept_ids:
        query = query.filter(Question.concept_id.in_(req.concept_ids))
    questions = query.order_by(func.random()).limit(req.num_questions).all()

    if not questions:
        raise HTTPException(404, "No questions found for the selected concepts")

    sim = ExamSimulation(
        user_id=current_user.id,
        title=req.title,
        concept_ids=req.concept_ids or [],
        question_ids=[q.id for q in questions],
        time_limit_minutes=req.time_limit_minutes,
        total_questions=len(questions),
        hints_allowed=0,
        status="in_progress",
        started_at=datetime.now(timezone.utc),
    )
    db.add(sim)
    db.commit()
    db.refresh(sim)

    return {
        "simulation_id": sim.id,
        "title": sim.title,
        "total_questions": sim.total_questions,
        "time_limit_minutes": sim.time_limit_minutes,
        "questions": [
            {
                "id": q.id,
                "concept_id": q.concept_id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "difficulty_level": q.difficulty_level,
            }
            for q in questions
        ],
    }


@router.post("/simulations/{sim_id}/answer")
async def submit_simulation_answer(
    sim_id: int,
    req: SubmitSimAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit an answer during an exam simulation."""
    sim = db.query(ExamSimulation).filter(
        ExamSimulation.id == sim_id,
        ExamSimulation.user_id == current_user.id,
    ).first()
    if not sim:
        raise HTTPException(404, "Simulation not found")
    if sim.status != "in_progress":
        raise HTTPException(400, "Simulation is not in progress")

    question = db.query(Question).filter(Question.id == req.question_id).first()
    if not question:
        raise HTTPException(404, "Question not found")

    # Simple scoring
    correct_answer = (question.correct_answer or "").strip().lower()
    student_answer = req.student_answer.strip().lower()
    is_correct = correct_answer == student_answer or correct_answer in student_answer
    score = 1.0 if is_correct else 0.0

    # Partial credit for containing key terms
    if not is_correct and len(student_answer) > 10:
        key_terms = correct_answer.split()
        matches = sum(1 for t in key_terms if t in student_answer)
        if key_terms:
            score = round(min(0.8, matches / len(key_terms)), 2)
            is_correct = score >= 0.5

    # Update simulation answers
    answers = sim.answers or {}
    answers[str(req.question_id)] = {
        "answer": req.student_answer,
        "time_taken": req.time_taken,
        "score": score,
        "is_correct": is_correct,
    }
    sim.answers = answers
    sim.questions_attempted = len(answers)
    sim.current_question_index = len(answers)
    db.commit()

    return {
        "question_id": req.question_id,
        "score": score,
        "is_correct": is_correct,
        "questions_remaining": sim.total_questions - len(answers),
    }


@router.post("/simulations/{sim_id}/finish")
async def finish_simulation(
    sim_id: int,
    req: FinishSimRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Complete an exam simulation and get breakdown."""
    sim = db.query(ExamSimulation).filter(
        ExamSimulation.id == sim_id,
        ExamSimulation.user_id == current_user.id,
    ).first()
    if not sim:
        raise HTTPException(404, "Simulation not found")

    answers = sim.answers or {}
    total_score = sum(a.get("score", 0) for a in answers.values())
    total_correct = sum(1 for a in answers.values() if a.get("is_correct"))
    accuracy = total_correct / max(len(answers), 1)

    # Per-concept breakdown
    questions = {q.id: q for q in db.query(Question).filter(Question.id.in_([int(k) for k in answers.keys()])).all()}
    concept_scores: Dict[int, List[float]] = {}
    for qid_str, ans in answers.items():
        q = questions.get(int(qid_str))
        if q:
            concept_scores.setdefault(q.concept_id, []).append(ans.get("score", 0))

    concepts = {c.id: c.title for c in db.query(Concept).all()}
    breakdown = {}
    for cid, scores in concept_scores.items():
        breakdown[concepts.get(cid, str(cid))] = {
            "questions": len(scores),
            "avg_score": round(sum(scores) / len(scores), 3),
            "correct": sum(1 for s in scores if s >= 0.5),
        }

    # Stress indicators
    times = [a.get("time_taken", 0) for a in answers.values() if a.get("time_taken")]
    stress = {}
    if times:
        avg_time = sum(times) / len(times)
        fast_switches = sum(1 for t in times if t < avg_time * 0.3)
        stress = {
            "avg_time_per_question": round(avg_time, 1),
            "rapid_switches": fast_switches,
            "time_pressure": req.time_spent_seconds > sim.time_limit_minutes * 60 * 0.9,
            "questions_skipped": sim.total_questions - len(answers),
        }

    # Update simulation
    sim.score = round(total_score / max(sim.total_questions, 1) * 100, 1)
    sim.accuracy = round(accuracy, 3)
    sim.questions_correct = total_correct
    sim.time_spent_seconds = req.time_spent_seconds
    sim.stress_indicators = stress
    sim.breakdown = breakdown
    sim.status = "completed"
    sim.completed_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "simulation_id": sim.id,
        "title": sim.title,
        "score": sim.score,
        "accuracy": sim.accuracy,
        "questions_attempted": sim.questions_attempted,
        "questions_correct": sim.questions_correct,
        "total_questions": sim.total_questions,
        "time_spent_seconds": sim.time_spent_seconds,
        "time_limit_minutes": sim.time_limit_minutes,
        "stress_indicators": stress,
        "breakdown": breakdown,
        "status": "completed",
    }


@router.get("/simulations")
async def list_simulations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all exam simulations for the user."""
    sims = (
        db.query(ExamSimulation)
        .filter(ExamSimulation.user_id == current_user.id)
        .order_by(ExamSimulation.created_at.desc())
        .all()
    )
    return {
        "simulations": [
            {
                "id": s.id,
                "title": s.title,
                "status": s.status,
                "score": s.score,
                "accuracy": s.accuracy,
                "total_questions": s.total_questions,
                "questions_attempted": s.questions_attempted,
                "time_limit_minutes": s.time_limit_minutes,
                "created_at": str(s.created_at),
                "completed_at": str(s.completed_at) if s.completed_at else None,
            }
            for s in sims
        ]
    }


@router.get("/simulations/{sim_id}")
async def get_simulation(
    sim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get details of a specific simulation."""
    sim = db.query(ExamSimulation).filter(
        ExamSimulation.id == sim_id,
        ExamSimulation.user_id == current_user.id,
    ).first()
    if not sim:
        raise HTTPException(404, "Simulation not found")
    return {
        "id": sim.id,
        "title": sim.title,
        "status": sim.status,
        "score": sim.score,
        "accuracy": sim.accuracy,
        "total_questions": sim.total_questions,
        "questions_attempted": sim.questions_attempted,
        "questions_correct": sim.questions_correct,
        "time_limit_minutes": sim.time_limit_minutes,
        "time_spent_seconds": sim.time_spent_seconds,
        "breakdown": sim.breakdown,
        "stress_indicators": sim.stress_indicators,
        "created_at": str(sim.created_at),
        "completed_at": str(sim.completed_at) if sim.completed_at else None,
    }
