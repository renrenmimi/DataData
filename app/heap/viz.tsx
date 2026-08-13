"use client";

// 第 9 章 · 堆与优先队列的专属可视化:
//  - HeapLab(招牌):小根堆「树视图 + 数组视图」双视图联动,
//    push(上浮)/ pop(下沉)逐步动画,高亮每一对比较/交换;
//    附「随机数组建堆」按钮,演示 Floyd O(n) 建堆。
//  - HeapMapFig:静态图 —— 完全二叉树 ↔ 数组的下标映射(父子公式)。

import { useState, type ReactNode } from "react";

/* ================= 工具 ================= */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 下标 i 在树视图中的坐标:深度 = ⌊log₂(i+1)⌋,层内序号决定 x */
function treePos(i: number, w: number) {
  const d = Math.floor(Math.log2(i + 1));
  const k = i - (2 ** d - 1);
  return { x: ((k + 0.5) / 2 ** d) * w, y: 36 + d * 62, d };
}

/* ================= HeapLab ================= */

const CAP = 15;
const TW = 600;

export function HeapLab() {
  const [arr, setArr] = useState<number[]>([10, 20, 15, 30, 40]);
  const [hot, setHot] = useState<[number, number] | null>(null); // 正在比较/交换的下标对
  const [okIdx, setOkIdx] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [lastSwaps, setLastSwaps] = useState<number | null>(null);
  const [msg, setMsg] = useState<ReactNode>(
    "这是一个小根堆。push 一个数看它「上浮」,pop 看堆顶怎么补位「下沉」。",
  );

  const n = arr.length;
  const levels = n === 0 ? 1 : Math.floor(Math.log2(n)) + 1;
  const svgH = 36 + levels * 62;

  const clearMarks = () => {
    setHot(null);
    setOkIdx(null);
  };

  const stateOf = (i: number) => {
    if (hot && (hot[0] === i || hot[1] === i)) return " lit";
    if (okIdx === i) return " ok";
    return "";
  };

  const readInput = (): number | null => {
    const v = Number(input.trim());
    if (input.trim() === "" || !Number.isInteger(v) || v < 0 || v > 99) {
      setMsg("请先输入一个 0–99 的整数。");
      return null;
    }
    return v;
  };

  const doPush = async () => {
    if (busy) return;
    const v = readInput();
    if (v === null) return;
    if (n >= CAP) {
      setMsg(`实验室最多 ${CAP} 个元素 —— pop 几个或重置再玩。`);
      return;
    }
    setBusy(true);
    clearMarks();
    let a = [...arr, v];
    let i = a.length - 1;
    setArr(a);
    setOkIdx(i);
    setMsg(
      <>
        push({v}):① 先放到<b>数组尾部</b> = 树的下一个空位 ——
        完全二叉树的形状永远不破。
      </>,
    );
    await sleep(850);
    let swaps = 0;
    while (i > 0) {
      const p = (i - 1) >> 1;
      setOkIdx(null);
      setHot([i, p]);
      const smaller = a[i] < a[p];
      setMsg(
        <>
          ② 上浮:a[{i}]={a[i]} 和父节点 a[{p}]={a[p]} 比 ——{" "}
          {smaller ? (
            <b>比父节点小,交换!</b>
          ) : (
            <b>不比父节点小,到位,停。</b>
          )}
        </>,
      );
      await sleep(850);
      if (!smaller) break;
      a = [...a];
      [a[i], a[p]] = [a[p], a[i]];
      setArr(a);
      swaps++;
      i = p;
      await sleep(500);
    }
    setHot(null);
    setOkIdx(i);
    setLastSwaps(swaps);
    setMsg(
      <>
        落位!{v} 上浮了 <b>{swaps}</b> 次 ≤ 树高 {Math.floor(Math.log2(a.length)) + 1} ——
        push 是 <b>O(log n)</b>,因为最多走一条「叶到根」的路。
      </>,
    );
    setBusy(false);
  };

  const doPop = async () => {
    if (busy) return;
    if (n === 0) {
      setMsg("堆空了 —— 先 push 几个数。");
      return;
    }
    setBusy(true);
    clearMarks();
    const top = arr[0];
    setOkIdx(0);
    setMsg(
      <>
        pop():堆顶 <b>{top}</b> 就是全场最小(小根堆唯一的承诺),它要出队了。
      </>,
    );
    await sleep(900);
    if (n === 1) {
      setArr([]);
      clearMarks();
      setMsg(<>弹出 {top},堆空了。</>);
      setBusy(false);
      return;
    }
    let a = [arr[n - 1], ...arr.slice(1, n - 1)];
    setArr(a);
    setOkIdx(null);
    setHot([0, 0]);
    setMsg(
      <>
        ① 尾巴 <b>{a[0]}</b> 补到堆顶 —— 完全二叉树形状保住了,
        但堆序多半坏了,得让它「下沉」回去。
      </>,
    );
    await sleep(950);
    let i = 0;
    let swaps = 0;
    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let m = i;
      if (l < a.length && a[l] < a[m]) m = l;
      if (r < a.length && a[r] < a[m]) m = r;
      if (m === i) {
        setHot(null);
        setOkIdx(i);
        setMsg(
          l < a.length ? (
            <>比孩子都小(或没孩子了),到位。</>
          ) : (
            <>没有孩子了,到底,停。</>
          ),
        );
        await sleep(500);
        break;
      }
      setHot([i, m]);
      setMsg(
        <>
          ② 下沉:a[{i}]={a[i]} 和<b>较小的</b>孩子 a[{m}]={a[m]} 换 ——
          换大的那个会立刻违反「父 ≤ 子」。
        </>,
      );
      await sleep(900);
      a = [...a];
      [a[i], a[m]] = [a[m], a[i]];
      setArr(a);
      swaps++;
      i = m;
      await sleep(500);
    }
    setLastSwaps(swaps);
    setMsg(
      <>
        pop 完成:弹出 <b>{top}</b>,补位元素下沉 <b>{swaps}</b> 次,
        新堆顶 {a[0]}。pop 也是 <b>O(log n)</b> —— 一条「根到叶」的路。
      </>,
    );
    setBusy(false);
  };

  const doHeapify = async () => {
    if (busy) return;
    setBusy(true);
    clearMarks();
    setInput("");
    let a = Array.from({ length: 7 }, () => 1 + Math.floor(Math.random() * 99));
    setArr(a);
    setMsg(
      <>
        一个乱序数组。Floyd 建堆:<b>从最后一个父节点(下标 {(a.length >> 1) - 1}
        )倒着到 0</b>,逐个下沉 —— 叶子(后一半)根本不用管。
      </>,
    );
    await sleep(1400);
    let swaps = 0;
    for (let s = (a.length >> 1) - 1; s >= 0; s--) {
      let i = s;
      setHot([i, i]);
      setMsg(
        <>
          处理下标 {s}(值 {a[s]}):让它在自己的子树里下沉到位…
        </>,
      );
      await sleep(700);
      while (true) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let m = i;
        if (l < a.length && a[l] < a[m]) m = l;
        if (r < a.length && a[r] < a[m]) m = r;
        if (m === i) break;
        setHot([i, m]);
        await sleep(650);
        a = [...a];
        [a[i], a[m]] = [a[m], a[i]];
        setArr(a);
        swaps++;
        i = m;
      }
    }
    setHot(null);
    setLastSwaps(swaps);
    setMsg(
      <>
        建堆完成!7 个元素只交换了 <b>{swaps}</b> 次(≤ n)——
        一半节点是叶子沉 0 步、1/4 最多沉 1 步…… 越能沉得深的节点越稀少,
        总账收敛到 <b>O(n)</b>,比逐个 push 的 O(n log n) 便宜。
      </>,
    );
    setBusy(false);
  };

  const doReset = () => {
    if (busy) return;
    clearMarks();
    setInput("");
    setLastSwaps(null);
    setArr([10, 20, 15, 30, 40]);
    setMsg("回到示例小根堆。注意树里兄弟之间可以乱序 —— 堆不管这个。");
  };

  return (
    <div className="viz">
      <div className="viz-title">堆实验室 —— 树视图 + 数组视图,同一份数据两种长相</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 10 }}>
        {/* 树视图 */}
        <svg
          viewBox={`0 0 ${TW} ${svgH}`}
          className="hp-svg"
          role="img"
          aria-label="堆的树视图"
        >
          {arr.map((_, i) => {
            if (i === 0) return null;
            const p = (i - 1) >> 1;
            const a = treePos(p, TW);
            const b = treePos(i, TW);
            return <line key={i} className="hp-edge" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
          {arr.map((v, i) => {
            const pos = treePos(i, TW);
            return (
              <g key={i} className={`hp-node${stateOf(i)}`}>
                <circle cx={pos.x} cy={pos.y} r={17} />
                <text x={pos.x} y={pos.y}>
                  {v}
                </text>
                <text className="hp-tag" x={pos.x} y={pos.y + 32}>
                  [{i}]
                </text>
              </g>
            );
          })}
          {n === 0 && (
            <text className="hp-empty" x={TW / 2} y={54}>
              (空堆)
            </text>
          )}
        </svg>
        {/* 数组视图 */}
        <div className="hp-array" aria-label="堆的数组视图">
          {arr.map((v, i) => (
            <div key={i} className={`cell${stateOf(i)}`} style={{ width: 44, height: 44 }}>
              {v}
              <span className="cell-idx">{i}</span>
            </div>
          ))}
          {n === 0 && <span className="dim mono" style={{ fontSize: 12 }}>[ ]</span>}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <div className="viz-ctl">
        <input
          className="hp-input"
          value={input}
          inputMode="numeric"
          placeholder="0–99"
          disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") doPush();
          }}
          aria-label="输入要 push 的数字"
        />
        <button type="button" className="btn btn-sm btn-primary" onClick={doPush} disabled={busy}>
          push(上浮)
        </button>
        <button type="button" className="btn btn-sm" onClick={doPop} disabled={busy}>
          pop(下沉)
        </button>
        <button type="button" className="btn btn-sm" onClick={doHeapify} disabled={busy}>
          随机数组建堆 O(n)
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={doReset} disabled={busy}>
          重置
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          元素 {n} · 高度 {n === 0 ? 0 : Math.floor(Math.log2(n)) + 1}
          {lastSwaps !== null && <> · 上次操作交换 {lastSwaps} 次</>}
        </span>
      </div>
    </div>
  );
}

