import { getQuestions } from "@/lib/quiz/data";
import QuizCard from "@/components/quiz/quiz-card";
import Link from "next/link";

export const metadata = {
  title: "答题练习",
  description: "前端知识答题练习",
};

export default async function QuizPage() {
  const questions = await getQuestions();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-secondary-foreground"
            aria-hidden="true"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          答题练习
        </h1>
      </div>

      {questions.length === 0 ? (
        <div className="flex flex-col items-center border border-dashed border-border py-16 text-muted-foreground">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mb-3 opacity-50"
            aria-hidden="true"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
          </svg>
          <p>暂无题目</p>
          <p className="mt-1 text-sm opacity-60">请在 data/quiz/questions.json 中添加题目</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          <QuizCard
            id="default"
            title="前端基础综合练习"
            description="涵盖 JavaScript、TypeScript、React、CSS、HTTP 等前端核心知识点"
            questions={questions}
          />
        </div>
      )}

      <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
        <Link
          href="/quiz/wrong"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-info dark:hover:text-info focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          前往错题本
        </Link>
      </div>
    </div>
  );
}
