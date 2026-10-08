// CodeTabs follows the WAI-ARIA tabs pattern: the code is a tabpanel named by
// the selected tab, there is a single tab stop, and arrow keys, Home and End
// move between the languages, selecting as they go.

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeTabs } from "@/lib/code";
import { ShellProvider } from "@/app/theme-provider";

function renderTabs() {
  return render(
    <ShellProvider>
      <CodeTabs
        title="demo"
        java={{ code: "int x = 1;" }}
        python={{ code: "x = 1", note: "Python note" }}
        js={{ code: "let x = 1;" }}
      />
    </ShellProvider>,
  );
}

const tab = (name: string) => screen.getByRole("tab", { name });

beforeEach(() => localStorage.clear());

describe("CodeTabs", () => {
  it("names the code panel after the selected tab and links every tab to it", () => {
    renderTabs();
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAccessibleName("Python");
    expect(panel).toHaveTextContent("x = 1");
    expect(panel).toHaveTextContent("Python note");
    for (const name of ["Java", "Python", "JavaScript"]) {
      expect(tab(name)).toHaveAttribute("aria-controls", panel.id);
    }
  });

  it("keeps a single tab stop on the selected language", () => {
    renderTabs();
    expect(tab("Python")).toHaveAttribute("tabindex", "0");
    expect(tab("Java")).toHaveAttribute("tabindex", "-1");
    expect(tab("JavaScript")).toHaveAttribute("tabindex", "-1");
  });

  it("moves and selects with the arrow keys, wrapping at both ends", async () => {
    const user = userEvent.setup();
    renderTabs();
    tab("Python").focus();

    await user.keyboard("{ArrowRight}");
    expect(tab("JavaScript")).toHaveAttribute("aria-selected", "true");
    expect(tab("JavaScript")).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("let x = 1;");

    await user.keyboard("{ArrowRight}");
    expect(tab("Java")).toHaveFocus();
    expect(tab("Java")).toHaveAttribute("tabindex", "0");

    await user.keyboard("{ArrowLeft}");
    expect(tab("JavaScript")).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("JavaScript");
  });

  it("jumps to the first and last language with Home and End", async () => {
    const user = userEvent.setup();
    renderTabs();
    tab("Python").focus();

    await user.keyboard("{Home}");
    expect(tab("Java")).toHaveFocus();
    expect(tab("Java")).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{End}");
    expect(tab("JavaScript")).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("let x = 1;");
  });

  it("leaves the selection alone for other keys", async () => {
    const user = userEvent.setup();
    renderTabs();
    tab("Python").focus();
    await user.keyboard("{ArrowDown}a");
    expect(tab("Python")).toHaveAttribute("aria-selected", "true");
    expect(tab("Python")).toHaveFocus();
  });
});
