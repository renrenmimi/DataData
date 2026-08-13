"use client";

// 第 5 章 · 队列与双端队列 —— 十段式:
// 直觉(FIFO)→ 内存(搬家/浪费/绕圈 → 循环队列、链表、deque)→
// 核心操作(RingLab 环形实验室)→ 手写实现(循环队列 = LC 622 + 链表版)→
// 三语言对照(JS 没有真队列!)→ 双栈模拟 + 单调队列专题 +
// 两道精讲(LC 232 / 239 逐帧)→ 题单 → 测验 → 要点。

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
import { QueueMemFig, RingLab, TwoStackPour } from "./viz";

/* ================= 精讲动画帧 ================= */

// LC 239 滑动窗口最大值:nums = [5,3,1,4,2,6], k = 3
// lit = 在单调队列中,bad = 被弹出/弹出,ghost = 已滑出窗口,ok = 收官
const F239: ArrayFrame[] = [
  {
    cells: [{ v: 5 }, { v: 3 }, { v: 1 }, { v: 4 }, { v: 2 }, { v: 6 }],
    msg: (
      <>
        nums = [5,3,1,4,2,6],k = 3。暴力:每个窗口扫 k 个,O(nk)。
        单调队列的野心:窗口每滑一步,最大值 <b>O(1)</b> 拿到。
        队列里存下标,对应值从队头到队尾<b>递减</b>。亮 = 在队列中。
      </>
    ),
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
      { i: 0, label: "头" },
    ],
    msg: <>i=0:队列空,5 从队尾入队。队列(头→尾):[5]。</>,
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
      { i: 0, label: "头" },
    ],
    msg: (
      <>
        i=1:3 比队尾的 5 小 —— 挤不走前辈,但 5 滑出窗口后它<b>可能接班</b>
        ,所以从队尾入队当候补。队列:[5, 3],递减 ✓。
      </>
    ),
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
      { i: 0, label: "头" },
    ],
    msg: (
      <>
        i=2:1 同理入队。窗口 [0..2] 集齐 → <b>看一眼队头:5,就是最大值</b>
        ,ans = [5]。查最大 = 读队头,O(1)。
      </>
    ),
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
      { i: 0, label: "头" },
    ],
    msg: (
      <>
        i=3:4 入队前先「弹出」:队尾的 1、3 都比 4 小 —— 它们比 4 矮、
        还比 4 早过期,<b>不可能再成为最大值</b> → 从队尾全部弹出,4 入队。
      </>
    ),
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
      { i: 3, label: "头" },
    ],
    msg: (
      <>
        窗口滑到 [1..3]:队头 5(下标 0)已在窗口外 —— <b>过期,从队头弹出</b>
        。队列:[4] → ans = [5, 4]。两端都在干活:尾端弹出,头端清过期。
      </>
    ),
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
      { i: 3, label: "头" },
    ],
    msg: (
      <>
        i=4:2 比队尾的 4 小 → 入队当候补。窗口 [2..4],队头 4 仍在窗口内 →
        ans = [5, 4, 4]。候补 2 的存在就是为了 4 过期后的世界。
      </>
    ),
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
      { i: 5, label: "头" },
    ],
    msg: (
      <>
        i=5:6 驾到 —— 队尾的 2、4 统统比它小,全部弹出!队列:[6],窗口
        [3..5] → ans = [5, 4, 4, 6]。
      </>
    ),
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
    msg: (
      <>
        收官:ans = [5, 4, 4, 6]。每个下标最多<b>入队一次、出队一次</b>
        (无论从头还是尾)→ 总操作 ≤ 2n,<b>O(n)</b>。n=10⁵、k=10⁴ 时,
        比暴力快约一万倍。
      </>
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: "直觉" },
  { id: "memory", n: "02", label: "内存里的样子" },
  { id: "ops", n: "03", label: "核心操作" },
  { id: "impl", n: "04", label: "手写实现" },
  { id: "langs", n: "05", label: "三语言对照" },
  { id: "patterns", n: "06", label: "套路与单调队列" },
  { id: "problems", n: "07", label: "高频题单" },
  { id: "quiz", n: "08", label: "通关测验" },
];

