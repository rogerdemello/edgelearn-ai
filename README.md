# EdgeLearn AI — Next-Generation Adaptive Learning Platform

> **Transform learning with AI-powered cognitive intelligence, personalized mastery tracking, and explainable feedback.**

EdgeLearn AI is a research-grade adaptive learning platform that combines cognitive science with artificial intelligence to create truly personalized learning experiences. Built with multi-agent AI, knowledge graph intelligence, and advanced cognitive modeling.

---

## ✨ Core Features

### 🧠 **Cognitive Intelligence**
- **Cognitive Profile** — Deep analysis of learning patterns, strengths, and weaknesses
- **Learning DNA Report** — Personalized cognitive fingerprint with optimized learning strategies
- **Emotional Confidence Engine** — Track confidence growth and emotional engagement
- **Behavioral Analysis** — Detect overconfidence, hesitation, hint dependency, and frustration patterns

### 📊 **Knowledge Graph Intelligence**
- **Concept Dependency Mapping** — Visualize prerequisite relationships between topics
- **Gap Propagation Analysis** — Identify how weak concepts cascade to dependent topics
- **Weak Root Detection** — Find foundational gaps blocking advanced understanding
- **Dynamic Graph Visualization** — Interactive network of mastery across concepts

### 🎓 **Exam Readiness & Simulation**
- **Predictive Exam Scoring** — AI-powered score predictions using trend velocity and decay curves
- **Timed Exam Simulations** — Practice under realistic conditions with stress indicators
- **Topic Coverage Analysis** — Identify high-risk topics before exams
- **Performance Breakdown** — Detailed concept-level analysis of exam results

### 💬 **AI Debate Tutor**
- **Critical Thinking Mode** — Engage in structured debates with AI challenger and supporter
- **Multi-Turn Reasoning** — Build arguments across multiple debate rounds
- **Comprehensive Scoring** — Evaluated on critical thinking, argument quality, evidence usage, and metacognition
- **Argument Resolution** — AI verifier provides final evaluation and growth insights

### 🎯 **Adaptive Learning Core**
- **Diagnostic Engine** — Multi-concept assessment with misconception detection
- **5-Level Stepwise Hints** — Scaffolded guidance without giving away answers
- **Mastery Tracking** — Real-time confidence and mastery score updates
- **Spaced Repetition** — SM-2 algorithm for optimal retention

### 📝 **Intelligent Assessment**
- **AI Rubric Feedback** — Explainable scoring for essays, code, and presentations
- **Academic Integrity Checks** — Originality detection and plagiarism prevention
- **Citation Generator** — Auto-generate APA, MLA, and Chicago format citations
- **Multilingual Support** — 10+ languages including Hindi, Tamil, Telugu, Bengali

### 👥 **Institutional Dashboard**
- **Class-Level Analytics** — Aggregated mastery heatmaps and performance trends
- **At-Risk Student Detection** — Early identification of struggling students
- **Leaderboard System** — Gamified XP and level-based rankings
- **Student Deep-Dive** — Individual cognitive profiles and concept breakdowns

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** with pip
- **Node.js 18+** with npm
- **OpenAI API Key** or **Azure OpenAI** (optional - system works with stub responses)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rogerdemello/edgelearn-ai.git
cd edgelearn-ai

# 2. Backend setup
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration

# 3. Frontend setup
cd ../frontend
npm install

# 4. Start backend (Terminal 1)
cd backend
python main.py

