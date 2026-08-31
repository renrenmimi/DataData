"use client";

// Generic frame-by-frame player — the skeleton for algorithm slow motion.
// ArrayStepper: a row of cells + pointer labels + narration, suited to array /
// string / stack / queue / two-pointer / sliding-window demos. Every frame is a
// complete snapshot; the component owns playback control (prev / next /
// autoplay / progress) and each chapter writes its own frame data.
// Free-form animations (trees, graphs) need their own components inside the
// chapter, but the control bar styling (.viz-ctl) is shared.
//
// Bilingual: title / pointer label / each frame's msg all accept Loc<…>.
//
// Predict mode: once enabled, "Next" no longer advances straight away — it
// first offers three candidate snapshots to choose from. Distractors are
// derived automatically from the real frames and target four typical
// misconceptions: (1) one frame too far (off-by-one); (2) pointers moved but
// data did not; (3) data moved but pointers did not; (4) a pointer overshot by
// one cell. After the choice the answer is revealed and playback advances —
// turning "watch the animation" into "predict first".

import {
  isValidElement,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useL, useLang, T, type Loc } from "@/lib/i18n";

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

export function useStepper(total: number, intervalMs = 1100) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      // Updaters must be pure: this only advances the frame index, and the
      // effect below is what stops playback
      setStep((s) => (s >= total - 1 ? s : s + 1));
    }, intervalMs);
    return () => clearInterval(id);
  }, [playing, total, intervalMs]);

  // Stop automatically on the last frame
  useEffect(() => {
    if (playing && step >= total - 1) setPlaying(false);
  }, [playing, step, total]);

  // When the frame array is swapped out (a different demo case, say) and gets
  // shorter, clamp step back into range — otherwise frames[step] is undefined
  // and rendering crashes
  useEffect(() => {
    setStep((s) => (s > total - 1 ? Math.max(0, total - 1) : s));
  }, [total]);

  return {
    step,
    playing,
    prev: () => {
      setPlaying(false);
      setStep((s) => Math.max(0, s - 1));
    },
    next: () => {
      setPlaying(false);
      setStep((s) => Math.min(total - 1, s + 1));
    },
    toggle: () => {
      if (step >= total - 1) setStep(0);
      setPlaying((p) => !p);
    },
    reset: () => {
      setPlaying(false);
      setStep(0);
    },
  };
}

export function StepControls({
  stepper,
  step,
  total,
  /** Override what "Next" does (predict mode uses it to intercept advancing) */
  onNext,
  /** Disable "Next" while a prediction is unanswered, so two advance paths cannot conflict */
  nextDisabled,
  /** Disable autoplay in predict mode (it would skip the predictions) */
  playDisabled,
  /** Extra controls (the predict-mode switch, for one), rendered before the counter */
  extra,
}: {
  stepper: ReturnType<typeof useStepper>;
  step: number;
  total: number;
  onNext?: () => void;
  nextDisabled?: boolean;
  playDisabled?: boolean;
  extra?: ReactNode;
}) {
  return (
    <div className="viz-ctl">
      <button
        type="button"
        className="btn btn-sm"
        onClick={stepper.prev}
        disabled={step === 0}
      >
        <T en="← Back" zh="← 上一步" />
      </button>
      <button
        type="button"
        className="btn btn-sm btn-primary"
        onClick={stepper.toggle}
        disabled={playDisabled}
      >
        {stepper.playing ? (
          <T en="⏸ Pause" zh="⏸ 暂停" />
        ) : step >= total - 1 ? (
          <T en="↻ Replay" zh="↻ 重播" />
        ) : (
          <T en="▶ Play" zh="▶ 自动播放" />
        )}
      </button>
      <button
        type="button"
        className="btn btn-sm"
        onClick={onNext ?? stepper.next}
        disabled={nextDisabled || step >= total - 1}
      >
        <T en="Next →" zh="下一步 →" />
      </button>
      {extra}
      <span
        className="mono dim"
        style={{ marginLeft: "auto", fontSize: 12 }}
        aria-live="polite"
      >
        {step + 1} / {total}
      </span>
    </div>
  );
}

