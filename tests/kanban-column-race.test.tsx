import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DragDropContext } from "@hello-pangea/dnd";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { KanbanBoardProvider } from "@/components/kanban/kanban-board-context";
import type { KanbanColumn as KanbanColumnType, KanbanTask, KanbanUser } from "@/lib/kanban-types";

/**
 * 测试复现 kanban-column.tsx 的 onBlur 竞态条件。
 *
 * 问题: 快速添加任务时，点击"添加"按钮无法提交
 * 根因: Input 的 onBlur 事件在按钮的 onClick 之前触发。
 *       onBlur 中执行 `if (!newTitle.trim()) setIsAdding(false)`，
 *       导致输入框和按钮被卸载，后续的 click 事件无法触发。
 *
 * 复现步骤:
 *   1. 点击"添加卡片"
 *   2. 在输入框中输入文字
 *   3. 点击"添加"按钮
 *   4. 预期: onBlur 先触发 -> 判断 newTitle.trim() 有内容 -> 不关闭
 *      实际（修复前）: 如果 onBlur 逻辑有误，或者鼠标按下时 blur 先于 click
 */

const mockColumn: KanbanColumnType = {
  id: "col-test",
  name: "测试中",
  order: 0,
  wipLimit: null,
  color: null,
};

const mockUsers: KanbanUser[] = [
  { id: "user-1", name: "张三", avatar: "" },
];

const mockTasks: KanbanTask[] = [];

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <DragDropContext onDragEnd={() => {}}>
      <KanbanBoardProvider
        value={{
          users: mockUsers,
          onTaskClick: () => {},
          onSettingsClick: () => {},
          onTaskCreated: () => {},
        }}
      >
        {children}
      </KanbanBoardProvider>
    </DragDropContext>
  );
}

describe("KanbanColumn quick add - blur race condition", () => {
  it("should keep input open when clicking add button after typing", async () => {

    render(
      <Wrapper>
        <KanbanColumn column={mockColumn} tasks={mockTasks} />
      </Wrapper>
    );

    // 1. 点击"添加卡片"打开快速添加区域
    const addCardBtn = screen.getByText("添加卡片");
    fireEvent.click(addCardBtn);

    // 2. 找到输入框并输入内容
    const input = await screen.findByPlaceholderText("输入任务标题，按回车确认");
    fireEvent.change(input, { target: { value: "新任务" } });

    // 3. 找到"添加"按钮
    const submitBtn = screen.getByText("添加");

    // 4. 模拟 blur 发生在 click 之前
    // 在真实浏览器中，mousedown -> blur -> mouseup -> click
    fireEvent.blur(input);

    // 如果 onBlur 逻辑错误地关闭了输入框，submitBtn 会从 DOM 中移除
    // 修复后: onBlur 应该检查 relatedTarget，如果焦点移动到按钮则不关闭
    // 或者使用 onMouseDown preventDefault 来阻止 blur
    expect(document.body.contains(submitBtn)).toBe(true);
  });
});
