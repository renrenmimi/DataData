// Curriculum registry — the one and only chapter list for the site.
// The sidebar, command palette, chapter footer (prev/next) and progress system
// all read from here.
// To add a chapter: insert an entry in CHAPTERS and make sure app/<id>/page.tsx
// exists.
//
// Bilingual: title / en / essence / tags are all Loc<string>, resolved by
// consumers via useL().
// Keep this a pure data module (no "use client") so server and client can both
// import it.

import type { Loc } from "@/lib/i18n";

export type ChapterId =
  | "home"
  | "array"
  | "string"
  | "linked-list"
  | "stack"
  | "queue"
  | "hash"
  | "binary-tree"
  | "bst"
  | "heap"
  | "trie"
  | "union-find"
  | "graph"
  | "advanced"
  | "atlas";

export interface Chapter {
  id: ChapterId;
  href: string;
  /** Displayed chapter number: 00–13, ✦ for the finale */
  num: string;
  title: Loc<string>;
  /** English subtitle — hero kicker and sidebar caption */
  en: Loc<string>;
  /** One-line essence */
  essence: Loc<string>;
  /** oklch hue angle; sets the theme hue for the whole chapter */
  hue: number;
  /** Difficulty 1–5, shown on the world map and in the sidebar */
  level: 1 | 2 | 3 | 4 | 5;
  /** LeetCode frequency 1–5 (5 = extremely common) */
  freq: 1 | 2 | 3 | 4 | 5;
  /** Checkable problems in this chapter (part of the progress denominator) — set by each chapter's lib data; listed here for indexing only */
  tags: Loc<string>[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: "home",
    href: "/",
    num: "00",
    title: { en: "Start here", zh: "序章 · 世界地图" },
    en: "The Atlas & Big-O",
    essence: {
      en: "Every data structure is one move in a trade between time and space.",
      zh: "所有数据结构,都是「时间换空间」棋局里的一步棋。",
    },
    hue: 292,
    level: 1,
    freq: 5,
    tags: [
      { en: "Complexity", zh: "复杂度" },
      "Big-O",
      { en: "Memory model", zh: "内存模型" },
    ],
  },
  {
    id: "array",
    href: "/array",
    num: "01",
    title: { en: "Array", zh: "数组" },
    en: "Array",
    essence: {
      en: "A row of numbered slots stored side by side in memory.",
      zh: "一排连续的房间,门牌号就是下标。",
    },
    hue: 196,
    level: 1,
    freq: 5,
    tags: [
      { en: "Two pointers", zh: "双指针" },
      { en: "Sliding window", zh: "滑动窗口" },
      { en: "Binary search", zh: "二分查找" },
      { en: "Matrix", zh: "矩阵" },
    ],
  },
  {
    id: "string",
    href: "/string",
    num: "02",
    title: { en: "String", zh: "字符串" },
    en: "String",
    essence: {
      en: "An array of characters you cannot edit. Changing one character builds a new string.",
      zh: "一个不许改字的数组,改一个字就要重抄全文。",
    },
    hue: 82,
    level: 1,
    freq: 5,
    tags: [
      { en: "Immutability", zh: "不可变性" },
      { en: "Palindrome", zh: "回文" },
      { en: "Substring", zh: "子串" },
    ],
  },
  {
    id: "linked-list",
    href: "/linked-list",
    num: "03",
    title: { en: "Linked List", zh: "链表" },
    en: "Linked List",
    essence: {
      en: "Each node holds one value and the address of the next node.",
      zh: "一场寻宝游戏:每个节点只告诉你下一站在哪。",
    },
    hue: 350,
    level: 2,
    freq: 5,
    tags: [
      { en: "Fast and slow pointers", zh: "快慢指针" },
      { en: "Dummy node", zh: "哑结点" },
      { en: "Reversal", zh: "反转" },
    ],
  },
  {
    id: "stack",
    href: "/stack",
    num: "04",
    title: { en: "Stack", zh: "栈" },
    en: "Stack",
    essence: {
      en: "A pile of plates: the last one you put on is the first one you take off.",
      zh: "一摞盘子:后放上去的,先被拿走。",
    },
    hue: 128,
    level: 2,
    freq: 5,
    tags: [
      "LIFO",
      { en: "Bracket matching", zh: "括号匹配" },
      { en: "Monotonic stack", zh: "单调栈" },
    ],
  },
  {
    id: "queue",
    href: "/queue",
    num: "05",
    title: { en: "Queue & Deque", zh: "队列与双端队列" },
    en: "Queue & Deque",
    essence: {
      en: "A line at a shop: whoever arrives first is served first.",
      zh: "排队买奶茶:先来的先喝到。",
    },
    hue: 230,
    level: 2,
    freq: 4,
    tags: [
      "FIFO",
      { en: "Circular queue", zh: "循环队列" },
      { en: "Monotonic queue", zh: "单调队列" },
    ],
  },
  {
    id: "hash",
    href: "/hash",
    num: "06",
    title: { en: "Hash Table", zh: "哈希表" },
    en: "Hash Table",
    essence: {
      en: "A key is turned into a position, so a lookup does not have to check every item.",
      zh: "拿钥匙直接开门,不用一间间敲。",
    },
    hue: 292,
    level: 3,
    freq: 5,
    tags: [
      { en: "Hash function", zh: "哈希函数" },
      { en: "Collision", zh: "冲突" },
      { en: "O(1) lookup", zh: "O(1) 查找" },
    ],
  },
  {
    id: "binary-tree",
    href: "/binary-tree",
    num: "07",
    title: { en: "Binary Tree", zh: "二叉树" },
    en: "Binary Tree",
    essence: {
      en: "A linked list that branches. This is where recursion starts to pay off.",
      zh: "一个会分叉的链表;递归在这里第一次真正发光。",
    },
    hue: 152,
    level: 3,
    freq: 5,
    tags: ["DFS", "BFS", { en: "Recursion", zh: "递归" }],
  },
  {
    id: "bst",
    href: "/bst",
    num: "08",
    title: { en: "Binary Search Tree", zh: "二叉搜索树" },
    en: "BST",
    essence: {
      en: "One rule (smaller on the left, larger on the right) turns a tree into a sorted dictionary.",
      zh: "左小右大立下的规矩,让整棵树变成一部字典。",
    },
    hue: 178,
    level: 3,
    freq: 4,
    tags: [
      { en: "Ordering", zh: "有序性" },
      { en: "In-order traversal", zh: "中序遍历" },
      { en: "Balance", zh: "平衡" },
    ],
  },
  {
    id: "heap",
    href: "/heap",
    num: "09",
    title: { en: "Heap & Priority Queue", zh: "堆与优先队列" },
    en: "Heap",
    essence: {
      en: "It promises one thing only: the top is always the smallest or the largest value.",
      zh: "只承诺一件事:堆顶永远是最值。",
    },
    hue: 55,
    level: 3,
    freq: 5,
    tags: [
      "Top-K",
      { en: "Complete binary tree", zh: "完全二叉树" },
      { en: "Sift", zh: "sift" },
    ],
  },
  {
    id: "trie",
    href: "/trie",
    num: "10",
    title: { en: "Trie", zh: "前缀树" },
    en: "Trie",
    essence: {
      en: "Words share their common beginnings, so each prefix is stored only once.",
      zh: "把一万个单词叠成一棵树,共享每一段相同的开头。",
    },
    hue: 330,
    level: 4,
    freq: 3,
    tags: [
      { en: "Prefix matching", zh: "前缀匹配" },
      { en: "Autocomplete", zh: "自动补全" },
      { en: "Prefix tree", zh: "字典树" },
    ],
  },
  {
    id: "union-find",
    href: "/union-find",
    num: "11",
    title: { en: "Union-Find", zh: "并查集" },
    en: "Union-Find",
    essence: {
      en: "Two questions, a few lines of code: are these two in the same group, and merge two groups.",
      zh: "两个问题、三行代码:你们是一伙的吗?合并!",
    },
    hue: 100,
    level: 4,
    freq: 3,
    tags: [
      { en: "Connectivity", zh: "连通性" },
      { en: "Path compression", zh: "路径压缩" },
      { en: "Union by rank", zh: "按秩合并" },
    ],
  },
  {
    id: "graph",
    href: "/graph",
    num: "12",
    title: { en: "Graph", zh: "图" },
    en: "Graph",
    essence: {
      en: "Things become nodes and relationships become edges. Every other structure is a special case of this one.",
      zh: "万物皆点,关系皆边 —— 数据结构的终极形态。",
    },
    hue: 255,
    level: 4,
    freq: 4,
    tags: [
      "BFS/DFS",
      { en: "Topological sort", zh: "拓扑排序" },
      { en: "Adjacency list", zh: "邻接表" },
    ],
  },
  {
    id: "advanced",
    href: "/advanced",
    num: "13",
    title: { en: "Composite & Beyond", zh: "组合与进阶" },
    en: "Composite & Beyond",
    essence: {
      en: "Combine the basic structures to build one that does something none of them can do alone.",
      zh: "真正的高手,把基础结构拼成新的机器。",
    },
    hue: 22,
    level: 5,
    freq: 4,
    tags: [
      "LRU",
      { en: "Segment tree", zh: "线段树" },
      { en: "Fenwick tree", zh: "树状数组" },
      { en: "Skip list", zh: "跳表" },
    ],
  },
  {
    id: "atlas",
    href: "/atlas",
    num: "✦",
    title: { en: "Decision Atlas", zh: "终章 · 选型地图" },
    en: "Decision Atlas",
    essence: {
      en: "The moment you finish reading a problem, which structure should come to mind first?",
      zh: "看到题目的那一刻,你脑子里应该亮起哪盏灯?",
    },
    hue: 292,
    level: 5,
    freq: 5,
    tags: [
      { en: "Choosing a structure", zh: "选型决策" },
      { en: "Problem index", zh: "高频题总表" },
      { en: "Review", zh: "复习" },
    ],
  },
];

export function chapterByPath(path: string): Chapter {
  if (path === "/") return CHAPTERS[0];
  const hit = CHAPTERS.find(
    (c) => c.href !== "/" && (path === c.href || path.startsWith(c.href + "/")),
  );
  return hit ?? CHAPTERS[0];
}

export function prevNext(id: ChapterId): { prev?: Chapter; next?: Chapter } {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return {
    prev: i > 0 ? CHAPTERS[i - 1] : undefined,
    next: i >= 0 && i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : undefined,
  };
}

/** English subtitle for the sidebar / command palette / map cards: skip it when the title already contains it. */
export function subLabel(title: string, en: string): string | null {
  return title.includes(en) ? null : en;
}

/** Search corpus for the command palette: both languages go in, so a keyword in either one matches. */
export function searchCorpus(c: Chapter): string {
  const flat = (v: Loc<string>): string[] =>
    typeof v === "string" ? [v] : [v.en, v.zh];
  return [...flat(c.title), ...flat(c.en), c.num, ...c.tags.flatMap(flat)]
    .join(" ")
    .toLowerCase();
}
