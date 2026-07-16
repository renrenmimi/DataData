"use client";

// 第 13 章 · 组合与进阶 —— 六个专属可视化:
//  - LRUAnatomy:静态结构图 —— 哈希表条目"指进"双向链表(两个结构互相咬合)。
//  - LRULab:容量 3 的可操作 LRU 缓存(本章招牌):put/get 亲手玩,
//    看节点搬头部、尾部淘汰、哈希条目同步点亮。
//  - LFUBuckets:LFU 频次分桶静态图解(LC 460 的心脏)。
//  - SegAnatomy:[2,5,1,4,9,3] 建出的线段树静态图。
//  - SegLab:8 叶子线段树 —— 点叶子看更新路径点亮;拖查询区间看"打包"命中。
//  - SkipLab:跳表查找路径逐帧回放(从顶层往右走,过头就下楼)。
//  - BloomLab:16 位布隆过滤器 —— 插入/查询/亲手抓一次假阳性。

import { Fragment, useMemo, useRef, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ================================================================
   LRUAnatomy —— 静态结构图:哈希表指进双向链表
   ================================================================ */

export function LRUAnatomy() {
  // 链表顺序(头→尾):B(最新) → A → C(最旧);哈希表按 key 字母序列出,
  // 故意与链表顺序不同 —— 强调"哈希表不懂顺序,链表不懂查找"。
  const nodes = [
    { key: "HEAD", x: 250, dummy: true },
    { key: "B", x: 355, dummy: false },
    { key: "A", x: 460, dummy: false },
    { key: "C", x: 565, dummy: false },
    { key: "TAIL", x: 655, dummy: true },
  ];
  const hashRows = [
    { key: "A", y: 116, target: 460 },
    { key: "B", y: 166, target: 355 },
    { key: "C", y: 216, target: 565 },
  ];
  return (
    <div className="viz">
      <div className="viz-title">LRU 的解剖图:两个结构,各管一半</div>
      <div className="viz-stage">
        <svg
          viewBox="0 0 700 300"
          style={{ width: "100%", maxWidth: 700 }}
          role="img"
          aria-label="哈希表条目指向双向链表节点的结构图"
        >
          {/* 哈希表面板 */}
          <rect
            x={18}
            y={70}
            width={150}
            height={180}
            rx={14}
            fill="var(--panel-2)"
            stroke="var(--border-strong)"
            strokeDasharray="5 4"
          />
          <text x={93} y={95} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--text-2)">
            哈希表 map
          </text>
          {hashRows.map((r) => (
            <g key={r.key}>
              <rect
                x={34}
                y={r.y - 16}
                width={118}
                height={30}
                rx={8}
                fill="var(--panel)"
                stroke="var(--border)"
              />
              <text
                x={93}
                y={r.y + 4}
                textAnchor="middle"
                fontSize={12}
                fontFamily="var(--font-mono)"
                fill="var(--text)"
              >
                {r.key} → 节点引用
              </text>
              {/* 弯曲箭头:哈希条目 → 链表节点(瞬移) */}
              <path
                d={`M 152 ${r.y} C 210 ${r.y}, ${r.target - 40} 210, ${r.target} 172`}
                fill="none"
                stroke="var(--acc)"
                strokeWidth={1.6}
                className="flow-edge"
                opacity={0.85}
              />
              <circle cx={r.target} cy={170} r={3} fill="var(--acc)" />
            </g>
          ))}
          {/* 双向链表 */}
          <text x={452} y={95} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--text-2)">
            双向链表(左端最新 · 右端最旧)
          </text>
          {nodes.map((n) => (
            <g key={n.key}>
              <rect
                x={n.x - 36}
                y={118}
                width={72}
                height={46}
                rx={12}
                fill={n.dummy ? "var(--panel)" : "var(--acc-soft)"}
                stroke={n.dummy ? "var(--border-strong)" : "var(--acc-border)"}
                strokeWidth={1.5}
                strokeDasharray={n.dummy ? "5 4" : undefined}
              />
              <text
                x={n.x}
                y={138}
                textAnchor="middle"
                fontSize={n.dummy ? 10.5 : 14}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                fill={n.dummy ? "var(--text-3)" : "var(--acc-ink)"}
              >
                {n.key}
              </text>
              <text x={n.x} y={155} textAnchor="middle" fontSize={9} fill="var(--text-3)">
                {n.dummy ? "哑节点" : "key:val"}
              </text>
            </g>
          ))}
          {/* prev/next 双向箭头 */}
          {nodes.slice(0, -1).map((n, i) => {
            const nx = nodes[i + 1].x;
            const midL = n.x + 36;
            const midR = nx - 36;
            return (
              <g key={n.key} stroke="var(--text-3)" strokeWidth={1.4}>
                <line x1={midL} y1={132} x2={midR} y2={132} />
                <polygon points={`${midR},132 ${midR - 6},129 ${midR - 6},135`} fill="var(--text-3)" stroke="none" />
                <line x1={midR} y1={150} x2={midL} y2={150} />
                <polygon points={`${midL},150 ${midL + 6},147 ${midL + 6},153`} fill="var(--text-3)" stroke="none" />
              </g>
            );
          })}
          {/* 注解 */}
          <text x={93} y={278} textAnchor="middle" fontSize={11} fill="var(--text-2)">
            管「在哪」:O(1) 瞬移定位
          </text>
          <text x={452} y={230} textAnchor="middle" fontSize={11} fill="var(--text-2)">
            管「多旧」:O(1) 摘除 / 插头(prev + next 双向)
          </text>
        </svg>
      </div>
      <div className="viz-msg">
        哈希表存的不是值,而是<b>链表节点的引用</b>:查找交给哈希(不用遍历链表),
        顺序交给链表(不用扫描哈希)—— 两个结构各自只干自己 O(1) 的活。
      </div>
    </div>
  );
}

