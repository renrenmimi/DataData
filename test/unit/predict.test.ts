// Regression coverage for the pure half of predict mode (lib/predict.ts).
// These call the same functions lib/stepper.tsx calls — the challenge logic is
// never reimplemented here, so a test can only pass if production behaves.

import { describe, expect, it } from "vitest";
import {
  buildChallenge,
  cellSig,
  describeFrame,
  diffKind,
  distractorCandidates,
  framesSig,
  fullSig,
  nodeText,
  ptrSig,
  randomShuffle,
  type ArrayFrame,
  type Shuffle,
} from "@/lib/predict";

/** Keeps the order buildChallenge produced: [answer, distractor, distractor]. */
const identityShuffle: Shuffle = (items) => items.slice();

/** Reverses instead, to prove the option order really follows the injection. */
const reverseShuffle: Shuffle = (items) => items.slice().reverse();

/**
 * A miniature two-pointer walkthrough, shaped like the real LC 283 frames:
 * pointers advance, a cell lights up, then the values swap.
 */
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
  {
    cells: [{ v: 1, state: "ok" }, { v: 0 }, { v: 0, state: "ghost" }],
    ptrs: [{ i: 1, label: "slow" }],
    msg: "done",
  },
];

const WIDTH = 3;

describe("signatures", () => {
  it("flattens element and array cell values to comparable text", () => {
    expect(nodeText("7")).toBe("7");
    expect(nodeText(42)).toBe("42");
    expect(nodeText(null)).toBe("");
    expect(nodeText(["a", 1])).toBe("a1");
  });

  it("compares pointer labels by language-independent text", () => {
    const en: ArrayFrame = { cells: [], ptrs: [{ i: 1, label: "slow" }], msg: "" };
    const loc: ArrayFrame = {
      cells: [],
      ptrs: [{ i: 1, label: { en: "slow", zh: "慢指针" } }],
      msg: "",
    };
    // A Loc label collapses to its English side, so switching language cannot
    // change which options count as duplicates.
    expect(ptrSig(loc)).toBe(ptrSig(en));
  });

  it("treats pointer order as irrelevant but cell order as significant", () => {
    const a: ArrayFrame = {
      cells: [{ v: 1 }, { v: 2 }],
      ptrs: [
        { i: 0, label: "slow" },
        { i: 1, label: "fast" },
      ],
      msg: "",
    };
    const swappedPtrs: ArrayFrame = {
      ...a,
      ptrs: [
        { i: 1, label: "fast" },
        { i: 0, label: "slow" },
      ],
    };
    const swappedCells: ArrayFrame = { ...a, cells: [{ v: 2 }, { v: 1 }] };
    expect(ptrSig(swappedPtrs)).toBe(ptrSig(a));
    expect(cellSig(swappedCells)).not.toBe(cellSig(a));
  });

  it("counts a highlight change as a different frame", () => {
    const plain: ArrayFrame = { cells: [{ v: 1 }], msg: "" };
    const lit: ArrayFrame = { cells: [{ v: 1, state: "lit" }], msg: "" };
    expect(fullSig(lit)).not.toBe(fullSig(plain));
  });
});

