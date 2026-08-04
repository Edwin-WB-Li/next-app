"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteRoute } from "@/lib/hiking";

interface DeleteRouteButtonProps {
  routeId: string;
  routeName: string;
}

export default function DeleteRouteButton({ routeId, routeName }: DeleteRouteButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteRoute(routeId);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">确认删除「{routeName}」？</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          {deleting ? "删除中" : "确认"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
        >
          取消
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
    >
      删除
    </button>
  );
}
