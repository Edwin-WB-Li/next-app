"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { uploadHikingPhoto } from "@/lib/upload";

interface ImageUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export default function ImageUploader({ photos, onChange }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addUrl = useCallback(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (photos.includes(trimmed)) {
      setUploadError("该图片已存在");
      return;
    }
    onChange([...photos, trimmed]);
    setUrlInput("");
    setUploadError(null);
  }, [urlInput, photos, onChange]);

  const removePhoto = useCallback(
    (index: number) => {
      onChange(photos.filter((_, i) => i !== index));
    },
    [photos, onChange]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadHikingPhoto(formData);
        if (!photos.includes(result.url)) {
          onChange([...photos, result.url]);
        }
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "上传失败");
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [photos, onChange]
  );

  return (
    <div className="space-y-3">
      {/* 已有图片列表 */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className="group border-border bg-muted relative aspect-square overflow-hidden rounded-lg border"
            >
              <Image
                src={photo}
                alt={`图片 ${index + 1}`}
                fill
                className="object-cover"
                sizes="100px"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                aria-label={`删除图片 ${index + 1}`}
                className="absolute top-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* URL 输入 */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="输入图片 URL，按回车添加"
          className="border-border bg-background text-foreground placeholder:text-muted-foreground flex-1 rounded-md border px-3 py-2 text-sm transition-colors outline-none focus:border-[var(--hiking-primary)] focus:ring-1 focus:ring-[var(--hiking-primary)]"
        />
        <button
          type="button"
          onClick={addUrl}
          className="border-border bg-muted text-foreground hover:bg-muted/80 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
        >
          添加
        </button>
      </div>

      {/* 文件上传 */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center justify-center gap-2 rounded-md border border-dashed py-3 text-sm transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              上传中...
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              点击上传本地图片
            </>
          )}
        </button>
      </div>

      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
    </div>
  );
}
