"use client";

// 第 6 章 · 哈希表 —— 全书的「空间换时间」代表作。
// 结构:为什么 → 哈希函数(HashLab)→ 冲突解决(CollisionLab)→ 手写 HashMap →
// 三语言对照(hashCode/equals 契约、dict 顺序、Map vs Object)→
// 三大信号 + 三道精讲(LC 1 / 49 / 128,逐帧)→ 题单 10 题 → 测验 8 题。

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
import { PROBLEMS, QUIZ } from "@/lib/hash-data";
import { HashLab, CollisionLab } from "./viz";
import "./chapter.css";

/* ================= 精讲动画帧 ================= */

// LC 1 两数之和:一遍哈希,先查表再存表。nums = [11,2,15,7],target = 9
const F1: ArrayFrame[] = [
  {
    cells: [{ v: 11 }, { v: 2 }, { v: 15 }, { v: 7 }],
    msg: (
      <>
        target = 9。准备一张空表 map(值 → 下标)。策略:每个数<b>先查</b>
        「我的另一半来过吗」,<b>再把自己登记进表</b>。
      </>
    ),
  },
  {
    cells: [{ v: 11, state: "lit" }, { v: 2 }, { v: 15 }, { v: 7 }],
    ptrs: [{ i: 0, label: "i" }],
    msg: (
      <>
        i=0,v=11:需要 9−11=<b>−2</b>。查表:没有 → 登记 11。map = {"{11:0}"}
      </>
    ),
  },
  {
    cells: [{ v: 11 }, { v: 2, state: "lit" }, { v: 15 }, { v: 7 }],
    ptrs: [{ i: 1, label: "i" }],
    msg: (
      <>
        i=1,v=2:需要 9−2=<b>7</b>。查表:没有 → 登记 2。map ={" "}
        {"{11:0, 2:1}"}
      </>
    ),
  },
  {
    cells: [{ v: 11 }, { v: 2 }, { v: 15, state: "lit" }, { v: 7 }],
    ptrs: [{ i: 2, label: "i" }],
    msg: (
      <>
        i=2,v=15:需要 <b>−6</b>。没有 → 登记 15。map = {"{11:0, 2:1, 15:2}"}
      </>
    ),
  },
  {
    cells: [{ v: 11 }, { v: 2, state: "ok" }, { v: 15 }, { v: 7, state: "ok" }],
    ptrs: [{ i: 3, label: "i" }],
    msg: (
      <>
        i=3,v=7:需要 9−7=<b>2</b>。查表:<b>有!</b>2 的下标是 1 → 答案
        [1, 3]。每个数只被处理一次:查 O(1) + 存 O(1),整趟 <b>O(n)</b>。
      </>
    ),
  },
];

// LC 49 字母异位词分组:排序签名做 key
const W49 = ["eat", "tea", "tan", "ate", "nat", "bat"];
const c49 = (
  states: (undefined | "lit" | "ok" | "bad" | "ghost")[],
): ArrayFrame["cells"] => W49.map((w, i) => ({ v: w, state: states[i] }));
const F49: ArrayFrame[] = [
  {
    cells: c49([undefined, undefined, undefined, undefined, undefined, undefined]),
    msg: (
      <>
        异位词的特征:字母一样、顺序不同。给每个词一个<b>签名</b>:
        把字母排序 —— eat / tea / ate 排序后都是 &quot;aet&quot;。签名做
        key,词进对应的组。
      </>
    ),
  },
  {
    cells: c49(["lit", undefined, undefined, undefined, undefined, undefined]),
    msg: (
      <>
        &quot;eat&quot; → 签名 <b>&quot;aet&quot;</b>:表里没有这个组,新建。
        map = {"{aet: [eat]}"}
      </>
    ),
  },
  {
    cells: c49(["ok", "lit", undefined, undefined, undefined, undefined]),
    msg: (
      <>
        &quot;tea&quot; → 签名 <b>&quot;aet&quot;</b>:组已存在,直接加入!
        map = {"{aet: [eat, tea]}"}
      </>
    ),
  },
  {
    cells: c49(["ok", "ok", "lit", undefined, undefined, undefined]),
    msg: (
      <>
        &quot;tan&quot; → 签名 <b>&quot;ant&quot;</b>:新组。map ={" "}
        {"{aet: […], ant: [tan]}"}
      </>
    ),
  },
  {
    cells: c49(["ok", "ok", "ok", "lit", undefined, undefined]),
    msg: (
      <>
        &quot;ate&quot; → 签名 <b>&quot;aet&quot;</b>:加入 eat 那组。三个异位词,
        在哈希表里「自动相遇」了。
      </>
    ),
  },
  {
    cells: c49(["ok", "ok", "ok", "ok", "lit", undefined]),
    msg: (
      <>
        &quot;nat&quot; → 签名 <b>&quot;ant&quot;</b>:加入 tan 那组。
      </>
    ),
  },
  {
    cells: c49(["ok", "ok", "bad", "ok", "bad", "lit"]),
    msg: (
      <>
        &quot;bat&quot; → 签名 <b>&quot;abt&quot;</b>:新组。最终三组:[eat, tea,
        ate]、[tan, nat]、[bat]。<b>好签名 = 同组必相同、异组必不同</b>。
      </>
    ),
  },
];

