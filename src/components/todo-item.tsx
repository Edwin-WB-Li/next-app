"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import type { Todo } from "@/lib/todos";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(d.getTime());
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "明天";
  if (diffDays === -1) return "昨天";
  if (diffDays < 0) return `${Math.abs(diffDays)}天前截止`;
  return `${diffDays}天后`;
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconUndo({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function IconPencil({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

export default function TodoItem({
  todo,
  onToggle,
  onUpdateTitle,
  onDelete,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleToggle = useCallback(() => {
    startTransition(() => {
      onToggle(todo.id);
    });
  }, [todo.id, onToggle]);

  const handleSave = useCallback(() => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== todo.title) {
      startTransition(() => {
        onUpdateTitle(todo.id, trimmed);
      });
    }
    setIsEditing(false);
  }, [editTitle, todo.id, todo.title, onUpdateTitle]);

  const handleCancel = useCallback(() => {
    setEditTitle(todo.title);
    setIsEditing(false);
  }, [todo.title]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSave();
      if (e.key === "Escape") handleCancel();
    },
    [handleSave, handleCancel]
  );

  const handleDelete = useCallback(() => {
    startTransition(() => {
      onDelete(todo.id);
    });
  }, [todo.id, onDelete]);

  const dueText = formatDate(todo.dueDate);
  const isOverdue =
    todo.dueDate &&
    !todo.completed &&
    new Date(todo.dueDate).getTime() <
      new Date(new Date().setHours(0, 0, 0, 0)).getTime();

  return (
    <div
      className={`group flex items-center gap-3 rounded-xl border border-l-[3px] bg-card px-4 py-3.5 shadow-sm motion-safe:transition-all motion-safe:duration-200 hover:shadow-md ${
        todo.completed ? "border-border/60 opacity-70" : "border-border"
      }`}
      style={{
        borderLeftColor:
          todo.priority === "high"
            ? "#f87171"
            : todo.priority === "medium"
            ? "#fbbf24"
            : "#7dd3fc",
      }}
    >
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              disabled={isPending}
              className="h-8"
              aria-label="编辑待办事项"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={todo.completed || isPending}
            className={`block w-full text-left text-sm leading-relaxed focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              todo.completed
                ? "text-muted-foreground line-through"
                : "text-foreground"
            } ${todo.completed ? "" : "cursor-text"}`}
            aria-label={todo.completed ? undefined : "点击编辑"}
          >
            {todo.title}
          </button>
        )}

        {dueText ? (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  todo.priority === "high"
                    ? "#f87171"
                    : todo.priority === "medium"
                    ? "#fbbf24"
                    : "#7dd3fc",
              }}
              aria-hidden="true"
            />
            <span
              className={`text-[11px] font-medium ${
                isOverdue ? "text-red-500" : "text-muted-foreground/70"
              }`}
            >
              {dueText}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          aria-label={todo.completed ? "标记为未完成" : "标记为完成"}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {todo.completed ? <IconUndo /> : <IconCheck />}
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={todo.completed || isPending}
          aria-label="编辑"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
        >
          <IconPencil />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="删除"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
}
