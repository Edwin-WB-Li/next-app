import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts } from "@/lib/posts";

export default async function Home() {
  const posts = await getPublishedPosts();

  return (
    <main className="mx-auto w-full max-w-5xl px-6">
      {/* Hero Section */}
      <section className="flex flex-col items-center py-10">
        <div className="relative h-20 w-20 overflow-hidden rounded-full">
          <Image
            src="https://images.unsplash.com/photo-1554629947-334ff61d85dc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&h=1000&q=90"
            alt="头像"
            fill
            sizes="80px"
            className="object-cover"
            priority
          />
        </div>
        <h1 className="mt-4 px-6 text-center text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          <span className="font-mono text-muted-foreground">{"< "}</span>
          开发者
          <span className="font-mono text-muted-foreground">{" />"}</span>
          <span className="mx-2 text-muted-foreground">,</span>
          <span className="rounded-lg bg-secondary px-2 py-1 text-foreground">
            创作者
          </span>
          <span className="mx-2 text-muted-foreground">,</span>
          探索者
        </h1>
        <div className="mt-4 text-center">
          <p className="text-base text-muted-foreground">
            &ldquo;路漫漫其修远兮，吾将上下而求索&rdquo;
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            ——《离骚》战国·屈原
          </p>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-6">
        <div className="flex items-center gap-3 py-2">
          <svg
            width="2em"
            height="2em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
          </svg>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground">
            最新文章
          </h2>
        </div>

        {posts.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            暂无已发布的文章。
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 py-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 6).map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <Link href={`/posts/${post.slug}`} className="relative block h-36 w-full overflow-hidden lg:h-48">
                    <Image
                      src={post.coverImage || `https://picsum.photos/seed/${post.slug}/800/400`}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                      </svg>
                      <time dateTime={post.createdAt}>
                        {new Date(post.createdAt).toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link href={`/posts/${post.slug}`}>
                      <h3 className="text-xl font-semibold text-foreground transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="mt-2 line-clamp-2 text-base text-muted-foreground">
                      {post.summary}
                    </p>

                    <div className="mt-auto pt-3">
                      <Link
                        href={`/posts/${post.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 transition-colors hover:underline dark:text-sky-400"
                      >
                        Read More
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {posts.length > 6 && (
              <div className="flex w-full justify-center py-4">
                <Link
                  href="/"
                  className="text-base text-muted-foreground transition-colors hover:text-foreground"
                >
                  阅读更多
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
