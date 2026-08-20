"use client";

// 第 8 章 · 二叉搜索树(BST)
// 十段式:直觉(有序数组 vs 链表的两难)→ 性质(中序=升序 + BSTLab)→
// 核心操作(O(h) + 删除三情况图解)→ 手写实现 → 平衡的世界(AVL/红黑/工程对照)→
// 三道精讲(98/230/108,逐帧动画 + 三语言题解)→ 题单 → 测验 → 要点。
//
// 双语:所有文案走 <T> / Loc<…>;代码窗的注释按语言给 en / zh 两版,
// 可执行行逐行相同,所以 hl 行号两版通用。
// 全章「高度 h」按边数计(与第 7、9 章统一):只有根时 h = 0,空树记 −1,
// 一条 n 节点的链 h = n − 1,n 个节点的平衡下限 h = ⌊log₂n⌋。

import "./chapter.css";
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
import { T, type Loc } from "@/lib/i18n";
import { PROBLEMS, QUIZ } from "@/lib/bst-data";
import {
  BSTLab,
  InorderFig,
  MiniTree,
  TreeStepper,
  type StepNode,
  type TreeFrame,
} from "./viz";

/* ================= 精讲动画帧 ================= */

// —— LC 98:验证 BST。反例树:只查父子全过,但 6 违反祖先约束 ——
const N98: StepNode[] = [
  { id: 0, v: 10, x: 300, y: 40 },
  { id: 1, v: 5, x: 170, y: 125 },
  { id: 2, v: 15, x: 430, y: 125 },
  { id: 3, v: 6, x: 360, y: 210 },
  { id: 4, v: 20, x: 500, y: 210 },
];
const E98: [number, number][] = [
  [0, 1],
  [0, 2],
  [2, 3],
  [2, 4],
];
const F98: TreeFrame[] = [
  {
    lit: [0, 1, 2, 3, 4],
    msg: {
      en: (
        <>
          First the trap. Check each parent against its own children: 5&lt;10 ✓,
          15&gt;10 ✓, 6&lt;15 ✓, 20&gt;15 ✓, so <b>every pair passes</b>. And yet
          this tree is not a BST. Where is the problem?
        </>
      ),
      zh: (
        <>
          先看陷阱:逐个检查父子 —— 5&lt;10 ✓、15&gt;10 ✓、6&lt;15 ✓、20&gt;15 ✓,
          <b>全部通过</b>。但这棵树不是 BST。问题出在哪?
        </>
      ),
    },
  },
  {
    lit: [0],
    tags: { 0: "(-∞, +∞)" },
    msg: {
      en: (
        <>
          The fix: give every node the range of values it is allowed to hold. The
          root has no ancestor above it, so its range is <b>(-∞, +∞)</b> and 10
          is fine.
        </>
      ),
      zh: (
        <>
          正解:给每个节点发一张「合法区间」通行证。根没有任何祖先约束,
          区间是 <b>(-∞, +∞)</b>,10 当然合法。
        </>
      ),
    },
  },
  {
    ok: [0],
    lit: [1],
    tags: { 1: "(-∞, 10)" },
    msg: {
      en: (
        <>
          Going left: everything in the left subtree must be smaller than 10, so
          the <b>upper bound tightens to 10</b>. 5 ∈ (-∞, 10) ✓
        </>
      ),
      zh: (
        <>
          往左走:左子树全体必须小于 10,所以<b>上界收紧为 10</b>。
          5 ∈ (-∞, 10) ✓
        </>
      ),
    },
  },
  {
    ok: [0, 1],
    lit: [2],
    tags: { 2: "(10, +∞)" },
    msg: {
      en: (
        <>
          Going right: everything in the right subtree must be larger than 10, so
          the <b>lower bound tightens to 10</b>. 15 ∈ (10, +∞) ✓
        </>
      ),
      zh: (
        <>
          往右走:右子树全体必须大于 10,所以<b>下界收紧为 10</b>。
          15 ∈ (10, +∞) ✓
        </>
      ),
    },
  },
  {
    ok: [0, 1, 2],
    bad: [3],
    tags: { 3: "(10, 15)" },
    msg: {
      en: (
        <>
          The left child of 15 gets the range <b>(10, 15)</b>: it has to be
          smaller than 15 (its parent) and larger than 10 (its grandparent). 6
          breaks the lower bound, so the <b>check fails here</b>.
        </>
      ),
      zh: (
        <>
          15 的左孩子:区间收成 <b>(10, 15)</b> —— 既要小于 15(父节点),
          又要大于 10(祖父节点)。6 越过下界 10,<b>验证失败</b>。
        </>
      ),
    },
  },
  {
    dim: [0, 1, 2, 4],
    bad: [3],
    tags: { 3: "6 < 10 ✗" },
    msg: {
      en: (
        <>
          To review: 6 is fine against its parent 15, but it lives in the right
          subtree of 10, so it must be larger than 10.{" "}
          <b>Checking only parent against child misses what the ancestors
          require.</b>{" "}
          The range method carries those requirements all the way down.
        </>
      ),
      zh: (
        <>
          复盘:6 只和父节点 15 比是合格的,但它住在 10 的右子树里,必须大于 10。
          <b>「只查父子」会漏掉祖先的约束</b> —— 上下界法把祖先的要求一路传下来,
          谁也逃不掉。
        </>
      ),
    },
  },
];

// —— LC 230:BST 中第 K 小(k=3)。中序数数,数到 k 就停 ——
const N230: StepNode[] = [
  { id: 0, v: 5, x: 300, y: 40 },
  { id: 1, v: 3, x: 170, y: 120 },
  { id: 2, v: 7, x: 430, y: 120 },
  { id: 3, v: 2, x: 100, y: 200 },
  { id: 4, v: 4, x: 240, y: 200 },
  { id: 5, v: 8, x: 500, y: 200 },
];
const E230: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
];
const F230: TreeFrame[] = [
  {
    lit: [0, 1, 3],
    msg: {
      en: (
        <>
          The goal is the k = 3 smallest value. In-order traversal reports the
          keys from smallest to largest, so it first walks left as far as it can
          to reach the smallest value in the tree.
        </>
      ),
      zh: (
        <>
          目标:第 k = 3 小。中序遍历会从小到大逐个报数 ——
          先一路向左沉到底,找到全场最小。
        </>
      ),
    },
  },
  {
    ok: [3],
    tags: { 3: "count=1" },
    msg: {
      en: (
        <>
          Visit <b>2</b>: count = 1. Not 3 yet, so keep going.
        </>
      ),
      zh: (
        <>
          访问 <b>2</b>:count = 1。还不到 3,继续。
        </>
      ),
    },
  },
  {
    ok: [3],
    lit: [1],
    tags: { 1: "count=2" },
    msg: {
      en: (
        <>
          The left subtree is done, so return to <b>3</b>: count = 2. Still not
          3, so go into the right subtree.
        </>
      ),
      zh: (
        <>
          左子树走完,回到 <b>3</b>:count = 2。仍不到 3,去右子树。
        </>
      ),
    },
  },
  {
    ok: [3, 1, 4],
    tags: { 4: "count=3 ✓" },
    msg: {
      en: (
        <>
          Visit <b>4</b>: count = 3 = k. <b>The answer is 4</b>, and the
          traversal returns immediately.
        </>
      ),
      zh: (
        <>
          访问 <b>4</b>:count = 3 = k —— <b>答案就是 4</b>,立刻返回。
        </>
      ),
    },
  },
  {
    ok: [3, 1, 4],
    dim: [0, 2, 5],
    msg: {
      en: (
        <>
          Notice that 5, 7 and 8 were never visited. In-order gives the keys in
          sorted order, so counting to k is enough and the traversal can stop
          early: <b>O(h + k)</b> instead of a full walk over the tree.
        </>
      ),
      zh: (
        <>
          注意:5、7、8 根本没被访问。中序天然升序,数到第 k 个就能提前刹车 ——
          只走 <b>O(h + k)</b>,而不是遍历全树。
        </>
      ),
    },
  },
];

// —— LC 108:有序数组 → 平衡 BST。取中点当根,两半递归 ——
const A108 = [-10, -3, 0, 5, 9];
const F108: ArrayFrame[] = [
  {
    cells: A108.map((v) => ({ v })),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 2, label: "mid" },
      { i: 4, label: "hi" },
    ],
    msg: {
      en: (
        <>
          For the tree to be balanced, the two subtrees must hold{" "}
          <b>almost the same number of nodes</b>. Take mid = 2:{" "}
          <b>0 becomes the root</b>, the left half becomes the left subtree, the
          right half becomes the right subtree.
        </>
      ),
      zh: (
        <>
          想让树平衡,就要让左右子树的<b>节点数尽量均等</b> —— 取中点 mid = 2:
          <b>0 当根</b>,左半边归左子树,右半边归右子树。
        </>
      ),
    },
  },
  {
    cells: A108.map((v, i) => ({
      v,
      state: i === 2 ? "ok" : i <= 1 ? "lit" : "ghost",
    })),
    ptrs: [
      { i: 0, label: "lo" },
      { i: 0, label: "mid" },
      { i: 1, label: "hi" },
    ],
    msg: {
      en: (
        <>
          Recurse on the left half [-10, -3]: mid = 0, so{" "}
          <b>-10 becomes the left child of 0</b>.
        </>
      ),
      zh: (
        <>
          递归左半 [-10, -3]:mid = 0 → <b>-10 成为 0 的左孩子</b>。
        </>
      ),
    },
  },
  {
    cells: A108.map((v, i) => ({
      v,
      state: i === 2 || i === 0 ? "ok" : i === 1 ? "lit" : "ghost",
    })),
    msg: {
      en: (
        <>
          Recurse on what is left, [-3]: a range of one element is its own
          midpoint, so <b>-3 becomes the right child of -10</b>. The left half is
          finished.
        </>
      ),
      zh: (
        <>
          再递归剩下的 [-3]:单元素区间,mid 就是它自己 →{" "}
          <b>-3 成为 -10 的右孩子</b>。左半边完工。
        </>
      ),
    },
  },
  {
    cells: A108.map((v, i) => ({
      v,
      state: i <= 2 ? "ok" : i === 3 ? "lit" : undefined,
    })),
    ptrs: [
      { i: 3, label: "mid" },
      { i: 4, label: "hi" },
    ],
    msg: {
      en: (
        <>
          Right half [5, 9]: mid = 3, so <b>5 becomes the right child of 0</b>.
        </>
      ),
      zh: (
        <>
          右半 [5, 9]:mid = 3 → <b>5 成为 0 的右孩子</b>。
        </>
      ),
    },
  },
  {
    cells: A108.map((v) => ({ v, state: "ok" })),
    msg: {
      en: (
        <>
          Finally [9] becomes the right child of 5. Done: 5 nodes and height 2,
          which is ⌊log₂5⌋. Each element is used exactly once, so building the
          tree is <b>O(n)</b>.
        </>
      ),
      zh: (
        <>
          最后 [9] → 5 的右孩子。完成:5 个节点、树高 2 = ⌊log₂5⌋(按边数);
          每个元素恰好被用一次 → <b>O(n)</b> 建树。
        </>
      ),
    },
  },
];

/* ================= 页面 ================= */

const CHIPS: { id: string; n: string; label: Loc<string> }[] = [
  { id: "intuition", n: "01", label: { en: "Intuition", zh: "直觉" } },
  { id: "order", n: "02", label: { en: "The property", zh: "性质与实验室" } },
  { id: "ops", n: "03", label: { en: "Operations", zh: "核心操作" } },
  { id: "impl", n: "04", label: { en: "Build it", zh: "手写实现" } },
  { id: "balance", n: "05", label: { en: "Balanced trees", zh: "平衡的世界" } },
  {
    id: "patterns",
    n: "06",
    label: { en: "Patterns and walkthroughs", zh: "套路与精讲" },
  },
  { id: "problems", n: "07", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "08", label: { en: "Quiz", zh: "通关测验" } },
];

