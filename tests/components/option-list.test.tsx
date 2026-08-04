import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OptionList from "@/components/quiz/option-list";
import { Question } from "@/lib/quiz/types";

const singleQuestion: Question = {
  id: "q1",
  type: "single",
  content: "Q1",
  options: [
    { id: "a", text: "A" },
    { id: "b", text: "B" },
    { id: "c", text: "C" },
  ],
  correctAnswers: ["b"],
  explanation: "",
  difficulty: "easy",
  tags: [],
};

const multipleQuestion: Question = {
  id: "q2",
  type: "multiple",
  content: "Q2",
  options: [
    { id: "a", text: "A" },
    { id: "b", text: "B" },
    { id: "c", text: "C" },
  ],
  correctAnswers: ["a", "c"],
  explanation: "",
  difficulty: "easy",
  tags: [],
};

const tfQuestion: Question = {
  id: "q3",
  type: "true_false",
  content: "Q3",
  options: [
    { id: "true", text: "正确" },
    { id: "false", text: "错误" },
  ],
  correctAnswers: ["true"],
  explanation: "",
  difficulty: "easy",
  tags: [],
};

describe("OptionList - single choice", () => {
  it("渲染所有选项", () => {
    render(<OptionList question={singleQuestion} selected={[]} onChange={vi.fn()} />);
    expect(screen.getByLabelText("A")).toBeInTheDocument();
    expect(screen.getByLabelText("B")).toBeInTheDocument();
    expect(screen.getByLabelText("C")).toBeInTheDocument();
  });

  it("点击选项时调用 onChange 并选中", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OptionList question={singleQuestion} selected={[]} onChange={onChange} />);
    await user.click(screen.getByLabelText("B"));
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });

  it("再次点击已选中单选选项会取消选中", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OptionList question={singleQuestion} selected={["b"]} onChange={onChange} />);
    await user.click(screen.getByLabelText("B"));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

describe("OptionList - multiple choice", () => {
  it("多选题点击多个选项会累加选中", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OptionList question={multipleQuestion} selected={[]} onChange={onChange} />);
    await user.click(screen.getByLabelText("A"));
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  it("多选题点击已选中选项会取消选中", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OptionList question={multipleQuestion} selected={["a", "c"]} onChange={onChange} />);
    await user.click(screen.getByLabelText("A"));
    expect(onChange).toHaveBeenCalledWith(["c"]);
  });
});

describe("OptionList - true/false", () => {
  it("判断题只有两个选项", () => {
    render(<OptionList question={tfQuestion} selected={[]} onChange={vi.fn()} />);
    expect(screen.getByLabelText("正确")).toBeInTheDocument();
    expect(screen.getByLabelText("错误")).toBeInTheDocument();
  });

  it("判断题为单选行为", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OptionList question={tfQuestion} selected={[]} onChange={onChange} />);
    await user.click(screen.getByLabelText("正确"));
    expect(onChange).toHaveBeenCalledWith(["true"]);
  });
});

describe("OptionList - review mode", () => {
  it("review 模式显示正确和错误状态", () => {
    render(<OptionList question={singleQuestion} selected={["a"]} onChange={vi.fn()} review />);
    // 正确选项应标记为正确
    const correctOption = screen.getByLabelText("B").closest("label");
    expect(correctOption).toHaveAttribute("data-status", "correct");
    // 用户选中的错误选项应标记为错误
    const wrongOption = screen.getByLabelText("A").closest("label");
    expect(wrongOption).toHaveAttribute("data-status", "wrong");
  });
});
