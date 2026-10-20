import { describe, it, expect } from "vitest";
import { readingTime, generateSlug } from "@/shared/utils/text";

describe("readingTime", () => {
  it("中文内容按字数计算阅读时间", () => {
    const content = "中".repeat(300);
    expect(readingTime(content)).toBe(1);
  });

  it("英文内容按词数计算阅读时间", () => {
    const content = Array.from({ length: 300 }, (_, i) => `word${i}`).join(" ");
    expect(readingTime(content)).toBe(1);
  });

  it("混合内容综合计算", () => {
    const chinese = "中".repeat(150);
    const english = Array.from({ length: 150 }, (_, i) => `w${i}`).join(" ");
    expect(readingTime(chinese + " " + english)).toBe(1);
  });

  it("空内容至少返回1分钟", () => {
    expect(readingTime("")).toBe(1);
  });

  it("内容超过300字按分钟向上取整", () => {
    const content = "中".repeat(601);
    expect(readingTime(content)).toBe(3);
  });
});

describe("generateSlug", () => {
  it("将中文标题转为slug格式", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("移除非字母数字字符", () => {
    expect(generateSlug("Hello, World!")).toBe("hello-world");
  });

  it("空格替换为连字符", () => {
    expect(generateSlug("a b c")).toBe("a-b-c");
  });

  it("截断超过60个字符", () => {
    const long = "a ".repeat(50);
    expect(generateSlug(long).length).toBeLessThanOrEqual(60);
  });

  it("转为小写", () => {
    expect(generateSlug("UPPER CASE")).toBe("upper-case");
  });
});
