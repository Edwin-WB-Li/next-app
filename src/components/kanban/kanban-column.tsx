"use client";

// import * as React from "react";
import { useState, useEffect, useCallback, useRef, memo ,type KeyboardEvent} from "react";

import { Droppable } from "@hello-pangea/dnd";
import { Plus, MoreHorizontal, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { TaskCard } from "./task-card";
import { useKanbanBoard } from "./kanban-board-context";
import type { KanbanColumn as KanbanColumnType, KanbanTask } from "@/lib/kanban-types";
import { createTask } from "@/lib/kanban";

interface KanbanColumnProps {
  column: KanbanColumnType;
  tasks: KanbanTask[];
}

export const KanbanColumn = memo(function KanbanColumn({
  column,
  tasks,
}: KanbanColumnProps) {
  const { onSettingsClick, onTaskCreated } = useKanbanBoard();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const wipExceeded = column.wipLimit !== null && tasks.length > column.wipLimit;

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  const handleQuickAdd = useCallback(async () => {
    if (!newTitle.trim()) {
      setIsAdding(false);
      return;
    }
    setSubmitting(true);
    try {
      await createTask({
        title: newTitle.trim(),
        columnId: column.id,
      });
      setNewTitle("");
      setIsAdding(false);
      onTaskCreated();
    } finally {
      setSubmitting(false);
    }
  }, [newTitle, column.id, onTaskCreated]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleQuickAdd();
      }
      if (e.key === "Escape") {
        setIsAdding(false);
        setNewTitle("");
      }
    },
    [handleQuickAdd]
  );

  return (
    <div
      className={`
        group/column flex flex-col w-[280px] shrink-0 rounded-xl
        motion-safe:transition-all motion-safe:duration-200
        ${wipExceeded ? "ring-1 ring-red-400/40" : ""}
      `}
    >
      {/* 列头部 */}
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* 列名前的彩色指示 */}
          <div className="h-2.5 w-2.5 rounded-sm bg-primary/80 shrink-0" />
          <h3 className="text-sm font-bold text-foreground tracking-tight truncate">
            {column.name}
          </h3>
          <span
            className={`
              inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-[11px] font-bold
              shrink-0 transition-colors
              ${wipExceeded
                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                : "bg-secondary/80 text-secondary-foreground/80"
              }
            `}
          >
            {tasks.length}
            {column.wipLimit !== null ? (
              <span className="text-muted-foreground/60 font-normal">/{column.wipLimit}</span>
            ) : null}
          </span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover/column:opacity-100 focus-within:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsAdding(true)}
            aria-label="在此列添加任务"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="列操作菜单"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onSettingsClick(column)}>
                <Settings className="h-3.5 w-3.5 mr-2" />
                列设置
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 任务列表区域 */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              space-y-2.5 min-h-[100px] rounded-xl
              motion-safe:transition-colors motion-safe:duration-200
              ${snapshot.isDraggingOver
                ? "bg-primary/[0.04] ring-1 ring-primary/20"
                : "bg-muted/40"
              }
              p-2
            `}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}

            {/* 快速添加 */}
            {isAdding ? (
              <div className="rounded-xl border bg-card p-2.5 shadow-sm">
                <Input
                  ref={inputRef}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={(e) => {
                    // 如果焦点移动到按钮上，不要关闭输入框
                    const related = e.relatedTarget as HTMLElement | null;
                    if (related && e.currentTarget.parentElement?.contains(related)) {
                      return;
                    }
                    if (!newTitle.trim()) setIsAdding(false);
                  }}
                  placeholder="输入任务标题，按回车确认"
                  className="h-8 text-sm border-transparent bg-transparent focus-visible:ring-1 px-2"
                  disabled={submitting}
                />
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    className="h-7 text-xs px-3"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleQuickAdd}
                    disabled={submitting}
                  >
                    {submitting ? "..." : "添加"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setIsAdding(false);
                      setNewTitle("");
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground/70 transition-all hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
                aria-label="添加卡片"
              >
                <Plus className="h-3 w-3" />
                添加卡片
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
})