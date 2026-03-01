"""
Spaced Repetition Algorithm Service
Implements SM-2 algorithm for optimal review scheduling
"""

from datetime import datetime, timedelta
from typing import Dict, Optional
from models.mastery import MasteryLog


class SpacedRepetitionService:
    """Service for spaced repetition scheduling"""
    
    @staticmethod
    def calculate_next_review(
        mastery_log: MasteryLog,
        performance_score: float,
        ease_factor: float = 2.5
    ) -> datetime:
        """
        Calculate next review date using SM-2 algorithm
        
        Args:
            mastery_log: Current mastery log entry
            performance_score: Score from 0-1 (quality of recall)
            ease_factor: Ease factor (default 2.5)
        
        Returns:
            Next review datetime
        """
        # SM-2 algorithm parameters
        if mastery_log.attempts == 0:
            # First review: 1 day
            interval = 1
        elif mastery_log.attempts == 1:
            # Second review: 6 days
            interval = 6
        else:
            # Subsequent reviews based on ease factor
            interval = int(mastery_log.meta_data.get('interval', 1) * ease_factor) if mastery_log.meta_data else 1
        
        # Adjust based on performance
        if performance_score < 0.6:
            # Poor performance: reset interval
            interval = 1
            ease_factor = max(1.3, ease_factor - 0.2)
        elif performance_score >= 0.9:
            # Excellent performance: increase ease factor
            ease_factor = min(2.5, ease_factor + 0.1)
        
        # Update metadata
        metadata = mastery_log.meta_data or {}
        metadata['interval'] = interval
        metadata['ease_factor'] = ease_factor
        mastery_log.meta_data = metadata
        
        next_review = datetime.now() + timedelta(days=interval)
        
        return next_review
    
    @staticmethod
    def get_due_concepts(mastery_logs: list) -> list:
        """
        Get concepts that are due for review
        
        Args:
            mastery_logs: List of mastery log entries
        
        Returns:
            List of mastery logs due for review
        """
        now = datetime.now()
        due_concepts = []
        
        for log in mastery_logs:
            if log.next_review and log.next_review <= now:
                due_concepts.append(log)
            elif not log.next_review:
                # Never reviewed, add to due list
                due_concepts.append(log)
        
        # Sort by priority (overdue first, then by next_review date)
        due_concepts.sort(
            key=lambda x: (
                0 if x.next_review and x.next_review < now else 1,
                x.next_review or datetime.min
            )
        )
        
        return due_concepts
    
    @staticmethod
    def calculate_exam_readiness(
        mastery_logs: list,
        exam_date: datetime
    ) -> Dict:
        """
        Calculate exam readiness score
        
        Args:
            mastery_logs: List of mastery logs for concepts in exam
            exam_date: Date of the exam
        
        Returns:
            Dict with readiness metrics
        """
        now = datetime.now()
        days_until_exam = (exam_date - now).days
        
        if days_until_exam <= 0:
            return {
                "readiness_score": 0.0,
                "status": "exam_passed",
                "recommendations": []
            }
        
        # Calculate average mastery
        if not mastery_logs:
            return {
                "readiness_score": 0.0,
                "status": "no_data",
                "recommendations": ["Start practicing concepts"]
            }
        
        avg_mastery = sum(log.mastery_score for log in mastery_logs) / len(mastery_logs)
        avg_confidence = sum(log.confidence_score for log in mastery_logs) / len(mastery_logs)
        
        # Concepts needing review
        concepts_to_review = [
            log for log in mastery_logs
            if log.mastery_score < 0.7 or (log.next_review and log.next_review < exam_date)
        ]
        
        # Calculate readiness score
        readiness_score = (avg_mastery * 0.6 + avg_confidence * 0.4)
        
        # Adjust based on time until exam
        if days_until_exam < 7:
            # Urgent: need high mastery
            readiness_score *= 0.9 if avg_mastery < 0.8 else 1.0
        elif days_until_exam < 14:
            # Moderate urgency
            readiness_score *= 0.95 if avg_mastery < 0.7 else 1.0
        
        # Determine status
        if readiness_score >= 0.8:
            status = "ready"
        elif readiness_score >= 0.6:
            status = "almost_ready"
        elif readiness_score >= 0.4:
            status = "needs_work"
        else:
            status = "not_ready"
        
        # Generate recommendations
        recommendations = []
        if len(concepts_to_review) > 0:
            recommendations.append(
                f"Review {len(concepts_to_review)} concept(s) before exam"
            )
        if avg_mastery < 0.7:
            recommendations.append("Focus on improving mastery of weak concepts")
        if days_until_exam < 7 and readiness_score < 0.8:
            recommendations.append("Consider intensive review sessions")
        
        return {
            "readiness_score": readiness_score,
            "status": status,
            "avg_mastery": avg_mastery,
            "avg_confidence": avg_confidence,
            "concepts_to_review": len(concepts_to_review),
            "days_until_exam": days_until_exam,
            "recommendations": recommendations
        }
