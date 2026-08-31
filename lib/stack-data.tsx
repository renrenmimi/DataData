// Chapter 4 · Stacks — problem set and quiz data (English default / Chinese toggle).
// Problems ramp from pairwise cancellation up to monotonic stack Hards; hint points a direction
// without spoilers, key explains the optimal solution in one paragraph.

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

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
          逐字符处理:当前字符与栈顶相同就弹栈(这一对被消除),否则入栈;
          扫完后栈里剩下的就是答案。弹栈后下面那个元素自动成为新栈顶,
          可以直接和后面的字符继续配对 —— 连锁消除不需要任何额外代码。
          时间 O(n),空间 O(n)。
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
          <code>in</code> 栈只收 push,<code>out</code> 栈负责 pop / peek;
          只有 <code>out</code> 空了才把 <code>in</code> 整体倒过去。
          两次反转恰好恢复先来后到。每个元素一生最多被搬 4 次
          (进 <code>in</code>、出 <code>in</code>、进 <code>out</code>、出{" "}
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
          单队列做法:push 时先把新元素入队,再把它前面的 n−1 个元素依次出队、
          重新入队 —— 队列被旋转一整圈,新元素恰好转到队头。于是 pop 就是一次出队。
          push O(n)、pop O(1),和 LC 232 互为镜像,放在一起做最有感觉。
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
          <code>D</code> 把栈顶 ×2 入栈;<code>C</code> 弹掉栈顶。最后求和。
          纯模拟题,练的是「要最近的记录 → 用栈」这个条件反射。
          时间 O(n),空间 O(n)。
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
          <b>先弹出的是右操作数</b>,减法和除法会因此出错;除法要向零取整。
          后缀表达式不需要括号、不需要优先级,这正是编译器和计算器用栈求值的原因。
          时间 O(n),空间 O(n)。
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
          遇到 <code>[</code> 时把「当前已拼好的字符串 + 当前倍数」打包压栈,
          然后清空重新开始;遇到 <code>]</code> 弹栈,
          <code>cur = prev + k × cur</code>。栈里每一层存的是一份未完成的工作,
          和调用栈保存的东西是同一类。本题用递归写也行,两种写法可以逐行互译。
          时间 O(n)。
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
          对 <code>nums2</code> 跑一遍单调栈:新元素比栈顶大就弹栈,
          并在哈希表里记下「被弹出的值 → 弹它的值」;最后 <code>nums1</code>{" "}
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
          <b>只弹不进</b> —— 这些下标第一圈已经入过栈,再入一次就重复了。
          不用真的复制数组。时间 O(n)。
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
          维护一个<b>递增</b>的下标栈:当前柱子比栈顶矮时,弹出栈顶并结算
          「以它为高」的矩形 —— 右边界是当前下标,左边界是弹出后的新栈顶,
          宽度 = <code>i − 新栈顶 − 1</code>。首尾各加一根高度为 0 的哨兵柱:
          开头那根免去判空,结尾那根强制清算所有剩余柱子。时间 O(n)。
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
          维护一个递减的下标栈:当前柱子比栈顶高时,栈顶就是凹槽的底,弹出它;
          此时左墙 = 新栈顶,右墙 = 当前柱子,这一层水量 ={" "}
          <code>(min(左墙, 右墙) − 底) × (右墙下标 − 左墙下标 − 1)</code>。
          和数组章的对撞指针解法对照:同一道题,那边按列竖着算,这边按层横着算。
          两种都能讲清楚,才算真的吃透。时间 O(n)。
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "What does LIFO (Last In, First Out) mean for a stack?",
      zh: "栈的 LIFO(Last In, First Out)指的是?",
    },
    opts: [
      {
        en: "The element removed is the one added most recently. Both adding and removing happen at the same end, the top.",
        zh: "被取走的永远是最后放进去的那个 —— 放入和取出都发生在同一端(栈顶)",
      },
      {
        en: "The element added first is removed first.",
        zh: "最先入栈的元素最先出栈",
      },
      {
        en: "Elements are removed in order of value, largest first.",
        zh: "元素按值从大到小出栈",
      },
      {
        en: "Elements are added at one end and removed at the other.",
        zh: "入栈和出栈分别在两端进行",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "First in, first out (FIFO) is the rule for a queue, which is the next chapter. A stack does the opposite: the newest element is handled first.",
        zh: "先进先出(FIFO)是队列的规矩(下一章讲)。栈恰好相反:最新的先被处理。",
      },
      {
        en: "A stack never compares values. It only tracks the order in which elements arrived. Removing by value is what a heap or priority queue does (chapter 09).",
        zh: "栈从不比较元素的值,只记录到达顺序。按值出场的是堆 / 优先队列(第 9 章)。",
      },
      {
        en: "Using two different ends is the design of a queue. A stack has one closed end, and everything enters and leaves through the top.",
        zh: "两端各司其职是队列的设计。栈有一端是封死的,一切进出都发生在栈顶。",
      },
    ],
    why: {
      en: "A stack has one opening. push and pop both act on the top, so the element you remove is always the one added most recently. That single rule is what makes a stack fit nested and undo-style problems.",
      zh: "栈只开一个口:push 和 pop 都作用在栈顶,所以取走的永远是最后放进去的那个。正是这一条规则,让栈天然贴合嵌套与撤销类问题。",
    },
  },
  {
    type: "choice",
    q: {
      en: "If you back a stack with a dynamic array, which end of the array should be the top, and why?",
      zh: "用动态数组实现栈,栈顶应该放在数组的哪一端?为什么?",
    },
    opts: [
      {
        en: "The end. Appending and removing at the end move no other element. At the front, every operation would shift the whole array, O(n).",
        zh: "尾部 —— 尾部追加 / 删除不需要移动任何其他元素;放在头部的话每次操作都要整体搬家,O(n)",
      },
      {
        en: "The front, because index 0 is the fastest to read.",
        zh: "头部 —— 下标 0 访问起来更快",
      },
      {
        en: "It makes no difference, because array access is O(1) anywhere.",
        zh: "哪端都一样,反正数组随机访问是 O(1)",
      },
      {
        en: "The middle, so that there is room on both sides.",
        zh: "中间 —— 两边都留出余地更灵活",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Reading arr[0] is indeed O(1), but inserting or deleting at the front shifts every other element by one position. That would make push and pop O(n).",
        zh: "读 arr[0] 确实是 O(1),但在头部插入或删除要把其余元素整体移动一格,push / pop 就都变成 O(n) 了。",
      },
      {
        en: "Fast reading is not the same as fast insertion. A stack inserts and deletes constantly, and that cost depends on how many other elements have to move. Only the end moves nothing.",
        zh: "读得快不等于插删快。栈的操作以插删为主,而插删的成本取决于要移动多少其他元素 —— 只有尾部不需要移动。",
      },
      {
        en: "Operating in the middle can force elements on both sides to move, which is the worst choice. A stack only ever touches one end, so pick the end that moves nothing.",
        zh: "在中间进出意味着两侧都可能要移动,是最差的位置。栈只在一端操作,应该选移动成本为零的那一端。",
      },
    ],
    why: {
      en: "The test is the one from the array chapter: does this operation move other elements? Appending at the end moves nothing, so an array-backed stack puts the top at the end. A linked-list-backed stack does the opposite and puts the top at the head node, because inserting and deleting at the head is the O(1) end there.",
      zh: "判断标准还是数组章那句话:这个操作要不要移动其他元素?尾部操作谁也不惊动,所以数组栈的栈顶在尾部。链表栈正好相反,栈顶是头节点 —— 因为链表只有头插头删是 O(1)。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these are true about calling pop on an empty stack? (Select all that apply.)",
      zh: "关于「对空栈调用 pop」,下列说法正确的是?(多选)",
    },
    opts: [
      {
        en: "Java: ArrayDeque.pop() throws NoSuchElementException.",
        zh: "Java 的 ArrayDeque.pop() 会抛出 NoSuchElementException",
      },
      {
        en: "Python: list.pop() raises IndexError.",
        zh: "Python 的 list.pop() 会抛出 IndexError",
      },
      {
        en: "JavaScript: Array.prototype.pop() does not throw. It returns undefined.",
        zh: "JavaScript 的 Array.pop() 不报错,静默返回 undefined",
      },
      {
        en: "All three return null, so there is no need to check for empty.",
        zh: "三种语言都返回 null,所以不用判空",
      },
    ],
    correct: [0, 1, 2],
    missHint: {
      en: "The three languages behave differently, but A, B, and C are each a correct statement. Check the table in §05 again and see which one you left out.",
      zh: "三种语言的行为各不相同,但 A、B、C 说的都是事实 —— 对照 §05 的表格再检查一遍漏了哪个。",
    },
    extraHint: {
      en: "D is wrong: none of the three returns null. JavaScript is the risky one, because returning undefined silently lets the error travel far from where it started.",
      zh: "D 是错的:没有任何一种返回 null。JavaScript 最危险 —— 静默返回 undefined 会让错误跑到很远的地方才暴露。",
    },
    why: {
      en: "The empty stack is the edge case where the three languages differ most: Java and Python fail immediately, JavaScript stays silent. So check isEmpty before you touch the top. LC 20 is a direct example: if a closing bracket arrives while the stack is empty, the answer is false right away.",
      zh: "空栈是三种语言差别最大的边界:Java 和 Python 当场报错,JavaScript 一声不吭。所以动栈顶之前先判空。LC 20 就是直接的例子:栈空却遇到右括号,可以立刻返回 false。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In the monotonic stack solution to LC 739 (daily temperatures), what order does the stack hold from bottom to top?",
      zh: "用单调栈解 LC 739(每日温度),栈内自底向上维护的顺序是?",
    },
    opts: [
      {
        en: "Temperatures never increase from bottom to top. When a warmer day arrives, it pops every colder index and settles each answer on the spot.",
        zh: "温度自底向上不递增 —— 更暖的一天到来时,把所有比它冷的下标依次弹出,并当场结算答案",
      },
      {
        en: "Temperatures increase from bottom to top, so the top is always the warmest.",
        zh: "温度自底向上递增 —— 保证栈顶永远是最高温度",
      },
      {
        en: "All temperatures in the stack are equal.",
        zh: "栈里的温度全部相等",
      },
      {
        en: "The order does not matter, since everything is popped in the end.",
        zh: "无所谓顺序,反正最后都会弹出来",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "An increasing stack answers next smaller (LC 84 uses it). For next greater you need the opposite order, so that a new element which is greater than the top can settle that answer.",
        zh: "递增栈解决的是「下一个更小」(LC 84 用它)。要找「下一个更大」必须反过来,新元素比栈顶大时,栈顶等的答案才算到了。",
      },
      {
        en: "The stack holds the days that are still waiting for a warmer day. They only need to be in non-increasing order; equal values may sit next to each other because an equal temperature is not warmer.",
        zh: "栈里存的是「还没等到更暖一天」的日子,只要求不递增。相等的温度可以相邻,因为相等并不算更暖。",
      },
      {
        en: "The order is the whole idea. Without the invariant there is no rule for when to pop or what to settle at that moment.",
        zh: "顺序就是单调栈的全部。没有这个不变量,就无从谈起「什么时候弹、弹出时结算什么」。",
      },
    ],
    why: {
      en: "The invariant: the stack holds the indices whose answer is still unknown, and their temperatures never increase from bottom to top. When index j is popped, the current day i is warmer than day j, and it is the first such day, so ans[j] = i − j. Rule of thumb: next greater needs a non-increasing stack, next smaller needs a non-decreasing one.",
      zh: "不变量:栈里存的是「答案还未确定」的下标,它们的温度自底向上不递增。下标 j 被弹出时,当前的第 i 天比第 j 天暖,而且是第一个更暖的,所以 ans[j] = i − j。口诀:找下一个更大 → 栈内不递增;找下一个更小 → 栈内不递减。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Why is java.util.Stack not recommended, in interviews or in production code?",
      zh: "为什么无论刷题还是工程里,都不建议用 java.util.Stack?",
    },
    opts: [
      {
        en: "It extends Vector: every method is synchronized, and it exposes index-based access that breaks the LIFO contract. It is a JDK 1.0 legacy class.",
        zh: "它继承 Vector:每个方法都带同步开销,还暴露按下标访问、破坏 LIFO 约定,是 JDK 1.0 的历史遗留类",
      },
      {
        en: "Its push and pop are O(n), which is too slow.",
        zh: "它的 push / pop 是 O(n),太慢",
      },
      {
        en: "It was removed in recent JDK versions, so code using it no longer compiles.",
        zh: "它在新版 JDK 里已被删除,用了编译不过",
      },
      {
        en: "It cannot store objects, only int values.",
        zh: "它不能存对象,只能存 int",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "push and pop are O(1) amortized; it is backed by an array like any other. The cost is the synchronized lock on every method, and the design problem is that it exposes the full Vector interface.",
        zh: "它的 push / pop 本身是均摊 O(1)(底层也是数组)。问题在于每个方法都加了同步锁,以及它暴露了 Vector 的全部接口 —— 不是复杂度。",
      },
      {
        en: "It is still in the JDK. The official documentation simply says that ArrayDeque should be preferred for stack operations.",
        zh: "它还好好地待在 JDK 里,只是官方文档写明:栈操作应优先使用 ArrayDeque。",
      },
      {
        en: "It is a generic class, Stack<E>, and holds any object. The problem is its design, not its type system.",
        zh: "它是泛型类 Stack<E>,什么对象都能装 —— 问题出在设计,不在类型。",
      },
    ],
    why: {
      en: "Extending Vector causes two problems. Every method is synchronized, so single-threaded code pays for locking it does not need. And the whole Vector interface is inherited, including get(i) and insertElementAt, so nothing stops a caller from reaching into the middle. ArrayDeque is faster and exposes only the operations a stack should have.",
      zh: "继承 Vector 带来两个问题:一是每个方法都是 synchronized,单线程代码也要付出用不到的加锁成本;二是 Vector 的全部接口都被继承下来,包括 get(i)、insertElementAt,调用方随时可以伸手到中间去。ArrayDeque 更快,而且只暴露栈该有的操作。",
    },
  },
  {
    type: "choice",
    q: {
      en: "A recursive function has no base case, or recurses 100,000 levels deep. What is the most likely result?",
      zh: "一个递归函数忘了写终止条件,或者递归了 10 万层,最可能发生什么?",
    },
    opts: [
      {
        en: "A stack overflow. Each call takes one frame on the call stack, and the call stack is only a few megabytes.",
        zh: "栈溢出 —— 每层调用占一个栈帧,而调用栈只有几 MB,塞满就崩",
      },
      {
        en: "The CPU overheats and the operating system reduces its frequency.",
        zh: "CPU 过热,操作系统自动降频",
      },
      {
        en: "The compiler refuses to compile the code.",
        zh: "编译器会拒绝编译这段代码",
      },
      {
        en: "Nothing happens; the program runs to completion.",
        zh: "什么也不会发生,程序正常跑完",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Temperature has nothing to do with it. The crash happens because the memory region reserved for the call stack, usually 1 to 8 MB, is filled with stack frames.",
        zh: "和温度无关。崩溃的原因是内存里划给调用栈的那块区域(通常 1~8 MB)被栈帧填满了。",
      },
      {
        en: "A compiler checks syntax and types. It does not predict how many levels deep a function will recurse at run time, so infinite recursion is perfectly legal code.",
        zh: "编译器检查的是语法和类型,不会预测运行时会递归多少层 —— 无限递归是完全合法的代码。",
      },
      {
        en: "Each call pushes a new frame, and a frame is only popped when the call returns. Without a base case nothing returns, so the stack space runs out.",
        zh: "每次调用都会压入一个新栈帧,只有 return 才会弹出。没有终止条件就没有 return,栈空间必然耗尽。",
      },
    ],
    why: {
      en: "Every call pushes one frame holding the parameters, the local variables, and the return address. Recursion means a function pushes frames for itself. Too deep and you get StackOverflowError in Java, or RecursionError in Python, which limits recursion to 1000 levels by default. The fix is to rewrite the recursion as a loop with your own explicit stack, which is pattern three in this chapter.",
      zh: "每次调用都压入一帧,里面装着参数、局部变量和返回地址;递归就是函数不断为自己压帧。深度太大就是 Java 的 StackOverflowError,或 Python 的 RecursionError(默认限制 1000 层)。解决办法是改成循环 + 自己维护的显式栈,也就是本章的套路三。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          While a monotonic stack scans an array of length n, each index is
          pushed at most ___ time(s) (type a number). This is why the total cost
          is O(n) and not O(n²).
        </>
      ),
      zh: (
        <>
          单调栈扫描长度为 n 的数组时,每个下标最多入栈 ___ 次(填数字)——
          这正是它总复杂度是 O(n) 而不是 O(n²) 的原因。
        </>
      ),
    },
    placeholder: { en: "Type a number…", zh: "输入数字…" },
    answers: ["1", "one", "once", "一", "一次", "1次"],
    hint: {
      en: "Once an index has been popped, is there any way for it to get back into the stack?",
      zh: "想一想:一个下标被弹出之后,还有任何机会再回到栈里吗?",
    },
    why: {
      en: "Each index is pushed exactly once and popped at most once, and a popped index never returns. So the whole scan performs at most 2n stack operations. The while loop inside the for loop looks like O(n²), but counting the total work over the whole run gives O(n). This is the same amortized argument as array resizing: do not measure the most expensive single step, measure the total.",
      zh: "每个下标恰好入栈 1 次、最多出栈 1 次,弹出后不会再回来。所以整趟扫描的栈操作次数不超过 2n。代码里 while 套在 for 里,看着像 O(n²),但把全程的总操作数加起来仍是 O(n)。这和数组扩容的均摊分析是同一招:不要盯着最贵的那一步,要算总账。",
    },
  },
];
