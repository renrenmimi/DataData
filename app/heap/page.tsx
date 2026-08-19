"use client";

// 第 9 章 · 堆与优先队列(Heap / Priority Queue)
// 八段式:直觉(急诊分诊,只关心最值)→ 结构(完全二叉树 + 父≤子,存进数组)→
// 核心操作(HeapLab:push 上浮 / pop 下沉 / O(n) 建堆)→ 手写 MinHeap →
// 三语言对照(PriorityQueue / heapq / 无内置)→ 套路与精讲(Top-K,215/347/23)→
// 题单 → 测验 → 要点。
//
// 双语:所有面向学习者的文案都用 <T en zh> 或 { en, zh },英文为默认语言。
// 代码窗的 code 写成 { en, zh } —— 两版逐行等价,只有注释不同,hl 行号才对得上。
// 术语约定:height(树高)按边数计 = ⌊log₂n⌋;priority queue 是接口,
// binary heap 是实现 —— 全章不把两者当同义词用。

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
import { T } from "@/lib/i18n";
import { HeapLab, HeapMapFig } from "./viz";

/* ================= 精讲动画帧 ================= */

// —— 精讲 A · LC 215:数组中第 K 个最大元素。容量 k=2 的小根堆,堆顶=门槛 ——
// 输入 [3,2,1,5,6,4],第 2 大 = 5。
// 格子约定:前面的格子 = 堆里的内容;末尾那个 lit / bad 的格子 = 正在被检验的新数。
const F215: ArrayFrame[] = [
  {
    cells: [{ v: 3, state: "ok" }],
    ptrs: [{ i: 0, label: { en: "threshold", zh: "门槛" } }],
    msg: {
      en: (
        <>
          Keep a <b>min-heap that holds at most 2 elements</b>, so that it always
          contains the 2 largest values seen so far. The first value is{" "}
          <b>3</b>. The heap is not full, so 3 goes in. The threshold, which is
          the root and therefore the smallest value in the heap, is 3.
        </>
      ),
      zh: (
        <>
          维护一个<b>最多装 2 个元素的小根堆</b>,让它始终装着「迄今最大的 2 个」。
          第一个数是 <b>3</b>:堆没满,直接进。此刻门槛(堆顶,也就是堆里最小的)是 3。
        </>
      ),
    },
  },
  {
    cells: [{ v: 2, state: "ok" }, { v: 3 }],
    ptrs: [{ i: 0, label: { en: "threshold", zh: "门槛" } }],
    msg: {
      en: (
        <>
          Next value <b>2</b>. The heap is still not full, so 2 goes in and sifts
          up to the root. The heap is full now, and the threshold is the smaller
          of the two, <b>2</b>.
        </>
      ),
      zh: (
        <>
          下一个数 <b>2</b>:堆还没满,进,上浮到堆顶。堆满了 ——
          门槛是这 2 个里较小的 <b>2</b>。
        </>
      ),
    },
  },
  {
    cells: [{ v: 2, state: "lit" }, { v: 3 }, { v: 1, state: "bad" }],
    ptrs: [{ i: 0, label: { en: "threshold", zh: "门槛" } }],
    msg: {
      en: (
        <>
          Next value <b>1</b> (the marked cell on the right is the incoming
          value, not part of the heap). Compare it with the threshold:{" "}
          <b>1 &lt; 2</b>, so it cannot beat even the weakest element already
          kept. It is discarded and the heap does not change.
        </>
      ),
      zh: (
        <>
          下一个数 <b>1</b>(右边这个标记格是待检验的新数,不在堆里)。
          和门槛比较:<b>1 &lt; 2</b>,连堆里最弱的都比不过,直接丢弃,堆不动。
        </>
      ),
    },
  },
  {
    cells: [{ v: 2, state: "bad" }, { v: 3 }, { v: 5, state: "lit" }],
    ptrs: [{ i: 0, label: { en: "threshold", zh: "门槛" } }],
    msg: {
      en: (
        <>
          Next value <b>5</b>. <b>5 &gt; 2</b>, so it qualifies. 5 enters and the
          old threshold 2 has to leave, because the heap may hold only 2
          elements. The usual way to write this is push first, then pop the root.
        </>
      ),
      zh: (
        <>
          下一个数 <b>5</b>:<b>5 &gt; 2</b>,够格。5 进来,旧门槛 2 必须出去 ——
          堆最多只能装 2 个。标准写法是先 push,再 pop 掉堆顶。
        </>
      ),
    },
  },
  {
    cells: [{ v: 3, state: "ok" }, { v: 5 }],
    ptrs: [{ i: 0, label: { en: "threshold", zh: "门槛" } }],
    msg: {
      en: (
        <>
          After 2 is removed and the heap order is repaired, the heap holds{" "}
          {"{3, 5}"} and the threshold has risen to <b>3</b>. The threshold can
          only go up, which is exactly what you want: each replacement makes the
          set of survivors stronger.
        </>
      ),
      zh: (
        <>
          踢掉 2、修复堆序之后,堆里是 {"{3, 5}"},门槛升到 <b>3</b>。
          门槛只会越来越高 —— 这正是我们想要的:每替换一次,幸存者就更强一点。
        </>
      ),
    },
  },
  {
    cells: [{ v: 5, state: "ok" }, { v: 6 }],
    ptrs: [{ i: 0, label: { en: "threshold", zh: "门槛" } }],
    msg: {
      en: (
        <>
          Next value <b>6</b>. 6 &gt; 3, so it enters and pushes 3 out. The heap
          holds {"{5, 6}"} and the threshold rises to <b>5</b>.
        </>
      ),
      zh: (
        <>
          下一个数 <b>6</b>:6 &gt; 3,进,挤掉 3。堆里是 {"{5, 6}"},
          门槛升到 <b>5</b>。
        </>
      ),
    },
  },
  {
    cells: [{ v: 5 }, { v: 6 }, { v: 4, state: "bad" }],
    ptrs: [{ i: 0, label: { en: "threshold", zh: "门槛" } }],
    msg: {
      en: (
        <>
          Last value <b>4</b>: 4 &lt; 5, so it is discarded.
        </>
      ),
      zh: (
        <>
          最后一个数 <b>4</b>:4 &lt; 5,淘汰。
        </>
      ),
    },
  },
  {
    cells: [{ v: 5, state: "ok" }, { v: 6 }],
    ptrs: [{ i: 0, label: { en: "2nd largest", zh: "第 2 大" } }],
    msg: {
      en: (
        <>
          The scan is finished. The heap holds {"{5, 6}"}, the 2 largest values,
          and the root <b>5</b> is the 2nd largest element. The whole run costs{" "}
          <b>O(n log k)</b> time and <b>O(k)</b> space. When n is large and k is
          small, that is much less work than sorting everything at O(n log n).
        </>
      ),
      zh: (
        <>
          扫完了。堆里是 {"{5, 6}"},正是最大的 2 个,堆顶 <b>5</b> 就是第 2 大的元素。
          全程 <b>O(n log k)</b> 时间、<b>O(k)</b> 空间。n 很大而 k 很小时,
          这比全排序的 O(n log n) 少做很多工作。
        </>
      ),
    },
  },
];

// —— 精讲 B · LC 347:前 K 个高频元素。哈希计数 + 容量 k=2 小根堆(按频次) ——
// 输入 [1,1,1,2,2,3],k=2。格子里画的是「频次」,末尾格子是待检验的新频次。
const F347: ArrayFrame[] = [
  {
    cells: [{ v: 3, state: "ok" }],
    ptrs: [{ i: 0, label: { en: "root", zh: "堆顶" } }],
    msg: {
      en: (
        <>
          Step 1, hash counting: <b>1</b> appears 3 times, <b>2</b> appears 2
          times, <b>3</b> appears 1 time. Step 2 feeds those <b>counts</b> into a
          min-heap that holds at most 2 entries. The count of the number 1 goes
          in first, which is <b>3</b>.
        </>
      ),
      zh: (
        <>
          第一步 哈希计数:数字 <b>1</b> 出现 3 次,<b>2</b> 出现 2 次,
          <b>3</b> 出现 1 次。第二步把这些<b>频次</b>喂给一个最多装 2 个的小根堆。
          先放数字 1 的频次 <b>3</b>。
        </>
      ),
    },
  },
  {
    cells: [{ v: 2, state: "ok" }, { v: 3 }],
    ptrs: [{ i: 0, label: { en: "threshold", zh: "门槛" } }],
    msg: {
      en: (
        <>
          The count of the number 2 is <b>2</b>. It enters and sifts up to the
          root. The heap is full, so the threshold is the lowest count that is
          still in, which is <b>2</b>. Note that the cells show <b>counts</b>,
          not the numbers themselves.
        </>
      ),
      zh: (
        <>
          数字 2 的频次是 <b>2</b>,入堆并上浮到顶。堆满了,
          门槛就是仍在堆里的最低频次 <b>2</b>。
          注意格子里画的是<b>频次</b>,不是数字本身。
        </>
      ),
    },
  },
  {
    cells: [{ v: 2, state: "lit" }, { v: 3 }, { v: 1, state: "bad" }],
    ptrs: [{ i: 0, label: { en: "threshold", zh: "门槛" } }],
    msg: {
      en: (
        <>
          The count of the number 3 is <b>1</b>. Pushing it makes the heap hold 3
          entries, so the smallest count is popped right away, and that is the 1
          just pushed. The number 3 is out.
        </>
      ),
      zh: (
        <>
          数字 3 的频次是 <b>1</b>。压进去后堆里有 3 个,于是立刻弹掉最小的频次
          —— 正是刚压进去的这个 1。数字 3 出局。
        </>
      ),
    },
  },
  {
    cells: [{ v: 2, state: "ok" }, { v: 3 }],
    ptrs: [{ i: 0, label: { en: "threshold", zh: "门槛" } }],
    msg: {
      en: (
        <>
          The heap holds the counts {"{2, 3}"}, which belong to the numbers{" "}
          <b>2</b> and <b>1</b>. Those are the 2 most frequent elements. Counting
          is O(n) and maintaining the heap is O(n log k), so the total is{" "}
          <b>O(n log k)</b>. This is the first problem where you combine two
          structures: a hash map and a heap.
        </>
      ),
      zh: (
        <>
          堆里剩下频次 {"{2, 3}"},分别属于数字 <b>2</b> 和 <b>1</b> ——
          就是前 2 高频的元素。计数 O(n),维护堆 O(n log k),合计 <b>O(n log k)</b>。
          这是你的第一道「两种结构组合」的题:哈希表 + 堆。
        </>
      ),
    },
  },
];

