"use client";

// 第 10 章 · 前缀树(Trie)的专属可视化:
//  - TrieLab(招牌):输入单词插入(SVG 树生长 + 共享前缀复用),查询单词/前缀,
//    区分「命中单词 / 是前缀非单词 / 未命中」三种结果。
//  - StaticTrie:根据词表自动布局的静态结构图(§02 结构 / isEnd 图解复用)。
//  - TrieStepper:通用「Trie 帧」播放器,精讲 LC 208 / LC 211 的逐帧动画用。

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ================= 数据结构与工具 ================= */

interface TNode {
  id: number;
  /** 从父节点连到本节点的那条边上的字符;根节点为 "" */
  ch: string;
  isEnd: boolean;
  /** isEnd 为 true 时,记录到此结束的完整单词(用于图上标注) */
  word?: string;
  children: Map<string, TNode>;
}

/** 用一批单词建一棵 Trie;返回根与下一个可用 id */
function buildTrie(words: string[], startId = 1): { root: TNode; nextId: number } {
  let id = startId;
  const root: TNode = { id: id++, ch: "", isEnd: false, children: new Map() };
  for (const w of words) {
    let cur = root;
    for (const c of w) {
      let nx = cur.children.get(c);
      if (!nx) {
        nx = { id: id++, ch: c, isEnd: false, children: new Map() };
        cur.children.set(c, nx);
      }
      cur = nx;
    }
    cur.isEnd = true;
    cur.word = w;
  }
  return { root, nextId: id };
}

function cloneTrie(n: TNode): TNode {
  const c: TNode = {
    id: n.id,
    ch: n.ch,
    isEnd: n.isEnd,
    word: n.word,
    children: new Map(),
  };
  for (const [k, v] of n.children) c.children.set(k, cloneTrie(v));
  return c;
}

