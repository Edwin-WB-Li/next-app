import Link from "next/link";
import { getQuizSets, getRecords } from "@/lib/quiz/data";
import {
  QuizSetCard,
  QuizSetCardHeader,
  QuizSetCardStats,
  QuizSetCardTags,
  QuizSetCardFooter,
  QuizSetCardAction,
} from "@/components/quiz/quiz-set-card";

export const metadata = {
  title: "错题本",
  description: "收录答错的题目，方便反复练习",
};

export default async function WrongBookPage() {
  const [sets, records] = await Promise.all([getQuizSets(), getRecords()]);

  const wrongIdSet = new Set<string>();
  for (const record of records) {
    for (const id of record.wrongQuestionIds) {
      wrongIdSet.add(id);
    }
  }

  const setWrongs = sets
    .map((set) => ({
      set,
      wrongCount: set.questions.filter((q) => wrongIdSet.has(q.id)).length,
    }))
    .filter(({ wrongCount }) => wrongCount > 0);

  const totalWrong = setWrongs.reduce((sum, { wrongCount }) => sum + wrongCount, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
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
        <h1 className="text-foreground text-2xl font-bold tracking-tight">错题本</h1>
        <span className="border-border bg-muted text-muted-foreground rounded border px-2 py-0.5 text-xs font-medium">
          {totalWrong} 题
        </span>
      </div>

      {setWrongs.length === 0 ? (
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
          <p>暂无错题</p>
          <p className="mt-1 text-sm opacity-60">答错的题目会自动收录到这里</p>
          <Link
            href="/quiz"
            className="bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-ring focus-visible:ring-offset-background mt-4 inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            去答题
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {setWrongs.map(({ set, wrongCount }) => {
            const wrongQuestions = set.questions.filter((q) => wrongIdSet.has(q.id));
            return (
              <QuizSetCard key={set.id}>
                <QuizSetCardHeader
                  title={set.title}
                  description={set.description}
                  questionCount={wrongCount}
                />
                <QuizSetCardStats questions={wrongQuestions} />
                <QuizSetCardTags questions={wrongQuestions} />
                <QuizSetCardFooter>
                  <QuizSetCardAction href={`/quiz/wrong/${set.id}`}>复习错题</QuizSetCardAction>
                </QuizSetCardFooter>
              </QuizSetCard>
            );
          })}
        </div>
      )}

      <div className="border-border mt-8 border-t pt-6">
        <Link
          href="/quiz"
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
          返回题库
        </Link>
      </div>
    </div>
  );
}
