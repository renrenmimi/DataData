"use client";

// 第 13 章 · 组合与进阶 —— 全书压轴。
// 十段式结构:组合的艺术 → LRU(重头戏)→ LFU 一瞥 → 线段树 → 树状数组 →
// 跳表 → 布隆过滤器 → 三道精讲(逐帧动画 + 三语言题解)→ 题单 → 测验 → 要点。
// 前 12 章的所有结构在这里被拼装成"机器":可自由引用任何一章。

import {
  Hero,
  Section,
  Callout,
  BigO,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeTabs, CodeBlock } from "@/lib/code";
import { ArrayStepper, type ArrayFrame } from "@/lib/stepper";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/advanced-data";
import {
  LRUAnatomy,
  LRULab,
  LFUBuckets,
  SegAnatomy,
  SegLab,
  SkipLab,
  BloomLab,
} from "./viz";
import "./chapter.css";

/* ================= 精讲动画帧 ================= */

// —— 精讲 A:LC 146 LRU(容量 2,官方样例的完整操作序列)——
// 单元格 = 双向链表从头到尾的顺序(左新右旧)
const F146: ArrayFrame[] = [
  {
    cells: [],
    msg: (
      <>
        容量 2 的空 LRU。下面的格子表示<b>双向链表从头到尾</b>的顺序:左 = 最新,右 =
        最旧。旁白里同步说明哈希表的动作。
      </>
    ),
  },
  {
    cells: [{ v: "1:1", state: "lit" }],
    ptrs: [{ i: 0, label: "头" }],
    msg: (
      <>
        put(1,1):缓存未满 → 新节点 <b>1:1</b> 头插;哈希表写入 1 → 节点引用。O(1)。
      </>
    ),
  },
  {
    cells: [{ v: "2:2", state: "lit" }, { v: "1:1" }],
    ptrs: [
      { i: 0, label: "头" },
      { i: 1, label: "尾" },
    ],
    msg: (
      <>
        put(2,2):<b>2:2</b> 头插,1:1 被挤到尾部 —— 它现在是“最久未使用”的候选人。
      </>
    ),
  },
  {
    cells: [{ v: "1:1", state: "lit" }, { v: "2:2" }],
    ptrs: [
      { i: 0, label: "头" },
      { i: 1, label: "尾" },
    ],
    msg: (
      <>
        get(1):哈希表瞬移命中,返回 <b>1</b>;节点 1 摘下来<b>搬回头部</b> ——
        get 也要搬家,忘搬是最常见的 bug!现在轮到 2:2 垫底。
      </>
    ),
  },
  {
    cells: [
      { v: "3:3", state: "lit" },
      { v: "1:1" },
      { v: "2:2", state: "bad" },
    ],
    ptrs: [{ i: 0, label: "头" }],
    msg: (
      <>
        put(3,3):容量满!尾部的 <b>2:2</b> 被淘汰 —— 链表 O(1) 摘除 + 哈希表
        O(1) 删条目(用节点里存的 key 反查),然后 3:3 头插。
      </>
    ),
  },
  {
    cells: [{ v: "3:3" }, { v: "1:1" }],
    ptrs: [
      { i: 0, label: "头" },
      { i: 1, label: "尾" },
    ],
    msg: (
      <>
        get(2) = <b>-1</b>:哈希表里已经没有 2 了。链表连碰都不用碰。
      </>
    ),
  },
  {
    cells: [
      { v: "4:4", state: "lit" },
      { v: "3:3" },
      { v: "1:1", state: "bad" },
    ],
    ptrs: [{ i: 0, label: "头" }],
    msg: (
      <>
        put(4,4):又满了 —— 这次垫底的是 <b>1:1</b>(它自 get(1) 之后再没被用过),淘汰。
      </>
    ),
  },
  {
    cells: [
      { v: "4:4", state: "ok" },
      { v: "3:3", state: "ok" },
    ],
    msg: (
      <>
        终态:get(1)→-1、get(3)→3、get(4)→4。全程 <b>10 次操作,每次 O(1)</b>
        —— 这正是 LC 146 官方样例,输出 [1,-1,-1,3,4]。
      </>
    ),
  },
];

// —— 精讲 B:LC 307 用树状数组 ——
// a[1..8] = [3,1,4,1,5,9,2,6](1-based),tree = [×,3,4,4,9,5,14,2,31]
// 演示 add(3,+2) 的上行三跳,与 query(7) 的下行三跳
const bitCells = (
  t: (number | string)[],
  marks: Record<number, "lit" | "ok">,
): ArrayFrame["cells"] =>
  t.map((v, i) =>
    i === 0
      ? { v: "×", state: "ghost" as const }
      : { v, state: marks[i] },
  );

const F307: ArrayFrame[] = [
  {
    cells: bitCells([0, 3, 4, 4, 9, 5, 14, 2, 31], {}),
    msg: (
      <>
        a = [3,1,4,1,5,9,2,6](1 起)建好的树状数组:tree[i] 管辖“以 i 结尾、长
        lowbit(i)”的一段。tree[0] 空着不用 —— BIT 是 1-based 的。
      </>
    ),
  },
  {
    cells: bitCells([0, 3, 4, 6, 9, 5, 14, 2, 31], { 3: "lit" }),
    ptrs: [{ i: 3, label: "i" }],
    msg: (
      <>
        update:a[3] 从 4 改到 6,即 add(3, +2)。第一站 tree[3](管 [3,3])4→6;
        lowbit(3)=1,跳到 3+1=<b>4</b>。
      </>
    ),
  },
  {
    cells: bitCells([0, 3, 4, 6, 11, 5, 14, 2, 31], { 4: "lit" }),
    ptrs: [{ i: 4, label: "i" }],
    msg: (
      <>
        tree[4] 管 [1,4],包含 a[3] → 9+2=<b>11</b>;lowbit(4)=4,跳到 4+4=<b>8</b>。
      </>
    ),
  },
  {
    cells: bitCells([0, 3, 4, 6, 11, 5, 14, 2, 33], { 8: "lit" }),
    ptrs: [{ i: 8, label: "i" }],
    msg: (
      <>
        tree[8] 管 [1,8] → 31+2=<b>33</b>;下一跳 8+8=16 &gt; n,停。整个 update
        只碰了 <b>3 个格子</b>(≤ log₂8 + 1)。
      </>
    ),
  },
  {
    cells: bitCells([0, 3, 4, 6, 11, 5, 14, 2, 33], { 7: "ok" }),
    ptrs: [{ i: 7, label: "i" }],
    msg: (
      <>
        query(7) = a[1..7] 的前缀和。第一段 tree[7](管 [7,7]):s = 2;
        7−lowbit(7) = <b>6</b>。
      </>
    ),
  },
  {
    cells: bitCells([0, 3, 4, 6, 11, 5, 14, 2, 33], { 7: "ok", 6: "ok" }),
    ptrs: [{ i: 6, label: "i" }],
    msg: (
      <>
        tree[6] 管 [5,6]:s = 2+14 = 16;6−lowbit(6) = 6−2 = <b>4</b>。
        注意每段管辖区间首尾相接、互不重叠。
      </>
    ),
  },
  {
    cells: bitCells([0, 3, 4, 6, 11, 5, 14, 2, 33], { 7: "ok", 6: "ok", 4: "ok" }),
    ptrs: [{ i: 4, label: "i" }],
    msg: (
      <>
        tree[4] 管 [1,4](已含刚才的 +2):s = 16+11 = <b>27</b>;4−4 = 0,停。
        三跳拼出前缀和 27 = 3+1+6+1+5+9+2 ✓ —— 拆的正是 7 = 4+2+1 的二进制。
      </>
    ),
  },
];

