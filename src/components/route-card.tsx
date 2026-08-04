"use client";

import type { HikingRoute } from "@/lib/hiking";
import { useState } from "react";

interface RouteCardProps {
  route: HikingRoute;
  index: number;
}

const difficultyConfig = {
  休闲: {
    bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  进阶: {
    bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  硬核: {
    bg: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
    dot: "bg-red-500",
  },
};

export default function RouteCard({ route, index }: RouteCardProps) {
  const [expanded, setExpanded] = useState(index === 0);
  const diff = difficultyConfig[route.difficulty];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* 头部信息 */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between p-5 text-left motion-safe:transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--hiking-primary-light)] text-sm font-bold text-[var(--hiking-primary)]">
            {index + 1}
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">{route.name}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {route.date} · {route.season}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${diff.bg}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${diff.dot}`} />
            {route.difficulty}
          </span>
          <svg
            className={`h-5 w-5 text-muted-foreground motion-safe:transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {/* 展开内容 */}
      {expanded && (
        <div className="border-t border-border px-5 pb-5">
          {/* 数据网格 */}
          <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">往返天数</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {route.days}
                <span className="ml-0.5 text-xs font-normal text-muted-foreground">天</span>
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">全程距离</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {route.distance}
                <span className="ml-0.5 text-xs font-normal text-muted-foreground">km</span>
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">最高海拔</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {route.maxAltitude}
                <span className="ml-0.5 text-xs font-normal text-muted-foreground">m</span>
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">出行季节</p>
              <p className="mt-1 text-lg font-bold text-foreground">{route.season}</p>
            </div>
          </div>

          {/* 标签 */}
          {route.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-4">
              {route.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-[var(--hiking-border)] bg-[var(--hiking-muted)] px-2 py-0.5 text-xs text-[var(--hiking-primary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
