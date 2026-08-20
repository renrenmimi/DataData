"use client";

// 第 3 章 · 链表的专属可视化:
//  - ScatterMap:静态对比图 —— 同一批值「连片住」(数组)vs「散落住 + 引用相连」(链表)。
//  - LinkedLab:交互实验室 —— 头插 / 按位插入 / 删除,指针改动分两步高亮;
//    还带一个「先断后接」反面教材:亲眼看后半条链怎么丢的。
//  - ReverseAnim(LC 206)/ CycleAnim(LC 141)/ MergeAnim(LC 21):
//    三个逐帧 SVG 动画,复用 lib/stepper 的 useStepper + StepControls。
//
// 双语:所有标题、旁白、按钮、SVG 文字、aria-label 都通过 <T> / useL() 切换。

import { useRef, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { useL, T } from "@/lib/i18n";

/* ================= SVG 公共零件 ================= */

type Tone = "base" | "acc" | "ok" | "risk";
type NodeState = "base" | "lit" | "ok" | "bad" | "ghost";

const TONE_COLOR: Record<Tone, string> = {
  base: "var(--text-3)",
  acc: "var(--acc)",
  ok: "var(--ok)",
  risk: "var(--risk)",
};

/** 每个 SVG 各配一套四色箭头 marker(id 用 mk 前缀区分,避免全页冲突) */
function Defs({ mk }: { mk: string }) {
  return (
    <defs>
      {(Object.keys(TONE_COLOR) as Tone[]).map((t) => (
        <marker
          key={t}
          id={`${mk}-${t}`}
          viewBox="0 0 10 10"
          refX="8.5"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill={TONE_COLOR[t]} />
        </marker>
      ))}
    </defs>
  );
}

/** 带箭头的边:tone 决定颜色,flow 加流动虚线动画,dashed 表示「将被剪断」 */
function Edge({
  d,
  mk,
  tone = "base",
  flow = false,
  dashed = false,
}: {
  d: string;
  mk: string;
  tone?: Tone;
  flow?: boolean;
  dashed?: boolean;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={TONE_COLOR[tone]}
      strokeWidth={1.8}
      strokeDasharray={dashed ? "4 5" : undefined}
      className={flow ? "flow-edge" : undefined}
      markerEnd={`url(#${mk}-${tone})`}
      opacity={dashed ? 0.5 : 1}
    />
  );
}

const NODE_STROKE: Record<NodeState, string> = {
  base: "var(--border-strong)",
  lit: "var(--acc)",
  ok: "var(--ok)",
  bad: "var(--risk)",
  ghost: "var(--border)",
};

const NODE_FILL: Record<NodeState, string> = {
  base: "var(--panel-2)",
  lit: "var(--acc-soft)",
  ok: "var(--ok-bg)",
  bad: "var(--risk-bg)",
  ghost: "transparent",
};

const NODE_TEXT: Record<NodeState, string> = {
  base: "var(--text)",
  lit: "var(--acc-ink)",
  ok: "var(--ok)",
  bad: "var(--risk)",
  ghost: "var(--text-3)",
};

/** 「值 | next」两格式节点盒(链表标准画法) */
function NodeBox({
  x,
  y,
  v,
  state = "base",
  nextMark,
}: {
  x: number;
  y: number;
  v: ReactNode;
  state?: NodeState;
  /** next 槽里画什么:默认小圆点;"?" 表示悬空 */
  nextMark?: string;
}) {
  return (
    <g opacity={state === "ghost" ? 0.32 : 1}>
      <rect
        x={x}
        y={y}
        width={64}
        height={44}
        rx={10}
        fill={NODE_FILL[state]}
        stroke={NODE_STROKE[state]}
        strokeWidth={1.6}
        strokeDasharray={state === "ghost" ? "5 4" : undefined}
      />
      <line
        x1={x + 44}
        y1={y + 6}
        x2={x + 44}
        y2={y + 38}
        stroke={NODE_STROKE[state]}
        strokeWidth={1}
        opacity={0.6}
      />
      <text
        x={x + 22}
        y={y + 27}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill={NODE_TEXT[state]}
      >
        {v}
      </text>
      {nextMark ? (
        <text
          x={x + 54}
          y={y + 27}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill="var(--risk)"
        >
          {nextMark}
        </text>
      ) : (
        <circle cx={x + 54} cy={y + 22} r={3} fill={NODE_TEXT[state]} />
      )}
    </g>
  );
}

/** 圆形节点(反转/判环动画用) */
function NodeDot({
  cx,
  cy,
  v,
  state = "base",
}: {
  cx: number;
  cy: number;
  v: ReactNode;
  state?: NodeState;
}) {
  return (
    <g opacity={state === "ghost" ? 0.32 : 1}>
      <circle
        cx={cx}
        cy={cy}
        r={21}
        fill={NODE_FILL[state]}
        stroke={NODE_STROKE[state]}
        strokeWidth={1.6}
      />
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill={NODE_TEXT[state]}
      >
        {v}
      </text>
    </g>
  );
}

/** SVG 里的指针标签(prev / cur / slow …) */
function PtrLabel({
  x,
  y,
  label,
  tone = "acc",
}: {
  x: number;
  y: number;
  label: string;
  tone?: Tone;
}) {
  return (
    <g>
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={TONE_COLOR[tone]}
      >
        ▲ {label}
      </text>
    </g>
  );
}

/* ================= ScatterMap:两种住法 ================= */

export function ScatterMap() {
  const mk = "llscat";
  const L = useL();
  // 链表节点的「随机」地址与位置 —— 故意打乱顺序,强调不连续
  // 链条顺序是 nodes[0] → nodes[2] → nodes[1],所以值必须按 7 → 2 → 9 分配,
  // 地址按 2096 → 3120 → 1432 —— 与下方旁白里的两串数字一一对应。
  const nodes = [
    { v: 7, addr: 2096, x: 60, y: 150 },
    { v: 9, addr: 1432, x: 420, y: 210 },
    { v: 2, addr: 3120, x: 250, y: 200 },
  ];
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="The same values [7, 2, 9], stored two ways"
          zh="同一批值 [7, 2, 9] 的两种存法"
        />
      </div>
      <svg
        viewBox="0 0 660 280"
        className="ll-svg"
        role="img"
        aria-label={L({
          en: "Diagram comparing contiguous array storage with scattered linked list nodes",
          zh: "数组连续存放与链表分散存放的对比图",
        })}
      >
        <Defs mk={mk} />
        {/* ---- 上半:数组,连片小区 ---- */}
        <text x={20} y={30} fontSize={12} fill="var(--text-2)" fontWeight={600}>
          <T en="Array: one contiguous block" zh="数组:一整块连续内存" />
        </text>
        {[7, 2, 9].map((v, i) => (
          <g key={i}>
            <rect
              x={230 + i * 56}
              y={44}
              width={52}
              height={44}
              rx={10}
              fill="var(--panel-2)"
              stroke="var(--border-strong)"
              strokeWidth={1.6}
            />
            <text
              x={230 + i * 56 + 26}
              y={71}
              textAnchor="middle"
              fontSize={14}
              fontWeight={700}
              fill="var(--text)"
            >
              {v}
            </text>
            <text
              x={230 + i * 56 + 26}
              y={104}
              textAnchor="middle"
              fontSize={10}
              fill="var(--text-3)"
            >
              {1000 + i * 4}
            </text>
          </g>
        ))}
        <text x={412} y={71} fontSize={11} fill="var(--text-3)">
          <T en="← base + i × 4" zh="← 首地址 + i × 4" />
        </text>

        {/* ---- 下半:链表,散落各处 ---- */}
        <text x={20} y={136} fontSize={12} fill="var(--text-2)" fontWeight={600}>
          <T
            en="Linked list: any address, joined by next"
            zh="链表:地址任意,靠 next 引用相连"
          />
        </text>
        {/* head 标签指向第一个节点 */}
        <text x={20} y={175} fontSize={11.5} fontWeight={700} fill="var(--acc)">
          head
        </text>
        <Edge mk={mk} tone="acc" d={`M ${52} ${171} L ${nodes[0].x - 6} ${nodes[0].y + 22}`} />
        {nodes.map((n, i) => (
          <g key={i}>
            <NodeBox x={n.x} y={n.y} v={n.v} />
            <text
              x={n.x + 32}
              y={n.y + 60}
              textAnchor="middle"
              fontSize={10}
              fill="var(--text-3)"
            >
              {n.addr}
            </text>
          </g>
        ))}
        {/* 7 → 2:从 next 槽出发,弯着找到远处的家 */}
        <Edge
          mk={mk}
          tone="acc"
          flow
          d={`M ${nodes[0].x + 54} ${nodes[0].y + 12} Q ${(nodes[0].x + nodes[2].x) / 2 + 40} ${nodes[0].y - 44} ${nodes[2].x - 8} ${nodes[2].y + 14}`}
        />
        {/* 2 → 9 */}
        <Edge
          mk={mk}
          tone="acc"
          flow
          d={`M ${nodes[2].x + 54} ${nodes[2].y + 10} Q ${(nodes[2].x + nodes[1].x) / 2 + 10} ${nodes[2].y - 40} ${nodes[1].x - 8} ${nodes[1].y + 16}`}
        />
        {/* 9 → null */}
        <Edge
          mk={mk}
          d={`M ${nodes[1].x + 54} ${nodes[1].y + 34} Q ${nodes[1].x + 100} ${nodes[1].y + 52} ${nodes[1].x + 130} ${nodes[1].y + 30}`}
        />
        <text
          x={nodes[1].x + 142}
          y={nodes[1].y + 34}
          fontSize={14}
          fill="var(--text-3)"
        >
          ∅
        </text>
      </svg>
      <div className="viz-msg">
        <T
          en={
            <>
              The three array values occupy addresses 1000 to 1011, one after
              another, so element i is found by arithmetic. The three list nodes
              sit at 2096, 3120, and 1432. The order 7 → 2 → 9{" "}
              <b>exists only in the next references</b> and has nothing to do
              with the addresses. To reach the second node you have to start at
              head and follow one reference at a time.
            </>
          }
          zh={
            <>
              数组的三个值排在 1000–1011 这段连续地址上,第 i 个用算式直接算出来;
              链表的三个节点分别在 2096 / 3120 / 1432,逻辑顺序 7 → 2 → 9{" "}
              <b>只存在于 next 引用里</b>,与地址毫无关系。想找第 2 个节点?
              只能从 head 出发,一次跟一根引用。
            </>
          }
        />
      </div>
    </div>
  );
}

