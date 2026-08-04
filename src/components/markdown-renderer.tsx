"use client";

import {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
  Children,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { slugify } from "@/lib/slugify";
import { remarkEmoji } from "@/lib/remark-emoji";
import remarkDirective from "remark-directive";
import { preprocessContainers, remarkContainer } from "@/lib/remark-container";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
}

const ThemeContext = createContext(false);

function CodeBlock({ children, className }: { children?: ReactNode; className?: string }) {
  const isDark = useContext(ThemeContext);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const isInline = !className;

  if (isInline) {
    return (
      <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-sm">
        {children}
      </code>
    );
  }

  return (
    <SyntaxHighlighter
      style={isDark ? oneDark : oneLight}
      language={language || "text"}
      PreTag="div"
      className="my-4 rounded-lg text-sm"
    >
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  );
}

function MarkdownH2({ children }: { children?: ReactNode }) {
  const text = Children.toArray(children).join("");
  return (
    <h2
      id={slugify(text)}
      className="text-foreground border-border mt-8 mb-4 scroll-mt-24 border-b pb-2 text-2xl font-semibold tracking-tight"
    >
      {children}
    </h2>
  );
}

function MarkdownH3({ children }: { children?: ReactNode }) {
  const text = Children.toArray(children).join("");
  return (
    <h3
      id={slugify(text)}
      className="text-foreground mt-6 mb-3 scroll-mt-24 text-xl font-semibold tracking-tight"
    >
      {children}
    </h3>
  );
}

function MarkdownDiv({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
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
        <div
          className={`mb-2 text-sm font-semibold ${titleColors[type] || titleColors.info}`}
          {...props}
        >
          {children}
        </div>
      );
    }
    if (className.split(" ").includes("custom-block")) {
      const type = className.split(" ").find((c) => c !== "custom-block") || "default";
      const typeStyles: Record<string, string> = {
        tip: "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20 dark:border-l-blue-400",
        info: "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20 dark:border-l-blue-400",
        warning: "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20 dark:border-l-amber-400",
        danger: "border-l-red-500 bg-red-50/50 dark:bg-red-950/20 dark:border-l-red-400",
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
}

function MarkdownDetails({ className, children, ...props }: HTMLAttributes<HTMLDetailsElement>) {
  const isCustomBlock = typeof className === "string" && className.includes("custom-block");
  if (isCustomBlock) {
    return (
      <details
        className={`border-border bg-muted/30 my-6 rounded-lg border px-4 py-3 ${className}`}
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
}

const markdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="text-foreground mt-8 mb-4 text-3xl font-bold tracking-tight">{children}</h1>
  ),
  h2: MarkdownH2,
  h3: MarkdownH3,
  p: ({ children }: { children?: ReactNode }) => <p className="my-4 leading-7">{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="my-4 ml-6 list-disc">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="my-4 ml-6 list-decimal">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => <li className="my-1">{children}</li>,
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="border-primary/30 text-foreground/70 my-4 border-l-4 pl-4 italic">
      {children}
    </blockquote>
  ),
  code: CodeBlock,
  a: ({ children, href }: { children?: ReactNode; href?: string }) => (
    <a
      href={href}
      className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: ReactNode }) => <thead className="bg-muted">{children}</thead>,
  th: ({ children }: { children?: ReactNode }) => (
    <th className="border-border border px-4 py-2 text-left font-semibold">{children}</th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border-border border px-4 py-2">{children}</td>
  ),
  hr: () => <hr className="border-border my-8" />,
  div: MarkdownDiv,
  details: MarkdownDetails,
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

  const processedContent = useMemo(() => preprocessContainers(content), [content]);

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