describe("buildChallenge", () => {
  it("(1) always offers the real next frame as the correct option", () => {
    for (let step = 0; step < FRAMES.length - 1; step++) {
      const c = buildChallenge(FRAMES, step, WIDTH, identityShuffle);
      expect(c, `step ${step} should produce a question`).not.toBeNull();
      expect(fullSig(c!.options[c!.correct])).toBe(fullSig(FRAMES[step + 1]));
    }
  });

  it("(1) keeps the answer correct under any shuffle", () => {
    for (const shuffle of [identityShuffle, reverseShuffle, randomShuffle]) {
      const c = buildChallenge(FRAMES, 0, WIDTH, shuffle)!;
      expect(fullSig(c.options[c.correct])).toBe(fullSig(FRAMES[1]));
    }
  });

  it("(2) never presents duplicate options", () => {
    for (let step = 0; step < FRAMES.length - 1; step++) {
      const c = buildChallenge(FRAMES, step, WIDTH, identityShuffle)!;
      const sigs = c.options.map(fullSig);
      expect(new Set(sigs).size).toBe(sigs.length);
    }
  });

  it("(3) never gives a distractor the answer's signature", () => {
    for (let step = 0; step < FRAMES.length - 1; step++) {
      const c = buildChallenge(FRAMES, step, WIDTH, identityShuffle)!;
      const answer = fullSig(c.options[c.correct]);
      c.options.forEach((opt, i) => {
        if (i !== c.correct) expect(fullSig(opt)).not.toBe(answer);
      });
    }
  });

  it("(5) returns a deterministic order for an injected shuffle", () => {
    const a = buildChallenge(FRAMES, 0, WIDTH, identityShuffle)!;
    const b = buildChallenge(FRAMES, 0, WIDTH, identityShuffle)!;
    expect(a.options.map(fullSig)).toEqual(b.options.map(fullSig));
    expect(a.correct).toBe(b.correct);

    // The injected function decides the order, not an internal source of chance.
    const reversed = buildChallenge(FRAMES, 0, WIDTH, reverseShuffle)!;
    expect(reversed.options.map(fullSig)).toEqual(
      a.options.map(fullSig).reverse(),
    );
    expect(reversed.correct).toBe(a.options.length - 1 - a.correct);
  });

  it("starts every question unanswered", () => {
    expect(buildChallenge(FRAMES, 0, WIDTH, identityShuffle)!.picked).toBeNull();
  });

  it("(13) returns null on the last frame and on empty or single-frame data", () => {
    expect(buildChallenge(FRAMES, FRAMES.length - 1, WIDTH, identityShuffle)).toBeNull();
    expect(buildChallenge([], 0, 0, identityShuffle)).toBeNull();
    expect(buildChallenge([FRAMES[0]], 0, WIDTH, identityShuffle)).toBeNull();
  });

  it("(13) returns null rather than an unanswerable question for identical frames", () => {
    const same: ArrayFrame = { cells: [{ v: 1 }], msg: "" };
    // Every candidate collapses onto the answer's signature, so there is no
    // distinguishable wrong option to offer.
    expect(buildChallenge([same, same, same], 0, 1, identityShuffle)).toBeNull();
  });
});

describe("(4) distractors encode the intended misconceptions", () => {
  const cur = FRAMES[0];
  const next = FRAMES[1];
  const candidates = distractorCandidates(FRAMES, 0, WIDTH);

  it("offers the off-by-one frame first", () => {
    expect(fullSig(candidates[0])).toBe(fullSig(FRAMES[2]));
  });

  it("builds a pointers-moved-but-cells-unchanged frame", () => {
    const ptrOnly = candidates[1];
    expect(cellSig(ptrOnly)).toBe(cellSig(cur));
    expect(ptrSig(ptrOnly)).toBe(ptrSig(next));
    // Wrong on exactly one axis: the cells.
    expect(diffKind(ptrOnly, next)).toBe("cells");
  });

  it("builds a cells-moved-but-pointers-unchanged frame", () => {
    const cellOnly = candidates[2];
    expect(cellSig(cellOnly)).toBe(cellSig(next));
    expect(ptrSig(cellOnly)).toBe(ptrSig(cur));
    expect(diffKind(cellOnly, next)).toBe("ptrs");
  });

  it("builds a pointer-overshot-by-one frame, clamped to the last cell", () => {
    const overshoot = candidates[3];
    expect(cellSig(overshoot)).toBe(cellSig(next));
    const moved = (overshoot.ptrs ?? []).map((p) => p.i).sort();
    const original = (next.ptrs ?? []).map((p) => p.i).sort();
    expect(moved).toEqual(original.map((i) => Math.min(i + 1, WIDTH - 1)));
    expect(diffKind(overshoot, next)).toBe("ptrs");
  });

  it("clamps an overshooting pointer instead of running past the last cell", () => {
    // Three frames so that frames[step + 2] exists and the candidate order is
    // the documented one; the pointer in the answer already sits on the last
    // cell, so "one further" has nowhere to go.
    const atEnd: ArrayFrame[] = [
      { cells: [{ v: 1 }, { v: 2 }], ptrs: [{ i: 0, label: "i" }], msg: "" },
      { cells: [{ v: 1 }, { v: 2 }], ptrs: [{ i: 1, label: "i" }], msg: "" },
      { cells: [{ v: 2 }, { v: 1 }], ptrs: [{ i: 1, label: "i" }], msg: "" },
    ];
    const overshoot = distractorCandidates(atEnd, 0, 2)[3];
    expect((overshoot.ptrs ?? [])[0].i).toBe(1);
  });

  it("drops the off-by-one candidate when there is no frame two steps ahead", () => {
    // With only a next frame to work from, the first candidate is the
    // pointers-moved variant rather than a real later frame.
    const twoOnly: ArrayFrame[] = [
      { cells: [{ v: 1 }], ptrs: [{ i: 0, label: "i" }], msg: "" },
      { cells: [{ v: 2 }], ptrs: [{ i: 0, label: "i" }], msg: "" },
    ];
    const candidates = distractorCandidates(twoOnly, 0, 1);
    expect(cellSig(candidates[0])).toBe(cellSig(twoOnly[0]));
    expect(candidates.every(Boolean)).toBe(true);
  });

  it("yields no candidates when there is no next frame", () => {
    expect(distractorCandidates(FRAMES, FRAMES.length - 1, WIDTH)).toEqual([]);
    expect(distractorCandidates([], 0, 0)).toEqual([]);
  });
});

