"use client";

// Chapter 11 · Union-Find (Disjoint Set Union) — eight sections:
// dynamic connectivity → the parent array is a forest (UFLab) → the two optimizations →
// from-scratch implementation → three-language comparison → three walkthroughs
// (frame by frame) → problem set → quiz → key points.
//
// Bilingual: every learner-facing string uses <T en zh> or { en, zh }, English is the default.
// The code windows take code as { en, zh } — the two versions are line-for-line equivalent
// and differ only in their comments, which is what keeps the hl line numbers aligned.
//
// Conventions for the whole chapter (do not change):
//  · Union-find answers exactly two questions: are two elements in the same set, and
//    merge two sets.
//  · What it maintains is a forest: every set is one tree, and the root of that tree is
//    the set's representative.
//  · Complexity: with both optimizations enabled, m operations over n elements cost
//    O(m·α(n)) in total; α is the inverse Ackermann function, and α(n) ≤ 4 for any n
//    that fits in memory — call it "near constant", never write O(1).
//  · With only one of the optimizations it is amortized O(log n).
//  · rank is an upper bound on the tree height, not the exact height (path compression
//    flattens the tree without lowering rank).
//  · Sets can only be merged, never split; to support deletion, process the whole
//    operation sequence offline in reverse.

import {
  Hero,
  Section,
  Callout,
  BigO,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { ArrayStepper, type ArrayFrame } from "@/lib/stepper";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/union-find-data";
import { T } from "@/lib/i18n";
import { UFLab } from "./viz";
import "./chapter.css";

/* ================= Walkthrough animation frames ================= */

// LC 547 number of provinces: 4 cities as an adjacency matrix, cells = the parent array,
// count drops from 4 to 2
const F547: ArrayFrame[] = [
  {
    cells: [{ v: 0, state: "ok" }, { v: 1, state: "ok" }, { v: 2, state: "ok" }, { v: 3, state: "ok" }],
    msg: {
      en: (
        <>
          Four cities, parent = [0,1,2,3]. Every city is its own root, so{" "}
          <b>count = 4</b>. In the matrix, M[i][j] = 1 means i and j are
          directly connected. The scan goes cell by cell over the upper triangle
          only (j &gt; i), because the matrix is symmetric.
        </>
      ),
      zh: (
        <>
          4 个城市,parent = [0,1,2,3],每个城市都是自己所在树的根,
          <b>count = 4</b>。矩阵里 M[i][j] = 1 表示 i、j 直接相连。
          下面逐格扫上三角(j &gt; i)—— 矩阵对称,下三角不用看。
        </>
      ),
    },
  },
  {
    cells: [{ v: 1, state: "lit" }, { v: 1, state: "lit" }, { v: 2 }, { v: 3 }],
    ptrs: [
      { i: 0, label: "i" },
      { i: 1, label: "j" },
    ],
    msg: {
      en: (
        <>
          M[0][1] = 1, so union(0, 1). The two roots differ (0 and 1), so
          parent[0] = 1 and <b>count goes 4 → 3</b>.
        </>
      ),
      zh: (
        <>
          M[0][1] = 1,执行 union(0, 1)。两个根不同(0 和 1),于是 parent[0] = 1,
          <b>count 4 → 3</b>。
        </>
      ),
    },
  },
  {
    cells: [{ v: 1 }, { v: 1 }, { v: 2, state: "ghost" }, { v: 3, state: "ghost" }],
    ptrs: [{ i: 0, label: "i" }],
    msg: {
      en: (
        <>
          M[0][2] = 0 and M[0][3] = 0: no direct connection, so nothing happens
          and count does not change.
        </>
      ),
      zh: (
        <>
          M[0][2] = 0、M[0][3] = 0:没有直接相连,什么都不做,count 不变。
        </>
      ),
    },
  },
  {
    cells: [{ v: 1 }, { v: 2, state: "lit" }, { v: 2, state: "lit" }, { v: 3 }],
    ptrs: [
      { i: 1, label: "i" },
      { i: 2, label: "j" },
    ],
    msg: {
      en: (
        <>
          M[1][2] = 1, so union(1, 2). find(1) = 1 and find(2) = 2 differ, so
          parent[1] = 2 and <b>count goes 3 → 2</b>. City 0 comes along without
          being touched: find(0) now climbs 0 → 1 → 2.
        </>
      ),
      zh: (
        <>
          M[1][2] = 1,执行 union(1, 2)。find(1) = 1、find(2) = 2 不同,
          于是 parent[1] = 2,<b>count 3 → 2</b>。城市 0 一个字节都没动就跟着过来了:
          find(0) 现在爬 0 → 1 → 2。
        </>
      ),
    },
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 2, state: "ok" }, { v: 2, state: "ok" }, { v: 3, state: "lit" }],
    msg: {
      en: (
        <>
          Every remaining cell is 0. The scan is over and <b>count = 2</b> is
          the answer: the provinces are {"{0,1,2}"} and {"{3}"}. No graph
          traversal was needed. count was kept correct while merging.
        </>
      ),
      zh: (
        <>
          剩下的格子全是 0。扫描结束,<b>count = 2</b> 就是答案:
          省份是 {"{0,1,2}"} 和 {"{3}"}。全程没有做任何图遍历 ——
          count 在合并过程中一直是对的。
        </>
      ),
    },
  },
];

// LC 684 redundant connection: union edge by edge; an edge between two already-connected
// nodes closes a cycle. Nodes are 1..5, so cells[0] is a placeholder
const F684: ArrayFrame[] = [
  {
    cells: [
      { v: "·", state: "ghost" },
      { v: 1 },
      { v: 2 },
      { v: 3 },
      { v: 4 },
      { v: 5 },
    ],
    msg: {
      en: (
        <>
          Edges: [1,2] [2,3] [3,4] [1,4] [1,5]. A tree plus one extra edge
          contains exactly one cycle. Process the edges in the given order. The
          edge whose two endpoints are already connected is the extra one.
        </>
      ),
      zh: (
        <>
          边:[1,2] [2,3] [3,4] [1,4] [1,5]。一棵树多加一条边,恰好含一个环。
          按给定顺序逐边处理,哪条边的两个端点「已经连通」,哪条就是多余的那条。
        </>
      ),
    },
  },
  {
    cells: [
      { v: "·", state: "ghost" },
      { v: 2, state: "lit" },
      { v: 2, state: "lit" },
      { v: 3 },
      { v: 4 },
      { v: 5 },
    ],
    msg: {
      en: (
        <>
          Edge [1,2]: find(1) = 1 and find(2) = 2 differ, so merge and set
          parent[1] = 2.
        </>
      ),
      zh: (
        <>
          边 [1,2]:find(1) = 1、find(2) = 2 不同,合并,parent[1] = 2。
        </>
      ),
    },
  },
  {
    cells: [
      { v: "·", state: "ghost" },
      { v: 2 },
      { v: 3, state: "lit" },
      { v: 3, state: "lit" },
      { v: 4 },
      { v: 5 },
    ],
    msg: {
      en: (
        <>
          Edge [2,3]: find(2) = 2 and find(3) = 3 differ, so merge and set
          parent[2] = 3.
        </>
      ),
      zh: (
        <>边 [2,3]:find(2) = 2、find(3) = 3 不同,合并,parent[2] = 3。</>
      ),
    },
  },
  {
    cells: [
      { v: "·", state: "ghost" },
      { v: 2 },
      { v: 3 },
      { v: 4, state: "lit" },
      { v: 4, state: "lit" },
      { v: 5 },
    ],
    msg: {
      en: (
        <>
          Edge [3,4]: find(3) = 3 and find(4) = 4 differ, so merge and set
          parent[3] = 4. Nodes 1, 2, 3 and 4 are now in one tree: 1 → 2 → 3 → 4.
        </>
      ),
      zh: (
        <>
          边 [3,4]:find(3) = 3、find(4) = 4 不同,合并,parent[3] = 4。
          此时 1、2、3、4 已经在同一棵树里(1 → 2 → 3 → 4)。
        </>
      ),
    },
  },
  {
    cells: [
      { v: "·", state: "ghost" },
      { v: 2, state: "bad" },
      { v: 3 },
      { v: 4 },
      { v: 4, state: "bad" },
      { v: 5 },
    ],
    ptrs: [
      { i: 1, label: "u" },
      { i: 4, label: "v" },
    ],
    msg: {
      en: (
        <>
          Edge [1,4]: find(1) climbs 1 → 2 → 3 → 4 and returns <b>4</b>, and
          find(4) returns <b>4</b> as well. Same root, so 1 and 4 already have a
          path between them. Adding this edge must close a cycle. The answer is{" "}
          <b>[1,4]</b>.
        </>
      ),
      zh: (
        <>
          边 [1,4]:find(1) 一路爬 1 → 2 → 3 → 4,返回 <b>4</b>,find(4)
          也返回 <b>4</b>。根相同,说明 1 和 4 之间早已有路径,
          这条边一加必然闭合成环。答案是 <b>[1,4]</b>。
        </>
      ),
    },
  },
  {
    cells: [
      { v: "·", state: "ghost" },
      { v: 2, state: "ok" },
      { v: 3, state: "ok" },
      { v: 4, state: "ok" },
      { v: 4, state: "ok" },
      { v: 5, state: "ghost" },
    ],
    msg: {
      en: (
        <>
          The problem asks for the cycle edge that appears <b>last</b> in the
          input, and processing the edges in order gives it directly. All the
          other edges of the cycle are added before it, so it is the{" "}
          <b>only</b> edge whose endpoints are already connected. Edge [1,5] is
          never examined.
        </>
      ),
      zh: (
        <>
          题目要求返回在输入中<b>最后出现</b>的那条成环边,而按顺序逐边处理正好直接给出它:
          环上其余的边都在它之前加入,所以它是<b>唯一</b>一条两端已经连通的边。
          边 [1,5] 根本不会被检查到。
        </>
      ),
    },
  },
];