# 5. Start frontend (Terminal 2)
cd frontend
npm run dev
```

### Access Points
- **Frontend:** http://localhost:3000
- **API Documentation:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

---

## 📁 Project Structure

```
edgelearn-ai/
├── backend/
│   ├── api/routes/          # 60+ API endpoints
│   │   ├── auth.py          # JWT authentication
│   │   ├── cognitive.py     # Cognitive profiling
│   │   ├── debate.py        # AI debate tutor
│   │   ├── diagnostic.py    # Knowledge assessment
│   │   ├── exam.py          # Exam prediction & simulation
│   │   ├── hints.py         # Stepwise guidance
│   │   ├── institutional.py # Class analytics
│   │   ├── integrity.py     # Academic integrity
│   │   ├── knowledge_graph.py # Graph intelligence
│   │   ├── mastery.py       # Progress tracking
│   │   ├── multilingual.py  # Translation
│   │   ├── practice.py      # Practice sessions
│   │   ├── rubric.py        # Rubric feedback
│   │   └── study_planner.py # Spaced repetition
│   ├── models/              # SQLAlchemy models
│   │   ├── cognitive.py     # Cognitive profiles, debates, exams
│   │   ├── concept.py       # Concepts & assessments
│   │   ├── knowledge_graph.py # Graph edges & clusters
│   │   ├── mastery.py       # Mastery logs
│   │   ├── question.py      # Questions & attempts
│   │   └── user.py          # User accounts
│   ├── services/            # Business logic
│   │   ├── ai_service.py    # OpenAI/Azure OpenAI integration
│   │   ├── cognitive_engine.py # Cognitive analysis
│   │   ├── concept_graph.py # Knowledge graph engine
│   │   ├── exam_predictor.py # Score prediction
│   │   ├── mastery_calculator.py # Mastery algorithms
│   │   └── spaced_repetition.py # SM-2 algorithm
│   └── core/                # Config & database
├── frontend/
│   ├── app/                 # Next.js 16 pages
│   ├── components/
│   │   ├── cognitive/       # Cognitive profile UI
│   │   ├── debate/          # Debate tutor UI
│   │   ├── exam/            # Exam simulation UI
│   │   ├── institutional/   # Class dashboard UI
│   │   ├── knowledge-graph/ # Graph visualization
│   │   └── ...              # 30+ components
│   ├── lib/
│   │   └── api.ts           # Type-safe API client (48 methods)
│   └── types/               # TypeScript definitions
└── docs/                    # Documentation

```

---

## 🛠️ Technology Stack

### Backend
- **Framework:** FastAPI 0.115+
- **Database:** SQLAlchemy ORM with SQLite (development) / PostgreSQL (production)
- **Authentication:** JWT tokens with python-jose
- **AI Integration:** OpenAI GPT-4 / Azure OpenAI
- **Password Hashing:** bcrypt 4.0+
- **CORS:** Configurable cross-origin support

### Frontend
- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS 3.4+
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** React Context + Hooks
- **API Client:** Type-safe fetch wrapper with 48+ methods

### Algorithms & Intelligence
- **Mastery Calculation:** Multi-factor scoring (correctness, hints, time, confidence, attempts)
- **Spaced Repetition:** SM-2 algorithm with decay curve modeling
- **Cognitive Analysis:** Pattern recognition, error clustering, behavioral metrics
- **Knowledge Graph:** Topological sorting, dependency propagation, weak root detection
- **Exam Prediction:** Linear regression on mastery trends with decay slope analysis

---

## 📊 API Reference

### Authentication
- `POST /api/auth/register` — Create new account
- `POST /api/auth/login` — Get JWT token
- `GET /api/auth/me` — Get current user

### Cognitive Intelligence
- `GET /api/cognitive/profile` — Full cognitive profile
- `GET /api/cognitive/learning-dna` — Personalized learning DNA report
- `POST /api/cognitive/emotional-state` — Record emotional state
- `GET /api/cognitive/emotional-history` — Confidence growth timeline
- `GET /api/cognitive/confidence-growth` — Aggregated confidence trends

### Knowledge Graph
- `GET /api/knowledge-graph/graph` — Full concept graph with mastery
- `GET /api/knowledge-graph/dependency-scores` — Concept dependency rankings
- `GET /api/knowledge-graph/gap-propagation` — Cascading gap analysis
- `GET /api/knowledge-graph/weak-root/{id}` — Find root causes of weak mastery
- `POST /api/knowledge-graph/edges` — Add concept relationships

### Exam Readiness
- `POST /api/exam/predict` — Predict exam scores
- `POST /api/exam/simulations` — Create timed exam simulation
- `POST /api/exam/simulations/{id}/answer` — Submit exam answer
- `POST /api/exam/simulations/{id}/finish` — Complete exam with full breakdown

### AI Debate
- `POST /api/debate/start` — Start new debate session
- `POST /api/debate/{id}/turn` — Submit debate argument
- `POST /api/debate/{id}/resolve` — Finish and score debate
- `GET /api/debate/history` — Past debate sessions

### Practice & Learning
- `GET /api/diagnostic/concepts` — Available concepts
- `POST /api/diagnostic/assess-multi` — Multi-concept diagnostic
- `GET /api/practice/questions` — Get practice questions
- `POST /api/practice/attempts` — Submit practice answer
- `POST /api/hints/get` — Request stepwise hint
- `GET /api/mastery/dashboard` — Mastery overview
- `POST /api/mastery/update` — Update mastery score

### Institutional
- `GET /api/institutional/class-analytics` — Class-level heatmaps
- `GET /api/institutional/student/{id}/summary` — Student deep dive
- `GET /api/institutional/leaderboard` — XP-based rankings

**Full API Docs:** http://localhost:8000/docs (when server is running)

---

## 🔐 Environment Configuration

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=sqlite:///./edgelearn.db

# JWT Authentication
SECRET_KEY=your-secret-key-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# AI Service (choose one)
OPENAI_API_KEY=sk-...                      # OpenAI
# OR
AZURE_OPENAI_ENDPOINT=https://...          # Azure OpenAI
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# Server
DEBUG=True
PORT=8000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# CORS
CORS_ORIGINS=http://localhost:3000
```

