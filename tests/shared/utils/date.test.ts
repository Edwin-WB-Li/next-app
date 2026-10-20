import { describe, it, expect } from "vitest";
import { formatDate, formatDueDate } from "@/shared/utils/date";

describe("formatDate", () => {
  it("将ISO日期格式化为中文日期", () => {
    expect(formatDate("2024-06-15T00:00:00Z")).toBe("2024年6月15日");
  });

  it("处理年初日期", () => {
    expect(formatDate("2024-01-01T00:00:00Z")).toBe("2024年1月1日");
  });
});

describe("formatDueDate", () => {
  it("空值返回空字符串", () => {
    expect(formatDueDate(null)).toBe("");
  });

  it("今天返回今天", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(formatDueDate(today)).toBe("今天");
  });

  it("明天返回明天", () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    expect(formatDueDate(tomorrow)).toBe("明天");
  });

  it("昨天返回昨天", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    expect(formatDueDate(yesterday)).toBe("昨天");
  });

  it("N天后返回正确描述", () => {
    const future = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
    expect(formatDueDate(future)).toBe("3天后");
  });

  it("N天前截止返回正确描述", () => {
    const past = new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0];
    expect(formatDueDate(past)).toBe("5天前截止");
  });
});