// LC 128 最长连续序列:Set + 只从起点数
const N128 = [100, 4, 200, 1, 3, 2];
const c128 = (
  states: (undefined | "lit" | "ok" | "bad" | "ghost")[],
): ArrayFrame["cells"] => N128.map((v, i) => ({ v, state: states[i] }));
const F128: ArrayFrame[] = [
  {
    cells: c128([undefined, undefined, undefined, undefined, undefined, undefined]),
    msg: (
      <>
        第一步:全部丢进 Set = {"{100, 4, 200, 1, 3, 2}"}。从此「x 在不在」
        只要 O(1)。目标:最长连续序列(数值连续,位置无所谓)。
      </>
    ),
  },
  {
    cells: c128(["lit", undefined, undefined, undefined, undefined, undefined]),
    msg: (
      <>
        检查 100:<b>99 不在 Set</b> → 100 是某条序列的<b>起点</b>!向右数:101
        不在 → 这条序列长度 1。
      </>
    ),
  },
  {
    cells: c128([undefined, "ghost", undefined, undefined, undefined, undefined]),
    msg: (
      <>
        检查 4:<b>3 在 Set</b> → 4 不是起点,<b>直接跳过</b>。
        它属于别人的序列,等起点来数它 —— 这一步就是不做重复劳动的关键。
      </>
    ),
  },
  {
    cells: c128([undefined, undefined, "lit", undefined, undefined, undefined]),
    msg: (
      <>
        检查 200:199 不在 → 起点;201 不在 → 长度 1。
      </>
    ),
  },
  {
    cells: c128([undefined, undefined, undefined, "lit", undefined, undefined]),
    msg: (
      <>
        检查 1:<b>0 不在 Set</b> → 起点!开始向右数:2 在……
      </>
    ),
  },
  {
    cells: c128([undefined, undefined, undefined, "lit", undefined, "ok"]),
    msg: <>2 在 Set → 长度 2;继续问 3……</>,
  },
  {
    cells: c128([undefined, undefined, undefined, "lit", "ok", "ok"]),
    msg: <>3 在 Set → 长度 3;继续问 4……</>,
  },
  {
    cells: c128([undefined, "ok", undefined, "lit", "ok", "ok"]),
    msg: (
      <>
        4 在 Set → 长度 4;5 不在,停。序列 [1,2,3,4],长度 <b>4</b> ——
        就是答案。剩下的 3、2 因为「不是起点」直接跳过。
      </>
    ),
  },
  {
    cells: c128(["ok", "ok", "ok", "ok", "ok", "ok"]),
    msg: (
      <>
        为什么是 O(n)?每个数最多被摸两次:一次「起点检查」、一次被某个起点
        「向右数到」。总工作量 ≤ 2n —— 内层 while 只是把账<b>记在了别人头上</b>,
        不是重复劳动。
      </>
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: "直觉" },
  { id: "hashfn", n: "02", label: "哈希函数" },
  { id: "collision", n: "03", label: "冲突解决" },
  { id: "impl", n: "04", label: "手写实现" },
  { id: "langs", n: "05", label: "三语言对照" },
  { id: "patterns", n: "06", label: "套路与精讲" },
  { id: "problems", n: "07", label: "高频题单" },
  { id: "quiz", n: "08", label: "通关测验" },
];

export default function HashChapter() {
  return (
    <main className="page" data-ch="hash">
      <Hero
        ch="hash"
        title={
          <>
            哈希表 <span className="grad">Hash Table</span>
          </>
        }
        essence={
          <>
            数组的 O(1) 只认下标,哈希表把这份超能力送给了<strong>任何东西</strong>:
            把 key 算成下标,拿钥匙直接开门 —— 代价是一场与「冲突」的永恒周旋。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 直觉 ================= */}
      <Section
        id="intuition"
        index="01"
        title="直觉:查字典的两种方式"
        desc="从「逐页翻」到「按拼音直达」—— 哈希表是给一切数据发门牌号"
      >
        <div className="prose">
          <p>
            想在一本字典里找「哈」字,有两种查法。第一种:从第一页开始逐页翻,
            翻到为止 —— 这是数组的线性查找,<strong>O(n)</strong>,字典越厚越慢。
            第二种:按拼音 ha 去索引区一跳,直达那一页 ——
            无论字典一千页还是一万页,动作几乎一样快。第二种查法的本质是:
            <strong>「哈」这个字本身,经过一套固定规则(拼音),变成了一个位置</strong>。
          </p>
          <p>
            回想数组的超能力:给下标,O(1) 直达。但下标必须是 0、1、2……
            这样的小整数。现在做个大胆的推广:
            <strong>如果任何东西 —— 字符串、对象、坐标 —— 都能「变成」一个下标呢?</strong>
            那任何东西都能享受 O(1) 直达。这个「变成」的过程就叫
            <strong>哈希(hash)</strong>,整套装置就是
            <strong>哈希表(hash table / 散列表)</strong>。
            它不是新的存储方式,而是<b>数组 + 一个聪明的翻译官</b>。
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">PART 01</div>
            <div className="card-title">🔮 哈希函数</div>
            <p>
              翻译官:把任意 key 变成固定范围内的整数。同一个 key
              永远翻译出同一个数 —— 不然存进去就找不回来了。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">PART 02</div>
            <div className="card-title">🗄️ 桶数组</div>
            <p>
              真正存东西的地方:一个普通数组,每个格子叫一个「桶(bucket)」。
              哈希函数的输出就是桶的下标 —— O(1) 直达全靠数组这条老底。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">PART 03</div>
            <div className="card-title">💥 冲突处理</div>
            <p>
              无限多的 key 挤进有限个桶,撞车(不同 key 同一桶)在数学上
              <b>必然发生</b>。链地址、开放寻址 —— 一半的工程智慧都花在这里。
            </p>
          </div>
        </div>
        <Callout tone="story" title="你今天已经用过一百次哈希表了">
          <p>
            每个变量名到内存地址的解析(Python 的命名空间就是 dict)、
            浏览器缓存按 URL 找文件、数据库索引、Redis 的整个存在、
            Git 用内容哈希命名每一次提交…… 「用名字直达内容」的地方,
            背后几乎都站着一张哈希表。它大概是继数组之后,人类使用最频繁的数据结构。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 哈希函数 ================= */}
      <Section
        id="hashfn"
        index="02"
        title="哈希函数:把任何东西变成下标"
        desc="一台「绞肉机」:进去的是任意 key,出来的是固定范围的整数"
      >
        <div className="prose">
          <p>
            <strong>哈希函数(hash function)</strong>接受任意 key,吐出一个整数。
            听起来自由,其实有三条铁律 —— 每一条背后都是一个「不然会怎样」:
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>要求</th>
                <th>含义</th>
                <th>不满足会怎样</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>确定性</b></td>
                <td>同一个 key,任何时候算出同一个值</td>
                <td>存的时候进 3 号桶,取的时候算出 5 号桶 —— 数据永久失联</td>
              </tr>
              <tr>
                <td><b>均匀性</b></td>
                <td>不同 key 尽量平摊到所有桶</td>
                <td>全挤进少数桶,桶内排长队,O(1) 退化成 O(n)</td>
              </tr>
              <tr>
                <td><b>快</b></td>
                <td>计算本身接近 O(1)</td>
                <td>查找省下的时间全花在算哈希上,得不偿失</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            字符串怎么变成数?最经典的做法是<strong>多项式滚动哈希</strong>:
            把每个字符的编码乘上不同的权重再相加,权重按 31 的幂次递减。
            以 <code>&quot;cat&quot;</code> 为例(c=99、a=97、t=116):
          </p>
          <p style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 15 }}>
            hash(&quot;cat&quot;) = 99 × 31² + 97 × 31 + 116 = 95139 + 3007 + 116 ={" "}
            <b>98262</b>
          </p>
          <p>
            为什么不用「字符编码直接相加」?因为那样 <code>&quot;cat&quot;</code> 和{" "}
            <code>&quot;act&quot;</code>(同字母不同序)会得到相同的哈希 ——
            乘以 31 的幂次让<strong>位置也参与运算</strong>,顺序一变结果就变。
            写成循环就是一行:<code>h = h × 31 + code(c)</code>,逐字符滚动累积。
            最后一步,把这个大数对桶数取模(mod),压进合法下标范围。亲手转一转这台机器:
          </p>
        </div>
        <HashLab />
        <Callout tone="deep" title="为什么偏偏是 31?—— Java String.hashCode 的选择">
          <p>
            31 是奇素数:乘出来的结果分布更散,不容易和桶数(常为 2 的幂)产生公因子共振;
            而且 <code>31 × i = (i &lt;&lt; 5) − i</code>,一次移位一次减法,老 JVM
            上就能优化成极快的指令。你刚才在实验室里看到的 Aa 和 BB 撞车不是 bug ——
            它们在 Java 里的 hashCode 都是 2112,是面试里演示「冲突必然存在」的经典例子:
            无限多的字符串、只有 2³² 个 int,<b>抽屉原理保证必有两个 key 同哈希</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 冲突解决 ================= */}
      <Section
        id="collision"
        index="03"
        title="冲突解决:两个 key 撞进同一个桶怎么办"
        desc="冲突不可避免,可避免的是「冲突把性能拖垮」"
      >
        <div className="prose">
          <p>
            方案一:<strong>链地址法(separate chaining)</strong> ——
            每个桶挂一条链表,撞了就往链上接。查找时先哈希定位桶,再沿链逐个比对
            key。Java 的 HashMap、我们 §04 手写的版本都是它。方案二:
            <strong>开放寻址(open addressing)</strong> —— 每个桶只放一个元素,
            撞了就按固定规则找别的空桶,最简单的规则是「往右一格格试」,叫
            <strong>线性探测(linear probing)</strong>。Python 的 dict、Go 的 map
            走这条路(缓存更友好:探测的下一格往往就在同一条缓存行里)。
            两种策略,同一批数据,亲眼对比:
          </p>
        </div>
        <CollisionLab />
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-title">链地址法:Java 8 的树化彩蛋</div>
            <p>
              极端情况下某条链可能特别长(被攻击或哈希太差)。Java 8 起,单条链长超过
              <b> 8</b>(且总桶数 ≥ 64)就把链表换成红黑树,查找从 O(n) 降到
              O(log n)。为什么阈值是 8?均匀哈希下链长服从泊松分布,长到 8
              的概率约千万分之六 —— 正常情况几乎不会触发,它纯粹是给恶意输入
              (HashDoS 攻击)准备的保险丝。
            </p>
          </div>
          <div className="card">
            <div className="card-title">开放寻址:删除的墓碑问题</div>
            <p>
              线性探测里不能直接把元素删成空位 —— 否则后面靠探测住进来的元素会
              「断路」找不到了。做法是放一块<b>墓碑(tombstone)</b>标记
              「这里曾经有人」,查找继续往后走、插入可以复用。一句话记住:
              开放寻址的删除是「假删」,墓碑多了还得重建整张表。
            </p>
          </div>
        </div>
        <div className="prose" style={{ marginTop: 18 }}>
          <p>
            桶越满,冲突越频繁。衡量「满」的指标叫
            <strong>负载因子(load factor)= 已存元素数 ÷ 桶数</strong>。
            Java HashMap 默认超过 <b>0.75</b> 就触发<strong>扩容(rehash)</strong>:
            桶数翻倍,然后 —— 注意 —— <strong>所有元素重新计算桶位、全部搬家</strong>。
            为什么不能像动态数组那样直接拷过去?因为定位靠的是{" "}
            <code>hash % 桶数</code>:桶数从 8 变 16,98262 % 8 = 6 但 98262 % 16 =
            6 或 14 —— <b>mod 的除数变了,答案就变了</b>,老位置全部作废。
            为什么是 0.75?再高,平均链长上升、O(1) 开始注水;再低,大片桶空着浪费内存
            —— 四分之三是工程实测的甜点位。
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>操作</th>
                <th>平均</th>
                <th>最坏</th>
                <th>为什么</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>插入 put</b></td>
                <td><BigO o="1" /></td>
                <td><BigO o="n" /></td>
                <td>平均:哈希直达 + 短链;最坏:全部 key 挤一桶成长链(或恰逢扩容搬家)</td>
              </tr>
              <tr>
                <td><b>查找 get / 包含</b></td>
                <td><BigO o="1" /></td>
                <td><BigO o="n" /></td>
                <td>同上 —— 「平均 O(1)」的前提是哈希均匀 + 负载因子受控,两个前提都是人为维护的</td>
              </tr>
              <tr>
                <td><b>删除 remove</b></td>
                <td><BigO o="1" /></td>
                <td><BigO o="n" /></td>
                <td>定位同查找;链上摘节点 / 放墓碑本身 O(1)</td>
              </tr>
              <tr>
                <td><b>遍历</b></td>
                <td colSpan={2}><BigO o="n" label="O(n + 桶数)" /></td>
                <td>要扫过所有桶(包括空桶)—— 哈希表不维护任何顺序</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="warn" title="面试标准表述,一字不差地背下来">
          <p>
            「哈希表的插入/查找/删除是<b>平均(期望)O(1)</b>,依赖两个前提:
            哈希函数分布均匀、负载因子不超标(靠扩容维持);<b>最坏 O(n)</b>,
            发生在大量 key 冲突挤进同一桶时。」只说「哈希表是
            O(1)」在严格的面试官那里要扣分 —— 平均和最坏,一个都不能省。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 手写实现 ================= */}
      <Section
        id="impl"
        index="04"
        title="手写 HashMap:链地址法,60 行"
        desc="hash 定位 → 沿链比对 → 负载超标翻倍搬家 —— 亲手造一遍,黑盒变白盒"
      >
        <div className="prose">
          <p>
            桶数组 + 每桶一条链,五个方法:<code>hash</code>(定位)、
            <code>put</code>(存)、<code>get</code>(取)、<code>remove</code>(删)、
            <code>resize</code>(扩容)。注意每个实现里「桶数变了必须重新算下标」
            那一行 —— 它就是 §03 里 rehash 全体搬家的代码形态:
          </p>
        </div>
        <CodeTabs
          title="my_hashmap"
          java={{
            code: `import java.util.*;

public class MyHashMap<K, V> {
    // 节点:一个键值对 + 指向同桶下一个节点的引用(链地址法)
    static class Node<K, V> {
        K key; V val; Node<K, V> next;
        Node(K key, V val, Node<K, V> next) {
            this.key = key; this.val = val; this.next = next;
        }
    }

    private Node<K, V>[] buckets;   // 桶数组:每个桶存一条链的头节点
    private int size = 0;           // 已存键值对数

    @SuppressWarnings("unchecked")
    public MyHashMap() {
        buckets = (Node<K, V>[]) new Node[8];    // 初始 8 个桶
    }

    // key → 桶下标:hashCode 可能为负,先清符号位再取模
    private int indexOf(K key, int cap) {
        return (key.hashCode() & 0x7fffffff) % cap;
    }

    public void put(K key, V val) {
        int i = indexOf(key, buckets.length);
        for (Node<K, V> p = buckets[i]; p != null; p = p.next)
            if (p.key.equals(key)) { p.val = val; return; } // 已存在:覆盖
        buckets[i] = new Node<>(key, val, buckets[i]);      // 头插进链
        size++;
        if (size > buckets.length * 0.75) resize();         // 负载 > 0.75:扩容
    }

    public V get(K key) {
        int i = indexOf(key, buckets.length);
        for (Node<K, V> p = buckets[i]; p != null; p = p.next)
            if (p.key.equals(key)) return p.val;  // 沿链逐个比对 key
        return null;                              // 整条链都没有:不存在
    }

    public V remove(K key) {
        int i = indexOf(key, buckets.length);
        Node<K, V> p = buckets[i], prev = null;
        while (p != null) {
            if (p.key.equals(key)) {
                if (prev == null) buckets[i] = p.next; // 删链头
                else prev.next = p.next;               // 从链中摘除
                size--;
                return p.val;
            }
            prev = p; p = p.next;
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private void resize() {
        Node<K, V>[] old = buckets;
        buckets = (Node<K, V>[]) new Node[old.length * 2]; // 桶数翻倍
        for (Node<K, V> head : old) {
            for (Node<K, V> p = head; p != null; ) {
                Node<K, V> next = p.next;
                int i = indexOf(p.key, buckets.length); // 桶数变了,必须重算!
                p.next = buckets[i];                    // 头插进新桶
                buckets[i] = p;
                p = next;
            }
        }
    }
}`,
            hl: [22, 23, 31, 32, 63, 64],
            note: (
              <>
                <b>细节:</b>Java 泛型数组不能直接 new,所以有那行强转;
                <code>&amp; 0x7fffffff</code> 把可能为负的 hashCode 清成非负 ——
                负数取模在 Java 里还是负数,会变成非法下标。
              </>
            ),
          }}
          python={{
            code: `class MyHashMap:
    def __init__(self):
        # 8 个桶;Python 里用 list 模拟链表存 [key, val] 对
        self.buckets = [[] for _ in range(8)]
        self.size = 0

    def _index(self, key, cap):
        return hash(key) % cap        # 内置 hash():任何不可变对象都能算

    def put(self, key, val):
        b = self.buckets[self._index(key, len(self.buckets))]
        for pair in b:
            if pair[0] == key:        # key 已存在:覆盖
                pair[1] = val
                return
        b.append([key, val])          # 新键值对挂进桶
        self.size += 1
        if self.size > len(self.buckets) * 0.75:
            self._resize()            # 负载 > 0.75:扩容

    def get(self, key):
        b = self.buckets[self._index(key, len(self.buckets))]
        for k, v in b:                # 沿桶逐个比对
            if k == key:
                return v
        return None                   # 不存在

    def remove(self, key):
        b = self.buckets[self._index(key, len(self.buckets))]
        for i, (k, _) in enumerate(b):
            if k == key:
                self.size -= 1
                return b.pop(i)[1]    # 从桶里移走,返回旧值
        return None

    def _resize(self):
        old = self.buckets
        self.buckets = [[] for _ in range(len(old) * 2)]  # 桶数翻倍
        for bucket in old:
            for k, v in bucket:
                # 桶数变了,mod 结果就变 —— 每个 key 都要重新安家
                self.buckets[self._index(k, len(self.buckets))].append([k, v])`,
            hl: [7, 8, 18, 19, 41, 42],
            note: (
              <>
                <b>细节:</b>真实的 CPython dict 用的是开放寻址而非链地址,
                且 hash() 对字符串带随机盐(防 HashDoS,每次启动进程都不同)——
                所以别依赖 hash(&quot;abc&quot;) 的具体数值。
              </>
            ),
          }}
          js={{
            code: `class MyHashMap {
  constructor() {
    this.buckets = Array.from({ length: 8 }, () => []); // 8 个桶
    this.size = 0;
  }

  _index(key, cap) {
    // 字符串多项式哈希;>>> 0 把结果压回 32 位无符号整数防溢出
    let h = 0;
    for (const ch of String(key)) h = (h * 31 + ch.codePointAt(0)) >>> 0;
    return h % cap;
  }

  put(key, val) {
    const b = this.buckets[this._index(key, this.buckets.length)];
    for (const pair of b) {
      if (pair[0] === key) { pair[1] = val; return; } // 已存在:覆盖
    }
    b.push([key, val]);                  // 新键值对挂进桶
    this.size++;
    if (this.size > this.buckets.length * 0.75) this._resize();
  }

  get(key) {
    const b = this.buckets[this._index(key, this.buckets.length)];
    for (const [k, v] of b) if (k === key) return v; // 沿桶比对
    return undefined;                                // 不存在
  }

  remove(key) {
    const b = this.buckets[this._index(key, this.buckets.length)];
    for (let i = 0; i < b.length; i++) {
      if (b[i][0] === key) { this.size--; return b.splice(i, 1)[0][1]; }
    }
    return undefined;
  }

  _resize() {
    const old = this.buckets;
    this.buckets = Array.from({ length: old.length * 2 }, () => []);
    for (const bucket of old)
      for (const [k, v] of bucket)
        // 桶数变了,必须重新计算每个 key 的新家
        this.buckets[this._index(k, this.buckets.length)].push([k, v]);
  }
}`,
            hl: [7, 8, 9, 10, 11, 21, 43, 44],
            note: (
              <>
                <b>细节:</b>这个玩具版把所有 key 先转成字符串再哈希 ——
                真正的 JS Map 用引擎内部的身份哈希,对象也能当 key
                且不同对象绝不混淆。
              </>
            ),
          }}
        />
        <Callout tone="win" title="写完这 60 行,你已经理解了 90% 的哈希表面试题">
          <p>
            「HashMap 的 put 流程?」「扩容时发生什么?」「为什么 get 平均
            O(1)?」—— 答案全在上面代码里,而且你能指着具体某一行说。
            剩下的 10%(树化、并发、ConcurrentHashMap)都是在这套骨架上打补丁。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 三语言对照 ================= */}
      <Section
        id="langs"
        index="05"
        title="三语言对照:Map 与 Set 的三副面孔"
        desc="同一个抽象:key → value 的字典,和只关心「有没有」的集合"
      >
        <div className="prose">
          <p>
            每种语言都内置了工业级哈希表,而且都是两件套:
            <strong>Map(字典)</strong>存键值对、<strong>Set(集合)</strong>
            只存 key(其实就是不带 value 的 Map)。API 大同小异,坑各有各的:
          </p>
        </div>
        <CodeTabs
          title="hash_basics"
          java={{
            code: `import java.util.*;

// Map:HashMap —— 字典
Map<String, Integer> cnt = new HashMap<>();
cnt.put("apple", 1);                  // 插入 / 覆盖
cnt.get("apple");                     // 取值,不存在返回 null
cnt.getOrDefault("pear", 0);          // 刷题神器:不存在给默认值
cnt.containsKey("apple");             // 有这个 key 吗
cnt.merge("apple", 1, Integer::sum);  // 计数 +1 的优雅写法
cnt.remove("apple");
cnt.size();

for (Map.Entry<String, Integer> e : cnt.entrySet())
    System.out.println(e.getKey() + " -> " + e.getValue());

// Set:HashSet —— 只关心「有没有」
Set<Integer> seen = new HashSet<>();
seen.add(7);
seen.contains(7);                     // true,O(1)

// 能预估容量就提前给,省掉中途 rehash:
Map<String, Integer> big = new HashMap<>(10000);`,
            note: (
              <>
                <b>坑(契约):</b>自定义类当 key,<b>重写 equals 必须重写
                hashCode</b>。HashMap 先按 hashCode 找桶、再在桶内用 equals 比对
                —— 只改 equals,相等的对象会落进不同的桶,存进去就查不到。
                HashMap 无序;要插入序用 LinkedHashMap,要排序用 TreeMap。
              </>
            ),
          }}
          python={{
            code: `# dict —— 语言级内置,字面量语法直接写
cnt = {"apple": 1}
cnt["pear"] = 2              # 插入 / 覆盖
cnt["apple"]                 # 取值 —— 不存在会抛 KeyError!
cnt.get("kiwi", 0)           # 安全取值:不存在给默认值
"apple" in cnt               # 有这个 key 吗,O(1)
del cnt["apple"]
len(cnt)

for k, v in cnt.items():     # 3.7+ 保证:按插入顺序遍历
    print(k, v)

# set
seen = {1, 2, 3}
seen.add(7)
7 in seen                    # True

# 刷题两大帮手
from collections import Counter, defaultdict
Counter("aabbc")             # Counter({'a':2, 'b':2, 'c':1})
d = defaultdict(list)        # 访问缺失 key 时自动造默认值
d["group"].append("x")       # 不用先判断 key 在不在

# key 必须不可变(可哈希):
ok = {(1, 2): "tuple 可以当 key"}
# bad = {[1, 2]: "..."}      # TypeError: unhashable type: 'list'`,
            note: (
              <>
                <b>坑:</b>可变对象(list / dict / set)没有 <code>__hash__</code>
                ,不能当 key —— 内容一变哈希就变,数据会失联;tuple 不可变所以可以
                (前提是里面装的也全部可哈希)。<code>d[k]</code> 与{" "}
                <code>d.get(k)</code> 的区别(抛异常 vs 返回 None)是新手第一坑。
              </>
            ),
          }}
          js={{
            code: `// Map —— 真正的哈希表,任何类型都能当 key
const cnt = new Map();
cnt.set("apple", 1);               // 插入 / 覆盖(返回 Map,可链式)
cnt.get("apple");                  // 取值,不存在返回 undefined
cnt.has("apple");                  // 有这个 key 吗
cnt.set("apple", (cnt.get("apple") ?? 0) + 1); // 计数 +1
cnt.delete("apple");
cnt.size;                          // 注意:是属性,不是方法!

for (const [k, v] of cnt) console.log(k, v); // 按插入顺序

// Set
const seen = new Set([1, 2, 3]);
seen.add(7);
seen.has(7);                       // true

// 普通 Object 当字典?三个坑演示:
const obj = {};
obj[1] = "a";
obj["1"];            // "a" —— key 被强转成字符串,1 和 "1" 是同一个!
"toString" in obj;   // true —— 原型链上的「幽灵 key」
// 用户输入 "__proto__" 当 key → 原型链污染,真实安全漏洞`,
            note: (
              <>
                <b>坑:</b>Object 的 key 只能是 string/symbol(数字、对象都被转成
                字符串),自带原型链幽灵 key 和 <code>__proto__</code> 污染风险,
                顺序对「长得像整数的 key」还会重排 —— 刷题和工程一律首选
                Map/Set。真需要纯字典对象时用 <code>Object.create(null)</code>。
              </>
            ),
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>操作</th>
                <th>Java(HashMap)</th>
                <th>Python(dict)</th>
                <th>JavaScript(Map)</th>
                <th>复杂度</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>创建</td>
                <td><code>new HashMap&lt;&gt;()</code></td>
                <td><code>{"{}"}</code></td>
                <td><code>new Map()</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>插入 / 更新</td>
                <td><code>m.put(k, v)</code></td>
                <td><code>m[k] = v</code></td>
                <td><code>m.set(k, v)</code></td>
                <td><BigO o="1" label="均摊 O(1)" /></td>
              </tr>
              <tr>
                <td>取值</td>
                <td><code>m.get(k)</code></td>
                <td><code>m[k]</code>(缺失抛异常)</td>
                <td><code>m.get(k)</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>取值带默认</td>
                <td><code>m.getOrDefault(k, d)</code></td>
                <td><code>m.get(k, d)</code></td>
                <td><code>m.get(k) ?? d</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>含 key 否</td>
                <td><code>m.containsKey(k)</code></td>
                <td><code>k in m</code></td>
                <td><code>m.has(k)</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>删除</td>
                <td><code>m.remove(k)</code></td>
                <td><code>del m[k]</code> / <code>m.pop(k, None)</code></td>
                <td><code>m.delete(k)</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>大小</td>
                <td><code>m.size()</code></td>
                <td><code>len(m)</code></td>
                <td><code>m.size</code></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>遍历</td>
                <td><code>for (var e : m.entrySet())</code></td>
                <td><code>for k, v in m.items():</code></td>
                <td><code>for (const [k, v] of m)</code></td>
                <td><BigO o="n" /></td>
              </tr>
              <tr>
                <td>遍历顺序</td>
                <td>无保证(LinkedHashMap 才有)</td>
                <td>插入序(3.7+ 规范保证)</td>
                <td>插入序(规范保证)</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="deep" title="工程现场:为什么 IDE 一键生成 equals 和 hashCode 是一对">
          <p>
            IntelliJ / Eclipse 里生成 equals 时永远连着 hashCode,Lombok 的注解叫{" "}
            <code>@EqualsAndHashCode</code>,Java 16 的 record 干脆两个一起自动生成
            —— 整个生态都在强制执行同一条契约:<b>equals 相等的对象,hashCode
            必须相等</b>。因为 HashMap 的查找是「先 hashCode 找桶、再 equals
            确认」的两级流程,契约一破,第一级就把你带进错误的桶。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 套路与精讲 ================= */}
      <Section
        id="patterns"
        index="06"
        title="哈希三大信号:见过吗 · 配对 · 分组"
        desc="读题时听到这三种「弦外之音」,手就该伸向哈希表了"
        badge={<span className="chip" data-tone="warn">★ 面试核心</span>}
      >
        <div className="prose">
          <p>
            哈希表解题的本质只有一句话:<strong>用 O(n) 的空间,把「回头找一遍」
            的 O(n) 时间压成 O(1) 的一次查表</strong>。什么时候该用?听信号:
          </p>
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">信号一</div>
            <div className="card-title">👀 「见过吗」→ Set</div>
            <p>
              判重、判环、求交集 —— 只关心存在性,不关心附加信息。
              → LC 217、202、349、128。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">信号二</div>
            <div className="card-title">🤝 「配对」→ Map</div>
            <p>
              找「和为 k 的另一半」「配过的下标」:key 存<b>期望被谁找到的值</b>,
              value 存下标/次数。→ LC 1、454、560。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">信号三</div>
            <div className="card-title">🗂️ 「分组计数」→ Map&lt;签名, 列表&gt;</div>
            <p>
              把「本质相同」的东西归到同一个 key 下:设计一个签名函数,
              让同类必同 key。→ LC 49、383、299。
            </p>
          </div>
        </div>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 A</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 1 · 两数之和
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">EASY</span>
          </span>
        </div>
        <div className="prose">
          <p>
            全 LeetCode 的第一题,值得一点仪式感 —— 它是「配对」信号的原型。
            <b>题意:</b>数组中找两个数之和等于 target,返回下标。
            <b> 暴力:</b>双层循环枚举所有数对,O(n²)。<b>优化的钥匙:</b>
            内层循环在干嘛?在「回头找 target − nums[i] 在不在前面」——
            一整圈线性查找。把「前面见过的数」存进哈希表,这一圈就变成一次 O(1) 查表:
          </p>
        </div>
        <ArrayStepper title="LC 1 · 一遍哈希:先查表,再存表(target = 9)" frames={F1} />
        <CodeTabs
          title="lc1_two_sum"
          java={{
            code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>(); // 值 -> 下标
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];       // 我需要的「另一半」
            if (seen.containsKey(need))        // 先查:另一半来过吗?
                return new int[]{seen.get(need), i};
            seen.put(nums[i], i);              // 再存:把自己登记进表
        }
        return new int[0];
    }
}`,
            hl: [5, 6, 7, 8],
          }}
          python={{
            code: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}                      # 值 -> 下标
        for i, v in enumerate(nums):
            need = target - v          # 我需要的「另一半」
            if need in seen:           # 先查:另一半来过吗?
                return [seen[need], i]
            seen[v] = i                # 再存:把自己登记进表
        return []`,
            hl: [5, 6, 7, 8],
          }}
          js={{
            code: `var twoSum = function (nums, target) {
  const seen = new Map();              // 值 -> 下标
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];     // 我需要的「另一半」
    if (seen.has(need))                // 先查:另一半来过吗?
      return [seen.get(need), i];
    seen.set(nums[i], i);              // 再存:把自己登记进表
  }
  return [];
};`,
            hl: [4, 5, 6, 7],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n)</b>、空间 <b>O(n)</b> —— 教科书级的空间换时间。
            追问一:「为什么先查再存?」防止自配对:target=8、nums[i]=4 时,
            先存后查会让 4 和它自己配上。追问二:「数组有序呢?」对撞指针
            O(n)/O(1) 更省空间(LC 167,数组章讲过)—— 有序用双指针、无序用哈希,
            这组对比面试必考。
          </p>
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 B</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 49 · 字母异位词分组
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>把字母相同、顺序不同的词(异位词)分到同一组。
            <b> 暴力:</b>两两比较是否异位,O(n² · k)。<b>优化的钥匙:</b>
            与其两两比较,不如给每个词发一张「身份证」——
            设计一个<strong>签名(key)</strong>,让异位词签名相同、非异位词签名不同,
            然后 Map&lt;签名, 组&gt; 让它们自动相遇:
          </p>
        </div>
        <ArrayStepper title="LC 49 · 排序签名分组,逐帧" frames={F49} cellW={64} />
        <CodeTabs
          title="lc49_group_anagrams"
          java={{
            code: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String s : strs) {
            char[] cs = s.toCharArray();
            Arrays.sort(cs);                    // 排序后的字母 = 签名
            String key = new String(cs);
            groups.computeIfAbsent(key, k -> new ArrayList<>())
                  .add(s);                      // 同签名进同一组
        }
        return new ArrayList<>(groups.values());
    }
}`,
            hl: [6, 7, 8, 9],
          }}
          python={{
            code: `from collections import defaultdict

