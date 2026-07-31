import { describe, it, expect, vi, beforeEach } from "vitest";

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
} from "@/lib/quiz/data";
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

describe("getWrongQuestions", () => {
  it("聚合所有错题并去重", async () => {
    mockReadFile.mockImplementation((filePath: string) => {
      if (filePath.includes("questions")) {
        return Promise.resolve(JSON.stringify(sampleQuestions));
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
      return Promise.reject(new Error("ENOENT"));
    });

    const result = await getWrongQuestions();
    expect(result).toEqual([]);
  });
});
