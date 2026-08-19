// 第 5 章 · 队列与双端队列 —— 题单与测验数据(English default / 中文可切换)。
// 题单从模拟铺到「前缀和 + 单调队列」Hard;hint 只给方向,key 一段话讲透最优解。
// 注:原题单中的 LC 346(数据流中的移动平均值)为会员题,已替换为 641 / 946。
//
// 双语:title / tags / hint / key / q / opts / why 全部写成 { en, zh },
// 题目标题的 en 用 LeetCode 官方英文名。

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

export const PROBLEMS: Problem[] = [
  {
    lc: 933,
    title: { en: "Number of Recent Calls", zh: "最近的请求次数" },
    d: "easy",
    tags: [
      { en: "Queue", zh: "队列" },
      { en: "Time window", zh: "时间窗口" },
    ],
    hint: {
      en: "Only requests from the last 3000 ms count. Which end do expired requests leave from, and which end do new requests enter?",
      zh: "只关心最近 3000ms 内的请求 —— 过期的请求从哪一端离开?新请求从哪一端进来?",
    },
    key: {
      en: (
        <>
          Add the new timestamp at the back. Then remove timestamps smaller than
          t − 3000 from the front, one at a time. The length of the queue is the
          answer. Timestamps arrive in increasing order, so the expired ones are
          always the oldest and always sit at the front. Each request enters and
          leaves once, so a call costs O(1) amortized. This is the smallest
          possible example of a sliding time window.
        </>
      ),
      zh: (
        <>
          新时间戳从队尾入队;然后把小于 t − 3000 的时间戳从队头逐个出队;
          队列长度就是答案。时间戳单调递增,所以过期的一定最老、一定聚在队头。
          每个请求进出队各一次,单次调用均摊 O(1)。这是「时间滑动窗口」的最小模型。
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
      en: "A new element joins at the back. How do you rotate it to the front so that it becomes the next one to leave?",
      zh: "新元素入队后排在队尾 —— 怎么让它「转」到队头,变成下一个出队的?",
    },
    key: {
      en: (
        <>
          On push, add the new element at the back, then dequeue the n − 1
          elements in front of it and enqueue them again. The queue rotates once
          and the new element ends up at the front, so pop becomes an ordinary
          dequeue. push is O(n) and pop is O(1). This problem is the mirror
          image of walkthrough A (LC 232); solving both makes the difference
          between the two orders clear.
        </>
      ),
      zh: (
        <>
          push 时先把新元素入队,再把它前面的 n − 1 个元素依次出队、重新入队:
          队列旋转一圈,新元素恰好转到队头 → pop 就是普通出队。push O(n)、pop
          O(1)。它与本章精讲 A(LC 232)互为镜像,一起做最能看清两种顺序的差别。
        </>
      ),
    },
  },
  {
    lc: 622,
    title: { en: "Design Circular Queue", zh: "设计循环队列" },
    d: "medium",
    tags: [
      { en: "Circular queue", zh: "循环队列" },
      { en: "Modulo", zh: "取模" },
    ],
    hint: {
      en: "The implementation in §04 of this chapter is exactly this problem. Write it yourself first, and go back only if you get stuck.",
      zh: "本章 §04 的手写实现就是这道题 —— 先自己写,卡住了再回去看。",
    },
    key: {
      en: (
        <>
          A fixed-length array plus a front and a rear index. Every step forward
          is <code>(i + 1) % cap</code>, so the index wraps back to 0 at the end
          of the array. Pick one of the two ways to tell full from empty: keep
          one slot empty (allocate k + 1 slots; full when (rear + 1) % cap ==
          front), or track a size counter. Every operation is O(1) and no
          element ever moves.
        </>
      ),
      zh: (
        <>
          定长数组 + front / rear 两个下标,前进一律 <code>(i + 1) % cap</code>{" "}
          绕回开头。满 / 空判定二选一:留一格空(开 k + 1 格,
          (rear+1)%cap==front 即满),或维护 size 计数器。所有操作 O(1),
          没有任何元素需要移动。
        </>
      ),
    },
  },
  {
    lc: 641,
    title: { en: "Design Circular Deque", zh: "设计循环双端队列" },
    d: "medium",
    tags: [
      { en: "Circular queue", zh: "循环队列" },
      { en: "Deque", zh: "deque" },
    ],
    hint: {
      en: "LC 622 with both ends open. How do you move an index one step backward without producing a negative value?",
      zh: "622 的加强版:两端都要能进出。下标往「后退」一步,怎么算才不会变成负数?",
    },
    key: {
      en: (
        <>
          Add the two missing directions to LC 622: inserting at the front moves
          front back one step and then writes, and deleting at the back moves
          rear back one step. The standard way to step backward is{" "}
          <code>(i - 1 + cap) % cap</code> — add cap before taking the
          remainder, because in Java and JavaScript <code>%</code> returns a
          negative result for a negative left operand. Finishing this problem
          means you have implemented the core of ArrayDeque.
        </>
      ),
      zh: (
        <>
          在 622 基础上补两个方向:队头插入 = front 先退一步再写,队尾删除 =
          rear 先退一步。后退的标准写法是 <code>(i − 1 + cap) % cap</code> ——
          先加 cap 再取模,因为 Java / JavaScript 的 <code>%</code>{" "}
          在被除数为负时结果也为负。写完它,就等于自行实现了 ArrayDeque
          的核心逻辑。
        </>
      ),
    },
  },
  {
    lc: 946,
    title: { en: "Validate Stack Sequences", zh: "验证栈序列" },
    d: "medium",
    tags: [
      { en: "Stack", zh: "栈" },
      { en: "Simulation", zh: "模拟" },
      { en: "Greedy", zh: "贪心" },
    ],
    hint: {
      en: "Do not reason about it, run it. Push in the order given by pushed, pop whenever you can, and see whether the whole sequence plays out.",
      zh: "别推理,直接演:按 pushed 顺序真的往栈里压,能弹就弹,看最后能不能演完。",
    },
    key: {
      en: (
        <>
          Simulate greedily. Push the elements of pushed one by one. After each
          push, while the top equals the current element of popped, pop it and
          advance the popped pointer. The sequence is valid if and only if the
          stack is empty at the end. Why is popping as early as possible
          correct? If you could pop an element and do not, later pushes bury it
          deeper, and it can never be popped at the right moment again. Time
          O(n), space O(n), and a good review of the previous chapter.
        </>
      ),
      zh: (
        <>
          贪心模拟:按 pushed 依次入栈;每次入栈后,只要栈顶等于 popped
          的当前元素就一直弹并推进 popped 指针。结束时栈空 ⇔ 序列合法。
          为什么「能弹就弹」是对的?能弹却不弹,后续入栈会把它压得更深,
          此后再也没有机会在正确的时刻弹出。时间 O(n)、空间 O(n),
          也是上一章栈的复习题。
        </>
      ),
    },
  },
  {
    lc: 649,
    title: { en: "Dota2 Senate", zh: "Dota2 参议院" },
    d: "medium",
    tags: [
      { en: "Queue", zh: "队列" },
      { en: "Greedy", zh: "贪心" },
      { en: "Round-based", zh: "循环处理" },
    ],
    hint: {
      en: "The best move for each senator is to ban the opponent who acts next. Rounds, and whoever comes first acts first — which structure keeps that order?",
      zh: "每个议员的最优策略是禁掉「下一个即将行动的对手」。回合制 + 先来先行动 → 用什么结构排班?",
    },
    key: {
      en: (
        <>
          Keep two queues holding the <b>indices</b> of the R senators and of
          the D senators. Each round, compare the two front indices. The smaller
          one acts first and survives, and it is enqueued again with index + n,
          which means it will act again in the next round. The larger one is
          banned and simply leaves. Repeat until one queue is empty. The queue
          keeps the order of who acts next without any extra bookkeeping. O(n).
        </>
      ),
      zh: (
        <>
          两个队列分别存 R、D 议员的<b>下标</b>:每轮取两队队头比较,
          下标小者先行动 → 存活,并以「下标 + n」重新入队(表示下一轮再来);
          下标大者被禁言,直接出队消失。直到一方清空。
          「下一个行动者」的顺序完全由队列维持,不需要额外记录。O(n)。
        </>
      ),
    },
  },
  {
    lc: 1438,
    title: {
      en: "Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit",
      zh: "绝对差不超过限制的最长连续子数组",
    },
    d: "medium",
    tags: [
      { en: "Sliding window", zh: "滑动窗口" },
      { en: "Two monotonic deques", zh: "双单调队列" },
    ],
    hint: {
      en: "The window is valid when max − min ≤ limit. A decreasing deque gives the window maximum. What gives the minimum?",
      zh: "窗口合法 ⇔ 窗口内 max − min ≤ limit。滑窗最大值用递减队列 —— 最小值呢?",
    },
    key: {
      en: (
        <>
          A sliding window with two monotonic deques. The decreasing deque gives
          the window maximum, and an increasing deque gives the window minimum.
          After extending the right end, shrink the left end while max − min
          &gt; limit, and remove from the front of both deques any index that
          has left the window. This is LC 239 with two orders kept at once over
          the same window. O(n).
        </>
      ),
      zh: (
        <>
          滑动窗口 + 两个单调队列:递减队列随时给出窗口 max,递增队列给出窗口
          min。右端扩张后,只要 max − min &gt; limit 就收缩左端,同时把已经
          离开窗口的下标从两个队头弹掉。它就是 LC 239
          的直接升级:同一个窗口,同时维护两套单调性。O(n)。
        </>
      ),
    },
  },
  {
    lc: 862,
    title: {
      en: "Shortest Subarray with Sum at Least K",
      zh: "和至少为 K 的最短子数组",
    },
    d: "hard",
    tags: [
      { en: "Prefix sum", zh: "前缀和" },
      { en: "Monotonic deque", zh: "单调队列" },
    ],
    hint: {
      en: "The array may contain negative numbers, so the window sum does not grow as the window grows and a plain sliding window fails. Turn it into prefix sums first: find P[r] − P[l] ≥ K with r − l as small as possible.",
      zh: "数组含负数,窗口和不随窗口变长而变大,普通滑窗失效。先转成前缀和:找 P[r] − P[l] ≥ K 且 r − l 最短。",
    },
    key: {
      en: (
        <>
          Keep an <b>increasing</b> monotonic deque of prefix-sum indices. At
          each r: (1) while the front satisfies P[r] − P[front] ≥ K, record the
          length and <b>remove the front</b>, because that left endpoint has
          already found its shortest partner and any later r would only give a
          longer subarray; (2) remove from the back every index with P[back] ≥
          P[r], because P[r] is both smaller and further right, so those indices
          can never be a better left endpoint again. The two rules use the two
          ends of the deque, which is exactly why this needs a deque and not a
          queue. O(n).
        </>
      ),
      zh: (
        <>
          对前缀和 P 维护<b>递增</b>单调队列。遍历 r 时:①只要队头满足 P[r] −
          P[队头] ≥ K,就记录长度并<b>弹出队头</b> ——
          这个左端点已经配到最短的搭档,再往后只会更长;②把队尾所有 P[队尾] ≥
          P[r] 的下标弹掉 —— P[r] 既更小又更靠右,它们不可能再成为更好的左端点。
          两条弹出规则正好用到 deque 的两端,这就是它必须是双端队列的原因。O(n)。
        </>
      ),
    },
  },
];

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
        zh: "O(log n) 来自树形结构「每步砍一半」。deque 两端操作只挪一个下标或改一个指针,是 O(1)。",
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
      zh: "JavaScript 标准库没有队列类型,shift() 一般情况下是 O(n)。双栈靠均摊、链表靠改指针、下标法靠「假装删除」,三者都把出队做到了 O(1)。刷题时下标法通常就够用:三行代码,没有额外心智负担。",
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
