import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import type { Post } from "@/lib/posts";

vi.mock("@/lib/posts", () => ({
  getPublishedPosts: vi.fn(),
  getPopularTags: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: function Image(props: Record<string, unknown>) {
    const { fill: _fill, priority: _priority, sizes: _sizes, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(rest as Record<string, unknown>)} data-testid="next-image" />;
  },
}));

import { getPublishedPosts, getPopularTags } from "@/lib/posts";

const mockPosts: Post[] = [
  {
    id: "1",
    title: "文章一",
    slug: "post-one",
    summary: "这是文章一的摘要内容。",
    published: true,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    tags: ["React", "Next.js"],
    coverImage: "https://example.com/cover1.jpg",
  },
  {
    id: "2",
    title: "文章二",
    slug: "post-two",
    summary: "这是文章二的摘要内容。",
    published: true,
    createdAt: "2024-02-20T00:00:00Z",
    updatedAt: "2024-02-20T00:00:00Z",
    tags: ["TypeScript"],
  },
];

describe("HomePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("渲染文章列表和标签云", async () => {
    vi.mocked(getPublishedPosts).mockResolvedValue(mockPosts);
    vi.mocked(getPopularTags).mockResolvedValue([
      ["React", 2],
      ["Next.js", 1],
    ]);

    const Page = await HomePage();
    render(Page);

    expect(screen.getByText("文章一")).toBeInTheDocument();
    expect(screen.getByText("文章二")).toBeInTheDocument();
    // TagsCloud 和 PostCard 中都有 "React" 标签，确认至少出现两次
    expect(screen.getAllByText("React").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Next.js").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("2 篇")).toBeInTheDocument();
  });

  it("空文章时显示空状态", async () => {
    vi.mocked(getPublishedPosts).mockResolvedValue([]);
    vi.mocked(getPopularTags).mockResolvedValue([]);

    const Page = await HomePage();
    render(Page);

    expect(screen.getByText("暂无已发布的文章")).toBeInTheDocument();
    expect(screen.queryByText("热门标签")).not.toBeInTheDocument();
  });
});