// —— 精讲 C · LC 23:合并 K 个升序链表。堆装每条链当前的头 ——
// 链①1→4→5 链②1→3→4 链③2→6。格子里画的是「堆里的结点值」。
const F23: ArrayFrame[] = [
  {
    cells: [{ v: 1, state: "lit" }, { v: 1 }, { v: 2 }],
    ptrs: [{ i: 0, label: { en: "root", zh: "堆顶" } }],
    msg: {
      en: (
        <>
          Three sorted lists: 1→4→5, 1→3→4, 2→6. Put the three <b>head nodes</b>{" "}
          into a min-heap, giving {"{1, 1, 2}"}. The root is the smallest value
          across all three lists, so it is the next value of the merged list.
        </>
      ),
      zh: (
        <>
          三条升序链表:1→4→5、1→3→4、2→6。把三个<b>头结点</b>放进小根堆,
          得到 {"{1, 1, 2}"}。堆顶是三条链里最小的值,也就是合并结果的下一个数。
        </>
      ),
    },
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 2 }, { v: 4 }],
    ptrs: [{ i: 0, label: { en: "root", zh: "堆顶" } }],
    msg: {
      en: (
        <>
          Pop the root <b>1</b> (from list 1) and append it to the answer. Push
          the next node of list 1, which is <b>4</b>. The heap becomes{" "}
          {"{1, 2, 4}"}.
          <br />
          Output: <b>1</b>
        </>
      ),
      zh: (
        <>
          弹出堆顶 <b>1</b>(来自链 1)接到答案上,再把链 1 的下一个结点 <b>4</b>{" "}
          压进堆。堆变成 {"{1, 2, 4}"}。
          <br />
          输出:<b>1</b>
        </>
      ),
    },
  },
  {
    cells: [{ v: 2, state: "ok" }, { v: 4 }, { v: 3 }],
    ptrs: [{ i: 0, label: { en: "root", zh: "堆顶" } }],
    msg: {
      en: (
        <>
          Pop <b>1</b> (from list 2) and push its next node <b>3</b>. The heap
          holds {"{2, 3, 4}"}.
          <br />
          Output: <b>1 1</b>
        </>
      ),
      zh: (
        <>
          弹出 <b>1</b>(来自链 2),补进它的下一个结点 <b>3</b>。
          堆里是 {"{2, 3, 4}"}。
          <br />
          输出:<b>1 1</b>
        </>
      ),
    },
  },
  {
    cells: [{ v: 3, state: "ok" }, { v: 4 }, { v: 6 }],
    ptrs: [{ i: 0, label: { en: "root", zh: "堆顶" } }],
    msg: {
      en: (
        <>
          Pop <b>2</b> (from list 3) and push <b>6</b>. The heap holds{" "}
          {"{3, 4, 6}"}.
          <br />
          Output: <b>1 1 2</b>
        </>
      ),
      zh: (
        <>
          弹出 <b>2</b>(来自链 3),补进 <b>6</b>。堆里是 {"{3, 4, 6}"}。
          <br />
          输出:<b>1 1 2</b>
        </>
      ),
    },
  },
  {
    cells: [{ v: 4 }, { v: 4 }, { v: 6 }],
    ptrs: [{ i: 0, label: { en: "root", zh: "堆顶" } }],
    msg: {
      en: (
        <>
          Pop <b>3</b> and push the <b>4</b> that follows it in list 2. The heap
          holds {"{4, 4, 6}"}.
          <br />
          Output: <b>1 1 2 3</b>
        </>
      ),
      zh: (
        <>
          弹出 <b>3</b>,补进链 2 里跟在它后面的 <b>4</b>。堆里是 {"{4, 4, 6}"}。
          <br />
          输出:<b>1 1 2 3</b>
        </>
      ),
    },
  },
  {
    cells: [{ v: 5, state: "lit" }, { v: 6 }],
    ptrs: [{ i: 0, label: { en: "root", zh: "堆顶" } }],
    msg: {
      en: (
        <>
          Pop the two <b>4</b>s one after the other. The 4 from list 1 is
          followed by <b>5</b>, which is pushed. The 4 from list 2 is the last
          node of that list, so nothing replaces it and the heap shrinks to{" "}
          {"{5, 6}"}.
          <br />
          Output: <b>1 1 2 3 4 4</b>
        </>
      ),
      zh: (
        <>
          接连弹出两个 <b>4</b>。链 1 的 4 后面还有 <b>5</b>,补进堆;
          链 2 的 4 是那条链的最后一个结点,没有东西可补,于是堆缩到 {"{5, 6}"}。
          <br />
          输出:<b>1 1 2 3 4 4</b>
        </>
      ),
    },
  },
  {
    cells: [{ v: 5, state: "ok" }, { v: 6, state: "ok" }],
    ptrs: [{ i: 0, label: { en: "root", zh: "堆顶" } }],
    msg: {
      en: (
        <>
          Pop <b>5</b>, then <b>6</b>. The heap is empty and the merge is done.
          <br />
          Output: <b>1 1 2 3 4 4 5 6</b>
          <br />
          There are N nodes in total. Each node enters and leaves the heap once,
          and each heap operation costs O(log k), so the total is{" "}
          <b>O(N log k)</b> time and O(k) space, because the heap never holds
          more than k nodes.
        </>
      ),
      zh: (
        <>
          再弹出 <b>5</b> 和 <b>6</b>,堆空,合并结束。
          <br />
          输出:<b>1 1 2 3 4 4 5 6</b>
          <br />
          总共 N 个结点,每个结点进堆、出堆各一次,每次堆操作 O(log k),
          所以是 <b>O(N log k)</b> 时间、O(k) 空间 —— 堆里最多只有 k 个结点。
        </>
      ),
    },
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: { en: "Intuition", zh: "直觉" } },
  { id: "shape", n: "02", label: { en: "The structure", zh: "结构长什么样" } },
  { id: "ops", n: "03", label: { en: "Core operations", zh: "核心操作" } },
  { id: "impl", n: "04", label: { en: "Build one", zh: "手写实现" } },
  { id: "langs", n: "05", label: { en: "Three languages", zh: "三语言对照" } },
  {
    id: "patterns",
    n: "06",
    label: { en: "Patterns and Top-K", zh: "套路与精讲" },
  },
  { id: "problems", n: "07", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "08", label: { en: "Quiz", zh: "通关测验" } },
];

