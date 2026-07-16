"use client";

// 第 8 章 · 二叉搜索树(BST)
// 十段式:直觉(有序数组 vs 链表的两难)→ 性质(中序=升序 + BSTLab)→
// 核心操作(O(h) + 删除三情况图解)→ 手写实现 → 平衡的世界(AVL/红黑/工程对照)→
// 三道精讲(98/230/108,逐帧动画 + 三语言题解)→ 题单 → 测验 → 要点。

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
    msg: (
      <>
        先看陷阱:逐个检查父子 —— 5&lt;10 ✓、15&gt;10 ✓、6&lt;15 ✓、20&gt;15 ✓,
        <b>全部通过</b>。但这棵树不是 BST!问题出在哪?
      </>
    ),
  },
  {
    lit: [0],
    tags: { 0: "(-∞, +∞)" },
    msg: (
      <>
        正解:给每个节点发一张「合法区间」通行证。根没有任何祖先约束:
        区间是 <b>(-∞, +∞)</b>,10 当然合法。
      </>
    ),
  },
  {
    ok: [0],
    lit: [1],
    tags: { 1: "(-∞, 10)" },
    msg: (
      <>
        往左走:左子树全体必须 &lt; 10,所以<b>上界收紧为 10</b>。
        5 ∈ (-∞, 10) ✓。
      </>
    ),
  },
  {
    ok: [0, 1],
    lit: [2],
    tags: { 2: "(10, +∞)" },
    msg: (
      <>
        往右走:右子树全体必须 &gt; 10,<b>下界收紧为 10</b>。
        15 ∈ (10, +∞) ✓。
      </>
    ),
  },
  {
    ok: [0, 1, 2],
    bad: [3],
    tags: { 3: "(10, 15)" },
    msg: (
      <>
        15 的左孩子:区间收成 <b>(10, 15)</b> —— 既要 &lt; 15(爸爸),
        又要 &gt; 10(爷爷!)。6 越过下界 10,<b>验证失败</b>。
      </>
    ),
  },
  {
    dim: [0, 1, 2, 4],
    bad: [3],
    tags: { 3: "6 < 10 ✗" },
    msg: (
      <>
        复盘:6 只和爸爸 15 比是合格的,但它住在 10 的右子树里,必须 &gt; 10。
        <b>「只查父子」会漏掉祖先的约束</b> —— 上下界法把祖先的要求
        一路传下来,谁也逃不掉。
      </>
    ),
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
    msg: (
      <>
        目标:第 k=3 小。中序遍历会从小到大逐个「报数」——
        先一路向左沉到底,找到全场最小。
      </>
    ),
  },
  {
    ok: [3],
    tags: { 3: "count=1" },
    msg: (
      <>
        访问 <b>2</b>:count = 1。还不到 3,继续。
      </>
    ),
  },
  {
    ok: [3],
    lit: [1],
    tags: { 1: "count=2" },
    msg: (
      <>
        左子树完了回到 <b>3</b>:count = 2。仍不到 3,去右子树。
      </>
    ),
  },
  {
    ok: [3, 1, 4],
    tags: { 4: "count=3 ✓" },
    msg: (
      <>
        访问 <b>4</b>:count = 3 = k —— <b>答案就是 4</b>,立刻收工!
      </>
    ),
  },
  {
    ok: [3, 1, 4],
    dim: [0, 2, 5],
    msg: (
      <>
        注意:5、7、8 根本没被访问。中序天然升序,数到第 k 个就能提前刹车 ——
        平均只走 <b>O(h + k)</b>,而不是遍历全树。
      </>
    ),
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
    msg: (
      <>
        想让树平衡,就要让左右子树<b>人数尽量均等</b> —— 取中点 mid=2:
        <b>0 当根</b>,左半边归左子树,右半边归右子树。
      </>
    ),
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
    msg: (
      <>
        递归左半 [-10, -3]:mid=0 → <b>-10 成为 0 的左孩子</b>。
      </>
    ),
  },
  {
    cells: A108.map((v, i) => ({
      v,
      state: i === 2 || i === 0 ? "ok" : i === 1 ? "lit" : "ghost",
    })),
    msg: (
      <>
        再递归剩下的 [-3]:单元素区间,mid 就是它自己 →{" "}
        <b>-3 成为 -10 的右孩子</b>。左半边完工。
      </>
    ),
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
    msg: (
      <>
        右半 [5, 9]:mid=3 → <b>5 成为 0 的右孩子</b>。
      </>
    ),
  },
  {
    cells: A108.map((v) => ({ v, state: "ok" })),
    msg: (
      <>
        最后 [9] → 5 的右孩子。完成!5 个节点、高度 3 ≈ log₂5;
        每个元素恰好被用一次 → <b>O(n)</b> 建树。
      </>
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: "直觉" },
  { id: "order", n: "02", label: "性质与实验室" },
  { id: "ops", n: "03", label: "核心操作" },
  { id: "impl", n: "04", label: "手写实现" },
  { id: "balance", n: "05", label: "平衡的世界" },
  { id: "patterns", n: "06", label: "套路与精讲" },
  { id: "problems", n: "07", label: "高频题单" },
  { id: "quiz", n: "08", label: "通关测验" },
];

