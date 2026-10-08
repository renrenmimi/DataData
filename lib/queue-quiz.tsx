// Chapter 5 · Queues and deques — closing quiz (the problem set is in lib/queue-problems.tsx).
//
// Bilingual: every question, option and explanation is a { en, zh } pair.

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "What does FIFO (First In, First Out) mean for a queue?",
      zh: "队列的 FIFO(First In, First Out)指的是?",
    },
    opts: [
      {
        en: "The element that entered first is removed first: elements enter at the back and leave at the front",
        zh: "最先入队的最先出队 —— 队尾进、队头出,两端各司其职",
      },
      {
        en: "The element that entered last is removed first",
        zh: "最后入队的最先出队",
      },
      {
        en: "Elements leave in order of value, smallest first",
        zh: "元素按值从小到大出队",
      },
      {
        en: "Insertion and removal both happen at the same end",
        zh: "进和出都发生在同一端",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Last in, first out (LIFO) is the stack from the previous chapter. A queue removes the element that has waited longest.",
        zh: "后进先出(LIFO)是上一章的栈。队列取走的是等待最久的那个元素。",
      },
      {
        en: "Leaving in order of value is a priority queue, or heap (chapter 9). A plain queue only looks at arrival order, never at the value.",
        zh: "按值出场的是优先队列 / 堆(第 9 章)。普通队列只看到达顺序,不看元素大小。",
      },
      {
        en: "One end for both is the design of a stack. A queue uses two ends: the back only accepts, the front only releases.",
        zh: "同一端进出是栈的设计。队列开两个口:队尾只进,队头只出。",
      },
    ],
    why: {
      en: "A queue adds at the back and removes at the front, so the element removed is always the one that has waited longest. Separating the two ends is the only difference from a stack, and it is what makes the order of service match the order of arrival.",
      zh: "队列从队尾加入、从队头取出,所以取走的永远是等待最久的那个元素。进出分居两端是它与栈唯一、也是根本的区别 —— 由此才有「处理顺序 = 到达顺序」。",
    },
  },
  {
    type: "choice",
    q: {
      en: "A circular queue runs rear = (rear + 1) % capacity on enqueue. What is the modulo for?",
      zh: "循环队列入队时执行 rear = (rear + 1) % capacity,取模是为了?",
    },
    opts: [
      {
        en: "So the index wraps back to 0 at the end of the array and reuses the slots freed by dequeue, without moving elements and without wasting space",
        zh: "让下标越过数组末尾时绕回 0,复用出队腾出的格子 —— 不搬移元素,也不浪费空间",
      },
      {
        en: "To spread elements out evenly and avoid hash collisions",
        zh: "把元素打散均匀分布,防止哈希冲突",
      },
      {
        en: "To turn the index into a random number, which is safer",
        zh: "把下标变成随机数,更安全",
      },
      { en: "Because modulo is faster than addition", zh: "取模运算比加法更快" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Hash collisions belong to hash tables (chapter 6). Here the modulo only folds a straight line into a logical circle, and the position of every element stays fully determined.",
        zh: "哈希冲突是哈希表(第 6 章)的话题。这里取模只是把「一条直线」在逻辑上折成「一个圈」,元素位置完全确定。",
      },
      {
        en: "There is nothing random about it. In an 8-slot array the slot after index 7 is always 0, and that predictability is what makes it usable as a queue.",
        zh: "取模结果毫无随机性:8 格数组里,下标 7 的下一格永远是 0 —— 正因为可预测,它才能当队列用。",
      },
      {
        en: "Modulo is in fact slower than addition. What it buys is the wraparound, not speed.",
        zh: "取模其实比加法慢。用它买的是「绕圈复用」这个语义,不是速度。",
      },
    ],
    why: {
      en: "The array is physically straight, and % sends the index back to 0 when it runs off the end. The slots that dequeue frees at the front are reused when rear comes around. Dequeue then only moves an index, so it is O(1), and no space is wasted. One modulo removes both problems of the naive array queue.",
      zh: "数组物理上是直的,% 让下标走到尽头就回 0:front 出队腾出的旧格子,rear 绕一圈回来复用。于是出队只挪下标,O(1),空间也零浪费 —— 一个取模同时解决朴素数组队列的两个问题。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In a circular queue, front == rear. Is the queue full or empty?",
      zh: "循环队列中 front == rear 时,队列是满还是空?",
    },
    opts: [
      {
        en: "You cannot tell from the indices alone, so the design has to resolve it: either keep one slot empty (full when rear + 1 reaches front) or track a size counter",
        zh: "光看下标分不清 —— 所以设计上必须消歧:要么留一格空(满 = rear + 1 追上 front),要么维护 size 计数器",
      },
      { en: "Always empty", zh: "一定是空" },
      { en: "Always full", zh: "一定是满" },
      { en: "That state can never happen", zh: "这种状态不可能出现" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A new queue does start with front == rear and is empty. But if you keep enqueueing, rear travels a full circle and meets front again, and at that moment the queue is full. The same index state, two different meanings.",
        zh: "刚创建时 front == rear 确实是空;但只进不出让 rear 绕整整一圈,追上 front 的那一刻是满 —— 同一个下标状态,两种含义。",
      },
      {
        en: "The counterexample is simpler: a queue that was just created has front == rear and holds nothing at all.",
        zh: "反例更简单:刚创建的队列 front == rear,一个元素都没有。",
      },
      {
        en: "Both empty and full lead to front == rear. It not only happens, it is the central ambiguity a circular queue has to resolve explicitly.",
        zh: "空和满都会走到 front == rear。它不但会出现,还是循环队列设计里必须显式消解的核心歧义。",
      },
    ],
    why: {
      en: "Empty means front caught up with rear; full means rear travelled a full circle and caught up with front. The two index states are identical, so the design has to break the tie. Scheme A keeps one slot permanently empty and needs no extra variable; scheme B keeps a size counter and can use every slot, at the cost of updating size on every operation. RingLab lets you switch between the two.",
      zh: "空是 front 追上 rear,满是 rear 绕一圈追上 front —— 下标状态完全相同,必须由设计来消歧。方案 A 留一格空,不需要额外变量,代价是牺牲一格;方案 B 维护 size 计数器,格子全能用,代价是每次进出都要更新 size。RingLab 里可以来回切换体验。",
    },
  },
  {
    type: "choice",
    q: {
      en: "What is the cost of inserting and removing at both ends of a deque?",
      zh: "双端队列 deque 在两端插入 / 删除的复杂度是?",
    },
    opts: [
      {
        en: "O(1) at both ends, using a circular array or a linked list of blocks, but reaching an element in the middle is not what it is built for",
        zh: "两端都是 O(1)(循环数组或块状链表实现),但访问中间的元素不是它擅长的事",
      },
      { en: "O(1) at the front, O(n) at the back", zh: "队头 O(1),队尾 O(n)" },
      { en: "O(log n) at both ends", zh: "两端都是 O(log n)" },
      {
        en: "The same as a plain array: O(n) at the front",
        zh: "和普通数组一样:头部 O(n)",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "The point of a deque is that the two ends are equal. Java ArrayDeque uses a circular array and Python deque uses a doubly linked list of blocks, so neither end requires moving elements.",
        zh: "deque 的意义就在两端平权:Java ArrayDeque 用循环数组、Python deque 用块状双向链表 —— 哪一端操作都不需要移动元素。",
      },
      {
        en: "O(log n) comes from tree-shaped structures that halve the work at each step. A deque only moves an index or relinks a node at the end, which is O(1).",
        zh: "O(log n) 来自树形结构「每步减半」。deque 两端操作只挪一个下标或改一个指针,是 O(1)。",
      },
      {
        en: "O(n) at the front is exactly the shifting cost of a plain array, and removing it is the reason a deque exists.",
        zh: "「头部 O(n)」正是朴素数组的搬移成本 —— deque 存在的意义就是消灭它。",
      },
    ],
    why: {
      en: "A deque (double-ended queue) allows insertion and removal at both ends in O(1). Use one end only and it behaves as a stack; add at one end and remove at the other and it behaves as a queue. One container covers both, which is why ArrayDeque is the recommended type for a stack and for a queue in Java.",
      zh: "deque(double-ended queue)两端插入、删除都是 O(1)。只用一端 = 栈,一端进另一端出 = 队列 —— 一个容器分饰两角,这也是 Java 里栈和队列都推荐用 ArrayDeque 的原因。",
    },
  },
  {
    type: "multi",
    q: {
      en: "You need a queue in JavaScript. Which of these keep dequeue at O(1)? (select all)",
      zh: "在 JavaScript 里需要一个队列,哪些做法能保住出队 O(1)?(多选)",
    },
    opts: [
      {
        en: "Two stacks: in takes every push, out serves every pop, amortized O(1)",
        zh: "双栈模拟:in 收 push,out 管 pop,均摊 O(1)",
      },
      {
        en: "A hand-written linked queue: remove at head, add at tail",
        zh: "手写链表队列:head 出、tail 进",
      },
      {
        en: "A head index that only moves forward, so no element is really removed",
        zh: "下标法:维护一个只前移的 head 下标,不真正删除元素",
      },
      { en: "Array.prototype.shift()", zh: "直接用 Array.prototype.shift()" },
    ],
    correct: [0, 1, 2],
    missHint: {
      en: "A, B, and C all avoid removing from the front of an array. Work out how each one avoids it, then add the option you left out.",
      zh: "A、B、C 三种做法都避开了「从数组头部删除」—— 想清楚各自是怎么避开的,再补上漏掉的那个。",
    },
    extraHint: {
      en: "D is the one to avoid: shift() removes the first element and then moves every remaining element one position left, which is O(n) in general.",
      zh: "D 正是要避开的做法:shift() 抽走第一个元素后,剩余元素整体前移一格,一般情况下是 O(n)。",
    },
    why: {
      en: "The JavaScript standard library has no queue type, and shift() is O(n) in general. Two stacks pay for it by amortization, a linked list unlinks a node, and the head index only pretends to remove. All three give O(1) dequeue. For interview code the head index is usually enough: three lines and nothing to remember.",
      zh: "JavaScript 标准库没有队列类型,shift() 一般情况下是 O(n)。双栈靠均摊、链表靠改指针、下标法靠「假装删除」,三者都把出队做到了 O(1)。做题时下标法通常就够用:三行代码,没有额外心智负担。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In a monotonic deque (take sliding window maximum, LC 239), what does the deque hold?",
      zh: "单调队列(以滑动窗口最大值 LC 239 为例)在队列里维护的是什么?",
    },
    opts: [
      {
        en: "Indices of the elements that can still become a maximum, with their values decreasing from front to back; the front is the maximum of the current window, and before a new element enters, every index at the back whose value is not greater is removed",
        zh: "「还有机会成为最大值」的下标,对应的值从队头到队尾递减;队头就是当前窗口的最大值,新元素入队前把队尾所有值不大于它的下标弹出",
      },
      {
        en: "Every element of the window, with nothing left out",
        zh: "窗口内的所有元素,一个不漏",
      },
      {
        en: "A sorted copy of the window, smallest first",
        zh: "窗口内元素排好序的副本(从小到大)",
      },
      {
        en: "Only one number: the current maximum of the window",
        zh: "只存当前窗口的最大值这一个数",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Keeping everything makes it an ordinary queue, and finding the maximum would still take O(k) per window. Discarding the elements that can never be a maximum is the whole point.",
        zh: "全都留下就退化成普通队列,每个窗口查最大值仍要 O(k)。大胆丢掉「永远当不上最大」的元素,才是单调队列的精髓。",
      },
      {
        en: "Maintaining a fully sorted copy costs at least O(log k) per insertion and removal, which is what a balanced tree or a heap does. A monotonic deque only uses O(1) operations at the two ends.",
        zh: "维护完整有序副本,插入删除至少 O(log k)(那是平衡树 / 堆的做法);单调队列只用两端的 O(1) 操作。",
      },
      {
        en: "With only one number stored, there is no successor to take over when the maximum leaves the window. The whole chain of candidates has to be kept.",
        zh: "只存一个数,等最大值滑出窗口时就没有「第二名」接班了 —— 必须保留整条候选链。",
      },
    ],
    why: {
      en: "Two rules. First, an index whose value is not greater than the incoming value is removed from the back, because the new element is both larger and stays in the window longer, so the older index can never be a maximum again. Second, an index that has left the window is removed from the front. One end drops weaker candidates and the other drops expired ones, so the structure has to be a deque. The front is always the maximum of the current window, and reading it costs O(1).",
      zh: "两条规则:①值不大于新元素的下标从队尾弹出 —— 新元素既更大、又比它们更晚离开窗口,它们不可能再成为最大值;②已经离开窗口的下标从队头弹出。一端淘汰更弱的候选、一端清掉过期的,所以它必须是双端队列。队头始终是当前窗口的最大值,取答案 O(1)。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          In the two-stack queue (LC 232), each element is moved at most 4 times
          in its whole life (into in, out of in, into out, out of out). So the
          amortized cost of one dequeue is O(___)?
        </>
      ),
      zh: (
        <>
          双栈模拟队列(LC 232)中,每个元素一生最多被搬动 4 次(进 in、出
          in、进 out、出 out),所以出队的均摊复杂度是 O(___)?
        </>
      ),
    },
    placeholder: { en: "Type the complexity…", zh: "填复杂度…" },
    answers: ["1", "O(1)", "o(1)", "(1)", "常数", "constant"],
    hint: {
      en: "Spread a total of at most 4n moves over n calls. What is the average cost of one call?",
      zh: "把「总共不超过 4n 次搬动」摊到 n 次调用上,平均每次是多少?",
    },
    why: {
      en: "A single pop occasionally has to move all of in into out, and that one call costs O(n). But each element is moved across only once, because the transfer never runs while out is not empty. The total for n calls is at most 4n moves, so the average is constant: O(1) amortized. Array growth and the monotonic stack are counted the same way — look at the total, not at the most expensive single call.",
      zh: "单次 pop 偶尔要把 in 整体转移进 out,那一次是 O(n)。但每个元素只会被转移一次,因为 out 非空时绝不倒栈。n 次调用总搬动 ≤ 4n,平均下来是常数,即均摊 O(1)。数组扩容、单调栈用的是同一本账:看总账,而不是盯最贵的那一次。",
    },
  },
];