/* ================= HeapMapFig:数组 ↔ 树 映射 ================= */

const FIG_VALUES = [10, 20, 15, 30, 40, 60];

export function HeapMapFig() {
  const W = 560;
  const cellW = 56;
  const rowX = (i: number) => W / 2 + (i - FIG_VALUES.length / 2) * (cellW + 8) + cellW / 2;
  const hi = (i: number) => i === 1 || i === 3 || i === 4; // 高亮 i=1 与它的孩子
  return (
    <div className="viz">
      <div className="viz-title">同一份数据的两种长相:树(逻辑)↔ 数组(物理)</div>
      <div className="viz-stage">
        <svg viewBox={`0 0 ${W} 342`} className="hp-svg" role="img" aria-label="堆的数组映射图">
          {/* 树 */}
          {FIG_VALUES.map((_, i) => {
            if (i === 0) return null;
            const p = (i - 1) >> 1;
            const a = treePos(p, W);
            const b = treePos(i, W);
            return <line key={i} className="hp-edge" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
          {FIG_VALUES.map((v, i) => {
            const pos = treePos(i, W);
            return (
              <g key={i} className={`hp-node${hi(i) ? " lit" : ""}`}>
                <circle cx={pos.x} cy={pos.y} r={17} />
                <text x={pos.x} y={pos.y}>
                  {v}
                </text>
                <text className="hp-tag" x={pos.x} y={pos.y + 32}>
                  [{i}]
                </text>
              </g>
            );
          })}
          {/* 投影虚线:节点 → 数组格 */}
          {FIG_VALUES.map((_, i) => {
            const pos = treePos(i, W);
            return (
              <line
                key={i}
                className={`hp-proj${hi(i) ? " lit" : ""}`}
                x1={pos.x}
                y1={pos.y + 22}
                x2={rowX(i)}
                y2={268}
              />
            );
          })}
          {/* 数组行 */}
          {FIG_VALUES.map((v, i) => (
            <g key={i} className={`hp-node${hi(i) ? " lit" : ""}`}>
              <rect x={rowX(i) - cellW / 2} y={270} width={cellW} height={40} rx={10} />
              <text x={rowX(i)} y={290}>
                {v}
              </text>
              <text className="hp-tag" x={rowX(i)} y={324}>
                [{i}]
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="viz-msg">
        看高亮的一家三口:节点 [1](值 20)的孩子在 2×1+1=<b>[3]</b> 和 2×1+2=
        <b>[4]</b>;反过来 [4] 的父节点在 (4−1)/2 = <b>[1]</b>(整除)。
        完全二叉树按层编号<b>没有一个空洞</b>,所以整棵树塞进数组毫无浪费 ——
        指针?不需要,<b>用算的</b>。
      </div>
    </div>
  );
}
