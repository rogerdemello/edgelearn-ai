"""
Knowledge Graph routes — concept dependencies, gap propagation, weak-root analysis
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from core.database import get_db
from api.routes.auth import get_current_user
from models.user import User
from models.knowledge_graph import ConceptEdge
from services.concept_graph import ConceptGraphEngine

router = APIRouter()


class AddEdgeRequest(BaseModel):
    source_concept_id: int
    target_concept_id: int
    relationship_type: str = "prerequisite"
    weight: float = 1.0


@router.get("/graph")
async def get_knowledge_graph(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Full knowledge graph with user mastery overlay."""
    return ConceptGraphEngine.get_full_graph(db, user_id=current_user.id)


@router.get("/dependency-scores")
async def get_dependency_scores(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Which concepts are most foundational (most dependents)."""
    scores = ConceptGraphEngine.dependency_scores(db)
    return {"scores": scores}


@router.get("/gap-propagation")
async def get_gap_propagation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Detect at-risk concepts due to weak prerequisites."""
    gaps = ConceptGraphEngine.detect_gap_propagation(db, current_user.id)
    return {"gaps": gaps, "total_at_risk": len(gaps)}


@router.get("/weak-root/{concept_id}")
async def get_weak_root(
    concept_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trace back to weakest prerequisite root for a concept."""
    analysis = ConceptGraphEngine.weak_root_analysis(db, current_user.id, concept_id)
    return analysis


@router.post("/edges")
async def add_concept_edge(
    req: AddEdgeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a dependency edge between concepts."""
    if req.source_concept_id == req.target_concept_id:
        raise HTTPException(400, "Cannot create self-referencing edge")
    existing = db.query(ConceptEdge).filter(
        ConceptEdge.source_concept_id == req.source_concept_id,
        ConceptEdge.target_concept_id == req.target_concept_id,
    ).first()
    if existing:
        raise HTTPException(409, "Edge already exists")
    edge = ConceptEdge(
        source_concept_id=req.source_concept_id,
        target_concept_id=req.target_concept_id,
        relationship_type=req.relationship_type,
        weight=req.weight,
    )
    db.add(edge)
    db.commit()
    return {"message": "Edge created", "id": edge.id}


@router.get("/edges")
async def list_edges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all concept edges."""
    edges = db.query(ConceptEdge).all()
    return {
        "edges": [
            {
                "id": e.id,
                "source": e.source_concept_id,
                "target": e.target_concept_id,
                "type": e.relationship_type,
                "weight": e.weight,
            }
            for e in edges
        ]
    }
