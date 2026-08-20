"use client";

// 第 1 章 · 数组 —— 全书样板章。
// 十段式结构:直觉 → 内存 → 核心操作 → 动态数组 → 三语言对照 →
// 双指针/滑动窗口 + 三道精讲(逐帧动画 + 三语言题解)→ 题单 → 测验 → 要点。
//
// 双语:所有面向学习者的文案都用 <T en zh> 或 { en, zh },英文为默认语言。

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
import { PROBLEMS, QUIZ } from "@/lib/array-data";
import { T } from "@/lib/i18n";
import { IndexLab, ShiftLab, GrowLab, MatrixLab } from "./viz";

/* ================= 精讲动画帧 ================= */

// LC 283 移动零:slow/fast 同向双指针
const F283: ArrayFrame[] = [
  {
    cells: [{ v: 0 }, { v: 1 }, { v: 0 }, { v: 3 }, { v: 12 }],
    ptrs: [
      { i: 0, label: "slow" },
      { i: 0, label: "fast" },
    ],
    msg: (
      <T
        en={
          <>
            Start. slow marks the slot where the next non-zero value belongs.
            fast reads every element in turn. Goal: move the non-zero values to
            the front, and the zeros end up at the back.
          </>
        }
        zh={
          <>
            初始:slow 指向「下一个非零元素该放的位置」,fast 负责逐个读。
            目标是把非零元素前移,零自然落到末尾。
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: 0, state: "bad" }, { v: 1 }, { v: 0 }, { v: 3 }, { v: 12 }],
    ptrs: [
      { i: 0, label: "slow" },
      { i: 0, label: "fast" },
    ],
    msg: (
      <T
        en={
          <>
            fast = 0: nums[0] is <b>0</b>. Nothing to move. fast advances and
            slow stays, waiting for a non-zero value.
          </>
        }
        zh={
          <>
            fast=0:nums[0] 是 <b>0</b> —— 不需要搬,fast 前进,slow 原地等下一个非零元素。
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: 0, state: "lit" }, { v: 1, state: "lit" }, { v: 0 }, { v: 3 }, { v: 12 }],
    ptrs: [
      { i: 0, label: "slow" },
      { i: 1, label: "fast" },
    ],
    msg: (
      <T
        en={
          <>
            fast = 1: a non-zero value <b>1</b>. Swap it with the value at slow,
            so 1 moves forward and 0 moves back.
          </>
        }
        zh={
          <>
            fast=1:遇到非零元素 <b>1</b>。与 slow 位置交换 —— 1 换到前面,0 换到后面。
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 0 }, { v: 0, state: "bad" }, { v: 3 }, { v: 12 }],
    ptrs: [
      { i: 1, label: "slow" },
      { i: 2, label: "fast" },
    ],
    msg: (
      <T
        en={
          <>
            The swap is done, so slow moves to 1. fast = 2 finds another{" "}
            <b>0</b> and skips it. The prefix [1] now holds only non-zero
            values.
          </>
        }
        zh={
          <>
            交换完成,slow 前移到 1。fast=2 又遇到 <b>0</b>,跳过。
            前缀 [1] 现在只含非零元素。
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 0, state: "lit" }, { v: 0 }, { v: 3, state: "lit" }, { v: 12 }],
    ptrs: [
      { i: 1, label: "slow" },
      { i: 3, label: "fast" },
    ],
    msg: (
      <T
        en={
          <>
            fast = 3: a non-zero value <b>3</b>. Swap it with the 0 sitting at
            slow = 1.
          </>
        }
        zh={
          <>
            fast=3:非零元素 <b>3</b>,与 slow=1 位置上的 0 交换。
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 3, state: "ok" }, { v: 0, state: "lit" }, { v: 0 }, { v: 12, state: "lit" }],
    ptrs: [
      { i: 2, label: "slow" },
      { i: 4, label: "fast" },
    ],
    msg: (
      <T
        en={
          <>
            fast = 4: a non-zero value <b>12</b>. Swap it with the 0 sitting at
            slow = 2.
          </>
        }
        zh={
          <>
            fast=4:非零元素 <b>12</b>,与 slow=2 位置上的 0 交换。
          </>
        }
      />
    ),
  },
  {
    cells: [
      { v: 1, state: "ok" },
      { v: 3, state: "ok" },
      { v: 12, state: "ok" },
      { v: 0, state: "ghost" },
      { v: 0, state: "ghost" },
    ],
    msg: (
      <T
        en={
          <>
            Done: [1, 3, 12, 0, 0]. One pass, <b>O(n)</b> time and <b>O(1)</b>{" "}
            extra space, and the non-zero values keep their original order. The
            rule that makes this correct is the <b>loop invariant</b>:
            everything to the left of slow is already non-zero and in order.
          </>
        }
        zh={
          <>
            完成:[1, 3, 12, 0, 0]。一次遍历,时间 <b>O(n)</b>、额外空间{" "}
            <b>O(1)</b>,非零元素相对顺序不变。让它成立的是这条
            <b>循环不变量</b>:slow 左边的部分永远是「已整理好、顺序不变的非零区」。
          </>
        }
      />
    ),
  },
];

// LC 11 盛最多水:对撞指针
const H11 = [1, 8, 6, 2, 5, 4, 8, 3, 7];
const F11: ArrayFrame[] = [
  {
    cells: H11.map((v, i) => ({ v, state: i === 0 || i === 8 ? "lit" : undefined })),
    ptrs: [
      { i: 0, label: "L" },
      { i: 8, label: "R" },
    ],
    msg: (
      <T
        en={
          <>
            L = 0 (height 1), R = 8 (height 7). Area = min(1, 7) × width 8 ={" "}
            <b>8</b>. The shorter line is on the left, so move L to the right.
          </>
        }
        zh={
          <>
            L=0(高 1)、R=8(高 7):面积 = min(1,7) × 宽 8 = <b>8</b>。
            较矮的一边在左侧,所以 L 右移。
          </>
        }
      />
    ),
  },
  {
    cells: H11.map((v, i) => ({ v, state: i === 1 || i === 8 ? "lit" : undefined })),
    ptrs: [
      { i: 1, label: "L" },
      { i: 8, label: "R" },
    ],
    msg: (
      <T
        en={
          <>
            L = 1 (height 8), R = 8 (height 7). Area = min(8, 7) × 7 = <b>49</b>
            , the best so far. Now the shorter line is on the right, so move R
            to the left.
          </>
        }
        zh={
          <>
            L=1(高 8)、R=8(高 7):面积 = min(8,7) × 7 = <b>49</b>,当前最优。
            这次较矮的一边在右侧,所以 R 左移。
          </>
        }
      />
    ),
  },
  {
    cells: H11.map((v, i) => ({ v, state: i === 1 || i === 7 ? "lit" : undefined })),
    ptrs: [
      { i: 1, label: "L" },
      { i: 7, label: "R" },
    ],
    msg: (
      <T
        en={
          <>
            L = 1 (8), R = 7 (3). Area = 3 × 6 = 18, which is less than 49. The
            shorter line 3 is on the right, so move R.
          </>
        }
        zh={
          <>
            L=1(8)、R=7(3):面积 = 3 × 6 = 18 &lt; 49。较矮的 3 在右侧,R 左移。
          </>
        }
      />
    ),
  },
  {
    cells: H11.map((v, i) => ({ v, state: i === 1 || i === 6 ? "lit" : undefined })),
    ptrs: [
      { i: 1, label: "L" },
      { i: 6, label: "R" },
    ],
    msg: (
      <T
        en={
          <>
            L = 1 (8), R = 6 (8). Area = 8 × 5 = 40. Both sides have the same
            height, so either one can move. Move R.
          </>
        }
        zh={
          <>
            L=1(8)、R=6(8):面积 = 8 × 5 = 40。两端等高,动哪边都可以,这里动 R。
          </>
        }
      />
    ),
  },
  {
    cells: H11.map((v, i) => ({ v, state: i === 1 || i === 5 ? "lit" : undefined })),
    ptrs: [
      { i: 1, label: "L" },
      { i: 5, label: "R" },
    ],
    msg: (
      <T
        en={
          <>
            L = 1 (8), R = 5 (4). Area = 4 × 4 = 16. From here R keeps moving
            left and the width keeps shrinking.
          </>
        }
        zh={
          <>
            L=1(8)、R=5(4):面积 = 4 × 4 = 16。此后 R 继续左移,宽度只会越来越小。
          </>
        }
      />
    ),
  },
  {
    cells: H11.map((v, i) => ({ v, state: i === 1 || i === 2 ? "lit" : i === 8 ? "ok" : undefined })),
    ptrs: [
      { i: 1, label: "L" },
      { i: 2, label: "R" },
    ],
    msg: (
      <T
        en={
          <>
            L and R meet and the answer is <b>49</b>. Why is it safe to skip so
            many pairs? Because every pair that keeps the shorter line has a{" "}
            <b>smaller width and no greater height</b>, so its area cannot beat
            the one just measured. Discarding the shorter line loses nothing,
            and that turns O(n²) into O(n).
          </>
        }
        zh={
          <>
            L、R 相遇,答案锁定 <b>49</b>。为什么可以跳过这么多组合?因为任何
            <b>仍然保留那条较矮线</b>的组合,宽度更小、高度不会更高,面积不可能超过刚算过的值。
            丢掉较矮的一端不会丢掉答案,这就是 O(n²) 降到 O(n) 的依据。
          </>
        }
      />
    ),
  },
];

// LC 209 长度最小的子数组:滑动窗口,target = 7
const N209 = [2, 3, 1, 2, 4, 3];
const win = (l: number, r: number, extra?: { ok?: boolean }): ArrayFrame["cells"] =>
  N209.map((v, i) => ({
    v,
    state: i >= l && i <= r ? (extra?.ok ? "ok" : "lit") : undefined,
  }));