export default function QueueChapter() {
  return (
    <main className="page" data-ch="queue">
      <Hero
        ch="queue"
        title={
          <>
            队列与双端队列 <span className="grad">Queue &amp; Deque</span>
          </>
        }
        essence={
          <>
            排队买奶茶:队尾进、队头出,<strong>先来的先被服务</strong>。
            它是一切「按到达顺序处理」系统的地基 —— 先进先出 FIFO;
            外加一个两端均可操作的推广形式:<strong>双端队列 deque</strong>。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 直觉 ================= */}
      <Section
        id="intuition"
        index="01"
        title="直觉:排队买奶茶"
        desc="栈管「最近优先」,队列管「公平」—— 两种秩序,各管半个世界"
      >
        <div className="prose">
          <p>
            上一章的栈处处是「最近优先」:后来者居上。但想象打印店只有一台打印机,
            如果永远先打<strong>最新</strong>提交的文件,只要不断有新任务进来,
            最早的那份文件就<strong>永远轮不到</strong> ——
            计算机科学管这叫「饥饿(starvation)」。打印任务、外卖订单、
            客服工单、消息系统……这些场景要的不是最近优先,而是
            <strong>公平:先来的先处理</strong>。
          </p>
          <p>
            为公平而生的结构就是<strong>队列(Queue)</strong>。画面感:
            奶茶店门口的队伍 —— 新客人从<strong>队尾(rear)</strong>加入,
            店员只服务<strong>队头(front)</strong>。
            <strong>先进先出,FIFO(First In, First Out)</strong>。三条规矩:
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">RULE 01</div>
            <div className="card-title">两端分工</div>
            <p>
              入队(enqueue)只在<b>队尾</b>,出队(dequeue)只在<b>队头</b>。
              和栈的区别就这一条:栈一端进出,队列两端各司其职。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 02</div>
            <div className="card-title">⏱️ 先进先出</div>
            <p>
              到达顺序 = 处理顺序,任何人都不会被无限插队 ——
              「公平」是队列对使用者的核心承诺。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 03</div>
            <div className="card-title">不许插队</div>
            <p>
              不提供访问/修改中间元素的操作。和栈一样:<b>能力锁得越小,
              每个操作越快</b> —— 全部 O(1)。
            </p>
          </div>
        </div>
        <Callout tone="story" title="它无处不在">
          <p>
            操作系统的任务调度队列、打印机的作业队列、Kafka/RabbitMQ
            这类<b>消息队列</b>(双十一的削峰填谷:请求先排队,后端按自己的节奏消费)、
            还有算法世界的重头戏 —— 第 7 章二叉树和第 12 章图的
            <b>BFS(广度优先搜索)</b>,「一层处理完再处理下一层」的顺序,
            全靠队列维持。这一章学好,BFS 到手一半。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 内存 ================= */}
      <Section
        id="memory"
        index="02"
        title="内存里的样子:从「大坑」到循环队列"
        desc="队列两端都要 O(1) —— 这对数组是个真难题,取模是那把钥匙"
      >
        <div className="prose">
          <p>
            用数组装队列,麻烦立刻出现:入队在尾部,数组很擅长(追加
            O(1));可出队在<strong>头部</strong> —— 数组章讲过,头删要全体搬家
            O(n)。不搬家行不行?行,但空间又开始漏。三条路摆在面前:
          </p>
        </div>
        <QueueMemFig />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            方案三就是<strong>循环队列(circular queue)</strong>,
            工程里也叫<strong>环形缓冲区(ring buffer)</strong>:数组物理上仍是
            一条直线,但所有下标运算都 <code>% capacity</code>,
            让它<strong>逻辑上</strong>变成一个圈 —— front 在前面吃,rear
            在后面绕圈补,只要没装满,永远有格子可用。§03 的 RingLab
            可以亲手转这个圈。
          </p>
        </div>
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-kicker">另一条路线</div>
            <div className="card-title">链表实现:头出尾进</div>
            <p>
              维护 head、tail 两个指针:出队 = 摘下头节点(O(1)),入队 =
              接在尾节点后(O(1))。为什么不反过来?<b>单链表尾删要从头找前驱
              O(n)</b>,而头删、尾插都免遍历 —— 又是「选不用搬家/遍历的那端」。
              不用扩容、不怕装满,代价是指针内存 + 缓存不友好。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">推广形式</div>
            <div className="card-title">双端队列 deque:两端全开</div>
            <p>
              deque(double-ended queue,读 “deck”)把限制再放开一档:
              <b>头尾都能进、都能出</b>,四个方向全 O(1)。它一人分饰两角:
              只用一端 = 栈,两端各用一个 = 队列。§06 的单调队列必须用它 ——
              因为那套算法恰好要「尾端弹出、头端清过期」。
            </p>
          </div>
        </div>
        <Callout tone="deep" title="工程现场:环形缓冲区到处都是">
          <p>
            网卡收发包的驱动缓冲、音频设备的采样缓冲、日志系统的固定大小缓冲、
            高频交易框架 LMAX Disruptor 的核心 —— 全是环形缓冲区。原因相同:
            <b>定长数组 + 两个绕圈指针 = 零分配、零搬家、缓存友好</b>
            ,生产者和消费者各追各的指针,速度可以压到纳秒级。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 核心操作 ================= */}
      <Section
        id="ops"
        index="03"
        title="核心操作:全部 O(1),看清指针怎么绕圈"
        desc="复杂度表 + 环形实验室 —— 顺便解决「满和空长得一样」的悬案"
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>操作</th>
                <th>含义</th>
                <th>复杂度</th>
                <th>为什么</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>enqueue(x)</b> 入队
                </td>
                <td>x 加到队尾</td>
                <td>
                  <BigO o="1" />
                </td>
                <td>写进 rear 指的格子(或接在 tail 后),指针前进一步</td>
              </tr>
              <tr>
                <td>
                  <b>dequeue()</b> 出队
                </td>
                <td>取走队头</td>
                <td>
                  <BigO o="1" />
                </td>
                <td>循环队列只挪 front 指针;链表摘头节点 —— 都零搬家</td>
              </tr>
              <tr>
                <td>
                  <b>peek()</b> 看队头
                </td>
                <td>只看不拿</td>
                <td>
                  <BigO o="1" />
                </td>
                <td>读 front 指的格子 / 头节点</td>
              </tr>
              <tr>
                <td>
                  <b>isEmpty() / size()</b>
                </td>
                <td>判空 / 求大小</td>
                <td>
                  <BigO o="1" />
                </td>
                <td>比较指针或读计数器</td>
              </tr>
              <tr>
                <td>
                  <b>deque 四向操作</b>
                </td>
                <td>两端进出</td>
                <td>
                  <BigO o="1" />
                </td>
                <td>循环数组两个指针都能进能退;双向链表两端都有把手</td>
              </tr>
              <tr>
                <td>
                  <b>访问 / 查找中间</b>
                </td>
                <td>——</td>
                <td>
                  <BigO o="n" />
                </td>
                <td>队列不提供 —— 需要随机访问请回数组</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            动手转几圈,重点观察三件事:①出队时<strong>没有任何元素移动</strong>
            ;②rear 走到头怎么绕回 0;③「满」和「空」为什么会冲突,
            以及两种拆招方案:
          </p>
        </div>
        <RingLab />
        <Callout tone="warn" title="满 == 空?循环队列的经典陷阱">
          <p>
            空是 front == rear,可 rear 绕一整圈追上 front 时(满),
            指针状态<b>一模一样</b>。两种消歧方案:<b>方案 A 留一格空</b> ——
            开 k+1 格,(rear+1) % cap == front 即满,零额外变量,牺牲一格;
            <b>方案 B 计数器</b> —— 维护 size,空 = 0、满 = cap,格子全能用,
            每次进出多一次加减。面试写哪种都对,<b>能讲出为什么要消歧才是关键</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 手写实现 ================= */}
      <Section
        id="impl"
        index="04"
        title="手写实现:循环队列(就是 LC 622)"
        desc="RingLab 里玩过的一切,现在变成代码 —— 写完可以直接去提交"
      >
        <div className="prose">
          <p>
            下面这个类<strong>正是 LeetCode 622「设计循环队列」的原题解</strong>
            :定长数组 + front/rear 指针 + 取模绕圈,采用「留一格空」方案
            (所以构造时多开一格)。每一行都能对应到 RingLab 里的一个动作:
          </p>
        </div>
        <CodeTabs
          title="my_circular_queue"
          java={{
            code: `class MyCircularQueue {
    private final int[] data;   // 定长数组,"环"是逻辑上的
    private int front = 0;      // 队头:下一个出队的位置
    private int rear  = 0;      // 队尾:下一个写入的位置

    public MyCircularQueue(int k) {
        data = new int[k + 1];  // 多开 1 格:留空格区分"满"与"空"
    }

    public boolean enQueue(int value) {
        if (isFull()) return false;
        data[rear] = value;
        rear = (rear + 1) % data.length;   // 取模:越过末尾绕回 0
        return true;
    }

    public boolean deQueue() {
        if (isEmpty()) return false;
        front = (front + 1) % data.length; // 出队只挪指针,零搬家!
        return true;
    }

    public int Front() { return isEmpty() ? -1 : data[front]; }

    public int Rear() {                    // rear 指着"下一个写入位",
        return isEmpty() ? -1              // 队尾元素在它前一格:
            : data[(rear - 1 + data.length) % data.length]; // 先 +len 防负数
    }

    public boolean isEmpty() { return front == rear; }
    public boolean isFull()  { return (rear + 1) % data.length == front; }
}`,
            hl: [7, 14, 20, 27, 31, 32],
            note: (
              <>
                <b>方案 B(计数器)版:</b>开 k 格 + 维护 size,empty ⇔ size==0、
                full ⇔ size==k。代码更直白,多一个变量 —— 两种都是标准答案。
              </>
            ),
          }}
          python={{
            code: `class MyCircularQueue:
    def __init__(self, k: int):
        self.data = [0] * (k + 1)  # 多开 1 格:留空格区分"满"与"空"
        self.front = 0             # 队头:下一个出队的位置
        self.rear = 0              # 队尾:下一个写入的位置

    def enQueue(self, value: int) -> bool:
        if self.isFull():
            return False
        self.data[self.rear] = value
        self.rear = (self.rear + 1) % len(self.data)  # 取模绕圈
        return True

    def deQueue(self) -> bool:
        if self.isEmpty():
            return False
        self.front = (self.front + 1) % len(self.data)  # 只挪指针,零搬家!
        return True

    def Front(self) -> int:
        return -1 if self.isEmpty() else self.data[self.front]

    def Rear(self) -> int:         # 队尾元素在 rear 的前一格
        if self.isEmpty():
            return -1
        return self.data[(self.rear - 1) % len(self.data)]  # Python 负取模天然为正

    def isEmpty(self) -> bool:
        return self.front == self.rear

    def isFull(self) -> bool:
        return (self.rear + 1) % len(self.data) == self.front`,
            hl: [3, 11, 17, 26, 29, 32],
            note: (
              <>
                <b>细节:</b>Python 的 <code>-1 % 8 == 7</code>
                (结果跟除数同号),所以不用像 Java/JS 那样先 +len ——
                但跨语言写代码时,统一写 <code>(i - 1 + n) % n</code> 最保险。
              </>
            ),
          }}
          js={{
            code: `var MyCircularQueue = function (k) {
  this.data = new Array(k + 1);  // 多开 1 格:留空格区分"满"与"空"
  this.front = 0;                // 队头:下一个出队的位置
  this.rear = 0;                 // 队尾:下一个写入的位置
};

MyCircularQueue.prototype.enQueue = function (value) {
  if (this.isFull()) return false;
  this.data[this.rear] = value;
  this.rear = (this.rear + 1) % this.data.length;  // 取模绕圈
  return true;
};

MyCircularQueue.prototype.deQueue = function () {
  if (this.isEmpty()) return false;
  this.front = (this.front + 1) % this.data.length; // 只挪指针,零搬家!
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
            hl: [2, 10, 16, 26, 30, 34],
            note: (
              <>
                <b>易错点:</b>JS 的 <code>-1 % 8 === -1</code>
                (结果跟被除数同号)!所以后退必须写{" "}
                <code>(i - 1 + n) % n</code>,直接取模会得到负下标。
              </>
            ),
          }}
        />
        <div className="prose" style={{ marginTop: 24 }}>
          <p>
            <strong>链表版队列</strong>也值得手写一遍 —— 它是第 7 章 BFS
            里队列的常见形态,而且藏着一个高频边界坑(tail 归位):
          </p>
        </div>
        <CodeTabs
          title="linked_queue"
          java={{
            code: `class LinkedQueue {
    private static class Node {
        int val; Node next;
        Node(int v) { val = v; }
    }
    private Node head = null;    // 队头:出队端
    private Node tail = null;    // 队尾:入队端
    private int size = 0;

    public void offer(int x) {   // 入队:接在 tail 后面,O(1)
        Node n = new Node(x);
        if (tail == null) head = tail = n;  // 空队列:头尾同指新节点
        else { tail.next = n; tail = n; }
        size++;
    }

    public int poll() {          // 出队:摘下 head,O(1)
        if (head == null) throw new RuntimeException("队列空");
        int v = head.val;
        head = head.next;
        if (head == null) tail = null;  // 删到空:tail 必须一起归位!
        size--;
        return v;
    }
}`,
            hl: [12, 13, 20, 21],
            note: (
              <>
                <b>高频坑:</b>删掉最后一个节点时忘记 <code>tail = null</code>
                ,下次 offer 会接在「幽灵节点」后面 —— 队列从此悄悄断裂。
              </>
            ),
          }}
          python={{
            code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

class LinkedQueue:
    def __init__(self):
        self.head = None      # 队头:出队端
        self.tail = None      # 队尾:入队端
        self.size = 0

    def offer(self, x):       # 入队:接在 tail 后面,O(1)
        n = Node(x)
        if self.tail is None:
            self.head = self.tail = n   # 空队列:头尾同指新节点
        else:
            self.tail.next = n
            self.tail = n
        self.size += 1

    def poll(self):           # 出队:摘下 head,O(1)
        if self.head is None:
            raise IndexError("队列空")
        v = self.head.val
        self.head = self.head.next
        if self.head is None:           # 删到空:tail 必须一起归位!
            self.tail = None
        self.size -= 1
        return v`,
            hl: [15, 18, 25, 26, 27],
          }}
          js={{
            code: `class LinkedQueue {
  #head = null;    // 队头:出队端
  #tail = null;    // 队尾:入队端
  #size = 0;

  offer(x) {       // 入队:接在 tail 后面,O(1)
    const n = { val: x, next: null };
    if (this.#tail === null) {
      this.#head = this.#tail = n;   // 空队列:头尾同指新节点
    } else {
      this.#tail.next = n;
      this.#tail = n;
    }
    this.#size++;
  }

  poll() {         // 出队:摘下 head,O(1)
    if (this.#head === null) throw new Error("队列空");
    const v = this.#head.val;
    this.#head = this.#head.next;
    if (this.#head === null) this.#tail = null; // 删到空:tail 归位!
    this.#size--;
    return v;
  }

  get size() { return this.#size; }
}`,
            hl: [9, 11, 20, 21],
          }}
        />
        <Callout tone="idea" title="要点回顾:为什么头出尾进?">
          <p>
            单链表<b>头删 O(1)、尾插 O(1)(有 tail 指针)、尾删 O(n)
            (要找前驱)</b>。所以出队必须放头、入队必须放尾 ——
            方向反了,其中一端就退化成 O(n)。和「数组栈顶在尾、链表栈顶在头」
            是同一个思考模板:哪端便宜用哪端。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 三语言对照 ================= */}
      <Section
        id="langs"
        index="05"
        title="三语言对照:JS 没有真队列!"
        desc="Java 与 Python 均有标准库实现;JavaScript 没有,需要自行构造"
      >
        <div className="prose">
          <p>
            队列是三语言标准库差异<strong>最大</strong>的结构:Java 和 Python
            都有工业级 deque 可以直接用,JS 却压根没有 ——{" "}
            <code>Array.shift()</code> 看着像出队,实际是 O(n) 搬家。逐个看:
          </p>
        </div>
        <CodeTabs
          title="queue_basics"
          java={{
            code: `import java.util.ArrayDeque;
import java.util.Deque;

// ✅ 首选:ArrayDeque(底层就是 §04 的循环数组)
Deque<Integer> queue = new ArrayDeque<>();
queue.offer(1);              // 入队(尾)
queue.offer(2);
int head = queue.peek();     // 看队头 → 1
int x = queue.poll();        // 出队(头)→ 1

// deque 的两端操作:头尾均可进出
queue.offerFirst(0);         // 队头插入
queue.offerLast(9);          // 队尾插入(= offer)
queue.pollLast();            // 队尾弹出

// LinkedList 也实现了 Deque 接口,能当队列,
// 但节点散落在堆上、缓存不友好,还多一层指针开销
Deque<Integer> slower = new java.util.LinkedList<>();`,
            hl: [5, 6, 9, 12, 14],
            note: (
              <>
                <b>API 家族:</b>offer/poll/peek 失败时返回 false/null;
                add/remove/element 失败时抛异常 —— 刷题惯用前一组。
                注意 ArrayDeque <b>不允许存 null</b>(null 被用作「没有元素」
                的信号)。
              </>
            ),
          }}
          python={{
            code: `from collections import deque

q = deque()
q.append(1)         # 入队(右端)
q.append(2)
head = q[0]         # 看队头 → 1(两端访问是 O(1))
x = q.popleft()     # 出队(左端)→ 1,O(1)!

# deque 的两端操作:头尾均可进出
q.appendleft(0)     # 左端插入 O(1)
q.pop()             # 右端弹出 O(1)

# ❌ 千万别:用 list 当队列
bad = [1, 2, 3]
bad.pop(0)          # O(n)!头部抽走,全体左移一格`,
            hl: [1, 4, 7, 15],
            note: (
              <>
                <b>底层:</b>deque 是<b>块状双向链表</b> ——
                每个节点是能装 64 个元素的小数组块。两端 O(1),
                又比纯链表缓存友好;代价是中间随机访问 <code>q[i]</code> 退化为
                O(n)。<b>list.pop(0) 是 Python 解题中最常见的性能问题。</b>
              </>
            ),
          }}
          js={{
            code: `// ❌ JS 标准库没有队列!shift() 是 O(n) 大坑
const bad = [1, 2, 3];
bad.shift();               // 头部抽走 → 后面全体前移,O(n)

// ✅ 做法一:下标假装出队(刷题首选,三行搞定)
const q = [];
let head = 0;              // "队头指针"只前移,从不真删
q.push(1); q.push(2);      // 入队:照常 push
const x = q[head++];       // 出队:读一下,指针右移 → O(1)
const empty = head === q.length;

// ✅ 做法二:双栈模拟(§06 精讲 A,均摊 O(1))
// ✅ 做法三:手写链表队列(§04 已写好)`,
            hl: [3, 7, 9, 10],
            note: (
              <>
                <b>取舍:</b>下标法「已出队」的元素仍占内存,直到整个数组被回收
                —— 刷题(生命周期几百毫秒)完全无所谓;长期驻留的服务里,
                要么定期 <code>q = q.slice(head)</code> 整理,要么换链表。
              </>
            ),
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>操作</th>
                <th>Java(ArrayDeque)</th>
                <th>Python(deque)</th>
                <th>JavaScript(下标法)</th>
                <th>复杂度</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>入队(尾)</td>
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
                  <BigO o="1" label="均摊 O(1)" />
                </td>
              </tr>
              <tr>
                <td>出队(头)</td>
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
                <td>看队头</td>
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
                <td>队头插入</td>
                <td>
                  <code>q.offerFirst(x)</code>
                </td>
                <td>
                  <code>q.appendleft(x)</code>
                </td>
                <td>手写链表 / 双栈</td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>队尾弹出</td>
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
                  <b>反面教材</b>
                </td>
                <td>
                  <code>LinkedList</code>(缓存不友好)
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
        title="队列的套路 + 单调队列专题"
        desc="双栈实现队列的均摊分析,以及滑动窗口最值的标准解法"
        badge={
          <span className="chip" data-tone="warn">
            ★ 面试核心
          </span>
        }
      >
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">套路一</div>
            <div className="card-title">双栈模拟队列</div>
            <p>
              两个 LIFO 叠出一个 FIFO:两次反转 = 恢复原序。
              均摊 O(1) 的经典证明场。→ LC 232,精讲 A。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">套路二</div>
            <div className="card-title">单调队列</div>
            <p>
              滑动窗口的最大/最小值,O(1) 随取随用。
              「弹出弱者 + 清退过期」双规则。→ LC 239、1438、862,精讲 B。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">套路三</div>
            <div className="card-title">deque 的百变用法</div>
            <p>
              回文判断(两端向中间对撞)、0-1 BFS(边权 0 插队头、1
              排队尾,第 12 章见)、工作窃取调度(自己这端当栈用,
              别的线程从另一端偷任务)。
            </p>
          </div>
        </div>

        <div className="prose" style={{ marginTop: 28 }}>
          <p>
            <strong>单调队列(monotonic queue)专题</strong>,还是先给比喻:
            一家公司按入职顺序排「优秀员工榜」,榜上只留
            <strong>还有机会当第一</strong>的人。新人入职时,把榜尾
            <strong>比自己弱又比自己早</strong>的前辈全部挤下榜 ——
            他们比新人先过期、能力又不如新人,
            <strong>此生再也轮不到当第一</strong>,留着纯属浪费。而榜首
            (最强者)一旦干满年限<strong>过期离场</strong>,就从头部退休,
            榜上第二名自动接班。于是:
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 14 }}>
          <div className="card">
            <div className="card-kicker">规则一 · 队尾</div>
            <div className="card-title">弱者出局</div>
            <p>
              新元素入队前,把队尾所有<b>比它小</b>的弹出 ——
              它们更早过期又更弱,不可能再成为最大值。挤完后队列保持<b>递减</b>。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">规则二 · 队头</div>
            <div className="card-title">过期退休</div>
            <p>
              队头下标滑出窗口范围 → 从<b>队头</b>弹出。
              注意:只有队头可能过期(它最老),检查一个就够。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">收获</div>
            <div className="card-title">队头即答案</div>
            <p>
              两条规则维护完,<b>队头永远是当前窗口最大值</b>,O(1) 直读。
              一端弹出、一端退休 —— 所以它必须是 <b>deque</b>。
            </p>
          </div>
        </div>
        <Callout tone="idea" title="单调栈 vs 单调队列,一句话分清">
          <p>
            都靠「弱者不可能再成为最大值 → 提前丢弃」拿到 O(n)。区别在<b>谁离场</b>:
            单调栈解决「下一个更大」,元素被弹出时<b>结算答案</b>;单调队列解决
            「窗口最值」,多了<b>队头过期</b>这一条 —— 窗口在滑,老元素会自然
            失效。栈一端够用,队列必须两端。
          </p>
        </Callout>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 A</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 232 · 用栈实现队列
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">
              EASY
            </span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>只准用栈(LIFO),实现队列的 push/pop/peek/empty。
            <b> 直觉:</b>栈把顺序<strong>反</strong>过来 —— 那就再反一次!
            <b> 朴素做法:</b>每次 push 都借助第二个栈把新元素垫到底部,push
            O(n)。<b>更聪明的做法:</b>别急着倒,<strong>攒到必须倒的时候
            一次性倒</strong> —— in 栈只进,out 栈只出,out 空了才把 in
            整体转移过去:
          </p>
        </div>
        <TwoStackPour />
        <CodeTabs
          title="lc232_queue_with_stacks"
          java={{
            code: `class MyQueue {
    private final Deque<Integer> in  = new ArrayDeque<>(); // 只进
    private final Deque<Integer> out = new ArrayDeque<>(); // 只出

    public void push(int x) { in.push(x); }          // O(1)

    public int pop()  { transfer(); return out.pop();  }
    public int peek() { transfer(); return out.peek(); }

    public boolean empty() { return in.isEmpty() && out.isEmpty(); }

    private void transfer() {
        if (!out.isEmpty()) return;   // out 还有存货:绝不倒栈!
        while (!in.isEmpty())         // out 空了:in 整体转移过来
            out.push(in.pop());       // 两次反转 = 恢复先来后到
    }
}`,
            hl: [13, 14, 15],
          }}
          python={{
            code: `class MyQueue:
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
        if self.stk_out:                   # out 还有存货:绝不倒栈!
            return
        while self.stk_in:                 # out 空了:in 整体转移过来
            self.stk_out.append(self.stk_in.pop())  # 两次反转 = 恢复原序`,
            hl: [21, 22, 23, 24],
          }}
          js={{
            code: `var MyQueue = function () {
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
  if (this.stkOut.length > 0) return;    // out 还有存货:绝不倒栈!
  while (this.stkIn.length > 0)          // out 空了:in 整体转移过来
    this.stkOut.push(this.stkIn.pop());  // 两次反转 = 恢复原序
};`,
            hl: [25, 26, 27],
          }}
        />
        <Callout tone="deep" title="均摊 O(1) 的完整证明(面试要能说出来)">
          <p>
            单看一次 pop,最坏 O(n)(赶上倒栈)。但盯着<b>元素</b>而不是操作看:
            任何一个元素的一生 = 进 in、出 in、进 out、出 out,
            <b>最多 4 次动作,且每段只发生一次</b>(out 非空绝不倒栈,
            保证没人被倒第二次)。n 个操作涉及的总动作 ≤ 4n → 平均每次 O(1)。
            这和数组扩容(1+2+4+…&lt;2n)、单调栈(进出各一次 ≤ 2n)
            是同一本账:<b>均摊分析 = 把偶发大账摊到全体操作头上</b>。
          </p>
        </Callout>
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            push O(1);pop/peek 均摊 O(1);空间 O(n)。追问一:
            「为什么 out 非空时不能倒栈?」—— 新元素会插到老元素前面,
            顺序立刻错乱。追问二:「反过来用队列实现栈呢?」—— LC 225(题单有)
            :入队后把前 n−1 个转到后面去,push O(n)/pop O(1),两题互为镜像。
          </p>
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 B</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 239 · 滑动窗口最大值
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="hard">
              HARD
            </span>
            <span className="chip" data-tone="warn" style={{ marginLeft: 8 }}>
              单调队列代表作
            </span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>长度 k 的窗口从左滑到右,输出每个位置的窗口最大值。
            <b> 暴力:</b>每个窗口扫 k 个元素,O(nk) —— n=10⁵ 时超时。
            <b> 为什么能优化:</b>相邻窗口重叠 k−1 个元素,暴力在
            <strong>反复重扫几乎相同的一段</strong>;而且一旦某个元素右边出现了
            更大的数,它在余生所有窗口里都不可能是最大值 ——
            这样的「无效候选」根本不必保留。把「还有希望的候选」按递减顺序
            存进 deque,就是单调队列:
          </p>
        </div>
        <ArrayStepper
          title="LC 239 · 单调队列(亮 = 在队列,灰 = 已滑出窗口)"
          frames={F239}
        />
        <CodeTabs
          title="lc239_sliding_window_max"
          java={{
            code: `class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] ans = new int[n - k + 1];
        Deque<Integer> dq = new ArrayDeque<>(); // 存下标,对应值递减
        for (int i = 0; i < n; i++) {
            // ① 队尾比我弱的,不可能再成为最大值 → 弹出
            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i])
                dq.pollLast();
            dq.offerLast(i);                    // ② 我从队尾入队
            // ③ 队头滑出窗口(过期)→ 弹掉
            if (dq.peekFirst() <= i - k) dq.pollFirst();
            // ④ 窗口成形后,队头就是最大值
            if (i >= k - 1) ans[i - k + 1] = nums[dq.peekFirst()];
        }
        return ans;
    }
}`,
            hl: [8, 9, 10, 12, 14],
          }}
          python={{
            code: `from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: list[int], k: int) -> list[int]:
        dq = deque()      # 存下标,对应值从队头到队尾递减
        ans = []
        for i, v in enumerate(nums):
            # ① 队尾比我弱的,不可能再成为最大值 → 弹出
            while dq and nums[dq[-1]] <= v:
                dq.pop()
            dq.append(i)                  # ② 我从队尾入队
            # ③ 队头滑出窗口(过期)→ 弹掉
            if dq[0] <= i - k:
                dq.popleft()
            # ④ 窗口成形后,队头就是最大值
            if i >= k - 1:
                ans.append(nums[dq[0]])
        return ans`,
            hl: [9, 10, 11, 13, 14, 17],
          }}
          js={{
            code: `var maxSlidingWindow = function (nums, k) {
  const dq = [];   // 存下标,值递减;用 head 下标法避开 shift 的 O(n)
  let head = 0;
  const ans = [];
  for (let i = 0; i < nums.length; i++) {
    // ① 队尾比我弱的,不可能再成为最大值 → 弹出
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i])
      dq.pop();
    dq.push(i);                     // ② 我从队尾入队
    // ③ 队头滑出窗口(过期)→ 前移 head(假装出队)
    if (dq[head] <= i - k) head++;
    // ④ 窗口成形后,队头就是最大值
    if (i >= k - 1) ans.push(nums[dq[head]]);
  }
  return ans;
};`,
            hl: [7, 8, 9, 11, 13],
            note: (
              <>
                <b>看这里:</b>§05 的「下标假装出队」在真题里的实战 ——
                deque 的头端操作被 <code>head++</code> 顶替,零 shift。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n)</b>:每个下标最多入队一次、出队一次(总操作 ≤ 2n);
            空间 O(k)。追问一:「求窗口最小值?」—— 全部反向:维护递增队列。
            追问二:「窗口里同时要 max 和 min?」—— 两个单调队列并行
            (LC 1438,题单有)。追问三:「为什么存下标不存值?」——
            <b>过期判断需要下标</b>(dq[头] ≤ i − k),值可以由下标查出,
            反之不行 —— 和单调栈存下标同一个道理。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title="高频题单:队列 8 题"
        desc="模拟 → 设计 → 单调队列,由易到难。先想 30 秒再看提示"
        badge={<span className="chip">精选</span>}
      >
        <ProblemSet ch="queue" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="7 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="queue" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            队列两端分工:<b>队尾 rear 进、队头 front 出</b>,先进先出 FIFO ——
            为「公平/按到达顺序处理」而生;deque 两端全开,一人分饰栈和队列。
          </>,
          <>
            朴素数组队列二选一的坑(出队 O(n) 搬家 vs 空间报废)被
            <b>循环队列</b>一次解决:下标全部 <code>% cap</code> 绕圈复用。
            满/空冲突 → <b>留一格空</b>或<b>计数器</b>两种消歧方案。
          </>,
          <>
            选型:Java 用 <code>ArrayDeque</code>,Python 用{" "}
            <code>collections.deque</code>(<b>别用 list.pop(0)</b>);JS
            没有真队列,<code>shift()</code> 是 O(n) —— 用下标法 / 双栈 / 手写链表。
          </>,
          <>
            双栈模拟队列:两次反转恢复原序;每个元素一生最多 4 次操作 →{" "}
            <b>均摊 O(1)</b> —— 与数组扩容、单调栈同一本「总账」。
          </>,
          <>
            单调队列双规则:队尾<b>弹出比自己弱的</b>(不可能再成为最大值)、队头
            <b>清退过期的</b> —— 队头永远是窗口最大值,滑窗最值 O(n)。
          </>,
        ]}
      />

      <ChapterFooter ch="queue" />
    </main>
  );
}
