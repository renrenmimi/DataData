// Chapter 6 · Hash tables — problem set and quiz data (English default / Chinese toggle).
// Problems center on the three hash-table signals (have I seen it? / pairing / group counting),
// plus prefix sum with a hash table and composition with other structures;
// hint points a direction without spoilers, key explains the optimal solution in one paragraph.
//
// Bilingual: title / tags / hint / key / q / opts / why are all written as { en, zh },
// and the en side of each problem title uses the official LeetCode English name.

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

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
          从 n⁴ 降下来两个数量级。「折半 + 哈希配对」就是 meet in the middle
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

export const QUIZ: QuizItem[] = [
  {
    type: "multi",
    q: {
      en: "Which of these must a usable hash function satisfy? (select all)",
      zh: "一个合格的哈希函数,必须满足以下哪些要求?(多选)",
    },
    opts: [
      {
        en: "Deterministic: the same key always produces the same value",
        zh: "确定性:同一个 key,今天算明天算结果必须相同",
      },
      {
        en: "Well spread: keys are distributed over all the buckets instead of piling into a few",
        zh: "均匀性:把 key 尽量平摊到所有桶,别扎堆",
      },
      {
        en: "Fast: computing the hash itself must be close to O(1)",
        zh: "要快:计算本身必须接近 O(1),否则「直达」就是空谈",
      },
      {
        en: "Reversible: you must be able to recover the original key from the hash value",
        zh: "可逆性:必须能从哈希值反推出原始 key",
      },
    ],
    correct: [0, 1, 2],
    missHint: {
      en: "You missed one. Determinism means you can find a value again after storing it. Good spread keeps the average lookup constant. Speed keeps the hash itself from eating the time you saved. All three are needed.",
      zh: "少选了:确定性(不然存进去就找不回来)、均匀(不然全挤一个桶,退化成一条长链)、快(不然省下的时间全花在算哈希上)—— 三者缺一不可。",
    },
    extraHint: {
      en: "Reversibility is not required, and it is not even possible. There are more possible keys than hash values, so many keys share one value and the mapping cannot be undone.",
      zh: "可逆不是要求,而且根本做不到:可能的 key 比哈希值多,多个 key 必然映射到同一个值,这个映射天生无法反推。",
    },
    why: {
      en: "Determinism is what makes a stored value findable again. Good spread is what keeps the average cost constant. Speed is what keeps the saved time. Reversibility is a different goal that belongs to encryption, not to hashing.",
      zh: "确定性保证「存得进、取得出」;均匀保证平均代价是常数;快保证省下来的时间没花在算哈希上。可逆是加密的目标,不是哈希的目标。",
    },
  },
  {
    type: "choice",
    q: {
      en: "A string hash can be a number in the hundreds of thousands. Why take it modulo the bucket count at the end?",
      zh: "字符串哈希算出来可能是几十万的大数,为什么最后要对桶数取模(mod)?",
    },
    opts: [
      {
        en: "To bring any hash value into the range 0 to bucketCount − 1, so it can be used as an array index",
        zh: "把任意大的哈希值压缩到 0 ~ 桶数−1,才能当数组下标用",
      },
      {
        en: "Because the modulo operation makes the distribution perfectly even",
        zh: "取模能让哈希分布变得绝对均匀",
      },
      {
        en: "For security, so nobody can work out the key from the bucket number",
        zh: "为了加密,防止别人从桶位反推出 key",
      },
      {
        en: "To keep the hash values sorted, so a binary search can be used later",
        zh: "为了让哈希值有序,方便之后二分查找",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Modulo only narrows the range. How evenly the keys are spread depends on the hash function. A badly chosen bucket count can even make the spread worse, for example when it shares a factor with the values being hashed.",
        zh: "取模只负责压缩范围,均匀与否主要取决于哈希函数本身。桶数选得不好(比如和被哈希的值有公因子)反而更不均匀。",
      },
      {
        en: "A hash table is not a security tool. The modulo is there to produce a legal array index.",
        zh: "哈希表不负责保密 —— 取模是为了得到合法的数组下标,与加密无关。",
      },
      {
        en: "A hash table stores nothing in sorted order and never does a binary search. Everything it does rests on computing an index and jumping straight to it.",
        zh: "哈希表内部完全不排序,也不做二分 —— 它的一切都建立在「算出下标直达」上。",
      },
    ],
    why: {
      en: "The bucket array is an ordinary array, so the index has to fall inside [0, bucketCount − 1]. The modulo is what forces it there. This also explains why every key has to be placed again after the table grows: the bucket count changed, so the result of the modulo changed.",
      zh: "桶数组本质是个数组,下标必须落在 [0, 桶数−1]。mod 就是那道压缩闸门 —— 这也解释了扩容后为什么每个 key 都要重新安家:桶数变了,mod 的结果就变了。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          The load factor is the number of stored entries divided by the number
          of buckets. Above which load factor does a Java HashMap grow by
          default? (write a decimal)
        </>
      ),
      zh: (
        <>
          负载因子(load factor)= 已存元素数 ÷ 桶数。Java HashMap
          默认在负载因子超过多少时扩容?(填一个小数)
        </>
      ),
    },
    placeholder: { en: "0.??", zh: "0.??" },
    answers: ["0.75", ".75", "3/4"],
    hint: {
      en: "It is the balance point between \"buckets too full, many collisions\" and \"buckets too empty, memory wasted\". Three quarters.",
      zh: "在「桶太满冲突多」和「桶太空浪费内存」之间取的平衡点,是四分之三。",
    },
    why: {
      en: "0.75 is a compromise between space and time. Higher, and each bucket holds more entries on average, so the chains get longer and the average lookup stops being constant. Lower, and many buckets sit empty and waste memory. Around 0.75 the chance that one bucket collects a long chain is already very small, assuming the hash spreads the keys well.",
      zh: "0.75 是空间与时间的折中:再高,每个桶平均挂的元素变多,链变长,平均查找不再是常数;再低,大片桶空着浪费内存。在哈希分布良好的前提下,0.75 附近单桶出现长链的概率已经极小。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Lookup in a hash table is O(1) on average but O(n) in the worst case. What causes the worst case?",
      zh: "哈希表平均 O(1),但最坏会退化到 O(n)。什么场景会触发最坏情况?",
    },
    opts: [
      {
        en: "All the keys hash into the same bucket, because the hash function is poor or the keys were crafted on purpose",
        zh: "所有 key 被哈希进同一个桶(哈希函数太差,或被恶意构造的 key 攻击)",
      },
      {
        en: "The table holds too many entries, more than a million",
        zh: "存的元素太多,超过一百万",
      },
      { en: "The keys are strings instead of integers", zh: "key 是字符串而不是整数" },
      {
        en: "The keys were not inserted in sorted order",
        zh: "没有按 key 的字典序插入",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A large number of entries is not the problem. Growing the table increases the bucket count as well, so as long as the keys spread evenly, each bucket still holds a constant number of entries on average.",
        zh: "元素多不是问题 —— 扩容会把桶数同步撑大,只要分布均匀,每桶平均还是常数个。",
      },
      {
        en: "A well designed string hash spreads just as evenly. The type of the key does not decide the cost; the distribution does.",
        zh: "字符串哈希设计得当照样均匀;决定代价的是分布,不是 key 的类型。",
      },
      {
        en: "A hash table does not care about insertion order and does not keep any order.",
        zh: "哈希表不关心插入顺序,也不维护任何顺序。",
      },
    ],
    why: {
      en: "When every key lands in one bucket, the table behaves like a single long list and a lookup has to compare the keys one by one, which is O(n). A HashDoS attack does this on purpose by sending many keys with the same hash. Since Java 8 a bucket that grows past a threshold is converted from a list to a red-black tree, which brings that case down to O(log n).",
      zh: "全部 key 挤进一个桶时,哈希表实际上退化成一条长链,查找要逐个比对,O(n)。HashDoS 攻击就是故意构造大量同哈希的 key 来拖垮服务。Java 8 起,单桶超过阈值会从链表转成红黑树,把这种情况从 O(n) 降到 O(log n)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In Java you override equals() but forget hashCode(), then use the object as a HashMap key. What happens?",
      zh: "Java 里重写了 equals() 却忘了重写 hashCode(),把对象放进 HashMap 会发生什么?",
    },
    opts: [
      {
        en: "Two objects that are equal can produce different hash codes and land in different buckets, so a value you stored cannot be found",
        zh: "两个「相等」的对象可能算出不同哈希、落进不同的桶 —— 存进去却查不到",
      },
      { en: "It fails to compile", zh: "编译直接报错,根本跑不起来" },
      {
        en: "Nothing changes, because HashMap only uses equals",
        zh: "没有任何影响,HashMap 只看 equals",
      },
      {
        en: "HashMap generates a hashCode from the fields for you",
        zh: "HashMap 会自动帮你按字段生成 hashCode",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "The compiler does not check this; at most an IDE warns you. It is a runtime problem, which makes it harder to notice.",
        zh: "编译器不管这件事,顶多 IDE 给个警告 —— 它是运行期的问题,反而更难发现。",
      },
      {
        en: "The order is the other way around. HashMap uses hashCode to pick the bucket first. If that bucket is wrong, equals is never even called.",
        zh: "顺序恰恰相反:HashMap 先用 hashCode 找桶,桶找错了,equals 根本没机会出场。",
      },
      {
        en: "It does not. The default hashCode is based on object identity, so two new objects with identical fields almost always get different hash codes.",
        zh: "不会。默认 hashCode 基于对象身份,两个字段完全相同的 new 对象,哈希值几乎必然不同。",
      },
    ],
    why: {
      en: "A HashMap lookup has two steps: use hashCode to find the bucket, then use equals inside that bucket. The contract says that equal objects must have equal hash codes, and that is what puts equal objects in the same bucket. Break the contract and the first step already goes to the wrong place.",
      zh: "HashMap 的查找分两步:先用 hashCode 定位桶,再在桶内用 equals 比对。契约「equals 相等的对象,hashCode 必须相等」正是为了让相等的对象进同一个桶。契约一破,第一步就走错了门。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In Python a list cannot be a dict key but a tuple can. What is the underlying reason?",
      zh: "Python 里 list 不能当 dict 的 key,tuple 却可以。根本原因是?",
    },
    opts: [
      {
        en: "A list can be modified. Its hash would have to change with its contents, so a stored entry could never be found again. Python therefore gives list no __hash__ at all",
        zh: "list 可变,内容一变哈希值就该变,存进去就再也找不回来 —— 所以 list 干脆不实现 __hash__",
      },
      { en: "A list is too long, so hashing it is too slow", zh: "list 太长,算哈希太慢" },
      {
        en: "tuple is a privileged type that the language treats specially",
        zh: "tuple 是 Python 的特权类型,语言开的后门",
      },
      {
        en: "A list may contain None, and None cannot be hashed",
        zh: "list 里可能有 None,None 不能参与哈希",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Length has nothing to do with it. A list with two elements raises the same unhashable type error.",
        zh: "长短无关 —— 只有两个元素的 list 照样报 unhashable type。",
      },
      {
        en: "There is no special treatment. A tuple can be hashed because it cannot be modified, and only if everything inside it can be hashed too. A tuple that contains a list is not hashable either.",
        zh: "没有特权:tuple 能哈希是因为它不可变,而且前提是内部元素也全部可哈希 —— 包含 list 的 tuple 同样不行。",
      },
      {
        en: "None can be hashed. hash(None) returns a normal integer and None works fine as a key.",
        zh: "None 完全可以哈希,hash(None) 是个正常整数,它本身也能直接当 key。",
      },
    ],
    why: {
      en: "A hash table decides which bucket an entry goes into using the hash computed at insertion time. If the key is modified afterwards, the recomputed hash points at a different bucket and the entry can no longer be found. Python removes the risk at the source: mutable containers (list, dict, set) have no __hash__, so using one as a key raises TypeError immediately instead of quietly losing data.",
      zh: "哈希表用「存入时算出的哈希」决定条目住哪个桶。key 存进去之后被修改,重新算出的哈希指向别的桶,数据就再也找不到了。Python 从源头掐断这个隐患:可变容器(list / dict / set)一律没有 __hash__,拿它当 key 会立刻抛 TypeError,而不是悄悄丢数据。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In JavaScript, what is the most important difference between using a plain object as a dictionary and using a Map?",
      zh: "JavaScript 里用普通 Object 当字典,和用 Map 相比,最要命的区别是?",
    },
    opts: [
      {
        en: "An object converts its keys to strings, so obj[1] and obj['1'] are the same entry, while a Map accepts a value of any type as a key",
        zh: "Object 的 key 会被强制转成字符串(obj[1] 和 obj['1'] 是同一个),Map 则任何类型都能当 key",
      },
      {
        en: "An object cannot hold more than 100 entries",
        zh: "Object 存不下超过 100 个键值对",
      },
      {
        en: "A Map is ten times slower and only looks nicer",
        zh: "Map 比 Object 慢十倍,只是写法好看",
      },
      {
        en: "They are equivalent, so it is only a matter of style",
        zh: "两者完全等价,纯属风格问题",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "There is no such limit. The problem is the meaning of the keys, not how many there are.",
        zh: "Object 没有这种容量限制 —— 问题在 key 的语义,不在数量。",
      },
      {
        en: "A Map is built for keys that are added and removed often, and it usually performs well there. Speed is not the reason to avoid it.",
        zh: "恰恰相反:Map 就是为频繁增删键设计的,这类场景它通常表现更好 —— 慢不是不用它的理由。",
      },
      {
        en: "They are far from equivalent. An object also inherits keys from its prototype, so \"toString\" in obj is true, while a Map iterates in insertion order and has a size property.",
        zh: "远不等价:Object 还继承了原型上的 key(\"toString\" in obj 就是 true),Map 则保证按插入顺序遍历、有 size 属性。",
      },
    ],
    why: {
      en: "An object key can only be a string or a symbol, so numbers and objects are converted to strings first. It also inherits keys from its prototype, and a key such as __proto__ coming from user input is a real security problem. For a dictionary, prefer Map and Set.",
      zh: "Object 的 key 只能是 string 或 symbol,数字、对象都会先被转成字符串;它还继承原型上的 key,而用户输入的 __proto__ 当 key 是真实存在的安全问题。要「字典」就优先用 Map / Set。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In Python 3.7 and later, in what order does iterating a dict return the keys?",
      zh: "Python 3.7+ 中,遍历 dict 的顺序是?",
    },
    opts: [
      {
        en: "Insertion order, and this is a guarantee of the language, not an accident",
        zh: "保持插入顺序 —— 这是语言规范的正式承诺,不是巧合",
      },
      {
        en: "Completely random, and possibly different on every run",
        zh: "完全随机,每次运行都可能不同",
      },
      { en: "Sorted by key, from smallest to largest", zh: "按 key 从小到大自动排序" },
      { en: "Sorted by hash value", zh: "按哈希值大小排列" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "That was close to the truth before 3.6, when the order was arbitrary and could differ between runs, because hashing of string keys is randomized per process. Since 3.7 insertion order is part of the language specification and can be relied on.",
        zh: "3.6 之前接近如此:顺序是任意的,而且因为字符串 key 的哈希每个进程都带随机盐,不同次运行可能不同。3.7 起插入序写进了语言规范,可以放心依赖。",
      },
      {
        en: "A dict never sorts. If you need sorted keys, call sorted(d) yourself or use another structure, the way Java uses TreeMap.",
        zh: "dict 从不排序 —— 需要有序 key 得自己 sorted(d),或者换一种结构(对比 Java 的 TreeMap)。",
      },
      {
        en: "Modern CPython separates where an entry is stored from where the hash points. A compact array holds the entries in insertion order and the hash table only holds indexes into it, so the iteration order has nothing to do with hash values.",
        zh: "新版 CPython 把「哈希定位」和「存储顺序」分开了:紧凑数组按插入序存条目,哈希表只存下标 —— 所以遍历顺序与哈希值无关。",
      },
    ],
    why: {
      en: "The compact dict introduced in CPython 3.6 preserved insertion order as a side effect of its layout, and 3.7 turned that into a language guarantee. Compare: a Java HashMap keeps no order (use LinkedHashMap if you need it), and a JavaScript Map also guarantees insertion order. A hash table by itself is unordered; a particular implementation may add an order on top.",
      zh: "CPython 3.6 的「紧凑 dict」实现顺带带来了插入序,3.7 把它升格为语言保证。对比:Java HashMap 无序(要顺序用 LinkedHashMap),JS Map 同样保证插入序。哈希表本身无序,具体实现可以在它之上额外提供顺序 —— 这两件事要分清。",
    },
  },
];
