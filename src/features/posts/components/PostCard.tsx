"use client";

import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import type { Post } from "../types";
import { readingTime, formatDate } from "../utils";
import { IconCalendar, IconClock, IconArrowRight } from "@/shared/components/icons";

interface PostCardProps {
  post: Post;
  index: number;
}

function PostCard({ post, index }: PostCardProps) {
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm motion-safe:transition motion-safe:duration-300 motion-safe:hover:shadow-md motion-safe:hover:-translate-y-0.5"
    >
      <Link
        href={`/posts/${post.slug}`}
        aria-label={`阅读文章：${post.title}`}
        className="relative block h-40 w-full overflow-hidden lg:h-44 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:rounded-xl"
      >
        <Image
          src={post.coverImage || `https://picsum.photos/seed/${post.slug}/800/400`}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={index === 0}
          className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <IconCalendar />
            {formatDate(post.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <IconClock />
            {readingTime(post.summary)} 分钟
          </span>
        </div>

        {post.tags != null && post.tags.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 3 ? (
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{post.tags.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}

        <Link
          href={`/posts/${post.slug}`}
          className="focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        >
          <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">
            {post.title}
          </h3>
        </Link>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.summary}
        </p>

        <div className="mt-auto pt-3">
          <Link
            href={`/posts/${post.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 transition-colors hover:underline focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 dark:text-sky-400"
          >
            阅读全文
            <IconArrowRight />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default memo(PostCard);
