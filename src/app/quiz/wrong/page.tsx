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
          {wrongQuestions.length} 题
        </span>
      </div>

      {wrongQuestions.length === 0 ? (
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
        <div className="flex flex-col gap-5">
          {wrongQuestions.map((question, index) => (
            <div key={question.id} className="border-border bg-card border">
              <div className="border-border flex items-center justify-between border-b px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-foreground text-sm font-medium">{index + 1}.</span>
                  <span className="border-border text-muted-foreground rounded border px-1.5 py-0.5 text-[11px]">
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
                    className="text-muted-foreground hover:text-success dark:hover:text-success focus-visible:outline-ring inline-flex items-center gap-1 text-xs font-medium transition-colors focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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
                <p className="text-foreground text-sm font-medium">{question.content}</p>
              </div>

              <div className="px-5 pb-4">
                <OptionList question={question} selected={question.correctAnswers} review />
              </div>

              <div className="border-border bg-muted/30 border-t px-5 py-3">
                <p className="text-muted-foreground text-sm">
                  <span className="text-foreground font-medium">解析：</span>
                  {question.explanation}
                </p>
              </div>
            </div>
          ))}
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
