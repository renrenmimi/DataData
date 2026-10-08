// Progress is shared by every open tab. Two providers mounted on the same
// localStorage stand in for two tabs; a StorageEvent stands in for the
// notification a browser sends to the other tabs after a write.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProgressProvider, useProgress } from "@/lib/progress";

const KEY = "dd-progress-v1";
const stored = () => JSON.parse(window.localStorage.getItem(KEY) ?? "null");

/** A minimal consumer: shows what this "tab" believes and offers its actions. */
function Tab({ name }: { name: string }) {
  const { data, ready, toggleProblem, reportQuiz } = useProgress();
  return (
    <section>
      <output data-testid={`${name}-problems`}>
        {ready ? Object.keys(data.problems).sort().join(",") : "loading"}
      </output>
      <button onClick={() => toggleProblem("linked-list/160")}>{name} toggles 160</button>
      <button onClick={() => toggleProblem("stack/1047")}>{name} toggles 1047</button>
      <button onClick={() => reportQuiz("stack", 5, 8)}>{name} scores 5/8</button>
      <button onClick={() => reportQuiz("stack", 3, 8)}>{name} scores 3/8</button>
      <button onClick={() => reportQuiz("stack", 8, 8)}>{name} scores 8/8</button>
    </section>
  );
}

function renderTabs() {
  return render(
    <>
      <ProgressProvider>
        <Tab name="A" />
      </ProgressProvider>
      <ProgressProvider>
        <Tab name="B" />
      </ProgressProvider>
    </>,
  );
}

const shownBy = (name: string) => screen.getByTestId(`${name}-problems`).textContent;

function storageEventFromAnotherTab(newValue: string | null, key: string | null = KEY) {
  act(() => {
    window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
  });
}

beforeEach(() => window.localStorage.clear());

describe("progress across tabs", () => {
  it("keeps both tabs' problems when each checks one off", async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByText("A toggles 160"));
    // B has not heard from A yet and checks off a different problem.
    await user.click(screen.getByText("B toggles 1047"));
    expect(Object.keys(stored().problems).sort()).toEqual([
      "linked-list/160",
      "stack/1047",
    ]);
  });

  it("keeps the best quiz score when a stale tab reports a worse one", async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByText("A scores 5/8"));
    await user.click(screen.getByText("B scores 3/8"));
    expect(stored().quiz.stack).toEqual({ right: 5, total: 8 });

    await user.click(screen.getByText("B scores 8/8"));
    expect(stored().quiz.stack).toEqual({ right: 8, total: 8 });
  });

  it("flips what the learner sees, even if another tab changed it a moment ago", async () => {
    // A checks 160; before B hears about it, the learner checks 160 in B too.
    // B's click means "mark it done", so it must not undo A's checkmark.
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByText("A toggles 160"));
    await user.click(screen.getByText("B toggles 160"));
    expect(stored().problems).toEqual({ "linked-list/160": 1 });
  });

  it("adopts what another tab writes", () => {
    renderTabs();
    const value = JSON.stringify({ problems: { "array/283": 1 }, quiz: {} });
    window.localStorage.setItem(KEY, value);
    storageEventFromAnotherTab(value);
    expect(shownBy("A")).toBe("array/283");
    expect(shownBy("B")).toBe("array/283");
  });

  it("empties when another tab clears storage", async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByText("A toggles 160"));
    window.localStorage.clear();
    storageEventFromAnotherTab(null, null);
    expect(shownBy("A")).toBe("");
  });

  it("still works in memory when storage throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const user = userEvent.setup();
    render(
      <ProgressProvider>
        <Tab name="A" />
      </ProgressProvider>,
    );
    await user.click(screen.getByText("A toggles 160"));
    await user.click(screen.getByText("A toggles 1047"));
    expect(shownBy("A")).toBe("linked-list/160,stack/1047");
  });
});
