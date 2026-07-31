"use client";

import { useState, useCallback, useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import TodoCreateForm from "./todo-create-form";
import TodoItem from "./todo-item";
import TodoDashboard from "./todo-dashboard";
import type { Todo, Priority } from "@/lib/todos";

interface TodoListClientProps {
  initialTodos: Todo[];
}

type SectionKey = "overdue" | "today" | "upcoming" | "later" | "nodate";

interface SectionDef {
  key: SectionKey;
  label: string;
  accent: string;
}

const sectionDefs: SectionDef[] = [
  { key: "overdue", label: "已逾期", accent: "text-red-500" },
  { key: "today", label: "今天截止", accent: "text-foreground" },
  { key: "upcoming", label: "即将到期", accent: "text-muted-foreground" },
  { key: "later", label: "未来", accent: "text-muted-foreground" },
  { key: "nodate", label: "无截止日期", accent: "text-muted-foreground" },
];

function getSection(todo: Todo): SectionKey {
  if (!todo.dueDate) return "nodate";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(todo.dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 7) return "upcoming";
  return "later";
}

function sortTodos(todos: Todo[]): Todo[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...todos].sort((a, b) => {
    const pa = priorityOrder[a.priority];
    const pb = priorityOrder[b.priority];
    if (pa !== pb) return pa - pb;
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export default function TodoListClient({ initialTodos }: TodoListClientProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (
      state,
      action:
        | { type: "add"; todo: Todo }
        | { type: "update"; todo: Todo }
        | { type: "remove"; id: string }
    ) => {
      if (action.type === "add") return sortTodos([...state, action.todo]);
      if (action.type === "remove")
        return state.filter((t) => t.id !== action.id);
      if (action.type === "update") {
        return sortTodos(
          state.map((t) => (t.id === action.todo.id ? action.todo : t))
        );
      }
      return state;
    }
  );
  const [showCompleted, setShowCompleted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeTodos = optimisticTodos.filter((t) => !t.completed);
  const completedTodos = optimisticTodos.filter((t) => t.completed);

  const sectionItems: Record<SectionKey, Todo[]> = {
    overdue: [],
    today: [],
    upcoming: [],
    later: [],
    nodate: [],
  };
  for (const todo of activeTodos) {
    sectionItems[getSection(todo)].push(todo);
  }

  const handleCreate = useCallback(
    async (title: string, priority: Priority, dueDate: string | null) => {
      const tempTodo: Todo = {
        id: `temp-${Date.now()}`,
        title,
        completed: false,
        priority,
        dueDate,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      addOptimisticTodo({ type: "add", todo: tempTodo });

      const { createTodo } = await import("@/lib/todos");
      const newTodo = await createTodo(title, priority, dueDate);
      setTodos((prev) =>
        sortTodos([...prev.filter((t) => t.id !== tempTodo.id), newTodo])
      );
    },
    [addOptimisticTodo]
  );

  const handleToggle = useCallback(
    async (id: string) => {
      const todo = optimisticTodos.find((t) => t.id === id);
      if (!todo) return;

      const updated: Todo = {
        ...todo,
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date().toISOString() : null,
      };
      addOptimisticTodo({ type: "update", todo: updated });

      const { toggleTodo } = await import("@/lib/todos");
      const result = await toggleTodo(id);
      if (result) {
        setTodos((prev) =>
          sortTodos(prev.map((t) => (t.id === id ? result : t)))
        );
      }
    },
    [optimisticTodos, addOptimisticTodo]
  );

  const handleUpdateTitle = useCallback(
    async (id: string, title: string) => {
      const todo = optimisticTodos.find((t) => t.id === id);
      if (!todo) return;

      const updated: Todo = { ...todo, title };
      addOptimisticTodo({ type: "update", todo: updated });

      const { updateTodoTitle } = await import("@/lib/todos");
      const result = await updateTodoTitle(id, title);
      if (result) {
        setTodos((prev) =>
          sortTodos(prev.map((t) => (t.id === id ? result : t)))
        );
      }
    },
    [optimisticTodos, addOptimisticTodo]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      addOptimisticTodo({ type: "remove", id });

      const { deleteTodo } = await import("@/lib/todos");
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    },
    [addOptimisticTodo]
  );

  const handleClearCompleted = useCallback(() => {
    startTransition(async () => {
      const { deleteTodo } = await import("@/lib/todos");
      const ids = completedTodos.map((t) => t.id);
      for (const id of ids) {
        addOptimisticTodo({ type: "remove", id });
        await deleteTodo(id);
      }
      setTodos((prev) => prev.filter((t) => !t.completed));
    });
  }, [completedTodos, addOptimisticTodo]);

  const totalTodos = optimisticTodos.length;
  const completedCount = completedTodos.length;

  return (
    <div className="flex flex-col gap-6">
      <TodoDashboard total={totalTodos} completed={completedCount} />

      <TodoCreateForm onCreate={handleCreate} />

      {totalTodos === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
              aria-hidden="true"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-foreground">
            还没有待办事项
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            在上方添加一个，开始规划你的每一天
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {activeTodos.length === 0 && completedCount > 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-500"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground">
                全部完成！
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                享受你的自由时间
              </p>
            </div>
          ) : null}

          {sectionDefs.map((section) => {
            const items = sectionItems[section.key];
            if (items.length === 0) return null;
            return (
              <section key={section.key}>
                <h2
                  className={`mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase ${section.accent}`}
                >
                  <span className="h-px flex-1 bg-border" />
                  <span>{section.label}</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {items.length}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </h2>
                <div className="flex flex-col gap-2">
                  {items.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggle}
                      onUpdateTitle={handleUpdateTitle}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {completedCount > 0 ? (
            <section className="mt-2">
              <button
                type="button"
                onClick={() => setShowCompleted((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50 motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-500"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {showCompleted
                    ? "隐藏已完成"
                    : `显示 ${completedCount} 项已完成`}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`motion-safe:transition-transform motion-safe:duration-200 ${
                    showCompleted ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {showCompleted ? (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearCompleted}
                      disabled={isPending}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      清空已完成
                    </Button>
                  </div>
                  {completedTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggle}
                      onUpdateTitle={handleUpdateTitle}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
