"use client";

// Finale · Selection atlas — where the whole course comes together:
// ① interactive decision tree (what to ask when a problem lands); ② signal phrase →
//    structure table; ③ the master complexity table; ④ the combined problem set (every
//    chapter's PROBLEMS, progress shared site-wide); ⑤ what to learn next; ⑥ the final quiz.

import Link from "next/link";
import "./chapter.css";
import {
  Hero,
  Section,
  Callout,
  BigO,
  KeyPoints,
  ChapterFooter,
  Reveal,
} from "@/lib/kit";
import { Quiz, type QuizItem } from "@/lib/quiz";
import { ProblemSet, type Problem } from "@/lib/problems";
import { useProgress } from "@/lib/progress";
import { CHAPTERS, type ChapterId } from "@/lib/curriculum";
import { useL, T, type Loc } from "@/lib/i18n";
import { DecisionLab } from "./viz";

import { PROBLEMS as P_ARRAY } from "@/lib/array-data";
import { PROBLEMS as P_STRING } from "@/lib/string-data";
import { PROBLEMS as P_LIST } from "@/lib/linked-list-data";
import { PROBLEMS as P_STACK } from "@/lib/stack-data";
import { PROBLEMS as P_QUEUE } from "@/lib/queue-data";
import { PROBLEMS as P_HASH } from "@/lib/hash-data";
import { PROBLEMS as P_BTREE } from "@/lib/binary-tree-data";
import { PROBLEMS as P_BST } from "@/lib/bst-data";
import { PROBLEMS as P_HEAP } from "@/lib/heap-data";
import { PROBLEMS as P_TRIE } from "@/lib/trie-data";
import { PROBLEMS as P_UF } from "@/lib/union-find-data";
import { PROBLEMS as P_GRAPH } from "@/lib/graph-data";
import { PROBLEMS as P_ADV } from "@/lib/advanced-data";

/* ---------- Course-wide problem set groups ---------- */

const GROUPS: { ch: ChapterId; problems: Problem[] }[] = [
  { ch: "array", problems: P_ARRAY },
  { ch: "string", problems: P_STRING },
  { ch: "linked-list", problems: P_LIST },
  { ch: "stack", problems: P_STACK },
  { ch: "queue", problems: P_QUEUE },
  { ch: "hash", problems: P_HASH },
  { ch: "binary-tree", problems: P_BTREE },
  { ch: "bst", problems: P_BST },
  { ch: "heap", problems: P_HEAP },
  { ch: "trie", problems: P_TRIE },
  { ch: "union-find", problems: P_UF },
  { ch: "graph", problems: P_GRAPH },
  { ch: "advanced", problems: P_ADV },
];

const TOTAL = GROUPS.reduce((s, g) => s + g.problems.length, 0);

/* ---------- Signal phrase → structure ---------- */