function countNodes(n: TNode): number {
  let s = 1;
  for (const v of n.children.values()) s += countNodes(v);
  return s;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ---- 布局:x = 叶子列位次(树整齐铺开),y = 深度 ---- */

interface LayNode {
  id: number;
  ch: string;
  x: number;
  y: number;
  isEnd: boolean;
  word?: string;
}
interface LayEdge {
  id: string;
  ch: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function layout(root: TNode, w: number): { nodes: LayNode[]; edges: LayEdge[]; height: number } {
  const PAD = 34;
  const TOP = 32;
  const ROW = 62;
  let col = 0;
  let maxDepth = 0;
  const pos = new Map<number, { x: number; y: number }>();

  const assign = (n: TNode, depth: number): number => {
    maxDepth = Math.max(maxDepth, depth);
    const kids = [...n.children.keys()].sort().map((k) => n.children.get(k)!);
    let x: number;
    if (kids.length === 0) {
      x = col++;
    } else {
      const xs = kids.map((k) => assign(k, depth + 1));
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    pos.set(n.id, { x, y: depth });
    return x;
  };
  assign(root, 0);

  const span = Math.max(col - 1, 0);
  const X = (u: number) => (span === 0 ? w / 2 : PAD + (u / span) * (w - 2 * PAD));
  const Y = (d: number) => TOP + d * ROW;

  const nodes: LayNode[] = [];
  const edges: LayEdge[] = [];
  const walk = (n: TNode, parent: TNode | null) => {
    const p = pos.get(n.id)!;
    const nx = X(p.x);
    const ny = Y(p.y);
    nodes.push({ id: n.id, ch: n.ch, x: nx, y: ny, isEnd: n.isEnd, word: n.word });
    if (parent) {
      const pp = pos.get(parent.id)!;
      edges.push({
        id: `${parent.id}-${n.id}`,
        ch: n.ch,
        x1: X(pp.x),
        y1: Y(pp.y),
        x2: nx,
        y2: ny,
      });
    }
    for (const k of [...n.children.keys()].sort()) walk(n.children.get(k)!, n);
  };
  walk(root, null);

  return { nodes, edges, height: TOP + maxDepth * ROW + 46 };
}

/** 复用的 SVG 节点组:字符在圈内,isEnd 加一圈「接受态」外环 + 词标 */
function TrieNodeG({
  n,
  cls,
  born,
}: {
  n: LayNode;
  cls: string;
  born?: boolean;
}) {
  return (
    <g className={`tr-node${cls}${n.isEnd ? " end" : ""}${born ? " tr-born" : ""}`}>
      {n.isEnd && <circle className="tr-ring" cx={n.x} cy={n.y} r={20.5} />}
      <circle cx={n.x} cy={n.y} r={15.5} />
      <text x={n.x} y={n.y}>
        {n.ch === "" ? "•" : n.ch}
      </text>
      {n.ch === "" && (
        <text className="tr-tag" x={n.x} y={n.y - 26}>
          root
        </text>
      )}
      {n.isEnd && n.word && (
        <text className="tr-word" x={n.x} y={n.y + 33}>
          {n.word}
        </text>
      )}
    </g>
  );
}

/* ================= TrieLab(招牌) ================= */

const CAP = 32;
const LAB_W = 640;
const SEED = ["car", "card", "cat", "do", "dog"];

export function TrieLab() {
  const seed = useMemo(() => buildTrie(SEED), []);
  const nextId = useRef(seed.nextId);
  const [root, setRoot] = useState<TNode>(() => seed.root);
  const [lit, setLit] = useState<number[]>([]);
  const [ok, setOk] = useState<number[]>([]);
  const [bad, setBad] = useState<number[]>([]);
  const [pre, setPre] = useState<number[]>([]);
  const [born, setBorn] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState<ReactNode>(
    <>
      这棵 Trie 里已经住着 <b>car、card、cat、do、dog</b> 五个词。试着插入{" "}
      <b>care</b> 或 <b>cab</b>,看它怎么复用已有的开头;再查询 <b>ca</b> 感受「前缀」。
    </>,
  );

  const { nodes, edges, height } = useMemo(() => layout(root, LAB_W), [root]);
  const count = nodes.length;

  const clearMarks = () => {
    setLit([]);
    setOk([]);
    setBad([]);
    setPre([]);
    setBorn([]);
  };

  const cls = (id: number) => {
    if (bad.includes(id)) return " bad";
    if (ok.includes(id)) return " ok";
    if (pre.includes(id)) return " pre";
    if (lit.includes(id)) return " lit";
    return "";
  };

  const readWord = (): string | null => {
    const w = input.trim().toLowerCase();
    if (!/^[a-z]{1,8}$/.test(w)) {
      setMsg("请输入 1–8 个英文字母(实验室只演示小写字母 a–z)。");
      return null;
    }
    return w;
  };

  const doInsert = async () => {
    if (busy) return;
    const w = readWord();
    if (w === null) return;
    setBusy(true);
    clearMarks();

    // 在克隆上走一遍:能复用的复用,缺的现建
    const newRoot = cloneTrie(root);
    let cur = newRoot;
    let id = nextId.current;
    const pathIds: number[] = [cur.id];
    const bornIds: number[] = [];
    let reused = 0;
    for (const c of w) {
      let nx = cur.children.get(c);
      if (nx) {
        reused++;
      } else {
        nx = { id: id++, ch: c, isEnd: false, children: new Map() };
        cur.children.set(c, nx);
        bornIds.push(nx.id);
      }
      cur = nx;
      pathIds.push(cur.id);
    }

    if (countNodes(newRoot) > CAP) {
      setMsg(`实验室最多容纳 ${CAP} 个节点 —— 点「重置」清空后再玩。`);
      setBusy(false);
      return;
    }

    const already = cur.isEnd;
    cur.isEnd = true;
    cur.word = w;
    nextId.current = id;
    setRoot(newRoot);
    setBorn(bornIds);

    // 沿路径逐节点点亮 —— 前缀复用段会先亮,再看到新节点接在末尾
    let acc: number[] = [];
    for (const pid of pathIds) {
      acc = [...acc, pid];
      setLit(acc);
      await sleep(300);
    }
    setLit(pathIds);
    setOk([cur.id]);
    setMsg(
      already ? (
        <>
          <b>{w}</b> 之前就插入过 —— 这次只是又把末节点的 isEnd 标了一遍,树的形状没变。
        </>
      ) : (
        <>
          插入 <b>{w}</b> 完成:前 <b>{reused}</b> 个字母沿着已有路径「免费」复用,
          只新建了 <b>{bornIds.length}</b> 个节点,末节点 isEnd 置为 true。
          共走了 <b>{w.length}</b> 步 = 单词长度,和树里已有多少词 <b>毫无关系</b>。
        </>
      ),
    );
    setBusy(false);
  };

  const doQuery = async (prefixMode: boolean) => {
    if (busy) return;
    const w = readWord();
    if (w === null) return;
    setBusy(true);
    clearMarks();

    let cur: TNode | undefined = root;
    const acc: number[] = [root.id];
    setLit([...acc]);
    await sleep(320);
    let broke = false;
    for (const c of w) {
      const nx: TNode | undefined = cur!.children.get(c);
      if (!nx) {
        broke = true;
        break;
      }
      cur = nx;
      acc.push(cur.id);
      setLit([...acc]);
      await sleep(320);
    }

    if (broke) {
      setLit(acc.slice(0, -1));
      setBad([acc[acc.length - 1]]);
      setMsg(
        <>
          查询 <b>{w}</b>:走到 <b>{acc.length}</b> 个节点时,下一个字母对应的 child 是空的 ——
          断路。<b>未命中</b>:整棵树里都不可能有以 {w} 开头的内容(有的话它必然长在这条路径上)。
        </>,
      );
    } else if (prefixMode) {
      setLit(acc.slice(0, -1));
      setOk([cur!.id]);
      setMsg(
        <>
          startsWith(<b>{w}</b>):从 root 一路都能走通 → <b>存在以 {w} 为前缀的单词</b>。
          注意:是否 isEnd <b>无所谓</b>,能走到底就算前缀命中。
        </>,
      );
    } else if (cur!.isEnd) {
      setLit(acc.slice(0, -1));
      setOk([cur!.id]);
      setMsg(
        <>
          search(<b>{w}</b>):路径走通,且末节点 <b>isEnd = true</b> → <b>命中一个完整单词</b> ✓
        </>,
      );
    } else {
      setLit(acc.slice(0, -1));
      setPre([cur!.id]);
      setMsg(
        <>
          search(<b>{w}</b>):路径走得通,但末节点 <b>isEnd = false</b> —— {w}{" "}
          只是别人的<b>前缀,不是被插入过的单词</b>。所以 search 返回 false,而
          startsWith 会返回 true。这正是 isEnd 存在的意义。
        </>,
      );
    }
    setBusy(false);
  };

  const doReset = () => {
    if (busy) return;
    clearMarks();
    setInput("");
    const s = buildTrie(SEED);
    nextId.current = s.nextId;
    setRoot(s.root);
    setMsg("已重置为初始 5 个词:car、card、cat、do、dog。");
  };

  return (
    <div className="viz">
      <div className="tr-lab-title viz-title">
        Trie 实验室 —— 插入单词看它「长」出来,查询看路径逐节点点亮
      </div>
      <div className="viz-stage">
        <svg
          viewBox={`0 0 ${LAB_W} ${height}`}
          className="tr-svg"
          role="img"
          aria-label="前缀树可视化"
        >
          {edges.map((e) => (
            <g key={e.id}>
              <line className="tr-edge" x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />
              <text
                className="tr-edge-label"
                x={(e.x1 + e.x2) / 2}
                y={(e.y1 + e.y2) / 2}
              >
                {e.ch}
              </text>
            </g>
          ))}
          {nodes.map((n) => (
            <TrieNodeG key={n.id} n={n} cls={cls(n.id)} born={born.includes(n.id)} />
          ))}
        </svg>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <div className="tr-legend">
        <span>
          <i className="tr-dot lit" /> 路径经过
        </span>
        <span>
          <i className="tr-dot ok" /> 命中(单词/前缀)
        </span>
        <span>
          <i className="tr-dot pre" /> 是前缀,非单词
        </span>
        <span>
          <i className="tr-dot bad" /> 断路未命中
        </span>
        <span>
          <i className="tr-dot end" /> isEnd(词尾)
        </span>
      </div>
      <div className="viz-ctl">
        <input
          className="tr-input"
          value={input}
          placeholder="输入单词,如 care"
          disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") doInsert();
          }}
          aria-label="输入要插入或查询的单词"
        />
        <button type="button" className="btn btn-sm btn-primary" onClick={doInsert} disabled={busy}>
          插入
        </button>
        <button type="button" className="btn btn-sm" onClick={() => doQuery(false)} disabled={busy}>
          查询单词
        </button>
        <button type="button" className="btn btn-sm" onClick={() => doQuery(true)} disabled={busy}>
          查询前缀
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={doReset} disabled={busy}>
          重置
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          节点 {count} · 上限 {CAP}
        </span>
      </div>
    </div>
  );
}

/* ================= StaticTrie:静态结构图 ================= */

export function StaticTrie({
  words,
  w = 560,
  caption,
  emphasize,
}: {
  words: string[];
  w?: number;
  caption?: ReactNode;
  /** 需要额外高亮的完整单词的词尾节点(用 word 匹配) */
  emphasize?: string[];
}) {
  const { root } = useMemo(() => buildTrie(words), [words]);
  const { nodes, edges, height } = useMemo(() => layout(root, w), [root, w]);
  const emph = new Set(emphasize ?? []);

  return (
    <div className="tr-fig">
      <svg viewBox={`0 0 ${w} ${height}`} className="tr-svg" role="img">
        {edges.map((e) => (
          <g key={e.id}>
            <line className="tr-edge" x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />
            <text
              className="tr-edge-label"
              x={(e.x1 + e.x2) / 2}
              y={(e.y1 + e.y2) / 2}
            >
              {e.ch}
            </text>
          </g>
        ))}
        {nodes.map((n) => (
          <TrieNodeG
            key={n.id}
            n={n}
            cls={n.word && emph.has(n.word) ? " ok" : ""}
          />
        ))}
      </svg>
      {caption && <div className="tr-fig-cap">{caption}</div>}
    </div>
  );
}

/* ================= TrieStepper:通用「Trie 帧」播放器 ================= */

export interface TStepNode {
  id: number;
  ch: string;
  x: number;
  y: number;
  isEnd?: boolean;
  word?: string;
}
export interface TStepFrame {
  lit?: number[];
  ok?: number[];
  bad?: number[];
  pre?: number[];
  dim?: number[];
  msg: ReactNode;
}

export function TrieStepper({
  title,
  nodes,
  edges,
  frames,
  w = 640,
  h = 400,
}: {
  title: string;
  nodes: TStepNode[];
  edges: [number, number][];
  frames: TStepFrame[];
  w?: number;
  h?: number;
}) {
  const s = useStepper(frames.length);
  const f = frames[s.step];
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const cls = (id: number) => {
    if (f.bad?.includes(id)) return " bad";
    if (f.ok?.includes(id)) return " ok";
    if (f.pre?.includes(id)) return " pre";
    if (f.lit?.includes(id)) return " lit";
    if (f.dim?.includes(id)) return " dim";
    return "";
  };

  return (
    <div className="viz">
      <div className="viz-title">{title}</div>
      <div className="viz-stage">
        <svg viewBox={`0 0 ${w} ${h}`} className="tr-svg" role="img">
          {edges.map(([a, b], i) => {
            const na = byId.get(a)!;
            const nb = byId.get(b)!;
            const on =
              (f.lit?.includes(a) || f.ok?.includes(a) || f.pre?.includes(a)) &&
              (f.lit?.includes(b) ||
                f.ok?.includes(b) ||
                f.pre?.includes(b) ||
                f.bad?.includes(b));
            return (
              <g key={i}>
                <line
                  className={`tr-edge${on ? " on" : ""}`}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                />
                <text
                  className="tr-edge-label"
                  x={(na.x + nb.x) / 2}
                  y={(na.y + nb.y) / 2}
                >
                  {nb.ch}
                </text>
              </g>
            );
          })}
          {nodes.map((n) => (
            <TrieNodeG
              key={n.id}
              n={{
                id: n.id,
                ch: n.ch,
                x: n.x,
                y: n.y,
                isEnd: !!n.isEnd,
                word: n.word,
              }}
              cls={cls(n.id)}
            />
          ))}
        </svg>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={frames.length} />
    </div>
  );
}
