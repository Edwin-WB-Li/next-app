export type QuestionType = "single" | "multiple" | "true_false";

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options: { id: string; text: string }[];
  correctAnswers: string[];
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

export interface QuizRecord {
  id: string;
  date: string;
  answers: Record<string, string[]>;
  score: number;
  wrongQuestionIds: string[];
}

export interface ScoringResult {
  score: number;
  total: number;
  correctCount: number;
  wrongQuestionIds: string[];
  details: Record<string, boolean>;
}