// LC 200 number of islands (union-find view): the 2×4 grid is flattened into one
// dimension, idx = r*4+c
const F200: ArrayFrame[] = [
  {
    cells: [
      { v: 1 }, { v: 1 }, { v: 0, state: "ghost" }, { v: 1 },
      { v: 1 }, { v: 0, state: "ghost" }, { v: 0, state: "ghost" }, { v: 1 },
    ],
    msg: {
      en: (
        <>
          A 2×4 grid flattened into one dimension: idx = r×4 + c, so the first 4
          cells are row 0 and the last 4 are row 1. There are 5 land cells
          (value 1), so <b>count = 5</b> at the start: assume every land cell is
          its own island.
        </>
      ),
      zh: (
        <>
          2×4 网格拍扁成一维:idx = r×4 + c,前 4 格是第 0 行,后 4 格是第 1 行。
          陆地(值 1)共 5 块,初始 <b>count = 5</b> —— 先假设每块陆地各是一座岛。
        </>
      ),
    },
  },
  {
    cells: [
      { v: 1, state: "lit" }, { v: 1, state: "lit" }, { v: 0, state: "ghost" }, { v: 1 },
      { v: 1 }, { v: 0, state: "ghost" }, { v: 0, state: "ghost" }, { v: 1 },
    ],
    ptrs: [{ i: 0, label: "(0,0)" }],
    msg: {
      en: (
        <>
          At (0,0): the right neighbor (0,1) is land, so union(0, 1) and{" "}
          <b>count goes 5 → 4</b>. Each cell only needs to look right and down,
          because the left and upper neighbors were already joined when those
          cells were visited.
        </>
      ),
      zh: (
        <>
          扫到 (0,0):右邻 (0,1) 也是陆地 → union(0, 1),<b>count 5 → 4</b>。
          每格只看右邻和下邻就够 —— 左邻、上邻在处理更早的格子时已经连过了。
        </>
      ),
    },
  },
  {
    cells: [
      { v: 1, state: "lit" }, { v: 1, state: "ok" }, { v: 0, state: "ghost" }, { v: 1 },
      { v: 1, state: "lit" }, { v: 0, state: "ghost" }, { v: 0, state: "ghost" }, { v: 1 },
    ],
    ptrs: [{ i: 0, label: "(0,0)" }],
    msg: {
      en: (
        <>
          Still at (0,0): the lower neighbor (1,0), which is idx 4, is also
          land, so union(0, 4) and <b>count goes 4 → 3</b>. The three land cells
          in the top left are now one component.
        </>
      ),
      zh: (
        <>
          仍在 (0,0):下邻 (1,0)(idx = 4)也是陆地 → union(0, 4),
          <b>count 4 → 3</b>。左上角的三块陆地现在是同一个连通块。
        </>
      ),
    },
  },
  {
    cells: [
      { v: 1, state: "ok" }, { v: 1, state: "ok" }, { v: 0, state: "ghost" }, { v: 1, state: "lit" },
      { v: 1, state: "ok" }, { v: 0, state: "ghost" }, { v: 0, state: "ghost" }, { v: 1, state: "lit" },
    ],
    ptrs: [{ i: 3, label: "(0,3)" }],
    msg: {
      en: (
        <>
          (0,1) has water to the right and below, so it is skipped. At (0,3) the
          right neighbor is outside the grid, and the lower neighbor (1,3),
          which is idx 7, is land, so union(3, 7) and{" "}
          <b>count goes 3 → 2</b>.
        </>
      ),
      zh: (
        <>
          (0,1) 的右邻和下邻都是水,跳过。到 (0,3):右邻出界,
          下邻 (1,3)(idx = 7)是陆地 → union(3, 7),<b>count 3 → 2</b>。
        </>
      ),
    },
  },
  {
    cells: [
      { v: 1, state: "ok" }, { v: 1, state: "ok" }, { v: 0, state: "ghost" }, { v: 1, state: "lit" },
      { v: 1, state: "ok" }, { v: 0, state: "ghost" }, { v: 0, state: "ghost" }, { v: 1, state: "lit" },
    ],
    msg: {
      en: (
        <>
          In row 1, the land cells (1,0) and (1,3) have no land to their right
          and nothing below. The scan ends with <b>count = 2</b>, so there are
          two islands: {"{(0,0),(0,1),(1,0)}"} and {"{(0,3),(1,3)}"}.
        </>
      ),
      zh: (
        <>
          第 1 行的陆地 (1,0)、(1,3),右邻不是陆地,下邻出界。
          扫描结束,<b>count = 2</b>,两座岛:{"{(0,0),(0,1),(1,0)}"} 与{" "}
          {"{(0,3),(1,3)}"}。
        </>
      ),
    },
  },
];

/* ================= Page ================= */

const CHIPS = [
  { id: "why", n: "01", label: { en: "Why it exists", zh: "为什么需要它" } },
  {
    id: "memory",
    n: "02",
    label: { en: "One array, one forest", zh: "一个数组,一片森林" },
  },
  {
    id: "optimize",
    n: "03",
    label: { en: "Two optimizations", zh: "两大优化" },
  },
  { id: "impl", n: "04", label: { en: "Build one", zh: "手写实现" } },
  { id: "langs", n: "05", label: { en: "Three languages", zh: "三语言对照" } },
  {
    id: "patterns",
    n: "06",
    label: { en: "Patterns and problems", zh: "套路与精讲" },
  },
  { id: "problems", n: "07", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "08", label: { en: "Quiz", zh: "通关测验" } },
];

