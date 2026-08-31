"use client";

// Chapter 4 · Stacks — the ten-part format:
// intuition (LIFO) → memory (array-backed stack / linked stack) → core operations (StackLab + the call stack) →
// hand-written implementation → three-language comparison (why not to use java.util.Stack) →
// three recurring patterns + a focused section on monotonic stacks + three walkthroughs
// (LC 20 / 155 / 739, frame-by-frame) → problem set → quiz → key points.
//
// Bilingual: every learner-facing string goes through <T en zh> or { en, zh }; English is the default.
// Code blocks pass code as { en, zh } — the two versions are line-for-line equivalent and differ only
// in their comments, so the hl line numbers apply to both.

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
import { T } from "@/lib/i18n";
import { StackMemFig, StackLab, CallStackDemo } from "./viz";

/* ================= Walkthrough animation frames ================= */

// LC 20 Valid Parentheses: the stack is drawn as a row of cells (index = height above the bottom),
// and the top pointer marks the top of the stack
const F20: ArrayFrame[] = [
  {
    cells: [],
    msg: (
      <T
        en={
          <>
            Input s = {'"([{}])"'}. The rule: a closing bracket must match the{" "}
            <b>most recent</b> opening bracket that is still unmatched. &ldquo;
            Most recent&rdquo; is exactly what a stack gives you, so the stack
            holds the opening brackets that are still waiting for a partner. It
            is drawn lying on its side below, with the top at the right end.
          </>
        }
        zh={
          <>
            输入 s = {'"([{}])"'}。规则:每个右括号必须与<b>最近的</b>
            那个尚未配对的左括号成对 —— 「最近的」正是栈能 O(1) 给你的东西。
            栈里存的就是「还没等到另一半的左括号」;下面把栈横过来画,右端是栈顶。
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: "(", state: "lit" }],
    ptrs: [{ i: 0, label: "top" }],
    msg: (
      <T
        en={
          <>
            Read {"'('"}. An opening bracket is always pushed, and it waits for
            its partner.
          </>
        }
        zh={<>读到 {"'('"}:左括号一律入栈,排队等它的另一半。</>}
      />
    ),
  },
  {
    cells: [{ v: "(" }, { v: "[", state: "lit" }],
    ptrs: [{ i: 1, label: "top" }],
    msg: (
      <T
        en={
          <>
            Read {"'['"} and push it. It now sits above {"'('"}, which means{" "}
            {"'['"} must be closed <b>first</b> and {"'('"} has to wait. The
            stack records the nesting order without any extra code.
          </>
        }
        zh={
          <>
            读到 {"'['"}:入栈。它压在 {"'('"} 上面 —— 意味着 {"'['"} 必须<b>先</b>
            被配对,{"'('"} 只能等它。嵌套顺序被栈自动记住了,不需要额外代码。
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: "(" }, { v: "[" }, { v: "{", state: "lit" }],
    ptrs: [{ i: 2, label: "top" }],
    msg: (
      <T
        en={
          <>
            Read {"'{'"} and push it. Three levels of nesting means three
            brackets waiting, and from bottom to top they are in the order they
            were opened.
          </>
        }
        zh={
          <>
            读到 {"'{'"}:入栈。三层嵌套 = 栈里三个等待者,自底向上正好是它们被打开的顺序。
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: "(" }, { v: "[" }, { v: "{", state: "ok" }],
    ptrs: [{ i: 2, label: "top" }],
    msg: (
      <T
        en={
          <>
            Read {"'}'"}. A closing bracket is <b>not</b> pushed. It is compared
            with the top: the top is {"'{'"}, the matching opening bracket, so
            pop it. This pair is complete.
          </>
        }
        zh={
          <>
            读到 {"'}'"}:右括号<b>不入栈</b>,而是先跟栈顶比对 —— 栈顶是 {"'{'"}
            ,正是它要的左括号,弹出栈顶,这一对完成。
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: "(" }, { v: "[", state: "ok" }],
    ptrs: [{ i: 1, label: "top" }],
    msg: (
      <T
        en={
          <>
            Read {"']'"}. {"'{'"} is gone, so the top is now {"'['"}. It
            matches, so pop it. Every closing bracket meets the most recent
            unmatched opening bracket, which is why LIFO fits nesting.
          </>
        }
        zh={
          <>
            读到 {"']'"}:{"'{'"} 已经走了,新栈顶是 {"'['"},正好配对,弹出。
            每个右括号遇到的都是「最近的未配对左括号」—— 这就是 LIFO 与嵌套的咬合点。
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: "(", state: "ok" }],
    ptrs: [{ i: 0, label: "top" }],
    msg: (
      <T
        en={
          <>
            Read {"')'"}. The top is {"'('"} and it matches, so pop it.
          </>
        }
        zh={<>读到 {"')'"}:栈顶是 {"'('"},配对成功,弹出。</>}
      />
    ),
  },
  {
    cells: [],
    msg: (
      <T
        en={
          <>
            The scan is finished and the stack is empty, so the answer is{" "}
            <b>true</b>. Three ways to fail: the top does not match the closing
            bracket (in {'"(]"'} the top is {"'('"} when {"']'"} arrives); a
            closing bracket arrives while the stack is empty; or the stack is
            not empty at the end (in {'"(("'} two opening brackets never get a
            partner).
          </>
        }
        zh={
          <>
            扫描结束,栈空 → <b>true</b>。三种失败:①栈顶与右括号对不上(如{" "}
            {'"(]"'},栈顶是 {"'('"} 却来了 {"']'"});②栈已空却又来了右括号;
            ③扫完栈非空(如 {'"(("'},有人永远等不到另一半)。
          </>
        }
      />
    ),
  },
];

// LC 155 Min Stack: each cell = the main stack's value + the min frozen in the helper stack
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
      <T
        en={
          <>
            Goal: push, pop, top, and getMin must <b>all</b> be O(1). One way:
            keep a second stack beside the main one. Each of its levels stores
            the smallest value in the stack <b>as of that push</b>. Both are
            drawn in a single cell here: the value on top, the stored minimum
            below. The price is O(n) extra space.
          </>
        }
        zh={
          <>
            目标:push / pop / top / getMin <b>全部 O(1)</b>。做法:主栈旁边再放一个辅助栈,
            每一层记录「push 这一层时,栈内的最小值」。下面把两者画进同一个格子:
            上 = 值,下 = 该层记下的 min。代价是 O(n) 额外空间。
          </>
        }
      />
    ),
  },
  {
    cells: [mc(-2, -2, "lit")],
    ptrs: [{ i: 0, label: "top" }],
    msg: (
      <T
        en={
          <>
            push(−2). The minimum stored for this level is −2, because −2 is the
            only element.
          </>
        }
        zh={<>push(−2):这一层记下的 min 是 −2 —— 它是目前唯一的元素。</>}
      />
    ),
  },
  {
    cells: [mc(-2, -2), mc(0, -2, "lit")],
    ptrs: [{ i: 1, label: "top" }],
    msg: (
      <T
        en={
          <>
            push(0). The minimum for this level is min(0, −2) = <b>−2</b>. Note
            what is stored: not the value 0, but the smallest value in the whole
            stack up to and including this level.
          </>
        }
        zh={
          <>
            push(0):这一层的 min = min(0, −2) = <b>−2</b>。注意存的是什么:
            不是 0 本身,而是「包含这一层在内、整段栈的最小值」。
          </>
        }
      />
    ),
  },
  {
    cells: [mc(-2, -2), mc(0, -2), mc(-3, -3, "lit")],
    ptrs: [{ i: 2, label: "top" }],
    msg: (
      <T
        en={
          <>
            push(−3). The stored minimum becomes −3. Each level&rsquo;s minimum
            is fixed <b>at the moment of the push</b> and never changes again.
            That is what makes the design work.
          </>
        }
        zh={
          <>
            push(−3):min 更新为 −3。每一层的 min 在<b>入栈那一刻就定下来</b>
            ,之后永不改变 —— 这是整个设计成立的关键。
          </>
        }
      />
    ),
  },
  {
    cells: [mc(-2, -2), mc(0, -2), mc(-3, -3, "lit")],
    ptrs: [{ i: 2, label: "top" }],
    msg: (
      <T
        en={
          <>
            getMin() reads the minimum stored on the <b>top level</b>: −3. No
            scan and no comparison, so it is O(1).
          </>
        }
        zh={
          <>
            getMin():直接读<b>栈顶那一层</b>存的 min → −3。不扫描、不比较,O(1)。
          </>
        }
      />
    ),
  },
  {
    cells: [mc(-2, -2), mc(0, -2, "lit"), mc(-3, -3, "ok")],
    ptrs: [{ i: 2, label: "top" }],
    msg: (
      <T
        en={
          <>
            pop(). −3 leaves together with the minimum stored beside it. The
            minimum of the whole stack returns to −2 on its own, because the
            level below stored the minimum of the stack as it was{" "}
            <b>before −3 was pushed</b>.
          </>
        }
        zh={
          <>
            pop():−3 连同它那一层的 min 一起弹走,全栈最小值自动回到 −2。
            为什么可以这样?因为下面那一层记的,正是「−3 入栈之前」那个栈的最小值。
          </>
        }
      />
    ),
  },
  {
    cells: [mc(-2, -2), mc(0, -2, "lit")],
    ptrs: [{ i: 1, label: "top" }],
    msg: (
      <T
        en={
          <>
            top() = 0 and getMin() = −2. The invariant: <b>at any moment, the
            minimum stored on the top level is the minimum of the whole stack</b>
            . It holds as long as the two stacks are pushed and popped together.
          </>
        }
        zh={
          <>
            top() = 0,getMin() = −2 ✓。不变量:<b>任何时刻,栈顶那一层存的 min
            就是全栈最小值</b> —— 只要两个栈永远同进同出,这个等式就一直成立。
          </>
        }
      />
    ),
  },
];

