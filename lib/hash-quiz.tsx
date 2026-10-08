// Chapter 6 · Hash tables — closing quiz (the problem set is in lib/hash-problems.tsx).
//
// Bilingual: every question, option and explanation is a { en, zh } pair.

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "multi",
    q: {
      en: "Which of these must a usable hash function satisfy? (select all)",
      zh: "一个合格的哈希函数,必须满足以下哪些要求?(多选)",
    },
    opts: [
      {
        en: "Deterministic: the same key always produces the same value",
        zh: "确定性:同一个 key,今天算明天算结果必须相同",
      },
      {
        en: "Well spread: keys are distributed over all the buckets instead of piling into a few",
        zh: "均匀性:把 key 尽量平摊到所有桶,别扎堆",
      },
      {
        en: "Fast: computing the hash itself must be close to O(1)",
        zh: "要快:计算本身必须接近 O(1),否则「直达」就是空谈",
      },
      {
        en: "Reversible: you must be able to recover the original key from the hash value",
        zh: "可逆性:必须能从哈希值反推出原始 key",
      },
    ],
    correct: [0, 1, 2],
    missHint: {
      en: "You missed at least one correct option. Determinism means you can find a value again after storing it. Good spread keeps the average lookup constant. Speed keeps the hash itself from eating the time you saved. All three are needed.",
      zh: "少选了:确定性(不然存进去就找不回来)、均匀(不然全挤一个桶,退化成一条长链)、快(不然省下的时间全花在算哈希上)—— 三者缺一不可。",
    },
    extraHint: {
      en: "Reversibility is not required, and it is not even possible. There are more possible keys than hash values, so many keys share one value and the mapping cannot be undone.",
      zh: "可逆不是要求,而且根本做不到:可能的 key 比哈希值多,多个 key 必然映射到同一个值,这个映射天生无法反推。",
    },
    why: {
      en: "Determinism is what makes a stored value findable again. Good spread is what keeps the average cost constant. Speed is what keeps the saved time. Reversibility is a different goal that belongs to encryption, not to hashing.",
      zh: "确定性保证「存得进、取得出」;均匀保证平均代价是常数;快保证省下来的时间没花在算哈希上。可逆是加密的目标,不是哈希的目标。",
    },
  },
  {
    type: "choice",
    q: {
      en: "A string hash can be a number in the hundreds of thousands. Why take it modulo the bucket count at the end?",
      zh: "字符串哈希算出来可能是几十万的大数,为什么最后要对桶数取模(mod)?",
    },
    opts: [
      {
        en: "To bring any hash value into the range 0 to bucketCount − 1, so it can be used as an array index",
        zh: "把任意大的哈希值压缩到 0 ~ 桶数−1,才能当数组下标用",
      },
      {
        en: "Because the modulo operation makes the distribution perfectly even",
        zh: "取模能让哈希分布变得绝对均匀",
      },
      {
        en: "For security, so nobody can work out the key from the bucket number",
        zh: "为了加密,防止别人从桶位反推出 key",
      },
      {
        en: "To keep the hash values sorted, so a binary search can be used later",
        zh: "为了让哈希值有序,方便之后二分查找",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Modulo only narrows the range. How evenly the keys are spread depends on the hash function. A badly chosen bucket count can even make the spread worse, for example when it shares a factor with the values being hashed.",
        zh: "取模只负责压缩范围,均匀与否主要取决于哈希函数本身。桶数选得不好(比如和被哈希的值有公因子)反而更不均匀。",
      },
      {
        en: "A hash table is not a security tool. The modulo is there to produce a legal array index.",
        zh: "哈希表不负责保密 —— 取模是为了得到合法的数组下标,与加密无关。",
      },
      {
        en: "A hash table stores nothing in sorted order and never does a binary search. Everything it does rests on computing an index and jumping straight to it.",
        zh: "哈希表内部完全不排序,也不做二分 —— 它的一切都建立在「算出下标直达」上。",
      },
    ],
    why: {
      en: "The bucket array is an ordinary array, so the index has to fall inside [0, bucketCount − 1]. The modulo is what forces it there. This also explains why every key has to be placed again after the table grows: the bucket count changed, so the result of the modulo changed.",
      zh: "桶数组本质是个数组,下标必须落在 [0, 桶数−1]。mod 就是那道压缩闸门 —— 这也解释了扩容后为什么每个 key 都要重新安家:桶数变了,mod 的结果就变了。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          The load factor is the number of stored entries divided by the number
          of buckets. Above which load factor does a Java HashMap grow by
          default? (write a decimal)
        </>
      ),
      zh: (
        <>
          负载因子(load factor)= 已存元素数 ÷ 桶数。Java HashMap
          默认在负载因子超过多少时扩容?(填一个小数)
        </>
      ),
    },
    placeholder: { en: "0.??", zh: "0.??" },
    answers: ["0.75", ".75", "3/4"],
    hint: {
      en: "It is the balance point between \"buckets too full, many collisions\" and \"buckets too empty, memory wasted\". Three quarters.",
      zh: "在「桶太满冲突多」和「桶太空浪费内存」之间取的平衡点,是四分之三。",
    },
    why: {
      en: "0.75 is a compromise between space and time. Higher, and each bucket holds more entries on average, so the chains get longer and each lookup makes more comparisons. The average stays O(1) as long as the load factor is capped, but the constant grows. Lower, and many buckets sit empty and waste memory. Around 0.75 the chance that one bucket collects a long chain is already very small, assuming the hash spreads the keys well.",
      zh: "0.75 是空间与时间的折中:再高,每个桶平均挂的元素变多,链变长,每次查找要比较的次数变多 —— 只要负载因子有上限,平均仍是 O(1),只是常数变大;再低,大片桶空着浪费内存。在哈希分布良好的前提下,0.75 附近单桶出现长链的概率已经极小。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Lookup in a hash table is O(1) on average but O(n) in the worst case. What causes the worst case?",
      zh: "哈希表平均 O(1),但最坏会退化到 O(n)。什么场景会触发最坏情况?",
    },
    opts: [
      {
        en: "All the keys hash into the same bucket, because the hash function is poor or the keys were crafted on purpose",
        zh: "所有 key 被哈希进同一个桶(哈希函数太差,或被恶意构造的 key 攻击)",
      },
      {
        en: "The table holds too many entries, more than a million",
        zh: "存的元素太多,超过一百万",
      },
      { en: "The keys are strings instead of integers", zh: "key 是字符串而不是整数" },
      {
        en: "The keys were not inserted in sorted order",
        zh: "没有按 key 的字典序插入",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A large number of entries is not the problem. Growing the table increases the bucket count as well, so as long as the keys spread evenly, each bucket still holds a constant number of entries on average.",
        zh: "元素多不是问题 —— 扩容会把桶数同步撑大,只要分布均匀,每桶平均还是常数个。",
      },
      {
        en: "A well designed string hash spreads just as evenly. The type of the key does not decide the cost; the distribution does.",
        zh: "字符串哈希设计得当照样均匀;决定代价的是分布,不是 key 的类型。",
      },
      {
        en: "A hash table does not care about insertion order and does not keep any order.",
        zh: "哈希表不关心插入顺序,也不维护任何顺序。",
      },
    ],
    why: {
      en: "When every key lands in one bucket, the table behaves like a single long list and a lookup has to compare the keys one by one, which is O(n). A HashDoS attack does this on purpose by sending many keys with the same hash. Since Java 8 a bucket that grows past a threshold is converted from a list to a red-black tree, which brings that case down to O(log n).",
      zh: "全部 key 挤进一个桶时,哈希表实际上退化成一条长链,查找要逐个比对,O(n)。HashDoS 攻击就是故意构造大量同哈希的 key 来拖垮服务。Java 8 起,单桶超过阈值会从链表转成红黑树,把这种情况从 O(n) 降到 O(log n)。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In Java you override equals() but forget hashCode(), then use the object as a HashMap key. What happens?",
      zh: "Java 里重写了 equals() 却忘了重写 hashCode(),把对象放进 HashMap 会发生什么?",
    },
    opts: [
      {
        en: "Two objects that are equal can produce different hash codes and land in different buckets, so a value you stored cannot be found",
        zh: "两个「相等」的对象可能算出不同哈希、落进不同的桶 —— 存进去却查不到",
      },
      { en: "It fails to compile", zh: "编译直接报错,根本跑不起来" },
      {
        en: "Nothing changes, because HashMap only uses equals",
        zh: "没有任何影响,HashMap 只看 equals",
      },
      {
        en: "HashMap generates a hashCode from the fields for you",
        zh: "HashMap 会自动帮你按字段生成 hashCode",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "The compiler does not check this; at most an IDE warns you. It is a runtime problem, which makes it harder to notice.",
        zh: "编译器不管这件事,顶多 IDE 给个警告 —— 它是运行期的问题,反而更难发现。",
      },
      {
        en: "The order is the other way around. HashMap uses hashCode to pick the bucket first. If that bucket is wrong, equals is never even called.",
        zh: "顺序恰恰相反:HashMap 先用 hashCode 找桶,桶找错了,equals 根本没机会出场。",
      },
      {
        en: "It does not. The default hashCode is based on object identity, so two new objects with identical fields almost always get different hash codes.",
        zh: "不会。默认 hashCode 基于对象身份,两个字段完全相同的 new 对象,哈希值几乎必然不同。",
      },
    ],
    why: {
      en: "A HashMap lookup has two steps: use hashCode to find the bucket, then use equals inside that bucket. The contract says that equal objects must have equal hash codes, and that is what puts equal objects in the same bucket. Break the contract and the first step already goes to the wrong place.",
      zh: "HashMap 的查找分两步:先用 hashCode 定位桶,再在桶内用 equals 比对。契约「equals 相等的对象,hashCode 必须相等」正是为了让相等的对象进同一个桶。契约一破,第一步就走错了门。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In Python a list cannot be a dict key but a tuple can. What is the underlying reason?",
      zh: "Python 里 list 不能当 dict 的 key,tuple 却可以。根本原因是?",
    },
    opts: [
      {
        en: "A list can be modified. Its hash would have to change with its contents, so a stored entry could never be found again. Python therefore gives list no __hash__ at all",
        zh: "list 可变,内容一变哈希值就该变,存进去就再也找不回来 —— 所以 list 干脆不实现 __hash__",
      },
      { en: "A list is too long, so hashing it is too slow", zh: "list 太长,算哈希太慢" },
      {
        en: "tuple is a privileged type that the language treats specially",
        zh: "tuple 是 Python 的特权类型,语言开的后门",
      },
      {
        en: "A list may contain None, and None cannot be hashed",
        zh: "list 里可能有 None,None 不能参与哈希",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Length has nothing to do with it. A list with two elements raises the same unhashable type error.",
        zh: "长短无关 —— 只有两个元素的 list 照样报 unhashable type。",
      },
      {
        en: "There is no special treatment. A tuple can be hashed because it cannot be modified, and only if everything inside it can be hashed too. A tuple that contains a list is not hashable either.",
        zh: "没有特权:tuple 能哈希是因为它不可变,而且前提是内部元素也全部可哈希 —— 包含 list 的 tuple 同样不行。",
      },
      {
        en: "None can be hashed. hash(None) returns a normal integer and None works fine as a key.",
        zh: "None 完全可以哈希,hash(None) 是个正常整数,它本身也能直接当 key。",
      },
    ],
    why: {
      en: "A hash table decides which bucket an entry goes into using the hash computed at insertion time. If the key is modified afterwards, the recomputed hash points at a different bucket and the entry can no longer be found. Python removes the risk at the source: mutable containers (list, dict, set) have no __hash__, so using one as a key raises TypeError immediately instead of quietly losing data.",
      zh: "哈希表用「存入时算出的哈希」决定条目住哪个桶。key 存进去之后被修改,重新算出的哈希指向别的桶,数据就再也找不到了。Python 从源头掐断这个隐患:可变容器(list / dict / set)一律没有 __hash__,拿它当 key 会立刻抛 TypeError,而不是悄悄丢数据。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In JavaScript, what is the most important difference between using a plain object as a dictionary and using a Map?",
      zh: "JavaScript 里用普通 Object 当字典,和用 Map 相比,最关键的区别是?",
    },
    opts: [
      {
        en: "An object converts its keys to strings, so obj[1] and obj['1'] are the same entry, while a Map accepts a value of any type as a key",
        zh: "Object 的 key 会被强制转成字符串(obj[1] 和 obj['1'] 是同一个),Map 则任何类型都能当 key",
      },
      {
        en: "An object cannot hold more than 100 entries",
        zh: "Object 存不下超过 100 个键值对",
      },
      {
        en: "A Map is ten times slower and only looks nicer",
        zh: "Map 比 Object 慢十倍,只是写法好看",
      },
      {
        en: "They are equivalent, so it is only a matter of style",
        zh: "两者完全等价,纯属风格问题",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "There is no such limit. The problem is the meaning of the keys, not how many there are.",
        zh: "Object 没有这种容量限制 —— 问题在 key 的语义,不在数量。",
      },
      {
        en: "A Map is built for keys that are added and removed often, and it usually performs well there. Speed is not the reason to avoid it.",
        zh: "恰恰相反:Map 就是为频繁增删键设计的,这类场景它通常表现更好 —— 慢不是不用它的理由。",
      },
      {
        en: "They are far from equivalent. An object also inherits keys from its prototype, so \"toString\" in obj is true, while a Map iterates in insertion order and has a size property.",
        zh: "远不等价:Object 还继承了原型上的 key(\"toString\" in obj 就是 true),Map 则保证按插入顺序遍历、有 size 属性。",
      },
    ],
    why: {
      en: "An object key can only be a string or a symbol, so numbers and objects are converted to strings first. It also inherits keys from its prototype, and a key such as __proto__ coming from user input is a real security problem. For a dictionary, prefer Map and Set.",
      zh: "Object 的 key 只能是 string 或 symbol,数字、对象都会先被转成字符串;它还继承原型上的 key,而用户输入的 __proto__ 当 key 是真实存在的安全问题。要「字典」就优先用 Map / Set。",
    },
  },
  {
    type: "choice",
    q: {
      en: "In Python 3.7 and later, in what order does iterating a dict return the keys?",
      zh: "Python 3.7+ 中,遍历 dict 的顺序是?",
    },
    opts: [
      {
        en: "Insertion order, and this is a guarantee of the language, not an accident",
        zh: "保持插入顺序 —— 这是语言规范的正式承诺,不是巧合",
      },
      {
        en: "Completely random, and possibly different on every run",
        zh: "完全随机,每次运行都可能不同",
      },
      { en: "Sorted by key, from smallest to largest", zh: "按 key 从小到大自动排序" },
      { en: "Sorted by hash value", zh: "按哈希值大小排列" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "That was close to the truth before 3.6, when the order was arbitrary and could differ between runs, because hashing of string keys is randomized per process. Since 3.7 insertion order is part of the language specification and can be relied on.",
        zh: "3.6 之前接近如此:顺序是任意的,而且因为字符串 key 的哈希每个进程都带随机盐,不同次运行可能不同。3.7 起插入序写进了语言规范,可以放心依赖。",
      },
      {
        en: "A dict never sorts. If you need sorted keys, call sorted(d) yourself or use another structure, the way Java uses TreeMap.",
        zh: "dict 从不排序 —— 需要有序 key 得自己 sorted(d),或者换一种结构(对比 Java 的 TreeMap)。",
      },
      {
        en: "Modern CPython separates where an entry is stored from where the hash points. A compact array holds the entries in insertion order and the hash table only holds indexes into it, so the iteration order has nothing to do with hash values.",
        zh: "新版 CPython 把「哈希定位」和「存储顺序」分开了:紧凑数组按插入序存条目,哈希表只存下标 —— 所以遍历顺序与哈希值无关。",
      },
    ],
    why: {
      en: "The compact dict introduced in CPython 3.6 preserved insertion order as a side effect of its layout, and 3.7 turned that into a language guarantee. Compare: a Java HashMap keeps no order (use LinkedHashMap if you need it), and a JavaScript Map also guarantees insertion order. A hash table by itself is unordered; a particular implementation may add an order on top.",
      zh: "CPython 3.6 的「紧凑 dict」实现顺带带来了插入序,3.7 把它升格为语言保证。对比:Java HashMap 无序(要顺序用 LinkedHashMap),JS Map 同样保证插入序。哈希表本身无序,具体实现可以在它之上额外提供顺序 —— 这两件事要分清。",
    },
  },
];
