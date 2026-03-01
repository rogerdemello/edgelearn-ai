/**
 * API client for EdgeLearn AI backend.
 * Base URL: NEXT_PUBLIC_API_URL or http://localhost:8000
 */

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

export const getApiUrl = () => getBaseUrl();

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("edgelearn_token");
}

// ─── Response types ────────────────────────────────────────
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface MeResponse {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  name: string;
  level: number;
  totalXp: number;
  preferred_language: string;
}

export interface ConceptItem {
  id: number;
  title: string;
  description: string | null;
  subject: string;
  difficulty_level: string;
}

export interface DiagnosticResult {
  diagnosis: string;
  strong_areas: string[];
  weak_areas: string[];
  confidence: number;
  recommended_path: Record<string, unknown>[];
  mastery_scores: Record<number, number>;
}

export interface HintResult {
  hint: string;
  level: number;
  is_final: boolean;
  next_steps: string | null;
}

export interface MasteryEntry {
  concept_id: number;
  concept_title: string;
  mastery_score: number;
  confidence_score: number;
  retention_decay_score: number;
  attempts: number;
  last_practiced: string;
  next_review: string | null;
}

export interface MasteryDashboard {
  total_concepts: number;
  avg_mastery: number;
  avg_confidence: number;
  strong_areas: { concept_id: number; mastery: number }[];
  weak_areas: { concept_id: number; mastery: number }[];
}

export interface StudyPlanItem {
  concept_id: number;
  concept_title: string;
  priority: string;
  estimated_time: number;
  completed: boolean;
}

export interface StudyPlanResponse {
  plan_id: number;
  concepts: StudyPlanItem[];
  total_concepts: number;
  estimated_days: number;
  daily_study_time: number;
}

export interface DueConcept {
  concept_id: number;
  mastery_score: number;
  next_review: string | null;
}

export interface ExamReadiness {
  readiness_score: number;
  status: string;
  days_until_exam: number;
  recommendations: string[];
}

export interface RubricCriterion {
  name: string;
  score: number;
  weight: number;
  feedback: string;
}

export interface RubricResult {
  clarity_score: number;
  structure_score: number;
  reasoning_score: number;
  overall_score: number;
  feedback: string;
  suggestions?: string[];
}

export interface TranslationResult {
  translated_text: string;
  source_language: string;
  target_language: string;
}

export interface OriginalityResult {
  originality_score: number;
  flagged_sections: { text: string; reason: string }[];
  suggestions: string[];
  needs_citation: boolean;
}

export interface CitationResult {
  apa: string;
  mla: string;
  chicago: string;
  in_text_citations: string[];
}

export interface QuestionItem {
  id: number;
  concept_id: number;
  concept_title: string;
  question_text: string;
  question_type: string;
  difficulty_level: string;
}

export interface AttemptResult {
  id: number;
  question_id: number;
  score: number;
  is_correct: string;
  feedback: string;
  mastery_delta: number;
  confidence_score: number;
}

export interface AttemptHistoryItem {
  id: number;
  question_id: number;
  question_text: string;
  student_answer: string;
  score: number;
  is_correct: string;
  hint_level_used: number;
  time_taken: number | null;
  feedback: string;
  created_at: string;
}

export interface AttemptStats {
  total_attempts: number;
  correct_attempts: number;
  accuracy_rate: number;
  avg_score: number;
  avg_hints_used: number;
  avg_time_taken: number;
}

// ─── Cognitive Engine types ────────────────────────────────
export interface CognitiveProfileResponse {
  user_id: number;
  abstraction_skill: number;
  procedural_strength: number;
  retention_rate: number;
  transfer_ability: number;
  consistency_score: number;
  metacognition_score: number;
  overconfidence_index: number;
  hesitation_index: number;
  hint_dependency_index: number;
  frustration_score: number;
  error_pattern_cluster: string;
  learning_style: string;
  motivation_pattern: string;
  updated_at: string;
}

export interface LearningDNAResponse {
  learning_dna: {
    learning_type: string;
    cognitive_strengths: string[];
    cognitive_weaknesses: string[];
    optimal_session_length: string;
    ideal_difficulty: string;
    error_pattern: string;
    motivation_driver: string;
    recommendations: string[];
  };
}

export interface EmotionalStateItem {
  id: number;
  confidence_before: number;
  confidence_after: number;
  frustration_level: number;
  engagement_score: number;
  session_concept_id: number | null;
  created_at: string;
}

export interface ConfidenceGrowthItem {
  date: string;
  avg_confidence_before: number;
  avg_confidence_after: number;
  delta: number;
}

// ─── Knowledge Graph types ─────────────────────────────────
export interface KnowledgeGraphResponse {
  nodes: { id: number; title: string; subject: string; mastery: number }[];
  edges: { source: number; target: number; type: string; weight: number }[];
}

