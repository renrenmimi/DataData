"use client";

// 终章 · 选型决策树 —— 交互式引导:回答几个问题,走到推荐的结构。
// 数据是一棵小决策树;记录走过的路径(面包屑),随时可以重来。

import { useState } from "react";
import Link from "next/link";

interface QNode {
  kind: "q";
  q: string;
  opts: { label: string; next: string }[];
}

interface RNode {
  kind: "r";
  structure: string;
  href: string;
  why: string;
  runnerUp?: string;
}

type Node = QNode | RNode;

const TREE: Record<string, Node> = {
  root: {
    kind: "q",
    q: "这个问题的核心动作,最像下面哪一种?",
    opts: [
      { label: "🔍 快速查找 / 去重 / 计数", next: "lookup" },
      { label: "📋 按某种顺序逐个处理元素", next: "order" },
      { label: "📦 按位置存取一批元素", next: "seq" },
      { label: "🕸 处理元素之间的关系 / 连通", next: "rel" },
      { label: "📊 区间统计(求和 / 最值),数据还会改", next: "range" },
    ],
  },
  lookup: {
    kind: "q",
    q: "查找时需要「有序」吗?(范围查询、第 K 小、前后邻居…)",
    opts: [
      { label: "不需要,只要快", next: "lookup-fast" },
      { label: "需要有序 / 范围查询", next: "r-bst" },
      { label: "查的是「前缀」(补全 / 以 xx 开头)", next: "r-trie" },
    ],
  },
  "lookup-fast": {
    kind: "r",
    structure: "哈希表 Hash Table",
    href: "/hash",
    why: "平均 O(1) 的存取,「见过吗 / 配对 / 分组计数」三大信号全归它。只要不需要顺序,它就是查找之王。",
    runnerUp: "只存「在不在」用 Set;需要淘汰策略(缓存)看第 13 章 LRU。",
  },
  "r-bst": {
    kind: "r",
    structure: "二叉搜索树 / TreeMap",
    href: "/bst",
    why: "有序世界的全能选手:查找 / 插入 / 删除 / 范围查询 / 第 K 小全是 O(log n)。工程里直接用红黑树实现的 TreeMap / TreeSet。",
    runnerUp: "只需要最值(不需要任意排名)?堆更轻(第 9 章)。",
  },
  "r-trie": {
    kind: "r",
    structure: "前缀树 Trie",
    href: "/trie",
    why: "按字符共享路径,insert / search / startsWith 都是 O(词长),与词典大小无关 —— 哈希表答不了的「前缀问题」它包了。",
  },
  order: {
    kind: "q",
    q: "按什么顺序处理?",
    opts: [
      { label: "后来的先处理(撤销、括号、递归)", next: "r-stack" },
      { label: "先来的先处理(排队、BFS、缓冲)", next: "r-queue" },
      { label: "优先级最高的先处理(最值优先)", next: "r-heap" },
      { label: "两端都要进出(滑动窗口最值)", next: "r-deque" },
    ],
  },
  "r-stack": {
    kind: "r",
    structure: "栈 Stack",
    href: "/stack",
    why: "LIFO:最近的最先处理。「配对 / 嵌套 / 最近的更大更小」信号词一出现就想它 —— 单调栈是数组题的大杀器。",
  },
  "r-queue": {
    kind: "r",
    structure: "队列 Queue",
    href: "/queue",
    why: "FIFO:先来先服务。BFS 的御用结构,层层扩散的问题都靠它。",
  },
  "r-heap": {
    kind: "r",
    structure: "堆 / 优先队列 Heap",
    href: "/heap",
    why: "Top-K、第 K 大、合并 K 路、流式中位数 —— 只关心最值时,用 O(log n) 的堆代替 O(n log n) 的全排序。",
  },
  "r-deque": {
    kind: "r",
    structure: "双端队列 Deque(单调队列)",
    href: "/queue",
    why: "两端都能 O(1) 进出;滑动窗口最大值这类「窗口最值」问题,单调队列是唯一的 O(n) 解。",
  },
  seq: {
    kind: "q",
    q: "会频繁在中间插入 / 删除吗?",
    opts: [
      { label: "不会,主要是读和遍历", next: "r-array" },
      { label: "会,而且我已经握着插入点的引用", next: "r-list" },
    ],
  },
  "r-array": {
    kind: "r",
    structure: "数组 Array",
    href: "/array",
    why: "O(1) 随机访问 + 缓存友好,读多写少的首选。有序还送二分查找 O(log n)。",
    runnerUp: "长度不定就用动态数组(ArrayList / list / JS Array),尾部追加均摊 O(1)。",
  },
  "r-list": {
    kind: "r",
    structure: "链表 Linked List",
    href: "/linked-list",
    why: "已知位置时插删 O(1),不需要搬家。LRU 这类「频繁摘除+插头」的场景是它的主场(配合哈希表定位)。",
  },
  rel: {
    kind: "q",
    q: "关于这些「关系」,你要回答什么?",
    opts: [
      { label: "只问「是不是一伙的」,不断合并", next: "r-uf" },
      { label: "要走路径:遍历 / 最短路 / 依赖排序", next: "r-graph" },
      { label: "关系是严格的层级(父子)", next: "r-tree" },
    ],
  },
  "r-uf": {
    kind: "r",
    structure: "并查集 Union-Find",
    href: "/union-find",
    why: "connect + query 两个动作近乎 O(1)(路径压缩+按秩合并)。朋友圈、等式传递、动态连通性,三行模板天下无敌。",
  },
  "r-graph": {
    kind: "r",
    structure: "图 Graph",
    href: "/graph",
    why: "邻接表 + BFS/DFS 是基本功;依赖排序用拓扑排序,带权最短路用 Dijkstra。网格题也是图。",
  },
  "r-tree": {
    kind: "r",
    structure: "二叉树 Binary Tree",
    href: "/binary-tree",
    why: "层级结构的原型。「一棵树的问题 = 根 + 左子树 + 右子树」,递归是它的母语。",
  },
  range: {
    kind: "r",
    structure: "线段树 / 树状数组",
    href: "/advanced",
    why: "「又要改又要查区间」= 前缀和失效的信号。线段树全能,树状数组码短常数小 —— 第 13 章二选一。",
    runnerUp: "数据不改的话,老老实实用前缀和 O(1) 查询就够了。",
  },
};

