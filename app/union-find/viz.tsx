"use client";

// 第 11 章 · 并查集的招牌可视化 UFLab:
//  - 一排节点(SVG 森林),点选两个节点执行 union,动画演示 find 一路爬到根 + 两树合并;
//  - 「最坏顺序 union」按钮:0-1, 1-2, … 连续合并,不带按秩合并时会退化成一条长链;
//  - 「路径压缩」「按秩合并」两个开关,开着再跑一遍,亲眼对比树形差异;
//  - 下方同步显示 parent 数组 —— 强调「一个数组就是整片森林」。
//
// 双语:标题、旁白、按钮、图例、aria-label 全部通过 <T> / useL() 切换。
// 口径统一:深度按「边数」计,所以 10 个节点连成的链深度是 9,find 走 9 步。

import { useState, type ReactNode } from "react";
import { useL, T } from "@/lib/i18n";

const N = 10;
const SLOT = 62;
const ROW = 64;
const PAD = 34;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* 从 parent 数组算出森林布局:叶子占一个横向槽位,父节点居中于子树上方 */
function layout(parent: number[]) {
  const children: number[][] = Array.from({ length: N }, () => []);
  const roots: number[] = [];
  for (let i = 0; i < N; i++) {
    if (parent[i] === i) roots.push(i);
    else children[parent[i]].push(i);
  }
  const pos = Array.from({ length: N }, () => ({ x: 0, y: 0 }));
  let cursor = 0;
  let maxDepth = 0;
  const place = (u: number, depth: number): { min: number; max: number } => {
    maxDepth = Math.max(maxDepth, depth);
    if (children[u].length === 0) {
      const x = cursor * SLOT + PAD;
      cursor += 1;
      pos[u] = { x, y: depth * ROW + PAD };
      return { min: x, max: x };
    }
    let mn = Infinity;
    let mx = -Infinity;
    for (const c of children[u]) {
      const r = place(c, depth + 1);
      mn = Math.min(mn, r.min);
      mx = Math.max(mx, r.max);
    }
    pos[u] = { x: (mn + mx) / 2, y: depth * ROW + PAD };
    return { min: mn, max: mx };
  };
  for (const r of roots) place(r, 0);
  const width = Math.max(cursor * SLOT + PAD, 420);
  const height = (maxDepth + 1) * ROW + PAD + 6;
  return { pos, roots, width, height };
}

