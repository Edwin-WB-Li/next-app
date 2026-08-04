"use client";

import type { KanbanTask, Priority } from "@/lib/kanban-types";
import { useKanbanBoard } from "./kanban-board-context";
import { memo, useMemo, useCallback, type KeyboardEvent } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock } from "lucide-react";

interface TaskCardProps {
  task: KanbanTask;
  index: number;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

const priorityConfig: Record<Priority, { bar: string; dot: string; label: string }> = {
  P0: {
    bar: "bg-red-500 dark:bg-red-400",
    dot: "bg-red-500 dark:bg-red-400",
    label: "紧急",
  },
  P1: {
    bar: "bg-orange-500 dark:bg-orange-400",
    dot: "bg-orange-500 dark:bg-orange-400",
    label: "高",
  },
  P2: {
    bar: "bg-blue-500 dark:bg-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
    label: "中",
  },
  P3: {
    bar: "bg-gray-400 dark:bg-gray-500",
    dot: "bg-gray-400 dark:bg-gray-500",
    label: "低",
  },
};

export const TaskCard = memo(function TaskCard({ task, index }: TaskCardProps) {
  const { users, onTaskClick } = useKanbanBoard();
  const assignee = useMemo(() => users.find((u) => u.id === task.assignee), [users, task.assignee]);
  const overdue = useMemo(() => isOverdue(task.dueDate), [task.dueDate]);
  const priority = priorityConfig[task.priority];
  const subtaskProgress = useMemo(() => {
    if (task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter((s) => s.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  }, [task.subtasks]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onTaskClick(task);
      }
    },
    [onTaskClick, task]
  );

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onTaskClick(task)}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`${task.title}，优先级${priority.label}`}
          className={`
            group relative cursor-pointer rounded-xl bg-card
            motion-safe:transition-all motion-safe:duration-200 ease-out
            motion-safe:hover:shadow-lg motion-safe:hover:-translate-y-0.5
            ${snapshot.isDragging ? "shadow-2xl rotate-1 scale-[1.03] ring-2 ring-primary/20" : "shadow-sm"}
          `}
          style={provided.draggableProps.style}
        >
          {/* 左侧优先级色条 */}
          <div
            className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${priority.bar} opacity-80`}
          />

          <div className="p-3 pl-3.5">
            {/* 顶部：标签 + 优先级 */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                {task.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary/70 px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground"
                  >
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="inline-flex items-center rounded-md bg-secondary/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 shrink-0">
                <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {task.priority}
                </span>
              </span>
            </div>

            {/* 标题 */}
            <h4 className="text-[13px] font-semibold text-card-foreground mb-2.5 line-clamp-2 leading-snug tracking-tight">
              {task.title}
            </h4>

            {/* 子任务进度 */}
            {task.subtasks.length > 0 ? (
              <div className="mb-2.5">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/80 motion-safe:transition-all motion-safe:duration-500"
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>
              </div>
            ) : null}

            {/* 底部信息行 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* 任务编号 */}
                <span className="text-[10px] font-mono text-muted-foreground/70 tracking-wider">
                  #{task.id.split("-")[1]?.toUpperCase() ?? task.id.slice(-4)}
                </span>

                {/* 截止日期 */}
                {task.dueDate ? (
                  <span
                    className={`flex items-center gap-0.5 text-[10px] font-medium ${
                      overdue ? "text-red-500 dark:text-red-400" : "text-muted-foreground/70"
                    }`}
                  >
                    <Calendar className="h-2.5 w-2.5" />
                    {formatShortDate(task.dueDate)}
                  </span>
                ) : null}

                {/* 预估工时 */}
                {task.estimatedHours ? (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
                    <Clock className="h-2.5 w-2.5" />
                    {task.estimatedHours}h
                  </span>
                ) : null}
              </div>

              {/* 负责人头像 */}
              <div className="flex -space-x-1.5">
                {assignee ? (
                  <Avatar className="h-5 w-5 ring-2 ring-card">
                    <AvatarImage src={assignee.avatar} alt={assignee.name} />
                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                      {assignee.name[0]}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-5 w-5 rounded-full bg-muted ring-2 ring-card" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
});
