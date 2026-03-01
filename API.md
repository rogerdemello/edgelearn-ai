# API Documentation

Complete API reference for EdgeLearn AI backend.

**Base URL:** `http://localhost:8000`  
**API Version:** 1.0.0  
**Interactive Docs:** http://localhost:8000/docs

## Authentication

Most endpoints require authentication via Bearer token.

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword",
  "full_name": "John Doe",
  "preferred_language": "en"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "preferred_language": "en"
}
```

## Diagnostic Engine

### Assess Knowledge
```http
POST /api/diagnostic/assess
Authorization: Bearer <token>
Content-Type: application/json

{
  "concept_ids": [1, 2, 3],
  "responses": [
    {"concept_id": 1, "response": "Student answer here"},
    {"concept_id": 2, "response": "Another answer"}
  ]
}
```

**Response:**
```json
{
  "diagnosis": "Analysis text...",
  "strong_areas": ["Concept A", "Concept B"],
  "weak_areas": ["Concept C"],
  "confidence": 0.75,
  "recommended_path": [...],
  "mastery_scores": {1: 0.8, 2: 0.6}
}
```

### Get Concepts
```http
GET /api/diagnostic/concepts?subject=Mathematics&difficulty=beginner
Authorization: Bearer <token>
```

## Hint Engine

### Get Hint
```http
POST /api/hints/get
Authorization: Bearer <token>
Content-Type: application/json

{
  "assessment_id": 1,
  "student_response": "My current answer",
  "hint_level": 1,
  "previous_hints": []
}
```

**Response:**
```json
{
  "hint": "Consider the key concepts...",
  "level": 1,
  "is_final": false,
  "next_steps": "You can request hint level 2 if needed"
}
```

**Hint Levels:**
- 1: Very subtle nudge
- 2: Gentle hint
- 3: Moderate hint
- 4: Strong hint
- 5: Explicit hint (final)

## Mastery Tracker

### Update Mastery
```http
POST /api/mastery/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "concept_id": 1,
  "mastery_score": 0.85,
  "confidence_score": 0.90,
  "performance_data": {"time_taken": 120}
}
```

### Get All Mastery
```http
GET /api/mastery/all
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "concept_id": 1,
    "concept_title": "Photosynthesis",
    "mastery_score": 0.85,
    "confidence_score": 0.90,
    "attempts": 5,
    "last_practiced": "2024-01-15T10:30:00",
    "next_review": "2024-01-20T10:30:00"
  }
]
```

### Get Mastery Dashboard
```http
GET /api/mastery/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_concepts": 10,
  "avg_mastery": 0.75,
  "avg_confidence": 0.80,
  "strong_areas": [{"concept_id": 1, "mastery": 0.9}],
  "weak_areas": [{"concept_id": 2, "mastery": 0.4}]
}
```

## Rubric Feedback

### Evaluate with Rubric
```http
POST /api/rubric/evaluate
Authorization: Bearer <token>
Content-Type: application/json

{
  "assessment_id": 1,
  "response_text": "Student essay or code here",
  "response_data": {}
}
```

**Response:**
```json
{
  "overall_score": 85.5,
  "rubric_scores": {
    "clarity": 90.0,
    "structure": 85.0,
    "reasoning": 82.0
  },
  "feedback": "Detailed feedback text...",
  "suggestions": ["Improve structure", "Add examples"]
}
```

## Multilingual

### Translate Content
```http
POST /api/multilingual/translate
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Hello, how are you?",
  "target_language": "hi",
  "source_language": "en"
}
```

**Response:**
```json
{
  "original_text": "Hello, how are you?",
  "translated_text": "नमस्ते, आप कैसे हैं?",
  "source_language": "en",
  "target_language": "hi"
}
```

### Get Supported Languages
```http
GET /api/multilingual/languages
Authorization: Bearer <token>
```

**Supported Languages:**
- `en` - English
- `hi` - Hindi
- `ta` - Tamil
- `te` - Telugu
- `kn` - Kannada
- `mr` - Marathi
- `gu` - Gujarati
- `bn` - Bengali
- `ml` - Malayalam
- `or` - Odia

## Study Planner

### Create Study Plan
```http
POST /api/study-planner/create-plan
Authorization: Bearer <token>
Content-Type: application/json

{
  "concept_ids": [1, 2, 3],
  "exam_date": "2024-02-20T09:00:00",
  "daily_study_time_minutes": 60
}
```

**Response:**
```json
{
  "plan": [
    {
      "concept_id": 1,
      "priority": "high",
      "estimated_time_minutes": 30,
      "review_date": "2024-01-16T10:00:00"
    }
  ],
  "total_concepts": 3,
  "estimated_days": 5,
  "exam_readiness": {
    "readiness_score": 0.75,
    "status": "almost_ready",
    "recommendations": ["Review weak concepts"]
  }
}
```

### Get Due Concepts
```http
GET /api/study-planner/due-concepts
Authorization: Bearer <token>
```

### Get Exam Readiness
```http
GET /api/study-planner/exam-readiness?exam_date=2024-02-20T09:00:00&concept_ids=1&concept_ids=2
Authorization: Bearer <token>
```

## Academic Integrity

### Check Originality
```http
POST /api/integrity/check-originality
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Text to check for plagiarism",
  "reference_texts": ["Reference text 1", "Reference text 2"]
}
```

**Response:**
```json
{
  "originality_score": 0.95,
  "flagged_sections": [],
  "suggestions": "Text appears original",
  "needs_citation": false
}
```

### Generate Citations
```http
POST /api/integrity/generate-citations
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Source text",
  "source_type": "web",
  "source_url": "https://example.com"
}
```

## Health & Status

### Root Endpoint
```http
GET /
```

**Response:**
```json
{
  "message": "EdgeLearn AI API is running",
  "version": "1.0.0",
  "status": "healthy"
}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "api": "running"
}
```

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message here"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently no rate limiting implemented. Consider adding for production.

## Authentication Flow

1. Register or login to get `access_token`
2. Include token in `Authorization` header: `Bearer <token>`
3. Token expires after 30 minutes (configurable)
4. Re-login to get new token

## Examples

### Complete Flow: Register → Practice → Get Hint

```bash
# 1. Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"test123"}'

# Response: {"access_token":"eyJ...","token_type":"bearer"}

# 2. Get hint (use token from step 1)
curl -X POST http://localhost:8000/api/hints/get \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"assessment_id":1,"student_response":"My answer","hint_level":1}'

# 3. Check mastery
curl http://localhost:8000/api/mastery/dashboard \
  -H "Authorization: Bearer eyJ..."
```

## Interactive Documentation

Visit http://localhost:8000/docs for:
- Interactive API testing
- Request/response schemas
- Try it out functionality
- OpenAPI specification
