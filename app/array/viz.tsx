"use client";

// 第 1 章 · 数组的四个专属可视化:
//  - IndexLab:点任意单元格,看「地址 = 首地址 + i × 4」怎么一步算出。
//  - MatrixLab:点矩阵任意一格,看行优先压平后的一维下标。
//  - ShiftLab:亲手在任意位置插入/删除,数一数搬了几次。
//  - GrowLab:往动态数组里 push,亲眼看扩容与均摊 O(1)。
//
// 双语:所有标题、旁白、按钮、aria-label 都通过 <T> / useL() 切换。

import { useRef, useState } from "react";
import { useL, T } from "@/lib/i18n";

/* ---------------- IndexLab ---------------- */

const IDX_VALUES = [7, 2, 9, 4, 1, 8];
const BASE = 1000;
const SIZE = 4;

export function IndexLab() {
  const L = useL();
  const [sel, setSel] = useState<number | null>(2);

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Addressing lab — click any cell"
          zh="下标寻址实验室 —— 点任意一格"
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 4 }}>
        <div className="viz-scroll">
        <div style={{ display: "flex", gap: 4, paddingBottom: 30 }}>
          {IDX_VALUES.map((v, i) => (
            <button
              key={i}
              type="button"
              className={`cell${sel === i ? " lit" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => setSel(i)}
              aria-label={L({ en: `Index ${i}`, zh: `下标 ${i}` })}
            >
              {v}
              <span className="cell-idx">
                [{i}] · {BASE + i * SIZE}
              </span>
            </button>
          ))}
        </div>
        </div>
      </div>
      <div className="viz-msg">
        {sel === null ? (
          <T
            en="Click a cell to see how the CPU reaches it in one step."
            zh="点一个格子,看 CPU 怎么一步找到它。"
          />
        ) : (
          <T
            en={
              <>
                The address of <b>arr[{sel}]</b> = {BASE} (base address) +{" "}
                {sel} × {SIZE} (element size) = <b>{BASE + sel * SIZE}</b>. One
                multiply and one add, no searching. That is <b>O(1)</b>. With a
                hundred million elements the formula is still the same.
              </>
            }
            zh={
              <>
                <b>arr[{sel}]</b> 的地址 = {BASE}(首地址) + {sel} × {SIZE}
                (元素大小) = <b>{BASE + sel * SIZE}</b> —— 一次乘加,不用查找,
                这就是 <b>O(1)</b>。哪怕数组有一亿个元素,公式还是这一条。
              </>
            }
          />
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
  const L = useL();
  const [sel, setSel] = useState<[number, number] | null>([1, 2]);

  const flatIdx = sel ? sel[0] * COLS + sel[1] : -1;

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Row-major layout — click any cell in the matrix"
          zh="行优先铺平 —— 点矩阵里的任意一格"
        />
      </div>
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
                aria-label={L({
                  en: `Row ${i}, column ${j}`,
                  zh: `第 ${i} 行第 ${j} 列`,
                })}
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
          <T
            en={
              <>
                Flattened row by row, <b>matrix[{sel[0]}][{sel[1]}]</b> lands at
                index = row × number of columns + column = {sel[0]} × {COLS} +{" "}
                {sel[1]} = <b>{flatIdx}</b>. The same multiply-and-add formula,
                one dimension up.
              </>
            }
            zh={
              <>
                一行接一行压平后,<b>matrix[{sel[0]}][{sel[1]}]</b>{" "}
                落在下标 = 行号 × 列数 + 列号 = {sel[0]} × {COLS} + {sel[1]} ={" "}
                <b>{flatIdx}</b> —— 还是那条乘加公式,只是升了一个维度。
              </>
            }
          />
        ) : (
          <T
            en="Click any cell in the matrix above."
            zh="点上面矩阵里的任意一格。"
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- ShiftLab ---------------- */

const SHIFT_START = (
  <T
    en="Pick a position, then insert or delete, and count how many elements move."
    zh="选择一个位置,然后插入或删除 —— 数一数搬动了几个元素。"
  />
);

export function ShiftLab() {
  const L = useL();
  const [cells, setCells] = useState<number[]>([7, 2, 9, 4, 1]);
  const [idx, setIdx] = useState(1);
  const [moving, setMoving] = useState<number | null>(null);
  const [msg, setMsg] = useState<React.ReactNode>(SHIFT_START);
  const [busy, setBusy] = useState(false);
  const nextVal = useRef(3);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // 删除会让数组变短,idx 可能停留在越界位置 —— 统一用夹紧后的 pos
  const pos = Math.min(idx, cells.length - 1);

  const insert = async () => {
    if (busy || cells.length >= 9) return;
    setBusy(true);
    const v = nextVal.current;
    nextVal.current = ((nextVal.current + 3) % 9) + 1;
    let arr = [...cells];
    let moves = 0;
    // 从尾巴开始,把 idx 右侧的元素一个个往右搬
    arr = [...arr, arr[arr.length - 1]];
    for (let j = arr.length - 2; j > pos; j--) {
      setMoving(j);
      const from = j - 1;
      const val = arr[j - 1];
      setMsg(
        <T
          en={
            <>
              Moving: copy <b>arr[{from}]</b> ({val}) into <b>arr[{j}]</b>…
            </>
          }
          zh={
            <>
              搬动中:把 <b>arr[{from}]</b>({val})挪到 <b>arr[{j}]</b>…
            </>
          }
        />,
      );
      arr = [...arr];
      arr[j] = arr[j - 1];
      setCells(arr);
      moves++;
      await sleep(420);
    }
    setMoving(pos);
    arr = [...arr];
    arr[pos] = v;
    setCells(arr);
    const done = moves;
    setMsg(
      <T
        en={
          <>
            Inserted <b>{v}</b> at index {pos}. <b>{done}</b> elements had to
            move. The longer the array and the earlier the position, the more
            elements move, and that is <b>O(n)</b>.
          </>
        }
        zh={
          <>
            在下标 {pos} 插入 <b>{v}</b> 完成,一共搬动了 <b>{done}</b> 个元素。
            数组越长、位置越靠前,搬动的越多,这就是 <b>O(n)</b>。
          </>
        }
      />,
    );
    await sleep(500);
    setMoving(null);
    setBusy(false);
  };

  const remove = async () => {
    if (busy || cells.length <= 2) return;
    setBusy(true);
    let arr = [...cells];
    const victim = arr[pos];
    let moves = 0;
    for (let j = pos; j < arr.length - 1; j++) {
      setMoving(j);
      const from = j + 1;
      const val = arr[j + 1];
      setMsg(
        <T
          en={
            <>
              Closing the gap: copy <b>arr[{from}]</b> ({val}) into{" "}
              <b>arr[{j}]</b>…
            </>
          }
          zh={
            <>
              填补空位:把 <b>arr[{from}]</b>({val})挪到 <b>arr[{j}]</b>…
            </>
          }
        />,
      );
      arr = [...arr];
      arr[j] = arr[j + 1];
      setCells(arr);
      moves++;
      await sleep(420);
    }
    arr = arr.slice(0, -1);
    setCells(arr);
    const done = moves;
    setMsg(
      <T
        en={
          <>
            Deleted arr[{pos}] ({victim}). The <b>{done}</b> elements on its
            right all shifted one slot left. Deleting means filling in, not
            cutting out.
          </>
        }
        zh={
          <>
            删除 arr[{pos}]({victim})完成 —— 右侧 <b>{done}</b>{" "}
            个元素集体左移一格填补空位。删除不是「抠掉」,是「补位」。
          </>
        }
      />,
    );
    setMoving(null);
    setBusy(false);
  };

  return (
    <div className="viz">
      <div className="viz-title">
        <T en="Insert and delete lab" zh="插入 / 删除搬动实验室" />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 4, paddingBottom: 30, flexWrap: "wrap" }}>
          {cells.map((v, i) => (
            <div
              key={i}
              className={`cell${moving === i ? " lit" : ""}${i === pos && !busy ? " ok" : ""}`}
            >
              {v}
              <span className="cell-idx">{i}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="viz-msg">{msg}</div>
      <div className="viz-ctl">
        <label className="bigo-slider" style={{ minWidth: 200, maxWidth: 300 }}>
          <span className="mono" style={{ flex: "0 0 auto", whiteSpace: "nowrap" }}>
            <T en={<>Index {pos}</>} zh={<>位置 {pos}</>} />
          </span>
          <input
            type="range"
            min={0}
            max={cells.length - 1}
            value={pos}
            disabled={busy}
            onChange={(e) => setIdx(Number(e.target.value))}
            aria-label={L({ en: "Position to operate on", zh: "操作位置" })}
          />
        </label>
        <button type="button" className="btn btn-sm btn-primary" onClick={insert} disabled={busy || cells.length >= 9}>
          <T en="Insert here" zh="在这里插入" />
        </button>
        <button type="button" className="btn btn-sm" onClick={remove} disabled={busy || cells.length <= 2}>
          <T en="Delete this cell" zh="删除这一格" />
        </button>
      </div>
    </div>
  );
}

/* ---------------- GrowLab ---------------- */

const GROW_START = (
  <T
    en="A dynamic array with capacity 2. Keep pushing and watch when it moves to a bigger block."
    zh="容量为 2 的动态数组。一直 push,看它什么时候搬进更大的一块内存。"
  />
);

export function GrowLab() {
  const [cap, setCap] = useState(2);
  const [items, setItems] = useState<number[]>([]);
  const [copies, setCopies] = useState(0);
  const [pushes, setPushes] = useState(0);
  const [phase, setPhase] = useState<"idle" | "growing">("idle");
  const [copyIdx, setCopyIdx] = useState(-1);
  const [oldSnapshot, setOldSnapshot] = useState<number[]>([]);
  const [msg, setMsg] = useState<React.ReactNode>(GROW_START);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const push = async () => {
    if (phase !== "idle") return;
    const v = ((items.length * 7) % 9) + 1;

    if (items.length < cap) {
      const at = items.length;
      setItems((arr) => [...arr, v]);
      setPushes((p) => p + 1);
      setMsg(
        <T
          en={
            <>
              push({v}): there is a free slot, so the value goes straight into
              arr[{at}]. That is <b>O(1)</b>.
            </>
          }
          zh={
            <>
              push({v}):还有空位,直接写进 arr[{at}] —— <b>O(1)</b>。
            </>
          }
        />,
      );
      return;
    }

    // 扩容:申请 2 倍新数组,逐个搬运
    setPhase("growing");
    setOldSnapshot(items);
    const newCap = cap * 2;
    const oldLen = items.length;
    setMsg(
      <T
        en={
          <>
            Full. Allocate a new array with capacity <b>{newCap}</b> and copy
            the {oldLen} existing elements one by one…
          </>
        }
        zh={
          <>
            满了。申请一个容量为 <b>{newCap}</b> 的新数组,把 {oldLen}{" "}
            个旧元素逐个拷贝过去…
          </>
        }
      />,
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
      <T
        en={
          <>
            The move is done and {v} is stored. This push cost{" "}
            <b>{oldLen} copies plus 1 write</b>, but the next resize is{" "}
            {newCap - oldLen - 1} pushes away. Spread that cost over all the
            pushes and the average stays <b>O(1) amortized</b>.
          </>
        }
        zh={
          <>
            搬家完成,再写入 {v}。这次 push 花了{" "}
            <b>{oldLen} 次拷贝 + 1 次写入</b>,但要再过 {newCap - oldLen - 1}{" "}
            次 push 才会再次扩容。把成本摊到每次 push 上,平均仍是{" "}
            <b>均摊 O(1)</b>。
          </>
        }
      />,
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
    setMsg(GROW_START);
  };

  return (
    <div className="viz">
      <div className="viz-title">
        <T en="Dynamic array resize lab" zh="动态数组扩容实验室" />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 26 }}>
        <div className="viz-scroll" style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {phase === "growing" && (
          <div style={{ display: "flex", gap: 4, opacity: 0.65 }}>
            {oldSnapshot.map((v, i) => (
              <div key={i} className={`cell${copyIdx === i ? " bad" : " ghost"}`}>
                {v}
                <span className="cell-idx">
                  <T en="old" zh="旧" />
                </span>
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
      </div>
      <div className="viz-msg">{msg}</div>
      <div className="viz-ctl">
        <button type="button" className="btn btn-sm btn-primary" onClick={push} disabled={phase !== "idle" || cap >= 16}>
          push
        </button>
        <button type="button" className="btn btn-sm" onClick={reset} disabled={phase !== "idle"}>
          <T en="Reset" zh="重置" />
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          <T
            en={
              <>
                capacity {cap} · stored {items.length} · pushes {pushes} ·
                copies {copies}
                {pushes > 0 && (
                  <> · {(copies / pushes + 1).toFixed(2)} operations per push</>
                )}
              </>
            }
            zh={
              <>
                容量 {cap} · 已存 {items.length} · 累计 push {pushes} · 累计拷贝{" "}
                {copies}
                {pushes > 0 && (
                  <> · 均摊 {(copies / pushes + 1).toFixed(2)} 次操作/push</>
                )}
              </>
            }
          />
        </span>
      </div>
    </div>
  );
}