/* ================= LinkedLab:插入 / 删除实验室 ================= */

type Scene =
  | { kind: "idle" }
  | { kind: "ins"; step: 1 | 2; k: number; v: number }
  | { kind: "del"; step: 1 | 2; k: number }
  | { kind: "bad"; step: 1 | 2; k: number; v: number };

const LAB_Y = 118; // 主链所在行
const labX = (i: number) => 74 + i * 108;

export function LinkedLab() {
  const mk = "lllab";
  const L = useL();
  const [values, setValues] = useState<number[]>([3, 7, 12]);
  const [pos, setPos] = useState(1);
  const [busy, setBusy] = useState(false);
  const [scene, setScene] = useState<Scene>({ kind: "idle" });
  const [msg, setMsg] = useState<ReactNode>(
    <T
      en="Pick a position with the slider and try the three operations. Nothing is ever moved: only references change."
      zh="用滑杆选一个位置,试试三种操作 —— 全程没有任何元素搬家,变的只有引用。"
    />,
  );
  const nextVal = useRef(5);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const takeVal = () => {
    const v = nextVal.current;
    nextVal.current = ((nextVal.current + 3) % 9) + 1;
    return v;
  };

  const n = values.length;
  const p = Math.min(pos, n - 1);

  const insert = async () => {
    if (busy || n >= 5) return;
    setBusy(true);
    const v = takeVal();
    const k = p;
    if (k === 0) {
      setScene({ kind: "ins", step: 1, k, v });
      setMsg(
        <T
          en={
            <>
              Inserting at the front, step 1 — <b>connect</b>:{" "}
              <code>newNode.next = head</code>. The new node takes hold of the
              whole list, and nothing is lost yet.
            </>
          }
          zh={
            <>
              头插第 ① 步 <b>先接</b>:<code>newNode.next = head</code>。
              新节点先牵住整条链,此刻什么都没丢。
            </>
          }
        />,
      );
      await sleep(1500);
      setScene({ kind: "ins", step: 2, k, v });
      setMsg(
        <T
          en={
            <>
              Step 2 — <b>move head</b>: <code>head = newNode</code>. Two
              reference writes, and the cost does not depend on the length of
              the list, so inserting at the front is <b>O(1)</b>.
            </>
          }
          zh={
            <>
              第 ② 步 <b>换头</b>:<code>head = newNode</code>。两次引用写入,
              成本与链表长度无关 —— 头插是 <b>O(1)</b>。
            </>
          }
        />,
      );
      await sleep(1500);
      setValues([v, ...values]);
    } else {
      setScene({ kind: "ins", step: 1, k, v });
      setMsg(
        <T
          en={
            <>
              Step 1 — <b>connect</b>: <code>newNode.next</code> is set to the
              node at position {k}. The old list is still intact, so this step
              can be undone.
            </>
          }
          zh={
            <>
              第 ① 步 <b>先接</b>:<code>newNode.next</code> 指向位置 {k} 的节点。
              旧链完好无损,这一步随时可以反悔。
            </>
          }
        />,
      );
      await sleep(1500);
      setScene({ kind: "ins", step: 2, k, v });
      setMsg(
        <T
          en={
            <>
              Step 2 — <b>disconnect</b>: <code>prev.next = newNode</code>, and
              the old edge (dashed) is gone. Two pointer writes, O(1). But
              remember: <b>walking to prev</b> took O(n).
            </>
          }
          zh={
            <>
              第 ② 步 <b>后断</b>:<code>prev.next = newNode</code>,旧边(虚线)作废。
              两次指针写入,O(1)。但别忘了:<b>走到 prev</b> 花了 O(n)。
            </>
          }
        />,
      );
      await sleep(1500);
      setValues([...values.slice(0, k), v, ...values.slice(k)]);
    }
    setScene({ kind: "idle" });
    setBusy(false);
  };

  const remove = async () => {
    if (busy || n <= 2) return;
    setBusy(true);
    const k = p;
    setScene({ kind: "del", step: 1, k });
    setMsg(
      k === 0 ? (
        <T
          en={
            <>
              Deleting the head, step 1: <code>head = head.next</code>. The head
              variable is pointed at the second node directly, because the first
              node has no predecessor to update.
            </>
          }
          zh={
            <>
              删头第 ① 步:<code>head = head.next</code>。直接把 head 变量指向第二个节点 ——
              因为第一个节点没有前驱可改。
            </>
          }
        />
      ) : (
        <T
          en={
            <>
              Step 1 — <b>bypass</b>: <code>prev.next = target.next</code>. That
              single write already takes the target off the list.
            </>
          }
          zh={
            <>
              第 ① 步 <b>绕过</b>:<code>prev.next = target.next</code>。
              只改这一根指针,目标节点就已经不在链上了。
            </>
          }
        />
      ),
    );
    await sleep(1500);
    setScene({ kind: "del", step: 2, k });
    setMsg(
      <T
        en={
          <>
            Step 2: no reference points at the node any more. In Java, Python,
            and JavaScript the garbage collector reclaims it; in C or C++ you
            call free yourself. Deletion moves nothing, it only routes around
            the node.
          </>
        }
        zh={
          <>
            第 ② 步:再没有任何引用指向它。Java / Python / JS 由垃圾回收自动收走,
            C / C++ 则要自己 free。删除不搬家,只是「绕道」。
          </>
        }
      />,
    );
    await sleep(1500);
    setValues(values.filter((_, i) => i !== k));
    setScene({ kind: "idle" });
    setBusy(false);
  };

  const badDemo = async () => {
    if (busy) return;
    if (p === 0) {
      setMsg(
        <T
          en={<>This demo needs a predecessor. Move the slider to 1 or more.</>}
          zh={<>这个演示需要一个前驱 —— 把滑杆移到 1 或更大再试。</>}
        />,
      );
      return;
    }
    setBusy(true);
    const v = takeVal();
    const k = p;
    setScene({ kind: "bad", step: 1, k, v });
    setMsg(
      <T
        en={
          <>
            ⚠ Wrong order. <b>Disconnect first</b>:{" "}
            <code>prev.next = newNode</code>. But <code>newNode.next</code> is
            still empty (?), and now nothing remembers where position {k} was.
          </>
        }
        zh={
          <>
            ⚠ 顺序反了。<b>先断</b>:<code>prev.next = newNode</code>。
            可是 <code>newNode.next</code> 还是空的(?),而且再没人记得位置 {k} 在哪。
          </>
        }
      />,
    );
    await sleep(1900);
    setScene({ kind: "bad", step: 2, k, v });
    setMsg(
      <T
        en={
          <>
            Everything from position {k} onwards is now{" "}
            <b>unreachable</b>: no reference leads to those nodes, so the data
            is lost. This is what connect before you disconnect prevents.
          </>
        }
        zh={
          <>
            位置 {k} 起的整条后半链<b>已经不可达</b>:没有任何引用能到达它们,
            数据等于丢失。这就是「先接后断」四个字要防的事。
          </>
        }
      />,
    );
    await sleep(2400);
    setScene({ kind: "idle" });
    setMsg(
      <T
        en={
          <>
            Restored — a real program has no undo button. The rule:{" "}
            <b>
              the new node takes hold of the rest of the list first, and the
              predecessor switches last
            </b>
            .
          </>
        }
        zh={
          <>
            已复原(真实程序里可没有撤销键)。规则是:
            <b>新节点先牵住后半条链,前驱最后才改口</b>。
          </>
        }
      />,
    );
    setBusy(false);
  };

  /* ---- 渲染 ---- */

  const newX = (k: number) => (k === 0 ? labX(0) : labX(k - 1) + 54);
  const NEW_Y = 18;

  const s = scene;
  // 被「丢失」的节点区间(反面教材 step2)
  const lostFrom = s.kind === "bad" && s.step === 2 ? s.k : n;

  const nodeState = (i: number): NodeState => {
    if (s.kind === "del" && i === s.k) return s.step === 1 ? "lit" : "ghost";
    if (s.kind === "bad" && i >= s.k) return s.step === 2 ? "bad" : "base";
    if (s.kind === "idle" && i === p && !busy) return "lit";
    return "base";
  };

  // 普通相邻边 i → i+1 是否照常画
  const edgeVisible = (i: number) => {
    if (s.kind === "del" && s.step === 2 && (i === s.k - 1 || i === s.k)) return i !== s.k - 1;
    if (s.kind === "bad" && i === s.k - 1) return false; // 先断:这条边直接没了
    return true;
  };
  const edgeDashed = (i: number) =>
    (s.kind === "ins" && s.step === 2 && i === s.k - 1 && s.k > 0) ||
    (s.kind === "del" && i === s.k - 1 && s.step === 1);

  const nullX = labX(n - 1) + 64 + 26;

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Operating table — inserting and deleting only rewrite references"
          zh="链表手术台 —— 插入 / 删除只动引用"
        />
      </div>
      <svg
        viewBox="0 0 660 214"
        className="ll-svg"
        role="img"
        aria-label={L({
          en: "Interactive demonstration of insertion and deletion in a linked list",
          zh: "链表插入删除交互演示",
        })}
      >
        <Defs mk={mk} />

        {/* head 标签 */}
        <text x={12} y={LAB_Y + 27} fontSize={11.5} fontWeight={700} fill="var(--acc)">
          head
        </text>
        {/* head 箭头:头插 step2 时指向新节点,删头 step1+ 时指向第 1 个节点 */}
        {s.kind === "ins" && s.k === 0 && s.step === 2 ? (
          <>
            <Edge mk={mk} tone="ok" flow d={`M 46 ${LAB_Y + 14} Q 52 ${NEW_Y + 40} ${newX(0) - 8} ${NEW_Y + 26}`} />
            <Edge mk={mk} dashed d={`M 46 ${LAB_Y + 22} L ${labX(0) - 8} ${LAB_Y + 22}`} />
          </>
        ) : s.kind === "del" && s.k === 0 ? (
          <>
            <Edge mk={mk} tone="ok" flow d={`M 46 ${LAB_Y + 10} Q ${labX(0) + 32} ${LAB_Y - 34} ${labX(1) - 8} ${LAB_Y + 12}`} />
            <Edge mk={mk} dashed d={`M 46 ${LAB_Y + 26} L ${labX(0) - 8} ${LAB_Y + 26}`} />
          </>
        ) : (
          <Edge mk={mk} tone="acc" d={`M 46 ${LAB_Y + 22} L ${labX(0) - 8} ${LAB_Y + 22}`} />
        )}

        {/* 主链节点 */}
        {values.map((v, i) => (
          <NodeBox key={i} x={labX(i)} y={LAB_Y} v={v} state={nodeState(i)} />
        ))}

        {/* 相邻边 */}
        {values.map((_, i) => {
          if (i === n - 1 || !edgeVisible(i)) return null;
          const risky = lostFrom <= i;
          return (
            <Edge
              key={i}
              mk={mk}
              tone={risky ? "risk" : "base"}
              dashed={edgeDashed(i)}
              d={`M ${labX(i) + 54} ${LAB_Y + 22} L ${labX(i + 1) - 8} ${LAB_Y + 22}`}
            />
          );
        })}
        {/* 尾节点 → ∅ */}
        <Edge
          mk={mk}
          tone={lostFrom <= n - 1 ? "risk" : "base"}
          d={`M ${labX(n - 1) + 54} ${LAB_Y + 22} L ${nullX - 8} ${LAB_Y + 22}`}
        />
        <text x={nullX} y={LAB_Y + 27} fontSize={14} fill="var(--text-3)">
          ∅
        </text>

        {/* 删除的绕行边 */}
        {s.kind === "del" && s.k > 0 && (
          <Edge
            mk={mk}
            tone="ok"
            flow
            d={`M ${labX(s.k - 1) + 54} ${LAB_Y + 12} Q ${(labX(s.k - 1) + (s.k + 1 < n ? labX(s.k + 1) : nullX)) / 2 + 32} ${LAB_Y - 52} ${(s.k + 1 < n ? labX(s.k + 1) : nullX) - 8} ${LAB_Y + 12}`}
          />
        )}

        {/* 插入:漂浮的新节点 */}
        {(s.kind === "ins" || s.kind === "bad") && (
          <>
            <NodeBox
              x={newX(s.k)}
              y={NEW_Y}
              v={s.v}
              state="lit"
              nextMark={s.kind === "bad" ? "?" : undefined}
            />
            <text
              x={newX(s.k) + 32}
              y={NEW_Y - 6}
              textAnchor="middle"
              fontSize={10.5}
              fill="var(--acc)"
            >
              newNode
            </text>
          </>
        )}
        {/* 插入 step1:newNode.next → 后继 */}
        {s.kind === "ins" && (
          <Edge
            mk={mk}
            tone="ok"
            flow
            d={
              s.k === 0
                ? `M ${newX(0) + 54} ${NEW_Y + 30} Q ${newX(0) + 76} ${LAB_Y - 24} ${labX(0) + 32} ${LAB_Y - 8}`
                : `M ${newX(s.k) + 54} ${NEW_Y + 30} Q ${labX(s.k) + 10} ${NEW_Y + 44} ${labX(s.k) + 20} ${LAB_Y - 8}`
            }
          />
        )}
        {/* 插入 step2:前驱 → newNode */}
        {s.kind === "ins" && s.step === 2 && s.k > 0 && (
          <Edge
            mk={mk}
            tone="acc"
            flow
            d={`M ${labX(s.k - 1) + 54} ${LAB_Y + 14} Q ${labX(s.k - 1) + 60} ${NEW_Y + 58} ${newX(s.k) - 8} ${NEW_Y + 30}`}
          />
        )}
        {/* 反面教材:前驱 → newNode(过早!) */}
        {s.kind === "bad" && (
          <Edge
            mk={mk}
            tone="risk"
            flow
            d={`M ${labX(s.k - 1) + 54} ${LAB_Y + 14} Q ${labX(s.k - 1) + 60} ${NEW_Y + 58} ${newX(s.k) - 8} ${NEW_Y + 30}`}
          />
        )}

        {/* 位置游标 */}
        {s.kind === "idle" && (
          <text
            x={labX(p) + 32}
            y={LAB_Y + 66}
            textAnchor="middle"
            fontSize={10.5}
            fontWeight={700}
            fill="var(--acc)"
          >
            <T en={<>▲ position {p}</>} zh={<>▲ 位置 {p}</>} />
          </text>
        )}
      </svg>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <div className="viz-ctl ll-lab-ctl">
        <label className="mono dim" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <T en={<>position {p}</>} zh={<>位置 {p}</>} />
          <input
            type="range"
            min={0}
            max={n - 1}
            value={p}
            disabled={busy}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label={L({ en: "Position to operate on", zh: "操作位置" })}
          />
        </label>
        <button type="button" className="btn btn-sm btn-primary" onClick={insert} disabled={busy || n >= 5}>
          <T en={<>Insert at {p}</>} zh={<>在位置 {p} 插入</>} />
        </button>
        <button type="button" className="btn btn-sm" onClick={remove} disabled={busy || n <= 2}>
          <T en={<>Delete at {p}</>} zh={<>删除位置 {p}</>} />
        </button>
        <button type="button" className="btn btn-sm" onClick={badDemo} disabled={busy}>
          <T en="☠ Wrong order: disconnect first" zh="☠ 反面教材:先断后接" />
        </button>
      </div>
    </div>
  );
}

