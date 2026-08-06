import { notFound } from "next/navigation";
import { getQuizSetById } from "@/lib/quiz/data";
import QuizPlayer from "@/components/quiz/quiz-player";

export const metadata = {
  title: "答题中",
};

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const set = await getQuizSetById(id);

  if (!set || set.questions.length === 0) {
    notFound();
  }

  return <QuizPlayer questions={set.questions} quizId={id} />;
}
