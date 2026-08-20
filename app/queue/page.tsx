"use client";

// 第 5 章 · 队列与双端队列 —— 十段式:
// 直觉(FIFO)→ 内存(搬移/浪费/绕圈 → 循环队列、链表、deque)→
// 核心操作(RingLab 环形实验室)→ 手写实现(循环队列 = LC 622 + 链表版)→
// 三语言对照(JS 没有现成的队列)→ 双栈模拟 + 单调队列专题 +
// 两道精讲(LC 232 / 239 逐帧)→ 题单 → 测验 → 要点。
//
// 双语:所有面向学习者的文案都用 <T en zh> 或 { en, zh },英文为默认语言。
// 代码窗的 code 写成 { en, zh } —— 两版逐行等价,只有注释不同,hl 行号才对得上。
// 术语与第 4 章(栈)保持一致:monotonic stack / monotonic deque、amortized、
// front / back、O(1) amortized。

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
import { PROBLEMS, QUIZ } from "@/lib/queue-data";
import { T } from "@/lib/i18n";
import { QueueMemFig, RingLab, TwoStackPour } from "./viz";

/* ================= 精讲动画帧 ================= */

// LC 239 滑动窗口最大值:nums = [5,3,1,4,2,6], k = 3
// lit = 在单调队列中,bad = 正在被弹出,ghost = 已滑出窗口,ok = 收官
// 代码弹出条件是 nums[back] <= nums[i](「不大于就弹」),所以队列里的值严格递减。
const F239: ArrayFrame[] = [
  {
    cells: [{ v: 5 }, { v: 3 }, { v: 1 }, { v: 4 }, { v: 2 }, { v: 6 }],
    msg: {
      en: (
        <>
          nums = [5,3,1,4,2,6], k = 3. Brute force scans k elements in every
          window: O(nk). A monotonic deque reads the window maximum in{" "}
          <b>O(1)</b> instead. The deque holds <b>indices</b>, and the values at
          those indices decrease from front to back. Highlighted = currently in
          the deque.
        </>
      ),
      zh: (
        <>
          nums = [5,3,1,4,2,6],k = 3。暴力做法每个窗口扫 k 个元素,O(nk)。
          单调队列改成 <b>O(1)</b> 直接读出窗口最大值:队列里存的是<b>下标</b>
          ,对应的值从队头到队尾递减。高亮 = 当前在队列中。
        </>
      ),
    },
  },
  {
    cells: [
      { v: 5, state: "lit" },
      { v: 3 },
      { v: 1 },
      { v: 4 },
      { v: 2 },
      { v: 6 },
    ],
    ptrs: [
      { i: 0, label: "i" },
      { i: 0, label: { en: "front", zh: "队头" } },
    ],
    msg: {
      en: (
        <>
          i = 0: the deque is empty, so index 0 (value 5) enters at the back.
          Deque, front to back: [5].
        </>
      ),
      zh: <>i = 0:队列为空,下标 0(值 5)从队尾入队。队列(头→尾):[5]。</>,
    },
  },
  {
    cells: [
      { v: 5, state: "lit" },
      { v: 3, state: "lit" },
      { v: 1 },
      { v: 4 },
      { v: 2 },
      { v: 6 },
    ],
    ptrs: [
      { i: 1, label: "i" },
      { i: 0, label: { en: "front", zh: "队头" } },
    ],
    msg: {
      en: (
        <>
          i = 1: nums[1] = 3 is smaller than the value at the back (5), so
          nothing is removed and 3 enters at the back. It is worth keeping,
          because once 5 leaves the window 3 <b>may become the maximum</b>.
          Deque: [5, 3], still decreasing.
        </>
      ),
      zh: (
        <>
          i = 1:nums[1] = 3 比队尾的 5 小,不弹任何元素,3 从队尾入队。
          留着它是有意义的:等 5 滑出窗口,3 <b>可能就是最大值</b>。队列:[5,
          3],仍然递减。
        </>
      ),
    },
  },
  {
    cells: [
      { v: 5, state: "lit" },
      { v: 3, state: "lit" },
      { v: 1, state: "lit" },
      { v: 4 },
      { v: 2 },
      { v: 6 },
    ],
    ptrs: [
      { i: 2, label: "i" },
      { i: 0, label: { en: "front", zh: "队头" } },
    ],
    msg: {
      en: (
        <>
          i = 2: 1 is smaller than 3, so it also enters at the back. The window
          [0..2] is now complete, so <b>read the front: 5 is the maximum</b>.
          ans = [5]. Reading the maximum is one array access: O(1).
        </>
      ),
      zh: (
        <>
          i = 2:1 比 3 小,同样从队尾入队。窗口 [0..2] 集齐 →{" "}
          <b>看队头:5 就是最大值</b>,ans = [5]。取最大值就是一次数组访问:O(1)。
        </>
      ),
    },
  },
  {
    cells: [
      { v: 5, state: "lit" },
      { v: 3, state: "bad" },
      { v: 1, state: "bad" },
      { v: 4, state: "lit" },
      { v: 2 },
      { v: 6 },
    ],
    ptrs: [
      { i: 3, label: "i" },
      { i: 0, label: { en: "front", zh: "队头" } },
    ],
    msg: {
      en: (
        <>
          i = 3: before 4 enters, every index at the back whose value is{" "}
          <b>not greater</b> than 4 is removed. Both 1 and 3 qualify: each is
          smaller than 4 and each leaves the window earlier than 4, so{" "}
          <b>neither can ever be a maximum again</b>. Then 4 enters at the back.
        </>
      ),
      zh: (
        <>
          i = 3:4 入队前,先把队尾所有值<b>不大于</b> 4 的下标弹出。1 和 3
          都符合:它们比 4 小,又比 4 更早离开窗口,
          <b>不可能再成为任何窗口的最大值</b>。弹完之后 4 从队尾入队。
        </>
      ),
    },
  },
  {
    cells: [
      { v: 5, state: "ghost" },
      { v: 3 },
      { v: 1 },
      { v: 4, state: "lit" },
      { v: 2 },
      { v: 6 },
    ],
    ptrs: [
      { i: 3, label: "i" },
      { i: 3, label: { en: "front", zh: "队头" } },
    ],
    msg: {
      en: (
        <>
          The window is now [1..3]. The front is index 0, which is outside the
          window, so it is <b>removed from the front</b>. Deque: [4], ans = [5,
          4]. Both ends are in use: the back drops candidates that are too
          small, the front drops indices that have expired.
        </>
      ),
      zh: (
        <>
          窗口滑到 [1..3]:队头是下标 0,已经在窗口外 → <b>从队头弹出</b>
          。队列:[4],ans = [5, 4]。两端都在工作:队尾淘汰不够大的候选,
          队头清掉已经过期的下标。
        </>
      ),
    },
  },
  {
    cells: [
      { v: 5, state: "ghost" },
      { v: 3, state: "ghost" },
      { v: 1 },
      { v: 4, state: "lit" },
      { v: 2, state: "lit" },
      { v: 6 },
    ],
    ptrs: [
      { i: 4, label: "i" },
      { i: 3, label: { en: "front", zh: "队头" } },
    ],
    msg: {
      en: (
        <>
          i = 4: 2 is smaller than the value at the back (4), so it enters at
          the back and waits. The window is [2..4] and the front index 3 is
          still inside it, so ans = [5, 4, 4]. 2 is kept for the windows in
          which 4 is already gone.
        </>
      ),
      zh: (
        <>
          i = 4:2 比队尾的 4 小,从队尾入队候补。窗口 [2..4],队头下标 3
          仍在窗口内 → ans = [5, 4, 4]。留着 2,是为了 4 离开之后的那些窗口。
        </>
      ),
    },
  },
  {
    cells: [
      { v: 5, state: "ghost" },
      { v: 3, state: "ghost" },
      { v: 1, state: "ghost" },
      { v: 4, state: "bad" },
      { v: 2, state: "bad" },
      { v: 6, state: "lit" },
    ],
    ptrs: [
      { i: 5, label: "i" },
      { i: 5, label: { en: "front", zh: "队头" } },
    ],
    msg: {
      en: (
        <>
          i = 5: 6 arrives. The values at the back, first 2 and then 4, are both
          smaller, so both are removed. The deque becomes [6]. The window is
          [3..5], so ans = [5, 4, 4, 6].
        </>
      ),
      zh: (
        <>
          i = 5:6 到来。队尾的 2、随后的 4 都比它小,全部弹出,队列变成 [6]。
          窗口 [3..5] → ans = [5, 4, 4, 6]。
        </>
      ),
    },
  },
  {
    cells: [
      { v: 5, state: "ghost" },
      { v: 3, state: "ghost" },
      { v: 1, state: "ghost" },
      { v: 4, state: "ghost" },
      { v: 2, state: "ghost" },
      { v: 6, state: "ok" },
    ],
    msg: {
      en: (
        <>
          Done: ans = [5, 4, 4, 6]. The while loop inside the for loop makes
          this look like O(n²), but it is not. Each index{" "}
          <b>enters the deque exactly once and leaves at most once</b>, from
          either end, so the whole scan performs at most 2n deque operations:{" "}
          <b>O(n)</b>. Brute force does about k times more work.
        </>
      ),
      zh: (
        <>
          收官:ans = [5, 4, 4, 6]。for 里套着 while,看上去像 O(n²),其实不是:
          每个下标<b>只入队一次、最多出队一次</b>(无论从哪一端),
          整趟扫描的队列操作不超过 2n 次 —— <b>O(n)</b>。
          暴力做法的工作量大约是它的 k 倍。
        </>
      ),
    },
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: { en: "Intuition", zh: "直觉" } },
  { id: "memory", n: "02", label: { en: "In memory", zh: "内存里的样子" } },
  { id: "ops", n: "03", label: { en: "Core operations", zh: "核心操作" } },
  { id: "impl", n: "04", label: { en: "Build one", zh: "手写实现" } },
  { id: "langs", n: "05", label: { en: "Three languages", zh: "三语言对照" } },
  {
    id: "patterns",
    n: "06",
    label: { en: "Patterns and monotonic deques", zh: "套路与单调队列" },
  },
  { id: "problems", n: "07", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "08", label: { en: "Quiz", zh: "通关测验" } },
];

