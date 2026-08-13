"use client";

// 第 5 章 · 队列的专属可视化:
//  - QueueMemFig:§02 静态图解 —— 数组队列的三条路:搬移 / 不搬移(空间浪费) / 取模绕圈。
//  - RingLab:环形 SVG 循环队列(8 格),front/rear 指针动画,
//    可切换「留一格空 / 计数器」两种满-空判定方案。
//  - TwoStackPour:LC 232 双栈模拟队列的逐帧「倒水」动画。

import { useRef, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ---------------- QueueMemFig ---------------- */

function FigRow({
  title,
  cost,
  ptrs,
  cells,
  note,
}: {
  title: string;
  cost: ReactNode;
  ptrs: (string | null)[];
  cells: { v: ReactNode; state?: "lit" | "ok" | "bad" | "ghost" }[];
  note: ReactNode;
}) {
  return (
    <div className="qu-memrow">
      <div className="qu-memrow-label">
        <b>{title}</b>
        <span>{cost}</span>
      </div>
      <div className="qu-figwrap">
        <div className="qu-figptrs">
          {ptrs.map((p, i) => (
            <span key={i}>{p && <span className="ptr">{p}</span>}</span>
          ))}
        </div>
        <div className="qu-figcells">
          {cells.map((c, i) => (
            <div key={i} className={`cell${c.state ? ` ${c.state}` : ""}`}>
              {c.v}
              <span className="cell-idx">{i}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="qu-memnote">{note}</div>
    </div>
  );
}

export function QueueMemFig() {
  return (
    <div className="viz">
      <div className="viz-title">
        同一个场景:队列 [2, 7, 9] 出队了 2,然后想入队 12 —— 三条路
      </div>
      <FigRow
        title="方案一 · 搬家"
        cost="出队 O(n)"
        ptrs={[null, null, null, null]}
        cells={[
          { v: 7, state: "lit" },
          { v: 9, state: "lit" },
          { v: 12 },
          { v: "·", state: "ghost" },
        ]}
        note={
          <>
            队头 2 走后,右边所有元素<b>集体左移一格</b>填坑(就是数组章的头删)。
            正确,但每次出队 O(n) —— 队伍越长越痛。
          </>
        }
      />
      <FigRow
        title="方案二 · 不搬移"
        cost="出队 O(1),费空间"
        ptrs={[null, "front", null, "rear→"]}
        cells={[
          { v: "✕", state: "ghost" },
          { v: 7, state: "lit" },
          { v: 9, state: "lit" },
          { v: 12 },
        ]}
        note={
          <>
            不搬家,只把 front 指针右移。出队变 O(1)!但 slot[0] <b>永远报废</b>
            :一个只进不出跑一整天的服务,数组会无限变长 —— 明明同时只有 3
            个元素。
          </>
        }
      />
      <FigRow
        title="方案三 · 绕圈"
        cost="出队 O(1),零浪费"
        ptrs={["rear", null, "front", null]}
        cells={[
          { v: 12, state: "ok" },
          { v: "·", state: "ghost" },
          { v: 7, state: "lit" },
          { v: 9, state: "lit" },
        ]}
        note={
          <>
            下一个元素本该写进 slot[4] —— 不存在。<b>取模:4 % 4 = 0</b>
            ,绕回开头,复用 front 走后腾出的格子。直线折成圆环,
            搬家和浪费两个坑同时消失 —— 这就是<b>循环队列</b>。
          </>
        }
      />
    </div>
  );
}

/* ---------------- RingLab ---------------- */

const CAP = 8;
const CX = 170;
const CY = 150;
const R = 100;

function polar(idx: number, radius: number): { x: number; y: number } {
  const a = (idx / CAP) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + radius * Math.cos(a), y: CY + radius * Math.sin(a) };
}

export function RingLab() {
  const [slots, setSlots] = useState<(number | null)[]>(Array(CAP).fill(null));
  const [front, setFront] = useState(0);
  const [rear, setRear] = useState(0);
  const [size, setSize] = useState(0);
  const [scheme, setScheme] = useState<"spare" | "count">("spare");
  const seq = useRef(1);
  const [msg, setMsg] = useState<ReactNode>(
    <>
      8 格环形数组。<b>front</b>(绿)= 队头,下一个出队的位置;<b>rear</b>
      (黄)= 队尾,下一个写入的位置。现在 front == rear —— 这就是「空」。
    </>,
  );

  const isEmpty = scheme === "spare" ? front === rear : size === 0;
  const isFull =
    scheme === "spare" ? (rear + 1) % CAP === front : size === CAP;

  const enqueue = () => {
    if (isFull) {
      setMsg(
        scheme === "spare" ? (
          <>
            满了!rear 的下一格就是 front —— 再写入,「满」和「空」就都变成
            front == rear,分不清了。所以<b>牺牲这一格</b>(虚线格),7/8
            就宣布满。想装满 8 格?切到方案 B。
          </>
        ) : (
          <>
            满了!计数器 size == 8,拒绝入队。方案 B 用一个额外变量换来了
            全部 8 格的使用权 —— 两种方案都对,是一笔空间 vs 代码的小交易。
          </>
        ),
      );
      return;
    }
    const v = seq.current++;
    setSlots((s) => {
      const next = [...s];
      next[rear] = v;
      return next;
    });
    const nr = (rear + 1) % CAP;
    setRear(nr);
    setSize((n) => n + 1);
    setMsg(
      <>
        入队 {v}:写进 slot[{rear}],然后 rear = ({rear} + 1) % {CAP} ={" "}
        <b>{nr}</b>
        {rear === CAP - 1 && nr === 0 ? <> —— 取模生效,绕回了 0!</> : "。"}{" "}
        没有任何元素搬家。
      </>,
    );
  };

  const dequeue = () => {
    if (isEmpty) {
      setMsg(
        <>
          空队列出队!{scheme === "spare" ? "front == rear 就是「空」的判据" : "size == 0,没东西可出"}
          —— 和空栈 pop 一样,动手前先判空。
        </>,
      );
      return;
    }
    const v = slots[front];
    setSlots((s) => {
      const next = [...s];
      next[front] = null;
      return next;
    });
    const nf = (front + 1) % CAP;
    setFront(nf);
    setSize((n) => n - 1);
    setMsg(
      <>
        出队 {v}:只把 front = ({front} + 1) % {CAP} = <b>{nf}</b>,slot[
        {front}] 自动「复活」,等 rear 绕回来复用 ——{" "}
        <b>全程零搬家,这就是循环队列的意义</b>。
      </>,
    );
  };

  const reset = () => {
    setSlots(Array(CAP).fill(null));
    setFront(0);
    setRear(0);
    setSize(0);
    seq.current = 1;
    setMsg(<>已清空:front = rear = 0,size = 0。</>);
  };

  const switchScheme = (target: "spare" | "count") => {
    if (target === scheme) return;
    if (target === "spare" && size === CAP) {
      setMsg(
        <>
          切不过去!方案 A 最多装 {CAP - 1} 个,现在已经有 {CAP} 个 ——
          先出队一个。这个尴尬瞬间正好说明:两种方案的「满」定义真的不一样。
        </>,
      );
      return;
    }
    setScheme(target);
    setMsg(
      target === "spare" ? (
        <>
          方案 A · 留一格空:空 = (front == rear);满 = ((rear+1) % {CAP} ==
          front)。不需要额外变量,代价是牺牲一格,容量 {CAP - 1}。
        </>
      ) : (
        <>
          方案 B · 计数器:空 = (size == 0);满 = (size == {CAP})。8
          格全能用,代价是每次进出都要维护 size。工程里两种都常见。
        </>
      ),
    );
  };

  const frontPos = polar(front, 52);
  const rearPos = polar(rear, 78);
  const reservedIdx = scheme === "spare" && isFull ? rear : -1;
  const logical: number[] = [];
  for (let k = 0; k < size; k++) {
    const v = slots[(front + k) % CAP];
    if (v !== null) logical.push(v);
  }

  return (
    <div className="viz">
      <div className="viz-title">RingLab —— 循环队列的取模绕圈</div>
      <div className="viz-stage">
        <svg
          className="qu-ring"
          viewBox="0 0 340 300"
          width={340}
          height={300}
          role="img"
          aria-label="环形循环队列"
        >
          {/* 8 个槽位 */}
          {Array.from({ length: CAP }).map((_, i) => {
            const p = polar(i, R);
            const lab = polar(i, R + 38);
            const filled = slots[i] !== null;
            return (
              <g
                key={i}
                className={`qu-slot${filled ? " filled" : ""}${
                  i === reservedIdx ? " reserved" : ""
                }`}
              >
                <circle cx={p.x} cy={p.y} r={24} />
                <text className="qu-val" x={p.x} y={p.y + 5} textAnchor="middle">
                  {filled ? slots[i] : i === reservedIdx ? "🔒" : "·"}
                </text>
                <text className="qu-idx" x={lab.x} y={lab.y + 3} textAnchor="middle">
                  [{i}]
                </text>
              </g>
            );
          })}
          {/* front 指针(绿)*/}
          <g
            className="qu-ptr front"
            style={{ transform: `translate(${frontPos.x}px, ${frontPos.y}px)` }}
          >
            <text textAnchor="middle" y={4}>
              front ▸
            </text>
          </g>
          {/* rear 指针(黄)*/}
          <g
            className="qu-ptr rear"
            style={{ transform: `translate(${rearPos.x}px, ${rearPos.y}px)` }}
          >
            <text textAnchor="middle" y={4}>
              rear ▸
            </text>
          </g>
          {/* 中心状态 */}
          <text className="qu-center-big" x={CX} y={CY - 2} textAnchor="middle">
            {isEmpty ? "空" : isFull ? "满" : `size ${size}`}
          </text>
          <text className="qu-center-sub" x={CX} y={CY + 18} textAnchor="middle">
            front={front} · rear={rear} · 容量 {scheme === "spare" ? CAP - 1 : CAP}
          </text>
        </svg>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <div className="viz-ctl">
        <button type="button" className="btn btn-sm btn-primary" onClick={enqueue}>
          入队
        </button>
        <button type="button" className="btn btn-sm" onClick={dequeue}>
          出队
        </button>
        <button type="button" className="btn btn-sm" onClick={reset}>
          重置
        </button>
        <div className="seg" role="group" aria-label="满空判定方案">
          <button
            type="button"
            className={`seg-btn${scheme === "spare" ? " on" : ""}`}
            onClick={() => switchScheme("spare")}
          >
            方案A · 留一格空
          </button>
          <button
            type="button"
            className={`seg-btn${scheme === "count" ? " on" : ""}`}
            onClick={() => switchScheme("count")}
          >
            方案B · 计数器
          </button>
        </div>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          逻辑队列 [{logical.join(", ")}]
        </span>
      </div>
    </div>
  );
}

/* ---------------- TwoStackPour(LC 232 逐帧)---------------- */

interface PourFrame {
  inS: number[];
  outS: number[];
  pour?: boolean;
  msg: ReactNode;
}

const POUR_FRAMES: PourFrame[] = [
  {
    inS: [],
    outS: [],
    msg: (
      <>
        规则只有三条:push 一律进 <b>in</b>;pop/peek 一律找 <b>out</b>;out
        空了,才把 in <b>整锅</b>倒过去。
      </>
    ),
  },
  {
    inS: [1],
    outS: [],
    msg: <>push(1):压进 in 栈,O(1)。逻辑队列:[1]。</>,
  },
  {
    inS: [1, 2],
    outS: [],
    msg: (
      <>
        push(2):还是只进 in。注意 in 里顺序是<b>反的</b> —— 先来的 1
        被压在底下。别急,还有第二次反转。
      </>
    ),
  },
  {
    inS: [1],
    outS: [2],
    pour: true,
    msg: (
      <>
        pop()!但 out 是空的 → 触发<b>倒栈</b>:in 的栈顶 2 先弹出,
        压进 out 的底部。
      </>
    ),
  },
  {
    inS: [],
    outS: [2, 1],
    pour: true,
    msg: (
      <>
        1 随后压入,正好落在 out 的<b>顶</b>。两次反转 = 负负得正:
        先来的 1 回到了「最先出」的位置。
      </>
    ),
  },
  {
    inS: [],
    outS: [2],
    msg: <>pop() = 1 ✓ 先进先出!out 非空时,出队就是普通弹栈,O(1)。</>,
  },
  {
    inS: [3],
    outS: [2],
    msg: (
      <>
        push(3):进 in,完全不打扰 out。<b>纪律:out 里的「老人」没走完,
        绝不倒栈</b> —— 提前倒,3 会插到 2 前面,顺序就错了。
      </>
    ),
  },
  {
    inS: [3],
    outS: [],
    msg: <>pop() = 2 ✓ 直接从 out 弹出,O(1)。</>,
  },
  {
    inS: [],
    outS: [],
    msg: (
      <>
        pop() = 3 ✓(out 空 → 倒栈搬来 3 → 弹出)。算总账:每个元素一生最多 4
        次操作:进 in、出 in、进 out、出 out → n 次调用总成本 ≤ 4n,
        <b>均摊 O(1)</b>。
      </>
    ),
  },
];

function Swell({
  items,
  label,
  hot,
  isOut,
}: {
  items: number[];
  label: string;
  hot: boolean;
  isOut?: boolean;
}) {
  return (
    <div className="qu-swell-wrap">
      <div className={`qu-swell${hot ? " hot" : ""}`}>
        {items.length === 0 && <div className="qu-sempty">空</div>}
        {[...items].reverse().map((v, ri) => (
          <div
            key={`${v}-${ri}`}
            className={`qu-splate${
              ri === 0 ? (isOut ? " head" : " top") : ""
            }`}
          >
            {v}
            {ri === 0 && isOut && <span className="qu-head-tag">队头</span>}
          </div>
        ))}
      </div>
      <div className="qu-swell-lab">{label}</div>
    </div>
  );
}

export function TwoStackPour() {
  const s = useStepper(POUR_FRAMES.length, 1700);
  const f = POUR_FRAMES[s.step];

  return (
    <div className="viz">
      <div className="viz-title">LC 232 · 双栈倒水,逐帧慢放</div>
      <div className="viz-stage">
        <div className="qu-pour">
          <Swell items={f.inS} label="in · 只进" hot={!!f.pour} />
          <div className={`qu-pour-arrow${f.pour ? " on" : ""}`} aria-hidden>
            {f.pour ? "⟶ 倒栈" : "⟶"}
          </div>
          <Swell items={f.outS} label="out · 只出" hot={!!f.pour} isOut />
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={POUR_FRAMES.length} />
    </div>
  );
}
