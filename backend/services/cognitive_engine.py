"""
Cognitive State Engine — computes and updates student cognitive profiles.
Implements overconfidence detection, hesitation analysis, hint dependency,
error pattern clustering, and the Learning DNA report.
"""

import math
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

from sqlalchemy.orm import Session
from models.cognitive import CognitiveProfile, EmotionalState
from models.mastery import MasteryLog
from models.question import Attempt


class CognitiveEngine:
    """All static — no instance state needed."""

    # ── Overconfidence ──────────────────────────────────────
    @staticmethod
    def compute_overconfidence(attempts: List[Attempt]) -> float:
        """
        Positive value ⇒ overconfident (high self-rating, poor accuracy).
        Negative value ⇒ underconfident.
        """
        if not attempts:
            return 0.0
        rated = [a for a in attempts if a.confidence_rating is not None]
        if not rated:
            return 0.0
        avg_confidence = sum(a.confidence_rating for a in rated) / len(rated)
        accuracy = sum(1 for a in rated if a.is_correct == "correct") / len(rated)
        return round(avg_confidence - accuracy, 4)

    # ── Hesitation ──────────────────────────────────────────
    @staticmethod
    def compute_hesitation(attempts: List[Attempt], expected_time: float = 120) -> float:
        """
        0 = fast / decisive.  1 = extremely hesitant.
        Uses ratio of actual time to expected time, capped at 1.
        """
        timed = [a for a in attempts if a.time_taken and a.time_taken > 0]
        if not timed:
            return 0.0
        ratios = [min(a.time_taken / expected_time, 2.0) for a in timed]
        avg_ratio = sum(ratios) / len(ratios)
        return round(min(avg_ratio / 2.0, 1.0), 4)

    # ── Hint dependency ─────────────────────────────────────
    @staticmethod
    def compute_hint_dependency(attempts: List[Attempt]) -> float:
        """
        Fraction of attempts that used hints, weighted by level.
        0 = never uses hints.  1 = always uses max hints.
        """
        if not attempts:
            return 0.0
        total_hint_weight = sum(a.hint_level_used / 5.0 for a in attempts)
        return round(total_hint_weight / len(attempts), 4)

    # ── Transfer ability ────────────────────────────────────
    @staticmethod
    def compute_transfer_ability(mastery_logs: List[MasteryLog]) -> float:
        """
        How uniformly a student performs across different subjects.
        High uniformity ⇒ good transfer.  We use 1 – CV(mastery_scores).
        """
        scores = [m.mastery_score for m in mastery_logs if m.mastery_score > 0]
        if len(scores) < 2:
            return 0.5
        mean = sum(scores) / len(scores)
        if mean == 0:
            return 0.0
        variance = sum((s - mean) ** 2 for s in scores) / len(scores)
        cv = math.sqrt(variance) / mean
        return round(max(0.0, min(1.0, 1.0 - cv)), 4)

    # ── Consistency ─────────────────────────────────────────
    @staticmethod
    def compute_consistency(attempts: List[Attempt]) -> float:
        """1 = perfectly consistent, 0 = wildly varying scores."""
        scores = [a.score for a in attempts if a.score is not None]
        if len(scores) < 2:
            return 0.5
        mean = sum(scores) / len(scores)
        variance = sum((s - mean) ** 2 for s in scores) / len(scores)
        std = math.sqrt(variance)
        return round(max(0.0, 1.0 - std), 4)

    # ── Error pattern clustering (simple rule-based) ───────
    @staticmethod
    def classify_error_pattern(attempts: List[Attempt]) -> Dict[str, Any]:
        """
        Simple rule-based error clustering:
          0 – no_errors (>80 % accuracy)
          1 – careless (correct reasoning, wrong answer – fast attempts)
          2 – conceptual (wrong reasoning – uses hints)
          3 – procedural (partial scores dominant)
          4 – guessing (very fast, low scores)
        """
        if not attempts:
            return {"cluster_id": 0, "label": "insufficient_data"}

        total = len(attempts)
        correct = sum(1 for a in attempts if a.is_correct == "correct")
        partial = sum(1 for a in attempts if a.is_correct == "partial")
        accuracy = correct / total

        if accuracy >= 0.8:
            return {"cluster_id": 0, "label": "no_errors"}

        timed = [a for a in attempts if a.time_taken and a.time_taken > 0]
        avg_time = (sum(a.time_taken for a in timed) / len(timed)) if timed else 60
        avg_hints = sum(a.hint_level_used for a in attempts) / total

        if avg_time < 30 and accuracy < 0.4:
            return {"cluster_id": 4, "label": "guessing"}
        if avg_hints >= 2:
            return {"cluster_id": 2, "label": "conceptual_gap"}
        if partial / total > 0.4:
            return {"cluster_id": 3, "label": "procedural_error"}
        if avg_time < 60 and accuracy < 0.7:
            return {"cluster_id": 1, "label": "careless_error"}

        return {"cluster_id": 2, "label": "conceptual_gap"}

    # ── Frustration detection ───────────────────────────────
    @staticmethod
    def detect_frustration(attempts: List[Attempt], window: int = 5) -> float:
        """
        Looks at last *window* attempts for repeated failures.
        Returns 0-1 frustration score.
        """
        if not attempts:
            return 0.0
        recent = sorted(attempts, key=lambda a: a.created_at or datetime.min)[-window:]
        failures = sum(1 for a in recent if a.is_correct == "incorrect")
        ratio = failures / len(recent)
        if ratio >= 0.8:
            return 1.0
        if ratio >= 0.6:
            return 0.7
        if ratio >= 0.4:
            return 0.4
        return round(ratio, 2)

    # ── Learning style heuristic ────────────────────────────
    @staticmethod
    def infer_learning_style(attempts: List[Attempt]) -> str:
        """
        Heuristic from hint usage and timing patterns.
        - high hint usage → verbal (reads explanations)
        - fast answers → kinesthetic (learns by doing)
        - balanced → balanced
        """
        if not attempts:
            return "balanced"
        avg_hints = sum(a.hint_level_used for a in attempts) / len(attempts)
        timed = [a for a in attempts if a.time_taken and a.time_taken > 0]
        avg_time = (sum(a.time_taken for a in timed) / len(timed)) if timed else 60
        if avg_hints >= 2.5:
            return "verbal"
        if avg_time < 30:
            return "kinesthetic"
        return "balanced"

    # ── Motivation pattern ──────────────────────────────────
    @staticmethod
    def infer_motivation_pattern(attempts: List[Attempt]) -> str:
        """Based on score trajectory over time."""
        if len(attempts) < 4:
            return "steady"
        sorted_attempts = sorted(attempts, key=lambda a: a.created_at or datetime.min)
        half = len(sorted_attempts) // 2
        first_half_avg = sum(a.score or 0 for a in sorted_attempts[:half]) / half
        second_half_avg = sum(a.score or 0 for a in sorted_attempts[half:]) / (len(sorted_attempts) - half)
        diff = second_half_avg - first_half_avg
        if diff > 0.15:
            return "growing"
        if diff < -0.15:
            return "declining"
        return "steady"

    # ── Full profile recompute ──────────────────────────────
    @classmethod
    def recompute_profile(cls, db: Session, user_id: int) -> CognitiveProfile:
        """Recalculate the full cognitive profile from raw data."""
        profile = db.query(CognitiveProfile).filter(CognitiveProfile.user_id == user_id).first()
        if not profile:
            profile = CognitiveProfile(user_id=user_id)
            db.add(profile)

        attempts = db.query(Attempt).filter(Attempt.user_id == user_id).order_by(Attempt.created_at).all()
        mastery_logs = db.query(MasteryLog).filter(MasteryLog.user_id == user_id).all()

        # Core dimensions
        profile.overconfidence_index = cls.compute_overconfidence(attempts)
        profile.hesitation_index = cls.compute_hesitation(attempts)
        profile.hint_dependency_index = cls.compute_hint_dependency(attempts)
        profile.transfer_ability = cls.compute_transfer_ability(mastery_logs)
        profile.consistency_index = cls.compute_consistency(attempts)

        # Error patterns
        err = cls.classify_error_pattern(attempts)
        profile.error_pattern_type = err["cluster_id"]
        profile.error_pattern_label = err["label"]

        # Frustration
        profile.frustration_score = cls.detect_frustration(attempts)

        # Learning style & motivation
        profile.learning_style = cls.infer_learning_style(attempts)
        profile.motivation_pattern = cls.infer_motivation_pattern(attempts)

        # Aggregated mastery-based dimensions
        if mastery_logs:
            avg_mastery = sum(m.mastery_score for m in mastery_logs) / len(mastery_logs)
            avg_confidence = sum(m.confidence_score for m in mastery_logs) / len(mastery_logs)
            avg_retention = sum(m.retention_decay_score for m in mastery_logs) / len(mastery_logs)
            profile.abstraction_skill = round(avg_mastery * 0.6 + profile.transfer_ability * 0.4, 4)
            procedural_correct = sum(1 for a in attempts if a.is_correct == "correct") / max(len(attempts), 1)
            profile.procedural_strength = round(procedural_correct, 4)
            profile.retention_rate = round(avg_retention, 4)
            profile.metacognition_score = round(1.0 - abs(profile.overconfidence_index), 4)
            profile.avg_self_confidence = round(avg_confidence, 4)
            profile.confidence_accuracy_gap = profile.overconfidence_index

        # Stats
        profile.total_sessions = len(set(
            (a.created_at.date() if a.created_at else None) for a in attempts
        ) - {None})
        profile.total_time_minutes = sum(a.time_taken or 0 for a in attempts) // 60

        db.flush()
        return profile

    # ── Learning DNA Report ─────────────────────────────────
    @classmethod
    def generate_learning_dna(cls, db: Session, user_id: int) -> Dict[str, Any]:
        """Generate the flagship Learning DNA Report."""
        profile = cls.recompute_profile(db, user_id)
        mastery_logs = db.query(MasteryLog).filter(MasteryLog.user_id == user_id).all()
        attempts = db.query(Attempt).filter(Attempt.user_id == user_id).all()

        # Strengths / weaknesses
        strong = [m for m in mastery_logs if m.mastery_score >= 0.7]
        weak = [m for m in mastery_logs if m.mastery_score < 0.5]

        # Build recommendations
        recommendations = []
        if profile.overconfidence_index > 0.2:
            recommendations.append("Practice with self-testing before checking answers to calibrate confidence.")
        if profile.hint_dependency_index > 0.5:
            recommendations.append("Try solving without hints first to build independent problem-solving skills.")
        if profile.frustration_score > 0.5:
            recommendations.append("Take breaks between difficult topics. Consider reviewing prerequisite concepts.")
        if profile.retention_rate < 0.5:
            recommendations.append("Increase review frequency — your retention decays faster than average.")
        if profile.motivation_pattern == "declining":
            recommendations.append("Mix in topics you enjoy to maintain motivation momentum.")
        if not recommendations:
            recommendations.append("Keep up the great work! Focus on expanding to new concepts.")

        return {
            "cognitive_profile": {
                "abstraction_skill": profile.abstraction_skill,
                "procedural_strength": profile.procedural_strength,
                "retention_rate": profile.retention_rate,
                "transfer_ability": profile.transfer_ability,
                "metacognition_score": profile.metacognition_score,
            },
            "behavioural_signals": {
                "overconfidence_index": profile.overconfidence_index,
                "hesitation_index": profile.hesitation_index,
                "hint_dependency_index": profile.hint_dependency_index,
                "consistency_index": profile.consistency_index,
                "frustration_score": profile.frustration_score,
            },
            "error_analysis": {
                "pattern_type": profile.error_pattern_type,
                "pattern_label": profile.error_pattern_label,
                "dominant_misconception": profile.dominant_misconception,
            },
            "learning_style": {
                "style": profile.learning_style,
                "motivation_pattern": profile.motivation_pattern,
                "peak_performance_hour": profile.peak_performance_hour,
            },
            "confidence_engine": {
                "avg_self_confidence": profile.avg_self_confidence,
                "confidence_accuracy_gap": profile.confidence_accuracy_gap,
                "interpretation": (
                    "Well calibrated" if abs(profile.confidence_accuracy_gap) < 0.1
                    else "Overconfident" if profile.confidence_accuracy_gap > 0 else "Underconfident"
                ),
            },
            "stats": {
                "total_sessions": profile.total_sessions,
                "total_time_minutes": profile.total_time_minutes,
                "total_attempts": len(attempts),
                "concepts_mastered": len(strong),
                "concepts_weak": len(weak),
            },
            "recommendations": recommendations,
        }
