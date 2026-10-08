// Chapter 5 · Queues and deques — problem set (English default / Chinese toggle).
// The closing quiz is in lib/queue-quiz.tsx; /atlas imports only this file.
// Problems ramp from plain simulation up to a "prefix sum + monotonic queue" Hard; hint points a
// direction only, key explains the optimal solution in one paragraph.
// Note: LC 346 (Moving Average from Data Stream) in the original set is premium-only and has been
// replaced by 641 / 946.
//
// Bilingual: title / tags / hint / key are all written as { en, zh },
// and the en side of each problem title uses the official LeetCode English name.

import type { Problem } from "@/lib/problems";

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
