"""
Concept and learning content models
"""

from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base


class Concept(Base):
    """Learning concept/topic model"""
    __tablename__ = "concepts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text)
    subject = Column(String, index=True)
    difficulty_level = Column(String)  # beginner, intermediate, advanced
    meta_data = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    assessments = relationship("Assessment", back_populates="concept")
    mastery_logs = relationship("MasteryLog", back_populates="concept")


class Assessment(Base):
    """Assessment/question model"""
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)
    question_type = Column(String)  # multiple_choice, essay, coding, presentation
    question_text = Column(Text, nullable=False)
    correct_answer = Column(Text)
    rubric = Column(JSON)  # Rubric criteria for evaluation
    hints = Column(JSON)  # Stepwise hints
    meta_data = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    concept = relationship("Concept", back_populates="assessments")
    responses = relationship("AssessmentResponse", back_populates="assessment")


class AssessmentResponse(Base):
    """Student response to an assessment"""
    __tablename__ = "assessment_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    response_text = Column(Text)
    response_data = Column(JSON)  # For structured responses
    score = Column(Float)
    feedback = Column(Text)
    rubric_scores = Column(JSON)  # Detailed rubric breakdown
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    assessment = relationship("Assessment", back_populates="responses")
