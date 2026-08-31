// Regression coverage for predict mode as the learner meets it: the stateful
// rules that live in the ArrayStepper component rather than in lib/predict.ts.

import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangProvider } from "@/lib/i18n";
import { ArrayStepper } from "@/lib/stepper";
import { describeFrame, type ArrayFrame } from "@/lib/predict";

const FRAMES: ArrayFrame[] = [
  {
    cells: [{ v: 0 }, { v: 1 }, { v: 0 }],
    ptrs: [
      { i: 0, label: "slow" },
      { i: 0, label: "fast" },
    ],
    msg: "start",
  },
  {
    cells: [{ v: 0, state: "bad" }, { v: 1 }, { v: 0 }],
    ptrs: [
      { i: 0, label: "slow" },
      { i: 1, label: "fast" },
    ],
    msg: "skip the zero",
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 0 }, { v: 0 }],
    ptrs: [
      { i: 1, label: "slow" },
      { i: 2, label: "fast" },
    ],
    msg: "swap",
  },
];

/** A different demo of the same length, to prove the score is dataset-scoped. */
const OTHER_FRAMES: ArrayFrame[] = [
  { cells: [{ v: 7 }, { v: 8 }, { v: 9 }], ptrs: [{ i: 0, label: "l" }], msg: "other start" },
  { cells: [{ v: 7, state: "lit" }, { v: 8 }, { v: 9 }], ptrs: [{ i: 1, label: "l" }], msg: "other step" },
  { cells: [{ v: 8 }, { v: 7 }, { v: 9 }], ptrs: [{ i: 2, label: "l" }], msg: "other end" },
];

const WIDTH = 3;

function renderStepper(frames: ArrayFrame[] = FRAMES) {
  const view = render(
    <LangProvider>
      <ArrayStepper title="Demo" frames={frames} />
    </LangProvider>,
  );
  const rerenderWith = (next: ArrayFrame[]) =>
    view.rerender(
      <LangProvider>
        <ArrayStepper title="Demo" frames={next} />
      </LangProvider>,
    );
  return { ...view, rerenderWith };
}

const buttonByName = (name: RegExp) => screen.getByRole("button", { name });
const predictToggle = () => buttonByName(/Predict/);
const nextButton = () => buttonByName(/Next/);
const options = () => screen.getAllByRole("button", { name: /^Option [A-D] —/ });
const panel = () => document.querySelector(".pf-panel");
const scoreChip = () => document.querySelector(".pf-score");

/** The board width the component derives from a dataset. */
const widthOf = (frames: ArrayFrame[]) =>
  Math.max(...frames.map((f) => f.cells.length));

/**
 * Identify the option holding a given frame via its screen-reader label. The
 * width must match the dataset in play, because a label pads short frames out
 * to the widest frame in the set.
 */
function optionFor(frame: ArrayFrame, width = WIDTH) {
  const label = describeFrame(frame, width, "en");
  const found = options().find((b) => b.getAttribute("aria-label")?.endsWith(label));
  if (!found) throw new Error(`no option renders the frame: ${label}`);
  return found;
}

function optionOtherThan(frame: ArrayFrame, width = WIDTH) {
  const correct = optionFor(frame, width);
  const other = options().find((b) => b !== correct);
  if (!other) throw new Error("expected more than one option");
  return other;
}

/** Turn predict mode on and open the first question. */
async function openQuestion(user: ReturnType<typeof userEvent.setup>) {
  await user.click(predictToggle());
  await user.click(nextButton());
}

