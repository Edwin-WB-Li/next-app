"use client";

import { memo } from "react";
import { Question } from "@/lib/quiz/types";

interface OptionListProps {
  question: Question;
  selected: string[];
  onChange?: (selected: string[]) => void;
  review?: boolean;
}

function OptionList({ question, selected, onChange, review }: OptionListProps) {
  const isSingle = question.type === "single" || question.type === "true_false";

  function handleToggle(optionId: string) {
    if (review || !onChange) return;

    if (isSingle) {
      // 单选：再次点击取消选中，否则选中
      onChange(selected.includes(optionId) ? [] : [optionId]);
    } else {
      // 多选：toggle
      const set = new Set(selected);
      if (set.has(optionId)) {
        set.delete(optionId);
      } else {
        set.add(optionId);
      }
      onChange(Array.from(set));
    }
  }

  return (
    <div className="flex flex-col gap-2" role="group" aria-label="选项列表">
      {question.options.map((option) => {
        const isSelected = selected.includes(option.id);
        let status: "default" | "correct" | "wrong" = "default";

        if (review) {
          if (question.correctAnswers.includes(option.id)) {
            status = "correct";
          } else if (isSelected && !question.correctAnswers.includes(option.id)) {
            status = "wrong";
          }
        }

        const inputType = isSingle ? "radio" : "checkbox";

        return (
          <label
            key={option.id}
            data-status={status}
            onClick={(e) => {
              // 单选已选中时，label 点击会阻止默认行为（保持 checked），
              // 同时手动触发取消选中
              if (!review && isSingle && isSelected) {
                e.preventDefault();
                handleToggle(option.id);
              }
            }}
            className={`flex min-h-[44px] cursor-pointer items-center gap-3 border px-4 py-2.5 transition-colors ${review ? "cursor-default" : "hover:bg-muted/50"} ${status === "correct" ? "border-success/50 bg-success/5" : ""} ${status === "wrong" ? "border-error/50 bg-error/5" : ""} ${status === "default" && isSelected ? "border-foreground/30 bg-muted" : "border-border bg-card"} `}
          >
            <input
              type={inputType}
              name={question.id}
              value={option.id}
              checked={isSelected}
              onChange={() => handleToggle(option.id)}
              disabled={review}
              className="accent-foreground h-4 w-4 shrink-0"
              aria-labelledby={`opt-${question.id}-${option.id}`}
            />
            <span id={`opt-${question.id}-${option.id}`} className="text-foreground text-sm">
              {option.text}
            </span>
            {review && status === "correct" && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-success dark:text-success ml-auto shrink-0"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {review && status === "wrong" && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-error dark:text-error ml-auto shrink-0"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            )}
          </label>
        );
      })}
    </div>
  );
}

export default memo(OptionList);
