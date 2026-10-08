// Chapter 11 · Union-find — problem set (English default / Chinese toggle).
// The closing quiz is in lib/union-find-quiz.tsx; /atlas imports only this file.
// Union-find problems are frequent but tightly clustered: connectivity checks, counting connected
// components, merging equivalence classes, and cycle detection.
// The set runs easy to hard; LC 305 is premium-only, so 2316 stands in (same "count the connected
// components" idea).
//
// Problem titles use the official LeetCode English name; tags / hint / key are all
// { en, zh } pairs.
// Complexity convention: with both optimizations enabled, m operations cost O(m·α(n)) in total, where
// α is the inverse Ackermann function; every n that actually fits in memory has α(n) ≤ 4 — the whole
// chapter says "near-constant" rather than writing O(1).

import type { Problem } from "@/lib/problems";

export const PROBLEMS: Problem[] = [
  {
    lc: 1971,
    title: {
      en: "Find if Path Exists in Graph",
      zh: "寻找图中是否存在路径",
    },
    d: "easy",
    tags: [
      { en: "Connectivity", zh: "连通性" },
      { en: "Template", zh: "模板题" },
    ],
    hint: {
      en: "\"Is there a path between u and v?\" becomes one question in Union-Find: do they have the same root?",
      zh: "「u 和 v 之间有没有路?」翻译成并查集语言就一句话:它们的根一样吗?",
    },
    key: {
      en: (
        <>
          Union every edge, then return{" "}
          <code>find(source) === find(destination)</code>. This is Union-Find in
          its plainest form. It does not record what the path looks like or how
          long it is, only whether the two vertices are in the same set. Use it
          as the first problem for writing the template from memory: once the
          UnionFind class is written, the solution is two lines. With both
          optimizations the total cost is O((V + E)·α(V)).
        </>
      ),
      zh: (
        <>
          把每条边 union 起来,最后返回{" "}
          <code>find(source) === find(destination)</code>。
          这是并查集最基本的用法 —— 不关心路径长什么样、有多长,只关心两点是否同属一个集合。
          建议把它当默写模板的第一题:写完 UnionFind 类,主逻辑只有两行。
          两个优化都开时,总代价 O((V + E)·α(V))。
        </>
      ),
    },
  },
  {
    lc: 990,
    title: {
      en: "Satisfiability of Equality Equations",
      zh: "等式方程的可满足性",
    },
    d: "medium",
    tags: [
      { en: "Equivalence classes", zh: "等价类" },
      { en: "Two passes", zh: "两轮扫描" },
    ],
    hint: {
      en: "a==b means \"put them in the same set\". a!=b means \"check that they are not in the same set\". Which of the two must be done first?",
      zh: "a==b 是「并进同一个集合」,a!=b 是「检查是不是同一个集合」。两种操作谁先谁后?",
    },
    key: {
      en: (
        <>
          Scan twice. The first pass handles only <code>==</code> and unions the
          equal variables into equivalence classes. The second pass checks every{" "}
          <code>!=</code>: if the two sides have the same root, the constraints
          contradict each other, so return false. Two passes are required
          because equality is transitive. An <code>==</code> that appears later
          in the input can still merge two sets and invalidate a{" "}
          <code>!=</code> that looked fine when it was read. All merging must
          finish before any check runs. There are only 26 lowercase letters, so
          a parent array of 26 slots is enough.
        </>
      ),
      zh: (
        <>
          两轮扫描:第一轮只处理所有 <code>==</code>,把相等的变量 union
          成等价类;第二轮检查所有 <code>!=</code>,若两边的根相同则约束自相矛盾,返回
          false。为什么必须分两轮?因为相等关系可传递:输入里靠后的一个{" "}
          <code>==</code> 仍可能把两个集合并起来,推翻此前看似成立的{" "}
          <code>!=</code> —— 所有合并做完,才能开始检查。变量只有 26 个小写字母,parent
          开 26 格即可。
        </>
      ),
    },
  },
  {
    lc: 128,
    title: { en: "Longest Consecutive Sequence", zh: "最长连续序列" },
    d: "medium",
    tags: [
      { en: "Two solutions", zh: "一题两解" },
      { en: "Hash + Union-Find", zh: "哈希 ∪ 并查集" },
    ],
    hint: {
      en: "The hash chapter solved this by counting only from the start of each run. In the Union-Find view, treat x and x+1 as an edge.",
      zh: "哈希章用「只从序列起点数」解过它;换并查集视角:把 x 和 x+1 看成一条边。",
    },
    key: {
      en: (
        <>
          Union-Find version: put every value into a hash map that maps the
          value to its index. While scanning, if x+1 is also present, union the
          sets of x and x+1. Keep a size for each root, and the answer is the
          largest size. Compared with the O(n) hash solution, which counts to
          the right only from values whose predecessor x−1 is missing, the
          Union-Find version writes more code but needs less insight: adjacent
          values form an edge, and the question becomes the size of the largest
          component. Being able to compare the two approaches makes
          for a stronger interview answer.
        </>
      ),
      zh: (
        <>
          并查集解法:先把所有数存进哈希表(值 → 下标),遍历时若 x+1 也在表里,就
          union(x, x+1) 所在的集合,同时为每个根维护集合大小 size,答案是最大的 size。
          与哈希章的 O(n) 解法(只从 x−1 不存在的起点向右数)相比,并查集写起来更长,
          但需要的洞察更少 ——「相邻即连边,问最大连通块」。一题两解,
          面试时能对比这两种思路,回答会更完整。
        </>
      ),
    },
  },
  {
    lc: 721,
    title: { en: "Accounts Merge", zh: "账户合并" },
    d: "medium",
    tags: [
      { en: "Hash mapping", zh: "哈希映射" },
      { en: "String keys", zh: "字符串 key" },
    ],
    hint: {
      en: "Two accounts belong to the same person as soon as they share one email address, so a shared email is an edge. What do you do when the keys are not integers?",
      zh: "两个账户只要共享一个邮箱就是同一个人 ——「共享邮箱」就是边。key 不是整数怎么办?",
    },
    key: {
      en: (
        <>
          The standard map-first-then-union problem. Use a hash map to give
          every email address an integer id (or map it to the index of the
          account where it first appeared), then union all emails inside one
          account with each other. Unioning each email with the first one is
          enough. Finally group by root, sort inside each group, and put the
          user name in front. This shows the standard preparation step for
          non-integer keys: <b>the hash map translates, Union-Find merges</b>.
          Sorting dominates, so the total is O(n·k·log(n·k)).
        </>
      ),
      zh: (
        <>
          经典的「先映射再并查集」:用哈希表把每个邮箱映射到一个整数编号(或映射到
          首次出现的账户下标),同一账户内的所有邮箱互相 union ——
          其实每个都和第一个 union 就够了。最后按根分组、组内排序、拼上用户名。
          这题演示了处理非整数 key 的标准前置步骤:<b>哈希表负责翻译,并查集负责合并</b>。
          排序主导,O(n·k·log(n·k))。
        </>
      ),
    },
  },
  {
    lc: 2316,
    title: {
      en: "Count Unreachable Pairs of Nodes in an Undirected Graph",
      zh: "统计无向图中无法互相到达点对数",
    },
    d: "medium",
    tags: [
      { en: "Component count", zh: "连通块计数" },
      { en: "Counting", zh: "组合计数" },
    ],
    hint: {
      en: "An unreachable pair is a pair of nodes in two different components. Once you know the size of each component, the answer is a multiplication.",
      zh: "不可达点对 = 分属不同连通块的点对。知道每块的大小,答案就是个乘法。",
    },
    key: {
      en: (
        <>
          Union all edges and keep a size for every root. Let the component
          sizes be s₁…sₖ. Walk through the components once, keeping a running
          total of the nodes seen so far. Each component contributes sᵢ × (nodes
          seen before it) pairs, which avoids enumerating all pairs. This is the
          typical components-plus-counting problem: Union-Find answers how many
          components there are, and how large each one is, directly. O(n +
          E·α(n)).
          Use a 64-bit integer for the answer, because the count can exceed the
          32-bit range.
        </>
      ),
      zh: (
        <>
          union 所有边,并为每个根维护集合大小 size。设各连通块大小为 s₁…sₖ,
          按顺序遍历一遍连通块并累计「已经数过的节点数」,每块贡献 sᵢ ×
          (此前累计的节点数) 个点对,从而避免两两枚举。这题是「连通块 + 计数」
          组合的代表:并查集天生擅长回答「有几块、每块多大」。O(n + E·α(n))。
          答案要用 64 位整数,计数会超出 32 位范围。
        </>
      ),
    },
  },
  {
    lc: 947,
    title: {
      en: "Most Stones Removed with Same Row or Column",
      zh: "移除最多的同行或同列石头",
    },
    d: "medium",
    tags: [
      { en: "Modeling", zh: "抽象建模" },
      { en: "Components", zh: "连通块" },
    ],
    hint: {
      en: "Stones in the same row or the same column are joined by an edge. In a component of k stones, how many can be removed?",
      zh: "同行或同列的石头连一条边。一个有 k 颗石头的连通块,最多能移走几颗?",
    },
    key: {
      en: (
        <>
          The key observation: inside one component you can always remove stones
          until exactly 1 is left. Take a spanning tree of the component, for
          example the DFS tree in which two stones are joined when they share a
          row or a column, and remove stones leaves first: each removed stone
          still shares a row or a column with its parent, and only the root
          remains. (Removing just any stone that shares a line with another can
          split the component: with (0,0), (0,1) and (1,1), taking (0,1) first
          leaves two stones that share nothing.) So the answer is (number of
          stones) − (number of components). Implementation
          detail: instead of comparing every pair in O(n²), treat each row index
          r and each column index c + 10001 as a node, and union the row and the
          column of every stone. The rows and columns act as connectors. What
          this problem tests is not the template but{" "}
          <b>translating the question into the language of components</b>.
        </>
      ),
      zh: (
        <>
          关键洞察:一个连通块里的石头,总能移到只剩 1 颗。取这个连通块的一棵生成树
          (例如 DFS 树,同行或同列的两颗石头之间有边),从叶子开始倒序移除:
          每颗被移除的石头都与它的父节点同行或同列,最后只剩根。
          (随意移走一颗「与别人同行或同列」的石头,可能把连通块拆开:
          (0,0)、(0,1)、(1,1) 三颗石头,先移走 (0,1),剩下两颗就互不共线了。)
          所以答案 = 石头总数 − 连通块数。
          实现技巧:不必两两比较 O(n²),把「行号 r」和「列号 c + 10001」
          也当成节点,每颗石头 union(它的行, 它的列),让行列充当中介。
          这题考的不是模板,是<b>把问题翻译成连通块语言</b>的建模能力。
        </>
      ),
    },
  },
  {
    lc: 839,
    title: { en: "Similar String Groups", zh: "相似字符串组" },
    d: "hard",
    tags: [
      { en: "Similar means edge", zh: "相似即连边" },
      { en: "Group count", zh: "分组计数" },
    ],
    hint: {
      en: "\"Similar\" is not a transitive relation, but \"in the same group\" is. That gap is exactly what Union-Find closes.",
      zh: "「相似」本身不可传递,「同组」却可以传递 —— 这个落差正是并查集要填的。",
    },
    key: {
      en: (
        <>
          Compare every pair of strings. Two of them are similar if they are
          equal or differ in exactly two positions. That test is enough because
          all the strings are anagrams of each other: if two of them differ in
          exactly two positions, swapping those two characters must make them
          equal. (Two anagrams can also differ in three or more positions, as
          tars and star do; such a pair is simply not similar.) Union each
          similar pair, and the answer is the number of
          components. One similarity check is O(L) and there are O(n²) pairs, so
          the total is O(n²·L). Note that A similar to B and B similar to C does
          not make A similar to C, yet all three belong to the same group.
          Union-Find maintains exactly this: the{" "}
          <b>transitive closure of a relation that is not itself transitive</b>.
        </>
      ),
      zh: (
        <>
          两两判断字符串是否相似:相同,或恰好两个位置不同。
          这样判断就够了,因为所有串互为字母异位词:恰好两个位置不同时,交换这两位必然相等。
          (异位词之间也可能有 3 处或更多处不同,例如 tars 与 star,这样的两个串不相似。)
          相似就 union,
          答案是连通块数。单次判断 O(L),两两枚举 O(n²),总计 O(n²·L)。
          注意:A 与 B 相似、B 与 C 相似,并不能推出 A 与 C 相似,
          但三者属于同一组 —— 并查集维护的正是这种
          <b>「关系本身不传递、分组却要传递」的传递闭包</b>。
        </>
      ),
    },
  },
  {
    lc: 685,
    title: { en: "Redundant Connection II", zh: "冗余连接 II" },
    d: "hard",
    tags: [
      { en: "Directed graph", zh: "有向图" },
      { en: "Case analysis", zh: "分类讨论" },
    ],
    hint: {
      en: "The directed version of 684. The bad edge can only do two things: give some node a second parent, or create a directed cycle.",
      zh: "684 的有向版。坏边只有两种可能:让某个节点有了两个父节点,或造出一个有向环。",
    },
    key: {
      en: (
        <>
          Adding one bad edge to a rooted tree leaves three cases. (1) Some node
          has in-degree 2 and there is no cycle: remove the later of its two
          incoming edges. (2) In-degree 2 and a cycle: of the two candidates,
          remove the one that lies on the cycle. It can be the earlier or the
          later of the two, which is why the Union-Find check below is needed. (3)
          No node with in-degree 2 but there is a cycle: remove the edge that
          closes the cycle. So scan once to find a node with two incoming edges,
          then run Union-Find while skipping the second candidate. If the result
          is a valid tree, that candidate is the answer; otherwise the answer is
          the first candidate or the cycle-closing edge. 684 only needs the
          template. 685 tests whether you can put the template inside a case
          analysis.
        </>
      ),
      zh: (
        <>
          有向树里加一条坏边,只有三种情形:① 某节点入度为 2(两个父节点)且无环
          —— 删两条入边中较晚出现的那条;② 入度 2 且有环 ——
          删两条候选里位于环上的那条,它可能较早出现,也可能较晚出现,
          所以要靠下面的并查集检验来区分;③ 无入度 2 但有环 ——
          删掉合并时检测到成环的那条。做法是先扫一遍找出入度为 2 的两条候选边,
          再用并查集跳过第二条候选跑一遍:能成树就删它,否则删第一条或成环边。
          684 只要模板,685 考的是把模板嵌进分类讨论的能力。
        </>
      ),
    },
  },
];
