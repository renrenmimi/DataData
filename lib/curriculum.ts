// 课程注册表 —— 全站唯一的章节清单。
// 侧栏、命令面板、章节页脚(上一章/下一章)、进度系统都从这里取数据。
// 新增章节:在 CHAPTERS 里插入一条,并保证 app/<id>/page.tsx 存在。

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
  /** 章节编号展示:00–13,终章用 ✦ */
  num: string;
  title: string;
  /** 英文副标 —— hero 大字与侧栏小字 */
  en: string;
  /** 一句话本质 */
  essence: string;
  /** oklch 色相角,决定整章主题色 */
  hue: number;
  /** 难度 1–5,世界地图与侧栏展示 */
  level: 1 | 2 | 3 | 4 | 5;
  /** LeetCode 出现频率 1–5(5 = 顶级高频) */
  freq: 1 | 2 | 3 | 4 | 5;
  /** 本章可勾选的练习题数(进度分母的一部分)——由各章 lib 数据决定,这里只是索引用途 */
  tags: string[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: "home",
    href: "/",
    num: "00",
    title: "序章 · 世界地图",
    en: "The Atlas & Big-O",
    essence: "所有数据结构,都是「时间换空间」棋局里的一步棋。",
    hue: 292,
    level: 1,
    freq: 5,
    tags: ["复杂度", "Big-O", "内存模型"],
  },
  {
    id: "array",
    href: "/array",
    num: "01",
    title: "数组",
    en: "Array",
    essence: "一排连续的房间,门牌号就是下标。",
    hue: 196,
    level: 1,
    freq: 5,
    tags: ["双指针", "滑动窗口", "二分查找", "矩阵"],
  },
  {
    id: "string",
    href: "/string",
    num: "02",
    title: "字符串",
    en: "String",
    essence: "一个不许改字的数组,改一个字就要重抄全文。",
    hue: 82,
    level: 1,
    freq: 5,
    tags: ["不可变性", "回文", "子串"],
  },
  {
    id: "linked-list",
    href: "/linked-list",
    num: "03",
    title: "链表",
    en: "Linked List",
    essence: "一场寻宝游戏:每个节点只告诉你下一站在哪。",
    hue: 350,
    level: 2,
    freq: 5,
    tags: ["快慢指针", "哑结点", "反转"],
  },
  {
    id: "stack",
    href: "/stack",
    num: "04",
    title: "栈",
    en: "Stack",
    essence: "一摞盘子:后放上去的,先被拿走。",
    hue: 128,
    level: 2,
    freq: 5,
    tags: ["LIFO", "括号匹配", "单调栈"],
  },
  {
    id: "queue",
    href: "/queue",
    num: "05",
    title: "队列与双端队列",
    en: "Queue & Deque",
    essence: "排队买奶茶:先来的先喝到。",
    hue: 230,
    level: 2,
    freq: 4,
    tags: ["FIFO", "循环队列", "单调队列"],
  },
  {
    id: "hash",
    href: "/hash",
    num: "06",
    title: "哈希表",
    en: "Hash Table",
    essence: "拿钥匙直接开门,不用一间间敲。",
    hue: 292,
    level: 3,
    freq: 5,
    tags: ["哈希函数", "冲突", "O(1) 查找"],
  },
  {
    id: "binary-tree",
    href: "/binary-tree",
    num: "07",
    title: "二叉树",
    en: "Binary Tree",
    essence: "一个会分叉的链表;递归在这里第一次真正发光。",
    hue: 152,
    level: 3,
    freq: 5,
    tags: ["DFS", "BFS", "递归"],
  },
  {
    id: "bst",
    href: "/bst",
    num: "08",
    title: "二叉搜索树",
    en: "BST",
    essence: "左小右大立下的规矩,让整棵树变成一部字典。",
    hue: 178,
    level: 3,
    freq: 4,
    tags: ["有序性", "中序遍历", "平衡"],
  },
  {
    id: "heap",
    href: "/heap",
    num: "09",
    title: "堆与优先队列",
    en: "Heap",
    essence: "只承诺一件事:堆顶永远是最值。",
    hue: 55,
    level: 3,
    freq: 5,
    tags: ["Top-K", "完全二叉树", "sift"],
  },
  {
    id: "trie",
    href: "/trie",
    num: "10",
    title: "前缀树",
    en: "Trie",
    essence: "把一万个单词叠成一棵树,共享每一段相同的开头。",
    hue: 330,
    level: 4,
    freq: 3,
    tags: ["前缀匹配", "自动补全", "字典树"],
  },
  {
    id: "union-find",
    href: "/union-find",
    num: "11",
    title: "并查集",
    en: "Union-Find",
    essence: "两个问题、三行代码:你们是一伙的吗?合并!",
    hue: 100,
    level: 4,
    freq: 3,
    tags: ["连通性", "路径压缩", "按秩合并"],
  },
  {
    id: "graph",
    href: "/graph",
    num: "12",
    title: "图",
    en: "Graph",
    essence: "万物皆点,关系皆边 —— 数据结构的终极形态。",
    hue: 255,
    level: 4,
    freq: 4,
    tags: ["BFS/DFS", "拓扑排序", "邻接表"],
  },
  {
    id: "advanced",
    href: "/advanced",
    num: "13",
    title: "组合与进阶",
    en: "Composite & Beyond",
    essence: "真正的高手,把基础结构拼成新的机器。",
    hue: 22,
    level: 5,
    freq: 4,
    tags: ["LRU", "线段树", "树状数组", "跳表"],
  },
  {
    id: "atlas",
    href: "/atlas",
    num: "✦",
    title: "终章 · 选型地图",
    en: "Decision Atlas",
    essence: "看到题目的那一刻,你脑子里应该亮起哪盏灯?",
    hue: 292,
    level: 5,
    freq: 5,
    tags: ["选型决策", "高频题总表", "复习"],
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
