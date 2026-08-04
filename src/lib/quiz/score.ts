import { Question, ScoringResult } from "./types";

export function calculateScore(
  questions: Question[],
  answers: Record<string, string[]>
): ScoringResult {
  let score = 0;
  let correctCount = 0;
  const wrongQuestionIds: string[] = [];
  const details: Record<string, boolean> = {};

  for (const question of questions) {
    const userAnswer = answers[question.id] ?? [];
    const isCorrect = isAnswerCorrect(question, userAnswer);
    details[question.id] = isCorrect;

    if (isCorrect) {
      score += 1;
      correctCount += 1;
    } else {
      wrongQuestionIds.push(question.id);
    }
  }

  return {
    score,
    total: questions.length,
    correctCount,
    wrongQuestionIds,
    details,
  };
}

function isAnswerCorrect(question: Question, userAnswer: string[]): boolean {
  if (userAnswer.length === 0) return false;

  const correct = question.correctAnswers;
  if (userAnswer.length !== correct.length) return false;

  const userSet = new Set(userAnswer);
  for (const id of correct) {
    if (!userSet.has(id)) return false;
  }

  return true;
}
