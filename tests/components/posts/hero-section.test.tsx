import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HeroSection from "@/features/posts/components/HeroSection";

vi.mock("next/image", () => ({
  default: function Image(props: Record<string, unknown>) {
    const { fill: _fill, priority: _priority, sizes: _sizes, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(rest as Record<string, unknown>)} data-testid="next-image" />;
  },
}));

describe("HeroSection", () => {
  it("渲染个人信息和导航按钮", () => {
    render(<HeroSection />);

    expect(screen.getByText(/路人甲/)).toBeInTheDocument();
    expect(screen.getByText(/热爱技术与创作的开发者/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /浏览文章/ })).toHaveAttribute("href", "#posts");
    expect(screen.getByRole("link", { name: /旅行足迹/ })).toHaveAttribute("href", "/hiking");
    expect(screen.getByText(/路漫漫其修远兮/)).toBeInTheDocument();
    expect(screen.getByText(/——《离骚》/)).toBeInTheDocument();
  });

  it("渲染头像图片", () => {
    render(<HeroSection />);

    const img = screen.getByTestId("next-image");
    expect(img).toHaveAttribute("alt", "头像");
    expect(img.getAttribute("src")).toContain("unsplash.com");
  });
});
