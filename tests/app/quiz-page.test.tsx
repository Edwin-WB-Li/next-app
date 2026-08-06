import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import QuizPage from "@/app/quiz/page";
import { QuizSet } from "@/lib/quiz/types";

vi.mock("@/lib/quiz/data", () => ({
  getQuizSets: vi.fn(),
}));

import { getQuizSets } from "@/lib/quiz/data";

const builtinSet: QuizSet = {
  id: "builtin-1",
  title: "内置练习",
  description: "内置描述",
  questions: [
    {
      id: "q1",
      type: "single",
      content: "Q1",
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
      ],
      correctAnswers: ["a"],
      explanation: "",
      difficulty: "easy",
      tags: ["js"],
    },
  ],
  createdAt: "2024-01-01",
  source: "builtin",
};

const importedSet: QuizSet = {
  id: "imported-1",
  title: "导入练习",
  description: "导入描述",
  questions: [
    {
      id: "q2",
      type: "multiple",
      content: "Q2",
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
      ],
      correctAnswers: ["a"],
      explanation: "",
      difficulty: "medium",
      tags: ["ts"],
    },
  ],
  createdAt: "2024-02-01",
  source: "imported",
};

describe("QuizPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("渲染多个练习本", async () => {
    vi.mocked(getQuizSets).mockResolvedValue([builtinSet, importedSet]);

    const Page = await QuizPage();
    render(Page);

    expect(screen.getByText("内置练习")).toBeInTheDocument();
    expect(screen.getByText("导入练习")).toBeInTheDocument();
    expect(screen.getAllByText("1 题")).toHaveLength(2);
  });

  it("空状态展示", async () => {
    vi.mocked(getQuizSets).mockResolvedValue([]);

    const Page = await QuizPage();
    render(Page);

    expect(screen.getByText("暂无练习本")).toBeInTheDocument();
  });
});
