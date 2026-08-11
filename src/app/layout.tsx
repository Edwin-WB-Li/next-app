import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import SiteHeader from "@/components/site-header";
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
  children: ReactNode;
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
                const meta = document.querySelector('meta[name="theme-color"]');
                if (meta) meta.setAttribute('content', isDark ? '#0f172a' : '#f8fafc');
              })();
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <a
          href="#main-content"
          className="focus:bg-background focus:text-foreground sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:shadow-lg"
        >
          跳到主内容
        </a>
        <NextTopLoader color="var(--primary)" height={2} showSpinner={false} />
        <SiteHeader />

        <main id="main-content" className="flex-1 pt-[68px]">
          {children}
        </main>

        <footer className="border-border border-t">
          <div className="text-muted-foreground mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-5 text-sm sm:flex-row">
            <span>基于 Next.js 构建</span>
            <span>© {new Date().getFullYear()} My Blog</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
