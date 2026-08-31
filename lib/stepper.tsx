"use client";

// 通用「逐帧播放器」—— 算法慢动作的骨架。
// ArrayStepper:一排单元格 + 指针标签 + 旁白,适合数组/字符串/栈/队列/
// 双指针/滑动窗口类演示。每一帧是一张完整快照,组件负责播放控制
// (上一步/下一步/自动播放/进度),帧数据由各章自己写。
// 树/图等自由形态的动画请在章节内自建组件,但控制条样式(.viz-ctl)通用。
//
// 双语:title / 指针 label / 每帧 msg 都接受 Loc<…>。
//
// 「预测下一帧」模式(predict mode):打开后,点「下一步」不再直接前进,
// 而是先给出三张候选快照让学习者选。干扰项由真实帧自动派生,针对四类典型误区:
// ① 过头一帧(off-by-one)② 指针动了、数据没动 ③ 数据动了、指针没动
// ④ 指针多走一格。选完再揭晓并前进 —— 把「看动画」变成「先思考」。

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
  /** 指针标签,渲染在单元格上方,如 { i: 2, label: "slow" } */
  ptrs?: { i: number; label: Loc<string> }[];
  /** 本帧旁白 */
  msg: Loc<ReactNode>;
}

export function useStepper(total: number, intervalMs = 1100) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      // 更新函数必须是纯的:这里只推进帧号,停止播放交给下面的 effect
      setStep((s) => (s >= total - 1 ? s : s + 1));
    }, intervalMs);
    return () => clearInterval(id);
  }, [playing, total, intervalMs]);

  // 播到最后一帧自动停
  useEffect(() => {
    if (playing && step >= total - 1) setPlaying(false);
  }, [playing, step, total]);

  // 帧数组被换掉(例如切换演示用例)导致总帧数变少时,把 step 拉回合法范围,
  // 否则 frames[step] 会取到 undefined 而崩溃
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
  /** 覆盖「下一步」的行为(预测模式用它拦截前进) */
  onNext,
  /** 预测未作答时禁用「下一步」,避免两条前进路径打架 */
  nextDisabled,
  /** 预测模式下禁用自动播放(否则会跳过预测) */
  playDisabled,
  /** 额外控件(如预测模式开关),渲染在计数器之前 */
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

/* ================= 预测下一帧:帧签名与干扰项生成 ================= */

/** 把 ReactNode 抽成可比较的纯文本(单元格的值多为数字/短字符串) */
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

/** 指针标签取语言无关的形式,仅用于比较 */
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
 * 造一道预测题:正确答案是真实的下一帧,干扰项从真实帧派生,
 * 每个都对应一种典型误解。全部与正确答案去重后取两个。
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

  // ① 过头一帧:真实存在,但快了一步(off-by-one 是最常见的误判)
  push(frames[step + 2]);
  // ② 指针动了,数据还没动
  push({ cells: cur.cells, ptrs: next.ptrs, msg: "" });
  // ③ 数据动了,指针忘了动
  push({ cells: next.cells, ptrs: cur.ptrs, msg: "" });
  // ④ 指针多走一格
  push({
    cells: next.cells,
    ptrs: (next.ptrs ?? []).map((p) => ({
      ...p,
      i: Math.min(p.i + 1, Math.max(0, n - 1)),
    })),
    msg: "",
  });
  // ⑤ 兜底:序列里任何一帧都能当干扰项
  for (const fr of frames) push(fr);

  if (!distractors.length) return null;

  const options = [next, ...distractors];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { options, correct: options.indexOf(next), picked: null };
}

/** 把一帧描述成一句话,供屏幕阅读器朗读选项内容 */
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

/** 迷你快照:预测选项里的小棋盘(复用 .cell 的状态配色) */
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
  /** 单元格宽度(含间隙),用于指针定位 */
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

  // 帧数组被换掉(切换演示用例)时,丢弃过期的预测题
  useEffect(() => {
    setChallenge(null);
  }, [total]);

  const n = frames.length
    ? Math.max(...frames.map((fr) => fr.cells.length))
    : 0;

  // 点「下一步」:预测模式下先出题,否则直接前进
  const handleNext = useCallback(() => {
    if (!predictOn) {
      goNext();
      return;
    }
    const c = buildChallenge(frames, step, n);
    if (c) setChallenge(c);
    else goNext(); // 造不出干扰项(如全同帧)就正常前进
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

  // 后退 / 重播时清掉未完成的预测
  const handlePrev = () => {
    setChallenge(null);
    goPrev();
  };
  const handleToggle = () => {
    setChallenge(null);
    goToggle();
  };

  // step 可能短暂落在新帧数组之外(见 useStepper 里的收敛 effect),这里再夹一次
  const f = frames[Math.min(step, total - 1)];
  if (!f) return null; // frames 为空:不渲染,避免 Math.max() = -Infinity 与空指针

  const answered = !!challenge && challenge.picked !== null;
  const isRight = challenge && challenge.picked === challenge.correct;
  const miniW = n > 8 ? 26 : n > 5 ? 30 : 34;

  // 答错时告诉学习者「差在哪一维」
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
          {/* 指针行 */}
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
          {/* 单元格行 */}
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

      {/* 预测面板 */}
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