/* ================================================================
   LRULab —— 容量 3 的可操作 LRU(本章招牌)
   ================================================================ */

const LRU_CAP = 3;
const LRU_KEYS = ["A", "B", "C", "D"] as const;

interface LruEntry {
  key: string;
  val: number;
}

export function LRULab() {
  // list[0] = 链表头部(最新),list[尾] = 最旧
  const [list, setList] = useState<LruEntry[]>([]);
  const [hot, setHot] = useState<string | null>(null);
  const [dying, setDying] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ops, setOps] = useState(0);
  const [msg, setMsg] = useState<ReactNode>(
    <>
      容量 3 的空缓存。试试连续 put 四个 key 制造一次<b>淘汰</b>;再 get
      一个老 key,看它“复活”搬回头部。
    </>,
  );
  const nextVal = useRef(1);

  const put = async (k: string) => {
    if (busy) return;
    setBusy(true);
    setOps((o) => o + 1);
    const v = nextVal.current++;
    const hit = list.find((e) => e.key === k);
    if (hit) {
      setHot(k);
      setMsg(
        <>
          put({k},{v}):哈希表里已有 {k} → O(1) 拿到节点引用,原地改值,
          再把节点<b>搬到头部</b>(它刚被用过,变成最新)。
        </>,
      );
      await sleep(700);
      setList((cur) => [{ key: k, val: v }, ...cur.filter((e) => e.key !== k)]);
      await sleep(450);
      setHot(null);
    } else {
      if (list.length >= LRU_CAP) {
        const victim = list[list.length - 1];
        setDying(victim.key);
        setMsg(
          <>
            put({k},{v}):容量满!tail.prev 一步定位到最旧的 <b>{victim.key}</b>
            —— O(1) 摘除,同时删掉哈希表里的 {victim.key} 条目(两边必须同步)。
          </>,
        );
        await sleep(1000);
        setList((cur) => cur.slice(0, -1));
        setDying(null);
        await sleep(300);
      }
      setHot(k);
      setList((cur) => [{ key: k, val: v }, ...cur]);
      setMsg(
        <>
          新节点 {k}:{v} 挂到<b>链表头部</b>(最新),哈希表写入 {k} → 节点引用。
          整个 put 没有出现任何一次 O(n) 扫描。
        </>,
      );
      await sleep(650);
      setHot(null);
    }
    setBusy(false);
  };

  const get = async (k: string) => {
    if (busy) return;
    setBusy(true);
    setOps((o) => o + 1);
    const hit = list.find((e) => e.key === k);
    if (!hit) {
      setMsg(
        <>
          get({k}) = <b>-1</b>:哈希表 O(1) 查无此 key —— 链表碰都不用碰。
          (它可能从未 put 过,也可能已经被淘汰了。)
        </>,
      );
      await sleep(500);
      setBusy(false);
      return;
    }
    setHot(k);
    setMsg(
      <>
        get({k}):哈希表<b>瞬移</b>到节点(不经过链表遍历!),读到值{" "}
        <b>{hit.val}</b>;它刚被访问 → 摘下来插回头部,重新变成“最新”。
      </>,
    );
    await sleep(800);
    setList((cur) => {
      const e = cur.find((x) => x.key === k)!;
      return [e, ...cur.filter((x) => x.key !== k)];
    });
    await sleep(450);
    setHot(null);
    setBusy(false);
  };

  const reset = () => {
    if (busy) return;
    setList([]);
    setHot(null);
    setDying(null);
    setOps(0);
    nextVal.current = 1;
    setMsg("已清空。重新制造一次淘汰试试 —— 注意尾部永远是最久未用的那个。");
  };

  return (
    <div className="viz">
      <div className="viz-title">LRU 实验室 —— 容量 3,哈希表 + 双向链表实时联动</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 22 }}>
        <div className="adv-lru-hash">
          <span className="hd">哈希表 map(key → 链表节点引用)</span>
          {LRU_KEYS.map((k) => {
            const present = list.some((e) => e.key === k);
            const state =
              hot === k ? "lit" : dying === k ? "bad" : present ? "" : "off";
            return (
              <div key={k} className="adv-hrow" data-state={state}>
                <span className="kk">{k}</span>
                <span>{present || dying === k ? "─▶ 节点 " + k : "(无此条目)"}</span>
              </div>
            );
          })}
        </div>
        <div className="adv-lru-list">
          <div className="adv-lnode adv-dummy">
            <span className="k">HEAD</span>
            <span className="v">哑头</span>
          </div>
          {list.map((e, i) => (
            <Fragment key={e.key}>
              <span className="adv-arrow">⇄</span>
              <div
                className="adv-lnode"
                data-state={hot === e.key ? "lit" : dying === e.key ? "bad" : ""}
              >
                <span className="k">
                  {e.key}:{e.val}
                </span>
                <span className="v">
                  {i === 0 ? "最新" : i === list.length - 1 ? "最旧" : " "}
                </span>
              </div>
            </Fragment>
          ))}
          <span className="adv-arrow">⇄</span>
          <div className="adv-lnode adv-dummy">
            <span className="k">TAIL</span>
            <span className="v">哑尾</span>
          </div>
        </div>
        <div className="adv-legend">← 头部 = 刚用过 · 尾部 = 最久没用(下一个被淘汰)→</div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <div className="viz-ctl">
        {LRU_KEYS.map((k) => (
          <button
            key={"p" + k}
            type="button"
            className="btn btn-sm btn-primary"
            disabled={busy}
            onClick={() => put(k)}
          >
            put({k})
          </button>
        ))}
        {LRU_KEYS.map((k) => (
          <button
            key={"g" + k}
            type="button"
            className="btn btn-sm"
            disabled={busy}
            onClick={() => get(k)}
          >
            get({k})
          </button>
        ))}
        <button type="button" className="btn btn-sm btn-ghost" disabled={busy} onClick={reset}>
          清空
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          操作 {ops} 次 · 每次都是 O(1)
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   LFUBuckets —— 频次分桶静态图解
   ================================================================ */