const SIGNALS: {
  signal: Loc<string>;
  struct: Loc<string>;
  href: string;
  why: Loc<string>;
}[] = [
  {
    signal: {
      en: "“Have I seen it”, “remove duplicates”, “how many times”",
      zh: "「见过吗 / 去重 / 出现次数」",
    },
    struct: { en: "Hash table · Set", zh: "哈希表 · Set" },
    href: "/hash",
    why: {
      en: "O(1) reads and writes. The standard way to spend memory to save time.",
      zh: "O(1) 存取,用空间换时间的标准动作",
    },
  },
  {
    signal: {
      en: "“Two sum”, “find the pair”, “the complement”",
      zh: "「两数之和 / 配对 / 补数」",
    },
    struct: { en: "Hash table", zh: "哈希表" },
    href: "/hash",
    why: {
      en: "Scan once and ask at each step whether the other half you need has already appeared.",
      zh: "一边扫一边查「我需要的另一半来过吗」",
    },
  },
  {
    signal: {
      en: "“Top-K”, “k-th largest”, “extremes in a stream”",
      zh: "「Top-K / 第 K 大 / 最值流」",
    },
    struct: { en: "Heap", zh: "堆" },
    href: "/heap",
    why: {
      en: "Do not sort everything if you only need the extremes. For the k largest, a min-heap of size k acts as the threshold.",
      zh: "只关心最值就别全排序,K 大用小根堆当门槛",
    },
  },
  {
    signal: {
      en: "“Brackets”, “nesting”, “undo”, “the nearest one”",
      zh: "「括号 / 嵌套 / 撤销 / 最近的」",
    },
    struct: { en: "Stack", zh: "栈" },
    href: "/stack",
    why: {
      en: "Handling the most recent item first is exactly LIFO.",
      zh: "最近的先处理 = LIFO",
    },
  },
  {
    signal: {
      en: "“Next greater element”, “next smaller element”",
      zh: "「下一个更大 / 更小元素」",
    },
    struct: { en: "Monotonic stack", zh: "单调栈" },
    href: "/stack",
    why: {
      en: "The moment a new element pops an old one, the answer for the popped element is known.",
      zh: "被新元素弹掉的那一刻,答案就诞生了",
    },
  },
  {
    signal: {
      en: "“Maximum or minimum inside a sliding window”",
      zh: "「滑动窗口的最大 / 最小值」",
    },
    struct: { en: "Monotonic deque", zh: "单调队列" },
    href: "/queue",
    why: {
      en: "Both ends change, and this is the only O(n) solution for the extreme value in a window.",
      zh: "两端都要动,窗口最值的唯一 O(n) 解",
    },
  },
  {
    signal: {
      en: "“Contiguous subarray”, “substring”",
      zh: "「连续子数组 / 子串」",
    },
    struct: { en: "Sliding window / prefix sum", zh: "滑动窗口 / 前缀和" },
    href: "/array",
    why: {
      en: "Keep a quantity inside the window that can be updated step by step. If a sum is involved, add a prefix sum array.",
      zh: "窗口内维护可增量更新的量;涉及和就上前缀和",
    },
  },
  {
    signal: { en: "“Find x in a sorted array”", zh: "「有序数组里找 xx」" },
    struct: { en: "Binary search", zh: "二分查找" },
    href: "/array",
    why: {
      en: "Sorted plus random access means every step removes half of what is left.",
      zh: "有序 + 随机访问 = 每步砍一半",
    },
  },
  {
    signal: {
      en: "“Remove in place”, “move elements”",
      zh: "「原地删除 / 移动元素」",
    },
    struct: { en: "Two pointers", zh: "双指针" },
    href: "/array",
    why: {
      en: "Separate reading from writing. Everything left of slow is already arranged.",
      zh: "读写分离,slow 左边是已整理区",
    },
  },
  {
    signal: {
      en: "“The k-th node”, “a cycle”, “the middle node”",
      zh: "「第 k 个节点 / 环 / 中点」",
    },
    struct: { en: "Fast and slow pointers", zh: "链表快慢指针" },
    href: "/linked-list",
    why: {
      en: "The gap in steps, or the difference in speed, is the answer.",
      zh: "步差和速差就是答案",
    },
  },
  {
    signal: {
      en: "“Prefix”, “autocomplete”, “starts with x”",
      zh: "「前缀 / 自动补全 / 以 xx 开头」",
    },
    struct: "Trie",
    href: "/trie",
    why: {
      en: "A hash table cannot answer prefix questions. A trie shares prefixes along a path.",
      zh: "哈希答不了前缀,Trie 按路径共享前缀",
    },
  },
  {
    signal: {
      en: "“Friend circles”, “merge islands”, “connected components”",
      zh: "「朋友圈 / 岛屿合并 / 连通分量」",
    },
    struct: { en: "Union-Find", zh: "并查集" },
    href: "/union-find",
    why: {
      en: "You need the group, not the path. Merge and query both cost close to O(1).",
      zh: "只问分组不问路径,near-O(1) 合并查询",
    },
  },
  {
    signal: {
      en: "“Prerequisites”, “dependencies”, “build order”",
      zh: "「先修课 / 依赖 / 编译顺序」",
    },
    struct: { en: "Topological sort", zh: "拓扑排序" },
    href: "/graph",
    why: {
      en: "On a directed acyclic graph, repeatedly take the nodes whose in-degree is 0.",
      zh: "DAG 上按入度剥洋葱",
    },
  },
  {
    signal: {
      en: "“Shortest path”, “fewest steps”",
      zh: "「最短路径 / 最少步数」",
    },
    struct: { en: "BFS / Dijkstra", zh: "BFS / Dijkstra" },
    href: "/graph",
    why: {
      en: "On an unweighted graph, BFS finds the shortest path by construction. With weights, use Dijkstra.",
      zh: "无权 BFS 天生最短;带权交给 Dijkstra",
    },
  },
  {
    signal: {
      en: "“Range query plus sorted traversal”",
      zh: "「范围查询 + 有序遍历」",
    },
    struct: { en: "BST / TreeMap", zh: "BST / TreeMap" },
    href: "/bst",
    why: {
      en: "A red-black tree gives every operation in O(log n), and an in-order walk is already sorted.",
      zh: "红黑树 O(log n) 全套操作,中序即有序",
    },
  },
  {
    signal: {
      en: "“Range sum or minimum, and the data still changes”",
      zh: "「区间和 / 最值,还要改」",
    },
    struct: { en: "Segment tree / Fenwick tree", zh: "线段树 / BIT" },
    href: "/advanced",
    why: {
      en: "A prefix sum array breaks down under updates. A divide-and-conquer tree handles both sides.",
      zh: "前缀和怕修改,分治树两头兼顾",
    },
  },
  {
    signal: {
      en: "“Cache eviction”, “least recently used”",
      zh: "「缓存淘汰 / 最近使用」",
    },
    struct: {
      en: "LRU: hash table + doubly linked list",
      zh: "LRU:哈希+双向链表",
    },
    href: "/advanced",
    why: {
      en: "The hash table finds the node and the list keeps the order of use. Two O(1) structures make one.",
      zh: "哈希定位 + 链表排新旧,两个 O(1) 拼出来",
    },
  },
];

/* ---------- Final quiz ---------- */

