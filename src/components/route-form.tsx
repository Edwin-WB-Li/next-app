"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Difficulty, RouteFormData } from "@/lib/hiking";
import ImageUploader from "./image-uploader";
import MarkdownRenderer from "./markdown-renderer";

interface RouteFormProps {
  provinces: { name: string; code: string }[];
  initialData?: {
    name: string;
    date: string;
    days: number;
    distance: number;
    maxAltitude: number;
    difficulty: Difficulty;
    season: string;
    tags: string[];
    photos: string[];
    notesContent?: string;
    provinceCode?: string;
  };
  onSubmit: (data: {
    provinceCode: string;
    newProvinceName?: string;
    routeData: RouteFormData;
  }) => Promise<{ error?: string }>;
}

const difficultyOptions: Difficulty[] = ["休闲", "进阶", "硬核"];

export default function RouteForm({
  provinces,
  initialData,
  onSubmit,
}: RouteFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [provinceCode, setProvinceCode] = useState(
    initialData?.provinceCode || ""
  );
  const [isNewProvince, setIsNewProvince] = useState(false);
  const [newProvinceName, setNewProvinceName] = useState("");
  const [newProvinceCode, setNewProvinceCode] = useState("");

  const [name, setName] = useState(initialData?.name || "");
  const [date, setDate] = useState(initialData?.date || "");
  const [days, setDays] = useState(initialData?.days ?? 1);
  const [distance, setDistance] = useState(initialData?.distance ?? 0);
  const [maxAltitude, setMaxAltitude] = useState(initialData?.maxAltitude ?? 0);
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initialData?.difficulty || "休闲"
  );
  const [season, setSeason] = useState(initialData?.season || "");
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags?.join(", ") || ""
  );
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [notesContent, setNotesContent] = useState(
    initialData?.notesContent || ""
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!showPreview) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPreview(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showPreview]);

  const handleProvinceChange = useCallback(
    (value: string) => {
      if (value === "__new__") {
        setIsNewProvince(true);
        setProvinceCode("");
      } else {
        setIsNewProvince(false);
        setProvinceCode(value);
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // 校验
      if (!name.trim()) {
        setError("路线名称不能为空");
        return;
      }
      if (!date) {
        setError("出发日期不能为空");
        return;
      }
      if (!isNewProvince && !provinceCode) {
        setError("请选择省份");
        return;
      }
      if (isNewProvince) {
        if (!newProvinceName.trim()) {
          setError("省份名称不能为空");
          return;
        }
        if (!newProvinceCode.trim()) {
          setError("省份编码不能为空");
          return;
        }
      }

      const routeData: RouteFormData = {
        name: name.trim(),
        date,
        days: Math.max(1, days),
        distance: Math.max(0, distance),
        maxAltitude: Math.max(0, maxAltitude),
        difficulty,
        season: season.trim() || "未知",
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        photos,
        notesContent: notesContent.trim() || undefined,
      };

      setSubmitting(true);
      try {
        const result = await onSubmit({
          provinceCode: isNewProvince ? newProvinceCode.trim() : provinceCode,
          newProvinceName: isNewProvince
            ? newProvinceName.trim()
            : undefined,
          routeData,
        });

        if (result?.error) {
          setError(result.error);
        } else {
          router.push("/hiking/admin");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "提交失败");
      } finally {
        setSubmitting(false);
      }
    },
    [
      name,
      date,
      days,
      distance,
      maxAltitude,
      difficulty,
      season,
      tagsInput,
      photos,
      notesContent,
      provinceCode,
      isNewProvince,
      newProvinceName,
      newProvinceCode,
      onSubmit,
      router,
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 省份选择 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          所属省份 <span className="text-red-500">*</span>
        </label>
        <select
          value={isNewProvince ? "__new__" : provinceCode}
          onChange={(e) => handleProvinceChange(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-[var(--hiking-primary)] focus:ring-1 focus:ring-[var(--hiking-primary)]"
        >
          <option value="">请选择省份</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
          <option value="__new__">+ 新增省份</option>
        </select>

        {isNewProvince && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                省份名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newProvinceName}
                onChange={(e) => setNewProvinceName(e.target.value)}
                placeholder="如：浙江省"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--hiking-primary)] focus:ring-1 focus:ring-[var(--hiking-primary)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                省份编码 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newProvinceCode}
                onChange={(e) => setNewProvinceCode(e.target.value)}
                placeholder="如：330000"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--hiking-primary)] focus:ring-1 focus:ring-[var(--hiking-primary)]"
              />
            </div>
          </div>
        )}
      </div>

      {/* 路线名称 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          路线名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="如：四姑娘山大峰攀登"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--hiking-primary)] focus:ring-1 focus:ring-[var(--hiking-primary)]"
        />
      </div>

      {/* 基本信息网格 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            出发日期 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-[var(--hiking-primary)] focus:ring-1 focus:ring-[var(--hiking-primary)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            往返天数
          </label>
          <input
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-[var(--hiking-primary)] focus:ring-1 focus:ring-[var(--hiking-primary)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            全程距离 (km)
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-[var(--hiking-primary)] focus:ring-1 focus:ring-[var(--hiking-primary)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            最高海拔 (m)
          </label>
          <input
            type="number"
            min={0}
            value={maxAltitude}
            onChange={(e) => setMaxAltitude(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-[var(--hiking-primary)] focus:ring-1 focus:ring-[var(--hiking-primary)]"
          />
        </div>
      </div>

      {/* 难度和季节 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            路线难度
          </label>
          <div className="flex gap-2">
            {difficultyOptions.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  difficulty === d
                    ? "border-[var(--hiking-primary)] bg-[var(--hiking-primary)] text-white"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            出行季节
          </label>
          <input
            type="text"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="如：秋季"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--hiking-primary)] focus:ring-1 focus:ring-[var(--hiking-primary)]"
          />
        </div>
      </div>

      {/* 标签 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          标签
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="多个标签用逗号分隔，如：山野, 雪山, 高海拔"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--hiking-primary)] focus:ring-1 focus:ring-[var(--hiking-primary)]"
        />
        {tagsInput && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tagsInput
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
              .map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md bg-[var(--hiking-muted)] px-2 py-0.5 text-xs text-[var(--hiking-primary)]"
                >
                  {tag}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* 图片 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          路线图片
        </label>
        <ImageUploader photos={photos} onChange={setPhotos} />
      </div>

      {/* 随笔 */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">
            徒步随笔
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={!notesContent.trim()}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--hiking-primary)] transition-colors hover:bg-[var(--hiking-muted)] disabled:opacity-40"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            预览
          </button>
        </div>
        <textarea
          value={notesContent}
          onChange={(e) => setNotesContent(e.target.value)}
          placeholder="支持 Markdown 格式，记录路线攻略、装备测评、个人感悟..."
          rows={10}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--hiking-primary)] focus:ring-1 focus:ring-[var(--hiking-primary)]"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          支持 Markdown 语法：# 标题、**粗体**、- 列表、| 表格等
        </p>
      </div>

      {/* Markdown 预览弹框 */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                内容预览
              </h3>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="prose-hiking rounded-lg border border-border bg-muted/30 p-4 sm:p-5">
              <MarkdownRenderer content={notesContent} />
            </div>
          </div>
        </div>
      )}

      {/* 提交按钮 */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-[var(--hiking-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {submitting
            ? "保存中..."
            : isEdit
            ? "保存修改"
            : "创建路线"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/hiking/admin")}
          className="rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          取消
        </button>
      </div>
    </form>
  );
}
