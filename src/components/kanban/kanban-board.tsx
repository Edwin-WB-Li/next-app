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
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
            <div className="flex gap-5 h-full min-w-fit items-start">
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground/60 transition-all hover:bg-muted/40 hover:text-muted-foreground hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
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
