"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MarkdownRenderer from "./markdown-renderer";
import { generateSlug } from "@/shared/utils/text";
import { usePostSave } from "@/features/posts/hooks/usePostSave";

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
  const [published] = useState(initialPublished);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview" | "split">("split");

  const { isSaving, error, handleSave } = usePostSave({
    postId,
    isEditing,
    title,
    slug,
    summary,
    content,
    published,
  });

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isEditing) {
      setSlug(generateSlug(value));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="post-title" className="mb-1.5 block text-sm font-medium">
            标题
          </label>
          <Input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="文章标题"
          />
        </div>
        <div>
          <label htmlFor="post-slug" className="mb-1.5 block text-sm font-medium">
            Slug
          </label>
          <Input
            id="post-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-friendly-slug"
            className="font-mono"
          />
        </div>
      </div>

      <div>
        <label htmlFor="post-summary" className="mb-1.5 block text-sm font-medium">
          摘要
        </label>
        <Input
          id="post-summary"
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="文章简短摘要"
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
        <div className="text-foreground/50 text-xs">{content.length} 字符</div>
      </div>

      <div
        className={`grid gap-4 ${
          previewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {previewMode === "edit" || previewMode === "split" ? (
          <div className="flex flex-col">
            <label htmlFor="post-content" className="mb-1.5 block text-sm font-medium">
              Markdown 内容
            </label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="在此输入 Markdown 内容..."
              className="min-h-[500px] resize-y font-mono leading-6"
            />
          </div>
        ) : null}

        {previewMode === "preview" || previewMode === "split" ? (
          <div className="flex flex-col">
            <span className="mb-1.5 block text-sm font-medium">预览</span>
            <div className="border-input bg-card min-h-[500px] w-full overflow-auto rounded-lg border px-4 py-3">
              <MarkdownRenderer content={content || "*预览区域*"} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => router.push("/admin")}
          className="border-input bg-background text-foreground hover:bg-muted inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors"
        >
          取消
        </button>
        <button
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="bg-muted text-foreground hover:bg-muted/80 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isSaving && !published ? "保存中..." : "保存草稿"}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isSaving && published ? "发布中..." : "保存并发布"}
        </button>
      </div>
    </div>
  );
}
