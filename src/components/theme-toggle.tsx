"use client";

import { useSyncExternalStore, useCallback } from "react";
import { IconMoon, IconSun } from "@/shared/components/icons";

function subscribe(callback: () => void) {
  const el = document.documentElement;
  const observer = new MutationObserver(callback);
  observer.observe(el, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next ? "#0f172a" : "#f8fafc");
  }, [dark]);

  return (
    <button
      onClick={toggle}
      className="border-border bg-muted focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex h-7 w-12 items-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
      aria-label={dark ? "切换到亮色模式" : "切换到暗色模式"}
    >
      <span
        className={`bg-card absolute left-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full shadow-sm motion-safe:transition-transform motion-safe:duration-200 ${
          dark ? "translate-x-5" : "translate-x-0"
        }`}
      >
        {dark ? <IconMoon /> : <IconSun />}
      </span>
    </button>
  );
}
