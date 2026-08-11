"use client";

import { useCallback, useReducer, useRef, useState } from "react";
import { QuizSet } from "@/lib/quiz/types";
import { validateQuizSetJson } from "@/lib/quiz/validate";
import { QuizSetCard } from "./quiz-set-card";

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

type FileResult =
  | { status: "valid"; fileName: string; data: QuizSet }
  | { status: "invalid"; fileName: string; errors: string[] };

type ImportState =
  | { status: "idle" }
  | { status: "reading" }
  | { status: "batch"; results: FileResult[] }
  | { status: "importing"; count: number }
  | { status: "success"; importedCount: number; failedCount: number };

type ImportAction =
  | { type: "START_READING" }
  | { type: "BATCH_RESULTS"; results: FileResult[] }
  | { type: "START_IMPORT"; count: number }
  | { type: "SUCCESS"; importedCount: number; failedCount: number }
  | { type: "RESET" };

function importReducer(_state: ImportState, action: ImportAction): ImportState {
  switch (action.type) {
    case "START_READING":
      return { status: "reading" };
    case "BATCH_RESULTS":
      return { status: "batch", results: action.results };
    case "START_IMPORT":
      return { status: "importing", count: action.count };
    case "SUCCESS":
      return {
        status: "success",
        importedCount: action.importedCount,
        failedCount: action.failedCount,
      };
    case "RESET":
      return { status: "idle" };
    default:
      return _state;
  }
}

async function processFile(file: File): Promise<FileResult> {
  if (!file.name.endsWith(".json")) {
    return { status: "invalid", fileName: file.name, errors: ["仅支持 JSON 文件"] };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      status: "invalid",
      fileName: file.name,
      errors: ["文件大小不能超过 1MB"],
    };
  }

  try {
    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return {
        status: "invalid",
        fileName: file.name,
        errors: ["JSON 解析失败，请检查文件格式"],
      };
    }

    const result = validateQuizSetJson(parsed);
    if (!result.success) {
      return { status: "invalid", fileName: file.name, errors: result.errors };
    }

    return { status: "valid", fileName: file.name, data: result.data };
  } catch {
    return { status: "invalid", fileName: file.name, errors: ["读取文件失败"] };
  }
}

function FileDropZone({
  onFilesSelect,
  disabled,
}: {
  onFilesSelect: (files: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) onFilesSelect(files);
      e.target.value = "";
    },
    [onFilesSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
      if (files.length > 0) onFilesSelect(files);
    },
    [onFilesSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="点击或拖拽上传 JSON 文件"
        onClick={disabled ? undefined : handleClick}
        onKeyDown={disabled ? undefined : handleKeyDown}
        onDrop={disabled ? undefined : handleDrop}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        className={`border-border focus-visible:ring-ring focus-visible:ring-offset-background flex w-full cursor-pointer flex-col items-center gap-2 rounded border-2 border-dashed px-6 py-8 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
          isDragging ? "border-foreground bg-muted" : "hover:border-foreground/60 hover:bg-muted/50"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <span className="text-muted-foreground">点击或拖拽上传 JSON 文件</span>
        <span className="text-muted-foreground/60 text-xs">文件大小不超过 1MB，支持批量上传</span>
      </div>
      <input
        ref={inputRef}
        id="quiz-import-file"
        type="file"
        accept=".json,application/json"
        multiple
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        aria-label="选择 JSON 文件"
      />
    </div>
  );
}

function FileErrorItem({ fileName, errors }: { fileName: string; errors: string[] }) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="border-error text-error rounded border bg-red-50 px-4 py-3 dark:bg-red-950/20"
    >
      <p className="mb-1 text-sm font-medium">{fileName}</p>
      <ul className="list-inside list-disc text-sm">
        {errors.map((err, i) => (
          <li key={i}>{err}</li>
        ))}
      </ul>
    </div>
  );
}

interface QuizImporterProps {
  onImport: (set: QuizSet) => Promise<void>;
}

export function QuizImporter({ onImport }: QuizImporterProps) {
  const [state, dispatch] = useReducer(importReducer, { status: "idle" });

  const handleFilesSelect = useCallback(async (files: File[]) => {
    dispatch({ type: "START_READING" });
    const results = await Promise.all(files.map(processFile));
    dispatch({ type: "BATCH_RESULTS", results });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (state.status !== "batch") return;
    const validSets = state.results
      .filter((r): r is FileResult & { status: "valid" } => r.status === "valid")
      .map((r) => r.data);
    if (validSets.length === 0) return;

    dispatch({ type: "START_IMPORT", count: validSets.length });
    let imported = 0;
    let failed = 0;
    for (const set of validSets) {
      try {
        await onImport(set);
        imported++;
      } catch {
        failed++;
      }
    }
    dispatch({ type: "SUCCESS", importedCount: imported, failedCount: failed });
  }, [state, onImport]);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const validResults =
    state.status === "batch"
      ? state.results.filter((r): r is FileResult & { status: "valid" } => r.status === "valid")
      : [];

  const invalidResults =
    state.status === "batch"
      ? state.results.filter((r): r is FileResult & { status: "invalid" } => r.status === "invalid")
      : [];

  return (
    <div className="flex flex-col gap-4">
      <FileDropZone
        onFilesSelect={handleFilesSelect}
        disabled={state.status === "reading" || state.status === "importing"}
      />

      {state.status === "reading" && (
        <p className="text-muted-foreground text-center text-sm">读取文件中…</p>
      )}

      {state.status === "batch" && (
        <div className="flex flex-col gap-4">
          {validResults.length > 0 && (
            <>
              <p className="text-muted-foreground text-sm">共 {validResults.length} 个有效文件：</p>
              <div className="grid grid-cols-1 gap-4">
                {validResults.map((r) => (
                  <QuizSetCard key={r.fileName}>
                    <QuizSetCard.Header
                      title={r.data.title}
                      description={r.data.description}
                      questionCount={r.data.questions.length}
                    />
                    <QuizSetCard.Stats questions={r.data.questions} />
                    <QuizSetCard.Tags questions={r.data.questions} />
                  </QuizSetCard>
                ))}
              </div>
            </>
          )}

          {invalidResults.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-error text-sm font-medium">
                {invalidResults.length} 个文件校验失败：
              </p>
              {invalidResults.map((r) => (
                <FileErrorItem key={r.fileName} fileName={r.fileName} errors={r.errors} />
              ))}
            </div>
          )}

          <div className="flex gap-3">
            {validResults.length > 0 && (
              <button
                type="button"
                onClick={handleConfirm}
                className="bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                {invalidResults.length > 0
                  ? `导入有效文件`
                  : `确认导入 ${validResults.length} 个练习本`}
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="border-border text-foreground hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center justify-center rounded border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              重新选择
            </button>
          </div>
        </div>
      )}

      {state.status === "importing" && (
        <p className="text-muted-foreground text-center text-sm">导入中… 共 {state.count} 个</p>
      )}

      {state.status === "success" && (
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-success text-sm font-medium">
            导入完成：成功 {state.importedCount} 个
            {state.failedCount > 0 ? `，失败 ${state.failedCount} 个` : ""}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-ring focus-visible:ring-offset-background inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            继续导入
          </button>
        </div>
      )}
    </div>
  );
}
