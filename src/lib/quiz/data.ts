"use server";

import fs from "fs/promises";
import path from "path";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { Question, QuizRecord, QuizSet } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "quiz");
const QUESTIONS_FILE = path.join(DATA_DIR, "questions.json");
const RECORDS_FILE = path.join(DATA_DIR, "records.json");
const SETS_FILE = path.join(DATA_DIR, "sets.json");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

// 文件写入互斥锁，防止并发读写导致数据丢失
class Mutex {
  private promise: Promise<void> = Promise.resolve();

  async acquire(): Promise<() => void> {
    let release: () => void;
    const newPromise = new Promise<void>((resolve) => {
      release = resolve;
    });
    const wait = this.promise;
    this.promise = this.promise.then(() => newPromise);
    await wait;
    return release!;
  }
}

const writeMutex = new Mutex();

const readQuestions = cache(async (): Promise<Question[]> => {
  try {
    const raw = await fs.readFile(QUESTIONS_FILE, "utf-8");
    return JSON.parse(raw) as Question[];
  } catch {
    return [];
  }
});

const readRecords = cache(async (): Promise<QuizRecord[]> => {
  try {
    const raw = await fs.readFile(RECORDS_FILE, "utf-8");
    return JSON.parse(raw) as QuizRecord[];
  } catch {
    return [];
  }
});

const readSets = cache(async (): Promise<QuizSet[]> => {
  try {
    const raw = await fs.readFile(SETS_FILE, "utf-8");
    return JSON.parse(raw) as QuizSet[];
  } catch {
    return [];
  }
});

async function buildBuiltinSet(): Promise<QuizSet | null> {
  const questions = await readQuestions();
  if (questions.length === 0) return null;
  return {
    id: "default",
    title: "前端基础综合练习",
    description: "涵盖 JavaScript、TypeScript、React、CSS、HTTP 等前端核心知识点",
    questions,
    createdAt: "",
    source: "builtin",
  };
}

export async function getQuestions(): Promise<Question[]> {
  return readQuestions();
}

export async function getRecords(): Promise<QuizRecord[]> {
  return readRecords();
}

export async function saveRecord(record: QuizRecord): Promise<void> {
  const release = await writeMutex.acquire();
  try {
    const records = await readRecords();
    records.unshift(record);
    await ensureDir();
    await fs.writeFile(RECORDS_FILE, JSON.stringify(records, null, 2), "utf-8");
  } finally {
    release();
  }
}

export async function getRecordById(id: string): Promise<QuizRecord | null> {
  const records = await readRecords();
  return records.find((r) => r.id === id) ?? null;
}

export async function removeFromWrongBook(questionId: string): Promise<void> {
  const release = await writeMutex.acquire();
  try {
    const records = await readRecords();
    let changed = false;
    for (const record of records) {
      const idx = record.wrongQuestionIds.indexOf(questionId);
      if (idx !== -1) {
        record.wrongQuestionIds.splice(idx, 1);
        changed = true;
      }
    }
    if (changed) {
      await ensureDir();
      await fs.writeFile(RECORDS_FILE, JSON.stringify(records, null, 2), "utf-8");
    }
  } finally {
    release();
  }
}

export async function getQuizSets(): Promise<QuizSet[]> {
  const [builtin, imported] = await Promise.all([buildBuiltinSet(), readSets()]);
  return builtin ? [builtin, ...imported] : imported;
}

export async function getQuizSetById(id: string): Promise<QuizSet | null> {
  if (id === "default") {
    return buildBuiltinSet();
  }
  const sets = await readSets();
  return sets.find((s) => s.id === id) ?? null;
}

export async function saveQuizSet(set: QuizSet): Promise<void> {
  const release = await writeMutex.acquire();
  try {
    const sets = await readSets();
    if (sets.some((s) => s.id === set.id)) {
      throw new Error(`QuizSet id 已存在: ${set.id}`);
    }
    sets.unshift(set);
    await ensureDir();
    await fs.writeFile(SETS_FILE, JSON.stringify(sets, null, 2), "utf-8");
    revalidatePath("/quiz");
  } finally {
    release();
  }
}

export async function deleteQuizSet(id: string): Promise<boolean> {
  if (id === "default") return false;

  const release = await writeMutex.acquire();
  try {
    const sets = await readSets();
    const idx = sets.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    sets.splice(idx, 1);
    await ensureDir();
    await fs.writeFile(SETS_FILE, JSON.stringify(sets, null, 2), "utf-8");
    revalidatePath("/quiz");
    return true;
  } finally {
    release();
  }
}

export async function getWrongQuestions(): Promise<Question[]> {
  const [sets, records] = await Promise.all([getQuizSets(), readRecords()]);

  const wrongIdSet = new Set<string>();
  for (const record of records) {
    for (const id of record.wrongQuestionIds) {
      wrongIdSet.add(id);
    }
  }

  // 从所有练习本中查找错题（id 全局唯一，首次命中即可）
  const questionMap = new Map<string, Question>();
  for (const set of sets) {
    for (const q of set.questions) {
      if (!questionMap.has(q.id)) {
        questionMap.set(q.id, q);
      }
    }
  }

  const result: Question[] = [];
  for (const id of wrongIdSet) {
    const q = questionMap.get(id);
    if (q) result.push(q);
  }

  return result;
}
