import Link from "next/link";
import { getWrongQuestions, removeFromWrongBook } from "@/lib/quiz/data";
import OptionList from "@/components/quiz/option-list";

export const metadata = {
  title: "错题本",
  description: "收录答错的题目，方便反复练习",
};

export default async function WrongBookPage() {
  const wrongQuestions = await getWrongQuestions();

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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">错题本</h1>
        <span className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {wrongQuestions.length} 题
        </span>
      </div>

      {wrongQuestions.length === 0 ? (
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
          <p>暂无错题</p>
          <p className="mt-1 text-sm opacity-60">答错的题目会自动收录到这里</p>
          <Link
            href="/quiz"
            className="mt-4 inline-flex items-center gap-2 rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            去答题
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {wrongQuestions.map((question, index) => (
            <div key={question.id} className="border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{index + 1}.</span>
                  <span className="rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
                    {question.type === "single"
                      ? "单选"
                      : question.type === "multiple"
                        ? "多选"
                        : "判断"}
                  </span>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await removeFromWrongBook(question.id);
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-success dark:hover:text-success focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
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
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    已掌握
                  </button>
                </form>
              </div>

              <div className="px-5 py-4">
                <p className="text-sm font-medium text-foreground">{question.content}</p>
              </div>

              <div className="px-5 pb-4">
                <OptionList question={question} selected={question.correctAnswers} review />
              </div>

              <div className="border-t border-border bg-muted/30 px-5 py-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">解析：</span>
                  {question.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <Link
          href="/quiz"
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
          返回题库
        </Link>
      </div>
    </div>
  );
}
