"use client";

// Finale · Selection decision tree — an interactive guide: answer a few questions and
// land on the recommended structure.
// The data is a small decision tree; the path walked is kept as breadcrumbs and can be
// restarted at any time.

import { useState } from "react";
import Link from "next/link";
import { useL, T, type Loc } from "@/lib/i18n";

interface QNode {
  kind: "q";
  q: Loc<string>;
  opts: { label: Loc<string>; next: string }[];
}

interface RNode {
  kind: "r";
  structure: Loc<string>;
  href: string;
  why: Loc<string>;
  runnerUp?: Loc<string>;
}

type Node = QNode | RNode;

const TREE: Record<string, Node> = {
  root: {
    kind: "q",
    q: {
      en: "Which of these is closest to the main action in your problem?",
      zh: "这个问题的核心动作,最像下面哪一种?",
    },
    opts: [
      {
        label: {
          en: "🔍 Fast lookup, removing duplicates, or counting",
          zh: "🔍 快速查找 / 去重 / 计数",
        },
        next: "lookup",
      },
      {
        label: {
          en: "📋 Processing elements one at a time in some order",
          zh: "📋 按某种顺序逐个处理元素",
        },
        next: "order",
      },
      {
        label: {
          en: "📦 Reading and writing a group of elements by position",
          zh: "📦 按位置存取一批元素",
        },
        next: "seq",
      },
      {
        label: {
          en: "🕸 Working with relationships or connectivity between elements",
          zh: "🕸 处理元素之间的关系 / 连通",
        },
        next: "rel",
      },
      {
        label: {
          en: "📊 Range queries (sum or minimum) on data that keeps changing",
          zh: "📊 区间统计(求和 / 最值),数据还会改",
        },
        next: "range",
      },
    ],
  },
  lookup: {
    kind: "q",
    q: {
      en: "Does the lookup need order? (Range queries, k-th smallest, the next larger key, and so on.)",
      zh: "查找时需要「有序」吗?(范围查询、第 K 小、前后邻居…)",
    },
    opts: [
      {
        label: { en: "No, it just has to be fast", zh: "不需要,只要快" },
        next: "lookup-fast",
      },
      {
        label: {
          en: "Yes, I need order or range queries",
          zh: "需要有序 / 范围查询",
        },
        next: "r-bst",
      },
      {
        label: {
          en: "I am looking up a prefix (autocomplete, starts with)",
          zh: "查的是「前缀」(补全 / 以 xx 开头)",
        },
        next: "r-trie",
      },
    ],
  },
  "lookup-fast": {
    kind: "r",
    structure: { en: "Hash Table", zh: "哈希表 Hash Table" },
    href: "/hash",
    why: {
      en: "Reads and writes are O(1) on average. Three common signals point here: have I seen this before, find the matching pair, and count by group. If you do not need order, this is the fastest way to look something up.",
      zh: "平均 O(1) 的存取,「见过吗 / 配对 / 分组计数」三大信号全归它。只要不需要顺序,它就是查找之王。",
    },
    runnerUp: {
      en: "If you only store whether something is present, use a Set. If you also need an eviction policy (a cache), see LRU in chapter 13.",
      zh: "只存「在不在」用 Set;需要淘汰策略(缓存)看第 13 章 LRU。",
    },
  },
  "r-bst": {
    kind: "r",
    structure: { en: "Binary Search Tree / TreeMap", zh: "二叉搜索树 / TreeMap" },
    href: "/bst",
    why: {
      en: "The all-round choice when order matters: search, insert, delete, range query, and k-th smallest are all O(log n). In real code you use TreeMap or TreeSet, which are red-black trees.",
      zh: "有序世界的全能选手:查找 / 插入 / 删除 / 范围查询 / 第 K 小全是 O(log n)。工程里直接用红黑树实现的 TreeMap / TreeSet。",
    },
    runnerUp: {
      en: "If you only need the smallest or largest value and never an arbitrary rank, a heap is lighter (chapter 9).",
      zh: "只需要最值(不需要任意排名)?堆更轻(第 9 章)。",
    },
  },
  "r-trie": {
    kind: "r",
    structure: { en: "Trie (prefix tree)", zh: "前缀树 Trie" },
    href: "/trie",
    why: {
      en: "Words share a path character by character, so insert, search, and startsWith all cost O(length of the word), no matter how many words are stored. This answers the prefix questions a hash table cannot.",
      zh: "按字符共享路径,insert / search / startsWith 都是 O(词长),与词典大小无关 —— 哈希表答不了的「前缀问题」它包了。",
    },
  },
  order: {
    kind: "q",
    q: { en: "In what order do you process them?", zh: "按什么顺序处理?" },
    opts: [
      {
        label: {
          en: "The most recent one first (undo, brackets, recursion)",
          zh: "后来的先处理(撤销、括号、递归)",
        },
        next: "r-stack",
      },
      {
        label: {
          en: "The earliest one first (a waiting line, BFS, a buffer)",
          zh: "先来的先处理(排队、BFS、缓冲)",
        },
        next: "r-queue",
      },
      {
        label: {
          en: "The highest priority first (smallest or largest value first)",
          zh: "优先级最高的先处理(最值优先)",
        },
        next: "r-heap",
      },
      {
        label: {
          en: "From both ends (the maximum inside a sliding window)",
          zh: "两端都要进出(滑动窗口最值)",
        },
        next: "r-deque",
      },
    ],
  },
  "r-stack": {
    kind: "r",
    structure: { en: "Stack", zh: "栈 Stack" },
    href: "/stack",
    why: {
      en: "LIFO: the most recent item is handled first. Think of it as soon as you see matching, nesting, or the nearest larger or smaller element. A monotonic stack solves a whole family of array problems.",
      zh: "LIFO:最近的最先处理。「配对 / 嵌套 / 最近的更大更小」信号词一出现就想它 —— 单调栈是数组题的重要工具。",
    },
  },
  "r-queue": {
    kind: "r",
    structure: { en: "Queue", zh: "队列 Queue" },
    href: "/queue",
    why: {
      en: "FIFO: first in, first served. It is the structure BFS is built on, and it fits any problem that expands one layer at a time.",
      zh: "FIFO:先来先服务。BFS 的御用结构,层层扩散的问题都靠它。",
    },
  },
  "r-heap": {
    kind: "r",
    structure: { en: "Heap / Priority Queue", zh: "堆 / 优先队列 Heap" },
    href: "/heap",
    why: {
      en: "Top-K, the k-th largest, merging k sorted lists, a running median. When you only care about the extreme value, an O(log n) heap replaces an O(n log n) full sort.",
      zh: "Top-K、第 K 大、合并 K 路、流式中位数 —— 只关心最值时,用 O(log n) 的堆代替 O(n log n) 的全排序。",
    },
  },
  "r-deque": {
    kind: "r",
    structure: { en: "Deque (monotonic queue)", zh: "双端队列 Deque(单调队列)" },
    href: "/queue",
    why: {
      en: "Both ends accept O(1) push and pop. For sliding window maximum and similar window problems, a monotonic deque is the only O(n) solution.",
      zh: "两端都能 O(1) 进出;滑动窗口最大值这类「窗口最值」问题,单调队列是唯一的 O(n) 解。",
    },
  },
  seq: {
    kind: "q",
    q: {
      en: "Will you insert or delete in the middle often?",
      zh: "会频繁在中间插入 / 删除吗?",
    },
    opts: [
      {
        label: {
          en: "No, mostly reading and iterating",
          zh: "不会,主要是读和遍历",
        },
        next: "r-array",
      },
      {
        label: {
          en: "Yes, and I already hold a reference to the position",
          zh: "会,而且我已经握着插入点的引用",
        },
        next: "r-list",
      },
    ],
  },
  "r-array": {
    kind: "r",
    structure: { en: "Array", zh: "数组 Array" },
    href: "/array",
    why: {
      en: "O(1) random access and good cache behavior, so it is the first choice when you read much more than you write. If it is sorted, you also get binary search in O(log n).",
      zh: "O(1) 随机访问 + 缓存友好,读多写少的首选。有序还送二分查找 O(log n)。",
    },
    runnerUp: {
      en: "If the length is not fixed, use a dynamic array (ArrayList, Python list, JS Array). Appending at the end is O(1) amortized.",
      zh: "长度不定就用动态数组(ArrayList / list / JS Array),尾部追加均摊 O(1)。",
    },
  },
  "r-list": {
    kind: "r",
    structure: { en: "Linked List", zh: "链表 Linked List" },
    href: "/linked-list",
    why: {
      en: "Insert and delete are O(1) once you hold the node, and nothing has to be shifted. It fits cases that constantly detach a node and move it to the front, such as LRU, where a hash table finds the node for you.",
      zh: "已知位置时插删 O(1),不需要搬家。LRU 这类「频繁摘除+插头」的场景是它的主场(配合哈希表定位)。",
    },
  },
  rel: {
    kind: "q",
    q: {
      en: "What question do you have to answer about those relationships?",
      zh: "关于这些「关系」,你要回答什么?",
    },
    opts: [
      {
        label: {
          en: "Only whether two items are in the same group, with groups merging over time",
          zh: "只问「是不是一伙的」,不断合并",
        },
        next: "r-uf",
      },
      {
        label: {
          en: "I need the path: traversal, shortest path, or dependency order",
          zh: "要走路径:遍历 / 最短路 / 依赖排序",
        },
        next: "r-graph",
      },
      {
        label: {
          en: "The relationship is a strict hierarchy (parent and child)",
          zh: "关系是严格的层级(父子)",
        },
        next: "r-tree",
      },
    ],
  },
  "r-uf": {
    kind: "r",
    structure: { en: "Union-Find", zh: "并查集 Union-Find" },
    href: "/union-find",
    why: {
      en: "Both actions, connect and query, cost close to O(1) with path compression and union by rank. Friend groups, equality propagation, and dynamic connectivity all fit a template of a few lines.",
      zh: "connect + query 两个动作近乎 O(1)(路径压缩+按秩合并)。朋友圈、等式传递、动态连通性,三行模板就能解决。",
    },
  },
  "r-graph": {
    kind: "r",
    structure: { en: "Graph", zh: "图 Graph" },
    href: "/graph",
    why: {
      en: "An adjacency list with BFS and DFS is the base skill. Dependency order uses topological sort, and weighted shortest paths use Dijkstra. A grid problem is a graph problem too.",
      zh: "邻接表 + BFS/DFS 是基本功;依赖排序用拓扑排序,带权最短路用 Dijkstra。网格题也是图。",
    },
  },
  "r-tree": {
    kind: "r",
    structure: { en: "Binary Tree", zh: "二叉树 Binary Tree" },
    href: "/binary-tree",
    why: {
      en: "The basic shape of a hierarchy. A problem about a tree is a problem about the root plus the left subtree plus the right subtree, which is why recursion fits it so well.",
      zh: "层级结构的原型。「一棵树的问题 = 根 + 左子树 + 右子树」,递归是它的母语。",
    },
  },
  range: {
    kind: "r",
    structure: { en: "Segment tree / Fenwick tree", zh: "线段树 / 树状数组" },
    href: "/advanced",
    why: {
      en: "Updates plus range queries is the signal that a prefix sum array is no longer enough. A segment tree handles more cases; a Fenwick tree is shorter and has a smaller constant. Chapter 13 compares them.",
      zh: "「又要改又要查区间」= 前缀和失效的信号。线段树全能,树状数组码短常数小 —— 第 13 章二选一。",
    },
    runnerUp: {
      en: "If the data never changes, a plain prefix sum array with O(1) queries is enough.",
      zh: "数据不改的话,老老实实用前缀和 O(1) 查询就够了。",
    },
  },
};

