"use client";

import type { Todo } from "@/lib/todos";
import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { formatDueDate } from "@/shared/utils/date";
import { IconCheck, IconUndo, IconPencil, IconTrash } from "@/shared/components/icons";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onUpdateTitle, onDelete }: TodoItemProps) {
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

  const dueText = formatDueDate(todo.dueDate);
  const isOverdue =
    todo.dueDate &&
    !todo.completed &&
    new Date(todo.dueDate).getTime() < new Date(new Date().setHours(0, 0, 0, 0)).getTime();

  return (
    <div
      className={`group bg-card flex items-center gap-3 rounded-xl border border-l-[3px] px-4 py-3.5 shadow-sm hover:shadow-md motion-safe:transition-all motion-safe:duration-200 ${
        todo.completed ? "border-border/60 opacity-70" : "border-border"
      }`}
      style={{
        borderLeftColor:
          todo.priority === "high" ? "#f87171" : todo.priority === "medium" ? "#fbbf24" : "#7dd3fc",
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
            className={`focus-visible:ring-ring block w-full text-left text-sm leading-relaxed focus-visible:rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
              todo.completed ? "text-muted-foreground line-through" : "text-foreground"
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
          className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-safe:transition-colors motion-safe:duration-200"
        >
          {todo.completed ? <IconUndo /> : <IconCheck />}
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={todo.completed || isPending}
          aria-label="编辑"
          className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 motion-safe:transition-colors motion-safe:duration-200"
        >
          <IconPencil />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="删除"
          className="text-muted-foreground hover:bg-muted hover:text-destructive focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-safe:transition-colors motion-safe:duration-200"
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
}
