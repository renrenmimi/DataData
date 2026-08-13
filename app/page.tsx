"use client";

// 序章 · 世界地图 —— 全书入口。
// 三件事:① 建立「数据结构 = 组织方式」的第一直觉(变形 hero);
// ② 给出全书通用的两把尺子:内存模型 + Big-O(交互实验室);
// ③ 铺开 14 章世界地图,讲清怎么用这套课。

import Link from "next/link";
import "./home.css";
import { CHAPTERS } from "@/lib/curriculum";
import {
  Reveal,
  Section,
  Callout,
  BigO,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { Quiz, type QuizItem } from "@/lib/quiz";
import { CodeTabs } from "@/lib/code";
import { HeroMorph, BigOLab, RefLab } from "./home-viz";

/* ---------- 复杂度速查表数据 ---------- */

const CHEAT: {
  name: string;
  href: string;
  access: string;
  search: string;
  insert: string;
  del: string;
  note: string;
}[] = [
  { name: "数组 Array", href: "/array", access: "1", search: "n", insert: "n", del: "n", note: "按下标访问是它的核心能力;中间插删要搬移" },
  { name: "字符串 String", href: "/string", access: "1", search: "n", insert: "n", del: "n", note: "多数语言不可变:任何“修改”都是重建" },
  { name: "链表 Linked List", href: "/linked-list", access: "n", search: "n", insert: "1", del: "1", note: "插删 O(1) 的前提:你已经站在那个位置" },
  { name: "栈 Stack", href: "/stack", access: "n", search: "n", insert: "1", del: "1", note: "只碰顶端,push/pop 都是 O(1)" },
  { name: "队列 Queue", href: "/queue", access: "n", search: "n", insert: "1", del: "1", note: "只碰两端,入队/出队都是 O(1)" },
  { name: "哈希表 Hash Table", href: "/hash", access: "—", search: "1", insert: "1", del: "1", note: "平均 O(1);最坏(全冲突)退化为 O(n)" },
  { name: "二叉搜索树 BST", href: "/bst", access: "logn", search: "logn", insert: "logn", del: "logn", note: "平衡时 O(log n);退化成链表就是 O(n)" },
  { name: "堆 Heap", href: "/heap", access: "1", search: "n", insert: "logn", del: "logn", note: "访问指“看堆顶”;找任意元素它不擅长" },
  { name: "前缀树 Trie", href: "/trie", access: "—", search: "1", insert: "1", del: "1", note: "复杂度按词长 L 计,与词典大小无关" },
  { name: "并查集 Union-Find", href: "/union-find", access: "—", search: "1", insert: "1", del: "—", note: "近似 O(α(n)) ≈ O(1),需路径压缩+按秩合并" },
];

/* ---------- 序章 Quiz ---------- */

const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: "O(1) 到底是什么意思?",
    opts: [
      "操作耗时不随数据规模 n 增长 —— n 是 10 还是 10 亿,花的功夫一样",
      "这个操作只需要 1 秒钟",
      "这个操作只需要 1 行代码",
      "这个操作一定比 O(n) 的操作快",
    ],
    correct: 0,
    wrong: [
      undefined,
      "Big-O 跟“秒”没有关系 —— 它描述的是操作次数随 n 的增长趋势,不是绝对时间。",
      "代码行数和复杂度无关:一行 sort() 就是 O(n log n),十行加法也可以是 O(1)。",
      "小规模时未必:一个常数巨大的 O(1) 操作,可能比 n=5 的 O(n) 慢。Big-O 说的是 n 变大之后的趋势。",
    ],
    why: "Big-O 描述“增长趋势”:O(1) 表示成本是常数,与 n 无关。",
  },
  {
    type: "choice",
    q: (
      <>
        两层嵌套 for 循环,各自都从 0 走到 n-1,循环体是 O(1)。整体复杂度是?
      </>
    ),
    opts: ["O(n²)", "O(2n)", "O(n log n)", "O(n)"],
    correct: 0,
    wrong: [
      undefined,
      "两层循环是相乘不是相加:外层每走 1 步,内层要完整走 n 步,总共 n × n。",
      "n log n 通常来自“每层砍一半”的分治或排序,这里内层是完整的 n 步。",
      "那是单层循环。外层的每一步都触发内层完整跑一遍,总次数是 n × n。",
    ],
    why: "外层 n 次 × 内层 n 次 = n² 次,记作 O(n²)。",
  },
  {
    type: "choice",
    q: "某算法精确操作次数是 3n + 20,它的 Big-O 是?",
    opts: ["O(n)", "O(3n)", "O(n + 20)", "O(1)"],
    correct: 0,
    wrong: [
      undefined,
      "系数要扔掉:O(3n) 和 O(n) 增长趋势完全一样,约定写 O(n)。",
      "常数项也要扔掉:n 一大,+20 就微不足道了。",
      "3n + 20 会随 n 增长,不是常数。",
    ],
    why: "Big-O 只留最高阶、扔系数扔常数:3n + 20 → O(n)。",
  },
  {
    type: "fill",
    q: (
      <>
        在 1,000,000(10⁶)个元素的<b>有序</b>数组上做二分查找,最坏要比较大约多少次?(取整数)
      </>
    ),
    placeholder: "输入一个整数…",
    answers: ["20", "20次", "约20"],
    hint: (
      <>
        二分每比较一次就砍掉一半:10⁶ → 5×10⁵ → … 问题等价于 2 的多少次方 ≈ 10⁶(2¹⁰ = 1024 ≈ 10³)。
      </>
    ),
    why: "log₂(10⁶) ≈ 19.9,最坏约 20 次 —— 这就是 O(log n) 的恐怖之处:一百万的数据,20 步搞定。",
  },
  {
    type: "multi",
    q: "下面哪些说法是对的?(多选)",
    opts: [
      "Big-O 描述的是增长趋势,不是某次运行的真实耗时",
      "空间复杂度也用 Big-O 表示",
      "O(n²) 的算法在任何输入规模下都比 O(n) 的慢",
      "同一个问题可以有多种复杂度不同的解法",
    ],
    correct: [0, 1, 3],
    missHint: "还漏了对的项 —— 再想想 Big-O 的定义和“解法不唯一”这件事。",
    extraHint:
      "“O(n²) 一定更慢”是错的:n 很小时,常数小的 O(n²) 完全可能更快。Big-O 只保证 n 足够大之后的趋势。",
    why: "Big-O 是渐进趋势(时间与空间都适用),而优化算法正是在寻找复杂度更低的解法。",
  },
  {
    type: "choice",
    q: (
      <>
        执行 <code>b = a</code>(a 是个数组)之后修改 <code>b[0]</code>,发现{" "}
        <code>a[0]</code> 也变了。为什么?
      </>
    ),
    opts: [
      "赋值复印的是「地址纸条」(引用),a、b 指向内存里同一个数组",
      "这是编程语言的 bug",
      "赋值时语言在后台自动同步两个数组的内容",
      "因为数组名是特殊关键字,不能被赋值",
    ],
    correct: 0,
    wrong: [
      undefined,
      "这是三种语言一致的设计:对象赋值传递引用,不复制内容 —— 复制大对象太贵了。",
      "没有任何同步发生 —— 根本就只有一个数组,两个变量都指向它。",
      "数组名只是普通变量,里面装的是一张写着地址的纸条。",
    ],
    why: "对象赋值 = 复印纸条:a、b 指向同一个盒子。想要独立副本要显式拷贝(如 slice/copy)。链表、树、图全靠这张纸条连起来。",
  },
  {
    type: "choice",
    q: "数组按下标访问 arr[i] 为什么能做到 O(1)?",
    opts: [
      "因为元素连续存放,地址 = 首地址 + i × 单个元素大小,一次乘加直接算出位置",
      "因为计算机对数组做了特殊缓存",
      "因为数组在编译时就把每个元素的位置都记住了",
      "因为下标访问底层其实也是从头遍历,只是很快",
    ],
    correct: 0,
    wrong: [
      undefined,
      "缓存能让访问更快,但 O(1) 的本质是“地址可以直接算出来”,和缓存无关。",
      "不需要记住每个位置 —— 连续存放让位置可以随时用一条公式算出来。",
      "恰恰相反,这正是链表的行为。数组的精髓就是不用遍历。",
    ],
    why: "连续内存 + 定长元素 ⇒ 地址一条公式算出:base + i × size。这个公式贯穿全书。",
  },
];

