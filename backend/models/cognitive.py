"""
Cognitive State Modeling - Beyond Correct/Wrong
Tracks how the student thinks, not just whether they're correct.
"""

from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base


class CognitiveProfile(Base):
    """Cognitive Profile Vector per student - the 'Learning DNA'"""
    __tablename__ = "cognitive_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)

    # Core cognitive dimensions (0.0–1.0)
    abstraction_skill = Column(Float, default=0.5)
    procedural_strength = Column(Float, default=0.5)
    retention_rate = Column(Float, default=0.5)
    transfer_ability = Column(Float, default=0.5)       # Can apply knowledge to new domains
    metacognition_score = Column(Float, default=0.5)     # Self-awareness of knowledge gaps

    # Behavioural signals
    overconfidence_index = Column(Float, default=0.0)    # Mismatch: high confidence + wrong answers
    hesitation_index = Column(Float, default=0.0)        # Pauses, slow starts, many edits
    hint_dependency_index = Column(Float, default=0.0)   # Reliance on hints vs self-solve
    consistency_index = Column(Float, default=0.5)       # Variance in performance

    # Error pattern clustering
    error_pattern_type = Column(Integer, default=0)      # Cluster ID for error pattern
    error_pattern_label = Column(String, default="unknown")
    dominant_misconception = Column(String, nullable=True)

    # Learning style indicators
    learning_style = Column(String, default="balanced")  # visual/verbal/kinesthetic/balanced
    motivation_pattern = Column(String, default="steady") # sprint/steady/declining/growing
    peak_performance_hour = Column(Integer, default=10)   # 0-23

    # Emotional / confidence
    avg_self_confidence = Column(Float, default=0.5)
    confidence_accuracy_gap = Column(Float, default=0.0)  # Positive = overconfident
    frustration_score = Column(Float, default=0.0)        # Based on repeated failures

    # Aggregated stats
    total_sessions = Column(Integer, default=0)
    total_time_minutes = Column(Integer, default=0)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Full profile snapshot for historical tracking
    profile_history = Column(JSON, default=[])  # List of timestamped snapshots


class EmotionalState(Base):
    """Per-session emotional/confidence tracking"""
    __tablename__ = "emotional_states"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    session_type = Column(String, default="practice")  # practice/diagnostic/exam_sim

    # Self-reported
    pre_session_confidence = Column(Float, nullable=True)  # 0-1
    post_session_confidence = Column(Float, nullable=True)
    self_reported_mood = Column(String, nullable=True)     # calm/anxious/focused/frustrated

    # Computed
    performance_score = Column(Float, default=0.0)
    confidence_performance_gap = Column(Float, default=0.0)
    frustration_detected = Column(Integer, default=0)      # 1 if pattern detected
    engagement_score = Column(Float, default=0.5)

    # Timing
    session_duration_seconds = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DebateSession(Base):
    """AI Debate Tutor sessions"""
    __tablename__ = "debate_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    topic = Column(String, nullable=False)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=True)

    # Debate state
    student_position = Column(Text, nullable=True)
    turns = Column(JSON, default=[])  # List of {role, content, timestamp}
    challenger_arguments = Column(JSON, default=[])
    supporter_arguments = Column(JSON, default=[])
    resolution = Column(Text, nullable=True)

    # Evaluation
    critical_thinking_score = Column(Float, default=0.0)
    argument_quality_score = Column(Float, default=0.0)
    evidence_usage_score = Column(Float, default=0.0)
    metacognition_score = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)

    status = Column(String, default="active")  # active/completed/abandoned
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)


class ExamSimulation(Base):
    """Simulated Exam Environment"""
    __tablename__ = "exam_simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, default="Practice Exam")

    # Configuration
    concept_ids = Column(JSON, default=[])
    question_ids = Column(JSON, default=[])
    time_limit_minutes = Column(Integer, default=60)
    total_questions = Column(Integer, default=10)
    hints_allowed = Column(Integer, default=0)  # 0 = no hints in exam mode

    # Progress
    answers = Column(JSON, default={})  # {question_id: {answer, time_taken, flagged}}
    current_question_index = Column(Integer, default=0)
    time_spent_seconds = Column(Integer, default=0)

    # Results
    score = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    questions_attempted = Column(Integer, default=0)
    questions_correct = Column(Integer, default=0)
    stress_indicators = Column(JSON, default={})  # {rapid_switching, time_pressure, etc.}
    breakdown = Column(JSON, default={})  # Per-concept breakdown

    status = Column(String, default="not_started")  # not_started/in_progress/completed/abandoned
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
