// Chapter 3 · Linked lists — problem set (English default / Chinese toggle).
// The closing quiz is in lib/linked-list-quiz.tsx; /atlas imports only this file.
// Problems cover deletion/traversal, fast-and-slow pointers, dummy sentinels, reversal, and doubly
// linked list synthesis, ramping from Easy to Hard;
// hint points a direction without spoilers, key explains the optimal solution in one paragraph.

import type { Problem } from "@/lib/problems";

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
          cycle. From distance(fast) = 2 × distance(slow) you get a = c + k ×
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
