"use client";

// 第 5 章 · 队列的专属可视化:
//  - QueueMemFig:§02 静态图解 —— 数组队列的三种设计:搬移 / 不搬移(空间浪费) / 取模绕圈。
//  - RingLab:环形 SVG 循环队列(8 格),front/rear 指针动画,
//    可切换「留一格空 / 计数器」两种满-空判定方案。
//  - TwoStackPour:LC 232 双栈模拟队列的逐帧动画。
//
// 双语:所有标题、旁白、按钮、图内文字都通过 <T> / useL() 切换。
// 约定:rear 永远指向「下一个写入的位置」,front 指向「下一个出队的元素」——
// 图解、RingLab 与 §04 的代码保持同一套语义。

import { useRef, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { useL, T, type Loc } from "@/lib/i18n";

/* ---------------- QueueMemFig ---------------- */

function FigRow({
  title,
  cost,
  ptrs,
  cells,
  note,
}: {
  title: Loc<string>;
  cost: Loc<ReactNode>;
  ptrs: (string | null)[];
  cells: { v: ReactNode; state?: "lit" | "ok" | "bad" | "ghost" }[];
  note: ReactNode;
}) {
  const L = useL();
  return (
    <div className="qu-memrow">
      <div className="qu-memrow-label">
        <b>{L(title)}</b>
        <span>{L(cost)}</span>
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
        <T
          en="One array of 4 slots. The queue [2, 7, 9] removes 2, then adds 12. Three designs, three outcomes."
          zh="一个 4 格数组。队列 [2, 7, 9] 先出队 2,再入队 12 —— 三种设计,三种结果。"
        />
      </div>
      <FigRow
        title={{ en: "Design 1 · Shift", zh: "设计一 · 搬移" }}
        cost={{ en: "dequeue O(n)", zh: "出队 O(n)" }}
        ptrs={["front", null, null, "rear"]}
        cells={[
          { v: 7, state: "lit" },
          { v: 9, state: "lit" },
          { v: 12 },
          { v: "·", state: "ghost" },
        ]}
        note={
          <T
            en={
              <>
                When 2 leaves, every element after it moves one slot to the
                left, so the front stays at index 0. This is the front deletion
                from the array chapter. It is correct, but every dequeue moves
                the whole rest of the queue: <b>O(n)</b>, and it gets worse as
                the queue gets longer.
              </>
            }
            zh={
              <>
                队头 2 走后,它后面的元素<b>集体左移一格</b>,front 始终留在下标
                0 —— 这就是数组章的头部删除。正确,但每次出队都要搬动剩下的全部元素:
                <b>O(n)</b>,队伍越长越慢。
              </>
            }
          />
        }
      />
      <FigRow
        title={{ en: "Design 2 · Move front", zh: "设计二 · 只挪 front" }}
        cost={{ en: "dequeue O(1), wastes space", zh: "出队 O(1),费空间" }}
        ptrs={[null, "front", null, null]}
        cells={[
          { v: "✕", state: "ghost" },
          { v: 7, state: "lit" },
          { v: 9, state: "lit" },
          { v: 12 },
        ]}
        note={
          <T
            en={
              <>
                Nothing moves. front simply steps right, so dequeue becomes{" "}
                <b>O(1)</b>. But slot 0 is now <b>dead space</b> that can never
                be used again, and after 12 is written into slot 3 the next
                write position is 4, which is past the end. A long-running
                service would keep growing the array while holding only three
                elements.
              </>
            }
            zh={
              <>
                不搬移任何元素,只把 front 右移一格,出队变成 <b>O(1)</b>。
                但 slot[0] 从此<b>永远用不上</b>;而且 12 写进 slot[3]
                之后,下一个写入位置是 4,已经越过数组末尾。
                一个长期运行的服务会不断把数组撑大 —— 而里面其实只有 3 个元素。
              </>
            }
          />
        }
      />
      <FigRow
        title={{ en: "Design 3 · Wrap around", zh: "设计三 · 绕圈" }}
        cost={{ en: "dequeue O(1), no waste", zh: "出队 O(1),零浪费" }}
        ptrs={[null, "rear", "front", null]}
        cells={[
          { v: 12, state: "ok" },
          { v: "·", state: "ghost" },
          { v: 7, state: "lit" },
          { v: 9, state: "lit" },
        ]}
        note={
          <T
            en={
              <>
                Design 2 plus one rule: every index is taken modulo the
                capacity. The picture is one step further along — 7 and 9 sit in
                slots 2 and 3, and 2 has just left slot 1. The next write
                position was 4, and <b>4 % 4 = 0</b>, so 12 went into slot 0,
                reusing the space a dequeue had freed. The straight line behaves
                like a circle: no element moves and no slot is wasted. This is
                the <b>circular queue</b>.
              </>
            }
            zh={
              <>
                设计二加一条规则:所有下标都对容量取模。图里的状态比上面又往前走了一步 ——
                7、9 在 slot[2]、slot[3],2 刚从 slot[1] 出队。下一个写入位置本该是 4,
                <b>4 % 4 = 0</b>,于是 12 写进 slot[0],复用了出队腾出的空间。
                直线在逻辑上变成了圆环:没有元素搬移,也没有格子浪费 —— 这就是
                <b>循环队列</b>。
              </>
            }
          />
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
  const L = useL();
  const [slots, setSlots] = useState<(number | null)[]>(Array(CAP).fill(null));
  const [front, setFront] = useState(0);
  const [rear, setRear] = useState(0);
  const [size, setSize] = useState(0);
  const [scheme, setScheme] = useState<"spare" | "count">("spare");
  const seq = useRef(1);
  const [msg, setMsg] = useState<ReactNode>(
    <T
      en={
        <>
          A circular array of 8 slots. <b>front</b> (green) is the position of
          the next element to leave. <b>rear</b> (yellow) is the position where
          the next element will be written. Right now front == rear, and the
          queue is empty.
        </>
      }
      zh={
        <>
          8 格环形数组。<b>front</b>(绿)= 下一个出队元素的位置;<b>rear</b>
          (黄)= 下一个写入的位置。现在 front == rear —— 队列为空。
        </>
      }
    />,
  );

  const isEmpty = scheme === "spare" ? front === rear : size === 0;
  const isFull =
    scheme === "spare" ? (rear + 1) % CAP === front : size === CAP;

  const enqueue = () => {
    if (isFull) {
      setMsg(
        scheme === "spare" ? (
          <T
            en={
              <>
                Full. The slot after rear is front, and writing there would make
                a full queue look exactly like an empty one, because both would
                have front == rear. Scheme A keeps that slot{" "}
                <b>permanently empty</b> (the dashed circle), so 8 slots hold at
                most 7 elements. Switch to scheme B to use all 8.
              </>
            }
            zh={
              <>
                满了。rear 的下一格就是 front —— 再写进去,「满」和「空」都会变成
                front == rear,无法区分。方案 A <b>永久空出这一格</b>(虚线格),
                所以 8 格最多装 7 个。想用满 8 格,切到方案 B。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                Full. The counter says size == 8, so enqueue is refused. Scheme
                B spends one extra variable and gets all 8 slots in return. Both
                schemes are correct; it is a small trade between space and
                bookkeeping.
              </>
            }
            zh={
              <>
                满了。计数器 size == 8,拒绝入队。方案 B 用一个额外变量换来全部 8
                格的使用权 —— 两种方案都对,是空间与记账之间的一笔小交易。
              </>
            }
          />
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
    const wrapped = rear === CAP - 1 && nr === 0;
    setMsg(
      <T
        en={
          <>
            enqueue({v}): written into slot[{rear}], then rear = ({rear} + 1) %{" "}
            {CAP} = <b>{nr}</b>
            {wrapped ? (
              <> — the modulo took effect and rear wrapped back to 0.</>
            ) : (
              "."
            )}{" "}
            No element moved.
          </>
        }
        zh={
          <>
            入队 {v}:写进 slot[{rear}],然后 rear = ({rear} + 1) % {CAP} ={" "}
            <b>{nr}</b>
            {wrapped ? <> —— 取模生效,rear 绕回了 0。</> : "。"}{" "}
            没有任何元素被搬移。
          </>
        }
      />,
    );
  };

  const dequeue = () => {
    if (isEmpty) {
      setMsg(
        <T
          en={
            <>
              Dequeue on an empty queue.{" "}
              {scheme === "spare"
                ? "In scheme A, front == rear is the test for empty."
                : "In scheme B, size == 0 means there is nothing to remove."}{" "}
              Just like pop on an empty stack: check for empty before you touch
              either end.
            </>
          }
          zh={
            <>
              空队列出队。
              {scheme === "spare"
                ? "方案 A 里,front == rear 就是「空」的判据。"
                : "方案 B 里,size == 0 表示没有元素可取。"}
              和空栈 pop 一样:动手前先判空。
            </>
          }
        />,
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
    const oldFront = front;
    setMsg(
      <T
        en={
          <>
            dequeue() = {v}: front = ({oldFront} + 1) % {CAP} = <b>{nf}</b>, and
            that is the entire operation. slot[{oldFront}] becomes free again
            and will be reused when rear comes around.{" "}
            <b>Nothing moves, which is the point of a circular queue.</b>
          </>
        }
        zh={
          <>
            出队 {v}:front = ({oldFront} + 1) % {CAP} = <b>{nf}</b>
            ,整个操作就这一步。slot[{oldFront}] 重新变为空闲,等 rear
            绕回来复用。<b>全程没有元素搬移 —— 这就是循环队列的意义。</b>
          </>
        }
      />,
    );
  };

  const reset = () => {
    setSlots(Array(CAP).fill(null));
    setFront(0);
    setRear(0);
    setSize(0);
    seq.current = 1;
    setMsg(
      <T
        en={<>Cleared: front = rear = 0, size = 0.</>}
        zh={<>已清空:front = rear = 0,size = 0。</>}
      />,
    );
  };

  const switchScheme = (target: "spare" | "count") => {
    if (target === scheme) return;
    if (target === "spare" && size === CAP) {
      setMsg(
        <T
          en={
            <>
              Cannot switch right now. Scheme A holds at most {CAP - 1} elements
              and there are {CAP} in the queue, so dequeue one first. This
              awkward moment is the point: the two schemes really do define
              &ldquo;full&rdquo; differently.
            </>
          }
          zh={
            <>
              现在切不过去:方案 A 最多装 {CAP - 1} 个,而队列里已经有 {CAP}{" "}
              个,先出队一个。这个尴尬瞬间恰好说明:两种方案对「满」的定义确实不同。
            </>
          }
        />,
      );
      return;
    }
    setScheme(target);
    setMsg(
      target === "spare" ? (
        <T
          en={
            <>
              Scheme A · one slot empty: empty is (front == rear), full is
              ((rear + 1) % {CAP} == front). No extra variable, and the price is
              one slot: capacity {CAP - 1}.
            </>
          }
          zh={
            <>
              方案 A · 留一格空:空 = (front == rear),满 = ((rear + 1) % {CAP}{" "}
              == front)。不需要额外变量,代价是牺牲一格,容量 {CAP - 1}。
            </>
          }
        />
      ) : (
        <T
          en={
            <>
              Scheme B · size counter: empty is (size == 0), full is (size =={" "}
              {CAP}). All 8 slots are usable, and the price is updating size on
              every enqueue and dequeue. Both schemes are common in real code.
            </>
          }
          zh={
            <>
              方案 B · 计数器:空 = (size == 0),满 = (size == {CAP})。8
              格全能用,代价是每次进出都要更新 size。工程里两种都常见。
            </>
          }
        />
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
      <div className="viz-title">
        <T
          en="RingLab — how the modulo makes an array behave like a circle"
          zh="RingLab —— 取模如何让数组变成一个圈"
        />
      </div>
      <div className="viz-stage">
        <svg
          className="qu-ring"
          viewBox="0 0 340 300"
          width={340}
          height={300}
          role="img"
          aria-label={L({
            en: "Circular queue drawn as a ring of 8 slots",
            zh: "画成环形的 8 格循环队列",
          })}
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
            {isEmpty
              ? L({ en: "empty", zh: "空" })
              : isFull
                ? L({ en: "full", zh: "满" })
                : `size ${size}`}
          </text>
          <text className="qu-center-sub" x={CX} y={CY + 18} textAnchor="middle">
            front={front} · rear={rear} ·{" "}
            {L({ en: "cap", zh: "容量" })}{" "}
            {scheme === "spare" ? CAP - 1 : CAP}
          </text>
        </svg>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <div className="viz-ctl">
        <button type="button" className="btn btn-sm btn-primary" onClick={enqueue}>
          <T en="enqueue" zh="入队" />
        </button>
        <button type="button" className="btn btn-sm" onClick={dequeue}>
          <T en="dequeue" zh="出队" />
        </button>
        <button type="button" className="btn btn-sm" onClick={reset}>
          <T en="Reset" zh="重置" />
        </button>
        <div
          className="seg"
          role="group"
          aria-label={L({
            en: "How to tell full from empty",
            zh: "满空判定方案",
          })}
        >
          <button
            type="button"
            className={`seg-btn${scheme === "spare" ? " on" : ""}`}
            onClick={() => switchScheme("spare")}
          >
            <T en="A · one slot empty" zh="方案A · 留一格空" />
          </button>
          <button
            type="button"
            className={`seg-btn${scheme === "count" ? " on" : ""}`}
            onClick={() => switchScheme("count")}
          >
            <T en="B · size counter" zh="方案B · 计数器" />
          </button>
        </div>
        <span className="mono dim qu-logical">
          <T en="queue" zh="逻辑队列" /> [{logical.join(", ")}]
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
      <T
        en={
          <>
            Three rules only: every push goes into <b>in</b>; every pop and peek
            reads <b>out</b>; and in is emptied into out only when out is empty.
          </>
        }
        zh={
          <>
            规则只有三条:push 一律进 <b>in</b>;pop / peek 一律找 <b>out</b>;
            只有 out 空了,才把 in 整体倒进 out。
          </>
        }
      />
    ),
  },
  {
    inS: [1],
    outS: [],
    msg: (
      <T
        en={<>push(1): it goes on the in stack, O(1). The queue is [1].</>}
        zh={<>push(1):压进 in 栈,O(1)。此时逻辑队列是 [1]。</>}
      />
    ),
  },
  {
    inS: [1, 2],
    outS: [],
    msg: (
      <T
        en={
          <>
            push(2): still only in. Notice that in holds the elements in{" "}
            <b>reverse</b> order — 1 arrived first and is now at the bottom. A
            second reversal will fix that.
          </>
        }
        zh={
          <>
            push(2):还是只进 in。注意 in 里的顺序是<b>反的</b> —— 先到的 1
            被压在最底下。第二次反转会把它转回来。
          </>
        }
      />
    ),
  },
  {
    inS: [1],
    outS: [2],
    pour: true,
    msg: (
      <T
        en={
          <>
            pop(), and out is empty, so the <b>transfer</b> runs. The top of in
            is 2, so 2 is popped first and pushed onto out, where it lands at
            the bottom.
          </>
        }
        zh={
          <>
            pop(),而 out 是空的 → 触发<b>转移</b>:in 的栈顶是 2,它先被弹出,
            压进 out,落在 out 的底部。
          </>
        }
      />
    ),
  },
  {
    inS: [],
    outS: [2, 1],
    pour: true,
    msg: (
      <T
        en={
          <>
            1 follows and lands on <b>top</b> of out. Reversing twice restores
            the original order: 1 arrived first and is now the first to leave.
          </>
        }
        zh={
          <>
            1 随后压入,正好落在 out 的<b>栈顶</b>。反转两次等于没反转:
            先到的 1 回到了「最先出去」的位置。
          </>
        }
      />
    ),
  },
  {
    inS: [],
    outS: [2],
    msg: (
      <T
        en={
          <>
            pop() = 1, first in and first out. While out is not empty, a dequeue
            is just an ordinary stack pop: O(1).
          </>
        }
        zh={
          <>
            pop() = 1,先进先出。out 非空时,出队就是一次普通的弹栈:O(1)。
          </>
        }
      />
    ),
  },
  {
    inS: [3],
    outS: [2],
    msg: (
      <T
        en={
          <>
            push(3): it goes into in and does not disturb out. <b>The rule: as
            long as out still holds older elements, never transfer.</b>{" "}
            Transferring now would put 3 in front of 2 and break the order.
          </>
        }
        zh={
          <>
            push(3):进 in,完全不打扰 out。<b>纪律:只要 out
            里还有更早的元素,就绝不转移</b> —— 提前转移会把 3 放到 2 前面,
            顺序立刻错乱。
          </>
        }
      />
    ),
  },
  {
    inS: [3],
    outS: [],
    msg: (
      <T
        en={<>pop() = 2, taken straight off out: O(1).</>}
        zh={<>pop() = 2,直接从 out 弹出:O(1)。</>}
      />
    ),
  },
  {
    inS: [],
    outS: [],
    msg: (
      <T
        en={
          <>
            pop() = 3: out is empty, so the transfer brings 3 across and then
            pops it. Add up the total. Each element is moved at most 4 times in
            its whole life: into in, out of in, into out, out of out. So n calls
            cost at most 4n moves, which is <b>O(1) amortized</b>.
          </>
        }
        zh={
          <>
            pop() = 3:out 空 → 转移把 3 搬过来 → 弹出。算总账:
            每个元素一生最多被搬动 4 次(进 in、出 in、进 out、出 out),
            所以 n 次调用总共不超过 4n 次搬动,即<b>均摊 O(1)</b>。
          </>
        }
      />
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
  label: Loc<ReactNode>;
  hot: boolean;
  isOut?: boolean;
}) {
  const L = useL();
  return (
    <div className="qu-swell-wrap">
      <div className={`qu-swell${hot ? " hot" : ""}`}>
        {items.length === 0 && (
          <div className="qu-sempty">
            <T en="empty" zh="空" />
          </div>
        )}
        {[...items].reverse().map((v, ri) => (
          <div
            key={`${v}-${ri}`}
            className={`qu-splate${
              ri === 0 ? (isOut ? " head" : " top") : ""
            }`}
          >
            {v}
            {ri === 0 && isOut && (
              <span className="qu-head-tag">
                <T en="front" zh="队头" />
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="qu-swell-lab">{L(label)}</div>
    </div>
  );
}

export function TwoStackPour() {
  const s = useStepper(POUR_FRAMES.length, 1700);
  const f = POUR_FRAMES[s.step];

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="LC 232 · two stacks, one frame at a time"
          zh="LC 232 · 双栈模拟队列,逐帧慢放"
        />
      </div>
      <div className="viz-stage">
        <div className="qu-pour">
          <Swell
            items={f.inS}
            label={{ en: "in · push only", zh: "in · 只进" }}
            hot={!!f.pour}
          />
          <div className={`qu-pour-arrow${f.pour ? " on" : ""}`} aria-hidden>
            {f.pour ? (
              <T en="⟶ transfer" zh="⟶ 转移" />
            ) : (
              "⟶"
            )}
          </div>
          <Swell
            items={f.outS}
            label={{ en: "out · pop only", zh: "out · 只出" }}
            hot={!!f.pour}
            isOut
          />
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={POUR_FRAMES.length} />
    </div>
  );
}
