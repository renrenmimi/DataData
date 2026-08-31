"use client";

// Chapter 10 · Dedicated visualizations for the prefix tree (Trie):
//  - TrieLab (the centerpiece): type a word to insert it (the SVG tree grows and shared
//    prefixes are reused), then query a word or prefix and see all three outcomes:
//    word found / prefix but not a word / no match.
//  - StaticTrie: a static structure diagram laid out automatically from a word list
//    (reused by the §02 structure figure and the isEnd figure).
//  - TrieStepper: the generic "trie frame" player, used by the frame-by-frame
//    animations of the LC 208 / LC 211 walkthroughs.
//
// Bilingual: all titles, narration, legends, buttons, and accessibility strings switch
// through <T> / useL().

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { useL, T, type Loc } from "@/lib/i18n";

/* ================= Data structures and helpers ================= */

interface TNode {
  id: number;
  /** The character on the edge from the parent down to this node; "" for the root */
  ch: string;
  isEnd: boolean;
  /** When isEnd is true, the complete word that ends here (used for labels in the figure) */
  word?: string;
  children: Map<string, TNode>;
}

/** Build a trie from a batch of words; returns the root and the next free id */
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

/* ---- Layout: x = leaf column rank (spreads the tree out evenly), y = depth ---- */

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

/** Shared SVG node group: the character sits inside the circle; an isEnd node gets an
 *  extra "accepting state" outer ring plus its word label */
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

/* ================= TrieLab (the centerpiece) ================= */

const CAP = 32;
const LAB_W = 640;
const SEED = ["car", "card", "cat", "do", "dog"];

export function TrieLab() {
  const L = useL();
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
    <T
      en={
        <>
          This trie already holds five words: <b>car, card, cat, do, dog</b>.
          Insert <b>care</b> or <b>cab</b> and watch which part of the path is
          reused. Then search for <b>ca</b> to see what a prefix looks like.
        </>
      }
      zh={
        <>
          这棵 Trie 里已经存了 <b>car、card、cat、do、dog</b> 五个词。试着插入{" "}
          <b>care</b> 或 <b>cab</b>,看路径哪一段被复用;再查询 <b>ca</b>,
          看看「前缀」长什么样。
        </>
      }
    />,
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
      setMsg(
        <T
          en="Type 1 to 8 letters. This lab only demonstrates lowercase a to z."
          zh="请输入 1–8 个英文字母(实验室只演示小写字母 a–z)。"
        />,
      );
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

    // Walk the clone: reuse whatever exists, create whatever is missing
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
      setMsg(
        <T
          en={`This lab holds at most ${CAP} nodes. Press Reset to start over.`}
          zh={`实验室最多容纳 ${CAP} 个节点 —— 点「重置」清空后再试。`}
        />,
      );
      setBusy(false);
      return;
    }

    const already = cur.isEnd;
    cur.isEnd = true;
    cur.word = w;
    nextId.current = id;
    setRoot(newRoot);
    setBorn(bornIds);

    // Light the path up node by node — the reused prefix segment lights first, then the
    // new nodes appended at the end
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
        <T
          en={
            <>
              <b>{w}</b> was already stored. This insert only set isEnd = true
              again on the same last node, so the shape of the tree did not
              change.
            </>
          }
          zh={
            <>
              <b>{w}</b> 之前就插入过。这次只是把同一个末节点的 isEnd 又标了一遍,
              树的形状没有变化。
            </>
          }
        />
      ) : (
        <T
          en={
            <>
              Inserted <b>{w}</b>. <b>{reused}</b> of its <b>{w.length}</b>{" "}
              letters followed edges that already existed, so only{" "}
              <b>{bornIds.length}</b> new nodes were created, and the last node
              now has isEnd = true. The walk took <b>{w.length}</b> steps, the
              length of the word. How many words the tree already holds does not
              change that.
            </>
          }
          zh={
            <>
              插入 <b>{w}</b> 完成:它的 <b>{w.length}</b> 个字母里,有{" "}
              <b>{reused}</b> 个走的是已经存在的边,所以只新建了{" "}
              <b>{bornIds.length}</b> 个节点,末节点 isEnd 置为 true。整趟走了{" "}
              <b>{w.length}</b> 步 = 单词长度;树里已经有多少词,不影响这个步数。
            </>
          }
        />
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
        <T
          en={
            <>
              Looking up <b>{w}</b>: the walk reached <b>{acc.length}</b> nodes
              counting the root, and then the next letter had no matching child.
              The path stops here. <b>No match</b>, and nothing in the tree can
              start with {w}, because any such word would have to lie on this
              same path.
            </>
          }
          zh={
            <>
              查询 <b>{w}</b>:算上根节点走到第 <b>{acc.length}</b> 个节点时,
              下一个字母没有对应的 child,路径到此为止。<b>未命中</b>,
              而且整棵树里不可能有以 {w} 开头的词 —— 有的话,它必然长在这条路径上。
            </>
          }
        />,
      );
    } else if (prefixMode) {
      setLit(acc.slice(0, -1));
      setOk([cur!.id]);
      setMsg(
        <T
          en={
            <>
              startsWith(<b>{w}</b>): the whole path exists, so{" "}
              <b>at least one stored word starts with {w}</b>. isEnd is not
              checked here. Arriving is the answer.
            </>
          }
          zh={
            <>
              startsWith(<b>{w}</b>):整条路径都走得通,所以
              <b>至少有一个已存的词以 {w} 开头</b>。这里不检查 isEnd,走到了就算命中。
            </>
          }
        />,
      );
    } else if (cur!.isEnd) {
      setLit(acc.slice(0, -1));
      setOk([cur!.id]);
      setMsg(
        <T
          en={
            <>
              search(<b>{w}</b>): the path exists and the last node has{" "}
              <b>isEnd = true</b>, so {w} is a stored word ✓
            </>
          }
          zh={
            <>
              search(<b>{w}</b>):路径走得通,末节点 <b>isEnd = true</b> —— {w}{" "}
              是一个已存的单词 ✓
            </>
          }
        />,
      );
    } else {
      setLit(acc.slice(0, -1));
      setPre([cur!.id]);
      setMsg(
        <T
          en={
            <>
              search(<b>{w}</b>): the path exists, but the last node has{" "}
              <b>isEnd = false</b>. {w} is only the <b>beginning of other words</b>
              , not a word that was inserted. search returns false here, while
              startsWith returns true. This is the case isEnd exists for.
            </>
          }
          zh={
            <>
              search(<b>{w}</b>):路径走得通,但末节点 <b>isEnd = false</b> —— {w}{" "}
              只是<b>别的词的开头</b>,不是被插入过的单词。所以 search 返回 false,
              而 startsWith 会返回 true。isEnd 就是为这种情况存在的。
            </>
          }
        />,
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
    setMsg(
      <T
        en="Reset to the five starting words: car, card, cat, do, dog."
        zh="已重置为初始 5 个词:car、card、cat、do、dog。"
      />,
    );
  };

  return (
    <div className="viz">
      <div className="tr-lab-title viz-title">
        <T
          en="Trie lab: insert a word and watch the tree grow, or look one up and watch the path light up node by node"
          zh="Trie 实验室 —— 插入单词看树长出来,查询看路径逐节点点亮"
        />
      </div>
      <div className="viz-stage">
        <svg
          viewBox={`0 0 ${LAB_W} ${height}`}
          className="tr-svg"
          role="img"
          aria-label={L({
            en: "Trie structure diagram",
            zh: "前缀树结构图",
          })}
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
          <i className="tr-dot lit" /> <T en="On the path" zh="路径经过" />
        </span>
        <span>
          <i className="tr-dot ok" />{" "}
          <T en="Match (word or prefix)" zh="命中(单词 / 前缀)" />
        </span>
        <span>
          <i className="tr-dot pre" />{" "}
          <T en="Prefix, not a word" zh="是前缀,不是单词" />
        </span>
        <span>
          <i className="tr-dot bad" />{" "}
          <T en="Path stops, no match" zh="断路,未命中" />
        </span>
        <span>
          <i className="tr-dot end" />{" "}
          <T en="isEnd (a word ends here)" zh="isEnd(有词在此结束)" />
        </span>
      </div>
      <div className="viz-ctl">
        <input
          className="tr-input"
          value={input}
          placeholder={L({ en: "word, e.g. care", zh: "输入单词,如 care" })}
          disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") doInsert();
          }}
          aria-label={L({
            en: "Word to insert or look up",
            zh: "输入要插入或查询的单词",
          })}
        />
        <button type="button" className="btn btn-sm btn-primary" onClick={doInsert} disabled={busy}>
          <T en="Insert" zh="插入" />
        </button>
        <button type="button" className="btn btn-sm" onClick={() => doQuery(false)} disabled={busy}>
          <T en="search" zh="查询单词" />
        </button>
        <button type="button" className="btn btn-sm" onClick={() => doQuery(true)} disabled={busy}>
          <T en="startsWith" zh="查询前缀" />
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={doReset} disabled={busy}>
          <T en="Reset" zh="重置" />
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          <T en="nodes" zh="节点" /> {count} / {CAP}
        </span>
      </div>
    </div>
  );
}

