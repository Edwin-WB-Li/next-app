"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "@/lib/posts";
import MarkdownRenderer from "./markdown-renderer";

interface PostEditorProps {
  postId?: string;
  initialTitle?: string;
  initialSlug?: string;
  initialSummary?: string;
  initialContent?: string;
  initialPublished?: boolean;
}

export default function PostEditor({
  postId,
  initialTitle = "",
  initialSlug = "",
  initialSummary = "",
  initialContent = "",
  initialPublished = false,
}: PostEditorProps) {
  const router = useRouter();
  const isEditing = !!postId;

  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [summary, setSummary] = useState(initialSummary);
  const [content, setContent] = useState(initialContent);
  const [published, setPublished] = useState(initialPublished);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview" | "split">(
    "split"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function generateSlug(titleText: string) {
    return titleText
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 60);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isEditing) {
      setSlug(generateSlug(value));
    }
  }

  async function handleSave(publishState?: boolean) {
    setError("");
    setIsSaving(true);

    const finalPublished = publishState !== undefined ? publishState : published;

    try {
      if (!title.trim()) throw new Error("请输入标题");
      if (!slug.trim()) throw new Error("请输入 Slug");
      if (!content.trim()) throw new Error("请输入文章内容");

      if (isEditing) {
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
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="文章标题"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-friendly-slug"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary font-mono"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">摘要</label>
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="文章简短摘要"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">预览模式：</span>
          {(["edit", "split", "preview"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPreviewMode(mode)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                previewMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground/70 hover:text-foreground"
              }`}
            >
              {mode === "edit" && "编辑"}
              {mode === "split" && "分屏"}
              {mode === "preview" && "预览"}
            </button>
          ))}
        </div>
        <div className="text-xs text-foreground/50">
          {content.length} 字符
        </div>
      </div>

      <div
        className={`grid gap-4 ${
          previewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {(previewMode === "edit" || previewMode === "split") && (
          <div className="flex flex-col">
            <label className="mb-1.5 block text-sm font-medium">
              Markdown 内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="在此输入 Markdown 内容..."
              className="min-h-[500px] w-full resize-y rounded-lg border border-input bg-background px-4 py-3 text-sm font-mono leading-6 text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {(previewMode === "preview" || previewMode === "split") && (
          <div className="flex flex-col">
            <label className="mb-1.5 block text-sm font-medium">预览</label>
            <div className="min-h-[500px] w-full overflow-auto rounded-lg border border-input bg-card px-4 py-3">
              <MarkdownRenderer content={content || "*预览区域*"} />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => router.push("/admin")}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          取消
        </button>
        <button
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
        >
          {isSaving && !published ? "保存中..." : "保存草稿"}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving && published ? "发布中..." : "保存并发布"}
        </button>
      </div>
    </div>
  );
}
