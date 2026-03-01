"""
Question and Attempt models for practice sessions
"""

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base


class Question(Base):
    """Question model for practice sessions"""
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, default="open_ended")  # open_ended, multiple_choice, etc.
    correct_answer = Column(Text, nullable=False)
    rubric_json = Column(JSON)  # Detailed rubric for evaluation
    difficulty_level = Column(String, default="medium")  # easy, medium, hard
    meta_data = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    concept = relationship("Concept", backref="questions")
    attempts = relationship("Attempt", back_populates="question")


class Attempt(Base):
    """Student attempt model for tracking practice performance"""
    __tablename__ = "attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    student_answer = Column(Text, nullable=False)
    hint_level_used = Column(Integer, default=0)  # 0-5, 0 means no hints
    hints_requested = Column(JSON, default=[])  # List of hints requested
    confidence_rating = Column(Float)  # Student's self-reported confidence (0-1)
    time_taken = Column(Integer)  # Time in seconds
    score = Column(Float)  # 0.0 to 1.0
    is_correct = Column(String)  # "correct", "partial", "incorrect"
    feedback = Column(Text)  # AI-generated feedback
    diagnostic_data = Column(JSON)  # Misconception type, mastery delta, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", backref="attempts")
    question = relationship("Question", back_populates="attempts")