export default function QueueChapter() {
  return (
    <main className="page" data-ch="queue">
      <Hero
        ch="queue"
        title={{
          en: (
            <>
              Queue and <span className="grad">Deque</span>
            </>
          ),
          zh: (
            <>
              队列与双端队列 <span className="grad">Queue &amp; Deque</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A queue serves in arrival order. New elements join at the{" "}
              <strong>back</strong>, and only the element at the{" "}
              <strong>front</strong> can leave, so the element removed is always
              the one that has waited longest. That rule is called{" "}
              <strong>FIFO</strong>, first in, first out. A{" "}
              <strong>deque</strong> loosens it and allows insertion and removal
              at both ends.
            </>
          ),
          zh: (
            <>
              队列按到达顺序服务:新元素从<strong>队尾</strong>加入,
              只有<strong>队头</strong>的元素能离开 —— 取走的永远是等待最久的那个。
              这条规则叫 <strong>FIFO(先进先出)</strong>。而
              <strong>双端队列 deque</strong> 把限制放开:两端都能插入、都能删除。
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
          en: "Intuition: a queue at a shop, and what it guarantees",
          zh: "直觉:店门口的队伍,以及它的承诺",
        }}
        desc={{
          en: "A stack serves the most recent first. A queue serves the earliest first.",
          zh: "栈管「最近优先」,队列管「先来先服务」—— 两种秩序,各管半个世界",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                The stack in the previous chapter always serves the{" "}
                <strong>most recent</strong> item first. Now imagine a print
                shop with one printer. If it always printed the{" "}
                <strong>newest</strong> file first, then as long as new jobs keep
                arriving, the oldest file would <strong>never</strong> be
                printed. Computer science calls that{" "}
                <strong>starvation</strong>. Print jobs, food orders, support
                tickets, and message systems do not want the most recent first.
                They want <strong>the earliest first</strong>.
              </p>
            }
            zh={
              <p>
                上一章的栈永远先处理<strong>最近</strong>的那个。现在想象一家打印店只有一台打印机:
                如果永远先打<strong>最新</strong>提交的文件,只要不断有新任务进来,
                最早那份文件就<strong>永远轮不到</strong> —— 计算机科学管这叫
                <strong>饥饿(starvation)</strong>。打印任务、外卖订单、客服工单、
                消息系统,这些场景要的不是最近优先,而是
                <strong>先来先处理</strong>。
              </p>
            }
          />
          <T
            en={
              <p>
                The structure built for that order is the{" "}
                <strong>queue</strong>. Think of a queue at a shop: new
                customers join at the <strong>back (rear)</strong>, and the clerk
                only serves the person at the <strong>front</strong>. Nobody can
                move past anyone else, so the person served is always the one who
                has waited longest. That is the whole contract, and it has a
                name: <strong>FIFO (First In, First Out)</strong>. Three rules
                follow from it:
              </p>
            }
            zh={
              <p>
                为这种顺序而生的结构就是<strong>队列(Queue)</strong>。
                画面感是店门口的队伍:新客人从<strong>队尾(rear)</strong>加入,
                店员只服务<strong>队头(front)</strong>的人。
                没有人能越过别人,所以被服务的永远是等待最久的那个 ——
                这就是队列的全部承诺,它有个名字:
                <strong>先进先出,FIFO(First In, First Out)</strong>。由此推出三条规矩:
              </p>
            }
          />
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">RULE 01</div>
            <div className="card-title">
              <T en="Two ends, two jobs" zh="两端分工" />
            </div>
            <T
              en={
                <p>
                  enqueue adds at the <b>back</b>. dequeue removes at the{" "}
                  <b>front</b>. That single split is the difference from a stack,
                  where both operations act on the same end.
                </p>
              }
              zh={
                <p>
                  入队(enqueue)只在<b>队尾</b>,出队(dequeue)只在<b>队头</b>
                  。与栈的区别就这一条:栈一端进出,队列两端各司其职。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 02</div>
            <div className="card-title">
              <T en="⏱️ First in, first out" zh="⏱️ 先进先出" />
            </div>
            <T
              en={
                <p>
                  The order of arrival is the order of service. No element can be
                  overtaken, so nothing waits forever.
                </p>
              }
              zh={
                <p>
                  到达顺序 = 处理顺序。没有人会被插队,所以谁也不会无限等下去。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 03</div>
            <div className="card-title">
              <T en="No access in the middle" zh="不许插队,也不许乱翻" />
            </div>
            <T
              en={
                <p>
                  A queue offers no operation to read or change an element in the
                  middle. As with the stack, <b>a smaller set of abilities</b> is
                  what keeps every operation O(1).
                </p>
              }
              zh={
                <p>
                  队列不提供访问 / 修改中间元素的操作。和栈一样:<b>能力锁得越小,
                  每个操作越快</b> —— 全部 O(1)。
                </p>
              }
            />
          </div>
        </div>
        <Callout
          tone="story"
          title={{ en: "Where queues appear", zh: "它无处不在" }}
        >
          <T
            en={
              <p>
                Task scheduling in an operating system, printer job queues, and{" "}
                <b>message systems</b> such as Kafka and RabbitMQ, where requests
                wait in a queue and the backend consumes them at its own rate.
                Queues also drive <b>breadth-first search (BFS)</b> on trees
                (chapter 7) and graphs (chapter 12): the queue is what makes BFS
                finish one level before starting the next, and that ordering is
                the reason BFS finds a path with the <b>fewest edges</b> in an
                unweighted graph. BFS itself comes later; here you only need the
                queue.
              </p>
            }
            zh={
              <p>
                操作系统的任务调度队列、打印机的作业队列、Kafka / RabbitMQ
                这类<b>消息队列</b>(请求先排队,后端按自己的节奏消费)。
                算法这边,第 7 章的树和第 12 章的图都靠队列驱动
                <b>广度优先搜索(BFS)</b>:正是队列让 BFS
                「一层处理完再处理下一层」,而这个顺序就是 BFS
                能在无权图里找到<b>边数最少</b>路径的原因。BFS 后面再讲,
                这一章先把队列本身学扎实。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §02 内存 ================= */}
      <Section
        id="memory"
        index="02"
        title={{
          en: "In memory: from a wasteful array to a circular queue",
          zh: "内存里的样子:从「大坑」到循环队列",
        }}
        desc={{
          en: "Both ends of a queue must be O(1). A plain array cannot do that, and the modulo operator is what fixes it.",
          zh: "队列两端都要 O(1) —— 这对朴素数组是个真难题,取模是那把钥匙",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                Storing a queue in a plain array causes a problem straight away.
                Adding at the back is what arrays are good at: append is O(1).
                Removing at the <strong>front</strong> is the operation the array
                chapter warned about: every remaining element moves one position
                left, so <strong>a dequeue costs O(n)</strong>, and it costs more
                as the queue gets longer. You could refuse to move anything, but
                then the slots freed at the front are never used again. Three
                designs, side by side:
              </p>
            }
            zh={
              <p>
                用数组装队列,麻烦立刻出现:入队在尾部,这是数组的强项(追加
                O(1));可出队在<strong>头部</strong> ——
                数组章讲过,头部删除要让后面的元素整体左移一格,
                <strong>一次出队 O(n)</strong>,队伍越长越慢。
                不搬移也行,但队头腾出来的格子就再也用不上了。三种设计并排看:
              </p>
            }
          />
        </div>
        <QueueMemFig />
        <div className="prose" style={{ marginTop: 16 }}>
          <T
            en={
              <p>
                Design 3 is the <strong>circular queue</strong>, also called a{" "}
                <strong>ring buffer</strong> in production code. The array is
                still a straight line in memory, but every index calculation ends
                with <code>% capacity</code>, which makes the line behave{" "}
                <strong>logically</strong> like a circle. front consumes from one
                side, rear wraps around and refills from the other, and as long
                as the queue is not full there is always a free slot. RingLab in
                §03 lets you turn the circle yourself.
              </p>
            }
            zh={
              <p>
                设计三就是<strong>循环队列(circular queue)</strong>
                ,工程里也叫<strong>环形缓冲区(ring buffer)</strong>:
                数组在内存里仍是一条直线,但所有下标运算都以{" "}
                <code>% capacity</code> 结尾,于是它在<strong>逻辑上</strong>
                变成一个圈 —— front 在一头消费,rear 绕回来在另一头补充,
                只要没装满,永远有格子可用。§03 的 RingLab 可以亲手转这个圈。
              </p>
            }
          />
        </div>
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-kicker">
              <T en="ANOTHER ROUTE" zh="另一条路线" />
            </div>
            <div className="card-title">
              <T
                en="A linked queue: out at the head, in at the tail"
                zh="链表实现:头出尾进"
              />
            </div>
            <T
              en={
                <p>
                  Keep two pointers, head and tail. Dequeue unlinks the head node
                  (O(1)); enqueue links a new node after tail (O(1)). Why not the
                  other way around? <b>Removing the last node of a singly linked
                  list means finding its predecessor, which is O(n)</b>, while
                  removing at the head and inserting at the tail need no
                  traversal. The same rule as always: use the end that costs
                  nothing. A linked queue never resizes and never fills up. The
                  price is one pointer per element and poor cache behavior.
                </p>
              }
              zh={
                <p>
                  维护 head、tail 两个指针:出队 = 摘下头节点(O(1)),入队 =
                  接在尾节点后(O(1))。为什么不反过来?<b>单链表尾部删除要先找到前驱,
                  O(n)</b>,而头删、尾插都不需要遍历 —— 还是那句话:选不用搬移的那端。
                  链表队列不用扩容、也不会装满,代价是每个元素多一个指针,而且缓存不友好。
                </p>
              }
            />
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="THE GENERAL FORM" zh="推广形式" />
            </div>
            <div className="card-title">
              <T en="The deque: both ends open" zh="双端队列 deque:两端全开" />
            </div>
            <T
              en={
                <p>
                  A deque (double-ended queue, pronounced &ldquo;deck&rdquo;)
                  removes one more restriction: <b>you can insert and remove at
                  both ends</b>, and all four operations are O(1). Use one end
                  only and it behaves as a stack; add at one end and remove at
                  the other and it behaves as a queue. The monotonic deque in §06
                  needs both ends at the same time, which is why it must be a
                  deque.
                </p>
              }
              zh={
                <p>
                  deque(double-ended queue,读作 &ldquo;deck&rdquo;)再放开一档限制:
                  <b>头尾都能插入、都能删除</b>,四个操作全是 O(1)。只用一端 =
                  栈,一端进另一端出 = 队列。§06 的单调队列必须同时用到两端 ——
                  这正是它必须是双端队列的原因。
                </p>
              }
            />
          </div>
        </div>
        <Callout
          tone="deep"
          title={{
            en: "Ring buffers in production",
            zh: "工程现场:环形缓冲区到处都是",
          }}
        >
          <T
            en={
              <p>
                Packet buffers in network drivers, sample buffers in audio
                devices, fixed-size log buffers, and the core of the LMAX
                Disruptor trading framework are all ring buffers. The reason is
                the same every time: <b>a fixed-length array plus two wrapping
                indices means no allocation, no element ever moves, and the
                memory touched stays close together</b>. A producer and a
                consumer each follow their own index.
              </p>
            }
            zh={
              <p>
                网卡驱动的收发包缓冲、音频设备的采样缓冲、日志系统的定长缓冲、
                高频交易框架 LMAX Disruptor 的核心 —— 全是环形缓冲区。原因每次都一样:
                <b>定长数组 + 两个绕圈下标 = 零分配、零搬移、访问的内存又挨得很近</b>
                。生产者和消费者各追各的下标,互不打扰。
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
          en: "Core operations: all O(1), and how the indices wrap",
          zh: "核心操作:全部 O(1),看清指针怎么绕圈",
        }}
        desc={{
          en: "A complexity table, RingLab, and the answer to: does front == rear mean full or empty?",
          zh: "复杂度表 + 环形实验室 —— 顺便解决「满和空长得一样」的悬案",
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
                  <T en="Meaning" zh="含义" />
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
                  <b>enqueue(x)</b>
                </td>
                <td>
                  <T en="Add x at the back" zh="x 加到队尾" />
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en="Write into the slot rear points at (or link after tail), then move the index one step"
                    zh="写进 rear 指的格子(或接在 tail 后),下标前进一步"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>dequeue()</b>
                </td>
                <td>
                  <T en="Remove the front element" zh="取走队头元素" />
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en="A circular queue only moves front; a linked queue unlinks the head node. Nothing is copied"
                    zh="循环队列只挪 front 下标;链表队列摘掉头节点 —— 都没有元素搬移"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>peek()</b>
                </td>
                <td>
                  <T en="Read the front without removing" zh="只看队头,不取走" />
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en="Read the slot front points at, or the head node"
                    zh="读 front 指的格子 / 头节点"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>isEmpty() / size()</b>
                </td>
                <td>
                  <T en="Empty test and count" zh="判空 / 求大小" />
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en="Compare the two indices, or read the counter"
                    zh="比较两个下标,或读计数器"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Deque, both ends" zh="deque 四向操作" />
                  </b>
                </td>
                <td>
                  <T
                    en="Insert and remove at either end"
                    zh="两端都能插入、都能删除"
                  />
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en="In a circular array both indices can move forward and backward; in a doubly linked list both ends have a handle"
                    zh="循环数组的两个下标都能前进后退;双向链表两端都有把手"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Read or search the middle" zh="访问 / 查找中间" />
                  </b>
                </td>
                <td>
                  <T en="Not provided" zh="——" />
                </td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <T
                    en="A queue does not offer it. Use an array when you need random access"
                    zh="队列不提供 —— 需要随机访问请回数组"
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
                Turn the ring a few times and watch three things. First, a
                dequeue <strong>moves no element at all</strong>. Second, what
                rear does when it reaches the last slot. Third, why full and
                empty end up looking identical, and the two ways to tell them
                apart:
              </p>
            }
            zh={
              <p>
                动手转几圈,重点看三件事:①出队时<strong>没有任何元素被搬移</strong>
                ;②rear 走到最后一格时怎么绕回 0;③「满」和「空」为什么会长得一样,
                以及两种区分方案:
              </p>
            }
          />
        </div>
        <RingLab />
        <Callout
          tone="warn"
          title={{
            en: "Full or empty? The classic circular queue problem",
            zh: "满 == 空?循环队列的经典陷阱",
          }}
        >
          <T
            en={
              <p>
                Empty means front has caught up with rear. Full means rear has
                travelled a full circle and caught up with front. In both cases{" "}
                <b>front == rear</b>, so the indices alone cannot tell you which
                one it is. The design has to resolve this, and there are two
                standard answers. <b>Scheme A keeps one slot permanently
                empty</b>: allocate k + 1 slots and treat (rear + 1) % cap ==
                front as full. It needs no extra variable and costs one slot.{" "}
                <b>Scheme B keeps a size counter</b>: empty is size == 0, full is
                size == cap. Every slot is usable, and every enqueue and dequeue
                updates the counter. Both are correct; the implementation in §04
                uses scheme A, and RingLab lets you switch between them.
              </p>
            }
            zh={
              <p>
                空,是 front 追上了 rear;满,是 rear 绕完整整一圈追上了 front。
                两种情况下都是 <b>front == rear</b>,光看下标区分不了。
                设计上必须消歧,标准答案有两个。<b>方案 A:永久留一格空</b> ——
                开 k + 1 格,(rear + 1) % cap == front 即为满,不需要额外变量,
                代价是牺牲一格。<b>方案 B:维护 size 计数器</b> —— 空 = size
                == 0,满 = size == cap,格子全能用,代价是每次进出都要更新计数器。
                两种都对;§04 的实现用的是方案 A,RingLab 里可以来回切换。
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
          en: "Build one: a circular queue (this is LC 622)",
          zh: "手写实现:循环队列(就是 LC 622)",
        }}
        desc={{
          en: "Everything RingLab does, written as code you can submit.",
          zh: "RingLab 里玩过的一切,现在变成代码 —— 写完可以直接去提交",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                The class below is exactly the solution to{" "}
                <strong>LeetCode 622, Design Circular Queue</strong>: a
                fixed-length array, a front and a rear index, and the modulo
                operator to wrap around. It uses scheme A, keeping one slot
                empty, which is why the constructor allocates k + 1 slots. Every
                line matches an action in RingLab:
              </p>
            }
            zh={
              <p>
                下面这个类<strong>就是 LeetCode 622「设计循环队列」的题解</strong>
                :定长数组 + front / rear 两个下标 + 取模绕圈,采用方案 A
                「留一格空」(所以构造时多开一格)。每一行都能对应到 RingLab
                里的一个动作:
              </p>
            }
          />
        </div>
        <CodeTabs
          title="my_circular_queue"
          java={{
            code: {
              en: `class MyCircularQueue {
    private final int[] data;   // fixed-length array; the ring is logical
    private int front = 0;      // front: position of the next element to leave
    private int rear  = 0;      // rear: position where the next element is written

    public MyCircularQueue(int k) {
        data = new int[k + 1];  // one extra slot: it stays empty to tell full from empty
    }

    public boolean enQueue(int value) {
        if (isFull()) return false;
        data[rear] = value;
        rear = (rear + 1) % data.length;   // modulo: past the last slot, back to 0
        return true;
    }

    public boolean deQueue() {
        if (isEmpty()) return false;
        front = (front + 1) % data.length; // one index moves; no element moves
        return true;
    }

    public int Front() { return isEmpty() ? -1 : data[front]; }

    public int Rear() {                    // rear is the next write position,
        return isEmpty() ? -1              // so the last element sits one slot before it:
            : data[(rear - 1 + data.length) % data.length]; // + len avoids a negative
    }

    public boolean isEmpty() { return front == rear; }
    public boolean isFull()  { return (rear + 1) % data.length == front; }
}`,
              zh: `class MyCircularQueue {
    private final int[] data;   // 定长数组,"环"是逻辑上的
    private int front = 0;      // 队头:下一个出队元素的位置
    private int rear  = 0;      // 队尾:下一个写入的位置

    public MyCircularQueue(int k) {
        data = new int[k + 1];  // 多开一格:它始终空着,用来区分"满"与"空"
    }

    public boolean enQueue(int value) {
        if (isFull()) return false;
        data[rear] = value;
        rear = (rear + 1) % data.length;   // 取模:越过最后一格就绕回 0
        return true;
    }

    public boolean deQueue() {
        if (isEmpty()) return false;
        front = (front + 1) % data.length; // 只挪一个下标,没有元素被搬移
        return true;
    }

    public int Front() { return isEmpty() ? -1 : data[front]; }

    public int Rear() {                    // rear 指的是下一个写入位,
        return isEmpty() ? -1              // 队尾元素在它前一格:
            : data[(rear - 1 + data.length) % data.length]; // 先 + len 防止取到负数
    }

    public boolean isEmpty() { return front == rear; }
    public boolean isFull()  { return (rear + 1) % data.length == front; }
}`,
            },
            hl: [7, 13, 19, 27, 30, 31],
            note: {
              en: (
                <>
                  <b>The scheme B version:</b> allocate k slots and keep a size
                  field. empty is size == 0, full is size == k. It reads more
                  directly and costs one more variable. Both versions are
                  accepted answers.
                </>
              ),
              zh: (
                <>
                  <b>方案 B(计数器)版:</b>开 k 格,另外维护 size 字段。空 =
                  size == 0,满 = size == k。代码更直白,多一个变量 ——
                  两版都是标准答案。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class MyCircularQueue:
    def __init__(self, k: int):
        self.data = [0] * (k + 1)  # one extra slot: it stays empty to tell full from empty
        self.front = 0             # front: position of the next element to leave
        self.rear = 0              # rear: position where the next element is written

    def enQueue(self, value: int) -> bool:
        if self.isFull():
            return False
        self.data[self.rear] = value
        self.rear = (self.rear + 1) % len(self.data)  # modulo: wrap back to 0
        return True

    def deQueue(self) -> bool:
        if self.isEmpty():
            return False
        self.front = (self.front + 1) % len(self.data)  # one index moves, nothing else
        return True

    def Front(self) -> int:
        return -1 if self.isEmpty() else self.data[self.front]

    def Rear(self) -> int:         # the last element sits one slot before rear
        if self.isEmpty():
            return -1
        return self.data[(self.rear - 1) % len(self.data)]  # in Python this is never negative

    def isEmpty(self) -> bool:
        return self.front == self.rear

    def isFull(self) -> bool:
        return (self.rear + 1) % len(self.data) == self.front`,
              zh: `class MyCircularQueue:
    def __init__(self, k: int):
        self.data = [0] * (k + 1)  # 多开一格:它始终空着,用来区分"满"与"空"
        self.front = 0             # 队头:下一个出队元素的位置
        self.rear = 0              # 队尾:下一个写入的位置

    def enQueue(self, value: int) -> bool:
        if self.isFull():
            return False
        self.data[self.rear] = value
        self.rear = (self.rear + 1) % len(self.data)  # 取模:绕回 0
        return True

    def deQueue(self) -> bool:
        if self.isEmpty():
            return False
        self.front = (self.front + 1) % len(self.data)  # 只挪一个下标,其余不动
        return True

    def Front(self) -> int:
        return -1 if self.isEmpty() else self.data[self.front]

    def Rear(self) -> int:         # 队尾元素在 rear 的前一格
        if self.isEmpty():
            return -1
        return self.data[(self.rear - 1) % len(self.data)]  # Python 里这个结果不会是负数

    def isEmpty(self) -> bool:
        return self.front == self.rear

    def isFull(self) -> bool:
        return (self.rear + 1) % len(self.data) == self.front`,
            },
            hl: [3, 11, 17, 26, 29, 32],
            note: {
              en: (
                <>
                  <b>Detail:</b> in Python <code>-1 % 8 == 7</code>, because the
                  result takes the sign of the divisor. There is no need to add
                  the length first the way Java and JavaScript do. If you write
                  in more than one language, <code>(i - 1 + n) % n</code> is safe
                  everywhere.
                </>
              ),
              zh: (
                <>
                  <b>细节:</b>Python 里 <code>-1 % 8 == 7</code>
                  (结果与除数同号),所以不必像 Java / JavaScript 那样先 + len。
                  但如果你跨语言写代码,统一写{" "}
                  <code>(i - 1 + n) % n</code> 最保险。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `var MyCircularQueue = function (k) {
  this.data = new Array(k + 1);  // one extra slot: it stays empty to tell full from empty
  this.front = 0;                // front: position of the next element to leave
  this.rear = 0;                 // rear: position where the next element is written
};

MyCircularQueue.prototype.enQueue = function (value) {
  if (this.isFull()) return false;
  this.data[this.rear] = value;
  this.rear = (this.rear + 1) % this.data.length;  // modulo: wrap back to 0
  return true;
};

MyCircularQueue.prototype.deQueue = function () {
  if (this.isEmpty()) return false;
  this.front = (this.front + 1) % this.data.length; // one index moves, nothing else
  return true;
};

MyCircularQueue.prototype.Front = function () {
  return this.isEmpty() ? -1 : this.data[this.front];
};

MyCircularQueue.prototype.Rear = function () {  // last element: one slot before rear
  if (this.isEmpty()) return -1;
  return this.data[(this.rear - 1 + this.data.length) % this.data.length];
};

MyCircularQueue.prototype.isEmpty = function () {
  return this.front === this.rear;
};

MyCircularQueue.prototype.isFull = function () {
  return (this.rear + 1) % this.data.length === this.front;
};`,
              zh: `var MyCircularQueue = function (k) {
  this.data = new Array(k + 1);  // 多开一格:它始终空着,用来区分"满"与"空"
  this.front = 0;                // 队头:下一个出队元素的位置
  this.rear = 0;                 // 队尾:下一个写入的位置
};

MyCircularQueue.prototype.enQueue = function (value) {
  if (this.isFull()) return false;
  this.data[this.rear] = value;
  this.rear = (this.rear + 1) % this.data.length;  // 取模:绕回 0
  return true;
};

MyCircularQueue.prototype.deQueue = function () {
  if (this.isEmpty()) return false;
  this.front = (this.front + 1) % this.data.length; // 只挪一个下标,其余不动
  return true;
};

MyCircularQueue.prototype.Front = function () {
  return this.isEmpty() ? -1 : this.data[this.front];
};

MyCircularQueue.prototype.Rear = function () {  // 队尾元素在 rear 前一格
  if (this.isEmpty()) return -1;
  return this.data[(this.rear - 1 + this.data.length) % this.data.length];
};

MyCircularQueue.prototype.isEmpty = function () {
  return this.front === this.rear;
};

MyCircularQueue.prototype.isFull = function () {
  return (this.rear + 1) % this.data.length === this.front;
};`,
            },
            hl: [2, 10, 16, 26, 30, 34],
            note: {
              en: (
                <>
                  <b>Common mistake:</b> in JavaScript{" "}
                  <code>-1 % 8 === -1</code>, because the result takes the sign
                  of the left operand. Stepping backward must therefore be
                  written <code>(i - 1 + n) % n</code>; a plain modulo produces a
                  negative index.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>JavaScript 里 <code>-1 % 8 === -1</code>
                  (结果与被除数同号)。所以「后退一格」必须写成{" "}
                  <code>(i - 1 + n) % n</code>,直接取模会得到负下标。
                </>
              ),
            },
          }}
        />
        <div className="prose" style={{ marginTop: 24 }}>
          <T
            en={
              <p>
                The <strong>linked queue</strong> is worth writing once as well.
                It is the form a queue usually takes inside the BFS code of
                chapter 7, and it hides one boundary case that interviews ask
                about: resetting tail.
              </p>
            }
            zh={
              <p>
                <strong>链表版队列</strong>也值得手写一遍 —— 它是第 7 章 BFS
                代码里队列的常见形态,而且藏着一个高频边界坑:tail 的归位。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="linked_queue"
          java={{
            code: {
              en: `class LinkedQueue {
    private static class Node {
        int val; Node next;
        Node(int v) { val = v; }
    }
    private Node head = null;    // front: the end elements leave from
    private Node tail = null;    // back: the end elements enter at
    private int size = 0;

    public void offer(int x) {   // enqueue: link after tail, O(1)
        Node n = new Node(x);
        if (tail == null) head = tail = n;  // empty queue: both ends point at it
        else { tail.next = n; tail = n; }
        size++;
    }

    public int poll() {          // dequeue: unlink head, O(1)
        if (head == null) throw new RuntimeException("queue is empty");
        int v = head.val;
        head = head.next;
        if (head == null) tail = null;  // last element removed: reset tail too!
        size--;
        return v;
    }
}`,
              zh: `class LinkedQueue {
    private static class Node {
        int val; Node next;
        Node(int v) { val = v; }
    }
    private Node head = null;    // 队头:出队的那一端
    private Node tail = null;    // 队尾:入队的那一端
    private int size = 0;

    public void offer(int x) {   // 入队:接在 tail 后面,O(1)
        Node n = new Node(x);
        if (tail == null) head = tail = n;  // 空队列:头尾同时指向它
        else { tail.next = n; tail = n; }
        size++;
    }

    public int poll() {          // 出队:摘下 head,O(1)
        if (head == null) throw new RuntimeException("queue is empty");
        int v = head.val;
        head = head.next;
        if (head == null) tail = null;  // 删到空:tail 必须一起归位!
        size--;
        return v;
    }
}`,
            },
            hl: [12, 13, 20, 21],
            note: {
              en: (
                <>
                  <b>Common mistake:</b> forgetting <code>tail = null</code> when
                  the last node is removed. The next offer then links a new node
                  after a node that is no longer in the queue, and the queue
                  breaks silently.
                </>
              ),
              zh: (
                <>
                  <b>高频坑:</b>删掉最后一个节点时忘记写{" "}
                  <code>tail = null</code>,下一次 offer
                  就会接在一个已经不属于队列的节点后面 —— 队列从此悄悄断裂。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

class LinkedQueue:
    def __init__(self):
        self.head = None      # front: the end elements leave from
        self.tail = None      # back: the end elements enter at
        self.size = 0

    def offer(self, x):       # enqueue: link after tail, O(1)
        n = Node(x)
        if self.tail is None:
            self.head = self.tail = n   # empty queue: both ends point at it
        else:
            self.tail.next = n
            self.tail = n
        self.size += 1

    def poll(self):           # dequeue: unlink head, O(1)
        if self.head is None:
            raise IndexError("queue is empty")
        v = self.head.val
        self.head = self.head.next
        if self.head is None:           # last element removed: reset tail too!
            self.tail = None
        self.size -= 1
        return v`,
              zh: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

class LinkedQueue:
    def __init__(self):
        self.head = None      # 队头:出队的那一端
        self.tail = None      # 队尾:入队的那一端
        self.size = 0

    def offer(self, x):       # 入队:接在 tail 后面,O(1)
        n = Node(x)
        if self.tail is None:
            self.head = self.tail = n   # 空队列:头尾同时指向它
        else:
            self.tail.next = n
            self.tail = n
        self.size += 1

    def poll(self):           # 出队:摘下 head,O(1)
        if self.head is None:
            raise IndexError("queue is empty")
        v = self.head.val
        self.head = self.head.next
        if self.head is None:           # 删到空:tail 必须一起归位!
            self.tail = None
        self.size -= 1
        return v`,
            },
            hl: [15, 18, 25, 26, 27],
          }}
          js={{
            code: {
              en: `class LinkedQueue {
  #head = null;    // front: the end elements leave from
  #tail = null;    // back: the end elements enter at
  #size = 0;

  offer(x) {       // enqueue: link after tail, O(1)
    const n = { val: x, next: null };
    if (this.#tail === null) {
      this.#head = this.#tail = n;   // empty queue: both ends point at it
    } else {
      this.#tail.next = n;
      this.#tail = n;
    }
    this.#size++;
  }

  poll() {         // dequeue: unlink head, O(1)
    if (this.#head === null) throw new Error("queue is empty");
    const v = this.#head.val;
    this.#head = this.#head.next;
    if (this.#head === null) this.#tail = null; // reset tail as well!
    this.#size--;
    return v;
  }

  get size() { return this.#size; }
}`,
              zh: `class LinkedQueue {
  #head = null;    // 队头:出队的那一端
  #tail = null;    // 队尾:入队的那一端
  #size = 0;

  offer(x) {       // 入队:接在 tail 后面,O(1)
    const n = { val: x, next: null };
    if (this.#tail === null) {
      this.#head = this.#tail = n;   // 空队列:头尾同时指向它
    } else {
      this.#tail.next = n;
      this.#tail = n;
    }
    this.#size++;
  }

  poll() {         // 出队:摘下 head,O(1)
    if (this.#head === null) throw new Error("queue is empty");
    const v = this.#head.val;
    this.#head = this.#head.next;
    if (this.#head === null) this.#tail = null; // tail 也要归位!
    this.#size--;
    return v;
  }

  get size() { return this.#size; }
}`,
            },
            hl: [9, 11, 20, 21],
          }}
        />
        <Callout
          tone="idea"
          title={{
            en: "Why out at the head and in at the tail?",
            zh: "要点回顾:为什么头出尾进?",
          }}
        >
          <T
            en={
              <p>
                In a singly linked list, <b>removing at the head is O(1),
                inserting at the tail is O(1) when you keep a tail pointer, and
                removing at the tail is O(n)</b> because you have to find the
                predecessor. So dequeue must be at the head and enqueue must be
                at the tail. Turn the two around and one of them becomes O(n).
                It is the same reasoning as the array stack keeping its top at
                the end and the linked stack keeping its top at the head: use the
                end that costs nothing.
              </p>
            }
            zh={
              <p>
                单链表里,<b>头部删除 O(1);有 tail 指针时尾部插入 O(1);
                尾部删除 O(n)</b>(要先找到前驱)。所以出队必须在头、入队必须在尾 ——
                方向反过来,其中一端就退化成 O(n)。
                这和「数组栈的栈顶在尾部、链表栈的栈顶在头部」是同一套推理:
                哪端不花钱就用哪端。
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
          en: "Three languages: JavaScript has no queue type",
          zh: "三语言对照:JavaScript 没有现成的队列",
        }}
        desc={{
          en: "Java and Python both ship one. JavaScript does not, so you build it.",
          zh: "Java 与 Python 均有标准库实现;JavaScript 没有,需要自行构造",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                The queue is the structure where the three standard libraries
                differ the <strong>most</strong>. Java and Python both provide a
                deque you can use directly. JavaScript provides nothing:{" "}
                <code>Array.prototype.shift()</code> looks like a dequeue, but it
                removes the first element and shifts the rest, which is{" "}
                <strong>O(n) in general</strong>. One language at a time:
              </p>
            }
            zh={
              <p>
                队列是三种语言标准库差异<strong>最大</strong>的结构:Java 和
                Python 都提供了可以直接用的 deque,JavaScript 什么也没有 ——{" "}
                <code>Array.prototype.shift()</code> 看着像出队,
                实际是「取走第一个元素,其余整体前移」,
                <strong>一般情况下是 O(n)</strong>。逐个看:
              </p>
            }
          />
        </div>
        <CodeTabs
          title="queue_basics"
          java={{
            code: {
              en: `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Queue;

// Queue is an interface; ArrayDeque and LinkedList both implement it
Queue<Integer> q = new ArrayDeque<>();   // the preferred implementation
q.offer(1);                  // enqueue at the back
q.offer(2);
int head = q.peek();         // look at the front -> 1
int x = q.poll();            // dequeue from the front -> 1

// Deque adds the operations at both ends
Deque<Integer> dq = new ArrayDeque<>();
dq.offerFirst(0);            // insert at the front
dq.offerLast(9);             // insert at the back (same as offer)
dq.pollLast();               // remove from the back

// LinkedList implements Deque too, so it also works as a queue, but its nodes
// are spread over the heap: slower to walk, and one extra object per element
Queue<Integer> slower = new java.util.LinkedList<>();`,
              zh: `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Queue;

// Queue 是接口,ArrayDeque 和 LinkedList 都实现了它
Queue<Integer> q = new ArrayDeque<>();   // 首选实现
q.offer(1);                  // 从队尾入队
q.offer(2);
int head = q.peek();         // 看队头 -> 1
int x = q.poll();            // 从队头出队 -> 1

// Deque 在此基础上补齐两端的操作
Deque<Integer> dq = new ArrayDeque<>();
dq.offerFirst(0);            // 队头插入
dq.offerLast(9);             // 队尾插入(等价于 offer)
dq.pollLast();               // 队尾弹出

// LinkedList 也实现了 Deque,同样能当队列用,但它的节点散落在堆上:
// 遍历更慢,而且每个元素都要多一个对象
Queue<Integer> slower = new java.util.LinkedList<>();`,
            },
            hl: [6, 10, 13, 14, 16],
            note: {
              en: (
                <>
                  <b>Two API families:</b> offer, poll, and peek return false or
                  null when the operation cannot be done; add, remove, and
                  element throw an exception instead. Interview code normally
                  uses the first family. Note also that <code>ArrayDeque</code>{" "}
                  <b>does not accept <code>null</code></b>, because null is its
                  signal for &ldquo;no element&rdquo;.
                </>
              ),
              zh: (
                <>
                  <b>两套 API:</b>offer / poll / peek 在操作无法完成时返回 false
                  或 null;add / remove / element 则抛异常。刷题一般用前一组。
                  另外注意 <code>ArrayDeque</code>{" "}
                  <b>不允许存 <code>null</code></b>,因为 null
                  被它用作「没有元素」的信号。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `from collections import deque

q = deque()
q.append(1)         # enqueue at the right end
q.append(2)
head = q[0]         # look at the front -> 1 (both ends are O(1))
x = q.popleft()     # dequeue from the left end -> 1, O(1)

# both ends are open
q.appendleft(0)     # insert at the left, O(1)
q.pop()             # remove at the right, O(1)

# do not use a list as a queue
bad = [1, 2, 3]
bad.pop(0)          # O(n): the first item leaves, everything else shifts left

# queue.Queue is a different class: it passes items between threads and adds
# locking. It is not the data structure interview problems mean by "queue".`,
              zh: `from collections import deque

q = deque()
q.append(1)         # 从右端入队
q.append(2)
head = q[0]         # 看队头 -> 1(两端访问都是 O(1))
x = q.popleft()     # 从左端出队 -> 1,O(1)

# 两端都开放
q.appendleft(0)     # 左端插入,O(1)
q.pop()             # 右端弹出,O(1)

# 不要用 list 当队列
bad = [1, 2, 3]
bad.pop(0)          # O(n):抽走第一个元素,其余整体左移

# queue.Queue 是另一个类:它用于线程间传递数据,内部带锁,
# 不是刷题时说的那个"队列"数据结构。`,
            },
            hl: [1, 4, 7, 15],
            note: {
              en: (
                <>
                  <b>How deque is built:</b> a doubly linked list of{" "}
                  <b>blocks</b>, where each block is a small array holding up to
                  64 elements. Both ends are O(1), and the memory is more compact
                  than one node per element. The cost is that reading{" "}
                  <code>q[i]</code> in the middle becomes O(n).{" "}
                  <b>
                    <code>list.pop(0)</code> is the most common performance
                    mistake in Python interview code.
                  </b>
                </>
              ),
              zh: (
                <>
                  <b>底层结构:</b>deque 是<b>块状</b>双向链表 ——
                  每个节点是一个能装 64 个元素的小数组块。两端 O(1),
                  内存也比「一个元素一个节点」紧凑;代价是中间随机访问{" "}
                  <code>q[i]</code> 退化为 O(n)。
                  <b>
                    <code>list.pop(0)</code> 是 Python 刷题里最常见的性能问题。
                  </b>
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// the JavaScript standard library has no queue type
const bad = [1, 2, 3];
bad.shift();               // takes the first element, shifts the rest: O(n) in general

// option 1: a head index (three lines, enough for interview code)
const q = [];
let head = 0;              // the front index only moves forward; nothing is deleted
q.push(1); q.push(2);      // enqueue: an ordinary push
const x = q[head++];       // dequeue: read, then move the index right -> O(1)
const empty = head === q.length;

// option 2: two stacks (walkthrough A, O(1) amortized)
// option 3: a hand-written linked queue (already written in §04)`,
              zh: `// JavaScript 标准库没有队列类型
const bad = [1, 2, 3];
bad.shift();               // 取走第一个元素,其余前移:一般情况下 O(n)

// 做法一:head 下标(三行,刷题够用)
const q = [];
let head = 0;              // 队头下标只前移,从不真正删除
q.push(1); q.push(2);      // 入队:普通的 push
const x = q[head++];       // 出队:读一下,下标右移 -> O(1)
const empty = head === q.length;

// 做法二:双栈模拟(精讲 A,均摊 O(1))
// 做法三:手写链表队列(§04 已经写过)`,
            },
            hl: [3, 7, 9, 10],
            note: {
              en: (
                <>
                  <b>Trade-off:</b> with the head index, dequeued elements stay
                  in memory until the whole array is released. For a solution
                  that runs for a fraction of a second, that does not matter. In
                  a long-running service, compact it now and then with{" "}
                  <code>q = q.slice(head)</code>, or use a linked queue.
                </>
              ),
              zh: (
                <>
                  <b>取舍:</b>下标法里「已出队」的元素仍占着内存,
                  直到整个数组被回收。刷题时程序只跑几百毫秒,完全无所谓;
                  长期运行的服务里,要么定期用{" "}
                  <code>q = q.slice(head)</code> 整理一次,要么换链表队列。
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
                  <T en="Java (ArrayDeque)" zh="Java(ArrayDeque)" />
                </th>
                <th>
                  <T en="Python (deque)" zh="Python(deque)" />
                </th>
                <th>
                  <T
                    en="JavaScript (head index)"
                    zh="JavaScript(head 下标法)"
                  />
                </th>
                <th>
                  <T en="Complexity" zh="复杂度" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <T en="Enqueue (back)" zh="入队(尾)" />
                </td>
                <td>
                  <code>q.offer(x)</code>
                </td>
                <td>
                  <code>q.append(x)</code>
                </td>
                <td>
                  <code>q.push(x)</code>
                </td>
                <td>
                  <BigO
                    o="1"
                    label={{ en: "O(1) amortized", zh: "均摊 O(1)" }}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Dequeue (front)" zh="出队(头)" />
                </td>
                <td>
                  <code>q.poll()</code>
                </td>
                <td>
                  <code>q.popleft()</code>
                </td>
                <td>
                  <code>q[head++]</code>
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Look at the front" zh="看队头" />
                </td>
                <td>
                  <code>q.peek()</code>
                </td>
                <td>
                  <code>q[0]</code>
                </td>
                <td>
                  <code>q[head]</code>
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Insert at the front" zh="队头插入" />
                </td>
                <td>
                  <code>q.offerFirst(x)</code>
                </td>
                <td>
                  <code>q.appendleft(x)</code>
                </td>
                <td>
                  <T
                    en="linked queue or two stacks"
                    zh="手写链表 / 双栈"
                  />
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Remove from the back" zh="队尾弹出" />
                </td>
                <td>
                  <code>q.pollLast()</code>
                </td>
                <td>
                  <code>q.pop()</code>
                </td>
                <td>
                  <code>q.pop()</code>
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Avoid" zh="反面教材" />
                  </b>
                </td>
                <td>
                  <code>LinkedList</code>{" "}
                  <T en="(poor cache behavior)" zh="(缓存不友好)" />
                </td>
                <td>
                  <code>list.pop(0)</code>
                </td>
                <td>
                  <code>arr.shift()</code>
                </td>
                <td>
                  <BigO o="n" />
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
          en: "Patterns, and the monotonic deque",
          zh: "队列的套路 + 单调队列专题",
        }}
        desc={{
          en: "The amortized analysis of a queue built from two stacks, and the standard solution for sliding window extremes.",
          zh: "双栈实现队列的均摊分析,以及滑动窗口最值的标准解法",
        }}
        badge={
          <span className="chip" data-tone="warn">
            <T en="★ Interview core" zh="★ 面试核心" />
          </span>
        }
      >
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PATTERN 01" zh="套路一" />
            </div>
            <div className="card-title">
              <T en="A queue from two stacks" zh="双栈模拟队列" />
            </div>
            <T
              en={
                <p>
                  Two LIFO structures make one FIFO structure, because reversing
                  twice restores the original order. It is the standard example
                  for amortized analysis. LC 232, walkthrough A.
                </p>
              }
              zh={
                <p>
                  两个 LIFO 叠出一个 FIFO:反转两次等于恢复原序。
                  它是均摊分析的经典例题。LC 232,精讲 A。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PATTERN 02" zh="套路二" />
            </div>
            <div className="card-title">
              <T en="Monotonic deque" zh="单调队列" />
            </div>
            <T
              en={
                <p>
                  The maximum or minimum of a sliding window, available in O(1)
                  at any moment. Two rules: drop weaker candidates at the back,
                  drop expired indices at the front. LC 239, 1438, 862;
                  walkthrough B.
                </p>
              }
              zh={
                <p>
                  滑动窗口的最大值 / 最小值,任何时刻都能 O(1)
                  取到。两条规则:队尾淘汰不够强的候选,队头清掉过期的下标。LC
                  239、1438、862,精讲 B。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PATTERN 03" zh="套路三" />
            </div>
            <div className="card-title">
              <T en="Other uses of a deque" zh="deque 的其他用法" />
            </div>
            <T
              en={
                <p>
                  Palindrome checking (compare the two ends, then move inward),
                  0-1 BFS (an edge of weight 0 goes to the front, an edge of
                  weight 1 goes to the back; chapter 12), and work-stealing
                  schedulers (a thread uses its own end as a stack while other
                  threads take tasks from the far end).
                </p>
              }
              zh={
                <p>
                  回文判断(比较两端再向中间收拢)、0-1 BFS(权为 0
                  的边插队头、权为 1 的边排队尾,第 12
                  章会讲)、工作窃取调度(线程把自己这端当栈用,
                  其他线程从另一端取走任务)。
                </p>
              }
            />
          </div>
        </div>

        <div className="prose" style={{ marginTop: 28 }}>
          <T
            en={
              <p>
                A <strong>monotonic deque</strong> is a deque whose contents stay
                in sorted order; the order is kept by removing elements before
                each insertion. Take the{" "}
                <strong>maximum of a sliding window</strong> as the goal. The
                deque holds <strong>indices</strong>, not values, and the values
                at those indices <strong>decrease</strong> from front to back.
                Two rules keep that true, one at each end:
              </p>
            }
            zh={
              <p>
                <strong>单调队列(monotonic deque)</strong>
                是一种内部元素始终保持有序的双端队列,靠「插入前先弹出」来维持这个顺序。
                以<strong>滑动窗口最大值</strong>为例:队列里存的是
                <strong>下标</strong>而不是值,这些下标对应的值从队头到队尾
                <strong>递减</strong>。维持它的规则有两条,两端各一条:
              </p>
            }
          />
        </div>
        <div className="grid-3" style={{ marginTop: 14 }}>
          <div className="card">
            <div className="card-kicker">
              <T en="RULE 01 · BACK" zh="规则一 · 队尾" />
            </div>
            <div className="card-title">
              <T en="Drop weaker candidates" zh="淘汰不够强的候选" />
            </div>
            <T
              en={
                <p>
                  Before index i enters, remove from the back every index whose
                  value is <b>not greater</b> than nums[i]. Each of them is
                  smaller than the new element and also leaves the window
                  earlier, so none of them can ever be a maximum again. Indices
                  with an equal value are removed too, so the values in the deque
                  strictly decrease.
                </p>
              }
              zh={
                <p>
                  下标 i 入队前,把队尾所有值<b>不大于</b> nums[i]
                  的下标弹出。它们既比新元素小,又比新元素更早离开窗口,
                  所以不可能再成为任何窗口的最大值。值相等的下标也会被弹掉,
                  因此队列里的值是严格递减的。
                </p>
              }
            />
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="RULE 02 · FRONT" zh="规则二 · 队头" />
            </div>
            <div className="card-title">
              <T en="Drop the expired index" zh="清掉过期的下标" />
            </div>
            <T
              en={
                <p>
                  When the front index falls outside the window, remove it from
                  the <b>front</b>. Only the front can expire, because it is the
                  oldest index in the deque, so one check per step is enough.
                </p>
              }
              zh={
                <p>
                  队头下标一旦落到窗口之外,就从<b>队头</b>弹出。
                  只有队头可能过期(它是队列里最老的下标),
                  所以每步只需要检查一次。
                </p>
              }
            />
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="RESULT" zh="收获" />
            </div>
            <div className="card-title">
              <T en="The front is the answer" zh="队头就是答案" />
            </div>
            <T
              en={
                <p>
                  With both rules maintained, <b>the front is always the index of
                  the maximum of the current window</b>, and reading it is O(1).
                  One end drops weaker candidates and the other drops expired
                  indices, so the structure has to be a <b>deque</b>.
                </p>
              }
              zh={
                <p>
                  两条规则维护到位后,<b>队头永远是当前窗口最大值的下标</b>
                  ,取答案 O(1)。一端淘汰不够强的候选,另一端清掉过期的下标 ——
                  所以它必须是<b>双端队列</b>。
                </p>
              }
            />
          </div>
        </div>
        <div className="prose" style={{ marginTop: 18 }}>
          <T
            en={
              <p>
                The code has a while loop inside a for loop, which makes many
                learners assume O(n²). It is not. Each index{" "}
                <strong>enters the deque exactly once and leaves at most
                once</strong>, from either end, so the total number of deque
                operations over the whole array is at most 2n. The running time
                is <strong>O(n)</strong>, and the space is O(k) because the deque
                never holds more indices than the window contains.
              </p>
            }
            zh={
              <p>
                代码里 for 套着 while,很多人据此认定是 O(n²) —— 不是。
                每个下标<strong>只入队一次、最多出队一次</strong>
                (无论从哪一端),所以整个数组走完,队列操作总数不超过 2n。
                时间是 <strong>O(n)</strong>;空间 O(k),
                因为队列里的下标数量不会超过窗口长度。
              </p>
            }
          />
        </div>
        <Callout
          tone="idea"
          title={{
            en: "Monotonic stack and monotonic deque, side by side",
            zh: "单调栈 vs 单调队列,一句话分清",
          }}
        >
          <T
            en={
              <p>
                Both reach O(n) the same way: an element that can never be the
                answer is discarded early. The difference is{" "}
                <b>which end elements leave from</b>. A monotonic stack answers
                questions such as &ldquo;next greater element&rdquo;, and an
                element&rsquo;s answer is <b>settled at the moment it is
                popped</b>. A monotonic deque answers questions about a window,
                and it adds a second rule: <b>the index at the front expires</b>{" "}
                once the window moves past it. One end is enough for the stack;
                the window needs both.
              </p>
            }
            zh={
              <p>
                两者拿到 O(n) 的方式相同:提前丢掉「永远不可能成为答案」的元素。
                区别在<b>元素从哪一端离场</b>。单调栈解决「下一个更大元素」这类问题,
                元素<b>被弹出的那一刻就结算答案</b>;单调队列解决窗口类问题,
                多了一条规则:<b>队头的下标会过期</b> ——
                窗口向前滑,老下标自然失效。栈用一端就够,窗口必须两端都用。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough A" zh="精讲 A" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 232 · Implement Queue using Stacks"
              zh="LC 232 · 用栈实现队列"
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
                <b>The problem:</b> implement push, pop, peek, and empty for a
                queue, using only stacks. <b> The idea:</b> a stack{" "}
                <strong>reverses</strong> the order, so reverse it a second time.{" "}
                <b> The naive version:</b> on every push, use the second stack to
                place the new element at the bottom, which makes push O(n).{" "}
                <b> The better version:</b> do not move anything until you have
                to. The <strong>in</strong> stack only accepts pushes, the{" "}
                <strong>out</strong> stack only serves pops, and in is emptied
                into out only when out is empty:
              </p>
            }
            zh={
              <p>
                <b>题意:</b>只准用栈(LIFO),实现队列的 push / pop / peek /
                empty。<b> 思路:</b>栈把顺序<strong>反</strong>过来 —— 那就再反一次。
                <b> 朴素做法:</b>每次 push 都借助第二个栈把新元素垫到底部,push
                O(n)。<b> 更好的做法:</b>不到必须的时候就不搬 —— in
                栈只负责进,<strong>out</strong> 栈只负责出,
                只有 out 空了才把 in 整体倒过去:
              </p>
            }
          />
        </div>
        <TwoStackPour />
        <CodeTabs
          title="lc232_queue_with_stacks"
          java={{
            code: {
              en: `class MyQueue {
    private final Deque<Integer> in  = new ArrayDeque<>(); // push only
    private final Deque<Integer> out = new ArrayDeque<>(); // pop only

    public void push(int x) { in.push(x); }          // O(1)

    public int pop()  { transfer(); return out.pop();  }
    public int peek() { transfer(); return out.peek(); }

    public boolean empty() { return in.isEmpty() && out.isEmpty(); }

    private void transfer() {
        if (!out.isEmpty()) return;   // out still holds older elements: do not transfer
        while (!in.isEmpty())         // out is empty: move all of in across
            out.push(in.pop());       // reversing twice restores arrival order
    }
}`,
              zh: `class MyQueue {
    private final Deque<Integer> in  = new ArrayDeque<>(); // 只进
    private final Deque<Integer> out = new ArrayDeque<>(); // 只出

    public void push(int x) { in.push(x); }          // O(1)

    public int pop()  { transfer(); return out.pop();  }
    public int peek() { transfer(); return out.peek(); }

    public boolean empty() { return in.isEmpty() && out.isEmpty(); }

    private void transfer() {
        if (!out.isEmpty()) return;   // out 里还有更早的元素:绝不转移
        while (!in.isEmpty())         // out 空了:把 in 整体转移过来
            out.push(in.pop());       // 反转两次,恢复到达顺序
    }
}`,
            },
            hl: [13, 14, 15],
          }}
          python={{
            code: {
              en: `class MyQueue:
    def __init__(self):
        self.stk_in = []       # push only
        self.stk_out = []      # pop only

    def push(self, x: int) -> None:
        self.stk_in.append(x)              # O(1)

    def pop(self) -> int:
        self._transfer()
        return self.stk_out.pop()

    def peek(self) -> int:
        self._transfer()
        return self.stk_out[-1]

    def empty(self) -> bool:
        return not self.stk_in and not self.stk_out

    def _transfer(self):
        if self.stk_out:                   # out still holds older elements: do not transfer
            return
        while self.stk_in:                 # out is empty: move all of in across
            self.stk_out.append(self.stk_in.pop())  # reversing twice restores order`,
              zh: `class MyQueue:
    def __init__(self):
        self.stk_in = []       # 只进
        self.stk_out = []      # 只出

    def push(self, x: int) -> None:
        self.stk_in.append(x)              # O(1)

    def pop(self) -> int:
        self._transfer()
        return self.stk_out.pop()

    def peek(self) -> int:
        self._transfer()
        return self.stk_out[-1]

    def empty(self) -> bool:
        return not self.stk_in and not self.stk_out

    def _transfer(self):
        if self.stk_out:                   # out 里还有更早的元素:绝不转移
            return
        while self.stk_in:                 # out 空了:把 in 整体转移过来
            self.stk_out.append(self.stk_in.pop())  # 反转两次,恢复原序`,
            },
            hl: [21, 22, 23, 24],
          }}
          js={{
            code: {
              en: `var MyQueue = function () {
  this.stkIn = [];       // push only
  this.stkOut = [];      // pop only
};

MyQueue.prototype.push = function (x) {
  this.stkIn.push(x);                    // O(1)
};

MyQueue.prototype.pop = function () {
  this._transfer();
  return this.stkOut.pop();
};

MyQueue.prototype.peek = function () {
  this._transfer();
  return this.stkOut.at(-1);
};

MyQueue.prototype.empty = function () {
  return this.stkIn.length === 0 && this.stkOut.length === 0;
};

MyQueue.prototype._transfer = function () {
  if (this.stkOut.length > 0) return;    // out still holds older elements
  while (this.stkIn.length > 0)          // out is empty: move all of in across
    this.stkOut.push(this.stkIn.pop());  // reversing twice restores order
};`,
              zh: `var MyQueue = function () {
  this.stkIn = [];       // 只进
  this.stkOut = [];      // 只出
};

MyQueue.prototype.push = function (x) {
  this.stkIn.push(x);                    // O(1)
};

MyQueue.prototype.pop = function () {
  this._transfer();
  return this.stkOut.pop();
};

MyQueue.prototype.peek = function () {
  this._transfer();
  return this.stkOut.at(-1);
};

MyQueue.prototype.empty = function () {
  return this.stkIn.length === 0 && this.stkOut.length === 0;
};

MyQueue.prototype._transfer = function () {
  if (this.stkOut.length > 0) return;    // out 里还有更早的元素
  while (this.stkIn.length > 0)          // out 空了:把 in 整体转移过来
    this.stkOut.push(this.stkIn.pop());  // 反转两次,恢复原序
};`,
            },
            hl: [25, 26, 27],
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "Why pop is O(1) amortized",
            zh: "均摊 O(1) 的完整证明(面试要能说出来)",
          }}
        >
          <T
            en={
              <p>
                A single pop can be O(n), when it triggers the transfer. Count{" "}
                <b>elements</b> instead of operations. In its whole life an
                element is moved at most 4 times: into in, out of in, into out,
                out of out. <b>Each of those happens at most once</b>, because
                the transfer never runs while out is not empty, so no element is
                ever transferred twice. n operations therefore cost at most 4n
                moves, which averages to O(1) per operation. Array growth (1 + 2
                + 4 + … &lt; 2n) and the monotonic stack (each element pushed once
                and popped once, at most 2n) are counted the same way:{" "}
                <b>amortized analysis spreads the cost of a rare expensive step
                over all the operations</b>.
              </p>
            }
            zh={
              <p>
                单看一次 pop,最坏是 O(n)(正好赶上转移)。改成盯<b>元素</b>
                而不是操作:一个元素一生最多被搬动 4 次 —— 进 in、出 in、进
                out、出 out,<b>而且每一段最多发生一次</b>(out
                非空时绝不转移,所以没有元素会被转移第二次)。
                n 次操作总搬动不超过 4n 次,平均每次 O(1)。
                数组扩容(1 + 2 + 4 + … &lt; 2n)、单调栈(每个元素进出各一次,不超过
                2n)算的是同一本账:
                <b>均摊分析就是把偶发的大开销摊到所有操作头上</b>。
              </p>
            }
          />
        </Callout>
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
                push is O(1); pop and peek are O(1) amortized; space is O(n).
                First follow-up: why must the transfer be skipped while out is
                not empty? Because the elements moved across would land on top of
                the older ones, and the order would immediately be wrong. Second
                follow-up: what about a stack built from queues? That is LC 225,
                in the problem set: after each push, move the n − 1 earlier
                elements to the back, which makes push O(n) and pop O(1). The two
                problems mirror each other.
              </p>
            }
            zh={
              <p>
                push O(1);pop / peek 均摊 O(1);空间 O(n)。追问一:
                「为什么 out 非空时不能转移?」—— 转移过去的元素会压在更早的元素上面,
                顺序立刻就错了。追问二:「反过来用队列实现栈呢?」—— 那是 LC
                225(题单里有):每次 push 后把前面的 n − 1 个元素挪到队尾,push
                O(n)、pop O(1),两题互为镜像。
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
              en="LC 239 · Sliding Window Maximum"
              zh="LC 239 · 滑动窗口最大值"
            />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="hard">
              HARD
            </span>
            <span className="chip" data-tone="warn" style={{ marginLeft: 8 }}>
              <T en="Monotonic deque" zh="单调队列代表作" />
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>The problem:</b> a window of length k slides from left to
                right; report the maximum at every position.{" "}
                <b> Brute force:</b> scan k elements per window, O(nk), which is
                too slow at n = 10⁵. <b> Why it can be improved:</b> two
                neighboring windows share k − 1 elements, so brute force{" "}
                <strong>scans almost the same stretch again and again</strong>.
                It also throws information away: once an element has a larger
                element to its right, it can never be the maximum of any later
                window. Those elements do not need to be kept. Keep only the
                candidates that are still possible, in decreasing order, in a
                deque. That is a monotonic deque:
              </p>
            }
            zh={
              <p>
                <b>题意:</b>长度为 k 的窗口从左滑到右,输出每个位置的窗口最大值。
                <b> 暴力:</b>每个窗口扫 k 个元素,O(nk) —— n = 10⁵ 时会超时。
                <b> 为什么能优化:</b>相邻两个窗口共享 k − 1 个元素,暴力做法
                <strong>把几乎相同的一段反复重扫</strong>;而且它扔掉了信息 ——
                一个元素只要右边出现了更大的数,它在此后任何窗口里都不可能是最大值,
                这样的元素根本不必保留。把「还有可能的候选」按递减顺序存进
                deque,就是单调队列:
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 239 · Monotonic deque (highlighted = in the deque, grey = outside the window)",
            zh: "LC 239 · 单调队列(亮 = 在队列中,灰 = 已滑出窗口)",
          }}
          frames={F239}
        />
        <CodeTabs
          title="lc239_sliding_window_max"
          java={{
            code: {
              en: `class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] ans = new int[n - k + 1];
        Deque<Integer> dq = new ArrayDeque<>(); // indices; their values decrease
        for (int i = 0; i < n; i++) {
            // (1) drop every index at the back whose value is not greater than nums[i]
            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i])
                dq.pollLast();
            dq.offerLast(i);                    // (2) i enters at the back
            // (3) the front index has left the window -> remove it
            if (dq.peekFirst() <= i - k) dq.pollFirst();
            // (4) once the window is complete, the front is the maximum
            if (i >= k - 1) ans[i - k + 1] = nums[dq.peekFirst()];
        }
        return ans;
    }
}`,
              zh: `class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] ans = new int[n - k + 1];
        Deque<Integer> dq = new ArrayDeque<>(); // 存下标,对应值递减
        for (int i = 0; i < n; i++) {
            // ① 把队尾所有值不大于 nums[i] 的下标弹出
            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i])
                dq.pollLast();
            dq.offerLast(i);                    // ② i 从队尾入队
            // ③ 队头下标已滑出窗口 -> 弹掉
            if (dq.peekFirst() <= i - k) dq.pollFirst();
            // ④ 窗口集齐后,队头就是最大值
            if (i >= k - 1) ans[i - k + 1] = nums[dq.peekFirst()];
        }
        return ans;
    }
}`,
            },
            hl: [8, 9, 10, 12, 14],
          }}
          python={{
            code: {
              en: `from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: list[int], k: int) -> list[int]:
        dq = deque()      # indices; their values decrease from front to back
        ans = []
        for i, v in enumerate(nums):
            # (1) drop every index at the back whose value is not greater than v
            while dq and nums[dq[-1]] <= v:
                dq.pop()
            dq.append(i)                  # (2) i enters at the back
            # (3) the front index has left the window -> remove it
            if dq[0] <= i - k:
                dq.popleft()
            # (4) once the window is complete, the front is the maximum
            if i >= k - 1:
                ans.append(nums[dq[0]])
        return ans`,
              zh: `from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: list[int], k: int) -> list[int]:
        dq = deque()      # 存下标,对应值从队头到队尾递减
        ans = []
        for i, v in enumerate(nums):
            # ① 把队尾所有值不大于 v 的下标弹出
            while dq and nums[dq[-1]] <= v:
                dq.pop()
            dq.append(i)                  # ② i 从队尾入队
            # ③ 队头下标已滑出窗口 -> 弹掉
            if dq[0] <= i - k:
                dq.popleft()
            # ④ 窗口集齐后,队头就是最大值
            if i >= k - 1:
                ans.append(nums[dq[0]])
        return ans`,
            },
            hl: [9, 10, 11, 13, 14, 17],
          }}
          js={{
            code: {
              en: `var maxSlidingWindow = function (nums, k) {
  const dq = [];   // indices, values decreasing; a head index avoids shift()
  let head = 0;
  const ans = [];
  for (let i = 0; i < nums.length; i++) {
    // (1) drop every index at the back whose value is not greater than nums[i]
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i])
      dq.pop();
    dq.push(i);                     // (2) i enters at the back
    // (3) the front index has left the window -> move head forward
    if (dq[head] <= i - k) head++;
    // (4) once the window is complete, the front is the maximum
    if (i >= k - 1) ans.push(nums[dq[head]]);
  }
  return ans;
};`,
              zh: `var maxSlidingWindow = function (nums, k) {
  const dq = [];   // 存下标,值递减;用 head 下标法避开 shift 的 O(n)
  let head = 0;
  const ans = [];
  for (let i = 0; i < nums.length; i++) {
    // ① 把队尾所有值不大于 nums[i] 的下标弹出
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i])
      dq.pop();
    dq.push(i);                     // ② i 从队尾入队
    // ③ 队头下标已滑出窗口 -> head 前移(相当于出队)
    if (dq[head] <= i - k) head++;
    // ④ 窗口集齐后,队头就是最大值
    if (i >= k - 1) ans.push(nums[dq[head]]);
  }
  return ans;
};`,
            },
            hl: [7, 8, 9, 11, 13],
            note: {
              en: (
                <>
                  <b>Note:</b> this is the head index from §05 applied to a real
                  problem. The operations at the front of the deque become{" "}
                  <code>head++</code>, so <code>shift()</code> is never called.
                </>
              ),
              zh: (
                <>
                  <b>看这里:</b>§05 的 head
                  下标法在真题里的实战 —— deque 的队头操作被{" "}
                  <code>head++</code> 顶替,全程没有 <code>shift()</code>。
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
                Time <b>O(n)</b>: each index enters the deque once and leaves at
                most once, so there are at most 2n deque operations in total,
                even though the code has a while loop inside a for loop. Space
                O(k). First follow-up: the minimum of the window? Reverse every
                comparison and keep the values increasing. Second follow-up: the
                maximum and the minimum at the same time? Run two monotonic
                deques over the same window (LC 1438, in the problem set). Third
                follow-up: why store indices instead of values? Because{" "}
                <b>the expiry test needs a position</b> (front ≤ i − k). An index
                gives you the value, and a value does not give you the index —
                the same reason a monotonic stack stores indices.
              </p>
            }
            zh={
              <p>
                时间 <b>O(n)</b>:每个下标入队一次、最多出队一次,
                所以队列操作总数不超过 2n —— 尽管代码里 for 套着 while。空间
                O(k)。追问一:「求窗口最小值?」—— 所有比较反向,维护递增队列。
                追问二:「同时要 max 和 min?」——
                在同一个窗口上并行跑两个单调队列(LC 1438,题单里有)。追问三:
                「为什么存下标不存值?」——<b>过期判断需要位置信息</b>(队头 ≤ i −
                k)。下标能查出值,值查不出下标 ——
                和单调栈存下标是同一个道理。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title={{
          en: "Problem set: 8 queue problems",
          zh: "高频题单:队列 8 题",
        }}
        desc={{
          en: "Simulation, then design, then monotonic deques, easy to hard. Think for 30 seconds before you open the hint.",
          zh: "模拟 → 设计 → 单调队列,由易到难。先想 30 秒再看提示",
        }}
        badge={
          <span className="chip">
            <T en="Selected" zh="精选" />
          </span>
        }
      >
        <ProblemSet ch="queue" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "All 7 correct turns this chapter green.",
          zh: "7 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="queue" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                A queue splits the two ends: <b>enqueue at the back, dequeue at
                the front</b>. The element removed is always the one that has
                waited longest, which is what FIFO means. A deque opens both ends
                and can act as a stack or as a queue.
              </>
            ),
            zh: (
              <>
                队列两端分工:<b>队尾入队、队头出队</b>
                。取走的永远是等待最久的那个元素 —— 这就是 FIFO 的含义。deque
                两端全开,既能当栈,也能当队列。
              </>
            ),
          },
          {
            en: (
              <>
                A plain array queue forces a bad choice: shift on every dequeue
                (O(n)), or leave the freed front slots unused forever. The{" "}
                <b>circular queue</b> removes both problems by taking every index{" "}
                <code>% cap</code>. front == rear then means either full or
                empty, so the design resolves it by <b>keeping one slot empty</b>{" "}
                or by <b>keeping a size counter</b>.
              </>
            ),
            zh: (
              <>
                朴素数组队列只能二选一:每次出队都搬移(O(n)),
                或者让队头腾出的格子永远闲置。<b>循环队列</b>把所有下标都{" "}
                <code>% cap</code>,一次解决两个问题。此时 front == rear
                既可能是满也可能是空,所以设计上要么<b>留一格空</b>,要么
                <b>维护 size 计数器</b>。
              </>
            ),
          },
          {
            en: (
              <>
                What to use: <code>ArrayDeque</code> in Java (<code>Queue</code>{" "}
                is an interface; <code>LinkedList</code> implements it too but is
                slower, and ArrayDeque rejects <code>null</code>);{" "}
                <code>collections.deque</code> in Python (<b>not{" "}
                <code>list.pop(0)</code></b>, and <code>queue.Queue</code> is a
                separate class for threads). JavaScript has no queue type and{" "}
                <code>shift()</code> is O(n) in general: use a head index, two
                stacks, or a linked queue.
              </>
            ),
            zh: (
              <>
                选型:Java 用 <code>ArrayDeque</code>(<code>Queue</code>{" "}
                是接口,<code>LinkedList</code> 也实现了它但更慢,而且 ArrayDeque
                不接受 <code>null</code>);Python 用{" "}
                <code>collections.deque</code>(<b>别用 <code>list.pop(0)</code></b>
                ,<code>queue.Queue</code> 是用于线程的另一个类)。JavaScript
                没有队列类型,<code>shift()</code> 一般情况下是 O(n) ——
                用 head 下标法 / 双栈 / 手写链表队列。
              </>
            ),
          },
          {
            en: (
              <>
                A queue from two stacks: reversing twice restores the arrival
                order, and each element is moved at most 4 times in its whole
                life, so pop is <b>O(1) amortized</b> — the same accounting as
                array growth and the monotonic stack.
              </>
            ),
            zh: (
              <>
                双栈模拟队列:反转两次恢复到达顺序;每个元素一生最多被搬动 4 次,
                所以 pop 是<b>均摊 O(1)</b> —— 和数组扩容、单调栈是同一本账。
              </>
            ),
          },
          {
            en: (
              <>
                A monotonic deque holds <b>indices</b> whose values decrease from
                front to back. Remove from the back every index whose value is
                not greater than the new element, and remove the front index once
                it has left the window. The front is then always the maximum of
                the current window, and the whole scan is <b>O(n)</b>, because
                each index enters once and leaves at most once.
              </>
            ),
            zh: (
              <>
                单调队列里存的是<b>下标</b>,对应值从队头到队尾递减:
                队尾弹出所有值不大于新元素的下标,队头弹出已经离开窗口的下标。
                于是队头永远是当前窗口的最大值,整趟扫描是 <b>O(n)</b> ——
                因为每个下标只入队一次、最多出队一次。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="queue" />
    </main>
  );
}
