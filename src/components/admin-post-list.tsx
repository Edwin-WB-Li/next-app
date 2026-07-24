"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Post, togglePublish, deletePost } from "@/lib/posts";

interface AdminPostListProps {
  post: Post;
}

export default function AdminPostList({ post }: AdminPostListProps) {
  const router = useRouter();
  const [currentPost, setCurrentPost] = useState(post);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTogglePublish = useCallback(async () => {
    try {
      const updated = await togglePublish(currentPost.id);
      setCurrentPost(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    }
  }, [currentPost.id]);

  const handleDelete = useCallback(async () => {
    if (!confirm(`确定要删除文章「${currentPost.title}」吗？此操作不可恢复。`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deletePost(currentPost.id);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
      setIsDeleting(false);
    }
  }, [currentPost.id, currentPost.title, router]);

  return (
    <tr className="transition-colors hover:bg-muted/50">
      <td className="px-4 py-3 font-medium">
        <Link
          href={`/admin/edit/${currentPost.id}`}
          className="text-foreground hover:text-primary transition-colors"
        >
          {currentPost.title}
        </Link>
      </td>
      <td className="px-4 py-3 text-foreground/70 font-mono text-xs">
        {currentPost.slug}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            currentPost.published
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
          }`}
        >
          {currentPost.published ? "已发布" : "草稿"}
        </span>
      </td>
      <td className="px-4 py-3 text-foreground/70">
        {new Date(currentPost.createdAt).toLocaleDateString("zh-CN")}
      </td>
      <td className="px-4 py-3 text-foreground/70">
        {new Date(currentPost.updatedAt).toLocaleDateString("zh-CN")}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleTogglePublish}
            className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors ${
              currentPost.published
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
            }`}
          >
            {currentPost.published ? "下架" : "发布"}
          </button>
          <Link
            href={`/admin/edit/${currentPost.id}`}
            className="inline-flex h-8 items-center rounded-md bg-muted px-3 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
          >
            编辑
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex h-8 items-center rounded-md bg-red-100 px-3 text-xs font-medium text-red-800 hover:bg-red-200 transition-colors disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400"
          >
            {isDeleting ? "删除中..." : "删除"}
          </button>
        </div>
      </td>
    </tr>
  );
}