See [`.env.example`](.env.example) for complete configuration options.

---

## 🎯 Use Cases

### For Students
- **Adaptive Practice:** Get questions matched to your skill level
- **Smart Hints:** Receive progressive guidance without spoilers
- **Exam Prep:** Predict scores and run timed simulations
- **Debate Training:** Sharpen critical thinking through AI debates
- **Learning Insights:** Understand your cognitive strengths and weaknesses

### For Educators
- **Rubric Grading:** Explainable AI scoring for essays and code
- **Progress Tracking:** Monitor student mastery across topics
- **Early Intervention:** Identify at-risk students before they fall behind
- **Class Analytics:** Concept-level heatmaps for entire classes

### For Institutions
- **Multilingual Support:** Serve diverse student populations
- **Data-Driven Insights:** Institutional dashboards for decision-making
- **Academic Integrity:** Built-in originality checks and citation tools
- **Scalable Architecture:** SQLite → PostgreSQL migration path

---

## 📚 Documentation

- **[Setup Guide](SETUP.md)** — Complete installation and configuration
- **[API Reference](API.md)** — Endpoint specifications and examples
- **[Contributing](CONTRIBUTING.md)** — Development guidelines

---

## 🧪 Testing

The system includes comprehensive testing:

```bash
# Backend tests
cd backend
pytest

# Frontend build verification
cd frontend
npm run build
```

All 60 API endpoints are tested and validated. Frontend builds without TypeScript errors.

---

## 🚢 Deployment

### Backend (Railway / Render)
1. Connect GitHub repository
2. Set environment variables from `.env.example`
3. Deploy with Python 3.11+ runtime
4. Run migrations: `alembic upgrade head`

### Frontend (Vercel)
1. Connect GitHub repository
2. Set `NEXT_PUBLIC_API_URL` to production backend
3. Deploy with Node.js 18+ runtime

### Database (Supabase / PostgreSQL)
1. Create PostgreSQL database
2. Update `DATABASE_URL` in `.env`
3. Run migrations to create tables

See [SETUP.md](SETUP.md) for detailed deployment instructions.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code style guidelines
- Pull request process
- Development workflow
- Testing requirements

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

**Built with:**
- FastAPI for high-performance async Python
- Next.js for modern React with App Router
- OpenAI GPT-4 for natural language understanding
- shadcn/ui for beautiful, accessible components

**Inspired by:**
- Cognitive Load Theory (Sweller)
- Bloom's Taxonomy of Learning
- Spaced Repetition research (Wozniak & Gorzelanczyk)
- Metacognitive learning strategies

---

## 💡 Future Roadmap

- [ ] Voice-based learning interactions
- [ ] Progressive Web App (offline mode)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics with ML-based insights
- [ ] Collaborative learning features
- [ ] LMS integrations (Canvas, Moodle)

---

**EdgeLearn AI — empowering learners at the edge of knowledge.**
