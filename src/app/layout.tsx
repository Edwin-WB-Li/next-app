import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import NextTopLoader from "nextjs-toploader";
import ThemeToggle from "@/components/theme-toggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "我的博客",
  description: "基于 Next.js 构建的个人博客",
};

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/hiking", label: "足迹地图" },
  { href: "/kanban", label: "看板" },
  { href: "/admin", label: "后台管理" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const saved = localStorage.getItem('theme');
                const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) document.documentElement.classList.add('dark');
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextTopLoader color="var(--primary)" height={2} showSpinner={false} />
        <header className="fixed top-0 left-0 right-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex h-[74px] max-w-5xl items-center justify-between px-6">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              我的博客
            </Link>

            <nav className="hidden items-center gap-6 text-sm sm:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-foreground/70 transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="flex-1 pt-[74px]">{children}</div>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-5 text-sm text-muted-foreground sm:flex-row">
            <span>基于 Next.js 构建</span>
            <span>© {new Date().getFullYear()} My Blog</span>
            {/* <Link
              href="/"
              className="transition-colors hover:text-foreground"
            >
              RSS Feed
            </Link> */}
          </div>
        </footer>
      </body>
    </html>
  );
}
