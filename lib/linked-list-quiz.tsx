// Chapter 3 · Linked lists — closing quiz (the problem set is in lib/linked-list-problems.tsx).
//
// Bilingual: every question, option and explanation is a { en, zh } pair.

import type { QuizItem } from "@/lib/quiz";

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
      zh: "头节点特殊,是因为没有任何节点指向它:删它、在它前面插入,都得直接给 head 变量赋值,于是各需要一个分支。dummy 站到 head 前面,头节点就有了前驱,一套「操作 cur.next」的循环就能处理所有位置,最后返回 dummy.next。LC 203、19、21、25 都因此变短。",
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
        en: "Both are O(n). Fast and slow pointers need only one loop and no length up front, and the same template also works on a list that may contain a cycle.",
        zh: "两种都是 O(n);快慢指针只需一个循环、不必先知道长度,同一模板还能用于可能有环的链表",
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
        zh: "这里没有任何「每次减半」的结构:slow 走 n/2 步,fast 走 n 步,都是线性的。链表上不存在 O(log n) 的定位方式。",
      },
      {
        en: "Counting the length works perfectly well. It is two loops of O(n) each, and it is arguably easier to get right. It just reads the list twice.",
        zh: "数长度法完全正确,两个循环各 O(n),写起来甚至更不容易错 —— 只是要把链表读两遍。",
      },
      {
        en: "Add it up: fast and slow take n/2 + n = 1.5n pointer moves, counting takes n + n/2 = 1.5n. They tie. The difference is the number of loops, not the number of steps.",
        zh: "算总账:快慢指针 n/2 + n = 1.5n 步,数长度法 n + n/2 = 1.5n 步 —— 打平。区别在循环的个数,不在步数。",
      },
    ],
    why: {
      en: "Both are correct and both are O(n), and the total number of pointer moves is 1.5n either way. Fast and slow pointers win because they need one loop and no length in advance, and because the same template also handles a list that may contain a cycle, where counting the length would never finish, as well as palindrome checking. That is why it is the expected answer in an interview.",
      zh: "两种都对、都是 O(n),总的指针移动次数也都是 1.5n。快慢指针的优势在于只需一个循环、不必事先知道长度,而且同一套模板还能处理可能有环的链表(有环时「先数长度」根本不会结束)和回文链表。这就是它成为面试默认答案的原因。",
    },
  },
];
