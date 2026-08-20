// 第 9 章 · 堆与优先队列 —— 题单与测验数据(English default / 中文可切换)。
// 题单主线:Top-K 门槛堆(703/973/692)→ 反复取最值(1046/767)→
// 合并 K 路(378)→ 双堆(295/502)。295 是本单的重点,key 里讲透。
//
// 题目标题用 LeetCode 官方英文名;tags / hint / key 都写成 { en, zh }。

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

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
          先入堆,超过 k 就弹掉堆顶。此时堆顶就是「迄今第 k 大」。
          单次 <code>add</code> 是 O(log k),空间 O(k)。
          这里不能靠排序:数据流没有「全部」—— 你永远不知道后面还来多少。
          堆里住着「迄今最大的 k 个」,堆顶就是入围门槛。
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
          <code>heapq</code> is a min-heap only. This problem is a good place to
          practise both max-heap tricks.
        </>
      ),
      zh: (
        <>
          全部石头入大根堆。每回合弹两次得到 x ≥ y;若 x ≠ y,把差值 x − y
          压回去,直到堆里剩下不超过一块。时间 O(n log n)。Java 用{" "}
          <code>new PriorityQueue&lt;&gt;(Comparator.reverseOrder())</code>;
          Python 因为 <code>heapq</code> 只有小根堆,全程存负数。
          这题正好把两种「大根堆写法」练熟。
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
      zh: "要留下距离最小的 k 个,那么该被踢掉的是「当前 k 个里最远的」—— 哪种堆能把它放在堆顶?",
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
          与 LC 215 镜像:要前 k <b>小</b>,就用<b>容量 k 的大根堆</b>。
          堆顶是当前候选里最远的点,新点只有比它更近才有资格进来。
          时间 O(n log k),在 n 很大、k 很小时明显优于全排序的 O(n log n)。
          比较距离时用平方即可,不必开根号:平方在非负数上单调递增,不改变大小关系。
          常见追问是快速选择,平均 O(n)。
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
          先用哈希表计数,再维护一个容量 k 的小根堆。比较器按「频次升序;
          频次相同按单词字典序<b>降序</b>」。后半句看着反直觉,但正是它让
          「频次最低、且在并列里字典序最靠后」的那个最该淘汰的单词落到堆顶。
          最后逐个弹出并反转即可。时间 O(n log k)。
          这题是练「比较器方向感」的最佳题目:永远让最该被踢的元素待在堆顶。
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
          把每行的第一个元素以 (值, 行, 列) 的形式压进小根堆;弹 k − 1 次,
          每弹一次就把同一行的下一个元素补进来,第 k 次的堆顶就是答案。
          时间 O(k log n)。这是「合并 K 路」模板的直接复用。
          面试加分项是值域二分:猜一个 mid,用 O(n) 数出 ≤ mid 的个数再收缩区间,
          可做到 O(n log(max − min))。两种都能讲清才算吃透。
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
          先计数,再按剩余次数入大根堆。每轮弹出剩得最多的字符接到结果上,
          但<b>先不放回堆</b>,以免连着用两次;等下一轮弹出别的字符后,
          再把上一轮那个(次数减一后若仍大于 0)放回去。
          若某个字符出现次数超过 (n + 1) / 2 则无解 —— 鸽笼原理,间隔不够用。
          时间 O(n log 26)。「反复取最值,而且取完还要更新计数」正是堆的主场。
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
          <b>对顶堆(本章压轴,务必讲透)。</b>大根堆 <code>small</code>{" "}
          存较小的一半,堆顶就是左半的最大值;小根堆 <code>large</code>{" "}
          存较大的一半,堆顶就是右半的最小值。两条不变量:
          <code>small</code> 的所有元素 ≤ <code>large</code> 的所有元素;
          两堆大小相差不超过 1(约定 <code>small</code> 可以多一个)。
          <code>addNum</code> 固定三步:先把 x 压入 <code>small</code>;
          再把 <code>small</code> 的堆顶搬去 <code>large</code>
          (这一步恢复第一条不变量,因为搬走的正是左半最大值);
          若 <code>large</code> 反而更多,再搬一个回 <code>small</code>
          (恢复第二条)。两次堆操作,O(log n)。
          <code>findMedian</code> 在总数为奇数时取 <code>small</code> 堆顶,
          偶数时取两个堆顶的平均,O(1)。
          常见追问「99% 的数据落在 0~100」→ 用计数数组,两端各加一个溢出桶,
          扫 101 个桶即可。
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
          所有项目按<b>启动资本</b>入小根堆,然后做 k 轮:
          每轮先把「当前资本够得着」的项目全部搬进按<b>利润</b>排序的大根堆
          —— 资本只增不减,所以搬进去的项目不用再搬回来;
          再弹出利润最大的做掉,资本随之增加。
          每个项目在两个堆里各进出至多一次,合计 O(n log n)。
          这是「双堆接力」模板:一个堆存放还没解锁的候选。
          它和 LC 295 的对顶堆是两种完全不同的双堆用法。
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "multi",
    q: {
      en: "Which of these does a min-heap guarantee? (Select all that apply.)",
      zh: "一个小根堆能保证以下哪些事?(多选)",
    },
    opts: [
      {
        en: "The root is the smallest value in the whole heap.",
        zh: "堆顶是全场最小值",
      },
      {
        en: "Every parent is ≤ each of its children.",
        zh: "每个父结点 ≤ 它的每个孩子",
      },
      { en: "The left child is ≤ the right child.", zh: "左孩子 ≤ 右孩子" },
      {
        en: "The underlying array is sorted from start to end.",
        zh: "底层数组从头到尾是升序的",
      },
    ],
    correct: [0, 1],
    missHint: {
      en: "A heap promises two related things: the root holds the minimum, and every parent-child pair is ordered. You left one of them out.",
      zh: "堆的承诺其实是相关的两条:堆顶是最小值,以及每一对父子有序。你漏掉了其中一条。",
    },
    extraHint: {
      en: "Siblings are not constrained at all, and the array only satisfies the heap order, not full sorted order. Remove C or D.",
      zh: "兄弟之间没有任何约束,底层数组也只满足「堆序」而不是「全序」—— 把 C 或 D 去掉。",
    },
    why: {
      en: "A heap maintains one rule: parent ≤ child. The root being the minimum follows from that rule. Siblings in any order and an unsorted array are both perfectly legal. Fewer promises means cheaper maintenance: O(log n) per update instead of O(n log n) for a full sort.",
      zh: "堆只维护一条规则:父 ≤ 子。「堆顶最小」是这条规则的推论。兄弟乱序、数组乱序都完全合法。承诺越少,维护越便宜:单次更新 O(log n),而不是全排序的 O(n log n)。",
    },
  },
  {
    type: "fill",
    q: {
      en: "A heap is stored in an array. What is the index of the parent of index 7?",
      zh: "用数组存堆,下标 7 的结点,它父结点的下标是?",
    },
    placeholder: { en: "Type an index…", zh: "输入下标…" },
    answers: ["3"],
    hint: {
      en: "parent = (i − 1) / 2 with integer division, so (7 − 1) / 2 = ?",
      zh: "parent = (i − 1) / 2,整数除法向下取整:(7 − 1) / 2 = ?",
    },
    why: {
      en: "(7 − 1) / 2 = 3. Check it the other way: the children of 3 are 2 × 3 + 1 = 7 and 2 × 3 + 2 = 8. A complete binary tree numbered level by level has no gaps, so parent and child links do not need pointers. All three positions are computed from the index, the same idea as computing an array element's address.",
      zh: "(7 − 1) / 2 = 3;反过来验证:3 的孩子是 2 × 3 + 1 = 7 和 2 × 3 + 2 = 8。完全二叉树按层编号没有空洞,所以父子关系不需要指针,三个位置全靠下标算出来 —— 和数组按下标算地址是同一个思想。",
    },
  },
  {
    type: "choice",
    q: {
      en: "push and pop are O(log n). What is the reason?",
      zh: "push / pop 的复杂度是 O(log n),根本原因是?",
    },
    opts: [
      {
        en: "Sifting up or down follows one path between a leaf and the root, and a complete binary tree of n nodes has height ⌊log₂n⌋.",
        zh: "上浮 / 下沉最多走一条根与叶之间的路径,而 n 个结点的完全二叉树高度是 ⌊log₂n⌋",
      },
      {
        en: "Each operation scans half of the array.",
        zh: "每次操作要扫描一半的数组",
      },
      {
        en: "Each operation sorts the heap again.",
        zh: "每次操作后要把堆重新排序",
      },
      {
        en: "It is really O(1), because only the root or the last slot changes.",
        zh: "其实是 O(1),因为只动堆顶或堆尾",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Sifting follows a single chain: each comparison moves one level up or down. It never scans all the elements on a level.",
        zh: "上浮 / 下沉走的是一条链:每比较一次就上或下一层,不会横着扫完某一层的所有元素。",
      },
      {
        en: "A heap never sorts itself. It only repairs the one parent-child chain that was broken and leaves everything else untouched.",
        zh: "堆从不做全排序,它只修复被破坏的那一条父子链,其余部分原封不动。",
      },
      {
        en: "Writing into the last slot or reading the root is indeed O(1), but the heap order still has to be repaired afterwards, and that path is as long as the height of the tree.",
        zh: "写进堆尾、读取堆顶本身确实是 O(1),但之后必须上浮 / 下沉恢复堆序,那条路径的长度就是树高。",
      },
    ],
    why: {
      en: "A complete binary tree with n nodes has height ⌊log₂n⌋. Every swap moves the element one level, so the number of swaps is at most the height. All of the heap's speed comes from the tree being short.",
      zh: "n 个结点的完全二叉树高度是 ⌊log₂n⌋,每次交换让元素上或下移一层,所以交换次数不超过树高。堆的全部效率都来自「完全二叉树够矮」。",
    },
  },
  {
    type: "choice",
    q: {
      en: "To find the k-th largest element of an array, which heap does the standard solution use?",
      zh: "求数组中「第 K 大」的元素,标准堆解法用哪种堆?",
    },
    opts: [
      {
        en: "A min-heap of size k. Its root is the entry threshold, and a new value only enters if it is larger.",
        zh: "容量 K 的小根堆 —— 堆顶是入围门槛,新数比门槛大才进",
      },
      { en: "A max-heap of size k.", zh: "容量 K 的大根堆" },
      {
        en: "Put every element into a max-heap, then pop k times.",
        zh: "全部元素入大根堆,连续弹 K 次",
      },
      {
        en: "Put every element into a min-heap, then pop n − k times.",
        zh: "全部元素入小根堆,连续弹 n−K 次",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A max-heap of size k evicts the largest of the k it holds, so you would end up with the k smallest values. That direction solves the k smallest, not the k largest.",
        zh: "容量 K 的大根堆每次踢掉的是「这 K 个里最大的」,最后剩下的是 K 个最小值 —— 方向反了。求前 K 小才用大根堆。",
      },
      {
        en: "This works, but every element goes into the heap: O(n) space and O(n + k log n) time. In a stream you cannot store everything, while the size-k heap needs only O(k) space.",
        zh: "这样做能得到正确答案,但所有元素都入堆:空间 O(n),时间 O(n + K log n);数据流场景根本存不下全部,而容量 K 的方案只要 O(K) 空间。",
      },
      {
        en: "This also stores all n elements, so O(n) space, and popping n − k times costs more than maintaining a heap of size k.",
        zh: "同样要把 n 个元素全部入堆,空间 O(n);弹 n−K 次也比维护容量 K 的堆更贵。",
      },
    ],
    why: {
      en: "The heap holds the k largest values seen so far. When a better value arrives, the one to evict is the smallest of those k, so you need to read that smallest value at any moment, and that is a min-heap. The root is both the weakest survivor and the current answer for the k-th largest.",
      zh: "堆里住着「迄今最大的 K 个」。有更强的新数进来时,该踢的是这 K 个里最小的,所以你要能随时读到这个最小值 —— 那就是小根堆。堆顶既是最弱的幸存者,也是当前的第 K 大。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Python's heapq is a min-heap only. What is the usual way to get a max-heap?",
      zh: "Python 的 heapq 只有小根堆,想要大根堆的惯用技巧是?",
    },
    opts: [
      {
        en: "Store the negation of every value, and negate again when you pop.",
        zh: "所有数取负存入,弹出时再取负还原",
      },
      {
        en: "Call heapq.maxheap() to switch mode.",
        zh: "调用 heapq.maxheap() 切换模式",
      },
      {
        en: "Pass reverse=True to heappush.",
        zh: "给 heappush 传 reverse=True",
      },
      {
        en: "Call sort(reverse=True) first, then use the list as a heap.",
        zh: "先 sort(reverse=True) 再当堆用",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "There is no such function. heapq is a set of functions that operate on a plain list, not a class, and it has no max-heap switch.",
        zh: "heapq 没有这个函数 —— 它是一组操作 list 的函数,不是类,更没有大根堆开关。",
      },
      {
        en: "reverse is a parameter of sorted and list.sort. heappush does not accept it.",
        zh: "reverse 是 sorted / list.sort 的参数,heappush 不认识它。",
      },
      {
        en: "Sorting happens once. As soon as a new element is pushed the order is broken again, and sorting costs O(n log n) per update instead of O(log n).",
        zh: "排序是一次性的:新元素进来后有序性立刻失效,而且每次更新 O(n log n) 比堆的 O(log n) 贵得多。",
      },
    ],
    why: {
      en: "Negation maps the largest value to the smallest, so the min-heap does the work unchanged. For compound elements, negate the sort key inside a tuple, such as (-freq, word). Strings cannot be negated, so for a text key you need another approach, such as a wrapper class that defines its own comparison.",
      zh: "取负把「最大」映射成「最小」,小根堆照常工作。复合元素则把排序键取负打包成元组,如 (-freq, word)。注意字符串不能取负 —— 那种情况要换办法,例如写一个自定义比较逻辑的包装类。",
    },
  },
  {
    type: "choice",
    q: {
      en: "You already have n elements in an array. What is the best way to turn them into a heap, and at what cost?",
      zh: "把 n 个已有元素建成堆,最优做法和复杂度是?",
    },
    opts: [
      {
        en: "Sift down from the last internal node backwards to index 0 (Floyd's method), O(n).",
        zh: "从最后一个父结点倒着逐个下沉(Floyd 建堆),O(n)",
      },
      {
        en: "Push them one by one into an empty heap, O(n log n), and that is already optimal.",
        zh: "逐个 push 进空堆,O(n log n),这已是最优",
      },
      {
        en: "Sort the array first and use it directly as a heap, O(n log n).",
        zh: "先排序再直接当堆用,O(n log n)",
      },
      { en: "Any method is O(log n).", zh: "无论怎么做都是 O(log n)" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Pushing one by one is correct and is O(n log n), but it is not the best. Sifting down from the bottom up saves the log factor.",
        zh: "逐个 push 确实可行,也确实是 O(n log n),但不是最优 —— 自底向上下沉能省掉一个 log。",
      },
      {
        en: "A sorted ascending array is a valid min-heap, but sorting itself costs O(n log n), which is more work than the heap property requires.",
        zh: "升序数组确实是合法的小根堆,但排序本身就要 O(n log n),做了远超堆序所需的工作。",
      },
      {
        en: "Just looking at each of the n elements once already costs O(n), so no method can be faster than O(n).",
        zh: "光把 n 个元素各看一眼就要 O(n),总复杂度不可能低于 O(n)。",
      },
    ],
    why: {
      en: "About half of the nodes are leaves and sift down 0 levels, about a quarter sift down at most 1 level, about an eighth at most 2, and so on. The nodes that could move far are the rare ones. The total is Σ d · n / 2^(d+1), which sums to at most n, so building the heap is O(n). Python's heapq.heapify does exactly this.",
      zh: "大约一半的结点是叶子,下沉 0 步;上一层约 1/4 最多沉 1 步;再上一层约 1/8 最多沉 2 步……能沉得深的结点恰恰最稀少。总步数 Σ d · n / 2^(d+1) 加起来不超过 n,所以建堆是 O(n)。Python 的 heapq.heapify 用的就是这个方法。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In Java, what order does for (int x : priorityQueue) produce?",
      zh: "Java 里 for (int x : priorityQueue) 遍历,输出顺序是?",
    },
    opts: [
      {
        en: "No useful order is guaranteed. To read the elements in order you must call poll() repeatedly.",
        zh: "不保证任何有用的顺序 —— 想要有序只能连续 poll()",
      },
      {
        en: "Ascending, since it is called a priority queue.",
        zh: "从小到大(它毕竟叫优先队列)",
      },
      { en: "Descending.", zh: "从大到小" },
      { en: "The same order the elements were added.", zh: "与插入顺序相同" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "The iterator walks the backing array, and that array only satisfies the heap order: parents before children, with no rule between siblings or cousins. Printing [1, 3, 2, 7, 4] is completely normal.",
        zh: "迭代器走的是底层数组,而数组只满足「堆序」:父子有序,兄弟和堂兄弟之间可以任意排列 —— 打印出 [1, 3, 2, 7, 4] 完全正常。",
      },
      {
        en: "Same reason: the array of a max-heap only guarantees the parent-child relation, not a descending sequence.",
        zh: "同理,大根堆的数组同样只保证父子关系,不是降序序列。",
      },
      {
        en: "Insertion already triggers sift-up swaps, so the arrival order is destroyed as elements are added.",
        zh: "元素入队时就经历了上浮交换,插入顺序早已被打乱。",
      },
    ],
    why: {
      en: "The only promise a heap makes is that the root is the extreme value. To get a sorted sequence, call poll() in a loop, at O(log n) each. If you need ordered access all the time, a heap is the wrong structure; use a TreeMap or sort once. This is the most common mistake with PriorityQueue in practice.",
      zh: "堆的承诺只有「堆顶是最值」。需要有序序列就循环 poll(),每次 O(log n)。如果你一直需要有序访问,那说明选错了结构 —— 该用 TreeMap 或一次性排序。这是 PriorityQueue 在实战中最容易出错的地方。",
    },
  },
];