export default function HeapChapter() {
  return (
    <main className="page" data-ch="heap">
      <Hero
        ch="heap"
        title={{
          en: (
            <>
              The <span className="grad">Heap</span>
            </>
          ),
          zh: (
            <>
              堆 <span className="grad">Heap</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A container that always hands you the most important item first. It
              never sorts everything. It promises{" "}
              <strong>one thing only: the top is the current minimum</strong>{" "}
              (or maximum), and both taking that item out and putting a new one
              in cost <strong>O(log n)</strong>. It is fast because it promises
              so little.
            </>
          ),
          zh: (
            <>
              一个永远先把最要紧的元素交给你的容器。它从不做全排序,
              只<strong>承诺一件事:堆顶是当前的最小值</strong>(或最大值);
              取走它、塞进新值,都只要 <strong>O(log n)</strong>。
              承诺得少,所以跑得快。
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
          en: "Why it exists: an emergency room is not first come, first served",
          zh: "为什么需要它:急诊室不是先来先看",
        }}
        desc={{
          en: "When you only need to know who is most urgent, ordering everyone is wasted work",
          zh: "只需要知道「谁最要紧」的时候,给全部人排序是一种浪费",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  A canteen counter serves people in arrival order. That is the{" "}
                  <strong>queue</strong> from the previous chapter. An emergency
                  room cannot work that way. A patient with a heart attack who
                  arrived five minutes ago goes in before someone who has been
                  waiting an hour with a sprained ankle. The process is called{" "}
                  <strong>triage</strong>: each time a room opens, staff take the{" "}
                  <strong>most urgent</strong> patient. Nobody works out who is
                  second or third most urgent, because the next decision will be
                  made from scratch anyway.
                </p>
                <p>
                  That is the whole job of a <strong>heap</strong>. In a
                  collection that keeps changing, it reports the minimum (or
                  maximum) in <strong>O(1)</strong>, and it removes that element
                  or inserts a new one in <strong>O(log n)</strong>. The phrase
                  &quot;keeps changing&quot; matters: the data does not arrive
                  all at once, just as patients keep walking in.
                </p>
                <p>
                  Why not simply <strong>sort</strong> everyone, so the most
                  urgent stands first? You can, but sorting does far more work
                  than the question asks for. Sorting costs O(n log n) and fixes
                  the order of <strong>all n elements</strong>, while you only
                  need <strong>one</strong> of them. It also breaks down under
                  updates: inserting a new patient into a sorted array means{" "}
                  <strong>shifting elements, O(n)</strong>, which is the cost you
                  met in chapter 1. A heap takes the opposite position. It{" "}
                  <strong>only maintains which element is the extreme one</strong>
                  , and that is why insert and remove are both O(log n).
                </p>
                <p>
                  Two words are often mixed up, so separate them now. A{" "}
                  <strong>priority queue</strong> is an{" "}
                  <strong>interface</strong>: a container you can keep adding to,
                  and from which you can always remove the highest-priority
                  element. A <strong>binary heap</strong> is the most common{" "}
                  <strong>implementation</strong> of that interface. The relation
                  is the same as between &quot;sorting&quot; and
                  &quot;quicksort&quot;. In almost every language,{" "}
                  <code>PriorityQueue</code> and <code>heapq</code> are backed by
                  a binary heap, and this chapter builds that engine. They are
                  not synonyms, so this chapter says &quot;heap&quot; for the
                  structure and &quot;priority queue&quot; for the interface.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  食堂窗口按到达顺序服务,那是上一章的<strong>队列</strong>。
                  急诊室不能这么干:五分钟前才到的心梗病人,要排在已经等了一小时的
                  崴脚病人前面。这套流程叫<strong>分诊(triage)</strong>:
                  每空出一间诊室,就叫<strong>当前最危重</strong>的病人进去。
                  没有人去算谁排第二、谁排第三 —— 反正下一次还得重新挑一遍。
                </p>
                <p>
                  这就是<strong>堆(heap)</strong>的全部工作:在一堆不断变化的数据里,
                  <strong>O(1)</strong> 报出最小值(或最大值),
                  <strong>O(log n)</strong> 取走它或插入新值。
                  「不断变化」这四个字是关键:数据不是一次给全的,就像病人一直在来。
                </p>
                <p>
                  那为什么不干脆<strong>排个序</strong>,让最危重的站第一个?
                  可以,但排序做的事远超题目所需:O(n log n) 把
                  <strong>全部 n 个元素</strong>的先后都定死,而你只要
                  <strong>其中一个</strong>。更麻烦的是更新:
                  往有序数组里插一个新病人,要<strong>搬移元素,O(n)</strong>
                  —— 这是第 1 章算过的账。堆的取舍正好相反:
                  <strong>只维护「谁是最值」这一件事</strong>,
                  所以插入和删除都是 O(log n)。
                </p>
                <p>
                  有两个词经常被混用,这里先分清。
                  <strong>优先队列(priority queue)</strong>是一个
                  <strong>接口</strong>:一个能不断放入、又能随时取出优先级最高者的容器;
                  <strong>二叉堆(binary heap)</strong>是这个接口最常见的
                  <strong>实现</strong>。二者的关系就像「排序」和「快速排序」。
                  几乎所有语言的 <code>PriorityQueue</code> / <code>heapq</code>{" "}
                  底层都是二叉堆,本章造的正是这台引擎。
                  它们不是同义词,所以本章说「堆」指结构,说「优先队列」指接口。
                </p>
              </>
            }
          />
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PROPERTY 01" zh="特性 01" />
            </div>
            <div className="card-title">
              <T en="Only the top is promised" zh="只承诺堆顶" />
            </div>
            <T
              en={
                <p>
                  A heap guarantees <b>one</b> thing: the top element is the
                  smallest (or the largest) in the whole heap. The order of
                  everything else, including two nodes at the same level, is{" "}
                  <b>not defined</b>. Fewer promises, cheaper maintenance.
                </p>
              }
              zh={
                <p>
                  堆<b>只</b>保证一件事:堆顶是全堆最小(或最大)的元素。
                  其余元素之间的顺序,包括同一层的两个结点,
                  <b>没有任何规定</b>。承诺越少,维护越省。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PROPERTY 02" zh="特性 02" />
            </div>
            <div className="card-title">
              <T en="⚡ Insert and remove in O(log n)" zh="⚡ 进出都 O(log n)" />
            </div>
            <T
              en={
                <p>
                  Inserting a value and removing the current extreme both follow{" "}
                  <b>one path down the height of the tree</b>: O(log n). Reading
                  the top without removing it is O(1). This is why a heap can
                  handle a stream of data.
                </p>
              }
              zh={
                <p>
                  插入一个值、取走当前最值,都只走
                  <b>一条与树高等长的路径</b>:O(log n)。
                  只看堆顶不取走则是 O(1)。正因如此,堆能扛住源源不断的数据流。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PROPERTY 03" zh="特性 03" />
            </div>
            <div className="card-title">
              <T
                en="The engine behind priority queues"
                zh="优先队列背后的引擎"
              />
            </div>
            <T
              en={
                <p>
                  Task scheduling, Dijkstra&apos;s shortest path, Huffman coding,
                  Top-K, merging k sorted sequences. Any problem that repeatedly
                  asks for the current extreme value is usually running a heap.
                </p>
              }
              zh={
                <p>
                  任务调度、Dijkstra 最短路、Huffman 编码、Top-K、合并 K 路有序序列……
                  一切「反复取当前最值」的问题,底下几乎都是堆在转。
                </p>
              }
            />
          </div>
        </div>
        <Callout
          tone="story"
          title={{ en: "One word, two meanings", zh: "一个名字,两样东西" }}
        >
          <T
            en={
              <p>
                A common source of confusion: the heap in this chapter has{" "}
                <b>nothing to do with heap memory</b>. They only share a name.
                Heap memory is the region where a running program allocates
                objects dynamically, as opposed to the call stack. The heap in
                this chapter is a <b>data structure</b>, a tree with a specific
                shape. When you read the word, check which one is meant.
              </p>
            }
            zh={
              <p>
                一个常见的混淆:本章的「堆」和<b>堆内存(heap memory)</b>
                毫无关系,只是重名。堆内存是程序运行时动态分配对象的那片区域,
                与调用栈相对。本章的堆是一种<b>数据结构</b> ——
                一棵有特定形状的树。看到这个词,先分清指的是哪一个。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §02 结构 ================= */}
      <Section
        id="shape"
        index="02"
        title={{
          en: "The structure: two rules, and a place to live",
          zh: "结构长什么样:两条规矩 + 一个藏身之所",
        }}
        desc={{
          en: "It is a special binary tree that needs no pointers, because the whole tree fits into an array",
          zh: "它是一棵特殊的二叉树,却不需要指针 —— 整棵树塞进一个数组",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                A heap is a binary tree that follows only{" "}
                <strong>two rules</strong>. One controls the shape, the other
                controls the order.
              </p>
            }
            zh={
              <p>
                堆是一棵二叉树,但只守<strong>两条规矩</strong>:
                一条管形状,一条管顺序。
              </p>
            }
          />
        </div>
        <div className="grid-2" style={{ marginTop: 8 }}>
          <div className="card">
            <div className="card-kicker">
              <T en="RULE 1 · SHAPE" zh="规矩 ① · 管形状" />
            </div>
            <div className="card-title">
              <T en="A complete binary tree" zh="完全二叉树" />
            </div>
            <T
              en={
                <p>
                  In a <b>complete binary tree</b>, every level is full except
                  possibly the last, and the nodes on the last level are packed{" "}
                  <b>to the left</b> with no gap between them (chapter 7
                  introduced it). This rule keeps the tree <b>short and wide</b>:
                  n nodes give a height of exactly ⌊log₂n⌋. It also means no
                  position is skipped, which is what makes the array layout below
                  possible.
                </p>
              }
              zh={
                <p>
                  <b>完全二叉树(complete binary tree)</b>:除最后一层外,
                  每层都填满;最后一层的结点全部<b>靠左连续排列</b>,中间不留空位
                  (第 7 章见过)。这条规矩让树<b>又矮又宽</b>:
                  n 个结点的高度恰好是 ⌊log₂n⌋。它同时保证没有位置被跳过 ——
                  这正是下面「塞进数组」的前提。
                </p>
              }
            />
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="RULE 2 · ORDER" zh="规矩 ② · 管顺序" />
            </div>
            <div className="card-title">
              <T en="⚖️ Parent ≤ child (min-heap)" zh="⚖️ 父 ≤ 子(小根堆)" />
            </div>
            <T
              en={
                <p>
                  <b>Every parent is ≤ each of its children.</b> Applying that
                  rule down every path makes the root the smallest value in the
                  tree, which is a <b>min-heap</b>. The rule constrains{" "}
                  <b>only</b> the parent-child pair. <b>Siblings are unrelated</b>
                  : the left child may be larger than the right child. Parent ≥
                  child gives a <b>max-heap</b>, where the root is the largest
                  value. The two are mirror images.
                </p>
              }
              zh={
                <p>
                  <b>每个父结点 ≤ 它的每个孩子。</b>沿着每条路径层层递推,
                  根就成了全树最小值 —— 这就是<b>小根堆(min-heap)</b>。
                  这条规矩<b>只</b>约束父子这一对,<b>兄弟之间没有任何关系</b>:
                  左孩子完全可以比右孩子大。父 ≥ 子则是
                  <b>大根堆(max-heap)</b>,堆顶是最大值,两者完全对称。
                </p>
              }
            />
          </div>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "The most common misunderstanding: a heap is not a sorted array",
            zh: "最常见的误解:堆不是排好序的数组",
          }}
        >
          <T
            en={
              <p>
                Many people picture a heap as &quot;a tree sorted from small to
                large&quot;. It is <b>not</b>. A heap only guarantees that each{" "}
                <b>parent → child</b> pair is ordered.{" "}
                <b>
                  Two nodes at the same level, siblings or cousins, have no
                  defined relationship at all
                </b>
                . That is why printing the backing array often gives something
                like <code>[1, 3, 2, 7, 4, 5]</code>. It does not look sorted,
                but it is a valid heap: 1≤3, 1≤2, 3≤7, 3≤4, 2≤5. Every
                parent-child pair holds. Because a heap orders one chain at a
                time instead of the whole collection, an update costs O(log n)
                instead of the O(n log n) of a full sort.
              </p>
            }
            zh={
              <p>
                很多人以为堆就是「从小到大排好的树」。<b>不是</b>。
                堆只保证每一对<b>父 → 子</b>是有序的,
                <b>同一层的两个结点(兄弟或堂兄弟)之间没有任何规定</b>。
                所以把底层数组打印出来,常常是{" "}
                <code>[1, 3, 2, 7, 4, 5]</code> 这样:看着不像升序,
                但它是合法的堆 —— 1≤3、1≤2、3≤7、3≤4、2≤5,每一对父子都成立。
                正因为堆一次只理一条链而不是整批数据,
                单次更新才是 O(log n),而不是全排序的 O(n log n)。
              </p>
            }
          />
        </Callout>

        <div className="prose" style={{ marginTop: 22 }}>
          <T
            en={
              <p>
                Now the two rules connect. Rule 1 says a complete binary tree has{" "}
                <strong>no gap</strong>. So you can number the nodes{" "}
                <strong>level by level, left to right</strong> (the root is 0,
                the next level is 1 and 2, then 3, 4, 5, 6, and so on) and{" "}
                <strong>lay them straight into an array</strong>, using the
                number as the index. Because there is no gap, no array slot is
                wasted, and <strong>no pointer is needed</strong>: every
                parent-child link is <strong>computed</strong> from the index by
                three formulas.
              </p>
            }
            zh={
              <p>
                现在两条规矩接上了。规矩 ① 说完全二叉树<strong>没有空洞</strong>,
                于是可以把结点<strong>按层、从左到右编号</strong>
                (根是 0,下一层是 1、2,再下一层是 3、4、5、6……),
                然后<strong>直接铺进一个数组</strong>,编号就是下标。
                因为没有空洞,数组不会浪费任何一格;
                也<strong>不需要指针</strong> —— 每一条父子连线都由三条公式
                <strong>算</strong>出来:
              </p>
            }
          />
        </div>
        <HeapMapFig />
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="From index i, find" zh="已知下标 i,要找" />
                </th>
                <th>
                  <T en="Formula" zh="公式" />
                </th>
                <th>
                  <T en="Example (i = 4)" zh="例(i = 4)" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T en="Parent" zh="父结点" />
                  </b>{" "}
                  parent
                </td>
                <td>
                  <code>(i − 1) / 2</code>{" "}
                  <T
                    en="(integer division, rounds down)"
                    zh="(整数除法,向下取整)"
                  />
                </td>
                <td>
                  (4 − 1) / 2 = <b>1</b>
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Left child" zh="左孩子" />
                  </b>{" "}
                  left
                </td>
                <td>
                  <code>2i + 1</code>
                </td>
                <td>
                  2×4 + 1 = <b>9</b>
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Right child" zh="右孩子" />
                  </b>{" "}
                  right
                </td>
                <td>
                  <code>2i + 2</code>
                </td>
                <td>
                  2×4 + 2 = <b>10</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                You have seen this idea before. In the array chapter, the address
                of an element is{" "}
                <code>base address + index × element size</code>, also{" "}
                <strong>computed rather than stored</strong>. A heap applies the
                same arithmetic one level up, from array elements to tree links.
                Dropping the pointers buys two concrete things:{" "}
                <strong>no extra memory</strong> (a linked binary tree stores two
                pointers per node), and elements laid out contiguously in memory,
                which is <strong>friendlier to the CPU cache</strong> (the same
                benefit as in chapter 1).
              </p>
            }
            zh={
              <p>
                这个思路你见过。数组那一章里,元素地址 ={" "}
                <code>首地址 + 下标 × 元素大小</code>,同样是
                <strong>算出来的,不是存下来的</strong>。
                堆把这套下标算术从「数组元素」搬到了「树的父子关系」上。
                省掉指针换来两个实在的好处:<strong>不占额外内存</strong>
                (链式二叉树每个结点要存两根指针),
                以及元素在内存里连续排列、<strong>对 CPU 缓存更友好</strong>
                (还是第 1 章的那份红利)。
              </p>
            }
          />
        </div>
        <Callout
          tone="idea"
          title={{
            en: "Would starting at index 1 be simpler?",
            zh: "下标从 1 开始会更省事吗?",
          }}
        >
          <T
            en={
              <p>
                Some textbooks start the heap at index <b>1</b>, which makes the
                formulas shorter: parent = <code>i / 2</code>, left ={" "}
                <code>2i</code>, right = <code>2i + 1</code>. The cost is that
                index 0 is unused. Real implementations, including Java&apos;s{" "}
                <code>PriorityQueue</code> and Python&apos;s <code>heapq</code>,
                start at <b>0</b> and waste nothing, so this chapter uses the
                0-based formulas throughout. Both conventions are correct. Just
                do not mix them in one piece of code.
              </p>
            }
            zh={
              <p>
                有些教科书让堆从下标 <b>1</b> 开始,公式会短一点:父 ={" "}
                <code>i / 2</code>、左孩子 = <code>2i</code>、右孩子 ={" "}
                <code>2i + 1</code>。代价是下标 0 空着不用。
                实际实现(Java 的 <code>PriorityQueue</code>、Python 的{" "}
                <code>heapq</code>)都从 <b>0</b> 开始,不浪费空间,
                所以本章统一用 0 起步的公式。两套约定都对,别在同一份代码里混用。
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
          en: "Core operations: sift up, sift down, and one surprising build",
          zh: "核心操作:上浮、下沉,和一次出人意料的建堆",
        }}
        desc={{
          en: "Every operation does the same thing: move the element that broke parent ≤ child back to where it belongs",
          zh: "所有操作都在做同一件事 —— 把「破坏了父 ≤ 子的那个元素」送回它该待的位置",
        }}
        badge={
          <span className="chip" data-tone="idea">
            <T en="Try it" zh="动手玩" />
          </span>
        }
      >
        <div className="prose">
          <T
            en={
              <p>
                A heap has two movements, and they mirror each other. On insert,
                the new element travels from the bottom upwards, which is called{" "}
                <strong>sift up</strong>. On removal, an element travels from the
                top downwards, which is called <strong>sift down</strong>. Push
                and pop a few values in the lab below and watch{" "}
                <strong>the tree view and the array view change together</strong>
                , since they show the same data. You will see that a heap
                operation is nothing more than{" "}
                <strong>
                  comparing one parent-child pair and swapping when the rule is
                  broken
                </strong>
                , repeated until no swap is needed.
              </p>
            }
            zh={
              <p>
                堆只有两个动作,而且互为镜像:插入时新元素从底往上找位置,叫
                <strong>上浮(sift up)</strong>;删除时元素从顶往下找位置,叫
                <strong>下沉(sift down)</strong>。
                在下面的实验室里 push / pop 几次,
                盯着<strong>树视图和数组视图一起变化</strong> ——
                它们画的是同一份数据。你会发现所谓堆操作,不过是
                <strong>比较一对父子、不合规就交换</strong>,一路重复到不用再换为止。
              </p>
            }
          />
        </div>
        <HeapLab />

        <div className="prose" style={{ marginTop: 24 }}>
          <T
            en={
              <>
                <p>
                  Now in slow motion. <strong>push (insert)</strong> takes two
                  steps:
                </p>
                <ol>
                  <li>
                    <b>1. Write at the end of the array</b>, which is the next
                    free slot of the complete binary tree. This step keeps the
                    shape rule intact.
                  </li>
                  <li>
                    <b>2. Sift up</b>: compare the new value with its parent and
                    swap while it is smaller, then compare with the new parent,
                    and so on, until it is not smaller than its parent or it
                    reaches the root. The longest path runs from the bottom level
                    to the root, so the number of swaps is at most the height:{" "}
                    <b>O(log n)</b>.
                  </li>
                </ol>
                <p>
                  <strong>pop (remove the extreme)</strong> is the mirror image,
                  in three steps:
                </p>
                <ol>
                  <li>
                    <b>1. Read the root.</b> That is the answer, the smallest
                    value in a min-heap.
                  </li>
                  <li>
                    <b>2. Move the last element to the root.</b> Why the last
                    one? Because removing the last slot keeps the tree complete,
                    while removing any other position would leave a gap.
                  </li>
                  <li>
                    <b>3. Sift down.</b> The value that just arrived at the top
                    is probably too large. Compare it with the{" "}
                    <b>smaller of its two children</b> and swap while it is
                    larger, following it down, until it is smaller than both
                    children or it has no child. Again at most the height:{" "}
                    <b>O(log n)</b>.
                  </li>
                </ol>
                <p>
                  <strong>Why must sift down pick the smaller child?</strong>{" "}
                  Suppose you swapped with the larger child instead. That larger
                  child becomes the parent, while its smaller sibling is still
                  below it, so parent ≤ child is broken immediately. Only
                  promoting the <strong>smaller</strong> child keeps both
                  children below the new parent.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  把刚才看到的拆成慢镜头。<strong>push(插入)</strong>分两步:
                </p>
                <ol>
                  <li>
                    <b>① 写到数组尾部</b>,也就是完全二叉树的下一个空位。
                    这一步保证形状规矩不被破坏。
                  </li>
                  <li>
                    <b>② 上浮</b>:新值和父结点比较,比父结点小就交换,
                    换上去再和新的父结点比,直到「不比父结点小」或「已经到根」为止。
                    最长的路径是从最底层走到根,所以交换次数不超过树高:
                    <b>O(log n)</b>。
                  </li>
                </ol>
                <p>
                  <strong>pop(取走最值)</strong>是镜像的三步:
                </p>
                <ol>
                  <li>
                    <b>① 读出堆顶。</b>它就是答案 —— 小根堆里的最小值。
                  </li>
                  <li>
                    <b>② 把最后一个元素搬到堆顶。</b>为什么是最后一个?
                    因为删掉末尾不破坏完全二叉树的形状,删掉别的位置会留下一个空洞。
                  </li>
                  <li>
                    <b>③ 下沉。</b>刚补到顶上的这个值多半偏大:
                    让它和<b>两个孩子里较小的那个</b>比较,比孩子大就交换、跟着下去,
                    直到「比两个孩子都小」或「没有孩子」为止。
                    同样不超过树高:<b>O(log n)</b>。
                  </li>
                </ol>
                <p>
                  <strong>下沉时为什么必须挑较小的孩子?</strong>
                  假设你换了较大的那个孩子:它升上去当了父结点,
                  而更小的兄弟还在它下面,「父 ≤ 子」当场被破坏。
                  只有把<strong>较小的</strong>孩子提上来,才能同时压住两个孩子。
                </p>
              </>
            }
          />
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Operation" zh="操作" />
                </th>
                <th>
                  <T en="Cost" zh="复杂度" />
                </th>
                <th>
                  <T en="Why" zh="为什么" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>peek</b>{" "}
                  <T
                    en="read the extreme without removing it"
                    zh="看最值,不取走"
                  />
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en="The extreme is array slot 0. Reading it touches nothing else."
                    zh="最值就是数组的第 0 格,读一下,不碰任何其他元素"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>push</b> <T en="insert" zh="插入" />
                </td>
                <td>
                  <BigO o="logn" />
                </td>
                <td>
                  <T
                    en="O(1) to write at the end, then sift up along one leaf-to-root path, at most the height"
                    zh="写到尾部 O(1),再沿一条「叶到根」的路径上浮,不超过树高"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>pop</b> <T en="remove the extreme" zh="取走最值" />
                </td>
                <td>
                  <BigO o="logn" />
                </td>
                <td>
                  <T
                    en="Last element takes the root, then sifts down along one root-to-leaf path, at most the height"
                    zh="末尾元素补到堆顶,再沿一条「根到叶」的路径下沉,不超过树高"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>heapify</b>{" "}
                  <T
                    en="turn an existing array into a heap"
                    zh="把已有数组建成堆"
                  />
                </td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <T
                    en="Sift down from the bottom up; the total number of steps stays below n (explained below)"
                    zh="自底向上逐个下沉,总步数不超过 n(下面细说)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Build by pushing one by one" zh="逐个 push 建堆" />
                </td>
                <td>
                  <BigO o="nlogn" />
                </td>
                <td>
                  <T
                    en="n inserts at O(log n) each. Use heapify instead when you already hold all the data"
                    zh="n 次插入,每次 O(log n) —— 数据已经在手上时改用 heapify"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Find or remove " zh="查找 / 删除" />
                  <b>
                    <T en="any" zh="任意" />
                  </b>
                  <T en=" value that is not the root" zh="值(非堆顶)" />
                </td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <T
                    en="A heap is not organised for locating a value in the middle, so the only way is a linear scan"
                    zh="堆的组织方式不为「定位中间某个值」服务,只能线性扫描"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="prose" style={{ marginTop: 26 }}>
          <T
            en={
              <p>
                The surprising row is{" "}
                <strong>
                  heapify: turning an unordered array into a heap in place costs
                  only O(n)
                </strong>
                . Intuition says &quot;n elements, each may sift down log n
                levels, so O(n log n)&quot;. Press{" "}
                <strong>Build from random array</strong> in the lab and count the
                swaps. There are usually far fewer than expected. Here is why:
              </p>
            }
            zh={
              <p>
                表里最反直觉的一行是{" "}
                <strong>heapify:把乱序数组原地整理成堆,只要 O(n)</strong>。
                直觉会说「n 个元素,每个可能下沉 log n 层,应该是 O(n log n)」。
                点一下实验室里的<strong>「随机数组建堆」</strong>,
                数数它到底交换了几次 —— 通常远少于预期。原因如下:
              </p>
            }
          />
        </div>
        <Callout
          tone="deep"
          title={{
            en: "Why building a heap is O(n), not O(n log n)",
            zh: "为什么建堆是 O(n),而不是 O(n log n)",
          }}
        >
          <T
            en={
              <p>
                The method is to{" "}
                <b>
                  sift down every node from the last internal node (index n/2 −
                  1) backwards to index 0
                </b>
                , which is called Floyd&apos;s build-heap. The point is which
                nodes can travel far. In a complete binary tree,{" "}
                <b>about half of the nodes are leaves</b>, sitting on the bottom
                level and sifting down <b>0</b> levels. About a quarter sit one
                level higher and sift down at most <b>1</b> level, about an
                eighth at most <b>2</b>, and so on.{" "}
                <b>The deeper a node can sink, the rarer it is.</b> Adding it all
                up gives Σ d · n / 2<sup>d+1</sup>, and since Σ d / 2
                <sup>d+1</sup> = 1, the total is at most n swaps, so building the
                heap is <b>O(n)</b>. Pushing one by one does the opposite: it
                makes every new element climb towards the <b>root</b>, and the
                elements that climb furthest are the numerous ones near the
                bottom. That difference is exactly one log factor. The rule to
                remember: <b>if you already hold all the data, use heapify at
                O(n); if the data arrives one item at a time, you have no choice
                but to push</b>.
              </p>
            }
            zh={
              <p>
                做法是
                <b>从最后一个父结点(下标 n/2 − 1)倒着走到下标 0,逐个下沉</b>,
                这叫 Floyd 建堆。关键在于「谁能沉得远」:在完全二叉树里,
                <b>大约一半的结点是叶子</b>,位于最底层,下沉 <b>0</b> 步;
                上一层约 1/4 的结点最多沉 <b>1</b> 步;再上一层约 1/8 最多沉{" "}
                <b>2</b> 步…… <b>越能沉得深的结点,数量越稀少</b>。
                把总步数加起来是 Σ d · n / 2<sup>d+1</sup>,而 Σ d / 2
                <sup>d+1</sup> = 1,所以总交换次数不超过 n,建堆是 <b>O(n)</b>。
                逐个 push 恰好相反:它让每个新元素往<b>根</b>的方向爬,
                而爬得最远的正是数量最多的底层结点 —— 差的就是这一个 log。
                记住这条:<b>数据已经全在手上就用 heapify(O(n));
                数据逐个到达就只能逐个 push</b>。
              </p>
            }
          />
        </Callout>
        <Callout
          tone="warn"
          title={{
            en: "Do not use a heap as an ordered container",
            zh: "别把堆当「有序容器」用",
          }}
        >
          <T
            en={
              <p>
                A heap is good at repeatedly producing the extreme value. It is{" "}
                <b>bad</b> at three things. First, finding a specific value costs
                O(n). Second, producing all elements in order requires n pops, so
                O(n log n) in total. That procedure is exactly{" "}
                <b>heap sort</b>, which is O(n log n) in the best, average, and
                worst case, uses O(1) extra space, and is{" "}
                <b>not stable</b>: equal elements can come out in a different
                order than they went in. Third, a heap gives you only the root,
                so the general way to reach the k-th smallest value is to pop k −
                1 times first. If you need ordered access or range queries at any
                time, go back to the BST and TreeMap of chapter 8. Choosing the
                wrong structure is the most expensive mistake in both interviews
                and production code.
              </p>
            }
            zh={
              <p>
                堆擅长「反复取最值」,但有三件事它<b>不擅长</b>:
                第一,查找某个特定值要 O(n);
                第二,按顺序输出全部元素需要 pop n 次,合计 O(n log n) ——
                这个过程正是<b>堆排序(heap sort)</b>,
                它在最好、平均、最坏情况下都是 O(n log n),额外空间 O(1),
                而且<b>不稳定</b>:相等的元素出堆顺序可能和入堆顺序不同;
                第三,堆只把堆顶交给你,所以要拿第 k 小的值,
                通常得先 pop 掉 k − 1 个。
                如果你需要随时按序访问或做范围查询,请回到第 8 章的 BST / TreeMap。
                选错结构是面试和工程里最贵的错误。
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
          en: "Write a MinHeap: about 40 lines, nothing missing",
          zh: "手写一个 MinHeap:40 行,五脏俱全",
        }}
        desc={{
          en: "push, pop, peek, siftUp, siftDown, heapify — commented line by line and ready to run",
          zh: "push / pop / peek / siftUp / siftDown / heapify —— 逐行注释,复制即可跑",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                Here are the movements from §03 as code. There are three real
                methods: <code>siftUp</code>, <code>siftDown</code>, and the
                static <code>heapify</code> that builds a heap in O(n).{" "}
                <code>push</code> and <code>pop</code> only combine &quot;change
                the array&quot; with &quot;repair the heap order&quot;. The
                storage is a plain resizable array, and every parent-child link
                comes from the three formulas in §02. Cover the code and try to
                write <code>siftDown</code> from memory. The step that picks the
                smaller child is the one people get wrong most often.
              </p>
            }
            zh={
              <p>
                把 §03 的动作写成代码。真正干活的只有三个方法:
                <code>siftUp</code>(上浮)、<code>siftDown</code>(下沉),
                以及 O(n) 建堆的静态方法 <code>heapify</code>。
                <code>push</code> / <code>pop</code> 只是把「改数组」和
                「修复堆序」拼在一起。底层用一个普通的可变数组存,
                父子关系全靠 §02 的三条公式算。
                建议先盖住代码,自己默写一遍 <code>siftDown</code> ——
                「挑较小的孩子」那一步,是最多人写错的地方。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="MinHeap"
          java={{
            code: {
              en: `class MinHeap {
    private int[] a;      // backing array: the tree flattened level by level
    private int size;     // how many elements are stored

    public MinHeap(int cap) { a = new int[Math.max(1, cap)]; }

    public int peek() {                 // read the minimum, O(1)
        if (size == 0) throw new RuntimeException("heap is empty");
        return a[0];                    // the root is always at index 0
    }

    public void push(int x) {           // insert, O(log n)
        if (size == a.length) grow();   // array full: enlarge it first
        a[size] = x;                    // 1. write at the end = next free slot
        siftUp(size);                   // 2. move it up to where it belongs
        size++;
    }

    public int pop() {                  // remove the minimum, O(log n)
        int top = a[0];                 // 1. the root is the answer
        a[0] = a[--size];               // 2. last element takes the root
        siftDown(0);                    // 3. sift down to repair the order
        return top;
    }

    private void siftUp(int i) {        // compare with the parent, swap if smaller
        while (i > 0) {
            int p = (i - 1) / 2;        // index of the parent
            if (a[i] >= a[p]) break;    // not smaller than the parent: stop
            swap(i, p);
            i = p;
        }
    }

    private void siftDown(int i) {      // compare with the smaller child, swap if larger
        while (true) {
            int l = 2 * i + 1, r = 2 * i + 2, m = i;
            if (l < size && a[l] < a[m]) m = l;   // is the left child smaller?
            if (r < size && a[r] < a[m]) m = r;   // is the right child smaller?
            if (m == i) break;          // smaller than both children, or no child
            swap(i, m);
            i = m;
        }
    }

    // build a heap from any array in O(n): sift down from the last internal node
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
              zh: `class MinHeap {
    private int[] a;      // 底层数组:完全二叉树按层铺平
    private int size;     // 实际存了几个元素

    public MinHeap(int cap) { a = new int[Math.max(1, cap)]; }

    public int peek() {                 // 读最小值,O(1)
        if (size == 0) throw new RuntimeException("heap is empty");
        return a[0];                    // 堆顶永远在下标 0
    }

    public void push(int x) {           // 插入,O(log n)
        if (size == a.length) grow();   // 数组满了,先扩容
        a[size] = x;                    // ① 写到尾部 = 树的下一个空位
        siftUp(size);                   // ② 上浮到它该待的位置
        size++;
    }

    public int pop() {                  // 取走最小值,O(log n)
        int top = a[0];                 // ① 堆顶就是答案
        a[0] = a[--size];               // ② 末尾元素补到堆顶
        siftDown(0);                    // ③ 下沉,修复堆序
        return top;
    }

    private void siftUp(int i) {        // 和父结点比,更小就往上换
        while (i > 0) {
            int p = (i - 1) / 2;        // 父结点下标
            if (a[i] >= a[p]) break;    // 不比父结点小,停
            swap(i, p);
            i = p;
        }
    }

    private void siftDown(int i) {      // 和较小的孩子比,更大就往下换
        while (true) {
            int l = 2 * i + 1, r = 2 * i + 2, m = i;
            if (l < size && a[l] < a[m]) m = l;   // 左孩子更小?
            if (r < size && a[r] < a[m]) m = r;   // 右孩子更小?
            if (m == i) break;          // 比两个孩子都小,或者没有孩子
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
            },
            hl: [26, 27, 28, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
            note: {
              en: (
                <>
                  <b>Easy to get wrong:</b> the comparison is{" "}
                  <code>a[i] &gt;= a[p]</code>, so equal values do not swap. That
                  avoids pointless swapping between equal elements. To get a{" "}
                  <b>max-heap</b>, reverse the direction of both comparisons.
                  Nothing else changes.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>比较写的是 <code>a[i] &gt;= a[p]</code>,
                  相等时不交换,可以避免相等元素之间无意义的来回交换。
                  想要<b>大根堆</b>,把两处比较的方向反过来即可,其余一行都不用改。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class MinHeap:
    def __init__(self):
        self.a = []                      # a plain list is the backing array

    def peek(self):                      # read the minimum, O(1)
        return self.a[0]                 # the root is always at index 0

    def push(self, x):                   # insert, O(log n)
        self.a.append(x)                 # 1. write at the end
        self._sift_up(len(self.a) - 1)   # 2. move it up

    def pop(self):                       # remove the minimum, O(log n)
        top = self.a[0]                  # 1. the root is the answer
        last = self.a.pop()              # take the last element off
        if self.a:                       # the heap is not empty yet
            self.a[0] = last             # 2. it takes the root
            self._sift_down(0)           # 3. sift down to repair the order
        return top

    def _sift_up(self, i):               # compare with the parent, swap if smaller
        while i > 0:
            p = (i - 1) // 2             # index of the parent
            if self.a[i] >= self.a[p]:   # not smaller than the parent: stop
                break
            self.a[i], self.a[p] = self.a[p], self.a[i]
            i = p

    def _sift_down(self, i):             # compare with the smaller child
        n = len(self.a)
        while True:
            l, r, m = 2 * i + 1, 2 * i + 2, i
            if l < n and self.a[l] < self.a[m]:  # is the left child smaller?
                m = l
            if r < n and self.a[r] < self.a[m]:  # is the right child smaller?
                m = r
            if m == i:                   # smaller than both, or no child
                break
            self.a[i], self.a[m] = self.a[m], self.a[i]
            i = m

    @classmethod
    def heapify(cls, data):              # build in O(n)
        h = cls()
        h.a = list(data)
        for i in range(len(h.a) // 2 - 1, -1, -1):
            h._sift_down(i)
        return h`,
              zh: `class MinHeap:
    def __init__(self):
        self.a = []                      # 直接用 list 当底层数组

    def peek(self):                      # 读最小值,O(1)
        return self.a[0]                 # 堆顶永远在下标 0

    def push(self, x):                   # 插入,O(log n)
        self.a.append(x)                 # ① 写到尾部
        self._sift_up(len(self.a) - 1)   # ② 上浮

    def pop(self):                       # 取走最小值,O(log n)
        top = self.a[0]                  # ① 堆顶就是答案
        last = self.a.pop()              # 摘掉末尾元素
        if self.a:                       # 堆还没空
            self.a[0] = last             # ② 它补到堆顶
            self._sift_down(0)           # ③ 下沉,修复堆序
        return top

    def _sift_up(self, i):               # 和父结点比,更小就往上换
        while i > 0:
            p = (i - 1) // 2             # 父结点下标
            if self.a[i] >= self.a[p]:   # 不比父结点小,停
                break
            self.a[i], self.a[p] = self.a[p], self.a[i]
            i = p

    def _sift_down(self, i):             # 和较小的孩子比,更大就往下换
        n = len(self.a)
        while True:
            l, r, m = 2 * i + 1, 2 * i + 2, i
            if l < n and self.a[l] < self.a[m]:  # 左孩子更小?
                m = l
            if r < n and self.a[r] < self.a[m]:  # 右孩子更小?
                m = r
            if m == i:                   # 比两个孩子都小,或者没有孩子
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
            },
            hl: [20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
            note: {
              en: (
                <>
                  <b>Do not write this in production:</b> the standard library
                  module <code>heapq</code> is the same algorithm implemented in
                  C (<code>heappush</code>, <code>heappop</code>,{" "}
                  <code>heapify</code>). Writing it by hand here is only to see
                  the inside. §05 shows how to use <code>heapq</code> directly.
                </>
              ),
              zh: (
                <>
                  <b>实际项目里别手写:</b>标准库的 <code>heapq</code>{" "}
                  就是同一套算法的 C 实现(<code>heappush</code>、
                  <code>heappop</code>、<code>heapify</code>)。
                  这里手写只为看清内部;§05 教你怎么直接用 <code>heapq</code>。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `class MinHeap {
  constructor() {
    this.a = [];                        // backing array
  }

  peek() {                              // read the minimum, O(1)
    return this.a[0];                   // the root is always at index 0
  }

  push(x) {                             // insert, O(log n)
    this.a.push(x);                     // 1. write at the end
    this.#siftUp(this.a.length - 1);    // 2. move it up
  }

  pop() {                               // remove the minimum, O(log n)
    const top = this.a[0];              // 1. the root is the answer
    const last = this.a.pop();          // take the last element off
    if (this.a.length) {                // the heap is not empty yet
      this.a[0] = last;                 // 2. it takes the root
      this.#siftDown(0);                // 3. sift down to repair the order
    }
    return top;
  }

  #siftUp(i) {                          // compare with the parent, swap if smaller
    while (i > 0) {
      const p = (i - 1) >> 1;           // index of the parent (>>1 divides by 2)
      if (this.a[i] >= this.a[p]) break;// not smaller than the parent: stop
      [this.a[i], this.a[p]] = [this.a[p], this.a[i]];
      i = p;
    }
  }

  #siftDown(i) {                        // compare with the smaller child
    const n = this.a.length;
    while (true) {
      let l = 2 * i + 1, r = 2 * i + 2, m = i;
      if (l < n && this.a[l] < this.a[m]) m = l;  // is the left child smaller?
      if (r < n && this.a[r] < this.a[m]) m = r;  // is the right child smaller?
      if (m === i) break;               // smaller than both, or no child
      [this.a[i], this.a[m]] = [this.a[m], this.a[i]];
      i = m;
    }
  }

  static heapify(data) {                // build in O(n)
    const h = new MinHeap();
    h.a = [...data];
    for (let i = (h.a.length >> 1) - 1; i >= 0; i--) h.#siftDown(i);
    return h;
  }
}`,
              zh: `class MinHeap {
  constructor() {
    this.a = [];                        // 底层数组
  }

  peek() {                              // 读最小值,O(1)
    return this.a[0];                   // 堆顶永远在下标 0
  }

  push(x) {                             // 插入,O(log n)
    this.a.push(x);                     // ① 写到尾部
    this.#siftUp(this.a.length - 1);    // ② 上浮
  }

  pop() {                               // 取走最小值,O(log n)
    const top = this.a[0];              // ① 堆顶就是答案
    const last = this.a.pop();          // 摘掉末尾元素
    if (this.a.length) {                // 堆还没空
      this.a[0] = last;                 // ② 它补到堆顶
      this.#siftDown(0);                // ③ 下沉,修复堆序
    }
    return top;
  }

  #siftUp(i) {                          // 和父结点比,更小就往上换
    while (i > 0) {
      const p = (i - 1) >> 1;           // 父结点下标(>>1 就是整除 2)
      if (this.a[i] >= this.a[p]) break;// 不比父结点小,停
      [this.a[i], this.a[p]] = [this.a[p], this.a[i]];
      i = p;
    }
  }

  #siftDown(i) {                        // 和较小的孩子比,更大就往下换
    const n = this.a.length;
    while (true) {
      let l = 2 * i + 1, r = 2 * i + 2, m = i;
      if (l < n && this.a[l] < this.a[m]) m = l;  // 左孩子更小?
      if (r < n && this.a[r] < this.a[m]) m = r;  // 右孩子更小?
      if (m === i) break;               // 比两个孩子都小,或者没有孩子
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
            },
            hl: [25, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
            note: {
              en: (
                <>
                  <b>Why you should know this by heart:</b> JavaScript has{" "}
                  <b>no</b> built-in heap or priority queue (§05 has the
                  details). In an interview or a timed contest you often have to
                  write one on the spot, so practise these 40 lines until you can
                  reproduce them without thinking. Top-K and Dijkstra both need
                  them.
                </>
              ),
              zh: (
                <>
                  <b>为什么这段值得背下来:</b>JavaScript <b>没有</b>
                  内置的堆或优先队列(§05 详述)。
                  面试和笔试里经常要当场手写一个,
                  把这 40 行练到不用想就能写出来,Top-K 和 Dijkstra 才有把握。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{ en: "Check that you really got it", zh: "检验你真的懂了" }}
        >
          <T
            en={
              <p>
                Close the code and answer three questions. 1. Why does{" "}
                <code>pop</code> move the <b>last</b> element to the root instead
                of one of the children? (Because only removing the last slot
                keeps the tree complete.) 2. When does{" "}
                <code>if (m === i) break</code> in <code>siftDown</code> trigger?
                (When the current node is already ≤ both children, or it has no
                child at all.) 3. How many places must change to turn this
                min-heap into a max-heap? (Two: the direction of the two
                comparisons.)
              </p>
            }
            zh={
              <p>
                合上代码回答三个问题:① <code>pop</code> 为什么把
                <b>最后一个</b>元素搬到堆顶,而不是拿某个孩子补?
                (因为只有删掉末尾才不破坏完全二叉树的形状)
                ② <code>siftDown</code> 里的{" "}
                <code>if (m === i) break</code> 什么时候触发?
                (当前结点已经 ≤ 两个孩子,或者它根本没有孩子)
                ③ 把这个小根堆改成大根堆,最少要改几处?
                (两处 —— 两个比较的方向)
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §05 三语言对照 ================= */}
      <Section
        id="langs"
        index="05"
        title={{
          en: "Three languages: two ship a heap, one does not",
          zh: "三语言对照:两个自带引擎,一个要你自己造",
        }}
        desc={{
          en: "Java has PriorityQueue, Python has heapq, JavaScript has nothing built in",
          zh: "Java 给你 PriorityQueue,Python 给你 heapq,JavaScript 什么都没给",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                §04 exists so you understand the mechanism. When you solve
                problems, use what the language provides. The three differ a lot
                here. Java has <code>PriorityQueue</code> ready to use. Python
                has <code>heapq</code>, a set of functions that operate on a
                plain list. <strong>JavaScript has no built-in heap</strong>,
                which is why the previous section asked you to memorise one.
                Remember two shared traps:{" "}
                <strong>Java and Python both default to a min-heap</strong>, so a
                max-heap takes extra work; and{" "}
                <strong>iterating a heap does not give you sorted order</strong>,
                so the only way to read the elements in order is to remove them
                one at a time.
              </p>
            }
            zh={
              <p>
                §04 是为了让你理解机制,真正做题时用语言自带的实现。
                三种语言在这里差别很大:Java 有开箱即用的{" "}
                <code>PriorityQueue</code>;Python 有 <code>heapq</code> ——
                一组直接操作普通 list 的函数;
                <strong>JavaScript 没有内置的堆</strong>,
                这也是上一节要你把手写堆记熟的原因。
                有两个共同的坑要记住:
                <strong>Java 和 Python 默认都是小根堆</strong>,想要大根堆得动手;
                <strong>遍历堆不会得到有序结果</strong>,
                想按顺序读只能一个个取出来。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="heap_stdlib"
          java={{
            code: {
              en: `import java.util.*;

// Java: PriorityQueue is a min-heap by default
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
minHeap.offer(5);
minHeap.offer(1);
minHeap.offer(3);
minHeap.peek();     // 1 - read the root without removing it, O(1)
minHeap.poll();     // 1 - remove the minimum, O(log n)

// max-heap: pass a Comparator that reverses the order
PriorityQueue<Integer> maxHeap =
    new PriorityQueue<>(Comparator.reverseOrder());

// custom order: sort int[] {distance, id} by distance, smallest first
PriorityQueue<int[]> pq =
    new PriorityQueue<>((x, y) -> Integer.compare(x[0], y[0]));

// build from a collection: the constructor heapifies in O(n)
PriorityQueue<Integer> h = new PriorityQueue<>(List.of(5, 1, 3));`,
              zh: `import java.util.*;

// Java:PriorityQueue 默认就是小根堆
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
minHeap.offer(5);
minHeap.offer(1);
minHeap.offer(3);
minHeap.peek();     // 1 —— 读堆顶但不删除,O(1)
minHeap.poll();     // 1 —— 取走最小值,O(log n)

// 大根堆:传一个反序的 Comparator
PriorityQueue<Integer> maxHeap =
    new PriorityQueue<>(Comparator.reverseOrder());

// 自定义顺序:int[]{距离, id} 按距离从小到大
PriorityQueue<int[]> pq =
    new PriorityQueue<>((x, y) -> Integer.compare(x[0], y[0]));

// 从集合建堆:构造器内部做 O(n) 的 heapify
PriorityQueue<Integer> h = new PriorityQueue<>(List.of(5, 1, 3));`,
            },
            note: {
              en: (
                <>
                  <b>Two traps.</b> 1. Iteration (<code>for (int x : pq)</code>{" "}
                  or <code>toString()</code>) walks the backing array, so the{" "}
                  <b>order is not meaningful</b>. To read the values in ascending
                  order, call <code>poll()</code> repeatedly. 2. Do not write a
                  comparator as <code>x[0] - y[0]</code>. Subtracting two int
                  values can overflow when one is large and the other is very
                  negative, and the sign then comes out wrong. Use{" "}
                  <code>Integer.compare</code>.
                </>
              ),
              zh: (
                <>
                  <b>两个坑。</b>① 遍历(<code>for (int x : pq)</code> 或{" "}
                  <code>toString()</code>)走的是底层数组,
                  <b>顺序没有意义</b>;想按升序读只能反复 <code>poll()</code>。
                  ② 比较器别写成 <code>x[0] - y[0]</code>:
                  两个 int 相减在一大一负时可能溢出,符号就反了 ——
                  老老实实用 <code>Integer.compare</code>。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `import heapq

# Python: heapq is a set of functions over a plain list, not a class.
# It is a min-heap only.
nums = [5, 1, 3]
heapq.heapify(nums)          # build in place, O(n) -> [1, 5, 3]
heapq.heappush(nums, 2)      # insert, O(log n)
heapq.heappop(nums)          # 1 - remove the minimum, O(log n)
nums[0]                      # peek: read the minimum, O(1)

# There is no max-heap. The usual trick is to store negated values.
maxq = []
heapq.heappush(maxq, -5)     # negate on the way in
top = -heapq.heappop(maxq)   # negate again on the way out -> 5

# Ready-made Top-K, internally a heap of size k
heapq.nlargest(2, nums)      # the 2 largest
heapq.nsmallest(2, nums)     # the 2 smallest

# Compound elements: pack a tuple. Item 1 is compared first,
# and item 2 only breaks a tie.
heapq.heappush(pq, (freq, word))`,
              zh: `import heapq

# Python:heapq 是一组操作普通 list 的函数,不是类。
# 它只有小根堆。
nums = [5, 1, 3]
heapq.heapify(nums)          # 原地建堆,O(n) -> [1, 5, 3]
heapq.heappush(nums, 2)      # 插入,O(log n)
heapq.heappop(nums)          # 1 —— 取走最小值,O(log n)
nums[0]                      # peek:读最小值,O(1)

# 没有大根堆。惯用技巧是存负数。
maxq = []
heapq.heappush(maxq, -5)     # 进去时取负
top = -heapq.heappop(maxq)   # 出来时再取负还原 -> 5

# 现成的 Top-K,内部就是容量 k 的堆
heapq.nlargest(2, nums)      # 最大的 2 个
heapq.nsmallest(2, nums)     # 最小的 2 个

# 复合元素:打包成元组,先比第 1 项,
# 第 1 项相等时才用第 2 项决胜负。
heapq.heappush(pq, (freq, word))`,
            },
            note: {
              en: (
                <>
                  <b>Easy to get wrong:</b> if tuple comparison reaches an item
                  whose type has no ordering (for example two equal counts
                  followed by a custom object), Python raises{" "}
                  <code>TypeError</code>. The usual fix is to put an{" "}
                  <b>increasing counter</b> in the middle as a tie-breaker, as in{" "}
                  <code>(freq, idx, obj)</code>. The counter is never repeated,
                  so the comparison never reaches the object.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>元组比较如果比到某一项是
                  <b>不可比较的类型</b>(例如两个 freq 相等,接着要比自定义对象),
                  Python 会抛 <code>TypeError</code>。
                  惯用解法是在中间塞一个<b>自增序号</b>当决胜项,如{" "}
                  <code>(freq, idx, obj)</code> —— 序号永不重复,
                  所以永远比不到对象本身。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// JavaScript has no built-in heap or priority queue. Two options:

// 1. Write one yourself (the 40 lines from §04)
const h = new MinHeap();
h.push(5);
h.push(1);
h.peek();           // 1
h.pop();            // 1

// 2. The LeetCode runtime ships a third-party package
const { MinPriorityQueue, MaxPriorityQueue } =
  require('@datastructures-js/priority-queue');

const pq = new MinPriorityQueue();
pq.enqueue(5);
pq.enqueue(1);
pq.front();         // read the smallest element
pq.dequeue();       // remove the smallest element

// custom priority: a smaller priority leaves first
const q = new MinPriorityQueue({ priority: (x) => x.dist });`,
              zh: `// JavaScript 没有内置的堆或优先队列。两条路:

// ① 自己手写(§04 那 40 行)
const h = new MinHeap();
h.push(5);
h.push(1);
h.peek();           // 1
h.pop();            // 1

// ② LeetCode 运行环境预装了第三方包
const { MinPriorityQueue, MaxPriorityQueue } =
  require('@datastructures-js/priority-queue');

const pq = new MinPriorityQueue();
pq.enqueue(5);
pq.enqueue(1);
pq.front();         // 读最小的元素
pq.dequeue();       // 取走最小的元素

// 自定义优先级:priority 越小越先出
const q = new MinPriorityQueue({ priority: (x) => x.dist });`,
            },
            note: {
              en: (
                <>
                  <b>Two warnings.</b> 1. Never use <code>arr.sort()</code> as a
                  substitute for a heap. Re-sorting after every insert costs O(n
                  log n) per update instead of O(log n), and large inputs will
                  time out. 2. The API of{" "}
                  <code>@datastructures-js/priority-queue</code> changed between
                  major versions: older releases take{" "}
                  <code>{"{ priority: fn }"}</code> and return a{" "}
                  <code>{"{ element, priority }"}</code> wrapper, newer ones take
                  a comparator and return the element itself. Since you cannot be
                  sure which version the judge has, writing your own heap is the
                  safer choice.
                </>
              ),
              zh: (
                <>
                  <b>两个提醒。</b>① 千万别用 <code>arr.sort()</code> 冒充堆:
                  每次插入后重排是单次 O(n log n),而不是 O(log n),
                  数据一大就会超时。② <code>@datastructures-js/priority-queue</code>{" "}
                  的 API 在大版本之间变过:旧版本收{" "}
                  <code>{"{ priority: fn }"}</code>、返回{" "}
                  <code>{"{ element, priority }"}</code> 包装对象,
                  新版本收比较器、直接返回元素本身。
                  既然无法确定评测机装的是哪个版本,自己手写堆更保险。
                </>
              ),
            },
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Operation" zh="操作" />
                </th>
                <th>
                  Java <code>PriorityQueue</code>
                </th>
                <th>
                  Python <code>heapq</code>
                </th>
                <th>
                  <T
                    en="JavaScript (hand-written / package)"
                    zh="JavaScript(手写 / 第三方)"
                  />
                </th>
                <th>
                  <T en="Cost" zh="复杂度" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <T en="Create an empty min-heap" zh="建空的小根堆" />
                </td>
                <td>
                  <code>new PriorityQueue&lt;&gt;()</code>
                </td>
                <td>
                  <code>[]</code> <T en="(used with heapq)" zh="(配合 heapq)" />
                </td>
                <td>
                  <code>new MinHeap()</code>
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Read the root" zh="读堆顶" /> peek
                </td>
                <td>
                  <code>pq.peek()</code>
                </td>
                <td>
                  <code>h[0]</code>
                </td>
                <td>
                  <code>h.peek()</code>
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Insert" zh="插入" /> push
                </td>
                <td>
                  <code>pq.offer(x)</code>
                </td>
                <td>
                  <code>heapq.heappush(h, x)</code>
                </td>
                <td>
                  <code>h.push(x)</code>
                </td>
                <td>
                  <BigO o="logn" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Remove the root" zh="取走最值" /> pop
                </td>
                <td>
                  <code>pq.poll()</code>
                </td>
                <td>
                  <code>heapq.heappop(h)</code>
                </td>
                <td>
                  <code>h.pop()</code>
                </td>
                <td>
                  <BigO o="logn" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Number of elements" zh="元素个数" />
                </td>
                <td>
                  <code>pq.size()</code>
                </td>
                <td>
                  <code>len(h)</code>
                </td>
                <td>
                  <code>h.size()</code>
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Build from existing data" zh="从已有数据建堆" />
                </td>
                <td>
                  <code>new PriorityQueue&lt;&gt;(coll)</code>
                </td>
                <td>
                  <code>heapq.heapify(h)</code>
                </td>
                <td>
                  <code>MinHeap.heapify(a)</code>
                </td>
                <td>
                  <BigO o="n" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Max-heap" zh="大根堆" />
                </td>
                <td>
                  <code>Comparator.reverseOrder()</code>
                </td>
                <td>
                  <T en="store negated values" zh="存元素的负数" />
                </td>
                <td>
                  <T
                    en="pass a comparator / store negated values"
                    zh="传比较器 / 存负数"
                  />
                </td>
                <td>—</td>
              </tr>
              <tr>
                <td>
                  <T en="Top-K shortcut" zh="Top-K 捷径" />
                </td>
                <td>
                  <T
                    en="(maintain a heap of size k yourself)"
                    zh="(自己维护容量 k 的堆)"
                  />
                </td>
                <td>
                  <code>heapq.nlargest(k, h)</code>
                </td>
                <td>
                  <T
                    en="(maintain a heap of size k yourself)"
                    zh="(自己维护容量 k 的堆)"
                  />
                </td>
                <td>
                  <BigO o="nlogn" label="O(n log k)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ================= §06 套路与精讲 ================= */}
      <Section
        id="patterns"
        index="06"
        title={{
          en: "Patterns: Top-K and the heap that points the other way",
          zh: "套路与精讲:Top-K 与那把「反过来的锁」",
        }}
        desc={{
          en: "When a problem says k-th largest, top k, or merge k sorted lists, think heap. Three worked examples, frame by frame",
          zh: "看到「第 K 大 / 前 K 个 / 合并 K 路」,先想堆 —— 三道代表题逐帧拆解",
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
                Most heap problems fall into three patterns. 1.{" "}
                <strong>Top-K</strong>: the k-th largest or smallest value, the k
                most frequent items, the k nearest points. 2.{" "}
                <strong>Repeatedly take the extreme and put something back</strong>
                : each step greedily uses the current extreme value and then
                inserts an updated value, as in task scheduling, reorganising a
                string, or smashing stones. 3.{" "}
                <strong>Merge k sorted sequences</strong>: k linked lists or k
                rows of a matrix. The three worked examples below take one pattern
                each. Start with the part of Top-K that surprises everyone.
              </p>
            }
            zh={
              <p>
                堆的题目大多落在三个套路里:①{" "}
                <strong>Top-K</strong>(第 K 大 / 第 K 小、前 K 个高频、最近的 K 个点);
                ② <strong>反复取最值,取完还要塞回新值</strong>
                (每一步贪心地用当前最值,再插入更新后的值 ——
                任务调度、重构字符串、粉碎石头都是这一类);
                ③ <strong>合并 K 路有序序列</strong>(K 条链表或 K 行矩阵)。
                下面三道精讲各挑一个套路。先讲 Top-K 里最出人意料的那一点。
              </p>
            }
          />
        </div>
        <Callout
          tone="idea"
          title={{
            en: "The Top-K rule: to find the k-th largest, use a min-heap",
            zh: "Top-K 总纲:求第 K 大,反而要用小根堆",
          }}
        >
          <T
            en={
              <p>
                The first guess is usually &quot;k-th <b>largest</b>, so use a
                max-heap&quot;. It is the other way round. The standard solution
                is a <b>min-heap holding at most k elements</b>. Once this clicks,
                most Top-K problems become the same problem. The reasoning: you
                want to keep the k largest values seen so far, and whenever a
                better value arrives you must <b>evict the weakest of the k you
                already have</b>. The weakest of those k is their{" "}
                <b>minimum</b>, and reading the minimum at any moment is exactly
                what a <b>min-heap</b> does in O(1). So the root becomes the{" "}
                <b>entry threshold</b>: a new value enters only if it is{" "}
                <b>larger</b> than the root, and the old root is removed to make
                room. After scanning all n values, the heap holds the k largest,
                and <b>the root is the k-th largest</b>. The mirror case: for the
                k-th <b>smallest</b>, use a <b>max-heap</b> of size k, whose root
                is the largest of the k candidates. The general rule:{" "}
                <b>
                  choose the heap that puts the element you would evict first at
                  the root
                </b>
                . Cost is O(n log k), which beats sorting at O(n log n) whenever
                k is much smaller than n.
              </p>
            }
            zh={
              <p>
                第一反应通常是「求第 K <b>大</b>,当然用大根堆」。其实正好相反:
                标准解法是<b>一个最多装 k 个元素的小根堆</b>。
                想通这一点,大部分 Top-K 题就变成同一道题了。
                道理是这样的:你要留住「迄今最大的 k 个」,
                每当有更强的新值进来,就必须<b>踢掉已有 k 个里最弱的那个</b>。
                这 k 个里最弱的就是它们的<b>最小值</b>,
                而随时 O(1) 读出最小值正是<b>小根堆</b>的本事。
                于是堆顶成了<b>入围门槛</b>:新值只有<b>比堆顶大</b>才进得来,
                同时把旧堆顶挤出去。扫完 n 个值,堆里就是最大的 k 个,
                <b>堆顶正是第 K 大</b>。镜像情况:求第 K <b>小</b>就用容量 k 的
                <b>大根堆</b>,堆顶是这 k 个候选里最大的。总规律是:
                <b>选那种能把「最该被踢的元素」放在堆顶的堆</b>。
                代价是 O(n log k) —— 只要 k 远小于 n,就比 O(n log n) 的排序划算。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 40 }}>
          <span className="sec-index">
            <T en="EXAMPLE A" zh="精讲 A" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 215 · Kth Largest Element in an Array"
              zh="LC 215 · 数组中第 K 个最大元素"
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
                <b>Task:</b> return the k-th largest element of an array.
                Duplicates count, so it is not the k-th{" "}
                <b>distinct</b> value. <b>Brute force:</b> sort the whole array
                in O(n log n) and take the k-th from the end. That passes, but it
                computes the order of every element to answer a question about
                one. <b>Standard solution:</b> apply the rule above with a{" "}
                <strong>min-heap of size k</strong>, where the root is the
                threshold. Here is the run for k = 2.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>返回数组里第 k 大的元素。重复元素照常计数,
                所以不是第 k 个<b>不同</b>的值。
                <b>暴力:</b>整个数组排序 O(n log n),取倒数第 k 个。
                能过,但为了回答关于一个元素的问题,把所有元素的顺序都算了出来。
                <b>正解:</b>套用上面的规律 ——
                <strong>容量 k 的小根堆</strong>,堆顶就是门槛。下面是 k = 2 的过程。
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 215 · min-heap of size 2 (cells: what the heap holds, plus the incoming value)",
            zh: "LC 215 · 容量 2 的小根堆(格子:堆里的值,以及待检验的新数)",
          }}
          frames={F215}
          cellW={84}
        />
        <CodeTabs
          title="lc215_kth_largest"
          java={{
            code: {
              en: `import java.util.*;

class Solution {
    public int findKthLargest(int[] nums, int k) {
        // min-heap: the root is the smallest of the k largest so far,
        // which makes it the entry threshold
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int x : nums) {
            heap.offer(x);              // let the new value in
            if (heap.size() > k)        // over capacity k
                heap.poll();            // drop the threshold (the root)
        }
        return heap.peek();             // the root is the k-th largest
    }
}`,
              zh: `import java.util.*;

class Solution {
    public int findKthLargest(int[] nums, int k) {
        // 小根堆:堆顶是「迄今最大的 k 个」里最小的,
        // 也就是入围门槛
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int x : nums) {
            heap.offer(x);              // 新值先进来
            if (heap.size() > k)        // 超过容量 k
                heap.poll();            // 踢掉门槛(堆顶)
        }
        return heap.peek();             // 堆顶就是第 k 大
    }
}`,
            },
            hl: [8, 9, 10, 11, 12],
          }}
          python={{
            code: {
              en: `import heapq

class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        heap = []                       # min-heap of size k
        for x in nums:
            heapq.heappush(heap, x)
            if len(heap) > k:
                heapq.heappop(heap)     # drop the threshold (the smallest)
        return heap[0]                  # the root is the k-th largest

    # equivalent one-liner, backed by the same size-k heap:
    # return heapq.nlargest(k, nums)[-1]`,
              zh: `import heapq

class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        heap = []                       # 容量 k 的小根堆
        for x in nums:
            heapq.heappush(heap, x)
            if len(heap) > k:
                heapq.heappop(heap)     # 踢掉门槛(最小的那个)
        return heap[0]                  # 堆顶就是第 k 大

    # 等价的一行写法,内部同样是容量 k 的堆:
    # return heapq.nlargest(k, nums)[-1]`,
            },
            hl: [6, 7, 8, 9, 10],
          }}
          js={{
            code: {
              en: `// Reuse the MinHeap from §04: JavaScript has no built-in heap
var findKthLargest = function (nums, k) {
  const heap = new MinHeap();
  for (const x of nums) {
    heap.push(x);
    if (heap.size() > k) heap.pop();    // drop the threshold
  }
  return heap.peek();                   // the root is the k-th largest
};`,
              zh: `// 复用 §04 的 MinHeap:JavaScript 没有内置的堆
var findKthLargest = function (nums, k) {
  const heap = new MinHeap();
  for (const x of nums) {
    heap.push(x);
    if (heap.size() > k) heap.pop();    // 踢掉门槛
  }
  return heap.peek();                   // 堆顶就是第 k 大
};`,
            },
            hl: [4, 5, 6, 7],
          }}
        />
        <Callout
          tone="win"
          title={{ en: "Cost and follow-up", zh: "复杂度与追问" }}
        >
          <T
            en={
              <p>
                Time <b>O(n log k)</b>: n values, each entering and leaving a
                heap of size k at most once. Space <b>O(k)</b>. The classic
                follow-up is <b>&quot;can you do it in O(n)?&quot;</b> Yes, with{" "}
                <b>quickselect</b>: reuse the partition step of quicksort and
                recurse into <b>one side only</b>. That is O(n) on average and
                O(n²) in the worst case, which a random pivot makes very
                unlikely. So why is the heap solution still common? Two reasons.
                First, in a <b>stream</b> the values keep arriving and there is
                no complete array to partition. Second, when the data does{" "}
                <b>not fit in memory</b>, a heap of size k needs only O(k) space.
                A full answer explains both solutions and when each one applies.
              </p>
            }
            zh={
              <p>
                时间 <b>O(n log k)</b>:n 个值,每个至多进出一次容量 k 的堆;
                空间 <b>O(k)</b>。经典追问是<b>「能做到 O(n) 吗?」</b>
                能,用<b>快速选择(quickselect)</b>:
                复用快排的 partition,每轮只递归<b>一边</b>,
                平均 O(n),最坏 O(n²)(随机选基准可以让最坏情况极难出现)。
                那堆解法为什么还常用?两个原因:
                第一,<b>数据流</b>场景里值源源不断,根本没有完整数组给你 partition;
                第二,数据<b>放不进内存</b>时,容量 k 的堆只要 O(k) 空间。
                完整的回答要讲清两种解法各自的适用场景。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="EXAMPLE B" zh="精讲 B" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 347 · Top K Frequent Elements" zh="LC 347 · 前 K 个高频元素" />
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
                <b>Task:</b> return the k most frequent elements of an array.{" "}
                <b>Brute force:</b> count the frequencies, sort by frequency, and
                take the first k, at O(n log n). <b>Standard solution:</b> this is
                the first problem where you{" "}
                <strong>combine two structures</strong>. One structure is not
                enough, so chain two: a <strong>hash map counts each value in
                O(n)</strong> (chapter 6), and then those counts are fed into a{" "}
                <strong>min-heap of size k</strong> for the Top-K step (this
                chapter). Note that the heap is ordered{" "}
                <strong>by count</strong>, so the threshold is the lowest count
                still in the heap.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>返回数组里出现频率前 k 高的元素。
                <b>暴力:</b>统计频率后按频率排序,取前 k 个,O(n log n)。
                <b>正解:</b>这是你的第一道<strong>组合两种结构</strong>的题:
                一种结构不够,就串两种 ——
                先用<strong>哈希表 O(n) 数出每个值的频次</strong>(第 6 章的活),
                再把这些频次喂给<strong>容量 k 的小根堆</strong>做 Top-K
                (本章的活)。注意堆是<strong>按频次</strong>排序的,
                所以门槛是仍在堆里的最低频次。
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 347 · hash counting + min-heap of size 2 (cells show counts)",
            zh: "LC 347 · 哈希计数 + 容量 2 的小根堆(格子里是频次)",
          }}
          frames={F347}
          cellW={84}
        />
        <CodeTabs
          title="lc347_top_k_frequent"
          java={{
            code: {
              en: `import java.util.*;

class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        // 1. hash counting: value -> how many times it appears
        Map<Integer, Integer> cnt = new HashMap<>();
        for (int x : nums) cnt.merge(x, 1, Integer::sum);

        // 2. min-heap of size k ordered by count;
        //    the root is the lowest count still in
        PriorityQueue<int[]> heap =            // int[]{value, count}
            new PriorityQueue<>((a, b) -> Integer.compare(a[1], b[1]));
        for (var e : cnt.entrySet()) {
            heap.offer(new int[]{e.getKey(), e.getValue()});
            if (heap.size() > k) heap.poll();  // drop the lowest count
        }

        // 3. read the answer out
        int[] ans = new int[k];
        for (int i = 0; i < k; i++) ans[i] = heap.poll()[0];
        return ans;
    }
}`,
              zh: `import java.util.*;

class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        // ① 哈希计数:值 -> 出现次数
        Map<Integer, Integer> cnt = new HashMap<>();
        for (int x : nums) cnt.merge(x, 1, Integer::sum);

        // ② 容量 k 的小根堆,按频次排序;
        //    堆顶是仍在堆里的最低频次
        PriorityQueue<int[]> heap =            // int[]{值, 频次}
            new PriorityQueue<>((a, b) -> Integer.compare(a[1], b[1]));
        for (var e : cnt.entrySet()) {
            heap.offer(new int[]{e.getKey(), e.getValue()});
            if (heap.size() > k) heap.poll();  // 踢掉频次最低的
        }

        // ③ 把答案倒出来
        int[] ans = new int[k];
        for (int i = 0; i < k; i++) ans[i] = heap.poll()[0];
        return ans;
    }
}`,
            },
            hl: [9, 10, 11, 12, 13, 14, 15, 16],
          }}
          python={{
            code: {
              en: `import heapq
from collections import Counter

class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        cnt = Counter(nums)                 # 1. hash counting
        # 2. min-heap of size k ordered by count; store (count, value)
        heap = []
        for num, freq in cnt.items():
            heapq.heappush(heap, (freq, num))
            if len(heap) > k:
                heapq.heappop(heap)         # drop the lowest count
        return [num for freq, num in heap]  # 3. read the answer out

    # Counter has a shortcut:
    # return [x for x, _ in cnt.most_common(k)]`,
              zh: `import heapq
from collections import Counter

class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        cnt = Counter(nums)                 # ① 哈希计数
        # ② 容量 k 的小根堆,按频次排序;堆里存 (频次, 值)
        heap = []
        for num, freq in cnt.items():
            heapq.heappush(heap, (freq, num))
            if len(heap) > k:
                heapq.heappop(heap)         # 踢掉频次最低的
        return [num for freq, num in heap]  # ③ 把答案倒出来

    # Counter 自带捷径:
    # return [x for x, _ in cnt.most_common(k)]`,
            },
            hl: [7, 8, 9, 10, 11, 12],
          }}
          js={{
            code: {
              en: `var topKFrequent = function (nums, k) {
  // 1. hash counting
  const cnt = new Map();
  for (const x of nums) cnt.set(x, (cnt.get(x) ?? 0) + 1);

  // 2. min-heap of size k, priority = the count
  const { MinPriorityQueue } = require('@datastructures-js/priority-queue');
  const pq = new MinPriorityQueue({ priority: (o) => o.freq });
  for (const [num, freq] of cnt) {
    pq.enqueue({ num, freq });
    if (pq.size() > k) pq.dequeue();      // drop the lowest count
  }

  // 3. read the answer out
  const ans = [];
  while (!pq.isEmpty()) ans.push(pq.dequeue().element.num);
  return ans;
};`,
              zh: `var topKFrequent = function (nums, k) {
  // ① 哈希计数
  const cnt = new Map();
  for (const x of nums) cnt.set(x, (cnt.get(x) ?? 0) + 1);

  // ② 容量 k 的小根堆,priority = 频次
  const { MinPriorityQueue } = require('@datastructures-js/priority-queue');
  const pq = new MinPriorityQueue({ priority: (o) => o.freq });
  for (const [num, freq] of cnt) {
    pq.enqueue({ num, freq });
    if (pq.size() > k) pq.dequeue();      // 踢掉频次最低的
  }

  // ③ 把答案倒出来
  const ans = [];
  while (!pq.isEmpty()) ans.push(pq.dequeue().element.num);
  return ans;
};`,
            },
            hl: [6, 7, 8, 9, 10, 11, 12],
            note: {
              en: (
                <>
                  <b>If the package is not available:</b> for small inputs you can
                  write{" "}
                  <code>
                    [...cnt].sort((a,b)=&gt;b[1]-a[1]).slice(0,k).map(p=&gt;p[0])
                  </code>
                  , but that is O(n log n) rather than the heap&apos;s O(n log k).
                  Bucket sort reaches O(n) and is a good answer to the follow-up.
                </>
              ),
              zh: (
                <>
                  <b>没有第三方包时:</b>数据不大可以写{" "}
                  <code>
                    [...cnt].sort((a,b)=&gt;b[1]-a[1]).slice(0,k).map(p=&gt;p[0])
                  </code>
                  ,但那是 O(n log n),不是堆的 O(n log k)。
                  桶排序能做到 O(n),是追问时的加分答案。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{ en: "Cost and follow-up", zh: "复杂度与追问" }}
        >
          <T
            en={
              <p>
                Counting is O(n) and maintaining the heap is O(n log k), so the
                total is <b>O(n log k)</b>, with O(n) space for the hash map. The
                follow-up is <b>&quot;can you do it in O(n)?&quot;</b> Yes, with{" "}
                <b>bucket sort</b>: no count can exceed n, so create n + 1
                buckets and let <code>bucket[f]</code> hold every value that
                appears f times. Then collect from the highest bucket downwards
                until you have k values. No sorting and no heap are needed. Hash
                plus heap is the general solution that is easiest to remember;
                hash plus buckets is the O(n) special case.
              </p>
            }
            zh={
              <p>
                计数 O(n),维护堆 O(n log k),合计 <b>O(n log k)</b>,
                空间 O(n)(哈希表)。追问是<b>「能做到 O(n) 吗?」</b>
                能,用<b>桶排序</b>:任何频次都不会超过 n,
                所以开 n + 1 个桶,<code>bucket[f]</code> 装所有出现 f 次的值,
                再从频次最高的桶往下收集,凑够 k 个即可 —— 不用排序也不用堆。
                「哈希 + 堆」是最好记的通用解,「哈希 + 桶」是它的 O(n) 特化版。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="EXAMPLE C" zh="精讲 C" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 23 · Merge k Sorted Lists" zh="LC 23 · 合并 K 个升序链表" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="hard">
              HARD
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>Task:</b> merge k sorted linked lists into one sorted list.{" "}
                <b>Brute force:</b> copy every node value into an array, sort it,
                and rebuild the list, at O(N log N) where N is the total number of
                nodes. It works, but it{" "}
                <b>throws away the fact that each list is already sorted</b>.{" "}
                <b>Standard solution:</b> when merging sorted sequences, the next
                value of the answer is <b>always</b> the smallest among the
                current head nodes. Which structure reports the smallest of a
                changing set? A <strong>min-heap</strong>. So the heap holds{" "}
                <strong>only the k head nodes</strong>: take the smallest, then
                push the node that follows it.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>把 k 条各自升序的链表合并成一条升序链表。
                <b>暴力:</b>把所有结点值倒进数组、排序、再重建链表,
                O(N log N)(N 是结点总数)。能过,
                但它<b>浪费了「每条链已经有序」这个条件</b>。
                <b>正解:</b>合并有序序列时,答案的下一个值<b>一定</b>是
                当前各条链头结点里最小的那个。
                谁能报出一个不断变化的集合里的最小值?<strong>小根堆</strong>。
                所以堆里<strong>只装 k 个头结点</strong>:
                取走最小的,再把它的后继补进来。
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 23 · the heap holds k list heads (cells show the node values in the heap)",
            zh: "LC 23 · 堆里装着 K 个链表头(格子是堆里的结点值)",
          }}
          frames={F23}
          cellW={84}
        />
        <CodeTabs
          title="lc23_merge_k_lists"
          java={{
            code: {
              en: `import java.util.*;

class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        // min-heap ordered by node value; it holds only
        // the current head of each list
        PriorityQueue<ListNode> heap =
            new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
        for (ListNode head : lists)
            if (head != null) heap.offer(head);   // k heads go in

        ListNode dummy = new ListNode(0), tail = dummy;
        while (!heap.isEmpty()) {
            ListNode node = heap.poll();           // smallest of all lists
            tail.next = node;                      // append to the answer
            tail = node;
            if (node.next != null)                 // this list continues
                heap.offer(node.next);             // push its next node
        }
        return dummy.next;
    }
}`,
              zh: `import java.util.*;

class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        // 按结点值排序的小根堆;里面只装
        // 每条链当前的头结点
        PriorityQueue<ListNode> heap =
            new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
        for (ListNode head : lists)
            if (head != null) heap.offer(head);   // k 个头入堆

        ListNode dummy = new ListNode(0), tail = dummy;
        while (!heap.isEmpty()) {
            ListNode node = heap.poll();           // 所有链里最小的
            tail.next = node;                      // 接到答案后面
            tail = node;
            if (node.next != null)                 // 这条链还有后继
                heap.offer(node.next);             // 把后继压进堆
        }
        return dummy.next;
    }
}`,
            },
            hl: [13, 14, 15, 16, 17, 18],
          }}
          python={{
            code: {
              en: `import heapq

class Solution:
    def mergeKLists(self, lists: list[ListNode]) -> ListNode:
        # ListNode has no ordering, so push (val, index, node);
        # the index breaks ties before the node is ever compared
        heap = []
        for i, head in enumerate(lists):
            if head:
                heapq.heappush(heap, (head.val, i, head))

        dummy = tail = ListNode(0)
        while heap:
            val, i, node = heapq.heappop(heap)     # smallest of all lists
            tail.next = node
            tail = node
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))
        return dummy.next`,
              zh: `import heapq

class Solution:
    def mergeKLists(self, lists: list[ListNode]) -> ListNode:
        # ListNode 之间不可比较,所以压 (值, 序号, 结点);
        # 序号先分出胜负,永远轮不到比较结点本身
        heap = []
        for i, head in enumerate(lists):
            if head:
                heapq.heappush(heap, (head.val, i, head))

        dummy = tail = ListNode(0)
        while heap:
            val, i, node = heapq.heappop(heap)     # 所有链里最小的
            tail.next = node
            tail = node
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))
        return dummy.next`,
            },
            hl: [13, 14, 15, 16, 17, 18],
            note: {
              en: (
                <>
                  <b>The trap:</b> when two tuples have an equal{" "}
                  <code>val</code>, Python compares the next item. If that item
                  is the <code>node</code> itself and <code>ListNode</code> does
                  not define <code>&lt;</code>, you get a{" "}
                  <code>TypeError</code>. Putting a unique increasing index{" "}
                  <code>i</code> in between means the comparison never reaches the
                  node. This is the standard way to store objects in{" "}
                  <code>heapq</code>.
                </>
              ),
              zh: (
                <>
                  <b>核心坑:</b>两个元组的 <code>val</code> 相等时,
                  Python 会接着比下一项。如果那一项就是 <code>node</code>,
                  而 <code>ListNode</code> 没有定义 <code>&lt;</code>,
                  就会抛 <code>TypeError</code>。
                  在中间放一个唯一且递增的序号 <code>i</code>,
                  比较就永远到不了结点本身 —— 这是用 <code>heapq</code>{" "}
                  存对象的标准做法。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var mergeKLists = function (lists) {
  // priority = the node value; without the package, change the §04
  // MinHeap so that it compares .val instead of the value itself
  const { MinPriorityQueue } = require('@datastructures-js/priority-queue');
  const pq = new MinPriorityQueue({ priority: (node) => node.val });
  for (const head of lists) if (head) pq.enqueue(head);  // k heads go in

  const dummy = new ListNode(0);
  let tail = dummy;
  while (!pq.isEmpty()) {
    const node = pq.dequeue().element;   // smallest of all lists
    tail.next = node;
    tail = node;
    if (node.next) pq.enqueue(node.next);// push its next node
  }
  return dummy.next;
};`,
              zh: `var mergeKLists = function (lists) {
  // priority = 结点值;没有这个包时,把 §04 的 MinHeap
  // 改成比较 .val 而不是元素本身
  const { MinPriorityQueue } = require('@datastructures-js/priority-queue');
  const pq = new MinPriorityQueue({ priority: (node) => node.val });
  for (const head of lists) if (head) pq.enqueue(head);  // k 个头入堆

  const dummy = new ListNode(0);
  let tail = dummy;
  while (!pq.isEmpty()) {
    const node = pq.dequeue().element;   // 所有链里最小的
    tail.next = node;
    tail = node;
    if (node.next) pq.enqueue(node.next);// 把后继压进堆
  }
  return dummy.next;
};`,
            },
            hl: [10, 11, 12, 13, 14, 15],
          }}
        />
        <Callout
          tone="win"
          title={{ en: "Cost and follow-up", zh: "复杂度与追问" }}
        >
          <T
            en={
              <p>
                Let N be the total number of nodes. Each node enters and leaves
                the heap exactly once, and each heap operation costs O(log k),
                because the heap never holds more than k nodes. So the time is{" "}
                <b>O(N log k)</b> and the extra space is <b>O(k)</b>. Notice the
                link to the linked list chapter: the heap stores{" "}
                <b>nodes</b>, not values, so <code>next</code> already points at
                the rest of that list and nothing has to be copied. The classic
                follow-up is{" "}
                <b>&quot;can you solve it without a heap?&quot;</b> Yes, by{" "}
                <b>merging pairs of lists</b>: repeatedly apply &quot;merge two
                sorted lists&quot; (LC 21). k lists take log k rounds, each round
                scans O(N) nodes in total, so it is also O(N log k) and it does
                not need the heap&apos;s O(k) space.
              </p>
            }
            zh={
              <p>
                设结点总数为 N。每个结点恰好进堆、出堆各一次,
                每次堆操作 O(log k) —— 堆里最多只有 k 个结点。
                所以时间是 <b>O(N log k)</b>,额外空间 <b>O(k)</b>。
                注意这里和链表章的呼应:堆里存的是<b>结点</b>,
                靠 <code>next</code> 就能拿到每条链的剩余部分,不必把值抠出来。
                经典追问是<b>「不用堆行不行?」</b>行,用<b>两两归并</b>:
                反复调用「合并两个有序链表」(LC 21),k 条链 log k 轮合完,
                每轮总共扫 O(N) 个结点,同样是 O(N log k),
                而且不需要堆的 O(k) 空间。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title={{ en: "Problem set: 8 heap problems", zh: "高频题单:堆 8 题" }}
        desc={{
          en: "From the Top-K threshold heap, to repeatedly taking the extreme, to merging k sequences and two heaps facing each other",
          zh: "从 Top-K 门槛堆,到反复取最值,再到合并 K 路与对顶双堆 —— 由易到难",
        }}
        badge={
          <span className="chip">
            <T en="Interview regulars" zh="面试常客" />
          </span>
        }
      >
        <ProblemSet ch="heap" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 7 correctly to complete the chapter",
          zh: "7 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="heap" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                A heap promises <b>one thing: the top is the extreme value</b>.
                Siblings in any order and an unsorted backing array are both
                legal. Fewer promises means cheaper maintenance, O(log n) per
                update instead of O(n log n) for a full sort. That trade is the
                whole design.
              </>
            ),
            zh: (
              <>
                堆<b>只承诺一件事:堆顶是最值</b>。
                兄弟乱序、底层数组乱序都完全合法。
                承诺越少,维护越便宜:单次更新 O(log n),而不是全排序的 O(n log n)。
                这笔取舍就是它的全部设计。
              </>
            ),
          },
          {
            en: (
              <>
                Two rules: a <b>complete binary tree</b> (short and wide, height
                ⌊log₂n⌋, no gaps) and <b>parent ≤ child</b> for a min-heap.
                Because there are no gaps, the whole tree fits into an array and
                every link is computed: <code>parent = (i−1)/2</code>,{" "}
                <code>children = 2i+1, 2i+2</code>. <b>No pointers.</b>
              </>
            ),
            zh: (
              <>
                两条规矩:<b>完全二叉树</b>(又矮又宽,高度 ⌊log₂n⌋,没有空洞)
                和小根堆的 <b>父 ≤ 子</b>。正因为没有空洞,
                整棵树才能塞进数组,每条连线都是算出来的:
                <code>parent = (i−1)/2</code>、<code>children = 2i+1, 2i+2</code>,
                <b>不需要指针</b>。
              </>
            ),
          },
          {
            en: (
              <>
                push = write at the end + <b>sift up</b>. pop = read the root,
                move the last element up, + <b>sift down</b>. Both are{" "}
                <b>O(log n)</b>, one path down the height. peek is O(1). Building
                from data you already hold uses heapify and is <b>O(n)</b>,
                because the nodes that can sink far are the rare ones.
              </>
            ),
            zh: (
              <>
                push = 写到尾部 + <b>上浮</b>;pop = 读堆顶、末尾元素补位 +{" "}
                <b>下沉</b>。两者都是 <b>O(log n)</b>,走一条与树高等长的路径;
                peek 是 O(1)。数据已经在手上时用 heapify 建堆,是 <b>O(n)</b> ——
                因为能沉得深的结点恰恰最稀少。
              </>
            ),
          },
          {
            en: (
              <>
                <b>The Top-K rule that reverses your intuition</b>: for the k-th{" "}
                <b>largest</b>, use a <b>min-heap</b> of size k (the root is the
                threshold, and a value enters only if it is larger); for the k-th{" "}
                <b>smallest</b>, use a <b>max-heap</b>. Pick the heap that puts
                the element you would evict first at the root. Cost O(n log k).
              </>
            ),
            zh: (
              <>
                <b>Top-K 那条反直觉的规律</b>:求第 K <b>大</b>用容量 k 的
                <b>小根堆</b>(堆顶是门槛,比门槛大才进);求第 K <b>小</b>用
                <b>大根堆</b>。选那种能把「最该被踢的元素」放在堆顶的堆。
                代价是 O(n log k)。
              </>
            ),
          },
          {
            en: (
              <>
                A <b>priority queue</b> is the interface; a <b>binary heap</b> is
                the usual implementation. In practice: Java{" "}
                <code>PriorityQueue</code> is a min-heap by default and takes a{" "}
                <code>Comparator</code> such as <code>reverseOrder()</code> to
                flip it, and iterating it is unordered; Python{" "}
                <code>heapq</code> is a min-heap only, so a max-heap means{" "}
                <b>storing negated values</b>; JavaScript has{" "}
                <b>nothing built in</b>, so write your own or use a package.
              </>
            ),
            zh: (
              <>
                <b>优先队列</b>是接口,<b>二叉堆</b>是常见实现。工程上:
                Java 的 <code>PriorityQueue</code> 默认小根堆,
                传 <code>Comparator</code>(如 <code>reverseOrder()</code>)可以反向,
                而且遍历无序;Python 的 <code>heapq</code> 只有小根堆,
                大根堆靠<b>存负数</b>;JavaScript <b>没有内置实现</b>,
                只能手写或用第三方包。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="heap" />
    </main>
  );
}
