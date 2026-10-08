"use client";

// Quiz engine — three question types:
//  - choice: single answer, graded on click; a wrong pick gets targeted
//    feedback (one message per wrong option, never generic copy) and the
//    correct option lights up. Scored on the first click.
//  - multi: several answers, graded by the check button; missing picks and
//    extra picks get separate hints.
//  - fill: free text, graded on Enter or the button; retries allowed until
//    correct (scored on whether it ends up correct).
// All answered → summary panel, and the score goes to the progress system (the
// best historical score decides whether the chapter counts as completed).
//
// Bilingual: q / opts / why / wrong / hint all accept Loc<…>;
// a fill item's answers is a list of acceptable answers — put both the English
// and the Chinese spellings in it. Matching ignores case, spaces and full-width
// forms (NFKC), so 「O（n）」 typed with a Chinese IME counts as O(n); the IME's
// 「、」 and 「。」 stand for , or / and for . respectively.
//
// Accessibility: each question has a persistent live region, so its verdict is
// announced when it appears, and answering never disables the focused control
// (aria-disabled instead), so keyboard focus stays where the learner was.

import { useEffect, useState, type ReactNode } from "react";
import { useProgress } from "@/lib/progress";
import { useL, useLang, T, type Loc } from "@/lib/i18n";
import type { ChapterId } from "@/lib/curriculum";

export type QuizItem =
  | {
      type: "choice";
      q: Loc<ReactNode>;
      opts: Loc<ReactNode>[];
      correct: number;
      /** Targeted feedback per option (leave the correct one undefined) */
      wrong?: (Loc<ReactNode> | undefined)[];
      why: Loc<ReactNode>;
    }
  | {
      type: "multi";
      q: Loc<ReactNode>;
      opts: Loc<ReactNode>[];
      correct: number[];
      missHint: Loc<ReactNode>;
      extraHint: Loc<ReactNode>;
      why: Loc<ReactNode>;
    }
  | {
      type: "fill";
      q: Loc<ReactNode>;
      placeholder?: Loc<string>;
      /** Accepted answers (compared case-insensitively after trimming); include both English and Chinese spellings */
      answers: string[];
      hint: Loc<ReactNode>;
      why: Loc<ReactNode>;
    };

type ItemState =
  | { phase: "idle" }
  | { phase: "right"; first: boolean }
  | { phase: "wrong"; picked: number | null; tries: number };

const KEYS = "ABCDEFGH";

/**
 * Canonical form for comparing a typed answer with an accepted one. NFKC folds
 * full-width forms (（）， ０-９ Ａ-Ｚ) into ASCII. The ideographic full stop
 * becomes "."; the ideographic comma 、 is what a Chinese IME produces for both
 * "," in a list and "/" in a fraction, so it is resolved to `sep`.
 */
export function normAnswer(s: string, sep: "," | "/" = ",") {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/。/g, ".")
    .replace(/、/g, sep);
}

/** Does a typed answer match one of the accepted answers? */
export function answerMatches(typed: string, answers: string[]) {
  return (["," , "/"] as const).some((sep) => {
    const t = normAnswer(typed, sep);
    return t !== "" && answers.some((a) => normAnswer(a, sep) === t);
  });
}

const HAS_CJK = /[\u3400-\u9fff]/;

/** The accepted answer to show a reader: the first one written in their language. */
export function displayAnswer(answers: string[], lang: "en" | "zh") {
  return (
    answers.find((a) => HAS_CJK.test(a) === (lang === "zh")) ?? answers[0]
  );
}

