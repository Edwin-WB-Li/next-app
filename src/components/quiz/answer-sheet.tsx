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
    <nav className="border-border bg-card border" aria-label="答题卡">
      <div className="border-border border-b px-4 py-3">
        <h3 className="text-foreground text-sm font-semibold">答题卡</h3>
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
              className={`flex h-9 items-center justify-center border text-sm font-medium ${isCurrent ? "text-foreground border-sky-500 bg-sky-500/10" : ""} ${!isCurrent && isAnswered ? "border-border bg-foreground text-background" : ""} ${!isCurrent && !isAnswered && !isFlagged ? "border-border bg-card text-foreground" : ""} ${!isCurrent && isFlagged && !isAnswered ? "border-warning/60 bg-card text-warning dark:text-warning" : ""} `}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="border-border text-muted-foreground flex flex-wrap gap-3 border-t px-4 py-3 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="border-border bg-foreground h-3 w-3 border" />
          已答
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="border-border bg-card h-3 w-3 border" />
          未答
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="border-warning/60 bg-card h-3 w-3 border" />
          标记
        </span>
      </div>
    </nav>
  );
}

export default memo(AnswerSheet);