/* ================= ReverseAnim:LC 206 三指针反转 ================= */

// 每帧:各节点箭头方向(right / left / lnull=指向左端∅)、指针位置、已反转集合
interface RevFrame {
  // arrows[i]:节点 i 的出边指向哪 —— i+1(right)、i-1(left)、左端 ∅(lnull)、右端 ∅(rnull)
  arrows: ("right" | "left" | "lnull" | "rnull")[];
  litArrow?: number; // 本帧刚改动的箭头(高亮)
  prev: number; // -1 = 左端 ∅
  cur: number; // 4 = 右端 ∅(越过末尾)
  nxt?: number; // undefined = 不显示;4 = 右端 ∅
  done: number[]; // 已反转完成的节点(绿色)
  msg: ReactNode;
}

const REV_FRAMES: RevFrame[] = [
  {
    arrows: ["right", "right", "right", "rnull"],
    prev: -1,
    cur: 0,
    done: [],
    msg: (
      <T
        en={
          <>
            Start: <code>prev = null</code>, <code>cur = head</code>. prev is
            the head of the part that is already reversed, cur is the node being
            processed. The goal is to turn every next reference around{" "}
            <b>in place</b>, without creating a single new node.
          </>
        }
        zh={
          <>
            初始:<code>prev = null</code>,<code>cur = head</code>。
            prev 是已反转部分的头,cur 是正在处理的节点。目标是把每一根 next
            引用<b>原地调头</b>,不新建任何节点。
          </>
        }
      />
    ),
  },
  {
    arrows: ["right", "right", "right", "rnull"],
    prev: -1,
    cur: 0,
    nxt: 1,
    done: [],
    msg: (
      <T
        en={
          <>
            Step 1 — <b>save</b>: <code>nxt = cur.next</code>, so node 2 is
            remembered. Without this, the next line overwrites cur.next and the
            rest of the list becomes unreachable. It is the same failure as the
            wrong-order demo above.
          </>
        }
        zh={
          <>
            第 ① 步 <b>备份</b>:<code>nxt = cur.next</code>,先记住节点 2 在哪。
            不备份的话,下一行改掉 cur.next,后半条链就再也找不到了 ——
            和上面的反面教材是同一个问题。
          </>
        }
      />
    ),
  },
  {
    arrows: ["lnull", "right", "right", "rnull"],
    litArrow: 0,
    prev: -1,
    cur: 0,
    nxt: 1,
    done: [],
    msg: (
      <T
        en={
          <>
            Step 2 — <b>turn</b>: <code>cur.next = prev</code>. prev is null, so
            node 1 now points at null. It will be the last node of the reversed
            list.
          </>
        }
        zh={
          <>
            第 ② 步 <b>调头</b>:<code>cur.next = prev</code>。prev 是 null,
            所以节点 1 现在指向 null —— 它将是新链的最后一个节点。
          </>
        }
      />
    ),
  },
  {
    arrows: ["lnull", "right", "right", "rnull"],
    prev: 0,
    cur: 1,
    done: [0],
    msg: (
      <T
        en={
          <>
            Step 3 — <b>advance</b>: <code>prev = cur</code>,{" "}
            <code>cur = nxt</code>. Both pointers move one node to the right.
            The green part is reversed already, and it always starts at prev.
          </>
        }
        zh={
          <>
            第 ③ 步 <b>前移</b>:<code>prev = cur</code>,<code>cur = nxt</code>。
            两个指针一起右移一格。绿色部分已经反转完毕,它的头永远是 prev。
          </>
        }
      />
    ),
  },
  {
    arrows: ["lnull", "left", "right", "rnull"],
    litArrow: 1,
    prev: 0,
    cur: 1,
    nxt: 2,
    done: [0],
    msg: (
      <T
        en={
          <>
            Round two, same three steps: save nxt = node 3, turn the reference
            of node 2 to point at node 1, then advance. Each round changes{" "}
            <b>exactly one reference</b> and leaves the rest untouched.
          </>
        }
        zh={
          <>
            第二轮,同样三步:备份 nxt = 节点 3,把节点 2 的引用调头指向节点 1,再前移。
            每一轮只改<b>一根引用</b>,其余原封不动。
          </>
        }
      />
    ),
  },
  {
    arrows: ["lnull", "left", "left", "rnull"],
    litArrow: 2,
    prev: 2,
    cur: 3,
    done: [0, 1, 2],
    msg: (
      <T
        en={
          <>
            Round three is done: node 3 now points at node 2, prev is on node 3
            and cur is on node 4. The reversed part [1 ← 2 ← 3] and the
            untouched part [4 → ∅] are clearly separated.
          </>
        }
        zh={
          <>
            第三轮完成:节点 3 指向节点 2,prev 走到节点 3,cur 走到节点 4。
            已反转的 [1 ← 2 ← 3] 与未处理的 [4 → ∅] 界限分明。
          </>
        }
      />
    ),
  },
  {
    arrows: ["lnull", "left", "left", "left"],
    litArrow: 3,
    prev: 3,
    cur: 4,
    done: [0, 1, 2, 3],
    msg: (
      <T
        en={
          <>
            Round four: nxt is null, node 4 turns to point at node 3, and cur
            becomes null. The loop condition <code>cur != null</code> is now
            false, so the loop ends.
          </>
        }
        zh={
          <>
            第四轮:nxt 为 null,节点 4 调头指向节点 3,cur 变成 null。
            循环条件 <code>cur != null</code> 不再成立,循环结束。
          </>
        }
      />
    ),
  },
  {
    arrows: ["lnull", "left", "left", "left"],
    prev: 3,
    cur: 4,
    done: [0, 1, 2, 3],
    msg: (
      <T
        en={
          <>
            Return <b>prev</b>, not cur: cur is null, and prev stopped on the
            last node of the original list, which is the new head. The result is
            4 → 3 → 2 → 1 → ∅. Each node is visited once, so the time is{" "}
            <b>O(n)</b>, and only three pointer variables are used, so the extra
            space is <b>O(1)</b>.
          </>
        }
        zh={
          <>
            返回 <b>prev</b> 而不是 cur:cur 已经是 null,prev 停在原链的最后一个节点上,
            那正是新的头。结果是 4 → 3 → 2 → 1 → ∅。每个节点只处理一次,时间{" "}
            <b>O(n)</b>;只用了三个指针变量,额外空间 <b>O(1)</b>。
          </>
        }
      />
    ),
  },
];

