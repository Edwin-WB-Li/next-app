"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import type {
  KanbanBoardData,
  KanbanTask,
  KanbanColumn,
  CreateTaskInput,
  UpdateTaskInput,
  CreateColumnInput,
  UpdateColumnInput,
  BoardSnapshot,
} from "./kanban-types";

const KANBAN_DIR = path.join(process.cwd(), "data", "kanban");
const BOARD_FILE = path.join(KANBAN_DIR, "board.json");
const TASKS_FILE = path.join(KANBAN_DIR, "tasks.json");

// 文件锁：防止并发 read-modify-write 导致数据丢失
const fileLocks = new Map<string, Promise<unknown>>();

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = fileLocks.get(key);
  const release = Promise.resolve(prev).then(() => fn());
  fileLocks.set(
    key,
    release.then(() => {}).catch(() => {})
  );
  return release;
}

const DEFAULT_BOARD: KanbanBoardData = {
  columns: [
    { id: "col-1", name: "待办", order: 0, wipLimit: null, color: null },
    { id: "col-2", name: "进行中", order: 1, wipLimit: 5, color: null },
    { id: "col-3", name: "代码审查", order: 2, wipLimit: 3, color: null },
    { id: "col-4", name: "测试", order: 3, wipLimit: 5, color: null },
    { id: "col-5", name: "已完成", order: 4, wipLimit: null, color: null },
  ],
  users: [
    {
      id: "user-1",
      name: "张三",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan",
    },
    { id: "user-2", name: "李四", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisi" },
    {
      id: "user-3",
      name: "王五",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu",
    },
    {
      id: "user-4",
      name: "赵六",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu",
    },
  ],
};

const DEFAULT_TASKS: KanbanTask[] = [
  {
    id: "task-1",
    title: "设计首页 UI 原型",
    description: "使用 Figma 完成首页的高保真原型设计，包括暗黑模式配色方案。",
    columnId: "col-5",
    priority: "P1",
    assignee: "user-1",
    tags: ["设计", "UI"],
    dueDate: "2026-07-20",
    estimatedHours: 16,
    createdAt: "2026-07-10T08:00:00.000Z",
    updatedAt: "2026-07-15T10:30:00.000Z",
    subtasks: [
      { id: "sub-1", title: "确定设计规范", completed: true },
      { id: "sub-2", title: "绘制线框图", completed: true },
      { id: "sub-3", title: "高保真设计", completed: true },
    ],
    comments: [],
    activities: [
      { id: "act-1", userId: "user-1", action: "创建任务", createdAt: "2026-07-10T08:00:00.000Z" },
      {
        id: "act-2",
        userId: "user-1",
        action: "移动至 已完成",
        createdAt: "2026-07-15T10:30:00.000Z",
      },
    ],
  },
  {
    id: "task-2",
    title: "实现用户认证系统",
    description: "集成 NextAuth.js 实现 GitHub 和邮箱登录。",
    columnId: "col-2",
    priority: "P0",
    assignee: "user-2",
    tags: ["后端", "安全"],
    dueDate: "2026-07-25",
    estimatedHours: 24,
    createdAt: "2026-07-12T09:00:00.000Z",
    updatedAt: "2026-07-14T16:00:00.000Z",
    subtasks: [
      { id: "sub-4", title: "配置 NextAuth", completed: true },
      { id: "sub-5", title: "实现 GitHub OAuth", completed: false },
      { id: "sub-6", title: "实现邮箱密码登录", completed: false },
    ],
    comments: [],
    activities: [
      { id: "act-3", userId: "user-2", action: "创建任务", createdAt: "2026-07-12T09:00:00.000Z" },
    ],
  },
  {
    id: "task-3",
    title: "优化图片加载性能",
    description: "为博客文章图片添加懒加载和 WebP 格式支持。",
    columnId: "col-3",
    priority: "P2",
    assignee: "user-3",
    tags: ["性能", "前端"],
    dueDate: "2026-07-28",
    estimatedHours: 8,
    createdAt: "2026-07-13T10:00:00.000Z",
    updatedAt: "2026-07-16T11:00:00.000Z",
    subtasks: [],
    comments: [],
    activities: [
      { id: "act-4", userId: "user-3", action: "创建任务", createdAt: "2026-07-13T10:00:00.000Z" },
      {
        id: "act-5",
        userId: "user-3",
        action: "移动至 代码审查",
        createdAt: "2026-07-16T11:00:00.000Z",
      },
    ],
  },
  {
    id: "task-4",
    title: "编写 API 文档",
    description: "为所有 REST API 端点编写 Swagger 文档。",
    columnId: "col-1",
    priority: "P3",
    assignee: null,
    tags: ["文档"],
    dueDate: "2026-08-01",
    estimatedHours: 12,
    createdAt: "2026-07-14T14:00:00.000Z",
    updatedAt: "2026-07-14T14:00:00.000Z",
    subtasks: [],
    comments: [],
    activities: [
      { id: "act-6", userId: "user-4", action: "创建任务", createdAt: "2026-07-14T14:00:00.000Z" },
    ],
  },
  {
    id: "task-5",
    title: "修复移动端导航栏问题",
    description: "在 iOS Safari 上导航栏会出现抖动，需要排查修复。",
    columnId: "col-4",
    priority: "P1",
    assignee: "user-1",
    tags: ["Bug", "移动端"],
    dueDate: "2026-07-22",
    estimatedHours: 4,
    createdAt: "2026-07-15T08:30:00.000Z",
    updatedAt: "2026-07-17T09:00:00.000Z",
    subtasks: [
      { id: "sub-7", title: "复现问题", completed: true },
      { id: "sub-8", title: "定位原因", completed: true },
    ],
    comments: [],
    activities: [
      { id: "act-7", userId: "user-1", action: "创建任务", createdAt: "2026-07-15T08:30:00.000Z" },
      {
        id: "act-8",
        userId: "user-1",
        action: "移动至 测试",
        createdAt: "2026-07-17T09:00:00.000Z",
      },
    ],
  },
];

async function ensureKanbanDir() {
  await fs.mkdir(KANBAN_DIR, { recursive: true });
}

const readBoard = cache(async (): Promise<KanbanBoardData> => {
  try {
    const raw = await fs.readFile(BOARD_FILE, "utf-8");
    return JSON.parse(raw) as KanbanBoardData;
  } catch {
    await ensureKanbanDir();
    await fs.writeFile(BOARD_FILE, JSON.stringify(DEFAULT_BOARD, null, 2), "utf-8");
    return DEFAULT_BOARD;
  }
});

async function writeBoard(board: KanbanBoardData) {
  await ensureKanbanDir();
  await fs.writeFile(BOARD_FILE, JSON.stringify(board, null, 2), "utf-8");
}

async function writeBoardSafe(board: KanbanBoardData) {
  return withLock("board", () => writeBoard(board));
}

const readTasks = cache(async (): Promise<KanbanTask[]> => {
  try {
    const raw = await fs.readFile(TASKS_FILE, "utf-8");
    return JSON.parse(raw) as KanbanTask[];
  } catch {
    await ensureKanbanDir();
    await fs.writeFile(TASKS_FILE, JSON.stringify(DEFAULT_TASKS, null, 2), "utf-8");
    return DEFAULT_TASKS;
  }
});

async function writeTasks(tasks: KanbanTask[]) {
  await ensureKanbanDir();
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf-8");
}

async function writeTasksSafe(tasks: KanbanTask[]) {
  return withLock("tasks", () => writeTasks(tasks));
}

export async function getBoardData(): Promise<BoardSnapshot> {
  const [board, tasks] = await Promise.all([readBoard(), readTasks()]);
  return { board, tasks };
}

export async function createTask(data: CreateTaskInput): Promise<KanbanTask> {
  const tasks = await readTasks();
  const now = new Date().toISOString();
  const newTask: KanbanTask = {
    id: `task-${Date.now()}`,
    title: data.title,
    description: data.description ?? "",
    columnId: data.columnId,
    priority: data.priority ?? "P2",
    assignee: data.assignee ?? null,
    tags: data.tags ?? [],
    dueDate: data.dueDate ?? null,
    estimatedHours: data.estimatedHours ?? null,
    createdAt: now,
    updatedAt: now,
    subtasks: [],
    comments: [],
    activities: [{ id: `act-${Date.now()}`, userId: "user-1", action: "创建任务", createdAt: now }],
  };
  tasks.push(newTask);
  await writeTasksSafe(tasks);
  revalidatePath("/kanban");
  return newTask;
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<KanbanTask> {
  const tasks = await readTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("任务不存在");

  const now = new Date().toISOString();
  const oldColumn = tasks[index].columnId;
  tasks[index] = {
    ...tasks[index],
    ...(data.title !== undefined && { title: data.title }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.columnId !== undefined && { columnId: data.columnId }),
    ...(data.priority !== undefined && { priority: data.priority }),
    ...(data.assignee !== undefined && { assignee: data.assignee }),
    ...(data.tags !== undefined && { tags: data.tags }),
    ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
    ...(data.estimatedHours !== undefined && { estimatedHours: data.estimatedHours }),
    ...(data.subtasks !== undefined && { subtasks: data.subtasks }),
    updatedAt: now,
  };

  if (data.columnId && data.columnId !== oldColumn) {
    tasks[index].activities.push({
      id: `act-${Date.now()}`,
      userId: "user-1",
      action: `移动至 ${data.columnId}`,
      createdAt: now,
    });
  }

  await writeTasksSafe(tasks);
  revalidatePath("/kanban");
  return tasks[index];
}

export async function moveTask(
  taskId: string,
  targetColumnId: string,
  sourceColumnId: string
): Promise<KanbanTask> {
  const tasks = await readTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) throw new Error("任务不存在");

  // 校验任务是否确实在源列中（防止乐观更新回滚时使用了错误的源列）
  if (tasks[index].columnId !== sourceColumnId) {
    throw new Error("任务当前不在指定的源列中");
  }

  const now = new Date().toISOString();
  tasks[index].columnId = targetColumnId;
  tasks[index].updatedAt = now;
  tasks[index].activities.push({
    id: `act-${Date.now()}`,
    userId: "user-1",
    action: `移动至 ${targetColumnId}`,
    createdAt: now,
  });

  await writeTasksSafe(tasks);
  revalidatePath("/kanban");
  return tasks[index];
}

export async function deleteTask(id: string) {
  const tasks = await readTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) throw new Error("任务不存在");
  await writeTasksSafe(filtered);
  revalidatePath("/kanban");
}

