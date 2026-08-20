"use client";

// 第 13 章 · 组合与进阶 —— 全书压轴。
// 十段式结构:组合的艺术 → LRU(重头戏)→ LFU 一瞥 → 线段树 → 树状数组 →
// 跳表 → 布隆过滤器 → 三道精讲(逐帧动画 + 三语言题解)→ 题单 → 测验 → 要点。
// 前 12 章的所有结构在这里被拼装成"机器":可自由引用任何一章。
//
// 双语:所有面向学习者的文案都用 <T en zh> 或 { en, zh },英文为默认语言。
// 代码窗的 code 写成 { en, zh } —— 两版逐行等价,只有注释不同,hl 行号才对得上。
// 每一节都要说清「拼了哪两个结构」和「为什么这个组合能拿到要求的复杂度」,
// 不能只报结论。

import {
  Hero,
  Section,
  Callout,
  BigO,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeTabs, CodeBlock } from "@/lib/code";
import { ArrayStepper, type ArrayFrame } from "@/lib/stepper";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/advanced-data";
import { T } from "@/lib/i18n";
import {
  LRUAnatomy,
  LRULab,
  LFUBuckets,
  SegAnatomy,
  SegLab,
  SkipLab,
  BloomLab,
} from "./viz";
import "./chapter.css";

/* ================= 精讲动画帧 ================= */

// —— 精讲 A:LC 146 LRU(容量 2,官方样例的完整操作序列)——
// 单元格 = 双向链表从头到尾的顺序(左新右旧)
const F146: ArrayFrame[] = [
  {
    cells: [],
    msg: {
      en: (
        <>
          An empty LRU cache with capacity 2. The cells below show the{" "}
          <b>order of the doubly linked list from head to tail</b>: left is the
          newest, right is the oldest. Each caption also says what the hash map
          does.
        </>
      ),
      zh: (
        <>
          容量 2 的空 LRU。下面的格子表示<b>双向链表从头到尾</b>的顺序:左 = 最新,右 =
          最旧。旁白里同步说明哈希表的动作。
        </>
      ),
    },
  },
  {
    cells: [{ v: "1:1", state: "lit" }],
    ptrs: [{ i: 0, label: { en: "head", zh: "头" } }],
    msg: {
      en: (
        <>
          put(1,1): the cache is not full, so the new node <b>1:1</b> is linked
          at the head and the hash map records 1 to that node. Both steps are
          O(1).
        </>
      ),
      zh: (
        <>
          put(1,1):缓存未满 → 新节点 <b>1:1</b> 头插;哈希表写入 1 → 节点引用。两步都是 O(1)。
        </>
      ),
    },
  },
  {
    cells: [{ v: "2:2", state: "lit" }, { v: "1:1" }],
    ptrs: [
      { i: 0, label: { en: "head", zh: "头" } },
      { i: 1, label: { en: "tail", zh: "尾" } },
    ],
    msg: {
      en: (
        <>
          put(2,2): <b>2:2</b> is linked at the head, which pushes 1:1 to the
          tail. 1:1 is now the least recently used entry and the next candidate
          for eviction.
        </>
      ),
      zh: (
        <>
          put(2,2):<b>2:2</b> 头插,1:1 被挤到尾部 —— 它现在是最久未使用的那个,
          也是下一个被淘汰的候选。
        </>
      ),
    },
  },
  {
    cells: [{ v: "1:1", state: "lit" }, { v: "2:2" }],
    ptrs: [
      { i: 0, label: { en: "head", zh: "头" } },
      { i: 1, label: { en: "tail", zh: "尾" } },
    ],
    msg: {
      en: (
        <>
          get(1): the hash map finds the node in one step and returns <b>1</b>.
          The node is then unlinked and inserted at the head again. A get must
          also update the order; forgetting this is the most common bug. 2:2 is
          now at the tail.
        </>
      ),
      zh: (
        <>
          get(1):哈希表一步命中,返回 <b>1</b>;然后把节点 1 摘下来<b>插回头部</b> ——
          get 也要更新顺序,忘了这一步是最常见的 bug。现在轮到 2:2 在尾部。
        </>
      ),
    },
  },
  {
    cells: [
      { v: "3:3", state: "lit" },
      { v: "1:1" },
      { v: "2:2", state: "bad" },
    ],
    ptrs: [{ i: 0, label: { en: "head", zh: "头" } }],
    msg: {
      en: (
        <>
          put(3,3): the cache is full, so the tail node <b>2:2</b> is evicted.
          The list unlinks it in O(1), and the hash map entry is deleted in O(1)
          using the key stored inside the node. Then 3:3 is linked at the head.
        </>
      ),
      zh: (
        <>
          put(3,3):容量满!尾部的 <b>2:2</b> 被淘汰 —— 链表 O(1) 摘除,
          再用节点里存的 key 在哈希表里 O(1) 删掉条目,然后 3:3 头插。
        </>
      ),
    },
  },
  {
    cells: [{ v: "3:3" }, { v: "1:1" }],
    ptrs: [
      { i: 0, label: { en: "head", zh: "头" } },
      { i: 1, label: { en: "tail", zh: "尾" } },
    ],
    msg: {
      en: (
        <>
          get(2) = <b>-1</b>: the hash map no longer holds key 2, so the list is
          not touched at all.
        </>
      ),
      zh: (
        <>
          get(2) = <b>-1</b>:哈希表里已经没有 key 2 了,链表完全不用碰。
        </>
      ),
    },
  },
  {
    cells: [
      { v: "4:4", state: "lit" },
      { v: "3:3" },
      { v: "1:1", state: "bad" },
    ],
    ptrs: [{ i: 0, label: { en: "head", zh: "头" } }],
    msg: {
      en: (
        <>
          put(4,4): full again. This time the tail holds <b>1:1</b>, which has
          not been used since get(1), so it is evicted.
        </>
      ),
      zh: (
        <>
          put(4,4):又满了 —— 这次在尾部的是 <b>1:1</b>(它自 get(1) 之后再没被用过),淘汰。
        </>
      ),
    },
  },
  {
    cells: [
      { v: "4:4", state: "ok" },
      { v: "3:3", state: "ok" },
    ],
    msg: {
      en: (
        <>
          Final state: get(1) returns -1, get(3) returns 3, get(4) returns 4.
          All <b>9 cache operations were O(1)</b>. This is the official LC 146
          example, and its output is [1,-1,-1,3,4].
        </>
      ),
      zh: (
        <>
          终态:get(1)→-1、get(3)→3、get(4)→4。<b>9 次缓存操作,每次都是 O(1)</b>
          —— 这正是 LC 146 的官方样例,输出 [1,-1,-1,3,4]。
        </>
      ),
    },
  },
];

// —— 精讲 B:LC 307 用树状数组 ——
// a[1..8] = [3,1,4,1,5,9,2,6](1-based),tree = [×,3,4,4,9,5,14,2,31]
// 演示 add(3,+2) 的上行三跳,与 query(7) 的下行三跳
const bitCells = (
  t: (number | string)[],
  marks: Record<number, "lit" | "ok">,
): ArrayFrame["cells"] =>
  t.map((v, i) =>
    i === 0
      ? { v: "×", state: "ghost" as const }
      : { v, state: marks[i] },
  );

const F307: ArrayFrame[] = [
  {
    cells: bitCells([0, 3, 4, 4, 9, 5, 14, 2, 31], {}),
    msg: {
      en: (
        <>
          The Fenwick tree built from a = [3,1,4,1,5,9,2,6] (1-based). tree[i]
          holds the sum of a segment that <b>ends at i and is lowbit(i) long</b>.
          tree[0] is left unused, because a Fenwick tree must be 1-based.
        </>
      ),
      zh: (
        <>
          a = [3,1,4,1,5,9,2,6](1 起)建好的树状数组:tree[i] 存的是
          <b>以 i 结尾、长度为 lowbit(i)</b> 的那一段的和。tree[0] 空着不用 ——
          树状数组必须 1-based。
        </>
      ),
    },
  },
  {
    cells: bitCells([0, 3, 4, 6, 9, 5, 14, 2, 31], { 3: "lit" }),
    ptrs: [{ i: 3, label: "i" }],
    msg: {
      en: (
        <>
          update: a[3] changes from 4 to 6, which is add(3, +2). The first stop
          is tree[3] (covering [3,3]), 4 becomes 6. lowbit(3) = 1, so jump to 3 +
          1 = <b>4</b>.
        </>
      ),
      zh: (
        <>
          update:a[3] 从 4 改到 6,即 add(3, +2)。第一站 tree[3](管 [3,3])4→6;
          lowbit(3)=1,跳到 3+1=<b>4</b>。
        </>
      ),
    },
  },
  {
    cells: bitCells([0, 3, 4, 6, 11, 5, 14, 2, 31], { 4: "lit" }),
    ptrs: [{ i: 4, label: "i" }],
    msg: {
      en: (
        <>
          tree[4] covers [1,4], which contains a[3], so 9 becomes <b>11</b>.
          lowbit(4) = 4, so jump to 4 + 4 = <b>8</b>.
        </>
      ),
      zh: (
        <>
          tree[4] 管 [1,4],包含 a[3] → 9+2=<b>11</b>;lowbit(4)=4,跳到 4+4=<b>8</b>。
        </>
      ),
    },
  },
  {
    cells: bitCells([0, 3, 4, 6, 11, 5, 14, 2, 33], { 8: "lit" }),
    ptrs: [{ i: 8, label: "i" }],
    msg: {
      en: (
        <>
          tree[8] covers [1,8], so 31 becomes <b>33</b>. The next jump would be 8
          + 8 = 16, which is past n, so the loop stops. The whole update touched{" "}
          <b>3 cells</b>. Each jump at least doubles lowbit(i), so the count is
          at most log₂n + 1.
        </>
      ),
      zh: (
        <>
          tree[8] 管 [1,8] → 31+2=<b>33</b>;下一跳 8+8=16,超过 n,停。整个 update
          只碰了 <b>3 个格子</b> —— 每跳一次 lowbit(i) 至少翻倍,所以跳数不超过 log₂n + 1。
        </>
      ),
    },
  },
  {
    cells: bitCells([0, 3, 4, 6, 11, 5, 14, 2, 33], { 7: "ok" }),
    ptrs: [{ i: 7, label: "i" }],
    msg: {
      en: (
        <>
          query(7) is the prefix sum a[1..7]. The first segment is tree[7]
          (covering [7,7]), so s = 2. Then 7 − lowbit(7) = <b>6</b>.
        </>
      ),
      zh: (
        <>
          query(7) = a[1..7] 的前缀和。第一段是 tree[7](管 [7,7]):s = 2;
          7−lowbit(7) = <b>6</b>。
        </>
      ),
    },
  },
  {
    cells: bitCells([0, 3, 4, 6, 11, 5, 14, 2, 33], { 7: "ok", 6: "ok" }),
    ptrs: [{ i: 6, label: "i" }],
    msg: {
      en: (
        <>
          tree[6] covers [5,6], so s = 2 + 14 = 16. Then 6 − lowbit(6) = 6 − 2 ={" "}
          <b>4</b>. Notice that the segments meet end to end and never overlap,
          which is why you can simply add them.
        </>
      ),
      zh: (
        <>
          tree[6] 管 [5,6]:s = 2+14 = 16;6−lowbit(6) = 6−2 = <b>4</b>。
          注意各段首尾相接、互不重叠 —— 所以直接相加就是答案。
        </>
      ),
    },
  },
  {
    cells: bitCells([0, 3, 4, 6, 11, 5, 14, 2, 33], { 7: "ok", 6: "ok", 4: "ok" }),
    ptrs: [{ i: 4, label: "i" }],
    msg: {
      en: (
        <>
          tree[4] covers [1,4] and already includes the +2 from the update, so s
          = 16 + 11 = <b>27</b>. Then 4 − 4 = 0 and the loop stops. Three
          segments produced the prefix sum 27 = 3+1+6+1+5+9+2. The split follows
          the binary form of 7 = 4 + 2 + 1.
        </>
      ),
      zh: (
        <>
          tree[4] 管 [1,4](已经含刚才的 +2):s = 16+11 = <b>27</b>;4−4 = 0,停。
          三段拼出前缀和 27 = 3+1+6+1+5+9+2 ✓ —— 拆的正是 7 = 4+2+1 的二进制。
        </>
      ),
    },
  },
];

// —— 精讲 C:LC 380 数组 + 哈希 ——
const F380: ArrayFrame[] = [
  {
    cells: [{ v: 5, state: "lit" }],
    msg: {
      en: (
        <>
          insert(5): append to the end of the array and record {"{5:0}"} in the
          hash map. Appending to a dynamic array is amortized O(1) (chapter 1).
        </>
      ),
      zh: (
        <>
          insert(5):数组尾部追加,哈希表记下 {"{5:0}"} —— 动态数组尾部追加是均摊 O(1)(第 1 章)。
        </>
      ),
    },
  },
  {
    cells: [{ v: 5 }, { v: 8, state: "lit" }],
    msg: {
      en: <>insert(8): append again, hash map {"{5:0, 8:1}"}.</>,
      zh: <>insert(8):尾部追加,哈希表 {"{5:0, 8:1}"}。</>,
    },
  },
  {
    cells: [{ v: 5 }, { v: 8 }, { v: 3, state: "lit" }],
    msg: {
      en: (
        <>
          insert(3): append again, hash map {"{5:0, 8:1, 3:2}"}. None of the
          three inserts moved an existing element.
        </>
      ),
      zh: (
        <>
          insert(3):尾部追加,哈希表 {"{5:0, 8:1, 3:2}"}。三次插入都没有移动过已有元素。
        </>
      ),
    },
  },
  {
    cells: [{ v: 5 }, { v: 8, state: "bad" }, { v: 3, state: "lit" }],
    ptrs: [
      { i: 1, label: { en: "remove", zh: "要删" } },
      { i: 2, label: { en: "last", zh: "末尾" } },
    ],
    msg: {
      en: (
        <>
          remove(8): the hash map says 8 lives at index 1. Deleting from the
          middle of an array normally costs O(n) because everything after it
          shifts left. But a set <b>does not care about order</b>, so copy the
          last element 3 over the value 8 instead.
        </>
      ),
      zh: (
        <>
          remove(8):哈希表查到 8 住在下标 1。数组中间删除通常要 O(n) 搬移后面的元素,
          但集合<b>不在乎顺序</b> —— 直接把末尾的 3 抄过来盖掉 8。
        </>
      ),
    },
  },
  {
    cells: [{ v: 5 }, { v: 3, state: "lit" }, { v: 3, state: "ghost" }],
    msg: {
      en: (
        <>
          3 now sits at index 1, so the hash map must be <b>updated in the same
          step</b> to {"{3:1}"}. Forgetting this leaves a stale index and breaks
          the next remove. The last cell is now a duplicate and is about to be
          dropped.
        </>
      ),
      zh: (
        <>
          3 落到下标 1,哈希表必须<b>在同一步更新</b>成 {"{3:1}"} ——
          忘了这一步会留下过期下标,下一次 remove 就会出错。末尾格子现在是重复的,准备尾删。
        </>
      ),
    },
  },
  {
    cells: [{ v: 5 }, { v: 3 }],
    msg: {
      en: (
        <>
          Remove the last element in O(1) and delete {"{8}"} from the hash map.
          Swapping with the last element turns an O(n) array deletion into an{" "}
          <b>O(1)</b> one. The price is that element order is lost, and a set
          does not need order.
        </>
      ),
      zh: (
        <>
          尾删 O(1),哈希表删掉 {"{8}"}。「和末尾交换再删」把数组删除从 O(n) 变成
          <b>O(1)</b> —— 代价是放弃元素顺序,而集合恰好不需要顺序。
        </>
      ),
    },
  },
  {
    cells: [
      { v: 5, state: "ok" },
      { v: 3, state: "ok" },
    ],
    msg: {
      en: (
        <>
          getRandom(): pick a random index in [0, size) and read the array in
          O(1). Every element has probability exactly 1/size. This is why the
          array is needed: a hash table has empty buckets, so it cannot draw a
          uniformly random member in O(1).
        </>
      ),
      zh: (
        <>
          getRandom():在 [0, size) 里随机取一个下标,数组 O(1) 随机访问 ——
          每个元素被选中的概率恰好是 1/size。这就是必须有数组的原因:
          哈希表内部有空桶,做不到 O(1) 的等概率抽样。
        </>
      ),
    },
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "combine", n: "01", label: { en: "Combining", zh: "组合的艺术" } },
  { id: "lru", n: "02", label: { en: "LRU cache", zh: "LRU 缓存" } },
  { id: "lfu", n: "03", label: { en: "LFU cache", zh: "LFU 一瞥" } },
  { id: "segtree", n: "04", label: { en: "Segment tree", zh: "线段树" } },
  { id: "bit", n: "05", label: { en: "Fenwick tree", zh: "树状数组" } },
  { id: "skiplist", n: "06", label: { en: "Skip list", zh: "跳表" } },
  { id: "bloom", n: "07", label: { en: "Bloom filter", zh: "布隆过滤器" } },
  { id: "featured", n: "08", label: { en: "Worked examples", zh: "三道精讲" } },
  { id: "problems", n: "09", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "10", label: { en: "Quiz", zh: "通关测验" } },
];

