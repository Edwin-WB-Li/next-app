"use client";

import * as React from "react";
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
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState(task?.priority ?? "P2");
  const [assignee, setAssignee] = React.useState<string | null>(null);
  const [columnId, setColumnId] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [estimatedHours, setEstimatedHours] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [subtasks, setSubtasks] = React.useState(task?.subtasks ?? []);
  const [commentText, setCommentText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (task) {
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
    }
  }, [task]);

  const assigneeUser = users.find((u) => u.id === (task?.assignee ?? assignee));
  const column = columns.find((c) => c.id === task?.columnId);

  const handleSave = async () => {
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
  };

  const handleAddComment = async () => {
    if (!task || !commentText.trim()) return;
    await addComment(task.id, "user-1", commentText.trim());
    setCommentText("");
    onUpdated();
  };

  const toggleSubtask = (subtaskId: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s))
    );
  };

  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetDescription className="text-xs font-mono text-muted-foreground">
              {task.id.toUpperCase()}
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
              className="text-lg font-semibold mt-2"
            />
          ) : (
            <SheetTitle className="mt-2">{task.title}</SheetTitle>
          )}
        </SheetHeader>

        <div className="grid gap-6 py-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">优先级</span>
              {isEditing ? (
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as typeof priority)}
                  className="ml-auto rounded border border-border bg-card px-2 py-0.5 text-sm"
                >
                  <option value="P0">P0</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                </select>
              ) : (
                <Badge variant="priority" priority={task.priority} className="ml-auto">
                  {task.priority}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">负责人</span>
              {isEditing ? (
                <select
                  value={assignee ?? ""}
                  onChange={(e) => setAssignee(e.target.value || null)}
                  className="ml-auto rounded border border-border bg-card px-2 py-0.5 text-sm"
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
                <span className="ml-auto text-muted-foreground">未分配</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">截止日期</span>
              {isEditing ? (
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="ml-auto h-7 w-auto text-sm"
                />
              ) : task.dueDate ? (
                <span className="ml-auto">{task.dueDate}</span>
              ) : (
                <span className="ml-auto text-muted-foreground">无</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">预估工时</span>
              {isEditing ? (
                <Input
                  type="number"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="ml-auto h-7 w-20 text-sm"
                />
              ) : task.estimatedHours ? (
                <span className="ml-auto">{task.estimatedHours}h</span>
              ) : (
                <span className="ml-auto text-muted-foreground">无</span>
              )}
            </div>

            <div className="flex items-center gap-2 col-span-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">状态列</span>
              {isEditing ? (
                <select
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value)}
                  className="ml-auto rounded border border-border bg-card px-2 py-0.5 text-sm"
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
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* 描述 */}
          <div>
            <Label className="text-sm font-medium mb-2 block">描述</Label>
            {isEditing ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description || "暂无描述"}
              </p>
            )}
          </div>

          {/* 子任务 */}
          {subtasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="h-4 w-4" />
                <Label className="text-sm font-medium">子任务</Label>
                <span className="text-xs text-muted-foreground ml-auto">
                  {subtasks.filter((s) => s.completed).length}/{subtasks.length}
                </span>
              </div>
              <div className="space-y-1">
                {subtasks.map((sub) => (
                  <label
                    key={sub.id}
                    className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-accent cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => toggleSubtask(sub.id)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span
                      className={`text-sm ${sub.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {sub.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 评论 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4" />
              <Label className="text-sm font-medium">评论</Label>
            </div>
            <div className="flex gap-2 mb-3">
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
            {task.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无评论</p>
            ) : (
              <div className="space-y-3">
                {task.comments.map((comment) => {
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
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 活动日志 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4" />
              <Label className="text-sm font-medium">活动日志</Label>
            </div>
            <div className="space-y-2">
              {task.activities.map((activity) => {
                const user = users.find((u) => u.id === activity.userId);
                return (
                  <div key={activity.id} className="flex items-center gap-2 text-sm">
                    <Avatar className="h-5 w-5 shrink-0">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.[0] ?? "?"}</AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">{user?.name ?? "未知用户"}</span>{" "}
                      {activity.action}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
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
