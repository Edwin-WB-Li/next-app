import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("fs/promises", async () => {
  const actual = await vi.importActual<typeof import("fs/promises")>("fs/promises");
  return {
    ...actual,
    default: {
      ...actual,
      readFile: vi.fn(),
      writeFile: vi.fn(),
      mkdir: vi.fn(),
    },
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  };
});

import fs from "fs/promises";
import {
  getQuestions,
  getRecords,
  saveRecord,
  getWrongQuestions,
  getQuizSets,
  getQuizSetById,
  saveQuizSet,
  deleteQuizSet,
} from "@/lib/quiz/data";
import { QuizSet } from "@/lib/quiz/types";
import { Question, QuizRecord } from "@/lib/quiz/types";

const mockReadFile = fs.readFile as ReturnType<typeof vi.fn>;
const mockWriteFile = fs.writeFile as ReturnType<typeof vi.fn>;

const sampleQuestions: Question[] = [
  {
    id: "q1",
    type: "single",
    content: "Q1",
    options: [{ id: "a", text: "A" }],
    correctAnswers: ["a"],
    explanation: "",
    difficulty: "easy",
    tags: [],
  },
  {
    id: "q2",
    type: "single",
    content: "Q2",
    options: [{ id: "b", text: "B" }],
    correctAnswers: ["b"],
    explanation: "",
    difficulty: "medium",
    tags: [],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getQuestions", () => {
  it("返回解析后的题目数组", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(sampleQuestions));
    const result = await getQuestions();
    expect(result).toEqual(sampleQuestions);
  });

  it("文件不存在时返回空数组", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"));
    const result = await getQuestions();
    expect(result).toEqual([]);
  });
});

describe("getRecords", () => {
  it("返回解析后的记录数组", async () => {
    const records: QuizRecord[] = [
      {
        id: "r1",
        date: "2024-01-01",
        answers: {},
        score: 1,
        wrongQuestionIds: ["q1"],
      },
    ];
    mockReadFile.mockResolvedValue(JSON.stringify(records));
    const result = await getRecords();
    expect(result).toEqual(records);
  });

  it("文件不存在时返回空数组", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"));
    const result = await getRecords();
    expect(result).toEqual([]);
  });
});

describe("saveRecord", () => {
  it("将新记录追加到已有记录中", async () => {
    const existing: QuizRecord[] = [
      {
        id: "r1",
        date: "2024-01-01",
        answers: {},
        score: 1,
        wrongQuestionIds: ["q1"],
      },
    ];
    mockReadFile.mockResolvedValue(JSON.stringify(existing));

    const newRecord: QuizRecord = {
      id: "r2",
      date: "2024-01-02",
      answers: { q1: ["a"] },
      score: 1,
      wrongQuestionIds: [],
    };

    await saveRecord(newRecord);

    const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
    expect(written).toHaveLength(2);
    expect(written[0]).toEqual(newRecord);
    expect(written[1]).toEqual(existing[0]);
  });

  it("首次保存时创建文件", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"));

    const newRecord: QuizRecord = {
      id: "r1",
      date: "2024-01-01",
      answers: {},
      score: 0,
      wrongQuestionIds: ["q1"],
    };

    await saveRecord(newRecord);

    const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
    expect(written).toEqual([newRecord]);
  });
});

const sampleQuizSet: QuizSet = {
  id: "imported-1",
  title: "导入测试",
  description: "测试描述",
  questions: sampleQuestions,
  createdAt: "2024-01-01",
  source: "imported",
};

describe("getQuizSets", () => {
  it("返回内置 + 导入的练习本", async () => {
    mockReadFile.mockImplementation((filePath: string) => {
      if (filePath.includes("sets")) {
        return Promise.resolve(JSON.stringify([sampleQuizSet]));
      }
      if (filePath.includes("questions")) {
        return Promise.resolve(JSON.stringify(sampleQuestions));
      }
      return Promise.reject(new Error("ENOENT"));
    });

    const result = await getQuizSets();
    expect(result).toHaveLength(2);
    expect(result[0].source).toBe("builtin");
    expect(result[1].source).toBe("imported");
  });

  it("questions.json 为空时只返回导入的练习本", async () => {
    mockReadFile.mockImplementation((filePath: string) => {
      if (filePath.includes("sets")) {
        return Promise.resolve(JSON.stringify([sampleQuizSet]));
      }
      return Promise.reject(new Error("ENOENT"));
    });

    const result = await getQuizSets();
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe("imported");
  });

  it("sets.json 不存在时只返回内置练习本", async () => {
    mockReadFile.mockImplementation((filePath: string) => {
      if (filePath.includes("questions")) {
        return Promise.resolve(JSON.stringify(sampleQuestions));
      }
      return Promise.reject(new Error("ENOENT"));
    });

    const result = await getQuizSets();
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe("builtin");
  });
});

