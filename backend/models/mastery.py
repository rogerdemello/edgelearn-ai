"""
Mastery tracking models
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base


class MasteryLog(Base):
    """Mastery tracking log"""
    __tablename__ = "mastery_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)
    mastery_score = Column(Float, default=0.0)  # 0.0 to 1.0
    confidence_score = Column(Float, default=0.0)  # 0.0 to 1.0
    retention_decay_score = Column(Float, default=1.0)  # Decay factor based on time since last review
    attempts = Column(Integer, default=0)
    last_practiced = Column(DateTime(timezone=True), server_default=func.now())
    next_review = Column(DateTime(timezone=True))  # For spaced repetition
    meta_data = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    concept = relationship("Concept", back_populates="mastery_logs")


class StudySession(Base):
    """Study session tracking"""
    __tablename__ = "study_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concept_ids = Column(JSON)  # List of concept IDs studied
    duration_minutes = Column(Integer)
    activities_completed = Column(JSON)
    session_data = Column(JSON, default={})
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True))