// —— 精讲 C:LC 380 数组 + 哈希 ——
const F380: ArrayFrame[] = [
  {
    cells: [{ v: 5, state: "lit" }],
    msg: (
      <>
        insert(5):数组尾部追加,哈希表记下 {"{5:0}"} —— 均摊 O(1)(第 1 章的动态数组)。
      </>
    ),
  },
  {
    cells: [{ v: 5 }, { v: 8, state: "lit" }],
    msg: <>insert(8):尾部追加,哈希表 {"{5:0, 8:1}"}。</>,
  },
  {
    cells: [{ v: 5 }, { v: 8 }, { v: 3, state: "lit" }],
    msg: <>insert(3):尾部追加,哈希表 {"{5:0, 8:1, 3:2}"}。三次插入都没碰过别的元素。</>,
  },
  {
    cells: [{ v: 5 }, { v: 8, state: "bad" }, { v: 3, state: "lit" }],
    ptrs: [
      { i: 1, label: "要删" },
      { i: 2, label: "末尾" },
    ],
    msg: (
      <>
        remove(8):哈希表查到 8 住在下标 1。中间删除要搬家 O(n)?不 ——
        集合<b>不在乎顺序</b>,把末尾的 3 抄过来盖掉 8!
      </>
    ),
  },
  {
    cells: [{ v: 5 }, { v: 3, state: "lit" }, { v: 3, state: "ghost" }],
    msg: (
      <>
        3 落到下标 1,哈希表<b>同步更新</b> {"{3:1}"}(忘了这步必挂);末尾格子作废,准备尾删。
      </>
    ),
  },
  {
    cells: [{ v: 5 }, { v: 3 }],
    msg: (
      <>
        尾删 O(1),哈希表删掉 {"{8}"}。「和末尾交换再删」把数组删除从 O(n) 变
        <b>O(1)</b> —— 代价是放弃元素顺序,而集合恰好不需要顺序。
      </>
    ),
  },
  {
    cells: [
      { v: 5, state: "ok" },
      { v: 3, state: "ok" },
    ],
    msg: (
      <>
        getRandom():在 [0, size) 随机一个下标,数组 O(1) 随机访问 → <b>严格等概率</b>。
        这就是必须有数组的原因:哈希表内部有空桶,做不到 O(1) 等概率抽样。
      </>
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "combine", n: "01", label: "组合的艺术" },
  { id: "lru", n: "02", label: "LRU 缓存" },
  { id: "lfu", n: "03", label: "LFU 一瞥" },
  { id: "segtree", n: "04", label: "线段树" },
  { id: "bit", n: "05", label: "树状数组" },
  { id: "skiplist", n: "06", label: "跳表" },
  { id: "bloom", n: "07", label: "布隆过滤器" },
  { id: "featured", n: "08", label: "三道精讲" },
  { id: "problems", n: "09", label: "高频题单" },
  { id: "quiz", n: "10", label: "通关测验" },
];

export default function AdvancedChapter() {
  return (
    <main className="page" data-ch="advanced">
      <Hero
        ch="advanced"
        title={
          <>
            组合与进阶 <span className="grad">Composite &amp; Beyond</span>
          </>
        }
        essence={
          <>
            前 12 章你攒下的是<strong>乐高积木</strong>;这一章开始拼<strong>机器</strong>:
            LRU、线段树、跳表、布隆过滤器 —— 真实系统里跑着的,从来不是单个结构,
            而是结构的组合。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 组合的艺术 ================= */}
      <Section
        id="combine"
        index="01"
        title="组合的艺术:积木拼成机器"
        desc="没有新积木了 —— 有的只是新的拼法"
      >
        <div className="prose">
          <p>
            回头看这门课:数组(第 1 章)给了你 O(1) 随机访问,链表(第 3 章)给了你
            O(1) 摘插,哈希表(第 6 章)给了你 O(1) 定位,堆(第 9 章)给了你 O(log n)
            最值……每个结构都是一块<strong>性格鲜明的积木</strong>:有一招绝活,也有致命短板。
          </p>
          <p>
            真实世界的需求却很少“恰好只要一招”。“缓存要能 O(1) 查<em>并且</em> O(1)
            淘汰最久没用的”、“数组要能改<em>并且</em>能快速查区间和” ——
            单块积木都会在某个操作上卡死。工程师的解法从来不是发明新积木,而是
            <strong>把两块互补的积木拼在一起,让每块只干自己最快的那件事</strong>。
            这一章的五台“机器”,全部是这么拼出来的:
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>机器</th>
                <th>拼法</th>
                <th>解决什么</th>
                <th>工程出场</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>LRU 缓存</b></td>
                <td>哈希表 + 双向链表</td>
                <td>O(1) 查 + O(1) 淘汰最久未用</td>
                <td>Redis、浏览器缓存、OS 页面置换</td>
              </tr>
              <tr>
                <td><b>LFU 缓存</b></td>
                <td>双哈希表 + 频次分桶链表</td>
                <td>O(1) 淘汰用得最少的</td>
                <td>Redis allkeys-lfu 策略</td>
              </tr>
              <tr>
                <td><b>线段树</b></td>
                <td>数组 + 分治二叉树</td>
                <td>区间统计:又能改又能查,双 O(log n)</td>
                <td>数据库统计、K 线聚合、竞赛</td>
              </tr>
              <tr>
                <td><b>树状数组</b></td>
                <td>数组 + lowbit 位运算</td>
                <td>可修改的前缀和(线段树轻量版)</td>
                <td>计数统计、逆序对、竞赛标配</td>
              </tr>
              <tr>
                <td><b>跳表</b></td>
                <td>有序链表 + 多层随机索引</td>
                <td>有序集合 O(log n) 查/插/删</td>
                <td>Redis zset、LevelDB MemTable</td>
              </tr>
              <tr>
                <td><b>布隆过滤器</b></td>
                <td>位数组 + K 个哈希函数</td>
                <td>「一定不在」的超省内存判断</td>
                <td>爬虫去重、缓存穿透防护</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">拼装原则 01</div>
            <div className="card-title">取长补短</div>
            <p>
              每个成员只贡献它 O(1)/O(log n) 的绝活,绝不让它干自己 O(n) 的短板活。
              LRU 里哈希表只管“查”,链表只管“序”。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">拼装原则 02</div>
            <div className="card-title">互相指认</div>
            <p>
              成员之间存<b>引用</b>互通:哈希表的 value 是链表节点,链表节点里存回
              key。两边都能一步跳到对方,不用搜索。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">拼装原则 03</div>
            <div className="card-title">⚖️ 同步更新</div>
            <p>
              每次操作必须把<b>所有成员</b>一起改到位(删链表节点必删哈希条目)。
              破坏同步 = 数据不一致 = 组合结构最典型的 bug 来源。
            </p>
          </div>
        </div>
        <Callout tone="idea" title="组合设计的方法论(面试设计题的万能开场)">
          <p>
            拿到“设计一个 XX”:第一步<b>列出全部操作</b>(get/put/delete/random…);
            第二步给每个操作定<b>复杂度预算</b>(题目要求 O(1) 还是 O(log n)?);
            第三步逐个检查单一结构哪里超预算,<b>用另一块积木补上那个短板</b>。
            本章每一节,都是这套方法论的一次完整演练。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 LRU ================= */}
      <Section
        id="lru"
        index="02"
        title="LRU 缓存:哈希表 + 双向链表"
        desc="本章重头戏 —— 从需求推导到逐步排除,亲手把它拼出来"
        badge={<span className="chip" data-tone="warn">★ 面试出现率最高的设计题</span>}
      >
        <div className="prose">
          <p>
            先从需求说起。<strong>缓存(cache)</strong>是一块“快但小”的存储:
            内存比磁盘快十万倍,但装不下所有数据,所以只放“最可能被再次用到”的那部分。
            快的代价是小,小就有一个绕不开的问题 ——{" "}
            <strong>满了以后,腾谁的位置?</strong>
          </p>
          <p>
            最经典的答案:淘汰<strong>最久没被用过</strong>的那条数据,即{" "}
            <strong>LRU(Least Recently Used,最近最少使用)</strong>。为什么是它?
            因为程序访问数据有<strong>时间局部性(temporal locality)</strong>:
            刚用过的东西,大概率马上还要用;很久没碰的,大概率以后也不碰
            —— 就像衣柜整理术:一年没穿的衣服,基本可以捐了。
          </p>
          <p>
            于是需求清单出炉(这正是 LC 146 的原题):
            <b>get(key)</b> 读缓存、<b>put(key, value)</b> 写缓存,容量满时自动淘汰
            LRU 数据 —— 并且两个操作都必须 <b>O(1)</b>。缓存本身是为“快”而生的,
            如果缓存操作自己是 O(n),它就失去了存在的意义。
          </p>
        </div>

        <h3 style={{ margin: "28px 0 6px", fontSize: 18 }}>逐步排除:为什么偏偏是这个组合?</h3>
        <p className="sec-desc" style={{ marginTop: 0 }}>
          别背结论。像面试现场一样,把候选方案一个个划掉,答案会自己浮出来。
        </p>
        <div className="adv-elim">
          <div className="adv-elim-row" data-verdict="no">
            <span className="adv-elim-badge">方案 1 ✕</span>
            <p>
              <span className="t">只用哈希表</span>
              get/put 确实 O(1) —— 但满了以后淘汰谁?哈希表把 key 打散存放,
              <b>天生没有“顺序”概念</b>,根本不知道谁最久没被用过。想知道就得给每个
              key 记时间戳再全表扫一遍找最小值:O(n),出局。
            </p>
          </div>
          <div className="adv-elim-row" data-verdict="no">
            <span className="adv-elim-badge">方案 2 ✕</span>
            <p>
              <span className="t">只用数组或链表(按访问时间排)</span>
              把数据按“最近用过”排成一排:谁被访问就搬到最前面,尾巴就是该淘汰的
              —— 顺序有了!但 get(key) 要先<b>找到</b>这条数据:没有下标可算、
              没有哈希可查,只能从头扫,O(n),出局。
            </p>
          </div>
          <div className="adv-elim-row" data-verdict="no">
            <span className="adv-elim-badge">方案 3 ✕</span>
            <p>
              <span className="t">数组 + 哈希表(哈希存下标)</span>
              哈希 O(1) 定位到数组下标,顺序也有 —— 可“把刚访问的元素搬到最前”
              是数组的<b>中间删除 + 头部插入</b>,第 1 章数过:右边所有元素都要搬家,
              O(n),还会连累哈希表里一大片下标失效。出局。
            </p>
          </div>
          <div className="adv-elim-row" data-verdict="no">
            <span className="adv-elim-badge">方案 4 ✕</span>
            <p>
              <span className="t">单链表 + 哈希表(哈希存节点引用)</span>
              最接近了!哈希表直接存“key → 链表节点”,一步瞬移到节点,链表插删又是
              O(1)……慢着:把节点从链表中间<b>摘下来</b>,要把“前驱的 next”接到
              “自己的 next”上 —— <b>单链表的节点不认识自己的前驱</b>,找前驱只能从头扫,
              O(n)。就差一根指针!
            </p>
          </div>
          <div className="adv-elim-row" data-verdict="ok">
            <span className="adv-elim-badge">方案 5 ✓</span>
            <p>
              <span className="t">双向链表 + 哈希表</span>
              给每个节点补上 prev 指针:摘除时前驱后继都在手里,<b>O(1) 摘除、O(1)
              头插</b>;哈希表 O(1) 定位。哈希表管「在哪」,双向链表管「多旧」——
              两个 O(n) 的短板,恰好被对方的绝活补上。这就是 LRU 的标准拼法。
            </p>
          </div>
        </div>
        <Callout tone="warn" title="常见误区:「链表查找 O(n),所以 LRU 是 O(n)」">
          <p>
            错。LRU 里<b>从来没有人去“遍历链表查找”</b>:定位节点永远走哈希表
            (key → 节点引用,一步到位),链表只在“已经拿到节点”之后做摘除和头插
            —— 全是改几根指针的 O(1) 操作。两个结构各司其职,谁也不干自己慢的活。
          </p>
        </Callout>

        <LRUAnatomy />

        <div className="prose">
          <p>
            规则只有三条,全部 O(1):①{" "}
            <strong>get 命中 → 节点搬到链表头部</strong>(宣布“我刚被用过”);②{" "}
            <strong>put 新增 → 头插 + 哈希登记</strong>;③{" "}
            <strong>容量满 → 摘掉尾部节点</strong>(tail.prev 就是最久未用的),
            并同步删掉它的哈希条目。亲手操作一遍,比看十遍图都管用:
          </p>
        </div>
        <LRULab />

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>操作</th>
                <th>哈希表做什么</th>
                <th>双向链表做什么</th>
                <th>复杂度</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>get(key) 命中</b></td>
                <td>key → 节点引用,一步定位</td>
                <td>摘除该节点,插回头部</td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td><b>get(key) 未命中</b></td>
                <td>查无此 key,返回 -1</td>
                <td>不参与</td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td><b>put 已存在</b></td>
                <td>定位节点,改 value</td>
                <td>摘除 + 头插</td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td><b>put 新增(未满)</b></td>
                <td>写入 key → 新节点</td>
                <td>新节点头插</td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td><b>put 新增(已满)</b></td>
                <td>删掉旧 key 条目 + 写入新条目</td>
                <td>摘掉 tail.prev + 新节点头插</td>
                <td><BigO o="1" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style={{ margin: "28px 0 6px", fontSize: 18 }}>手写实现(LC 146 原题)</h3>
        <p className="sec-desc" style={{ marginTop: 0 }}>
          哑头哑尾(dummy head/tail)是第 3 章链表的老朋友:头尾各放一个永不删除的空节点,
          插入删除就永远发生在“两个真实节点之间”,所有判空分支一扫而光。
        </p>
        <CodeTabs
          title="lc146_lru_cache"
          java={{
            code: `class LRUCache {
    // 节点同时存 key 和 value:淘汰尾节点时,
    // 要用节点里的 key 反查哈希表删条目
    static class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }

    private final int cap;
    private final Map<Integer, Node> map = new HashMap<>(); // key -> 节点引用
    private final Node head = new Node(-1, -1);  // 哑头:head.next 是最新
    private final Node tail = new Node(-1, -1);  // 哑尾:tail.prev 是最旧

    public LRUCache(int capacity) {
        cap = capacity;
        head.next = tail;    // 空链表:哑头哑尾互指
        tail.prev = head;    // 从此增删永远不用判空
    }

    public int get(int key) {
        Node n = map.get(key);
        if (n == null) return -1;   // 哈希表 O(1) 判存在
        moveToHead(n);              // 刚用过 = 变最新,搬到头部
        return n.val;
    }

    public void put(int key, int value) {
        Node n = map.get(key);
        if (n != null) {            // 已存在:改值 + 搬头部
            n.val = value;
            moveToHead(n);
            return;
        }
        if (map.size() == cap) {    // 满了:淘汰 tail.prev(最旧)
            Node old = tail.prev;
            unlink(old);
            map.remove(old.key);    // 链表、哈希表必须同步删!
        }
        Node fresh = new Node(key, value);
        map.put(key, fresh);
        linkFirst(fresh);
    }

    private void unlink(Node n) {     // O(1) 摘除 —— 双向的意义所在
        n.prev.next = n.next;         // 前驱直接可得,不用从头找
        n.next.prev = n.prev;
    }

    private void linkFirst(Node n) {  // O(1) 插到哑头之后
        n.next = head.next;
        n.prev = head;
        head.next.prev = n;
        head.next = n;
    }

    private void moveToHead(Node n) { unlink(n); linkFirst(n); }
}`,
            hl: [44, 45, 46, 47],
            note: (
              <>
                <b>易错点:</b>Node 里不存 key 的话,淘汰尾节点时就无法反查哈希表删除条目
                —— 这是手写 LRU 最容易漏的细节。生产代码见下方 LinkedHashMap 彩蛋。
              </>
            ),
          }}
          python={{
            code: `class Node:
    __slots__ = ("key", "val", "prev", "next")   # 省内存的小技巧
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}                    # key -> 节点引用(瞬移定位)
        self.head, self.tail = Node(), Node()   # 哑头 / 哑尾
        self.head.next = self.tail      # 空链表:哑头哑尾互指
        self.tail.prev = self.head      # 从此增删永远不用判空

    def _unlink(self, n):               # O(1) 摘除 —— 双向的意义所在
        n.prev.next = n.next            # 前驱直接可得,不用从头找
        n.next.prev = n.prev

    def _link_first(self, n):           # O(1) 插到哑头之后
        n.next = self.head.next
        n.prev = self.head
        self.head.next.prev = n
        self.head.next = n

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1                   # 哈希表 O(1) 判存在
        n = self.map[key]
        self._unlink(n)                 # 刚用过 = 变最新
        self._link_first(n)             # 摘下来,插回头部
        return n.val

    def put(self, key: int, value: int) -> None:
        if key in self.map:             # 已存在:改值 + 搬头部
            n = self.map[key]
            n.val = value
            self._unlink(n)
            self._link_first(n)
            return
        if len(self.map) == self.cap:   # 满了:淘汰 tail.prev(最旧)
            old = self.tail.prev
            self._unlink(old)
            del self.map[old.key]       # 链表、哈希表必须同步删!
        n = Node(key, value)
        self.map[key] = n
        self._link_first(n)`,
            hl: [15, 16, 17],
            note: (
              <>
                <b>易错点:</b>生产里可以直接用 <code>collections.OrderedDict</code>(它内部就是
                哈希 + 双向链表)或 <code>functools.lru_cache</code> 装饰器 ——
                但面试考的就是你能不能自己实现这台机器。快写版见精讲 A。
              </>
            ),
          }}
          js={{
            code: `class Node {
  constructor(key = 0, val = 0) {
    this.key = key; this.val = val;
    this.prev = null; this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();          // key -> 节点引用(瞬移定位)
    this.head = new Node();        // 哑头:head.next 是最新
    this.tail = new Node();        // 哑尾:tail.prev 是最旧
    this.head.next = this.tail;    // 空链表:哑头哑尾互指
    this.tail.prev = this.head;    // 从此增删永远不用判空
  }

  _unlink(n) {                     // O(1) 摘除 —— 双向的意义所在
    n.prev.next = n.next;          // 前驱直接可得,不用从头找
    n.next.prev = n.prev;
  }

  _linkFirst(n) {                  // O(1) 插到哑头之后
    n.next = this.head.next;
    n.prev = this.head;
    this.head.next.prev = n;
    this.head.next = n;
  }

  get(key) {
    const n = this.map.get(key);
    if (!n) return -1;             // 哈希表 O(1) 判存在
    this._unlink(n);               // 刚用过 = 变最新
    this._linkFirst(n);            // 摘下来,插回头部
    return n.val;
  }

  put(key, value) {
    let n = this.map.get(key);
    if (n) {                       // 已存在:改值 + 搬头部
      n.val = value;
      this._unlink(n);
      this._linkFirst(n);
      return;
    }
    if (this.map.size === this.cap) {  // 满了:淘汰 tail.prev
      const old = this.tail.prev;
      this._unlink(old);
      this.map.delete(old.key);        // 链表、哈希表必须同步删!
    }
    n = new Node(key, value);
    this.map.set(key, n);
    this._linkFirst(n);
  }
}`,
            hl: [18, 19, 20, 21],
            note: (
              <>
                <b>易错点:</b>JS 的 <code>Map</code> 本身记住插入顺序,可以“删了再插”模拟 LRU
                (精讲 A 的快写版)—— 但那是引擎替你维护的哈希 + 链表,原理一模一样。
              </>
            ),
          }}
        />

        <Callout tone="story" title="Java 彩蛋:三行拿下 LRU">
          <p>
            JDK 里的 <code>LinkedHashMap</code>,名字已经剧透了一切:<b>Linked</b>(双向链表)
            + <b>HashMap</b>(哈希表)。它的每个 Entry 除了挂在哈希桶里,还带
            before/after 指针串成一条双向链表 —— 就是我们刚手写的那台机器。构造参数{" "}
            <code>accessOrder=true</code> 让链表按“访问序”而非“插入序”排列,再覆写一个
            钩子方法就成了:
          </p>
        </Callout>
        <CodeBlock
          lang="java"
          title="LinkedHashMap 版 LRU(能直接过 LC 146)"
          code={`class LRUCache extends LinkedHashMap<Integer, Integer> {
    private final int cap;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);  // accessOrder=true:每次访问把条目搬到链表尾
        this.cap = capacity;
    }

    public int get(int key) { return super.getOrDefault(key, -1); }

    public void put(int key, int value) { super.put(key, value); }

    @Override  // 每次 put 后被回调:返回 true 就自动删除"最老"的条目
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > cap;
    }
}`}
          hl={[5, 14, 15]}
          note={
            <>
              面试时先手写完整版证明实力,再补一句“生产里我会用
              LinkedHashMap,它内部就是哈希 + 双向链表” —— 两头加分。
            </>
          }
        />

        <Callout tone="deep" title="工程现场:LRU 无处不在">
          <p>
            <b>Redis</b>:配置 <code>maxmemory-policy allkeys-lru</code> 后,内存吃紧时按
            LRU 淘汰。有趣的是 Redis 用的是<b>近似 LRU</b>:不维护全局链表(几亿个 key
            的链表指针太费内存),而是每次随机采样 5 个 key,淘汰其中最久未用的
            —— 用一点点精度换大量内存,工程权衡的经典示范。
            <b> 浏览器</b>:HTTP 缓存、图片解码缓存的容量控制都是 LRU 变体。
            <b> 操作系统</b>:物理内存不够时选择哪个页面换出到磁盘(页面置换),
            主流算法(如 Clock)也是 LRU 的近似实现 —— 精确 LRU 每次内存访问都要更新链表,
            硬件扛不住。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 LFU ================= */}
      <Section
        id="lfu"
        index="03"
        title="LFU:再加一个维度"
        desc="Least Frequently Used —— 按「用过几次」淘汰,LC 460(Hard)一节带过"
      >
        <div className="prose">
          <p>
            LRU 看“<strong>多久</strong>没用”,LFU 看“<strong>用得多不多</strong>”:
            淘汰访问<strong>次数</strong>最少的;次数打平,再淘汰其中最久未用的。
            它适合“热点长期稳定”的场景 —— 一条爆款数据即使最近 10 分钟没人碰,
            也不该被一批一次性数据挤出去。
          </p>
          <p>
            为什么 LFU 是 Hard、比 LRU 难一档?LRU 里“最旧”永远躺在链表尾部,天然就绪;
            而 LFU 的“频次”是<strong>会变的</strong>:每访问一次,key 的频次 +1,
            它在“按频次排序”里的位置就要挪动。用堆(第 9 章)维护最小频次?调整是
            O(log n),而且相同频次还要比时间,达不到全 O(1)。正解是
            <strong>频次分桶(frequency buckets)</strong>:
          </p>
        </div>
        <LFUBuckets />
        <div className="prose">
          <p>
            关键三件套:① <code>key → (value, freq)</code> 哈希表;②{" "}
            <code>freq → 桶</code> 哈希表,每个桶按时间序存该频次的所有 key
            (桶内天然是个小 LRU);③ 一个 <code>minFreq</code> 变量记录当前最小频次。
            访问某 key = 把它从 freq 桶搬进 freq+1 桶(两次 O(1) 链表操作);
            淘汰 = 掐掉 minFreq 桶里最老的 key。而 minFreq 不需要任何搜索:
            <strong>只有两种时刻它会变</strong> —— 旧桶被搬空时 +1(搬走的 key 刚好是
            minFreq 桶里最后一个),插入新 key 时归 1(新 key 频次必为 1,全场最小)。
          </p>
        </div>
        <CodeTabs
          title="lc460_lfu_core"
          java={{
            code: `class LFUCache {
    private final int cap;
    private final Map<Integer, Integer> vals = new HashMap<>();
    private final Map<Integer, Integer> freq = new HashMap<>();
    // 频次 -> 该频次的 key 集合;LinkedHashSet 保留插入序 = 桶内就是小 LRU
    private final Map<Integer, LinkedHashSet<Integer>> buckets = new HashMap<>();
    private int minFreq = 0;

    public LFUCache(int capacity) { this.cap = capacity; }

    private void touch(int key) {              // 访问一次:频次 +1,换桶
        int f = freq.get(key);
        buckets.get(f).remove(key);
        if (buckets.get(f).isEmpty() && f == minFreq)
            minFreq++;                         // 旧桶空了,最小频次上移
        freq.put(key, f + 1);
        buckets.computeIfAbsent(f + 1, k -> new LinkedHashSet<>()).add(key);
    }

    public int get(int key) {
        if (!vals.containsKey(key)) return -1;
        touch(key);
        return vals.get(key);
    }

    public void put(int key, int value) {
        if (cap == 0) return;
        if (vals.containsKey(key)) {           // 已存在:改值 + 频次 +1
            vals.put(key, value);
            touch(key);
            return;
        }
        if (vals.size() == cap) {              // 淘汰:minFreq 桶里最老的
            int old = buckets.get(minFreq).iterator().next();
            buckets.get(minFreq).remove(old);
            vals.remove(old);
            freq.remove(old);
        }
        vals.put(key, value);
        freq.put(key, 1);
        buckets.computeIfAbsent(1, k -> new LinkedHashSet<>()).add(key);
        minFreq = 1;                           // 新人频次 1,全场最小
    }
}`,
            hl: [13, 14, 15, 16, 17],
            note: (
              <>
                LinkedHashSet = 哈希 + 双向链表(又是这对组合!),
                <code>iterator().next()</code> 拿到的就是桶里最老的 key。
              </>
            ),
          }}
          python={{
            code: `from collections import defaultdict, OrderedDict

class LFUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.kv = {}                      # key -> (val, freq)
        # freq -> 该频次的 key(OrderedDict 保插入序 = 桶内就是小 LRU)
        self.buckets = defaultdict(OrderedDict)
        self.min_freq = 0

    def _touch(self, key):                # 访问一次:频次 +1,换桶
        val, f = self.kv[key]
        del self.buckets[f][key]
        if not self.buckets[f] and f == self.min_freq:
            self.min_freq += 1            # 旧桶空了,最小频次上移
        self.buckets[f + 1][key] = None
        self.kv[key] = (val, f + 1)

    def get(self, key: int) -> int:
        if key not in self.kv:
            return -1
        self._touch(key)
        return self.kv[key][0]

    def put(self, key: int, value: int) -> None:
        if self.cap == 0:
            return
        if key in self.kv:                # 已存在:改值 + 频次 +1
            self._touch(key)
            self.kv[key] = (value, self.kv[key][1])
            return
        if len(self.kv) == self.cap:      # 淘汰:min_freq 桶里最老的
            old, _ = self.buckets[self.min_freq].popitem(last=False)
            del self.kv[old]
        self.kv[key] = (value, 1)
        self.buckets[1][key] = None
        self.min_freq = 1                 # 新人频次 1,全场最小`,
            hl: [13, 14, 15, 16],
            note: (
              <>
                <code>popitem(last=False)</code> 从 OrderedDict 头部弹出 = 桶里最老的
                key。整份代码没有一处循环 —— 这就是全 O(1) 的直观证据。
              </>
            ),
          }}
          js={{
            code: `class LFUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.kv = new Map();        // key -> { val, freq }
    this.buckets = new Map();   // freq -> Set(JS 的 Set 保插入序 = 桶内小 LRU)
    this.minFreq = 0;
  }

  _touch(key) {                 // 访问一次:频次 +1,换桶
    const e = this.kv.get(key);
    const bucket = this.buckets.get(e.freq);
    bucket.delete(key);
    if (bucket.size === 0 && e.freq === this.minFreq)
      this.minFreq++;           // 旧桶空了,最小频次上移
    e.freq++;
    if (!this.buckets.has(e.freq)) this.buckets.set(e.freq, new Set());
    this.buckets.get(e.freq).add(key);
  }

  get(key) {
    if (!this.kv.has(key)) return -1;
    this._touch(key);
    return this.kv.get(key).val;
  }

  put(key, value) {
    if (this.cap === 0) return;
    if (this.kv.has(key)) {     // 已存在:改值 + 频次 +1
      this.kv.get(key).val = value;
      this._touch(key);
      return;
    }
    if (this.kv.size === this.cap) {  // 淘汰:minFreq 桶里最老的
      const old = this.buckets.get(this.minFreq).values().next().value;
      this.buckets.get(this.minFreq).delete(old);
      this.kv.delete(old);
    }
    this.kv.set(key, { val: value, freq: 1 });
    if (!this.buckets.has(1)) this.buckets.set(1, new Set());
    this.buckets.get(1).add(key);
    this.minFreq = 1;           // 新人频次 1,全场最小
  }
}`,
            hl: [11, 12, 13, 14, 15],
            note: (
              <>
                JS 的 <code>Set</code>/<code>Map</code> 都记住插入顺序,天生就是“有序桶”
                —— <code>values().next().value</code> 拿最老的成员。
              </>
            ),
          }}
        />
        <Callout tone="warn" title="LRU 还是 LFU?没有免费午餐">
          <p>
            LFU 的软肋:<b>旧热点退役慢</b> —— 一条昨天爆火、今天凉透的数据攒了几万次
            频次,新内容要花很久才能把它挤出去(工程上用“频次随时间衰减”来修,Redis 的
            LFU 就带衰减因子)。LRU 的软肋:<b>怕突发扫描</b> —— 一次全表遍历这种
            一次性访问,会把真正的热数据全部冲出缓存。所以 Redis 两种策略都提供,
            按业务访问模式选。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 线段树 ================= */}
      <Section
        id="segtree"
        index="04"
        title="线段树:给区间装一棵分治树"
        desc="Segment Tree —— 又能改、又能查,双 O(log n)"
      >
        <div className="prose">
          <p>
            换一类需求。给一个数组,反复问“下标 l 到 r 的<strong>区间和</strong>是多少”
            —— 第 1 章的<strong>前缀和</strong>就能秒杀:预处理一遍,每次查询 O(1)。
            但加一个条件试试:<strong>数组元素还会被修改</strong>。改一个{" "}
            <code>a[i]</code>,它后面的所有前缀和全部作废,重建要 O(n) ——
            改 10 万次就是 10 万次重建,前缀和当场崩盘。
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>方案</th>
                <th>改一个元素</th>
                <th>查一次区间和</th>
                <th>结论</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>数组直存</b></td>
                <td><BigO o="1" /></td>
                <td><BigO o="n" /></td>
                <td>改得快查得慢 —— 查询多就废</td>
              </tr>
              <tr>
                <td><b>前缀和</b></td>
                <td><BigO o="n" label="O(n) 重建" /></td>
                <td><BigO o="1" /></td>
                <td>查得快改得慢 —— 修改多就废</td>
              </tr>
              <tr>
                <td><b>线段树</b></td>
                <td><BigO o="logn" /></td>
                <td><BigO o="logn" /></td>
                <td>两头都不冒尖,但两头都不崩 —— 均衡取胜</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            两个极端中间,需要一个“改与查都别太惨”的折中。折中从哪来?
            <strong>分治(divide and conquer)</strong>:把整个区间对半劈开、劈到底,
            劈出一棵二叉树(第 7 章),<strong>每个节点缓存自己那段区间的和</strong>。
            于是整个数组的“和的知识”被分摊到 O(n) 个节点上,任何一次修改或查询,
            都只需要惊动其中 O(log n) 个:
          </p>
        </div>
        <SegAnatomy />
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-title">update:改叶子,一路向上</div>
            <p>
              要改 <code>a[i]</code>:从根一路二分下潜找到那片叶子改掉,回溯时把
              <b>路径上每个祖先</b>的和重算一遍(= 左孩子 + 右孩子)。
              惊动的节点数 = 树高 = <b>O(log n)</b> —— 其余节点的缓存全部还有效,
              这就是它赢前缀和的地方。
            </p>
          </div>
          <div className="card">
            <div className="card-title">query:三种相交,一套判断</div>
            <p>
              问 [l,r] 的和,每个节点只有三种处境:<b>① 完全不相交</b> → 返回 0;
              <b>② 整段被 [l,r] 包住</b> → 直接返回缓存的和(“打包”命中,不再下探);
              <b>③ 部分相交</b> → 劈开问两个孩子。每层最多劈出 2 个“部分相交”节点,
              所以总访问量还是 <b>O(log n)</b>。
            </p>
          </div>
        </div>
        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            口说无凭,亲手玩:改值模式点叶子,看一条“从叶到根”的更新路径;查询模式框一个区间,
            看它被拆成哪几个“打包”节点 —— 绿色节点直接交出现成的和,一次都不用下探到叶子。
          </p>
        </div>
        <SegLab />

        <h3 style={{ margin: "28px 0 6px", fontSize: 18 }}>手写实现(LC 307 原题)</h3>
        <p className="sec-desc" style={{ marginTop: 0 }}>
          数组版线段树:tree[1] 是根,节点 i 的孩子是 2i 和 2i+1 —— 和第 9 章的堆同款存法,
          不用真的建节点对象。空间开 4n:最坏情况下(n 不是 2 的幂)最后一层会错位,4n 稳妥够用。
        </p>
        <CodeTabs
          title="lc307_segment_tree"
          java={{
            code: `class NumArray {
    private final int n;
    private final int[] tree;   // 数组存树:节点 i 的孩子是 2i、2i+1

    public NumArray(int[] nums) {
        n = nums.length;
        tree = new int[4 * n];              // 4n 空间,最坏情况也够
        build(1, 0, n - 1, nums);
    }

    // 建树:节点 node 负责区间 [lo, hi]
    private void build(int node, int lo, int hi, int[] nums) {
        if (lo == hi) {                     // 叶子 = 单个元素
            tree[node] = nums[lo];
            return;
        }
        int mid = (lo + hi) / 2;
        build(2 * node, lo, mid, nums);          // 左孩子管左半
        build(2 * node + 1, mid + 1, hi, nums);  // 右孩子管右半
        tree[node] = tree[2 * node] + tree[2 * node + 1]; // 父 = 左 + 右
    }

    public void update(int index, int val) {
        update(1, 0, n - 1, index, val);
    }

    private void update(int node, int lo, int hi, int i, int val) {
        if (lo == hi) {                     // 走到叶子,改值
            tree[node] = val;
            return;
        }
        int mid = (lo + hi) / 2;
        if (i <= mid) update(2 * node, lo, mid, i, val);
        else update(2 * node + 1, mid + 1, hi, i, val);
        tree[node] = tree[2 * node] + tree[2 * node + 1]; // 回溯:重算路径上的和
    }

    public int sumRange(int left, int right) {
        return query(1, 0, n - 1, left, right);
    }

    private int query(int node, int lo, int hi, int l, int r) {
        if (r < lo || hi < l) return 0;         // ① 完全不相交:贡献 0
        if (l <= lo && hi <= r) return tree[node]; // ② 整段被包住:打包返回
        int mid = (lo + hi) / 2;                // ③ 部分相交:劈开递归
        return query(2 * node, lo, mid, l, r)
             + query(2 * node + 1, mid + 1, hi, l, r);
    }
}`,
            hl: [42, 43, 44],
            note: (
              <>
                三个 if 就是查询的全部灵魂:不相交、全包、半包。
                把它们背下来,任何线段树题都是这个骨架。
              </>
            ),
          }}
          python={{
            code: `class NumArray:
    def __init__(self, nums: list[int]):
        self.n = len(nums)
        self.tree = [0] * (4 * self.n)       # 4n 空间,最坏情况也够
        if self.n:
            self._build(1, 0, self.n - 1, nums)

    # 建树:节点 node 负责区间 [lo, hi]
    def _build(self, node, lo, hi, nums):
        if lo == hi:                         # 叶子 = 单个元素
            self.tree[node] = nums[lo]
            return
        mid = (lo + hi) // 2
        self._build(2 * node, lo, mid, nums)          # 左孩子管左半
        self._build(2 * node + 1, mid + 1, hi, nums)  # 右孩子管右半
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def update(self, index: int, val: int) -> None:
        self._update(1, 0, self.n - 1, index, val)

    def _update(self, node, lo, hi, i, val):
        if lo == hi:                         # 走到叶子,改值
            self.tree[node] = val
            return
        mid = (lo + hi) // 2
        if i <= mid:
            self._update(2 * node, lo, mid, i, val)
        else:
            self._update(2 * node + 1, mid + 1, hi, i, val)
        # 回溯:路径上的祖先逐个重算
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def sumRange(self, left: int, right: int) -> int:
        return self._query(1, 0, self.n - 1, left, right)

    def _query(self, node, lo, hi, l, r):
        if r < lo or hi < l:                 # ① 完全不相交:贡献 0
            return 0
        if l <= lo and hi <= r:              # ② 整段被包住:打包返回
            return self.tree[node]
        mid = (lo + hi) // 2                 # ③ 部分相交:劈开递归
        return (self._query(2 * node, lo, mid, l, r)
                + self._query(2 * node + 1, mid + 1, hi, l, r))`,
            hl: [37, 38, 39, 40],
            note: (
              <>
                递归深度 log n,不会碰 Python 默认的 1000 层递归上限
                (n 要超过 2^1000 才行,宇宙没这么多原子)。
              </>
            ),
          }}
          js={{
            code: `class NumArray {
  constructor(nums) {
    this.n = nums.length;
    this.tree = new Array(4 * this.n).fill(0); // 4n 空间,最坏情况也够
    if (this.n) this._build(1, 0, this.n - 1, nums);
  }

  // 建树:节点 node 负责区间 [lo, hi]
  _build(node, lo, hi, nums) {
    if (lo === hi) {                    // 叶子 = 单个元素
      this.tree[node] = nums[lo];
      return;
    }
    const mid = (lo + hi) >> 1;
    this._build(2 * node, lo, mid, nums);          // 左孩子管左半
    this._build(2 * node + 1, mid + 1, hi, nums);  // 右孩子管右半
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }

  update(index, val) { this._update(1, 0, this.n - 1, index, val); }

  _update(node, lo, hi, i, val) {
    if (lo === hi) {                    // 走到叶子,改值
      this.tree[node] = val;
      return;
    }
    const mid = (lo + hi) >> 1;
    if (i <= mid) this._update(2 * node, lo, mid, i, val);
    else this._update(2 * node + 1, mid + 1, hi, i, val);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1]; // 回溯重算
  }

  sumRange(left, right) { return this._query(1, 0, this.n - 1, left, right); }

  _query(node, lo, hi, l, r) {
    if (r < lo || hi < l) return 0;             // ① 完全不相交:贡献 0
    if (l <= lo && hi <= r) return this.tree[node]; // ② 整段被包住:打包返回
    const mid = (lo + hi) >> 1;                 // ③ 部分相交:劈开递归
    return this._query(2 * node, lo, mid, l, r)
         + this._query(2 * node + 1, mid + 1, hi, l, r);
  }
}`,
            hl: [35, 36, 37, 38],
            note: (
              <>
                <code>(lo + hi) &gt;&gt; 1</code> 是整除 2 的位运算写法;JS 数字是浮点,
                大数组求和注意 2^53 的安全整数上限。
              </>
            ),
          }}
        />
        <Callout tone="deep" title="点到为止:线段树的深水区">
          <p>
            把代码里的 <code>+</code> 换成 <code>Math.max</code>,它就变成<b>区间最值树(RMQ)</b>
            —— 任何满足结合律的操作(和/最值/GCD/矩阵乘)都能挂上去,这是分治骨架的通用性。
            再往深是<b>懒标记(lazy propagation)</b>:“区间整体 +5”这类批量修改,
            先把标记贴在大节点上、真正用到孩子时才下推 —— 区间修改也降到 O(log n)。
            竞赛必修,面试少见,知道名字和思想即可。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 树状数组 ================= */}
      <Section
        id="bit"
        index="05"
        title="树状数组:lowbit 的位运算魔法"
        desc="Binary Indexed Tree / Fenwick Tree —— 15 行代码的轻量版线段树"
      >
        <div className="prose">
          <p>
            线段树好用,但几十行代码,比赛/面试里写完手都酸。如果需求只是
            <strong>“单点修改 + 前缀和查询”</strong>,有个 15 行的极简替身:
            <strong>树状数组(Binary Indexed Tree,又叫 Fenwick Tree)</strong>。
            它砍掉了线段树里“所有右孩子”的冗余,只留一个数组 <code>tree[1..n]</code>,
            规则一句话:<strong>tree[i] 管辖“以 i 结尾、长度为 lowbit(i)”的一段和</strong>。
          </p>
          <p>
            lowbit(i) = i 的二进制里<strong>最低位的 1</strong> 所代表的值。
            求它只要一个神奇的位运算:<code>lowbit(x) = x &amp; (-x)</code>。
            为什么?补码里 <code>-x = ~x + 1</code>:取反把最低位的 1 变成 0、其后全变 1,
            再 +1 时进位恰好停在原来那个 1 的位置 —— 于是两者按位与,只剩这一位。
            拿 6 验算:6 = 0110,-6 = 1010,按位与 = 0010 = 2 ✓。
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>i</th>
                <th>二进制</th>
                <th>lowbit(i)</th>
                <th>tree[i] 管辖的区间</th>
                <th>管多长</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono">1</td>
                <td className="mono">0001</td>
                <td className="mono">1</td>
                <td className="mono">[1, 1]</td>
                <td>1</td>
              </tr>
              <tr>
                <td className="mono">2</td>
                <td className="mono">0010</td>
                <td className="mono">2</td>
                <td className="mono">[1, 2]</td>
                <td>2</td>
              </tr>
              <tr>
                <td className="mono">3</td>
                <td className="mono">0011</td>
                <td className="mono">1</td>
                <td className="mono">[3, 3]</td>
                <td>1</td>
              </tr>
              <tr>
                <td className="mono">4</td>
                <td className="mono">0100</td>
                <td className="mono">4</td>
                <td className="mono">[1, 4]</td>
                <td>4</td>
              </tr>
              <tr>
                <td className="mono">5</td>
                <td className="mono">0101</td>
                <td className="mono">1</td>
                <td className="mono">[5, 5]</td>
                <td>1</td>
              </tr>
              <tr>
                <td className="mono">6</td>
                <td className="mono">0110</td>
                <td className="mono">2</td>
                <td className="mono">[5, 6]</td>
                <td>2</td>
              </tr>
              <tr>
                <td className="mono">7</td>
                <td className="mono">0111</td>
                <td className="mono">1</td>
                <td className="mono">[7, 7]</td>
                <td>1</td>
              </tr>
              <tr>
                <td className="mono">8</td>
                <td className="mono">1000</td>
                <td className="mono">8</td>
                <td className="mono">[1, 8]</td>
                <td>8</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            盯着这张表看出门道:<strong>i 的二进制越“整”(末尾 0 越多),管得越宽</strong>。
            查前缀和 a[1..7] 时,7 = 0111 = 4+2+1,恰好拆成 tree[7](管1个)+
            tree[6](管2个)+ tree[4](管4个)三段首尾相接、互不重叠的区间 ——
            <code>i -= lowbit(i)</code> 每次剥掉一个最低位 1,正是在做这个二进制拆分,
            最多拆 log n 次。修改则相反:<code>i += lowbit(i)</code>{" "}
            一路跳到所有“管得到我”的更大区间,同样 log n 次。精讲 B 的逐帧动画会走一遍全过程。
          </p>
        </div>
        <CodeTabs
          title="fenwick_tree"
          java={{
            code: `class BIT {
    private final int n;
    private final long[] tree;   // 下标 1..n,tree[0] 不用

    BIT(int n) {
        this.n = n;
        tree = new long[n + 1];
    }

    int lowbit(int x) { return x & (-x); }  // 取二进制最低位的 1

    void add(int i, long delta) {      // a[i] += delta(i 从 1 开始!)
        for (; i <= n; i += lowbit(i))
            tree[i] += delta;          // 一路向上:管到 i 的段全 +delta
    }

    long query(int i) {                // 前缀和 a[1..i]
        long s = 0;
        for (; i > 0; i -= lowbit(i))
            s += tree[i];              // 一路剥位:拼接互不重叠的管辖段
        return s;
    }

    long rangeSum(int l, int r) {      // 区间和 = 两次前缀和相减
        return query(r) - query(l - 1);
    }
}`,
            hl: [10, 13, 14, 20, 21],
            note: (
              <>
                <b>易错点:</b>BIT 是 <b>1-based</b> 的 —— lowbit(0) = 0 会让循环原地死转。
                题目给 0-based 下标时,进 BIT 前先 +1。
              </>
            ),
          }}
          python={{
            code: `class BIT:
    def __init__(self, n: int):
        self.n = n
        self.tree = [0] * (n + 1)   # 下标 1..n,tree[0] 不用

    def lowbit(self, x: int) -> int:
        return x & (-x)             # 取二进制最低位的 1

    def add(self, i: int, delta: int) -> None:
        while i <= self.n:          # a[i] += delta(i 从 1 开始!)
            self.tree[i] += delta   # 一路向上:管到 i 的段全 +delta
            i += self.lowbit(i)

    def query(self, i: int) -> int:  # 前缀和 a[1..i]
        s = 0
        while i > 0:
            s += self.tree[i]       # 一路剥位:拼接互不重叠的管辖段
            i -= self.lowbit(i)
        return s

    def range_sum(self, l: int, r: int) -> int:
        return self.query(r) - self.query(l - 1)`,
            hl: [7, 10, 11, 12],
            note: (
              <>
                Python 的负数也是补码语义,<code>x &amp; -x</code> 照常工作
                (整数无限精度,不用担心溢出)。
              </>
            ),
          }}
          js={{
            code: `class BIT {
  constructor(n) {
    this.n = n;
    this.tree = new Array(n + 1).fill(0); // 下标 1..n,tree[0] 不用
  }

  lowbit(x) { return x & (-x); }          // 取二进制最低位的 1

  add(i, delta) {                  // a[i] += delta(i 从 1 开始!)
    for (; i <= this.n; i += this.lowbit(i))
      this.tree[i] += delta;       // 一路向上:管到 i 的段全 +delta
  }

  query(i) {                       // 前缀和 a[1..i]
    let s = 0;
    for (; i > 0; i -= this.lowbit(i))
      s += this.tree[i];           // 一路剥位:拼接互不重叠的管辖段
    return s;
  }

  rangeSum(l, r) {                 // 区间和 = 两次前缀和相减
    return this.query(r) - this.query(l - 1);
  }
}`,
            hl: [7, 10, 11],
            note: (
              <>
                位运算在 JS 里按 32 位有符号整数进行 —— n 不超过 2^31
                时没问题,刷题场景完全够用。
              </>
            ),
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>对照</th>
                <th>线段树</th>
                <th>树状数组</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>码量</b></td>
                <td>约 50–60 行</td>
                <td>约 15 行 —— 手一热就写完</td>
              </tr>
              <tr>
                <td><b>常数 / 空间</b></td>
                <td>递归调用 + 4n 数组,常数较大</td>
                <td>纯循环 + n+1 数组,常数小、缓存友好</td>
              </tr>
              <tr>
                <td><b>能力范围</b></td>
                <td>区间和 / 最值 / GCD…任何结合律操作,懒标记支持区间修改</td>
                <td>主打前缀和(区间和 = 两次相减);最值/复杂合并做不了</td>
              </tr>
              <tr>
                <td><b>下标习惯</b></td>
                <td>0-based / 1-based 均可</td>
                <td>必须 1-based(lowbit(0)=0 死循环)</td>
              </tr>
              <tr>
                <td><b>选型口诀</b></td>
                <td colSpan={2}>需求只是“可修改的前缀和” → BIT;要最值/区间修改/花式合并 → 线段树</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ================= §06 跳表 ================= */}
      <Section
        id="skiplist"
        index="06"
        title="跳表:给链表修高速公路"
        desc="Skip List —— 抛硬币抛出来的 O(log n),Redis zset 的骨架"
      >
        <div className="prose">
          <p>
            第 3 章的老伤疤:<strong>有序链表</strong>查找是 O(n) ——
            明明数据有序,却不能像有序数组那样二分(第 1 章说过:二分需要 O(1)
            随机访问,链表没有)。只能一格一格 next,眼睁睁看着有序性被浪费。
          </p>
          <p>
            现实世界早就解过这道题:地铁。普通线每站都停;<strong>快线只停大站</strong>。
            从起点去第 87 站,先坐快线一路飞过大段区间,快到了再换普通线精确进站。
            跳表(skip list)照抄这个设计:<strong>底层 L0 是完整的有序链表,
            往上每层抽出约一半节点做“快线”</strong> —— 层数越高、站越少、一步越远。
            查找从最顶层出发:<strong>向右走,走过头就下楼</strong>,到 L0 时已经被
            夹到目标附近了:
          </p>
        </div>
        <SkipLab />
        <div className="prose">
          <p>
            每层节点数减半,层数约 log₂n;每层平均只前进 1–2 步(再多就说明上一层
            本可以多走一步),所以查找期望 <strong>O(log n)</strong>。n = 100 万时,
            普通链表平均走 50 万步,跳表约 20 步 —— 和二分、BST 一个量级,
            却保持了链表“插删只改指针”的优点。
          </p>
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="card-title">为什么用抛硬币决定层数?</div>
            <p>
              “上层严格隔一抽一”很完美,但<b>一次插入就会破坏它</b>:新节点挤进来,
              后面所有节点的“奇偶位置”全变,重建索引 O(n) —— 白玩。跳表的天才之处:
              新节点<b>抛硬币</b>定层数 —— 正面继续长高一层,反面停(每层晋升概率 1/2)。
              没人维护“精确隔一抽一”,但<b>概率上</b>每层就是下层的一半:期望层数
              1 + 1/2 + 1/4 + … = 2,n 个节点期望最高约 log₂n 层。
            </p>
          </div>
          <div className="card">
            <div className="card-title">概率直觉:为什么“平均”就够了?</div>
            <p>
              运气差到 100 个节点全抛出 10 层?概率是 (1/2)^10 的百次方级别,
              比连中十次彩票还难。随机化不承诺“永不变坏”,承诺的是“变坏的概率小到
              可以忽略” —— 快速排序随机选轴、哈希函数打散 key(第 6 章),
              都是同一门哲学:<b>用随机换掉昂贵的确定性维护</b>。
            </p>
          </div>
        </div>
        <Callout tone="deep" title="工程现场:Redis 的 zset 为什么选跳表,不选红黑树?">
          <p>
            两者查/插/删都是 O(log n),Redis 作者 antirez 给过三个理由:
            ① <b>实现简单一个量级</b> —— 红黑树的旋转 + 变色有十几种 case,跳表的插入
            就是“链表插入 × 层数”;② <b>范围操作天然顺滑</b> —— ZRANGE 取排名区间,
            跳表定位到起点后沿 L0 直接顺序走,红黑树要不停中序回溯;
            ③ 调试和改造容易(Redis 还在跳表节点上加了 span 字段做排名)。
            LevelDB/RocksDB 的内存写缓冲(MemTable)也用跳表 —— 还因为它对
            <b>无锁并发</b>友好:改几根指针比旋转整棵树容易做原子化。
          </p>
        </Callout>
        <div className="prose">
          <p>
            实现思路(LC 1206 原题):每个节点带一个 <code>next[]</code> 指针数组
            (第 i 格 = 它在第 i 层的下一站)。三个操作共用同一段“导航”逻辑 ——
            从顶层往下,每层向右贪心走到“再走就过头”为止,把每层的落脚点记进{" "}
            <code>update[]</code>;插入/删除就是在这些落脚点后面做普通的链表接线:
          </p>
        </div>
        <CodeTabs
          title="lc1206_skiplist"
          java={{
            code: `class Skiplist {
    static final int MAX_LEVEL = 16;    // 2^16 个节点内都够
    static final double P = 0.5;        // 每层晋升概率:抛硬币
    static final Random RAND = new Random();

    static class Node {
        int val;
        Node[] next;                    // next[i] = 第 i 层的下一站
        Node(int val, int level) { this.val = val; next = new Node[level]; }
    }

    private final Node head = new Node(-1, MAX_LEVEL);  // 哨兵头,拥有全部层
    private int level = 1;              // 当前实际用到的最高层

    private int randomLevel() {
        int lv = 1;
        while (RAND.nextDouble() < P && lv < MAX_LEVEL) lv++;  // 连赢就长高
        return lv;
    }

    public boolean search(int target) {
        Node cur = head;
        for (int i = level - 1; i >= 0; i--) {       // 从顶层开始
            while (cur.next[i] != null && cur.next[i].val < target)
                cur = cur.next[i];                   // 向右走,过头就停
            // 本层走不动了 → i-- 下楼
        }
        Node cand = cur.next[0];
        return cand != null && cand.val == target;
    }

    public void add(int num) {
        Node[] update = new Node[MAX_LEVEL];
        Arrays.fill(update, head);
        Node cur = head;
        for (int i = level - 1; i >= 0; i--) {
            while (cur.next[i] != null && cur.next[i].val < num)
                cur = cur.next[i];
            update[i] = cur;            // 记下每层"拐弯下楼"的落脚点
        }
        int lv = randomLevel();         // 抛硬币决定新节点的层数
        level = Math.max(level, lv);
        Node node = new Node(num, lv);
        for (int i = 0; i < lv; i++) {  // 逐层接线 = 普通链表插入 × lv 次
            node.next[i] = update[i].next[i];
            update[i].next[i] = node;
        }
    }

    public boolean erase(int num) {
        Node[] update = new Node[MAX_LEVEL];
        Arrays.fill(update, head);
        Node cur = head;
        for (int i = level - 1; i >= 0; i--) {
            while (cur.next[i] != null && cur.next[i].val < num)
                cur = cur.next[i];
            update[i] = cur;
        }
        cur = cur.next[0];
        if (cur == null || cur.val != num) return false;
        for (int i = 0; i < cur.next.length; i++)    // 每层把它绕过去
            if (update[i].next[i] == cur) update[i].next[i] = cur.next[i];
        return true;
    }
}`,
            hl: [15, 16, 17, 18, 19, 24, 25, 26],
            note: (
              <>
                search/add/erase 前半段一模一样(顶层往下、贪心右移)——
                看懂一个就看懂了全部。
              </>
            ),
          }}
          python={{
            code: `import random

MAX_LEVEL = 16      # 2^16 个节点内都够
P = 0.5             # 每层晋升概率:抛硬币

class Node:
    def __init__(self, val, level):
        self.val = val
        self.next = [None] * level      # next[i] = 第 i 层的下一站

class Skiplist:
    def __init__(self):
        self.head = Node(-1, MAX_LEVEL) # 哨兵头,拥有全部层
        self.level = 1                  # 当前实际用到的最高层

    def _random_level(self):
        lv = 1
        while random.random() < P and lv < MAX_LEVEL:
            lv += 1                     # 连赢就长高一层
        return lv

    def search(self, target: int) -> bool:
        cur = self.head
        for i in range(self.level - 1, -1, -1):   # 从顶层开始
            while cur.next[i] and cur.next[i].val < target:
                cur = cur.next[i]                 # 向右走,过头就停
            # 本层走不动了 → 循环 i-1,下楼
        cand = cur.next[0]
        return cand is not None and cand.val == target

    def add(self, num: int) -> None:
        update = [self.head] * MAX_LEVEL
        cur = self.head
        for i in range(self.level - 1, -1, -1):
            while cur.next[i] and cur.next[i].val < num:
                cur = cur.next[i]
            update[i] = cur             # 记下每层"拐弯下楼"的落脚点
        lv = self._random_level()       # 抛硬币决定新节点的层数
        self.level = max(self.level, lv)
        node = Node(num, lv)
        for i in range(lv):             # 逐层接线 = 普通链表插入 × lv 次
            node.next[i] = update[i].next[i]
            update[i].next[i] = node

    def erase(self, num: int) -> bool:
        update = [self.head] * MAX_LEVEL
        cur = self.head
        for i in range(self.level - 1, -1, -1):
            while cur.next[i] and cur.next[i].val < num:
                cur = cur.next[i]
            update[i] = cur
        cur = cur.next[0]
        if cur is None or cur.val != num:
            return False
        for i in range(len(cur.next)):  # 每层把它绕过去
            if update[i].next[i] is cur:
                update[i].next[i] = cur.next[i]
        return True`,
            hl: [16, 17, 18, 19, 20, 25, 26, 27],
            note: (
              <>
                <code>update = [self.head] * MAX_LEVEL</code> 存的是同一个 head
                的多个引用 —— 这里没问题,因为我们只替换元素、不改元素内容。
              </>
            ),
          }}
          js={{
            code: `const MAX_LEVEL = 16;   // 2^16 个节点内都够
const P = 0.5;          // 每层晋升概率:抛硬币

class SkipNode {
  constructor(val, level) {
    this.val = val;
    this.next = new Array(level).fill(null); // next[i] = 第 i 层的下一站
  }
}

class Skiplist {
  constructor() {
    this.head = new SkipNode(-1, MAX_LEVEL); // 哨兵头,拥有全部层
    this.level = 1;                          // 当前实际用到的最高层
  }

  _randomLevel() {
    let lv = 1;
    while (Math.random() < P && lv < MAX_LEVEL) lv++; // 连赢就长高
    return lv;
  }

  search(target) {
    let cur = this.head;
    for (let i = this.level - 1; i >= 0; i--) {  // 从顶层开始
      while (cur.next[i] && cur.next[i].val < target)
        cur = cur.next[i];                       // 向右走,过头就停
      // 本层走不动了 → i--,下楼
    }
    const cand = cur.next[0];
    return cand !== null && cand.val === target;
  }

  add(num) {
    const update = new Array(MAX_LEVEL).fill(this.head);
    let cur = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      while (cur.next[i] && cur.next[i].val < num) cur = cur.next[i];
      update[i] = cur;                 // 记下每层"拐弯下楼"的落脚点
    }
    const lv = this._randomLevel();    // 抛硬币决定新节点的层数
    this.level = Math.max(this.level, lv);
    const node = new SkipNode(num, lv);
    for (let i = 0; i < lv; i++) {     // 逐层接线 = 普通链表插入 × lv 次
      node.next[i] = update[i].next[i];
      update[i].next[i] = node;
    }
  }

  erase(num) {
    const update = new Array(MAX_LEVEL).fill(this.head);
    let cur = this.head;
    for (let i = this.level - 1; i >= 0; i--) {
      while (cur.next[i] && cur.next[i].val < num) cur = cur.next[i];
      update[i] = cur;
    }
    cur = cur.next[0];
    if (!cur || cur.val !== num) return false;
    for (let i = 0; i < cur.next.length; i++) {  // 每层把它绕过去
      if (update[i].next[i] === cur) update[i].next[i] = cur.next[i];
    }
    return true;
  }
}`,
            hl: [17, 18, 19, 20, 26, 27],
            note: (
              <>
                LC 1206 允许重复元素,本实现天然支持(插入不判重,删除只删一个)。
              </>
            ),
          }}
        />
        <Callout tone="story" title="一篇论文的标题就是宣言">
          <p>
            跳表出自 William Pugh 1990 年的论文,标题直白得可爱:
            <i>Skip Lists: A Probabilistic Alternative to Balanced Trees</i>
            (跳表:平衡树的概率替代品)。论文开篇即吐槽平衡树“实现起来令人生畏”——
            30 多年过去,Redis、LevelDB 用脚投票证明了他是对的:
            <b>够简单、够快,就是好设计</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 布隆过滤器 ================= */}
      <Section
        id="bloom"
        index="07"
        title="布隆过滤器:用误判换内存"
        desc="Bloom Filter —— 位数组 + K 个哈希函数,「一定不在」的艺术"
      >
        <div className="prose">
          <p>
            最后一台机器解决一个朴素到极致的问题:<strong>“这个东西我见过吗?”</strong>
            爬虫要判断 URL 是否抓过 —— 100 亿个 URL,每个平均 60 字节,
            用哈希集合(第 6 章)存要 600 GB 内存,还没算指针开销。存不下,怎么办?
          </p>
          <p>
            <strong>布隆过滤器(Bloom Filter)</strong>的答案狠辣:那就<strong>别存数据本身</strong>,
            只存“指纹”。一个 m 位的<strong>位数组(bit array)</strong>加 K 个不同的哈希函数
            (第 6 章的老朋友,一次雇 K 个):
          </p>
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="card-title">insert(x):盖 K 个章</div>
            <p>
              K 个哈希函数分别算出 K 个位置,把这些位<b>全部置 1</b>。
              不存 x 本身 —— 一个元素只花 K 个比特的“墨水”,而且位是全体元素共享的。
            </p>
          </div>
          <div className="card">
            <div className="card-title">query(x):验 K 个章</div>
            <p>
              重算那 K 个位置:<b>只要有一个位是 0 → x 一定没来过</b>
              (它来过的话这位必然是 1);<b>K 个位全是 1 → x 可能来过</b>
              —— 也可能是别的元素“凑巧”把这几位都点亮了。
            </p>
          </div>
        </div>
        <div className="prose">
          <p>
            注意这个不对称:回答只有<strong>“一定不在”</strong>和<strong>“可能在”</strong>两种。
            为什么误判是单向的?因为<strong>位只会从 0 变 1,从不清零</strong>:
            别的元素可以把你的位“顺手点亮”(制造<strong>假阳性 false positive</strong>),
            但没有任何操作能把已点亮的位熄灭 —— 所以<strong>绝不假阴性</strong>:
            说你不在,你就真的不在。亲手抓一次假阳性:
          </p>
        </div>
        <BloomLab />
        <div className="prose">
          <p>
            误判率能调。定性规律(定量公式属于超纲,记结论即可):
            <strong>位数组越大(m/n 越大),误判越低</strong> ——
            位没那么快被填满;<strong>哈希函数个数 K 有最优值</strong> ——
            太少,指纹只有一两个章,太容易撞;太多,每个元素占太多位,数组很快全亮,
            反而更容易误判。工程上按目标误判率查表定 m 和 K:比如每元素 10 个比特 +
            K=7,误判率约 1% —— 对比哈希集合每元素几百比特,内存省下一到两个数量级。
          </p>
        </div>
        <Callout tone="deep" title="工程现场:第一道门的哲学">
          <p>
            <b>爬虫去重</b>:100 亿 URL × 10 bit ≈ 12 GB,单机就装得下;
            误判 1% 只是漏抓极少数新页面,完全可接受。
            <b> 缓存穿透防护</b>:恶意请求疯狂查询“数据库里根本不存在的 key”,
            每次都击穿缓存打到数据库 —— 把全量 key 装进布隆过滤器挡在最前面,
            “一定不在”的请求直接拒绝,数据库毫发无伤。
            <b> 垃圾邮件 / 恶意网址</b>:黑名单太大放不进内存,布隆说“可能在黑名单”
            再去做昂贵的精确校验。共同套路:<b>放行的绝不冤枉(无假阴性),
            拦下的宁可错杀再复查(假阳性可控)</b>。
          </p>
        </Callout>
        <Callout tone="warn" title="两个经典易错点">
          <p>
            ① <b>标准布隆过滤器不支持删除</b>:一个位可能被多个元素共享,你把它清零,
            等于把别人也“注销”了(制造假阴性,破坏铁律)。要删除得用计数布隆过滤器
            (每位换成小计数器)或布谷鸟过滤器 —— 知道名字即可。
            ② <b>误判率会随插入量上涨</b>:设计容量 1000 万却塞了 1 亿,位数组几乎全亮,
            “可能在”变成“永远在”,过滤器名存实亡 —— 容量预估是使用前提。
          </p>
        </Callout>
        <Callout tone="story" title="1970 年的以小博大">
          <p>
            Burton Bloom 在 1970 年提出这个结构时,内存以 KB 计价 ——
            “牺牲一点点准确性,换几十倍内存”在当年是刚需。有意思的是 50 年后内存便宜了
            百万倍,布隆过滤器反而更红:数据规模涨得比内存更快,Redis、HBase、
            Cassandra、Chrome 里都有它。<b>好的权衡不过时,只会换舞台。</b>
          </p>
        </Callout>
      </Section>

      {/* ================= §08 精讲 ================= */}
      <Section
        id="featured"
        index="08"
        title="三道精讲:把机器拆开再装回去"
        desc="每道题 = 需求 → 为什么这样拼 → 逐帧 → 三语言题解 → 复杂度 → 追问"
        badge={<span className="chip" data-tone="warn">★ 面试核心</span>}
      >
        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 24 }}>
          <span className="sec-index">精讲 A</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 146 · LRU 缓存
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>实现容量固定的 LRU 缓存,get/put 均摊 O(1),满了淘汰最久未用。
            <b> 为什么这样拼:</b>§02 已经完整推导 —— 哈希表管“在哪”(O(1) 定位)、
            双向链表管“多旧”(O(1) 摘插),两个 O(n) 短板互相补齐;完整手写实现也在
            §02。这里先用官方样例把执行过程逐帧过一遍,再补上面试“省时间”的快写版:
          </p>
        </div>
        <ArrayStepper title="LC 146 · 容量 2,官方样例逐帧(格子 = 链表头→尾)" frames={F146} cellW={72} />
        <CodeTabs
          title="lc146_quick_version"
          java={{
            code: `// 快写版 = §02 彩蛋的 LinkedHashMap(内部就是哈希 + 双向链表)
class LRUCache extends LinkedHashMap<Integer, Integer> {
    private final int cap;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);   // accessOrder=true:按访问序
        this.cap = capacity;
    }

    public int get(int key) {
        return super.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        super.put(key, value);
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> e) {
        return size() > cap;            // 超容量自动淘汰最老条目
    }
}`,
            hl: [6, 19, 20],
            note: (
              <>
                面试策略:先问“能否用标准库”。让手写就写 §02 完整版;
                允许用库就写这个,并主动讲出它内部的双结构原理。
              </>
            ),
          }}
          python={{
            code: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.od = OrderedDict()   # 内部实现:哈希表 + 双向链表(眼熟吗?)

    def get(self, key: int) -> int:
        if key not in self.od:
            return -1
        self.od.move_to_end(key)  # 搬到"最新"端,O(1)
        return self.od[key]

    def put(self, key: int, value: int) -> None:
        if key in self.od:
            self.od.move_to_end(key)
        self.od[key] = value
        if len(self.od) > self.cap:
            self.od.popitem(last=False)  # 弹出"最旧"端,O(1)`,
            hl: [11, 19],
            note: (
              <>
                <code>move_to_end</code> / <code>popitem(last=False)</code>{" "}
                正是我们手写的 moveToHead / 淘汰尾节点 —— CPython 用 C 实现,更快。
              </>
            ),
          }}
          js={{
            code: `class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();   // Map 记住插入顺序:最先 set 的排最前
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const v = this.map.get(key);
    this.map.delete(key);   // 删了再插 = 搬到"最新"端
    this.map.set(key, v);
    return v;
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.cap) {
      const oldest = this.map.keys().next().value; // 迭代器第一个 = 最旧
      this.map.delete(oldest);
    }
  }
}`,
            hl: [10, 11, 19, 20],
            note: (
              <>
                V8 的 Map 内部同样是“哈希表 + 按插入序的链式结构”,delete+set
                都是 O(1) —— 原理与手写版完全同构。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 面试追问">
          <p>
            get/put 时间 <b>O(1)</b>,空间 O(capacity)。高频追问:
            ①“为什么必须双向链表?”(摘除需要前驱,§02 排除法第 4 步);
            ②“节点里为什么要存 key?”(淘汰尾节点时反查哈希表删条目);
            ③“多线程安全怎么做?”(整体加锁最简单;进阶答分段锁或像 Redis 那样
            单线程事件循环回避问题);④“容量非常大怎么办?”(近似 LRU 采样淘汰,
            省掉链表 —— Redis 的做法)。
          </p>
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 B</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 307 · 区域和检索 - 数组可修改
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>update(i, val) 单点改值,sumRange(l, r) 查区间和,两者交替出现。
            <b> 为什么这样拼:</b>前缀和查 O(1) 但改 O(n),裸数组改 O(1) 但查 O(n)
            —— 交替出现时两个极端都会被打爆,必须找“双 log”的折中,正是 §04 线段树
            与 §05 树状数组的主场。<b>逐帧:</b>线段树的路径动画在 §04 实验室里玩过了,
            这里走一遍 BIT 版 —— 看 lowbit 怎么在 tree 数组上跳:
          </p>
        </div>
        <ArrayStepper title="LC 307 · BIT 版:add(3,+2) 上行三跳 + query(7) 下行三跳" frames={F307} cellW={60} />
        <CodeTabs
          title="lc307_fenwick_solution"
          java={{
            code: `class NumArray {
    private final int n;
    private final int[] a;      // 原数组:update 要算差值
    private final int[] tree;   // 树状数组(1-based)

    public NumArray(int[] nums) {
        n = nums.length;
        a = new int[n];
        tree = new int[n + 1];
        for (int i = 0; i < n; i++) update(i, nums[i]); // 逐个 add 建树
    }

    public void update(int index, int val) {
        int delta = val - a[index];   // BIT 只会"加",先算增量!
        a[index] = val;
        for (int i = index + 1; i <= n; i += i & (-i))
            tree[i] += delta;         // 0-based 题面 → 1-based BIT
    }

    private int prefix(int i) {       // a[0..i-1] 的和
        int s = 0;
        for (; i > 0; i -= i & (-i)) s += tree[i];
        return s;
    }

    public int sumRange(int left, int right) {
        return prefix(right + 1) - prefix(left);  // 两次前缀和相减
    }
}`,
            hl: [14, 15, 16, 17],
            note: (
              <>
                <b>易错点:</b>update 给的是“新值”而不是“增量”,直接把 val 加进去必错
                —— 先 <code>delta = val − a[i]</code> 再落盘。
              </>
            ),
          }}
          python={{
            code: `class NumArray:
    def __init__(self, nums: list[int]):
        self.n = len(nums)
        self.a = [0] * self.n           # 原数组:update 要算差值
        self.tree = [0] * (self.n + 1)  # 树状数组(1-based)
        for i, v in enumerate(nums):
            self.update(i, v)           # 逐个 add 建树,O(n log n)

    def update(self, index: int, val: int) -> None:
        delta = val - self.a[index]     # BIT 只会"加",先算增量!
        self.a[index] = val
        i = index + 1                   # 0-based 题面 → 1-based BIT
        while i <= self.n:
            self.tree[i] += delta
            i += i & (-i)

    def _prefix(self, i: int) -> int:   # a[0..i-1] 的和
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= i & (-i)
        return s

    def sumRange(self, left: int, right: int) -> int:
        return self._prefix(right + 1) - self._prefix(left)`,
            hl: [10, 11, 12],
            note: (
              <>
                建树还有 O(n) 的花式写法(先抄前缀和再相减),刷题用逐个 add
                的 O(n log n) 足够。
              </>
            ),
          }}
          js={{
            code: `class NumArray {
  constructor(nums) {
    this.n = nums.length;
    this.a = new Array(this.n).fill(0);    // 原数组:update 要算差值
    this.tree = new Array(this.n + 1).fill(0); // 树状数组(1-based)
    nums.forEach((v, i) => this.update(i, v)); // 逐个 add 建树
  }

  update(index, val) {
    const delta = val - this.a[index];  // BIT 只会"加",先算增量!
    this.a[index] = val;
    for (let i = index + 1; i <= this.n; i += i & (-i))
      this.tree[i] += delta;            // 0-based 题面 → 1-based BIT
  }

  _prefix(i) {                          // a[0..i-1] 的和
    let s = 0;
    for (; i > 0; i -= i & (-i)) s += this.tree[i];
    return s;
  }

  sumRange(left, right) {
    return this._prefix(right + 1) - this._prefix(left);
  }
}`,
            hl: [10, 11, 12, 13],
            note: (
              <>
                线段树版解法在 §04 —— 两版都能 AC,BIT 版不到一半的代码量。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 面试追问">
          <p>
            两版 update/query 都是 <b>O(log n)</b>;BIT 空间 n+1、线段树 4n。追问:
            ①“什么时候必须线段树?”(区间最值、区间整体修改、复杂合并 —— BIT 做不了);
            ②“二维怎么办?”(LC 304 不可变用二维前缀和;可变就套二维 BIT,双重 lowbit
            循环);③“为什么 BIT 的 update 要先算 delta?”(BIT 的原语是“加”,
            不是“赋值” —— 树里存的是段和,没法直接覆盖)。
          </p>
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 C</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 380 · O(1) 时间插入、删除和获取随机元素
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>设计一个集合,insert / remove / getRandom(等概率随机返回一个成员)
            全部 O(1)。哈希章你可能见过它 —— 这次用 §01 的<b>组合方法论</b>重新推一遍:
            列需求 → 单结构逐个卡壳 → 组合补短板。<b>排除:</b>只用哈希集合,insert/remove
            是 O(1) 了,但 getRandom 卡死 —— 哈希表内部布满空桶,“等概率随机挑一个成员”
            做不到 O(1)(随机探桶可能连续踩空)。只用数组,getRandom 完美(随机下标),
            但 remove 要先找到值(O(n))再补洞(O(n))。<b>组合:</b>数组存值(管随机),
            哈希表存 <code>值 → 下标</code>(管定位)—— 还差一步:数组中间删除要搬家?
            用第 1 章的老朋友“换到末尾再删”破解:
          </p>
        </div>
        <ArrayStepper title="LC 380 · 数组 + 哈希,swap-with-last 逐帧" frames={F380} />
        <CodeTabs
          title="lc380_randomized_set"
          java={{
            code: `class RandomizedSet {
    private final List<Integer> arr = new ArrayList<>();   // 值紧凑排一排
    private final Map<Integer, Integer> idx = new HashMap<>(); // 值 -> 下标
    private final Random rand = new Random();

    public boolean insert(int val) {
        if (idx.containsKey(val)) return false;
        idx.put(val, arr.size());    // 记住新值住在哪
        arr.add(val);                // 尾部追加,均摊 O(1)
        return true;
    }

    public boolean remove(int val) {
        Integer i = idx.get(val);
        if (i == null) return false;
        int last = arr.get(arr.size() - 1);
        arr.set(i, last);            // 末尾元素补到被删的位置
        idx.put(last, i);            // 同步更新它的下标!
        arr.remove(arr.size() - 1);  // 尾删 O(1)
        idx.remove(val);
        return true;
    }

    public int getRandom() {
        return arr.get(rand.nextInt(arr.size())); // 随机下标 = 严格等概率
    }
}`,
            hl: [16, 17, 18, 19],
            note: (
              <>
                <b>易错点:</b>先 <code>idx.put(last, i)</code> 再删 val 的条目 ——
                如果删的恰好是末尾元素,顺序反了会把刚更新的条目又删掉
                (这个写法两步互不干扰,天然安全)。
              </>
            ),
          }}
          python={{
            code: `import random

class RandomizedSet:
    def __init__(self):
        self.arr = []       # 值紧凑排一排(getRandom 的资本)
        self.idx = {}       # 值 -> 它在数组里的下标

    def insert(self, val: int) -> bool:
        if val in self.idx:
            return False
        self.idx[val] = len(self.arr)   # 记住新值住在哪
        self.arr.append(val)            # 尾部追加,均摊 O(1)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.idx:
            return False
        i, last = self.idx[val], self.arr[-1]
        self.arr[i] = last              # 末尾元素补到被删的位置
        self.idx[last] = i              # 同步更新它的下标!
        self.arr.pop()                  # 尾删 O(1)
        del self.idx[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self.arr)  # 随机下标 = 严格等概率`,
            hl: [18, 19, 20, 21],
            note: (
              <>
                删除末尾元素自身时,<code>self.arr[i] = last</code> 是自己赋给自己、
                <code>idx[last] = i</code> 又被下一行 <code>del</code> 掉 —— 边界自动成立。
              </>
            ),
          }}
          js={{
            code: `class RandomizedSet {
  constructor() {
    this.arr = [];          // 值紧凑排一排(getRandom 的资本)
    this.idx = new Map();   // 值 -> 它在数组里的下标
  }

  insert(val) {
    if (this.idx.has(val)) return false;
    this.idx.set(val, this.arr.length); // 记住新值住在哪
    this.arr.push(val);                 // 尾部追加,均摊 O(1)
    return true;
  }

  remove(val) {
    if (!this.idx.has(val)) return false;
    const i = this.idx.get(val);
    const last = this.arr[this.arr.length - 1];
    this.arr[i] = last;                 // 末尾元素补到被删的位置
    this.idx.set(last, i);              // 同步更新它的下标!
    this.arr.pop();                     // 尾删 O(1)
    this.idx.delete(val);
    return true;
  }

  getRandom() {
    const i = Math.floor(Math.random() * this.arr.length);
    return this.arr[i];                 // 随机下标 = 严格等概率
  }
}`,
            hl: [17, 18, 19, 20],
            note: (
              <>
                三行核心:补位、改哈希、尾删 —— 顺序背下来,这个 trick
                在很多“O(1) 删除”场景里通用。
              </>
            ),
          }}
        />
        <Callout tone="win" title="复杂度 & 面试追问">
          <p>
            三个操作全 <b>O(1)</b>(insert 均摊),空间 O(n)。追问:①“允许重复元素呢?”
            (LC 381:哈希表的 value 改成“下标集合”,交换时小心同值;难度陡增,值得一做);
            ②“为什么哈希表单独做不了 getRandom?”(桶数组有空洞,等概率抽样要么 O(容量)
            扫描、要么拒绝采样无上界);③“getRandom 等概率怎么证明?”(数组无空洞,
            每个下标被选中概率恰为 1/size)。注意这道题和 LRU 的共同气质:
            <b>组合的每个成员各买一个 O(1),互相把对方的短板焊死</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §09 题单 ================= */}
      <Section
        id="problems"
        index="09"
        title="高频题单:组合机器 8 题"
        desc="由易到难。先做 303 和 307 的对照组,再啃三道 Hard —— 全书最后一批题"
        badge={<span className="chip">压轴题单</span>}
      >
        <ProblemSet ch="advanced" items={PROBLEMS} />
      </Section>

      {/* ================= §10 Quiz ================= */}
      <Section
        id="quiz"
        index="10"
        title="通关测验"
        desc="7 题全对,点亮全书最后一盏绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="advanced" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            <b>组合设计方法论:先列出全部操作和每个操作的复杂度预算,再挑互补的基础结构拼装</b>
            —— 每个成员只干自己 O(1)/O(log n) 的绝活,并用「互相指认 + 同步更新」焊牢接缝。
          </>,
          <>
            LRU = 哈希表(管「在哪」)+ 双向链表(管「多旧」),get/put 全 O(1)。
            <b>必须双向</b>:摘除节点要改前驱的 next,单链表拿不到前驱;节点里要存 key,
            淘汰时才能反查哈希表。
          </>,
          <>
            区间统计三段论:<b>只查不改 → 前缀和 O(1);又改又查 → 线段树/树状数组双
            O(log n)</b>。线段树功能全(最值/懒标记),BIT 靠 <code>lowbit = x &amp; (−x)</code>{" "}
            十五行搞定前缀和,1-based 别忘了。
          </>,
          <>
            跳表 = 有序链表 + <b>抛硬币长出来的多层索引</b>:期望 O(log n),
            用随机化免去平衡树的旋转维护 —— Redis zset(跳表 + 哈希)与 LevelDB
            MemTable 的骨架。
          </>,
          <>
            布隆过滤器 = 位数组 + K 个哈希:<b>说「不在」就一定不在,说「在」只是可能在</b>
            (位只会 0→1,假阳性单向)—— 用可控误判换一到两个数量级的内存,
            适合做爬虫去重、缓存穿透的第一道门。
          </>,
          <>
            这五台机器没有一块新积木 —— 数组、链表、哈希、树、位运算全部来自前 12 章。
            <b>面试设计题的正确做法:先复述操作需求和复杂度目标,再报出结构组合,
            最后主动指出接缝处的同步细节</b>。到这一步,你已经不需要再看任何其他资料了。
          </>,
        ]}
      />

      <ChapterFooter ch="advanced" />
    </main>
  );
}
