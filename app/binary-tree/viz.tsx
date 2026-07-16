"use client";

// 第 7 章 · 二叉树的可视化组件群:
//  - TermTree / FullVsComplete:§01 术语全图解、满 vs 完全对比(静态 SVG)。
//  - FactorialLab:§03 factorial(3) 调用栈逐帧(递归第一课)。
//  - RecurLab:§03 count(node) 数节点 —— 栈帧压弹 + 每节点返回值(核心)。
//  - TraverseLab:§04 前/中/后/层序四种遍历,节点点亮 + 输出序列 + 栈/队列。
//  - DepthLab / InvertLab / MirrorLab / LevelLab:§07 四道精讲的逐帧动画。

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================= 共享:SVG 树渲染 ================= */

type NodeState = "lit" | "ok" | "path" | "dim";

interface SvgNode {
  id: string;
  v: ReactNode;
  x: number;
  y: number;
  /** 父节点 id(用于画边) */
  p?: string;
}

function TreeSvg({
  nodes,
  w,
  h,
  state,
  ret,
  pos,
  extra,
}: {
  nodes: SvgNode[];
  w: number;
  h: number;
  /** 节点状态:lit 当前 / ok 已完成 / path 在递归路径上 / dim 淡出 */
  state?: Record<string, NodeState | undefined>;
  /** 节点下方的返回值标注(自底向上递归用) */
  ret?: Record<string, string | undefined>;
  /** 覆盖坐标(InvertLab 的交换动画用) */
  pos?: Record<string, [number, number] | undefined>;
  /** 附加 SVG 元素(辅助线、标签) */
  extra?: ReactNode;
}) {
  const at = (n: SvgNode): [number, number] => pos?.[n.id] ?? [n.x, n.y];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="bt-svg" style={{ maxWidth: w }} aria-hidden>
      {extra}
      {nodes
        .filter((n) => n.p)
        .map((n) => {
          const [x2, y2] = at(n);
          const [x1, y1] = at(byId.get(n.p!)!);
          return <line key={`e-${n.id}`} x1={x1} y1={y1} x2={x2} y2={y2} className="bt-edge" />;
        })}
      {nodes.map((n) => {
        const [x, y] = at(n);
        const st = state?.[n.id];
        return (
          <g
            key={n.id}
            className={`bt-nd${st ? ` ${st}` : ""}`}
            style={{
              transform: `translate(${x}px, ${y}px)`,
              transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <circle r={20} />
            <text dy={5} textAnchor="middle">
              {n.v}
            </text>
            {ret?.[n.id] != null && (
              <text dy={38} textAnchor="middle" className="bt-retv">
                {ret[n.id]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ================= TermTree:术语全图解 ================= */

const TERM_NODES: SvgNode[] = [
  { id: "A", v: "A", x: 320, y: 52 },
  { id: "B", v: "B", x: 180, y: 142, p: "A" },
  { id: "C", v: "C", x: 460, y: 142, p: "A" },
  { id: "D", v: "D", x: 100, y: 232, p: "B" },
  { id: "E", v: "E", x: 260, y: 232, p: "B" },
  { id: "F", v: "F", x: 520, y: 232, p: "C" },
];

export function TermTree() {
  return (
    <div className="viz">
      <div className="viz-title">一棵二叉树的「家谱称呼」全图</div>
      <div className="viz-stage">
        <TreeSvg
          nodes={TERM_NODES}
          w={640}
          h={290}
          state={{ A: "lit" }}
          extra={
            <>
              {/* 层参考线 */}
              <line x1={30} y1={52} x2={610} y2={52} className="bt-guide" />
              <line x1={30} y1={142} x2={610} y2={142} className="bt-guide" />
              <line x1={30} y1={232} x2={610} y2={232} className="bt-guide" />
              <text x={34} y={40} className="bt-lab">
                第 1 层 · 深度 0
              </text>
              <text x={34} y={130} className="bt-lab">
                第 2 层 · 深度 1
              </text>
              <text x={34} y={220} className="bt-lab">
                第 3 层 · 深度 2
              </text>
              {/* 称呼标注 */}
              <text x={320} y={16} textAnchor="middle" className="bt-lab acc">
                根 root(没有父节点的那个)
              </text>
              <text x={320} y={150} textAnchor="middle" className="bt-lab">
                B、C 互为兄弟 sibling
              </text>
              <text x={244} y={88} textAnchor="middle" className="bt-lab">
                A 是 B 的父,B 是 A 的子
              </text>
              <text x={180} y={278} textAnchor="middle" className="bt-lab acc">
                D、E、F:叶子 leaf(没有孩子)
              </text>
              <text x={520} y={170} textAnchor="middle" className="bt-lab">
                C 只有右孩子,左边为空
              </text>
            </>
          }
        />
      </div>
      <div className="viz-msg">
        深度 depth:从<b>根</b>到我要走几条边(向下数);高度 height:从我到最远的
        <b>叶子</b>要走几条边(向上数)。整棵树的高度 = 根的高度 = 这里的 <b>2</b>。
      </div>
    </div>
  );
}

/* ================= FullVsComplete:满 vs 完全 ================= */

function MiniTree({ missing }: { missing: number[] }) {
  const slots: { n: number; x: number; y: number; p?: number }[] = [
    { n: 1, x: 150, y: 32 },
    { n: 2, x: 78, y: 100, p: 1 },
    { n: 3, x: 222, y: 100, p: 1 },
    { n: 4, x: 42, y: 168, p: 2 },
    { n: 5, x: 114, y: 168, p: 2 },
    { n: 6, x: 186, y: 168, p: 3 },
    { n: 7, x: 258, y: 168, p: 3 },
  ];
  const has = (n: number) => !missing.includes(n);
  const byN = new Map(slots.map((s) => [s.n, s]));
  return (
    <svg viewBox="0 0 300 220" className="bt-svg" style={{ maxWidth: 300 }} aria-hidden>
      {slots
        .filter((s) => s.p && has(s.n))
        .map((s) => {
          const p = byN.get(s.p!)!;
          return <line key={s.n} x1={p.x} y1={p.y} x2={s.x} y2={s.y} className="bt-edge" />;
        })}
      {slots.map((s) =>
        has(s.n) ? (
          <g key={s.n} className="bt-nd" style={{ transform: `translate(${s.x}px, ${s.y}px)` }}>
            <circle r={17} />
            <text dy={4.5} textAnchor="middle" style={{ fontSize: 13 }}>
              {s.n}
            </text>
            <text dy={34} textAnchor="middle" className="bt-lab">
              [{s.n - 1}]
            </text>
          </g>
        ) : (
          <g key={s.n} className="bt-nd dim" style={{ transform: `translate(${s.x}px, ${s.y}px)` }}>
            <circle r={17} strokeDasharray="4 4" fill="none" />
            <text dy={4.5} textAnchor="middle" style={{ fontSize: 11 }}>
              空
            </text>
          </g>
        ),
      )}
    </svg>
  );
}

export function FullVsComplete() {
  return (
    <div className="grid-2" style={{ marginTop: 18 }}>
      <div className="card">
        <div className="card-kicker">形态一</div>
        <div className="card-title">满二叉树 perfect</div>
        <MiniTree missing={[]} />
        <p>
          每一层都<b>塞满</b>:h 层共 2<sup>h</sup>−1 个节点。按层编号 1~7,
          节点 i 的孩子恰好是 2i 和 2i+1 —— 位置全靠算。
        </p>
      </div>
      <div className="card">
        <div className="card-kicker">形态二</div>
        <div className="card-title">完全二叉树 complete</div>
        <MiniTree missing={[7]} />
        <p>
          只允许<b>最后一层缺,且缺口全在右边</b>。编号依旧连续无空洞 ——
          所以它能无浪费地铺进数组(下标见节点下方)。第 9 章的堆,
          就靠这个性质活着。
        </p>
      </div>
    </div>
  );
}

/* ================= FactorialLab:递归第一课 ================= */

interface StackItem {
  name: string;
  note: string;
  lit?: boolean;
}

interface FacFrame {
  stack: StackItem[];
  msg: ReactNode;
}

const FAC_FRAMES: FacFrame[] = [
  {
    stack: [{ name: "factorial(3)", note: "3 × factorial(2) = ?", lit: true }],
    msg: (
      <>
        调用 factorial(3):n=3 不是终止条件,它需要 factorial(2)
        的结果才能算下去 —— 于是自己「冻结」在栈里,等答案。
      </>
    ),
  },
  {
    stack: [
      { name: "factorial(3)", note: "等 factorial(2)…" },
      { name: "factorial(2)", note: "2 × factorial(1) = ?", lit: true },
    ],
    msg: (
      <>
        factorial(2) 同样卡在 factorial(1) 上,再压一帧。
        每个栈帧独立记着自己的 n 和「算到哪了」—— 互不干扰。
      </>
    ),
  },
  {
    stack: [
      { name: "factorial(3)", note: "等 factorial(2)…" },
      { name: "factorial(2)", note: "等 factorial(1)…" },
      { name: "factorial(1)", note: "n = 1 → 直接返回 1", lit: true },
    ],
    msg: (
      <>
        factorial(1):命中<b>终止条件</b>!不再往下调,直接返回 1 ——
        下潜到此为止。栈的高度 3,就是递归的深度。
      </>
    ),
  },
  {
    stack: [
      { name: "factorial(3)", note: "等 factorial(2)…" },
      { name: "factorial(2)", note: "解冻:2 × 1 = 2 ✓", lit: true },
    ],
    msg: (
      <>
        f(1) 弹栈,把 1 交回 f(2)。f(2) 从冻结处「解冻」:2 × 1 = 2,
        算完,轮到它弹栈。
      </>
    ),
  },
  {
    stack: [{ name: "factorial(3)", note: "解冻:3 × 2 = 6 ✓", lit: true }],
    msg: <>f(2) 弹栈,把 2 交回 f(3):3 × 2 = 6。</>,
  },
  {
    stack: [],
    msg: (
      <>
        f(3) 弹栈,栈空,最终答案 <b>6</b>。全程一句话:
        <b>去的时候一路压栈,回的时候一路带答案</b> —— 所有递归都是这个节奏。
      </>
    ),
  },
];

export function FactorialLab() {
  const s = useStepper(FAC_FRAMES.length, 1500);
  const f = FAC_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">factorial(3) 的调用栈 —— 递归的呼吸:压栈、弹栈</div>
      <div className="viz-stage">
        <div className="bt-stackcol">
          <div className="bt-stackcap">调用栈(上 = 栈顶,最先返回)</div>
          {f.stack.length === 0 ? (
            <div className="bt-stackempty">栈空 —— 递归结束,答案 6</div>
          ) : (
            [...f.stack].reverse().map((it) => (
              <div key={it.name} className={`bt-frame${it.lit ? " lit" : ""}`}>
                <span>{it.name}</span>
                <span className={it.note.includes("✓") ? "r" : ""}>{it.note}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={FAC_FRAMES.length} />
    </div>
  );
}

/* ================= RecurLab:count(node) ================= */

const R_NODES: SvgNode[] = [
  { id: "A", v: "A", x: 230, y: 40 },
  { id: "B", v: "B", x: 120, y: 124, p: "A" },
  { id: "C", v: "C", x: 340, y: 124, p: "A" },
  { id: "D", v: "D", x: 60, y: 208, p: "B" },
  { id: "E", v: "E", x: 180, y: 208, p: "B" },
  { id: "F", v: "F", x: 280, y: 208, p: "C" },
  { id: "G", v: "G", x: 400, y: 208, p: "C" },
];

interface RFrame {
  state: Record<string, NodeState | undefined>;
  ret: Record<string, string | undefined>;
  stack: string[];
  msg: ReactNode;
}

const R_FRAMES: RFrame[] = [
  {
    state: { A: "lit" },
    ret: {},
    stack: ["count(A)"],
    msg: (
      <>
        目标:数出这棵树有几个节点。信念:<b>count(节点) = 1 + count(左) +
        count(右)</b>,count(空) = 0。先调用 count(A)。
      </>
    ),
  },
  {
    state: { A: "path", B: "lit" },
    ret: {},
    stack: ["count(A)", "count(B)"],
    msg: (
      <>
        count(A) 要「1 + count(B) + count(C)」—— 先算 count(B)。
        A 的帧冻结在栈底,压入 count(B)。
      </>
    ),
  },
  {
    state: { A: "path", B: "path", D: "lit" },
    ret: {},
    stack: ["count(A)", "count(B)", "count(D)"],
    msg: <>count(B) 也先要左边:压入 count(D)。栈越来越高 —— 每帧记着自己算到哪。</>,
  },
  {
    state: { A: "path", B: "lit", D: "ok" },
    ret: { D: "=1" },
    stack: ["count(A)", "count(B)"],
    msg: (
      <>
        D 的左右孩子都是 null → count(null) = 0(<b>终止条件</b>)。
        count(D) = 1 + 0 + 0 = <b>1</b>,弹栈,把 1 交给 B。
      </>
    ),
  },
  {
    state: { A: "path", B: "path", D: "ok", E: "lit" },
    ret: { D: "=1" },
    stack: ["count(A)", "count(B)", "count(E)"],
    msg: <>B 左边的答案(1)到手,还差右边:压入 count(E)。</>,
  },
  {
    state: { A: "path", B: "lit", D: "ok", E: "ok" },
    ret: { D: "=1", E: "=1" },
    stack: ["count(A)", "count(B)"],
    msg: <>E 也是叶子:1 + 0 + 0 = <b>1</b>,弹栈交给 B。</>,
  },
  {
    state: { A: "lit", B: "ok", D: "ok", E: "ok" },
    ret: { D: "=1", E: "=1", B: "=3" },
    stack: ["count(A)"],
    msg: (
      <>
        B 集齐了:count(B) = 1 + 1 + 1 = <b>3</b>。弹栈,把 3 交给 A ——
        A 的左半边完工。
      </>
    ),
  },
  {
    state: { A: "path", B: "ok", D: "ok", E: "ok", C: "lit" },
    ret: { D: "=1", E: "=1", B: "=3" },
    stack: ["count(A)", "count(C)"],
    msg: (
      <>
        A 转头要右边:压入 count(C)。注意:我们从没「同时」算两棵子树 ——
        调用栈一次只走一条路径,这就是空间 O(h) 的原因。
      </>
    ),
  },
  {
    state: { A: "path", B: "ok", D: "ok", E: "ok", C: "path", F: "lit" },
    ret: { D: "=1", E: "=1", B: "=3" },
    stack: ["count(A)", "count(C)", "count(F)"],
    msg: <>count(C) 先要左边:压入 count(F)。</>,
  },
  {
    state: { A: "path", B: "ok", D: "ok", E: "ok", C: "lit", F: "ok" },
    ret: { D: "=1", E: "=1", B: "=3", F: "=1" },
    stack: ["count(A)", "count(C)"],
    msg: <>F 是叶子 → <b>1</b>,弹栈交给 C。</>,
  },
  {
    state: { A: "path", B: "ok", D: "ok", E: "ok", C: "path", F: "ok", G: "lit" },
    ret: { D: "=1", E: "=1", B: "=3", F: "=1" },
    stack: ["count(A)", "count(C)", "count(G)"],
    msg: <>C 再要右边:压入 count(G)。</>,
  },
  {
    state: { A: "path", B: "ok", D: "ok", E: "ok", C: "lit", F: "ok", G: "ok" },
    ret: { D: "=1", E: "=1", B: "=3", F: "=1", G: "=1" },
    stack: ["count(A)", "count(C)"],
    msg: <>G → <b>1</b>,弹栈。</>,
  },
  {
    state: { A: "lit", B: "ok", D: "ok", E: "ok", C: "ok", F: "ok", G: "ok" },
    ret: { D: "=1", E: "=1", B: "=3", F: "=1", G: "=1", C: "=3" },
    stack: ["count(A)"],
    msg: <>count(C) = 1 + 1 + 1 = <b>3</b>,弹栈交给 A。</>,
  },
  {
    state: { A: "ok", B: "ok", D: "ok", E: "ok", C: "ok", F: "ok", G: "ok" },
    ret: { D: "=1", E: "=1", B: "=3", F: "=1", G: "=1", C: "=3", A: "=7" },
    stack: [],
    msg: (
      <>
        count(A) = 1 + 3 + 3 = <b>7</b>。栈清空,答案 7。复盘:每个节点恰好被
        访问一次 → 时间 <b>O(n)</b>;栈最高时 = 树的高度 → 空间 <b>O(h)</b>。
      </>
    ),
  },
];

export function RecurLab() {
  const s = useStepper(R_FRAMES.length, 1600);
  const f = R_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">递归实验室 —— count(node):树上第一次递归,逐帧慢放</div>
      <div className="viz-stage">
        <div className="bt-stackwrap">
          <div style={{ flex: "1 1 300px", maxWidth: 460 }}>
            <TreeSvg nodes={R_NODES} w={460} h={256} state={f.state} ret={f.ret} />
          </div>
          <div className="bt-stackcol">
            <div className="bt-stackcap">调用栈(上 = 栈顶)</div>
            {f.stack.length === 0 ? (
              <div className="bt-stackempty">栈空 —— 答案 7</div>
            ) : (
              [...f.stack].reverse().map((name, i) => (
                <div key={name} className={`bt-frame${i === 0 ? " lit" : ""}`}>
                  <span>{name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={R_FRAMES.length} />
    </div>
  );
}

/* ================= TraverseLab:四种遍历 ================= */

interface T7Node extends SvgNode {
  n: number;
  l?: string;
  r?: string;
}

const T7: T7Node[] = [
  { id: "1", v: 1, n: 1, x: 230, y: 40, l: "2", r: "3" },
  { id: "2", v: 2, n: 2, x: 120, y: 124, p: "1", l: "4", r: "5" },
  { id: "3", v: 3, n: 3, x: 340, y: 124, p: "1", l: "6", r: "7" },
  { id: "4", v: 4, n: 4, x: 60, y: 208, p: "2" },
  { id: "5", v: 5, n: 5, x: 180, y: 208, p: "2" },
  { id: "6", v: 6, n: 6, x: 280, y: 208, p: "3" },
  { id: "7", v: 7, n: 7, x: 400, y: 208, p: "3" },
];
const T7M = new Map(T7.map((n) => [n.id, n]));

interface TravFrame {
  state: Record<string, NodeState | undefined>;
  out: number[];
  aux: string[];
  msg: ReactNode;
}

type Order = "pre" | "in" | "post" | "level";

const ORDER_LABEL: Record<Order, string> = {
  pre: "前序(根→左→右)",
  in: "中序(左→根→右)",
  post: "后序(左→右→根)",
  level: "层序(一层一层)",
};

function buildDfsFrames(order: Exclude<Order, "level">): TravFrame[] {
  const frames: TravFrame[] = [];
  const out: number[] = [];
  const done = new Set<string>();

  frames.push({
    state: {},
    out: [],
    aux: [],
    msg: (
      <>
        {ORDER_LABEL[order]}:三种 DFS 走的<b>路线一模一样</b>,
        差别只是「在哪个时刻输出根」。点「下一步」开走。
      </>
    ),
  });

  const snap = (cur: string, path: string[], msg: ReactNode) => {
    const state: Record<string, NodeState | undefined> = {};
    done.forEach((d) => (state[d] = "ok"));
    path.forEach((p) => {
      if (!state[p]) state[p] = "path";
    });
    state[cur] = "lit";
    frames.push({
      state,
      out: [...out],
      aux: path.map((id) => `visit(${T7M.get(id)!.n})`),
      msg,
    });
  };

  const go = (id: string | undefined, path: string[]) => {
    if (!id) return;
    const node = T7M.get(id)!;
    const p2 = [...path, id];
    const leaf = !node.l && !node.r;
    if (order === "pre") {
      out.push(node.n);
      snap(
        id,
        p2,
        leaf ? (
          <>
            叶子 <b>{node.n}</b>:一进门就输出;它的左右都是空树,直接返回。
          </>
        ) : (
          <>
            进入 <b>{node.n}</b>:前序<b>一进门就输出根</b>,然后才去左、右子树。
          </>
        ),
      );
      done.add(id);
    }
    go(node.l, p2);
    if (order === "in") {
      out.push(node.n);
      snap(
        id,
        p2,
        leaf ? (
          <>
            叶子 <b>{node.n}</b>:左子树是空树(也算「走完了」),输出它自己,再看右边(也空)。
          </>
        ) : (
          <>
            节点 <b>{node.n}</b> 的左子树全部走完 —— 中序<b>此刻</b>输出根,再去右子树。
          </>
        ),
      );
      done.add(id);
    }
    go(node.r, p2);
    if (order === "post") {
      out.push(node.n);
      snap(
        id,
        p2,
        leaf ? (
          <>
            叶子 <b>{node.n}</b>:左右(空树)都清完了,输出它自己。
          </>
        ) : (
          <>
            节点 <b>{node.n}</b> 的左右子树<b>都</b>处理完了 —— 后序最后才输出根。
          </>
        ),
      );
      done.add(id);
    }
  };

  go("1", []);

  const allOk: Record<string, NodeState | undefined> = {};
  T7.forEach((n) => (allOk[n.id] = "ok"));
  frames.push({
    state: allOk,
    out: [...out],
    aux: [],
    msg: (
      <>
        完成!{ORDER_LABEL[order]}序列:[{out.join(", ")}]。递归栈最深到过 3 层
        —— 恰好是树高 + 1。
      </>
    ),
  });
  return frames;
}

function buildBfsFrames(): TravFrame[] {
  const frames: TravFrame[] = [];
  const out: number[] = [];
  const done = new Set<string>();
  const q: string[] = ["1"];

  frames.push({
    state: {},
    out: [],
    aux: ["1"],
    msg: (
      <>
        层序(BFS):根 1 入队。规则只有一条:<b>出队一个、输出、把它的孩子塞到队尾</b>。
        先进先出保证一层处理完才轮到下一层。
      </>
    ),
  });

  while (q.length > 0) {
    const id = q.shift()!;
    const node = T7M.get(id)!;
    out.push(node.n);
    const kids = [node.l, node.r].filter(Boolean) as string[];
    q.push(...kids);
    const state: Record<string, NodeState | undefined> = {};
    done.forEach((d) => (state[d] = "ok"));
    state[id] = "lit";
    frames.push({
      state,
      out: [...out],
      aux: q.map((i) => String(T7M.get(i)!.n)),
      msg:
        kids.length > 0 ? (
          <>
            出队 <b>{node.n}</b>,输出;孩子 {kids.map((k) => T7M.get(k)!.n).join("、")}{" "}
            入队排到队尾。
          </>
        ) : (
          <>
            出队 <b>{node.n}</b>(叶子,没有孩子可入队)。
          </>
        ),
    });
    done.add(id);
  }

  const allOk: Record<string, NodeState | undefined> = {};
  T7.forEach((n) => (allOk[n.id] = "ok"));
  frames.push({
    state: allOk,
    out: [...out],
    aux: [],
    msg: (
      <>
        队列空,遍历结束:[{out.join(", ")}] —— 正好一层一层、从左到右。
        队列最长时装下了一整层(4 个)→ 空间 O(w),w 是最宽层的宽度。
      </>
    ),
  });
  return frames;
}

const TRAV_FRAMES: Record<Order, TravFrame[]> = {
  pre: buildDfsFrames("pre"),
  in: buildDfsFrames("in"),
  post: buildDfsFrames("post"),
  level: buildBfsFrames(),
};

function TravPlayer({ frames, auxLabel }: { frames: TravFrame[]; auxLabel: string }) {
  const s = useStepper(frames.length, 1400);
  const f = frames[s.step];
  return (
    <>
      <div className="viz-stage bt-stage-col">
        <TreeSvg nodes={T7} w={460} h={246} state={f.state} />
        <div className="bt-strip">
          <span className="bt-strip-label">输出</span>
          {f.out.length === 0 ? (
            <span className="dim" style={{ fontSize: 12 }}>
              —
            </span>
          ) : (
            f.out.map((v, i) => (
              <span key={i} className="bt-outchip">
                {v}
              </span>
            ))
          )}
        </div>
        <div className="bt-strip">
          <span className="bt-strip-label">{auxLabel}</span>
          {f.aux.length === 0 ? (
            <span className="dim" style={{ fontSize: 12 }}>
              空
            </span>
          ) : (
            f.aux.map((v, i) => (
              <span
                key={i}
                className={`bt-auxchip${
                  auxLabel === "递归栈" && i === f.aux.length - 1 ? " top" : ""
                }${auxLabel === "队列" && i === 0 ? " top" : ""}`}
              >
                {v}
              </span>
            ))
          )}
          {f.aux.length > 0 && (
            <span className="dim" style={{ fontSize: 11 }}>
              {auxLabel === "递归栈" ? "← 右端是栈顶" : "← 左端是队首"}
            </span>
          )}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={frames.length} />
    </>
  );
}

export function TraverseLab() {
  const [order, setOrder] = useState<Order>("pre");
  return (
    <div className="viz">
      <div className="viz-title">
        遍历实验室 —— 同一棵树,四种走法
        <span className="seg" style={{ marginLeft: "auto" }}>
          {(["pre", "in", "post", "level"] as Order[]).map((o) => (
            <button
              key={o}
              type="button"
              className={`seg-btn${order === o ? " on" : ""}`}
              onClick={() => setOrder(o)}
            >
              {{ pre: "前序", in: "中序", post: "后序", level: "层序" }[o]}
            </button>
          ))}
        </span>
      </div>
      <TravPlayer
        key={order}
        frames={TRAV_FRAMES[order]}
        auxLabel={order === "level" ? "队列" : "递归栈"}
      />
    </div>
  );
}

/* ================= DepthLab:LC 104 ================= */

const D_NODES: SvgNode[] = [
  { id: "3", v: 3, x: 230, y: 40 },
  { id: "9", v: 9, x: 120, y: 124, p: "3" },
  { id: "20", v: 20, x: 340, y: 124, p: "3" },
  { id: "15", v: 15, x: 280, y: 208, p: "20" },
  { id: "7", v: 7, x: 400, y: 208, p: "20" },
];

interface DFrame {
  state: Record<string, NodeState | undefined>;
  ret: Record<string, string | undefined>;
  msg: ReactNode;
}

const D_FRAMES: DFrame[] = [
  {
    state: { "3": "lit" },
    ret: {},
    msg: (
      <>
        maxDepth(node) = <b>1 + max(左边的答案, 右边的答案)</b>,空树 = 0。
        对树 [3,9,20,null,null,15,7] 发问。
      </>
    ),
  },
  {
    state: { "3": "path", "9": "lit" },
    ret: {},
    msg: <>先问左边:maxDepth(9)。</>,
  },
  {
    state: { "3": "lit", "9": "ok" },
    ret: { "9": "↑1" },
    msg: (
      <>
        9 是叶子:左右都是空树(各报 0)→ 1 + max(0, 0) = <b>1</b>,把 1 报给父亲。
      </>
    ),
  },
  {
    state: { "3": "path", "9": "ok", "20": "lit" },
    ret: { "9": "↑1" },
    msg: <>再问右边:maxDepth(20) —— 它自己也是「1 + max(左, 右)」,继续往下问。</>,
  },
  {
    state: { "3": "path", "9": "ok", "20": "path", "15": "lit" },
    ret: { "9": "↑1" },
    msg: <>maxDepth(15):叶子 → 报 <b>1</b>。</>,
  },
  {
    state: { "3": "path", "9": "ok", "20": "path", "15": "ok", "7": "lit" },
    ret: { "9": "↑1", "15": "↑1" },
    msg: <>maxDepth(7):叶子 → 也报 <b>1</b>。</>,
  },
  {
    state: { "3": "path", "9": "ok", "20": "lit", "15": "ok", "7": "ok" },
    ret: { "9": "↑1", "15": "↑1", "7": "↑1" },
    msg: (
      <>
        20 收齐两边:1 + max(1, 1) = <b>2</b>,上报 2。
      </>
    ),
  },
  {
    state: { "3": "ok", "9": "ok", "20": "ok", "15": "ok", "7": "ok" },
    ret: { "9": "↑1", "15": "↑1", "7": "↑1", "20": "↑2", "3": "=3" },
    msg: (
      <>
        根收齐:1 + max(1, 2) = <b>3</b>。答案是从叶子一层层「长」上来的,
        不是从根「数」下去的 —— 这就是自底向上。O(n) 时间,O(h) 栈空间。
      </>
    ),
  },
];

export function DepthLab() {
  const s = useStepper(D_FRAMES.length, 1500);
  const f = D_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">LC 104 · 最大深度 —— 返回值自底向上,逐帧</div>
      <div className="viz-stage">
        <TreeSvg nodes={D_NODES} w={460} h={256} state={f.state} ret={f.ret} />
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={D_FRAMES.length} />
    </div>
  );
}

/* ================= InvertLab:LC 226 ================= */

const I_NODES: SvgNode[] = [
  { id: "n4", v: 4, x: 230, y: 40 },
  { id: "n2", v: 2, x: 120, y: 124, p: "n4" },
  { id: "n7", v: 7, x: 340, y: 124, p: "n4" },
  { id: "n1", v: 1, x: 60, y: 208, p: "n2" },
  { id: "n3", v: 3, x: 180, y: 208, p: "n2" },
  { id: "n6", v: 6, x: 280, y: 208, p: "n7" },
  { id: "n9", v: 9, x: 400, y: 208, p: "n7" },
];

type Pos = Record<string, [number, number] | undefined>;

// P1:根的两棵子树整体互换;P2:再换 7 的孩子;P3:再换 2 的孩子
const P1: Pos = {
  n2: [340, 124],
  n7: [120, 124],
  n1: [280, 208],
  n3: [400, 208],
  n6: [60, 208],
  n9: [180, 208],
};
const P2: Pos = { ...P1, n6: [180, 208], n9: [60, 208] };
const P3: Pos = { ...P2, n1: [400, 208], n3: [280, 208] };

interface IFrame {
  pos: Pos;
  state: Record<string, NodeState | undefined>;
  msg: ReactNode;
}

const I_FRAMES: IFrame[] = [
  {
    pos: {},
    state: { n4: "lit" },
    msg: (
      <>
        目标:每个节点的左右孩子互换(整树镜像)。递归策略:
        <b>交换根的两个孩子,然后信任递归去翻两棵子树</b>。
      </>
    ),
  },
  {
    pos: P1,
    state: { n4: "ok" },
    msg: (
      <>
        第一步:交换根 4 的左右孩子 —— 注意是<b>整棵子树连锅端</b>
        (交换的是两个引用),子树内部先不管,那是递归的活。
      </>
    ),
  },
  {
    pos: P2,
    state: { n4: "ok", n7: "lit" },
    msg: <>递归进入(现在的)左孩子 7:交换它的孩子 6、9。</>,
  },
  {
    pos: P3,
    state: { n4: "ok", n7: "ok", n2: "lit" },
    msg: <>递归进入右孩子 2:交换 1、3。</>,
  },
  {
    pos: P3,
    state: {
      n4: "ok",
      n2: "ok",
      n7: "ok",
      n1: "ok",
      n3: "ok",
      n6: "ok",
      n9: "ok",
    },
    msg: (
      <>
        叶子没有孩子,invert(null) 直接返回 —— 完成!新树层序
        [4, 7, 2, 9, 6, 3, 1],处处是原树的镜像。每个节点交换一次:<b>O(n)</b>。
      </>
    ),
  },
];

export function InvertLab() {
  const s = useStepper(I_FRAMES.length, 1600);
  const f = I_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">LC 226 · 翻转二叉树 —— 交换引用,子树连锅端</div>
      <div className="viz-stage">
        <TreeSvg nodes={I_NODES} w={460} h={246} state={f.state} pos={f.pos} />
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={I_FRAMES.length} />
    </div>
  );
}

/* ================= MirrorLab:LC 101 ================= */

const M_NODES: SvgNode[] = [
  { id: "a", v: 1, x: 230, y: 40 },
  { id: "b", v: 2, x: 120, y: 124, p: "a" },
  { id: "c", v: 2, x: 340, y: 124, p: "a" },
  { id: "d", v: 3, x: 60, y: 208, p: "b" },
  { id: "e", v: 4, x: 180, y: 208, p: "b" },
  { id: "f", v: 4, x: 280, y: 208, p: "c" },
  { id: "g", v: 3, x: 400, y: 208, p: "c" },
];

interface MFrame {
  state: Record<string, NodeState | undefined>;
  stack: string[];
  msg: ReactNode;
}

const M_FRAMES: MFrame[] = [
  {
    state: {},
    stack: [],
    msg: (
      <>
        对称 = <b>左子树和右子树互为镜像</b>。单指针没法比「两棵」子树,
        所以定义双参数函数 check(L, R),两边同步走镜像路线。
      </>
    ),
  },
  {
    state: { a: "path", b: "lit", c: "lit" },
    stack: ["check(2, 2)"],
    msg: (
      <>
        check(左 2, 右 2):值相等 ✓。接下来两组镜像比较:
        <b>L 的左 vs R 的右</b>(外侧对外侧)、<b>L 的右 vs R 的左</b>(内侧对内侧)。
      </>
    ),
  },
  {
    state: { a: "path", b: "path", c: "path", d: "lit", g: "lit" },
    stack: ["check(2, 2)", "check(3, 3)"],
    msg: <>外侧一组:3 vs 3,值相等 ✓,压栈继续查它们的孩子。</>,
  },
  {
    state: { a: "path", b: "path", c: "path", d: "ok", g: "ok" },
    stack: ["check(2, 2)"],
    msg: (
      <>
        两个 3 的孩子全是 null:check(null, null) = <b>true</b>(两边都空,镜像成立)
        —— 外侧通过,弹栈。
      </>
    ),
  },
  {
    state: { a: "path", b: "path", c: "path", d: "ok", g: "ok", e: "lit", f: "lit" },
    stack: ["check(2, 2)", "check(4, 4)"],
    msg: <>内侧一组:4 vs 4 ✓,孩子也全空 → true,弹栈。</>,
  },
  {
    state: { a: "ok", b: "ok", c: "ok", d: "ok", e: "ok", f: "ok", g: "ok" },
    stack: [],
    msg: (
      <>
        check(2,2) 收到外侧、内侧两个 true → 上报 true:<b>这棵树对称</b>。
        任何一步「值不等」或「一空一不空」,false 都会一路冒泡到顶。O(n)。
      </>
    ),
  },
];

export function MirrorLab() {
  const s = useStepper(M_FRAMES.length, 1600);
  const f = M_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">LC 101 · 对称二叉树 —— 镜像双指针,逐帧</div>
      <div className="viz-stage">
        <div className="bt-stackwrap">
          <div style={{ flex: "1 1 300px", maxWidth: 460 }}>
            <TreeSvg nodes={M_NODES} w={460} h={246} state={f.state} />
          </div>
          <div className="bt-stackcol">
            <div className="bt-stackcap">递归栈(上 = 栈顶)</div>
            {f.stack.length === 0 ? (
              <div className="bt-stackempty">栈空</div>
            ) : (
              [...f.stack].reverse().map((name, i) => (
                <div key={name} className={`bt-frame${i === 0 ? " lit" : ""}`}>
                  <span>{name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={M_FRAMES.length} />
    </div>
  );
}

/* ================= LevelLab:LC 102 ================= */

interface LFrame {
  state: Record<string, NodeState | undefined>;
  queue: string[];
  levels: number[][];
  cur: number[];
  msg: ReactNode;
}

const L_FRAMES: LFrame[] = [
  {
    state: {},
    queue: ["3"],
    levels: [],
    cur: [],
    msg: (
      <>
        队列放入根 3。想要「一层一个数组」,诀窍只有一个:
        <b>每层开始前,先记下当前队列长度 size</b> —— 本轮只出队 size 个。
      </>
    ),
  },
  {
    state: { "3": "lit" },
    queue: ["9", "20"],
    levels: [[3]],
    cur: [],
    msg: (
      <>
        第 1 层:size = 1。出队 3 → 收进本层;孩子 9、20 入队。
        本层 1 个处理完 → 第 1 层 = [3] 收工。
      </>
    ),
  },
  {
    state: { "3": "ok", "9": "lit" },
    queue: ["20"],
    levels: [[3]],
    cur: [9],
    msg: (
      <>
        第 2 层:size = <b>2</b>(先记!之后入队的孩子不算这层)。
        出队 9:叶子,没孩子入队。
      </>
    ),
  },
  {
    state: { "3": "ok", "9": "ok", "20": "lit" },
    queue: ["15", "7"],
    levels: [[3], [9, 20]],
    cur: [],
    msg: (
      <>
        出队 20 → 孩子 15、7 入队。本层 2 个处理完 → 第 2 层 = [9, 20]。
        看:15、7 虽已在队里,但因为 size 早就定死为 2,它们只能等下一轮。
      </>
    ),
  },
  {
    state: { "3": "ok", "9": "ok", "20": "ok", "15": "lit" },
    queue: ["7"],
    levels: [[3], [9, 20]],
    cur: [15],
    msg: <>第 3 层:size = 2。出队 15(叶子)。</>,
  },
  {
    state: { "3": "ok", "9": "ok", "20": "ok", "15": "ok", "7": "lit" },
    queue: [],
    levels: [[3], [9, 20], [15, 7]],
    cur: [],
    msg: <>出队 7。队列空 → 循环结束。</>,
  },
  {
    state: { "3": "ok", "9": "ok", "20": "ok", "15": "ok", "7": "ok" },
    queue: [],
    levels: [[3], [9, 20], [15, 7]],
    cur: [],
    msg: (
      <>
        结果 [[3], [9, 20], [15, 7]]。没有「先记 size」这一步,队列只会给你
        一维序列,层与层的边界就糊掉了 —— 这一招是所有「按层处理」题的万能钥匙。
      </>
    ),
  },
];

export function LevelLab() {
  const s = useStepper(L_FRAMES.length, 1600);
  const f = L_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">LC 102 · 层序遍历 —— 队列 + 先记 size,逐帧</div>
      <div className="viz-stage">
        <div className="bt-stackwrap">
          <div style={{ flex: "1 1 300px", maxWidth: 460 }}>
            <TreeSvg nodes={D_NODES} w={460} h={246} state={f.state} />
          </div>
          <div className="bt-stackcol">
            <div className="bt-stackcap">队列(左 = 队首)</div>
            <div className="bt-strip" style={{ minHeight: 32 }}>
              {f.queue.length === 0 ? (
                <span className="dim" style={{ fontSize: 12 }}>
                  空
                </span>
              ) : (
                f.queue.map((v, i) => (
                  <span key={i} className={`bt-auxchip${i === 0 ? " top" : ""}`}>
                    {v}
                  </span>
                ))
              )}
            </div>
            <div className="bt-stackcap" style={{ marginTop: 8 }}>
              结果(按层)
            </div>
            <div className="bt-levels">
              {f.levels.map((lv, i) => (
                <span key={i}>
                  第 {i + 1} 层 → <b>[{lv.join(", ")}]</b>
                </span>
              ))}
              {f.cur.length > 0 && (
                <span>
                  收集中… [{f.cur.join(", ")}]
                </span>
              )}
              {f.levels.length === 0 && f.cur.length === 0 && (
                <span className="dim">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={L_FRAMES.length} />
    </div>
  );
}
