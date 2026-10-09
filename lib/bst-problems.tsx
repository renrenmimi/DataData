// Chapter 8 · Binary search trees — problem set.
// The closing quiz is in lib/bst-quiz.tsx; /atlas imports only this file.
// Problems follow three threads: basic operations (700/701/450), exploiting the sorted order
// (653/530/235/938), and cases where that order is broken or hidden behind an API (99/173).
// hint points a direction only; key explains the optimal solution in one paragraph.
//
// Bilingual: title / tags / hint / key are { en, zh } pairs.
// Problem titles use the official LeetCode English name on en and the official Chinese name on zh.

import type { Problem } from "@/lib/problems";

export const PROBLEMS: Problem[] = [
  {
    lc: 700,
    title: {
      en: "Search in a Binary Search Tree",
      zh: "二叉搜索树中的搜索",
    },
    d: "easy",
    tags: [
      { en: "core operation", zh: "基本操作" },
      { en: "one path down", zh: "一路下坠" },
    ],
    hint: {
      en: "The move from §02: at every node you ask one question — is the target smaller or larger than this node?",
      zh: "§02 的招牌动作:每到一个节点只问一个问题 —— 目标比我小还是比我大?",
    },
    key: {
      en: (
        <>
          Start at the root. Equal means found. Smaller goes left, larger goes
          right. Reaching an empty child proves the value is not in the tree at
          all. The iterative version is one while loop, O(h) time and O(1) extra
          space. This is the bare template, and the first step of every later
          problem is this same move.
        </>
      ),
      zh: (
        <>
          从根出发:相等即命中;小往左、大往右;撞到空孩子就说明整棵树都没有。迭代版一个 while 循环写完,O(h) 时间、O(1) 额外空间。这是 BST 的裸模板题,后面所有题的第一步都藏着这个动作。
        </>
      ),
    },
  },
  {
    lc: 653,
    title: {
      en: "Two Sum IV - Input is a BST",
      zh: "两数之和 IV · 输入二叉搜索树",
    },
    d: "easy",
    tags: [
      { en: "in-order", zh: "中序" },
      { en: "hash / two pointers", zh: "哈希 / 双指针" },
    ],
    hint: {
      en: "This is Two Sum in disguise. What can you turn the BST into first, so the old method applies?",
      zh: "它本质是「两数之和」—— 你可以把 BST 先「变成」什么,再套老办法?",
    },
    key: {
      en: (
        <>
          Two routes. First: traverse in any order and use a hash set to look for
          k − v. O(n) time and O(n) space, and it does not use the BST property
          at all. Second: flatten the tree with in-order traversal to get a
          sorted array, then use the two pointers from LC 167. Also O(n), but it
          uses the BST's order. A stronger answer for an interview: run two BST
          iterators, one from the smallest end and one from the largest, and move
          them towards each other. That keeps space at O(h).
        </>
      ),
      zh: (
        <>
          两条路:① 任意遍历 + 哈希集合查 k − v,O(n) 时间 O(n) 空间,连 BST 性质都不需要;② 中序展开成升序数组 + 对撞双指针(即 LC 167 的做法),同样 O(n),但用上了 BST 的有序性。面试中更进一步的答法:用两个 BST 迭代器分别从最小、最大两端向中间逼近,空间压到 O(h)。
        </>
      ),
    },
  },
  {
    lc: 530,
    title: {
      en: "Minimum Absolute Difference in BST",
      zh: "二叉搜索树的最小绝对差",
    },
    d: "easy",
    tags: [
      { en: "in-order", zh: "中序" },
      { en: "adjacent difference", zh: "相邻差" },
    ],
    hint: {
      en: "In a sorted sequence the smallest difference is always between two neighbors. How does a BST produce a sorted sequence?",
      zh: "升序序列里,最小差值一定出现在相邻两个数之间 —— BST 怎么变出升序序列?",
    },
    key: {
      en: (
        <>
          Traverse in order and keep prev, the previously visited value. At each
          step update the answer with cur − prev. Why only neighbors: in a
          sorted sequence, the difference between any two values is at least as
          large as the difference between some adjacent pair between them. One
          in-order pass, O(n) time and O(h) stack space. Rule of thumb: when a
          BST problem mentions difference, neighbor, or k-th, think in-order
          first.
        </>
      ),
      zh: (
        <>
          中序遍历时维护 prev(上一个访问的值),每步用 cur − prev 更新答案。为什么只看相邻:有序序列里任意两数之差,都不小于它们之间某对相邻数之差。一次中序 O(n)、栈空间 O(h)。口诀:BST 题看到「差值 / 相邻 / 第 k」先想中序。
        </>
      ),
    },
  },
  {
    lc: 938,
    title: { en: "Range Sum of BST", zh: "二叉搜索树的范围和" },
    d: "easy",
    tags: [
      { en: "pruning", zh: "剪枝" },
      { en: "DFS", zh: "DFS" },
    ],
    hint: {
      en: "If the current value is already smaller than low, is there any reason to look at its left subtree?",
      zh: "当前节点值已经小于 low 时,它的整个左子树还有必要看吗?",
    },
    key: {
      en: (
        <>
          DFS with pruning based on the ordering. If val &lt; low, every value in
          the left subtree is smaller still, so only the right subtree is worth
          visiting. If val &gt; high, only the left subtree is. If val is inside
          the range, add it and recurse both ways. The worst case is O(n), but
          the pruning skips whole subtrees at once. This problem is the clearest
          demonstration that the ordering of a BST is also a way to avoid work.
        </>
      ),
      zh: (
        <>
          DFS + 有序性剪枝:val &lt; low → 左子树全体更小,只递归右子树;
          val &gt; high → 只递归左子树;落在区间内 → 累加自身 + 两边递归。最坏 O(n),但剪枝能把大量子树整棵跳过 ——
          这题最能体会「BST 的有序性同时也是一种省事的手段」。
        </>
      ),
    },
  },
  {
    lc: 701,
    title: {
      en: "Insert into a Binary Search Tree",
      zh: "二叉搜索树中的插入操作",
    },
    d: "medium",
    tags: [
      { en: "core operation", zh: "基本操作" },
      { en: "recursion", zh: "递归" },
    ],
    hint: {
      en: "Follow the search path until it reaches an empty slot. That slot is the only place the new node can go, and no existing node has to move.",
      zh: "沿查找路线走到空位,那里就是新节点唯一的家 —— 不需要挪动任何现有节点。",
    },
    key: {
      en: (
        <>
          Recursion: if node is empty, return new TreeNode(v). A smaller value
          goes left, a larger one goes right, and the function returns node
          itself so the parent can reattach it. O(h). The point to remember:{" "}
          <b>an insert always happens at an empty child slot</b>, and no part of
          the existing structure moves. That is why a BST inserts more cheaply
          than a sorted array.
        </>
      ),
      zh: (
        <>
          递归:node 为空就返回 new TreeNode(v);v 小挂左、大挂右,最后返回 node 本身,让父节点重新牵手。O(h)。关键认知:
          <b>插入永远发生在一个空的孩子位置</b>,树的中间结构一个都不动 ——
          这正是 BST 比有序数组插入便宜的原因。
        </>
      ),
    },
  },
  {
    lc: 235,
    title: {
      en: "Lowest Common Ancestor of a Binary Search Tree",
      zh: "二叉搜索树的最近公共祖先",
    },
    d: "medium",
    tags: [
      { en: "ordering", zh: "有序性" },
      { en: "the split point", zh: "分流点" },
    ],
    hint: {
      en: "Walk down from the root. p and q keep going the same way — until one node sends them in different directions.",
      zh: "从根往下走,p 和 q 一直同路 —— 直到某个节点把它们分向两边。",
    },
    key: {
      en: (
        <>
          From the root: if p and q are both smaller than the current node, go
          left; if both are larger, go right; if one is on each side (or one
          equals the current node), the current node is the answer. One loop,
          O(h). Compare this with LC 236 on a plain binary tree: without the
          ordering you need a post-order traversal that passes information back
          up, O(n). The ordering turns a search of the whole tree into a single
          walk down one path. Answering both together shows you understand why.
        </>
      ),
      zh: (
        <>
          从根出发:p、q 都小于当前节点 → 往左;都大 → 往右;一大一小(或其中一个就等于当前节点)→ 当前节点就是答案。一个循环,O(h)。对照普通二叉树的 LC 236:没有有序性就得后序遍历自底向上回传信息,O(n)。有序性把「全树搜索」降成了「单路下降」,两题放一起答最能体现理解深度。
        </>
      ),
    },
  },
  {
    lc: 450,
    title: { en: "Delete Node in a BST", zh: "删除二叉搜索树中的节点" },
    d: "medium",
    tags: [
      { en: "three delete cases", zh: "删除三情况" },
      { en: "in-order successor", zh: "中序后继" },
    ],
    hint: {
      en: "Review the three cases in §03. With two children, which node can take the place of the deleted one without breaking the ordering?",
      zh: "先复习 §03 三种情况 —— 双孩子时,谁能顶替被删节点而不破坏「左小右大」?",
    },
    key: {
      en: (
        <>
          Locate the node by recursion, then split into three cases. No child:
          return null. One child: return that child, so the parent links to it
          directly. Two children: copy the value of the in-order successor (the
          smallest value in the right subtree) into this node, then delete the
          successor from the right subtree. The successor has no left child, so
          that second deletion always falls into one of the two easy cases and
          the recursion terminates. O(h). §04 has the full implementation in
          three languages, and you should be able to write this one from memory.
        </>
      ),
      zh: (
        <>
          递归定位后分三种情况:没有孩子 → 返回 null;只有一个孩子 →
          返回那个孩子,让父节点直接接管;两个孩子 →
          把中序后继(右子树最小值)的值抄到当前节点,再去右子树里删掉后继本体
          —— 后继必无左孩子,这次删除一定落入前两种简单情况,递归自然终止。O(h)。§04 有完整的三语言实现,这题必须能盲写。
        </>
      ),
    },
  },
  {
    lc: 173,
    title: { en: "Binary Search Tree Iterator", zh: "二叉搜索树迭代器" },
    d: "medium",
    tags: [
      { en: "in-order, on demand", zh: "受控中序" },
      { en: "explicit stack", zh: "显式栈" },
    ],
    hint: {
      en: "Recursive in-order runs to the end in one go. An iterator must stop after each value, so you have to manage the stack yourself.",
      zh: "递归中序是「一口气跑完」,迭代器要求「随叫随到」—— 把递归栈自己管起来。",
    },
    key: {
      en: (
        <>
          Keep an explicit stack. On construction, push the left spine of the
          root, that is, the root and every node reached by going left. next()
          pops the top and returns it; if that node has a right child, push the
          left spine of the right child. Every node is pushed once and popped
          once, so next() is O(1) amortized and space is O(h). This is the
          standard way to turn a recursion into something you can pause, and the
          two-iterator solution for LC 653 is built on it.
        </>
      ),
      zh: (
        <>
          维护显式栈:初始化时把根的「左脊」(根以及一路向左的所有节点)入栈;
          next() 弹出栈顶返回,若它有右孩子,就把右孩子的左脊也入栈。每个节点恰好入栈、出栈各一次,next 均摊 O(1)、空间 O(h)。这是「把递归改造成可暂停迭代」的经典范式,653 的双迭代器解法就建立在它之上。
        </>
      ),
    },
  },
  {
    lc: 99,
    title: { en: "Recover Binary Search Tree", zh: "恢复二叉搜索树" },
    d: "medium",
    tags: [
      { en: "in-order", zh: "中序" },
      { en: "inversions", zh: "逆序对" },
    ],
    hint: {
      en: "Write out the in-order sequence. When exactly two nodes have been swapped, how many places show a value larger than the one after it?",
      zh: "把中序序列写出来:恰好两个节点被交换后,序列里会出现几处「前 > 后」?",
    },
    key: {
      en: (
        <>
          The in-order sequence of a BST must be strictly increasing. Swapping
          two nodes creates one inversion (if they were adjacent) or two (if they
          were not). Scan in order: take the earlier value of the first inversion
          as first, and the later value of the last inversion as second, then
          swap the two values. O(n) time and O(h) stack space. If the interviewer
          asks for O(1) space, the answer is Morris in-order traversal, which
          borrows the empty right pointer of each node's in-order predecessor as
          a temporary link back up. It is an advanced topic this course does not
          cover.
        </>
      ),
      zh: (
        <>
          BST 的中序应严格升序;两个节点被交换会制造一处(原本相邻)或两处(原本不相邻)逆序。中序扫描:第一处逆序取前者为 first,最后一处逆序取后者为 second,交换两者的值即可。O(n) 时间、O(h) 栈空间。追问 O(1) 空间就答 Morris 中序 ——
          借用每个节点的中序前驱空着的右指针当临时的「回程线索」,属于进阶话题,本课不展开。
        </>
      ),
    },
  },
];
