// 第 7 章 · 二叉树 —— 题单与测验数据(English default / 中文可切换)。
// 题单沿「一棵树的答案 = 根怎么办 + 左子树的答案 + 右子树的答案」展开:
// 自底向上、自顶向下、BFS 分层、构造与祖先问题,压轴 124 展示「返回值 ≠ 答案」。
// 每道题的 key 都先说清「递归函数返回什么」,再说「合并这一步为什么成立」。

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

export const PROBLEMS: Problem[] = [
  {
    lc: 100,
    title: { en: "Same Tree", zh: "相同的树" },
    d: "easy",
    tags: [
      { en: "Recursion", zh: "递归" },
      { en: "Two trees at once", zh: "双树同步" },
    ],
    hint: {
      en: "Two trees are the same when the roots are the same and the left subtrees are the same and the right subtrees are the same. Write that sentence as code.",
      zh: "两棵树相同 = 根相同 + 左子树相同 + 右子树相同。把这句定义直接翻译成代码。",
    },
    key: {
      en: (
        <>
          <b>What the function returns:</b> <code>same(p, q)</code> returns true
          when the two subtrees rooted at p and q have the same shape and the
          same values. <b>Base cases:</b> both null is true; exactly one null is
          false. <b>Combination:</b> the values must be equal, and{" "}
          <code>same(p.left, q.left)</code> and{" "}
          <code>same(p.right, q.right)</code> must both be true. Every node of
          the smaller tree is visited once, so the cost is O(n) time and O(h)
          stack space. This is the template for &ldquo;recurse on two trees at
          the same time&rdquo;: LC 101 changes it to compare left against right,
          and LC 572 wraps one more loop around it.
        </>
      ),
      zh: (
        <>
          <b>返回值的含义:</b>
          <code>same(p, q)</code> 返回「以 p、q 为根的两棵子树形状相同且值相同」。
          <b>终止条件:</b>两个都空 → true;只有一个空 → false。
          <b>合并这一步:</b>值必须相等,并且{" "}
          <code>same(p.left, q.left)</code> 与{" "}
          <code>same(p.right, q.right)</code> 都为 true。较小那棵树的每个节点只访问一次,
          时间 O(n),栈空间 O(h)。这是「双树同步递归」的模板 —— LC 101(对称)
          把它改成左对右的镜像版,LC 572(子树)在外面再套一层。
        </>
      ),
    },
  },
  {
    lc: 111,
    title: { en: "Minimum Depth of Binary Tree", zh: "二叉树的最小深度" },
    d: "easy",
    tags: [
      { en: "BFS is better here", zh: "BFS 更优" },
      { en: "Leaf trap", zh: "叶子陷阱" },
    ],
    hint: {
      en: "Can you take LC 104 and change max to min? Be careful: if a node has only one child, does the empty side count as a path?",
      zh: "把 104 的 max 改成 min 就行?小心:只有一个孩子的节点,空的那侧算不算一条「路」?",
    },
    key: {
      en: (
        <>
          The trap: minimum depth is the distance to the nearest <b>leaf</b>,
          and a node with one child is not a leaf. Plain{" "}
          <code>1 + min(left, right)</code> would return 1 for such a node,
          because the empty side reports 0. So the recursion needs a special
          case: when one side is null, follow the other side only. The cleaner
          answer is <b>BFS</b>. Traverse level by level and return as soon as
          you dequeue the first node with no children. It stops at the first
          leaf instead of walking the whole tree, which is why &ldquo;find the
          shallowest&rdquo; suits BFS and &ldquo;find the deepest&rdquo; suits
          DFS.
        </>
      ),
      zh: (
        <>
          陷阱:最小深度是到<b>叶子</b>的距离,而只有一个孩子的节点不是叶子。
          直接写 <code>1 + min(左, 右)</code> 会在这种节点上返回 1 —— 空的那侧报了 0。
          所以递归要特判:一侧为空时只能走另一侧。更干净的解法是 <b>BFS</b>:
          层序遍历,出队时遇到的第一个没有孩子的节点就是答案。它在第一个叶子处就停,
          不必像 DFS 那样把整棵树走完 —— 「求最浅」是 BFS 的主场,「求最深」才是 DFS 的。
        </>
      ),
    },
  },
  {
    lc: 112,
    title: { en: "Path Sum", zh: "路径总和" },
    d: "easy",
    tags: [
      { en: "Top-down", zh: "自顶向下" },
      { en: "State in the parameter", zh: "带参下传" },
    ],
    hint: {
      en: "Carry the remaining sum down as a parameter. Subtract each node value on the way. At a leaf, check what is left.",
      zh: "把「还差多少」当参数一路往下传,每经过一个节点就扣掉它的值 —— 到叶子时看剩多少。",
    },
    key: {
      en: (
        <>
          <b>What the function returns:</b>{" "}
          <code>hasPath(node, rest)</code> returns true when some root-to-leaf
          path inside this subtree adds up to <code>rest</code>.{" "}
          <b>Base cases:</b> a null node returns false; a leaf returns{" "}
          <code>rest == node.val</code>. <b>Combination:</b>{" "}
          <code>hasPath(left, rest - val) || hasPath(right, rest - val)</code>,
          because one path is enough. Cost O(n) time, O(h) stack space. The
          check must happen <b>at a leaf</b>. You cannot return true as soon as
          rest reaches 0, because nodes below may still add more. This is the
          smallest example of the top-down form, where the parameter carries
          what the ancestors already contributed.
        </>
      ),
      zh: (
        <>
          <b>返回值的含义:</b>
          <code>hasPath(node, rest)</code> 返回「这棵子树里存在一条根到叶的路径,和恰为
          rest」。<b>终止条件:</b>空节点返回 false;叶子返回{" "}
          <code>rest == node.val</code>。<b>合并这一步:</b>
          <code>hasPath(左, rest − val) || hasPath(右, rest − val)</code> ——
          有一条就够。时间 O(n),栈空间 O(h)。判定必须发生在<b>叶子</b>上:
          不能在 rest 减到 0 时提前返回,因为下面可能还有节点继续加。
          这是「参数下传」型递归的最小样板 —— 参数装着祖先已经贡献的部分。
        </>
      ),
    },
  },
  {
    lc: 257,
    title: { en: "Binary Tree Paths", zh: "二叉树的所有路径" },
    d: "easy",
    tags: [
      { en: "Top-down", zh: "自顶向下" },
      { en: "Collecting paths", zh: "路径收集" },
    ],
    hint: {
      en: "Walk down from the root and carry the values seen so far in a parameter. At a leaf, put the whole string into the answer.",
      zh: "从根往下走,把沿途的值放在参数里带下去;到叶子就把整串收进答案。",
    },
    key: {
      en: (
        <>
          DFS with one extra parameter: the path built so far. At a leaf, join
          it into <code>&quot;1-&gt;2-&gt;5&quot;</code> and append it to the
          result list. A string parameter is copied on each call, so each branch
          gets its own copy and nothing needs to be undone. If you keep the path
          in a list instead, you must remove the last element after the
          recursive call returns, so that the sibling branch starts from the
          correct state. That undo step is <b>backtracking</b>, and this problem
          is the first place it appears. Building all paths costs O(n · h) time,
          because the strings themselves have total length on that order.
        </>
      ),
      zh: (
        <>
          DFS 多带一个参数:目前拼好的路径。到叶子时拼成{" "}
          <code>&quot;1-&gt;2-&gt;5&quot;</code> 收进结果。字符串参数在每次调用时被复制,
          每条分支各拿一份,不需要手动撤销;如果改用列表存路径,
          递归返回后必须把最后一个元素弹掉,兄弟分支才能从正确状态出发 ——
          这个「撤销」动作就是<b>回溯(backtracking)</b>,本题是它第一次露面。
          生成全部路径的时间是 O(n · h),因为路径字符串的总长度就是这个量级。
        </>
      ),
    },
  },
  {
    lc: 543,
    title: { en: "Diameter of Binary Tree", zh: "二叉树的直径" },
    d: "easy",
    tags: [
      { en: "Bottom-up", zh: "自底向上" },
      { en: "Return value is not the answer", zh: "返回值≠答案" },
    ],
    hint: {
      en: "The longest path through one node goes down the left side and down the right side. Every node could be that turning point.",
      zh: "经过某个节点的最长路径 = 左边往下 + 右边往下。每个节点都可能是那个「拐点」。",
    },
    key: {
      en: (
        <>
          This is the classic case where the returned value and the answer are{" "}
          <b>two different things</b>. <b>What the function returns:</b>{" "}
          <code>depth(node)</code> returns the number of nodes on the longest
          downward path starting at node, with <code>depth(null) = 0</code>.
          That is what the parent needs. <b>The answer</b> is the diameter,
          measured in edges, and it is kept in a variable outside the recursion.
          At each node, <code>depth(left) + depth(right)</code> is the number of
          edges of the longest path that turns at this node, so compare it with
          the stored maximum before returning. Returning{" "}
          <code>1 + max(depth(left), depth(right))</code> is correct for the
          parent, because a path continuing upward can only use one of the two
          sides. Each node is visited once: O(n) time, O(h) stack space. LC 124
          is the hard version of the same shape.
        </>
      ),
      zh: (
        <>
          这是「返回值和答案<b>不是同一个东西</b>」最经典的例子。
          <b>返回值的含义:</b>
          <code>depth(node)</code> 返回「从 node 往下延伸的最长路径上有几个节点」,
          <code>depth(null) = 0</code> —— 这是父节点需要的东西。<b>答案</b>是直径
          (按边数算),用递归之外的一个变量收集。在每个节点上,
          <code>depth(左) + depth(右)</code> 正是「在这里拐弯」的那条路径的边数,
          返回前拿它挑战一下最大值。而返回给父亲的是{" "}
          <code>1 + max(depth(左), depth(右))</code>:路径继续往上走时只能取一侧,
          不能分叉。每个节点访问一次,时间 O(n),栈空间 O(h)。LC 124 是同一形状的困难版。
        </>
      ),
    },
  },
  {
    lc: 110,
    title: { en: "Balanced Binary Tree", zh: "平衡二叉树" },
    d: "easy",
    tags: [
      { en: "Bottom-up", zh: "自底向上" },
      { en: "Early exit", zh: "剪枝" },
    ],
    hint: {
      en: "Compute heights from the bottom up. As soon as one node has left and right heights differing by more than 1, send that failure all the way up.",
      zh: "自底向上算高度,一旦某个节点左右高度差超过 1,就把「失败」信号一路上报。",
    },
    key: {
      en: (
        <>
          The naive version calls a separate height function at every node, so
          heights are computed again and again: O(n²) in the worst case.{" "}
          <b>The fix:</b> compute the height and check the balance condition in
          the same postorder pass. <b>What the function returns:</b> the real
          height of the subtree, or <code>-1</code> to mean &ldquo;something
          below is already unbalanced&rdquo;. <b>Combination:</b> if either
          child returned -1, return -1 immediately; otherwise, if{" "}
          <code>|left - right| &gt; 1</code>, return -1; otherwise return{" "}
          <code>1 + max(left, right)</code>. One pass, O(n) time, O(h) stack
          space. Using a special return value to carry a failure signal is a
          common trick in bottom-up recursion.
        </>
      ),
      zh: (
        <>
          朴素做法在每个节点都单独调一次求高度的函数,高度被反复重算,最坏 O(n²)。
          <b>改法:</b>在同一次后序遍历里既算高度、又判平衡。<b>返回值的含义:</b>
          子树的真实高度,或者用 <code>−1</code> 表示「下面已经失衡了」。
          <b>合并这一步:</b>任何一个孩子返回 −1 就立刻返回 −1;否则若{" "}
          <code>|左 − 右| &gt; 1</code> 返回 −1;否则返回{" "}
          <code>1 + max(左, 右)</code>。一趟走完,时间 O(n),栈空间 O(h)。
          「用一个特殊返回值携带失败信号」是自底向上递归的常用技巧。
        </>
      ),
    },
  },
  {
    lc: 199,
    title: { en: "Binary Tree Right Side View", zh: "二叉树的右视图" },
    d: "medium",
    tags: [
      { en: "BFS by level", zh: "BFS 分层" },
      { en: "DFS visit order", zh: "DFS 优先级" },
    ],
    hint: {
      en: "Looking from the right, you see the rightmost node of each level. Which traversal hands you the nodes level by level?",
      zh: "从右边看,看到的是每一层最右边的那个节点 —— 哪种遍历天然按层把节点交给你?",
    },
    key: {
      en: (
        <>
          BFS: traverse level by level and keep the <b>last</b> node of each
          level, using the record-the-size trick to know where a level ends. The
          DFS version is just as short: visit in the order root, right, left,
          and carry the current depth as a parameter. The first node reached at
          each depth is the one visible from the right, so append it when{" "}
          <code>depth == result.size()</code>. Both are O(n) time; BFS uses O(w)
          queue space and DFS uses O(h) stack space. Interviewers often ask for
          the second one after you give the first.
        </>
      ),
      zh: (
        <>
          BFS:层序遍历,每层取<b>最后一个</b>节点,分层靠「先记 size」。
          DFS 版同样简短:按「根 → 右 → 左」的顺序遍历,并把当前深度当参数带下去,
          每个深度<b>第一次</b>到达的节点就是右视图,满足{" "}
          <code>depth == 结果长度</code> 时收进答案。两者时间都是 O(n);
          BFS 吃 O(w) 队列空间,DFS 吃 O(h) 栈空间。面试常在你答完一种后追问另一种。
        </>
      ),
    },
  },
  {
    lc: 105,
    title: {
      en: "Construct Binary Tree from Preorder and Inorder Traversal",
      zh: "从前序与中序遍历序列构造二叉树",
    },
    d: "medium",
    tags: [
      { en: "Divide and conquer", zh: "分治" },
      { en: "Hash map lookup", zh: "哈希加速" },
    ],
    hint: {
      en: "The first value of the preorder is the root. Find that value in the inorder: everything left of it is the left subtree, everything right of it is the right subtree.",
      zh: "前序的第一个值就是根。拿着它去中序里一分为二:左边全是左子树,右边全是右子树。",
    },
    key: {
      en: (
        <>
          preorder is [root | left subtree | right subtree] and inorder is [left
          subtree | root | right subtree]. Each call takes the first preorder
          value as the root, locates it in the inorder range, and reads the size
          k of the left part. That k tells you which k preorder values belong to
          the left subtree, so both sides can recurse on smaller ranges.
          Scanning the inorder range every time gives O(n²) in the worst case;
          storing value to index in a hash map first makes each lookup O(1) and
          the whole build O(n). The values must be unique for this to work,
          which the problem guarantees.
        </>
      ),
      zh: (
        <>
          前序 = [根 | 左子树 | 右子树],中序 = [左子树 | 根 | 右子树]。
          每一轮:取前序的首元素当根,在中序区间里定位它,读出左半部分的长度 k;
          k 就告诉你前序里哪 k 个值属于左子树 —— 两边各自递归到更小的区间。
          每次都去中序里线性查找是最坏 O(n²);先用哈希表存好「值 → 下标」,
          每次查找降到 O(1),整体 O(n)。前提是节点值互不相同 —— 题目保证了这一点。
        </>
      ),
    },
  },
  {
    lc: 114,
    title: { en: "Flatten Binary Tree to Linked List", zh: "二叉树展开为链表" },
    d: "medium",
    tags: [
      { en: "Postorder thinking", zh: "后序思维" },
      { en: "Rewire in place", zh: "原地重排" },
    ],
    hint: {
      en: "The required order is exactly the preorder. Think backwards: if both subtrees are already flattened, how should the root connect them?",
      zh: "展开后的顺序恰好是前序。倒着想:如果左右子树都已经各自展开好了,根该怎么把它们接起来?",
    },
    key: {
      en: (
        <>
          Bottom-up. Flatten the left and right subtrees first, then join them
          in three assignments: set <code>root.right</code> to the flattened
          left chain, walk that chain along <code>right</code> to its tail, set
          the tail&rsquo;s <code>right</code> to the old right chain, and set{" "}
          <code>root.left = null</code>. There is also an iterative version in
          the style of Morris traversal that uses <b>O(1) extra space</b>: for
          each node, attach its right subtree under the rightmost node of its
          left subtree, then move the left subtree to the right. Morris-style
          code works by rewriting pointers in the tree itself instead of using a
          stack. A Morris <i>traversal</i> restores every pointer it changes; in
          this problem the rewiring is the required output, so it stays. The
          teaching point: trust that the recursion has finished the subproblems,
          and design only the merge step.
        </>
      ),
      zh: (
        <>
          自底向上:先递归展开左、右子树,再用三步接线 —— 把展开好的左链接到{" "}
          <code>root.right</code>,沿 <code>right</code> 走到这条链的尾部,
          把尾部的 <code>right</code> 接上原来的右链,最后{" "}
          <code>root.left = null</code>。另有一种 Morris 风格的迭代写法,
          <b>额外空间 O(1)</b>:对每个节点,把右子树挂到左子树最右节点的下面,
          再把左子树整体移到右边。Morris 风格的做法是靠改写树里的指针来代替栈的;
          真正的 Morris <i>遍历</i>会把改动过的指针全部复原,
          而本题的改动本身就是要求的结果,所以保留。核心考点:
          <b>信任递归已经把子问题做完,只设计「合并」这一步</b>。
        </>
      ),
    },
  },
  {
    lc: 236,
    title: {
      en: "Lowest Common Ancestor of a Binary Tree",
      zh: "二叉树的最近公共祖先",
    },
    d: "medium",
    tags: [
      { en: "Postorder", zh: "后序" },
      { en: "Information flows up", zh: "信息上传" },
      { en: "Must know", zh: "必会" },
    ],
    hint: {
      en: "Ask every subtree one question: are p or q inside you? The two answers tell you where the paths split.",
      zh: "问每棵子树同一个问题:「p、q 在你这儿吗?」左右两个回答就能定位分岔点。",
    },
    key: {
      en: (
        <>
          <b>What the function returns:</b> <code>lca(node)</code> returns null
          if neither p nor q is in this subtree; it returns the lowest common
          ancestor if <b>both</b> are in this subtree; otherwise it returns
          whichever of p or q it found. <b>Base cases:</b> a null node returns
          null, and a node equal to p or q returns itself. <b>Combination:</b>{" "}
          if both children returned something, p and q are on opposite sides, so
          this node is the lowest common ancestor; if only one side returned
          something, pass that result up unchanged. One postorder pass, O(n)
          time, O(h) stack space. The correctness relies on the problem&rsquo;s
          guarantee that <b>both p and q exist in the tree</b>. Without it, the
          function could return p while q is absent. This is the best lesson in
          the book on designing the meaning of a return value: the value is not
          the final answer, it is a signal that carries enough information for
          the parent to decide.
        </>
      ),
      zh: (
        <>
          <b>返回值的含义:</b>
          <code>lca(node)</code> 在这棵子树里既没有 p 也没有 q 时返回 null;
          <b>两个都在</b>时返回最近公共祖先;只找到其中一个时返回找到的那一个。
          <b>终止条件:</b>空节点返回 null;节点本身是 p 或 q 就返回自己。
          <b>合并这一步:</b>左右都返回了非空 ⇒ p、q 分居两侧,当前节点就是最近公共祖先;
          只有一侧非空 ⇒ 把那一侧的结果原样上报。一趟后序,时间 O(n),栈空间 O(h)。
          它的正确性依赖题目的前提:<b>p 和 q 一定都在树里</b>。
          如果不保证,q 不存在时函数会把 p 返回上去。这题是全书讲「设计返回值语义」
          最好的一课:返回值不是答案本身,而是<b>携带足够信息、让父节点能下判断的信号</b>。
        </>
      ),
    },
  },
  {
    lc: 124,
    title: { en: "Binary Tree Maximum Path Sum", zh: "二叉树中的最大路径和" },
    d: "hard",
    tags: [
      { en: "Bottom-up", zh: "自底向上" },
      { en: "Return value is not the answer", zh: "返回值≠答案" },
    ],
    hint: {
      en: "The hard version of LC 543. Each node can be the turning point, but a path continuing upward can only use one side. A negative side is worth nothing, so drop it.",
      zh: "543 直径的困难版:每个节点都可能是「拐点」,但往上走只能带一条腿 —— 负数的那条腿干脆不要。",
    },
    key: {
      en: (
        <>
          <b>What the function returns:</b> <code>gain(node)</code> returns the
          largest sum of a path that starts at node and goes{" "}
          <b>downward only, in one direction</b>, which is{" "}
          <code>val + max(gain(left), gain(right), 0)</code>. The 0 is the
          difference from LC 543: a subtree with a negative total is better left
          out. <b>The answer</b> is tracked separately: at each node,{" "}
          <code>val + max(gain(left), 0) + max(gain(right), 0)</code> is the
          best path that turns here, and that value challenges the global
          maximum. The return value can only carry one side, because a path
          passing through node on its way up cannot branch. O(n) time, O(h)
          stack space. Solve 543, 110, and 124 in a row and the pattern
          &ldquo;bottom-up return value plus a separate global answer&rdquo; is
          yours.
        </>
      ),
      zh: (
        <>
          <b>返回值的含义:</b>
          <code>gain(node)</code> 返回「从 node 出发、<b>只向下、只走一个方向</b>
          的路径的最大和」,即{" "}
          <code>val + max(gain(左), gain(右), 0)</code>。这个 0 是与 543 最大的不同:
          总和为负的子树不如不要。<b>答案</b>单独收集:在每个节点上,
          <code>val + max(gain(左), 0) + max(gain(右), 0)</code> 是「在这里拐弯」
          的最优路径,用它挑战全局最大值。返回值只能带一条腿 ——
          路径经过 node 继续往上时不能分叉。时间 O(n),栈空间 O(h)。
          把 543、110、124 连着做完,「自底向上返回值 + 单独的全局答案」这一套就掌握了。
        </>
      ),
    },
  },
];

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
      en: "The invariant of BFS: at any moment the queue holds nodes from at most two neighbouring levels, and nodes of the same level are queued left to right. Dequeue one node, enqueue its children at the back, and first in, first out guarantees a whole level leaves before the next one starts. To split the output into levels, record the queue size before the inner loop and dequeue exactly that many nodes. This is the queue from chapter 05 doing real work.",
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
