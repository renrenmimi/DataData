// Chapter 3 · Linked lists — problem set and quiz data (English default / Chinese toggle).
// Problems cover deletion/traversal, fast-and-slow pointers, dummy sentinels, reversal, and doubly
// linked list synthesis, ramping from Easy to Hard;
// hint points a direction without spoilers, key explains the optimal solution in one paragraph.

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

export const PROBLEMS: Problem[] = [
  {
    lc: 83,
    title: {
      en: "Remove Duplicates from Sorted List",
      zh: "删除排序链表中的重复元素",
    },
    d: "easy",
    tags: [
      { en: "Traversal", zh: "遍历" },
      { en: "Deletion", zh: "删除" },
    ],
    hint: {
      en: "The list is sorted, so equal values are always next to each other. Stand on cur and compare it with cur.next.",
      zh: "链表有序,相等的值一定挨在一起。站在 cur 上,比较 cur 和 cur.next。",
    },
    key: {
      en: (
        <>
          One pointer, one pass. If <code>cur.val == cur.next.val</code>, set{" "}
          <code>cur.next = cur.next.next</code> to skip the duplicate and{" "}
          <b>do not move cur</b>, because the next node may be a duplicate too.
          Otherwise move cur forward. The head is never deleted here, so this
          problem does not need a dummy node. Time O(n), space O(1).
        </>
      ),
      zh: (
        <>
          单指针一次遍历。若 <code>cur.val == cur.next.val</code>,就{" "}
          <code>cur.next = cur.next.next</code> 绕过重复节点,并且{" "}
          <b>cur 原地不动</b> —— 后面可能还连着重复;否则 cur 前进一格。
          头节点永远不会被删,所以这题不需要 dummy。时间 O(n),空间 O(1)。
        </>
      ),
    },
  },
  {
    lc: 203,
    title: { en: "Remove Linked List Elements", zh: "移除链表元素" },
    d: "easy",
    tags: [
      { en: "Dummy node", zh: "dummy 哨兵" },
      { en: "Deletion", zh: "删除" },
    ],
    hint: {
      en: "The value you delete may sit in the head node, and the head has no predecessor. That is exactly what a dummy node is for.",
      zh: "要删的值可能出现在头节点,而头节点没有前驱 —— 这正是 dummy 哨兵存在的理由。",
    },
    key: {
      en: (
        <>
          Create a dummy node whose next is head, and start cur at the dummy. If{" "}
          <code>cur.next.val == val</code>, set{" "}
          <code>cur.next = cur.next.next</code>; otherwise move cur forward.
          With the dummy in place, deleting the head and deleting a middle node
          are the same line of code, which is the comparison shown in §04.
          Return <code>dummy.next</code>, not head, because the head may have
          been removed.
        </>
      ),
      zh: (
        <>
          建一个 dummy,让它的 next 指向 head,cur 从 dummy 出发。若{" "}
          <code>cur.next.val == val</code> 就 <code>cur.next = cur.next.next</code>
          ,否则 cur 前进。有了 dummy,「删头」和「删中间」是同一行代码 ——
          就是 §04 那组对照示例。最后返回 <code>dummy.next</code> 而不是 head,
          因为原来的头可能已经被删掉了。
        </>
      ),
    },
  },
  {
    lc: 876,
    title: { en: "Middle of the Linked List", zh: "链表的中间结点" },
    d: "easy",
    tags: [{ en: "Fast and slow pointers", zh: "快慢指针" }],
    hint: {
      en: "How do you find the middle in a single pass? Start two pointers together and let one move twice as fast.",
      zh: "一次遍历怎么找中点?两个指针同时出发,让其中一个每步走两格。",
    },
    key: {
      en: (
        <>
          Fast and slow pointers. Both start at head; slow moves one node per
          step and fast moves two, with the loop condition{" "}
          <code>fast != null &amp;&amp; fast.next != null</code>. When fast can
          no longer move, slow is at the middle. For an <b>even</b> length this
          form stops on the <b>second</b> of the two middle nodes, which is what
          this problem asks for. If you need the first middle instead (to cut
          the list into halves), loop on{" "}
          <code>fast.next != null &amp;&amp; fast.next.next != null</code>. Time
          O(n), space O(1).
        </>
      ),
      zh: (
        <>
          快慢指针。两者都从 head 出发,slow 每步 1 格、fast 每步 2 格,循环条件{" "}
          <code>fast != null &amp;&amp; fast.next != null</code>。fast 走不动时,
          slow 正好停在中点。长度为<b>偶数</b>时,这种写法停在两个中点里的
          <b>第二个</b>,正合本题要求。如果你要的是第一个中点(比如把链表切成两半),
          循环条件改成{" "}
          <code>fast.next != null &amp;&amp; fast.next.next != null</code>。
          时间 O(n),空间 O(1)。
        </>
      ),
    },
  },
  {
    lc: 160,
    title: {
      en: "Intersection of Two Linked Lists",
      zh: "相交链表",
    },
    d: "easy",
    tags: [
      { en: "Two pointers", zh: "双指针" },
      { en: "Path swap", zh: "路径互换" },
    ],
    hint: {
      en: "The two lists have different lengths, so the pointers are not aligned. Let each pointer walk its own list first, then the other one.",
      zh: "两条链长度不同,指针对不齐。那就让每个指针先走完自己的链,再去走对方的链。",
    },
    key: {
      en: (
        <>
          Start pA at the head of list A and pB at the head of list B. When a
          pointer reaches the end, move it to the head of the <b>other</b> list.
          Each pointer then walks lenA + lenB nodes in total, so after at most
          that many steps they are at the same distance from the end. They meet
          at the intersection node, or both become null when the lists do not
          intersect. No length counting and no hash set. Time O(n + m), space
          O(1).
        </>
      ),
      zh: (
        <>
          pA 从 A 链头出发,pB 从 B 链头出发;谁走到尾,就跳到<b>另一条</b>链的头继续走。
          于是两个指针走过的总长度都是 lenA + lenB,走完之后它们距离链尾一样远。
          结果只有两种:在交点相遇,或者同时变成 null(不相交)。既不用数长度,
          也不用哈希表。时间 O(n + m),空间 O(1)。
        </>
      ),
    },
  },
  {
    lc: 234,
    title: { en: "Palindrome Linked List", zh: "回文链表" },
    d: "easy",
    tags: [
      { en: "Fast and slow pointers", zh: "快慢指针" },
      { en: "Reversal", zh: "反转" },
      { en: "Combination", zh: "综合" },
    ],
    hint: {
      en: "A singly linked list cannot be walked backwards. But you already have two parts: find the middle, and reverse a list.",
      zh: "单链表没法从尾往头走 —— 但「找中点」和「反转」两个零件你已经会了,拼起来试试。",
    },
    key: {
      en: (
        <>
          Three steps. Find the middle with fast and slow pointers, reverse the
          second half, then compare the two halves node by node from their
          heads. Time O(n), space O(1), which beats copying the values into an
          array and using two pointers (O(n) extra space). The list is modified,
          so a careful answer reverses the second half back before returning.
        </>
      ),
      zh: (
        <>
          三步组合:快慢指针找中点 → 反转后半段 → 两个指针分别从两段的头部同步比较。
          时间 O(n),空间 O(1),比「把值拷进数组再左右对撞」省掉 O(n) 空间。
          注意它<b>改动了原链表</b>,严谨的写法会在返回前把后半段再反转回去。
        </>
      ),
    },
  },
  {
    lc: 19,
    title: {
      en: "Remove Nth Node From End of List",
      zh: "删除链表的倒数第 N 个结点",
    },
    d: "medium",
    tags: [
      { en: "Two pointers", zh: "双指针" },
      { en: "Fixed gap", zh: "间隔同步" },
      { en: "Dummy node", zh: "dummy 哨兵" },
    ],
    hint: {
      en: "Move fast ahead by n nodes first, then move both together. Where is slow when fast reaches the end?",
      zh: "让 fast 先走 n 步,再和 slow 一起走 —— fast 到尾时,slow 在哪?",
    },
    key: {
      en: (
        <>
          Both pointers start at the dummy node. Move fast forward n + 1 steps,
          then move fast and slow together until fast is null. The gap between
          them never changes, so slow now sits on the{" "}
          <b>node before the one to delete</b>, and{" "}
          <code>slow.next = slow.next.next</code> removes it. The dummy covers
          the case where the node to delete is the head. One pass, O(n) time,
          O(1) space.
        </>
      ),
      zh: (
        <>
          两个指针都从 dummy 出发:fast 先走 n + 1 步,然后两人同步前进,直到 fast 为 null。
          间隔全程不变,所以此刻 slow 正停在<b>待删节点的前驱</b>上,一行{" "}
          <code>slow.next = slow.next.next</code> 就完成删除。dummy 兜住了
          「要删的正是头节点」这种情况。一次遍历,时间 O(n),空间 O(1)。
        </>
      ),
    },
  },
  {
    lc: 24,
    title: { en: "Swap Nodes in Pairs", zh: "两两交换链表中的节点" },
    d: "medium",
    tags: [
      { en: "Dummy node", zh: "dummy 哨兵" },
      { en: "Pointer surgery", zh: "指针操作" },
    ],
    hint: {
      en: "Swapping one pair rewrites three references. Who points at the pair from the front? The dummy node again.",
      zh: "交换一对节点要改三根引用。谁在这一对前面指着它们?又是 dummy。",
    },
    key: {
      en: (
        <>
          Put a dummy in front of head and let prev watch each pair (a, b). The
          three writes are <code>prev.next = b</code>,{" "}
          <code>a.next = b.next</code>, <code>b.next = a</code>, in that order,
          then move prev to a. Read <code>b.next</code> before you overwrite it,
          which is the same rule as connect before you disconnect. A recursive
          version is shorter, but it uses O(n) stack space; the iterative
          version is O(1).
        </>
      ),
      zh: (
        <>
          dummy 站到 head 前面,prev 每次盯住一对 (a, b)。三次写入按顺序是{" "}
          <code>prev.next = b</code>、<code>a.next = b.next</code>、
          <code>b.next = a</code>,然后 prev 跳到 a。要点是先读 <code>b.next</code>{" "}
          再覆盖它 —— 和「先接后断」是同一条规矩。递归版更短,但要 O(n) 栈空间;
          迭代版才是 O(1)。
        </>
      ),
    },
  },
  {
    lc: 142,
    title: { en: "Linked List Cycle II", zh: "环形链表 II" },
    d: "medium",
    tags: [
      { en: "Fast and slow pointers", zh: "快慢指针" },
      { en: "Proof", zh: "数学推导" },
    ],
    hint: {
      en: "LC 141 only asks whether a cycle exists. Here you need where it starts. The meeting point is not the entrance, but one more walk at equal speed finds it.",
      zh: "LC 141 只问有没有环,这题要找入口。相遇点不是入口,但相遇之后再同速走一次就能找到它。",
    },
    key: {
      en: (
        <>
          The second phase of Floyd&apos;s algorithm. After fast and slow meet,
          move one pointer back to head and advance both{" "}
          <b>one node at a time</b>. They meet again at the entrance of the
          cycle. Why: let a be the distance from head to the entrance, b the
          distance from the entrance to the meeting point, and c the rest of the
          cycle. From distance(fast) = 2 x distance(slow) you get a = c + k x
          (cycle length) for some whole number k. Interviewers often ask for
          that equation, so make sure §06 walkthrough B is clear first.
        </>
      ),
      zh: (
        <>
          Floyd 判圈的第二阶段:快慢相遇后,把一个指针放回 head,两个指针改为
          <b>每步一格</b>同速前进,再次相遇处就是环的入口。推导:设头到入口为 a、
          入口到相遇点为 b、环的剩余部分为 c,由「fast 路程 = 2 × slow 路程」可得
          a = c + k × 环长(k 为非负整数)。面试常要求当场写出这条等式,
          所以先把 §06 精讲 B 的相遇原理弄透。
        </>
      ),
    },
  },
  {
    lc: 2,
    title: { en: "Add Two Numbers", zh: "两数相加" },
    d: "medium",
    tags: [
      { en: "Dummy node", zh: "dummy 哨兵" },
      { en: "Simulation", zh: "模拟" },
      { en: "Carry", zh: "进位" },
    ],
    hint: {
      en: "The digits are stored least significant first, which is the order you add by hand. Add digit by digit and keep the carry.",
      zh: "数字按低位在前存放,正好是竖式加法的顺序。逐位相加,别忘了进位。",
    },
    key: {
      en: (
        <>
          Build the result with a dummy and a tail pointer. At each step,{" "}
          <code>sum = a + b + carry</code>, where a missing digit counts as 0.
          Append a node holding <code>sum % 10</code> and set{" "}
          <code>carry = sum / 10</code> (integer division). Keep looping while
          l1, l2, <b>or carry</b> still has something left. Forgetting the final
          carry is the most common wrong answer here: 5 + 5 must produce two
          nodes. Time O(max(n, m)).
        </>
      ),
      zh: (
        <>
          用 dummy + tail 边算边建结果链。每一步 <code>sum = a + b + carry</code>,
          某条链走完了就按 0 计;挂上 <code>sum % 10</code>,并令{" "}
          <code>carry = sum / 10</code>(整数除法)。循环条件是「l1、l2 <b>或 carry</b>
          还有货」。漏挂最后一次进位是这题最常见的错误:5 + 5 必须产生两个节点。
          时间 O(max(n, m))。
        </>
      ),
    },
  },
  {
    lc: 92,
    title: { en: "Reverse Linked List II", zh: "反转链表 II" },
    d: "medium",
    tags: [
      { en: "Reversal", zh: "反转" },
      { en: "Head insertion", zh: "头插法" },
      { en: "Dummy node", zh: "dummy 哨兵" },
    ],
    hint: {
      en: "Only the range [left, right] is reversed. Walk to the node before left, then move the nodes inside the range to just after it, one at a time.",
      zh: "只反转 [left, right] 区间:先走到 left 的前一个节点,再把区间内的节点一个个挪到它后面。",
    },
    key: {
      en: (
        <>
          Use a dummy so that left = 1 needs no special case. Walk to pre, the
          node before position left. Then repeat right - left times: detach{" "}
          <code>cur.next</code> and insert it directly after pre. Each move
          pushes one node further to the front, so the range ends up reversed in
          a single pass. This uses fewer pointer writes than cutting the list,
          reversing it, and stitching it back. Draw every step. Time O(n), space
          O(1).
        </>
      ),
      zh: (
        <>
          先用 dummy 让 left = 1 不再是特例,然后走到 pre(位置 left 的前一个节点)。
          接着重复 right − left 次:把 <code>cur.next</code> 摘下来,插到 pre 的正后方。
          每挪一次就有一个节点被顶到更前面,一趟下来区间自然反转。
          这比「切段 + 反转 + 缝回」少写一半指针。每一步都建议画图。
          时间 O(n),空间 O(1)。
        </>
      ),
    },
  },
  {
    lc: 25,
    title: { en: "Reverse Nodes in k-Group", zh: "K 个一组翻转链表" },
    d: "hard",
    tags: [
      { en: "Reversal", zh: "反转" },
      { en: "Grouping", zh: "分组" },
      { en: "Dummy node", zh: "dummy 哨兵" },
    ],
    hint: {
      en: "Wrap LC 206 in a function and call it once per group of k. The hard part is joining the groups back together.",
      zh: "把 LC 206(整段反转)封装成函数,每 k 个调用一次 —— 难点全在段与段的缝合。",
    },
    key: {
      en: (
        <>
          Start with a dummy. Each round: check whether k nodes remain (if not,
          stop and leave them in the original order), reverse those k nodes with
          the three-pointer loop, then reconnect. The tail of the previous group
          must point at the new head of this group, and the tail of this group
          must point at the next group. Two anchor variables, groupPrev and
          groupNext, remove most of the confusion. It is rated Hard because of
          the bookkeeping, not because of a new algorithm. Time O(n), space
          O(1).
        </>
      ),
      zh: (
        <>
          dummy 起手,每轮三件事:① 探查剩余节点是否够 k 个(不够就停,保持原序);
          ② 用三指针反转这 k 个;③ 缝合 —— 上一段的尾接本段的新头,本段的尾接下一段的头。
          用 groupPrev / groupNext 两个锚点变量能挡掉大半混乱。它 Hard 在工程化拆解,
          而不是新算法。时间 O(n),空间 O(1)。
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "Under what condition is it true that inserting into or deleting from a linked list is O(1)?",
      zh: "「链表插入 / 删除是 O(1)」这句话,完整的前提是什么?",
    },
    opts: [
      {
        en: "You already hold a reference to the node before the position. Finding that node can itself take O(n).",
        zh: "你已经持有该位置前驱节点的引用 —— 找到这个前驱本身可能要 O(n)",
      },
      {
        en: "It always holds. Inserting and deleting in a linked list is simply faster than in an array.",
        zh: "无条件成立,链表插删就是比数组快",
      },
      {
        en: "The linked list has to be sorted.",
        zh: "链表必须是有序的",
      },
      {
        en: "It only holds while the list is shorter than 100 nodes.",
        zh: "只在链表长度小于 100 时成立",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Inserting at position i costs O(n) in total: walking to node i-1 is O(n), and only the pointer writes are O(1). The fast part is the rewiring, not the search.",
        zh: "「在位置 i 插入」整体其实是 O(n):走到第 i−1 个节点花 O(n),只有改指针那一步是 O(1)。快的是改指针,不是找位置。",
      },
      {
        en: "Order does not change the cost of insertion or deletion. And a sorted linked list still cannot be binary searched, because there is no random access.",
        zh: "有序与否不影响插删成本。而且链表就算有序也没法二分 —— 它没有随机访问。",
      },
      {
        en: "Complexity describes how cost grows with size. It is not a statement about any particular length.",
        zh: "复杂度描述的是成本随规模增长的趋势,与具体长度无关。",
      },
    ],
    why: {
      en: "Insertion and deletion are two parts: find the predecessor, then rewrite pointers. The rewriting is always O(1); the search is usually O(n). So a linked list wins when the reference is already in your hand, for example in an LRU cache where a hash map hands you the node directly.",
      zh: "插删由两部分组成:找前驱、改指针。改指针恒为 O(1),找前驱一般是 O(n)。所以链表真正占优的场景,是「引用本来就在手上」—— 比如 LRU 缓存里,哈希表直接把节点递给你。",
    },
  },
  {
    type: "choice",
    q: {
      en: "You are inserting a new node between prev and cur. What is the correct order of the two pointer writes?",
      zh: "要在 prev 和 cur 之间插入新节点 node,两次指针写入的正确顺序是?",
    },
    opts: [
      {
        en: "node.next = cur first (connect), then prev.next = node (disconnect).",
        zh: "先 node.next = cur(先接),再 prev.next = node(后断)",
      },
      {
        en: "prev.next = node first, then node.next = cur.",
        zh: "先 prev.next = node,再 node.next = cur",
      },
      {
        en: "The order does not matter, the result is the same.",
        zh: "两步顺序无所谓,结果一样",
      },
      {
        en: "Only prev.next = node is needed.",
        zh: "只需要 prev.next = node 一步",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Once prev.next points at node, nothing refers to cur any more, so the rest of the list is unreachable unless you saved cur in a variable first. Connect before you disconnect.",
        zh: "prev.next 一旦改指向 node,就再没有任何引用记得 cur,后半条链变得不可达 —— 除非你提前把 cur 存在变量里。默认写法必须先接后断。",
      },
      {
        en: "The order decides whether the list survives. Reversed, everything from cur onwards is lost. The Wrong order button in the lab above shows it happening.",
        zh: "顺序恰恰决定了链表的死活:反过来会弄丢 cur 开始的整个后半段。上面实验室的「反面教材」按钮演示的就是它。",
      },
      {
        en: "If you only write prev.next, node.next is still null, so the list ends at node and everything after it is lost.",
        zh: "只改 prev.next 的话,node.next 还是 null,链表在 node 处断头,后面全丢。",
      },
    ],
    why: {
      en: "Connect before you disconnect. The new node takes hold of the rest of the list first (node.next = cur), so nothing is lost at any point, and only then does prev switch to the new node. Reversed, every node from cur onwards loses its last reference.",
      zh: "口诀是「先接后断」:新节点先牵住后半条链(node.next = cur),全程不丢任何东西;然后 prev 才改挂新节点。顺序反了,cur 起的所有节点都会失去最后一个引用。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Cycle detection: once both pointers are inside the cycle, why must the fast pointer meet the slow one instead of stepping over it?",
      zh: "快慢指针判环:两者都进环之后,为什么 fast 一定会遇上 slow,而不会「跳过去」?",
    },
    opts: [
      {
        en: "Fast gains exactly one node on slow per step, so the distance between them shrinks by exactly 1 each step and must reach 0.",
        zh: "fast 每步比 slow 多走 1 格,两者的距离每步恰好缩小 1,必然减到 0",
      },
      {
        en: "Because the length of a cycle is always even.",
        zh: "因为环的长度一定是偶数",
      },
      {
        en: "They meet by luck; the algorithm fails with small probability.",
        zh: "靠运气才相遇,算法有小概率失败",
      },
      {
        en: "Because slow stops and waits for fast.",
        zh: "因为 slow 会停下来等 fast",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "The cycle can have any length. What matters is that the relative speed is 1, so the gap passes through every value down to 0 and cannot jump over it.",
        zh: "环长可以是任意值(奇偶都行)。关键在于相对速度是 1:距离一格一格地减,不可能「隔着 1 格互相穿过」。",
      },
      {
        en: "This is a deterministic algorithm. The distance is a whole number that decreases by 1 every step, so 0 is unavoidable.",
        zh: "这是确定性算法:距离是一个整数,每步减 1,必然经过 0,没有任何概率成分。",
      },
      {
        en: "Both pointers move on every step. The meeting comes from the difference in speed, not from one of them waiting.",
        zh: "两个指针每一轮都在动。相遇靠的是速度差,不是谁等谁。",
      },
    ],
    why: {
      en: "Measure the distance from fast forward to slow along the cycle. Fast moves 2 and slow moves 1, so that distance drops by exactly 1 per step. It is a whole number that cannot become negative, so it reaches 0, and 0 means both pointers are on the same node. Slow meets fast in fewer steps than one full lap. If fast moved 3 nodes per step the distance would drop by 2 and could pass over 0, so this simple argument would no longer work.",
      zh: "沿着环,量「从 fast 往前走到 slow」的距离:fast 每步走 2、slow 每步走 1,这个距离每步恰好减 1。它是一个不会变成负数的整数,所以必然减到 0,而 0 就意味着两个指针停在同一个节点上。slow 进环后不到一圈就会相遇。如果 fast 每步走 3 格,距离每步减 2,就可能跨过 0,这条简洁的论证便不再成立。",
    },
  },
  {
    type: "multi",
    q: {
      en: "In which situations should you prefer an array over a linked list? (Select all that apply)",
      zh: "以下哪些场景应该优先选「数组」而不是链表?(多选)",
    },
    opts: [
      {
        en: "You need frequent random access by index.",
        zh: "需要大量按下标随机访问",
      },
      {
        en: "Sequential traversal is performance sensitive and you want the CPU cache to help.",
        zh: "顺序遍历的性能敏感,希望 CPU 缓存帮上忙",
      },
      {
        en: "You already hold a node reference and insert or delete next to it constantly.",
        zh: "手里拿着节点引用,要在它旁边频繁插入 / 删除",
      },
      {
        en: "The number of elements is basically fixed and insertions and deletions are rare.",
        zh: "元素总量基本固定,很少插删",
      },
    ],
    correct: [0, 1, 3],
    missHint: {
      en: "An array wins in three ways: index arithmetic, contiguous memory the cache can prefetch, and no shifting when the size is stable. Count the options again.",
      zh: "数组的三个主场:下标直达、连续内存(缓存可以预取)、规模稳定时没有搬家成本。对照选项再数一遍。",
    },
    extraHint: {
      en: "Inserting or deleting next to a node you already hold is the one case where a linked list clearly wins. An array would move O(n) elements, so this option does not belong.",
      zh: "「拿着节点引用就地插删」正是链表明显胜出的唯一场景 —— 数组要搬 O(n) 个元素,所以这一项不能选。",
    },
    why: {
      en: "An array stores elements contiguously: index access is O(1), traversal is cache-friendly, and a stable size means nothing ever shifts. A linked list wins on O(1) insertion and deletion at a position you already hold, and on not needing one large contiguous block. Both traverse in O(n); the cache difference is a constant factor, but a large one.",
      zh: "数组连续存放:下标访问 O(1),顺序遍历对缓存友好,规模稳定时也不会有搬家成本。链表赢在「位置已知时的 O(1) 插删」,以及不需要一大块连续内存。两者遍历都是 O(n),缓存带来的是常数因子上的差距 —— 只是这个常数不小。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          Java&apos;s <code>LinkedList</code> is a doubly linked list. What is
          the time complexity of <code>list.get(i)</code>? (Answer in O(...)
          form)
        </>
      ),
      zh: (
        <>
          Java 的 <code>LinkedList</code> 是双向链表,那么{" "}
          <code>list.get(i)</code> 的时间复杂度是?(用 O(…) 作答)
        </>
      ),
    },
    placeholder: { en: "For example O(1)…", zh: "输入复杂度,如 O(1)…" },
    answers: ["O(n)", "o(n)", "On"],
    hint: {
      en: "A linked list has no address formula. get(i) walks node by node from the head, or from the tail if that end is closer.",
      zh: "链表没有地址公式 —— get(i) 只能从头(或从更近的尾)一个 next 一个 next 地走过去。",
    },
    why: {
      en: "LinkedList.get(i) is O(n), because it walks to position i one node at a time. The classic accident: looping with for (int i = 0; i < list.size(); i++) list.get(i) over a LinkedList costs O(n^2). Traverse it with a for-each loop or an iterator instead, or use ArrayList in the first place.",
      zh: "LinkedList.get(i) 是 O(n):它要一个节点一个节点地走到位置 i。经典事故是用 for (int i = 0; i < list.size(); i++) list.get(i) 遍历 LinkedList,总成本 O(n²)。遍历它要用 for-each 或迭代器 —— 或者一开始就选 ArrayList。",
    },
  },
  {
    type: "choice",
    q: {
      en: "What does a dummy (sentinel) node actually do?",
      zh: "dummy(哑结点 / 哨兵)技巧真正解决的是什么?",
    },
    opts: [
      {
        en: "It gives the head a predecessor, so every node can be reached through some node's next field and the head needs no special case.",
        zh: "让头节点也有前驱,于是每个节点都能通过某个节点的 next 访问到,头部特判随之消失",
      },
      {
        en: "It makes access to the list faster.",
        zh: "提升链表的访问速度",
      },
      {
        en: "It saves memory.",
        zh: "省内存",
      },
      {
        en: "It prevents the list from forming a cycle.",
        zh: "防止链表成环",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A dummy changes no complexity at all. It changes the shape of the code: one branch fewer, one class of bug fewer.",
        zh: "dummy 不改变任何复杂度 —— 它改变的是代码形状:少一个分支,少一类 bug。",
      },
      {
        en: "It costs one extra node. That node buys you a whole category of boundary bugs removed, which is usually a good trade.",
        zh: "它反而要多花一个节点的内存 —— 用一个节点换掉一整类边界 bug,通常很划算。",
      },
      {
        en: "A dummy has nothing to do with cycles. Cycle detection is what fast and slow pointers are for.",
        zh: "dummy 和环没有关系;判环靠的是快慢指针。",
      },
    ],
    why: {
      en: "The head is special because nothing points at it: deleting it means assigning to the head variable, and inserting before it means the same, so both need their own branch. A dummy node placed in front of the head gives it a predecessor, so one uniform 'operate on cur.next' loop handles every position. Return dummy.next at the end. LC 203, 19, 21, and 25 all become shorter this way.",
      zh: "头节点特殊,是因为没有任何节点指向它:删它、在它前面插入,都得直接给 head 变量赋值,于是各需要一个分支。dummy 站到 head 前面,头节点就有了前驱,一套「操作 cur.next」的循环通吃所有位置,最后返回 dummy.next。LC 203、19、21、25 都因此变短。",
    },
  },
  {
    type: "choice",
    q: {
      en: "There are two ways to find the middle of a list: (1) count the length n, then walk n/2 steps; (2) fast and slow pointers in one pass. Which statement is correct?",
      zh: "找链表中点有两种做法:① 先遍历数出长度 n,再走 n/2 步;② 快慢指针一次遍历。哪个说法正确?",
    },
    opts: [
      {
        en: "Both are O(n). The advantage of fast and slow pointers is that the list is read only once, which matters for streamed data and keeps the code to one loop.",
        zh: "两种都是 O(n);快慢指针的优势是只读一遍数据 —— 流式场景需要它,代码也只剩一个循环",
      },
      {
        en: "Fast and slow pointers are O(log n); counting the length is O(n).",
        zh: "快慢指针是 O(log n),数长度是 O(n)",
      },
      {
        en: "Counting the length is wrong; it does not give the middle.",
        zh: "数长度法是错的,得不到中点",
      },
      {
        en: "Fast and slow pointers take half as many steps in total.",
        zh: "快慢指针的总步数只有数长度法的一半",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Nothing here halves the remaining work: slow takes n/2 steps while fast takes n. Both are linear. A linked list offers no O(log n) way to reach a position.",
        zh: "这里没有任何「每次砍一半」的结构:slow 走 n/2 步,fast 走 n 步,都是线性的。链表上不存在 O(log n) 的定位方式。",
      },
      {
        en: "Counting the length works perfectly well. It is two loops of O(n) each, and it is arguably easier to get right. It just reads the list twice.",
        zh: "数长度法完全正确,两个循环各 O(n),写起来甚至更不容易错 —— 只是要把链表读两遍。",
      },
      {
        en: "Add it up: fast and slow take n/2 + n = 1.5n pointer moves, counting takes n + n/2 = 1.5n. They tie. The difference is the number of passes, not the number of steps.",
        zh: "算总账:快慢指针 n/2 + n = 1.5n 步,数长度法 n + n/2 = 1.5n 步 —— 打平。区别在遍历的「遍数」,不在步数。",
      },
    ],
    why: {
      en: "Both are correct and both are O(n), and the total number of pointer moves is 1.5n either way. Fast and slow pointers win because the data is read in a single pass, which is required when the input can only be read once, and because the same template also solves cycle detection and palindrome checking. That is why it is the expected answer in an interview.",
      zh: "两种都对、都是 O(n),总的指针移动次数还恰好都是 1.5n。快慢指针胜在单次扫描 —— 数据只能读一遍的流式场景是刚需 —— 而且判环、回文链表共用同一套模板。这就是它成为面试默认答案的原因。",
    },
  },
];
