// Chapter 13 · Composition and advanced structures — problem set and quiz data.
// Problems are picked around this chapter's "composite machines": LRU/LFU (hash table +
// linked list), the prefix-sum baseline, segment tree / Fenwick tree, skip list, plus one
// design problem that ties back to the hash table chapter.
// hint points a direction without spoilers; key explains the optimal solution in one paragraph.
//
// Bilingual: title / tags / hint / key are all { en, zh } pairs; problem titles use the official LeetCode English names.

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

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
          tree: about a quarter of the code. update first computes delta = val −
          a[i], then adds delta along i += lowbit(i). A prefix query walks i −=
          lowbit(i) and adds up the segments, and a range sum is the difference
          of two prefix sums. Worked example B compares both solutions.
        </>
      ),
      zh: (
        <>
          线段树:update 从叶到根回溯重算,query 分三种相交情况处理,双 O(log n)
          (§04 有逐行实现)。树状数组:码量只有四分之一 —— update 先算
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
          freq+1 桶;淘汰 = 掐掉 minFreq 桶里最老的 key,也就是「频次最低者中最久未用的那个」。
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

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "In a hand-written LRU cache the hash map already reaches any list node in O(1). So why does the list still have to be doubly linked?",
      zh: "手写 LRU 时,哈希表已经能 O(1) 定位到链表节点了,为什么链表还必须是双向的?",
    },
    opts: [
      {
        en: "Unlinking a node means updating its predecessor's next pointer. A singly linked node cannot reach its predecessor, so finding it costs O(n). A doubly linked node carries prev, so unlinking is O(1).",
        zh: "摘除节点要改前驱的 next —— 单链表拿到节点却拿不到前驱,找前驱要从头扫 O(n);双向链表自带 prev,摘除 O(1)",
      },
      {
        en: "A doubly linked list searches twice as fast as a singly linked one",
        zh: "双向链表查找元素比单链表快一倍",
      },
      { en: "A doubly linked list uses less memory", zh: "双向链表更省内存" },
      {
        en: "It is only a coding habit; a singly linked list can reach O(1) for every operation too",
        zh: "只是编码习惯,单链表也能做到全部 O(1)",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Searching is never the list's job here. Locating a node is the hash map's work. The list only maintains the access order and does O(1) unlink and insert, and the number of pointers per node does not change search speed.",
        zh: "查找从来不是链表的活 —— 定位靠哈希表。链表只负责维护访问顺序和 O(1) 摘除/插入,双向与否不改变查找速度。",
      },
      {
        en: "The opposite is true. Every node stores one extra prev pointer, so the list uses more memory. That extra memory is what buys O(1) unlinking.",
        zh: "恰恰相反:每个节点多存一个 prev 指针,内存是变多的 —— 多花的内存买的正是 O(1) 摘除。",
      },
      {
        en: "The problem shows up in get: moving the hit node to the head requires unlinking it first, and unlinking requires the predecessor's next pointer. In a singly linked list, finding the predecessor means scanning from the head, which is O(n). (Copying the successor's value and deleting the successor instead would invalidate the node references stored in the hash map.)",
        zh: "卡点在 get:把命中节点搬到头部要先摘除它,摘除要改前驱的 next,而单链表找前驱只能从头扫 O(n)。(「拷贝后继的值再删后继」这种写法会让哈希表里存的节点引用集体失效,得不偿失。)",
      },
    ],
    why: {
      en: "The hash map answers \"where is this key\" and the list answers \"how old is it\". Unlinking a node updates both its predecessor and its successor, and only a doubly linked list reaches the predecessor in O(1). That is exactly the joint between the two structures, and the step interviewers ask about most.",
      zh: "哈希表回答「在哪」,链表回答「多旧」。摘除一个节点要同时改前驱和后继的指针,只有双向链表能 O(1) 拿到前驱 —— 这正是两个结构拼装的接缝处,也是面试官最爱追问的一步。",
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          In Java, <code>new LinkedHashMap&lt;&gt;(cap, 0.75f, true)</code> plus
          an override of <code>removeEldestEntry</code> is already a working LRU
          cache. What does it maintain internally that makes this possible?
        </>
      ),
      zh: (
        <>
          Java 里 <code>new LinkedHashMap&lt;&gt;(cap, 0.75f, true)</code> 加一个{" "}
          <code>removeEldestEntry</code> 覆写,就是一个现成的 LRU。它能做到这一点,
          靠的是内部本来就维护着什么?
        </>
      ),
    },
    opts: [
      {
        en: "A hash table plus one doubly linked list that threads through all entries (ordered by access when accessOrder is true)",
        zh: "一张哈希表 + 一条串起全部条目的双向链表(accessOrder=true 时按访问序排列)",
      },
      {
        en: "A red-black tree sorted by access time",
        zh: "一棵红黑树,按访问时间排序",
      },
      {
        en: "An array that is re-sorted after every access",
        zh: "一个数组,每次访问后重新排序",
      },
      {
        en: "A background timer that periodically scans and deletes the least recently used entries",
        zh: "一个后台定时器,定期扫描并删除最久未用的条目",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Red-black trees belong to TreeMap (chapter 8). LinkedHashMap is HashMap's bucket array plus a before/after pointer pair on every Entry, which forms a doubly linked list. No tree is involved.",
        zh: "红黑树是 TreeMap 的事(第 8 章)。LinkedHashMap = HashMap 的哈希桶 + 每个 Entry 额外的 before/after 指针连成的双向链表,不涉及任何树。",
      },
      {
        en: "Re-sorting an array on every access would be O(n log n), which defeats the point of an O(1) cache. What actually happens is that the entry is unlinked from the list and appended at the end, in O(1).",
        zh: "每次访问都重排数组是 O(n log n),违背 LRU 的 O(1) 初衷;它实际做的只是把该 Entry 从链表里摘下来接到尾端,O(1)。",
      },
      {
        en: "Eviction happens at the moment a put pushes the map over its capacity. It is a synchronous structural operation. removeEldestEntry is called after every put and has nothing to do with a timer.",
        zh: "淘汰发生在 put 导致超容量的那一刻,是同步的结构操作;removeEldestEntry 在每次 put 之后被调用,与定时器无关。",
      },
    ],
    why: {
      en: "Every LinkedHashMap Entry sits in a hash bucket and also carries before/after pointers that link all entries into one doubly linked list. It is the same machine you write by hand for LRU, already assembled in the JDK.",
      zh: "LinkedHashMap 的每个 Entry 除了挂在哈希桶里,还有 before/after 指针把所有条目串成一条双向链表 —— 和我们手写的 LRU 是同一台机器,只是 JDK 已经帮你装好了。",
    },
  },
  {
    type: "choice",
    q: {
      en: "The data is loaded once and never modified afterwards, and then you answer a very large number of range sum queries. Which structure should you choose?",
      zh: "数据一旦加载就永不修改,之后只有大量的区间和查询 —— 应该选哪个结构?",
    },
    opts: [
      {
        en: "A prefix sum array: O(n) to build, O(1) per query, a few lines of code",
        zh: "前缀和数组:预处理 O(n),每次查询 O(1),实现只要几行",
      },
      {
        en: "A segment tree: it is the most capable structure, so it is always the better choice",
        zh: "线段树:功能最强,永远是更好的选择",
      },
      {
        en: "A Fenwick tree: it is shorter than a segment tree, so it must fit better",
        zh: "树状数组:比线段树短,肯定更合适",
      },
      {
        en: "No preprocessing; add up the range on the spot for each query",
        zh: "不预处理,每次现场累加",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A segment tree query is O(log n), and it also needs about 4n of array space and dozens of lines of code. When the data never changes, it has no advantage over prefix sums. More capability is not automatically better; matching the operation mix is what matters.",
        zh: "线段树查询是 O(log n),还要 4n 空间和几十行代码 —— 数据不改时,它对前缀和没有任何优势。「能力越强越好」不成立,匹配需求才是选型。",
      },
      {
        en: "A Fenwick tree also exists to support updates, and its query is O(log n) as well. Without updates it loses to the O(1) query of a prefix sum array.",
        zh: "树状数组同样是为「可修改」而生的,查询也是 O(log n)。不改数据时它输给前缀和的 O(1) 查询。",
      },
      {
        en: "Each query would be O(n), which collapses as soon as the query count grows. Prefix sums pay O(n) once and get O(1) queries forever.",
        zh: "每次查询 O(n),查询一多立刻拖垮;前缀和用一次 O(n) 预处理换来此后每次 O(1) 查询,这笔买卖必须做。",
      },
    ],
    why: {
      en: "Pick the structure from the operation mix: queries only means prefix sums; updates mixed with queries means a segment tree or a Fenwick tree. LC 303 (immutable) and LC 307 (mutable) are a pair of problems written to test exactly this contrast.",
      zh: "选型看操作组合:只查不改 → 前缀和;又改又查 → 线段树 / 树状数组。LC 303(不可变)与 LC 307(可修改)就是专门考这个对照的姊妹题。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          A Fenwick tree is built on one bit operation: it extracts the{" "}
          <b>lowest set bit</b> of x (the value usually called lowbit). Write
          that expression, using x as the variable.
        </>
      ),
      zh: (
        <>
          树状数组的核心是一个位运算:取出 x 二进制里<b>最低位的 1</b>
          (即 lowbit)。写出这个表达式(用 x 表示变量)。
        </>
      ),
    },
    placeholder: {
      en: "A bit expression of the form x?x…",
      zh: "形如 x?x 的位运算表达式…",
    },
    answers: ["x&(-x)", "x&-x", "(-x)&x", "-x&x", "x&(~x+1)", "(~x+1)&x"],
    hint: {
      en: "In two's complement, -x equals \"invert every bit, then add 1\". That operation keeps the lowest set bit and clears every other bit. Try it with 6 = 0110.",
      zh: "提示:补码里 -x 等于「按位取反再 +1」,这个操作恰好保留最低位的 1、清零其余所有位。拿 6 = 0110 试一试。",
    },
    why: {
      en: "The answer is x & (-x). In two's complement, -x = ~x + 1. Inverting turns the lowest 1 into 0 and every bit below it into 1; adding 1 then carries up and stops exactly at the position of that original lowest 1. The AND therefore keeps only that bit. Example: 6 = 0110, -6 = 1010, and 0110 & 1010 = 0010 = 2.",
      zh: "答案是 x & (-x)。补码下 -x = ~x + 1:取反让最低位的 1 变 0、其后全变 1,再 +1 的进位恰好停在原最低位 1 的位置,于是与运算只剩那一位。例:6 = 0110,-6 = 1010,按位与 = 0010 = 2。",
    },
  },
  {
    type: "choice",
    q: {
      en: "When a skip list inserts a node, it flips a coin to decide how many index levels the node gets, instead of maintaining an exact \"every second node is promoted\" structure. Why?",
      zh: "跳表插入新节点时用「抛硬币」决定它有几层索引,而不是精确维护「每 2 个节点抽 1 个」的完美结构。为什么?",
    },
    opts: [
      {
        en: "An exact structure breaks on the first insert or delete, and repairing it costs O(n). Randomization keeps the structure balanced in expectation, so an insert costs O(log n) and needs no repair work at all",
        zh: "完美结构一经插入/删除就被破坏,精确修复要 O(n);随机化让结构在概率上保持平衡,插入只花 O(log n),不需要任何修复维护",
      },
      {
        en: "Flipping a coin is faster to compute than counting positions",
        zh: "抛硬币的计算比按位置计数更快",
      },
      {
        en: "Random levels bring the query cost down to O(1)",
        zh: "随机层数能把查询优化到 O(1)",
      },
      { en: "To save memory", zh: "为了节省内存" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "The saving is not the cost of the coin flip itself. It is the O(n) work of rebuilding the index levels of every following node after an insert.",
        zh: "省的不是掷硬币那点计算 —— 是省掉了插入之后重排后续所有节点索引层的 O(n) 维护成本。",
      },
      {
        en: "The expected query cost is still O(log n). Randomization buys you \"no maintenance\", not a faster query.",
        zh: "查询的期望复杂度仍是 O(log n)。随机化换来的是「免维护」,不是更快的查询。",
      },
      {
        en: "The expected height of a node is 1 + 1/2 + 1/4 + … = 2, about the same as the exact sampling version. Memory is not the motivation; avoiding maintenance is.",
        zh: "每个节点的期望层数是 1 + 1/2 + 1/4 + … = 2,和严格抽样版差不多 —— 内存不是动机,免维护才是。",
      },
    ],
    why: {
      en: "A strict \"promote every second node\" layout is destroyed by a single insert, and repairing it means shifting a whole block of index levels. Coin flips let every node decide its own height independently, with probability 1/2 for each extra level. The expected height of the list is then about log2 n and search and insert are O(log n) in expectation. Note what the expectation is over: the coin flips, not the input data. That is the same trade as picking a random pivot in quicksort.",
      zh: "严格的「上层 = 下层隔一抽一」一插入就全乱,修复要挪动一整片索引。抛硬币让每个节点独立决定层数(每多长一层的概率 1/2),整体期望高度约 log₂n,查询/插入期望 O(log n)。注意期望是对<b>抛硬币的随机性</b>取的,和输入数据无关 —— 和快速排序随机选轴是同一门权衡。",
    },
  },
  {
    type: "choice",
    q: {
      en: "A Bloom filter can be wrong in one direction only. Which kind of mistake can it make?",
      zh: "布隆过滤器的误判是单向的 —— 它可能犯哪种错误?",
    },
    opts: [
      {
        en: "False positives: it may say \"possibly present\" for an element that was never inserted. It never gives a false negative, so \"not present\" is always true",
        zh: "假阳性:说「可能在」但其实不在;绝不假阴性 —— 它说「不在」就一定不在",
      },
      {
        en: "False negatives: it may miss an element that really was inserted",
        zh: "假阴性:可能漏报确实存在的元素",
      },
      { en: "Both kinds of mistake can happen", zh: "两种错误都可能发生" },
      {
        en: "Neither can happen; it is an exact structure",
        zh: "两种都不可能,它是精确的数据结构",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Inserting sets all k bits to 1 and no operation ever clears a bit. If an element was inserted, those bits are still 1 at query time, so a miss is impossible. A false negative cannot occur by construction.",
        zh: "插入时 k 个位全部置 1 且永不清零 —— 只要插入过,查询时这些位必然还是 1,不可能漏报。假阴性在结构上就不存在。",
      },
      {
        en: "Only one of the two is possible: other elements can set your bits as a side effect (a false positive), but no operation clears a bit that is already set (so no false negative).",
        zh: "只可能错一半:别的元素可以把你的位「顺手点亮」(造成假阳性),但没有任何操作能把已点亮的位熄灭(所以不会假阴性)。",
      },
      {
        en: "All elements share one bit array, and the hash positions of different values can overlap, so \"all bits are 1\" does not prove the value was inserted. Giving up exactness is what buys the large memory saving.",
        zh: "所有元素共享同一个位数组,不同值的哈希位可能重叠 —— 「全 1」不代表真的插入过。放弃精确性,正是它换取大幅内存节省的代价。",
      },
    ],
    why: {
      en: "Bits only go from 0 to 1. Finding a 0 is proof that the value was never inserted. Finding all 1s is only a suspicion, because other values may have set those bits. This one-directional promise, \"definitely not present\" or \"possibly present\", is what makes it useful as a first filter: nothing that was inserted is ever rejected, and everything it rejects saves you one expensive lookup.",
      zh: "位只会从 0 变 1:查到「有 0」是铁证(一定没插入过);查到「全 1」只是嫌疑(可能是别的元素点亮的)。这个「一定不在 / 可能在」的单向承诺,恰好适合做第一道过滤门:插入过的绝不会被拒,被拒的直接省掉一次昂贵查询。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Which pair of structures does Redis use for a sorted set (zset) once the data is large?",
      zh: "Redis 的有序集合 zset(数据量大时)底层用的是哪套组合?",
    },
    opts: [
      {
        en: "A skip list (sorted by score, supports range traversal) plus a hash table (O(1) member to score lookup)",
        zh: "跳表(按分数有序、支持范围遍历)+ 哈希表(O(1) 按成员查分数)",
      },
      { en: "A red-black tree plus a hash table", zh: "红黑树 + 哈希表" },
      { en: "A sorted array plus binary search", zh: "有序数组 + 二分查找" },
      { en: "A heap plus a hash table", zh: "堆 + 哈希表" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A red-black tree could do the job, but Redis chose a skip list: it is much simpler to implement, range traversal just follows the bottom-level list, and it is easier to debug and extend.",
        zh: "功能上红黑树也能胜任,但 Redis 选了跳表:实现简单得多、范围遍历直接沿底层链表顺序走、调试和改造都更容易。",
      },
      {
        en: "Binary search on a sorted array is fast, but zset members are inserted and removed constantly, and array insertion or deletion is O(n) because of the shifting.",
        zh: "有序数组二分查得快,但 zset 的成员是频繁增删的 —— 数组插入删除要 O(n) 搬移元素,扛不住。",
      },
      {
        en: "A heap only guarantees that the root is the extreme value; the rest is unordered. It cannot answer a range query such as \"members ranked 5 through 15\".",
        zh: "堆只保证堆顶是最值,内部整体无序,做不了「按排名取第 5 到第 15 名」这样的范围查询。",
      },
    ],
    why: {
      en: "zset = skiplist + dict. The skip list keeps the members sorted and makes range queries cheap, and the dictionary locates a member in O(1). It is the same idea as LRU, where the list keeps the order and the hash map does the lookup.",
      zh: "zset = skiplist + dict 的双结构组合:跳表管「有序 + 范围查询」,字典管「O(1) 定位成员」—— 和 LRU 的「链表管顺序 + 哈希管定位」是同一个组合思想。",
    },
  },
];
