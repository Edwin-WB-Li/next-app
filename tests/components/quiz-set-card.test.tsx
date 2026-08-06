import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuizSetCard } from "@/components/quiz/quiz-set-card";
import { Question } from "@/lib/quiz/types";

const sampleQuestions: Question[] = [
  {
    id: "q1",
    type: "single",
    content: "Q1",
    options: [{ id: "a", text: "A" }],
    correctAnswers: ["a"],
    explanation: "",
    difficulty: "easy",
    tags: ["js", "es6"],
  },
  {
    id: "q2",
    type: "multiple",
    content: "Q2",
    options: [{ id: "a", text: "A" }],
    correctAnswers: ["a"],
    explanation: "",
    difficulty: "medium",
    tags: ["ts", "es6", "react"],
  },
  {
    id: "q3",
    type: "true_false",
    content: "Q3",
    options: [{ id: "a", text: "A" }],
    correctAnswers: ["a"],
    explanation: "",
    difficulty: "hard",
    tags: ["css"],
  },
];

describe("QuizSetCard", () => {
  it("渲染完整卡片结构", () => {
    render(
      <QuizSetCard>
        <QuizSetCard.Header title="测试标题" description="测试描述" questionCount={3} />
        <QuizSetCard.Stats questions={sampleQuestions} />
        <QuizSetCard.Tags questions={sampleQuestions} />
        <QuizSetCard.Footer>
          <QuizSetCard.Action href="/quiz/test">开始答题</QuizSetCard.Action>
        </QuizSetCard.Footer>
      </QuizSetCard>
    );

    expect(screen.getByText("测试标题")).toBeInTheDocument();
    expect(screen.getByText("测试描述")).toBeInTheDocument();
    expect(screen.getByText("3 题")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "开始答题" })).toHaveAttribute("href", "/quiz/test");
  });

  it("Stats 正确计算难度和题型分布", () => {
    render(
      <QuizSetCard>
        <QuizSetCard.Stats questions={sampleQuestions} />
      </QuizSetCard>
    );

    expect(screen.getByText("易")).toBeInTheDocument();
    expect(screen.getByText("中")).toBeInTheDocument();
    expect(screen.getByText("难")).toBeInTheDocument();
    expect(screen.getByText("单选 1 题")).toBeInTheDocument();
    expect(screen.getByText("多选 1 题")).toBeInTheDocument();
    expect(screen.getByText("判断 1 题")).toBeInTheDocument();
  });

  it("Tags 去重并限制最多 6 个", () => {
    const manyTags: Question[] = Array.from({ length: 10 }, (_, i) => ({
      id: `q${i}`,
      type: "single",
      content: `Q${i}`,
      options: [{ id: "a", text: "A" }],
      correctAnswers: ["a"],
      explanation: "",
      difficulty: "easy",
      tags: [`tag${i}`],
    }));

    render(
      <QuizSetCard>
        <QuizSetCard.Tags questions={manyTags} />
      </QuizSetCard>
    );

    const tags = screen.getAllByText(/tag\d/);
    expect(tags).toHaveLength(6);
  });

  it("Action 渲染为 button 当提供 onClick 时", () => {
    const onClick = vi.fn();
    render(
      <QuizSetCard>
        <QuizSetCard.Footer>
          <QuizSetCard.Action onClick={onClick}>导入</QuizSetCard.Action>
        </QuizSetCard.Footer>
      </QuizSetCard>
    );

    const btn = screen.getByRole("button", { name: "导入" });
    expect(btn).toBeInTheDocument();
  });

  it("无 description 时不渲染描述元素", () => {
    render(
      <QuizSetCard>
        <QuizSetCard.Header title="无描述" questionCount={1} />
      </QuizSetCard>
    );

    expect(screen.getByText("无描述")).toBeInTheDocument();
    expect(screen.queryByText("测试描述")).not.toBeInTheDocument();
  });
});
