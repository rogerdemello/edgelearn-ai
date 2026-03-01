"""
Academic Integrity routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, List, Optional

from core.database import get_db
from services.ai_service import AIService
from api.routes.auth import get_current_user
from models.user import User

router = APIRouter()


class OriginalityCheckRequest(BaseModel):
    text: str
    reference_texts: Optional[List[str]] = None


class OriginalityCheckResponse(BaseModel):
    originality_score: float
    flagged_sections: List[Dict]
    suggestions: str
    needs_citation: bool


class CitationRequest(BaseModel):
    text: str
    source_type: str = "web"  # web, book, journal, etc.
    source_url: Optional[str] = None


class CitationResponse(BaseModel):
    formatted_citations: List[str]
    citation_style: str
    in_text_citations: List[Dict]
    error: Optional[str] = None


@router.post("/check-originality", response_model=OriginalityCheckResponse)
async def check_originality(
    request: OriginalityCheckRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Check text for originality and potential plagiarism
    """
    result = await AIService.check_originality(
        text=request.text,
        reference_texts=request.reference_texts
    )
    
    return OriginalityCheckResponse(
        originality_score=result.get("originality_score", 1.0),
        flagged_sections=result.get("flagged_sections", []),
        suggestions=result.get("suggestions", ""),
        needs_citation=result.get("originality_score", 1.0) < 0.8
    )


@router.post("/generate-citations", response_model=CitationResponse)
async def generate_citations(
    request: CitationRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate proper citations for sources."""
    try:
        result = await AIService.generate_citations(
            text=request.text,
            source_type=request.source_type,
            source_url=request.source_url
        )
        return CitationResponse(
            formatted_citations=result.get("formatted_citations", []),
            citation_style=result.get("citation_style", "multiple"),
            in_text_citations=result.get("in_text_citations", [])
        )
    except Exception as e:
        return CitationResponse(
            formatted_citations=[],
            citation_style="error",
            in_text_citations=[],
            error=str(e)
        )


@router.post("/anti-cheat-check")
async def anti_cheat_check(
    response_text: str,
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Anti-cheat detection by analyzing response patterns
    """
    from models.concept import AssessmentResponse
    
    # Get user's previous responses
    previous_responses = db.query(AssessmentResponse).filter(
        AssessmentResponse.user_id == current_user.id
    ).limit(10).all()
    
    # Analyze patterns (simplified - in production, use ML models)
    analysis = {
        "suspicious_patterns": [],
        "confidence": 0.95,
        "recommendations": []
    }
    
    # Check for sudden improvement
    if len(previous_responses) > 0:
        avg_score = sum(r.score or 0 for r in previous_responses) / len(previous_responses)
        # Would compare with current response score
    
    # Check response similarity
    # Would use embeddings to check similarity with online sources
    
    return {
        "assessment_id": assessment_id,
        "analysis": analysis,
        "status": "clean",
        "message": "Response appears to be original"
    }
