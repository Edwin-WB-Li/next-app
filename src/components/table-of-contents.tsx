"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { slugify } from "@/lib/slugify";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
}

function extractHeadings(content: string): TocItem[] {
  const lines = content.split(/\r?\n/);
  const headings: TocItem[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = stripMarkdown(match[2]);
      headings.push({
        id: slugify(text),
        text,
        level,
      });
    }
  }

  return headings;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");
  const clickingRef = useRef(false);
  const headings = useMemo(() => extractHeadings(content), [content]);

  useEffect(() => {
    const currentHeadings = extractHeadings(content);
    if (currentHeadings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (clickingRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    for (const h of currentHeadings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="文章目录" className="hidden xl:block w-64 shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/50">
          目录
        </p>
        <ul className="space-y-1 border-l border-border">
          {headings.map((item) => (
            <li key={item.id} className={item.level === 3 ? "ml-3" : ""}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  clickingRef.current = true;
                  setActiveId(item.id);
                  document.getElementById(item.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                  setTimeout(() => {
                    clickingRef.current = false;
                  }, 800);
                }}
                className={`block border-l-2 pl-3 py-1 text-sm transition-colors ${
                  activeId === item.id
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-foreground/60 hover:text-foreground"
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
