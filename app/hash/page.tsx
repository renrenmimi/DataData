"use client";

// 第 6 章 · 哈希表 —— 全书的「空间换时间」代表作。
// 结构:为什么 → 哈希函数(HashLab)→ 冲突解决(CollisionLab)→ 手写 HashMap →
// 三语言对照(hashCode/equals 契约、dict 顺序、Map vs Object)→
// 三大信号 + 三道精讲(LC 1 / 49 / 128,逐帧)→ 题单 10 题 → 测验 8 题。
//
// 双语:所有面向学习者的文案都用 <T en zh> 或 { en, zh },英文为默认语言。
// 代码窗的 code 写成 { en, zh } —— 两版逐行等价,只有注释不同,hl 行号才对得上。

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
import { T } from "@/lib/i18n";
import { HashLab, CollisionLab } from "./viz";
import "./chapter.css";

/* ================= 精讲动画帧 ================= */

// LC 1 两数之和:一遍哈希,先查表再存表。nums = [11,2,15,7],target = 9
const F1: ArrayFrame[] = [
  {
    cells: [{ v: 11 }, { v: 2 }, { v: 15 }, { v: 7 }],
    msg: (
      <T
        en={
          <>
            target = 9. Start with an empty map from value to index. For every
            number, <b>look up first</b> — has the number it needs already
            appeared? — and <b>record it afterwards</b>.
          </>
        }
        zh={
          <>
            target = 9。准备一张空表 map(值 → 下标)。每个数<b>先查</b>
            「我需要的另一半来过吗」,<b>再把自己登记进表</b>。
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: 11, state: "lit" }, { v: 2 }, { v: 15 }, { v: 7 }],
    ptrs: [{ i: 0, label: "i" }],
    msg: (
      <T
        en={
          <>
            i = 0, v = 11. It needs 9 − 11 = <b>−2</b>. The map does not have
            it, so record 11. map = {"{11:0}"}
          </>
        }
        zh={
          <>
            i = 0,v = 11:需要 9 − 11 = <b>−2</b>。表里没有 → 登记 11。map ={" "}
            {"{11:0}"}
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: 11 }, { v: 2, state: "lit" }, { v: 15 }, { v: 7 }],
    ptrs: [{ i: 1, label: "i" }],
    msg: (
      <T
        en={
          <>
            i = 1, v = 2. It needs 9 − 2 = <b>7</b>. Not in the map, so record
            2. map = {"{11:0, 2:1}"}
          </>
        }
        zh={
          <>
            i = 1,v = 2:需要 9 − 2 = <b>7</b>。表里没有 → 登记 2。map ={" "}
            {"{11:0, 2:1}"}
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: 11 }, { v: 2 }, { v: 15, state: "lit" }, { v: 7 }],
    ptrs: [{ i: 2, label: "i" }],
    msg: (
      <T
        en={
          <>
            i = 2, v = 15. It needs <b>−6</b>. Not in the map, so record 15. map
            = {"{11:0, 2:1, 15:2}"}
          </>
        }
        zh={
          <>
            i = 2,v = 15:需要 <b>−6</b>。表里没有 → 登记 15。map ={" "}
            {"{11:0, 2:1, 15:2}"}
          </>
        }
      />
    ),
  },
  {
    cells: [{ v: 11 }, { v: 2, state: "ok" }, { v: 15 }, { v: 7, state: "ok" }],
    ptrs: [{ i: 3, label: "i" }],
    msg: (
      <T
        en={
          <>
            i = 3, v = 7. It needs 9 − 7 = <b>2</b>. The map <b>has it</b>, at
            index 1, so the answer is [1, 3]. Each number is handled once: one
            lookup and one insert, each O(1) on average, so the whole pass is{" "}
            <b>O(n)</b>.
          </>
        }
        zh={
          <>
            i = 3,v = 7:需要 9 − 7 = <b>2</b>。查表:<b>有!</b>2 的下标是 1 →
            答案 [1, 3]。每个数只被处理一次:一次查 + 一次存,平均都是 O(1),
            整趟 <b>O(n)</b>。
          </>
        }
      />
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
      <T
        en={
          <>
            Anagrams contain the same letters in a different order. Give each
            word a <b>signature</b>: sort its letters. eat, tea, and ate all
            become &quot;aet&quot;. The signature is the key, and the word joins
            the group stored under that key.
          </>
        }
        zh={
          <>
            异位词的特征:字母相同、顺序不同。给每个词一个<b>签名</b>:
            把字母排序 —— eat / tea / ate 排序后都是 &quot;aet&quot;。
            签名做 key,词加入该 key 下的那一组。
          </>
        }
      />
    ),
  },
  {
    cells: c49(["lit", undefined, undefined, undefined, undefined, undefined]),
    msg: (
      <T
        en={
          <>
            &quot;eat&quot; has signature <b>&quot;aet&quot;</b>. No group with
            that key exists yet, so create one. map = {"{aet: [eat]}"}
          </>
        }
        zh={
          <>
            &quot;eat&quot; → 签名 <b>&quot;aet&quot;</b>:表里还没有这个组,新建。
            map = {"{aet: [eat]}"}
          </>
        }
      />
    ),
  },
  {
    cells: c49(["ok", "lit", undefined, undefined, undefined, undefined]),
    msg: (
      <T
        en={
          <>
            &quot;tea&quot; has signature <b>&quot;aet&quot;</b> as well. The
            group already exists, so add it. map = {"{aet: [eat, tea]}"}
          </>
        }
        zh={
          <>
            &quot;tea&quot; → 签名 <b>&quot;aet&quot;</b>:组已存在,直接加入。
            map = {"{aet: [eat, tea]}"}
          </>
        }
      />
    ),
  },
  {
    cells: c49(["ok", "ok", "lit", undefined, undefined, undefined]),
    msg: (
      <T
        en={
          <>
            &quot;tan&quot; has signature <b>&quot;ant&quot;</b>. That is a new
            group. map = {"{aet: […], ant: [tan]}"}
          </>
        }
        zh={
          <>
            &quot;tan&quot; → 签名 <b>&quot;ant&quot;</b>:新组。map ={" "}
            {"{aet: […], ant: [tan]}"}
          </>
        }
      />
    ),
  },
  {
    cells: c49(["ok", "ok", "ok", "lit", undefined, undefined]),
    msg: (
      <T
        en={
          <>
            &quot;ate&quot; has signature <b>&quot;aet&quot;</b>, so it joins
            eat and tea. The three anagrams end up together without ever being
            compared to each other.
          </>
        }
        zh={
          <>
            &quot;ate&quot; → 签名 <b>&quot;aet&quot;</b>:加入 eat 那组。
            三个异位词从未两两比较过,却自动聚在了一起。
          </>
        }
      />
    ),
  },
  {
    cells: c49(["ok", "ok", "ok", "ok", "lit", undefined]),
    msg: (
      <T
        en={
          <>
            &quot;nat&quot; has signature <b>&quot;ant&quot;</b>, so it joins
            tan.
          </>
        }
        zh={
          <>
            &quot;nat&quot; → 签名 <b>&quot;ant&quot;</b>:加入 tan 那组。
          </>
        }
      />
    ),
  },
  {
    cells: c49(["ok", "ok", "ok", "ok", "ok", "lit"]),
    msg: (
      <T
        en={
          <>
            &quot;bat&quot; has signature <b>&quot;abt&quot;</b>, a new group.
            The result is three groups: [eat, tea, ate], [tan, nat], [bat].{" "}
            <b>
              A good signature is identical for every member of a group and
              different for every other group.
            </b>
          </>
        }
        zh={
          <>
            &quot;bat&quot; → 签名 <b>&quot;abt&quot;</b>:新组。最终三组:
            [eat, tea, ate]、[tan, nat]、[bat]。
            <b>好签名 = 同组必相同、异组必不同</b>。
          </>
        }
      />
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
      <T
        en={
          <>
            Step one: put every value into a set = {"{100, 4, 200, 1, 3, 2}"}.
            From now on &quot;is x present&quot; costs O(1) on average. The goal
            is the longest run of <b>consecutive values</b>; where they sit in
            the array does not matter.
          </>
        }
        zh={
          <>
            第一步:全部丢进 Set = {"{100, 4, 200, 1, 3, 2}"}。从此「x 在不在」
            平均只要 O(1)。目标是最长的<b>数值连续</b>序列,元素在数组里的位置无所谓。
          </>
        }
      />
    ),
  },
  {
    cells: c128(["lit", undefined, undefined, undefined, undefined, undefined]),
    msg: (
      <T
        en={
          <>
            Check 100. <b>99 is not in the set</b>, so 100 is the <b>start</b>{" "}
            of a run. Count to the right: 101 is not there either, so this run
            has length 1.
          </>
        }
        zh={
          <>
            检查 100:<b>99 不在 Set 里</b> → 100 是某条序列的<b>起点</b>。
            向右数:101 也不在 → 这条序列长度为 1。
          </>
        }
      />
    ),
  },
  {
    cells: c128([undefined, "ghost", undefined, undefined, undefined, undefined]),
    msg: (
      <T
        en={
          <>
            Check 4. <b>3 is in the set</b>, so 4 is not a start. <b>Skip it.</b>{" "}
            It belongs to another run and will be counted when that run&apos;s
            start is reached. This skip is what keeps the total work linear.
          </>
        }
        zh={
          <>
            检查 4:<b>3 在 Set 里</b> → 4 不是起点,<b>直接跳过</b>。
            它属于别人的序列,等那条序列的起点来数它 —— 这一步正是总工作量保持线性的关键。
          </>
        }
      />
    ),
  },
  {
    cells: c128([undefined, undefined, "lit", undefined, undefined, undefined]),
    msg: (
      <T
        en={
          <>
            Check 200. 199 is not in the set, so it is a start. 201 is not
            there, so length 1.
          </>
        }
        zh={<>检查 200:199 不在 → 是起点;201 不在 → 长度 1。</>}
      />
    ),
  },
  {
    cells: c128([undefined, undefined, undefined, "lit", undefined, undefined]),
    msg: (
      <T
        en={
          <>
            Check 1. <b>0 is not in the set</b>, so 1 is a start. Count to the
            right: 2 is present…
          </>
        }
        zh={
          <>
            检查 1:<b>0 不在 Set 里</b> → 是起点。开始向右数:2 在……
          </>
        }
      />
    ),
  },
  {
    cells: c128([undefined, undefined, undefined, "lit", undefined, "ok"]),
    msg: (
      <T
        en={<>2 is in the set, so the length is 2. Ask about 3…</>}
        zh={<>2 在 Set 里 → 长度 2;继续问 3……</>}
      />
    ),
  },
  {
    cells: c128([undefined, undefined, undefined, "lit", "ok", "ok"]),
    msg: (
      <T
        en={<>3 is in the set, so the length is 3. Ask about 4…</>}
        zh={<>3 在 Set 里 → 长度 3;继续问 4……</>}
      />
    ),
  },
  {
    cells: c128([undefined, "ok", undefined, "lit", "ok", "ok"]),
    msg: (
      <T
        en={
          <>
            4 is in the set, so the length is 4. 5 is not, so stop. The run
            [1, 2, 3, 4] has length <b>4</b>, which is the answer. The values 3
            and 2 are never used as starting points, because 2 and 1 are in the
            set.
          </>
        }
        zh={
          <>
            4 在 Set 里 → 长度 4;5 不在,停。序列 [1, 2, 3, 4],长度 <b>4</b>{" "}
            —— 就是答案。3 和 2 永远当不成起点,因为 2 和 1 都在 Set 里。
          </>
        }
      />
    ),
  },
  {
    cells: c128(["ok", "ok", "ok", "ok", "ok", "ok"]),
    msg: (
      <T
        en={
          <>
            Why is this O(n)? Each value is touched at most twice: once by its
            own start check, and once while some run is counted through it. The
            total work is at most 2n. The inner while loop does not repeat work.
            It <b>charges the work to the value that starts the run</b>.
          </>
        }
        zh={
          <>
            为什么是 O(n)?每个数最多被摸两次:一次是它自己的起点检查,
            一次是被某条序列「向右数到」。总工作量 ≤ 2n。内层 while
            不是重复劳动,它只是把账<b>记在了起点头上</b>。
          </>
        }
      />
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: { en: "Intuition", zh: "直觉" } },
  { id: "hashfn", n: "02", label: { en: "Hash functions", zh: "哈希函数" } },
  { id: "collision", n: "03", label: { en: "Collisions", zh: "冲突解决" } },
  { id: "impl", n: "04", label: { en: "Build one", zh: "手写实现" } },
  { id: "langs", n: "05", label: { en: "Three languages", zh: "三语言对照" } },
  { id: "patterns", n: "06", label: { en: "Patterns", zh: "套路与精讲" } },
  { id: "problems", n: "07", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "08", label: { en: "Quiz", zh: "通关测验" } },
];

export default function HashChapter() {
  return (
    <main className="page" data-ch="hash">
      <Hero
        ch="hash"
        title={{
          en: (
            <>
              The <span className="grad">Hash Table</span>
            </>
          ),
          zh: (
            <>
              哈希表 <span className="grad">Hash Table</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A hash function turns a key into an <strong>array index</strong>,
              and the table jumps straight to it. A lookup therefore does not
              scan the stored data. The price is that two different keys can
              produce the same index, and handling that is most of what the rest
              of this chapter is about.
            </>
          ),
          zh: (
            <>
              哈希函数把 key 算成一个<strong>数组下标</strong>,表直接跳过去 ——
              查找因此不需要逐个扫描已存的数据。代价是:
              两个不同的 key 可能算出同一个下标,而本章余下的篇幅,大半都在讲怎么处理它。
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
          en: "Intuition: compute the position instead of searching for it",
          zh: "直觉:位置是算出来的,不是找出来的",
        }}
        desc={{
          en: "A hash table is an array plus a rule that turns any key into an index.",
          zh: "哈希表 = 一个数组,加一条把任意 key 变成下标的规则",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  To find a word in a paper dictionary you can start at page one
                  and turn pages until you reach it. That is a linear search,{" "}
                  <strong>O(n)</strong>, and it gets slower as the dictionary
                  gets thicker. Or you can use the index at the front: the
                  spelling of the word tells you which page to open, and you go
                  there directly. The size of the dictionary barely matters. The
                  second method works because{" "}
                  <strong>
                    the word itself, put through a fixed rule, produces a
                    position
                  </strong>
                  .
                </p>
                <p>
                  An array already has this ability. Give it an index and it
                  reaches the element in O(1), because the address is computed
                  from the index rather than searched for. But the index has to
                  be a small non-negative integer. A hash table extends the same
                  ability to any kind of key:{" "}
                  <strong>
                    a hash function turns the key — a string, an object, a pair
                    of coordinates — into an integer, and that integer is used
                    as the index into an array
                  </strong>
                  . Nothing is scanned. That is the whole idea. A hash table is
                  not a new way to store data; it is{" "}
                  <b>an array, a rule for computing indexes, and a plan for
                  when two keys compute the same one</b>.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  在纸质字典里找一个字,有两种查法。第一种:从第一页开始逐页翻,
                  翻到为止 —— 这是线性查找,<strong>O(n)</strong>,字典越厚越慢。
                  第二种:用前面的索引,按读音直接翻到那一页,字典多厚几乎无所谓。
                  第二种查法之所以成立,是因为
                  <strong>这个字本身,经过一套固定规则,变成了一个位置</strong>。
                </p>
                <p>
                  数组早就有这种能力:给下标,O(1) 拿到元素 ——
                  因为地址是算出来的,不是找出来的。但下标必须是较小的非负整数。
                  哈希表把这份能力推广到任意 key:
                  <strong>
                    哈希函数把 key(字符串、对象、一对坐标……)算成一个整数,
                    这个整数就当数组下标用
                  </strong>
                  ,全程不扫描。这就是全部思想。哈希表不是新的存储方式,它是
                  <b>一个数组 + 一条算下标的规则 + 一套「两个 key 算出同一个下标怎么办」的方案</b>。
                </p>
              </>
            }
          />
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">PART 01</div>
            <div className="card-title">
              <T en="Hash function" zh="哈希函数" />
            </div>
            <T
              en={
                <p>
                  It turns any key into an integer inside a fixed range. The
                  same key must always produce the same integer. If it does not,
                  a value you stored can never be found again.
                </p>
              }
              zh={
                <p>
                  把任意 key 变成固定范围内的一个整数。同一个 key
                  必须永远算出同一个整数 —— 否则存进去的值再也找不回来。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">PART 02</div>
            <div className="card-title">
              <T en="Bucket array" zh="桶数组" />
            </div>
            <T
              en={
                <p>
                  The place where the data actually lives: an ordinary array
                  whose slots are called <b>buckets</b>. The output of the hash
                  function is the bucket index, so the O(1) jump comes from the
                  array underneath.
                </p>
              }
              zh={
                <p>
                  数据真正存放的地方:一个普通数组,每个格子叫一个
                  <b>桶(bucket)</b>。哈希函数的输出就是桶的下标 —— O(1)
                  直达靠的是底下这个数组。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">PART 03</div>
            <div className="card-title">
              <T en="Collision handling" zh="冲突处理" />
            </div>
            <T
              en={
                <p>
                  There are more possible keys than buckets, so two different
                  keys landing in the same bucket is <b>certain</b>, not a bug.
                  Separate chaining and open addressing are the two standard
                  answers.
                </p>
              }
              zh={
                <p>
                  可能的 key 比桶多,所以两个不同的 key 落进同一个桶
                  <b>必然发生</b>,这不是 bug。链地址法和开放寻址是两种标准答案。
                </p>
              }
            />
          </div>
        </div>
        <Callout
          tone="story"
          title={{
            en: "Where you already rely on hash tables",
            zh: "你其实每天都在用哈希表",
          }}
        >
          <T
            en={
              <p>
                Python resolves a variable name in a namespace, and a namespace
                is a dict. A browser cache finds a file by its URL. A database
                index answers &quot;which rows hold this value&quot;. Redis is
                close to a hash table with a network interface. Wherever a name
                leads directly to content, there is usually a hash table behind
                it. One case is related but different: Git names each commit by
                a <b>cryptographic</b> hash of its content. That is a different
                kind of hash function with a different goal — making it
                infeasible to find two contents with the same name — not making
                lookups fast.
              </p>
            }
            zh={
              <p>
                Python 解析一个变量名,查的是命名空间,而命名空间就是 dict;
                浏览器缓存按 URL 找文件;数据库索引回答「哪些行的这一列等于某个值」;
                Redis 几乎就是一张带网络接口的哈希表。凡是「用名字直达内容」的地方,
                背后多半站着一张哈希表。有一个相关但不同的例子:Git
                用内容的<b>密码学</b>哈希给每次提交命名 ——
                那是另一类哈希函数,目标是「几乎不可能构造出同名的两份内容」,
                而不是「查得快」。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §02 哈希函数 ================= */}
      <Section
        id="hashfn"
        index="02"
        title={{
          en: "Hash functions: turning a key into an index",
          zh: "哈希函数:把 key 变成下标",
        }}
        desc={{
          en: "One fixed mapping: any key goes in, an integer in a fixed range comes out.",
          zh: "一个固定的映射:输入任意 key,输出固定范围内的整数",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                A <strong>hash function</strong> takes a key and returns an
                integer. It could compute almost anything, but three
                requirements decide whether the table works at all. Each one
                exists because of what goes wrong without it.
              </p>
            }
            zh={
              <p>
                <strong>哈希函数(hash function)</strong>接受一个 key,
                返回一个整数。怎么算几乎都行,但有三条要求决定了这张表能不能用 ——
                每一条背后都是一个「不满足会怎样」。
              </p>
            }
          />
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Requirement" zh="要求" />
                </th>
                <th>
                  <T en="What it means" zh="含义" />
                </th>
                <th>
                  <T en="What happens without it" zh="不满足会怎样" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T en="Deterministic" zh="确定性" />
                  </b>
                </td>
                <td>
                  <T
                    en="The same key always produces the same value"
                    zh="同一个 key,任何时候算出同一个值"
                  />
                </td>
                <td>
                  <T
                    en="You store an entry in bucket 3 and later compute bucket 5 for the same key. The entry is still there, but nothing can reach it."
                    zh="存的时候进 3 号桶,取的时候算出 5 号桶 —— 数据还在,却永远找不到了"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Well spread" zh="均匀性" />
                  </b>
                </td>
                <td>
                  <T
                    en="Different keys are spread over all the buckets"
                    zh="不同的 key 尽量平摊到所有桶"
                  />
                </td>
                <td>
                  <T
                    en="Most keys pile into a few buckets. Those buckets hold long lists, and lookup degrades from O(1) toward O(n)."
                    zh="大部分 key 挤进少数几个桶,桶内排成长队,查找从 O(1) 退化到 O(n)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Fast" zh="快" />
                  </b>
                </td>
                <td>
                  <T
                    en="Computing the hash is itself close to O(1)"
                    zh="计算哈希本身接近 O(1)"
                  />
                </td>
                <td>
                  <T
                    en="The time saved on the search is spent computing the hash instead."
                    zh="查找省下来的时间,全花在算哈希上"
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
                How does a string become a number? The classic method is a{" "}
                <strong>polynomial hash</strong>: multiply each character code
                by a power of 31 and add the results. For{" "}
                <code>&quot;cat&quot;</code> (c = 99, a = 97, t = 116):
              </p>
            }
            zh={
              <p>
                字符串怎么变成数?最经典的做法是<strong>多项式哈希</strong>:
                把每个字符的编码乘上 31 的一个幂次,再相加。以{" "}
                <code>&quot;cat&quot;</code> 为例(c = 99、a = 97、t = 116):
              </p>
            }
          />
          <p
            style={{
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 15,
            }}
          >
            hash(&quot;cat&quot;) = 99 × 31² + 97 × 31 + 116 = 95139 + 3007 + 116
            = <b>98262</b>
          </p>
          <T
            en={
              <p>
                Why not simply add the character codes? Because then{" "}
                <code>&quot;cat&quot;</code> and <code>&quot;act&quot;</code>{" "}
                would produce the same value: same letters, different order.
                Multiplying by powers of 31 makes{" "}
                <strong>the position take part in the result</strong> — a
                character further to the left is multiplied by 31 more times.
                Written as a loop it is one line:{" "}
                <code>h = h × 31 + code(c)</code>. The last step takes this large
                number modulo the bucket count, which pushes it into the range
                of legal array indexes. Try the machine yourself:
              </p>
            }
            zh={
              <p>
                为什么不能把字符编码直接相加?因为那样{" "}
                <code>&quot;cat&quot;</code> 和 <code>&quot;act&quot;</code>{" "}
                会得到相同的值:字母一样,只是顺序不同。乘上 31 的幂次,
                <strong>让位置也参与运算</strong> ——
                越靠左的字符被乘 31 的次数越多。写成循环就是一行:
                <code>h = h × 31 + code(c)</code>。最后一步,把这个大数对桶数取模,
                压进合法的数组下标范围。亲手转一转这台机器:
              </p>
            }
          />
        </div>
        <HashLab />
        <Callout
          tone="deep"
          title={{
            en: "Why 31? The choice made in Java's String.hashCode",
            zh: "为什么偏偏是 31?—— Java String.hashCode 的选择",
          }}
        >
          <T
            en={
              <p>
                31 is an odd prime. An odd multiplier keeps the low bits of the
                result meaningful, which matters because the bucket count is
                usually a power of two and the index is taken from the low bits.
                It is also cheap: <code>31 × i</code> equals{" "}
                <code>(i &lt;&lt; 5) − i</code>, one shift and one subtraction.
                The collision between <b>Aa</b> and <b>BB</b> that you can
                produce in the lab above is not a bug — both have hashCode 2112
                in Java. There are infinitely many strings and only 2³² int
                values, so by the <b>pigeonhole principle</b> some pairs of keys
                must share a hash. Collisions cannot be designed away. They can
                only be handled.
              </p>
            }
            zh={
              <p>
                31 是奇素数。奇数乘子能保住结果的低位信息 —— 这很重要,
                因为桶数通常是 2 的幂,下标就取自低位。它还便宜:
                <code>31 × i</code> 等价于 <code>(i &lt;&lt; 5) − i</code>,
                一次移位加一次减法。你刚才在实验室里造出的 <b>Aa</b> 与 <b>BB</b>{" "}
                冲突不是 bug —— 它们在 Java 里的 hashCode 都是 2112。
                字符串有无限多个,int 只有 2³² 个,按<b>抽屉原理</b>
                必然存在同哈希的 key。冲突不可能被设计掉,只能被处理。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §03 冲突解决 ================= */}
      <Section
        id="collision"
        index="03"
        title={{
          en: "Collisions: two keys, one bucket",
          zh: "冲突解决:两个 key 撞进同一个桶",
        }}
        desc={{
          en: "Collisions cannot be avoided. What can be avoided is letting them ruin the performance.",
          zh: "冲突无法避免,能避免的是「让冲突把性能拖垮」",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Option one:{" "}
                  <strong>separate chaining</strong>. A bucket holds a list
                  instead of a single entry, and a colliding entry is appended
                  to that list. A lookup hashes to the bucket and then compares
                  the keys in the list one by one. Java&apos;s HashMap works
                  this way, and so does the implementation in §04.
                </p>
                <p>
                  Option two: <strong>open addressing</strong>. A bucket holds
                  at most one entry. On a collision the table follows a fixed
                  rule to find another free bucket. The simplest rule is to try
                  the next bucket to the right, which is called{" "}
                  <strong>linear probing</strong>. CPython&apos;s dict and
                  Rust&apos;s standard HashMap use open addressing. It is
                  friendlier to the CPU cache, because the next bucket probed is
                  usually in the same cache line. Here are the same six keys
                  under both strategies:
                </p>
              </>
            }
            zh={
              <>
                <p>
                  方案一:<strong>链地址法(separate chaining)</strong>。
                  每个桶挂的不是一个元素,而是一条链表,撞了就接到链上。
                  查找时先哈希定位桶,再沿链逐个比对 key。Java 的 HashMap
                  和 §04 手写的版本都走这条路。
                </p>
                <p>
                  方案二:<strong>开放寻址(open addressing)</strong>。
                  每个桶最多放一个元素,撞了就按固定规则去找另一个空桶,
                  最简单的规则是「往右试下一个」,叫
                  <strong>线性探测(linear probing)</strong>。CPython 的 dict、
                  Rust 标准库的 HashMap 都用开放寻址,它对 CPU 缓存更友好 ——
                  下一个被探测的桶通常就在同一条缓存行里。同一批 key,两种策略:
                </p>
              </>
            }
          />
        </div>
        <CollisionLab />
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-title">
              <T
                en="Chaining: how Java 8 limits the damage"
                zh="链地址法:Java 8 的树化"
              />
            </div>
            <T
              en={
                <p>
                  A single list can become very long if the hash is poor or if
                  the input was chosen by an attacker. Since Java 8, once a
                  bucket holds about <b>8</b> entries and the table has at least
                  64 buckets, that bucket is converted from a linked list to a
                  red-black tree, so a lookup in it costs O(log n) instead of
                  O(n). Why 8? With a hash that spreads well, the number of
                  entries per bucket follows a Poisson distribution, and
                  reaching 8 has a probability of roughly six in one hundred
                  million. The conversion is not meant for ordinary data. It is
                  a safety limit for deliberately crafted input, a{" "}
                  <b>HashDoS</b> attack.
                </p>
              }
              zh={
                <p>
                  哈希太差,或者输入是攻击者精心构造的,某条链就可能变得很长。
                  Java 8 起,当一个桶里大约存到 <b>8</b> 个元素、
                  且总桶数不少于 64 时,这个桶会从链表转成红黑树,
                  桶内查找从 O(n) 降到 O(log n)。为什么是 8?
                  哈希分布良好时,单桶元素个数近似服从泊松分布,
                  达到 8 的概率约为一亿分之六。树化不是为正常数据准备的,
                  它是给恶意构造的输入(<b>HashDoS</b> 攻击)留的保险丝。
                </p>
              }
            />
          </div>
          <div className="card">
            <div className="card-title">
              <T
                en="Open addressing: deletion needs tombstones"
                zh="开放寻址:删除要用墓碑"
              />
            </div>
            <T
              en={
                <p>
                  In a probing table you cannot simply set a slot back to empty.
                  A search stops at the first empty slot, so any entry that was
                  pushed further along the probe path would become unreachable.
                  The usual fix is to write a <b>tombstone</b>: a marker meaning
                  &quot;something used to be here&quot;. A search continues past
                  it, and an insert may reuse it. So deletion under open
                  addressing does not really free the slot, and once there are
                  many tombstones the whole table has to be rebuilt.
                </p>
              }
              zh={
                <p>
                  探测表里不能直接把格子改回空。查找会在第一个空格子处停下,
                  所以那些被探测挤到后面的元素会突然变得不可达。
                  通用做法是写一块<b>墓碑(tombstone)</b>,
                  意思是「这里曾经有人」:查找继续往后走,插入可以复用它。
                  所以开放寻址的删除并不真正释放格子,墓碑多了还得重建整张表。
                </p>
              }
            />
          </div>
        </div>
        <div className="prose" style={{ marginTop: 18 }}>
          <T
            en={
              <>
                <p>
                  The fuller the buckets, the more often keys collide. The
                  measure of &quot;full&quot; is the{" "}
                  <strong>
                    load factor: the number of stored entries divided by the
                    number of buckets
                  </strong>
                  . A Java HashMap grows once the load factor passes{" "}
                  <b>0.75</b> by default. Growing means allocating a bigger
                  bucket array — the capacity doubles — and then placing every
                  existing key again. That second part is called{" "}
                  <strong>rehashing</strong>, and it is not optional. The index
                  comes from <code>hash % bucketCount</code>, so changing the
                  bucket count changes where a key belongs. For example, 98262 %
                  8 = 6 and 98262 % 16 = 6, so that key happens to stay; but
                  98270 % 8 = 6 while 98270 % 16 = 14, so that key moves. With a
                  power-of-two capacity an entry in bucket i either stays at i
                  or moves to i + oldCapacity, and{" "}
                  <b>every entry still has to be visited to find out which</b>.
                </p>
                <p>
                  Rehashing means a single insert can cost O(n). Because the
                  capacity doubles, that cost is spread over the insertions that
                  follow, so insertion is <b>O(1) amortized</b> rather than O(1)
                  every time. Why 0.75? Higher, and each bucket holds more
                  entries on average, so the lists grow and the average lookup
                  stops being constant. Lower, and many buckets stay empty and
                  waste memory.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  桶越满,冲突越频繁。衡量「满」的指标叫
                  <strong>负载因子(load factor)= 已存元素数 ÷ 桶数</strong>。
                  Java HashMap 默认在负载因子超过 <b>0.75</b> 时扩容。
                  扩容 = 申请一个更大的桶数组(容量翻倍),然后把已有的每个 key
                  重新安放一次 —— 后半步叫 <strong>rehash</strong>,而且没得省。
                  因为下标来自 <code>hash % 桶数</code>,桶数一变,key
                  该待的地方就变了。举例:98262 % 8 = 6、98262 % 16 = 6,
                  这个 key 恰好原地不动;但 98270 % 8 = 6 而 98270 % 16 = 14,
                  它就得搬。容量是 2 的幂时,原本在 i 号桶的元素要么留在 i,
                  要么搬到 i + 旧容量,
                  <b>但每个元素都得被访问一次才知道是哪种</b>。
                </p>
                <p>
                  rehash 意味着某一次插入可能要花 O(n)。由于容量是翻倍的,
                  这份代价会摊到之后的插入上,所以插入是<b>均摊 O(1)</b>,
                  而不是每次都 O(1)。为什么是 0.75?再高,每个桶平均挂的元素更多,
                  链更长,平均查找不再是常数;再低,大片桶空着浪费内存。
                </p>
              </>
            }
          />
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Operation" zh="操作" />
                </th>
                <th>
                  <T en="Average" zh="平均" />
                </th>
                <th>
                  <T en="Worst case" zh="最坏" />
                </th>
                <th>
                  <T en="Why" zh="为什么" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>put</b>
                </td>
                <td>
                  <BigO
                    o="1"
                    label={{ en: "O(1) amortized", zh: "均摊 O(1)" }}
                  />
                </td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <T
                    en="Average: compute the index, then compare a constant number of keys. The amortized part covers the rehash after the table grows. Worst: every key lands in one bucket."
                    zh="平均:算出下标,再比对常数个 key;「均摊」是因为扩容时要 rehash。最坏:所有 key 挤进同一个桶"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="get / contains" zh="get / 包含" />
                  </b>
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <T
                    en="Same as above. The average holds only while the hash spreads the keys and the load factor stays bounded — both conditions are maintained on purpose."
                    zh="同上。平均值成立的前提是哈希分布均匀、负载因子受控 —— 这两个前提都是人为维持出来的"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>remove</b>
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <T
                    en="Finding the entry costs the same as a lookup. Unlinking it from a list, or writing a tombstone, is O(1)."
                    zh="定位的代价和查找相同;从链上摘掉节点、或写一块墓碑,本身都是 O(1)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Iterate" zh="遍历" />
                  </b>
                </td>
                <td colSpan={2}>
                  <BigO
                    o="n"
                    label={{ en: "O(n + buckets)", zh: "O(n + 桶数)" }}
                  />
                </td>
                <td>
                  <T
                    en="Every bucket has to be visited, including the empty ones. A hash table keeps no order of its own."
                    zh="所有桶都要扫一遍,包括空桶 —— 哈希表本身不维护任何顺序"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "State the complexity together with its conditions",
            zh: "复杂度要连同前提一起说",
          }}
        >
          <T
            en={
              <p>
                Insert, lookup, and delete in a hash table are{" "}
                <b>O(1) on average</b>, under two conditions: the hash function
                spreads the keys well, and the load factor stays bounded, which
                is what growing the table maintains. The{" "}
                <b>worst case is O(n)</b>, and it happens when a large number of
                keys land in the same bucket. Saying only &quot;a hash table is O(1)&quot; leaves out
                both the average and the conditions, and that is the most common
                mistake in an interview answer.
              </p>
            }
            zh={
              <p>
                哈希表的插入、查找、删除是<b>平均 O(1)</b>,依赖两个前提:
                哈希函数分布均匀、负载因子受控(靠扩容维持)。
                <b>最坏是 O(n)</b>,发生在大量 key 落进同一个桶时。
                只说「哈希表是 O(1)」,平均和前提两样都漏了 ——
                这是面试作答里最常见的一处失分。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §04 手写实现 ================= */}
      <Section
        id="impl"
        index="04"
        title={{
          en: "Build one: separate chaining from scratch",
          zh: "手写实现:链地址法,从零造一个",
        }}
        desc={{
          en: "Locate the bucket, compare along the list, and double the table when it gets too full.",
          zh: "定位桶 → 沿链比对 → 负载超标就翻倍搬家",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                A bucket array with one list per bucket, and five methods:{" "}
                <code>hash</code> (locate), <code>put</code>, <code>get</code>,{" "}
                <code>remove</code>, and <code>resize</code>. Watch the line
                inside <code>resize</code> that computes the index again. That
                single line is the rehash described in §03.
              </p>
            }
            zh={
              <p>
                一个桶数组,每个桶挂一条链,五个方法:<code>hash</code>(定位)、
                <code>put</code>、<code>get</code>、<code>remove</code>、
                <code>resize</code>。特别注意 <code>resize</code>{" "}
                里重新计算下标的那一行 —— 它就是 §03 说的 rehash 的代码形态。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="my_hashmap"
          java={{
            code: {
              en: `import java.util.*;

public class MyHashMap<K, V> {
    // One key-value pair, plus a link to the next pair in the same bucket
    static class Node<K, V> {
        K key; V val; Node<K, V> next;
        Node(K key, V val, Node<K, V> next) {
            this.key = key; this.val = val; this.next = next;
        }
    }

    private Node<K, V>[] buckets;   // each bucket holds the head of one list
    private int size = 0;           // number of pairs stored

    @SuppressWarnings("unchecked")
    public MyHashMap() {
        buckets = (Node<K, V>[]) new Node[8];    // start with 8 buckets
    }

    // key -> bucket index; hashCode may be negative, so clear the sign bit
    private int indexOf(K key, int cap) {
        return (key.hashCode() & 0x7fffffff) % cap;
    }

    public void put(K key, V val) {
        int i = indexOf(key, buckets.length);
        for (Node<K, V> p = buckets[i]; p != null; p = p.next)
            if (p.key.equals(key)) { p.val = val; return; } // key exists: overwrite
        buckets[i] = new Node<>(key, val, buckets[i]);      // insert at the list head
        size++;
        if (size > buckets.length * 0.75) resize();         // load factor > 0.75: grow
    }

    public V get(K key) {
        int i = indexOf(key, buckets.length);
        for (Node<K, V> p = buckets[i]; p != null; p = p.next)
            if (p.key.equals(key)) return p.val;  // compare the keys in this bucket
        return null;                              // not in the list: not in the map
    }

    public V remove(K key) {
        int i = indexOf(key, buckets.length);
        Node<K, V> p = buckets[i], prev = null;
        while (p != null) {
            if (p.key.equals(key)) {
                if (prev == null) buckets[i] = p.next; // it was the list head
                else prev.next = p.next;               // unlink it from the list
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
        buckets = (Node<K, V>[]) new Node[old.length * 2]; // twice as many buckets
        for (Node<K, V> head : old) {
            for (Node<K, V> p = head; p != null; ) {
                Node<K, V> next = p.next;
                int i = indexOf(p.key, buckets.length); // bucket count changed: recompute
                p.next = buckets[i];                    // insert at the new list head
                buckets[i] = p;
                p = next;
            }
        }
    }
}`,
              zh: `import java.util.*;

public class MyHashMap<K, V> {
    // 一个键值对,外加指向同桶下一个键值对的引用
    static class Node<K, V> {
        K key; V val; Node<K, V> next;
        Node(K key, V val, Node<K, V> next) {
            this.key = key; this.val = val; this.next = next;
        }
    }

    private Node<K, V>[] buckets;   // 每个桶存一条链的头节点
    private int size = 0;           // 已存键值对个数

    @SuppressWarnings("unchecked")
    public MyHashMap() {
        buckets = (Node<K, V>[]) new Node[8];    // 初始 8 个桶
    }

    // key -> 桶下标;hashCode 可能为负,先清掉符号位
    private int indexOf(K key, int cap) {
        return (key.hashCode() & 0x7fffffff) % cap;
    }

    public void put(K key, V val) {
        int i = indexOf(key, buckets.length);
        for (Node<K, V> p = buckets[i]; p != null; p = p.next)
            if (p.key.equals(key)) { p.val = val; return; } // key 已存在:覆盖
        buckets[i] = new Node<>(key, val, buckets[i]);      // 头插进链
        size++;
        if (size > buckets.length * 0.75) resize();         // 负载因子 > 0.75:扩容
    }

    public V get(K key) {
        int i = indexOf(key, buckets.length);
        for (Node<K, V> p = buckets[i]; p != null; p = p.next)
            if (p.key.equals(key)) return p.val;  // 在这个桶里逐个比对 key
        return null;                              // 整条链都没有:表里不存在
    }

    public V remove(K key) {
        int i = indexOf(key, buckets.length);
        Node<K, V> p = buckets[i], prev = null;
        while (p != null) {
            if (p.key.equals(key)) {
                if (prev == null) buckets[i] = p.next; // 它是链头
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
                int i = indexOf(p.key, buckets.length); // 桶数变了:必须重算
                p.next = buckets[i];                    // 头插进新桶
                buckets[i] = p;
                p = next;
            }
        }
    }
}`,
            },
            hl: [21, 22, 31, 63],
            note: {
              en: (
                <>
                  <b>Two details.</b> Java cannot create an array of a generic
                  type directly, which is why there is a cast.{" "}
                  <code>&amp; 0x7fffffff</code> clears the sign bit: hashCode can
                  be negative, and in Java a negative number modulo a positive
                  one is still negative, which would be an invalid index. The
                  real HashMap goes further — its capacity is always a power of
                  two, so it replaces the modulo with a bitmask, and before
                  masking it mixes the high bits into the low bits with{" "}
                  <code>h ^ (h &gt;&gt;&gt; 16)</code>, so that keys differing
                  only in the high bits do not all land in the same bucket.
                </>
              ),
              zh: (
                <>
                  <b>两个细节:</b>Java 不能直接 new 泛型数组,所以有那行强转;
                  <code>&amp; 0x7fffffff</code> 用来清掉符号位 —— hashCode
                  可能为负,而 Java 里负数取模仍是负数,会得到非法下标。
                  真正的 HashMap 更进一步:容量恒为 2 的幂,于是用位与代替取模;
                  取低位之前还会用{" "}
                  <code>h ^ (h &gt;&gt;&gt; 16)</code>{" "}
                  把高位混进低位,避免只在高位不同的 key 全挤进同一个桶。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `class MyHashMap:
    def __init__(self):
        # 8 buckets; each bucket is a list of [key, val] pairs
        self.buckets = [[] for _ in range(8)]
        self.size = 0

    def _index(self, key, cap):
        return hash(key) % cap        # built-in hash(): any hashable object

    def put(self, key, val):
        b = self.buckets[self._index(key, len(self.buckets))]
        for pair in b:
            if pair[0] == key:        # key exists: overwrite
                pair[1] = val
                return
        b.append([key, val])          # new pair goes into the bucket
        self.size += 1
        if self.size > len(self.buckets) * 0.75:
            self._resize()            # load factor > 0.75: grow

    def get(self, key):
        b = self.buckets[self._index(key, len(self.buckets))]
        for k, v in b:                # compare the keys in this bucket
            if k == key:
                return v
        return None                   # not found

    def remove(self, key):
        b = self.buckets[self._index(key, len(self.buckets))]
        for i, (k, _) in enumerate(b):
            if k == key:
                self.size -= 1
                return b.pop(i)[1]    # take it out, return the old value
        return None

    def _resize(self):
        old = self.buckets
        self.buckets = [[] for _ in range(len(old) * 2)]  # twice as many buckets
        for bucket in old:
            for k, v in bucket:
                # the bucket count changed, so every key needs a new index
                self.buckets[self._index(k, len(self.buckets))].append([k, v])`,
              zh: `class MyHashMap:
    def __init__(self):
        # 8 个桶;每个桶是一个装 [key, val] 的 list
        self.buckets = [[] for _ in range(8)]
        self.size = 0

    def _index(self, key, cap):
        return hash(key) % cap        # 内置 hash():任何可哈希对象都能算

    def put(self, key, val):
        b = self.buckets[self._index(key, len(self.buckets))]
        for pair in b:
            if pair[0] == key:        # key 已存在:覆盖
                pair[1] = val
                return
        b.append([key, val])          # 新键值对挂进桶
        self.size += 1
        if self.size > len(self.buckets) * 0.75:
            self._resize()            # 负载因子 > 0.75:扩容

    def get(self, key):
        b = self.buckets[self._index(key, len(self.buckets))]
        for k, v in b:                # 在这个桶里逐个比对 key
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
                # 桶数变了,每个 key 都要重新算下标
                self.buckets[self._index(k, len(self.buckets))].append([k, v])`,
            },
            hl: [7, 8, 18, 19, 41, 42],
            note: {
              en: (
                <>
                  <b>This is a teaching version.</b> CPython&apos;s real dict
                  uses open addressing rather than chaining, and it keeps the
                  entries in a separate compact array in insertion order. Also,{" "}
                  <code>hash()</code> for <code>str</code> is randomized with a
                  per-process seed by default (a defence against HashDoS), so
                  the numeric value of <code>hash(&quot;abc&quot;)</code> differs
                  between runs and must never be relied on.
                </>
              ),
              zh: (
                <>
                  <b>这是教学版。</b>CPython 真正的 dict 用开放寻址而非链地址,
                  并且把条目按插入顺序存在另一个紧凑数组里。另外,
                  <code>str</code> 的 <code>hash()</code> 默认按进程加随机盐
                  (防 HashDoS),所以 <code>hash(&quot;abc&quot;)</code>{" "}
                  的具体数值每次运行都不同,绝不能依赖它。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `class MyHashMap {
  constructor() {
    this.buckets = Array.from({ length: 8 }, () => []); // 8 buckets
    this.size = 0;
  }

  _index(key, cap) {
    // polynomial string hash; >>> 0 keeps h a 32-bit unsigned integer
    let h = 0;
    for (const ch of String(key)) h = (h * 31 + ch.codePointAt(0)) >>> 0;
    return h % cap;
  }

  put(key, val) {
    const b = this.buckets[this._index(key, this.buckets.length)];
    for (const pair of b) {
      if (pair[0] === key) { pair[1] = val; return; } // key exists: overwrite
    }
    b.push([key, val]);                  // new pair goes into the bucket
    this.size++;
    if (this.size > this.buckets.length * 0.75) this._resize();
  }

  get(key) {
    const b = this.buckets[this._index(key, this.buckets.length)];
    for (const [k, v] of b) if (k === key) return v; // compare keys in this bucket
    return undefined;                                // not found
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
        // the bucket count changed, so every key needs a new index
        this.buckets[this._index(k, this.buckets.length)].push([k, v]);
  }
}`,
              zh: `class MyHashMap {
  constructor() {
    this.buckets = Array.from({ length: 8 }, () => []); // 8 个桶
    this.size = 0;
  }

  _index(key, cap) {
    // 字符串多项式哈希;>>> 0 把 h 压回 32 位无符号整数
    let h = 0;
    for (const ch of String(key)) h = (h * 31 + ch.codePointAt(0)) >>> 0;
    return h % cap;
  }

  put(key, val) {
    const b = this.buckets[this._index(key, this.buckets.length)];
    for (const pair of b) {
      if (pair[0] === key) { pair[1] = val; return; } // key 已存在:覆盖
    }
    b.push([key, val]);                  // 新键值对挂进桶
    this.size++;
    if (this.size > this.buckets.length * 0.75) this._resize();
  }

  get(key) {
    const b = this.buckets[this._index(key, this.buckets.length)];
    for (const [k, v] of b) if (k === key) return v; // 在这个桶里比对 key
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
        // 桶数变了,每个 key 都要重新算下标
        this.buckets[this._index(k, this.buckets.length)].push([k, v]);
  }
}`,
            },
            hl: [7, 8, 9, 10, 11, 21, 43, 44],
            note: {
              en: (
                <>
                  <b>What this toy version gives up:</b> it converts every key
                  to a string before hashing, so two different objects become
                  the same key. A real <code>Map</code> does not do that. It
                  accepts any value as a key, compares object keys by identity,
                  and iterates in insertion order.
                </>
              ),
              zh: (
                <>
                  <b>这个玩具版放弃了什么:</b>它先把所有 key 转成字符串再哈希,
                  于是两个不同的对象会变成同一个 key。真正的 <code>Map</code>{" "}
                  不这样:任何值都能当 key,对象 key 按身份比较,
                  遍历还保持插入顺序。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "What these five methods already answer",
            zh: "这五个方法已经回答了什么",
          }}
        >
          <T
            en={
              <p>
                &quot;What happens during put?&quot; &quot;What happens when the
                table grows?&quot; &quot;Why is get O(1) on average?&quot; Each
                answer is a line above, and you can point at it. What is left
                out — treeified buckets, thread safety, ConcurrentHashMap — is
                added on top of this same skeleton.
              </p>
            }
            zh={
              <p>
                「put 的流程是什么?」「扩容时发生了什么?」「为什么 get
                平均 O(1)?」—— 每个答案都是上面的某一行,你可以指着它说。
                没写进来的部分(树化、线程安全、ConcurrentHashMap)
                都是在这套骨架上加东西。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §05 三语言对照 ================= */}
      <Section
        id="langs"
        index="05"
        title={{
          en: "Three languages: Map and Set",
          zh: "三语言对照:Map 与 Set",
        }}
        desc={{
          en: "One abstraction in two shapes: a dictionary from key to value, and a set that stores keys only.",
          zh: "同一个抽象的两种形态:key → value 的字典,和只存 key 的集合",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                Every language ships an industrial-strength hash table, and each
                ships it in two shapes. A <strong>Map</strong> (dictionary)
                stores key-value pairs. A <strong>Set</strong> stores keys only
                — it is the same hash table with no value attached, which is why
                a membership test is as fast as a map lookup. The APIs are
                similar. The mistakes are language-specific:
              </p>
            }
            zh={
              <p>
                每种语言都内置了工业级的哈希表,而且都是两副面孔:
                <strong>Map(字典)</strong>存键值对,<strong>Set(集合)</strong>
                只存 key —— 它就是不带 value 的同一张哈希表,
                所以「在不在」查得和查字典一样快。API 大同小异,坑各有各的:
              </p>
            }
          />
        </div>
        <CodeTabs
          title="hash_basics"
          java={{
            code: {
              en: `import java.util.*;

// Map: HashMap - a dictionary
Map<String, Integer> cnt = new HashMap<>();
cnt.put("apple", 1);                  // insert or overwrite
cnt.get("apple");                     // read; returns null if absent
cnt.getOrDefault("pear", 0);          // read with a default instead of null
cnt.containsKey("apple");             // is this key present
cnt.merge("apple", 1, Integer::sum);  // the short way to count occurrences
cnt.remove("apple");
cnt.size();

for (Map.Entry<String, Integer> e : cnt.entrySet())
    System.out.println(e.getKey() + " -> " + e.getValue());

// Set: HashSet - only "is it there"
Set<Integer> seen = new HashSet<>();
seen.add(7);
seen.contains(7);                     // true, O(1) on average

// If you know how many entries are coming, ask for the room up front:
Map<String, Integer> big = new HashMap<>(10000);`,
              zh: `import java.util.*;

// Map:HashMap —— 字典
Map<String, Integer> cnt = new HashMap<>();
cnt.put("apple", 1);                  // 插入或覆盖
cnt.get("apple");                     // 取值;不存在返回 null
cnt.getOrDefault("pear", 0);          // 取值带默认,避免拿到 null
cnt.containsKey("apple");             // 有这个 key 吗
cnt.merge("apple", 1, Integer::sum);  // 计数 +1 的简写
cnt.remove("apple");
cnt.size();

for (Map.Entry<String, Integer> e : cnt.entrySet())
    System.out.println(e.getKey() + " -> " + e.getValue());

// Set:HashSet —— 只关心「在不在」
Set<Integer> seen = new HashSet<>();
seen.add(7);
seen.contains(7);                     // true,平均 O(1)

// 能预估元素个数,就提前把地方要出来:
Map<String, Integer> big = new HashMap<>(10000);`,
            },
            note: {
              en: (
                <>
                  <b>The contract:</b> if you use your own class as a key,{" "}
                  <b>overriding equals means you must also override hashCode</b>
                  . A HashMap first uses hashCode to pick the bucket, then uses
                  equals inside that bucket. Two equal objects with different
                  hash codes go to different buckets, and equals is never even
                  called. A second rule follows: <b>do not modify a key after
                  putting it in the map</b> — the entry stays in the bucket
                  chosen by the old hash and can no longer be found. HashMap
                  keeps no order: use LinkedHashMap for insertion order and
                  TreeMap for sorted keys.
                </>
              ),
              zh: (
                <>
                  <b>契约:</b>用自定义类当 key 时,
                  <b>重写了 equals 就必须重写 hashCode</b>。HashMap 先用 hashCode
                  找桶,再在桶内用 equals 比对;两个「相等」的对象若哈希不同,
                  会落进不同的桶,equals 根本没机会执行。由此还有第二条:
                  <b>放进表之后不要再修改 key</b> ——
                  条目还待在旧哈希选中的桶里,再也找不到了。HashMap 不保序:
                  要插入序用 LinkedHashMap,要排序用 TreeMap。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `# dict - built into the language, with its own literal syntax
cnt = {"apple": 1}
cnt["pear"] = 2              # insert or overwrite
cnt["apple"]                 # read - raises KeyError if the key is absent
cnt.get("kiwi", 0)           # safe read: a default instead of an error
"apple" in cnt               # is this key present, O(1) on average
del cnt["apple"]
len(cnt)

for k, v in cnt.items():     # 3.7+ guarantees insertion order
    print(k, v)

# set
seen = {1, 2, 3}
seen.add(7)
7 in seen                    # True

# two helpers worth knowing
from collections import Counter, defaultdict
Counter("aabbc")             # Counter({'a':2, 'b':2, 'c':1})
d = defaultdict(list)        # a missing key builds its default value
d["group"].append("x")       # no need to check whether the key exists

# a key must be hashable, which in practice means immutable:
ok = {(1, 2): "a tuple can be a key"}
# bad = {[1, 2]: "..."}      # TypeError: unhashable type: 'list'`,
              zh: `# dict —— 语言级内置,有自己的字面量语法
cnt = {"apple": 1}
cnt["pear"] = 2              # 插入或覆盖
cnt["apple"]                 # 取值 —— key 不存在会抛 KeyError
cnt.get("kiwi", 0)           # 安全取值:给默认值,不抛异常
"apple" in cnt               # 有这个 key 吗,平均 O(1)
del cnt["apple"]
len(cnt)

for k, v in cnt.items():     # 3.7+ 保证按插入顺序遍历
    print(k, v)

# set
seen = {1, 2, 3}
seen.add(7)
7 in seen                    # True

# 两个值得记住的帮手
from collections import Counter, defaultdict
Counter("aabbc")             # Counter({'a':2, 'b':2, 'c':1})
d = defaultdict(list)        # 访问缺失的 key 时自动造出默认值
d["group"].append("x")       # 不用先判断 key 在不在

# key 必须可哈希,实践中也就意味着不可变:
ok = {(1, 2): "a tuple can be a key"}
# bad = {[1, 2]: "..."}      # TypeError: unhashable type: 'list'`,
            },
            note: {
              en: (
                <>
                  <b>Common mistakes:</b> a mutable object such as{" "}
                  <code>list</code>, <code>dict</code>, or <code>set</code> has
                  no <code>__hash__</code>, so it cannot be a key. If its
                  contents changed, its hash would change and the entry would be
                  lost. A tuple is immutable and can be a key, provided
                  everything inside it is hashable too. And the difference
                  between <code>d[k]</code> and <code>d.get(k)</code> — raising
                  KeyError versus returning None — catches most beginners once.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>可变对象(<code>list</code> / <code>dict</code> /{" "}
                  <code>set</code>)没有 <code>__hash__</code>,不能当 key ——
                  内容一变哈希就变,条目会失联。tuple 不可变所以可以,
                  前提是它里面装的也全部可哈希。另外,<code>d[k]</code> 与{" "}
                  <code>d.get(k)</code> 的区别(抛 KeyError 还是返回 None)
                  几乎每个新手都会踩一次。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// Map - a real hash table; a key can be any value
const cnt = new Map();
cnt.set("apple", 1);               // insert or overwrite (returns the Map, so it chains)
cnt.get("apple");                  // read; returns undefined if absent
cnt.has("apple");                  // is this key present
cnt.set("apple", (cnt.get("apple") ?? 0) + 1); // count occurrences
cnt.delete("apple");
cnt.size;                          // a property, not a method

for (const [k, v] of cnt) console.log(k, v); // insertion order

// Set
const seen = new Set([1, 2, 3]);
seen.add(7);
seen.has(7);                       // true

// A plain object used as a dictionary - three problems:
const obj = {};
obj[1] = "a";
obj["1"];            // "a" - keys become strings, so 1 and "1" are one key
"toString" in obj;   // true - keys inherited from the prototype
// a "__proto__" key coming from user input can modify the prototype`,
              zh: `// Map —— 真正的哈希表,任何值都能当 key
const cnt = new Map();
cnt.set("apple", 1);               // 插入或覆盖(返回 Map 本身,可链式调用)
cnt.get("apple");                  // 取值;不存在返回 undefined
cnt.has("apple");                  // 有这个 key 吗
cnt.set("apple", (cnt.get("apple") ?? 0) + 1); // 计数 +1
cnt.delete("apple");
cnt.size;                          // 是属性,不是方法

for (const [k, v] of cnt) console.log(k, v); // 按插入顺序

// Set
const seen = new Set([1, 2, 3]);
seen.add(7);
seen.has(7);                       // true

// 用普通 Object 当字典 —— 三个问题:
const obj = {};
obj[1] = "a";
obj["1"];            // "a" —— key 被转成字符串,1 和 "1" 是同一个 key
"toString" in obj;   // true —— 从原型上继承来的 key
// 用户输入的 "__proto__" 当 key,可以改动原型`,
            },
            note: {
              en: (
                <>
                  <b>Common mistakes:</b> an object key can only be a string or
                  a symbol, so numbers and objects are converted to strings
                  first. An object also inherits keys from its prototype, and a{" "}
                  <code>__proto__</code> key arriving from user input is a real
                  security problem. Iteration order is another surprise: keys
                  that look like array indexes come first, in ascending numeric
                  order. Use <code>Map</code> and <code>Set</code> for
                  dictionaries. If you really need a bare object,{" "}
                  <code>Object.create(null)</code> gives one with no prototype.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>Object 的 key 只能是 string 或 symbol,
                  数字和对象都会先被转成字符串;它还会继承原型上的 key,
                  而用户输入的 <code>__proto__</code> 当 key 是真实存在的安全问题。
                  遍历顺序也有意外:「长得像数组下标」的 key
                  会排在最前面,并按数值升序。要字典就用 <code>Map</code> /{" "}
                  <code>Set</code>;确实需要一个纯净对象时,用{" "}
                  <code>Object.create(null)</code>。
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
                <th>Java (HashMap)</th>
                <th>Python (dict)</th>
                <th>JavaScript (Map)</th>
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
                <td>
                  <code>new HashMap&lt;&gt;()</code>
                </td>
                <td>
                  <code>{"{}"}</code>
                </td>
                <td>
                  <code>new Map()</code>
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Insert or update" zh="插入 / 更新" />
                </td>
                <td>
                  <code>m.put(k, v)</code>
                </td>
                <td>
                  <code>m[k] = v</code>
                </td>
                <td>
                  <code>m.set(k, v)</code>
                </td>
                <td>
                  <BigO
                    o="1"
                    label={{ en: "O(1) amortized", zh: "均摊 O(1)" }}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Read" zh="取值" />
                </td>
                <td>
                  <code>m.get(k)</code>
                </td>
                <td>
                  <code>m[k]</code>{" "}
                  <T en="(raises if absent)" zh="(缺失抛异常)" />
                </td>
                <td>
                  <code>m.get(k)</code>
                </td>
                <td>
                  <BigO o="1" label={{ en: "O(1) avg", zh: "平均 O(1)" }} />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Read with a default" zh="取值带默认" />
                </td>
                <td>
                  <code>m.getOrDefault(k, d)</code>
                </td>
                <td>
                  <code>m.get(k, d)</code>
                </td>
                <td>
                  <code>m.get(k) ?? d</code>
                </td>
                <td>
                  <BigO o="1" label={{ en: "O(1) avg", zh: "平均 O(1)" }} />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Contains key" zh="含 key 否" />
                </td>
                <td>
                  <code>m.containsKey(k)</code>
                </td>
                <td>
                  <code>k in m</code>
                </td>
                <td>
                  <code>m.has(k)</code>
                </td>
                <td>
                  <BigO o="1" label={{ en: "O(1) avg", zh: "平均 O(1)" }} />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Delete" zh="删除" />
                </td>
                <td>
                  <code>m.remove(k)</code>
                </td>
                <td>
                  <code>del m[k]</code> / <code>m.pop(k, None)</code>
                </td>
                <td>
                  <code>m.delete(k)</code>
                </td>
                <td>
                  <BigO o="1" label={{ en: "O(1) avg", zh: "平均 O(1)" }} />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Size" zh="大小" />
                </td>
                <td>
                  <code>m.size()</code>
                </td>
                <td>
                  <code>len(m)</code>
                </td>
                <td>
                  <code>m.size</code>
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Iterate" zh="遍历" />
                </td>
                <td>
                  <code>for (var e : m.entrySet())</code>
                </td>
                <td>
                  <code>for k, v in m.items():</code>
                </td>
                <td>
                  <code>for (const [k, v] of m)</code>
                </td>
                <td>
                  <BigO o="n" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Iteration order" zh="遍历顺序" />
                </td>
                <td>
                  <T
                    en="No guarantee (LinkedHashMap keeps insertion order)"
                    zh="无保证(要顺序用 LinkedHashMap)"
                  />
                </td>
                <td>
                  <T
                    en="Insertion order (guaranteed since 3.7)"
                    zh="插入序(3.7 起由规范保证)"
                  />
                </td>
                <td>
                  <T
                    en="Insertion order (guaranteed)"
                    zh="插入序(规范保证)"
                  />
                </td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="deep"
          title={{
            en: "Why an IDE always generates equals and hashCode together",
            zh: "为什么 IDE 生成 equals 时总是连着 hashCode",
          }}
        >
          <T
            en={
              <p>
                IntelliJ and Eclipse generate the two methods in one action,
                Lombok&apos;s annotation is called{" "}
                <code>@EqualsAndHashCode</code>, and a Java record generates
                both automatically. The whole ecosystem enforces one rule:{" "}
                <b>objects that are equal must have equal hash codes</b>. A
                HashMap lookup has two steps — hashCode picks the bucket, equals
                confirms the match inside it. Break the rule and the first step
                already goes to the wrong bucket.
              </p>
            }
            zh={
              <p>
                IntelliJ / Eclipse 生成 equals 时一并生成 hashCode,Lombok
                的注解干脆叫 <code>@EqualsAndHashCode</code>,Java 的 record
                两个都自动生成。整个生态都在执行同一条规则:
                <b>equals 相等的对象,hashCode 必须相等</b>。HashMap
                的查找分两步:先用 hashCode 找桶,再用 equals 在桶内确认。
                规则一破,第一步就走进了错误的桶。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §06 套路与精讲 ================= */}
      <Section
        id="patterns"
        index="06"
        title={{
          en: "Three signals: seen before, pairing, grouping",
          zh: "哈希三大信号:见过吗 · 配对 · 分组",
        }}
        desc={{
          en: "When a problem sounds like one of these three, reach for a hash table.",
          zh: "读题时听到这三种信号,手就该伸向哈希表",
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
                Every hash-table solution in this chapter does the same thing:{" "}
                <strong>
                  it spends O(n) memory so that a search that would cost O(n)
                  becomes one lookup that costs O(1) on average
                </strong>
                . Three signals tell you when that applies:
              </p>
            }
            zh={
              <p>
                本章所有哈希解法做的都是同一件事:
                <strong>
                  花 O(n) 的空间,把一次 O(n) 的「回头找一遍」换成一次平均 O(1)
                  的查表
                </strong>
                。什么时候该这么做?听三个信号:
              </p>
            }
          />
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="SIGNAL 01" zh="信号一" />
            </div>
            <div className="card-title">
              <T en="&quot;Seen before?&quot; → Set" zh="「见过吗」→ Set" />
            </div>
            <T
              en={
                <p>
                  Detecting duplicates, detecting a cycle, computing an
                  intersection. You only care whether a value exists, not what
                  is attached to it. → LC 217, 202, 349, 128.
                </p>
              }
              zh={
                <p>
                  判重、判环、求交集 —— 只关心某个值在不在,
                  不关心它带着什么信息。→ LC 217、202、349、128。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="SIGNAL 02" zh="信号二" />
            </div>
            <div className="card-title">
              <T en="&quot;Find the partner&quot; → Map" zh="「配对」→ Map" />
            </div>
            <T
              en={
                <p>
                  Looking for &quot;the other number that sums to k&quot;, or
                  for where a value appeared. The key is{" "}
                  <b>the value you want to be found by</b>; the value is the
                  index or the count. → LC 1, 454, 560.
                </p>
              }
              zh={
                <p>
                  找「和为 k 的另一半」「某个值出现在哪」:key 存
                  <b>你希望被谁找到的那个值</b>,value 存下标或次数。→ LC
                  1、454、560。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="SIGNAL 03" zh="信号三" />
            </div>
            <div className="card-title">
              <T
                en="&quot;Group and count&quot; → Map&lt;signature, list&gt;"
                zh="「分组计数」→ Map&lt;签名, 列表&gt;"
              />
            </div>
            <T
              en={
                <p>
                  Put items that are the same in some sense under one key.
                  Design a signature function so that items of the same kind
                  always produce the same key. → LC 49, 383, 299.
                </p>
              }
              zh={
                <p>
                  把「本质相同」的东西归到同一个 key 下:设计一个签名函数,
                  让同类必定得到同一个 key。→ LC 49、383、299。
                </p>
              }
            />
          </div>
        </div>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Deep dive A" zh="精讲 A" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 1 · Two Sum" zh="LC 1 · 两数之和" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">
              EASY
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                The first problem on LeetCode, and the prototype of the pairing
                signal. <b>The task:</b> find two numbers in the array that add
                up to target, and return their indexes. <b>Brute force:</b> two
                nested loops over every pair, O(n²). <b>Where the improvement
                comes from:</b> look at what the inner loop is doing. For each
                i, it searches the part of the array before i for target −
                nums[i]. That is a linear search. Put the numbers you have
                already passed into a hash table, and that search becomes one
                O(1) lookup:
              </p>
            }
            zh={
              <p>
                LeetCode 的第一题,也是「配对」信号的原型。<b>题意:</b>
                在数组中找两个数,和等于 target,返回它们的下标。<b>暴力:</b>
                双层循环枚举所有数对,O(n²)。<b>改进的来源:</b>
                看看内层循环在干什么 —— 对每个 i,它在 i
                前面的部分里找 target − nums[i],这是一次线性查找。
                把「已经走过的数」存进哈希表,这次查找就变成一次 O(1) 的查表:
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 1 · one pass: look up first, record second (target = 9)",
            zh: "LC 1 · 一遍哈希:先查表,再存表(target = 9)",
          }}
          frames={F1}
        />
        <CodeTabs
          title="lc1_two_sum"
          java={{
            code: {
              en: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>(); // value -> index
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];       // the partner this number needs
            if (seen.containsKey(need))        // look up first: has it appeared?
                return new int[]{seen.get(need), i};
            seen.put(nums[i], i);              // record second
        }
        return new int[0];
    }
}`,
              zh: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>(); // 值 -> 下标
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];       // 这个数需要的另一半
            if (seen.containsKey(need))        // 先查:另一半来过吗?
                return new int[]{seen.get(need), i};
            seen.put(nums[i], i);              // 再存:把自己登记进表
        }
        return new int[0];
    }
}`,
            },
            hl: [5, 6, 7, 8],
          }}
          python={{
            code: {
              en: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}                      # value -> index
        for i, v in enumerate(nums):
            need = target - v          # the partner this number needs
            if need in seen:           # look up first: has it appeared?
                return [seen[need], i]
            seen[v] = i                # record second
        return []`,
              zh: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}                      # 值 -> 下标
        for i, v in enumerate(nums):
            need = target - v          # 这个数需要的另一半
            if need in seen:           # 先查:另一半来过吗?
                return [seen[need], i]
            seen[v] = i                # 再存:把自己登记进表
        return []`,
            },
            hl: [5, 6, 7, 8],
          }}
          js={{
            code: {
              en: `var twoSum = function (nums, target) {
  const seen = new Map();              // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];     // the partner this number needs
    if (seen.has(need))                // look up first: has it appeared?
      return [seen.get(need), i];
    seen.set(nums[i], i);              // record second
  }
  return [];
};`,
              zh: `var twoSum = function (nums, target) {
  const seen = new Map();              // 值 -> 下标
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];     // 这个数需要的另一半
    if (seen.has(need))                // 先查:另一半来过吗?
      return [seen.get(need), i];
    seen.set(nums[i], i);              // 再存:把自己登记进表
  }
  return [];
};`,
            },
            hl: [4, 5, 6, 7],
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
                Time <b>O(n)</b>, space <b>O(n)</b> — memory traded for time.
                Follow-up one: why look up before recording? It stops a number
                from pairing with itself. With target = 8 and nums[i] = 4,
                recording first would let 4 match its own entry. Follow-up two:
                what if the array is sorted? Then two pointers moving toward
                each other solve it in O(n) time and O(1) space (LC 167, covered
                in the array chapter). Sorted input suggests two pointers;
                unsorted input suggests a hash table.
              </p>
            }
            zh={
              <p>
                时间 <b>O(n)</b>、空间 <b>O(n)</b> —— 典型的用空间换时间。
                追问一:为什么先查再存?为了防止自己和自己配对 ——
                target = 8、nums[i] = 4 时,先存后查会让 4 匹配到自己那条记录。
                追问二:数组有序呢?那就用对撞双指针,O(n) 时间、O(1) 空间(LC
                167,数组章讲过)。有序想双指针,无序想哈希表。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Deep dive B" zh="精讲 B" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 49 · Group Anagrams" zh="LC 49 · 字母异位词分组" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">
              MEDIUM
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>The task:</b> group the words that contain the same letters
                in a different order. <b>Brute force:</b> compare every pair of
                words, O(n² · k). <b>Where the improvement comes from:</b>{" "}
                instead of comparing words with each other, give every word a{" "}
                <strong>signature</strong> — a value that is identical for
                anagrams and different for everything else. Then a Map from
                signature to list collects the groups on its own:
              </p>
            }
            zh={
              <p>
                <b>题意:</b>把字母相同、顺序不同的词分到同一组。<b>暴力:</b>
                两两比较是否互为异位词,O(n² · k)。<b>改进的来源:</b>
                与其让词互相比较,不如给每个词一个<strong>签名</strong> ——
                一个「异位词相同、其他一律不同」的值。
                然后一张 Map&lt;签名, 列表&gt; 就会自己把组分好:
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 49 · grouping by a sorted signature",
            zh: "LC 49 · 排序签名分组,逐帧",
          }}
          frames={F49}
          cellW={64}
        />
        <CodeTabs
          title="lc49_group_anagrams"
          java={{
            code: {
              en: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String s : strs) {
            char[] cs = s.toCharArray();
            Arrays.sort(cs);                    // sorted letters = the signature
            String key = new String(cs);
            groups.computeIfAbsent(key, k -> new ArrayList<>())
                  .add(s);                      // same signature, same group
        }
        return new ArrayList<>(groups.values());
    }
}`,
              zh: `class Solution {
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
            },
            hl: [6, 7, 8, 9],
          }}
          python={{
            code: {
              en: `from collections import defaultdict

class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        groups = defaultdict(list)
        for s in strs:
            key = "".join(sorted(s))   # sorted letters = the signature
            groups[key].append(s)      # same signature, same group
        return list(groups.values())`,
              zh: `from collections import defaultdict

class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        groups = defaultdict(list)
        for s in strs:
            key = "".join(sorted(s))   # 排序后的字母 = 签名
            groups[key].append(s)      # 同签名进同一组
        return list(groups.values())`,
            },
            hl: [7, 8],
          }}
          js={{
            code: {
              en: `var groupAnagrams = function (strs) {
  const groups = new Map();
  for (const s of strs) {
    const key = [...s].sort().join("");   // sorted letters = the signature
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);              // same signature, same group
  }
  return [...groups.values()];
};`,
              zh: `var groupAnagrams = function (strs) {
  const groups = new Map();
  for (const s of strs) {
    const key = [...s].sort().join("");   // 排序后的字母 = 签名
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);              // 同签名进同一组
  }
  return [...groups.values()];
};`,
            },
            hl: [4, 5, 6],
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "Two signatures, and when to switch",
            zh: "两种签名,以及什么时候换",
          }}
        >
          <T
            en={
              <p>
                <b>Sorted signature:</b> O(k log k) per word, and the shortest
                to write. <b>Counting signature:</b> count the 26 letters and
                join the counts into a string such as &quot;a1e1t1&quot;, which
                is O(k) per word and better when the words are long. Both follow
                the same rule:{" "}
                <b>
                  the signature must capture exactly what makes two items belong
                  together
                </b>
                . The same idea returns in LC 249 (Group Shifted Strings) and LC
                205 (Isomorphic Strings).
              </p>
            }
            zh={
              <p>
                <b>排序签名:</b>每个词 O(k log k),写起来最短。
                <b>计数签名:</b>数出 26 个字母各出现几次,拼成
                &quot;a1e1t1&quot; 这样的字符串,每个词 O(k),
                词很长时更划算。两者遵循同一条规则:
                <b>签名必须恰好刻画「同组」的那个本质</b>。同样的思路会在 LC
                249(移位字符串分组)和 LC 205(同构字符串)里再次出现。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Deep dive C" zh="精讲 C" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 128 · Longest Consecutive Sequence"
              zh="LC 128 · 最长连续序列"
            />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">
              MEDIUM
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>The task:</b> in an unsorted array, find the length of the
                longest run of <strong>consecutive values</strong>. Their
                positions do not matter, and the solution must be O(n).{" "}
                <b>First idea:</b> sort and scan — but sorting is O(n log n),
                which the problem rules out. <b>Where the improvement comes
                from:</b> put every value into a set, and &quot;is x + 1
                present&quot; becomes O(1), so a run can be measured by walking
                right. Doing that from every value is still O(n²): in the run
                1..100 you would count from 1, then from 2, then from 3. One
                rule fixes it:{" "}
                <strong>only start counting at the beginning of a run</strong>,
                that is at a value x for which x − 1 is not in the set:
              </p>
            }
            zh={
              <p>
                <b>题意:</b>在无序数组中,求最长的<strong>数值连续</strong>
                序列的长度,元素位置无所谓,而且要求 O(n)。<b>第一反应:</b>
                排序后扫一遍 —— 但排序是 O(n log n),题目不允许。
                <b>改进的来源:</b>把所有值丢进 Set,「x + 1 在不在」就变成 O(1),
                于是可以从某个值往右走,数出一条序列的长度。
                但对每个值都这么做仍然是 O(n²):序列 1..100 里,
                从 1 数一遍、从 2 数一遍、从 3 再数一遍。
                加一条规则就解决了:<strong>只从序列的起点开始数</strong> ——
                起点就是「x − 1 不在 Set 里」的那个 x:
              </p>
            }
          />
        </div>
        <ArrayStepper
          title={{
            en: "LC 128 · a set, and counting only from the start of a run",
            zh: "LC 128 · Set + 只从起点数,逐帧",
          }}
          frames={F128}
        />
        <CodeTabs
          title="lc128_longest_consecutive"
          java={{
            code: {
              en: `class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int v : nums) set.add(v);         // O(1) membership from now on
        int best = 0;
        for (int v : set) {
            if (set.contains(v - 1)) continue; // not a start: skip it
            int len = 1;
            while (set.contains(v + len)) len++; // count right from the start
            best = Math.max(best, len);
        }
        return best;
    }
}`,
              zh: `class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int v : nums) set.add(v);         // 从此「在不在」平均 O(1)
        int best = 0;
        for (int v : set) {
            if (set.contains(v - 1)) continue; // 不是起点:跳过
            int len = 1;
            while (set.contains(v + len)) len++; // 从起点开始向右数
            best = Math.max(best, len);
        }
        return best;
    }
}`,
            },
            hl: [7, 8, 9],
          }}
          python={{
            code: {
              en: `class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        s = set(nums)                  # O(1) membership from now on
        best = 0
        for v in s:
            if v - 1 in s:             # not a start: skip it
                continue
            length = 1
            while v + length in s:     # count right from the start
                length += 1
            best = max(best, length)
        return best`,
              zh: `class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        s = set(nums)                  # 从此「在不在」平均 O(1)
        best = 0
        for v in s:
            if v - 1 in s:             # 不是起点:跳过
                continue
            length = 1
            while v + length in s:     # 从起点开始向右数
                length += 1
            best = max(best, length)
        return best`,
            },
            hl: [6, 7, 9, 10],
          }}
          js={{
            code: {
              en: `var longestConsecutive = function (nums) {
  const set = new Set(nums);           // O(1) membership from now on
  let best = 0;
  for (const v of set) {
    if (set.has(v - 1)) continue;      // not a start: skip it
    let len = 1;
    while (set.has(v + len)) len++;    // count right from the start
    best = Math.max(best, len);
  }
  return best;
};`,
              zh: `var longestConsecutive = function (nums) {
  const set = new Set(nums);           // 从此「在不在」平均 O(1)
  let best = 0;
  for (const v of set) {
    if (set.has(v - 1)) continue;      // 不是起点:跳过
    let len = 1;
    while (set.has(v + len)) len++;    // 从起点开始向右数
    best = Math.max(best, len);
  }
  return best;
};`,
            },
            hl: [5, 6, 7],
          }}
        />
        <Callout
          tone="win"
          title={{ en: "Why this is O(n)", zh: "为什么这是 O(n)" }}
        >
          <T
            en={
              <p>
                There is a nested while loop, but it only runs from the{" "}
                <b>start</b> of a run, and each run has <b>exactly one start</b>
                . Adding up all its iterations, every value is counted through
                once. n start checks on the outside, plus at most n steps on the
                inside, gives <b>O(n)</b>. This is the same amortized argument
                as the 2n bound for the sliding window in the array chapter.
                Follow-up: can you iterate over nums instead of the set? Yes,
                but duplicates would repeat the start check for no reason.
                Iterating the set is cleaner.
              </p>
            }
            zh={
              <p>
                这里确实有嵌套的 while,但它只从序列的<b>起点</b>启动,
                而每条序列<b>只有一个起点</b>。把所有 while
                的迭代加起来,每个值只被「数过」一次。外层 n
                次起点检查,加上内层总共至多 n 步,合起来 <b>O(n)</b>。
                这和数组章滑动窗口的 2n 论证是同一套均摊推理。
                追问:能不能遍历 nums 而不是 set?可以,
                但重复元素会白做几次起点检查 —— 遍历 set 更干净。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title={{
          en: "Problem set: 10 hash table problems",
          zh: "高频题单:哈希 10 题",
        }}
        desc={{
          en: "Grouped by signal, easiest first. LC 560, prefix sums plus a map, is the one to understand completely.",
          zh: "按信号分组、由易到难。LC 560(前缀和 + 哈希)务必吃透",
        }}
        badge={
          <span className="chip">
            <T en="Hot 100 selection" zh="Hot 100 精选" />
          </span>
        }
      >
        <ProblemSet ch="hash" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Eight questions. Get them all right to mark this chapter as complete.",
          zh: "8 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="hash" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                A hash table is <b>an array + a hash function + a plan for
                collisions</b>. The hash function turns a key into an index, so
                the O(1) jump that an array offers to integer indexes becomes
                available to any kind of key.
              </>
            ),
            zh: (
              <>
                哈希表 = <b>数组 + 哈希函数 + 冲突处理方案</b>。
                哈希函数把 key 算成下标,于是数组只给整数下标的 O(1)
                直达,任何 key 都能用上。
              </>
            ),
          },
          {
            en: (
              <>
                A hash function must be <b>deterministic, well spread, and
                fast</b>. There are more possible keys than buckets, so
                collisions are certain. Separate chaining stores a list per
                bucket (Java); open addressing probes for another slot (Python),
                which costs more at a high load factor and makes deletion need
                tombstones.
              </>
            ),
            zh: (
              <>
                哈希函数必须<b>确定、均匀、快</b>。可能的 key 比桶多,
                冲突必然发生。链地址法给每个桶挂一条链(Java);
                开放寻址则去探测别的空位(Python),
                它在高负载因子下代价更大,删除还得用墓碑。
              </>
            ),
          },
          {
            en: (
              <>
                Past the load factor (0.75 by default in Java) the table
                allocates a larger array and <b>rehashes every key</b>, because
                the index depends on the bucket count. One insert can therefore
                cost O(n), which is why insertion is O(1) amortized. Stated
                precisely: <b>average O(1)</b> with a good hash and a bounded
                load factor, <b>worst case O(n)</b> when many keys share a
                bucket.
              </>
            ),
            zh: (
              <>
                负载因子越线(Java 默认 0.75)后,表会申请更大的数组并
                <b>把每个 key 重新安放一次</b> —— 因为下标依赖桶数。
                所以某一次插入可能花 O(n),插入的严谨说法是均摊 O(1)。
                完整表述:哈希均匀且负载因子受控时<b>平均 O(1)</b>,
                大量 key 挤进同一个桶时<b>最坏 O(n)</b>。
              </>
            ),
          },
          {
            en: (
              <>
                One trap per language. Java: <b>overriding equals means
                overriding hashCode</b>, and never modify a key after inserting
                it. Python: mutable objects cannot be keys (a list cannot, a
                tuple of hashables can), and dict preserves insertion order
                since 3.7. JavaScript: use <b>Map, not a plain object</b> —
                object keys are converted to strings and the prototype
                contributes keys of its own.
              </>
            ),
            zh: (
              <>
                每种语言一个坑。Java:<b>重写 equals 就要重写 hashCode</b>,
                而且 key 放进表后不要再改。Python:可变对象不能当 key(list
                不行,元素全可哈希的 tuple 可以),3.7 起 dict 保持插入序。
                JavaScript:<b>用 Map,别用普通 Object</b> —— Object 的 key
                会被转成字符串,原型还会额外贡献 key。
              </>
            ),
          },
          {
            en: (
              <>
                Three signals: <b>&quot;seen before&quot; → Set; &quot;find the
                partner&quot; → Map from value to index or count; &quot;group
                and count&quot; → Map from signature to list</b>. A Set is a hash
                table that stores keys only. Prefix sums plus a map (LC 560) is
                Two Sum applied to prefix sums.
              </>
            ),
            zh: (
              <>
                三个解题信号:<b>「见过吗」→ Set;「配对」→ Map
                存「值 → 下标 / 次数」;「分组计数」→ Map&lt;签名, 列表&gt;</b>。
                Set 就是只存 key 的哈希表。前缀和 + 哈希(LC 560)
                就是把「两数之和」用在前缀和上。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="hash" />
    </main>
  );
}
