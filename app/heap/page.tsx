"use client";

// 第 9 章 · 堆与优先队列(Heap / Priority Queue)
// 八段式:直觉(急诊分诊,只关心最值)→ 结构(完全二叉树 + 父≤子,存进数组)→
// 核心操作(HeapLab:push 上浮 / pop 下沉 / O(n) 建堆)→ 手写 MinHeap →
// 三语言对照(PriorityQueue / heapq / 无内置)→ 套路与精讲(Top-K,215/347/23)→
// 题单 → 测验 → 要点。

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
import { PROBLEMS, QUIZ } from "@/lib/heap-data";
import { HeapLab, HeapMapFig } from "./viz";

/* ================= 精讲动画帧 ================= */

// —— 精讲 A · LC 215:数组中第 K 个最大元素。容量 k=2 的小根堆,堆顶=门槛 ——
// 输入 [3,2,1,5,6,4],第 2 大 = 5。格子画的是「当前堆里的内容」。
const F215: ArrayFrame[] = [
  {
    cells: [{ v: 3, state: "ok" }],
    ptrs: [{ i: 0, label: "堆顶=门槛" }],
    msg: (
      <>
        维护一个<b>容量 2 的小根堆</b>,让它永远只装「迄今最大的 2 个」。
        扫到 <b>3</b>:堆没满,直接进。此刻门槛(堆顶,也就是这堆里最小的)= 3。
      </>
    ),
  },
  {
    cells: [{ v: 2, state: "ok" }, { v: 3 }],
    ptrs: [{ i: 0, label: "门槛" }],
    msg: (
      <>
        扫到 <b>2</b>:堆还没满,进,上浮后 2 沉到堆顶。堆满了 ——
        门槛 = 当前 2 个里最小的 <b>2</b>。
      </>
    ),
  },
  {
    cells: [{ v: 2, state: "lit" }, { v: 3 }, { v: 1, state: "bad" }],
    ptrs: [{ i: 0, label: "门槛" }],
    msg: (
      <>
        扫到 <b>1</b>:和门槛 2 比 —— <b>1 &lt; 2</b>,连守门的都比不过,
        没资格进,直接丢弃。堆一动不动。
      </>
    ),
  },
  {
    cells: [{ v: 2, state: "bad" }, { v: 3 }, { v: 5, state: "lit" }],
    ptrs: [{ i: 0, label: "门槛" }],
    msg: (
      <>
        扫到 <b>5</b>:<b>5 &gt; 门槛 2</b>,够格!5 挤进来,同时把最没竞争力的
        门槛 2 踢出去(标准写法:先 push 再 pop 堆顶)。
      </>
    ),
  },
  {
    cells: [{ v: 3, state: "ok" }, { v: 5 }],
    ptrs: [{ i: 0, label: "新门槛" }],
    msg: (
      <>
        踢掉 2、下沉修复后,堆里是 {"{3, 5}"},门槛抬高到 <b>3</b>。
        门槛只会越来越高 —— 这正是我们想要的。
      </>
    ),
  },
  {
    cells: [{ v: 5, state: "ok" }, { v: 6 }],
    ptrs: [{ i: 0, label: "门槛" }],
    msg: (
      <>
        扫到 <b>6</b>:6 &gt; 门槛 3,进,挤掉 3。堆里 {"{5, 6}"},门槛升到 <b>5</b>。
      </>
    ),
  },
  {
    cells: [{ v: 5 }, { v: 6 }, { v: 4, state: "bad" }],
    ptrs: [{ i: 0, label: "门槛" }],
    msg: <>最后扫到 <b>4</b>:4 &lt; 门槛 5,淘汰。</>,
  },
  {
    cells: [{ v: 5, state: "ok" }, { v: 6 }],
    ptrs: [{ i: 0, label: "第 2 大" }],
    msg: (
      <>
        扫完!堆里 {"{5, 6}"} 就是最大的 2 个,堆顶 <b>5</b> 正是第 2 大的元素。
        全程 <b>O(n log k)</b> 时间、<b>O(k)</b> 空间 —— n 上亿而 k 很小时,
        吊打「全排序 O(n log n)」。
      </>
    ),
  },
];

// —— 精讲 B · LC 347:前 K 个高频元素。哈希计数 + 容量 k=2 小根堆(按频次) ——
// 输入 [1,1,1,2,2,3],k=2。格子里画的是「频次」。
const F347: ArrayFrame[] = [
  {
    cells: [{ v: 3, state: "ok" }],
    ptrs: [{ i: 0, label: "堆顶" }],
    msg: (
      <>
        第一步(哈希计数):数字 <b>1</b> 出现 3 次、<b>2</b> 出现 2 次、
        <b>3</b> 出现 1 次。第二步把<b>频次</b>塞进容量 2 的小根堆。
        先放数字 1 的频次 <b>3</b>。
      </>
    ),
  },
  {
    cells: [{ v: 2, state: "ok" }, { v: 3 }],
    ptrs: [{ i: 0, label: "门槛" }],
    msg: (
      <>
        放数字 2 的频次 <b>2</b>,上浮到顶。堆满,门槛 = 入围的最低频次 <b>2</b>。
        (提醒:格子里是<b>频次</b>,不是数字本身。)
      </>
    ),
  },
  {
    cells: [{ v: 2, state: "lit" }, { v: 3 }, { v: 1, state: "bad" }],
    ptrs: [{ i: 0, label: "门槛" }],
    msg: (
      <>
        轮到数字 3 的频次 <b>1</b>:1 &lt; 门槛 2,进不来 —— 数字 3 被淘汰。
      </>
    ),
  },
  {
    cells: [{ v: 2, state: "ok" }, { v: 3 }],
    ptrs: [{ i: 0, label: "门槛" }],
    msg: (
      <>
        堆里剩频次 {"{2, 3}"} → 对应数字 <b>2、1</b>,就是前 2 高频元素。
        计数 O(n)、维护堆 O(n log k),合计 <b>O(n log k)</b>。
        这是你的第一道「哈希 + 堆」组合题。
      </>
    ),
  },
];