export function Quiz({ ch, items }: { ch: ChapterId; items: QuizItem[] }) {
  const L = useL();
  const { reportQuiz, data, ready } = useProgress();
  const best = ready ? data.quiz[ch] : undefined;
  const [states, setStates] = useState<ItemState[]>(() =>
    items.map(() => ({ phase: "idle" })),
  );
  const [multiPicks, setMultiPicks] = useState<Record<number, number[]>>({});
  const [fillText, setFillText] = useState<Record<number, string>>({});
  const [reported, setReported] = useState(false);

  const answered = states.filter((s) => s.phase !== "idle").length;
  const firstRight = states.filter(
    (s) => s.phase === "right" && s.first,
  ).length;
  const allDone = answered === items.length;

  // All answered → report the score. This lives in an effect rather than in a
  // setStates updater: updaters must be pure, Strict Mode and concurrent
  // rendering call them more than once, and a side effect there reports twice.
  useEffect(() => {
    if (reported) return;
    if (states.length === 0) return;
    if (!states.every((s) => s.phase !== "idle")) return;
    const right = states.filter((s) => s.phase === "right" && s.first).length;
    reportQuiz(ch, right, items.length);
    setReported(true);
  }, [states, reported, reportQuiz, ch, items.length]);

  const setState = (i: number, st: ItemState) => {
    setStates((prev) => {
      const next = [...prev];
      next[i] = st;
      return next;
    });
  };

  const reset = () => {
    setStates(items.map(() => ({ phase: "idle" })));
    setMultiPicks({});
    setFillText({});
    setReported(false);
  };

  return (
    <div className="quiz">
      {best && (
        <p className="q-best">
          <T
            en={
              <>
                Your best score so far: <b>{best.right}/{best.total}</b>
                {best.right === best.total ? ". Chapter complete." : "."}
              </>
            }
            zh={
              <>
                历史最佳成绩:<b>{best.right}/{best.total}</b>
                {best.right === best.total ? ",本章已完成。" : "。"}
              </>
            }
          />
        </p>
      )}
      {items.map((item, i) => {
        const st = states[i];
        const dataState =
          st.phase === "right" ? "right" : st.phase === "wrong" ? "wrong" : "";
        return (
          <div className="q-item" key={i} data-state={dataState}>
            <div className="q-num">
              <T
                en={`QUESTION ${String(i + 1).padStart(2, "0")} / ${items.length}`}
                zh={`第 ${i + 1} 题 / 共 ${items.length} 题`}
              />
            </div>
            <p className="q-text">{L(item.q)}</p>

            {item.type === "choice" && (
              <ChoiceBody
                item={item}
                st={st}
                onPick={(k) => {
                  if (st.phase !== "idle") return;
                  if (k === item.correct)
                    setState(i, { phase: "right", first: true });
                  else setState(i, { phase: "wrong", picked: k, tries: 1 });
                }}
              />
            )}

            {item.type === "multi" && (
              <MultiBody
                item={item}
                st={st}
                picks={multiPicks[i] ?? []}
                onToggle={(k) => {
                  if (st.phase !== "idle") return;
                  setMultiPicks((p) => {
                    const cur = p[i] ?? [];
                    return {
                      ...p,
                      [i]: cur.includes(k)
                        ? cur.filter((x) => x !== k)
                        : [...cur, k],
                    };
                  });
                }}
                onCheck={() => {
                  if (st.phase !== "idle") return;
                  const picks = (multiPicks[i] ?? []).slice().sort();
                  const target = item.correct.slice().sort();
                  const ok =
                    picks.length === target.length &&
                    picks.every((v, j) => v === target[j]);
                  if (ok) setState(i, { phase: "right", first: true });
                  else setState(i, { phase: "wrong", picked: null, tries: 1 });
                }}
              />
            )}

            {item.type === "fill" && (
              <FillBody
                item={item}
                index={i}
                st={st}
                text={fillText[i] ?? ""}
                setText={(v) => setFillText((p) => ({ ...p, [i]: v }))}
                onSubmit={() => {
                  if (st.phase === "right") return;
                  const typed = fillText[i] ?? "";
                  if (!typed.trim()) return;
                  const ok = answerMatches(typed, item.answers);
                  if (ok)
                    setState(i, {
                      phase: "right",
                      first: st.phase === "idle",
                    });
                  else
                    setState(i, {
                      phase: "wrong",
                      picked: null,
                      tries: st.phase === "wrong" ? st.tries + 1 : 1,
                    });
                }}
              />
            )}
          </div>
        );
      })}

      {allDone && (
        <div className="quiz-score">
          <span className="big">
            {firstRight}/{items.length}
          </span>
          <span>
            {firstRight === items.length ? (
              <T
                en={
                  <>
                    <b>All correct. Chapter complete.</b> The green dot next to
                    this chapter in the sidebar is now on.
                  </>
                }
                zh={
                  <>
                    <b>全部答对,本章完成。</b>侧栏中本章旁的绿点已经亮起。
                  </>
                }
              />
            ) : (
              <T
                en={
                  <>
                    You answered {firstRight} of {items.length} correctly on the
                    first try. Read the explanations for the ones you missed,
                    then <b>redo the quiz and get them all right</b>.
                  </>
                }
                zh={
                  <>
                    第一次尝试答对 {firstRight} 题。先看看错题的解释,然后
                    <b>重做一遍并全部答对</b>,才算完成这一章。
                  </>
                }
              />
            )}
          </span>
          <button
            type="button"
            className="btn btn-sm"
            style={{ marginLeft: "auto" }}
            onClick={reset}
          >
            {L({ en: "Retry quiz", zh: "重做测验" })}
          </button>
        </div>
      )}
    </div>
  );
}

