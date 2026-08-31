"use client";

// Prologue · world map — the entry point for the whole course.
// Three jobs: (1) build the first intuition that a data structure is a way of
// organizing data (the morphing hero); (2) hand over the two yardsticks used
// throughout the course: the memory model and Big-O (interactive labs);
// (3) lay out the 14-chapter world map and explain how to work through it.

import Link from "next/link";
import "./home.css";
import { CHAPTERS, subLabel } from "@/lib/curriculum";
import { useL, T, type Loc } from "@/lib/i18n";
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

/* ---------- Complexity cheat-sheet data ---------- */

const CHEAT: {
  name: Loc<string>;
  href: string;
  access: string;
  search: string;
  insert: string;
  del: string;
  note: Loc<string>;
}[] = [
  {
    name: { en: "Array", zh: "数组 Array" },
    href: "/array",
    access: "1",
    search: "n",
    insert: "n",
    del: "n",
    note: {
      en: "Access by index is what it is for. Inserting or deleting in the middle shifts the other elements.",
      zh: "按下标访问是它的核心能力;中间插删要搬移",
    },
  },
  {
    name: { en: "String", zh: "字符串 String" },
    href: "/string",
    access: "1",
    search: "n",
    insert: "n",
    del: "n",
    note: {
      en: "Immutable in most languages, so any change builds a new string.",
      zh: "多数语言不可变:任何“修改”都是重建",
    },
  },
  {
    name: { en: "Linked List", zh: "链表 Linked List" },
    href: "/linked-list",
    access: "n",
    search: "n",
    insert: "1",
    del: "1",
    note: {
      en: "Insert and delete are O(1) only when you already hold the node in front.",
      zh: "插删 O(1) 的前提:你已经站在那个位置",
    },
  },
  {
    name: { en: "Stack", zh: "栈 Stack" },
    href: "/stack",
    access: "n",
    search: "n",
    insert: "1",
    del: "1",
    note: {
      en: "Only the top is touched, so push and pop are O(1).",
      zh: "只碰顶端,push/pop 都是 O(1)",
    },
  },
  {
    name: { en: "Queue", zh: "队列 Queue" },
    href: "/queue",
    access: "n",
    search: "n",
    insert: "1",
    del: "1",
    note: {
      en: "Only the two ends are touched, so enqueue and dequeue are O(1).",
      zh: "只碰两端,入队/出队都是 O(1)",
    },
  },
  {
    name: { en: "Hash Table", zh: "哈希表 Hash Table" },
    href: "/hash",
    access: "—",
    search: "1",
    insert: "1",
    del: "1",
    note: {
      en: "O(1) on average. If every key collides, it degrades to O(n).",
      zh: "平均 O(1);最坏(全冲突)退化为 O(n)",
    },
  },
  {
    name: { en: "Binary Search Tree", zh: "二叉搜索树 BST" },
    href: "/bst",
    access: "logn",
    search: "logn",
    insert: "logn",
    del: "logn",
    note: {
      en: "O(log n) while the tree stays balanced. A degenerate tree is a linked list, so O(n).",
      zh: "平衡时 O(log n);退化成链表就是 O(n)",
    },
  },
  {
    name: { en: "Heap", zh: "堆 Heap" },
    href: "/heap",
    access: "1",
    search: "n",
    insert: "logn",
    del: "logn",
    note: {
      en: "Access means reading the top. Finding an arbitrary element is not what it is for.",
      zh: "访问指“看堆顶”;找任意元素它不擅长",
    },
  },
  {
    name: { en: "Trie", zh: "前缀树 Trie" },
    href: "/trie",
    access: "—",
    search: "1",
    insert: "1",
    del: "1",
    note: {
      en: "Cost is measured by the word length L, not by how many words are stored.",
      zh: "复杂度按词长 L 计,与词典大小无关",
    },
  },
  {
    name: { en: "Union-Find", zh: "并查集 Union-Find" },
    href: "/union-find",
    access: "—",
    search: "1",
    insert: "1",
    del: "—",
    note: {
      en: "About O(α(n)), which is effectively O(1), with path compression and union by rank.",
      zh: "近似 O(α(n)) ≈ O(1),需路径压缩+按秩合并",
    },
  },
];

/* ---------- Prologue quiz ---------- */

