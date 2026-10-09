// Chapter 4 · Stacks — problem set (English default / Chinese toggle).
// The closing quiz is in lib/stack-quiz.tsx; /atlas imports only this file.
// Problems ramp from pairwise cancellation up to monotonic stack Hards; hint points a direction
// without spoilers, key explains the optimal solution in one paragraph.

import type { Problem } from "@/lib/problems";

export const PROBLEMS: Problem[] = [
  {
    lc: 1047,
    title: {
      en: "Remove All Adjacent Duplicates In String",
      zh: "删除字符串中的所有相邻重复项",
    },
    d: "easy",
    tags: [
      { en: "Stack", zh: "栈" },
      { en: "Pair cancellation", zh: "配对消除" },
    ],
    hint: {
      en: "A character cancels with the one most recently kept. Which structure gives you the most recent item in O(1)?",
      zh: "当前字符只和「最近留下的那个」抵消。哪种结构能 O(1) 拿到「最近的」?",
    },
    key: {
      en: (
        <>
          Push characters one by one. If the current character equals the top of
          the stack, pop instead of pushing: that pair is removed. Otherwise
          push it. What remains in the stack at the end is the answer. After a
          pop, the element below becomes the new top, so it can cancel with the
          next character without any extra code. Time O(n), space O(n).
        </>
      ),
      zh: (
        <>
          逐字符处理:当前字符与栈顶相同就弹栈(这一对被消除),否则入栈;扫完后栈里剩下的就是答案。弹栈后下面那个元素自动成为新栈顶,可以直接和后面的字符继续配对 —— 连锁消除不需要任何额外代码。时间 O(n),空间 O(n)。
        </>
      ),
    },
  },
  {
    lc: 232,
    title: { en: "Implement Queue using Stacks", zh: "用栈实现队列" },
    d: "easy",
    tags: [
      { en: "Two stacks", zh: "双栈" },
      { en: "Amortized analysis", zh: "均摊分析" },
    ],
    hint: {
      en: "One stack reverses the order of the elements. What does a second reversal give you?",
      zh: "一个栈会把顺序反过来 —— 那再反一次呢?",
    },
    key: {
      en: (
        <>
          The <code>in</code> stack only receives pushes. The <code>out</code>{" "}
          stack answers pop and peek. Move everything from <code>in</code> to{" "}
          <code>out</code> only when <code>out</code> is empty. Two reversals
          restore the original arrival order. Each element is moved at most four
          times in its life (into <code>in</code>, out of <code>in</code>, into{" "}
          <code>out</code>, out of <code>out</code>), so each operation is O(1)
          amortized. The queue chapter walks through this frame by frame.
        </>
      ),
      zh: (
        <>
          <code>in</code> 栈只收 push,<code>out</code> 栈负责 pop / peek;只有 <code>out</code> 空了才把 <code>in</code> 整体倒过去。两次反转恰好恢复先来后到。每个元素一生最多被搬 4 次(进 <code>in</code>、出 <code>in</code>、进 <code>out</code>、出{" "}
          <code>out</code>),所以单次操作均摊 O(1)。队列章有逐帧动画和完整推导。
        </>
      ),
    },
  },
  {
    lc: 225,
    title: { en: "Implement Stack using Queues", zh: "用队列实现栈" },
    d: "easy",
    tags: [
      { en: "Queue", zh: "队列" },
      { en: "Rotation", zh: "旋转" },
    ],
    hint: {
      en: "A new element joins at the back of the queue. Can you rotate the queue so it ends up at the front?",
      zh: "新元素入队后排在最后 —— 有没有办法让它「转」到队头去?",
    },
    key: {
      en: (
        <>
          The single-queue version: on push, enqueue the new element, then
          dequeue and re-enqueue the n−1 elements in front of it. The queue
          rotates by one full turn and the new element ends up at the front. Now
          pop is just a dequeue. Push is O(n) and pop is O(1) — the mirror image
          of LC 232, so solve the two together.
        </>
      ),
      zh: (
        <>
          单队列做法:push 时先把新元素入队,再把它前面的 n−1 个元素依次出队、重新入队 —— 队列被旋转一整圈,新元素恰好转到队头。于是 pop 就是一次出队。push O(n)、pop O(1),和 LC 232 互为镜像,放在一起做最有感觉。
        </>
      ),
    },
  },
  {
    lc: 682,
    title: { en: "Baseball Game", zh: "棒球比赛" },
    d: "easy",
    tags: [
      { en: "Stack", zh: "栈" },
      { en: "Simulation", zh: "模拟" },
    ],
    hint: {
      en: "Every operation only refers to the one or two most recent valid scores. Where do you keep the most recent records?",
      zh: "每条指令都只关心「最近的一两次有效得分」—— 用什么存最近的记录?",
    },
    key: {
      en: (
        <>
          Keep the valid scores in a stack. A number is pushed directly.{" "}
          <code>+</code> pushes the sum of the top two. <code>D</code> pushes
          twice the top. <code>C</code> pops the top. Sum the stack at the end.
          It is a pure simulation, and the point of it is the reflex: &ldquo;the
          most recent records&rdquo; means a stack. Time O(n), space O(n).
        </>
      ),
      zh: (
        <>
          用栈存有效得分:数字直接入栈;<code>+</code> 把栈顶两项之和入栈;
          <code>D</code> 把栈顶 ×2 入栈;<code>C</code> 弹掉栈顶。最后求和。纯模拟题,练的是「要最近的记录 → 用栈」这个条件反射。时间 O(n),空间 O(n)。
        </>
      ),
    },
  },
  {
    lc: 150,
    title: {
      en: "Evaluate Reverse Polish Notation",
      zh: "逆波兰表达式求值",
    },
    d: "medium",
    tags: [
      { en: "Stack", zh: "栈" },
      { en: "Expression evaluation", zh: "表达式求值" },
    ],
    hint: {
      en: "In postfix notation an operator always comes after its two operands. Where are the two most recent numbers waiting?",
      zh: "后缀表达式里,运算符永远跟在它的两个操作数后面 —— 「最近的两个数」在哪里等你?",
    },
    key: {
      en: (
        <>
          Push numbers. On an operator, pop two values, compute, and push the
          result back. Watch the order: <b>the value you pop first is the right
          operand</b>, which matters for subtraction and division. Division
          truncates toward zero. Postfix needs no parentheses and no precedence
          rules, which is exactly why compilers and calculators evaluate with a
          stack. Time O(n), space O(n).
        </>
      ),
      zh: (
        <>
          数字入栈;遇到运算符弹出两个数,算完把结果压回去。注意弹出顺序:
          <b>先弹出的是右操作数</b>,减法和除法会因此出错;除法要向零取整。后缀表达式不需要括号、不需要优先级,这正是编译器和计算器用栈求值的原因。时间 O(n),空间 O(n)。
        </>
      ),
    },
  },
  {
    lc: 394,
    title: { en: "Decode String", zh: "字符串解码" },
    d: "medium",
    tags: [
      { en: "Stack", zh: "栈" },
      { en: "Nested structure", zh: "嵌套结构" },
    ],
    hint: {
      en: "In 3[a2[c]] the inner bracket must be decoded first. Innermost first is another way of saying most recent first.",
      zh: "3[a2[c]] —— 嵌套的括号,里层必须先解码。「里层优先」换个说法就是「最近的优先」。",
    },
    key: {
      en: (
        <>
          On <code>[</code>, push the string built so far together with the
          current repeat count, then start a fresh empty string. On{" "}
          <code>]</code>, pop that pair and set{" "}
          <code>cur = prev + k * cur</code>. The stack holds one unfinished
          piece of work per nesting level, which is the same thing a call stack
          holds. This problem can also be written with recursion, and the two
          versions translate into each other line by line. Time O(n).
        </>
      ),
      zh: (
        <>
          遇到 <code>[</code> 时把「当前已拼好的字符串 + 当前倍数」打包压栈,然后清空重新开始;遇到 <code>]</code> 弹栈,
          <code>cur = prev + k × cur</code>。栈里每一层存的是一份未完成的工作,和调用栈保存的东西是同一类。本题用递归写也行,两种写法可以逐行互译。时间 O(n)。
        </>
      ),
    },
  },
  {
    lc: 496,
    title: { en: "Next Greater Element I", zh: "下一个更大元素 I" },
    d: "easy",
    tags: [
      { en: "Monotonic stack", zh: "单调栈" },
      { en: "Hash table", zh: "哈希表" },
    ],
    hint: {
      en: "Precompute the next greater element for every value in nums2, then answer the questions from nums1 by lookup.",
      zh: "先对 nums2 把每个元素的「下一个更大」全求出来存好,再回答 nums1 的提问。",
    },
    key: {
      en: (
        <>
          Run one monotonic stack pass over <code>nums2</code>. When a new value
          is greater than the top, pop and record{" "}
          <code>popped value → new value</code> in a hash table. Then look up
          each element of <code>nums1</code>. Time O(n + m). This is the same
          machinery as LC 739 in a simpler setting, so solve it first.
        </>
      ),
      zh: (
        <>
          对 <code>nums2</code> 跑一遍单调栈:新元素比栈顶大就弹栈,并在哈希表里记下「被弹出的值 → 弹它的值」;最后 <code>nums1</code>{" "}
          逐个查表。时间 O(n + m)。它和 LC 739 是同一套机制的简化版,建议先做它。
        </>
      ),
    },
  },
  {
    lc: 503,
    title: { en: "Next Greater Element II", zh: "下一个更大元素 II" },
    d: "medium",
    tags: [
      { en: "Monotonic stack", zh: "单调栈" },
      { en: "Circular array", zh: "循环数组" },
    ],
    hint: {
      en: "The array is circular, so the next element after the last one is the first one. Try walking the array twice without copying it.",
      zh: "数组是环形的,最后一个元素的「下一个」会绕回开头 —— 试试不复制数组、直接走两圈。",
    },
    key: {
      en: (
        <>
          The standard trick for circular arrays: let <code>i</code> run from 0
          to 2n−1 and index with <code>i % n</code>. On the first pass, pop and
          settle answers as usual and then push. On the second pass,{" "}
          <b>only pop, never push</b>, because those indices already got their
          chance in the first pass and pushing them again would duplicate work.
          No copy of the array is needed. Time O(n).
        </>
      ),
      zh: (
        <>
          循环数组的标准技巧:下标 <code>i</code> 从 0 跑到 2n−1,访问时用{" "}
          <code>i % n</code>。第一圈正常「弹栈结算 + 入栈」,第二圈
          <b>只弹不进</b> —— 这些下标第一圈已经入过栈,再入一次就重复了。不用真的复制数组。时间 O(n)。
        </>
      ),
    },
  },
  {
    lc: 84,
    title: {
      en: "Largest Rectangle in Histogram",
      zh: "柱状图中最大的矩形",
    },
    d: "hard",
    tags: [
      { en: "Monotonic stack", zh: "单调栈" },
      { en: "Sentinel", zh: "哨兵" },
    ],
    hint: {
      en: "For the largest rectangle whose height is one particular bar, the limits are the first shorter bar on each side. That is next smaller in both directions.",
      zh: "以某根柱子为高的最大矩形,边界是它左右两侧第一根比它矮的柱子 —— 两个方向的「下一个更小」。",
    },
    key: {
      en: (
        <>
          Keep an increasing stack of indices. When the current bar is shorter
          than the top, pop the top and settle the rectangle whose height is
          that bar: the right limit is the current index, the left limit is the
          index now on top, so the width is{" "}
          <code>i − stack.top − 1</code>. Add a bar of height 0 at each end as a
          sentinel: the one in front removes the empty-stack check, and the one
          at the end forces every remaining bar to be settled. Time O(n).
        </>
      ),
      zh: (
        <>
          维护一个<b>递增</b>的下标栈:当前柱子比栈顶矮时,弹出栈顶并结算「以它为高」的矩形 —— 右边界是当前下标,左边界是弹出后的新栈顶,宽度 = <code>i − 新栈顶 − 1</code>。首尾各加一根高度为 0 的哨兵柱:开头那根免去判空,结尾那根强制清算所有剩余柱子。时间 O(n)。
        </>
      ),
    },
  },
  {
    lc: 42,
    title: { en: "Trapping Rain Water", zh: "接雨水" },
    d: "hard",
    tags: [
      { en: "Monotonic stack", zh: "单调栈" },
      { en: "Two solutions", zh: "一题两解" },
    ],
    hint: {
      en: "The array chapter solved this column by column with two pointers. A stack lets you settle the water one horizontal layer at a time, each time the bottom of a pit is popped.",
      zh: "数组章用对撞指针「竖着」按列算过它 —— 单调栈可以「横着」按层算:凹槽的底被弹出时,一层水就结算了。",
    },
    key: {
      en: (
        <>
          Keep a decreasing stack of indices. When the current bar is taller
          than the top, the top is the bottom of a pit, so pop it. The left wall
          is the index now on top and the right wall is the current index, so
          this layer holds{" "}
          <code>(min(left, right) − bottom) * (rightIndex − leftIndex − 1)</code>
          . Compare it with the two-pointer solution in the array chapter: the
          same problem, settled by vertical columns there and by horizontal
          layers here. Being able to explain both is the real goal. Time O(n).
        </>
      ),
      zh: (
        <>
          维护一个递减的下标栈:当前柱子比栈顶高时,栈顶就是凹槽的底,弹出它;此时左墙 = 新栈顶,右墙 = 当前柱子,这一层水量 ={" "}
          <code>(min(左墙, 右墙) − 底) × (右墙下标 − 左墙下标 − 1)</code>。和数组章的对撞指针解法对照:同一道题,那边按列竖着算,这边按层横着算。两种都能讲清楚,才算真的吃透。时间 O(n)。
        </>
      ),
    },
  },
];
