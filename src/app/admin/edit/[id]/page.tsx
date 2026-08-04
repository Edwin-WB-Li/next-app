import { notFound } from "next/navigation";
import { getPostById } from "@/lib/posts";
import PostEditor from "@/components/post-editor";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params;

  if (id === "new") {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">新建文章</h1>
        <PostEditor />
      </main>
    );
  }

  const { post, content } = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">编辑文章</h1>
      <PostEditor
        postId={post.id}
        initialTitle={post.title}
        initialSlug={post.slug}
        initialSummary={post.summary}
        initialContent={content}
        initialPublished={post.published}
      />
    </main>
  );
}
