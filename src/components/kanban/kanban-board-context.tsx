"use client";

import type { KanbanTask, KanbanColumn, KanbanUser } from "@/lib/kanban-types";
import { createContext, ReactNode, useContext } from "react";

interface KanbanBoardContextValue {
  users: KanbanUser[];
  onTaskClick: (task: KanbanTask) => void;
  onSettingsClick: (column: KanbanColumn) => void;
  onTaskCreated: () => void;
}

const KanbanBoardContext = createContext<KanbanBoardContextValue | null>(null);

export function KanbanBoardProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: KanbanBoardContextValue;
}) {
  return <KanbanBoardContext.Provider value={value}>{children}</KanbanBoardContext.Provider>;
}

export function useKanbanBoard() {
  const ctx = useContext(KanbanBoardContext);
  if (!ctx) {
    throw new Error("useKanbanBoard must be used within KanbanBoardProvider");
  }
  return ctx;
}
