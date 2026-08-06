import { describe, it, expect } from "vitest";
import { validateQuizSetJson } from "@/lib/quiz/validate";

const validQuizSet = {
  title: "JavaScript 基础测试",
  description: "测试 JS 基础知识",
  questions: [
    {
      id: "q1",
      type: "single",
      content: "1+1=?",
      options: [
        { id: "a", text: "1" },
        { id: "b", text: "2" },
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
  ],
};

describe("validateQuizSetJson", () => {
  it("有效 JSON 通过验证", () => {
    const result = validateQuizSetJson(validQuizSet);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("JavaScript 基础测试");
      expect(result.data.questions).toHaveLength(3);
      expect(result.data.source).toBe("imported");
    }
  });

  it("缺少 title 报错", () => {
    const result = validateQuizSetJson({ ...validQuizSet, title: undefined });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain("title 为必填字段");
    }
  });

  it("title 为空字符串报错", () => {
    const result = validateQuizSetJson({ ...validQuizSet, title: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain("title 长度必须在 1-100 之间");
    }
  });

  it("title 超过 100 字符报错", () => {
    const result = validateQuizSetJson({ ...validQuizSet, title: "a".repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain("title 长度必须在 1-100 之间");
    }
  });

  it("缺少 questions 报错", () => {
    const result = validateQuizSetJson({ title: "Test" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain("questions 为必填数组");
    }
  });

  it("空 questions 数组报错", () => {
    const result = validateQuizSetJson({ ...validQuizSet, questions: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain("questions 至少包含 1 道题目");
    }
  });

  it("question type 非法报错", () => {
    const result = validateQuizSetJson({
      ...validQuizSet,
      questions: [{ ...validQuizSet.questions[0], type: "fill_blank" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes("type"))).toBe(true);
    }
  });

  it("options 少于 2 项报错", () => {
    const result = validateQuizSetJson({
      ...validQuizSet,
      questions: [{ ...validQuizSet.questions[0], options: [{ id: "a", text: "A" }] }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.errors.some((e) => e.includes("options") && e.includes("至少") && e.includes("2"))
      ).toBe(true);
    }
  });

  it("correctAnswers 为空数组报错", () => {
    const result = validateQuizSetJson({
      ...validQuizSet,
      questions: [{ ...validQuizSet.questions[0], correctAnswers: [] }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.errors.some(
          (e) => e.includes("correctAnswers") && e.includes("至少") && e.includes("1")
        )
      ).toBe(true);
    }
  });

  it("correctAnswers 包含不在 options 中的 id 报错", () => {
    const result = validateQuizSetJson({
      ...validQuizSet,
      questions: [{ ...validQuizSet.questions[0], correctAnswers: ["z"] }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes("correctAnswers") && e.includes("options"))).toBe(
        true
      );
    }
  });

  it("缺少 question id 报错", () => {
    const result = validateQuizSetJson({
      ...validQuizSet,
      questions: [{ ...validQuizSet.questions[0], id: undefined }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes("id"))).toBe(true);
    }
  });

  it("缺少 question content 报错", () => {
    const result = validateQuizSetJson({
      ...validQuizSet,
      questions: [{ ...validQuizSet.questions[0], content: undefined }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes("content"))).toBe(true);
    }
  });

  it("difficulty 非法报错", () => {
    const result = validateQuizSetJson({
      ...validQuizSet,
      questions: [{ ...validQuizSet.questions[0], difficulty: "very_hard" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes("difficulty"))).toBe(true);
    }
  });

  it("非对象输入报错", () => {
    const result = validateQuizSetJson("not an object");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain("输入必须是 JSON 对象");
    }
  });

  it("description 可选且可为空", () => {
    const result = validateQuizSetJson({ ...validQuizSet, description: undefined });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("");
    }
  });

  it("questions 中存在重复 id 报错", () => {
    const result = validateQuizSetJson({
      ...validQuizSet,
      questions: [validQuizSet.questions[0], { ...validQuizSet.questions[0], content: "Q2" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes("重复") && e.includes("id"))).toBe(true);
    }
  });
});
