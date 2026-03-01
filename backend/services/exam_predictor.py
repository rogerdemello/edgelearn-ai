"""
Exam Readiness Prediction Engine — predictive modelling for exam scores.
Uses mastery trend velocity, decay curve slope, topic coverage ratio.
"""

import math
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from models.mastery import MasteryLog
from models.question import Attempt
from models.concept import Concept


class ExamPredictor:
    """Predictive intelligence for exam readiness."""

    @staticmethod
    def _mastery_trend_velocity(mastery_logs: List[MasteryLog]) -> float:
        """
        Rate of mastery improvement:  positive → improving,  negative → declining.
        Uses linear regression slope over recent mastery scores.
        """
        logs_with_time = [m for m in mastery_logs if m.last_practiced]
        if len(logs_with_time) < 2:
            return 0.0
        logs_with_time.sort(key=lambda m: m.last_practiced)
        n = len(logs_with_time)
        x = list(range(n))
        y = [m.mastery_score for m in logs_with_time]
        x_mean = sum(x) / n
        y_mean = sum(y) / n
        numerator = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        if denominator == 0:
            return 0.0
        slope = numerator / denominator
        return round(slope, 4)

    @staticmethod
    def _decay_curve_slope(mastery_logs: List[MasteryLog]) -> float:
        """Average retention decay across all concepts.  Lower = faster forgetting."""
        decays = [m.retention_decay_score for m in mastery_logs if m.retention_decay_score is not None]
        if not decays:
            return 1.0
        return round(sum(decays) / len(decays), 4)

    @staticmethod
    def _topic_coverage(mastery_logs: List[MasteryLog], total_concepts: int) -> float:
        """Fraction of total concepts the student has attempted."""
        if total_concepts == 0:
            return 0.0
        attempted = len([m for m in mastery_logs if m.attempts > 0])
        return round(attempted / total_concepts, 4)

    @classmethod
    def predict_exam_score(
        cls,
        db: Session,
        user_id: int,
        exam_date: Optional[str] = None,
        concept_ids: Optional[List[int]] = None,
    ) -> Dict[str, Any]:
        """
        Predict exam score range and readiness.

        Returns:
            readiness_score (0-100)
            predicted_score_low / predicted_score_high (percentage)
            high_risk_topics
            mastery_trend_velocity
            decay_curve_slope
            topic_coverage_ratio
            recommendations
        """
        query = db.query(MasteryLog).filter(MasteryLog.user_id == user_id)
        if concept_ids:
            query = query.filter(MasteryLog.concept_id.in_(concept_ids))
        mastery_logs = query.all()

        total_concepts = db.query(Concept).count()
        if concept_ids:
            total_concepts = len(concept_ids)

        # Core metrics
        trend = cls._mastery_trend_velocity(mastery_logs)
        decay_slope = cls._decay_curve_slope(mastery_logs)
        coverage = cls._topic_coverage(mastery_logs, total_concepts)

        # Average mastery
        avg_mastery = (sum(m.mastery_score for m in mastery_logs) / len(mastery_logs)) if mastery_logs else 0.0

        # Days until exam
        days_until = None
        if exam_date:
            try:
                exam_dt = datetime.fromisoformat(exam_date.replace("Z", "+00:00"))
                days_until = max(0, (exam_dt - datetime.now(timezone.utc)).days)
            except Exception:
                days_until = None

        # Readiness score (weighted combination)
        readiness = (
            avg_mastery * 40 +
            coverage * 25 +
            decay_slope * 20 +
            max(0, min(1, 0.5 + trend * 5)) * 15  # Trend contribution
        )
        readiness = round(min(100, max(0, readiness)), 1)

        # Predicted score range
        base_score = avg_mastery * 100
        variance = (1 - decay_slope) * 15 + (1 - coverage) * 10
        predicted_low = round(max(0, base_score - variance), 1)
        predicted_high = round(min(100, base_score + variance * 0.5), 1)

        # Adjust for time pressure
        if days_until is not None and days_until < 7:
            readiness *= 0.9  # Penalty for cramming
            readiness = round(readiness, 1)

        # High risk topics (mastery < 0.5)
        concepts = {c.id: c for c in db.query(Concept).all()}
        high_risk = []
        for m in mastery_logs:
            if m.mastery_score < 0.5:
                high_risk.append({
                    "concept_id": m.concept_id,
                    "concept_title": concepts[m.concept_id].title if m.concept_id in concepts else str(m.concept_id),
                    "mastery": round(m.mastery_score, 3),
                    "retention": round(m.retention_decay_score, 3),
                })
        high_risk.sort(key=lambda x: x["mastery"])

        # Recommendations
        recommendations = []
        if coverage < 0.5:
            recommendations.append(f"Only {int(coverage*100)}% of topics covered — prioritize unseen topics.")
        if decay_slope < 0.6:
            recommendations.append("High retention decay detected — increase spaced repetition frequency.")
        if trend < 0:
            recommendations.append("Mastery trend is declining — review fundamentals before advancing.")
        if high_risk:
            risk_names = [t["concept_title"] for t in high_risk[:3]]
            recommendations.append(f"High-risk topics: {', '.join(risk_names)}. Focus here first.")
        if days_until is not None and days_until < 3:
            recommendations.append("Exam is very close — focus on weakest topics and review key formulas.")
        if not recommendations:
            recommendations.append("You're on track! Continue steady practice to maintain readiness.")

        # Status label
        if readiness >= 80:
            status = "Ready"
        elif readiness >= 60:
            status = "Almost Ready"
        elif readiness >= 40:
            status = "Needs Work"
        else:
            status = "Not Ready"

        return {
            "readiness_score": readiness,
            "status": status,
            "predicted_score_low": predicted_low,
            "predicted_score_high": predicted_high,
            "avg_mastery": round(avg_mastery, 3),
            "mastery_trend_velocity": trend,
            "decay_curve_slope": decay_slope,
            "topic_coverage_ratio": coverage,
            "high_risk_topics": high_risk,
            "days_until_exam": days_until,
            "recommendations": recommendations,
        }
