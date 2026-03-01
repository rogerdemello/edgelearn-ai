export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  totalXp: number;
  level: number;
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  lessons: Lesson[];
  thumbnail?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  order: number;
}

export interface Practice {
  id: string;
  lessonId: string;
  type: 'quiz' | 'coding' | 'essay';
  title: string;
  questions: Question[];
  xpReward: number;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'short-answer' | 'code';
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface PracticeSession {
  id: string;
  userId: string;
  practiceId: string;
  answers: Record<string, string>;
  score: number;
  xpEarned: number;
  completedAt: Date;
  correct: number;
  total: number;
}

export interface UserProgress {
  userId: string;
  courseId: string;
  lessonsCompleted: number;
  totalLessons: number;
  practiceSessionsCompleted: number;
  averageScore: number;
  lastAccessed: Date;
}

export interface Leaderboard {
  rank: number;
  userId: string;
  userName: string;
  totalXp: number;
  level: number;
  streak: number;
}

// ─── EdgeLearn AI-specific types ─────────────────────────────

export interface Concept {
  id: number;
  title: string;
  description: string | null;
  subject: string;
  difficulty_level: string;
}

export interface MasteryEntry {
  concept_id: number;
  concept_title: string;
  mastery_score: number;
  confidence_score: number;
  attempts: number;
  last_practiced: string;
  next_review: string | null;
}

export interface MasteryDashboardData {
  total_concepts: number;
  avg_mastery: number;
  avg_confidence: number;
  strong_areas: { concept_id: number; mastery: number }[];
  weak_areas: { concept_id: number; mastery: number }[];
}

export interface DueConcept {
  concept_id: number;
  mastery_score: number;
  next_review: string | null;
}

export interface StudyPlanItem {
  concept_id: number;
  concept_title: string;
  priority: string;
  estimated_time: number;
  completed: boolean;
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

export interface OriginalityFlag {
  text: string;
  reason: string;
}
