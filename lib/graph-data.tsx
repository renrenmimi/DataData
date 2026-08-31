// Chapter 12 · Graphs — problem set and quiz data (English default / Chinese toggle).
// Problems are high-frequency LeetCode graph questions — grid DFS/BFS, topological sort, shortest
// paths, implicit graphs — ordered from easy to hard.
// hint points a direction without spoilers; key explains the optimal solution in one paragraph.
// Bilingual: title / tags / hint / key and every quiz string are written as { en, zh }.
// Problem titles use the official LeetCode English name; zh keeps the official Chinese name.

import type { Problem } from "@/lib/problems";
import type { QuizItem } from "@/lib/quiz";

export const PROBLEMS: Problem[] = [
  {
    lc: 733,
    title: { en: "Flood Fill", zh: "图像渲染(Flood Fill)" },
    d: "easy",
    tags: [
      { en: "Grid", zh: "网格" },
      { en: "DFS/BFS", zh: "DFS/BFS" },
      { en: "Coloring", zh: "染色" },
    ],
    hint: {
      en: (
        <>
          Start at the given cell and repaint every cell that has the same
          original color and is connected to it. This is the simplest form of
          the island problems.
        </>
      ),
      zh: (
        <>
          从起点出发,把「和它同色且连通」的格子全染成新色 ——
          这就是岛屿题的最朴素版本。
        </>
      ),
    },
    key: {
      en: (
        <>
          Record the starting color as <code>old</code>. Run DFS or BFS from the
          start cell and recurse only into cells that are inside the grid and
          still hold <code>old</code>; repaint each one on entry. The common
          mistake: if the new color equals <code>old</code>, the recursion never
          terminates, so return early when <code>old == newColor</code>. This is
          also where you learn the four-direction grid template{" "}
          <code>dirs=[[-1,0],[1,0],[0,-1],[0,1]]</code>.
        </>
      ),
      zh: (
        <>
          记下起点原色 <code>old</code>,从起点 DFS/BFS
          向四个方向扩散:只递归「颜色 == old 且在界内」的格子,进门就改成新色。
          常见错误:若新色 == old 会无限递归,要先判 <code>old == newColor</code>{" "}
          直接返回。网格题的四方向模板{" "}
          <code>dirs=[[-1,0],[1,0],[0,-1],[0,1]]</code> 从这里练熟。
        </>
      ),
    },
  },
  {
    lc: 695,
    title: { en: "Max Area of Island", zh: "岛屿的最大面积" },
    d: "medium",
    tags: [
      { en: "Grid", zh: "网格" },
      { en: "DFS", zh: "DFS" },
      { en: "Counting", zh: "计数" },
    ],
    hint: {
      en: (
        <>
          Same sinking method as LC 200. Instead of adding 1 to an island
          counter, add up how many cells this one DFS sank.
        </>
      ),
      zh: (
        <>
          和 LC200 同一套淹没法,只是把「岛屿计数 +1」换成「累加这次 DFS
          淹了几块地」。
        </>
      ),
    },
    key: {
      en: (
        <>
          Start a DFS from every unvisited land cell. The DFS returns the number
          of cells it sank: 1 plus the sum of the four recursive calls. Out of
          bounds or water returns 0. The main loop keeps the maximum returned
          value. Time is O(rows x cols), because each cell is visited once.
          Letting DFS return a count is a common extra step in grid problems.
        </>
      ),
      zh: (
        <>
          对每个未访问的陆地启动 DFS,DFS 返回它淹没的格子数(1 +
          四个方向递归之和),越界或遇水返回 0。主循环用 max 记录最大返回值。
          时间 O(行 x 列),每格访问一次。
          「让 DFS 带返回值统计规模」是网格题的常见加料。
        </>
      ),
    },
  },
  {
    lc: 130,
    title: { en: "Surrounded Regions", zh: "被围绕的区域" },
    d: "medium",
    tags: [
      { en: "Grid", zh: "网格" },
      { en: "Reverse thinking", zh: "反向思考" },
      { en: "Border DFS", zh: "边界 DFS" },
    ],
    hint: {
      en: (
        <>
          Finding the surrounded <code>O</code> regions directly is awkward. Turn
          it around: any region that touches the border can never be surrounded.
        </>
      ),
      zh: (
        <>
          直接找「被包围的 O」很难判边界;反过来 ——
          谁碰到了边界,谁就一定不会被包围。
        </>
      ),
    },
    key: {
      en: (
        <>
          Solve the opposite problem. Run DFS or BFS from{" "}
          <b>
            every <code>O</code> on the four borders
          </b>{" "}
          and mark all connected <code>O</code> cells as safe (for example with a
          temporary <code>#</code>). After that pass, every cell still holding{" "}
          <code>O</code> must be surrounded, so change it to <code>X</code>; turn
          each <code>#</code> back into <code>O</code>. Coloring from the border
          inward avoids testing each interior region separately for whether it
          touches an edge.
        </>
      ),
      zh: (
        <>
          正难则反:先从
          <b>
            四条边上的每个 <code>O</code>
          </b>{" "}
          出发 DFS/BFS,把连通的 <code>O</code> 全标成安全(比如临时记为{" "}
          <code>#</code>)。扫完后,剩下还是 <code>O</code> 的必然被包围 → 改成{" "}
          <code>X</code>;标过 <code>#</code> 的还原成 <code>O</code>。
          「从边界倒着染色」避开了对每个内部区域单独判断是否触边。
        </>
      ),
    },
  },
  {
    lc: 994,
    title: { en: "Rotting Oranges", zh: "腐烂的橘子" },
    d: "medium",
    tags: [
      { en: "Multi-source BFS", zh: "多源 BFS" },
      { en: "Grid", zh: "网格" },
      { en: "Level by level", zh: "按层" },
    ],
    hint: {
      en: (
        <>
          Every rotten orange starts spreading at minute 0 at the same time.
          Rather than spreading from one of them, put all of them into the queue
          before the loop starts.
        </>
      ),
      zh: (
        <>
          所有烂橘子在第 0 分钟「同时」开始腐蚀 ——
          与其一个个扩散,不如让它们一起入队。
        </>
      ),
    },
    key: {
      en: (
        <>
          <b>Multi-source BFS</b>: push every initially rotten orange into the
          queue before the loop, and count the fresh ones. Then spread one level
          at a time and <b>increase minute by 1 after each finished level</b>{" "}
          (record the queue size first, the same level-by-level trick as binary
          tree level order). Decrease the fresh counter for every orange you rot.
          If any fresh orange is left at the end, return -1. Every step costs the
          same one minute, so the BFS level number is exactly the elapsed time.
          That is why BFS fits this problem and DFS does not.
        </>
      ),
      zh: (
        <>
          <b>多源 BFS</b>:先把所有初始烂橘子一次性入队(这是本题精髓),
          并记录新鲜橘子总数。然后一层层扩散,
          <b>每处理完一层 minute += 1</b>
          (用「先记 size」的按层技巧,呼应二叉树层序);
          每腐蚀一个新鲜橘子就把计数减 1。最后若还有新鲜橘子返回 -1。
          每一步的代价都是同样的一分钟,所以 BFS 的层数正好等于经过的时间 ——
          这就是它比 DFS 适合此题的原因。
        </>
      ),
    },
  },
  {
    lc: 133,
    title: { en: "Clone Graph", zh: "克隆图" },
    d: "medium",
    tags: [
      { en: "DFS/BFS", zh: "DFS/BFS" },
      { en: "Hash map", zh: "哈希表" },
      { en: "Building a graph", zh: "建图" },
    ],
    hint: {
      en: (
        <>
          You copy while you traverse. The hard part: one node can be reached
          through several edges, so how do you make sure it is cloned only once?
        </>
      ),
      zh: (
        <>
          边遍历边复制,难点是「一个节点可能被多条边指到」——
          怎么保证只克隆一次?
        </>
      ),
    },
    key: {
      en: (
        <>
          Use a hash map <code>Map&lt;original, clone&gt;</code> as both the
          visited record and the deduplication table. When DFS or BFS reaches a
          node: if the map already holds a clone, return it (this stops cycles
          and duplicates); otherwise create the clone, store it in the map
          first, then clone each neighbor recursively and append it to the
          clone&rsquo;s neighbor list. Storing the clone <b>before</b> recursing
          is what makes a cycle terminate. In graph problems the visited set is
          often a hash map that carries extra data like this.
        </>
      ),
      zh: (
        <>
          用哈希表 <code>Map&lt;原节点, 克隆节点&gt;</code>
          当「访问记录 + 去重表」二合一。DFS/BFS 到某点:若 map
          里已有克隆就直接返回(防环、防重复);否则新建克隆
          <b>先存进 map</b>,再递归克隆每个邻居并接到克隆节点的邻居表上。
          「先存再递归」正是环能终止的原因。图题里 visited
          常常就是一张顺便携带数据的哈希表。
        </>
      ),
    },
  },
  {
    lc: 210,
    title: { en: "Course Schedule II", zh: "课程表 II" },
    d: "medium",
    tags: [
      { en: "Topological sort", zh: "拓扑排序" },
      { en: "Kahn", zh: "Kahn" },
      { en: "Directed graph", zh: "有向图" },
    ],
    hint: {
      en: (
        <>
          LC 207 only asks whether you can finish. This one asks for an actual
          order, and the topological order is the answer itself.
        </>
      ),
      zh: (
        <>
          LC207 只问「能不能修完」,本题要你给出「具体的上课顺序」——
          拓扑序本身就是答案。
        </>
      ),
    },
    key: {
      en: (
        <>
          Kahn&rsquo;s algorithm: build an adjacency list and an in-degree
          array, then enqueue every course with in-degree 0. Each time you
          dequeue a course, append it to the answer and decrease the in-degree
          of each successor by 1; enqueue a successor when its in-degree reaches
          0. If the answer finally has the same length as the number of courses,
          it is a valid topological order; otherwise the remaining courses sit
          on a cycle, so return an empty array. The DFS variant works too: the
          reverse of the post-order is a topological order. Both are O(V + E).
        </>
      ),
      zh: (
        <>
          Kahn 入度法:建邻接表 + 入度数组,把入度为 0 的课先入队;
          每出队一门课就追加到答案序列,并把它后继课的入度各减 1,减到 0 的入队。
          若最终答案长度 == 课程数就是合法拓扑序,否则说明剩下的课困在环里,
          返回空数组。DFS 写法同样可行:后序遍历的逆序就是一个拓扑序。
          两种都是 O(V + E)。
        </>
      ),
    },
  },
  {
    lc: 417,
    title: { en: "Pacific Atlantic Water Flow", zh: "太平洋大西洋水流问题" },
    d: "medium",
    tags: [
      { en: "Grid", zh: "网格" },
      { en: "Reverse DFS/BFS", zh: "反向 BFS/DFS" },
      { en: "Multi-source", zh: "多源" },
    ],
    hint: {
      en: (
        <>
          Following the water downhill from every cell is too expensive. Turn it
          around: starting from the ocean borders, which cells can the water
          climb back to?
        </>
      ),
      zh: (
        <>
          顺着「水往低处流」逐格判断太贵。反过来想:从海洋边界出发,
          水能倒着「爬」到哪些格子?
        </>
      ),
    },
    key: {
      en: (
        <>
          Reverse the direction of the search. Start from the Pacific border
          (top row and left column) and from the Atlantic border (bottom row and
          right column) separately. Move only into a neighbor whose height is{" "}
          <b>greater than or equal to</b> the current cell, which is the reverse
          of flowing downhill. Each search marks the cells it can reach, giving
          two boolean matrices. The <b>intersection of the two sets</b> is the
          answer. Two ideas to take away: search from many sources at once, and
          invert &ldquo;flows out to&rdquo; into &ldquo;can be reached
          from&rdquo;.
        </>
      ),
      zh: (
        <>
          逆向思维:分别从太平洋边界(上边 + 左边)和大西洋边界(下边 + 右边)出发,
          只走「高度 &ge; 当前格」的方向 —— 这正是「水往低处流」的反向。
          各自标记能到达的格子,得到两个布尔矩阵,
          <b>两个集合的交集</b>就是答案。
          两个关键转念:多个起点一起搜、把「流出去」反转成「能被谁到达」。
        </>
      ),
    },
  },
  {
    lc: 787,
    title: {
      en: "Cheapest Flights Within K Stops",
      zh: "K 站中转内最便宜的航班",
    },
    d: "medium",
    tags: [
      { en: "Shortest path", zh: "最短路" },
      { en: "Bounded BFS", zh: "限步 BFS" },
      { en: "Bellman-Ford", zh: "Bellman-Ford" },
    ],
    hint: {
      en: (
        <>
          Plain Dijkstra breaks on the &ldquo;at most K stops&rdquo; limit: the
          cheapest way to reach a city may use too many stops. When the number
          of steps is bounded, advance round by round.
        </>
      ),
      zh: (
        <>
          普通 Dijkstra 会被「最多中转 K 站」绊住:
          到某城最便宜的走法可能中转太多次。步数受限时,要按「轮」推进。
        </>
      ),
    },
    key: {
      en: (
        <>
          At most K stops means at most K + 1 edges, so run{" "}
          <b>K + 1 rounds of Bellman-Ford relaxation</b>. Each round must relax
          every edge against a{" "}
          <b>snapshot of the previous round&rsquo;s dist</b> (this is the point:
          use a temporary array, otherwise two relaxations chain inside one
          round and the path uses more edges than allowed). A BFS that carries
          the number of steps used works as well. Plain Dijkstra is not valid
          here, because it can settle a city cheaply through a path that is
          already too long. The lesson: choose a shortest-path algorithm by the
          constraints, not by habit.
        </>
      ),
      zh: (
        <>
          最多中转 K 站 = 最多走 K + 1 条边,所以做{" "}
          <b>K + 1 轮 Bellman-Ford 松弛</b>。每一轮都基于
          <b>上一轮 dist 的快照</b>去更新所有边(关键!用临时数组,
          否则一轮内连续松弛会「串味」,走的边数超过限制)。
          也可用带「已用步数」的 BFS 分层扩展。普通 Dijkstra
          在这里不成立:它可能通过一条已经太长的路径把某个城市便宜地定案。
          这题正好点出「最短路算法要看约束选型」。
        </>
      ),
    },
  },
  {
    lc: 127,
    title: { en: "Word Ladder", zh: "单词接龙" },
    d: "hard",
    tags: [
      { en: "Implicit graph BFS", zh: "隐式图 BFS" },
      { en: "Shortest path", zh: "最短路" },
      { en: "Building edges", zh: "建边" },
    ],
    hint: {
      en: (
        <>
          Treat each word as a vertex and &ldquo;differs by exactly one
          letter&rdquo; as an edge. Then the question is a shortest path in an
          unweighted graph.
        </>
      ),
      zh: (
        <>
          把每个单词看成一个顶点,「改一个字母能互变」就是一条边 ——
          这不就是求无权图最短路吗?
        </>
      ),
    },
    key: {
      en: (
        <>
          <b>Implicit graph plus BFS</b>. The vertices are words; an edge joins
          two words that differ in one letter. Do not build the whole graph
          first, because there are too many edges. Instead, when BFS dequeues a
          word, try replacing each position with each of the 26 letters and look
          the result up in the word list (a hash set); enqueue it if it exists
          and has not been visited. Every edge costs the same, so BFS gives the
          fewest transformations. As a follow-up, <b>bidirectional BFS</b>{" "}
          searches from both ends and stops when the two fronts meet, which
          halves the depth each side has to explore.
        </>
      ),
      zh: (
        <>
          <b>隐式图 + BFS</b>:顶点是单词,边是「相差一个字母」。
          不预先建完整图(边太多),而是 BFS 出队一个词时,枚举每一位换 26
          个字母,在词表(哈希集合)里找存在且未访问的邻居入队。
          每条边代价相同,所以 BFS 给出的层数就是最少转换次数。进阶可用
          <b>双向 BFS</b>:从首尾同时搜、在中间相遇,两边各自要搜的深度都减半。
        </>
      ),
    },
  },
];

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
        en: "Union-find detects a cycle in an undirected graph. In a directed graph the edges A to C and B to C give C two predecessors, and union-find would report a cycle that is not there, because it throws the direction away.",
        zh: "并查集判环适用于无向图。有向图里 A→C、B→C 会让 C 有两个前驱,并查集会误判成环,因为方向信息被丢掉了。",
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
    placeholder: { en: "Algorithm name…", zh: "填算法缩写…" },
    answers: [
      "BFS",
      "bfs",
      "breadth-first search",
      "breadth first search",
      "breadthfirstsearch",
      "breadth-firstsearch",
      "广度优先",
      "广度优先搜索",
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
