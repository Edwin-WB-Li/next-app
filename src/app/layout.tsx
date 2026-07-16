import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import NextTopLoader from "nextjs-toploader";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextTopLoader color="var(--primary)" height={2} showSpinner={false} />
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              我的博客
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="text-foreground/70 transition-colors hover:text-foreground"
              >
                首页
              </Link>
              <Link
                href="/admin"
                className="text-foreground/70 transition-colors hover:text-foreground"
              >
                后台管理
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t border-border py-6 text-center text-sm text-foreground/50">
          <p>基于 Next.js 16 构建</p>
        </footer>
      </body>
    </html>
  );
}
