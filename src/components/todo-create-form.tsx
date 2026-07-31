"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Priority } from "@/lib/todos";

interface TodoCreateFormProps {
  onCreate: (title: string, priority: Priority, dueDate: string | null) => void;
}

const priorityOptions: { value: Priority; label: string }[] = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

export default function TodoCreateForm({ onCreate }: TodoCreateFormProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = title.trim();
      if (!trimmed) return;

      startTransition(() => {
        onCreate(trimmed, priority, dueDate || null);
        setTitle("");
        setPriority("medium");
        setDueDate("");
        inputRef.current?.focus();
      });
    },
    [title, priority, dueDate, onCreate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </div>
          <Input
            ref={inputRef}
            type="text"
            placeholder="添加新的待办事项，按回车快速创建..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            className="h-10 border-0 bg-transparent text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            aria-label="待办事项内容"
          />
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex items-center gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              disabled={isPending}
              aria-label="优先级"
              className="h-8 rounded-lg border border-border/80 bg-muted/40 px-2.5 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring motion-safe:transition-colors"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}优先级
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isPending}
              aria-label="截止日期"
              className="h-8 rounded-lg border border-border/80 bg-muted/40 px-2.5 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring motion-safe:transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending || !title.trim()}
            size="sm"
            className="h-8 px-4 text-xs"
          >
            {isPending ? "添加中..." : "添加"}
          </Button>
        </div>
      </div>
    </form>
  );
}