/* ================= StaticTrie: static structure diagram ================= */

export function StaticTrie({
  words,
  w = 560,
  caption,
  emphasize,
}: {
  words: string[];
  w?: number;
  caption?: Loc<ReactNode>;
  /** Word-end nodes that need extra highlighting, matched by their complete word */
  emphasize?: string[];
}) {
  const L = useL();
  const { root } = useMemo(() => buildTrie(words), [words]);
  const { nodes, edges, height } = useMemo(() => layout(root, w), [root, w]);
  const emph = new Set(emphasize ?? []);

  return (
    <div className="tr-fig">
      <svg
        viewBox={`0 0 ${w} ${height}`}
        className="tr-svg"
        role="img"
        aria-label={L({
          en: `Trie built from the words ${words.join(", ")}`,
          zh: `由 ${words.join("、")} 建成的前缀树`,
        })}
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
          <TrieNodeG
            key={n.id}
            n={n}
            cls={n.word && emph.has(n.word) ? " ok" : ""}
          />
        ))}
      </svg>
      {caption && <div className="tr-fig-cap">{L(caption)}</div>}
    </div>
  );
}

/* ================= TrieStepper: generic "trie frame" player ================= */

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
  msg: Loc<ReactNode>;
}

export function TrieStepper({
  title,
  nodes,
  edges,
  frames,
  w = 640,
  h = 400,
}: {
  title: Loc<string>;
  nodes: TStepNode[];
  edges: [number, number][];
  frames: TStepFrame[];
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
    if (f.pre?.includes(id)) return " pre";
    if (f.lit?.includes(id)) return " lit";
    if (f.dim?.includes(id)) return " dim";
    return "";
  };

  return (
    <div className="viz">
      <div className="viz-title">{L(title)}</div>
      <div className="viz-stage">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="tr-svg"
          role="img"
          aria-label={L(title)}
        >
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
        {L(f.msg)}
      </div>
      <StepControls stepper={s} step={s.step} total={frames.length} />
    </div>
  );
}
