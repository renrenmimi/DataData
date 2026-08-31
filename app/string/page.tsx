"use client";

// Chapter 2 · Strings (bilingual) — "an array whose characters cannot be changed".
// Ten sections: intuition (immutability / encoding / the char-array twin) →
// memory and encoding (ASCII → Unicode → UTF-8) → core operations (key point: why
// += in a loop is O(n²)) → hand-written implementations (mutable buffer / indexOf / KMP) →
// three-language comparison → converging pointers · sliding window · expand-around-center
// + three walkthroughs → problem set → quiz → key points.
//
// Bilingual convention: inline JSX uses <T en={…} zh={…} />, component copy props take { en, zh }.
// The code prop of a code block is also Loc<string>: the two versions differ only in their
// comments, and every executable line must match line for line, otherwise the hl
// highlight line numbers drift.

import {
  Hero,
  Section,
  Callout,
  BigO,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { ArrayStepper, type ArrayFrame } from "@/lib/stepper";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { T, useL } from "@/lib/i18n";
import { PROBLEMS, QUIZ } from "@/lib/string-data";
import { EncodeLab, ConcatLab } from "./viz";
import "./chapter.css";

/* ================= Walkthrough animation frames ================= */

// LC 125 Valid Palindrome: converging pointers, s = "A?bB,a"
const S125 = ["A", "?", "b", "B", ",", "a"];
const F125: ArrayFrame[] = [
  {
    cells: S125.map((v) => ({ v })),
    ptrs: [
      { i: 0, label: "L" },
      { i: 5, label: "R" },
    ],
    msg: (
      <T
        en={
          <>
            The rule: look only at <b>letters and digits</b>, and ignore case. L
            and R start at the two ends and move toward each other.
          </>
        }
        zh={
          <>
            规则:只看<b>字母和数字</b>,忽略大小写。L、R 从两端出发,向中间对撞。
          </>
        }
      />
    ),
  },
  {
    cells: [
      { v: "A", state: "lit" },
      { v: "?" },
      { v: "b" },
      { v: "B" },
      { v: "," },
      { v: "a", state: "lit" },
    ],
    ptrs: [
      { i: 0, label: "L" },
      { i: 5, label: "R" },
    ],
    msg: (
      <T
        en={
          <>
            <b>A</b> at L against <b>a</b> at R. Both are letters, and in lower
            case a equals a, so this pair matches. Both pointers step inward.
          </>
        }
        zh={
          <>
            L 的 <b>A</b> 对 R 的 <b>a</b>:都是字母,统一小写后 a = a,这一对匹配。
            两个指针各向内走一步。
          </>
        }
      />
    ),
  },
  {
    cells: [
      { v: "A", state: "ok" },
      { v: "?", state: "bad" },
      { v: "b" },
      { v: "B" },
      { v: "," },
      { v: "a", state: "ok" },
    ],
    ptrs: [
      { i: 1, label: "L" },
      { i: 4, label: "R" },
    ],
    msg: (
      <T
        en={
          <>
            L now points at <b>?</b>, which is neither a letter nor a digit. It
            takes no part in the comparison, so L moves on. This step compares
            nothing; it only moves a pointer.
          </>
        }
        zh={
          <>
            L 现在指着 <b>?</b>:既不是字母也不是数字,不参与判断,直接跳过,L++。
            这一步不做比较,只挪指针。
          </>
        }
      />
    ),
  },
  {
    cells: [
      { v: "A", state: "ok" },
      { v: "?", state: "ghost" },
      { v: "b" },
      { v: "B" },
      { v: ",", state: "bad" },
      { v: "a", state: "ok" },
    ],
    ptrs: [
      { i: 2, label: "L" },
      { i: 4, label: "R" },
    ],
    msg: (
      <T
        en={
          <>
            R points at <b>,</b>, also punctuation, so R moves on as well. Each
            pointer clears its own side before a comparison happens.
          </>
        }
        zh={
          <>
            R 指着 <b>,</b>:同样是标点,跳过,R--。每个指针各自清理自己那一侧,
            清理完才做比较。
          </>
        }
      />
    ),
  },
  {
    cells: [
      { v: "A", state: "ok" },
      { v: "?", state: "ghost" },
      { v: "b", state: "lit" },
      { v: "B", state: "lit" },
      { v: ",", state: "ghost" },
      { v: "a", state: "ok" },
    ],
    ptrs: [
      { i: 2, label: "L" },
      { i: 3, label: "R" },
    ],
    msg: (
      <T
        en={
          <>
            <b>b</b> at L against <b>B</b> at R. In lower case b equals b, so
            this pair matches too. Keep going inward.
          </>
        }
        zh={
          <>
            L 的 <b>b</b> 对 R 的 <b>B</b>:小写后 b = b,这一对也匹配。继续向内。
          </>
        }
      />
    ),
  },
  {
    cells: [
      { v: "A", state: "ok" },
      { v: "?", state: "ghost" },
      { v: "b", state: "ok" },
      { v: "B", state: "ok" },
      { v: ",", state: "ghost" },
      { v: "a", state: "ok" },
    ],
    msg: (
      <T
        en={
          <>
            L and R have met. The invariant of the loop was: every pair of
            letters and digits outside the range [L, R] has already been
            compared and matched. When the range becomes empty, the whole string
            is a <b>palindrome</b>. Each character is looked at once, so the time
            is <b>O(n)</b> and the extra space is <b>O(1)</b>, because no new
            string was built.
          </>
        }
        zh={
          <>
            L 和 R 相遇了。循环的不变量是:区间 [L, R]{" "}
            之外的每一对字母数字都已经比过,而且都相等。区间空了,整个串就是
            <b>回文</b>。每个字符只被看一次,时间 <b>O(n)</b>、额外空间{" "}
            <b>O(1)</b> —— 全程没有新建任何字符串。
          </>
        }
      />
    ),
  },
];

// LC 3 Longest Substring Without Repeating Characters: sliding window + Set, s = "abcabcbb"
const S3 = ["a", "b", "c", "a", "b", "c", "b", "b"];
const w3 = (
  l: number,
  r: number,
  marks?: Record<number, "ok" | "bad" | "ghost">,
): ArrayFrame["cells"] =>
  S3.map((v, i) => ({
    v,
    state: marks?.[i] ?? (i >= l && i <= r ? "lit" : undefined),
  }));
const F3: ArrayFrame[] = [
  {
    cells: S3.map((v) => ({ v })),
    msg: (
      <T
        en={
          <>
            The window [l..r] holds a stretch with no repeated character. A Set
            travels with it and records which characters are inside.
          </>
        }
        zh={
          <>
            窗口 [l..r] 是当前「无重复字符」的一段;随身带一个 Set,
            记录窗口里现在有哪些字符。
          </>
        }
      />
    ),
  },
  {
    cells: w3(0, 0),
    ptrs: [
      { i: 0, label: "l" },
      { i: 0, label: "r" },
    ],
    msg: (
      <T
        en={
          <>
            r=0: <b>a</b> is not in the Set, so it enters. The window is
            &quot;a&quot;, length 1. Set = {"{a}"}.
          </>
        }
        zh={
          <>
            r=0:<b>a</b> 不在 Set 里,进窗。窗口 &quot;a&quot;,长度 1。Set ={" "}
            {"{a}"}。
          </>
        }
      />
    ),
  },
  {
    cells: w3(0, 1),
    ptrs: [
      { i: 0, label: "l" },
      { i: 1, label: "r" },
    ],
    msg: (
      <T
        en={
          <>
            r=1: <b>b</b> is not a repeat, so it enters. The window is
            &quot;ab&quot;, length 2.
          </>
        }
        zh={
          <>
            r=1:<b>b</b> 不重复,进窗。窗口 &quot;ab&quot;,长度 2。
          </>
        }
      />
    ),
  },
  {
    cells: w3(0, 2),
    ptrs: [
      { i: 0, label: "l" },
      { i: 2, label: "r" },
    ],
    msg: (
      <T
        en={
          <>
            r=2: <b>c</b> enters. The window is &quot;abc&quot;, length <b>3</b>
            , a new best. Set = {"{a,b,c}"}.
          </>
        }
        zh={
          <>
            r=2:<b>c</b> 进窗。窗口 &quot;abc&quot;,长度 <b>3</b>,刷新纪录。Set
            = {"{a,b,c}"}。
          </>
        }
      />
    ),
  },
  {
    cells: w3(1, 3, { 0: "ghost" }),
    ptrs: [
      { i: 1, label: "l" },
      { i: 3, label: "r" },
    ],
    msg: (
      <T
        en={
          <>
            r=3: another <b>a</b>, and the Set already holds one. Move l right to
            drop s[0]=a, then let the new a in. The window is &quot;bca&quot;,
            length 3, which ties the best.
          </>
        }
        zh={
          <>
            r=3:又来一个 <b>a</b>,Set 里已经有了。l 右移吐出 s[0]=a,再让新的 a
            进窗。窗口 &quot;bca&quot;,长度 3,与纪录持平。
          </>
        }
      />
    ),
  },
  {
    cells: w3(2, 4, { 0: "ghost", 1: "ghost" }),
    ptrs: [
      { i: 2, label: "l" },
      { i: 4, label: "r" },
    ],
    msg: (
      <T
        en={
          <>
            r=4: <b>b</b> repeats, so drop s[1]=b. The window is
            &quot;cab&quot;. Notice that l never moves back. Any start position
            further left would still contain the duplicate that was just
            removed.
          </>
        }
        zh={
          <>
            r=4:<b>b</b> 重复,吐出 s[1]=b。窗口 &quot;cab&quot;。注意 l 从不回头
            —— 更靠左的起点仍然包含刚刚被吐出的那个重复字符。
          </>
        }
      />
    ),
  },
  {
    cells: w3(3, 5, { 0: "ghost", 1: "ghost", 2: "ghost" }),
    ptrs: [
      { i: 3, label: "l" },
      { i: 5, label: "r" },
    ],
    msg: (
      <T
        en={
          <>
            r=5: <b>c</b> repeats, so drop s[2]=c. The window is
            &quot;abc&quot;, length 3.
          </>
        }
        zh={
          <>
            r=5:<b>c</b> 重复,吐出 s[2]=c。窗口 &quot;abc&quot;,长度 3。
          </>
        }
      />
    ),
  },
  {
    cells: w3(5, 6, { 0: "ghost", 1: "ghost", 2: "ghost", 3: "ghost", 4: "ghost" }),
    ptrs: [
      { i: 5, label: "l" },
      { i: 6, label: "r" },
    ],
    msg: (
      <T
        en={
          <>
            r=6: <b>b</b> repeats again. This time two characters have to leave,
            s[3]=a and s[4]=b, until no b is left inside. The window is
            &quot;cb&quot;, length 2.
          </>
        }
        zh={
          <>
            r=6:<b>b</b> 再次重复。这次要连吐 s[3]=a、s[4]=b 两个,直到窗口里没有 b。
            窗口 &quot;cb&quot;,长度 2。
          </>
        }
      />
    ),
  },
  {
    cells: S3.map((v, i) => ({
      v,
      state: i <= 2 ? "ok" : i === 7 ? "lit" : "ghost",
    })),
    ptrs: [
      { i: 7, label: "l" },
      { i: 7, label: "r" },
    ],
    msg: (
      <T
        en={
          <>
            r=7 works the same way and the window shrinks to &quot;b&quot;. The
            scan is over: the longest substring without a repeat is{" "}
            <b>&quot;abc&quot;, length 3</b>. Both l and r only move forward, so
            each character enters and leaves the window at most once:{" "}
            <b>O(n)</b>.
          </>
        }
        zh={
          <>
            r=7 同理,窗口缩到 &quot;b&quot;。扫描结束:最长无重复子串是{" "}
            <b>&quot;abc&quot;,长度 3</b>。l 和 r 都只前进不后退,
            每个字符最多进出窗口一次,所以是 <b>O(n)</b>。
          </>
        }
      />
    ),
  },
];

// LC 5 Longest Palindromic Substring: expand around center, s = "babad"
const S5 = ["b", "a", "b", "a", "d"];
const CENTER = { en: "center", zh: "中心" };
const F5: ArrayFrame[] = [
  {
    cells: S5.map((v) => ({ v })),
    msg: (
      <T
        en={
          <>
            A palindrome of odd length has a character at its center; one of even
            length has a gap at its center. For n characters there are n
            characters plus n−1 gaps, so <b>2n−1</b> centers in total. Try each
            center and expand outward from it.
          </>
        }
        zh={
          <>
            奇数长的回文,中心是一个字符;偶数长的回文,中心是一个空隙。n
            个字符对应 n 个字符中心加 n−1 个空隙中心,共 <b>2n−1</b> 个中心。
            挨个试,每个中心向两边扩。
          </>
        }
      />
    ),
  },
  {
    cells: [
      { v: "b", state: "lit" },
      { v: "a" },
      { v: "b" },
      { v: "a" },
      { v: "d" },
    ],
    ptrs: [{ i: 0, label: CENTER }],
    msg: (
      <T
        en={
          <>
            Center i=0 (<b>b</b>): expanding left goes out of range immediately,
            so the longest palindrome at this center is &quot;b&quot;, length 1.
          </>
        }
        zh={
          <>
            中心 i=0(<b>b</b>):往左扩立刻越界,所以此中心的最长回文就是{" "}
            &quot;b&quot;,长度 1。
          </>
        }
      />
    ),
  },
  {
    cells: [
      { v: "b", state: "lit" },
      { v: "a", state: "lit" },
      { v: "b", state: "lit" },
      { v: "a" },
      { v: "d" },
    ],
    ptrs: [
      { i: 0, label: "←" },
      { i: 1, label: CENTER },
      { i: 2, label: "→" },
    ],
    msg: (
      <T
        en={
          <>
            Center i=1 (<b>a</b>): left b equals right b, so it grows into{" "}
            <b>&quot;bab&quot;, length 3</b>, a new best. The next step would go
            out of range, so it stops.
          </>
        }
        zh={
          <>
            中心 i=1(<b>a</b>):左边的 b = 右边的 b,扩成{" "}
            <b>&quot;bab&quot;,长度 3</b>,刷新纪录。再扩一层就越界,停。
          </>
        }
      />
    ),
  },
  {
    cells: [
      { v: "b" },
      { v: "a", state: "lit" },
      { v: "b", state: "lit" },
      { v: "a", state: "lit" },
      { v: "d" },
    ],
    ptrs: [
      { i: 1, label: "←" },
      { i: 2, label: CENTER },
      { i: 3, label: "→" },
    ],
    msg: (
      <T
        en={
          <>
            Center i=2 (<b>b</b>): left a equals right a, giving
            &quot;aba&quot;, length 3, which ties the best. One more layer: left
            b is not right d, so it stops. The invariant that makes this correct
            is that before each step s[l+1..r−1] is already a palindrome, so
            s[l..r] is a palindrome exactly when s[l] equals s[r]. Once a layer
            fails, no larger palindrome with this center can exist.
          </>
        }
        zh={
          <>
            中心 i=2(<b>b</b>):左 a = 右 a,得到 &quot;aba&quot;,长度 3,与纪录持平。
            再扩一层:左 b ≠ 右 d,停。让「扩」这个动作成立的不变量是:
            每一步之前 s[l+1..r−1] 已经是回文,所以只要 s[l] = s[r],s[l..r]
            就也是回文;一层扩不动,以这个中心为轴的更长回文就不可能存在。
          </>
        }
      />
    ),
  },
  {
    cells: [
      { v: "b" },
      { v: "a", state: "bad" },
      { v: "b", state: "bad" },
      { v: "a" },
      { v: "d" },
    ],
    msg: (
      <T
        en={
          <>
            The gap centers matter too. Take the gap between index 1 and index 2:
            the first comparison is a against b, which fails, so the length is 0.
            Both kinds of center have to be tried, otherwise an even-length
            palindrome such as &quot;abba&quot; is never found.
          </>
        }
        zh={
          <>
            空隙中心也别忘了。以下标 1 和 2 之间的空隙为例:第一步比 a 和 b
            就失败,长度 0。奇偶两套中心都要枚举,不然 &quot;abba&quot;
            这类偶数长回文会被漏掉。
          </>
        }
      />
    ),
  },
  {
    cells: [
      { v: "b" },
      { v: "a" },
      { v: "b" },
      { v: "a", state: "lit" },
      { v: "d", state: "lit" },
    ],
    msg: (
      <T
        en={
          <>
            Center i=3 (a): left b is not right d, so length 1. Center i=4 (d):
            length 1. Every center has now been tried.
          </>
        }
        zh={
          <>
            中心 i=3(a):左 b ≠ 右 d,长度 1;中心 i=4(d):长度 1。
            所有中心试完。
          </>
        }
      />
    ),
  },
  {
    cells: [
      { v: "b", state: "ok" },
      { v: "a", state: "ok" },
      { v: "b", state: "ok" },
      { v: "a", state: "ghost" },
      { v: "d", state: "ghost" },
    ],
    msg: (
      <T
        en={
          <>
            The answer is <b>&quot;bab&quot;</b>; &quot;aba&quot; is equally
            correct. 2n−1 centers, each expanding at most O(n) steps, gives{" "}
            <b>O(n²)</b> time and O(1) extra space. Manacher&apos;s algorithm
            solves it in O(n), but it is much harder to write, so in an interview
            it is usually enough to name it.
          </>
        }
        zh={
          <>
            答案是 <b>&quot;bab&quot;</b>,&quot;aba&quot; 同样正确。2n−1 个中心 ×
            每个最多扩 O(n) 步 = <b>O(n²)</b> 时间、O(1) 额外空间。Manacher
            算法能做到 O(n),但实现复杂得多,面试里通常说出它的名字就够了。
          </>
        }
      />
    ),
  },
];

/* ================= Page ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: { en: "Intuition", zh: "直觉" } },
  {
    id: "encoding",
    n: "02",
    label: { en: "Memory and encoding", zh: "内存与编码" },
  },
  { id: "ops", n: "03", label: { en: "Core operations", zh: "核心操作" } },
  { id: "impl", n: "04", label: { en: "Write it yourself", zh: "手写实现" } },
  {
    id: "langs",
    n: "05",
    label: { en: "Three languages", zh: "三语言对照" },
  },
  {
    id: "patterns",
    n: "06",
    label: { en: "Patterns and walkthroughs", zh: "套路与精讲" },
  },
  { id: "problems", n: "07", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "08", label: { en: "Quiz", zh: "通关测验" } },
];

const KMP_PRE_STYLE = {
  fontFamily: "var(--font-mono)",
  fontSize: 12.5,
  lineHeight: 1.9,
  color: "var(--text-2)",
  background: "var(--panel-2)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: "16px 20px",
  overflowX: "auto" as const,
  margin: "16px 0",
};

export default function StringChapter() {
  const L = useL();
  return (
    <main className="page" data-ch="string">
      <Hero
        ch="string"
        title={{
          en: (
            <>
              The <span className="grad">String</span>
            </>
          ),
          zh: (
            <>
              字符串 <span className="grad">String</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              An array of characters that <strong>cannot be edited</strong>.
              Reading any position costs O(1), but changing one character means{" "}
              <strong>copying the whole text</strong>. Underneath, a character is
              a number, and half the traps in this chapter come from the tables
              that turn numbers into characters.
            </>
          ),
          zh: (
            <>
              一个<strong>不许改字</strong>的字符数组:读哪个位置都是 O(1),
              但改一个字就要<strong>重抄全文</strong>。字符的本质是数字,
              而这一章的一半坑,都埋在「数字怎么变成字」的编码表里。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 Intuition ================= */}
      <Section
        id="intuition"
        index="01"
        title={{
          en: "Intuition: a line carved in stone",
          zh: "直觉:刻在石板上的一行字",
        }}
        desc={{
          en: "First see how close it is to an array, then accept the one rule that makes it different.",
          zh: "先弄清它和数组的血缘关系,再接受那条让它与众不同的规则",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The array in the previous chapter is a row of{" "}
                  <strong>whiteboard cells</strong>: to change one, you erase it
                  and write again. A string is a row of characters{" "}
                  <strong>carved into stone</strong>. Each character still has
                  its own slot, numbered from 0, exactly like an array. But once
                  carved, the slot <strong>cannot be rewritten</strong>. To turn
                  &quot;rain tomorrow&quot; into &quot;sun tomorrow&quot; you
                  carve a new stone and copy over the parts that did not change
                  as well.
                </>
              }
              zh={
                <>
                  上一章的数组像一排<strong>可擦写的白板格子</strong>:
                  想改哪格,擦掉重写就行。字符串像
                  <strong>刻在石板上的一行字</strong> ——
                  每个字符仍然有自己的格子,从 0 开始编号,这一点和数组一模一样,
                  但刻上去就<strong>不能再改</strong>。想把「明天下雨」改成「明天放晴」?
                  只能重新刻一块石板,把没变的字也一并重刻。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  This rule is called <strong>immutability</strong>. It holds for
                  Java <code>String</code>, Python <code>str</code>, and
                  JavaScript strings alike. It is a deliberate design, not a
                  defect, and the story card below explains why. What matters
                  first is the consequence: every operation that appears to
                  modify a string, whether concatenation, replacement, or a case
                  change, actually <strong>copies the whole text</strong>. That
                  single fact decides half the complexity results in this
                  chapter.
                </>
              }
              zh={
                <>
                  这条规则叫<strong>不可变(immutable)</strong>,Java 的{" "}
                  <code>String</code>、Python 的 <code>str</code>、JavaScript
                  的字符串<strong>都遵守它</strong>。它是刻意的设计,不是缺陷
                  (下面的故事卡会讲原因)。先记住它的后果:所有看起来在「修改」
                  字符串的操作 —— 拼接、替换、大小写转换 —— 背后都在
                  <strong>整段重抄</strong>。这一个事实,直接决定了本章一半的复杂度结论。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  One more thing to settle up front: the slots do not really hold
                  characters. A computer only stores numbers. A character is what
                  you see after a number is looked up in a{" "}
                  <strong>character encoding</strong>: 65 shows as
                  &apos;A&apos;, and 23383 shows as 字. Three rules follow.
                </>
              }
              zh={
                <>
                  还有一件事必须先说破:格子里存的根本不是「字」。计算机只存数字,
                  所谓字符,是数字查了一张<strong>编码表(character encoding)</strong>
                  之后的显示结果:65 查表得 &apos;A&apos;,23383 查表得「字」。
                  由此有三条家规:
                </>
              }
            />
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">RULE 01</div>
            <div className="card-title">
              <T en="Immutable" zh="不可变" />
            </div>
            <p>
              <T
                en={
                  <>
                    The contents are fixed at creation. <code>replace</code>,{" "}
                    <code>toUpperCase</code>, and concatenation all return a{" "}
                    <b>new string</b> and leave the original untouched. The real
                    cost of an &quot;edit&quot; is one full copy, O(n).
                  </>
                }
                zh={
                  <>
                    创建之后内容固定。<code>replace</code>、
                    <code>toUpperCase</code>、拼接统统返回<b>新字符串</b>,
                    原件分毫未动 —— 「修改」的真实成本是重抄一遍,O(n)。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 02</div>
            <div className="card-title">
              <T en="A character is a number" zh="字符 = 数字" />
            </div>
            <p>
              <T
                en={
                  <>
                    Every character is a number in an encoding table:
                    &apos;A&apos; = 65, &apos;a&apos; = 97, 字 = 23383.
                    Comparing, sorting, and changing case are all{" "}
                    <b>integer operations</b>.
                  </>
                }
                zh={
                  <>
                    每个字符都是编码表里的一个编号:&apos;A&apos; = 65、
                    &apos;a&apos; = 97、「字」= 23383。比较、排序、大小写转换,
                    本质全是<b>整数运算</b>。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 03</div>
            <div className="card-title">
              <T en="A read-only character array" zh="只读的字符数组" />
            </div>
            <p>
              <T
                en={
                  <>
                    A string behaves like a character array you may read but not
                    write: O(1) by index, plus iteration and slicing. Careful:{" "}
                    <b>one index is not always one character</b> (see §02). To
                    edit in place, convert to a{" "}
                    <b>real, mutable character array</b> first.
                  </>
                }
                zh={
                  <>
                    字符串就像一个只能读、不能写的字符数组:下标 O(1)、支持遍历和切片。
                    但要注意:<b>一个下标不一定等于一个字符</b>(见 §02)。
                    想「原地修改」,先转成<b>真正可变的字符数组</b>,改完再拼回来。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="story"
          title={{
            en: "Why did all three languages choose immutability?",
            zh: "为什么三大语言不约而同选了「不可变」?",
          }}
        >
          <p>
            <T
              en={
                <>
                  <b>Safety.</b> Strings are the most common hash key (chapter
                  06). If the contents could change after a key was stored in a
                  hash table, the entry could never be found again. Immutability
                  also lets the hash code be computed once and cached.{" "}
                  <b>Sharing.</b> Because the contents cannot change, several
                  variables can safely point at the same copy, which is how the
                  Java string pool and Python string interning save memory.{" "}
                  <b>No locking between threads.</b> A value that never changes
                  can be read by any number of threads at once. There is one
                  cost: code that changes a string often becomes expensive, so
                  all three languages offer a mutable stand-in, whether{" "}
                  <code>StringBuilder</code>, a Python list, or a JavaScript
                  array. In §04 you build one.
                </>
              }
              zh={
                <>
                  ① <b>安全</b>:字符串是最常见的哈希键(第 6 章)。如果内容能变,
                  存进哈希表后再一改,这个键就永远找不回来了;不可变还让 hashCode
                  可以算一次就缓存。② <b>共享</b>:内容不会变,多个变量就能安全地
                  指向同一份 —— Java 的字符串常量池、Python 的字符串驻留都靠它省内存。
                  ③ <b>多线程免锁</b>:不会变的值,多少线程同时读都不会出事。
                  代价只有一个:频繁修改的场景很贵,所以三种语言都配了「可变的替身」
                  —— <code>StringBuilder</code>、Python 的 list、JavaScript 的数组。
                  §04 我们亲手造一个。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §02 Memory and encoding ================= */}
      <Section
        id="encoding"
        index="02"
        title={{
          en: "Memory and encoding: from ASCII to UTF-8",
          zh: "内存与编码:从 ASCII 到 UTF-8",
        }}
        desc={{
          en: "What a character really is in memory, told as the history of one table.",
          zh: "「字」在内存里到底是什么 —— 一张编码表的进化史",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  In 1963 <strong>ASCII</strong> gave the numbers 0 to 127 to the
                  English letters, the digits, the punctuation, and a set of
                  control codes. One character, one byte, and everything worked,
                  as long as you only wrote English. Chinese has tens of
                  thousands of characters and does not fit in 128 numbers, so
                  each region built its own table (GB2312, Big5, Shift-JIS, and
                  others). The same bytes opened in another country produced
                  unreadable text. That is where the old problem of garbled
                  characters comes from.
                </>
              }
              zh={
                <>
                  1963 年的 <strong>ASCII</strong> 用 0–127 这 128
                  个数字,给英文字母、数字、标点和控制符各发一个编号:
                  一个字符一个字节,天下太平 —— 只要你不说英语以外的语言。
                  汉字有几万个,128 个编号塞不下,于是各地各造各的表(GB2312、Big5、
                  Shift-JIS……),同一串字节换个国家打开就是乱码。
                  这就是上古时代「乱码地狱」的由来。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  <strong>Unicode</strong> solves it in one move: put every
                  character in the world into one list and give each a unique
                  number, called a <strong>code point</strong>, written U+XXXX.
                  &apos;A&apos; is U+0041, 字 is U+5B57, and 🙂 is U+1F642. More
                  than 150,000 code points have been assigned. But a code point
                  is only a number.{" "}
                  <strong>How that number is stored as bytes</strong> is a
                  separate question, and that is the job of UTF-8, UTF-16, and
                  UTF-32. Here is the single character 字 at every level.
                </>
              }
              zh={
                <>
                  <strong>Unicode</strong> 的解法很直接:把全世界的字符排成一张表,
                  每个字符发一个唯一编号,叫<strong>码点(code point)</strong>,
                  写作 U+XXXX。&apos;A&apos; 是 U+0041,「字」是 U+5B57,🙂 是
                  U+1F642 —— 目前已经发出 15 万多个号。但码点只是编号,
                  <strong>编号怎么存成字节</strong>是另一件事,这就是 UTF-8 / UTF-16 /
                  UTF-32 三种存法的分工。看「字」这一个字符在各个层次上的样子:
                </>
              }
            />
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Level" zh="层次" />
                </th>
                <th>
                  <T en="字 at this level" zh="「字」的表示" />
                </th>
                <th>
                  <T en="What it means" zh="说明" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T en="What you see" zh="人眼看到" />
                  </b>
                </td>
                <td>字</td>
                <td>
                  <T
                    en="The shape drawn on screen (the glyph)"
                    zh="屏幕上渲染出来的图形(字形)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Unicode code point" zh="Unicode 码点" />
                  </b>
                </td>
                <td>
                  <code>U+5B57</code>
                  <T en={<> (23383)</>} zh={<>(十进制 23383)</>} />
                </td>
                <td>
                  <T
                    en="A globally unique number. Still only a number; nothing about storage yet."
                    zh="全球唯一编号 —— 只是个数字,还没决定怎么存"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="UTF-8 (3 bytes)" zh="UTF-8(3 字节)" />
                  </b>
                </td>
                <td>
                  <code>E5 AD 97</code>
                </td>
                <td>
                  <T
                    en="Variable length, 1 to 4 bytes. Most Chinese characters take 3. The standard for files and the network."
                    zh="变长:1~4 字节,多数汉字为 3 字节 —— 文件与网络的事实标准"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="UTF-16 (2 bytes)" zh="UTF-16(2 字节)" />
                  </b>
                </td>
                <td>
                  <code>5B 57</code>
                </td>
                <td>
                  <T
                    en="2 bytes for code points up to U+FFFF; above that, two units (a surrogate pair). Java and JavaScript index strings this way."
                    zh="U+FFFF 以内 2 字节,超出的用两个单元(代理对)—— Java/JS 的下标就按它计算"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="UTF-32 (4 bytes)" zh="UTF-32(4 字节)" />
                  </b>
                </td>
                <td>
                  <code>00 00 5B 57</code>
                </td>
                <td>
                  <T
                    en="Fixed 4 bytes. Indexing is simplest, space use is worst, so it is rarely written to disk."
                    zh="定长 4 字节,下标计算最简单但最费空间,很少直接落盘"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  UTF-8 became the standard on the web because it is{" "}
                  <strong>variable length</strong>: common characters get short
                  encodings, rare ones get long encodings, and plain English text
                  stored as UTF-8 is byte for byte identical to ASCII from 1963.
                  The length is chosen from the code point in four bands.
                </>
              }
              zh={
                <>
                  UTF-8 能统治互联网,靠的是<strong>变长</strong>这一手:
                  常用的编码短,罕见的才长,而且纯英文文本按 UTF-8 存下来,
                  和 1963 年的 ASCII 字节完全一样。它按码点大小分四档:
                </>
              }
            />
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Code point range" zh="码点范围" />
                </th>
                <th>
                  <T en="UTF-8 bytes" zh="UTF-8 字节数" />
                </th>
                <th>
                  <T en="Typical characters" zh="典型字符" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>U+0000 – U+007F</code>
                </td>
                <td>
                  <b>1</b>
                </td>
                <td>
                  <T
                    en="English letters, digits, common punctuation (that is, ASCII)"
                    zh="英文字母、数字、常用标点(= ASCII)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <code>U+0080 – U+07FF</code>
                </td>
                <td>
                  <b>2</b>
                </td>
                <td>
                  <T
                    en="Latin extensions, Greek, Cyrillic, Arabic"
                    zh="拉丁扩展、希腊、西里尔、阿拉伯字母"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <code>U+0800 – U+FFFF</code>
                </td>
                <td>
                  <b>3</b>
                </td>
                <td>
                  <T
                    en="Most Chinese characters, Japanese kana, Korean"
                    zh="绝大多数汉字、日文假名、韩文"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <code>U+10000 – U+10FFFF</code>
                </td>
                <td>
                  <b>4</b>
                </td>
                <td>
                  <T
                    en="Emoji and rare historic scripts; these need a surrogate pair in UTF-16"
                    zh="emoji、生僻古文字 —— 在 UTF-16 里要用代理对"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The three languages index strings differently, and that decides
                  what &quot;length&quot; means.{" "}
                  <strong>
                    Java and JavaScript index by UTF-16 code unit
                  </strong>
                  , so <code>length</code> counts 16-bit units.{" "}
                  <strong>Python 3 str is a sequence of code points</strong>, so{" "}
                  <code>len</code> counts code points. Note that a code point is
                  still not always one visible character: an accented letter
                  written as a base letter plus a combining mark is two code
                  points, and a family emoji is several. The difference is
                  invisible in plain English text and shows up the moment an
                  emoji appears. Check it yourself below.
                </>
              }
              zh={
                <>
                  三种语言的下标口径不同,这决定了它们「数长度」数的是什么:
                  <strong>Java 和 JavaScript 按 UTF-16 编码单元索引</strong>,
                  <code>length</code> 数的是 16 位单元;
                  <strong>Python 3 的 str 是码点序列</strong>,<code>len</code>{" "}
                  数的是码点。注意码点也不等于「人眼看到的一个字符」:
                  带音标的字母若写成基字母加组合符号就是两个码点,
                  一个家庭 emoji 更是好几个。这些差异在纯英文文本里看不出来,
                  一遇到 emoji 就现形 —— 用下面的实验室亲手验证:
                </>
              }
            />
          </p>
        </div>
        <EncodeLab />
        <Callout
          tone="warn"
          title={{
            en: "“Length” has three meanings, and all three have caused real bugs",
            zh: "「长度」有三种口径,面试和线上都栽过人",
          }}
        >
          <p>
            <T
              en={
                <>
                  Take the single emoji &quot;👍&quot;. You see{" "}
                  <b>one character</b>. In Java and JavaScript{" "}
                  <b>length is 2</b>, because UTF-16 needs a surrogate pair. As
                  UTF-8 it is <b>4 bytes</b>. In Python <code>len</code> is 1,
                  counting code points. Truncating a string by length, sizing a
                  database column in bytes, and walking emoji text by index have
                  each broken production systems. The habit to build:{" "}
                  <b>
                    before you use a length, ask which unit it counts
                  </b>
                  .
                </>
              }
              zh={
                <>
                  同一个 &quot;👍&quot;:你看到 <b>1 个字符</b>;Java 和 JavaScript
                  的 <b>length = 2</b>(UTF-16 代理对);按 UTF-8 存是{" "}
                  <b>4 字节</b>;Python 的 <code>len</code> 是 1(数码点)。
                  按 length 截断字符串、按字节算数据库字段宽度、逐下标遍历 emoji
                  文本 —— 三个都是真实事故现场。养成一个习惯:
                  <b>用到长度之前,先问清它数的是什么单位</b>。
                </>
              }
            />
          </p>
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "In practice: why files and networks are almost all UTF-8",
            zh: "工程现场:为什么文件和网络几乎全是 UTF-8",
          }}
        >
          <p>
            <T
              en={
                <>
                  HTML, JSON, HTTP, Git, and Linux filenames: the large majority
                  of text on the internet travels as UTF-8. Three reasons. It is
                  byte-compatible with ASCII, so old systems keep working. Text
                  that is mostly English takes about half the space of UTF-16.
                  And the byte stream is self-synchronizing: from any position
                  you can find the next character boundary, because the leading
                  byte and the continuation bytes have different bit patterns.
                  Java and JavaScript chose UTF-16 in the 1990s, when two bytes
                  per character looked like enough. Emoji broke that assumption,
                  and surrogate pairs are the patch. Java 9 and later store many
                  strings as Latin-1 bytes internally, but the API still counts
                  UTF-16 code units, so the behavior you see does not change.
                </>
              }
              zh={
                <>
                  HTML、JSON、HTTP、Git、Linux 文件名……当今互联网绝大多数文本用
                  UTF-8 传输。原因有三:① 字节层面兼容 ASCII,老系统无痛过渡;
                  ② 以英文为主的文本比 UTF-16 省将近一半空间;③ 字节流自同步 ——
                  从任意位置开始都能找到下一个字符边界(首字节和后续字节的位模式不同)。
                  Java/JS 选 UTF-16 是 1990 年代「每个字符 2 字节就够了」的历史遗产,
                  emoji 的流行让这个假设破产,代理对就是那个补丁。Java 9
                  之后内部会把纯 Latin-1 的字符串存成字节数组,但 API
                  仍然按 UTF-16 单元计数,你看到的行为没有变。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §03 Core operations ================= */}
      <Section
        id="ops"
        index="03"
        title={{
          en: "Core operations: every cost comes from copying",
          zh: "核心操作:一切成本源于「重抄」",
        }}
        desc={{
          en: "Reading is cheap and every edit is expensive. The key case: why += inside a loop is O(n²).",
          zh: "读很便宜,「改」都很贵 —— 重点:循环里的 += 为什么是 O(n²)",
        }}
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Operation" zh="操作" />
                </th>
                <th>
                  <T en="Complexity" zh="复杂度" />
                </th>
                <th>
                  <T en="Why" zh="为什么" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T en="Read one position" zh="取字符" />
                  </b>{" "}
                  <code>s[i]</code> / <code>charAt(i)</code>
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en="Same address formula as an array. Java and JavaScript return one UTF-16 code unit; Python returns one code point. In a language that stores strings as UTF-8 bytes (Go, Rust), reaching the i-th character means walking the bytes, which is O(n)."
                    zh="和数组同一条地址公式。Java/JS 取到的是一个 UTF-16 编码单元,Python 取到的是一个码点。在按 UTF-8 字节存字符串的语言里(Go、Rust),找第 i 个字符要顺着字节走,那才是 O(n)。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Length" zh="求长度" />
                  </b>
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en="The length is stored in a field when the string is created, so it is just a read."
                    zh="长度在创建时就存进了字段,读一下而已"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Concatenate" zh="拼接" />
                  </b>{" "}
                  <code>s + t</code>
                </td>
                <td>
                  <BigO o="n" label="O(n+m)" />
                </td>
                <td>
                  <T
                    en="Immutability means nothing can be appended to s, so a new string of length n+m is allocated and both sides are copied into it."
                    zh="不可变 → 没法在 s 尾部续写,只能新建长 n+m 的串,两边全量拷贝"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Slice / substring" zh="切片 / 子串" />
                  </b>{" "}
                  <code>s[a..b]</code>
                </td>
                <td>
                  <BigO o="n" label="O(k)" />
                </td>
                <td>
                  <T
                    en="k characters are copied into a new string. Java before version 7 shared the original array and was O(1), but a small substring could keep a huge string alive; since Java 7 it copies."
                    zh="拷贝出 k 个字符的新串(k = 切片长度)。Java 7 之前 substring 与原串共享数组,是 O(1),但一个小子串会拖住整个大串不被回收;Java 7 起改成拷贝。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Compare contents" zh="比较内容相等" />
                  </b>{" "}
                  <code>equals</code> / <code>==</code> / <code>===</code>
                </td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <T
                    en="Character by character, up to the last one in the worst case. Different lengths are rejected in O(1). Use equals in Java, == in Python, === in JavaScript."
                    zh="逐字符对比,最坏比到最后一位;长度不同可以 O(1) 提前否决。Java 用 equals、Python 用 ==、JavaScript 用 ===。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Find a substring (naive)" zh="子串查找(朴素)" />
                  </b>
                </td>
                <td>
                  <BigO o="n2" label="O(n·m)" />
                </td>
                <td>
                  <T
                    en="n starting positions, each comparing up to m characters. KMP in §04 brings it down to O(n + m)."
                    zh="n 个起点 × 每个起点最多比 m 个字符;§04 的 KMP 把它压到 O(n+m)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The row worth studying is concatenation. A single{" "}
                  <code>s + t</code> is O(n+m), which sounds acceptable. The real
                  problem is <strong>+= inside a loop</strong>. Suppose you build
                  a string of length n one character at a time.
                </>
              }
              zh={
                <>
                  全表最值得深挖的是拼接。单次 <code>s + t</code> 是 O(n+m),
                  听着还行 —— 真正的问题是<strong>循环里的 +=</strong>。
                  假设你逐字符攒一个长度为 n 的字符串:
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The first += copies 1 character. The second copies 2, the old
                  one plus the new one. The third copies 3. At step i the old
                  string already has i−1 characters and{" "}
                  <strong>all of them are copied again</strong> before the new
                  one is added. The total is 1 + 2 + 3 + … + n ={" "}
                  <strong>n(n+1)/2 ≈ n²/2</strong>. At n = 100,000 that is about
                  5 billion character copies. Each step looks harmless; the sum
                  is not. This is the arithmetic-series trap:{" "}
                  <strong>
                    += on an immutable string inside a loop is O(n²)
                  </strong>
                  .
                </>
              }
              zh={
                <>
                  第 1 次 += 拷贝 1 个字符;第 2 次拷贝 2 个(旧的 1 个 + 新的 1
                  个);第 3 次拷贝 3 个……第 i 次时,旧串已长 i−1,
                  <strong>必须整体重抄</strong>再补 1 个。总拷贝量 = 1 + 2 + 3 + … +
                  n = <strong>n(n+1)/2 ≈ n²/2</strong>。n = 10 万时就是 50
                  亿次字符拷贝 —— 每一步看着无辜,加起来是灾难。这就是「等差数列陷阱」:
                  <strong>在循环里对不可变字符串做 += 是 O(n²)</strong>。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  The fix is a <strong>mutable stand-in</strong>: append into a
                  mutable container, then build the string once at the end. The
                  total returns to O(n). Watch the two strategies race.
                </>
              }
              zh={
                <>
                  解药是给字符串找一个<strong>可变的替身</strong>:先在可变容器里攒,
                  最后一次性成串 —— 总量回到 O(n)。亲眼看两种策略赛跑:
                </>
              }
            />
          </p>
        </div>
        <ConcatLab />
        <Callout
          tone="warn"
          title={{
            en: "The same trap in all three languages",
            zh: "同一个陷阱,在三种语言里的样子",
          }}
        >
          <p>
            <T
              en={
                <>
                  By the rules of the language, the loop is O(n²) in Java,
                  Python, and JavaScript alike, because a string cannot be
                  extended in place. <b>Java:</b> the compiler turns{" "}
                  <code>s += x</code> into a new <code>StringBuilder</code> plus{" "}
                  <code>toString()</code> on <i>every</i> iteration, so the total
                  stays O(n²). You have to lift the builder out of the loop
                  yourself. <b>Python:</b> CPython has an optimization that
                  extends the buffer in place when the string has exactly one
                  reference, but the language does not guarantee it and it stops
                  applying as soon as a second reference exists. The idiom is to
                  collect the parts in a list and call{" "}
                  <code>&quot;&quot;.join()</code> once. <b>JavaScript:</b> V8
                  represents <code>a + b</code> as a small node that points at
                  both halves and only flattens it when the value is read, so a
                  loop of += is often faster than n² in practice, but the
                  flattening and the peak memory are still paid, and no engine
                  promises this. The conclusion is the same everywhere:{" "}
                  <b>use a mutable container explicitly rather than relying on
                  an engine optimization</b>.
                </>
              }
              zh={
                <>
                  按语言规则算,这个循环在 Java、Python、JavaScript 里都是 O(n²)
                  —— 因为字符串都没法原地续写。<b>Java:</b>编译器把{" "}
                  <code>s += x</code> 展开成「每一圈都 new 一个{" "}
                  <code>StringBuilder</code> 再 <code>toString()</code>」,
                  总量还是 O(n²),必须自己把 builder 提到循环外。<b>Python:</b>
                  CPython 有一个优化:当字符串只剩一个引用时可以原地扩容;
                  但语言规范不保证,只要多出第二个引用就失效 ——
                  惯用法永远是攒 list 最后 <code>&quot;&quot;.join()</code>。
                  <b>JavaScript:</b>V8 把 <code>a + b</code>{" "}
                  先表示成一个指向两半的小节点,真正读取时才拍平,
                  所以循环 += 在实践中常常快于 n²,但拍平的成本和内存峰值仍然要付,
                  而且没有任何引擎承诺这件事。结论在三种语言里一致:
                  <b>显式用可变容器,别赌引擎优化</b>。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §04 Building it from scratch ================= */}
      <Section
        id="impl"
        index="04"
        title={{
          en: "Write it yourself: a builder, indexOf, and KMP",
          zh: "手写实现:可变缓冲区、indexOf 与 KMP",
        }}
        desc={{
          en: "Two small implementations and one idea. KMP takes half of this section.",
          zh: "造两个轮子,学一个思想 —— KMP 占本节一半分量",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <strong>First: a string builder.</strong> It works exactly like
                  the dynamic array from the previous chapter. Inside is a
                  mutable character array. <code>append</code> writes into a free
                  slot, which is amortized O(1), and when the array is full the
                  capacity doubles and the contents move once. Only at the end
                  does <code>build</code> copy everything into an immutable
                  string. Reading this makes it clear why collecting first and
                  building once is O(n).
                </>
              }
              zh={
                <>
                  <strong>轮子一:字符串构建器。</strong>
                  原理和上一章的动态数组一模一样:内部一个可变字符数组,
                  <code>append</code> 往空位写(均摊 O(1)),满了就容量翻倍搬一次家,
                  只有最后 <code>build</code> 时才一次性拷贝成不可变字符串。
                  看懂它,就看懂了「为什么攒着最后一次成串是 O(n)」:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="my_string_builder"
          java={{
            code: {
              en: `// A minimal StringBuilder built on a growable char array
class MyStringBuilder {
    private char[] buf = new char[8]; // mutable storage, capacity starts at 8
    private int len = 0;              // how many slots are actually used

    // Append one character: amortized O(1), same trick as a dynamic array
    public void append(char c) {
        if (len == buf.length) grow(); // only move when the array is full
        buf[len++] = c;                // normally just write a free slot
    }

    // Append a whole string: O(m), where m is its length
    public void append(String s) {
        for (int i = 0; i < s.length(); i++) append(s.charAt(i));
    }

    private void grow() {
        char[] bigger = new char[buf.length * 2]; // double the capacity
        System.arraycopy(buf, 0, bigger, 0, len); // copy the old characters, O(n)
        buf = bigger;                             // switch to the new array
    }

    // Pay the copy once, at the end: build an immutable String, O(n)
    public String build() {
        return new String(buf, 0, len);
    }
}`,
              zh: `// 用「动态 char 数组」手写一个极简 StringBuilder
class MyStringBuilder {
    private char[] buf = new char[8]; // 底层可变数组,容量 8 起步
    private int len = 0;              // 实际已用长度

    // 追加一个字符:均摊 O(1) —— 和动态数组的 push 同一招
    public void append(char c) {
        if (len == buf.length) grow(); // 满了才搬家
        buf[len++] = c;                // 平时直接写空位,不拷贝任何旧字符
    }

    // 追加整个字符串:O(m),m 为新串长度
    public void append(String s) {
        for (int i = 0; i < s.length(); i++) append(s.charAt(i));
    }

    private void grow() {
        char[] bigger = new char[buf.length * 2]; // 容量翻倍
        System.arraycopy(buf, 0, bigger, 0, len); // 旧字符全量拷贝,O(n)
        buf = bigger;                             // 换成新家
    }

    // 只在最后「结账」一次:拷贝成不可变 String,O(n)
    public String build() {
        return new String(buf, 0, len);
    }
}`,
            },
            note: {
              en: (
                <>
                  The JDK <code>StringBuilder</code> follows this design; its
                  growth rule is ×2+2. For n appends the total work is n writes
                  plus the copies made while growing, and those copies add up to
                  less than 2n, so the whole thing is O(n) against the O(n²) of
                  += in a loop.
                </>
              ),
              zh: (
                <>
                  JDK 的 <code>StringBuilder</code> 就是这个思路(扩容策略是
                  ×2+2)。n 次 append 的总工作量 = n 次写入 + 扩容搬家的拷贝,
                  而搬家的拷贝加起来不到 2n,所以整体 O(n),对比循环 += 的 O(n²)。
                </>
              ),
            },
            hl: [8, 9, 18, 19],
          }}
          python={{
            code: {
              en: `# The Python idiom: use a list as the mutable buffer, join at the end
class MyStringBuilder:
    def __init__(self):
        self.buf = []            # a list is a dynamic array; append is amortized O(1)

    def append(self, s):
        self.buf.append(s)       # only stores a reference, copies no characters, O(1)

    def build(self):
        # join computes the total length, allocates once, then copies each part in: O(n)
        return "".join(self.buf)

# Usage
sb = MyStringBuilder()
for ch in "hello":
    sb.append(ch)
print(sb.build())        # "hello"`,
              zh: `# Python 惯用法:用 list 当可变缓冲区,最后 join 成串
class MyStringBuilder:
    def __init__(self):
        self.buf = []            # list 就是动态数组,append 均摊 O(1)

    def append(self, s):
        self.buf.append(s)       # 只是把引用放进数组,不拷贝字符,O(1)

    def build(self):
        # join 先算总长度、一次性分配内存,再把每段拷进去:整体 O(n)
        return "".join(self.buf)

# 用法
sb = MyStringBuilder()
for ch in "hello":
    sb.append(ch)
print(sb.build())        # "hello"`,
            },
            note: {
              en: (
                <>
                  Python has no StringBuilder class because{" "}
                  <code>&quot;&quot;.join(list)</code> already is one: collect
                  the parts, then build the string in a single step.
                </>
              ),
              zh: (
                <>
                  Python 没有官方 StringBuilder 类,因为{" "}
                  <code>&quot;&quot;.join(list)</code> 这个惯用法就是它 ——
                  先攒后拼,一步到位。
                </>
              ),
            },
            hl: [7, 10, 11],
          }}
          js={{
            code: {
              en: `// The JavaScript idiom: collect the pieces in an array, join at the end
class MyStringBuilder {
  constructor() {
    this.buf = [];           // a dynamic array; push is amortized O(1)
  }

  append(s) {
    this.buf.push(s);        // only stores a reference, copies no characters, O(1)
  }

  build() {
    return this.buf.join(""); // one pass to build the result, O(n)
  }
}

// Usage
const sb = new MyStringBuilder();
for (const ch of "hello") sb.append(ch);
console.log(sb.build());   // "hello"`,
              zh: `// JS 惯用法:数组攒片段,最后 join 成串
class MyStringBuilder {
  constructor() {
    this.buf = [];           // 动态数组,push 均摊 O(1)
  }

  append(s) {
    this.buf.push(s);        // 只存引用,不拷贝字符,O(1)
  }

  build() {
    return this.buf.join(""); // 一次性拼接,整体 O(n)
  }
}

// 用法
const sb = new MyStringBuilder();
for (const ch of "hello") sb.append(ch);
console.log(sb.build());   // "hello"`,
            },
            note: {
              en: (
                <>
                  V8 makes small uses of += fast enough, but collecting in an
                  array and calling <code>join</code> is O(n) on every engine and
                  at every size. Prefer it in library code.
                </>
              ),
              zh: (
                <>
                  V8 让小规模的 += 也不慢,但「攒数组 + <code>join</code>」
                  在任何引擎、任何规模下都稳定 O(n) —— 写库代码时选它。
                </>
              ),
            },
            hl: [8, 12],
          }}
        />
        <div className="prose" style={{ marginTop: 24 }}>
          <p>
            <T
              en={
                <>
                  <strong>Second: naive substring search (indexOf).</strong> Find
                  a pattern of length m inside a text of length n. Try each
                  starting position, and on a mismatch move the start one step
                  right and compare from the beginning again. The idea is
                  direct, and the worst case is O(n·m).
                </>
              }
              zh={
                <>
                  <strong>轮子二:朴素子串查找(indexOf)。</strong>
                  在长度 n 的文本里找长度 m 的模式串:挨个起点试,
                  失败就把起点右移一格、从头再比。思路直白,最坏 O(n·m):
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="naive_index_of"
          java={{
            code: {
              en: `class Naive {
    // Index of the first occurrence of pattern in text, or -1 if absent
    public int indexOf(String text, String pattern) {
        int n = text.length(), m = pattern.length();
        if (m == 0) return 0;
        // The last useful start is n-m: any later and fewer than m characters remain
        for (int i = 0; i + m <= n; i++) {
            int j = 0;
            // Compare character by character, starting at i
            while (j < m && text.charAt(i + j) == pattern.charAt(j)) j++;
            if (j == m) return i;   // every position of pattern matched
        }
        return -1;                  // every start failed
    }
}`,
              zh: `class Naive {
    // 在 text 中找 pattern 第一次出现的下标,找不到返回 -1
    public int indexOf(String text, String pattern) {
        int n = text.length(), m = pattern.length();
        if (m == 0) return 0;
        // 起点最多到 n-m:再靠后,剩余长度不够 m 了
        for (int i = 0; i + m <= n; i++) {
            int j = 0;
            // 从起点 i 开始逐字符对齐比较
            while (j < m && text.charAt(i + j) == pattern.charAt(j)) j++;
            if (j == m) return i;   // pattern 每一位都对上了,命中
        }
        return -1;                  // 所有起点都失败
    }
}`,
            },
            hl: [7, 10, 11],
          }}
          python={{
            code: {
              en: `def index_of(text: str, pattern: str) -> int:
    """Index of the first occurrence of pattern in text, or -1 if absent"""
    n, m = len(text), len(pattern)
    if m == 0:
        return 0
    # The last useful start is n-m: any later and fewer than m characters remain
    for i in range(n - m + 1):
        j = 0
        # Compare character by character, starting at i
        while j < m and text[i + j] == pattern[j]:
            j += 1
        if j == m:          # every position of pattern matched
            return i
    return -1               # every start failed`,
              zh: `def index_of(text: str, pattern: str) -> int:
    """在 text 中找 pattern 第一次出现的下标,找不到返回 -1"""
    n, m = len(text), len(pattern)
    if m == 0:
        return 0
    # 起点最多到 n-m:再靠后,剩余长度不够 m 了
    for i in range(n - m + 1):
        j = 0
        # 从起点 i 开始逐字符对齐比较
        while j < m and text[i + j] == pattern[j]:
            j += 1
        if j == m:          # pattern 每一位都对上了,命中
            return i
    return -1               # 所有起点都失败`,
            },
            hl: [7, 10, 11],
          }}
          js={{
            code: {
              en: `function indexOf(text, pattern) {
  // Index of the first occurrence of pattern in text, or -1 if absent
  const n = text.length, m = pattern.length;
  if (m === 0) return 0;
  // The last useful start is n-m: any later and fewer than m characters remain
  for (let i = 0; i + m <= n; i++) {
    let j = 0;
    // Compare character by character, starting at i
    while (j < m && text[i + j] === pattern[j]) j++;
    if (j === m) return i;   // every position of pattern matched
  }
  return -1;                 // every start failed
}`,
              zh: `function indexOf(text, pattern) {
  // 在 text 中找 pattern 第一次出现的下标,找不到返回 -1
  const n = text.length, m = pattern.length;
  if (m === 0) return 0;
  // 起点最多到 n-m:再靠后,剩余长度不够 m 了
  for (let i = 0; i + m <= n; i++) {
    let j = 0;
    // 从起点 i 开始逐字符对齐比较
    while (j < m && text[i + j] === pattern[j]) j++;
    if (j === m) return i;   // pattern 每一位都对上了,命中
  }
  return -1;                 // 所有起点都失败
}`,
            },
            hl: [6, 9, 10],
          }}
        />
        <div className="prose" style={{ marginTop: 24 }}>
          <p>
            <T
              en={
                <>
                  <strong>The idea: KMP, where a failure is information.</strong>{" "}
                  Where does the naive method lose time? Look at one typical
                  failure. Search for <code>ABABC</code> inside the text{" "}
                  <code>ABABABC</code>. The first four characters{" "}
                  <code>ABAB</code> match and the fifth does not. The naive
                  reaction is to move the start one step right and{" "}
                  <strong>
                    forget everything, comparing from the beginning again
                  </strong>
                  . But we already know that those four characters of the text
                  are <code>ABAB</code>. That knowledge is thrown away.
                </>
              }
              zh={
                <>
                  <strong>思想课:KMP —— 失败也是情报。</strong>朴素法慢在哪?
                  看一次典型的失败:在文本 <code>ABABABC</code> 里找{" "}
                  <code>ABABC</code>,前 4 个字符 <code>ABAB</code> 都对上了,
                  第 5 个失配。朴素法的反应是:起点右移一格,
                  <strong>把刚才的记忆全部清零,从头再比</strong>。
                  但我们明明已经知道文本那 4 个字符就是 <code>ABAB</code> ——
                  这份情报被白白扔掉了。
                </>
              }
            />
          </p>
        </div>
        <T
          en={
            <pre style={KMP_PRE_STYLE}>{`text      A B A B A B C
pattern   A B A B C
          ✓ ✓ ✓ ✓ ✗       mismatch at j=4. Matched so far = "ABAB"

Naive:    move the start 1 to the right, reset j to 0, compare from scratch
          (the 4 characters just compared are compared all over again)

KMP:      inside "ABAB", the longest overlap between its start and its end
          is "AB", of length 2
          → slide the pattern until that overlap lines up, continue at j = 2,
            and never move the pointer into the text backwards

text      A B A B A B C
pattern       A B A B C
              ✓ ✓ ✓ ✓ ✓   match`}</pre>
          }
          zh={
            <pre style={KMP_PRE_STYLE}>{`文本   A B A B A B C
模式   A B A B C
       ✓ ✓ ✓ ✓ ✗        j=4 失配。已匹配段 = "ABAB"

朴素法:起点 +1,j 归零,从头再比(已匹配的 4 个字符白比了)

KMP:  "ABAB" 的开头和结尾最长重叠是 "AB"(长度 2)
       → 模式一步滑到重叠对齐处,j 从 2 继续,文本指针一步不退

文本   A B A B A B C
模式       A B A B C
           ✓ ✓ ✓ ✓ ✓    命中!`}</pre>
          }
        />
        <div className="prose">
          <p>
            <T
              en={
                <>
                  The whole secret of KMP (Knuth–Morris–Pratt) is that one slide.
                  When the comparison fails, the <strong>end</strong> of the part
                  that already matched, <code>ABAB</code>, and the{" "}
                  <strong>start</strong> of the pattern share a longest overlap,{" "}
                  <code>AB</code>. Slide the pattern until that overlap lines up.
                  The overlapping characters <strong>need no recheck</strong>,
                  because they were just compared and are known to be equal, so
                  the comparison resumes at the overlap length. The pointer into
                  the text therefore{" "}
                  <strong>never moves backwards</strong>, and the whole search is
                  O(n + m).
                </>
              }
              zh={
                <>
                  KMP(Knuth–Morris–Pratt)的全部秘密就在上图那一步「滑」:失配时,
                  已匹配段 <code>ABAB</code> 的<strong>结尾</strong>和模式串的
                  <strong>开头</strong>有一段最长重叠 <code>AB</code>。
                  把模式滑到重叠对齐的位置,重叠部分<strong>不用重比</strong> ——
                  它们刚刚才比过,一定相等 —— 直接从重叠长度处继续。于是文本指针
                  <strong>永远不回退</strong>,整体 O(n+m)。
                </>
              }
            />
          </p>
          <p>
            <T
              en={
                <>
                  &quot;How long is the overlap between the start and the end of
                  each prefix&quot; can be{" "}
                  <strong>computed in advance</strong> from the pattern alone and
                  stored in an array. That array is the{" "}
                  <strong>prefix function</strong>, written{" "}
                  <code>next</code> or <code>lps</code>. Its definition is exact:{" "}
                  <b>
                    <code>next[i]</code> is the length of the longest proper
                    prefix of <code>pattern[0..i]</code> that is also a suffix of{" "}
                    <code>pattern[0..i]</code>
                  </b>
                  . &quot;Proper&quot; means it cannot be the whole of{" "}
                  <code>pattern[0..i]</code>, otherwise the answer would always
                  be i+1. Here it is for <code>ABABC</code>.
                </>
              }
              zh={
                <>
                  「每个前缀的开头和结尾最长重叠多少」只和模式串有关,可以
                  <strong>预先算好</strong>存成一个数组,这就是
                  <strong>前缀函数</strong>,代码里常写作 <code>next</code> 或{" "}
                  <code>lps</code>。它的定义是精确的:
                  <b>
                    <code>next[i]</code> = 子串 <code>pattern[0..i]</code>{" "}
                    的最长真前缀的长度,且这个真前缀同时是{" "}
                    <code>pattern[0..i]</code> 的后缀
                  </b>
                  。「真」= 不能是 <code>pattern[0..i]</code> 自己,
                  否则答案永远是 i+1。以 <code>ABABC</code> 为例:
                </>
              }
            />
          </p>
        </div>
        <div
          className="str-kmp-grid"
          aria-label={L({
            en: "The next array of ABABC",
            zh: "ABABC 的 next 数组",
          })}
        >
          {["A", "B", "A", "B", "C"].map((c, i) => (
            <div className="str-kmp-col" key={i}>
              <span className="idx">{i}</span>
              <span className="cell" style={{ width: 44, height: 44 }}>
                {c}
              </span>
              <span className="nextv">next={[0, 0, 1, 2, 0][i]}</span>
            </div>
          ))}
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Prefix" zh="前缀" />
                </th>
                <th>
                  <T en="Proper prefixes" zh="它的真前缀" />
                </th>
                <th>
                  <T en="Proper suffixes" zh="它的真后缀" />
                </th>
                <th>
                  <T en="Longest match" zh="最长重叠" />
                </th>
                <th>next</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>A</code>
                </td>
                <td>
                  <T en="(none)" zh="(无)" />
                </td>
                <td>
                  <T en="(none)" zh="(无)" />
                </td>
                <td>—</td>
                <td>
                  <b>0</b>
                </td>
              </tr>
              <tr>
                <td>
                  <code>AB</code>
                </td>
                <td>A</td>
                <td>B</td>
                <td>—</td>
                <td>
                  <b>0</b>
                </td>
              </tr>
              <tr>
                <td>
                  <code>ABA</code>
                </td>
                <td>A, AB</td>
                <td>A, BA</td>
                <td>
                  <code>A</code>
                </td>
                <td>
                  <b>1</b>
                </td>
              </tr>
              <tr>
                <td>
                  <code>ABAB</code>
                </td>
                <td>A, AB, ABA</td>
                <td>B, AB, BAB</td>
                <td>
                  <code>AB</code>
                </td>
                <td>
                  <b>2</b>
                </td>
              </tr>
              <tr>
                <td>
                  <code>ABABC</code>
                </td>
                <td>A, AB, ABA, ABAB</td>
                <td>C, BC, ABC, BABC</td>
                <td>—</td>
                <td>
                  <b>0</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  Matching then follows one rule:{" "}
                  <strong>
                    when the comparison fails at j, set j to next[j−1] and try
                    again; only when j is already 0 does the text pointer move
                    forward
                  </strong>
                  . Why does this never skip a valid match? Because next gives
                  the <i>longest</i> overlap, and every shorter alignment is
                  reached by applying the rule again. If the first jump still
                  fails, jump again, following the chain down to 0. The full
                  implementation is below. The code that builds next looks almost
                  the same as the code that matches, because building next is the
                  pattern matching against itself.
                </>
              }
              zh={
                <>
                  匹配时的规则只有一条:
                  <strong>
                    在 j 处失配,就让 j 跳到 next[j−1] 再试一次;只有 j 已经是 0
                    时,文本指针才前进
                  </strong>
                  。为什么这样不会漏解?因为 next 给的是<i>最长</i>重叠,
                  而所有更短的对齐方式都由「再跳一次」覆盖 ——
                  跳一次不行就再跳,沿着链一路退到 0。完整实现如下,
                  预处理 next 的代码和匹配的代码长得几乎一样,
                  因为预处理本质就是「模式串自己和自己做匹配」:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="kmp"
          java={{
            code: {
              en: `class Solution {
    public int strStr(String text, String pattern) {
        int n = text.length(), m = pattern.length();
        if (m == 0) return 0;

        // ---- 1) Build next: the pattern matched against itself, O(m) ----
        int[] next = new int[m];        // next[0] is always 0
        int k = 0;                      // k = length of the current overlap
        for (int i = 1; i < m; i++) {
            // If it cannot be extended, follow the next chain down
            while (k > 0 && pattern.charAt(i) != pattern.charAt(k))
                k = next[k - 1];
            if (pattern.charAt(i) == pattern.charAt(k)) k++;
            next[i] = k;
        }

        // ---- 2) Match: i never goes back; on a mismatch j jumps, O(n) ----
        int j = 0;                      // j = how much of the pattern matched
        for (int i = 0; i < n; i++) {
            while (j > 0 && text.charAt(i) != pattern.charAt(j))
                j = next[j - 1];        // slide the pattern, skip the known overlap
            if (text.charAt(i) == pattern.charAt(j)) j++;
            if (j == m) return i - m + 1; // the whole pattern matched
        }
        return -1;
    }
}`,
              zh: `class Solution {
    public int strStr(String text, String pattern) {
        int n = text.length(), m = pattern.length();
        if (m == 0) return 0;

        // ---- 1) 预处理 next:模式串「自己匹配自己」,O(m) ----
        int[] next = new int[m];        // next[0] 恒为 0
        int k = 0;                      // k = 当前最长重叠长度
        for (int i = 1; i < m; i++) {
            // 续不上就沿 next 链回退,直到能续上或退到 0
            while (k > 0 && pattern.charAt(i) != pattern.charAt(k))
                k = next[k - 1];
            if (pattern.charAt(i) == pattern.charAt(k)) k++;
            next[i] = k;
        }

        // ---- 2) 匹配:i 永不回退,失配时 j 按 next 跳,O(n) ----
        int j = 0;                      // j = 模式串已匹配长度
        for (int i = 0; i < n; i++) {
            while (j > 0 && text.charAt(i) != pattern.charAt(j))
                j = next[j - 1];        // 用情报滑动模式串,不重比重叠段
            if (text.charAt(i) == pattern.charAt(j)) j++;
            if (j == m) return i - m + 1; // 模式串全部对上
        }
        return -1;
    }
}`,
            },
            hl: [11, 12, 13, 21, 22],
          }}
          python={{
            code: {
              en: `class Solution:
    def strStr(self, text: str, pattern: str) -> int:
        n, m = len(text), len(pattern)
        if m == 0:
            return 0

        # ---- 1) Build nxt: the pattern matched against itself, O(m) ----
        nxt = [0] * m          # nxt[0] is always 0
        k = 0                  # k = length of the current overlap
        for i in range(1, m):
            # If it cannot be extended, follow the nxt chain down
            while k > 0 and pattern[i] != pattern[k]:
                k = nxt[k - 1]
            if pattern[i] == pattern[k]:
                k += 1
            nxt[i] = k

        # ---- 2) Match: i never goes back; on a mismatch j jumps, O(n) ----
        j = 0                  # j = how much of the pattern matched
        for i in range(n):
            while j > 0 and text[i] != pattern[j]:
                j = nxt[j - 1]  # slide the pattern, skip the known overlap
            if text[i] == pattern[j]:
                j += 1
            if j == m:          # the whole pattern matched
                return i - m + 1
        return -1`,
              zh: `class Solution:
    def strStr(self, text: str, pattern: str) -> int:
        n, m = len(text), len(pattern)
        if m == 0:
            return 0

        # ---- 1) 预处理 nxt:模式串「自己匹配自己」,O(m) ----
        nxt = [0] * m          # nxt[0] 恒为 0
        k = 0                  # k = 当前最长重叠长度
        for i in range(1, m):
            # 续不上就沿 nxt 链回退,直到能续上或退到 0
            while k > 0 and pattern[i] != pattern[k]:
                k = nxt[k - 1]
            if pattern[i] == pattern[k]:
                k += 1
            nxt[i] = k

        # ---- 2) 匹配:i 永不回退,失配时 j 按 nxt 跳,O(n) ----
        j = 0                  # j = 模式串已匹配长度
        for i in range(n):
            while j > 0 and text[i] != pattern[j]:
                j = nxt[j - 1]  # 用情报滑动模式串,不重比重叠段
            if text[i] == pattern[j]:
                j += 1
            if j == m:          # 模式串全部对上
                return i - m + 1
        return -1`,
            },
            hl: [12, 13, 21, 22],
          }}
          js={{
            code: {
              en: `var strStr = function (text, pattern) {
  const n = text.length, m = pattern.length;
  if (m === 0) return 0;

  // ---- 1) Build next: the pattern matched against itself, O(m) ----
  const next = new Array(m).fill(0); // next[0] is always 0
  let k = 0;                         // k = length of the current overlap
  for (let i = 1; i < m; i++) {
    // If it cannot be extended, follow the next chain down
    while (k > 0 && pattern[i] !== pattern[k]) k = next[k - 1];
    if (pattern[i] === pattern[k]) k++;
    next[i] = k;
  }

  // ---- 2) Match: i never goes back; on a mismatch j jumps, O(n) ----
  let j = 0;                         // j = how much of the pattern matched
  for (let i = 0; i < n; i++) {
    while (j > 0 && text[i] !== pattern[j]) j = next[j - 1];
    if (text[i] === pattern[j]) j++;
    if (j === m) return i - m + 1;   // the whole pattern matched
  }
  return -1;
};`,
              zh: `var strStr = function (text, pattern) {
  const n = text.length, m = pattern.length;
  if (m === 0) return 0;

  // ---- 1) 预处理 next:模式串「自己匹配自己」,O(m) ----
  const next = new Array(m).fill(0); // next[0] 恒为 0
  let k = 0;                         // k = 当前最长重叠长度
  for (let i = 1; i < m; i++) {
    // 续不上就沿 next 链回退,直到能续上或退到 0
    while (k > 0 && pattern[i] !== pattern[k]) k = next[k - 1];
    if (pattern[i] === pattern[k]) k++;
    next[i] = k;
  }

  // ---- 2) 匹配:i 永不回退,失配时 j 按 next 跳,O(n) ----
  let j = 0;                         // j = 模式串已匹配长度
  for (let i = 0; i < n; i++) {
    while (j > 0 && text[i] !== pattern[j]) j = next[j - 1];
    if (text[i] === pattern[j]) j++;
    if (j === m) return i - m + 1;   // 模式串全部对上
  }
  return -1;
};`,
            },
            hl: [10, 11, 18, 19],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Why KMP is O(n + m), even though the loops look nested",
            zh: "KMP 为什么是 O(n+m) —— 循环看起来是嵌套的",
          }}
        >
          <p>
            <T
              en={
                <>
                  Building next is O(m), matching is O(n), so the total is{" "}
                  <b>O(n + m)</b> with O(m) extra space. The inner{" "}
                  <code>while</code> makes the matching loop look like O(n·m),
                  but count the changes to j instead of the loops. Each turn of
                  the outer loop increases j by at most 1, so over the whole run
                  j increases at most n times. Every turn of the inner loop sets
                  j to <code>next[j−1]</code>, which is strictly smaller than j,
                  so it <i>decreases</i> j by at least 1, and j never goes below
                  0. A value that rises at most n times in total and never falls
                  below 0 can be lowered at most n times in total. So all the
                  inner loops together run at most n times, and matching is O(n).
                  The same argument with k and m covers the preprocessing.
                  Interviews rarely ask you to write KMP from memory, but they do
                  ask three questions: <b>what does the naive method waste</b>{" "}
                  (the contents of the part that already matched),{" "}
                  <b>what is the next array</b> (for each prefix, the length of
                  its longest proper prefix that is also a suffix), and{" "}
                  <b>why does the text pointer never move back</b> (after the
                  slide the overlapping characters are known to be equal).
                </>
              }
              zh={
                <>
                  预处理 O(m) + 匹配 O(n) = <b>O(n+m)</b>,额外空间 O(m)。
                  内层的 <code>while</code> 让匹配循环看起来像 O(n·m),
                  但换个角度:别数循环,数 j 的变化。外层每转一圈,j 最多加 1,
                  所以整趟下来 j 增加的次数不超过 n。内层每转一圈,j 被设成{" "}
                  <code>next[j−1]</code>,而它严格小于 j,所以 j 至少减 1,
                  而且 j 永远不小于 0。一个总共只上升 n 次、又不能低于 0 的量,
                  总共最多被下降 n 次 —— 因此所有内层循环加起来最多跑 n 次,
                  匹配就是 O(n)。预处理里把 j 换成 k、n 换成 m,论证完全一样。
                  面试很少让你默写 KMP,但常考三连问:<b>暴力浪费了什么情报</b>
                  (已匹配段的内容是已知的)、<b>next 数组是什么</b>
                  (每个前缀的最长真前缀且同时是后缀的长度)、
                  <b>为什么主串指针不用回退</b>(滑动后重叠段已知相等)。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §05 Three languages side by side ================= */}
      <Section
        id="langs"
        index="05"
        title={{
          en: "Three languages: one rule, three habits",
          zh: "三语言对照:同一个不可变,三副面孔",
        }}
        desc={{
          en: "The Java string pool, the Python join idiom, and the JavaScript emoji trap. The toolbar switches the code language for the whole site.",
          zh: "Java 的常量池、Python 的 join 哲学、JS 的 emoji 陷阱 —— 顶栏可全站切换代码语言",
        }}
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  In all three languages strings are{" "}
                  <strong>
                    immutable, indexable, iterable, and rebuilt on every
                    concatenation
                  </strong>
                  , so at the level of ideas they agree. What differs is the
                  habits. Java has a string pool and the <code>==</code> trap.
                  Python turns &quot;collect, then join&quot; into muscle memory.
                  JavaScript has the most convenient template literals and the
                  deepest UTF-16 emoji trap.
                </>
              }
              zh={
                <>
                  三种语言的字符串
                  <strong>都不可变、都能下标和遍历、拼接都要重建</strong> ——
                  抽象层面完全一致。不同的是各自的习惯:Java 有常量池和{" "}
                  <code>==</code> 的坑;Python 用 join 和 f-string
                  把「先攒后拼」变成肌肉记忆;JavaScript
                  的模板字符串最顺手,但 UTF-16 的 emoji 坑也最深:
                </>
              }
            />
          </p>
        </div>
        <CodeTabs
          title="string_basics"
          java={{
            code: {
              en: `// Java: String is immutable, and literals live in the string pool
String a = "data";
String b = "data";
a == b;                 // true: both literals point at the same pooled object
String c = new String("data");
a == c;                 // false: new forces a separate object on the heap
a.equals(c);            // true: compares contents; always use equals for strings

char ch = a.charAt(0);  // read one UTF-16 code unit, O(1)
a.substring(1, 3);      // "at": copies k characters, O(k)
a + "!";                // a new string "data!"; a itself is unchanged

// Changing a string often -> StringBuilder (single-threaded)
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 3; i++) sb.append(i);
String s = sb.toString();   // "012"
// StringBuffer: same API but synchronized; only worth it across threads`,
              zh: `// Java:String 不可变,字面量放在字符串常量池里
String a = "data";
String b = "data";
a == b;                 // true:两个字面量指向常量池里的同一个对象
String c = new String("data");
a == c;                 // false:new 强行在堆里另开了一个对象
a.equals(c);            // true:比内容 —— 字符串比较永远用 equals

char ch = a.charAt(0);  // 取一个 UTF-16 编码单元,O(1)
a.substring(1, 3);      // "at":拷贝 k 个字符,O(k)
a + "!";                // 新串 "data!",原 a 纹丝不动

// 频繁修改 → StringBuilder(单线程用它)
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 3; i++) sb.append(i);
String s = sb.toString();   // "012"
// StringBuffer:同 API 但方法加锁,只有跨线程才值得用`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> <code>==</code> compares references and{" "}
                  <code>equals</code> compares contents. Two literals happen to
                  be <code>==</code> because of the pool, which is exactly what
                  misleads beginners. Follow-up question: StringBuilder (fast, no
                  lock) against StringBuffer (thread-safe, slower). In
                  single-threaded code always the first.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b><code>==</code> 比引用,<code>equals</code>{" "}
                  比内容。两个字面量因为常量池碰巧 <code>==</code> 为 true,
                  这正是最容易骗新手的地方。面试追问:StringBuilder(快,不加锁)
                  vs StringBuffer(线程安全,慢),单线程一律前者。
                </>
              ),
            },
            hl: [4, 6, 7],
          }}
          python={{
            code: {
              en: `# Python: str is immutable, and a "character" is just a str of length 1
s = "data"
s[0]              # 'd': O(1), and it is a str; there is no char type
s[-1]             # 'a': a negative index counts from the end
s[1:3]            # 'at': a slice copies, O(k)
s.upper()         # 'DATA': returns a new string; s is unchanged
ord('d'), chr(100)  # 100, 'd': converting between character and code point

# f-string: the modern way to build a formatted string (3.6+)
name, n = "world", 42
msg = f"hello {name}, n={n}"

# Idiom: in a loop, collect and join; never +=
parts = []
for i in range(3):
    parts.append(str(i))
s = "".join(parts)    # "012": O(n) in total`,
              zh: `# Python:str 不可变,「字符」就是长度为 1 的 str
s = "data"
s[0]              # 'd':O(1),拿到的还是 str,没有 char 类型
s[-1]             # 'a':负下标,从尾部数
s[1:3]            # 'at':切片拷贝,O(k)
s.upper()         # 'DATA':返回新串,s 本身不变
ord('d'), chr(100)  # 100, 'd':字符和码点之间要显式转换

# f-string:格式化拼接的现代做法(3.6+)
name, n = "world", 42
msg = f"hello {name}, n={n}"

# 惯用法:循环里永远攒了再 join,不要 +=
parts = []
for i in range(3):
    parts.append(str(i))
s = "".join(parts)    # "012":整体 O(n)`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> <code>s[0]</code> returns a str, not a
                  number; use <code>ord()</code> for the code point. And{" "}
                  <code>str</code> is a sequence of code points, so{" "}
                  <code>len(&quot;👍&quot;) = 1</code>, the only one of the three
                  languages that counts it as one.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b><code>s[0]</code> 返回的是 str 不是数字,
                  想拿码点要用 <code>ord()</code>;<code>str</code> 是码点序列,
                  所以 <code>len(&quot;👍&quot;) = 1</code> ——
                  三种语言里唯一数成 1 的。
                </>
              ),
            },
            hl: [3, 10, 11, 17],
          }}
          js={{
            code: {
              en: `// JavaScript: strings are immutable; indexes are UTF-16 code units
const s = "data";
s[0];                  // 'd': read by index, O(1)
s.slice(1, 3);         // 'at': a slice copies, O(k)
s.toUpperCase();       // 'DATA': a new string; s is unchanged
s === "data";          // true: === compares the value, so no Java-style trap

// Template literal: the modern way to build a string
const name = "world";
const msg = \`hello \${name}, len=\${s.length}\`;

// Careful with emoji: length counts UTF-16 code units
"👍".length;           // 2: the surrogate pair is counted twice
"👍".charAt(0);        // '\\ud83d': half a surrogate pair, not a character
"👍".codePointAt(0);   // 128077: the real code point
[..."👍"].length;      // 1: spreading splits by code point
for (const ch of "a👍") console.log(ch); // 'a', '👍': iterates by code point`,
              zh: `// JavaScript:string 不可变,下标按 UTF-16 编码单元计算
const s = "data";
s[0];                  // 'd':下标读取,O(1)
s.slice(1, 3);         // 'at':切片拷贝,O(k)
s.toUpperCase();       // 'DATA':新串,s 不变
s === "data";          // true:=== 比的是值,没有 Java 那种引用陷阱

// 模板字符串:拼接的现代做法
const name = "world";
const msg = \`hello \${name}, len=\${s.length}\`;

// 注意 emoji:length 数的是 UTF-16 编码单元
"👍".length;           // 2:代理对被数成两个
"👍".charAt(0);        // '\\ud83d':半个代理对,不是一个字符
"👍".codePointAt(0);   // 128077:真正的码点
[..."👍"].length;      // 1:展开运算符按码点切分
for (const ch of "a👍") console.log(ch); // 'a'、'👍':按码点遍历`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> for text that may contain emoji,
                  iterate with <code>for...of</code>, count with{" "}
                  <code>Array.from(s).length</code>, and read code points with{" "}
                  <code>codePointAt</code>. <code>charAt</code>,{" "}
                  <code>length</code>, and plain indexing all work in UTF-16
                  code units and will cut a surrogate pair in half.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>处理可能含 emoji 的文本,遍历用{" "}
                  <code>for...of</code>、计数用 <code>Array.from(s).length</code>
                  、取码点用 <code>codePointAt</code>。<code>charAt</code>、
                  <code>length</code>、普通下标都是按 UTF-16 单元算的,
                  会把代理对劈成两半。
                </>
              ),
            },
            hl: [6, 13, 14, 16],
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Operation" zh="操作" />
                </th>
                <th>Java (String)</th>
                <th>Python (str)</th>
                <th>JavaScript (string)</th>
                <th>
                  <T en="Complexity" zh="复杂度" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <T en="Length" zh="长度" />
                </td>
                <td>
                  <code>s.length()</code>
                </td>
                <td>
                  <code>len(s)</code>
                </td>
                <td>
                  <code>s.length</code>
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Read one position" zh="取字符" />
                </td>
                <td>
                  <code>s.charAt(i)</code>
                </td>
                <td>
                  <code>s[i]</code>
                </td>
                <td>
                  <code>s[i]</code> / <code>charAt(i)</code>
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Substring / slice" zh="子串 / 切片" />
                </td>
                <td>
                  <code>s.substring(a, b)</code>
                </td>
                <td>
                  <code>s[a:b]</code>
                </td>
                <td>
                  <code>s.slice(a, b)</code>
                </td>
                <td>
                  <BigO o="n" label="O(k)" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Find a substring" zh="查找子串" />
                </td>
                <td>
                  <code>s.indexOf(t)</code>
                </td>
                <td>
                  <code>s.find(t)</code>
                </td>
                <td>
                  <code>s.indexOf(t)</code>
                </td>
                <td>
                  <BigO o="n2" label="O(n·m)†" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Split" zh="分割" />
                </td>
                <td>
                  <code>s.split(&quot;,&quot;)</code>
                </td>
                <td>
                  <code>s.split(&quot;,&quot;)</code>
                </td>
                <td>
                  <code>s.split(&quot;,&quot;)</code>
                </td>
                <td>
                  <BigO o="n" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Join many pieces" zh="拼接多段" />
                </td>
                <td>
                  <code>String.join</code> / <code>StringBuilder</code>
                </td>
                <td>
                  <code>&quot;&quot;.join(parts)</code>
                </td>
                <td>
                  <code>parts.join(&quot;&quot;)</code>
                </td>
                <td>
                  <BigO o="n" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Change case" zh="大小写" />
                </td>
                <td>
                  <code>s.toLowerCase()</code>
                </td>
                <td>
                  <code>s.lower()</code>
                </td>
                <td>
                  <code>s.toLowerCase()</code>
                </td>
                <td>
                  <BigO o="n" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Trim both ends" zh="去首尾空白" />
                </td>
                <td>
                  <code>s.strip()</code> / <code>s.trim()</code>
                </td>
                <td>
                  <code>s.strip()</code>
                </td>
                <td>
                  <code>s.trim()</code>
                </td>
                <td>
                  <BigO o="n" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Replace every match" zh="替换全部" />
                </td>
                <td>
                  <code>s.replace(a, b)</code>
                </td>
                <td>
                  <code>s.replace(a, b)</code>
                </td>
                <td>
                  <code>s.replaceAll(a, b)</code>*
                </td>
                <td>
                  <BigO o="n" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="To a character array" zh="转字符数组" />
                </td>
                <td>
                  <code>s.toCharArray()</code>
                </td>
                <td>
                  <code>list(s)</code>
                </td>
                <td>
                  <code>[...s]</code> / <code>s.split(&quot;&quot;)</code>
                </td>
                <td>
                  <BigO o="n" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="viz-msg">
          <T
            en={
              <>
                * In JavaScript, <code>s.replace(&quot;a&quot;, &quot;b&quot;)</code>{" "}
                with a string argument replaces <b>only the first match</b>. Use{" "}
                <code>replaceAll</code>, or a regular expression with the{" "}
                <code>g</code> flag. This is the easiest mistake to make when
                coming from another language. † O(n·m) is the worst case of the
                naive scan, which is what Java <code>indexOf</code> does. CPython{" "}
                <code>str.find</code> uses a smarter algorithm with an O(n + m)
                worst case, and JavaScript engines vary. Also, every operation
                that returns a new string uses O(n) space.
              </>
            }
            zh={
              <>
                * JavaScript 的{" "}
                <code>s.replace(&quot;a&quot;, &quot;b&quot;)</code>{" "}
                传字符串时<b>只替换第一处</b> —— 想全换用 <code>replaceAll</code>
                ,或者正则加 <code>g</code> 标志,这是从其他语言迁移过来最容易踩的一脚。
                † O(n·m) 是朴素扫描的最坏情况,Java 的 <code>indexOf</code>{" "}
                就是这么做的;CPython 的 <code>str.find</code>{" "}
                用了更聪明的算法,最坏 O(n+m),JavaScript 各引擎实现不一。
                另外,所有「返回新串」的操作,空间也都是 O(n)。
              </>
            }
          />
        </p>
        <Callout
          tone="deep"
          title={{
            en: "In practice: the string pool, interning, and intern()",
            zh: "工程现场:常量池、驻留与 intern",
          }}
        >
          <p>
            <T
              en={
                <>
                  Letting equal strings share one copy in memory has a name:{" "}
                  <b>string interning</b>. Java puts compile-time literals in the
                  pool, and at run time you can ask for it with{" "}
                  <code>s.intern()</code>. Python automatically interns short
                  strings that look like identifiers, which is why{" "}
                  <code>&quot;abc&quot; is &quot;abc&quot;</code> is sometimes
                  True. That is an implementation detail, not a promise:{" "}
                  <b>
                    use <code>==</code> to test equality and keep{" "}
                    <code>is</code> for &quot;the same object&quot;
                  </b>
                  . JavaScript engines do the same sharing internally, but it is
                  never visible, because <code>===</code> on strings compares the
                  value. So the three languages differ exactly here: Java needs{" "}
                  <code>equals</code>, Python needs <code>==</code> rather than{" "}
                  <code>is</code>, and JavaScript has no equivalent trap. All of
                  this rests on immutability from §01: nobody would dare share an
                  object whose contents can change.
                </>
              }
              zh={
                <>
                  「内容相同的字符串共享同一份内存」有个学名:
                  <b>字符串驻留(string interning)</b>。Java 把编译期字面量放进常量池,
                  运行期可以手动 <code>s.intern()</code>;Python
                  会自动驻留标识符样式的短字符串,所以{" "}
                  <code>&quot;abc&quot; is &quot;abc&quot;</code>{" "}
                  有时为 True —— 那是实现细节,不是承诺:
                  <b>
                    判相等用 <code>==</code>,<code>is</code>{" "}
                    只用来问「是不是同一个对象」
                  </b>
                  。JavaScript 引擎内部也做同样的共享,但你永远看不见,
                  因为 <code>===</code> 对字符串比的是值。所以三种语言的差别正在这里:
                  Java 必须用 <code>equals</code>,Python 要用 <code>==</code>{" "}
                  而不是 <code>is</code>,JavaScript 没有对应的坑。
                  这一切成立的前提正是 §01 的不可变 ——
                  内容会变的对象,谁敢共享?
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §06 Patterns and walkthroughs ================= */}
      <Section
        id="patterns"
        index="06"
        title={{
          en: "Three techniques: two pointers, sliding window, counting",
          zh: "字符串的三大招式:对撞、滑窗、计数",
        }}
        desc={{
          en: "Where most LeetCode string problems live. Three representative problems, taken apart step by step.",
          zh: "LeetCode 字符串题的主战场 —— 三道代表题,逐帧拆解",
        }}
        badge={
          <span className="chip" data-tone="warn">
            <T en="★ Interview core" zh="★ 面试核心" />
          </span>
        }
      >
        <div className="prose">
          <p>
            <T
              en={
                <>
                  String techniques overlap heavily with array techniques, which
                  is no surprise given how close the two structures are, but three
                  of them belong here. Read the problem and look for the signal.{" "}
                  <strong>Palindrome or reversal</strong> points to two pointers
                  moving toward each other.{" "}
                  <strong>The best contiguous substring</strong> points to a
                  sliding window.{" "}
                  <strong>Anagrams or character counts</strong> point to a
                  counting array. These three cover most of the problem set in
                  this chapter.
                </>
              }
              zh={
                <>
                  字符串的招式和数组高度同源(毕竟是孪生兄弟),但有自己的三张王牌。
                  拿到题先对信号:<strong>回文 / 反转</strong> → 对撞指针;
                  <strong>连续子串的最值</strong> → 滑动窗口;
                  <strong>异位词 / 字符统计</strong> → 计数数组。
                  三张牌能解掉本章题单的大部分:
                </>
              }
            />
          </p>
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="TECHNIQUE 01" zh="王牌一" />
            </div>
            <div className="card-title">
              <T en="Two pointers, closing in" zh="对撞指针" />
            </div>
            <p>
              <T
                en={
                  <>
                    Start at both ends and compare one pair per step. The
                    invariant: everything outside the range has already been
                    checked. Standard for palindrome checks and in-place
                    reversal. Expanding from the center is the same idea run
                    backwards. See LC 125, 344, 5.
                  </>
                }
                zh={
                  <>
                    两端出发,每步比较一对字符。不变量是:区间之外的部分都已核对完毕。
                    回文验证、原地反转的标配;「中心扩展」是它的反向版:
                    从中间向两边推。见 LC 125、344、5。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="TECHNIQUE 02" zh="王牌二" />
            </div>
            <div className="card-title">
              <T en="Sliding window" zh="滑动窗口" />
            </div>
            <p>
              <T
                en={
                  <>
                    Use it when the answer is a contiguous substring and the
                    condition inside the window can be updated step by step. Keep
                    a Set or a counter inside the window, take in on the right
                    and give up on the left. See LC 3, 438, 76.
                  </>
                }
                zh={
                  <>
                    「答案是连续子串 + 窗口内条件可增量维护」= 滑窗。
                    窗口里养一个 Set 或计数器,右端吃、左端吐。见 LC 3、438、76。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="TECHNIQUE 03" zh="王牌三" />
            </div>
            <div className="card-title">
              <T en="Counting array" zh="计数数组" />
            </div>
            <p>
              <T
                en={
                  <>
                    When the alphabet is small and known (26 lowercase letters,
                    or 128 ASCII codes), a fixed-size int array replaces a hash
                    table: faster, smaller, shorter to write. See LC 242, 438,
                    383. For arbitrary Unicode input, go back to a hash map.
                  </>
                }
                zh={
                  <>
                    字符集有限且已知时(26 个小写字母 / 128 个 ASCII 码),
                    用定长 int 数组代替哈希表:更快、更省、代码更短。
                    见 LC 242、438、383。输入是任意 Unicode 时,还是要换回哈希表。
                  </>
                }
              />
            </p>
          </div>
        </div>

        {/* —— Walkthrough A —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough A" zh="精讲 A" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 125 · Valid Palindrome" zh="LC 125 · 验证回文串" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">
              EASY
            </span>
          </span>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> considering only letters and digits and
                  ignoring case, decide whether the string reads the same
                  forwards and backwards. <b>Brute force:</b> build a filtered
                  lowercase string, then compare it with its reverse. That is
                  correct but builds two new strings of size O(n).{" "}
                  <b>Better:</b> two pointers decide it in place, with no new
                  string at all.
                </>
              }
              zh={
                <>
                  <b>题意:</b>只考虑字母和数字、忽略大小写,判断字符串正读反读是否相同。
                  <b>暴力:</b>先过滤出纯字母数字的小写串,再和它的反转比较 ——
                  正确,但建了两个 O(n) 的新字符串。<b>正解:</b>
                  对撞指针原地判断,一个新字符串都不用建:
                </>
              }
            />
          </p>
        </div>
        <ArrayStepper
          title={{
            en: "LC 125 · two pointers, step by step",
            zh: "LC 125 · 对撞指针,逐帧慢放",
          }}
          frames={F125}
        />
        <CodeTabs
          title="lc125_valid_palindrome"
          java={{
            code: {
              en: `class Solution {
    public boolean isPalindrome(String s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            // Each pointer skips over characters that are not letters or digits
            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;
            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;
            // Compare in lower case: the check is case-insensitive
            if (Character.toLowerCase(s.charAt(l))
                != Character.toLowerCase(s.charAt(r))) return false;
            l++; r--;               // both step inward
        }
        return true;                // the pointers met; every pair matched
    }
}`,
              zh: `class Solution {
    public boolean isPalindrome(String s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            // 各自跳过非字母数字的字符
            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;
            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;
            // 统一成小写再比:大小写不敏感
            if (Character.toLowerCase(s.charAt(l))
                != Character.toLowerCase(s.charAt(r))) return false;
            l++; r--;               // 双双向内走
        }
        return true;                // 指针相遇,每一对都核对通过
    }
}`,
            },
            hl: [6, 7, 9, 10],
          }}
          python={{
            code: {
              en: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        l, r = 0, len(s) - 1
        while l < r:
            # Each pointer skips over characters that are not letters or digits
            while l < r and not s[l].isalnum():
                l += 1
            while l < r and not s[r].isalnum():
                r -= 1
            # Compare in lower case: the check is case-insensitive
            if s[l].lower() != s[r].lower():
                return False
            l += 1
            r -= 1                  # both step inward
        return True                 # the pointers met; every pair matched`,
              zh: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        l, r = 0, len(s) - 1
        while l < r:
            # 各自跳过非字母数字的字符
            while l < r and not s[l].isalnum():
                l += 1
            while l < r and not s[r].isalnum():
                r -= 1
            # 统一成小写再比:大小写不敏感
            if s[l].lower() != s[r].lower():
                return False
            l += 1
            r -= 1                  # 双双向内走
        return True                 # 指针相遇,每一对都核对通过`,
            },
            hl: [6, 8, 11],
          }}
          js={{
            code: {
              en: `var isPalindrome = function (s) {
  const ok = (c) => /[a-z0-9]/i.test(c);   // letter or digit?
  let l = 0, r = s.length - 1;
  while (l < r) {
    // Each pointer skips over characters that are not letters or digits
    while (l < r && !ok(s[l])) l++;
    while (l < r && !ok(s[r])) r--;
    // Compare in lower case: the check is case-insensitive
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++; r--;                              // both step inward
  }
  return true;                             // the pointers met; every pair matched
};`,
              zh: `var isPalindrome = function (s) {
  const ok = (c) => /[a-z0-9]/i.test(c);   // 是否字母数字
  let l = 0, r = s.length - 1;
  while (l < r) {
    // 各自跳过非字母数字的字符
    while (l < r && !ok(s[l])) l++;
    while (l < r && !ok(s[r])) r--;
    // 统一成小写再比:大小写不敏感
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++; r--;                              // 双双向内走
  }
  return true;                             // 指针相遇,每一对都核对通过
};`,
            },
            hl: [6, 7, 9],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-up questions",
            zh: "复杂度与追问",
          }}
        >
          <p>
            <T
              en={
                <>
                  Time <b>O(n)</b>, because each character is examined by l or r
                  at most once, and extra space <b>O(1)</b>. Compare that with
                  the filter-and-reverse solution, which needs O(n) extra space.
                  That difference is the point of doing it in place. Follow-up
                  one: &quot;what if you may <b>delete at most one
                  character</b>?&quot; (LC 680: on a mismatch, try the two
                  branches l+1 and r−1 and continue each). Follow-up two:
                  &quot;why does the inner while also test <code>l &lt; r</code>
                  ?&quot; (a string made entirely of punctuation would run a
                  pointer past the end; watching the boundary is the basic skill
                  of two-pointer code).
                </>
              }
              zh={
                <>
                  时间 <b>O(n)</b>(每个字符最多被 l 或 r 看一次),额外空间{" "}
                  <b>O(1)</b>。对比「过滤 + 反转」解法的 O(n) 额外空间,
                  这就是原地双指针的意义。追问一:「如果允许
                  <b>删除至多一个字符</b>再判回文?」(LC 680:失配时分两路试 l+1
                  和 r−1,各自继续对撞)。追问二:「为什么内层 while 也要带{" "}
                  <code>l &lt; r</code>?」(全是标点的串会让指针越界 ——
                  边界意识是双指针的基本功)。
                </>
              }
            />
          </p>
        </Callout>

        {/* —— Walkthrough B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough B" zh="精讲 B" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 3 · Longest Substring Without Repeating Characters"
              zh="LC 3 · 无重复字符的最长子串"
            />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">
              MEDIUM
            </span>
          </span>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> find the length of the longest{" "}
                  <strong>contiguous</strong> substring with no repeated
                  character. <b>Brute force:</b> enumerate every start and end
                  and check each substring for a repeat, O(n³), or O(n²) with a
                  Set. <b>Better:</b> the two sliding-window signals are both
                  present, contiguous and incrementally maintainable. The key
                  insight: while the window [l..r] has no repeat, a new duplicate
                  only requires dropping characters from the left, and{" "}
                  <strong>l never has to move back</strong>, because any earlier
                  start still contains the duplicate that was just removed.
                </>
              }
              zh={
                <>
                  <b>题意:</b>求最长的、不含重复字符的<strong>连续</strong>子串长度。
                  <b>暴力:</b>枚举所有子串的起终点、逐个检查有无重复,O(n³)
                  (加 Set 可优化到 O(n²))。<b>正解:</b>
                  滑窗的两大信号全亮 —— 连续,且条件可增量维护。关键洞察:
                  窗口 [l..r] 无重复时,撞上重复字符只需要从左边吐,
                  <strong>l 绝不需要回头</strong> ——
                  更靠左的起点仍然包含刚被吐掉的那个重复字符:
                </>
              }
            />
          </p>
        </div>
        <ArrayStepper
          title={{
            en: 'LC 3 · sliding window with a Set (s = "abcabcbb")',
            zh: 'LC 3 · 滑动窗口 + Set(s = "abcabcbb")',
          }}
          frames={F3}
        />
        <CodeTabs
          title="lc3_longest_substring"
          java={{
            code: {
              en: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Set<Character> window = new HashSet<>(); // characters inside the window
        int l = 0, best = 0;
        for (int r = 0; r < s.length(); r++) {
            char c = s.charAt(r);
            // Does the new character repeat one inside? Drop from the left until it is gone
            while (window.contains(c)) {
                window.remove(s.charAt(l));
                l++;
            }
            window.add(c);                        // the new character enters
            best = Math.max(best, r - l + 1);     // the window is valid at every step
        }
        return best;
    }
}`,
              zh: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Set<Character> window = new HashSet<>(); // 窗口里现有的字符
        int l = 0, best = 0;
        for (int r = 0; r < s.length(); r++) {
            char c = s.charAt(r);
            // 新字符和窗口里的重复了?从左端一路吐,直到它消失
            while (window.contains(c)) {
                window.remove(s.charAt(l));
                l++;
            }
            window.add(c);                        // 新字符进窗
            best = Math.max(best, r - l + 1);     // 每一步都是合法窗口
        }
        return best;
    }
}`,
            },
            hl: [8, 9, 10, 12, 13],
          }}
          python={{
            code: {
              en: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        window = set()          # characters inside the window
        l = best = 0
        for r, c in enumerate(s):
            # Does the new character repeat one inside? Drop from the left until it is gone
            while c in window:
                window.remove(s[l])
                l += 1
            window.add(c)               # the new character enters
            best = max(best, r - l + 1) # the window is valid at every step
        return best`,
              zh: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        window = set()          # 窗口里现有的字符
        l = best = 0
        for r, c in enumerate(s):
            # 新字符和窗口里的重复了?从左端一路吐,直到它消失
            while c in window:
                window.remove(s[l])
                l += 1
            window.add(c)               # 新字符进窗
            best = max(best, r - l + 1) # 每一步都是合法窗口
        return best`,
            },
            hl: [7, 8, 9, 10, 11],
          }}
          js={{
            code: {
              en: `var lengthOfLongestSubstring = function (s) {
  const window = new Set();   // characters inside the window
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    // Does the new character repeat one inside? Drop from the left until it is gone
    while (window.has(c)) {
      window.delete(s[l]);
      l++;
    }
    window.add(c);                       // the new character enters
    best = Math.max(best, r - l + 1);    // the window is valid at every step
  }
  return best;
};`,
              zh: `var lengthOfLongestSubstring = function (s) {
  const window = new Set();   // 窗口里现有的字符
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    // 新字符和窗口里的重复了?从左端一路吐,直到它消失
    while (window.has(c)) {
      window.delete(s[l]);
      l++;
    }
    window.add(c);                       // 新字符进窗
    best = Math.max(best, r - l + 1);    // 每一步都是合法窗口
  }
  return best;
};`,
            },
            hl: [7, 8, 9, 11, 12],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-up questions",
            zh: "复杂度与追问",
          }}
        >
          <p>
            <T
              en={
                <>
                  The loop invariant: at the end of every step, s[l..r] contains
                  no repeated character. Both l and r move at most n steps
                  forward, and each character enters and leaves the Set once, so
                  the time is <b>O(n)</b> and the space is O(min(n, size of the
                  alphabet)). Follow-up one: &quot;can it be faster?&quot; Store{" "}
                  <b>the last position of each character in a hash map</b> and
                  jump l straight past it, which removes the inner loop.
                  Follow-up two: &quot;what if the input contains emoji?&quot;
                  §02 answers it: in JavaScript, split with{" "}
                  <code>Array.from(s)</code> first, otherwise a surrogate pair is
                  cut into two halves that are not characters.
                </>
              }
              zh={
                <>
                  循环不变量:每一步结束时,s[l..r] 里没有重复字符。l 和 r
                  各自最多向前走 n 步,每个字符进出 Set 各一次,所以时间{" "}
                  <b>O(n)</b>,空间 O(min(n, 字符集大小))。追问一:
                  「怎么再快一点?」用<b>哈希表记每个字符最后出现的位置</b>,
                  撞上重复时 l 直接跳过去,省掉内层循环。追问二:
                  「输入含 emoji 怎么办?」§02 学的立刻用上:JavaScript 里要先{" "}
                  <code>Array.from(s)</code> 按码点切分,
                  否则代理对会被劈成两个不是字符的半块。
                </>
              }
            />
          </p>
        </Callout>

        {/* —— Walkthrough C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough C" zh="精讲 C" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 5 · Longest Palindromic Substring"
              zh="LC 5 · 最长回文子串"
            />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">
              MEDIUM
            </span>
          </span>
        </div>
        <div className="prose">
          <p>
            <T
              en={
                <>
                  <b>The problem:</b> find the longest{" "}
                  <strong>contiguous</strong> substring that is a palindrome.
                  Note that you have to find it, not just check one.{" "}
                  <b>Brute force:</b> enumerate all O(n²) substrings and spend
                  O(n) checking each, giving O(n³). <b>Better:</b> change what
                  you enumerate. Instead of substrings,{" "}
                  <strong>enumerate the centers</strong>. A palindrome has a
                  useful property: remove one character from each end and it is
                  still a palindrome. Read backwards, that says{" "}
                  <strong>
                    you can grow outward from a center until the two sides
                    disagree
                  </strong>
                  , and that is the longest palindrome at this center. There are
                  only 2n−1 centers, n characters plus n−1 gaps.
                </>
              }
              zh={
                <>
                  <b>题意:</b>找出最长的回文<strong>连续子串</strong>
                  (注意是寻找,不是判断)。<b>暴力:</b>枚举所有 O(n²)
                  个子串、每个花 O(n) 验证 → O(n³)。<b>正解:</b>换个枚举对象 ——
                  别枚举子串,<strong>枚举回文的中心</strong>。回文有个好性质:
                  两端各去掉一个字符仍是回文;反过来说,
                  <strong>从中心一层层向外扩,扩到两侧不等为止</strong>,
                  就是该中心的最长回文。中心只有 2n−1 个:n 个字符加 n−1 个空隙。
                </>
              }
            />
          </p>
        </div>
        <ArrayStepper
          title={{
            en: 'LC 5 · expand around center (s = "babad")',
            zh: 'LC 5 · 中心扩展(s = "babad")',
          }}
          frames={F5}
        />
        <CodeTabs
          title="lc5_longest_palindrome"
          java={{
            code: {
              en: `class Solution {
    public String longestPalindrome(String s) {
        int start = 0, maxLen = 0;
        for (int i = 0; i < s.length(); i++) {
            // Two centers per position: odd length (i,i) and even length (i,i+1)
            int len = Math.max(expand(s, i, i), expand(s, i, i + 1));
            if (len > maxLen) {
                maxLen = len;
                start = i - (len - 1) / 2;  // recover the start from center and length
            }
        }
        return s.substring(start, start + maxLen);
    }

    // Grow outward from the center (l, r); return the palindrome length
    private int expand(String s, int l, int r) {
        while (l >= 0 && r < s.length()
                && s.charAt(l) == s.charAt(r)) {
            l--; r++;               // the two ends match, so grow one more layer
        }
        return r - l - 1;           // the loop overshot by one on each side
    }
}`,
              zh: `class Solution {
    public String longestPalindrome(String s) {
        int start = 0, maxLen = 0;
        for (int i = 0; i < s.length(); i++) {
            // 每个位置试两种中心:奇数长 (i,i) 和偶数长 (i,i+1)
            int len = Math.max(expand(s, i, i), expand(s, i, i + 1));
            if (len > maxLen) {
                maxLen = len;
                start = i - (len - 1) / 2;  // 由中心和长度反推起点
            }
        }
        return s.substring(start, start + maxLen);
    }

    // 从中心 (l, r) 向两边扩,返回能扩出的回文长度
    private int expand(String s, int l, int r) {
        while (l >= 0 && r < s.length()
                && s.charAt(l) == s.charAt(r)) {
            l--; r++;               // 两端相等就再扩一层
        }
        return r - l - 1;           // 循环两侧各多退了一步,长度要减掉
    }
}`,
            },
            hl: [6, 9, 17, 18, 19],
          }}
          python={{
            code: {
              en: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        # Grow outward from the center (l, r); return the final boundaries
        def expand(l: int, r: int) -> tuple[int, int]:
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1              # the two ends match, so grow one more layer
            return l + 1, r - 1     # the loop overshot by one; pull back

        best = (0, 0)
        for i in range(len(s)):
            # Two centers per position: odd length (i,i) and even length (i,i+1)
            for l, r in (expand(i, i), expand(i, i + 1)):
                if r - l > best[1] - best[0]:
                    best = (l, r)
        return s[best[0] : best[1] + 1]`,
              zh: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        # 从中心 (l, r) 向两边扩,返回扩到底时的边界
        def expand(l: int, r: int) -> tuple[int, int]:
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1              # 两端相等就再扩一层
            return l + 1, r - 1     # 循环多退了一步,收回来

        best = (0, 0)
        for i in range(len(s)):
            # 每个位置试两种中心:奇数长 (i,i) 和偶数长 (i,i+1)
            for l, r in (expand(i, i), expand(i, i + 1)):
                if r - l > best[1] - best[0]:
                    best = (l, r)
        return s[best[0] : best[1] + 1]`,
            },
            hl: [5, 6, 7, 13],
          }}
          js={{
            code: {
              en: `var longestPalindrome = function (s) {
  let start = 0, maxLen = 0;

  // Grow outward from the center (l, r) until the two sides disagree
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--; r++;                    // the two ends match, so grow one more layer
    }
    return r - l - 1;              // the loop overshot by one on each side
  };

  for (let i = 0; i < s.length; i++) {
    // Two centers per position: odd length (i,i) and even length (i,i+1)
    const len = Math.max(expand(i, i), expand(i, i + 1));
    if (len > maxLen) {
      maxLen = len;
      start = i - Math.floor((len - 1) / 2); // recover the start from center and length
    }
  }
  return s.slice(start, start + maxLen);
};`,
              zh: `var longestPalindrome = function (s) {
  let start = 0, maxLen = 0;

  // 从中心 (l, r) 向两边扩,扩到两侧不等为止
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--; r++;                    // 两端相等就再扩一层
    }
    return r - l - 1;              // 循环两侧各多退了一步,长度要减掉
  };

  for (let i = 0; i < s.length; i++) {
    // 每个位置试两种中心:奇数长 (i,i) 和偶数长 (i,i+1)
    const len = Math.max(expand(i, i), expand(i, i + 1));
    if (len > maxLen) {
      maxLen = len;
      start = i - Math.floor((len - 1) / 2); // 由中心和长度反推起点
    }
  }
  return s.slice(start, start + maxLen);
};`,
            },
            hl: [6, 7, 14, 17],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-up questions",
            zh: "复杂度与追问",
          }}
        >
          <p>
            <T
              en={
                <>
                  The invariant inside <code>expand</code>: before each step,
                  s[l+1..r−1] is already a palindrome, so s[l..r] is a palindrome
                  exactly when s[l] equals s[r]. 2n−1 centers, each growing at
                  most O(n) layers, gives time <b>O(n²)</b> and extra space{" "}
                  <b>O(1)</b>. Follow-up one: &quot;is anything faster?&quot;
                  Yes, <b>Manacher&apos;s algorithm is O(n)</b>. It inserts
                  separators between characters so odd and even cases become one,
                  and reuses the symmetry of palindromes already found. It is
                  hard to write, so naming it and describing the idea is usually
                  enough. Follow-up two: &quot;what about dynamic
                  programming?&quot; It works: dp[i][j] says whether s[i..j] is a
                  palindrome. Also O(n²) time, but O(n²) space, so expanding
                  around the center wins on memory.
                </>
              }
              zh={
                <>
                  <code>expand</code> 里的不变量:每一步之前 s[l+1..r−1]
                  已经是回文,所以只要 s[l] = s[r],s[l..r] 就也是回文。2n−1
                  个中心 × 每个最多扩 O(n) 层 → 时间 <b>O(n²)</b>,额外空间{" "}
                  <b>O(1)</b>。追问一:「有没有更快的?」有,
                  <b>Manacher 算法 O(n)</b>:在字符间插分隔符统一奇偶,
                  再复用已知回文的对称信息;实现复杂,面试说出名字和思想通常就够了。
                  追问二:「动态规划行不行?」行,dp[i][j] 表示 s[i..j] 是否回文,
                  同样 O(n²) 时间,但要 O(n²) 空间 —— 中心扩展在空间上完胜。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* ================= §07 Problem set ================= */}
      <Section
        id="problems"
        index="07"
        title={{
          en: "Problem set: 10 string problems",
          zh: "高频题单:字符串 10 题",
        }}
        desc={{
          en: "Two pointers, then counting, then sliding window, then KMP, from easy to hard. Your progress is stored locally. Think for 30 seconds before opening the hint.",
          zh: "对撞 → 计数 → 滑窗 → KMP,由易到难。勾选进度存在本地,先想 30 秒再看提示",
        }}
        badge={
          <span className="chip">
            <T en="Hot 100 selection" zh="Hot 100 精选" />
          </span>
        }
      >
        <ProblemSet ch="string" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Get all 7 right to turn on the green dot for this chapter.",
          zh: "7 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Chapter quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="string" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                A string is an <b>immutable character array</b>: reading is O(1),
                and every &quot;edit&quot; is a full copy. Concatenation is
                O(n+m), and <b>+= inside a loop is O(n²) in Java, Python, and
                JavaScript alike</b>. Collect into a StringBuilder, a list, or an
                array, and build the string once at the end.
              </>
            ),
            zh: (
              <>
                字符串 = <b>不可变的字符数组</b>:读 O(1),任何「修改」都是重抄。
                拼接 O(n+m),<b>循环里的 += 在 Java、Python、JavaScript 里都是
                O(n²)</b> —— 用 StringBuilder、list 或数组攒着,最后一次性成串。
              </>
            ),
          },
          {
            en: (
              <>
                A character is a number. Unicode assigns the number (the code
                point) and UTF-8, UTF-16, and UTF-32 decide how it is stored.{" "}
                <b>Java and JavaScript index by UTF-16 code unit</b>, so an emoji
                counts as 2, while Python 3 indexes by code point. Before you use
                a length, ask which unit it counts.
              </>
            ),
            zh: (
              <>
                字符的本质是数字:Unicode 发号(码点),UTF-8/16/32 决定存法。
                <b>Java 和 JavaScript 按 UTF-16 编码单元索引</b>(emoji 数成 2),
                Python 3 按码点索引 —— 用到「长度」之前,先问清它数的是什么单位。
              </>
            ),
          },
          {
            en: (
              <>
                Substring search: naive is O(n·m).{" "}
                <b>KMP uses the prefix function</b>, where next[i] is the length
                of the longest proper prefix of pattern[0..i] that is also a
                suffix, so the pointer into the text never moves back: O(n + m).
                Remember the three questions: what does brute force waste, what
                is next, and why is no backtracking needed.
              </>
            ),
            zh: (
              <>
                子串查找:朴素 O(n·m)。<b>KMP 用前缀函数</b>
                (next[i] = pattern[0..i] 的最长真前缀且同时是后缀的长度),
                让主串指针永不回退 → O(n+m)。记住三问:暴力浪费了什么、next
                是什么、为什么不用回退。
              </>
            ),
          },
          {
            en: (
              <>
                Three techniques: <b>two pointers closing in</b> (palindromes and
                reversal), <b>sliding window</b> (a contiguous substring whose
                condition updates incrementally), and <b>a counting array</b> (a
                small, known alphabet, instead of a hash table).
              </>
            ),
            zh: (
              <>
                三大招式:<b>对撞指针</b>(回文 / 反转)、<b>滑动窗口</b>
                (连续子串 + 条件可增量维护)、<b>计数数组</b>
                (字符集有限且已知时替代哈希表)。
              </>
            ),
          },
          {
            en: (
              <>
                Language differences worth memorizing: Java{" "}
                <b>== compares references, equals compares contents</b>; Python
                has no char type (a str of length 1) and concatenates with join,
                and <code>is</code> is not <code>==</code>; JavaScript{" "}
                <code>===</code> compares string values, but <code>charAt</code>{" "}
                splits a surrogate pair, so handle emoji with{" "}
                <code>for...of</code> and <code>codePointAt</code>.
              </>
            ),
            zh: (
              <>
                语言差异速查:Java <b>== 比引用、equals 比内容</b>;Python 没有
                char(长度 1 的 str),拼接用 join,而且 <code>is</code> 不是{" "}
                <code>==</code>;JavaScript 的 <code>===</code> 对字符串比的是值,
                但 <code>charAt</code> 会劈开代理对,处理 emoji 用{" "}
                <code>for...of</code> / <code>codePointAt</code>。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="string" />
    </main>
  );
}
