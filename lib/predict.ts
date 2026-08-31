// Predict-the-next-frame: the pure, framework-free half of the feature.
//
// Everything here is a plain function over plain data, so the regression tests
// can exercise the real logic instead of a copy of it. lib/stepper.tsx owns the
// React state and rendering and imports these; nothing in this file may import
// React runtime code or touch the DOM.
//
// The frame types live here (rather than in stepper.tsx) because the signature
// and distractor helpers are defined in terms of them. stepper.tsx re-exports
// them, so chapters keep importing ArrayFrame from "@/lib/stepper".

import { isValidElement, type ReactNode } from "react";
import type { Loc } from "@/lib/i18n";

export interface ArrayCell {
  v: ReactNode;
  state?: "lit" | "ok" | "bad" | "ghost";
}

export interface ArrayFrame {
  cells: ArrayCell[];
  /** Pointer labels, rendered above the cells, e.g. { i: 2, label: "slow" } */
  ptrs?: { i: number; label: Loc<string> }[];
  /** Narration for this frame */
  msg: Loc<ReactNode>;
}

export interface Challenge {
  options: ArrayFrame[];
  correct: number;
  picked: number | null;
}

/** Which dimension a wrong pick got wrong */
export type DiffKind = "cells" | "ptrs" | "both";

/** Reorders a copy of the list. Injectable so tests can pin the option order. */
export type Shuffle = <T>(items: T[]) => T[];

/* ---------- signatures ---------- */

/**
 * Flatten a ReactNode to comparable plain text. Cell values are usually numbers
 * or short strings; elements are walked so a value wrapped in <b> still
 * compares equal to the same value written plainly.
 */
export function nodeText(v: ReactNode): string {
  if (v === null || v === undefined || typeof v === "boolean") return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map(nodeText).join("");
  if (isValidElement(v)) {
    const props = v.props as { children?: ReactNode };
    return nodeText(props.children);
  }
  return "?";
}

/**
 * Language-independent form of a pointer label. Comparison must not change with
 * the active language, so a Loc pair always collapses to its English side.
 */
export const rawLabel = (l: Loc<string>): string =>
  typeof l === "string" ? l : l.en;

/** Cell contents and highlight states, in order */
export const cellSig = (f: ArrayFrame): string =>
  f.cells.map((c) => `${nodeText(c.v)}:${c.state ?? ""}`).join(",");

/** Pointer positions and labels, order-independent */
export const ptrSig = (f: ArrayFrame): string =>
  (f.ptrs ?? [])
    .map((p) => `${p.i}@${rawLabel(p.label)}`)
    .sort()
    .join(",");

/** Everything that makes two frames look different to a learner */
export const fullSig = (f: ArrayFrame): string =>
  `${cellSig(f)}||${ptrSig(f)}`;

/** Signature of a whole dataset — used to notice that the demo was swapped */
export const framesSig = (frames: ArrayFrame[]): string =>
  frames.map(fullSig).join("|");

/** Report which dimension a wrong pick differs on, so feedback can name it */
export function diffKind(picked: ArrayFrame, correct: ArrayFrame): DiffKind {
  const cells = cellSig(picked) !== cellSig(correct);
  const ptrs = ptrSig(picked) !== ptrSig(correct);
  if (cells && ptrs) return "both";
  return cells ? "cells" : "ptrs";
}

/* ---------- distractors ---------- */

/** Fisher-Yates over a copy; the default order source in production. */
export const randomShuffle: Shuffle = (items) => {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/**
 * The misconceptions a distractor can embody, in the order they are preferred.
 * Each is a frame a learner might plausibly expect instead of the real next one.
 */
export function distractorCandidates(
  frames: ArrayFrame[],
  step: number,
  n: number,
): ArrayFrame[] {
  const cur = frames[step];
  const next = frames[step + 1];
  if (!cur || !next) return [];

  const lastIndex = Math.max(0, n - 1);
  return [
    // One frame too far: a real frame, but a step ahead (the off-by-one slip)
    frames[step + 2],
    // Pointers moved, data did not
    { cells: cur.cells, ptrs: next.ptrs, msg: "" },
    // Data moved, pointers did not
    { cells: next.cells, ptrs: cur.ptrs, msg: "" },
    // A pointer overshot by one cell
    {
      cells: next.cells,
      ptrs: (next.ptrs ?? []).map((p) => ({
        ...p,
        i: Math.min(p.i + 1, lastIndex),
      })),
      msg: "",
    },
    // Fallback: any other frame in the sequence still makes a usable wrong answer
    ...frames,
  ].filter((f): f is ArrayFrame => Boolean(f));
}

/**
 * Build one prediction question. The correct answer is always the real next
 * frame; distractors are derived from real frames and deduplicated by full
 * signature, so no option can be a second copy of the answer or of a sibling.
 *
 * Returns null when there is no next frame, or when the frames are so uniform
 * that not a single distinguishable distractor exists — the caller then just
 * advances instead of asking an unanswerable question.
 */
export function buildChallenge(
  frames: ArrayFrame[],
  step: number,
  n: number,
  shuffle: Shuffle = randomShuffle,
): Challenge | null {
  const next = frames[step + 1];
  if (!frames[step] || !next) return null;

  const seen = new Set([fullSig(next)]);
  const distractors: ArrayFrame[] = [];
  for (const candidate of distractorCandidates(frames, step, n)) {
    if (distractors.length >= 2) break;
    const sig = fullSig(candidate);
    if (seen.has(sig)) continue;
    seen.add(sig);
    distractors.push(candidate);
  }
  if (!distractors.length) return null;

  const options = shuffle([next, ...distractors]);
  return { options, correct: options.indexOf(next), picked: null };
}

/* ---------- accessibility ---------- */

/**
 * Describe a frame in one sentence so a screen reader can read an option aloud.
 * The mini boards are non-semantic spans, so without this an option would be
 * announced as nothing at all.
 */
export function describeFrame(
  f: ArrayFrame,
  n: number,
  lang: "en" | "zh",
): string {
  const cells = Array.from({ length: n })
    .map((_, i) => {
      const c = f.cells[i];
      if (!c) return "-";
      const v = nodeText(c.v) || "-";
      return c.state ? `${v}(${c.state})` : v;
    })
    .join(", ");
  const ptrs = (f.ptrs ?? [])
    .map((p) =>
      lang === "zh"
        ? `${rawLabel(p.label)} 在第 ${p.i} 格`
        : `${rawLabel(p.label)} at index ${p.i}`,
    )
    .join("; ");
  return lang === "zh"
    ? `格子:${cells}${ptrs ? `;指针:${ptrs}` : ""}`
    : `cells: ${cells}${ptrs ? `; pointers: ${ptrs}` : ""}`;
}
