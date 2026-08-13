"use client";

// 第 12 章 · 图 —— 数据结构的终极形态。
// 结构:直觉与术语 → 两种表示法 → 遍历(BFS/DFS 招牌交互)→ 手写实现 →
// 三语言对照 → 三大专题精讲(岛屿 / 拓扑 / 最短路,逐帧动画 + 三语言题解)→
// 题单 → 测验 → 要点。前 11 章的结构在这里全部现形:链表、树、网格都是图的特例。

import {
  Hero,
  Section,
  Callout,
  BigO,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/graph-data";
import {
  TermGraph,
  MiniConcepts,
  ReprLab,
  GraphLab,
  GridDfsLab,
  TopoLab,
  DijkstraLab,
} from "./viz";
import "./chapter.css";

/* ================= 页面 ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: "直觉与术语" },
  { id: "repr", n: "02", label: "两种表示法" },
  { id: "traverse", n: "03", label: "遍历 BFS/DFS" },
  { id: "build", n: "04", label: "手写实现" },
  { id: "langs", n: "05", label: "三语言对照" },
  { id: "topics", n: "06", label: "三大专题" },
  { id: "problems", n: "07", label: "高频题单" },
  { id: "quiz", n: "08", label: "通关测验" },
];

export default function GraphChapter() {
  return (
    <main className="page" data-ch="graph">
      <Hero
        ch="graph"
        title={
          <>
            图 <span className="grad">Graph</span>
          </>
        }
        essence={
          <>
            万物皆<strong>点</strong>,关系皆<strong>边</strong>。地铁站与线路、人与好友、
            网页与链接、课程与先修 —— 只要有「东西」和「东西之间的联系」,画出来就是一张图。
            它是数据结构的<strong>终极形态</strong>:前 11 章学的链表、树、网格,
            全都是它的特例。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 直觉与术语 ================= */}
      <Section
        id="intuition"
        index="01"
        title="为什么需要图:万物皆点,关系皆边"
        desc="当数据之间的关系不再是「一对一」或「一对多」,而是「多对多、还能绕圈」时,图登场了"
      >
        <div className="prose">
          <p>
            先回忆一路走来的结构:数组是<strong>一排</strong>,链表是<strong>一条链</strong>,
            树是<strong>一棵会分叉但不回头</strong>的家谱。它们都有一个共同的「不够用」:
            现实里的关系常常是<strong>多对多、还能绕回来</strong>的。
          </p>
          <p>
            想想这几件每天都在发生的事,用前面的结构都<strong>装不下</strong>:
          </p>
        </div>
        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="card hoverable">
            <div className="card-kicker">场景一</div>
            <div className="card-title">地铁线路图</div>
            <p>
              每个<b>站</b>是一个点,每段<b>轨道</b>是一条边。换乘站连着好几条线,
              还能坐一圈绕回原地 —— 有分叉、有环,树画不出来。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">场景二</div>
            <div className="card-title">社交网络</div>
            <p>
              每个<b>人</b>是点,「是好友」是边(无向)、「关注」是有向边。A 的朋友的朋友
              可能又是 A —— 关系交织成网,不是层层向下的树。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">场景三</div>
            <div className="card-title">课程依赖</div>
            <p>
              每门<b>课</b>是点,「先修」是有向边。数据结构要先学数组,操作系统要先学
              C 语言…… 这些「谁必须在谁之前」构成一张有向图。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">场景四</div>
            <div className="card-title">网页与超链接</div>
            <p>
              每个<b>网页</b>是点,每个<b>超链接</b>是有向边。Google 当年就是把整个互联网
              建成一张巨图,靠在图上「投票」(PageRank)排出搜索结果。
            </p>
          </div>
        </div>

        <div className="prose" style={{ marginTop: 24 }}>
          <p>
            要谈图,先得会「图的行话」。别怕,这些词一个比一个直白 ——
            下面这张图把它们全标了出来:
          </p>
        </div>
        <TermGraph />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>术语</th>
                <th>大白话</th>
                <th>正式说法</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>顶点 vertex(V)</b></td>
                <td>图里的一个「点」,装数据的地方</td>
                <td>node / vertex,总数记作 |V| 或 n</td>
              </tr>
              <tr>
                <td><b>边 edge(E)</b></td>
                <td>连接两个点的「线」,表示一种关系</td>
                <td>edge,总数记作 |E| 或 m</td>
              </tr>
              <tr>
                <td><b>有向 / 无向</b></td>
                <td>边有没有箭头:「关注」有向,「握手」无向</td>
                <td>directed / undirected</td>
              </tr>
              <tr>
                <td><b>带权 weighted</b></td>
                <td>边上带数字:距离、耗时、费用</td>
                <td>weight w(u, v)</td>
              </tr>
              <tr>
                <td><b>度 degree</b></td>
                <td>一个点连了几条边</td>
                <td>有向图分<b>入度</b>(指进来)/ <b>出度</b>(指出去)</td>
              </tr>
              <tr>
                <td><b>路径 path</b></td>
                <td>沿着边从一个点走到另一个点的序列</td>
                <td>path;长度 = 边数(或权重之和)</td>
              </tr>
              <tr>
                <td><b>环 cycle</b></td>
                <td>从一个点出发,能沿边绕回它自己</td>
                <td>cycle;无环有向图 = DAG</td>
              </tr>
              <tr>
                <td><b>连通 connected</b></td>
                <td>任意两点之间都有路可通</td>
                <td>连通分量 = 互相可达的一坨点</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="prose" style={{ marginTop: 20 }}>
          <p>
            再看图的三种「变种」,一图胜千言:
          </p>
        </div>
        <MiniConcepts />

        <Callout tone="idea" title="点题:前面学的,全是图的特例">
          <p>
            这是本章最该带走的一句话。<b>链表</b>是「每个点只有一个出边、串成一条直线」的图;
            <b>树</b>是「无环 + 连通 + 有一个根」的图;<b>网格 / 矩阵</b>是「每个格子和上下左右相邻」的图。
            所以你早就在和图打交道了 —— 只是现在,我们把最一般、最自由的那种拿出来单独讲。
            学会图,等于把前面所有结构又复习了一遍。
          </p>
        </Callout>
        <Callout tone="story" title="一座桥引出的整个学科">
          <p>
            1736 年,数学家欧拉(Euler)研究「柯尼斯堡七桥问题」:能不能一次走遍七座桥、每座只过一次?
            他把陆地抽象成<b>点</b>、桥抽象成<b>边</b>,证明了这不可能 —— 图论就此诞生。
            两百多年后,同样的「点 + 边」抽象撑起了导航、社交、编译器、芯片布线和整个互联网。
            把复杂现实抽象成点和边,是计算机科学最强大的思维武器之一。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 两种表示法 ================= */}
      <Section
        id="repr"
        index="02"
        title="内存里的样子:邻接矩阵 vs 邻接表"
        desc="图不像数组那样有天然的内存布局,得由我们决定「怎么记录哪些点之间有边」"
      >
        <div className="prose">
          <p>
            数组有「连续内存 + 下标公式」,树有「节点 + 左右指针」。图呢?图的形状千变万化,
            没有唯一的存法。工程上最常用两种,它们的取舍恰好是一场经典的
            <strong>「时间 vs 空间」</strong>博弈(序章的主旋律又回来了)。点下面的顶点,
            对照着看同一张图的两种长相:
          </p>
        </div>
        <ReprLab />

        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-kicker">表示法一</div>
            <div className="card-title">邻接矩阵 adjacency matrix</div>
            <p>
              一张 <b>V×V</b> 的二维表,<code>matrix[i][j] = 1</code> 表示 i 到 j 有边
              (带权图就存权重)。无向图的矩阵沿对角线<b>对称</b>。
              好处:查「i、j 之间有没有边」一步到位,<BigO o="1" />;
              坏处:不管图多稀疏,都硬占 <BigO o="n2" /> 空间。
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">表示法二</div>
            <div className="card-title">邻接表 adjacency list</div>
            <p>
              每个点挂一串「它的邻居」(数组套数组 / 哈希表套数组)。
              只存<b>真实存在的边</b>,空间 <BigO o="n" label="O(V+E)" />;
              取一个点的所有邻居也很自然。代价:查「i、j 之间有没有边」要扫 i 的邻居串,
              最坏 O(度数)。<b>绝大多数刷题和工程场景都用它。</b>
            </p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>对比维度</th>
                <th>邻接矩阵</th>
                <th>邻接表</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>空间</td>
                <td><BigO o="n2" label="O(V²)" /> 恒定</td>
                <td><BigO o="n" label="O(V+E)" /> 随边多少变</td>
              </tr>
              <tr>
                <td>查 u、v 间有无边</td>
                <td><BigO o="1" /> —— 直接读 matrix[u][v]</td>
                <td><BigO o="n" label="O(deg u)" /> —— 扫 u 的邻居</td>
              </tr>
              <tr>
                <td>遍历 u 的所有邻居</td>
                <td><BigO o="n" label="O(V)" /> —— 要扫整行(含没边的 0)</td>
                <td><BigO o="n" label="O(deg u)" /> —— 有几个邻居就走几步</td>
              </tr>
              <tr>
                <td>加一条边</td>
                <td><BigO o="1" /></td>
                <td><BigO o="1" /></td>
              </tr>
              <tr>
                <td>适合</td>
                <td>稠密图(E 接近 V²)、频繁查两点连通</td>
                <td><b>稀疏图(E ≪ V²)、需要频繁遍历邻居</b> ← 默认选它</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout tone="deep" title="第三种:边列表 edge list(一句带过)">
          <p>
            最朴素的存法:就一个数组,每个元素是 <code>[u, v, w]</code> 一条边。省事、
            适合「一次性读入全部边再排序」的算法(比如最小生成树的 Kruskal、并查集判环)。
            但想「取某点的邻居」得扫全部边,做遍历太慢。所以它常常只是<b>输入格式</b> ——
            题目给你 edge list,你第一步往往是把它转成邻接表。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 遍历 ================= */}
      <Section
        id="traverse"
        index="03"
        title="核心:图的两种走法 BFS 与 DFS"
        desc="访问图里的每一个点,只有两条路子 —— 要么一层层向外扩(BFS),要么一条道扎到底(DFS)"
        badge={<span className="chip" data-tone="warn">★ 全章核心</span>}
      >
        <div className="prose">
          <p>
            图的绝大多数算法,骨架都是「把每个点访问一遍」。而访问图,历史上就沉淀出两种走法,
            它们分别复用了你已经学过的两种结构:
          </p>
        </div>
        <div className="grid-2">
          <div className="card hoverable">
            <div className="card-kicker">走法一 · 呼应第 5 章队列</div>
            <div className="card-title">BFS 广度优先</div>
            <p>
              像往水里丢石子,波纹<b>一圈一圈</b>往外扩:先访问起点,再访问它所有邻居,
              再访问「邻居的邻居」…… 用<b>队列(先进先出)</b>实现。天然按「离起点几步」分层,
              所以能求<b>无权图最短路</b>。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">走法二 · 呼应第 4 章栈 / 第 7 章递归</div>
            <div className="card-title">DFS 深度优先</div>
            <p>
              像走迷宫,<b>一条路走到黑</b>,撞墙了才退回上一个岔口换条路。用<b>栈</b>
              (或递归,系统调用栈就是栈)实现。适合「探索所有路径 / 连通块 / 找环」这类问题。
            </p>
          </div>
        </div>

        <div className="prose" style={{ marginTop: 20 }}>
          <p>
            光看文字不如亲眼看。下面这张 8 个点的图,切换 BFS / DFS,一步步播放 ——
            注意看下方<b>队列 / 栈</b>的内容怎么变、<b>visited</b> 集合怎么长,
            以及节点点亮的<b>顺序</b>(每个点下面的 #编号就是访问序):
          </p>
        </div>
        <GraphLab />

        <Callout tone="warn" title="灵魂拷问:为什么图遍历一定要 visited?">
          <p>
            这是图与树最本质的区别。<b>树没有环</b>:从根往下走,永远不会绕回已经走过的祖先,
            所以树的遍历(第 7 章)从不需要 visited。但<b>图有环</b>:A→B→C→A……
            没有 visited 记录「谁来过」,你会在环里<b>无限打转</b>,程序永远停不下来。
            所以图遍历的铁律是:<b>访问一个点前先查 visited,访问后立刻标记</b>。
            BFS 里更要「一入队就标记」,否则同一个点会被不同邻居重复塞进队列。
          </p>
        </Callout>

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th></th>
                <th>BFS 广度优先</th>
                <th>DFS 深度优先</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>辅助结构</td>
                <td>队列(FIFO)</td>
                <td>栈 / 递归(LIFO)</td>
              </tr>
              <tr>
                <td>访问顺序</td>
                <td>按层,由近及远</td>
                <td>沿一条路扎到底再回头</td>
              </tr>
              <tr>
                <td>时间复杂度</td>
                <td colSpan={2} style={{ textAlign: "center" }}>
                  都是 <BigO o="n" label="O(V+E)" /> —— 每个点进出一次、每条边看一次
                </td>
              </tr>
              <tr>
                <td>空间复杂度</td>
                <td>O(V) —— 队列最坏装下最宽一层</td>
                <td>O(V) —— 递归栈最坏 = 最长路径</td>
              </tr>
              <tr>
                <td>拿手好戏</td>
                <td><b>无权最短路</b>、按层扩散(腐烂橘子)</td>
                <td><b>连通块 / 岛屿</b>、找环、拓扑、回溯</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="idea" title="记住这条复杂度:O(V+E)">
          <p>
            无论 BFS 还是 DFS,只要用邻接表,复杂度都是 <b>O(V+E)</b>:每个顶点被处理一次
            (贡献 V),每条边被检查一次(有向图一次、无向图两端各一次,贡献 E)。
            这是图论最基础的一条复杂度,后面几乎所有算法都从它长出来。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 手写实现 ================= */}
      <Section
        id="build"
        index="04"
        title="手写实现:建图 + BFS + DFS 模板"
        desc="把 §03 的动画翻译成能直接跑的代码。这几段模板背下来,一大半图论题就有了骨架"
      >
        <div className="prose">
          <p>
            题目通常给你的是<strong>边列表</strong>(比如 <code>edges = [[0,1],[0,2],...]</code>),
            第一步几乎总是把它转成<strong>邻接表</strong>。然后 BFS / DFS 直接套模板。
            先看「建图 + BFS」:
          </p>
        </div>
        <CodeTabs
          title="graph_build_bfs"
          java={{
            code: `import java.util.*;

// 用「边列表」建无向图的邻接表:List<List<Integer>>
List<List<Integer>> buildGraph(int n, int[][] edges) {
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    for (int[] e : edges) {
        g.get(e[0]).add(e[1]);
        g.get(e[1]).add(e[0]);   // 无向图两个方向都加;有向图只留这一行
    }
    return g;
}

// BFS:从 start 出发,按层访问
void bfs(List<List<Integer>> g, int start) {
    int n = g.size();
    boolean[] visited = new boolean[n];
    Queue<Integer> q = new ArrayDeque<>();
    visited[start] = true;       // 入队即标记(关键!)
    q.offer(start);
    while (!q.isEmpty()) {
        int u = q.poll();        // 出队 = 访问
        System.out.println(u);
        for (int v : g.get(u)) {
            if (!visited[v]) {
                visited[v] = true;   // 防止同一个点被重复入队
                q.offer(v);
            }
        }
    }
}`,
            hl: [16, 17, 18],
            note: (
              <>
                <b>易错点:</b>用 <code>ArrayDeque</code> 当队列,别用 <code>LinkedList</code>
                (慢)。<code>boolean[]</code> 比 <code>HashSet</code> 快得多,
                顶点是 0..n−1 时优先用它。
              </>
            ),
          }}
          python={{
            code: `from collections import deque, defaultdict

# 用「边列表」建无向图的邻接表:defaultdict(list)
def build_graph(n, edges):
    g = defaultdict(list)
    for a, b in edges:
        g[a].append(b)
        g[b].append(a)     # 无向图两个方向都加;有向图只留这一行
    return g

# BFS:从 start 出发,按层访问
def bfs(g, start, n):
    visited = [False] * n
    q = deque([start])
    visited[start] = True      # 入队即标记(关键!)
    while q:
        u = q.popleft()        # 出队 = 访问
        print(u)
        for v in g[u]:
            if not visited[v]:
                visited[v] = True   # 防止同一个点被重复入队
                q.append(v)`,
            hl: [16, 17, 18],
            note: (
              <>
                <b>易错点:</b>队列一定用 <code>collections.deque</code>,它的{" "}
                <code>popleft()</code> 是 O(1);千万别用 <code>list.pop(0)</code>
                (O(n),会把 BFS 拖成 O(V·E))。
              </>
            ),
          }}
          js={{
            code: `// 用「边列表」建无向图的邻接表:数组套数组
function buildGraph(n, edges) {
  const g = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    g[a].push(b);
    g[b].push(a);     // 无向图两个方向都加;有向图只留这一行
  }
  return g;
}

// BFS:从 start 出发,按层访问
function bfs(g, start, n) {
  const visited = new Array(n).fill(false);
  const q = [start];           // 数组模拟队列
  visited[start] = true;       // 入队即标记(关键!)
  let head = 0;                // 用读指针代替 shift(),避免 O(n) 出队
  while (head < q.length) {
    const u = q[head++];       // 出队 = 访问
    console.log(u);
    for (const v of g[u]) {
      if (!visited[v]) {
        visited[v] = true;     // 防止同一个点被重复入队
        q.push(v);
      }
    }
  }
}`,
            hl: [17, 18, 19],
            note: (
              <>
                <b>易错点:</b>JS 数组的 <code>shift()</code> 是 O(n) 搬家。数据量大时用
                「读指针 <code>head</code> 只增不减」的写法,出队 O(1)。
              </>
            ),
          }}
        />

        <div className="prose" style={{ marginTop: 24 }}>
          <p>
            DFS 有两种写法:<strong>递归</strong>(短、直觉,但深图会爆栈)和
            <strong>迭代</strong>(用显式栈,安全)。两个都要会:
          </p>
        </div>
        <CodeTabs
          title="graph_dfs"
          java={{
            code: `// DFS 递归:一条路走到黑
void dfs(List<List<Integer>> g, int u, boolean[] visited) {
    visited[u] = true;           // 进门先标记
    System.out.println(u);
    for (int v : g.get(u)) {
        if (!visited[v]) dfs(g, v, visited);   // 邻居没访问过就深入
    }
}

// DFS 迭代:手动用栈模拟递归(避免深图爆栈)
void dfsIter(List<List<Integer>> g, int start) {
    boolean[] visited = new boolean[g.size()];
    Deque<Integer> stack = new ArrayDeque<>();
    stack.push(start);
    while (!stack.isEmpty()) {
        int u = stack.pop();
        if (visited[u]) continue;   // 出栈时才判重(同一点可能被压入多次)
        visited[u] = true;
        System.out.println(u);
        for (int v : g.get(u)) {
            if (!visited[v]) stack.push(v);
        }
    }
}`,
            note: (
              <>
                递归版和迭代版访问顺序可能略有差异(栈是后进先出),但都是合法的 DFS。
                递归深度可能达到 V,V 很大时(如 10⁵ 个点连成一条链)要用迭代版防栈溢出。
              </>
            ),
          }}
          python={{
            code: `import sys
sys.setrecursionlimit(300000)   # 深图递归前,先调高 Python 递归上限

# DFS 递归:一条路走到黑
def dfs(g, u, visited):
    visited[u] = True            # 进门先标记
    print(u)
    for v in g[u]:
        if not visited[v]:
            dfs(g, v, visited)   # 邻居没访问过就深入

# DFS 迭代:手动用栈模拟递归(避免深图爆栈)
def dfs_iter(g, start, n):
    visited = [False] * n
    stack = [start]
    while stack:
        u = stack.pop()
        if visited[u]:
            continue             # 出栈时才判重
        visited[u] = True
        print(u)
        for v in g[u]:
            if not visited[v]:
                stack.append(v)`,
            note: (
              <>
                <b>易错点:</b>Python 默认递归上限约 1000,图一深就 <code>RecursionError</code>。
                要么 <code>setrecursionlimit</code> 调高,要么直接写迭代版。
              </>
            ),
          }}
          js={{
            code: `// DFS 递归:一条路走到黑
function dfs(g, u, visited) {
  visited[u] = true;             // 进门先标记
  console.log(u);
  for (const v of g[u]) {
    if (!visited[v]) dfs(g, v, visited);   // 邻居没访问过就深入
  }
}

// DFS 迭代:手动用栈模拟递归(避免深图爆栈)
function dfsIter(g, start, n) {
  const visited = new Array(n).fill(false);
  const stack = [start];
  while (stack.length) {
    const u = stack.pop();
    if (visited[u]) continue;    // 出栈时才判重
    visited[u] = true;
    console.log(u);
    for (const v of g[u]) {
      if (!visited[v]) stack.push(v);
    }
  }
}`,
            note: (
              <>
                JS 引擎调用栈也就一万多层,深递归同样会
                <code>Maximum call stack size exceeded</code>。竞赛/大数据量优先迭代版。
              </>
            ),
          }}
        />

        <div className="prose" style={{ marginTop: 24 }}>
          <p>
            最后一块拼图:<strong>网格型图</strong>。矩阵(第 1 章)天然是一张图 ——
            每个格子 <code>(r, c)</code> 是顶点,和上下左右四个格子相邻。遍历时不用真的建邻接表,
            用一个<strong>方向数组</strong>就能一次搞定四个方向,这是网格题的看家模板:
          </p>
        </div>
        <CodeTabs
          title="grid_dirs"
          java={{
            code: `// 网格即图:格子 (r,c) 是点,上下左右相邻是边
int[][] DIRS = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};   // 上 下 左 右

void gridDfs(int[][] grid, int r, int c) {
    int R = grid.length, C = grid[0].length;
    // 越界 或 不是想找的格子 → 立即回头(边界判断合成一行)
    if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] != 1) return;
    grid[r][c] = 2;                 // 标记已访问(改成别的值,免开 visited 数组)
    for (int[] d : DIRS) {
        gridDfs(grid, r + d[0], c + d[1]);   // 一个循环走四方向
    }
}`,
          }}
          python={{
            code: `# 网格即图:格子 (r,c) 是点,上下左右相邻是边
DIRS = [(-1, 0), (1, 0), (0, -1), (0, 1)]   # 上 下 左 右

def grid_dfs(grid, r, c):
    R, C = len(grid), len(grid[0])
    # 越界 或 不是想找的格子 → 立即回头
    if not (0 <= r < R and 0 <= c < C) or grid[r][c] != 1:
        return
    grid[r][c] = 2                 # 标记已访问(改成别的值)
    for dr, dc in DIRS:
        grid_dfs(grid, r + dr, c + dc)   # 一个循环走四方向`,
          }}
          js={{
            code: `// 网格即图:格子 (r,c) 是点,上下左右相邻是边
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];   // 上 下 左 右

function gridDfs(grid, r, c) {
  const R = grid.length, C = grid[0].length;
  // 越界 或 不是想找的格子 → 立即回头
  if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] !== 1) return;
  grid[r][c] = 2;                  // 标记已访问(改成别的值)
  for (const [dr, dc] of DIRS) {
    gridDfs(grid, r + dr, c + dc);        // 一个循环走四方向
  }
}`,
          }}
        />
        <Callout tone="idea" title="方向数组的两个小升级">
          <p>
            ① <b>八方向</b>(含对角线):<code>dirs</code> 写 8 个偏移即可。
            ② 直接改原网格值当 visited(如把 1 改成 2 或 0),省一个 visited 矩阵 ——
            但会破坏输入,面试时记得问一句「可以修改原数组吗」。网格 BFS 同理,
            把栈换成队列即可。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 三语言对照 ================= */}
      <Section
        id="langs"
        index="05"
        title="三语言对照:图没有内置类型,但有习惯写法"
        desc="没有哪个语言自带 Graph 类,大家都用「数组 / 哈希表 + 数组」自己实现邻接表 —— 但各有顺手的招"
      >
        <div className="prose">
          <p>
            和数组、哈希表不同,三种语言都<strong>没有开箱即用的图类型</strong>。
            但「用邻接表表示图」的写法高度统一,只是各语言有自己最顺手的容器。
            记住每种语言的<strong>建表惯用法</strong>和<strong>visited 用什么</strong>,
            上手任何图题都有章可循:
          </p>
        </div>
        <CodeTabs
          title="graph_repr_by_lang"
          java={{
            code: `// —— Java:两种常见写法 ——
// 写法 1:List<List<Integer>>(顶点是 0..n-1 的整数,最常用)
List<List<Integer>> g = new ArrayList<>();
for (int i = 0; i < n; i++) g.add(new ArrayList<>());
g.get(0).add(1);

// 写法 2:Map<T, List<T>>(顶点是任意类型,如字符串)
Map<String, List<String>> g2 = new HashMap<>();
g2.computeIfAbsent("A", k -> new ArrayList<>()).add("B");

// visited:整数顶点用 boolean[](最快);对象顶点用 HashSet
boolean[] visited = new boolean[n];
Set<String> seen = new HashSet<>();`,
            note: (
              <>
                <code>computeIfAbsent</code> 是建 <code>Map</code> 型邻接表的常用方法:
                key 不存在就先建空表再 add,一行搞定。
              </>
            ),
          }}
          python={{
            code: `# —— Python:defaultdict 最省心 ——
from collections import defaultdict
g = defaultdict(list)        # 访问不存在的 key 会自动给一个空列表
g[0].append(1)               # 不用手动判断 0 是否已存在

# 顶点是任意可哈希对象也一样
g2 = defaultdict(list)
g2["A"].append("B")

# visited:小图/对象顶点用 set;顶点是 0..n-1 时可用 [False]*n
visited = set()
visited.add(0)`,
            note: (
              <>
                <code>defaultdict(list)</code> 是 Python 建图的标配 —— 省掉了
                「key 不存在先初始化」的样板代码。带权图用{" "}
                <code>defaultdict(list)</code> 存 <code>(邻居, 权重)</code> 元组。
              </>
            ),
          }}
          js={{
            code: `// —— JavaScript:数组套数组 或 Map ——
// 顶点是 0..n-1:数组套数组(最常用)
const g = Array.from({ length: n }, () => []);
g[0].push(1);

// 顶点是字符串等:用 Map<key, array>
const g2 = new Map();
if (!g2.has("A")) g2.set("A", []);
g2.get("A").push("B");

// visited:整数顶点用定长数组;对象/字符串顶点用 Set
const visited = new Array(n).fill(false);
const seen = new Set();`,
            note: (
              <>
                <b>易错点:</b>建数组套数组千万别写 <code>new Array(n).fill([])</code> ——
                n 个格子会共享<b>同一个</b>数组!必须用{" "}
                <code>Array.from({ "{ length: n }" }, () =&gt; [])</code> 各建各的。
              </>
            ),
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>需求</th>
                <th>Java</th>
                <th>Python</th>
                <th>JavaScript</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>邻接表(整数顶点)</td>
                <td><code>List&lt;List&lt;Integer&gt;&gt;</code></td>
                <td><code>defaultdict(list)</code></td>
                <td><code>Array.from(..., () =&gt; [])</code></td>
              </tr>
              <tr>
                <td>邻接表(任意顶点)</td>
                <td><code>Map&lt;T, List&lt;T&gt;&gt;</code></td>
                <td><code>defaultdict(list)</code></td>
                <td><code>Map&lt;T, T[]&gt;</code></td>
              </tr>
              <tr>
                <td>队列(BFS)</td>
                <td><code>ArrayDeque</code></td>
                <td><code>collections.deque</code></td>
                <td>数组 + 读指针 head</td>
              </tr>
              <tr>
                <td>栈(DFS 迭代)</td>
                <td><code>ArrayDeque</code></td>
                <td><code>list</code>(append/pop)</td>
                <td><code>Array</code>(push/pop)</td>
              </tr>
              <tr>
                <td>visited(整数顶点)</td>
                <td><code>boolean[]</code></td>
                <td><code>[False]*n</code> 或 <code>set</code></td>
                <td><code>new Array(n).fill(false)</code></td>
              </tr>
              <tr>
                <td>小根堆(Dijkstra)</td>
                <td><code>PriorityQueue</code></td>
                <td><code>heapq</code></td>
                <td>无内置,手写 / 库</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="warn" title="JS 选手请注意:没有内置堆">
          <p>
            这是 JS 刷图论最大的短板:<b>没有优先队列 / 堆</b>。做 Dijkstra 时,
            要么自己手写一个二叉堆(第 9 章教过),要么在小图上用「每次线性扫最小」的
            O(V²) 版本先过。面试用 JS 时,提前把手写堆准备好。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 三大专题 ================= */}
      <Section
        id="topics"
        index="06"
        title="三大专题精讲:网格 · 拓扑 · 最短路"
        desc="图论题千千万,但高频套路就这三大类。每类配一道经典精讲,逐帧拆到底"
        badge={<span className="chip" data-tone="warn">★ 面试核心</span>}
      >
        {/* —— 专题一:网格 —— */}
        <div className="sec-head" style={{ marginTop: 8 }}>
          <span className="sec-index">专题一</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            网格也是图
          </h3>
        </div>
        <div className="prose">
          <p>
            一大票 LeetCode 中等题,本质都是「在网格上做 DFS / BFS」:岛屿数量、岛屿面积、
            被围绕的区域、腐烂的橘子…… 它们的共同套路是:
            <strong>把二维网格当成图,格子是点,上下左右相邻是边</strong>,然后遍历。
            核心技巧叫<strong>「淹没 / 染色」</strong> —— 访问过的格子直接改值,既当 visited 又防重复。
          </p>
        </div>

        <div className="sec-head" style={{ marginTop: 28 }}>
          <span className="sec-index">精讲 A</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 200 · 岛屿数量
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>给一个由 <code>'1'</code>(陆地)和 <code>'0'</code>(水)组成的网格,
            数出有几座岛(上下左右相连的陆地算一座)。
            <b> 思路:</b>逐格扫描,一旦遇到没被淹过的 <code>'1'</code>,岛屿数 +1,
            然后从这里 DFS,把整座岛的 <code>'1'</code> 全「淹成 <code>'0'</code>」,
            这样同一座岛不会被重复数。看动画,注意<b>绿色 = 已淹没(已计入某座岛)</b>:
          </p>
        </div>
        <GridDfsLab />
        <CodeTabs
          title="lc200_num_islands"
          java={{
            code: `class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[0].length; c++)
                if (grid[r][c] == '1') {   // 撞见新岛
                    count++;
                    sink(grid, r, c);      // 把整座岛淹掉
                }
        return count;
    }
    // DFS:把与 (r,c) 相连的 '1' 全改成 '0'
    void sink(char[][] grid, int r, int c) {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length
                || grid[r][c] != '1') return;
        grid[r][c] = '0';                  // 标记访问 = 淹没
        sink(grid, r - 1, c);
        sink(grid, r + 1, c);
        sink(grid, r, c - 1);
        sink(grid, r, c + 1);
    }
}`,
            hl: [6, 7, 8],
          }}
          python={{
            code: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        R, C = len(grid), len(grid[0])
        count = 0

        def sink(r, c):
            if not (0 <= r < R and 0 <= c < C) or grid[r][c] != '1':
                return
            grid[r][c] = '0'             # 标记访问 = 淹没
            sink(r - 1, c); sink(r + 1, c)
            sink(r, c - 1); sink(r, c + 1)

        for r in range(R):
            for c in range(C):
                if grid[r][c] == '1':    # 撞见新岛
                    count += 1
                    sink(r, c)           # 把整座岛淹掉
        return count`,
            hl: [15, 16, 17],
          }}
          js={{
            code: `var numIslands = function (grid) {
  const R = grid.length, C = grid[0].length;
  let count = 0;
  const sink = (r, c) => {
    if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] !== '1') return;
    grid[r][c] = '0';                  // 标记访问 = 淹没
    sink(r - 1, c); sink(r + 1, c);
    sink(r, c - 1); sink(r, c + 1);
  };
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (grid[r][c] === '1') {        // 撞见新岛
        count++;
        sink(r, c);                    // 把整座岛淹掉
      }
  return count;
};`,
            hl: [12, 13, 14],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(行×列)</b>:每个格子最多被访问一次(淹过就变 0)。空间是递归栈,
            最坏 O(行×列)(整张图全是陆地时)。面试常见追问:
            「不能改原网格怎么办?」(→ 另开 visited 矩阵)、「会爆栈怎么办?」(→ 改 BFS 或迭代 DFS)、
            「要数最大岛面积?」(→ LC695,让 DFS 返回淹没格子数)。淹没法是所有网格连通块题的模板。
          </p>
        </Callout>

        {/* —— 专题二:拓扑排序 —— */}
        <div className="sec-head" style={{ marginTop: 40 }}>
          <span className="sec-index">专题二</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            拓扑排序:给有依赖的任务排队
          </h3>
        </div>
        <div className="prose">
          <p>
            排课表、编译依赖、任务调度…… 这类问题都在问同一件事:
            <strong>一堆任务互相有「谁必须在谁之前」的约束,能不能排出一个合法顺序?</strong>
            这就是<strong>拓扑排序(topological sort)</strong>。它只对
            <strong>有向无环图(DAG)</strong> 成立 —— 一旦有环(A 依赖 B、B 又依赖 A),
            谁都没法先做,排不出来。
          </p>
          <p>
            最直观的算法是 <strong>Kahn 入度法</strong>,像现实里选课一样自然:
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 4 }}>
          <div className="card">
            <div className="card-kicker">STEP 1</div>
            <div className="card-title">数入度</div>
            <p>每个点的<b>入度</b> = 指向它的箭头数 = 它还有几门没修的前置课。</p>
          </div>
          <div className="card">
            <div className="card-kicker">STEP 2</div>
            <div className="card-title">入度 0 入队</div>
            <p>没有前置课(入度 0)的课,现在就能上,统统入队。</p>
          </div>
          <div className="card">
            <div className="card-kicker">STEP 3</div>
            <div className="card-title">出队 + 减入度</div>
            <p>出队一门课(修完),它的后继课入度各减 1;减到 0 的又能入队。循环到队空。</p>
          </div>
        </div>

        <div className="sec-head" style={{ marginTop: 28 }}>
          <span className="sec-index">精讲 B</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 207 · 课程表
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>共 numCourses 门课,<code>prerequisites[i] = [a, b]</code> 表示
            「修 a 前必须先修 b」。判断能否修完所有课。
            <b> 思路:</b>这就是问「这张有向图有没有环」—— 能跑完整个拓扑排序就无环。
            看 Kahn 逐帧:注意每个点下方的<b>入度</b>怎么随出队一路减到 0:
          </p>
        </div>
        <TopoLab />
        <CodeTabs
          title="lc207_course_schedule"
          java={{
            code: `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> g = new ArrayList<>();
        int[] indeg = new int[numCourses];
        for (int i = 0; i < numCourses; i++) g.add(new ArrayList<>());
        for (int[] p : prerequisites) {   // p = [课, 先修课]
            g.get(p[1]).add(p[0]);        // 先修课 → 课
            indeg[p[0]]++;                // 课的入度 +1
        }
        Queue<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < numCourses; i++)
            if (indeg[i] == 0) q.offer(i);   // 入度 0 先入队
        int done = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            done++;                       // 修完一门
            for (int v : g.get(u))
                if (--indeg[v] == 0) q.offer(v);  // 后继入度减到 0 才入队
        }
        return done == numCourses;        // 全修完 = 无环
    }
}`,
            hl: [18, 19, 20],
          }}
          python={{
            code: `from collections import deque