export default function BSTChapter() {
  return (
    <main className="page" data-ch="bst">
      <Hero
        ch="bst"
        title={
          <>
            二叉搜索树 <span className="grad">BST</span>
          </>
        }
        essence={
          <>
            在二叉树上立下一条规矩:<strong>左 &lt; 根 &lt; 右</strong>,
            而且对整棵子树成立。从此每次比较都能砍掉一半天地 ——
            它把二分查找,长在了一棵<strong>随时可以插拔</strong>的树上。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 直觉 ================= */}
      <Section
        id="intuition"
        index="01"
        title="为什么需要它:查得快和改得快,我全都要"
        desc="有序数组与链表各瘸一条腿 —— BST 是那个两条腿都能跑的方案"
      >
        <div className="prose">
          <p>
            先回顾两位老朋友的「偏科成绩单」。<strong>有序数组</strong>查找极快:
            二分每次砍一半,O(log n);但插入一个新值,得先腾位置 ——
            右边所有元素集体搬家,O(n)。<strong>链表</strong>正相反:
            接一个节点只改两根指针,O(1);可想找某个值,只能从头一路问过去,O(n)
            —— 链表连二分都做不了,因为它没有 O(1) 随机访问,「跳到中间」这一步就要 O(n)。
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>结构</th>
                <th>查找</th>
                <th>插入 / 删除</th>
                <th>病根</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>有序数组</b></td>
                <td><BigO o="logn" />(二分)</td>
                <td><BigO o="n" />(搬家)</td>
                <td>连续内存:改动必须挪人</td>
              </tr>
              <tr>
                <td><b>链表</b></td>
                <td><BigO o="n" />(顺藤摸瓜)</td>
                <td><BigO o="1" />(改指针)</td>
                <td>没有随机访问:没法「跳到中间」二分</td>
              </tr>
              <tr>
                <td><b>BST(平衡时)</b></td>
                <td><BigO o="logn" label="O(h)" /></td>
                <td><BigO o="logn" label="O(h)" /></td>
                <td>需要防退化(§05 见)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            BST 的主意:把「二分」的判断过程<strong>固化成树的形状</strong>。
            想象一座图书馆:进门的导览牌写着「A–M 往左,N–Z 往右」;走进左区,
            又有一块牌子「A–F 往左,G–M 往右」…… 每问一块牌子,剩下要找的范围就砍掉一半。
            BST 的每个节点就是一块这样的导览牌,而且 ——
            因为节点之间用的是<strong>指针</strong>(第 3 章链表教的),
            插一块新牌子不需要任何人搬家。
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">RULE · 唯一的规矩</div>
            <div className="card-title">⚖️ 左 &lt; 根 &lt; 右</div>
            <p>
              任何节点:左子树<b>所有</b>节点比它小,右子树<b>所有</b>节点比它大。
              注意是「整棵子树」而不是「左右孩子」—— 这三个字是本章最大的坑,
              §06 的 LC 98 专门为它设的局。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">POWER 01</div>
            <div className="card-title">🎯 查找 = 走下坡路</div>
            <p>
              每到一个节点只问一次「大还是小」,就能<b>整棵扔掉</b>一边的子树。
              比较次数 = 走过的路径长度 ≤ 树高 h。这就是长在树上的二分。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">POWER 02</div>
            <div className="card-title">🔄 修改不用搬家</div>
            <p>
              插入:沿查找路线走到空位,挂上去,改一根指针。删除:最多牵动一条路径。
              没有任何「集体右移」—— 这是从链表那里继承的好基因。
            </p>
          </div>
        </div>
        <Callout tone="story" title="它是一部「活的字典」">
          <p>
            数组像印刷版字典:有序但改不动,再版(重排)才加得进新词;哈希表像口袋:
            塞取极快,但倒出来是乱的。BST 是<b>活页字典</b>:随时插新页,
            且任何时刻按顺序翻阅(中序遍历)都是排好序的 ——
            「动态 + 有序」两个词同时出现时,树结构几乎是唯一解。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 性质 ================= */}
      <Section
        id="order"
        index="02"
        title="性质:有序是免费送的"
        desc="中序遍历 = 升序;查找 = 一路二分下坠 —— 然后亲手把一棵树养歪"
      >
        <div className="prose">
          <p>
            上一章学了四种遍历。对 BST 来说,其中一种有超能力:
            <strong>中序遍历(inorder,左 → 根 → 右)输出的序列必然升序</strong>。
            为什么?把树画出来就明白了 ——
            规矩保证左子树全体在根的左边、右子树全体在根的右边,
            所以每个节点的<strong>水平位置</strong>天然就是它的排序位次:
          </p>
        </div>
        <InorderFig />
        <div className="prose">
          <p>
            这条性质怎么用?反着看:想按顺序拿到 BST 里的数据,中序遍历即可,
            <strong>不需要排序</strong>;想验证一棵树是不是 BST,看中序是否严格递增即可;
            想找「第 k 小」,中序数到第 k 个即可。一条性质,养活半章的题。
          </p>
          <p>
            再看查找。在下面的实验室里输入一个数字点「查找」,
            你会看到它从根出发,每一步比较后<strong>只往一边走</strong> ——
            像一颗珠子沿着判断轨道一路下坠。也试试插入:新值总是落在
            「查找失败的那个空位」上。最后,务必点一次
            <strong>「顺序插入 1→5」</strong>:亲眼看看规矩没变、树却废了的样子。
          </p>
        </div>
        <BSTLab />
        <Callout tone="warn" title="刚才那棵歪树,就是 BST 的阿喀琉斯之踵">
          <p>
            顺序插入时每个新值都往同一边拐,树斜成一条链:高度 h 从 log n 恶化到 n,
            查找从「砍一半」退化成「逐个问」—— 和链表一模一样。
            <b>规矩(左小右大)只保证正确性,不保证形状</b>。谁来管形状?§05 的平衡树。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 核心操作 ================= */}
      <Section
        id="ops"
        index="03"
        title="核心操作:一切都是 O(h)"
        desc="查找、插入好懂;删除分三种情况 —— 逐一图解"
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>操作</th>
                <th>复杂度</th>
                <th>为什么</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>查找</b> search</td>
                <td><BigO o="logn" label="O(h)" /></td>
                <td>每步比较砍掉一棵子树,最多走一条根到叶的路径</td>
              </tr>
              <tr>
                <td><b>插入</b> insert</td>
                <td><BigO o="logn" label="O(h)" /></td>
                <td>= 一次失败的查找 + 在空位挂新节点(改一根指针)</td>
              </tr>
              <tr>
                <td><b>删除</b> delete</td>
                <td><BigO o="logn" label="O(h)" /></td>
                <td>定位 O(h) + 三种情况的修补,最坏再走一段找后继</td>
              </tr>
              <tr>
                <td><b>最小 / 最大值</b></td>
                <td><BigO o="logn" label="O(h)" /></td>
                <td>一路向左 / 向右走到底,不用比较</td>
              </tr>
              <tr>
                <td><b>中序遍历</b>(取有序序列)</td>
                <td><BigO o="n" /></td>
                <td>每个节点都要拜访一次,免不了</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            为什么全都写 <strong>O(h)</strong> 而不是 O(log n)?因为 h(树高)是个
            <strong>变量</strong>:完全平衡时 h ≈ log₂n(每层人数翻倍,n 个人只需 log n 层);
            顺序插入退化时 h = n(一条链)。笼统说 O(log n) 是不严谨的 ——
            面试里说「O(h),平衡时 log n、最坏 n,工程用红黑树保证 log n」,
            才是满分答案。
          </p>
          <p>
            查找和插入你已经在实验室亲手做过了。真正的难点是<strong>删除</strong>:
            挖掉一个节点会在树上留下一个洞,怎么补洞才能不破坏「左小右大」?
            按被删节点的孩子数量分三种情况,一种比一种棘手:
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-kicker">情况 ① · 叶子</div>
            <div className="card-title">直接摘掉</div>
            <MiniTree
              w={260}
              h={196}
              nodes={[
                { id: 0, v: 50, x: 130, y: 30 },
                { id: 1, v: 30, x: 70, y: 96 },
                { id: 2, v: 70, x: 190, y: 96 },
                { id: 3, v: 20, x: 35, y: 165, state: "bad", tag: "删我" },
                { id: 4, v: 40, x: 105, y: 165 },
              ]}
              edges={[
                [0, 1],
                [0, 2],
                [1, 3],
                [1, 4],
              ]}
              caption={
                <>
                  20 没有任何孩子,没人依赖它 —— 把父亲指向它的指针置 null 即可,
                  树的其余部分毫发无损。
                </>
              }
            />
          </div>
          <div className="card">
            <div className="card-kicker">情况 ② · 单孩子</div>
            <div className="card-title">孩子顶上</div>
            <MiniTree
              w={260}
              h={196}
              nodes={[
                { id: 0, v: 50, x: 130, y: 30 },
                { id: 1, v: 30, x: 70, y: 96 },
                { id: 2, v: 70, x: 190, y: 96, state: "bad", tag: "删我" },
                { id: 3, v: 80, x: 225, y: 165, state: "ok", tag: "顶上" },
              ]}
              edges={[
                [0, 1],
                [0, 2],
                [2, 3],
              ]}
              caption={
                <>
                  70 只有一个孩子 80:让爷爷 50 直接收养 80(像链表跳过节点)。
                  80 那一支本来就全部 &gt; 50,接上来规矩依旧成立。
                </>
              }
            />
          </div>
          <div className="card">
            <div className="card-kicker">情况 ③ · 双孩子</div>
            <div className="card-title">找替身:中序后继</div>
            <MiniTree
              w={260}
              h={196}
              nodes={[
                { id: 0, v: 50, x: 130, y: 30, state: "bad", tag: "删我" },
                { id: 1, v: 30, x: 70, y: 96 },
                { id: 2, v: 70, x: 190, y: 96 },
                { id: 3, v: 20, x: 35, y: 165 },
                { id: 4, v: 40, x: 105, y: 165 },
                { id: 5, v: 60, x: 155, y: 165, state: "ok", tag: "后继" },
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
                <>
                  50 左右都有人,谁都不能直接顶上。找<b>中序后继 60</b>
                  (右子树里最小的):把 60 的值抄给根,再去右子树删掉原来的 60。
                </>
              }
            />
          </div>
        </div>
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            情况 ③ 的两个「为什么」值得掰开:<strong>为什么后继能当替身?</strong>
            中序后继是「恰好比被删值大的下一个数」—— 它顶上之后,
            左子树全体仍比它小(它比被删值还大),右子树剩余全体仍比它大
            (它是右子树里最小的),规矩两边都不破。
            <strong>为什么删后继很容易?</strong>后继 = 右子树一路向左的尽头,
            它<strong>必然没有左孩子</strong> —— 删它必落入情况 ① 或 ②,不会无限套娃。
            对称地,用中序前驱(左子树最大值)也完全可行。
          </p>
        </div>
        <Callout tone="idea" title="一句话记住删除">
          <p>
            叶子直接删;单孩子让孩子顶;双孩子<b>值换后继、删转右树</b> ——
            把「删一个中枢」降级成「删一个边缘」。总代价:定位 + 找后继 + 递归删,
            全程走的还是一条向下的路径,<b>O(h)</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 手写实现 ================= */}
      <Section
        id="impl"
        index="04"
        title="手写实现:60 行,一棵完整的 BST"
        desc="insert / search / delete / inorder —— delete 三情况完整实现,能直接跑"
      >
        <div className="prose">
          <p>
            节点还是二叉树章的 TreeNode(值 + 左右孩子指针)。四个方法里,
            insert 和 delete 用递归写:注意它们都<strong>返回「修补后的子树根」</strong>,
            由上一层接住 —— 这个「返回自己让父亲重新牵手」的模式,
            是递归改树的标准姿势(不需要专门记录父节点)。
          </p>
        </div>
        <CodeTabs
          title="bst"
          java={{
            code: `class TreeNode {                        // 二叉树章的老朋友
    int val;
    TreeNode left, right;
    TreeNode(int v) { val = v; }
}

class BST {
    TreeNode root;                       // 记住根,全树顺藤摸瓜

    // 查找:一路二分下坠,O(h)
    public boolean search(int v) {
        TreeNode cur = root;
        while (cur != null) {
            if (v == cur.val) return true;
            cur = v < cur.val ? cur.left : cur.right; // 小往左,大往右
        }
        return false;                    // 走到 null:全树都不可能有
    }

    // 插入:沿查找路线走到空位安家,O(h)
    public void insert(int v) {
        root = insertAt(root, v);
    }
    private TreeNode insertAt(TreeNode node, int v) {
        if (node == null) return new TreeNode(v); // 空位就是新家
        if (v < node.val)      node.left  = insertAt(node.left, v);
        else if (v > node.val) node.right = insertAt(node.right, v);
        return node;                     // 相等 = 已存在,不动;返回自己让父亲重连
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
        if (node.left == null) return node.right;  // ① 叶子(返回 null)/ ② 只有右孩子
        if (node.right == null) return node.left;  // ② 只有左孩子
        TreeNode succ = node.right;                // ③ 双孩子:找中序后继
        while (succ.left != null) succ = succ.left;//    = 右子树一路向左到底
        node.val = succ.val;                       // 值换后继
        node.right = deleteAt(node.right, succ.val); // 删转右树(后继必无左孩子)
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
            hl: [40, 41, 42, 43, 44, 45],
            note: (
              <>
                <b>细节:</b>deleteAt 的三情况里,「叶子」被并进了「只有右孩子」——
                叶子的 right 是 null,返回它正好等于返回 null。两行代码盖住两种情况。
              </>
            ),
          }}
          python={{
            code: `class TreeNode:                        # 二叉树章的老朋友
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None               # 记住根,全树顺藤摸瓜

    # 查找:一路二分下坠,O(h)
    def search(self, v: int) -> bool:
        cur = self.root
        while cur:
            if v == cur.val:
                return True
            cur = cur.left if v < cur.val else cur.right  # 小左大右
        return False                   # 走到 None:全树都不可能有

    # 插入:沿查找路线走到空位安家,O(h)
    def insert(self, v: int) -> None:
        def insert_at(node):
            if node is None:
                return TreeNode(v)     # 空位就是新家
            if v < node.val:
                node.left = insert_at(node.left)
            elif v > node.val:
                node.right = insert_at(node.right)
            return node                # 返回自己让父亲重连
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
                return node.right      # ① 叶子 / ② 只有右孩子
            if node.right is None:
                return node.left       # ② 只有左孩子
            succ = node.right          # ③ 双孩子:找中序后继
            while succ.left:           #    = 右子树一路向左到底
                succ = succ.left
            node.val = succ.val        # 值换后继
            node.right = delete_at(node.right, succ.val)  # 删转右树
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
            hl: [44, 45, 46, 47, 48, 49, 50, 51, 52],
            note: (
              <>
                <b>坑:</b>Python 默认递归深度限制约 1000 ——
                退化成链的 BST 上递归可能爆栈。刷题遇到深树,search/insert
                用迭代写更稳(delete 因为要修补父子链,递归最顺手)。
              </>
            ),
          }}
          js={{
            code: `class TreeNode {                       // 二叉树章的老朋友
  constructor(val = 0) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;                  // 记住根,全树顺藤摸瓜
  }

  // 查找:一路二分下坠,O(h)
  search(v) {
    let cur = this.root;
    while (cur) {
      if (v === cur.val) return true;
      cur = v < cur.val ? cur.left : cur.right; // 小往左,大往右
    }
    return false;                      // 走到 null:全树都不可能有
  }

  // 插入:沿查找路线走到空位安家,O(h)
  insert(v) {
    const insertAt = (node) => {
      if (!node) return new TreeNode(v);      // 空位就是新家
      if (v < node.val) node.left = insertAt(node.left);
      else if (v > node.val) node.right = insertAt(node.right);
      return node;                     // 返回自己让父亲重连
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
      if (!node.left) return node.right;       // ① 叶子 / ② 只有右孩子
      if (!node.right) return node.left;       // ② 只有左孩子
      let succ = node.right;                   // ③ 双孩子:找中序后继
      while (succ.left) succ = succ.left;      //    右子树一路向左到底
      node.val = succ.val;                     // 值换后继
      node.right = deleteAt(node.right, succ.val); // 删转右树
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
            hl: [48, 49, 50, 51, 52, 53],
            note: (
              <>
                <b>提醒:</b>比较用 <code>===</code>;若存的是字符串,
                <code>&lt;</code> 会按字典序比较 —— 想按数值比记得先转换,
                或者把比较函数抽出来作为构造参数(工程写法)。
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §05 平衡的世界 ================= */}
      <Section
        id="balance"
        index="05"
        title="平衡的世界:AVL、红黑树与工程对照"
        desc="概念课,不要求手写 —— 但要能讲出「为什么」和「用什么」"
      >
        <div className="prose">
          <p>
            §02 实验室已经演示过:<strong>有序输入会把 BST 养成一条链</strong>。
            而现实数据偏偏经常有序 —— 按时间戳写入日志、按自增 id 插入记录、
            按字母序导入词表…… 裸 BST 在生产环境几乎必然退化。
            解法的思路很直接:插入删除后,如果某处「歪了」,就<strong>旋转</strong>
            把它扶正。不同的平衡树,区别只在「怎么定义歪」和「歪到什么程度才扶」。
          </p>
        </div>

        <div className="sec-head" style={{ marginTop: 30 }}>
          <span className="sec-index">05·A</span>
          <h3 className="sec-title" style={{ fontSize: 19 }}>
            AVL 树:一点都不许歪
          </h3>
        </div>
        <div className="prose">
          <p>
            AVL(1962,以发明者 Adelson-Velsky 和 Landis 命名)给每个节点定义
            <strong>平衡因子(balance factor)= 左子树高 − 右子树高</strong>,
            并要求任何节点的平衡因子 ∈ {"{-1, 0, 1}"}。一旦插入让某个节点的
            |BF| 达到 2,立刻旋转修复。看最小的例子 —— 依次插入 3、2、1:
          </p>
        </div>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <div className="card">
            <div className="card-kicker">BEFORE · 插入 1 之后</div>
            <MiniTree
              w={260}
              h={210}
              nodes={[
                { id: 0, v: 3, x: 170, y: 34, state: "bad", tag: "BF = +2,歪了!" },
                { id: 1, v: 2, x: 110, y: 104, state: "lit", tag: "BF = +1" },
                { id: 2, v: 1, x: 50, y: 174, tag: "BF = 0" },
              ]}
              edges={[
                [0, 1],
                [1, 2],
              ]}
              caption={
                <>
                  3 的左边高 2 层、右边高 0 层:BF = +2,超标。
                  失衡形状是「左左」—— 解法:<b>右旋</b>。
                </>
              }
            />
          </div>
          <div className="card">
            <div className="card-kicker">AFTER · 对 3 右旋一次</div>
            <MiniTree
              w={260}
              h={210}
              nodes={[
                { id: 0, v: 2, x: 130, y: 34, state: "ok", tag: "BF = 0,正了" },
                { id: 1, v: 1, x: 70, y: 118, tag: "BF = 0" },
                { id: 2, v: 3, x: 190, y: 118, tag: "BF = 0" },
              ]}
              edges={[
                [0, 1],
                [0, 2],
              ]}
              caption={
                <>
                  右旋 = 让左孩子 2 当新根,3 降级成它的右孩子。
                  转完中序还是 1, 2, 3 —— <b>旋转改形状,不改顺序</b>,这是它合法的根本原因。
                </>
              }
            />
          </div>
        </div>
        <div className="prose" style={{ marginTop: 14 }}>
          <p>
            真实的 AVL 还有「左右 / 右左」等组合形状,需要两次旋转,思路相同:
            <strong>把中间大小的那个值转上来当根</strong>。AVL 的性格是完美主义 ——
            高度始终钉在 log n 附近,查找最快;代价是插入删除后旋转频繁,写入偏贵。
          </p>
        </div>

        <div className="sec-head" style={{ marginTop: 34 }}>
          <span className="sec-index">05·B</span>
          <h3 className="sec-title" style={{ fontSize: 19 }}>
            红黑树:不追求完美,只追求够用
          </h3>
        </div>
        <div className="prose">
          <p>
            红黑树(Red-Black Tree)换了个思路:不盯着高度差,
            而是给节点涂色并立五条规矩,通俗版如下:
          </p>
          <ul>
            <li>① 每个节点非红即黑;</li>
            <li>② 根节点是黑的;</li>
            <li>③ 空叶子(null 位置)视为黑;</li>
            <li>④ 红节点的孩子必须是黑 —— <b>不许出现连续两个红</b>;</li>
            <li>⑤ 从任一节点出发,到它下面每个空叶子的路径上,<b>黑节点数量相同</b>。</li>
          </ul>
          <p>
            这五条合起来推出一个漂亮的结论:最长路径最多「黑红相间」,
            最短路径可以「全黑」,而两者黑节点数相同(规矩 ⑤)——
            所以<strong>最长路径 ≤ 最短路径 × 2</strong>,高度被锁死在 O(log n) 量级。
            它允许树「有点歪」,换来的是插入删除平均只要 O(1) 次旋转(AVL 可能一路转上去)。
            <strong>「不追求完美平衡,只追求足够平衡」</strong> ——
            这是典型的工程取舍,也是它统治标准库的原因。
          </p>
        </div>
        <Callout tone="story" title="为什么偏偏是「红黑」?">
          <p>
            1978 年 Guibas 和 Sedgewick 在施乐帕克研究中心整理这套结构时,
            实验室的激光打印机恰好能印<b>红、黑</b>两色 —— 论文里用红色标注特殊节点
            最醒目,名字就这么定了。一台打印机的墨盒,决定了此后五十年教科书的配色。
          </p>
        </Callout>

        <div className="sec-head" style={{ marginTop: 34 }}>
          <span className="sec-index">05·C</span>
          <h3 className="sec-title" style={{ fontSize: 19 }}>
            工程对照:三语言里的「有序容器」
          </h3>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>语言</th>
                <th>有序容器</th>
                <th>底层</th>
                <th>什么时候用它</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Java</b></td>
                <td><code>TreeMap</code> / <code>TreeSet</code></td>
                <td>红黑树</td>
                <td>
                  有序遍历、<code>floorKey</code>/<code>ceilingKey</code>(最近邻)、
                  <code>subMap</code> 范围查询
                </td>
              </tr>
              <tr>
                <td><b>Python</b></td>
                <td>无内置(用 <code>sortedcontainers</code>)</td>
                <td>分块有序列表(效果等价)</td>
                <td>
                  <code>SortedList</code> / <code>SortedDict</code>,LeetCode 环境已预装
                </td>
              </tr>
              <tr>
                <td><b>JavaScript</b></td>
                <td>无内置</td>
                <td>——</td>
                <td>
                  <code>Map</code> 只保留插入顺序;刷题用「数组 + 二分」顶替或手写
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <CodeTabs
          title="ordered_map"
          java={{
            code: `// TreeMap:红黑树加持的有序映射 —— 增删查改全部 O(log n)
TreeMap<Integer, String> map = new TreeMap<>();
map.put(30, "c");
map.put(10, "a");
map.put(20, "b");

map.firstKey();        // 10 —— 最小 key
map.lastKey();         // 30 —— 最大 key
map.floorKey(25);      // 20 —— ≤ 25 的最大 key(地板)
map.ceilingKey(25);    // 30 —— ≥ 25 的最小 key(天花板)

// 遍历天然按 key 升序 —— 不用排序!
for (var e : map.entrySet())
    System.out.println(e.getKey());   // 10, 20, 30

// 范围查询:[10, 25) 内的所有条目,O(log n + k)
map.subMap(10, 25);

// 只要有序集合不要值:TreeSet(底层就是 TreeMap)
TreeSet<Integer> set = new TreeSet<>(List.of(5, 1, 3));
set.first();           // 1`,
            note: (
              <>
                <b>坑:</b>TreeMap 的 key 必须可比较(实现 Comparable
                或传入 Comparator),塞进不可比较的对象会在运行时抛
                ClassCastException —— HashMap 不会提前暴露这个问题。
              </>
            ),
          }}
          python={{
            code: `# Python 标准库没有平衡 BST!两条路:

# ① sortedcontainers(LeetCode 已内置,面试可直接说用它)
from sortedcontainers import SortedList, SortedDict

sl = SortedList([30, 10, 20])   # 始终保持有序:[10, 20, 30]
sl.add(25)                      # O(log n) 插入 → [10, 20, 25, 30]
sl[0], sl[-1]                   # 10, 30 —— 最小 / 最大
sl.bisect_left(25)              # 2 —— 二分定位,配合切片做范围查询
sl.irange(10, 25)               # [10, 20, 25] —— 区间迭代

sd = SortedDict({30: "c", 10: "a"})
list(sd.keys())                 # [10, 30] —— 遍历天然升序

# ② 只读场景:bisect 模块 + 普通 list
import bisect
arr = [10, 20, 30]
bisect.bisect_left(arr, 25)     # 查 O(log n)
bisect.insort(arr, 25)          # 插入 O(n) —— 底层还是数组搬家!`,
            note: (
              <>
                <b>坑:</b><code>bisect.insort</code> 查得快但插入仍是
                O(n)(list 是动态数组,第 1 章的老账)。写入频繁的场景必须上
                SortedList —— 它内部分块,插入均摊 O(log n) 附近。
              </>
            ),
          }}
          js={{
            code: `// JavaScript 没有内置有序映射。
// 注意:Map 遍历顺序 = 插入顺序,不是 key 排序!
const m = new Map();
m.set(30, "c"); m.set(10, "a");
[...m.keys()];              // [30, 10] —— 不会自动排序

// 刷题常用替身:数组 + 二分维护有序
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
arr.splice(lowerBound(arr, 25), 0, 25);  // 有序插入,O(n) 搬家

// 工程:需要真·有序容器时找第三方库,
// 或复用面试写法 —— 自己实现一棵树(§04)`,
            note: (
              <>
                <b>坑:</b>对象的键遍历顺序有一套怪规则(整数键升序、字符串键按插入),
                千万别依赖它当有序容器 —— 需要有序就显式排序或二分维护。
              </>
            ),
          }}
        />
        <Callout tone="deep" title="工程现场:数据库索引为什么用 B+ 树,不用红黑树?">
          <p>
            MySQL(InnoDB)的索引是 B+ 树 —— 同样是「有序树」,为什么不用内存里的王者红黑树?
            因为战场变了:数据在<b>磁盘</b>上,而磁盘按「页」(通常 16KB)整块读取,
            读 1 字节和读 16KB 代价几乎一样。红黑树一个节点存一个 key,树高
            log₂n(百万数据 ≈ 20 层),意味着一次查询最多 20 次磁盘 IO —— 灾难。
            B+ 树让一个节点装满<b>一整页的几百个 key</b>,分叉数几百,
            百万数据只需 3~4 层 —— <b>矮胖的树 = 极少的 IO</b>。
            此外 B+ 树把数据全放叶子层、叶子间用链表串起来:范围扫描
            (<code>WHERE id BETWEEN …</code>)沿链表顺序读就行,不用在树上跳来跳去。
            一句话:<b>红黑树为内存的随机访问而生,B+ 树为磁盘的按页读取而生</b> ——
            结构没有最好,只有最合适的介质。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 套路与精讲 ================= */}
      <Section
        id="patterns"
        index="06"
        title="套路与精讲:BST 题的一把总钥匙"
        desc="见到 BST,先默念:中序 = 升序,比较 = 砍半 —— 三道代表题逐帧拆解"
        badge={<span className="chip" data-tone="warn">★ 面试核心</span>}
      >
        <div className="prose">
          <p>
            BST 的题目八成落在三个套路里:①{" "}
            <strong>利用中序 = 升序</strong>(第 k 小、最小差、验证、恢复);②{" "}
            <strong>利用比较砍半</strong>(搜索、插入、删除、LCA、范围和的剪枝);③{" "}
            <strong>反向构造</strong>(把有序数据变成平衡 BST)。
            三道精讲每个套路各占一道。
          </p>
        </div>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 40 }}>
          <span className="sec-index">精讲 A</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 98 · 验证二叉搜索树
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>判断一棵二叉树是否为合法 BST。
            <b> 大坑:</b>几乎每个人的第一版都是「检查每个节点比左孩子大、比右孩子小」——
            <strong>这是错的</strong>。规矩管的是整棵子树,不是父子俩。
            看这个专门击穿它的反例:
          </p>
        </div>
        <TreeStepper title="LC 98 · 上下界法,逐帧慢放" nodes={N98} edges={E98} frames={F98} h={265} />
        <CodeTabs
          title="lc98_validate_bst"
          java={{
            code: `class Solution {
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
            hl: [8, 9, 10, 11],
            note: (
              <>
                <b>细节:</b>界用 <code>long</code>,因为节点值可能取到{" "}
                <code>Integer.MIN_VALUE</code> / <code>MAX_VALUE</code>,
                int 边界会误判 —— 面试写出这一步是实打实的加分项。
              </>
            ),
          }}
          python={{
            code: `class Solution:
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
            hl: [7, 8, 9, 10],
            note: (
              <>
                <b>顺手:</b><code>lo &lt; node.val &lt; hi</code>{" "}
                的链式比较是 Python 独有的甜头;无穷用{" "}
                <code>float("±inf")</code>,不用担心整数边界。
              </>
            ),
          }}
          js={{
            code: `var isValidBST = function (root) {
  // 每个节点必须落在祖先传下来的开区间 (lo, hi) 内
  const check = (node, lo, hi) => {
    if (!node) return true;              // 空树合法
    if (node.val <= lo || node.val >= hi) return false; // 越界即失败
    return check(node.left, lo, node.val)    // 上界收紧
      && check(node.right, node.val, hi);    // 下界收紧
  };
  return check(root, -Infinity, Infinity);
};`,
            hl: [5, 6, 7],
            note: (
              <>
                <b>顺手:</b>JS 的 <code>±Infinity</code> 跟任何数比较都成立,
                边界处理最省心。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            每个节点检查一次:时间 <b>O(n)</b>,空间 O(h) 递归栈。追问一:
            「另一种解法?」—— <b>中序遍历,检查序列是否严格递增</b>
            (维护 prev,一旦 cur ≤ prev 即失败),原理就是 §02 的性质,两种都要会。
            追问二:「为什么区间是开区间?」—— 题目要求严格小于/大于,
            等号也算违规(重复值不合法)。
          </p>
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 B</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 230 · BST 中第 K 小的元素
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>返回 BST 中第 k 小的元素。<b>暴力:</b>任意遍历收集所有值、
            排序取第 k 个 —— O(n log n),完全没用上 BST。<b>为什么中序:</b>
            排序的活儿 BST 早就干完了 —— 中序遍历<strong>就是</strong>按升序逐个吐数,
            我们只需要一边遍历一边数数,数到 k 立刻刹车:
          </p>
        </div>
        <TreeStepper title="LC 230 · 中序计数(k = 3)" nodes={N230} edges={E230} frames={F230} h={255} />
        <CodeTabs
          title="lc230_kth_smallest"
          java={{
            code: `class Solution {
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
            hl: [10, 11, 12, 13],
          }}
          python={{
            code: `class Solution:
    def kthSmallest(self, root: TreeNode | None, k: int) -> int:
        # 迭代中序:显式栈,数到 k 个直接 return —— 天然提前终止
        stack = []
        cur = root
        count = 0
        while stack or cur:
            while cur:               # 左脊全部入栈
                stack.append(cur)
                cur = cur.left
            cur = stack.pop()        # 弹出 = 按升序访问
            count += 1               # 报数
            if count == k:
                return cur.val       # 第 k 个就是答案
            cur = cur.right          # 转向右子树
        return -1                    # k 合法时不会走到这`,
            hl: [11, 12, 13, 14],
            note: (
              <>
                <b>为什么用迭代:</b>递归提前终止要靠全局标记层层返回,
                迭代版一个 <code>return</code> 干净利落 —— 这段栈模板同时就是
                LC 173(BST 迭代器)的答案。
              </>
            ),
          }}
          js={{
            code: `var kthSmallest = function (root, k) {
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
            hl: [4, 5, 6, 7],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(h + k)</b>(先沉到最左 O(h),再吐 k 个),空间 O(h)。经典追问:
            「如果频繁插入删除,还要频繁查第 k 小呢?」—— 在每个节点上<b>缓存左子树大小</b>:
            查询时若 k ≤ leftSize 往左;k = leftSize + 1 就是自己;否则带着 k − leftSize − 1
            往右 —— 每次 O(h),插删时顺路维护计数即可。这是「树上二分」的进阶形态。
          </p>
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 C</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 108 · 将有序数组转换为平衡 BST
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">EASY</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>把升序数组变成一棵高度平衡的 BST。<b>反面教材:</b>
            把元素逐个 insert —— 有序输入,§02 实验室演过,直接退化成链。
            <b>正解:</b>平衡的本质是「左右人数均等」,而有序数组里谁站中间一目了然:
            <strong>取中点当根,左右两半递归建子树</strong>。
          </p>
        </div>
        <ArrayStepper title="LC 108 · 取中点递归建树" frames={F108} />
        <div className="grid-2" style={{ marginTop: 14 }}>
          <div className="card">
            <div className="card-kicker">建出来的树</div>
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
              caption={<>5 个节点,高度 3 = ⌈log₂(5+1)⌉ —— 完美贴着下限。</>}
            />
          </div>
          <div className="card">
            <div className="card-title">为什么中点能保证平衡?</div>
            <p>
              取中点后,左右两半的长度最多差 1;递归的每一层都维持这个性质,
              于是任何节点的左右子树<b>节点数最多差 1</b> —— 高度差自然不超过 1。
              这其实是把「二分查找的决策树」显式地盖了出来:mid 是根,
              两半是子树,二分走过的每条路都成了树上的一条边。
            </p>
          </div>
        </div>
        <CodeTabs
          title="lc108_sorted_array_to_bst"
          java={{
            code: `class Solution {
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
            hl: [6, 7, 9, 10],
          }}
          python={{
            code: `class Solution:
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
            hl: [4, 5, 6, 8, 9],
          }}
          js={{
            code: `var sortedArrayToBST = function (nums) {
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
            hl: [3, 4, 6, 7],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            每个元素恰好当一次根:时间 <b>O(n)</b>,空间 O(log n) 递归栈。追问:
            「输入换成有序<b>链表</b>呢?」(LC 109)—— 链表找中点要 O(n),
            两个思路:快慢指针找中点(总 O(n log n)),或反过来「中序位置法」:
            先数长度,再按中序顺序边递归边消费链表节点,依然 O(n) ——
            能把这层讲清,这组题就通关了。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title="高频题单:BST 9 题"
        desc="按「基本操作 → 利用有序性 → 结构改造」递进。先想 30 秒再看提示"
        badge={<span className="chip">面试常客</span>}
      >
        <ProblemSet ch="bst" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="7 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="bst" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            一条规矩定乾坤:<b>左 &lt; 根 &lt; 右,且对整棵子树成立</b> ——
            验证、利用它时永远记得「祖先的约束会传下来」(LC 98 的上下界)。
          </>,
          <>
            <b>中序遍历 = 升序</b>:第 k 小、最小差、验证、恢复……
            BST 一大半的题,钥匙都是这一条。
          </>,
          <>
            查找 / 插入 / 删除都是 <b>O(h)</b>:平衡时 h ≈ log n,
            有序插入退化时 h = n —— 说复杂度带上 h 才严谨。
          </>,
          <>
            删除三情况:叶子直接摘、单孩子顶上、双孩子<b>值换中序后继、删转右子树</b>
            (后继必无左孩子,难题自动降级)。
          </>,
          <>
            工程里没人裸奔 BST:Java <code>TreeMap/TreeSet</code>(红黑树,
            足够平衡就好)、Python <code>sortedcontainers</code>、JS 无内置;
            磁盘上的数据库索引则换 <b>B+ 树</b> —— 矮胖省 IO,叶子链表利于范围扫。
          </>,
        ]}
      />

      <ChapterFooter ch="bst" />
    </main>
  );
}
