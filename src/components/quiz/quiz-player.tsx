"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Question, QuizRecord } from "@/lib/quiz/types";
import { calculateScore } from "@/lib/quiz/score";
import { saveRecord } from "@/lib/quiz/data";
import OptionList from "./option-list";
import AnswerSheet from "./answer-sheet";

interface QuizPlayerProps {
  questions: Question[];
  quizId: string;
}

export default function QuizPlayer({ questions, quizId }: QuizPlayerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const currentQuestion = questions[currentIndex];
  const total = questions.length;

  const answeredCount = useMemo(
    () => questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length,
    [answers, questions]
  );

  const handleAnswerChange = useCallback(
    (selected: string[]) => {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: selected }));
    },
    [currentQuestion.id]
  );

  const handleToggleFlag = useCallback(() => {
    const id = currentQuestion.id;
    setFlagged((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, [currentQuestion.id]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(total - 1, i + 1));
  }, [total]);

  const handleSubmit = useCallback(
    async (force = false) => {
      if (submittingRef.current) return;

      const unanswered = questions.filter((q) => (answers[q.id]?.length ?? 0) === 0);
      if (unanswered.length > 0 && !force) {
        setShowConfirm(true);
        return;
      }

      submittingRef.current = true;
      setSubmitting(true);
      const result = calculateScore(questions, answers);
      const record: QuizRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        answers,
        score: result.score,
        wrongQuestionIds: result.wrongQuestionIds,
      };

      await saveRecord(record);
      router.push(`/quiz/${quizId}/result?record=${record.id}`);
    },
    [answers, questions, quizId, router]
  );

  // 弹窗焦点管理与 ESC 关闭
  useEffect(() => {
    if (!showConfirm) return;

    // 保存之前聚焦的元素
    previousActiveElement.current = document.activeElement as HTMLElement;

    // 将焦点转移到弹窗内第一个可聚焦元素
    const dialog = dialogRef.current;
    if (dialog) {
      const focusable = dialog.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowConfirm(false);
      }
      if (e.key === "Tab" && dialog) {
        const focusables = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // 恢复焦点
      previousActiveElement.current?.focus();
    };
  }, [showConfirm]);

  const typeLabel =
    currentQuestion.type === "single"
      ? "单选题"
      : currentQuestion.type === "multiple"
        ? "多选题"
        : "判断题";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 lg:flex-row">
      {/* 题目区域 */}
      <div className="flex-1">
        <div className="border border-border bg-card">
          {/* 题目头部 */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                {currentIndex + 1} / {total}
              </span>
              <span className="rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
                {typeLabel}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleFlag}
              className={`inline-flex items-center gap-1 text-xs font-medium transition-colors focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${
                flagged.includes(currentQuestion.id)
                  ? "text-warning dark:text-warning"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={flagged.includes(currentQuestion.id)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={flagged.includes(currentQuestion.id) ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" x2="4" y1="22" y2="15" />
              </svg>
              {flagged.includes(currentQuestion.id) ? "已标记" : "标记"}
            </button>
          </div>

          {/* 题目内容 */}
          <div className="px-5 py-5">
            <p className="text-base font-medium leading-relaxed text-foreground">
              {currentQuestion.content}
            </p>
          </div>

          {/* 选项 */}
          <div className="px-5 pb-5">
            <OptionList
              question={currentQuestion}
              selected={answers[currentQuestion.id] ?? []}
              onChange={handleAnswerChange}
            />
          </div>
        </div>

        {/* 导航按钮 */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1.5 rounded border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
              <path d="m15 18-6-6 6-6" />
            </svg>
            上一题
          </button>

          {currentIndex < total - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              下一题
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
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-describedby={answeredCount < total ? "unanswered-tip" : undefined}
            >
              {submitting ? "交卷中..." : "交卷"}
            </button>
          )}
        </div>
      </div>

      {/* 答题卡侧边栏 */}
      <aside className="w-full shrink-0 lg:w-56">
        <AnswerSheet
          questions={questions}
          answers={answers}
          flagged={flagged}
          currentIndex={currentIndex}
          onNavigate={setCurrentIndex}
        />
        <div className="mt-3 text-center text-xs text-muted-foreground">
          已答 {answeredCount} / {total} 题
        </div>
      </aside>

      {/* 未答确认弹窗 */}
      {showConfirm && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirm(false);
          }}
        >
          <div className="w-full max-w-sm border border-border bg-background p-6 shadow-lg">
            <h3 id="confirm-title" className="text-base font-semibold text-foreground">
              确认交卷？
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              你还有 {total - answeredCount} 道题目未作答，确定要交卷吗？
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                继续答题
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  handleSubmit(true);
                }}
                className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                确认交卷
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
