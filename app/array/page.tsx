"use client";

// 第 1 章 · 数组 —— 全书样板章。
// 十段式结构:直觉 → 内存 → 核心操作 → 动态数组 → 三语言对照 →
// 双指针/滑动窗口 + 三道精讲(逐帧动画 + 三语言题解)→ 题单 → 测验 → 要点。

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
      <>
        初始:slow 指向“下一个非零该放的位置”,fast 负责逐个检查。目标:非零前移,零自然沉底。
      </>
    ),
  },
  {
    cells: [{ v: 0, state: "bad" }, { v: 1 }, { v: 0 }, { v: 3 }, { v: 12 }],
    ptrs: [
      { i: 0, label: "slow" },
      { i: 0, label: "fast" },
    ],
    msg: (
      <>
        fast=0:nums[0] 是 <b>0</b> —— 不值得搬,fast 前进,slow 原地等待非零元素。
      </>
    ),
  },
  {
    cells: [{ v: 0, state: "lit" }, { v: 1, state: "lit" }, { v: 0 }, { v: 3 }, { v: 12 }],
    ptrs: [
      { i: 0, label: "slow" },
      { i: 1, label: "fast" },
    ],
    msg: (
      <>
        fast=1:发现非零 <b>1</b>!与 slow 位置交换 —— 1 搬到前面,0 换到后面。
      </>
    ),
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 0 }, { v: 0, state: "bad" }, { v: 3 }, { v: 12 }],
    ptrs: [
      { i: 1, label: "slow" },
      { i: 2, label: "fast" },
    ],
    msg: (
      <>
        交换完成,slow++ 移到 1。fast=2 又遇到 <b>0</b>,跳过。前缀 [1] 已是“纯非零区”。
      </>
    ),
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 0, state: "lit" }, { v: 0 }, { v: 3, state: "lit" }, { v: 12 }],
    ptrs: [
      { i: 1, label: "slow" },
      { i: 3, label: "fast" },
    ],
    msg: (
      <>
        fast=3:非零 <b>3</b>,与 slow=1 的 0 交换。
      </>
    ),
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 3, state: "ok" }, { v: 0, state: "lit" }, { v: 0 }, { v: 12, state: "lit" }],
    ptrs: [
      { i: 2, label: "slow" },
      { i: 4, label: "fast" },
    ],
    msg: (
      <>
        fast=4:非零 <b>12</b>,与 slow=2 的 0 交换。
      </>
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
      <>
        完成:[1, 3, 12, 0, 0]。一次遍历 <b>O(n)</b>、原地 <b>O(1)</b>,非零元素相对顺序不变。
        slow 左边永远是“已整理好的非零区”—— 这个<b>循环不变量</b>就是双指针的灵魂。
      </>
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
      <>
        L=0(高1)、R=8(高7):面积 = min(1,7) × 宽8 = <b>8</b>。短板是左边的 1
        —— 移动短板才可能变好,L++。
      </>
    ),
  },
  {
    cells: H11.map((v, i) => ({ v, state: i === 1 || i === 8 ? "lit" : undefined })),
    ptrs: [
      { i: 1, label: "L" },
      { i: 8, label: "R" },
    ],
    msg: (
      <>
        L=1(高8)、R=8(高7):面积 = min(8,7) × 7 = <b>49</b> ✨ 新纪录!
        这次短板在右边,R--。
      </>
    ),
  },
  {
    cells: H11.map((v, i) => ({ v, state: i === 1 || i === 7 ? "lit" : undefined })),
    ptrs: [
      { i: 1, label: "L" },
      { i: 7, label: "R" },
    ],
    msg: (
      <>
        L=1(8)、R=7(3):面积 = 3 × 6 = 18 &lt; 49。短板 3 在右,R--。
      </>
    ),
  },
  {
    cells: H11.map((v, i) => ({ v, state: i === 1 || i === 6 ? "lit" : undefined })),
    ptrs: [
      { i: 1, label: "L" },
      { i: 6, label: "R" },
    ],
    msg: (
      <>
        L=1(8)、R=6(8):面积 = 8 × 5 = 40。两端等高,动哪边都行,R--。
      </>
    ),
  },
  {
    cells: H11.map((v, i) => ({ v, state: i === 1 || i === 5 ? "lit" : undefined })),
    ptrs: [
      { i: 1, label: "L" },
      { i: 5, label: "R" },
    ],
    msg: (
      <>
        L=1(8)、R=5(4):面积 = 4 × 4 = 16。之后 R 一路左移,面积只会更小…
      </>
    ),
  },
  {
    cells: H11.map((v, i) => ({ v, state: i === 1 || i === 2 ? "lit" : i === 8 ? "ok" : undefined })),
    ptrs: [
      { i: 1, label: "L" },
      { i: 2, label: "R" },
    ],
    msg: (
      <>
        直到 L、R 相遇,答案锁定 <b>49</b>。为什么敢跳过那么多组合?因为每一步
        <b>被放弃的短板已经见过它可能的最大面积</b> —— 这就是 O(n²) 剪成 O(n) 的底气。
      </>
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
      <>
        target = 7。窗口 = 一段连续子数组;右端负责“吃进”,左端负责“吐出”。
      </>
    ),
  },
  {
    cells: win(0, 1),
    ptrs: [
      { i: 0, label: "l" },
      { i: 1, label: "r" },
    ],
    msg: <>r 右扩:sum = 2 + 3 = 5 &lt; 7,继续吃。</>,
  },
  {
    cells: win(0, 3),
    ptrs: [
      { i: 0, label: "l" },
      { i: 3, label: "r" },
    ],
    msg: (
      <>
        r 右扩到 3:sum = 2+3+1+2 = <b>8 ≥ 7</b>!记录长度 4,开始收缩左端。
      </>
    ),
  },
  {
    cells: win(1, 3),
    ptrs: [
      { i: 1, label: "l" },
      { i: 3, label: "r" },
    ],
    msg: (
      <>
        l 右移吐出 2:sum = 6 &lt; 7,收缩停止 —— 窗口重新去吃。
      </>
    ),
  },
  {
    cells: win(1, 4),
    ptrs: [
      { i: 1, label: "l" },
      { i: 4, label: "r" },
    ],
    msg: (
      <>
        r=4:sum = 3+1+2+4 = <b>10 ≥ 7</b>,记录长度 4(不更优),继续收缩。
      </>
    ),
  },
  {
    cells: win(2, 4),
    ptrs: [
      { i: 2, label: "l" },
      { i: 4, label: "r" },
    ],
    msg: (
      <>
        吐出 3:sum = 7,仍 ≥ 7!长度 3 —— <b>新纪录</b>。再收缩:sum = 6,停。
      </>
    ),
  },
  {
    cells: win(4, 5, { ok: true }),
    ptrs: [
      { i: 4, label: "l" },
      { i: 5, label: "r" },
    ],
    msg: (
      <>
        r=5 后再收缩两次:窗口 [4,3] 和为 7,长度 <b>2</b> —— 最终答案。
        l、r 各自最多走 n 步,总步数 ≤ 2n,所以是 <b>O(n)</b> 而不是 O(n²)。
      </>
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: "直觉" },
  { id: "memory", n: "02", label: "内存里的样子" },
  { id: "ops", n: "03", label: "核心操作与二分" },
  { id: "dynamic", n: "04", label: "动态数组" },
  { id: "build", n: "05", label: "手写实现" },
  { id: "matrix", n: "06", label: "二维数组" },
  { id: "langs", n: "07", label: "三语言对照" },
  { id: "patterns", n: "08", label: "双指针与滑窗" },
  { id: "problems", n: "09", label: "高频题单" },
  { id: "quiz", n: "10", label: "通关测验" },
];