const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "What does O(1) actually mean?",
      zh: "O(1) 到底是什么意思?",
    },
    opts: [
      {
        en: "The cost of the operation does not grow with the input size n. Whether n is 10 or a billion, the work is the same.",
        zh: "操作耗时不随数据规模 n 增长 —— n 是 10 还是 10 亿,花的功夫一样",
      },
      { en: "The operation takes exactly one second.", zh: "这个操作只需要 1 秒钟" },
      { en: "The operation takes exactly one line of code.", zh: "这个操作只需要 1 行代码" },
      {
        en: "The operation is always faster than an O(n) operation.",
        zh: "这个操作一定比 O(n) 的操作快",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Big-O has nothing to do with seconds. It describes how the number of operations grows with n, not absolute time.",
        zh: "Big-O 跟“秒”没有关系 —— 它描述的是操作次数随 n 的增长趋势,不是绝对时间。",
      },
      {
        en: "Line count and complexity are unrelated. One call to sort() is O(n log n), and ten lines of addition can be O(1).",
        zh: "代码行数和复杂度无关:一行 sort() 就是 O(n log n),十行加法也可以是 O(1)。",
      },
      {
        en: "Not for small inputs. An O(1) operation with a large constant can be slower than an O(n) operation at n = 5. Big-O describes what happens as n grows.",
        zh: "小规模时未必:一个常数巨大的 O(1) 操作,可能比 n=5 的 O(n) 慢。Big-O 说的是 n 变大之后的趋势。",
      },
    ],
    why: {
      en: "Big-O describes growth. O(1) means the cost is constant and does not depend on n.",
      zh: "Big-O 描述“增长趋势”:O(1) 表示成本是常数,与 n 无关。",
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Two nested for loops each run from 0 to n-1, and the loop body is
          O(1). What is the total complexity?
        </>
      ),
      zh: (
        <>
          两层嵌套 for 循环,各自都从 0 走到 n-1,循环体是 O(1)。整体复杂度是?
        </>
      ),
    },
    opts: ["O(n²)", "O(2n)", "O(n log n)", "O(n)"],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Nested loops multiply, they do not add. For every one step of the outer loop, the inner loop runs all n steps, so the total is n × n.",
        zh: "两层循环是相乘不是相加:外层每走 1 步,内层要完整走 n 步,总共 n × n。",
      },
      {
        en: "n log n usually comes from halving the input at each level, as in divide and conquer or sorting. Here the inner loop runs the full n steps.",
        zh: "n log n 通常来自“每层砍一半”的分治或排序,这里内层是完整的 n 步。",
      },
      {
        en: "That would be a single loop. Here each step of the outer loop runs the inner loop completely, so the total is n × n.",
        zh: "那是单层循环。外层的每一步都触发内层完整跑一遍,总次数是 n × n。",
      },
    ],
    why: {
      en: "n outer steps × n inner steps = n² steps, written O(n²).",
      zh: "外层 n 次 × 内层 n 次 = n² 次,记作 O(n²)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "An algorithm performs exactly 3n + 20 operations. What is its Big-O?",
      zh: "某算法精确操作次数是 3n + 20,它的 Big-O 是?",
    },
    opts: ["O(n)", "O(3n)", "O(n + 20)", "O(1)"],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Coefficients are dropped. O(3n) and O(n) grow in exactly the same way, and the agreed form is O(n).",
        zh: "系数要扔掉:O(3n) 和 O(n) 增长趋势完全一样,约定写 O(n)。",
      },
      {
        en: "Constant terms are dropped too. Once n is large, +20 makes no difference.",
        zh: "常数项也要扔掉:n 一大,+20 就微不足道了。",
      },
      {
        en: "3n + 20 grows with n, so it is not constant.",
        zh: "3n + 20 会随 n 增长,不是常数。",
      },
    ],
    why: {
      en: "Big-O keeps only the fastest-growing term and drops coefficients and constants: 3n + 20 becomes O(n).",
      zh: "Big-O 只留最高阶、扔系数扔常数:3n + 20 → O(n)。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          Binary search runs on a <b>sorted</b> array of 1,000,000 (10⁶)
          elements. In the worst case, about how many comparisons does it make?
          (Give a whole number.)
        </>
      ),
      zh: (
        <>
          在 1,000,000(10⁶)个元素的<b>有序</b>数组上做二分查找,最坏要比较大约多少次?(取整数)
        </>
      ),
    },
    placeholder: { en: "Type a whole number…", zh: "输入一个整数…" },
    answers: ["20", "20次", "约20", "about20"],
    hint: {
      en: (
        <>
          Each comparison removes half of what is left: 10⁶ → 5×10⁵ → … So the
          question is: 2 to the power of what is about 10⁶? (2¹⁰ = 1024 ≈ 10³.)
        </>
      ),
      zh: (
        <>
          二分每比较一次就砍掉一半:10⁶ → 5×10⁵ → … 问题等价于 2 的多少次方 ≈ 10⁶(2¹⁰ = 1024 ≈ 10³)。
        </>
      ),
    },
    why: {
      en: "log₂(10⁶) ≈ 19.9, so about 20 comparisons in the worst case. That is what O(log n) buys you: a million items settled in 20 steps.",
      zh: "log₂(10⁶) ≈ 19.9,最坏约 20 次 —— 这就是 O(log n) 的价值:一百万的数据,20 步搞定。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these statements are correct? (Select all that apply.)",
      zh: "下面哪些说法是对的?(多选)",
    },
    opts: [
      {
        en: "Big-O describes growth, not the real running time of one particular run.",
        zh: "Big-O 描述的是增长趋势,不是某次运行的真实耗时",
      },
      {
        en: "Space complexity is written with Big-O as well.",
        zh: "空间复杂度也用 Big-O 表示",
      },
      {
        en: "An O(n²) algorithm is slower than an O(n) algorithm at every input size.",
        zh: "O(n²) 的算法在任何输入规模下都比 O(n) 的慢",
      },
      {
        en: "The same problem can have several solutions with different complexities.",
        zh: "同一个问题可以有多种复杂度不同的解法",
      },
    ],
    correct: [0, 1, 3],
    missHint: {
      en: "One correct option is still missing. Look again at the definition of Big-O and at the idea that a problem has more than one solution.",
      zh: "还漏了对的项 —— 再想想 Big-O 的定义和“解法不唯一”这件事。",
    },
    extraHint: {
      en: '"O(n²) is always slower" is wrong. For small n, an O(n²) algorithm with a small constant can easily win. Big-O only describes what happens once n is large enough.',
      zh: "“O(n²) 一定更慢”是错的:n 很小时,常数小的 O(n²) 完全可能更快。Big-O 只保证 n 足够大之后的趋势。",
    },
    why: {
      en: "Big-O is a statement about growth, and it applies to time and to space. Optimizing an algorithm means finding a solution with a lower complexity.",
      zh: "Big-O 是渐进趋势(时间与空间都适用),而优化算法正是在寻找复杂度更低的解法。",
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          After running <code>b = a</code> (where a is an array), you change{" "}
          <code>b[0]</code> and find that <code>a[0]</code> changed too. Why?
        </>
      ),
      zh: (
        <>
          执行 <code>b = a</code>(a 是个数组)之后修改 <code>b[0]</code>,发现{" "}
          <code>a[0]</code> 也变了。为什么?
        </>
      ),
    },
    opts: [
      {
        en: "The assignment copied the note with the address on it (the reference), so a and b point at the same array in memory.",
        zh: "赋值复印的是「地址纸条」(引用),a、b 指向内存里同一个数组",
      },
      { en: "It is a bug in the language.", zh: "这是编程语言的 bug" },
      {
        en: "On assignment, the language keeps the contents of the two arrays in sync in the background.",
        zh: "赋值时语言在后台自动同步两个数组的内容",
      },
      {
        en: "An array name is a special keyword and cannot be assigned.",
        zh: "因为数组名是特殊关键字,不能被赋值",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "All three languages are designed this way. Assigning an object copies the reference instead of the contents, because copying a large object would be expensive.",
        zh: "这是三种语言一致的设计:对象赋值传递引用,不复制内容 —— 复制大对象太贵了。",
      },
      {
        en: "Nothing is being synchronized. There is only one array, and both variables point at it.",
        zh: "没有任何同步发生 —— 根本就只有一个数组,两个变量都指向它。",
      },
      {
        en: "An array name is an ordinary variable. What it holds is a note with an address written on it.",
        zh: "数组名只是普通变量,里面装的是一张写着地址的纸条。",
      },
    ],
    why: {
      en: "Assigning an object copies the note: a and b point at the same box. For an independent copy you have to copy it yourself (slice, copy, and so on). Linked lists, trees, and graphs are all built out of these notes.",
      zh: "对象赋值 = 复印纸条:a、b 指向同一个盒子。想要独立副本要显式拷贝(如 slice/copy)。链表、树、图全靠这张纸条连起来。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Why can an array read arr[i] in O(1)?",
      zh: "数组按下标访问 arr[i] 为什么能做到 O(1)?",
    },
    opts: [
      {
        en: "The elements are stored next to each other, so address = base address + i × element size. One multiply and one add give the position.",
        zh: "因为元素连续存放,地址 = 首地址 + i × 单个元素大小,一次乘加直接算出位置",
      },
      {
        en: "The computer caches arrays in a special way.",
        zh: "因为计算机对数组做了特殊缓存",
      },
      {
        en: "The compiler records the position of every element in advance.",
        zh: "因为数组在编译时就把每个元素的位置都记住了",
      },
      {
        en: "Index access also walks from the start, it is just very fast.",
        zh: "因为下标访问底层其实也是从头遍历,只是很快",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Caching makes access faster, but O(1) comes from the address being computable in one step. That is true with or without a cache.",
        zh: "缓存能让访问更快,但 O(1) 的本质是“地址可以直接算出来”,和缓存无关。",
      },
      {
        en: "No position needs to be recorded. Because elements sit next to each other, any position can be computed from one formula at any time.",
        zh: "不需要记住每个位置 —— 连续存放让位置可以随时用一条公式算出来。",
      },
      {
        en: "That is what a linked list does. The whole point of an array is that it does not have to walk.",
        zh: "恰恰相反,这正是链表的行为。数组的精髓就是不用遍历。",
      },
    ],
    why: {
      en: "Contiguous memory plus fixed-size elements means the address comes from one formula: base + i × size. This formula runs through the whole course.",
      zh: "连续内存 + 定长元素 ⇒ 地址一条公式算出:base + i × size。这个公式贯穿全书。",
    },
  },
];