class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        groups = defaultdict(list)
        for s in strs:
            key = "".join(sorted(s))   # 排序后的字母 = 签名
            groups[key].append(s)      # 同签名进同一组
        return list(groups.values())`,
            hl: [7, 8],
          }}
          js={{
            code: `var groupAnagrams = function (strs) {
  const groups = new Map();
  for (const s of strs) {
    const key = [...s].sort().join("");   // 排序后的字母 = 签名
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);              // 同签名进同一组
  }
  return [...groups.values()];
};`,
            hl: [4, 5, 6],
          }}
        />
        <Callout tone="deep" title="两种签名的取舍(面试加分点)">
          <p>
            <b>排序签名</b>:每词 O(k log k),写起来最顺手。<b>计数签名</b>:
            数出 26 个字母的次数拼成字符串(如 &quot;a1e1t1&quot;),每词
            O(k),渐近更优 —— 词很长时值得换。共同的原则:
            <b>签名必须与「本质」一一对应</b> —— 这个「设计 key」的思路会在
            LC 249(移位词分组)、LC 205(同构)反复出现,是信号三的通用解法。
          </p>
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 C</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 128 · 最长连续序列
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>无序数组中,找最长的<strong>数值连续</strong>序列长度
            (元素位置无所谓),要求 O(n)。<b>第一反应:</b>排序后扫一遍 ——
            但排序 O(n log n),题目明说不行。<b>优化的钥匙:</b>全部丢进 Set 后,
            「x+1 在不在」是 O(1) 的 —— 从每个数向右数就能量出序列长。
            但直接这么做是 O(n²):序列 [1..100] 里,从 1 数、从 2 数、从 3 数……
            重复劳动。妙手是加一条纪律:<strong>只从「序列起点」出发</strong>
            (x−1 不在 Set 中的 x 才配当起点):
          </p>
        </div>
        <ArrayStepper title="LC 128 · Set + 只从起点数,逐帧" frames={F128} />
        <CodeTabs
          title="lc128_longest_consecutive"
          java={{
            code: `class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int v : nums) set.add(v);         // 全部入 Set:O(1) 查存在
        int best = 0;
        for (int v : set) {
            if (set.contains(v - 1)) continue; // 不是起点,跳过!
            int len = 1;
            while (set.contains(v + len)) len++; // 从起点向右数
            best = Math.max(best, len);
        }
        return best;
    }
}`,
            hl: [7, 8, 9],
          }}
          python={{
            code: `class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        s = set(nums)                  # 全部入 Set:O(1) 查存在
        best = 0
        for v in s:
            if v - 1 in s:             # 不是起点,跳过!
                continue
            length = 1
            while v + length in s:     # 从起点向右数
                length += 1
            best = max(best, length)
        return best`,
            hl: [6, 7, 9, 10],
          }}
          js={{
            code: `var longestConsecutive = function (nums) {
  const set = new Set(nums);           // 全部入 Set:O(1) 查存在
  let best = 0;
  for (const v of set) {
    if (set.has(v - 1)) continue;      // 不是起点,跳过!
    let len = 1;
    while (set.has(v + len)) len++;    // 从起点向右数
    best = Math.max(best, len);
  }
  return best;
};`,
            hl: [5, 6, 7],
          }}
        />
        <Callout tone="win" title="为什么这是 O(n)?(面试必答)">
          <p>
            表面上有嵌套 while,但内层只会从<b>起点</b>启动,而每条连续序列
            <b>只有一个起点</b> —— 所以所有 while 加起来,每个元素只被「向右数到」
            一次。外层 n 次起点检查 + 内层总计 n 次推进 = <b>O(n)</b>。
            这种「嵌套循环但总量线性」的均摊论证,和数组章滑动窗口的 2n
            论证是同一套话术。追问:「遍历 nums 而不是 set 行吗?」行,
            但重复元素会白做几次起点检查 —— 遍历 set 更干净。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title="高频题单:哈希 10 题"
        desc="按信号分组、由易到难。560 前缀和 + 哈希是本单灵魂,务必吃透"
        badge={<span className="chip">Hot 100 精选</span>}
      >
        <ProblemSet ch="hash" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="8 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="hash" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            哈希表 = <b>数组 + 哈希函数 + 冲突处理</b>:把任意 key 算成下标,
            让 O(1) 直达不再只属于整数下标。
          </>,
          <>
            好哈希三要求:<b>确定、均匀、快</b>;key 无限、桶有限,
            冲突必然存在 —— 链地址法(挂链,Java)与开放寻址(探测,Python)
            是两大解法。
          </>,
          <>
            负载因子 &gt; 0.75 触发扩容,且必须<b>全体 rehash</b>——
            桶数变了,mod 的结果就变了。复杂度的严谨说法:
            <b>平均 O(1),最坏 O(n)</b>(全员挤一桶时)。
          </>,
          <>
            语言之坑各一句:Java <b>重写 equals 必重写 hashCode</b>(先按
            hashCode 找桶);Python <b>可变对象不能当 key</b>(list 不行 tuple
            行),3.7+ dict 保插入序;JS 字典用 <b>Map 别用
            Object</b>(key 强转字符串 + 原型链污染)。
          </>,
          <>
            三大解题信号:<b>「见过吗」→ Set;「配对」→ Map 存补数/下标;
            「分组计数」→ Map&lt;签名, 列表&gt;</b>。前缀和 + 哈希(LC 560)
            是「两数之和」思想的高阶变身。
          </>,
        ]}
      />

      <ChapterFooter ch="hash" />
    </main>
  );
}
