// Chapter 1 · Arrays — problem set.
// The closing quiz is in lib/array-quiz.tsx; /atlas imports only this file.
// Problems are high-frequency array questions from LeetCode Hot 100 / NeetCode 150, ramping
// from Easy to Hard; hint points a direction without spoilers, key explains the optimal
// solution in one paragraph.
//
// Bilingual: title / tags / hint / key come in { en, zh } pairs;
// the en side of each problem title uses the official LeetCode English name.

import type { Problem } from "@/lib/problems";

const TAG = {
  twoPointers: { en: "Two pointers", zh: "双指针" },
  inPlace: { en: "In place", zh: "原地" },
  binarySearch: { en: "Binary search", zh: "二分" },
  template: { en: "Template problem", zh: "模板题" },
  boundary: { en: "Finding a boundary", zh: "找边界" },
  backToFront: { en: "Back to front", zh: "从后往前" },
  onePass: { en: "One pass", zh: "一次遍历" },
  prefixExtreme: { en: "Prefix minimum", zh: "前缀最值" },
  opposite: { en: "Pointers moving inward", zh: "对撞指针" },
  sorted: { en: "Sorted input", zh: "有序" },
  prefixProduct: { en: "Prefix product", zh: "前缀积" },
  twoPasses: { en: "Two passes", zh: "两次遍历" },
  dp: { en: "Dynamic programming", zh: "动态规划" },
  sorting: { en: "Sorting", zh: "排序" },
  intervals: { en: "Intervals", zh: "区间" },
  dedup: { en: "Removing duplicates", zh: "去重" },
  reverse: { en: "Reversal", zh: "翻转" },
  matrix: { en: "Matrix", zh: "矩阵" },
  simulation: { en: "Simulation", zh: "模拟" },
  markInPlace: { en: "Marking in place", zh: "原地标记" },
  precompute: { en: "Precomputation", zh: "预计算" },
};