// —— 精讲 C · LC 23:合并 K 个升序链表。堆装每条链当前的头 ——
// 链①1→4→5 链②1→3→4 链③2→6。格子里画的是「堆里的结点值」。
const F23: ArrayFrame[] = [
  {
    cells: [{ v: 1, state: "lit" }, { v: 1 }, { v: 2 }],
    ptrs: [{ i: 0, label: "堆顶=最小" }],
    msg: (
      <>
        3 条升序链:1→4→5、1→3→4、2→6。把三个<b>头结点</b>丢进小根堆
        {" "}{"{1, 1, 2}"}。堆顶 1 一定是全局最小 ——
        也就是答案里下一个该接的数。
      </>
    ),
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 2 }, { v: 4 }],
    ptrs: [{ i: 0, label: "堆顶" }],
    msg: (
      <>
        弹出堆顶 <b>1</b>(来自链①)接到答案;把链① 的下一个 <b>4</b> 补进堆。
        堆变 {"{1, 2, 4}"}。<br />
        输出:<b>1</b>
      </>
    ),
  },
  {
    cells: [{ v: 2, state: "ok" }, { v: 4 }, { v: 3 }],
    ptrs: [{ i: 0, label: "堆顶" }],
    msg: (
      <>
        弹出 <b>1</b>(来自链②),补进链② 的 <b>3</b>。堆 {"{2, 3, 4}"}。<br />
        输出:<b>1 1</b>
      </>
    ),
  },
  {
    cells: [{ v: 3, state: "ok" }, { v: 4 }, { v: 6 }],
    ptrs: [{ i: 0, label: "堆顶" }],
    msg: (
      <>
        弹出 <b>2</b>(来自链③),补进 <b>6</b>。堆 {"{3, 4, 6}"}。<br />
        输出:<b>1 1 2</b>
      </>
    ),
  },
  {
    cells: [{ v: 4 }, { v: 4 }, { v: 6 }],
    ptrs: [{ i: 0, label: "堆顶" }],
    msg: (
      <>
        弹 <b>3</b> 补链② 的 <b>4</b>。堆 {"{4, 4, 6}"}。<br />
        输出:<b>1 1 2 3</b>
      </>
    ),
  },
  {
    cells: [{ v: 5, state: "lit" }, { v: 6 }],
    ptrs: [{ i: 0, label: "堆顶" }],
    msg: (
      <>
        接连弹出两个 <b>4</b>,链②走到尽头(没得补),链① 补进 <b>5</b>。
        堆缩到 {"{5, 6}"}。<br />
        输出:<b>1 1 2 3 4 4</b>
      </>
    ),
  },
  {
    cells: [{ v: 5, state: "ok" }, { v: 6, state: "ok" }],
    ptrs: [{ i: 0, label: "堆顶" }],
    msg: (
      <>
        再弹 <b>5</b>、<b>6</b>,堆空,合并完成。<br />
        输出:<b>1 1 2 3 4 4 5 6</b><br />
        共 N 个结点,每个进出堆各一次、每次 O(log k) → <b>O(N log k)</b>,
        空间 O(k)(堆里最多 K 个头)。
      </>
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: "直觉" },
  { id: "shape", n: "02", label: "结构长什么样" },
  { id: "ops", n: "03", label: "核心操作" },
  { id: "impl", n: "04", label: "手写实现" },
  { id: "langs", n: "05", label: "三语言对照" },
  { id: "patterns", n: "06", label: "套路与精讲" },
  { id: "problems", n: "07", label: "高频题单" },
  { id: "quiz", n: "08", label: "通关测验" },
];

