"use client";

// 第 4 章 · 栈 —— 十段式:
// 直觉(LIFO)→ 内存(数组栈/链表栈)→ 核心操作(StackLab + 调用栈)→
// 手写实现 → 三语言对照(为什么别用 java.util.Stack)→
// 三大套路 + 单调栈专题 + 三道精讲(LC 20 / 155 / 739 逐帧)→ 题单 → 测验 → 要点。

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
import { PROBLEMS, QUIZ } from "@/lib/stack-data";
import { StackMemFig, StackLab, CallStackDemo } from "./viz";

/* ================= 精讲动画帧 ================= */

// LC 20 有效的括号:栈画成一排 cell(下标 = 距栈底的层数),top 指针标栈顶
const F20: ArrayFrame[] = [
  {
    cells: [],
    msg: (
      <>
        输入 s = {'"([{}])"'}。规则:每个右括号必须与<b>最近的</b>
        未配对左括号成对 —— 「最近的先处理」,栈的主场。
        栈里存「还没等到另一半的左括号」,下面把栈横过来画,右端是栈顶。
      </>
    ),
  },
  {
    cells: [{ v: "(", state: "lit" }],
    ptrs: [{ i: 0, label: "top" }],
    msg: <>读到 {"'('"}:左括号一律入栈,排队等它的另一半。</>,
  },
  {
    cells: [{ v: "(" }, { v: "[", state: "lit" }],
    ptrs: [{ i: 1, label: "top" }],
    msg: (
      <>
        读到 {"'['"}:入栈。它压在 {"'('"} 上面 —— 意味着 {"'['"} 必须<b>先</b>
        被配对,{"'('"} 只能等它。嵌套结构的顺序被栈自动记住了。
      </>
    ),
  },
  {
    cells: [{ v: "(" }, { v: "[" }, { v: "{", state: "lit" }],
    ptrs: [{ i: 2, label: "top" }],
    msg: (
      <>
        读到 {"'{'"}:入栈。三层嵌套 = 栈里三个等待者,自底向上正好是打开顺序。
      </>
    ),
  },
  {
    cells: [{ v: "(" }, { v: "[" }, { v: "{", state: "ok" }],
    ptrs: [{ i: 2, label: "top" }],
    msg: (
      <>
        读到 {"'}'"}:右括号<b>不入栈</b>,先跟栈顶比对:{"'{'"} 配 {"'}'"} ✓
        —— 弹出栈顶,这一对完成。
      </>
    ),
  },
  {
    cells: [{ v: "(" }, { v: "[", state: "ok" }],
    ptrs: [{ i: 1, label: "top" }],
    msg: (
      <>
        读到 {"']'"}:栈顶是 {"'['"} ✓ 弹出。每次配对的都是「最新的等待者」——
        LIFO 与嵌套完美咬合。
      </>
    ),
  },
  {
    cells: [{ v: "(", state: "ok" }],
    ptrs: [{ i: 0, label: "top" }],
    msg: <>读到 {"')'"}:栈顶 {"'('"} ✓ 弹出。</>,
  },
  {
    cells: [],
    msg: (
      <>
        扫描结束,栈空 → <b>true</b>。两种失败姿势:①中途对不上(如 {'"(]"'}
        ,栈顶是 {"'('"} 却来了 {"']'"});②扫完栈非空(如 {'"(("'}
        ,有人永远等不到另一半)。
      </>
    ),
  },
];

// LC 155 最小栈:每格 = 主栈的值 + 影子栈冻结的 min
const mc = (
  v: number,
  m: number,
  state?: "lit" | "ok" | "bad" | "ghost",
): ArrayFrame["cells"][number] => ({
  v: (
    <span className="stk-mc">
      {v}
      <i>min {m}</i>
    </span>
  ),
  state,
});

const F155: ArrayFrame[] = [
  {
    cells: [],
    msg: (
      <>
        目标:pop / top / getMin <b>全部 O(1)</b>。诀窍:主栈旁边配一个影子栈,
        同步记录「到这一层为止的最小值」。下面把两者画进同一个格子:上 = 值,
        下 = 该层冻结的 min。
      </>
    ),
  },
  {
    cells: [mc(-2, -2, "lit")],
    ptrs: [{ i: 0, label: "top" }],
    msg: <>push(−2):影子层记 min(−2) = −2 —— 它是目前唯一的元素。</>,
  },
  {
    cells: [mc(-2, -2), mc(0, -2, "lit")],
    ptrs: [{ i: 1, label: "top" }],
    msg: (
      <>
        push(0):这一层的 min = min(0, 下层的 −2) = <b>−2</b>。注意:0
        这层记的不是 0,而是「它以下整段的最小值」。
      </>
    ),
  },
  {
    cells: [mc(-2, -2), mc(0, -2), mc(-3, -3, "lit")],
    ptrs: [{ i: 2, label: "top" }],
    msg: (
      <>
        push(−3):min 更新为 −3。每一层的 min 在<b>入栈那一刻就冻结</b>
        ,之后永不改变 —— 这是整个设计能成立的关键。
      </>
    ),
  },
  {
    cells: [mc(-2, -2), mc(0, -2), mc(-3, -3, "lit")],
    ptrs: [{ i: 2, label: "top" }],
    msg: (
      <>
        getMin():直接读<b>栈顶的影子层</b> → −3。不扫描、不比较,纯 O(1)。
      </>
    ),
  },
  {
    cells: [mc(-2, -2), mc(0, -2, "lit"), mc(-3, -3, "ok")],
    ptrs: [{ i: 2, label: "top" }],
    msg: (
      <>
        pop():−3 连同它的影子 min 一起弹走 —— 全栈最小值自动「回滚」到 −2。
        为什么敢这么说?因为下一层冻结的 −2 记录的正是「没有 −3 的世界」的最小值。
      </>
    ),
  },
  {
    cells: [mc(-2, -2), mc(0, -2, "lit")],
    ptrs: [{ i: 1, label: "top" }],
    msg: (
      <>
        top() = 0,getMin() = −2 ✓。循环不变量:<b>任何时刻,栈顶影子层 =
        全栈最小值</b> —— 两个栈同生共死,这个等式就永远成立。
      </>
    ),
  },
];

