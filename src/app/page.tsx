import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";

export default async function Home() {
  const posts = await getPublishedPosts();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">文章列表</h1>

      {posts.length === 0 ? (
        <p className="text-foreground/60">暂无已发布的文章。</p>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-sm"
            >
              <Link href={`/posts/${post.slug}`}>
                <h2 className="mb-2 text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
              </Link>
              <p className="mb-3 text-sm text-foreground/70 leading-relaxed">
                {post.summary}
              </p>
              <div className="flex items-center gap-3 text-xs text-foreground/50">
                <time dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span className="text-border">|</span>
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-primary hover:underline underline-offset-2"
                >
                  阅读全文
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
