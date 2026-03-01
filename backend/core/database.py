"""
Database configuration and session management
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import logging
from core.config import settings

logger = logging.getLogger(__name__)

# Create engine with connection pooling
# Supports multiple database types:
# - SQLite: sqlite:///./edgelearn.db (default, no setup needed)
# - PostgreSQL: postgresql://user:pass@host:port/dbname
# - Supabase: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
engine = None
if settings.DATABASE_URL and settings.DATABASE_URL.strip():
    try:
        connect_args = {}
        engine_kwargs = {}
        
        # SQLite configuration
        if settings.DATABASE_URL.startswith("sqlite"):
            # SQLite doesn't need connection pooling
            engine_kwargs = {
                "connect_args": {"check_same_thread": False},  # Allow multi-threading
                "pool_pre_ping": False,
            }
            logger.info("Using SQLite database (file-based, no server needed)")
        # PostgreSQL/Supabase configuration
        elif settings.DATABASE_URL.startswith("postgresql"):
            # Supabase requires SSL
            if "supabase.co" in settings.DATABASE_URL or "supabase" in settings.DATABASE_URL.lower():
                connect_args["sslmode"] = "require"
                logger.info("Using Supabase PostgreSQL database")
            else:
                logger.info("Using PostgreSQL database")
            
            engine_kwargs = {
                "pool_pre_ping": True,
                "pool_size": 10,
                "max_overflow": 20,
                "connect_args": connect_args
            }
        else:
            # Other database types
            engine_kwargs = {
                "pool_pre_ping": True,
                "pool_size": 10,
                "max_overflow": 20,
            }
        
        engine = create_engine(
            settings.DATABASE_URL,
            **engine_kwargs
        )
        logger.info("Database engine created successfully")
    except Exception as e:
        logger.warning(f"Database engine creation failed: {e}")
        logger.warning("Server will start without database connection")
        engine = None
else:
    logger.warning("DATABASE_URL not set - server will start without database")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None

Base = declarative_base()


def get_db():
    """Dependency for getting database session"""
    if not SessionLocal:
        raise Exception("Database not configured. Please set DATABASE_URL in .env file")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
