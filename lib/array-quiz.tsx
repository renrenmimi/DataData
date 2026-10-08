// Chapter 1 · Arrays — closing quiz (the problem set is in lib/array-problems.tsx).
//
// Bilingual: every question, option and explanation is a { en, zh } pair.

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "What is the time complexity of inserting one element at the front of an array of length n?",
      zh: "在长度为 n 的数组头部插入一个元素,时间复杂度是?",
    },
    opts: [
      {
        en: "O(n), because every existing element shifts one slot to the right",
        zh: "O(n) —— 所有元素都要向后搬一格",
      },
      { en: "O(1), you just put it at the front", zh: "O(1) —— 直接放在最前面" },
      { en: "O(log n)", zh: "O(log n)" },
      {
        en: "It depends on the value being inserted",
        zh: "取决于插入的值是多少",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "The first slot is occupied by arr[0]. To free it, all n existing elements have to move right.",
        zh: "最前面的位置被 arr[0] 占着 —— 想空出它,后面 n 个元素必须全体右移。",
      },
      {
        en: "log n comes from halving a range each step. Inserting moves elements one by one.",
        zh: "log n 来自「每步减半」,插入是实打实的逐个搬动。",
      },
      {
        en: "The number of moves depends only on the position and the length, never on the value.",
        zh: "搬动次数只和位置、长度有关,和插入的值毫无关系。",
      },
    ],
    why: {
      en: "Inserting at the front shifts all n elements right. It is one of the most expensive array operations, and it is exactly why linked lists exist (chapter 3).",
      zh: "头部插入要右移全部 n 个元素,是数组最贵的操作之一 —— 这正是链表存在的理由(第 3 章见)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "What is the most accurate description of appending to a dynamic array (ArrayList, Python list, JS Array)?",
      zh: "动态数组(ArrayList / list / JS Array)尾部追加的复杂度,最准确的说法是?",
    },
    opts: [
      {
        en: "O(1) amortized: a resize costs O(n) now and then, but spread over all appends the average is constant",
        zh: "均摊 O(1):偶尔一次 O(n) 扩容,摊到每次操作上是常数",
      },
      { en: "Always O(1), resizing costs nothing", zh: "永远 O(1),扩容不花代价" },
      {
        en: "O(n), because every append may trigger a resize",
        zh: "O(n),因为每次都可能扩容",
      },
      {
        en: "O(log n), because the capacity grows by a factor",
        zh: "O(log n),因为容量是按倍数增长的",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "The resize really does copy every element, so a single append is O(n) in the worst case. It is only the average over many appends that is constant.",
        zh: "扩容那一次真的拷贝了全部元素,所以单次追加在最坏情况下是 O(n)。只有摊到多次之后,平均才是常数。",
      },
      {
        en: "A resize is rare: after the capacity grows, you have to fill the new space before it grows again, so most appends only write one value.",
        zh: "扩容是低频事件:容量增长之后,要把新空间填满才会再次扩容,大多数追加只是写入一个值。",
      },
      {
        en: "Growing by a factor changes how often a resize happens. The amortized cost of one append is a constant, not log n.",
        zh: "按倍数增长影响的是扩容的「频率」,单次追加的均摊成本是常数,不是 log n。",
      },
    ],
    why: {
      en: "With doubling, n appends copy about 1+2+4+…+n < 2n elements in total, so the total cost is O(n) and the average per append is constant. The precise wording is 'O(1) amortized', not 'O(1) worst case'. Any growth factor greater than 1 gives the same result.",
      zh: "按翻倍扩容时,n 次追加的总拷贝量约为 1+2+4+…+n < 2n,总成本 O(n),平均到每次是常数。准确说法是「均摊 O(1)」而不是「最坏 O(1)」。任何大于 1 的增长倍数都能得到同样的结论。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          A <code>long</code> array (8 bytes per element) starts at address
          2000. What is the address of <code>arr[3]</code>?
        </>
      ),
      zh: (
        <>
          一个 <code>long</code> 数组(每个元素 8 字节)首地址是 2000,那么{" "}
          <code>arr[3]</code> 的地址是?
        </>
      ),
    },
    placeholder: { en: "Type the address…", zh: "输入地址…" },
    answers: ["2024"],
    hint: {
      en: "Use the formula: address = base address + index × element size = 2000 + 3 × 8.",
      zh: "套公式:地址 = 首地址 + 下标 × 元素大小 = 2000 + 3 × 8。",
    },
    why: {
      en: "2000 + 3 × 8 = 2024. The same formula explains why indexing starts at 0: an index is an offset, and the first element is 0 units from the base address.",
      zh: "2000 + 3 × 8 = 2024。这条公式同时解释了「为什么下标从 0 开始」:下标本质是偏移量,第一个元素偏移为 0。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In Java, what is the main difference between int[] and ArrayList<Integer>?",
      zh: "Java 里 int[] 与 ArrayList<Integer> 最核心的区别是?",
    },
    opts: [
      {
        en: "int[] has a fixed length and stores primitive int values; ArrayList resizes itself and stores Integer objects, so it pays for boxing",
        zh: "int[] 定长、存原始 int;ArrayList 自动扩容、存的是 Integer 对象(有装箱开销)",
      },
      {
        en: "They are only different names for the same thing",
        zh: "两者只是名字不同,底层完全一样",
      },
      {
        en: "ArrayList is not implemented with an array",
        zh: "ArrayList 不是用数组实现的",
      },
      {
        en: "int[] has more operations than ArrayList",
        zh: "int[] 比 ArrayList 功能更多",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "One has a fixed length and stores values directly; the other resizes itself and stores object references. The memory layout and the performance both differ.",
        zh: "一个长度固定、直接存值;一个自动扩容、存对象引用 —— 内存布局和性能都不同。",
      },
      {
        en: "It is the opposite: an ArrayList holds an Object[] inside, and when that is full it copies into a larger one (about 1.5 times).",
        zh: "恰恰相反:ArrayList 内部就是一个 Object[],满了就拷贝到更大的数组(约 1.5 倍)。",
      },
      {
        en: "The other way round: ArrayList has add, remove, contains, and more, while int[] only has length.",
        zh: "反了:ArrayList 有 add / remove / contains 等一整套方法,int[] 只有 length。",
      },
    ],
    why: {
      en: "int[] is a fixed-length array of primitives. ArrayList holds an Object[] and grows it by about 1.5, and generics can only hold wrapper objects such as Integer, so numeric work pays for boxing and unboxing.",
      zh: "int[] 是定长的原始类型数组;ArrayList 底层是 Object[],按约 1.5 倍扩容,泛型只能装 Integer 这类包装对象,数值密集场景要付出装箱 / 拆箱的代价。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In JavaScript, what are the complexities of arr.pop() and arr.shift()?",
      zh: "JavaScript 里 arr.pop() 和 arr.shift() 的复杂度分别是?",
    },
    opts: [
      {
        en: "pop is O(1) and shift is O(n), because removing the first element shifts all the others",
        zh: "pop 是 O(1),shift 是 O(n) —— 移除头部元素后所有元素都要前移",
      },
      {
        en: "Both are O(1), the two ends behave the same",
        zh: "都是 O(1),两端操作没区别",
      },
      { en: "Both are O(n)", zh: "都是 O(n)" },
      { en: "pop is O(n) and shift is O(1)", zh: "pop 是 O(n),shift 是 O(1)" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Only the end of an array is free. Once the first element is removed, every remaining index drops by one, so everything moves.",
        zh: "数组只有尾部是自由的:头部被移除后,剩下所有元素的下标都要减一,必须集体搬动。",
      },
      {
        en: "pop touches only the last slot and moves nothing, so it is O(1).",
        zh: "pop 只动最后一格,不需要搬动任何元素,是 O(1)。",
      },
      {
        en: "The two are the other way round: pop at the end moves nothing, while shift at the front moves everything.",
        zh: "方向反了:尾部 pop 无人需要挪动;头部 shift 才要全体前移。",
      },
    ],
    why: {
      en: "For the same reason push is O(1) and unshift is O(n). If you need to work at both ends, use a deque (chapter 5).",
      zh: "同理 push 是 O(1)、unshift 是 O(n)。需要频繁在头部操作,就该换成双端队列(第 5 章)。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which of these array operations are O(1)? (Select all that apply.)",
      zh: "以下哪些数组操作是 O(1)?(多选)",
    },
    opts: [
      { en: "Reading arr[i] by index", zh: "按下标读取 arr[i]" },
      { en: "Writing arr[i] = x by index", zh: "按下标覆写 arr[i] = x" },
      {
        en: "Appending at the end when there is free capacity",
        zh: "尾部追加(容量足够时)",
      },
      {
        en: "Inserting an element in the middle",
        zh: "在中间位置插入一个元素",
      },
    ],
    correct: [0, 1, 2],
    missHint: {
      en: "Reading, writing, and appending into free capacity all move no other element. Check which one you left out.",
      zh: "读、写、以及容量足够时的尾部追加都不需要搬动任何其他元素 —— 再检查一遍你漏了哪个。",
    },
    extraHint: {
      en: "Inserting in the middle shifts every element on the right by one slot, so it is O(n) and does not belong here.",
      zh: "中间插入必须把右侧元素全部右移一格,是 O(n),不能选它。",
    },
    why: {
      en: "Any operation that moves no other element is O(1). Any operation that has to make room or close a gap is O(n). That one rule produces the whole complexity table for arrays.",
      zh: "凡是不需要搬动其他元素的操作都是 O(1);凡是要腾位置或补空位的都是 O(n)。用这一条就能推出数组的整张复杂度表。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          A matrix with 3 rows and 5 columns is flattened into one array in
          row-major order. What is the flat index of <code>matrix[2][3]</code>?
        </>
      ),
      zh: (
        <>
          一个 3 行 5 列的矩阵按行优先铺平成一维数组,<code>matrix[2][3]</code>{" "}
          对应的一维下标是?
        </>
      ),
    },
    placeholder: { en: "Type the index…", zh: "输入下标…" },
    answers: ["13"],
    hint: {
      en: "The formula: row × number of columns + column = 2 × 5 + 3.",
      zh: "公式:行号 × 列数 + 列号 = 2 × 5 + 3。",
    },
    why: {
      en: "2 × 5 + 3 = 13. Two dimensions are a way of reading one dimension, using the same multiply-and-add formula.",
      zh: "2 × 5 + 3 = 13。二维只是一维的一种读法,用的还是那条乘加公式。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In a hand-written dynamic array, if the resize added only one slot instead of doubling the capacity, what would n appends cost in total?",
      zh: "手写动态数组时,如果把「容量翻倍」改成「每次只 +1 个格子」,连续追加 n 次的总代价会变成?",
    },
    opts: [
      {
        en: "O(n²), because every append copies everything: 1+2+…+n",
        zh: "O(n²) —— 每次追加都触发一次全量拷贝,1+2+…+n",
      },
      {
        en: "Still O(1) amortized, the growth strategy does not matter",
        zh: "还是均摊 O(1),扩容策略不影响总代价",
      },
      { en: "O(n log n)", zh: "O(n log n)" },
      {
        en: "O(n), with a slightly larger constant",
        zh: "O(n),只是常数略大",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "The amortized O(1) result comes from growing by a factor. That makes resizes rarer and rarer. With +1, every single append copies the whole array.",
        zh: "均摊 O(1) 正是「按倍数增长」换来的:倍增让扩容越来越稀疏;+1 策略下每次追加都要搬全部元素。",
      },
      {
        en: "Nothing here halves a range at each step, so no logarithm appears.",
        zh: "这里没有任何「每步减半」的结构,log 不会凭空出现。",
      },
      {
        en: "The total number of copies is 1+2+…+n ≈ n²/2, so the total cost is O(n²), not O(n).",
        zh: "总拷贝量是 1+2+…+n ≈ n²/2,所以总代价是 O(n²),不是 O(n)。",
      },
    ],
    why: {
      en: "With a +1 resize, the k-th append copies k−1 old elements, so the total is 1+2+…+n = O(n²). Growing by a factor is what spreads the copying thin enough to give O(1) amortized.",
      zh: "+1 扩容时,第 k 次追加要拷贝 k−1 个旧元素,总代价 1+2+…+n = O(n²)。按倍数增长才能把搬动摊薄成均摊 O(1),这是动态数组设计的关键。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Binary search runs in O(log n) only when two conditions hold at the same time. Which two?",
      zh: "二分查找能做到 O(log n),需要同时满足哪两个前提?",
    },
    opts: [
      {
        en: "The data is sorted, and it supports O(1) random access (an array, for example)",
        zh: "数据有序 + 支持 O(1) 随机访问(比如数组)",
      },
      {
        en: "Sorted is enough, the storage does not matter",
        zh: "数据有序就够了,存在哪都行",
      },
      {
        en: "An array is enough, sorted or not",
        zh: "只要是数组就行,有没有序无所谓",
      },
      {
        en: "The data must be smaller than one million elements",
        zh: "数据量必须小于一百万",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "You cannot binary search a sorted linked list: reaching the middle element already takes O(n) steps. Random access is required.",
        zh: "有序链表没法二分:光是走到「中间那个」就要 O(n) 步 —— 随机访问不能缺。",
      },
      {
        en: "In an unsorted array, after comparing with the middle you still do not know which half to keep. Sorted order is required.",
        zh: "无序数组里,和中间元素比完仍然不知道该留哪一半 —— 有序不能缺。",
      },
      {
        en: "Binary search has no size limit. The larger the input, the bigger its advantage.",
        zh: "二分对规模没有上限,规模越大它的优势越明显。",
      },
    ],
    why: {
      en: "Sorted order is what makes 'which half can I discard' answerable. Random access is what makes 'jump to the middle' O(1). Only together do they give log n, and that combination is what an array provides.",
      zh: "有序保证「该丢哪一半」可以判断,随机访问保证「跳到中间」是 O(1)。两者合力才有 log n,而这正是数组能提供的组合。",
    },
  },
];
