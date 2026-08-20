"use client";

// 第 8 章 · 二叉搜索树的专属可视化:
//  - BSTLab(招牌):交互式 BST —— 输入数字插入/查找,逐步动画展示
//    「从根一路比较下坠」;附「顺序插入 1→5」按钮,亲眼看树退化成链表。
//  - InorderFig:静态图 —— 为什么中序遍历必然升序(水平投影即有序数组)。
//  - MiniTree:静态小树(删除三情况 / AVL 旋转 / 建树结果等图解用)。
//  - TreeStepper:通用「树帧」播放器,精讲 LC 98 / LC 230 的逐帧动画用。
//
// 双语:标题、旁白、按钮、图内标签全部通过 <T> / useL() 切换。
// 本章「高度」一律按层数计:只有根时高度为 1。

import { useMemo, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { useL, T, type Loc } from "@/lib/i18n";

/* ================= 数据结构与工具 ================= */

interface BN {
  v: number;
  l: BN | null;
  r: BN | null;
}

function attach(node: BN | null, v: number): BN {
  if (!node) return { v, l: null, r: null };
  if (v < node.v) node.l = attach(node.l, v);
  else if (v > node.v) node.r = attach(node.r, v);
  return node;
}

function cloneTree(n: BN | null): BN | null {
  return n ? { v: n.v, l: cloneTree(n.l), r: cloneTree(n.r) } : null;
}

function buildSample(): BN {
  let root: BN | null = null;
  for (const v of [50, 30, 70, 20, 40, 60, 80]) root = attach(root, v);
  return root!;
}

/** 查找 v 的比较路径(路径上每个节点的值)与是否命中 */
function pathTo(root: BN | null, v: number): { path: number[]; found: boolean } {
  const path: number[] = [];
  let cur = root;
  while (cur) {
    path.push(cur.v);
    if (v === cur.v) return { path, found: true };
    cur = v < cur.v ? cur.l : cur.r;
  }
  return { path, found: false };
}

/** 布局:x = 中序位次(BST 的天然属性!),y = 深度 */
function layout(root: BN | null, w: number) {
  const nodes: { v: number; x: number; y: number }[] = [];
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const idx = new Map<number, number>();
  let i = 0;
  let maxD = 0;
  (function mark(n: BN | null) {
    if (!n) return;
    mark(n.l);
    idx.set(n.v, i++);
    mark(n.r);
  })(root);
  const total = Math.max(i, 1);
  const X = (v: number) => 30 + ((idx.get(v)! + 0.5) / total) * (w - 60);
  (function walk(n: BN | null, d: number, par: BN | null) {
    if (!n) return;
    maxD = Math.max(maxD, d);
    const x = X(n.v);
    const y = 34 + d * 60;
    nodes.push({ v: n.v, x, y });
    if (par) edges.push({ x1: X(par.v), y1: 34 + (d - 1) * 60, x2: x, y2: y });
    walk(n.l, d + 1, n);
    walk(n.r, d + 1, n);
  })(root, 0, null);
  return { nodes, edges, height: i === 0 ? 90 : 74 + maxD * 60, depth: maxD };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ================= BSTLab ================= */

const CAP = 15;
const W = 620;

export function BSTLab() {
  const L = useL();
  const [root, setRoot] = useState<BN | null>(() => buildSample());
  const [lit, setLit] = useState<number[]>([]);
  const [okV, setOkV] = useState<number | null>(null);
  const [badV, setBadV] = useState<number | null>(null);
  const [born, setBorn] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState<ReactNode>(
    <T
      en="Type a whole number between 0 and 99, then insert or search it. Watch it start at the root and take one comparison per level."
      zh="输入一个 0–99 的整数,插入或查找它 —— 观察它从根出发,每一层只做一次比较。"
    />,
  );

  const { nodes, edges, height, depth } = useMemo(() => layout(root, W), [root]);
  const count = nodes.length;

  const clearMarks = () => {
    setLit([]);
    setOkV(null);
    setBadV(null);
    setBorn(null);
  };

  const readInput = (): number | null => {
    const v = Number(input.trim());
    if (input.trim() === "" || !Number.isInteger(v) || v < 0 || v > 99) {
      setMsg(
        <T
          en="Type a whole number between 0 and 99 in the box on the left first."
          zh="请先在左边的输入框里填一个 0–99 的整数。"
        />,
      );
      return null;
    }
    return v;
  };

  const cls = (v: number) => {
    if (badV === v) return " bad";
    if (okV === v) return " ok";
    if (lit.includes(v)) return " lit";
    return "";
  };

  const doInsert = async () => {
    if (busy) return;
    const v = readInput();
    if (v === null) return;
    setBusy(true);
    clearMarks();
    const { path, found } = pathTo(root, v);
    if (!found && count >= CAP) {
      setMsg(
        <T
          en={<>This lab holds at most {CAP} nodes. Press &quot;Reset sample tree&quot; to start again.</>}
          zh={<>实验室最多容纳 {CAP} 个节点 —— 点「重置示例树」再玩。</>}
        />,
      );
      setBusy(false);
      return;
    }
    let acc: number[] = [];
    for (const p of path) {
      acc = [...acc, p];
      setLit(acc);
      if (v === p) break;
      setMsg(
        <T
          en={
            <>
              {v} {v < p ? "<" : ">"} <b>{p}</b> → go into the{" "}
              {v < p ? "left" : "right"} subtree. The whole{" "}
              {v < p ? "right" : "left"} subtree is skipped without being read.
            </>
          }
          zh={
            <>
              {v} {v < p ? "<" : ">"} <b>{p}</b> → 往{v < p ? "左" : "右"}子树走
              —— {v < p ? "右" : "左"}子树整棵被排除,看都不用看。
            </>
          }
        />,
      );
      await sleep(600);
    }
    if (found) {
      setBadV(v);
      setMsg(
        <T
          en={
            <>
              <b>{v}</b> is already in the tree. This implementation ignores
              duplicates. In real code you usually keep a counter on the node
              instead.
            </>
          }
          zh={
            <>
              <b>{v}</b> 已经在树里 —— 本实现直接忽略重复值,
              工程上更常见的做法是在节点上挂一个计数器。
            </>
          }
        />,
      );
      setBusy(false);
      return;
    }
    const nr = attach(cloneTree(root), v);
    setRoot(nr);
    setBorn(v);
    setOkV(v);
    setMsg(
      path.length === 0 ? (
        <T
          en={
            <>
              The tree was empty, so <b>{v}</b> becomes the root.
            </>
          }
          zh={
            <>
              空树:<b>{v}</b> 直接成为根节点。
            </>
          }
        />
      ) : (
        <T
          en={
            <>
              The search reached an empty slot, and the new node settles there.{" "}
              <b>{path.length}</b> comparisons = the length of the path from the
              root. An insert always lands in an empty child slot, so it costs{" "}
              <b>O(h)</b>.
            </>
          }
          zh={
            <>
              走到空位,就地安家。比较了 <b>{path.length}</b> 次 =
              根到落点的路径长度 —— 插入永远发生在一个空的孩子位置,代价{" "}
              <b>O(h)</b>。
            </>
          }
        />
      ),
    );
    setBusy(false);
  };

  const doSearch = async () => {
    if (busy) return;
    const v = readInput();
    if (v === null) return;
    if (!root) {
      setMsg(
        <T
          en="The tree is empty. Insert a few values first."
          zh="空树 —— 先插入几个值吧。"
        />,
      );
      return;
    }
    setBusy(true);
    clearMarks();
    const { path, found } = pathTo(root, v);
    let acc: number[] = [];
    for (const p of path) {
      acc = [...acc, p];
      setLit(acc);
      if (v === p) break;
      setMsg(
        <T
          en={
            <>
              {v} {v < p ? "<" : ">"} <b>{p}</b> → go{" "}
              {v < p ? "left" : "right"}.
            </>
          }
          zh={
            <>
              {v} {v < p ? "<" : ">"} <b>{p}</b> → 往{v < p ? "左" : "右"}走。
            </>
          }
        />,
      );
      await sleep(600);
    }
    if (found) {
      setOkV(v);
      setMsg(
        <T
          en={
            <>
              Found <b>{v}</b> after <b>{path.length}</b> comparisons. The tree
              holds {count} nodes, but only the {path.length} on this one path
              were read. That is <b>O(h)</b>.
            </>
          }
          zh={
            <>
              找到 <b>{v}</b>,一共比较 <b>{path.length}</b> 次。树里有 {count}{" "}
              个节点,却只看了这一条路径上的 {path.length} 个 —— 这就是{" "}
              <b>O(h)</b>。
            </>
          }
        />,
      );
    } else {
      setBadV(path[path.length - 1]);
      setMsg(
        <T
          en={
            <>
              At <b>{path[path.length - 1]}</b> the direction to take is empty.
              That is enough to prove <b>{v} is nowhere in the tree</b>: if it
              existed, it would have to sit on this path.
            </>
          }
          zh={
            <>
              在 <b>{path[path.length - 1]}</b> 处该拐的方向是空的 ——
              撞到空位就足以说明<b>整棵树都不可能有 {v}</b>
              (它若存在,必然住在这条路径上)。
            </>
          }
        />,
      );
    }
    setBusy(false);
  };

  const doWorst = async () => {
    if (busy) return;
    setBusy(true);
    clearMarks();
    setInput("");
    setRoot(null);
    setMsg(
      <T
        en="Cleared. Now inserting 1 → 2 → 3 → 4 → 5, that is, already sorted input…"
        zh="清空。现在按 1 → 2 → 3 → 4 → 5 的顺序插入(有序输入)…"
      />,
    );
    await sleep(700);
    let r: BN | null = null;
    let acc: number[] = [];
    for (let v = 1; v <= 5; v++) {
      r = attach(r, v);
      acc = [...acc, v];
      setRoot(cloneTree(r));
      setLit(acc.slice(0, -1));
      setBorn(v);
      setMsg(
        v === 1 ? (
          <T en={<>1 becomes the root.</>} zh={<>1 成为根。</>} />
        ) : (
          <T
            en={
              <>
                {v} is larger than <b>every</b> value already in the tree, so
                every step goes right. It lands at the bottom right.
              </>
            }
            zh={
              <>
                {v} 比树里<b>所有</b>值都大 → 每一步都往右拐,落在最右下角。
              </>
            }
          />
        ),
      );
      await sleep(560);
    }
    setLit([1, 2, 3, 4, 5]);
    setBorn(null);
    setMsg(
      <T
        en={
          <>
            <b>5 nodes, height 5.</b> The tree leaned over into a chain, and
            finding 5 now takes 5 comparisons. O(h) has become O(n), which is
            what a linked list costs. Sorted input is the worst case for a plain
            BST, and §05 is about fixing it.
          </>
        }
        zh={
          <>
            <b>5 个节点,高度 5</b> —— 树斜成了一条链,查 5 要比较 5 次。
            O(h) 变成了 O(n),和链表一样慢。有序输入是裸 BST 的最坏情况,
            这正是 §05 平衡树要解决的问题。
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
    setRoot(buildSample());
    setMsg(
      <T
        en="Back to the sample tree, which is perfectly balanced: 7 nodes, height 3."
        zh="回到示例树(完美平衡):7 个节点,高度只有 3。"
      />,
    );
  };

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="BST lab — insert, search, and grow a lopsided tree on purpose"
          zh="BST 实验室 —— 插入 / 查找 / 亲手养出一棵歪树"
        />
      </div>
      <div className="viz-stage">
        <svg
          viewBox={`0 0 ${W} ${height}`}
          className="bst-svg"
          role="img"
          aria-label={L({
            en: "Binary search tree visualization",
            zh: "二叉搜索树可视化",
          })}
        >
          {edges.map((e, i) => (
            <line key={i} className="bst-edge" x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />
          ))}
          {nodes.map((n) => (
            <g
              key={n.v}
              className={`bst-node${cls(n.v)}${born === n.v ? " bst-born" : ""}`}
            >
              <circle cx={n.x} cy={n.y} r={17} />
              <text x={n.x} y={n.y}>
                {n.v}
              </text>
            </g>
          ))}
          {count === 0 && (
            <text className="bst-empty" x={W / 2} y={48}>
              {L({ en: "(empty tree)", zh: "(空树)" })}
            </text>
          )}
        </svg>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <div className="viz-ctl">
        <input
          className="bst-input"
          value={input}
          inputMode="numeric"
          placeholder="0–99"
          disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") doInsert();
          }}
          aria-label={L({
            en: "Number to insert or search for",
            zh: "输入要插入或查找的数字",
          })}
        />
        <button type="button" className="btn btn-sm btn-primary" onClick={doInsert} disabled={busy}>
          <T en="Insert" zh="插入" />
        </button>
        <button type="button" className="btn btn-sm" onClick={doSearch} disabled={busy}>
          <T en="Search" zh="查找" />
        </button>
        <button type="button" className="btn btn-sm" onClick={doWorst} disabled={busy}>
          <T en="Insert 1→5 in order" zh="顺序插入 1→5(看退化)" />
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={doReset} disabled={busy}>
          <T en="Reset sample tree" zh="重置示例树" />
        </button>
        <span className="mono dim bst-stats">
          <T en="nodes" zh="节点" /> {count} · <T en="height" zh="高度" />{" "}
          {count === 0 ? 0 : depth + 1} · <T en="min height" zh="平衡下限" />{" "}
          ⌈log₂(n+1)⌉ = {Math.ceil(Math.log2(count + 1))}
        </span>
      </div>
    </div>
  );
}

/* ================= InorderFig:中序为什么升序 ================= */

const IN_VALUES = [
  { v: 50, d: 0 },
  { v: 30, d: 1 },
  { v: 70, d: 1 },
  { v: 20, d: 2 },
  { v: 40, d: 2 },
  { v: 60, d: 2 },
  { v: 80, d: 2 },
];
const IN_EDGES: [number, number][] = [
  [50, 30],
  [50, 70],
  [30, 20],
  [30, 40],
  [70, 60],
  [70, 80],
];

export function InorderFig() {
  const L = useL();
  // x = 中序位次 —— 这正是要展示的核心事实
  const order = [20, 30, 40, 50, 60, 70, 80];
  const X = (v: number) => 44 + order.indexOf(v) * 80;
  const Y = (d: number) => 38 + d * 66;
  const depth = new Map(IN_VALUES.map((n) => [n.v, n.d]));
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Why in-order traversal comes out sorted: project every node straight down"
          zh="为什么「中序遍历 = 升序」:把每个节点垂直投影到地面"
        />
      </div>
      <div className="viz-stage">
        <svg
          viewBox="0 0 610 330"
          className="bst-svg"
          role="img"
          aria-label={L({
            en: "A binary search tree projected down onto its sorted in-order sequence",
            zh: "二叉搜索树垂直投影成中序升序序列",
          })}
        >
          {IN_EDGES.map(([a, b], i) => (
            <line
              key={i}
              className="bst-edge"
              x1={X(a)}
              y1={Y(depth.get(a)!)}
              x2={X(b)}
              y2={Y(depth.get(b)!)}
            />
          ))}
          {IN_VALUES.map((n) => (
            <g key={n.v} className="bst-node">
              <circle cx={X(n.v)} cy={Y(n.d)} r={17} />
              <text x={X(n.v)} y={Y(n.d)}>
                {n.v}
              </text>
              <text className="bst-tag" x={X(n.v)} y={Y(n.d) + 32}>
                #{order.indexOf(n.v) + 1}
              </text>
            </g>
          ))}
          {/* 垂直投影虚线 */}
          {order.map((v) => (
            <line
              key={v}
              className="bst-proj"
              x1={X(v)}
              y1={Y(depth.get(v)!) + 24}
              x2={X(v)}
              y2={268}
            />
          ))}
          {/* 地面:升序数组 */}
          {order.map((v, i) => (
            <g key={v} className="bst-node ok">
              <rect x={X(v) - 20} y={270} width={40} height={36} rx={9} />
              <text x={X(v)} y={288}>
                {v}
              </text>
              <text className="bst-tag" x={X(v)} y={320}>
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
              &quot;left &lt; node &lt; right&quot; holds for the whole subtree,
              so <b>every</b> node of the left subtree is drawn left of its root
              and <b>every</b> node of the right subtree is drawn right of it.
              The horizontal position of a node is therefore its rank. In-order
              traversal (left → node → right) reads the nodes from left to
              right, so its output is sorted. This is not a coincidence; it
              follows directly from the rule.
            </>
          }
          zh={
            <>
              「左 &lt; 根 &lt; 右」对整棵子树成立 ⇒ 左子树<b>全体</b>
              画在根左边、右子树<b>全体</b>画在根右边 ⇒
              节点的水平位置就是它的排序位次。中序遍历(左 → 根 → 右)
              恰好从左到右逐个读过去,所以输出必然升序 ——
              这不是巧合,而是规矩的直接推论。
            </>
          }
        />
      </div>
    </div>
  );
}

/* ================= MiniTree:静态小树 ================= */

export interface MiniNode {
  id: number;
  v: ReactNode;
  x: number;
  y: number;
  state?: "lit" | "ok" | "bad" | "ghost" | "dim";
  tag?: Loc<string>;
}

export function MiniTree({
  nodes,
  edges,
  w = 280,
  h = 200,
  caption,
}: {
  nodes: MiniNode[];
  edges: [number, number][];
  w?: number;
  h?: number;
  caption?: ReactNode;
}) {
  const L = useL();
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return (
    <div className="bst-fig">
      <svg viewBox={`0 0 ${w} ${h}`} className="bst-svg" role="img">
        {edges.map(([a, b], i) => {
          const na = byId.get(a)!;
          const nb = byId.get(b)!;
          return (
            <line
              key={i}
              className={`bst-edge${nb.state === "ghost" || na.state === "ghost" ? " ghost" : ""}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
            />
          );
        })}
        {nodes.map((n) => (
          <g key={n.id} className={`bst-node${n.state ? ` ${n.state}` : ""}`}>
            <circle cx={n.x} cy={n.y} r={16} />
            <text x={n.x} y={n.y}>
              {n.v}
            </text>
            {n.tag && (
              <text className="bst-tag" x={n.x} y={n.y + 31}>
                {L(n.tag)}
              </text>
            )}
          </g>
        ))}
      </svg>
      {caption && <div className="bst-fig-cap">{caption}</div>}
    </div>
  );
}

/* ================= TreeStepper:通用树帧播放器 ================= */

export interface StepNode {
  id: number;
  v: ReactNode;
  x: number;
  y: number;
}

export interface TreeFrame {
  lit?: number[];
  ok?: number[];
  bad?: number[];
  dim?: number[];
  /** 节点下方的小标签(如上下界、计数) */
  tags?: Record<number, Loc<string>>;
  msg: Loc<ReactNode>;
}

export function TreeStepper({
  title,
  nodes,
  edges,
  frames,
  w = 620,
  h = 240,
}: {
  title: Loc<string>;
  nodes: StepNode[];
  edges: [number, number][];
  frames: TreeFrame[];
  w?: number;
  h?: number;
}) {
  const L = useL();
  const s = useStepper(frames.length);
  const f = frames[s.step];
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const cls = (id: number) => {
    if (f.bad?.includes(id)) return " bad";
    if (f.ok?.includes(id)) return " ok";
    if (f.lit?.includes(id)) return " lit";
    if (f.dim?.includes(id)) return " dim";
    return "";
  };
  return (
    <div className="viz">
      <div className="viz-title">{L(title)}</div>
      <div className="viz-stage">
        <svg viewBox={`0 0 ${w} ${h}`} className="bst-svg" role="img">
          {edges.map(([a, b], i) => {
            const na = byId.get(a)!;
            const nb = byId.get(b)!;
            return (
              <line key={i} className="bst-edge" x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} />
            );
          })}
          {nodes.map((n) => (
            <g key={n.id} className={`bst-node${cls(n.id)}`}>
              <circle cx={n.x} cy={n.y} r={17} />
              <text x={n.x} y={n.y}>
                {n.v}
              </text>
              {f.tags?.[n.id] && (
                <text className="bst-tag" x={n.x} y={n.y + 33}>
                  {L(f.tags[n.id])}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="viz-msg" aria-live="polite">
        {L(f.msg)}
      </div>
      <StepControls stepper={s} step={s.step} total={frames.length} />
    </div>
  );
}
