import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import type { KanbanTask, KanbanUser } from "@/lib/kanban-types";
import { KanbanBoardProvider } from "@/components/kanban/kanban-board-context";

/**
 * 这些测试复现看板模块的可访问性问题。
 *
 * 问题 1: task-card.tsx 的 div 作为可点击元素缺少键盘支持
 * - 根因: div 有 onClick 但没有 role="button"、tabIndex={0}、键盘事件处理
 * - 影响: 键盘用户无法通过 Tab 聚焦到卡片，也无法用 Enter/Space 打开详情
 *
 * 问题 2: kanban-column.tsx 操作按钮默认 opacity-0
 * - 根因: 按钮使用 opacity-0 group-hover/column:opacity-100
 * - 影响: 键盘 Tab 聚焦到按钮时，按钮仍然不可见（除非同时 hover 了列）
 */

const mockUsers: KanbanUser[] = [{ id: "user-1", name: "张三", avatar: "" }];

const mockTask: KanbanTask = {
  id: "task-test-1",
  title: "测试任务",
  description: "",
  columnId: "col-1",
  priority: "P2",
  assignee: "user-1",
  tags: ["前端"],
  dueDate: null,
  estimatedHours: null,
  createdAt: "2026-07-01T00:00:00Z",
  updatedAt: "2026-07-01T00:00:00Z",
  subtasks: [],
  comments: [],
  activities: [],
};

// Mock @hello-pangea/dnd 以便在 jsdom 中测试组件结构
vi.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }: { children: ReactNode }) => <>{children}</>,
  Droppable: ({
    children,
  }: {
    children: (provided: unknown, snapshot: { isDraggingOver: boolean }) => ReactNode;
  }) => children({ innerRef: null, droppableProps: {} }, { isDraggingOver: false }),
  Draggable: ({
    children,
  }: {
    children: (provided: unknown, snapshot: { isDragging: boolean }) => ReactNode;
  }) =>
    children(
      {
        innerRef: null,
        draggableProps: { style: {} },
        dragHandleProps: {},
      },
      { isDragging: false }
    ),
}));

// 动态导入以在 mock 之后加载
const { TaskCard } = await import("@/components/kanban/task-card");

describe("TaskCard accessibility", () => {
  it("should be keyboard accessible (role, tabIndex, key handler)", () => {
    const handleClick = vi.fn();
    const { container } = render(
      <KanbanBoardProvider
        value={{
          users: mockUsers,
          onTaskClick: handleClick,
          onSettingsClick: () => {},
          onTaskCreated: () => {},
        }}
      >
        <TaskCard task={mockTask} index={0} />
      </KanbanBoardProvider>
    );

    // 查找带有 role="button" 的元素
    const card = container.querySelector("[role='button']");

    if (!card) {
      // 如果当前实现没有 role="button"，测试失败以暴露问题
      expect.fail("TaskCard 缺少 role='button'，键盘用户无法识别这是可交互元素");
    }

    // 检查 tabIndex
    expect(card).toHaveAttribute("tabIndex", "0");

    // 模拟键盘 Enter 激活
    fireEvent.keyDown(card, { key: "Enter", code: "Enter" });
    expect(handleClick).toHaveBeenCalled();
  });
});

describe("KanbanColumn accessibility", () => {
  it("column action buttons should be visible on focus", async () => {
    const { KanbanColumn } = await import("@/components/kanban/kanban-column");
    const { container } = render(
      <KanbanBoardProvider
        value={{
          users: mockUsers,
          onTaskClick: () => {},
          onSettingsClick: () => {},
          onTaskCreated: () => {},
        }}
      >
        <KanbanColumn
          column={{ id: "col-test", name: "测试中", order: 0, wipLimit: null, color: null }}
          tasks={[]}
        />
      </KanbanBoardProvider>
    );

    // 查找操作按钮容器
    const actionsContainer = container.querySelector(".focus-within\\:opacity-100");
    if (!actionsContainer) {
      expect.fail("列操作按钮容器缺少 focus-within:opacity-100，键盘用户看不到 focus 的按钮");
    }
  });
});