export interface DependencyScoreItem {
  concept_id: number;
  title: string;
  dependency_score: number;
}

export interface KnowledgeEdge {
  id: number;
  source_concept_id: number;
  target_concept_id: number;
  relationship_type: string;
  weight: number;
}

// ─── Exam Predictor types ──────────────────────────────────
export interface ExamPredictionResponse {
  readiness_score: number;
  predicted_score_low: number;
  predicted_score_high: number;
  status: string;
  high_risk_topics: { concept_id: number; title: string; mastery: number; risk: string }[];
  recommendations: string[];
}

export interface ExamSimulationResponse {
  id: number;
  title: string;
  status: string;
  time_limit_minutes: number;
  questions: { id: number; question_text: string; concept_id: number }[];
  answers: Record<string, unknown>[];
}

export interface ExamSimulationResult {
  simulation_id: number;
  score: number;
  total_questions: number;
  correct: number;
  time_used_seconds: number;
  breakdown: Record<string, { correct: number; total: number; score: number }>;
  stress_indicators: {
    rushed_answers: number;
    avg_time_per_question: number;
    skipped: number;
  };
}

export interface ExamSimulationSummary {
  id: number;
  title: string;
  status: string;
  score: number | null;
  created_at: string;
  completed_at: string | null;
}

// ─── AI Debate types ───────────────────────────────────────
export interface DebateSessionResponse {
  debate_id: number;
  topic: string;
  status: string;
  turns: { role: string; content: string; timestamp: string }[];
  instruction?: string;
}

export interface DebateTurnResponse {
  debate_id: number;
  latest_turn: { role: string; content: string };
  can_continue: boolean;
  turns_so_far: number;
  suggestion?: string;
}

export interface DebateResolutionResponse {
  debate_id: number;
  topic: string;
  status: string;
  resolution: string;
  scores: {
    critical_thinking: number;
    argument_quality: number;
    evidence_usage: number;
    metacognition: number;
    overall: number;
  };
  turns: { role: string; content: string; timestamp: string }[];
  total_student_arguments: number;
}

export interface DebateHistoryItem {
  id: number;
  topic: string;
  status: string;
  overall_score: number | null;
  total_turns: number;
  created_at: string;
  completed_at: string | null;
}

// ─── Institutional Dashboard types ─────────────────────────
export interface ClassAnalyticsResponse {
  total_students: number;
  total_concepts: number;
  class_avg_mastery: number;
  concept_heatmap: ConceptHeatmapItem[];
  weak_concepts: ConceptHeatmapItem[];
  at_risk_students: AtRiskStudent[];
}

export interface ConceptHeatmapItem {
  concept_id: number;
  concept_title: string;
  avg_mastery: number;
  students_attempted: number;
  students_struggling: number;
  students_mastered: number;
}

export interface AtRiskStudent {
  user_id: number;
  name: string;
  avg_mastery: number;
  concepts_attempted: number;
  risk_level: string;
}

export interface StudentSummaryResponse {
  student: { id: number; name: string; email: string; level: number; total_xp: number };
  mastery_summary: { avg_mastery: number; total_concepts: number; strong: number; weak: number };
  attempt_summary: { total_attempts: number; accuracy: number; avg_hints: number };
  cognitive_profile: { learning_style: string; motivation_pattern: string; frustration_score: number; overconfidence_index: number } | null;
  concept_scores: { concept_id: number; concept_title: string; mastery: number; confidence: number }[];
}

export interface LeaderboardResponse {
  leaderboard: { rank: number; user_id: number; name: string; level: number; total_xp: number; avg_mastery: number; concepts_mastered: number }[];
  total_students: number;
}

// ─── HTTP helper ───────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;
  const url = `${getBaseUrl()}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  const authToken = token || getToken();
  if (authToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${authToken}`;
  }
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail?: string }).detail || "Request failed");
  }
  return res.json() as Promise<T>;
}

