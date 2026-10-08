// Chapter 7 · Binary trees — closing quiz (the problem set is in lib/binary-tree-problems.tsx).
//
// Bilingual: every question, option and explanation is a { en, zh } pair.

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "Which statement about depth and height is correct? (Counting edges, the usual convention.)",
      zh: "关于「深度」和「高度」,下面哪句是对的?(按主流约定:数边)",
    },
    opts: [
      {
        en: "Depth is counted downward from the root (the root has depth 0); height is counted upward from the deepest leaf (a leaf has height 0)",
        zh: "深度从根往下数(根的深度是 0),高度从最深的叶往上数(叶的高度是 0)—— 方向相反",
      },
      {
        en: "Depth and height are two names for the same quantity",
        zh: "深度和高度是同一个量的两种叫法",
      },
      {
        en: "Depth is counted from the leaves upward, height from the root downward",
        zh: "深度从叶往上数,高度从根往下数",
      },
      {
        en: "Depth can only be computed with BFS, height only with DFS",
        zh: "深度只能用 BFS 算,高度只能用 DFS 算",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "For a single node the two are usually different. Depth measures the distance to the root; height measures the distance to the node's deepest descendant. Only for the whole tree do they meet: the height of the root equals the largest depth in the tree.",
        zh: "对单个节点来说两者通常不同:深度看它离根多远,高度看它离自己最深的后代多远。只有对整棵树,根的高度才恰好等于树里最大的深度。",
      },
      {
        en: "The directions are swapped. Depth is measured from the root, so it grows as you go down. Height is measured from the deepest descendant, so it grows as you go up.",
        zh: "方向说反了:深度的参照物是根,越往下越深;高度的参照物是最深的后代,越往上越高。",
      },
      {
        en: "Neither is tied to a traversal. Depth fits a top-down recursion that passes the current depth as a parameter, and height fits a bottom-up recursion that returns a value, but BFS and DFS can compute both.",
        zh: "两者都和遍历方式无关:深度适合自顶向下用参数传,高度适合自底向上用返回值算,但 BFS 和 DFS 都求得出来。",
      },
    ],
    why: {
      en: "The depth of a node is the number of edges from the root down to it, so the root has depth 0. The height of a node is the number of edges from it down to its deepest descendant, so a leaf has height 0. The height of the tree is the height of the root. These two directions match the two recursive styles in section 07: depth travels down in a parameter, height travels up in a return value.",
      zh: "节点的深度 = 从根到它的边数,所以根的深度是 0;节点的高度 = 从它到最深后代的边数,所以叶子的高度是 0;整棵树的高度 = 根的高度。这两个方向正好对应 §07 的两种递归做法:深度靠参数往下传,高度靠返回值往上传。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Which is the correct definition of a complete binary tree (完全二叉树)?",
      zh: "「完全二叉树(complete binary tree)」的正确判定标准是?",
    },
    opts: [
      {
        en: "Every level is completely filled except possibly the last, and the last level is filled from left to right with no gaps",
        zh: "除最后一层外每层都填满,且最后一层的节点从左到右连续排列、中间没有空缺",
      },
      {
        en: "Every node has either two children or no children",
        zh: "每个节点要么有两个孩子,要么一个孩子都没有",
      },
      {
        en: "All leaves are at the same depth and every level is completely filled",
        zh: "所有叶子都在同一深度,且每一层都填满",
      },
      {
        en: "The heights of the left and right subtrees differ by at most 1, at every node",
        zh: "每个节点的左右子树高度差都不超过 1",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "That defines a full binary tree (Chinese: 真二叉树). A full tree may have gaps in the middle of a level; a complete tree may not.",
        zh: "那是「真二叉树 / full binary tree」的定义。真二叉树允许某一层中间出现空缺,完全二叉树不允许。",
      },
      {
        en: "That defines a perfect binary tree (Chinese: 满二叉树). Every perfect tree is complete, but not the other way round.",
        zh: "那是「满二叉树 / perfect binary tree」的定义。满二叉树一定是完全二叉树,反过来不成立。",
      },
      {
        en: "That is the balanced condition from LC 110. Being balanced says nothing about the nodes being packed to the left.",
        zh: "那是「平衡二叉树」的条件(LC 110)。平衡只管高度差,不管节点有没有挤在左边。",
      },
    ],
    why: {
      en: "Filling every level except the last, and filling the last from left to right, means the level-order positions form one unbroken run. That is exactly what array storage needs: put the node with level-order position i at index i, and its children land at 2i+1 and 2i+2 with no unused slots. This is why the heap in chapter 09 is built on a complete binary tree.",
      zh: "「除最后一层外全满,且最后一层靠左连续」意味着按层序编号是一段没有空洞的连续区间。这正是数组存储需要的:层序第 i 个节点放在下标 i,它的孩子恰好落在 2i+1 和 2i+2,没有一个格子被浪费。这就是第 9 章的堆用完全二叉树当骨架的原因。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          A small tree: root 4, left child 2 (whose children are 1 and 3), right
          child 6. What does its <b>inorder traversal</b> print? (Separate the
          numbers with spaces or commas.)
        </>
      ),
      zh: (
        <>
          一棵小树:根 4,左孩子 2(它的左右孩子是 1、3),右孩子 6。
          它的<b>中序遍历</b>输出是?(数字用空格或逗号分隔)
        </>
      ),
    },
    placeholder: { en: "for example: 1 2 3 …", zh: "如:1 2 3 …" },
    answers: ["12346", "1 2 3 4 6", "1,2,3,4,6", "1、2、3、4、6"],
    hint: {
      en: "Inorder is left, then root, then right, and the same rule applies inside every subtree: the whole left subtree of 4 is finished before 4 is printed.",
      zh: "中序 = 左 → 根 → 右,并且对每棵子树都成立:先把 4 的整棵左子树走完,才轮到 4。",
    },
    why: {
      en: "Inorder finishes the left subtree of 4 first (1, then 2, then 3), then prints the root 4, then the right subtree 6, giving 1 2 3 4 6. The result is sorted, and that is not a coincidence: this tree is a binary search tree, and 'inorder on a BST gives sorted order' is where the next chapter starts.",
      zh: "中序先走完 4 的左子树(1 → 2 → 3),再输出根 4,最后是右子树 6,得到 1 2 3 4 6。结果正好从小到大,这不是巧合:这棵树是二叉搜索树,而「BST 的中序 = 升序」正是下一章的开场白。",
    },
  },
  {
    type: "choice",
    q: {
      en: "A recursive function has no base case. What happens when it runs?",
      zh: "递归函数忘了写终止条件(base case),运行时会发生什么?",
    },
    opts: [
      {
        en: "It calls itself forever, the call stack keeps growing, and the program fails with a stack overflow (StackOverflowError / RecursionError)",
        zh: "函数无限自我调用,调用栈不断堆高,最终栈溢出(StackOverflowError / RecursionError)",
      },
      {
        en: "The compiler reports an error, so the program never runs",
        zh: "编译器会报错,程序根本无法运行",
      },
      {
        en: "The function returns undefined or null and the program continues",
        zh: "函数直接返回 undefined / null,程序继续跑",
      },
      {
        en: "The CPU detects the infinite loop and breaks out of it",
        zh: "CPU 会自动检测死循环并跳出",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A compiler does not check whether a recursion terminates. In general that cannot be decided automatically; it is the halting problem. The compiler only checks the syntax and the types.",
        zh: "编译器不检查递归会不会停 —— 这在一般情况下无法自动判定(停机问题),它只管语法和类型。",
      },
      {
        en: "A branch with no return can indeed produce an empty value, but only if execution reaches it. A recursion with no base case never gets that far; the stack runs out first.",
        zh: "没有 return 的分支确实可能返回空值,但前提是执行流走得到那里。没有终止条件的递归根本轮不到返回,栈先耗尽了。",
      },
      {
        en: "The CPU has no idea what an infinite loop is. It faithfully performs each call and pushes each stack frame until the stack space given by the operating system runs out.",
        zh: "CPU 不懂什么叫死循环,它只是忠实地执行每一次调用、压入每一个栈帧,直到操作系统给的栈空间用完。",
      },
    ],
    why: {
      en: "Each call pushes a new frame on the call stack, holding the parameters, the local variables, and the return address. No base case means the pushing never stops, and the stack space (usually a few megabytes) is exhausted quickly: Java and JavaScript raise a stack overflow error, Python raises RecursionError at its recursion limit, which defaults to about 1000. So the first question when writing a recursion on a tree is always: what do I do with an empty node?",
      zh: "每次调用都要在调用栈上压一个新栈帧(参数、局部变量、返回地址)。没有终止条件就是无限压栈,栈空间(通常几 MB)很快耗尽:Java 和 JavaScript 抛栈溢出错误,Python 在递归深度上限(默认约 1000)处抛 RecursionError。所以写树上的递归,第一件事永远是问:空节点怎么办?",
    },
  },
  {
    type: "choice",
    q: {
      en: "Level-order traversal (BFS) needs which helper data structure, and why?",
      zh: "层序遍历(BFS)必须借助哪种辅助数据结构?为什么?",
    },
    opts: [
      {
        en: "A queue. The node discovered first is processed first, and first in, first out is exactly what keeps one level ahead of the next",
        zh: "队列 —— 先发现的节点先处理,先进先出恰好保证「一层处理完才轮到下一层」",
      },
      {
        en: "A stack. Last in, first out is what walks the tree level by level",
        zh: "栈 —— 后进先出才能一层一层地走",
      },
      {
        en: "A hash map, to record which level each node belongs to",
        zh: "哈希表 —— 记录每个节点在第几层",
      },
      {
        en: "Nothing. Plain recursion is enough",
        zh: "不需要任何辅助结构,递归就行",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A stack is last in, first out, so a child that was just discovered is processed immediately and the walk dives to the bottom. That is DFS. Replacing the queue with a stack changes the algorithm.",
        zh: "栈是后进先出:刚发现的孩子会被立刻处理,一路扎到底 —— 那是 DFS。把 BFS 的队列换成栈,算法就变了性质。",
      },
      {
        en: "A hash map can record level numbers, but it cannot decide the processing order, and the order is what a traversal is. A queue is an ordering device by construction.",
        zh: "哈希表能记层号,却给不出「处理顺序」—— 顺序才是遍历的本体,而队列天生就是顺序机器。",
      },
      {
        en: "Recursion runs on the call stack, which is depth-first by nature. You can simulate level order with recursion by passing the depth down, but you are working against the stack instead of with it.",
        zh: "递归的底层是调用栈,天然深度优先。用递归带着深度参数也能模拟层序,但那是在对抗栈的本能,反而绕远。",
      },
    ],
    why: {
      en: "The invariant of BFS: at any moment the queue holds nodes from at most two neighboring levels, and nodes of the same level are queued left to right. Dequeue one node, enqueue its children at the back, and first in, first out guarantees a whole level leaves before the next one starts. To split the output into levels, record the queue size before the inner loop and dequeue exactly that many nodes. This is the queue from chapter 05 doing real work.",
      zh: "BFS 的不变量:任一时刻队列里的节点最多横跨相邻两层,且同层节点按从左到右排队。出队一个、孩子入队尾 —— 先进先出保证整层出完才轮到下一层。想把输出切成一层一层,就在内层循环前先记下队列长度,本轮只出队这么多个。这正是第 5 章的队列在干实事。",
    },
  },
  {
    type: "choice",
    q: {
      en: "For a binary tree with n nodes, what is the possible range of the height h? (Counting edges.)",
      zh: "n 个节点的二叉树,高度 h 的可能范围是?(数边)",
    },
    opts: [
      {
        en: "As low as ⌊log₂ n⌋ when every level is packed, as high as n−1 when the tree degenerates into a chain",
        zh: "最矮 ⌊log₂n⌋(每层塞满),最高 n−1(退化成一条链)",
      },
      { en: "Always exactly log₂ n", zh: "恒等于 log₂n" },
      { en: "Always exactly n−1", zh: "恒等于 n−1" },
      { en: "As low as 1, as high as log₂ n", zh: "最矮 1,最高 log₂n" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "⌊log₂ n⌋ is only the lower bound, reached when the tree is packed as tightly as possible. Nothing forces a binary tree to be packed; an unlucky insertion order makes it lean.",
        zh: "⌊log₂n⌋ 只是「塞得最紧」时的下界。没有任何规则强迫二叉树塞满,插入顺序不巧就会歪。",
      },
      {
        en: "n−1 is the upper bound, reached when every node has one child and the tree is really a linked list. That is the worst case, not the rule.",
        zh: "n−1 是上界:每个节点只有一个孩子,树退化成链表。那是最坏情况,不是必然。",
      },
      {
        en: "The two ends are swapped. Logarithmic is the best case (shortest) and linear is the worst case (tallest).",
        zh: "两头反了:log 级别是最好情况(最矮),n 级别是最坏情况(最高)。",
      },
    ],
    why: {
      en: "With the same n nodes the shape can differ enormously: packed, the height is ⌊log₂ n⌋; degenerate, it is n−1. Tree algorithms are usually described as O(h) rather than O(log n), because h is only logarithmic when the tree is balanced. Forcing that balance is the whole motivation for the next chapter.",
      zh: "同样 n 个节点,形状可以天差地别:塞满时高度是 ⌊log₂n⌋,退化成链时是 n−1。树上算法的复杂度通常写成 O(h) 而不是 O(log n),因为只有树平衡时 h 才是对数级。如何强制这个平衡,正是下一章的全部动机。",
    },
  },
  {
    type: "choice",
    q: {
      en: "What is the real difference between the top-down and bottom-up recursive styles?",
      zh: "「自顶向下」和「自底向上」两种递归做法的本质区别是?",
    },
    opts: [
      {
        en: "Top-down carries information down in the parameters and works at the preorder position; bottom-up carries the subtree answers up in the return value and works at the postorder position",
        zh: "自顶向下把信息用参数带下去、在前序位置干活;自底向上靠返回值把子树答案传上来、在后序位置干活",
      },
      { en: "Top-down uses BFS, bottom-up uses DFS", zh: "自顶向下用 BFS,自底向上用 DFS" },
      {
        en: "Top-down is faster, bottom-up uses less memory",
        zh: "自顶向下更快,自底向上更省内存",
      },
      {
        en: "Only the code style differs; either one is equally easy for any problem",
        zh: "只是代码风格不同,任何题两种写法难度都一样",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Both are DFS recursions. The difference is the direction the information travels (parameters down versus return values up), not the traversal algorithm.",
        zh: "两者都是 DFS 递归。区别在信息的流向(参数向下 vs 返回值向上),不在遍历算法。",
      },
      {
        en: "Their asymptotic costs are usually the same, since each node is visited once either way. You choose based on where the information comes from, not on performance.",
        zh: "两者的渐近复杂度通常相同(每个节点都只访问一次)。选哪个看信息来源,不看性能。",
      },
      {
        en: "Choosing the wrong direction makes the code much more awkward. Depth depends on the ancestors, so passing it down is natural; height and diameter depend on the descendants, so the children must answer first.",
        zh: "方向选错会明显别扭:深度依赖祖先,顺着往下传最自然;高度、直径依赖子孙,必须等孩子先答完。题目本身有偏好。",
      },
    ],
    why: {
      en: "The test: if the answer depends on what lies between the root and the current node (its depth, the sum along the path), pass that state down in a parameter. If the answer depends on the current node's subtree (its height, its node count, its diameter), collect the children's return values and combine them. LC 112 is the model for the first, LC 543 and LC 124 for the second.",
      zh: "判断方法:答案依赖「从根到我这一路的信息」(深度、路径和)→ 自顶向下传参;答案依赖「我的子树的信息」(高度、节点数、直径)→ 自底向上收返回值。LC 112 是前者的样板,LC 543、124 是后者的样板。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Given only two traversal sequences, which combination determines a binary tree uniquely?",
      zh: "只给两种遍历序列,哪种组合能唯一确定(恢复)一棵二叉树?",
    },
    opts: [
      {
        en: "Preorder + inorder works, and postorder + inorder works; preorder + postorder does not",
        zh: "前序 + 中序(或后序 + 中序)可以;前序 + 后序不行",
      },
      { en: "Any two of them work", zh: "任何两种组合都可以" },
      {
        en: "No two of them work; you always need three",
        zh: "任何两种组合都不行,至少要三种",
      },
      { en: "Only level-order + preorder works", zh: "只有层序 + 前序可以" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Preorder + postorder does not work. When a node has only one child, both sequences look the same whether that child is the left one or the right one.",
        zh: "前序 + 后序不行:节点只有一个孩子时,不论那孩子是左是右,两种序列都长一个样。",
      },
      {
        en: "Two are enough, as long as one of them is the inorder. Only the inorder splits the remaining nodes into a left part and a right part around the root.",
        zh: "两种就够,关键是其中必须有中序:只有它能以根为界,把剩下的节点切成左右两半。",
      },
      {
        en: "Level-order + preorder has the same gap: neither one splits left from right. The classic working combinations are preorder or postorder (which identify the root) together with inorder (which splits the sides). Level-order + inorder also works, for the same reason.",
        zh: "层序 + 前序同样缺「切分左右」的能力。经典可行组合是前序或后序(定根)+ 中序(分左右);层序 + 中序同理也可以。",
      },
    ],
    why: {
      en: "Rebuilding a tree needs two things at every step: who is the root, and which nodes go to each side. The preorder gives the root as its first value and the postorder as its last, but only the inorder answers the second question, because everything left of the root in the inorder belongs to the left subtree. Preorder + postorder answers the first question twice and the second never: for a root 1 with a single child 2, the preorder is [1,2] and the postorder is [2,1] whether 2 is the left child or the right child.",
      zh: "恢复一棵树每一步需要两件事:谁是根,以及剩下的节点各归哪一侧。前序的第一个值和后序的最后一个值都能定根,但只有中序能回答第二件事 —— 中序里根左边的全是左子树。前序 + 后序把第一件事回答了两遍,第二件事一遍也没答:根 1 只带一个孩子 2 时,不论 2 是左孩子还是右孩子,前序都是 [1,2]、后序都是 [2,1]。",
    },
  },
];
