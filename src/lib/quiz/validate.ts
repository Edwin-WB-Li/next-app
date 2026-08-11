import { Question, QuestionType, QuizSet } from "./types";

const VALID_TYPES: QuestionType[] = ["single", "multiple", "true_false"];
const VALID_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type ValidationResult =
  { success: true; data: QuizSet } | { success: false; errors: string[] };

export function validateQuizSetJson(json: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    return { success: false, errors: ["输入必须是 JSON 对象"] };
  }

  const obj = json as Record<string, unknown>;

  // title 验证
  if (typeof obj.title !== "string") {
    errors.push("title 为必填字段");
  } else if (obj.title.length < 1 || obj.title.length > 100) {
    errors.push("title 长度必须在 1-100 之间");
  }

  // description 可选
  const description = typeof obj.description === "string" ? obj.description : "";

  // questions 验证
  if (!Array.isArray(obj.questions)) {
    errors.push("questions 为必填数组");
  } else if (obj.questions.length === 0) {
    errors.push("questions 至少包含 1 道题目");
  } else {
    const questionIds = new Set<string>();
    for (let i = 0; i < obj.questions.length; i++) {
      const q = obj.questions[i];
      if (typeof q !== "object" || q === null) {
        errors.push(`第 ${i + 1} 题必须是对象`);
        continue;
      }
      const question = q as Record<string, unknown>;

      if (typeof question.id !== "string" || question.id.length === 0) {
        errors.push(`第 ${i + 1} 题 id 为必填字符串`);
      } else if (questionIds.has(question.id)) {
        errors.push(`questions 中存在重复的 id: ${question.id}`);
      } else {
        questionIds.add(question.id);
      }
      if (typeof question.content !== "string" || question.content.length === 0) {
        errors.push(`第 ${i + 1} 题 content 为必填字符串`);
      }
      if (!VALID_TYPES.includes(question.type as QuestionType)) {
        errors.push(`第 ${i + 1} 题 type 必须是 single、multiple 或 true_false`);
      }
      if (!Array.isArray(question.options) || question.options.length < 2) {
        errors.push(`第 ${i + 1} 题 options 至少包含 2 个选项`);
      } else {
        const optionIds = new Set<string>();
        for (let j = 0; j < question.options.length; j++) {
          const opt = question.options[j];
          if (typeof opt !== "object" || opt === null) {
            errors.push(`第 ${i + 1} 题第 ${j + 1} 个选项必须是对象`);
            continue;
          }
          const option = opt as Record<string, unknown>;
          if (typeof option.id !== "string" || option.id.length === 0) {
            errors.push(`第 ${i + 1} 题第 ${j + 1} 个选项 id 为必填字符串`);
          } else {
            optionIds.add(option.id);
          }
          if (typeof option.text !== "string" || option.text.length === 0) {
            errors.push(`第 ${i + 1} 题第 ${j + 1} 个选项 text 为必填字符串`);
          }
        }

        // correctAnswers 验证
        if (!Array.isArray(question.correctAnswers) || question.correctAnswers.length === 0) {
          errors.push(`第 ${i + 1} 题 correctAnswers 至少包含 1 个正确答案`);
        } else {
          for (let k = 0; k < question.correctAnswers.length; k++) {
            const ans = question.correctAnswers[k];
            if (typeof ans !== "string" || !optionIds.has(ans)) {
              errors.push(`第 ${i + 1} 题 correctAnswers[${k}] 必须是 options 中存在的 id`);
            }
          }
        }
      }
      if (
        typeof question.difficulty !== "string" ||
        !VALID_DIFFICULTIES.includes(question.difficulty as (typeof VALID_DIFFICULTIES)[number])
      ) {
        errors.push(`第 ${i + 1} 题 difficulty 必须是 easy、medium 或 hard`);
      }
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const questions = (obj.questions as unknown[]).map((q) => {
    const question = q as Record<string, unknown>;
    return {
      id: String(question.id),
      type: question.type as QuestionType,
      content: String(question.content),
      options: (question.options as unknown[]).map((opt) => ({
        id: String((opt as Record<string, unknown>).id),
        text: String((opt as Record<string, unknown>).text),
      })),
      correctAnswers: (question.correctAnswers as unknown[]).map(String),
      explanation: typeof question.explanation === "string" ? question.explanation : "",
      difficulty: question.difficulty as "easy" | "medium" | "hard",
      tags: Array.isArray(question.tags)
        ? question.tags.filter((t): t is string => typeof t === "string")
        : [],
    } satisfies Question;
  });

  const quizSet: QuizSet = {
    id: crypto.randomUUID(),
    title: String(obj.title),
    description,
    questions,
    createdAt: new Date().toISOString(),
    source: "imported",
  };

  return { success: true, data: quizSet };
}
