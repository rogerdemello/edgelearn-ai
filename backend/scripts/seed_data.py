"""
Seed script to populate database with sample data
Run with: python scripts/seed_data.py
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from core.database import SessionLocal, engine, Base
from models.user import User
from models.concept import Concept, Assessment
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed_data():
    """Seed database with sample data"""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    try:
        # Create sample concepts
        concepts_data = [
            {
                "title": "Photosynthesis",
                "description": "The process by which plants convert light energy into chemical energy",
                "subject": "Biology",
                "difficulty_level": "intermediate"
            },
            {
                "title": "Linear Equations",
                "description": "Equations involving variables with degree 1",
                "subject": "Mathematics",
                "difficulty_level": "beginner"
            },
            {
                "title": "Python Functions",
                "description": "Understanding function definition, parameters, and return values",
                "subject": "Computer Science",
                "difficulty_level": "beginner"
            },
            {
                "title": "World War II",
                "description": "Major events and causes of World War II",
                "subject": "History",
                "difficulty_level": "intermediate"
            }
        ]
        
        concepts = []
        for data in concepts_data:
            concept = Concept(**data)
            db.add(concept)
            concepts.append(concept)
        
        db.commit()
        
        # Create sample assessments
        assessments_data = [
            {
                "concept_id": concepts[0].id,
                "question_type": "essay",
                "question_text": "Explain the process of photosynthesis in your own words.",
                "correct_answer": None,
                "rubric": {
                    "understanding": {"description": "Demonstrates understanding of the process", "weight": 3},
                    "clarity": {"description": "Clear and well-structured explanation", "weight": 2},
                    "completeness": {"description": "Covers key components", "weight": 2}
                },
                "hints": {}
            },
            {
                "concept_id": concepts[1].id,
                "question_type": "multiple_choice",
                "question_text": "Solve for x: 2x + 5 = 15",
                "correct_answer": "x = 5",
                "rubric": {
                    "correctness": {"description": "Correct answer", "weight": 5}
                },
                "hints": {}
            },
            {
                "concept_id": concepts[2].id,
                "question_type": "coding",
                "question_text": "Write a Python function that takes two numbers and returns their sum.",
                "correct_answer": "def add(a, b):\n    return a + b",
                "rubric": {
                    "syntax": {"description": "Correct Python syntax", "weight": 2},
                    "logic": {"description": "Correct logic", "weight": 2},
                    "style": {"description": "Good coding style", "weight": 1}
                },
                "hints": {}
            }
        ]
        
        for data in assessments_data:
            assessment = Assessment(**data)
            db.add(assessment)
        
        db.commit()
        
        print("✅ Sample data seeded successfully!")
        print(f"   - Created {len(concepts)} concepts")
        print(f"   - Created {len(assessments_data)} assessments")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
