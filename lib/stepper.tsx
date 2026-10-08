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
//
// The construction of those options is pure and lives in lib/predict.ts, which
// is where the regression tests exercise it. This file owns only the state:
// which question is open, whether it has been answered, and the score. The
// score is scoped to one frame dataset — see the reset effect below.

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { useL, useLang, T, type Loc } from "@/lib/i18n";
import {
  buildChallenge,
  describeFrame,
  diffKind,
  framesSig,
  type ArrayCell,
  type ArrayFrame,
  type Challenge,
} from "@/lib/predict";

// Re-exported so chapters keep importing the frame types from "@/lib/stepper".
export type { ArrayCell, ArrayFrame };

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
    pause: () => setPlaying(false),
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
  /** Handles on the Next and Play buttons, so a caller can return focus to them */
  nextRef,
  playRef,
}: {
  stepper: ReturnType<typeof useStepper>;
  step: number;
  total: number;
  onNext?: () => void;
  nextDisabled?: boolean;
  playDisabled?: boolean;
  extra?: ReactNode;
  nextRef?: Ref<HTMLButtonElement>;
  playRef?: Ref<HTMLButtonElement>;
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
        ref={playRef}
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
        ref={nextRef}
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

/* ---- Predict-mode state ----
 * The open question and the running score live in one reducer, so answering
 * updates both in a single pure transition. React may run a reducer twice
 * (StrictMode does so on purpose); with no side effect inside, an answer is
 * still scored exactly once. */
type PredictState = {
  challenge: Challenge | null;
  score: { right: number; total: number };
};

type PredictAction =
  | { type: "ask"; challenge: Challenge }
  | { type: "pick"; option: number }
  | { type: "close" }
  | { type: "reset" };

const PREDICT_START: PredictState = {
  challenge: null,
  score: { right: 0, total: 0 },
};

function predictReducer(s: PredictState, a: PredictAction): PredictState {
  switch (a.type) {
    case "ask":
      return { ...s, challenge: a.challenge };
    case "pick": {
      const c = s.challenge;
      // Answer once per question: a second pick is ignored even if it is
      // dispatched before the first one has been rendered.
      if (!c || c.picked !== null) return s;
      return {
        challenge: { ...c, picked: a.option },
        score: {
          right: s.score.right + (a.option === c.correct ? 1 : 0),
          total: s.score.total + 1,
        },
      };
    }
    case "close":
      return s.challenge ? { ...s, challenge: null } : s;
    case "reset":
      return PREDICT_START;
  }
}

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
  const [{ challenge, score }, dispatch] = useReducer(
    predictReducer,
    PREDICT_START,
  );

  const {
    step,
    prev: goPrev,
    next: goNext,
    toggle: goToggle,
    pause,
    reset,
  } = stepper;
  const total = frames.length;

  // Score scope: one prediction score belongs to one frame dataset. Chapters
  // that let the learner switch demo cases swap `frames`, and carrying a score
  // across that switch would attribute answers to a walkthrough they were never
  // given. Both the score and any unfinished question therefore reset whenever
  // the dataset changes.
  //
  // Keyed on the frame contents rather than on `frames.length` (two demos can
  // be the same length) or on array identity (a chapter building the array
  // inline would otherwise reset the score on every render).
  const datasetKey = useMemo(() => framesSig(frames), [frames]);
  useEffect(() => {
    dispatch({ type: "reset" });
  }, [datasetKey]);

  // Keyboard flow through a question. The control that opens, answers or
  // closes a question is disabled or removed the moment it is used, which
  // would drop focus onto <body>. Each of those handlers therefore records
  // where focus should go, and this effect moves it once the new state has
  // rendered: Next → first option → "Reveal & continue" → Next again (or
  // Replay on the last frame, where Next is disabled).
  const focusAfterRender = useRef<"options" | "reveal" | "next" | null>(null);
  const firstOptionRef = useRef<HTMLButtonElement>(null);
  const revealRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const target = focusAfterRender.current;
    if (!target) return;
    focusAfterRender.current = null;
    if (target === "options") firstOptionRef.current?.focus();
    else if (target === "reveal") revealRef.current?.focus();
    else {
      const next = nextRef.current;
      (next && !next.disabled ? next : playRef.current)?.focus();
    }
  });

  const ids = useId();
  const promptId = `${ids}-prompt`;
  const verdictId = `${ids}-verdict`;

  const n = frames.length
    ? Math.max(...frames.map((fr) => fr.cells.length))
    : 0;

  // "Next" click: in predict mode ask a question first, otherwise just advance
  const handleNext = useCallback(() => {
    if (!predictOn) {
      goNext();
      return;
    }
    // Autoplay must never advance frames underneath an open question
    pause();
    const c = buildChallenge(frames, step, n);
    if (c) {
      dispatch({ type: "ask", challenge: c });
      focusAfterRender.current = "options";
    } else goNext(); // If no distractor can be built (identical frames, say), just advance
  }, [predictOn, frames, step, n, goNext, pause]);

  const pick = (i: number) => {
    dispatch({ type: "pick", option: i });
    focusAfterRender.current = "reveal";
  };

  const commit = () => {
    dispatch({ type: "close" });
    goNext();
    focusAfterRender.current = "next";
  };

  const togglePredict = () => {
    // Entering predict mode stops autoplay first: a running interval would
    // keep advancing frames and show each answer before it is given
    if (!predictOn) pause();
    setPredictOn(!predictOn);
    dispatch({ type: "close" });
  };

  // Clear an unfinished prediction when stepping back or replaying
  const handlePrev = () => {
    dispatch({ type: "close" });
    goPrev();
  };
  const handleToggle = () => {
    dispatch({ type: "close" });
    // In predict mode this button is enabled only on the last frame, where it
    // reads "Replay": start over at frame 1 without autoplay, ready to
    // predict again
    if (predictOn) reset();
    else goToggle();
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
    const kind = diffKind(
      challenge.options[challenge.picked],
      challenge.options[challenge.correct],
    );
    diffHint =
      kind === "both" ? (
        <T
          en="Both the cells and the pointers differ from your pick."
          zh="数据格和指针位置都和你选的不一样。"
        />
      ) : kind === "cells" ? (
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
        <div className="pf-panel" role="group" aria-labelledby={promptId}>
          <div className="pf-q" id={promptId}>
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
                  ref={i === 0 ? firstOptionRef : undefined}
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
              <div className="pf-verdict" id={verdictId}>
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
              {/* Focus lands here after a pick; the verdict is attached as
                  its description, so a screen reader announces it */}
              <button
                ref={revealRef}
                type="button"
                className="btn btn-sm btn-primary"
                onClick={commit}
                aria-describedby={verdictId}
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
        // Autoplay would skip the predictions. On the last frame the same
        // button reads "Replay" and restarts the walkthrough instead.
        playDisabled={predictOn && step < total - 1}
        nextRef={nextRef}
        playRef={playRef}
        extra={
          total > 1 ? (
            <>
              <button
                type="button"
                className={`btn btn-sm pf-toggle${predictOn ? " on" : ""}`}
                onClick={togglePredict}
                aria-pressed={predictOn}
                title={L(
                  predictOn
                    ? {
                        en: "Step forward and predict each frame",
                        zh: "逐帧前进，每一步先作预测",
                      }
                    : {
                        en: "Guess each next frame before it plays",
                        zh: "在下一帧播放之前先作预测",
                      },
                )}
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
