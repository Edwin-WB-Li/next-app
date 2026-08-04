import { describe, it, expect } from "vitest";
import { calculateScore } from "@/lib/quiz/score";
import { Question } from "@/lib/quiz/types";

const questions: Question[] = [
  {
    id: "q1",
    type: "single",
    content: "1+1=?",
    options: [
      { id: "a", text: "1" },
      { id: "b", text: "2" },
      { id: "c", text: "3" },
    ],
    correctAnswers: ["b"],
    explanation: "1+1=2",
    difficulty: "easy",
    tags: ["math"],
  },
  {
    id: "q2",
    type: "multiple",
    content: "哪些是偶数？",
    options: [
      { id: "a", text: "2" },
      { id: "b", text: "3" },
      { id: "c", text: "4" },
    ],
    correctAnswers: ["a", "c"],
    explanation: "2和4是偶数",
    difficulty: "medium",
    tags: ["math"],
  },
  {
    id: "q3",
    type: "true_false",
    content: "地球是圆的",
    options: [
      { id: "true", text: "正确" },
      { id: "false", text: "错误" },
    ],
    correctAnswers: ["true"],
    explanation: "地球近似球形",
    difficulty: "easy",
    tags: ["geo"],
  },
];

describe("calculateScore", () => {
  it("全对得满分", () => {
    const answers = {
      q1: ["b"],
      q2: ["a", "c"],
      q3: ["true"],
    };
    const result = calculateScore(questions, answers);
    expect(result.score).toBe(3);
    expect(result.total).toBe(3);
    expect(result.correctCount).toBe(3);
    expect(result.wrongQuestionIds).toEqual([]);
    expect(result.details).toEqual({ q1: true, q2: true, q3: true });
  });

  it("单选错选不得分", () => {
    const answers = { q1: ["a"] };
    const result = calculateScore(questions, answers);
    expect(result.details.q1).toBe(false);
    expect(result.score).toBe(0);
  });

  it("多选漏选不得分", () => {
    const answers = { q2: ["a"] };
    const result = calculateScore(questions, answers);
    expect(result.details.q2).toBe(false);
  });

  it("多选错选不得分", () => {
    const answers = { q2: ["a", "b"] };
    const result = calculateScore(questions, answers);
    expect(result.details.q2).toBe(false);
  });

  it("判断题错选不得分", () => {
    const answers = { q3: ["false"] };
    const result = calculateScore(questions, answers);
    expect(result.details.q3).toBe(false);
  });

  it("未作答算错误", () => {
    const answers: Record<string, string[]> = {};
    const result = calculateScore(questions, answers);
    expect(result.score).toBe(0);
    expect(result.correctCount).toBe(0);
    expect(result.wrongQuestionIds).toEqual(["q1", "q2", "q3"]);
  });

  it("部分正确混合", () => {
    const answers = {
      q1: ["b"],
      q2: ["a", "b"],
      q3: ["false"],
    };
    const result = calculateScore(questions, answers);
    expect(result.score).toBe(1);
    expect(result.correctCount).toBe(1);
    expect(result.wrongQuestionIds).toEqual(["q2", "q3"]);
  });

  it("空数组作答算错误", () => {
    const answers = { q1: [] };
    const result = calculateScore(questions, answers);
    expect(result.details.q1).toBe(false);
  });
});
