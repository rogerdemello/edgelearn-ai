"""
Rubric Feedback Engine routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, List, Optional

from core.database import get_db
from services.ai_service import AIService
from api.routes.auth import get_current_user
from models.user import User
from models.concept import Assessment, AssessmentResponse

router = APIRouter()


class RubricEvaluationRequest(BaseModel):
    assessment_id: int
    response_text: str
    response_data: Optional[Dict] = None


class RubricEvaluationResponse(BaseModel):
    clarity_score: float  # 0-100
    structure_score: float  # 0-100
    reasoning_score: float  # 0-100
    overall_score: float  # 0-100
    feedback: str
    suggestions: Optional[List[str]] = None


@router.post("/evaluate", response_model=RubricEvaluationResponse)
async def evaluate_with_rubric(
    request: RubricEvaluationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluate student essay response against rubric
    Returns clarity_score, structure_score, reasoning_score, and feedback
    """
    # Get assessment
    assessment = db.query(Assessment).filter(Assessment.id == request.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Get rubric
    rubric = assessment.rubric if assessment.rubric else {}
    
    if not rubric:
        # Use default essay rubric
        rubric = {
            "clarity": {"description": "Clarity of expression and communication", "weight": 1.0},
            "structure": {"description": "Organization and logical flow", "weight": 1.0},
            "reasoning": {"description": "Quality of arguments and reasoning", "weight": 1.0}
        }
    
    # Evaluate using AI service with specific rubric criteria
    evaluation_result = await AIService.evaluate_essay(
        essay_text=request.response_text,
        rubric=rubric,
        question_type=assessment.question_type
    )
    
    # Extract scores
    clarity_score = evaluation_result.get("clarity_score", 75.0)
    structure_score = evaluation_result.get("structure_score", 75.0)
    reasoning_score = evaluation_result.get("reasoning_score", 75.0)
    overall_score = (clarity_score + structure_score + reasoning_score) / 3.0
    
    # Save response
    response = AssessmentResponse(
        user_id=current_user.id,
        assessment_id=request.assessment_id,
        response_text=request.response_text,
        response_data=request.response_data,
        score=overall_score,
        feedback=evaluation_result.get("feedback", ""),
        rubric_scores={
            "clarity_score": clarity_score,
            "structure_score": structure_score,
            "reasoning_score": reasoning_score
        }
    )
    db.add(response)
    db.commit()
    db.refresh(response)
    
    return RubricEvaluationResponse(
        clarity_score=clarity_score,
        structure_score=structure_score,
        reasoning_score=reasoning_score,
        overall_score=overall_score,
        feedback=evaluation_result.get("feedback", ""),
        suggestions=evaluation_result.get("suggestions", [])
    )


@router.get("/assessment/{assessment_id}/rubric")
async def get_rubric(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get rubric for an assessment"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    return {
        "assessment_id": assessment_id,
        "question_type": assessment.question_type,
        "rubric": assessment.rubric or {},
        "description": "Rubric criteria for evaluation"
    }


@router.get("/responses/{response_id}")
async def get_response_feedback(
    response_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get feedback for a specific response"""
    response = db.query(AssessmentResponse).filter(
        AssessmentResponse.id == response_id,
        AssessmentResponse.user_id == current_user.id
    ).first()
    
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    
    return {
        "response_id": response.id,
        "assessment_id": response.assessment_id,
        "score": response.score,
        "feedback": response.feedback,
        "rubric_scores": response.rubric_scores,
        "submitted_at": response.submitted_at
    }
