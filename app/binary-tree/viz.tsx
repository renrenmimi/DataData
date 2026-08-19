"use client";

// 第 7 章 · 二叉树的可视化组件群(English default / 中文可切换):
//  - TermTree / ShapeGallery:§01 术语全图解、真/满/完全三种形状对比(静态 SVG)。
//  - FactorialLab:§03 factorial(3) 调用栈逐帧(递归第一课)。
//  - RecurLab:§03 count(node) 数节点 —— 栈帧压弹 + 每节点返回值(核心)。
//  - TraverseLab:§04 前/中/后/层序四种遍历,节点点亮 + 输出序列 + 栈/队列。
//  - DepthLab / InvertLab / MirrorLab / LevelLab:§07 四道精讲的逐帧动画。
//
// 双语:图内文字、旁白、按钮、图例全部走 <T> / useL()。
// 节点值、下标、代码标识符不翻译。

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { useL, T, type Loc } from "@/lib/i18n";

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
  const L = useL();
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="The words used to talk about a tree"
          zh="一棵二叉树的「家谱称呼」全图"
        />
      </div>
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
                {L({ en: "level 1 · depth 0", zh: "第 1 层 · 深度 0" })}
              </text>
              <text x={34} y={130} className="bt-lab">
                {L({ en: "level 2 · depth 1", zh: "第 2 层 · 深度 1" })}
              </text>
              <text x={34} y={220} className="bt-lab">
                {L({ en: "level 3 · depth 2", zh: "第 3 层 · 深度 2" })}
              </text>
              {/* 称呼标注 */}
              <text x={320} y={16} textAnchor="middle" className="bt-lab acc">
                {L({
                  en: "root — the node with no parent",
                  zh: "根 root —— 没有父节点的那个",
                })}
              </text>
              <text x={320} y={150} textAnchor="middle" className="bt-lab">
                {L({ en: "B and C are siblings", zh: "B、C 互为兄弟 sibling" })}
              </text>
              <text x={244} y={88} textAnchor="middle" className="bt-lab">
                {L({
                  en: "A is B's parent, B is A's child",
                  zh: "A 是 B 的父,B 是 A 的子",
                })}
              </text>
              <text x={180} y={278} textAnchor="middle" className="bt-lab acc">
                {L({
                  en: "D, E, F are leaves (no children)",
                  zh: "D、E、F:叶子 leaf(没有孩子)",
                })}
              </text>
              <text x={520} y={170} textAnchor="middle" className="bt-lab">
                {L({
                  en: "C has a right child only",
                  zh: "C 只有右孩子,左边为空",
                })}
              </text>
            </>
          }
        />
      </div>
      <div className="viz-msg">
        <T
          en={
            <>
              <b>Depth</b> of a node: how many edges you walk from the{" "}
              <b>root</b> down to it. The root has depth 0, so D has depth 2.{" "}
              <b>Height</b> of a node: how many edges you walk from it down to
              its deepest <b>leaf</b>. A leaf has height 0, so B has height 1.
              The height of the tree is the height of the root, which is{" "}
              <b>2</b> here.
            </>
          }
          zh={
            <>
              节点的<b>深度 depth</b>:从<b>根</b>走到它要经过几条边。根的深度是
              0,所以 D 的深度是 2。节点的<b>高度 height</b>:从它走到自己最深的
              <b>叶子</b>要经过几条边。叶子的高度是 0,所以 B 的高度是 1。
              整棵树的高度 = 根的高度 = 这里的 <b>2</b>。
            </>
          }
        />
      </div>
    </div>
  );
}

/* ================= ShapeGallery:真 / 满 / 完全 ================= */

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
              null
            </text>
            <text dy={34} textAnchor="middle" className="bt-lab">
              [{s.n - 1}]
            </text>
          </g>
        ),
      )}
    </svg>
  );
}

export function ShapeGallery() {
  return (
    <div className="grid-3" style={{ marginTop: 18 }}>
      <div className="card">
        <div className="card-kicker">
          <T en="SHAPE 01" zh="形态一" />
        </div>
        <div className="card-title">
          <T en="Full · 真二叉树" zh="真二叉树 full" />
        </div>
        <MiniTree missing={[4, 5]} />
        <p>
          <T
            en={
              <>
                Every node has <b>either two children or none</b>. Node 2 is a
                leaf, node 3 has both children, so this tree is full. Gaps in
                the middle of a level are allowed, which is why it is not
                complete: slots [3] and [4] are empty while [5] and [6] are
                used.
              </>
            }
            zh={
              <>
                每个节点<b>要么有两个孩子,要么一个都没有</b>。节点 2 是叶子,
                节点 3 两个孩子齐全,所以这棵树是真二叉树。它允许某一层中间留空,
                因此不是完全二叉树:下标 [3]、[4] 空着,[5]、[6] 却用上了。
              </>
            }
          />
        </p>
      </div>
      <div className="card">
        <div className="card-kicker">
          <T en="SHAPE 02" zh="形态二" />
        </div>
        <div className="card-title">
          <T en="Perfect · 满二叉树" zh="满二叉树 perfect" />
        </div>
        <MiniTree missing={[]} />
        <p>
          <T
            en={
              <>
                Every level is completely filled, so all leaves sit at the same
                depth. A perfect tree of height h has 2<sup>h+1</sup>−1 nodes;
                here h = 2 and the tree has 7. Note the Chinese name: 满二叉树
                means <b>perfect</b>, not &ldquo;full&rdquo;.
              </>
            }
            zh={
              <>
                每一层都<b>填满</b>,所有叶子处在同一深度。高度为 h 的满二叉树共有
                2<sup>h+1</sup>−1 个节点;这里 h = 2,正好 7 个。注意英文对应:
                满二叉树是 <b>perfect</b>,不是 full。
              </>
            }
          />
        </p>
      </div>
      <div className="card">
        <div className="card-kicker">
          <T en="SHAPE 03" zh="形态三" />
        </div>
        <div className="card-title">
          <T en="Complete · 完全二叉树" zh="完全二叉树 complete" />
        </div>
        <MiniTree missing={[7]} />
        <p>
          <T
            en={
              <>
                Every level is filled except possibly the last, and the last is
                filled <b>from left to right</b>. The used indices then form one
                unbroken run [0]…[5], so the tree fits into an array with no
                wasted slot. Chapter 09 builds the heap on exactly this
                property.
              </>
            }
            zh={
              <>
                除最后一层外每层都填满,最后一层<b>从左到右</b>连续排列。
                于是用到的下标是一段没有空洞的连续区间 [0]…[5],
                整棵树铺进数组不浪费任何一格。第 9 章的堆,就靠这个性质活着。
              </>
            }
          />
        </p>
      </div>
    </div>
  );
}