export default function AdvancedChapter() {
  return (
    <main className="page" data-ch="advanced">
      <Hero
        ch="advanced"
        title={{
          en: (
            <>
              Composite <span className="grad">&amp; Beyond</span>
            </>
          ),
          zh: (
            <>
              组合与进阶 <span className="grad">Composite &amp; Beyond</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              The first 12 chapters gave you <strong>single structures</strong>.
              This chapter combines them into <strong>working machines</strong>:
              LRU caches, segment trees, skip lists, and Bloom filters. Real
              systems almost never run on one structure alone. They run on a pair
              of structures that cover each other&apos;s weak operation.
            </>
          ),
          zh: (
            <>
              前 12 章学的是<strong>单个结构</strong>;这一章把它们拼成
              <strong>能用的机器</strong>:LRU 缓存、线段树、跳表、布隆过滤器。
              真实系统里跑着的很少是单个结构,而是两个结构互相补上对方的短板。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 组合的艺术 ================= */}
      <Section
        id="combine"
        index="01"
        title={{
          en: "Combining structures into machines",
          zh: "组合的艺术:基础结构拼成机器",
        }}
        desc={{
          en: "No new base structures in this chapter, only new ways to combine them",
          zh: "本章没有新的基础结构 —— 只有新的拼法",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Look back at the course. An array (chapter 1) gives O(1) random
                  access. A linked list (chapter 3) gives O(1) insert and remove
                  once you hold the node. A hash map (chapter 6) gives O(1)
                  lookup by key. A heap (chapter 9) gives O(log n) access to the
                  minimum or maximum. Each structure is fast at one thing and
                  slow at something else.
                </p>
                <p>
                  Real requirements rarely need only one of those. &quot;A cache
                  must read in O(1) <em>and</em> evict the least recently used
                  entry in O(1).&quot; &quot;An array must support updates{" "}
                  <em>and</em> fast range sums.&quot; Every single structure gets
                  stuck on one of the two operations. The usual answer is not a
                  new structure. It is to{" "}
                  <strong>
                    put two structures together so that each one only performs
                    the operation it can finish quickly
                  </strong>
                  . All six machines in this chapter are built that way.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  回头看这门课:数组(第 1 章)给你 O(1) 随机访问,链表(第 3 章)
                  在拿到节点后给你 O(1) 摘除和插入,哈希表(第 6 章)给你 O(1)
                  按 key 定位,堆(第 9 章)给你 O(log n) 取最值。
                  每个结构都只有一两招快,别的操作就慢。
                </p>
                <p>
                  真实需求却很少只要一招:「缓存要能 O(1) 读<em>并且</em> O(1)
                  淘汰最久未用的」、「数组要能改<em>并且</em>能快速查区间和」——
                  任何单一结构都会在其中一个操作上卡住。常见的解法不是发明新结构,而是
                  <strong>把两个结构拼在一起,让每个只干自己快的那件事</strong>。
                  本章的六台机器全部是这么拼出来的。
                </p>
              </>
            }
          />
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th><T en="Machine" zh="机器" /></th>
                <th><T en="Built from" zh="拼法" /></th>
                <th><T en="What it buys you" zh="解决什么" /></th>
                <th><T en="Where it is used" zh="工程出场" /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b><T en="LRU cache" zh="LRU 缓存" /></b></td>
                <td><T en="hash map + doubly linked list" zh="哈希表 + 双向链表" /></td>
                <td><T en="O(1) read and O(1) eviction of the least recently used entry" zh="O(1) 查 + O(1) 淘汰最久未用" /></td>
                <td><T en="Redis, browser caches, OS page replacement" zh="Redis、浏览器缓存、OS 页面置换" /></td>
              </tr>
              <tr>
                <td><b><T en="LFU cache" zh="LFU 缓存" /></b></td>
                <td><T en="two hash maps + one list per frequency" zh="双哈希表 + 频次分桶链表" /></td>
                <td><T en="O(1) eviction of the least frequently used entry" zh="O(1) 淘汰用得最少的" /></td>
                <td><T en="the Redis allkeys-lfu policy" zh="Redis allkeys-lfu 策略" /></td>
              </tr>
              <tr>
                <td><b><T en="Segment tree" zh="线段树" /></b></td>
                <td><T en="array + binary tree over ranges" zh="数组 + 分治二叉树" /></td>
                <td><T en="range queries with updates, both O(log n)" zh="区间统计:又能改又能查,双 O(log n)" /></td>
                <td><T en="database statistics, time-series aggregation, contests" zh="数据库统计、时序聚合、竞赛" /></td>
              </tr>
              <tr>
                <td><b><T en="Fenwick tree" zh="树状数组" /></b></td>
                <td><T en="array + the lowbit bit operation" zh="数组 + lowbit 位运算" /></td>
                <td><T en="prefix sums that stay correct after updates" zh="可修改的前缀和(线段树轻量版)" /></td>
                <td><T en="counting problems, inversion counts, contests" zh="计数统计、逆序对、竞赛标配" /></td>
              </tr>
              <tr>
                <td><b><T en="Skip list" zh="跳表" /></b></td>
                <td><T en="sorted linked list + random index levels" zh="有序链表 + 多层随机索引" /></td>
                <td><T en="expected O(log n) search, insert, and delete in sorted order" zh="有序集合下期望 O(log n) 查/插/删" /></td>
                <td><T en="Redis zset, LevelDB MemTable" zh="Redis zset、LevelDB MemTable" /></td>
              </tr>
              <tr>
                <td><b><T en="Bloom filter" zh="布隆过滤器" /></b></td>
                <td><T en="bit array + k hash functions" zh="位数组 + k 个哈希函数" /></td>
                <td><T en="a very small structure that can prove an element is absent" zh="用很小的内存证明「一定不在」" /></td>
                <td><T en="crawler deduplication, protecting a database from lookups of missing keys" zh="爬虫去重、缓存穿透防护" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Rule 01" zh="拼装原则 01" />
            </div>
            <div className="card-title">
              <T en="Cover each other's weak operation" zh="取长补短" />
            </div>
            <p>
              <T
                en={
                  <>
                    Each member only performs the operation it can finish in
                    O(1) or O(log n), and never the one that would cost it O(n).
                    In an LRU cache the hash map only looks up, and the list only
                    maintains order.
                  </>
                }
                zh={
                  <>
                    每个成员只做自己 O(1)/O(log n) 的操作,绝不让它去做自己 O(n)
                    的那件事。LRU 里哈希表只负责查,链表只负责维护顺序。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Rule 02" zh="拼装原则 02" />
            </div>
            <div className="card-title">
              <T en="Point at each other" zh="互相指认" />
            </div>
            <p>
              <T
                en={
                  <>
                    The members store <b>references</b> to each other. The hash
                    map value is a list node, and the list node stores the key
                    back. Either side reaches the other in one step, with no
                    search.
                  </>
                }
                zh={
                  <>
                    成员之间互存<b>引用</b>:哈希表的 value 是链表节点,链表节点里存回
                    key。两边都能一步跳到对方,不用搜索。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Rule 03" zh="拼装原则 03" />
            </div>
            <div className="card-title">
              ⚖️ <T en="Update every member together" zh="同步更新" />
            </div>
            <p>
              <T
                en={
                  <>
                    Every operation must update <b>all members</b> in the same
                    step. Removing a list node also removes its hash map entry.
                    Losing that synchronization is the most common source of bugs
                    in composite structures.
                  </>
                }
                zh={
                  <>
                    每次操作必须在同一步里把<b>所有成员</b>都改到位:删链表节点就必须删哈希条目。
                    丢掉这个同步,是组合结构最常见的 bug 来源。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "A method for design questions",
            zh: "组合设计的方法论(面试设计题的通用开场)",
          }}
        >
          <T
            en={
              <p>
                When you are asked to &quot;design an X&quot;, work in three
                steps. First, <b>list every operation</b> (get, put, delete,
                random, and so on). Second, write down the{" "}
                <b>complexity budget</b> for each one: does the problem require
                O(1) or O(log n)? Third, check where a single structure goes over
                budget, and{" "}
                <b>add a second structure that covers exactly that operation</b>.
                Every section in this chapter is one run through this method.
              </p>
            }
            zh={
              <p>
                拿到「设计一个 XX」:第一步<b>列出全部操作</b>
                (get/put/delete/random…);第二步给每个操作定
                <b>复杂度预算</b>(题目要求 O(1) 还是 O(log n)?);
                第三步看单一结构在哪一步超预算,
                <b>再补一个结构专门负责那个操作</b>。本章每一节都是这套方法的一次完整演练。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §02 LRU ================= */}
      <Section
        id="lru"
        index="02"
        title={{
          en: "LRU cache: hash map + doubly linked list",
          zh: "LRU 缓存:哈希表 + 双向链表",
        }}
        desc={{
          en: "The main section of this chapter. Start from the requirements, rule out the alternatives, and build it.",
          zh: "本章重头戏 —— 从需求出发,逐个排除候选方案,亲手把它拼出来",
        }}
        badge={
          <span className="chip" data-tone="warn">
            <T
              en="★ The most common design question in interviews"
              zh="★ 面试出现率最高的设计题"
            />
          </span>
        }
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Start from the requirement. A <strong>cache</strong> is storage
                  that is fast but small. Memory is far faster than disk but
                  cannot hold everything, so a cache keeps only the part of the
                  data most likely to be read again. Being small leads to one
                  unavoidable question:{" "}
                  <strong>when the cache is full, which entry leaves?</strong>
                </p>
                <p>
                  The classic answer is to evict the entry that has{" "}
                  <strong>not been used for the longest time</strong>. That
                  policy is called <strong>LRU (least recently used)</strong>.
                  The reason it works is <strong>temporal locality</strong>:
                  programs tend to read again, very soon, the data they have just
                  read, and data that has not been touched for a long time is
                  usually not needed soon either.
                </p>
                <p>
                  So the requirement list is fixed, and it is exactly LC 146:{" "}
                  <b>get(key)</b> reads, <b>put(key, value)</b> writes, and a
                  full cache evicts the least recently used entry automatically.
                  Both operations must be <b>O(1)</b>. A cache exists to be fast,
                  so if its own operations were O(n) it would defeat its purpose.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  先从需求说起。<strong>缓存(cache)</strong>是一块「快但小」的存储:
                  内存比磁盘快得多,却装不下全部数据,所以只放最可能被再次用到的那部分。
                  小就带来一个绕不开的问题 ——{" "}
                  <strong>满了以后,腾谁的位置?</strong>
                </p>
                <p>
                  经典答案:淘汰<strong>最久没被用过</strong>的那条数据,即{" "}
                  <strong>LRU(least recently used,最近最少使用)</strong>。
                  它之所以有效,是因为程序访问数据有
                  <strong>时间局部性(temporal locality)</strong>:
                  刚读过的数据很可能马上又要读,很久没碰的大概率短期内也用不上。
                </p>
                <p>
                  于是需求清单出炉,这正是 LC 146 的原题:
                  <b>get(key)</b> 读缓存、<b>put(key, value)</b> 写缓存,
                  容量满时自动淘汰最久未用的那条 —— 并且两个操作都必须 <b>O(1)</b>。
                  缓存本身是为「快」而生的,如果缓存操作自己是 O(n),它就失去了意义。
                </p>
              </>
            }
          />
        </div>

        <h3 style={{ margin: "28px 0 6px", fontSize: 18 }}>
          <T
            en="Ruling out the alternatives: why this pair?"
            zh="逐步排除:为什么偏偏是这个组合?"
          />
        </h3>
        <p className="sec-desc" style={{ marginTop: 0 }}>
          <T
            en="Do not memorize the answer. Cross out the candidates one at a time, the way you would in an interview, and the answer appears on its own."
            zh="别背结论。像面试现场一样,把候选方案一个个划掉,答案会自己浮出来。"
          />
        </p>
        <div className="adv-elim">
          <div className="adv-elim-row" data-verdict="no">
            <span className="adv-elim-badge">
              <T en="Option 1 ✕" zh="方案 1 ✕" />
            </span>
            <p>
              <T
                en={
                  <>
                    <span className="t">A hash map alone</span>
                    get and put really are O(1). But which entry do you evict
                    when it is full? A hash map spreads keys across buckets and{" "}
                    <b>has no notion of order</b>, so it cannot tell which key
                    was used least recently. To find out you would store a
                    timestamp per key and scan the whole map for the smallest
                    one: O(n). Ruled out.
                  </>
                }
                zh={
                  <>
                    <span className="t">只用哈希表</span>
                    get/put 确实 O(1) —— 但满了以后淘汰谁?哈希表把 key 打散存放,
                    <b>本身没有顺序概念</b>,不知道谁最久没被用过。想知道就得给每个
                    key 记时间戳再全表扫一遍找最小值:O(n),出局。
                  </>
                }
              />
            </p>
          </div>
          <div className="adv-elim-row" data-verdict="no">
            <span className="adv-elim-badge">
              <T en="Option 2 ✕" zh="方案 2 ✕" />
            </span>
            <p>
              <T
                en={
                  <>
                    <span className="t">
                      An array or a list alone, kept in access order
                    </span>
                    Keep the entries in a line ordered by last use: whatever is
                    accessed moves to the front, and the last one is the eviction
                    candidate. The order works. But get(key) must{" "}
                    <b>find</b> the entry first, and there is no index to compute
                    and no hash to look up, so you scan from the front: O(n).
                    Ruled out.
                  </>
                }
                zh={
                  <>
                    <span className="t">只用数组或链表(按访问时间排)</span>
                    把数据按最近使用排成一排:谁被访问就搬到最前面,末尾就是该淘汰的
                    —— 顺序有了。但 get(key) 要先<b>找到</b>这条数据:
                    没有下标可算、没有哈希可查,只能从头扫,O(n),出局。
                  </>
                }
              />
            </p>
          </div>
          <div className="adv-elim-row" data-verdict="no">
            <span className="adv-elim-badge">
              <T en="Option 3 ✕" zh="方案 3 ✕" />
            </span>
            <p>
              <T
                en={
                  <>
                    <span className="t">
                      Array + hash map (the map stores the index)
                    </span>
                    The map locates the array index in O(1), and the array keeps
                    the order. But moving the accessed element to the front means{" "}
                    <b>deleting from the middle and inserting at the front</b> of
                    an array. As chapter 1 showed, every element after it shifts,
                    which is O(n), and it also invalidates a whole range of
                    indices stored in the map. Ruled out.
                  </>
                }
                zh={
                  <>
                    <span className="t">数组 + 哈希表(哈希存下标)</span>
                    哈希 O(1) 定位到数组下标,顺序也有 —— 可「把刚访问的元素搬到最前」
                    是数组的<b>中间删除 + 头部插入</b>:第 1 章数过,后面所有元素都要搬移,
                    O(n),还会让哈希表里一大片下标失效。出局。
                  </>
                }
              />
            </p>
          </div>
          <div className="adv-elim-row" data-verdict="no">
            <span className="adv-elim-badge">
              <T en="Option 4 ✕" zh="方案 4 ✕" />
            </span>
            <p>
              <T
                en={
                  <>
                    <span className="t">
                      Singly linked list + hash map (the map stores the node)
                    </span>
                    Very close. The map stores key to list node, so you reach the
                    node in one step, and list insertion and removal are O(1)
                    once you hold the right node. But <b>unlinking</b> a node
                    from the middle means setting the predecessor&apos;s next
                    pointer to this node&apos;s next, and{" "}
                    <b>a singly linked node cannot reach its predecessor</b>.
                    Finding it means scanning from the head: O(n). One pointer
                    short.
                  </>
                }
                zh={
                  <>
                    <span className="t">单链表 + 哈希表(哈希存节点引用)</span>
                    最接近了!哈希表存「key → 链表节点」,一步定位到节点,
                    拿到节点后链表插删又是 O(1)……但把节点从链表中间<b>摘下来</b>,
                    要把前驱的 next 指到自己的 next 上 ——{" "}
                    <b>单链表的节点拿不到自己的前驱</b>,找前驱只能从头扫,O(n)。就差一根指针。
                  </>
                }
              />
            </p>
          </div>
          <div className="adv-elim-row" data-verdict="ok">
            <span className="adv-elim-badge">
              <T en="Option 5 ✓" zh="方案 5 ✓" />
            </span>
            <p>
              <T
                en={
                  <>
                    <span className="t">Doubly linked list + hash map</span>
                    Give every node a prev pointer. Now unlinking has both
                    neighbours at hand, so <b>removal is O(1) and inserting at
                    the head is O(1)</b>, and the hash map still locates any node
                    in O(1). The map answers &quot;where is this key&quot; and
                    the list answers &quot;how old is it&quot;. Each
                    structure&apos;s O(n) operation is handled by the other one.
                    This is the standard LRU design.
                  </>
                }
                zh={
                  <>
                    <span className="t">双向链表 + 哈希表</span>
                    给每个节点补上 prev 指针:摘除时前驱后继都在手里,<b>O(1) 摘除、O(1)
                    头插</b>;哈希表依然 O(1) 定位。哈希表回答「在哪」,双向链表回答「多旧」——
                    各自 O(n) 的那件事,恰好由对方来做。这就是 LRU 的标准拼法。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "Common mistake: \"list search is O(n), so LRU is O(n)\"",
            zh: "常见误区:「链表查找 O(n),所以 LRU 是 O(n)」",
          }}
        >
          <T
            en={
              <p>
                That is wrong, because <b>nothing in an LRU cache ever walks the
                list to find a node</b>. Locating a node always goes through the
                hash map, which maps a key straight to a node reference. The list
                is used only after the node is already in hand, to unlink it and
                relink it at the head, and those are pointer updates in O(1).
                Each structure does only the operation it is fast at.
              </p>
            }
            zh={
              <p>
                这是错的。LRU 里<b>从来没有人遍历链表去查找节点</b>:
                定位永远走哈希表(key → 节点引用,一步到位),
                链表只在「已经拿到节点」之后做摘除和头插 —— 全是改几根指针的 O(1) 操作。
                两个结构各做各自快的那件事。
              </p>
            }
          />
        </Callout>

        <LRUAnatomy />

        <div className="prose">
          <T
            en={
              <p>
                There are only three rules, and all of them are O(1). ①{" "}
                <strong>
                  A get that hits moves the node to the head of the list
                </strong>
                , which records that it was just used. ②{" "}
                <strong>
                  A put of a new key links a node at the head and adds a hash map
                  entry
                </strong>
                . ③{" "}
                <strong>
                  When the cache is full, unlink the last real node
                </strong>{" "}
                (tail.prev, the least recently used one) and delete its hash map
                entry in the same step. Run a few operations yourself:
              </p>
            }
            zh={
              <p>
                规则只有三条,全部 O(1):①{" "}
                <strong>get 命中 → 把节点搬到链表头部</strong>(记录它刚被用过);②{" "}
                <strong>put 新 key → 头插 + 写入哈希条目</strong>;③{" "}
                <strong>容量满 → 摘掉最后一个真实节点</strong>
                (tail.prev,也就是最久未用的),并在同一步删掉它的哈希条目。亲手操作一遍:
              </p>
            }
          />
        </div>
        <LRULab />

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th><T en="Operation" zh="操作" /></th>
                <th><T en="What the hash map does" zh="哈希表做什么" /></th>
                <th><T en="What the list does" zh="双向链表做什么" /></th>
                <th><T en="Cost" zh="复杂度" /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b><T en="get(key), hit" zh="get(key) 命中" /></b></td>
                <td><T en="key → node reference, one step" zh="key → 节点引用,一步定位" /></td>
                <td><T en="unlink the node, insert it at the head" zh="摘除该节点,插回头部" /></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td><b><T en="get(key), miss" zh="get(key) 未命中" /></b></td>
                <td><T en="no such key, return -1" zh="查无此 key,返回 -1" /></td>
                <td><T en="not involved" zh="不参与" /></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td><b><T en="put, key exists" zh="put 已存在" /></b></td>
                <td><T en="locate the node, overwrite the value" zh="定位节点,改 value" /></td>
                <td><T en="unlink, then insert at the head" zh="摘除 + 头插" /></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td><b><T en="put, new key, not full" zh="put 新增(未满)" /></b></td>
                <td><T en="add key → new node" zh="写入 key → 新节点" /></td>
                <td><T en="insert the new node at the head" zh="新节点头插" /></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td><b><T en="put, new key, full" zh="put 新增(已满)" /></b></td>
                <td><T en="delete the evicted key's entry, add the new one" zh="删掉被淘汰 key 的条目 + 写入新条目" /></td>
                <td><T en="unlink tail.prev, insert the new node at the head" zh="摘掉 tail.prev + 新节点头插" /></td>
                <td><BigO o="1" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style={{ margin: "28px 0 6px", fontSize: 18 }}>
          <T
            en="Writing it out (LC 146)"
            zh="手写实现(LC 146 原题)"
          />
        </h3>
        <p className="sec-desc" style={{ marginTop: 0 }}>
          <T
            en="Dummy head and tail nodes come from chapter 3: put one empty node at each end and never delete them. Every insertion and removal then happens between two existing nodes, which removes all the null checks."
            zh="哑头哑尾(dummy head / tail)是第 3 章链表的老办法:头尾各放一个永不删除的空节点,插入删除就永远发生在两个已有节点之间,所有判空分支一次性消失。"
          />
        </p>
        <CodeTabs
          title="lc146_lru_cache"
          java={{
            code: {
              en: `class LRUCache {
    // the node stores the key as well as the value: when the tail node is
    // evicted, its key is needed to delete the matching hash map entry
    static class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }

    private final int cap;
    private final Map<Integer, Node> map = new HashMap<>(); // key -> node ref
    private final Node head = new Node(-1, -1);  // dummy head: head.next is newest
    private final Node tail = new Node(-1, -1);  // dummy tail: tail.prev is oldest

    public LRUCache(int capacity) {
        cap = capacity;
        head.next = tail;    // empty list: the two dummies point at each other
        tail.prev = head;    // from now on no operation needs a null check
    }

    public int get(int key) {
        Node n = map.get(key);
        if (n == null) return -1;   // the map answers "present?" in O(1)
        moveToHead(n);              // just used, so it becomes the newest
        return n.val;
    }

    public void put(int key, int value) {
        Node n = map.get(key);
        if (n != null) {            // already there: overwrite, then move to head
            n.val = value;
            moveToHead(n);
            return;
        }
        if (map.size() == cap) {    // full: evict tail.prev, the oldest node
            Node old = tail.prev;
            unlink(old);
            map.remove(old.key);    // list and map must be updated together
        }
        Node fresh = new Node(key, value);
        map.put(key, fresh);
        linkFirst(fresh);
    }

    private void unlink(Node n) {     // O(1) removal: this is why it is doubly linked
        n.prev.next = n.next;         // the predecessor is right there, no scan
        n.next.prev = n.prev;
    }

    private void linkFirst(Node n) {  // O(1) insertion right after the dummy head
        n.next = head.next;
        n.prev = head;
        head.next.prev = n;
        head.next = n;
    }

    private void moveToHead(Node n) { unlink(n); linkFirst(n); }
}`,
              zh: `class LRUCache {
    // 节点同时存 key 和 value:淘汰尾节点时,
    // 要用节点里的 key 反查哈希表删掉对应条目
    static class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }

    private final int cap;
    private final Map<Integer, Node> map = new HashMap<>(); // key -> 节点引用
    private final Node head = new Node(-1, -1);  // 哑头:head.next 是最新
    private final Node tail = new Node(-1, -1);  // 哑尾:tail.prev 是最旧

    public LRUCache(int capacity) {
        cap = capacity;
        head.next = tail;    // 空链表:哑头哑尾互指
        tail.prev = head;    // 从此增删永远不用判空
    }

    public int get(int key) {
        Node n = map.get(key);
        if (n == null) return -1;   // 哈希表 O(1) 判存在
        moveToHead(n);              // 刚用过 = 变最新,搬到头部
        return n.val;
    }

    public void put(int key, int value) {
        Node n = map.get(key);
        if (n != null) {            // 已存在:改值 + 搬到头部
            n.val = value;
            moveToHead(n);
            return;
        }
        if (map.size() == cap) {    // 满了:淘汰 tail.prev(最旧的节点)
            Node old = tail.prev;
            unlink(old);
            map.remove(old.key);    // 链表、哈希表必须一起改
        }
        Node fresh = new Node(key, value);
        map.put(key, fresh);
        linkFirst(fresh);
    }

    private void unlink(Node n) {     // O(1) 摘除 —— 这就是必须双向的原因
        n.prev.next = n.next;         // 前驱直接可得,不用从头扫
        n.next.prev = n.prev;
    }

    private void linkFirst(Node n) {  // O(1) 插到哑头之后
        n.next = head.next;
        n.prev = head;
        head.next.prev = n;
        head.next = n;
    }

    private void moveToHead(Node n) { unlink(n); linkFirst(n); }
}`,
            },
            hl: [45, 46, 47, 48],
            note: {
              en: (
                <>
                  <b>Easy to miss:</b> if Node did not store the key, evicting the
                  tail node would leave no way to find and delete its hash map
                  entry. In production code, see the LinkedHashMap version below.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>Node 里不存 key 的话,淘汰尾节点时就无法反查哈希表删除条目
                  —— 这是手写 LRU 最容易漏的细节。生产代码见下方的 LinkedHashMap 版。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Node:
    __slots__ = ("key", "val", "prev", "next")   # saves memory per node
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}                    # key -> node reference (one-step lookup)
        self.head, self.tail = Node(), Node()   # dummy head / dummy tail
        self.head.next = self.tail      # empty list: the dummies point at each other
        self.tail.prev = self.head      # from now on no null checks are needed

    def _unlink(self, n):               # O(1) removal: this needs the prev pointer
        n.prev.next = n.next            # the predecessor is right there, no scan
        n.next.prev = n.prev

    def _link_first(self, n):           # O(1) insertion right after the dummy head
        n.next = self.head.next
        n.prev = self.head
        self.head.next.prev = n
        self.head.next = n

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1                   # the map answers "present?" in O(1)
        n = self.map[key]
        self._unlink(n)                 # just used, so it becomes the newest
        self._link_first(n)             # unlink it, then put it back at the head
        return n.val

    def put(self, key: int, value: int) -> None:
        if key in self.map:             # already there: overwrite, move to head
            n = self.map[key]
            n.val = value
            self._unlink(n)
            self._link_first(n)
            return
        if len(self.map) == self.cap:   # full: evict tail.prev, the oldest node
            old = self.tail.prev
            self._unlink(old)
            del self.map[old.key]       # list and map must be updated together
        n = Node(key, value)
        self.map[key] = n
        self._link_first(n)`,
              zh: `class Node:
    __slots__ = ("key", "val", "prev", "next")   # 每个节点省一点内存
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}                    # key -> 节点引用(一步定位)
        self.head, self.tail = Node(), Node()   # 哑头 / 哑尾
        self.head.next = self.tail      # 空链表:哑头哑尾互指
        self.tail.prev = self.head      # 从此增删永远不用判空

    def _unlink(self, n):               # O(1) 摘除 —— 这一步需要 prev 指针
        n.prev.next = n.next            # 前驱直接可得,不用从头扫
        n.next.prev = n.prev

    def _link_first(self, n):           # O(1) 插到哑头之后
        n.next = self.head.next
        n.prev = self.head
        self.head.next.prev = n
        self.head.next = n

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1                   # 哈希表 O(1) 判存在
        n = self.map[key]
        self._unlink(n)                 # 刚用过 = 变最新
        self._link_first(n)             # 摘下来,插回头部
        return n.val

    def put(self, key: int, value: int) -> None:
        if key in self.map:             # 已存在:改值 + 搬到头部
            n = self.map[key]
            n.val = value
            self._unlink(n)
            self._link_first(n)
            return
        if len(self.map) == self.cap:   # 满了:淘汰 tail.prev(最旧的节点)
            old = self.tail.prev
            self._unlink(old)
            del self.map[old.key]       # 链表、哈希表必须一起改
        n = Node(key, value)
        self.map[key] = n
        self._link_first(n)`,
            },
            hl: [15, 16, 17],
            note: {
              en: (
                <>
                  In production you can use <code>collections.OrderedDict</code>,
                  which is itself a hash map plus a doubly linked list, or the{" "}
                  <code>functools.lru_cache</code> decorator. Interviews ask for
                  the hand-written version. A short version is in worked example
                  A.
                </>
              ),
              zh: (
                <>
                  生产里可以直接用 <code>collections.OrderedDict</code>
                  (它内部就是哈希表 + 双向链表)或 <code>functools.lru_cache</code>{" "}
                  装饰器 —— 但面试考的是你能不能自己写出来。快写版见精讲 A。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `class Node {
  constructor(key = 0, val = 0) {
    this.key = key; this.val = val;
    this.prev = null; this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();          // key -> node reference (one-step lookup)
    this.head = new Node();        // dummy head: head.next is the newest
    this.tail = new Node();        // dummy tail: tail.prev is the oldest
    this.head.next = this.tail;    // empty list: the dummies point at each other
    this.tail.prev = this.head;    // from now on no null checks are needed
  }

  _unlink(n) {                     // O(1) removal: this needs the prev pointer
    n.prev.next = n.next;          // the predecessor is right there, no scan
    n.next.prev = n.prev;
  }

  _linkFirst(n) {                  // O(1) insertion right after the dummy head
    n.next = this.head.next;
    n.prev = this.head;
    this.head.next.prev = n;
    this.head.next = n;
  }

  get(key) {
    const n = this.map.get(key);
    if (!n) return -1;             // the map answers "present?" in O(1)
    this._unlink(n);               // just used, so it becomes the newest
    this._linkFirst(n);            // unlink it, then put it back at the head
    return n.val;
  }

  put(key, value) {
    let n = this.map.get(key);
    if (n) {                       // already there: overwrite, move to head
      n.val = value;
      this._unlink(n);
      this._linkFirst(n);
      return;
    }
    if (this.map.size === this.cap) {  // full: evict tail.prev
      const old = this.tail.prev;
      this._unlink(old);
      this.map.delete(old.key);        // list and map must be updated together
    }
    n = new Node(key, value);
    this.map.set(key, n);
    this._linkFirst(n);
  }
}`,
              zh: `class Node {
  constructor(key = 0, val = 0) {
    this.key = key; this.val = val;
    this.prev = null; this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();          // key -> 节点引用(一步定位)
    this.head = new Node();        // 哑头:head.next 是最新
    this.tail = new Node();        // 哑尾:tail.prev 是最旧
    this.head.next = this.tail;    // 空链表:哑头哑尾互指
    this.tail.prev = this.head;    // 从此增删永远不用判空
  }

  _unlink(n) {                     // O(1) 摘除 —— 这一步需要 prev 指针
    n.prev.next = n.next;          // 前驱直接可得,不用从头扫
    n.next.prev = n.prev;
  }

  _linkFirst(n) {                  // O(1) 插到哑头之后
    n.next = this.head.next;
    n.prev = this.head;
    this.head.next.prev = n;
    this.head.next = n;
  }

  get(key) {
    const n = this.map.get(key);
    if (!n) return -1;             // 哈希表 O(1) 判存在
    this._unlink(n);               // 刚用过 = 变最新
    this._linkFirst(n);            // 摘下来,插回头部
    return n.val;
  }

  put(key, value) {
    let n = this.map.get(key);
    if (n) {                       // 已存在:改值 + 搬到头部
      n.val = value;
      this._unlink(n);
      this._linkFirst(n);
      return;
    }
    if (this.map.size === this.cap) {  // 满了:淘汰 tail.prev
      const old = this.tail.prev;
      this._unlink(old);
      this.map.delete(old.key);        // 链表、哈希表必须一起改
    }
    n = new Node(key, value);
    this.map.set(key, n);
    this._linkFirst(n);
  }
}`,
            },
            hl: [18, 19, 20, 21],
            note: {
              en: (
                <>
                  A JavaScript <code>Map</code> already remembers insertion
                  order, so you can simulate LRU by deleting and re-inserting a
                  key (the short version in worked example A). That is the engine
                  maintaining a hash table plus an ordered structure for you; the
                  principle is the same.
                </>
              ),
              zh: (
                <>
                  JS 的 <code>Map</code> 本身记住插入顺序,可以用「删了再插」模拟 LRU
                  (精讲 A 的快写版)—— 那是引擎替你维护的哈希表 + 有序结构,原理一模一样。
                </>
              ),
            },
          }}
        />

        <Callout
          tone="story"
          title={{
            en: "Java already ships this machine",
            zh: "Java 里已经有这台机器",
          }}
        >
          <T
            en={
              <p>
                The name of <code>LinkedHashMap</code> in the JDK says what it
                is: <b>Linked</b> (a doubly linked list) plus <b>HashMap</b> (a
                hash table). Every Entry sits in a hash bucket and also carries
                before/after pointers that link all entries into one doubly
                linked list. That is the machine you just wrote by hand. The
                constructor argument <code>accessOrder = true</code> makes the
                list follow access order instead of insertion order, and one
                overridden hook method completes the cache.
              </p>
            }
            zh={
              <p>
                JDK 里的 <code>LinkedHashMap</code>,名字就说明了一切:<b>Linked</b>
                (双向链表)+ <b>HashMap</b>(哈希表)。它的每个 Entry 除了挂在哈希桶里,
                还带 before/after 指针串成一条双向链表 —— 就是我们刚手写的那台机器。
                构造参数 <code>accessOrder = true</code> 让链表按访问序而不是插入序排列,
                再覆写一个钩子方法就成了。
              </p>
            }
          />
        </Callout>
        <CodeBlock
          lang="java"
          title={{
            en: "LRU with LinkedHashMap (accepted on LC 146)",
            zh: "LinkedHashMap 版 LRU(能直接过 LC 146)",
          }}
          code={{
            en: `class LRUCache extends LinkedHashMap<Integer, Integer> {
    private final int cap;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);  // accessOrder=true: each access moves the entry to the end
        this.cap = capacity;
    }

    public int get(int key) { return super.getOrDefault(key, -1); }

    public void put(int key, int value) { super.put(key, value); }

    @Override  // called after every put: returning true deletes the eldest entry
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > cap;
    }
}`,
            zh: `class LRUCache extends LinkedHashMap<Integer, Integer> {
    private final int cap;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);  // accessOrder=true:每次访问把条目搬到链表尾
        this.cap = capacity;
    }

    public int get(int key) { return super.getOrDefault(key, -1); }

    public void put(int key, int value) { super.put(key, value); }

    @Override  // 每次 put 后被回调:返回 true 就删掉最老的那个条目
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > cap;
    }
}`,
          }}
          hl={[5, 14, 15]}
          note={{
            en: (
              <>
                In an interview, write the full version first to show you
                understand the design, then add that in production you would use
                LinkedHashMap, because it is the same hash map plus doubly linked
                list.
              </>
            ),
            zh: (
              <>
                面试时先手写完整版说明你懂这个设计,再补一句「生产里我会用
                LinkedHashMap,它内部就是哈希表 + 双向链表」。
              </>
            ),
          }}
        />

        <Callout
          tone="deep"
          title={{ en: "Where LRU runs in practice", zh: "工程现场:LRU 无处不在" }}
        >
          <T
            en={
              <p>
                <b>Redis</b>: with <code>maxmemory-policy allkeys-lru</code>,
                Redis evicts by LRU when memory runs low. It uses an{" "}
                <b>approximate LRU</b>: keeping one global list of hundreds of
                millions of keys would cost too much memory for the pointers, so
                Redis samples a few keys at random and evicts the least recently
                used one among them. That trades a little accuracy for a large
                memory saving.
                <b> Browsers</b>: HTTP caches and decoded-image caches control
                their size with LRU variants.
                <b> Operating systems</b>: when physical memory runs out, the
                system must choose which page to write to disk. Common page
                replacement algorithms such as Clock are also approximations of
                LRU, because exact LRU would require updating a list on every
                single memory access.
              </p>
            }
            zh={
              <p>
                <b>Redis</b>:配置 <code>maxmemory-policy allkeys-lru</code> 后,
                内存吃紧时按 LRU 淘汰。它用的是<b>近似 LRU</b>:
                给几亿个 key 维护一条全局链表,光指针就太费内存,
                所以 Redis 每次随机采样几个 key,淘汰其中最久未用的 ——
                用一点点精度换大量内存。
                <b> 浏览器</b>:HTTP 缓存、图片解码缓存的容量控制都是 LRU 的变体。
                <b> 操作系统</b>:物理内存不够时要选一个页面换出到磁盘,
                主流的页面置换算法(如 Clock)同样是 LRU 的近似 ——
                精确 LRU 要求每次内存访问都更新链表,代价太高。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §03 LFU ================= */}
      <Section
        id="lfu"
        index="03"
        title={{ en: "LFU: adding one more dimension", zh: "LFU:再加一个维度" }}
        desc={{
          en: "Least frequently used — evict by use count, and how LC 460 (hard) reaches O(1)",
          zh: "Least Frequently Used —— 按「用过几次」淘汰,LC 460(Hard)一节带过",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  LRU asks <strong>how long ago</strong> an entry was used. LFU
                  asks <strong>how often</strong> it has been used: it evicts the
                  entry with the smallest use <strong>count</strong>, and when
                  several entries have the same count, it evicts the least
                  recently used one among them. LFU suits workloads where the
                  popular items stay popular. One very popular entry should not
                  be pushed out by a burst of one-time reads just because nobody
                  touched it for ten minutes.
                </p>
                <p>
                  Why is LFU harder than LRU? In an LRU cache the oldest entry is
                  always sitting at the tail of the list, so it is ready without
                  any work. In an LFU cache the frequency{" "}
                  <strong>changes on every access</strong>: the count goes up by
                  one, so the entry has to move to a different position in the
                  frequency order. A heap (chapter 9) would give O(log n) per
                  adjustment, and it still would not break ties by recency. The
                  O(1) solution is{" "}
                  <strong>one bucket per frequency</strong>.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  LRU 看「<strong>多久</strong>没用」,LFU 看「<strong>用了多少次</strong>」:
                  淘汰访问<strong>次数</strong>最少的;次数打平时,再淘汰其中最久未用的那个。
                  它适合热点长期稳定的场景 —— 一条被反复访问的数据即使最近 10 分钟没人碰,
                  也不该被一批一次性访问挤出缓存。
                </p>
                <p>
                  为什么 LFU 比 LRU 难一档?LRU 里「最旧」永远躺在链表尾部,天然就绪;
                  而 LFU 的频次<strong>每访问一次就变</strong>:key 的频次 +1,
                  它在「按频次排序」里的位置就要挪。用堆(第 9 章)维护最小频次?
                  每次调整是 O(log n),而且相同频次还要再比时间,做不到全 O(1)。
                  正解是<strong>按频次分桶(frequency buckets)</strong>。
                </p>
              </>
            }
          />
        </div>
        <LFUBuckets />
        <div className="prose">
          <T
            en={
              <p>
                Three pieces of state. ① A hash map{" "}
                <code>key → (value, freq)</code>. ② A hash map{" "}
                <code>freq → bucket</code>, where each bucket holds every key
                with that frequency in time order, so a bucket is itself a small
                LRU. ③ One variable <code>minFreq</code> holding the smallest
                frequency currently in use. An access moves the key from its freq
                bucket into the freq+1 bucket, which is two O(1) list operations.
                An eviction removes the oldest key in the minFreq bucket, which
                is the least recently used key among the least frequently used
                ones. minFreq needs no search either, because{" "}
                <strong>only two events change it</strong>: it goes up by 1 when
                the old bucket becomes empty (the key that just left was the last
                one in the minFreq bucket), and it resets to 1 when a new key is
                inserted, since a new key has frequency 1 and nothing can be
                lower.
              </p>
            }
            zh={
              <p>
                三份状态:① <code>key → (value, freq)</code> 哈希表;②{" "}
                <code>freq → 桶</code> 哈希表,每个桶按时间序存该频次的所有 key
                (桶内天然是个小 LRU);③ 一个 <code>minFreq</code> 变量记录当前最小频次。
                访问某 key = 把它从 freq 桶搬进 freq+1 桶(两次 O(1) 链表操作);
                淘汰 = 掐掉 minFreq 桶里最老的 key,也就是「频次最低者中最久未用的那个」。
                minFreq 同样不需要搜索:<strong>只有两种时刻它会变</strong> ——
                旧桶被搬空时 +1(刚搬走的 key 正是 minFreq 桶里最后一个),
                插入新 key 时归 1(新 key 频次必为 1,不可能更小)。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="lc460_lfu_core"
          java={{
            code: {
              en: `class LFUCache {
    private final int cap;
    private final Map<Integer, Integer> vals = new HashMap<>();
    private final Map<Integer, Integer> freq = new HashMap<>();
    // frequency -> the keys with that frequency; LinkedHashSet keeps
    // insertion order, so each bucket is a small LRU
    private final Map<Integer, LinkedHashSet<Integer>> buckets = new HashMap<>();
    private int minFreq = 0;

    public LFUCache(int capacity) { this.cap = capacity; }

    private void touch(int key) {              // one access: freq + 1, change bucket
        int f = freq.get(key);
        buckets.get(f).remove(key);
        if (buckets.get(f).isEmpty() && f == minFreq)
            minFreq++;                         // old bucket is empty: minimum moves up
        freq.put(key, f + 1);
        buckets.computeIfAbsent(f + 1, k -> new LinkedHashSet<>()).add(key);
    }

    public int get(int key) {
        if (!vals.containsKey(key)) return -1;
        touch(key);
        return vals.get(key);
    }

    public void put(int key, int value) {
        if (cap == 0) return;
        if (vals.containsKey(key)) {           // already there: overwrite, freq + 1
            vals.put(key, value);
            touch(key);
            return;
        }
        if (vals.size() == cap) {              // evict the oldest key in the minFreq bucket
            int old = buckets.get(minFreq).iterator().next();
            buckets.get(minFreq).remove(old);
            vals.remove(old);
            freq.remove(old);
        }
        vals.put(key, value);
        freq.put(key, 1);
        buckets.computeIfAbsent(1, k -> new LinkedHashSet<>()).add(key);
        minFreq = 1;                           // a new key has frequency 1, the minimum
    }
}`,
              zh: `class LFUCache {
    private final int cap;
    private final Map<Integer, Integer> vals = new HashMap<>();
    private final Map<Integer, Integer> freq = new HashMap<>();
    // 频次 -> 该频次的 key 集合;LinkedHashSet 保留插入序,
    // 所以每个桶本身就是一个小 LRU
    private final Map<Integer, LinkedHashSet<Integer>> buckets = new HashMap<>();
    private int minFreq = 0;

    public LFUCache(int capacity) { this.cap = capacity; }

    private void touch(int key) {              // 访问一次:频次 +1,换桶
        int f = freq.get(key);
        buckets.get(f).remove(key);
        if (buckets.get(f).isEmpty() && f == minFreq)
            minFreq++;                         // 旧桶空了,最小频次上移
        freq.put(key, f + 1);
        buckets.computeIfAbsent(f + 1, k -> new LinkedHashSet<>()).add(key);
    }

    public int get(int key) {
        if (!vals.containsKey(key)) return -1;
        touch(key);
        return vals.get(key);
    }

    public void put(int key, int value) {
        if (cap == 0) return;
        if (vals.containsKey(key)) {           // 已存在:改值,频次 +1
            vals.put(key, value);
            touch(key);
            return;
        }
        if (vals.size() == cap) {              // 淘汰 minFreq 桶里最老的 key
            int old = buckets.get(minFreq).iterator().next();
            buckets.get(minFreq).remove(old);
            vals.remove(old);
            freq.remove(old);
        }
        vals.put(key, value);
        freq.put(key, 1);
        buckets.computeIfAbsent(1, k -> new LinkedHashSet<>()).add(key);
        minFreq = 1;                           // 新 key 频次为 1,即当前最小
    }
}`,
            },
            hl: [15, 16, 43],
            note: {
              en: (
                <>
                  A <code>LinkedHashSet</code> is a hash table plus a doubly
                  linked list, the same pair as in LRU, so{" "}
                  <code>iterator().next()</code> returns the oldest key in the
                  bucket. The two highlighted places are the only ones that ever
                  change minFreq.
                </>
              ),
              zh: (
                <>
                  <code>LinkedHashSet</code> = 哈希表 + 双向链表(又是这对组合),
                  <code>iterator().next()</code> 拿到的就是桶里最老的 key。
                  高亮的两处是全代码中唯二会改动 minFreq 的地方。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `from collections import defaultdict, OrderedDict

class LFUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.kv = {}                      # key -> (val, freq)
        # freq -> its keys (OrderedDict keeps insertion order: a small LRU)
        self.buckets = defaultdict(OrderedDict)
        self.min_freq = 0

    def _touch(self, key):                # one access: freq + 1, change bucket
        val, f = self.kv[key]
        del self.buckets[f][key]
        if not self.buckets[f] and f == self.min_freq:
            self.min_freq += 1            # old bucket is empty: minimum moves up
        self.buckets[f + 1][key] = None
        self.kv[key] = (val, f + 1)

    def get(self, key: int) -> int:
        if key not in self.kv:
            return -1
        self._touch(key)
        return self.kv[key][0]

    def put(self, key: int, value: int) -> None:
        if self.cap == 0:
            return
        if key in self.kv:                # already there: overwrite, freq + 1
            self._touch(key)
            self.kv[key] = (value, self.kv[key][1])
            return
        if len(self.kv) == self.cap:      # evict the oldest key in the min_freq bucket
            old, _ = self.buckets[self.min_freq].popitem(last=False)
            del self.kv[old]
        self.kv[key] = (value, 1)
        self.buckets[1][key] = None
        self.min_freq = 1                 # a new key has frequency 1, the minimum`,
              zh: `from collections import defaultdict, OrderedDict

class LFUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.kv = {}                      # key -> (val, freq)
        # freq -> 该频次的 key(OrderedDict 保插入序 = 桶内就是小 LRU)
        self.buckets = defaultdict(OrderedDict)
        self.min_freq = 0

    def _touch(self, key):                # 访问一次:频次 +1,换桶
        val, f = self.kv[key]
        del self.buckets[f][key]
        if not self.buckets[f] and f == self.min_freq:
            self.min_freq += 1            # 旧桶空了,最小频次上移
        self.buckets[f + 1][key] = None
        self.kv[key] = (val, f + 1)

    def get(self, key: int) -> int:
        if key not in self.kv:
            return -1
        self._touch(key)
        return self.kv[key][0]

    def put(self, key: int, value: int) -> None:
        if self.cap == 0:
            return
        if key in self.kv:                # 已存在:改值,频次 +1
            self._touch(key)
            self.kv[key] = (value, self.kv[key][1])
            return
        if len(self.kv) == self.cap:      # 淘汰 min_freq 桶里最老的 key
            old, _ = self.buckets[self.min_freq].popitem(last=False)
            del self.kv[old]
        self.kv[key] = (value, 1)
        self.buckets[1][key] = None
        self.min_freq = 1                 # 新 key 频次为 1,即当前最小`,
            },
            hl: [14, 15, 37],
            note: {
              en: (
                <>
                  <code>popitem(last=False)</code> pops from the front of an
                  OrderedDict, which is the oldest key in that bucket. There is
                  no loop anywhere in this class, which is the direct evidence
                  that every operation is O(1).
                </>
              ),
              zh: (
                <>
                  <code>popitem(last=False)</code> 从 OrderedDict 头部弹出,
                  正是桶里最老的 key。整份代码没有一处循环 —— 这就是全 O(1) 的直接证据。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `class LFUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.kv = new Map();        // key -> { val, freq }
    this.buckets = new Map();   // freq -> Set (a JS Set keeps insertion order)
    this.minFreq = 0;
  }

  _touch(key) {                 // one access: freq + 1, change bucket
    const e = this.kv.get(key);
    const bucket = this.buckets.get(e.freq);
    bucket.delete(key);
    if (bucket.size === 0 && e.freq === this.minFreq)
      this.minFreq++;           // old bucket is empty: minimum moves up
    e.freq++;
    if (!this.buckets.has(e.freq)) this.buckets.set(e.freq, new Set());
    this.buckets.get(e.freq).add(key);
  }

  get(key) {
    if (!this.kv.has(key)) return -1;
    this._touch(key);
    return this.kv.get(key).val;
  }

  put(key, value) {
    if (this.cap === 0) return;
    if (this.kv.has(key)) {     // already there: overwrite, freq + 1
      this.kv.get(key).val = value;
      this._touch(key);
      return;
    }
    if (this.kv.size === this.cap) {  // evict the oldest key in the minFreq bucket
      const old = this.buckets.get(this.minFreq).values().next().value;
      this.buckets.get(this.minFreq).delete(old);
      this.kv.delete(old);
    }
    this.kv.set(key, { val: value, freq: 1 });
    if (!this.buckets.has(1)) this.buckets.set(1, new Set());
    this.buckets.get(1).add(key);
    this.minFreq = 1;           // a new key has frequency 1, the minimum
  }
}`,
              zh: `class LFUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.kv = new Map();        // key -> { val, freq }
    this.buckets = new Map();   // freq -> Set(JS 的 Set 保留插入顺序)
    this.minFreq = 0;
  }

  _touch(key) {                 // 访问一次:频次 +1,换桶
    const e = this.kv.get(key);
    const bucket = this.buckets.get(e.freq);
    bucket.delete(key);
    if (bucket.size === 0 && e.freq === this.minFreq)
      this.minFreq++;           // 旧桶空了,最小频次上移
    e.freq++;
    if (!this.buckets.has(e.freq)) this.buckets.set(e.freq, new Set());
    this.buckets.get(e.freq).add(key);
  }

  get(key) {
    if (!this.kv.has(key)) return -1;
    this._touch(key);
    return this.kv.get(key).val;
  }

  put(key, value) {
    if (this.cap === 0) return;
    if (this.kv.has(key)) {     // 已存在:改值,频次 +1
      this.kv.get(key).val = value;
      this._touch(key);
      return;
    }
    if (this.kv.size === this.cap) {  // 淘汰 minFreq 桶里最老的 key
      const old = this.buckets.get(this.minFreq).values().next().value;
      this.buckets.get(this.minFreq).delete(old);
      this.kv.delete(old);
    }
    this.kv.set(key, { val: value, freq: 1 });
    if (!this.buckets.has(1)) this.buckets.set(1, new Set());
    this.buckets.get(1).add(key);
    this.minFreq = 1;           // 新 key 频次为 1,即当前最小
  }
}`,
            },
            hl: [13, 14, 41],
            note: {
              en: (
                <>
                  JavaScript <code>Set</code> and <code>Map</code> both remember
                  insertion order, so a Set works directly as a time-ordered
                  bucket, and <code>values().next().value</code> returns its
                  oldest member.
                </>
              ),
              zh: (
                <>
                  JS 的 <code>Set</code> / <code>Map</code> 都记住插入顺序,
                  所以 Set 直接就能当「按时间排序的桶」用,
                  <code>values().next().value</code> 拿到的就是最老的成员。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="warn"
          title={{
            en: "LRU or LFU? Each has a failure mode",
            zh: "LRU 还是 LFU?两者各有失效场景",
          }}
        >
          <T
            en={
              <p>
                LFU&apos;s weakness is that{" "}
                <b>a formerly popular entry takes a long time to leave</b>. An
                entry that was read tens of thousands of times yesterday and is
                never read again still has a very high count, so new entries need
                a long time to push it out. In practice this is fixed by decaying
                the counts over time; the Redis LFU policy has a decay factor.
                LRU&apos;s weakness is that{" "}
                <b>a single large scan destroys it</b>: one full-table read
                touches every row once and flushes the genuinely hot data out of
                the cache. Redis offers both policies so you can pick the one
                that matches your access pattern.
              </p>
            }
            zh={
              <p>
                LFU 的软肋:<b>旧热点退役慢</b> —— 一条昨天被读了几万次、
                今天再没人碰的数据,频次依然很高,新数据要很久才能把它挤出去
                (工程上用「频次随时间衰减」来修,Redis 的 LFU 策略就带衰减因子)。
                LRU 的软肋:<b>怕一次全量扫描</b> —— 一次全表遍历把每行都读一遍,
                会把真正的热数据全部冲出缓存。所以 Redis 两种策略都提供,
                按业务的访问模式选。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §04 线段树 ================= */}
      <Section
        id="segtree"
        index="04"
        title={{
          en: "Segment tree: a binary tree over ranges",
          zh: "线段树:给区间装一棵二叉树",
        }}
        desc={{
          en: "Range query and point update, both O(log n)",
          zh: "Segment Tree —— 又能改、又能查,双 O(log n)",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                A different kind of requirement. Given an array, you are asked
                many times for the <strong>sum of the range l to r</strong>. The{" "}
                <strong>prefix sum</strong> from chapter 1 already solves that:
                build the table once, then every query is O(1). Now add one
                condition: <strong>the elements can be modified</strong>.
                Changing a single <code>a[i]</code> invalidates every prefix sum
                after it, so the table has to be rebuilt in O(n). With 100,000
                updates that is 100,000 rebuilds, and prefix sums stop being
                usable.
              </p>
            }
            zh={
              <p>
                换一类需求。给一个数组,反复问「下标 l 到 r 的
                <strong>区间和</strong>是多少」—— 第 1 章的<strong>前缀和</strong>
                就能解决:预处理一遍,每次查询 O(1)。
                但加一个条件:<strong>数组元素还会被修改</strong>。改一个{" "}
                <code>a[i]</code>,它后面的所有前缀和全部作废,重建要 O(n) ——
                改 10 万次就是 10 万次重建,前缀和不再可用。
              </p>
            }
          />
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th><T en="Approach" zh="方案" /></th>
                <th><T en="Update one element" zh="改一个元素" /></th>
                <th><T en="One range sum query" zh="查一次区间和" /></th>
                <th><T en="Verdict" zh="结论" /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b><T en="Plain array" zh="数组直存" /></b></td>
                <td><BigO o="1" /></td>
                <td><BigO o="n" /></td>
                <td><T en="Fast to update, slow to query. Fails when queries are frequent." zh="改得快查得慢 —— 查询一多就不行" /></td>
              </tr>
              <tr>
                <td><b><T en="Prefix sums" zh="前缀和" /></b></td>
                <td><BigO o="n" label={{ en: "O(n) rebuild", zh: "O(n) 重建" }} /></td>
                <td><BigO o="1" /></td>
                <td><T en="Fast to query, slow to update. Fails when updates are frequent." zh="查得快改得慢 —— 修改一多就不行" /></td>
              </tr>
              <tr>
                <td><b><T en="Segment tree" zh="线段树" /></b></td>
                <td><BigO o="logn" /></td>
                <td><BigO o="logn" /></td>
                <td><T en="Neither operation is the fastest possible, but neither one collapses." zh="两个操作都不是最快,但两个都不会崩" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                Between those two extremes you want something where neither
                operation is bad. Split the whole range in half, and keep
                splitting until every part is a single element. That gives a
                binary tree (chapter 7), and{" "}
                <strong>each node stores the sum of its own range</strong>. The
                knowledge about sums is now spread over O(n) nodes, and any
                single update or query only has to touch O(log n) of them.
              </p>
            }
            zh={
              <p>
                两个极端之间,需要一个「改和查都不太差」的方案。做法是把整个区间对半劈开,
                一直劈到每段只剩一个元素,于是得到一棵二叉树(第 7 章),
                <strong>每个节点存自己那段区间的和</strong>。
                这样「和的信息」被分摊到 O(n) 个节点上,任何一次修改或查询,
                都只需要动其中 O(log n) 个。
              </p>
            }
          />
        </div>
        <SegAnatomy />
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-title">
              <T
                en="update: change a leaf, then walk up"
                zh="update:改叶子,一路向上"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    To change <code>a[i]</code>, descend from the root, halving
                    the range each time, until you reach that leaf, and write the
                    new value. On the way back up, recompute the sum of{" "}
                    <b>every ancestor on the path</b> as left child + right
                    child. The number of nodes touched equals the height of the
                    tree, so it is <b>O(log n)</b>. Every other node still holds
                    a correct sum, and that is what makes it better than prefix
                    sums here.
                  </>
                }
                zh={
                  <>
                    要改 <code>a[i]</code>:从根一路二分下潜找到那片叶子并改掉,
                    回溯时把<b>路径上每个祖先</b>的和重算一遍(= 左孩子 + 右孩子)。
                    被动到的节点数 = 树高 = <b>O(log n)</b>;其余节点存的和依然正确 ——
                    这正是它比前缀和强的地方。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <T en="query: three cases per node" zh="query:每个节点三种情况" />
            </div>
            <p>
              <T
                en={
                  <>
                    To get the sum of [l,r], every node is in one of three
                    situations. <b>① No overlap</b> with [l,r]: return 0.{" "}
                    <b>② Fully inside [l,r]</b>: return the stored sum and stop
                    descending. <b>③ Partial overlap</b>: split and ask both
                    children. At most 2 nodes per level end up in case ③, so the
                    total number of visited nodes is <b>O(log n)</b>.
                  </>
                }
                zh={
                  <>
                    问 [l,r] 的和,每个节点只有三种处境:<b>① 完全不相交</b> → 返回 0;
                    <b>② 整段落在 [l,r] 内</b> → 直接返回存好的和,不再下探;
                    <b>③ 部分相交</b> → 劈开问两个孩子。每层最多有 2 个节点落到情况 ③,
                    所以总访问量是 <b>O(log n)</b>。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <div className="prose" style={{ marginTop: 8 }}>
          <T
            en={
              <p>
                Try it yourself. In update mode, click a leaf and watch one path
                from the leaf to the root light up. In query mode, set a range
                and watch which nodes are fully covered: the green nodes hand
                over a stored sum directly, without ever descending to a leaf.
              </p>
            }
            zh={
              <p>
                亲手试一遍:改值模式点一个叶子,看一条「从叶到根」的更新路径;
                查询模式圈定一个区间,看哪些节点被整段命中 ——
                绿色节点直接交出存好的和,一次都不用下探到叶子。
              </p>
            }
          />
        </div>
        <SegLab />

        <h3 style={{ margin: "28px 0 6px", fontSize: 18 }}>
          <T en="Writing it out (LC 307)" zh="手写实现(LC 307 原题)" />
        </h3>
        <div className="prose" style={{ marginTop: 0, marginBottom: 14 }}>
          <T
            en={
              <p>
                The tree is stored in a plain array: tree[1] is the root, and the
                children of node i are 2i and 2i+1, the same layout as the heap
                in chapter 9, so no node objects are created. The array is
                allocated with <b>4n</b> entries. Here is why 4n and not 2n. If n
                is a power of two, the tree is perfect: it has n leaves and n−1
                internal nodes, and the largest index used is below 2n. When n is
                not a power of two, the bottom level is incomplete, and the
                recursion can still place a leaf at an index in the level below
                the deepest full level. In the worst case the deepest index is
                under 4n, so 4n is always safe and needs no case analysis.
              </p>
            }
            zh={
              <p>
                树直接存在一个数组里:tree[1] 是根,节点 i 的孩子是 2i 和 2i+1 ——
                和第 9 章的堆同款存法,不用真的创建节点对象。数组开 <b>4n</b>。
                为什么是 4n 而不是 2n:如果 n 是 2 的幂,这棵树是满的,
                n 个叶子 + n−1 个内部节点,用到的最大下标不超过 2n;
                但 n 不是 2 的幂时,最底层不满,递归可能把叶子放到再深一层的位置上。
                最坏情况下用到的最大下标小于 4n,所以开 4n 永远安全,也不用分情况讨论。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="lc307_segment_tree"
          java={{
            code: {
              en: `class NumArray {
    private final int n;
    private final int[] tree;   // the tree in an array: children of i are 2i, 2i+1

    public NumArray(int[] nums) {
        n = nums.length;
        tree = new int[4 * n];              // 4n entries is enough in the worst case
        build(1, 0, n - 1, nums);
    }

    // build: node is responsible for the range [lo, hi]
    private void build(int node, int lo, int hi, int[] nums) {
        if (lo == hi) {                     // a leaf holds one element
            tree[node] = nums[lo];
            return;
        }
        int mid = (lo + hi) / 2;
        build(2 * node, lo, mid, nums);          // left child takes the left half
        build(2 * node + 1, mid + 1, hi, nums);  // right child takes the right half
        tree[node] = tree[2 * node] + tree[2 * node + 1]; // parent = left + right
    }

    public void update(int index, int val) {
        update(1, 0, n - 1, index, val);
    }

    private void update(int node, int lo, int hi, int i, int val) {
        if (lo == hi) {                     // reached the leaf, write the value
            tree[node] = val;
            return;
        }
        int mid = (lo + hi) / 2;
        if (i <= mid) update(2 * node, lo, mid, i, val);
        else update(2 * node + 1, mid + 1, hi, i, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1]; // on the way back up
    }

    public int sumRange(int left, int right) {
        return query(1, 0, n - 1, left, right);
    }

    private int query(int node, int lo, int hi, int l, int r) {
        if (r < lo || hi < l) return 0;         // 1. no overlap: contributes 0
        if (l <= lo && hi <= r) return tree[node]; // 2. fully inside: return the sum
        int mid = (lo + hi) / 2;                // 3. partial overlap: split
        return query(2 * node, lo, mid, l, r)
             + query(2 * node + 1, mid + 1, hi, l, r);
    }
}`,
              zh: `class NumArray {
    private final int n;
    private final int[] tree;   // 数组存树:节点 i 的孩子是 2i、2i+1

    public NumArray(int[] nums) {
        n = nums.length;
        tree = new int[4 * n];              // 4n 空间,最坏情况也够
        build(1, 0, n - 1, nums);
    }

    // 建树:节点 node 负责区间 [lo, hi]
    private void build(int node, int lo, int hi, int[] nums) {
        if (lo == hi) {                     // 叶子 = 单个元素
            tree[node] = nums[lo];
            return;
        }
        int mid = (lo + hi) / 2;
        build(2 * node, lo, mid, nums);          // 左孩子管左半
        build(2 * node + 1, mid + 1, hi, nums);  // 右孩子管右半
        tree[node] = tree[2 * node] + tree[2 * node + 1]; // 父 = 左 + 右
    }

    public void update(int index, int val) {
        update(1, 0, n - 1, index, val);
    }

    private void update(int node, int lo, int hi, int i, int val) {
        if (lo == hi) {                     // 走到叶子,改值
            tree[node] = val;
            return;
        }
        int mid = (lo + hi) / 2;
        if (i <= mid) update(2 * node, lo, mid, i, val);
        else update(2 * node + 1, mid + 1, hi, i, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1]; // 回溯时重算
    }

    public int sumRange(int left, int right) {
        return query(1, 0, n - 1, left, right);
    }

    private int query(int node, int lo, int hi, int l, int r) {
        if (r < lo || hi < l) return 0;         // ① 完全不相交:贡献 0
        if (l <= lo && hi <= r) return tree[node]; // ② 整段被包住:直接返回
        int mid = (lo + hi) / 2;                // ③ 部分相交:劈开递归
        return query(2 * node, lo, mid, l, r)
             + query(2 * node + 1, mid + 1, hi, l, r);
    }
}`,
            },
            hl: [43, 44, 45],
            note: {
              en: (
                <>
                  Those three lines are the whole query: no overlap, fully
                  inside, partial overlap. Every segment tree problem uses this
                  same skeleton.
                </>
              ),
              zh: (
                <>
                  这三行就是查询的全部:不相交、全包住、部分相交。
                  任何线段树题都是这个骨架。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class NumArray:
    def __init__(self, nums: list[int]):
        self.n = len(nums)
        self.tree = [0] * (4 * self.n)       # 4n entries is enough in the worst case
        if self.n:
            self._build(1, 0, self.n - 1, nums)

    # build: node is responsible for the range [lo, hi]
    def _build(self, node, lo, hi, nums):
        if lo == hi:                         # a leaf holds one element
            self.tree[node] = nums[lo]
            return
        mid = (lo + hi) // 2
        self._build(2 * node, lo, mid, nums)          # left child, left half
        self._build(2 * node + 1, mid + 1, hi, nums)  # right child, right half
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def update(self, index: int, val: int) -> None:
        self._update(1, 0, self.n - 1, index, val)

    def _update(self, node, lo, hi, i, val):
        if lo == hi:                         # reached the leaf, write the value
            self.tree[node] = val
            return
        mid = (lo + hi) // 2
        if i <= mid:
            self._update(2 * node, lo, mid, i, val)
        else:
            self._update(2 * node + 1, mid + 1, hi, i, val)
        # on the way back up, recompute each ancestor on the path
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def sumRange(self, left: int, right: int) -> int:
        return self._query(1, 0, self.n - 1, left, right)

    def _query(self, node, lo, hi, l, r):
        if r < lo or hi < l:                 # 1. no overlap: contributes 0
            return 0
        if l <= lo and hi <= r:              # 2. fully inside: return the sum
            return self.tree[node]
        mid = (lo + hi) // 2                 # 3. partial overlap: split
        return (self._query(2 * node, lo, mid, l, r)
                + self._query(2 * node + 1, mid + 1, hi, l, r))`,
              zh: `class NumArray:
    def __init__(self, nums: list[int]):
        self.n = len(nums)
        self.tree = [0] * (4 * self.n)       # 4n 空间,最坏情况也够
        if self.n:
            self._build(1, 0, self.n - 1, nums)

    # 建树:节点 node 负责区间 [lo, hi]
    def _build(self, node, lo, hi, nums):
        if lo == hi:                         # 叶子 = 单个元素
            self.tree[node] = nums[lo]
            return
        mid = (lo + hi) // 2
        self._build(2 * node, lo, mid, nums)          # 左孩子管左半
        self._build(2 * node + 1, mid + 1, hi, nums)  # 右孩子管右半
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def update(self, index: int, val: int) -> None:
        self._update(1, 0, self.n - 1, index, val)

    def _update(self, node, lo, hi, i, val):
        if lo == hi:                         # 走到叶子,改值
            self.tree[node] = val
            return
        mid = (lo + hi) // 2
        if i <= mid:
            self._update(2 * node, lo, mid, i, val)
        else:
            self._update(2 * node + 1, mid + 1, hi, i, val)
        # 回溯:路径上的祖先逐个重算
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def sumRange(self, left: int, right: int) -> int:
        return self._query(1, 0, self.n - 1, left, right)

    def _query(self, node, lo, hi, l, r):
        if r < lo or hi < l:                 # ① 完全不相交:贡献 0
            return 0
        if l <= lo and hi <= r:              # ② 整段被包住:直接返回
            return self.tree[node]
        mid = (lo + hi) // 2                 # ③ 部分相交:劈开递归
        return (self._query(2 * node, lo, mid, l, r)
                + self._query(2 * node + 1, mid + 1, hi, l, r))`,
            },
            hl: [37, 38, 39, 40, 41],
            note: {
              en: (
                <>
                  The recursion depth is log n, so it will not reach
                  Python&apos;s default recursion limit of 1000. That would need
                  n larger than 2^1000.
                </>
              ),
              zh: (
                <>
                  递归深度是 log n,碰不到 Python 默认的 1000 层递归上限 ——
                  那需要 n 超过 2^1000。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `class NumArray {
  constructor(nums) {
    this.n = nums.length;
    this.tree = new Array(4 * this.n).fill(0); // 4n entries is always enough
    if (this.n) this._build(1, 0, this.n - 1, nums);
  }

  // build: node is responsible for the range [lo, hi]
  _build(node, lo, hi, nums) {
    if (lo === hi) {                    // a leaf holds one element
      this.tree[node] = nums[lo];
      return;
    }
    const mid = (lo + hi) >> 1;
    this._build(2 * node, lo, mid, nums);          // left child, left half
    this._build(2 * node + 1, mid + 1, hi, nums);  // right child, right half
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }

  update(index, val) { this._update(1, 0, this.n - 1, index, val); }

  _update(node, lo, hi, i, val) {
    if (lo === hi) {                    // reached the leaf, write the value
      this.tree[node] = val;
      return;
    }
    const mid = (lo + hi) >> 1;
    if (i <= mid) this._update(2 * node, lo, mid, i, val);
    else this._update(2 * node + 1, mid + 1, hi, i, val);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1]; // on the way up
  }

  sumRange(left, right) { return this._query(1, 0, this.n - 1, left, right); }

  _query(node, lo, hi, l, r) {
    if (r < lo || hi < l) return 0;             // 1. no overlap: contributes 0
    if (l <= lo && hi <= r) return this.tree[node]; // 2. fully inside: return it
    const mid = (lo + hi) >> 1;                 // 3. partial overlap: split
    return this._query(2 * node, lo, mid, l, r)
         + this._query(2 * node + 1, mid + 1, hi, l, r);
  }
}`,
              zh: `class NumArray {
  constructor(nums) {
    this.n = nums.length;
    this.tree = new Array(4 * this.n).fill(0); // 4n 空间,最坏情况也够
    if (this.n) this._build(1, 0, this.n - 1, nums);
  }

  // 建树:节点 node 负责区间 [lo, hi]
  _build(node, lo, hi, nums) {
    if (lo === hi) {                    // 叶子 = 单个元素
      this.tree[node] = nums[lo];
      return;
    }
    const mid = (lo + hi) >> 1;
    this._build(2 * node, lo, mid, nums);          // 左孩子管左半
    this._build(2 * node + 1, mid + 1, hi, nums);  // 右孩子管右半
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }

  update(index, val) { this._update(1, 0, this.n - 1, index, val); }

  _update(node, lo, hi, i, val) {
    if (lo === hi) {                    // 走到叶子,改值
      this.tree[node] = val;
      return;
    }
    const mid = (lo + hi) >> 1;
    if (i <= mid) this._update(2 * node, lo, mid, i, val);
    else this._update(2 * node + 1, mid + 1, hi, i, val);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1]; // 回溯重算
  }

  sumRange(left, right) { return this._query(1, 0, this.n - 1, left, right); }

  _query(node, lo, hi, l, r) {
    if (r < lo || hi < l) return 0;             // ① 完全不相交:贡献 0
    if (l <= lo && hi <= r) return this.tree[node]; // ② 整段被包住:直接返回
    const mid = (lo + hi) >> 1;                 // ③ 部分相交:劈开递归
    return this._query(2 * node, lo, mid, l, r)
         + this._query(2 * node + 1, mid + 1, hi, l, r);
  }
}`,
            },
            hl: [36, 37, 38],
            note: {
              en: (
                <>
                  <code>(lo + hi) &gt;&gt; 1</code> is integer division by 2
                  written as a bit shift. JavaScript numbers are floating point,
                  so for very large sums keep the safe integer limit of 2^53 in
                  mind.
                </>
              ),
              zh: (
                <>
                  <code>(lo + hi) &gt;&gt; 1</code> 是用位运算写的整除 2;
                  JS 的数字是浮点数,和特别大时要注意 2^53 的安全整数上限。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "Two extensions worth knowing by name",
            zh: "点到为止:线段树的两个延伸",
          }}
        >
          <T
            en={
              <p>
                Replace <code>+</code> in the code with <code>Math.max</code> and
                the same tree answers <b>range maximum queries</b>. Any operation
                that is associative works here: sum, minimum, maximum, GCD,
                matrix product. That generality comes from the tree structure
                itself. The second extension is{" "}
                <b>lazy propagation</b>. A bulk update such as &quot;add 5 to
                every element in [l,r]&quot; is written as a mark on the large
                node that covers the range, and the mark is only pushed down to
                the children when a later operation actually needs them. Without
                lazy propagation, a range update means one point update per
                element, which is O(n log n). With it, a range update is O(log
                n). It is standard in programming contests and rare in
                interviews.
              </p>
            }
            zh={
              <p>
                把代码里的 <code>+</code> 换成 <code>Math.max</code>,同一棵树就能回答
                <b>区间最值查询</b> —— 任何满足结合律的操作(和 / 最值 / GCD / 矩阵乘)
                都能挂上去,这来自树结构本身的通用性。第二个延伸是
                <b>懒标记(lazy propagation)</b>:「把 [l,r] 里每个元素都 +5」
                这类批量修改,先把标记贴在覆盖该区间的大节点上,
                等后面的操作真的要用到孩子时才下推。没有懒标记时,
                区间修改等于对每个元素做一次单点修改,是 O(n log n);
                有了懒标记,区间修改降到 O(log n)。竞赛常用,面试少见。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §05 树状数组 ================= */}
      <Section
        id="bit"
        index="05"
        title={{
          en: "Fenwick tree: prefix sums through the lowest set bit",
          zh: "树状数组:用 lowbit 维护前缀和",
        }}
        desc={{
          en: "Binary indexed tree — about 15 lines, smaller and faster than a segment tree, but it does less",
          zh: "Binary Indexed Tree / Fenwick Tree —— 约 15 行,比线段树更小更快,但能做的事更少",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  A segment tree works, but it takes dozens of lines. If the only
                  requirement is{" "}
                  <strong>point update plus prefix sum query</strong>, there is a
                  much smaller structure: the{" "}
                  <strong>
                    Fenwick tree, also called a binary indexed tree
                  </strong>
                  . It keeps a single array <code>tree[1..n]</code> and one rule:{" "}
                  <strong>
                    tree[i] holds the sum of the segment that ends at i and is
                    lowbit(i) elements long
                  </strong>
                  .
                </p>
                <p>
                  lowbit(i) is the value of the{" "}
                  <strong>lowest set bit</strong> in the binary form of i. You
                  compute it with <code>lowbit(x) = x &amp; (-x)</code>. Here is
                  why that works. In two&apos;s complement,{" "}
                  <code>-x = ~x + 1</code>. Inverting turns the lowest 1 into a 0
                  and every bit below it into 1. Adding 1 then carries through
                  those bits and stops exactly at the position of the original
                  lowest 1. So x and -x agree on that one bit and differ
                  everywhere else, and the AND keeps only that bit. Check it with
                  6: 6 = 0110, -6 = 1010, and 0110 &amp; 1010 = 0010 = 2.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  线段树好用,但要几十行。如果需求只是
                  <strong>单点修改 + 前缀和查询</strong>,有一个小得多的结构:
                  <strong>树状数组(Binary Indexed Tree,又叫 Fenwick Tree)</strong>。
                  它只保留一个数组 <code>tree[1..n]</code>,规则一句话:
                  <strong>tree[i] 存的是「以 i 结尾、长度为 lowbit(i)」那一段的和</strong>。
                </p>
                <p>
                  lowbit(i) = i 的二进制里<strong>最低位那个 1</strong> 所代表的值。
                  求它只要一个位运算:<code>lowbit(x) = x &amp; (-x)</code>。
                  为什么成立:补码里 <code>-x = ~x + 1</code>。
                  取反把最低位的 1 变成 0、其后各位全变 1;
                  再 +1 时进位穿过这些位,恰好停在原来那个 1 的位置。
                  于是 x 和 -x 只在这一位上相同,按位与就只剩这一位。
                  拿 6 验算:6 = 0110,-6 = 1010,0110 &amp; 1010 = 0010 = 2。
                </p>
              </>
            }
          />
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>i</th>
                <th><T en="binary" zh="二进制" /></th>
                <th>lowbit(i)</th>
                <th><T en="range covered by tree[i]" zh="tree[i] 管辖的区间" /></th>
                <th><T en="length" zh="管多长" /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono">1</td>
                <td className="mono">0001</td>
                <td className="mono">1</td>
                <td className="mono">[1, 1]</td>
                <td>1</td>
              </tr>
              <tr>
                <td className="mono">2</td>
                <td className="mono">0010</td>
                <td className="mono">2</td>
                <td className="mono">[1, 2]</td>
                <td>2</td>
              </tr>
              <tr>
                <td className="mono">3</td>
                <td className="mono">0011</td>
                <td className="mono">1</td>
                <td className="mono">[3, 3]</td>
                <td>1</td>
              </tr>
              <tr>
                <td className="mono">4</td>
                <td className="mono">0100</td>
                <td className="mono">4</td>
                <td className="mono">[1, 4]</td>
                <td>4</td>
              </tr>
              <tr>
                <td className="mono">5</td>
                <td className="mono">0101</td>
                <td className="mono">1</td>
                <td className="mono">[5, 5]</td>
                <td>1</td>
              </tr>
              <tr>
                <td className="mono">6</td>
                <td className="mono">0110</td>
                <td className="mono">2</td>
                <td className="mono">[5, 6]</td>
                <td>2</td>
              </tr>
              <tr>
                <td className="mono">7</td>
                <td className="mono">0111</td>
                <td className="mono">1</td>
                <td className="mono">[7, 7]</td>
                <td>1</td>
              </tr>
              <tr>
                <td className="mono">8</td>
                <td className="mono">1000</td>
                <td className="mono">8</td>
                <td className="mono">[1, 8]</td>
                <td>8</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                Read the pattern in the table:{" "}
                <strong>
                  the more trailing zeros i has in binary, the longer the segment
                  it covers
                </strong>
                . To get the prefix sum a[1..7], note that 7 = 0111 = 4 + 2 + 1,
                and the sum splits into tree[7] (1 element) + tree[6] (2
                elements) + tree[4] (4 elements). Those three ranges meet end to
                end and never overlap. <code>i -= lowbit(i)</code> strips one set
                bit at a time, which is exactly this binary decomposition, so it
                runs at most log n times. An update goes the other way:{" "}
                <code>i += lowbit(i)</code> jumps to every larger segment that
                contains position i, also at most log n times. Worked example B
                animates both walks.
              </p>
            }
            zh={
              <p>
                看这张表里的规律:
                <strong>i 的二进制末尾 0 越多,它管的那一段越长</strong>。
                求前缀和 a[1..7] 时,7 = 0111 = 4+2+1,和恰好拆成 tree[7](1 个元素)+
                tree[6](2 个)+ tree[4](4 个),三段首尾相接、互不重叠。
                <code>i -= lowbit(i)</code> 每次剥掉一个最低位的 1,正是在做这个二进制拆分,
                最多做 log n 次。修改则相反:<code>i += lowbit(i)</code>{" "}
                跳到所有包含位置 i 的更大段,同样最多 log n 次。精讲 B 会逐帧走一遍这两条路径。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="fenwick_tree"
          java={{
            code: {
              en: `class BIT {
    private final int n;
    private final long[] tree;   // indices 1..n; tree[0] is unused

    BIT(int n) {
        this.n = n;
        tree = new long[n + 1];
    }

    int lowbit(int x) { return x & (-x); }  // the lowest set bit of x

    void add(int i, long delta) {      // a[i] += delta (i starts at 1)
        for (; i <= n; i += lowbit(i))
            tree[i] += delta;          // every segment covering i gets +delta
    }

    long query(int i) {                // prefix sum a[1..i]
        long s = 0;
        for (; i > 0; i -= lowbit(i))
            s += tree[i];              // strip one bit: add the next disjoint segment
        return s;
    }

    long rangeSum(int l, int r) {      // range sum = difference of two prefix sums
        return query(r) - query(l - 1);
    }
}`,
              zh: `class BIT {
    private final int n;
    private final long[] tree;   // 下标 1..n,tree[0] 不用

    BIT(int n) {
        this.n = n;
        tree = new long[n + 1];
    }

    int lowbit(int x) { return x & (-x); }  // 取 x 二进制最低位的 1

    void add(int i, long delta) {      // a[i] += delta(i 从 1 开始)
        for (; i <= n; i += lowbit(i))
            tree[i] += delta;          // 所有覆盖 i 的段都要 +delta
    }

    long query(int i) {                // 前缀和 a[1..i]
        long s = 0;
        for (; i > 0; i -= lowbit(i))
            s += tree[i];              // 剥掉一位:加上下一段互不重叠的区间
        return s;
    }

    long rangeSum(int l, int r) {      // 区间和 = 两次前缀和相减
        return query(r) - query(l - 1);
    }
}`,
            },
            hl: [10, 13, 14, 19, 20],
            note: {
              en: (
                <>
                  <b>Easy to miss:</b> a Fenwick tree must be <b>1-based</b>,
                  because lowbit(0) = 0 would make the loop spin on the same
                  index forever. When the problem gives 0-based indices, add 1
                  before calling into the tree.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>树状数组必须 <b>1-based</b> ——
                  lowbit(0) = 0 会让循环原地死转。题目给 0-based 下标时,进 BIT 前先 +1。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class BIT:
    def __init__(self, n: int):
        self.n = n
        self.tree = [0] * (n + 1)   # indices 1..n; tree[0] is unused

    def lowbit(self, x: int) -> int:
        return x & (-x)             # the lowest set bit of x

    def add(self, i: int, delta: int) -> None:
        while i <= self.n:          # a[i] += delta (i starts at 1)
            self.tree[i] += delta   # every segment covering i gets +delta
            i += self.lowbit(i)

    def query(self, i: int) -> int:  # prefix sum a[1..i]
        s = 0
        while i > 0:
            s += self.tree[i]       # add the next disjoint segment
            i -= self.lowbit(i)
        return s

    def range_sum(self, l: int, r: int) -> int:
        return self.query(r) - self.query(l - 1)`,
              zh: `class BIT:
    def __init__(self, n: int):
        self.n = n
        self.tree = [0] * (n + 1)   # 下标 1..n,tree[0] 不用

    def lowbit(self, x: int) -> int:
        return x & (-x)             # 取 x 二进制最低位的 1

    def add(self, i: int, delta: int) -> None:
        while i <= self.n:          # a[i] += delta(i 从 1 开始)
            self.tree[i] += delta   # 所有覆盖 i 的段都要 +delta
            i += self.lowbit(i)

    def query(self, i: int) -> int:  # 前缀和 a[1..i]
        s = 0
        while i > 0:
            s += self.tree[i]       # 加上下一段互不重叠的区间
            i -= self.lowbit(i)
        return s

    def range_sum(self, l: int, r: int) -> int:
        return self.query(r) - self.query(l - 1)`,
            },
            hl: [7, 10, 11, 12, 16, 17, 18],
            note: {
              en: (
                <>
                  Python integers also use two&apos;s complement semantics for
                  negative values, so <code>x &amp; -x</code> works the same way.
                  Python integers have unlimited precision, so there is no
                  overflow to worry about.
                </>
              ),
              zh: (
                <>
                  Python 的负数同样是补码语义,<code>x &amp; -x</code> 照常工作;
                  而且 Python 整数是无限精度的,不用担心溢出。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `class BIT {
  constructor(n) {
    this.n = n;
    this.tree = new Array(n + 1).fill(0); // indices 1..n; tree[0] is unused
  }

  lowbit(x) { return x & (-x); }          // the lowest set bit of x

  add(i, delta) {                  // a[i] += delta (i starts at 1)
    for (; i <= this.n; i += this.lowbit(i))
      this.tree[i] += delta;       // every segment covering i gets +delta
  }

  query(i) {                       // prefix sum a[1..i]
    let s = 0;
    for (; i > 0; i -= this.lowbit(i))
      s += this.tree[i];           // add the next disjoint segment
    return s;
  }

  rangeSum(l, r) {                 // range sum = difference of two prefix sums
    return this.query(r) - this.query(l - 1);
  }
}`,
              zh: `class BIT {
  constructor(n) {
    this.n = n;
    this.tree = new Array(n + 1).fill(0); // 下标 1..n,tree[0] 不用
  }

  lowbit(x) { return x & (-x); }          // 取 x 二进制最低位的 1

  add(i, delta) {                  // a[i] += delta(i 从 1 开始)
    for (; i <= this.n; i += this.lowbit(i))
      this.tree[i] += delta;       // 所有覆盖 i 的段都要 +delta
  }

  query(i) {                       // 前缀和 a[1..i]
    let s = 0;
    for (; i > 0; i -= this.lowbit(i))
      s += this.tree[i];           // 加上下一段互不重叠的区间
    return s;
  }

  rangeSum(l, r) {                 // 区间和 = 两次前缀和相减
    return this.query(r) - this.query(l - 1);
  }
}`,
            },
            hl: [7, 10, 11, 16, 17],
            note: {
              en: (
                <>
                  JavaScript bit operations work on 32-bit signed integers, so
                  the index arithmetic is correct as long as n stays below 2^31.
                  Note that this limit applies to the indices, not to the sums
                  stored in the array.
                </>
              ),
              zh: (
                <>
                  JS 的位运算按 32 位有符号整数进行,所以只要 n 不超过 2^31,
                  下标运算就是正确的。注意这个限制针对的是下标,而不是数组里存的和。
                </>
              ),
            },
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th><T en="Compare" zh="对照" /></th>
                <th><T en="Segment tree" zh="线段树" /></th>
                <th><T en="Fenwick tree" zh="树状数组" /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b><T en="Amount of code" zh="码量" /></b></td>
                <td><T en="about 50–60 lines" zh="约 50–60 行" /></td>
                <td><T en="about 15 lines" zh="约 15 行" /></td>
              </tr>
              <tr>
                <td><b><T en="Constant factor and space" zh="常数 / 空间" /></b></td>
                <td><T en="recursive calls and a 4n array, larger constant factor" zh="递归调用 + 4n 数组,常数较大" /></td>
                <td><T en="plain loops and an array of n+1, small constant factor, cache friendly" zh="纯循环 + n+1 数组,常数小、缓存友好" /></td>
              </tr>
              <tr>
                <td><b><T en="What it can answer" zh="能力范围" /></b></td>
                <td><T en="sum, minimum, maximum, GCD — any associative operation; with lazy propagation it also does range updates" zh="和 / 最值 / GCD…任何满足结合律的操作;配懒标记还能做区间修改" /></td>
                <td><T en="only operations where a range answer can be recovered by subtracting two prefixes (sum, xor). A minimum cannot be recovered that way, so range minimum is out." zh="只能做「区间答案 = 两个前缀相减」的运算(求和、异或)。最小值无法这样还原,所以区间最值做不了。" /></td>
              </tr>
              <tr>
                <td><b><T en="Index convention" zh="下标习惯" /></b></td>
                <td><T en="0-based or 1-based, either works" zh="0-based / 1-based 均可" /></td>
                <td><T en="must be 1-based (lowbit(0) = 0 loops forever)" zh="必须 1-based(lowbit(0)=0 会死循环)" /></td>
              </tr>
              <tr>
                <td><b><T en="How to choose" zh="选型口诀" /></b></td>
                <td colSpan={2}><T en="If you need prefix sums that survive updates, use a Fenwick tree. If you need minimum or maximum, range updates, or any merge that is not reversible by subtraction, use a segment tree." zh="只要「可修改的前缀和」→ 树状数组;要最值、区间修改、或任何不能用减法还原的合并 → 线段树" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ================= §06 跳表 ================= */}
      <Section
        id="skiplist"
        index="06"
        title={{
          en: "Skip list: express lanes over a sorted list",
          zh: "跳表:给有序链表加几层快线",
        }}
        desc={{
          en: "Expected O(log n) from coin flips — the structure behind the Redis sorted set",
          zh: "Skip List —— 抛硬币抛出来的期望 O(log n),Redis zset 的骨架",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  A limitation from chapter 3: searching a{" "}
                  <strong>sorted linked list</strong> is O(n). The data is
                  sorted, but you cannot binary search it, because binary search
                  needs O(1) random access and a linked list does not provide it
                  (chapter 1). You can only follow next one node at a time, and
                  the sortedness is wasted.
                </p>
                <p>
                  A skip list fixes that by adding express lanes above the list.{" "}
                  <strong>
                    The bottom level L0 is the complete sorted list, and each
                    level above it holds roughly half the nodes of the level
                    below
                  </strong>
                  . A higher level has fewer nodes, so one step there covers more
                  ground. A search starts at the top level and follows one rule:{" "}
                  <strong>
                    move right while the next node is still smaller than the
                    target, otherwise drop down one level
                  </strong>
                  . By the time you reach L0 you are already next to the target.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  第 3 章留下的限制:<strong>有序链表</strong>查找是 O(n) ——
                  数据明明有序,却不能二分,因为二分需要 O(1) 随机访问,而链表没有
                  (第 1 章)。只能一格一格 next,有序性被浪费掉了。
                </p>
                <p>
                  跳表的做法是在链表上面加几层「快线」:
                  <strong>最底层 L0 是完整的有序链表,往上每一层只保留下一层大约一半的节点</strong>。
                  层数越高节点越少,一步跨得越远。查找从最顶层出发,规则只有一条:
                  <strong>右邻还比目标小就向右走,否则下楼一层</strong>。
                  走到 L0 时,已经停在目标旁边了。
                </p>
              </>
            }
          />
        </div>
        <SkipLab />
        <div className="prose">
          <T
            en={
              <p>
                Each level holds about half the nodes of the level below, so
                there are about log₂n levels, and on each level you take only a
                couple of steps before dropping down. If you could take many
                steps on one level, the level above would have carried you
                further. The expected search cost is therefore{" "}
                <strong>O(log n)</strong>. For n = 1,000,000 a plain sorted list
                needs about 500,000 comparisons on average, while a skip list
                needs on the order of 40. That matches binary search and a
                balanced tree, while keeping the linked list property that
                insertion and deletion only rewrite a few pointers.
              </p>
            }
            zh={
              <p>
                每层节点数大约是下层的一半,所以层数约 log₂n;
                在每一层通常只走一两步就下楼 —— 如果能在某一层走很多步,
                说明上一层本可以带你走得更远。因此查找的期望代价是
                <strong>O(log n)</strong>。n = 100 万时,普通有序链表平均要比较约 50 万次,
                跳表大约几十次 —— 和二分、平衡树同一量级,
                同时保留了链表「插删只改几根指针」的优点。
              </p>
            }
          />
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="card-title">
              <T
                en="Why decide the height with a coin flip?"
                zh="为什么用抛硬币决定层数?"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    Promoting exactly every second node would be ideal, but{" "}
                    <b>a single insertion destroys it</b>: the new node shifts
                    the position of every node after it, so the index levels
                    would have to be rebuilt in O(n). A skip list instead lets
                    each new node <b>flip a coin</b> for its height: heads means
                    one more level, tails means stop, so each extra level has
                    probability 1/2. Nobody maintains the exact pattern, but{" "}
                    <b>in expectation</b> each level still holds half the nodes
                    of the one below. The expected height of one node is 1 + 1/2
                    + 1/4 + … = 2, and the expected height of the whole list of n
                    nodes is about log₂n.
                  </>
                }
                zh={
                  <>
                    「上层严格隔一抽一」看起来最理想,但<b>一次插入就会破坏它</b>:
                    新节点挤进来,后面所有节点的位置全变,索引要 O(n) 重建。
                    跳表改成让每个新节点<b>抛硬币</b>决定高度:
                    正面就再长一层,反面就停,所以每多长一层的概率是 1/2。
                    没人维护那个精确模式,但<b>在期望意义上</b>每层依然是下层的一半:
                    单个节点的期望层数是 1 + 1/2 + 1/4 + … = 2,
                    n 个节点整体的期望高度约 log₂n。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <T
                en="What the expectation is over"
                zh="期望是对什么取的?"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    This is important: the O(log n) is expected{" "}
                    <b>over the coin flips</b>, not over the input. There is no
                    bad input for a skip list, because the structure does not
                    depend on the data at all. A very unlucky run of coin flips
                    could still make it slow, but the probability of that is
                    negligible. This is the same trade as choosing a random pivot
                    in quicksort, or spreading keys with a hash function (chapter
                    6): <b>randomness replaces expensive deterministic
                    maintenance</b>.
                  </>
                }
                zh={
                  <>
                    这一点很重要:O(log n) 的期望是对<b>抛硬币的随机性</b>取的,
                    不是对输入数据取的。跳表没有「最坏输入」,因为结构完全不依赖数据。
                    运气极差的一串硬币确实会让它变慢,但那个概率小到可以忽略。
                    这和快速排序随机选轴、哈希函数打散 key(第 6 章)是同一种权衡:
                    <b>用随机性换掉昂贵的确定性维护</b>。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="deep"
          title={{
            en: "Why the Redis sorted set uses a skip list instead of a red-black tree",
            zh: "工程现场:Redis 的 zset 为什么选跳表,不选红黑树?",
          }}
        >
          <T
            en={
              <p>
                Both give O(log n) search, insert, and delete. Salvatore
                Sanfilippo, the author of Redis, gave three reasons.
                ① <b>The implementation is far simpler</b>: red-black tree
                insertion has a dozen rotation and recolouring cases, while skip
                list insertion is an ordinary linked-list insertion repeated once
                per level. ② <b>Range operations are natural</b>: ZRANGE asks for
                a rank interval, and a skip list locates the start and then walks
                forward along L0, while a tree needs repeated in-order traversal
                steps. ③ It is easier to modify; Redis added a span field to skip
                list nodes to support rank queries. LevelDB and RocksDB also use
                a skip list for their in-memory write buffer (the MemTable),
                partly because it suits <b>lock-free concurrency</b>: updating a
                few pointers is easier to make atomic than rotating a tree.
              </p>
            }
            zh={
              <p>
                两者的查 / 插 / 删都是 O(log n)。Redis 作者 Salvatore Sanfilippo
                给过三个理由:① <b>实现简单一个量级</b> —— 红黑树插入有十几种旋转和变色
                的情况,跳表插入就是「普通链表插入 × 层数」;② <b>范围操作天然顺滑</b> ——
                ZRANGE 取的是排名区间,跳表定位到起点后沿 L0 一路往前走即可,
                而树要反复做中序遍历;③ 更容易改造(Redis 在跳表节点上加了 span 字段做排名)。
                LevelDB / RocksDB 的内存写缓冲(MemTable)也用跳表,
                还因为它对<b>无锁并发</b>友好:改几根指针比旋转整棵树更容易做成原子操作。
              </p>
            }
          />
        </Callout>
        <div className="prose">
          <T
            en={
              <p>
                How to implement it (LC 1206): each node carries an array{" "}
                <code>next[]</code>, where entry i is its successor on level i.
                All three operations share the same navigation logic. Start at
                the top level, move right on each level while the next value is
                still smaller than the target, and record the last node visited
                on each level in <code>update[]</code>. Insertion and deletion
                are then ordinary linked-list pointer updates performed after
                those recorded nodes.
              </p>
            }
            zh={
              <p>
                实现思路(LC 1206 原题):每个节点带一个 <code>next[]</code> 指针数组,
                第 i 格 = 它在第 i 层的后继。三个操作共用同一段导航逻辑 ——
                从顶层开始,每层在「右邻还比目标小」时向右走,
                并把每层最后停留的节点记进 <code>update[]</code>;
                插入和删除就是在这些记录点之后做普通的链表指针操作。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="lc1206_skiplist"
          java={{
            code: {
              en: `class Skiplist {
    static final int MAX_LEVEL = 16;    // enough for about 2^16 nodes
    static final double P = 0.5;        // probability of one more level
    static final Random RAND = new Random();

    static class Node {
        int val;
        Node[] next;                    // next[i] = successor on level i
        Node(int val, int level) { this.val = val; next = new Node[level]; }
    }

    private final Node head = new Node(-1, MAX_LEVEL);  // sentinel, has every level
    private int level = 1;              // highest level currently in use

    private int randomLevel() {
        int lv = 1;
        while (RAND.nextDouble() < P && lv < MAX_LEVEL) lv++;  // keep flipping
        return lv;
    }

    public boolean search(int target) {
        Node cur = head;
        for (int i = level - 1; i >= 0; i--) {       // start at the top level
            while (cur.next[i] != null && cur.next[i].val < target)
                cur = cur.next[i];                   // move right while it is smaller
            // cannot move right on this level, so i-- drops one level
        }
        Node cand = cur.next[0];
        return cand != null && cand.val == target;
    }

    public void add(int num) {
        Node[] update = new Node[MAX_LEVEL];
        Arrays.fill(update, head);
        Node cur = head;
        for (int i = level - 1; i >= 0; i--) {
            while (cur.next[i] != null && cur.next[i].val < num)
                cur = cur.next[i];
            update[i] = cur;            // last node visited on level i
        }
        int lv = randomLevel();         // coin flips decide the new node's height
        level = Math.max(level, lv);
        Node node = new Node(num, lv);
        for (int i = 0; i < lv; i++) {  // one ordinary list insertion per level
            node.next[i] = update[i].next[i];
            update[i].next[i] = node;
        }
    }

    public boolean erase(int num) {
        Node[] update = new Node[MAX_LEVEL];
        Arrays.fill(update, head);
        Node cur = head;
        for (int i = level - 1; i >= 0; i--) {
            while (cur.next[i] != null && cur.next[i].val < num)
                cur = cur.next[i];
            update[i] = cur;
        }
        cur = cur.next[0];
        if (cur == null || cur.val != num) return false;
        for (int i = 0; i < cur.next.length; i++)    // bypass the node on each level
            if (update[i].next[i] == cur) update[i].next[i] = cur.next[i];
        return true;
    }
}`,
              zh: `class Skiplist {
    static final int MAX_LEVEL = 16;    // 大约 2^16 个节点以内都够用
    static final double P = 0.5;        // 每多长一层的概率
    static final Random RAND = new Random();

    static class Node {
        int val;
        Node[] next;                    // next[i] = 它在第 i 层的后继
        Node(int val, int level) { this.val = val; next = new Node[level]; }
    }

    private final Node head = new Node(-1, MAX_LEVEL);  // 哨兵头,拥有全部层
    private int level = 1;              // 当前实际用到的最高层

    private int randomLevel() {
        int lv = 1;
        while (RAND.nextDouble() < P && lv < MAX_LEVEL) lv++;  // 一直抛到反面
        return lv;
    }

    public boolean search(int target) {
        Node cur = head;
        for (int i = level - 1; i >= 0; i--) {       // 从最顶层开始
            while (cur.next[i] != null && cur.next[i].val < target)
                cur = cur.next[i];                   // 右邻还比目标小就向右走
            // 本层走不动了,i-- 下楼一层
        }
        Node cand = cur.next[0];
        return cand != null && cand.val == target;
    }

    public void add(int num) {
        Node[] update = new Node[MAX_LEVEL];
        Arrays.fill(update, head);
        Node cur = head;
        for (int i = level - 1; i >= 0; i--) {
            while (cur.next[i] != null && cur.next[i].val < num)
                cur = cur.next[i];
            update[i] = cur;            // 第 i 层最后停留的节点
        }
        int lv = randomLevel();         // 抛硬币决定新节点的层数
        level = Math.max(level, lv);
        Node node = new Node(num, lv);
        for (int i = 0; i < lv; i++) {  // 每一层做一次普通的链表插入
            node.next[i] = update[i].next[i];
            update[i].next[i] = node;
        }
    }

    public boolean erase(int num) {
        Node[] update = new Node[MAX_LEVEL];
        Arrays.fill(update, head);
        Node cur = head;
        for (int i = level - 1; i >= 0; i--) {
            while (cur.next[i] != null && cur.next[i].val < num)
                cur = cur.next[i];
            update[i] = cur;
        }
        cur = cur.next[0];
        if (cur == null || cur.val != num) return false;
        for (int i = 0; i < cur.next.length; i++)    // 每层把这个节点绕过去
            if (update[i].next[i] == cur) update[i].next[i] = cur.next[i];
        return true;
    }
}`,
            },
            hl: [15, 16, 17, 18, 19, 23, 24, 25, 26],
            note: {
              en: (
                <>
                  The first half of search, add, and erase is the same code: from
                  the top level down, move right as far as possible on each
                  level. Understand one and you understand all three.
                </>
              ),
              zh: (
                <>
                  search / add / erase 的前半段是同一段代码:从顶层往下,
                  每层尽量向右走。看懂一个就看懂了全部三个。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `import random

MAX_LEVEL = 16      # enough for about 2^16 nodes
P = 0.5             # probability of one more level

class Node:
    def __init__(self, val, level):
        self.val = val
        self.next = [None] * level      # next[i] = successor on level i

class Skiplist:
    def __init__(self):
        self.head = Node(-1, MAX_LEVEL) # sentinel, has every level
        self.level = 1                  # highest level currently in use

    def _random_level(self):
        lv = 1
        while random.random() < P and lv < MAX_LEVEL:
            lv += 1                     # keep flipping the coin
        return lv

    def search(self, target: int) -> bool:
        cur = self.head
        for i in range(self.level - 1, -1, -1):   # start at the top level
            while cur.next[i] and cur.next[i].val < target:
                cur = cur.next[i]                 # move right while it is smaller
            # cannot move right here, so the loop drops one level
        cand = cur.next[0]
        return cand is not None and cand.val == target

    def add(self, num: int) -> None:
        update = [self.head] * MAX_LEVEL
        cur = self.head
        for i in range(self.level - 1, -1, -1):
            while cur.next[i] and cur.next[i].val < num:
                cur = cur.next[i]
            update[i] = cur             # last node visited on level i
        lv = self._random_level()       # coin flips decide the new node's height
        self.level = max(self.level, lv)
        node = Node(num, lv)
        for i in range(lv):             # one ordinary list insertion per level
            node.next[i] = update[i].next[i]
            update[i].next[i] = node

    def erase(self, num: int) -> bool:
        update = [self.head] * MAX_LEVEL
        cur = self.head
        for i in range(self.level - 1, -1, -1):
            while cur.next[i] and cur.next[i].val < num:
                cur = cur.next[i]
            update[i] = cur
        cur = cur.next[0]
        if cur is None or cur.val != num:
            return False
        for i in range(len(cur.next)):  # bypass the node on each level
            if update[i].next[i] is cur:
                update[i].next[i] = cur.next[i]
        return True`,
              zh: `import random

MAX_LEVEL = 16      # 大约 2^16 个节点以内都够用
P = 0.5             # 每多长一层的概率

class Node:
    def __init__(self, val, level):
        self.val = val
        self.next = [None] * level      # next[i] = 它在第 i 层的后继

class Skiplist:
    def __init__(self):
        self.head = Node(-1, MAX_LEVEL) # 哨兵头,拥有全部层
        self.level = 1                  # 当前实际用到的最高层

    def _random_level(self):
        lv = 1
        while random.random() < P and lv < MAX_LEVEL:
            lv += 1                     # 一直抛到反面为止
        return lv

    def search(self, target: int) -> bool:
        cur = self.head
        for i in range(self.level - 1, -1, -1):   # 从最顶层开始
            while cur.next[i] and cur.next[i].val < target:
                cur = cur.next[i]                 # 右邻还比目标小就向右走
            # 本层走不动了,循环自然下楼一层
        cand = cur.next[0]
        return cand is not None and cand.val == target

    def add(self, num: int) -> None:
        update = [self.head] * MAX_LEVEL
        cur = self.head
        for i in range(self.level - 1, -1, -1):
            while cur.next[i] and cur.next[i].val < num:
                cur = cur.next[i]
            update[i] = cur             # 第 i 层最后停留的节点
        lv = self._random_level()       # 抛硬币决定新节点的层数
        self.level = max(self.level, lv)
        node = Node(num, lv)
        for i in range(lv):             # 每一层做一次普通的链表插入
            node.next[i] = update[i].next[i]
            update[i].next[i] = node

    def erase(self, num: int) -> bool:
        update = [self.head] * MAX_LEVEL
        cur = self.head
        for i in range(self.level - 1, -1, -1):
            while cur.next[i] and cur.next[i].val < num:
                cur = cur.next[i]
            update[i] = cur
        cur = cur.next[0]
        if cur is None or cur.val != num:
            return False
        for i in range(len(cur.next)):  # 每层把这个节点绕过去
            if update[i].next[i] is cur:
                update[i].next[i] = cur.next[i]
        return True`,
            },
            hl: [16, 17, 18, 19, 20, 24, 25, 26, 27],
            note: {
              en: (
                <>
                  <code>update = [self.head] * MAX_LEVEL</code> stores the same
                  head reference many times. That is safe here because the code
                  only replaces list elements and never mutates one through the
                  shared reference.
                </>
              ),
              zh: (
                <>
                  <code>update = [self.head] * MAX_LEVEL</code> 存的是同一个 head
                  的多个引用 —— 这里没问题,因为代码只替换列表元素,
                  不会通过共享引用去改内容。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `const MAX_LEVEL = 16;   // enough for about 2^16 nodes
const P = 0.5;          // probability of one more level

class SkipNode {
  constructor(val, level) {
    this.val = val;
    this.next = new Array(level).fill(null); // next[i] = successor on level i
  }
}

class Skiplist {
  constructor() {
    this.head = new SkipNode(-1, MAX_LEVEL); // sentinel, has every level
    this.level = 1;                          // highest level currently in use
  }

  _randomLevel() {
    let lv = 1;
    while (Math.random() < P && lv < MAX_LEVEL) lv++; // keep flipping
    return lv;
  }

  search(target) {
    let cur = this.head;
    for (let i = this.level - 1; i >= 0; i--) {  // start at the top level
      while (cur.next[i] && cur.next[i].val < target)
        cur = cur.next[i];                       // move right while it is smaller
      // cannot move right here, so i-- drops one level
    }
    const cand = cur.next[0];
    return cand !== null && cand.val === target;
  }

  add(num) {
    const update = new Array(MAX_LEVEL).fill(this.head);
    let cur = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      while (cur.next[i] && cur.next[i].val < num) cur = cur.next[i];
      update[i] = cur;                 // last node visited on level i
    }
    const lv = this._randomLevel();    // coin flips decide the new node's height
    this.level = Math.max(this.level, lv);
    const node = new SkipNode(num, lv);
    for (let i = 0; i < lv; i++) {     // one ordinary list insertion per level
      node.next[i] = update[i].next[i];
      update[i].next[i] = node;
    }
  }

  erase(num) {
    const update = new Array(MAX_LEVEL).fill(this.head);
    let cur = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      while (cur.next[i] && cur.next[i].val < num) cur = cur.next[i];
      update[i] = cur;
    }
    cur = cur.next[0];
    if (!cur || cur.val !== num) return false;
    for (let i = 0; i < cur.next.length; i++) {  // bypass the node on each level
      if (update[i].next[i] === cur) update[i].next[i] = cur.next[i];
    }
    return true;
  }
}`,
              zh: `const MAX_LEVEL = 16;   // 大约 2^16 个节点以内都够用
const P = 0.5;          // 每多长一层的概率

class SkipNode {
  constructor(val, level) {
    this.val = val;
    this.next = new Array(level).fill(null); // next[i] = 它在第 i 层的后继
  }
}

class Skiplist {
  constructor() {
    this.head = new SkipNode(-1, MAX_LEVEL); // 哨兵头,拥有全部层
    this.level = 1;                          // 当前实际用到的最高层
  }

  _randomLevel() {
    let lv = 1;
    while (Math.random() < P && lv < MAX_LEVEL) lv++; // 一直抛到反面
    return lv;
  }

  search(target) {
    let cur = this.head;
    for (let i = this.level - 1; i >= 0; i--) {  // 从最顶层开始
      while (cur.next[i] && cur.next[i].val < target)
        cur = cur.next[i];                       // 右邻还比目标小就向右走
      // 本层走不动了,i-- 下楼一层
    }
    const cand = cur.next[0];
    return cand !== null && cand.val === target;
  }

  add(num) {
    const update = new Array(MAX_LEVEL).fill(this.head);
    let cur = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      while (cur.next[i] && cur.next[i].val < num) cur = cur.next[i];
      update[i] = cur;                 // 第 i 层最后停留的节点
    }
    const lv = this._randomLevel();    // 抛硬币决定新节点的层数
    this.level = Math.max(this.level, lv);
    const node = new SkipNode(num, lv);
    for (let i = 0; i < lv; i++) {     // 每一层做一次普通的链表插入
      node.next[i] = update[i].next[i];
      update[i].next[i] = node;
    }
  }

  erase(num) {
    const update = new Array(MAX_LEVEL).fill(this.head);
    let cur = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      while (cur.next[i] && cur.next[i].val < num) cur = cur.next[i];
      update[i] = cur;
    }
    cur = cur.next[0];
    if (!cur || cur.val !== num) return false;
    for (let i = 0; i < cur.next.length; i++) {  // 每层把这个节点绕过去
      if (update[i].next[i] === cur) update[i].next[i] = cur.next[i];
    }
    return true;
  }
}`,
            },
            hl: [17, 18, 19, 20, 25, 26, 27],
            note: {
              en: (
                <>
                  LC 1206 allows duplicate values, and this implementation
                  supports them: add does not check for an existing value, and
                  erase removes exactly one occurrence.
                </>
              ),
              zh: (
                <>
                  LC 1206 允许重复元素,本实现天然支持:add 不判重,erase 只删一个。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="story"
          title={{ en: "The title of the paper says it all", zh: "论文标题就说明了一切" }}
        >
          <T
            en={
              <p>
                Skip lists come from a 1990 paper by William Pugh:{" "}
                <i>Skip Lists: A Probabilistic Alternative to Balanced Trees</i>.
                The paper argues that balanced trees are hard to implement
                correctly, and that a simpler randomized structure gives the same
                expected performance. More than thirty years later, Redis and
                LevelDB both use skip lists, which supports that argument.
              </p>
            }
            zh={
              <p>
                跳表出自 William Pugh 1990 年的论文,标题就是结论:
                <i>Skip Lists: A Probabilistic Alternative to Balanced Trees</i>
                (跳表:平衡树的概率替代品)。论文的论点是:平衡树很难写对,
                而一个更简单的随机化结构能给出同样的期望性能。
                三十多年后 Redis、LevelDB 都在用跳表,算是对这个论点的支持。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §07 布隆过滤器 ================= */}
      <Section
        id="bloom"
        index="07"
        title={{
          en: "Bloom filter: trading accuracy for memory",
          zh: "布隆过滤器:用可控误判换内存",
        }}
        desc={{
          en: "A bit array plus k hash functions — it can prove absence, not presence",
          zh: "Bloom Filter —— 位数组 + k 个哈希函数,只能证明「一定不在」",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  The last machine answers one very simple question:{" "}
                  <strong>have I seen this before?</strong> A web crawler has to
                  know whether a URL has already been fetched. With 10 billion
                  URLs at about 60 bytes each, storing them in a hash set
                  (chapter 6) would need roughly 600 GB, before counting any
                  per-entry overhead. That does not fit.
                </p>
                <p>
                  A <strong>Bloom filter</strong> answers by{" "}
                  <strong>not storing the data at all</strong>. It stores only
                  the hash positions. It keeps one{" "}
                  <strong>bit array</strong> of m bits and uses k different hash
                  functions.{" "}
                  <b>
                    Note what it cannot do: a Bloom filter cannot return the
                    stored values, and it cannot tell you for certain that an
                    element is present. It is not a fast set.
                  </b>
                </p>
              </>
            }
            zh={
              <>
                <p>
                  最后一台机器回答一个非常朴素的问题:
                  <strong>这个东西我见过吗?</strong>
                  爬虫要判断某个 URL 是否抓过 —— 100 亿个 URL,每个平均 60 字节,
                  用哈希集合(第 6 章)存需要约 600 GB,还没算每条记录的额外开销。存不下。
                </p>
                <p>
                  <strong>布隆过滤器(Bloom filter)</strong>的做法是
                  <strong>根本不存数据本身</strong>,只记录哈希位置:
                  一个 m 位的<strong>位数组(bit array)</strong>加 k 个不同的哈希函数。
                  <b>
                    注意它做不到什么:布隆过滤器取不回存进去的值,
                    也无法确定地告诉你某个元素在里面。它不是「更快的集合」。
                  </b>
                </p>
              </>
            }
          />
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="card-title">
              <T en="insert(x): set k bits" zh="insert(x):置 k 个位" />
            </div>
            <p>
              <T
                en={
                  <>
                    The k hash functions give k positions, and all of those bits
                    are <b>set to 1</b>. x itself is not stored. One element
                    costs at most k bits, and the bits are shared by all
                    elements.
                  </>
                }
                zh={
                  <>
                    k 个哈希函数算出 k 个位置,把这些位<b>全部置 1</b>。
                    x 本身不存。一个元素最多只占 k 个比特,而且这些位是所有元素共享的。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <T en="query(x): check the same k bits" zh="query(x):检查同样的 k 个位" />
            </div>
            <p>
              <T
                en={
                  <>
                    Recompute the k positions.{" "}
                    <b>If any of those bits is 0, x was definitely never
                    inserted</b>, because insertion would have set it.{" "}
                    <b>If all k bits are 1, x may have been inserted</b>, but
                    other elements could also have set exactly those bits.
                  </>
                }
                zh={
                  <>
                    重新算出那 k 个位置。
                    <b>只要有一位是 0,x 就一定没被插入过</b> ——
                    插入过的话这一位必然已被置 1。
                    <b>k 个位全是 1,x 才「可能」插入过</b> ——
                    但也可能是别的元素恰好点亮了这几位。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                Notice how one-sided this is. The only two answers are{" "}
                <strong>definitely not present</strong> and{" "}
                <strong>possibly present</strong>. The reason is that{" "}
                <strong>bits only go from 0 to 1 and are never cleared</strong>.
                Another element can set your bits as a side effect, which
                produces a <strong>false positive</strong>, but no operation ever
                clears a bit, so there is{" "}
                <strong>never a false negative</strong>. Try to produce a false
                positive yourself:
              </p>
            }
            zh={
              <p>
                注意这个不对称:回答只有<strong>「一定不在」</strong>和
                <strong>「可能在」</strong>两种。原因是
                <strong>位只会从 0 变 1,永远不会被清零</strong>:
                别的元素可能顺手点亮你的位,这就产生<strong>假阳性</strong>;
                但没有任何操作会把已点亮的位熄灭,所以
                <strong>永远不会有假阴性</strong>。亲手制造一次假阳性:
              </p>
            }
          />
        </div>
        <BloomLab />
        <div className="prose">
          <T
            en={
              <p>
                The false positive rate is not fixed. It depends on three things:
                the size of the bit array m, the number of hash functions k, and
                the number of elements actually inserted n. Two qualitative
                rules.{" "}
                <strong>
                  A larger bit array relative to the number of elements (larger
                  m/n) lowers the rate
                </strong>
                , because the bits fill up more slowly.{" "}
                <strong>The number of hash functions k has an optimum</strong>:
                too few and each element leaves too small a fingerprint, so
                collisions are likely; too many and each element sets too many
                bits, so the array fills up and the rate rises again. In practice
                you pick m and k from a target rate. For example, 10 bits per
                element with k = 7 gives about 1 percent. A hash set needs
                hundreds of bits per element, so the saving is one to two orders
                of magnitude.
              </p>
            }
            zh={
              <p>
                误判率不是固定的,它取决于三个量:位数组大小 m、哈希函数个数 k,
                以及<strong>实际插入的元素个数 n</strong>。两条定性规律:
                <strong>相对元素数而言位数组越大(m/n 越大),误判率越低</strong>,
                因为位被填满得更慢;
                <strong>哈希函数个数 k 存在一个最优值</strong> ——
                太少,每个元素留下的「指纹」太小,容易撞;
                太多,每个元素占的位太多,数组很快全亮,误判率反而升高。
                工程上按目标误判率反推 m 和 k:比如每元素 10 个比特、k = 7,
                误判率约 1%。而哈希集合每个元素要几百比特,所以内存能省一到两个数量级。
              </p>
            }
          />
        </div>
        <Callout
          tone="deep"
          title={{ en: "Using it as a first filter", zh: "工程现场:当作第一道过滤门" }}
        >
          <T
            en={
              <p>
                <b>Crawler deduplication</b>: 10 billion URLs at 10 bits each is
                about 12 GB, which fits on one machine. A 1 percent false
                positive rate only means skipping a very small number of new
                pages.
                <b> Protecting a database from lookups of missing keys</b>: a
                flood of requests for keys that do not exist in the database
                passes straight through the cache and reaches the database every
                time. Put all existing keys into a Bloom filter in front of the
                cache, and every request the filter reports as definitely absent
                is rejected immediately.
                <b> Spam and malicious URL lists</b>: the blocklist is too large
                to keep in memory, so the filter decides whether an expensive
                exact check is worth running. The pattern is always the same:{" "}
                <b>
                  nothing that was inserted is ever wrongly rejected, and the
                  small number of wrongly accepted items are checked again by a
                  slower exact lookup
                </b>
                .
              </p>
            }
            zh={
              <p>
                <b>爬虫去重</b>:100 亿 URL × 10 bit ≈ 12 GB,单机就装得下;
                1% 的误判只意味着漏抓极少数新页面。
                <b> 缓存穿透防护</b>:大量请求查询数据库里根本不存在的 key,
                每次都穿过缓存直接打到数据库 ——
                把全量 key 装进布隆过滤器挡在缓存前面,
                被判定为「一定不在」的请求直接拒绝。
                <b> 垃圾邮件 / 恶意网址名单</b>:黑名单太大放不进内存,
                先用布隆过滤器判断值不值得做一次昂贵的精确校验。共同模式是:
                <b>插入过的绝不会被误拒,少量被误放行的再交给慢的精确查询复核</b>。
              </p>
            }
          />
        </Callout>
        <Callout
          tone="warn"
          title={{ en: "Two common mistakes", zh: "两个常见错误" }}
        >
          <T
            en={
              <p>
                ① <b>A plain Bloom filter does not support deletion.</b> One bit
                can be shared by several elements, so clearing it would also
                remove those other elements from the filter, which would create
                false negatives and break the one guarantee the structure
                provides. If you need deletion, use a counting Bloom filter,
                where each position is a small counter instead of a single bit,
                or a cuckoo filter.
                ② <b>The false positive rate rises with the number of inserted
                elements.</b> If you size the filter for 10 million entries and
                insert 100 million, almost every bit is 1, &quot;possibly
                present&quot; becomes the answer for everything, and the filter
                stops being useful. Estimating the number of elements in advance
                is a precondition for using one.
              </p>
            }
            zh={
              <p>
                ① <b>标准布隆过滤器不支持删除。</b>
                一个位可能被多个元素共享,把它清零等于把别的元素也从过滤器里抹掉,
                会制造假阴性,破坏它唯一的那条保证。需要删除就用计数布隆过滤器
                (每个位置换成一个小计数器)或布谷鸟过滤器。
                ② <b>误判率会随插入量上涨。</b>
                按 1000 万条设计容量却塞进 1 亿条,位数组几乎全亮,
                任何查询都会得到「可能在」,过滤器就没用了 ——
                事先估算元素数量是使用它的前提。
              </p>
            }
          />
        </Callout>
        <Callout
          tone="story"
          title={{ en: "Proposed in 1970, used more today", zh: "1970 年提出,今天用得更多" }}
        >
          <T
            en={
              <p>
                Burton Bloom proposed this structure in 1970, when memory was
                measured in kilobytes and giving up a little accuracy for a large
                memory saving was a necessity. Memory has become far cheaper
                since then, yet the structure is used more than ever, because
                data volumes have grown faster than memory. Redis, HBase,
                Cassandra, and Chrome all contain one.
              </p>
            }
            zh={
              <p>
                Burton Bloom 在 1970 年提出这个结构,当时内存以 KB 计,
                「牺牲一点点准确性换大量内存」是刚需。此后内存便宜了很多,
                但这个结构反而用得更多 —— 因为数据规模涨得比内存更快。
                Redis、HBase、Cassandra、Chrome 里都有它。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §08 精讲 ================= */}
      <Section
        id="featured"
        index="08"
        title={{
          en: "Three worked examples: take the machines apart again",
          zh: "三道精讲:把机器拆开再装回去",
        }}
        desc={{
          en: "Each one: the requirement, why this combination, a frame-by-frame run, three implementations, complexity, follow-up questions",
          zh: "每道题 = 需求 → 为什么这样拼 → 逐帧 → 三语言题解 → 复杂度 → 追问",
        }}
        badge={
          <span className="chip" data-tone="warn">
            <T en="★ Interview core" zh="★ 面试核心" />
          </span>
        }
      >
        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 24 }}>
          <span className="sec-index">
            <T en="Example A" zh="精讲 A" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 146 · <T en="LRU Cache" zh="LRU 缓存" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>Problem:</b> implement a fixed-capacity LRU cache where get
                and put are O(1) and a full cache evicts the least recently used
                entry.
                <b> Why this combination:</b> §02 derived it in full. The hash
                map answers &quot;where is this key&quot; in O(1), and the doubly
                linked list answers &quot;how old is it&quot; while supporting
                O(1) unlink and insert. Each structure covers the other&apos;s
                O(n) operation, and the full hand-written implementation is also
                in §02. Here we first step through the official example, then add
                the short version that saves time in an interview.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>实现容量固定的 LRU 缓存,get / put 都是 O(1),满了淘汰最久未用的。
                <b> 为什么这样拼:</b>§02 已经完整推导过 ——
                哈希表 O(1) 回答「在哪」,双向链表回答「多旧」并支持 O(1) 摘除和插入,
                各自 O(n) 的那件事由对方来做;完整手写实现也在 §02。
                这里先用官方样例把执行过程逐帧走一遍,再补一个面试省时间的快写版。
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 146 · capacity 2, the official example step by step (cells = list from head to tail)",
            zh: "LC 146 · 容量 2,官方样例逐帧(格子 = 链表头→尾)",
          }}
          frames={F146}
          cellW={72}
        />
        <CodeTabs
          title="lc146_quick_version"
          java={{
            code: {
              en: `// short version: the LinkedHashMap from §02 (a hash map plus a doubly linked list)
class LRUCache extends LinkedHashMap<Integer, Integer> {
    private final int cap;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);   // accessOrder=true: order by access
        this.cap = capacity;
    }

    public int get(int key) {
        return super.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        super.put(key, value);
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> e) {
        return size() > cap;            // over capacity: drop the eldest entry
    }
}`,
              zh: `// 快写版 = §02 的 LinkedHashMap(内部就是哈希表 + 双向链表)
class LRUCache extends LinkedHashMap<Integer, Integer> {
    private final int cap;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);   // accessOrder=true:按访问序排列
        this.cap = capacity;
    }

    public int get(int key) {
        return super.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        super.put(key, value);
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> e) {
        return size() > cap;            // 超容量就删掉最老的条目
    }
}`,
            },
            hl: [6, 19, 20],
            note: {
              en: (
                <>
                  Ask first whether the standard library is allowed. If you must
                  write it yourself, use the full version in §02. If the library
                  is allowed, use this and explain the two structures inside it.
                </>
              ),
              zh: (
                <>
                  面试时先问「能不能用标准库」。要求手写就写 §02 的完整版;
                  允许用库就写这个,并主动讲出它内部的两个结构。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.od = OrderedDict()   # internally a hash map plus a doubly linked list

    def get(self, key: int) -> int:
        if key not in self.od:
            return -1
        self.od.move_to_end(key)  # move to the "newest" end, O(1)
        return self.od[key]

    def put(self, key: int, value: int) -> None:
        if key in self.od:
            self.od.move_to_end(key)
        self.od[key] = value
        if len(self.od) > self.cap:
            self.od.popitem(last=False)  # pop the "oldest" end, O(1)`,
              zh: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.od = OrderedDict()   # 内部就是哈希表 + 双向链表

    def get(self, key: int) -> int:
        if key not in self.od:
            return -1
        self.od.move_to_end(key)  # 搬到「最新」那一端,O(1)
        return self.od[key]

    def put(self, key: int, value: int) -> None:
        if key in self.od:
            self.od.move_to_end(key)
        self.od[key] = value
        if len(self.od) > self.cap:
            self.od.popitem(last=False)  # 弹出「最旧」那一端,O(1)`,
            },
            hl: [11, 19],
            note: {
              en: (
                <>
                  <code>move_to_end</code> and{" "}
                  <code>popitem(last=False)</code> are exactly the moveToHead and
                  tail eviction you wrote by hand. CPython implements them in C,
                  so they are faster.
                </>
              ),
              zh: (
                <>
                  <code>move_to_end</code> 和 <code>popitem(last=False)</code>{" "}
                  正是我们手写的 moveToHead 和淘汰尾节点。CPython 用 C 实现,更快。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();   // a Map keeps insertion order: first set comes first
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const v = this.map.get(key);
    this.map.delete(key);   // delete then set = move to the "newest" end
    this.map.set(key, v);
    return v;
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.cap) {
      const oldest = this.map.keys().next().value; // first in iteration = oldest
      this.map.delete(oldest);
    }
  }
}`,
              zh: `class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();   // Map 记住插入顺序:最先 set 的排最前
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const v = this.map.get(key);
    this.map.delete(key);   // 删了再插 = 搬到「最新」那一端
    this.map.set(key, v);
    return v;
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.cap) {
      const oldest = this.map.keys().next().value; // 迭代的第一个 = 最旧
      this.map.delete(oldest);
    }
  }
}`,
            },
            hl: [10, 11, 19, 20],
            note: {
              en: (
                <>
                  A JavaScript Map is also a hash table combined with a structure
                  that preserves insertion order, and both delete and set are
                  O(1), so this has the same structure as the hand-written
                  version.
                </>
              ),
              zh: (
                <>
                  JS 的 Map 同样是「哈希表 + 保持插入顺序的结构」,
                  delete 和 set 都是 O(1) —— 和手写版是同一个原理。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{ en: "Complexity and follow-up questions", zh: "复杂度 & 面试追问" }}
        >
          <T
            en={
              <p>
                get and put are <b>O(1)</b> in time, and the space is
                O(capacity). Common follow-ups. ① &quot;Why must the list be
                doubly linked?&quot; Unlinking needs the predecessor; see option
                4 in §02. ② &quot;Why does the node store the key?&quot; To
                delete the matching hash map entry when the tail node is evicted.
                ③ &quot;How would you make it thread safe?&quot; One lock around
                the whole cache is the simplest answer; a stronger answer
                mentions sharding the cache with one lock per shard, or avoiding
                the problem as Redis does by processing commands on a single
                thread. ④ &quot;What if the capacity is very large?&quot; Use
                approximate LRU with sampling and drop the list, which is what
                Redis does.
              </p>
            }
            zh={
              <p>
                get / put 时间 <b>O(1)</b>,空间 O(capacity)。高频追问:
                ①「为什么必须双向链表?」摘除需要前驱,见 §02 的方案 4;
                ②「节点里为什么要存 key?」淘汰尾节点时要用它删掉对应的哈希条目;
                ③「多线程安全怎么做?」整体加一把锁最简单;
                更好的答案是分片、每片一把锁,或者像 Redis 那样用单线程处理命令来回避;
                ④「容量非常大怎么办?」改用采样的近似 LRU,省掉链表 —— Redis 的做法。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Example B" zh="精讲 B" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 307 ·{" "}
            <T en="Range Sum Query - Mutable" zh="区域和检索 - 数组可修改" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>Problem:</b> update(i, val) changes one element and
                sumRange(l, r) asks for a range sum, and the two are interleaved.
                <b> Why this combination:</b> prefix sums answer in O(1) but need
                O(n) per update; a plain array updates in O(1) but answers in
                O(n). When both operations are frequent, either extreme fails, so
                you need a structure that is O(log n) for both. That is what §04
                and §05 provide.
                <b> Step by step:</b> the segment tree paths were animated in the
                §04 lab, so here is the Fenwick tree version, showing how lowbit
                moves along the tree array.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>update(i, val) 单点改值,sumRange(l, r) 查区间和,两者交替出现。
                <b> 为什么这样拼:</b>前缀和查 O(1) 但改 O(n),裸数组改 O(1) 但查 O(n) ——
                两个操作都频繁时,任一极端都会被打爆,需要一个两边都 O(log n) 的结构,
                这正是 §04 和 §05 的主场。
                <b> 逐帧:</b>线段树的路径动画在 §04 实验室里玩过了,
                这里走一遍树状数组版,看 lowbit 怎么在 tree 数组上跳。
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 307 · Fenwick tree: add(3,+2) walks up three steps, query(7) walks down three steps",
            zh: "LC 307 · 树状数组版:add(3,+2) 上行三跳 + query(7) 下行三跳",
          }}
          frames={F307}
          cellW={60}
        />
        <CodeTabs
          title="lc307_fenwick_solution"
          java={{
            code: {
              en: `class NumArray {
    private final int n;
    private final int[] a;      // the original array: update needs the old value
    private final int[] tree;   // the Fenwick tree (1-based)

    public NumArray(int[] nums) {
        n = nums.length;
        a = new int[n];
        tree = new int[n + 1];
        for (int i = 0; i < n; i++) update(i, nums[i]); // build with n adds
    }

    public void update(int index, int val) {
        int delta = val - a[index];   // a Fenwick tree only adds, so compute the change
        a[index] = val;
        for (int i = index + 1; i <= n; i += i & (-i))
            tree[i] += delta;         // problem is 0-based, the tree is 1-based
    }

    private int prefix(int i) {       // sum of a[0..i-1]
        int s = 0;
        for (; i > 0; i -= i & (-i)) s += tree[i];
        return s;
    }

    public int sumRange(int left, int right) {
        return prefix(right + 1) - prefix(left);  // difference of two prefix sums
    }
}`,
              zh: `class NumArray {
    private final int n;
    private final int[] a;      // 原数组:update 需要旧值来算差
    private final int[] tree;   // 树状数组(1-based)

    public NumArray(int[] nums) {
        n = nums.length;
        a = new int[n];
        tree = new int[n + 1];
        for (int i = 0; i < n; i++) update(i, nums[i]); // 逐个 add 建树
    }

    public void update(int index, int val) {
        int delta = val - a[index];   // 树状数组只会「加」,所以先算增量
        a[index] = val;
        for (int i = index + 1; i <= n; i += i & (-i))
            tree[i] += delta;         // 题面 0-based,树是 1-based
    }

    private int prefix(int i) {       // a[0..i-1] 的和
        int s = 0;
        for (; i > 0; i -= i & (-i)) s += tree[i];
        return s;
    }

    public int sumRange(int left, int right) {
        return prefix(right + 1) - prefix(left);  // 两次前缀和相减
    }
}`,
            },
            hl: [14, 15, 16, 17],
            note: {
              en: (
                <>
                  <b>Easy to miss:</b> update is given the new value, not the
                  change, so adding val directly is wrong. Compute{" "}
                  <code>delta = val − a[i]</code> first, then add delta.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>update 给的是「新值」而不是「增量」,
                  直接把 val 加进去是错的 —— 先算{" "}
                  <code>delta = val − a[i]</code>,再把 delta 加上去。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class NumArray:
    def __init__(self, nums: list[int]):
        self.n = len(nums)
        self.a = [0] * self.n           # the original array, needed by update
        self.tree = [0] * (self.n + 1)  # the Fenwick tree (1-based)
        for i, v in enumerate(nums):
            self.update(i, v)           # build with n adds: O(n log n)

    def update(self, index: int, val: int) -> None:
        delta = val - self.a[index]     # the tree only adds, so compute the change
        self.a[index] = val
        i = index + 1                   # problem is 0-based, the tree is 1-based
        while i <= self.n:
            self.tree[i] += delta
            i += i & (-i)

    def _prefix(self, i: int) -> int:   # sum of a[0..i-1]
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= i & (-i)
        return s

    def sumRange(self, left: int, right: int) -> int:
        return self._prefix(right + 1) - self._prefix(left)`,
              zh: `class NumArray:
    def __init__(self, nums: list[int]):
        self.n = len(nums)
        self.a = [0] * self.n           # 原数组,update 需要用到
        self.tree = [0] * (self.n + 1)  # 树状数组(1-based)
        for i, v in enumerate(nums):
            self.update(i, v)           # 逐个 add 建树,O(n log n)

    def update(self, index: int, val: int) -> None:
        delta = val - self.a[index]     # 树只会「加」,所以先算增量
        self.a[index] = val
        i = index + 1                   # 题面 0-based,树是 1-based
        while i <= self.n:
            self.tree[i] += delta
            i += i & (-i)

    def _prefix(self, i: int) -> int:   # a[0..i-1] 的和
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= i & (-i)
        return s

    def sumRange(self, left: int, right: int) -> int:
        return self._prefix(right + 1) - self._prefix(left)`,
            },
            hl: [10, 11, 12, 13, 14, 15],
            note: {
              en: (
                <>
                  There is also an O(n) way to build the tree (copy the prefix
                  sums and subtract), but building with n separate adds in O(n
                  log n) is fine for problem solving.
                </>
              ),
              zh: (
                <>
                  建树还有一种 O(n) 的写法(先算前缀和再相减),
                  但刷题时用逐个 add 的 O(n log n) 已经够了。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `class NumArray {
  constructor(nums) {
    this.n = nums.length;
    this.a = new Array(this.n).fill(0);    // the original array, needed by update
    this.tree = new Array(this.n + 1).fill(0); // the Fenwick tree (1-based)
    nums.forEach((v, i) => this.update(i, v)); // build with n adds
  }

  update(index, val) {
    const delta = val - this.a[index];  // the tree only adds, so compute the change
    this.a[index] = val;
    for (let i = index + 1; i <= this.n; i += i & (-i))
      this.tree[i] += delta;            // problem is 0-based, the tree is 1-based
  }

  _prefix(i) {                          // sum of a[0..i-1]
    let s = 0;
    for (; i > 0; i -= i & (-i)) s += this.tree[i];
    return s;
  }

  sumRange(left, right) {
    return this._prefix(right + 1) - this._prefix(left);
  }
}`,
              zh: `class NumArray {
  constructor(nums) {
    this.n = nums.length;
    this.a = new Array(this.n).fill(0);    // 原数组,update 需要用到
    this.tree = new Array(this.n + 1).fill(0); // 树状数组(1-based)
    nums.forEach((v, i) => this.update(i, v)); // 逐个 add 建树
  }

  update(index, val) {
    const delta = val - this.a[index];  // 树只会「加」,所以先算增量
    this.a[index] = val;
    for (let i = index + 1; i <= this.n; i += i & (-i))
      this.tree[i] += delta;            // 题面 0-based,树是 1-based
  }

  _prefix(i) {                          // a[0..i-1] 的和
    let s = 0;
    for (; i > 0; i -= i & (-i)) s += this.tree[i];
    return s;
  }

  sumRange(left, right) {
    return this._prefix(right + 1) - this._prefix(left);
  }
}`,
            },
            hl: [10, 11, 12, 13],
            note: {
              en: (
                <>
                  The segment tree solution is in §04. Both are accepted, and the
                  Fenwick version is less than half the code.
                </>
              ),
              zh: (
                <>
                  线段树版解法在 §04。两版都能通过,树状数组版的代码量不到一半。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{ en: "Complexity and follow-up questions", zh: "复杂度 & 面试追问" }}
        >
          <T
            en={
              <p>
                In both versions update and query are <b>O(log n)</b>. The
                Fenwick tree uses n+1 space and the segment tree uses 4n.
                Follow-ups. ① &quot;When do you need a segment tree?&quot; For
                range minimum or maximum, range updates, or any merge whose
                result cannot be recovered by subtracting two prefixes. ②
                &quot;What about two dimensions?&quot; LC 304 is immutable, so a
                2D prefix sum works. If it were mutable, use a 2D Fenwick tree
                with nested lowbit loops. ③ &quot;Why must update compute
                delta?&quot; Because the tree&apos;s primitive operation is add,
                not assign: each cell holds the sum of a segment, so you cannot
                overwrite it with a single element&apos;s value.
              </p>
            }
            zh={
              <p>
                两个版本的 update / query 都是 <b>O(log n)</b>;
                树状数组占 n+1 空间,线段树占 4n。追问:
                ①「什么时候必须用线段树?」区间最值、区间修改,
                或任何「结果无法用两个前缀相减还原」的合并;
                ②「二维怎么办?」LC 304 不可变,用二维前缀和;
                可变就用二维树状数组,两重 lowbit 循环;
                ③「为什么 update 要先算 delta?」因为树的原语是「加」而不是「赋值」——
                每个格子存的是一段的和,不能直接用某个元素的新值覆盖。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Example C" zh="精讲 C" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 380 ·{" "}
            <T
              en="Insert Delete GetRandom O(1)"
              zh="O(1) 时间插入、删除和获取随机元素"
            />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>Problem:</b> design a set where insert, remove, and getRandom
                (return a uniformly random member) are all O(1). You may have
                seen it in the hashing chapter; here we derive it again with the{" "}
                <b>method from §01</b>: list the operations, find where a single
                structure goes over budget, add a second structure for that
                operation.
                <b> Ruling out:</b> a hash set alone gives O(1) insert and
                remove, but getRandom fails, because the bucket array is full of
                empty slots and probing random buckets can miss many times in a
                row, so uniform sampling is not O(1). An array alone gives a
                perfect getRandom (a random index), but remove has to find the
                value first, which is O(n), and then close the hole, which is
                another O(n).
                <b> Combining:</b> the array stores the values, which handles
                random selection, and the hash map stores{" "}
                <code>value → index</code>, which handles lookup. One problem is
                left: deleting from the middle of an array shifts elements. The
                fix is the technique from chapter 1, swapping with the last
                element before removing.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>设计一个集合,insert / remove / getRandom(等概率随机返回一个成员)
                全部 O(1)。哈希那一章可能见过它,这次用 §01 的<b>组合方法</b>重新推一遍:
                列出操作 → 找出单一结构在哪超预算 → 补一个结构专门做那件事。
                <b> 排除:</b>只用哈希集合,insert / remove 是 O(1),但 getRandom 不行 ——
                桶数组里布满空桶,随机探桶可能连续踩空,做不到 O(1) 的等概率抽样。
                只用数组,getRandom 完美(随机下标),但 remove 要先找到值(O(n)),
                再把洞补上(又 O(n))。
                <b> 组合:</b>数组存值,负责随机;哈希表存 <code>值 → 下标</code>,负责定位。
                还剩一个问题:数组中间删除要搬移元素。
                解法是第 1 章的老办法 —— 先和末尾元素交换,再删末尾。
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 380 · array + hash map, swapping with the last element",
            zh: "LC 380 · 数组 + 哈希,和末尾交换再删,逐帧",
          }}
          frames={F380}
        />
        <CodeTabs
          title="lc380_randomized_set"
          java={{
            code: {
              en: `class RandomizedSet {
    private final List<Integer> arr = new ArrayList<>();   // values with no gaps
    private final Map<Integer, Integer> idx = new HashMap<>(); // value -> index
    private final Random rand = new Random();

    public boolean insert(int val) {
        if (idx.containsKey(val)) return false;
        idx.put(val, arr.size());    // remember where the new value lives
        arr.add(val);                // append, amortized O(1)
        return true;
    }

    public boolean remove(int val) {
        Integer i = idx.get(val);
        if (i == null) return false;
        int last = arr.get(arr.size() - 1);
        arr.set(i, last);            // the last element fills the hole
        idx.put(last, i);            // update its index in the same step
        arr.remove(arr.size() - 1);  // remove from the end, O(1)
        idx.remove(val);
        return true;
    }

    public int getRandom() {
        return arr.get(rand.nextInt(arr.size())); // random index: probability 1/size
    }
}`,
              zh: `class RandomizedSet {
    private final List<Integer> arr = new ArrayList<>();   // 值紧凑排一排,没有空洞
    private final Map<Integer, Integer> idx = new HashMap<>(); // 值 -> 下标
    private final Random rand = new Random();

    public boolean insert(int val) {
        if (idx.containsKey(val)) return false;
        idx.put(val, arr.size());    // 记住新值住在哪
        arr.add(val);                // 尾部追加,均摊 O(1)
        return true;
    }

    public boolean remove(int val) {
        Integer i = idx.get(val);
        if (i == null) return false;
        int last = arr.get(arr.size() - 1);
        arr.set(i, last);            // 末尾元素补到被删的位置
        idx.put(last, i);            // 在同一步里更新它的下标
        arr.remove(arr.size() - 1);  // 尾删,O(1)
        idx.remove(val);
        return true;
    }

    public int getRandom() {
        return arr.get(rand.nextInt(arr.size())); // 随机下标:每个元素概率 1/size
    }
}`,
            },
            hl: [16, 17, 18, 19],
            note: {
              en: (
                <>
                  <b>Easy to miss:</b> <code>idx.put(last, i)</code> must come
                  before <code>idx.remove(val)</code>. If the value being removed
                  is the last element, then last equals val, and the reverse
                  order would re-add the entry you just deleted. The order used
                  here is correct in both cases.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b><code>idx.put(last, i)</code> 必须写在{" "}
                  <code>idx.remove(val)</code> 之前。如果被删的恰好是末尾元素,
                  last 就等于 val,顺序反了会把刚删掉的条目又加回来。
                  这里的顺序在两种情况下都正确。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `import random

class RandomizedSet:
    def __init__(self):
        self.arr = []       # values with no gaps: this is what getRandom needs
        self.idx = {}       # value -> its index in the array

    def insert(self, val: int) -> bool:
        if val in self.idx:
            return False
        self.idx[val] = len(self.arr)   # remember where the new value lives
        self.arr.append(val)            # append, amortized O(1)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.idx:
            return False
        i, last = self.idx[val], self.arr[-1]
        self.arr[i] = last              # the last element fills the hole
        self.idx[last] = i              # update its index in the same step
        self.arr.pop()                  # remove from the end, O(1)
        del self.idx[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self.arr)  # random index: probability 1/size`,
              zh: `import random

class RandomizedSet:
    def __init__(self):
        self.arr = []       # 值紧凑排一排,没有空洞,这是 getRandom 的前提
        self.idx = {}       # 值 -> 它在数组里的下标

    def insert(self, val: int) -> bool:
        if val in self.idx:
            return False
        self.idx[val] = len(self.arr)   # 记住新值住在哪
        self.arr.append(val)            # 尾部追加,均摊 O(1)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.idx:
            return False
        i, last = self.idx[val], self.arr[-1]
        self.arr[i] = last              # 末尾元素补到被删的位置
        self.idx[last] = i              # 在同一步里更新它的下标
        self.arr.pop()                  # 尾删,O(1)
        del self.idx[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self.arr)  # 随机下标:每个元素概率 1/size`,
            },
            hl: [18, 19, 20, 21],
            note: {
              en: (
                <>
                  When the removed value is the last element,{" "}
                  <code>self.arr[i] = last</code> assigns it to itself and{" "}
                  <code>idx[last] = i</code> is deleted again by the following{" "}
                  <code>del</code>, so that edge case needs no special handling.
                </>
              ),
              zh: (
                <>
                  被删的恰好是末尾元素时,<code>self.arr[i] = last</code>{" "}
                  是自己赋给自己,<code>idx[last] = i</code> 又被下一行的{" "}
                  <code>del</code> 删掉 —— 这个边界不需要特殊处理。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `class RandomizedSet {
  constructor() {
    this.arr = [];          // values with no gaps: this is what getRandom needs
    this.idx = new Map();   // value -> its index in the array
  }

  insert(val) {
    if (this.idx.has(val)) return false;
    this.idx.set(val, this.arr.length); // remember where the new value lives
    this.arr.push(val);                 // append, amortized O(1)
    return true;
  }

  remove(val) {
    if (!this.idx.has(val)) return false;
    const i = this.idx.get(val);
    const last = this.arr[this.arr.length - 1];
    this.arr[i] = last;                 // the last element fills the hole
    this.idx.set(last, i);              // update its index in the same step
    this.arr.pop();                     // remove from the end, O(1)
    this.idx.delete(val);
    return true;
  }

  getRandom() {
    const i = Math.floor(Math.random() * this.arr.length);
    return this.arr[i];                 // random index: probability 1/size
  }
}`,
              zh: `class RandomizedSet {
  constructor() {
    this.arr = [];          // 值紧凑排一排,没有空洞,这是 getRandom 的前提
    this.idx = new Map();   // 值 -> 它在数组里的下标
  }

  insert(val) {
    if (this.idx.has(val)) return false;
    this.idx.set(val, this.arr.length); // 记住新值住在哪
    this.arr.push(val);                 // 尾部追加,均摊 O(1)
    return true;
  }

  remove(val) {
    if (!this.idx.has(val)) return false;
    const i = this.idx.get(val);
    const last = this.arr[this.arr.length - 1];
    this.arr[i] = last;                 // 末尾元素补到被删的位置
    this.idx.set(last, i);              // 在同一步里更新它的下标
    this.arr.pop();                     // 尾删,O(1)
    this.idx.delete(val);
    return true;
  }

  getRandom() {
    const i = Math.floor(Math.random() * this.arr.length);
    return this.arr[i];                 // 随机下标:每个元素概率 1/size
  }
}`,
            },
            hl: [17, 18, 19, 20],
            note: {
              en: (
                <>
                  Three lines carry the whole idea: copy the last element into
                  the hole, update the hash map, remove from the end. The same
                  technique appears in many problems that need O(1) deletion from
                  an unordered collection.
                </>
              ),
              zh: (
                <>
                  核心就是三行:把末尾元素补到洞里、更新哈希表、尾删。
                  很多需要「从无序集合中 O(1) 删除」的题目都用这个办法。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{ en: "Complexity and follow-up questions", zh: "复杂度 & 面试追问" }}
        >
          <T
            en={
              <p>
                All three operations are <b>O(1)</b> (insert is amortized), and
                the space is O(n). Follow-ups. ① &quot;What if duplicates are
                allowed?&quot; That is LC 381: the hash map value becomes a set
                of indices, and the swap needs care when the two values are
                equal. It is considerably harder and worth doing. ② &quot;Why
                can a hash table not do getRandom on its own?&quot; Its bucket
                array contains empty slots, so uniform sampling either scans O(capacity)
                buckets or uses rejection sampling with no bound on the number of
                attempts. ③ &quot;How do you prove getRandom is uniform?&quot;
                The array has no gaps, so each index is chosen with probability
                exactly 1/size. Notice what this problem shares with LRU:{" "}
                <b>
                  each member of the pair contributes one O(1) operation, and
                  together they cover everything the problem asks for
                </b>
                .
              </p>
            }
            zh={
              <p>
                三个操作全是 <b>O(1)</b>(insert 是均摊),空间 O(n)。追问:
                ①「允许重复元素呢?」那是 LC 381:哈希表的 value 改成「下标集合」,
                交换时要小心两个值相等的情况;难度明显更高,值得一做。
                ②「为什么哈希表单独做不了 getRandom?」
                桶数组里有空槽,等概率抽样要么扫描 O(容量) 个桶,
                要么用拒绝采样、尝试次数没有上界。
                ③「怎么证明 getRandom 是等概率的?」数组没有空洞,
                每个下标被选中的概率恰好是 1/size。注意这道题和 LRU 的共同点:
                <b>组合里的每个成员各提供一个 O(1) 操作,合起来覆盖题目要求的全部操作</b>。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §09 题单 ================= */}
      <Section
        id="problems"
        index="09"
        title={{
          en: "Problem set: 8 composite structures",
          zh: "高频题单:组合机器 8 题",
        }}
        desc={{
          en: "Easiest first. Do 303 and 307 together as a pair, then work through the three hard ones.",
          zh: "由易到难。先把 303 和 307 当一对做完,再啃三道 Hard",
        }}
        badge={
          <span className="chip">
            <T en="Final problem set" zh="压轴题单" />
          </span>
        }
      >
        <ProblemSet ch="advanced" items={PROBLEMS} />
      </Section>

      {/* ================= §10 Quiz ================= */}
      <Section
        id="quiz"
        index="10"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 7 correctly to complete the last chapter",
          zh: "7 题全对,点亮全书最后一盏绿灯",
        }}
        badge={
          <span className="chip">
            ✎ <T en="Quiz" zh="通关测验" />
          </span>
        }
      >
        <Quiz ch="advanced" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                <b>
                  The method: list every operation and its complexity budget,
                  then pick base structures that cover each other
                </b>
                . Each member performs only the operation it can finish in O(1)
                or O(log n), and the two are joined by storing references to each
                other and updating all members in the same step.
              </>
            ),
            zh: (
              <>
                <b>组合设计的方法:先列出全部操作和每个操作的复杂度预算,再挑能互相补位的基础结构</b>
                —— 每个成员只做自己 O(1)/O(log n) 的操作,
                两者通过「互存引用 + 同一步更新所有成员」连接起来。
              </>
            ),
          },
          {
            en: (
              <>
                LRU = hash map (answers &quot;where&quot;) + doubly linked list
                (answers &quot;how old&quot;), with get and put both O(1).{" "}
                <b>The list must be doubly linked</b>, because unlinking a node
                updates its predecessor&apos;s next pointer and a singly linked
                node cannot reach its predecessor. The node must store the key,
                so the matching hash map entry can be deleted on eviction. Java
                gives you the same machine as LinkedHashMap with accessOrder =
                true.
              </>
            ),
            zh: (
              <>
                LRU = 哈希表(回答「在哪」)+ 双向链表(回答「多旧」),get/put 全 O(1)。
                <b>必须双向</b>:摘除节点要改前驱的 next,而单链表的节点拿不到前驱;
                节点里要存 key,淘汰时才能删掉对应的哈希条目。
                Java 的 <code>LinkedHashMap</code> 配 accessOrder = true 就是同一台机器。
              </>
            ),
          },
          {
            en: (
              <>
                LFU is harder than LRU because the frequency changes on every
                access. O(1) needs a frequency map, one time-ordered list per
                frequency, and a minFreq pointer. The eviction rule is: least
                frequently used, and among those, least recently used.
              </>
            ),
            zh: (
              <>
                LFU 比 LRU 难,因为频次每访问一次就变。做到 O(1) 需要三样东西:
                频次哈希表、每个频次一条按时间排序的链表、以及一个 minFreq 变量。
                淘汰规则是:频次最低者中最久未用的那个。
              </>
            ),
          },
          {
            en: (
              <>
                Range queries in three cases:{" "}
                <b>
                  queries only means prefix sums with O(1) queries; updates mixed
                  with queries means a segment tree or a Fenwick tree, both O(log
                  n)
                </b>
                . A segment tree handles any associative merge and, with lazy
                propagation, range updates in O(log n) instead of O(n log n). A
                Fenwick tree is about 15 lines and uses{" "}
                <code>lowbit = x &amp; (−x)</code> to isolate the lowest set bit,
                but it only works for operations recoverable by subtracting two
                prefixes, and it must be 1-based.
              </>
            ),
            zh: (
              <>
                区间统计三种情况:
                <b>
                  只查不改 → 前缀和,查询 O(1);又改又查 → 线段树或树状数组,
                  两者都是 O(log n)
                </b>
                。线段树能挂任何满足结合律的合并,配懒标记后区间修改是 O(log n)
                而不是 O(n log n)。树状数组约 15 行,靠{" "}
                <code>lowbit = x &amp; (−x)</code> 取出最低位的 1,
                但只适用于「答案能由两个前缀相减还原」的运算,而且必须 1-based。
              </>
            ),
          },
          {
            en: (
              <>
                Skip list = sorted linked list +{" "}
                <b>index levels grown by coin flips</b>: expected O(log n), where
                the expectation is over the coin flips and not over the input, so
                there is no bad input. Randomization replaces the rotation
                maintenance of a balanced tree. It is the structure behind the
                Redis sorted set (skip list + hash table) and the LevelDB
                MemTable.
              </>
            ),
            zh: (
              <>
                跳表 = 有序链表 + <b>抛硬币长出来的多层索引</b>:期望 O(log n),
                而且期望是对抛硬币取的、与输入无关,所以没有「最坏输入」。
                用随机化替掉平衡树的旋转维护 ——
                Redis zset(跳表 + 哈希表)和 LevelDB MemTable 的骨架。
              </>
            ),
          },
          {
            en: (
              <>
                Bloom filter = bit array + k hash functions:{" "}
                <b>
                  &quot;not present&quot; is certain, &quot;present&quot; is only
                  possible
                </b>
                , because bits only go from 0 to 1. You cannot delete from a
                plain one, and the false positive rate depends on the bit array
                size, the number of hash functions, and the number of inserted
                elements. It is a first filter, not a faster set.
              </>
            ),
            zh: (
              <>
                布隆过滤器 = 位数组 + k 个哈希函数:
                <b>说「不在」是确定的,说「在」只是可能</b>,因为位只会从 0 变 1。
                普通布隆过滤器不能删除;误判率取决于位数组大小、哈希函数个数、
                以及实际插入的元素个数。它是一道前置过滤门,不是更快的集合。
              </>
            ),
          },
          {
            en: (
              <>
                None of these six machines uses a new base structure. Arrays,
                linked lists, hash maps, trees, and bit operations all came from
                the first 12 chapters.{" "}
                <b>
                  For a design question: restate the operations and the
                  complexity target, then name the combination, then point out
                  yourself what has to be kept in sync between the two structures
                </b>
                .
              </>
            ),
            zh: (
              <>
                这六台机器没有用到任何新的基础结构 ——
                数组、链表、哈希表、树、位运算全部来自前 12 章。
                <b>
                  面试设计题的做法:先复述操作需求和复杂度目标,再报出结构组合,
                  最后主动指出两个结构之间必须同步的地方
                </b>
                。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="advanced" />
    </main>
  );
}
