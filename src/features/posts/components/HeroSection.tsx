"use client";

import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { IconCheckmark, IconArrowRight, IconMapPin } from "@/shared/components/icons";

function HeroSection() {
  return (
    <section className="flex flex-col items-center py-16 sm:py-20">
      {/* eyebrow */}
      <span className="mb-5 text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground/60">
        Digital Explorer · Personal Blog
      </span>

      {/* 头像 */}
      <div className="relative">
        <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-border ring-offset-2 ring-offset-background sm:h-24 sm:w-24">
          <Image
            src="https://images.unsplash.com/photo-1554629947-334ff61d85dc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&h=1000&q=90"
            alt="头像"
            fill
            sizes="96px"
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-background">
          <IconCheckmark />
        </div>
      </div>

      {/* 主标题 */}
      <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-wrap:balance">
        你好，我是{" "}
        <span className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
          路人甲
        </span>
        <span className="inline-block h-[0.8em] w-[3px] translate-y-0.5 bg-emerald-500 motion-safe:animate-pulse" />
      </h1>

      <p className="mt-3 max-w-lg text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
        一名热爱技术与创作的开发者，在这里记录学习笔记、项目实践与生活思考。
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          href="#posts"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          浏览文章
          <IconArrowRight />
        </Link>
        <Link
          href="/hiking"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          旅行足迹
          <IconMapPin />
        </Link>
      </div>

      {/* 古诗引用 */}
      <blockquote className="mt-8 border-l-2 border-emerald-500/40 pl-4">
        <p className="text-sm italic leading-relaxed text-muted-foreground">
          &ldquo;路漫漫其修远兮，吾将上下而求索&rdquo;
        </p>
        <p className="mt-1 text-xs text-muted-foreground/50">——《离骚》战国·屈原</p>
      </blockquote>
    </section>
  );
}

export default memo(HeroSection);
