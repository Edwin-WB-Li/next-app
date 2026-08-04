"use client";

import { useState, useEffect, useCallback } from "react";
function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import type { KanbanTask, KanbanColumn, KanbanUser } from "@/lib/kanban-types";
import { updateTask, addComment } from "@/lib/kanban";
import {
  Clock,
  Calendar,
  MessageSquare,
  Activity,
  CheckSquare,
  Tag,
  User,
  AlertCircle,
} from "lucide-react";

interface TaskDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: KanbanTask | null;
  columns: KanbanColumn[];
  users: KanbanUser[];
  onUpdated: () => void;
}

export function TaskDetailDrawer({
  open,
  onOpenChange,
  task,
  columns,
  users,
  onUpdated,
}: TaskDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(task?.priority ?? "P2");
  const [assignee, setAssignee] = useState<string | null>(null);
  const [columnId, setColumnId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState(task?.subtasks ?? []);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 保留上一个任务以支持关闭动画
  const [lastTask, setLastTask] = useState<KanbanTask | null>(null);

  useEffect(() => {
    if (task) {
      queueMicrotask(() => {
        setLastTask(task);
        setTitle(task.title);
        setDescription(task.description);
        setPriority(task.priority);
        setAssignee(task.assignee);
        setColumnId(task.columnId);
        setDueDate(task.dueDate ?? "");
        setEstimatedHours(task.estimatedHours?.toString() ?? "");
        setTags(task.tags);
        setSubtasks(task.subtasks);
        setIsEditing(false);
      });
    }
  }, [task]);

  const displayTask = task ?? lastTask;

  const assigneeUser = users.find((u) => u.id === (task?.assignee ?? assignee));
  const column = columns.find((c) => c.id === task?.columnId);

  const handleSave = useCallback(async () => {
    if (!task || !title.trim()) return;
    setSubmitting(true);
    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        assignee,
        columnId,
        dueDate: dueDate || null,
        estimatedHours: estimatedHours ? Number(estimatedHours) : null,
        tags,
        subtasks,
      });
      setIsEditing(false);
      onUpdated();
    } finally {
      setSubmitting(false);
    }
  }, [
    task,
    title,
    description,
    priority,
    assignee,
    columnId,
    dueDate,
    estimatedHours,
    tags,
    subtasks,
    onUpdated,
  ]);

  const handleAddComment = useCallback(async () => {
    if (!task || !commentText.trim()) return;
    await addComment(task.id, "user-1", commentText.trim());
    setCommentText("");
    onUpdated();
  }, [task, commentText, onUpdated]);

  const toggleSubtask = useCallback((subtaskId: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s))
    );
  }, []);

  if (!displayTask) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-border border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetDescription className="text-muted-foreground font-mono text-xs">
              {displayTask.id.toUpperCase()}
            </SheetDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={submitting}
            >
              {isEditing ? (submitting ? "保存中..." : "保存") : "编辑"}
            </Button>
          </div>
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 text-lg font-semibold"
            />
          ) : (
            <SheetTitle className="mt-2">{displayTask.title}</SheetTitle>
          )}
        </SheetHeader>

        <div className="grid gap-6 py-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">优先级</span>
              {isEditing ? (
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as typeof priority)}
                  className="border-border bg-card ml-auto rounded border px-2 py-0.5 text-sm"
                >
                  <option value="P0">P0</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                </select>
              ) : (
                <Badge variant="priority" priority={displayTask.priority} className="ml-auto">
                  {displayTask.priority}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <User className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">负责人</span>
              {isEditing ? (
                <select
                  value={assignee ?? ""}
                  onChange={(e) => setAssignee(e.target.value || null)}
                  className="border-border bg-card ml-auto rounded border px-2 py-0.5 text-sm"
                >
                  <option value="">未分配</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              ) : assigneeUser ? (
                <div className="ml-auto flex items-center gap-1.5">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={assigneeUser.avatar} alt={assigneeUser.name} />
                    <AvatarFallback>{assigneeUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{assigneeUser.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground ml-auto">未分配</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">截止日期</span>
              {isEditing ? (
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="ml-auto h-7 w-auto text-sm"
                />
              ) : displayTask.dueDate ? (
                <span className="ml-auto">{displayTask.dueDate}</span>
              ) : (
                <span className="text-muted-foreground ml-auto">无</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">预估工时</span>
              {isEditing ? (
                <Input
                  type="number"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="ml-auto h-7 w-20 text-sm"
                />
              ) : displayTask.estimatedHours ? (
                <span className="ml-auto">{displayTask.estimatedHours}h</span>
              ) : (
                <span className="text-muted-foreground ml-auto">无</span>
              )}
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <Tag className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">状态列</span>
              {isEditing ? (
                <select
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value)}
                  className="border-border bg-card ml-auto rounded border px-2 py-0.5 text-sm"
                >
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="ml-auto">{column?.name}</span>
              )}
            </div>
          </div>

          {/* 标签 */}
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          {/* 描述 */}
          <div>
            <Label className="mb-2 block text-sm font-medium">描述</Label>
            {isEditing ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            ) : (
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {displayTask.description || "暂无描述"}
              </p>
            )}
          </div>

          {/* 子任务 */}
          {subtasks.length > 0 ? (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                <Label className="text-sm font-medium">子任务</Label>
                <span className="text-muted-foreground ml-auto text-xs">
                  {subtasks.filter((s) => s.completed).length}/{subtasks.length}
                </span>
              </div>
              <div className="space-y-1">
                {subtasks.map((sub) => (
                  <label
                    key={sub.id}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded px-2 py-1.5"
                  >
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => toggleSubtask(sub.id)}
                      className="border-border h-4 w-4 rounded"
                    />
                    <span
                      className={`text-sm ${sub.completed ? "text-muted-foreground line-through" : ""}`}
                    >
                      {sub.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {/* 评论 */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <Label className="text-sm font-medium">评论</Label>
            </div>
            <div className="mb-3 flex gap-2">
              <Input
                placeholder="添加评论..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>
                发送
              </Button>
            </div>
            {displayTask.comments.length === 0 ? (
              <p className="text-muted-foreground text-sm">暂无评论</p>
            ) : (
              <div className="space-y-3">
                {displayTask.comments.map((comment) => {
                  const user = users.find((u) => u.id === comment.userId);
                  return (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>{user?.name?.[0] ?? "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{user?.name ?? "未知用户"}</span>
                          <span className="text-muted-foreground text-xs">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 活动日志 */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <Label className="text-sm font-medium">活动日志</Label>
            </div>
            <div className="space-y-2">
              {displayTask.activities.map((activity) => {
                const user = users.find((u) => u.id === activity.userId);
                return (
                  <div key={activity.id} className="flex items-center gap-2 text-sm">
                    <Avatar className="h-5 w-5 shrink-0">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.[0] ?? "?"}</AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground">
                      <span className="text-foreground font-medium">
                        {user?.name ?? "未知用户"}
                      </span>{" "}
                      {activity.action}
                    </span>
                    <span className="text-muted-foreground ml-auto text-xs">
                      {formatDateTime(activity.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
