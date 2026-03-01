"""
Concept Graph Intelligence - Knowledge Graph with dependency scoring
"""

from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from core.database import Base


class ConceptEdge(Base):
    """Directed edge: prerequisite → dependent concept"""
    __tablename__ = "concept_edges"

    id = Column(Integer, primary_key=True, index=True)
    source_concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False, index=True)
    target_concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False, index=True)
    relationship_type = Column(String, default="prerequisite")  # prerequisite/related/extends
    weight = Column(Float, default=1.0)  # Strength of dependency 0-1
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ConceptCluster(Base):
    """Subject-level grouping for analytics"""
    __tablename__ = "concept_clusters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    concept_ids = Column(JSON, default=[])
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