export function ReverseAnim() {
  const mk = "llrev";
  const L = useL();
  const st = useStepper(REV_FRAMES.length, 1600);
  const f = REV_FRAMES[st.step];
  const X = (i: number) => 116 + i * 112; // 节点圆心
  const Y = 84;
  const LNULL = 38;
  const RNULL = X(3) + 84;

  const ptrX = (at: number) => (at === -1 ? LNULL : at === 4 ? RNULL : X(at));
  const ptrs: { label: string; at: number }[] = [
    { label: "prev", at: f.prev },
    { label: "cur", at: f.cur },
    ...(f.nxt !== undefined ? [{ label: "nxt", at: f.nxt }] : []),
  ];

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="LC 206 · three-pointer reversal, one step at a time"
          zh="LC 206 · 三指针反转,逐帧慢放"
        />
      </div>
      <div className="viz-stage" style={{ padding: 0 }}>
        <svg
          viewBox="0 0 560 190"
          className="ll-svg"
          role="img"
          aria-label={L({
            en: "Step by step animation of reversing a linked list",
            zh: "反转链表逐帧动画",
          })}
        >
          <Defs mk={mk} />
          {/* 左右两端的 ∅ */}
          <text x={LNULL} y={Y + 5} textAnchor="middle" fontSize={15} fill="var(--text-3)">
            ∅
          </text>
          <text x={RNULL} y={Y + 5} textAnchor="middle" fontSize={15} fill="var(--text-3)">
            ∅
          </text>
          {/* 边:right 走上弧,left 走下弧 */}
          {f.arrows.map((dir, i) => {
            const lit = f.litArrow === i;
            const tone: Tone = lit ? "acc" : f.done.includes(i) ? "ok" : "base";
            let d = "";
            if (dir === "right") d = `M ${X(i) + 23} ${Y - 6} Q ${(X(i) + X(i + 1)) / 2} ${Y - 30} ${X(i + 1) - 25} ${Y - 8}`;
            else if (dir === "left")
              d = i === 0
                ? ""
                : `M ${X(i) - 23} ${Y + 6} Q ${(X(i) + X(i - 1)) / 2} ${Y + 32} ${X(i - 1) + 25} ${Y + 9}`;
            else if (dir === "lnull") d = `M ${X(i) - 23} ${Y + 6} Q ${(X(i) + LNULL) / 2} ${Y + 34} ${LNULL + 9} ${Y + 10}`;
            else d = `M ${X(i) + 23} ${Y - 4} Q ${(X(i) + RNULL) / 2} ${Y - 26} ${RNULL - 10} ${Y - 6}`;
            if (!d) return null;
            return <Edge key={i} mk={mk} tone={tone} flow={lit} d={d} />;
          })}
          {/* 节点 */}
          {[1, 2, 3, 4].map((v, i) => (
            <NodeDot
              key={i}
              cx={X(i)}
              cy={Y}
              v={v}
              state={f.cur === i ? "lit" : f.done.includes(i) ? "ok" : "base"}
            />
          ))}
          {/* 指针标签(同位置的错开叠放) */}
          {ptrs.map((pt) => {
            const same = ptrs.filter((o) => o.at === pt.at);
            const order = same.findIndex((o) => o.label === pt.label);
            return (
              <PtrLabel
                key={pt.label}
                x={ptrX(pt.at)}
                y={Y + 62 + order * 16}
                label={pt.label}
                tone={pt.label === "prev" ? "ok" : pt.label === "cur" ? "acc" : "base"}
              />
            );
          })}
        </svg>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={st} step={st.step} total={REV_FRAMES.length} />
    </div>
  );
}

