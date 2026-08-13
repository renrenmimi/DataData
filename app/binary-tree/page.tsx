"use client";

// 第 7 章 · 二叉树 —— 全书篇幅最大的一章,同时承担「递归入门」的职责。
// 结构:为什么(层级天然存在)→ 内存(TreeNode = 引用×2)→
// 递归入门(factorial 调用栈 + count(node) 逐帧)→ 四种遍历(TraverseLab)→
// 手写实现 → 三语言对照 → 两种递归做法 + 四道精讲(104/226/101/102)→
// 题单 11 题 → 测验 8 题。

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
import {
  TermTree,
  FullVsComplete,
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
  { id: "intuition", n: "01", label: "直觉" },
  { id: "memory", n: "02", label: "内存里的样子" },
  { id: "recursion", n: "03", label: "递归入门" },
  { id: "traverse", n: "04", label: "四种遍历" },
  { id: "impl", n: "05", label: "手写实现" },
  { id: "langs", n: "06", label: "三语言对照" },
  { id: "patterns", n: "07", label: "套路与精讲" },
  { id: "problems", n: "08", label: "高频题单" },
  { id: "quiz", n: "09", label: "通关测验" },
];

export default function BinaryTreeChapter() {
  return (
    <main className="page" data-ch="binary-tree">
      <Hero
        ch="binary-tree"
        title={
          <>
            二叉树 <span className="grad">Binary Tree</span>
          </>
        }
        essence={
          <>
            链表学会了<strong>分叉</strong>,就成了树。它是层级世界的原生结构,
            更是<strong>递归</strong>第一次真正发光的地方 ——
            学会「树 = 根 + 左子树 + 右子树」这一句话,后面五章都是它的变奏。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 直觉 ================= */}
      <Section
        id="intuition"
        index="01"
        title="直觉:世界本来就是分层的"
        desc="家谱、文件夹、公司架构 —— 层级不是发明出来的,是长出来的"
      >
        <div className="prose">
          <p>
            到目前为止,我们的数据都排成<strong>一条线</strong>:数组、链表、栈、队列,
            每个元素最多有一个「下一个」。但看看你身边的信息:电脑里的文件夹套着子文件夹、
            公司的 CEO 下面是各部门总监、家谱里一位祖先开枝散叶、这个网页本身
            (HTML 的 DOM)也是标签套标签 —— <strong>层级(hierarchy)</strong>
            无处不在,而一条线画不出层级。
          </p>
          <p>
            怎么升级?回想链表:每个节点一个 <code>next</code> 指向下一站。
            现在允许它<strong>指向不止一个「下一站」</strong> —— 数据结构立刻从
            「一条链」长成「一棵倒挂的树」:最上面是根,往下逐层展开,末端是叶。
            如果每个节点最多分两叉(left 和 right),就是本章的主角
            <strong>二叉树(binary tree)</strong>。为什么偏爱二叉?
            两叉已能表达「二选一」的一切决策(下一章 BST 的灵魂),
            且任意多叉树都能改写成二叉形态 —— 它是树家族的「标准原子」。
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">RULE 01</div>
            <div className="card-title">最多两叉</div>
            <p>
              每个节点至多一个左孩子、一个右孩子,且<b>左右有别</b>
              (只有左孩子 ≠ 只有右孩子)。可以缺,不能多。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 02</div>
            <div className="card-title">单亲,无环</div>
            <p>
              除根外每个节点<b>恰好一个父亲</b>;顺着孩子走永远不会绕回祖先。
              没有这条,「树」会退化成图(第 12 章才对付它)。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 03</div>
            <div className="card-title">子树也是树</div>
            <p>
              从<b>任何</b>节点出发往下看,又是一棵合法的二叉树(它的子树)。
              这一自相似性质是递归的前提 —— 本章将反复利用它。
            </p>
          </div>
        </div>
        <div className="prose" style={{ marginTop: 18 }}>
          <p>
            先把「家谱称呼」认全 —— 后面每道题的题面都在用这些词:
          </p>
        </div>
        <TermTree />
        <div className="prose">
          <p>
            还有两个以「形状」命名的特殊形态,先做初步了解 ——
            右边那个是第 9 章「堆」的地基:
          </p>
        </div>
        <FullVsComplete />
        <Callout tone="story" title="你每天都在爬树">
          <p>
            浏览器渲染页面 = 遍历 DOM 树;<code>ls -R</code> 列目录 = 遍历文件树;
            编译器把你的代码先变成语法树(AST)再翻译;数据库索引是 B+ 树;
            JSON 解析出来就是一棵树。「处理嵌套结构」的地方,树就在那里 ——
            这也是为什么树的遍历是全行业面试的保留节目。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 内存 ================= */}
      <Section
        id="memory"
        index="02"
        title="内存里的样子:一个值,两条出路"
        desc="TreeNode = val + left + right —— 依然是引用,依然是「寻宝游戏」"
      >
        <div className="prose">
          <p>
            树的节点和链表节点是近亲。链表的 <code>ListNode</code> 里装着
            <code>val</code> 和一个 <code>next</code> 引用(序章 §03:引用 =
            「下一站在哪」的地址纸条);<code>TreeNode</code> 只是把纸条换成了
            <strong>两张</strong>:
          </p>
        </div>
        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="card-kicker">第 3 章</div>
            <div className="card-title">ListNode:一条出路</div>
            <p className="mono" style={{ fontSize: 14, textAlign: "center", margin: "14px 0" }}>
              [ val | next → ]
            </p>
            <p>
              只能往一个方向走,结构注定是一条线。节点散落在堆内存的任意角落,
              靠 next 串起来。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">本章</div>
            <div className="card-title">TreeNode:两条出路</div>
            <p className="mono" style={{ fontSize: 14, textAlign: "center", margin: "14px 0" }}>
              [ ← left | val | right → ]
            </p>
            <p>
              每一步都面临「往左还是往右」。节点同样散落在堆里,
              树形只存在于引用的指向关系中 —— 内存里并没有一棵「画出来的树」。
            </p>
          </div>
        </div>
        <Callout tone="idea" title="整章的钥匙:树的递归定义">
          <p>
            <b>一棵二叉树,要么是空的,要么 = 一个根节点 + 一棵左子树 + 一棵右子树
            (而左右子树,又各自是一棵二叉树)。</b>
            注意「空也是树」—— 它不是特例,而是递归的地基:任何叶子的左右孩子都是空树,
            所以「空树怎么办」永远是递归的第一行代码。把这句话读三遍,
            本章剩下的一切都是它的翻译。
          </p>
        </Callout>
        <div className="prose">
          <p>
            一个有用的冷知识:n 个节点的二叉树,一共有 2n 条「孩子插槽」,
            其中只用了 n−1 条(除根外每人插一次),剩下 <strong>n+1 个是
            null</strong>。null 比节点还多 —— 这就是为什么递归的终止条件
            (空树)会被走到那么多次,也解释了为什么它绝对不能省。
          </p>
        </div>
      </Section>

      {/* ================= §03 递归入门 ================= */}
      <Section
        id="recursion"
        index="03"
        title="递归:会自己调用自己的函数"
        desc="树的形状是递归的,处理它的代码自然也是 —— 这里是全书递归第一课"
        badge={<span className="chip" data-tone="warn">★ 零基础重点</span>}
      >
        <div className="prose">
          <p>
            先离开树,从最小的例子热身。阶乘的定义:n! = n × (n−1)!,而 1! = 1。
            注意这个定义<strong>用阶乘解释了阶乘</strong> —— 数学里这叫递归定义,
            代码里就是一个<strong>调用自己的函数</strong>:
          </p>
        </div>
        <CodeTabs
          title="factorial"
          java={{
            code: `class Recursion {
    // n! = n × (n-1)!,而 1! = 1 —— 定义本身就是递归的
    static int factorial(int n) {
        if (n == 1) return 1;          // ① 终止条件:最小的、直接会答的问题
        return n * factorial(n - 1);   // ② 递归调用:把 n-1 的情况托付出去
    }

    public static void main(String[] args) {
        System.out.println(factorial(3)); // 6
    }
}`,
            hl: [4, 5],
          }}
          python={{
            code: `def factorial(n):
    if n == 1:                   # ① 终止条件:最小的、直接会答的问题
        return 1
    return n * factorial(n - 1)  # ② 递归调用:把 n-1 的情况托付出去

print(factorial(3))  # 6`,
            hl: [2, 3, 4],
          }}
          js={{
            code: `function factorial(n) {
  if (n === 1) return 1;         // ① 终止条件:最小的、直接会答的问题
  return n * factorial(n - 1);   // ② 递归调用:把 n-1 的情况托付出去
}

console.log(factorial(3)); // 6`,
            hl: [2, 3],
          }}
        />
        <div className="prose">
          <p>
            「函数还没执行完,又调用了自己 —— 电脑不会晕吗?」不会,
            因为有<strong>调用栈</strong>(第 4 章的 CallStack 又见面了):
            每次调用压一个新栈帧,各帧独立保存自己的参数和进度。
            眼见为实,逐帧看 factorial(3) 的一生:
          </p>
        </div>
        <FactorialLab />
        <div className="prose" style={{ marginTop: 18 }}>
          <p>写任何递归,永远只需要想清楚三件事:</p>
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">要素一</div>
            <div className="card-title">终止条件</div>
            <p>
              最小的、不用递归就能直接回答的情况。阶乘是 n=1,树几乎永远是
              <b>空树</b>(node == null)。它必须写在第一行。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">要素二</div>
            <div className="card-title">递归调用</div>
            <p>
              把<b>更小的同类问题</b>交给自己:factorial(n−1)、count(左子树)。
              「更小」是关键 —— 每次调用必须向终止条件逼近,否则停不下来。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">要素三</div>
            <div className="card-title">信任递归</div>
            <p>
              <b>假设递归调用已经返回了正确答案</b>,只管怎么用它拼出当前答案
              (数学归纳法的归纳假设)。别在脑子里追着展开 —— 会晕,而且没必要。
            </p>
          </div>
        </div>
        <div className="prose" style={{ marginTop: 18 }}>
          <p>
            现在回到树。§02 的钥匙说「树 = 根 + 左子树 + 右子树」,
            那么<strong>数节点</strong>这个问题天然长成递归形状:
            count(树) = 1 + count(左) + count(右),空树 = 0。
            三要素齐备了 —— 看它在一棵 7 节点树上怎么跑(注意右侧调用栈的涨落,
            和每个节点算完时亮出的返回值):
          </p>
        </div>
        <RecurLab />
        <Callout tone="warn" title="最常见的错误:遗漏终止条件">
          <p>
            没有 <code>if (node == null) return 0;</code>,递归就会试图访问{" "}
            <code>null.left</code>(空指针异常),或者在别的写法里无限自我调用、
            栈帧堆到几万层 —— Java/JS 抛 <b>StackOverflowError</b>,Python 抛{" "}
            <b>RecursionError</b>。写递归的肌肉记忆:<b>第一行永远先问「空树怎么办」</b>。
            §05 还会讲各语言的递归深度红线。
          </p>
        </Callout>
        <Callout tone="deep" title="为什么「信任递归」不是自欺欺人">
          <p>
            数学归纳法:证明 n=1 成立(终止条件),再证明「若 n−1 成立则 n 成立」
            (用子问题答案拼当前答案),就证明了对一切 n 成立。递归是同一个逻辑的
            可执行版 —— 只要终止条件对、且每次调用规模严格变小,「信任」就有数学背书。
            新手追踪三层展开就晕,高手压根不展开:<b>只检查这一层的拼装逻辑</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 四种遍历 ================= */}
      <Section
        id="traverse"
        index="04"
        title="四种遍历:把树摊平成一个序列"
        desc="前 / 中 / 后序是同一条路线的三种「报数时机」;层序是另一个世界(BFS)"
        badge={<span className="chip" data-tone="warn">★ 全章核心</span>}
      >
        <div className="prose">
          <p>
            树是二维的,而打印、比较、序列化都需要一维序列 ——
            按某种约定<strong>走遍每个节点</strong>就叫遍历(traversal)。
            深度优先(DFS)的走法只有一条:一头扎到底、再回头。
            但「什么时候输出根」有三个选择,名字就是这么来的:
            <strong>根</strong>在最前 = 前序(根左右),<strong>根</strong>在中间 =
            中序(左根右),<strong>根</strong>在最后 = 后序(左右根)。
            第四种是广度优先(BFS)的<strong>层序</strong>:一层一层、从左到右 ——
            它不走「扎到底」的路线,靠<strong>队列</strong>(第 5 章)排班。
            亲手把四种走法各放一遍:
          </p>
        </div>
        <TraverseLab />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>遍历</th>
                <th>顺序</th>
                <th>典型用途(为什么是它)</th>
                <th>时间</th>
                <th>辅助空间</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>前序</b> preorder</td>
                <td>根 → 左 → 右</td>
                <td>复制/序列化一棵树 —— 先记下根,才知道后面的节点挂在谁下面</td>
                <td><BigO o="n" /></td>
                <td><BigO o="logn" label="O(h) 递归栈" /></td>
              </tr>
              <tr>
                <td><b>中序</b> inorder</td>
                <td>左 → 根 → 右</td>
                <td>对 BST 得到<b>升序序列</b>(下一章的开场白)</td>
                <td><BigO o="n" /></td>
                <td><BigO o="logn" label="O(h) 递归栈" /></td>
              </tr>
              <tr>
                <td><b>后序</b> postorder</td>
                <td>左 → 右 → 根</td>
                <td>「先处理完孩子再处理我」:求高度、删除/释放整棵树、自底向上类题目</td>
                <td><BigO o="n" /></td>
                <td><BigO o="logn" label="O(h) 递归栈" /></td>
              </tr>
              <tr>
                <td><b>层序</b> level-order</td>
                <td>一层层,左到右</td>
                <td>按层输出、求最短(最浅)—— BFS 第一次碰到目标必然是最近的</td>
                <td><BigO o="n" /></td>
                <td><BigO o="n" label="O(w) 队列" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="idea" title="记忆锚点:名字里的「序」说的全是根">
          <p>
            左永远在右前面(约定),变的只有根的位置:pre(前)/ in(中)/ post(后)。
            另一个锚点:<b>DFS 的家当是栈</b>(递归栈或手动栈),深到 O(h);
            <b>BFS 的家当是队列</b>,宽到 O(w)。一棵百万节点的平衡树,h ≈ 20 而
            最宽层 w ≈ 50 万 —— 选错遍历,内存差四个数量级。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 手写实现 ================= */}
      <Section
        id="impl"
        index="05"
        title="手写实现:三种 DFS + 栈迭代 + 队列层序"
        desc="递归版是「定义的直译」;迭代版揭示递归的本质 —— 我们自己管栈"
      >
        <div className="prose">
          <p>
            注意三个递归版本的代码<strong>只有一行的位置不同</strong>
            (输出那行在两次递归调用的前/中/后)——
            因为路线本来就一样。迭代版前序则把「递归栈」搬到明面上:
            用自己的栈替系统管理「待办节点」,右孩子先压(栈是后进先出,
            后压的左孩子才能先被处理):
          </p>
        </div>
        <CodeTabs
          title="traversals"
          java={{
            code: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

class Traversals {
    // ---- 递归版三种 DFS:同一条路线,只差输出时机 ----
    void preorder(TreeNode node, List<Integer> out) {
        if (node == null) return;        // 终止条件:空树,直接回头
        out.add(node.val);               // 根(在前 → 前序)
        preorder(node.left, out);        // 左
        preorder(node.right, out);       // 右
    }

    void inorder(TreeNode node, List<Integer> out) {
        if (node == null) return;
        inorder(node.left, out);         // 左
        out.add(node.val);               // 根(在中 → 中序)
        inorder(node.right, out);        // 右
    }

    void postorder(TreeNode node, List<Integer> out) {
        if (node == null) return;
        postorder(node.left, out);       // 左
        postorder(node.right, out);      // 右
        out.add(node.val);               // 根(在后 → 后序)
    }

    // ---- 迭代版前序:用显式栈模拟递归 ----
    List<Integer> preorderIter(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        Deque<TreeNode> stack = new ArrayDeque<>();
        if (root != null) stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            out.add(node.val);
            if (node.right != null) stack.push(node.right); // 先压右
            if (node.left != null) stack.push(node.left);   // 后压左 → 先弹左
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
            int size = q.size();               // 关键:先记住这层有几个
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
            hl: [12, 13, 14, 15, 20, 21, 22, 27, 28, 29, 41, 42],
            note: (
              <>
                <b>栈深:</b>JVM 默认线程栈约 512KB~1MB,退化成链的百万节点树会
                StackOverflowError —— 深树要么用迭代版,要么{" "}
                <code>-Xss</code> 调大栈。
              </>
            ),
          }}
          python={{
            code: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# ---- 递归版三种 DFS:同一条路线,只差输出时机 ----
def preorder(node, out):
    if node is None:           # 终止条件:空树,直接回头
        return
    out.append(node.val)       # 根(在前 → 前序)
    preorder(node.left, out)   # 左
    preorder(node.right, out)  # 右

def inorder(node, out):
    if node is None:
        return
    inorder(node.left, out)    # 左
    out.append(node.val)       # 根(在中 → 中序)
    inorder(node.right, out)   # 右

def postorder(node, out):
    if node is None:
        return
    postorder(node.left, out)  # 左
    postorder(node.right, out) # 右
    out.append(node.val)       # 根(在后 → 后序)

# ---- 迭代版前序:用显式栈模拟递归 ----
def preorder_iter(root):
    out, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right: stack.append(node.right)  # 先压右
        if node.left:  stack.append(node.left)   # 后压左 → 先弹左
    return out

# ---- 层序遍历(BFS):队列 ----
def level_order(root):
    res = []
    if root is None:
        return res
    q = deque([root])
    while q:
        size = len(q)              # 关键:先记住这层有几个
        level = []
        for _ in range(size):
            node = q.popleft()
            level.append(node.val)
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        res.append(level)
    return res

# 深树警告:Python 默认递归深度约 1000!
# sys.setrecursionlimit(10 ** 6)   # 刷题遇到深树/链状树时手动调大`,
            hl: [12, 13, 14, 15, 16, 21, 22, 23, 28, 29, 30, 59, 60],
            note: (
              <>
                <b>红线:</b>默认 <code>sys.getrecursionlimit()</code> ≈ 1000,
                一条 1000 节点的链状树就能撞爆。LeetCode 的 Python
                环境已帮你调大,但本地跑和面试口头回答时必须知道这回事。
              </>
            ),
          }}
          js={{
            code: `function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}

// ---- 递归版三种 DFS:同一条路线,只差输出时机 ----
function preorder(node, out) {
  if (node === null) return;   // 终止条件:空树,直接回头
  out.push(node.val);          // 根(在前 → 前序)
  preorder(node.left, out);    // 左
  preorder(node.right, out);   // 右
}

function inorder(node, out) {
  if (node === null) return;
  inorder(node.left, out);     // 左
  out.push(node.val);          // 根(在中 → 中序)
  inorder(node.right, out);    // 右
}

function postorder(node, out) {
  if (node === null) return;
  postorder(node.left, out);   // 左
  postorder(node.right, out);  // 右
  out.push(node.val);          // 根(在后 → 后序)
}

// ---- 迭代版前序:用显式栈模拟递归 ----
function preorderIter(root) {
  const out = [], stack = root ? [root] : [];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.val);
    if (node.right) stack.push(node.right); // 先压右
    if (node.left) stack.push(node.left);   // 后压左 → 先弹左
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
    const size = q.length - head;  // 关键:先记住这层有几个
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
            hl: [9, 10, 11, 12, 17, 18, 19, 24, 25, 26, 47, 48],
            note: (
              <>
                <b>栈深:</b>各引擎调用栈约 1 万层量级,深链状树同样会{" "}
                <code>Maximum call stack size exceeded</code>;队列别用{" "}
                <code>shift()</code>(O(n) 搬家,队列章讲过),用下标或双栈。
              </>
            ),
          }}
        />
        <Callout tone="win" title="面试口头禅:递归和迭代谁好?">
          <p>
            标准回答:「递归版可读性好、和树的递归定义同构;代价是栈深受限
            (Python 默认 ~1000、JVM/JS 引擎也各有几千到几万层的红线),
            极深或链状树需要迭代版(自己管栈,深度只受堆内存限制)。
            两者时间复杂度相同 O(n)。」能顺手写出迭代前序,是加分动作。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 三语言对照 ================= */}
      <Section
        id="langs"
        index="06"
        title="三语言对照:树,永远自己动手"
        desc="三种语言都没有内置二叉树 —— TreeNode 三副面孔 + 一个建树辅助函数"
      >
        <div className="prose">
          <p>
            数组、字典每个语言都送,树却没有 —— 因为树的「形状」由业务决定,
            标准库给不了通用款(Java 的 TreeMap 内部虽是红黑树,但不暴露节点)。
            好消息:刷题时 <code>TreeNode</code> 由题目提供,你只需要会读;
            本地调试时,下面的 <code>buildTree</code> 能把 LeetCode
            的层序数组(如 <code>[3,9,20,null,null,15,7]</code>)一键变成真树:
          </p>
        </div>
        <CodeTabs
          title="tree_node_and_builder"
          java={{
            code: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;    // 还是引用!存的是「左孩子在哪」,不是孩子本身
    TreeNode right;
    TreeNode(int val) { this.val = val; }
}

class Build {
    // 从层序数组构造:null 表示空位,如 [3,9,20,null,null,15,7]
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
            note: (
              <>
                <b>细节:</b>数组类型得用 <code>Integer[]</code> 而不是{" "}
                <code>int[]</code> —— 原始类型装不下 null,而「空位」恰恰要靠
                null 表达。
              </>
            ),
          }}
          python={{
            code: `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left     # 还是引用!存的是「左孩子在哪」
        self.right = right

# 从层序数组构造:None 表示空位,如 [3,9,20,None,None,15,7]
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
            note: (
              <>
                <b>细节:</b>判断空位要用 <code>is None</code> 而不是{" "}
                <code>not vals[i]</code> —— 后者会把合法的节点值 0 也当成空位,
                这是真实的刷题事故高发区。
              </>
            ),
          }}
          js={{
            code: `class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;    // 还是引用!存的是「左孩子在哪」
    this.right = right;
  }
}

// 从层序数组构造:null 表示空位,如 [3,9,20,null,null,15,7]
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
            note: (
              <>
                <b>细节:</b>LeetCode 的 JS 模板用 <code>function
                TreeNode(val, left, right)</code> 构造函数风格,class
                写法与它完全兼容 —— 两种都要认识。
              </>
            ),
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>关注点</th>
                <th>Java</th>
                <th>Python</th>
                <th>JavaScript</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>节点定义</td>
                <td><code>class TreeNode</code>(字段 + 构造器)</td>
                <td><code>class TreeNode</code>(<code>__init__</code> 默认参数)</td>
                <td><code>class</code> 或构造函数,皆可</td>
              </tr>
              <tr>
                <td>空树 / 空孩子</td>
                <td><code>null</code></td>
                <td><code>None</code>(判断用 <code>is None</code>)</td>
                <td><code>null</code>(判断用 <code>===</code>)</td>
              </tr>
              <tr>
                <td>层序用的队列</td>
                <td><code>ArrayDeque</code> / <code>LinkedList</code></td>
                <td><code>collections.deque</code></td>
                <td>数组 + 头下标(别用 shift)</td>
              </tr>
              <tr>
                <td>递归深度红线</td>
                <td>线程栈 512KB~1MB(<code>-Xss</code> 可调)</td>
                <td>默认约 1000!(<code>sys.setrecursionlimit</code>)</td>
                <td>引擎相关,约 1 万层量级</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ================= §07 套路与精讲 ================= */}
      <Section
        id="patterns"
        index="07"
        title="树题总纲:根怎么办 + 左答案 + 右答案"
        desc="两种递归做法打天下 —— 四道代表题,逐帧拆解"
        badge={<span className="chip" data-tone="warn">★ 面试核心</span>}
      >
        <div className="prose">
          <p>
            树的题目千变万化,骨架只有一句话:
            <strong>一棵树的问题 = 根节点怎么处理 + 左子树的答案 + 右子树的答案</strong>。
            拿到题先问:「如果左右子树的答案已经在我手上,我怎么拼出整棵树的答案?」
            拼法想清楚,加上终止条件,代码就写完了。而「信息往哪个方向流」,
            决定了两种做法:
          </p>
        </div>
        <div className="grid-2">
          <div className="card hoverable">
            <div className="card-kicker">做法一</div>
            <div className="card-title">⬇️ 自顶向下(参数下传)</div>
            <p>
              信息从根流向叶:把「一路走来的状态」(当前深度、剩余路径和、
              路径字符串)装进<b>参数</b>带下去,在<b>前序位置</b>(进节点时)干活,
              到叶子结算。→ LC 112、257、129。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">做法二</div>
            <div className="card-title">⬆️ 自底向上(返回值上传)</div>
            <p>
              信息从叶流向根:先递归拿到<b>左右子树的返回值</b>,在<b>后序位置</b>
              (离开节点前)拼出自己的答案往上报(高度、节点数、直径)。
              → LC 104、110、543、124、236。
            </p>
          </div>
        </div>
        <div className="prose" style={{ marginTop: 14 }}>
          <p>
            判断口诀:答案依赖<strong>祖先信息</strong>(我在第几层?一路和是多少?)
            → 自顶向下;答案依赖<strong>子孙信息</strong>(下面有多高?有几个节点?)
            → 自底向上。分不清时先试自底向上 —— 树题七成是它。
          </p>
        </div>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 A</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 104 · 二叉树的最大深度
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">EASY</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>求根到最远叶子的节点数。<b>笨办法:</b>
            对每个叶子算一遍到根的距离再取最大 —— 重复走了大量的边。
            <b> 递归拼装:</b>「整棵树的最大深度」=
            1(根自己)+ max(左子树最大深度, 右子树最大深度),空树 = 0。
            终止条件 ✓、子问题更小 ✓、拼装公式 ✓ —— 三要素齐备活,
            这是自底向上的第一课:
          </p>
        </div>
        <DepthLab />
        <CodeTabs
          title="lc104_max_depth"
          java={{
            code: `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;          // 空树:深度 0(终止条件)
        int left = maxDepth(root.left);      // 信任递归:左子树的答案
        int right = maxDepth(root.right);    // 信任递归:右子树的答案
        return 1 + Math.max(left, right);    // 根自己占一层,拼装!
    }
}`,
            hl: [3, 4, 5, 6],
          }}
          python={{
            code: `class Solution:
    def maxDepth(self, root) -> int:
        if root is None:                   # 空树:深度 0(终止条件)
            return 0
        left = self.maxDepth(root.left)    # 信任递归:左子树的答案
        right = self.maxDepth(root.right)  # 信任递归:右子树的答案
        return 1 + max(left, right)        # 根自己占一层,拼装!`,
            hl: [3, 4, 5, 6, 7],
          }}
          js={{
            code: `var maxDepth = function (root) {
  if (root === null) return 0;          // 空树:深度 0(终止条件)
  const left = maxDepth(root.left);     // 信任递归:左子树的答案
  const right = maxDepth(root.right);   // 信任递归:右子树的答案
  return 1 + Math.max(left, right);     // 根自己占一层,拼装!
};`,
            hl: [2, 3, 4, 5],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            每个节点访问一次:时间 <b>O(n)</b>;递归栈最深 = 树高:空间{" "}
            <b>O(h)</b>(平衡时 log n,链状时 n)。追问一:「改成 BFS 怎么求?」
            层序遍历数层数,遍历完有几层深度就是几。追问二:「最小深度呢?」
            小心叶子陷阱(题单 LC 111)—— 单孩子节点不能取空侧的 0。
          </p>
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 B</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 226 · 翻转二叉树
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">EASY</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>把整棵树左右镜像。<b>递归拼装:</b>翻转一棵树 =
            交换根的左右孩子 + 翻转左子树 + 翻转右子树。注意交换的是
            <strong>两个引用</strong>(§02:纸条一换,整棵子树跟着走),
            子树内部的乱序交给递归 —— 又是「信任」:
          </p>
        </div>
        <InvertLab />
        <CodeTabs
          title="lc226_invert_tree"
          java={{
            code: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;       // 空树:没什么可翻
        TreeNode t = root.left;              // 暂存左孩子引用
        root.left = invertTree(root.right);  // 右子树翻好后挂到左边
        root.right = invertTree(t);          // 左子树翻好后挂到右边
        return root;
    }
}`,
            hl: [3, 4, 5, 6],
          }}
          python={{
            code: `class Solution:
    def invertTree(self, root):
        if root is None:                  # 空树:没什么可翻
            return None
        root.left, root.right = (         # 一行交换两个引用
            self.invertTree(root.right),  # 右子树翻好后挂到左边
            self.invertTree(root.left),   # 左子树翻好后挂到右边
        )
        return root`,
            hl: [3, 4, 5, 6, 7],
          }}
          js={{
            code: `var invertTree = function (root) {
  if (root === null) return null;       // 空树:没什么可翻
  const t = root.left;                   // 暂存左孩子引用
  root.left = invertTree(root.right);    // 右子树翻好后挂到左边
  root.right = invertTree(t);            // 左子树翻好后挂到右边
  return root;
};`,
            hl: [2, 3, 4, 5],
          }}
        />
        <Callout tone="story" title="一则广为流传的面试轶事">
          <p>
            Mac 用户人手一个的包管理器 Homebrew,其作者 Max Howell 当年面谷歌被拒,
            发推自嘲:「谷歌:虽然你写的软件我们 90% 的工程师都在用,
            但你连白板上翻转二叉树都不会,滚吧。」这条推特让 LC 226
            成了全网最有名的 Easy 题 —— 现在你会了,还知道它 O(n)/O(h),
            以及交换的是引用不是数据。
          </p>
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 C</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 101 · 对称二叉树
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">EASY+</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>判断一棵树是否轴对称。<b>难点:</b>「对称」不是单棵子树的性质,
            而是<strong>左右两棵子树之间</strong>的关系 —— 单参数的
            f(node) 装不下这个问题。<b>破局:</b>升级成双参数 check(L, R):
            「L 和 R 互为镜像」 ⟺ 值相等 + <strong>L 的左 ↔ R 的右</strong>(外侧)
            + <strong>L 的右 ↔ R 的左</strong>(内侧)。
            两个「指针」在树的两半上镜像同步走:
          </p>
        </div>
        <MirrorLab />
        <CodeTabs
          title="lc101_symmetric"
          java={{
            code: `class Solution {
    public boolean isSymmetric(TreeNode root) {
        return root == null || check(root.left, root.right);
    }

    boolean check(TreeNode l, TreeNode r) {
        if (l == null && r == null) return true;   // 两边都空:镜像成立
        if (l == null || r == null) return false;  // 只有一侧为空:不构成镜像
        return l.val == r.val                      // 值要相等
            && check(l.left, r.right)              // 外侧 vs 外侧
            && check(l.right, r.left);             // 内侧 vs 内侧
    }
}`,
            hl: [7, 8, 9, 10, 11],
          }}
          python={{
            code: `class Solution:
    def isSymmetric(self, root) -> bool:
        def check(l, r):
            if l is None and r is None:   # 两边都空:镜像成立
                return True
            if l is None or r is None:    # 只有一侧为空:不构成镜像
                return False
            return (l.val == r.val                # 值要相等
                    and check(l.left, r.right)    # 外侧 vs 外侧
                    and check(l.right, r.left))   # 内侧 vs 内侧
        return root is None or check(root.left, root.right)`,
            hl: [4, 5, 6, 7, 8, 9, 10],
          }}
          js={{
            code: `var isSymmetric = function (root) {
  const check = (l, r) => {
    if (l === null && r === null) return true;  // 两边都空:镜像成立
    if (l === null || r === null) return false; // 只有一侧为空:不构成镜像
    return (
      l.val === r.val &&          // 值要相等
      check(l.left, r.right) &&   // 外侧 vs 外侧
      check(l.right, r.left)      // 内侧 vs 内侧
    );
  };
  return root === null || check(root.left, root.right);
};`,
            hl: [3, 4, 6, 7, 8],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            O(n)/O(h)。这题教的通用技巧是:<b>递归函数的参数不必只有一个节点</b>
            —— 双树同步递归(本题、LC 100 相同的树、LC 572 子树判断)全靠双参数。
            追问:「迭代怎么写?」把该成对比较的 (L, R) 成对入队,每次出队一对 ——
            队列/栈都行,思路不变。
          </p>
        </Callout>

        {/* —— 精讲 D —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 D</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 102 · 二叉树的层序遍历
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>按层返回节点值,每层一个数组(<code>[[3],[9,20],[15,7]]</code>)。
            <b> 已知:</b>队列 BFS 能按「层的顺序」吐出节点,但吐出来是一维的 ——
            层与层的<strong>边界</strong>在哪?<b>分层技巧:</b>每层开始前,
            队列里恰好装着这一层的全部节点 ——{" "}
            <strong>先记下 size,本轮只出队 size 个</strong>,
            期间入队的孩子自然属于下一层:
          </p>
        </div>
        <LevelLab />
        <CodeTabs
          title="lc102_level_order"
          java={{
            code: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();              // 先记 size:锁定本层边界
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {  // 只出队 size 个
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
            hl: [8, 10],
          }}
          python={{
            code: `from collections import deque

class Solution:
    def levelOrder(self, root) -> list[list[int]]:
        res = []
        if root is None:
            return res
        q = deque([root])
        while q:
            size = len(q)             # 先记 size:锁定本层边界
            level = []
            for _ in range(size):     # 只出队 size 个
                node = q.popleft()
                level.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(level)
        return res`,
            hl: [10, 12],
          }}
          js={{
            code: `var levelOrder = function (root) {
  const res = [];
  if (!root) return res;
  const q = [root];
  let head = 0;                       // 下标当队首(shift 是 O(n))
  while (head < q.length) {
    const size = q.length - head;     // 先记 size:锁定本层边界
    const level = [];
    for (let i = 0; i < size; i++) {  // 只出队 size 个
      const node = q[head++];
      level.push(node.val);
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
    res.push(level);
  }
  return res;
};`,
            hl: [7, 9],
          }}
        />
        <Callout tone="win" title="复杂度 & 这一招的辐射范围">
          <p>
            O(n) 时间、O(w) 队列空间。「先记 size」是一把万能钥匙:
            锯齿形层序(LC 103,偶数层反转)、右视图(LC 199,取每层最后一个)、
            每层最大值(LC 515)、最小深度(LC 111,见到叶子立刻返回)——
            全是这个模板改两行。树的 BFS 学到这一题,即告完整。
          </p>
        </Callout>
      </Section>

      {/* ================= §08 题单 ================= */}
      <Section
        id="problems"
        index="08"
        title="高频题单:二叉树 11 题"
        desc="由易到难:双树递归 → 两种做法 → BFS → 构造 → 祖先,压轴 124"
        badge={<span className="chip">Hot 100 精选</span>}
      >
        <ProblemSet ch="binary-tree" items={PROBLEMS} />
      </Section>

      {/* ================= §09 Quiz ================= */}
      <Section
        id="quiz"
        index="09"
        title="通关测验"
        desc="8 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="binary-tree" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            整章钥匙:<b>树 = 根 + 左子树 + 右子树(空也是树)</b>。
            结构是递归定义的,处理它的代码自然是递归的。
          </>,
          <>
            递归三要素:<b>终止条件</b>(空树第一行)、<b>递归调用</b>(规模必须变小)、
            <b>信任递归</b>(把子问题当已解决,只写拼装逻辑)。忘写终止条件 =
            栈溢出(Python 红线约 1000 层)。
          </>,
          <>
            前/中/后序是<b>同一条 DFS 路线</b>,名字只说「根」的输出时机;
            层序是 BFS。全部 O(n);DFS 空间 O(h) 吃栈,BFS 空间 O(w) 吃队列。
          </>,
          <>
            两种递归做法:<b>自顶向下</b>参数带祖先信息下去(路径和、深度),
            <b>自底向上</b>返回值带子树信息上来(高度、直径)——
            看答案依赖祖先还是子孙来选。
          </>,
          <>
            BFS 分层的万能钥匙:<b>每层先记 size,只出队 size 个</b>。
            右视图、锯齿层序、最小深度全是它的变奏。
          </>,
          <>
            恢复一棵树:<b>前序+中序 或 后序+中序</b>(前/后序定根,中序分左右);
            前序+后序不行 —— 独生子女分不清左右。n 个节点的树高在 log n 与 n−1
            之间摇摆,这是下一章 BST 要「强制平衡」的动机。
          </>,
        ]}
      />

      <ChapterFooter ch="binary-tree" />
    </main>
  );
}
