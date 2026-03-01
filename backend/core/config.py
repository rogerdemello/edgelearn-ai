"""
Configuration settings for EdgeLearn AI backend.
Loads from project root .env (edgelearn-ai/.env) so one file is used everywhere.
"""

from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings

# Project root = edgelearn-ai/ (parent of backend/)
_ROOT = Path(__file__).resolve().parents[2]
_ENV_FILE = _ROOT / ".env"


class Settings(BaseSettings):
    """Application settings"""
    
    # App settings
    APP_NAME: str = "EdgeLearn AI"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database Configuration
    # Option 1: SQLite (default - no setup needed, perfect for development)
    #   DATABASE_URL=sqlite:///./edgelearn.db
    # Option 2: Supabase PostgreSQL (cloud database)
    #   DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
    # Option 3: Local PostgreSQL (requires Docker or local install)
    #   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edgelearn
    # Option 4: Other cloud providers (Railway, Neon, etc.)
    #   DATABASE_URL=postgresql://user:pass@host:port/dbname
    DATABASE_URL: str = "sqlite:///./edgelearn.db"  # Default to SQLite for easy setup
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS: keep as str so pydantic-settings does not try to JSON-decode it from .env
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,https://edgelearn-ai.vercel.app"

    def get_cors_origins_list(self) -> List[str]:
        """CORS origins as a list (comma-separated string in .env)."""
        return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI (regular)
    OPENAI_API_KEY: str = ""
    
    # Azure OpenAI (optional - takes precedence if configured)
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_API_KEY: str = ""
    AZURE_OPENAI_API_VERSION: str = "2024-12-01-preview"
    AZURE_OPENAI_DEPLOYMENT: str = "gpt-4o"
    
    # AI Model settings
    GPT_MODEL: str = "gpt-4-turbo-preview"  # Used for regular OpenAI
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    
    # Multilingual
    SUPPORTED_LANGUAGES: List[str] = [
        "en", "hi", "ta", "te", "kn", "mr", "gu", "bn", "ml", "or"
    ]
    DEFAULT_LANGUAGE: str = "en"
    
    class Config:
        env_file = str(_ENV_FILE) if _ENV_FILE.exists() else ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore frontend-only vars (e.g. NEXT_PUBLIC_*) from shared .env


settings = Settings()