// ─── API methods ───────────────────────────────────────────
export const api = {
  // ── Auth ──────────────────────────────────────
  async login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email: string, name: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: name }),
    });
  },

  async me(token: string): Promise<MeResponse> {
    return request<MeResponse>("/api/auth/me", { token });
  },

  // ── Diagnostic ────────────────────────────────
  async getDiagnosticConcepts(subject?: string, difficulty?: string) {
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    if (difficulty) params.set("difficulty", difficulty);
    const qs = params.toString();
    return request<{ concepts: ConceptItem[] }>(`/api/diagnostic/concepts${qs ? `?${qs}` : ""}`);
  },

  async submitDiagnostic(concept_ids: number[], responses: { concept_id: number; response_text: string }[]) {
    return request<DiagnosticResult>("/api/diagnostic/assess-multi", {
      method: "POST",
      body: JSON.stringify({ concept_ids, responses }),
    });
  },

  // ── Hints ─────────────────────────────────────
  async getHint(assessment_id: number, student_response: string, current_hint_level: number, previous_hints: string[] = []) {
    return request<HintResult>("/api/hints/get", {
      method: "POST",
      body: JSON.stringify({ assessment_id, student_response, current_hint_level, previous_hints }),
    });
  },

  // ── Mastery ───────────────────────────────────
  async getMasteryDashboard() {
    return request<MasteryDashboard>("/api/mastery/dashboard");
  },

  async getAllMastery() {
    return request<MasteryEntry[]>("/api/mastery/all");
  },

  async updateMastery(concept_id: number, is_correct: boolean, hint_level_used: number = 0, time_taken?: number, confidence_rating?: number) {
    return request<{ message: string; mastery_log: Record<string, unknown> }>("/api/mastery/update", {
      method: "POST",
      body: JSON.stringify({ concept_id, is_correct, hint_level_used, time_taken, confidence_rating }),
    });
  },

  // ── Study Planner ─────────────────────────────
  async getDueConcepts() {
    return request<{ due_concepts: DueConcept[] }>("/api/study-planner/due-concepts");
  },

  async createStudyPlan(concept_ids: number[], exam_date?: string, daily_study_minutes?: number) {
    return request<StudyPlanResponse>("/api/study-planner/create-plan", {
      method: "POST",
      body: JSON.stringify({ concept_ids, exam_date, daily_study_minutes: daily_study_minutes ?? 60 }),
    });
  },

  async getExamReadiness(exam_date: string) {
    return request<ExamReadiness>(`/api/study-planner/exam-readiness?exam_date=${encodeURIComponent(exam_date)}`);
  },

  // ── Rubric ────────────────────────────────────
  async getRubric(assessment_id: number) {
    return request<{ rubric: Record<string, unknown> }>(`/api/rubric/assessment/${assessment_id}/rubric`);
  },

  async evaluateRubric(assessment_id: number, response_text: string) {
    return request<RubricResult>("/api/rubric/evaluate", {
      method: "POST",
      body: JSON.stringify({ assessment_id, response_text }),
    });
  },

  // ── Multilingual ──────────────────────────────
  async getLanguages() {
    return request<{ languages: { code: string; name: string }[] }>("/api/multilingual/languages");
  },

  async translate(text: string, target_language: string, source_language: string = "en") {
    return request<TranslationResult>("/api/multilingual/translate", {
      method: "POST",
      body: JSON.stringify({ text, target_language, source_language }),
    });
  },

  async setLanguage(language: string) {
    return request<{ message: string }>("/api/multilingual/set-language", {
      method: "POST",
      body: JSON.stringify({ language }),
    });
  },

  // ── Integrity ─────────────────────────────────
  async checkOriginality(text: string, reference_texts: string[] = []) {
    return request<OriginalityResult>("/api/integrity/check-originality", {
      method: "POST",
      body: JSON.stringify({ text, reference_texts }),
    });
  },

  async generateCitations(text: string, source_type: string = "web", source_url?: string) {
    return request<CitationResult>("/api/integrity/generate-citations", {
      method: "POST",
      body: JSON.stringify({ text, source_type, source_url }),
    });
  },

  // ── Practice ──────────────────────────────────
  async getQuestions(concept_id?: number, difficulty_level?: string, limit: number = 10) {
    const params = new URLSearchParams();
    if (concept_id) params.set("concept_id", concept_id.toString());
    if (difficulty_level) params.set("difficulty_level", difficulty_level);
    params.set("limit", limit.toString());
    const qs = params.toString();
    return request<QuestionItem[]>(`/api/practice/questions${qs ? `?${qs}` : ""}`);
  },

  async getQuestion(question_id: number) {
    return request<QuestionItem>(`/api/practice/questions/${question_id}`);
  },

  async submitAttempt(
    question_id: number,
    student_answer: string,
    hint_level_used: number = 0,
    hints_requested: string[] = [],
    confidence_rating?: number,
    time_taken?: number
  ) {
    return request<AttemptResult>("/api/practice/attempts", {
      method: "POST",
      body: JSON.stringify({
        question_id,
        student_answer,
        hint_level_used,
        hints_requested,
        confidence_rating,
        time_taken,
      }),
    });
  },

  async getAttemptHistory(limit: number = 20) {
    return request<{ attempts: AttemptHistoryItem[]; total: number }>(`/api/practice/attempts/history?limit=${limit}`);
  },

  async getAttemptStats() {
    return request<AttemptStats>("/api/practice/attempts/stats");
  },

  // ── Cognitive Engine ──────────────────────────
  async getCognitiveProfile() {
    return request<CognitiveProfileResponse>("/api/cognitive/profile");
  },

  async getLearningDNA() {
    return request<LearningDNAResponse>("/api/cognitive/learning-dna");
  },

  async recordEmotionalState(confidence_before: number, confidence_after: number, frustration_level: number, engagement_score: number, session_concept_id?: number) {
    return request<Record<string, unknown>>("/api/cognitive/emotional-state", {
      method: "POST",
      body: JSON.stringify({ confidence_before, confidence_after, frustration_level, engagement_score, session_concept_id }),
    });
  },

  async getEmotionalHistory(limit: number = 20) {
    return request<{ history: EmotionalStateItem[] }>(`/api/cognitive/emotional-history?limit=${limit}`);
  },

  async getConfidenceGrowth() {
    return request<{ growth_data: ConfidenceGrowthItem[] }>("/api/cognitive/confidence-growth");
  },

  // ── Knowledge Graph ───────────────────────────
  async getKnowledgeGraph() {
    return request<KnowledgeGraphResponse>("/api/knowledge-graph/graph");
  },

  async getDependencyScores() {
    return request<{ dependency_scores: DependencyScoreItem[] }>("/api/knowledge-graph/dependency-scores");
  },

  async getGapPropagation() {
    return request<{ propagation_map: Record<string, unknown> }>("/api/knowledge-graph/gap-propagation");
  },

  async getWeakRoot(concept_id: number) {
    return request<{ concept_id: number; weak_roots: unknown[] }>(`/api/knowledge-graph/weak-root/${concept_id}`);
  },

  async addKnowledgeEdge(source_concept_id: number, target_concept_id: number, relationship_type: string = "prerequisite", weight: number = 1.0) {
    return request<Record<string, unknown>>("/api/knowledge-graph/edges", {
      method: "POST",
      body: JSON.stringify({ source_concept_id, target_concept_id, relationship_type, weight }),
    });
  },

  async getKnowledgeEdges() {
    return request<{ edges: KnowledgeEdge[] }>("/api/knowledge-graph/edges");
  },

  // ── Exam Predictor ────────────────────────────
  async predictExamScore(concept_ids?: number[]) {
    return request<ExamPredictionResponse>("/api/exam/predict", {
      method: "POST",
      body: JSON.stringify({ concept_ids }),
    });
  },

  async startExamSimulation(title: string, concept_ids: number[], time_limit_minutes: number = 60) {
    return request<ExamSimulationResponse>("/api/exam/simulations", {
      method: "POST",
      body: JSON.stringify({ title, concept_ids, time_limit_minutes }),
    });
  },

  async answerExamQuestion(sim_id: number, question_id: number, student_answer: string, time_spent_seconds: number = 0) {
    return request<Record<string, unknown>>(`/api/exam/simulations/${sim_id}/answer`, {
      method: "POST",
      body: JSON.stringify({ question_id, student_answer, time_spent_seconds }),
    });
  },

  async finishExamSimulation(sim_id: number) {
    return request<ExamSimulationResult>(`/api/exam/simulations/${sim_id}/finish`, {
      method: "POST",
    });
  },

  async getExamSimulations() {
    return request<{ simulations: ExamSimulationSummary[] }>("/api/exam/simulations");
  },

  async getExamSimulation(sim_id: number) {
    return request<ExamSimulationResponse>(`/api/exam/simulations/${sim_id}`);
  },

  // ── AI Debate Tutor ───────────────────────────
  async startDebate(topic: string, concept_id?: number, student_position?: string) {
    return request<DebateSessionResponse>("/api/debate/start", {
      method: "POST",
      body: JSON.stringify({ topic, concept_id, student_position }),
    });
  },

  async submitDebateTurn(debate_id: number, student_argument: string) {
    return request<DebateTurnResponse>(`/api/debate/${debate_id}/turn`, {
      method: "POST",
      body: JSON.stringify({ student_argument }),
    });
  },

  async resolveDebate(debate_id: number) {
    return request<DebateResolutionResponse>(`/api/debate/${debate_id}/resolve`, {
      method: "POST",
    });
  },

  async getDebateHistory(limit: number = 10) {
    return request<{ debates: DebateHistoryItem[] }>(`/api/debate/history?limit=${limit}`);
  },

  // ── Institutional Dashboard ───────────────────
  async getClassAnalytics() {
    return request<ClassAnalyticsResponse>("/api/institutional/class-analytics");
  },

  async getStudentSummary(user_id: number) {
    return request<StudentSummaryResponse>(`/api/institutional/student/${user_id}/summary`);
  },

  async getLeaderboard(limit: number = 20) {
    return request<LeaderboardResponse>(`/api/institutional/leaderboard?limit=${limit}`);
  },
};