describe("predict mode is opt-in", () => {
  it("does not ask a question while predict mode is off", async () => {
    const user = userEvent.setup();
    renderStepper();
    await user.click(nextButton());
    expect(panel()).toBeNull();
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("intercepts Next once enabled, holding the frame until the answer", async () => {
    const user = userEvent.setup();
    renderStepper();
    await openQuestion(user);
    expect(panel()).not.toBeNull();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(nextButton()).toBeDisabled();
  });
});

describe("(9) predict mode disables autoplay", () => {
  it("keeps Play enabled while off and disables it while on", async () => {
    const user = userEvent.setup();
    renderStepper();
    expect(buttonByName(/Play/)).toBeEnabled();

    await user.click(predictToggle());
    expect(buttonByName(/Play/)).toBeDisabled();

    // Turning it back off restores autoplay.
    await user.click(predictToggle());
    expect(buttonByName(/Play/)).toBeEnabled();
  });
});

describe("(6) a question can be answered only once", () => {
  it("disables every option after the first pick", async () => {
    const user = userEvent.setup();
    renderStepper();
    await openQuestion(user);
    await user.click(optionFor(FRAMES[1]));
    options().forEach((b) => expect(b).toBeDisabled());
  });

  it("ignores a second pick on the same question", async () => {
    const user = userEvent.setup();
    renderStepper();
    await openQuestion(user);

    await user.click(optionOtherThan(FRAMES[1])); // wrong first
    expect(scoreChip()).toHaveTextContent("0/1");

    // Clicking the correct option afterwards must not rewrite the verdict.
    await user.click(optionFor(FRAMES[1]));
    expect(scoreChip()).toHaveTextContent("0/1");
    expect(document.querySelector(".pf-feedback")).toHaveClass("no");
  });
});

describe("(7) the score increments exactly once per question", () => {
  it("counts a correct answer once", async () => {
    const user = userEvent.setup();
    renderStepper();
    await openQuestion(user);
    await user.click(optionFor(FRAMES[1]));
    expect(scoreChip()).toHaveTextContent("1/1");
  });

  it("accumulates one entry per answered question", async () => {
    const user = userEvent.setup();
    renderStepper();
    await openQuestion(user);

    await user.click(optionFor(FRAMES[1]));
    expect(scoreChip()).toHaveTextContent("1/1");

    await user.click(buttonByName(/Reveal & continue/));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();

    await user.click(nextButton());
    await user.click(optionOtherThan(FRAMES[2]));
    expect(scoreChip()).toHaveTextContent("1/2");
  });

  it("shows no score chip before anything is answered", () => {
    renderStepper();
    expect(scoreChip()).toBeNull();
  });
});

describe("(8) feedback names the axis a wrong pick got wrong", () => {
  /** Build a two-frame demo whose single distractor differs on one axis only. */
  const cellsOnlyDemo: ArrayFrame[] = [
    { cells: [{ v: 1 }, { v: 2 }], ptrs: [{ i: 0, label: "i" }], msg: "a" },
    { cells: [{ v: 2 }, { v: 1 }], ptrs: [{ i: 0, label: "i" }], msg: "b" },
  ];

  it("reports a cells-only difference", async () => {
    const user = userEvent.setup();
    renderStepper(cellsOnlyDemo);
    await openQuestion(user);
    // This demo yields two distractors, so pick the pointers-moved-but-cells-
    // unchanged one explicitly rather than "any wrong option".
    const cellsDiffer: ArrayFrame = {
      cells: cellsOnlyDemo[0].cells,
      ptrs: cellsOnlyDemo[1].ptrs,
      msg: "",
    };
    await user.click(optionFor(cellsDiffer, widthOf(cellsOnlyDemo)));
    expect(screen.getByText(/it is the cell contents/)).toBeInTheDocument();
  });

  it("reports a pointers-only difference", async () => {
    const ptrsOnlyDemo: ArrayFrame[] = [
      { cells: [{ v: 1 }, { v: 2 }], ptrs: [{ i: 0, label: "i" }], msg: "a" },
      { cells: [{ v: 1 }, { v: 2 }], ptrs: [{ i: 1, label: "i" }], msg: "b" },
    ];
    const user = userEvent.setup();
    renderStepper(ptrsOnlyDemo);
    await openQuestion(user);
    // Cells identical, pointer left behind — the only distractor this demo
    // can produce, but name it explicitly so the intent survives a refactor.
    const ptrsDiffer: ArrayFrame = {
      cells: ptrsOnlyDemo[1].cells,
      ptrs: ptrsOnlyDemo[0].ptrs,
      msg: "",
    };
    await user.click(optionFor(ptrsDiffer, widthOf(ptrsOnlyDemo)));
    expect(screen.getByText(/it is the pointer positions/)).toBeInTheDocument();
  });

  it("reports a difference on both axes", async () => {
    const user = userEvent.setup();
    renderStepper();
    await openQuestion(user);
    // FRAMES[2] (the off-by-one distractor) differs from FRAMES[1] on cells
    // and pointers alike.
    await user.click(optionFor(FRAMES[2]));
    expect(screen.getByText(/Both the cells and the pointers differ/)).toBeInTheDocument();
  });

  it("congratulates a correct pick instead of naming a difference", async () => {
    const user = userEvent.setup();
    renderStepper();
    await openQuestion(user);
    await user.click(optionFor(FRAMES[1]));
    expect(screen.getByText(/Correct — you predicted the next state/)).toBeInTheDocument();
  });
});

describe("revealing advances the walkthrough", () => {
  it("closes the panel and moves to the frame that was predicted", async () => {
    const user = userEvent.setup();
    renderStepper();
    await openQuestion(user);
    await user.click(optionFor(FRAMES[1]));
    await user.click(buttonByName(/Reveal & continue/));
    expect(panel()).toBeNull();
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    expect(nextButton()).toBeEnabled();
  });
});

describe("(10) stepping back or replaying clears an unfinished question", () => {
  it("discards the question when the learner steps back", async () => {
    const user = userEvent.setup();
    renderStepper();
    await user.click(predictToggle());
    await user.click(nextButton()); // question at frame 1
    await user.click(optionFor(FRAMES[1]));
    await user.click(buttonByName(/Reveal & continue/)); // now on frame 2
    await user.click(nextButton()); // open a second question
    expect(panel()).not.toBeNull();

    await user.click(buttonByName(/Back/));
    expect(panel()).toBeNull();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("discards the question when the learner replays", async () => {
    const user = userEvent.setup();
    renderStepper();
    await openQuestion(user);
    expect(panel()).not.toBeNull();

    // Play is disabled in predict mode, so leaving predict mode is the route
    // back to playback; the pending question must not survive it.
    await user.click(predictToggle());
    expect(panel()).toBeNull();
    expect(buttonByName(/Play/)).toBeEnabled();
  });
});

describe("(11, 12) swapping the demo clears stale questions and the score", () => {
  it("drops an unanswered question when the frames change", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderStepper();
    await openQuestion(user);
    expect(panel()).not.toBeNull();

    rerenderWith(OTHER_FRAMES);
    expect(panel()).toBeNull();
  });

  it("resets the score, so no answer is attributed to the new demo", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderStepper();
    await openQuestion(user);
    await user.click(optionFor(FRAMES[1]));
    expect(scoreChip()).toHaveTextContent("1/1");

    // Same length as the previous demo: the reset must key on content, not size.
    rerenderWith(OTHER_FRAMES);
    expect(scoreChip()).toBeNull();
  });

  it("keeps the score when an equal dataset is rebuilt on re-render", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderStepper();
    await openQuestion(user);
    await user.click(optionFor(FRAMES[1]));
    expect(scoreChip()).toHaveTextContent("1/1");

    // A chapter that builds its frames inline hands over an equal-but-new
    // array on every render; that must not look like a new demo.
    rerenderWith(FRAMES.map((f) => ({ ...f })));
    expect(scoreChip()).toHaveTextContent("1/1");
  });
});

describe("(13) degenerate datasets do not crash", () => {
  it("renders nothing for an empty dataset", () => {
    const { container } = renderStepper([]);
    expect(container.querySelector(".viz")).toBeNull();
  });

  it("renders a single frame without offering predict mode", () => {
    renderStepper([FRAMES[0]]);
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    // The toggle is hidden when there is no next frame to predict.
    expect(screen.queryByRole("button", { name: /Predict/ })).toBeNull();
    expect(nextButton()).toBeDisabled();
  });

  it("advances instead of asking when no distinguishable distractor exists", async () => {
    const user = userEvent.setup();
    const identical: ArrayFrame = { cells: [{ v: 1 }], msg: "same" };
    renderStepper([identical, identical, identical]);
    await openQuestion(user);
    // No answerable question can be built, so Next behaves normally.
    expect(panel()).toBeNull();
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("survives a dataset shrinking underneath the current step", async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderStepper();
    await user.click(nextButton());
    await user.click(nextButton());
    expect(screen.getByText("3 / 3")).toBeInTheDocument();

    rerenderWith([FRAMES[0]]);
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
  });
});

describe("(14) options carry screen-reader labels", () => {
  it("describes each option's cells and pointer positions", async () => {
    const user = userEvent.setup();
    renderStepper();
    await openQuestion(user);

    const labels = options().map((b) => b.getAttribute("aria-label") ?? "");
    expect(labels).toHaveLength(3);
    labels.forEach((label) => {
      expect(label).toMatch(/^Option [A-C] — cells: /);
      expect(label).toContain("pointers:");
      expect(label).toMatch(/at index \d/);
    });
    // The answer is described exactly as the pure helper would describe it.
    expect(labels.some((l) => l.endsWith(describeFrame(FRAMES[1], WIDTH, "en")))).toBe(true);
  });

  it("keeps the panel reachable as a labelled group of buttons", async () => {
    const user = userEvent.setup();
    renderStepper();
    await openQuestion(user);
    const group = document.querySelector(".pf-panel");
    expect(group).toHaveAttribute("role", "group");
    expect(within(group as HTMLElement).getAllByRole("button")).toHaveLength(3);
  });
});

describe("option order", () => {
  it("is stable for a fixed source of chance", async () => {
    // The component uses the default random shuffle; pinning Math.random makes
    // the rendered order reproducible without changing production code.
    vi.spyOn(Math, "random").mockReturnValue(0);
    const user = userEvent.setup();
    renderStepper();
    await openQuestion(user);
    const first = options().map((b) => b.getAttribute("aria-label"));

    await user.click(buttonByName(/Back/));
    await user.click(nextButton());
    expect(options().map((b) => b.getAttribute("aria-label"))).toEqual(first);
  });
});