/* ========= Predict the next frame: frame signatures and distractors ========= */

/** Flatten a ReactNode to comparable plain text (cell values are mostly numbers or short strings) */
function nodeText(v: ReactNode): string {
  if (v === null || v === undefined || typeof v === "boolean") return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map(nodeText).join("");
  if (isValidElement(v)) {
    const props = v.props as { children?: ReactNode };
    return nodeText(props.children);
  }
  return "?";
}

/** Language-independent form of a pointer label, used only for comparison */
const rawLabel = (l: Loc<string>): string => (typeof l === "string" ? l : l.en);

const cellSig = (f: ArrayFrame) =>
  f.cells.map((c) => `${nodeText(c.v)}:${c.state ?? ""}`).join(",");

const ptrSig = (f: ArrayFrame) =>
  (f.ptrs ?? [])
    .map((p) => `${p.i}@${rawLabel(p.label)}`)
    .sort()
    .join(",");

const fullSig = (f: ArrayFrame) => `${cellSig(f)}||${ptrSig(f)}`;

interface Challenge {
  options: ArrayFrame[];
  correct: number;
  picked: number | null;
}

/**
 * Build one prediction question: the correct answer is the real next frame and
 * the distractors are derived from real frames, each matching a typical
 * misconception. Deduplicated against the correct answer, then two are kept.
 */
function buildChallenge(
  frames: ArrayFrame[],
  step: number,
  n: number,
): Challenge | null {
  const cur = frames[step];
  const next = frames[step + 1];
  if (!cur || !next) return null;

  const seen = new Set([fullSig(next)]);
  const distractors: ArrayFrame[] = [];
  const push = (f: ArrayFrame | null | undefined) => {
    if (!f || distractors.length >= 2) return;
    const s = fullSig(f);
    if (seen.has(s)) return;
    seen.add(s);
    distractors.push(f);
  };

  // (1) One frame too far: a real frame, but a step ahead (off-by-one is the most common slip)
  push(frames[step + 2]);
  // (2) Pointers moved, data did not
  push({ cells: cur.cells, ptrs: next.ptrs, msg: "" });
  // (3) Data moved, pointers did not
  push({ cells: next.cells, ptrs: cur.ptrs, msg: "" });
  // (4) A pointer overshot by one cell
  push({
    cells: next.cells,
    ptrs: (next.ptrs ?? []).map((p) => ({
      ...p,
      i: Math.min(p.i + 1, Math.max(0, n - 1)),
    })),
    msg: "",
  });
  // (5) Fallback: any frame in the sequence can serve as a distractor
  for (const fr of frames) push(fr);

  if (!distractors.length) return null;

  const options = [next, ...distractors];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { options, correct: options.indexOf(next), picked: null };
}