/* ================= CycleAnim:LC 141 快慢指针判环 ================= */

interface CycFrame {
  slow: number;
  fast: number;
  meet?: boolean;
  msg: ReactNode;
}

const CYC_FRAMES: CycFrame[] = [
  {
    slow: 0,
    fast: 0,
    msg: (
      <T
        en={
          <>
            The list is 1 → 2 → 3 → 4 → 5, and the next reference of node 5
            points back to node 3, so nodes 3, 4, and 5 form a cycle. Both
            pointers start at the head: slow moves one node per step, fast moves
            two.
          </>
        }
        zh={
          <>
            链表是 1 → 2 → 3 → 4 → 5,而节点 5 的 next 指回节点 3 ——
            于是 3、4、5 构成一个环。两个指针都从头出发:slow 每步 1 格,fast 每步 2 格。
          </>
        }
      />
    ),
  },
  {
    slow: 1,
    fast: 2,
    msg: (
      <T
        en={<>Step 1: slow is on node 2, fast is on node 3. The gap opens up.</>}
        zh={<>第 1 步:slow 到节点 2,fast 到节点 3,差距开始拉开。</>}
      />
    ),
  },
  {
    slow: 2,
    fast: 4,
    msg: (
      <T
        en={
          <>
            Step 2: slow is on node 3, fast is on node 5. Both pointers are now
            inside the cycle. If there were no cycle, node 5 would be the last
            node, <code>fast.next</code> would be null, and the loop condition{" "}
            <code>fast != null &amp;&amp; fast.next != null</code> would stop
            the loop and return false.
          </>
        }
        zh={
          <>
            第 2 步:slow 到节点 3,fast 到节点 5,两个指针都进入了环。
            如果没有环,节点 5 就是最后一个节点,<code>fast.next</code> 为 null,
            循环条件 <code>fast != null &amp;&amp; fast.next != null</code>{" "}
            会让循环停下并返回 false。
          </>
        }
      />
    ),
  },
  {
    slow: 3,
    fast: 3,
    meet: true,
    msg: (
      <T
        en={
          <>
            Step 3: slow moves to node 4. fast moves two nodes, 5 → 3 → 4, and
            lands on node 4 as well — <b>they meet</b>, so the answer is true.
            slow has not even completed one lap of the cycle.
          </>
        }
        zh={
          <>
            第 3 步:slow 走到节点 4;fast 走两步 5 → 3 → 4,也停在节点 4 ——
            <b>相遇</b>,返回 true。整个过程 slow 连一圈都没绕完。
          </>
        }
      />
    ),
  },
  {
    slow: 3,
    fast: 3,
    meet: true,
    msg: (
      <T
        en={
          <>
            Why is meeting guaranteed? Measure the distance from fast forward to
            slow along the cycle. At step 2 that distance is 1 (5 → 3). Every
            step fast advances 2 and slow advances 1, so the distance{" "}
            <b>drops by exactly 1</b>. It is a whole number that never goes
            negative, so it must reach 0, and 0 means both pointers are on the
            same node. Time <b>O(n)</b>, extra space <b>O(1)</b>. Recording
            visited nodes in a hash set also runs in O(n) time, but it needs
            O(n) space.
          </>
        }
        zh={
          <>
            为什么一定会相遇?沿着环量「从 fast 往前走到 slow」的距离:
            第 2 步时这个距离是 1(5 → 3)。此后每一步 fast 前进 2、slow 前进 1,
            距离<b>恰好减 1</b>。它是一个不会变成负数的整数,所以必然减到 0,
            而 0 就意味着两个指针停在同一个节点上。时间 <b>O(n)</b>,额外空间{" "}
            <b>O(1)</b>。用哈希集合记录访问过的节点同样是 O(n) 时间,但要 O(n) 空间。
          </>
        }
      />
    ),
  },
];

