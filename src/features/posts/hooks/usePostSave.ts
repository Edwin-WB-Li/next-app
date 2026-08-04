"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "@/lib/posts";

interface UsePostSaveOptions {
  postId?: string;
  isEditing: boolean;
  title: string;
  slug: string;
  summary: string;
  content: string;
  published: boolean;
}

export function usePostSave({
  postId,
  isEditing,
  title,
  slug,
  summary,
  content,
  published,
}: UsePostSaveOptions) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = useCallback(
    async (publishState?: boolean) => {
      setError("");
      setIsSaving(true);

      const finalPublished = publishState !== undefined ? publishState : published;

      try {
        if (!title.trim()) throw new Error("请输入标题");
        if (!slug.trim()) throw new Error("请输入 Slug");
        if (!content.trim()) throw new Error("请输入文章内容");

        if (isEditing && postId) {
          await updatePost(postId, {
            title,
            slug,
            summary,
            content,
            published: finalPublished,
          });
        } else {
          await createPost({
            title,
            slug,
            summary,
            content,
            published: finalPublished,
          });
        }

        router.push("/admin");
      } catch (err) {
        setError(err instanceof Error ? err.message : "保存失败");
        setIsSaving(false);
      }
    },
    [postId, isEditing, title, slug, summary, content, published, router]
  );

  return { isSaving, error, handleSave };
}