export function LFUBuckets() {
  return (
    <div className="viz">
      <div className="viz-title">LFU 的心脏:按“被用过几次”分桶</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 10 }}>
        <div className="adv-buckets">
          <div className="adv-bucket min">
            <span className="fq">freq = 1 ← minFreq 指着这里</span>
            <div className="adv-bkeys">
              <span className="adv-bkey bad">D</span>
              <span className="adv-bkey">E</span>
            </div>
            <div className="bnote">
              桶内按时间序:D 比 E 更早进桶 —— 淘汰时选 <b>D</b>
              (频次最低,且其中最久未用)
            </div>
          </div>
          <div className="adv-bucket">
            <span className="fq">freq = 2</span>
            <div className="adv-bkeys">
              <span className="adv-bkey">A</span>
              <span className="adv-bkey">C</span>
            </div>
            <div className="bnote">A 再被访问一次,就会“搬家”到 freq = 3 的桶</div>
          </div>
          <div className="adv-bucket">
            <span className="fq">freq = 5</span>
            <div className="adv-bkeys">
              <span className="adv-bkey">B</span>
            </div>
            <div className="bnote">高频常客 —— 除非大家都涨上来,否则很安全</div>
          </div>
        </div>
      </div>
      <div className="viz-msg">
        每个桶是一条<b>按时间排序的双向链表</b>(桶内就是一个小 LRU);再配两张哈希表
        (key→值和频次、freq→桶)和一个 minFreq 变量 —— 访问 = 从 freq 桶搬进
        freq+1 桶,淘汰 = 掐掉 minFreq 桶里最老的。全部 O(1)。
      </div>
    </div>
  );
}

/* ================================================================
   SegAnatomy —— [2,5,1,4,9,3] 建出的线段树(静态)
   ================================================================ */

interface SegNode {
  x: number;
  y: number;
  sum: number;
  label: string;
  leaf?: boolean;
}