describe("(8) diffKind names the axis a wrong pick got wrong", () => {
  const base: ArrayFrame = {
    cells: [{ v: 1 }, { v: 2 }],
    ptrs: [{ i: 0, label: "i" }],
    msg: "",
  };

  it("reports cells when only the cells differ", () => {
    expect(diffKind({ ...base, cells: [{ v: 9 }, { v: 2 }] }, base)).toBe("cells");
  });

  it("reports cells when only a highlight differs", () => {
    expect(
      diffKind({ ...base, cells: [{ v: 1, state: "lit" }, { v: 2 }] }, base),
    ).toBe("cells");
  });

  it("reports ptrs when only the pointers differ", () => {
    expect(diffKind({ ...base, ptrs: [{ i: 1, label: "i" }] }, base)).toBe("ptrs");
  });

  it("reports both when the two frames differ on each axis", () => {
    expect(
      diffKind(
        { cells: [{ v: 9 }, { v: 9 }], ptrs: [{ i: 1, label: "i" }], msg: "" },
        base,
      ),
    ).toBe("both");
  });
});

describe("(14) describeFrame reads a board aloud", () => {
  it("names every cell, its highlight and each pointer position in English", () => {
    const label = describeFrame(FRAMES[1], WIDTH, "en");
    expect(label).toBe("cells: 0(bad), 1, 0; pointers: slow at index 0; fast at index 1");
  });

  it("names cells and pointers in Chinese", () => {
    const label = describeFrame(FRAMES[1], WIDTH, "zh");
    expect(label).toContain("格子");
    expect(label).toContain("指针");
    expect(label).toContain("slow 在第 0 格");
  });

  it("pads short frames so every option describes the same number of cells", () => {
    const short: ArrayFrame = { cells: [{ v: 1 }], msg: "" };
    expect(describeFrame(short, 3, "en")).toBe("cells: 1, -, -");
  });

  it("omits the pointer clause when a frame has no pointers", () => {
    expect(describeFrame({ cells: [{ v: 1 }], msg: "" }, 1, "en")).toBe("cells: 1");
  });
});

describe("framesSig identifies a dataset", () => {
  it("differs between demos of the same length", () => {
    const a: ArrayFrame[] = [{ cells: [{ v: 1 }], msg: "" }, { cells: [{ v: 2 }], msg: "" }];
    const b: ArrayFrame[] = [{ cells: [{ v: 1 }], msg: "" }, { cells: [{ v: 3 }], msg: "" }];
    expect(framesSig(a)).not.toBe(framesSig(b));
  });

  it("is stable when an equal dataset is rebuilt", () => {
    const build = (): ArrayFrame[] => [
      { cells: [{ v: 1 }], ptrs: [{ i: 0, label: "i" }], msg: "x" },
    ];
    expect(framesSig(build())).toBe(framesSig(build()));
  });
});
