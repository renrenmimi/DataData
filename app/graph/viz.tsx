"use client";

// 第 12 章 · 图 的可视化组件群(English default / 中文可切换):
//  - GraphSvg:通用的 SVG 图渲染器(节点 + 边 + 有向箭头 + 边权 + 状态)。
//  - TermGraph / MiniConcepts:§01 术语全图解、无向/有向/带权 三连图。
//  - ReprLab:§02 同一张图的「邻接矩阵 vs 邻接表」互动对照。
//  - GraphLab:§03 招牌组件 —— BFS/DFS 一键切换 + 逐帧慢放(队列/栈/visited 实时显示)。
//  - GridDfsLab:§06 LC200 岛屿数量,DFS 淹没法逐帧。
//  - TopoLab:§06 LC207 拓扑排序,Kahn 入度法逐帧(入度表 + 队列变化)。
//  - DijkstraLab:§06 LC743 Dijkstra,贪心 + 小根堆,dist 表逐步演算。
//
// 双语:图内文字、旁白、按钮、图例全部走 <T>。
// 顶点编号、代码标识符、权重数字不翻译。

import { useId, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { T } from "@/lib/i18n";

/* ================= 通用:SVG 图渲染器 ================= */

type NState = "lit" | "ok" | "fringe" | "dim" | undefined;

interface GSNode {
  id: number;
  x: number;
  y: number;
  label?: ReactNode;
}
interface GSEdge {
  a: number;
  b: number;
  w?: number;
}

const R = 19;

function shorten(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r1: number,
  r2: number,
): [number, number, number, number] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return [x1 + ux * r1, y1 + uy * r1, x2 - ux * r2, y2 - uy * r2];
}