export function CycleAnim() {
  const mk = "llcyc";
  const L = useL();
  const st = useStepper(CYC_FRAMES.length, 1700);
  const f = CYC_FRAMES[st.step];
  const X = (i: number) => 66 + i * 104;
  const Y = 66;

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="LC 141 · fast and slow pointers, one step at a time"
          zh="LC 141 · 快慢指针判环,逐帧慢放"
        />
      </div>
      <div className="viz-stage" style={{ padding: 0 }}>
        <svg
          viewBox="0 0 540 190"
          className="ll-svg"
          role="img"
          aria-label={L({
            en: "Step by step animation of cycle detection with fast and slow pointers",
            zh: "快慢指针判环逐帧动画",
          })}
        >
          <Defs mk={mk} />
          {/* 直线边 1→2→3→4→5 */}
          {[0, 1, 2, 3].map((i) => (
            <Edge key={i} mk={mk} d={`M ${X(i) + 23} ${Y} L ${X(i + 1) - 25} ${Y}`} />
          ))}
          {/* 回环边 5 → 3 */}
          <Edge
            mk={mk}
            tone="acc"
            flow
            d={`M ${X(4)} ${Y + 23} Q ${(X(4) + X(2)) / 2} ${Y + 96} ${X(2) + 6} ${Y + 25}`}
          />
          <text x={(X(4) + X(2)) / 2} y={Y + 86} textAnchor="middle" fontSize={10.5} fill="var(--acc)">
            <T en="5.next points back to 3" zh="5.next 指回 3 —— 环!" />
          </text>
          {/* 节点 */}
          {[1, 2, 3, 4, 5].map((v, i) => (
            <NodeDot
              key={i}
              cx={X(i)}
              cy={Y}
              v={v}
              state={f.meet && f.slow === i ? "ok" : f.slow === i || f.fast === i ? "lit" : "base"}
            />
          ))}
          {/* 慢指针 / 快指针 */}
          <text x={X(f.slow) - (f.slow === f.fast ? 20 : 0)} y={Y - 32} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--ok)">
            slow
          </text>
          <text x={X(f.fast) + (f.slow === f.fast ? 20 : 0)} y={Y - 32} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--acc)">
            fast
          </text>
          {f.meet && (
            <text x={X(f.slow)} y={Y - 52} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--ok)">
              <T en="they meet" zh="相遇!" />
            </text>
          )}
        </svg>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={st} step={st.step} total={CYC_FRAMES.length} />
    </div>
  );
}

