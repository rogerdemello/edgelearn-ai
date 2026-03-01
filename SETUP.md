# Setup Guide

Complete setup instructions for EdgeLearn AI development environment.

## Prerequisites

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Azure OpenAI** (Recommended) - [Setup Guide](https://portal.azure.com) or **OpenAI API Key** - [Get one](https://platform.openai.com/api-keys)

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd edgelearn-ai
```

## Step 2: Environment (single .env for backend, frontend, and local databases)

Create one `.env` at the **project root** (edgelearn-ai/). Backend and frontend both use it.

```bash
# From project root (edgelearn-ai/)
cp .env.example .env
```

Edit `.env` and set at least:
- `SECRET_KEY` – change to a random string (min 32 chars) for production
- `AZURE_OPENAI_ENDPOINT` – your Azure OpenAI endpoint (recommended)
- `AZURE_OPENAI_API_KEY` – your Azure OpenAI key
- `AZURE_OPENAI_DEPLOYMENT` – your deployment name (e.g., gpt-4o)
- `NEXT_PUBLIC_API_URL` – backend URL (default `http://localhost:8000`)

Alternatively, use regular OpenAI:
- `OPENAI_API_KEY` – optional; leave empty for stub AI responses

Do not commit `.env`; it is gitignored.

## Step 3: Backend Setup

### 3.1 Create Virtual Environment

```bash
cd backend
python -m venv .venv
```

### 3.2 Activate Virtual Environment

**Windows (Command Prompt):**
```cmd
.venv\Scripts\activate.bat
```

**Windows (PowerShell):**
```powershell
.venv\Scripts\Activate.ps1
```

**Windows (Git Bash):**
```bash
source .venv/Scripts/activate
```

**macOS/Linux:**
```bash
source .venv/bin/activate
```

### 3.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 3.4 Start Backend Server

Backend loads `.env` from the project root (see Step 2). No separate backend `.env` needed.

```bash
uvicorn main:app --reload
```

Or use the startup script:
```bash
# Windows
start_server.bat

# Linux/Mac
bash start_server.sh
```

Backend runs on: **http://localhost:8000**

## Step 4: Frontend Setup

### 4.1 Install Dependencies

Open a new terminal:

```bash
cd frontend
pnpm install
# or: npm install
```

Frontend loads the **project root `.env`** (edgelearn-ai/.env) via next.config, so `NEXT_PUBLIC_API_URL` and other `NEXT_PUBLIC_*` vars are read from there. No need for a separate frontend `.env.local` unless you want to override.

### 4.2 Start Development Server

```bash
npm run dev
```

Frontend runs on: **http://localhost:3000**

## Step 5: Verify Installation

1. **Check Backend Health**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy","database":"connected","api":"running"}`

2. **Check Frontend**
   - Open http://localhost:3000
   - You should see the login page

3. **Check API Docs**
   - Open http://localhost:8000/docs
   - Interactive API documentation

## Database Options

### SQLite (Default - Recommended)

No setup needed! SQLite is built into Python. Database file (`edgelearn.db`) is created automatically.

```env
DATABASE_URL=sqlite:///./edgelearn.db
```

### Supabase (Cloud PostgreSQL)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Add to `.env`:
   ```env
   DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres
   ```

### Local PostgreSQL (Optional - for local development)

```bash
# Start PostgreSQL with docker-compose (for local dev only)
docker-compose up -d postgres
```

Then in the **project root `.env`**:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edgelearn
```

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
uvicorn main:app --port 8001
```

**Import errors:**
- Make sure virtual environment is activated
- Verify you're using venv Python: `where python` (Windows) or `which python` (Linux/Mac)

**Database connection errors:**
- For SQLite: Check file permissions
- For PostgreSQL: Verify server is running
- For Supabase: Check connection string

### Frontend Issues

**Port 3000 already in use:**
```bash
npm run dev -- -p 3001
```

**API connection errors:**
- Verify `NEXT_PUBLIC_API_URL` in the project root `.env`
- Check backend is running
- Check CORS settings

### Common Issues

**"Cannot import name 'Undefined'"**
- You're using system Python instead of venv Python
- Activate virtual environment or use: `.venv/Scripts/python.exe -m uvicorn main:app --reload`

**"Database not configured"**
- Add `DATABASE_URL` to `.env` file
- SQLite is default: `sqlite:///./edgelearn.db`

**"OpenAI API errors"**
- Verify API key in `.env`
- Check API key has credits/quota
- Check internet connection

## Development Workflow

1. **Make code changes**
2. **Backend auto-reloads** (if using `--reload`)
3. **Frontend hot-reloads** automatically
4. **Test in browser** at http://localhost:3000

## Production Build

### Backend
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
npm run build
npm start
```

## Next Steps

- Read [API Documentation](API.md) for endpoint details
- Check [Contributing Guide](CONTRIBUTING.md) for development guidelines
- Explore the codebase and start building!
