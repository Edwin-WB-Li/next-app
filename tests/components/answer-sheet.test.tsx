import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AnswerSheet from "@/components/quiz/answer-sheet";

describe("AnswerSheet", () => {
  const questions = [
    { id: "q1", type: "single" as const },
    { id: "q2", type: "multiple" as const },
    { id: "q3", type: "true_false" as const },
  ];

  it("渲染所有题号", () => {
    render(
      <AnswerSheet
        questions={questions}
        answers={{}}
        flagged={[]}
        currentIndex={0}
        onNavigate={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "第 1 题" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "第 2 题" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "第 3 题" })).toBeInTheDocument();
  });

  it("已答题目标记为已答", () => {
    render(
      <AnswerSheet
        questions={questions}
        answers={{ q1: ["a"] }}
        flagged={[]}
        currentIndex={0}
        onNavigate={vi.fn()}
      />
    );
    const btn1 = screen.getByRole("button", { name: /第 1 题/ });
    expect(btn1).toHaveAttribute("data-answered", "true");
    const btn2 = screen.getByRole("button", { name: /第 2 题/ });
    expect(btn2).toHaveAttribute("data-answered", "false");
  });

  it("标记不确定的题目显示标记状态", () => {
    render(
      <AnswerSheet
        questions={questions}
        answers={{}}
        flagged={["q2"]}
        currentIndex={0}
        onNavigate={vi.fn()}
      />
    );
    const btn2 = screen.getByRole("button", { name: /第 2 题/ });
    expect(btn2).toHaveAttribute("data-flagged", "true");
  });

  it("点击题号调用 onNavigate", () => {
    const onNavigate = vi.fn();
    render(
      <AnswerSheet
        questions={questions}
        answers={{}}
        flagged={[]}
        currentIndex={0}
        onNavigate={onNavigate}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "第 3 题" }));
    expect(onNavigate).toHaveBeenCalledWith(2);
  });

  it("当前题目高亮", () => {
    render(
      <AnswerSheet
        questions={questions}
        answers={{}}
        flagged={[]}
        currentIndex={1}
        onNavigate={vi.fn()}
      />
    );
    const btn2 = screen.getByRole("button", { name: "第 2 题" });
    expect(btn2).toHaveAttribute("data-current", "true");
  });

  it("当前题使用 sky-500 高亮样式且无布局偏移", () => {
    render(
      <AnswerSheet
        questions={questions}
        answers={{}}
        flagged={[]}
        currentIndex={1}
        onNavigate={vi.fn()}
      />
    );
    const btn2 = screen.getByRole("button", { name: "第 2 题" });
    // 当前题应使用 sky-500 主题高亮
    expect(btn2.className).toContain("border-sky-500");
    expect(btn2.className).toContain("bg-sky-500/10");
    // 不应使用会导致布局偏移的 border-2
    expect(btn2.className).not.toContain("border-2");
  });
});
