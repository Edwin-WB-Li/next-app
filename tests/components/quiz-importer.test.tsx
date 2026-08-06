import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuizImporter } from "@/components/quiz/quiz-importer";
import { validateQuizSetJson } from "@/lib/quiz/validate";
import { QuizSet } from "@/lib/quiz/types";

vi.mock("@/lib/quiz/validate", () => ({
  validateQuizSetJson: vi.fn(),
}));

function createFile(content: object, name: string, type = "application/json"): File {
  const blob = new Blob([JSON.stringify(content)], { type });
  return new File([blob], name, { type });
}

function createOversizedFile(): File {
  const size = 2 * 1024 * 1024; // 2MB
  const buffer = new Uint8Array(size);
  return new File([buffer], "large.json", { type: "application/json" });
}

const validQuizSet: QuizSet = {
  id: "imported-test",
  title: "测试导入",
  description: "描述",
  questions: [
    {
      id: "q1",
      type: "single",
      content: "Q1",
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
      ],
      correctAnswers: ["a"],
      explanation: "",
      difficulty: "easy",
      tags: ["js"],
    },
  ],
  createdAt: "2024-01-01",
  source: "imported",
};

describe("QuizImporter", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("上传有效 JSON 后展示预览", async () => {
    vi.mocked(validateQuizSetJson).mockReturnValue({
      success: true,
      data: validQuizSet,
    });

    const onImport = vi.fn().mockResolvedValue(undefined);
    render(<QuizImporter onImport={onImport} />);

    const file = createFile(validQuizSet, "test.json");
    const input = screen.getByLabelText("选择 JSON 文件") as HTMLInputElement;

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText("测试导入")).toBeInTheDocument();
    });
    expect(screen.getByText("描述")).toBeInTheDocument();
    expect(screen.getByText("1 题")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "确认导入 1 个练习本" })).toBeInTheDocument();
  });

  it("上传无效 JSON 展示错误列表", async () => {
    vi.mocked(validateQuizSetJson).mockReturnValue({
      success: false,
      errors: ["title 为必填字段", "questions 至少包含 1 题"],
    });

    render(<QuizImporter onImport={vi.fn()} />);

    const file = createFile({ invalid: true }, "bad.json");
    const input = screen.getByLabelText("选择 JSON 文件") as HTMLInputElement;

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText("title 为必填字段")).toBeInTheDocument();
    expect(screen.getByText("questions 至少包含 1 题")).toBeInTheDocument();
  });

  it("点击确认导入调用 onImport", async () => {
    vi.mocked(validateQuizSetJson).mockReturnValue({
      success: true,
      data: validQuizSet,
    });

    const onImport = vi.fn().mockResolvedValue(undefined);
    render(<QuizImporter onImport={onImport} />);

    const file = createFile(validQuizSet, "test.json");
    const input = screen.getByLabelText("选择 JSON 文件") as HTMLInputElement;
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "确认导入 1 个练习本" })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "确认导入 1 个练习本" }));

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledTimes(1);
    });
    expect(onImport).toHaveBeenCalledWith(validQuizSet);
  });

  it("文件大小超限报错", async () => {
    render(<QuizImporter onImport={vi.fn()} />);

    const file = createOversizedFile();
    const input = screen.getByLabelText("选择 JSON 文件") as HTMLInputElement;
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText(/文件大小不能超过/)).toBeInTheDocument();
  });

  it("非 JSON 文件报错", async () => {
    render(<QuizImporter onImport={vi.fn()} />);

    const file = createFile({}, "image.png", "image/png");
    const input = screen.getByLabelText("选择 JSON 文件") as HTMLInputElement;

    Object.defineProperty(input, "files", {
      value: [file],
      configurable: true,
    });
    await fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText(/仅支持 JSON 文件/)).toBeInTheDocument();
  });

  it("按 Space 或 Enter 触发文件选择", async () => {
    render(<QuizImporter onImport={vi.fn()} />);

    const dropZone = screen.getByRole("button", { name: /点击或拖拽上传/ });
    const input = screen.getByLabelText("选择 JSON 文件") as HTMLInputElement;

    const clickSpy = vi.spyOn(input, "click");

    dropZone.focus();
    await userEvent.keyboard("{Enter}");
    expect(clickSpy).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(" ");
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it("导入成功后展示成功状态并允许重新导入", async () => {
    vi.mocked(validateQuizSetJson).mockReturnValue({
      success: true,
      data: validQuizSet,
    });

    const onImport = vi.fn().mockResolvedValue(undefined);
    render(<QuizImporter onImport={onImport} />);

    const file = createFile(validQuizSet, "test.json");
    const input = screen.getByLabelText("选择 JSON 文件") as HTMLInputElement;
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "确认导入 1 个练习本" })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "确认导入 1 个练习本" }));

    await waitFor(() => {
      expect(screen.getByText(/导入完成/)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "继续导入" })).toBeInTheDocument();
  });

  it("批量上传多个有效 JSON 展示所有预览", async () => {
    vi.mocked(validateQuizSetJson).mockImplementation((json: unknown) => {
      const obj = json as Record<string, unknown>;
      const title = obj.title as string;
      return {
        success: true,
        data: { ...validQuizSet, id: `imported-${title}`, title } as QuizSet,
      };
    });

    const onImport = vi.fn().mockResolvedValue(undefined);
    render(<QuizImporter onImport={onImport} />);

    const file1 = createFile({ ...validQuizSet, title: "文件1" }, "file1.json");
    const file2 = createFile({ ...validQuizSet, title: "文件2" }, "file2.json");
    const input = screen.getByLabelText("选择 JSON 文件") as HTMLInputElement;

    await userEvent.upload(input, [file1, file2]);

    await waitFor(() => {
      expect(screen.getByText("文件1")).toBeInTheDocument();
    });
    expect(screen.getByText("文件2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "确认导入 2 个练习本" })).toBeInTheDocument();
  });

  it("批量上传时部分无效展示有效预览和错误", async () => {
    vi.mocked(validateQuizSetJson).mockImplementation((json: unknown) => {
      const obj = json as Record<string, unknown>;
      if (obj.title === "无效") {
        return { success: false, errors: ["title 错误"] };
      }
      return {
        success: true,
        data: { ...validQuizSet, id: "imported-valid", title: obj.title } as QuizSet,
      };
    });

    render(<QuizImporter onImport={vi.fn()} />);

    const file1 = createFile({ ...validQuizSet, title: "有效" }, "valid.json");
    const file2 = createFile({ ...validQuizSet, title: "无效" }, "invalid.json");
    const input = screen.getByLabelText("选择 JSON 文件") as HTMLInputElement;

    await userEvent.upload(input, [file1, file2]);

    await waitFor(() => {
      expect(screen.getByText("有效")).toBeInTheDocument();
    });
    expect(screen.getByText("title 错误")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "导入有效文件" })).toBeInTheDocument();
  });

  it("批量导入只调用有效文件的 onImport", async () => {
    vi.mocked(validateQuizSetJson).mockImplementation((json: unknown) => {
      const obj = json as Record<string, unknown>;
      if (obj.title === "无效") {
        return { success: false, errors: ["title 错误"] };
      }
      return {
        success: true,
        data: { ...validQuizSet, id: `imported-${obj.title}`, title: obj.title } as QuizSet,
      };
    });

    const onImport = vi.fn().mockResolvedValue(undefined);
    render(<QuizImporter onImport={onImport} />);

    const file1 = createFile({ ...validQuizSet, title: "A" }, "a.json");
    const file2 = createFile({ ...validQuizSet, title: "无效" }, "bad.json");
    const input = screen.getByLabelText("选择 JSON 文件") as HTMLInputElement;
    await userEvent.upload(input, [file1, file2]);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "导入有效文件" })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "导入有效文件" }));

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledTimes(1);
    });
  });
});
