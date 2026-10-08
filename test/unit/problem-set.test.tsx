// The problem list keeps its two controls apart: the completion checkbox and
// the button that expands a problem. These tests drive both with the keyboard,
// since the checkbox used to sit inside a clickable row that took over its
// Enter and Space presses.

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangProvider } from "@/lib/i18n";
import { ProgressProvider } from "@/lib/progress";
import { ProblemSet, type Problem } from "@/lib/problems";

const ITEMS: Problem[] = [
  {
    lc: 203,
    title: "Remove Linked List Elements",
    d: "easy",
    tags: ["Dummy head"],
    hint: "Think about the head.",
    key: "Use a dummy node.",
  },
  {
    lc: 206,
    title: "Reverse Linked List",
    d: "easy",
    tags: ["Pointers"],
    hint: "Three pointers.",
    key: "Keep prev, cur and next.",
  },
];

const stored = () =>
  JSON.parse(window.localStorage.getItem("dd-progress-v1") ?? "null");

const checkbox = (lc: number) =>
  screen.getByRole("checkbox", { name: `Mark LC ${lc} as done` });
const titleButton = (lc: number) =>
  screen.getByRole("button", { name: new RegExp(`^LC ${lc} \\S`) });

function renderList() {
  return render(
    <LangProvider>
      <ProgressProvider>
        <ProblemSet ch="linked-list" items={ITEMS} />
      </ProgressProvider>
    </LangProvider>,
  );
}

beforeEach(() => window.localStorage.clear());

describe("problem list", () => {
  it("records a problem as done with Space on its checkbox, without expanding it", async () => {
    const user = userEvent.setup();
    renderList();
    checkbox(203).focus();
    await user.keyboard(" ");

    expect(checkbox(203)).toHaveAttribute("aria-checked", "true");
    expect(stored().problems).toEqual({ "linked-list/203": 1 });
    expect(titleButton(203)).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Use a dummy node.")).toBeNull();
  });

  it("toggles with Enter as well, and a second press clears it", async () => {
    const user = userEvent.setup();
    renderList();
    checkbox(206).focus();

    await user.keyboard("{Enter}");
    expect(stored().problems).toEqual({ "linked-list/206": 1 });
    await user.keyboard("{Enter}");
    expect(checkbox(206)).toHaveAttribute("aria-checked", "false");
    expect(stored().problems).toEqual({});
  });

  it("expands and collapses from the title button, leaving progress alone", async () => {
    const user = userEvent.setup();
    renderList();
    titleButton(203).focus();

    await user.keyboard("{Enter}");
    expect(titleButton(203)).toHaveAttribute("aria-expanded", "true");
    const body = screen.getByText("Use a dummy node.").closest(".prob-body");
    expect(titleButton(203)).toHaveAttribute("aria-controls", body?.id);

    await user.keyboard("{Enter}");
    expect(titleButton(203)).toHaveAttribute("aria-expanded", "false");
    expect(stored()).toBeNull();
  });

  it("offers the checkbox and the title as two tab stops per problem", async () => {
    const user = userEvent.setup();
    renderList();
    await user.tab();
    expect(checkbox(203)).toHaveFocus();
    await user.tab();
    expect(titleButton(203)).toHaveFocus();
    await user.tab();
    expect(checkbox(206)).toHaveFocus();
  });

  it("does not nest one control inside another", () => {
    const { container } = renderList();
    expect(container.querySelector("[role='button'] button, button button")).toBeNull();
  });
});