export function SegAnatomy() {
  const nodes: SegNode[] = [
    { x: 345, y: 45, sum: 24, label: "[0,5]" },
    { x: 195, y: 120, sum: 8, label: "[0,2]" },
    { x: 495, y: 120, sum: 16, label: "[3,5]" },
    { x: 120, y: 195, sum: 7, label: "[0,1]" },
    { x: 270, y: 195, sum: 1, label: "a[2]", leaf: true },
    { x: 420, y: 195, sum: 13, label: "[3,4]" },
    { x: 570, y: 195, sum: 3, label: "a[5]", leaf: true },
    { x: 70, y: 270, sum: 2, label: "a[0]", leaf: true },
    { x: 170, y: 270, sum: 5, label: "a[1]", leaf: true },
    { x: 370, y: 270, sum: 4, label: "a[3]", leaf: true },
    { x: 470, y: 270, sum: 9, label: "a[4]", leaf: true },
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
    [3, 7],
    [3, 8],
    [5, 9],
    [5, 10],
  ];
  return (
    <div className="viz">
      <div className="viz-title">nums = [2, 5, 1, 4, 9, 3] 建出的线段树 —— 每个节点存自己区间的和</div>
      <div className="viz-stage">
        <svg viewBox="0 0 660 320" style={{ width: "100%", maxWidth: 660 }} role="img" aria-label="线段树结构图">
          {edges.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={nodes[a].x}
              y1={nodes[a].y + 20}
              x2={nodes[b].x}
              y2={nodes[b].y - 20}
              stroke="var(--border-strong)"
              strokeWidth={1.4}
            />
          ))}
          {nodes.map((n, i) => (
            <g key={i}>
              <rect
                x={n.x - 28}
                y={n.y - 20}
                width={56}
                height={40}
                rx={10}
                fill={n.leaf ? "var(--acc-soft)" : "var(--panel-2)"}
                stroke={n.leaf ? "var(--acc-border)" : "var(--border-strong)"}
                strokeWidth={1.5}
              />
              <text
                x={n.x}
                y={n.y + 5}
                textAnchor="middle"
                fontSize={14}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                fill={n.leaf ? "var(--acc-ink)" : "var(--text)"}
              >
                {n.sum}
              </text>
              <text
                x={n.x}
                y={n.y + 33}
                textAnchor="middle"
                fontSize={9.5}
                fontFamily="var(--font-mono)"
                fill="var(--text-3)"
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="viz-msg">
        根节点 = 整个数组的和(24);每往下一层,区间<b>对半分</b>;叶子 = 单个元素。
        [0,2] 这种奇数长度区间就左边多分一个:mid = (0+2)/2 = 1 → 左孩子 [0,1]、右孩子
        [2,2]。树高 = ⌈log₂6⌉ + 1,一切操作都只沿着树高走。
      </div>
    </div>
  );
}

/* ================================================================
   SegLab —— 8 叶子交互线段树
   ================================================================ */

const SEG_N = 8;
const SEG_INIT = [5, 2, 7, 4, 6, 1, 3, 8];

// 每个树节点(1 起)负责的区间 [lo, hi],模块级一次算好
const SEG_RANGES: Record<number, [number, number]> = {};
(function fillRange(node: number, lo: number, hi: number) {
  SEG_RANGES[node] = [lo, hi];
  if (lo === hi) return;
  const mid = (lo + hi) >> 1;
  fillRange(2 * node, lo, mid);
  fillRange(2 * node + 1, mid + 1, hi);
})(1, 0, SEG_N - 1);

// 节点坐标:叶子等距排开,父节点取孩子中点
const SEG_POS: Record<number, { x: number; y: number }> = {};
for (let i = 8; i <= 15; i++) SEG_POS[i] = { x: 50 + (i - 8) * 80, y: 272 };
for (let i = 7; i >= 1; i--)
  SEG_POS[i] = {
    x: (SEG_POS[2 * i].x + SEG_POS[2 * i + 1].x) / 2,
    y: SEG_POS[2 * i].y - 76,
  };

export function SegLab() {
  const [vals, setVals] = useState<number[]>(SEG_INIT);
  const [mode, setMode] = useState<"update" | "query">("update");
  const [lit, setLit] = useState<Set<number>>(new Set());
  const [okSet, setOkSet] = useState<Set<number>>(new Set());
  const [visit, setVisit] = useState<Set<number>>(new Set());
  const [ql, setQl] = useState(2);
  const [qr, setQr] = useState(5);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<ReactNode>(
    <>
      改值模式:点任意一个<b>叶子</b>,看更新只点亮一条“从叶到根”的路径。
    </>,
  );

  // 数组版线段树:tree[1] 是根,tree[8..15] 是叶子
  const tree = useMemo(() => {
    const t = new Array(16).fill(0);
    for (let i = 0; i < SEG_N; i++) t[8 + i] = vals[i];
    for (let i = 7; i >= 1; i--) t[i] = t[2 * i] + t[2 * i + 1];
    return t;
  }, [vals]);

  const clearMarks = () => {
    setLit(new Set());
    setOkSet(new Set());
    setVisit(new Set());
  };

  const bump = async (leaf: number) => {
    if (busy || mode !== "update") return;
    setBusy(true);
    clearMarks();
    const nv = (vals[leaf] % 9) + 1;
    setVals((cur) => cur.map((v, i) => (i === leaf ? nv : v)));
    const path: number[] = [];
    for (let node = 8 + leaf; node >= 1; node >>= 1) path.push(node);
    const acc = new Set<number>();
    for (const node of path) {
      acc.add(node);
      setLit(new Set(acc));
      const [lo, hi] = SEG_RANGES[node];
      setMsg(
        node >= 8 ? (
          <>
            a[{leaf}] 改成 <b>{nv}</b>:先改叶子 tree[{node}]…
          </>
        ) : (
          <>
            向上走:父节点 tree[{node}](管 [{lo},{hi}])重算 = 左孩子 + 右孩子…
          </>
        ),
      );
      await sleep(460);
    }
    setMsg(
      <>
        完成!只重算了从叶到根的 <b>4 个节点</b>(log₂8 + 1),其余 11
        个节点原封不动 —— 这就是 update 的 <b>O(log n)</b>。
      </>,
    );
    setBusy(false);
  };

  const runQuery = async () => {
    if (busy) return;
    setBusy(true);
    clearMarks();
    const l = Math.min(ql, qr);
    const r = Math.max(ql, qr);
    const pack: number[] = [];
    const split: number[] = [];
    (function go(node: number, lo: number, hi: number) {
      if (r < lo || hi < l) return; // 完全不相交:直接不管
      if (l <= lo && hi <= r) {
        pack.push(node); // 整个被包住:打包命中
        return;
      }
      split.push(node); // 部分相交:劈开问孩子
      const mid = (lo + hi) >> 1;
      go(2 * node, lo, mid);
      go(2 * node + 1, mid + 1, hi);
    })(1, 0, SEG_N - 1);

    const vis = new Set<number>();
    for (const node of split) {
      vis.add(node);
      setVisit(new Set(vis));
      const [lo, hi] = SEG_RANGES[node];
      setMsg(
        <>
          tree 节点 [{lo},{hi}] 只有一部分在 [{l},{r}] 里 → <b>劈开</b>,把问题丢给两个孩子…
        </>,
      );
      await sleep(430);
    }
    let sum = 0;
    const oks = new Set<number>();
    for (const node of pack) {
      oks.add(node);
      sum += tree[node];
      setOkSet(new Set(oks));
      const [lo, hi] = SEG_RANGES[node];
      setMsg(
        <>
          节点 [{lo},{hi}] <b>整段落在查询区间里</b> → 直接拿现成的和 {tree[node]},不再下探。
        </>,
      );
      await sleep(460);
    }
    setMsg(
      <>
        sum({l},{r}) = <b>{sum}</b>:{pack.length} 个“打包”节点(绿色)直接给出答案,
        黄色节点只是路过劈开 —— 访问节点数 O(log n),而不是把 {r - l + 1} 个叶子逐个加。
      </>,
    );
    setBusy(false);
  };

  const switchMode = (m: "update" | "query") => {
    if (busy) return;
    setMode(m);
    clearMarks();
    setMsg(
      m === "update" ? (
        <>改值模式:点任意一个<b>叶子</b>,看更新路径点亮。</>
      ) : (
        <>查询模式:拖两个滑杆圈定区间 [l,r],按“执行查询”看哪些节点被“打包”命中。</>
      ),
    );
  };

  return (
    <div className="viz">
      <div className="viz-title">线段树实验室 —— 8 个叶子,改值 vs 查询两种玩法</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 4 }}>
        <svg viewBox="0 0 660 336" style={{ width: "100%", maxWidth: 680 }} role="img" aria-label="八叶子线段树">
          {Array.from({ length: 7 }, (_, k) => k + 1).map((i) => (
            <g key={i} stroke="var(--border-strong)" strokeWidth={1.3}>
              <line
                x1={SEG_POS[i].x}
                y1={SEG_POS[i].y + 20}
                x2={SEG_POS[2 * i].x}
                y2={SEG_POS[2 * i].y - 20}
              />
              <line
                x1={SEG_POS[i].x}
                y1={SEG_POS[i].y + 20}
                x2={SEG_POS[2 * i + 1].x}
                y2={SEG_POS[2 * i + 1].y - 20}
              />
            </g>
          ))}
          {Array.from({ length: 15 }, (_, k) => k + 1).map((node) => {
            const p = SEG_POS[node];
            const [lo, hi] = SEG_RANGES[node];
            const isLeaf = node >= 8;
            const state = lit.has(node)
              ? "lit"
              : okSet.has(node)
                ? "ok"
                : visit.has(node)
                  ? "visit"
                  : "";
            const stroke =
              state === "lit"
                ? "var(--acc)"
                : state === "ok"
                  ? "var(--ok)"
                  : state === "visit"
                    ? "var(--warn)"
                    : "var(--border-strong)";
            const fill =
              state === "lit"
                ? "var(--acc-soft)"
                : state === "ok"
                  ? "var(--ok-bg)"
                  : state === "visit"
                    ? "var(--warn-bg)"
                    : "var(--panel-2)";
            return (
              <g
                key={node}
                onClick={isLeaf ? () => bump(node - 8) : undefined}
                style={
                  isLeaf && mode === "update" && !busy ? { cursor: "pointer" } : undefined
                }
                role={isLeaf ? "button" : undefined}
                aria-label={isLeaf ? `叶子 a[${node - 8}]` : undefined}
              >
                <rect
                  x={p.x - 27}
                  y={p.y - 20}
                  width={54}
                  height={40}
                  rx={10}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1.6}
                />
                <text
                  x={p.x}
                  y={p.y + 5}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight={700}
                  fontFamily="var(--font-mono)"
                  fill="var(--text)"
                >
                  {tree[node]}
                </text>
                <text
                  x={p.x}
                  y={p.y + 33}
                  textAnchor="middle"
                  fontSize={9.5}
                  fontFamily="var(--font-mono)"
                  fill="var(--text-3)"
                >
                  {isLeaf ? `a[${node - 8}]` : `[${lo},${hi}]`}
                </text>
              </g>
            );
          })}
          {/* 查询区间标尺 */}
          {mode === "query" && (
            <g>
              <line
                x1={SEG_POS[8 + Math.min(ql, qr)].x - 30}
                y1={318}
                x2={SEG_POS[8 + Math.max(ql, qr)].x + 30}
                y2={318}
                stroke="var(--acc)"
                strokeWidth={3}
                strokeLinecap="round"
              />
              <text
                x={(SEG_POS[8 + Math.min(ql, qr)].x + SEG_POS[8 + Math.max(ql, qr)].x) / 2}
                y={332}
                textAnchor="middle"
                fontSize={10}
                fontFamily="var(--font-mono)"
                fill="var(--acc-ink)"
              >
                查询区间 [{Math.min(ql, qr)},{Math.max(ql, qr)}]
              </text>
            </g>
          )}
        </svg>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <div className="viz-ctl">
        <div className="seg">
          <button
            type="button"
            className={`seg-btn${mode === "update" ? " on" : ""}`}
            onClick={() => switchMode("update")}
          >
            改值模式
          </button>
          <button
            type="button"
            className={`seg-btn${mode === "query" ? " on" : ""}`}
            onClick={() => switchMode("query")}
          >
            查询模式
          </button>
        </div>
        {mode === "query" && (
          <>
            <label className="adv-slider">
              <span className="mono">l = {Math.min(ql, qr)}</span>
              <input
                type="range"
                min={0}
                max={SEG_N - 1}
                value={ql}
                disabled={busy}
                onChange={(e) => setQl(Number(e.target.value))}
                aria-label="查询左端点"
              />
            </label>
            <label className="adv-slider">
              <span className="mono">r = {Math.max(ql, qr)}</span>
              <input
                type="range"
                min={0}
                max={SEG_N - 1}
                value={qr}
                disabled={busy}
                onChange={(e) => setQr(Number(e.target.value))}
                aria-label="查询右端点"
              />
            </label>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={busy}
              onClick={runQuery}
            >
              执行查询
            </button>
          </>
        )}
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          n=8 · 树高 log₂8+1 = 4
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   SkipLab —— 跳表查找路径逐帧回放
   ================================================================ */