export function UFLab({
  defaultPC = false,
  defaultRank = false,
}: {
  defaultPC?: boolean;
  defaultRank?: boolean;
}) {
  const L = useL();
  const [parent, setParent] = useState<number[]>(() =>
    Array.from({ length: N }, (_, i) => i),
  );
  const [rank, setRank] = useState<number[]>(() => Array(N).fill(0));
  const [usePC, setUsePC] = useState(defaultPC);
  const [useRank, setUseRank] = useState(defaultRank);
  const [sel, setSel] = useState<number | null>(null);
  const [lit, setLit] = useState<Set<number>>(new Set());
  const [bad, setBad] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<ReactNode>(
    <T
      en="Ten elements, ten separate sets. parent[i] = i, so every element is its own root. Click two nodes to union them."
      zh="10 个元素,10 个独立集合。parent[i] = i,每个元素都是自己所在树的根。点两个节点即可 union。"
    />,
  );

  const { pos, roots, width, height } = layout(parent);
  const compCount = roots.length;

  /* 纯查询版 find(不带动画,不压缩) */
  const findRoot = (p: number[], x: number) => {
    while (p[x] !== x) x = p[x];
    return x;
  };

  /* 动画版 find:逐级点亮沿途节点;开启路径压缩时,回来把沿途节点直接挂到根上 */
  const animFind = async (p: number[], x: number, speed: number) => {
    const path: number[] = [];
    let cur = x;
    const litNow = new Set<number>([cur]);
    setLit(new Set(litNow));
    await sleep(speed);
    while (p[cur] !== cur) {
      path.push(cur);
      cur = p[cur];
      litNow.add(cur);
      setLit(new Set(litNow));
      const from = path[path.length - 1];
      const to = cur;
      setMsg(
        <T
          en={
            <>
              find({x}): {from} is not a root, because parent[{from}] = {to}.
              Keep climbing.
            </>
          }
          zh={
            <>
              find({x}):{from} 不是根,因为 parent[{from}] = {to},继续往上爬。
            </>
          }
        />,
      );
      await sleep(speed);
    }
    const root = cur;
    if (usePC && path.length > 1) {
      const np = [...p];
      for (const node of path) np[node] = root;
      setParent(np);
      setMsg(
        <T
          en={
            <>
              <b>Path compression</b>: the walk already reached root {root}, so
              repoint every node on the way ({path.join(", ")}) straight at the
              root. The next find on any of them takes one step.
            </>
          }
          zh={
            <>
              <b>路径压缩</b>:反正已经爬到根 {root} 了,顺手把沿途的{" "}
              {path.join("、")} 全部改指向根 —— 它们下一次 find 一步到位。
            </>
          }
        />,
      );
      await sleep(speed + 250);
      return { root, p: np };
    }
    return { root, p };
  };

  const doUnion = async (a: number, b: number, speed = 430) => {
    let p = [...parent];
    const rk = [...rank];

    setMsg(
      <T
        en={
          <>
            union({a}, {b}): the first step is always to find both{" "}
            <b>roots</b>. What gets merged is two sets, not two elements.
          </>
        }
        zh={
          <>
            union({a}, {b}):第一步永远是先找出两边的<b>根</b> ——
            合并的是两个集合,不是两个元素。
          </>
        }
      />,
    );
    await sleep(speed + 150);

    const ra = await animFind(p, a, speed);
    p = ra.p;
    const rb = await animFind(p, b, speed);
    p = rb.p;

    if (ra.root === rb.root) {
      setBad(new Set([ra.root]));
      setMsg(
        <T
          en={
            <>
              find({a}) and find({b}) both return <b>{ra.root}</b>. The two
              elements are already in the same set, so union does nothing and
              the number of components stays at <b>{compCount}</b>. This signal
              is exactly what LC 684 uses to detect a cycle.
            </>
          }
          zh={
            <>
              find({a}) 和 find({b}) 都返回 <b>{ra.root}</b> ——
              两个元素本来就在同一个集合里,union 什么都不做,连通块数仍是{" "}
              <b>{compCount}</b>。这个信号正是 LC 684 用来找环的依据。
            </>
          }
        />,
      );
      await sleep(900);
      setBad(new Set());
      setLit(new Set());
      return;
    }

    let child = ra.root;
    let boss = rb.root;
    if (useRank) {
      if (rk[child] > rk[boss]) [child, boss] = [boss, child];
      if (rk[child] === rk[boss]) rk[boss] += 1;
      setRank(rk);
    }
    p[child] = boss;
    setParent(p);
    setLit(new Set([child, boss]));
    setMsg(
      <T
        en={
          <>
            The two roots differ, so merge: parent[{child}] = {boss}
            {useRank ? (
              <>
                {" "}
                (<b>union by rank</b>: the shorter tree goes under the taller
                one, so the height does not grow)
              </>
            ) : (
              <>
                {" "}
                (no union by rank: height is ignored, {child} is simply
                attached to {boss})
              </>
            )}
            . Components {compCount} → <b>{compCount - 1}</b>.
          </>
        }
        zh={
          <>
            两个根不同 → 合并:parent[{child}] = {boss}
            {useRank ? (
              <>
                (<b>按秩合并</b>:矮的那棵挂到高的下面,树高不会增加)
              </>
            ) : (
              <>(不按秩合并:不看高矮,直接把 {child} 挂给 {boss})</>
            )}
            。连通块 {compCount} → <b>{compCount - 1}</b>。
          </>
        }
      />,
    );
    await sleep(speed + 300);
    setLit(new Set());
  };

  const onNodeClick = async (i: number) => {
    if (busy) return;
    if (sel === null) {
      setSel(i);
      setMsg(
        <T
          en={
            <>
              <b>{i}</b> is selected. Click a second node to run union({i}, ?).
            </>
          }
          zh={
            <>
              已选中 <b>{i}</b>,再点一个节点就执行 union({i}, ?)。
            </>
          }
        />,
      );
      return;
    }
    if (sel === i) {
      setSel(null);
      setMsg(<T en="Selection cleared." zh="已取消选择。" />);
      return;
    }
    const a = sel;
    setSel(null);
    setBusy(true);
    await doUnion(a, i);
    setBusy(false);
  };

  const worstCase = async () => {
    if (busy) return;
    setBusy(true);
    setSel(null);
    // 先重置
    setParent(Array.from({ length: N }, (_, i) => i));
    setRank(Array(N).fill(0));
    setLit(new Set());
    setMsg(
      <T
        en="Reset. Now running union(0,1), union(1,2), …, union(8,9) in that order."
        zh="已重置,现在按 union(0,1), union(1,2), …, union(8,9) 的顺序连续合并。"
      />,
    );
    await sleep(700);
    let p = Array.from({ length: N }, (_, i) => i);
    const rk = Array(N).fill(0);
    for (let i = 0; i + 1 < N; i++) {
      let child = findRoot(p, i);
      let boss = findRoot(p, i + 1);
      if (child === boss) continue;
      if (useRank) {
        if (rk[child] > rk[boss]) [child, boss] = [boss, child];
        if (rk[child] === rk[boss]) rk[boss] += 1;
      }
      p = [...p];
      p[child] = boss;
      setParent(p);
      setLit(new Set([child, boss]));
      setMsg(
        <>
          union({i}, {i + 1}): parent[{child}] = {boss}
        </>,
      );
      await sleep(360);
    }
    setRank([...rk]);
    setLit(new Set());
    const depth = Math.max(
      ...Array.from({ length: N }, (_, i) => {
        let d = 0;
        let x = i;
        while (p[x] !== x) {
          x = p[x];
          d++;
        }
        return d;
      }),
    );
    setMsg(
      useRank ? (
        <T
          en={
            <>
              Union by rank is on. The shorter tree always went under the taller
              one, so the deepest node is only <b>{depth}</b> step
              {depth === 1 ? "" : "s"} from its root. Union by rank alone keeps
              the height within O(log n). Turn the switch off and run it again
              to compare.
            </>
          }
          zh={
            <>
              按秩合并已生效:每次都是矮树挂高树,最深的节点距离根也只有{" "}
              <b>{depth}</b> 步。单靠按秩合并,树高就被压在 O(log n) 以内。
              关掉开关再跑一次,对比一下。
            </>
          }
        />
      ) : (
        <T
          en={
            <>
              Degenerate case: without union by rank, every merge hung the old
              root under a fresh single node, so the 10 elements became one
              chain. The deepest node is <b>{depth}</b> steps from the root, so
              find costs O(n) here, no better than scanning a linked list. Turn
              on the switches below and run it again.
            </>
          }
          zh={
            <>
              退化情形:不按秩合并时,每次都把旧的根挂到一个光杆节点下面,
              10 个元素连成了一条链。最深的节点距离根 <b>{depth}</b> 步,
              此时 find 的代价是 O(n),和扫一遍链表没有区别。
              打开下面的开关再跑一次。
            </>
          }
        />
      ),
    );
    setBusy(false);
  };

  const reset = () => {
    if (busy) return;
    setParent(Array.from({ length: N }, (_, i) => i));
    setRank(Array(N).fill(0));
    setSel(null);
    setLit(new Set());
    setBad(new Set());
    setMsg(
      <T
        en="Reset: 10 components, each holding one element."
        zh="已重置:10 个连通块,每块一个元素。"
      />,
    );
  };

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Union-Find lab — click two nodes to union them, toggle the optimizations, compare the shapes"
          zh="并查集实验室 —— 点两个节点合并,开关优化,对比树形"
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 18 }}>
        <svg
          className="uf-svg"
          viewBox={`0 0 ${width} ${height}`}
          style={{ maxWidth: width }}
          role="img"
          aria-label={L({
            en: "Union-Find forest",
            zh: "并查集森林",
          })}
        >
          <defs>
            <marker
              id="uf-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-3)" />
            </marker>
          </defs>
          {/* 边:子 → 父(箭头指向父节点) */}
          {parent.map((par, i) => {
            if (par === i) return null;
            const a = pos[i];
            const b = pos[par];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const r = 19;
            const x1 = a.x + (dx / len) * r;
            const y1 = a.y + (dy / len) * r;
            const x2 = b.x - (dx / len) * (r + 3);
            const y2 = b.y - (dy / len) * (r + 3);
            const isLit = lit.has(i) && lit.has(par);
            return (
              <line
                key={`e${i}`}
                className={`uf-edge${isLit ? " lit" : ""}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                markerEnd="url(#uf-arrow)"
              />
            );
          })}
          {/* 节点 */}
          {parent.map((par, i) => {
            const { x, y } = pos[i];
            const cls = `uf-node${par === i ? " root" : ""}${
              lit.has(i) ? " lit" : ""
            }${sel === i ? " sel" : ""}${bad.has(i) ? " bad" : ""}`;
            return (
              <g
                key={i}
                className={cls}
                onClick={() => onNodeClick(i)}
                role="button"
                aria-label={L({ en: `Node ${i}`, zh: `节点 ${i}` })}
              >
                {par === i && (
                  <text className="uf-crown" x={x} y={y - 26}>
                    👑
                  </text>
                )}
                <circle cx={x} cy={y} r={17} />
                <text x={x} y={y}>
                  {i}
                </text>
              </g>
            );
          })}
        </svg>
        {/* parent 数组同步视图 */}
        <div
          className="uf-arr"
          aria-label={L({ en: "parent array", zh: "parent 数组" })}
        >
          {parent.map((par, i) => (
            <div
              key={i}
              className={`cell${lit.has(i) ? " lit" : ""}${
                par === i ? " ok" : ""
              }`}
            >
              {par}
              <span className="cell-idx">{i}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <div className="viz-ctl">
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={worstCase}
          disabled={busy}
        >
          <T en="Worst-case union ×9" zh="最坏顺序 union ×9" />
        </button>
        <button type="button" className="btn btn-sm" onClick={reset} disabled={busy}>
          <T en="Reset" zh="重置" />
        </button>
        <button
          type="button"
          className="btn btn-sm"
          aria-pressed={usePC}
          onClick={() => setUsePC((v) => !v)}
          disabled={busy}
        >
          {usePC ? "✓" : "✗"}{" "}
          <T en="Path compression" zh="路径压缩" />
        </button>
        <button
          type="button"
          className="btn btn-sm"
          aria-pressed={useRank}
          onClick={() => setUseRank((v) => !v)}
          disabled={busy}
        >
          {useRank ? "✓" : "✗"} <T en="Union by rank" zh="按秩合并" />
        </button>
        <span className="uf-stat">
          <T en="components" zh="连通块" /> <b>{compCount}</b> ·{" "}
          <T
            en="👑 = root; a green cell in the parent array points at itself"
            zh="👑 = 根;parent 数组里的绿格 = 自己指自己"
          />
        </span>
      </div>
    </div>
  );
}
