import { getTodos } from "@/lib/todos";
import TodoListClient from "@/components/todo-list-client";

export const metadata = {
  title: "待办清单 - 我的博客",
};

export default async function TodosPage() {
  const todos = await getTodos();

  return (
    <main className="mx-auto min-h-[calc(100dvh-74px)] max-w-5xl px-4 pt-8 sm:px-6">
      <div className="py-4">
        <div className="mb-6 text-center ">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">待办清单</h1>
          <p className="mt-3 text-sm text-muted-foreground">记录和管理你的每日任务</p>
        </div>

        <TodoListClient initialTodos={todos} />
      </div>
    </main>
  );
}
