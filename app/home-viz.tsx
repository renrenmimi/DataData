"use client";

// 首页签名动画:同一批 7 个节点,在「数组 → 链表 → 二叉树 → 图」四种形态之间
// 平滑变形(rAF 逐帧插值 + 缓动),边随当前位置实时重绘。
// 想传达的第一直觉:数据没变,变的是「组织方式」—— 这就是数据结构。

import { useEffect, useRef, useState } from "react";

type P = { x: number; y: number };

const W = 460;
const H = 300;

// 7 个节点在四种形态下的坐标
const LAYOUTS: { name: string; en: string; pts: P[]; edges: [number, number][]; square: boolean }[] = [
  {
    name: "数组",
    en: "ARRAY",
    square: true,
    pts: [0, 1, 2, 3, 4, 5, 6].map((i) => ({ x: 50 + i * 60, y: 150 })),
    edges: [],
  },
  {
    name: "链表",
    en: "LINKED LIST",
    square: false,
    pts: [
      { x: 40, y: 110 },
      { x: 105, y: 175 },
      { x: 170, y: 110 },
      { x: 235, y: 175 },
      { x: 300, y: 110 },
      { x: 365, y: 175 },
      { x: 425, y: 110 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
  },
  {
    name: "二叉树",
    en: "BINARY TREE",
    square: false,
    pts: [
      { x: 230, y: 55 },
      { x: 120, y: 140 },
      { x: 340, y: 140 },
      { x: 65, y: 230 },
      { x: 175, y: 230 },
      { x: 285, y: 230 },
      { x: 395, y: 230 },
    ],
    edges: [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [2, 5],
      [2, 6],
    ],
  },
  {
    name: "图",
    en: "GRAPH",
    square: false,
    pts: [0, 1, 2, 3, 4, 5, 6].map((i) => {
      const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
      return { x: 230 + Math.cos(a) * 105, y: 150 + Math.sin(a) * 105 };
    }),
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 0],
      [0, 3],
      [1, 5],
      [2, 6],
    ],
  },
];

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export function HeroMorph() {
  const [layout, setLayout] = useState(0);
  const [pts, setPts] = useState<P[]>(LAYOUTS[0].pts);
  const fromRef = useRef<P[]>(LAYOUTS[0].pts);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  // 每 3 秒换一种形态
  useEffect(() => {
    const t = setInterval(() => setLayout((l) => (l + 1) % LAYOUTS.length), 3000);
    return () => clearInterval(t);
  }, []);

  // rAF 插值到目标形态
  useEffect(() => {
    const target = LAYOUTS[layout].pts;
    fromRef.current = pts;
    startRef.current = performance.now();
    const D = 850;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / D);
      const k = ease(t);
      setPts(
        fromRef.current.map((p, i) => ({
          x: p.x + (target[i].x - p.x) * k,
          y: p.y + (target[i].y - p.y) * k,
        })),
      );
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  const L = LAYOUTS[layout];

  return (
    <div className="hm-wrap" aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} className="hm-svg">
        {L.edges.map(([a, b], i) => (
          <line
            key={`${layout}-${i}`}
            x1={pts[a].x}
            y1={pts[a].y}
            x2={pts[b].x}
            y2={pts[b].y}
            className="hm-edge"
          />
        ))}
        {pts.map((p, i) => (
          <g key={i} transform={`translate(${p.x}, ${p.y})`}>
            <rect
              x={-19}
              y={-19}
              width={38}
              height={38}
              rx={L.square ? 9 : 19}
              className="hm-node"
              style={{ transition: "rx 0.6s" }}
            />
            <text className="hm-label" textAnchor="middle" dy="5">
              {[7, 2, 9, 4, 1, 8, 5][i]}
            </text>
          </g>
        ))}
      </svg>
      <div className="hm-caption mono">
        <span className="hm-caption-zh">{L.name}</span>
        <span className="hm-caption-en">{L.en}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RefLab:变量与引用 —— 标签、纸条与盒子                              */
/* ------------------------------------------------------------------ */

type RefState = "separate" | "shared";

export function RefLab() {
  const [state, setState] = useState<RefState>("separate");
  const [aVal, setAVal] = useState(7);
  const [bVal, setBVal] = useState(3);
  const [msg, setMsg] = useState<React.ReactNode>(
    <>
      现在 a 和 b 各自指向自己的盒子。试试下面的按钮,观察「纸条」怎么变。
    </>,
  );

  const shareIt = () => {
    setState("shared");
    setMsg(
      <>
        执行 <b>b = a</b>:复制的不是盒子,而是<b>纸条上的地址</b> —— 现在两张标签
        指向同一个盒子。b 原来的盒子没人指了,等着被回收。
      </>,
    );
  };

  const mutate = () => {
    if (state === "shared") {
      setAVal((v) => v + 10);
      setMsg(
        <>
          执行 <b>b.val += 10</b>:改的是<b>盒子里的东西</b>。因为 a、b
          指向同一个盒子,<b>a 也“跟着变”了</b> —— 这不是灵异事件,是引用的本义。
        </>,
      );
    } else {
      setBVal((v) => v + 10);
      setMsg(
        <>
          执行 <b>b.val += 10</b>:只有 b 的盒子变了,a 安然无恙 —— 因为它们是两个盒子。
        </>,
      );
    }
  };

  const reset = () => {
    setState("separate");
    setAVal(7);
    setBVal(3);
    setMsg(<>已重置:a、b 又各自拥有自己的盒子了。</>);
  };

  const boxY = { a: 46, b: 132 };

  return (
    <div className="viz">
      <div className="viz-title">引用实验室 —— 标签、纸条与盒子</div>
      <div className="viz-stage">
        <svg viewBox="0 0 460 180" style={{ width: "100%", maxWidth: 460 }} aria-label="变量与引用示意">
          {/* 变量标签 */}
          {(["a", "b"] as const).map((name) => (
            <g key={name} transform={`translate(30, ${boxY[name]})`}>
              <rect x={-24} y={-20} width={64} height={40} rx={10} className="ref-tag" />
              <text x={8} y={5} textAnchor="middle" className="ref-tag-text">
                {name}
              </text>
            </g>
          ))}
          {/* 箭头 */}
          <line x1={72} y1={boxY.a} x2={300} y2={boxY.a} className="ref-arrow" markerEnd="url(#ref-arr)" />
          <line
            x1={72}
            y1={boxY.b}
            x2={300}
            y2={state === "shared" ? boxY.a + 14 : boxY.b}
            className="ref-arrow"
            markerEnd="url(#ref-arr)"
          />
          <defs>
            <marker id="ref-arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" className="ref-arrow-head" />
            </marker>
          </defs>
          {/* 盒子 */}
          <g transform={`translate(310, ${boxY.a})`}>
            <rect x={0} y={-26} width={110} height={52} rx={12} className="ref-box lit" />
            <text x={55} y={-4} textAnchor="middle" className="ref-box-label">
              {"{ val: " + aVal + " }"}
            </text>
            <text x={55} y={16} textAnchor="middle" className="ref-box-addr">
              @1000
            </text>
          </g>
          <g transform={`translate(310, ${boxY.b})`} opacity={state === "shared" ? 0.25 : 1}>
            <rect x={0} y={-26} width={110} height={52} rx={12} className="ref-box" strokeDasharray={state === "shared" ? "5 5" : undefined} />
            <text x={55} y={-4} textAnchor="middle" className="ref-box-label">
              {state === "shared" ? "(无人引用)" : "{ val: " + bVal + " }"}
            </text>
            <text x={55} y={16} textAnchor="middle" className="ref-box-addr">
              @2048
            </text>
          </g>
        </svg>
      </div>
      <div className="viz-msg">{msg}</div>
      <div className="viz-ctl">
        <button type="button" className="btn btn-sm btn-primary" onClick={shareIt} disabled={state === "shared"}>
          b = a
        </button>
        <button type="button" className="btn btn-sm" onClick={mutate}>
          b.val += 10
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={reset}>
          重置
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Big-O 增长实验室:拖动 n,看六条复杂度曲线的差距如何撕开             */
/* ------------------------------------------------------------------ */

const CURVES = [
  { id: "1", label: "O(1)", f: (_n: number) => 1, color: "var(--ok)" },
  { id: "logn", label: "O(log n)", f: (n: number) => Math.log2(Math.max(n, 1)), color: "#5fd4b0" },
  { id: "n", label: "O(n)", f: (n: number) => n, color: "var(--warn)" },
  { id: "nlogn", label: "O(n log n)", f: (n: number) => n * Math.log2(Math.max(n, 2)), color: "#f09a5c" },
  { id: "n2", label: "O(n²)", f: (n: number) => n * n, color: "var(--risk)" },
  { id: "2n", label: "O(2ⁿ)", f: (n: number) => Math.pow(2, n), color: "#f26fb1" },
] as const;

const OPS_PER_SEC = 1e8; // 粗略假设:普通电脑每秒 ~10⁸ 次基本操作

function fmtOps(v: number): string {
  if (v >= 1e12) return v.toExponential(1).replace("e+", "×10^");
  if (v >= 1e4) return Math.round(v).toLocaleString("en-US");
  if (v >= 100) return String(Math.round(v));
  return (Math.round(v * 10) / 10).toString();
}

function fmtTime(ops: number): string {
  const s = ops / OPS_PER_SEC;
  if (s < 1e-6) return "眨眼都嫌慢";
  if (s < 1e-3) return `${(s * 1e6).toFixed(1)} 微秒`;
  if (s < 1) return `${(s * 1e3).toFixed(1)} 毫秒`;
  if (s < 60) return `${s.toFixed(1)} 秒`;
  if (s < 3600) return `${(s / 60).toFixed(1)} 分钟`;
  if (s < 86400) return `${(s / 3600).toFixed(1)} 小时`;
  const yr = s / 31536000;
  if (yr < 1000) return `${yr.toFixed(1)} 年`;
  if (yr < 1.38e10) return `${yr.toExponential(1).replace("e+", "×10^")} 年`;
  return "比宇宙年龄还长";
}

const CW = 620;
const CH = 320;
const PAD = { l: 46, r: 16, t: 16, b: 34 };

export function BigOLab() {
  const [n, setN] = useState(32);
  const [on, setOn] = useState<Record<string, boolean>>(
    Object.fromEntries(CURVES.map((c) => [c.id, true])),
  );

  // y 轴用 log 刻度(否则 2ⁿ 一出场其他曲线全趴地上)
  const yMax = Math.max(
    ...CURVES.filter((c) => on[c.id]).map((c) => c.f(n)),
    8,
  );
  const logMax = Math.log10(yMax + 1);

  const px = (x: number) => PAD.l + (x / n) * (CW - PAD.l - PAD.r);
  const py = (v: number) =>
    CH - PAD.b - (Math.log10(v + 1) / logMax) * (CH - PAD.t - PAD.b);

  const path = (f: (x: number) => number) => {
    const pts: string[] = [];
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * n;
      const v = Math.min(f(Math.max(x, 0.001)), 1e18);
      pts.push(`${i === 0 ? "M" : "L"}${px(x).toFixed(1)},${py(v).toFixed(1)}`);
    }
    return pts.join(" ");
  };

  // y 轴刻度:10⁰ 10² 10⁴ …
  const ticks: number[] = [];
  for (let e = 0; e <= Math.ceil(logMax); e += Math.max(1, Math.ceil(logMax / 5))) {
    ticks.push(e);
  }

  return (
    <div className="viz bigo-lab">
      <div className="viz-title">Big-O 增长实验室 —— 拖动 n,看差距怎么被撕开</div>

      <div className="bigo-legend">
        {CURVES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`bigo-key${on[c.id] ? " on" : ""}`}
            style={{ "--c": c.color } as React.CSSProperties}
            onClick={() => setOn((p) => ({ ...p, [c.id]: !p[c.id] }))}
          >
            <i />
            {c.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${CW} ${CH}`} className="bigo-svg" role="img" aria-label="复杂度增长曲线">
        {ticks.map((e) => (
          <g key={e}>
            <line
              x1={PAD.l}
              x2={CW - PAD.r}
              y1={py(Math.pow(10, e) - 1)}
              y2={py(Math.pow(10, e) - 1)}
              className="bigo-grid"
            />
            <text x={PAD.l - 8} y={py(Math.pow(10, e) - 1) + 4} className="bigo-tick" textAnchor="end">
              10{e === 0 ? "⁰" : e === 1 ? "¹" : e === 2 ? "²" : e === 3 ? "³" : `^${e}`}
            </text>
          </g>
        ))}
        <text x={CW - PAD.r} y={CH - 10} className="bigo-tick" textAnchor="end">
          n = {n}
        </text>
        {CURVES.filter((c) => on[c.id]).map((c) => (
          <path key={c.id} d={path(c.f)} fill="none" style={{ stroke: c.color }} className="bigo-curve" />
        ))}
      </svg>

      <div className="viz-ctl">
        <label className="bigo-slider">
          <span className="mono">n = {n}</span>
          <input
            type="range"
            min={4}
            max={64}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            aria-label="数据规模 n"
          />
        </label>
      </div>

      <div className="table-wrap" style={{ marginTop: 14 }}>
        <table className="t-table">
          <thead>
            <tr>
              <th>复杂度</th>
              <th>n = {n} 时的操作次数</th>
              <th>n = 10⁶(一百万)时</th>
              <th>10⁶ 规模要跑多久*</th>
            </tr>
          </thead>
          <tbody>
            {CURVES.map((c) => {
              const big = Math.min(c.f(1e6), 1e300);
              return (
                <tr key={c.id}>
                  <td>
                    <span className="big-o" data-o={c.id}>
                      {c.label}
                    </span>
                  </td>
                  <td className="mono">{fmtOps(Math.min(c.f(n), 1e18))}</td>
                  <td className="mono">{c.id === "2n" ? "10^301006 —— 写不下" : fmtOps(big)}</td>
                  <td className="mono">{c.id === "2n" ? "比宇宙年龄还长" : fmtTime(big)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="viz-msg">* 按每秒 10⁸ 次基本操作粗算 —— 这就是为什么面试官盯着你的复杂度不放。</p>
    </div>
  );
}
