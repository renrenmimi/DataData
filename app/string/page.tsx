"use client";

// 第 2 章 · 字符串 —— 「一个不许改字的数组」。
// 十段式:直觉(不可变/编码/字符数组孪生)→ 内存与编码(ASCII→Unicode→UTF-8)→
// 核心操作(重点:循环 += 为什么 O(n²))→ 手写实现(StringBuilder / indexOf / KMP)→
// 三语言对照 → 对撞指针·滑窗·中心扩展 + 三道精讲 → 题单 → 测验 → 要点。

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
import { PROBLEMS, QUIZ } from "@/lib/string-data";
import { EncodeLab, ConcatLab } from "./viz";
import "./chapter.css";

/* ================= 精讲动画帧 ================= */

// LC 125 验证回文串:对撞指针,s = "A?bB,a"
const S125 = ["A", "?", "b", "B", ",", "a"];
const F125: ArrayFrame[] = [
  {
    cells: S125.map((v) => ({ v })),
    ptrs: [
      { i: 0, label: "L" },
      { i: 5, label: "R" },
    ],
    msg: (
      <>
        规则:只看<b>字母和数字</b>、忽略大小写。L、R 从两端出发,向中间对撞。
      </>
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
      <>
        L 的 <b>A</b> vs R 的 <b>a</b>:都是字母,统一小写后 a = a ——
        匹配!两人各向内走一步。
      </>
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
      <>
        L 遇到 <b>?</b>:不是字母数字 —— 不参与判断,直接跳过,L++。
        这一步不比较,只挪指针。
      </>
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
      <>
        R 遇到 <b>,</b>:同样是标点,跳过,R--。两个指针各自负责“清障”。
      </>
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
      <>
        L 的 <b>b</b> vs R 的 <b>B</b>:小写后 b = b —— 匹配!继续向内。
      </>
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
      <>
        L ≥ R,指针相遇:所有该比的字符都核对无误 —— <b>是回文</b>。
        每个字符最多被看一眼,时间 <b>O(n)</b>、空间 <b>O(1)</b>
        (没有建任何新字符串)。
      </>
    ),
  },
];

// LC 3 无重复字符的最长子串:滑动窗口 + Set,s = "abcabcbb"
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
      <>
        窗口 [l..r] 是当前“无重复字符”的一段;随身带一个 Set 记录窗口里有谁。
      </>
    ),
  },
  {
    cells: w3(0, 0),
    ptrs: [
      { i: 0, label: "l" },
      { i: 0, label: "r" },
    ],
    msg: (
      <>
        r=0:<b>a</b> 不在 Set 里 → 进窗。窗口 &quot;a&quot;,长度 1。Set =
        {"{a}"}。
      </>
    ),
  },
  {
    cells: w3(0, 1),
    ptrs: [
      { i: 0, label: "l" },
      { i: 1, label: "r" },
    ],
    msg: (
      <>
        r=1:<b>b</b> 不重复 → 进窗。窗口 &quot;ab&quot;,长度 2。
      </>
    ),
  },
  {
    cells: w3(0, 2),
    ptrs: [
      { i: 0, label: "l" },
      { i: 2, label: "r" },
    ],
    msg: (
      <>
        r=2:<b>c</b> 进窗。窗口 &quot;abc&quot;,长度 <b>3</b> ✨ 纪录!Set =
        {"{a,b,c}"}。
      </>
    ),
  },
  {
    cells: w3(1, 3, { 0: "ghost" }),
    ptrs: [
      { i: 1, label: "l" },
      { i: 3, label: "r" },
    ],
    msg: (
      <>
        r=3:又来一个 <b>a</b> —— Set 里已经有!l 右移吐出 s[0]=a,再让新 a 进窗。
        窗口 &quot;bca&quot;,长度 3 持平。
      </>
    ),
  },
  {
    cells: w3(2, 4, { 0: "ghost", 1: "ghost" }),
    ptrs: [
      { i: 2, label: "l" },
      { i: 4, label: "r" },
    ],
    msg: (
      <>
        r=4:<b>b</b> 重复 → 吐出 s[1]=b。窗口 &quot;cab&quot;。
        注意 l 从不回头 —— 它知道更靠左的起点只会更早撞上重复。
      </>
    ),
  },
  {
    cells: w3(3, 5, { 0: "ghost", 1: "ghost", 2: "ghost" }),
    ptrs: [
      { i: 3, label: "l" },
      { i: 5, label: "r" },
    ],
    msg: (
      <>
        r=5:<b>c</b> 重复 → 吐出 s[2]=c。窗口 &quot;abc&quot;,长度 3。
      </>
    ),
  },
  {
    cells: w3(5, 6, { 0: "ghost", 1: "ghost", 2: "ghost", 3: "ghost", 4: "ghost" }),
    ptrs: [
      { i: 5, label: "l" },
      { i: 6, label: "r" },
    ],
    msg: (
      <>
        r=6:<b>b</b> 重复 → 这次要连吐 s[3]=a、s[4]=b 两个,直到窗口里没有 b。
        窗口 &quot;cb&quot;,长度 2。
      </>
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
      <>
        r=7 同理,窗口缩到 &quot;b&quot;。扫描结束:最长无重复子串 =
        <b>&quot;abc&quot;,长度 3</b>。l、r 各自只前进不后退,每个字符最多进出窗口一次
        → <b>O(n)</b>。
      </>
    ),
  },
];

