"use server";

import fs from "fs/promises";
import path from "path";
import { cache } from "react";
import { Question, QuizRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "quiz");
const QUESTIONS_FILE = path.join(DATA_DIR, "questions.json");
const RECORDS_FILE = path.join(DATA_DIR, "records.json");

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

export async function getWrongQuestions(): Promise<Question[]> {
  const [questions, records] = await Promise.all([readQuestions(), readRecords()]);

  const wrongIdSet = new Set<string>();
  for (const record of records) {
    for (const id of record.wrongQuestionIds) {
      wrongIdSet.add(id);
    }
  }

  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const result: Question[] = [];
  for (const id of wrongIdSet) {
    const q = questionMap.get(id);
    if (q) result.push(q);
  }

  return result;
}
