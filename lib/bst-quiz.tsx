// Chapter 8 · Binary search trees — closing quiz (the problem set is in lib/bst-problems.tsx).
//
// Bilingual: every question, option and explanation is a { en, zh } pair.

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: (
        <>
          A tree: the root is 10, its left child is 5 and its right child is 15;
          the left child of 15 is 6 and its right child is 20. Every parent-child
          pair is fine (5&lt;10, 15&gt;10, 6&lt;15, 20&gt;15). Is it a BST?
        </>
      ),
      zh: (
        <>
          一棵树:根 10,左孩子 5,右孩子 15;15 的左孩子是 6、右孩子是 20。
          每对父子关系(5&lt;10、15&gt;10、6&lt;15、20&gt;15)都合规 —— 它是 BST 吗?
        </>
      ),
    },
    opts: [
      {
        en: "No. 6 sits in the right subtree of 10 but is smaller than 10, which breaks the rule about whole subtrees",
        zh: "不是 —— 6 在 10 的右子树里,却小于 10,违反「对整棵子树成立」的规矩",
      },
      {
        en: "Yes. It is enough that every parent-child pair satisfies left smaller, right larger",
        zh: "是,每对父子关系都满足「左小右大」就够了",
      },
      {
        en: "Yes. Any valid binary tree counts as a BST",
        zh: "是,只要它是一棵合法的二叉树,就能算 BST",
      },
      {
        en: "Cannot tell. You also need to check whether the height is balanced",
        zh: "无法判断,还要看树的高度是否平衡",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "The rule is about whole subtrees, not about parent and child. Every descendant in the right subtree must be larger than the root. 6 is deep inside the right subtree of 10, so it must also be larger than 10, and it is not.",
        zh: "BST 的规矩管的不是「父子」而是「整棵子树」:右子树的所有后代都必须大于根。6 藏在 10 的右子树深处,一样得大于 10 —— 它没做到。",
      },
      {
        en: "A BST is a binary tree plus an ordering rule. Break the rule and it is no longer a BST. A quick check: the in-order traversal of this tree is 5, 10, 6, 15, 20, and 6 comes after a larger value.",
        zh: "BST 是二叉树加上有序约束,约束被破坏就不再是 BST。验证方法:中序遍历这棵树得到 5, 10, 6, 15, 20 —— 6 处逆序了。",
      },
      {
        en: "Balance only affects performance, because it decides how large h is. It does not decide whether the tree is a BST. Breaking the ordering rule does.",
        zh: "平衡与否只影响性能(h 的大小),不影响「是不是 BST」;规矩被破坏才是定性问题。",
      },
    ],
    why: {
      en: "\"left < node < right\" applies recursively to the whole left and right subtree. That is why validating a BST means passing the bounds set by the ancestors down the tree (the core of LC 98). Checking only parent against child fails on exactly this example.",
      zh: "「左 < 根 < 右」对整棵左右子树递归成立,所以验证 BST 必须把祖先给出的上下界传下去(LC 98 的核心)。只查父子,必被这个反例击穿。",
    },
  },
  {
    type: "fill",
    q: {
      en: "Which traversal of a BST outputs the keys in ascending order? (Write the name of the traversal.)",
      zh: "对 BST 做哪种遍历,输出恰好是升序序列?(填遍历名称)",
    },
    placeholder: { en: "____ traversal", zh: "____遍历" },
    answers: ["中序", "中序遍历", "inorder", "in-order", "in order", "inorder traversal", "in-order traversal", "ldr"],
    hint: {
      en: "Left → node → right: first everything smaller than the root, then the root, then everything larger.",
      zh: "左 → 根 → 右:先输出所有比根小的,再输出根,最后输出所有比根大的。",
    },
    why: {
      en: "Every value in the left subtree is smaller than the node, and every value in the right subtree is larger, so expanding left-node-right recursively produces ascending order. This one property is the key to the k-th smallest, minimum difference, validation, and recovery problems.",
      zh: "左子树全体 < 根 < 右子树全体,按「左根右」递归展开自然升序。这条性质是 BST 一切「第 k 小 / 最小差 / 验证 / 恢复」题的总开关。",
    },
  },
  {
    type: "choice",
    q: {
      en: "You insert values one by one into an empty BST. Which order makes it degenerate into a chain?",
      zh: "往一棵空 BST 里依次插入,哪种顺序会让它退化成链表?",
    },
    opts: [
      { en: "1, 2, 3, 4, 5 (already sorted)", zh: "1, 2, 3, 4, 5(有序序列)" },
      { en: "3, 1, 4, 2, 5 (shuffled)", zh: "3, 1, 4, 2, 5(乱序)" },
      {
        en: "3, 2, 4, 1, 5 (middle first, then the sides)",
        zh: "3, 2, 4, 1, 5(先中间后两边)",
      },
      {
        en: "Any order. A BST always becomes a chain sooner or later",
        zh: "任何顺序都会退化,BST 迟早变成链表",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "With shuffled (random) input the expected height is O(log n). Values turn left and right in roughly equal measure, so the tree does not grow into a line.",
        zh: "乱序(随机)插入的期望高度是 O(log n) —— 每个值左拐右拐大致均匀,长不成一条线。",
      },
      {
        en: "This order puts the middle value at the root first and fills the two sides afterwards, which produces a fairly balanced tree.",
        zh: "这个顺序恰好先立中枢再填两翼,长出来的树相当平衡。",
      },
      {
        en: "Degeneration only happens when every step goes the same way, which is what sorted or nearly sorted input does. Random data does not have this problem.",
        zh: "退化只发生在「每次都往同一侧走」时,典型就是有序或接近有序的输入;随机数据没这个问题。",
      },
    ],
    why: {
      en: "With sorted input every new value is larger (or smaller) than everything already in the tree, so it always turns the same way. The tree leans into a chain, h = n − 1 (height counted in edges), and every operation degrades to O(n). This is exactly why AVL and red-black trees exist.",
      zh: "有序插入时,每个新值都比现有全部值大(或小),永远往同一边拐 —— 树斜成一条链,h = n − 1(树高按边数计),全部操作退化成 O(n)。这正是 AVL / 红黑树诞生的原因。",
    },
  },
  {
    type: "choice",
    q: {
      en: "What data structure backs TreeMap and TreeSet in Java?",
      zh: "Java 的 TreeMap / TreeSet,底层数据结构是?",
    },
    opts: [
      { en: "A red-black tree", zh: "红黑树" },
      { en: "A hash table", zh: "哈希表" },
      { en: "A sorted array with binary search", zh: "有序数组 + 二分" },
      { en: "An AVL tree", zh: "AVL 树" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A hash table backs HashMap and HashSet. It is fast but unordered, so it cannot offer firstKey, floorKey, or ordered iteration.",
        zh: "哈希表是 HashMap / HashSet 的底层 —— 快但无序,给不了 firstKey、floorKey 和有序遍历。",
      },
      {
        en: "A sorted array searches quickly, but inserting or deleting means shifting elements, O(n). TreeMap inserts and deletes in O(log n).",
        zh: "有序数组查得快,但插入删除要 O(n) 搬移元素 —— TreeMap 的增删是 O(log n)。",
      },
      {
        en: "AVL is the textbook favorite, but production libraries (Java, C++ std::map, the Linux kernel) generally choose the red-black tree, which rotates less and is friendlier to writes.",
        zh: "AVL 是教材明星,但工程界(Java、C++ std::map、Linux 内核)普遍选旋转更少、写入更友好的红黑树。",
      },
    ],
    why: {
      en: "A red-black tree does not aim for perfect balance. It only guarantees that the longest path is at most twice the shortest, which keeps insert, delete, and search at O(log n) while each update needs only a small constant number of rotations.",
      zh: "红黑树不追求完美平衡,只保证最长路径不超过最短路径的两倍 —— 增删查稳定 O(log n),而每次更新只需常数次旋转,写入代价更小。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In an interview, what is the most precise way to state the time complexity of search in a BST?",
      zh: "面试里描述 BST 查找的时间复杂度,最严谨的说法是?",
    },
    opts: [
      {
        en: "O(h), where h is between log n (balanced) and n (degenerate)",
        zh: "O(h),h 介于 log n(平衡)与 n(退化)之间",
      },
      {
        en: "O(log n). A BST exists to give log n",
        zh: "O(log n),BST 就是为 log n 而生的",
      },
      {
        en: "O(n). Stating the worst case is the safe answer",
        zh: "O(n),按最坏情况说才保险",
      },
      {
        en: "O(1). Lookups in an ordered structure are constant time",
        zh: "O(1),有序结构的查找都是常数",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "log n only holds while the tree is balanced. A plain BST with no rebalancing degrades to O(n) on sorted input.",
        zh: "log n 只在树平衡时成立 —— 不带自平衡机制的裸 BST,遇到有序输入就退化成 O(n)。",
      },
      {
        en: "Reporting only O(n) throws away the whole point of a BST. The interviewer wants to hear you separate the balanced case from the degenerate one.",
        zh: "只报 O(n) 抹掉了 BST 的全部价值;面试官想听你区分「平衡时」与「退化时」两个极端。",
      },
      {
        en: "O(1) belongs to hash tables. Each comparison in a BST discards one subtree, so you still walk a whole path from the root down to the target.",
        zh: "O(1) 是哈希表的领域;BST 每次比较只砍掉一棵子树,至少要走一条从根到目标的路径。",
      },
    ],
    why: {
      en: "Search, insert, and delete all follow one path from the root downwards, so the cost is the length of that path, O(h). Add one sentence — \"in production a red-black tree keeps h at O(log n)\" — and the answer is complete.",
      zh: "查找、插入、删除都沿一条从根向下的路径走,代价 = 路径长 = O(h)。补一句「工程用红黑树把 h 钉在 O(log n)」,答案就完整了。",
    },
  },
  {
    type: "choice",
    q: {
      en: "You delete a node that has two children. Which node takes its place?",
      zh: "删除一个「有两个孩子」的节点,标准做法是用谁顶替它?",
    },
    opts: [
      {
        en: "The in-order successor (the smallest value in the right subtree), or symmetrically the in-order predecessor (the largest value in the left subtree)",
        zh: "中序后继(右子树最小值),或对称地用中序前驱(左子树最大值)",
      },
      { en: "Its left child, linked up directly", zh: "它的左孩子,直接接上来" },
      { en: "Its right child, linked up directly", zh: "它的右孩子,直接接上来" },
      { en: "Any leaf node will do", zh: "随便挑一个叶子节点补位" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "If the left child moves up, it brings its own right subtree with it, and the deleted node's right subtree has nowhere to go. Linking a child up directly only works when the node has exactly one child.",
        zh: "左孩子顶上后,它自己的右子树和被删节点原来的右子树没地方同时挂 —— 直接接孩子只适用于「单孩子」的情况。",
      },
      {
        en: "Same problem in mirror image: the right child brings its own left subtree, and the deleted node's left subtree has nowhere to go.",
        zh: "同理:右孩子顶上后,它的左子树和被删节点的左子树冲突,一样挂不下。",
      },
      {
        en: "An arbitrary leaf almost certainly fails the requirement of being larger than everything on the left and smaller than everything on the right, so the ordering breaks immediately.",
        zh: "随便一个叶子的值大概率不满足「比左子树全体大、比右子树全体小」,约束立即被破坏。",
      },
    ],
    why: {
      en: "The in-order successor is the next value above the deleted one, so after it moves up everything on the left is still smaller and everything remaining on the right is still larger. It is also the leftmost node of the right subtree, so it has no left child, and deleting it falls back to the leaf or one-child case. One swap turns the hard case into an easy one.",
      zh: "中序后继是「恰好比被删值大的下一个数」:它顶上后,左边仍全小、右边剩下的仍全大;而且它是右子树最左端,必无左孩子,删它会落回叶子或单孩子的简单情况 —— 一次替换把难题降级。",
    },
  },
  {
    type: "multi",
    q: {
      en: "In which situations should you choose TreeMap (an ordered map) over HashMap? (Select all that apply.)",
      zh: "哪些场景应该选 TreeMap(有序映射)而不是 HashMap?(多选)",
    },
    opts: [
      {
        en: "You need to iterate over all entries in key order",
        zh: "需要按 key 有序遍历所有条目",
      },
      {
        en: "You need floorKey / ceilingKey (the nearest key at or below / above a value)",
        zh: "需要 floorKey / ceilingKey(找 ≤ / ≥ 某值的最近 key)",
      },
      {
        en: "You only need single-key reads and writes to be as fast as possible",
        zh: "只需要尽可能快的单点存取",
      },
      {
        en: "You need range queries (all keys inside an interval)",
        zh: "需要范围查询(取出某区间内的所有 key)",
      },
    ],
    correct: [0, 1, 3],
    missHint: {
      en: "Ordered iteration, floor and ceiling, and range queries all depend on the tree keeping its keys in order. Check which one you left out.",
      zh: "有序遍历、地板 / 天花板、范围查询 —— 这三件事全靠「树把 key 排好序」才做得到,再看看漏了哪个。",
    },
    extraHint: {
      en: "Single-key access is exactly where HashMap wins: O(1) on average against O(log n). Take that option out of the answer.",
      zh: "单点存取恰恰是 HashMap 的主场:平均 O(1) 对 TreeMap 的 O(log n) —— 把它从答案里去掉。",
    },
    why: {
      en: "The deciding question is ordering, not speed. If you only ask \"is this key present\" or \"what is its value\", use a hash table. If the requirement mentions order, range, nearest, or k-th, use an ordered structure such as TreeMap or SortedList.",
      zh: "选型的分界线是「要不要顺序」,不是「谁更快」:只问「存不存在 / 对应值是什么」→ 哈希表;需求里带「顺序、范围、最近、第 k」→ 有序结构(TreeMap / SortedList)。",
    },
  },
];