export function DecisionLab() {
  const L = useL();
  const [path, setPath] = useState<string[]>(["root"]);
  const cur = TREE[path[path.length - 1]];

  const choose = (next: string) => {
    setPath((p) => [...p, next]);
  };

  return (
    <div className="viz atl-decision">
      <div className="viz-title">
        <T
          en="Decision tree: the questions to ask yourself first"
          zh="选型决策树 —— 拿到题先问自己这些问题"
        />
      </div>

      {path.length > 1 && (
        <div className="atl-crumbs">
          {path.slice(0, -1).map((id, i) => {
            const n = TREE[id];
            return (
              <span key={i} className="atl-crumb">
                {n.kind === "q" ? L(n.q) : ""}
              </span>
            );
          })}
        </div>
      )}

      {cur.kind === "q" ? (
        <>
          <p className="atl-q">{L(cur.q)}</p>
          <div className="atl-opts">
            {cur.opts.map((o) => (
              <button
                key={o.next}
                type="button"
                className="atl-opt"
                onClick={() => choose(o.next)}
              >
                {L(o.label)}
                <span aria-hidden>→</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="atl-result">
          <div className="atl-result-label">
            <T en="Recommended structure" zh="推荐结构" />
          </div>
          <div className="atl-result-name">{L(cur.structure)}</div>
          <p className="atl-result-why">{L(cur.why)}</p>
          {cur.runnerUp && (
            <p className="atl-result-runner">💡 {L(cur.runnerUp)}</p>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Link href={cur.href} className="btn btn-sm btn-primary">
              <T en="Go to that chapter →" zh="去这一章复习 →" />
            </Link>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setPath(["root"])}
            >
              <T en="↻ Start over" zh="↻ 再走一次" />
            </button>
          </div>
        </div>
      )}

      {cur.kind === "q" && path.length > 1 && (
        <div className="viz-ctl">
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setPath((p) => p.slice(0, -1))}
          >
            <T en="← Previous question" zh="← 上一问" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setPath(["root"])}
          >
            <T en="↻ Start over" zh="↻ 重新开始" />
          </button>
        </div>
      )}
    </div>
  );
}