const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "You have to check whether the brackets in a code editor are matched, with nesting allowed. Which structure fits?",
      zh: "校验代码编辑器里的括号是否配对(可能多层嵌套),选什么结构?",
    },
    opts: [
      { en: "Stack", zh: "栈" },
      { en: "Queue", zh: "队列" },
      { en: "Hash table", zh: "哈希表" },
      { en: "Binary search tree", zh: "二叉搜索树" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A queue handles the earliest item first, but a closing bracket must match the most recent opening bracket. That is the opposite order.",
        zh: "队列是先来先处理 —— 但括号要匹配的是「最近的那个左括号」,顺序正好相反。",
      },
      {
        en: "A hash table can check that the counts are equal, but not the order. It would accept )( as valid.",
        zh: "哈希能数出左右括号数量相等,但数不出顺序:)( 也会被它放过。",
      },
      {
        en: "There is no ordered lookup here. A BST is both heavier and wrong for the job.",
        zh: "这里没有「有序查找」的需求,用它既重又答不对。",
      },
    ],
    why: {
      en: "The most recently opened bracket must close first, which is LIFO. This is the defining use of a stack (LC 20).",
      zh: "「最近打开的最先闭合」= LIFO,栈的定义级应用(LC 20)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "A support system must always serve the user who has been waiting the longest. What do you choose?",
      zh: "客服系统要求:永远先服务等待时间最长的用户。选什么?",
    },
    opts: [
      { en: "Queue", zh: "队列" },
      { en: "Stack", zh: "栈" },
      {
        en: "An array, scanned each time to find the earliest",
        zh: "数组 + 每次遍历找最早",
      },
      { en: "Hash table", zh: "哈希表" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A stack would serve the newest arrival first, so the users who waited longest would never be served.",
        zh: "栈会先服务最新来的 —— 等最久的老用户永远排不上。",
      },
      {
        en: "That works but costs O(n) every time. Dequeuing from a queue is O(1), which is exactly why the queue exists.",
        zh: "能做但每次 O(n);队列出队 O(1),这正是它存在的意义。",
      },
      {
        en: "A hash table has no notion of order at all.",
        zh: "哈希表没有任何顺序概念。",
      },
    ],
    why: {
      en: "First come, first served is FIFO, which is a queue. If the rule changes to “VIPs first”, it becomes a priority queue (a heap).",
      zh: "先来先服务 = FIFO = 队列。若改成「VIP 优先」,才升级成优先队列(堆)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "A live game leaderboard shows only the top 100, and player scores keep streaming in. What do you choose?",
      zh: "实时游戏排行榜,只展示前 100 名,玩家分数不断刷新流入。选什么?",
    },
    opts: [
      { en: "A min-heap of capacity 100", zh: "容量 100 的小根堆" },
      { en: "Sorting everything each time", zh: "每次全量排序" },
      { en: "Stack", zh: "栈" },
      { en: "Union-Find", zh: "并查集" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Sorting is O(n log n) each time, and you only care about 100 places. A heap brings it down to O(log 100) per score.",
        zh: "每次 O(n log n) 排序,而你只关心 100 个名额 —— 堆把它压到 O(log 100)。",
      },
      {
        en: "A stack tracks the most recent item, not the largest.",
        zh: "栈只管最近,不管最大。",
      },
      {
        en: "Union-Find handles connected groups and has nothing to do with ranking.",
        zh: "并查集处理连通分组,和排名无关。",
      },
    ],
    why: {
      en: "The standard Top-K solution: a min-heap acts as the threshold. Its top is the 100th place, and a new score enters only if it is higher, at O(log K).",
      zh: "Top-K 标准解:小根堆当门槛,堆顶是第 100 名,新分数比它高才进堆(O(log K))。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In a social app, people keep adding each other as friends, and you must answer instantly whether A and B are in the same friend group. What do you choose?",
      zh: "社交产品:不断有人互加好友,同时要秒答「A 和 B 是否在同一朋友圈」。选什么?",
    },
    opts: [
      { en: "Union-Find", zh: "并查集" },
      { en: "A BFS traversal per question", zh: "每次 BFS 遍历" },
      { en: "A hash table of friend pairs", zh: "哈希表存好友对" },
      { en: "Binary tree", zh: "二叉树" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "One traversal per question costs O(V+E). Union-Find brings both merging and querying down to nearly O(1).",
        zh: "每问一次遍历一次 O(V+E);并查集把合并与查询都压到近乎 O(1)。",
      },
      {
        en: "A hash table only answers direct friendship. It cannot answer “a friend of a friend of a friend”.",
        zh: "哈希只能查「直接好友」,答不了「朋友的朋友的朋友」。",
      },
      {
        en: "Friendship is not a hierarchy.",
        zh: "朋友关系不是层级结构。",
      },
    ],
    why: {
      en: "Merging groups as you go plus connectivity queries is the defining case for Union-Find (with path compression and union by rank).",
      zh: "动态合并 + 连通性查询 = 并查集的定义级场景(路径压缩 + 按秩合并)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Typing “app” in a search box must immediately suggest apple, application, and so on. What do you choose?",
      zh: "搜索框输入「app」要立刻提示 apple、application…选什么?",
    },
    opts: [
      { en: "Trie (prefix tree)", zh: "前缀树 Trie" },
      { en: "Hash table", zh: "哈希表" },
      { en: "Sorted array + binary search", zh: "有序数组 + 二分" },
      { en: "Heap", zh: "堆" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A hash table looks up a whole word in O(1), but “every word starting with app” forces a full scan.",
        zh: "哈希表查整词 O(1),但「所有以 app 开头的词」它只能全表扫描。",
      },
      {
        en: "That works (binary search to the first word ≥ app, then read forward), but inserting a new word is O(n). A trie inserts and searches in O(length of the word).",
        zh: "能做(二分到第一个 ≥ app 的词再顺序收集),但插入新词是 O(n);Trie 插入查询都是 O(词长)。",
      },
      {
        en: "A heap only tracks extreme values and knows nothing about prefixes.",
        zh: "堆只关心最值,和前缀无关。",
      },
    ],
    why: {
      en: "The word “prefix” points straight to a trie: walk a → p → p, and everything in that subtree is an answer.",
      zh: "「前缀」两个字点名 Trie:沿 a→p→p 走三步,子树里全是答案。",
    },
  },
  {
    type: "choice",
    q: {
      en: "A trading system writes a large stream of trade prices and must also report the total volume in any time range at any moment. What do you choose?",
      zh: "股票系统:海量成交价不断写入,同时要随时查「任意时间区间的成交量总和」。选什么?",
    },
    opts: [
      { en: "Segment tree / Fenwick tree", zh: "线段树 / 树状数组" },
      { en: "Prefix sum array", zh: "前缀和数组" },
      { en: "Hash table", zh: "哈希表" },
      { en: "Sorted array", zh: "排序数组" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A prefix sum answers a query in O(1), but every write rebuilds the array from that point on. Frequent updates are exactly its weak point.",
        zh: "前缀和查询 O(1) 很好用,但每次写入要重建整条前缀 —— 「还要改」就是它的弱点。",
      },
      {
        en: "A hash table is not built for ranges. It does not even know which keys are adjacent.",
        zh: "哈希表不擅长「区间」:它连相邻都不知道。",
      },
      {
        en: "Inserting into a sorted array is O(n), and the range sum still has to be computed on the spot.",
        zh: "排序数组插入 O(n),区间和还是要现算。",
      },
    ],
    why: {
      en: "Updates plus range statistics means a segment tree or a Fenwick tree. Both are O(log n) to update and O(log n) to query.",
      zh: "改 + 区间统计 = 线段树 / BIT:两者都是 O(log n) 改、O(log n) 查。",
    },
  },
  {
    type: "choice",
    q: {
      en: "A course system must produce a valid order to take courses, where courses have prerequisites. What do you use?",
      zh: "选课系统要给出一个合法的修课顺序(课程有先修依赖),用什么?",
    },
    opts: [
      {
        en: "Topological sort (graph + in-degree)",
        zh: "拓扑排序(图 + 入度)",
      },
      { en: "Sorting by course number", zh: "按课程号排序" },
      { en: "A DFS in any order", zh: "DFS 随便走" },
      { en: "Union-Find", zh: "并查集" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Course numbers say nothing about dependencies. Prerequisites form a directed graph.",
        zh: "课程号和依赖无关 —— 先修关系是一张有向图。",
      },
      {
        en: "Without tracking in-degree you may take a course before its prerequisite. Topological sort guarantees every prerequisite comes first.",
        zh: "不记录入度的乱走可能先修没上就选了后续课;拓扑排序保证每门课的前置都已完成。",
      },
      {
        en: "Union-Find has no direction, so it cannot answer which one comes first.",
        zh: "并查集不分方向,「谁先谁后」它答不了。",
      },
    ],
    why: {
      en: "Ordering by dependency is topological sort on a DAG (Kahn's in-degree method), and it detects circular dependencies at the same time (LC 207/210).",
      zh: "依赖排序 = DAG 上的拓扑排序(Kahn 入度法),还能顺便检测循环依赖(LC 207/210)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "A grading system inserts new scores often and must also list the students who scored between 80 and 90. What do you choose?",
      zh: "成绩系统:频繁插入新成绩,还要查「80 到 90 分之间有哪些学生」。选什么?",
    },
    opts: [
      { en: "TreeMap (red-black tree)", zh: "TreeMap(红黑树)" },
      { en: "HashMap", zh: "HashMap" },
      { en: "An array, re-sorted each time", zh: "数组每次排序" },
      { en: "Stack", zh: "栈" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A HashMap finds one key in O(1), but it cannot do ranges. Hashing destroys the order of the keys.",
        zh: "HashMap 查单个 key O(1),但「范围」它无能为力 —— 哈希把顺序打得粉碎。",
      },
      {
        en: "Re-sorting is O(n log n) each time, while a TreeMap inserts in O(log n) and is always sorted.",
        zh: "每次排序 O(n log n),TreeMap 插入 O(log n) 且天生有序。",
      },
      {
        en: "A stack cannot answer queries like this.",
        zh: "栈与查询无缘。",
      },
    ],
    why: {
      en: "Order plus range queries means the BST family (TreeMap and TreeSet in practice): subMap, ceiling, and floor are all O(log n).",
      zh: "有序 + 范围查询 = BST 家族(工程用 TreeMap/TreeSet):subMap/ceiling/floor 全是 O(log n)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "A browser caches at most 50 pages and evicts the one that has not been used for the longest time. What is the best combination?",
      zh: "实现「浏览器最多缓存 50 个页面,满了淘汰最久没访问的」,最优组合是?",
    },
    opts: [
      {
        en: "Hash table + doubly linked list",
        zh: "哈希表 + 双向链表",
      },
      {
        en: "A hash table only, with a timestamp per page",
        zh: "只用哈希表,再记录每页的访问时间戳",
      },
      {
        en: "An array only, sorted by access time",
        zh: "只用数组,按访问时间排序",
      },
      { en: "Queue", zh: "队列" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Finding the least recently used page means scanning the whole table, O(n). A timestamp records the time but does not order the entries.",
        zh: "找「最久未访问」要扫全表 O(n) —— 时间戳能记录但不能排序。",
      },
      {
        en: "Re-sorting on every access is O(n log n), which is too expensive.",
        zh: "每次访问都要重排 O(n log n),太贵。",
      },
      {
        en: "A queue evicts the oldest arrival (FIFO), not the least recently used (LRU). An old page that was just visited should stay.",
        zh: "队列淘汰的是「最早进入」(FIFO),不是「最久未使用」(LRU)—— 访问过的老页面应该续命。",
      },
    ],
    why: {
      en: "LRU = a hash table (O(1) to find the node) plus a doubly linked list (O(1) to detach it and move it to the front). This is LC 146, implemented in chapter 13.",
      zh: "LRU = 哈希(O(1) 定位)+ 双向链表(O(1) 摘除搬头):第 13 章手写过的 LC 146。",
    },
  },
  {
    type: "choice",
    q: {
      en: "For the fewest steps through an unweighted maze, do you use BFS or DFS, and why?",
      zh: "无权迷宫求「最少步数」路径,该用 BFS 还是 DFS?为什么?",
    },
    opts: [
      {
        en: "BFS. It expands layer by layer, so the layer at which it first reaches the exit is the shortest distance.",
        zh: "BFS —— 按层扩散,第一次到达终点时走过的层数就是最短距离",
      },
      {
        en: "DFS. Following one path to the end is faster.",
        zh: "DFS —— 一条路走到黑更快",
      },
      {
        en: "It makes no difference, both traverse everything.",
        zh: "都一样,反正都能遍历完",
      },
      {
        en: "Dijkstra. It is the only algorithm for shortest paths.",
        zh: "Dijkstra —— 最短路只能用它",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "The first path DFS finds to the exit may be a long detour. It would have to explore every path before it could confirm the shortest one.",
        zh: "DFS 第一次到达终点的路径可能绕了远路,要遍历完所有路径才能确认最短。",
      },
      {
        en: "Both can reach the exit, but only BFS guarantees that the first arrival is the shortest. That difference is the whole point of choosing a structure.",
        zh: "都能「到达」,但只有 BFS 保证「首达即最短」—— 这就是选型的意义。",
      },
      {
        en: "Dijkstra is for weighted graphs. On an unweighted graph, BFS is the special case of it, and it is simpler and faster.",
        zh: "Dijkstra 是带权图的方案;无权图 BFS 就是它的特例,更简单更快。",
      },
    ],
    why: {
      en: "BFS visits nodes in order of distance, so the first time it reaches the exit that distance is the shortest, as long as the edges are unweighted. With weights, use Dijkstra.",
      zh: "BFS 按距离分层,第一次碰到终点必然是最短(无权前提)。带权才升级 Dijkstra。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these statements are correct? (Select all that apply. This one covers the whole course.)",
      zh: "以下哪些说法是对的?(多选,全书大串讲)",
    },
    opts: [
      {
        en: "Arrays, hash table buckets, and heap storage all rely on the formula base address + offset.",
        zh: "数组、哈希表的桶、堆的存储,底层都靠「首地址 + 偏移」这条公式",
      },
      {
        en: "The nodes of linked lists, trees, and graphs are joined by references.",
        zh: "链表、树、图的节点都是靠引用(纸条)连起来的",
      },
      {
        en: "A hash table is O(1) on average only if the hash function spreads keys evenly and the load factor stays under control.",
        zh: "哈希表平均 O(1) 的前提是哈希函数均匀 + 负载因子受控",
      },
      {
        en: "Among all the structures, there is always one that is best for everything.",
        zh: "所有结构里,总有一个「万能最优」的选择",
      },
    ],
    correct: [0, 1, 2],
    missHint: {
      en: "The first three are the formula from chapter 00, references, and the conditions behind hashing. One of them is still missing.",
      zh: "前三条分别是序章公式、引用、哈希前提 —— 再想想漏了哪条。",
    },
    extraHint: {
      en: "There is no structure that is best for everything. Each one pays one cost to gain another, which is the first lesson of this course.",
      zh: "「万能最优」不存在:每个结构都在用一种代价换另一种收益,这正是这门课的第一课。",
    },
    why: {
      en: "A data structure is a set of trades: contiguous memory buys random access, references buy cheap insertion and deletion, extra space buys time. Nothing is best everywhere; you match the structure to the operations.",
      zh: "数据结构 = 组织方式的交易艺术:连续换随机访问,指针换灵活插删,空间换时间 —— 没有万能解,只有匹配。",
    },
  },
];

