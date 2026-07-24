import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts, getPopularTags } from "@/lib/posts";

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 300);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

/* Static icon components — hoisted outside page to avoid recreation per render */
function IconCheckmark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function IconMapPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="10" r="3" />
      <path d="M12 2a8 8 0 0 0-8 8c0 1.892.402 3.13 1.5 4.5L12 22l6.5-7.5C19.598 13.13 20 11.892 20 10a8 8 0 0 0-8-8Z" />
    </svg>
  );
}

function IconBookOpen(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary-foreground" aria-hidden="true" {...props}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    </svg>
  );
}

function IconCalendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function IconClock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconTag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary-foreground" aria-hidden="true" {...props}>
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

export default async function Home() {
  const posts = await getPublishedPosts();
  const sortedTags = await getPopularTags(12);

  return (
    <main className="mx-auto w-full max-w-5xl px-6">
      {/* Hero Section */}
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
          <p className="mt-1 text-xs text-muted-foreground/50">
            ——《离骚》战国·屈原
          </p>
        </blockquote>
      </section>

      {/* Latest Posts */}
      <section id="posts" className="py-8">
        <div className="flex items-center gap-2 pb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
            <IconBookOpen />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground text-wrap:balance">
            最新文章
          </h2>
          <span className="ml-2 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {posts.length} 篇
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-16 text-muted-foreground">
            <IconBookOpen width={40} height={40} strokeWidth="1.5" className="mb-3 opacity-50" />
            <p>暂无已发布的文章</p>
            <p className="mt-1 text-sm opacity-60">去后台创建你的第一篇文章吧</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 py-2 md:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 6).map((post, index) => (
                <article
                  key={post.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm motion-safe:transition motion-safe:duration-300 motion-safe:hover:shadow-md motion-safe:hover:-translate-y-0.5"
                >
                  <Link href={`/posts/${post.slug}`} aria-label={`阅读文章：${post.title}`} className="relative block h-40 w-full overflow-hidden lg:h-44 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:rounded-xl">
                    <Image
                      src={post.coverImage || `https://picsum.photos/seed/${post.slug}/800/400`}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index === 0}
                      className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                    <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IconCalendar />
                        {formatDate(post.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconClock />
                        {readingTime(post.summary)} 分钟
                      </span>
                    </div>

                    {post.tags && post.tags.length > 0 ? (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 ? (
                          <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                            +{post.tags.length - 3}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <Link href={`/posts/${post.slug}`} className="focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2">
                      <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {post.summary}
                    </p>

                    <div className="mt-auto pt-3">
                      <Link
                        href={`/posts/${post.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 transition-colors hover:underline focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 dark:text-sky-400"
                      >
                        阅读全文
                        <IconArrowRight />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Tags Cloud */}
      {sortedTags.length > 0 && (
        <section className="py-8">
          <div className="flex items-center gap-2 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
              <IconTag />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground text-wrap:balance">
              热门标签
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {sortedTags.map(([tag, count]) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted cursor-default"
              >
                {tag}
                <span className="rounded bg-secondary px-1.5 py-0 text-[10px] font-medium text-muted-foreground">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12">
        <div className="flex flex-col items-center rounded-2xl border border-border bg-muted/50 px-6 py-10 text-center">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            开始创作你的故事
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            记录技术成长、分享生活感悟，让每一次思考都留下痕迹。
          </p>
          <Link
            href="/admin"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            前往后台
            <IconArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
}

