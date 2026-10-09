// Chapter 7 · Binary trees — problem set (English default / Chinese toggle).
// The closing quiz is in lib/binary-tree-quiz.tsx; /atlas imports only this file.
// Problems follow the theme "the answer for a tree = what the root does + the answer for the left
// subtree + the answer for the right subtree": bottom-up, top-down, BFS by level, construction and
// ancestor problems, closing with LC 124 to show that the return value ≠ the answer.
// Every key first states what the recursive function returns, then why the combining step is valid.

import type { Problem } from "@/lib/problems";

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
          <code>same(p.right, q.right)</code> 都为 true。较小那棵树的每个节点只访问一次,时间 O(n),栈空间 O(h)。这是「双树同步递归」的模板 —— LC 101(对称)
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
          陷阱:最小深度是到<b>叶子</b>的距离,而只有一个孩子的节点不是叶子。直接写 <code>1 + min(左, 右)</code> 会在这种节点上返回 1 —— 空的那侧报了 0。所以递归要特判:一侧为空时只能走另一侧。更干净的解法是 <b>BFS</b>:层序遍历,出队时遇到的第一个没有孩子的节点就是答案。它在第一个叶子处就停,不必像 DFS 那样把整棵树走完 —— 「求最浅」是 BFS 的主场,「求最深」才是 DFS 的。
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
          有一条就够。时间 O(n),栈空间 O(h)。判定必须发生在<b>叶子</b>上:不能在 rest 减到 0 时提前返回,因为下面可能还有节点继续加。这是「参数下传」型递归的最小样板 —— 参数装着祖先已经贡献的部分。
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
          <code>&quot;1-&gt;2-&gt;5&quot;</code> 收进结果。字符串参数在每次调用时被复制,每条分支各拿一份,不需要手动撤销;如果改用列表存路径,递归返回后必须把最后一个元素弹掉,兄弟分支才能从正确状态出发 ——
          这个「撤销」动作就是<b>回溯(backtracking)</b>,本题是它第一次露面。生成全部路径的时间是 O(n · h),因为路径字符串的总长度就是这个量级。
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
          <code>depth(null) = 0</code> —— 这是父节点需要的东西。<b>答案</b>是直径(按边数算),用递归之外的一个变量收集。在每个节点上,
          <code>depth(左) + depth(右)</code> 正是「在这里拐弯」的那条路径的边数,返回前拿它挑战一下最大值。而返回给父亲的是{" "}
          <code>1 + max(depth(左), depth(右))</code>:路径继续往上走时只能取一侧,不能分叉。每个节点访问一次,时间 O(n),栈空间 O(h)。LC 124 是同一形状的困难版。
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
          the same postorder pass. <b>What the function returns:</b> the height
          of the subtree counted in nodes (an empty tree is 0, a leaf is 1), or{" "}
          <code>-1</code> to mean &ldquo;something below is already
          unbalanced&rdquo;. Counting nodes here, rather than edges as the rest
          of this chapter does (where an empty tree is −1), is what leaves −1
          free for the signal. <b>Combination:</b> if either
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
          按节点数计的子树高度(空树为 0、叶子为 1),或者用 <code>−1</code> 表示「下面已经失衡了」。这里改按节点数计高度(本章其他地方按边数计,空树为 −1),正是为了把 −1 空出来当信号。
          <b>合并这一步:</b>任何一个孩子返回 −1 就立刻返回 −1;否则若{" "}
          <code>|左 − 右| &gt; 1</code> 返回 −1;否则返回{" "}
          <code>1 + max(左, 右)</code>。一趟走完,时间 O(n),栈空间 O(h)。「用一个特殊返回值携带失败信号」是自底向上递归的常用技巧。
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
          BFS:层序遍历,每层取<b>最后一个</b>节点,分层靠「先记 size」。DFS 版同样简短:按「根 → 右 → 左」的顺序遍历,并把当前深度当参数带下去,每个深度<b>第一次</b>到达的节点就是右视图,满足{" "}
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
          前序 = [根 | 左子树 | 右子树],中序 = [左子树 | 根 | 右子树]。每一轮:取前序的首元素当根,在中序区间里定位它,读出左半部分的长度 k;
          k 就告诉你前序里哪 k 个值属于左子树 —— 两边各自递归到更小的区间。每次都去中序里线性查找是最坏 O(n²);先用哈希表存好「值 → 下标」,每次查找降到 O(1),整体 O(n)。前提是节点值互不相同 —— 题目保证了这一点。
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
          <code>root.right</code>,沿 <code>right</code> 走到这条链的尾部,把尾部的 <code>right</code> 接上原来的右链,最后{" "}
          <code>root.left = null</code>。另有一种 Morris 风格的迭代写法,
          <b>额外空间 O(1)</b>:对每个节点,把右子树挂到左子树最右节点的下面,再把左子树整体移到右边。Morris 风格的做法是靠改写树里的指针来代替栈的;真正的 Morris <i>遍历</i>会把改动过的指针全部复原,而本题的改动本身就是要求的结果,所以保留。核心考点:
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
          <b>合并这一步:</b>左右都返回了非空 ⇒ p、q 分居两侧,当前节点就是最近公共祖先;只有一侧非空 ⇒ 把那一侧的结果原样上报。一趟后序,时间 O(n),栈空间 O(h)。它的正确性依赖题目的前提:<b>p 和 q 一定都在树里</b>。如果不保证,q 不存在时函数会把 p 返回上去。这题是全书讲「设计返回值语义」最好的一课:返回值不是答案本身,而是<b>携带足够信息、让父节点能下判断的信号</b>。
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
          <code>val + max(gain(左), gain(右), 0)</code>。这个 0 是与 543 最大的不同:总和为负的子树不如不要。<b>答案</b>单独收集:在每个节点上,
          <code>val + max(gain(左), 0) + max(gain(右), 0)</code> 是「在这里拐弯」的最优路径,用它挑战全局最大值。返回值只能带一条腿 ——
          路径经过 node 继续往上时不能分叉。时间 O(n),栈空间 O(h)。把 543、110、124 连着做完,「自底向上返回值 + 单独的全局答案」这一套就掌握了。
        </>
      ),
    },
  },
];
