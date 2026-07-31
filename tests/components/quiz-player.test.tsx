import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuizPlayer from "@/components/quiz/quiz-player";
import { Question } from "@/lib/quiz/types";

const questions: Question[] = [
  {
    id: "q1",
    type: "single",
    content: "Q1",
    options: [
      { id: "a", text: "A" },
      { id: "b", text: "B" },
    ],
    correctAnswers: ["b"],
    explanation: "",
    difficulty: "easy",
    tags: [],
  },
  {
    id: "q2",
    type: "multiple",
    content: "Q2",
    options: [
      { id: "a", text: "A" },
      { id: "b", text: "B" },
    ],
    correctAnswers: ["a", "b"],
    explanation: "",
    difficulty: "easy",
    tags: [],
  },
];

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/quiz/data", () => ({
  saveRecord: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/quiz/score", async () => {
  const actual = await vi.importActual<typeof import("@/lib/quiz/score")>("@/lib/quiz/score");
  return actual;
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("QuizPlayer - submit deduplication", () => {
  it("快速点击交卷不应重复调用 saveRecord", async () => {
    const { saveRecord } = await import("@/lib/quiz/data");
    const user = userEvent.setup();
    render(<QuizPlayer questions={questions} quizId="default" />);

    // 答完所有题
    await user.click(screen.getByLabelText("B"));
    await user.click(screen.getByRole("button", { name: /下一题/ }));
    await user.click(screen.getByLabelText("A"));
    await user.click(screen.getByLabelText("B"));

    // 快速双击交卷
    const submitBtn = screen.getByRole("button", { name: "交卷" });
    await user.click(submitBtn);
    await user.click(submitBtn);

    // 等待异步完成
    await waitFor(() => expect(saveRecord).toHaveBeenCalled(), { timeout: 2000 });

    // saveRecord 应该只被调用一次
    expect(saveRecord).toHaveBeenCalledTimes(1);
  });
});

describe("QuizPlayer - dialog accessibility", () => {
  it("按 ESC 键应关闭确认对话框", async () => {
    const user = userEvent.setup();
    // 只传一道题，这样第一题就是最后一题，显示交卷按钮
    render(<QuizPlayer questions={[questions[0]]} quizId="default" />);

    // 直接点击交卷（不答题，触发确认弹窗）
    const submitBtn = screen.getByRole("button", { name: "交卷" });
    await user.click(submitBtn);

    // 确认弹窗出现（用 findBy 等待异步渲染）
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // 按 ESC
    await user.keyboard("{Escape}");

    // 弹窗应关闭
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("确认弹窗打开后焦点应限制在弹窗内", async () => {
    const user = userEvent.setup();
    render(<QuizPlayer questions={[questions[0]]} quizId="default" />);

    const submitBtn = screen.getByRole("button", { name: "交卷" });
    await user.click(submitBtn);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // Tab 在弹窗内循环
    await user.tab();
    await user.tab();
    await user.tab();

    // 焦点不应跑到弹窗外的交卷按钮上
    expect(dialog.contains(document.activeElement)).toBe(true);
  });
});