export async function createColumn(data: CreateColumnInput): Promise<KanbanColumn> {
  const board = await readBoard();
  const maxOrder = board.columns.reduce((max, c) => Math.max(max, c.order), -1);
  const newColumn: KanbanColumn = {
    id: `col-${Date.now()}`,
    name: data.name,
    order: maxOrder + 1,
    wipLimit: data.wipLimit ?? null,
    color: data.color ?? null,
  };
  board.columns.push(newColumn);
  await writeBoardSafe(board);
  revalidatePath("/kanban");
  return newColumn;
}

export async function updateColumn(id: string, data: UpdateColumnInput): Promise<KanbanColumn> {
  const board = await readBoard();
  const index = board.columns.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("列不存在");

  board.columns[index] = {
    ...board.columns[index],
    ...(data.name !== undefined && { name: data.name }),
    ...(data.wipLimit !== undefined && { wipLimit: data.wipLimit }),
    ...(data.color !== undefined && { color: data.color }),
  };

  await writeBoardSafe(board);
  revalidatePath("/kanban");
  return board.columns[index];
}

export async function deleteColumn(id: string) {
  const board = await readBoard();
  const tasks = await readTasks();
  const hasTasks = tasks.some((t) => t.columnId === id);
  if (hasTasks) throw new Error("该列下还有任务，无法删除");

  board.columns = board.columns.filter((c) => c.id !== id);
  await writeBoardSafe(board);
  revalidatePath("/kanban");
}

export async function reorderColumns(orderedIds: string[]) {
  const board = await readBoard();
  board.columns = board.columns
    .map((c) => ({ ...c, order: orderedIds.indexOf(c.id) }))
    .sort((a, b) => a.order - b.order);
  await writeBoardSafe(board);
  revalidatePath("/kanban");
}

export async function addComment(taskId: string, userId: string, content: string) {
  const tasks = await readTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) throw new Error("任务不存在");

  tasks[index].comments.push({
    id: `cmt-${Date.now()}`,
    userId,
    content,
    createdAt: new Date().toISOString(),
  });
  tasks[index].updatedAt = new Date().toISOString();
  await writeTasksSafe(tasks);
  revalidatePath("/kanban");
}