// LC 739 Daily Temperatures: cells = the temperature array; lit = waiting in the stack,
// ok = answered, bad = no warmer day ever comes
const F739: ArrayFrame[] = [
  {
    cells: [{ v: 73 }, { v: 74 }, { v: 71 }, { v: 69 }, { v: 75 }, { v: 73 }],
    msg: (
      <T
        en={
          <>
            T = [73,74,71,69,75,73]. For each day, how many days until a warmer
            one? Brute force scans forward from every day: O(n²). The monotonic
            stack holds the <b>indices</b> of the days whose answer is still
            unknown, and their temperatures never increase from bottom to top. A
            highlighted cell is waiting in the stack; green means its answer is
            settled.
          </>
        }
        zh={
          <>
            T = [73,74,71,69,75,73],求每天还要等几天才升温。暴力做法是每天向后扫,O(n²)。
            单调栈里存的是「答案还未确定」的<b>下标</b>,它们的温度自底向上不递增。
            亮起 = 正在栈中等待,变绿 = 答案已结算。
          </>
        }
      />
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
    msg: (
      <T
        en={
          <>
            i = 0. The stack is empty, so there is nothing to compare with. Push
            index 0 and let it wait. Stack (bottom to top): [0].
          </>
        }
        zh={<>i=0:栈空,没有可比较的对象,下标 0 入栈等待。栈(底→顶):[0]。</>}
      />
    ),
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
      <T
        en={
          <>
            i = 1. 74 is warmer than the 73 on top, so the answer day 0 was
            waiting for has arrived. Pop 0 and set ans[0] = 1 − 0 = <b>1</b>.
            Then push 1. <b>The answer is settled at the moment of the pop</b>,
            which is the core of the technique.
          </>
        }
        zh={
          <>
            i=1:74 比栈顶的 73 暖 —— 下标 0 等的答案到了。弹出 0,结算 ans[0] = 1 − 0 =
            <b> 1</b>,然后 1 入栈。<b>弹出的瞬间结算</b>,这是单调栈的核心。
          </>
        }
      />
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
      <T
        en={
          <>
            i = 2. 71 is colder than the 74 on top, so nothing is popped. Push
            2. Stack: [1 (74), 2 (71)], still non-increasing from bottom to top.
          </>
        }
        zh={
          <>
            i=2:71 比栈顶的 74 冷,弹不动任何人,入栈等待。栈:[1(74), 2(71)]
            ,自底向上仍然不递增 ✓。
          </>
        }
      />
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
      <T
        en={
          <>
            i = 3. 69 is colder again, so push 3. Stack: [1, 2, 3]. Every
            waiting day is colder than the one below it, which is the invariant
            the stack keeps.
          </>
        }
        zh={
          <>
            i=3:69 更冷,继续入栈。栈:[1, 2, 3] —— 每个等待者都比它下面那个冷,
            这就是栈维持的不变量。
          </>
        }
      />
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
      <T
        en={
          <>
            i = 4. 75 is warmer than the 69 on top, so pop 3 and set ans[3] = 4
            − 3 = <b>1</b>. The new top is 71, still colder than 75, so the loop
            continues.
          </>
        }
        zh={
          <>
            i=4:75 比栈顶的 69 暖 → 弹出 3,ans[3] = 4 − 3 = <b>1</b>。
            新栈顶 71 仍然比 75 冷,循环继续。
          </>
        }
      />
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
      <T
        en={
          <>
            Pop 2 as well: ans[2] = 4 − 2 = <b>2</b>. Day 2 waited for two days,
            and the whole wait is computed in one subtraction when it is popped.
            Nothing had to be remembered about it in between.
          </>
        }
        zh={
          <>
            继续弹出 2:ans[2] = 4 − 2 = <b>2</b>。它等了两天,而这两天是在被弹出时
            用一次减法算出来的 —— 中途完全不用记着它。
          </>
        }
      />
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
      <T
        en={
          <>
            74 is popped too: ans[1] = 4 − 1 = <b>3</b>. The stack is now empty,
            so index 4 (75) is pushed. One warm day settled three waiting days,
            and that is what the while loop does.
          </>
        }
        zh={
          <>
            74 也被弹出:ans[1] = 4 − 1 = <b>3</b>。栈空了,下标 4(75)入栈。
            一个 75 一次性送走三个等待者 —— 代码里那个 while 循环做的就是这件事。
          </>
        }
      />
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
    msg: (
      <T
        en={
          <>
            i = 5. 73 is colder than 75, so push 5. Stack: [4 (75), 5 (73)].
          </>
        }
        zh={<>i=5:73 比 75 冷,入栈。栈:[4(75), 5(73)]。</>}
      />
    ),
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
      <T
        en={
          <>
            The scan is over. Indices 4 and 5 are still in the stack: no warmer
            day appears to their right, so their answers stay 0. Result:
            [1,3,2,1,0,0]. Each index is pushed exactly once and popped at most
            once, so the whole scan performs at most 2n stack operations:{" "}
            <b>O(n)</b>.
          </>
        }
        zh={
          <>
            扫描结束:栈里剩下的 4、5 右边再没有更暖的日子,答案保持 0。结果
            [1,3,2,1,0,0]。每个下标恰好入栈一次、最多出栈一次,
            全程栈操作不超过 2n → <b>O(n)</b>。
          </>
        }
      />
    ),
  },
];

