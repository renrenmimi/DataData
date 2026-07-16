"use client";

// 第 1 章 · 数组的三个专属可视化:
//  - IndexLab:点任意单元格,看「地址 = 首地址 + i × 4」怎么一步算出。
//  - ShiftLab:亲手在任意位置插入/删除,数一数搬了几次家。
//  - GrowLab:往动态数组里 push,亲眼看扩容 ×2 与均摊 O(1)。

import { useRef, useState } from "react";

/* ---------------- IndexLab ---------------- */

const IDX_VALUES = [7, 2, 9, 4, 1, 8];
const BASE = 1000;
const SIZE = 4;

export function IndexLab() {
  const [sel, setSel] = useState<number | null>(2);

  return (
    <div className="viz">
      <div className="viz-title">下标寻址实验室 —— 点任意一格</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", gap: 4, paddingBottom: 30 }}>
          {IDX_VALUES.map((v, i) => (
            <button
              key={i}
              type="button"
              className={`cell${sel === i ? " lit" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => setSel(i)}
              aria-label={`下标 ${i}`}
            >
              {v}
              <span className="cell-idx">
                [{i}] · {BASE + i * SIZE}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="viz-msg">
        {sel === null ? (
          "点一个格子,看 CPU 怎么一步找到它。"
        ) : (
          <>
            <b>arr[{sel}]</b> 的地址 = {BASE}(首地址) + {sel} × {SIZE}
            (元素大小) = <b>{BASE + sel * SIZE}</b> —— 一次乘加,直达房间,
            这就是 <b>O(1)</b>。哪怕数组有一亿个元素,公式还是这一条。
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- MatrixLab ---------------- */

const MAT = [
  [3, 1, 4, 1],
  [5, 9, 2, 6],
  [8, 7, 5, 3],
];
const COLS = 4;

export function MatrixLab() {
  const [sel, setSel] = useState<[number, number] | null>([1, 2]);

  const flatIdx = sel ? sel[0] * COLS + sel[1] : -1;

  return (
    <div className="viz">
      <div className="viz-title">二维其实是一维 —— 点矩阵里的任意一格</div>
      <div
        className="viz-stage"
        style={{ flexDirection: "column", gap: 30, alignItems: "center" }}
      >
        {/* 二维视图 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 46px)`,
            columnGap: 4,
            rowGap: 30,
            paddingBottom: 22,
          }}
        >
          {MAT.map((row, i) =>
            row.map((v, j) => (
              <button
                key={`${i}-${j}`}
                type="button"
                className={`cell${sel && sel[0] === i && sel[1] === j ? " lit" : ""}`}
                style={{ width: 42, height: 42, fontSize: 13, cursor: "pointer" }}
                onClick={() => setSel([i, j])}
                aria-label={`第 ${i} 行第 ${j} 列`}
              >
                {v}
                <span className="cell-idx">
                  [{i}][{j}]
                </span>
              </button>
            )),
          )}
        </div>
        {/* 一维真身 */}
        <div style={{ display: "flex", columnGap: 3, rowGap: 30, flexWrap: "wrap", justifyContent: "center", paddingBottom: 22 }}>
          {MAT.flat().map((v, k) => (
            <div
              key={k}
              className={`cell${k === flatIdx ? " ok" : ""}`}
              style={{ width: 38, height: 38, fontSize: 12 }}
            >
              {v}
              <span className="cell-idx">{k}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="viz-msg">
        {sel ? (
          <>
            <b>
              matrix[{sel[0]}][{sel[1]}]
            </b>{" "}
            在内存一维真身里的下标 = 行号 × 每行列数 + 列号 = {sel[0]} × {COLS} +{" "}
            {sel[1]} = <b>{flatIdx}</b> —— 还是那条“乘加公式”,只是升了个维度。
          </>
        ) : (
          "点上面矩阵里的任意一格。"
        )}
      </div>
    </div>
  );
}

/* ---------------- ShiftLab ---------------- */

export function ShiftLab() {
  const [cells, setCells] = useState<number[]>([7, 2, 9, 4, 1]);
  const [idx, setIdx] = useState(1);
  const [moving, setMoving] = useState<number | null>(null);
  const [msg, setMsg] = useState<React.ReactNode>(
    "选择一个位置,然后插入或删除 —— 数一数搬了几次家。",
  );
  const [busy, setBusy] = useState(false);
  const nextVal = useRef(3);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const insert = async () => {
    if (busy || cells.length >= 9) return;
    setBusy(true);
    const v = nextVal.current;
    nextVal.current = ((nextVal.current + 3) % 9) + 1;
    let arr = [...cells];
    let moves = 0;
    // 从尾巴开始,把 idx 右侧的元素一个个往右搬
    arr = [...arr, arr[arr.length - 1]];
    for (let j = arr.length - 2; j > idx; j--) {
      setMoving(j);
      setMsg(
        <>
          搬家中:把 <b>arr[{j - 1}]</b>({arr[j - 1]})挪到 <b>arr[{j}]</b>…
        </>,
      );
      arr = [...arr];
      arr[j] = arr[j - 1];
      setCells(arr);
      moves++;
      await sleep(420);
    }
    setMoving(idx);
    arr = [...arr];
    arr[idx] = v;
    setCells(arr);
    setMsg(
      <>
        在下标 {idx} 插入 <b>{v}</b> 完成 —— 一共搬了 <b>{moves}</b> 次家
        (数组越长、位置越靠前,搬得越多,这就是 <b>O(n)</b>)。
      </>,
    );
    await sleep(500);
    setMoving(null);
    setBusy(false);
  };

  const remove = async () => {
    if (busy || cells.length <= 2) return;
    setBusy(true);
    let arr = [...cells];
    const victim = arr[idx];
    let moves = 0;
    for (let j = idx; j < arr.length - 1; j++) {
      setMoving(j);
      setMsg(
        <>
          填坑中:把 <b>arr[{j + 1}]</b>({arr[j + 1]})挪到 <b>arr[{j}]</b>…
        </>,
      );
      arr = [...arr];
      arr[j] = arr[j + 1];
      setCells(arr);
      moves++;
      await sleep(420);
    }
    arr = arr.slice(0, -1);
    setCells(arr);
    setMsg(
      <>
        删除 arr[{idx}]({victim})完成 —— 右侧 <b>{moves}</b>{" "}
        个元素集体左移填坑。删除不是“抠掉”,是“补位”。
      </>,
    );
    setMoving(null);
    setBusy(false);
  };

  return (
    <div className="viz">
      <div className="viz-title">插入 / 删除搬家实验室</div>
      <div className="viz-stage" style={{ flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 4, paddingBottom: 30, flexWrap: "wrap" }}>
          {cells.map((v, i) => (
            <div
              key={i}
              className={`cell${moving === i ? " lit" : ""}${i === idx && !busy ? " ok" : ""}`}
            >
              {v}
              <span className="cell-idx">{i}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="viz-msg">{msg}</div>
      <div className="viz-ctl">
        <label className="bigo-slider" style={{ minWidth: 200, maxWidth: 280 }}>
          <span className="mono">位置 {idx}</span>
          <input
            type="range"
            min={0}
            max={cells.length - 1}
            value={Math.min(idx, cells.length - 1)}
            disabled={busy}
            onChange={(e) => setIdx(Number(e.target.value))}
            aria-label="操作位置"
          />
        </label>
        <button type="button" className="btn btn-sm btn-primary" onClick={insert} disabled={busy || cells.length >= 9}>
          在这里插入
        </button>
        <button type="button" className="btn btn-sm" onClick={remove} disabled={busy || cells.length <= 2}>
          删除这一格
        </button>
      </div>
    </div>
  );
}

/* ---------------- GrowLab ---------------- */

export function GrowLab() {
  const [cap, setCap] = useState(2);
  const [items, setItems] = useState<number[]>([]);
  const [copies, setCopies] = useState(0);
  const [pushes, setPushes] = useState(0);
  const [phase, setPhase] = useState<"idle" | "growing">("idle");
  const [copyIdx, setCopyIdx] = useState(-1);
  const [oldSnapshot, setOldSnapshot] = useState<number[]>([]);
  const [msg, setMsg] = useState<React.ReactNode>(
    "容量 2 的动态数组。一直 push,看它什么时候“搬新家”。",
  );

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const push = async () => {
    if (phase !== "idle") return;
    const v = ((items.length * 7) % 9) + 1;

    if (items.length < cap) {
      setItems((arr) => [...arr, v]);
      setPushes((p) => p + 1);
      setMsg(
        <>
          push({v}):还有空位,直接放进 arr[{items.length}] —— <b>O(1)</b>。
        </>,
      );
      return;
    }

    // 扩容:申请 2 倍新家,逐个搬运
    setPhase("growing");
    setOldSnapshot(items);
    const newCap = cap * 2;
    setMsg(
      <>
        满了!申请容量 <b>{newCap}</b> 的新数组,把 {items.length}{" "}
        个旧元素逐个拷贝过去…
      </>,
    );
    await sleep(600);
    for (let i = 0; i < items.length; i++) {
      setCopyIdx(i);
      setCopies((c) => c + 1);
      await sleep(380);
    }
    setCopyIdx(-1);
    setCap(newCap);
    setItems([...items, v]);
    setPushes((p) => p + 1);
    setOldSnapshot([]);
    setPhase("idle");
    setMsg(
      <>
        搬家完成,再放入 {v}。这次 push 花了 <b>{items.length} 次拷贝 + 1 次写入</b>
        ,但要再过 {newCap - items.length - 1} 次 push 才会再搬家 ——
        把成本摊开,平均每次仍是 <b>O(1)(均摊)</b>。
      </>,
    );
  };

  const reset = () => {
    setCap(2);
    setItems([]);
    setCopies(0);
    setPushes(0);
    setPhase("idle");
    setCopyIdx(-1);
    setOldSnapshot([]);
    setMsg("容量 2 的动态数组。一直 push,看它什么时候“搬新家”。");
  };

  return (
    <div className="viz">
      <div className="viz-title">动态数组扩容实验室</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 26 }}>
        {phase === "growing" && (
          <div style={{ display: "flex", gap: 4, opacity: 0.65 }}>
            {oldSnapshot.map((v, i) => (
              <div key={i} className={`cell${copyIdx === i ? " bad" : " ghost"}`}>
                {v}
                <span className="cell-idx">旧</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 4, paddingBottom: 24 }}>
          {Array.from({ length: phase === "growing" ? cap * 2 : cap }).map((_, i) => {
            const v = phase === "growing" ? (copyIdx >= i ? oldSnapshot[i] : undefined) : items[i];
            const filled = v !== undefined;
            return (
              <div
                key={i}
                className={`cell${filled ? (phase === "growing" && copyIdx === i ? " lit" : "") : " ghost"}`}
              >
                {filled ? v : "·"}
                <span className="cell-idx">{i}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="viz-msg">{msg}</div>
      <div className="viz-ctl">
        <button type="button" className="btn btn-sm btn-primary" onClick={push} disabled={phase !== "idle" || cap >= 16}>
          push
        </button>
        <button type="button" className="btn btn-sm" onClick={reset}>
          重置
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          容量 {cap} · 已存 {items.length} · 累计 push {pushes} · 累计拷贝 {copies}
          {pushes > 0 && <> · 均摊 {(copies / pushes + 1).toFixed(2)} 次操作/push</>}
        </span>
      </div>
    </div>
  );
}
