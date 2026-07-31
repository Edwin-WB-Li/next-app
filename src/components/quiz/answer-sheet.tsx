"use client";

import { memo } from "react";

interface AnswerSheetProps {
  questions: { id: string; type: string }[];
  answers: Record<string, string[]>;
  flagged: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

function AnswerSheet({ questions, answers, flagged, currentIndex, onNavigate }: AnswerSheetProps) {
  return (
    <nav className="border border-border bg-card" aria-label="答题卡">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">答题卡</h3>
      </div>
      <div className="grid grid-cols-5 gap-2 p-4 sm:grid-cols-4">
        {questions.map((q, index) => {
          const isAnswered = (answers[q.id]?.length ?? 0) > 0;
          const isFlagged = flagged.includes(q.id);
          const isCurrent = index === currentIndex;

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onNavigate(index)}
              data-answered={isAnswered}
              data-flagged={isFlagged}
              data-current={isCurrent}
              aria-label={`第 ${index + 1} 题${isAnswered ? "，已答" : ""}${isFlagged ? "，已标记" : ""}`}
              className={`
                flex h-9 items-center justify-center text-sm font-medium
                ${isCurrent ? "border-2 border-foreground bg-muted text-foreground" : ""}
                ${!isCurrent && isAnswered ? "border border-border bg-foreground text-background" : ""}
                ${!isCurrent && !isAnswered && !isFlagged ? "border border-border bg-card text-foreground" : ""}
                ${!isCurrent && isFlagged && !isAnswered ? "border border-warning/60 bg-card text-warning dark:text-warning" : ""}
              `}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 border border-border bg-foreground" />
          已答
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 border border-border bg-card" />
          未答
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 border border-warning/60 bg-card" />
          标记
        </span>
      </div>
    </nav>
  );
}

export default memo(AnswerSheet);
