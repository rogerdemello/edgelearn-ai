"""
Hint Engine routes - Stepwise scaffolded guidance
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from core.database import get_db
from services.ai_service import AIService
from services.mastery_calculator import MasteryCalculator
from api.routes.auth import get_current_user
from models.user import User
from models.concept import Assessment
from models.mastery import MasteryLog

router = APIRouter()


class HintRequest(BaseModel):
    assessment_id: int
    student_response: str
    attempts_on_question: int = 0
    current_hint_level: int = 0
    previous_hints: List[str] = []


class HintResponse(BaseModel):
    hint: str
    level: int
    is_final: bool
    attempts_used: int
    next_steps: Optional[str] = None
    hint_penalty: float  # Penalty that will be applied to mastery


@router.post("/get", response_model=HintResponse)
async def get_hint(
    request: HintRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get stepwise hint for a question with 5-level hierarchy
    Level 1: Very subtle nudge
    Level 2: Gentle hint pointing in the right direction
    Level 3: Moderate hint narrowing down the approach
    Level 4: Strong hint revealing most of the solution path
    Level 5: Explicit hint almost revealing the answer
    """
    # Get assessment
    assessment = db.query(Assessment).filter(Assessment.id == request.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Get concept name
    concept_name = assessment.concept.title if assessment.concept else "the concept"
    
    # Get current mastery for hint level recommendation
    mastery_log = db.query(MasteryLog).filter(
        MasteryLog.user_id == current_user.id,
        MasteryLog.concept_id == assessment.concept_id
    ).first()
    
    current_mastery = mastery_log.mastery_score if mastery_log else 0.0
    
    # Calculate appropriate hint level based on attempts and mastery
    # Each attempt increases hint level, but respect the 5-level max
    new_hint_level = min(5, request.current_hint_level + 1)
    
    # For very low mastery, allow jumping to higher levels faster
    if current_mastery < 0.3 and new_hint_level < 3:
        new_hint_level = min(5, new_hint_level + 1)
    
    # Generate hint using AI service
    hint_result = await AIService.generate_hint(
        question=assessment.question_text,
        student_response=request.student_response,
        concept=concept_name,
        hint_level=new_hint_level,
        previous_hints=request.previous_hints
    )
    
    # Calculate hint penalty (from MasteryCalculator)
    hint_penalty = new_hint_level * MasteryCalculator.HINT_PENALTY_PER_LEVEL
    
    # Determine if this is the final hint
    is_final = new_hint_level >= 5
    
    # Determine next steps
    next_steps = None
    if is_final:
        next_steps = "This is the final hint (Level 5). Try solving the problem now, or review the concept if you need more help."
    else:
        next_steps = f"If you need more help, you can request hint level {new_hint_level + 1}. Note: Each hint reduces your mastery gain."
    
    return HintResponse(
        hint=hint_result.get("hint", ""),
        level=new_hint_level,
        is_final=is_final,
        attempts_used=request.attempts_on_question + 1,
        next_steps=next_steps,
        hint_penalty=hint_penalty
    )


@router.get("/assessment/{assessment_id}/hints")
async def get_assessment_hints(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all available hints for an assessment (metadata only)"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Return hint structure if stored in assessment
    hints = assessment.hints if assessment.hints else {}
    
    return {
        "assessment_id": assessment_id,
        "total_hint_levels": 5,
        "hint_structure": hints,
        "description": "Hints are generated dynamically. Request hints using POST /api/hints/get"
    }
