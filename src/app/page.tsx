import { getPublishedPosts, getPopularTags } from "@/lib/posts";
import HeroSection from "@/features/posts/components/HeroSection";
import PostGrid from "@/features/posts/components/PostGrid";
import TagsCloud from "@/features/posts/components/TagsCloud";
import CtaSection from "@/features/posts/components/CtaSection";

export default async function Home() {
  const posts = await getPublishedPosts();
  const sortedTags = await getPopularTags(12);

  return (
    <main className="mx-auto w-full max-w-5xl px-6">
      <HeroSection />
      <PostGrid posts={posts} />
      <TagsCloud tags={sortedTags} />
      <CtaSection />
    </main>
  );
}