describe("getQuizSetById", () => {
  it("通过 default id 获取内置练习本", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(sampleQuestions));
    const result = await getQuizSetById("default");
    expect(result).not.toBeNull();
    expect(result?.source).toBe("builtin");
    expect(result?.questions).toEqual(sampleQuestions);
  });

  it("通过 id 获取导入的练习本", async () => {
    mockReadFile.mockImplementation((filePath: string) => {
      if (filePath.includes("sets")) {
        return Promise.resolve(JSON.stringify([sampleQuizSet]));
      }
      return Promise.reject(new Error("ENOENT"));
    });
    const result = await getQuizSetById("imported-1");
    expect(result).not.toBeNull();
    expect(result?.source).toBe("imported");
  });

  it("找不到时返回 null", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"));
    const result = await getQuizSetById("nonexistent");
    expect(result).toBeNull();
  });
});

describe("saveQuizSet", () => {
  it("将新练习本追加到 sets.json", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify([sampleQuizSet]));

    const newSet: QuizSet = {
      id: "imported-2",
      title: "新练习本",
      description: "",
      questions: [],
      createdAt: "2024-01-02",
      source: "imported",
    };

    await saveQuizSet(newSet);

    const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
    expect(written).toHaveLength(2);
    expect(written[0]).toEqual(newSet);
  });

  it("首次保存时创建 sets.json", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"));

    const newSet: QuizSet = {
      id: "imported-1",
      title: "首个练习本",
      description: "",
      questions: [],
      createdAt: "2024-01-01",
      source: "imported",
    };

    await saveQuizSet(newSet);

    const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
    expect(written).toEqual([newSet]);
  });

  it("保存重复 id 抛出错误", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify([sampleQuizSet]));

    await expect(saveQuizSet(sampleQuizSet)).rejects.toThrow("已存在");
  });
});

describe("deleteQuizSet", () => {
  it("删除导入的练习本", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify([sampleQuizSet]));

    const result = await deleteQuizSet("imported-1");
    expect(result).toBe(true);

    const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
    expect(written).toHaveLength(0);
  });

  it("不能删除内置练习本", async () => {
    const result = await deleteQuizSet("default");
    expect(result).toBe(false);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("删除不存在的 id 返回 false", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify([sampleQuizSet]));

    const result = await deleteQuizSet("nonexistent");
    expect(result).toBe(false);
  });
});

describe("getWrongQuestions", () => {
  it("聚合所有错题并去重", async () => {
    mockReadFile.mockImplementation((filePath: string) => {
      if (filePath.includes("questions")) {
        return Promise.resolve(JSON.stringify(sampleQuestions));
      }
      if (filePath.includes("sets")) {
        return Promise.resolve(JSON.stringify([sampleQuizSet]));
      }
      return Promise.resolve(
        JSON.stringify([
          {
            id: "r1",
            date: "2024-01-01",
            answers: {},
            score: 0,
            wrongQuestionIds: ["q1"],
          },
          {
            id: "r2",
            date: "2024-01-02",
            answers: {},
            score: 0,
            wrongQuestionIds: ["q1", "q2"],
          },
        ] as QuizRecord[])
      );
    });

    const result = await getWrongQuestions();
    expect(result).toHaveLength(2);
    expect(result.map((q) => q.id)).toContain("q1");
    expect(result.map((q) => q.id)).toContain("q2");
  });

  it("没有记录时返回空数组", async () => {
    mockReadFile.mockImplementation((filePath: string) => {
      if (filePath.includes("questions")) {
        return Promise.resolve(JSON.stringify(sampleQuestions));
      }
      if (filePath.includes("sets")) {
        return Promise.resolve(JSON.stringify([sampleQuizSet]));
      }
      return Promise.reject(new Error("ENOENT"));
    });

    const result = await getWrongQuestions();
    expect(result).toEqual([]);
  });
});
