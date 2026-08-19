"use client";

// 通用「逐帧播放器」—— 算法慢动作的骨架。
// ArrayStepper:一排单元格 + 指针标签 + 旁白,适合数组/字符串/栈/队列/
// 双指针/滑动窗口类演示。每一帧是一张完整快照,组件负责播放控制
// (上一步/下一步/自动播放/进度),帧数据由各章自己写。
// 树/图等自由形态的动画请在章节内自建组件,但控制条样式(.viz-ctl)通用。
//
// 双语:title / 指针 label / 每帧 msg 都接受 Loc<…>。

import { useEffect, useState, type ReactNode } from "react";
import { useL, T, type Loc } from "@/lib/i18n";

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
}: {
  stepper: ReturnType<typeof useStepper>;
  step: number;
  total: number;
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
        onClick={stepper.next}
        disabled={step >= total - 1}
      >
        <T en="Next →" zh="下一步 →" />
      </button>
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
  const stepper = useStepper(frames.length);
  // step 可能短暂落在新帧数组之外(见 useStepper 里的收敛 effect),这里再夹一次
  const f = frames[Math.min(stepper.step, frames.length - 1)];
  if (!f) return null; // frames 为空:不渲染,避免 Math.max() = -Infinity 与空指针
  const n = Math.max(...frames.map((fr) => fr.cells.length));

  return (
    <div className="viz">
      <div className="viz-title">{L(title)}</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 6 }}>
        <div className="viz-scroll" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
              return <div key={i} className="cell ghost" style={{ width: cellW - 4, height: cellW - 4, opacity: 0 }} />;
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
      <StepControls stepper={stepper} step={stepper.step} total={frames.length} />
    </div>
  );
}
