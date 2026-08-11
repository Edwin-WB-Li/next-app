"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import ThemeToggle from "./theme-toggle";
import { IconLogo } from "@/shared/components/icons";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/hiking", label: "旅行足迹" },
  { href: "/kanban", label: "看板" },
  { href: "/todos", label: "待办" },
  { href: "/quiz", label: "答题" },
  // { href: "/admin", label: "文章管理" },
];

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 focus-visible:rounded-lg">
      <div className="bg-foreground text-background relative flex h-9 w-9 items-center justify-center rounded-xl motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105 motion-safe:group-hover:rotate-3">
        <IconLogo />
      </div>
      <div className="flex flex-col gap-1 leading-none">
        <span className="text-foreground text-[15px] font-bold tracking-tight">路人甲</span>
        <span className="text-muted-foreground/70 text-[10px] font-medium tracking-wider uppercase">
          Personal Blog
        </span>
      </div>
    </Link>
  );
}

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative py-1.5 text-[13px] font-medium transition-colors duration-200 focus-visible:rounded-md focus-visible:px-1 focus-visible:py-0.5 ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"} `}
    >
      {label}
      <span
        className={`bg-foreground absolute -bottom-0.5 left-1/2 h-[2px] -translate-x-1/2 rounded-full motion-safe:transition-all motion-safe:duration-300 ${isActive ? "w-4 opacity-100" : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-100"} `}
      />
    </Link>
  );
}

const MobileMenu = memo(function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id="mobile-menu"
      ref={menuRef}
      className="border-border bg-background/95 border-t backdrop-blur-xl sm:hidden"
    >
      <nav className="mx-auto flex max-w-5xl flex-col gap-1 px-6 py-3">
        {navLinks.map((link) => (
          <div key={link.href} className="group">
            <NavLink href={link.href} label={link.label} onClick={onClose} />
          </div>
        ))}
      </nav>
    </div>
  );
});

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);

  return (
    <header className="border-border/60 bg-background/80 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-6">
        <Logo />

        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <div key={link.href} className="group px-3">
              <NavLink href={link.href} label={link.label} />
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="border-border bg-card focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-9 w-9 items-center justify-center rounded-lg border focus-visible:ring-2 focus-visible:ring-offset-2 sm:hidden"
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 12h16" />
                <path d="M4 6h16" />
                <path d="M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </header>
  );
}