export function DecisionLab() {
  const [path, setPath] = useState<string[]>(["root"]);
  const cur = TREE[path[path.length - 1]];

  const choose = (next: string, label: string) => {
    void label;
    setPath((p) => [...p, next]);
  };

  return (
    <div className="viz atl-decision">
      <div className="viz-title">选型决策树 —— 拿到题先问自己这些问题</div>

      {path.length > 1 && (
        <div className="atl-crumbs">
          {path.slice(0, -1).map((id, i) => {
            const n = TREE[id];
            return (
              <span key={i} className="atl-crumb">
                {n.kind === "q" ? n.q : ""}
              </span>
            );
          })}
        </div>
      )}

      {cur.kind === "q" ? (
        <>
          <p className="atl-q">{cur.q}</p>
          <div className="atl-opts">
            {cur.opts.map((o) => (
              <button
                key={o.next}
                type="button"
                className="atl-opt"
                onClick={() => choose(o.next, o.label)}
              >
                {o.label}
                <span aria-hidden>→</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="atl-result">
          <div className="atl-result-label">推荐结构</div>
          <div className="atl-result-name">{cur.structure}</div>
          <p className="atl-result-why">{cur.why}</p>
          {cur.runnerUp && (
            <p className="atl-result-runner">💡 {cur.runnerUp}</p>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Link href={cur.href} className="btn btn-sm btn-primary">
              去这一章复习 →
            </Link>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setPath(["root"])}
            >
              ↻ 再走一次
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
            ← 上一问
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setPath(["root"])}
          >
            ↻ 重新开始
          </button>
        </div>
      )}
    </div>
  );
}
