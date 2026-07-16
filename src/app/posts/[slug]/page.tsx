import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import MarkdownRenderer from "@/components/markdown-renderer";
import TableOfContents from "@/components/table-of-contents";
import ScrollToTop from "@/components/scroll-to-top";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const { post, content } = await getPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 gap-12 px-4 py-12">
      <div className="min-w-0 flex-1">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          ← 返回首页
        </Link>

        <article>
          <header className="mb-8">
            <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-foreground/50">
              <time dateTime={post.createdAt}>
                发布于{" "}
                {new Date(post.createdAt).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {post.updatedAt !== post.createdAt && (
                <>
                  <span className="text-border">·</span>
                  <time dateTime={post.updatedAt}>
                    更新于{" "}
                    {new Date(post.updatedAt).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </>
              )}
            </div>
          </header>

          <div className="prose prose-zinc max-w-none dark:prose-invert">
            <MarkdownRenderer content={content} />
          </div>
        </article>
      </div>

      <TableOfContents content={content} />
      <ScrollToTop />
    </main>
  );
}
