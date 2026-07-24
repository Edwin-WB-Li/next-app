"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { slugify } from "@/lib/slugify";
import { remarkEmoji } from "@/lib/remark-emoji";
import remarkDirective from "remark-directive";
import {
  preprocessContainers,
  remarkContainer,
} from "@/lib/remark-container";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
}

const ThemeContext = React.createContext(false);

function CodeBlock({ children, className }: { children?: React.ReactNode; className?: string }) {
  const isDark = React.useContext(ThemeContext);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const isInline = !className;

  if (isInline) {
    return (
      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">
        {children}
      </code>
    );
  }

  return (
    <SyntaxHighlighter
      style={isDark ? oneDark : oneLight}
      language={language || "text"}
      PreTag="div"
      className="rounded-lg my-4 text-sm"
    >
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  );
}

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mt-8 mb-4 text-3xl font-bold tracking-tight text-foreground">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => {
    const text = React.Children.toArray(children).join("");
    return (
      <h2
        id={slugify(text)}
        className="mt-8 mb-4 text-2xl font-semibold tracking-tight text-foreground border-b border-border pb-2 scroll-mt-24"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children?: React.ReactNode }) => {
    const text = React.Children.toArray(children).join("");
    return (
      <h3
        id={slugify(text)}
        className="mt-6 mb-3 text-xl font-semibold tracking-tight text-foreground scroll-mt-24"
      >
        {children}
      </h3>
    );
  },
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-4 leading-7">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-4 ml-6 list-disc">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-4 ml-6 list-decimal">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li className="my-1">{children}</li>,
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-4 border-l-4 border-primary/30 pl-4 italic text-foreground/70">
      {children}
    </blockquote>
  ),
  code: CodeBlock,
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a
      href={href}
      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-muted">{children}</thead>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border border-border px-4 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border border-border px-4 py-2">{children}</td>
  ),
  hr: () => <hr className="my-8 border-border" />,
  div: ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    if (typeof className === "string") {
      if (className?.startsWith("custom-block-title")) {
        const type = className.split("--")[1] || "info";
        const titleColors: Record<string, string> = {
          tip: "text-blue-600 dark:text-blue-400",
          info: "text-blue-600 dark:text-blue-400",
          warning: "text-amber-600 dark:text-amber-400",
          danger: "text-red-600 dark:text-red-400",
        };
        return (
          <div className={`mb-2 text-sm font-semibold ${titleColors[type] || titleColors.info}`} {...props}>
            {children}
          </div>
        );
      }
      if (className.split(" ").includes("custom-block")) {
        const type =
          className
            .split(" ")
            .find((c) => c !== "custom-block") || "default";
        const typeStyles: Record<string, string> = {
          tip: "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20 dark:border-l-blue-400",
          info: "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20 dark:border-l-blue-400",
          warning:
            "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20 dark:border-l-amber-400",
          danger:
            "border-l-red-500 bg-red-50/50 dark:bg-red-950/20 dark:border-l-red-400",
        };
        return (
          <div
            className={`my-6 rounded-r-lg border-l-4 px-4 py-3 ${typeStyles[type] || typeStyles.info} [&>:first-child]:mt-0 [&>:last-child]:mb-0`}
            {...props}
          >
            {children}
          </div>
        );
      }
    }
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  },
  details: ({ className, children, ...props }: React.HTMLAttributes<HTMLDetailsElement>) => {
    const isCustomBlock =
      typeof className === "string" &&
      className.includes("custom-block");
    if (isCustomBlock) {
      return (
        <details
          className={`my-6 rounded-lg border border-border bg-muted/30 px-4 py-3 ${className}`}
          {...props}
        >
          {children}
        </details>
      );
    }
    return (
      <details className={className} {...props}>
        {children}
      </details>
    );
  },
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    const update = () => setIsDark(el.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const processedContent = preprocessContainers(content);

  return (
    <ThemeContext.Provider value={isDark}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkEmoji, remarkDirective, remarkContainer]}
        rehypePlugins={[rehypeKatex]}
        components={markdownComponents}
      >
        {processedContent}
      </ReactMarkdown>
    </ThemeContext.Provider>
  );
}