// LC 739 每日温度:cells = 温度数组;lit = 在栈中等待,ok = 已结算,bad = 等不到
const F739: ArrayFrame[] = [
  {
    cells: [{ v: 73 }, { v: 74 }, { v: 71 }, { v: 69 }, { v: 75 }, { v: 73 }],
    msg: (
      <>
        T = [73,74,71,69,75,73],求每天要等几天才升温。暴力:每天向后扫,O(n²)。
        单调栈:栈里存「还没等到更暖日子」的<b>下标</b>,对应温度自底向上递减。
        亮起 = 在栈中等待,变绿 = 已拿到答案。
      </>
    ),
  },
  {
    cells: [
      { v: 73, state: "lit" },
      { v: 74 },
      { v: 71 },
      { v: 69 },
      { v: 75 },
      { v: 73 },
    ],
    ptrs: [
      { i: 0, label: "i" },
      { i: 0, label: "top" },
    ],
    msg: <>i=0:栈空,73 无人可比,下标 0 入栈等待。栈(底→顶):[0]。</>,
  },
  {
    cells: [
      { v: 73, state: "ok" },
      { v: 74, state: "lit" },
      { v: 71 },
      { v: 69 },
      { v: 75 },
      { v: 73 },
    ],
    ptrs: [
      { i: 1, label: "i" },
      { i: 1, label: "top" },
    ],
    msg: (
      <>
        i=1:74 比栈顶的 73 暖 —— 73 等的答案来了!弹出 0,结算 ans[0] = 1 − 0 =
        <b> 1</b>。然后 1 入栈。<b>弹出的瞬间结算</b>,这是单调栈的心脏。
      </>
    ),
  },
  {
    cells: [
      { v: 73, state: "ok" },
      { v: 74, state: "lit" },
      { v: 71, state: "lit" },
      { v: 69 },
      { v: 75 },
      { v: 73 },
    ],
    ptrs: [
      { i: 2, label: "i" },
      { i: 2, label: "top" },
    ],
    msg: (
      <>
        i=2:71 比栈顶的 74 冷 → 谁也弹不动,入栈等待。栈:[1(74), 2(71)]
        ,自底向上递减 ✓。
      </>
    ),
  },
  {
    cells: [
      { v: 73, state: "ok" },
      { v: 74, state: "lit" },
      { v: 71, state: "lit" },
      { v: 69, state: "lit" },
      { v: 75 },
      { v: 73 },
    ],
    ptrs: [
      { i: 3, label: "i" },
      { i: 3, label: "top" },
    ],
    msg: (
      <>
        i=3:69 更冷,继续入栈。栈:[1, 2, 3] —— 一串「一个比一个矮」的等待者,
        像排队时被高个子挡住的人。
      </>
    ),
  },
  {
    cells: [
      { v: 73, state: "ok" },
      { v: 74, state: "lit" },
      { v: 71, state: "lit" },
      { v: 69, state: "ok" },
      { v: 75 },
      { v: 73 },
    ],
    ptrs: [
      { i: 4, label: "i" },
      { i: 2, label: "top" },
    ],
    msg: (
      <>
        i=4:75 驾到!比栈顶的 69 暖 → 弹 3,ans[3] = 4 − 3 = <b>1</b>。
        还没完 —— 新栈顶 71 也比 75 冷…
      </>
    ),
  },
  {
    cells: [
      { v: 73, state: "ok" },
      { v: 74, state: "lit" },
      { v: 71, state: "ok" },
      { v: 69, state: "ok" },
      { v: 75 },
      { v: 73 },
    ],
    ptrs: [
      { i: 4, label: "i" },
      { i: 1, label: "top" },
    ],
    msg: (
      <>
        继续弹 2,ans[2] = 4 − 2 = <b>2</b>。它等了两天,答案在被弹出的瞬间一次结清
        —— 中途完全不用惦记它。
      </>
    ),
  },
  {
    cells: [
      { v: 73, state: "ok" },
      { v: 74, state: "ok" },
      { v: 71, state: "ok" },
      { v: 69, state: "ok" },
      { v: 75, state: "lit" },
      { v: 73 },
    ],
    ptrs: [
      { i: 4, label: "i" },
      { i: 4, label: "top" },
    ],
    msg: (
      <>
        74 也被弹出:ans[1] = 4 − 1 = <b>3</b>。栈空,4(75)入栈。一个 75
        连续送走三个等待者 —— 代码里的 while 循环干的就是这件事。
      </>
    ),
  },
  {
    cells: [
      { v: 73, state: "ok" },
      { v: 74, state: "ok" },
      { v: 71, state: "ok" },
      { v: 69, state: "ok" },
      { v: 75, state: "lit" },
      { v: 73, state: "lit" },
    ],
    ptrs: [
      { i: 5, label: "i" },
      { i: 5, label: "top" },
    ],
    msg: <>i=5:73 比 75 冷,入栈。栈:[4(75), 5(73)]。</>,
  },
  {
    cells: [
      { v: 73, state: "ok" },
      { v: 74, state: "ok" },
      { v: 71, state: "ok" },
      { v: 69, state: "ok" },
      { v: 75, state: "bad" },
      { v: 73, state: "bad" },
    ],
    msg: (
      <>
        扫描结束:栈里剩下的 4、5 右边再无更暖日,ans 保持 0。答案
        [1,3,2,1,0,0]。每个下标只入栈一次、最多出栈一次 → 总操作 ≤ 2n,
        <b>O(n)</b>。
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
  { id: "patterns", n: "06", label: "套路与单调栈" },
  { id: "problems", n: "07", label: "高频题单" },
  { id: "quiz", n: "08", label: "通关测验" },
];

export default function StackChapter() {
  return (
    <main className="page" data-ch="stack">
      <Hero
        ch="stack"
        title={
          <>
            栈 <span className="grad">Stack</span>
          </>
        }
        essence={
          <>
            一摞盘子:进和出都只发生在<strong>同一端</strong>。它用「只碰栈顶」
            的纪律,换来了对<strong>嵌套与撤销</strong>问题的完美贴合 ——
            后进先出,Last In, First Out。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 直觉 ================= */}
      <Section
        id="intuition"
        index="01"
        title="直觉:一摞盘子,只动最上面"
        desc="先看一类问题,再认识为它而生的结构"
      >
        <div className="prose">
          <p>
            数组和链表给了我们「存一串东西」的通用能力。但回想几个天天在用的功能:
            编辑器里按 <code>Ctrl+Z</code>,撤销的一定是<strong>最近</strong>
            一次修改;浏览器点「后退」,回到的一定是<strong>上一个</strong>页面;
            一个函数调另一个函数,<strong>最后被调用的</strong>那个总是最先结束。
            三件事长得完全不同,骨架却一模一样:
            <strong>最近发生的,最先被处理</strong>。
          </p>
          <p>
            为这类问题,我们把「随便存取」的自由整个扔掉,换一个受限的结构:
            <strong>栈(Stack)</strong>。想象食堂里那摞叠起来的盘子 ——
            洗好的盘子放最上面,取盘子也从最上面拿。最后放上去的,最先被拿走:
            <strong>后进先出,LIFO(Last In, First Out)</strong>。它只立三条规矩:
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">RULE 01</div>
            <div className="card-title">🍽️ 只碰顶端</div>
            <p>
              放(push)、拿(pop)、看(peek)都只作用于<b>栈顶</b>。
              想动中间的盘子?不存在这种操作 —— 先把上面的全拿走。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 02</div>
            <div className="card-title">🔁 后进先出</div>
            <p>
              最后进来的最先出去。这不是限制的副作用,而是<b>目的本身</b>:
              嵌套、撤销、回退,天然就是「最近优先」的顺序。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 03</div>
            <div className="card-title">🧱 一端封死</div>
            <p>
              栈底焊死,不提供从底部或中间进出的任何通道。操作越少,
              每个操作越能做到极致 —— 全部 <b>O(1)</b>。
            </p>
          </div>
        </div>
        <Callout tone="idea" title="受限,反而是承诺">
          <p>
            数据结构不只看「能做什么」,还要看「禁止做什么」。栈禁止访问中间,
            换来的是:每个操作都快、顺序绝不出错、实现极其简单。以后看到
            「最近的先处理」「嵌套配对」「撤销/回退」,脑子里应该第一个亮起
            <b>栈</b>这盏灯。
          </p>
        </Callout>
        <Callout tone="story" title="它无处不在">
          <p>
            编辑器的撤销栈、浏览器的历史栈、JSON/HTML 解析器的标签栈、
            表达式求值、每一门语言运行时的<b>函数调用栈</b>(§03 见)……
            你写的每一行代码,其实都跑在一个栈上。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 内存 ================= */}
      <Section
        id="memory"
        index="02"
        title="内存里的样子:加了纪律的数组或链表"
        desc="栈不是新的存储方式 —— 它是一份「只准动一端」的合同"
      >
        <div className="prose">
          <p>
            打开内存看,栈<strong>没有</strong>自己独特的物理布局:它要么住在
            一个数组里,要么住在一个链表里。「栈」这个词描述的是
            <strong>接口与纪律</strong>(只准从一端进出),而不是存储方式 ——
            这叫<strong>抽象数据类型(ADT,Abstract Data Type)</strong>。
            同一份合同,两种履行方式:
          </p>
        </div>
        <StackMemFig />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            为什么数组实现的栈顶在<strong>尾部</strong>,链表实现的栈顶却在
            <strong>头部</strong>?答案都是同一句话:<strong>选那端不用搬家、
            不用遍历的</strong>。数组尾部追加/删除 O(1)(头部要全体搬家);
            链表头插/头删 O(1)(尾删还得从头找前驱)。结构变了,原则没变。
          </p>
        </div>
        <Callout tone="deep" title="工程视角:两种实现怎么选?">
          <p>
            绝大多数标准库选<b>数组实现</b>:连续内存对 CPU 缓存友好,
            均摊 O(1) 的扩容成本完全可接受(数组章算过总账)。链表实现的优势是
            <b>每次操作的耗时绝对稳定</b>(没有偶发的扩容抖动),
            在实时性敏感的场景(如某些嵌入式/音频系统)才更吃香。Java 的
            ArrayDeque、Python 的 list、JS 的 Array 全是数组路线。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 核心操作 ================= */}
      <Section
        id="ops"
        index="03"
        title="核心操作:四个动作,全部 O(1)"
        desc="操作少而快 —— 每个复杂度都能用「要不要搬动别人」一句话解释"
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
                  <b>push(x)</b> 压栈
                </td>
                <td>把 x 放到栈顶</td>
                <td>
                  <BigO o="1" label="均摊 O(1)" />
                </td>
                <td>写在数组尾部 / 链表头部,谁也不惊动;数组偶尔扩容 → 均摊</td>
              </tr>
              <tr>
                <td>
                  <b>pop()</b> 弹栈
                </td>
                <td>取走并返回栈顶</td>
                <td>
                  <BigO o="1" />
                </td>
                <td>只动最顶端一个元素,尾删 / 头删都免搬家</td>
              </tr>
              <tr>
                <td>
                  <b>peek()</b> 看栈顶
                </td>
                <td>只看不拿</td>
                <td>
                  <BigO o="1" />
                </td>
                <td>读一下尾部 / 头节点,连删都不用</td>
              </tr>
              <tr>
                <td>
                  <b>isEmpty() / size()</b>
                </td>
                <td>判空 / 求大小</td>
                <td>
                  <BigO o="1" />
                </td>
                <td>读一个计数器</td>
              </tr>
              <tr>
                <td>
                  <b>访问 / 查找中间元素</b>
                </td>
                <td>——</td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  栈不提供这种操作!想看就得一路弹出来 —— 需要随机访问请回数组
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>亲手压几个盘子,重点体会两件事:top 怎么移动、空栈 pop 时会发生什么:</p>
        </div>
        <StackLab />
        <Callout tone="warn" title="边界:空栈 pop 是必考题">
          <p>
            对空栈调用 pop / peek,三种语言三种脾气:Java(ArrayDeque)抛{" "}
            <code>NoSuchElementException</code>,Python 抛 <code>IndexError</code>
            ,而 JS 的 <code>[].pop()</code> <b>不报错</b>,静默返回{" "}
            <code>undefined</code> —— 最危险的一种,bug 会潜伏到下游才爆炸。
            所以模板永远是:<b>先判空,再动手</b>(LC 20 里栈空却遇到右括号,
            就该立即返回 false)。
          </p>
        </Callout>

        <div className="prose" style={{ marginTop: 28 }}>
          <p>
            接下来看栈在计算机里最重要的一份工作 ——{" "}
            <strong>调用栈(call stack)</strong>。每调用一个函数,就把一个
            <strong>栈帧(stack frame)</strong>(装着局部变量 + 「执行到哪了」的
            返回地址)压上去;每次 return,就弹掉一帧。逐帧走一遍:
          </p>
        </div>
        <CallStackDemo />
        <Callout tone="deep" title="工程视角:栈区、线程与递归深度">
          <p>
            序章讲过,进程的内存里专门划了一块「栈区」给调用栈,<b>每个线程一条</b>
            ,默认大小通常 1~8 MB(Java 用 <code>-Xss</code> 调,Linux 用{" "}
            <code>ulimit -s</code>)。一个栈帧几十到几百字节,所以递归深度上限
            大致在几万层 —— Python 干脆默认只允许 1000 层。这就是为什么处理
            超深的树/图时,工程代码常把递归改写成「显式栈 + 迭代」(§06 套路三)。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 手写实现 ================= */}
      <Section
        id="impl"
        index="04"
        title="手写实现:动态数组 + 一个栈顶指针"
        desc="核心只有一句话 —— size 既是元素个数,也是栈顶的位置"
      >
        <div className="prose">
          <p>
            用数组章的动态数组亲手造一个栈。你会发现所谓「实现栈」,
            其实就是<strong>把数组的能力锁小</strong>:只暴露尾部操作,
            其余全部藏起来。Java 版连扩容都自己写,Python/JS 的动态数组自带扩容,
            代码更短 —— 但内存里发生的事完全相同:
          </p>
        </div>
        <CodeTabs
          title="array_stack"
          java={{
            code: `import java.util.Arrays;

public class ArrayStack {
    private int[] data = new int[4];   // 底层定长数组(满了会搬家)
    private int size = 0;              // 已存个数 = 下一个空位 = 栈顶指针

    public void push(int x) {
        if (size == data.length) grow();   // 满了先 ×2 扩容(数组章)
        data[size++] = x;                  // 写到尾部,栈顶右移,O(1)
    }

    public int pop() {
        if (isEmpty()) throw new RuntimeException("栈空,不能 pop");
        return data[--size];               // 栈顶左移一格,就算"删除"了
    }

    public int peek() {
        if (isEmpty()) throw new RuntimeException("栈空,不能 peek");
        return data[size - 1];             // 只看不拿
    }

    public boolean isEmpty() { return size == 0; }
    public int size() { return size; }

    private void grow() {                  // 扩容:搬进两倍大的新家
        data = Arrays.copyOf(data, data.length * 2);
    }
}`,
            hl: [8, 9, 13, 14],
            note: (
              <>
                <b>妙处:</b>pop 只是把 size 减一 —— 旧值还躺在数组里,
                但已经在「合同」之外,下次 push 会直接覆盖它。删除 = 假装它不存在。
              </>
            ),
          }}
          python={{
            code: `class ArrayStack:
    """用 list(动态数组)实现的栈 —— 栈顶 = 列表尾部。"""

    def __init__(self):
        self._data = []            # list 自带扩容,不用手写 grow

    def push(self, x):
        self._data.append(x)       # 尾部追加 = 压栈,均摊 O(1)

    def pop(self):
        if self.is_empty():
            raise IndexError("栈空,不能 pop")
        return self._data.pop()    # 尾部弹出 = 出栈,O(1)

    def peek(self):
        if self.is_empty():
            raise IndexError("栈空,不能 peek")
        return self._data[-1]      # 只看不拿

    def is_empty(self):
        return len(self._data) == 0

    def size(self):
        return len(self._data)`,
            hl: [8, 13, 18],
            note: (
              <>
                <b>为什么还要封装?</b>list 本来就能 append/pop,
                但拿到 ArrayStack 的人<b>只能</b> LIFO —— 把能力锁小,
                错误就没地方发生。这是接口设计的第一课。
              </>
            ),
          }}
          js={{
            code: `class ArrayStack {
  #data = [];                    // # 开头 = 真私有字段(ES2022)

  push(x) {
    this.#data.push(x);          // 尾部追加 = 压栈,均摊 O(1)
  }

  pop() {
    if (this.isEmpty()) throw new Error("栈空,不能 pop");
    return this.#data.pop();     // 尾部弹出 = 出栈,O(1)
  }

  peek() {
    if (this.isEmpty()) throw new Error("栈空,不能 peek");
    return this.#data[this.#data.length - 1];  // 只看不拿
  }

  isEmpty() { return this.#data.length === 0; }
  size() { return this.#data.length; }
}`,
            hl: [5, 10, 15],
            note: (
              <>
                <b>注意:</b>这里手动抛错,补上了原生 <code>Array.pop()</code>{" "}
                静默返回 undefined 的坑 —— 封装的另一个价值:把语言的坑挡在门外。
              </>
            ),
          }}
        />
      </Section>

      {/* ================= §05 三语言对照 ================= */}
      <Section
        id="langs"
        index="05"
        title="三语言对照:该用什么当栈"
        desc="Java 有个著名的「不要用」—— 先讲清为什么"
      >
        <div className="prose">
          <p>
            三种语言里栈的抽象完全一致,但「出厂配置」差别很大:Java
            要挑对容器(这里有个经典大坑),Python 和 JS 则直接用自家动态数组就好:
          </p>
        </div>
        <CodeTabs
          title="stack_basics"
          java={{
            code: `import java.util.ArrayDeque;
import java.util.Deque;

// ✅ 首选:ArrayDeque 当栈(官方推荐)
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);                 // 压栈
stack.push(2);
int top = stack.peek();        // 看栈顶 → 2
int x = stack.pop();           // 弹栈 → 2
boolean empty = stack.isEmpty();

// ❌ 不推荐:java.util.Stack(JDK 1.0 历史遗产)
java.util.Stack<Integer> old = new java.util.Stack<>();
old.push(1);                   // 能用,但每个方法都背着同步锁`,
            hl: [5, 13],
            note: (
              <>
                <b>为什么别用 Stack 类:</b>①它继承 Vector,每个方法都{" "}
                <code>synchronized</code>,单线程也要交「锁税」;②作为 Vector
                它暴露 <code>get(i)</code>/<code>insertElementAt</code>
                ,可以随意戳中间,LIFO 纪律形同虚设;③官方文档自己写着:
                栈操作应优先使用 ArrayDeque。
              </>
            ),
          }}
          python={{
            code: `stack = []            # list 直接当栈,零依赖

stack.append(1)       # 压栈(尾部)
stack.append(2)
top = stack[-1]       # 看栈顶 → 2(负下标真好用)
x = stack.pop()       # 弹栈 → 2(不传参数 = 尾部弹出)
empty = not stack     # 判空的 pythonic 写法

# collections.deque 也能当栈(append/pop),
# 但纯栈场景 list 已是最优解,不必换`,
            hl: [3, 6],
            note: (
              <>
                <b>坑:</b>手滑写成 <code>pop(0)</code> 就变成了 O(n)
                的头删(数组章讲过搬家)。栈操作永远不带参数:<code>pop()</code>。
              </>
            ),
          }}
          js={{
            code: `const stack = [];         // Array 直接当栈

stack.push(1);            // 压栈(尾部)
stack.push(2);
const top = stack.at(-1); // 看栈顶 → 2(ES2022;等价 stack[stack.length-1])
const x = stack.pop();    // 弹栈 → 2
const empty = stack.length === 0;`,
            hl: [3, 6],
            note: (
              <>
                <b>坑:</b>空数组 <code>pop()</code> 不报错,静默返回{" "}
                <code>undefined</code>。忘了判空,错误会带着 undefined
                一路旅行到很远的地方才爆炸 —— 动手前先查 <code>length</code>。
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
                <th>Python(list)</th>
                <th>JavaScript(Array)</th>
                <th>复杂度</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>压栈</td>
                <td>
                  <code>stack.push(x)</code>
                </td>
                <td>
                  <code>stack.append(x)</code>
                </td>
                <td>
                  <code>stack.push(x)</code>
                </td>
                <td>
                  <BigO o="1" label="均摊 O(1)" />
                </td>
              </tr>
              <tr>
                <td>弹栈</td>
                <td>
                  <code>stack.pop()</code>
                </td>
                <td>
                  <code>stack.pop()</code>
                </td>
                <td>
                  <code>stack.pop()</code>
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>看栈顶</td>
                <td>
                  <code>stack.peek()</code>
                </td>
                <td>
                  <code>stack[-1]</code>
                </td>
                <td>
                  <code>stack.at(-1)</code>
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>判空</td>
                <td>
                  <code>stack.isEmpty()</code>
                </td>
                <td>
                  <code>not stack</code>
                </td>
                <td>
                  <code>stack.length === 0</code>
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>空栈 pop 的行为</td>
                <td>抛 NoSuchElementException</td>
                <td>抛 IndexError</td>
                <td>
                  <b>静默返回 undefined</b>
                </td>
                <td>——</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ================= §06 套路与精讲 ================= */}
      <Section
        id="patterns"
        index="06"
        title="栈的三大套路 + 单调栈专题"
        desc="LeetCode 栈题几乎全部落进这三个筐 —— 其中单调栈是面试的分水岭"
        badge={
          <span className="chip" data-tone="warn">
            ★ 面试核心
          </span>
        }
      >
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">套路一</div>
            <div className="card-title">🧩 配对 / 嵌套</div>
            <p>
              括号匹配、相邻消除、嵌套解码:凡是「右半边要找<b>最近的</b>左半边」
              ,就把左半边压栈等着。→ LC 20、1047、394、150。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">套路二</div>
            <div className="card-title">📈 找下一个更大 / 更小</div>
            <p>
              「每个元素右边第一个比它大/小的是谁?」→ <b>单调栈</b>,
              把 O(n²) 压成 O(n)。→ LC 739、496、503、84、42。下面专题详讲。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">套路三</div>
            <div className="card-title">🌀 用栈消除递归</div>
            <p>
              递归本来就跑在调用栈上 —— 把系统栈换成自己 new 的显式栈,
              就能把任何递归改成迭代,绕开栈溢出。→ 二叉树迭代遍历(第 7 章)。
            </p>
          </div>
        </div>

        <div className="prose" style={{ marginTop: 28 }}>
          <p>
            <strong>单调栈(monotonic stack)专题</strong>,先给比喻:一群人
            <strong>按到达顺序排队,都在等「身后第一个比自己高的人」</strong>。
            某个矮个子一旦被后来的高个子挡住,对更后面的人来说,他就
            <strong>永远没有出头之日</strong>了 —— 任何后来者想找「前面第一个
            更高的」,越过这个高个子时一定先看到高个子本人,矮个子再也不可能是
            任何人的答案。所以:<strong>他可以被弹掉,并且就在被弹掉的这一刻,
            「弹他的人」正是他等的答案</strong>。三个问题想清楚,单调栈就通了:
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 14 }}>
          <div className="card">
            <div className="card-kicker">问题一</div>
            <div className="card-title">维护什么单调性?</div>
            <p>
              找「下一个更<b>大</b>」→ 栈内自底向上<b>递减</b>
              (一串还没等到答案的矮个子);找「下一个更<b>小</b>」→ 递增。
              反着记就全乱了。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">问题二</div>
            <div className="card-title">什么时候弹栈?</div>
            <p>
              新元素<b>破坏单调性</b>时:递减栈里来了个比栈顶大的,
              就 while 循环连续弹,直到栈顶重新比它大(或栈空),然后自己入栈。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">问题三</div>
            <div className="card-title">弹出时结算什么?</div>
            <p>
              被弹元素的答案就是「弹它的人」:739 结算<b>等待天数</b>
              (下标差),84 结算<b>以它为高的矩形</b>,42 结算<b>一层雨水</b>。
              栈里通常存下标,信息最全。
            </p>
          </div>
        </div>
        <Callout tone="idea" title="为什么是 O(n)?">
          <p>
            代码里 while 套在 for 里,看着像 O(n²)?算总账:每个元素
            <b>恰好入栈一次、最多出栈一次</b>,弹出即永别 —— 全程操作数 ≤ 2n。
            又是均摊分析,和数组扩容那笔账一个算法。
          </p>
        </Callout>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 A</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 20 · 有效的括号
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">
              EASY
            </span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>只含六种括号的字符串,判断是否有效(每个右括号与
            <strong>最近的</strong>同类左括号配对,且嵌套正确)。
            <b> 暴力:</b>反复扫描,把 <code>()</code>、<code>[]</code>、
            <code>{"{}"}</code> 这样的相邻对删掉,直到删无可删 —— 每轮 O(n),
            最多 n/2 轮,O(n²)。<b>正解:</b>「最近的左括号」= 栈顶,
            一遍扫描就够:
          </p>
        </div>
        <ArrayStepper title="LC 20 · 括号匹配,栈横放(右端 = 栈顶)" frames={F20} />
        <CodeTabs
          title="lc20_valid_parentheses"
          java={{
            code: `class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');       // 左括号:压入"期待的右括号"
            else if (c == '[') stack.push(']');
            else if (c == '{') stack.push('}');
            else if (stack.isEmpty() || stack.pop() != c)
                return false;                    // 没人等我,或等错了人
        }
        return stack.isEmpty();                  // 还有左括号没配对 → false
    }
}`,
            hl: [5, 6, 7, 8, 9, 11],
            note: (
              <>
                <b>小技巧:</b>压栈时直接存「期待的右括号」,比对时一个{" "}
                <code>!=</code> 搞定,不用查配对表。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def isValid(self, s: str) -> bool:
        pairs = {')': '(', ']': '[', '}': '{'}
        stack = []
        for c in s:
            if c not in pairs:               # 左括号:入栈等待
                stack.append(c)
            elif not stack or stack.pop() != pairs[c]:
                return False                 # 栈空,或栈顶对不上
        return not stack                     # 栈必须刚好清空`,
            hl: [6, 7, 8, 9, 10],
          }}
          js={{
            code: `var isValid = function (s) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const c of s) {
    if (!(c in pairs)) {
      stack.push(c);                   // 左括号:入栈等待
    } else if (stack.pop() !== pairs[c]) {
      return false;                    // 空栈 pop 得 undefined,天然对不上
    }
  }
  return stack.length === 0;           // 栈必须刚好清空
};`,
            hl: [5, 6, 7, 8],
            note: (
              <>
                <b>细节:</b>这里空栈 pop 返回 undefined 反而帮了忙 ——
                undefined ≠ 任何括号,自动走进 return false。能解释这一点,
                说明你真懂 JS 的 pop。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n)</b>(每字符恰好处理一次),空间 <b>O(n)</b>
            (最坏全是左括号)。追问一:「如果只有一种括号?」——
            一个计数器就够(遇 <code>(</code> 加一、遇 <code>)</code>{" "}
            减一,途中不许为负,结尾必须为零)。追问二:「为什么多种括号
            计数器不行?」—— <code>([)]</code> 每种括号数量都平衡,
            但嵌套交叉了;<b>顺序信息只有栈能记住</b>。
          </p>
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 B</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 155 · 最小栈
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">
              MEDIUM
            </span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>设计一个栈,除了 push/pop/top,还要能 <b>O(1)</b> 返回
            当前最小值 getMin。<b>暴力:</b>getMin 时扫一遍栈,O(n) ——
            题目明说不行。<b>存一个全局 min 变量?</b>push 时更新没问题,
            可一旦最小值被 pop 走,「第二小」是谁?不知道,还得扫。
            <b> 正解:</b>问题出在「历史被丢了」—— 那就用<strong>辅助栈</strong>
            把每一时刻的最小值都存下来,和主栈同进同退:
          </p>
        </div>
        <ArrayStepper title="LC 155 · 辅助栈(格子下半 = 该层冻结的 min)" frames={F155} cellW={64} />
        <CodeTabs
          title="lc155_min_stack"
          java={{
            code: `class MinStack {
    private final Deque<Integer> stack = new ArrayDeque<>(); // 主栈
    private final Deque<Integer> mins  = new ArrayDeque<>(); // 影子栈

    public void push(int val) {
        stack.push(val);
        // 影子层 = min(新值, 之前的最小) —— 入栈瞬间冻结,永不再改
        mins.push(mins.isEmpty() ? val : Math.min(val, mins.peek()));
    }

    public void pop() {
        stack.pop();
        mins.pop();           // 同生共死:min 自动回滚到上一层
    }

    public int top()    { return stack.peek(); }
    public int getMin() { return mins.peek(); }   // O(1)!
}`,
            hl: [7, 8, 13, 17],
          }}
          python={{
            code: `class MinStack:
    def __init__(self):
        self.stack = []       # 主栈
        self.mins = []        # 影子栈:每层冻结"到此为止的最小值"

    def push(self, val: int) -> None:
        self.stack.append(val)
        # 影子层 = min(新值, 之前的最小) —— 入栈瞬间冻结,永不再改
        self.mins.append(val if not self.mins else min(val, self.mins[-1]))

    def pop(self) -> None:
        self.stack.pop()
        self.mins.pop()       # 同生共死:min 自动回滚到上一层

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.mins[-1]  # O(1)!`,
            hl: [8, 9, 13, 19],
          }}
          js={{
            code: `var MinStack = function () {
  this.stack = [];      // 主栈
  this.mins = [];       // 影子栈:每层冻结"到此为止的最小值"
};

MinStack.prototype.push = function (val) {
  this.stack.push(val);
  // 影子层 = min(新值, 之前的最小) —— 入栈瞬间冻结,永不再改
  const m = this.mins.length === 0 ? val : Math.min(val, this.mins.at(-1));
  this.mins.push(m);
};

MinStack.prototype.pop = function () {
  this.stack.pop();
  this.mins.pop();      // 同生共死:min 自动回滚到上一层
};

MinStack.prototype.top = function () { return this.stack.at(-1); };
MinStack.prototype.getMin = function () { return this.mins.at(-1); }; // O(1)!`,
            hl: [8, 9, 10, 15, 19],
          }}
        />
        <Callout tone="deep" title="为什么辅助栈「能」同步维护?">
          <p>
            关键在栈的纪律本身:栈顶被 pop 后,暴露出来的世界<b>恰好就是</b>
            这个元素 push 之前的世界 —— 而影子栈在那一刻冻结的 min
            记录的正是那个世界的最小值。换成允许中间删除的结构(比如数组),
            这套「历史快照」立刻失效。<b>是 LIFO 纪律让历史可以被完整回滚。</b>
            追问:「能省点空间吗?」—— 可以只在新值 ≤ 当前 min 时才压影子栈
            (pop 时相等才弹),或者影子栈存差值,面试加分项。
          </p>
        </Callout>
        <Callout tone="win" title="复杂度">
          <p>
            四个操作全部 <b>O(1)</b>,空间 O(n)(影子栈)。这题教的是通用招式:
            <b>「随历史变化的量,用一个同步的栈把每个时刻都存下来」</b> ——
            很多"设计一个支持 X 的栈"题都是它的变体。
          </p>
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 C</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 739 · 每日温度
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">
              MEDIUM
            </span>
            <span className="chip" data-tone="warn" style={{ marginLeft: 8 }}>
              单调栈代表作
            </span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>给每天的温度,求每天要<strong>等几天</strong>
            才会遇到更高的温度(等不到则为 0)。<b>暴力:</b>每天向后线性扫,
            O(n²) —— n = 10⁵ 时约 10¹⁰ 步,超时。<b>为什么能优化:</b>
            暴力浪费在「反复重扫同一段」:73、71、69 都在等 75,
            75 出现时应该<strong>一次性结算所有等它的人</strong>。
            把「还没等到答案的日子」存进栈(必然一个比一个矮),就是单调栈:
          </p>
        </div>
        <ArrayStepper title="LC 739 · 单调递减栈(亮 = 栈中等待,绿 = 已结算)" frames={F739} />
        <CodeTabs
          title="lc739_daily_temperatures"
          java={{
            code: `class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] ans = new int[n];                 // 默认 0:等不到更暖的
        Deque<Integer> stack = new ArrayDeque<>(); // 存下标,温度自底向上递减
        for (int i = 0; i < n; i++) {
            // 只要我比栈顶暖,栈顶等的答案就是我
            while (!stack.isEmpty()
                   && temperatures[i] > temperatures[stack.peek()]) {
                int j = stack.pop();
                ans[j] = i - j;                 // 弹出的瞬间结算!
            }
            stack.push(i);                      // 我也入栈,等我的答案
        }
        return ans;
    }
}`,
            hl: [8, 9, 10, 11, 13],
          }}
          python={{
            code: `class Solution:
    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:
        n = len(temperatures)
        ans = [0] * n                     # 默认 0:等不到更暖的
        stack = []                        # 存下标,温度自底向上递减
        for i, t in enumerate(temperatures):
            # 只要我比栈顶暖,栈顶等的答案就是我
            while stack and t > temperatures[stack[-1]]:
                j = stack.pop()
                ans[j] = i - j            # 弹出的瞬间结算!
            stack.append(i)               # 我也入栈,等我的答案
        return ans`,
            hl: [8, 9, 10, 11],
          }}
          js={{
            code: `var dailyTemperatures = function (temperatures) {
  const n = temperatures.length;
  const ans = new Array(n).fill(0);   // 默认 0:等不到更暖的
  const stack = [];                   // 存下标,温度自底向上递减
  for (let i = 0; i < n; i++) {
    // 只要我比栈顶暖,栈顶等的答案就是我
    while (stack.length && temperatures[i] > temperatures[stack.at(-1)]) {
      const j = stack.pop();
      ans[j] = i - j;                 // 弹出的瞬间结算!
    }
    stack.push(i);                    // 我也入栈,等我的答案
  }
  return ans;
};`,
            hl: [7, 8, 9, 11],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n)</b>(每个下标进出栈各最多一次,总操作 ≤ 2n),空间
            O(n)。追问一:「为什么栈里存下标不存温度?」——
            结算需要算<b>天数差</b>,下标能推出温度,反之不行。追问二:
            「找上一个更大呢?」—— 同一遍扫描里,元素入栈前的栈顶就是它
            左边第一个更大者,一次遍历双向收获。追问三:「数组是循环的呢?」
            —— 下标跑 2n 圈用 i % n(LC 503,题单见)。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title="高频题单:栈 10 题"
        desc="配对消除 → 表达式 → 单调栈,由易到难。先想 30 秒再看提示"
        badge={<span className="chip">Hot 100 精选</span>}
      >
        <ProblemSet ch="stack" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="7 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="stack" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            栈 = <b>只开一个口的容器</b>:push/pop/peek 全 O(1)。数组实现栈顶在
            <b>尾</b>、链表实现栈顶在<b>头</b> —— 都是选「不用搬家」的那端。
          </>,
          <>
            「<b>最近的先处理</b>」是栈的信号:撤销、后退、括号配对、嵌套解码、
            函数调用 —— 嵌套结构天然对应 LIFO。
          </>,
          <>
            <b>调用栈</b>:每次调用压一帧、每次 return 弹一帧;递归 = 自己压自己,
            太深就是 StackOverflow —— 显式栈 + 迭代是逃生通道。
          </>,
          <>
            单调栈口诀:找下一个更大 → 维护<b>递减</b>栈;新元素破坏单调性时弹栈,
            <b>弹出的瞬间结算答案</b>;每个元素进出各最多一次 → 均摊 O(n)。
          </>,
          <>
            选型:Java 用 <code>ArrayDeque</code>(<b>别用 Stack 类</b>
            :继承 Vector + 同步锁),Python 用 <code>list</code>,JS 用{" "}
            <code>Array</code> —— 但记住 JS 空栈 pop 静默返回 undefined。
          </>,
        ]}
      />

      <ChapterFooter ch="stack" />
    </main>
  );
}