class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        g = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for course, pre in prerequisites:   # 修 course 前先修 pre
            g[pre].append(course)           # pre → course
            indeg[course] += 1
        q = deque(i for i in range(numCourses) if indeg[i] == 0)
        done = 0
        while q:
            u = q.popleft()
            done += 1                       # 修完一门
            for v in g[u]:
                indeg[v] -= 1
                if indeg[v] == 0:           # 后继入度减到 0 才入队
                    q.append(v)
        return done == numCourses           # 全修完 = 无环`,
            hl: [15, 16, 17, 18],
          }}
          js={{
            code: `var canFinish = function (numCourses, prerequisites) {
  const g = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [course, pre] of prerequisites) {  // 修 course 前先修 pre
    g[pre].push(course);                         // pre → course
    indeg[course]++;
  }
  const q = [];
  for (let i = 0; i < numCourses; i++)
    if (indeg[i] === 0) q.push(i);               // 入度 0 先入队
  let head = 0, done = 0;
  while (head < q.length) {
    const u = q[head++];
    done++;                                       // 修完一门
    for (const v of g[u])
      if (--indeg[v] === 0) q.push(v);            // 后继入度减到 0 才入队
  }
  return done === numCourses;                     // 全修完 = 无环
};`,
            hl: [14, 15, 16],
          }}
        />
        <Callout tone="deep" title="判环的三种正解 & 追问">
          <p>
            <b>有向图判环</b>你要能说出两法:① <b>拓扑排序</b>(本题),出队数 &lt; 点数即有环;
            ② <b>DFS 三色标记</b>:沿路径若又碰到「正在递归栈中(灰色)」的点,即成环。
            (注意:<b>无向图</b>判环才用并查集,别混。)追问延伸:LC210 要输出<b>具体的拓扑序</b>
            (把出队顺序记下来就是);带权任务调度、有先后约束的构造题,底层都是拓扑排序。
            复杂度 <BigO o="n" label="O(V+E)" />。
          </p>
        </Callout>

        {/* —— 专题三:最短路径 —— */}
        <div className="sec-head" style={{ marginTop: 40 }}>
          <span className="sec-index">专题三</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            最短路径:从 A 到 B 最省多少
          </h3>
        </div>
        <div className="prose">
          <p>
            「最短路」要先分清一件事:边<strong>带不带权</strong>。这决定了用哪把武器:
          </p>
        </div>
        <div className="grid-2">
          <div className="card hoverable">
            <div className="card-kicker">情形一 · 无权图</div>
            <div className="card-title">BFS 天生最短</div>
            <p>
              每条边「代价都是 1」时,BFS 按层扩散,<b>第一次到达某点的层数,就是最少步数</b>。
              不用任何高级算法,一个队列足矣。「最少几步 / 最少转几次」类题的首选。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">情形二 · 带权图(非负)</div>
            <div className="card-title">⛰️ Dijkstra 贪心</div>
            <p>
              边有不同权重(距离 / 耗时)时,BFS 失效(走的边少不代表总权小)。
              用 <b>Dijkstra</b>:小根堆每次挑出「当前离起点最近、还没定案」的点,定案后松弛它的邻居。
              呼应第 9 章的堆。
            </p>
          </div>
        </div>

        <div className="prose" style={{ marginTop: 18 }}>
          <p>
            重点讲 <strong>Dijkstra</strong>。它的贪心信念是:
            <strong>每次从「未定案的点」里挑 dist 最小的那个,它的最短路此刻就能拍板了</strong>
            —— 因为边权非负,任何绕远路只会更贵,不可能反超。定案后,用它去
            <strong>松弛(relax)</strong>邻居:<code>if dist[u] + w &lt; dist[v]: 更新 dist[v]</code>。
            看 5 个点的完整演算,注意 dist 怎么被一次次「刷新纪录」:
          </p>
        </div>
        <DijkstraLab />

        <div className="sec-head" style={{ marginTop: 28 }}>
          <span className="sec-index">精讲 C</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 743 · 网络延迟时间
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>从节点 k 发信号,<code>times[i] = [u, v, w]</code> 表示信号从 u 到 v 要 w 时间。
            求信号传遍所有 n 个节点最少需要多久(传不到返回 −1)。
            <b> 思路:</b>标准单源最短路 —— Dijkstra 求出 k 到每个点的最短时间,
            <b>答案就是这些最短时间里的最大值</b>(最后一个收到信号的点决定总耗时);
            若有点是 ∞(不可达)则返回 −1。
          </p>
        </div>
        <CodeTabs
          title="lc743_network_delay"
          java={{
            code: `class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        // 带权邻接表:g[u] = 若干 [v, w]
        List<int[]>[] g = new List[n + 1];
        for (int i = 1; i <= n; i++) g[i] = new ArrayList<>();
        for (int[] t : times) g[t[0]].add(new int[]{t[1], t[2]});

        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;
        // 小根堆按 dist 排序,元素 = [节点, 到它的距离]
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
        pq.offer(new int[]{k, 0});
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int u = top[0], d = top[1];
            if (d > dist[u]) continue;        // 过期的旧记录,跳过
            for (int[] e : g[u]) {            // 松弛 u 的每条出边
                int v = e[0], w = e[1];
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    pq.offer(new int[]{v, dist[v]});
                }
            }
        }
        int ans = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == Integer.MAX_VALUE) return -1;  // 有点收不到
            ans = Math.max(ans, dist[i]);     // 取最慢那个点
        }
        return ans;
    }
}`,
            hl: [17, 18, 19, 20, 21, 22, 23],
            note: (
              <>
                <code>if (d &gt; dist[u]) continue;</code> 这句很关键:堆里可能残留同一个点
                的旧(更大)距离,弹出时发现比当前 dist 还大,就是过期记录,直接跳过。
              </>
            ),
          }}
          python={{
            code: `import heapq

class Solution:
    def networkDelayTime(self, times: list[list[int]], n: int, k: int) -> int:
        g = [[] for _ in range(n + 1)]
        for u, v, w in times:
            g[u].append((v, w))             # 带权邻接表

        dist = [float('inf')] * (n + 1)
        dist[k] = 0
        pq = [(0, k)]                        # (距离, 节点),堆按第一维排序
        while pq:
            d, u = heapq.heappop(pq)
            if d > dist[u]:
                continue                     # 过期记录,跳过
            for v, w in g[u]:                # 松弛 u 的每条出边
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
                    heapq.heappush(pq, (dist[v], v))

        ans = max(dist[1:])
        return ans if ans < float('inf') else -1`,
            hl: [13, 14, 15, 16, 17, 18],
            note: (
              <>
                Python 的 <code>heapq</code> 是小根堆,把元组第一维放距离就自动按距离出堆。
                最后 <code>max(dist[1:])</code> 跳过下标 0(节点从 1 编号)。
              </>
            ),
          }}
          js={{
            code: `// JS 无内置堆,这里用「线性找最小」的 O(V²) 版,思路完全一致
var networkDelayTime = function (times, n, k) {
  const g = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) g[u].push([v, w]);

  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const done = new Array(n + 1).fill(false);
  for (let it = 0; it < n; it++) {
    // 选未定案、dist 最小的点(有堆时换成堆弹出,即 O(E log V))
    let u = -1;
    for (let i = 1; i <= n; i++)
      if (!done[i] && dist[i] !== Infinity && (u === -1 || dist[i] < dist[u])) u = i;
    if (u === -1) break;
    done[u] = true;
    for (const [v, w] of g[u])              // 松弛 u 的每条出边
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
  }
  let ans = 0;
  for (let i = 1; i <= n; i++) {
    if (dist[i] === Infinity) return -1;    // 有点收不到
    ans = Math.max(ans, dist[i]);
  }
  return ans;
};`,
            hl: [11, 12, 13, 14, 15, 16, 17],
            note: (
              <>
                想要正统 <BigO o="nlogn" label="O(E log V)" /> 的 JS 版,得自己手写二叉堆
                (第 9 章)。这里的 O(V²) 版在 LC743 数据规模下足够。
              </>
            ),
          }}
        />
        <Callout tone="deep" title="Dijkstra 的三个灵魂问题">
          <p>
            ① <b>为什么用小根堆?</b>为了每次 O(log V) 地取出「当前最近的未定案点」,不用线性扫。
            ② <b>为什么怕负权?</b>Dijkstra 靠「弹出即定案、永不反悔」,这依赖非负权(绕路只会更贵)。
            有负边时,一条后来发现的负边可能让已定案点变更短,贪心崩塌 —— 这时改用
            <b>Bellman-Ford</b>(可判负环)或 SPFA。
            ③ <b>复杂度?</b>用堆是 <BigO o="nlogn" label="O(E log V)" />。
            这三问几乎是最短路面试的固定曲目。
          </p>
        </Callout>
        <Callout tone="warn" title="别把 BFS 和 Dijkstra 记混">
          <p>
            无权图(或所有边权相同)求最短路,<b>千万别上 Dijkstra</b> —— 直接 BFS 更简单更快。
            Dijkstra 是「带非负权」时才需要的升级款。看到「最少步数 / 最少操作次数」优先想 BFS;
            看到「最短距离 / 最小花费 + 边权不一」才想 Dijkstra。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title="高频题单:图 9 题"
        desc="覆盖网格 DFS/BFS、多源 BFS、拓扑排序、最短路、隐式图。由易到难,勾选进度存本地"
        badge={<span className="chip">Hot 精选</span>}
      >
        <ProblemSet ch="graph" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="8 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="graph" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            <b>万物皆点,关系皆边。</b>链表、树、网格都是图的特例 —— 链表是「每点一条出边的直线图」,
            树是「无环连通图」,网格是「格子和上下左右相邻的图」。
          </>,
          <>
            两种表示法:<b>邻接矩阵</b> O(V²) 空间、查边 O(1);<b>邻接表</b> O(V+E) 空间、遍历邻居快。
            <b>稀疏图默认邻接表</b>,这是刷题主力。
          </>,
          <>
            遍历只有两招:<b>BFS 用队列</b>(一层层扩散,呼应队列章)、<b>DFS 用栈/递归</b>
            (一路走到黑,呼应栈与树)。都是 <b>O(V+E)</b>,且<b>图有环 → visited 绝不能省</b>。
          </>,
          <>
            <b>网格题</b>=网格上的 DFS/BFS + 方向数组 <code>dirs</code>;「淹没/染色」把访问过的格子改值,
            一举兼任 visited(LC200 岛屿是模板)。
          </>,
          <>
            <b>拓扑排序</b>只对 <b>DAG(有向无环图)</b> 成立:Kahn 入度法(入度 0 入队 → 出队减邻居入度),
            <b>出不完 = 有环</b>。这也是有向图判环的一种正解(另一种是 DFS 三色)。
          </>,
          <>
            最短路看边权:<b>无权用 BFS</b>(按层天生最短);<b>带非负权用 Dijkstra</b>
            (贪心 + 小根堆,呼应堆章);<b>Dijkstra 怕负权</b>(会破坏「定案不反悔」),
            负权改用 Bellman-Ford。
          </>,
        ]}
      />

      <ChapterFooter ch="graph" />
    </main>
  );
}