/* ================= MergeAnim:LC 21 dummy 合并 ================= */

interface MrgFrame {
  i: number; // l1 已消费到的下标(即下一个候选)
  j: number;
  res: { v: number; src: "a" | "b" }[];
  msg: ReactNode;
}

const L1 = [1, 2, 4];
const L2 = [1, 3, 4];

const MRG_FRAMES: MrgFrame[] = [
  {
    i: 0,
    j: 0,
    res: [],
    msg: (
      <T
        en={
          <>
            The dummy node is in place and tail points at it. The rule: compare
            the first node of each list and{" "}
            <b>attach the smaller one after tail</b>.
          </>
        }
        zh={
          <>
            dummy 哨兵先站好,tail 指着它。规则:比较两条链的头节点,
            <b>把小的那个挂到 tail 后面</b>。
          </>
        }
      />
    ),
  },
  {
    i: 1,
    j: 0,
    res: [{ v: 1, src: "a" }],
    msg: (
      <T
        en={
          <>
            1 vs 1: with <code>&lt;=</code> the tie goes to l1, which keeps the
            merge stable. <code>tail.next</code> is set to that node and tail
            moves onto it. The node itself is <b>relinked</b>, not copied, so
            the step is O(1).
          </>
        }
        zh={
          <>
            1 vs 1:用 <code>&lt;=</code> 时相等取 l1,合并保持稳定。
            <code>tail.next</code> 指向这个节点,tail 前移到它上面。
            节点是<b>整个重新挂接</b>,不拷贝值 —— 这一步是 O(1)。
          </>
        }
      />
    ),
  },
  {
    i: 1,
    j: 1,
    res: [
      { v: 1, src: "a" },
      { v: 1, src: "b" },
    ],
    msg: (
      <T
        en={<>2 vs 1: the 1 from l2 is smaller, so it is attached next.</>}
        zh={<>2 vs 1:l2 的 1 更小,挂上它。</>}
      />
    ),
  },
  {
    i: 2,
    j: 1,
    res: [
      { v: 1, src: "a" },
      { v: 1, src: "b" },
      { v: 2, src: "a" },
    ],
    msg: (
      <T en={<>2 vs 3: take the 2 from l1.</>} zh={<>2 vs 3:取 l1 的 2。</>} />
    ),
  },
  {
    i: 2,
    j: 2,
    res: [
      { v: 1, src: "a" },
      { v: 1, src: "b" },
      { v: 2, src: "a" },
      { v: 3, src: "b" },
    ],
    msg: (
      <T en={<>4 vs 3: take the 3 from l2.</>} zh={<>4 vs 3:取 l2 的 3。</>} />
    ),
  },
  {
    i: 3,
    j: 2,
    res: [
      { v: 1, src: "a" },
      { v: 1, src: "b" },
      { v: 2, src: "a" },
      { v: 3, src: "b" },
      { v: 4, src: "a" },
    ],
    msg: (
      <T
        en={
          <>
            4 vs 4: the tie again goes to l1. l1 is now empty, so the loop
            condition <code>l1 != null &amp;&amp; l2 != null</code> fails and
            the loop ends.
          </>
        }
        zh={
          <>
            4 vs 4:相等仍然取 l1。l1 空了,循环条件{" "}
            <code>l1 != null &amp;&amp; l2 != null</code> 不再成立,循环结束。
          </>
        }
      />
    ),
  },
  {
    i: 3,
    j: 3,
    res: [
      { v: 1, src: "a" },
      { v: 1, src: "b" },
      { v: 2, src: "a" },
      { v: 3, src: "b" },
      { v: 4, src: "a" },
      { v: 4, src: "b" },
    ],
    msg: (
      <T
        en={
          <>
            Finish: whatever is left in l2 is attached{" "}
            <b>as one whole segment</b> with <code>tail.next = l2</code>. That
            is one pointer write, O(1), where merging arrays would copy the
            remaining elements. Return <code>dummy.next</code>; the dummy itself
            is discarded. Time O(n + m), extra space O(1).
          </>
        }
        zh={
          <>
            收尾:l2 剩下的部分用 <code>tail.next = l2</code>{" "}
            <b>整段直接挂上</b>。这只是一次指针写入,O(1);换成数组合并,
            剩余元素还得逐个复制。最后返回 <code>dummy.next</code>,哨兵本身丢弃。
            时间 O(n + m),额外空间 O(1)。
          </>
        }
      />
    ),
  },
];