function GraphSvg({
  nodes,
  edges,
  w,
  h,
  directed = false,
  state,
  sub,
  active,
  onPick,
}: {
  nodes: GSNode[];
  edges: GSEdge[];
  w: number;
  h: number;
  directed?: boolean;
  state?: Record<number, NState>;
  sub?: Record<number, ReactNode>;
  active?: [number, number] | null;
  onPick?: (id: number) => void;
}) {
  const mid = useId().replace(/[:]/g, "");
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const isActive = (e: GSEdge) =>
    !!active &&
    ((active[0] === e.a && active[1] === e.b) ||
      (!directed && active[0] === e.b && active[1] === e.a));

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="gr-svg"
      style={{ maxWidth: w }}
      aria-hidden
    >
      <defs>
        <marker
          id={`${mid}-arrow`}
          markerWidth="9"
          markerHeight="9"
          refX="7.5"
          refY="3.5"
          orient="auto"
        >
          <path d="M0,0 L7.5,3.5 L0,7 Z" className="gr-arrowhead" />
        </marker>
        <marker
          id={`${mid}-arrowA`}
          markerWidth="9"
          markerHeight="9"
          refX="7.5"
          refY="3.5"
          orient="auto"
        >
          <path d="M0,0 L7.5,3.5 L0,7 Z" className="gr-arrowhead active" />
        </marker>
      </defs>

      {/* 边 */}
      {edges.map((e) => {
        const na = byId.get(e.a)!;
        const nb = byId.get(e.b)!;
        const on = isActive(e);
        const [x1, y1, x2, y2] = shorten(
          na.x,
          na.y,
          nb.x,
          nb.y,
          R + 1,
          directed ? R + 8 : R + 1,
        );
        const mx = (na.x + nb.x) / 2;
        const my = (na.y + nb.y) / 2;
        const dx = nb.x - na.x;
        const dy = nb.y - na.y;
        const len = Math.hypot(dx, dy) || 1;
        // 权重标签沿边的法线方向偏移一点,避免压在线上
        const ox = (-dy / len) * 11;
        const oy = (dx / len) * 11;
        return (
          <g key={`${e.a}-${e.b}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={`gr-edge${on ? " active flow-edge" : ""}`}
              markerEnd={
                directed
                  ? `url(#${mid}-${on ? "arrowA" : "arrow"})`
                  : undefined
              }
            />
            {e.w != null && (
              <text
                x={mx + ox}
                y={my + oy + 4}
                textAnchor="middle"
                className="gr-weight"
              >
                {e.w}
              </text>
            )}
          </g>
        );
      })}

      {/* 节点 */}
      {nodes.map((n) => {
        const st = state?.[n.id];
        return (
          <g
            key={n.id}
            className={`gr-nd${st ? ` ${st}` : ""}${onPick ? " pick" : ""}`}
            style={{ transform: `translate(${n.x}px, ${n.y}px)` }}
            onClick={onPick ? () => onPick(n.id) : undefined}
          >
            <circle r={R} />
            <text dy={5} textAnchor="middle">
              {n.label ?? n.id}
            </text>
            {sub?.[n.id] != null && (
              <text dy={R + 17} textAnchor="middle" className="gr-sub">
                {sub[n.id]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ================= §01 TermGraph:术语全图解 ================= */

const TERM_NODES: GSNode[] = [
  { id: 0, x: 90, y: 80, label: "A" },
  { id: 1, x: 240, y: 55, label: "B" },
  { id: 2, x: 240, y: 190, label: "C" },
  { id: 3, x: 390, y: 80, label: "D" },
  { id: 4, x: 390, y: 210, label: "E" },
];
const TERM_EDGES: GSEdge[] = [
  { a: 0, b: 1 },
  { a: 0, b: 2 },
  { a: 1, b: 2 },
  { a: 1, b: 3 },
  { a: 2, b: 4 },
  { a: 3, b: 4 },
];

export function TermGraph() {
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Every word this chapter uses, on one graph"
          zh="一张图里的「行话」全图解"
        />
      </div>
      <div className="viz-stage">
        {/* viewBox 比图形本身宽一些,给较长的英文标注留出右侧空间 */}
        <svg
          viewBox="0 0 560 270"
          className="gr-svg"
          style={{ maxWidth: 560 }}
          aria-hidden
        >
          {/* 复用 GraphSvg 的画法,这里内联以叠加标注 */}
          {TERM_EDGES.map((e) => {
            const na = TERM_NODES.find((n) => n.id === e.a)!;
            const nb = TERM_NODES.find((n) => n.id === e.b)!;
            const [x1, y1, x2, y2] = shorten(na.x, na.y, nb.x, nb.y, R + 1, R + 1);
            const tri = (e.a === 0 && e.b === 1) || (e.a === 0 && e.b === 2) || (e.a === 1 && e.b === 2);
            return (
              <line
                key={`${e.a}-${e.b}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={`gr-edge${tri ? " cyc" : ""}`}
              />
            );
          })}
          {TERM_NODES.map((n) => (
            <g key={n.id} className="gr-nd" style={{ transform: `translate(${n.x}px, ${n.y}px)` }}>
              <circle r={R} />
              <text dy={5} textAnchor="middle">
                {n.label}
              </text>
            </g>
          ))}
          {/* 标注 */}
          <text x={90} y={44} textAnchor="middle" className="gr-lab acc">
            <T en="vertex (V)" zh="顶点 vertex(V)" />
          </text>
          <text x={165} y={54} textAnchor="middle" className="gr-lab">
            <T en="edge (E)" zh="边 edge(E)" />
          </text>
          <text x={165} y={140} textAnchor="middle" className="gr-lab risk">
            <T en="A-B-C triangle: a cycle" zh="A–B–C 三角:环 cycle" />
          </text>
          <text x={315} y={60} textAnchor="middle" className="gr-lab">
            <T en="path A-B-D-E" zh="路径 A→B→D→E" />
          </text>
          <text x={240} y={230} textAnchor="middle" className="gr-lab">
            <T
              en="B has 3 edges, so degree = 3"
              zh="B 有 3 条边 → 度 degree = 3"
            />
          </text>
          <text x={445} y={150} textAnchor="middle" className="gr-lab ok">
            <T en="all pairs reachable: connected" zh="任意两点可达 = 连通" />
          </text>
        </svg>
      </div>
      <div className="viz-msg">
        <T
          en={
            <>
              A <b>vertex</b> holds data. An <b>edge</b> records a relationship
              between two vertices. The number of edges at one vertex is its{" "}
              <b>degree</b>. Two vertices are <b>connected</b> when you can walk
              from one to the other along edges. A closed walk that returns to
              its starting vertex is a <b>cycle</b>. Everything in this chapter
              is built from these five words.
            </>
          }
          zh={
            <>
              <b>顶点</b>装数据,<b>边</b>记录两点之间的关系;
              一个点连了几条边就是它的<b>度 degree</b>;
              能沿边从一个点走到另一个点就说它们<b>连通 connected</b>;
              起点等于终点的闭合路径叫<b>环 cycle</b>。
              本章的一切,都由这几个词拼出来。
            </>
          }
        />
      </div>
    </div>
  );
}

/* ================= §01 MiniConcepts:无向 / 有向 / 带权 ================= */

function TinyGraph({
  directed,
  weighted,
}: {
  directed?: boolean;
  weighted?: boolean;
}) {
  const nodes: GSNode[] = [
    { id: 0, x: 45, y: 40, label: "A" },
    { id: 1, x: 140, y: 40, label: "B" },
    { id: 2, x: 92, y: 120, label: "C" },
  ];
  const edges: GSEdge[] = [
    { a: 0, b: 1, w: weighted ? 5 : undefined },
    { a: 1, b: 2, w: weighted ? 2 : undefined },
    { a: 0, b: 2, w: weighted ? 8 : undefined },
  ];
  return (
    <GraphSvg nodes={nodes} edges={edges} w={185} h={165} directed={directed} />
  );
}

export function MiniConcepts() {
  return (
    <div className="gr-mini3">
      <div className="card">
        <div className="card-kicker">
          <T en="Undirected" zh="无向图 undirected" />
        </div>
        <TinyGraph />
        <p>
          <T
            en={
              <>
                An edge has no direction, so the relationship is{" "}
                <b>symmetric</b>: A and B are friends of each other, and a train
                line runs both ways. A tree is a graph of this kind: undirected,
                connected, and with no cycle.
              </>
            }
            zh={
              <>
                边没有方向,关系是<b>对称</b>的:A 和 B 互为朋友、地铁双向通车。
                树就是这一类:无向、连通、且没有环。
              </>
            }
          />
        </p>
      </div>
      <div className="card">
        <div className="card-kicker">
          <T en="Directed" zh="有向图 directed" />
        </div>
        <TinyGraph directed />
        <p>
          <T
            en={
              <>
                An edge has an arrow, so the relationship runs <b>one way</b>: A
                follows B is not the same as B follows A, and page A links to
                page B. Degree now splits into <b>in-degree</b> (arrows coming
                in) and <b>out-degree</b> (arrows going out). A singly linked
                list is a directed graph with one outgoing edge per node.
              </>
            }
            zh={
              <>
                边有箭头,关系是<b>单向</b>的:A 关注 B 不等于 B 关注 A、
                网页 A 链到 B。此时度分成<b>入度</b>(指进来的)和
                <b>出度</b>(指出去的)。单链表就是「每个点只有一条出边」的有向图。
              </>
            }
          />
        </p>
      </div>
      <div className="card">
        <div className="card-kicker">
          <T en="Weighted" zh="带权图 weighted" />
        </div>
        <TinyGraph directed weighted />
        <p>
          <T
            en={
              <>
                Each edge carries a number, its <b>weight</b>: a distance, a
                duration, a cost. A shortest path question then asks for the{" "}
                <b>smallest total weight</b>, not the fewest edges. Weight and
                direction are independent choices. The graph drawn here happens
                to be directed and weighted at the same time, but a weighted
                undirected graph is just as common.
              </>
            }
            zh={
              <>
                边上带数字(权 weight):距离、时间、费用。
                此时「最短路」问的是<b>权之和最小</b>的那条路,而不是边数最少。
                有没有方向和有没有权是两个独立的选择 ——
                这里画的恰好既有向又带权,但带权的无向图同样常见。
              </>
            }
          />
        </p>
      </div>
    </div>
  );
}

/* ================= §02 ReprLab:邻接矩阵 vs 邻接表 ================= */

const REPR_ADJ: number[][] = [
  [1, 2], // 0
  [0, 2, 3], // 1
  [0, 1, 3], // 2
  [1, 2, 4], // 3
  [3], // 4
];
const REPR_NODES: GSNode[] = [
  { id: 0, x: 60, y: 60 },
  { id: 1, x: 210, y: 55 },
  { id: 2, x: 60, y: 185 },
  { id: 3, x: 205, y: 175 },
  { id: 4, x: 285, y: 115 },
];
const REPR_EDGES: GSEdge[] = (() => {
  const seen = new Set<string>();
  const out: GSEdge[] = [];
  REPR_ADJ.forEach((nb, a) =>
    nb.forEach((b) => {
      const k = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!seen.has(k)) {
        seen.add(k);
        const [x, y] = k.split("-").map(Number);
        out.push({ a: x, b: y });
      }
    }),
  );
  return out;
})();

export function ReprLab() {
  const [sel, setSel] = useState(1);
  const n = REPR_ADJ.length;
  const state: Record<number, NState> = {};
  REPR_NODES.forEach((nd) => {
    state[nd.id] =
      nd.id === sel ? "lit" : REPR_ADJ[sel].includes(nd.id) ? "fringe" : undefined;
  });

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="One graph, two representations — click a vertex to see it in both"
          zh="同一张图,两种存法 —— 点任意一个顶点,看它在两种表示法里的样子"
        />
      </div>
      <div className="viz-stage gr-repr">
        <div className="gr-repr-graph">
          <GraphSvg
            nodes={REPR_NODES}
            edges={REPR_EDGES}
            w={320}
            h={240}
            state={state}
            onPick={setSel}
          />
          <div className="gr-repr-hint">
            <T
              en={<>click a vertex · current = {sel}</>}
              zh={<>点顶点切换 · 当前 = {sel}</>}
            />
          </div>
        </div>

        {/* 邻接矩阵 */}
        <div className="gr-repr-col">
          <div className="gr-lane-cap">
            <T
              en="Adjacency matrix · matrix[i][j] = 1 means an edge"
              zh="邻接矩阵 · matrix[i][j] = 1 表示有边"
            />
          </div>
          <table className="gr-matrix">
            <tbody>
              <tr>
                <th />
                {Array.from({ length: n }).map((_, j) => (
                  <th key={j} className={j === sel ? "hl" : ""}>
                    {j}
                  </th>
                ))}
              </tr>
              {Array.from({ length: n }).map((_, i) => (
                <tr key={i}>
                  <th className={i === sel ? "hl" : ""}>{i}</th>
                  {Array.from({ length: n }).map((_, j) => {
                    const one = REPR_ADJ[i].includes(j);
                    const rowSel = i === sel;
                    return (
                      <td
                        key={j}
                        className={`${one ? "one" : "zero"}${
                          rowSel ? " rowsel" : ""
                        }${rowSel && one ? " on" : ""}`}
                      >
                        {one ? 1 : 0}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="gr-repr-note">
            <T
              en={
                <>
                  A V x V table. Asking &ldquo;is there an edge between i and
                  j?&rdquo; is <b>O(1)</b>, but the table occupies <b>O(V²)</b>{" "}
                  however few edges the graph has.
                </>
              }
              zh={
                <>
                  V x V 的表格:查「i、j 之间有没有边」是 <b>O(1)</b>,
                  但不管图多稀疏,都硬占 <b>O(V²)</b> 空间。
                </>
              }
            />
          </div>
        </div>

        {/* 邻接表 */}
        <div className="gr-repr-col">
          <div className="gr-lane-cap">
            <T
              en="Adjacency list · each vertex keeps its neighbors"
              zh="邻接表 · 每个点挂一串邻居"
            />
          </div>
          <div className="gr-adjlist">
            {REPR_ADJ.map((nb, i) => (
              <div key={i} className={`gr-adjrow${i === sel ? " hl" : ""}`}>
                <span className="gr-adjkey">{i}</span>
                <span className="gr-adjarrow">→</span>
                {nb.length ? (
                  nb.map((v) => (
                    <span key={v} className="gr-chip">
                      {v}
                    </span>
                  ))
                ) : (
                  <span className="gr-empty">
                    <T en="empty" zh="空" />
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="gr-repr-note">
            <T
              en={
                <>
                  Only the edges that exist are stored: <b>O(V + E)</b> space,
                  and reading the neighbors of one vertex is fast. This is the
                  default for a sparse graph, where E is far smaller than V².
                </>
              }
              zh={
                <>
                  只存真实存在的边:空间 <b>O(V + E)</b>,取某点的邻居也很快 ——
                  稀疏图(E 远小于 V²)的默认选择。
                </>
              }
            />
          </div>
        </div>
      </div>
      <div className="viz-msg">
        <T
          en={
            <>
              The neighbors of vertex <b>{sel}</b> are{" "}
              <b>[{REPR_ADJ[sel].join(", ")}]</b>. In the matrix they are the
              columns holding 1 in row {sel}; in the list they are the chips
              hanging off row {sel}. Both store <b>the same graph</b>. They
              differ only in what they make cheap: a fast edge test, or small
              memory plus fast neighbor scanning.
            </>
          }
          zh={
            <>
              顶点 <b>{sel}</b> 的邻居是 <b>[{REPR_ADJ[sel].join(", ")}]</b>:
              矩阵里是第 {sel} 行中所有为 1 的列;邻接表里就是第 {sel}{" "}
              行挂着的那串。两种表示装的是<b>同一张图</b>,
              区别只在于它们让什么变便宜:查边快,还是省空间加遍历邻居快。
            </>
          }
        />
      </div>
    </div>
  );
}

/* ================= §03 GraphLab:招牌 —— BFS / DFS 逐帧 ================= */

const ADJ: number[][] = [
  [1, 2], // 0
  [0, 3, 4], // 1
  [0, 4, 5], // 2
  [1, 6], // 3
  [1, 2, 6, 7], // 4
  [2, 7], // 5
  [3, 4, 7], // 6
  [4, 5, 6], // 7
];
const GRAPH_NODES: GSNode[] = [
  { id: 0, x: 70, y: 70 },
  { id: 1, x: 210, y: 50 },
  { id: 2, x: 90, y: 210 },
  { id: 3, x: 360, y: 55 },
  { id: 4, x: 240, y: 175 },
  { id: 5, x: 120, y: 315 },
  { id: 6, x: 415, y: 180 },
  { id: 7, x: 300, y: 300 },
];
const GRAPH_EDGES: GSEdge[] = (() => {
  const seen = new Set<string>();
  const out: GSEdge[] = [];
  ADJ.forEach((nb, a) =>
    nb.forEach((b) => {
      const k = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!seen.has(k)) {
        seen.add(k);
        const [x, y] = k.split("-").map(Number);
        out.push({ a: x, b: y });
      }
    }),
  );
  return out;
})();

interface TravFrame {
  cur: number | null;
  done: number[];
  fringe: number[];
  order: Record<number, number>;
  active: [number, number] | null;
  msg: ReactNode;
}

function buildBfs(): TravFrame[] {
  const frames: TravFrame[] = [];
  const visited = new Set<number>([0]);
  const order: Record<number, number> = {};
  let seq = 0;
  const q: number[] = [0];
  const done: number[] = [];
  frames.push({
    cur: null,
    done: [],
    fringe: [0],
    order: {},
    active: null,
    msg: (
      <T
        en={
          <>
            The start vertex <b>0</b> goes into the queue. BFS uses a{" "}
            <b>queue (first in, first out)</b>, so a vertex found earlier is
            processed earlier and the search spreads one layer at a time. Mark a
            vertex <b>as soon as it enters the queue</b>, not when it leaves:
            that is what stops the same vertex from being queued twice.
          </>
        }
        zh={
          <>
            起点 <b>0</b> 入队。BFS 用<b>队列(先进先出)</b>:
            先被发现的点先被处理,搜索就一层一层往外扩(呼应第 5 章队列)。
            <b>一入队就标记 visited</b>,而不是出队才标记 ——
            这样同一个点不会被排两次队。
          </>
        }
      />
    ),
  });
  while (q.length) {
    const u = q.shift()!;
    order[u] = seq++;
    const newly: number[] = [];
    for (const v of ADJ[u])
      if (!visited.has(v)) {
        visited.add(v);
        q.push(v);
        newly.push(v);
      }
    frames.push({
      cur: u,
      done: [...done],
      fringe: [...q],
      order: { ...order },
      active: null,
      msg: newly.length ? (
        <T
          en={
            <>
              Dequeue <b>{u}</b> (visit number {order[u] + 1}) and append its
              unseen neighbors <b>{newly.join(", ")}</b> to the back of the
              queue. The queue always holds the vertices to process next.
            </>
          }
          zh={
            <>
              出队 <b>{u}</b>(第 {order[u] + 1} 个访问),把它没见过的邻居{" "}
              <b>{newly.join("、")}</b> 塞到队尾。
              队列里装的正是「下一批要处理的点」。
            </>
          }
        />
      ) : (
        <T
          en={
            <>
              Dequeue <b>{u}</b> (visit number {order[u] + 1}). Every neighbor is
              already in visited, so nothing is added to the queue.
            </>
          }
          zh={
            <>
              出队 <b>{u}</b>(第 {order[u] + 1} 个访问),
              邻居全在 visited 里了 —— 无人入队。
            </>
          }
        />
      ),
    });
    done.push(u);
  }
  frames.push({
    cur: null,
    done: [...done],
    fringe: [],
    order: { ...order },
    active: null,
    msg: (
      <T
        en={
          <>
            The queue is empty, so the traversal is finished. The visit order is{" "}
            <b>0 1 2 3 4 5 6 7</b>, strictly <b>by layer</b>:{" "}
            {"{0} → {1,2} → {3,4,5} → {6,7}"}. Layer k holds exactly the vertices
            that are k edges from the start. That is why BFS finds the{" "}
            <b>fewest-edges path in an unweighted graph</b> (§06). Once edges
            carry different weights this no longer holds, and you need Dijkstra.
          </>
        }
        zh={
          <>
            队列空,遍历结束。访问序 <b>0 1 2 3 4 5 6 7</b>,严格<b>按层</b>:
            {"{0} → {1,2} → {3,4,5} → {6,7}"}。第 k 层装的正好是「距起点 k
            条边」的点 —— 这就是 BFS 能求<b>无权图最少边数路径</b>的原因(§06)。
            一旦边权各不相同,这个结论就不成立,得换 Dijkstra。
          </>
        }
      />
    ),
  });
  return frames;
}

function buildDfs(): TravFrame[] {
  const frames: TravFrame[] = [];
  const visited = new Set<number>();
  const order: Record<number, number> = {};
  let seq = 0;
  const stack: number[] = [];
  const done: number[] = [];
  frames.push({
    cur: null,
    done: [],
    fringe: [],
    order: {},
    active: null,
    msg: (
      <T
        en={
          <>
            DFS uses a <b>stack</b> — when you write it as recursion, the call
            stack is that stack. It follows one path as far as it can, then backs
            up and tries another. The lane below shows the part of the stack{" "}
            <b>underneath the current vertex</b>, which is the path back to the
            start.
          </>
        }
        zh={
          <>
            DFS 用<b>栈</b>(写成递归时,系统调用栈就是这个栈)——
            沿一条路一直走到走不通,再退回上一个岔口换一条。
            下方栈里显示的是<b>当前节点之下</b>的那段栈,也就是回到起点的路径。
          </>
        }
      />
    ),
  });
  const dfs = (u: number, parent: number | null) => {
    visited.add(u);
    order[u] = seq++;
    stack.push(u);
    frames.push({
      cur: u,
      done: [...done],
      fringe: stack.slice(0, -1),
      order: { ...order },
      active: parent === null ? null : [parent, u],
      msg:
        parent === null ? (
          <T
            en={
              <>
                Start at <b>0</b>. Push it on the stack and record it as visit
                number 1.
              </>
            }
            zh={
              <>
                从起点 <b>0</b> 出发,压栈,记为访问序 1。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                Follow edge{" "}
                <b>
                  {parent}–{u}
                </b>{" "}
                deeper and visit <b>{u}</b> (visit number {order[u] + 1}), then
                push it. As long as the current vertex still has an unvisited
                neighbor, DFS does not turn back.
              </>
            }
            zh={
              <>
                沿边{" "}
                <b>
                  {parent}–{u}
                </b>{" "}
                往深处走,访问 <b>{u}</b>(第 {order[u] + 1} 个),压栈。
                只要当前点还有没走过的邻居,DFS 就不回头。
              </>
            }
          />
        ),
    });
    for (const v of ADJ[u]) if (!visited.has(v)) dfs(v, u);
    stack.pop();
    done.push(u);
    const back = stack.length ? stack[stack.length - 1] : null;
    frames.push({
      cur: back,
      done: [...done],
      fringe: back === null ? [] : stack.slice(0, -1),
      order: { ...order },
      active: back === null ? null : [back, u],
      msg:
        back === null ? (
          <T
            en={
              <>
                Every neighbor of <b>{u}</b> has been visited, so pop it. The
                stack is now empty and DFS is finished.
              </>
            }
            zh={
              <>
                <b>{u}</b> 的邻居全部访问过,弹栈。栈空 —— DFS 结束。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                <b>{u}</b> has no unvisited neighbor left, so pop it and{" "}
                <b>backtrack</b> to <b>{back}</b>, then look for a neighbor of{" "}
                {back} that has not been visited yet.
              </>
            }
            zh={
              <>
                <b>{u}</b> 已经没有未访问的邻居,弹栈<b>回溯</b>到{" "}
                <b>{back}</b>,继续找 {back} 还没走过的邻居。
              </>
            }
          />
        ),
    });
  };
  dfs(0, null);
  frames.push({
    cur: null,
    done: [...done],
    fringe: [],
    order: { ...order },
    active: null,
    msg: (
      <T
        en={
          <>
            The visit order is <b>0 1 3 6 4 2 5 7</b>, completely different from
            BFS: DFS runs to the deepest vertex it can reach (0→1→3→6→…) before
            turning back. <b>The visited set is not optional.</b> This graph has
            cycles, and without visited the traversal would go around one
            forever. A tree has no cycle, which is why tree traversal needs no
            visited set.
          </>
        }
        zh={
          <>
            访问序 <b>0 1 3 6 4 2 5 7</b> —— 和 BFS 完全不同:DFS
            先一头扎到最深(0→1→3→6→…)才回头。<b>visited 绝不能省</b>:
            这张图有环,少了它就会在环里无限打转。树没有环,
            所以树的遍历才不需要 visited。
          </>
        }
      />
    ),
  });
  return frames;
}

const BFS_FRAMES = buildBfs();
const DFS_FRAMES = buildDfs();

function TravPlayer({
  frames,
  kind,
}: {
  frames: TravFrame[];
  kind: "queue" | "stack";
}) {
  const s = useStepper(frames.length, 1300);
  const f = frames[s.step];
  const state: Record<number, NState> = {};
  GRAPH_NODES.forEach((nd) => {
    state[nd.id] =
      nd.id === f.cur
        ? "lit"
        : f.done.includes(nd.id)
          ? "ok"
          : f.fringe.includes(nd.id)
            ? "fringe"
            : undefined;
  });
  const sub: Record<number, ReactNode> = {};
  Object.keys(f.order).forEach((k) => {
    sub[+k] = <>#{f.order[+k] + 1}</>;
  });
  const visited = [
    ...new Set<number>([...f.done, ...(f.cur != null ? [f.cur] : []), ...f.fringe]),
  ].sort((a, b) => a - b);

  return (
    <>
      <div className="viz-stage gr-wrap">
        <div className="gr-canvas">
          <GraphSvg
            nodes={GRAPH_NODES}
            edges={GRAPH_EDGES}
            w={500}
            h={360}
            state={state}
            sub={sub}
            active={f.active}
          />
        </div>
        <div className="gr-lanes">
          <div className="gr-lane">
            <div className="gr-lane-cap">
              {kind === "queue" ? (
                <T en="Queue · left = front" zh="队列 queue · 左 = 队首" />
              ) : (
                <T
                  en="Stack below the current vertex · right = its parent"
                  zh="栈:当前节点之下的部分 · 右 = 它的父节点"
                />
              )}
            </div>
            <div className="gr-chips">
              {f.fringe.length ? (
                f.fringe.map((v, i) => (
                  <span
                    key={i}
                    className={`gr-chip${
                      (kind === "queue" ? i === 0 : i === f.fringe.length - 1)
                        ? " top"
                        : ""
                    }`}
                  >
                    {v}
                  </span>
                ))
              ) : (
                <span className="gr-empty">
                  <T en="empty" zh="空" />
                </span>
              )}
            </div>
          </div>
          <div className="gr-lane">
            <div className="gr-lane-cap">
              <T en="visited set" zh="visited 已访问集合" />
            </div>
            <div className="gr-chips">
              {visited.length ? (
                visited.map((v) => (
                  <span key={v} className="gr-chip done">
                    {v}
                  </span>
                ))
              ) : (
                <span className="gr-empty">
                  <T en="empty" zh="空" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={frames.length} />
    </>
  );
}

export function GraphLab() {
  const [mode, setMode] = useState<"bfs" | "dfs">("bfs");
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Traversal lab — one graph, BFS and DFS side by side"
          zh="遍历实验室 —— 同一张图,BFS 与 DFS 逐帧对比"
        />
        <span className="seg" style={{ marginLeft: "auto" }}>
          <button
            type="button"
            className={`seg-btn${mode === "bfs" ? " on" : ""}`}
            onClick={() => setMode("bfs")}
          >
            <T en="BFS · breadth-first" zh="BFS 广度优先" />
          </button>
          <button
            type="button"
            className={`seg-btn${mode === "dfs" ? " on" : ""}`}
            onClick={() => setMode("dfs")}
          >
            <T en="DFS · depth-first" zh="DFS 深度优先" />
          </button>
        </span>
      </div>
      <TravPlayer
        key={mode}
        frames={mode === "bfs" ? BFS_FRAMES : DFS_FRAMES}
        kind={mode === "bfs" ? "queue" : "stack"}
      />
    </div>
  );
}

/* ================= §06 GridDfsLab:LC200 岛屿数量 ================= */

const GRID: number[][] = [
  [1, 1, 0, 0, 1],
  [1, 0, 0, 1, 1],
  [0, 0, 1, 0, 0],
  [0, 1, 1, 0, 0],
];
type CellState = "sea" | "land" | "cur" | "sunk";
interface GridFrame {
  status: CellState[][];
  count: number;
  scan: [number, number] | null;
  msg: ReactNode;
}

function buildGridFrames(): GridFrame[] {
  const Rn = GRID.length;
  const Cn = GRID[0].length;
  const status: CellState[][] = GRID.map((row) =>
    row.map((v) => (v === 1 ? "land" : "sea")),
  );
  const frames: GridFrame[] = [];
  let count = 0;
  const snap = (msg: ReactNode, scan: [number, number] | null = null) =>
    frames.push({
      status: status.map((r) => r.slice()),
      count,
      scan,
      msg,
    });

  snap(
    <T
      en={
        <>
          A grid is already a graph: <b>each cell is a vertex</b>, and{" "}
          <b>
            two cells that touch up, down, left, or right are joined by an edge
          </b>
          . The rule here: scan cell by cell; when you meet a <b>1</b> that has
          not been sunk yet, add 1 to the island count, then run DFS to sink
          every connected 1 to 0, so the same island is never counted twice.
        </>
      }
      zh={
        <>
          网格本身就是一张图:<b>每个格子是一个顶点</b>,
          <b>上下左右相邻的两个格子之间有一条边</b>。规则:逐格扫描,
          遇到还没淹过的陆地 <b>1</b> 就把岛屿数 +1,再 DFS
          把这座岛所有相连的 1 全部「淹成 0」,同一座岛就不会被重复计数。
        </>
      }
    />,
  );

  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  const dfs = (r: number, c: number) => {
    status[r][c] = "cur";
    snap(
      <T
        en={
          <>
            Sink (
            <b>
              {r},{c}
            </b>
            ): mark this land cell as visited by turning it into water, then
            recurse into its four neighbors. Changing the value is the visited
            set here, so no separate matrix is needed.
          </>
        }
        zh={
          <>
            淹没 (
            <b>
              {r},{c}
            </b>
            ):把当前陆地标记为已访问(染成水),再朝上下左右四个方向递归。
            改值本身就充当了 visited,不用另开一个矩阵。
          </>
        }
      />,
    );
    status[r][c] = "sunk";
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr >= 0 &&
        nr < Rn &&
        nc >= 0 &&
        nc < Cn &&
        status[nr][nc] === "land"
      )
        dfs(nr, nc);
    }
  };

  for (let r = 0; r < Rn; r++) {
    for (let c = 0; c < Cn; c++) {
      if (status[r][c] === "land") {
        count++;
        snap(
          <T
            en={
              <>
                The scan reaches land at (
                <b>
                  {r},{c}
                </b>
                ) that belongs to no island sunk so far. Island number{" "}
                <b>{count}</b> starts here, and DFS begins sinking the whole
                connected piece.
              </>
            }
            zh={
              <>
                扫描到新陆地 (
                <b>
                  {r},{c}
                </b>
                ):它不属于任何已淹的岛,于是第 <b>{count}</b> 座岛诞生,
                启动 DFS 淹没整片相连陆地。
              </>
            }
          />,
          [r, c],
        );
        dfs(r, c);
      }
    }
  }
  snap(
    <T
      en={
        <>
          The whole grid has been scanned: <b>{count}</b> islands. Each cell is
          entered at most once, so the time is <b>O(rows x cols)</b>. The space
          is the recursion depth, which in the worst case (every cell is land) is
          also O(rows x cols).
        </>
      }
      zh={
        <>
          全图扫描完毕,共 <b>{count}</b> 座岛。每个格子最多被进入一次 → 时间{" "}
          <b>O(行 x 列)</b>。空间是递归栈深度,最坏(全是陆地)也是 O(行 x 列)。
        </>
      }
    />,
  );
  return frames;
}

const GRID_FRAMES = buildGridFrames();

export function GridDfsLab() {
  const s = useStepper(GRID_FRAMES.length, 950);
  const f = GRID_FRAMES[s.step];
  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="LC 200 · Number of Islands — sinking with DFS, frame by frame"
          zh="LC 200 · 岛屿数量 —— DFS 淹没法,逐帧"
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 14 }}>
        <div className="gr-grid">
          {f.status.map((row, r) => (
            <div key={r} className="gr-grow">
              {row.map((cell, c) => {
                const isScan =
                  f.scan != null && f.scan[0] === r && f.scan[1] === c;
                const val = cell === "sea" || cell === "sunk" ? 0 : 1;
                return (
                  <div
                    key={c}
                    className={`gr-gcell ${cell}${isScan ? " scan" : ""}`}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="gr-count">
          <T en="Islands counted · " zh="岛屿计数 · " />
          <b>{f.count}</b>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={GRID_FRAMES.length} />
    </div>
  );
}

/* ================= §06 TopoLab:LC207 拓扑排序(Kahn)================= */

const TOPO_ADJ: number[][] = [
  [1, 2], // 0 → 1,2
  [3], // 1 → 3
  [3], // 2 → 3
  [4, 5], // 3 → 4,5
  [], // 4
  [], // 5
];
const TOPO_NODES: GSNode[] = [
  { id: 0, x: 55, y: 105 },
  { id: 1, x: 190, y: 45 },
  { id: 2, x: 190, y: 165 },
  { id: 3, x: 325, y: 105 },
  { id: 4, x: 455, y: 50 },
  { id: 5, x: 455, y: 160 },
];
const TOPO_EDGES: GSEdge[] = TOPO_ADJ.flatMap((nb, a) =>
  nb.map((b) => ({ a, b })),
);

interface TopoFrame {
  indeg: number[];
  queue: number[];
  out: number[];
  done: number[];
  cur: number | null;
  active: [number, number] | null;
  msg: ReactNode;
}

function buildTopoFrames(): TopoFrame[] {
  const n = TOPO_ADJ.length;
  const indeg = new Array(n).fill(0);
  TOPO_ADJ.forEach((nb) => nb.forEach((v) => indeg[v]++));
  const cur = indeg.slice();
  const q: number[] = [];
  const out: number[] = [];
  const done: number[] = [];
  const frames: TopoFrame[] = [];
  const snap = (
    curNode: number | null,
    active: [number, number] | null,
    msg: ReactNode,
  ) =>
    frames.push({
      indeg: cur.slice(),
      queue: [...q],
      out: [...out],
      done: [...done],
      cur: curNode,
      active,
      msg,
    });

  snap(
    null,
    null,
    <T
      en={
        <>
          A topological order exists only for a <b>directed acyclic graph</b>.
          Start by counting the <b>in-degree</b> of each vertex: how many arrows
          point at it, that is, how many prerequisites it still has. Course 3 is
          pointed at by 1 and 2, so its in-degree is 2. Nothing points at course
          0, so its in-degree is 0.
        </>
      }
      zh={
        <>
          拓扑序只对<b>有向无环图</b>存在。第一步是数每个点的<b>入度</b>:
          有几根箭头指向它,也就是它还有几门没修完的前置课。
          课程 3 被 1、2 指向,入度 2;课程 0 没人指向,入度 0。
        </>
      }
    />,
  );
  for (let i = 0; i < n; i++) if (cur[i] === 0) q.push(i);
  snap(
    null,
    null,
    <T
      en={
        <>
          Enqueue every vertex whose <b>in-degree is 0</b>, that is, every course
          with no prerequisite left: <b>{q.join(", ") || "none"}</b>. These can
          be taken right now.
        </>
      }
      zh={
        <>
          把所有<b>入度为 0</b>(没有前置课)的点入队:
          <b>{q.join("、") || "无"}</b>。它们现在就能上。
        </>
      }
    />,
  );
  while (q.length) {
    const u = q.shift()!;
    out.push(u);
    const enq: number[] = [];
    for (const v of TOPO_ADJ[u]) {
      cur[v]--;
      if (cur[v] === 0) {
        q.push(v);
        enq.push(v);
      }
    }
    done.push(u);
    snap(
      u,
      null,
      <T
        en={
          <>
            Dequeue <b>{u}</b> and append it to the topological order (this
            course is now finished). Every course it points at loses 1 from its
            in-degree
            {enq.length ? (
              <>
                , and <b>{enq.join(", ")}</b> reached 0, so they enter the queue
              </>
            ) : (
              <></>
            )}
            .
          </>
        }
        zh={
          <>
            出队 <b>{u}</b> 加入拓扑序(这门课修完了)。它指向的每门课入度各减 1
            {enq.length ? (
              <>
                ,其中 <b>{enq.join("、")}</b> 减到 0,可以入队了
              </>
            ) : (
              <></>
            )}
            。
          </>
        }
      />,
    );
  }
  snap(
    null,
    null,
    out.length === n ? (
      <T
        en={
          <>
            Topological order: <b>{out.join(" → ")}</b>. All {n} courses left the
            queue, so <b>the graph has no cycle</b> and the schedule is possible.
            If the queue had emptied while courses were still waiting, those
            courses would <b>depend on each other in a cycle</b> and none of them
            could ever start. That is exactly the test LC 207 asks for, and it is
            one of the two standard ways to detect a cycle in a directed graph.
          </>
        }
        zh={
          <>
            拓扑序:<b>{out.join(" → ")}</b>。全部 {n} 门课都出了队 ⇒{" "}
            <b>图无环</b>,课程表可行。若中途队列空了却还有课没出,
            说明剩下的课<b>互相依赖成环</b>,谁都开不了头 —— 这正是 LC207
            的判定,也是有向图判环的两种标准做法之一。
          </>
        }
      />
    ) : (
      <T
        en={
          <>
            A cycle exists: only {out.length} of {n} courses can be finished.
          </>
        }
        zh={
          <>
            存在环,只有 {out.length}/{n} 门课能修完。
          </>
        }
      />
    ),
  );
  return frames;
}

const TOPO_FRAMES = buildTopoFrames();

export function TopoLab() {
  const s = useStepper(TOPO_FRAMES.length, 1400);
  const f = TOPO_FRAMES[s.step];
  const state: Record<number, NState> = {};
  TOPO_NODES.forEach((nd) => {
    state[nd.id] =
      nd.id === f.cur
        ? "lit"
        : f.done.includes(nd.id)
          ? "ok"
          : f.queue.includes(nd.id)
            ? "fringe"
            : undefined;
  });
  const sub: Record<number, ReactNode> = {};
  TOPO_NODES.forEach((nd) => {
    sub[nd.id] = (
      <>
        <T en="indeg" zh="入度" /> {f.indeg[nd.id]}
      </>
    );
  });

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="LC 207 · Course Schedule — Kahn's algorithm, frame by frame"
          zh="LC 207 · 课程表 —— Kahn 入度法拓扑排序,逐帧"
        />
      </div>
      <div className="viz-stage gr-wrap">
        <div className="gr-canvas">
          <GraphSvg
            nodes={TOPO_NODES}
            edges={TOPO_EDGES}
            w={520}
            h={210}
            directed
            state={state}
            sub={sub}
            active={f.active}
          />
        </div>
        <div className="gr-lanes">
          <div className="gr-lane">
            <div className="gr-lane-cap">
              <T
                en="Queue · in-degree 0, ready to take"
                zh="队列 · 入度归零、可以上的课"
              />
            </div>
            <div className="gr-chips">
              {f.queue.length ? (
                f.queue.map((v, i) => (
                  <span key={i} className={`gr-chip${i === 0 ? " top" : ""}`}>
                    {v}
                  </span>
                ))
              ) : (
                <span className="gr-empty">
                  <T en="empty" zh="空" />
                </span>
              )}
            </div>
          </div>
          <div className="gr-lane">
            <div className="gr-lane-cap">
              <T
                en="Topological order · decided so far"
                zh="拓扑序 · 已排定的上课顺序"
              />
            </div>
            <div className="gr-chips">
              {f.out.length ? (
                f.out.map((v, i) => (
                  <span key={i} className="gr-chip done">
                    {v}
                  </span>
                ))
              ) : (
                <span className="gr-empty">
                  <T en="empty" zh="空" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={TOPO_FRAMES.length} />
    </div>
  );
}

/* ================= §06 DijkstraLab:LC743 最短路径 ================= */

const DJ_NODES: GSNode[] = [
  { id: 0, x: 55, y: 100 },
  { id: 1, x: 200, y: 45 },
  { id: 2, x: 200, y: 155 },
  { id: 3, x: 345, y: 100 },
  { id: 4, x: 470, y: 100 },
];
const DJ_EDGES: GSEdge[] = [
  { a: 0, b: 1, w: 4 },
  { a: 0, b: 2, w: 1 },
  { a: 2, b: 1, w: 2 },
  { a: 2, b: 3, w: 5 },
  { a: 1, b: 3, w: 1 },
  { a: 3, b: 4, w: 3 },
];
const DJ_ADJ: { v: number; w: number }[][] = (() => {
  const adj: { v: number; w: number }[][] = DJ_NODES.map(() => []);
  DJ_EDGES.forEach((e) => adj[e.a].push({ v: e.b, w: e.w! }));
  return adj;
})();

const INF = Infinity;
interface DjFrame {
  dist: number[];
  settled: number[];
  heap: { v: number; d: number }[];
  cur: number | null;
  active: [number, number] | null;
  updated: number[];
  msg: ReactNode;
}

function buildDijkstra(): DjFrame[] {
  const n = DJ_NODES.length;
  const dist = new Array(n).fill(INF);
  dist[0] = 0;
  const settled: number[] = [];
  const done = new Set<number>();
  const heap: { v: number; d: number }[] = [{ v: 0, d: 0 }];
  const frames: DjFrame[] = [];
  const snap = (
    cur: number | null,
    active: [number, number] | null,
    updated: number[],
    msg: ReactNode,
  ) =>
    frames.push({
      dist: dist.slice(),
      settled: [...settled],
      heap: heap.map((h) => ({ ...h })),
      cur,
      active,
      updated: [...updated],
      msg,
    });

  snap(
    null,
    null,
    [],
    <T
      en={
        <>
          Dijkstra finds the smallest total weight from one start vertex, and it
          requires <b>every edge weight to be non-negative</b>. Set dist[0] = 0
          and every other dist to ∞. A <b>min-heap</b> always returns the vertex
          with the smallest dist that is not settled yet. Because no edge can
          reduce a total, the first time a vertex comes out of the heap its
          distance is already final.
        </>
      }
      zh={
        <>
          Dijkstra 求单源最短路(权之和最小),前提是<b>所有边权非负</b>。
          先令 dist[起点 0] = 0,其余为 ∞。
          <b>小根堆</b>每次弹出「当前 dist 最小、还没定案」的点。
          因为没有一条边会让总和变小,所以一个点第一次被弹出时,
          它的距离就已经是最终答案。
        </>
      }
    />,
  );

  while (heap.length) {
    heap.sort((a, b) => a.d - b.d);
    const top = heap.shift()!;
    const u = top.v;
    if (done.has(u)) continue;
    done.add(u);
    settled.push(u);
    const updated: number[] = [];
    for (const { v, w } of DJ_ADJ[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        heap.push({ v, d: dist[v] });
        updated.push(v);
      }
    }
    snap(
      u,
      null,
      updated,
      <T
        en={
          <>
            Pop <b>{u}</b>, the smallest dist in the heap (={dist[u]}), and{" "}
            <b>settle</b> it (green = its shortest distance is now fixed).
            {updated.length ? (
              <>
                {" "}
                Relax its outgoing edges:{" "}
                <b>{updated.map((x) => `dist[${x}]=${dist[x]}`).join(", ")}</b>.
                Those vertices are not settled yet, so lowering their tentative
                distance is allowed.
              </>
            ) : (
              <> It has no outgoing edge that makes any distance smaller.</>
            )}
          </>
        }
        zh={
          <>
            弹出堆里 dist 最小的 <b>{u}</b>(={dist[u]}),并<b>定案</b>
            (绿色 = 它的最短距离已锁定)。
            {updated.length ? (
              <>
                {" "}
                据此松弛它的出边:
                <b>{updated.map((x) => `dist[${x}]=${dist[x]}`).join("、")}</b>。
                这些点还没定案,所以可以把它们的临时距离改小。
              </>
            ) : (
              <> 它没有能让别人变更短的出边。</>
            )}
          </>
        }
      />,
    );
  }
  snap(
    null,
    null,
    [],
    <T
      en={
        <>
          Every vertex is settled. The shortest distances from 0 are{" "}
          <b>[{dist.join(", ")}]</b>. Notice that dist[1] dropped from 4 to 3
          through 2→1, and dist[3] dropped from 6 to 4 through 1→3. Both changes
          happened while those vertices were still <b>tentative</b>; a settled
          distance is never changed again. Read as LC 743, the network delay is
          the <b>largest of these values, {Math.max(...dist)}</b> — the last
          vertex to receive the signal decides the total. If any vertex were
          still ∞ it would be unreachable, and the answer would be -1.
        </>
      }
      zh={
        <>
          全部定案。0 到各点的最短距离:<b>[{dist.join(", ")}]</b>。
          注意 dist[1] 经 2→1 从 4 降到 3、dist[3] 经 1→3 从 6 降到 4 ——
          这两次变化都发生在它们还是<b>临时距离</b>的时候;一旦定案就不会再改。
          若这是 LC743,网络延迟 = 这些值里的
          <b>最大值 {Math.max(...dist)}</b>(最后收到信号的点决定总耗时);
          若有点仍是 ∞ 则不可达,返回 -1。
        </>
      }
    />,
  );
  return frames;
}

const DJ_FRAMES = buildDijkstra();
const fmt = (x: number) => (x === INF ? "∞" : String(x));

export function DijkstraLab() {
  const s = useStepper(DJ_FRAMES.length, 1500);
  const f = DJ_FRAMES[s.step];
  const n = DJ_NODES.length;
  const state: Record<number, NState> = {};
  DJ_NODES.forEach((nd) => {
    state[nd.id] =
      nd.id === f.cur
        ? "lit"
        : f.settled.includes(nd.id)
          ? "ok"
          : f.dist[nd.id] !== INF
            ? "fringe"
            : undefined;
  });
  const sub: Record<number, ReactNode> = {};
  DJ_NODES.forEach((nd) => {
    sub[nd.id] = <>d={fmt(f.dist[nd.id])}</>;
  });

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="LC 743 · Network Delay Time — Dijkstra with a min-heap, step by step"
          zh="LC 743 · 网络延迟时间 —— Dijkstra 贪心 + 小根堆,逐步演算"
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 16 }}>
        <div className="gr-canvas" style={{ maxWidth: 520 }}>
          <GraphSvg
            nodes={DJ_NODES}
            edges={DJ_EDGES}
            w={520}
            h={200}
            directed
            state={state}
            sub={sub}
            active={f.active}
          />
        </div>
        <div className="gr-djpanel">
          <table className="gr-dist">
            <tbody>
              <tr>
                <th>
                  <T en="node" zh="节点" />
                </th>
                {Array.from({ length: n }).map((_, i) => (
                  <th
                    key={i}
                    className={f.settled.includes(i) ? "settled" : ""}
                  >
                    {i}
                  </th>
                ))}
              </tr>
              <tr>
                <th>dist</th>
                {Array.from({ length: n }).map((_, i) => (
                  <td
                    key={i}
                    className={`${f.settled.includes(i) ? "settled" : ""}${
                      f.updated.includes(i) ? " upd" : ""
                    }`}
                  >
                    {fmt(f.dist[i])}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <div className="gr-lane" style={{ marginTop: 10 }}>
            <div className="gr-lane-cap">
              <T
                en="Min-heap · pending (node, dist) — outdated entries may remain"
                zh="小根堆 · 待处理 (点, dist) —— 里面可能残留过期记录"
              />
            </div>
            <div className="gr-chips">
              {f.heap.length ? (
                [...f.heap]
                  .sort((a, b) => a.d - b.d)
                  .map((h, i) => (
                    <span key={i} className={`gr-chip${i === 0 ? " top" : ""}`}>
                      {h.v}·{h.d}
                    </span>
                  ))
              ) : (
                <span className="gr-empty">
                  <T en="empty" zh="空" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={DJ_FRAMES.length} />
    </div>
  );
}
