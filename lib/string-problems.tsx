// Chapter 2 · Strings — problem set (bilingual).
// The closing quiz is in lib/string-quiz.tsx; /atlas imports only this file.
// Problems cover two pointers from both ends, counting arrays, sliding window, simulation, and KMP,
// ramping from Easy to Hard; hint points a direction without spoilers, key explains the optimal
// solution in one paragraph.
// Problem titles use the official LeetCode English name on en and the official Chinese name on zh.

import type { Problem } from "@/lib/problems";

export const PROBLEMS: Problem[] = [
  {
    lc: 344,
    title: { en: "Reverse String", zh: "反转字符串" },
    d: "easy",
    tags: [
      { en: "Two pointers", zh: "对撞指针" },
      { en: "In place", zh: "原地" },
    ],
    hint: {
      en: "The input is a character array, not a string, so you can write to it. Put one pointer at each end and decide what each step does.",
      zh: "题目给的是字符数组(可变),不是字符串。两端各站一个指针,想想每一步该干什么。",
    },
    key: {
      en: (
        <>
          Two pointers moving toward each other: swap s[left] and s[right], then
          move both inward. Stop when they meet. O(n) time and O(1) extra space.
          The problem hands you a <code>char[]</code> or a list on purpose.
          Strings are immutable in Java, Python, and JavaScript, so reversing
          &quot;in place&quot; can only happen on a mutable character array.
        </>
      ),
      zh: (
        <>
          对撞指针:交换 s[left] 和 s[right],然后两个指针同时向中间走,相遇即止。
          O(n) 时间、O(1) 额外空间。题目特意给 <code>char[]</code>/list
          而不是字符串,是因为 Java、Python、JavaScript 的字符串都不可变,
          「原地反转」只能发生在可变的字符数组上。
        </>
      ),
    },
  },
  {
    lc: 242,
    title: { en: "Valid Anagram", zh: "有效的字母异位词" },
    d: "easy",
    tags: [
      { en: "Counting array", zh: "计数数组" },
      { en: "Hashing idea", zh: "哈希思想" },
    ],
    hint: {
      en: "Two strings are anagrams when every letter appears the same number of times in both. With only 26 lowercase letters, do you really need to sort?",
      zh: "异位词 = 每种字母出现次数完全相同。只有 26 个小写字母,需要真的排序吗?",
    },
    key: {
      en: (
        <>
          Use an <code>int</code> array of length 26 as a counter. While scanning
          s do <code>count[c - &apos;a&apos;]++</code>, while scanning t do{" "}
          <code>count[c - &apos;a&apos;]--</code>. The two strings are anagrams
          if every entry ends at 0 (check the lengths first). O(n) time and O(26)
          = O(1) space, faster than the O(n log n) sorting solution. Replacing a
          hash table with a fixed-size array whenever the alphabet is small is a
          common optimization in string problems; LC 438 and LC 383 use it too.
          If the input can contain any Unicode character, go back to a hash map.
        </>
      ),
      zh: (
        <>
          开一个长度 26 的 <code>int</code> 数组当计数器:扫 s 时{" "}
          <code>count[c-&apos;a&apos;]++</code>,扫 t 时{" "}
          <code>count[c-&apos;a&apos;]--</code>,最后每一项都为 0
          即异位词(先比长度可以提前否决)。O(n) 时间、O(26)=O(1) 空间,比排序法
          O(n log n) 更快。「字符集有限 → 用数组代替哈希表」是字符串题的高频优化,
          LC 438、383 都靠它。如果输入可能包含任意 Unicode 字符,就换回哈希表。
        </>
      ),
    },
  },
  {
    lc: 205,
    title: { en: "Isomorphic Strings", zh: "同构字符串" },
    d: "easy",
    tags: [
      { en: "Two maps", zh: "双映射" },
      { en: "Hashing idea", zh: "哈希思想" },
    ],
    hint: {
      en: "Isomorphic means the mapping works in both directions: each character of s maps to exactly one character of t, and the other way around. Is one map enough?",
      zh: "「同构」要求映射双向唯一:s 的每个字符只能映到 t 的一个字符,反过来也是。只建一个方向的映射够吗?",
    },
    key: {
      en: (
        <>
          Keep two maps at the same time, s to t and t to s, and check every
          position. If either direction disagrees with what was recorded before,
          return false. A single map would accept &quot;badc&quot; and
          &quot;baba&quot;, where two different characters of s both map to the
          same character of t. One pass, O(n).
        </>
      ),
      zh: (
        <>
          同时维护 s→t 和 t→s 两张映射表,逐位检查:若某位上任一方向与已记录的映射冲突,
          返回 false。只建单向映射会放过 &quot;badc&quot; 和 &quot;baba&quot;
          —— s 的两个不同字符映到了 t 的同一个字符。一次遍历,O(n)。
        </>
      ),
    },
  },
  {
    lc: 14,
    title: { en: "Longest Common Prefix", zh: "最长公共前缀" },
    d: "easy",
    tags: [
      { en: "Vertical scan", zh: "纵向扫描" },
      { en: "Simulation", zh: "模拟" },
    ],
    hint: {
      en: "Do not compare the strings in pairs. Compare them column by column: first character 0 of every string, then character 1, and so on.",
      zh: "别把字符串两两比较 —— 竖着看:先比所有串的第 0 位,再比第 1 位……",
    },
    key: {
      en: (
        <>
          Vertical scan: at column i, stop as soon as one string is shorter than
          i+1 or has a different character. The answer is the first i characters.
          The worst case is O(S), where S is the total number of characters, but
          the scan usually stops at the first column where the strings disagree.
          Taking the first string as a ruler and trimming it against each other
          string costs the same.
        </>
      ),
      zh: (
        <>
          纵向扫描:比到第 i 列时,只要有一个串长度不足或字符不同就停,答案就是前 i
          个字符。最坏 O(S)(S 为所有字符总数),但通常在第一个分歧列就提前结束。
          「以第一个串为标尺逐个横向裁剪」的写法复杂度相同。
        </>
      ),
    },
  },
  {
    lc: 151,
    title: { en: "Reverse Words in a String", zh: "反转字符串中的单词" },
    d: "medium",
    tags: [
      { en: "Two pointers", zh: "双指针" },
      { en: "Double reversal", zh: "两次翻转" },
    ],
    hint: {
      en: "The built-in split solves it in one line. The follow-up asks for O(1) extra space: reverse the whole thing once, then reverse each word back.",
      zh: "语言自带的 split 能一行解决;进阶要求 O(1) 额外空间 —— 整体翻一次,每个单词再各自翻回来。",
    },
    key: {
      en: (
        <>
          One-liner: split on whitespace, drop the empty pieces, reverse the
          list, join with a single space. For O(1) extra space (possible only in
          a language where you can edit a character array in place) use three
          steps: reverse the whole array, reverse each word back, then compact
          the extra spaces in place. This is the same reversal trick as LC 189,
          Rotate Array.
        </>
      ),
      zh: (
        <>
          一行流:按空白 split → 过滤空串 → 倒序 → 用一个空格 join。想做到 O(1)
          额外空间(只有能原地改字符数组的语言才可行)则三步走:先整体 reverse,
          再对每个单词局部 reverse,最后原地压缩多余空格 —— 和 LC 189
          轮转数组是同一个翻转技巧。
        </>
      ),
    },
  },
  {
    lc: 438,
    title: {
      en: "Find All Anagrams in a String",
      zh: "找到字符串中所有字母异位词",
    },
    d: "medium",
    tags: [
      { en: "Fixed-size window", zh: "定长滑窗" },
      { en: "Counting array", zh: "计数数组" },
    ],
    hint: {
      en: "An anagram of p always has the length of p, so the window has a fixed size. When the window moves one step right, only two counters change.",
      zh: "p 的异位词长度固定 = 窗口长度固定。窗口右移一格时,计数器只需要改动两个位置。",
    },
    key: {
      en: (
        <>
          A fixed-size sliding window plus a counting array of length 26. When
          the window moves, increment the counter for the character that enters
          and decrement the one for the character that leaves, then compare the
          window counts with the counts of p. Keeping a single &quot;number of
          letters whose count already matches&quot; makes that comparison O(1).
          O(n) time. A fixed substring length is a strong signal for this
          pattern, because it removes the shrinking loop that a general sliding
          window needs.
        </>
      ),
      zh: (
        <>
          定长滑动窗口 + 长度 26 的计数数组:窗口右移时,进窗的字符计数 ++、
          出窗的字符计数 --,再比较窗口计数与 p 的计数。额外维护一个「已匹配的字母种数」
          可以把这次比较压到 O(1)。整体 O(n)。「子串长度固定」是定长滑窗的强信号 ——
          它比通用滑窗少一个收缩循环。
        </>
      ),
    },
  },
  {
    lc: 8,
    title: { en: "String to Integer (atoi)", zh: "字符串转换整数 (atoi)" },
    d: "medium",
    tags: [
      { en: "Simulation", zh: "模拟" },
      { en: "Edge cases", zh: "边界处理" },
    ],
    hint: {
      en: "The difficulty is in the details, not the algorithm: leading spaces, an optional sign, an invalid character, and overflow. Handle one state at a time.",
      zh: "难点不在算法,在细节:前导空格、可选正负号、非法字符、溢出。按「状态」一步步来,别跳步。",
    },
    key: {
      en: (
        <>
          Four fixed steps. 1) Skip the leading spaces. 2) Read one optional{" "}
          <code>+</code> or <code>-</code>. 3) Read digits and stop at the first
          character that is not a digit. 4) Check for overflow before each
          accumulation: if <code>ans &gt; (MAX - digit) / 10</code>, clamp to the
          32-bit limit. A Python <code>int</code> has no fixed width, so you can
          clamp at the end, but in Java and JavaScript you must check on every
          step. This problem tests whether you can turn a specification into
          branches that miss nothing and overlap nowhere, which is why it is worth
          writing three times.
        </>
      ),
      zh: (
        <>
          固定流程四步走:① 跳过前导空格;② 读一个可选的 <code>+</code>/
          <code>-</code>;③ 逐位读数字,遇非数字立刻停;④ 每次累加前先判溢出
          (<code>ans &gt; (MAX - digit) / 10</code> 就该截断到 32 位边界)。
          Python 的 <code>int</code> 没有固定宽度,可以最后再 clamp;
          Java/JS 必须边算边防。这题考的是把需求翻译成不重不漏的分支 ——
          值得亲手写三遍。
        </>
      ),
    },
  },
  {
    lc: 28,
    title: {
      en: "Find the Index of the First Occurrence in a String",
      zh: "找出字符串中第一个匹配项的下标",
    },
    d: "easy",
    tags: [
      { en: "KMP", zh: "KMP" },
      { en: "Substring matching", zh: "子串匹配" },
    ],
    hint: {
      en: "The naive O(n·m) scan passes, but the point of this problem is to write KMP once. When a comparison fails, does the pointer into the text really have to go back?",
      zh: "朴素 O(n·m) 就能过,但这题存在的意义是让你写一遍 KMP:失配时,主串指针真的需要回退吗?",
    },
    key: {
      en: (
        <>
          KMP: first build the prefix function of the pattern, where{" "}
          <code>lps[i]</code> is the length of the longest proper prefix of{" "}
          <code>pattern[0..i]</code> that is also a suffix of it. During
          matching, the pointer into the text never moves back. On a mismatch you
          only set <code>j = lps[j-1]</code> and compare again. O(m) to build
          plus O(n) to match. Section §04 of this chapter explains where{" "}
          <code>lps</code> comes from. Before memorizing the template, be able to
          answer why jumping to <code>lps[j-1]</code> cannot skip a valid match.
        </>
      ),
      zh: (
        <>
          KMP:先对 pattern 求前缀函数,<code>lps[i]</code> = 子串{" "}
          <code>pattern[0..i]</code> 的最长「真前缀 = 真后缀」长度。匹配时主串指针永不回退,
          失配只把 <code>j</code> 跳到 <code>lps[j-1]</code> 继续比。预处理 O(m) +
          匹配 O(n)。本章 §04 把 <code>lps</code> 的来历讲透了 ——
          背模板之前,先能回答「为什么跳到 <code>lps[j-1]</code> 不会漏解」。
        </>
      ),
    },
  },
  {
    lc: 6,
    title: { en: "Zigzag Conversion", zh: "Z 字形变换" },
    d: "medium",
    tags: [
      { en: "Simulation", zh: "模拟" },
      { en: "Collect by row", zh: "按行收集" },
    ],
    hint: {
      en: "Do not build the two-dimensional grid. Give each row its own collector and keep one direction variable that bounces between top and bottom.",
      zh: "不要真的画出二维网格 —— 给每一行开一个收集器,再用一个「方向变量」上下反弹即可。",
    },
    key: {
      en: (
        <>
          Create <code>numRows</code> collectors (a StringBuilder or a list each).
          Walk the input once with a <code>row</code> index and a direction{" "}
          <code>dir = ±1</code>, flipping the direction at row 0 and at the last
          row. Every character is appended exactly once, then the rows are joined
          in order: O(n). The arithmetic solution, which computes the indices
          directly from the period <code>2·numRows - 2</code>, is a good answer
          to the follow-up.
        </>
      ),
      zh: (
        <>
          开 <code>numRows</code> 个收集器(StringBuilder 或 list),用 <code>row</code>{" "}
          指针和方向变量 <code>dir = ±1</code> 走一遍输入,碰到第 0 行或最后一行就反向。
          每个字符恰好被收集一次,最后按行拼接,O(n)。数学解法(按周期{" "}
          <code>2·numRows - 2</code> 直接算下标)可作为追问时的进阶解法。
        </>
      ),
    },
  },
  {
    lc: 76,
    title: { en: "Minimum Window Substring", zh: "最小覆盖子串" },
    d: "hard",
    tags: [
      { en: "Sliding window", zh: "滑动窗口" },
      { en: "Counting array", zh: "计数数组" },
      { en: "need / have", zh: "need/have" },
    ],
    hint: {
      en: "This is LC 3 one level up: the condition for a valid window changes from “no repeated character” to “covers every character of t”. How do you check that in O(1)?",
      zh: "LC 3 的进阶版:窗口的合法条件从「无重复」换成「覆盖 t 的所有字符」。怎么 O(1) 判断覆盖?",
    },
    key: {
      en: (
        <>
          A sliding window with two counters. <code>need</code> records how many
          of each character of t are still missing, and <code>have</code> records
          how many distinct characters are already satisfied. Extend r to pay off
          the debt. As soon as <code>have</code> equals the number of distinct
          characters in t, the window is valid, so shrink from l to look for a
          shorter answer, and stop shrinking when the window stops being valid.
          Each character enters and leaves the window at most once, so O(n). The
          three sliding-window questions (what do I maintain, when do I extend,
          when do I shrink) reach their complete form here.
        </>
      ),
      zh: (
        <>
          滑窗 + 两个计数器:<code>need</code> 记录 t 中每种字符还欠多少,
          <code>have</code> 记录已满足的字符种数。r 右扩补欠账,一旦{" "}
          <code>have</code> 等于 t 的字符种类总数,窗口就合法,这时收缩 l
          找更短答案,直到窗口不再合法为止。每个字符最多进出窗口各一次,O(n)。
          滑窗三问(维护什么 / 何时扩 / 何时缩)在这题达到最完整的形态。
        </>
      ),
    },
  },
];
