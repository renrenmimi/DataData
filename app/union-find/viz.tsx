"use client";

// 第 11 章 · 并查集的招牌可视化 UFLab:
//  - 一排节点(SVG 森林),点选两个节点执行 union,动画演示 find 顺藤摸瓜 + 两树合并;
//  - 「最坏顺序 union」按钮:0-1, 1-2, … 连续合并,裸奔模式会退化成一条长链;
//  - 「路径压缩」「按秩合并」两个开关,开着再跑一遍,亲眼对比树形差异;
//  - 下方同步显示 parent 数组 —— 强调「一个数组就是整片森林」。

import { useState, type ReactNode } from "react";

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
    "初始:10 个节点各自为营,parent[i] = i,每个人都是自己的老大。点两个节点试试 union。",
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
      setMsg(
        <>
          find({x}):{path[path.length - 1]} 不是根(parent 指向 {cur}
          ),继续往上爬…
        </>,
      );
      await sleep(speed);
    }
    const root = cur;
    if (usePC && path.length > 1) {
      const np = [...p];
      for (const node of path) np[node] = root;
      setParent(np);
      setMsg(
        <>
          <b>路径压缩</b>:既然都爬到根 {root} 了,顺手把沿途的{" "}
          {path.join("、")} 全部改挂到根上 —— 下次 find 一步到位。
        </>,
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
      <>
        union({a}, {b}):第一步永远是先找两边的<b>根</b> —— 合并的是两个帮派,
        不是两个成员。
      </>,
    );
    await sleep(speed + 150);

    const ra = await animFind(p, a, speed);
    p = ra.p;
    const rb = await animFind(p, b, speed);
    p = rb.p;

    if (ra.root === rb.root) {
      setBad(new Set([ra.root]));
      setMsg(
        <>
          find({a}) 和 find({b}) 都是 <b>{ra.root}</b> ——
          本来就是一伙的,什么都不用做(这个「已连通还想连」的信号,正是 LC 684
          找环的钥匙)。
        </>,
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
      <>
        两个根不同 → 合并:parent[{child}] = {boss}
        {useRank ? (
          <>
            (<b>按秩合并</b>:让矮的那棵挂到高的下面,树高才不会白白 +1)
          </>
        ) : (
          <>(裸奔模式:不看高矮,直接把 {child} 挂给 {boss})</>
        )}
        。连通块 {compCount} → <b>{compCount - 1}</b>。
      </>,
    );
    await sleep(speed + 300);
    setLit(new Set());
  };

  const onNodeClick = async (i: number) => {
    if (busy) return;
    if (sel === null) {
      setSel(i);
      setMsg(
        <>
          已选中 <b>{i}</b>,再点一个节点,就执行 union({i}, ?)。
        </>,
      );
      return;
    }
    if (sel === i) {
      setSel(null);
      setMsg("取消选择。");
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
      <>
        重置完毕,按最坏顺序连续执行 union(0,1), union(1,2), …, union(8,9)…
      </>,
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
          union({i}, {i + 1}):parent[{child}] = {boss}
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
        <>
          按秩合并生效:每次都是矮树挂高树,最深也只有 <b>{depth}</b> 层 ——
          树高被压在 O(log n)。再关掉开关跑一次,对比一下。
        </>
      ) : (
        <>
          灾难现场:裸奔 union 把树连成了一条 <b>{depth} 层</b>的长链 —— find(0)
          要爬 {depth} 步,退化成 O(n),跟链表没区别。打开下面的优化开关再跑一次。
        </>
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
    setMsg("已重置:10 个连通块,各自为营。");
  };

  return (
    <div className="viz">
      <div className="viz-title">
        并查集实验室 —— 点两个节点合并;开关优化,对比树形
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 18 }}>
        <svg
          className="uf-svg"
          viewBox={`0 0 ${width} ${height}`}
          style={{ maxWidth: width }}
          role="img"
          aria-label="并查集森林"
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
          {/* 边:子 → 父(箭头指向老大) */}
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
                aria-label={`节点 ${i}`}
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
        <div className="uf-arr" aria-label="parent 数组">
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
          最坏顺序 union ×9
        </button>
        <button type="button" className="btn btn-sm" onClick={reset} disabled={busy}>
          重置
        </button>
        <button
          type="button"
          className="btn btn-sm"
          aria-pressed={usePC}
          onClick={() => setUsePC((v) => !v)}
          disabled={busy}
        >
          {usePC ? "✓" : "✗"} 路径压缩
        </button>
        <button
          type="button"
          className="btn btn-sm"
          aria-pressed={useRank}
          onClick={() => setUseRank((v) => !v)}
          disabled={busy}
        >
          {useRank ? "✓" : "✗"} 按秩合并
        </button>
        <span className="uf-stat">
          连通块 <b>{compCount}</b> · 👑 = 根(parent 数组里绿格 = 自己指自己)
        </span>
      </div>
    </div>
  );
}
