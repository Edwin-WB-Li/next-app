import { notFound } from "next/navigation";
import { getQuestions } from "@/lib/quiz/data";
import QuizPlayer from "@/components/quiz/quiz-player";

export const metadata = {
  title: "答题中",
};

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const questions = await getQuestions();

  if (questions.length === 0) {
    notFound();
  }

  return <QuizPlayer questions={questions} quizId={id} />;
}