/* ---------- Page ---------- */

export default function Home() {
  const L = useL();

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
            <T
              en={
                <>
                  Data structures,
                  <br />
                  <span className="grad">in slow motion</span>
                </>
              }
              zh={
                <>
                  把数据结构
                  <br />
                  <span className="grad">拆成慢动作</span>
                </>
              }
            />
          </h1>
          <p className="hero-essence">
            <T
              en={
                <>
                  Every chapter follows the same path: a memory diagram, an
                  interactive visualization,{" "}
                  <strong>Java / Python / JavaScript</strong> side by side, and
                  worked LeetCode problems. One structure per chapter, easy to
                  hard. You see how it sits in memory instead of memorizing a
                  definition.
                </>
              }
              zh={
                <>
                  每一章:内存图解 → 交互可视化 →{" "}
                  <strong>Java / Python / JavaScript</strong>{" "}
                  三语言对照 → LeetCode 高频题精讲。由易到难,一章一个结构,
                  看见它在内存里的样子,而不是背它的定义。
                </>
              }
            />
          </p>
          <div className="home-cta">
            <Link href="/array" className="btn btn-primary">
              <T en="Start with chapter 1 · Array →" zh="从第 1 章 · 数组开始 →" />
            </Link>
            <a href="#map" className="btn">
              <T en="See the map" zh="看世界地图" />
            </a>
          </div>
          <div className="home-stats">
            <div className="home-stat">
              <div className="v">14</div>
              <div className="k">
                <T en="chapters, easy to hard" zh="章节 · 由易到难" />
              </div>
            </div>
            <div className="home-stat">
              <div className="v">127</div>
              <div className="k">
                <T en="common LeetCode problems" zh="LeetCode 高频题" />
              </div>
            </div>
            <div className="home-stat">
              <div className="v">3</div>
              <div className="k">
                <T en="languages: Java / Py / JS" zh="语言对照 Java/Py/JS" />
              </div>
            </div>
            <div className="home-stat">
              <div className="v">50+</div>
              <div className="k">
                <T en="interactive visualizations" zh="交互可视化" />
              </div>
            </div>
          </div>
        </div>
        <Reveal delay={150}>
          <HeroMorph />
        </Reveal>
      </header>

      {/* §01 Why it exists */}
      <Section
        id="why"
        index="01"
        title={{ en: "What is a data structure?", zh: "数据结构到底是什么?" }}
        desc={{
          en: "The same data, organized in different ways. The animation above is the first lesson of this course.",
          zh: "同一批数据,不同的组织方式 —— 上面那个动画就是全书的第一课",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Watch the animation above for one full cycle.{" "}
                  <strong>The same seven numbers never change.</strong> What
                  changes is how they are arranged and which ones are connected.
                  In a row, in a chain, in layers, connected to each other:
                  that is an array, a linked list, a tree, and a graph.
                </p>
                <p>
                  So a data structure is, in one sentence,{" "}
                  <strong>a way of organizing data</strong>. The way you
                  organize it decides what each operation costs. A library that
                  shelves books alphabetically makes searching fast and
                  inserting slow. A library that stacks books in the order they
                  arrive makes inserting fast and searching painful. There is no
                  best structure, only the structure that fits the operations
                  you need. This course walks through the{" "}
                  <strong>character</strong> of each one: what it is good at,
                  what it is bad at, and why.
                </p>
              </>
            }
            zh={
              <>
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
              </>
            }
          />
        </div>
        <div className="grid-3" style={{ marginTop: 20 }}>
          <div className="card hoverable">
            <div className="card-kicker">REASON 01</div>
            <div className="card-title">
              <T en="⚖️ Every choice is a trade" zh="⚖️ 每个选择都是交易" />
            </div>
            <p>
              <T
                en={
                  <>
                    Faster search usually costs slower insertion. Saving time
                    usually costs memory. Learning data structures means
                    learning to read the price of each trade.
                  </>
                }
                zh={
                  <>
                    快的查找往往要用慢的插入去换,省时间往往要花空间。学数据结构 =
                    学会看清每笔交易的价格表。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">REASON 02</div>
            <div className="card-title">
              <T en="The shared language of interviews" zh="面试的通用语言" />
            </div>
            <p>
              <T
                en={
                  <>
                    Every LeetCode problem asks the same question: for this set
                    of operations, which way of organizing the data costs the
                    least? Every chapter works through the common ones.
                  </>
                }
                zh={
                  <>
                    LeetCode 的每道题,本质都在问同一句话:“这批操作,用哪种组织方式
                    成本最低?” 高频题精讲每章都有。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">REASON 03</div>
            <div className="card-title">
              <T en="The foundation of real systems" zh="工程的地基" />
            </div>
            <p>
              <T
                en={
                  <>
                    A database index is a B+ tree. Redis uses hash tables and
                    skip lists. A message queue is a queue. The undo command is
                    a stack. You use all of them every day, through an API.
                  </>
                }
                zh={
                  <>
                    数据库索引是 B+ 树,Redis 是哈希 + 跳表,消息队列是队列,撤销键是栈
                    —— 你每天都在用它们,只是隔着一层 API。
                  </>
                }
              />
            </p>
          </div>
        </div>
      </Section>

      {/* §02 The memory model */}
      <Section
        id="memory"
        index="02"
        title={{ en: "It all starts with memory", zh: "一切从内存开始" }}
        desc={{
          en: "The whole course needs only one mental model: memory is a long street of numbered rooms.",
          zh: "全书只需要一个心智模型:内存是一条编了号的长街",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                Picture memory (RAM) as{" "}
                <strong>a street that goes on forever</strong>. Every room on
                the street is identical, each room has a unique number (its{" "}
                <strong>address</strong>), and each room holds one small item,
                for example one byte. The CPU is the runner: give it any room
                number and it reaches that room{" "}
                <strong>in the same amount of time</strong>. That is what RAM
                (random access memory) means, and it is the source of every O(1)
                in this course.
              </p>
            }
            zh={
              <p>
                把内存(RAM)想象成<strong>一条无限长的街道</strong>,街上全是
                一模一样的小房间,每间房有一个唯一的门牌号(<strong>地址</strong>),
                每间房能放一个很小的东西(比如一个字节)。CPU 是个跑腿的:
                你给它任何一个门牌号,它都能<strong>用同样的时间</strong>找到那间房
                —— 这就是 RAM(Random Access,随机访问)的含义,也是一切 O(1) 的源头。
              </p>
            }
          />
        </div>
        <div className="viz">
          <div className="viz-title">
            <T
              en="One street, two ways of living on it"
              zh="同一条街道,两种住法"
            />
          </div>
          <div
            className="mem-strip"
            aria-label={L({
              en: "Contiguous storage diagram",
              zh: "连续存储示意",
            })}
          >
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
            <T
              en={
                <>
                  On the left, five rooms next to each other (
                  <b>how an array lives</b>): if the first address is 1000, then
                  element i sits at 1000 + i×4, computed in one step. On the
                  right, scattered rooms (<b>how a linked list lives</b>): each
                  room also stores where the next room is, so you can only hop
                  from one to the next.
                </>
              }
              zh={
                <>
                  左边 5 间连续的房(<b>数组的住法</b>):知道首地址 1000,第 i 个元素
                  = 1000 + i×4,一步算出。右边零散的房(<b>链表的住法</b>
                  ):每间房里额外记着“下一间在哪”,只能一间间跳。
                </>
              }
            />
          </p>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "The most important formula in this course",
            zh: "全书最重要的一个公式",
          }}
        >
          <p>
            <T
              en={
                <>
                  <code>address = base address + index × element size</code>.
                  O(1) access in an array, finding the right bucket in a hash
                  table, and storing a tree inside an array in the heap chapter
                  all rest on this one multiply-and-add. Learn it now: the next
                  14 chapters keep coming back to it.
                </>
              }
              zh={
                <>
                  <code>地址 = 首地址 + 下标 × 元素大小</code> ——
                  数组 O(1) 访问、哈希表定位桶、堆用数组存树,全都建立在这一条乘加公式上。
                  看懂它,后面 14 章会不断和它重逢。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §03 Variables and references */}
      <Section
        id="refs"
        index="03"
        title={{
          en: "Variables and references: the note with an address on it",
          zh: "变量与引用:程序里的「纸条」",
        }}
        desc={{
          en: "Linked lists, trees, and graphs are all held together by this. Before the structures, see the difference between a box and a note.",
          zh: "链表、树、图都靠它连起来 —— 学结构之前,先看清盒子和纸条的区别",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Think of a variable as{" "}
                  <strong>a box with a label on it</strong>. What goes into the
                  box comes in two kinds. A small thing like <code>7</code>{" "}
                  <strong>lives inside the box itself</strong> (a value). A
                  large thing like an object or an array lives at some address
                  on the memory street, and the box holds only{" "}
                  <strong>a note with that address written on it</strong>. That
                  note is a <strong>reference</strong>. In C it is called a
                  pointer.
                </p>
                <p>
                  So the line <code>b = a</code> has two very different
                  meanings. For a value it <strong>copies the contents</strong>.
                  For a reference it <strong>copies the note</strong>. After the
                  note is copied, both labels point at the same room, so a
                  change made from either side is visible from the other. Try it
                  yourself:
                </p>
              </>
            }
            zh={
              <>
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
              </>
            }
          />
        </div>
        <RefLab />
        <CodeTabs
          title="references"
          java={{
            code: {
              en: `// Java: a primitive variable holds a value, an object variable holds a reference
int x = 7;
int y = x;        // copies the contents: y is an independent 7
y += 10;          // x is still 7

int[] a = {7};
int[] b = a;      // copies the note: a and b point at the same array
b[0] += 10;       // a[0] is now 17 as well
System.out.println(a[0]);  // 17`,
              zh: `// Java:基本类型变量装值,对象类型变量装引用
int x = 7;
int y = x;        // 复印内容:y 是独立的 7
y += 10;          // x 还是 7

int[] a = {7};
int[] b = a;      // 复印纸条:a、b 指向同一个数组!
b[0] += 10;       // a[0] 也变成了 17
System.out.println(a[0]);  // 17`,
            },
            note: {
              en: (
                <>
                  <b>Rule:</b> the 8 primitive types (int, double, boolean and
                  so on) store the value itself. Every other type (arrays,
                  String, your own classes) stores a reference. Assignment and
                  argument passing always copy what is in the variable, and for
                  an object type that is the note.
                </>
              ),
              zh: (
                <>
                  <b>规则:</b>8 种基本类型(int/double/boolean…)变量里直接装值;
                  其余一切对象(数组、String、自定义类)变量里装的是引用。
                  赋值和传参永远是复制变量里的内容 —— 对象类型复制的就是那张纸条。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `# Python: everything is an object; a variable is a name bound to an object
x = 7
y = x             # both names point at the same int 7 (int is immutable)
y += 10           # y is rebound to a new object 17; x is unchanged

a = [7]
b = a             # the same list object, reached by two names
b[0] += 10
print(a[0])       # 17
print(a is b)     # True -- "is" asks whether it is the same object`,
              zh: `# Python:一切皆对象,变量只是"名字→对象"的绑定
x = 7
y = x             # 两个名字都绑到同一个 7 上(int 不可变,感觉像复印)
y += 10           # y 绑到新对象 17,x 不受影响

a = [7]
b = a             # 复印纸条:同一个 list!
b[0] += 10
print(a[0])       # 17
print(a is b)     # True —— is 比较"是不是同一个对象"`,
            },
            note: {
              en: (
                <>
                  <b>Rule:</b> in Python every variable holds a reference. What
                  differs is whether the object is <b>mutable</b>. int, str, and
                  tuple are immutable, so changing them creates a new object.
                  list, dict, and set are mutable, so a change happens in place
                  and every name pointing at that object sees it.
                </>
              ),
              zh: (
                <>
                  <b>规则:</b>Python 全是引用,区别在对象<b>可变不可变</b>:
                  int/str/tuple 不可变(改=换新对象),list/dict/set 可变(原地改,共享可见)。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// JavaScript: primitive values are copied, objects are shared
let x = 7;
let y = x;        // copies the value
y += 10;          // x is still 7

const a = [7];
const b = a;      // the same array, reached by two names
b[0] += 10;
console.log(a[0]);      // 17
console.log(a === b);   // true -- compares the reference, not the contents`,
              zh: `// JavaScript:原始值按值复制,对象共享引用
let x = 7;
let y = x;        // 复印内容
y += 10;          // x 还是 7

const a = [7];
const b = a;      // 复印纸条:同一个数组!
b[0] += 10;
console.log(a[0]);      // 17
console.log(a === b);   // true —— 比较的是纸条`,
            },
            note: {
              en: (
                <>
                  <b>Rule:</b> number, string, boolean, null, undefined, symbol,
                  and bigint are copied by value. Objects and arrays are shared.
                  <code>const</code> locks the note, not the contents of the
                  box.
                </>
              ),
              zh: (
                <>
                  <b>规则:</b>number/string/boolean/null/undefined/symbol/bigint
                  按值;对象和数组按引用。<code>const</code> 锁的是纸条,不是盒子内容!
                </>
              ),
            },
          }}
        />
        <Callout
          tone="idea"
          title={{
            en: "Why this section is the foundation of the course",
            zh: "为什么这一节是全书地基",
          }}
        >
          <p>
            <T
              en={
                <>
                  Every node in a linked list (chapter 3) holds a note saying
                  where the next node is. Every node in a tree holds two (left
                  and right). Every node in a graph holds a list of them.{" "}
                  <b>
                    A linked structure is just boxes scattered across memory,
                    tied together by these notes.
                  </b>{" "}
                  Once this lab makes sense, no later chapter will be out of
                  reach.
                </>
              }
              zh={
                <>
                  第 3 章链表的每个节点里,都躺着一张写着「下一个节点在哪」的纸条;
                  树的每个节点揣着两张(left/right);图的每个点揣着一叠。
                  <b>所谓“链式结构”,就是用纸条把散落在内存各处的盒子串起来</b>。
                  看懂了这个实验室,后面没有任何一章能难住你。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §04 Big-O */}
      <Section
        id="bigo"
        index="04"
        title={{
          en: "Big-O: how to measure an algorithm",
          zh: "Big-O:给算法称重的秤",
        }}
        desc={{
          en: "Do not count seconds. Count how the number of operations grows with n. Drag the slider and watch.",
          zh: "不数秒数,数“操作次数随 n 的增长趋势” —— 动手拖一拖",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  You cannot compare two algorithms by asking which one runs
                  faster on your machine. Different machines and different
                  inputs give different answers. Computer science asks a
                  different question:{" "}
                  <strong>
                    as the input size n grows, how does the number of operations
                    grow?
                  </strong>{" "}
                  That growth is written with O(...), keeping only the
                  fastest-growing term and dropping coefficients and constants:
                  3n²+5n+20 becomes O(n²).
                </p>
                <p>
                  In the lab below, the six curves are the six levels you will
                  meet again and again. Note that the y axis uses a logarithmic
                  scale. Even so, O(2ⁿ) still leaves the top of the chart.
                </p>
              </>
            }
            zh={
              <>
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
              </>
            }
          />
        </div>
        <BigOLab />
        <Callout
          tone="warn"
          title={{
            en: "Two common misunderstandings",
            zh: "最常见的两个误会",
          }}
        >
          <p>
            <T
              en={
                <>
                  (1) Big-O is not running time. It describes growth, not
                  seconds. For small n, an O(n²) algorithm can beat an O(n log
                  n) one. (2) A complexity is always stated for a case:{" "}
                  <b>worst, average, or amortized</b>. Say which one you mean.
                  A hash table is O(1) on average and O(n) in the worst case,
                  and that is the classic example.
                </>
              }
              zh={
                <>
                  ① Big-O ≠ 耗时:它是趋势,不是秒表。n 很小时,O(n²) 完全可能跑赢
                  O(n log n)。② 复杂度看的是<b>最坏、平均还是均摊</b>,说的时候请讲清楚
                  (哈希表平均 O(1)、最坏 O(n),就是经典例子)。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §05 Cheat sheet */}
      <Section
        id="cheatsheet"
        index="05"
        title={{ en: "Complexity reference table", zh: "复杂度速查表" }}
        desc={{
          en: "Skim it now and come back after the last chapter. By then you will be able to explain every cell.",
          zh: "先做初步了解,读完全书再回来看 —— 每一格你都能讲出为什么",
        }}
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Structure" zh="结构" />
                </th>
                <th>
                  <T en="Access" zh="访问" />
                </th>
                <th>
                  <T en="Search" zh="查找" />
                </th>
                <th>
                  <T en="Insert" zh="插入" />
                </th>
                <th>
                  <T en="Delete" zh="删除" />
                </th>
                <th>
                  <T en="Note" zh="一句话备注" />
                </th>
              </tr>
            </thead>
            <tbody>
              {CHEAT.map((r) => (
                <tr key={r.href}>
                  <td>
                    <Link href={r.href}>
                      <b>{L(r.name)}</b>
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
                  <td>{L(r.note)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="viz-msg">
          <T
            en="The table lists the complexity that is normally quoted (average or amortized for the hash table and union-find). The reason behind every cell has a diagram and a visualization in the matching chapter."
            zh="表中为最常引用的复杂度(哈希表 / 并查集为均摊或平均)。每一格背后的“为什么”,在对应章节里都有图解 + 可视化。"
          />
        </p>
      </Section>

      {/* §06 World map */}
      <Section
        id="map"
        index="06"
        title={{
          en: "The map: 14 chapters, easy to hard",
          zh: "世界地图:14 章,由易到难",
        }}
        desc={{
          en: "The bar shows difficulty. The stars show how often the structure appears on LeetCode. Pick any chapter to start.",
          zh: "色条 = 难度,右上 = LeetCode 出场频率 —— 点击任意一章出发",
        }}
      >
        <div className="map-grid">
          {CHAPTERS.filter((c) => c.id !== "home").map((c, i) => {
            const title = L(c.title);
            const sub = subLabel(title, L(c.en));
            return (
              <Reveal key={c.id} delay={Math.min(i * 40, 240)}>
                <Link
                  href={c.href}
                  className="map-card"
                  style={{ "--ch-hue": c.hue } as React.CSSProperties}
                >
                  <div className="map-head">
                    <span className="map-num">{c.num}</span>
                    <span className="map-title">{title}</span>
                    {sub && (
                      <span className="map-en" style={{ marginLeft: "auto" }}>
                        {sub}
                      </span>
                    )}
                  </div>
                  <p className="map-essence">{L(c.essence)}</p>
                  <div className="map-meta">
                    <span
                      className="map-level"
                      aria-label={L({
                        en: `Difficulty ${c.level} of 5`,
                        zh: `难度 ${c.level}/5`,
                      })}
                    >
                      {[1, 2, 3, 4, 5].map((l) => (
                        <i key={l} className={l <= c.level ? "on" : ""} />
                      ))}
                    </span>
                    <span className="map-freq">
                      <T en="LC frequency" zh="LC 频率" />{" "}
                      <b>{"★".repeat(c.freq)}</b>
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* §07 How to use it */}
      <Section
        id="howto"
        index="07"
        title={{ en: "How to use this course", zh: "这套课怎么用" }}
        desc={{
          en: "Every chapter follows the same three steps. Do not skip one.",
          zh: "每章都是同一个节奏 —— 三步走,别跳步",
        }}
      >
        <div className="grid-3 howto">
          <div className="card">
            <div className="card-title">
              <T en="Understand it first" zh="先看懂" />
            </div>
            <p>
              <T
                en={
                  <>
                    Intuition, then the memory diagram, then the operations one
                    by one. For each structure, answer three questions first:
                    what does it look like, what is it good at, and why?
                  </>
                }
                zh={
                  <>
                    直觉类比 → 内存图解 → 操作拆解。每个结构先回答三个问题:
                    长什么样?擅长什么?为什么?
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <T en="Then play with it" zh="再玩透" />
            </div>
            <p>
              <T
                en={
                  <>
                    Every chapter has a visual playground. Insert, delete, and
                    traverse by hand, and watch the pointers move and the memory
                    shift. A structure you have played with is a structure you
                    own.
                  </>
                }
                zh={
                  <>
                    每章都有可视化 Playground:亲手插入、删除、遍历,看指针怎么跳、
                    内存怎么搬。玩过的结构才是你的。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-title">
              <T en="✍️ Then practice" zh="✍️ 后刷题" />
            </div>
            <p>
              <T
                en={
                  <>
                    Two or three problems are worked in full, with solutions in
                    all three languages, followed by a list of common problems.
                    Your checkmarks are saved in this browser and counted in the
                    sidebar.
                  </>
                }
                zh={
                  <>
                    精讲 2~3 道代表题(带三语言题解),再给一份高频题单
                    —— 勾选进度会存在本地,侧栏实时统计。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <Callout
          tone="story"
          title={{ en: "About the three languages", zh: "关于三种语言" }}
        >
          <p>
            <T
              en={
                <>
                  The <b>Java / Python / JS</b> control in the top bar applies
                  to the whole site: switch once and every code window follows.
                  The <b>structure itself is the same in all three languages</b>{" "}
                  (an array is an array, a stack is a stack). The differences
                  are in the implementation and the standard library, and each
                  chapter has a section that lists them one by one.
                </>
              }
              zh={
                <>
                  顶栏的 <b>Java / Python / JS</b> 切换是全站联动的:切一次,所有代码窗口
                  一起换语言。三种语言的<b>数据结构抽象完全一致</b>(数组就是数组,栈就是栈),
                  差异只在实现与 API —— 每章的「三语言对照」会把差异一条条挑明。
                </>
              }
            />
          </p>
        </Callout>
      </Section>

      {/* §08 Quiz */}
      <Section
        id="quiz"
        index="08"
        title={{
          en: "Quick check: chapter 00 quiz",
          zh: "快问快答:序章通关测验",
        }}
        desc={{
          en: "7 questions. Get them all right to turn on the first green dot in the sidebar.",
          zh: "7 题 —— 全对点亮侧栏第一盏绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Chapter quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="home" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                A data structure is <b>a way of organizing data</b>. The way you
                organize it decides what each operation costs. There is no best
                one, only the one that fits.
              </>
            ),
            zh: (
              <>
                数据结构 = <b>数据的组织方式</b>;组织方式决定每种操作的成本,没有最好,只有最合适。
              </>
            ),
          },
          {
            en: (
              <>
                Memory is a street of numbered rooms:{" "}
                <b>address = base address + index × element size</b>. This one
                formula is the shared foundation of arrays, hash tables, and
                heaps.
              </>
            ),
            zh: (
              <>
                内存是一条编了号的长街:<b>地址 = 首地址 + 下标 × 元素大小</b>,这条公式是数组、哈希表、堆的共同地基。
              </>
            ),
          },
          {
            en: (
              <>
                Assigning an object copies <b>the reference (the note with the
                address)</b>, not the contents. Linked lists, trees, and graphs
                are boxes tied together by these notes.
              </>
            ),
            zh: (
              <>
                对象赋值传的是<b>引用(地址纸条)</b>,不是内容:链表、树、图都是“纸条串起来的盒子”。
              </>
            ),
          },
          {
            en: (
              <>
                Big-O describes <b>growth</b>, not seconds: drop coefficients,
                drop constants, keep the fastest-growing term. When you state a
                complexity, say whether it is average, worst case, or amortized.
              </>
            ),
            zh: (
              <>
                Big-O 是<b>增长趋势</b>不是秒表:扔系数、扔常数、只留最高阶;说复杂度时讲清是平均、最坏还是均摊。
              </>
            ),
          },
          {
            en: (
              <>
                Memorize the six levels: O(1) → O(log n) → O(n) → O(n log n) →
                O(n²) → O(2ⁿ). At one million items, the difference between them
                is the difference between an instant and longer than the age of
                the universe.
              </>
            ),
            zh: (
              <>
                六个档位记牢:O(1) → O(log n) → O(n) → O(n log n) → O(n²) → O(2ⁿ),
                一百万数据下它们是“瞬间”与“宇宙年龄”的差距。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="home" />
    </main>
  );
}
