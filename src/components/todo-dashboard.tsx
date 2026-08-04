"use client";

import { memo } from "react";

interface TodoDashboardProps {
  total: number;
  completed: number;
}

function ProgressRing({ value }: { value: number }) {
  const size = 72;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary motion-safe:transition-all motion-safe:duration-700"
        />
      </svg>
      <span className="absolute text-sm font-semibold text-foreground">{Math.round(value)}%</span>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "早安";
  if (hour < 18) return "下午好";
  return "晚上好";
}

export default memo(function TodoDashboard({ total, completed }: TodoDashboardProps) {
  const now = new Date();
  const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const dateStr = `${now.getMonth() + 1}月${now.getDate()}日`;
  const weekStr = weekday[now.getDay()];

  const progress = total > 0 ? (completed / total) * 100 : 0;
  const remaining = total - completed;

  let statusText: string;
  if (total === 0) {
    statusText = "今天还没有待办事项";
  } else if (remaining === 0) {
    statusText = "太棒了，全部完成！";
  } else {
    statusText = `还有 ${remaining} 件事待办`;
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div>
        <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {weekStr}，{dateStr}
        </div>
        <div className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {getGreeting()}
        </div>
        <div className="mt-0.5 text-sm text-muted-foreground">{statusText}</div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ProgressRing value={progress} />
        <span className="text-[10px] font-medium text-muted-foreground">
          {completed}/{total}
        </span>
      </div>
    </div>
  );
});
