"use client";

import Link from "next/link";
import { Question } from "@/lib/quiz/types";

interface QuizCardProps {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

function DifficultyBadge({ level }: { level: string }) {
  const labelMap: Record<string, string> = {
    easy: "易",
    medium: "中",
    hard: "难",
  };
  return (
    <span className="border-border text-muted-foreground inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium">
      {labelMap[level] ?? level}
    </span>
  );
}

export default function QuizCard({ id, title, description, questions }: QuizCardProps) {
  const total = questions.length;
  const difficultyCount = questions.reduce(
    (acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const typeCount = questions.reduce(
    (acc, q) => {
      const label = q.type === "single" ? "单选" : q.type === "multiple" ? "多选" : "判断";
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="border-border bg-card flex flex-col border">
      <div className="border-border flex items-start justify-between border-b px-5 py-4">
        <div>
          <h3 className="text-foreground text-base font-semibold">{title}</h3>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        <span className="border-border bg-muted text-muted-foreground shrink-0 rounded border px-2 py-1 text-xs font-medium">
          {total} 题
        </span>
      </div>

      <div className="border-border text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 border-b px-5 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground/60 text-xs">难度</span>
          <div className="flex gap-1.5">
            {Object.entries(difficultyCount).map(([level]) => (
              <DifficultyBadge key={level} level={level} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground/60 text-xs">题型</span>
          <div className="flex gap-2">
            {Object.entries(typeCount).map(([type, count]) => (
              <span key={type} className="text-xs">
                {type} {count} 题
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex flex-wrap gap-1.5">
          {Array.from(new Set(questions.flatMap((q) => q.tags)))
            .slice(0, 6)
            .map((tag) => (
              <span
                key={tag}
                className="bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 text-[11px]"
              >
                {tag}
              </span>
            ))}
        </div>
        <Link
          href={`/quiz/${id}`}
          className="bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center gap-1.5 rounded px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          开始答题
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
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
