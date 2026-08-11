"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Plus, Layout, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KanbanColumn } from "./kanban-column";
import { FilterBar } from "./filter-bar";
import { CreateTaskModal } from "./create-task-modal";
import { ColumnSettingsModal } from "./column-settings-modal";
import { TaskDetailDrawer } from "./task-detail-drawer";
import { KanbanBoardProvider } from "./kanban-board-context";
import { useKanbanFilters } from "./use-kanban-filters";
import type { KanbanTask, KanbanColumn as KanbanColumnType } from "@/lib/kanban-types";
import { moveTask, createColumn, getBoardData } from "@/lib/kanban";
import type { BoardSnapshot } from "@/lib/kanban-types";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

interface KanbanBoardProps {
  initialData: BoardSnapshot;
}

export function KanbanBoard({ initialData }: KanbanBoardProps) {
  const [data, setData] = useState<BoardSnapshot>(initialData);
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createDefaultColumnId, setCreateDefaultColumnId] = useState<string>();

  const [settingsColumn, setSettingsColumn] = useState<KanbanColumnType | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [, startTransition] = useTransition();

  const {
    filters,
    allTags,
    filteredTasks,
    toggleAssignee,
    togglePriority,
    toggleTag,
    setSearch,
    clearFilters,
    hasActiveFilters,
  } = useKanbanFilters(data.tasks);

  const sortedColumns = useMemo(
    () => [...data.board.columns].sort((a, b) => a.order - b.order),
    [data.board.columns]
  );

  const tasksByColumn = useMemo(() => {
    const map = new Map<string, KanbanTask[]>();
    for (const task of filteredTasks) {
      const arr = map.get(task.columnId) || [];
      arr.push(task);
      map.set(task.columnId, arr);
    }
    return map;
  }, [filteredTasks]);

  const totalTasks = data.tasks.length;
  const completedTasks = useMemo(() => {
    const doneCol = sortedColumns[sortedColumns.length - 1];
    if (!doneCol) return 0;
    return data.tasks.filter((t) => t.columnId === doneCol.id).length;
  }, [data.tasks, sortedColumns]);

  const refreshData = useCallback(() => {
    setRefreshing(true);
    startTransition(() => {
      getBoardData()
        .then((fresh) => setData(fresh))
        .finally(() => setRefreshing(false));
    });
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const currentData = dataRef.current;
    const task = currentData.tasks.find((t) => t.id === draggableId);
    if (!task) return;

    const newTasks = [...currentData.tasks];
    const taskIndex = newTasks.findIndex((t) => t.id === draggableId);
    if (taskIndex !== -1) {
      newTasks[taskIndex] = { ...newTasks[taskIndex], columnId: destination.droppableId };
      setData((prev) => ({ ...prev, tasks: newTasks }));
    }

    startTransition(() => {
      moveTask(draggableId, destination.droppableId, source.droppableId).catch(() => {
        setData((prev) => {
          const reverted = [...prev.tasks];
          const idx = reverted.findIndex((t) => t.id === draggableId);
          if (idx !== -1) {
            reverted[idx] = { ...reverted[idx], columnId: source.droppableId };
          }
          return { ...prev, tasks: reverted };
        });
      });
    });
  }, []);

  const handleTaskClick = useCallback((task: KanbanTask) => {
    setSelectedTask(task);
    setDetailOpen(true);
  }, []);

  const handleCreateTask = useCallback((columnId?: string) => {
    setCreateDefaultColumnId(columnId);
    setCreateModalOpen(true);
  }, []);

  const handleSettingsClick = useCallback((column: KanbanColumnType) => {
    setSettingsColumn(column);
    setSettingsOpen(true);
  }, []);

  const handleAddColumn = useCallback(() => {
    if (!newColumnName.trim()) {
      setIsAddingColumn(false);
      return;
    }
    startTransition(() => {
      createColumn({ name: newColumnName.trim() })
        .then(() => {
          refreshData();
          setNewColumnName("");
          setIsAddingColumn(false);
        })
        .catch((err) => {
          console.error("创建列失败:", err);
        });
    });
  }, [newColumnName, refreshData]);

  return (
    <div className="bg-background flex h-full flex-col">
      {/* 顶部工具栏 */}
      <div className="border-border/60 bg-background/80 flex items-center justify-between border-b px-5 py-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <Layout className="text-primary h-4 w-4" />
            </div>
            <div>
              <h1 className="text-foreground text-base leading-tight font-bold">项目看板</h1>
              <p className="text-muted-foreground text-[11px] leading-tight">
                {completedTasks}/{totalTasks} 已完成
              </p>
            </div>
          </div>
          <div className="bg-border h-6 w-px" />
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs font-medium"
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
            toggleAssignee={toggleAssignee}
            togglePriority={togglePriority}
            toggleTag={toggleTag}
            setSearch={setSearch}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
            onClick={refreshData}
            disabled={refreshing}
            title="刷新"
            aria-label="刷新看板数据"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* 看板主体 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <KanbanBoardProvider
          value={{
            users: data.board.users,
            onTaskClick: handleTaskClick,
            onSettingsClick: handleSettingsClick,
            onTaskCreated: refreshData,
          }}
        >
          <div className="flex-1 overflow-auto px-5 py-4">
            <div className="flex h-full min-w-fit items-start gap-5">
              {sortedColumns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={tasksByColumn.get(column.id) || []}
                />
              ))}

              {/* 添加列 */}
              <div className="w-[280px] shrink-0">
                {isAddingColumn ? (
                  <div className="border-border bg-muted/40 rounded-xl border p-3">
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
                      className="mb-2 h-8 text-sm"
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
                    className="border-border/60 bg-muted/20 text-muted-foreground/60 hover:bg-muted/40 hover:text-muted-foreground hover:border-border focus-visible:ring-primary/50 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
                    aria-label="添加新列"
                  >
                    <Plus className="h-4 w-4" />
                    添加列
                  </button>
                )}
              </div>
            </div>
          </div>
        </KanbanBoardProvider>
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