/* ---------- Page ---------- */

const CHIPS = [
  { id: "decision", n: "01", label: { en: "Decision tree", zh: "决策树" } },
  { id: "signals", n: "02", label: { en: "Signal words", zh: "信号词表" } },
  {
    id: "bigtable",
    n: "03",
    label: { en: "Complexity table", zh: "终极复杂度表" },
  },
  { id: "problems", n: "04", label: { en: "All problems", zh: "全书题单" } },
  { id: "next", n: "05", label: { en: "What next", zh: "下一步" } },
  { id: "quiz", n: "06", label: { en: "Final quiz", zh: "终极测验" } },
];

const CHEAT: {
  name: Loc<string>;
  href: string;
  ops: [string, string, string, string];
  space: string;
  note: Loc<string>;
}[] = [
  {
    name: { en: "Array", zh: "数组" },
    href: "/array",
    ops: ["1", "n", "n", "n"],
    space: "n",
    note: { en: "Search is O(log n) if it is sorted.", zh: "有序时查找 O(log n)" },
  },
  {
    name: { en: "Dynamic array", zh: "动态数组" },
    href: "/array",
    ops: ["1", "n", "n", "n"],
    space: "n",
    note: {
      en: "Appending at the end is O(1) amortized.",
      zh: "尾插均摊 O(1)",
    },
  },
  {
    name: { en: "Linked list", zh: "链表" },
    href: "/linked-list",
    ops: ["n", "n", "1", "1"],
    space: "n",
    note: {
      en: "O(1) insert and delete require holding the position already.",
      zh: "插删 O(1) 需已持有位置",
    },
  },
  {
    name: { en: "Stack", zh: "栈" },
    href: "/stack",
    ops: ["—", "—", "1", "1"],
    space: "n",
    note: { en: "Only the top is touched.", zh: "只碰顶端" },
  },
  {
    name: { en: "Queue / Deque", zh: "队列 / Deque" },
    href: "/queue",
    ops: ["—", "—", "1", "1"],
    space: "n",
    note: { en: "Both ends are O(1).", zh: "两端 O(1)" },
  },
  {
    name: { en: "Hash table", zh: "哈希表" },
    href: "/hash",
    ops: ["—", "1", "1", "1"],
    space: "n",
    note: { en: "Average. Worst case is O(n).", zh: "平均;最坏 O(n)" },
  },
  {
    name: { en: "Balanced BST", zh: "二叉搜索树(平衡)" },
    href: "/bst",
    ops: ["logn", "logn", "logn", "logn"],
    space: "n",
    note: {
      en: "O(n) if it degenerates. An in-order walk is sorted.",
      zh: "退化最坏 O(n);中序即有序",
    },
  },
  {
    name: { en: "Heap", zh: "堆" },
    href: "/heap",
    ops: ["1", "n", "logn", "logn"],
    space: "n",
    note: {
      en: "Access means reading the top. Building from an array is O(n).",
      zh: "访问=看堆顶;建堆 O(n)",
    },
  },
  {
    name: "Trie",
    href: "/trie",
    ops: ["—", "1", "1", "—"],
    space: "Σ|w|",
    note: {
      en: "Cost is measured by the word length L.",
      zh: "复杂度按词长 L 计",
    },
  },
  {
    name: { en: "Union-Find", zh: "并查集" },
    href: "/union-find",
    ops: ["—", "1", "1", "—"],
    space: "n",
    note: {
      en: "About O(α(n)), which is effectively O(1).",
      zh: "近似 O(α(n)) ≈ O(1)",
    },
  },
  {
    name: { en: "Graph (adjacency list)", zh: "图(邻接表)" },
    href: "/graph",
    ops: ["—", "—", "1", "—"],
    space: "V+E",
    note: { en: "A full traversal is O(V+E).", zh: "遍历 O(V+E)" },
  },
  {
    name: { en: "Segment tree / Fenwick tree", zh: "线段树 / BIT" },
    href: "/advanced",
    ops: ["—", "logn", "logn", "—"],
    space: "n",
    note: {
      en: "Range query plus point update.",
      zh: "区间查询+单点修改",
    },
  },
];