export const PROBLEMS: Problem[] = [
  {
    lc: 26,
    title: {
      en: "Remove Duplicates from Sorted Array",
      zh: "删除有序数组中的重复项",
    },
    d: "easy",
    tags: [TAG.twoPointers, TAG.inPlace],
    hint: {
      en: "The array is sorted, so equal values are always neighbors. Let one pointer read and another pointer write.",
      zh: "数组已排序,相等的元素一定挨在一起。一个指针负责读,一个指针负责写。",
    },
    key: {
      en: (
        <>
          Two pointers in the same direction: fast reads every element, and slow
          marks the slot where the next distinct value belongs. When nums[fast]
          differs from nums[slow-1], write it at slow and move slow forward. O(n)
          time and O(1) extra space. This is the in-place compaction template,
          and LC 27 and LC 283 are variations of it.
        </>
      ),
      zh: (
        <>
          同向双指针:fast 逐个读,slow 指向「下一个不重复元素该放的位置」。当
          nums[fast] ≠ nums[slow-1] 时写入 slow 并前移。时间 O(n)、额外空间 O(1)
          —— 这是「原地压缩」模板,LC 27 和 283 都是它的变体。
        </>
      ),
    },
  },
  {
    lc: 27,
    title: { en: "Remove Element", zh: "移除元素" },
    d: "easy",
    tags: [TAG.twoPointers, TAG.inPlace],
    hint: {
      en: "The same template as LC 26: when the reading pointer finds a value worth keeping, hand it to the writing pointer.",
      zh: "和 LC 26 是同一个模板:读指针遇到该保留的元素,就交给写指针。",
    },
    key: {
      en: (
        <>
          fast scans the whole array. Whenever nums[fast] is not val, write it at
          nums[slow++]. At the end slow is the new length. Deleting from an array
          is never cutting an element out; it is moving the elements you keep to
          the front.
        </>
      ),
      zh: (
        <>
          fast 扫完全程,凡是 nums[fast] ≠ val 就写到 nums[slow++]。结束时 slow
          就是新长度。数组里的「删除」从来不是让元素在原处消失,而是把要留下的元素往前挪。
        </>
      ),
    },
  },
  {
    lc: 704,
    title: { en: "Binary Search", zh: "二分查找" },
    d: "easy",
    tags: [TAG.binarySearch, TAG.template],
    hint: {
      en: "The template in §03 solves this as it is. Focus on the closed-interval details: left <= right, mid ± 1, and the sorted precondition.",
      zh: "§03 的模板原封不动就能过 —— 重点是闭区间的三个细节:left <= right、mid ± 1、以及有序这个前提。",
    },
    key: {
      en: (
        <>
          The standard closed-interval binary search: while left &le; right,
          compare nums[mid] with target and take one of three branches. After
          writing it, recite the three details: the loop condition, how the
          interval shrinks, and the overflow-safe midpoint in Java. Every later
          variation (finding a boundary, a rotated array) is built on this.
        </>
      ),
      zh: (
        <>
          标准闭区间二分:while (left ≤ right),nums[mid] 与 target 分三种情况。写完默背三个细节:循环条件、区间怎么收缩、Java 里防溢出的 mid 写法。这是后续所有二分变体(找边界、旋转数组)的地基。
        </>
      ),
    },
  },
  {
    lc: 35,
    title: { en: "Search Insert Position", zh: "搜索插入位置" },
    d: "easy",
    tags: [TAG.binarySearch, TAG.boundary],
    hint: {
      en: "When the value is absent, where does left end up? Trace a small example by hand.",
      zh: "找不到时,left 最后停在哪里?动手模拟一个小例子。",
    },
    key: {
      en: (
        <>
          The same template as LC 704. The only difference is that you return
          left when the value is absent, because when the loop ends left is
          exactly the first position whose value is &ge; target. Understanding
          this is understanding what a boundary search is (lower_bound in C++,
          bisect_left in Python).
        </>
      ),
      zh: (
        <>
          与 704 同一个模板,唯一的区别是找不到时返回 left ——
          循环结束时 left 正好是「第一个 ≥ target 的位置」。理解这一点,就理解了二分找边界的本质(C++ 的 lower_bound、Python 的
          bisect_left)。
        </>
      ),
    },
  },
  {
    lc: 88,
    title: { en: "Merge Sorted Array", zh: "合并两个有序数组" },
    d: "easy",
    tags: [TAG.twoPointers, TAG.backToFront],
    hint: {
      en: "The free space in nums1 is at the end. What goes wrong if you merge from the front?",
      zh: "nums1 的空位在尾部。如果从前往后合并,会出什么问题?",
    },
    key: {
      en: (
        <>
          Three pointers moving backwards: p1 at the last valid element of nums1,
          p2 at the last element of nums2, and p at the real end of nums1. Each
          step writes the larger value at p. Writing from the back never
          overwrites an element that has not been processed yet. This
          &ldquo;go backwards&rdquo; trick appears again and again in in-place
          problems.
        </>
      ),
      zh: (
        <>
          三指针从后往前:p1 指 nums1 的有效尾、p2 指 nums2 的尾、p 指 nums1
          真正的尾。每次把较大者写到 p。从后往前写就不会覆盖还没处理的元素,这个「倒着来」的技巧在原地类题目里反复出现。
        </>
      ),
    },
  },
  {
    lc: 121,
    title: {
      en: "Best Time to Buy and Sell Stock",
      zh: "买卖股票的最佳时机",
    },
    d: "easy",
    tags: [TAG.onePass, TAG.prefixExtreme],
    hint: {
      en: "The best profit from selling on day i is prices[i] minus the lowest price in the first i days. Keep that lowest price as you go.",
      zh: "在第 i 天卖出的最大利润 = prices[i] − 前 i 天的最低价。边走边维护这个最低价。",
    },
    key: {
      en: (
        <>
          One pass keeping minPrice and maxProfit. On each day, first update the
          answer with prices[i] - minPrice, then update minPrice with prices[i].
          O(n) time, O(1) space. The idea behind it is a prefix minimum, and many
          array problems come down to maintaining some kind of prefix
          information.
        </>
      ),
      zh: (
        <>
          一次遍历,维护 minPrice 与 maxProfit:每到一天,先用 prices[i] − minPrice
          更新答案,再用 prices[i] 更新 minPrice。时间 O(n)、空间 O(1)。本质是「前缀最小值」思想 —— 很多数组题都是在维护某种前缀信息。
        </>
      ),
    },
  },
  {
    lc: 283,
    title: { en: "Move Zeroes", zh: "移动零" },
    d: "easy",
    tags: [TAG.twoPointers, TAG.inPlace],
    hint: {
      en: "Do not think about moving the zeros back. Think about moving the non-zero values forward, and the remaining slots are all zeros.",
      zh: "别想着把 0 挪到后面,想着把非零元素往前搬 —— 剩下的位置自然全是 0。",
    },
    key: {
      en: (
        <>
          slow marks the slot where the next non-zero value belongs. fast scans
          the whole array, and on every non-zero value it swaps with slow and
          moves slow forward. One pass, O(n) time and O(1) space, and the
          relative order is preserved. §08 of this chapter animates it step by
          step.
        </>
      ),
      zh: (
        <>
          slow 指向「下一个非零元素该放的位置」,fast 扫完全程,遇到非零就与 slow
          交换并 slow++。一次遍历,时间 O(n)、空间 O(1),且保持相对顺序。本章 §08 有逐帧动画。
        </>
      ),
    },
  },
  {
    lc: 167,
    title: {
      en: "Two Sum II - Input Array Is Sorted",
      zh: "两数之和 II(输入有序数组)",
    },
    d: "medium",
    tags: [TAG.opposite, TAG.sorted],
    hint: {
      en: "The array is sorted. Put one pointer at each end: if the sum is too large, which one should move? Too small?",
      zh: "数组有序,左右两端各放一个指针:和太大该动谁?太小该动谁?",
    },
    key: {
      en: (
        <>
          Pointers moving inward: if sum &gt; target, move right left, because
          only a smaller right value can reduce the sum; if sum &lt; target, move
          left right. Each step safely rules out one element, so the whole scan
          is O(n). &ldquo;Sorted input plus find a pair&rdquo; is almost always a
          sign to use this.
        </>
      ),
      zh: (
        <>
          对撞指针:sum &gt; target 时 right--(只有减小右边的值才能让和变小),
          sum &lt; target 时 left++。每一步都能安全排除一个元素,总共 O(n)。「有序 + 找配对」几乎总是对撞指针的信号。
        </>
      ),
    },
  },
  {
    lc: 238,
    title: {
      en: "Product of Array Except Self",
      zh: "除自身以外数组的乘积",
    },
    d: "medium",
    tags: [TAG.prefixProduct, TAG.twoPasses],
    hint: {
      en: "answer[i] = the product of everything left of i × the product of everything right of i. Scan once in each direction.",
      zh: "answer[i] = i 左边所有数的乘积 × i 右边所有数的乘积。两个方向各扫一遍。",
    },
    key: {
      en: (
        <>
          The first pass, left to right, writes the product of the prefix into
          the answer array. The second pass, right to left, keeps the product of
          the suffix in a single variable and multiplies it in. O(n) time and
          O(1) extra space if the output array does not count. Prefix
          techniques (prefix sum, prefix product, prefix minimum) are a standard
          part for array problems.
        </>
      ),
      zh: (
        <>
          第一遍从左到右,把「左侧前缀积」写进答案数组;第二遍从右到左,用一个变量滚动「右侧后缀积」乘上去。时间 O(n),不算输出数组的话额外空间
          O(1)。前缀思想(前缀和 / 前缀积 / 前缀最值)是数组题的常用零件。
        </>
      ),
    },
  },
  {
    lc: 53,
    title: { en: "Maximum Subarray", zh: "最大子数组和" },
    d: "medium",
    tags: [{ en: "Kadane", zh: "Kadane" }, TAG.dp],
    hint: {
      en: "At each position ask one question: is the sum of the part before me still positive? If yes, extend it. If no, start again from here.",
      zh: "走到每个位置时问一句:前面那段的和还是正的吗?是就带上,不是就从这里重新开始。",
    },
    key: {
      en: (
        <>
          Kadane&rsquo;s algorithm: cur = max(nums[i], cur + nums[i]), then ans =
          max(ans, cur). Once the running sum turns negative it can only make
          later sums smaller, so it is dropped. O(n) time, O(1) space. It is also
          the shortest path into dynamic programming: cur is the state
          &ldquo;best sum of a subarray ending at i&rdquo;.
        </>
      ),
      zh: (
        <>
          Kadane 算法:cur = max(nums[i], cur + nums[i]),ans = max(ans, cur)。一旦前面那段的和变成负数,它只会让后面的和更小,直接丢弃。时间 O(n)、空间 O(1)。它也是进入动态规划最短的一条路:cur
          的状态定义就是「以 i 结尾的子数组的最大和」。
        </>
      ),
    },
  },
  {
    lc: 56,
    title: { en: "Merge Intervals", zh: "合并区间" },
    d: "medium",
    tags: [TAG.sorting, TAG.intervals],
    hint: {
      en: "Sort by the left endpoint first, and overlapping intervals become neighbors.",
      zh: "先按左端点排序,重叠的区间就会变成邻居。",
    },
    key: {
      en: (
        <>
          After sorting by start, scan once: if the current start is &le; the end
          of the last interval in the result, merge them and take the larger end;
          otherwise start a new interval. The sort dominates, so O(n log n). For
          interval problems the first thing to try is sorting plus one scan.
        </>
      ),
      zh: (
        <>
          按 start 排序后线性扫描:当前区间的 start ≤ 结果集最后一个区间的 end
          就合并(end 取较大者),否则新开一段。排序主导,总共 O(n log n)。区间题的第一反应:排序 + 一次扫描。
        </>
      ),
    },
  },
  {
    lc: 15,
    title: { en: "3Sum", zh: "三数之和" },
    d: "medium",
    tags: [TAG.sorting, TAG.opposite, TAG.dedup],
    hint: {
      en: "Sort first, then fix one number and the rest becomes LC 167. The hard part is avoiding duplicate triples.",
      zh: "排序后固定一个数,剩下的就变成了 LC 167(有序两数之和)。难点全在去重。",
    },
    key: {
      en: (
        <>
          Sort in O(n log n). The outer loop picks i, skipping a value equal to
          the previous one. The inner loop uses left and right moving inward to
          find -nums[i], and after a hit both sides skip over equal values. Total
          O(n²). &ldquo;Fix one dimension and reduce the rest to two
          pointers&rdquo; is the general move for 3Sum and 4Sum.
        </>
      ),
      zh: (
        <>
          排序 O(n log n);外层枚举 i(跳过与前一个相同的值),内层用 left/right
          对撞找 −nums[i],命中后两侧同时跳过重复值。总共 O(n²)。「固定一维、把剩下的降为双指针」是三数之和 / 四数之和的通用打法。
        </>
      ),
    },
  },
  {
    lc: 189,
    title: { en: "Rotate Array", zh: "轮转数组" },
    d: "medium",
    tags: [TAG.reverse, TAG.inPlace],
    hint: {
      en: "Reverse the whole array once, then reverse the first k and the last n − k separately. Three reversals in total.",
      zh: "整体翻转一次,再把前 k 个和后 n − k 个各自翻回来 —— 一共三次翻转。",
    },
    key: {
      en: (
        <>
          After k %= n: reverse(0, n-1), then reverse(0, k-1), then reverse(k,
          n-1). O(n) time and O(1) space. Do not forget k %= n; without it a k
          larger than n goes out of bounds. The reversal trick shows up often in
          in-place rearrangement.
        </>
      ),
      zh: (
        <>
          先 k %= n,然后 reverse(0, n−1) → reverse(0, k−1) → reverse(k, n−1)。时间 O(n)、空间 O(1)。别忘了 k %= n:k 大于 n 时不取模会越界。翻转技巧是数组原地重排的常客,值得单独记住。
        </>
      ),
    },
  },
  {
    lc: 54,
    title: { en: "Spiral Matrix", zh: "螺旋矩阵" },
    d: "medium",
    tags: [TAG.matrix, TAG.simulation],
    hint: {
      en: "Keep four boundaries, top, bottom, left, and right, and walk right, down, left, up, shrinking them one ring at a time.",
      zh: "维护 top / bottom / left / right 四条边界,按「右、下、左、上」一圈圈收缩。",
    },
    key: {
      en: (
        <>
          Simulate with four boundaries: after finishing one side, shrink the
          matching boundary (top++, right--, bottom--, left++), and stop when the
          boundaries cross. Before walking the reverse sides, check that top &le;
          bottom and left &le; right again, otherwise a single row or single
          column is printed twice. That check is the only trap in this problem.
        </>
      ),
      zh: (
        <>
          四边界模拟:每走完一条边就收缩对应边界(top++ / right-- / bottom-- /
          left++),边界交错时停止。走反向的两条边之前要再检查一次 top ≤ bottom、left ≤ right,否则单行或单列会被重复输出 —— 这是本题唯一容易出错的地方。
        </>
      ),
    },
  },
  {
    lc: 48,
    title: { en: "Rotate Image", zh: "旋转图像" },
    d: "medium",
    tags: [TAG.matrix, TAG.inPlace],
    hint: {
      en: "Rotating 90° clockwise = transpose along the main diagonal, then reverse each row. Try it on paper with a 3×3.",
      zh: "顺时针旋转 90° = 先沿主对角线转置,再左右翻转每一行。试着在纸上转一个 3×3。",
    },
    key: {
      en: (
        <>
          Transpose (swap matrix[i][j] with matrix[j][i], scanning only the upper
          triangle), then reverse each row. Both steps are in place, O(1) extra
          space. Splitting a geometric operation into two simple transforms is
          much easier to remember than a four-point rotation formula.
        </>
      ),
      zh: (
        <>
          转置(交换 matrix[i][j] 与 matrix[j][i],只扫上三角)+ 每行 reverse,两步都是原地操作,额外空间 O(1)。把一个几何操作拆成两个简单变换,比背「四点轮换」公式好记得多。
        </>
      ),
    },
  },
  {
    lc: 73,
    title: { en: "Set Matrix Zeroes", zh: "矩阵置零" },
    d: "medium",
    tags: [TAG.matrix, TAG.markInPlace],
    hint: {
      en: "Want O(1) extra space? The first row and the first column of the matrix can serve as the notepad.",
      zh: "想要 O(1) 额外空间?矩阵自己的第一行和第一列就是现成的记事本。",
    },
    key: {
      en: (
        <>
          Use the first row and the first column to record which row and column
          must be cleared, and two separate booleans to record whether the first
          row and the first column themselves contained a zero. Mark while
          scanning the inner area, clear according to the marks, and handle the
          first row and column last. Borrowing the data itself as mark space is a
          classic in-place technique.
        </>
      ),
      zh: (
        <>
          用第一行和第一列记录「该行 / 该列要清零」,再用两个布尔变量单独记录第一行、第一列自身是否含零。先扫内部区域做标记,再按标记清零,最后处理第一行和第一列。「借数据自身当标记空间」是原地算法的经典手法。
        </>
      ),
    },
  },
  {
    lc: 42,
    title: { en: "Trapping Rain Water", zh: "接雨水" },
    d: "hard",
    tags: [TAG.opposite, TAG.precompute],
    hint: {
      en: "The water above one bar = min(highest on the left, highest on the right) − its own height. Deal with whichever side is already limited.",
      zh: "每根柱子上方的水 = min(左边最高, 右边最高) − 自身高度。哪一边已经被限制住,就先处理哪一边。",
    },
    key: {
      en: (
        <>
          Pointers moving inward with a running maximum on each side: keep
          leftMax and rightMax, and process whichever side has the smaller
          maximum, because that side&rsquo;s limit is already known and the other
          side cannot be lower. Add max - height and move that pointer inward.
          O(n) time, O(1) space. A monotonic stack also solves it, and the stack
          chapter revisits the same problem.
        </>
      ),
      zh: (
        <>
          对撞指针 + 两侧最大值:维护 leftMax / rightMax,哪一边的最大值更小就处理哪一边
          —— 那一边的限制已经确定,另一边不可能更矮。累加 max − height 后把指针内移。时间 O(n)、空间 O(1)。它也可以用单调栈解,栈那一章会再遇到同一道题。
        </>
      ),
    },
  },
];
