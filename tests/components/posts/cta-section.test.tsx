import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CtaSection from "@/features/posts/components/CtaSection";

describe("CtaSection", () => {
  it("渲染CTA标题和描述", () => {
    render(<CtaSection />);

    expect(screen.getByText("开始创作你的故事")).toBeInTheDocument();
    expect(screen.getByText(/记录技术成长/)).toBeInTheDocument();
  });

  it("链接指向后台管理页", () => {
    render(<CtaSection />);

    const link = screen.getByRole("link", { name: /前往后台/ });
    expect(link).toHaveAttribute("href", "/admin");
  });
});
