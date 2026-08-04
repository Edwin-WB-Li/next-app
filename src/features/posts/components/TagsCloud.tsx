"use client";

import { memo } from "react";
import { IconTag } from "@/shared/components/icons";

interface TagsCloudProps {
  tags: [string, number][];
}

function TagsCloud({ tags }: TagsCloudProps) {
  if (tags.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center gap-2 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
          <IconTag />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-wrap:balance">
          热门标签
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(([tag, count]) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted cursor-default"
          >
            {tag}
            <span className="rounded bg-secondary px-1.5 py-0 text-[10px] font-medium text-muted-foreground">
              {count}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}

export default memo(TagsCloud);
