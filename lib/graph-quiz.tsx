// Chapter 12 · Graphs — closing quiz (the problem set is in lib/graph-problems.tsx).
//
// Bilingual: every question, option and explanation is a { en, zh } pair.

import type { QuizItem } from "@/lib/quiz";

export const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: {
      en: "A graph has 1,000,000 vertices, but each vertex has about 3 edges on average. Which representation should you use?",
      zh: "一张 100 万个顶点、但平均每个点只有 3 条边的「稀疏图」,应该用哪种表示法?",
    },
    opts: [
      {
        en: "Adjacency list — it stores only the edges that exist, using O(V + E) space",
        zh: "邻接表 —— 只存真实存在的边,空间 O(V + E)",
      },
      {
        en: "Adjacency matrix — checking whether two vertices are joined is O(1)",
        zh: "邻接矩阵 —— 查任意两点有没有边是 O(1)",
      },
      { en: "Either one; there is no difference", zh: "两者都行,没有区别" },
      {
        en: "Edge list, because it uses the least space",
        zh: "边列表,因为它最省空间",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "The O(1) edge test is the matrix's advantage, but it always occupies O(V²). One million squared is one trillion cells, which does not fit in memory. That price is not worth paying for a sparse graph.",
        zh: "查边 O(1) 是矩阵的优点,但它固定占 O(V²):100 万的平方 = 一万亿个格子,内存装不下。稀疏图这代价不值得。",
      },
      {
        en: "The space differs by orders of magnitude: O(V²) for the matrix against O(V + E) for the list. In a sparse graph E is far smaller than V², so the gap is huge.",
        zh: "空间上差着数量级:矩阵 O(V²) vs 邻接表 O(V + E)。稀疏图里 E 远小于 V²,差距巨大。",
      },
      {
        en: "An edge list is compact, but listing the neighbors of one vertex means scanning every edge, which makes BFS and DFS slow. The adjacency list is both compact and easy to traverse.",
        zh: "边列表虽省空间,但「遍历某点的所有邻居」要扫全部边,做 BFS/DFS 时太慢;邻接表才是既省空间又便于遍历的选择。",
      },
    ],
    why: {
      en: "A sparse graph (E much smaller than V²) almost always uses an adjacency list: O(V + E) space, and the neighbors of one vertex come out in O(degree), which is exactly what BFS and DFS need. Consider an adjacency matrix only for a dense graph, or when the program repeatedly asks whether two given vertices are joined.",
      zh: "稀疏图(E 远小于 V²)几乎总用邻接表:空间 O(V + E),且能 O(度数) 地取出一个点的邻居,正好喂给 BFS/DFS。稠密图,或频繁「问两点间有无边」时,才考虑邻接矩阵。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Why must BFS use a queue instead of a stack?",
      zh: "BFS(广度优先)为什么必须用队列,而不是栈?",
    },
    opts: [
      {
        en: "A queue is first in, first out, so a vertex discovered earlier is processed earlier. That is what makes the search spread one layer at a time.",
        zh: "队列先进先出,保证「先被发现的点先被处理」,才能一层一层向外扩散",
      },
      { en: "A queue is faster than a stack", zh: "队列比栈快" },
      {
        en: "It is only a habit; a stack produces the same BFS",
        zh: "只是习惯,用栈也能做出一样的 BFS",
      },
      { en: "Because a stack overflows", zh: "因为栈会溢出" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Both support their basic operations in O(1), so neither is faster. What decides the shape of the traversal is the order: first in first out, or last in first out.",
        zh: "两者基本操作都是 O(1),不存在快慢之分;决定遍历「形状」的是先进先出还是后进先出的顺序。",
      },
      {
        en: "Replace the queue with a stack and the order changes from spreading by layer to going deep along one path. That is DFS, not BFS.",
        zh: "把队列换成栈,遍历顺序就从「按层扩散」变成「一条路走到底」—— 那已经是 DFS 了,不再是 BFS。",
      },
      {
        en: "Stack overflow is about recursion depth. It has nothing to do with choosing a queue here. The queue is chosen for its first-in-first-out order.",
        zh: "栈溢出是递归深度的问题,和这里选队列的理由无关。选队列是为了 FIFO 带来的层次性。",
      },
    ],
    why: {
      en: "First in, first out keeps the vertices of one layer next to each other in the queue, with the next layer behind them. That is the order in which the search spreads outward. A stack (last in, first out) turns the same code into a depth-first search. The layer order is also why BFS finds the fewest-edges path in an unweighted graph.",
      zh: "FIFO 保证同一层的点排在一起、被连续处理,下一层的点排在它们后面 —— 这正是「一圈圈向外扩」的顺序。换成栈(LIFO)就变成深度优先了。这个层次性也是 BFS 能在无权图里求最少边数路径的原因。",
    },
  },
  {
    type: "choice",
    q: {
      en: "What happens if you traverse a graph that contains a cycle and forget to keep a visited set?",
      zh: "遍历一张有环的图时,如果忘了维护 visited 集合,会发生什么?",
    },
    opts: [
      {
        en: "The traversal goes around the cycle forever: an infinite loop, or a stack overflow",
        zh: "沿着环无限打转,栈溢出或死循环",
      },
      {
        en: "It is slower, but the result is still correct",
        zh: "结果慢一点,但仍然正确",
      },
      { en: "It only misses some vertices", zh: "只会漏掉一些点" },
      { en: "Nothing changes", zh: "没有任何影响" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "It is not slower; it never stops. A to B to C to A to B to C, forever returning to vertices it has already left. The program does not terminate.",
        zh: "不是「慢一点」而是「根本停不下来」:A→B→C→A→B→C…… 永远回到走过的点,程序不会终止。",
      },
      {
        en: "The opposite happens. Nothing is missed; the same vertices are visited again and again inside the cycle.",
        zh: "恰恰相反,不是漏点而是「重复访问同一批点」,陷在环里出不来。",
      },
      {
        en: "The effect is fatal. The main difference between a graph and a tree is that a graph can contain a cycle, and visited is the only thing that stops the traversal from going around it.",
        zh: "影响是致命的:图和树最大的区别就是图可能有环,visited 是防止绕圈的唯一保险。",
      },
    ],
    why: {
      en: "A graph may contain a cycle, so without a visited set the traversal runs A to B to C to A forever. The visited set (a boolean array, a Set, or a hash map) records which vertices have already been reached, and the traversal refuses to enter one again. In BFS, mark a vertex when you put it in the queue, not when you take it out, or the same vertex gets queued once per incoming edge.",
      zh: "图可能有环,没有 visited 就会 A→B→C→A 无限循环。visited(布尔数组 / Set / 哈希表)记录「谁已经来过」,遇到已访问的点就不再进入。BFS 里要在「入队时」标记而不是「出队时」标记,否则同一个点会被每一条指向它的边各塞进队列一次。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Why does a binary tree traversal not need a visited set, while a graph traversal does?",
      zh: "为什么二叉树的遍历不需要 visited,而图必须要?",
    },
    opts: [
      {
        en: "A tree is a connected graph with no cycle, so walking down from the root never returns to a vertex you have already seen",
        zh: "树是「无环连通图」,从根往下走永远不会绕回来,所以不会重复访问",
      },
      { en: "A tree has fewer nodes", zh: "树的节点更少" },
      {
        en: "Tree traversal uses recursion and graph traversal uses a loop",
        zh: "树的遍历用递归,图的遍历用循环",
      },
      { en: "A tree has no edges", zh: "树没有边" },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "The number of nodes is irrelevant. Three vertices arranged in a cycle already loop forever without a visited set. The cause is the cycle, not the size.",
        zh: "和节点数量无关:哪怕只有 3 个点,只要它们成环,不用 visited 照样死循环。根源是有没有环。",
      },
      {
        en: "Recursion and iteration are only ways to write the code; a graph DFS can be recursive too. Whether you need visited depends on whether the structure can contain a cycle.",
        zh: "递归和循环都只是实现方式,图的 DFS 也能用递归。是否需要 visited 取决于结构有没有环,不是写法。",
      },
      {
        en: "A tree does have edges: every parent-child link is one. A tree is just a graph that is connected and has no cycle.",
        zh: "树当然有边(父子连线就是边)。树只是「连通且无环」的一种特殊图。",
      },
    ],
    why: {
      en: "A tree is a connected graph with no cycle. Because there is no cycle, walking downward can never return to an ancestor you have already visited, so no visited set is needed. Read it the other way as well: a singly linked list is a graph where each vertex has one outgoing edge, and a tree is a connected acyclic graph. The structures from the earlier chapters are all special cases of a graph.",
      zh: "树 = 连通 + 无环的图。正因为无环,从上往下走绝不会回到已访问的祖先,自然不需要 visited。反过来说,单链表是「每个点只有一条出边」的图,树是「连通无环」的图 —— 前面学的结构都是图的特例。",
    },
  },
  {
    type: "multi",
    q: {
      en: "Which statements about topological sort are correct? (Select all that apply.)",
      zh: "关于拓扑排序(topological sort),以下哪些说法正确?(多选)",
    },
    opts: [
      {
        en: "It is defined only for a directed acyclic graph (DAG)",
        zh: "它只适用于有向无环图(DAG)",
      },
      {
        en: "If some vertices never make it into the result, the graph contains a cycle",
        zh: "如果排完发现有节点没能进入结果序列,说明图中存在环",
      },
      {
        en: "Kahn's algorithm advances by repeatedly removing a vertex whose in-degree is 0",
        zh: "Kahn 算法靠「不断取出入度为 0 的点」来推进",
      },
      {
        en: "An undirected graph can also be sorted topologically",
        zh: "无向图也可以做拓扑排序",
      },
    ],
    correct: [0, 1, 2],
    missHint: {
      en: "A topological order describes which task must come before which. The condition for it to exist, the way it detects a cycle, and the way Kahn's algorithm advances are all correct. Check which one you left out.",
      zh: "拓扑排序刻画的是「先后依赖」;它成立的前提、判环的方法、Kahn 的推进方式,这三条都对 —— 再看看漏了哪个。",
    },
    extraHint: {
      en: "An undirected edge has no direction, so it cannot say which endpoint must come first. A topological order is undefined there, and that option is wrong.",
      zh: "无向边没有方向,谈不上「谁必须在谁之前」,所以无法定义拓扑序 —— 那一项是错的,不能选。",
    },
    why: {
      en: 'A topological sort is meaningful only for a directed acyclic graph, where an edge means "must come before". Kahn\'s algorithm repeatedly takes a vertex with in-degree 0, and on removal decreases the in-degree of each successor by 1. If fewer vertices come out than the graph contains, the rest sit on a cycle, which is exactly how the algorithm detects one. An undirected graph has no direction, so no topological order exists.',
      zh: "拓扑排序只对有向无环图(DAG)有意义:边表示「必须在…之前」。Kahn 法反复取入度为 0 的点,出队时把每个后继的入度减 1;若最终出队数少于总点数,剩下的点就困在环里 —— 这正是它判环的方式。无向图没有方向,不存在拓扑序。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Which method correctly decides whether a directed graph contains a cycle?",
      zh: "要判断一个有向图里是否存在环,下列哪种做法是对的?",
    },
    opts: [
      {
        en: "Run a topological sort (Kahn). If fewer vertices come out of the queue than the graph has, there is a cycle",
        zh: "跑拓扑排序(Kahn),若能出队的点数 < 总点数,则有环",
      },
      {
        en: "If any two vertices point at each other, the whole graph must contain a cycle",
        zh: "只要图里有任意两个点相互指向,就一定整体有环",
      },
      {
        en: "Use union-find as for an undirected graph: if a union finds both ends in the same set, there is a cycle",
        zh: "用无向图的并查集,一旦合并时发现同根就是环",
      },
      {
        en: "Run one BFS; reaching a vertex that is already visited means there is a cycle",
        zh: "BFS 一遍,只要访问到已 visited 的点就是环",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Two vertices pointing at each other (A to B and B to A) is indeed one cycle, but it is only one shape of cycle. The question asks whether any cycle exists, which needs a systematic method: a topological sort, or DFS with three states.",
        zh: "两点互指(A→B 且 B→A)确实是环,但那只是环的一种形状。题目问的是「是否存在环」,要用系统性的方法(拓扑排序,或 DFS 三状态标记)判断,不能只看局部。",
      },
      {
        en: "Union-find detects a cycle in an undirected graph. A directed diamond A to B, A to C, B to D, C to D has no directed cycle, but when union-find reaches C to D it finds C and D already share a root and reports a cycle, because it throws the direction away.",
        zh: "并查集判环适用于无向图。有向图里 A→B、A→C、B→D、C→D 这样的菱形并没有有向环,但并查集处理到 C→D 时发现 C、D 已经同根,就会误报成环 —— 方向信息被丢掉了。",
      },
      {
        en: "In a directed graph, meeting a visited vertex may simply mean two paths joined again (a diamond shape), which is not a cycle. Directed cycle detection needs to know whether that vertex is still on the current recursion stack, which a plain visited flag cannot tell you.",
        zh: "有向图里遇到已访问的点,可能只是「不同路径汇合」(如菱形结构),并不代表成环。有向图判环要知道该点是否「正在当前递归栈中」,普通 visited 标记做不到。",
      },
    ],
    why: {
      en: "Two correct methods for a directed graph. (1) Topological sort: fewer vertices dequeued than the graph holds means a cycle. (2) DFS with three states — unvisited, on the current recursion stack, finished. Meeting a finished vertex is fine, because that path was already explored; meeting a vertex that is still on the current stack is a cycle. An undirected graph is different: there you either use union-find, or run DFS while ignoring the edge you just came from, because otherwise the traversal sees the parent again and calls it a cycle.",
      zh: "有向图判环的两大正解:① 拓扑排序,出队数 < 点数即有环;② DFS 三状态标记(未访问 / 正在当前递归栈中 / 已完成)—— 碰到「已完成」的点没问题,碰到「仍在当前栈中」的点才是环。无向图的做法不同:要么用并查集,要么 DFS 时忽略「刚走过来的那条边」,否则会把父节点误当成环。",
    },
  },
  {
    type: "fill",
    q: {
      en: (
        <>
          In a graph where <b>every edge has weight 1 (or has no weight)</b>,
          which algorithm best finds the shortest path from a start vertex to
          every other vertex? (Write the algorithm name.)
        </>
      ),
      zh: (
        <>
          在一张<b>边权全为 1(或无权)</b>的图上,求从起点到各点的最短路径,
          最合适的算法是?(填算法名)
        </>
      ),
    },
    placeholder: { en: "Algorithm name…", zh: "填算法名称…" },
    answers: [
      "BFS",
      "bfs",
      "breadth-first search",
      "breadth first search",
      "breadthfirstsearch",
      "breadth-firstsearch",
      "广度优先",
      "广度优先搜索",
      "广度优先遍历",
      "bfs算法",
    ],
    hint: {
      en: "Look back at §03. One of the two traversals spreads outward one layer at a time, and the layer number is exactly the smallest number of steps needed.",
      zh: "回想 §03:这种算法一层一层向外扩散,而「第几层」恰好等于「最少几步能到」。",
    },
    why: {
      en: "In an unweighted graph BFS spreads by layer, so the layer at which a vertex is first reached is the smallest number of edges to it. That makes BFS a shortest-path algorithm here, in O(V + E), with no heap at all. Only when edges carry different weights do you need Dijkstra.",
      zh: "无权图里 BFS 按层扩散,第一次到达某点时的层数就是最少边数 —— 天生的最短路,O(V + E),连堆都不用。只有当边带上不同权重时,才需要升级到 Dijkstra。",
    },
  },
  {
    type: "choice",
    q: {
      en: "Why can Dijkstra's algorithm not be used on a graph with a negative edge weight?",
      zh: "Dijkstra 算法为什么不能用在含负权边的图上?",
    },
    opts: [
      {
        en: "Once it settles a vertex it never updates that distance again, but a negative edge can make an already settled vertex reachable more cheaply later",
        zh: "它一旦「定案」某点的最短距离就不再更新,而负权边可能让已定案的点后来还能变得更短",
      },
      { en: "Negative numbers cannot be compared", zh: "负数没法比较大小" },
      { en: "A min-heap cannot hold negative numbers", zh: "小根堆不支持负数" },
      {
        en: "A negative edge always creates a negative cycle",
        zh: "负权边一定构成负环",
      },
    ],
    correct: 0,
    wrong: [
      undefined,
      {
        en: "Negative numbers compare fine. The problem is not the comparison; it is that Dijkstra's greedy assumption no longer holds.",
        zh: "负数当然能比较大小;问题不在比较,而在 Dijkstra 的贪心前提被破坏了。",
      },
      {
        en: "A heap stores negative numbers without any trouble. What fails is the correctness argument of the algorithm, not the data structure.",
        zh: "堆完全可以存负数;失效的原因是算法的正确性假设,不是数据结构的限制。",
      },
      {
        en: "A negative edge is not the same as a negative cycle: a graph can have negative edges and no negative cycle. Even then, Dijkstra's greedy choice is already invalid.",
        zh: "负权边不等于负环:可以有负权边却没有负环。但即便没有负环,Dijkstra 的贪心也已经不成立了。",
      },
    ],
    why: {
      en: "Dijkstra is correct because when a vertex leaves the heap, its distance is already final. That argument depends on every weight being non-negative: any longer detour can only add cost. With a negative edge, a path discovered later can be cheaper, so a vertex may be settled too early and the answer is wrong. Use Bellman-Ford instead, at O(V · E); it also reports a negative cycle.",
      zh: "Dijkstra 的正确性建立在「弹出堆顶时它的距离已是最终最短」之上,而这依赖所有边权非负:绕远路只会更贵。有负权边时,后来才发现的路径可能更便宜,某个点会被过早定案,答案就错了。此时应改用 Bellman-Ford,复杂度 O(V · E),它还能报出负环。",
    },
  },
];
