"use client";

import { memo } from "react";
import type { Post } from "../types";
import PostCard from "./PostCard";
import { IconBookOpen } from "@/shared/components/icons";

interface PostGridProps {
  posts: Post[];
}

function PostGrid({ posts }: PostGridProps) {
  return (
    <section id="posts" className="py-8">
      <div className="flex items-center gap-2 pb-6">
        <div className="bg-secondary flex h-8 w-8 items-center justify-center rounded-lg">
          <IconBookOpen />
        </div>
        <h2 className="text-foreground text-wrap:balance text-2xl font-bold tracking-tight">
          最新文章
        </h2>
        <span className="bg-secondary text-muted-foreground ml-2 rounded-md px-2 py-0.5 text-xs font-medium">
          {posts.length} 篇
        </span>
      </div>

      {posts.length === 0 ? (
        <div className="border-border text-muted-foreground flex flex-col items-center rounded-xl border border-dashed py-16">
          <IconBookOpen width={40} height={40} strokeWidth="1.5" className="mb-3 opacity-50" />
          <p>暂无已发布的文章</p>
          <p className="mt-1 text-sm opacity-60">去后台创建你的第一篇文章吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 py-2 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 6).map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

export default memo(PostGrid);
