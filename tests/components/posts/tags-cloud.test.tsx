import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TagsCloud from "@/features/posts/components/TagsCloud";

describe("TagsCloud", () => {
  it("渲染标签及计数", () => {
    render(
      <TagsCloud
        tags={[
          ["React", 5],
          ["Next.js", 3],
          ["TypeScript", 2],
        ]}
      />
    );

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("标签为空时不渲染任何内容", () => {
    const { container } = render(<TagsCloud tags={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("渲染标题", () => {
    render(<TagsCloud tags={[["React", 1]]} />);
    expect(screen.getByText("热门标签")).toBeInTheDocument();
  });
});
