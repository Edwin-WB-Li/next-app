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
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      {/* 头部信息 */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="hover:bg-muted/50 flex w-full items-center justify-between p-5 text-left motion-safe:transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--hiking-primary-light)] text-sm font-bold text-[var(--hiking-primary)]">
            {index + 1}
          </span>
          <div>
            <h3 className="text-foreground text-base font-semibold">{route.name}</h3>
            <p className="text-muted-foreground mt-0.5 text-sm">
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
            className={`text-muted-foreground h-5 w-5 motion-safe:transition-transform ${
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
        <div className="border-border border-t px-5 pb-5">
          {/* 数据网格 */}
          <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-muted-foreground text-xs">往返天数</p>
              <p className="text-foreground mt-1 text-lg font-bold">
                {route.days}
                <span className="text-muted-foreground ml-0.5 text-xs font-normal">天</span>
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-muted-foreground text-xs">全程距离</p>
              <p className="text-foreground mt-1 text-lg font-bold">
                {route.distance}
                <span className="text-muted-foreground ml-0.5 text-xs font-normal">km</span>
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-muted-foreground text-xs">最高海拔</p>
              <p className="text-foreground mt-1 text-lg font-bold">
                {route.maxAltitude}
                <span className="text-muted-foreground ml-0.5 text-xs font-normal">m</span>
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-muted-foreground text-xs">出行季节</p>
              <p className="text-foreground mt-1 text-lg font-bold">{route.season}</p>
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
