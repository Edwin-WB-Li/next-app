"use client";

import * as React from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Plus, Layout, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KanbanColumn } from "./kanban-column";
import { FilterBar, type FilterState } from "./filter-bar";
import { CreateTaskModal } from "./create-task-modal";
import { ColumnSettingsModal } from "./column-settings-modal";
import { TaskDetailDrawer } from "./task-detail-drawer";
import type { KanbanTask, KanbanColumn as KanbanColumnType } from "@/lib/kanban-types";
import { moveTask, createColumn, getBoardData } from "@/lib/kanban";
import type { BoardSnapshot } from "@/lib/kanban-types";

interface KanbanBoardProps {
  initialData: BoardSnapshot;
}

function filterTasks(tasks: KanbanTask[], filters: FilterState): KanbanTask[] {
  return tasks.filter((task) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchId = task.id.toLowerCase().includes(q);
      if (!matchTitle && !matchId) return false;
    }
    if (filters.assignees.length > 0 && !filters.assignees.includes(task.assignee ?? "")) {
      return false;
    }
    if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
      return false;
    }
    if (filters.tags.length > 0 && !task.tags.some((t) => filters.tags.includes(t))) {
      return false;
    }
    return true;
  });
}

export function KanbanBoard({ initialData }: KanbanBoardProps) {
  const [data, setData] = React.useState<BoardSnapshot>(initialData);
  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    assignees: [],
    priorities: [],
    tags: [],
  });

  const [selectedTask, setSelectedTask] = React.useState<KanbanTask | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [createDefaultColumnId, setCreateDefaultColumnId] = React.useState<string>();

  const [settingsColumn, setSettingsColumn] = React.useState<KanbanColumnType | null>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const [isAddingColumn, setIsAddingColumn] = React.useState(false);
  const [newColumnName, setNewColumnName] = React.useState("");
  const [refreshing, setRefreshing] = React.useState(false);

  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    data.tasks.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [data.tasks]);

  const sortedColumns = React.useMemo(
    () => [...data.board.columns].sort((a, b) => a.order - b.order),
    [data.board.columns]
  );

  const filteredTasks = React.useMemo(
    () => filterTasks(data.tasks, filters),
    [data.tasks, filters]
  );

  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter((t) => {
    const doneCol = sortedColumns[sortedColumns.length - 1];
    return doneCol && t.columnId === doneCol.id;
  }).length;

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const fresh = await getBoardData();
      setData(fresh);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const task = data.tasks.find((t) => t.id === draggableId);
    if (!task) return;

    const newTasks = [...data.tasks];
    const taskIndex = newTasks.findIndex((t) => t.id === draggableId);
    if (taskIndex !== -1) {
      newTasks[taskIndex] = { ...newTasks[taskIndex], columnId: destination.droppableId };
      setData((prev) => ({ ...prev, tasks: newTasks }));
    }

    try {
      await moveTask(draggableId, destination.droppableId, source.droppableId);
    } catch {
      setData((prev) => {
        const reverted = [...prev.tasks];
        const idx = reverted.findIndex((t) => t.id === draggableId);
        if (idx !== -1) {
          reverted[idx] = { ...reverted[idx], columnId: source.droppableId };
        }
        return { ...prev, tasks: reverted };
      });
    }
  };

  const handleTaskClick = (task: KanbanTask) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const handleCreateTask = (columnId?: string) => {
    setCreateDefaultColumnId(columnId);
    setCreateModalOpen(true);
  };

  const handleSettingsClick = (column: KanbanColumnType) => {
    setSettingsColumn(column);
    setSettingsOpen(true);
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) {
      setIsAddingColumn(false);
      return;
    }
    try {
      await createColumn({ name: newColumnName.trim() });
      refreshData();
      setNewColumnName("");
      setIsAddingColumn(false);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Layout className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">项目看板</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {completedTasks}/{totalTasks} 已完成
              </p>
            </div>
          </div>
          <div className="h-6 w-px bg-border" />
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium px-3"
            onClick={() => handleCreateTask()}
          >
            <Plus className="h-3.5 w-3.5" />
            新建任务
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <FilterBar
            users={data.board.users}
            allTags={allTags}
            filters={filters}
            onFiltersChange={setFilters}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={refreshData}
            disabled={refreshing}
            title="刷新"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* 看板主体 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-auto px-5 py-4">
          <div className="flex gap-5 h-full min-w-fit items-start">
            {sortedColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={filteredTasks.filter((t) => t.columnId === column.id)}
                users={data.board.users}
                onTaskClick={handleTaskClick}
                onSettingsClick={handleSettingsClick}
                onTaskCreated={refreshData}
              />
            ))}

            {/* 添加列 */}
            <div className="w-[280px] shrink-0">
              {isAddingColumn ? (
                <div className="rounded-xl border border-border bg-muted/40 p-3">
                  <Input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddColumn();
                      if (e.key === "Escape") {
                        setIsAddingColumn(false);
                        setNewColumnName("");
                      }
                    }}
                    placeholder="输入列名称"
                    className="h-8 text-sm mb-2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs" onClick={handleAddColumn}>
                      添加
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColumnName("");
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground/60 transition-all hover:bg-muted/40 hover:text-muted-foreground hover:border-border"
                >
                  <Plus className="h-4 w-4" />
                  添加列
                </button>
              )}
            </div>
          </div>
        </div>
      </DragDropContext>

      {/* 弹窗和抽屉 */}
      <CreateTaskModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        columns={sortedColumns}
        users={data.board.users}
        defaultColumnId={createDefaultColumnId}
        onCreated={refreshData}
      />

      <ColumnSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        column={settingsColumn}
        onUpdated={refreshData}
        onDeleted={refreshData}
      />

      <TaskDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        task={selectedTask}
        columns={sortedColumns}
        users={data.board.users}
        onUpdated={refreshData}
      />
    </div>
  );
}