// 固定跳表:L0 全量,L1/L2 是抽样出的"高速公路"
//   L2: H ──────────────→ 19 ─────────────────→ ∞
//   L1: H ──→ 7 ────────→ 19 ────→ 29 → 37 ───→ ∞
//   L0: H → 3 → 7 → 11 → 19 → 23 → 29 → 37 → 43 → ∞
const SKIP_COLS = ["H", "3", "7", "11", "19", "23", "29", "37", "43", "∞"];
const SKIP_LEVELS: number[][] = [
  // 每层出现的列下标(0=H,9=∞)
  [0, 4, 9], // L2(顶层)
  [0, 2, 4, 6, 7, 9], // L1
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // L0
];
const skipX = (col: number) => 36 + col * 64;
const skipY = (lvlRow: number) => 48 + lvlRow * 72; // lvlRow: 0=L2, 1=L1, 2=L0

interface SkipFrame {
  cur: string; // "col-row"
  path: string[]; // 走过的节点
  edges: [string, string][]; // 走过的边(节点 id 对)
  found?: boolean;
  msg: ReactNode;
}

const SKIP_FRAMES: SkipFrame[] = [
  {
    cur: "0-0",
    path: ["0-0"],
    edges: [],
    msg: (
      <>
        查找 <b>23</b>。从头节点 H 的<b>最顶层 L2</b> 出发 —— 顶层站最少、一步最远,
        就像先坐特快列车。
      </>
    ),
  },
  {
    cur: "4-0",
    path: ["0-0", "4-0"],
    edges: [["0-0", "4-0"]],
    msg: (
      <>
        L2 上看右邻:19 ≤ 23,<b>前进到 19</b> —— 这一步直接跨过了 3、7、11
        三个节点,它们连看都不用看。
      </>
    ),
  },
  {
    cur: "4-1",
    path: ["0-0", "4-0", "4-1"],
    edges: [
      ["0-0", "4-0"],
      ["4-0", "4-1"],
    ],
    msg: (
      <>
        L2 上 19 的右邻是 ∞ &gt; 23 —— <b>过头了,原地下楼</b>到 L1。
        下一层的站更密,能走得更细。
      </>
    ),
  },
  {
    cur: "4-2",
    path: ["0-0", "4-0", "4-1", "4-2"],
    edges: [
      ["0-0", "4-0"],
      ["4-0", "4-1"],
      ["4-1", "4-2"],
    ],
    msg: (
      <>
        L1 上 19 的右邻是 29 &gt; 23 —— 又过头,<b>再下楼</b>到 L0(最底层 = 完整的有序链表)。
      </>
    ),
  },
  {
    cur: "5-2",
    path: ["0-0", "4-0", "4-1", "4-2", "5-2"],
    edges: [
      ["0-0", "4-0"],
      ["4-0", "4-1"],
      ["4-1", "4-2"],
      ["4-2", "5-2"],
    ],
    found: true,
    msg: (
      <>
        L0 上 19 的右邻是 23 = 23,<b>找到!</b>全程只做了 4 次比较;普通链表要从 3
        开始一格格比。n 越大差距越夸张:<b>O(log n) vs O(n)</b>。
      </>
    ),
  },
];

