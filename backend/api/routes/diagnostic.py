"""
Diagnostic Engine routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Optional, Any

from core.database import get_db
from services.ai_service import AIService
from services.mastery_calculator import MasteryCalculator
from api.routes.auth import get_current_user
from models.user import User
from models.concept import Assessment, Concept
from models.mastery import MasteryLog

router = APIRouter()


class DiagnosticRequest(BaseModel):
    question_id: int
    student_answer: str
    concept_id: Optional[int] = None


class DiagnosticResponse(BaseModel):
    misconception_type: Optional[str]
    mastery_delta: float
    recommended_hint_level: int
    confidence_score: float
    feedback: str
    is_correct: bool


@router.post("/assess", response_model=DiagnosticResponse)
async def assess_knowledge(
    request: DiagnosticRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Diagnose student's answer and identify misconceptions
    Returns diagnostic data with misconception type, mastery delta, recommended hint level, and confidence
    """
    # Get the question (using Assessment model for now, will use Question later)
    question = db.query(Assessment).filter(Assessment.id == request.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    concept_id = request.concept_id or question.concept_id
    concept = db.query(Concept).filter(Concept.id == concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    # Get current mastery for this concept
    mastery_log = db.query(MasteryLog).filter(
        MasteryLog.user_id == current_user.id,
        MasteryLog.concept_id == concept_id
    ).first()
    
    current_mastery = mastery_log.mastery_score if mastery_log else 0.0
    
    # Use AI to diagnose the answer
    diagnosis_result = await AIService.diagnose_student_answer(
        question=question.question_text,
        student_answer=request.student_answer,
        correct_answer=question.correct_answer,
        concept=concept.title
    )
    
    # Determine if answer is correct (from AI or basic comparison)
    is_correct = diagnosis_result.get("is_correct", False)
    
    # Calculate mastery delta
    mastery_result = MasteryCalculator.calculate_mastery_update(
        old_mastery=current_mastery,
        is_correct=is_correct,
        hint_level_used=0,  # No hints used yet at diagnostic phase
        time_taken=0
    )
    
    # Calculate confidence score
    confidence = diagnosis_result.get("confidence_score", 0.5)
    
    # Get recommended hint level based on mastery
    recommended_hint_level = MasteryCalculator.recommend_hint_level(
        mastery_score=current_mastery,
        attempts_on_question=0
    )
    
    # Extract misconception type
    misconception_type = diagnosis_result.get("misconception_type", None)
    
    return DiagnosticResponse(
        misconception_type=misconception_type,
        mastery_delta=mastery_result["mastery_delta"],
        recommended_hint_level=recommended_hint_level,
        confidence_score=confidence,
        feedback=diagnosis_result.get("feedback", ""),
        is_correct=is_correct
    )


class MultiConceptDiagnosticRequest(BaseModel):
    concept_ids: List[int]
    responses: List[Dict[str, Any]]  # [{"concept_id": int, "response_text": str}]


class MultiConceptDiagnosticResponse(BaseModel):
    diagnosis: str
    strong_areas: List[str]
    weak_areas: List[str]
    confidence: float
    recommended_path: List[Dict[str, Any]]
    mastery_scores: Dict[int, float]


@router.post("/assess-multi", response_model=MultiConceptDiagnosticResponse)
async def assess_multi_concept(
    request: MultiConceptDiagnosticRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Multi-concept diagnostic assessment
    Analyzes responses across multiple concepts to identify strengths and weaknesses
    """
    strong_areas = []
    weak_areas = []
    mastery_scores = {}
    all_feedback = []
    
    # Process each concept response
    for response_item in request.responses:
        concept_id = response_item.get("concept_id")
        response_text = response_item.get("response_text", "")
        
        concept = db.query(Concept).filter(Concept.id == concept_id).first()
        if not concept:
            continue
        
        # Get or create mastery log
        mastery_log = db.query(MasteryLog).filter(
            MasteryLog.user_id == current_user.id,
            MasteryLog.concept_id == concept_id
        ).first()
        
        if not mastery_log:
            mastery_log = MasteryLog(
                user_id=current_user.id,
                concept_id=concept_id,
                mastery_score=0.0,
                confidence_score=0.0,
                attempts=0
            )
            db.add(mastery_log)
        
        # Simple heuristic assessment (since we don't have correct answers here)
        # In production, you'd use AI or have assessment questions
        response_quality = len(response_text.split()) / 20.0  # Crude measure
        response_quality = min(response_quality, 1.0)
        
        # Update mastery
        old_mastery = mastery_log.mastery_score
        mastery_result = MasteryCalculator.calculate_mastery_update(
            old_mastery=old_mastery,
            is_correct=response_quality > 0.5,
            hint_level_used=0,
            time_taken=0
        )
        
        new_mastery = mastery_result["new_mastery"]
        mastery_log.mastery_score = new_mastery
        mastery_log.attempts += 1
        mastery_scores[concept_id] = new_mastery
        
        # Categorize as strong or weak
        if new_mastery >= 0.7:
            strong_areas.append(concept.title)
        elif new_mastery < 0.5:
            weak_areas.append(concept.title)
        
        all_feedback.append(f"{concept.title}: {'Good understanding' if new_mastery >= 0.7 else 'Needs improvement'}")
    
    db.commit()
    
    # Calculate overall confidence
    avg_confidence = sum(mastery_scores.values()) / len(mastery_scores) if mastery_scores else 0.0
    
    # Generate recommended path
    recommended_path = [
        {
            "concept_id": cid,
            "action": "review" if score < 0.7 else "practice",
            "priority": "high" if score < 0.5 else "medium" if score < 0.7 else "low"
        }
        for cid, score in mastery_scores.items()
    ]
    
    # Create overall diagnosis
    diagnosis = f"Assessed {len(mastery_scores)} concepts. "
    if strong_areas:
        diagnosis += f"Strong in: {', '.join(strong_areas[:3])}. "
    if weak_areas:
        diagnosis += f"Focus on: {', '.join(weak_areas[:3])}."
    
    return MultiConceptDiagnosticResponse(
        diagnosis=diagnosis,
        strong_areas=strong_areas,
        weak_areas=weak_areas,
        confidence=avg_confidence,
        recommended_path=recommended_path,
        mastery_scores=mastery_scores
    )


@router.get("/concepts")
async def get_concepts_for_diagnostic(
    subject: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get concepts available for diagnostic assessment"""
    query = db.query(Concept)
    
    if subject:
        query = query.filter(Concept.subject == subject)
    if difficulty:
        query = query.filter(Concept.difficulty_level == difficulty)
    
    concepts = query.all()
    
    return {
        "concepts": [
            {
                "id": c.id,
                "title": c.title,
                "description": c.description,
                "subject": c.subject,
                "difficulty_level": c.difficulty_level
            }
            for c in concepts
        ]
    }
