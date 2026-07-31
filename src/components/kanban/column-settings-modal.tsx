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
import { Label } from "@/components/ui/label";
import type { KanbanColumn } from "@/lib/kanban-types";
import { updateColumn, deleteColumn } from "@/lib/kanban";

interface ColumnSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: KanbanColumn | null;
  onUpdated: () => void;
  onDeleted: () => void;
}

export function ColumnSettingsModal({
  open,
  onOpenChange,
  column,
  onUpdated,
  onDeleted,
}: ColumnSettingsModalProps) {
  const [name, setName] = useState("");
  const [wipLimit, setWipLimit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (column) {
      queueMicrotask(() => {
        setName(column.name);
        setWipLimit(column.wipLimit?.toString() ?? "");
      });
    }
  }, [column]);

  const handleUpdate = useCallback(
    async (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      if (!column || !name.trim()) return;

      setSubmitting(true);
      try {
        await updateColumn(column.id, {
          name: name.trim(),
          wipLimit: wipLimit ? Number(wipLimit) : null,
        });
        onUpdated();
        onOpenChange(false);
      } finally {
        setSubmitting(false);
      }
    },
    [column, name, wipLimit, onUpdated, onOpenChange]
  );

  const handleDelete = useCallback(async () => {
    if (!column) return;
    if (!confirm(`确定要删除列 "${column.name}" 吗？该列下不能有任务。`)) return;

    setDeleting(true);
    try {
      await deleteColumn(column.id);
      onDeleted();
      onOpenChange(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeleting(false);
    }
  }, [column, onDeleted, onOpenChange]);

  if (!column) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleUpdate}>
          <DialogHeader>
            <DialogTitle>列设置</DialogTitle>
            <DialogDescription>修改列的名称和 WIP 限制。</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="col-name">列名称 *</Label>
              <Input
                id="col-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：进行中"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="wip-limit">WIP 限制（最大任务数，留空表示无限制）</Label>
              <Input
                id="wip-limit"
                type="number"
                min={1}
                value={wipLimit}
                onChange={(e) => setWipLimit(e.target.value)}
                placeholder="例如：5"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="sm:mr-auto"
            >
              {deleting ? "删除中..." : "删除列"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

