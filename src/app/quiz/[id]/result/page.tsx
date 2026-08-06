import { notFound } from "next/navigation";
import { getQuizSetById, getRecordById } from "@/lib/quiz/data";
import { calculateScore } from "@/lib/quiz/score";
import Link from "next/link";
import OptionList from "@/components/quiz/option-list";
import QuizMarkdown from "@/components/quiz/quiz-markdown";

export const metadata = {
  title: "答题结果",
};

export default async function QuizResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ record?: string }>;
}) {
  const { id: quizId } = await params;
  const { record: recordId } = await searchParams;

  if (!recordId) {
    notFound();
  }

  const [quizSet, record] = await Promise.all([getQuizSetById(quizId), getRecordById(recordId)]);

  if (!record || !quizSet || quizSet.questions.length === 0) {
    notFound();
  }

  const questions = quizSet.questions;

  // 总览数据使用 record 中保存的历史结果，确保题目更新后得分仍准确
  const totalAtTime = record.score + record.wrongQuestionIds.length;
  const correctRate = totalAtTime > 0 ? Math.round((record.score / totalAtTime) * 100) : 0;

  // 逐题解析基于当前题库重新计算对错状态（用于展示）
  const result = calculateScore(questions, record.answers);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      {/* 结果概览 */}
      <div className="border-border bg-card mb-8 border">
        <div className="border-border border-b px-5 py-4">
          <h1 className="text-foreground text-xl font-bold">答题结果</h1>
        </div>
        <div className="grid grid-cols-2 gap-4 px-5 py-6 sm:grid-cols-4">
          <div className="border-border flex flex-col items-center border-r py-2">
            <span className="text-foreground text-3xl font-bold sm:text-4xl">{record.score}</span>
            <span className="text-muted-foreground mt-2 text-xs">得分</span>
          </div>
          <div className="border-border flex flex-col items-center border-r py-2">
            <span className="text-foreground text-3xl font-bold sm:text-4xl">{correctRate}%</span>
            <span className="text-muted-foreground mt-2 text-xs">正确率</span>
          </div>
          <div className="border-border flex flex-col items-center border-r py-2">
            <span className="text-foreground text-3xl font-bold sm:text-4xl">
              {record.score}/{totalAtTime}
            </span>
            <span className="text-muted-foreground mt-2 text-xs">答对题数</span>
          </div>
          <div className="flex flex-col items-center py-2">
            <span className="text-foreground text-3xl font-bold sm:text-4xl">
              {record.wrongQuestionIds.length}
            </span>
            <span className="text-muted-foreground mt-2 text-xs">错题数</span>
          </div>
        </div>
      </div>

      {/* 逐题解析 */}
      <div className="mb-8">
        <h2 className="text-foreground mb-4 text-lg font-bold">逐题解析</h2>
        <div className="flex flex-col gap-5">
          {questions.map((question, index) => {
            const isCorrect = result.details[question.id];
            const userAnswer = record.answers[question.id] ?? [];

            return (
              <div key={question.id} className="border-border bg-card border">
                <div className="border-border flex items-center gap-3 border-b px-5 py-3">
                  <span className="text-foreground text-sm font-medium">{index + 1}.</span>
                  {isCorrect ? (
                    <span className="text-success dark:text-success inline-flex items-center gap-1 text-xs font-medium">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      正确
                    </span>
                  ) : (
                    <span className="text-error dark:text-error inline-flex items-center gap-1 text-xs font-medium">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                      错误
                    </span>
                  )}
                </div>
                <div className="px-5 py-4">
                  <QuizMarkdown
                    content={question.content}
                    className="text-foreground text-sm font-medium"
                  />
                </div>
                <div className="px-5 pb-4">
                  <OptionList question={question} selected={userAnswer} review />
                </div>
                <div className="border-border bg-muted/30 border-t px-5 py-3">
                  <div className="text-muted-foreground text-sm">
                    <span className="text-foreground font-medium">解析：</span>
                    <QuizMarkdown content={question.explanation} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部导航 */}
      <div className="border-border flex items-center justify-between border-t pt-6">
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
        <Link
          href="/quiz/wrong"
          className="text-foreground hover:text-info dark:hover:text-info focus-visible:outline-ring inline-flex items-center gap-2 text-sm font-medium transition-colors focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          查看错题本
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
        </Link>
      </div>
    </div>
  );
}