export function MergeAnim() {
  const mk = "llmrg";
  const L = useL();
  const st = useStepper(MRG_FRAMES.length, 1700);
  const f = MRG_FRAMES[st.step];
  const rowX = (k: number) => 150 + k * 92;
  const resX = (k: number) => 20 + k * 90; // resX(0) 是 dummy,之后每格 90
  const Y1 = 22;
  const Y2 = 82;
  const YR = 152;

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="LC 21 · merging with a dummy node, one step at a time"
          zh="LC 21 · dummy 哨兵合并,逐帧慢放"
        />
      </div>
      <div className="viz-stage" style={{ padding: 0 }}>
        <svg
          viewBox="0 0 640 226"
          className="ll-svg"
          role="img"
          aria-label={L({
            en: "Step by step animation of merging two sorted linked lists",
            zh: "合并两个有序链表逐帧动画",
          })}
        >
          <Defs mk={mk} />
          {/* l1 行 */}
          <text x={14} y={Y1 + 27} fontSize={11.5} fontWeight={700} fill="var(--text-2)">
            l1
          </text>
          {L1.map((v, k) => (
            <NodeBox
              key={k}
              x={rowX(k)}
              y={Y1}
              v={v}
              state={k < f.i ? "ghost" : k === f.i ? "lit" : "base"}
            />
          ))}
          {L1.map((_, k) =>
            k < L1.length - 1 ? (
              <Edge key={k} mk={mk} d={`M ${rowX(k) + 54} ${Y1 + 22} L ${rowX(k + 1) - 8} ${Y1 + 22}`} />
            ) : null,
          )}
          {f.i < L1.length && <PtrLabel x={rowX(f.i) + 32} y={Y1 + 60} label="l1" />}

          {/* l2 行 */}
          <text x={14} y={Y2 + 27} fontSize={11.5} fontWeight={700} fill="var(--text-2)">
            l2
          </text>
          {L2.map((v, k) => (
            <NodeBox
              key={k}
              x={rowX(k)}
              y={Y2}
              v={v}
              state={k < f.j ? "ghost" : k === f.j ? "lit" : "base"}
            />
          ))}
          {L2.map((_, k) =>
            k < L2.length - 1 ? (
              <Edge key={k} mk={mk} d={`M ${rowX(k) + 54} ${Y2 + 22} L ${rowX(k + 1) - 8} ${Y2 + 22}`} />
            ) : null,
          )}
          {f.j < L2.length && <PtrLabel x={rowX(f.j) + 32} y={Y2 + 60} label="l2" />}

          {/* 结果行:dummy + 已摘下的节点 */}
          <g>
            <rect
              x={20}
              y={YR}
              width={64}
              height={44}
              rx={10}
              fill="transparent"
              stroke="var(--acc)"
              strokeWidth={1.6}
              strokeDasharray="5 4"
            />
            <text x={52} y={YR + 27} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--acc)">
              dummy
            </text>
          </g>
          {f.res.map((r, k) => (
            <NodeBox key={k} x={resX(k + 1)} y={YR} v={r.v} state={k === f.res.length - 1 ? "ok" : "base"} />
          ))}
          {/* 结果行的边(dummy → 第一个 → …) */}
          {f.res.map((_, k) => (
            <Edge
              key={k}
              mk={mk}
              tone={k === f.res.length - 1 ? "ok" : "base"}
              flow={k === f.res.length - 1}
              d={`M ${(k === 0 ? 20 : resX(k)) + 54} ${YR + 22} L ${resX(k + 1) - 8} ${YR + 22}`}
            />
          ))}
          <PtrLabel
            x={(f.res.length === 0 ? 20 : resX(f.res.length)) + 32}
            y={YR + 60}
            label="tail"
            tone="ok"
          />
        </svg>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={st} step={st.step} total={MRG_FRAMES.length} />
    </div>
  );
}
