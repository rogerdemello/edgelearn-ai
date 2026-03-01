# 🚀 EdgeLearn AI Quick Start Guide

## Prerequisites
- Python 3.8+
- Node.js 16+
- npm or pnpm

## Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create .env file** (optional)
   ```bash
   # Create .env in backend/ directory
   DATABASE_URL=sqlite:///./edgelearn.db
   SECRET_KEY=your-secret-key-change-in-production
   OPENAI_API_KEY=your-openai-key-optional
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. **Start the backend server**
   ```bash
   python main.py
   # or
   uvicorn main:app --reload --port 8000
   ```

   The backend will:
   - Create database tables automatically
   - Seed sample concepts and questions
   - Be available at `http://localhost:8000`
   - API docs at `http://localhost:8000/docs`

## Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Create .env.local file** (optional)
   ```bash
   # Create .env.local in frontend/ directory
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   The frontend will be available at `http://localhost:3000`

## First Steps

1. **Register a new account**
   - Go to `http://localhost:3000/signup`
   - Create an account

2. **Try a practice session**
   - Click "Practice" in the navigation
   - Answer questions and request hints
   - See your mastery update in real-time

3. **View analytics**
   - Go to Analytics page
   - See your performance metrics
   - Track strong and weak areas

## Features to Test

### Practice Session
- Answer questions
- Request progressive hints (5 levels)
- See mastery delta after each attempt
- Track confidence scores

### Analytics Dashboard
- View attempt statistics
- See mastery scores by concept
- Identify strong/weak areas
- Monitor performance metrics

### Diagnostic Features
- Get instant feedback on answers
- See misconception identification
- Receive recommended hint levels

### Mastery Tracking
- Watch scores update based on performance
- Hint penalties reduce mastery gain
- Time-based scoring
- Retention decay calculation

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation with:
- All available endpoints
- Request/response schemas
- Try-it-out functionality

## Troubleshooting

### Backend won't start
- Make sure port 8000 is available
- Check Python version (3.8+)
- Verify all dependencies installed: `pip install -r requirements.txt`

### Frontend won't start
- Make sure port 3000 is available
- Check Node version (16+)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Database issues
- Delete `edgelearn.db` to start fresh
- The database will be recreated with sample data on next startup

### CORS errors
- Ensure backend CORS_ORIGINS includes your frontend URL
- Default is `http://localhost:3000`

## Development Tips

### Hot Reload
- Backend: uvicorn automatically reloads on code changes
- Frontend: Next.js hot reloads automatically

### Database Reset
```bash
# Delete the database file
rm backend/edgelearn.db
# Restart backend - tables and sample data will be recreated
```

### API Testing
Use the built-in Swagger UI at `/docs` or use curl:
```bash
# Health check
curl http://localhost:8000/

# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'
```

## Next Steps

1. **Production Deployment**
   - Set strong SECRET_KEY
   - Use PostgreSQL/Supabase for production database
   - Set up proper CORS origins
   - Configure OpenAI API key for full AI features

2. **Supabase Migration**
   - Create Supabase project
   - Get PostgreSQL connection string
   - Update DATABASE_URL in .env
   - Restart backend (migration happens automatically)

## Support

For issues or questions:
1. Check the API documentation at `/docs`
2. Review `IMPLEMENTATION_COMPLETE.md` for architecture details
3. Check backend logs for error messages

---

**Enjoy using EdgeLearn AI! 🎓**
