// Chapter 9 · Heaps and priority queues — problem set (English default / Chinese toggle).
// The closing quiz is in lib/heap-quiz.tsx; /atlas imports only this file.
// Problem-set arc: Top-K threshold heap (703/973/692) → repeatedly taking the extreme (1046/767) →
// merging K sorted sources (378) → dual heaps (295/502). LC 295 is the centerpiece; its key covers it in depth.
//
// Problem titles use the official LeetCode English name; tags / hint / key are all { en, zh } pairs.

import type { Problem } from "@/lib/problems";

export const PROBLEMS: Problem[] = [
  {
    lc: 703,
    title: {
      en: "Kth Largest Element in a Stream",
      zh: "数据流中的第 K 大元素",
    },
    d: "easy",
    tags: [
      "Top-K",
      { en: "Min-heap of size k", zh: "容量 K 小根堆" },
    ],
    hint: {
      en: "This is LC 215 for a stream. A min-heap that holds exactly k elements fits data that arrives one item at a time.",
      zh: "这就是 LC 215 的「数据流版」——「容量 K 的小根堆」天生适合逐个到达的数据。",
    },
    key: {
      en: (
        <>
          In the constructor, push the initial array into a min-heap and keep
          its size at k. Each <code>add</code> pushes the new value and pops the
          root if the size passes k. The root is then the k-th largest value
          seen so far. Each <code>add</code> costs O(log k) and the space is
          O(k). Sorting does not work here, because a stream has no end: you
          never know how many values are still coming. The heap holds the k
          largest values seen so far, and the root is the entry threshold.
        </>
      ),
      zh: (
        <>
          构造时把初始数组压进一个小根堆,并把大小维持在 k;每次 <code>add</code>{" "}
          先入堆,超过 k 就弹掉堆顶。此时堆顶就是「迄今第 k 大」。单次 <code>add</code> 是 O(log k),空间 O(k)。这里不能靠排序:数据流没有「全部」—— 你永远不知道后面还来多少。堆里住着「迄今最大的 k 个」,堆顶就是入围门槛。
        </>
      ),
    },
  },
  {
    lc: 1046,
    title: { en: "Last Stone Weight", zh: "最后一块石头的重量" },
    d: "easy",
    tags: [
      { en: "Max-heap", zh: "大根堆" },
      { en: "Simulation", zh: "模拟" },
    ],
    hint: {
      en: "Every round needs the two heaviest stones, and a new stone may go back in. Which structure gives you the maximum at any moment while still accepting new values?",
      zh: "每回合都要「最重的两块」,而且还会塞回新值 —— 哪种结构能随时报出最大值,又允许不断插入?",
    },
    key: {
      en: (
        <>
          Push all stones into a max-heap. Each round, pop twice to get x ≥ y.
          If x ≠ y, push x − y back. Stop when at most one stone is left. Time
          O(n log n). In Java use{" "}
          <code>new PriorityQueue&lt;&gt;(Comparator.reverseOrder())</code>. In
          Python store every weight as a negative number, because{" "}
          <code>heapq</code> is a min-heap only up to Python 3.13. This problem
          is a good place to practise both max-heap tricks.
        </>
      ),
      zh: (
        <>
          全部石头入大根堆。每回合弹两次得到 x ≥ y;若 x ≠ y,把差值 x − y
          压回去,直到堆里剩下不超过一块。时间 O(n log n)。Java 用{" "}
          <code>new PriorityQueue&lt;&gt;(Comparator.reverseOrder())</code>;
          Python 因为 <code>heapq</code> 到 3.13 为止只有小根堆,全程存负数。这题正好把两种「大根堆写法」练熟。
        </>
      ),
    },
  },
  {
    lc: 973,
    title: { en: "K Closest Points to Origin", zh: "最接近原点的 K 个点" },
    d: "medium",
    tags: [
      "Top-K",
      { en: "Max-heap of size k", zh: "容量 K 大根堆" },
    ],
    hint: {
      en: "You want the k smallest distances, so the element to evict is the farthest one currently kept. Which kind of heap puts that element at the root?",
      zh: "要留下距离最小的 k 个,那么该被淘汰的是「当前 k 个里最远的」—— 哪种堆能把它放在堆顶?",
    },
    key: {
      en: (
        <>
          This is the mirror image of LC 215. For the k <b>smallest</b> values
          you need a <b>max-heap of size k</b>. Its root is the farthest point
          among the current candidates, so a new point only qualifies if it is
          closer than the root. Time O(n log k), which is better than sorting
          everything at O(n log n) when n is large and k is small. Compare
          squared distances and skip the square root: squaring is increasing for
          non-negative numbers, so it does not change the order. A common
          follow-up is quickselect, which is O(n) on average.
        </>
      ),
      zh: (
        <>
          与 LC 215 镜像:要前 k <b>小</b>,就用<b>容量 k 的大根堆</b>。堆顶是当前候选里最远的点,新点只有比它更近才有资格进来。时间 O(n log k),在 n 很大、k 很小时明显优于全排序的 O(n log n)。比较距离时用平方即可,不必开根号:平方在非负数上单调递增,不改变大小关系。常见追问是快速选择,平均 O(n)。
        </>
      ),
    },
  },
  {
    lc: 692,
    title: { en: "Top K Frequent Words", zh: "前 K 个高频单词" },
    d: "medium",
    tags: [
      { en: "Heap with a comparator", zh: "堆 + 自定义比较器" },
      { en: "Hash counting", zh: "哈希计数" },
    ],
    hint: {
      en: "Words with the same count are ordered alphabetically. The comparator must describe both keys, and the element that should be evicted must end up at the root.",
      zh: "频次相同要按字典序排 —— 比较器得同时说清两个维度,而且「最该被淘汰的」必须待在堆顶。",
    },
    key: {
      en: (
        <>
          Count the words with a hash map, then keep a min-heap of size k. The
          comparator orders by count ascending, and for equal counts by word{" "}
          <b>descending</b>. The second half looks backwards, but it is what
          puts the worst candidate at the root: lowest count, and among ties the
          alphabetically last word. That is exactly the element to evict. At the
          end, pop everything and reverse the result. Time O(n log k). This
          problem is the best exercise for comparator direction: always keep the
          element you would evict first at the root.
        </>
      ),
      zh: (
        <>
          先用哈希表计数,再维护一个容量 k 的小根堆。比较器按「频次升序;频次相同按单词字典序<b>降序</b>」。后半句看着反直觉,但正是它让「频次最低、且在并列里字典序最靠后」的那个最该淘汰的单词落到堆顶。最后逐个弹出并反转即可。时间 O(n log k)。这题是练「比较器方向感」的最佳题目:永远让最该被踢的元素待在堆顶。
        </>
      ),
    },
  },
  {
    lc: 378,
    title: {
      en: "Kth Smallest Element in a Sorted Matrix",
      zh: "有序矩阵中第 K 小的元素",
    },
    d: "medium",
    tags: [
      { en: "Merge k sorted lists", zh: "合并 K 路" },
      { en: "Min-heap", zh: "小根堆" },
    ],
    hint: {
      en: "Every row is already sorted, so an n-row matrix is an n-way merge. Think of LC 23.",
      zh: "每一行本身就是升序的 —— n 行矩阵就是 n 路归并,想想 LC 23。",
    },
    key: {
      en: (
        <>
          Push the first element of each row as (value, row, column) into a
          min-heap. Pop k − 1 times, and after each pop push the next element of
          the same row. The root at the k-th step is the answer. Time O(k log
          n). This is the merge-k-sorted-lists template applied directly. A
          strong follow-up is binary search on the value range: guess a value
          mid, count how many entries are ≤ mid in O(n), and narrow the range.
          That gives O(n log(max − min)). Being able to explain both is the goal.
        </>
      ),
      zh: (
        <>
          把每行的第一个元素以 (值, 行, 列) 的形式压进小根堆;弹 k − 1 次,每弹一次就把同一行的下一个元素补进来,第 k 次的堆顶就是答案。时间 O(k log n)。这是「合并 K 路」模板的直接复用。面试中更进一步的解法是值域二分:猜一个 mid,用 O(n) 数出 ≤ mid 的个数再收缩区间,可做到 O(n log(max − min))。能讲清这两种解法,才算真正掌握。
        </>
      ),
    },
  },
  {
    lc: 767,
    title: { en: "Reorganize String", zh: "重构字符串" },
    d: "medium",
    tags: [
      { en: "Greedy + max-heap", zh: "贪心 + 大根堆" },
      { en: "Counting", zh: "计数" },
    ],
    hint: {
      en: "At each step use the character that has the most left, but it must differ from the previous one. You need a structure that reports the current maximum after every update.",
      zh: "每一步都用「当前剩余最多的字符」,但不能和上一个相同 —— 需要一个每次更新后都能报出最大值的结构。",
    },
    key: {
      en: (
        <>
          Count the characters and push them into a max-heap keyed by the
          remaining count. Each round, pop the character with the most left and
          append it to the result, but <b>hold it aside</b> instead of pushing it
          back, so it cannot be used twice in a row. After the next round pops a
          different character, push the held one back if its count is still
          greater than 0. If any character appears more than (n + 1) / 2 times
          there is no answer: by the pigeonhole principle there are not enough
          gaps to separate them. Time O(n log 26). Repeatedly taking the maximum
          while the counts keep changing is exactly what a heap is for.
        </>
      ),
      zh: (
        <>
          先计数,再按剩余次数入大根堆。每轮弹出剩得最多的字符接到结果上,但<b>先不放回堆</b>,以免连着用两次;等下一轮弹出别的字符后,再把上一轮那个(次数减一后若仍大于 0)放回去。若某个字符出现次数超过 (n + 1) / 2 则无解 —— 鸽笼原理,间隔不够用。时间 O(n log 26)。「反复取最值,而且取完还要更新计数」正是堆的主场。
        </>
      ),
    },
  },
  {
    lc: 295,
    title: { en: "Find Median from Data Stream", zh: "数据流的中位数" },
    d: "hard",
    tags: [
      { en: "Two heaps", zh: "对顶双堆" },
      { en: "Must know", zh: "重点" },
    ],
    hint: {
      en: "The median splits the data in two. The left half only needs its maximum and the right half only needs its minimum. Two heaps, one for each half.",
      zh: "中位数把数据劈成两半:左半只关心最大值,右半只关心最小值 —— 两个堆,各管一半。",
    },
    key: {
      en: (
        <>
          <b>Two heaps facing each other.</b> A max-heap <code>small</code>{" "}
          holds the smaller half, so its root is the largest value on the left. A
          min-heap <code>large</code> holds the larger half, so its root is the
          smallest value on the right. Two invariants must hold: every element in{" "}
          <code>small</code> is ≤ every element in <code>large</code>, and the
          two sizes differ by at most 1 (let <code>small</code> be the larger one
          by convention). <code>addNum</code> is always the same three steps:
          push x into <code>small</code>, move the root of <code>small</code> into{" "}
          <code>large</code> (this restores the first invariant, because what
          moves is the largest value of the left half), and if{" "}
          <code>large</code> is now bigger, move its root back into{" "}
          <code>small</code> (this restores the second). Two heap operations, so
          O(log n). <code>findMedian</code> reads the root of{" "}
          <code>small</code> for an odd count, or averages the two roots for an
          even count, in O(1). A common follow-up is &quot;99% of the values are
          between 0 and 100&quot;: use a counting array with one extra bucket at
          each end and scan 101 buckets.
        </>
      ),
      zh: (
        <>
          <b>对顶堆。</b>大根堆 <code>small</code>{" "}
          存较小的一半,堆顶就是左半的最大值;小根堆 <code>large</code>{" "}
          存较大的一半,堆顶就是右半的最小值。两条不变量:
          <code>small</code> 的所有元素 ≤ <code>large</code> 的所有元素;两堆大小相差不超过 1(约定 <code>small</code> 可以多一个)。
          <code>addNum</code> 固定三步:先把 x 压入 <code>small</code>;再把 <code>small</code> 的堆顶搬去 <code>large</code>
          (这一步恢复第一条不变量,因为搬走的正是左半最大值);若 <code>large</code> 反而更多,再搬一个回 <code>small</code>
          (恢复第二条)。两次堆操作,O(log n)。
          <code>findMedian</code> 在总数为奇数时取 <code>small</code> 堆顶,偶数时取两个堆顶的平均,O(1)。常见追问「99% 的数据落在 0~100」→ 用计数数组,两端各加一个溢出桶,扫 101 个桶即可。
        </>
      ),
    },
  },
  {
    lc: 502,
    title: { en: "IPO", zh: "IPO" },
    d: "hard",
    tags: [
      { en: "Two heaps in sequence", zh: "双堆接力" },
      { en: "Greedy", zh: "贪心" },
    ],
    hint: {
      en: "Pick the most profitable project among those you can currently afford. Two conditions and two sort keys, which is more than one heap can track.",
      zh: "「在本金够得着的项目里,选利润最大的」—— 两个条件、两把排序标准,一个堆管不过来。",
    },
    key: {
      en: (
        <>
          Push all projects into a min-heap keyed by <b>capital required</b>.
          Then run k rounds. In each round, first move every project you can now
          afford into a max-heap keyed by <b>profit</b>. Capital never decreases,
          so a project moved once never has to move back. Then pop the most
          profitable project, do it, and add its profit to your capital. Every
          project enters and leaves each heap at most once, so the total is O(n
          log n). This is the &quot;two heaps in sequence&quot; template, where
          one heap holds candidates that are not yet unlocked. It is a completely
          different use of two heaps from LC 295.
        </>
      ),
      zh: (
        <>
          所有项目按<b>启动资本</b>入小根堆,然后做 k 轮:每轮先把「当前资本够得着」的项目全部搬进按<b>利润</b>排序的大根堆
          —— 资本只增不减,所以搬进去的项目不用再搬回来;再弹出利润最大的做掉,资本随之增加。每个项目在两个堆里各进出至多一次,合计 O(n log n)。这是「双堆接力」模板:一个堆存放还没解锁的候选。它和 LC 295 的对顶堆是两种完全不同的双堆用法。
        </>
      ),
    },
  },
];
