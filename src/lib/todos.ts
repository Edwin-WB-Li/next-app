"use server";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const DATA_FILE = path.join(process.cwd(), "data", "todos", "todos.json");

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
}

export type Priority = Todo["priority"];

async function readTodos(): Promise<Todo[]> {
  const data = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(data) as Todo[];
}

async function writeTodos(todos: Todo[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
}

function sortTodos(todos: Todo[]): Todo[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...todos].sort((a, b) => {
    const pa = priorityOrder[a.priority];
    const pb = priorityOrder[b.priority];
    if (pa !== pb) return pa - pb;
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function getTodos(): Promise<Todo[]> {
  const todos = await readTodos();
  return sortTodos(todos);
}

export async function createTodo(
  title: string,
  priority: Priority = "medium",
  dueDate: string | null = null
): Promise<Todo> {
  const todos = await readTodos();
  const todo: Todo = {
    id: randomUUID(),
    title: title.trim(),
    completed: false,
    priority,
    dueDate,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  todos.push(todo);
  await writeTodos(todos);
  return todo;
}

export async function toggleTodo(id: string): Promise<Todo | null> {
  const todos = await readTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return null;

  todos[index].completed = !todos[index].completed;
  todos[index].completedAt = todos[index].completed ? new Date().toISOString() : null;
  await writeTodos(todos);
  return todos[index];
}

export async function updateTodoTitle(id: string, title: string): Promise<Todo | null> {
  const todos = await readTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return null;

  todos[index].title = title.trim();
  await writeTodos(todos);
  return todos[index];
}

export async function deleteTodo(id: string): Promise<boolean> {
  const todos = await readTodos();
  const filtered = todos.filter((t) => t.id !== id);
  if (filtered.length === todos.length) return false;
  await writeTodos(filtered);
  return true;
}
