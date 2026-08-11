import { notFound } from "next/navigation";
import Link from "next/link";
import { getQuizSetById, getRecords, removeFromWrongBook } from "@/lib/quiz/data";
import OptionList from "@/components/quiz/option-list";
import QuizMarkdown from "@/components/quiz/quiz-markdown";

export const metadata = {
  title: "错题复习",
};

export default async function WrongSetPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const [quizSet, records] = await Promise.all([getQuizSetById(setId), getRecords()]);

  if (!quizSet) {
    notFound();
  }

  const wrongIdSet = new Set<string>();
  for (const record of records) {
    for (const id of record.wrongQuestionIds) {
      wrongIdSet.add(id);
    }
  }

  const wrongQuestions = quizSet.questions.filter((q) => wrongIdSet.has(q.id));

  if (wrongQuestions.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/quiz/wrong"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
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
          错题本
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-foreground text-xl font-bold">{quizSet.title}</h1>
        <span className="border-border bg-muted text-muted-foreground rounded border px-2 py-0.5 text-xs font-medium">
          {wrongQuestions.length} 题
        </span>
      </div>

      <div className="flex flex-col gap-8">
        {wrongQuestions.map((q, idx) => (
          <div key={q.id} className="border-border bg-card flex flex-col border">
            <div className="border-border flex items-center gap-3 border-b px-5 py-3">
              <span className="bg-muted text-muted-foreground flex h-6 w-6 items-center justify-center rounded text-xs font-medium">
                {idx + 1}
              </span>
              <span className="border-border text-muted-foreground inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium">
                {q.type === "single" ? "单选" : q.type === "multiple" ? "多选" : "判断"}
              </span>
              <span className="border-border text-muted-foreground inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium">
                {q.difficulty === "easy" ? "易" : q.difficulty === "medium" ? "中" : "难"}
              </span>
              <form action={removeFromWrongBook.bind(null, q.id)} className="ml-auto">
                <button
                  type="submit"
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  已掌握
                </button>
              </form>
            </div>

            <div className="px-5 py-4">
              <QuizMarkdown content={q.content} className="mb-4" />
              <OptionList question={q} selected={q.correctAnswers} review />
            </div>

            {q.explanation && (
              <div className="border-border border-t px-5 py-4">
                <p className="text-muted-foreground mb-2 text-xs font-medium">解析:</p>
                <QuizMarkdown content={q.explanation} className="text-muted-foreground text-sm" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