/* ---------- 页面 ---------- */

export default function Home() {
  return (
    <main className="page" data-ch="home">
      {/* Hero */}
      <header className="home-hero">
        <div>
          <span className="home-kicker">
            <span className="pulse" />
            INTERACTIVE COURSE · 14 CHAPTERS
          </span>
          <h1 className="hero-title">
            把数据结构
            <br />
            <span className="grad">拆成慢动作</span>
          </h1>
          <p className="hero-essence">
            每一章:内存图解 → 交互可视化 → <strong>Java / Python / JavaScript</strong>{" "}
            三语言对照 → LeetCode 高频题精讲。由易到难,一章一个结构,
            看见它在内存里的样子,而不是背它的定义。
          </p>
          <div className="home-cta">
            <Link href="/array" className="btn btn-primary">
              从第 1 章 · 数组开始 →
            </Link>
            <a href="#map" className="btn">
              看世界地图
            </a>
          </div>
          <div className="home-stats">
            <div className="home-stat">
              <div className="v">14</div>
              <div className="k">章节 · 由易到难</div>
            </div>
            <div className="home-stat">
              <div className="v">127</div>
              <div className="k">LeetCode 高频题</div>
            </div>
            <div className="home-stat">
              <div className="v">3</div>
              <div className="k">语言对照 Java/Py/JS</div>
            </div>
            <div className="home-stat">
              <div className="v">50+</div>
              <div className="k">交互可视化</div>
            </div>
          </div>
        </div>
        <Reveal delay={150}>
          <HeroMorph />
        </Reveal>
      </header>

      {/* §01 为什么 */}
      <Section
        id="why"
        index="01"
        title="数据结构到底是什么?"
        desc="同一批数据,不同的组织方式 —— 上面那个动画就是全书的第一课"
      >
        <div className="prose">
          <p>
            盯着上面的动画看一轮:<strong>7 个数字从头到尾没变过</strong>,变的只是
            它们的排列方式和互相之间的连线。排成一排、手拉手、分层站好、互相勾连
            —— 这就是数组、链表、树、图。
          </p>
          <p>
            所以“数据结构”一句话说完:<strong>数据的组织方式</strong>。
            而组织方式决定了每种操作的成本 —— 图书馆按拼音排书,找书快、插新书慢;
            按到货顺序堆书,插新书快、找书要命。没有“最好的结构”,
            只有“最适合这批操作的结构”。整本课程,就是带你认识每一种组织方式的
            <strong>脾气</strong>:它擅长什么,害怕什么,为什么。
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 20 }}>
          <div className="card hoverable">
            <div className="card-kicker">REASON 01</div>
            <div className="card-title">⚖️ 每个选择都是交易</div>
            <p>
              快的查找往往要用慢的插入去换,省时间往往要花空间。学数据结构 =
              学会看清每笔交易的价格表。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">REASON 02</div>
            <div className="card-title">面试的通用语言</div>
            <p>
              LeetCode 的每道题,本质都在问同一句话:“这批操作,用哪种组织方式
              成本最低?” 高频题精讲每章都有。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">REASON 03</div>
            <div className="card-title">工程的地基</div>
            <p>
              数据库索引是 B+ 树,Redis 是哈希 + 跳表,消息队列是队列,撤销键是栈
              —— 你每天都在用它们,只是隔着一层 API。
            </p>
          </div>
        </div>
      </Section>

      {/* §02 内存模型 */}
      <Section
        id="memory"
        index="02"
        title="一切从内存开始"
        desc="全书只需要一个心智模型:内存是一条编了号的长街"
      >
        <div className="prose">
          <p>
            把内存(RAM)想象成<strong>一条无限长的街道</strong>,街上全是
            一模一样的小房间,每间房有一个唯一的门牌号(<strong>地址</strong>),
            每间房能放一个很小的东西(比如一个字节)。CPU 是个跑腿的:
            你给它任何一个门牌号,它都能<strong>用同样的时间</strong>找到那间房
            —— 这就是 RAM(Random Access,随机访问)的含义,也是一切 O(1) 的源头。
          </p>
        </div>
        <div className="viz">
          <div className="viz-title">同一条街道,两种住法</div>
          <div className="mem-strip" aria-label="连续存储示意">
            {[
              { v: "7", used: true, a: "1000" },
              { v: "2", used: true, a: "1004" },
              { v: "9", used: true, a: "1008" },
              { v: "4", used: true, a: "1012" },
              { v: "1", used: true, a: "1016" },
              { v: "", used: false, a: "1020" },
              { v: "", used: false, a: "1024" },
              { v: "9→?", used: false, a: "1028", sc: true },
              { v: "", used: false, a: "1032" },
              { v: "5→?", used: false, a: "1036", sc: true },
            ].map((c, i) => (
              <div
                key={i}
                className={`mem-cell${c.used ? " used" : ""}${c.sc ? " scattered" : ""}`}
              >
                {c.v || "·"}
                <span className="addr">{c.a}</span>
              </div>
            ))}
          </div>
          <p className="viz-msg">
            左边 5 间连续的房(<b>数组的住法</b>):知道首地址 1000,第 i 个元素
            = 1000 + i×4,一步算出。右边零散的房(<b>链表的住法</b>
            ):每间房里额外记着“下一间在哪”,只能一间间跳。
          </p>
        </div>
        <Callout tone="idea" title="全书最重要的一个公式">
          <p>
            <code>地址 = 首地址 + 下标 × 元素大小</code> ——
            数组 O(1) 访问、哈希表定位桶、堆用数组存树,全都建立在这一条乘加公式上。
            看懂它,后面 14 章会不断和它重逢。
          </p>
        </Callout>
      </Section>

      {/* §03 变量与引用 */}
      <Section
        id="refs"
        index="03"
        title="变量与引用:程序里的「纸条」"
        desc="链表、树、图都靠它连起来 —— 学结构之前,先看清盒子和纸条的区别"
      >
        <div className="prose">
          <p>
            变量可以想成<strong>贴了标签的盒子</strong>。放进盒子的东西分两类:
            像 <code>7</code> 这样的小东西,<strong>直接住在盒子里</strong>(值);
            而对象、数组这类大家伙,住在内存长街的某个门牌号上,盒子里放的只是
            一张<strong>写着地址的纸条</strong> —— 这张纸条,就是<strong>引用(reference)</strong>,
            C 语言里叫指针(pointer)。
          </p>
          <p>
            于是 <code>b = a</code> 这行代码有了两种截然不同的含义:值是
            <strong>复印内容</strong>,引用是<strong>复印纸条</strong>。
            复印纸条之后,两张标签指着同一间房 —— 从任何一边改房间里的东西,
            另一边看到的也变了。亲手试一次:
          </p>
        </div>
        <RefLab />
        <CodeTabs
          title="references"
          java={{
            code: `// Java:基本类型存值,对象存引用
int x = 7;
int y = x;        // 复印内容:y 是独立的 7
y += 10;          // x 还是 7

int[] a = {7};
int[] b = a;      // 复印纸条:a、b 指向同一个数组!
b[0] += 10;       // a[0] 也变成了 17
System.out.println(a[0]);  // 17`,
            note: (
              <>
                <b>规则:</b>8 种基本类型(int/double/boolean…)按值;
                其余一切对象(数组、String、自定义类)都按引用传递纸条。
              </>
            ),
          }}
          python={{
            code: `# Python:一切皆对象,变量只是"名字→对象"的绑定
x = 7
y = x             # 两个名字都绑到 7 上(int 不可变,感觉像复印)
y += 10           # y 绑到新对象 17,x 不受影响

a = [7]
b = a             # 复印纸条:同一个 list!
b[0] += 10
print(a[0])       # 17
print(a is b)     # True —— is 比较"是不是同一个盒子"`,
            note: (
              <>
                <b>规则:</b>Python 全是引用,区别在对象<b>可变不可变</b>:
                int/str/tuple 不可变(改=换新对象),list/dict/set 可变(原地改,共享可见)。
              </>
            ),
          }}
          js={{
            code: `// JavaScript:原始值按值,对象按引用
let x = 7;
let y = x;        // 复印内容
y += 10;          // x 还是 7

const a = [7];
const b = a;      // 复印纸条:同一个数组!
b[0] += 10;
console.log(a[0]);      // 17
console.log(a === b);   // true —— 比较的是纸条`,
            note: (
              <>
                <b>规则:</b>number/string/boolean/null/undefined/symbol/bigint
                按值;对象和数组按引用。<code>const</code> 锁的是纸条,不是盒子内容!
              </>
            ),
          }}
        />
        <Callout tone="idea" title="为什么这一节是全书地基">
          <p>
            第 3 章链表的每个节点里,都躺着一张写着「下一个节点在哪」的纸条;
            树的每个节点揣着两张(left/right);图的每个点揣着一叠。
            <b>所谓“链式结构”,就是用纸条把散落在内存各处的盒子串起来</b>。
            看懂了这个实验室,后面没有任何一章能难住你。
          </p>
        </Callout>
      </Section>

      {/* §04 Big-O */}
      <Section
        id="bigo"
        index="04"
        title="Big-O:给算法称重的秤"
        desc="不数秒数,数“操作次数随 n 的增长趋势” —— 动手拖一拖"
      >
        <div className="prose">
          <p>
            比较两个算法,不能比“谁在我电脑上跑得快”——机器不同、数据不同,结果不可比。
            计算机科学的做法是问:<strong>数据规模 n 变大时,操作次数以什么方式增长?</strong>
            增长趋势用 O(...) 记号表示,只保留最高阶项、扔掉系数和常数:
            3n²+5n+20 → O(n²)。
          </p>
          <p>
            下面的实验室里,六条曲线就是你将来会天天遇到的六个档位。注意 y
            轴是对数刻度 —— 即便如此,O(2ⁿ) 依然一飞冲天。
          </p>
        </div>
        <BigOLab />
        <Callout tone="warn" title="最常见的两个误会">
          <p>
            ① Big-O ≠ 耗时:它是趋势,不是秒表。n 很小时,O(n²) 完全可能跑赢
            O(n log n)。② 复杂度看的是<b>最坏或平均</b>情况,面试时请说清你讲的是哪一个
            (哈希表平均 O(1)、最坏 O(n),就是经典例子)。
          </p>
        </Callout>
      </Section>

      {/* §05 速查表 */}
      <Section
        id="cheatsheet"
        index="05"
        title="复杂度速查表"
        desc="先做初步了解,读完全书再回来看 —— 每一格你都能讲出为什么"
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>结构</th>
                <th>访问</th>
                <th>查找</th>
                <th>插入</th>
                <th>删除</th>
                <th>一句话备注</th>
              </tr>
            </thead>
            <tbody>
              {CHEAT.map((r) => (
                <tr key={r.name}>
                  <td>
                    <Link href={r.href}>
                      <b>{r.name}</b>
                    </Link>
                  </td>
                  {[r.access, r.search, r.insert, r.del].map((v, i) =>
                    v === "—" ? (
                      <td key={i} className="dim">
                        —
                      </td>
                    ) : (
                      <td key={i}>
                        <BigO o={v} />
                      </td>
                    ),
                  )}
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="viz-msg">
          表中为最常引用的复杂度(哈希表 / 并查集为均摊或平均)。每一格背后的“为什么”,在对应章节里都有图解 + 可视化。
        </p>
      </Section>

      {/* §06 世界地图 */}
      <Section
        id="map"
        index="06"
        title="世界地图:14 章,由易到难"
        desc="色条 = 难度,右上 = LeetCode 出场频率 —— 点击任意一章出发"
      >
        <div className="map-grid">
          {CHAPTERS.filter((c) => c.id !== "home").map((c, i) => (
            <Reveal key={c.id} delay={Math.min(i * 40, 240)}>
              <Link
                href={c.href}
                className="map-card"
                style={{ "--ch-hue": c.hue } as React.CSSProperties}
              >
                <div className="map-head">
                  <span className="map-num">{c.num}</span>
                  <span className="map-title">{c.title}</span>
                  <span className="map-en" style={{ marginLeft: "auto" }}>
                    {c.en}
                  </span>
                </div>
                <p className="map-essence">{c.essence}</p>
                <div className="map-meta">
                  <span className="map-level" aria-label={`难度 ${c.level}/5`}>
                    {[1, 2, 3, 4, 5].map((l) => (
                      <i key={l} className={l <= c.level ? "on" : ""} />
                    ))}
                  </span>
                  <span className="map-freq">
                    LC 频率 <b>{"★".repeat(c.freq)}</b>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* §07 用法 */}
      <Section
        id="howto"
        index="07"
        title="这套课怎么用"
        desc="每章都是同一个节奏 —— 三步走,别跳步"
      >
        <div className="grid-3 howto">
          <div className="card">
            <div className="card-title">先看懂</div>
            <p>
              直觉类比 → 内存图解 → 操作拆解。每个结构先回答三个问题:
              长什么样?擅长什么?为什么?
            </p>
          </div>
          <div className="card">
            <div className="card-title">再玩透</div>
            <p>
              每章都有可视化 Playground:亲手插入、删除、遍历,看指针怎么跳、
              内存怎么搬。玩过的结构才是你的。
            </p>
          </div>
          <div className="card">
            <div className="card-title">✍️ 后刷题</div>
            <p>
              精讲 2~3 道代表题(带三语言题解),再给一份高频题单
              —— 勾选进度会存在本地,侧栏实时统计。
            </p>
          </div>
        </div>
        <Callout tone="story" title="关于三种语言">
          <p>
            顶栏的 <b>Java / Python / JS</b> 切换是全站联动的:切一次,所有代码窗口
            一起换语言。三种语言的<b>数据结构抽象完全一致</b>(数组就是数组,栈就是栈),
            差异只在实现与 API —— 每章的「三语言对照」会把差异一条条挑明。
          </p>
        </Callout>
      </Section>

      {/* §08 Quiz */}
      <Section
        id="quiz"
        index="08"
        title="快问快答:序章通关测验"
        desc="7 题 —— 全对点亮侧栏第一盏绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="home" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            数据结构 = <b>数据的组织方式</b>;组织方式决定每种操作的成本,没有最好,只有最合适。
          </>,
          <>
            内存是一条编了号的长街:<b>地址 = 首地址 + 下标 × 元素大小</b>,这条公式是数组、哈希表、堆的共同地基。
          </>,
          <>
            对象赋值传的是<b>引用(地址纸条)</b>,不是内容:链表、树、图都是“纸条串起来的盒子”。
          </>,
          <>
            Big-O 是<b>增长趋势</b>不是秒表:扔系数、扔常数、只留最高阶;说复杂度时讲清是平均还是最坏。
          </>,
          <>
            六个档位记牢:O(1) → O(log n) → O(n) → O(n log n) → O(n²) → O(2ⁿ),
            一百万数据下它们是“瞬间”与“宇宙年龄”的差距。
          </>,
        ]}
      />

      <ChapterFooter ch="home" />
    </main>
  );
}
