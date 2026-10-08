// Chapter 13 · Composition and advanced structures — problem set.
// The closing quiz is in lib/advanced-quiz.tsx; /atlas imports only this file.
// Problems are picked around this chapter's "composite machines": LRU/LFU (hash table +
// linked list), the prefix-sum baseline, segment tree / Fenwick tree, skip list, plus one
// design problem that ties back to the hash table chapter.
// hint points a direction without spoilers; key explains the optimal solution in one paragraph.
//
// Bilingual: title / tags / hint / key are all { en, zh } pairs; problem titles use the official LeetCode English names.

import type { Problem } from "@/lib/problems";

export const PROBLEMS: Problem[] = [
  {
    lc: 303,
    title: { en: "Range Sum Query - Immutable", zh: "区域和检索 - 数组不可变" },
    d: "easy",
    tags: [
      { en: "prefix sum", zh: "前缀和" },
      { en: "choosing a structure", zh: "选型对照组" },
    ],
    hint: {
      en: "The array never changes after it is loaded, and you only ask for range sums. Do you really need a segment tree here? Think about the cheapest structure that still answers every query fast.",
      zh: "数据加载后永远不改、只查区间和 —— 真的需要线段树这种重型结构吗?先想想最便宜的方案。",
    },
    key: {
      en: (
        <>
          Prefix sums. Let pre[i] be the sum of the first i elements. Then
          sumRange(l, r) = pre[r+1] − pre[l]. Building the table costs O(n) once,
          and every query after that is O(1). Compare this problem with LC 307:
          the only difference is that the array becomes mutable, and that single
          change is what forces you to move from three lines of prefix sums to a
          segment tree. These two problems are the clearest example of how the
          operation mix decides the structure.
        </>
      ),
      zh: (
        <>
          前缀和:pre[i] = 前 i 个元素之和,sumRange(l, r) = pre[r+1] − pre[l]。
          预处理 O(n),此后每次查询 O(1),实现只要三行。把它和 LC 307
          放在一起看:两题只差「数组能不能改」这一个条件,答案就从三行前缀和
          变成一棵线段树 —— 操作组合决定选型,这对姊妹题讲得最清楚。
        </>
      ),
    },
  },
  {
    lc: 705,
    title: { en: "Design HashSet", zh: "设计哈希集合" },
    d: "easy",
    tags: [
      { en: "design", zh: "设计" },
      { en: "array + linked list", zh: "数组+链表" },
      { en: "hashing review", zh: "哈希回顾" },
    ],
    hint: {
      en: "This is chapter 6 again: an array of buckets plus separate chaining. You already know enough to build one from scratch.",
      zh: "回头串联第 6 章:桶数组 + 链地址法,你完全有能力从零实现一个。",
    },
    key: {
      en: (
        <>
          Use a prime number of buckets, for example 769. Each bucket holds a
          linked list (or a small dynamic array). hash(key) = key % 769 picks the
          bucket, and a linear scan inside that bucket resolves collisions. add,
          remove, and contains are O(1) on average. Read it with this chapter in
          mind: a hash set is itself an array combined with linked lists, so you
          already met composite design back in chapter 6.
        </>
      ),
      zh: (
        <>
          取一个质数当桶数(比如 769),每个桶挂一条链表(或小的动态数组):
          hash(key) = key % 769 定位桶,桶内线性查找处理冲突。add / remove /
          contains 平均 O(1)。用本章的眼光重看:哈希集合本身就是「数组 + 链表」
          拼出来的组合结构 —— 你在第 6 章就已经见过组合设计了。
        </>
      ),
    },
  },
  {
    lc: 146,
    title: { en: "LRU Cache", zh: "LRU 缓存" },
    d: "medium",
    tags: [
      { en: "hash map + doubly linked list", zh: "哈希+双向链表" },
      { en: "O(1) design", zh: "O(1) 设计" },
      { en: "core of this chapter", zh: "本章重头戏" },
    ],
    hint: {
      en: "Both get and put must be O(1). One structure answers \"where is this key\", the other answers \"how old is it\". Neither can do the other's job.",
      zh: "get/put 都要 O(1):一个结构回答「在哪」,另一个回答「多旧」,谁也替代不了谁。",
    },
    key: {
      en: (
        <>
          The hash map stores key to node reference, so you reach any node in one
          step. The doubly linked list keeps the nodes in access order, newest at
          the head and oldest at the tail. On a get hit, unlink the node and link
          it back at the head. On a put that exceeds capacity, unlink tail.prev
          and <b>also delete its hash map entry</b>. Dummy head and tail nodes
          remove every null check. The list must be doubly linked: unlinking a
          node means updating its predecessor&apos;s next pointer, and a singly
          linked node has no way to reach its predecessor. §02 has the full
          derivation, a line-by-line implementation, and an interactive lab.
        </>
      ),
      zh: (
        <>
          哈希表存 key → 链表节点引用(一步定位),双向链表按访问序排列
          (头新尾旧,维护顺序)。get 命中就把节点摘下来插回头部;put 超容量就摘掉
          tail.prev,并<b>同步删除</b>它的哈希条目。哑头哑尾省掉全部判空。
          必须双向:摘除一个节点要改前驱的 next,单链表的节点拿不到前驱。§02
          有完整推导 + 逐行实现 + 交互实验室。
        </>
      ),
    },
  },
  {
    lc: 304,
    title: {
      en: "Range Sum Query 2D - Immutable",
      zh: "二维区域和检索 - 矩阵不可变",
    },
    d: "medium",
    tags: [
      { en: "2D prefix sum", zh: "二维前缀和" },
      { en: "inclusion-exclusion", zh: "容斥" },
    ],
    hint: {
      en: "Extend prefix sums to two dimensions. Take the big rectangle, subtract the strip above and the strip on the left, and notice that one corner block was subtracted twice.",
      zh: "把一维前缀和推广到二维:大矩形减掉上面一条、左边一条 —— 但左上角那一块被减了两次。",
    },
    key: {
      en: (
        <>
          Let pre[i][j] be the sum of the rectangle from (0,0) to (i−1,j−1). Then
          any submatrix sum is pre[r2+1][c2+1] − pre[r1][c2+1] − pre[r2+1][c1] +
          pre[r1][c1]. You subtract the top strip and the left strip, the
          top-left block gets subtracted twice, so you add it back once. Building
          the table is O(mn) and each query is O(1). The build step uses the same
          idea: pre[i][j] = element + above + left − top-left.
        </>
      ),
      zh: (
        <>
          pre[i][j] = 以 (0,0) 到 (i−1,j−1) 为对角的矩形和。任意子矩形 =
          pre[r2+1][c2+1] − pre[r1][c2+1] − pre[r2+1][c1] + pre[r1][c1]:
          减上、减左,左上角那块被减了两次,再加回来一次。预处理 O(mn),查询 O(1)。
          建表时用同一个思路:pre[i][j] = 元素 + 上 + 左 − 左上。
        </>
      ),
    },
  },
  {
    lc: 307,
    title: { en: "Range Sum Query - Mutable", zh: "区域和检索 - 数组可修改" },
    d: "medium",
    tags: [
      { en: "segment tree", zh: "线段树" },
      { en: "Fenwick tree", zh: "树状数组" },
      { en: "update + query", zh: "改+查" },
    ],
    hint: {
      en: "Updates and queries are mixed. A prefix sum table has to be rebuilt in O(n) after every update. Either of the two range structures in this chapter solves it.",
      zh: "又要改又要查,前缀和一改就要 O(n) 重建 —— 本章两台「区间机器」任选其一。",
    },
    key: {
      en: (
        <>
          Segment tree: update walks from the leaf back up to the root, and query
          handles three cases per node (no overlap, full cover, partial overlap).
          Both are O(log n), and §04 has the line-by-line implementation. Fenwick
          tree: about 60% as much code. update first computes delta = val −
          a[i], then adds delta along i += lowbit(i). A prefix query walks i −=
          lowbit(i) and adds up the segments, and a range sum is the difference
          of two prefix sums. Walkthrough B compares both solutions.
        </>
      ),
      zh: (
        <>
          线段树:update 从叶到根回溯重算,query 分三种相交情况处理,双 O(log n)
          (§04 有逐行实现)。树状数组:代码量约为线段树的六成 —— update 先算
          delta = val − a[i],再沿 i += lowbit(i) 一路加上去;查询沿
          i −= lowbit(i) 拼前缀和,区间和 = 两次前缀相减。精讲 B 有两种解法的完整对照。
        </>
      ),
    },
  },
  {
    lc: 460,
    title: { en: "LFU Cache", zh: "LFU 缓存" },
    d: "hard",
    tags: [
      { en: "frequency buckets", zh: "频次分桶" },
      { en: "two hash maps", zh: "双哈希" },
      { en: "minFreq", zh: "minFreq" },
    ],
    hint: {
      en: "One dimension more than LRU: compare use counts first, and break ties by which key was used least recently. Try giving every frequency its own bucket.",
      zh: "比 LRU 多一个维度:先比使用次数,次数相同再比「最近」。试着给每个频次开一个桶。",
    },
    key: {
      en: (
        <>
          Three pieces of state: key to (value, freq); freq to an ordered bucket
          holding every key with that frequency (ordered by time, so each bucket
          is a small LRU); and a minFreq variable. A hit moves the key from the
          freq bucket into the freq+1 bucket. An eviction removes the oldest key
          in the minFreq bucket, which is exactly the least recently used key
          among the least frequently used ones. minFreq never needs a search: it
          increases by 1 when the old bucket becomes empty, and it resets to 1
          whenever a new key is inserted. Every operation is O(1). §03 has the
          bucket diagram and the core implementation in three languages.
        </>
      ),
      zh: (
        <>
          三份状态:key → (val, freq);freq → 该频次的有序桶(桶内按时间序,
          天然是个小 LRU);再加一个 minFreq 变量。访问 = 把 key 从 freq 桶搬进
          freq+1 桶;淘汰 = 移除 minFreq 桶里最老的 key,也就是「频次最低者中最久未用的那个」。
          minFreq 不用搜索:旧桶被搬空时 +1,插入新 key 时归 1。所有操作 O(1)。
          §03 有分桶图解和三语言核心实现。
        </>
      ),
    },
  },
  {
    lc: 315,
    title: {
      en: "Count of Smaller Numbers After Self",
      zh: "计算右侧小于当前元素的个数",
    },
    d: "hard",
    tags: [
      { en: "Fenwick tree", zh: "树状数组" },
      { en: "coordinate compression", zh: "离散化" },
      { en: "scan right to left", zh: "倒序扫描" },
    ],
    hint: {
      en: "Scan from right to left. The question becomes: among the values already seen, how many are smaller than the current one? That is a prefix count that keeps changing.",
      zh: "从右往左扫,问题就变成:「已经出现过的数里,比我小的有几个?」—— 一个会不断变化的计数前缀和。",
    },
    key: {
      en: (
        <>
          First compress the values into ranks 1..n (sort, remove duplicates,
          then binary search each value). Walk the array from right to left:
          ans[i] = query(rank − 1), which counts the already registered values
          smaller than this one, then call add(rank, 1) to register the current
          value. &quot;Insert and ask for a prefix count at the same time&quot;
          is exactly what a Fenwick tree is for, and the whole solution is O(n
          log n). Counting inversions with merge sort also works, but the Fenwick
          version is much shorter.
        </>
      ),
      zh: (
        <>
          先把数值离散化成排名 1..n(排序去重后二分定位)。从右到左遍历:ans[i] =
          query(rank − 1)(已登记的、比它小的个数),然后 add(rank, 1) 把自己登记进去。
          「边插入、边问前缀和」正是树状数组的主场,整体 O(n log n)。
          归并排序统计逆序对也能解,但 BIT 版短得多。
        </>
      ),
    },
  },
  {
    lc: 1206,
    title: { en: "Design Skiplist", zh: "设计跳表" },
    d: "hard",
    tags: [
      { en: "skip list", zh: "跳表" },
      { en: "randomization", zh: "随机化" },
      { en: "multi-level index", zh: "多层索引" },
    ],
    hint: {
      en: "A sorted linked list plus several express lanes above it. Start at the top level, move right while you can, and drop down one level when the next node would overshoot. A coin flip decides how tall a new node is.",
      zh: "有序链表 + 多层「快线」:从最高层开始,向右走,过头就下楼。插入时抛硬币决定新节点有几层。",
    },
    key: {
      en: (
        <>
          Each node stores an array next[] whose length is the node&apos;s
          height. search starts at the top level, moves right while the next
          value is smaller than the target, and drops a level otherwise. add
          walks the same way first and records the last node visited on each
          level in update[i], then performs an ordinary linked-list insertion on
          each of its levels. The height comes from repeated coin flips, so each
          extra level has probability 1/2. erase walks the same way and then
          bypasses the target node level by level. Expected cost is O(log n), and
          §06 has the full implementation in three languages.
        </>
      ),
      zh: (
        <>
          每个节点存一个 next[] 指针数组(长度 = 它的层数)。search
          从顶层开始,右邻比目标小就向右走,否则下楼;add 先像 search
          一样走一遍、记下每层最后停留的节点 update[i],再逐层做普通链表插入
          (层数由抛硬币决定:每多长一层的概率是 1/2);erase 同理逐层绕过目标节点。
          期望 O(log n),§06 有完整三语言实现。
        </>
      ),
    },
  },
];