export default function ArrayChapter() {
  return (
    <main className="page" data-ch="array">
      <Hero
        ch="array"
        title={
          <>
            数组 <span className="grad">Array</span>
          </>
        }
        essence={
          <>
            一排<strong>连续</strong>的房间,门牌号就是下标。它用「中间插删要全体搬家」的代价,
            换来了整个数据结构世界里最快的一件事:<strong>O(1) 随机访问</strong>。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 直觉 ================= */}
      <Section
        id="intuition"
        index="01"
        title="直觉:一排编了号的储物柜"
        desc="先建立画面感,再谈复杂度"
      >
        <div className="prose">
          <p>
            想象健身房门口那排储物柜:柜子<strong>一个挨一个</strong>、大小一致、
            从 0 开始编号。你拿着 5 号钥匙,不需要从 0 号一路看过去 ——
            直接走到 5 号柜前开门。这就是数组唯一的、也是最强的超能力:
            <strong>给我下标,我立刻给你元素</strong>。
          </p>
          <p>
            但这排柜子也立了三条规矩,数组所有的“脾气”都从这三条规矩里长出来:
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">RULE 01</div>
            <div className="card-title">📏 连续</div>
            <p>
              所有元素在内存里一个挨一个,中间不许有空隙。好处:位置可以用公式算;
              代价:中间插入/删除必须搬家。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 02</div>
            <div className="card-title">🧩 同型</div>
            <p>
              每个元素占用的字节数相同(比如都是 4 字节的 int)。“下标 × 元素大小”
              这一步乘法,靠的就是它。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 03</div>
            <div className="card-title">🔒 定长(经典形态)</div>
            <p>
              建好后长度不可变 —— 隔壁的地盘不一定是空的。想“变长”,只能整体搬去更大的新家:
              这就是 §04 的动态数组。
            </p>
          </div>
        </div>
        <Callout tone="story" title="它无处不在">
          <p>
            你的照片(像素数组)、这个网页的字符串、CPU 的缓存行、数据库的一页记录……
            数组是最贴近硬件的结构,也是后面哈希表、堆、动态数组的<b>地基</b>。
            把这一章吃透,后面三章会轻松一半。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 内存 ================= */}
      <Section
        id="memory"
        index="02"
        title="内存里的样子:一条公式打天下"
        desc="地址 = 首地址 + 下标 × 元素大小 —— 点下面的格子验证它"
      >
        <div className="prose">
          <p>
            序章说过,内存是一条编了门牌号的长街。数组向操作系统申请的是
            <strong>一段连续的门牌号</strong>。假设 int 数组从地址 1000 开始、
            每个 int 占 4 字节,那么第 i 个元素住在哪,不用找 —— 用算的:
          </p>
        </div>
        <IndexLab />
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-title">为什么下标从 0 开始?</div>
            <p>
              因为下标本质是<b>偏移量</b>:第一个元素距离首地址 0 个单位。
              <code>arr[0]</code> 读作“从起点偏移 0 步”,一切自然成立 ——
              不是计算机科学家的怪癖,是公式的必然。
            </p>
          </div>
          <div className="card">
            <div className="card-title">越界为什么危险?</div>
            <p>
              公式不长眼睛:<code>arr[100]</code> 会老老实实算出一个地址,
              哪怕那里住着别人的数据。C 语言里这是经典的缓冲区溢出;Java/Python/JS
              会帮你检查并抛出异常/返回 <code>undefined</code>,但检查本身也有开销。
            </p>
          </div>
        </div>
        <Callout tone="deep" title="工程视角:CPU 缓存为什么偏爱数组">
          <p>
            CPU 从内存取数据时,一次搬一整块(缓存行,通常 64 字节)。
            数组的元素紧挨着,读 <code>arr[0]</code> 时 <code>arr[1..15]</code>{" "}
            顺便就进了缓存 —— 顺序遍历几乎全程命中缓存。这就是为什么实际工程里,
            数组遍历常常比理论复杂度相同的链表快<b>一个数量级</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 核心操作 ================= */}
      <Section
        id="ops"
        index="03"
        title="核心操作与二分查找"
        desc="所有成本都来自一个问题 —— 要不要搬动别的元素?"
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
                <td><b>按下标读 / 写</b> <code>arr[i]</code></td>
                <td><BigO o="1" /></td>
                <td>地址一条公式算出,不碰任何其他元素</td>
              </tr>
              <tr>
                <td><b>尾部追加</b>(有空位)</td>
                <td><BigO o="1" /></td>
                <td>直接写进下一个空格,无人需要挪动</td>
              </tr>
              <tr>
                <td><b>头部 / 中间插入</b></td>
                <td><BigO o="n" /></td>
                <td>插入点右侧所有元素整体右移一格腾位置</td>
              </tr>
              <tr>
                <td><b>删除</b>(非尾部)</td>
                <td><BigO o="n" /></td>
                <td>右侧所有元素整体左移一格填坑 —— 删除是“补位”不是“抠掉”</td>
              </tr>
              <tr>
                <td><b>查找</b>(无序)</td>
                <td><BigO o="n" /></td>
                <td>没有任何线索,只能从头看到尾(线性扫描)</td>
              </tr>
              <tr>
                <td><b>查找</b>(有序,二分)</td>
                <td><BigO o="logn" /></td>
                <td>每比较一次砍掉一半 —— 有序 + O(1) 随机访问,二者缺一不可</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            表格里最重要的不是结论,是那列「为什么」。亲手做几次插入删除,
            数一数搬家次数,你就再也不会记错:
          </p>
        </div>
        <ShiftLab />
        <Callout tone="warn" title="面试高频陷阱">
          <p>
            “数组删除一个元素”≠“调用一下 <code>remove</code> 就是 O(1)”。
            <code>list.pop(0)</code>(Python)、<code>arr.shift()</code>(JS)、
            <code>list.remove(0)</code>(Java ArrayList)—— 全都是 O(n)。
            API 越顺手,越容易忘掉它背后在搬家。
          </p>
        </Callout>

        <div className="prose" style={{ marginTop: 28 }}>
          <p>
            表里那行 <strong>O(log n) 的有序查找</strong>值得单独写一遍代码 ——
            <strong>二分查找(binary search)</strong>是数组送给算法世界最重要的礼物:
            每比较一次就砍掉一半候选。想象猜数字游戏:1~100 之间,每次都猜中间值,
            对方只说“大了/小了”,最多 7 次必中(2⁷ = 128 &gt; 100)。
            一百万个元素?20 次。十亿个?30 次。这就是对数的力量。
          </p>
        </div>
        <CodeTabs
          title="binary_search"
          java={{
            code: `// 前提:nums 升序。返回 target 下标,不存在返回 -1
public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;   // 闭区间 [left, right]
    while (left <= right) {                  // 区间还有东西就继续
        int mid = left + (right - left) / 2; // 防 (l+r) 溢出的写法
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;   // 目标在右半
        else right = mid - 1;                          // 目标在左半
    }
    return -1;
}`,
            note: (
              <>
                <b>坑:</b>Java 的 int 会溢出 —— <code>(left + right) / 2</code>{" "}
                在两数都接近 21 亿时会变负数,标准写法是{" "}
                <code>left + (right - left) / 2</code>。
              </>
            ),
            hl: [5],
          }}
          python={{
            code: `# 前提:nums 升序。返回 target 下标,不存在返回 -1
def search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1        # 闭区间 [left, right]
    while left <= right:                  # 区间还有东西就继续
        mid = (left + right) // 2         # Python 大整数,不怕溢出
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1                # 目标在右半
        else:
            right = mid - 1               # 目标在左半
    return -1

# 标准库彩蛋:import bisect → bisect.bisect_left(nums, target)`,
            note: (
              <>
                <b>省心点:</b>Python 整数无上限,不存在溢出;标准库{" "}
                <code>bisect</code> 模块就是现成的二分。
              </>
            ),
            hl: [5],
          }}
          js={{
            code: `// 前提:nums 升序。返回 target 下标,不存在返回 -1
var search = function (nums, target) {
  let left = 0, right = nums.length - 1;  // 闭区间 [left, right]
  while (left <= right) {                 // 区间还有东西就继续
    const mid = (left + right) >> 1;      // 位运算取整(数组长度内安全)
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) left = mid + 1;  // 目标在右半
    else right = mid - 1;                         // 目标在左半
  }
  return -1;
};`,
            note: (
              <>
                <b>细节:</b><code>&gt;&gt; 1</code> 等价于除 2 取整;JS
                数组长度不会超过 2³² − 1,这里不用担心溢出。
              </>
            ),
            hl: [5],
          }}
        />
        <Callout tone="deep" title="二分的三个易错点(面试官最爱追问)">
          <p>
            ① 循环条件:闭区间写法用 <code>left &lt;= right</code>(区间剩一个元素也要查);
            ② 收缩:必须 <code>mid ± 1</code>,否则死循环;
            ③ 前提:<b>有序 + O(1) 随机访问</b>,链表上没法二分。
            对应练习:LC 704(模板题)、LC 35(找插入位置 —— 体会“找不到时 left 停在哪”)。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 动态数组 ================= */}
      <Section
        id="dynamic"
        index="04"
        title="动态数组:定长如何假装无限"
        desc="ArrayList / list / JS Array 的真身 —— 满了就搬进两倍大的新家"
      >
        <div className="prose">
          <p>
            经典数组定长,但我们天天在用“能一直 push 的数组”。秘密很朴素:
            <strong>内部维护一个定长数组 + 记录已用多少</strong>。空间够就直接写(O(1));
            满了就申请一个<strong>更大的新数组(通常 ×2 或 ×1.5)</strong>,
            把旧元素全部拷贝过去,再继续。亲手触发一次扩容:
          </p>
        </div>
        <GrowLab />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            扩容那一下是实打实的 O(n),凭什么说 push 是 O(1)?看总账:从容量 1
            涨到 n,所有扩容的总拷贝量是 1 + 2 + 4 + … + n/2 &lt; n。也就是说,
            <strong>n 次 push 总共最多做约 2n 单位的工作</strong> ——
            平均每次 2 个单位,常数。这种“偶尔贵、平摊便宜”的记账方式叫
            <strong>均摊分析(amortized analysis)</strong>,上面实验室的
            “均摊操作数”一直在替你验证。
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>语言</th>
                <th>动态数组</th>
                <th>扩容策略(主流实现)</th>
                <th>值得知道的细节</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Java</b></td>
                <td><code>ArrayList</code></td>
                <td>×1.5(<code>old + (old &gt;&gt; 1)</code>)</td>
                <td>底层是 <code>Object[]</code>;能预估容量就用 <code>new ArrayList&lt;&gt;(n)</code> 省掉搬家</td>
              </tr>
              <tr>
                <td><b>Python</b></td>
                <td><code>list</code></td>
                <td>约 ×1.125 + 常数(小步快跑)</td>
                <td>存的是对象指针,数值计算密集时这也是 NumPy 快得多的原因之一</td>
              </tr>
              <tr>
                <td><b>JavaScript</b></td>
                <td><code>Array</code></td>
                <td>V8 约 ×1.5 + 16</td>
                <td>连续小整数下标时引擎按真数组存(packed);乱赋值会退化成字典模式</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ================= §05 手写动态数组 ================= */}
      <Section
        id="build"
        index="05"
        title="手写一个动态数组"
        desc="不到 50 行,亲手造出 ArrayList / list / Array 的极简版 —— 造过的东西才真正属于你"
      >
        <div className="prose">
          <p>
            读到这里,动态数组的三块零件你都认识了:<strong>一个定长数组</strong>、
            <strong>一个记录已用多少的 size</strong>、<strong>一套满了就搬家的扩容逻辑</strong>。
            现在把它们拼起来。下面的实现麻雀虽小五脏俱全:支持读写、尾部追加、
            任意位置插入删除,和真实标准库的骨架完全一致。
          </p>
          <p>
            建议做法:先盖住代码,自己写一遍 <code>push</code> 和{" "}
            <code>insert</code>,再对照 —— 特别注意插入时<strong>为什么要从后往前搬</strong>
            (从前往后会把还没搬的值覆盖掉,§03 的实验室你已经亲眼见过)。
          </p>
        </div>
        <CodeTabs
          title="dyn_array"
          java={{
            code: `// 极简动态数组:Java 版(真实 ArrayList 的骨架)
public class DynArray {
    private int[] data = new int[2];  // 内部定长数组,初始容量 2
    private int size = 0;             // 实际存了几个

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
        for (int j = size; j > i; j--) // 从后往前搬,腾出 i 位
            data[j] = data[j - 1];
        data[i] = x;
        size++;
    }

    public int removeAt(int i) {       // O(n)
        int victim = data[i];
        for (int j = i; j < size - 1; j++) // 从前往后补位
            data[j] = data[j + 1];
        size--;
        return victim;
    }

    private void grow() {              // 扩容:搬进 2 倍大的新家
        int[] bigger = new int[data.length * 2];
        for (int j = 0; j < size; j++) bigger[j] = data[j];
        data = bigger;
    }
}`,
            note: (
              <>
                真实 <code>ArrayList</code> 的差异:扩容 1.5 倍、用{" "}
                <code>System.arraycopy</code>(底层 memcpy,比 for 快)、存的是{" "}
                <code>Object[]</code>。骨架一模一样。
              </>
            ),
          }}
          python={{
            code: `# 极简动态数组:Python 版(CPython list 的骨架)
class DynArray:
    def __init__(self):
        self._data = [None] * 2   # 内部"定长"数组,初始容量 2
        self._size = 0            # 实际存了几个

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

    def _grow(self):              # 扩容 ×2
        bigger = [None] * (len(self._data) * 2)
        for j in range(self._size):
            bigger[j] = self._data[j]
        self._data = bigger`,
            note: (
              <>
                真实 CPython list 的差异:扩容约 1.125 倍 + 常数、底层是 C
                数组存对象指针。逻辑完全一致。
              </>
            ),
          }}
          js={{
            code: `// 极简动态数组:JS 版(用定长思维模拟,理解引擎在做什么)
class DynArray {
  #data = new Array(2);   // 内部"定长"数组,初始容量 2
  #size = 0;              // 实际存了几个

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

  #grow() {               // 扩容 ×2
    const bigger = new Array(this.#data.length * 2);
    for (let j = 0; j < this.#size; j++) bigger[j] = this.#data[j];
    this.#data = bigger;
  }
}`,
            note: (
              <>
                JS 的 <code>Array</code> 本身就是动态的,这里刻意用“定长思维”写,
                是为了看清 V8 引擎在幕后替你做的事(它的扩容约 1.5 倍 + 16)。
              </>
            ),
          }}
        />
        <Callout tone="win" title="检验你真的懂了">
          <p>
            合上代码回答三个问题:① <code>insert</code> 为什么从后往前搬?
            ② <code>removeAt</code> 为什么从前往后补?③ 如果扩容改成“每次 +1 容量”,
            push n 次的总代价会变成多少?(答案:1+2+…+n = O(n²) —— 这就是为什么必须按<b>倍数</b>扩!)
          </p>
        </Callout>
      </Section>

      {/* ================= §06 二维数组与矩阵 ================= */}
      <Section
        id="matrix"
        index="06"
        title="二维数组与矩阵:升维不换公式"
        desc="棋盘、图片、Excel 表 —— 内存里根本没有「二维」,只有摆成二维的一维"
      >
        <div className="prose">
          <p>
            矩阵(matrix)就是数组的数组:<code>matrix[i][j]</code> 表示第 i 行第 j
            列。但内存是一条长街,没有“行列”—— 主流语言把矩阵<strong>一行接一行</strong>
            铺平存储(行优先,row-major)。于是定位公式只是升了个维度:
            <code>下标 = 行号 × 列数 + 列号</code>。点下面的格子验证:
          </p>
        </div>
        <MatrixLab />
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-title">遍历要「顺着毛摸」</div>
            <p>
              先行后列(<code>for i → for j</code>)按内存顺序走,缓存全程命中;
              先列后行则每步跳一整行,大矩阵下能<b>慢好几倍</b> ——
              复杂度同为 O(mn),体感天差地别(§02 的缓存行知识又用上了)。
            </p>
          </div>
          <div className="card">
            <div className="card-title">三语言怎么建矩阵</div>
            <p>
              Java:<code>new int[m][n]</code>;Python:
              <code>[[0]*n for _ in range(m)]</code>(千万别写 <code>[[0]*n]*m</code>,
              m 行会共享同一个 list!);JS:
              <code>Array.from({"{length: m}"}, () =&gt; Array(n).fill(0))</code>。
            </p>
          </div>
        </div>
        <Callout tone="idea" title="矩阵题的三板斧">
          <p>
            ① <b>方向数组</b>:上下左右用 <code>dirs = [[-1,0],[1,0],[0,-1],[0,1]]</code>{" "}
            一个循环搞定,别写四份 if;② <b>边界检查</b>先行(<code>0 ≤ i &lt; m</code>);
            ③ 原地技巧:用矩阵自身的第一行/列做标记(LC 73)。
            矩阵同时也是「网格图」—— 图那一章会把它当图来遍历(岛屿类题)。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 三语言对照 ================= */}
      <Section
        id="langs"
        index="07"
        title="三语言对照:同一个抽象,三种住法"
        desc="数据结构不因语言而变 —— 变的只是实现与 API。顶栏可全站切换语言"
      >
        <div className="prose">
          <p>
            先说结论:<strong>数组这个抽象在三种语言里完全一致</strong> ——
            连续、下标访问 O(1)、中间插删 O(n)。不同的是“出厂配置”:Java
            把定长数组和动态数组分成两个类型给你;Python 只给动态数组;JavaScript
            的数组则是一个“演得很像数组的对象”,由引擎在幕后优化成真数组。
          </p>
        </div>
        <CodeTabs
          title="array_basics"
          java={{
            code: `// Java:定长数组 与 动态数组 是两个东西
int[] fixed = new int[5];          // 定长,元素默认 0
fixed[0] = 7;                      // O(1) 下标读写
int n = fixed.length;              // 长度是字段,不是方法

List<Integer> list = new ArrayList<>();  // 动态数组
list.add(7);                       // 尾部追加,均摊 O(1)
list.add(0, 99);                   // 头部插入,O(n) 搬家!
int x = list.get(1);               // 读元素要用 get()

// 遍历
for (int v : fixed) System.out.println(v);`,
            note: (
              <>
                <b>坑:</b>泛型装不下原始类型 —— <code>ArrayList&lt;Integer&gt;</code>{" "}
                每个元素都是对象(自动装箱),数值密集运算比 <code>int[]</code>{" "}
                慢且费内存。刷题时能用 <code>int[]</code> 就用它。
              </>
            ),
          }}
          python={{
            code: `# Python:list 就是动态数组(没有"原生定长数组")
arr = [7, 2, 9, 4, 1]
arr[0]          # O(1) 下标读
arr[-1]         # 负下标:从尾部数,等价 arr[len(arr)-1]
arr.append(8)   # 尾部追加,均摊 O(1)
arr.insert(0, 99)  # 头部插入,O(n) 搬家!
arr.pop()       # 尾删 O(1);  arr.pop(0) 是 O(n)
sub = arr[1:4]  # 切片是"拷贝",O(k) 时间和空间

for v in arr:   # 遍历
    print(v)`,
            note: (
              <>
                <b>坑:</b>list 存的是<b>对象指针</b>而非裸数值;切片会复制。
                真要定长数值数组用 <code>array</code> 模块或 NumPy。
                初始化二维数组别写 <code>[[0]*m]*n</code> —— n 行共享同一个内层 list!
              </>
            ),
          }}
          js={{
            code: `// JavaScript:Array 是"演得像数组的对象"
const arr = [7, 2, 9, 4, 1];
arr[0];             // O(1) 下标读(引擎优化为真数组)
arr.length;         // length 可写!arr.length = 2 会截断
arr.push(8);        // 尾部追加,均摊 O(1)
arr.pop();          // 尾删 O(1)
arr.unshift(99);    // 头部插入,O(n) 搬家!
arr.shift();        // 头删,同样 O(n)
const sub = arr.slice(1, 4);  // 切片拷贝,不改原数组

for (const v of arr) console.log(v);  // 遍历`,
            note: (
              <>
                <b>坑:</b>稀疏数组(<code>arr[1000] = 1</code>)会让引擎退化成字典模式,
                性能骤降;<code>sort()</code> 默认按<b>字符串</b>比较 ——{" "}
                <code>[10,9,1].sort()</code> 得到 <code>[1,10,9]</code>,记得传比较函数。
              </>
            ),
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>操作</th>
                <th>Java(ArrayList)</th>
                <th>Python(list)</th>
                <th>JavaScript(Array)</th>
                <th>复杂度</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>创建</td>
                <td><code>new ArrayList&lt;&gt;()</code></td>
                <td><code>[]</code></td>
                <td><code>[]</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>长度</td>
                <td><code>list.size()</code></td>
                <td><code>len(arr)</code></td>
                <td><code>arr.length</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>读下标</td>
                <td><code>list.get(i)</code></td>
                <td><code>arr[i]</code></td>
                <td><code>arr[i]</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>尾部追加</td>
                <td><code>list.add(x)</code></td>
                <td><code>arr.append(x)</code></td>
                <td><code>arr.push(x)</code></td>
                <td><BigO o="1" label="均摊 O(1)" /></td>
              </tr>
              <tr>
                <td>尾部删除</td>
                <td><code>list.remove(size-1)</code></td>
                <td><code>arr.pop()</code></td>
                <td><code>arr.pop()</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>头部插入</td>
                <td><code>list.add(0, x)</code></td>
                <td><code>arr.insert(0, x)</code></td>
                <td><code>arr.unshift(x)</code></td>
                <td><BigO o="n" /></td>
              </tr>
              <tr>
                <td>切片拷贝</td>
                <td><code>list.subList(a, b)</code>*</td>
                <td><code>arr[a:b]</code></td>
                <td><code>arr.slice(a, b)</code></td>
                <td><BigO o="n" label="O(k)" /></td>
              </tr>
              <tr>
                <td>排序</td>
                <td><code>Collections.sort(list)</code></td>
                <td><code>arr.sort()</code></td>
                <td><code>arr.sort((a,b)=&gt;a-b)</code></td>
                <td><BigO o="nlogn" /></td>
              </tr>
              <tr>
                <td>是否包含</td>
                <td><code>list.contains(x)</code></td>
                <td><code>x in arr</code></td>
                <td><code>arr.includes(x)</code></td>
                <td><BigO o="n" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="viz-msg">
          * Java 的 <code>subList</code> 返回的是视图(view)不是拷贝 —— 改它会改到原
          list,这是三语言切片语义里最特殊的一个。
        </p>
      </Section>

      {/* ================= §08 双指针与滑窗 ================= */}
      <Section
        id="patterns"
        index="08"
        title="数组的两大招式:双指针 & 滑动窗口"
        desc="LeetCode 数组题的半壁江山 —— 三道代表题,逐帧拆解"
        badge={<span className="chip" data-tone="warn">★ 面试核心</span>}
      >
        <div className="prose">
          <p>
            暴力解数组题,十有八九是两层循环 O(n²):枚举所有下标对。而
            <strong>双指针</strong>家族的本事,是让两个下标<strong>各自单调地走</strong>,
            每一步都用问题本身的性质排除掉一批候选,把 O(n²) 压成 O(n)。三种姿势:
          </p>
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">姿势一</div>
            <div className="card-title">🏃 同向快慢指针</div>
            <p>
              fast 负责读,slow 负责写,slow 左侧维持“已整理区”。
              原地删除/压缩类题的标配 → LC 283、26、27。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">姿势二</div>
            <div className="card-title">🤜🤛 对撞指针</div>
            <p>
              两端向中间夹,利用<b>有序性或短板原理</b>每步排除一端。
              → LC 11、167、15、42。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">姿势三</div>
            <div className="card-title">🪟 滑动窗口</div>
            <p>
              连续子数组问题专属:右端吃、左端吐,窗口内维护一个可增量更新的量
              → LC 209、3、76。
            </p>
          </div>
        </div>

        {/* —— 精讲 1 —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 A</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 283 · 移动零
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">EASY</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>把所有 0 移到数组末尾,非零元素保持相对顺序,必须原地操作。
            <b> 暴力:</b>新建数组先抄非零再补零 —— O(n) 但用了 O(n) 额外空间,不合题意。
            <b> 正解:</b>换个视角 —— 别搬 0,搬非零:
          </p>
        </div>
        <ArrayStepper title="LC 283 · 同向双指针,逐帧慢放" frames={F283} />
        <CodeTabs
          title="lc283_move_zeroes"
          java={{
            code: `class Solution {
    public void moveZeroes(int[] nums) {
        int slow = 0;                        // 下一个非零该放的位置
        for (int fast = 0; fast < nums.length; fast++) {
            if (nums[fast] != 0) {           // 只在乎非零元素
                int t = nums[slow];          // 与 slow 交换
                nums[slow] = nums[fast];
                nums[fast] = t;
                slow++;                      // 非零区右扩一格
            }
        }
    }
}`,
            hl: [5, 6, 7, 8, 9],
          }}
          python={{
            code: `class Solution:
    def moveZeroes(self, nums: list[int]) -> None:
        slow = 0                     # 下一个非零该放的位置
        for fast in range(len(nums)):
            if nums[fast] != 0:      # 只在乎非零元素
                # Python 可以一行交换,无需临时变量
                nums[slow], nums[fast] = nums[fast], nums[slow]
                slow += 1            # 非零区右扩一格`,
            hl: [5, 7, 8],
          }}
          js={{
            code: `var moveZeroes = function (nums) {
  let slow = 0;                      // 下一个非零该放的位置
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {          // 只在乎非零元素
      [nums[slow], nums[fast]] = [nums[fast], nums[slow]]; // 解构交换
      slow++;                        // 非零区右扩一格
    }
  }
};`,
            hl: [4, 5, 6],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n)</b>(fast 只走一遍),空间 <b>O(1)</b>。面试官常追问:
            “如果要移动的不是 0 而是给定值?”(→ 变成 LC 27)
            “如果要求 0 的相对顺序也不变?”(本解法天然满足)。
            能答出<b>循环不变量</b>(slow 左侧恒为有序非零区)才算真懂。
          </p>
        </Callout>

        {/* —— 精讲 2 —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 B</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 11 · 盛最多水的容器
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>n 条竖线中选两条,与 x 轴围成容器,求最大盛水面积
            (面积 = 两线间距 × 较矮者)。<b>暴力:</b>枚举所有线对,O(n²)。
            <b> 正解:</b>从最宽开始,两端对撞 —— 每一步<strong>移动矮的那端</strong>:
            宽度反正要变小,只有换掉短板,面积才有机会变大。
          </p>
        </div>
        <ArrayStepper title="LC 11 · 对撞指针(格子里的数字是柱高)" frames={F11} cellW={50} />
        <CodeTabs
          title="lc11_max_area"
          java={{
            code: `class Solution {
    public int maxArea(int[] height) {
        int l = 0, r = height.length - 1, best = 0;
        while (l < r) {
            int area = Math.min(height[l], height[r]) * (r - l);
            best = Math.max(best, area);
            if (height[l] < height[r]) l++;   // 永远移动短板
            else r--;
        }
        return best;
    }
}`,
            hl: [7, 8],
          }}
          python={{
            code: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        l, r, best = 0, len(height) - 1, 0
        while l < r:
            area = min(height[l], height[r]) * (r - l)
            best = max(best, area)
            if height[l] < height[r]:
                l += 1               # 永远移动短板
            else:
                r -= 1
        return best`,
            hl: [7, 8, 9, 10],
          }}
          js={{
            code: `var maxArea = function (height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    const area = Math.min(height[l], height[r]) * (r - l);
    best = Math.max(best, area);
    if (height[l] < height[r]) l++;   // 永远移动短板
    else r--;
  }
  return best;
};`,
            hl: [6, 7],
          }}
        />
        <Callout tone="deep" title="为什么移动短板是安全的?">
          <p>
            设左短右长。保留左端、把右端往里移的所有方案,高度上限仍是左端的短板,
            而宽度更小 —— <b>全部不可能超过当前面积</b>,可以整批放弃。
            所以每一步都在“无损地”排除 O(n) 个候选,总共 n 步扫完:O(n²) → O(n)。
            这个论证是对撞指针类题目的标准答法,面试时要能讲出来。
          </p>
        </Callout>

        {/* —— 精讲 3 —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 C</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 209 · 长度最小的子数组
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>正整数数组中,找出和 ≥ target 的<strong>最短连续</strong>子数组长度。
            <b> 暴力:</b>枚举所有起点 × 终点,O(n²)。<b>正解:</b>滑动窗口 ——
            因为元素全为正,窗口和随右扩<strong>单调增</strong>、随左缩<strong>单调减</strong>,
            这个单调性让“回头路”变得没有必要:
          </p>
        </div>
        <ArrayStepper title="LC 209 · 滑动窗口(target = 7)" frames={F209} />
        <CodeTabs
          title="lc209_min_subarray"
          java={{
            code: `class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int l = 0, sum = 0, ans = Integer.MAX_VALUE;
        for (int r = 0; r < nums.length; r++) {
            sum += nums[r];                  // 右端吃进
            while (sum >= target) {          // 满足条件就拼命收缩
                ans = Math.min(ans, r - l + 1);
                sum -= nums[l++];            // 左端吐出
            }
        }
        return ans == Integer.MAX_VALUE ? 0 : ans;
    }
}`,
            hl: [5, 6, 7, 8],
          }}
          python={{
            code: `class Solution:
    def minSubArrayLen(self, target: int, nums: list[int]) -> int:
        l, s, ans = 0, 0, float("inf")
        for r, v in enumerate(nums):
            s += v                     # 右端吃进
            while s >= target:         # 满足条件就拼命收缩
                ans = min(ans, r - l + 1)
                s -= nums[l]
                l += 1                 # 左端吐出
        return 0 if ans == float("inf") else ans`,
            hl: [5, 6, 7, 8, 9],
          }}
          js={{
            code: `var minSubArrayLen = function (target, nums) {
  let l = 0, sum = 0, ans = Infinity;
  for (let r = 0; r < nums.length; r++) {
    sum += nums[r];                    // 右端吃进
    while (sum >= target) {            // 满足条件就拼命收缩
      ans = Math.min(ans, r - l + 1);
      sum -= nums[l++];                // 左端吐出
    }
  }
  return ans === Infinity ? 0 : ans;
};`,
            hl: [4, 5, 6, 7],
          }}
        />
        <Callout tone="win" title="复杂度 & 窗口题的通用模板">
          <p>
            虽然有嵌套 while,但 l 和 r <b>各自只前进不后退</b>,总移动 ≤ 2n → O(n)。
            滑动窗口三问:① 窗口里维护什么量(这里是 sum)?② 什么时候扩(默认每步)?
            ③ 什么时候缩(sum ≥ target)?想清三问,LC 3、76、438 全是同一套模板
            —— 字符串一章我们再刷两道。
          </p>
        </Callout>
      </Section>

      {/* ================= §09 题单 ================= */}
      <Section
        id="problems"
        index="09"
        title="高频题单:数组 17 题"
        desc="按套路分组、由易到难。勾选进度存在本地,先想 30 秒再看提示"
        badge={<span className="chip">Hot 100 精选</span>}
      >
        <ProblemSet ch="array" items={PROBLEMS} />
      </Section>

      {/* ================= §10 Quiz ================= */}
      <Section
        id="quiz"
        index="10"
        title="通关测验"
        desc="9 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="array" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            数组的一切从 <b>地址 = 首地址 + 下标 × 元素大小</b> 来:O(1)
            随机访问是它给的,连续搬家是它收的。
          </>,
          <>
            <b>要不要搬别的元素</b>是判断数组操作复杂度的唯一问题:尾部 O(1),头部/中间 O(n)。
          </>,
          <>
            动态数组 = 定长数组 + 满了搬家(×1.5~2):单次扩容 O(n),<b>均摊 O(1)</b>。
            Java 分 <code>int[]</code>/<code>ArrayList</code>,Python 只有 list,JS 是引擎优化的“伪数组”。
          </>,
          <>
            <b>二分查找</b>:有序 + 随机访问 ⇒ 每步砍一半;闭区间三要素
            —— <code>left &lt;= right</code>、<code>mid ± 1</code>、防溢出的 mid 写法。
          </>,
          <>
            二维只是排版:<b>matrix[i][j] = 一维的 i × 列数 + j</b>(行优先);
            遍历顺着行走才吃得到缓存红利。
          </>,
          <>
            双指针三姿势 —— 同向(原地压缩)、对撞(有序/短板)、滑窗(连续子数组),
            背后同一个思想:<b>用单调性排除候选,把 O(n²) 压成 O(n)</b>。
          </>,
          <>
            工程加分项:CPU 缓存偏爱连续内存;<code>shift/insert(0)/add(0,x)</code>{" "}
            这类“顺手 API”都是 O(n)。
          </>,
        ]}
      />

      <ChapterFooter ch="array" />
    </main>
  );
}