/* ================= FactorialLab:递归第一课 ================= */

interface StackItem {
  name: string;
  note: Loc<string>;
  /** 该帧已算出结果(右侧文字标绿) */
  done?: boolean;
  lit?: boolean;
}

interface FacFrame {
  stack: StackItem[];
  msg: ReactNode;
}

const WAIT2: Loc<string> = { en: "waiting for f(2)", zh: "等 f(2)" };
const WAIT1: Loc<string> = { en: "waiting for f(1)", zh: "等 f(1)" };

const FAC_FRAMES: FacFrame[] = [
  {
    stack: [{ name: "factorial(3)", note: "3 × factorial(2) = ?", lit: true }],
    msg: (
      <T
        en={
          <>
            factorial(3) is called. n = 3 is not the base case, so this call
            cannot finish until it knows factorial(2). It stays on the stack,
            frozen at that line, waiting.
          </>
        }
        zh={
          <>
            调用 factorial(3):n = 3 不是终止条件,它必须先知道 factorial(2)
            的结果才能算下去 —— 于是「冻结」在那一行,留在栈上等答案。
          </>
        }
      />
    ),
  },
  {
    stack: [
      { name: "factorial(3)", note: WAIT2 },
      { name: "factorial(2)", note: "2 × factorial(1) = ?", lit: true },
    ],
    msg: (
      <T
        en={
          <>
            factorial(2) is stuck on factorial(1) in the same way, so another
            frame is pushed. Each frame keeps its own n and its own position in
            the code. They do not interfere with each other.
          </>
        }
        zh={
          <>
            factorial(2) 同样卡在 factorial(1) 上,于是再压一帧。
            每个栈帧独立记着自己的 n 和「算到哪一行了」,互不干扰。
          </>
        }
      />
    ),
  },
  {
    stack: [
      { name: "factorial(3)", note: WAIT2 },
      { name: "factorial(2)", note: WAIT1 },
      {
        name: "factorial(1)",
        note: { en: "n ≤ 1 → return 1", zh: "n ≤ 1 → 直接返回 1" },
        lit: true,
      },
    ],
    msg: (
      <T
        en={
          <>
            factorial(1) hits the <b>base case</b>. It answers 1 without calling
            anything, so the descent stops here. The stack is 3 frames tall, and
            that is the depth of the recursion.
          </>
        }
        zh={
          <>
            factorial(1) 命中<b>终止条件</b>:不再往下调,直接答 1,
            下潜到此为止。栈高 3 层,这就是递归的深度。
          </>
        }
      />
    ),
  },
  {
    stack: [
      { name: "factorial(3)", note: WAIT2 },
      {
        name: "factorial(2)",
        note: { en: "resumes: 2 × 1 = 2 ✓", zh: "解冻:2 × 1 = 2 ✓" },
        done: true,
        lit: true,
      },
    ],
    msg: (
      <T
        en={
          <>
            f(1) is popped and hands 1 back to f(2). f(2) continues from the
            line where it was frozen: 2 × 1 = 2. It is finished, so it is popped
            next.
          </>
        }
        zh={
          <>
            f(1) 弹栈,把 1 交回 f(2)。f(2) 从冻结的那一行继续:2 × 1 = 2,
            算完了,轮到它弹栈。
          </>
        }
      />
    ),
  },
  {
    stack: [
      {
        name: "factorial(3)",
        note: { en: "resumes: 3 × 2 = 6 ✓", zh: "解冻:3 × 2 = 6 ✓" },
        done: true,
        lit: true,
      },
    ],
    msg: (
      <T
        en={<>f(2) is popped and hands 2 back to f(3): 3 × 2 = 6.</>}
        zh={<>f(2) 弹栈,把 2 交回 f(3):3 × 2 = 6。</>}
      />
    ),
  },
  {
    stack: [],
    msg: (
      <T
        en={
          <>
            f(3) is popped, the stack is empty, and the final answer is{" "}
            <b>6</b>. The rhythm of every recursion is the same:{" "}
            <b>push frames on the way down, carry answers back on the way up</b>
            .
          </>
        }
        zh={
          <>
            f(3) 弹栈,栈空,最终答案 <b>6</b>。所有递归都是同一个节奏:
            <b>去的时候一路压栈,回来的时候一路带答案</b>。
          </>
        }
      />
    ),
  },
];

