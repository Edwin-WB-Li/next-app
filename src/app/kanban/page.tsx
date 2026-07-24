import { getBoardData } from "@/lib/kanban";
import { KanbanBoard } from "@/components/kanban/kanban-board";

export const metadata = {
  title: "看板 - 我的博客",
};

export default async function KanbanPage() {
  const data = await getBoardData();

  return (
    <main className="h-[calc(100dvh-74px)] flex flex-col">
      <KanbanBoard initialData={data} />
    </main>
  );
}