export default function UnionFindChapter() {
  return (
    <main className="page" data-ch="union-find">
      <Hero
        ch="union-find"
        title={{
          en: (
            <>
              The <span className="grad">Union-Find</span> structure
            </>
          ),
          zh: (
            <>
              并查集 <span className="grad">Union-Find</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              It answers exactly <strong>two</strong> questions: are these two
              elements in the same set, and merge these two sets. It keeps the
              elements in a <strong>forest</strong>, where each set is one tree
              and the root of that tree is the set&apos;s representative. One
              integer array holds the whole thing, and with both optimizations
              each operation costs <strong>effectively constant</strong> time.
            </>
          ),
          zh: (
            <>
              它只回答<strong>两个</strong>问题:两个元素是否在同一个集合;
              把两个集合合并。它把元素组织成一片<strong>森林</strong>
              —— 一个集合就是一棵树,树根就是这个集合的代表元。
              一个整型数组装下全部结构,两个优化都开时,
              每次操作的代价<strong>近乎常数</strong>。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 Why it exists ================= */}
      <Section
        id="why"
        index="01"
        title={{
          en: "Why it exists: connectivity that keeps changing",
          zh: "为什么需要它:一直在变的连通性",
        }}
        desc={{
          en: "A is connected to B, B is connected to C. Are A and C in the same group?",
          zh: "A 和 B 相连,B 和 C 相连 —— 那 A 和 C 在同一组里吗?",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Suppose you run a social network. Events keep arriving: A and
                  B became friends, C and D became friends, B and C became
                  friends. Between those events, someone asks:{" "}
                  <strong>are A and D in the same group now?</strong> Being in
                  the same group is <strong>transitive</strong>. If A—B, B—C and
                  C—D all exist, then A and D belong to the same group even
                  though they never met. This problem has a name:{" "}
                  <strong>dynamic connectivity</strong>. Connections are added
                  over time, and queries can arrive at any moment.
                </p>
                <p>
                  Answering that question needs only two operations, and a
                  Union-Find structure provides exactly those two, no more.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  假设你在维护一个社交网络。事件不断到来:A 和 B 成为好友,C 和 D
                  成为好友,B 和 C 成为好友……其间随时有人来问:
                  <strong>A 和 D 现在算同一组吗?</strong>
                  「同组」这层关系是<strong>可传递的</strong>:A—B、B—C、C—D
                  都成立,那么 A 和 D 哪怕素未谋面,也属于同一组。
                  这类问题有个名字:<strong>动态连通性(dynamic connectivity)</strong>
                  —— 连接关系随时间增加,查询随时可能到来。
                </p>
                <p>
                  回答这个问题只需要两个操作,而并查集提供的恰好就是这两个,再无其他。
                </p>
              </>
            }
          />
        </div>
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="OPERATION 1" zh="操作一" />
            </div>
            <div className="card-title">
              <T
                en="find(x) — which set is x in?"
                zh="find(x) —— x 在哪个集合里?"
              />
            </div>
            <T
              en={
                <p>
                  Each set elects one member as its{" "}
                  <b>representative, called the root</b>. To learn whether A and
                  D are in the same set, you do not follow the chain of
                  friendships. You ask for the representative of A and the
                  representative of D. <b>Same representative means same set.</b>{" "}
                  This turns &quot;are they connected&quot; into &quot;are these
                  two numbers equal&quot;, which is the whole idea.
                </p>
              }
              zh={
                <p>
                  每个集合推举一个成员当<b>代表元,也就是根</b>。
                  想知道 A 和 D 是不是同一集合,不必顺着好友关系链走一遍 ——
                  问一句「A 的代表元是谁?D 的代表元是谁?」
                  <b>代表元相同就是同一集合。</b>
                  这一步把「连通吗」变成了「这两个数相等吗」,整个结构的思想就在这里。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="OPERATION 2" zh="操作二" />
            </div>
            <div className="card-title">
              <T
                en="union(a, b) — merge two sets"
                zh="union(a, b) —— 合并两个集合"
              />
            </div>
            <T
              en={
                <p>
                  a and b became friends. Find the representative of each side,
                  then <b>make one representative point at the other</b>. The two
                  sets become one immediately. Every other member of the smaller
                  set is now in the merged set without being visited, because
                  they all reach the same root anyway.
                </p>
              }
              zh={
                <p>
                  a 和 b 成为好友:先找出两边各自的代表元,再
                  <b>让一个代表元指向另一个</b>。两个集合立刻并成一个。
                  被并走的那个集合里,其余成员一个都不用访问 ——
                  反正它们最终都会爬到同一个根。
                </p>
              }
            />
          </div>
        </div>
        <div className="prose" style={{ marginTop: 18 }}>
          <T
            en={
              <p>
                Why not use graph traversal? You could store the edges and run a
                DFS or BFS from A each time, checking whether D is reachable
                (chapter 12 covers those). That works, but every query traverses
                the graph again at O(V+E), and the work is thrown away because
                new edges keep arriving. Union-Find is built for exactly this
                shape of problem. It is also called a{" "}
                <strong>disjoint set union</strong> structure, or{" "}
                <strong>DSU</strong>.
              </p>
            }
            zh={
              <p>
                为什么不用图遍历?把边存下来,每次从 A 出发做一遍 DFS/BFS
                看能否到达 D 也可以(第 12 章会讲)。问题是每来一次查询就要重新遍历一遍,
                单次 O(V+E),而且边还在不断增加,上一次遍历的结果没法复用。
                并查集正是为这种形态的问题设计的,它的另一个名字是
                <strong>不相交集合(disjoint set union,简称 DSU)</strong>。
              </p>
            }
          />
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Approach" zh="方案" />
                </th>
                <th>
                  <T en="Add one connection" zh="加一条连接" />
                </th>
                <th>
                  <T en="One connectivity query" zh="查一次连通" />
                </th>
                <th>
                  <T en="Good for" zh="适合场景" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T en="Traverse again with DFS / BFS" zh="每次重新 DFS / BFS 遍历" />
                  </b>
                </td>
                <td>
                  <BigO o="1" label={{ en: "O(1) to store", zh: "O(1) 存边" }} />
                </td>
                <td>
                  <BigO o="n" label="O(V+E)" />
                </td>
                <td>
                  <T
                    en="A fixed graph, or when you need the path itself"
                    zh="静态图,或需要具体路径"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Union-Find" zh="并查集" />
                  </b>
                </td>
                <td>
                  <BigO o="1" label="O(α(n))" />
                </td>
                <td>
                  <BigO o="1" label="O(α(n))" />
                </td>
                <td>
                  <b>
                    <T
                      en="Connections keep being added, and you only ask about connectivity"
                      zh="连接不断加入,而且只问连通性"
                    />
                  </b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "The trade: it forgets the path, and it cannot split",
            zh: "它的取舍:丢掉路径,而且不能拆分",
          }}
        >
          <T
            en={
              <>
                <p>
                  Union-Find is fast because it <b>keeps the conclusion and
                  drops the details</b>. After a union, the information about{" "}
                  <i>how</i> A and D are connected is gone. All that remains is
                  that they are in the same set. So it cannot tell you a route
                  from A to D, and it cannot answer how far apart they are.
                </p>
                <p>
                  There is a second limit, and it is the one most often left
                  out. Union-Find merges, but it{" "}
                  <b>cannot split a set back apart</b>. There is no efficient
                  way to undo a union, because the elements that were merged are
                  no longer distinguishable from the ones that were already
                  there. If a problem removes edges, the standard fix is to read
                  all the operations first and{" "}
                  <b>process them in reverse order</b>, so that every removal
                  becomes an addition. That only works when you can see the
                  whole sequence in advance, which is called an offline
                  solution. Other cases need a rollback variant that stores an
                  undo log and gives up path compression.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  并查集之所以快,是因为它<b>只保留结论,丢掉细节</b>:
                  union 之后,「A 和 D 是<i>怎么</i>连起来的」这条信息就没有了,
                  剩下的只有「它们在同一个集合里」。所以它答不了「A 到 D 怎么走」,
                  也答不了「相隔多远」。
                </p>
                <p>
                  还有第二个限制,而且最常被略过:并查集只能合并,
                  <b>不能把一个集合拆回去</b>。它没有高效的撤销手段 ——
                  合并进来的元素和原本就在里面的元素已经无法区分。
                  如果题目要求删除边,标准做法是先把所有操作读完,再
                  <b>倒着处理</b>,让每一次删除变成一次加入。
                  这要求你能提前看到整个操作序列,也就是所谓的离线做法;
                  否则就要用可撤销变体 —— 记一份撤销日志,并放弃路径压缩。
                </p>
              </>
            }
          />
        </Callout>
        <Callout
          tone="story"
          title={{
            en: "Sixty years old and still in use",
            zh: "六十岁,仍在一线",
          }}
        >
          <T
            en={
              <p>
                The structure was published by Galler and Fischer in 1964 and is
                still used everywhere.{" "}
                <b>Kruskal&apos;s minimum spanning tree algorithm</b> sorts the
                edges by weight and adds them one by one. Before adding an edge
                it asks Union-Find whether the two endpoints are already
                connected. If they are, adding the edge would create a cycle, so
                the edge is skipped. Compilers use the same structure during
                type inference, to merge type variables that must be equal.
                Image processing uses it to label connected regions of pixels.
                The core is three short methods, yet the matching lower bound on
                its running time was only proved in 1989, by Fredman and Saks.
              </p>
            }
            zh={
              <p>
                这个结构由 Galler 和 Fischer 在 1964 年提出,至今仍随处可见。
                <b>Kruskal 最小生成树算法</b>把边按权重排序后逐条加入,
                每加一条之前先问并查集:这条边的两个端点是否已经连通?
                若已连通,加上它就会形成环,于是跳过。
                编译器在类型推导里用同一个结构合并必须相等的类型变量;
                图像处理用它标记像素的连通区域。核心不过三个短方法,
                而它运行时间的匹配下界要到 1989 年才由 Fredman 和 Saks 证明出来。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §02 One array = one forest ================= */}
      <Section
        id="memory"
        index="02"
        title={{
          en: "In memory: one array is the whole forest",
          zh: "内存里的样子:一个数组就是整片森林",
        }}
        desc={{
          en: "parent[i] is the element directly above i; parent[i] = i means i is a root",
          zh: "parent[i] = 我的上一级是谁;parent[i] = i 表示我就是根",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Everything a Union-Find owns is{" "}
                  <strong>one array of integers, called parent</strong>. There
                  are only two rules.
                </p>
                <ul>
                  <li>
                    <code>parent[i] = j</code> means the element directly above
                    i is j. j is <b>not</b> necessarily the root. It may be one
                    link in a longer chain.
                  </li>
                  <li>
                    <code>parent[i] = i</code> means i points at itself, so i is
                    a <b>root</b> and represents its whole set.
                  </li>
                </ul>
                <p>
                  Why mark a root by making it point at itself? A root has no
                  parent, so the slot has to hold something. Storing i itself
                  costs no extra memory, needs no second array of flags, and
                  makes the stopping test a single comparison:{" "}
                  <code>parent[x] == x</code>. Every element, root or not, is
                  handled by the same loop. That is why find is written this
                  way: start at x and keep moving up until the element points at
                  itself.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  并查集的全部家当,就是<strong>一个整型数组 parent</strong>,
                  规则只有两条。
                </p>
                <ul>
                  <li>
                    <code>parent[i] = j</code>:i 的上一级是 j。j{" "}
                    <b>不一定</b>是根,它可能只是一条更长链条上的一环。
                  </li>
                  <li>
                    <code>parent[i] = i</code>:i 指向自己,说明 i 是
                    <b>根</b>,代表着它所在的整个集合。
                  </li>
                </ul>
                <p>
                  为什么用「自己指自己」来标记根?因为根没有上一级,
                  而这个格子总得存点什么。存 i 自己不额外占内存,不需要再开一个标记数组,
                  还让终止判断变成一次比较:<code>parent[x] == x</code> ——
                  根和非根用同一段循环处理。find 因此写成这样:
                  从 x 出发一路往上,直到某个元素指向它自己。
                </p>
              </>
            }
          />
        </div>
        <CodeTabs
          title="find_naive"
          java={{
            code: {
              en: `// Naive find: keep climbing until parent[x] == x
int find(int x) {
    while (parent[x] != x) {   // something is still above x
        x = parent[x];         // move up one level
    }
    return x;                  // points at itself = root = representative
}`,
              zh: `// 朴素版 find:一路往上爬,直到 parent[x] == x
int find(int x) {
    while (parent[x] != x) {   // 上面还有人
        x = parent[x];         // 往上爬一级
    }
    return x;                  // 指向自己 = 根 = 代表元
}`,
            },
          }}
          python={{
            code: {
              en: `# Naive find: keep climbing until parent[x] == x
def find(self, x: int) -> int:
    while self.parent[x] != x:   # something is still above x
        x = self.parent[x]       # move up one level
    return x                     # points at itself = root = representative`,
              zh: `# 朴素版 find:一路往上爬,直到 parent[x] == x
def find(self, x: int) -> int:
    while self.parent[x] != x:   # 上面还有人
        x = self.parent[x]       # 往上爬一级
    return x                     # 指向自己 = 根 = 代表元`,
            },
          }}
          js={{
            code: {
              en: `// Naive find: keep climbing until parent[x] === x
find(x) {
  while (this.parent[x] !== x) {  // something is still above x
    x = this.parent[x];           // move up one level
  }
  return x;                       // points at itself = root = representative
}`,
              zh: `// 朴素版 find:一路往上爬,直到 parent[x] === x
find(x) {
  while (this.parent[x] !== x) {  // 上面还有人
    x = this.parent[x];           // 往上爬一级
  }
  return x;                       // 指向自己 = 根 = 代表元
}`,
            },
          }}
        />
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Now look at the array differently. Draw an arrow from every i
                  to parent[i], and the array becomes a{" "}
                  <strong>forest</strong>: several trees, one tree per set, each
                  root representing its set. This is the{" "}
                  <strong>second time in this book that an array plays the
                  part of a tree</strong>. A heap encodes the parent-child links
                  implicitly through the index arithmetic 2i+1 and 2i+2.
                  Union-Find is more direct: it stores the parent of each node
                  explicitly. In both cases the tree is only a logical shape.
                  Physically there is one contiguous row of integers.
                </p>
                <p>
                  Try it below. <strong>Click two nodes</strong> and watch union
                  call find on each side to reach the two roots, then attach one
                  root under the other. Watch the parent array underneath at the
                  same time and check that everything happening in the diagram
                  is one number changing in the array. Then press{" "}
                  <strong>Worst-case union</strong> to see what goes wrong.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  换个角度看这个数组:给每个 i 画一条指向 parent[i] 的箭头,
                  整个数组就成了一片<strong>森林</strong> —— 若干棵树,
                  一棵树对应一个集合,树根代表这个集合。
                  这是全书<strong>第二次「数组扮演树」</strong>:
                  堆用 2i+1、2i+2 的下标运算隐式编码父子关系,
                  并查集更直接 —— 把每个节点的父节点显式存下来。
                  两种情形里树都只是逻辑形状,物理上始终只有一排连续的整数。
                </p>
                <p>
                  下面亲手试试:<strong>点两个节点</strong>,
                  看 union 如何先对两边各做一次 find 找到两个根,再把一个根挂到另一个下面;
                  同时盯着下方的 parent 数组,确认图里发生的一切,
                  不过是数组里改了一个数。然后点
                  <strong>「最坏顺序 union」</strong>,看看会出什么问题。
                </p>
              </>
            }
          />
        </div>
        <UFLab />
        <Callout
          tone="warn"
          title={{
            en: "What went wrong: the tree degenerated into a chain",
            zh: "问题出在哪:树退化成了一条链",
          }}
        >
          <T
            en={
              <p>
                union(0,1) hangs 0 under 1. union(1,2) then hangs the root of
                that tree under 2, and so on. Every step attaches an existing
                root under a single fresh node, so the tree grows taller and
                never grows wider. Ten elements end up in one chain, and find(0)
                has to take <b>9 steps</b> to reach the root, which is O(n). The
                speed Union-Find is known for is gone. The structure is not the
                problem. <b>The way union chooses which root goes under which
                is the problem</b>, and that is what the next section fixes.
              </p>
            }
            zh={
              <p>
                union(0,1) 把 0 挂到 1 下面,union(1,2) 又把这棵树的根挂到 2 下面,
                依此类推。每一步都是把已有的根挂到一个新的光杆节点下面,
                于是树只长高、不长宽。10 个元素最后连成一条链,find(0)
                要走 <b>9 步</b>才能到根,复杂度 O(n),
                并查集赖以成名的速度荡然无存。问题不在结构本身,
                <b>而在 union 选择「谁挂到谁下面」的做法</b> —— 下一节正是要修这个。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §03 Two optimizations ================= */}
      <Section
        id="optimize"
        index="03"
        title={{
          en: "Two optimizations: keep the trees short",
          zh: "两大优化:把树压矮",
        }}
        desc={{
          en: "Path compression works during find, union by rank works during union. They prevent different things.",
          zh: "路径压缩管 find,按秩合并管 union —— 它们防的不是同一件事",
        }}
        badge={
          <span className="chip" data-tone="warn">
            <T en="★ Asked in interviews" zh="★ 面试必问" />
          </span>
        }
      >
        <div className="prose">
          <T
            en={
              <p>
                The problem in the previous section is that the{" "}
                <strong>tree is too tall</strong>. The cost of find is the
                number of levels between a node and its root. Both optimizations
                aim at the same target, keeping the trees short, but they act at
                different moments and prevent different failures. Both matter,
                and it is worth being able to say what each one does.
              </p>
            }
            zh={
              <p>
                上一节的病根是<strong>树太高</strong>:find 的代价等于节点到根之间的层数。
                两个优化的目标一致 —— 把树压矮,但它们作用的时刻不同,
                防的问题也不同。两个都重要,而且要能说清各自干了什么。
              </p>
            }
          />
        </div>

        <div className="sec-head" style={{ marginTop: 28 }}>
          <span className="sec-index">
            <T en="OPTIMIZATION 1" zh="优化一" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 19 }}>
            <T
              en="Path compression: flatten the path while walking it"
              zh="路径压缩:走过的路,顺手拉直"
            />
          </h3>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                find(x) walks from x up to the root anyway. Every node it passes
                on the way already has a known root by the time the walk
                finishes. So there is no reason to leave them pointing at
                intermediate nodes.{" "}
                <strong>After reaching the root, repoint every node on the
                path directly at the root.</strong>
              </p>
            }
            zh={
              <p>
                find(x) 反正要从 x 一路走到根,走完之后,途中经过的每个节点的根都已经确定了,
                没有理由让它们继续指着中间节点。
                <strong>爬到根之后,把沿途每个节点的 parent 直接改成根。</strong>
              </p>
            }
          />
        </div>
        <div className="uf-cmp">
          <figure>
            <svg
              viewBox="0 0 210 200"
              width="210"
              role="img"
              aria-label="Before compression: a chain"
            >
              <line className="uf-edge" x1={105} y1={62} x2={105} y2={34} />
              <line className="uf-edge" x1={105} y1={112} x2={105} y2={84} />
              <line className="uf-edge" x1={105} y1={162} x2={105} y2={134} />
              <g className="uf-node root">
                <circle cx={105} cy={20} r={14} />
                <text x={105} y={20}>3</text>
              </g>
              <g className="uf-node">
                <circle cx={105} cy={70} r={14} />
                <text x={105} y={70}>2</text>
              </g>
              <g className="uf-node">
                <circle cx={105} cy={120} r={14} />
                <text x={105} y={120}>1</text>
              </g>
              <g className="uf-node lit">
                <circle cx={105} cy={170} r={14} />
                <text x={105} y={170}>0</text>
              </g>
            </svg>
            <figcaption>
              <T
                en="before: find(0) takes 3 steps, 0→1→2→3"
                zh="before:find(0) 要走 3 步 —— 0→1→2→3"
              />
            </figcaption>
          </figure>
          <figure>
            <svg
              viewBox="0 0 210 200"
              width="210"
              role="img"
              aria-label="After compression: every node points at the root"
            >
              <line className="uf-edge lit" x1={60} y1={106} x2={95} y2={48} />
              <line className="uf-edge lit" x1={105} y1={106} x2={105} y2={48} />
              <line className="uf-edge lit" x1={150} y1={106} x2={115} y2={48} />
              <g className="uf-node root">
                <circle cx={105} cy={32} r={14} />
                <text x={105} y={32}>3</text>
              </g>
              <g className="uf-node lit">
                <circle cx={60} cy={120} r={14} />
                <text x={60} y={120}>0</text>
              </g>
              <g className="uf-node lit">
                <circle cx={105} cy={120} r={14} />
                <text x={105} y={120}>1</text>
              </g>
              <g className="uf-node lit">
                <circle cx={150} cy={120} r={14} />
                <text x={150} y={120}>2</text>
              </g>
            </svg>
            <figcaption>
              <T
                en="after: 0, 1 and 2 point at the root, so the next find is 1 step"
                zh="after:0、1、2 都直接指向根,下次 find 只要 1 步"
              />
            </figcaption>
          </figure>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                The extra cost is small, because the walk was going to happen
                anyway and compression only adds a few assignments on the way
                back. The benefit is <strong>permanent</strong>: once a node has
                been compressed, later find calls on it take one step, until a
                later union puts a new root above it. Path compression is what
                prevents the <b>same long path from being walked twice</b>. On
                its own, without union by rank, it already brings the amortized
                cost down to <BigO o="logn" />.
              </p>
            }
            zh={
              <p>
                额外代价很小:这条路本来就要走,压缩只是在回程多做几次赋值。
                收益却是<strong>持久的</strong>:一个节点被压缩过之后,
                之后对它的 find 只要一步,直到后来的某次 union 在它头上又加了新的根。
                路径压缩防的是<b>同一条长路径被反复重走</b>。
                即使不配按秩合并,单独使用它也已经把均摊代价降到{" "}
                <BigO o="logn" />。
              </p>
            }
          />
        </div>

        <div className="sec-head" style={{ marginTop: 36 }}>
          <span className="sec-index">
            <T en="OPTIMIZATION 2" zh="优化二" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 19 }}>
            <T
              en="Union by rank: attach the shorter tree under the taller one"
              zh="按秩合并:矮树挂到高树下面"
            />
          </h3>
        </div>
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Which root goes under which is not an arbitrary choice. Look
                  at the height of the merged tree.
                </p>
                <ul>
                  <li>
                    <b>Shorter tree under the taller one</b>: the new height is
                    max(taller, shorter + 1). While the shorter tree is strictly
                    shorter, that is just the height of the taller tree, so the
                    height <b>does not grow</b>.
                  </li>
                  <li>
                    <b>Taller tree under the shorter one</b>: the new height is
                    taller + 1, so a level is added{" "}
                    <b>for no reason</b>.
                  </li>
                  <li>
                    <b>Two trees of equal height</b>: whichever way you attach
                    them, the result is one level taller. This is the only case
                    where the height can grow.
                  </li>
                </ul>
                <p>
                  So give every root a <strong>rank</strong>, a number that
                  bounds the height of its tree. During union, the root with the
                  smaller rank is attached under the root with the larger rank.
                  If the two ranks are equal, attach either way and increase the
                  new root&apos;s rank by 1. This alone keeps the height within{" "}
                  <strong>O(log n)</strong>, because a tree of rank r contains at
                  least 2ʳ elements. Rank only rises when two trees of equal rank
                  are merged, which at least doubles the size. The argument is
                  the same one used for doubling a dynamic array. Some
                  implementations use <strong>size</strong> instead of rank and
                  attach the smaller set under the larger one. The bound is the
                  same, and you get the size of each set as a by-product, which
                  several problems need.
                </p>
                <p>
                  Path compression cannot prevent this problem, because it only
                  runs during find and only fixes a path that has already been
                  built. Union by rank stops the tall tree from being built at
                  all. That is why they are not interchangeable.
                </p>
                <p>
                  Now check it in the lab. <strong>Turn on both switches</strong>{" "}
                  and press Worst-case union again. The chain of 10 becomes a
                  tree of depth 1.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  谁挂到谁下面不是随手决定的,看看合并后的树高就明白了。
                </p>
                <ul>
                  <li>
                    <b>矮树挂到高树下</b>:新高度 = max(高树高, 矮树高 + 1)。
                    只要矮树严格更矮,结果就等于高树的高度,树高
                    <b>不变</b>。
                  </li>
                  <li>
                    <b>高树挂到矮树下</b>:新高度 = 高树高 + 1,
                    <b>白白</b>多长一层。
                  </li>
                  <li>
                    <b>两棵树等高</b>:无论怎么挂,结果都会高一层 ——
                    这是树高唯一可能增长的情形。
                  </li>
                </ul>
                <p>
                  所以给每个根记一个 <strong>rank(秩)</strong>,
                  它是这棵树高度的上界。union 时,rank 小的根挂到 rank 大的根下面;
                  两个 rank 相等时随便挂,并把新根的 rank 加 1。
                  只用这一条,树高就被压在 <strong>O(log n)</strong> 以内 ——
                  因为 rank 为 r 的树至少含 2ʳ 个元素:rank 只在两棵等秩的树合并时才 +1,
                  而那至少让规模翻倍。这和动态数组「扩容必翻倍」是同一套论证。
                  也有实现用 <strong>size(集合大小)</strong>代替 rank,
                  小集合挂到大集合下面,界是一样的,还顺带得到每个集合的大小 ——
                  好几道题正需要这个。
                </p>
                <p>
                  路径压缩防不了这个问题:它只在 find 时运行,
                  而且只能修一条已经形成的路径;按秩合并则让高树根本长不出来。
                  这就是两者不可互相替代的原因。
                </p>
                <p>
                  现在回实验室验证:<strong>把两个开关都打开</strong>,
                  再点一次「最坏顺序 union」,那条 10 个元素的长链会变成一棵深度为 1 的树。
                </p>
              </>
            }
          />
        </div>
        <UFLab defaultPC defaultRank />
        <Callout
          tone="deep"
          title={{
            en: "α(n): why the cost is called effectively constant, not O(1)",
            zh: "α(n):为什么说「近乎常数」而不写 O(1)",
          }}
        >
          <T
            en={
              <>
                <p>
                  With both optimizations, <b>m operations on n elements cost
                  O(m · α(n)) in total</b>, where α is the{" "}
                  <b>inverse Ackermann function</b>. The Ackermann function
                  grows faster than any primitive recursive function, so its
                  inverse grows extremely slowly. For every n up to 2^65536,
                  which no machine can store, <b>α(n) is at most 4</b>. In
                  practice each operation costs a small constant number of
                  steps.
                </p>
                <p>
                  Be careful with the wording. The bound is{" "}
                  <b>amortized, not worst case</b>: a single find can still walk
                  a long path, and the cost is only small when averaged over the
                  whole sequence of operations. And O(α(n)) is{" "}
                  <b>not the same as O(1)</b>. α does grow, just unimaginably
                  slowly. Saying &quot;effectively constant&quot; is correct.
                  Saying &quot;it is O(1)&quot; is not. The proof of the upper
                  bound is due to Tarjan (1975) and is far beyond this course.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  两个优化都开时,<b>n 个元素上的 m 次操作总代价是 O(m · α(n))</b>,
                  α 是<b>反阿克曼函数</b>。阿克曼函数比任何原始递归函数增长都快,
                  所以它的反函数增长慢到极点:直到 n 约为 2^65536(没有任何机器存得下),
                  <b>α(n) 都不超过 4</b>。实践中每次操作就是常数级的几步。
                </p>
                <p>
                  措辞要小心。这个界是<b>均摊的,不是最坏情形</b>:
                  单次 find 仍可能走一条较长的路径,只有把整串操作平均起来代价才这么小。
                  而且 O(α(n)) <b>不等于 O(1)</b> —— α 确实会增长,
                  只是慢得难以想象。说「近乎常数」是准确的,说「它是 O(1)」则不准确。
                  上界的证明来自 Tarjan(1975),远超本课范围。
                </p>
              </>
            }
          />
        </Callout>
        <Callout
          tone="warn"
          title={{
            en: "Common question: does path compression break rank?",
            zh: "常见疑问:路径压缩会不会让 rank 失效?",
          }}
        >
          <T
            en={
              <p>
                It makes rank inexact, and that is fine. Compression flattens a
                tree without lowering the stored rank, so after compression rank
                is <b>an upper bound on the height, not the height itself</b>.
                That is exactly why the field is called rank and not height. The
                bound is never violated, so correctness and the complexity
                analysis both still hold. In practice you can also write path
                compression alone and skip rank entirely, which gives amortized
                O(log n) and is fast enough for most problems. But when an
                interviewer asks what each optimization does, the answer has to
                be precise: <b>compression shortens a path that already exists,
                union by rank stops a tall tree from forming, and only the two
                together give O(α(n))</b>.
              </p>
            }
            zh={
              <p>
                它会让 rank 变得不精确,而这没有关系。
                压缩把树压扁,却不会调低已经记下的 rank,
                所以压缩之后 rank 是<b>树高的上界,而不是树高本身</b> ——
                这个字段之所以叫「秩」而不叫「高度」,原因就在这里。
                上界永远成立,所以正确性和复杂度分析都不受影响。
                实践中也可以只写路径压缩、完全不要 rank,均摊 O(log n),
                刷题足够用。但面试官问「两个优化各自干什么」时,答案必须准确:
                <b>压缩缩短的是已经存在的路径,按秩合并阻止高树形成,
                只有两者叠加才有 O(α(n))</b>。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §04 Build one ================= */}
      <Section
        id="impl"
        index="04"
        title={{
          en: "Build one: a template worth memorizing",
          zh: "手写实现:一份值得背下来的模板",
        }}
        desc={{
          en: "parent, rank and count; five methods; under 40 lines",
          zh: "parent + rank + count,五个方法,不到 40 行",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                Union-Find is one of the few structures{" "}
                <strong>worth writing from memory</strong>. No standard library
                provides it, so in a problem it always appears as a handwritten
                template plus a little modeling. The version below has both
                optimizations, plus two methods that problems ask for constantly:
                connected, which tests connectivity, and a count of the current
                number of components.
              </p>
            }
            zh={
              <p>
                并查集是极少数<strong>值得逐字背熟</strong>的数据结构:
                没有哪个标准库提供它,所以在题目里它永远以「手写模板 + 一点建模」
                的形式出现。下面这版带满两个优化,外加两个题目里反复用到的方法:
                connected 判连通,以及当前连通块数量 count。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="union_find"
          java={{
            code: {
              en: `class UnionFind {
    private final int[] parent;   // parent[i] = the element directly above i
    private final int[] rank;     // rank[i] = upper bound on the height at root i
    private int count;            // number of components right now

    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];        // all zero: a single node has height 0
        count = n;                // at the start every element is its own set
        for (int i = 0; i < n; i++) parent[i] = i;  // point at itself = root
    }

    public int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];  // path halving: point at grandparent
            x = parent[x];                  // then move up
        }
        return x;
    }

    public boolean union(int a, int b) {
        int ra = find(a), rb = find(b);     // always find both roots first
        if (ra == rb) return false;         // same set already: change nothing
        if (rank[ra] < rank[rb]) {          // make ra the taller root
            int t = ra; ra = rb; rb = t;
        }
        parent[rb] = ra;                    // shorter tree rb goes under ra
        if (rank[ra] == rank[rb]) rank[ra]++;  // equal ranks: the height grows
        count--;                            // two sets became one
        return true;                        // a merge really happened
    }

    public boolean connected(int a, int b) {
        return find(a) == find(b);          // same root = same set
    }

    public int getCount() { return count; }
}`,
              zh: `class UnionFind {
    private final int[] parent;   // parent[i] = i 的上一级
    private final int[] rank;     // rank[i] = 以 i 为根的树高上界
    private int count;            // 当前连通块数量

    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];        // 全 0:单个节点的高度是 0
        count = n;                // 初始时每个元素各成一个集合
        for (int i = 0; i < n; i++) parent[i] = i;  // 指向自己 = 根
    }

    public int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];  // 路径减半:改指向祖父节点
            x = parent[x];                  // 再往上爬
        }
        return x;
    }

    public boolean union(int a, int b) {
        int ra = find(a), rb = find(b);     // 永远先找出两边的根
        if (ra == rb) return false;         // 已是同一集合:什么都不改
        if (rank[ra] < rank[rb]) {          // 让 ra 成为更高的那个根
            int t = ra; ra = rb; rb = t;
        }
        parent[rb] = ra;                    // 矮树 rb 挂到 ra 下面
        if (rank[ra] == rank[rb]) rank[ra]++;  // 秩相等:树高会增长
        count--;                            // 两个集合并成一个
        return true;                        // 确实发生了合并
    }

    public boolean connected(int a, int b) {
        return find(a) == find(b);          // 根相同 = 同一集合
    }

    public int getCount() { return count; }
}`,
            },
            hl: [10, 14, 15, 16, 17, 22, 23, 24, 25, 26, 27, 28, 29, 30],
            note: {
              en: (
                <>
                  <b>Path halving</b>: instead of full compression, this loop
                  points each node at its grandparent as it climbs. One pass, no
                  recursion, no second walk, and the same O(α(n)) bound when
                  combined with union by rank. It is the version most often used
                  in competitive programming.
                </>
              ),
              zh: (
                <>
                  <b>路径减半(path halving)</b>:这个循环不做完整压缩,
                  而是边爬边把每个节点改指向它的祖父。一趟循环,无递归、无第二次遍历,
                  与按秩合并配合时同样是 O(α(n))。竞赛里最常见的正是这种写法。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))  # parent[i] = i: every element is a root
        self.rank = [0] * n           # upper bound on the height
        self.count = n                # number of components

    def find(self, x: int) -> int:
        root = x
        while self.parent[root] != root:   # pass 1: locate the root
            root = self.parent[root]
        while self.parent[x] != root:      # pass 2: repoint the whole path
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a: int, b: int) -> bool:
        ra, rb = self.find(a), self.find(b)  # always find both roots first
        if ra == rb:
            return False                     # same set already: change nothing
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra                  # make ra the taller root
        self.parent[rb] = ra                 # shorter tree goes under taller
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1               # equal ranks: the height grows
        self.count -= 1                      # two sets became one
        return True

    def connected(self, a: int, b: int) -> bool:
        return self.find(a) == self.find(b)  # same root = same set`,
              zh: `class UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))  # parent[i] = i:每个元素都是根
        self.rank = [0] * n           # 树高的上界
        self.count = n                # 连通块数量

    def find(self, x: int) -> int:
        root = x
        while self.parent[root] != root:   # 第一趟:找到根
            root = self.parent[root]
        while self.parent[x] != root:      # 第二趟:把整条路径改指向根
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a: int, b: int) -> bool:
        ra, rb = self.find(a), self.find(b)  # 永远先找出两边的根
        if ra == rb:
            return False                     # 已是同一集合:什么都不改
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra                  # 让 ra 成为更高的那个根
        self.parent[rb] = ra                 # 矮树挂到高树下面
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1               # 秩相等:树高会增长
        self.count -= 1                      # 两个集合并成一个
        return True

    def connected(self, a: int, b: int) -> bool:
        return self.find(a) == self.find(b)  # 根相同 = 同一集合`,
            },
            hl: [3, 8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
            note: {
              en: (
                <>
                  <b>Easy to get wrong:</b> the default recursion limit in
                  Python is 1000, so a recursive find raises RecursionError on a
                  long chain. This version does full path compression with two
                  iterative passes instead. Keep find iterative in Python.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>Python 默认递归深度上限是 1000,
                  递归版 find 在长链数据上会抛 RecursionError。
                  所以这里用两趟迭代实现完整的路径压缩 —— Python 里请坚持迭代写法。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i); // point at itself
    this.rank = new Array(n).fill(0);  // upper bound on the height
    this.count = n;                    // number of components
  }

  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]; // point at grandparent
      x = this.parent[x];                           // then move up
    }
    return x;
  }

  union(a, b) {
    let ra = this.find(a), rb = this.find(b); // always find both roots first
    if (ra === rb) return false;              // same set: change nothing
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;                     // shorter tree goes under taller
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
    this.count--;                             // two sets became one
    return true;
  }

  connected(a, b) {
    return this.find(a) === this.find(b);     // same root = same set
  }
}`,
              zh: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i); // 指向自己
    this.rank = new Array(n).fill(0);  // 树高的上界
    this.count = n;                    // 连通块数量
  }

  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]; // 改指向祖父节点
      x = this.parent[x];                           // 再往上爬
    }
    return x;
  }

  union(a, b) {
    let ra = this.find(a), rb = this.find(b); // 永远先找出两边的根
    if (ra === rb) return false;              // 已是同一集合:什么都不改
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;                     // 矮树挂到高树下面
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
    this.count--;                             // 两个集合并成一个
    return true;
  }

  connected(a, b) {
    return this.find(a) === this.find(b);     // 根相同 = 同一集合
  }
}`,
            },
            hl: [3, 9, 10, 11, 12, 17, 18, 19, 20, 21, 22, 23],
            note: {
              en: (
                <>
                  <b>Easy to get wrong:</b> for large n, store parent and rank
                  in an <code>Int32Array</code>. It uses less memory and keeps
                  the values as fixed-size integers. Note that{" "}
                  <code>Int32Array</code> has no equivalent of the{" "}
                  <code>Array.from</code> index callback used above, so fill it
                  with a plain for loop.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>n 很大时,建议用 <code>Int32Array</code> 存
                  parent 和 rank:内存更省,元素也保持为定长整数。注意{" "}
                  <code>Int32Array</code> 没有上面 <code>Array.from</code>{" "}
                  那种按下标初始化的写法,得用普通 for 循环填。
                </>
              ),
            },
          }}
        />
        <div className="prose" style={{ marginTop: 16 }}>
          <T
            en={
              <>
                <p>
                  Three details in this template are used by problem after
                  problem.
                </p>
                <ul>
                  <li>
                    <b>union returns a boolean.</b> false means the two elements
                    were already in the same set, so nothing was merged. LC 684
                    finds the redundant edge with this return value, and so does
                    the cycle test inside Kruskal&apos;s algorithm.
                  </li>
                  <li>
                    <b>count starts at n and only drops on a real merge.</b>{" "}
                    Each element begins as its own set, so there are n sets. A
                    successful union replaces two sets with one, so the number
                    falls by exactly 1. A union whose two sides already share a
                    root merges nothing, so decrementing there would report
                    fewer components than actually exist. This is why the check{" "}
                    <code>if (ra == rb) return false;</code> comes before{" "}
                    <code>count--</code>.
                  </li>
                  <li>
                    <b>Always find both roots before merging.</b> The first line
                    of union is never anything else. What union merges is two
                    sets, not two individual elements.
                  </li>
                </ul>
              </>
            }
            zh={
              <>
                <p>这份模板里有三个细节,一道题接一道题地反复用到。</p>
                <ul>
                  <li>
                    <b>union 返回 boolean。</b>返回 false
                    表示两个元素本来就在同一集合,什么也没合并。LC 684
                    就靠这个返回值找出多余的边,Kruskal 算法里的判环也是同一个用法。
                  </li>
                  <li>
                    <b>count 初始为 n,只在真正发生合并时才减 1。</b>
                    每个元素起初各成一个集合,所以有 n 个集合;
                    一次成功的 union 把两个集合换成一个,数量正好减 1。
                    而两边根本来就相同的 union 什么也没合并,
                    此时若照样减 1,报出的连通块数就会比实际少。
                    这正是 <code>if (ra == rb) return false;</code> 要写在{" "}
                    <code>count--</code> 之前的原因。
                  </li>
                  <li>
                    <b>合并前永远先找两边的根。</b>union 的第一行不可能是别的。
                    union 合并的是两个集合,不是那两个具体元素。
                  </li>
                </ul>
              </>
            }
          />
        </div>
      </Section>

      {/* ================= §05 Three languages ================= */}
      <Section
        id="langs"
        index="05"
        title={{
          en: "Three languages: no built-in, so the template is the library",
          zh: "三语言对照:没有内置,模板就是标准库",
        }}
        desc={{
          en: "Java, Python and JavaScript all lack an official Union-Find. The only difference is how you allocate the array.",
          zh: "Java、Python、JavaScript 都没有官方并查集 —— 差异只在数组怎么开",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                None of the three standard libraries includes a Union-Find. C++
                does not have one either. You will find it in Boost or in
                competitive programming template libraries. The reason is that
                the structure is small, and the useful details differ per
                problem, so writing thirty seconds of code beats a general API.
                What is worth comparing is therefore not the API but the{" "}
                <strong>choice of container</strong>.
              </p>
            }
            zh={
              <p>
                三门语言的标准库都没有并查集,C++ 也没有 —— 只有 Boost
                或竞赛模板库里才有。原因是这个结构太小,而且每道题需要的细节都不一样,
                与其设计一套通用 API,不如花三十秒手写一个贴合题意的。
                所以真正值得对照的不是 API,而是<strong>容器选型</strong>。
              </p>
            }
          />
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Concern" zh="关注点" />
                </th>
                <th>Java</th>
                <th>Python</th>
                <th>JavaScript</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T en="Container for parent / rank" zh="parent / rank 容器" />
                  </b>
                </td>
                <td><code>int[] parent = new int[n]</code></td>
                <td><code>list(range(n))</code></td>
                <td><code>Array</code> <T en="or" zh="或" /> <code>Int32Array</code></td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Point each slot at itself" zh="初始化为自己指自己" />
                  </b>
                </td>
                <td>
                  <T en="A for loop:" zh="for 循环" /> <code>parent[i] = i</code>
                </td>
                <td>
                  <code>list(range(n))</code> <T en="does it in one step" zh="一步到位" />
                </td>
                <td><code>Array.from({"{length: n}"}, (_, i) =&gt; i)</code></td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="How to write find" zh="find 写法" />
                  </b>
                </td>
                <td>
                  <T
                    en="Iterative (recursion is safe but pointless)"
                    zh="迭代(递归也安全,但没必要)"
                  />
                </td>
                <td>
                  <b>
                    <T en="Must be iterative" zh="必须迭代" />
                  </b>{" "}
                  <T en="(recursion limit 1000)" zh="(递归深度上限 1000)" />
                </td>
                <td>
                  <T
                    en="Iterative (deep recursion risks a stack overflow too)"
                    zh="迭代(深递归同样有爆栈风险)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Performance note" zh="性能小抄" />
                  </b>
                </td>
                <td>
                  <T
                    en="Primitive int[], no boxing, fastest of the three"
                    zh="原始 int[],无装箱,三者中最快"
                  />
                </td>
                <td>
                  <T
                    en="A list holds pointers to int objects, so the constant factor is larger"
                    zh="list 里存的是整数对象的指针,常数因子偏大"
                  />
                </td>
                <td>
                  <T
                    en="Int32Array stores fixed-size integers and uses about half the memory"
                    zh="Int32Array 存定长整数,内存约省一半"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose" style={{ marginTop: 16 }}>
          <T
            en={
              <p>
                One practical question comes up constantly:{" "}
                <strong>what if the keys are not the integers 0 to n−1?</strong>{" "}
                In LC 721 the keys are email addresses. In LC 128 they are
                arbitrary integers that may be negative or as large as 10⁹. The
                answer is the hash table from chapter 6:{" "}
                <strong>map each key to a fresh consecutive id, then use a
                normal array</strong>. The hash table translates, and Union-Find
                merges.
              </p>
            }
            zh={
              <p>
                有一个实战问题反复出现:<strong>key 不是 0 到 n−1 的整数怎么办?</strong>
                LC 721 的 key 是邮箱地址,LC 128 的 key 是任意整数 ——
                可能为负,也可能大到 10⁹。答案是第 6 章的哈希表:
                <strong>先把每个 key 映射成一个连续的新编号,再照常开数组</strong>。
                哈希表负责翻译,并查集负责合并。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="uf_with_string_keys"
          java={{
            code: {
              en: `// String keys: number them with a hash map, then use the array version
Map<String, Integer> id = new HashMap<>();
int idx = 0;
for (String key : keys) {
    // a key seen for the first time gets the next free id
    if (!id.containsKey(key)) id.put(key, idx++);
}
UnionFind uf = new UnionFind(id.size());
// from here on, work with ids only:
uf.union(id.get("a@x.com"), id.get("b@x.com"));`,
              zh: `// key 是字符串:先用哈希表编号,再用数组版并查集
Map<String, Integer> id = new HashMap<>();
int idx = 0;
for (String key : keys) {
    // 第一次见到的 key,发一个新编号
    if (!id.containsKey(key)) id.put(key, idx++);
}
UnionFind uf = new UnionFind(id.size());
// 之后一律用编号操作:
uf.union(id.get("a@x.com"), id.get("b@x.com"));`,
            },
          }}
          python={{
            code: {
              en: `# String keys: number them with a dict, then use the array version
ids: dict[str, int] = {}
for key in keys:
    # setdefault: a new key gets the next id, a known key keeps the old one
    ids.setdefault(key, len(ids))

uf = UnionFind(len(ids))
# from here on, work with ids only:
uf.union(ids["a@x.com"], ids["b@x.com"])`,
              zh: `# key 是字符串:先用字典编号,再用数组版并查集
ids: dict[str, int] = {}
for key in keys:
    # setdefault:没见过就发新编号,见过就返回旧的
    ids.setdefault(key, len(ids))

uf = UnionFind(len(ids))
# 之后一律用编号操作:
uf.union(ids["a@x.com"], ids["b@x.com"])`,
            },
          }}
          js={{
            code: {
              en: `// String keys: number them with a Map, then use the array version
const ids = new Map();
for (const key of keys) {
  // a key seen for the first time gets the next free id
  if (!ids.has(key)) ids.set(key, ids.size);
}
const uf = new UnionFind(ids.size);
// from here on, work with ids only:
uf.union(ids.get("a@x.com"), ids.get("b@x.com"));`,
              zh: `// key 是字符串:先用 Map 编号,再用数组版并查集
const ids = new Map();
for (const key of keys) {
  // 第一次见到的 key,发一个新编号
  if (!ids.has(key)) ids.set(key, ids.size);
}
const uf = new UnionFind(ids.size);
// 之后一律用编号操作:
uf.union(ids.get("a@x.com"), ids.get("b@x.com"));`,
            },
          }}
        />
        <Callout
          tone="idea"
          title={{
            en: "A hash-map Union-Find also works, but do not reach for it first",
            zh: "哈希表版并查集也能用,但别把它当默认选择",
          }}
        >
          <T
            en={
              <p>
                You can use a <code>Map&lt;String, String&gt;</code> directly as
                the parent structure, mapping a key to the key above it, which
                skips the numbering step. The cost is that every step of find
                becomes a hash lookup instead of an array index, several times
                slower per step. A useful rule: <b>if the elements can be
                numbered, number them</b>. An array is the best home for a
                Union-Find, for the reason given in the array chapter:
                contiguous memory plus direct indexing.
              </p>
            }
            zh={
              <p>
                直接拿 <code>Map&lt;String, String&gt;</code> 当 parent(key
                映射到它的上一级 key)也能实现并查集,省掉编号那一步。
                代价是 find 的每一步都从数组下标访问变成一次哈希查找,
                单步慢好几倍。一条实用准则:<b>元素能编号就编号</b>。
                数组是并查集最好的载体,理由和数组章说过的一样:
                连续内存加下标直达。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §06 Patterns and problems ================= */}
      <Section
        id="patterns"
        index="06"
        title={{
          en: "Three patterns: counting, cycle detection, equivalence classes",
          zh: "三大套路:计数、找环、等价类",
        }}
        desc={{
          en: "Three modeling questions for any Union-Find problem: what is a node, what is an edge, and are you counting or testing?",
          zh: "所有并查集题的建模三问:什么是节点?什么是边?要计数还是判连通?",
        }}
        badge={
          <span className="chip" data-tone="warn">
            <T en="★ Interview core" zh="★ 面试核心" />
          </span>
        }
      >
        <div className="prose">
          <T
            en={
              <p>
                About 90% of the code in a Union-Find problem is the same
                template. What is actually being tested is{" "}
                <strong>modeling</strong>: translating the problem statement
                into &quot;these are the nodes, this counts as an edge&quot;.
                Once that translation is done, only three patterns remain.
              </p>
            }
            zh={
              <p>
                并查集题目里 90% 的代码是同一份模板,真正的考点是
                <strong>建模</strong> —— 把题面翻译成「谁是节点、什么算边」。
                翻译完成之后,套路只有三种。
              </p>
            }
          />
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PATTERN 1" zh="套路一" />
            </div>
            <div className="card-title">
              <T en="Count the components" zh="连通块计数" />
            </div>
            <T
              en={
                <p>
                  How many provinces, islands or groups are there? Start count
                  at n, subtract 1 on every successful union, and read the answer
                  when the scan ends. LC 547, 200 and 2316.
                </p>
              }
              zh={
                <p>
                  有几个省份、几座岛、几个组?count 初始为 n,
                  每成功 union 一次减 1,扫完直接读答案。LC 547、200、2316。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PATTERN 2" zh="套路二" />
            </div>
            <div className="card-title">
              <T en="Detect a cycle" zh="找环 / 判冗余" />
            </div>
            <T
              en={
                <p>
                  Add the edges one at a time. An edge whose two endpoints are{" "}
                  <b>already connected</b> closes a cycle. This is the same test
                  Kruskal&apos;s algorithm uses. LC 684 and 685.
                </p>
              }
              zh={
                <p>
                  逐边加入,某条边的两个端点<b>已经连通</b>,
                  它就会闭合成环。这与 Kruskal 算法用的判断完全相同。LC 684、685。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PATTERN 3" zh="套路三" />
            </div>
            <div className="card-title">
              <T en="Merge equivalence classes" zh="等价类合并" />
            </div>
            <T
              en={
                <p>
                  Relations like equal, similar or same account are transitive
                  once you group by them. Union everything, then check or group
                  by root. LC 990, 721 and 839.
                </p>
              }
              zh={
                <p>
                  「相等」「相似」「同账户」这类关系,一旦按它分组就有传递性。
                  全部 union 起来,再按根检查或分组。LC 990、721、839。
                </p>
              }
            />
          </div>
        </div>

        {/* — Walkthrough A — */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="WALKTHROUGH A" zh="精讲 A" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 547 · Number of Provinces" zh="LC 547 · 省份数量" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>The problem:</b> there are n cities, and isConnected[i][j] = 1
                means i and j are directly connected. Being connected is
                transitive, and you must return the number of provinces, that is
                the number of components.{" "}
                <b>The brute force approach:</b> run a DFS from every unvisited
                city to mark its whole province, and count how many times you
                started one. That works and costs O(n²); chapter 12 covers it.{" "}
                <b>The Union-Find view:</b> every 1 in the matrix is an edge.
                Union cell by cell, let count fall from n, and the value left is
                the number of provinces. No visited array is needed.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>n 个城市,isConnected[i][j] = 1 表示 i、j 直接相连;
                相连关系可传递,求省份(也就是连通块)的个数。
                <b> 暴力做法:</b>对每个没访问过的城市做一次 DFS
                把整个省份标掉,数发起了几次 —— 可行,O(n²),第 12 章会讲。
                <b> 并查集视角:</b>矩阵里的每个 1 就是一条边,逐格 union,
                让 count 从 n 一路减,剩下多少就是几个省 —— 连访问标记数组都不需要。
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 547 · union cell by cell, count falls from 4 to 2 (the cells show the parent array)",
            zh: "LC 547 · 逐格 union,count 从 4 减到 2(格子里是 parent 数组)",
          }}
          frames={F547}
        />
        <CodeTabs
          title="lc547_provinces"
          java={{
            code: {
              en: `class Solution {
    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        UnionFind uf = new UnionFind(n);   // the template class from §04
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {   // symmetric: upper triangle only
                if (isConnected[i][j] == 1) {
                    uf.union(i, j);        // an edge: merge, count updates itself
                }
            }
        }
        return uf.getCount();              // components left = provinces
    }
}`,
              zh: `class Solution {
    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        UnionFind uf = new UnionFind(n);   // §04 的模板类
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {   // 矩阵对称,只扫上三角
                if (isConnected[i][j] == 1) {
                    uf.union(i, j);        // 有边就合并,count 自动维护
                }
            }
        }
        return uf.getCount();              // 剩几个连通块就是几个省
    }
}`,
            },
            hl: [6, 7, 8, 12],
          }}
          python={{
            code: {
              en: `class Solution:
    def findCircleNum(self, isConnected: list[list[int]]) -> int:
        n = len(isConnected)
        uf = UnionFind(n)              # the template class from §04
        for i in range(n):
            for j in range(i + 1, n):  # symmetric: upper triangle only
                if isConnected[i][j] == 1:
                    uf.union(i, j)     # an edge: merge, count updates itself
        return uf.count                # components left = provinces`,
              zh: `class Solution:
    def findCircleNum(self, isConnected: list[list[int]]) -> int:
        n = len(isConnected)
        uf = UnionFind(n)              # §04 的模板类
        for i in range(n):
            for j in range(i + 1, n):  # 矩阵对称,只扫上三角
                if isConnected[i][j] == 1:
                    uf.union(i, j)     # 有边就合并,count 自动维护
        return uf.count                # 剩几个连通块就是几个省`,
            },
            hl: [5, 6, 7, 8, 9],
          }}
          js={{
            code: {
              en: `var findCircleNum = function (isConnected) {
  const n = isConnected.length;
  const uf = new UnionFind(n);         // the template class from §04
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {  // symmetric: upper triangle only
      if (isConnected[i][j] === 1) {
        uf.union(i, j);                // an edge: merge, count updates itself
      }
    }
  }
  return uf.count;                     // components left = provinces
};`,
              zh: `var findCircleNum = function (isConnected) {
  const n = isConnected.length;
  const uf = new UnionFind(n);         // §04 的模板类
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {  // 矩阵对称,只扫上三角
      if (isConnected[i][j] === 1) {
        uf.union(i, j);                // 有边就合并,count 自动维护
      }
    }
  }
  return uf.count;                     // 剩几个连通块就是几个省
};`,
            },
            hl: [4, 5, 6, 7, 11],
          }}
        />
        <Callout
          tone="win"
          title={{ en: "Complexity and follow-ups", zh: "复杂度与追问" }}
        >
          <T
            en={
              <p>
                Time <b>O(n²·α(n))</b>, because the matrix has n² cells and
                reading it once is already the lower bound. Space <b>O(n)</b>.
                First follow-up: DFS is also O(n²), so what does Union-Find buy
                here? On this input, nothing. But if the relations arrive{" "}
                <b>one at a time</b> and the count has to be reported in
                between, Union-Find updates incrementally while DFS starts over.
                Second follow-up: why only the upper triangle? The matrix is
                symmetric, so i-j and j-i are the same edge. Scanning both is
                only wasted work, not an error, because a second union of the
                same pair returns false and changes nothing.
              </p>
            }
            zh={
              <p>
                时间 <b>O(n²·α(n))</b> —— 矩阵本身就有 n² 个格子,读一遍已是下限;
                空间 <b>O(n)</b>。追问一:DFS 也是 O(n²),并查集好在哪?
                在这份输入上没有优势。但如果关系是<b>一条条到来</b>、
                中途要随时报数,并查集增量维护,DFS 则要从头再来。
                追问二:为什么只扫上三角?矩阵对称,i-j 和 j-i 是同一条边;
                扫两遍只是浪费,不会出错 —— 同一对元素第二次 union 会返回 false,
                什么都不改。
              </p>
            }
          />
        </Callout>

        {/* — Walkthrough B — */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="WALKTHROUGH B" zh="精讲 B" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 684 · Redundant Connection" zh="LC 684 · 冗余连接" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <>
                <p>
                  <b>The problem:</b> a tree with n nodes should have exactly
                  n−1 edges. One extra edge was added, so the graph now contains{" "}
                  <b>exactly one cycle</b>. The edges are given in order, and you
                  must return <b>the extra edge</b>. If more than one edge would
                  work, return the one that appears <b>last</b> in the input.
                </p>
                <p>
                  <b>The idea:</b> a tree is a graph that is connected and has no
                  cycle. Process the edges <b>one at a time</b> and union each
                  one. Normally the two endpoints are in different sets, so the
                  merge succeeds and the number of components drops by one. But
                  if an edge&apos;s two endpoints{" "}
                  <b>already have the same root</b>, a path between them already
                  exists, and adding this edge closes a cycle. That edge is the
                  redundant one.
                </p>
                <p>
                  <b>Why does this give the last one automatically?</b> The
                  graph has exactly one cycle. Every edge that is not on the
                  cycle joins two previously separate parts, so it never
                  triggers the test. Among the cycle&apos;s edges, all but the
                  last one in input order are added before the cycle is
                  complete. So the edge that triggers the test is the{" "}
                  <b>only</b> one that can, and it is the last edge of the cycle
                  in input order. Below, the parent array is merged edge by edge,
                  and the two endpoints of the conflicting edge are marked.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <b>题意:</b>一棵 n 个节点的树本应只有 n−1 条边,
                  现在多给了 1 条,于是图里<b>恰好含一个环</b>。
                  edges 按输入顺序给出,要求返回<b>那条多余的边</b>;
                  若有多条候选,返回<b>在输入里最后出现</b>的那条。
                </p>
                <p>
                  <b>思路:</b>树的定义是「连通且无环」。<b>逐条边</b>做 union:
                  正常情况下一条边的两个端点分属不同集合,合并成功,连通块少一个;
                  但一旦某条边的两端<b>已经同根</b>,说明它们之间早有路径,
                  再接上这条边就闭合成环 —— 它就是那条冗余边。
                </p>
                <p>
                  <b>为什么天然就是「最后出现」的那条?</b>
                  图里恰好只有一个环。不在环上的边连接的是两个原本分离的部分,
                  永远不会触发这个判断;而环上的边中,除了输入顺序里最后一条,
                  其余都在环闭合之前就加进去了。所以触发判断的边是
                  <b>唯一</b>可能触发的那条,而它正是环上输入顺序最后的那条边。
                  下面按边逐步合并 parent 数组,冲突边的两端会被标出。
                </p>
              </>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 684 · union edge by edge; an edge between two already connected nodes closes a cycle (the cells show the parent array)",
            zh: "LC 684 · 逐边 union,两端已连通的边就是成环边(格子里是 parent 数组)",
          }}
          frames={F684}
        />
        <CodeTabs
          title="lc684_redundant_connection"
          java={{
            code: {
              en: `class Solution {
    public int[] findRedundantConnection(int[][] edges) {
        int n = edges.length;                 // n edges means nodes are 1..n
        UnionFind uf = new UnionFind(n + 1);  // nodes start at 1: one spare slot
        for (int[] e : edges) {
            int u = e[0], v = e[1];
            if (uf.connected(u, v)) {         // same root already
                return e;                     // adding this edge closes a cycle
            }
            uf.union(u, v);                   // not connected: merge normally
        }
        return new int[0];                    // unreachable: a solution is granted
    }
}`,
              zh: `class Solution {
    public int[] findRedundantConnection(int[][] edges) {
        int n = edges.length;                 // n 条边意味着节点恰好是 1..n
        UnionFind uf = new UnionFind(n + 1);  // 节点从 1 编号,多开一格占位
        for (int[] e : edges) {
            int u = e[0], v = e[1];
            if (uf.connected(u, v)) {         // 两端已经同根
                return e;                     // 这条边一加就闭合成环
            }
            uf.union(u, v);                   // 没连通:正常合并
        }
        return new int[0];                    // 走不到:题目保证有解
    }
}`,
            },
            hl: [7, 8, 10],
            note: {
              en: (
                <>
                  Node ids start at 1, so the array has <code>n + 1</code> slots
                  and slot 0 stays unused. Using <code>connected</code> states
                  the intent most plainly. You can also write{" "}
                  <code>if (!uf.union(u, v)) return e;</code>, which is exactly
                  why union returns a boolean in §04.
                </>
              ),
              zh: (
                <>
                  节点编号从 1 开始,所以数组开 <code>n + 1</code> 格,0
                  号位闲置。用 <code>connected</code> 判断意图最直白;
                  也可以写成 <code>if (!uf.union(u, v)) return e;</code> ——
                  §04 让 union 返回 boolean 正是为了这个场景。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def findRedundantConnection(self, edges: list[list[int]]) -> list[int]:
        uf = UnionFind(len(edges) + 1)   # n edges: nodes 1..n, one spare slot
        for u, v in edges:
            if uf.connected(u, v):       # same root already
                return [u, v]            # adding this edge closes a cycle
            uf.union(u, v)               # not connected: merge normally
        return []                        # unreachable: a solution is granted`,
              zh: `class Solution:
    def findRedundantConnection(self, edges: list[list[int]]) -> list[int]:
        uf = UnionFind(len(edges) + 1)   # n 条边:节点 1..n,多开一格占位
        for u, v in edges:
            if uf.connected(u, v):       # 两端已经同根
                return [u, v]            # 这条边一加就闭合成环
            uf.union(u, v)               # 没连通:正常合并
        return []                        # 走不到:题目保证有解`,
            },
            hl: [5, 6, 7],
          }}
          js={{
            code: {
              en: `var findRedundantConnection = function (edges) {
  const uf = new UnionFind(edges.length + 1);  // nodes 1..n, one spare slot
  for (const [u, v] of edges) {
    if (uf.connected(u, v)) {          // same root already
      return [u, v];                   // adding this edge closes a cycle
    }
    uf.union(u, v);                    // not connected: merge normally
  }
  return [];                           // unreachable: a solution is granted
};`,
              zh: `var findRedundantConnection = function (edges) {
  const uf = new UnionFind(edges.length + 1);  // 节点 1..n,多开一格占位
  for (const [u, v] of edges) {
    if (uf.connected(u, v)) {          // 两端已经同根
      return [u, v];                   // 这条边一加就闭合成环
    }
    uf.union(u, v);                    // 没连通:正常合并
  }
  return [];                           // 走不到:题目保证有解
};`,
            },
            hl: [4, 5, 7],
          }}
        />
        <Callout
          tone="win"
          title={{ en: "Complexity and follow-ups", zh: "复杂度与追问" }}
        >
          <T
            en={
              <p>
                Time <b>O(n·α(n))</b>: n edges, one union per edge, and each
                union does two finds. Space <b>O(n)</b> for the parent array.
                Follow-up: <b>LC 685, Redundant Connection II</b>, makes the
                graph <b>directed</b>, and it is much harder. The extra edge can
                cause two different faults: some node ends up with{" "}
                <b>in-degree 2</b>, meaning two parents, or the graph contains a{" "}
                <b>directed cycle</b>, and both can happen at once. You have to
                separate the cases, pick the candidate edges, and only then use
                Union-Find to verify. You cannot simply union straight through
                as in this problem.
              </p>
            }
            zh={
              <p>
                时间 <b>O(n·α(n))</b>:n 条边,每条边一次 union,
                每次 union 内含两次 find;空间 <b>O(n)</b> 存 parent 数组。
                追问:<b>LC 685 冗余连接 II</b> 把图改成<b>有向</b>,难度陡增 ——
                多出来的边会造成两类问题:某个节点<b>入度变成 2</b>(有了两个父节点),
                或者图里出现<b>有向环</b>,两者还可能同时发生。
                必须先分类讨论、锁定候选边,再用并查集验证,
                不能像本题一样一路 union 到底。
              </p>
            }
          />
        </Callout>

        {/* — Walkthrough C — */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="WALKTHROUGH C" zh="精讲 C" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 200 · Number of Islands" zh="LC 200 · 岛屿数量" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <>
                <p>
                  <b>The problem:</b> a grid holds only &apos;1&apos; for land
                  and &apos;0&apos; for water. Land cells that touch
                  horizontally or vertically form one island. Return the number
                  of islands. <b>The more common solution is DFS or BFS
                  flooding</b>, covered in the graph chapter. Here the same
                  problem is solved from the{" "}
                  <b>Union-Find point of view</b>: treat each land cell as a
                  node, put an edge between adjacent land cells, and the number
                  of components at the end is the number of islands.
                </p>
                <p>
                  <b>Two things to get right.</b> First, a 2D coordinate (r, c)
                  has to be flattened into a single index{" "}
                  <code>id = r×cols + c</code> before it can go into the parent
                  array. This is the <b>row-major</b> layout from the array
                  chapter. Second, each cell only has to look{" "}
                  <b>right and down</b>. Its left and upper neighbors were
                  already joined when those cells were processed, so checking
                  them again is wasted work, the same reason 547 scans only the
                  upper triangle.
                </p>
                <p>
                  count starts at the number of land cells, assuming each one is
                  its own island, and drops by one on every{" "}
                  <b>successful union</b>. Below, the 2×4 grid is flattened,
                  scanned and merged, and count falls from 5.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <b>题意:</b>一张只含 &apos;1&apos;(陆地)和 &apos;0&apos;(水)
                  的网格,上下左右相邻的陆地连成一座岛,求岛屿总数。
                  <b> 更常见的解法是 DFS/BFS 淹没法</b>,图论章会细讲。
                  这里换<b>并查集视角</b>:把每个陆地格子看成一个节点,
                  相邻的两块陆地之间连一条边,最后剩几个连通块就是几座岛。
                </p>
                <p>
                  <b>两个要点。</b>其一,二维坐标 (r, c) 要先拍扁成一维下标{" "}
                  <code>id = r×cols + c</code> 才能放进 parent 数组 ——
                  这正是数组章讲过的<b>行主序(row-major)</b>展平。
                  其二,每格只需向<b>右邻和下邻</b>看:左邻、上邻在处理更早的格子时
                  已经连过了,重复检查纯属浪费 —— 和 547 只扫上三角是同一个道理。
                </p>
                <p>
                  count 初始为陆地总数(先假设每块陆地各是一座岛),
                  之后每<b>成功 union 一次</b>就少一座岛。
                  下面把 2×4 网格拍扁,扫描并合并,看 count 从 5 递减。
                </p>
              </>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 200 · the grid flattened to one dimension; scan, union adjacent land, count falls (1 = land, 0 = water)",
            zh: "LC 200 · 网格拍扁成一维,扫描并 union 相邻陆地,count 递减(1 = 陆地,0 = 水)",
          }}
          frames={F200}
        />
        <CodeTabs
          title="lc200_number_of_islands"
          java={{
            code: {
              en: `class Solution {
    public int numIslands(char[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        UnionFind uf = new UnionFind(rows * cols);
        int islands = 0;                             // each land cell is an island
        for (char[] row : grid)
            for (char cell : row)
                if (cell == '1') islands++;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == '0') continue;     // skip water
                int id = r * cols + c;               // flatten (r,c) to one index
                if (r + 1 < rows && grid[r + 1][c] == '1'    // land below
                        && uf.union(id, (r + 1) * cols + c)) islands--;
                if (c + 1 < cols && grid[r][c + 1] == '1'    // land to the right
                        && uf.union(id, r * cols + c + 1)) islands--;
            }
        }
        return islands;                              // islands left after merging
    }
}`,
              zh: `class Solution {
    public int numIslands(char[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        UnionFind uf = new UnionFind(rows * cols);
        int islands = 0;                             // 先把每块陆地当一座岛
        for (char[] row : grid)
            for (char cell : row)
                if (cell == '1') islands++;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == '0') continue;     // 水格子跳过
                int id = r * cols + c;               // (r,c) 拍扁成一维下标
                if (r + 1 < rows && grid[r + 1][c] == '1'    // 下邻是陆地
                        && uf.union(id, (r + 1) * cols + c)) islands--;
                if (c + 1 < cols && grid[r][c + 1] == '1'    // 右邻是陆地
                        && uf.union(id, r * cols + c + 1)) islands--;
            }
        }
        return islands;                              // 合并后剩几座岛
    }
}`,
            },
            hl: [12, 13, 14, 15, 16],
            note: {
              en: (
                <>
                  <code>islands--</code> runs only when{" "}
                  <code>uf.union(...)</code> returns true. If the two land cells
                  were already connected through another path, union returns
                  false and the count is left alone, so no island is subtracted
                  twice.
                </>
              ),
              zh: (
                <>
                  只有 <code>uf.union(...)</code> 返回 true 才执行{" "}
                  <code>islands--</code>。若两块陆地此前已经通过别的路径连通,
                  union 返回 false,岛数不变 —— 同一座岛不会被减两次。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        rows, cols = len(grid), len(grid[0])
        uf = UnionFind(rows * cols)
        islands = sum(row.count('1') for row in grid)  # each land cell is an island
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '0':
                    continue                            # skip water
                idx = r * cols + c                      # flatten (r,c)
                if r + 1 < rows and grid[r + 1][c] == '1':   # land below
                    if uf.union(idx, (r + 1) * cols + c):
                        islands -= 1
                if c + 1 < cols and grid[r][c + 1] == '1':   # land to the right
                    if uf.union(idx, r * cols + c + 1):
                        islands -= 1
        return islands                                  # islands after merging`,
              zh: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        rows, cols = len(grid), len(grid[0])
        uf = UnionFind(rows * cols)
        islands = sum(row.count('1') for row in grid)  # 先把每块陆地当一座岛
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '0':
                    continue                            # 水格子跳过
                idx = r * cols + c                      # (r,c) 拍扁成一维
                if r + 1 < rows and grid[r + 1][c] == '1':   # 下邻是陆地
                    if uf.union(idx, (r + 1) * cols + c):
                        islands -= 1
                if c + 1 < cols and grid[r][c + 1] == '1':   # 右邻是陆地
                    if uf.union(idx, r * cols + c + 1):
                        islands -= 1
        return islands                                  # 合并后剩几座岛`,
            },
            hl: [10, 11, 12, 13, 14, 15, 16],
          }}
          js={{
            code: {
              en: `var numIslands = function (grid) {
  const rows = grid.length, cols = grid[0].length;
  const uf = new UnionFind(rows * cols);
  let islands = 0;                               // each land cell is an island
  for (const row of grid)
    for (const cell of row)
      if (cell === '1') islands++;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '0') continue;          // skip water
      const id = r * cols + c;                   // flatten (r,c) to one index
      if (r + 1 < rows && grid[r + 1][c] === '1' // land below
          && uf.union(id, (r + 1) * cols + c)) islands--;
      if (c + 1 < cols && grid[r][c + 1] === '1' // land to the right
          && uf.union(id, r * cols + c + 1)) islands--;
    }
  }
  return islands;                                // islands left after merging
};`,
              zh: `var numIslands = function (grid) {
  const rows = grid.length, cols = grid[0].length;
  const uf = new UnionFind(rows * cols);
  let islands = 0;                               // 先把每块陆地当一座岛
  for (const row of grid)
    for (const cell of row)
      if (cell === '1') islands++;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '0') continue;          // 水格子跳过
      const id = r * cols + c;                   // (r,c) 拍扁成一维下标
      if (r + 1 < rows && grid[r + 1][c] === '1' // 下邻是陆地
          && uf.union(id, (r + 1) * cols + c)) islands--;
      if (c + 1 < cols && grid[r][c + 1] === '1' // 右邻是陆地
          && uf.union(id, r * cols + c + 1)) islands--;
    }
  }
  return islands;                                // 合并后剩几座岛
};`,
            },
            hl: [11, 12, 13, 14, 15],
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "Union-Find or DFS for islands: each has its case",
            zh: "岛屿问题用并查集还是 DFS:各有主场",
          }}
        >
          <T
            en={
              <>
                <p>
                  To be fair, <b>DFS flooding is shorter and easier to read</b>{" "}
                  for this problem. Start from any land cell, recursively turn
                  the whole island into water, and count how many times you
                  started. <b>The graph chapter solves this problem again that
                  way.</b> Union-Find has no advantage here: it needs an extra
                  template class and a manual 2D-to-1D conversion.
                </p>
                <p>
                  Where does Union-Find win? When land is added{" "}
                  <b>while the program runs</b>. See LC 305, Number of Islands
                  II: new land cells appear one at a time, and the current island
                  count has to be reported <b>immediately</b> after each one.
                  DFS would rescan the whole grid every time, while Union-Find
                  only unions the new cell with its four neighbors and answers
                  at once. <b>Counting a fixed grid once favours DFS. Merging
                  continuously over time favours Union-Find.</b>
                </p>
              </>
            }
            zh={
              <>
                <p>
                  平心而论,这道题 <b>DFS 淹没法更短也更好读</b>:
                  从任一块陆地出发,递归把整座岛染成水,发起了几次染色就是几座岛。
                  <b>图论章会用这个思路把本题再解一遍。</b>
                  并查集在这里并不占优:要多写一个模板类,还得手动做二维转一维。
                </p>
                <p>
                  那并查集的主场在哪?在<b>程序运行过程中不断新增陆地</b>的场景 ——
                  见 LC 305《岛屿数量 II》:新陆地一块块冒出来,
                  每加一块都要<b>立刻</b>报出当前岛数。DFS 每次都得重扫全图,
                  而并查集只需把新格子和它的四个邻居 union 一下,随到随答。
                  <b>静态网格数一次用 DFS,持续动态合并用并查集。</b>
                </p>
              </>
            }
          />
        </Callout>
      </Section>

      {/* ================= §07 Problem set ================= */}
      <Section
        id="problems"
        index="07"
        title={{
          en: "Problem set: 8 Union-Find problems",
          zh: "高频题单:并查集 8 题",
        }}
        desc={{
          en: "Easy to hard. Ask yourself first: what is a node, what is an edge, and do you need a count or a connectivity test?",
          zh: "由易到难。先问自己:什么是节点?什么是边?要计数还是判连通?",
        }}
        badge={
          <span className="chip">
            <T en="Connectivity" zh="连通性专场" />
          </span>
        }
      >
        <ProblemSet ch="union-find" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 7 correctly to mark this chapter as finished",
          zh: "7 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="union-find" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                Union-Find does exactly two things:{" "}
                <b>find, which returns the root of an element&apos;s set, and
                union, which merges two sets</b>. Two elements are connected
                when their roots are equal. It gives up the path information to
                keep dynamic connectivity cheap.
              </>
            ),
            zh: (
              <>
                并查集只做两件事:<b>find 返回一个元素所在集合的根,union
                合并两个集合</b>。两个元素连通,当且仅当它们的根相同。
                它放弃路径信息,换来廉价的动态连通性维护。
              </>
            ),
          },
          {
            en: (
              <>
                <b>One parent array is the whole forest.</b> parent[i] = i marks
                a root, which costs no extra memory and makes the find loop a
                single comparison. After the heap, this is the second time an
                array plays the part of a tree.
              </>
            ),
            zh: (
              <>
                <b>一个 parent 数组就是整片森林。</b>parent[i] = i 标记根,
                不额外占内存,还让 find 的循环条件变成一次比较。
                继堆之后,这是第二次「数组扮演树」。
              </>
            ),
          },
          {
            en: (
              <>
                The two optimizations do different jobs.{" "}
                <b>Path compression</b> flattens a path that already exists,
                during find. <b>Union by rank</b> stops a tall tree from forming,
                during union. Either one alone gives amortized O(log n). Together
                they give O(m·α(n)) for m operations, which is{" "}
                <b>effectively constant, not O(1)</b>.
              </>
            ),
            zh: (
              <>
                两个优化各司其职:<b>路径压缩</b>在 find 时压平已经形成的路径,
                <b>按秩合并</b>在 union 时阻止高树长出来。
                单用其中一个是均摊 O(log n);两个叠加,m 次操作是 O(m·α(n)) ——
                <b>近乎常数,但不是 O(1)</b>。
              </>
            ),
          },
          {
            en: (
              <>
                <b>union always finds both roots first</b>, because it merges
                sets, not individual elements. For counting components, start at
                n and subtract 1 only when union actually merged something. A
                union of two elements that already share a root must not
                decrement the count.
              </>
            ),
            zh: (
              <>
                <b>union 永远先找出两边的根</b> —— 它合并的是集合,不是个别元素。
                统计连通块时,count 初始为 n,只在 union 真的合并了才减 1;
                两端本来就同根的 union 绝不能减。
              </>
            ),
          },
          {
            en: (
              <>
                Choosing the structure: <b>connections keep arriving and you
                only ask about connectivity, use Union-Find</b>. You need the
                path itself, use BFS or DFS. Keys are not the integers 0 to n−1,
                map them with a hash table first. Elements have to be removed
                from a set, Union-Find cannot split, so process the operations in
                reverse if you can see them all in advance.
              </>
            ),
            zh: (
              <>
                选型口诀:<b>连接不断加入、只问连通性 → 并查集</b>;
                要具体路径 → BFS/DFS;key 不是 0 到 n−1 的整数 →
                先用哈希表映射成编号;需要把元素从集合里拿走 →
                并查集不能拆分,若能提前看到全部操作,就倒序处理。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="union-find" />
    </main>
  );
}