/** Describe a frame in one sentence so screen readers can read an option aloud */
function describeFrame(
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

/** Mini snapshot: the small board inside a prediction option (reuses .cell state colors) */
function MiniBoard({
  frame,
  n,
  cellW,
}: {
  frame: ArrayFrame;
  n: number;
  cellW: number;
}) {
  const L = useL();
  return (
    <div className="pf-board">
      <div
        className="pf-row"
        style={{ gridTemplateColumns: `repeat(${n}, ${cellW}px)` }}
      >
        {Array.from({ length: n }).map((_, i) => {
          const here = (frame.ptrs ?? []).filter((p) => p.i === i);
          return (
            <span key={i} className="pf-ptr">
              {here.map((p, k) => (
                <span key={k}>{L(p.label)}</span>
              ))}
            </span>
          );
        })}
      </div>
      <div
        className="pf-row"
        style={{ gridTemplateColumns: `repeat(${n}, ${cellW}px)` }}
      >
        {Array.from({ length: n }).map((_, i) => {
          const c = frame.cells[i];
          if (!c)
            return (
              <span
                key={i}
                className="cell ghost"
                style={{ width: cellW - 3, height: cellW - 3, opacity: 0 }}
              />
            );
          return (
            <span
              key={i}
              className={`cell${c.state ? ` ${c.state}` : ""}`}
              style={{
                width: cellW - 3,
                height: cellW - 3,
                fontSize: cellW < 34 ? 11 : 13,
                borderRadius: 8,
              }}
            >
              {c.v}
            </span>
          );
        })}
      </div>
    </div>
  );
}

const KEYS = ["A", "B", "C", "D"];

/* ================= ArrayStepper ================= */

export function ArrayStepper({
  title,
  frames,
  cellW = 56,
}: {
  title: Loc<string>;
  frames: ArrayFrame[];
  /** Cell width including the gap, used to position pointers */
  cellW?: number;
}) {
  const L = useL();
  const { lang } = useLang();
  const stepper = useStepper(frames.length);
  const [predictOn, setPredictOn] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const { step, prev: goPrev, next: goNext, toggle: goToggle } = stepper;
  const total = frames.length;

  // Drop a stale prediction question when the frame array is swapped out
  useEffect(() => {
    setChallenge(null);
  }, [total]);

  const n = frames.length
    ? Math.max(...frames.map((fr) => fr.cells.length))
    : 0;

  // "Next" click: in predict mode ask a question first, otherwise just advance
  const handleNext = useCallback(() => {
    if (!predictOn) {
      goNext();
      return;
    }
    const c = buildChallenge(frames, step, n);
    if (c) setChallenge(c);
    else goNext(); // If no distractor can be built (identical frames, say), just advance
  }, [predictOn, frames, step, n, goNext]);

  const pick = (i: number) => {
    if (!challenge || challenge.picked !== null) return;
    setChallenge({ ...challenge, picked: i });
    setScore((s) => ({
      right: s.right + (i === challenge.correct ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const commit = () => {
    setChallenge(null);
    goNext();
  };

  const togglePredict = () => {
    setPredictOn((v) => !v);
    setChallenge(null);
  };

  // Clear an unfinished prediction when stepping back or replaying
  const handlePrev = () => {
    setChallenge(null);
    goPrev();
  };
  const handleToggle = () => {
    setChallenge(null);
    goToggle();
  };

  // step can briefly sit outside a freshly swapped frame array (see the
  // clamping effect in useStepper), so clamp once more here
  const f = frames[Math.min(step, total - 1)];
  if (!f) return null; // Empty frames: render nothing, so Math.max() = -Infinity and null access cannot happen

  const answered = !!challenge && challenge.picked !== null;
  const isRight = challenge && challenge.picked === challenge.correct;
  const miniW = n > 8 ? 26 : n > 5 ? 30 : 34;

  // On a wrong answer, tell the learner which dimension differs
  let diffHint: ReactNode = null;
  if (challenge && challenge.picked !== null && !isRight) {
    const picked = challenge.options[challenge.picked];
    const right = challenge.options[challenge.correct];
    const cellsDiffer = cellSig(picked) !== cellSig(right);
    const ptrsDiffer = ptrSig(picked) !== ptrSig(right);
    diffHint =
      cellsDiffer && ptrsDiffer ? (
        <T
          en="Both the cells and the pointers differ from your pick."
          zh="数据格和指针位置都和你选的不一样。"
        />
      ) : cellsDiffer ? (
        <T
          en="The pointers were right — it is the cell contents (or their highlight) that differ."
          zh="指针位置对了 —— 差在格子的内容或高亮状态。"
        />
      ) : (
        <T
          en="The cells were right — it is the pointer positions that differ."
          zh="格子对了 —— 差在指针停的位置。"
        />
      );
  }

  return (
    <div className="viz">
      <div className="viz-title">{L(title)}</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 6 }}>
        <div
          className="viz-scroll"
          style={{ display: "flex", flexDirection: "column", gap: 6 }}
        >
          {/* Pointer row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${n}, ${cellW}px)`,
              gap: 4,
              minHeight: 30,
            }}
          >
            {Array.from({ length: n }).map((_, i) => {
              const here = (f.ptrs ?? []).filter((p) => p.i === i);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  {here.map((p, k) => (
                    <span key={k} className="ptr">
                      {L(p.label)}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
          {/* Cell row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${n}, ${cellW}px)`,
              gap: 4,
              paddingBottom: 4,
            }}
          >
            {Array.from({ length: n }).map((_, i) => {
              const c = f.cells[i];
              if (!c)
                return (
                  <div
                    key={i}
                    className="cell ghost"
                    style={{
                      width: cellW - 4,
                      height: cellW - 4,
                      opacity: 0,
                    }}
                  />
                );
              return (
                <div
                  key={i}
                  className={`cell${c.state ? ` ${c.state}` : ""}`}
                  style={{ width: cellW - 4, height: cellW - 4 }}
                >
                  {c.v}
                  <span className="cell-idx">{i}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="viz-msg" aria-live="polite">
        {L(f.msg)}
      </div>

      {/* Prediction panel */}
      {challenge && (
        <div className="pf-panel" role="group">
          <div className="pf-q">
            <span className="pf-badge">
              <T en="PREDICT" zh="预测" />
            </span>
            <T
              en="Before it plays — which one is the next frame?"
              zh="先别看答案 —— 下一帧会变成哪一个?"
            />
          </div>

          <div className="pf-opts">
            {challenge.options.map((opt, i) => {
              let cls = "pf-opt";
              if (challenge.picked !== null) {
                if (i === challenge.correct) cls += " right";
                else if (i === challenge.picked) cls += " wrong";
                else cls += " muted";
              }
              return (
                <button
                  key={i}
                  type="button"
                  className={cls}
                  disabled={challenge.picked !== null}
                  onClick={() => pick(i)}
                  aria-label={`${
                    lang === "zh" ? "选项" : "Option"
                  } ${KEYS[i]} — ${describeFrame(opt, n, lang)}`}
                >
                  <span className="pf-key">{KEYS[i]}</span>
                  <MiniBoard frame={opt} n={n} cellW={miniW} />
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={`pf-feedback ${isRight ? "ok" : "no"}`}>
              <div className="pf-verdict">
                {isRight ? (
                  <T
                    en="✓ Correct — you predicted the next state."
                    zh="✓ 预测正确 —— 你已经能推演出下一步的内存状态了。"
                  />
                ) : (
                  <>
                    <T
                      en={`✕ Not quite — the answer is ${KEYS[challenge.correct]}.`}
                      zh={`✕ 差一点 —— 正确答案是 ${KEYS[challenge.correct]}。`}
                    />{" "}
                    {diffHint}
                  </>
                )}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={commit}
              >
                <T en="Reveal & continue →" zh="揭晓并继续 →" />
              </button>
            </div>
          )}
        </div>
      )}

      <StepControls
        stepper={{
          ...stepper,
          prev: handlePrev,
          toggle: handleToggle,
        }}
        step={step}
        total={total}
        onNext={handleNext}
        nextDisabled={!!challenge}
        playDisabled={predictOn}
        extra={
          total > 1 ? (
            <>
              <button
                type="button"
                className={`btn btn-sm pf-toggle${predictOn ? " on" : ""}`}
                onClick={togglePredict}
                aria-pressed={predictOn}
                title={
                  predictOn
                    ? "Step forward and predict each frame"
                    : "Guess each next frame before it plays"
                }
              >
                <T en="🔮 Predict" zh="🔮 预测模式" />
              </button>
              {score.total > 0 && (
                <span className="pf-score mono">
                  {score.right}/{score.total}
                </span>
              )}
            </>
          ) : null
        }
      />
    </div>
  );
}
