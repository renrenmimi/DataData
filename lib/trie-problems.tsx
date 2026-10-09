// Chapter 10 · Tries (prefix trees) — problem set (English default / Chinese toggle).
// The closing quiz is in lib/trie-quiz.tsx; /atlas imports only this file.
// Problems focus on three patterns — prefix matching, dictionary trie, and 0-1 trie — ordered from
// easy to hard; hint points a direction without spoilers, key explains the optimal solution in one
// paragraph.
//
// Bilingual: title / tags / hint / key are all written as { en, zh },
// and the en side of each problem title uses the official LeetCode English name.

import type { Problem } from "@/lib/problems";

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
          insert:沿字符走,缺哪条边就新建节点,末节点 isEnd = true。search:同样走到底,还要求末节点 isEnd = true 才算命中。startsWith:走得通即可,不看 isEnd。三个方法都是 O(L),L = 传入字符串的长度 ——
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
          child 递归;遇到 '.' 就遍历<b>当前节点的所有 child</b> 分别递归,任意一条返回 true 就立刻返回。走到词尾看 isEnd。最坏情况(全是 '.')会扇出到
          O(26^L),但搜索访问的节点数同时也不会超过整棵树的节点数,而且缺边会立刻中断一条分支。这是「Trie + 回溯」的最小案例。
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
          true,说明有词根匹配这段前缀,替换并停止;若中途断路或走完仍没遇到 isEnd,保留原词。每个单词 O(自身长度)。这题把「用 Trie 判前缀」用得最直白。
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
          在键结束的那个节点上多存一个 val。sum(prefix):先 O(L) 走到前缀节点,再 DFS 这棵子树累加所有 val。还有更快的写法:insert 时算出 delta =
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
          建 Trie 后 DFS,只往 isEnd = true 的子节点走 —— 这条规则正好等价于「每个前缀也是单词」。记录能到达的最长单词;长度相同取字典序最小,按 a→z 顺序遍历子节点、且只在严格更长时才替换答案,就自然满足。本质是在 Trie 上找「每一步都合法」的最长链。
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
          建 Trie,并在每个节点上存「该前缀下字典序最小的 3 个词」;插入时维护这个列表,超过 3 个就丢掉最大的。用户逐字符输入时每次下沉一个节点,直接读节点上的列表;一旦断路,后续答案全为空。排序 + 二分也能做,但 Trie 版把「前缀 → 候选」变成一次读取,工程里的补全就是这么搭的。
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
          child 就<b>立刻返回</b> —— 没有任何词这样开头,整条分支可以直接丢掉。正是这一步砍掉了大部分搜索。走到存着单词的节点就收集它,并把该字段清空以免重复收集。共享前缀的词共用一条路径,所以一次网格遍历就把所有词一起测完了。
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
    d: "medium",
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
          建 0/1 Trie:每个数从最高位(小于 2^31 的数,第 30 位就够)读到第 0 位,按该位取 0 分支或 1 分支插入。再让每个数走一遍,
          <b>每一层都优先拐向与自己相反的比特</b>:该分支存在,这一位异或就得 1;而高位的价值永远大于其后所有低位之和,所以这样贪心是安全的。取全局最大值。代价 O(n × 位数),取代了 O(n²) 的两两配对。这是 Trie 从「存字符」推广到「存比特」的经典一步。
        </>
      ),
    },
  },
];