const F209: ArrayFrame[] = [
  {
    cells: N209.map((v) => ({ v })),
    msg: (
      <T
        en={
          <>
            target = 7. The window is one contiguous piece of the array. The
            right end adds elements, the left end removes them.
          </>
        }
        zh={
          <>
            target = 7。窗口就是数组里的一段连续区间:右端负责加入元素,左端负责移出元素。
          </>
        }
      />
    ),
  },
  {
    cells: win(0, 1),
    ptrs: [
      { i: 0, label: "l" },
      { i: 1, label: "r" },
    ],
    msg: (
      <T
        en={<>r moves right: sum = 2 + 3 = 5, still below 7. Keep adding.</>}
        zh={<>r 右移:sum = 2 + 3 = 5 &lt; 7,继续加入元素。</>}
      />
    ),
  },
  {
    cells: win(0, 3),
    ptrs: [
      { i: 0, label: "l" },
      { i: 3, label: "r" },
    ],
    msg: (
      <T
        en={
          <>
            r reaches 3: sum = 2+3+1+2 = <b>8 ≥ 7</b>. Record length 4, then
            shrink from the left.
          </>
        }
        zh={
          <>
            r 右移到 3:sum = 2+3+1+2 = <b>8 ≥ 7</b>,记录长度 4,然后从左端收缩。
          </>
        }
      />
    ),
  },
  {
    cells: win(1, 3),
    ptrs: [
      { i: 1, label: "l" },
      { i: 3, label: "r" },
    ],
    msg: (
      <T
        en={
          <>
            l moves right and drops 2: sum = 6, below 7. Shrinking stops and the
            window grows again.
          </>
        }
        zh={
          <>
            l 右移,移出 2:sum = 6 &lt; 7,收缩停止,窗口重新向右扩张。
          </>
        }
      />
    ),
  },
  {
    cells: win(1, 4),
    ptrs: [
      { i: 1, label: "l" },
      { i: 4, label: "r" },
    ],
    msg: (
      <T
        en={
          <>
            r = 4: sum = 3+1+2+4 = <b>10 ≥ 7</b>. Length 4 again, which is not
            better. Shrink from the left.
          </>
        }
        zh={
          <>
            r=4:sum = 3+1+2+4 = <b>10 ≥ 7</b>,长度还是 4(不更优),继续收缩。
          </>
        }
      />
    ),
  },
  {
    cells: win(2, 4),
    ptrs: [
      { i: 2, label: "l" },
      { i: 4, label: "r" },
    ],
    msg: (
      <T
        en={
          <>
            Drop 3: sum = 7, still ≥ 7, so length <b>3</b> is a new best.
            Shrink once more and sum falls to 6, so stop.
          </>
        }
        zh={
          <>
            移出 3:sum = 7,仍然 ≥ 7,长度 <b>3</b> 成为新的最优解。
            再收缩一次 sum = 6,停止。
          </>
        }
      />
    ),
  },
  {
    cells: win(4, 5, { ok: true }),
    ptrs: [
      { i: 4, label: "l" },
      { i: 5, label: "r" },
    ],
    msg: (
      <T
        en={
          <>
            After r = 5 the window shrinks twice more: [4, 3] sums to 7 with
            length <b>2</b>, the final answer. l and r each move at most n
            steps, so the total work is at most 2n. That is <b>O(n)</b>, not
            O(n²).
          </>
        }
        zh={
          <>
            r=5 之后再收缩两次:窗口 [4, 3] 和为 7,长度 <b>2</b> —— 最终答案。
            l 和 r 各自最多走 n 步,总步数不超过 2n,所以是 <b>O(n)</b> 而不是 O(n²)。
          </>
        }
      />
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: { en: "Intuition", zh: "直觉" } },
  { id: "memory", n: "02", label: { en: "In memory", zh: "内存里的样子" } },
  {
    id: "ops",
    n: "03",
    label: { en: "Operations and binary search", zh: "核心操作与二分" },
  },
  { id: "dynamic", n: "04", label: { en: "Dynamic arrays", zh: "动态数组" } },
  { id: "build", n: "05", label: { en: "Build one", zh: "手写实现" } },
  { id: "matrix", n: "06", label: { en: "2D arrays", zh: "二维数组" } },
  {
    id: "langs",
    n: "07",
    label: { en: "Three languages", zh: "三语言对照" },
  },
  {
    id: "patterns",
    n: "08",
    label: { en: "Two pointers and window", zh: "双指针与滑窗" },
  },
  { id: "problems", n: "09", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "10", label: { en: "Quiz", zh: "通关测验" } },
];

export default function ArrayChapter() {
  return (
    <main className="page" data-ch="array">
      <Hero
        ch="array"
        title={{
          en: (
            <>
              The <span className="grad">Array</span>
            </>
          ),
          zh: (
            <>
              数组 <span className="grad">Array</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A row of <strong>side-by-side</strong> slots in memory, numbered
              from 0. It pays for every insertion and deletion in the middle by
              moving the elements after it, and in exchange it gives you the
              fastest operation in this course:{" "}
              <strong>O(1) random access</strong>.
            </>
          ),
          zh: (
            <>
              内存里一排<strong>连续</strong>的格子,门牌号就是下标。它用「中间插删要搬动后面所有元素」的代价,
              换来了整个数据结构世界里最快的一件事:<strong>O(1) 随机访问</strong>。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 直觉 ================= */}
      <Section
        id="intuition"
        index="01"
        title={{
          en: "Intuition: a row of numbered lockers",
          zh: "直觉:一排编了号的储物柜",
        }}
        desc={{
          en: "Get the picture first, then talk about complexity.",
          zh: "先建立画面感,再谈复杂度",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Picture the row of lockers at a gym: the lockers are{" "}
                  <strong>next to each other</strong>, all the same size, and
                  numbered from 0. With key number 5 in your hand you do not
                  check locker 0, then 1, then 2. You walk straight to locker 5.
                  That is the one ability an array is built for:{" "}
                  <strong>give it an index and it returns the element</strong>.
                </p>
                <p>
                  The row of lockers follows three rules. Every behavior of an
                  array comes from these three rules.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  想象健身房门口那排储物柜:柜子<strong>一个挨一个</strong>、大小一致、
                  从 0 开始编号。你拿着 5 号钥匙,不需要从 0 号一路看过去 ——
                  直接走到 5 号柜前开门。这就是数组被设计出来要做好的那件事:
                  <strong>给我下标,我立刻给你元素</strong>。
                </p>
                <p>
                  这排柜子遵守三条规矩,数组的所有行为都从这三条规矩里长出来:
                </p>
              </>
            }
          />
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">RULE 01</div>
            <div className="card-title">
              <T en="Contiguous" zh="连续" />
            </div>
            <T
              en={
                <p>
                  The elements sit next to each other in memory, with no gaps.
                  The benefit: any position can be computed with a formula. The
                  cost: inserting or deleting in the middle means moving
                  elements.
                </p>
              }
              zh={
                <p>
                  所有元素在内存里一个挨一个,中间没有空隙。好处:任意位置都能用公式算出来;
                  代价:中间插入或删除必须搬动其他元素。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 02</div>
            <div className="card-title">
              <T en="Same element size" zh="同型等宽" />
            </div>
            <T
              en={
                <p>
                  Every element takes the same number of bytes, for example 4
                  bytes for an int. That is what makes the multiplication{" "}
                  <code>index × element size</code> possible.
                </p>
              }
              zh={
                <p>
                  每个元素占用的字节数相同(比如都是 4 字节的 int)。
                  <code>下标 × 元素大小</code>这一步乘法,靠的就是它。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 03</div>
            <div className="card-title">
              <T en="Fixed length (the basic form)" zh="定长(基本形态)" />
            </div>
            <T
              en={
                <p>
                  Once allocated, the length cannot change, because the memory
                  right after it may already be used by something else. To
                  &ldquo;grow&rdquo;, the whole block has to move to a larger
                  one. That is the dynamic array in §04.
                </p>
              }
              zh={
                <p>
                  建好后长度不可变 —— 紧挨着它的那块内存不一定是空的。想「变长」,
                  只能整体搬到一块更大的内存里,这就是 §04 的动态数组。
                </p>
              }
            />
          </div>
        </div>
        <Callout
          tone="story"
          title={{ en: "Arrays are everywhere", zh: "它无处不在" }}
        >
          <T
            en={
              <p>
                Your photos are arrays of pixels. The text on this page is an
                array of characters. A database page stores its rows one after
                another. The array is the structure closest to the hardware, and
                it is the <b>base</b> that hash tables, heaps, and dynamic
                arrays are built on. Learn this chapter well and the next few
                will be easier.
              </p>
            }
            zh={
              <p>
                你的照片是像素数组,这个网页上的文字是字符数组,数据库的一页记录也是一条接一条存放的。
                数组是最贴近硬件的结构,也是后面哈希表、堆、动态数组的<b>地基</b>。
                把这一章学扎实,后面几章会轻松很多。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §02 内存 ================= */}
      <Section
        id="memory"
        index="02"
        title={{
          en: "In memory: one formula does all the work",
          zh: "内存里的样子:一条公式打天下",
        }}
        desc={{
          en: "address = base address + index × element size. Click a cell below to check it.",
          zh: "地址 = 首地址 + 下标 × 元素大小 —— 点下面的格子验证它",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                Memory is one long street of numbered addresses. What an array
                asks the system for is{" "}
                <strong>one contiguous range of those addresses</strong>.
                Suppose an int array starts at address 1000 and each int takes 4
                bytes. Then the address of element i is not searched for. It is
                calculated:
              </p>
            }
            zh={
              <p>
                内存是一条编了门牌号的长街。数组向系统申请的是
                <strong>一段连续的门牌号</strong>。假设一个 int 数组从地址 1000 开始、
                每个 int 占 4 字节,那么第 i 个元素住在哪,不用找 —— 用算的:
              </p>
            }
          />
        </div>
        <IndexLab />
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-title">
              <T en="Why does indexing start at 0?" zh="为什么下标从 0 开始?" />
            </div>
            <T
              en={
                <p>
                  Because an index is really an <b>offset</b>. The first element
                  is 0 units away from the base address. <code>arr[0]</code>{" "}
                  means &ldquo;0 steps from the start&rdquo;, and the formula
                  works out cleanly. It is not a habit of computer scientists,
                  it follows from the formula.
                </p>
              }
              zh={
                <p>
                  因为下标本质是<b>偏移量</b>:第一个元素距离首地址 0 个单位。
                  <code>arr[0]</code> 读作「从起点偏移 0 步」,公式就自然成立 ——
                  这不是计算机科学家的怪癖,是公式的必然结果。
                </p>
              }
            />
          </div>
          <div className="card">
            <div className="card-title">
              <T
                en="Why is going out of bounds dangerous?"
                zh="越界为什么危险?"
              />
            </div>
            <T
              en={
                <p>
                  The formula does not know where the array ends.{" "}
                  <code>arr[100]</code> computes an address even when another
                  variable lives there. In C that is the classic buffer
                  overflow. Java throws{" "}
                  <code>ArrayIndexOutOfBoundsException</code>, Python raises{" "}
                  <code>IndexError</code>, and JavaScript simply returns{" "}
                  <code>undefined</code> for a read past the end. The checks are
                  safer, but they are not free.
                </p>
              }
              zh={
                <p>
                  公式不知道数组在哪里结束:<code>arr[100]</code>{" "}
                  照样会算出一个地址,哪怕那里存的是别人的数据。C 语言里这是经典的缓冲区溢出;
                  Java 抛 <code>ArrayIndexOutOfBoundsException</code>,Python 抛{" "}
                  <code>IndexError</code>,JavaScript 读越界则直接返回{" "}
                  <code>undefined</code>。有检查更安全,但检查本身也有开销。
                </p>
              }
            />
          </div>
        </div>
        <Callout
          tone="deep"
          title={{
            en: "Why the CPU cache favours arrays",
            zh: "工程视角:CPU 缓存为什么偏爱数组",
          }}
        >
          <T
            en={
              <p>
                The CPU does not read memory one byte at a time. It reads a
                whole block, called a cache line, usually 64 bytes. Because
                array elements sit next to each other, reading{" "}
                <code>arr[0]</code> also pulls <code>arr[1..15]</code> into the
                cache when the elements are 4-byte ints. A forward scan then
                finds almost every element already in the cache. This is a cache
                effect, not a difference in complexity: walking an array and
                walking a linked list are both O(n), but in practice the array
                is often several times faster.
              </p>
            }
            zh={
              <p>
                CPU 不是一个字节一个字节地读内存,而是一次搬一整块 ——
                这一块叫缓存行,通常 64 字节。数组的元素紧挨着,元素是 4 字节 int 时,
                读 <code>arr[0]</code> 会顺便把 <code>arr[1..15]</code>{" "}
                一起带进缓存,顺序遍历几乎全程命中。注意这是缓存效应,不是复杂度差异:
                遍历数组和遍历链表都是 O(n),但实际运行时数组常常快上几倍。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §03 核心操作 ================= */}
      <Section
        id="ops"
        index="03"
        title={{
          en: "Core operations and binary search",
          zh: "核心操作与二分查找",
        }}
        desc={{
          en: "Every cost comes from one question: do other elements have to move?",
          zh: "所有成本都来自一个问题 —— 要不要搬动别的元素?",
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
                    <T en="Read or write by index" zh="按下标读 / 写" />
                  </b>{" "}
                  <code>arr[i]</code>
                </td>
                <td><BigO o="1" /></td>
                <td>
                  <T
                    en="One formula gives the address. No other element is touched."
                    zh="一条公式算出地址,不碰任何其他元素"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Append at the end" zh="尾部追加" />
                  </b>
                  <T en=" (space available)" zh="(有空位)" />
                </td>
                <td><BigO o="1" /></td>
                <td>
                  <T
                    en="Write into the next free slot. Nothing has to move."
                    zh="直接写进下一个空格,无人需要挪动"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T
                      en="Insert at the front or in the middle"
                      zh="头部 / 中间插入"
                    />
                  </b>
                </td>
                <td><BigO o="n" /></td>
                <td>
                  <T
                    en="Every element to the right of the insertion point shifts one slot right to make room."
                    zh="插入点右侧所有元素整体右移一格腾位置"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Delete" zh="删除" />
                  </b>
                  <T en=" (not at the end)" zh="(非尾部)" />
                </td>
                <td><BigO o="n" /></td>
                <td>
                  <T
                    en="Every element to the right shifts one slot left to close the gap. Deleting means filling in, not cutting out."
                    zh="右侧所有元素整体左移一格填补空位 —— 删除是「补位」不是「抠掉」"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Search" zh="查找" />
                  </b>
                  <T en=" (unsorted)" zh="(无序)" />
                </td>
                <td><BigO o="n" /></td>
                <td>
                  <T
                    en="There is no clue about where the value is, so you check every element in turn."
                    zh="没有任何线索,只能从头看到尾(线性扫描)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Search" zh="查找" />
                  </b>
                  <T en=" (sorted, binary search)" zh="(有序,二分)" />
                </td>
                <td><BigO o="logn" /></td>
                <td>
                  <T
                    en="Each comparison removes half of the remaining range. This needs sorted data and O(1) random access together."
                    zh="每比较一次砍掉一半 —— 有序 + O(1) 随机访问,二者缺一不可"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                The important column is the last one. Insert and delete a few
                times yourself and count the moves. After that you will not
                confuse these costs again.
              </p>
            }
            zh={
              <p>
                表格里最重要的不是结论,是那列「为什么」。亲手做几次插入删除,
                数一数搬动了几次,你就不会再记错:
              </p>
            }
          />
        </div>
        <ShiftLab />
        <Callout
          tone="warn"
          title={{
            en: "A common mistake in interviews",
            zh: "面试高频陷阱",
          }}
        >
          <T
            en={
              <p>
                &ldquo;Deleting one element from an array&rdquo; is not O(1)
                just because the API call is short.{" "}
                <code>list.pop(0)</code> in Python, <code>arr.shift()</code> in
                JavaScript, and <code>list.remove(0)</code> on a Java{" "}
                <code>ArrayList</code> are all O(n). The convenient method still
                shifts every element after the removed one.
              </p>
            }
            zh={
              <p>
                「数组删除一个元素」并不因为 API 写起来短就是 O(1)。Python 的{" "}
                <code>list.pop(0)</code>、JavaScript 的 <code>arr.shift()</code>
                、Java <code>ArrayList</code> 的 <code>list.remove(0)</code>{" "}
                全都是 O(n) —— 顺手的方法背后,仍然在搬动后面的每一个元素。
              </p>
            }
          />
        </Callout>

        <div className="prose" style={{ marginTop: 28 }}>
          <T
            en={
              <p>
                The <strong>O(log n) search on sorted data</strong> in that
                table deserves its own code.{" "}
                <strong>Binary search</strong> repeatedly cuts the remaining
                range in half: compare the middle element with the target, and
                one half can be discarded. Think of guessing a number between 1
                and 100 where each guess is answered with
                &ldquo;higher&rdquo; or &ldquo;lower&rdquo;. Always guessing the
                middle finds it in at most 7 guesses, because 2⁷ = 128 &gt; 100.
                A million elements take 20 comparisons. A billion take 30. That
                is what a logarithm means here.
              </p>
            }
            zh={
              <p>
                表里那行 <strong>O(log n) 的有序查找</strong>值得单独写一遍代码。
                <strong>二分查找(binary search)</strong>
                的做法是反复把剩余区间砍掉一半:拿中间元素和目标比一次,就能丢掉一半。
                想象猜数字游戏:1~100 之间,对方只回答「大了 / 小了」,每次都猜中间值,
                最多 7 次必中(2⁷ = 128 &gt; 100)。一百万个元素只要 20 次,十亿个只要 30 次
                —— 这就是对数的意义。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="binary_search"
          java={{
            code: {
              en: `// Precondition: nums is sorted in ascending order. Returns the index of target, or -1.
public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;   // closed interval [left, right]
    while (left <= right) {                  // the interval still holds elements
        int mid = left + (right - left) / 2; // this form cannot overflow
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;   // target is in the right half
        else right = mid - 1;                          // target is in the left half
    }
    return -1;
}`,
              zh: `// 前提:nums 升序。返回 target 的下标,不存在返回 -1
public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;   // 闭区间 [left, right]
    while (left <= right) {                  // 区间里还有元素就继续
        int mid = left + (right - left) / 2; // 这种写法不会溢出
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;   // 目标在右半边
        else right = mid - 1;                          // 目标在左半边
    }
    return -1;
}`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> Java <code>int</code> overflows. When
                  both values are close to 2³¹ − 1,{" "}
                  <code>(left + right) / 2</code> becomes negative. Write{" "}
                  <code>left + (right - left) / 2</code> instead; the difference
                  always fits.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>Java 的 <code>int</code> 会溢出 ——
                  两个数都接近 2³¹ − 1 时,<code>(left + right) / 2</code>{" "}
                  会变成负数。标准写法是 <code>left + (right - left) / 2</code>,
                  两数之差一定放得下。
                </>
              ),
            },
            hl: [5],
          }}
          python={{
            code: {
              en: `# Precondition: nums is sorted in ascending order. Returns the index of target, or -1.
def search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1        # closed interval [left, right]
    while left <= right:                  # the interval still holds elements
        mid = (left + right) // 2         # Python ints are unbounded, no overflow
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1                # target is in the right half
        else:
            right = mid - 1               # target is in the left half
    return -1

# The standard library has this too: import bisect, then bisect.bisect_left(nums, target)`,
              zh: `# 前提:nums 升序。返回 target 的下标,不存在返回 -1
def search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1        # 闭区间 [left, right]
    while left <= right:                  # 区间里还有元素就继续
        mid = (left + right) // 2         # Python 整数无上限,不会溢出
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1                # 目标在右半边
        else:
            right = mid - 1               # 目标在左半边
    return -1

# 标准库里也有:import bisect,然后 bisect.bisect_left(nums, target)`,
            },
            note: {
              en: (
                <>
                  Python integers have no fixed width, so there is no overflow
                  here. The <code>bisect</code> module in the standard library
                  is already a binary search.
                </>
              ),
              zh: (
                <>
                  Python 整数没有位宽上限,这里不存在溢出;标准库的{" "}
                  <code>bisect</code> 模块本身就是现成的二分查找。
                </>
              ),
            },
            hl: [5],
          }}
          js={{
            code: {
              en: `// Precondition: nums is sorted in ascending order. Returns the index of target, or -1.
var search = function (nums, target) {
  let left = 0, right = nums.length - 1;  // closed interval [left, right]
  while (left <= right) {                 // the interval still holds elements
    const mid = Math.floor((left + right) / 2);  // exact for any array length
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) left = mid + 1;  // target is in the right half
    else right = mid - 1;                         // target is in the left half
  }
  return -1;
};`,
              zh: `// 前提:nums 升序。返回 target 的下标,不存在返回 -1
var search = function (nums, target) {
  let left = 0, right = nums.length - 1;  // 闭区间 [left, right]
  while (left <= right) {                 // 区间里还有元素就继续
    const mid = Math.floor((left + right) / 2);  // 任意数组长度下都精确
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) left = mid + 1;  // 目标在右半边
    else right = mid - 1;                         // 目标在左半边
  }
  return -1;
};`,
            },
            note: {
              en: (
                <>
                  <b>Detail:</b> many samples write <code>(left + right) &gt;&gt; 1</code>
                  . The <code>&gt;&gt;</code> operator first converts its operand
                  to a 32-bit signed integer, so it is only safe while the sum
                  stays below 2³¹. JavaScript numbers are doubles and hold
                  integers exactly up to 2⁵³, which is far beyond any array
                  length, so <code>Math.floor((left + right) / 2)</code> is
                  always correct.
                </>
              ),
              zh: (
                <>
                  <b>细节:</b>很多示例写 <code>(left + right) &gt;&gt; 1</code>。
                  <code>&gt;&gt;</code> 会先把操作数转成 32 位有符号整数,
                  只有在和小于 2³¹ 时才安全。JavaScript 的数字是双精度浮点,
                  能精确表示 2⁵³ 以内的整数,远超任何数组长度,所以{" "}
                  <code>Math.floor((left + right) / 2)</code> 始终正确。
                </>
              ),
            },
            hl: [5],
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "The invariant, and the three details interviewers ask about",
            zh: "二分的循环不变量与三个易错点",
          }}
        >
          <T
            en={
              <p>
                The code above uses a <b>closed interval</b>{" "}
                <code>[left, right]</code>, meaning both ends are still
                candidates. The invariant is: <b>if target is in the array, its
                index is inside [left, right]</b>. Every branch preserves it,
                because <code>nums[mid] &lt; target</code> rules out everything
                up to mid, and <code>nums[mid] &gt; target</code> rules out
                everything from mid on. Three details follow from the
                invariant. First, the loop condition is{" "}
                <code>left &lt;= right</code>, because an interval with one
                element still has to be checked. Second, the update must be{" "}
                <code>mid + 1</code> or <code>mid - 1</code>; keeping mid inside
                the interval can loop forever. Third, binary search needs sorted
                data <b>and</b> O(1) random access, so it does not work on a
                linked list. Practice: LC 704 for the template, LC 35 to see
                where left stops when the value is absent.
              </p>
            }
            zh={
              <p>
                上面的代码用的是<b>闭区间</b> <code>[left, right]</code>,
                两个端点都还是候选。循环不变量是:
                <b>如果 target 在数组里,它的下标一定落在 [left, right] 内</b>。
                每个分支都在维持这条:<code>nums[mid] &lt; target</code>{" "}
                排除了 mid 及其左边,<code>nums[mid] &gt; target</code>{" "}
                排除了 mid 及其右边。由不变量可以推出三个细节:① 循环条件是{" "}
                <code>left &lt;= right</code>,因为只剩一个元素的区间也必须检查;
                ② 收缩必须写 <code>mid + 1</code> 或 <code>mid - 1</code>,
                把 mid 留在区间里可能死循环;③ 二分同时需要<b>有序</b>和
                <b>O(1) 随机访问</b>,所以链表上没法二分。
                对应练习:LC 704(模板题)、LC 35(找不到时 left 停在哪)。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §04 动态数组 ================= */}
      <Section
        id="dynamic"
        index="04"
        title={{
          en: "Dynamic arrays: how a fixed block pretends to grow",
          zh: "动态数组:定长如何假装无限",
        }}
        desc={{
          en: "What ArrayList, Python list, and JS Array really do: when the block is full, allocate a bigger one and copy.",
          zh: "ArrayList / list / JS Array 的真身 —— 满了就申请更大的一块,把旧元素搬过去",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                A plain array has a fixed length, yet you use
                &ldquo;arrays&rdquo; that you can push into forever. The trick
                is simple:{" "}
                <strong>
                  keep a fixed-size array inside, plus a count of how many slots
                  are used
                </strong>
                . If there is room, write into the next slot, which is O(1). If
                it is full, allocate a{" "}
                <strong>larger array, usually 1.5 to 2 times the size</strong>,
                copy every element across, and continue. Trigger a resize
                yourself:
              </p>
            }
            zh={
              <p>
                普通数组定长,但我们天天在用「能一直 push 的数组」。它的做法很朴素:
                <strong>内部维护一个定长数组 + 一个记录已用多少的 size</strong>。
                有空位就直接写进下一格(O(1));满了就申请一个
                <strong>更大的数组(通常是原来的 1.5 到 2 倍)</strong>,
                把旧元素全部拷贝过去,再继续。亲手触发一次扩容:
              </p>
            }
          />
        </div>
        <GrowLab />
        <div className="prose" style={{ marginTop: 16 }}>
          <T
            en={
              <p>
                One resize really does cost O(n), so why call append O(1)? Count
                the total instead of one call. Growing from capacity 1 to n by
                doubling copies 1 + 2 + 4 + … + n/2, which is less than n. So{" "}
                <strong>n appends do at most about 2n units of work in
                total</strong>, an average of 2 units each, which is a constant.
                This way of counting is called{" "}
                <strong>amortized analysis</strong>, and the average is what the
                counter in the lab above keeps showing you. Note the exact
                claim: a single append is <b>not</b> O(1) in the worst case, it
                is O(n) when the resize happens. It is O(1)
                <b> amortized</b>: the expensive calls are rare enough that any
                sequence of n appends still costs O(n) in total. This holds for
                any growth factor greater than 1, not only for doubling.
              </p>
            }
            zh={
              <p>
                一次扩容确实是实打实的 O(n),凭什么说尾部追加是 O(1)?
                别看单次,看总账:容量从 1 按倍增涨到 n,所有扩容的总拷贝量是
                1 + 2 + 4 + … + n/2,小于 n。也就是说,
                <strong>n 次追加总共最多做约 2n 单位的工作</strong>,
                平均每次 2 个单位,是常数。这种记账方式叫
                <strong>均摊分析(amortized analysis)</strong>,
                上面实验室里的「均摊操作数」一直在替你验证它。这里的说法要准确:
                单次追加在最坏情况下<b>不是</b> O(1),扩容那一次就是 O(n);
                它是<b>均摊 O(1)</b> —— 昂贵的那几次足够稀少,任意 n
                次追加的总代价仍是 O(n)。只要扩容倍数大于 1 就成立,不必非得翻倍。
              </p>
            }
          />
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Language" zh="语言" />
                </th>
                <th>
                  <T en="Dynamic array" zh="动态数组" />
                </th>
                <th>
                  <T
                    en="Growth in the main implementation"
                    zh="扩容策略(主流实现)"
                  />
                </th>
                <th>
                  <T en="Worth knowing" zh="值得知道的细节" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Java</b></td>
                <td><code>ArrayList</code></td>
                <td>
                  <T
                    en={
                      <>
                        about ×1.5 (<code>old + (old &gt;&gt; 1)</code>)
                      </>
                    }
                    zh={
                      <>
                        约 ×1.5(<code>old + (old &gt;&gt; 1)</code>)
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        The storage is an <code>Object[]</code>. If you know the
                        size in advance, <code>new ArrayList&lt;&gt;(n)</code>{" "}
                        avoids the copies.
                      </>
                    }
                    zh={
                      <>
                        底层是 <code>Object[]</code>;能预估容量就用{" "}
                        <code>new ArrayList&lt;&gt;(n)</code> 省掉搬家
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td><b>Python</b></td>
                <td><code>list</code></td>
                <td>
                  <T
                    en="about ×1.125 plus a small constant (smaller steps, different from Java)"
                    zh="约 ×1.125 + 一个小常数(步子比 Java 小)"
                  />
                </td>
                <td>
                  <T
                    en="A list stores pointers to objects, not raw numbers. That is one reason NumPy is much faster for numeric work."
                    zh="存的是对象指针而不是裸数值,这也是数值计算里 NumPy 快得多的原因之一"
                  />
                </td>
              </tr>
              <tr>
                <td><b>JavaScript</b></td>
                <td><code>Array</code></td>
                <td>
                  <T
                    en="V8 uses about ×1.5 plus 16"
                    zh="V8 约 ×1.5 + 16"
                  />
                </td>
                <td>
                  <T
                    en="V8 uses a packed, contiguous backing store only while the array stays dense. A sparse array falls back to a dictionary."
                    zh="只有数组保持稠密时,V8 才用连续的 packed 存储;变稀疏就退回字典表示"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "The growth factors are not the same",
            zh: "扩容倍数并不统一",
          }}
        >
          <T
            en={
              <p>
                It is common to hear &ldquo;dynamic arrays double&rdquo;. That
                is a simplification. Java <code>ArrayList</code> grows by about
                1.5. CPython over-allocates by roughly one eighth of the new
                size plus a small constant, so its factor is much smaller and
                changes with the size. What they share is that the growth is{" "}
                <b>proportional to the current size</b>, and that is the only
                property the amortized O(1) argument needs.
              </p>
            }
            zh={
              <p>
                常听到「动态数组都是翻倍扩容」,这是简化说法。Java 的{" "}
                <code>ArrayList</code> 大约按 1.5 倍增长;CPython 是按新长度的约
                1/8 再加一个小常数来超额分配,倍数小得多,而且随规模变化。
                它们真正的共同点是:增长量<b>与当前规模成比例</b> ——
                均摊 O(1) 的论证只需要这一条性质。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §05 手写动态数组 ================= */}
      <Section
        id="build"
        index="05"
        title={{ en: "Build a dynamic array yourself", zh: "手写一个动态数组" }}
        desc={{
          en: "Under 50 lines, with the same skeleton the standard libraries use.",
          zh: "不到 50 行,和真实标准库的骨架一致 —— 造过的东西才真正属于你",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  You now know the three parts of a dynamic array:{" "}
                  <strong>a fixed-size array</strong>,{" "}
                  <strong>a size counter</strong>, and{" "}
                  <strong>a resize step that runs when it is full</strong>. Put
                  them together. The implementation below is small but complete:
                  read, write, append, and insert or delete at any position.
                </p>
                <p>
                  A good way to use it: cover the code, write <code>push</code>{" "}
                  and <code>insert</code> yourself, then compare. Pay attention
                  to <strong>why insert copies from the back to the front</strong>
                  . Copying front to back would overwrite a value before it has
                  been moved, which the lab in §03 showed step by step.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  读到这里,动态数组的三块零件你都认识了:<strong>一个定长数组</strong>、
                  <strong>一个记录已用多少的 size</strong>、
                  <strong>一段满了就扩容的逻辑</strong>。现在把它们拼起来。
                  下面的实现虽小但完整:支持读写、尾部追加、任意位置插入删除。
                </p>
                <p>
                  建议做法:先盖住代码,自己写一遍 <code>push</code> 和{" "}
                  <code>insert</code>,再对照 —— 特别注意插入时
                  <strong>为什么要从后往前搬</strong>:从前往后会在搬动之前就把值覆盖掉,
                  §03 的实验室已经逐步演示过。
                </p>
              </>
            }
          />
        </div>
        <CodeTabs
          title="dyn_array"
          java={{
            code: {
              en: `// A minimal dynamic array in Java (the skeleton of ArrayList)
public class DynArray {
    private int[] data = new int[2];  // the fixed-size storage, capacity 2
    private int size = 0;             // how many slots are in use

    public int get(int i) {           // O(1): the same address formula
        if (i < 0 || i >= size) throw new IndexOutOfBoundsException();
        return data[i];
    }

    public void push(int x) {         // O(1) amortized
        if (size == data.length) grow();
        data[size++] = x;
    }

    public void insert(int i, int x) { // O(n)
        if (size == data.length) grow();
        for (int j = size; j > i; j--) // copy back to front to free slot i
            data[j] = data[j - 1];
        data[i] = x;
        size++;
    }

    public int removeAt(int i) {       // O(n)
        int victim = data[i];
        for (int j = i; j < size - 1; j++) // copy front to back to close the gap
            data[j] = data[j + 1];
        size--;
        return victim;
    }

    private void grow() {              // resize: move into a block twice as large
        int[] bigger = new int[data.length * 2];
        for (int j = 0; j < size; j++) bigger[j] = data[j];
        data = bigger;
    }
}`,
              zh: `// 极简动态数组:Java 版(真实 ArrayList 的骨架)
public class DynArray {
    private int[] data = new int[2];  // 内部定长数组,初始容量 2
    private int size = 0;             // 实际用了几个格子

    public int get(int i) {           // O(1):还是那条地址公式
        if (i < 0 || i >= size) throw new IndexOutOfBoundsException();
        return data[i];
    }

    public void push(int x) {         // 均摊 O(1)
        if (size == data.length) grow();
        data[size++] = x;
    }

    public void insert(int i, int x) { // O(n)
        if (size == data.length) grow();
        for (int j = size; j > i; j--) // 从后往前搬,腾出下标 i
            data[j] = data[j - 1];
        data[i] = x;
        size++;
    }

    public int removeAt(int i) {       // O(n)
        int victim = data[i];
        for (int j = i; j < size - 1; j++) // 从前往后补位,填上空缺
            data[j] = data[j + 1];
        size--;
        return victim;
    }

    private void grow() {              // 扩容:搬进 2 倍大的新数组
        int[] bigger = new int[data.length * 2];
        for (int j = 0; j < size; j++) bigger[j] = data[j];
        data = bigger;
    }
}`,
            },
            note: {
              en: (
                <>
                  How the real <code>ArrayList</code> differs: it grows by about
                  1.5, it copies with <code>System.arraycopy</code>, which is
                  faster than a Java loop, and it stores an{" "}
                  <code>Object[]</code>. The skeleton is the same.
                </>
              ),
              zh: (
                <>
                  真实 <code>ArrayList</code> 的差异:按约 1.5 倍扩容、用{" "}
                  <code>System.arraycopy</code>(比 Java 层的 for 循环快)、
                  存的是 <code>Object[]</code>。骨架完全一样。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `# A minimal dynamic array in Python (the skeleton of CPython's list)
class DynArray:
    def __init__(self):
        self._data = [None] * 2   # the fixed-size storage, capacity 2
        self._size = 0            # how many slots are in use

    def get(self, i):             # O(1)
        if not 0 <= i < self._size:
            raise IndexError(i)
        return self._data[i]

    def push(self, x):            # O(1) amortized
        if self._size == len(self._data):
            self._grow()
        self._data[self._size] = x
        self._size += 1

    def insert(self, i, x):       # O(n)
        if self._size == len(self._data):
            self._grow()
        for j in range(self._size, i, -1):  # copy back to front
            self._data[j] = self._data[j - 1]
        self._data[i] = x
        self._size += 1

    def remove_at(self, i):       # O(n)
        victim = self._data[i]
        for j in range(i, self._size - 1):  # copy front to back
            self._data[j] = self._data[j + 1]
        self._size -= 1
        return victim

    def _grow(self):              # resize: twice the capacity
        bigger = [None] * (len(self._data) * 2)
        for j in range(self._size):
            bigger[j] = self._data[j]
        self._data = bigger`,
              zh: `# 极简动态数组:Python 版(CPython list 的骨架)
class DynArray:
    def __init__(self):
        self._data = [None] * 2   # 内部定长存储,初始容量 2
        self._size = 0            # 实际用了几个格子

    def get(self, i):             # O(1)
        if not 0 <= i < self._size:
            raise IndexError(i)
        return self._data[i]

    def push(self, x):            # 均摊 O(1)
        if self._size == len(self._data):
            self._grow()
        self._data[self._size] = x
        self._size += 1

    def insert(self, i, x):       # O(n)
        if self._size == len(self._data):
            self._grow()
        for j in range(self._size, i, -1):  # 从后往前搬
            self._data[j] = self._data[j - 1]
        self._data[i] = x
        self._size += 1

    def remove_at(self, i):       # O(n)
        victim = self._data[i]
        for j in range(i, self._size - 1):  # 从前往后补位
            self._data[j] = self._data[j + 1]
        self._size -= 1
        return victim

    def _grow(self):              # 扩容:容量翻倍
        bigger = [None] * (len(self._data) * 2)
        for j in range(self._size):
            bigger[j] = self._data[j]
        self._data = bigger`,
            },
            note: {
              en: (
                <>
                  How the real CPython list differs: it over-allocates by about
                  one eighth plus a small constant, and its storage is a C array
                  of pointers to objects. The logic is the same.
                </>
              ),
              zh: (
                <>
                  真实 CPython list 的差异:每次超额分配约 1/8 再加一个小常数,
                  底层是一个存对象指针的 C 数组。逻辑完全一致。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// A minimal dynamic array in JS, written with a fixed-size mindset on purpose
class DynArray {
  #data = new Array(2);   // the fixed-size storage, capacity 2
  #size = 0;              // how many slots are in use

  get(i) {                // O(1)
    if (i < 0 || i >= this.#size) throw new RangeError(i);
    return this.#data[i];
  }

  push(x) {               // O(1) amortized
    if (this.#size === this.#data.length) this.#grow();
    this.#data[this.#size++] = x;
  }

  insert(i, x) {          // O(n)
    if (this.#size === this.#data.length) this.#grow();
    for (let j = this.#size; j > i; j--)  // copy back to front
      this.#data[j] = this.#data[j - 1];
    this.#data[i] = x;
    this.#size++;
  }

  removeAt(i) {           // O(n)
    const victim = this.#data[i];
    for (let j = i; j < this.#size - 1; j++)  // copy front to back
      this.#data[j] = this.#data[j + 1];
    this.#size--;
    return victim;
  }

  #grow() {               // resize: twice the capacity
    const bigger = new Array(this.#data.length * 2);
    for (let j = 0; j < this.#size; j++) bigger[j] = this.#data[j];
    this.#data = bigger;
  }
}`,
              zh: `// 极简动态数组:JS 版(刻意用「定长思维」写,看清引擎在做什么)
class DynArray {
  #data = new Array(2);   // 内部定长存储,初始容量 2
  #size = 0;              // 实际用了几个格子

  get(i) {                // O(1)
    if (i < 0 || i >= this.#size) throw new RangeError(i);
    return this.#data[i];
  }

  push(x) {               // 均摊 O(1)
    if (this.#size === this.#data.length) this.#grow();
    this.#data[this.#size++] = x;
  }

  insert(i, x) {          // O(n)
    if (this.#size === this.#data.length) this.#grow();
    for (let j = this.#size; j > i; j--)  // 从后往前搬
      this.#data[j] = this.#data[j - 1];
    this.#data[i] = x;
    this.#size++;
  }

  removeAt(i) {           // O(n)
    const victim = this.#data[i];
    for (let j = i; j < this.#size - 1; j++)  // 从前往后补位
      this.#data[j] = this.#data[j + 1];
    this.#size--;
    return victim;
  }

  #grow() {               // 扩容:容量翻倍
    const bigger = new Array(this.#data.length * 2);
    for (let j = 0; j < this.#size; j++) bigger[j] = this.#data[j];
    this.#data = bigger;
  }
}`,
            },
            note: {
              en: (
                <>
                  A JavaScript <code>Array</code> already grows on its own. The
                  fixed-size style here is deliberate, so you can see the work
                  the engine does for you. V8 grows its backing store by about
                  1.5 times plus 16.
                </>
              ),
              zh: (
                <>
                  JavaScript 的 <code>Array</code> 本身就会自动增长,
                  这里刻意用「定长思维」来写,是为了看清引擎替你做了什么。
                  V8 的底层存储大约按 1.5 倍 + 16 增长。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{ en: "Check that you understood it", zh: "检验你真的懂了" }}
        >
          <T
            en={
              <p>
                Close the code and answer three questions. First, why does{" "}
                <code>insert</code> copy from the back to the front? Second, why
                does <code>removeAt</code> copy from the front to the back?
                Third, if the resize added only one slot each time, what would n
                appends cost in total? The answer to the third is 1 + 2 + … + n
                = O(n²), which is why the capacity has to grow by a{" "}
                <b>factor</b>, not by a fixed amount.
              </p>
            }
            zh={
              <p>
                合上代码回答三个问题:① <code>insert</code> 为什么从后往前搬?
                ② <code>removeAt</code> 为什么从前往后补?
                ③ 如果扩容改成「每次只 +1 个格子」,连续 n 次追加的总代价是多少?
                第三问的答案是 1 + 2 + … + n = O(n²) —— 这正是容量必须按
                <b>倍数</b>增长、而不是按固定量增长的原因。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §06 二维数组与矩阵 ================= */}
      <Section
        id="matrix"
        index="06"
        title={{
          en: "Two-dimensional arrays: the same formula, one dimension up",
          zh: "二维数组与矩阵:升维不换公式",
        }}
        desc={{
          en: "A chessboard, an image, a spreadsheet. Memory has no rows and columns, only a line you read as a grid.",
          zh: "棋盘、图片、Excel 表 —— 内存里没有「二维」,只有被读成二维的一维",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  A matrix is an array of arrays: <code>matrix[i][j]</code> is
                  row i, column j. Memory has no rows or columns, so a matrix
                  has to be laid out in one line. The usual layout is{" "}
                  <strong>one row after another</strong>, called row-major
                  order, and the position formula gains one dimension:{" "}
                  <code>flat index = row × number of columns + column</code>.
                  Click a cell to check it:
                </p>
              </>
            }
            zh={
              <>
                <p>
                  矩阵就是数组的数组:<code>matrix[i][j]</code> 表示第 i 行第 j 列。
                  内存里没有行列,矩阵必须铺成一条线。常见的铺法是
                  <strong>一行接一行</strong>,叫行优先(row-major),
                  定位公式因此只是升了一个维度:
                  <code>一维下标 = 行号 × 列数 + 列号</code>。点下面的格子验证:
                </p>
              </>
            }
          />
        </div>
        <MatrixLab />
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-title">
              <T
                en="One contiguous block, or an array of rows?"
                zh="是一整块,还是一排行引用?"
              />
            </div>
            <T
              en={
                <p>
                  In C, and in a NumPy array, a 2D array is{" "}
                  <b>one contiguous block</b>, and the formula above is exactly
                  how the compiler addresses it. In Java,{" "}
                  <code>int[][]</code> is an <b>array of references to row
                  arrays</b>: each row is contiguous, but two rows need not sit
                  next to each other, and rows can even have different lengths.
                  Python lists of lists and JavaScript arrays of arrays work the
                  same way. The formula still describes the layout you get when
                  you flatten a matrix into one array yourself, which many
                  problems ask you to do.
                </p>
              }
              zh={
                <p>
                  在 C 语言和 NumPy 里,二维数组是<b>一整块连续内存</b>,
                  上面那条公式就是编译器实际用的寻址方式。而 Java 的{" "}
                  <code>int[][]</code> 是<b>一个存放各行引用的数组</b>:
                  每一行内部连续,但两行之间不一定相邻,各行长度甚至可以不同。
                  Python 的嵌套 list、JavaScript 的嵌套 Array 也是同样的结构。
                  当你自己把矩阵压平成一维数组时(很多题目就是这么做的),
                  这条公式描述的正是那种布局。
                </p>
              }
            />
          </div>
          <div className="card">
            <div className="card-title">
              <T en="Traverse rows first" zh="遍历要顺着行走" />
            </div>
            <T
              en={
                <p>
                  Looping row by row (<code>for i → for j</code>) reads elements
                  that are next to each other in memory, so most reads hit the
                  cache. Looping column by column jumps a whole row each step
                  and can be several times slower on a large matrix. Both are
                  O(mn); the difference is a <b>cache effect</b>, not a
                  difference in complexity (see the cache line note in §02).
                </p>
              }
              zh={
                <p>
                  先行后列(<code>for i → for j</code>)读到的是内存里相邻的元素,
                  绝大多数读取都命中缓存;先列后行则每一步跳过一整行,
                  大矩阵下能慢好几倍。两者复杂度同为 O(mn),差别是<b>缓存效应</b>,
                  不是复杂度差异(回到 §02 的缓存行)。
                </p>
              }
            />
          </div>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "Three habits for matrix problems",
            zh: "矩阵题的三个习惯",
          }}
        >
          <T
            en={
              <p>
                First, use a <b>direction array</b>:{" "}
                <code>dirs = [[-1,0],[1,0],[0,-1],[0,1]]</code> handles up,
                down, left, and right in one loop instead of four{" "}
                <code>if</code> blocks. Second, <b>check the bounds first</b> (
                <code>0 ≤ i &lt; m</code> and <code>0 ≤ j &lt; n</code>) before
                reading a cell. Third, for O(1) extra space, use the first row
                and column of the matrix itself as marks (LC 73). A matrix is
                also a grid graph, and the graph chapter will traverse it as
                one.
              </p>
            }
            zh={
              <p>
                ① <b>方向数组</b>:上下左右用{" "}
                <code>dirs = [[-1,0],[1,0],[0,-1],[0,1]]</code>{" "}
                一个循环搞定,不用写四段 if;② <b>先做边界检查</b>(
                <code>0 ≤ i &lt; m</code> 且 <code>0 ≤ j &lt; n</code>)再读格子;
                ③ 想要 O(1) 额外空间,就用矩阵自身的第一行和第一列当标记(LC 73)。
                矩阵同时也是「网格图」,图那一章会把它当图来遍历。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §07 三语言对照 ================= */}
      <Section
        id="langs"
        index="07"
        title={{
          en: "Three languages, one abstraction",
          zh: "三语言对照:同一个抽象,三种住法",
        }}
        desc={{
          en: "The structure does not change with the language. The implementation and the API do. The top bar switches the code language for the whole site.",
          zh: "数据结构不因语言而变 —— 变的是实现与 API。顶栏可全站切换代码语言",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                The <strong>abstraction</strong> is the same in all three
                languages: elements in index order, O(1) access by index, O(n)
                insertion and deletion in the middle. The{" "}
                <strong>memory layout is not guaranteed to be the same</strong>.
                Java gives you two separate types, a fixed-size{" "}
                <code>int[]</code> and a dynamic <code>ArrayList</code>. Python
                gives you only the dynamic <code>list</code>, which stores
                pointers to objects. A JavaScript <code>Array</code> is an
                object whose keys happen to be index-like strings; V8 keeps it
                in a packed contiguous store while it stays dense, and switches
                to a dictionary when it does not.
              </p>
            }
            zh={
              <p>
                三种语言里<strong>抽象是一致的</strong>:元素按下标排列、
                按下标访问 O(1)、中间插删 O(n)。但
                <strong>内存布局并不保证相同</strong>。Java 给你两个类型:
                定长的 <code>int[]</code> 和动态的 <code>ArrayList</code>;
                Python 只有动态的 <code>list</code>,里面存的是对象指针;
                JavaScript 的 <code>Array</code> 本质是一个键为「类下标字符串」的对象,
                只要保持稠密,V8 就用连续的 packed 存储,一旦不稠密就换成字典表示。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="array_basics"
          java={{
            code: {
              en: `// Java: a fixed-size array and a dynamic array are two different types
int[] fixed = new int[5];          // fixed length, elements start at 0
fixed[0] = 7;                      // O(1) read and write by index
int n = fixed.length;              // length is a field, not a method

List<Integer> list = new ArrayList<>();  // dynamic array
list.add(7);                       // append at the end, O(1) amortized
list.add(0, 99);                   // insert at the front, O(n) shifting
int x = list.get(1);               // reading needs get()

// iteration
for (int v : fixed) System.out.println(v);`,
              zh: `// Java:定长数组和动态数组是两个不同的类型
int[] fixed = new int[5];          // 定长,元素默认 0
fixed[0] = 7;                      // O(1) 按下标读写
int n = fixed.length;              // 长度是字段,不是方法

List<Integer> list = new ArrayList<>();  // 动态数组
list.add(7);                       // 尾部追加,均摊 O(1)
list.add(0, 99);                   // 头部插入,O(n) 搬动
int x = list.get(1);               // 读元素要用 get()

// 遍历
for (int v : fixed) System.out.println(v);`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> generics cannot hold primitives, so
                  every element of an <code>ArrayList&lt;Integer&gt;</code> is a
                  boxed object. For numeric work that is slower and uses more
                  memory than <code>int[]</code>. Prefer <code>int[]</code> when
                  you can.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>泛型装不下原始类型,
                  <code>ArrayList&lt;Integer&gt;</code>{" "}
                  的每个元素都是装箱后的对象。数值密集的场景比{" "}
                  <code>int[]</code> 更慢也更费内存,能用 <code>int[]</code>{" "}
                  就用它。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `# Python: list is the dynamic array (there is no built-in fixed-size array)
arr = [7, 2, 9, 4, 1]
arr[0]          # O(1) read by index
arr[-1]         # negative index counts from the end, same as arr[len(arr)-1]
arr.append(8)   # append at the end, O(1) amortized
arr.insert(0, 99)  # insert at the front, O(n) shifting
arr.pop()       # remove the last element, O(1); arr.pop(0) is O(n)
sub = arr[1:4]  # a slice is a copy, O(k) time and O(k) space

for v in arr:   # iteration
    print(v)`,
              zh: `# Python:list 就是动态数组(没有内置的定长数组)
arr = [7, 2, 9, 4, 1]
arr[0]          # O(1) 按下标读
arr[-1]         # 负下标从尾部数,等价于 arr[len(arr)-1]
arr.append(8)   # 尾部追加,均摊 O(1)
arr.insert(0, 99)  # 头部插入,O(n) 搬动
arr.pop()       # 删最后一个,O(1);arr.pop(0) 是 O(n)
sub = arr[1:4]  # 切片是拷贝,时间和空间都是 O(k)

for v in arr:   # 遍历
    print(v)`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> a list stores <b>pointers to objects</b>
                  , not raw numbers, and slicing copies. For a fixed-size
                  numeric array use the <code>array</code> module or NumPy. Do
                  not build a 2D list with <code>[[0]*m]*n</code>: all n rows
                  would be the same inner list.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>list 存的是<b>对象指针</b>而不是裸数值,切片会复制。
                  真要定长数值数组请用 <code>array</code> 模块或 NumPy。
                  初始化二维数组不要写 <code>[[0]*m]*n</code> ——
                  这样 n 行会共享同一个内层 list。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// JavaScript: Array is an object that the engine optimizes into a real array
const arr = [7, 2, 9, 4, 1];
arr[0];             // O(1) read by index while the array stays dense
arr.length;         // length is writable: arr.length = 2 truncates the array
arr.push(8);        // append at the end, O(1) amortized
arr.pop();          // remove the last element, O(1)
arr.unshift(99);    // insert at the front, O(n) shifting
arr.shift();        // remove the first element, also O(n)
const sub = arr.slice(1, 4);  // a copy, the original is unchanged

for (const v of arr) console.log(v);  // iteration`,
              zh: `// JavaScript:Array 是一个被引擎优化成真数组的对象
const arr = [7, 2, 9, 4, 1];
arr[0];             // 数组保持稠密时,按下标读是 O(1)
arr.length;         // length 可写:arr.length = 2 会截断数组
arr.push(8);        // 尾部追加,均摊 O(1)
arr.pop();          // 删最后一个,O(1)
arr.unshift(99);    // 头部插入,O(n) 搬动
arr.shift();        // 删第一个,同样 O(n)
const sub = arr.slice(1, 4);  // 拷贝一段,不改原数组

for (const v of arr) console.log(v);  // 遍历`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> making an array sparse (
                  <code>arr[1000] = 1</code> on a short array) makes the engine
                  switch to a dictionary representation, and access gets much
                  slower. Also, <code>sort()</code> compares elements as{" "}
                  <b>strings</b> by default: <code>[10,9,1].sort()</code> gives{" "}
                  <code>[1,10,9]</code>. Pass a comparator.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>让数组变稀疏(在短数组上写{" "}
                  <code>arr[1000] = 1</code>)会让引擎切换成字典表示,访问明显变慢;
                  另外 <code>sort()</code> 默认把元素当<b>字符串</b>比较 ——{" "}
                  <code>[10,9,1].sort()</code> 得到 <code>[1,10,9]</code>,
                  记得传比较函数。
                </>
              ),
            },
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Operation" zh="操作" />
                </th>
                <th>
                  Java (<code>ArrayList</code>)
                </th>
                <th>
                  Python (<code>list</code>)
                </th>
                <th>
                  JavaScript (<code>Array</code>)
                </th>
                <th>
                  <T en="Complexity" zh="复杂度" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <T en="Create" zh="创建" />
                </td>
                <td><code>new ArrayList&lt;&gt;()</code></td>
                <td><code>[]</code></td>
                <td><code>[]</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>
                  <T en="Length" zh="长度" />
                </td>
                <td><code>list.size()</code></td>
                <td><code>len(arr)</code></td>
                <td><code>arr.length</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>
                  <T en="Read by index" zh="读下标" />
                </td>
                <td><code>list.get(i)</code></td>
                <td><code>arr[i]</code></td>
                <td><code>arr[i]</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>
                  <T en="Append at the end" zh="尾部追加" />
                </td>
                <td><code>list.add(x)</code></td>
                <td><code>arr.append(x)</code></td>
                <td><code>arr.push(x)</code></td>
                <td>
                  <BigO
                    o="1"
                    label={{ en: "O(1) amortized", zh: "均摊 O(1)" }}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Delete at the end" zh="尾部删除" />
                </td>
                <td><code>list.remove(size-1)</code></td>
                <td><code>arr.pop()</code></td>
                <td><code>arr.pop()</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>
                  <T en="Insert at the front" zh="头部插入" />
                </td>
                <td><code>list.add(0, x)</code></td>
                <td><code>arr.insert(0, x)</code></td>
                <td><code>arr.unshift(x)</code></td>
                <td><BigO o="n" /></td>
              </tr>
              <tr>
                <td>
                  <T en="Slice" zh="切片" />
                </td>
                <td><code>list.subList(a, b)</code>*</td>
                <td><code>arr[a:b]</code></td>
                <td><code>arr.slice(a, b)</code></td>
                <td><BigO o="n" label="O(k)" /></td>
              </tr>
              <tr>
                <td>
                  <T en="Sort" zh="排序" />
                </td>
                <td><code>Collections.sort(list)</code></td>
                <td><code>arr.sort()</code></td>
                <td><code>arr.sort((a,b)=&gt;a-b)</code></td>
                <td><BigO o="nlogn" /></td>
              </tr>
              <tr>
                <td>
                  <T en="Contains" zh="是否包含" />
                </td>
                <td><code>list.contains(x)</code></td>
                <td><code>x in arr</code></td>
                <td><code>arr.includes(x)</code></td>
                <td><BigO o="n" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="viz-msg">
          <T
            en={
              <>
                * Java <code>subList</code> returns a view, not a copy. Changing
                the view changes the original list. This is the one place where
                the three slice operations differ in meaning.
              </>
            }
            zh={
              <>
                * Java 的 <code>subList</code> 返回的是视图(view)而不是拷贝 ——
                改视图会改到原 list,这是三种语言的切片语义里最特殊的一个。
              </>
            }
          />
        </p>
      </Section>

      {/* ================= §08 双指针与滑窗 ================= */}
      <Section
        id="patterns"
        index="08"
        title={{
          en: "Two array techniques: two pointers and the sliding window",
          zh: "数组的两大招式:双指针与滑动窗口",
        }}
        desc={{
          en: "A large share of array problems. Three worked examples, step by step.",
          zh: "LeetCode 数组题的半壁江山 —— 三道代表题,逐帧拆解",
        }}
        badge={
          <span className="chip" data-tone="warn">
            <T en="★ Interview core" zh="★ 面试核心" />
          </span>
        }
      >
        <div className="prose">
          <T
            en={
              <p>
                The brute-force solution to an array problem is usually two
                nested loops, O(n²), checking every pair of indices. The{" "}
                <strong>two pointers</strong> family instead moves two indices{" "}
                <strong>each in one direction only</strong>. At every step a
                property of the problem rules out a whole group of candidates,
                which turns O(n²) into O(n). There are three forms:
              </p>
            }
            zh={
              <p>
                数组题的暴力解通常是两层循环 O(n²):枚举所有下标对。而
                <strong>双指针</strong>家族的做法,是让两个下标
                <strong>各自只朝一个方向走</strong>,
                每一步都用问题本身的性质排除掉一批候选,把 O(n²) 压成 O(n)。
                常见的有三种形式:
              </p>
            }
          />
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="FORM 01" zh="做法一" />
            </div>
            <div className="card-title">
              <T en="Fast and slow, same direction" zh="同向快慢指针" />
            </div>
            <T
              en={
                <p>
                  fast reads, slow writes, and everything left of slow is
                  already arranged. This is the standard shape for in-place
                  removal and compaction. See LC 283, 26, and 27.
                </p>
              }
              zh={
                <p>
                  fast 负责读,slow 负责写,slow 左侧始终是已整理好的区域。
                  原地删除和压缩类题目的标准写法,见 LC 283、26、27。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="FORM 02" zh="做法二" />
            </div>
            <div className="card-title">
              <T en="Pointers moving toward each other" zh="对撞指针" />
            </div>
            <T
              en={
                <p>
                  Start at both ends and move inward. Sorted order, or the fact
                  that the shorter side limits the result, lets you discard one
                  end at every step. See LC 11, 167, 15, and 42.
                </p>
              }
              zh={
                <p>
                  从两端向中间靠拢。利用有序性,或者「较矮的一端限制了结果」这一点,
                  每一步都能安全丢掉一端,见 LC 11、167、15、42。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="FORM 03" zh="做法三" />
            </div>
            <div className="card-title">
              <T en="Sliding window" zh="滑动窗口" />
            </div>
            <T
              en={
                <p>
                  For contiguous subarrays: the right end adds, the left end
                  removes, and the window keeps a quantity that can be updated
                  step by step. See LC 209, 3, and 76.
                </p>
              }
              zh={
                <p>
                  连续子数组问题专用:右端加入、左端移出,窗口里维护一个可以逐步更新的量,
                  见 LC 209、3、76。
                </p>
              }
            />
          </div>
        </div>

        {/* —— 精讲 1 —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="WORKED A" zh="精讲 A" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 283 · Move Zeroes" zh="LC 283 · 移动零" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">EASY</span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>Problem:</b> move every 0 to the end of the array, keep the
                order of the non-zero values, and do it in place.{" "}
                <b>Brute force:</b> build a new array, copy the non-zero values,
                then pad with zeros. That is O(n) time but O(n) extra space,
                which the problem forbids. <b>Solution:</b> change the target.
                Do not move the zeros, move the non-zero values.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>把所有 0 移到数组末尾,非零元素保持相对顺序,必须原地操作。
                <b> 暴力:</b>新建一个数组,先抄非零元素再补零 ——
                时间 O(n) 但用了 O(n) 额外空间,不符合题目要求。
                <b> 正解:</b>换个目标:不搬 0,搬非零元素。
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 283 · Two pointers in the same direction, step by step",
            zh: "LC 283 · 同向双指针,逐帧慢放",
          }}
          frames={F283}
        />
        <CodeTabs
          title="lc283_move_zeroes"
          java={{
            code: {
              en: `class Solution {
    public void moveZeroes(int[] nums) {
        int slow = 0;                        // where the next non-zero value belongs
        for (int fast = 0; fast < nums.length; fast++) {
            if (nums[fast] != 0) {           // only non-zero values matter
                int t = nums[slow];          // swap with the slot at slow
                nums[slow] = nums[fast];
                nums[fast] = t;
                slow++;                      // the arranged region grows by one
            }
        }
    }
}`,
              zh: `class Solution {
    public void moveZeroes(int[] nums) {
        int slow = 0;                        // 下一个非零元素该放的位置
        for (int fast = 0; fast < nums.length; fast++) {
            if (nums[fast] != 0) {           // 只关心非零元素
                int t = nums[slow];          // 与 slow 位置交换
                nums[slow] = nums[fast];
                nums[fast] = t;
                slow++;                      // 已整理区右扩一格
            }
        }
    }
}`,
            },
            hl: [5, 6, 7, 8, 9],
          }}
          python={{
            code: {
              en: `class Solution:
    def moveZeroes(self, nums: list[int]) -> None:
        slow = 0                     # where the next non-zero value belongs
        for fast in range(len(nums)):
            if nums[fast] != 0:      # only non-zero values matter
                # Python swaps in one line, no temporary variable needed
                nums[slow], nums[fast] = nums[fast], nums[slow]
                slow += 1            # the arranged region grows by one`,
              zh: `class Solution:
    def moveZeroes(self, nums: list[int]) -> None:
        slow = 0                     # 下一个非零元素该放的位置
        for fast in range(len(nums)):
            if nums[fast] != 0:      # 只关心非零元素
                # Python 一行即可交换,不需要临时变量
                nums[slow], nums[fast] = nums[fast], nums[slow]
                slow += 1            # 已整理区右扩一格`,
            },
            hl: [5, 7, 8],
          }}
          js={{
            code: {
              en: `var moveZeroes = function (nums) {
  let slow = 0;                      // where the next non-zero value belongs
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {          // only non-zero values matter
      [nums[slow], nums[fast]] = [nums[fast], nums[slow]]; // swap by destructuring
      slow++;                        // the arranged region grows by one
    }
  }
};`,
              zh: `var moveZeroes = function (nums) {
  let slow = 0;                      // 下一个非零元素该放的位置
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {          // 只关心非零元素
      [nums[slow], nums[fast]] = [nums[fast], nums[slow]]; // 解构交换
      slow++;                        // 已整理区右扩一格
    }
  }
};`,
            },
            hl: [4, 5, 6],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-up questions",
            zh: "复杂度与追问",
          }}
        >
          <T
            en={
              <p>
                Time <b>O(n)</b>, because fast makes one pass. Space{" "}
                <b>O(1)</b>. Interviewers often follow up: what if the value to
                move is not 0 but a given value? That is LC 27. What if the
                order of the zeros also has to be preserved? This solution
                already does that. The answer they are looking for is the{" "}
                <b>loop invariant</b>: everything left of slow is non-zero and
                in its original relative order.
              </p>
            }
            zh={
              <p>
                时间 <b>O(n)</b>(fast 只走一遍),空间 <b>O(1)</b>。
                面试官常追问:「如果要移动的不是 0 而是某个给定值?」(那就是 LC 27)
                「如果要求 0 之间的相对顺序也不变?」(本解法天然满足)。
                他们真正想听的是<b>循环不变量</b>:slow 左边恒为非零元素,且保持原有相对顺序。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 2 —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="WORKED B" zh="精讲 B" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 11 · Container With Most Water"
              zh="LC 11 · 盛最多水的容器"
            />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>Problem:</b> given n vertical lines, pick two so that the
                container they form with the x-axis holds the most water. The
                area is the distance between the two lines times the shorter
                one. <b>Brute force:</b> try every pair, O(n²).{" "}
                <b>Solution:</b> start at the widest pair and move inward,{" "}
                <strong>always moving the shorter side</strong>. The width will
                shrink no matter what, so only replacing the shorter line can
                make the area larger.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>给 n 条竖线,选两条,与 x 轴围成一个容器,求最大盛水面积
                (面积 = 两线间距 × 较矮的那条)。<b>暴力:</b>枚举所有线对,O(n²)。
                <b> 正解:</b>从最宽的一对开始向中间靠拢,
                <strong>每一步都移动较矮的那一端</strong>:
                宽度反正只会变小,只有换掉较矮的线,面积才有机会变大。
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 11 · Pointers moving inward (the number in each cell is the line height)",
            zh: "LC 11 · 对撞指针(格子里的数字是柱高)",
          }}
          frames={F11}
          cellW={50}
        />
        <CodeTabs
          title="lc11_max_area"
          java={{
            code: {
              en: `class Solution {
    public int maxArea(int[] height) {
        int l = 0, r = height.length - 1, best = 0;
        while (l < r) {
            int area = Math.min(height[l], height[r]) * (r - l);
            best = Math.max(best, area);
            if (height[l] < height[r]) l++;   // always move the shorter side
            else r--;
        }
        return best;
    }
}`,
              zh: `class Solution {
    public int maxArea(int[] height) {
        int l = 0, r = height.length - 1, best = 0;
        while (l < r) {
            int area = Math.min(height[l], height[r]) * (r - l);
            best = Math.max(best, area);
            if (height[l] < height[r]) l++;   // 永远移动较矮的一端
            else r--;
        }
        return best;
    }
}`,
            },
            hl: [7, 8],
          }}
          python={{
            code: {
              en: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        l, r, best = 0, len(height) - 1, 0
        while l < r:
            area = min(height[l], height[r]) * (r - l)
            best = max(best, area)
            if height[l] < height[r]:
                l += 1               # always move the shorter side
            else:
                r -= 1
        return best`,
              zh: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        l, r, best = 0, len(height) - 1, 0
        while l < r:
            area = min(height[l], height[r]) * (r - l)
            best = max(best, area)
            if height[l] < height[r]:
                l += 1               # 永远移动较矮的一端
            else:
                r -= 1
        return best`,
            },
            hl: [7, 8, 9, 10],
          }}
          js={{
            code: {
              en: `var maxArea = function (height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    const area = Math.min(height[l], height[r]) * (r - l);
    best = Math.max(best, area);
    if (height[l] < height[r]) l++;   // always move the shorter side
    else r--;
  }
  return best;
};`,
              zh: `var maxArea = function (height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    const area = Math.min(height[l], height[r]) * (r - l);
    best = Math.max(best, area);
    if (height[l] < height[r]) l++;   // 永远移动较矮的一端
    else r--;
  }
  return best;
};`,
            },
            hl: [6, 7],
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "Why is it safe to move the shorter side?",
            zh: "为什么移动较矮的一端是安全的?",
          }}
        >
          <T
            en={
              <p>
                Say the left line is the shorter one. Consider every pair that
                keeps this left line: the other line has to be somewhere between
                the current two, so the width is smaller, and the height is
                still limited by the same short left line. Every one of those
                pairs has an area <b>no larger than the one just measured</b>,
                so they can all be discarded together. Each step therefore
                removes a whole group of candidates without losing the answer,
                and n steps are enough: O(n²) becomes O(n). This argument is the
                expected answer in an interview.
              </p>
            }
            zh={
              <p>
                设左边那条线较矮。考虑所有<b>仍然保留这条左线</b>的组合:
                另一条线只能落在当前两端之间,宽度更小,而高度仍被这条矮线限制。
                这些组合的面积<b>都不会超过刚刚算出的面积</b>,可以整批丢弃。
                所以每一步都在无损地排除一批候选,总共 n 步就能扫完:O(n²) 降为 O(n)。
                这段论证就是面试时期待你说出来的答案。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 3 —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="WORKED C" zh="精讲 C" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 209 · Minimum Size Subarray Sum"
              zh="LC 209 · 长度最小的子数组"
            />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>Problem:</b> in an array of positive integers, find the
                length of the <strong>shortest contiguous</strong> subarray
                whose sum is at least target. <b>Brute force:</b> try every
                start and end, O(n²). <b>Solution:</b> a sliding window. Because
                every element is positive, the window sum{" "}
                <strong>only increases</strong> when the right end moves right
                and <strong>only decreases</strong> when the left end moves
                right. That is the invariant that makes it correct: once the sum
                drops below target, moving the left end further can never bring
                it back, so the left end never has to move backwards.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>在正整数数组中,找出和 ≥ target 的
                <strong>最短连续</strong>子数组的长度。
                <b> 暴力:</b>枚举所有起点和终点,O(n²)。
                <b> 正解:</b>滑动窗口。因为元素全为正,窗口和在右端右移时
                <strong>只增不减</strong>、在左端右移时<strong>只减不增</strong>。
                这正是保证正确性的不变量:一旦和降到 target 以下,
                继续右移左端只会更小,所以左端永远不需要回头。
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 209 · Sliding window (target = 7)",
            zh: "LC 209 · 滑动窗口(target = 7)",
          }}
          frames={F209}
        />
        <CodeTabs
          title="lc209_min_subarray"
          java={{
            code: {
              en: `class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int l = 0, sum = 0, ans = Integer.MAX_VALUE;
        for (int r = 0; r < nums.length; r++) {
            sum += nums[r];                  // the right end adds an element
            while (sum >= target) {          // shrink while the condition holds
                ans = Math.min(ans, r - l + 1);
                sum -= nums[l++];            // the left end removes an element
            }
        }
        return ans == Integer.MAX_VALUE ? 0 : ans;
    }
}`,
              zh: `class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int l = 0, sum = 0, ans = Integer.MAX_VALUE;
        for (int r = 0; r < nums.length; r++) {
            sum += nums[r];                  // 右端加入一个元素
            while (sum >= target) {          // 满足条件就一直收缩
                ans = Math.min(ans, r - l + 1);
                sum -= nums[l++];            // 左端移出一个元素
            }
        }
        return ans == Integer.MAX_VALUE ? 0 : ans;
    }
}`,
            },
            hl: [5, 6, 7, 8],
          }}
          python={{
            code: {
              en: `class Solution:
    def minSubArrayLen(self, target: int, nums: list[int]) -> int:
        l, s, ans = 0, 0, float("inf")
        for r, v in enumerate(nums):
            s += v                     # the right end adds an element
            while s >= target:         # shrink while the condition holds
                ans = min(ans, r - l + 1)
                s -= nums[l]
                l += 1                 # the left end removes an element
        return 0 if ans == float("inf") else ans`,
              zh: `class Solution:
    def minSubArrayLen(self, target: int, nums: list[int]) -> int:
        l, s, ans = 0, 0, float("inf")
        for r, v in enumerate(nums):
            s += v                     # 右端加入一个元素
            while s >= target:         # 满足条件就一直收缩
                ans = min(ans, r - l + 1)
                s -= nums[l]
                l += 1                 # 左端移出一个元素
        return 0 if ans == float("inf") else ans`,
            },
            hl: [5, 6, 7, 8, 9],
          }}
          js={{
            code: {
              en: `var minSubArrayLen = function (target, nums) {
  let l = 0, sum = 0, ans = Infinity;
  for (let r = 0; r < nums.length; r++) {
    sum += nums[r];                    // the right end adds an element
    while (sum >= target) {            // shrink while the condition holds
      ans = Math.min(ans, r - l + 1);
      sum -= nums[l++];                // the left end removes an element
    }
  }
  return ans === Infinity ? 0 : ans;
};`,
              zh: `var minSubArrayLen = function (target, nums) {
  let l = 0, sum = 0, ans = Infinity;
  for (let r = 0; r < nums.length; r++) {
    sum += nums[r];                    // 右端加入一个元素
    while (sum >= target) {            // 满足条件就一直收缩
      ans = Math.min(ans, r - l + 1);
      sum -= nums[l++];                // 左端移出一个元素
    }
  }
  return ans === Infinity ? 0 : ans;
};`,
            },
            hl: [4, 5, 6, 7],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity, and the template for window problems",
            zh: "复杂度与窗口题的通用模板",
          }}
        >
          <T
            en={
              <p>
                There is a <code>while</code> inside a <code>for</code>, but l
                and r <b>only move forward</b>, at most n steps each, so the
                total is at most 2n and the time is O(n). Three questions
                describe any window problem. What quantity does the window keep
                (here the sum)? When does it grow (here every step)? When does
                it shrink (here while the sum is at least target)? Answer those
                three and LC 3, 76, and 438 all follow the same shape. One
                warning: this window works because the values are positive. With
                negative numbers allowed the sum is no longer monotonic, and you
                need prefix sums instead.
              </p>
            }
            zh={
              <p>
                虽然 <code>for</code> 里套了 <code>while</code>,但 l 和 r{" "}
                <b>都只前进不后退</b>,各自最多 n 步,总步数不超过 2n,时间是 O(n)。
                任何窗口题都可以用三个问题来描述:① 窗口里维护什么量(这里是 sum)?
                ② 什么时候扩(这里每一步都扩)?③ 什么时候缩(这里是 sum ≥ target)?
                想清这三问,LC 3、76、438 都是同一套写法。一个前提要记住:
                这个窗口成立是因为元素全为正;一旦允许负数,窗口和不再单调,
                就要改用前缀和的思路。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §09 题单 ================= */}
      <Section
        id="problems"
        index="09"
        title={{
          en: "Problem set: 17 array problems",
          zh: "高频题单:数组 17 题",
        }}
        desc={{
          en: "Grouped by technique, easy to hard. Your progress is stored in this browser. Think for 30 seconds before opening a hint.",
          zh: "按套路分组、由易到难。勾选进度存在本地,先想 30 秒再看提示",
        }}
        badge={
          <span className="chip">
            <T en="Hot 100 selection" zh="Hot 100 精选" />
          </span>
        }
      >
        <ProblemSet ch="array" items={PROBLEMS} />
      </Section>

      {/* ================= §10 Quiz ================= */}
      <Section
        id="quiz"
        index="10"
        title={{ en: "Chapter quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 9 correctly to mark this chapter complete.",
          zh: "9 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Chapter quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="array" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                Everything about an array follows from{" "}
                <b>address = base address + index × element size</b>. That
                formula gives you O(1) random access, and it charges you for
                keeping the elements contiguous.
              </>
            ),
            zh: (
              <>
                数组的一切都来自{" "}
                <b>地址 = 首地址 + 下标 × 元素大小</b>:这条公式给了你 O(1)
                随机访问,也向你收取了「必须保持连续」的代价。
              </>
            ),
          },
          {
            en: (
              <>
                <b>Do other elements have to move?</b> That single question
                decides the cost of every array operation. At the end, O(1). At
                the front or in the middle, O(n), because of the shift, not
                because of any search.
              </>
            ),
            zh: (
              <>
                <b>要不要搬动别的元素?</b>这一个问题就决定了数组每种操作的成本:
                尾部 O(1),头部和中间 O(n) —— 代价来自搬动,不是来自查找。
              </>
            ),
          },
          {
            en: (
              <>
                A dynamic array is a fixed-size array plus a resize when it is
                full. One resize is O(n); append is{" "}
                <b>O(1) amortized</b>, not O(1) worst case. Java{" "}
                <code>ArrayList</code> grows by about 1.5, CPython
                over-allocates by a smaller amount, and V8 uses about 1.5 plus
                16. Only the fact that growth is proportional matters for the
                amortized bound.
              </>
            ),
            zh: (
              <>
                动态数组 = 定长数组 + 满了扩容。单次扩容是 O(n),追加是
                <b>均摊 O(1)</b>,不是最坏情况 O(1)。Java 的{" "}
                <code>ArrayList</code> 约按 1.5 倍增长,CPython 的超额分配比例更小,
                V8 约为 1.5 倍 + 16 —— 均摊结论只依赖「增长量与规模成比例」这一点。
              </>
            ),
          },
          {
            en: (
              <>
                <b>Binary search</b> needs sorted data and O(1) random access
                together. With a closed interval the invariant is that the
                answer, if it exists, stays inside [left, right]; hence{" "}
                <code>left &lt;= right</code>, <code>mid ± 1</code>, and a
                midpoint written as <code>left + (right - left) / 2</code> in
                Java so it cannot overflow.
              </>
            ),
            zh: (
              <>
                <b>二分查找</b>同时需要有序和 O(1) 随机访问。
                闭区间写法的不变量是「答案若存在,必在 [left, right] 内」,
                由此得出 <code>left &lt;= right</code>、<code>mid ± 1</code>,
                以及 Java 里防溢出的中点写法{" "}
                <code>left + (right - left) / 2</code>。
              </>
            ),
          },
          {
            en: (
              <>
                Two dimensions are a way of reading one dimension:{" "}
                <b>flat index = row × number of columns + column</b> in
                row-major order. In C and NumPy the block really is contiguous;
                Java <code>int[][]</code> is an array of row references. Reading
                row by row is faster because of cache lines, not because the
                complexity differs.
              </>
            ),
            zh: (
              <>
                二维只是读法:行优先下{" "}
                <b>一维下标 = 行号 × 列数 + 列号</b>。
                C 和 NumPy 里确实是一整块连续内存,Java 的{" "}
                <code>int[][]</code> 则是一个存放各行引用的数组。
                按行遍历更快是缓存行带来的,不是复杂度的差别。
              </>
            ),
          },
          {
            en: (
              <>
                Three two-pointer forms: same direction for in-place
                compaction, inward for sorted data or a limiting shorter side,
                and the sliding window for contiguous subarrays. All three rest
                on the same idea:{" "}
                <b>
                  use a monotonic property to rule out candidates and turn O(n²)
                  into O(n)
                </b>
                . Always be able to state the invariant.
              </>
            ),
            zh: (
              <>
                双指针三种形式:同向用于原地压缩,对撞用于有序数组或「较矮端限制结果」,
                滑动窗口用于连续子数组。三者背后是同一个思想:
                <b>用单调性排除候选,把 O(n²) 压成 O(n)</b>,
                而且每种都要能说清它的不变量。
              </>
            ),
          },
          {
            en: (
              <>
                Practical notes: the CPU cache favours contiguous memory, and
                the convenient calls <code>shift()</code>,{" "}
                <code>insert(0, x)</code>, and <code>add(0, x)</code> are all
                O(n).
              </>
            ),
            zh: (
              <>
                工程上的两点:CPU 缓存偏爱连续内存;<code>shift()</code>、
                <code>insert(0, x)</code>、<code>add(0, x)</code>{" "}
                这类顺手的调用全都是 O(n)。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="array" />
    </main>
  );
}