export default function AtlasChapter() {
  const L = useL();
  const { totalProblems } = useProgress();
  const done = Math.min(totalProblems, TOTAL);
  const pct = TOTAL > 0 ? Math.round((done / TOTAL) * 100) : 0;

  return (
    <main className="page" data-ch="atlas">
      <Hero
        ch="atlas"
        title={{
          en: (
            <>
              Decision <span className="grad">Atlas</span>
            </>
          ),
          zh: (
            <>
              终章 <span className="grad">选型地图</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              You now know thirteen structures. The last lesson teaches one
              thing:{" "}
              <strong>
                the moment you read a problem, which structure should come to
                mind
              </strong>
              . Choosing is not guesswork. List the operations you need, then
              pick the structure that makes them cheapest.
            </>
          ),
          zh: (
            <>
              十三种结构都认识了,最后一课只教一件事:<strong>看到问题的那一刻,
              你脑子里应该亮起哪盏灯</strong>。选型没有玄学 —— 把操作需求列出来,
              对着价格表挑就是了。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* §01 Decision tree */}
      <Section
        id="decision"
        index="01"
        title={{ en: "The decision tree", zh: "选型决策树" }}
        desc={{
          en: "Walk down this tree for any problem. After enough repetitions you will do it without the diagram.",
          zh: "拿到任何题,先走一遍这棵树 —— 走多了,它会长在你脑子里",
        }}
      >
        <DecisionLab />
        <Callout
          tone="idea"
          title={{
            en: "How to use the decision tree",
            zh: "决策树的正确用法",
          }}
        >
          <p>
            <T
              en={
                <>
                  It is not a table of correct answers. It is an{" "}
                  <b>order of questions</b>: first ask what the main action is,
                  then ask whether you need order, prefixes, or updates. Real
                  problems often need a <b>combination</b> (LRU is a hash table
                  plus a linked list; top k frequent elements is a hash table
                  plus a heap). Choose each part first, then put them together.
                </>
              }
              zh={
                <>
                  它不是标准答案,是<b>提问顺序</b>:先问「核心动作是什么」,再问「要不要有序 /
                  前缀 / 动态修改」。真实题目常常要<b>组合</b>(LRU = 哈希+链表;
                  前 K 个高频 = 哈希+堆)—— 先各自选型,再拼积木。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §02 Signal phrases */}
      <Section
        id="signals"
        index="02"
        title={{
          en: "Signal words: the problem is telling you",
          zh: "信号词雷达:题目在向你眨眼",
        }}
        desc={{
          en: "When these words appear in a LeetCode problem, the structure is announcing itself.",
          zh: "LeetCode 题面里的这些词,就是结构在自报家门",
        }}
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Words in the problem" zh="题面信号" />
                </th>
                <th>
                  <T en="What it points to" zh="该亮的灯" />
                </th>
                <th>
                  <T en="Why" zh="为什么" />
                </th>
              </tr>
            </thead>
            <tbody>
              {SIGNALS.map((s, i) => (
                <tr key={i}>
                  <td className="atl-signal">{L(s.signal)}</td>
                  <td>
                    <Link href={s.href}>
                      <b>{L(s.struct)}</b>
                    </Link>
                  </td>
                  <td>{L(s.why)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* §03 Master complexity table */}
      <Section
        id="bigtable"
        index="03"
        title={{ en: "The full complexity table", zh: "终极复杂度表" }}
        desc={{
          en: "The complete version of the table from chapter 00. By now you can explain every cell.",
          zh: "序章那张表的完整版 —— 现在每一格你都能讲出为什么",
        }}
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Structure" zh="结构" />
                </th>
                <th>
                  <T en="Access" zh="访问" />
                </th>
                <th>
                  <T en="Search" zh="查找" />
                </th>
                <th>
                  <T en="Insert" zh="插入" />
                </th>
                <th>
                  <T en="Delete" zh="删除" />
                </th>
                <th>
                  <T en="Space" zh="空间" />
                </th>
                <th>
                  <T en="Note" zh="备注" />
                </th>
              </tr>
            </thead>
            <tbody>
              {CHEAT.map((r, ri) => (
                <tr key={ri}>
                  <td>
                    <Link href={r.href}>
                      <b>{L(r.name)}</b>
                    </Link>
                  </td>
                  {r.ops.map((v, i) =>
                    v === "—" ? (
                      <td key={i} className="dim">
                        —
                      </td>
                    ) : (
                      <td key={i}>
                        <BigO o={v} />
                      </td>
                    ),
                  )}
                  <td className="mono" style={{ fontSize: 12 }}>
                    O({r.space})
                  </td>
                  <td>{L(r.note)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* §04 Course-wide problem set */}
      <Section
        id="problems"
        index="04"
        title={{
          en: `All problems in the course: ${TOTAL}`,
          zh: `全书题单总表:${TOTAL} 题`,
        }}
        desc={{
          en: "Every problem from the thirteen chapters, sharing the same progress as the chapters themselves.",
          zh: "十三章的高频题全在这里,进度与各章互通 —— 这就是你的刷题地图",
        }}
      >
        <div className="atl-banner">
          <div>
            <div className="big">
              {done}
              <span style={{ fontSize: 20, opacity: 0.6 }}> / {TOTAL}</span>
            </div>
            <div className="sub">
              <T en={<>{pct}% complete</>} zh={<>已完成 {pct}%</>} />
            </div>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label={L({
              en: "Problems completed",
              zh: "题单完成度",
            })}
          >
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="sub">
            <T
              en={
                <>
                  A suggested pace: finish the Easy problems of each chapter
                  first,
                  <br />
                  then do only the Medium ones on a second pass, then time
                  yourself.
                </>
              }
              zh={
                <>
                  建议节奏:每章先把 Easy 扫完建立手感,<br />
                  二刷只做 Medium,三刷限时。
                </>
              }
            />
          </div>
        </div>
        {GROUPS.map((g) => {
          const meta = CHAPTERS.find((c) => c.id === g.ch)!;
          return (
            <Reveal key={g.ch}>
              <div className="atl-group">
                <div
                  className="atl-group-head"
                  style={{ "--gh": meta.hue } as React.CSSProperties}
                >
                  <span className="atl-group-num">{meta.num}</span>
                  <span className="atl-group-title">{L(meta.title)}</span>
                  <Link href={meta.href} className="chip">
                    <T en="Review →" zh="去复习 →" />
                  </Link>
                  <span className="atl-group-count">
                    <T
                      en={<>{g.problems.length} problems</>}
                      zh={<>{g.problems.length} 题</>}
                    />
                  </span>
                </div>
                <ProblemSet ch={g.ch} items={g.problems} />
              </div>
            </Reveal>
          );
        })}
      </Section>

      {/* §05 What next */}
      <Section
        id="next"
        index="05"
        title={{ en: "Where to go from here", zh: "学完之后,路通向哪里" }}
        desc={{
          en: "Data structures are the nouns and algorithms are the verbs. You now hold all the nouns.",
          zh: "数据结构是名词,算法是动词 —— 你已经握着全部名词了",
        }}
      >
        <div className="grid-2">
          <div className="card hoverable">
            <div className="card-kicker">NEXT 01</div>
            <div className="card-title">
              <T en="Algorithm topics" zh="算法专题" />
            </div>
            <p>
              <T
                en={
                  <>
                    Continue along the threads this course started: the boundary
                    variants of binary search (a rotated array, searching on the
                    answer), then backtracking (the recursion tree you practised
                    in the binary tree chapter), then greedy algorithms, then
                    dynamic programming (you already wrote Kadane's algorithm,
                    which is DP). Every topic builds on a structure you already
                    have.
                  </>
                }
                zh={
                  <>
                    沿着本课的伏笔继续:二分的边界变体(旋转数组/答案二分)→
                    回溯(递归树,你在二叉树章练过的思维)→ 贪心 → 动态规划
                    (Kadane 你已经会了,它就是 DP)。每个专题都建立在你手里的结构上。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">NEXT 02</div>
            <div className="card-title">
              <T en="System design" zh="系统设计" />
            </div>
            <p>
              <T
                en={
                  <>
                    Scale the structures up by a factor of ten thousand: hashing
                    becomes consistent hashing and sharding; a skip list becomes
                    a Redis sorted set; a B+ tree becomes a database index; a
                    Bloom filter protects a cache; a queue becomes Kafka. Every
                    engineering callout in this course is an entry point.
                  </>
                }
                zh={
                  <>
                    把结构放大一万倍:哈希 → 一致性哈希与分片;跳表 → Redis zset;
                    B+ 树 → 数据库索引;布隆过滤器 → 缓存穿透防护;队列 → Kafka。
                    这门课的每个 Callout「工程现场」都是入口。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">NEXT 03</div>
            <div className="card-title">
              <T en="✍️ Close the practice loop" zh="✍️ 刷题闭环" />
            </div>
            <p>
              <T
                en={
                  <>
                    Go back to the table in §04. Clear the Easy problems first,
                    then work through the Medium ones under time pressure. After
                    each problem, answer three questions: what is the
                    complexity, why can it be improved, and what would change
                    with a different data structure? Those three questions are
                    what interviews test.
                  </>
                }
                zh={
                  <>
                    回到 §04 的总表:先扫 Easy 建手感,再限时刷 Medium。
                    每道题做完问三句:复杂度多少?为什么能优化?换个数据结构会怎样?
                    —— 面试考的就是这三句。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">NEXT 04</div>
            <div className="card-title">
              <T en="Spaced review" zh="间隔复习" />
            </div>
            <p>
              <T
                en={
                  <>
                    A week from now, retake the quiz in every chapter. A month
                    from now, read only the key points card at the end of each
                    chapter. The green dots in the sidebar keep the record for
                    you. Forgetting is normal; the schedule of review is what
                    matters.
                  </>
                }
                zh={
                  <>
                    一周后重走一遍每章的「通关测验」,一个月后只看每章的 KeyPoints
                    要点卡。侧栏的绿灯会陪你记录这一切 —— 遗忘很正常,复习节奏对就行。
                  </>
                }
              />
            </p>
          </div>
        </div>
      </Section>

      {/* §06 终极测验 */}
      <Section
        id="quiz"
        index="06"
        title={{
          en: "Final quiz: 11 questions about choosing a structure",
          zh: "终极测验:11 道跨章选型题",
        }}
        desc={{
          en: "Not definitions. Only choices. This is what an interview actually asks.",
          zh: "不考定义,只考选型 —— 这才是面试真正的样子",
        }}
        badge={
          <span className="chip">
            <T en="✎ Final quiz" zh="✎ 全书大考" />
          </span>
        }
      >
        <Quiz ch="atlas" items={QUIZ} />
      </Section>

      <KeyPoints
        title={{
          en: "The last key points card of the course",
          zh: "全书最后一张要点卡",
        }}
        points={[
          {
            en: (
              <>
                Choosing takes three steps:{" "}
                <b>
                  list the operations you need, mark the most frequent one, then
                  read the complexity table and pick the structure that makes it
                  cheapest
                </b>
                .
              </>
            ),
            zh: (
              <>
                选型三步:<b>列出操作需求 → 标出频率最高的操作 → 对着复杂度表挑
                让它最便宜的结构</b>。
              </>
            ),
          },
          {
            en: (
              <>
                Two physical facts run through everything: contiguous memory
                uses the <b>base address + offset formula</b> (arrays, hash
                buckets, heaps), and scattered memory uses{" "}
                <b>references</b> (linked lists, trees, graphs).
              </>
            ),
            zh: (
              <>
                两条物理直觉贯穿一切:连续内存靠<b>「首地址+偏移」公式</b>(数组/哈希桶/堆),
                离散内存靠<b>引用纸条</b>(链表/树/图)。
              </>
            ),
          },
          {
            en: (
              <>
                Hard problems are built from parts: LRU is a hash table plus a
                doubly linked list; top k frequent elements is a hash table plus
                a heap; word search is a trie plus backtracking.{" "}
                <b>Choose each part first, then combine them.</b>
              </>
            ),
            zh: (
              <>
                复杂题拼积木:LRU = 哈希+双向链表;前 K 高频 = 哈希+堆;
                单词搜索 = Trie+回溯 —— <b>先各自选型,再组合</b>。
              </>
            ),
          },
          {
            en: (
              <>
                No structure is best at everything. Every O(1) was paid for
                somewhere else. Being able to explain{" "}
                <b>why you did not choose X</b> is worth more in an interview
                than knowing how to use X.
              </>
            ),
            zh: (
              <>
                没有万能结构:每个 O(1) 都在别处付了账。能讲清楚<b>「我为什么不用 X」</b>,
                比会用 X 更能打动面试官。
              </>
            ),
          },
          {
            en: (
              <>
                The end of this course is your starting point: work through the
                problem table three times and turn on every green dot. Then go
                and use it. 🎓
              </>
            ),
            zh: (
              <>
                这门课的终点是你的起点:题单总表刷三遍,每章绿灯点满 ——
                然后,去外面的世界考试吧。🎓
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="atlas" />
    </main>
  );
}
