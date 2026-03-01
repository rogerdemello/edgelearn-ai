"""
Mastery Calculation Service
Implements mastery tracking formulas and retention decay
"""

import math
from datetime import datetime
from typing import Dict, Optional


class MasteryCalculator:
    """Service for calculating mastery scores and retention decay"""
    
    # Mastery update parameters
    CORRECT_BONUS_BASE = 0.15  # Base bonus for correct answers
    HINT_PENALTY_PER_LEVEL = 0.02  # Penalty per hint level used
    TIME_PENALTY_FACTOR = 0.001  # Penalty factor for time taken
    
    # Retention decay parameters
    DECAY_HALF_LIFE_DAYS = 7  # Half-life for retention decay (7 days)
    
    @staticmethod
    def calculate_mastery_update(
        old_mastery: float,
        is_correct: bool,
        hint_level_used: int = 0,
        time_taken: int = 0,
        expected_time: int = 300,  # Expected time in seconds (default 5 min)
        confidence_rating: Optional[float] = None
    ) -> Dict[str, float]:
        """
        Calculate new mastery score based on performance
        
        Formula: new_mastery = old_mastery + correct_bonus - hint_penalty - time_penalty
        
        Args:
            old_mastery: Current mastery score (0.0 to 1.0)
            is_correct: Whether the answer was correct
            hint_level_used: Hint level used (0-5, 0 means no hints)
            time_taken: Time taken in seconds
            expected_time: Expected time to complete in seconds
            confidence_rating: Optional confidence rating (0.0 to 1.0)
        
        Returns:
            Dict with new_mastery, mastery_delta, and breakdown
        """
        # Calculate correct bonus
        if is_correct:
            correct_bonus = MasteryCalculator.CORRECT_BONUS_BASE
            # Boost bonus slightly if confidence was high
            if confidence_rating and confidence_rating > 0.7:
                correct_bonus *= 1.2
        else:
            # Penalty for incorrect answer
            correct_bonus = -0.05
        
        # Calculate hint penalty
        hint_penalty = hint_level_used * MasteryCalculator.HINT_PENALTY_PER_LEVEL
        
        # Calculate time penalty
        if time_taken > expected_time:
            time_excess = time_taken - expected_time
            time_penalty = min(0.05, time_excess * MasteryCalculator.TIME_PENALTY_FACTOR)
        else:
            time_penalty = 0.0
        
        # Calculate mastery delta
        mastery_delta = correct_bonus - hint_penalty - time_penalty
        
        # Calculate new mastery (clamped between 0 and 1)
        new_mastery = max(0.0, min(1.0, old_mastery + mastery_delta))
        
        return {
            "new_mastery": round(new_mastery, 4),
            "mastery_delta": round(mastery_delta, 4),
            "old_mastery": round(old_mastery, 4),
            "breakdown": {
                "correct_bonus": round(correct_bonus, 4),
                "hint_penalty": round(hint_penalty, 4),
                "time_penalty": round(time_penalty, 4)
            }
        }
    
    @staticmethod
    def calculate_retention_decay(
        last_practiced: datetime,
        current_mastery: float
    ) -> Dict[str, float]:
        """
        Calculate retention decay based on time since last practice
        
        Formula: decay = exp(-days_since_review / 7)
        
        Args:
            last_practiced: DateTime of last practice
            current_mastery: Current mastery score
        
        Returns:
            Dict with decay_factor, adjusted_mastery, and days_since_review
        """
        # Calculate days since last review
        now = datetime.now(last_practiced.tzinfo) if last_practiced.tzinfo else datetime.now()
        days_since_review = (now - last_practiced).total_seconds() / 86400.0
        
        # Calculate decay factor using exponential decay
        # decay = exp(-days_since_review / half_life)
        decay_factor = math.exp(-days_since_review / MasteryCalculator.DECAY_HALF_LIFE_DAYS)
        
        # Apply decay to current mastery
        adjusted_mastery = max(0.0, min(1.0, current_mastery * decay_factor))
        
        return {
            "decay_factor": round(decay_factor, 4),
            "adjusted_mastery": round(adjusted_mastery, 4),
            "days_since_review": round(days_since_review, 2),
            "original_mastery": round(current_mastery, 4)
        }
    
    @staticmethod
    def calculate_confidence_score(
        is_correct: bool,
        hint_level_used: int,
        time_taken: int,
        expected_time: int = 300,
        self_reported_confidence: Optional[float] = None
    ) -> float:
        """
        Calculate confidence score based on performance metrics
        
        Args:
            is_correct: Whether the answer was correct
            hint_level_used: Hint level used (0-5)
            time_taken: Time taken in seconds
            expected_time: Expected time in seconds
            self_reported_confidence: Optional self-reported confidence (0-1)
        
        Returns:
            Confidence score (0.0 to 1.0)
        """
        if not is_correct:
            # Low confidence for incorrect answers
            base_confidence = 0.2
        elif hint_level_used == 0:
            # High confidence if correct without hints
            base_confidence = 0.9
        else:
            # Decrease confidence based on hints used
            base_confidence = max(0.3, 0.9 - (hint_level_used * 0.12))
        
        # Adjust based on time taken
        if time_taken <= expected_time * 0.7:
            # Quick response boosts confidence
            time_factor = 1.1
        elif time_taken > expected_time * 1.5:
            # Slow response reduces confidence
            time_factor = 0.85
        else:
            time_factor = 1.0
        
        calculated_confidence = min(1.0, base_confidence * time_factor)
        
        # Blend with self-reported confidence if available
        if self_reported_confidence is not None:
            # Weight: 70% calculated, 30% self-reported
            final_confidence = 0.7 * calculated_confidence + 0.3 * self_reported_confidence
        else:
            final_confidence = calculated_confidence
        
        return round(final_confidence, 4)
    
    @staticmethod
    def recommend_hint_level(
        mastery_score: float,
        attempts_on_question: int = 0
    ) -> int:
        """
        Recommend appropriate hint level based on mastery and attempts
        
        Args:
            mastery_score: Current mastery score (0.0 to 1.0)
            attempts_on_question: Number of attempts on this question
        
        Returns:
            Recommended hint level (1-5)
        """
        # Base level on mastery
        if mastery_score < 0.3:
            base_level = 4  # Low mastery: start with strong hints
        elif mastery_score < 0.5:
            base_level = 3  # Medium mastery: moderate hints
        elif mastery_score < 0.7:
            base_level = 2  # Good mastery: gentle hints
        else:
            base_level = 1  # High mastery: minimal hints
        
        # Increase hint level with more attempts
        adjusted_level = min(5, base_level + attempts_on_question)
        
        return adjusted_level
