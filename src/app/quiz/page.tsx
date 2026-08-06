import { getQuizSets } from "@/lib/quiz/data";
import {
  QuizSetCard,
  QuizSetCardHeader,
  QuizSetCardStats,
  QuizSetCardTags,
  QuizSetCardFooter,
  QuizSetCardAction,
} from "@/components/quiz/quiz-set-card";
import { QuizImporter } from "@/components/quiz/quiz-importer";
import { importQuizSet, removeQuizSet } from "./actions";
import Link from "next/link";

export const metadata = {
  title: "答题练习",
  description: "前端知识答题练习",
};

export default async function QuizPage() {
  const sets = await getQuizSets();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-secondary flex h-8 w-8 items-center justify-center rounded">
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
          <h1 className="text-foreground text-2xl font-bold tracking-tight">答题练习</h1>
        </div>
      </div>

      {sets.length === 0 ? (
        <div className="border-border text-muted-foreground flex flex-col items-center border border-dashed py-16">
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
          <p>暂无练习本</p>
          <p className="mt-1 text-sm opacity-60">可导入 JSON 文件创建练习本</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {sets.map((set) => (
            <QuizSetCard key={set.id}>
              <QuizSetCardHeader
                title={set.title}
                description={set.description}
                questionCount={set.questions.length}
              />
              <QuizSetCardStats questions={set.questions} />
              <QuizSetCardTags questions={set.questions} />
              <QuizSetCardFooter>
                <div className="flex items-center gap-2">
                  {set.source === "imported" && (
                    <form action={removeQuizSet}>
                      <input type="hidden" name="id" value={set.id} />
                      <button
                        type="submit"
                        className="border-border text-error hover:bg-error/5 focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center rounded border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
                      >
                        删除
                      </button>
                    </form>
                  )}
                </div>
                <QuizSetCardAction href={`/quiz/${set.id}`}>开始答题</QuizSetCardAction>
              </QuizSetCardFooter>
            </QuizSetCard>
          ))}
        </div>
      )}

      <div className="border-border mt-8 flex items-center justify-between border-t pt-6">
        <Link
          href="/quiz/wrong"
          className="text-foreground hover:text-info dark:hover:text-info focus-visible:outline-ring inline-flex items-center gap-2 text-sm font-medium transition-colors focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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

      <div className="mt-8">
        <h2 className="text-foreground mb-4 text-lg font-semibold">导入练习本</h2>
        <QuizImporter onImport={importQuizSet} />
      </div>
    </div>
  );
}
