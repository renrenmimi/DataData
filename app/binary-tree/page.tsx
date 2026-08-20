"use client";

// 第 7 章 · 二叉树 —— 全书篇幅最大的一章,同时承担「递归入门」的职责。
// 结构:为什么(层级天然存在)→ 内存(TreeNode = 引用×2)→
// 递归入门(factorial 调用栈 + count(node) 逐帧)→ 四种遍历(TraverseLab)→
// 手写实现 → 三语言对照 → 两种递归做法 + 四道精讲(104/226/101/102)→
// 题单 11 题 → 测验 8 题。
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
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/binary-tree-data";
import { T } from "@/lib/i18n";
import {
  TermTree,
  ShapeGallery,
  FactorialLab,
  RecurLab,
  TraverseLab,
  DepthLab,
  InvertLab,
  MirrorLab,
  LevelLab,
} from "./viz";
import "./chapter.css";

const CHIPS = [
  { id: "intuition", n: "01", label: { en: "Intuition", zh: "直觉" } },
  { id: "memory", n: "02", label: { en: "In memory", zh: "内存里的样子" } },
  {
    id: "recursion",
    n: "03",
    label: { en: "Recursion", zh: "递归入门" },
  },
  {
    id: "traverse",
    n: "04",
    label: { en: "Four traversals", zh: "四种遍历" },
  },
  { id: "impl", n: "05", label: { en: "Build them", zh: "手写实现" } },
  {
    id: "langs",
    n: "06",
    label: { en: "Three languages", zh: "三语言对照" },
  },
  {
    id: "patterns",
    n: "07",
    label: { en: "Patterns and walkthroughs", zh: "套路与精讲" },
  },
  { id: "problems", n: "08", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "09", label: { en: "Quiz", zh: "通关测验" } },
];

