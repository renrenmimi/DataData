// 第 2 章 · 字符串 —— 题单与测验数据(双语)。
// 题单覆盖:对撞指针、计数数组、滑动窗口、模拟、KMP,从 Easy 铺到 Hard;
// hint 只给方向不剧透,key 用一段话把最优解讲透。
// 题目标题的 en 用 LeetCode 官方英文名,zh 用官方中文名。

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

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
      zh: "题目给的是字符数组(可变!),不是字符串。两端各站一个指针,想想每一步该干什么。",
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
    d: "medium",
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
          <code>2·numRows - 2</code> 直接算下标)可作追问的加分项。
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

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "What does it mean exactly to say that a string is immutable?",
      zh: "「字符串不可变(immutable)」的准确含义是?",
    },
    opts: [
      {
        en: "Once a string object is created its contents never change. Every operation that looks like an edit returns a new string.",
        zh: "字符串对象一旦创建,内容永不改变;所有看起来在「修改」的操作都返回一个新字符串",
      },
      {
        en: "Once a variable is assigned a string, it can never point at another string.",
        zh: "字符串变量赋值之后就不能再指向别的字符串",
      },
      {
        en: "A string cannot take part in operations such as concatenation or replacement.",
        zh: "字符串不能参与拼接、替换等操作",
      },
      {
        en: "A string can only hold letters, not digits or symbols.",
        zh: "字符串只能存字母,不能存数字和符号",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A variable can be repointed at any time. Writing s = s + \"!\" makes s point at a new string. Immutability is about the contents of the object, not the variable.",
        zh: "变量随时可以改指向:s = s + \"!\" 就让 s 指向了新串。不可变说的是「对象内容」,不是「变量」。",
      },
      {
        en: "The opposite is true. Concatenation and replacement both work. Their result is simply a newly built string, and the original is untouched.",
        zh: "恰恰相反,拼接和替换都可以做 —— 只是结果是新造的字符串,原件分毫未动。",
      },
      {
        en: "A string can hold any character. Immutability restricts whether you can edit it in place, not what it can store.",
        zh: "字符串能装任何字符。不可变约束的是「能不能原地改」,和存什么内容无关。",
      },
    ],
    why: {
      en: "Immutable means the contents of the object are fixed. replace, toUpperCase, and concatenation all look like edits but build a new string instead. Half the complexity results in this chapter follow from that one fact: concatenation is O(n + m), and += inside a loop is O(n²).",
      zh: "不可变 = 对象内容焊死。replace、toUpperCase、拼接看起来在「改」,其实都在重抄一份新的 —— 本章一半的复杂度结论都由这一个事实推出:拼接 O(n+m)、循环 += O(n²)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "You run s += c n times in a loop, appending one character each time. What is the total time complexity?",
      zh: "在循环里执行 n 次 s += c(每次追加 1 个字符),总时间复杂度是?",
    },
    opts: [
      {
        en: "O(n²), because each += copies the whole old string: 1 + 2 + … + n character copies",
        zh: "O(n²) —— 每次 += 都要重抄整个旧串,共 1+2+…+n 次拷贝",
      },
      { en: "O(n), because each step adds only one character", zh: "O(n) —— 每次只加了 1 个字符" },
      { en: "O(n log n)", zh: "O(n log n)" },
      { en: "O(1), string operations are fast", zh: "O(1) —— 字符串操作都很快" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "“Only one character” is the illusion. Because the string is immutable, nothing can be appended to the old one, so the i-th += allocates a string of length i and copies every old character into it.",
        zh: "「只加 1 个字符」是错觉:不可变意味着没法在旧串尾部续写,第 i 次 += 要新建长 i 的串并拷贝全部旧字符。",
      },
      {
        en: "A log factor comes from halving the work at each step. Here every step copies the whole string again, which is the sum of an arithmetic series.",
        zh: "log 来自「每步砍一半」的结构;这里是实打实的逐次全量重抄,是等差数列求和。",
      },
      {
        en: "One step looks cheap, but the total is 1 + 2 + … + n = n(n+1)/2. The counter in ConcatLab shows how far apart the two curves get.",
        zh: "单次看着快,累计成本是 1+2+…+n = n(n+1)/2 —— ConcatLab 里的计数器会告诉你差距有多夸张。",
      },
    ],
    why: {
      en: "The i-th concatenation copies about i characters, so the total is 1 + 2 + … + n ≈ n²/2. This applies to Java, Python, and JavaScript alike. The fix is the same in all three: append into a mutable container and build the string once at the end, which brings the total back to O(n).",
      zh: "第 i 次拼接拷贝约 i 个字符,总量 1+2+…+n ≈ n²/2。Java、Python、JavaScript 都一样。解法也一样:先往可变容器里攒,最后一次性成串 —— 总量回到 O(n)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In Java, what is the correct way to compare the contents of two strings?",
      zh: "Java 里比较两个字符串的内容,正确做法是?",
    },
    opts: [
      {
        en: "a.equals(b), because == compares references, that is, whether the two are the same object",
        zh: "用 a.equals(b) —— == 比较的是引用(是不是同一个对象)",
      },
      { en: "a == b, short and correct", zh: "用 a == b,简洁又正确" },
      {
        en: "Convert both to char[] and compare position by position; nothing else is reliable",
        zh: "先转成 char[] 再逐位比,别的都不可靠",
      },
      { en: "a.compareTo(b) > 0", zh: "用 a.compareTo(b) > 0" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "== only asks whether the two are the same object. Two literals happen to be equal because the compiler puts them in the string pool, but new String(\"data\") exposes the mistake immediately.",
        zh: "== 只问「是不是同一个对象」。两个字面量因为常量池碰巧相等,但 new String(\"data\") 立刻现原形。",
      },
      {
        en: "equals already compares character by character. There is no need to unpack the string into an array yourself.",
        zh: "equals 内部就是逐字符比较,已经替你写好了,不需要手工拆数组。",
      },
      {
        en: "compareTo returns the lexicographic ordering as a negative number, zero, or a positive number. Using > 0 to test equality is the wrong test; equality is compareTo(b) == 0, and equals says it more clearly.",
        zh: "compareTo 返回的是字典序关系(负 / 零 / 正)。用 > 0 判断「相等」逻辑就错了;真要用它,相等是 == 0,但判相等直接用 equals 更清楚。",
      },
    ],
    why: {
      en: "In Java, == on objects compares references and equals compares contents. The string pool makes \"abc\" == \"abc\" true for compile-time literals, which creates the false impression that == works. It stops working with new String or with a string built at run time. Note that this trap is specific to Java: in JavaScript === on strings compares values, and in Python you use == for equality and keep is for identity.",
      zh: "Java 里 == 比引用、equals 比内容。常量池让编译期字面量 \"abc\" == \"abc\" 为 true,给人「== 能用」的错觉,一遇到 new String 或运行期拼接就失效。注意这个坑是 Java 特有的:JavaScript 的 === 对字符串比的是值,Python 判相等用 ==、is 只问是不是同一个对象。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these statements about UTF-8 are correct? (Select all that apply.)",
      zh: "关于 UTF-8 编码,下列说法正确的有?(多选)",
    },
    opts: [
      {
        en: "Characters in the ASCII range (English letters, digits) take 1 byte",
        zh: "ASCII 范围的字符(英文字母、数字)只占 1 个字节",
      },
      {
        en: "A common Chinese character usually takes 3 bytes",
        zh: "常用中文汉字通常占 3 个字节",
      },
      {
        en: "In UTF-8 every character takes exactly 2 bytes",
        zh: "UTF-8 里每个字符固定占 2 个字节",
      },
      { en: "Most emoji take 4 bytes", zh: "绝大多数 emoji 占 4 个字节" },
    ],
    correct: [0, 1, 3],
    missHint: {
      en: "Think back to EncodeLab. With the input “A字🙂”, how many bytes does each of the three characters take? 1, 3, and 4. Which options does that match?",
      zh: "回想 EncodeLab:输入「A字🙂」时,三个字符的字节数各是多少?1、3、4 —— 对应哪几个选项?",
    },
    extraHint: {
      en: "“Exactly 2 bytes” describes UCS-2, or UTF-16 inside the Basic Multilingual Plane. UTF-8 exists precisely because it is variable length: 1 to 4 bytes.",
      zh: "「固定 2 字节」描述的是 UCS-2 或 UTF-16 在基本多文种平面内的情况。UTF-8 的立身之本恰恰是变长:1 到 4 字节都有。",
    },
    why: {
      en: "UTF-8 chooses the byte length from the code point: up to U+007F takes 1 byte and is byte-identical to ASCII, common Chinese characters fall in the 3-byte range, and emoji have code points above U+FFFF and take 4 bytes. Saving space on common text while staying compatible with ASCII is why it became the standard on the web.",
      zh: "UTF-8 按码点大小变长编码:≤ U+007F 用 1 字节(字节层面完全兼容 ASCII),常用汉字落在 3 字节区,emoji 的码点超过 U+FFFF 要 4 字节。「常用文本省空间 + 兼容 ASCII」正是它成为互联网标准的原因。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Why does Python have no separate char type?",
      zh: "为什么 Python 没有单独的 char(字符)类型?",
    },
    opts: [
      {
        en: "The designers decided a str of length 1 can do everything a character type would do, and one type is simpler than two",
        zh: "设计者认为长度为 1 的 str 足以胜任字符的所有职责,统一成一种类型更简单",
      },
      {
        en: "Python is too slow to support a character type",
        zh: "Python 性能太差,支持不了字符类型",
      },
      {
        en: "Python strings are mutable, so a character type is unnecessary",
        zh: "因为 Python 的字符串是可变的,不需要字符类型",
      },
      {
        en: "It is a historical bug that was never fixed",
        zh: "历史遗留 bug,官方一直没修",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Performance has nothing to do with it. It is a deliberate language design: s[0] returns a str of length 1, and every string operation still applies to it, so there is no second API to learn.",
        zh: "和性能无关 —— 这是刻意的语言设计:s[0] 返回一个长度为 1 的 str,所有字符串操作对它照常适用,不用学两套 API。",
      },
      {
        en: "Python str is immutable, exactly like Java String and JavaScript strings. Whether a type is mutable is a separate question from whether a character type exists.",
        zh: "Python 的 str 恰恰是不可变的,和 Java String、JavaScript 字符串一样。可变与否和有没有 char 类型是两回事。",
      },
      {
        en: "It is a documented design decision (“there should be one obvious way to do it”), not a bug.",
        zh: "这是写进设计哲学的决定(「应该只有一种明显的做法」),不是 bug。",
      },
    ],
    why: {
      en: "Python treats a character as a string of length 1: indexing, slicing, and iteration all return str. The cost is that you call ord() or chr() explicitly to move between a character and its code point, while Java char and JavaScript charCodeAt give you a number directly.",
      zh: "Python 把「字符」统一为长度 1 的字符串:下标、切片、遍历返回的都是 str。代价是想在字符和码点之间转换要显式调 ord()/chr(),而 Java 的 char、JavaScript 的 charCodeAt 直接就是数字。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Which signal should make you think of a sliding window first?",
      zh: "看到什么信号,应该第一时间想到「滑动窗口」?",
    },
    opts: [
      {
        en: "You need the best contiguous substring or subarray, and the condition inside the window can be updated step by step as elements enter and leave",
        zh: "求「连续子串 / 子数组」的最值,且窗口内维护的条件能随进出增量更新",
      },
      {
        en: "The problem mentions strings at all",
        zh: "只要题目里出现「字符串」三个字",
      },
      {
        en: "You need to enumerate every subsequence, which may skip elements",
        zh: "需要枚举所有子序列(可以不连续)的时候",
      },
      { en: "The array has to be sorted first", zh: "数组必须先排好序的时候" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "String problems also use two pointers, counting arrays, KMP, and dynamic programming. A sliding window needs the two specific features: contiguous, and incrementally maintainable.",
        zh: "字符串题还有对撞指针、计数数组、KMP、DP 等一大家子 —— 滑窗只认「连续 + 可增量维护」这两个特征。",
      },
      {
        en: "A subsequence may skip elements, so it is not one contiguous range. A window cannot slide over a gap; that belongs to dynamic programming or backtracking.",
        zh: "子序列可以跳着选,不是一段连续区间 —— 窗口滑不出「跳跃」,那是 DP / 回溯的地盘。",
      },
      {
        en: "Sorting usually destroys the window, because the point of the window is that it preserves the original order and adjacency.",
        zh: "排序反而常常毁掉滑窗:窗口的意义就在于保持原序列的连续性和顺序。",
      },
    ],
    why: {
      en: "A sliding window needs two things. First, the answer is a contiguous range. Second, when one element enters or leaves, the quantity you maintain (a sum, a set of counts, a set of seen characters) can be updated in O(1). LC 3, 209, 438, and 76 all satisfy both.",
      zh: "滑窗两大前提:① 答案是连续区间;② 窗口进 / 出一个元素时,维护的量(和、计数、去重集合)能 O(1) 更新。LC 3、209、438、76 全部命中这两条。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          In JavaScript, what is the value of <code>&quot;👍&quot;.length</code>?
        </>
      ),
      zh: (
        <>
          JavaScript 里,<code>&quot;👍&quot;.length</code> 的值是多少?
        </>
      ),
    },
    placeholder: { en: "Enter a number…", zh: "输入一个数字…" },
    answers: ["2"],
    hint: {
      en: "JavaScript length counts UTF-16 code units. The code point of 👍 is above U+FFFF, so it needs a pair of code units, called a surrogate pair.",
      zh: "JavaScript 的 length 数的是 UTF-16 编码单元;👍 的码点超出了 U+FFFF,需要一对编码单元(代理对)来表示。",
    },
    why: {
      en: "The code point of 👍 is U+1F44D, which is above U+FFFF, so UTF-16 stores it as two code units and length is 2. To count code points instead, use Array.from(s).length or iterate with for...of. Java behaves the same way; Python 3 returns 1 because str is indexed by code point.",
      zh: "👍 的码点是 U+1F44D,超过 U+FFFF,在 UTF-16 里要拆成两个编码单元(代理对),所以 length 是 2。想按码点数,用 Array.from(s).length 或 for...of 遍历。Java 的行为相同;Python 3 的 len 是 1,因为 str 按码点索引。",
    },
  },
];
