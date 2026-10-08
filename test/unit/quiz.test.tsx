// The quiz component: lenient matching for answers typed with a Chinese IME,
// and the keyboard / screen-reader behaviour of the three question types.

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangProvider } from "@/lib/i18n";
import { ProgressProvider } from "@/lib/progress";
import {
  Quiz,
  answerMatches,
  displayAnswer,
  type QuizItem,
} from "@/lib/quiz";

describe("answer matching", () => {
  it.each([
    ["O（n）", ["O(n)"]],
    ["Ｏ(ｎ)", ["O(n)"]],
    ["0。75", ["0.75"]],
    ["3、4", ["0.75", "3/4"]],
    ["1，2，3，4，6", ["1,2,3,4,6"]],
    ["1、2、3、4、6", ["12346", "1,2,3,4,6"]],
    ["x&（-x）", ["x&(-x)"]],
    ["  In Order ", ["in order"]],
  ])("accepts %s", (typed, answers) => {
    expect(answerMatches(typed, answers)).toBe(true);
  });

  it.each([
    ["O(n2)", ["O(n)"]],
    ["", ["O(n)"]],
    ["0.7", ["0.75"]],
  ])("rejects %j", (typed, answers) => {
    expect(answerMatches(typed, answers)).toBe(false);
  });

  it("shows the accepted answer written in the reader's language", () => {
    const answers = ["中序", "中序遍历", "inorder", "in-order"];
    expect(displayAnswer(answers, "zh")).toBe("中序");
    expect(displayAnswer(answers, "en")).toBe("inorder");
    expect(displayAnswer(["2024"], "zh")).toBe("2024");
  });
});

const ITEMS: QuizItem[] = [
  {
    type: "choice",
    q: "Pick B.",
    opts: ["A", "B", "C"],
    correct: 1,
    wrong: [{ en: "A is wrong.", zh: "A 不对。" }, undefined, "C is wrong."],
    why: "B is right.",
  },
  {
    type: "multi",
    q: "Pick A and C.",
    opts: ["A", "B", "C"],
    correct: [0, 2],
    missHint: "You missed one.",
    extraHint: "One is extra.",
    why: "A and C.",
  },
  {
    type: "fill",
    q: "Which traversal of a BST is sorted?",
    answers: ["中序", "inorder", "in-order"],
    hint: "Left, root, right.",
    why: "In-order visits the keys in ascending order.",
  },
];

function renderQuiz() {
  return render(
    <LangProvider>
      <ProgressProvider>
        <Quiz ch="bst" items={ITEMS} />
      </ProgressProvider>
    </LangProvider>,
  );
}

const fillInput = () => screen.getByRole("textbox", { name: "Answer to question 3" });

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  delete document.documentElement.dataset.lang;
});

describe("quiz interaction", () => {
  it("keeps focus on the picked option and announces the verdict", async () => {
    const user = userEvent.setup();
    renderQuiz();
    const first = document.querySelectorAll<HTMLElement>(".q-item")[0];
    const wrong = within(first).getByRole("button", { name: /^A\s*A$/ });
    await user.click(wrong);

    expect(wrong).toHaveFocus();
    expect(wrong).toHaveAttribute("aria-disabled", "true");
    const feedback = screen.getByText(/A is wrong\./).closest(".q-feedback");
    expect(feedback?.parentElement).toHaveAttribute("aria-live", "polite");
  });

  it("exposes multi-select picks as pressed buttons", async () => {
    const user = userEvent.setup();
    renderQuiz();
    const group = screen.getByRole("group", { name: "Select all that apply" });
    const [a] = Array.from(group.querySelectorAll("button"));
    expect(a).toHaveAttribute("aria-pressed", "false");
    await user.click(a);
    expect(a).toHaveAttribute("aria-pressed", "true");
  });

  it("labels the fill-in box and ignores the Enter that ends an IME composition", () => {
    renderQuiz();
    const input = fillInput();
    fireEvent.change(input, { target: { value: "zhong" } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(screen.queryByText(/Not quite yet/)).toBeNull();

    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText(/Not quite yet/)).toBeInTheDocument();
  });

  it("accepts an answer typed with full-width forms", async () => {
    const user = userEvent.setup();
    renderQuiz();
    await user.type(fillInput(), "ｉｎｏｒｄｅｒ{Enter}");
    expect(screen.getByText(/In-order visits the keys/)).toBeInTheDocument();
    // Solved: the box turns read-only instead of disabled, so focus stays.
    expect(fillInput()).toHaveAttribute("readonly");
    expect(fillInput()).toHaveFocus();
  });

  it("reveals the accepted answer in English after three misses", async () => {
    const user = userEvent.setup();
    renderQuiz();
    for (let k = 0; k < 3; k++) {
      await user.clear(fillInput());
      await user.type(fillInput(), `wrong${k}{Enter}`);
    }
    expect(screen.getByText("inorder", { selector: "code" })).toBeInTheDocument();
  });

  it("numbers questions and reveals the answer in Chinese for Chinese readers", async () => {
    // A Chinese reader: the stored choice, already applied to <html> by langScript
    window.localStorage.setItem("dd-lang", "zh");
    document.documentElement.dataset.lang = "zh";
    const user = userEvent.setup();
    renderQuiz();
    expect(screen.getByText("第 1 题 / 共 3 题")).toBeInTheDocument();

    const input = screen.getByRole("textbox", { name: "第 3 题的答案" });
    for (let k = 0; k < 3; k++) {
      await user.clear(input);
      await user.type(input, `wrong${k}{Enter}`);
    }
    expect(screen.getByText("中序", { selector: "code" })).toBeInTheDocument();
  });

  it("shows the saved best score above the questions", () => {
    window.localStorage.setItem(
      "dd-progress-v1",
      JSON.stringify({ problems: {}, quiz: { bst: { right: 2, total: 3 } } }),
    );
    renderQuiz();
    expect(screen.getByText(/Your best score so far:/)).toHaveTextContent(
      "Your best score so far: 2/3.",
    );
  });
});
