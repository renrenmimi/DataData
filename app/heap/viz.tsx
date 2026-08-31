"use client";

// Chapter 9 · Dedicated visualizations for the heap and priority queue:
//  - HeapLab (the centerpiece): a min-heap with a linked "tree view + array view",
//    step-by-step animation of push (sift up) / pop (sift down) that highlights every
//    comparison and swap; the "heapify a random array" button demonstrates Floyd's
//    O(n) heapify.
//  - HeapMapFig: static diagram — the index mapping between a complete binary tree and
//    an array (the parent/child formulas).
//
// Bilingual: titles, narration, buttons, and in-figure text all switch through <T> / useL().
// Terminology: height (of the tree) is counted in edges, so a complete binary tree with
// n nodes has height ⌊log₂n⌋ and one sift up / sift down performs at most that many
// swaps — §03 of the page uses the same definition.

import { useState, type ReactNode } from "react";
import { useL, T } from "@/lib/i18n";

/* ================= Helpers ================= */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Coordinates of index i in the tree view: depth = ⌊log₂(i+1)⌋, rank within the level sets x */
function treePos(i: number, w: number) {
  const d = Math.floor(Math.log2(i + 1));
  const k = i - (2 ** d - 1);
  return { x: ((k + 0.5) / 2 ** d) * w, y: 36 + d * 62, d };
}

/** Height of a complete binary tree with n nodes, counted in edges: a single node is 0,
 *  an empty heap is −1 by convention */
const heightOf = (n: number) =>
  n <= 0 ? -1 : n === 1 ? 0 : Math.floor(Math.log2(n));

/* ================= HeapLab ================= */

const CAP = 15;
const TW = 600;

