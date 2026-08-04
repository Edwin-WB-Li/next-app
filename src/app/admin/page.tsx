import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import AdminPostList from "@/components/admin-post-list";

export default async function AdminPage() {
  const posts = await getAllPosts();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">文章管理</h1>
        <Link
          href="/admin/edit/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors"
        >
          + 新建文章
        </Link>
      </div>

      <div className="border-border overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">标题</th>
              <th className="px-4 py-3 text-left font-semibold">Slug</th>
              <th className="px-4 py-3 text-left font-semibold">状态</th>
              <th className="px-4 py-3 text-left font-semibold">创建时间</th>
              <th className="px-4 py-3 text-left font-semibold">更新时间</th>
              <th className="px-4 py-3 text-right font-semibold">操作</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {posts.map((post) => (
              <AdminPostList key={post.id} post={post} />
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="text-foreground/60 px-4 py-8 text-center">
                  暂无文章，点击「新建文章」开始创作。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
