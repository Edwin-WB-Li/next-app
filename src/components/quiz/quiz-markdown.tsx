"use client";

import { useState, useEffect, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface QuizMarkdownProps {
  content: string;
  className?: string;
}

function CodeBlock({ className, children }: { className?: string; children?: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    const update = () => setIsDark(el.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

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
      className="my-2 rounded-lg text-sm"
    >
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  );
}

const components = {
  code: CodeBlock,
  p: ({ children }: { children?: ReactNode }) => <p className="leading-relaxed">{children}</p>,
  pre: ({ children }: { children?: ReactNode }) => <>{children}</>,
};

export default function QuizMarkdown({ content, className }: QuizMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