export function HeapLab() {
  const L = useL();
  const [arr, setArr] = useState<number[]>([10, 20, 15, 30, 40]);
  const [hot, setHot] = useState<[number, number] | null>(null); // the pair of indices currently being compared or swapped
  const [okIdx, setOkIdx] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [lastSwaps, setLastSwaps] = useState<number | null>(null);
  const [msg, setMsg] = useState<ReactNode>(
    <T
      en="This is a min-heap. Push a value and watch it sift up. Pop and watch the last element take the root and sift down."
      zh="这是一个小根堆。push 一个数,看它「上浮」;pop 一次,看尾部元素补到堆顶再「下沉」。"
    />,
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
      setMsg(
        <T
          en="Type a whole number between 0 and 99 first."
          zh="请先输入一个 0–99 的整数。"
        />,
      );
      return null;
    }
    return v;
  };

  const doPush = async () => {
    if (busy) return;
    const v = readInput();
    if (v === null) return;
    if (n >= CAP) {
      setMsg(
        <T
          en={<>This lab holds at most {CAP} elements. Pop a few or reset.</>}
          zh={<>实验室最多放 {CAP} 个元素 —— 先 pop 几个或者重置。</>}
        />,
      );
      return;
    }
    setBusy(true);
    clearMarks();
    let a = [...arr, v];
    let i = a.length - 1;
    setArr(a);
    setOkIdx(i);
    setMsg(
      <T
        en={
          <>
            push({v}), step 1: write it at the <b>end of the array</b>, which is
            the next free slot of the tree. The shape stays a complete binary
            tree.
          </>
        }
        zh={
          <>
            push({v}) 第一步:写到<b>数组尾部</b>,也就是树的下一个空位 ——
            完全二叉树的形状不会被破坏。
          </>
        }
      />,
    );
    await sleep(850);
    let swaps = 0;
    while (i > 0) {
      const p = (i - 1) >> 1;
      const cur = a[i];
      const par = a[p];
      const ci = i;
      const smaller = cur < par;
      setOkIdx(null);
      setHot([i, p]);
      setMsg(
        <T
          en={
            <>
              Step 2, sift up: compare a[{ci}]={cur} with its parent a[{p}]={par}.{" "}
              {smaller ? (
                <b>Smaller than the parent, so swap.</b>
              ) : (
                <b>Not smaller than the parent, so it is already in place.</b>
              )}
            </>
          }
          zh={
            <>
              第二步 上浮:a[{ci}]={cur} 和父结点 a[{p}]={par} 比较 ——{" "}
              {smaller ? (
                <b>比父结点小,交换。</b>
              ) : (
                <b>不比父结点小,已经到位,停。</b>
              )}
            </>
          }
        />,
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
    const h = heightOf(a.length);
    setHot(null);
    setOkIdx(i);
    setLastSwaps(swaps);
    setMsg(
      <T
        en={
          <>
            Done. {v} moved up <b>{swaps}</b> time{swaps === 1 ? "" : "s"}, which
            is at most the height of the tree ({h}). push is{" "}
            <b>O(log n)</b>, because the longest path it can take is one leaf-to-root
            path.
          </>
        }
        zh={
          <>
            落位。{v} 上浮了 <b>{swaps}</b> 次,不超过树高({h})。
            push 是 <b>O(log n)</b> —— 它最长只走一条「叶到根」的路。
          </>
        }
      />,
    );
    setBusy(false);
  };

  const doPop = async () => {
    if (busy) return;
    if (n === 0) {
      setMsg(
        <T
          en="The heap is empty. Push a few values first."
          zh="堆是空的 —— 先 push 几个数。"
        />,
      );
      return;
    }
    setBusy(true);
    clearMarks();
    const top = arr[0];
    setOkIdx(0);
    setMsg(
      <T
        en={
          <>
            pop(): the root <b>{top}</b> is the smallest value in the heap, which
            is the only thing a min-heap promises. It is the value that leaves.
          </>
        }
        zh={
          <>
            pop():堆顶 <b>{top}</b> 是堆里最小的值(小根堆唯一的承诺),
            要出队的就是它。
          </>
        }
      />,
    );
    await sleep(900);
    if (n === 1) {
      setArr([]);
      clearMarks();
      setLastSwaps(0);
      setMsg(
        <T
          en={<>{top} was removed. The heap is now empty.</>}
          zh={<>弹出 {top},堆空了。</>}
        />,
      );
      setBusy(false);
      return;
    }
    let a = [arr[n - 1], ...arr.slice(1, n - 1)];
    const moved = a[0];
    setArr(a);
    setOkIdx(null);
    setHot([0, 0]);
    setMsg(
      <T
        en={
          <>
            Step 1: the last element <b>{moved}</b> moves to the root. Removing
            the last slot keeps the tree complete, but the heap order at the top
            is probably broken now, so this value has to sift down.
          </>
        }
        zh={
          <>
            第一步:把最后一个元素 <b>{moved}</b> 搬到堆顶。
            删掉末尾不会破坏完全二叉树的形状,但顶部的堆序多半坏了,
            所以这个值要「下沉」回它该待的位置。
          </>
        }
      />,
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
            <T
              en="It is smaller than both of its children, so it is in place."
              zh="它比两个孩子都小,到位了。"
            />
          ) : (
            <T
              en="It has no children left, so it has reached the bottom."
              zh="它已经没有孩子了,到底了。"
            />
          ),
        );
        await sleep(500);
        break;
      }
      const ci = i;
      const cur = a[i];
      const child = a[m];
      const cm = m;
      setHot([i, m]);
      setMsg(
        <T
          en={
            <>
              Step 2, sift down: swap a[{ci}]={cur} with the <b>smaller</b> child
              a[{cm}]={child}. Choosing the larger child would immediately break
              parent ≤ child on the other side.
            </>
          }
          zh={
            <>
              第二步 下沉:a[{ci}]={cur} 和<b>较小的</b>孩子 a[{cm}]={child} 交换。
              换较大的那个,另一边马上会违反「父 ≤ 子」。
            </>
          }
        />,
      );
      await sleep(900);
      a = [...a];
      [a[i], a[m]] = [a[m], a[i]];
      setArr(a);
      swaps++;
      i = m;
      await sleep(500);
    }
    const newTop = a[0];
    setLastSwaps(swaps);
    setMsg(
      <T
        en={
          <>
            pop() finished: <b>{top}</b> was removed, the replacement sifted down{" "}
            <b>{swaps}</b> time{swaps === 1 ? "" : "s"}, and the new root is{" "}
            {newTop}. pop is also <b>O(log n)</b>, one root-to-leaf path.
          </>
        }
        zh={
          <>
            pop() 完成:弹出 <b>{top}</b>,补位元素下沉 <b>{swaps}</b> 次,
            新堆顶是 {newTop}。pop 同样是 <b>O(log n)</b> —— 一条「根到叶」的路。
          </>
        }
      />,
    );
    setBusy(false);
  };

  const doHeapify = async () => {
    if (busy) return;
    setBusy(true);
    clearMarks();
    setInput("");
    let a = Array.from({ length: 7 }, () => 1 + Math.floor(Math.random() * 99));
    const start = (a.length >> 1) - 1;
    setArr(a);
    setMsg(
      <T
        en={
          <>
            An array in random order. Floyd&apos;s method builds the heap{" "}
            <b>from the last internal node (index {start}) backwards to index 0</b>
            , sifting each one down. The leaves, which are the second half of the
            array, need no work at all.
          </>
        }
        zh={
          <>
            一个乱序数组。Floyd 建堆的做法是
            <b>从最后一个父结点(下标 {start})倒着走到下标 0</b>,逐个下沉 ——
            叶子(数组的后一半)根本不用处理。
          </>
        }
      />,
    );
    await sleep(1400);
    let swaps = 0;
    for (let s = start; s >= 0; s--) {
      let i = s;
      const val = a[s];
      setHot([i, i]);
      setMsg(
        <T
          en={
            <>
              Index {s} (value {val}): sift it down inside its own subtree until
              it is in place.
            </>
          }
          zh={
            <>
              处理下标 {s}(值 {val}):让它在自己的子树里下沉到位。
            </>
          }
        />,
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
      <T
        en={
          <>
            The heap is built. 7 elements took only <b>{swaps}</b> swap
            {swaps === 1 ? "" : "s"}. About half the nodes are leaves and move 0
            levels, about a quarter move at most 1 level, about an eighth at most
            2, and so on. The nodes that could move far are the rare ones, so the
            total stays below n and building the heap is <b>O(n)</b>, cheaper
            than pushing the elements one by one at O(n log n).
          </>
        }
        zh={
          <>
            建堆完成。7 个元素只交换了 <b>{swaps}</b> 次。
            大约一半的结点是叶子,移动 0 层;约 1/4 最多移 1 层;约 1/8 最多移 2 层……
            能沉得深的结点恰恰最稀少,所以总步数不超过 n,建堆是 <b>O(n)</b>,
            比逐个 push 的 O(n log n) 便宜。
          </>
        }
      />,
    );
    setBusy(false);
  };

  const doReset = () => {
    if (busy) return;
    clearMarks();
    setInput("");
    setLastSwaps(null);
    setArr([10, 20, 15, 30, 40]);
    setMsg(
      <T
        en="Back to the example min-heap. Notice that siblings are in no particular order: the heap does not constrain them."
        zh="回到示例小根堆。注意兄弟之间没有固定顺序 —— 堆并不约束它们。"
      />,
    );
  };

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Heap lab: the tree view and the array view are the same data in two shapes"
          zh="堆实验室:树视图与数组视图 —— 同一份数据的两种长相"
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 10 }}>
        {/* Tree view */}
        <svg
          viewBox={`0 0 ${TW} ${svgH}`}
          className="hp-svg"
          role="img"
          aria-label={L({ en: "Tree view of the heap", zh: "堆的树视图" })}
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
              {L({ en: "(empty heap)", zh: "(空堆)" })}
            </text>
          )}
        </svg>
        {/* Array view */}
        <div
          className="hp-array"
          aria-label={L({ en: "Array view of the heap", zh: "堆的数组视图" })}
        >
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
          aria-label={L({
            en: "Value to push, 0 to 99",
            zh: "要 push 的数字,0–99",
          })}
        />
        <button type="button" className="btn btn-sm btn-primary" onClick={doPush} disabled={busy}>
          <T en="push (sift up)" zh="push(上浮)" />
        </button>
        <button type="button" className="btn btn-sm" onClick={doPop} disabled={busy}>
          <T en="pop (sift down)" zh="pop(下沉)" />
        </button>
        <button type="button" className="btn btn-sm" onClick={doHeapify} disabled={busy}>
          <T en="Build from random array, O(n)" zh="随机数组建堆 O(n)" />
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={doReset} disabled={busy}>
          <T en="Reset" zh="重置" />
        </button>
        <span className="mono dim hp-stat">
          <T en="elements" zh="元素" /> {n} · <T en="height" zh="树高" />{" "}
          {heightOf(n)}
          {lastSwaps !== null && (
            <>
              {" · "}
              <T en="swaps last time" zh="上次操作交换" /> {lastSwaps}
            </>
          )}
        </span>
      </div>
    </div>
  );
}

