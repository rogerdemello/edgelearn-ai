"""
EdgeLearn AI Backend - Main FastAPI Application
Multi-Agent Learning Intelligence System
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn

from api.routes import diagnostic, hints, mastery, multilingual, rubric, auth, study_planner, integrity, practice
from api.routes import cognitive, knowledge_graph, exam, debate, institutional
from core.database import engine, Base
from core.config import settings
# Import models to register them with SQLAlchemy
from models.user import User
from models.concept import Concept, Assessment, AssessmentResponse
from models.mastery import MasteryLog, StudySession
from models.question import Question, Attempt
from models.cognitive import CognitiveProfile, EmotionalState, DebateSession, ExamSimulation
from models.knowledge_graph import ConceptEdge, ConceptCluster

security = HTTPBearer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events"""
    try:
        if engine:
            Base.metadata.create_all(bind=engine)
            print("✅ Database tables created/verified")
            
            # Migrate existing database: add total_xp and level columns if missing
            from sqlalchemy import text, inspect
            inspector = inspect(engine)
            if "users" in inspector.get_table_names():
                with engine.begin() as conn:
                    columns = [col["name"] for col in inspector.get_columns("users")]
                    if "total_xp" not in columns:
                        conn.execute(text("ALTER TABLE users ADD COLUMN total_xp INTEGER DEFAULT 0"))
                        print("✅ Added total_xp column to users table")
                    if "level" not in columns:
                        conn.execute(text("ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1"))
                        print("✅ Added level column to users table")
            
            # Migrate mastery_logs table: add retention_decay_score if missing
            if "mastery_logs" in inspector.get_table_names():
                with engine.begin() as conn:
                    columns = [col["name"] for col in inspector.get_columns("mastery_logs")]
                    if "retention_decay_score" not in columns:
                        conn.execute(text("ALTER TABLE mastery_logs ADD COLUMN retention_decay_score REAL DEFAULT 1.0"))
                        print("✅ Added retention_decay_score column to mastery_logs table")
            
            # Seed default concepts if empty
            from core.database import SessionLocal
            from models.concept import Concept
            db = SessionLocal()
            try:
                if db.query(Concept).count() == 0:
                    concepts = []
                    for title, subject, diff in [
                        ("Variables and Types", "Programming", "beginner"),
                        ("Functions", "Programming", "beginner"),
                        ("Control Flow", "Programming", "beginner"),
                        ("Photosynthesis", "Biology", "beginner"),
                        ("Algebra Basics", "Mathematics", "beginner"),
                    ]:
                        concept = Concept(title=title, subject=subject, difficulty_level=diff)
                        db.add(concept)
                        concepts.append(concept)
                    db.commit()
                    print("✅ Seeded default concepts")
                    
                    # Seed sample questions
                    if db.query(Question).count() == 0:
                        sample_questions = [
                            {
                                "concept_title": "Variables and Types",
                                "question_text": "What is the difference between a variable and a constant in programming?",
                                "correct_answer": "A variable can change its value during program execution, while a constant's value remains fixed throughout the program.",
                                "difficulty": "beginner"
                            },
                            {
                                "concept_title": "Functions",
                                "question_text": "Explain what a function parameter is and how it differs from a return value.",
                                "correct_answer": "A parameter is an input value passed to a function when it's called. A return value is the output that a function sends back to the caller.",
                                "difficulty": "beginner"
                            },
                            {
                                "concept_title": "Photosynthesis",
                                "question_text": "What are the main inputs and outputs of photosynthesis?",
                                "correct_answer": "Inputs: Carbon dioxide (CO2), water (H2O), and light energy. Outputs: Glucose (C6H12O6) and oxygen (O2).",
                                "difficulty": "beginner"
                            },
                            {
                                "concept_title": "Algebra Basics",
                                "question_text": "Solve for x: 2x + 5 = 13",
                                "correct_answer": "x = 4",
                                "difficulty": "beginner"
                            }
                        ]
                        
                        for q_data in sample_questions:
                            concept = db.query(Concept).filter(Concept.title == q_data["concept_title"]).first()
                            if concept:
                                question = Question(
                                    concept_id=concept.id,
                                    question_text=q_data["question_text"],
                                    correct_answer=q_data["correct_answer"],
                                    difficulty_level=q_data["difficulty"],
                                    question_type="open_ended"
                                )
                                db.add(question)
                        db.commit()
                        print("✅ Seeded sample questions")

                # Seed knowledge graph edges if empty
                from models.knowledge_graph import ConceptEdge
                if db.query(ConceptEdge).count() == 0:
                    from services.concept_graph import ConceptGraphEngine
                    ConceptGraphEngine.seed_default_graph(db)
                    print("✅ Seeded knowledge graph edges")
            finally:
                db.close()
        else:
            print("⚠️  Database not configured - some features may not work")
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")
        print("   Server will start but database features will be unavailable")
    yield
    pass


app = FastAPI(
    title="EdgeLearn AI API",
    description="AI-Powered Learning Intelligence System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(diagnostic.router, prefix="/api/diagnostic", tags=["Diagnostic Engine"])
app.include_router(hints.router, prefix="/api/hints", tags=["Hint Engine"])
app.include_router(mastery.router, prefix="/api/mastery", tags=["Mastery Tracker"])
app.include_router(multilingual.router, prefix="/api/multilingual", tags=["Multilingual"])
app.include_router(rubric.router, prefix="/api/rubric", tags=["Rubric Feedback"])
app.include_router(study_planner.router, prefix="/api/study-planner", tags=["Study Planner"])
app.include_router(integrity.router, prefix="/api/integrity", tags=["Academic Integrity"])
app.include_router(practice.router, prefix="/api/practice", tags=["Practice Session"])
app.include_router(cognitive.router, prefix="/api/cognitive", tags=["Cognitive Engine"])
app.include_router(knowledge_graph.router, prefix="/api/knowledge-graph", tags=["Knowledge Graph"])
app.include_router(exam.router, prefix="/api/exam", tags=["Exam Predictor"])
app.include_router(debate.router, prefix="/api/debate", tags=["AI Debate Tutor"])
app.include_router(institutional.router, prefix="/api/institutional", tags=["Institutional Dashboard"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "EdgeLearn AI API is running",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    from core.database import engine
    from sqlalchemy import text
    
    db_status = "disconnected"
    if engine:
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            db_status = "connected"
        except Exception:
            db_status = "disconnected"
    
    return {
        "status": "healthy",
        "database": db_status,
        "api": "running"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