export default function HeapChapter() {
  return (
    <main className="page" data-ch="heap">
      <Hero
        ch="heap"
        title={
          <>
            堆 <span className="grad">Heap</span>
          </>
        }
        essence={
          <>
            一支永远把最重要的病人推到你面前的队伍。它偏不做「全排序」那种力气活 ——
            只<strong>承诺一件事:堆顶是当前的最值</strong>,而取走它、塞进新的,
            都只要 <strong>O(log n)</strong>。承诺得少,所以跑得快。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 直觉 ================= */}
      <Section
        id="intuition"
        index="01"
        title="为什么需要它:急诊室不是先来先看"
        desc="只关心「谁最要紧」的时候,给全部人排队是一种浪费"
      >
        <div className="prose">
          <p>
            普通食堂窗口是<strong>先来先服务</strong>(这就是上一章的队列 Queue)。
            但急诊室不能这么干 —— 心梗病人五分钟前才到,也得立刻推进手术室,
            而不是排在崴脚的人后面。急诊台做的事叫<strong>分诊(triage)</strong>:
            每次都把<strong>当前最危重</strong>的病人叫进去;至于剩下的人谁排第二、
            谁排第三,<strong>没人去操心</strong>—— 反正下一个还得重新挑最重的。
          </p>
          <p>
            这就是<strong>堆(heap)</strong>的全部使命:在一堆不断进出的数据里,
            <strong>随时 O(1) 报出最值、O(log n) 取走它或塞进新值</strong>。
            注意「随时进出」这四个字 —— 数据不是一次给全的,分诊台前的人一直在来。
          </p>
          <p>
            有人会问:那我把所有人<strong>排个序</strong>不就行了,最重的站第一个?
            可以,但那是<strong>杀鸡用牛刀</strong>。排序 O(n log n) 帮你把
            <strong>全部 n 个人</strong>的先后都定死了,而你每次只想要<strong>一个</strong>
            最值。更要命的是:每来一个新病人,有序数组要<strong>搬家 O(n)</strong>
            才能把他插到正确位置(第 1 章的老账)。堆的哲学正好相反 ——
            <strong>只维护「谁是老大」,绝不多管闲事</strong>,于是插入/取走都便宜到 O(log n)。
          </p>
          <p>
            先厘清两个常被混为一谈的词。<strong>优先队列(priority queue)</strong>是一种
            <strong>抽象需求</strong>:「我要一个能不断塞东西、又能随时取出优先级最高者的容器」;
            而<strong>堆</strong>是满足这个需求最流行的<strong>实现方案</strong>。
            就像「排序」是需求、「快排」是实现。几乎所有语言的
            <code>PriorityQueue</code> / <code>heapq</code> 底层都是堆 —— 本章学的,
            正是那台引擎。
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">特性 01</div>
            <div className="card-title">🎯 只承诺堆顶</div>
            <p>
              它<b>只</b>保证一件事:堆顶是全场最值(最小或最大)。剩下的元素
              谁前谁后、兄弟之间大小如何,一概<b>不保证</b>。承诺越少,维护越省。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">特性 02</div>
            <div className="card-title">⚡ 进出都 O(log n)</div>
            <p>
              插入一个新值、取走当前最值,都只需走<b>一条树高的路</b> ——
              O(log n)。看堆顶(不取走)甚至是 O(1)。这是它能扛住「数据流」的底气。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">特性 03</div>
            <div className="card-title">🚀 优先队列的引擎</div>
            <p>
              任务调度、Dijkstra 最短路、Huffman 编码、Top-K、合并 K 路……
              一切「反复取最值」的场景,底下几乎都是堆在转。
            </p>
          </div>
        </div>
        <Callout tone="story" title="一个名字,两样东西">
          <p>
            初学最容易踩的坑:<b>本章的「堆」和内存管理里的「堆内存(heap memory)」
            毫无关系</b>,纯属重名。后者是程序运行时动态分配对象的那片内存区
            (与「栈内存」相对)。本章的堆是一种<b>数据结构</b> ——
            一棵长成特定形状的树。看到「堆」先分清语境,别把两个概念焊在一起。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 结构 ================= */}
      <Section
        id="shape"
        index="02"
        title="结构长什么样:两条规矩 + 一个藏身之所"
        desc="它是一棵特殊的二叉树,却根本不用指针 —— 整棵树塞进一个数组"
      >
        <div className="prose">
          <p>
            堆是一棵二叉树,但只守<strong>两条规矩</strong>,一条管形状、一条管顺序:
          </p>
        </div>
        <div className="grid-2" style={{ marginTop: 8 }}>
          <div className="card">
            <div className="card-kicker">规矩 ① · 管形状</div>
            <div className="card-title">🌳 完全二叉树</div>
            <p>
              <b>完全二叉树(complete binary tree)</b>:除了最后一层,每层都塞满;
              最后一层的结点<b>全部靠左排</b>,中间不留空洞(第 7 章二叉树见过它)。
              这条规矩保证树<b>又矮又胖</b> —— n 个结点高度恒为 ⌊log₂n⌋,
              而且没有一个位置被浪费,这正是它能塞进数组的前提。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">规矩 ② · 管顺序</div>
            <div className="card-title">⚖️ 父 ≤ 子(小根堆)</div>
            <p>
              <b>每个父结点 ≤ 它的每个孩子</b>。层层递推,根自然成了全树最小 ——
              这就是<b>小根堆(min-heap)</b>。注意它<b>只</b>约束父子这一条链:
              <b>兄弟之间毫无关系</b>,左孩子可以比右孩子大。父 ≥ 子则是
              <b>大根堆(max-heap)</b>,堆顶是最大值,规矩完全对称。
            </p>
          </div>
        </div>
        <Callout tone="warn" title="最常见的误解:堆 ≠ 排好序的数组">
          <p>
            很多人以为堆就是「从小到大排好的树」。<b>不是</b>。堆只保证每条
            「父 → 子」的链是有序的,<b>兄弟、堂兄弟之间完全乱序</b>。
            所以堆的底层数组打印出来往往像 <code>[1, 3, 2, 7, 4, 5]</code> ——
            看着不像升序,但它是合法的堆(1≤3、1≤2、3≤7、3≤4、2≤5,每条父子链都成立)。
            正因为「只排一条链、不排全体」,维护成本才从 O(n log n) 掉到 O(log n)。
          </p>
        </Callout>

        <div className="prose" style={{ marginTop: 22 }}>
          <p>
            现在是最妙的地方。规矩 ① 说完全二叉树「没有空洞」——
            于是我们可以把结点<strong>按层、从左到右编号</strong>(根是 0,
            往下一层是 1、2,再一层 3、4、5、6……),然后<strong>直接铺进一个数组</strong>,
            编号就是下标。<strong>指针?一个都不需要</strong>。父子关系全靠三条公式<strong>算</strong>出来:
          </p>
        </div>
        <HeapMapFig />
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table className="t-table">
            <thead>
              <tr>
                <th>已知下标 i,要找</th>
                <th>公式</th>
                <th>例(i = 4)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>父结点</b> parent</td>
                <td><code>(i − 1) / 2</code>(整数除法,向下取整)</td>
                <td>(4 − 1) / 2 = <b>1</b></td>
              </tr>
              <tr>
                <td><b>左孩子</b> left</td>
                <td><code>2i + 1</code></td>
                <td>2×4 + 1 = <b>9</b></td>
              </tr>
              <tr>
                <td><b>右孩子</b> right</td>
                <td><code>2i + 2</code></td>
                <td>2×4 + 2 = <b>10</b></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            这一招是不是眼熟?序章讲数组时,元素地址 = <code>首地址 + 下标 × 元素大小</code>,
            也是<strong>用算的,不用存的</strong>。堆把这套「地址算术」从「数组元素」
            升级到了「树的父子关系」—— 同一个思想的第二次登场。
            省掉指针带来两个实打实的好处:<strong>不占额外内存</strong>
            (链式二叉树每个结点要存两根指针),而且元素在内存里连续排列,
            <strong>CPU 缓存友好</strong>(又是第 1 章的缓存红利)。
          </p>
        </div>
        <Callout tone="idea" title="下标从 1 开始会更省事吗?">
          <p>
            有些教科书让堆从下标 <b>1</b> 起步,公式会漂亮一点:父 = <code>i / 2</code>、
            左孩子 = <code>2i</code>、右孩子 = <code>2i + 1</code>,少几个 ±1。
            代价是浪费下标 0。工程实现(Java <code>PriorityQueue</code>、Python
            <code>heapq</code>)都从 <b>0</b> 开始,不浪费空间;本章也统一用 0 起步的公式。
            两套都对,别混用就行。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 核心操作 ================= */}
      <Section
        id="ops"
        index="03"
        title="核心操作:上浮、下沉,和一次神奇的建堆"
        desc="所有操作就干一件事 —— 让「破坏了父≤子的那个元素」走回它该待的位置"
        badge={<span className="chip" data-tone="idea">动手玩</span>}
      >
        <div className="prose">
          <p>
            堆只有两个招牌动作,而且互为镜像:插入时元素从底往上找位置,叫
            <strong>上浮(sift up)</strong>;删除时元素从顶往下找位置,叫
            <strong>下沉(sift down)</strong>。在下面的实验室里亲手 push / pop 几次,
            盯着<strong>同一份数据的树视图和数组视图</strong>一起变 —— 你会发现所谓
            「堆操作」不过是<strong>反复比较一对父子、不合规就交换</strong>,
            一路走到不用再换为止。
          </p>
        </div>
        <HeapLab />

        <div className="prose" style={{ marginTop: 24 }}>
          <p>
            把刚才看到的拆成慢镜头。<strong>push(插入)</strong>分两步:
          </p>
          <ol>
            <li>
              <b>① 放到数组尾部</b> = 完全二叉树的下一个空位。这一步保证「形状」规矩不破。
            </li>
            <li>
              <b>② 上浮</b>:新值和父结点比,比父亲小就交换,换上去再和新的父亲比……
              直到「不比父亲小」或「到根了」为止。因为它最多从最底层走到根,
              走的步数 ≤ 树高 = <b>O(log n)</b>。
            </li>
          </ol>
          <p>
            <strong>pop(弹出最值)</strong>是镜像的三步:
          </p>
          <ol>
            <li>
              <b>① 记下堆顶</b>(它就是答案 —— 小根堆里的最小值)。
            </li>
            <li>
              <b>② 尾巴补位</b>:把数组最后一个元素搬到堆顶。为什么是它?
              因为删掉尾巴不破坏「完全二叉树」的形状,而删掉别的位置会戳出一个洞。
            </li>
            <li>
              <b>③ 下沉</b>:补上来的这个值多半太大了,让它和<b>两个孩子里较小的那个</b>
              比,若比孩子大就交换、跟着下去,直到「比两个孩子都小」或「没有孩子」为止。
              同样 ≤ 树高,<b>O(log n)</b>。
            </li>
          </ol>
          <p>
            下沉时<strong>为什么必须挑「较小的孩子」换?</strong>假设你图省事换了较大的孩子,
            那这个较大的孩子换上去当了父亲,却还有个更小的兄弟在它下面 ——
            「父 ≤ 子」当场违反。只有把<strong>较小的</strong>提上来,才能同时压住两个孩子。
          </p>
        </div>
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
                <td><b>peek</b> 看堆顶(取最值不删)</td>
                <td><BigO o="1" /></td>
                <td>堆顶就是数组第 0 格,直接读,不碰任何别的元素</td>
              </tr>
              <tr>
                <td><b>push</b> 插入</td>
                <td><BigO o="logn" /></td>
                <td>放尾部 O(1) + 上浮,上浮路径最长就是一条「叶到根」,≤ 树高</td>
              </tr>
              <tr>
                <td><b>pop</b> 弹出最值</td>
                <td><BigO o="logn" /></td>
                <td>尾巴补顶 + 下沉,下沉路径最长是一条「根到叶」,≤ 树高</td>
              </tr>
              <tr>
                <td><b>heapify</b> 把已有数组建成堆</td>
                <td><BigO o="n" /></td>
                <td>自底向上逐个下沉,总步数收敛到 O(n)(下面细说)</td>
              </tr>
              <tr>
                <td>逐个 push 建堆</td>
                <td><BigO o="nlogn" /></td>
                <td>n 次插入,每次 O(log n) —— 能用 heapify 就别这么建</td>
              </tr>
              <tr>
                <td>查找 / 删除<b>任意</b>值(非堆顶)</td>
                <td><BigO o="n" /></td>
                <td>堆不为「找中间某个值」优化,只能线性扫 —— 这不是它的活</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="prose" style={{ marginTop: 26 }}>
          <p>
            表里最反直觉的一行是 <strong>heapify —— 把一个乱序数组原地整理成堆,
            只要 O(n)</strong>。凭直觉「n 个元素、每个可能下沉 log n 步」应该是 O(n log n) 才对,
            凭什么是 O(n)?点一下实验室里的<strong>「随机数组建堆」</strong>按钮,
            数一数它到底交换了几次 —— 通常远小于你的预期。奥妙在于:
          </p>
        </div>
        <Callout tone="deep" title="为什么建堆是 O(n) 而不是 O(n log n)">
          <p>
            做法是<b>从最后一个父结点(下标 n/2 − 1)倒着到 0,逐个下沉</b> ——
            这叫 Floyd 建堆。关键在「谁下沉得远」:一棵完全二叉树,
            <b>约一半的结点是叶子</b>(它们在最底层,下沉 <b>0</b> 步);
            上一层约 1/4 的结点最多沉 <b>1</b> 步;再上一层约 1/8 最多沉 <b>2</b> 步……
            <b>越能沉得深的结点,数量越稀少</b>。把总步数加起来:
            Σ (n / 2<sup>d+1</sup>) × d,这个级数收敛到 <b>2n</b> 附近,也就是
            <b>O(n)</b>。反过来,逐个 push 建堆是「让每个新人都从底往<b>根</b>爬」,
            爬得最远的恰恰是数量最多的底层结点 —— 一坏一好,差了一个 log。
            记住结论:<b>已有一整批数据 → 用 heapify(O(n));数据流式到来 → 只能逐个 push</b>。
          </p>
        </Callout>
        <Callout tone="warn" title="别拿堆当「有序容器」用">
          <p>
            堆擅长「反复要最值」,但它<b>不擅长</b>三件事:① 查找某个特定值(要 O(n));
            ② 按顺序输出全部元素(得连续 pop n 次,总 O(n log n) —— 这其实就是
            <b>堆排序</b>);③ 找第二小、第三小(堆顶只有一个,想要第二得先 pop 掉第一)。
            需要「随时按序查询、范围查询」请回去找第 8 章的 BST / TreeMap。
            选错结构是面试和工程里最贵的错。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 手写实现 ================= */}
      <Section
        id="impl"
        index="04"
        title="手写一个 MinHeap:40 行,五脏俱全"
        desc="push / pop / peek / siftUp / siftDown / heapify —— 逐行注释,复制即可跑"
      >
        <div className="prose">
          <p>
            把 §03 的动作翻译成代码。核心就三个私有方法:<code>siftUp</code>(上浮)、
            <code>siftDown</code>(下沉),外加静态的 <code>heapify</code>(O(n) 建堆);
            <code>push</code> / <code>pop</code> 只是把「改数组 + 修复堆序」拼起来。
            底层用一个普通数组(动态数组)存,父子全靠 §02 的三条公式算。
            建议先盖住代码,自己默写一遍 <code>siftDown</code> ——
            「挑较小的孩子」那一步,是最容易写错的地方。
          </p>
        </div>
        <CodeTabs
          title="MinHeap"
          java={{
            code: `class MinHeap {
    private int[] a;      // 底层数组:完全二叉树按层铺平
    private int size;     // 实际存了几个

    public MinHeap(int cap) { a = new int[Math.max(1, cap)]; }

    public int peek() {                 // 看最值,O(1)
        if (size == 0) throw new RuntimeException("堆空");
        return a[0];                    // 堆顶永远在下标 0
    }

    public void push(int x) {           // 插入,O(log n)
        if (size == a.length) grow();   // 满了先扩容
        a[size] = x;                    // ① 放到数组尾 = 树的下一个空位
        siftUp(size);                   // ② 上浮到该待的地方
        size++;
    }

    public int pop() {                  // 弹出最值,O(log n)
        int top = a[0];                 // ① 记下堆顶(答案)
        a[0] = a[--size];               // ② 尾巴补到堆顶(不破坏形状)
        siftDown(0);                    // ③ 下沉修复堆序
        return top;
    }

    private void siftUp(int i) {        // 和父亲比,更小就往上换
        while (i > 0) {
            int p = (i - 1) / 2;        // 父结点下标
            if (a[i] >= a[p]) break;    // 不比爸爸小 → 到位,停
            swap(i, p);
            i = p;
        }
    }

    private void siftDown(int i) {      // 和"较小的孩子"比,更大就往下换
        while (true) {
            int l = 2 * i + 1, r = 2 * i + 2, m = i;
            if (l < size && a[l] < a[m]) m = l;   // 左孩子更小?
            if (r < size && a[r] < a[m]) m = r;   // 右孩子更小?挑最小的
            if (m == i) break;          // 比两个孩子都小(或没孩子)→ 停
            swap(i, m);
            i = m;
        }
    }

    // 把任意数组 O(n) 建成堆:从最后一个父结点倒着下沉
    public static MinHeap heapify(int[] data) {
        MinHeap h = new MinHeap(data.length);
        System.arraycopy(data, 0, h.a, 0, data.length);
        h.size = data.length;
        for (int i = h.size / 2 - 1; i >= 0; i--) h.siftDown(i);
        return h;
    }

    public int size() { return size; }
    private void swap(int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
    private void grow() { a = java.util.Arrays.copyOf(a, a.length * 2); }
}`,
            hl: [24, 25, 26, 27, 28, 29, 30, 31],
            note: (
              <>
                <b>坑:</b>比较用 <code>a[i] &gt;= a[p]</code>(相等时不换),
                能避免相等元素之间无意义的来回交换。想要<b>大根堆</b>?
                把两处 <code>&lt;</code> / <code>&gt;=</code> 的方向全部反过来即可,
                结构一模一样。
              </>
            ),
          }}
          python={{
            code: `class MinHeap:
    def __init__(self):
        self.a = []                      # 直接用 list 当底层数组

    def peek(self):                      # 看最值,O(1)
        return self.a[0]                 # 堆顶永远在下标 0

    def push(self, x):                   # 插入,O(log n)
        self.a.append(x)                 # ① 放到尾部
        self._sift_up(len(self.a) - 1)   # ② 上浮

    def pop(self):                       # 弹出最值,O(log n)
        top = self.a[0]                  # ① 记下堆顶
        last = self.a.pop()              # 摘掉尾巴
        if self.a:                       # 堆还没空
            self.a[0] = last             # ② 尾巴补到堆顶
            self._sift_down(0)           # ③ 下沉修复
        return top

    def _sift_up(self, i):               # 和父亲比,更小就往上换
        while i > 0:
            p = (i - 1) // 2             # 父结点下标
            if self.a[i] >= self.a[p]:   # 不比爸爸小 → 停
                break
            self.a[i], self.a[p] = self.a[p], self.a[i]
            i = p

    def _sift_down(self, i):             # 和"较小的孩子"比,更大就往下换
        n = len(self.a)
        while True:
            l, r, m = 2 * i + 1, 2 * i + 2, i
            if l < n and self.a[l] < self.a[m]:  # 左孩子更小?
                m = l
            if r < n and self.a[r] < self.a[m]:  # 右孩子更小?挑最小
                m = r
            if m == i:                   # 比孩子都小(或没孩子)→ 停
                break
            self.a[i], self.a[m] = self.a[m], self.a[i]
            i = m

    @classmethod
    def heapify(cls, data):              # O(n) 建堆
        h = cls()
        h.a = list(data)
        for i in range(len(h.a) // 2 - 1, -1, -1):
            h._sift_down(i)
        return h`,
            hl: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
            note: (
              <>
                <b>现实里别手写:</b>Python 标准库 <code>heapq</code> 就是这段的
                C 语言优化版(<code>heappush</code>/<code>heappop</code>/<code>heapify</code>)。
                这里手写只为看清内部;§05 教你怎么直接用 <code>heapq</code>。
              </>
            ),
          }}
          js={{
            code: `class MinHeap {
  constructor() {
    this.a = [];                        // 底层数组
  }

  peek() {                              // 看最值,O(1)
    return this.a[0];                   // 堆顶永远在下标 0
  }

  push(x) {                             // 插入,O(log n)
    this.a.push(x);                     // ① 放到尾部
    this.#siftUp(this.a.length - 1);    // ② 上浮
  }

  pop() {                               // 弹出最值,O(log n)
    const top = this.a[0];              // ① 记下堆顶
    const last = this.a.pop();          // 摘掉尾巴
    if (this.a.length) {                // 堆还没空
      this.a[0] = last;                 // ② 尾巴补到堆顶
      this.#siftDown(0);                // ③ 下沉修复
    }
    return top;
  }

  #siftUp(i) {                          // 和父亲比,更小就往上换
    while (i > 0) {
      const p = (i - 1) >> 1;           // 父结点下标(>>1 = 整除 2)
      if (this.a[i] >= this.a[p]) break;// 不比爸爸小 → 停
      [this.a[i], this.a[p]] = [this.a[p], this.a[i]];
      i = p;
    }
  }

  #siftDown(i) {                        // 和"较小的孩子"比,更大就往下换
    const n = this.a.length;
    while (true) {
      let l = 2 * i + 1, r = 2 * i + 2, m = i;
      if (l < n && this.a[l] < this.a[m]) m = l;  // 左孩子更小?
      if (r < n && this.a[r] < this.a[m]) m = r;  // 右孩子更小?挑最小
      if (m === i) break;               // 比孩子都小(或没孩子)→ 停
      [this.a[i], this.a[m]] = [this.a[m], this.a[i]];
      i = m;
    }
  }

  static heapify(data) {                // O(n) 建堆
    const h = new MinHeap();
    h.a = [...data];
    for (let i = (h.a.length >> 1) - 1; i >= 0; i--) h.#siftDown(i);
    return h;
  }
}`,
            hl: [26, 27, 28, 29, 30, 31, 32, 33, 34],
            note: (
              <>
                <b>为什么你必须会背这段:</b>JavaScript <b>没有</b>内置堆 / 优先队列
                (§05 详述)。刷题时经常得当场手写一个,把这 40 行练到闭眼能写,
                笔试遇到 Top-K、Dijkstra 才不慌。
              </>
            ),
          }}
        />
        <Callout tone="win" title="检验你真的懂了">
          <p>
            合上代码回答三题:① <code>pop</code> 为什么是「拿<b>尾巴</b>补堆顶」,
            而不是「拿某个孩子补」?(答:只有删尾巴不破坏完全二叉树的形状)
            ② <code>siftDown</code> 里 <code>if (m === i) break</code> 什么时候触发?
            (答:当前结点已经 ≤ 两个孩子,或它根本没有孩子 —— 到底了)
            ③ 把这个小根堆改成大根堆,最少要改几处?(答:两处比较符方向)。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 三语言对照 ================= */}
      <Section
        id="langs"
        index="05"
        title="三语言对照:两个自带引擎,一个要你自己造"
        desc="Java 给你 PriorityQueue,Python 给你 heapq,JavaScript 什么都没给"
      >
        <div className="prose">
          <p>
            §04 是为了理解原理,真刷题时别重复造轮子。三种语言的「出厂配置」
            差得很远:Java 有开箱即用的 <code>PriorityQueue</code>;Python 有一组
            操作 list 的 <code>heapq</code> 函数;而 <strong>JavaScript
            连内置堆都没有</strong> —— 这也是上一节要你背下手写堆的原因。
            三个共同的大坑先记住:<strong>默认都是小根堆</strong>
            (Java/Python),想要大根堆得动手;<strong>遍历堆不保证有序</strong>,
            要有序只能一个个弹。
          </p>
        </div>
        <CodeTabs
          title="heap_stdlib"
          java={{
            code: `import java.util.*;

// Java:PriorityQueue 默认小根堆,增删查一条龙
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
minHeap.offer(5);
minHeap.offer(1);
minHeap.offer(3);
minHeap.peek();     // 1 —— 看堆顶,不删,O(1)
minHeap.poll();     // 1 —— 弹出最小,O(log n)

// 大根堆:传一个反序比较器
PriorityQueue<Integer> maxHeap =
    new PriorityQueue<>(Comparator.reverseOrder());

// 自定义排序:比如按 [距离, id] 的距离排(小根)
PriorityQueue<int[]> pq =
    new PriorityQueue<>((x, y) -> Integer.compare(x[0], y[0]));

// 批量建堆 O(n):构造器直接吞一个集合
PriorityQueue<Integer> h = new PriorityQueue<>(List.of(5, 1, 3));`,
            note: (
              <>
                <b>两个坑:</b>① 遍历(<code>for (int x : pq)</code>、
                <code>toString()</code>)走的是底层数组,<b>顺序无意义</b> ——
                想要升序只能反复 <code>poll()</code>。② 比较器别写
                <code>x[0] - y[0]</code>:两数一正一负相减可能溢出,老实用
                <code>Integer.compare</code>。
              </>
            ),
          }}
          python={{
            code: `import heapq

# Python:heapq 是一组操作普通 list 的函数(不是类!),默认小根堆
nums = [5, 1, 3]
heapq.heapify(nums)          # 原地 O(n) 建堆 → [1, 5, 3]
heapq.heappush(nums, 2)      # 插入,O(log n)
heapq.heappop(nums)          # 1 —— 弹出最小,O(log n)
nums[0]                      # peek:看最小,O(1)

# 只有小根堆!要大根堆 → 全程存"负数"这个经典技巧
maxq = []
heapq.heappush(maxq, -5)     # 存进去取负
top = -heapq.heappop(maxq)   # 弹出来再取负还原 → 5

# 现成的 Top-K,内部就是容量 k 的堆,不用手搓
heapq.nlargest(2, nums)      # 前 2 大
heapq.nsmallest(2, nums)     # 前 2 小

# 复合元素:打包成元组,按第 1 项比;第 1 项相等再比第 2 项
heapq.heappush(pq, (freq, word))`,
            note: (
              <>
                <b>坑:</b>元组比较到某一项是<b>不可比较类型</b>(比如两个 freq
                相等,却要接着比后面的自定义对象)会抛 <code>TypeError</code>。
                惯用解法:塞一个<b>自增序号</b>当「平局裁判」放在中间,如
                <code>(freq, idx, obj)</code> —— 序号永不重复,绝不会比到 obj。
              </>
            ),
          }}
          js={{
            code: `// JavaScript 没有内置堆 / 优先队列!两条路:

// ① 刷题手写(§04 那 40 行,面试也够用)
const h = new MinHeap();
h.push(5);
h.push(1);
h.peek();           // 1
h.pop();            // 1

// ② LeetCode 环境预装了第三方包,可直接 require
const { MinPriorityQueue, MaxPriorityQueue } =
  require('@datastructures-js/priority-queue');

const pq = new MinPriorityQueue();
pq.enqueue(5);
pq.enqueue(1);
pq.front();         // { element: 1, priority: 1 } —— 看堆顶
pq.dequeue();       // 弹出最小

// 自定义优先级:priority 越小越先出
const q = new MinPriorityQueue({ priority: (x) => x.dist });`,
            note: (
              <>
                <b>血泪坑:</b>千万别用 <code>arr.sort()</code> 冒充堆 ——
                每次插入后重排是 O(n log n),堆「单次 O(log n)」的意义全丢了,
                大数据直接超时。稳妥做法:面试手写堆;做题时若评测机版本不确定,
                手写堆比赌第三方包 API 更保险。
              </>
            ),
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>操作</th>
                <th>Java <code>PriorityQueue</code></th>
                <th>Python <code>heapq</code></th>
                <th>JavaScript(手写 / 第三方)</th>
                <th>复杂度</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>建空小根堆</td>
                <td><code>new PriorityQueue&lt;&gt;()</code></td>
                <td><code>[]</code>(配合 heapq)</td>
                <td><code>new MinHeap()</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>看堆顶 peek</td>
                <td><code>pq.peek()</code></td>
                <td><code>h[0]</code></td>
                <td><code>h.peek()</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>插入 push</td>
                <td><code>pq.offer(x)</code></td>
                <td><code>heapq.heappush(h, x)</code></td>
                <td><code>h.push(x)</code></td>
                <td><BigO o="logn" /></td>
              </tr>
              <tr>
                <td>弹出最值 pop</td>
                <td><code>pq.poll()</code></td>
                <td><code>heapq.heappop(h)</code></td>
                <td><code>h.pop()</code></td>
                <td><BigO o="logn" /></td>
              </tr>
              <tr>
                <td>元素个数</td>
                <td><code>pq.size()</code></td>
                <td><code>len(h)</code></td>
                <td><code>h.size()</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>批量建堆</td>
                <td><code>new PriorityQueue&lt;&gt;(coll)</code></td>
                <td><code>heapq.heapify(h)</code></td>
                <td><code>MinHeap.heapify(a)</code></td>
                <td><BigO o="n" /></td>
              </tr>
              <tr>
                <td>大根堆</td>
                <td><code>Comparator.reverseOrder()</code></td>
                <td>元素取负存入</td>
                <td>传比较器 / 存负数</td>
                <td>—</td>
              </tr>
              <tr>
                <td>Top-K 捷径</td>
                <td>(自己维护容量 K 堆)</td>
                <td><code>heapq.nlargest(k, h)</code></td>
                <td>(自己维护容量 K 堆)</td>
                <td><BigO o="nlogn" label="O(n log k)" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ================= §06 套路与精讲 ================= */}
      <Section
        id="patterns"
        index="06"
        title="套路与精讲:Top-K 与那把「反过来的锁」"
        desc="见到「第 K 大 / 前 K 个 / 合并 K 路」,先想堆 —— 三道代表题逐帧拆解"
        badge={<span className="chip" data-tone="warn">★ 面试核心</span>}
      >
        <div className="prose">
          <p>
            堆的题目八成落在三个套路里:①{" "}
            <strong>Top-K</strong>(求第 K 大/小、前 K 个高频/最近);②{" "}
            <strong>反复取最值 + 动态塞回</strong>(每步贪心地取当前最值,取完还要放新值,
            如任务调度、重构字符串、最后的石头);③{" "}
            <strong>合并 K 路有序序列</strong>(K 条链表 / K 行矩阵归并)。
            本节三道精讲各挑一个套路的代表。先讲透 Top-K 里那个最反直觉的点。
          </p>
        </div>
        <Callout tone="idea" title="Top-K 总纲:求「第 K 大」,偏要用「小根堆」">
          <p>
            新手直觉:求第 K <b>大</b>,当然用大根堆嘛?<b>恰恰相反</b> ——
            标准解法是<b>容量为 K 的小根堆</b>。想通这一点,Top-K 就通关一半。
            道理是这样的:我们只想留住「最大的 K 个」,并随时能<b>踢掉其中最弱的</b>
            (给新来的更强者腾位)。「这 K 个里最弱的」= 这 K 个里的<b>最小值</b>,
            要随时 O(1) 拿到最小值 → <b>小根堆</b>。于是堆顶成了<b>入围门槛</b>:
            新数只有<b>比门槛大</b>才配进来(顺手挤走旧门槛),比门槛小直接淘汰。
            扫完 n 个数,堆里正是最大的 K 个,<b>堆顶就是第 K 大</b>。
            对称地:求第 K <b>小</b> → 容量 K 的<b>大根堆</b>,堆顶是「K 个里最大的」门槛。
            <b>要留谁,就用能随时报出这批人里「最该被踢者」的那种堆。</b>
          </p>
        </Callout>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 40 }}>
          <span className="sec-index">精讲 A</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 215 · 数组中第 K 个最大元素
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>返回数组里第 k 个最大的元素(不是第 k 个<b>不同</b>的,
            重复算数)。<b>暴力:</b>整个数组排序 O(n log n),取倒数第 k 个 ——
            能过,但为了一个数把全部顺序都算出来,浪费。<b>正解:</b>套上面的总纲 ——
            <strong>容量 k 的小根堆</strong>,堆顶即门槛,逐帧看它怎么运作(下例 k = 2):
          </p>
        </div>
        <ArrayStepper title="LC 215 · 容量 2 的小根堆(格子=堆里的值)" frames={F215} />
        <CodeTabs
          title="lc215_kth_largest"
          java={{
            code: `import java.util.*;

class Solution {
    public int findKthLargest(int[] nums, int k) {
        // 小根堆:堆顶永远是"当前最大 k 个"里最小的 —— 即入围门槛
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int x : nums) {
            heap.offer(x);              // 新数先进来
            if (heap.size() > k)        // 超出容量 k
                heap.poll();            // 踢掉门槛(堆顶=最小者)
        }
        return heap.peek();             // 堆顶 = 第 k 大
    }
}`,
            hl: [7, 8, 9, 10, 11],
          }}
          python={{
            code: `import heapq

class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        heap = []                       # 容量 k 的小根堆
        for x in nums:
            heapq.heappush(heap, x)
            if len(heap) > k:
                heapq.heappop(heap)     # 踢掉门槛(最小者)
        return heap[0]                  # 堆顶 = 第 k 大

    # 面试彩蛋:一行等价写法(内部就是这套容量 k 的堆)
    # return heapq.nlargest(k, nums)[-1]`,
            hl: [6, 7, 8, 9, 10],
          }}
          js={{
            code: `// 复用 §04 的 MinHeap —— JS 没内置堆,手写它最稳
var findKthLargest = function (nums, k) {
  const heap = new MinHeap();
  for (const x of nums) {
    heap.push(x);
    if (heap.size() > k) heap.pop();    // 踢掉门槛(最小者)
  }
  return heap.peek();                   // 堆顶 = 第 k 大
};`,
            hl: [4, 5, 6, 7],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n log k)</b>(n 个数、每个最多一次 O(log k) 的进出),空间
            <b> O(k)</b>。经典追问:<b>「能做到 O(n) 吗?」</b>—— 能,用
            <b>快速选择(quickselect)</b>:借快排的 partition,每轮只递归<b>一边</b>,
            平均 O(n)、最坏 O(n²)(随机选基准可规避)。那堆解法凭什么还常用?
            两个杀手锏:① <b>数据流</b>场景元素源源不断、根本没有「完整数组」给你 partition;
            ② 海量数据<b>内存放不下全部</b>时,容量 K 的堆只吃 O(k) 空间。
            两种解法都会、并能说清各自的适用场景,才是满分。
          </p>
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 B</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 347 · 前 K 个高频元素
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>返回数组里出现频率前 k 高的元素。<b>暴力:</b>统计频率后
            按频率排序取前 k,O(n log n)。<b>正解:</b>这是你的第一道
            <strong>「结构组合」</strong>题 —— 一个结构搞不定,就串两个:
            先用<strong>哈希表 O(n) 数出每个数的频次</strong>(第 6 章的活),
            再把「频次」喂给<strong>容量 k 的小根堆</strong>做 Top-K
            (本章的活)。注意:这次堆<strong>按频次排序</strong>,门槛是「入围者里频次最低的」。
          </p>
        </div>
        <ArrayStepper title="LC 347 · 哈希计数 + 容量 2 小根堆(格子=频次)" frames={F347} />
        <CodeTabs
          title="lc347_top_k_frequent"
          java={{
            code: `import java.util.*;

class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        // ① 哈希计数:数 → 出现次数
        Map<Integer, Integer> cnt = new HashMap<>();
        for (int x : nums) cnt.merge(x, 1, Integer::sum);

        // ② 容量 k 的小根堆,按频次排序;门槛 = 频次最低者
        PriorityQueue<int[]> heap =            // int[]{数, 频次}
            new PriorityQueue<>((a, b) -> a[1] - b[1]);
        for (var e : cnt.entrySet()) {
            heap.offer(new int[]{e.getKey(), e.getValue()});
            if (heap.size() > k) heap.poll();  // 踢掉频次最低的
        }

        // ③ 倒出答案
        int[] ans = new int[k];
        for (int i = 0; i < k; i++) ans[i] = heap.poll()[0];
        return ans;
    }
}`,
            hl: [10, 11, 12, 13, 14, 15],
          }}
          python={{
            code: `import heapq
from collections import Counter

class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        cnt = Counter(nums)                 # ① 哈希计数
        # ② 容量 k 的小根堆,按频次;堆里存 (频次, 数)
        heap = []
        for num, freq in cnt.items():
            heapq.heappush(heap, (freq, num))
            if len(heap) > k:
                heapq.heappop(heap)         # 踢掉频次最低的
        return [num for freq, num in heap]  # ③ 倒出答案

    # 面试彩蛋:Counter 自带 → return [x for x, _ in cnt.most_common(k)]`,
            hl: [7, 8, 9, 10, 11, 12],
          }}
          js={{
            code: `var topKFrequent = function (nums, k) {
  // ① 哈希计数
  const cnt = new Map();
  for (const x of nums) cnt.set(x, (cnt.get(x) ?? 0) + 1);

  // ② 容量 k 的小根堆,priority = 频次(LC 环境自带此包)
  const { MinPriorityQueue } = require('@datastructures-js/priority-queue');
  const pq = new MinPriorityQueue({ priority: (o) => o.freq });
  for (const [num, freq] of cnt) {
    pq.enqueue({ num, freq });
    if (pq.size() > k) pq.dequeue();      // 踢掉频次最低的
  }

  // ③ 倒出答案
  const ans = [];
  while (!pq.isEmpty()) ans.push(pq.dequeue().element.num);
  return ans;
};`,
            hl: [6, 7, 8, 9, 10, 11],
            note: (
              <>
                <b>无第三方包时的退路:</b>数据不大也可
                <code>[...cnt].sort((a,b)=&gt;b[1]-a[1]).slice(0,k).map(p=&gt;p[0])</code>{" "}
                —— 但那是 O(n log n),不是堆的 O(n log k)。桶排序还能做到 O(n),
                作为追问的加分项。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            计数 O(n) + 维护堆 O(n log k) = <b>O(n log k)</b>,空间 O(n)(哈希表)。
            追问:<b>「能不能 O(n)?」</b>—— 能,用<b>桶排序(bucket sort)</b>:
            频次最大不超过 n,开 n+1 个桶,<code>bucket[f]</code> 装所有出现 f 次的数,
            从高频桶往低频桶收集前 k 个即可,完全不用排序也不用堆。
            「哈希 + 堆」是最好记的通用解,「哈希 + 桶」是它的 O(n) 特化版 ——
            两个都会,面试更从容。
          </p>
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 C</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 23 · 合并 K 个升序链表
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="hard">HARD</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>把 k 条各自升序的链表,合并成一条大的升序链表。
            <b>暴力:</b>把所有结点值倒进数组、排序、重建链表,O(N log N)
            (N 是总结点数)—— 但它<b>完全没用上「每条链已经有序」</b>这个宝贵条件。
            <b>正解:</b>合并有序序列,答案的下一个数<b>一定</b>是「各条链当前头结点里最小的那个」。
            谁能随时报出「一堆数里的最小值」?<strong>小根堆</strong>。
            于是让堆<strong>只装 k 个头结点</strong>,反复取最小、补上它的后继:
          </p>
        </div>
        <ArrayStepper title="LC 23 · 堆装 K 个链头(格子=堆里的结点值)" frames={F23} />
        <CodeTabs
          title="lc23_merge_k_lists"
          java={{
            code: `import java.util.*;

class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        // 小根堆按结点值排序,只装"每条链当前的头"
        PriorityQueue<ListNode> heap =
            new PriorityQueue<>((a, b) -> a.val - b.val);
        for (ListNode head : lists)
            if (head != null) heap.offer(head);   // K 个头入堆

        ListNode dummy = new ListNode(0), tail = dummy;
        while (!heap.isEmpty()) {
            ListNode node = heap.poll();           // 当前全局最小
            tail.next = node;                      // 接到答案尾巴
            tail = node;
            if (node.next != null)                 // 这条链还有下一个
                heap.offer(node.next);             // 补进堆
        }
        return dummy.next;
    }
}`,
            hl: [12, 13, 14, 15, 16, 17],
          }}
          python={{
            code: `import heapq

class Solution:
    def mergeKLists(self, lists: list[ListNode]) -> ListNode:
        # 坑:ListNode 不可比较 → 塞 (val, 序号, node),序号做"平局裁判"
        heap = []
        for i, head in enumerate(lists):
            if head:
                heapq.heappush(heap, (head.val, i, head))

        dummy = tail = ListNode(0)
        while heap:
            val, i, node = heapq.heappop(heap)     # 当前全局最小
            tail.next = node
            tail = node
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))
        return dummy.next`,
            hl: [11, 12, 13, 14, 15, 16, 17],
            note: (
              <>
                <b>核心坑:</b>元组比到 <code>val</code> 相等时,Python 会接着比第 2 项;
                若第 2 项直接是 <code>node</code>,而 <code>ListNode</code> 没定义
                <code>&lt;</code>,就会 <code>TypeError</code>。塞一个唯一的自增序号
                <code>i</code> 挡在中间,永远比不到 node 本身 —— 这是 heapq 存对象的通用护身符。
              </>
            ),
          }}
          js={{
            code: `var mergeKLists = function (lists) {
  // priority = 结点值(LC 环境自带此包);无包时把 §04 的 MinHeap 改成按 .val 比
  const { MinPriorityQueue } = require('@datastructures-js/priority-queue');
  const pq = new MinPriorityQueue({ priority: (node) => node.val });
  for (const head of lists) if (head) pq.enqueue(head);  // K 个头入堆

  const dummy = new ListNode(0);
  let tail = dummy;
  while (!pq.isEmpty()) {
    const node = pq.dequeue().element;   // 当前全局最小
    tail.next = node;
    tail = node;
    if (node.next) pq.enqueue(node.next);// 补进堆
  }
  return dummy.next;
};`,
            hl: [8, 9, 10, 11, 12, 13],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            设总共 N 个结点。每个结点恰好进堆、出堆各一次,每次堆操作 O(log k)
            (堆里最多 k 个头)→ 时间 <b>O(N log k)</b>,空间 <b>O(k)</b>。
            这里也呼应第 3 章链表:堆里存的是<b>结点</b>(靠 <code>next</code> 顺藤摸瓜),
            不是把值抠出来。经典追问:<b>「不用堆行不行?」</b>—— 行,
            <b>分治两两合并</b>:反复调用「合并两个有序链表」(LC 21),k 条链
            log k 轮合完,每轮总共扫 O(N),同样 O(N log k),还省下堆的空间。
            两种最优解都要能手到擒来。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title="高频题单:堆 8 题"
        desc="从 Top-K 门槛堆,到反复取最值,再到合并 K 路与对顶双堆 —— 由易到难"
        badge={<span className="chip">面试常客</span>}
      >
        <ProblemSet ch="heap" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="7 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="heap" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            堆<b>只承诺一件事:堆顶是最值</b>。兄弟乱序、数组乱序全都合法 ——
            承诺越少,维护越便宜(O(log n) 对全排序的 O(n log n)),这是它的设计哲学。
          </>,
          <>
            两条规矩:① <b>完全二叉树</b>(又矮又胖,高度 ⌊log₂n⌋、无空洞);
            ② <b>父 ≤ 子</b>(小根堆)。靠规矩 ① 把整棵树塞进数组,父子用公式算:
            <code>parent=(i−1)/2</code>、<code>children=2i+1, 2i+2</code>,<b>不用指针</b>。
          </>,
          <>
            push = 尾部放入 + <b>上浮</b>,pop = 堆顶出、尾巴补顶 + <b>下沉</b>,
            都是 <b>O(log n)</b>(走一条树高的路);peek 是 O(1);
            批量建堆用 heapify 是 <b>O(n)</b>(底部结点多但沉得浅)。
          </>,
          <>
            <b>Top-K 的反直觉锁</b>:求第 K <b>大</b>用容量 K 的<b>小根堆</b>
            (堆顶=门槛,比门槛大才进);求第 K <b>小</b>用<b>大根堆</b>。
            要留谁,就用能随时报出这批人里「最该被踢者」的那种堆。
          </>,
          <>
            工程配置:Java <code>PriorityQueue</code>(默认小根,大根传
            <code>reverseOrder()</code>,遍历无序)、Python <code>heapq</code>
            (只有小根,大根<b>存负数</b>)、JS <b>无内置</b>(手写或第三方包);
            堆是<b>优先队列</b>的引擎,也是调度、Dijkstra、合并 K 路的底座。
          </>,
        ]}
      />

      <ChapterFooter ch="heap" />
    </main>
  );
}