/* ================= Page ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: { en: "Intuition", zh: "直觉" } },
  { id: "memory", n: "02", label: { en: "In memory", zh: "内存里的样子" } },
  { id: "ops", n: "03", label: { en: "Core operations", zh: "核心操作" } },
  { id: "impl", n: "04", label: { en: "Build one", zh: "手写实现" } },
  { id: "langs", n: "05", label: { en: "Three languages", zh: "三语言对照" } },
  {
    id: "patterns",
    n: "06",
    label: { en: "Patterns and monotonic stacks", zh: "套路与单调栈" },
  },
  { id: "problems", n: "07", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "08", label: { en: "Quiz", zh: "通关测验" } },
];

export default function StackChapter() {
  return (
    <main className="page" data-ch="stack">
      <Hero
        ch="stack"
        title={{
          en: (
            <>
              The <span className="grad">Stack</span>
            </>
          ),
          zh: (
            <>
              栈 <span className="grad">Stack</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A pile of plates: adding and removing both happen at{" "}
              <strong>one end</strong>, the top. So the element you remove is
              always the one you added most recently. That single rule, last in
              first out, is what makes a stack fit{" "}
              <strong>nesting, undo, and function calls</strong>.
            </>
          ),
          zh: (
            <>
              一摞盘子:放和拿都发生在<strong>同一端</strong>(栈顶),
              所以取走的永远是最后放进去的那个。就这一条规则 —— 后进先出,
              Last In, First Out —— 让它天然贴合<strong>嵌套、撤销与函数调用</strong>。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 Intuition ================= */}
      <Section
        id="intuition"
        index="01"
        title={{
          en: "Intuition: a pile of plates, and only the top moves",
          zh: "直觉:一摞盘子,只动最上面",
        }}
        desc={{
          en: "First a group of problems, then the structure built for them.",
          zh: "先看一类问题,再认识为它而生的结构",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Arrays and linked lists give you a general way to store a
                  sequence of items. Now look at three features you use every
                  day. In an editor, <code>Ctrl+Z</code> undoes the{" "}
                  <strong>most recent</strong> change. In a browser, Back
                  returns to the <strong>previous</strong> page. When one
                  function calls another, the function called{" "}
                  <strong>last</strong> is the first one to finish. The three
                  look different, but they share one shape:{" "}
                  <strong>what happened most recently is handled first</strong>.
                </p>
                <p>
                  For this kind of problem you give up free access to any
                  position and take a restricted structure instead: the{" "}
                  <strong>stack</strong>. Think of a pile of plates. A clean
                  plate goes on top, and the plate you take is the one on top,
                  so the plate placed last is taken first. The mechanism is
                  exactly that: additions and removals happen at the same end,
                  so the element removed is always the most recent one added.
                  The name for the rule is{" "}
                  <strong>LIFO, last in, first out</strong>. A stack sets only
                  three rules:
                </p>
              </>
            }
            zh={
              <>
                <p>
                  数组和链表给了我们「存一串东西」的通用能力。但回想几个天天在用的功能:
                  编辑器里按 <code>Ctrl+Z</code>,撤销的一定是<strong>最近</strong>
                  一次修改;浏览器点「后退」,回到的一定是<strong>上一个</strong>页面;
                  一个函数调另一个函数,<strong>最后被调用的</strong>那个总是最先结束。
                  三件事长得完全不同,骨架却一模一样:
                  <strong>最近发生的,最先被处理</strong>。
                </p>
                <p>
                  为这类问题,我们把「随便存取」的自由整个交出去,换一个受限的结构:
                  <strong>栈(Stack)</strong>。想象食堂里那摞叠起来的盘子:
                  洗好的盘子放最上面,取盘子也从最上面拿,于是最后放上去的最先被拿走。
                  机制就是这一句:放入和取出发生在同一端,所以取走的永远是最后放进去的那个。
                  这条规则叫 <strong>LIFO(Last In, First Out,后进先出)</strong>。
                  栈只立三条规矩:
                </p>
              </>
            }
          />
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">RULE 01</div>
            <div className="card-title">
              <T en="Only the top" zh="只碰顶端" />
            </div>
            <T
              en={
                <p>
                  push (add), pop (remove), and peek (look) all act on the{" "}
                  <b>top</b>. There is no operation for reaching an element in
                  the middle. To get to one, you first remove everything above
                  it.
                </p>
              }
              zh={
                <p>
                  放(push)、拿(pop)、看(peek)都只作用于<b>栈顶</b>。
                  栈不提供「动中间那一个」的操作 —— 想拿到它,得先把上面的全拿走。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 02</div>
            <div className="card-title">
              <T en="Last in, first out" zh="后进先出" />
            </div>
            <T
              en={
                <p>
                  The element added last is removed first. This is not a side
                  effect of the restriction, it is <b>the purpose</b>. Nesting,
                  undo, and going back are all &ldquo;most recent first&rdquo;
                  orders.
                </p>
              }
              zh={
                <p>
                  最后进来的最先出去。这不是限制的副作用,而是<b>目的本身</b>:
                  嵌套、撤销、回退,本来就是「最近优先」的顺序。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 03</div>
            <div className="card-title">
              <T en="One end is closed" zh="一端封死" />
            </div>
            <T
              en={
                <p>
                  Nothing enters or leaves at the bottom or in the middle. With
                  so few operations, each one can be made cheap: pop, peek,
                  isEmpty, and size are <b>O(1)</b>, and push is{" "}
                  <b>O(1) amortized</b> when an array backs the stack.
                </p>
              }
              zh={
                <p>
                  栈底焊死,不提供从底部或中间进出的通道。操作少,每个操作才能做到极致:
                  pop / peek / isEmpty / size 都是 <b>O(1)</b>,数组实现的 push 是
                  <b>均摊 O(1)</b>。
                </p>
              }
            />
          </div>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "What the restriction buys you",
            zh: "受限,换回来的是什么",
          }}
        >
          <T
            en={
              <p>
                A data structure is defined as much by what it forbids as by
                what it allows. A stack forbids access to the middle, and in
                return every operation is cheap, the order can never come out
                wrong, and the implementation is short. When you read &ldquo;the
                most recent one first&rdquo;, &ldquo;matching nested
                pairs&rdquo;, or &ldquo;undo and go back&rdquo;, the first
                structure to consider is a <b>stack</b>.
              </p>
            }
            zh={
              <p>
                数据结构不只看「能做什么」,也看「禁止做什么」。栈禁止访问中间,
                换回来的是:每个操作都快、顺序绝不出错、实现极其简单。以后看到
                「最近的先处理」「嵌套配对」「撤销 / 回退」,第一个该想到的就是
                <b>栈</b>。
              </p>
            }
          />
        </Callout>
        <Callout
          tone="story"
          title={{ en: "Stacks are everywhere", zh: "它无处不在" }}
        >
          <T
            en={
              <p>
                The undo stack in an editor, the history stack in a browser, the
                tag stack in a JSON or HTML parser, expression evaluation, and
                the <b>function call stack</b> of every language runtime (§03).
                Every line of code you write runs on top of a call stack.
              </p>
            }
            zh={
              <p>
                编辑器的撤销栈、浏览器的历史栈、JSON / HTML 解析器的标签栈、
                表达式求值,以及每一门语言运行时的<b>函数调用栈</b>(§03 会讲)……
                你写的每一行代码,其实都跑在一个栈上。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §02 Memory ================= */}
      <Section
        id="memory"
        index="02"
        title={{
          en: "In memory: an array or a linked list with a rule attached",
          zh: "内存里的样子:加了纪律的数组或链表",
        }}
        desc={{
          en: "A stack is not a new way to store data. It is a contract that only one end may be touched.",
          zh: "栈不是新的存储方式 —— 它是一份「只准动一端」的合同",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                Look at memory and a stack has <strong>no</strong> layout of its
                own: it lives either in an array or in a linked list. The word
                &ldquo;stack&rdquo; describes the{" "}
                <strong>interface and the rule</strong> (you may only add and
                remove at one end), not the storage. A structure defined by its
                operations rather than by its storage is called an{" "}
                <strong>abstract data type (ADT)</strong>. Here is the same
                contract, kept in two ways:
              </p>
            }
            zh={
              <p>
                打开内存看,栈<strong>没有</strong>自己独特的物理布局:它要么住在
                一个数组里,要么住在一个链表里。「栈」这个词描述的是
                <strong>接口与纪律</strong>(只准从一端进出),而不是存储方式 ——
                这叫<strong>抽象数据类型(ADT,Abstract Data Type)</strong>。
                同一份合同,两种履行方式:
              </p>
            }
          />
        </div>
        <StackMemFig />
        <div className="prose" style={{ marginTop: 16 }}>
          <T
            en={
              <p>
                Why is the top at the <strong>end</strong> of the array but at
                the <strong>head</strong> of the linked list? The same reason in
                both cases:{" "}
                <strong>
                  pick the end where nothing has to move and nothing has to be
                  searched for
                </strong>
                . In an array, appending and deleting at the end is O(1), while
                at the front every element would shift. In a linked list,
                inserting and deleting at the head is O(1), while removing the
                last node means walking the list to find the node before it. The
                structure changes, the principle does not.
              </p>
            }
            zh={
              <p>
                为什么数组实现的栈顶在<strong>尾部</strong>,链表实现的栈顶却在
                <strong>头部</strong>?两次的答案是同一句:
                <strong>选那端不用搬家、也不用遍历的</strong>。
                数组尾部追加 / 删除是 O(1),放在头部则每次都要全体搬家;
                链表头插 / 头删是 O(1),删尾节点还得从头找到它的前驱。
                结构变了,原则没变。
              </p>
            }
          />
        </div>
        <Callout
          tone="deep"
          title={{
            en: "Which implementation should you choose?",
            zh: "工程视角:两种实现怎么选?",
          }}
        >
          <T
            en={
              <p>
                Most standard libraries use the <b>array</b> version. Contiguous
                memory suits the CPU cache, and the cost of growing is
                acceptable: one resize copies n elements, but the capacity grows
                in proportion to the size, so the cost spread over all the
                pushes is constant. That is why an array-backed push is{" "}
                <b>O(1) amortized</b> and not O(1) in the worst case. The
                linked-list version is the opposite: push is O(1) even in the
                worst case, with no resize pause, but every push allocates a
                node, every node carries an extra <code>next</code> pointer, and
                the nodes are scattered on the heap, so access is less
                cache-friendly. The steady per-operation cost matters in
                real-time code, such as some embedded or audio systems. Java{" "}
                <code>ArrayDeque</code>, Python <code>list</code>, and JavaScript{" "}
                <code>Array</code> all take the array route.
              </p>
            }
            zh={
              <p>
                绝大多数标准库选<b>数组实现</b>:连续内存对 CPU 缓存友好,
                扩容的成本也可以接受 —— 单次扩容要复制 n 个元素,
                但容量是按当前规模成比例增长的,摊到每次 push 上是常数。
                所以数组实现的 push 是<b>均摊 O(1)</b>,而不是最坏情况 O(1)。
                链表实现正相反:push 最坏情况也是 O(1),不会有扩容抖动;
                代价是每次 push 都要分配一个节点,每个节点多背一个{" "}
                <code>next</code> 指针,而且节点散落在堆上,访问不如数组缓存友好。
                「每次操作耗时稳定」这一点在实时性敏感的场景(某些嵌入式 / 音频系统)
                才更重要。Java 的 <code>ArrayDeque</code>、Python 的{" "}
                <code>list</code>、JS 的 <code>Array</code> 全是数组路线。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §03 Core operations ================= */}
      <Section
        id="ops"
        index="03"
        title={{
          en: "Core operations: four actions, and what each one costs",
          zh: "核心操作:四个动作,各自的成本",
        }}
        desc={{
          en: "Every cost answers one question: do other elements have to move?",
          zh: "所有成本都来自一个问题 —— 要不要搬动别人?",
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
                  <b>push(x)</b>
                </td>
                <td>
                  <T en="Put x on the top" zh="把 x 放到栈顶" />
                </td>
                <td>
                  <BigO
                    o="1"
                    label={{ en: "O(1) amortized", zh: "均摊 O(1)" }}
                  />
                </td>
                <td>
                  <T
                    en="Writes at the end of the array or at the head of the list, moving nothing. An array-backed stack occasionally resizes and copies n elements, so the cost is amortized."
                    zh="写在数组尾部 / 链表头部,谁也不惊动;数组实现偶尔要扩容复制 n 个元素,所以是均摊"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>pop()</b>
                </td>
                <td>
                  <T en="Remove and return the top" zh="取走并返回栈顶" />
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en="Touches one element. Deleting at the end of an array or at the head of a list moves nothing."
                    zh="只动最顶端那一个,尾删 / 头删都不用搬家"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>peek()</b>
                </td>
                <td>
                  <T en="Look at the top without removing it" zh="只看不拿" />
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en="Reads the last slot or the head node. Nothing is even removed."
                    zh="读一下尾部 / 头节点,连删都不用"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>isEmpty() / size()</b>
                </td>
                <td>
                  <T en="Empty test, element count" zh="判空 / 求大小" />
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T en="Reads a counter." zh="读一个计数器" />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T
                      en="Read or search an element in the middle"
                      zh="访问 / 查找中间元素"
                    />
                  </b>
                </td>
                <td>——</td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <T
                    en="A stack does not offer this. You would have to pop everything above it. If you need random access, use an array."
                    zh="栈不提供这种操作,想看就得一路弹到那里 —— 需要随机访问请回数组"
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
                Push a few plates yourself. Watch two things: how the top moves,
                and what happens when you pop an empty stack.
              </p>
            }
            zh={
              <p>
                亲手压几个盘子,重点体会两件事:top 怎么移动、对空栈 pop 时会发生什么。
              </p>
            }
          />
        </div>
        <StackLab />
        <Callout
          tone="warn"
          title={{
            en: "Edge case: popping an empty stack",
            zh: "边界:空栈 pop 是必考题",
          }}
        >
          <T
            en={
              <p>
                Calling pop or peek on an empty stack behaves differently in
                each language. Java <code>ArrayDeque</code> throws{" "}
                <code>NoSuchElementException</code>. Python raises{" "}
                <code>IndexError</code>. JavaScript <code>[].pop()</code>{" "}
                <b>does not fail</b>; it returns <code>undefined</code>. The
                silent one is the most dangerous, because the error surfaces far
                from where it started. So the template is always:{" "}
                <b>check for empty, then touch the top</b>. LC 20 is a direct
                example: if a closing bracket arrives while the stack is empty,
                you can return false immediately.
              </p>
            }
            zh={
              <p>
                对空栈调用 pop / peek,三种语言三种脾气:Java 的{" "}
                <code>ArrayDeque</code> 抛 <code>NoSuchElementException</code>
                ,Python 抛 <code>IndexError</code>,而 JS 的{" "}
                <code>[].pop()</code> <b>不报错</b>,直接返回{" "}
                <code>undefined</code> —— 静默的那个最危险,错误会跑到很远的地方才暴露。
                所以模板永远是:<b>先判空,再动手</b>。LC 20 就是直接的例子:
                栈空却遇到右括号,可以立刻返回 false。
              </p>
            }
          />
        </Callout>

        <div className="prose" style={{ marginTop: 28 }}>
          <T
            en={
              <p>
                Now look at the most important job a stack does inside a
                computer: the <strong>call stack</strong>. Every function call
                pushes one <strong>stack frame</strong>. A frame holds the
                parameters, the local variables, and the{" "}
                <strong>return address</strong>, which is the point in the
                caller where execution continues. Every <code>return</code> pops
                one frame. Step through it:
              </p>
            }
            zh={
              <p>
                接下来看栈在计算机里最重要的一份工作 ——{" "}
                <strong>调用栈(call stack)</strong>。每调用一个函数,就压入一个
                <strong>栈帧(stack frame)</strong>:帧里装着参数、局部变量,
                以及<strong>返回地址</strong>(调用方从哪一行继续执行)。
                每次 <code>return</code> 弹掉一帧。逐帧走一遍:
              </p>
            }
          />
        </div>
        <CallStackDemo />
        <Callout
          tone="deep"
          title={{
            en: "The stack region, threads, and recursion depth",
            zh: "工程视角:栈区、线程与递归深度",
          }}
        >
          <T
            en={
              <p>
                As the introduction chapter described, a process reserves a
                region of memory for the call stack, <b>one per thread</b>,
                usually 1 to 8 MB by default (Java: <code>-Xss</code>, Linux:{" "}
                <code>ulimit -s</code>). One frame takes tens to a few hundred
                bytes, so the depth limit is roughly tens of thousands of calls.
                Python sets its own limit and stops at 1000 recursive calls by
                default. This is why code that walks very deep trees or graphs
                often rewrites the recursion as a loop with an{" "}
                <b>explicit stack</b> (pattern three in §06). Any recursion can
                be rewritten that way, although the result is not always as easy
                to read.
              </p>
            }
            zh={
              <p>
                序章讲过,进程的内存里专门划了一块「栈区」给调用栈,<b>每个线程一条</b>
                ,默认大小通常 1~8 MB(Java 用 <code>-Xss</code> 调,Linux 用{" "}
                <code>ulimit -s</code>)。一个栈帧几十到几百字节,所以递归深度上限
                大致在几万层;Python 干脆自己设限,默认只允许 1000 层。
                这就是为什么处理超深的树 / 图时,工程代码常把递归改写成
                <b>显式栈 + 迭代</b>(§06 套路三)。任何递归都能这样改写,
                只是改完不一定更好读。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §04 Building it from scratch ================= */}
      <Section
        id="impl"
        index="04"
        title={{
          en: "Build one: a dynamic array plus a top index",
          zh: "手写实现:动态数组 + 一个栈顶指针",
        }}
        desc={{
          en: "One sentence holds it together: size is both the number of elements and the index of the next free slot, so the top sits at size − 1.",
          zh: "核心只有一句话:size 既是元素个数,也是下一个空位的下标 —— 栈顶在 size − 1",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                Build a stack on top of the dynamic array from the array
                chapter. You will see that implementing a stack mostly means{" "}
                <strong>taking abilities away from the array</strong>: expose
                the operations at the end, hide everything else. The Java
                version resizes by itself; Python <code>list</code> and
                JavaScript <code>Array</code> already resize, so those versions
                are shorter. What happens in memory is the same.
              </p>
            }
            zh={
              <p>
                用数组章的动态数组亲手造一个栈。你会发现所谓「实现栈」,
                其实就是<strong>把数组的能力锁小</strong>:只暴露尾部操作,
                其余全部藏起来。Java 版连扩容都自己写,Python / JS 的动态数组自带扩容,
                代码更短 —— 但内存里发生的事完全相同:
              </p>
            }
          />
        </div>
        <CodeTabs
          title="array_stack"
          java={{
            code: {
              en: `import java.util.Arrays;

public class ArrayStack {
    private int[] data = new int[4];   // fixed-size array underneath (copied when full)
    private int size = 0;              // element count = index of the next free slot

    public void push(int x) {
        if (size == data.length) grow();   // full: double the capacity first
        data[size++] = x;                  // write at the end, top moves right, O(1)
    }

    public int pop() {
        if (isEmpty()) throw new RuntimeException("stack is empty");
        return data[--size];               // top moves back one slot = removed
    }

    public int peek() {
        if (isEmpty()) throw new RuntimeException("stack is empty");
        return data[size - 1];             // read without removing
    }

    public boolean isEmpty() { return size == 0; }
    public int size() { return size; }

    private void grow() {                  // resize: copy into an array twice as large
        data = Arrays.copyOf(data, data.length * 2);
    }
}`,
              zh: `import java.util.Arrays;

public class ArrayStack {
    private int[] data = new int[4];   // 底层定长数组(满了要复制搬家)
    private int size = 0;              // 已存个数 = 下一个空位的下标

    public void push(int x) {
        if (size == data.length) grow();   // 满了先扩容到两倍
        data[size++] = x;                  // 写到尾部,栈顶右移,O(1)
    }

    public int pop() {
        if (isEmpty()) throw new RuntimeException("stack is empty");
        return data[--size];               // 栈顶左移一格,就算删除了
    }

    public int peek() {
        if (isEmpty()) throw new RuntimeException("stack is empty");
        return data[size - 1];             // 只看不拿
    }

    public boolean isEmpty() { return size == 0; }
    public int size() { return size; }

    private void grow() {                  // 扩容:复制进两倍大的新数组
        data = Arrays.copyOf(data, data.length * 2);
    }
}`,
            },
            hl: [8, 9, 13, 14],
            note: {
              en: (
                <>
                  <b>Why pop only decreases size:</b> the old value is still in
                  the array, but it is now outside the contract, and the next
                  push overwrites it. Deleting here means agreeing to ignore it.
                </>
              ),
              zh: (
                <>
                  <b>为什么 pop 只是 size 减一:</b>旧值还躺在数组里,
                  但已经在「合同」之外,下次 push 会直接覆盖它。删除 = 约定不再看它。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class ArrayStack:
    """A stack backed by a list: the top is the last item."""

    def __init__(self):
        self._data = []            # a list resizes itself, so there is no grow()

    def push(self, x):
        self._data.append(x)       # append at the end = push, O(1) amortized

    def pop(self):
        if self.is_empty():
            raise IndexError("pop from empty stack")
        return self._data.pop()    # remove the last item = pop, O(1)

    def peek(self):
        if self.is_empty():
            raise IndexError("peek from empty stack")
        return self._data[-1]      # read without removing

    def is_empty(self):
        return len(self._data) == 0

    def size(self):
        return len(self._data)`,
              zh: `class ArrayStack:
    """用 list(动态数组)实现的栈:栈顶 = 列表尾部。"""

    def __init__(self):
        self._data = []            # list 自带扩容,不用手写 grow()

    def push(self, x):
        self._data.append(x)       # 尾部追加 = 压栈,均摊 O(1)

    def pop(self):
        if self.is_empty():
            raise IndexError("pop from empty stack")
        return self._data.pop()    # 尾部弹出 = 出栈,O(1)

    def peek(self):
        if self.is_empty():
            raise IndexError("peek from empty stack")
        return self._data[-1]      # 只看不拿

    def is_empty(self):
        return len(self._data) == 0

    def size(self):
        return len(self._data)`,
            },
            hl: [8, 13, 18],
            note: {
              en: (
                <>
                  <b>Why wrap a list at all?</b> A list already has append and
                  pop, but whoever holds an ArrayStack <b>can only</b> use it in
                  LIFO order. Narrowing the interface removes a whole class of
                  mistakes.
                </>
              ),
              zh: (
                <>
                  <b>为什么还要封装?</b>list 本来就能 append / pop,
                  但拿到 ArrayStack 的人<b>只能</b>按 LIFO 用。
                  把能力锁小,一整类错误就没有发生的机会。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `class ArrayStack {
  #data = [];                    // a # field is genuinely private (ES2022)

  push(x) {
    this.#data.push(x);          // append at the end = push, O(1) amortized
  }

  pop() {
    if (this.isEmpty()) throw new Error("stack is empty");
    return this.#data.pop();     // remove the last item = pop, O(1)
  }

  peek() {
    if (this.isEmpty()) throw new Error("stack is empty");
    return this.#data[this.#data.length - 1];  // read without removing
  }

  isEmpty() { return this.#data.length === 0; }
  size() { return this.#data.length; }
}`,
              zh: `class ArrayStack {
  #data = [];                    // # 开头 = 真正的私有字段(ES2022)

  push(x) {
    this.#data.push(x);          // 尾部追加 = 压栈,均摊 O(1)
  }

  pop() {
    if (this.isEmpty()) throw new Error("stack is empty");
    return this.#data.pop();     // 尾部弹出 = 出栈,O(1)
  }

  peek() {
    if (this.isEmpty()) throw new Error("stack is empty");
    return this.#data[this.#data.length - 1];  // 只看不拿
  }

  isEmpty() { return this.#data.length === 0; }
  size() { return this.#data.length; }
}`,
            },
            hl: [5, 10, 15],
            note: {
              en: (
                <>
                  <b>Note:</b> these methods throw on purpose, which fixes the
                  silent <code>undefined</code> that native{" "}
                  <code>Array.pop()</code> returns on an empty array. A wrapper
                  can keep a language quirk out of your algorithm.
                </>
              ),
              zh: (
                <>
                  <b>注意:</b>这里主动抛错,补上了原生 <code>Array.pop()</code>{" "}
                  在空数组上静默返回 undefined 的坑 —— 封装的另一个价值:
                  把语言的坑挡在算法之外。
                </>
              ),
            },
          }}
        />
      </Section>

      {/* ================= §05 Three languages side by side ================= */}
      <Section
        id="langs"
        index="05"
        title={{
          en: "Three languages: what to use as a stack",
          zh: "三语言对照:该用什么当栈",
        }}
        desc={{
          en: "Java has one class you should not use. Here is the reason.",
          zh: "Java 有个著名的「不要用」—— 先讲清为什么",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                The abstraction is the same in all three languages, but the
                defaults are not. In Java you have to pick the right container,
                and one classic mistake lives here. In Python and JavaScript the
                built-in dynamic array is already the right answer.
              </p>
            }
            zh={
              <p>
                三种语言里栈的抽象完全一致,但「出厂配置」差别不小:Java
                要挑对容器(这里有个经典大坑),Python 和 JS 直接用自家动态数组就好:
              </p>
            }
          />
        </div>
        <CodeTabs
          title="stack_basics"
          java={{
            code: {
              en: `import java.util.ArrayDeque;
import java.util.Deque;

// Preferred: ArrayDeque used as a stack (what the JDK docs recommend)
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);                 // push adds at the head of the deque
stack.push(2);
int top = stack.peek();        // look at the top -> 2
int x = stack.pop();           // pop removes from the head -> 2
boolean empty = stack.isEmpty();

// Not recommended: java.util.Stack (a JDK 1.0 class)
java.util.Stack<Integer> old = new java.util.Stack<>();
old.push(1);                   // it works, but every method is synchronized`,
              zh: `import java.util.ArrayDeque;
import java.util.Deque;

// 首选:ArrayDeque 当栈(JDK 文档推荐的做法)
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);                 // push 加在双端队列的头部
stack.push(2);
int top = stack.peek();        // 看栈顶 -> 2
int x = stack.pop();           // pop 从头部取走 -> 2
boolean empty = stack.isEmpty();

// 不推荐:java.util.Stack(JDK 1.0 的历史遗留类)
java.util.Stack<Integer> old = new java.util.Stack<>();
old.push(1);                   // 能用,但每个方法都带着同步锁`,
            },
            hl: [5, 13],
            note: {
              en: (
                <>
                  <b>Why not the Stack class:</b> it extends{" "}
                  <code>Vector</code>, so every method is{" "}
                  <code>synchronized</code> and single-threaded code pays for a
                  lock it does not need. As a Vector it also exposes{" "}
                  <code>get(i)</code> and <code>insertElementAt</code>, so a
                  caller can read or insert in the middle and the LIFO rule
                  stops being a rule. The JDK documentation says ArrayDeque
                  should be preferred for stack operations. Two details to
                  remember about <code>Deque</code>: <code>push</code> and{" "}
                  <code>pop</code> both act on the <b>head</b>, so iterating an
                  ArrayDeque used as a stack goes from top to bottom; and
                  ArrayDeque does not accept <code>null</code> elements.
                </>
              ),
              zh: (
                <>
                  <b>为什么别用 Stack 类:</b>它继承 <code>Vector</code>
                  ,每个方法都是 <code>synchronized</code>
                  ,单线程代码也要付这份用不到的加锁成本;作为 Vector 它还暴露{" "}
                  <code>get(i)</code>、<code>insertElementAt</code>
                  ,调用方随时能读中间、往中间插,LIFO 纪律形同虚设。
                  JDK 文档写明:栈操作应优先使用 ArrayDeque。
                  另外 <code>Deque</code> 有两个细节要记住:<code>push</code> /{" "}
                  <code>pop</code> 都作用在<b>头部</b>
                  ,所以把 ArrayDeque 当栈遍历时,顺序是从栈顶到栈底;
                  而且 ArrayDeque 不允许存 <code>null</code>。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `stack = []            # a list is already a stack

stack.append(1)       # push: append at the end
stack.append(2)
top = stack[-1]       # look at the top -> 2
x = stack.pop()       # pop: with no argument it removes the last item -> 2
empty = not stack     # the usual way to test for empty

# collections.deque is the choice when you need both ends
# (appendleft / popleft are O(1); list.pop(0) is O(n))`,
              zh: `stack = []            # list 本身就是一个栈

stack.append(1)       # 压栈:尾部追加
stack.append(2)
top = stack[-1]       # 看栈顶 -> 2
x = stack.pop()       # 弹栈:不传参数就是弹出最后一个 -> 2
empty = not stack     # 判空的惯用写法

# 需要两端都操作时才换 collections.deque
# (appendleft / popleft 是 O(1);list.pop(0) 是 O(n))`,
            },
            hl: [3, 6],
            note: {
              en: (
                <>
                  <b>Common mistake:</b> <code>pop(0)</code> removes the first
                  item, which shifts every remaining element and costs O(n) (see
                  the array chapter). Stack code always calls{" "}
                  <code>pop()</code> with no argument.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>写成 <code>pop(0)</code>{" "}
                  就变成了头删,其余元素要整体前移,O(n)(数组章讲过)。
                  栈操作永远是不带参数的 <code>pop()</code>。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `const stack = [];         // an Array is already a stack

stack.push(1);            // push: append at the end
stack.push(2);
const top = stack.at(-1); // look at the top -> 2 (ES2022; same as stack[stack.length-1])
const x = stack.pop();    // pop: remove the last item -> 2
const empty = stack.length === 0;`,
              zh: `const stack = [];         // Array 本身就是一个栈

stack.push(1);            // 压栈:尾部追加
stack.push(2);
const top = stack.at(-1); // 看栈顶 -> 2(ES2022;等价于 stack[stack.length-1])
const x = stack.pop();    // 弹栈:取走最后一个 -> 2
const empty = stack.length === 0;`,
            },
            hl: [3, 6],
            note: {
              en: (
                <>
                  <b>Common mistake:</b> <code>pop()</code> on an empty array
                  does not fail. It returns <code>undefined</code>, and that
                  value can travel a long way through your code before anything
                  looks wrong. Check <code>length</code> first.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>空数组 <code>pop()</code> 不报错,返回{" "}
                  <code>undefined</code>
                  ,这个值会在代码里跑很远才显出问题。动手前先查{" "}
                  <code>length</code>。
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
                  <T en="Python (list)" zh="Python(list)" />
                </th>
                <th>
                  <T en="JavaScript (Array)" zh="JavaScript(Array)" />
                </th>
                <th>
                  <T en="Complexity" zh="复杂度" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <T en="Push" zh="压栈" />
                </td>
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
                  <BigO
                    o="1"
                    label={{ en: "O(1) amortized", zh: "均摊 O(1)" }}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Pop" zh="弹栈" />
                </td>
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
                <td>
                  <T en="Look at the top" zh="看栈顶" />
                </td>
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
                <td>
                  <T en="Empty test" zh="判空" />
                </td>
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
                <td>
                  <T
                    en="Pop on an empty stack"
                    zh="空栈 pop 的行为"
                  />
                </td>
                <td>
                  <T
                    en="throws NoSuchElementException"
                    zh="抛 NoSuchElementException"
                  />
                </td>
                <td>
                  <T en="raises IndexError" zh="抛 IndexError" />
                </td>
                <td>
                  <b>
                    <T
                      en="returns undefined, no error"
                      zh="静默返回 undefined"
                    />
                  </b>
                </td>
                <td>——</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ================= §06 Patterns and walkthroughs ================= */}
      <Section
        id="patterns"
        index="06"
        title={{
          en: "Three patterns, and monotonic stacks",
          zh: "栈的三大套路 + 单调栈专题",
        }}
        desc={{
          en: "Almost every stack problem on LeetCode is one of these three, and the monotonic stack is the one interviews test.",
          zh: "LeetCode 栈题几乎全部落进这三个筐 —— 其中单调栈是面试的分水岭",
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
              <T en="Matching and nesting" zh="配对 / 嵌套" />
            </div>
            <T
              en={
                <p>
                  Bracket matching, removing adjacent pairs, decoding nested
                  strings. Whenever a closing item has to find the{" "}
                  <b>most recent</b> opening item, push the opening items and
                  let them wait. LC 20, 1047, 394, 150.
                </p>
              }
              zh={
                <p>
                  括号匹配、相邻消除、嵌套解码:凡是「右半边要找<b>最近的</b>左半边」
                  ,就把左半边压栈等着。LC 20、1047、394、150。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PATTERN 02" zh="套路二" />
            </div>
            <div className="card-title">
              <T en="Next greater or next smaller" zh="找下一个更大 / 更小" />
            </div>
            <T
              en={
                <p>
                  For each element, which is the first element to its right that
                  is larger (or smaller)? A <b>monotonic stack</b> answers all
                  of them in one pass and turns O(n²) into O(n). LC 739, 496,
                  503, 84, 42. Covered in detail below.
                </p>
              }
              zh={
                <p>
                  「每个元素右边第一个比它大 / 小的是谁?」→ <b>单调栈</b>
                  ,一遍扫描回答所有问题,把 O(n²) 压成 O(n)。LC 739、496、503、84、42。
                  下面专题详讲。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PATTERN 03" zh="套路三" />
            </div>
            <div className="card-title">
              <T en="Replace recursion with a stack" zh="用栈消除递归" />
            </div>
            <T
              en={
                <p>
                  Recursion already runs on the call stack. Replace the
                  runtime&rsquo;s stack with one you create yourself and any
                  recursion becomes a loop, with no depth limit from the call
                  stack. Iterative binary tree traversal, chapter 07.
                </p>
              }
              zh={
                <p>
                  递归本来就跑在调用栈上 —— 把系统的栈换成自己创建的显式栈,
                  任何递归都能改成迭代,也就不再受调用栈深度的限制。
                  二叉树迭代遍历(第 7 章)。
                </p>
              }
            />
          </div>
        </div>

        <div className="prose" style={{ marginTop: 28 }}>
          <T
            en={
              <p>
                A <strong>monotonic stack</strong> is a stack whose contents
                stay in sorted order; the order is kept by popping before each
                push. Take &ldquo;next greater element&rdquo; as the goal. The
                stack holds the <strong>indices of the elements whose answer is
                still unknown</strong>, and their values never increase from
                bottom to top. When a new element is larger than the value on
                top, that new element is the first larger element to the right of
                the top, so the top is popped and its answer is recorded. Why
                can a popped index be forgotten? Any later element that looks
                left for a larger value meets the element that did the popping
                first, because it is both larger and closer. So a popped index
                can never be anyone&rsquo;s answer again. Three questions cover
                the whole technique:
              </p>
            }
            zh={
              <p>
                <strong>单调栈(monotonic stack)</strong>
                是一种栈内元素始终保持有序的栈,靠「入栈前先弹」来维持这个顺序。
                以「找下一个更大元素」为例:栈里存的是
                <strong>答案还未确定的元素下标</strong>,它们的值自底向上不递增。
                新元素比栈顶大时,它就是栈顶右边第一个更大的元素,于是弹出栈顶并记下答案。
                为什么被弹出的下标可以彻底忘掉?因为后面任何元素向左找更大值时,
                都会先遇到「弹它的那个元素」—— 那个元素既更大又更近,
                所以被弹出的下标不可能再是任何人的答案。三个问题想清楚,单调栈就通了:
              </p>
            }
          />
        </div>
        <div className="grid-3" style={{ marginTop: 14 }}>
          <div className="card">
            <div className="card-kicker">
              <T en="QUESTION 01" zh="问题一" />
            </div>
            <div className="card-title">
              <T en="Which order is kept?" zh="维护什么单调性?" />
            </div>
            <T
              en={
                <p>
                  Next <b>greater</b>: values never increase from bottom to top.
                  Equal values may sit next to each other, because an equal value
                  is not greater. Next <b>smaller</b>: the order is reversed.
                  Mixing the two up breaks everything.
                </p>
              }
              zh={
                <p>
                  找「下一个更<b>大</b>」→ 栈内自底向上<b>不递增</b>
                  (相等的值可以相邻,因为相等不算更大);找「下一个更<b>小</b>」→
                  顺序反过来。记反了就全乱了。
                </p>
              }
            />
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="QUESTION 02" zh="问题二" />
            </div>
            <div className="card-title">
              <T en="When do you pop?" zh="什么时候弹栈?" />
            </div>
            <T
              en={
                <p>
                  When the new element <b>breaks the order</b>. In a
                  non-increasing stack, a new element larger than the top pops
                  it, and the while loop keeps popping until the top is at least
                  as large as the new element, or the stack is empty. Then the
                  new element is pushed.
                </p>
              }
              zh={
                <p>
                  新元素<b>破坏单调性</b>时:不递增栈里来了个比栈顶大的,
                  就用 while 连续弹,直到栈顶不再比它小(或栈空),然后新元素入栈。
                </p>
              }
            />
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="QUESTION 03" zh="问题三" />
            </div>
            <div className="card-title">
              <T en="What is settled at the pop?" zh="弹出时结算什么?" />
            </div>
            <T
              en={
                <p>
                  The answer for the popped element is the element that popped
                  it. LC 739 settles the <b>number of days waited</b> (the
                  difference of the indices), LC 84 the{" "}
                  <b>rectangle whose height is the popped bar</b>, LC 42{" "}
                  <b>one horizontal layer of water</b>. Store indices: an index
                  gives you the position and the value, a value does not give
                  you the position.
                </p>
              }
              zh={
                <p>
                  被弹元素的答案就是「弹它的那个元素」:739 结算<b>等待天数</b>
                  (下标之差),84 结算<b>以它为高的矩形</b>,42 结算<b>一层雨水</b>。
                  栈里存下标:下标能推出位置和值,值推不出位置。
                </p>
              }
            />
          </div>
        </div>
        <Callout
          tone="idea"
          title={{ en: "Why is it O(n)?", zh: "为什么是 O(n)?" }}
        >
          <T
            en={
              <p>
                A while loop inside a for loop looks like O(n²). Count the total
                work instead: each index is <b>pushed exactly once and popped at
                most once</b>, and a popped index never comes back, so the whole
                scan performs at most 2n stack operations. This is the same
                amortized argument as array resizing: do not measure the most
                expensive single step, measure the total.
              </p>
            }
            zh={
              <p>
                while 套在 for 里,看着像 O(n²)?算总账:每个下标
                <b>恰好入栈一次、最多出栈一次</b>,弹出后不再回来,
                全程栈操作不超过 2n。这和数组扩容用的是同一套均摊分析:
                不要盯着最贵的那一步,要算总数。
              </p>
            }
          />
        </Callout>

        {/* —— Walkthrough A —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough A" zh="精讲 A" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 20 · Valid Parentheses" zh="LC 20 · 有效的括号" />
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
                <b>The problem:</b> a string containing only the six bracket
                characters. Decide whether it is valid, meaning every closing
                bracket matches the <strong>most recent</strong> unmatched
                opening bracket of the same type.{" "}
                <b>Brute force:</b> repeatedly delete adjacent pairs such as{" "}
                <code>()</code>, <code>[]</code>, and <code>{"{}"}</code> until
                nothing can be deleted. Each pass is O(n) and there can be n/2
                passes, so O(n²). <b>The stack solution:</b> the most recent
                unmatched opening bracket <em>is</em> the top of the stack, so
                one pass is enough. That is the reason a stack fits here, not a
                trick.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>只含六种括号的字符串,判断是否有效 —— 每个右括号都要与
                <strong>最近的</strong>那个尚未配对的同类左括号成对。
                <b> 暴力:</b>反复扫描,把 <code>()</code>、<code>[]</code>、
                <code>{"{}"}</code> 这样的相邻对删掉,直到删无可删 —— 每轮 O(n),
                最多 n/2 轮,O(n²)。<b>正解:</b>「最近的未配对左括号」
                就是栈顶,一遍扫描就够。栈适合这道题不是巧合,这就是原因。
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 20 · Bracket matching, stack drawn sideways (right end = top)",
            zh: "LC 20 · 括号匹配,栈横放(右端 = 栈顶)",
          }}
          frames={F20}
        />
        <CodeTabs
          title="lc20_valid_parentheses"
          java={{
            code: {
              en: `class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');       // opening: push the closing bracket it needs
            else if (c == '[') stack.push(']');
            else if (c == '{') stack.push('}');
            else if (stack.isEmpty() || stack.pop() != c)
                return false;                    // nothing waiting, or the wrong partner
        }
        return stack.isEmpty();                  // leftover opening brackets -> false
    }
}`,
              zh: `class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');       // 左括号:压入它需要的那个右括号
            else if (c == '[') stack.push(']');
            else if (c == '{') stack.push('}');
            else if (stack.isEmpty() || stack.pop() != c)
                return false;                    // 没人在等,或者等错了人
        }
        return stack.isEmpty();                  // 还有左括号没配对 -> false
    }
}`,
            },
            hl: [5, 6, 7, 8, 9, 11],
            note: {
              en: (
                <>
                  <b>A small trick:</b> pushing the expected closing bracket
                  instead of the opening one turns the comparison into a single{" "}
                  <code>!=</code>, with no lookup table.
                </>
              ),
              zh: (
                <>
                  <b>小技巧:</b>压栈时直接存「期待的右括号」,比对时一个{" "}
                  <code>!=</code> 就够,不用查配对表。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class Solution:
    def isValid(self, s: str) -> bool:
        pairs = {')': '(', ']': '[', '}': '{'}
        stack = []
        for c in s:
            if c not in pairs:               # opening bracket: push and wait
                stack.append(c)
            elif not stack or stack.pop() != pairs[c]:
                return False                 # stack empty, or the top does not match
        return not stack                     # the stack must end up empty`,
              zh: `class Solution:
    def isValid(self, s: str) -> bool:
        pairs = {')': '(', ']': '[', '}': '{'}
        stack = []
        for c in s:
            if c not in pairs:               # 左括号:入栈等待
                stack.append(c)
            elif not stack or stack.pop() != pairs[c]:
                return False                 # 栈空,或者栈顶对不上
        return not stack                     # 栈必须刚好清空`,
            },
            hl: [6, 7, 8, 9, 10],
          }}
          js={{
            code: {
              en: `var isValid = function (s) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const c of s) {
    if (!(c in pairs)) {
      stack.push(c);                   // opening bracket: push and wait
    } else if (stack.pop() !== pairs[c]) {
      return false;                    // pop on an empty stack gives undefined, which never matches
    }
  }
  return stack.length === 0;           // the stack must end up empty
};`,
              zh: `var isValid = function (s) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const c of s) {
    if (!(c in pairs)) {
      stack.push(c);                   // 左括号:入栈等待
    } else if (stack.pop() !== pairs[c]) {
      return false;                    // 空栈 pop 得到 undefined,自然对不上
    }
  }
  return stack.length === 0;           // 栈必须刚好清空
};`,
            },
            hl: [5, 6, 7, 8],
            note: {
              en: (
                <>
                  <b>Detail:</b> here the <code>undefined</code> from popping an
                  empty array helps. It is not equal to any bracket, so the
                  empty-stack case falls into <code>return false</code> on its
                  own. Being able to explain this means you understand what JS{" "}
                  <code>pop</code> does.
                </>
              ),
              zh: (
                <>
                  <b>细节:</b>这里空栈 pop 返回的 <code>undefined</code> 反而帮了忙
                  —— 它不等于任何括号,栈空这种情况会自动走进{" "}
                  <code>return false</code>。能解释这一点,说明你真懂 JS 的 pop。
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
                Time <b>O(n)</b>: each character is handled once. Space{" "}
                <b>O(n)</b>: in the worst case every character is an opening
                bracket. Follow-up one: what if there is only one kind of
                bracket? A counter is enough: add one for <code>(</code>,
                subtract one for <code>)</code>, never let it go below zero, and
                it must end at zero. Follow-up two: why does a counter fail with
                several kinds? In <code>([)]</code> each kind is balanced, but
                the pairs cross. <b>Only the stack remembers the order</b> in
                which the brackets were opened.
              </p>
            }
            zh={
              <p>
                时间 <b>O(n)</b>(每个字符处理一次),空间 <b>O(n)</b>
                (最坏情况全是左括号)。追问一:「如果只有一种括号?」——
                一个计数器就够:遇 <code>(</code> 加一、遇 <code>)</code>{" "}
                减一,途中不许为负,结尾必须为零。追问二:「多种括号为什么不能用计数器?」
                —— <code>([)]</code> 每种括号数量都平衡,但配对交叉了;
                <b>只有栈记得住括号被打开的顺序</b>。
              </p>
            }
          />
        </Callout>

        {/* —— Walkthrough B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough B" zh="精讲 B" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 155 · Min Stack" zh="LC 155 · 最小栈" />
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
                <b>The problem:</b> design a stack that supports push, pop, and
                top, and also returns the current minimum with getMin in{" "}
                <b>O(1)</b>. <b>Brute force:</b> scan the stack inside getMin,
                which is O(n) and is exactly what the problem rules out.{" "}
                <b>A single min variable?</b> Updating it on push is easy, but
                as soon as the minimum is popped you do not know the second
                smallest and you have to scan again.{" "}
                <b>The fix:</b> the problem is that the history was thrown away,
                so keep it. An <strong>auxiliary stack</strong> stores the
                minimum as of every push, and the two stacks move together:
              </p>
            }
            zh={
              <p>
                <b>题意:</b>设计一个栈,除了 push / pop / top,还要能{" "}
                <b>O(1)</b> 返回当前最小值 getMin。<b>暴力:</b>getMin 时扫一遍栈,
                O(n) —— 正是题目要排除的做法。<b>只存一个全局 min 变量呢?</b>
                push 时更新没问题,可一旦最小值被 pop 走,第二小是谁?不知道,还得扫。
                <b> 正解:</b>问题出在「历史被丢了」,那就把历史留下来:用一个
                <strong>辅助栈</strong>记录每次 push 时的最小值,两个栈同进同出:
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 155 · Auxiliary stack (lower half of each cell = the minimum stored at that level)",
            zh: "LC 155 · 辅助栈(格子下半 = 该层存下的 min)",
          }}
          frames={F155}
          cellW={64}
        />
        <CodeTabs
          title="lc155_min_stack"
          java={{
            code: {
              en: `class MinStack {
    private final Deque<Integer> stack = new ArrayDeque<>(); // main stack
    private final Deque<Integer> mins  = new ArrayDeque<>(); // auxiliary stack

    public void push(int val) {
        stack.push(val);
        // this level = min(new value, previous minimum), fixed at push time
        mins.push(mins.isEmpty() ? val : Math.min(val, mins.peek()));
    }

    public void pop() {
        stack.pop();
        mins.pop();           // always together, so the minimum rolls back by itself
    }

    public int top()    { return stack.peek(); }
    public int getMin() { return mins.peek(); }   // O(1)
}`,
              zh: `class MinStack {
    private final Deque<Integer> stack = new ArrayDeque<>(); // 主栈
    private final Deque<Integer> mins  = new ArrayDeque<>(); // 辅助栈

    public void push(int val) {
        stack.push(val);
        // 这一层 = min(新值, 之前的最小值),入栈时定下,之后不再改
        mins.push(mins.isEmpty() ? val : Math.min(val, mins.peek()));
    }

    public void pop() {
        stack.pop();
        mins.pop();           // 永远一起动,最小值自动回滚到上一层
    }

    public int top()    { return stack.peek(); }
    public int getMin() { return mins.peek(); }   // O(1)
}`,
            },
            hl: [7, 8, 13, 17],
          }}
          python={{
            code: {
              en: `class MinStack:
    def __init__(self):
        self.stack = []       # main stack
        self.mins = []        # auxiliary stack: the minimum as of each push

    def push(self, val: int) -> None:
        self.stack.append(val)
        # this level = min(new value, previous minimum), fixed at push time
        self.mins.append(val if not self.mins else min(val, self.mins[-1]))

    def pop(self) -> None:
        self.stack.pop()
        self.mins.pop()       # always together, so the minimum rolls back by itself

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.mins[-1]  # O(1)`,
              zh: `class MinStack:
    def __init__(self):
        self.stack = []       # 主栈
        self.mins = []        # 辅助栈:每次 push 时的最小值

    def push(self, val: int) -> None:
        self.stack.append(val)
        # 这一层 = min(新值, 之前的最小值),入栈时定下,之后不再改
        self.mins.append(val if not self.mins else min(val, self.mins[-1]))

    def pop(self) -> None:
        self.stack.pop()
        self.mins.pop()       # 永远一起动,最小值自动回滚到上一层

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.mins[-1]  # O(1)`,
            },
            hl: [8, 9, 13, 19],
          }}
          js={{
            code: {
              en: `var MinStack = function () {
  this.stack = [];      // main stack
  this.mins = [];       // auxiliary stack: the minimum as of each push
};

MinStack.prototype.push = function (val) {
  this.stack.push(val);
  // this level = min(new value, previous minimum), fixed at push time
  const m = this.mins.length === 0 ? val : Math.min(val, this.mins.at(-1));
  this.mins.push(m);
};

MinStack.prototype.pop = function () {
  this.stack.pop();
  this.mins.pop();      // always together, so the minimum rolls back by itself
};

MinStack.prototype.top = function () { return this.stack.at(-1); };
MinStack.prototype.getMin = function () { return this.mins.at(-1); }; // O(1)`,
              zh: `var MinStack = function () {
  this.stack = [];      // 主栈
  this.mins = [];       // 辅助栈:每次 push 时的最小值
};

MinStack.prototype.push = function (val) {
  this.stack.push(val);
  // 这一层 = min(新值, 之前的最小值),入栈时定下,之后不再改
  const m = this.mins.length === 0 ? val : Math.min(val, this.mins.at(-1));
  this.mins.push(m);
};

MinStack.prototype.pop = function () {
  this.stack.pop();
  this.mins.pop();      // 永远一起动,最小值自动回滚到上一层
};

MinStack.prototype.top = function () { return this.stack.at(-1); };
MinStack.prototype.getMin = function () { return this.mins.at(-1); }; // O(1)`,
            },
            hl: [8, 9, 10, 15, 19],
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "Why can the auxiliary stack stay in step?",
            zh: "为什么辅助栈能一直同步?",
          }}
        >
          <T
            en={
              <p>
                The reason is the LIFO rule itself. When the top is popped, what
                is exposed is <b>exactly</b> the stack as it was before that
                element was pushed, and the minimum frozen at that level is the
                minimum of that earlier state. In a structure that allows removal
                from the middle, such as an array, these snapshots stop being
                valid. <b>LIFO is what lets the history roll back correctly.</b>{" "}
                Follow-up: can it use less space? Two options. First, push onto
                the auxiliary stack only when the new value is smaller than or
                equal to the current minimum, and pop it only when the popped
                value equals the current minimum; that helps on average, but the
                worst case is still O(n). Second, keep a single stack and push
                the encoded difference <code>2 * val - min</code> whenever a new
                minimum arrives, restoring the previous minimum on pop. That
                version uses O(1) extra space, but the encoded value can be
                roughly twice the range of the input, so it overflows 32-bit
                arithmetic and has to be done in 64-bit.
              </p>
            }
            zh={
              <p>
                关键在栈的纪律本身:栈顶被 pop 后,露出来的<b>恰好就是</b>
                这个元素 push 之前的那个栈,而辅助栈在那一层存的 min
                记录的正是那个状态的最小值。换成允许中间删除的结构(比如数组),
                这套「历史快照」立刻失效。<b>是 LIFO 让历史可以被正确回滚。</b>
                追问:「能省点空间吗?」有两条路。一是只在新值 ≤ 当前最小值时才压辅助栈
                (pop 时相等才弹),平均能省,最坏仍是 O(n);
                二是只用一个栈,遇到新的最小值时压入编码差值{" "}
                <code>2 * val - min</code>,pop 时反解出上一个最小值 ——
                额外空间 O(1),但编码后的值可能达到输入范围的约两倍,
                32 位会溢出,必须用 64 位运算。
              </p>
            }
          />
        </Callout>
        <Callout tone="win" title={{ en: "Complexity", zh: "复杂度" }}>
          <T
            en={
              <p>
                All four operations are <b>O(1)</b>. The auxiliary stack costs{" "}
                <b>O(n)</b> extra space. The general technique is worth keeping:
                <b>
                  {" "}
                  when a quantity changes with the history of the stack, record
                  that quantity at every level in a second stack
                </b>
                . Many &ldquo;design a stack that supports X&rdquo; problems are
                variants of this one.
              </p>
            }
            zh={
              <p>
                四个操作全部 <b>O(1)</b>,辅助栈带来 <b>O(n)</b> 额外空间。
                这道题真正要带走的是一招通用手法:
                <b>「随栈的历史变化的量,用第二个栈把每一层都记下来」</b> ——
                很多「设计一个支持 X 的栈」都是它的变体。
              </p>
            }
          />
        </Callout>

        {/* —— Walkthrough C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough C" zh="精讲 C" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 739 · Daily Temperatures" zh="LC 739 · 每日温度" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">
              MEDIUM
            </span>
            <span className="chip" data-tone="warn" style={{ marginLeft: 8 }}>
              <T en="Monotonic stack" zh="单调栈代表作" />
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>The problem:</b> given the temperature of each day, find how
                many days you have to <strong>wait</strong> for a warmer one, or
                0 if it never gets warmer. <b>Brute force:</b> scan forward from
                every day, O(n²); with n = 10⁵ that is about 10¹⁰ steps, which is
                too slow. <b>Why it can be improved:</b> the brute force rescans
                the same stretch again and again. 74, 71, and 69 are all waiting
                for 75, so when 75 arrives{" "}
                <strong>all of them should be settled at once</strong>. Keep the
                days that are still waiting in a stack. Each new waiting day is
                colder than the one before it, which makes it a monotonic stack:
              </p>
            }
            zh={
              <p>
                <b>题意:</b>给出每天的温度,求每天还要<strong>等几天</strong>
                才会遇到更高的温度(等不到记 0)。<b>暴力:</b>每天向后线性扫,
                O(n²) —— n = 10⁵ 时约 10¹⁰ 步,会超时。<b>为什么能优化:</b>
                暴力的浪费在于反复重扫同一段:74、71、69 都在等 75,
                75 出现时应该<strong>一次性把它们全部结算</strong>。
                把「还在等待的日子」存进栈,新入栈的一定比前一个更冷,这就是单调栈:
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 739 · Monotonic stack (highlighted = waiting in the stack, green = answer settled)",
            zh: "LC 739 · 单调栈(亮 = 栈中等待,绿 = 已结算)",
          }}
          frames={F739}
        />
        <CodeTabs
          title="lc739_daily_temperatures"
          java={{
            code: {
              en: `class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] ans = new int[n];                 // default 0: no warmer day ahead
        Deque<Integer> stack = new ArrayDeque<>(); // indices, temperatures non-increasing
        for (int i = 0; i < n; i++) {
            // while today is warmer than the top, today is the answer the top waited for
            while (!stack.isEmpty()
                   && temperatures[i] > temperatures[stack.peek()]) {
                int j = stack.pop();
                ans[j] = i - j;                 // settled at the moment of the pop
            }
            stack.push(i);                      // today waits for its own answer
        }
        return ans;
    }
}`,
              zh: `class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] ans = new int[n];                 // 默认 0:右边没有更暖的日子
        Deque<Integer> stack = new ArrayDeque<>(); // 存下标,温度自底向上不递增
        for (int i = 0; i < n; i++) {
            // 只要今天比栈顶暖,今天就是栈顶等的答案
            while (!stack.isEmpty()
                   && temperatures[i] > temperatures[stack.peek()]) {
                int j = stack.pop();
                ans[j] = i - j;                 // 弹出的瞬间结算
            }
            stack.push(i);                      // 今天也入栈,等自己的答案
        }
        return ans;
    }
}`,
            },
            hl: [8, 9, 10, 11, 13],
          }}
          python={{
            code: {
              en: `class Solution:
    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:
        n = len(temperatures)
        ans = [0] * n                     # default 0: no warmer day ahead
        stack = []                        # indices, temperatures non-increasing
        for i, t in enumerate(temperatures):
            # while today is warmer than the top, today is the answer the top waited for
            while stack and t > temperatures[stack[-1]]:
                j = stack.pop()
                ans[j] = i - j            # settled at the moment of the pop
            stack.append(i)               # today waits for its own answer
        return ans`,
              zh: `class Solution:
    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:
        n = len(temperatures)
        ans = [0] * n                     # 默认 0:右边没有更暖的日子
        stack = []                        # 存下标,温度自底向上不递增
        for i, t in enumerate(temperatures):
            # 只要今天比栈顶暖,今天就是栈顶等的答案
            while stack and t > temperatures[stack[-1]]:
                j = stack.pop()
                ans[j] = i - j            # 弹出的瞬间结算
            stack.append(i)               # 今天也入栈,等自己的答案
        return ans`,
            },
            hl: [8, 9, 10, 11],
          }}
          js={{
            code: {
              en: `var dailyTemperatures = function (temperatures) {
  const n = temperatures.length;
  const ans = new Array(n).fill(0);   // default 0: no warmer day ahead
  const stack = [];                   // indices, temperatures non-increasing
  for (let i = 0; i < n; i++) {
    // while today is warmer than the top, today is the answer the top waited for
    while (stack.length && temperatures[i] > temperatures[stack.at(-1)]) {
      const j = stack.pop();
      ans[j] = i - j;                 // settled at the moment of the pop
    }
    stack.push(i);                    // today waits for its own answer
  }
  return ans;
};`,
              zh: `var dailyTemperatures = function (temperatures) {
  const n = temperatures.length;
  const ans = new Array(n).fill(0);   // 默认 0:右边没有更暖的日子
  const stack = [];                   // 存下标,温度自底向上不递增
  for (let i = 0; i < n; i++) {
    // 只要今天比栈顶暖,今天就是栈顶等的答案
    while (stack.length && temperatures[i] > temperatures[stack.at(-1)]) {
      const j = stack.pop();
      ans[j] = i - j;                 // 弹出的瞬间结算
    }
    stack.push(i);                    // 今天也入栈,等自己的答案
  }
  return ans;
};`,
            },
            hl: [7, 8, 9, 11],
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
                Time <b>O(n)</b>: each index is pushed once and popped at most
                once, so at most 2n stack operations. A nested loop does not
                make this O(n²). Space O(n). Follow-up one: why store indices
                instead of temperatures? Settling an answer needs the{" "}
                <b>difference of two indices</b>, and an index also gives you
                the temperature, while a temperature does not give you the
                index. Follow-up two: how do you find the previous greater
                element? In the same pass: just before index i is pushed, the
                index on top of the stack is the nearest day to its left whose
                temperature is at least T[i]. Follow-up three: what if the array
                is circular? Run the index from 0 to 2n − 1 and use{" "}
                <code>i % n</code>, and on the second pass only pop, never push
                (LC 503, in the problem set).
              </p>
            }
            zh={
              <p>
                时间 <b>O(n)</b>:每个下标入栈一次、最多出栈一次,
                栈操作总数不超过 2n —— 嵌套循环并不意味着 O(n²)。空间 O(n)。
                追问一:「为什么栈里存下标不存温度?」—— 结算要算
                <b>两个下标之差</b>,而且下标能推出温度,温度推不出下标。
                追问二:「找上一个更大的呢?」—— 同一遍扫描里就有:
                下标 i 入栈前,栈顶就是它左边最近的、温度不低于 T[i] 的那一天。
                追问三:「数组是环形的呢?」—— 下标跑到 2n − 1、访问时用{" "}
                <code>i % n</code>,第二圈只弹不进(LC 503,题单里有)。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §07 Problem set ================= */}
      <Section
        id="problems"
        index="07"
        title={{
          en: "Problem set: 10 stack problems",
          zh: "高频题单:栈 10 题",
        }}
        desc={{
          en: "Pair cancellation, then expressions, then monotonic stacks, easy to hard. Think for 30 seconds before you open the hint.",
          zh: "配对消除 → 表达式 → 单调栈,由易到难。先想 30 秒再看提示",
        }}
        badge={
          <span className="chip">
            <T en="Hot 100 selection" zh="Hot 100 精选" />
          </span>
        }
      >
        <ProblemSet ch="stack" items={PROBLEMS} />
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
        <Quiz ch="stack" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                A stack is a <b>container with one opening</b>. pop, peek,
                isEmpty, and size are O(1); push is O(1) amortized on an array
                and O(1) in the worst case on a linked list, at the cost of one
                allocation per node. Array-backed: the top is the{" "}
                <b>last slot</b>. Linked-list-backed: the top is the{" "}
                <b>head node</b>. Both pick the end where nothing has to move.
              </>
            ),
            zh: (
              <>
                栈 = <b>只开一个口的容器</b>:pop / peek / isEmpty / size 都是
                O(1);push 在数组实现下是均摊 O(1),在链表实现下最坏也是 O(1),
                代价是每次都要分配一个节点。数组实现栈顶在<b>尾部</b>
                、链表实现栈顶在<b>头节点</b> —— 都是选「不用搬家」的那端。
              </>
            ),
          },
          {
            en: (
              <>
                &ldquo;<b>The most recent one first</b>&rdquo; is the signal for
                a stack: undo, going back, bracket matching, nested decoding,
                function calls. A nested structure is a LIFO order.
              </>
            ),
            zh: (
              <>
                「<b>最近的先处理</b>」是栈的信号:撤销、后退、括号配对、嵌套解码、
                函数调用 —— 嵌套结构本身就是 LIFO 顺序。
              </>
            ),
          },
          {
            en: (
              <>
                The <b>call stack</b>: one frame per call, holding the
                parameters, the local variables, and the return address; one pop
                per return. Recursion pushes frames for the same function, and
                too many of them means a stack overflow. An explicit stack plus
                a loop is the way out, and it works for any recursion.
              </>
            ),
            zh: (
              <>
                <b>调用栈</b>:每次调用压一帧(参数、局部变量、返回地址),
                每次 return 弹一帧;递归就是函数不断为自己压帧,太深就是栈溢出。
                出路是显式栈 + 迭代,任何递归都能这样改写。
              </>
            ),
          },
          {
            en: (
              <>
                Monotonic stack: for <b>next greater</b>, keep the values
                non-increasing from bottom to top; pop when a new element breaks
                the order and <b>settle the popped element&rsquo;s answer at
                that moment</b>; each index is pushed once and popped at most
                once, so the whole pass is O(n).
              </>
            ),
            zh: (
              <>
                单调栈:找<b>下一个更大</b>时,栈内自底向上<b>不递增</b>;
                新元素破坏单调性就弹栈,<b>弹出的瞬间结算被弹元素的答案</b>;
                每个下标入栈一次、最多出栈一次,所以整趟是 O(n)。
              </>
            ),
          },
          {
            en: (
              <>
                What to use: <code>ArrayDeque</code> in Java (
                <b>not java.util.Stack</b>, which extends Vector and
                synchronizes every method), <code>list</code> in Python (
                <code>collections.deque</code> when you need both ends), and{" "}
                <code>Array</code> in JavaScript. Remember that popping an empty
                array in JavaScript returns <code>undefined</code> instead of
                failing.
              </>
            ),
            zh: (
              <>
                选型:Java 用 <code>ArrayDeque</code>(<b>别用 java.util.Stack</b>
                :继承 Vector,每个方法都加同步锁),Python 用 <code>list</code>
                (两端都要操作时换 <code>collections.deque</code>),JS 用{" "}
                <code>Array</code> —— 并记住 JS 空栈 pop 不报错,返回{" "}
                <code>undefined</code>。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="stack" />
    </main>
  );
}