/* ================= HeapMapFig: array ↔ tree mapping ================= */

const FIG_VALUES = [10, 20, 15, 30, 40, 60];

export function HeapMapFig() {
  const L = useL();
  const W = 560;
  const cellW = 56;
  const rowX = (i: number) => W / 2 + (i - FIG_VALUES.length / 2) * (cellW + 8) + cellW / 2;
  const hi = (i: number) => i === 1 || i === 3 || i === 4; // highlight i=1 and its children
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="One set of values, two shapes: the tree is the logical view, the array is the physical one"
          zh="同一份数据的两种长相:树是逻辑视图,数组是物理存储"
        />
      </div>
      <div className="viz-stage">
        <svg
          viewBox={`0 0 ${W} 342`}
          className="hp-svg"
          role="img"
          aria-label={L({
            en: "How heap positions map onto array indices",
            zh: "堆的位置如何映射到数组下标",
          })}
        >
          {/* Tree */}
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
          {/* Dashed projection: node → array cell */}
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
          {/* Array row */}
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
        <T
          en={
            <>
              Look at the highlighted family. Node [1] holds 20, and its children
              are at 2 × 1 + 1 = <b>[3]</b> and 2 × 1 + 2 = <b>[4]</b>. Going the
              other way, the parent of [4] is at (4 − 1) / 2 = <b>[1]</b> with
              integer division. Numbering a complete binary tree level by level
              leaves <b>no gap</b>, so the whole tree fits into an array with no
              wasted slot, and no parent or child pointer is stored: every link
              is <b>computed from the index</b>.
            </>
          }
          zh={
            <>
              看高亮的这一家三口:结点 [1] 的值是 20,它的孩子在 2 × 1 + 1 ={" "}
              <b>[3]</b> 和 2 × 1 + 2 = <b>[4]</b>;反过来,[4] 的父结点在
              (4 − 1) / 2 = <b>[1]</b>(整数除法)。
              完全二叉树按层编号<b>没有一个空洞</b>,所以整棵树塞进数组不浪费任何位置,
              而且不需要存父指针或孩子指针 —— 每一条连线都是<b>用下标算出来的</b>。
            </>
          }
        />
      </div>
    </div>
  );
}
