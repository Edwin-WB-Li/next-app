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
        <div className="bg-secondary flex h-8 w-8 items-center justify-center rounded-lg">
          <IconTag />
        </div>
        <h2 className="text-foreground text-wrap:balance text-2xl font-bold tracking-tight">
          热门标签
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(([tag, count]) => (
          <span
            key={tag}
            className="border-border bg-card text-foreground hover:bg-muted inline-flex cursor-default items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors"
          >
            {tag}
            <span className="bg-secondary text-muted-foreground rounded px-1.5 py-0 text-[10px] font-medium">
              {count}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}

export default memo(TagsCloud);