export default function BSTChapter() {
  return (
    <main className="page" data-ch="bst">
      <Hero
        ch="bst"
        title={{
          en: (
            <>
              Binary search tree <span className="grad">BST</span>
            </>
          ),
          zh: (
            <>
              二叉搜索树 <span className="grad">BST</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              One rule added to a binary tree:{" "}
              <strong>left &lt; node &lt; right</strong>, and it must hold for
              the whole subtree, not only for the two children. Each comparison
              then drops an entire subtree from the search. It is binary search,
              growing on a tree you can{" "}
              <strong>insert into and delete from at any time</strong>.
            </>
          ),
          zh: (
            <>
              在二叉树上立下一条规矩:<strong>左 &lt; 根 &lt; 右</strong>,
              而且要对整棵子树成立,不只是对两个孩子。
              从此每次比较都能整棵扔掉一边的子树 ——
              它把二分查找,长在了一棵<strong>随时可以插入删除</strong>的树上。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 直觉 ================= */}
      <Section
        id="intuition"
        index="01"
        title={{
          en: "Why it exists: fast lookup and fast update at the same time",
          zh: "为什么需要它:同时满足快速查找与快速修改",
        }}
        desc={{
          en: "A sorted array and a linked list each fail at one of the two. A balanced BST does both in O(log n).",
          zh: "有序数组与链表各有一项短板 —— 平衡的 BST 在两项上都能达到 O(log n)",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                Look at what the two earlier structures are good at. A{" "}
                <strong>sorted array</strong> searches very quickly: binary
                search halves the range each time, O(log n). But inserting a new
                value means making room for it, and every element to its right
                moves one position, O(n). A <strong>linked list</strong> is the
                opposite. Once you already hold the position, linking a node in
                changes two pointers, O(1). Finding a value, though, means
                walking from the head, O(n). A linked list cannot even run binary
                search, because it has no O(1) random access: the step &quot;jump
                to the middle&quot; itself costs O(n).
              </p>
            }
            zh={
              <p>
                先回顾两位老朋友各自的长板。<strong>有序数组</strong>查找极快:
                二分每次砍一半,O(log n);但插入一个新值得先腾位置 ——
                右边所有元素集体后移,O(n)。<strong>链表</strong>正相反:
                只要已经站在位置上,接一个节点只改两根指针,O(1);
                可想找某个值,只能从头一路问过去,O(n)。
                链表连二分都做不了 —— 它没有 O(1) 随机访问,
                「跳到中间」这一步本身就要 O(n)。
              </p>
            }
          />
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Structure" zh="结构" />
                </th>
                <th>
                  <T en="Search" zh="查找" />
                </th>
                <th>
                  <T en="Insert / delete" zh="插入 / 删除" />
                </th>
                <th>
                  <T en="The reason" zh="原因" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T en="Sorted array" zh="有序数组" />
                  </b>
                </td>
                <td>
                  <BigO o="logn" />
                  <T en=" (binary search)" zh="(二分)" />
                </td>
                <td>
                  <BigO o="n" />
                  <T en=" (shifting)" zh="(搬移)" />
                </td>
                <td>
                  <T
                    en="Contiguous memory: any change moves the other elements"
                    zh="连续内存:改动必须挪动其他元素"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Linked list" zh="链表" />
                  </b>
                </td>
                <td>
                  <BigO o="n" />
                  <T en=" (walk from the head)" zh="(从头遍历)" />
                </td>
                <td>
                  <BigO o="1" />
                  <T
                    en=" (once you hold the position)"
                    zh="(已站在位置上时)"
                  />
                </td>
                <td>
                  <T
                    en="No random access, so there is no way to jump to the middle"
                    zh="没有随机访问,没法「跳到中间」二分"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="BST (while balanced)" zh="BST(平衡时)" />
                  </b>
                </td>
                <td>
                  <BigO o="logn" label="O(h)" />
                </td>
                <td>
                  <BigO o="logn" label="O(h)" />
                </td>
                <td>
                  <T
                    en="Has to be kept from degenerating (§05)"
                    zh="需要防退化(§05 见)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                The idea of a BST is to <strong>freeze the decisions of binary
                search into the shape of a tree</strong>. Think of a library. The
                sign at the entrance says &quot;A–M left, N–Z right&quot;. Inside
                the left wing another sign says &quot;A–F left, G–M right&quot;.
                Each sign you read removes a large part of the building from your
                search. Every node of a BST is one of those signs. And because
                the nodes are connected by <strong>pointers</strong> (chapter 3),
                adding a new sign moves nothing that is already there.
              </p>
            }
            zh={
              <p>
                BST 的主意:把「二分」的判断过程<strong>固化成树的形状</strong>。
                想象一座图书馆:进门的导览牌写着「A–M 往左,N–Z 往右」;走进左区,
                又有一块牌子「A–F 往左,G–M 往右」…… 每读一块牌子,
                要找的范围就少掉一大块。BST 的每个节点就是一块这样的导览牌;
                而且因为节点之间用的是<strong>指针</strong>(第 3 章链表教的),
                插一块新牌子不需要移动任何已有的牌子。
              </p>
            }
          />
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="RULE · the only rule" zh="RULE · 唯一的规矩" />
            </div>
            <div className="card-title">
              <T en="⚖️ left < node < right" zh="⚖️ 左 < 根 < 右" />
            </div>
            <T
              en={
                <p>
                  For any node: <b>every</b> node in its left subtree is smaller
                  than it, and <b>every</b> node in its right subtree is larger.
                  The rule is about the <b>whole subtree</b>, not about the two
                  children. That distinction is the most common misunderstanding
                  in this chapter, and LC 98 in §06 is built to expose it.
                </p>
              }
              zh={
                <p>
                  任何节点:左子树<b>所有</b>节点比它小,右子树<b>所有</b>
                  节点比它大。规矩管的是<b>整棵子树</b>,不是两个孩子 ——
                  这是本章最常见的误解,§06 的 LC 98 专门为它设的局。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">POWER 01</div>
            <div className="card-title">
              <T
                en="Search is one walk down from the root"
                zh="查找 = 自根向下逐层比较"
              />
            </div>
            <T
              en={
                <p>
                  At each node you ask one question, smaller or larger, and{" "}
                  <b>the whole subtree on the other side is dropped</b>. The
                  number of comparisons equals the number of nodes on the path
                  you walk, which is at most h + 1 (a path of h edges touches h +
                  1 nodes). When the tree is balanced, each step removes about
                  half the remaining nodes.
                </p>
              }
              zh={
                <p>
                  每到一个节点只问一次「大还是小」,<b>另一边的子树整棵被扔掉</b>。
                  比较次数 = 走过的路径上的节点数 ≤ h + 1
                  (h 条边的路径串着 h + 1 个节点)。
                  树平衡时,每一步扔掉的大约就是剩余节点的一半。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">POWER 02</div>
            <div className="card-title">
              <T en="Updates move nothing" zh="修改不用搬家" />
            </div>
            <T
              en={
                <p>
                  Insert: follow the search path to an empty slot, attach the new
                  node, change one pointer. Delete: at most one path is touched.
                  Nothing is shifted along an array. This is the behavior
                  inherited from the linked list.
                </p>
              }
              zh={
                <p>
                  插入:沿查找路线走到空位,挂上去,改一根指针。
                  删除:最多牵动一条路径。没有任何「集体后移」——
                  这是从链表那里继承来的性质。
                </p>
              }
            />
          </div>
        </div>
        <Callout
          tone="story"
          title={{
            en: "A dictionary you can still write in",
            zh: "一部还能往里写字的字典",
          }}
        >
          <T
            en={
              <p>
                A printed dictionary is sorted but fixed: adding a word means
                printing a new edition. A hash table is the opposite: reads and
                writes are very fast, but the entries come out in no useful
                order. A BST is a dictionary with loose pages. You can add a page
                at any time, and reading it in order (in-order traversal) still
                gives you sorted entries. Whenever a requirement contains both{" "}
                <b>changing data</b> and <b>order</b>, a tree structure is
                usually the answer.
              </p>
            }
            zh={
              <p>
                印刷版字典有序但改不动:要加一个词,只能重排再版。
                哈希表正相反:存取极快,但倒出来的顺序没有意义。
                BST 是一部活页字典:随时插新页,而且任何时刻按顺序翻阅
                (中序遍历)都是排好序的。需求里同时出现
                <b>数据会变</b>和<b>要有顺序</b>时,答案基本就是树结构。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §02 性质 ================= */}
      <Section
        id="order"
        index="02"
        title={{
          en: "The property: in-order traversal gives sorted keys",
          zh: "性质:中序遍历直接给出有序序列",
        }}
        desc={{
          en: "In-order output is ascending, search is one path down — then grow a lopsided tree yourself",
          zh: "中序遍历 = 升序;查找 = 一路下降 —— 然后亲手把一棵树养歪",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                The previous chapter covered four traversals. For a BST one of
                them matters more than the rest:{" "}
                <strong>in-order traversal (left → node → right) always outputs
                the keys in ascending order</strong>. Why? Draw the tree with
                each node above its own position on the line below. The rule
                puts every node of the left subtree left of the root and every
                node of the right subtree right of it, so the{" "}
                <strong>horizontal position</strong> of a node is its rank in
                sorted order:
              </p>
            }
            zh={
              <p>
                上一章学了四种遍历。对 BST 来说,其中一种格外重要:
                <strong>中序遍历(inorder,左 → 根 → 右)输出的序列必然升序</strong>
                。为什么?把树画出来就明白了 ——
                规矩保证左子树全体在根的左边、右子树全体在根的右边,
                所以每个节点的<strong>水平位置</strong>天然就是它的排序位次:
              </p>
            }
          />
        </div>
        <InorderFig />
        <div className="prose">
          <T
            en={
              <>
                <p>
                  How is this used? Read it in both directions. To get the data
                  out of a BST in order, traverse in order;{" "}
                  <strong>no sorting step is needed</strong>. To check whether a
                  tree is a BST, check that its in-order sequence is strictly
                  increasing. To find the k-th smallest value, count to k during
                  an in-order traversal. One property carries half of this
                  chapter&apos;s problems.
                </p>
                <p>
                  Now search. Type a number into the lab below and press Search.
                  It starts at the root, and after each comparison it{" "}
                  <strong>continues on one side only</strong>. Try Insert as
                  well: the new value always ends up in the empty slot where the
                  search failed. Then press{" "}
                  <strong>&quot;Insert 1→5 in order&quot;</strong> at least once
                  and watch a tree that still obeys the rule but has lost all its
                  speed.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  这条性质怎么用?正反两个方向都用得上。
                  想按顺序拿到 BST 里的数据,中序遍历即可,
                  <strong>不需要额外排序</strong>;想验证一棵树是不是 BST,
                  看它的中序序列是否严格递增;想找「第 k 小」,中序数到第 k 个。
                  一条性质,养活本章一半的题。
                </p>
                <p>
                  再看查找。在下面的实验室里输入一个数字点「查找」,
                  你会看到它从根出发,每一步比较后<strong>只往一边走</strong>。
                  也试试插入:新值总是落在「查找失败的那个空位」上。最后,
                  务必点一次<strong>「顺序插入 1→5」</strong>:
                  亲眼看看规矩没变、速度却没了的样子。
                </p>
              </>
            }
          />
        </div>
        <BSTLab />
        <Callout
          tone="warn"
          title={{
            en: "That lopsided tree is the weak point of a BST",
            zh: "刚才那棵歪树,就是 BST 的软肋",
          }}
        >
          <T
            en={
              <p>
                With sorted input every new value turns the same way, and the
                tree leans into a chain. The height h goes from about log n up to
                n − 1, and search stops removing subtrees and starts checking nodes
                one by one, exactly like a linked list.{" "}
                <b>The rule (left smaller, right larger) guarantees correctness,
                not shape.</b>{" "}
                Shape is the job of the balanced trees in §05.
              </p>
            }
            zh={
              <p>
                顺序插入时每个新值都往同一边拐,树斜成一条链:
                高度 h 从大约 log n 恶化到 n − 1,查找从「整棵扔掉子树」
                退化成「逐个检查」—— 和链表一模一样。
                <b>规矩(左小右大)只保证正确性,不保证形状。</b>
                管形状的是 §05 的平衡树。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §03 核心操作 ================= */}
      <Section
        id="ops"
        index="03"
        title={{
          en: "Core operations: every one of them is O(h)",
          zh: "核心操作:一切都是 O(h)",
        }}
        desc={{
          en: "Search and insert are straightforward. Delete has three cases, drawn one by one.",
          zh: "查找、插入好懂;删除分三种情况 —— 逐一图解",
        }}
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Operation" zh="操作" />
                </th>
                <th>
                  <T en="Complexity" zh="复杂度" />
                </th>
                <th>
                  <T en="Why" zh="为什么" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T en="search" zh="查找 search" />
                  </b>
                </td>
                <td>
                  <BigO o="logn" label="O(h)" />
                </td>
                <td>
                  <T
                    en="Each comparison drops one subtree, so you walk at most one root-to-leaf path"
                    zh="每步比较砍掉一棵子树,最多走一条根到叶的路径"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="insert" zh="插入 insert" />
                  </b>
                </td>
                <td>
                  <BigO o="logn" label="O(h)" />
                </td>
                <td>
                  <T
                    en="A failed search, plus attaching the node in the empty slot (one pointer)"
                    zh="= 一次失败的查找 + 在空位挂上新节点(改一根指针)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="delete" zh="删除 delete" />
                  </b>
                </td>
                <td>
                  <BigO o="logn" label="O(h)" />
                </td>
                <td>
                  <T
                    en="O(h) to locate it, then repair; in the worst case a further walk to find the successor"
                    zh="定位 O(h) + 三种情况的修补,最坏再走一段找后继"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="minimum / maximum" zh="最小 / 最大值" />
                  </b>
                </td>
                <td>
                  <BigO o="logn" label="O(h)" />
                </td>
                <td>
                  <T
                    en="Go left (or right) until there is no child; no comparison is needed"
                    zh="一路向左 / 向右走到底,不用比较"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T
                      en="in-order traversal (the sorted sequence)"
                      zh="中序遍历(取有序序列)"
                    />
                  </b>
                </td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <T
                    en="Every node has to be visited once"
                    zh="每个节点都要拜访一次,免不了"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Why <strong>O(h)</strong> everywhere and not O(log n)? Because
                  h, the height of the tree, is a <strong>variable</strong>. As
                  in chapter 7, height is the number of <b>edges</b> on the
                  longest root-to-leaf path, so a tree with only a root has
                  height 0. When the tree is balanced, h = ⌊log₂n⌋, since each
                  level can hold twice as many nodes as the one above it. When
                  sorted input makes the tree degenerate into a chain, h = n − 1.
                  Saying O(log n) without a condition is wrong. The complete
                  answer is: <b>O(h); that is log n when the tree is balanced and
                  n in the worst case, and production code uses a red-black tree
                  to keep h at log n</b>.
                </p>
                <p>
                  You have already done search and insert by hand in the lab. The
                  hard operation is <strong>delete</strong>. Removing a node
                  leaves a hole in the tree, and the hole has to be filled
                  without breaking the ordering. Split it by how many children
                  the deleted node has:
                </p>
              </>
            }
            zh={
              <>
                <p>
                  为什么全都写 <strong>O(h)</strong> 而不是 O(log n)?
                  因为 h(树高)是个<strong>变量</strong>。和第 7 章一样,
                  树高按<b>边数</b>计:只有根时 h = 0。完全平衡时 h = ⌊log₂n⌋
                  —— 每层能装的节点数是上一层的两倍;顺序插入退化成链时 h = n − 1。
                  不加条件地说 O(log n) 是错的。完整答案是:
                  <b>O(h),平衡时 log n、最坏 n,工程用红黑树把 h 钉在 log n</b>。
                </p>
                <p>
                  查找和插入你已经在实验室亲手做过了。真正的难点是
                  <strong>删除</strong>:挖掉一个节点会在树上留下一个洞,
                  怎么补洞才能不破坏「左小右大」?按被删节点的孩子数量分三种情况:
                </p>
              </>
            }
          />
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-kicker">
              <T en="CASE 1 · a leaf" zh="情况 ① · 叶子" />
            </div>
            <div className="card-title">
              <T en="Just remove it" zh="直接摘掉" />
            </div>
            <MiniTree
              w={260}
              h={196}
              nodes={[
                { id: 0, v: 50, x: 130, y: 30 },
                { id: 1, v: 30, x: 70, y: 96 },
                { id: 2, v: 70, x: 190, y: 96 },
                {
                  id: 3,
                  v: 20,
                  x: 35,
                  y: 165,
                  state: "bad",
                  tag: { en: "delete me", zh: "删我" },
                },
                { id: 4, v: 40, x: 105, y: 165 },
              ]}
              edges={[
                [0, 1],
                [0, 2],
                [1, 3],
                [1, 4],
              ]}
              caption={
                <T
                  en={
                    <>
                      20 has no children, so nothing depends on it. Set the
                      parent pointer that reaches it to null. The rest of the
                      tree is untouched.
                    </>
                  }
                  zh={
                    <>
                      20 没有任何孩子,没人依赖它 ——
                      把父节点指向它的指针置 null 即可,树的其余部分毫发无损。
                    </>
                  }
                />
              }
            />
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="CASE 2 · one child" zh="情况 ② · 单孩子" />
            </div>
            <div className="card-title">
              <T en="The child moves up" zh="孩子顶上" />
            </div>
            <MiniTree
              w={260}
              h={196}
              nodes={[
                { id: 0, v: 50, x: 130, y: 30 },
                { id: 1, v: 30, x: 70, y: 96 },
                {
                  id: 2,
                  v: 70,
                  x: 190,
                  y: 96,
                  state: "bad",
                  tag: { en: "delete me", zh: "删我" },
                },
                {
                  id: 3,
                  v: 80,
                  x: 225,
                  y: 165,
                  state: "ok",
                  tag: { en: "moves up", zh: "顶上" },
                },
              ]}
              edges={[
                [0, 1],
                [0, 2],
                [2, 3],
              ]}
              caption={
                <T
                  en={
                    <>
                      70 has one child, 80. Let the parent, 50, point straight at
                      80, the same move as skipping a node in a linked list.
                      Everything under 80 was already larger than 50, so the
                      ordering still holds.
                    </>
                  }
                  zh={
                    <>
                      70 只有一个孩子 80:让父节点 50 直接接管 80
                      (就像链表里跳过一个节点)。
                      80 那一支本来就全部大于 50,接上来规矩依旧成立。
                    </>
                  }
                />
              }
            />
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="CASE 3 · two children" zh="情况 ③ · 双孩子" />
            </div>
            <div className="card-title">
              <T
                en="Replace it with the in-order successor"
                zh="找替身:中序后继"
              />
            </div>
            <MiniTree
              w={260}
              h={196}
              nodes={[
                {
                  id: 0,
                  v: 50,
                  x: 130,
                  y: 30,
                  state: "bad",
                  tag: { en: "delete me", zh: "删我" },
                },
                { id: 1, v: 30, x: 70, y: 96 },
                { id: 2, v: 70, x: 190, y: 96 },
                { id: 3, v: 20, x: 35, y: 165 },
                { id: 4, v: 40, x: 105, y: 165 },
                {
                  id: 5,
                  v: 60,
                  x: 155,
                  y: 165,
                  state: "ok",
                  tag: { en: "successor", zh: "后继" },
                },
                { id: 6, v: 80, x: 225, y: 165 },
              ]}
              edges={[
                [0, 1],
                [0, 2],
                [1, 3],
                [1, 4],
                [2, 5],
                [2, 6],
              ]}
              caption={
                <T
                  en={
                    <>
                      50 has a subtree on each side, so neither child can simply
                      move up. Take the <b>in-order successor 60</b>, the
                      smallest value in the right subtree: copy 60 into the root,
                      then delete the original 60 from the right subtree.
                    </>
                  }
                  zh={
                    <>
                      50 左右都有子树,哪个孩子都不能直接顶上。找
                      <b>中序后继 60</b>(右子树里最小的):
                      把 60 的值抄给根,再去右子树删掉原来的 60。
                    </>
                  }
                />
              }
            />
          </div>
        </div>
        <div className="prose" style={{ marginTop: 16 }}>
          <T
            en={
              <p>
                Case 3 raises two questions worth answering.{" "}
                <strong>Why can the successor take the place?</strong> The
                in-order successor is the next key above the deleted one, with
                nothing in between. After it moves up, every node on the left is
                still smaller than it (it is larger than the deleted value), and
                every remaining node on the right is still larger than it (it was
                the smallest value there). The ordering holds on both sides, and
                no other key would do.{" "}
                <strong>Why is deleting the successor easy?</strong> The
                successor is the end of a walk left from the right child, so it{" "}
                <strong>has no left child</strong>. Deleting it falls into case 1
                or case 2, and the recursion cannot continue for ever. The
                in-order predecessor (the largest value in the left subtree)
                works the same way, by symmetry.
              </p>
            }
            zh={
              <p>
                情况 ③ 的两个「为什么」值得掰开。
                <strong>为什么后继能当替身?</strong>
                中序后继是「恰好比被删值大的下一个数」,中间再没有别的键。
                它顶上之后,左子树全体仍比它小(它比被删值还大),
                右子树剩余全体仍比它大(它本来就是右子树里最小的)——
                两边的顺序都不破,换成别的键就做不到。
                <strong>为什么删后继很容易?</strong>
                后继 = 从右孩子一路向左的尽头,它<strong>必然没有左孩子</strong>,
                删它必落入情况 ① 或 ②,递归不会没完没了。
                对称地,用中序前驱(左子树最大值)也完全可行。
              </p>
            }
          />
        </div>
        <Callout
          tone="idea"
          title={{
            en: "Delete in one line",
            zh: "一句话记住删除",
          }}
        >
          <T
            en={
              <p>
                A leaf is removed; a node with one child is replaced by that
                child; a node with two children{" "}
                <b>takes the successor&apos;s value, and the delete moves into
                the right subtree</b>. That turns &quot;remove a node in the
                middle&quot; into &quot;remove a node at the edge&quot;. Total
                cost: locate, find the successor, delete again — all of it walks
                downwards along one path, so <b>O(h)</b>.
              </p>
            }
            zh={
              <p>
                叶子直接删;单孩子让孩子顶;双孩子<b>值换后继、删除转到右子树</b>
                —— 把「删中间的节点」降级成「删边缘的节点」。
                总代价:定位 + 找后继 + 再删一次,
                全程走的还是一条向下的路径,<b>O(h)</b>。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §04 手写实现 ================= */}
      <Section
        id="impl"
        index="04"
        title={{
          en: "Writing one: a complete BST in about 60 lines",
          zh: "手写实现:60 行,一棵完整的 BST",
        }}
        desc={{
          en: "insert / search / delete / inorder — all three delete cases included, and it runs",
          zh: "insert / search / delete / inorder —— delete 三情况完整实现,能直接跑",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                The node is the TreeNode from the binary tree chapter: a value
                plus a pointer to each child. Of the four methods, insert and
                delete are written recursively, and both{" "}
                <strong>return the root of the repaired subtree</strong> so the
                caller can reattach it. This pattern — return yourself so the
                parent links to you again — is the standard way to modify a tree
                by recursion, and it avoids having to track parent pointers.
              </p>
            }
            zh={
              <p>
                节点还是二叉树章的 TreeNode(值 + 左右孩子指针)。四个方法里,
                insert 和 delete 用递归写:注意它们都
                <strong>返回「修补后的子树根」</strong>,由上一层接住 ——
                这个「返回自己让父节点重新牵手」的模式,
                是递归改树的标准做法,好处是不需要专门记录父节点。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="bst"
          java={{
            code: {
              en: `class TreeNode {                        // the node from the binary tree chapter
    int val;
    TreeNode left, right;
    TreeNode(int v) { val = v; }
}

class BST {
    TreeNode root;                       // keep the root; every operation starts here

    // search: one comparison per level, O(h)
    public boolean search(int v) {
        TreeNode cur = root;
        while (cur != null) {
            if (v == cur.val) return true;
            cur = v < cur.val ? cur.left : cur.right; // smaller left, larger right
        }
        return false;                    // reached an empty slot: nowhere in the tree
    }

    // insert: follow the search path to an empty slot, O(h)
    public void insert(int v) {
        root = insertAt(root, v);
    }
    private TreeNode insertAt(TreeNode node, int v) {
        if (node == null) return new TreeNode(v); // the empty slot is the new home
        if (v < node.val)      node.left  = insertAt(node.left, v);
        else if (v > node.val) node.right = insertAt(node.right, v);
        return node;                     // equal = already there; return self to relink
    }

    // delete: three cases, O(h)
    public void delete(int v) {
        root = deleteAt(root, v);
    }
    private TreeNode deleteAt(TreeNode node, int v) {
        if (node == null) return null;             // not found, return unchanged
        if (v < node.val) {                        // the target is on the left
            node.left = deleteAt(node.left, v);
            return node;
        }
        if (v > node.val) {                        // the target is on the right
            node.right = deleteAt(node.right, v);
            return node;
        }
        // found it -- three cases
        if (node.left == null) return node.right;  // 1 no child (null) / 2 only a right child
        if (node.right == null) return node.left;  // 2 only a left child
        TreeNode succ = node.right;                // 3 two children: the in-order successor
        while (succ.left != null) succ = succ.left;//   = leftmost node of the right subtree
        node.val = succ.val;                       // copy the successor value up
        node.right = deleteAt(node.right, succ.val); // delete it there (it has no left child)
        return node;
    }

    // in-order: left, node, right. The output is sorted. O(n)
    public void inorder(TreeNode node, List<Integer> out) {
        if (node == null) return;
        inorder(node.left, out);
        out.add(node.val);
        inorder(node.right, out);
    }
}`,
              zh: `class TreeNode {                        // 二叉树章的老朋友
    int val;
    TreeNode left, right;
    TreeNode(int v) { val = v; }
}

class BST {
    TreeNode root;                       // 记住根,所有操作都从这里出发

    // 查找:每层比较一次,O(h)
    public boolean search(int v) {
        TreeNode cur = root;
        while (cur != null) {
            if (v == cur.val) return true;
            cur = v < cur.val ? cur.left : cur.right; // 小往左,大往右
        }
        return false;                    // 走到空位:整棵树都不可能有
    }

    // 插入:沿查找路线走到空位安家,O(h)
    public void insert(int v) {
        root = insertAt(root, v);
    }
    private TreeNode insertAt(TreeNode node, int v) {
        if (node == null) return new TreeNode(v); // 空位就是新家
        if (v < node.val)      node.left  = insertAt(node.left, v);
        else if (v > node.val) node.right = insertAt(node.right, v);
        return node;                     // 相等 = 已存在,不动;返回自己重连
    }

    // 删除:三种情况,O(h)
    public void delete(int v) {
        root = deleteAt(root, v);
    }
    private TreeNode deleteAt(TreeNode node, int v) {
        if (node == null) return null;             // 没找到,原样返回
        if (v < node.val) {                        // 目标在左边
            node.left = deleteAt(node.left, v);
            return node;
        }
        if (v > node.val) {                        // 目标在右边
            node.right = deleteAt(node.right, v);
            return node;
        }
        // 找到了 —— 分三种情况
        if (node.left == null) return node.right;  // ① 没有孩子(null)/ ② 只有右孩子
        if (node.right == null) return node.left;  // ② 只有左孩子
        TreeNode succ = node.right;                // ③ 双孩子:找中序后继
        while (succ.left != null) succ = succ.left;//   = 右子树一路向左到底
        node.val = succ.val;                       // 值换后继
        node.right = deleteAt(node.right, succ.val); // 到右子树删它(它必无左孩子)
        return node;
    }

    // 中序遍历:左 → 根 → 右,输出必然升序,O(n)
    public void inorder(TreeNode node, List<Integer> out) {
        if (node == null) return;
        inorder(node.left, out);
        out.add(node.val);
        inorder(node.right, out);
    }
}`,
            },
            hl: [46, 47, 48, 49, 50, 51],
            note: {
              en: (
                <>
                  <b>Detail:</b> in deleteAt the leaf case is folded into
                  &quot;only a right child&quot;. A leaf has right == null, so
                  returning node.right returns null, which is exactly what the
                  leaf case needs. Two lines cover three cases.
                </>
              ),
              zh: (
                <>
                  <b>细节:</b>deleteAt 里「叶子」被并进了「只有右孩子」——
                  叶子的 right 是 null,返回它正好等于返回 null。
                  两行代码盖住三种情况。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class TreeNode:                        # the node from the binary tree chapter
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None               # keep the root; everything starts here

    # search: one comparison per level, O(h)
    def search(self, v: int) -> bool:
        cur = self.root
        while cur:
            if v == cur.val:
                return True
            cur = cur.left if v < cur.val else cur.right  # smaller left, larger right
        return False                   # reached None: nowhere in the tree

    # insert: follow the search path to an empty slot, O(h)
    def insert(self, v: int) -> None:
        def insert_at(node):
            if node is None:
                return TreeNode(v)     # the empty slot is the new home
            if v < node.val:
                node.left = insert_at(node.left)
            elif v > node.val:
                node.right = insert_at(node.right)
            return node                # return self so the parent relinks
        self.root = insert_at(self.root)

    # delete: three cases, O(h)
    def delete(self, v: int) -> None:
        def delete_at(node, v):
            if node is None:
                return None            # not found, return unchanged
            if v < node.val:
                node.left = delete_at(node.left, v)
                return node
            if v > node.val:
                node.right = delete_at(node.right, v)
                return node
            # found it -- three cases
            if node.left is None:
                return node.right      # 1 no child / 2 only a right child
            if node.right is None:
                return node.left       # 2 only a left child
            succ = node.right          # 3 two children: the in-order successor
            while succ.left:           #   = leftmost node of the right subtree
                succ = succ.left
            node.val = succ.val        # copy the successor value up
            node.right = delete_at(node.right, succ.val)  # delete it there
            return node
        self.root = delete_at(self.root, v)

    # in-order: left, node, right. The output is sorted. O(n)
    def inorder(self) -> list[int]:
        out = []
        def walk(node):
            if node is None:
                return
            walk(node.left)
            out.append(node.val)
            walk(node.right)
        walk(self.root)
        return out`,
              zh: `class TreeNode:                        # 二叉树章的老朋友
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None               # 记住根,所有操作都从这里出发

    # 查找:每层比较一次,O(h)
    def search(self, v: int) -> bool:
        cur = self.root
        while cur:
            if v == cur.val:
                return True
            cur = cur.left if v < cur.val else cur.right  # 小往左,大往右
        return False                   # 走到 None:整棵树都不可能有

    # 插入:沿查找路线走到空位安家,O(h)
    def insert(self, v: int) -> None:
        def insert_at(node):
            if node is None:
                return TreeNode(v)     # 空位就是新家
            if v < node.val:
                node.left = insert_at(node.left)
            elif v > node.val:
                node.right = insert_at(node.right)
            return node                # 返回自己让父节点重连
        self.root = insert_at(self.root)

    # 删除:三种情况,O(h)
    def delete(self, v: int) -> None:
        def delete_at(node, v):
            if node is None:
                return None            # 没找到,原样返回
            if v < node.val:
                node.left = delete_at(node.left, v)
                return node
            if v > node.val:
                node.right = delete_at(node.right, v)
                return node
            # 找到了 —— 三种情况
            if node.left is None:
                return node.right      # ① 没有孩子 / ② 只有右孩子
            if node.right is None:
                return node.left       # ② 只有左孩子
            succ = node.right          # ③ 双孩子:找中序后继
            while succ.left:           #   = 右子树一路向左到底
                succ = succ.left
            node.val = succ.val        # 值换后继
            node.right = delete_at(node.right, succ.val)  # 到右子树删它
            return node
        self.root = delete_at(self.root, v)

    # 中序遍历:左 → 根 → 右,输出必然升序,O(n)
    def inorder(self) -> list[int]:
        out = []
        def walk(node):
            if node is None:
                return
            walk(node.left)
            out.append(node.val)
            walk(node.right)
        walk(self.root)
        return out`,
            },
            hl: [44, 45, 46, 47, 48, 49, 50, 51, 52],
            note: {
              en: (
                <>
                  <b>Common mistake:</b> the default recursion limit in CPython
                  is about 1000. On a BST that has degenerated into a chain, a
                  recursive search can exceed it. When the tree may be deep,
                  write search and insert iteratively. delete is easier to keep
                  recursive, because it has to relink parent and child.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>CPython 默认递归深度限制约 1000 ——
                  退化成链的 BST 上,递归查找可能超限。树可能很深时,
                  search / insert 写成迭代更稳;delete 因为要修补父子链,
                  递归写法最顺手。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `class TreeNode {                       // the node from the binary tree chapter
  constructor(val = 0) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;                  // keep the root; everything starts here
  }

  // search: one comparison per level, O(h)
  search(v) {
    let cur = this.root;
    while (cur) {
      if (v === cur.val) return true;
      cur = v < cur.val ? cur.left : cur.right; // smaller left, larger right
    }
    return false;                      // reached null: nowhere in the tree
  }

  // insert: follow the search path to an empty slot, O(h)
  insert(v) {
    const insertAt = (node) => {
      if (!node) return new TreeNode(v);      // the empty slot is the new home
      if (v < node.val) node.left = insertAt(node.left);
      else if (v > node.val) node.right = insertAt(node.right);
      return node;                     // return self so the parent relinks
    };
    this.root = insertAt(this.root);
  }

  // delete: three cases, O(h)
  delete(v) {
    const deleteAt = (node, v) => {
      if (!node) return null;                  // not found, return unchanged
      if (v < node.val) {
        node.left = deleteAt(node.left, v);
        return node;
      }
      if (v > node.val) {
        node.right = deleteAt(node.right, v);
        return node;
      }
      // found it -- three cases
      if (!node.left) return node.right;       // 1 no child / 2 only a right child
      if (!node.right) return node.left;       // 2 only a left child
      let succ = node.right;                   // 3 two children: in-order successor
      while (succ.left) succ = succ.left;      // = leftmost node of the right subtree
      node.val = succ.val;                     // copy the successor value up
      node.right = deleteAt(node.right, succ.val); // delete it there
      return node;
    };
    this.root = deleteAt(this.root, v);
  }

  // in-order: left, node, right. The output is sorted. O(n)
  inorder() {
    const out = [];
    const walk = (node) => {
      if (!node) return;
      walk(node.left);
      out.push(node.val);
      walk(node.right);
    };
    walk(this.root);
    return out;
  }
}`,
              zh: `class TreeNode {                       // 二叉树章的老朋友
  constructor(val = 0) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;                  // 记住根,所有操作都从这里出发
  }

  // 查找:每层比较一次,O(h)
  search(v) {
    let cur = this.root;
    while (cur) {
      if (v === cur.val) return true;
      cur = v < cur.val ? cur.left : cur.right; // 小往左,大往右
    }
    return false;                      // 走到 null:整棵树都不可能有
  }

  // 插入:沿查找路线走到空位安家,O(h)
  insert(v) {
    const insertAt = (node) => {
      if (!node) return new TreeNode(v);      // 空位就是新家
      if (v < node.val) node.left = insertAt(node.left);
      else if (v > node.val) node.right = insertAt(node.right);
      return node;                     // 返回自己让父节点重连
    };
    this.root = insertAt(this.root);
  }

  // 删除:三种情况,O(h)
  delete(v) {
    const deleteAt = (node, v) => {
      if (!node) return null;                  // 没找到,原样返回
      if (v < node.val) {
        node.left = deleteAt(node.left, v);
        return node;
      }
      if (v > node.val) {
        node.right = deleteAt(node.right, v);
        return node;
      }
      // 找到了 —— 三种情况
      if (!node.left) return node.right;       // ① 没有孩子 / ② 只有右孩子
      if (!node.right) return node.left;       // ② 只有左孩子
      let succ = node.right;                   // ③ 双孩子:找中序后继
      while (succ.left) succ = succ.left;      // = 右子树一路向左到底
      node.val = succ.val;                     // 值换后继
      node.right = deleteAt(node.right, succ.val); // 到右子树删它
      return node;
    };
    this.root = deleteAt(this.root, v);
  }

  // 中序遍历:左 → 根 → 右,输出必然升序,O(n)
  inorder() {
    const out = [];
    const walk = (node) => {
      if (!node) return;
      walk(node.left);
      out.push(node.val);
      walk(node.right);
    };
    walk(this.root);
    return out;
  }
}`,
            },
            hl: [48, 49, 50, 51, 52, 53],
            note: {
              en: (
                <>
                  <b>Reminder:</b> compare with <code>===</code>. If the values
                  are strings, <code>&lt;</code> compares them
                  lexicographically, so convert first when you mean numeric
                  order, or pass a comparison function into the constructor, as a
                  real library does.
                </>
              ),
              zh: (
                <>
                  <b>提醒:</b>比较用 <code>===</code>;若存的是字符串,
                  <code>&lt;</code> 会按字典序比较 —— 想按数值比记得先转换,
                  或者把比较函数抽出来作为构造参数(工程写法)。
                </>
              ),
            },
          }}
        />
      </Section>

      {/* ================= §05 平衡的世界 ================= */}
      <Section
        id="balance"
        index="05"
        title={{
          en: "Balanced trees: AVL, red-black, and what each language gives you",
          zh: "平衡的世界:AVL、红黑树与工程对照",
        }}
        desc={{
          en: "A concept section. You are not asked to implement these, but you should be able to say why they exist and which one to use.",
          zh: "概念课,不要求手写 —— 但要能讲出「为什么」和「用什么」",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                The lab in §02 showed it already:{" "}
                <strong>sorted input grows a BST into a chain</strong>. Real data
                is often sorted: log records written by timestamp, rows inserted
                by auto-increment id, word lists imported alphabetically. A plain
                BST will almost certainly degenerate in production. The idea
                behind the fix is direct: after an insert or a delete, if some
                part of the tree has become too deep on one side,{" "}
                <strong>rotate</strong> it back. Balanced trees differ only in how
                they define &quot;too deep&quot; and how far they let it go
                before acting.
              </p>
            }
            zh={
              <p>
                §02 的实验室已经演示过:
                <strong>有序输入会把 BST 养成一条链</strong>。
                而现实数据偏偏经常有序 —— 按时间戳写入日志、按自增 id 插入记录、
                按字母序导入词表…… 裸 BST 在生产环境几乎必然退化。
                解法的思路很直接:插入删除后,如果某处一边太深,就
                <strong>旋转</strong>把它扶正。不同的平衡树,
                区别只在「怎么定义太深」和「歪到什么程度才动手」。
              </p>
            }
          />
        </div>

        <div className="sec-head" style={{ marginTop: 30 }}>
          <span className="sec-index">05·A</span>
          <h3 className="sec-title" style={{ fontSize: 19 }}>
            <T
              en="AVL tree: no imbalance allowed"
              zh="AVL 树:一点都不许歪"
            />
          </h3>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                AVL (1962, named after its inventors Adelson-Velsky and Landis)
                gives every node a{" "}
                <strong>balance factor: the height of the left subtree minus the
                height of the right subtree</strong>. It requires that factor to
                stay in {"{-1, 0, 1}"} for every node. As soon as an insert
                pushes some node to |BF| = 2, a rotation repairs it. Here is the
                smallest example, inserting 3, 2, 1 in that order:
              </p>
            }
            zh={
              <p>
                AVL(1962,以发明者 Adelson-Velsky 和 Landis 命名)给每个节点定义
                <strong>平衡因子(balance factor)= 左子树高 − 右子树高</strong>,
                并要求任何节点的平衡因子 ∈ {"{-1, 0, 1}"}。一旦插入让某个节点的
                |BF| 达到 2,立刻旋转修复。看最小的例子 —— 依次插入 3、2、1:
              </p>
            }
          />
        </div>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <div className="card">
            <div className="card-kicker">
              <T en="BEFORE · after inserting 1" zh="BEFORE · 插入 1 之后" />
            </div>
            <MiniTree
              w={260}
              h={210}
              nodes={[
                {
                  id: 0,
                  v: 3,
                  x: 170,
                  y: 34,
                  state: "bad",
                  tag: { en: "BF = +2, too far", zh: "BF = +2,歪了" },
                },
                { id: 1, v: 2, x: 110, y: 104, state: "lit", tag: "BF = +1" },
                { id: 2, v: 1, x: 50, y: 174, tag: "BF = 0" },
              ]}
              edges={[
                [0, 1],
                [1, 2],
              ]}
              caption={
                <T
                  en={
                    <>
                      The left subtree of 3 has height 1, and its right subtree
                      is empty, which counts as −1. So BF = 1 − (−1) = +2, over
                      the limit. The shape is &quot;left-left&quot;, and the
                      repair is a <b>right rotation</b>.
                    </>
                  }
                  zh={
                    <>
                      3 的左子树高 1(按边数),右子树为空、记作 −1:
                      BF = 1 − (−1) = +2,超标。
                      失衡形状是「左左」—— 解法:<b>右旋</b>。
                    </>
                  }
                />
              }
            />
          </div>
          <div className="card">
            <div className="card-kicker">
              <T
                en="AFTER · one right rotation at 3"
                zh="AFTER · 对 3 右旋一次"
              />
            </div>
            <MiniTree
              w={260}
              h={210}
              nodes={[
                {
                  id: 0,
                  v: 2,
                  x: 130,
                  y: 34,
                  state: "ok",
                  tag: { en: "BF = 0, fixed", zh: "BF = 0,正了" },
                },
                { id: 1, v: 1, x: 70, y: 118, tag: "BF = 0" },
                { id: 2, v: 3, x: 190, y: 118, tag: "BF = 0" },
              ]}
              edges={[
                [0, 1],
                [0, 2],
              ]}
              caption={
                <T
                  en={
                    <>
                      A right rotation makes the left child, 2, the new root, and
                      3 becomes its right child. The in-order sequence is still
                      1, 2, 3: <b>a rotation changes the shape, not the
                      order</b>, which is why it is allowed at all.
                    </>
                  }
                  zh={
                    <>
                      右旋 = 让左孩子 2 当新根,3 降级成它的右孩子。
                      转完中序还是 1, 2, 3 —— <b>旋转改形状,不改顺序</b>,
                      这是它合法的根本原因。
                    </>
                  }
                />
              }
            />
          </div>
        </div>
        <div className="prose" style={{ marginTop: 14 }}>
          <T
            en={
              <p>
                A real AVL also handles the &quot;left-right&quot; and
                &quot;right-left&quot; shapes, which need two rotations. The idea
                is the same:{" "}
                <strong>bring the middle of the three values up to be the
                root</strong>. AVL is the strict option. Its height stays close
                to log n, so lookups are as fast as they can be. The price is
                paid on writes.
              </p>
            }
            zh={
              <p>
                真实的 AVL 还有「左右 / 右左」等组合形状,需要两次旋转,
                思路相同:<strong>把三个值里居中的那个转上来当根</strong>。
                AVL 是严格的那一派 —— 高度始终贴近 log n,查找最快;
                代价落在写入上。
              </p>
            }
          />
        </div>

        <div className="sec-head" style={{ marginTop: 34 }}>
          <span className="sec-index">05·B</span>
          <h3 className="sec-title" style={{ fontSize: 19 }}>
            <T
              en="Red-black tree: balanced enough, not perfect"
              zh="红黑树:不追求完美,只追求够用"
            />
          </h3>
        </div>
        <div className="prose">
          <T
            en={
              <>
                <p>
                  A red-black tree takes a different route. Instead of watching
                  the height difference, it gives each node a color and keeps
                  five rules:
                </p>
                <ul>
                  <li>1. Every node is either red or black.</li>
                  <li>2. The root is black.</li>
                  <li>3. Empty positions (the null children) count as black.</li>
                  <li>
                    4. The children of a red node must be black, so{" "}
                    <b>two reds can never be adjacent</b>.
                  </li>
                  <li>
                    5. From any node, every path down to an empty position
                    contains <b>the same number of black nodes</b>.
                  </li>
                </ul>
                <p>
                  Together these give a neat result. The longest path can only
                  alternate red and black, the shortest path can be all black,
                  and both contain the same number of black nodes by rule 5.
                  Therefore{" "}
                  <strong>the longest path is at most twice the shortest</strong>
                  , and the height stays in O(log n). The tree is allowed to be
                  somewhat uneven, and in exchange each update needs only a small
                  fixed number of rotations: at most 2 for an insert and at most
                  3 for a delete. An AVL insert also needs at most one rotation,
                  but an AVL <b>delete</b> may have to rebalance at every level
                  on the way back to the root.{" "}
                  <strong>Not perfectly balanced, just balanced enough</strong> —
                  that is an engineering trade-off, and it is why the red-black
                  tree ended up in the standard libraries. Use AVL when reads
                  dominate; use red-black when reads and writes are mixed.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  红黑树换了个思路:不盯着高度差,而是给节点涂色并立五条规矩:
                </p>
                <ul>
                  <li>① 每个节点非红即黑;</li>
                  <li>② 根节点是黑的;</li>
                  <li>③ 空位置(null 孩子)视为黑;</li>
                  <li>④ 红节点的孩子必须是黑 —— <b>不许出现连续两个红</b>;</li>
                  <li>
                    ⑤ 从任一节点出发,到它下面每个空位置的路径上,
                    <b>黑节点数量相同</b>。
                  </li>
                </ul>
                <p>
                  这五条合起来推出一个漂亮的结论:最长路径最多「黑红相间」,
                  最短路径可以「全黑」,而两者黑节点数相同(规矩 ⑤)——
                  所以<strong>最长路径 ≤ 最短路径 × 2</strong>,
                  高度被锁死在 O(log n) 量级。它允许树有点歪,
                  换来的是每次更新只需常数次旋转:插入最多 2 次,删除最多 3 次。
                  AVL 的插入同样最多一次旋转,但 AVL 的<b>删除</b>
                  可能一路回溯到根、每层都要调整。
                  <strong>不追求完美平衡,只追求足够平衡</strong> ——
                  这是典型的工程取舍,也是它进入各家标准库的原因。
                  读多写少选 AVL,读写混合选红黑树。
                </p>
              </>
            }
          />
        </div>
        <Callout
          tone="story"
          title={{
            en: "Why red and black?",
            zh: "为什么偏偏是「红黑」?",
          }}
        >
          <T
            en={
              <p>
                Guibas and Sedgewick published the structure in 1978 at Xerox
                PARC. Sedgewick has said the colors came from the lab printer:
                it could print <b>red and black</b>, and red made the special
                nodes easiest to pick out in the paper. The ink available in one
                machine set the color scheme of textbooks for the next fifty
                years.
              </p>
            }
            zh={
              <p>
                1978 年 Guibas 和 Sedgewick 在施乐帕克研究中心发表了这套结构。
                据 Sedgewick 本人回忆,颜色来自实验室的打印机:
                它能印<b>红、黑</b>两色,论文里用红色标注特殊节点最醒目,
                名字就这么定了。一台打印机的墨,
                决定了此后五十年教科书的配色。
              </p>
            }
          />
        </Callout>

        <div className="sec-head" style={{ marginTop: 34 }}>
          <span className="sec-index">05·C</span>
          <h3 className="sec-title" style={{ fontSize: 19 }}>
            <T
              en="In practice: ordered containers in three languages"
              zh="工程对照:三语言里的「有序容器」"
            />
          </h3>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                One question decides whether you want a tree at all:{" "}
                <strong>do you need order?</strong> For a plain lookup — is this
                key present, what is its value — a hash table wins, because it is
                O(1) on average and a tree is O(log n). You choose a balanced BST
                when the requirement mentions{" "}
                <strong>range queries, the nearest key above or below a value,
                or iterating in key order</strong>. A hash table cannot answer
                any of those without reading everything and sorting it.
              </p>
            }
            zh={
              <p>
                要不要用树,只由一个问题决定:<strong>需不需要顺序?</strong>
                只做单点查找(这个 key 在不在、对应值是什么),哈希表更快 ——
                均摊 O(1) 对树的 O(log n)。
                只有当需求里出现<strong>范围查询、找某个值上下最近的 key、
                按 key 顺序遍历</strong>时,才该选平衡 BST ——
                这几件事哈希表都做不到,除非把全部数据取出来重新排序。
              </p>
            }
          />
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Language" zh="语言" />
                </th>
                <th>
                  <T en="Ordered container" zh="有序容器" />
                </th>
                <th>
                  <T en="What it really is" zh="底层" />
                </th>
                <th>
                  <T en="When to use it" zh="什么时候用它" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>Java</b>
                </td>
                <td>
                  <code>TreeMap</code> / <code>TreeSet</code>
                </td>
                <td>
                  <T en="Red-black tree" zh="红黑树" />
                </td>
                <td>
                  <T
                    en={
                      <>
                        Ordered iteration, <code>floorKey</code> /{" "}
                        <code>ceilingKey</code> (nearest key), and{" "}
                        <code>subMap</code> range queries
                      </>
                    }
                    zh={
                      <>
                        有序遍历、<code>floorKey</code> / <code>ceilingKey</code>
                        (最近邻)、<code>subMap</code> 范围查询
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>Python</b>
                </td>
                <td>
                  <T
                    en={
                      <>
                        None built in (third-party <code>sortedcontainers</code>)
                      </>
                    }
                    zh={
                      <>
                        无内置(第三方 <code>sortedcontainers</code>)
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en="A list of short sorted blocks, not a tree"
                    zh="分块有序列表,不是树"
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <code>SortedList</code> / <code>SortedDict</code>,
                        already installed in the LeetCode environment
                      </>
                    }
                    zh={
                      <>
                        <code>SortedList</code> / <code>SortedDict</code>,
                        LeetCode 环境已预装
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>JavaScript</b>
                </td>
                <td>
                  <T en="None built in" zh="无内置" />
                </td>
                <td>—</td>
                <td>
                  <T
                    en={
                      <>
                        <code>Map</code> only keeps insertion order. Use a sorted
                        array with binary search, or write the tree yourself
                      </>
                    }
                    zh={
                      <>
                        <code>Map</code> 只保留插入顺序;
                        刷题用「数组 + 二分」顶替,或者自己手写一棵树
                      </>
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <CodeTabs
          title="ordered_map"
          java={{
            code: {
              en: `// TreeMap: an ordered map backed by a red-black tree. All updates are O(log n).
TreeMap<Integer, String> map = new TreeMap<>();
map.put(30, "c");
map.put(10, "a");
map.put(20, "b");

map.firstKey();        // 10 -- smallest key
map.lastKey();         // 30 -- largest key
map.floorKey(25);      // 20 -- largest key <= 25
map.ceilingKey(25);    // 30 -- smallest key >= 25

// Iteration is in ascending key order. No sorting step.
for (var e : map.entrySet())
    System.out.println(e.getKey());   // 10, 20, 30

// Range query: every entry in [10, 25), O(log n + k)
map.subMap(10, 25);

// Ordered set without values: TreeSet (a TreeMap underneath)
TreeSet<Integer> set = new TreeSet<>(List.of(5, 1, 3));
set.first();           // 1`,
              zh: `// TreeMap:底层是红黑树的有序映射,增删改查都是 O(log n)
TreeMap<Integer, String> map = new TreeMap<>();
map.put(30, "c");
map.put(10, "a");
map.put(20, "b");

map.firstKey();        // 10 —— 最小 key
map.lastKey();         // 30 —— 最大 key
map.floorKey(25);      // 20 —— ≤ 25 的最大 key(地板)
map.ceilingKey(25);    // 30 —— ≥ 25 的最小 key(天花板)

// 遍历天然按 key 升序,不需要额外排序
for (var e : map.entrySet())
    System.out.println(e.getKey());   // 10, 20, 30

// 范围查询:[10, 25) 内的所有条目,O(log n + k)
map.subMap(10, 25);

// 只要有序集合不要值:TreeSet(底层就是 TreeMap)
TreeSet<Integer> set = new TreeSet<>(List.of(5, 1, 3));
set.first();           // 1`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> the keys of a TreeMap must be
                  comparable, either by implementing Comparable or through a
                  Comparator passed to the constructor. Putting a
                  non-comparable object in throws ClassCastException at runtime.
                  HashMap never surfaces this problem, because it only hashes.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>TreeMap 的 key 必须可比较(实现 Comparable
                  或传入 Comparator),塞进不可比较的对象会在运行时抛
                  ClassCastException —— HashMap 只做哈希,不会暴露这个问题。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `# The Python standard library has no balanced BST. Two options:

# 1. sortedcontainers (already installed on LeetCode; fine to name in an interview)
from sortedcontainers import SortedList, SortedDict

sl = SortedList([30, 10, 20])   # always kept sorted: [10, 20, 30]
sl.add(25)                      # insert, still sorted -> [10, 20, 25, 30]
sl[0], sl[-1]                   # 10, 30 -- smallest / largest
sl.bisect_left(25)              # 2 -- position, for slicing out a range
sl.irange(10, 25)               # [10, 20, 25] -- iterate over a range

sd = SortedDict({30: "c", 10: "a"})
list(sd.keys())                 # [10, 30] -- iteration is in key order

# 2. Read-mostly data: the bisect module with a plain list
import bisect
arr = [10, 20, 30]
bisect.bisect_left(arr, 25)     # search O(log n)
bisect.insort(arr, 25)          # insert O(n) -- a list is still an array`,
              zh: `# Python 标准库没有平衡 BST,两条路:

# ① sortedcontainers(LeetCode 已内置,面试可以直接说用它)
from sortedcontainers import SortedList, SortedDict

sl = SortedList([30, 10, 20])   # 始终保持有序:[10, 20, 30]
sl.add(25)                      # 插入后依然有序 -> [10, 20, 25, 30]
sl[0], sl[-1]                   # 10, 30 —— 最小 / 最大
sl.bisect_left(25)              # 2 —— 定位,配合切片做范围查询
sl.irange(10, 25)               # [10, 20, 25] —— 区间迭代

sd = SortedDict({30: "c", 10: "a"})
list(sd.keys())                 # [10, 30] —— 遍历天然按 key 升序

# ② 只读为主的场景:bisect 模块 + 普通 list
import bisect
arr = [10, 20, 30]
bisect.bisect_left(arr, 25)     # 查找 O(log n)
bisect.insort(arr, 25)          # 插入 O(n) —— list 底层还是数组`,
            },
            note: {
              en: (
                <>
                  <b>Be precise about this one:</b> <code>bisect.insort</code>{" "}
                  searches quickly but still inserts in O(n), because a list is a
                  dynamic array (chapter 1). <code>SortedList</code> is much
                  faster on writes because it stores the values in many short
                  blocks, so an insert only shifts one short block. It is{" "}
                  <b>not</b> a balanced tree, and its insert is not O(log n) in
                  theory, but for interview and contest workloads it is the
                  practical choice.
                </>
              ),
              zh: (
                <>
                  <b>这一点要说准:</b><code>bisect.insort</code>{" "}
                  查得快,但插入仍是 O(n) —— list 是动态数组(第 1 章的老账)。
                  <code>SortedList</code> 写入快得多,是因为它把值分散在许多小块里,
                  插入只搬动其中一小块;但它<b>不是</b>平衡树,
                  插入在理论上也不是 O(log n),只是在刷题和一般业务负载下够快、够省事。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// JavaScript has no built-in ordered map.
// Note: Map iterates in insertion order, not in key order.
const m = new Map();
m.set(30, "c"); m.set(10, "a");
[...m.keys()];              // [30, 10] -- not sorted

// Common stand-in when solving problems: an array kept sorted with binary search
const arr = [10, 20, 30];
function lowerBound(a, x) {       // index of the first element >= x
  let lo = 0, hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
arr.splice(lowerBound(arr, 25), 0, 25);  // sorted insert, O(n) to shift

// In production: use a third-party library when you need a real ordered
// container, or reuse the interview version and write the tree (§04)`,
              zh: `// JavaScript 没有内置有序映射。
// 注意:Map 按插入顺序遍历,不是按 key 排序。
const m = new Map();
m.set(30, "c"); m.set(10, "a");
[...m.keys()];              // [30, 10] —— 不会自动排序

// 刷题常用替身:用二分维护一个有序数组
const arr = [10, 20, 30];
function lowerBound(a, x) {       // 第一个 >= x 的下标
  let lo = 0, hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
arr.splice(lowerBound(arr, 25), 0, 25);  // 有序插入,搬移 O(n)

// 工程上:需要真正的有序容器就找第三方库,
// 或者复用面试写法 —— 自己实现一棵树(§04)`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> the key order of a plain object follows
                  its own rules (integer-like keys ascending, string keys in
                  insertion order). Never rely on it as an ordered container. If
                  you need order, sort explicitly or maintain it with binary
                  search.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>普通对象的键遍历顺序有一套自己的规则
                  (整数型键升序、字符串键按插入顺序),千万别拿它当有序容器 ——
                  需要有序就显式排序,或者用二分维护。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "In production: why do database indexes use a B+ tree instead of a red-black tree?",
            zh: "工程现场:数据库索引为什么用 B+ 树,不用红黑树?",
          }}
        >
          <T
            en={
              <p>
                The index in MySQL (InnoDB) is a B+ tree. It is also an ordered
                tree, so why not the red-black tree that wins in memory? Because
                the setting is different. The data lives on <b>disk</b>, and disk
                is read one page at a time, usually 16KB, so reading 1 byte costs
                almost the same as reading 16KB. A red-black tree stores one key
                per node and has height about log₂n, so for a million rows one
                lookup walks a path of roughly 20 nodes, which means up to 20
                disk reads. A
                B+ tree instead fills each node with{" "}
                <b>a whole page of several hundred keys</b>. With a few hundred
                children per node, a million rows fit in 3 or 4 levels:{" "}
                <b>a short, wide tree means very few reads</b>. A B+ tree also
                keeps all the data in the leaf level and links the leaves
                together, so a range scan (<code>WHERE id BETWEEN …</code>)
                follows that list instead of jumping around the tree. In one
                sentence:{" "}
                <b>the red-black tree is designed for random access in memory,
                the B+ tree for page-sized reads from disk</b>. Structures are
                not better or worse; they fit a particular medium.
              </p>
            }
            zh={
              <p>
                MySQL(InnoDB)的索引是 B+ 树 —— 同样是有序树,
                为什么不用内存里更快的红黑树?因为场景变了:数据在<b>磁盘</b>上,
                而磁盘按「页」(通常 16KB)整块读取,读 1 字节和读 16KB 代价几乎一样。
                红黑树一个节点存一个 key,树高约 log₂n
                (百万数据一次查询要走约 20 个节点),意味着最多 20 次磁盘读取。
                B+ 树则让一个节点装满
                <b>一整页的几百个 key</b>,分叉数几百,百万数据只需 3~4 层 ——
                <b>矮胖的树 = 极少的读取次数</b>。此外 B+ 树把数据全放叶子层、
                叶子之间用链表串起来:范围扫描(<code>WHERE id BETWEEN …</code>)
                沿链表顺序读就行,不用在树上跳来跳去。一句话:
                <b>红黑树为内存的随机访问而生,B+ 树为磁盘的按页读取而生</b> ——
                结构没有优劣,只有适不适合当前的介质。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §06 套路与精讲 ================= */}
      <Section
        id="patterns"
        index="06"
        title={{
          en: "Patterns and walkthroughs: one key opens most BST questions",
          zh: "套路与精讲:BST 题的一把总钥匙",
        }}
        desc={{
          en: "When you see a BST, say it to yourself: in-order is sorted, and one comparison drops one subtree. Three problems, frame by frame.",
          zh: "见到 BST,先默念:中序 = 升序,一次比较扔掉一棵子树 —— 三道代表题逐帧拆解",
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
                Most BST problems fall into three patterns. First,{" "}
                <strong>use in-order = sorted</strong> (k-th smallest, minimum
                difference, validation, recovery). Second,{" "}
                <strong>use the comparison to drop a subtree</strong> (search,
                insert, delete, lowest common ancestor, pruning a range sum).
                Third, <strong>build in reverse</strong> (turn sorted data into a
                balanced BST). The three walkthroughs below take one pattern
                each.
              </p>
            }
            zh={
              <p>
                BST 的题目八成落在三个套路里:①{" "}
                <strong>利用中序 = 升序</strong>(第 k 小、最小差、验证、恢复);②{" "}
                <strong>利用比较扔掉子树</strong>
                (搜索、插入、删除、最近公共祖先、范围和的剪枝);③{" "}
                <strong>反向构造</strong>(把有序数据变成平衡 BST)。
                三道精讲每个套路各占一道。
              </p>
            }
          />
        </div>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 40 }}>
          <span className="sec-index">
            <T en="Walkthrough A" zh="精讲 A" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 98 · Validate Binary Search Tree"
              zh="LC 98 · 验证二叉搜索树"
            />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">
              MEDIUM
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>The task:</b> decide whether a binary tree is a valid BST.{" "}
                <b>The trap:</b> almost everyone first writes &quot;check that
                each node is larger than its left child and smaller than its
                right child&quot;. <strong>That is wrong.</strong> The rule
                covers the whole subtree, not one parent and its children. Here
                is the counterexample built to break it:
              </p>
            }
            zh={
              <p>
                <b>题意:</b>判断一棵二叉树是否为合法 BST。
                <b>大坑:</b>几乎每个人的第一版都是「检查每个节点比左孩子大、
                比右孩子小」——<strong>这是错的</strong>。
                规矩管的是整棵子树,不是父子两个人。看这个专门击穿它的反例:
              </p>
            }
          />
        </div>
        <TreeStepper
          title={{
            en: "LC 98 · the range method, frame by frame",
            zh: "LC 98 · 上下界法,逐帧慢放",
          }}
          nodes={N98}
          edges={E98}
          frames={F98}
          h={265}
        />
        <CodeTabs
          title="lc98_validate_bst"
          java={{
            code: {
              en: `class Solution {
    public boolean isValidBST(TreeNode root) {
        return check(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }
    // every node must fall inside the open range (lo, hi) passed down by its ancestors
    private boolean check(TreeNode node, long lo, long hi) {
        if (node == null) return true;         // an empty tree is valid
        if (node.val <= lo || node.val >= hi)  // outside the range: fail
            return false;
        return check(node.left, lo, node.val)  // going left: the upper bound becomes this value
            && check(node.right, node.val, hi);// going right: the lower bound becomes this value
    }
}`,
              zh: `class Solution {
    public boolean isValidBST(TreeNode root) {
        return check(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }
    // 每个节点必须落在祖先传下来的开区间 (lo, hi) 内
    private boolean check(TreeNode node, long lo, long hi) {
        if (node == null) return true;         // 空树合法
        if (node.val <= lo || node.val >= hi)  // 越界即失败
            return false;
        return check(node.left, lo, node.val)  // 往左:上界收紧为自己
            && check(node.right, node.val, hi);// 往右:下界收紧为自己
    }
}`,
            },
            hl: [8, 9, 10, 11],
            note: {
              en: (
                <>
                  <b>Detail:</b> the bounds are <code>long</code>, because a node
                  value can be <code>Integer.MIN_VALUE</code> or{" "}
                  <code>MAX_VALUE</code>, and int bounds would then reject a
                  valid tree. Writing this line in an interview counts.
                </>
              ),
              zh: (
                <>
                  <b>细节:</b>界用 <code>long</code>,因为节点值可能取到{" "}
                  <code>Integer.MIN_VALUE</code> / <code>MAX_VALUE</code>,
                  用 int 当边界会把合法的树判错 —— 面试写出这一步是实打实的加分项。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def isValidBST(self, root: TreeNode | None) -> bool:
        # every node must fall inside the open range (lo, hi) passed down by its ancestors
        def check(node, lo, hi):
            if node is None:
                return True                    # an empty tree is valid
            if not (lo < node.val < hi):       # outside the range: fail
                return False
            return (check(node.left, lo, node.val)      # tighten the upper bound
                and check(node.right, node.val, hi))    # tighten the lower bound
        return check(root, float("-inf"), float("inf"))`,
              zh: `class Solution:
    def isValidBST(self, root: TreeNode | None) -> bool:
        # 每个节点必须落在祖先传下来的开区间 (lo, hi) 内
        def check(node, lo, hi):
            if node is None:
                return True                    # 空树合法
            if not (lo < node.val < hi):       # 越界即失败
                return False
            return (check(node.left, lo, node.val)      # 上界收紧
                and check(node.right, node.val, hi))    # 下界收紧
        return check(root, float("-inf"), float("inf"))`,
            },
            hl: [7, 8, 9, 10],
            note: {
              en: (
                <>
                  <b>Convenient:</b> the chained comparison{" "}
                  <code>lo &lt; node.val &lt; hi</code> is a Python feature, and{" "}
                  <code>float(&quot;±inf&quot;)</code> removes any worry about
                  integer bounds.
                </>
              ),
              zh: (
                <>
                  <b>顺手:</b><code>lo &lt; node.val &lt; hi</code>{" "}
                  的链式比较是 Python 独有的写法;无穷用{" "}
                  <code>float(&quot;±inf&quot;)</code>,不用担心整数边界。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var isValidBST = function (root) {
  // every node must fall inside the open range (lo, hi) passed down by its ancestors
  const check = (node, lo, hi) => {
    if (!node) return true;              // an empty tree is valid
    if (node.val <= lo || node.val >= hi) return false; // outside the range: fail
    return check(node.left, lo, node.val)    // tighten the upper bound
      && check(node.right, node.val, hi);    // tighten the lower bound
  };
  return check(root, -Infinity, Infinity);
};`,
              zh: `var isValidBST = function (root) {
  // 每个节点必须落在祖先传下来的开区间 (lo, hi) 内
  const check = (node, lo, hi) => {
    if (!node) return true;              // 空树合法
    if (node.val <= lo || node.val >= hi) return false; // 越界即失败
    return check(node.left, lo, node.val)    // 上界收紧
      && check(node.right, node.val, hi);    // 下界收紧
  };
  return check(root, -Infinity, Infinity);
};`,
            },
            hl: [5, 6, 7],
            note: {
              en: (
                <>
                  <b>Convenient:</b> comparisons against{" "}
                  <code>±Infinity</code> always behave as expected in JS, so the
                  bounds need no special handling.
                </>
              ),
              zh: (
                <>
                  <b>顺手:</b>JS 的 <code>±Infinity</code> 跟任何数比较都符合预期,
                  边界处理最省心。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-up questions",
            zh: "复杂度 & 追问",
          }}
        >
          <T
            en={
              <p>
                Each node is checked once: <b>O(n)</b> time, O(h) space for the
                recursion stack. Follow-up one, &quot;is there another
                solution?&quot; — yes:{" "}
                <b>traverse in order and check that the sequence strictly
                increases</b> (keep prev, and fail as soon as cur ≤ prev). That
                is the property from §02, and you should know both. Follow-up
                two, &quot;why is the range open at both ends?&quot; — because
                the problem requires strictly smaller and strictly larger, so an
                equal value is also a violation; duplicates are not allowed.
              </p>
            }
            zh={
              <p>
                每个节点检查一次:时间 <b>O(n)</b>,空间 O(h) 递归栈。追问一:
                「另一种解法?」—— <b>中序遍历,检查序列是否严格递增</b>
                (维护 prev,一旦 cur ≤ prev 即失败),原理就是 §02 的性质,
                两种都要会。追问二:「为什么区间是开区间?」——
                题目要求严格小于 / 大于,等号也算违规,重复值不合法。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough B" zh="精讲 B" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 230 · Kth Smallest Element in a BST"
              zh="LC 230 · BST 中第 K 小的元素"
            />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">
              MEDIUM
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>The task:</b> return the k-th smallest value in a BST.{" "}
                <b>The brute force:</b> traverse in any order, collect every
                value, sort, take the k-th. That is O(n log n) and uses nothing
                about the BST. <b>Why in-order:</b> the sorting was already done
                when the tree was built. In-order traversal{" "}
                <strong>is</strong> the values in ascending order, so you only
                have to count as you go and stop at k:
              </p>
            }
            zh={
              <p>
                <b>题意:</b>返回 BST 中第 k 小的元素。<b>暴力:</b>
                任意遍历收集所有值、排序取第 k 个 —— O(n log n),完全没用上 BST。
                <b>为什么用中序:</b>排序的活儿在建树时就已经做完了 ——
                中序遍历<strong>就是</strong>按升序逐个吐数,
                我们只需要一边遍历一边数数,数到 k 立刻停:
              </p>
            }
          />
        </div>
        <TreeStepper
          title={{
            en: "LC 230 · counting during in-order traversal (k = 3)",
            zh: "LC 230 · 中序计数(k = 3)",
          }}
          nodes={N230}
          edges={E230}
          frames={F230}
          h={255}
        />
        <CodeTabs
          title="lc230_kth_smallest"
          java={{
            code: {
              en: `class Solution {
    private int count = 0, ans = 0;

    public int kthSmallest(TreeNode root, int k) {
        dfs(root, k);
        return ans;
    }

    private void dfs(TreeNode node, int k) {
        if (node == null || count >= k) return; // done counting, stop everywhere
        dfs(node.left, k);                      // count everything smaller first
        count++;                                // now count this node
        if (count == k) { ans = node.val; return; }
        dfs(node.right, k);                     // then the larger values
    }
}`,
              zh: `class Solution {
    private int count = 0, ans = 0;

    public int kthSmallest(TreeNode root, int k) {
        dfs(root, k);
        return ans;
    }

    private void dfs(TreeNode node, int k) {
        if (node == null || count >= k) return; // 数够了,全线撤退
        dfs(node.left, k);                      // 先数完所有更小的
        count++;                                // 轮到自己报数
        if (count == k) { ans = node.val; return; }
        dfs(node.right, k);                     // 再去数更大的
    }
}`,
            },
            hl: [10, 11, 12, 13],
          }}
          python={{
            code: {
              en: `class Solution:
    def kthSmallest(self, root: TreeNode | None, k: int) -> int:
        # iterative in-order with an explicit stack: return as soon as k is reached
        stack = []
        cur = root
        count = 0
        while stack or cur:
            while cur:               # push the whole left spine
                stack.append(cur)
                cur = cur.left
            cur = stack.pop()        # popping = visiting in ascending order
            count += 1               # count this node
            if count == k:
                return cur.val       # the k-th one is the answer
            cur = cur.right          # turn to the right subtree
        return -1                    # unreachable for a valid k`,
              zh: `class Solution:
    def kthSmallest(self, root: TreeNode | None, k: int) -> int:
        # 迭代中序:显式栈,数到 k 个直接 return,天然提前终止
        stack = []
        cur = root
        count = 0
        while stack or cur:
            while cur:               # 左脊全部入栈
                stack.append(cur)
                cur = cur.left
            cur = stack.pop()        # 弹出 = 按升序访问
            count += 1               # 轮到自己报数
            if count == k:
                return cur.val       # 第 k 个就是答案
            cur = cur.right          # 转向右子树
        return -1                    # k 合法时走不到这里`,
            },
            hl: [11, 12, 13, 14],
            note: {
              en: (
                <>
                  <b>Why iterative here:</b> stopping a recursion early means
                  carrying a flag back up through every frame, while the
                  iterative version just returns. This stack template is also the
                  answer to LC 173, the BST iterator.
                </>
              ),
              zh: (
                <>
                  <b>为什么用迭代:</b>递归提前终止要靠标记层层返回,
                  迭代版一个 <code>return</code> 干净利落 ——
                  这段栈模板同时就是 LC 173(BST 迭代器)的答案。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var kthSmallest = function (root, k) {
  let count = 0, ans = -1;
  const dfs = (node) => {
    if (!node || count >= k) return;  // done counting, stop everywhere
    dfs(node.left);                   // count everything smaller first
    count++;                          // now count this node
    if (count === k) { ans = node.val; return; }
    dfs(node.right);                  // then the larger values
  };
  dfs(root);
  return ans;
};`,
              zh: `var kthSmallest = function (root, k) {
  let count = 0, ans = -1;
  const dfs = (node) => {
    if (!node || count >= k) return;  // 数够了,全线撤退
    dfs(node.left);                   // 先数完所有更小的
    count++;                          // 轮到自己报数
    if (count === k) { ans = node.val; return; }
    dfs(node.right);                  // 再去数更大的
  };
  dfs(root);
  return ans;
};`,
            },
            hl: [4, 5, 6, 7],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-up questions",
            zh: "复杂度 & 追问",
          }}
        >
          <T
            en={
              <p>
                Time <b>O(h + k)</b>: O(h) to reach the leftmost node, then k
                values are produced. Space O(h). The classic follow-up: &quot;what
                if inserts and deletes are frequent and you also query the k-th
                smallest often?&quot; — <b>store the size of the left subtree in
                every node</b>. To query: if k ≤ leftSize go left; if k = leftSize
                + 1 this node is the answer; otherwise go right with k − leftSize
                − 1. That is O(h) per query, and the counts are updated during
                insert and delete. It is binary search performed on the tree
                itself.
              </p>
            }
            zh={
              <p>
                时间 <b>O(h + k)</b>:先沉到最左 O(h),再吐出 k 个;空间 O(h)。
                经典追问:「如果频繁插入删除,还要频繁查第 k 小呢?」——
                在每个节点上<b>缓存左子树的节点数</b>:查询时若 k ≤ leftSize 往左;
                k = leftSize + 1 就是自己;否则带着 k − leftSize − 1 往右 ——
                每次 O(h),插入删除时顺路维护计数即可。
                这就是把二分查找直接做在树上。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough C" zh="精讲 C" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 108 · Convert Sorted Array to Binary Search Tree"
              zh="LC 108 · 将有序数组转换为二叉搜索树"
            />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">
              EASY
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>The task:</b> turn an ascending array into a height-balanced
                BST. <b>What not to do:</b> insert the elements one by one. The
                input is sorted, and the lab in §02 showed what that produces: a
                chain. <b>The solution:</b> balance means the two sides hold
                almost the same number of nodes, and in a sorted array it is
                obvious which value belongs in the middle.{" "}
                <strong>Take the midpoint as the root, and build the two halves
                recursively.</strong>
              </p>
            }
            zh={
              <p>
                <b>题意:</b>把升序数组变成一棵高度平衡的 BST。<b>反面教材:</b>
                把元素逐个 insert —— 输入有序,§02 实验室演过,直接退化成链。
                <b>正解:</b>平衡的本质是「左右节点数均等」,
                而有序数组里谁站中间一目了然:
                <strong>取中点当根,左右两半递归建子树</strong>。
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 108 · take the midpoint, then recurse",
            zh: "LC 108 · 取中点递归建树",
          }}
          frames={F108}
        />
        <div className="grid-2" style={{ marginTop: 14 }}>
          <div className="card">
            <div className="card-kicker">
              <T en="The resulting tree" zh="建出来的树" />
            </div>
            <MiniTree
              w={280}
              h={200}
              nodes={[
                { id: 0, v: 0, x: 140, y: 32, state: "ok" },
                { id: 1, v: -10, x: 75, y: 102 },
                { id: 2, v: 5, x: 205, y: 102 },
                { id: 3, v: -3, x: 110, y: 170 },
                { id: 4, v: 9, x: 240, y: 170 },
              ]}
              edges={[
                [0, 1],
                [0, 2],
                [1, 3],
                [2, 4],
              ]}
              caption={
                <T
                  en={
                    <>
                      5 nodes, 3 levels, height 2 = ⌊log₂5⌋ — exactly the
                      minimum possible.
                    </>
                  }
                  zh={
                    <>5 个节点、3 层,树高 2 = ⌊log₂5⌋(按边数)—— 正好贴着下限。</>
                  }
                />
              }
            />
          </div>
          <div className="card">
            <div className="card-title">
              <T
                en="Why does the midpoint guarantee balance?"
                zh="为什么中点能保证平衡?"
              />
            </div>
            <T
              en={
                <p>
                  Splitting at the midpoint leaves two halves whose lengths
                  differ by at most 1. Every level of the recursion preserves
                  that, so <b>the two subtrees of any node differ by at most one
                  node</b>, and their heights differ by at most 1. What you are
                  really building is the decision tree of binary search: mid is
                  the root, the two halves are the subtrees, and every path
                  binary search could take becomes a path in the tree.
                </p>
              }
              zh={
                <p>
                  取中点后,左右两半的长度最多差 1;递归的每一层都维持这个性质,
                  于是任何节点的左右子树<b>节点数最多差 1</b>,高度差自然不超过 1。
                  这其实是把「二分查找的决策树」显式地盖了出来:mid 是根,
                  两半是子树,二分可能走的每条路都成了树上的一条边。
                </p>
              }
            />
          </div>
        </div>
        <CodeTabs
          title="lc108_sorted_array_to_bst"
          java={{
            code: {
              en: `class Solution {
    public TreeNode sortedArrayToBST(int[] nums) {
        return build(nums, 0, nums.length - 1);
    }
    private TreeNode build(int[] nums, int lo, int hi) {
        if (lo > hi) return null;             // empty range, attach null
        int mid = lo + (hi - lo) / 2;         // the midpoint is the root (overflow-safe)
        TreeNode root = new TreeNode(nums[mid]);
        root.left = build(nums, lo, mid - 1); // left half becomes the left subtree
        root.right = build(nums, mid + 1, hi);// right half becomes the right subtree
        return root;
    }
}`,
              zh: `class Solution {
    public TreeNode sortedArrayToBST(int[] nums) {
        return build(nums, 0, nums.length - 1);
    }
    private TreeNode build(int[] nums, int lo, int hi) {
        if (lo > hi) return null;             // 区间空了,挂 null
        int mid = lo + (hi - lo) / 2;         // 中点当根(防溢出写法)
        TreeNode root = new TreeNode(nums[mid]);
        root.left = build(nums, lo, mid - 1); // 左半边建左子树
        root.right = build(nums, mid + 1, hi);// 右半边建右子树
        return root;
    }
}`,
            },
            hl: [6, 7, 9, 10],
          }}
          python={{
            code: {
              en: `class Solution:
    def sortedArrayToBST(self, nums: list[int]) -> TreeNode | None:
        def build(lo, hi):
            if lo > hi:
                return None                  # empty range, attach None
            mid = (lo + hi) // 2             # the midpoint is the root
            root = TreeNode(nums[mid])
            root.left = build(lo, mid - 1)   # left half becomes the left subtree
            root.right = build(mid + 1, hi)  # right half becomes the right subtree
            return root
        return build(0, len(nums) - 1)`,
              zh: `class Solution:
    def sortedArrayToBST(self, nums: list[int]) -> TreeNode | None:
        def build(lo, hi):
            if lo > hi:
                return None                  # 区间空了,挂 None
            mid = (lo + hi) // 2             # 中点当根
            root = TreeNode(nums[mid])
            root.left = build(lo, mid - 1)   # 左半边建左子树
            root.right = build(mid + 1, hi)  # 右半边建右子树
            return root
        return build(0, len(nums) - 1)`,
            },
            hl: [4, 5, 6, 8, 9],
          }}
          js={{
            code: {
              en: `var sortedArrayToBST = function (nums) {
  const build = (lo, hi) => {
    if (lo > hi) return null;             // empty range, attach null
    const mid = (lo + hi) >> 1;           // the midpoint is the root
    const root = new TreeNode(nums[mid]);
    root.left = build(lo, mid - 1);       // left half becomes the left subtree
    root.right = build(mid + 1, hi);      // right half becomes the right subtree
    return root;
  };
  return build(0, nums.length - 1);
};`,
              zh: `var sortedArrayToBST = function (nums) {
  const build = (lo, hi) => {
    if (lo > hi) return null;             // 区间空了,挂 null
    const mid = (lo + hi) >> 1;           // 中点当根
    const root = new TreeNode(nums[mid]);
    root.left = build(lo, mid - 1);       // 左半边建左子树
    root.right = build(mid + 1, hi);      // 右半边建右子树
    return root;
  };
  return build(0, nums.length - 1);
};`,
            },
            hl: [3, 4, 6, 7],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-up questions",
            zh: "复杂度 & 追问",
          }}
        >
          <T
            en={
              <p>
                Each element becomes a root exactly once: <b>O(n)</b> time, O(log
                n) space for the recursion stack. Follow-up: &quot;what if the
                input is a sorted <b>linked list</b>?&quot; (LC 109). Finding the
                middle of a linked list costs O(n), so there are two approaches:
                use the slow and fast pointers to find the middle each time,
                which totals O(n log n); or build in in-order sequence — count
                the length first, then recurse over the index range while
                consuming the list nodes in order, which stays O(n). Explaining
                that step finishes this group of problems.
              </p>
            }
            zh={
              <p>
                每个元素恰好当一次根:时间 <b>O(n)</b>,空间 O(log n) 递归栈。
                追问:「输入换成有序<b>链表</b>呢?」(LC 109)——
                链表找中点要 O(n),于是有两个思路:每次用快慢指针找中点
                (总 O(n log n));或者反过来用「中序位置法」——
                先数出长度,再按中序顺序边递归边消费链表节点,依然 O(n)。
                能把这层讲清楚,这组题就通关了。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title={{ en: "Problem set: 9 BST questions", zh: "高频题单:BST 9 题" }}
        desc={{
          en: "Ordered as core operations, then using the sorted property, then changing the structure. Think for 30 seconds before opening the hint.",
          zh: "按「基本操作 → 利用有序性 → 结构改造」递进。先想 30 秒再看提示",
        }}
        badge={
          <span className="chip">
            <T en="Interview regulars" zh="面试常客" />
          </span>
        }
      >
        <ProblemSet ch="bst" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Get all 7 right to light up this chapter",
          zh: "7 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="bst" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                One rule defines everything:{" "}
                <b>left &lt; node &lt; right, for the whole subtree</b>. When you
                validate or use a BST, remember that the constraints of the
                ancestors are passed down (the range method in LC 98).
              </>
            ),
            zh: (
              <>
                一条规矩定乾坤:<b>左 &lt; 根 &lt; 右,且对整棵子树成立</b> ——
                验证或利用它时,永远记得「祖先的约束会传下来」(LC 98 的上下界)。
              </>
            ),
          },
          {
            en: (
              <>
                <b>In-order traversal gives the keys in sorted order.</b> K-th
                smallest, minimum difference, validation, recovery — most BST
                problems reduce to this one property.
              </>
            ),
            zh: (
              <>
                <b>中序遍历 = 升序</b>:第 k 小、最小差、验证、恢复……
                BST 一大半的题,钥匙都是这一条。
              </>
            ),
          },
          {
            en: (
              <>
                Search, insert, and delete are all <b>O(h)</b>, with the height h
                counted in edges: h = ⌊log₂n⌋ while the tree is balanced, and
                h = n − 1 after sorted input degenerates it. State the complexity
                with h, or state the condition.
              </>
            ),
            zh: (
              <>
                查找 / 插入 / 删除都是 <b>O(h)</b>(树高按边数计):
                平衡时 h = ⌊log₂n⌋,有序插入退化时 h = n − 1 ——
                说复杂度带上 h,或者把条件说清楚。
              </>
            ),
          },
          {
            en: (
              <>
                Three delete cases: remove a leaf; replace a node that has one
                child by that child; for two children,{" "}
                <b>copy the in-order successor and delete it from the right
                subtree</b>. The successor has no left child, so the hard case
                turns into an easy one.
              </>
            ),
            zh: (
              <>
                删除三情况:叶子直接摘;单孩子让孩子顶;双孩子
                <b>值换中序后继,再去右子树删掉它</b> ——
                后继必无左孩子,难题自动降级。
              </>
            ),
          },
          {
            en: (
              <>
                A BST with no rebalancing is not used in production: Java has{" "}
                <code>TreeMap</code> / <code>TreeSet</code> (red-black, balanced
                enough), Python has the third-party{" "}
                <code>sortedcontainers</code>, JavaScript has nothing built in.
                On disk, database indexes use a <b>B+ tree</b>: short and wide to
                cut the number of reads, with linked leaves for range scans.
              </>
            ),
            zh: (
              <>
                工程中不会直接使用无自平衡机制的 BST:Java 有{" "}
                <code>TreeMap</code> / <code>TreeSet</code>(红黑树,
                足够平衡就好)、Python 用第三方 <code>sortedcontainers</code>、
                JS 无内置;磁盘上的数据库索引则换 <b>B+ 树</b> ——
                矮胖省读取次数,叶子链表利于范围扫描。
              </>
            ),
          },
          {
            en: (
              <>
                Choose between a hash table and a BST by one question:{" "}
                <b>do you need order?</b> Plain lookups go to the hash table.
                Range queries, nearest-key lookups, and iteration in key order go
                to the ordered structure.
              </>
            ),
            zh: (
              <>
                哈希表还是 BST,只看一个问题:<b>需不需要顺序?</b>
                单点查找选哈希表;范围查询、找最近的 key、按顺序遍历,
                才轮到有序结构。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="bst" />
    </main>
  );
}