export function FactorialLab() {
  const L = useL();
  const s = useStepper(FAC_FRAMES.length, 1500);
  const f = FAC_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="The call stack of factorial(3): push on the way down, pop on the way up"
          zh="factorial(3) 的调用栈 —— 递归的呼吸:压栈、弹栈"
        />
      </div>
      <div className="viz-stage">
        <div className="bt-stackcol">
          <div className="bt-stackcap">
            <T
              en="Call stack (top = returns first)"
              zh="调用栈(上 = 栈顶,最先返回)"
            />
          </div>
          {f.stack.length === 0 ? (
            <div className="bt-stackempty">
              <T
                en="stack empty — recursion done, answer 6"
                zh="栈空 —— 递归结束,答案 6"
              />
            </div>
          ) : (
            [...f.stack].reverse().map((it) => (
              <div key={it.name} className={`bt-frame${it.lit ? " lit" : ""}`}>
                <span>{it.name}</span>
                <span className={it.done ? "r" : ""}>{L(it.note)}</span>
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
      <T
        en={
          <>
            Goal: count the nodes in this tree. The promise:{" "}
            <b>count(node) returns how many nodes are in the subtree at node</b>
            . So count(node) = 1 + count(left) + count(right), and count(null) =
            0. Start with count(A).
          </>
        }
        zh={
          <>
            目标:数出这棵树有几个节点。函数的承诺:
            <b>count(node) 返回「以 node 为根的子树里有多少个节点」</b>。
            于是 count(node) = 1 + count(左) + count(右),count(null) = 0。
            先调用 count(A)。
          </>
        }
      />
    ),
  },
  {
    state: { A: "path", B: "lit" },
    ret: {},
    stack: ["count(A)", "count(B)"],
    msg: (
      <T
        en={
          <>
            count(A) needs 1 + count(B) + count(C), so it asks for count(B)
            first. The frame of A stays frozen at the bottom while count(B) is
            pushed.
          </>
        }
        zh={
          <>
            count(A) 要算「1 + count(B) + count(C)」,先问 count(B)。
            A 的帧冻结在栈底,count(B) 压了进来。
          </>
        }
      />
    ),
  },
  {
    state: { A: "path", B: "path", D: "lit" },
    ret: {},
    stack: ["count(A)", "count(B)", "count(D)"],
    msg: (
      <T
        en={
          <>
            count(B) also needs its left side first, so count(D) is pushed. The
            stack grows, and every frame remembers where it stopped.
          </>
        }
        zh={
          <>
            count(B) 同样先要左边:压入 count(D)。栈越来越高,
            每一帧都记着自己停在哪里。
          </>
        }
      />
    ),
  },
  {
    state: { A: "path", B: "lit", D: "ok" },
    ret: { D: "=1" },
    stack: ["count(A)", "count(B)"],
    msg: (
      <T
        en={
          <>
            Both children of D are null, and count(null) = 0 is the{" "}
            <b>base case</b>. So count(D) = 1 + 0 + 0 = <b>1</b>. The frame pops
            and gives 1 back to B.
          </>
        }
        zh={
          <>
            D 的左右孩子都是 null,而 count(null) = 0 是<b>终止条件</b>。
            于是 count(D) = 1 + 0 + 0 = <b>1</b>,弹栈,把 1 交给 B。
          </>
        }
      />
    ),
  },
  {
    state: { A: "path", B: "path", D: "ok", E: "lit" },
    ret: { D: "=1" },
    stack: ["count(A)", "count(B)", "count(E)"],
    msg: (
      <T
        en={<>B now holds the left answer (1) and still needs the right one, so count(E) is pushed.</>}
        zh={<>B 拿到了左边的答案(1),还差右边:压入 count(E)。</>}
      />
    ),
  },
  {
    state: { A: "path", B: "lit", D: "ok", E: "ok" },
    ret: { D: "=1", E: "=1" },
    stack: ["count(A)", "count(B)"],
    msg: (
      <T
        en={
          <>
            E is a leaf as well: 1 + 0 + 0 = <b>1</b>. It pops and gives 1 to B.
          </>
        }
        zh={
          <>
            E 也是叶子:1 + 0 + 0 = <b>1</b>,弹栈交给 B。
          </>
        }
      />
    ),
  },
  {
    state: { A: "lit", B: "ok", D: "ok", E: "ok" },
    ret: { D: "=1", E: "=1", B: "=3" },
    stack: ["count(A)"],
    msg: (
      <T
        en={
          <>
            B has both answers: count(B) = 1 + 1 + 1 = <b>3</b>. It pops and
            gives 3 to A, so the left half of A is settled.
          </>
        }
        zh={
          <>
            B 两边都齐了:count(B) = 1 + 1 + 1 = <b>3</b>。弹栈,把 3 交给 A ——
            A 的左半边完工。
          </>
        }
      />
    ),
  },
  {
    state: { A: "path", B: "ok", D: "ok", E: "ok", C: "lit" },
    ret: { D: "=1", E: "=1", B: "=3" },
    stack: ["count(A)", "count(C)"],
    msg: (
      <T
        en={
          <>
            A turns to the right side and pushes count(C). Notice that the two
            subtrees are never computed at the same time. The call stack follows
            one path at a time, which is why the extra space is O(h) and not
            O(n).
          </>
        }
        zh={
          <>
            A 转头要右边:压入 count(C)。注意两棵子树从来不是「同时」算的 ——
            调用栈一次只走一条路径,这正是额外空间为 O(h) 而不是 O(n) 的原因。
          </>
        }
      />
    ),
  },
  {
    state: { A: "path", B: "ok", D: "ok", E: "ok", C: "path", F: "lit" },
    ret: { D: "=1", E: "=1", B: "=3" },
    stack: ["count(A)", "count(C)", "count(F)"],
    msg: (
      <T
        en={<>count(C) needs its left side first: count(F) is pushed.</>}
        zh={<>count(C) 先要左边:压入 count(F)。</>}
      />
    ),
  },
  {
    state: { A: "path", B: "ok", D: "ok", E: "ok", C: "lit", F: "ok" },
    ret: { D: "=1", E: "=1", B: "=3", F: "=1" },
    stack: ["count(A)", "count(C)"],
    msg: (
      <T
        en={
          <>
            F is a leaf, so it returns <b>1</b> and pops back to C.
          </>
        }
        zh={
          <>
            F 是叶子,返回 <b>1</b>,弹栈交给 C。
          </>
        }
      />
    ),
  },
  {
    state: { A: "path", B: "ok", D: "ok", E: "ok", C: "path", F: "ok", G: "lit" },
    ret: { D: "=1", E: "=1", B: "=3", F: "=1" },
    stack: ["count(A)", "count(C)", "count(G)"],
    msg: (
      <T
        en={<>C asks for its right side: count(G) is pushed.</>}
        zh={<>C 再要右边:压入 count(G)。</>}
      />
    ),
  },
  {
    state: { A: "path", B: "ok", D: "ok", E: "ok", C: "lit", F: "ok", G: "ok" },
    ret: { D: "=1", E: "=1", B: "=3", F: "=1", G: "=1" },
    stack: ["count(A)", "count(C)"],
    msg: (
      <T
        en={
          <>
            G returns <b>1</b> and pops.
          </>
        }
        zh={
          <>
            G 返回 <b>1</b>,弹栈。
          </>
        }
      />
    ),
  },
  {
    state: { A: "lit", B: "ok", D: "ok", E: "ok", C: "ok", F: "ok", G: "ok" },
    ret: { D: "=1", E: "=1", B: "=3", F: "=1", G: "=1", C: "=3" },
    stack: ["count(A)"],
    msg: (
      <T
        en={
          <>
            count(C) = 1 + 1 + 1 = <b>3</b>. It pops and gives 3 to A.
          </>
        }
        zh={
          <>
            count(C) = 1 + 1 + 1 = <b>3</b>,弹栈交给 A。
          </>
        }
      />
    ),
  },
  {
    state: { A: "ok", B: "ok", D: "ok", E: "ok", C: "ok", F: "ok", G: "ok" },
    ret: { D: "=1", E: "=1", B: "=3", F: "=1", G: "=1", C: "=3", A: "=7" },
    stack: [],
    msg: (
      <T
        en={
          <>
            count(A) = 1 + 3 + 3 = <b>7</b>. The stack is empty and the answer
            is 7. Looking back: each node was visited exactly once, so the time
            is <b>O(n)</b>; the stack was never taller than the tree, so the
            extra space is <b>O(h)</b>.
          </>
        }
        zh={
          <>
            count(A) = 1 + 3 + 3 = <b>7</b>。栈清空,答案是 7。复盘:
            每个节点恰好被访问一次,时间 <b>O(n)</b>;栈最高时不超过树的高度,
            额外空间 <b>O(h)</b>。
          </>
        }
      />
    ),
  },
];

export function RecurLab() {
  const s = useStepper(R_FRAMES.length, 1600);
  const f = R_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Recursion lab — count(node), the first recursion on a tree, frame by frame"
          zh="递归实验室 —— count(node):树上第一次递归,逐帧慢放"
        />
      </div>
      <div className="viz-stage">
        <div className="bt-stackwrap">
          <div style={{ flex: "1 1 300px", maxWidth: 460 }}>
            <TreeSvg nodes={R_NODES} w={460} h={256} state={f.state} ret={f.ret} />
          </div>
          <div className="bt-stackcol">
            <div className="bt-stackcap">
              <T en="Call stack (top of stack above)" zh="调用栈(上 = 栈顶)" />
            </div>
            {f.stack.length === 0 ? (
              <div className="bt-stackempty">
                <T en="stack empty — answer 7" zh="栈空 —— 答案 7" />
              </div>
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

const ORDER_LABEL: Record<Order, { en: string; zh: string }> = {
  pre: { en: "Preorder (root, left, right)", zh: "前序(根 → 左 → 右)" },
  in: { en: "Inorder (left, root, right)", zh: "中序(左 → 根 → 右)" },
  post: { en: "Postorder (left, right, root)", zh: "后序(左 → 右 → 根)" },
  level: { en: "Level order (level by level)", zh: "层序(一层一层)" },
};

const ORDER_TAB: Record<Order, { en: string; zh: string }> = {
  pre: { en: "Preorder", zh: "前序" },
  in: { en: "Inorder", zh: "中序" },
  post: { en: "Postorder", zh: "后序" },
  level: { en: "Level order", zh: "层序" },
};

function buildDfsFrames(order: Exclude<Order, "level">): TravFrame[] {
  const frames: TravFrame[] = [];
  const out: number[] = [];
  const done = new Set<string>();
  const label = ORDER_LABEL[order];

  frames.push({
    state: {},
    out: [],
    aux: [],
    msg: (
      <T
        en={
          <>
            {label.en}: all three depth-first orders walk{" "}
            <b>exactly the same route</b>. The only difference is{" "}
            <b>when the node itself is visited</b>, relative to its two
            subtrees. Press Next to start.
          </>
        }
        zh={
          <>
            {label.zh}:三种深度优先遍历走的<b>路线完全一样</b>,
            差别只在<b>节点自己相对于两棵子树在什么时候被访问</b>。
            点「下一步」开走。
          </>
        }
      />
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
          <T
            en={
              <>
                Leaf <b>{node.n}</b>: visited on arrival. Both of its children
                are empty trees, so the call returns immediately.
              </>
            }
            zh={
              <>
                叶子 <b>{node.n}</b>:一进门就被访问。它的左右孩子都是空树,
                所以这次调用马上返回。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                Entering <b>{node.n}</b>: preorder visits the node{" "}
                <b>on arrival</b>, before either subtree.
              </>
            }
            zh={
              <>
                进入 <b>{node.n}</b>:前序<b>一进门就访问节点</b>,
                然后才去左、右子树。
              </>
            }
          />
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
          <T
            en={
              <>
                Leaf <b>{node.n}</b>: its left subtree is empty, which counts as
                finished, so the node is visited now. Its right subtree is empty
                too.
              </>
            }
            zh={
              <>
                叶子 <b>{node.n}</b>:左子树是空树(也算「走完了」),
                所以此刻访问它自己,右子树同样是空。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                The left subtree of <b>{node.n}</b> is finished. Inorder visits
                the node <b>now</b>, between the two subtrees, then goes right.
              </>
            }
            zh={
              <>
                <b>{node.n}</b> 的左子树全部走完 —— 中序<b>此刻</b>访问节点,
                位置在两棵子树之间,然后去右子树。
              </>
            }
          />
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
          <T
            en={
              <>
                Leaf <b>{node.n}</b>: both sides (empty trees) are done, so the
                node is visited.
              </>
            }
            zh={
              <>
                叶子 <b>{node.n}</b>:左右(空树)都处理完了,访问它自己。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                <b>Both</b> subtrees of <b>{node.n}</b> are finished. Postorder
                visits the node <b>last</b>, on the way out.
              </>
            }
            zh={
              <>
                <b>{node.n}</b> 的左右子树<b>都</b>处理完了 ——
                后序在离开节点前才访问它。
              </>
            }
          />
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
      <T
        en={
          <>
            Done. {label.en} gives [{out.join(", ")}]. The call stack never held
            more than 3 frames, which is the height of the tree plus one.
          </>
        }
        zh={
          <>
            完成!{label.zh}的序列是 [{out.join(", ")}]。
            调用栈最深只到过 3 层 —— 恰好是树高加一。
          </>
        }
      />
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
      <T
        en={
          <>
            Level order (BFS): the root 1 is put in the queue. There is one
            rule: <b>take one node from the front, visit it, put its children
            at the back</b>. First in, first out is what keeps a whole level
            ahead of the next one.
          </>
        }
        zh={
          <>
            层序(BFS):根 1 入队。规则只有一条:
            <b>从队首取出一个、访问它、把它的孩子放到队尾</b>。
            先进先出保证一层处理完才轮到下一层。
          </>
        }
      />
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
    const kidText = kids.map((k) => T7M.get(k)!.n);
    frames.push({
      state,
      out: [...out],
      aux: q.map((i) => String(T7M.get(i)!.n)),
      msg:
        kids.length > 0 ? (
          <T
            en={
              <>
                Take <b>{node.n}</b> from the front and visit it. Its children{" "}
                {kidText.join(" and ")} go to the back of the queue.
              </>
            }
            zh={
              <>
                队首取出 <b>{node.n}</b> 并访问;它的孩子 {kidText.join("、")}{" "}
                排到队尾。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                Take <b>{node.n}</b> from the front. It is a leaf, so nothing is
                added to the queue.
              </>
            }
            zh={
              <>
                队首取出 <b>{node.n}</b>:它是叶子,没有孩子可以入队。
              </>
            }
          />
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
      <T
        en={
          <>
            The queue is empty and the traversal is over: [{out.join(", ")}],
            level by level and left to right. At its longest the queue held one
            whole level (4 nodes), so the extra space is O(w), where w is the
            width of the widest level.
          </>
        }
        zh={
          <>
            队列空,遍历结束:[{out.join(", ")}] —— 正好一层一层、从左到右。
            队列最长时装下了一整层(4 个),所以额外空间是 O(w),
            w 是最宽那一层的宽度。
          </>
        }
      />
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

function TravPlayer({
  frames,
  kind,
}: {
  frames: TravFrame[];
  kind: "stack" | "queue";
}) {
  const L = useL();
  const s = useStepper(frames.length, 1400);
  const f = frames[s.step];
  const auxLabel = L(
    kind === "stack"
      ? { en: "Call stack", zh: "递归栈" }
      : { en: "Queue", zh: "队列" },
  );
  return (
    <>
      <div className="viz-stage bt-stage-col">
        <TreeSvg nodes={T7} w={460} h={246} state={f.state} />
        <div className="bt-strip">
          <span className="bt-strip-label">
            <T en="Visited" zh="输出" />
          </span>
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
              <T en="empty" zh="空" />
            </span>
          ) : (
            f.aux.map((v, i) => (
              <span
                key={i}
                className={`bt-auxchip${
                  kind === "stack" && i === f.aux.length - 1 ? " top" : ""
                }${kind === "queue" && i === 0 ? " top" : ""}`}
              >
                {v}
              </span>
            ))
          )}
          {f.aux.length > 0 && (
            <span className="dim" style={{ fontSize: 11 }}>
              {kind === "stack" ? (
                <T en="← top of stack on the right" zh="← 右端是栈顶" />
              ) : (
                <T en="← front of queue on the left" zh="← 左端是队首" />
              )}
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
  const L = useL();
  const [order, setOrder] = useState<Order>("pre");
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Traversal lab — one tree, four routes"
          zh="遍历实验室 —— 同一棵树,四种走法"
        />
        <span className="seg" style={{ marginLeft: "auto" }}>
          {(["pre", "in", "post", "level"] as Order[]).map((o) => (
            <button
              key={o}
              type="button"
              className={`seg-btn${order === o ? " on" : ""}`}
              onClick={() => setOrder(o)}
            >
              {L(ORDER_TAB[o])}
            </button>
          ))}
        </span>
      </div>
      <TravPlayer
        key={order}
        frames={TRAV_FRAMES[order]}
        kind={order === "level" ? "queue" : "stack"}
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
      <T
        en={
          <>
            The promise: <b>maxDepth(node) returns how many nodes lie on the
            longest path from node down to a leaf</b>, and maxDepth(null) = 0.
            So maxDepth(node) = 1 + max(left answer, right answer). The tree is
            [3, 9, 20, null, null, 15, 7].
          </>
        }
        zh={
          <>
            函数的承诺:<b>maxDepth(node) 返回「从 node 往下到叶子的最长路径上有几个节点」</b>
            ,并且 maxDepth(null) = 0。于是 maxDepth(node) = 1 + max(左边的答案,
            右边的答案)。这棵树是 [3, 9, 20, null, null, 15, 7]。
          </>
        }
      />
    ),
  },
  {
    state: { "3": "path", "9": "lit" },
    ret: {},
    msg: <T en={<>Ask the left side first: maxDepth(9).</>} zh={<>先问左边:maxDepth(9)。</>} />,
  },
  {
    state: { "3": "lit", "9": "ok" },
    ret: { "9": "↑1" },
    msg: (
      <T
        en={
          <>
            9 is a leaf. Both of its children are empty trees and report 0, so 1
            + max(0, 0) = <b>1</b>. It reports 1 to its parent.
          </>
        }
        zh={
          <>
            9 是叶子:左右都是空树,各报 0,于是 1 + max(0, 0) = <b>1</b>,
            把 1 报给父节点。
          </>
        }
      />
    ),
  },
  {
    state: { "3": "path", "9": "ok", "20": "lit" },
    ret: { "9": "↑1" },
    msg: (
      <T
        en={
          <>
            Now the right side: maxDepth(20). It is the same question again, so
            it keeps asking downward.
          </>
        }
        zh={
          <>
            再问右边:maxDepth(20) —— 它面对的是同一个问题,继续往下问。
          </>
        }
      />
    ),
  },
  {
    state: { "3": "path", "9": "ok", "20": "path", "15": "lit" },
    ret: { "9": "↑1" },
    msg: (
      <T
        en={
          <>
            maxDepth(15): a leaf, so it reports <b>1</b>.
          </>
        }
        zh={
          <>
            maxDepth(15):叶子,报 <b>1</b>。
          </>
        }
      />
    ),
  },
  {
    state: { "3": "path", "9": "ok", "20": "path", "15": "ok", "7": "lit" },
    ret: { "9": "↑1", "15": "↑1" },
    msg: (
      <T
        en={
          <>
            maxDepth(7): a leaf as well, so it also reports <b>1</b>.
          </>
        }
        zh={
          <>
            maxDepth(7):也是叶子,同样报 <b>1</b>。
          </>
        }
      />
    ),
  },
  {
    state: { "3": "path", "9": "ok", "20": "lit", "15": "ok", "7": "ok" },
    ret: { "9": "↑1", "15": "↑1", "7": "↑1" },
    msg: (
      <T
        en={
          <>
            20 has both answers: 1 + max(1, 1) = <b>2</b>, and it reports 2
            upward.
          </>
        }
        zh={
          <>
            20 收齐了两边:1 + max(1, 1) = <b>2</b>,上报 2。
          </>
        }
      />
    ),
  },
  {
    state: { "3": "ok", "9": "ok", "20": "ok", "15": "ok", "7": "ok" },
    ret: { "9": "↑1", "15": "↑1", "7": "↑1", "20": "↑2", "3": "=3" },
    msg: (
      <T
        en={
          <>
            The root has both answers: 1 + max(1, 2) = <b>3</b>. The answer grew
            upward from the leaves; it was not counted downward from the root.
            That is what bottom-up means. O(n) time, O(h) stack space.
          </>
        }
        zh={
          <>
            根也收齐了:1 + max(1, 2) = <b>3</b>。答案是从叶子一层层「长」上来的,
            不是从根「数」下去的 —— 这就是自底向上。时间 O(n),栈空间 O(h)。
          </>
        }
      />
    ),
  },
];

export function DepthLab() {
  const s = useStepper(D_FRAMES.length, 1500);
  const f = D_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="LC 104 · Maximum depth — return values travel upward, frame by frame"
          zh="LC 104 · 最大深度 —— 返回值自底向上,逐帧"
        />
      </div>
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
      <T
        en={
          <>
            Goal: swap the two children of every node, mirroring the whole tree.
            The promise: <b>invertTree(node) returns the same subtree, mirrored
            </b>. The plan: swap the two children of the root, then let the
            recursion mirror each subtree. Swapping before or after the two
            recursive calls gives the same result.
          </>
        }
        zh={
          <>
            目标:把每个节点的左右孩子互换,整棵树镜像。函数的承诺:
            <b>invertTree(node) 返回「同一棵子树,但已镜像」</b>。
            做法:交换根的两个孩子,再让递归去镜像两棵子树。
            交换写在两次递归调用之前还是之后,结果都一样。
          </>
        }
      />
    ),
  },
  {
    pos: P1,
    state: { n4: "ok" },
    msg: (
      <T
        en={
          <>
            Step one: swap the two children of the root 4. What moves is{" "}
            <b>the whole subtree</b>, because only two references are written.
            The inside of each subtree is left to the recursion.
          </>
        }
        zh={
          <>
            第一步:交换根 4 的两个孩子。动的是<b>整棵子树</b> ——
            实际写入的只有两根引用。子树内部先不管,那是递归的活。
          </>
        }
      />
    ),
  },
  {
    pos: P2,
    state: { n4: "ok", n7: "lit" },
    msg: (
      <T
        en={<>Recurse into 7, which is now the left child, and swap its children 6 and 9.</>}
        zh={<>递归进入(现在的)左孩子 7:交换它的孩子 6 和 9。</>}
      />
    ),
  },
  {
    pos: P3,
    state: { n4: "ok", n7: "ok", n2: "lit" },
    msg: (
      <T
        en={<>Recurse into 2, now the right child, and swap 1 and 3.</>}
        zh={<>递归进入(现在的)右孩子 2:交换 1 和 3。</>}
      />
    ),
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
      <T
        en={
          <>
            The leaves have no children and invertTree(null) returns
            immediately, so the work is done. The new tree in level order is [4,
            7, 2, 9, 6, 3, 1], the mirror of the original at every position.
            Each node is swapped once: <b>O(n)</b> time, O(h) stack space.
          </>
        }
        zh={
          <>
            叶子没有孩子,invertTree(null) 直接返回 —— 完成。
            新树的层序是 [4, 7, 2, 9, 6, 3, 1],处处是原树的镜像。
            每个节点只交换一次:时间 <b>O(n)</b>,栈空间 O(h)。
          </>
        }
      />
    ),
  },
];

export function InvertLab() {
  const s = useStepper(I_FRAMES.length, 1600);
  const f = I_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="LC 226 · Invert binary tree — swap references, whole subtrees move"
          zh="LC 226 · 翻转二叉树 —— 交换引用,子树整体移动"
        />
      </div>
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
      <T
        en={
          <>
            Symmetric means <b>the left subtree and the right subtree are
            mirrors of each other</b>. That is a relation between two subtrees,
            and a function of one node cannot express it. So the recursion takes
            two parameters, check(L, R), and walks both halves in mirrored step.
          </>
        }
        zh={
          <>
            对称的意思是<b>左子树和右子树互为镜像</b>。
            这是「两棵子树之间」的关系,单参数的 f(node) 表达不了,
            所以把递归升级成双参数 check(L, R),让两边沿镜像路线同步走。
          </>
        }
      />
    ),
  },
  {
    state: { a: "path", b: "lit", c: "lit" },
    stack: ["check(2, 2)"],
    msg: (
      <T
        en={
          <>
            check(left 2, right 2): the values are equal. Two mirrored pairs
            remain: <b>L.left against R.right</b> (the outer pair) and{" "}
            <b>L.right against R.left</b> (the inner pair).
          </>
        }
        zh={
          <>
            check(左 2, 右 2):值相等。接下来要比两组镜像对:
            <b>L 的左 vs R 的右</b>(外侧)、<b>L 的右 vs R 的左</b>(内侧)。
          </>
        }
      />
    ),
  },
  {
    state: { a: "path", b: "path", c: "path", d: "lit", g: "lit" },
    stack: ["check(2, 2)", "check(3, 3)"],
    msg: (
      <T
        en={<>The outer pair: 3 against 3, values equal. Push a frame and check their children.</>}
        zh={<>外侧一组:3 vs 3,值相等,压栈继续检查它们的孩子。</>}
      />
    ),
  },
  {
    state: { a: "path", b: "path", c: "path", d: "ok", g: "ok" },
    stack: ["check(2, 2)"],
    msg: (
      <T
        en={
          <>
            All children of the two 3s are null, and check(null, null) is{" "}
            <b>true</b>: two empty trees are mirrors. The outer pair passes and
            the frame pops.
          </>
        }
        zh={
          <>
            两个 3 的孩子全是 null,而 check(null, null) = <b>true</b>
            (两棵空树互为镜像)。外侧通过,弹栈。
          </>
        }
      />
    ),
  },
  {
    state: { a: "path", b: "path", c: "path", d: "ok", g: "ok", e: "lit", f: "lit" },
    stack: ["check(2, 2)", "check(4, 4)"],
    msg: (
      <T
        en={<>The inner pair: 4 against 4, and their children are all null, so it returns true and pops.</>}
        zh={<>内侧一组:4 vs 4,孩子也全是 null,返回 true,弹栈。</>}
      />
    ),
  },
  {
    state: { a: "ok", b: "ok", c: "ok", d: "ok", e: "ok", f: "ok", g: "ok" },
    stack: [],
    msg: (
      <T
        en={
          <>
            check(2, 2) received true from both the outer and the inner pair, so
            it returns true: <b>this tree is symmetric</b>. If any step found
            unequal values, or one side null and the other not, false would
            travel straight back to the top. O(n) time, O(h) stack space.
          </>
        }
        zh={
          <>
            check(2, 2) 收到外侧、内侧两个 true,于是返回 true:<b>这棵树对称</b>。
            任何一步出现「值不等」或「一边空一边不空」,false 都会一路传回顶层。
            时间 O(n),栈空间 O(h)。
          </>
        }
      />
    ),
  },
];

export function MirrorLab() {
  const s = useStepper(M_FRAMES.length, 1600);
  const f = M_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="LC 101 · Symmetric tree — two pointers walking mirrored paths"
          zh="LC 101 · 对称二叉树 —— 镜像双指针,逐帧"
        />
      </div>
      <div className="viz-stage">
        <div className="bt-stackwrap">
          <div style={{ flex: "1 1 300px", maxWidth: 460 }}>
            <TreeSvg nodes={M_NODES} w={460} h={246} state={f.state} />
          </div>
          <div className="bt-stackcol">
            <div className="bt-stackcap">
              <T en="Call stack (top of stack above)" zh="递归栈(上 = 栈顶)" />
            </div>
            {f.stack.length === 0 ? (
              <div className="bt-stackempty">
                <T en="stack empty" zh="栈空" />
              </div>
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
      <T
        en={
          <>
            The root 3 goes into the queue. To get one array per level there is
            exactly one trick: <b>before the inner loop, record the current
            queue length as size</b>, then dequeue exactly that many nodes.
          </>
        }
        zh={
          <>
            队列放入根 3。想要「一层一个数组」,诀窍只有一个:
            <b>在内层循环之前先记下当前队列长度 size</b>,本轮只出队这么多个。
          </>
        }
      />
    ),
  },
  {
    state: { "3": "lit" },
    queue: ["9", "20"],
    levels: [[3]],
    cur: [],
    msg: (
      <T
        en={
          <>
            Level 1: size = 1. Dequeue 3 and collect it; its children 9 and 20
            are enqueued. One node processed, so level 1 = [3] is complete.
          </>
        }
        zh={
          <>
            第 1 层:size = 1。出队 3 并收进本层;孩子 9、20 入队。
            本层 1 个处理完 → 第 1 层 = [3] 结束。
          </>
        }
      />
    ),
  },
  {
    state: { "3": "ok", "9": "lit" },
    queue: ["20"],
    levels: [[3]],
    cur: [9],
    msg: (
      <T
        en={
          <>
            Level 2: size = <b>2</b>, recorded first. Children enqueued from now
            on do not belong to this level. Dequeue 9: it is a leaf, so nothing
            is enqueued.
          </>
        }
        zh={
          <>
            第 2 层:size = <b>2</b>,先记下来。从现在起入队的孩子都不算这一层。
            出队 9:它是叶子,没有孩子入队。
          </>
        }
      />
    ),
  },
  {
    state: { "3": "ok", "9": "ok", "20": "lit" },
    queue: ["15", "7"],
    levels: [[3], [9, 20]],
    cur: [],
    msg: (
      <T
        en={
          <>
            Dequeue 20 and enqueue its children 15 and 7. Two nodes processed,
            so level 2 = [9, 20]. Note that 15 and 7 are already in the queue,
            but since size was fixed at 2, they have to wait for the next round.
          </>
        }
        zh={
          <>
            出队 20,孩子 15、7 入队。本层 2 个处理完 → 第 2 层 = [9, 20]。
            注意 15、7 虽然已经在队列里,但 size 早就定死为 2,它们只能等下一轮。
          </>
        }
      />
    ),
  },
  {
    state: { "3": "ok", "9": "ok", "20": "ok", "15": "lit" },
    queue: ["7"],
    levels: [[3], [9, 20]],
    cur: [15],
    msg: (
      <T
        en={<>Level 3: size = 2. Dequeue 15, a leaf.</>}
        zh={<>第 3 层:size = 2。出队 15,叶子。</>}
      />
    ),
  },
  {
    state: { "3": "ok", "9": "ok", "20": "ok", "15": "ok", "7": "lit" },
    queue: [],
    levels: [[3], [9, 20], [15, 7]],
    cur: [],
    msg: (
      <T
        en={<>Dequeue 7. The queue is empty, so the outer loop ends.</>}
        zh={<>出队 7。队列空,外层循环结束。</>}
      />
    ),
  },
  {
    state: { "3": "ok", "9": "ok", "20": "ok", "15": "ok", "7": "ok" },
    queue: [],
    levels: [[3], [9, 20], [15, 7]],
    cur: [],
    msg: (
      <T
        en={
          <>
            Result: [[3], [9, 20], [15, 7]]. Without recording the size first,
            the queue would only give you one flat sequence and the boundary
            between levels would be lost. Every problem that processes a tree
            level by level uses this step.
          </>
        }
        zh={
          <>
            结果 [[3], [9, 20], [15, 7]]。没有「先记 size」这一步,
            队列只会给你一维序列,层与层的边界就丢了。
            所有「按层处理」的题目都要用到这一步。
          </>
        }
      />
    ),
  },
];

export function LevelLab() {
  const s = useStepper(L_FRAMES.length, 1600);
  const f = L_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="LC 102 · Level order — a queue plus the recorded size, frame by frame"
          zh="LC 102 · 层序遍历 —— 队列 + 先记 size,逐帧"
        />
      </div>
      <div className="viz-stage">
        <div className="bt-stackwrap">
          <div style={{ flex: "1 1 300px", maxWidth: 460 }}>
            <TreeSvg nodes={D_NODES} w={460} h={246} state={f.state} />
          </div>
          <div className="bt-stackcol">
            <div className="bt-stackcap">
              <T en="Queue (front on the left)" zh="队列(左 = 队首)" />
            </div>
            <div className="bt-strip" style={{ minHeight: 32 }}>
              {f.queue.length === 0 ? (
                <span className="dim" style={{ fontSize: 12 }}>
                  <T en="empty" zh="空" />
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
              <T en="Result, by level" zh="结果(按层)" />
            </div>
            <div className="bt-levels">
              {f.levels.map((lv, i) => (
                <span key={i}>
                  <T en={<>level {i + 1} → </>} zh={<>第 {i + 1} 层 → </>} />
                  <b>[{lv.join(", ")}]</b>
                </span>
              ))}
              {f.cur.length > 0 && (
                <span>
                  <T en="collecting… " zh="收集中… " />[{f.cur.join(", ")}]
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
