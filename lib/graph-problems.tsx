// Chapter 12 · Graphs — problem set (English default / Chinese toggle).
// The closing quiz is in lib/graph-quiz.tsx; /atlas imports only this file.
// Problems are high-frequency LeetCode graph questions — grid DFS/BFS, topological sort, shortest
// paths, implicit graphs — ordered from easy to hard.
// hint points a direction without spoilers; key explains the optimal solution in one paragraph.
// Bilingual: title / tags / hint / key are written as { en, zh }.
// Problem titles use the official LeetCode English name; zh keeps the official Chinese name.

import type { Problem } from "@/lib/problems";

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
          向四个方向扩散:只递归「颜色 == old 且在界内」的格子,进门就改成新色。常见错误:若新色 == old 会无限递归,要先判 <code>old == newColor</code>{" "}
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
          value. Time is O(rows × cols), because each cell is visited once.
          Letting DFS return a count is a common extra step in grid problems.
        </>
      ),
      zh: (
        <>
          对每个未访问的陆地启动 DFS,DFS 返回它淹没的格子数(1 +
          四个方向递归之和),越界或遇水返回 0。主循环用 max 记录最大返回值。时间 O(行 × 列),每格访问一次。「让 DFS 带返回值统计规模」是网格题常见的扩展。
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
          <code>X</code>;标过 <code>#</code> 的还原成 <code>O</code>。「从边界倒着染色」避开了对每个内部区域单独判断是否触边。
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
          <b>多源 BFS</b>:先把所有初始烂橘子一次性入队(这是本题精髓),并记录新鲜橘子总数。然后一层层扩散,
          <b>每处理完一层 minute += 1</b>
          (用「先记 size」的按层技巧,呼应二叉树层序);每腐蚀一个新鲜橘子就把计数减 1。最后若还有新鲜橘子返回 -1。每一步的代价都是同样的一分钟,所以 BFS 的层数正好等于经过的时间 ——
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
          <b>先存进 map</b>,再递归克隆每个邻居并接到克隆节点的邻居表上。「先存再递归」正是环能终止的原因。图题里 visited
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
          Kahn 入度法:建邻接表 + 入度数组,把入度为 0 的课先入队;每出队一门课就追加到答案序列,并把它后继课的入度各减 1,减到 0 的入队。若最终答案长度 == 课程数就是合法拓扑序,否则说明剩下的课困在环里,返回空数组。DFS 写法同样可行:后序遍历的逆序就是一个拓扑序。两种都是 O(V + E)。
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
          顺着「水往低处流」逐格判断太贵。反过来想:从海洋边界出发,水能倒着「爬」到哪些格子?
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
          逆向思维:分别从太平洋边界(上边 + 左边)和大西洋边界(下边 + 右边)出发,只走「高度 &ge; 当前格」的方向 —— 这正是「水往低处流」的反向。各自标记能到达的格子,得到两个布尔矩阵,
          <b>两个集合的交集</b>就是答案。两个关键转念:多个起点一起搜、把「流出去」反转成「能被谁到达」。
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
          普通 Dijkstra 会被「最多中转 K 站」绊住:到某城最便宜的走法可能中转太多次。步数受限时,要按「轮」推进。
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
          <b>上一轮 dist 的快照</b>去更新所有边(关键:用临时数组,否则一轮内的连续松弛会相互影响,使走过的边数超过限制)。也可用带「已用步数」的 BFS 分层扩展。普通 Dijkstra
          在这里不成立:它可能通过一条已经太长的路径把某个城市便宜地定案。这题正好点出「最短路算法要看约束选型」。
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
          <b>隐式图 + BFS</b>:顶点是单词,边是「相差一个字母」。不预先建完整图(边太多),而是 BFS 出队一个词时,枚举每一位换 26
          个字母,在词表(哈希集合)里找存在且未访问的邻居入队。每条边代价相同,所以 BFS 给出的层数就是最少转换次数。进阶可用
          <b>双向 BFS</b>:从首尾同时搜、在中间相遇,两边各自要搜的深度都减半。
        </>
      ),
    },
  },
];
