# Contributing Guide

Guidelines for contributing to EdgeLearn AI.

## Development Setup

1. **Fork and clone repository**
   ```bash
   git clone <your-fork-url>
   cd edgelearn-ai
   ```

2. **Set up backend**
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment**
   - Copy `.env.example` to `.env` in backend
   - Copy `.env.local.example` to `.env.local` in frontend
   - Add your API keys

## Code Style

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints
- Maximum line length: 100 characters
- Use descriptive variable names
- Add docstrings to functions/classes

**Example:**
```python
def calculate_mastery_score(
    attempts: int,
    correct_answers: int,
    hint_usage: int
) -> float:
    """
    Calculate mastery score based on performance metrics.
    
    Args:
        attempts: Number of attempts
        correct_answers: Number of correct answers
        hint_usage: Number of hints used
    
    Returns:
        Mastery score between 0.0 and 1.0
    """
    # Implementation
```

### TypeScript/React (Frontend)
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use meaningful prop names

**Example:**
```typescript
interface HintEngineProps {
  assessmentId: number;
  questionText: string;
}

export default function HintEngine({ 
  assessmentId, 
  questionText 
}: HintEngineProps) {
  // Implementation
}
```

## Project Structure

### Backend
```
backend/
├── api/routes/     # API endpoints (one file per module)
├── models/         # SQLAlchemy models
├── services/       # Business logic
├── core/          # Configuration and database
└── tests/         # Test files
```

### Frontend
```
frontend/
├── app/           # Next.js pages
├── components/    # Reusable components
├── lib/           # Utilities and API client
└── public/        # Static assets
```

## Adding New Features

### Backend API Endpoint

1. **Create route file** in `api/routes/`
2. **Define models** in `models/` if needed
3. **Add business logic** in `services/`
4. **Register router** in `main.py`
5. **Add tests** in `tests/`

**Example:**
```python
# api/routes/new_feature.py
from fastapi import APIRouter
router = APIRouter()

@router.get("/endpoint")
async def get_data():
    return {"data": "value"}
```

```python
# main.py
from api.routes import new_feature
app.include_router(new_feature.router, prefix="/api/new-feature")
```

### Frontend Component

1. **Create component** in `components/`
2. **Add page** in `app/` if needed
3. **Add API calls** in `lib/api.ts`
4. **Update types** if needed

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Git Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "Add: description of changes"
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Commit Messages

Use clear, descriptive commit messages:

- `Add: New feature description`
- `Fix: Bug description`
- `Update: What was updated`
- `Refactor: What was refactored`
- `Docs: Documentation changes`

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Update README** if adding features
5. **Create descriptive PR** with:
   - What changed
   - Why it changed
   - How to test

## Code Review Guidelines

- Be respectful and constructive
- Focus on code, not person
- Suggest improvements clearly
- Approve when satisfied

## Questions?

- Open an issue for bugs
- Start a discussion for features
- Check existing issues first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
