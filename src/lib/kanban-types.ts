export type Priority = "P0" | "P1" | "P2" | "P3";

export interface KanbanUser {
  id: string;
  name: string;
  avatar: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  createdAt: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  columnId: string;
  priority: Priority;
  assignee: string | null;
  tags: string[];
  dueDate: string | null;
  estimatedHours: number | null;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
  comments: Comment[];
  activities: Activity[];
}

export interface KanbanColumn {
  id: string;
  name: string;
  order: number;
  wipLimit: number | null;
  color: string | null;
}

export interface KanbanBoardData {
  columns: KanbanColumn[];
  users: KanbanUser[];
}

export interface BoardSnapshot {
  board: KanbanBoardData;
  tasks: KanbanTask[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  columnId: string;
  priority?: Priority;
  assignee?: string | null;
  tags?: string[];
  dueDate?: string | null;
  estimatedHours?: number | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  columnId?: string;
  priority?: Priority;
  assignee?: string | null;
  tags?: string[];
  dueDate?: string | null;
  estimatedHours?: number | null;
  subtasks?: Subtask[];
}

export interface CreateColumnInput {
  name: string;
  wipLimit?: number | null;
  color?: string | null;
}

export interface UpdateColumnInput {
  name?: string;
  wipLimit?: number | null;
  color?: string | null;
}
