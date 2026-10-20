import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SiteHeader from "@/components/site-header";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from "next/navigation";

describe("SiteHeader", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(usePathname).mockReturnValue("/");
  });

  it("渲染Logo和主导航链接", () => {
    render(<SiteHeader />);

    expect(screen.getByText("路人甲")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "首页" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "旅行足迹" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "看板" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "待办" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "答题" })).toBeInTheDocument();
  });

  it("当前页面导航链接高亮", () => {
    vi.mocked(usePathname).mockReturnValue("/hiking");
    render(<SiteHeader />);

    const hikingLink = screen.getByRole("link", { name: "旅行足迹" });
    expect(hikingLink.className).toContain("text-foreground");

    const homeLink = screen.getByRole("link", { name: "首页" });
    expect(homeLink.className).toContain("text-muted-foreground");
  });

  it("子路径下父导航链接高亮", () => {
    vi.mocked(usePathname).mockReturnValue("/posts/hello-world");
    render(<SiteHeader />);

    const homeLink = screen.getByRole("link", { name: "首页" });
    expect(homeLink.className).toContain("text-foreground");
  });

  it("点击移动端菜单按钮展开菜单", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    const menuBtn = screen.getByRole("button", { name: "打开菜单" });
    await user.click(menuBtn);

    expect(screen.getByRole("button", { name: "关闭菜单" })).toBeInTheDocument();
    expect(document.getElementById("mobile-menu")).toBeInTheDocument();
  });

  it("点击菜单外部关闭移动端菜单", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    const menuBtn = screen.getByRole("button", { name: "打开菜单" });
    await user.click(menuBtn);
    expect(document.getElementById("mobile-menu")).toBeInTheDocument();

    await user.click(document.body);
    await waitFor(() => {
      expect(document.getElementById("mobile-menu")).not.toBeInTheDocument();
    });
  });

  it("按ESC键关闭移动端菜单", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    const menuBtn = screen.getByRole("button", { name: "打开菜单" });
    await user.click(menuBtn);
    expect(document.getElementById("mobile-menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.getElementById("mobile-menu")).not.toBeInTheDocument();
    });
  });
});
