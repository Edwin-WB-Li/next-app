"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { KanbanColumn, KanbanUser, Priority } from "@/lib/kanban-types";
import { createTask } from "@/lib/kanban";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: KanbanColumn[];
  users: KanbanUser[];
  defaultColumnId?: string;
  onCreated: () => void;
}

export function CreateTaskModal({
  open,
  onOpenChange,
  columns,
  users,
  defaultColumnId,
  onCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState(defaultColumnId || columns[0]?.id || "");
  const [priority, setPriority] = useState<Priority>("P2");
  const [assignee, setAssignee] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setTitle("");
        setDescription("");
        setColumnId(defaultColumnId || columns[0]?.id || "");
        setPriority("P2");
        setAssignee(null);
        setDueDate("");
        setEstimatedHours("");
        setTagInput("");
        setTags([]);
      });
    }
  }, [open, defaultColumnId, columns]);

  const handleAddTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleSubmit = useCallback(
    async (e: { preventDefault: () => void }) => {
      e.preventDefault();
      if (!title.trim() || !columnId) return;

      setSubmitting(true);
      try {
        await createTask({
          title: title.trim(),
          description: description.trim(),
          columnId,
          priority,
          assignee: assignee || null,
          tags,
          dueDate: dueDate || null,
          estimatedHours: estimatedHours ? Number(estimatedHours) : null,
        });
        onCreated();
        onOpenChange(false);
      } finally {
        setSubmitting(false);
      }
    },
    [
      title,
      description,
      columnId,
      priority,
      assignee,
      tags,
      dueDate,
      estimatedHours,
      onCreated,
      onOpenChange,
    ]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>新建任务</DialogTitle>
            <DialogDescription>填写任务信息并分配到对应列。</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入任务标题"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="任务详细描述..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="column">状态列 *</Label>
                <select
                  id="column"
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value)}
                  className="border-border bg-card text-card-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                  required
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">优先级</Label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="border-border bg-card text-card-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                >
                  <option value="P0">P0 - 紧急</option>
                  <option value="P1">P1 - 高</option>
                  <option value="P2">P2 - 中</option>
                  <option value="P3">P3 - 低</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assignee">负责人</Label>
                <select
                  id="assignee"
                  value={assignee ?? ""}
                  onChange={(e) => setAssignee(e.target.value || null)}
                  className="border-border bg-card text-card-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                >
                  <option value="">未分配</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">截止日期</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estimatedHours">预估工时（小时）</Label>
              <Input
                id="estimatedHours"
                type="number"
                min={0}
                step={0.5}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="例如：8"
              />
            </div>

            <div className="grid gap-2">
              <Label>标签</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="输入标签按回车添加"
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  添加
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer gap-1">
                      {tag}
                      <span
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive ml-1"
                      >
                        ×
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? "创建中..." : "创建任务"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
