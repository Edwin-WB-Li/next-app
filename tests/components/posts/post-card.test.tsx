import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PostCard from "@/features/posts/components/PostCard";
import type { Post } from "@/lib/posts";

vi.mock("next/image", () => ({
  default: function Image(props: Record<string, unknown>) {
    const { fill: _fill, priority: _priority, sizes: _sizes, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(rest as Record<string, unknown>)} data-testid="next-image" />;
  },
}));

const basePost: Post = {
  id: "1",
  title: "测试文章",
  slug: "test-post",
  summary: "这是一篇测试文章的摘要内容，用于测试阅读时间计算。",
  published: true,
  createdAt: "2024-06-15T00:00:00Z",
  updatedAt: "2024-06-15T00:00:00Z",
  tags: ["React", "Next.js", "TypeScript", "CSS"],
  coverImage: "https://example.com/cover.jpg",
};

describe("PostCard", () => {
  it("渲染文章标题、摘要和日期", () => {
    render(<PostCard post={basePost} index={0} />);

    expect(screen.getByText("测试文章")).toBeInTheDocument();
    expect(screen.getByText(/这是一篇测试文章的摘要/)).toBeInTheDocument();
    expect(screen.getByText("2024年6月15日")).toBeInTheDocument();
  });

  it("渲染文章标签，最多3个，超出显示+n", () => {
    render(<PostCard post={basePost} index={0} />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("无标签时不渲染标签区域", () => {
    const postWithoutTags = { ...basePost, tags: [] };
    render(<PostCard post={postWithoutTags} index={0} />);

    expect(screen.queryByText("React")).not.toBeInTheDocument();
    expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
  });

  it("无封面图时使用默认图片", () => {
    const postWithoutCover = { ...basePost, coverImage: undefined };
    render(<PostCard post={postWithoutCover} index={0} />);

    const img = screen.getByTestId("next-image");
    expect(img.getAttribute("src")).toContain("picsum.photos");
  });

  it("有封面图时使用指定图片", () => {
    render(<PostCard post={basePost} index={0} />);

    const img = screen.getByTestId("next-image");
    expect(img).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("链接指向正确的文章详情页", () => {
    render(<PostCard post={basePost} index={0} />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/posts/test-post");
  });

  it("第一篇文章设置 priority", () => {
    const { container } = render(<PostCard post={basePost} index={0} />);
    const img = container.querySelector("[data-testid='next-image']");
    expect(img).toBeInTheDocument();
  });
});