export default function BinaryTreeChapter() {
  return (
    <main className="page" data-ch="binary-tree">
      <Hero
        ch="binary-tree"
        title={{
          en: (
            <>
              The <span className="grad">Binary Tree</span>
            </>
          ),
          zh: (
            <>
              二叉树 <span className="grad">Binary Tree</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A linked list node holds one reference to the next node. Let a
              node hold <strong>two</strong>, and the chain becomes a tree. A
              tree is the natural shape for layered data, and it is where{" "}
              <strong>recursion</strong> first earns its place. Learn one
              sentence — a tree is a root plus a left subtree and a right
              subtree — and the next five chapters are variations on it.
            </>
          ),
          zh: (
            <>
              链表节点只握着一个指向下一站的引用;让它握<strong>两个</strong>,
              链就长成了树。树是层级数据的天然形状,也是<strong>递归</strong>
              第一次真正派上用场的地方 —— 记住「树 = 根 + 左子树 + 右子树」这一句,
              后面五章都是它的变奏。
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
          en: "Intuition: a lot of information is layered",
          zh: "直觉:世界本来就是分层的",
        }}
        desc={{
          en: "Family trees, folders, org charts — a straight line cannot express a hierarchy.",
          zh: "家谱、文件夹、公司架构 —— 一条线画不出层级",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Every structure so far has been <strong>a straight line</strong>
                  : array, linked list, stack, queue. Each element has at most
                  one &ldquo;next&rdquo;. But look at the information around you.
                  Folders contain folders. One manager sits above several
                  directors. One ancestor has many descendants. This page itself
                  (the HTML DOM) is tags inside tags. A{" "}
                  <strong>hierarchy</strong> is everywhere, and a straight line
                  cannot hold one.
                </p>
                <p>
                  How do you upgrade? Recall the linked list: each node has one{" "}
                  <code>next</code> reference pointing at the following node. Now
                  allow a node to point at{" "}
                  <strong>more than one next node</strong>. The chain immediately
                  grows into a tree drawn upside down: the root is at the top,
                  branches spread downward, and the ends are leaves. If every node
                  points at no more than two, called <code>left</code> and{" "}
                  <code>right</code>, the structure is a{" "}
                  <strong>binary tree</strong>. Why exactly two? Two branches
                  already express any yes-or-no decision, which is what the binary
                  search tree in the next chapter is built on. And a tree with any
                  number of children can be rewritten in binary form, by letting{" "}
                  <code>left</code> mean &ldquo;first child&rdquo; and{" "}
                  <code>right</code> mean &ldquo;next sibling&rdquo;. So the
                  binary tree is the standard building block of the whole family.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  到目前为止,我们的数据都排成<strong>一条线</strong>
                  :数组、链表、栈、队列,每个元素最多有一个「下一个」。
                  但看看你身边的信息:文件夹里套着子文件夹、一位总监下面带着几个组、
                  家谱里一位祖先开枝散叶、这个网页本身(HTML 的 DOM)也是标签套标签 ——
                  <strong>层级(hierarchy)</strong>无处不在,而一条线画不出层级。
                </p>
                <p>
                  怎么升级?回想链表:每个节点有一个 <code>next</code>{" "}
                  引用,指向下一站。现在允许它<strong>指向不止一个「下一站」</strong>
                  —— 数据结构立刻从「一条链」长成「一棵倒挂的树」:最上面是根,
                  往下逐层展开,末端是叶。如果每个节点最多指向两个,叫{" "}
                  <code>left</code> 和 <code>right</code>,就是本章的主角
                  <strong>二叉树(binary tree)</strong>。为什么偏偏是两个?
                  两个分支已经能表达任何「二选一」的决策 ——
                  下一章二叉搜索树的地基就是它;而且任意多叉树都能改写成二叉形态:
                  让 <code>left</code> 表示「第一个孩子」、<code>right</code>{" "}
                  表示「下一个兄弟」即可。所以二叉树是整个树家族的标准构件。
                </p>
              </>
            }
          />
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">RULE 01</div>
            <div className="card-title">
              <T en="At most two children" zh="最多两叉" />
            </div>
            <p>
              <T
                en={
                  <>
                    Every node has at most one left child and at most one right
                    child, and the two positions are <b>not interchangeable</b>:
                    a node with only a left child is a different tree from a node
                    with only a right child. A child may be missing; there can
                    never be a third.
                  </>
                }
                zh={
                  <>
                    每个节点至多一个左孩子、一个右孩子,而且两个位置<b>不能互换</b>
                    :只有左孩子的节点,和只有右孩子的节点,是两棵不同的树。
                    孩子可以缺,但不能多出第三个。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 02</div>
            <div className="card-title">
              <T en="One parent, no cycles" zh="单亲,无环" />
            </div>
            <p>
              <T
                en={
                  <>
                    Every node except the root has <b>exactly one parent</b>, and
                    following child references never leads back to an ancestor.
                    Drop this rule and the structure becomes a graph, which is
                    chapter 12.
                  </>
                }
                zh={
                  <>
                    除根以外,每个节点<b>恰好有一个父节点</b>
                    ;顺着孩子引用一直走,永远不会绕回某个祖先。
                    去掉这条规则,结构就退化成图 —— 那是第 12 章的内容。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 03</div>
            <div className="card-title">
              <T en="Every subtree is a tree" zh="子树也是树" />
            </div>
            <p>
              <T
                en={
                  <>
                    Look down from <b>any</b> node and you see a valid binary tree
                    again: its subtree. This self-similarity is the reason
                    recursion works here, and the chapter uses it on every page.
                  </>
                }
                zh={
                  <>
                    从<b>任何</b>一个节点往下看,看到的又是一棵合法的二叉树(它的子树)。
                    这条自相似性质正是递归能用在树上的原因,本章会反复用到它。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <div className="prose" style={{ marginTop: 18 }}>
          <T
            en={
              <p>
                First the vocabulary. Every problem statement later in this
                chapter is written with these words.
              </p>
            }
            zh={
              <p>
                先把「家谱称呼」认全 —— 本章后面每道题的题面都在用这些词:
              </p>
            }
          />
        </div>
        <TermTree />
        <div className="prose">
          <T
            en={
              <p>
                Two of those words carry a number, and this course counts that
                number in <b>edges</b> — the usual convention. The{" "}
                <b>depth</b> of a node is the number of edges from the root down
                to it, so the root has depth 0. The <b>height</b> of a node is
                the number of edges on the longest path from it down to a leaf,
                so a leaf has height 0. The <b>height of the tree</b> is the
                height of its root. A tree holding only a root therefore has
                height 0, and an empty tree is conventionally −1. Chapters 8 and
                9 keep this definition, so their formulas can be compared
                directly.
              </p>
            }
            zh={
              <p>
                这里面有两个词要带上数字,而本课程一律<b>按边数计</b>
                (这也是主流约定):节点的<b>深度 depth</b> =
                从根走到它经过的边数,所以根的深度是 0;节点的<b>高度 height</b>{" "}
                = 从它往下走到叶子的最长路径的边数,所以叶子的高度是 0;
                <b>整棵树的高度</b> = 根的高度。于是只有一个根的树,树高为 0;
                空树按惯例记作 −1。第 8、9 章沿用同一套定义,
                两章的公式可以直接对照。
              </p>
            }
          />
        </div>
        <div className="prose">
          <T
            en={
              <p>
                Three shapes have names of their own. Read the naming carefully:
                the Chinese and the English terms do not line up the way you would
                guess, and the third one is what chapter 09 builds the heap on.
              </p>
            }
            zh={
              <p>
                还有三种以「形状」命名的特殊形态。注意看它们的命名 ——
                中英文的对应关系和直觉不一样;第三种是第 9 章「堆」的地基:
              </p>
            }
          />
        </div>
        <ShapeGallery />
        <Callout
          tone="idea"
          title={{
            en: "Why a complete tree fits into an array",
            zh: "完全二叉树为什么能塞进数组",
          }}
        >
          <T
            en={
              <p>
                Number the nodes in level order, starting at 0. Then the children
                of node <code>i</code> sit at <code>2i+1</code> and{" "}
                <code>2i+2</code>, and its parent sits at{" "}
                <code>(i-1)/2</code> rounded down. The arithmetic replaces the
                references completely. It only pays off when the used numbers form
                one unbroken run, which is exactly the definition of a{" "}
                <b>complete</b> tree: n nodes need an array of n slots. For other
                shapes the run has holes. A chain of n nodes that always leans
                right puts its deepest node at index 2<sup>n</sup>−2, so the array
                would need 2<sup>n</sup>−1 slots to hold n values. That is why
                array storage is reserved for complete trees, and why the heap in
                chapter 09 keeps itself complete on purpose.
              </p>
            }
            zh={
              <p>
                把节点按层序从 0 开始编号,于是编号 <code>i</code> 的两个孩子恰好落在{" "}
                <code>2i+1</code> 和 <code>2i+2</code>,父亲落在{" "}
                <code>(i-1)/2</code> 向下取整 —— 算术完全替代了引用。
                但这只有在「用到的编号是一段没有空洞的连续区间」时才划算,
                而这正是<b>完全二叉树</b>的定义:n 个节点用 n 格数组。
                别的形状会留下空洞:一条始终向右倾斜的 n 节点链,
                最深的节点编号是 2<sup>n</sup>−2,要存下 n 个值就得开 2<sup>n</sup>−1
                格。所以数组存树只对完全二叉树成立,第 9 章的堆也才要刻意维持「完全」。
              </p>
            }
          />
        </Callout>
        <Callout
          tone="story"
          title={{
            en: "Where you already meet trees",
            zh: "你每天都在和树打交道",
          }}
        >
          <T
            en={
              <p>
                A browser renders a page by walking the DOM tree.{" "}
                <code>ls -R</code> walks a directory tree. A compiler turns your
                source into a syntax tree (AST) before translating it. Parsed JSON
                is a tree. A database index is usually a B+ tree, which is not
                binary but follows the same idea: a hierarchy with a bounded
                number of children per node. Wherever data nests, a tree is its
                shape, and that is why tree traversal shows up in so many
                interviews.
              </p>
            }
            zh={
              <p>
                浏览器渲染页面 = 遍历 DOM 树;<code>ls -R</code> 列目录 =
                遍历文件树;编译器先把源码变成语法树(AST)再翻译;JSON
                解析出来就是一棵树;数据库索引通常是 B+ 树 —— 它不是二叉的,
                但思路一样:每个节点孩子数有上限的层级结构。
                只要数据是嵌套的,树就是它的形状 ——
                这也是树的遍历成为面试保留节目的原因。
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
          en: "In memory: one value, two references",
          zh: "内存里的样子:一个值,两条出路",
        }}
        desc={{
          en: "TreeNode = val + left + right. Still references, still addresses.",
          zh: "TreeNode = val + left + right —— 依然是引用,依然只是地址",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                A tree node is a close relative of a linked list node. The{" "}
                <code>ListNode</code> of chapter 3 holds a <code>val</code> and
                one <code>next</code> reference, and a reference is the address of
                another object, not the object itself (see the introduction, §03).{" "}
                <code>TreeNode</code> keeps the same idea and holds{" "}
                <strong>two</strong> references instead of one:
              </p>
            }
            zh={
              <p>
                树的节点和链表节点是近亲。第 3 章的 <code>ListNode</code> 里装着{" "}
                <code>val</code> 和一个 <code>next</code> 引用 ——
                而引用只是「另一个对象在哪」的地址,不是对象本身(序章 §03)。
                <code>TreeNode</code> 沿用同一个想法,只是把一个引用换成
                <strong>两个</strong>:
              </p>
            }
          />
        </div>
        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="card-kicker">
              <T en="CHAPTER 03" zh="第 3 章" />
            </div>
            <div className="card-title">
              <T en="ListNode: one way out" zh="ListNode:一条出路" />
            </div>
            <p
              className="mono"
              style={{ fontSize: 14, textAlign: "center", margin: "14px 0" }}
            >
              [ val | next → ]
            </p>
            <p>
              <T
                en="Only one direction is available, so the structure can only be a line. The nodes themselves are scattered anywhere in the heap and are held together by next."
                zh="只能往一个方向走,结构注定是一条线。节点本身散落在堆内存的任意角落,靠 next 串起来。"
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="THIS CHAPTER" zh="本章" />
            </div>
            <div className="card-title">
              <T en="TreeNode: two ways out" zh="TreeNode:两条出路" />
            </div>
            <p
              className="mono"
              style={{ fontSize: 14, textAlign: "center", margin: "14px 0" }}
            >
              [ ← left | val | right → ]
            </p>
            <p>
              <T
                en="Every step is a choice between left and right. The nodes are still scattered in the heap. The tree shape exists only in what the references point at; there is no drawn tree anywhere in memory."
                zh="每一步都面临「往左还是往右」。节点同样散落在堆里,树形只存在于引用的指向关系中 —— 内存里并没有一棵「画出来的树」。"
              />
            </p>
          </div>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "The one sentence this chapter is built on",
            zh: "整章的钥匙:树的递归定义",
          }}
        >
          <T
            en={
              <p>
                <b>
                  A binary tree is either empty, or it is one root node plus a
                  left subtree and a right subtree — and each of those two
                  subtrees is itself a binary tree.
                </b>{" "}
                Notice that the empty tree counts as a tree. It is not an
                exception to be tolerated; it is the floor the recursion stands
                on. Both children of a leaf are empty trees, so &ldquo;what do I
                do with an empty tree&rdquo; is always the first line of the code.
                Read that sentence three times. Everything else in this chapter is
                a translation of it.
              </p>
            }
            zh={
              <p>
                <b>
                  一棵二叉树,要么是空的,要么 = 一个根节点 + 一棵左子树 +
                  一棵右子树(而这两棵子树,又各自是一棵二叉树)。
                </b>{" "}
                注意「空也是树」—— 它不是勉强容忍的特例,而是递归的地基:
                任何叶子的左右孩子都是空树,所以「空树怎么办」永远是递归的第一行代码。
                这句话读三遍,本章剩下的一切都是它的翻译。
              </p>
            }
          />
        </Callout>
        <div className="prose">
          <T
            en={
              <p>
                A useful count: a tree with n nodes has 2n child slots. Only n−1
                of them are used, because every node except the root is the child
                of exactly one node. The other{" "}
                <strong>n+1 slots hold null</strong>. There are more nulls than
                nodes. That is why the base case is reached so often, and why
                leaving it out is not untidy but fatal.
              </p>
            }
            zh={
              <p>
                一个有用的计数:n 个节点的二叉树一共有 2n 条「孩子插槽」,
                其中只用了 n−1 条(除根以外每个节点恰好当一次别人的孩子),
                剩下 <strong>n+1 条插槽是 null</strong>。null 比节点还多 ——
                这就是终止条件会被走到那么多次的原因,也说明它不是「写得整齐」的问题,
                而是不写就必错。
              </p>
            }
          />
        </div>
      </Section>

      {/* ================= §03 递归入门 ================= */}
      <Section
        id="recursion"
        index="03"
        title={{
          en: "Recursion: a function that calls itself",
          zh: "递归:会自己调用自己的函数",
        }}
        desc={{
          en: "The shape of a tree is recursive, so the code that handles it is recursive too. This is where recursion is taught.",
          zh: "树的形状是递归的,处理它的代码自然也是 —— 这里是全书的递归第一课",
        }}
        badge={
          <span className="chip" data-tone="warn">
            <T en="★ Start here" zh="★ 零基础重点" />
          </span>
        }
      >
        <div className="prose">
          <T
            en={
              <p>
                Warm up away from trees, with the smallest possible example. The
                definition of factorial: n! = n × (n−1)!, and 0! = 1! = 1. Notice
                that the definition{" "}
                <strong>uses factorial to explain factorial</strong>. In
                mathematics that is called a recursive definition. In code it is a{" "}
                <strong>function that calls itself</strong>:
              </p>
            }
            zh={
              <p>
                先离开树,从最小的例子热身。阶乘的定义:n! = n × (n−1)!,而 0! = 1! =
                1。注意这个定义<strong>用阶乘解释了阶乘</strong> ——
                数学里这叫递归定义,代码里就是一个<strong>调用自己的函数</strong>:
              </p>
            }
          />
        </div>
        <CodeTabs
          title="factorial"
          java={{
            code: {
              en: `class Recursion {
    // n! = n × (n-1)!, and 0! = 1! = 1 — the definition is already recursive
    static int factorial(int n) {
        if (n <= 1) return 1;          // base case: the smallest input, answered directly
        return n * factorial(n - 1);   // recursive call: hand the smaller problem to itself
    }

    public static void main(String[] args) {
        System.out.println(factorial(3)); // 6
    }
}`,
              zh: `class Recursion {
    // n! = n × (n-1)!,而 0! = 1! = 1 —— 定义本身就是递归的
    static int factorial(int n) {
        if (n <= 1) return 1;          // 终止条件:最小的输入,不递归就能直接回答
        return n * factorial(n - 1);   // 递归调用:把更小的同类问题交给自己
    }

    public static void main(String[] args) {
        System.out.println(factorial(3)); // 6
    }
}`,
            },
            hl: [4, 5],
          }}
          python={{
            code: {
              en: `def factorial(n):
    if n <= 1:                   # base case: the smallest input, answered directly
        return 1
    return n * factorial(n - 1)  # recursive call: hand the smaller problem to itself

print(factorial(3))  # 6`,
              zh: `def factorial(n):
    if n <= 1:                   # 终止条件:最小的输入,不递归就能直接回答
        return 1
    return n * factorial(n - 1)  # 递归调用:把更小的同类问题交给自己

print(factorial(3))  # 6`,
            },
            hl: [2, 3, 4],
          }}
          js={{
            code: {
              en: `function factorial(n) {
  if (n <= 1) return 1;          // base case: the smallest input, answered directly
  return n * factorial(n - 1);   // recursive call: hand the smaller problem to itself
}

console.log(factorial(3)); // 6`,
              zh: `function factorial(n) {
  if (n <= 1) return 1;          // 终止条件:最小的输入,不递归就能直接回答
  return n * factorial(n - 1);   // 递归调用:把更小的同类问题交给自己
}

console.log(factorial(3)); // 6`,
            },
            hl: [2, 3],
          }}
        />
        <div className="prose">
          <T
            en={
              <p>
                &ldquo;The function has not finished, and it calls itself. Does
                the computer not get confused?&rdquo; It does not, because of the{" "}
                <strong>call stack</strong> (the CallStack from chapter 4 again).
                Each call pushes a new frame, and each frame keeps its own
                arguments and its own position in the code. Watch factorial(3)
                from beginning to end:
              </p>
            }
            zh={
              <p>
                「函数还没执行完,又调用了自己 —— 电脑不会晕吗?」不会,
                因为有<strong>调用栈</strong>(第 4 章的 CallStack 又见面了):
                每次调用压入一个新栈帧,各帧独立保存自己的参数和执行进度。
                眼见为实,逐帧看 factorial(3) 的一生:
              </p>
            }
          />
        </div>
        <FactorialLab />
        <div className="prose" style={{ marginTop: 18 }}>
          <T
            en={
              <p>
                Writing a recursion means answering three questions. Nothing else.
              </p>
            }
            zh={<p>写任何递归,只需要回答三个问题,没有第四个:</p>}
          />
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="QUESTION 1" zh="问题一" />
            </div>
            <div className="card-title">
              <T en="What does it promise to return?" zh="它承诺返回什么?" />
            </div>
            <p>
              <T
                en={
                  <>
                    One sentence that says exactly what the function gives back,
                    and it must be true for <b>every</b> node, not only the root.
                    For counting nodes: <i>count(node) returns how many nodes are
                    in the subtree rooted at node</i>. Without this sentence the
                    other two questions cannot be answered.
                  </>
                }
                zh={
                  <>
                    用一句话说清函数到底返回什么,而且这句话对<b>每个</b>
                    节点都成立,不只对根成立。以数节点为例:
                    <i>count(node) 返回「以 node 为根的子树里有多少个节点」</i>。
                    这句话不先写下来,后面两个问题根本没法回答。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="QUESTION 2" zh="问题二" />
            </div>
            <div className="card-title">
              <T en="What is the base case?" zh="终止条件是什么?" />
            </div>
            <p>
              <T
                en={
                  <>
                    The smallest input you can answer <b>without</b> recursing.
                    For factorial it is n ≤ 1. On a tree it is almost always the{" "}
                    <b>empty tree</b>, <code>node == null</code>. It goes on the
                    first line, and the value it returns has to satisfy the
                    promise from question 1: count(null) = 0.
                  </>
                }
                zh={
                  <>
                    最小的、<b>不用递归</b>就能直接回答的输入。阶乘是 n ≤
                    1;树上几乎永远是<b>空树</b>,即 <code>node == null</code>。
                    它写在第一行,而且它返回的值必须满足问题一的承诺:count(null) =
                    0。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="QUESTION 3" zh="问题三" />
            </div>
            <div className="card-title">
              <T
                en="How do you combine the children's answers?"
                zh="怎么用孩子的答案拼出我的答案?"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    Assume the recursive calls have already returned{" "}
                    <b>correct</b> answers, then build this node answer from them:
                    count(node) = 1 + count(left) + count(right). The assumption is
                    allowed because it is the induction hypothesis, not optimism —
                    see the note at the end of this section. This is the only step
                    you actually design.
                  </>
                }
                zh={
                  <>
                    <b>假设递归调用已经返回了正确答案</b>,只管怎么用它们拼出当前答案:
                    count(node) = 1 + count(左) + count(右)。
                    这个假设是允许的,因为它就是数学归纳法的归纳假设,不是碰运气 ——
                    见本节末尾那条说明。三个问题里,只有这一步需要你真正动脑设计。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <div className="prose" style={{ marginTop: 18 }}>
          <T
            en={
              <p>
                Now back to the tree. §02 says a tree is a root plus a left
                subtree plus a right subtree, so{" "}
                <strong>counting the nodes</strong> is already recursive in shape.
                Answer the three questions: the promise is{" "}
                <i>count(node) returns the number of nodes in the subtree rooted
                at node</i>; the base case is count(null) = 0; the combination is 1
                + count(left) + count(right). Watch it run on a tree of 7 nodes.
                The stack on the right rises and falls, and each node shows the
                value it returns the moment it finishes:
              </p>
            }
            zh={
              <p>
                现在回到树。§02 的钥匙说「树 = 根 + 左子树 + 右子树」,那么
                <strong>数节点</strong>这个问题天然就是递归形状。
                照着三个问题回答一遍:承诺是
                <i>count(node) 返回「以 node 为根的子树里有多少个节点」</i>
                ;终止条件是 count(null) = 0;合并是 1 + count(左) + count(右)。
                看它在一棵 7 节点的树上怎么跑 ——
                注意右侧调用栈的涨落,以及每个节点算完时亮出的返回值:
              </p>
            }
          />
        </div>
        <RecurLab />
        <Callout
          tone="warn"
          title={{
            en: "The most common mistake: no base case",
            zh: "最常见的错误:遗漏终止条件",
          }}
        >
          <T
            en={
              <p>
                Without <code>if (node == null) return 0;</code> the code will try
                to read <code>null.left</code> and throw a null pointer error. In
                other shapes of the same mistake the function calls itself
                forever, the frames pile up to tens of thousands, and Java and
                JavaScript raise a <b>stack overflow</b> while Python raises{" "}
                <b>RecursionError</b>. Build the habit:{" "}
                <b>the first line always asks what to do with an empty tree</b>.
                §05 lists the recursion depth limit of each language.
              </p>
            }
            zh={
              <p>
                没有 <code>if (node == null) return 0;</code>,代码就会试图读{" "}
                <code>null.left</code>,抛空指针异常;换一种写法则会无限自我调用,
                栈帧堆到几万层 —— Java 和 JavaScript 抛<b>栈溢出</b>,Python 抛{" "}
                <b>RecursionError</b>。养成肌肉记忆:
                <b>第一行永远先问「空树怎么办」</b>。§05 会给出各语言的递归深度红线。
              </p>
            }
          />
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "Why assuming the answer is not wishful thinking",
            zh: "为什么「假设孩子已经答对」不是自欺欺人",
          }}
        >
          <T
            en={
              <p>
                Mathematical induction: prove the statement for n = 1 (the base
                case), then prove that if it holds for n−1 it holds for n (the
                combination step), and it holds for every n. Recursion is the
                executable version of the same argument. Two conditions make it
                valid: the base case must be correct, and every call must be{" "}
                <b>strictly smaller</b>, so the base case is always reached. A
                beginner tries to unfold three levels in their head and loses
                track. The working method is to check one level only:{" "}
                <b>
                  given correct answers from the children, is my answer correct?
                </b>
              </p>
            }
            zh={
              <p>
                数学归纳法:先证 n = 1 成立(终止条件),
                再证「若 n−1 成立则 n 成立」(合并这一步),
                就证明了对一切 n 成立。递归是同一个论证的可执行版本。
                它成立要满足两个条件:终止条件本身正确,且每次调用规模
                <b>严格变小</b>,从而终止条件一定会被走到。
                新手在脑子里追着展开三层就晕了;正确的做法是只检查一层:
                <b>假定孩子给的答案是对的,我这一层拼出来的答案对不对?</b>
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §04 四种遍历 ================= */}
      <Section
        id="traverse"
        index="04"
        title={{
          en: "Four traversals: flattening a tree into a sequence",
          zh: "四种遍历:把树摊平成一个序列",
        }}
        desc={{
          en: "Preorder, inorder, and postorder are one route with three visiting times. Level order is a different walk, driven by a queue.",
          zh: "前 / 中 / 后序是同一条路线的三种「访问时机」;层序是另一种走法(BFS)",
        }}
        badge={
          <span className="chip" data-tone="warn">
            <T en="★ Core of the chapter" zh="★ 全章核心" />
          </span>
        }
      >
        <div className="prose">
          <T
            en={
              <p>
                A tree is two-dimensional, but printing, comparing, and
                serializing all need a one-dimensional sequence. Visiting every
                node in a fixed order is called a{" "}
                <strong>traversal</strong>. Depth-first search (DFS) has only one
                route: follow one branch to the bottom, then come back and take
                the next. What differs between the three DFS traversals is{" "}
                <strong>when the node itself is visited</strong>, relative to its
                two subtrees. Visit it first and you get{" "}
                <strong>preorder</strong> (root, left, right). Visit it between
                the two subtrees and you get <strong>inorder</strong> (left, root,
                right). Visit it last and you get <strong>postorder</strong>
                (left, right, root). Left always comes before right; that part is
                just the convention. The fourth traversal is breadth-first search
                (BFS), or <strong>level order</strong>: the whole first level,
                then the whole second, always left to right. It never dives, and
                it is driven by a <strong>queue</strong> (chapter 5). Run each of
                the four once:
              </p>
            }
            zh={
              <p>
                树是二维的,而打印、比较、序列化都需要一维序列 ——
                按某种固定顺序<strong>走遍每个节点</strong>就叫
                <strong>遍历(traversal)</strong>。深度优先(DFS)的路线只有一条:
                顺着一条分支扎到底,再回头走下一条。三种 DFS 遍历的差别只有一个:
                <strong>节点自己相对于两棵子树在什么时候被访问</strong>。
                先访问自己 = <strong>前序</strong>(根 → 左 → 右);
                在两棵子树之间访问 = <strong>中序</strong>(左 → 根 → 右);
                最后访问 = <strong>后序</strong>(左 → 右 →
                根)。左永远在右前面,这只是约定。第四种是广度优先(BFS)的
                <strong>层序</strong>:先整个第一层,再整个第二层,每层从左到右。
                它不「扎到底」,靠<strong>队列</strong>(第 5 章)驱动。
                亲手把四种走法各放一遍:
              </p>
            }
          />
        </div>
        <TraverseLab />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Traversal" zh="遍历" />
                </th>
                <th>
                  <T en="Order" zh="顺序" />
                </th>
                <th>
                  <T en="Typical use, and why" zh="典型用途(为什么是它)" />
                </th>
                <th>
                  <T en="Time" zh="时间" />
                </th>
                <th>
                  <T en="Extra space" zh="辅助空间" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T en="Preorder" zh="前序" />
                  </b>{" "}
                  preorder
                </td>
                <td>
                  <T en="root → left → right" zh="根 → 左 → 右" />
                </td>
                <td>
                  <T
                    en="Copying or serializing a tree. The root must be written first, so the reader knows what the later nodes hang from."
                    zh="复制 / 序列化一棵树 —— 先写下根,后面的节点才知道挂在谁下面"
                  />
                </td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <BigO
                    o="logn"
                    label={{ en: "O(h) call stack", zh: "O(h) 递归栈" }}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Inorder" zh="中序" />
                  </b>{" "}
                  inorder
                </td>
                <td>
                  <T en="left → root → right" zh="左 → 根 → 右" />
                </td>
                <td>
                  <T
                    en={
                      <>
                        On a BST it produces the values in <b>ascending order</b>{" "}
                        — the opening line of the next chapter.
                      </>
                    }
                    zh={
                      <>
                        对二叉搜索树得到<b>升序序列</b> —— 下一章的开场白
                      </>
                    }
                  />
                </td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <BigO
                    o="logn"
                    label={{ en: "O(h) call stack", zh: "O(h) 递归栈" }}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Postorder" zh="后序" />
                  </b>{" "}
                  postorder
                </td>
                <td>
                  <T en="left → right → root" zh="左 → 右 → 根" />
                </td>
                <td>
                  <T
                    en="Finish the children before finishing me: computing height, deleting or freeing a whole tree, any bottom-up problem."
                    zh="「先处理完孩子再处理我」:求高度、删除或释放整棵树、一切自底向上的题目"
                  />
                </td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <BigO
                    o="logn"
                    label={{ en: "O(h) call stack", zh: "O(h) 递归栈" }}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Level order" zh="层序" />
                  </b>{" "}
                  level-order
                </td>
                <td>
                  <T en="level by level, left to right" zh="一层一层,左到右" />
                </td>
                <td>
                  <T
                    en="Output per level, and anything shallowest-first: BFS reaches a node at the smallest possible depth first."
                    zh="按层输出,以及一切「求最浅」的问题 —— BFS 第一次到达某个节点时,深度一定是最小的"
                  />
                </td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <BigO
                    o="n"
                    label={{ en: "O(w) queue", zh: "O(w) 队列" }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "Two anchors, and why we write O(h) and not O(log n)",
            zh: "两个记忆锚点,以及为什么写 O(h) 而不是 O(log n)",
          }}
        >
          <T
            en={
              <p>
                First anchor: the name of a DFS traversal describes{" "}
                <b>when the root is visited</b> — pre, in, post. Left is always
                before right, in all three. Second anchor: <b>DFS spends its extra
                space on a stack</b> (the call stack, or one you manage yourself),
                so it is O(h), where h is the height of the tree.{" "}
                <b>Write O(h), not O(log n).</b> h is about log n only when the
                tree is balanced; it is n−1 when the tree degenerates into a
                chain. <b>BFS spends its extra space on a queue</b>, so it is
                O(w), where w is the number of nodes on the widest level. For a
                perfect tree of one million nodes, h is about 20 while w is about
                500,000 — four orders of magnitude apart, on the same tree.
              </p>
            }
            zh={
              <p>
                锚点一:DFS 三种遍历的名字说的都是<b>根什么时候被访问</b> ——
                pre(前)/ in(中)/ post(后);左永远在右前面,三种都一样。
                锚点二:<b>DFS 的额外空间花在栈上</b>
                (递归栈或自己维护的栈),所以是 O(h),h 是树的高度。
                <b>要写 O(h),不要写 O(log n)</b> —— 只有树平衡时 h 才约等于 log
                n;退化成一条链时 h = n−1。<b>BFS 的额外空间花在队列上</b>
                ,所以是 O(w),w 是最宽那一层的节点数。一棵一百万节点的满二叉树,h ≈
                20,而 w ≈ 50 万 —— 同一棵树,两者差四个数量级。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §05 手写实现 ================= */}
      <Section
        id="impl"
        index="05"
        title={{
          en: "Writing them yourself: three DFS traversals, an iterative preorder, and a BFS",
          zh: "手写实现:三种 DFS + 栈迭代 + 队列层序",
        }}
        desc={{
          en: "The recursive versions are the definition typed out. The iterative version shows what the recursion was doing: managing a stack.",
          zh: "递归版是「定义的直译」;迭代版揭示递归在做什么 —— 我们自己管栈",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                Compare the three recursive functions. Only{" "}
                <strong>one line moves</strong>: the line that outputs the node
                sits before, between, or after the two recursive calls. The route
                is identical in all three. The iterative preorder then makes the
                hidden stack visible: it keeps its own stack of nodes still to be
                handled, and pushes the <strong>right</strong> child first,
                because a stack returns the item pushed last — pushing left second
                is what makes left come out first. The level-order function at the
                bottom records <code>size</code> before the inner loop; §07
                explains why that single line is what separates one level from the
                next.
              </p>
            }
            zh={
              <p>
                对比三个递归版本,你会发现<strong>只有一行的位置不同</strong>:
                输出节点那行,分别落在两次递归调用之前、之间、之后 ——
                因为路线本来就一样。迭代版前序则把隐藏的栈搬到明面上:
                用自己的栈保存「待处理的节点」,并且<strong>先压右孩子</strong>
                —— 栈返回的是最后压入的那个,所以后压左孩子,左孩子才会先被弹出。
                最下面的层序函数在内层循环之前记下了 <code>size</code>,§07
                会讲清这一行为什么就是层与层的分界线。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="traversals"
          java={{
            code: {
              en: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

class Traversals {
    // ---- Three recursive DFS traversals: one route, three visiting times ----
    void preorder(TreeNode node, List<Integer> out) {
        if (node == null) return;        // base case: an empty tree, go straight back
        out.add(node.val);               // the node first -> preorder
        preorder(node.left, out);        // left
        preorder(node.right, out);       // right
    }

    void inorder(TreeNode node, List<Integer> out) {
        if (node == null) return;
        inorder(node.left, out);         // left
        out.add(node.val);               // the node in between -> inorder
        inorder(node.right, out);        // right
    }

    void postorder(TreeNode node, List<Integer> out) {
        if (node == null) return;
        postorder(node.left, out);       // left
        postorder(node.right, out);      // right
        out.add(node.val);               // the node last -> postorder
    }

    // ---- Iterative preorder: an explicit stack replaces the call stack ----
    List<Integer> preorderIter(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        Deque<TreeNode> stack = new ArrayDeque<>();
        if (root != null) stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            out.add(node.val);
            if (node.right != null) stack.push(node.right); // push right first
            if (node.left != null) stack.push(node.left);   // left pushed last pops first
        }
        return out;
    }

    // ---- Level order (BFS): a queue ----
    List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();               // record how many nodes this level has
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = q.poll();
                level.add(node.val);
                if (node.left != null) q.offer(node.left);
                if (node.right != null) q.offer(node.right);
            }
            res.add(level);
        }
        return res;
    }
}`,
              zh: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

class Traversals {
    // ---- 递归版三种 DFS:同一条路线,只差访问时机 ----
    void preorder(TreeNode node, List<Integer> out) {
        if (node == null) return;        // 终止条件:空树,直接回头
        out.add(node.val);               // 先访问节点自己 -> 前序
        preorder(node.left, out);        // 左
        preorder(node.right, out);       // 右
    }

    void inorder(TreeNode node, List<Integer> out) {
        if (node == null) return;
        inorder(node.left, out);         // 左
        out.add(node.val);               // 在两棵子树之间访问 -> 中序
        inorder(node.right, out);        // 右
    }

    void postorder(TreeNode node, List<Integer> out) {
        if (node == null) return;
        postorder(node.left, out);       // 左
        postorder(node.right, out);      // 右
        out.add(node.val);               // 最后才访问节点自己 -> 后序
    }

    // ---- 迭代版前序:用显式栈代替递归栈 ----
    List<Integer> preorderIter(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        Deque<TreeNode> stack = new ArrayDeque<>();
        if (root != null) stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            out.add(node.val);
            if (node.right != null) stack.push(node.right); // 先压右孩子
            if (node.left != null) stack.push(node.left);   // 后压左,左才先弹出
        }
        return out;
    }

    // ---- 层序遍历(BFS):队列 ----
    List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();               // 先记住这一层有几个节点
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = q.poll();
                level.add(node.val);
                if (node.left != null) q.offer(node.left);
                if (node.right != null) q.offer(node.right);
            }
            res.add(level);
        }
        return res;
    }
}`,
            },
            hl: [13, 14, 15, 20, 21, 22, 27, 28, 29, 40, 41, 53],
            note: {
              en: (
                <>
                  <b>Stack depth:</b> a JVM thread stack is about 512 KB to 1 MB
                  by default. A tree of a million nodes that has degenerated into
                  a chain will raise StackOverflowError. For deep trees, use the
                  iterative version or raise the stack size with <code>-Xss</code>
                  .
                </>
              ),
              zh: (
                <>
                  <b>栈深:</b>JVM 默认线程栈约 512KB~1MB,
                  退化成一条链的百万节点树会抛 StackOverflowError ——
                  深树要么用迭代版,要么用 <code>-Xss</code> 调大栈。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# ---- Three recursive DFS traversals: one route, three visiting times ----
def preorder(node, out):
    if node is None:           # base case: an empty tree, go straight back
        return
    out.append(node.val)       # the node first -> preorder
    preorder(node.left, out)   # left
    preorder(node.right, out)  # right

def inorder(node, out):
    if node is None:
        return
    inorder(node.left, out)    # left
    out.append(node.val)       # the node in between -> inorder
    inorder(node.right, out)   # right

def postorder(node, out):
    if node is None:
        return
    postorder(node.left, out)  # left
    postorder(node.right, out) # right
    out.append(node.val)       # the node last -> postorder

# ---- Iterative preorder: an explicit stack replaces the call stack ----
def preorder_iter(root):
    out, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right: stack.append(node.right)  # push right first
        if node.left:  stack.append(node.left)   # left pushed last pops first
    return out

# ---- Level order (BFS): a queue ----
def level_order(root):
    res = []
    if root is None:
        return res
    q = deque([root])
    while q:
        size = len(q)              # record how many nodes this level has
        level = []
        for _ in range(size):
            node = q.popleft()
            level.append(node.val)
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        res.append(level)
    return res

# Deep trees: the default recursion limit in Python is about 1000
# sys.setrecursionlimit(10 ** 6)   # raise it by hand for deep or chain-shaped trees`,
              zh: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# ---- 递归版三种 DFS:同一条路线,只差访问时机 ----
def preorder(node, out):
    if node is None:           # 终止条件:空树,直接回头
        return
    out.append(node.val)       # 先访问节点自己 -> 前序
    preorder(node.left, out)   # 左
    preorder(node.right, out)  # 右

def inorder(node, out):
    if node is None:
        return
    inorder(node.left, out)    # 左
    out.append(node.val)       # 在两棵子树之间访问 -> 中序
    inorder(node.right, out)   # 右

def postorder(node, out):
    if node is None:
        return
    postorder(node.left, out)  # 左
    postorder(node.right, out) # 右
    out.append(node.val)       # 最后才访问节点自己 -> 后序

# ---- 迭代版前序:用显式栈代替递归栈 ----
def preorder_iter(root):
    out, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right: stack.append(node.right)  # 先压右孩子
        if node.left:  stack.append(node.left)   # 后压左,左才先弹出
    return out

# ---- 层序遍历(BFS):队列 ----
def level_order(root):
    res = []
    if root is None:
        return res
    q = deque([root])
    while q:
        size = len(q)              # 先记住这一层有几个节点
        level = []
        for _ in range(size):
            node = q.popleft()
            level.append(node.val)
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        res.append(level)
    return res

# 深树注意:Python 默认递归深度上限约 1000
# sys.setrecursionlimit(10 ** 6)   # 遇到深树 / 链状树时手动调大`,
            },
            hl: [14, 15, 16, 21, 22, 23, 28, 29, 30, 38, 39, 49],
            note: {
              en: (
                <>
                  <b>The limit:</b> <code>sys.getrecursionlimit()</code> is about
                  1000 by default, so a chain of 1000 nodes is enough to hit it.
                  The LeetCode Python environment raises the limit for you, but
                  you need to know this when you run code locally and when you
                  answer out loud in an interview.
                </>
              ),
              zh: (
                <>
                  <b>红线:</b>默认 <code>sys.getrecursionlimit()</code> 约为
                  1000,一条 1000 节点的链状树就能撞爆。LeetCode 的 Python
                  环境已经帮你调大了,但本地运行和面试口头回答时必须知道这回事。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

// ---- Three recursive DFS traversals: one route, three visiting times ----
function preorder(node, out) {
  if (node === null) return;   // base case: an empty tree, go straight back
  out.push(node.val);          // the node first -> preorder
  preorder(node.left, out);    // left
  preorder(node.right, out);   // right
}

function inorder(node, out) {
  if (node === null) return;
  inorder(node.left, out);     // left
  out.push(node.val);          // the node in between -> inorder
  inorder(node.right, out);    // right
}

function postorder(node, out) {
  if (node === null) return;
  postorder(node.left, out);   // left
  postorder(node.right, out);  // right
  out.push(node.val);          // the node last -> postorder
}

// ---- Iterative preorder: an explicit stack replaces the call stack ----
function preorderIter(root) {
  const out = [], stack = root ? [root] : [];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.val);
    if (node.right) stack.push(node.right); // push right first
    if (node.left) stack.push(node.left);   // left pushed last pops first
  }
  return out;
}

// ---- Level order (BFS): a queue ----
function levelOrder(root) {
  const res = [];
  if (!root) return res;
  const q = [root];
  let head = 0;                    // an index as the front, to avoid the O(n) shift()
  while (head < q.length) {
    const size = q.length - head;  // record how many nodes this level has
    const level = [];
    for (let i = 0; i < size; i++) {
      const node = q[head++];
      level.push(node.val);
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
    res.push(level);
  }
  return res;
}`,
              zh: `function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

// ---- 递归版三种 DFS:同一条路线,只差访问时机 ----
function preorder(node, out) {
  if (node === null) return;   // 终止条件:空树,直接回头
  out.push(node.val);          // 先访问节点自己 -> 前序
  preorder(node.left, out);    // 左
  preorder(node.right, out);   // 右
}

function inorder(node, out) {
  if (node === null) return;
  inorder(node.left, out);     // 左
  out.push(node.val);          // 在两棵子树之间访问 -> 中序
  inorder(node.right, out);    // 右
}

function postorder(node, out) {
  if (node === null) return;
  postorder(node.left, out);   // 左
  postorder(node.right, out);  // 右
  out.push(node.val);          // 最后才访问节点自己 -> 后序
}

// ---- 迭代版前序:用显式栈代替递归栈 ----
function preorderIter(root) {
  const out = [], stack = root ? [root] : [];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.val);
    if (node.right) stack.push(node.right); // 先压右孩子
    if (node.left) stack.push(node.left);   // 后压左,左才先弹出
  }
  return out;
}

// ---- 层序遍历(BFS):队列 ----
function levelOrder(root) {
  const res = [];
  if (!root) return res;
  const q = [root];
  let head = 0;                    // 用下标当队首,避开 shift() 的 O(n)
  while (head < q.length) {
    const size = q.length - head;  // 先记住这一层有几个节点
    const level = [];
    for (let i = 0; i < size; i++) {
      const node = q[head++];
      level.push(node.val);
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
    res.push(level);
  }
  return res;
}`,
            },
            hl: [10, 11, 12, 17, 18, 19, 24, 25, 26, 35, 36, 48],
            note: {
              en: (
                <>
                  <b>Stack depth:</b> engine call stacks hold on the order of ten
                  thousand frames, so a deep chain raises{" "}
                  <code>Maximum call stack size exceeded</code> in the same way.
                  For the queue, do not use <code>shift()</code>: it moves every
                  remaining element, which is O(n) (chapter 5). Use a head index
                  or two stacks.
                </>
              ),
              zh: (
                <>
                  <b>栈深:</b>各引擎调用栈约一万层量级,深链状树同样会抛{" "}
                  <code>Maximum call stack size exceeded</code>;队列别用{" "}
                  <code>shift()</code> —— 它要搬动后面所有元素,是 O(n)(第 5
                  章讲过),用头下标或双栈。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "The interview question: recursive or iterative?",
            zh: "面试常问:递归和迭代该选哪个?",
          }}
        >
          <T
            en={
              <p>
                A complete answer: the recursive version reads like the definition
                of the tree, and its cost is a limited stack depth (Python about
                1000 by default; JVM and JS engines a few thousand to a few tens
                of thousands of frames). A very deep or chain-shaped tree needs
                the iterative version, whose depth is limited by heap memory
                instead. Both are O(n) time. Being able to write the iterative
                preorder without hesitating is worth points. If the interviewer
                asks for <b>O(1) extra space</b>, the answer is{" "}
                <b>Morris traversal</b>: it borrows the unused right pointers of
                nodes to remember where to return, so it needs no stack at all. It
                does <b>modify the tree while it runs</b>, and restores every
                pointer it changed before it finishes.
              </p>
            }
            zh={
              <p>
                完整的回答:递归版读起来就是树的定义本身,
                代价是栈深有限(Python 默认约 1000 层,JVM 和 JS
                引擎也各有几千到几万层的红线);极深或链状的树需要迭代版 ——
                它自己管栈,深度只受堆内存限制。两者时间复杂度都是 O(n)。
                能顺手写出迭代前序是加分动作。如果面试官进一步要求
                <b>额外空间 O(1)</b>,答案是 <b>Morris 遍历</b>:
                它借用节点闲置的右指针记住「回来时该去哪」,完全不需要栈。
                代价是它<b>运行期间会修改树</b>,并在结束前把改过的指针全部复原。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §06 三语言对照 ================= */}
      <Section
        id="langs"
        index="06"
        title={{
          en: "Three languages: you always build the tree yourself",
          zh: "三语言对照:树,永远自己动手",
        }}
        desc={{
          en: "None of the three ships a binary tree. Three versions of TreeNode, plus one helper that builds a tree from a LeetCode array.",
          zh: "三种语言都没有内置二叉树 —— TreeNode 三副面孔 + 一个建树辅助函数",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                Arrays and dictionaries come with every language; trees do not.
                The shape of a tree is decided by the problem, so a standard
                library cannot supply a general one. (Java&rsquo;s{" "}
                <code>TreeMap</code> is a red-black tree inside, but it does not
                expose the nodes.) The good news: when you solve problems, the{" "}
                <code>TreeNode</code> class is given to you and you only have to
                read it. For testing on your own machine, the{" "}
                <code>buildTree</code> below turns a LeetCode level-order array
                such as <code>[3,9,20,null,null,15,7]</code> into a real tree:
              </p>
            }
            zh={
              <p>
                数组、字典每个语言都自带,树却没有 ——
                因为树的形状由具体问题决定,标准库给不出通用款(Java 的{" "}
                <code>TreeMap</code> 内部虽是红黑树,但不暴露节点)。好消息:
                刷题时 <code>TreeNode</code> 由题目提供,你只需要会读;
                本地调试时,下面的 <code>buildTree</code> 能把 LeetCode
                的层序数组(例如 <code>[3,9,20,null,null,15,7]</code>)变成一棵真树:
              </p>
            }
          />
        </div>
        <CodeTabs
          title="tree_node_and_builder"
          java={{
            code: {
              en: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;    // still a reference: it stores where the left child is, not the child
    TreeNode right;
    TreeNode(int val) { this.val = val; }
}

class Build {
    // Build from a level-order array; null marks an empty slot, e.g. [3,9,20,null,null,15,7]
    static TreeNode buildTree(Integer[] vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode node = q.poll();       // claim children in level order, one node at a time
            if (vals[i] != null) {
                node.left = new TreeNode(vals[i]);
                q.offer(node.left);
            }
            i++;
            if (i < vals.length && vals[i] != null) {
                node.right = new TreeNode(vals[i]);
                q.offer(node.right);
            }
            i++;
        }
        return root;
    }

    public static void main(String[] args) {
        TreeNode root = Build.buildTree(
            new Integer[]{3, 9, 20, null, null, 15, 7});
        System.out.println(root.right.left.val);  // 15
    }
}`,
              zh: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;    // 还是引用:存的是「左孩子在哪」,不是孩子本身
    TreeNode right;
    TreeNode(int val) { this.val = val; }
}

class Build {
    // 从层序数组构造:null 表示空位,例如 [3,9,20,null,null,15,7]
    static TreeNode buildTree(Integer[] vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode node = q.poll();       // 按层序逐个认领孩子
            if (vals[i] != null) {
                node.left = new TreeNode(vals[i]);
                q.offer(node.left);
            }
            i++;
            if (i < vals.length && vals[i] != null) {
                node.right = new TreeNode(vals[i]);
                q.offer(node.right);
            }
            i++;
        }
        return root;
    }

    public static void main(String[] args) {
        TreeNode root = Build.buildTree(
            new Integer[]{3, 9, 20, null, null, 15, 7});
        System.out.println(root.right.left.val);  // 15
    }
}`,
            },
            note: {
              en: (
                <>
                  <b>Detail:</b> the parameter has to be <code>Integer[]</code>,
                  not <code>int[]</code>. A primitive type cannot hold null, and
                  null is exactly what marks an empty slot.
                </>
              ),
              zh: (
                <>
                  <b>细节:</b>参数类型得用 <code>Integer[]</code> 而不是{" "}
                  <code>int[]</code> —— 原始类型装不下 null,而「空位」恰恰要靠
                  null 表达。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left     # still a reference: it stores where the left child is
        self.right = right

# Build from a level-order array; None marks an empty slot, e.g. [3,9,20,None,None,15,7]
def build_tree(vals):
    if not vals or vals[0] is None:
        return None
    root = TreeNode(vals[0])
    q = deque([root])
    i = 1
    while q and i < len(vals):
        node = q.popleft()          # claim children in level order, one node at a time
        if vals[i] is not None:
            node.left = TreeNode(vals[i])
            q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            q.append(node.right)
        i += 1
    return root

root = build_tree([3, 9, 20, None, None, 15, 7])
print(root.right.left.val)  # 15`,
              zh: `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left     # 还是引用:存的是「左孩子在哪」
        self.right = right

# 从层序数组构造:None 表示空位,例如 [3,9,20,None,None,15,7]
def build_tree(vals):
    if not vals or vals[0] is None:
        return None
    root = TreeNode(vals[0])
    q = deque([root])
    i = 1
    while q and i < len(vals):
        node = q.popleft()          # 按层序逐个认领孩子
        if vals[i] is not None:
            node.left = TreeNode(vals[i])
            q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            q.append(node.right)
        i += 1
    return root

root = build_tree([3, 9, 20, None, None, 15, 7])
print(root.right.left.val)  # 15`,
            },
            note: {
              en: (
                <>
                  <b>Detail:</b> test an empty slot with <code>is None</code>, not{" "}
                  <code>not vals[i]</code>. The second form also treats the
                  perfectly legal node value 0 as empty, and that is a real source
                  of wrong answers.
                </>
              ),
              zh: (
                <>
                  <b>细节:</b>判断空位要用 <code>is None</code> 而不是{" "}
                  <code>not vals[i]</code> —— 后者会把合法的节点值 0 也当成空位,
                  这是真实的刷题事故高发区。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;    // still a reference: it stores where the left child is
    this.right = right;
  }
}

// Build from a level-order array; null marks an empty slot, e.g. [3,9,20,null,null,15,7]
function buildTree(vals) {
  if (vals.length === 0 || vals[0] === null) return null;
  const root = new TreeNode(vals[0]);
  const q = [root];
  let head = 0;
  let i = 1;
  while (head < q.length && i < vals.length) {
    const node = q[head++];         // claim children in level order, one node at a time
    if (vals[i] !== null) {
      node.left = new TreeNode(vals[i]);
      q.push(node.left);
    }
    i++;
    if (i < vals.length && vals[i] !== null) {
      node.right = new TreeNode(vals[i]);
      q.push(node.right);
    }
    i++;
  }
  return root;
}

const root = buildTree([3, 9, 20, null, null, 15, 7]);
console.log(root.right.left.val); // 15`,
              zh: `class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;    // 还是引用:存的是「左孩子在哪」
    this.right = right;
  }
}

// 从层序数组构造:null 表示空位,例如 [3,9,20,null,null,15,7]
function buildTree(vals) {
  if (vals.length === 0 || vals[0] === null) return null;
  const root = new TreeNode(vals[0]);
  const q = [root];
  let head = 0;
  let i = 1;
  while (head < q.length && i < vals.length) {
    const node = q[head++];         // 按层序逐个认领孩子
    if (vals[i] !== null) {
      node.left = new TreeNode(vals[i]);
      q.push(node.left);
    }
    i++;
    if (i < vals.length && vals[i] !== null) {
      node.right = new TreeNode(vals[i]);
      q.push(node.right);
    }
    i++;
  }
  return root;
}

const root = buildTree([3, 9, 20, null, null, 15, 7]);
console.log(root.right.left.val); // 15`,
            },
            note: {
              en: (
                <>
                  <b>Detail:</b> the LeetCode JS template uses the constructor
                  function style, <code>function TreeNode(val, left, right)</code>
                  . The class form above is fully compatible with it. You should
                  recognize both.
                </>
              ),
              zh: (
                <>
                  <b>细节:</b>LeetCode 的 JS 模板用的是构造函数写法{" "}
                  <code>function TreeNode(val, left, right)</code>,
                  上面的 class 写法与它完全兼容 —— 两种都要认识。
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
                  <T en="Topic" zh="关注点" />
                </th>
                <th>Java</th>
                <th>Python</th>
                <th>JavaScript</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <T en="Node definition" zh="节点定义" />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <code>class TreeNode</code> with fields and a constructor
                      </>
                    }
                    zh={
                      <>
                        <code>class TreeNode</code>(字段 + 构造器)
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <code>class TreeNode</code> with default arguments in{" "}
                        <code>__init__</code>
                      </>
                    }
                    zh={
                      <>
                        <code>class TreeNode</code>(<code>__init__</code>{" "}
                        带默认参数)
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <code>class</code> or a constructor function, both work
                      </>
                    }
                    zh={
                      <>
                        <code>class</code> 或构造函数,两种都行
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Empty tree / missing child" zh="空树 / 空孩子" />
                </td>
                <td>
                  <code>null</code>
                </td>
                <td>
                  <T
                    en={
                      <>
                        <code>None</code> (test with <code>is None</code>)
                      </>
                    }
                    zh={
                      <>
                        <code>None</code>(判断用 <code>is None</code>)
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <code>null</code> (test with <code>===</code>)
                      </>
                    }
                    zh={
                      <>
                        <code>null</code>(判断用 <code>===</code>)
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Queue for level order" zh="层序用的队列" />
                </td>
                <td>
                  <code>ArrayDeque</code> / <code>LinkedList</code>
                </td>
                <td>
                  <code>collections.deque</code>
                </td>
                <td>
                  <T
                    en="An array plus a head index (do not use shift)"
                    zh="数组 + 头下标(别用 shift)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Recursion depth limit" zh="递归深度红线" />
                </td>
                <td>
                  <T
                    en={
                      <>
                        Thread stack 512 KB to 1 MB (tunable with{" "}
                        <code>-Xss</code>)
                      </>
                    }
                    zh={
                      <>
                        线程栈 512KB~1MB(<code>-Xss</code> 可调)
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        About 1000 by default (
                        <code>sys.setrecursionlimit</code>)
                      </>
                    }
                    zh={
                      <>
                        默认约 1000(<code>sys.setrecursionlimit</code> 可调)
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en="Engine dependent, on the order of ten thousand frames"
                    zh="引擎相关,约一万层量级"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ================= §07 套路与精讲 ================= */}
      <Section
        id="patterns"
        index="07"
        title={{
          en: "The plan for tree problems: this node, plus the two answers below it",
          zh: "树题总纲:根怎么办 + 左答案 + 右答案",
        }}
        desc={{
          en: "Two recursive styles cover almost everything. Four problems, frame by frame.",
          zh: "两种递归做法打天下 —— 四道代表题,逐帧拆解",
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
                Tree problems vary a lot, but the skeleton is one sentence:{" "}
                <strong>
                  the answer for a tree = what this node contributes + the answer
                  for the left subtree + the answer for the right subtree
                </strong>
                . So the first question is always the same: if the answers for the
                two subtrees were already in my hand, how would I build the answer
                for the whole tree? Once you can state that combination, add the
                base case and the code is finished. What differs between problems
                is the <strong>direction the information travels</strong>, and
                that gives two styles:
              </p>
            }
            zh={
              <p>
                树的题目千变万化,骨架却只有一句话:
                <strong>
                  一棵树的答案 = 当前节点贡献什么 + 左子树的答案 + 右子树的答案
                </strong>
                。所以拿到题先问同一个问题:「如果左右子树的答案已经在我手上,
                我该怎么拼出整棵树的答案?」拼法说得出来,再加上终止条件,
                代码就写完了。题与题之间真正不同的是
                <strong>信息往哪个方向流</strong>,这决定了两种做法:
              </p>
            }
          />
        </div>
        <div className="grid-2">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="STYLE 01" zh="做法一" />
            </div>
            <div className="card-title">
              <T
                en="⬇️ Top-down: state in the parameter"
                zh="⬇️ 自顶向下(参数下传)"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    Information flows from the root toward the leaves. Whatever
                    the ancestors already established — the current depth, the
                    remaining sum, the path so far — is carried down in a{" "}
                    <b>parameter</b>. The work happens at the{" "}
                    <b>preorder position</b>, on the way in, and the result is
                    decided at a leaf. See LC 112, 257, 129.
                  </>
                }
                zh={
                  <>
                    信息从根流向叶:把「一路走来的状态」(当前深度、还差多少和、
                    走过的路径)装进<b>参数</b>带下去,在<b>前序位置</b>
                    (进入节点时)干活,到叶子时结算。参见 LC 112、257、129。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="STYLE 02" zh="做法二" />
            </div>
            <div className="card-title">
              <T
                en="⬆️ Bottom-up: answer in the return value"
                zh="⬆️ 自底向上(返回值上传)"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    Information flows from the leaves toward the root. The two
                    recursive calls return first, and this node combines their{" "}
                    <b>return values</b> into its own answer at the{" "}
                    <b>postorder position</b>, on the way out: height, node count,
                    diameter. See LC 104, 110, 543, 124, 236.
                  </>
                }
                zh={
                  <>
                    信息从叶流向根:先让两次递归调用返回,再在<b>后序位置</b>
                    (离开节点前)用它们的<b>返回值</b>拼出自己的答案上报 ——
                    高度、节点数、直径。参见 LC 104、110、543、124、236。
                  </>
                }
              />
            </p>
          </div>
        </div>
        <div className="prose" style={{ marginTop: 14 }}>
          <T
            en={
              <>
                <p>
                  How to choose: if the answer depends on{" "}
                  <strong>the ancestors</strong> (how deep am I? what is the sum
                  so far?), pass state down. If it depends on{" "}
                  <strong>the descendants</strong> (how tall is the subtree below?
                  how many nodes?), collect return values on the way up. When you
                  are not sure, try bottom-up first; most tree problems have that
                  shape.
                </p>
                <p>
                  One warning about the bottom-up style: the value the function
                  returns is <strong>not always the answer you want</strong>. The
                  classic case is the diameter (LC 543 in the problem set): the
                  function returns a <i>height</i>, because that is what the
                  parent needs, while the diameter is tracked in a separate
                  variable that every node challenges as it finishes. Whenever a
                  problem asks for something that can bend at a node, expect these
                  two to differ, and state both explicitly before writing code.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  怎么选:答案依赖<strong>祖先信息</strong>
                  (我在第几层?一路的和是多少?)→ 参数往下传;答案依赖
                  <strong>子孙信息</strong>(下面有多高?有几个节点?)→
                  返回值往上收。分不清时先试自底向上 —— 树题多数是这个形状。
                </p>
                <p>
                  关于自底向上有一个提醒:函数的返回值
                  <strong>不一定就是你要的答案</strong>。最经典的是直径(题单 LC
                  543):函数返回的是<i>高度</i>,因为那是父节点需要的东西;
                  而直径存在递归之外的一个变量里,每个节点算完时去挑战它一次。
                  只要题目问的东西可以「在某个节点拐弯」,就要预料到这两者不同 ——
                  动手写之前先把两句话都说清楚。
                </p>
              </>
            }
          />
        </div>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough A" zh="精讲 A" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 104 · Maximum Depth of Binary Tree"
              zh="LC 104 · 二叉树的最大深度"
            />
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
              <>
                <p>
                  <b>The problem:</b> return the maximum depth of the tree.{" "}
                  <b>Read the convention first:</b> LeetCode counts{" "}
                  <b>nodes</b> on the longest path from the root down to a leaf,
                  so a single node has maximum depth 1 and the empty tree has 0.
                  That is one more than the edge-counting depth defined in §01,
                  where the root has depth 0. Both conventions are common; always
                  say which one you mean.
                </p>
                <p>
                  <b>The promise:</b> maxDepth(node) returns the number of nodes
                  on the longest path from node down to a leaf.{" "}
                  <b>The base case:</b> maxDepth(null) = 0.{" "}
                  <b>The combination:</b> 1 + max(left answer, right answer) — the
                  node itself adds one level, and only the deeper side can decide
                  the longest path. Three questions answered, so the function is
                  written. This is the first bottom-up problem in the chapter:
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <b>题意:</b>求这棵树的最大深度。<b>先看清约定:</b>LeetCode
                  数的是从根到最远叶子这条路径上的<b>节点数</b>,
                  所以单个节点的最大深度是 1,空树是 0 —— 这比 §01
                  定义的「数边」深度大 1(那里根的深度是 0)。
                  两种约定都很常见,说的时候务必讲清用的是哪一种。
                </p>
                <p>
                  <b>函数的承诺:</b>maxDepth(node) 返回「从 node
                  往下到叶子的最长路径上有几个节点」。<b>终止条件:</b>
                  maxDepth(null) = 0。<b>合并这一步:</b>1 + max(左边的答案,
                  右边的答案)—— 节点自己占一层,而最长路径只可能由更深的那一侧决定。
                  三个问题都答完了,函数也就写完了。这是本章第一道自底向上的题:
                </p>
              </>
            }
          />
        </div>
        <DepthLab />
        <CodeTabs
          title="lc104_max_depth"
          java={{
            code: {
              en: `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;          // base case: an empty tree has depth 0
        int left = maxDepth(root.left);      // the answer of the left subtree
        int right = maxDepth(root.right);    // the answer of the right subtree
        return 1 + Math.max(left, right);    // this node adds one level
    }
}`,
              zh: `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;          // 终止条件:空树,深度 0
        int left = maxDepth(root.left);      // 左子树的答案
        int right = maxDepth(root.right);    // 右子树的答案
        return 1 + Math.max(left, right);    // 根自己占一层,拼装
    }
}`,
            },
            hl: [3, 4, 5, 6],
          }}
          python={{
            code: {
              en: `class Solution:
    def maxDepth(self, root) -> int:
        if root is None:                   # base case: an empty tree has depth 0
            return 0
        left = self.maxDepth(root.left)    # the answer of the left subtree
        right = self.maxDepth(root.right)  # the answer of the right subtree
        return 1 + max(left, right)        # this node adds one level`,
              zh: `class Solution:
    def maxDepth(self, root) -> int:
        if root is None:                   # 终止条件:空树,深度 0
            return 0
        left = self.maxDepth(root.left)    # 左子树的答案
        right = self.maxDepth(root.right)  # 右子树的答案
        return 1 + max(left, right)        # 根自己占一层,拼装`,
            },
            hl: [3, 4, 5, 6, 7],
          }}
          js={{
            code: {
              en: `var maxDepth = function (root) {
  if (root === null) return 0;          // base case: an empty tree has depth 0
  const left = maxDepth(root.left);     // the answer of the left subtree
  const right = maxDepth(root.right);   // the answer of the right subtree
  return 1 + Math.max(left, right);     // this node adds one level
};`,
              zh: `var maxDepth = function (root) {
  if (root === null) return 0;          // 终止条件:空树,深度 0
  const left = maxDepth(root.left);     // 左子树的答案
  const right = maxDepth(root.right);   // 右子树的答案
  return 1 + Math.max(left, right);     // 根自己占一层,拼装
};`,
            },
            hl: [2, 3, 4, 5],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-ups",
            zh: "复杂度与追问",
          }}
        >
          <T
            en={
              <p>
                Every node is visited once, so the time is <b>O(n)</b>. The call
                stack is as deep as the tree, so the extra space is <b>O(h)</b>:
                about log n when the tree is balanced, and n when it is a chain.
                Follow-up one: &ldquo;do it with BFS.&rdquo; Traverse level by
                level and count the levels; the number of levels is the depth.
                Follow-up two: &ldquo;what about the minimum depth?&rdquo; Watch
                the leaf trap (LC 111 in the problem set): a node with only one
                child is not a leaf, so the empty side must not contribute its 0.
              </p>
            }
            zh={
              <p>
                每个节点访问一次,时间 <b>O(n)</b>;递归栈最深等于树高,额外空间{" "}
                <b>O(h)</b> —— 平衡时约 log n,退化成链时是 n。追问一:
                「用 BFS 怎么求?」层序遍历数层数,有几层深度就是几。追问二:
                「最小深度呢?」小心叶子陷阱(题单 LC 111):
                只有一个孩子的节点不是叶子,空的那一侧不能把它的 0 算进来。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough B" zh="精讲 B" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 226 · Invert Binary Tree" zh="LC 226 · 翻转二叉树" />
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
                <b>The problem:</b> mirror the whole tree from left to right.{" "}
                <b>The promise:</b> invertTree(node) returns the same subtree,
                mirrored. <b>The base case:</b> an empty tree returns null.{" "}
                <b>The combination:</b> swap the two child references of this
                node, and let the recursion mirror each subtree. What the swap
                writes is <strong>two references</strong> (§02), so one assignment
                moves a whole subtree; the ordering inside each subtree is the
                job of the recursion. Swapping before or after the two recursive
                calls produces the same tree:
              </p>
            }
            zh={
              <p>
                <b>题意:</b>把整棵树左右镜像。<b>函数的承诺:</b>invertTree(node)
                返回「同一棵子树,但已经镜像好了」。<b>终止条件:</b>
                空树返回 null。<b>合并这一步:</b>
                交换当前节点的两个孩子引用,再让递归去镜像两棵子树。
                交换写入的只是<strong>两根引用</strong>(§02),
                一次赋值就带动整棵子树;子树内部的顺序交给递归。
                交换写在两次递归调用之前还是之后,结果都一样:
              </p>
            }
          />
        </div>
        <InvertLab />
        <CodeTabs
          title="lc226_invert_tree"
          java={{
            code: {
              en: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;       // an empty tree: nothing to mirror
        TreeNode t = root.left;              // keep the old left reference
        root.left = invertTree(root.right);  // the mirrored right subtree goes left
        root.right = invertTree(t);          // the mirrored left subtree goes right
        return root;
    }
}`,
              zh: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;       // 空树:没什么可翻
        TreeNode t = root.left;              // 先存住原来的左孩子引用
        root.left = invertTree(root.right);  // 右子树镜像好后挂到左边
        root.right = invertTree(t);          // 左子树镜像好后挂到右边
        return root;
    }
}`,
            },
            hl: [3, 4, 5, 6],
          }}
          python={{
            code: {
              en: `class Solution:
    def invertTree(self, root):
        if root is None:                  # an empty tree: nothing to mirror
            return None
        root.left, root.right = (         # both references are written at once
            self.invertTree(root.right),  # the mirrored right subtree goes left
            self.invertTree(root.left),   # the mirrored left subtree goes right
        )
        return root`,
              zh: `class Solution:
    def invertTree(self, root):
        if root is None:                  # 空树:没什么可翻
            return None
        root.left, root.right = (         # 一次写入两根引用
            self.invertTree(root.right),  # 右子树镜像好后挂到左边
            self.invertTree(root.left),   # 左子树镜像好后挂到右边
        )
        return root`,
            },
            hl: [3, 4, 5, 6, 7, 8],
          }}
          js={{
            code: {
              en: `var invertTree = function (root) {
  if (root === null) return null;       // an empty tree: nothing to mirror
  const t = root.left;                   // keep the old left reference
  root.left = invertTree(root.right);    // the mirrored right subtree goes left
  root.right = invertTree(t);            // the mirrored left subtree goes right
  return root;
};`,
              zh: `var invertTree = function (root) {
  if (root === null) return null;       // 空树:没什么可翻
  const t = root.left;                   // 先存住原来的左孩子引用
  root.left = invertTree(root.right);    // 右子树镜像好后挂到左边
  root.right = invertTree(t);            // 左子树镜像好后挂到右边
  return root;
};`,
            },
            hl: [2, 3, 4, 5],
          }}
        />
        <Callout
          tone="story"
          title={{
            en: "A well-known interview story",
            zh: "一则广为流传的面试轶事",
          }}
        >
          <T
            en={
              <p>
                Max Howell, the author of Homebrew, the package manager most Mac
                developers use, was turned down by Google and posted about it. He
                said the company told him that although the large majority of
                their engineers use his software, he could not invert a binary
                tree on a whiteboard. That post is why LC 226 became the most
                famous Easy problem on the site. You can write it now, and you can
                also say that it costs O(n) time and O(h) space, and that what
                gets swapped is references rather than values.
              </p>
            }
            zh={
              <p>
                Mac 开发者人手一个的包管理器 Homebrew,其作者 Max Howell
                当年面试谷歌被拒后发了条推特自嘲:谷歌说,
                虽然他们绝大多数工程师都在用他写的软件,
                但他在白板上翻转不出一棵二叉树。这条推特让 LC 226
                成了全站最有名的 Easy 题。现在你会写了 ——
                而且还能说出它是 O(n) 时间、O(h) 空间,交换的是引用而不是值。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough C" zh="精讲 C" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 101 · Symmetric Tree" zh="LC 101 · 对称二叉树" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">
              EASY+
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>The problem:</b> decide whether a tree is a mirror of itself.{" "}
                <b>The difficulty:</b> being symmetric is not a property of one
                subtree. It is a relation{" "}
                <strong>between the left subtree and the right subtree</strong>,
                and a function of a single node cannot express a relation between
                two. <b>The fix:</b> give the recursion two parameters, check(L,
                R). <b>The promise:</b> check(L, R) returns true when subtree L
                and subtree R are mirror images of each other.{" "}
                <b>The base cases:</b> both null is true; exactly one null is
                false. <b>The combination:</b> the values must be equal, and{" "}
                <strong>L.left must mirror R.right</strong> (the outer pair) and{" "}
                <strong>L.right must mirror R.left</strong> (the inner pair). Two
                pointers walk the two halves in mirrored steps:
              </p>
            }
            zh={
              <p>
                <b>题意:</b>判断一棵树是否轴对称。<b>难点:</b>
                「对称」不是单棵子树的性质,而是
                <strong>左右两棵子树之间</strong>的关系 ——
                单参数的 f(node) 表达不了两者之间的关系。<b>破局:</b>
                把递归升级成双参数 check(L, R)。<b>函数的承诺:</b>check(L, R)
                返回「子树 L 与子树 R 互为镜像」。<b>终止条件:</b>
                两个都空 → true;只有一个空 → false。<b>合并这一步:</b>
                值必须相等,并且<strong>L 的左与 R 的右互为镜像</strong>(外侧)、
                <strong>L 的右与 R 的左互为镜像</strong>(内侧)。
                两个指针在树的两半上镜像同步走:
              </p>
            }
          />
        </div>
        <MirrorLab />
        <CodeTabs
          title="lc101_symmetric"
          java={{
            code: {
              en: `class Solution {
    public boolean isSymmetric(TreeNode root) {
        return root == null || check(root.left, root.right);
    }

    boolean check(TreeNode l, TreeNode r) {
        if (l == null && r == null) return true;   // two empty trees are mirrors
        if (l == null || r == null) return false;  // only one side empty: not a mirror
        return l.val == r.val                      // the values must be equal
            && check(l.left, r.right)              // outer pair
            && check(l.right, r.left);             // inner pair
    }
}`,
              zh: `class Solution {
    public boolean isSymmetric(TreeNode root) {
        return root == null || check(root.left, root.right);
    }

    boolean check(TreeNode l, TreeNode r) {
        if (l == null && r == null) return true;   // 两棵空树互为镜像
        if (l == null || r == null) return false;  // 只有一侧为空:不构成镜像
        return l.val == r.val                      // 值必须相等
            && check(l.left, r.right)              // 外侧一组
            && check(l.right, r.left);             // 内侧一组
    }
}`,
            },
            hl: [7, 8, 9, 10, 11],
          }}
          python={{
            code: {
              en: `class Solution:
    def isSymmetric(self, root) -> bool:
        def check(l, r):
            if l is None and r is None:   # two empty trees are mirrors
                return True
            if l is None or r is None:    # only one side empty: not a mirror
                return False
            return (l.val == r.val                # the values must be equal
                    and check(l.left, r.right)    # outer pair
                    and check(l.right, r.left))   # inner pair
        return root is None or check(root.left, root.right)`,
              zh: `class Solution:
    def isSymmetric(self, root) -> bool:
        def check(l, r):
            if l is None and r is None:   # 两棵空树互为镜像
                return True
            if l is None or r is None:    # 只有一侧为空:不构成镜像
                return False
            return (l.val == r.val                # 值必须相等
                    and check(l.left, r.right)    # 外侧一组
                    and check(l.right, r.left))   # 内侧一组
        return root is None or check(root.left, root.right)`,
            },
            hl: [4, 5, 6, 7, 8, 9, 10],
          }}
          js={{
            code: {
              en: `var isSymmetric = function (root) {
  const check = (l, r) => {
    if (l === null && r === null) return true;  // two empty trees are mirrors
    if (l === null || r === null) return false; // only one side empty: not a mirror
    return (
      l.val === r.val &&          // the values must be equal
      check(l.left, r.right) &&   // outer pair
      check(l.right, r.left)      // inner pair
    );
  };
  return root === null || check(root.left, root.right);
};`,
              zh: `var isSymmetric = function (root) {
  const check = (l, r) => {
    if (l === null && r === null) return true;  // 两棵空树互为镜像
    if (l === null || r === null) return false; // 只有一侧为空:不构成镜像
    return (
      l.val === r.val &&          // 值必须相等
      check(l.left, r.right) &&   // 外侧一组
      check(l.right, r.left)      // 内侧一组
    );
  };
  return root === null || check(root.left, root.right);
};`,
            },
            hl: [3, 4, 6, 7, 8],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-ups",
            zh: "复杂度与追问",
          }}
        >
          <T
            en={
              <p>
                O(n) time and O(h) stack space. The transferable idea:{" "}
                <b>a recursive function does not have to take a single node</b>.
                Walking two trees at once is what LC 100 (same tree), this
                problem, and LC 572 (subtree of another tree) all rely on.
                Follow-up: &ldquo;write it iteratively.&rdquo; Put the pairs (L,
                R) that should be compared into the container in pairs, and take
                out one pair per round. A stack or a queue both work; keeping the
                two nodes together is the part that matters.
              </p>
            }
            zh={
              <p>
                时间 O(n),栈空间 O(h)。这题真正可迁移的技巧是:
                <b>递归函数的参数不必只有一个节点</b>。双树同步递归正是 LC 100
                (相同的树)、本题、LC 572(另一棵树的子树)共同的骨架。追问:
                「迭代怎么写?」把该成对比较的 (L, R) 成对放进容器,
                每轮取出一对 —— 用栈还是队列都行,关键是两个节点必须成对。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 D —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough D" zh="精讲 D" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 102 · Binary Tree Level Order Traversal"
              zh="LC 102 · 二叉树的层序遍历"
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
                <b>The problem:</b> return the values level by level, one array
                per level (<code>[[3],[9,20],[15,7]]</code>).{" "}
                <b>What we already know:</b> a queue hands out the nodes in level
                order, but as one flat sequence. Where is the{" "}
                <strong>boundary</strong> between levels? <b>The step that
                answers it:</b> at the moment a level begins, the queue holds
                exactly the nodes of that level and nothing else. So{" "}
                <strong>record size = queue length first, and dequeue exactly
                that many nodes this round</strong>. The children enqueued during
                the round line up behind them and belong to the next level.
                Without the recorded size the loop cannot tell where the level
                ends, because the queue keeps growing while you read it:
              </p>
            }
            zh={
              <p>
                <b>题意:</b>按层返回节点值,每层一个数组(
                <code>[[3],[9,20],[15,7]]</code>)。<b>已知:</b>
                队列能按层的顺序把节点吐出来,但吐出来是一维的 ——
                层与层的<strong>边界</strong>在哪?<b>回答这个问题的一步:</b>
                每一层开始的那一刻,队列里装着的恰好是这一层的全部节点,不多不少。
                所以<strong>先记下 size = 当前队列长度,本轮只出队这么多个</strong>
                ;这一轮期间入队的孩子排在它们后面,自然属于下一层。
                没有这一步,循环就分不清层的边界 —— 因为你读队列的同时它还在变长:
              </p>
            }
          />
        </div>
        <LevelLab />
        <CodeTabs
          title="lc102_level_order"
          java={{
            code: {
              en: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();              // record size: this fixes the level boundary
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {  // dequeue exactly size nodes
                TreeNode node = q.poll();
                level.add(node.val);
                if (node.left != null) q.offer(node.left);
                if (node.right != null) q.offer(node.right);
            }
            res.add(level);
        }
        return res;
    }
}`,
              zh: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();              // 先记 size:锁定本层边界
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {  // 本轮只出队 size 个
                TreeNode node = q.poll();
                level.add(node.val);
                if (node.left != null) q.offer(node.left);
                if (node.right != null) q.offer(node.right);
            }
            res.add(level);
        }
        return res;
    }
}`,
            },
            hl: [8, 10],
          }}
          python={{
            code: {
              en: `from collections import deque

class Solution:
    def levelOrder(self, root) -> list[list[int]]:
        res = []
        if root is None:
            return res
        q = deque([root])
        while q:
            size = len(q)             # record size: this fixes the level boundary
            level = []
            for _ in range(size):     # dequeue exactly size nodes
                node = q.popleft()
                level.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(level)
        return res`,
              zh: `from collections import deque

class Solution:
    def levelOrder(self, root) -> list[list[int]]:
        res = []
        if root is None:
            return res
        q = deque([root])
        while q:
            size = len(q)             # 先记 size:锁定本层边界
            level = []
            for _ in range(size):     # 本轮只出队 size 个
                node = q.popleft()
                level.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(level)
        return res`,
            },
            hl: [10, 12],
          }}
          js={{
            code: {
              en: `var levelOrder = function (root) {
  const res = [];
  if (!root) return res;
  const q = [root];
  let head = 0;                       // an index as the front (shift is O(n))
  while (head < q.length) {
    const size = q.length - head;     // record size: this fixes the level boundary
    const level = [];
    for (let i = 0; i < size; i++) {  // dequeue exactly size nodes
      const node = q[head++];
      level.push(node.val);
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
    res.push(level);
  }
  return res;
};`,
              zh: `var levelOrder = function (root) {
  const res = [];
  if (!root) return res;
  const q = [root];
  let head = 0;                       // 用下标当队首(shift 是 O(n))
  while (head < q.length) {
    const size = q.length - head;     // 先记 size:锁定本层边界
    const level = [];
    for (let i = 0; i < size; i++) {  // 本轮只出队 size 个
      const node = q[head++];
      level.push(node.val);
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
    res.push(level);
  }
  return res;
};`,
            },
            hl: [7, 9],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity, and how far this one line reaches",
            zh: "复杂度,以及这一行的辐射范围",
          }}
        >
          <T
            en={
              <p>
                O(n) time; the queue holds at most one level, so O(w) space.
                Recording the size first is the step behind zigzag level order (LC
                103, reverse every other level), the right side view (LC 199, keep
                the last node of each level), the largest value on each level (LC
                515), and the minimum depth (LC 111, return as soon as a leaf is
                dequeued). Each one is this template with two lines changed. Once
                you have this problem, BFS on trees is complete.
              </p>
            }
            zh={
              <p>
                时间 O(n);队列里最多装一层,空间 O(w)。「先记 size」这一步撑起了:
                锯齿形层序(LC 103,隔层反转)、右视图(LC 199,取每层最后一个)、
                每层最大值(LC 515)、最小深度(LC 111,出队遇到叶子立刻返回)——
                每一道都是这个模板改两行。树上的 BFS,学到这一题就完整了。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §08 题单 ================= */}
      <Section
        id="problems"
        index="08"
        title={{
          en: "Problem set: 11 binary tree problems",
          zh: "高频题单:二叉树 11 题",
        }}
        desc={{
          en: "Easy to hard: two-tree recursion, the two styles, BFS, construction, ancestors, ending with LC 124.",
          zh: "由易到难:双树递归 → 两种做法 → BFS → 构造 → 祖先,压轴 124",
        }}
        badge={
          <span className="chip">
            <T en="Hot 100 selection" zh="Hot 100 精选" />
          </span>
        }
      >
        <ProblemSet ch="binary-tree" items={PROBLEMS} />
      </Section>

      {/* ================= §09 Quiz ================= */}
      <Section
        id="quiz"
        index="09"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Eight questions. Get them all right to light up this chapter.",
          zh: "8 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="binary-tree" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                The sentence the chapter rests on:{" "}
                <b>
                  a tree is either empty, or a root plus a left subtree and a
                  right subtree
                </b>
                . The structure is defined recursively, so the code that handles
                it is recursive too.
              </>
            ),
            zh: (
              <>
                整章的钥匙:
                <b>一棵树要么是空的,要么 = 根 + 左子树 + 右子树</b>。
                结构是递归定义的,处理它的代码自然也是递归的。
              </>
            ),
          },
          {
            en: (
              <>
                Three questions for every recursion: <b>what does it promise to
                return</b>, <b>what is the base case</b> (on a tree, the empty
                tree, on the first line), and{" "}
                <b>how is this answer built from the children answers</b>. Every
                call must be strictly smaller, or the base case is never reached
                and the stack overflows (Python allows about 1000 frames by
                default).
              </>
            ),
            zh: (
              <>
                递归的三个问题:<b>它承诺返回什么</b>、<b>终止条件是什么</b>
                (树上就是空树,写在第一行)、
                <b>怎么用孩子的答案拼出我的答案</b>。
                每次调用的规模必须严格变小,否则永远走不到终止条件,栈就会溢出
                (Python 默认只允许约 1000 层)。
              </>
            ),
          },
          {
            en: (
              <>
                Preorder, inorder, and postorder are the <b>same DFS route</b>;
                the name says only when the node itself is visited. Level order is
                BFS. All four are O(n) time. DFS uses O(h) stack space, which is
                log n only when the tree is balanced and n when it is a chain; BFS
                uses O(w) queue space.
              </>
            ),
            zh: (
              <>
                前 / 中 / 后序是<b>同一条 DFS 路线</b>
                ,名字只说明节点自己什么时候被访问;层序是 BFS。四者时间都是
                O(n)。DFS 吃 O(h) 栈空间 —— 只有平衡时 h 才是 log n,
                退化成链时是 n;BFS 吃 O(w) 队列空间。
              </>
            ),
          },
          {
            en: (
              <>
                Two styles: <b>top-down</b> carries ancestor information down in a
                parameter (path sum, depth); <b>bottom-up</b> carries subtree
                information up in a return value (height, diameter). Choose by
                asking whether the answer depends on ancestors or on descendants.
                And remember that the returned value is not always the answer: LC
                543 returns a height while the diameter is tracked separately.
              </>
            ),
            zh: (
              <>
                两种做法:<b>自顶向下</b>用参数把祖先信息带下去(路径和、深度);
                <b>自底向上</b>用返回值把子树信息带上来(高度、直径)。
                看答案依赖祖先还是子孙来选。另外记住返回值不一定是答案 ——
                LC 543 返回的是高度,直径另用一个变量收集。
              </>
            ),
          },
          {
            en: (
              <>
                The step that makes BFS work level by level:{" "}
                <b>record the queue size before the inner loop and dequeue
                exactly that many nodes</b>. The right side view, zigzag level
                order, and minimum depth are all variations of it.
              </>
            ),
            zh: (
              <>
                让 BFS 能按层工作的那一步:
                <b>在内层循环之前先记下队列长度,本轮只出队这么多个</b>。
                右视图、锯齿层序、最小深度全是它的变奏。
              </>
            ),
          },
          {
            en: (
              <>
                The three shape names, which do not translate the way you would
                guess: <b>full</b> (真二叉树) means every node has 0 or 2 children;{" "}
                <b>perfect</b> (满二叉树) means every level is filled, so all
                leaves share one depth; <b>complete</b> (完全二叉树) means every
                level is filled except possibly the last, which fills from left to
                right. Only a complete tree maps onto an array with no waste,
                children of index i at 2i+1 and 2i+2 — that is the basis of the
                heap in chapter 09.
              </>
            ),
            zh: (
              <>
                三个形状名词的中英对应不能想当然:<b>真二叉树 full</b> ——
                每个节点要么 0 个孩子要么 2 个;<b>满二叉树 perfect</b> ——
                每层都填满,所有叶子同一深度;<b>完全二叉树 complete</b> ——
                除最后一层外都填满,最后一层从左到右连续。
                只有完全二叉树能不浪费地铺进数组(下标 i 的孩子在 2i+1、2i+2)
                —— 这就是第 9 章堆的地基。
              </>
            ),
          },
          {
            en: (
              <>
                Rebuilding a tree from traversals:{" "}
                <b>preorder + inorder, or postorder + inorder</b> (the first
                identifies the root, the inorder splits left from right).
                Preorder + postorder is not enough, because a node with a single
                child looks the same either way. With n nodes the height ranges
                from ⌊log₂ n⌋ to n−1, and forcing it to stay near the low end is
                the motivation for the next chapter.
              </>
            ),
            zh: (
              <>
                用遍历序列恢复一棵树:
                <b>前序 + 中序,或后序 + 中序</b>
                (前 / 后序定根,中序分左右)。前序 + 后序不行 ——
                只有一个孩子的节点,两种序列长得一样。n 个节点的树高在 ⌊log₂n⌋ 与
                n−1 之间摇摆,如何把它压在低端,正是下一章的全部动机。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="binary-tree" />
    </main>
  );
}
