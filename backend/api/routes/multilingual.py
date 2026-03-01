"""
Multilingual Processor routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from core.database import get_db
from services.ai_service import AIService
from api.routes.auth import get_current_user
from models.user import User

router = APIRouter()


class TranslationRequest(BaseModel):
    text: str
    target_language: str
    source_language: str = "en"


class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str


@router.post("/translate", response_model=TranslationResponse)
async def translate_content(
    request: TranslationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Translate content to target language
    """
    translated_text = await AIService.translate_content(
        text=request.text,
        target_language=request.target_language,
        source_language=request.source_language
    )
    
    return TranslationResponse(
        original_text=request.text,
        translated_text=translated_text,
        source_language=request.source_language,
        target_language=request.target_language
    )


@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages"""
    from core.config import settings
    
    language_names = {
        "en": "English",
        "hi": "Hindi",
        "ta": "Tamil",
        "te": "Telugu",
        "kn": "Kannada",
        "mr": "Marathi",
        "gu": "Gujarati",
        "bn": "Bengali",
        "ml": "Malayalam",
        "or": "Odia"
    }
    
    return {
        "supported_languages": [
            {
                "code": lang,
                "name": language_names.get(lang, lang)
            }
            for lang in settings.SUPPORTED_LANGUAGES
        ],
        "default_language": settings.DEFAULT_LANGUAGE
    }


@router.post("/set-language")
async def set_user_language(
    language: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set user's preferred language"""
    from core.config import settings
    
    if language not in settings.SUPPORTED_LANGUAGES:
        return {"error": "Language not supported"}
    
    # Update user preference
    current_user.preferred_language = language
    db.commit()
    
    return {
        "message": f"Language preference set to {language}",
        "language": language
    }