function ChoiceBody({
  item,
  st,
  onPick,
}: {
  item: Extract<QuizItem, { type: "choice" }>;
  st: ItemState;
  onPick: (k: number) => void;
}) {
  const L = useL();
  const locked = st.phase !== "idle";
  return (
    <>
      <div className="q-opts" role="group">
        {item.opts.map((opt, k) => {
          let cls = "q-opt";
          if (locked) {
            if (k === item.correct) cls += " right";
            else if (st.phase === "wrong" && st.picked === k) cls += " wrong";
          }
          return (
            <button
              key={k}
              type="button"
              className={cls}
              aria-disabled={locked || undefined}
              onClick={() => onPick(k)}
            >
              <span className="key">{KEYS[k]}</span>
              <span>{L(opt)}</span>
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {st.phase === "right" && (
          <div className="q-feedback ok">✓ {L(item.why)}</div>
        )}
        {st.phase === "wrong" && st.picked !== null && (
          <div className="q-feedback no">
            ✕ {L(item.wrong?.[st.picked] ?? item.why)}
            <p style={{ marginTop: 6, marginBottom: 0 }}>
              <b>
                <T
                  en={<>The correct answer is {KEYS[item.correct]}: </>}
                  zh={<>正确答案是 {KEYS[item.correct]}:</>}
                />
              </b>
              {L(item.why)}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function MultiBody({
  item,
  st,
  picks,
  onToggle,
  onCheck,
}: {
  item: Extract<QuizItem, { type: "multi" }>;
  st: ItemState;
  picks: number[];
  onToggle: (k: number) => void;
  onCheck: () => void;
}) {
  const L = useL();
  const locked = st.phase !== "idle";
  const missed = item.correct.some((c) => !picks.includes(c));
  const extra = picks.some((p) => !item.correct.includes(p));
  return (
    <>
      <div
        className="q-opts"
        role="group"
        aria-label={L({ en: "Select all that apply", zh: "多选" })}
      >
        {item.opts.map((opt, k) => {
          let cls = "q-opt";
          if (!locked && picks.includes(k)) cls += " picked";
          if (locked) {
            if (item.correct.includes(k)) cls += " right";
            else if (picks.includes(k)) cls += " wrong";
          }
          return (
            <button
              key={k}
              type="button"
              className={cls}
              aria-pressed={picks.includes(k)}
              aria-disabled={locked || undefined}
              onClick={() => onToggle(k)}
            >
              <span className="key">{picks.includes(k) ? "✓" : KEYS[k]}</span>
              <span>{L(opt)}</span>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 12 }}>
        {/* Stays mounted after checking: removing the focused button would
            drop keyboard focus onto <body> */}
        <button
          type="button"
          className="btn btn-sm"
          aria-disabled={locked || picks.length === 0 || undefined}
          onClick={() => {
            if (!locked && picks.length > 0) onCheck();
          }}
        >
          {L({ en: "Check answer", zh: "检查答案" })}
        </button>
      </div>
      <div aria-live="polite">
        {st.phase === "right" && (
          <div className="q-feedback ok">✓ {L(item.why)}</div>
        )}
        {st.phase === "wrong" && (
          <div className="q-feedback no">
            ✕ {L(extra ? item.extraHint : missed ? item.missHint : item.why)}
            <p style={{ marginTop: 6, marginBottom: 0 }}>
              <b>
                <T en="Correct combination: " zh="正确组合:" />
              </b>
              {item.correct.map((c) => KEYS[c]).join(" + ")} — {L(item.why)}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function FillBody({
  item,
  index,
  st,
  text,
  setText,
  onSubmit,
}: {
  item: Extract<QuizItem, { type: "fill" }>;
  index: number;
  st: ItemState;
  text: string;
  setText: (v: string) => void;
  onSubmit: () => void;
}) {
  const L = useL();
  const { lang } = useLang();
  const solved = st.phase === "right";
  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          className="q-input"
          aria-label={L({
            en: `Answer to question ${index + 1}`,
            zh: `第 ${index + 1} 题的答案`,
          })}
          placeholder={
            item.placeholder === undefined
              ? L({ en: "Type your answer…", zh: "输入答案…" })
              : L(item.placeholder)
          }
          value={text}
          readOnly={solved}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // The Enter that confirms an IME composition is not a submit
            if (e.nativeEvent.isComposing || e.keyCode === 229) return;
            if (e.key === "Enter") onSubmit();
          }}
        />
        <button
          type="button"
          className="btn btn-sm"
          disabled={solved || !text.trim()}
          onClick={onSubmit}
        >
          {L({ en: "Check", zh: "确认" })}
        </button>
      </div>
      <div aria-live="polite">
        {solved && <div className="q-feedback ok">✓ {L(item.why)}</div>}
        {st.phase === "wrong" && (
          <div className="q-feedback no">
            ✕ <T en="Not quite yet" zh="还不对" /> — {L(item.hint)}
            {st.tries >= 3 && (
              <p style={{ marginTop: 6, marginBottom: 0 }}>
                <b>
                  <T en="Accepted answer: " zh="参考答案:" />
                </b>
                <code>{displayAnswer(item.answers, lang)}</code>
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
