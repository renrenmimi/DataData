// Chapter 10 · Tries (prefix trees) — problem set and quiz data (English default / Chinese toggle).
// Problems focus on three patterns — prefix matching, dictionary trie, and 0-1 trie — ordered from
// easy to hard; hint points a direction without spoilers, key explains the optimal solution in one
// paragraph.
//
// Bilingual: title / tags / hint / key / q / opts / why are all written as { en, zh },
// and the en side of each problem title uses the official LeetCode English name.

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

export const PROBLEMS: Problem[] = [
  {
    lc: 208,
    title: {
      en: "Implement Trie (Prefix Tree)",
      zh: "实现 Trie(前缀树)",
    },
    d: "medium",
    tags: [
      { en: "Template", zh: "模板题" },
      { en: "Trie", zh: "字典树" },
    ],
    hint: {
      en: "§04 of this chapter is the complete answer. A node holds children (a map, or an array of fixed alphabet size) plus one boolean isEnd. All three methods do the same thing: walk down the path.",
      zh: "本章 §04 就是它的完整答案。节点 = children(Map 或定长数组)+ isEnd 布尔位,三个方法都在「沿路径走」。",
    },
    key: {
      en: (
        <>
          insert: follow the characters, create a node wherever the edge is
          missing, and set isEnd = true on the last node. search: follow the
          characters, and return true only if you arrive and that node has isEnd
          = true. startsWith: the same walk, but arriving is enough — isEnd is
          not checked. All three cost O(L), where L is the length of the string
          you passed in. The number of words already stored does not appear in
          that cost. Every later Trie problem adds something to these three
          skeletons.
        </>
      ),
      zh: (
        <>
          insert:沿字符走,缺哪条边就新建节点,末节点 isEnd = true。search:
          同样走到底,还要求末节点 isEnd = true 才算命中。startsWith:走得通即可,
          不看 isEnd。三个方法都是 O(L),L = 传入字符串的长度 ——
          词典里已经存了多少词,不出现在这个代价里。所有后续 Trie
          题都在这三块骨架上加东西。
        </>
      ),
    },
  },
  {
    lc: 211,
    title: {
      en: "Design Add and Search Words Data Structure",
      zh: "添加与搜索单词 - 数据结构设计",
    },
    d: "medium",
    tags: [
      { en: "Trie", zh: "字典树" },
      { en: "DFS", zh: "DFS" },
      { en: "Wildcard", zh: "通配符" },
    ],
    hint: {
      en: "A normal letter tells you which edge to take. A '.' does not, so try every child edge in turn.",
      zh: "普通字母告诉你该走哪条边;'.' 不告诉你,那就每条子边都试一遍。",
    },
    key: {
      en: (
        <>
          addWord is the same as LC 208. search becomes a recursive walk dfs
          (word, i, node). A normal character recurses into that one child. A
          '.' loops over <b>every child of the current node</b> and recurses into
          each one, returning true as soon as any branch succeeds. At the end of
          the word, check isEnd. The worst case, a pattern made only of dots,
          fans out to O(26^L), but the search also never visits more nodes than
          the trie contains, and a missing edge stops a branch immediately. This
          is the smallest example of Trie plus backtracking.
        </>
      ),
      zh: (
        <>
          addWord 与 LC 208 相同。search 改成递归 dfs(word, i, node):普通字符只往对应
          child 递归;遇到 '.' 就遍历<b>当前节点的所有 child</b> 分别递归,
          任意一条返回 true 就立刻返回。走到词尾看 isEnd。最坏情况(全是 '.')会扇出到
          O(26^L),但搜索访问的节点数同时也不会超过整棵树的节点数,而且缺边会立刻中断一条分支。
          这是「Trie + 回溯」的最小案例。
        </>
      ),
    },
  },
  {
    lc: 648,
    title: { en: "Replace Words", zh: "单词替换" },
    d: "medium",
    tags: [
      { en: "Trie", zh: "字典树" },
      { en: "Prefix matching", zh: "前缀匹配" },
    ],
    hint: {
      en: "Put every root word into a trie. For each word in the sentence, walk down from the top and stop at the first node with isEnd = true. That node is the shortest matching root.",
      zh: "把所有词根放进 Trie。对句子里的每个单词,从根沿 Trie 走,第一次遇到 isEnd 就停 —— 那就是最短词根。",
    },
    key: {
      en: (
        <>
          Build the trie from the root words. For each word in the sentence,
          descend from the root one character at a time. As soon as the current
          node has isEnd = true, a root word matches this prefix, so replace the
          word and stop. If the path breaks, or you reach the end of the word
          without meeting isEnd, keep the original word. Each word costs O(its
          own length). This is the most direct use of a trie as a prefix test.
        </>
      ),
      zh: (
        <>
          用词根建 Trie。遍历句子里每个单词,从 root 逐字符下沉:一旦当前节点 isEnd =
          true,说明有词根匹配这段前缀,替换并停止;若中途断路或走完仍没遇到 isEnd,
          保留原词。每个单词 O(自身长度)。这题把「用 Trie 判前缀」用得最直白。
        </>
      ),
    },
  },
  {
    lc: 677,
    title: { en: "Map Sum Pairs", zh: "键值映射" },
    d: "medium",
    tags: [
      { en: "Trie", zh: "字典树" },
      { en: "Prefix sum", zh: "前缀求和" },
    ],
    hint: {
      en: "insert stores val on the last node. sum(prefix) walks to the prefix node, then adds up the values of every word in the subtree below it.",
      zh: "insert 时把 val 存在末节点;sum(prefix) = 先走到前缀节点,再把它子树里所有词的 val 加起来。",
    },
    key: {
      en: (
        <>
          Store one more field, val, on the node where a key ends. sum(prefix)
          walks O(L) to the prefix node, then runs a DFS over that subtree and
          adds up every stored val. There is a faster version: on insert,
          compute delta = new value − old value for this key, and add delta to a
          running prefix total kept on <b>every node along the path</b>. sum then
          reads one number and costs O(L). The pattern worth remembering is
          storing an aggregate on the node itself.
        </>
      ),
      zh: (
        <>
          在键结束的那个节点上多存一个 val。sum(prefix):先 O(L) 走到前缀节点,
          再 DFS 这棵子树累加所有 val。还有更快的写法:insert 时算出 delta =
          新值 − 该 key 的旧值,把 delta 加到<b>路径上每个节点</b>维护的「前缀累加值」上,
          sum 就变成读一个数、O(L)。值得记住的套路是「把聚合信息挂在节点上」。
        </>
      ),
    },
  },
  {
    lc: 720,
    title: { en: "Longest Word in Dictionary", zh: "词典中最长的单词" },
    d: "medium",
    tags: [
      { en: "Trie", zh: "字典树" },
      { en: "DFS", zh: "DFS" },
    ],
    hint: {
      en: "A word qualifies only if every one of its prefixes is also a word in the dictionary, which means every node along its path must have isEnd = true.",
      zh: "一个词能入选,要求它的每一个前缀也都是词典里的词 —— 也就是路径上每个节点都得 isEnd = true。",
    },
    key: {
      en: (
        <>
          Build the trie, then run a DFS that only descends into children with
          isEnd = true. That rule is exactly the requirement that every prefix is
          also a word. Keep the longest word you can reach. If two are the same
          length, the answer is the smaller one in alphabetical order, and
          visiting children from a to z and only replacing the answer when the
          new word is strictly longer gives that for you. The problem is a search
          for the longest chain where every step is itself valid.
        </>
      ),
      zh: (
        <>
          建 Trie 后 DFS,只往 isEnd = true 的子节点走 —— 这条规则正好等价于
          「每个前缀也是单词」。记录能到达的最长单词;长度相同取字典序最小,
          按 a→z 顺序遍历子节点、且只在严格更长时才替换答案,就自然满足。
          本质是在 Trie 上找「每一步都合法」的最长链。
        </>
      ),
    },
  },
  {
    lc: 1268,
    title: { en: "Search Suggestions System", zh: "搜索推荐系统" },
    d: "medium",
    tags: [
      { en: "Trie", zh: "字典树" },
      { en: "Autocomplete", zh: "自动补全" },
    ],
    hint: {
      en: "This is a search box in miniature: after each typed letter, return the 3 alphabetically smallest products that start with what has been typed so far.",
      zh: "这就是搜索框补全的原型:每输入一个字母,给出以当前已输入内容为前缀、字典序最小的 3 个商品。",
    },
    key: {
      en: (
        <>
          Build the trie and keep, on each node, a list of the 3 alphabetically
          smallest words under that prefix. Maintain the list during insertion
          and drop the largest whenever it grows past 3. As the user types, walk
          one node per character and read the list directly. Once the path
          breaks, every later answer is empty. Sorting the words and binary
          searching also solves the problem, but the trie version turns prefix to
          suggestions into a single read, which is how autocomplete is usually
          built.
        </>
      ),
      zh: (
        <>
          建 Trie,并在每个节点上存「该前缀下字典序最小的 3 个词」;插入时维护这个列表,
          超过 3 个就丢掉最大的。用户逐字符输入时每次下沉一个节点,直接读节点上的列表;
          一旦断路,后续答案全为空。排序 + 二分也能做,但 Trie 版把「前缀 → 候选」
          变成一次读取,工程里的补全就是这么搭的。
        </>
      ),
    },
  },
  {
    lc: 212,
    title: { en: "Word Search II", zh: "单词搜索 II" },
    d: "hard",
    tags: [
      { en: "Trie", zh: "字典树" },
      { en: "Grid backtracking", zh: "网格回溯" },
      { en: "Pruning", zh: "剪枝" },
    ],
    hint: {
      en: "Running a separate grid search for each word is too slow. Turn it around: build one trie from all the words and let a single DFS follow the trie, turning back as soon as the prefix does not exist.",
      zh: "对每个词单独在网格里回溯会超时。反过来:把所有词建成一棵 Trie,让 DFS 沿着 Trie 走 —— 前缀不存在就立刻掉头。",
    },
    key: {
      en: (
        <>
          Build a trie from words and store the whole word on its last node. Then
          DFS from every cell, <b>moving down the trie in step with the grid</b>.
          If the current letter has no matching child in the trie,{" "}
          <b>return immediately</b> — no word starts this way, so the entire
          branch can be dropped. That single check is what removes most of the
          search. When you land on a node that holds a word, collect it and clear
          the field so it is not collected twice. One grid traversal tests all
          the words at once, because words that share a prefix share one path.
        </>
      ),
      zh: (
        <>
          把 words 建成 Trie,词尾节点上存整个单词。从每个格子出发 DFS,
          <b>在网格上走一步,就在 Trie 上下沉一步</b>:当前字母在 Trie 里没有对应
          child 就<b>立刻返回</b> —— 没有任何词这样开头,整条分支可以直接丢掉。
          正是这一步砍掉了大部分搜索。走到存着单词的节点就收集它,并把该字段清空以免重复收集。
          共享前缀的词共用一条路径,所以一次网格遍历就把所有词一起测完了。
        </>
      ),
    },
  },
  {
    lc: 421,
    title: {
      en: "Maximum XOR of Two Numbers in an Array",
      zh: "数组中两个数的最大异或值",
    },
    d: "hard",
    tags: [
      { en: "0/1 Trie", zh: "0-1 Trie" },
      { en: "Bit manipulation", zh: "位运算" },
      { en: "Greedy", zh: "贪心" },
    ],
    hint: {
      en: "Insert each number into a trie that has only two branches, 0 and 1, one bit at a time from the highest bit down. XOR gives 1 on a bit exactly when the two bits differ, so at every bit you want the opposite one.",
      zh: "把每个数按二进制从高位到低位插进一棵「只有 0/1 两个分支」的 Trie。异或在某一位得 1,当且仅当两个比特不同 —— 所以每一位都想找和自己相反的比特。",
    },
    key: {
      en: (
        <>
          Build a 0/1 trie: read each number from its highest bit (bit 30 is
          enough for values below 2^31) down to bit 0, taking the 0 branch or the
          1 branch. Then walk each number through the tree again and{" "}
          <b>prefer the branch holding the opposite bit at every level</b>. If
          that branch exists, this bit of the XOR becomes 1, and a higher bit is
          always worth more than all lower bits together, so the greedy choice is
          safe. Keep the largest result. The cost is O(n × number of bits), which
          replaces the O(n²) comparison of every pair. This is the classic step
          from storing characters to storing bits.
        </>
      ),
      zh: (
        <>
          建 0/1 Trie:每个数从最高位(小于 2^31 的数,第 30 位就够)读到第 0 位,
          按该位取 0 分支或 1 分支插入。再让每个数走一遍,
          <b>每一层都优先拐向与自己相反的比特</b>:该分支存在,这一位异或就得 1;
          而高位的价值永远大于其后所有低位之和,所以这样贪心是安全的。取全局最大值。
          代价 O(n × 位数),取代了 O(n²) 的两两配对。这是 Trie 从「存字符」推广到「存比特」的经典一步。
        </>
      ),
    },
  },
];

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: (
        <>
          A trie holds <b>500,000</b> English words. Roughly how many steps does
          it take to check whether <code>apple</code> is one of them?
        </>
      ),
      zh: (
        <>
          一棵 Trie 里存了 <b>50 万</b>个英文单词。查询单词 <code>apple</code>{" "}
          是否存在,大致要走多少步?
        </>
      ),
    },
    opts: [
      {
        en: "About 5, the length of the word, no matter how many words are stored",
        zh: "约 5 步(= 单词长度),和词典里有多少词无关",
      },
      {
        en: "About 500,000, because every stored word has to be checked",
        zh: "约 50 万步,要扫遍所有单词",
      },
      { en: "About log2(500,000), roughly 19", zh: "约 log₂(50万) ≈ 19 步" },
      { en: "About 26 × 5", zh: "约 26 × 5 步" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A trie is not scanned. It follows the single path a, p, p, l, e, so it reaches the end after 5 steps.",
        zh: "Trie 不是线性扫描 —— 它顺着 a→p→p→l→e 这一条路径下沉,5 步就到底了。",
      },
      {
        en: "log n is the cost of binary search or a balanced tree. In a trie the cost is decided by the length of the word, and the number of stored words n does not appear in it.",
        zh: "log n 是二分 / 平衡树的复杂度。Trie 的查询代价只由「词有多长」决定,词的数量 n 不出现在里面。",
      },
      {
        en: "Each step is one child lookup: an array index, or a map lookup that is O(1) on average. You do not examine all 26 slots, so the total is the length of the word, 5.",
        zh: "每一步只是一次 child 查找(数组下标,或平均 O(1) 的 Map 查找),并不需要看遍 26 个槽,所以总步数就是词长 5。",
      },
    ],
    why: {
      en: "insert, search, and startsWith all cost O(L), where L is the length of the string you passed in. Growing the dictionary from 1 word to 500,000 does not change the cost of looking up apple: it is still 5 steps. This independence from the number of stored keys is the property a trie is chosen for.",
      zh: "insert / search / startsWith 全是 O(L),L = 传入字符串的长度。词典从 1 个词涨到 50 万个词,查 apple 依旧是 5 步 —— 「代价与已存词数无关」正是选择 Trie 的理由。",
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          A trie already contains <code>cat</code> and <code>cattle</code>. What
          goes wrong if a node has <b>no</b> isEnd flag?
        </>
      ),
      zh: (
        <>
          Trie 里已插入 <code>cat</code> 和 <code>cattle</code>。如果节点<b>不设</b>{" "}
          isEnd 标记,会发生什么?
        </>
      ),
    },
    opts: [
      {
        en: 'You cannot tell "cat is a stored word" from "cat is only part of the path to cattle", so search("cat") answers wrongly',
        zh: '无法区分「cat 是一个词」和「cat 只是通往 cattle 路上的一段」,search("cat") 会答错',
      },
      {
        en: "Nothing. If the path exists, the string is a word",
        zh: "没影响,能走到底就说明是单词",
      },
      { en: "cattle can no longer be stored", zh: "cattle 会存不进去" },
      {
        en: "cat and cattle are treated as the same word",
        zh: "会把 cat 和 cattle 当成同一个词",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "A complete path only proves the string is a prefix of something. The nodes c, a, t are also on the path to cattle, so without isEnd there is nothing that says cat was inserted as a word of its own.",
        zh: "路径走得通只能说明这是某个词的前缀。c-a-t 这三个节点同时也在 cattle 的路径上,没有 isEnd,就没有任何东西说明 cat 自己被插入过。",
      },
      {
        en: "cattle still fits. It shares the c-a-t prefix with cat and continues with t, l, e. The problem appears when reading, not when writing.",
        zh: "cattle 照样存得进 —— 它和 cat 共享 c-a-t,后面继续接 t-l-e。问题出在「读」,不在「写」。",
      },
      {
        en: "They are two words of different length lying on one path, so they are never confused with each other. Removing isEnd breaks the answer to \"is this a word\", not the storage.",
        zh: "两者是同一条路径上不同长度的两个词,不会被混为一谈。缺 isEnd 影响的是「这是不是一个词」的判定,不是存储。",
      },
    ],
    why: {
      en: 'isEnd answers one question: does a stored word end at this node? The t node of cat must have isEnd = true. Otherwise search("cat") walks the full path, reads isEnd = false, and reports that cat is only a prefix. Nothing else in the structure can carry that information, because the node itself does not store a key — the path does.',
      zh: "isEnd 只回答一个问题:有没有某个被存过的词在这个节点结束?cat 的 t 节点必须 isEnd = true,否则 search(\"cat\") 走到底看到 isEnd = false,会报「只是前缀」。结构里没有别的东西能承载这个信息 —— 节点本身并不存 key,存 key 的是路径。",
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          Which requirement is the clearest sign that you need a trie and a hash
          table will not do?
        </>
      ),
      zh: <>下面哪种需求,是「该换 Trie、哈希表答不了」的最强信号?</>,
    },
    opts: [
      {
        en: 'Prefix and completion queries, such as "list every word starting with ca"',
        zh: "「找出所有以 ca 开头的单词」这类前缀 / 补全查询",
      },
      {
        en: "Checking whether one exact word is in the dictionary",
        zh: "判断某个单词在不在词典里",
      },
      { en: "Counting how many times each word occurs", zh: "统计每个单词出现了几次" },
      { en: "Picking a random word", zh: "给单词随机取一个" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "An exact membership test is what a hash table is for. It is O(1) on average with respect to the number of stored keys, and no trie is needed.",
        zh: "精确判断某个键在不在,正是哈希表的岗位:对「已存键数」而言平均 O(1),不需要 Trie。",
      },
      {
        en: "Counting is a map from word to count, which a hash table does directly. A trie has no advantage here.",
        zh: "计数就是「词 → 次数」的映射,哈希表直接做。Trie 在这里没有优势。",
      },
      {
        en: "Random selection works with an array or a hash table, and has nothing to do with prefixes.",
        zh: "随机取值用数组或哈希表都行,和前缀无关。",
      },
    ],
    why: {
      en: 'A hash table turns the whole key into one number, so keys that begin the same way land in unrelated places. To answer "which words start with ca" it has to read every stored key, which is O(N·L). A trie keeps words with a shared beginning on one shared path: walk to the ca node and the subtree below it is the answer. The reason to reach for a trie is this query, not raw speed.',
      zh: "哈希表把整个 key 算成一个数,开头相同的键因此落在毫不相干的位置。要回答「哪些词以 ca 开头」,它只能读遍所有键,O(N·L)。Trie 把开头相同的词放在同一条路径上:走到 ca 节点,它下面的子树就是答案。选 Trie 的理由是这类查询,不是「更快」。",
    },
  },
  {
    type: "multi",
    q: {
      en: (
        <>
          A node can store its children in a <b>fixed array of 26 slots</b> or in
          a <b>hash map</b>. Which statements are correct? (select all)
        </>
      ),
      zh: (
        <>
          children 用「<b>定长 26 槽数组</b>」还是「<b>哈希表 Map</b>」,
          以下说法正确的有?(多选)
        </>
      ),
    },
    opts: [
      {
        en: "Array: the index c − 'a' reaches the child directly, with the smallest constant factor",
        zh: "数组版:下标 c − 'a' 直接定位,常数最小、访问最快",
      },
      {
        en: "Array: a node with one child still holds 26 pointers, which wastes memory on sparse data",
        zh: "数组版:即使某节点只有 1 个孩子,也固定占 26 个指针,数据稀疏时费内存",
      },
      {
        en: "Map: it stores only the children that exist, saving memory, and it accepts any character set, including uppercase and non-ASCII",
        zh: "Map 版:只存实际存在的孩子,省内存,且任意字符集都能用(大小写、非 ASCII 都行)",
      },
      {
        en: "Map: one child lookup costs O(number of stored words)",
        zh: "Map 版:单次 child 查找是 O(词典大小)",
      },
    ],
    correct: [0, 1, 2],
    missHint: {
      en: "One is missing. The array gives direct indexing but a fixed 26 slots per node. The map gives smaller memory on sparse data and an unrestricted character set. Look again at which of those you left out.",
      zh: "少选了一项。数组是「下标直达」但「每节点固定 26 槽」;Map 是「稀疏时省内存」且「字符集不受限」。再看看漏了哪个。",
    },
    extraHint: {
      en: "The last option is wrong. A hash map lookup is O(1) on average regardless of how many words the trie stores. It is not linear in the dictionary size.",
      zh: "最后一项错了:哈希表查 child 平均 O(1),和 Trie 里存了多少词无关,不是线性。",
    },
    why: {
      en: "The array of 26 is indexed by c − 'a', which is as fast as a child lookup gets, but it only works for lowercase ASCII letters and every node pays for 26 pointers whether it uses them or not. A map stores the children that exist, so sparse data costs much less memory, and any character can be a key; the price is a slightly larger constant factor. Use the array for lowercase-only practice problems, and a map when the input has digits, mixed case, or non-ASCII text.",
      zh: "26 槽数组用 c − 'a' 定位,是最快的一种 child 查找,但它只适用于小写 ASCII 字母,而且每个节点无论用不用都要为 26 个指针买单。Map 只存实际存在的孩子,稀疏数据省下大量内存,任何字符都能当键,代价是常数略大。刷「只有小写字母」的题用数组;输入含数字、大小写混合或非 ASCII 时用 Map。",
    },
  },
  {
    type: "choice",
    q: {
      en: (
        <>
          In one trie, what is the only difference between{" "}
          <code>search(word)</code> and <code>startsWith(prefix)</code>?
        </>
      ),
      zh: (
        <>
          同一棵 Trie 上,<code>search(word)</code> 和{" "}
          <code>startsWith(prefix)</code> 的唯一区别是?
        </>
      ),
    },
    opts: [
      {
        en: "Both walk the same path from the root; search additionally requires isEnd = true on the last node, startsWith only requires that the path exists",
        zh: "两者都从根沿同一条路径走;search 还要求末节点 isEnd = true,startsWith 只要路径走得通",
      },
      {
        en: "search starts at the root, startsWith starts at a leaf",
        zh: "search 从根走,startsWith 从叶子走",
      },
      {
        en: "startsWith is slower because it has to visit the whole subtree",
        zh: "startsWith 更慢,要遍历整棵子树",
      },
      { en: "search is O(L) and startsWith is O(1)", zh: "search 是 O(L),startsWith 是 O(1)" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Both start at the root and descend one character at a time. The difference appears only after arriving.",
        zh: "两者都从 root 逐字符下沉,方向一样,区别只出现在到达之后。",
      },
      {
        en: "startsWith visits no subtree. It returns true as soon as it reaches the last node of the prefix, so it is also O(L). Collecting the words under that prefix is a separate operation.",
        zh: "startsWith 不遍历子树 —— 走到前缀末节点就返回 true,同样 O(L)。「收集该前缀下的所有词」是另一个操作。",
      },
      {
        en: "Both are O(L), where L is the length of the string passed in.",
        zh: "两者都是 O(L)(L = 传入字符串的长度),复杂度相同。",
      },
    ],
    why: {
      en: "They share the same walk from the root, so both are O(L). search then checks isEnd on the last node, because a path that exists may only be a prefix. startsWith skips that check. One line separates exact matching from prefix matching.",
      zh: "它俩共用「从 root 逐字符走」的过程,都是 O(L)。search 到达后要检查末节点的 isEnd,因为走得通的路径可能只是前缀;startsWith 不做这个检查。一行之差,分开了「精确匹配」和「前缀匹配」。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          For maximum XOR of two numbers (LC 421), each integer is inserted into
          a special trie <b>one bit at a time</b>. Every node in that tree has
          only a <code>0</code> branch and a <code>1</code> branch. It is usually
          called a &quot;____ trie&quot;. (write the two digits with a slash
          between them)
        </>
      ),
      zh: (
        <>
          为求「数组中两个数的最大异或值」(LC 421),我们把每个整数<b>逐位</b>
          插入一棵特殊的 Trie。这棵树的每个节点只有 <code>0</code> 和{" "}
          <code>1</code> 两个分支,通常被称为「____ Trie」。(用斜杠连接两个数字)
        </>
      ),
    },
    placeholder: { en: "for example x/y", zh: "例如 x/y 形式" },
    answers: [
      "0/1",
      "01",
      "0-1",
      "0/1 trie",
      "01trie",
      "0-1trie",
      "binary",
      "binarytrie",
      "bitwise",
      "二进制",
    ],
    hint: {
      en: "A branch can only mean one of two things: the bit is 0, or the bit is 1. Join those two digits with a slash.",
      zh: "分支只有两种取值:比特 0 或比特 1。把这两个数字用斜杠连起来。",
    },
    why: {
      en: "A 0/1 trie, also called a binary or bitwise trie, treats an integer as a fixed-length bit string, for example 32 bits, and inserts it from the highest bit down. Each level picks a branch by that bit. For maximum XOR you then prefer, at every level, the branch holding the opposite bit, which turns the O(n²) comparison of all pairs into O(n × number of bits). It is the standard way to extend a trie from characters to bits.",
      zh: "0/1 Trie(也叫二进制 Trie / bitwise trie)把整数看成定长比特串(比如 32 位),从最高位往下插入,每层按该位选分支。求最大异或时,每一层都优先拐向相反的比特,就把 O(n²) 的两两配对压成 O(n × 位数)。这是把 Trie 从「存字符」推广到「存比特」的标准做法。",
    },
  },
];
