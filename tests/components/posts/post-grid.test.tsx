import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PostGrid from "@/features/posts/components/PostGrid";
import type { Post } from "@/lib/posts";

vi.mock("next/image", () => ({
  default: function Image(props: Record<string, unknown>) {
    const { fill: _fill, priority: _priority, sizes: _sizes, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(rest as Record<string, unknown>)} data-testid="next-image" />;
  },
}));

const createPosts = (count: number): Post[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    title: `文章${i + 1}`,
    slug: `post-${i + 1}`,
    summary: `摘要${i + 1}`,
    published: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    tags: [],
  }));

describe("PostGrid", () => {
  it("渲染文章计数", () => {
    render(<PostGrid posts={createPosts(3)} />);
    expect(screen.getByText("3 篇")).toBeInTheDocument();
  });

  it("最多渲染6篇文章", () => {
    render(<PostGrid posts={createPosts(8)} />);
    expect(screen.getAllByText(/阅读全文/)).toHaveLength(6);
  });

  it("空文章时显示空状态", () => {
    render(<PostGrid posts={[]} />);
    expect(screen.getByText("暂无已发布的文章")).toBeInTheDocument();
    expect(screen.getByText("去后台创建你的第一篇文章吧")).toBeInTheDocument();
  });

  it("渲染文章标题", () => {
    render(<PostGrid posts={createPosts(2)} />);
    expect(screen.getByText("文章1")).toBeInTheDocument();
    expect(screen.getByText("文章2")).toBeInTheDocument();
  });
});