export function SkipLab() {
  const stepper = useStepper(SKIP_FRAMES.length, 1500);
  const f = SKIP_FRAMES[stepper.step];
  const pathSet = new Set(f.path);
  const edgeSet = new Set(f.edges.map(([a, b]) => `${a}|${b}`));

  const nodeAt = (col: number, row: number) => {
    const id = `${col}-${row}`;
    const isCur = f.cur === id;
    const onPath = pathSet.has(id);
    const isFound = f.found && isCur;
    const stroke = isFound
      ? "var(--ok)"
      : isCur
        ? "var(--acc)"
        : onPath
          ? "var(--acc-border)"
          : "var(--border-strong)";
    const fill = isFound
      ? "var(--ok-bg)"
      : isCur || onPath
        ? "var(--acc-soft)"
        : "var(--panel-2)";
    const color = isFound
      ? "var(--ok)"
      : isCur || onPath
        ? "var(--acc-ink)"
        : SKIP_COLS[col] === "H" || SKIP_COLS[col] === "∞"
          ? "var(--text-3)"
          : "var(--text)";
    return (
      <g key={id}>
        <rect
          x={skipX(col) - 22}
          y={skipY(row) - 15}
          width={44}
          height={30}
          rx={8}
          fill={fill}
          stroke={stroke}
          strokeWidth={isCur ? 2 : 1.4}
        />
        <text
          x={skipX(col)}
          y={skipY(row) + 4.5}
          textAnchor="middle"
          fontSize={12.5}
          fontWeight={700}
          fontFamily="var(--font-mono)"
          fill={color}
        >
          {SKIP_COLS[col]}
        </text>
      </g>
    );
  };

  return (
    <div className="viz">
      <div className="viz-title">跳表查找实验室 —— search(23):向右走,过头就下楼</div>
      <div className="viz-stage">
        <svg viewBox="0 0 660 250" style={{ width: "100%", maxWidth: 680 }} role="img" aria-label="跳表三层结构与查找路径">
          {/* 层标签 */}
          {["L2 特快", "L1 快车", "L0 慢车"].map((t, row) => (
            <text
              key={t}
              x={6}
              y={skipY(row) + 4}
              fontSize={9.5}
              fontFamily="var(--font-mono)"
              fill="var(--text-3)"
            >
              {t}
            </text>
          ))}
          {/* 塔:同一 key 的多层用竖虚线连起来 */}
          {SKIP_COLS.map((_, col) => {
            const rows = SKIP_LEVELS.map((lvl, r) => (lvl.includes(col) ? r : -1)).filter(
              (r) => r >= 0,
            );
            if (rows.length < 2) return null;
            return (
              <line
                key={"t" + col}
                x1={skipX(col)}
                y1={skipY(rows[0]) + 15}
                x2={skipX(col)}
                y2={skipY(rows[rows.length - 1]) - 15}
                stroke="var(--border)"
                strokeDasharray="3 4"
              />
            );
          })}
          {/* 每层的水平指针 */}
          {SKIP_LEVELS.map((cols, row) =>
            cols.slice(0, -1).map((c, i) => {
              const nc = cols[i + 1];
              const hi = edgeSet.has(`${c}-${row}|${nc}-${row}`);
              return (
                <g key={`e${row}-${c}`}>
                  <line
                    x1={skipX(c) + 22}
                    y1={skipY(row)}
                    x2={skipX(nc) - 22}
                    y2={skipY(row)}
                    stroke={hi ? "var(--acc)" : "var(--border-strong)"}
                    strokeWidth={hi ? 2.2 : 1.3}
                    className={hi ? "flow-edge" : undefined}
                  />
                  <polygon
                    points={`${skipX(nc) - 22},${skipY(row)} ${skipX(nc) - 28},${skipY(row) - 3} ${skipX(nc) - 28},${skipY(row) + 3}`}
                    fill={hi ? "var(--acc)" : "var(--text-3)"}
                  />
                </g>
              );
            }),
          )}
          {/* 下楼的竖直高亮边 */}
          {f.edges
            .filter(([a, b]) => a.split("-")[0] === b.split("-")[0])
            .map(([a, b]) => {
              const col = Number(a.split("-")[0]);
              const r1 = Number(a.split("-")[1]);
              const r2 = Number(b.split("-")[1]);
              return (
                <line
                  key={`d${a}${b}`}
                  x1={skipX(col)}
                  y1={skipY(r1) + 15}
                  x2={skipX(col)}
                  y2={skipY(r2) - 15}
                  stroke="var(--acc)"
                  strokeWidth={2.2}
                  className="flow-edge"
                />
              );
            })}
          {/* 节点 */}
          {SKIP_LEVELS.map((cols, row) => cols.map((c) => nodeAt(c, row)))}
        </svg>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={stepper} step={stepper.step} total={SKIP_FRAMES.length} />
    </div>
  );
}