// LC 5 最长回文子串:中心扩展,s = "babad"
const S5 = ["b", "a", "b", "a", "d"];
const F5: ArrayFrame[] = [
  {
    cells: S5.map((v) => ({ v })),
    msg: (
      <>
        回文分奇数长(中心是字符)和偶数长(中心是空隙):n 个字符共有{" "}
        <b>2n−1</b> 个中心。挨个试,每个中心向两边扩。
      </>
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
    ptrs: [{ i: 0, label: "中心" }],
    msg: (
      <>
        中心 i=0(<b>b</b>):想往左扩已越界 —— 此中心最长回文就是 &quot;b&quot;,长度 1。
      </>
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
      { i: 1, label: "中心" },
      { i: 2, label: "→" },
    ],
    msg: (
      <>
        中心 i=1(<b>a</b>):左 b = 右 b → 扩成 <b>&quot;bab&quot;,长度 3</b> ✨
        纪录!再想扩就越界,停。
      </>
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
      { i: 2, label: "中心" },
      { i: 3, label: "→" },
    ],
    msg: (
      <>
        中心 i=2(<b>b</b>):左 a = 右 a → &quot;aba&quot; 长度 3,持平不更新。
        再扩一层:左 b ≠ 右 d,停 —— <b>回文一旦断,就不可能再接上</b>,这是能“扩”的根据。
      </>
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
      <>
        偶数中心也别忘了:比如空隙 (1,2),第一步 a ≠ b 直接失败,长度 0。
        奇偶两套中心都要枚举,不然 &quot;abba&quot; 这类偶回文会漏。
      </>
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
      <>
        中心 i=3(a):左 b ≠ 右 d,长度 1;中心 i=4(d):长度 1。所有中心试完。
      </>
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
      <>
        答案:<b>&quot;bab&quot;</b>(&quot;aba&quot; 同样正确)。2n−1 个中心 ×
        每个最多扩 O(n) 步 = <b>O(n²)</b> 时间、O(1) 空间 ——
        面试性价比远高于 O(n) 的 Manacher(那个更适合当追问的谈资)。
      </>
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: "直觉" },
  { id: "encoding", n: "02", label: "内存与编码" },
  { id: "ops", n: "03", label: "核心操作" },
  { id: "impl", n: "04", label: "手写实现" },
  { id: "langs", n: "05", label: "三语言对照" },
  { id: "patterns", n: "06", label: "套路与精讲" },
  { id: "problems", n: "07", label: "高频题单" },
  { id: "quiz", n: "08", label: "通关测验" },
];

export default function StringChapter() {
  return (
    <main className="page" data-ch="string">
      <Hero
        ch="string"
        title={
          <>
            字符串 <span className="grad">String</span>
          </>
        }
        essence={
          <>
            一个<strong>不许改字</strong>的字符数组:读哪个字都是 O(1),
            但改一个字就要<strong>重抄全文</strong>。字符的本质是数字,
            而这一章的一半坑,都埋在「数字怎么变成字」的编码表里。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 直觉 ================= */}
      <Section
        id="intuition"
        index="01"
        title="直觉:刻在石板上的一行字"
        desc="先弄清它和数组的血缘关系,再接受它的怪脾气"
      >
        <div className="prose">
          <p>
            上一章的数组像一排<strong>可擦写的白板格子</strong>:想改哪格擦掉重写就行。
            字符串(string)则像<strong>刻在石板上的一行字</strong> ——
            每个字仍然有自己的格子(第 0 格、第 1 格……这一点和数组一模一样),
            但刻上去就<strong>永远改不了</strong>。想把「明天下雨」改成「明天放晴」?
            对不起,重新刻一块石板,把没变的字也全部重刻一遍。
          </p>
          <p>
            这个设定叫<strong>不可变(immutable)</strong>,Java、Python、JavaScript
            三大主流语言的字符串<strong>全部如此</strong>。它不是缺陷,是刻意的设计
            (下面的故事卡会讲为什么),但它意味着:所有看起来在「修改」字符串的操作
            —— 拼接、替换、大小写转换 —— 背后都在<strong>整段重抄</strong>。
            这一个事实,直接决定了本章一半的复杂度结论。
          </p>
          <p>
            还有一件事必须先说破:格子里刻的根本不是「字」。计算机只认识数字,
            所谓字符,是数字查了一张<strong>编码表(character encoding)</strong>
            之后的显示结果:65 查表得 &apos;A&apos;,23383 查表得「字」。
            字符串的三条家规:
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">RULE 01</div>
            <div className="card-title">不可变</div>
            <p>
              创建之后内容焊死。replace / toUpperCase / 拼接统统返回<b>新字符串</b>,
              原件分毫未动 —— 「修改」的真实成本是重抄一遍,O(n)。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 02</div>
            <div className="card-title">字符 = 数字</div>
            <p>
              每个字符都是编码表里的一个编号:&apos;A&apos; = 65、&apos;a&apos; = 97、
              「字」= 23383。比较、排序、大小写转换,本质全是<b>整数运算</b>。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 03</div>
            <div className="card-title">字符数组孪生</div>
            <p>
              字符串 ≈ 只读的字符数组:下标 O(1) 取字符、支持遍历和切片。
              想「原地修改」时,先转成<b>真正的字符数组</b>,改完再拼回来。
            </p>
          </div>
        </div>
        <Callout tone="story" title="为什么三大语言不约而同选了「不可变」?">
          <p>
            ① <b>安全</b>:字符串是最常见的哈希键(第 6 章),如果内容能变,
            存进哈希表后再一改,这个键就永远找不回来了;不可变让 hashCode
            可以放心缓存。② <b>共享</b>:内容不会变,多个变量就能安全地指向同一份
            (Java 的字符串常量池、Python 的驻留机制都靠它省内存)。③{" "}
            <b>多线程免锁</b>:不会变的东西,随便多少线程同时读都不会出事。
            代价只有一个 —— 频繁修改的场景很贵,所以三种语言都配了「可变的替身」:
            StringBuilder / list / 数组,§04 我们亲手造一个。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 内存与编码 ================= */}
      <Section
        id="encoding"
        index="02"
        title="内存与编码:从 ASCII 到 UTF-8"
        desc="「字」在内存里到底是什么 —— 一张编码表的进化史"
      >
        <div className="prose">
          <p>
            1963 年,美国人制定了 <strong>ASCII</strong>:用 0–127 这 128
            个数字给英文字母、数字、标点、控制符各发一个编号,一个字符一个字节,
            天下太平 —— 只要你不说英语以外的语言。汉字有几万个,128
            个编号塞不下,于是各国各造各的表(GB2312、Big5、Shift-JIS……),
            同一串字节换个国家打开就是乱码,这就是上古时代「乱码地狱」的由来。
          </p>
          <p>
            <strong>Unicode</strong> 的解法简单粗暴:全世界所有字符统一排队,
            每个字符发一个唯一编号,叫<strong>码点(code point)</strong>,写作
            U+XXXX。&apos;A&apos; 是 U+0041,「字」是 U+5B57,🙂 是
            U+1F642 —— 目前已经发出 15 万+ 个号。但码点只是「编号」,
            <strong>编号怎么存成字节</strong>是另一件事,这就是 UTF-8 / UTF-16 /
            UTF-32 三种「存法」的分工。看「字」这一个字的三种存法:
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>层次</th>
                <th>「字」的表示</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>人眼看到</b></td>
                <td>字</td>
                <td>屏幕上渲染出来的图形(字形)</td>
              </tr>
              <tr>
                <td><b>Unicode 码点</b></td>
                <td><code>U+5B57</code>(十进制 23383)</td>
                <td>全球唯一编号 —— 只是个数字,还没决定怎么存</td>
              </tr>
              <tr>
                <td><b>UTF-8(3 字节)</b></td>
                <td><code>E5 AD 97</code></td>
                <td>变长:1~4 字节,汉字多为 3 字节 —— 文件与网络的事实标准</td>
              </tr>
              <tr>
                <td><b>UTF-16(2 字节)</b></td>
                <td><code>5B 57</code></td>
                <td>常用字符 2 字节,超出 U+FFFF 的用两个单元(代理对)—— Java/JS 内部用它</td>
              </tr>
              <tr>
                <td><b>UTF-32(4 字节)</b></td>
                <td><code>00 00 5B 57</code></td>
                <td>定长 4 字节,下标计算最简单但最费空间,很少直接落盘</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            UTF-8 能统治互联网,靠的是<strong>变长</strong>这一手:常用的越短,
            罕见的才长,而且完全兼容 ASCII(纯英文文本按 UTF-8 存,和 1963
            年的字节一模一样)。它按码点大小分四档:
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>码点范围</th>
                <th>UTF-8 字节数</th>
                <th>典型字符</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>U+0000 – U+007F</code></td>
                <td><b>1</b></td>
                <td>英文字母、数字、常用标点(= ASCII)</td>
              </tr>
              <tr>
                <td><code>U+0080 – U+07FF</code></td>
                <td><b>2</b></td>
                <td>拉丁扩展、希腊、西里尔、阿拉伯字母</td>
              </tr>
              <tr>
                <td><code>U+0800 – U+FFFF</code></td>
                <td><b>3</b></td>
                <td>绝大多数汉字、日文假名、韩文</td>
              </tr>
              <tr>
                <td><code>U+10000 – U+10FFFF</code></td>
                <td><b>4</b></td>
                <td>emoji、生僻古文字 —— UTF-16 里要用代理对</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            三种语言各选了不同的内部表示,这决定了它们「数长度」的口径:
            <strong>Java 和 JavaScript 内部用 UTF-16</strong>,length
            数的是 16 位编码单元;<strong>Python 3 的 str 是码点序列</strong>,
            len 数的是真正的字符个数。差异平时看不出来,一遇到 emoji 就现形 ——
            用下面的实验室亲手验证:
          </p>
        </div>
        <EncodeLab />
        <Callout tone="warn" title="「长度」有三种口径,面试和线上都栽过人">
          <p>
            同一个 &quot;👍&quot;:<b>人眼 1 个字符;Java/JS 的 length = 2</b>
            (UTF-16 代理对);<b>UTF-8 存储 4 字节</b>;Python 的 len = 1(码点)。
            按 length 截断字符串、按字节算数据库字段宽度、逐下标遍历 emoji
            文本 —— 三个都是真实事故现场。记住口诀:
            <b>length 数的不一定是「字」,先问清口径</b>。
          </p>
        </Callout>
        <Callout tone="deep" title="工程现场:为什么文件和网络几乎全是 UTF-8">
          <p>
            HTML、JSON、HTTP、Git、Linux 文件名……当今互联网 98% 以上的文本用
            UTF-8 传输。原因:① 兼容 ASCII,老系统无痛过渡;② 英文占多数的文本
            比 UTF-16 省将近一半空间;③ 字节流自同步 —— 从任意位置开始都能找到
            下一个字符边界(首字节和后续字节的位模式不同)。而 Java/JS
            选 UTF-16 是 1990 年代「所有字符 2 字节就够了」的历史遗产,
            emoji 的流行让这个假设破产,才有了代理对这个补丁。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 核心操作 ================= */}
      <Section
        id="ops"
        index="03"
        title="核心操作:一切成本源于「重抄」"
        desc="读很便宜,「改」都很贵 —— 重点:循环里的 += 为什么是 O(n²)"
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>操作</th>
                <th>复杂度</th>
                <th>为什么</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>取字符</b> <code>s[i]</code> / <code>charAt(i)</code></td>
                <td><BigO o="1" /></td>
                <td>孪生于数组:下标公式直达(定宽编码下;UTF-8 按字节流找第 i 个「字」才是 O(n))</td>
              </tr>
              <tr>
                <td><b>求长度</b></td>
                <td><BigO o="1" /></td>
                <td>长度在创建时就存进了字段,读一下而已</td>
              </tr>
              <tr>
                <td><b>拼接</b> <code>s + t</code></td>
                <td><BigO o="n" label="O(n+m)" /></td>
                <td>不可变 → 没法在 s 尾部续写,只能新建长 n+m 的串,两边<b>全量拷贝</b></td>
              </tr>
              <tr>
                <td><b>切片 / 子串</b> <code>s[a..b]</code></td>
                <td><BigO o="n" label="O(k)" /></td>
                <td>拷贝出 k 个字符的新串(k = 切片长度)</td>
              </tr>
              <tr>
                <td><b>比较相等</b> <code>s == t</code> / <code>equals</code></td>
                <td><BigO o="n" /></td>
                <td>逐字符对比,最坏比到最后一位(长度不同可 O(1) 提前否决)</td>
              </tr>
              <tr>
                <td><b>子串查找</b>(朴素)</td>
                <td><BigO o="n2" label="O(n·m)" /></td>
                <td>n 个起点 × 每个起点最多比 m 个字符;§04 的 KMP 把它压到 O(n+m)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            全表最值得深挖的是拼接。单次 <code>s + t</code> 是 O(n+m),听着还行 ——
            真正的杀手是<strong>循环里的 +=</strong>。假设你逐字符攒一个长度为 n
            的字符串:
          </p>
          <p>
            第 1 次 += 拷贝 1 个字符;第 2 次拷贝 2 个(旧的 1 个 + 新的 1 个);
            第 3 次拷贝 3 个……第 i 次时,旧串已长 i−1,必须<strong>整体重抄</strong>再补
            1 个。总拷贝量 = 1 + 2 + 3 + … + n = <strong>n(n+1)/2 ≈ n²/2</strong>。
            n = 10 万时就是 50 亿次字符拷贝 —— 每一步看着无辜,加起来是灾难。
            这就是「等差数列陷阱」:<strong>循环 += 不可变字符串 = O(n²)</strong>。
          </p>
          <p>
            解药是给字符串找一个<strong>可变的替身</strong>:先在可变容器里攒,
            最后一次性「结账」成字符串 —— 总量回到 O(n)。亲眼看两种策略赛跑:
          </p>
        </div>
        <ConcatLab />
        <Callout tone="warn" title="三种语言里,谁在偷偷 O(n²)?">
          <p>
            <b>Java:</b>循环里写 <code>s += x</code>,编译器每圈都 new 一个
            StringBuilder 再 toString —— 该 O(n²) 还是 O(n²),必须自己把
            StringBuilder 提到循环外。<b>Python:</b>CPython 对 <code>s += x</code>{" "}
            有「引用计数为 1 时原地扩」的小优化,但语言规范不保证,换个解释器就退化
            —— 惯用法永远是攒 list 最后 <code>&quot;&quot;.join()</code>。
            <b>JavaScript:</b>V8 用 rope(绳索结构)延迟拼接,+= 通常不至于 n²,
            但内存峰值和最终「拍平」的成本仍在 —— 大量拼接时攒数组 join 依旧是稳妥解。
            结论:<b>别赌引擎优化,显式用可变容器</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 手写实现 ================= */}
      <Section
        id="impl"
        index="04"
        title="手写实现:StringBuilder、indexOf 与 KMP"
        desc="造两个轮子,学一个思想 —— KMP 的分量占本节一半"
      >
        <div className="prose">
          <p>
            <strong>轮子一:StringBuilder。</strong>原理和上一章的动态数组一模一样:
            内部一个可变字符数组,append 往空位写(均摊 O(1),满了倍增搬家),
            最后 build 时才一次性拷贝成不可变字符串。看懂它,你就看懂了
            「为什么攒着最后结账是 O(n)」:
          </p>
        </div>
        <CodeTabs
          title="my_string_builder"
          java={{
            code: `// 用「动态 char 数组」手写一个极简 StringBuilder
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
            note: (
              <>
                JDK 的 StringBuilder 就是这个思路(容量策略是 ×2+2)。n 次 append
                的总拷贝 = n 次写入 + 扩容搬家 1+2+4+…&lt;n → 总 O(n),
                对比循环 += 的 O(n²)。
              </>
            ),
            hl: [8, 9, 18, 19],
          }}
          python={{
            code: `# Python 惯用法:用 list 当可变字符数组,最后 join 结账
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
            note: (
              <>
                Python 没有官方 StringBuilder 类,因为{" "}
                <code>&quot;&quot;.join(list)</code> 这个惯用法就是它 ——
                先攒后拼,一步到位。
              </>
            ),
            hl: [7, 10, 11],
          }}
          js={{
            code: `// JS 惯用法:数组攒片段,最后 join 结账
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
            note: (
              <>
                V8 的 rope 优化让小规模 += 也不慢,但攒数组 + join
                在任何引擎、任何规模下都稳定 O(n) —— 写库代码时选它。
              </>
            ),
            hl: [8, 12],
          }}
        />
        <div className="prose" style={{ marginTop: 24 }}>
          <p>
            <strong>轮子二:朴素子串查找(indexOf)。</strong>在长度 n 的文本里找长度
            m 的模式串:挨个起点试,失败就把起点右移一格从头再比 ——
            思路直白,最坏 O(n·m):
          </p>
        </div>
        <CodeTabs
          title="naive_index_of"
          java={{
            code: `class Naive {
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
            hl: [7, 10, 11],
          }}
          python={{
            code: `def index_of(text: str, pattern: str) -> int:
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
            hl: [7, 10, 11],
          }}
          js={{
            code: `function indexOf(text, pattern) {
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
            hl: [6, 9, 10],
          }}
        />
        <div className="prose" style={{ marginTop: 24 }}>
          <p>
            <strong>思想课:KMP —— 失败也是情报。</strong>朴素法慢在哪?
            看一次典型的失败:在文本 <code>ABABABC</code> 里找{" "}
            <code>ABABC</code>,前 4 个字符 <code>ABAB</code>{" "}
            都对上了,第 5 个失配。朴素法的反应是:起点右移一格,
            <strong>把刚才的记忆全部清零,从头再比</strong>。
            但我们明明已经知道文本那 4 个字符就是 <code>ABAB</code> ——
            这份情报被白白扔掉了。
          </p>
        </div>
        <pre
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12.5,
            lineHeight: 1.9,
            color: "var(--text-2)",
            background: "var(--panel-2)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "16px 20px",
            overflowX: "auto",
            margin: "16px 0",
          }}
        >{`文本   A B A B A B C
模式   A B A B C
       ✓ ✓ ✓ ✓ ✗        j=4 失配。已匹配段 = "ABAB"

朴素法:起点 +1,j 归零,从头再比(已匹配的 4 个字符白比了)

KMP:  "ABAB" 的头和尾最长重叠是 "AB"(长度 2)
       → 模式一步滑到重叠对齐处,j 从 2 继续,文本指针一步不退

文本   A B A B A B C
模式       A B A B C
           ✓ ✓ ✓ ✓ ✓    命中!`}</pre>
        <div className="prose">
          <p>
            KMP(Knuth–Morris–Pratt)的全部秘密就在上图那一步「滑」:失配时,
            已匹配段 <code>ABAB</code> 的<strong>结尾</strong>和模式串的
            <strong>开头</strong>有一段最长重叠 <code>AB</code>。
            把模式滑到重叠对齐的位置,重叠部分<strong>不用重比</strong>(它们刚刚才比过,
            肯定相等),直接从重叠长度处继续。于是文本指针 i{" "}
            <strong>永远不回退</strong>,整体 O(n+m)。
          </p>
          <p>
            「每个前缀的头尾最长重叠多长」可以对模式串<strong>预先算好</strong>,
            存成一个数组,这就是 <strong>next 数组</strong>(也叫前缀函数 π):
            next[i] = 子串 pattern[0..i] 的<strong>最长真前缀 = 真后缀</strong>的长度
            (「真」= 不能是整个子串自己)。以 <code>ABABC</code> 为例:
          </p>
        </div>
        <div className="str-kmp-grid" aria-label="ABABC 的 next 数组">
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
                <th>前缀</th>
                <th>真前缀们</th>
                <th>真后缀们</th>
                <th>最长重叠</th>
                <th>next</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>A</code></td>
                <td>(无)</td>
                <td>(无)</td>
                <td>—</td>
                <td><b>0</b></td>
              </tr>
              <tr>
                <td><code>AB</code></td>
                <td>A</td>
                <td>B</td>
                <td>—</td>
                <td><b>0</b></td>
              </tr>
              <tr>
                <td><code>ABA</code></td>
                <td>A, AB</td>
                <td>A, BA</td>
                <td><code>A</code></td>
                <td><b>1</b></td>
              </tr>
              <tr>
                <td><code>ABAB</code></td>
                <td>A, AB, ABA</td>
                <td>B, AB, BAB</td>
                <td><code>AB</code></td>
                <td><b>2</b></td>
              </tr>
              <tr>
                <td><code>ABABC</code></td>
                <td>A, AB, ABA, ABAB</td>
                <td>C, BC, ABC, BABC</td>
                <td>—</td>
                <td><b>0</b></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            匹配时的规则只有一条:<strong>在 j 处失配,就让 j 跳到
            next[j−1],再试一次;跳到 0 还不行,i 才前进</strong>。
            为什么这样不会漏解?因为 next 给的是「最长」重叠 ——
            所有更短的对齐方式都被它间接覆盖(跳一次不行就再跳,链式回退)。
            完整实现如下,预处理 next 的代码和匹配的代码长得几乎一样,
            本质是「模式串自己和自己做匹配」:
          </p>
        </div>
        <CodeTabs
          title="kmp"
          java={{
            code: `class Solution {
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
            hl: [11, 12, 13, 21, 22],
          }}
          python={{
            code: `class Solution:
    def strStr(self, text: str, pattern: str) -> int:
        n, m = len(text), len(pattern)
        if m == 0:
            return 0

        # ---- 1) 预处理 next:模式串「自己匹配自己」,O(m) ----
        nxt = [0] * m          # nxt[0] 恒为 0
        k = 0                  # k = 当前最长重叠长度
        for i in range(1, m):
            # 续不上就沿 next 链回退,直到能续上或退到 0
            while k > 0 and pattern[i] != pattern[k]:
                k = nxt[k - 1]
            if pattern[i] == pattern[k]:
                k += 1
            nxt[i] = k

        # ---- 2) 匹配:i 永不回退,失配时 j 按 next 跳,O(n) ----
        j = 0                  # j = 模式串已匹配长度
        for i in range(n):
            while j > 0 and text[i] != pattern[j]:
                j = nxt[j - 1]  # 用情报滑动模式串,不重比重叠段
            if text[i] == pattern[j]:
                j += 1
            if j == m:          # 模式串全部对上
                return i - m + 1
        return -1`,
            hl: [12, 13, 21, 22],
          }}
          js={{
            code: `var strStr = function (text, pattern) {
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
            hl: [10, 11, 18, 19],
          }}
        />
        <Callout tone="win" title="KMP 的复杂度,以及面试怎么考它">
          <p>
            预处理 O(m) + 匹配 O(n) = <b>O(n+m)</b>,额外空间 O(m)。
            为什么匹配是 O(n)?j 每次失配至少减 1、每步至多加 1,总回退次数不超过
            总前进次数 ≤ n(均摊分析又立功了)。面试很少让你默写 KMP,
            但常考三连问:<b>暴力浪费了什么情报</b>(已匹配段的内容已知)、
            <b>next 数组是什么</b>(每个前缀的最长真前缀=真后缀长度)、
            <b>为什么主串指针不用回退</b>(滑动后重叠段保证相等)。
            能答出这三问,比背出代码值钱得多。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 三语言对照 ================= */}
      <Section
        id="langs"
        index="05"
        title="三语言对照:同一个不可变,三副面孔"
        desc="Java 的常量池、Python 的 join 哲学、JS 的 emoji 陷阱 —— 顶栏可全站切换语言"
      >
        <div className="prose">
          <p>
            三种语言的字符串<strong>都不可变、都能下标/遍历、拼接都要重建</strong>
            —— 抽象层面完全一致。不同的是各自的「文化」:Java 有常量池和 == 大坑,
            Python 用 join 和 f-string 把「攒后再拼」变成肌肉记忆,JS
            的模板字符串最顺手、但 UTF-16 的 emoji 坑也最深:
          </p>
        </div>
        <CodeTabs
          title="string_basics"
          java={{
            code: `// Java:String 不可变 + 字符串常量池
String a = "data";
String b = "data";
a == b;                 // true!字面量进「常量池」,a b 指向同一份
String c = new String("data");
a == c;                 // false:new 强行在堆里另开了一个对象
a.equals(c);            // true:比内容 —— 字符串比较永远用 equals

char ch = a.charAt(0);  // 取字符:O(1),char 本质是 16 位数字
a.substring(1, 3);      // "at":切片拷贝,O(k)
a + "!";                // 新串:"data!",原 a 纹丝不动

// 频繁修改 → StringBuilder(单线程用它)
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 3; i++) sb.append(i);
String s = sb.toString();   // "012"
// StringBuffer:同 API 但方法加锁,多线程安全、单线程白付锁开销`,
            note: (
              <>
                <b>易错点:</b>== 比引用、equals 比内容 —— 字面量因常量池碰巧 ==
                为 true,最会骗新手。面试追问:StringBuilder(快,不加锁)vs
                StringBuffer(线程安全,慢),单线程一律前者。
              </>
            ),
            hl: [4, 6, 7],
          }}
          python={{
            code: `# Python:str 不可变,「字符」就是长度为 1 的 str
s = "data"
s[0]              # 'd':O(1),拿到的还是 str(没有 char 类型)
s[-1]             # 'a':负下标,从尾数
s[1:3]            # 'at':切片拷贝,O(k)
s.upper()         # 'DATA':返回新串,s 本身不变
ord('d'), chr(100)  # 100, 'd':字符 ↔ 数字要显式转换

# f-string:格式化拼接的现代做法(3.6+)
name, n = "world", 42
msg = f"hello {name}, n={n}"

# 惯用法:循环拼接永远 join,不要 +=
parts = []
for i in range(3):
    parts.append(str(i))
s = "".join(parts)    # "012":整体 O(n)`,
            note: (
              <>
                <b>易错点:</b><code>s[0]</code> 返回的是 str 不是数字,想拿码点要{" "}
                <code>ord()</code>;str 是码点序列,所以 <code>len(&quot;👍&quot;)
                = 1</code> —— 三语言里唯一「按人眼数」的。
              </>
            ),
            hl: [3, 10, 11, 17],
          }}
          js={{
            code: `// JavaScript:string 不可变,内部 UTF-16
const s = "data";
s[0];                  // 'd':O(1) 下标读
s.slice(1, 3);         // 'at':切片拷贝,O(k)
s.toUpperCase();       // 'DATA':新串,s 不变

// 模板字符串:拼接的现代做法
const name = "world";
const msg = \`hello \${name}, len=\${s.length}\`;

// ⚠ emoji 大坑:length 数的是 UTF-16 单元
"👍".length;           // 2!代理对被数成两个
"👍".charAt(0);        // '\\ud83d':半个代理对,乱码
"👍".codePointAt(0);   // 128077:正确拿到码点
[..."👍"].length;      // 1:展开运算符按码点切分
for (const ch of "a👍") console.log(ch); // 'a','👍' 按码点遍历`,
            note: (
              <>
                <b>易错点:</b>处理可能含 emoji 的文本,遍历用 <code>for...of</code>、
                计数用 <code>Array.from(s).length</code>、取码点用{" "}
                <code>codePointAt</code> —— charAt/length/下标都是按 UTF-16
                单元算的,会把代理对劈成两半。
              </>
            ),
            hl: [9, 12, 13, 15],
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>操作</th>
                <th>Java(String)</th>
                <th>Python(str)</th>
                <th>JavaScript(string)</th>
                <th>复杂度</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>长度</td>
                <td><code>s.length()</code></td>
                <td><code>len(s)</code></td>
                <td><code>s.length</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>取字符</td>
                <td><code>s.charAt(i)</code></td>
                <td><code>s[i]</code></td>
                <td><code>s[i]</code> / <code>charAt(i)</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>子串 / 切片</td>
                <td><code>s.substring(a, b)</code></td>
                <td><code>s[a:b]</code></td>
                <td><code>s.slice(a, b)</code></td>
                <td><BigO o="n" label="O(k)" /></td>
              </tr>
              <tr>
                <td>查找子串</td>
                <td><code>s.indexOf(t)</code></td>
                <td><code>s.find(t)</code></td>
                <td><code>s.indexOf(t)</code></td>
                <td><BigO o="n2" label="O(n·m)" /></td>
              </tr>
              <tr>
                <td>分割</td>
                <td><code>s.split(&quot;,&quot;)</code></td>
                <td><code>s.split(&quot;,&quot;)</code></td>
                <td><code>s.split(&quot;,&quot;)</code></td>
                <td><BigO o="n" /></td>
              </tr>
              <tr>
                <td>拼接多段</td>
                <td><code>String.join</code> / <code>StringBuilder</code></td>
                <td><code>&quot;&quot;.join(parts)</code></td>
                <td><code>parts.join(&quot;&quot;)</code></td>
                <td><BigO o="n" /></td>
              </tr>
              <tr>
                <td>大小写</td>
                <td><code>s.toLowerCase()</code></td>
                <td><code>s.lower()</code></td>
                <td><code>s.toLowerCase()</code></td>
                <td><BigO o="n" /></td>
              </tr>
              <tr>
                <td>去首尾空白</td>
                <td><code>s.trim()</code> / <code>strip()</code></td>
                <td><code>s.strip()</code></td>
                <td><code>s.trim()</code></td>
                <td><BigO o="n" /></td>
              </tr>
              <tr>
                <td>替换全部</td>
                <td><code>s.replace(a, b)</code></td>
                <td><code>s.replace(a, b)</code></td>
                <td><code>s.replaceAll(a, b)</code>*</td>
                <td><BigO o="n" /></td>
              </tr>
              <tr>
                <td>转字符数组</td>
                <td><code>s.toCharArray()</code></td>
                <td><code>list(s)</code></td>
                <td><code>[...s]</code> / <code>s.split(&quot;&quot;)</code></td>
                <td><BigO o="n" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="viz-msg">
          * JS 的 <code>s.replace(&quot;a&quot;, &quot;b&quot;)</code>{" "}
          传字符串时<b>只替换第一处</b> —— 想全换用 <code>replaceAll</code> 或正则加{" "}
          <code>g</code> 标志,这是从其他语言迁移过来最容易踩的一脚。
          另:所有「返回新串」的操作,空间也都是 O(n)。
        </p>
        <Callout tone="deep" title="工程现场:常量池、驻留与 intern">
          <p>
            「内容相同的字符串共享同一份内存」这个优化有个学名:
            <b>字符串驻留(string interning)</b>。Java 把编译期字面量放进常量池,
            运行期字符串可手动 <code>s.intern()</code>;Python 自动驻留标识符样式的
            短字符串(所以 <code>&quot;abc&quot; is &quot;abc&quot;</code>{" "}
            有时为 True —— 但和 Java 的 == 一样,<b>判相等永远用 ==/equals
            比内容,别用 is 赌驻留</b>);JS 引擎在内部做同样的事,只是不给你开关。
            驻留的前提正是 §01 的不可变:内容会变的对象,谁敢共享?
          </p>
        </Callout>
      </Section>

      {/* ================= §06 套路与精讲 ================= */}
      <Section
        id="patterns"
        index="06"
        title="字符串的三大招式:对撞、滑窗、计数"
        desc="LeetCode 字符串题的主战场 —— 三道代表题,逐帧拆解"
        badge={<span className="chip" data-tone="warn">★ 面试核心</span>}
      >
        <div className="prose">
          <p>
            字符串题的招式和数组高度同源(毕竟是孪生兄弟),但有自己的三张王牌。
            拿到题先对信号:<strong>回文/反转</strong> → 对撞指针;
            <strong>连续子串的最值</strong> → 滑动窗口;
            <strong>异位词/字符统计</strong> → 计数数组。三张牌能解掉本章题单的八成:
          </p>
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">王牌一</div>
            <div className="card-title">对撞指针</div>
            <p>
              两端向中间夹,每步比较一对字符。回文验证、原地反转的标配;
              「中心扩展」是它的反向版:从中间向两边推 → LC 125、344、5。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">王牌二</div>
            <div className="card-title">滑动窗口</div>
            <p>
              「连续子串 + 条件可增量维护」= 滑窗。窗口里养一个 Set 或计数器,
              右端吃、左端吐 → LC 3、438、76。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">王牌三</div>
            <div className="card-title">计数数组</div>
            <p>
              字符集有限(26 个小写字母 / 128 ASCII)时,用定长 int
              数组代替哈希表:更快、更省、代码更短 → LC 242、438、383。
            </p>
          </div>
        </div>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 A</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 125 · 验证回文串
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">EASY</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>只考虑字母和数字、忽略大小写,判断字符串是否是回文
            (正读反读一样)。<b>暴力:</b>先过滤出纯字母数字的小写串,再和它的反转比较
            —— 正确,但建了两个 O(n) 的新字符串。<b>正解:</b>对撞指针原地判断,
            一个新字符串都不用建:
          </p>
        </div>
        <ArrayStepper title="LC 125 · 对撞指针,逐帧慢放" frames={F125} />
        <CodeTabs
          title="lc125_valid_palindrome"
          java={{
            code: `class Solution {
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
        return true;                // 指针相遇,全部核对通过
    }
}`,
            hl: [6, 7, 9, 10],
          }}
          python={{
            code: `class Solution:
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
        return True                 # 指针相遇,全部核对通过`,
            hl: [6, 8, 11],
          }}
          js={{
            code: `var isPalindrome = function (s) {
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
  return true;                             // 指针相遇,全部核对通过
};`,
            hl: [6, 7, 9],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n)</b>(每个字符最多被 l 或 r 看一次),空间 <b>O(1)</b> ——
            对比「过滤 + 反转」解法的 O(n) 额外空间,这就是原地双指针的意义。
            面试追问:「如果允许<b>删除至多一个字符</b>再判回文?」(→ LC 680:
            失配时分两路试 l+1 或 r−1,各自继续对撞)「为什么内层 while 要带{" "}
            <code>l &lt; r</code>?」(全标点的串会让指针越界 —— 边界意识是双指针的基本功)。
          </p>
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 B</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 3 · 无重复字符的最长子串
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>求最长的、不含重复字符的<strong>连续</strong>子串长度。
            <b> 暴力:</b>枚举所有子串起终点、逐个检查有无重复,O(n³)(或加 Set
            优化到 O(n²))。<b>正解:</b>「连续子串 + 无重复(可增量维护)」——
            滑窗两大信号全亮。关键洞察:窗口 [l..r] 无重复时,
            <strong>撞上重复字符只需要从左边吐,绝不需要 l 回头</strong> ——
            因为更靠左的起点只会更早撞上同一个重复:
          </p>
        </div>
        <ArrayStepper title='LC 3 · 滑动窗口 + Set(s = "abcabcbb")' frames={F3} />
        <CodeTabs
          title="lc3_longest_substring"
          java={{
            code: `class Solution {
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
            hl: [8, 9, 10, 12, 13],
          }}
          python={{
            code: `class Solution:
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
            hl: [7, 8, 9, 10, 11],
          }}
          js={{
            code: `var lengthOfLongestSubstring = function (s) {
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
            hl: [7, 8, 9, 11, 12],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            l、r 各自最多走 n 步,每个字符进出 Set 各一次 → 时间 <b>O(n)</b>,
            空间 O(min(n, 字符集大小))。追问一:「怎么再快一点?」用
            <b>哈希表记每个字符最后出现的位置</b>,撞上重复时 l 直接跳过去,
            省掉逐个吐的内层循环。追问二:「输入含 emoji 怎么办?」——
            §02 学的立刻用上:JS 里要先 <code>Array.from(s)</code> 按码点切分,
            否则代理对会被劈成两个「假字符」。
          </p>
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 C</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 5 · 最长回文子串
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>找出最长的回文<strong>连续子串</strong>(注意不是判断,是寻找)。
            <b> 暴力:</b>枚举所有 O(n²) 个子串、每个花 O(n) 验证回文 → O(n³)。
            <b> 正解:</b>换个枚举对象 —— 别枚举子串,<strong>枚举回文的中心</strong>。
            回文有个好性质:去掉两端还是回文,反过来说,
            <strong>从中心一层层向外扩,扩到断为止,就是该中心的最长回文</strong>。
            中心只有 2n−1 个(n 个字符 + n−1 个空隙),每个中心一口气扩到底:
          </p>
        </div>
        <ArrayStepper title='LC 5 · 中心扩展(s = "babad")' frames={F5} />
        <CodeTabs
          title="lc5_longest_palindrome"
          java={{
            code: `class Solution {
    public String longestPalindrome(String s) {
        int start = 0, maxLen = 0;
        for (int i = 0; i < s.length(); i++) {
            // 每个位置试两种中心:奇数长(i,i)和偶数长(i,i+1)
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
        return r - l - 1;           // 循环多退了一步,回文长度要减掉
    }
}`,
            hl: [6, 9, 17, 18, 19],
          }}
          python={{
            code: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        # 从中心 (l, r) 向两边扩,返回扩到底时的边界
        def expand(l: int, r: int) -> tuple[int, int]:
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1              # 两端相等就再扩一层
            return l + 1, r - 1     # 循环多退了一步,收回来

        best = (0, 0)
        for i in range(len(s)):
            # 每个位置试两种中心:奇数长(i,i)和偶数长(i,i+1)
            for l, r in (expand(i, i), expand(i, i + 1)):
                if r - l > best[1] - best[0]:
                    best = (l, r)
        return s[best[0] : best[1] + 1]`,
            hl: [5, 6, 7, 13],
          }}
          js={{
            code: `var longestPalindrome = function (s) {
  let start = 0, maxLen = 0;

  // 从中心 (l, r) 向两边扩,扩到断为止
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--; r++;                    // 两端相等就再扩一层
    }
    return r - l - 1;              // 循环多退了一步,长度要减掉
  };

  for (let i = 0; i < s.length; i++) {
    // 每个位置试两种中心:奇数长(i,i)和偶数长(i,i+1)
    const len = Math.max(expand(i, i), expand(i, i + 1));
    if (len > maxLen) {
      maxLen = len;
      start = i - Math.floor((len - 1) / 2); // 由中心和长度反推起点
    }
  }
  return s.slice(start, start + maxLen);
};`,
            hl: [6, 7, 14, 17],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            2n−1 个中心 × 每个最多扩 O(n) → 时间 <b>O(n²)</b>,空间 <b>O(1)</b>。
            面试追问:「有没有更快的?」—— 有,<b>Manacher 算法 O(n)</b>
            (在字符间插分隔符统一奇偶 + 复用已知回文的对称信息),
            但实现复杂,面试说出名字和思想就够加分;「动态规划行不行?」——
            行,dp[i][j] 表示 s[i..j] 是否回文,同样 O(n²) 但要 O(n²) 空间,
            中心扩展在空间上完胜。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title="高频题单:字符串 10 题"
        desc="对撞 → 计数 → 滑窗 → KMP,由易到难。勾选进度存在本地,先想 30 秒再看提示"
        badge={<span className="chip">Hot 100 精选</span>}
      >
        <ProblemSet ch="string" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="7 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="string" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            字符串 = <b>不可变的字符数组</b>:读 O(1),任何「修改」都是重抄 →
            拼接 O(n+m),<b>循环 += 是 O(n²)</b>,用
            StringBuilder / join 攒着最后结账。
          </>,
          <>
            字符的本质是数字:Unicode 发号(码点),UTF-8/16/32 决定存法。
            <b>Java/JS 的 length 数 UTF-16 单元</b>(emoji = 2),Python 的 len
            数码点 —— 「长度」永远先问口径。
          </>,
          <>
            子串查找:朴素 O(n·m);<b>KMP 用 next 数组</b>(每个前缀的最长真前缀=真后缀)
            让主串指针永不回退 → O(n+m)。记住三问:暴力浪费了什么、next
            是什么、为什么不用回退。
          </>,
          <>
            三大招式:<b>对撞指针</b>(回文/反转)、<b>滑动窗口</b>
            (连续子串 + 可增量维护)、<b>计数数组</b>(字符集有限时替代哈希表)。
          </>,
          <>
            语言坑位速查:Java <b>== 比引用、equals 比内容</b>;Python 没有
            char(长度 1 的 str),拼接用 join;JS 的 charAt
            会劈开代理对,处理 emoji 用 <code>for...of</code> / <code>codePointAt</code>。
          </>,
        ]}
      />

      <ChapterFooter ch="string" />
    </main>
  );
}
