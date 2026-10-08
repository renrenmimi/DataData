// Chapter 6 · Hash tables — problem set (English default / Chinese toggle).
// The closing quiz is in lib/hash-quiz.tsx; /atlas imports only this file.
// Problems center on the three hash-table signals (have I seen it? / pairing / group counting),
// plus prefix sum with a hash table and composition with other structures;
// hint points a direction without spoilers, key explains the optimal solution in one paragraph.
//
// Bilingual: title / tags / hint / key are all written as { en, zh },
// and the en side of each problem title uses the official LeetCode English name.

import type { Problem } from "@/lib/problems";

export const PROBLEMS: Problem[] = [
  {
    lc: 217,
    title: { en: "Contains Duplicate", zh: "存在重复元素" },
    d: "easy",
    tags: [
      { en: "Set", zh: "Set" },
      { en: "Seen before?", zh: "见过吗" },
    ],
    hint: {
      en: "The question is only \"has this value appeared before?\". That is exactly what a set answers. Ask while you walk through the array.",
      zh: "问题只有「这个值出现过吗」—— 这正是 Set 的岗位描述。一边遍历一边问。",
    },
    key: {
      en: (
        <>
          Walk through the array. For each element, ask the set whether it is
          already there. If it is, return true. If it is not, add it and
          continue. Time O(n) on average, extra space O(n). The sorting solution
          costs O(n log n) time and no extra space. Trading memory for time is
          the pattern behind every problem in this chapter.
        </>
      ),
      zh: (
        <>
          遍历数组,每个元素先问 Set「见过它吗」:见过就返回 true;
          没见过就 add 进去继续。平均 O(n) 时间、O(n) 额外空间。
          对比排序解法:O(n log n) 时间、不额外占空间。用空间换时间,
          是本章所有题目的共同底色。
        </>
      ),
    },
  },
  {
    lc: 219,
    title: { en: "Contains Duplicate II", zh: "存在重复元素 II" },
    d: "easy",
    tags: [
      { en: "Map", zh: "Map" },
      { en: "Latest index", zh: "最近下标" },
    ],
    hint: {
      en: "\"Seen before\" is no longer enough. You also need where you last saw it, so the set becomes a map.",
      zh: "光知道「见过」不够,还要知道「最近一次在哪见的」—— Set 升级成 Map。",
    },
    key: {
      en: (
        <>
          Keep a map from value to the index where you last saw that value. At
          position i, if the value is in the map and i minus the stored index is
          at most k, return true. Otherwise store i as the new index. The older
          index is always further away, so it can never help later and can be
          overwritten. Time O(n) on average, space O(n). A sliding window that
          holds a set of the last k values works too and is the same idea.
        </>
      ),
      zh: (
        <>
          Map 存「值 → 最近一次出现的下标」。走到 nums[i] 时,若表里有它,
          且 i − 上次下标 ≤ k,返回 true;否则把下标更新成 i。旧下标只会更远,
          以后永远用不上,可以直接覆盖。平均 O(n) 时间、O(n) 空间。
          用「长度为 k 的滑动窗口 Set」也可以,思路等价。
        </>
      ),
    },
  },
  {
    lc: 383,
    title: { en: "Ransom Note", zh: "赎金信" },
    d: "easy",
    tags: [
      { en: "Counting", zh: "计数" },
      { en: "Character table", zh: "字符表" },
    ],
    hint: {
      en: "Each letter in magazine is stock. ransomNote is the order. Is there enough stock of every letter?",
      zh: "magazine 里每个字母是「库存」,ransomNote 是「订单」—— 每种字母的库存够不够?",
    },
    key: {
      en: (
        <>
          First pass: count the 26 letters of magazine. Second pass: subtract one
          for each letter of ransomNote. If any count goes below zero, the stock
          is not enough, so return false. When the alphabet is fixed and small,
          an array of length 26 replaces the hash map. The index is the letter
          itself, so no hash function is needed at all. A counting array is a
          hash table with the simplest possible hash. Time O(m + n), extra space
          O(1) because 26 does not grow with the input.
        </>
      ),
      zh: (
        <>
          第一遍:统计 magazine 里 26 个字母各有几个。第二遍:遍历 ransomNote
          逐个扣减,任何一个扣成负数就是库存不足,返回 false。字符集固定且很小时,
          用长度 26 的数组代替 HashMap:下标就是字母本身,连哈希函数都不需要。
          计数数组就是哈希函数最简单的那种哈希表。O(m + n) 时间、O(1)
          额外空间(26 不随输入增长)。
        </>
      ),
    },
  },
  {
    lc: 290,
    title: { en: "Word Pattern", zh: "单词规律" },
    d: "easy",
    tags: [
      { en: "Map", zh: "Map" },
      { en: "Two-way mapping", zh: "双向映射" },
    ],
    hint: {
      en: "One map from letter to word is not enough. You also need word to letter. Think about what a single map fails to catch.",
      zh: "只存「字母 → 单词」一张表不够,还要存「单词 → 字母」—— 想想单向会漏掉什么。",
    },
    key: {
      en: (
        <>
          Build the mapping in <b>both</b> directions: one map from character to
          word, one from word to character. If either side already has a
          different partner, return false. One direction is not enough: with
          pattern &quot;abba&quot; and the string &quot;dog dog dog dog&quot;,
          the character to word map only records a to dog and b to dog, which
          looks consistent. The word to character map catches it, because dog is
          already taken by a. LC 205 (Isomorphic Strings) is the same problem
          with characters on both sides.
        </>
      ),
      zh: (
        <>
          建立<b>双向</b>映射:char → word 和 word → char 两张表。
          任何一边已经配了别的伙伴,就返回 false。只存单向会漏判:
          pattern = &quot;abba&quot;、s = &quot;dog dog dog dog&quot; 时,
          char → word 只记下 a→dog、b→dog,看起来毫无矛盾;
          反向表才能发现 dog 已经被 a 占用。LC 205(同构字符串)
          是两边都换成字符的同型题。
        </>
      ),
    },
  },
  {
    lc: 202,
    title: { en: "Happy Number", zh: "快乐数" },
    d: "easy",
    tags: [
      { en: "Set", zh: "Set" },
      { en: "Cycle detection", zh: "判环" },
    ],
    hint: {
      en: "A number that is not happy repeats itself forever. \"Repeats\" means some value shows up a second time, and a set notices that immediately.",
      zh: "不快乐的数会一直绕圈。「绕圈」= 某个值第二次出现 —— Set 一眼就能看出来。",
    },
    key: {
      en: (
        <>
          Repeatedly replace the number by the sum of the squares of its digits.
          The process either reaches 1, or it enters a cycle and never stops. Put
          every intermediate value into a set. If a value appears again, you are
          in a cycle, so return false. Each transformation touches the digits of
          the number, which is O(log n) work, and the set makes the repeat check
          O(1) on average. A follow-up asks for constant space: use the fast and
          slow pointer cycle detection from the linked list chapter.
        </>
      ),
      zh: (
        <>
          反复把数替换成「各位数字平方和」,过程要么到 1,要么进入一个永不停止的循环。
          把每个中间值放进 Set,某个值第二次出现就说明入环,返回 false。
          每次变换要处理这个数的每一位,是 O(log n) 的工作量;Set 让「是否重复」
          的判断平均只花 O(1)。追问「不用额外空间行吗」:用链表章的快慢指针判环。
        </>
      ),
    },
  },
  {
    lc: 349,
    title: { en: "Intersection of Two Arrays", zh: "两个数组的交集" },
    d: "easy",
    tags: [
      { en: "Set", zh: "Set" },
      { en: "Deduplication", zh: "去重" },
    ],
    hint: {
      en: "Put one array into a set, then check the other array against it. The result must not contain duplicates.",
      zh: "把一个数组装进 Set,再拿另一个数组来查。结果本身还要去重。",
    },
    key: {
      en: (
        <>
          Put all of nums1 into a set A. Walk through nums2 and add every value
          that is in A to a result set, which removes duplicates for you. Convert
          the result set to an array at the end. Time O(m + n) on average. Every
          language has this built in: <code>set(a) &amp; set(b)</code> in Python,{" "}
          <code>filter</code> plus <code>has</code> in JavaScript,{" "}
          <code>retainAll</code> in Java. Set operations like intersection and
          union are the reason the type exists.
        </>
      ),
      zh: (
        <>
          nums1 全部入 Set A;遍历 nums2,凡在 A 中的加入结果 Set(自动去重),
          最后转成数组。平均 O(m + n)。三种语言都内置了这类运算:Python{" "}
          <code>set(a) &amp; set(b)</code>、JS <code>filter</code> +{" "}
          <code>has</code>、Java <code>retainAll</code> —— 交集、并集这类集合运算,
          正是 Set 这个类型存在的理由。
        </>
      ),
    },
  },
  {
    lc: 454,
    title: { en: "4Sum II", zh: "四数相加 II" },
    d: "medium",
    tags: [
      { en: "Map", zh: "Map" },
      { en: "Split and pair", zh: "分组配对" },
    ],
    hint: {
      en: "Four nested loops give O(n⁴). What happens if you split the four arrays into two halves of two?",
      zh: "四层循环 O(n⁴) 显然不行。把四个数组拆成 2 + 2 呢?",
    },
    key: {
      en: (
        <>
          Rewrite A + B + C + D = 0 as (A + B) = −(C + D). First, two nested
          loops over A and B fill a map from each sum to how many times it
          occurred, which costs O(n²). Then two nested loops over C and D look up
          −(c + d) in the map and add its count to the answer. Time and space are
          both O(n²), down from n⁴. Splitting the search in half and pairing the
          halves through a hash table is the entry-level version of meet in the
          middle.
        </>
      ),
      zh: (
        <>
          把 A + B + C + D = 0 改写成 (A + B) = −(C + D)。第一步:双层循环枚举
          A、B,用 Map 记录每种和出现了几次,O(n²)。第二步:双层循环枚举 C、D,
          查 −(c + d) 在表里出现了几次,累加进答案。时间与空间都是 O(n²),
          从 n⁴ 降到 n²。「折半 + 哈希配对」就是 meet in the middle
          思想的入门款。
        </>
      ),
    },
  },
  {
    lc: 560,
    title: { en: "Subarray Sum Equals K", zh: "和为 K 的子数组" },
    d: "medium",
    tags: [
      { en: "Prefix sum", zh: "前缀和" },
      { en: "Map counting", zh: "Map 计数" },
      { en: "Must know", zh: "必会" },
    ],
    hint: {
      en: "The sum of a subarray is the difference of two prefix sums. Can \"find a range\" become \"find a prefix you have already seen\"?",
      zh: "子数组和 = 两个前缀和之差。「找一段区间」能不能变成「找一个之前出现过的前缀」?",
    },
    key: {
      en: (
        <>
          Let pre[i] be the sum of the first i numbers. The subarray (j, i] sums
          to k exactly when pre[i] − pre[j] = k, that is when{" "}
          <b>pre[j] = pre[i] − k</b>. So make one pass and keep a map from prefix
          sum to how many times it has occurred. At each position, first add
          map[pre − k] to the answer, because every such j gives one valid
          subarray, then increase the count of the current pre by one.{" "}
          <b>The map must start with {"{0: 1}"}</b>: the empty prefix is a valid
          j, and without it every subarray that starts at index 0 is missed. Time
          O(n), space O(n). The values may be negative, so the sliding window
          does not work here — the window sum is not monotonic. That is exactly
          why prefix sums plus a hash table are needed. This is Two Sum
          transplanted into the world of prefix sums, and it is the most
          important problem in this list.
        </>
      ),
      zh: (
        <>
          设前缀和 pre[i] = 前 i 个数之和,则子数组 (j, i] 的和为 k ⟺ pre[i] −
          pre[j] = k ⟺ <b>pre[j] = pre[i] − k</b>。于是一边扫一边维护 Map「前缀和
          → 出现次数」:每到一个位置,先把 map[pre − k] 累加进答案(有几个这样的 j
          就有几个合法子数组),再把当前 pre 的计数 +1。
          <b>Map 必须以 {"{0: 1}"} 起步</b>:空前缀也是合法的 j,
          否则从下标 0 开始的子数组会全部漏掉。O(n) 时间、O(n) 空间。
          元素可能为负,窗口和不单调,滑动窗口在这里失效 ——
          这正是前缀和 + 哈希登场的原因。它是「两数之和」在前缀和世界里的翻版,
          也是本题单最重要的一题。
        </>
      ),
    },
  },
  {
    lc: 380,
    title: { en: "Insert Delete GetRandom O(1)", zh: "O(1) 时间插入、删除和获取随机元素" },
    d: "medium",
    tags: [
      { en: "Map + array", zh: "Map + 数组" },
      { en: "Combined structures", zh: "结构组合" },
    ],
    hint: {
      en: "Random access needs an array. O(1) lookup needs a hash map. When one structure is not enough, use two together.",
      zh: "随机取要数组(下标随机),快速定位要哈希 —— 一个结构不够,就两个一起上。",
    },
    key: {
      en: (
        <>
          A dynamic array holds the values, so picking a random one is O(1). A
          map holds value to its index in that array. To delete x: look up its
          index i, move the <b>last element of the array into position i</b>,
          update that element&apos;s index in the map, then pop the last slot.
          This avoids the O(n) shifting that deleting from the middle of an array
          would cost. Swap with last is the standard way to delete from an array
          in O(1), and the price is that the order is not preserved. The same
          combination of a map and another structure returns for LRU and LFU
          caches.
        </>
      ),
      zh: (
        <>
          动态数组存值(随机取 O(1)),Map 存「值 → 它在数组里的下标」。
          删除 x 时:查出下标 i,把<b>数组末尾元素搬到 i</b>、
          更新它在 Map 里的下标,再弹掉末尾 —— 避开了数组中间删除的 O(n) 搬家。
          swap-with-last 是数组 O(1) 删除的标准手法,代价是不再保持顺序。
          「哈希表 + 另一种结构」这套组合,后面的 LRU、LFU 缓存还会再用一次。
        </>
      ),
    },
  },
  {
    lc: 299,
    title: { en: "Bulls and Cows", zh: "猜数字游戏" },
    d: "medium",
    tags: [
      { en: "Counting", zh: "计数" },
      { en: "Two passes / one pass", zh: "两遍/一遍" },
    ],
    hint: {
      en: "Bulls are easy: same position and same digit. For cows, compare the leftover digits on each side.",
      zh: "公牛好数:同位置同数字。奶牛要看两边「没配上」的数字各剩多少。",
    },
    key: {
      en: (
        <>
          First pass: if secret and guess have the same digit at the same
          position, increase bulls. For every position that does not match, count
          that digit separately for secret and for guess, using two arrays of
          length 10. Second pass: for each digit 0 to 9, add min(cntS[d],
          cntG[d]) to cows, because that many can be paired up. Time O(n), extra
          space O(1). One-pass version: use a single counting array, add one for
          each secret digit and subtract one for each guess digit; whenever a
          count crosses zero in the opposite direction, one cow has been matched.
        </>
      ),
      zh: (
        <>
          第一遍:同位置同数字 → bulls++;不匹配的位置,分别给 secret 和 guess
          的数字计数(两个长度 10 的计数数组)。第二遍:对每个数字 0–9,
          cows += min(cntS[d], cntG[d]) —— 两边库存能配上的部分都是奶牛。
          O(n) 时间、O(1) 额外空间。一遍写法:只用一个计数数组,secret
          的数字 +1、guess 的数字 −1,某个计数越过 0 走向反方向时,
          就说明抵掉了一头奶牛。
        </>
      ),
    },
  },
];