/* ================================================================
   BloomLab —— 16 位布隆过滤器
   ================================================================ */

const BLOOM_M = 16;
const BLOOM_SEEDS = [7, 41, 233];

function bloomHash(s: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < s.length; i++) {
    h = (h * 131 + s.charCodeAt(i)) % 100003;
  }
  return h % BLOOM_M;
}

const bloomPositions = (s: string) =>
  BLOOM_SEEDS.map((seed) => bloomHash(s.trim().toLowerCase(), seed));

const BLOOM_PRESETS = ["cat", "dog", "fox"];
const BLOOM_CANDIDATES = [
  "owl", "bee", "ant", "cow", "rat", "pig", "hen", "bat",
  "elk", "yak", "koi", "emu", "asp", "doe", "ram", "kit",
];

export function BloomLab() {
  const [bits, setBits] = useState<boolean[]>(() => Array(BLOOM_M).fill(false));
  const [inserted, setInserted] = useState<string[]>([]);
  const [litBits, setLitBits] = useState<number[]>([]);
  const [badBit, setBadBit] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<ReactNode>(
    <>
      16 个位、3 个哈希函数。先插入几个词,再查询一个<b>没插入过</b>的词 ——
      运气好(坏?)你会亲眼看到一次假阳性。
    </>,
  );

  const insert = async (raw: string) => {
    const word = raw.trim().toLowerCase();
    if (!word || busy) return;
    setBusy(true);
    setBadBit(null);
    const pos = bloomPositions(word);
    setMsg(
      <>
        insert(&quot;{word}&quot;):3 个哈希函数分别算出位置 <b>{pos.join(", ")}</b> → 逐个置 1。
      </>,
    );
    const acc: number[] = [];
    for (const p of pos) {
      acc.push(p);
      setLitBits([...acc]);
      await sleep(420);
      setBits((prev) => {
        const nb = [...prev];
        nb[p] = true;
        return nb;
      });
    }
    await sleep(380);
    setLitBits([]);
    setInserted((prev) => (prev.includes(word) ? prev : [...prev, word]));
    setMsg(
      <>
        &quot;{word}&quot; 已登记(位 {pos.join("、")} 点亮)。注意:这些位是<b>大家共享</b>的
        —— 别的词也可能点亮同一批位,这正是假阳性的种子。
      </>,
    );
    setBusy(false);
  };

  const query = async (raw: string) => {
    const word = raw.trim().toLowerCase();
    if (!word || busy) return;
    setBusy(true);
    setBadBit(null);
    const pos = bloomPositions(word);
    const acc: number[] = [];
    for (const p of pos) {
      acc.push(p);
      setLitBits([...acc]);
      setMsg(
        <>
          query(&quot;{word}&quot;):检查位 {acc.join("、")}…
        </>,
      );
      await sleep(420);
    }
    const zero = pos.find((p) => !bits[p]);
    await sleep(200);
    setLitBits([]);
    if (zero !== undefined) {
      setBadBit(zero);
      setMsg(
        <>
          位 <b>{zero}</b> 还是 0 → <b>&quot;{word}&quot; 一定不在</b>。铁证:如果它插入过,
          这一位必然已被置 1,而位从来不会被清零。
        </>,
      );
    } else if (inserted.includes(word)) {
      setMsg(
        <>
          3 个位全是 1 → 报告“<b>可能在</b>”。这次它确实插入过(真阳性)——
          但布隆自己并不知道,它只认位。
        </>,
      );
    } else {
      setMsg(
        <>
          3 个位全是 1 → 布隆说“可能在”。可 &quot;{word}&quot; 根本<b>没插入过</b> ——
          <b>假阳性!</b>它的 3 个位恰好被 {inserted.join("、") || "别的词"} 顺手点亮了。
        </>,
      );
    }
    setBusy(false);
  };

  const findFalsePositive = () => {
    if (busy) return;
    const fp = BLOOM_CANDIDATES.find(
      (w) => !inserted.includes(w) && bloomPositions(w).every((p) => bits[p]),
    );
    if (fp) {
      void query(fp);
    } else {
      setMsg(
        <>
          在候选词表里暂时找不到假阳性 —— 位数组还太“空”。再插入一两个词
          (位越满,误判越容易),然后再点我。
        </>,
      );
    }
  };

  const reset = () => {
    if (busy) return;
    setBits(Array(BLOOM_M).fill(false));
    setInserted([]);
    setLitBits([]);
    setBadBit(null);
    setMsg("位数组已清零。从头再来 —— 试试插入 3 个词后直接点“抓一个假阳性”。");
  };

  return (
    <div className="viz">
      <div className="viz-title">布隆过滤器实验室 —— m=16 位,k=3 个哈希函数</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 14 }}>
        <div className="adv-bits">
          {bits.map((on, i) => (
            <div
              key={i}
              className="adv-bit"
              data-on={on ? "1" : "0"}
              data-state={litBits.includes(i) ? "lit" : badBit === i ? "bad" : ""}
            >
              {on ? 1 : 0}
              <span className="bi">{i}</span>
            </div>
          ))}
        </div>
        <div className="adv-words">
          已插入:{inserted.length > 0 ? inserted.join(", ") : "(还没有词)"}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <div className="viz-ctl">
        {BLOOM_PRESETS.map((w) => (
          <button
            key={w}
            type="button"
            className="btn btn-sm btn-primary"
            disabled={busy || inserted.includes(w)}
            onClick={() => insert(w)}
          >
            插入 &quot;{w}&quot;
          </button>
        ))}
        <input
          className="adv-input"
          placeholder="自己输一个词…"
          value={text}
          disabled={busy}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void query(text);
          }}
          aria-label="自定义单词"
        />
        <button
          type="button"
          className="btn btn-sm"
          disabled={busy || !text.trim()}
          onClick={() => insert(text)}
        >
          插入
        </button>
        <button
          type="button"
          className="btn btn-sm"
          disabled={busy || !text.trim()}
          onClick={() => query(text)}
        >
          查询
        </button>
        <button type="button" className="btn btn-sm" disabled={busy} onClick={findFalsePositive}>
          抓一个假阳性
        </button>
        <button type="button" className="btn btn-sm btn-ghost" disabled={busy} onClick={reset}>
          清零
        </button>
      </div>
    </div>
  );
}
