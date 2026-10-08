// Chapter 11 · Union-find — closing quiz (the problem set is in lib/union-find-problems.tsx).
//
// Bilingual: every question, option and explanation is a { en, zh } pair.
// Complexity convention: with both optimizations enabled, m operations cost O(m·α(n)) in total, where
// α is the inverse Ackermann function; every n that actually fits in memory has α(n) ≤ 4 — the whole
// chapter says "near-constant" rather than writing O(1).

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "What exactly does find(x) return in a Union-Find structure?",
      zh: "并查集里 find(x) 的准确语义是什么?",
    },
    opts: [
      {
        en: "The representative of the set that contains x, that is the root of its tree, so two elements are in the same set when their roots are equal",
        zh: "x 所在集合的代表元(所在树的根)—— 根相同就说明两个元素同属一个集合",
      },
      { en: "The index of x in the array", zh: "x 在数组里的下标" },
      {
        en: "The direct parent of x, that is parent[x]",
        zh: "x 的直接父节点 parent[x]",
      },
      {
        en: "The number of elements in the set that contains x",
        zh: "x 所在集合的元素个数",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "x is already the index, or has already been mapped to an index by a hash map. Nothing needs to be looked up. find looks for the root.",
        zh: "x 本身就是下标(或已被哈希表映射成下标),不需要「找」。find 找的是它的根。",
      },
      {
        en: "parent[x] is only one level up, and it is usually not the root. find keeps climbing until it reaches the r where parent[r] == r.",
        zh: "parent[x] 只是「上一级」,通常不是根 —— find 要一路爬到 parent[r] == r 的那个 r 才停。",
      },
      {
        en: "The size of a set is only known if you maintain an extra size array. find answers a different question: who is the representative.",
        zh: "集合大小要额外维护一个 size 数组才知道,find 只回答「代表元是谁」。",
      },
    ],
    why: {
      en: "find returns the representative of a set, so find(a) === find(b) is exactly the same statement as \"a and b are connected\". Which element is chosen as the representative does not matter. What matters is that one set always gives one answer, which is how Union-Find turns \"are they connected\" into \"are these two numbers equal\".",
      zh: "find 返回集合的代表元,所以 find(a) === find(b) 与「a、b 连通」是同一句话。代表元具体是谁并不重要,重要的是同一集合的答案唯一 —— 并查集正是这样把「连通吗」变成「相等吗」。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Why must union(a, b) find both roots first and then point one root at the other? Why not just write parent[a] = b?",
      zh: "union(a, b) 为什么必须先 find 出两边的根,再让一个根指向另一个根?直接 parent[a] = b 不行吗?",
    },
    opts: [
      {
        en: "It is wrong: union merges two sets. Changing parent[a] directly tears a out of its own tree and leaves the rest of its set behind.",
        zh: "不行 —— union 合并的是两个集合,直接改 parent[a] 会把 a 从原来的树里撕出来,原集合的其余成员被丢下",
      },
      { en: "It works, it is just a little slower", zh: "可以,只是稍微慢一点" },
      {
        en: "It is wrong, because parent[a] is only allowed to equal a",
        zh: "不行,因为 parent[a] 只能等于 a",
      },
      {
        en: "It works as long as neither a nor b is a root",
        zh: "可以,只要 a 和 b 都不是根",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "This is not about speed, it is about correctness. The descendants of a follow it, but everything above a in its old tree keeps the old root, so one set is split into two.",
        zh: "这不是快慢问题,是正确性问题:a 的子孙会跟着走,但 a 头上那条祖先链仍留着旧的根,原来的一个集合被切成了两个。",
      },
      {
        en: "parent[a] = a is just how \"a is a root\" is written down. A non-root element points at another element by definition.",
        zh: "parent[a] = a 只是「a 是根」的写法,非根节点的 parent 本来就指向别人。",
      },
      {
        en: "The opposite is true. Only changing the parent of a root moves the whole tree, that is the whole set, in one assignment.",
        zh: "恰恰相反:只有改「根」的 parent,才能一次赋值把整棵树(整个集合)带过去。",
      },
    ],
    why: {
      en: "Every element of a tree reaches the same root, so changing the parent of that root moves the entire set at once. Changing a non-root element only moves that one element and breaks its old set apart.",
      zh: "一棵树里的每个元素最终都爬到同一个根,所以改掉这个根的 parent,整个集合一次性换了代表元。改一个非根节点,只会把它一个人挪走,还把原集合拆散。",
    },
  },
  {
    type: "choice",
    q: {
      en: "What does path compression change?",
      zh: "路径压缩(path compression)到底改变了什么?",
    },
    opts: [
      {
        en: "It repoints the nodes visited during find directly at the root, which makes the tree flatter, so later find calls on those nodes are shorter",
        zh: "把 find 沿途经过的节点直接改挂到根上,树变扁,这些节点之后的 find 就更短",
      },
      {
        en: "It changes which set an element belongs to",
        zh: "改变了集合的划分 —— 压缩后某些元素换了集合",
      },
      {
        en: "It lowers the cost of union from O(n) to O(1)",
        zh: "把 union 的复杂度从 O(n) 降到 O(1)",
      },
      {
        en: "It reduces the memory used by the parent array",
        zh: "减少了 parent 数组占用的内存",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Compression only changes who a node hangs under. The root it reaches stays the same, so every element keeps its set. Only the shape of the tree changes.",
        zh: "压缩只改「挂在谁下面」,不改「最终爬到哪个根」—— 每个元素的集合归属完全不变,变的只是树的形状。",
      },
      {
        en: "Once the two roots are known, union is already a single assignment. The expensive part is find, and that is what compression makes cheaper.",
        zh: "拿到两个根之后,union 本来就只是一次赋值;贵的是 find,压缩优化的正是 find。",
      },
      {
        en: "The parent array keeps exactly the same number of slots. Compression saves time, not space.",
        zh: "parent 数组一格没多一格没少,省的是时间不是空间。",
      },
    ],
    why: {
      en: "find has to walk from x up to the root anyway. Path compression uses that walk to repoint every node along it at the root, so the tree gets flatter as it is used. It is one of the two optimizations behind the O(α(n)) amortized bound.",
      zh: "find 本来就要从 x 走到根,路径压缩顺手把沿途每个节点都改指向根,树越用越扁。它是 O(α(n)) 均摊复杂度背后的两个优化之一。",
    },
  },
  {
    type: "choice",
    q: {
      en: "What does union by rank prevent?",
      zh: "按秩合并(union by rank)防的是什么?",
    },
    opts: [
      {
        en: "It prevents attaching the taller tree under the shorter one, which would make the merged tree one level taller than it needs to be",
        zh: "防止把高树挂到矮树下面,让合并后的树比必要的高度多一层",
      },
      {
        en: "It prevents merging two sets that already have the same root",
        zh: "防止两个根相同的集合被重复合并",
      },
      {
        en: "It prevents the parent array from going out of bounds",
        zh: "防止 parent 数组越界",
      },
      {
        en: "It prevents path compression from stopping working",
        zh: "防止路径压缩失效",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "That case is handled at the top of union: find both roots and compare them. No rank is needed for it.",
        zh: "根相同的情况在 union 开头判掉就行(find 两次比较一下),不需要 rank。",
      },
      {
        en: "Going out of bounds is an indexing mistake and has nothing to do with the merge strategy.",
        zh: "越界是写代码的事,和合并策略无关。",
      },
      {
        en: "The two optimizations are independent. Neither depends on the other, they just work best together.",
        zh: "两个优化各自独立,谁也不依赖谁,只是叠加使用效果最好。",
      },
    ],
    why: {
      en: "Attach the shorter tree under the taller one and the merged height is max(taller, shorter + 1) = taller, so the height does not grow. Do it the other way and the height always grows by 1. The heights only grow when the two trees are equally tall, and that is why union by rank alone already keeps the height within O(log n).",
      zh: "矮树挂到高树下,合并后的高度是 max(高树高, 矮树高 + 1) = 高树高,不变;反过来挂,高度必然 +1。只有两棵树等高时高度才会增长,所以单靠按秩合并,树高就已经压在 O(log n) 以内。",
    },
  },
  {
    type: "choice",
    q: {
      en: "With both optimizations, m operations on n elements cost O(m·α(n)), where α is the inverse Ackermann function. What is the right intuition for α(n)?",
      zh: "两个优化都开启后,n 个元素上的 m 次操作总代价是 O(m·α(n)),α 是反阿克曼函数。对 α(n) 的正确直觉是?",
    },
    opts: [
      {
        en: "It grows extremely slowly: for every n you could ever store, α(n) is at most 4, so each operation is effectively constant",
        zh: "增长极慢:任何你存得下的 n,α(n) 都不超过 4 —— 每次操作可以当成近乎常数",
      },
      {
        en: "α(n) is about log n, the same order as binary search",
        zh: "α(n) ≈ log n,和二分查找一个量级",
      },
      {
        en: "α(n) is only a theoretical bound, and in practice the structure runs far slower than that",
        zh: "α(n) 是个理论值,实际运行远比它慢",
      },
      {
        en: "α(n) grows linearly in n, only with a small constant",
        zh: "α(n) 随 n 线性增长,只是系数很小",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "It grows far more slowly than log n. log₂(10⁸⁰) is about 266, while α(10⁸⁰) is 4. Even log* and log log n grow faster than α.",
        zh: "它比 log n 慢得多:log₂(10⁸⁰) ≈ 266,而 α(10⁸⁰) = 4。连 log*、log log n 都比 α 增长得快。",
      },
      {
        en: "In practice an optimized Union-Find runs close to plain array access. α(n) ≤ 4 is the precise way of saying \"effectively constant\".",
        zh: "实测里优化后的并查集快得接近数组随机访问 —— α(n) ≤ 4 正是「近乎常数」的精确说法。",
      },
      {
        en: "Not close. α is the inverse of the Ackermann function, which is one of the fastest growing functions, so its inverse is one of the slowest growing.",
        zh: "差得远:α 是阿克曼函数(增长最猛的函数之一)的反函数,所以它是增长最慢的函数之一。",
      },
    ],
    why: {
      en: "The Ackermann function grows extremely fast, so its inverse grows extremely slowly: α(n) does not exceed 4 for any n up to 2^65536, far more elements than any machine could hold. That is why the cost is called effectively constant rather than O(1). It is an amortized bound with a proof (Tarjan, 1975), not an approximation.",
      zh: "阿克曼函数增长极快,它的反函数因此增长极慢:直到 n 大约为 2^65536,α(n) 都不超过 4,而这么多元素远超任何机器能容纳的数量。所以说它「近乎常数」而不写成 O(1) —— 这是一个有证明的均摊上界(Tarjan, 1975),不是粗略的近似。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Both answer connectivity questions. When is Union-Find clearly better than DFS or BFS?",
      zh: "同样是判连通,什么场景下并查集明显优于 DFS/BFS?",
    },
    opts: [
      {
        en: "Edges keep arriving over time and connectivity queries are mixed in between them. Union-Find updates incrementally, while DFS has to traverse again for every query.",
        zh: "边不断动态加入、期间穿插大量「连通吗」查询 —— 并查集增量维护,DFS 每问一次都要重新遍历",
      },
      {
        en: "When you need to output the actual path between two vertices",
        zh: "需要输出两点之间的具体路径时",
      },
      { en: "When edges have to be deleted", zh: "需要删除边的时候" },
      { en: "When the graph is a tree", zh: "图是一棵树的时候" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Union-Find only records who is in which set. The path information is dropped during union, so a path needs DFS or BFS.",
        zh: "并查集只记「谁和谁同集合」,路径信息在 union 时就丢掉了 —— 要路径必须 DFS/BFS。",
      },
      {
        en: "A standard Union-Find merges but never splits, so deletion is its weak point. It needs a rollback variant, or the whole sequence of operations processed in reverse.",
        zh: "标准并查集只合并、不拆分,删边正是它的短板 —— 要么用可撤销变体,要么把整串操作倒着处理。",
      },
      {
        en: "On a static tree one DFS preprocessing pass is enough. Union-Find is for the case where edges keep being added.",
        zh: "静态的树上判连通,DFS 一次预处理也够;并查集的主场是「边一直在加」的动态过程。",
      },
    ],
    why: {
      en: "Edges keep arriving and you only ask whether two elements are connected: use Union-Find. You need the path itself or a traversal order: use DFS or BFS. Edges have to be removed: neither works directly, and the usual fix is to process the operations in reverse so that every deletion becomes an addition.",
      zh: "边一直在加、只问连通性 → 并查集;要具体路径或遍历顺序 → DFS/BFS;要删边 → 两者都不直接可用,常见做法是把操作倒序处理,让每次删除变成一次加入。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          You count components with Union-Find. There are n = 10 elements at the
          start, so count = 10. You run 7 unions, and in 2 of them the two sides
          already had the same root. What is count now?
        </>
      ),
      zh: (
        <>
          用并查集统计连通块:初始 n = 10 个元素,count = 10。执行 7 次
          union,其中 2 次发现两边的根本来就相同。现在 count 是多少?
        </>
      ),
    },
    placeholder: { en: "Type a number…", zh: "输入数字…" },
    answers: ["5"],
    hint: {
      en: "count only decreases when two different sets actually become one. A union whose two sides share a root changes nothing.",
      zh: "count 只在「两个不同集合真的并成一个」时减 1;两边根相同的 union 什么都没改。",
    },
    why: {
      en: "Only 5 of the 7 unions merged two different sets, and each of those lowers count by 1: 10 − 5 = 5. The other 2 changed nothing, so decrementing for them would report fewer components than really exist. That is why union returns a boolean and count is only decremented when it returns true.",
      zh: "7 次 union 里只有 5 次真的把两个不同集合并成一个,每次 count 减 1:10 − 5 = 5。另外 2 次什么也没改,如果照样减 1,报出的连通块数就会比实际少。这正是 union 要返回 boolean、只在返回 true 时才 count−− 的原因。",
    },
  },
];
