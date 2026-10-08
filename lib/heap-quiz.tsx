// Chapter 9 · Heaps and priority queues — closing quiz (the problem set is in lib/heap-problems.tsx).
//
// Bilingual: every question, option and explanation is a { en, zh } pair.

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "multi",
    q: {
      en: "Which of these does a min-heap guarantee? (Select all that apply.)",
      zh: "一个小根堆能保证以下哪些事?(多选)",
    },
    opts: [
      {
        en: "The root is the smallest value in the whole heap.",
        zh: "堆顶是全场最小值",
      },
      {
        en: "Every parent is ≤ each of its children.",
        zh: "每个父结点 ≤ 它的每个孩子",
      },
      { en: "The left child is ≤ the right child.", zh: "左孩子 ≤ 右孩子" },
      {
        en: "The underlying array is sorted from start to end.",
        zh: "底层数组从头到尾是升序的",
      },
    ],
    correct: [0, 1],
    missHint: {
      en: "A heap promises two related things: the root holds the minimum, and every parent-child pair is ordered. You left one of them out.",
      zh: "堆的承诺其实是相关的两条:堆顶是最小值,以及每一对父子有序。你漏掉了其中一条。",
    },
    extraHint: {
      en: "Siblings are not constrained at all, and the array only satisfies the heap order, not full sorted order. Neither C nor D is guaranteed, so leave both unselected.",
      zh: "兄弟之间没有任何约束,底层数组也只满足「堆序」而不是「全序」。C 和 D 都无法保证,两项都不应选。",
    },
    why: {
      en: "A heap maintains one rule: parent ≤ child. The root being the minimum follows from that rule. Siblings in any order and an unsorted array are both perfectly legal. Fewer promises means cheaper maintenance: O(log n) per update instead of O(n log n) for a full sort.",
      zh: "堆只维护一条规则:父 ≤ 子。「堆顶最小」是这条规则的推论。兄弟乱序、数组乱序都完全合法。承诺越少,维护越便宜:单次更新 O(log n),而不是全排序的 O(n log n)。",
    },
  },
  {
    type: "fill",
    q: {
      en: "A heap is stored in an array. What is the index of the parent of index 7?",
      zh: "用数组存堆,下标 7 的结点,它父结点的下标是?",
    },
    placeholder: { en: "Type an index…", zh: "输入下标…" },
    answers: ["3"],
    hint: {
      en: "parent = (i − 1) / 2 with integer division, so (7 − 1) / 2 = ?",
      zh: "parent = (i − 1) / 2,整数除法向下取整:(7 − 1) / 2 = ?",
    },
    why: {
      en: "(7 − 1) / 2 = 3. Check it the other way: the children of 3 are 2 × 3 + 1 = 7 and 2 × 3 + 2 = 8. A complete binary tree numbered level by level has no gaps, so parent and child links do not need pointers. All three positions are computed from the index, the same idea as computing an array element's address.",
      zh: "(7 − 1) / 2 = 3;反过来验证:3 的孩子是 2 × 3 + 1 = 7 和 2 × 3 + 2 = 8。完全二叉树按层编号没有空洞,所以父子关系不需要指针,三个位置全靠下标算出来 —— 和数组按下标算地址是同一个思想。",
    },
  },
  {
    type: "choice",
    q: {
      en: "push and pop are O(log n). What is the reason?",
      zh: "push / pop 的复杂度是 O(log n),根本原因是?",
    },
    opts: [
      {
        en: "Sifting up or down follows one path between a leaf and the root, and a complete binary tree of n nodes has height ⌊log₂n⌋.",
        zh: "上浮 / 下沉最多走一条根与叶之间的路径,而 n 个结点的完全二叉树高度是 ⌊log₂n⌋",
      },
      {
        en: "Each operation scans half of the array.",
        zh: "每次操作要扫描一半的数组",
      },
      {
        en: "Each operation sorts the heap again.",
        zh: "每次操作后要把堆重新排序",
      },
      {
        en: "It is really O(1), because only the root or the last slot changes.",
        zh: "其实是 O(1),因为只动堆顶或堆尾",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Sifting follows a single chain: each comparison moves one level up or down. It never scans all the elements on a level.",
        zh: "上浮 / 下沉走的是一条链:每比较一次就上或下一层,不会横着扫完某一层的所有元素。",
      },
      {
        en: "A heap never sorts itself. It only repairs the one parent-child chain that was broken and leaves everything else untouched.",
        zh: "堆从不做全排序,它只修复被破坏的那一条父子链,其余部分原封不动。",
      },
      {
        en: "Writing into the last slot or reading the root is indeed O(1), but the heap order still has to be repaired afterwards, and that path is as long as the height of the tree.",
        zh: "写进堆尾、读取堆顶本身确实是 O(1),但之后必须上浮 / 下沉恢复堆序,那条路径的长度就是树高。",
      },
    ],
    why: {
      en: "A complete binary tree with n nodes has height ⌊log₂n⌋. Every swap moves the element one level, so the number of swaps is at most the height. All of the heap's speed comes from the tree being short.",
      zh: "n 个结点的完全二叉树高度是 ⌊log₂n⌋,每次交换让元素上或下移一层,所以交换次数不超过树高。堆的全部效率都来自「完全二叉树够矮」。",
    },
  },
  {
    type: "choice",
    q: {
      en: "To find the k-th largest element of an array, which heap does the standard solution use?",
      zh: "求数组中「第 K 大」的元素,标准堆解法用哪种堆?",
    },
    opts: [
      {
        en: "A min-heap of size k. Its root is the entry threshold, and a new value only enters if it is larger.",
        zh: "容量 K 的小根堆 —— 堆顶是入围门槛,新数比门槛大才进",
      },
      { en: "A max-heap of size k.", zh: "容量 K 的大根堆" },
      {
        en: "Put every element into a max-heap, then pop k times.",
        zh: "全部元素入大根堆,连续弹 K 次",
      },
      {
        en: "Put every element into a min-heap, then pop n − k times.",
        zh: "全部元素入小根堆,连续弹 n−K 次",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A max-heap of size k evicts the largest of the k it holds, so you would end up with the k smallest values. That direction solves the k smallest, not the k largest.",
        zh: "容量 K 的大根堆每次淘汰的是「这 K 个里最大的」,最后剩下的是 K 个最小值 —— 方向反了。求前 K 小才用大根堆。",
      },
      {
        en: "This works, but every element goes into the heap: O(n) space and O(n + k log n) time. In a stream you cannot store everything, while the size-k heap needs only O(k) space.",
        zh: "这样做能得到正确答案,但所有元素都入堆:空间 O(n),时间 O(n + K log n);数据流场景根本存不下全部,而容量 K 的方案只要 O(K) 空间。",
      },
      {
        en: "This also stores all n elements, so O(n) space, and popping n − k times costs more than maintaining a heap of size k.",
        zh: "同样要把 n 个元素全部入堆,空间 O(n);弹 n−K 次也比维护容量 K 的堆更贵。",
      },
    ],
    why: {
      en: "The heap holds the k largest values seen so far. When a better value arrives, the one to evict is the smallest of those k, so you need to read that smallest value at any moment, and that is a min-heap. The root is both the weakest survivor and the current answer for the k-th largest.",
      zh: "堆里住着「迄今最大的 K 个」。有更强的新数进来时,该踢的是这 K 个里最小的,所以你要能随时读到这个最小值 —— 那就是小根堆。堆顶既是最弱的幸存者,也是当前的第 K 大。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Up to Python 3.13, heapq is a min-heap only. What is the usual way to get a max-heap there?",
      zh: "到 Python 3.13 为止,heapq 只有小根堆。在这些版本里想要大根堆,惯用技巧是?",
    },
    opts: [
      {
        en: "Store the negation of every value, and negate again when you pop.",
        zh: "所有数取负存入,弹出时再取负还原",
      },
      {
        en: "Call heapq.maxheap() to switch mode.",
        zh: "调用 heapq.maxheap() 切换模式",
      },
      {
        en: "Pass reverse=True to heappush.",
        zh: "给 heappush 传 reverse=True",
      },
      {
        en: "Call sort(reverse=True) first, then use the list as a heap.",
        zh: "先 sort(reverse=True) 再当堆用",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "There is no such function. heapq is a set of functions that operate on a plain list, not a class, and it has no max-heap switch.",
        zh: "heapq 没有这个函数 —— 它是一组操作 list 的函数,不是类,更没有大根堆开关。",
      },
      {
        en: "reverse is a parameter of sorted and list.sort. heappush does not accept it.",
        zh: "reverse 是 sorted / list.sort 的参数,heappush 不认识它。",
      },
      {
        en: "Sorting happens once. As soon as a new element is pushed the order is broken again, and sorting costs O(n log n) per update instead of O(log n).",
        zh: "排序是一次性的:新元素进来后有序性立刻失效,而且每次更新 O(n log n) 比堆的 O(log n) 贵得多。",
      },
    ],
    why: {
      en: "Negation maps the largest value to the smallest, so the min-heap does the work unchanged. For compound elements, negate the sort key inside a tuple, such as (-freq, word). Strings cannot be negated, so for a text key you need another approach, such as a wrapper class that defines its own comparison.",
      zh: "取负把「最大」映射成「最小」,小根堆照常工作。复合元素则把排序键取负打包成元组,如 (-freq, word)。注意字符串不能取负 —— 那种情况要换办法,例如写一个自定义比较逻辑的包装类。",
    },
  },
  {
    type: "choice",
    q: {
      en: "You already have n elements in an array. What is the best way to turn them into a heap, and at what cost?",
      zh: "把 n 个已有元素建成堆,最优做法和复杂度是?",
    },
    opts: [
      {
        en: "Sift down from the last internal node backwards to index 0 (Floyd's method), O(n).",
        zh: "从最后一个父结点倒着逐个下沉(Floyd 建堆),O(n)",
      },
      {
        en: "Push them one by one into an empty heap, O(n log n), and that is already optimal.",
        zh: "逐个 push 进空堆,O(n log n),这已是最优",
      },
      {
        en: "Sort the array first and use it directly as a heap, O(n log n).",
        zh: "先排序再直接当堆用,O(n log n)",
      },
      { en: "Any method is O(log n).", zh: "无论怎么做都是 O(log n)" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Pushing one by one is correct and is O(n log n), but it is not the best. Sifting down from the bottom up saves the log factor.",
        zh: "逐个 push 确实可行,也确实是 O(n log n),但不是最优 —— 自底向上下沉能省掉一个 log。",
      },
      {
        en: "A sorted ascending array is a valid min-heap, but sorting itself costs O(n log n), which is more work than the heap property requires.",
        zh: "升序数组确实是合法的小根堆,但排序本身就要 O(n log n),做了远超堆序所需的工作。",
      },
      {
        en: "Just looking at each of the n elements once already costs O(n), so no method can be faster than O(n).",
        zh: "光把 n 个元素各看一眼就要 O(n),总复杂度不可能低于 O(n)。",
      },
    ],
    why: {
      en: "About half of the nodes are leaves and sift down 0 levels, about a quarter sift down at most 1 level, about an eighth at most 2, and so on. The nodes that could move far are the rare ones. The total is Σ d · n / 2^(d+1), which sums to at most n, so building the heap is O(n). Python's heapq.heapify does exactly this.",
      zh: "大约一半的结点是叶子,下沉 0 步;上一层约 1/4 最多沉 1 步;再上一层约 1/8 最多沉 2 步……能沉得深的结点恰恰最稀少。总步数 Σ d · n / 2^(d+1) 加起来不超过 n,所以建堆是 O(n)。Python 的 heapq.heapify 用的就是这个方法。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In Java, what order does for (int x : priorityQueue) produce?",
      zh: "Java 里 for (int x : priorityQueue) 遍历,输出顺序是?",
    },
    opts: [
      {
        en: "No useful order is guaranteed. To read the elements in order you must call poll() repeatedly.",
        zh: "不保证任何有用的顺序 —— 想要有序只能连续 poll()",
      },
      {
        en: "Ascending, since it is called a priority queue.",
        zh: "从小到大(它毕竟叫优先队列)",
      },
      { en: "Descending.", zh: "从大到小" },
      { en: "The same order the elements were added.", zh: "与插入顺序相同" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "The iterator walks the backing array, and that array only satisfies the heap order: parents before children, with no rule between siblings or cousins. Printing [1, 3, 2, 7, 4] is completely normal.",
        zh: "迭代器走的是底层数组,而数组只满足「堆序」:父子有序,兄弟和堂兄弟之间可以任意排列 —— 打印出 [1, 3, 2, 7, 4] 完全正常。",
      },
      {
        en: "Same reason: the array of a max-heap only guarantees the parent-child relation, not a descending sequence.",
        zh: "同理,大根堆的数组同样只保证父子关系,不是降序序列。",
      },
      {
        en: "Insertion already triggers sift-up swaps, so the arrival order is destroyed as elements are added.",
        zh: "元素入队时就经历了上浮交换,插入顺序早已被打乱。",
      },
    ],
    why: {
      en: "The only promise a heap makes is that the root is the extreme value. To get a sorted sequence, call poll() in a loop, at O(log n) each. If you need ordered access all the time, a heap is the wrong structure; use a TreeMap or sort once. This is the most common mistake with PriorityQueue in practice.",
      zh: "堆的承诺只有「堆顶是最值」。需要有序序列就循环 poll(),每次 O(log n)。如果你一直需要有序访问,那说明选错了结构 —— 该用 TreeMap 或一次性排序。这是 PriorityQueue 在实战中最容易出错的地方。",
    },
  },
];
