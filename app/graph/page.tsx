"use client";

// Chapter 12 · Graphs — the most general form a data structure takes.
// Structure: intuition and terminology → the two representations → traversal (the
// BFS/DFS centerpiece interaction) → from-scratch implementation → three-language
// comparison → three major walkthrough topics (grid / topological sort / shortest path,
// frame-by-frame animation + three-language solutions) → problem set → quiz → key
// points. Every structure from the first 11 chapters surfaces here: linked lists, trees,
// and grids are all special cases of a graph.
//
// Bilingual: every learner-facing string uses <T en zh> or { en, zh }, English is the default.
// The code windows take code as { en, zh } — the two versions are line-for-line equivalent
// and differ only in their comments, which is what keeps the hl line numbers aligned.

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
import { T } from "@/lib/i18n";
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

/* ================= Page ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: { en: "Intuition", zh: "直觉与术语" } },
  { id: "repr", n: "02", label: { en: "Two representations", zh: "两种表示法" } },
  { id: "traverse", n: "03", label: { en: "BFS and DFS", zh: "遍历 BFS/DFS" } },
  { id: "build", n: "04", label: { en: "Build them", zh: "手写实现" } },
  { id: "langs", n: "05", label: { en: "Three languages", zh: "三语言对照" } },
  { id: "topics", n: "06", label: { en: "Three patterns", zh: "三大专题" } },
  { id: "problems", n: "07", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "08", label: { en: "Quiz", zh: "通关测验" } },
];

export default function GraphChapter() {
  return (
    <main className="page" data-ch="graph">
      <Hero
        ch="graph"
        title={{
          en: (
            <>
              The <span className="grad">Graph</span>
            </>
          ),
          zh: (
            <>
              图 <span className="grad">Graph</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A graph is a set of <strong>vertices</strong> and a set of{" "}
              <strong>edges</strong> that record relationships between them.
              Stations and track, people and friendships, pages and links,
              courses and prerequisites — anything made of things plus
              connections between things is a graph. It is also the most general
              structure in this book: the linked list, the tree, and the grid
              from the earlier chapters are all special cases of it.
            </>
          ),
          zh: (
            <>
              图是一组<strong>顶点</strong>加一组记录它们之间关系的
              <strong>边</strong>。地铁站与线路、人与好友、网页与链接、
              课程与先修 —— 只要有「东西」和「东西之间的联系」,画出来就是一张图。
              它也是全书最一般的结构:前面学的链表、树、网格,都是它的特例。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 Intuition and terminology ================= */}
      <Section
        id="intuition"
        index="01"
        title={{
          en: "Why graphs: things, and the connections between them",
          zh: "为什么需要图:万物皆点,关系皆边",
        }}
        desc={{
          en: "When relationships stop being one-to-one or one-to-many, and start being many-to-many with loops, you need a graph.",
          zh: "当数据之间的关系不再是「一对一」或「一对多」,而是「多对多、还能绕圈」时,图登场了",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Look back at the structures so far. An array is{" "}
                  <strong>one row</strong>. A linked list is{" "}
                  <strong>one chain</strong>. A tree{" "}
                  <strong>branches downward and never returns</strong>. They all
                  share one limit: real relationships are often{" "}
                  <strong>many-to-many, and they can loop back</strong>.
                </p>
                <p>
                  Here are four everyday examples that none of the earlier
                  structures can hold:
                </p>
              </>
            }
            zh={
              <>
                <p>
                  先回忆一路走来的结构:数组是<strong>一排</strong>,链表是
                  <strong>一条链</strong>,树<strong>只向下分叉、从不回头</strong>。
                  它们都有同一个限制:现实里的关系常常是
                  <strong>多对多、还能绕回来</strong>的。
                </p>
                <p>下面四件每天都在发生的事,用前面的结构都装不下:</p>
              </>
            }
          />
        </div>
        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Example 1" zh="场景一" />
            </div>
            <div className="card-title">
              <T en="A subway map" zh="地铁线路图" />
            </div>
            <p>
              <T
                en={
                  <>
                    Each <b>station</b> is a vertex and each stretch of{" "}
                    <b>track</b> is an edge. An interchange station joins several
                    lines, and you can ride in a loop back to where you started.
                    Branches plus loops: a tree cannot draw this.
                  </>
                }
                zh={
                  <>
                    每个<b>站</b>是一个点,每段<b>轨道</b>是一条边。
                    换乘站连着好几条线,还能坐一圈绕回原地 —— 有分叉、有环,
                    树画不出来。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Example 2" zh="场景二" />
            </div>
            <div className="card-title">
              <T en="A social network" zh="社交网络" />
            </div>
            <p>
              <T
                en={
                  <>
                    Each <b>person</b> is a vertex. &ldquo;Is a friend of&rdquo;
                    is an undirected edge; &ldquo;follows&rdquo; is a directed
                    one. A friend of a friend of A can be A again, so the
                    relationships form a web, not a tree that only goes down.
                  </>
                }
                zh={
                  <>
                    每个<b>人</b>是点,「是好友」是无向边,「关注」是有向边。
                    A 的朋友的朋友可能又是 A —— 关系交织成网,
                    不是层层向下的树。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Example 3" zh="场景三" />
            </div>
            <div className="card-title">
              <T en="Course prerequisites" zh="课程依赖" />
            </div>
            <p>
              <T
                en={
                  <>
                    Each <b>course</b> is a vertex and &ldquo;is a prerequisite
                    of&rdquo; is a directed edge. Data structures needs arrays
                    first; operating systems needs C first. All these &ldquo;this
                    must come before that&rdquo; rules form a directed graph.
                  </>
                }
                zh={
                  <>
                    每门<b>课</b>是点,「先修」是有向边。数据结构要先学数组,
                    操作系统要先学 C 语言 ——
                    这些「谁必须在谁之前」构成一张有向图。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Example 4" zh="场景四" />
            </div>
            <div className="card-title">
              <T en="Web pages and links" zh="网页与超链接" />
            </div>
            <p>
              <T
                en={
                  <>
                    Each <b>page</b> is a vertex and each <b>hyperlink</b> is a
                    directed edge. Google started by treating the whole web as
                    one huge graph and ranking results by how pages link to each
                    other (PageRank).
                  </>
                }
                zh={
                  <>
                    每个<b>网页</b>是点,每个<b>超链接</b>是有向边。Google
                    当年就是把整个互联网建成一张巨图,
                    靠网页之间的链接关系排出搜索结果(PageRank)。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <div className="prose" style={{ marginTop: 24 }}>
          <T
            en={
              <p>
                Graphs come with a small vocabulary. Each word names something
                simple. The picture below labels all of them at once:
              </p>
            }
            zh={
              <p>
                要谈图,先得会图的术语。每个词指的都是很朴素的东西 ——
                下面这张图把它们全标了出来:
              </p>
            }
          />
        </div>
        <TermGraph />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Term" zh="术语" />
                </th>
                <th>
                  <T en="In plain words" zh="大白话" />
                </th>
                <th>
                  <T en="Notation" zh="正式说法" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T en="Vertex (V)" zh="顶点 vertex(V)" />
                  </b>
                </td>
                <td>
                  <T
                    en="A point in the graph; it holds the data"
                    zh="图里的一个「点」,装数据的地方"
                  />
                </td>
                <td>
                  <T
                    en="node / vertex; the count is written |V| or n"
                    zh="node / vertex,总数记作 |V| 或 n"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Edge (E)" zh="边 edge(E)" />
                  </b>
                </td>
                <td>
                  <T
                    en="A link between two vertices; it records one relationship"
                    zh="连接两个点的「线」,表示一种关系"
                  />
                </td>
                <td>
                  <T
                    en="edge; the count is written |E| or m"
                    zh="edge,总数记作 |E| 或 m"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Directed / undirected" zh="有向 / 无向" />
                  </b>
                </td>
                <td>
                  <T
                    en="Does the edge have an arrow? Following is directed; shaking hands is not"
                    zh="边有没有箭头:「关注」有向,「握手」无向"
                  />
                </td>
                <td>directed / undirected</td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Weighted" zh="带权 weighted" />
                  </b>
                </td>
                <td>
                  <T
                    en="The edge carries a number: distance, time, or cost"
                    zh="边上带数字:距离、耗时、费用"
                  />
                </td>
                <td>
                  <T en="weight w(u, v)" zh="weight w(u, v)" />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Degree" zh="度 degree" />
                  </b>
                </td>
                <td>
                  <T
                    en="How many edges meet at this vertex"
                    zh="一个点连了几条边"
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        In a directed graph it splits into <b>in-degree</b>{" "}
                        (arrows in) and <b>out-degree</b> (arrows out)
                      </>
                    }
                    zh={
                      <>
                        有向图分<b>入度</b>(指进来)/ <b>出度</b>(指出去)
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Path" zh="路径 path" />
                  </b>
                </td>
                <td>
                  <T
                    en="A sequence of vertices you walk through along edges"
                    zh="沿着边从一个点走到另一个点的序列"
                  />
                </td>
                <td>
                  <T
                    en="path; its length is the number of edges, or the sum of the weights"
                    zh="path;长度 = 边数(或权重之和)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Cycle" zh="环 cycle" />
                  </b>
                </td>
                <td>
                  <T
                    en="Leaving a vertex and coming back to it along edges"
                    zh="从一个点出发,能沿边绕回它自己"
                  />
                </td>
                <td>
                  <T
                    en="cycle; a directed graph with no cycle is a DAG"
                    zh="cycle;无环有向图 = DAG"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T en="Connected" zh="连通 connected" />
                  </b>
                </td>
                <td>
                  <T
                    en="Every pair of vertices has a path between them"
                    zh="任意两点之间都有路可通"
                  />
                </td>
                <td>
                  <T
                    en="a connected component is a group of vertices that can all reach each other"
                    zh="连通分量 = 互相可达的一组点"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="prose" style={{ marginTop: 20 }}>
          <T
            en={<p>Three variations, drawn side by side:</p>}
            zh={<p>再看图的三种「变种」,一图胜千言:</p>}
          />
        </div>
        <MiniConcepts />

        <Callout
          tone="idea"
          title={{
            en: "The point: the earlier structures are all graphs",
            zh: "点题:前面学的,全是图的特例",
          }}
        >
          <T
            en={
              <p>
                This is the one sentence to take away from the chapter. A{" "}
                <b>singly linked list</b> is a graph where every vertex has one
                outgoing edge, laid out in a line. A <b>tree</b> is a graph that
                is connected, has no cycle, and has one vertex chosen as the
                root. A <b>grid</b> is a graph where each cell is a vertex and
                cells that touch up, down, left, or right are joined by an edge.
                You have been working with graphs all along. This chapter takes
                the most general form and studies it directly.
              </p>
            }
            zh={
              <p>
                这是本章最该带走的一句话。<b>单链表</b>是「每个点只有一条出边、
                串成一条直线」的图;<b>树</b>是「连通 + 无环 + 指定了一个根」的图;
                <b>网格</b>是「每个格子是点、上下左右相邻是边」的图。
                所以你早就在和图打交道了 —— 现在,我们把最一般的那种拿出来单独讲。
              </p>
            }
          />
        </Callout>
        <Callout
          tone="story"
          title={{
            en: "A bridge problem that started a field",
            zh: "一座桥引出的整个学科",
          }}
        >
          <T
            en={
              <p>
                In 1736 Leonhard Euler studied the seven bridges of Konigsberg:
                can you cross all seven bridges, each exactly once, in a single
                walk? He replaced each piece of land with a <b>vertex</b> and
                each bridge with an <b>edge</b>, and proved it is impossible.
                That is where graph theory begins. The same abstraction now
                supports navigation, social networks, compilers, chip routing,
                and the internet itself. Turning a complicated situation into
                vertices and edges is one of the most useful moves in computer
                science.
              </p>
            }
            zh={
              <p>
                1736 年,数学家欧拉(Euler)研究「柯尼斯堡七桥问题」:
                能不能一次走遍七座桥、每座只过一次?他把陆地抽象成<b>点</b>、
                桥抽象成<b>边</b>,证明了这不可能 —— 图论就此诞生。
                两百多年后,同样的「点 + 边」抽象撑起了导航、社交、编译器、
                芯片布线和整个互联网。把复杂现实抽象成点和边,
                是计算机科学最有用的思维工具之一。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §02 Two representations ================= */}
      <Section
        id="repr"
        index="02"
        title={{
          en: "In memory: adjacency matrix and adjacency list",
          zh: "内存里的样子:邻接矩阵 vs 邻接表",
        }}
        desc={{
          en: "A graph has no natural memory layout, so you choose how to record which vertices are joined.",
          zh: "图不像数组那样有天然的内存布局,得由我们决定「怎么记录哪些点之间有边」",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                An array has contiguous memory and an index formula. A tree has a
                node with two references. A graph has neither, because its shape
                varies. Two representations cover almost all practical use, and
                choosing between them is a plain{" "}
                <strong>time against space</strong> trade-off. Click a vertex
                below and compare the same graph in both forms:
              </p>
            }
            zh={
              <p>
                数组有「连续内存 + 下标公式」,树有「节点 + 左右引用」。
                图两样都没有,因为它的形状千变万化。工程上最常用两种表示法,
                它们的取舍就是一场典型的<strong>「时间 vs 空间」</strong>权衡。
                点下面的顶点,对照着看同一张图的两种长相:
              </p>
            }
          />
        </div>
        <ReprLab />

        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-kicker">
              <T en="Representation 1" zh="表示法一" />
            </div>
            <div className="card-title">
              <T
                en="Adjacency matrix"
                zh="邻接矩阵 adjacency matrix"
              />
            </div>
            <p>
              <T
                en={
                  <>
                    A <b>V x V</b> table where <code>matrix[i][j] = 1</code>{" "}
                    means there is an edge from i to j (a weighted graph stores
                    the weight instead). For an undirected graph the table is{" "}
                    <b>symmetric</b> across the diagonal. Advantage: asking
                    whether i and j are joined takes one read,{" "}
                    <BigO o="1" />. Cost: it occupies <BigO o="n2" /> space
                    however few edges exist.
                  </>
                }
                zh={
                  <>
                    一张 <b>V x V</b> 的二维表,<code>matrix[i][j] = 1</code>{" "}
                    表示 i 到 j 有边(带权图就存权重)。无向图的矩阵沿对角线
                    <b>对称</b>。好处:查「i、j 之间有没有边」一步到位,
                    <BigO o="1" />;坏处:不管图多稀疏,都硬占 <BigO o="n2" />{" "}
                    空间。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">
              <T en="Representation 2" zh="表示法二" />
            </div>
            <div className="card-title">
              <T en="Adjacency list" zh="邻接表 adjacency list" />
            </div>
            <p>
              <T
                en={
                  <>
                    Each vertex keeps a list of its neighbors (an array of
                    arrays, or a hash map of arrays). Only the edges that{" "}
                    <b>exist</b> are stored, so the space is{" "}
                    <BigO o="n" label="O(V + E)" />, and reading all neighbors of
                    a vertex is direct. Cost: asking whether i and j are joined
                    means scanning i&rsquo;s list, O(deg i) in the worst case.{" "}
                    <b>This is the default for problem solving and for most
                    production code.</b>
                  </>
                }
                zh={
                  <>
                    每个点挂一串「它的邻居」(数组套数组 / 哈希表套数组)。
                    只存<b>真实存在的边</b>,空间{" "}
                    <BigO o="n" label="O(V + E)" />;
                    取一个点的所有邻居也很直接。代价:查「i、j 之间有没有边」
                    要扫 i 的邻居串,最坏 O(deg i)。
                    <b>绝大多数刷题和工程场景都用它。</b>
                  </>
                }
              />
            </p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Compared on" zh="对比维度" />
                </th>
                <th>
                  <T en="Adjacency matrix" zh="邻接矩阵" />
                </th>
                <th>
                  <T en="Adjacency list" zh="邻接表" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <T en="Space" zh="空间" />
                </td>
                <td>
                  <BigO o="n2" label="O(V²)" />{" "}
                  <T en="always" zh="恒定" />
                </td>
                <td>
                  <BigO o="n" label="O(V + E)" />{" "}
                  <T en="grows with the edges" zh="随边多少变" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Is there an edge u–v?" zh="查 u、v 间有无边" />
                </td>
                <td>
                  <BigO o="1" />{" "}
                  <T en="— read matrix[u][v]" zh="—— 直接读 matrix[u][v]" />
                </td>
                <td>
                  <BigO o="n" label="O(deg u)" />{" "}
                  <T
                    en="— scan the neighbors of u"
                    zh="—— 扫 u 的邻居"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Visit all neighbors of u" zh="遍历 u 的所有邻居" />
                </td>
                <td>
                  <BigO o="n" label="O(V)" />{" "}
                  <T
                    en="— scan the whole row, including the zeros"
                    zh="—— 要扫整行(含没边的 0)"
                  />
                </td>
                <td>
                  <BigO o="n" label="O(deg u)" />{" "}
                  <T
                    en="— one step per neighbor"
                    zh="—— 有几个邻居就走几步"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Add one edge" zh="加一条边" />
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <BigO o="1" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Fits" zh="适合" />
                </td>
                <td>
                  <T
                    en="Dense graphs (E close to V²), and repeated edge tests"
                    zh="稠密图(E 接近 V²)、频繁查两点间有无边"
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <b>
                          Sparse graphs (E much smaller than V²), and frequent
                          neighbor traversal
                        </b>{" "}
                        ← the default
                      </>
                    }
                    zh={
                      <>
                        <b>稀疏图(E 远小于 V²)、需要频繁遍历邻居</b> ← 默认选它
                      </>
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout
          tone="deep"
          title={{
            en: "A third form: the edge list",
            zh: "第三种:边列表 edge list",
          }}
        >
          <T
            en={
              <p>
                The simplest form of all: one array whose elements are edges,{" "}
                <code>[u, v, w]</code>. It suits algorithms that read all edges
                once and then sort them, such as Kruskal&rsquo;s minimum spanning
                tree, or cycle detection with union-find. But listing the
                neighbors of one vertex means scanning every edge, which is too
                slow for traversal. So an edge list is usually only the{" "}
                <b>input format</b>: the problem hands you an edge list, and your
                first step is to turn it into an adjacency list.
              </p>
            }
            zh={
              <p>
                最朴素的存法:一个数组,每个元素是 <code>[u, v, w]</code> 一条边。
                它适合「一次性读入全部边再排序」的算法,比如最小生成树的
                Kruskal、并查集判环。但想取某点的邻居得扫全部边,做遍历太慢。
                所以它常常只是<b>输入格式</b> —— 题目给你 edge list,
                你第一步往往是把它转成邻接表。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §03 Traversal ================= */}
      <Section
        id="traverse"
        index="03"
        title={{
          en: "The core: two ways to walk a graph, BFS and DFS",
          zh: "核心:图的两种走法 BFS 与 DFS",
        }}
        desc={{
          en: "There are two ways to reach every vertex: spread outward layer by layer (BFS), or follow one path to the end (DFS).",
          zh: "访问图里的每一个点,只有两条路子 —— 要么一层层向外扩(BFS),要么一条道扎到底(DFS)",
        }}
        badge={
          <span className="chip" data-tone="warn">
            <T en="★ Core of the chapter" zh="★ 全章核心" />
          </span>
        }
      >
        <div className="prose">
          <T
            en={
              <p>
                Most graph algorithms are built on one operation: visit every
                vertex. Two ways to do that have become standard, and each reuses
                a structure you already know.
              </p>
            }
            zh={
              <p>
                图的绝大多数算法,骨架都是「把每个点访问一遍」。
                访问图有两种标准走法,它们分别复用了你已经学过的一种结构:
              </p>
            }
          />
        </div>
        <div className="grid-2">
          <div className="card hoverable">
            <div className="card-kicker">
              <T
                en="Way 1 · uses the queue from chapter 5"
                zh="走法一 · 呼应第 5 章队列"
              />
            </div>
            <div className="card-title">
              <T en="BFS, breadth-first search" zh="BFS 广度优先" />
            </div>
            <p>
              <T
                en={
                  <>
                    The search spreads <b>outward one layer at a time</b>: visit
                    the start, then all of its neighbors, then their unvisited
                    neighbors, and so on. It is driven by a{" "}
                    <b>queue (first in, first out)</b>. Vertices come out grouped
                    by how many edges they are from the start, which is why BFS
                    finds the <b>fewest-edges path in an unweighted graph</b>.
                  </>
                }
                zh={
                  <>
                    搜索<b>一层一层</b>向外扩:先访问起点,再访问它所有邻居,
                    再访问「邻居里没访问过的邻居」…… 用
                    <b>队列(先进先出)</b>驱动。点是按「离起点几条边」分层出来的,
                    所以 BFS 能求<b>无权图里边数最少的路径</b>。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T
                en="Way 2 · uses the stack from chapter 4 and the recursion from chapter 7"
                zh="走法二 · 呼应第 4 章栈 / 第 7 章递归"
              />
            </div>
            <div className="card-title">
              <T en="DFS, depth-first search" zh="DFS 深度优先" />
            </div>
            <p>
              <T
                en={
                  <>
                    The search follows <b>one path as far as it goes</b>, then
                    backs up to the last junction and tries another. It is driven
                    by a <b>stack</b> (or by recursion, where the call stack is
                    that stack). It suits problems about exploring all paths,
                    connected components, and cycles.
                  </>
                }
                zh={
                  <>
                    搜索<b>沿一条路走到走不通</b>,再退回上一个岔口换一条。
                    用<b>栈</b>驱动(或者写成递归,系统调用栈就是那个栈)。
                    适合「探索所有路径 / 连通块 / 找环」这类问题。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <div className="prose" style={{ marginTop: 20 }}>
          <T
            en={
              <p>
                The clearest way to see the difference is to watch it. The graph
                below has 8 vertices. Switch between BFS and DFS and step through
                it. Watch how the <b>queue or stack</b> changes, how the{" "}
                <b>visited</b> set grows, and in what <b>order</b> the vertices
                light up (the #number under each vertex is its visit order).
              </p>
            }
            zh={
              <p>
                光看文字不如亲眼看。下面这张 8 个点的图,切换 BFS / DFS,
                一步步播放 —— 注意看下方<b>队列 / 栈</b>的内容怎么变、
                <b>visited</b> 集合怎么长,以及节点点亮的<b>顺序</b>
                (每个点下面的 #编号就是访问序)。
              </p>
            }
          />
        </div>
        <GraphLab />

        <Callout
          tone="warn"
          title={{
            en: "Why graph traversal always needs a visited set",
            zh: "为什么图遍历一定要 visited",
          }}
        >
          <T
            en={
              <p>
                This is the real difference between a graph and a tree.{" "}
                <b>A tree has no cycle</b>: walking down from the root never
                returns to an ancestor, so tree traversal (chapter 7) needs no
                visited set. <b>A graph can have a cycle</b>: A to B to C back to
                A. Without a record of which vertices have been reached, the
                traversal goes around that cycle forever and the program never
                stops. So the rule is: check visited before entering a vertex,
                and mark it immediately. In BFS,{" "}
                <b>mark a vertex when you put it in the queue</b>, not when you
                take it out — otherwise every edge pointing at that vertex queues
                it again.
              </p>
            }
            zh={
              <p>
                这是图与树最本质的区别。<b>树没有环</b>:从根往下走,
                永远不会绕回已经走过的祖先,所以树的遍历(第 7 章)从不需要
                visited。<b>图可能有环</b>:A→B→C→A……
                没有记录「谁来过」,遍历就会在环里无限打转,程序永远停不下来。
                所以规则是:进入一个点前先查 visited,进入后立刻标记。
                BFS 里更要<b>「一入队就标记」</b>,而不是出队才标记 ——
                否则每一条指向它的边都会把它再塞进队列一次。
              </p>
            }
          />
        </Callout>

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th></th>
                <th>
                  <T en="BFS, breadth-first" zh="BFS 广度优先" />
                </th>
                <th>
                  <T en="DFS, depth-first" zh="DFS 深度优先" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <T en="Helper structure" zh="辅助结构" />
                </td>
                <td>
                  <T en="Queue (FIFO)" zh="队列(FIFO)" />
                </td>
                <td>
                  <T en="Stack or recursion (LIFO)" zh="栈 / 递归(LIFO)" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Visit order" zh="访问顺序" />
                </td>
                <td>
                  <T en="By layer, nearest first" zh="按层,由近及远" />
                </td>
                <td>
                  <T
                    en="One path to the end, then back up"
                    zh="沿一条路走到底再回头"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Time" zh="时间复杂度" />
                </td>
                <td colSpan={2} style={{ textAlign: "center" }}>
                  <T
                    en={
                      <>
                        Both <BigO o="n" label="O(V + E)" /> with an adjacency
                        list — each vertex is handled once, each edge is looked
                        at once
                      </>
                    }
                    zh={
                      <>
                        用邻接表时都是 <BigO o="n" label="O(V + E)" /> ——
                        每个点处理一次、每条边看一次
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Space" zh="空间复杂度" />
                </td>
                <td>
                  <T
                    en="O(V) — the visited set, plus a queue that at worst holds the widest layer"
                    zh="O(V) —— visited 集合,加上最坏装下最宽一层的队列"
                  />
                </td>
                <td>
                  <T
                    en="O(V) — the visited set, plus a stack that at worst equals the longest path"
                    zh="O(V) —— visited 集合,加上最坏等于最长路径的递归栈"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Best at" zh="拿手好戏" />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <b>Shortest path in an unweighted graph</b>, spreading by
                        layer (rotting oranges)
                      </>
                    }
                    zh={
                      <>
                        <b>无权图最短路</b>、按层扩散(腐烂橘子)
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <b>Connected components and islands</b>, cycles,
                        topological order, backtracking
                      </>
                    }
                    zh={
                      <>
                        <b>连通块 / 岛屿</b>、找环、拓扑排序、回溯
                      </>
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="idea"
          title={{
            en: "Remember this complexity: O(V + E)",
            zh: "记住这条复杂度:O(V + E)",
          }}
        >
          <T
            en={
              <p>
                With an adjacency list, both BFS and DFS run in{" "}
                <b>O(V + E)</b>. Each vertex is processed once, which contributes
                V. Each edge is examined once in a directed graph, or once from
                each endpoint in an undirected graph, which contributes E. This
                is the most basic complexity in graph theory, and almost every
                later algorithm grows out of it. With an adjacency matrix the
                same traversal costs O(V²) instead, because finding the neighbors
                of a vertex means scanning a whole row.
              </p>
            }
            zh={
              <p>
                用邻接表时,BFS 和 DFS 的复杂度都是 <b>O(V + E)</b>:
                每个顶点被处理一次(贡献 V),每条边被检查一次
                (有向图一次、无向图两端各一次,贡献 E)。
                这是图论最基础的一条复杂度,后面几乎所有算法都从它长出来。
                换成邻接矩阵,同样的遍历会变成 O(V²),
                因为取一个点的邻居要扫整整一行。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §04 Build them ================= */}
      <Section
        id="build"
        index="04"
        title={{
          en: "Build it: adjacency list, BFS, DFS",
          zh: "手写实现:建图 + BFS + DFS 模板",
        }}
        desc={{
          en: "The animations from §03, written as code you can run. These templates are the skeleton of most graph problems.",
          zh: "把 §03 的动画翻译成能直接跑的代码。这几段模板背下来,一大半图论题就有了骨架",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                A problem usually hands you an <strong>edge list</strong>, for
                example <code>edges = [[0,1],[0,2],...]</code>. The first step is
                almost always to turn it into an{" "}
                <strong>adjacency list</strong>, and then BFS or DFS follows the
                template. Start with building the graph and running BFS. The
                highlighted lines are the ones that matter: a vertex is marked{" "}
                <b>at the moment it enters the queue</b>.
              </p>
            }
            zh={
              <p>
                题目通常给你的是<strong>边列表</strong>(比如{" "}
                <code>edges = [[0,1],[0,2],...]</code>),第一步几乎总是把它转成
                <strong>邻接表</strong>,然后 BFS / DFS 直接套模板。
                先看「建图 + BFS」。高亮的两行是关键:顶点是
                <b>在入队的那一刻</b>被标记的。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="graph_build_bfs"
          java={{
            code: {
              en: `import java.util.*;

// Build an adjacency list for an undirected graph from an edge list
List<List<Integer>> buildGraph(int n, int[][] edges) {
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    for (int[] e : edges) {
        g.get(e[0]).add(e[1]);
        g.get(e[1]).add(e[0]);   // undirected: both ways. For a directed graph, delete this line
    }
    return g;
}

// BFS: start at start and visit the graph layer by layer
void bfs(List<List<Integer>> g, int start) {
    int n = g.size();
    boolean[] visited = new boolean[n];
    Queue<Integer> q = new ArrayDeque<>();
    visited[start] = true;       // mark it when it enters the queue, not when it leaves
    q.offer(start);
    while (!q.isEmpty()) {
        int u = q.poll();        // leaving the queue = visiting
        System.out.println(u);
        for (int v : g.get(u)) {
            if (!visited[v]) {
                visited[v] = true;   // mark before enqueueing, so it is queued only once
                q.offer(v);
            }
        }
    }
}`,
              zh: `import java.util.*;

// 用「边列表」建无向图的邻接表:List<List<Integer>>
List<List<Integer>> buildGraph(int n, int[][] edges) {
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    for (int[] e : edges) {
        g.get(e[0]).add(e[1]);
        g.get(e[1]).add(e[0]);   // 无向图两个方向都加;有向图删掉这一行
    }
    return g;
}

// BFS:从 start 出发,按层访问整张图
void bfs(List<List<Integer>> g, int start) {
    int n = g.size();
    boolean[] visited = new boolean[n];
    Queue<Integer> q = new ArrayDeque<>();
    visited[start] = true;       // 入队时标记,不是出队时标记
    q.offer(start);
    while (!q.isEmpty()) {
        int u = q.poll();        // 出队 = 访问
        System.out.println(u);
        for (int v : g.get(u)) {
            if (!visited[v]) {
                visited[v] = true;   // 入队前先标记,同一个点只会入队一次
                q.offer(v);
            }
        }
    }
}`,
            },
            hl: [19, 26],
            note: {
              en: (
                <>
                  <b>Common mistakes:</b> use <code>ArrayDeque</code> as the
                  queue, not <code>LinkedList</code> (slower). When the vertices
                  are 0..n-1, a <code>boolean[]</code> is much faster than a{" "}
                  <code>HashSet</code>.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>用 <code>ArrayDeque</code> 当队列,别用{" "}
                  <code>LinkedList</code>(更慢)。顶点是 0..n-1 时,
                  <code>boolean[]</code> 比 <code>HashSet</code> 快得多。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `from collections import deque, defaultdict

# Build an adjacency list for an undirected graph from an edge list
def build_graph(n, edges):
    g = defaultdict(list)
    for a, b in edges:
        g[a].append(b)
        g[b].append(a)     # undirected: both ways. For a directed graph, delete this line
    return g

# BFS: start at start and visit the graph layer by layer
def bfs(g, start, n):
    visited = [False] * n
    q = deque([start])
    visited[start] = True      # mark it when it enters the queue, not when it leaves
    while q:
        u = q.popleft()        # leaving the queue = visiting
        print(u)
        for v in g[u]:
            if not visited[v]:
                visited[v] = True   # mark before enqueueing, so it is queued only once
                q.append(v)`,
              zh: `from collections import deque, defaultdict

# 用「边列表」建无向图的邻接表:defaultdict(list)
def build_graph(n, edges):
    g = defaultdict(list)
    for a, b in edges:
        g[a].append(b)
        g[b].append(a)     # 无向图两个方向都加;有向图删掉这一行
    return g

# BFS:从 start 出发,按层访问整张图
def bfs(g, start, n):
    visited = [False] * n
    q = deque([start])
    visited[start] = True      # 入队时标记,不是出队时标记
    while q:
        u = q.popleft()        # 出队 = 访问
        print(u)
        for v in g[u]:
            if not visited[v]:
                visited[v] = True   # 入队前先标记,同一个点只会入队一次
                q.append(v)`,
            },
            hl: [15, 21],
            note: {
              en: (
                <>
                  <b>Common mistake:</b> always use{" "}
                  <code>collections.deque</code> for the queue, because its{" "}
                  <code>popleft()</code> is O(1). Never use{" "}
                  <code>list.pop(0)</code>: it is O(n) and turns the whole BFS
                  into O(V · E).
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>队列一定用 <code>collections.deque</code>,
                  它的 <code>popleft()</code> 是 O(1);千万别用{" "}
                  <code>list.pop(0)</code>(O(n),会把整个 BFS 拖成 O(V · E))。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// Build an adjacency list for an undirected graph from an edge list
function buildGraph(n, edges) {
  const g = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    g[a].push(b);
    g[b].push(a);     // undirected: both ways. For a directed graph, delete this line
  }
  return g;
}

// BFS: start at start and visit the graph layer by layer
function bfs(g, start, n) {
  const visited = new Array(n).fill(false);
  const q = [start];           // an array used as the queue
  visited[start] = true;       // mark it when it enters the queue, not when it leaves
  let head = 0;                // a read index instead of shift(), so dequeue stays O(1)
  while (head < q.length) {
    const u = q[head++];       // leaving the queue = visiting
    console.log(u);
    for (const v of g[u]) {
      if (!visited[v]) {
        visited[v] = true;     // mark before enqueueing, so it is queued only once
        q.push(v);
      }
    }
  }
}`,
              zh: `// 用「边列表」建无向图的邻接表:数组套数组
function buildGraph(n, edges) {
  const g = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    g[a].push(b);
    g[b].push(a);     // 无向图两个方向都加;有向图删掉这一行
  }
  return g;
}

// BFS:从 start 出发,按层访问整张图
function bfs(g, start, n) {
  const visited = new Array(n).fill(false);
  const q = [start];           // 用数组模拟队列
  visited[start] = true;       // 入队时标记,不是出队时标记
  let head = 0;                // 用读指针代替 shift(),出队保持 O(1)
  while (head < q.length) {
    const u = q[head++];       // 出队 = 访问
    console.log(u);
    for (const v of g[u]) {
      if (!visited[v]) {
        visited[v] = true;     // 入队前先标记,同一个点只会入队一次
        q.push(v);
      }
    }
  }
}`,
            },
            hl: [15, 22],
            note: {
              en: (
                <>
                  <b>Common mistake:</b> <code>shift()</code> on a JS array is
                  O(n), because it moves every remaining element. For large
                  inputs, keep a read index <code>head</code> that only
                  increases; dequeue is then O(1).
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>JS 数组的 <code>shift()</code> 是 O(n)
                  搬家。数据量大时用「读指针 <code>head</code> 只增不减」的写法,
                  出队 O(1)。
                </>
              ),
            },
          }}
        />

        <div className="prose" style={{ marginTop: 24 }}>
          <T
            en={
              <p>
                DFS has two forms: <strong>recursive</strong>, which is short and
                direct but can exhaust the call stack on a deep graph, and{" "}
                <strong>iterative</strong>, which uses an explicit stack and is
                safe. Learn both.
              </p>
            }
            zh={
              <p>
                DFS 有两种写法:<strong>递归</strong>(短、直观,
                但图一深就可能爆调用栈)和<strong>迭代</strong>
                (用显式栈,安全)。两个都要会:
              </p>
            }
          />
        </div>
        <CodeTabs
          title="graph_dfs"
          java={{
            code: {
              en: `// Recursive DFS: follow one path as far as it goes
void dfs(List<List<Integer>> g, int u, boolean[] visited) {
    visited[u] = true;           // mark on entry
    System.out.println(u);
    for (int v : g.get(u)) {
        if (!visited[v]) dfs(g, v, visited);   // go deeper into an unvisited neighbor
    }
}

// Iterative DFS: an explicit stack replaces recursion, so a deep graph is safe
void dfsIter(List<List<Integer>> g, int start) {
    boolean[] visited = new boolean[g.size()];
    Deque<Integer> stack = new ArrayDeque<>();
    stack.push(start);
    while (!stack.isEmpty()) {
        int u = stack.pop();
        if (visited[u]) continue;   // check on pop: one vertex can be pushed several times
        visited[u] = true;
        System.out.println(u);
        for (int v : g.get(u)) {
            if (!visited[v]) stack.push(v);
        }
    }
}`,
              zh: `// DFS 递归:沿一条路走到走不通
void dfs(List<List<Integer>> g, int u, boolean[] visited) {
    visited[u] = true;           // 进门先标记
    System.out.println(u);
    for (int v : g.get(u)) {
        if (!visited[v]) dfs(g, v, visited);   // 邻居没访问过就深入
    }
}

// DFS 迭代:用显式栈代替递归,深图不会爆调用栈
void dfsIter(List<List<Integer>> g, int start) {
    boolean[] visited = new boolean[g.size()];
    Deque<Integer> stack = new ArrayDeque<>();
    stack.push(start);
    while (!stack.isEmpty()) {
        int u = stack.pop();
        if (visited[u]) continue;   // 出栈时判重:同一个点可能被压入多次
        visited[u] = true;
        System.out.println(u);
        for (int v : g.get(u)) {
            if (!visited[v]) stack.push(v);
        }
    }
}`,
            },
            note: {
              en: (
                <>
                  The two versions can visit vertices in a different order,
                  because a stack returns the most recently pushed neighbor
                  first. Both are valid depth-first traversals. Recursion depth
                  can reach V, so for a large graph (say 10⁵ vertices in one
                  chain) use the iterative version to avoid a stack overflow.
                </>
              ),
              zh: (
                <>
                  两版的访问顺序可能不同,因为栈先弹出最后压入的邻居;
                  但都是合法的深度优先遍历。递归深度可能达到 V,V 很大时
                  (如 10⁵ 个点连成一条链)要用迭代版防止栈溢出。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `import sys
sys.setrecursionlimit(300000)   # raise Python's recursion limit before recursing on a deep graph

# Recursive DFS: follow one path as far as it goes
def dfs(g, u, visited):
    visited[u] = True            # mark on entry
    print(u)
    for v in g[u]:
        if not visited[v]:
            dfs(g, v, visited)   # go deeper into an unvisited neighbor

# Iterative DFS: an explicit stack replaces recursion
def dfs_iter(g, start, n):
    visited = [False] * n
    stack = [start]
    while stack:
        u = stack.pop()
        if visited[u]:
            continue             # check on pop: one vertex can be pushed several times
        visited[u] = True
        print(u)
        for v in g[u]:
            if not visited[v]:
                stack.append(v)`,
              zh: `import sys
sys.setrecursionlimit(300000)   # 深图递归前,先调高 Python 的递归上限

# DFS 递归:沿一条路走到走不通
def dfs(g, u, visited):
    visited[u] = True            # 进门先标记
    print(u)
    for v in g[u]:
        if not visited[v]:
            dfs(g, v, visited)   # 邻居没访问过就深入

# DFS 迭代:用显式栈代替递归
def dfs_iter(g, start, n):
    visited = [False] * n
    stack = [start]
    while stack:
        u = stack.pop()
        if visited[u]:
            continue             # 出栈时判重:同一个点可能被压入多次
        visited[u] = True
        print(u)
        for v in g[u]:
            if not visited[v]:
                stack.append(v)`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> Python&rsquo;s default recursion limit
                  is about 1000, so a deep graph raises{" "}
                  <code>RecursionError</code>. Either raise it with{" "}
                  <code>setrecursionlimit</code>, or write the iterative version.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>Python 默认递归上限约 1000,图一深就{" "}
                  <code>RecursionError</code>。要么用{" "}
                  <code>setrecursionlimit</code> 调高,要么直接写迭代版。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// Recursive DFS: follow one path as far as it goes
function dfs(g, u, visited) {
  visited[u] = true;             // mark on entry
  console.log(u);
  for (const v of g[u]) {
    if (!visited[v]) dfs(g, v, visited);   // go deeper into an unvisited neighbor
  }
}

// Iterative DFS: an explicit stack replaces recursion
function dfsIter(g, start, n) {
  const visited = new Array(n).fill(false);
  const stack = [start];
  while (stack.length) {
    const u = stack.pop();
    if (visited[u]) continue;    // check on pop: one vertex can be pushed several times
    visited[u] = true;
    console.log(u);
    for (const v of g[u]) {
      if (!visited[v]) stack.push(v);
    }
  }
}`,
              zh: `// DFS 递归:沿一条路走到走不通
function dfs(g, u, visited) {
  visited[u] = true;             // 进门先标记
  console.log(u);
  for (const v of g[u]) {
    if (!visited[v]) dfs(g, v, visited);   // 邻居没访问过就深入
  }
}

// DFS 迭代:用显式栈代替递归
function dfsIter(g, start, n) {
  const visited = new Array(n).fill(false);
  const stack = [start];
  while (stack.length) {
    const u = stack.pop();
    if (visited[u]) continue;    // 出栈时判重:同一个点可能被压入多次
    visited[u] = true;
    console.log(u);
    for (const v of g[u]) {
      if (!visited[v]) stack.push(v);
    }
  }
}`,
            },
            note: {
              en: (
                <>
                  A JS engine call stack holds roughly ten thousand frames, so a
                  deep recursion also fails with{" "}
                  <code>Maximum call stack size exceeded</code>. For contests or
                  large inputs, prefer the iterative version.
                </>
              ),
              zh: (
                <>
                  JS 引擎的调用栈也就一万多层,深递归同样会报{" "}
                  <code>Maximum call stack size exceeded</code>。
                  竞赛或大数据量优先迭代版。
                </>
              ),
            },
          }}
        />

        <div className="prose" style={{ marginTop: 24 }}>
          <T
            en={
              <p>
                The last piece: a <strong>grid as a graph</strong>. A matrix
                (chapter 1) is already a graph. Each cell <code>(r, c)</code> is
                a vertex, and it is joined by an edge to the cell above, below,
                left, and right. That is why flood fill and shortest path in a
                maze are graph problems. You do not build an adjacency list for
                it; a <strong>direction array</strong> covers the four neighbors
                in one loop. This is the standard grid template:
              </p>
            }
            zh={
              <p>
                最后一块拼图:<strong>网格型图</strong>。矩阵(第 1 章)
                本身就是一张图 —— 每个格子 <code>(r, c)</code> 是顶点,
                它和上下左右四个格子之间各有一条边。
                这就是为什么「洪水填充」和「迷宫最短路」属于图论题。
                遍历时不用真的建邻接表,用一个<strong>方向数组</strong>
                就能在一个循环里走完四个方向,这是网格题的标准模板:
              </p>
            }
          />
        </div>
        <CodeTabs
          title="grid_dirs"
          java={{
            code: {
              en: `// A grid is a graph: cell (r,c) is a vertex, and touching cells are joined by an edge
int[][] DIRS = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};   // up down left right

void gridDfs(int[][] grid, int r, int c) {
    int R = grid.length, C = grid[0].length;
    // out of bounds, or not the value we are looking for -> return at once
    if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] != 1) return;
    grid[r][c] = 2;                 // mark as visited by writing another value
    for (int[] d : DIRS) {
        gridDfs(grid, r + d[0], c + d[1]);   // one loop covers all four directions
    }
}`,
              zh: `// 网格即图:格子 (r,c) 是点,上下左右相邻的格子之间有边
int[][] DIRS = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};   // 上 下 左 右

void gridDfs(int[][] grid, int r, int c) {
    int R = grid.length, C = grid[0].length;
    // 越界,或不是要找的值 → 立即返回
    if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] != 1) return;
    grid[r][c] = 2;                 // 改成别的值,当作已访问标记
    for (int[] d : DIRS) {
        gridDfs(grid, r + d[0], c + d[1]);   // 一个循环走完四个方向
    }
}`,
            },
          }}
          python={{
            code: {
              en: `# A grid is a graph: cell (r,c) is a vertex, and touching cells are joined by an edge
DIRS = [(-1, 0), (1, 0), (0, -1), (0, 1)]   # up down left right

def grid_dfs(grid, r, c):
    R, C = len(grid), len(grid[0])
    # out of bounds, or not the value we are looking for -> return at once
    if not (0 <= r < R and 0 <= c < C) or grid[r][c] != 1:
        return
    grid[r][c] = 2                 # mark as visited by writing another value
    for dr, dc in DIRS:
        grid_dfs(grid, r + dr, c + dc)   # one loop covers all four directions`,
              zh: `# 网格即图:格子 (r,c) 是点,上下左右相邻的格子之间有边
DIRS = [(-1, 0), (1, 0), (0, -1), (0, 1)]   # 上 下 左 右

def grid_dfs(grid, r, c):
    R, C = len(grid), len(grid[0])
    # 越界,或不是要找的值 → 立即返回
    if not (0 <= r < R and 0 <= c < C) or grid[r][c] != 1:
        return
    grid[r][c] = 2                 # 改成别的值,当作已访问标记
    for dr, dc in DIRS:
        grid_dfs(grid, r + dr, c + dc)   # 一个循环走完四个方向`,
            },
          }}
          js={{
            code: {
              en: `// A grid is a graph: cell (r,c) is a vertex, and touching cells are joined by an edge
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];   // up down left right

function gridDfs(grid, r, c) {
  const R = grid.length, C = grid[0].length;
  // out of bounds, or not the value we are looking for -> return at once
  if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] !== 1) return;
  grid[r][c] = 2;                  // mark as visited by writing another value
  for (const [dr, dc] of DIRS) {
    gridDfs(grid, r + dr, c + dc);        // one loop covers all four directions
  }
}`,
              zh: `// 网格即图:格子 (r,c) 是点,上下左右相邻的格子之间有边
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];   // 上 下 左 右

function gridDfs(grid, r, c) {
  const R = grid.length, C = grid[0].length;
  // 越界,或不是要找的值 → 立即返回
  if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] !== 1) return;
  grid[r][c] = 2;                  // 改成别的值,当作已访问标记
  for (const [dr, dc] of DIRS) {
    gridDfs(grid, r + dr, c + dc);        // 一个循环走完四个方向
  }
}`,
            },
          }}
        />
        <Callout
          tone="idea"
          title={{
            en: "Two variations on the direction array",
            zh: "方向数组的两个小升级",
          }}
        >
          <T
            en={
              <p>
                (1) <b>Eight directions</b>, including the diagonals: write 8
                offsets in <code>dirs</code>. (2) Writing a new value into the
                grid (1 becomes 2, or 0) removes the need for a separate visited
                matrix, but it destroys the input. In an interview, ask first
                whether you are allowed to modify the given array. Grid BFS works
                the same way: replace the stack with a queue.
              </p>
            }
            zh={
              <p>
                ① <b>八方向</b>(含对角线):<code>dirs</code> 写 8 个偏移即可。
                ② 直接改原网格的值当 visited(如把 1 改成 2 或 0),
                省掉一个 visited 矩阵 —— 但会破坏输入,
                面试时记得先问一句「可以修改原数组吗」。网格 BFS 同理,
                把栈换成队列即可。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §05 Three languages ================= */}
      <Section
        id="langs"
        index="05"
        title={{
          en: "Three languages: no built-in graph type, but a standard way to write one",
          zh: "三语言对照:图没有内置类型,但有习惯写法",
        }}
        desc={{
          en: "No language ships a Graph class. Everyone builds an adjacency list from an array or a hash map, with different containers.",
          zh: "没有哪个语言自带 Graph 类,大家都用「数组 / 哈希表 + 数组」自己实现邻接表 —— 但各有顺手的招",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                Unlike arrays and hash maps, none of the three languages has a{" "}
                <strong>ready-made graph type</strong>. But the way an adjacency
                list is written is nearly the same everywhere; only the container
                differs. Remember each language&rsquo;s{" "}
                <strong>way of building the list</strong> and{" "}
                <strong>what it uses for visited</strong>, and any graph problem
                becomes routine.
              </p>
            }
            zh={
              <p>
                和数组、哈希表不同,三种语言都
                <strong>没有开箱即用的图类型</strong>。
                但「用邻接表表示图」的写法高度统一,只是各语言的容器不同。
                记住每种语言的<strong>建表惯用法</strong>和
                <strong>visited 用什么</strong>,上手任何图题都有章可循:
              </p>
            }
          />
        </div>
        <CodeTabs
          title="graph_repr_by_lang"
          java={{
            code: {
              en: `// —— Java: two common forms ——
// Form 1: List<List<Integer>> (vertices are the integers 0..n-1; the most common case)
List<List<Integer>> g = new ArrayList<>();
for (int i = 0; i < n; i++) g.add(new ArrayList<>());
g.get(0).add(1);

// Form 2: Map<T, List<T>> (vertices of any type, such as strings)
Map<String, List<String>> g2 = new HashMap<>();
g2.computeIfAbsent("A", k -> new ArrayList<>()).add("B");

// visited: boolean[] for integer vertices (fastest); HashSet for object vertices
boolean[] visited = new boolean[n];
Set<String> seen = new HashSet<>();`,
              zh: `// —— Java:两种常见写法 ——
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
            },
            note: {
              en: (
                <>
                  <code>computeIfAbsent</code> is the usual way to build a{" "}
                  <code>Map</code>-based adjacency list: if the key is missing it
                  creates the empty list first, then adds, in one line.
                </>
              ),
              zh: (
                <>
                  <code>computeIfAbsent</code> 是建 <code>Map</code>{" "}
                  型邻接表的常用方法:key 不存在就先建空表再 add,一行搞定。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `# —— Python: defaultdict needs the least code ——
from collections import defaultdict
g = defaultdict(list)        # reading a missing key creates an empty list automatically
g[0].append(1)               # no need to check whether 0 exists first

# Vertices can be any hashable object
g2 = defaultdict(list)
g2["A"].append("B")

# visited: a set for small graphs or object vertices; [False]*n when vertices are 0..n-1
visited = set()
visited.add(0)`,
              zh: `# —— Python:defaultdict 最省心 ——
from collections import defaultdict
g = defaultdict(list)        # 访问不存在的 key 会自动给一个空列表
g[0].append(1)               # 不用手动判断 0 是否已存在

# 顶点是任意可哈希对象也一样
g2 = defaultdict(list)
g2["A"].append("B")

# visited:小图或对象顶点用 set;顶点是 0..n-1 时用 [False]*n
visited = set()
visited.add(0)`,
            },
            note: {
              en: (
                <>
                  <code>defaultdict(list)</code> is the standard way to build a
                  graph in Python: it removes the &ldquo;initialize the key
                  first&rdquo; boilerplate. For a weighted graph, store{" "}
                  <code>(neighbor, weight)</code> tuples in the same structure.
                </>
              ),
              zh: (
                <>
                  <code>defaultdict(list)</code> 是 Python 建图的标配 ——
                  省掉「key 不存在先初始化」的样板代码。带权图就在同样的结构里存{" "}
                  <code>(邻居, 权重)</code> 元组。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// —— JavaScript: an array of arrays, or a Map ——
// Vertices are 0..n-1: an array of arrays (most common)
const g = Array.from({ length: n }, () => []);
g[0].push(1);

// Vertices are strings or other keys: a Map from key to array
const g2 = new Map();
if (!g2.has("A")) g2.set("A", []);
g2.get("A").push("B");

// visited: a fixed-length array for integer vertices; a Set for object or string vertices
const visited = new Array(n).fill(false);
const seen = new Set();`,
              zh: `// —— JavaScript:数组套数组 或 Map ——
// 顶点是 0..n-1:数组套数组(最常用)
const g = Array.from({ length: n }, () => []);
g[0].push(1);

// 顶点是字符串等:用 Map<key, array>
const g2 = new Map();
if (!g2.has("A")) g2.set("A", []);
g2.get("A").push("B");

// visited:整数顶点用定长数组;对象或字符串顶点用 Set
const visited = new Array(n).fill(false);
const seen = new Set();`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> never build the array of arrays with{" "}
                  <code>new Array(n).fill([])</code> — all n slots would hold{" "}
                  <b>the same</b> array. Use{" "}
                  <code>Array.from({ "{ length: n }" }, () =&gt; [])</code> so
                  each slot gets its own.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>建数组套数组千万别写{" "}
                  <code>new Array(n).fill([])</code> —— n 个格子会共享
                  <b>同一个</b>数组!必须用{" "}
                  <code>Array.from({ "{ length: n }" }, () =&gt; [])</code>{" "}
                  各建各的。
                </>
              ),
            },
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Need" zh="需求" />
                </th>
                <th>Java</th>
                <th>Python</th>
                <th>JavaScript</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <T
                    en="Adjacency list (integer vertices)"
                    zh="邻接表(整数顶点)"
                  />
                </td>
                <td>
                  <code>List&lt;List&lt;Integer&gt;&gt;</code>
                </td>
                <td>
                  <code>defaultdict(list)</code>
                </td>
                <td>
                  <code>Array.from(..., () =&gt; [])</code>
                </td>
              </tr>
              <tr>
                <td>
                  <T
                    en="Adjacency list (any vertex type)"
                    zh="邻接表(任意顶点)"
                  />
                </td>
                <td>
                  <code>Map&lt;T, List&lt;T&gt;&gt;</code>
                </td>
                <td>
                  <code>defaultdict(list)</code>
                </td>
                <td>
                  <code>Map&lt;T, T[]&gt;</code>
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Queue (BFS)" zh="队列(BFS)" />
                </td>
                <td>
                  <code>ArrayDeque</code>
                </td>
                <td>
                  <code>collections.deque</code>
                </td>
                <td>
                  <T
                    en="array plus a read index head"
                    zh="数组 + 读指针 head"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Stack (iterative DFS)" zh="栈(DFS 迭代)" />
                </td>
                <td>
                  <code>ArrayDeque</code>
                </td>
                <td>
                  <code>list</code> (append/pop)
                </td>
                <td>
                  <code>Array</code> (push/pop)
                </td>
              </tr>
              <tr>
                <td>
                  <T en="visited (integer vertices)" zh="visited(整数顶点)" />
                </td>
                <td>
                  <code>boolean[]</code>
                </td>
                <td>
                  <code>[False]*n</code>{" "}
                  <T en="or" zh="或" /> <code>set</code>
                </td>
                <td>
                  <code>new Array(n).fill(false)</code>
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Min-heap (Dijkstra)" zh="小根堆(Dijkstra)" />
                </td>
                <td>
                  <code>PriorityQueue</code>
                </td>
                <td>
                  <code>heapq</code>
                </td>
                <td>
                  <T
                    en="none built in; write one or use a library"
                    zh="无内置,手写 / 库"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "JavaScript has no built-in heap",
            zh: "JS 选手请注意:没有内置堆",
          }}
        >
          <T
            en={
              <p>
                This is the main gap when solving graph problems in JavaScript:{" "}
                <b>there is no priority queue or heap</b>. For Dijkstra you
                either write a binary heap yourself (chapter 9), or use the O(V²)
                version that scans for the smallest distance each round, which is
                fine on a small graph. If you interview in JavaScript, have a
                heap implementation ready.
              </p>
            }
            zh={
              <p>
                这是用 JS 刷图论最大的短板:<b>没有优先队列 / 堆</b>。
                做 Dijkstra 时,要么自己手写一个二叉堆(第 9 章教过),
                要么用「每轮线性扫最小」的 O(V²) 版本 —— 小图上完全够用。
                面试用 JS 时,提前把手写堆准备好。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §06 Three patterns ================= */}
      <Section
        id="topics"
        index="06"
        title={{
          en: "Three patterns: grids, topological order, shortest paths",
          zh: "三大专题精讲:网格 · 拓扑 · 最短路",
        }}
        desc={{
          en: "Graph problems are many, but the frequent ones fall into three groups. Each gets one classic problem, taken apart frame by frame.",
          zh: "图论题千千万,但高频套路就这三大类。每类配一道经典精讲,逐帧拆到底"
        }}
        badge={
          <span className="chip" data-tone="warn">
            <T en="★ Interview core" zh="★ 面试核心" />
          </span>
        }
      >
        {/* — Pattern 1: grids — */}
        <div className="sec-head" style={{ marginTop: 8 }}>
          <span className="sec-index">
            <T en="Pattern 1" zh="专题一" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="A grid is a graph" zh="网格也是图" />
          </h3>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                A large group of medium LeetCode problems is really{" "}
                <strong>DFS or BFS on a grid</strong>: number of islands, max
                area of island, surrounded regions, rotting oranges. They share
                one mapping:{" "}
                <strong>
                  each cell is a vertex, and cells that touch up, down, left, or
                  right are joined by an edge
                </strong>
                . Then you traverse. The main technique is called{" "}
                <strong>sinking</strong> or coloring: write a new value into a
                cell as you visit it, so the value doubles as the visited set and
                nothing is counted twice.
              </p>
            }
            zh={
              <p>
                一大批 LeetCode 中等题,本质都是「在网格上做 DFS / BFS」:
                岛屿数量、岛屿面积、被围绕的区域、腐烂的橘子……
                它们共用同一个映射:
                <strong>每个格子是一个顶点,上下左右相邻的格子之间有一条边</strong>
                ,然后遍历。核心技巧叫<strong>「淹没 / 染色」</strong> ——
                访问过的格子直接改值,既当 visited 又防重复计数。
              </p>
            }
          />
        </div>

        <div className="sec-head" style={{ marginTop: 28 }}>
          <span className="sec-index">
            <T en="Walkthrough A" zh="精讲 A" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 200 · Number of Islands" zh="LC 200 · 岛屿数量" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">
              MEDIUM
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>Problem:</b> given a grid of <code>&apos;1&apos;</code> (land)
                and <code>&apos;0&apos;</code> (water), count the islands. Land
                cells that touch up, down, left, or right belong to the same
                island.
                <b> Idea:</b> scan cell by cell. When you meet a{" "}
                <code>&apos;1&apos;</code> that has not been sunk, add 1 to the
                island count, then run DFS from there and turn every connected{" "}
                <code>&apos;1&apos;</code> into <code>&apos;0&apos;</code>. That
                way the same island is never counted again. In the animation,{" "}
                <b>green means sunk, already counted as part of some island</b>.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>给一个由 <code>&apos;1&apos;</code>(陆地)和{" "}
                <code>&apos;0&apos;</code>(水)组成的网格,数出有几座岛
                (上下左右相连的陆地算一座)。
                <b> 思路:</b>逐格扫描,一旦遇到没被淹过的{" "}
                <code>&apos;1&apos;</code>,岛屿数 +1,然后从这里 DFS,
                把整座岛的 <code>&apos;1&apos;</code> 全「淹成{" "}
                <code>&apos;0&apos;</code>」,同一座岛就不会被重复数。
                看动画,注意<b>绿色 = 已淹没(已计入某座岛)</b>。
              </p>
            }
          />
        </div>
        <GridDfsLab />
        <CodeTabs
          title="lc200_num_islands"
          java={{
            code: {
              en: `class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++)
            for (int c = 0; c < grid[0].length; c++)
                if (grid[r][c] == '1') {   // a new island
                    count++;
                    sink(grid, r, c);      // sink the whole island
                }
        return count;
    }
    // DFS: turn every '1' connected to (r,c) into '0'
    void sink(char[][] grid, int r, int c) {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length
                || grid[r][c] != '1') return;
        grid[r][c] = '0';                  // marking as visited = sinking
        sink(grid, r - 1, c);
        sink(grid, r + 1, c);
        sink(grid, r, c - 1);
        sink(grid, r, c + 1);
    }
}`,
              zh: `class Solution {
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
            },
            hl: [6, 7, 8],
          }}
          python={{
            code: {
              en: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        R, C = len(grid), len(grid[0])
        count = 0

        def sink(r, c):
            if not (0 <= r < R and 0 <= c < C) or grid[r][c] != '1':
                return
            grid[r][c] = '0'             # marking as visited = sinking
            sink(r - 1, c); sink(r + 1, c)
            sink(r, c - 1); sink(r, c + 1)

        for r in range(R):
            for c in range(C):
                if grid[r][c] == '1':    # a new island
                    count += 1
                    sink(r, c)           # sink the whole island
        return count`,
              zh: `class Solution:
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
            },
            hl: [15, 16, 17],
          }}
          js={{
            code: {
              en: `var numIslands = function (grid) {
  const R = grid.length, C = grid[0].length;
  let count = 0;
  const sink = (r, c) => {
    if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] !== '1') return;
    grid[r][c] = '0';                  // marking as visited = sinking
    sink(r - 1, c); sink(r + 1, c);
    sink(r, c - 1); sink(r, c + 1);
  };
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (grid[r][c] === '1') {        // a new island
        count++;
        sink(r, c);                    // sink the whole island
      }
  return count;
};`,
              zh: `var numIslands = function (grid) {
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
            },
            hl: [12, 13, 14],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and follow-up questions",
            zh: "复杂度 & 追问",
          }}
        >
          <T
            en={
              <p>
                Time is <b>O(rows x cols)</b>: each cell is entered at most once,
                because sinking turns it into 0. The space is the recursion
                stack, at worst O(rows x cols) when the whole grid is land.
                Common follow-ups: &ldquo;what if you may not modify the
                grid?&rdquo; (keep a separate visited matrix), &ldquo;what if the
                recursion overflows?&rdquo; (switch to BFS or iterative DFS), and
                &ldquo;what if you need the largest island area?&rdquo; (LC 695,
                let DFS return the number of cells it sank). Sinking is the
                template for every connected-component problem on a grid.
              </p>
            }
            zh={
              <p>
                时间 <b>O(行 x 列)</b>:每个格子最多被进入一次(淹过就变 0)。
                空间是递归栈,最坏 O(行 x 列)(整张图全是陆地时)。面试常见追问:
                「不能改原网格怎么办?」(另开 visited 矩阵)、
                「会爆栈怎么办?」(改 BFS 或迭代 DFS)、
                「要数最大岛面积?」(LC695,让 DFS 返回淹没的格子数)。
                淹没法是所有网格连通块题的模板。
              </p>
            }
          />
        </Callout>

        {/* — Pattern 2: topological sort — */}
        <div className="sec-head" style={{ marginTop: 40 }}>
          <span className="sec-index">
            <T en="Pattern 2" zh="专题二" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="Topological sort: ordering tasks that depend on each other"
              zh="拓扑排序:给有依赖的任务排队"
            />
          </h3>
        </div>
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Course planning, build dependencies, task scheduling — all of
                  these ask the same question:{" "}
                  <strong>
                    given a set of tasks with &ldquo;this must come before
                    that&rdquo; constraints, is there a valid order?
                  </strong>{" "}
                  That order is a{" "}
                  <strong>topological sort</strong>. It exists only for a{" "}
                  <strong>directed acyclic graph (DAG)</strong>. As soon as there
                  is a cycle — A depends on B and B depends on A — neither can go
                  first, and no order exists.
                </p>
                <p>
                  The most direct algorithm is{" "}
                  <strong>Kahn&rsquo;s algorithm</strong>, which works the way
                  course registration does:
                </p>
              </>
            }
            zh={
              <>
                <p>
                  排课表、编译依赖、任务调度…… 这类问题都在问同一件事:
                  <strong>
                    一堆任务互相有「谁必须在谁之前」的约束,能不能排出一个合法顺序?
                  </strong>
                  这个顺序就是<strong>拓扑排序(topological sort)</strong>。
                  它只对<strong>有向无环图(DAG)</strong>成立 —— 一旦有环
                  (A 依赖 B、B 又依赖 A),谁都没法先做,排不出来。
                </p>
                <p>
                  最直观的算法是 <strong>Kahn 入度法</strong>,
                  像现实里选课一样自然:
                </p>
              </>
            }
          />
        </div>
        <div className="grid-3" style={{ marginTop: 4 }}>
          <div className="card">
            <div className="card-kicker">STEP 1</div>
            <div className="card-title">
              <T en="Count in-degrees" zh="数入度" />
            </div>
            <p>
              <T
                en={
                  <>
                    The <b>in-degree</b> of a vertex is the number of arrows
                    pointing at it, that is, how many prerequisites it still has.
                  </>
                }
                zh={
                  <>
                    每个点的<b>入度</b> = 指向它的箭头数 = 它还有几门没修的前置课。
                  </>
                }
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">STEP 2</div>
            <div className="card-title">
              <T en="Enqueue in-degree 0" zh="入度 0 入队" />
            </div>
            <p>
              <T
                en={
                  <>
                    Every course with no prerequisite left (in-degree 0) can be
                    taken now, so put all of them in the queue.
                  </>
                }
                zh={<>没有前置课(入度 0)的课,现在就能上,统统入队。</>}
              />
            </p>
          </div>
          <div className="card">
            <div className="card-kicker">STEP 3</div>
            <div className="card-title">
              <T en="Dequeue, then decrease" zh="出队 + 减入度" />
            </div>
            <p>
              <T
                en={
                  <>
                    Dequeue a course (it is finished) and subtract 1 from the
                    in-degree of each course it points at. Any that reaches 0
                    enters the queue. Repeat until the queue is empty.
                  </>
                }
                zh={
                  <>
                    出队一门课(修完),它的后继课入度各减 1;减到 0 的又能入队。
                    循环到队空。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <div className="sec-head" style={{ marginTop: 28 }}>
          <span className="sec-index">
            <T en="Walkthrough B" zh="精讲 B" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 207 · Course Schedule" zh="LC 207 · 课程表" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">
              MEDIUM
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>Problem:</b> there are numCourses courses, and{" "}
                <code>prerequisites[i] = [a, b]</code> means you must take b
                before a. Decide whether you can finish all of them.
                <b> Idea:</b> this is asking whether the directed graph has a
                cycle. If a full topological sort completes, there is no cycle.
                Step through Kahn&rsquo;s algorithm below and watch the{" "}
                <b>in-degree</b> under each vertex fall to 0 as courses leave the
                queue.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>共 numCourses 门课,
                <code>prerequisites[i] = [a, b]</code> 表示「修 a 前必须先修 b」。
                判断能否修完所有课。
                <b> 思路:</b>这就是在问「这张有向图有没有环」——
                能跑完整个拓扑排序就无环。看 Kahn 逐帧:
                注意每个点下方的<b>入度</b>怎么随出队一路减到 0。
              </p>
            }
          />
        </div>
        <TopoLab />
        <CodeTabs
          title="lc207_course_schedule"
          java={{
            code: {
              en: `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> g = new ArrayList<>();
        int[] indeg = new int[numCourses];
        for (int i = 0; i < numCourses; i++) g.add(new ArrayList<>());
        for (int[] p : prerequisites) {   // p = [course, prerequisite]
            g.get(p[1]).add(p[0]);        // prerequisite -> course
            indeg[p[0]]++;                // the course gains one prerequisite
        }
        Queue<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < numCourses; i++)
            if (indeg[i] == 0) q.offer(i);   // in-degree 0 can be taken now
        int done = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            done++;                       // one more course finished
            for (int v : g.get(u))
                if (--indeg[v] == 0) q.offer(v);  // enqueue only when it reaches 0
        }
        return done == numCourses;        // all finished = no cycle
    }
}`,
              zh: `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> g = new ArrayList<>();
        int[] indeg = new int[numCourses];
        for (int i = 0; i < numCourses; i++) g.add(new ArrayList<>());
        for (int[] p : prerequisites) {   // p = [课, 先修课]
            g.get(p[1]).add(p[0]);        // 先修课 → 课
            indeg[p[0]]++;                // 这门课的入度 +1
        }
        Queue<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < numCourses; i++)
            if (indeg[i] == 0) q.offer(i);   // 入度 0 的现在就能上
        int done = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            done++;                       // 修完一门
            for (int v : g.get(u))
                if (--indeg[v] == 0) q.offer(v);  // 减到 0 才入队
        }
        return done == numCourses;        // 全修完 = 无环
    }
}`,
            },
            hl: [17, 18, 20],
          }}
          python={{
            code: {
              en: `from collections import deque

class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        g = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for course, pre in prerequisites:   # take pre before course
            g[pre].append(course)           # pre -> course
            indeg[course] += 1
        q = deque(i for i in range(numCourses) if indeg[i] == 0)
        done = 0
        while q:
            u = q.popleft()
            done += 1                       # one more course finished
            for v in g[u]:
                indeg[v] -= 1
                if indeg[v] == 0:           # enqueue only when it reaches 0
                    q.append(v)
        return done == numCourses           # all finished = no cycle`,
              zh: `from collections import deque

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
                if indeg[v] == 0:           # 减到 0 才入队
                    q.append(v)
        return done == numCourses           # 全修完 = 无环`,
            },
            hl: [15, 16, 17, 18, 19],
          }}
          js={{
            code: {
              en: `var canFinish = function (numCourses, prerequisites) {
  const g = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [course, pre] of prerequisites) {  // take pre before course
    g[pre].push(course);                         // pre -> course
    indeg[course]++;
  }
  const q = [];
  for (let i = 0; i < numCourses; i++)
    if (indeg[i] === 0) q.push(i);               // in-degree 0 can be taken now
  let head = 0, done = 0;
  while (head < q.length) {
    const u = q[head++];
    done++;                                       // one more course finished
    for (const v of g[u])
      if (--indeg[v] === 0) q.push(v);            // enqueue only when it reaches 0
  }
  return done === numCourses;                     // all finished = no cycle
};`,
              zh: `var canFinish = function (numCourses, prerequisites) {
  const g = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [course, pre] of prerequisites) {  // 修 course 前先修 pre
    g[pre].push(course);                         // pre → course
    indeg[course]++;
  }
  const q = [];
  for (let i = 0; i < numCourses; i++)
    if (indeg[i] === 0) q.push(i);               // 入度 0 的现在就能上
  let head = 0, done = 0;
  while (head < q.length) {
    const u = q[head++];
    done++;                                       // 修完一门
    for (const v of g[u])
      if (--indeg[v] === 0) q.push(v);            // 减到 0 才入队
  }
  return done === numCourses;                     // 全修完 = 无环
};`,
            },
            hl: [15, 16, 18],
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "Cycle detection: directed and undirected need different methods",
            zh: "判环:有向图和无向图的方法不同",
          }}
        >
          <T
            en={
              <p>
                For a <b>directed</b> graph there are two correct methods. (1){" "}
                <b>Topological sort</b>, as in this problem: if fewer vertices
                leave the queue than the graph holds, there is a cycle. (2){" "}
                <b>DFS with three states</b> — unvisited, on the current
                recursion stack, finished. Reaching a finished vertex is fine,
                because that path was already explored; reaching a vertex that is
                still on the current stack is a cycle. For an{" "}
                <b>undirected</b> graph, neither applies directly: use union-find,
                or run DFS while ignoring the edge you just came from, otherwise
                the traversal sees the parent again and reports a cycle that is
                not there. Follow-up: LC 210 asks for the{" "}
                <b>actual topological order</b>, which is just the dequeue order
                recorded as you go. Complexity{" "}
                <BigO o="n" label="O(V + E)" />.
              </p>
            }
            zh={
              <p>
                <b>有向图</b>判环有两种正解:①{" "}
                <b>拓扑排序</b>(本题),出队数少于总点数即有环;②{" "}
                <b>DFS 三状态标记</b>(未访问 / 正在当前递归栈中 / 已完成)——
                碰到「已完成」的点没问题,那条路已经探过了;
                碰到「仍在当前栈中」的点才是环。<b>无向图</b>不能直接套这两种:
                要用并查集,或者 DFS 时忽略「刚走过来的那条边」,
                否则会把父节点当成环。追问延伸:LC210 要输出
                <b>具体的拓扑序</b>(把出队顺序记下来就是)。复杂度{" "}
                <BigO o="n" label="O(V + E)" />。
              </p>
            }
          />
        </Callout>

        {/* — Pattern 3: shortest path — */}
        <div className="sec-head" style={{ marginTop: 40 }}>
          <span className="sec-index">
            <T en="Pattern 3" zh="专题三" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="Shortest paths: the cheapest way from A to B"
              zh="最短路径:从 A 到 B 最省多少"
            />
          </h3>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                Before choosing an algorithm, settle one question: do the edges
                carry <strong>weights</strong>? The answer decides the tool.
              </p>
            }
            zh={
              <p>
                挑算法前先分清一件事:边<strong>带不带权</strong>。
                这决定了用哪把武器:
              </p>
            }
          />
        </div>
        <div className="grid-2">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="Case 1 · unweighted graph" zh="情形一 · 无权图" />
            </div>
            <div className="card-title">
              <T en="BFS is already shortest" zh="BFS 天生最短" />
            </div>
            <p>
              <T
                en={
                  <>
                    When every edge costs the same, BFS spreads by layer, so{" "}
                    <b>
                      the layer at which a vertex is first reached is the fewest
                      number of steps to it
                    </b>
                    . No advanced algorithm is needed; a queue is enough. This is
                    the first choice for &ldquo;fewest steps&rdquo; and
                    &ldquo;fewest operations&rdquo; questions.
                  </>
                }
                zh={
                  <>
                    每条边代价都相同时,BFS 按层扩散,
                    <b>第一次到达某点的层数,就是到它的最少步数</b>。
                    不用任何高级算法,一个队列足矣。
                    「最少几步 / 最少操作次数」类题的首选。
                  </>
                }
              />
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T
                en="Case 2 · weighted graph, non-negative"
                zh="情形二 · 带权图(非负)"
              />
            </div>
            <div className="card-title">
              <T en="Dijkstra" zh="Dijkstra 贪心" />
            </div>
            <p>
              <T
                en={
                  <>
                    When edges carry different weights (distance, duration), BFS
                    no longer works: a path with fewer edges can have a larger
                    total. Use <b>Dijkstra</b>. A min-heap returns the vertex
                    that is currently nearest and not settled yet; you settle it,
                    then relax its neighbors. It needs{" "}
                    <b>every weight to be non-negative</b>, and it reuses the
                    heap from chapter 9.
                  </>
                }
                zh={
                  <>
                    边有不同权重(距离 / 耗时)时,BFS 失效:
                    走的边少不代表权之和小。改用 <b>Dijkstra</b>:
                    小根堆每次挑出「当前离起点最近、还没定案」的点,
                    定案后松弛它的邻居。前提是<b>所有边权非负</b>,
                    实现上呼应第 9 章的堆。
                  </>
                }
              />
            </p>
          </div>
        </div>

        <div className="prose" style={{ marginTop: 18 }}>
          <T
            en={
              <p>
                Now look at <strong>Dijkstra</strong> in detail. Its rule is:{" "}
                <strong>
                  among the vertices that are not settled, take the one with the
                  smallest dist; its shortest distance can be fixed right now
                </strong>
                . That holds because no weight is negative, so any longer detour
                only costs more and can never overtake. After settling a vertex,
                use it to <strong>relax</strong> its neighbors:{" "}
                <code>if dist[u] + w &lt; dist[v]: update dist[v]</code>. Step
                through the 5-vertex example and watch how each dist is lowered.
              </p>
            }
            zh={
              <p>
                重点讲 <strong>Dijkstra</strong>。它的规则是:
                <strong>
                  每次从「未定案的点」里挑 dist 最小的那个,
                  它的最短距离此刻就能拍板
                </strong>
                —— 因为边权非负,任何绕远路只会更贵,不可能反超。定案后,用它去
                <strong>松弛(relax)</strong>邻居:
                <code>if dist[u] + w &lt; dist[v]: 更新 dist[v]</code>。
                看 5 个点的完整演算,注意 dist 是怎么被一次次改小的。
              </p>
            }
          />
        </div>
        <DijkstraLab />

        <div className="sec-head" style={{ marginTop: 28 }}>
          <span className="sec-index">
            <T en="Walkthrough C" zh="精讲 C" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 743 · Network Delay Time" zh="LC 743 · 网络延迟时间" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">
              MEDIUM
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>Problem:</b> a signal is sent from node k.{" "}
                <code>times[i] = [u, v, w]</code> means the signal takes w time
                to travel from u to v. Find the time it takes to reach all n
                nodes, or -1 if some node is unreachable.
                <b> Idea:</b> this is a plain single-source shortest path. Run
                Dijkstra from k to get the shortest time to every node.{" "}
                <b>The answer is the largest of those times</b>, because the last
                node to receive the signal decides the total. If any node is
                still infinity, it is unreachable, so return -1.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>从节点 k 发信号,<code>times[i] = [u, v, w]</code>{" "}
                表示信号从 u 到 v 要 w 时间。求信号传遍所有 n 个节点最少需要多久
                (传不到返回 -1)。
                <b> 思路:</b>标准单源最短路 —— Dijkstra 求出 k
                到每个点的最短时间,<b>答案就是这些最短时间里的最大值</b>
                (最后一个收到信号的点决定总耗时);若有点仍是 ∞ 则不可达,
                返回 -1。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="lc743_network_delay"
          java={{
            code: {
              en: `class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        // weighted adjacency list: g[u] holds several [v, w]
        List<int[]>[] g = new List[n + 1];
        for (int i = 1; i <= n; i++) g[i] = new ArrayList<>();
        for (int[] t : times) g[t[0]].add(new int[]{t[1], t[2]});

        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;
        // the min-heap orders by dist; an element is [node, distance to it]
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
        pq.offer(new int[]{k, 0});
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int u = top[0], d = top[1];
            if (d > dist[u]) continue;        // an outdated entry, skip it
            for (int[] e : g[u]) {            // relax every outgoing edge of u
                int v = e[0], w = e[1];
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    pq.offer(new int[]{v, dist[v]});
                }
            }
        }
        int ans = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == Integer.MAX_VALUE) return -1;  // one node never receives it
            ans = Math.max(ans, dist[i]);     // take the slowest node
        }
        return ans;
    }
}`,
              zh: `class Solution {
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
            },
            hl: [17, 18, 19, 20, 21, 22, 23],
            note: {
              en: (
                <>
                  <code>if (d &gt; dist[u]) continue;</code> matters. The heap
                  can still hold an older, larger distance for the same node.
                  When that entry comes out and is larger than the current dist,
                  it is outdated and is skipped.
                </>
              ),
              zh: (
                <>
                  <code>if (d &gt; dist[u]) continue;</code> 这句很关键:
                  堆里可能残留同一个点的旧(更大)距离,
                  弹出时发现比当前 dist 还大,就是过期记录,直接跳过。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `import heapq

class Solution:
    def networkDelayTime(self, times: list[list[int]], n: int, k: int) -> int:
        g = [[] for _ in range(n + 1)]
        for u, v, w in times:
            g[u].append((v, w))             # weighted adjacency list

        dist = [float('inf')] * (n + 1)
        dist[k] = 0
        pq = [(0, k)]                        # (distance, node): the heap orders by the first item
        while pq:
            d, u = heapq.heappop(pq)
            if d > dist[u]:
                continue                     # an outdated entry, skip it
            for v, w in g[u]:                # relax every outgoing edge of u
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
                    heapq.heappush(pq, (dist[v], v))

        ans = max(dist[1:])
        return ans if ans < float('inf') else -1`,
              zh: `import heapq

class Solution:
    def networkDelayTime(self, times: list[list[int]], n: int, k: int) -> int:
        g = [[] for _ in range(n + 1)]
        for u, v, w in times:
            g[u].append((v, w))             # 带权邻接表

        dist = [float('inf')] * (n + 1)
        dist[k] = 0
        pq = [(0, k)]                        # (距离, 节点):堆按第一维排序
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
            },
            hl: [14, 15, 16, 17, 18, 19],
            note: {
              en: (
                <>
                  Python&rsquo;s <code>heapq</code> is a min-heap, so putting the
                  distance first in the tuple makes it pop in distance order.{" "}
                  <code>max(dist[1:])</code> at the end skips index 0, because
                  the nodes are numbered from 1.
                </>
              ),
              zh: (
                <>
                  Python 的 <code>heapq</code> 是小根堆,
                  把元组第一维放距离就会按距离出堆。最后的{" "}
                  <code>max(dist[1:])</code> 跳过下标 0(节点从 1 开始编号)。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// JS has no built-in heap. This is the O(V²) version that scans for the minimum; the idea is identical
var networkDelayTime = function (times, n, k) {
  const g = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) g[u].push([v, w]);

  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const done = new Array(n + 1).fill(false);
  for (let it = 0; it < n; it++) {
    // pick the unsettled vertex with the smallest dist (with a heap this is a pop, O((V+E) log V) overall)
    let u = -1;
    for (let i = 1; i <= n; i++)
      if (!done[i] && dist[i] !== Infinity && (u === -1 || dist[i] < dist[u])) u = i;
    if (u === -1) break;
    done[u] = true;
    for (const [v, w] of g[u])              // relax every outgoing edge of u
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
  }
  let ans = 0;
  for (let i = 1; i <= n; i++) {
    if (dist[i] === Infinity) return -1;    // one node never receives it
    ans = Math.max(ans, dist[i]);
  }
  return ans;
};`,
              zh: `// JS 无内置堆,这里用「线性找最小」的 O(V²) 版,思路完全一致
var networkDelayTime = function (times, n, k) {
  const g = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) g[u].push([v, w]);

  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const done = new Array(n + 1).fill(false);
  for (let it = 0; it < n; it++) {
    // 选未定案、dist 最小的点(有堆时换成堆弹出,整体 O((V+E) log V))
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
            },
            hl: [11, 12, 13, 14, 15, 16, 17],
            note: {
              en: (
                <>
                  For the standard{" "}
                  <BigO o="nlogn" label="O((V + E) log V)" /> version in
                  JavaScript you have to write a binary heap yourself (chapter
                  9). The O(V²) version here is fast enough for the input sizes
                  in LC 743.
                </>
              ),
              zh: (
                <>
                  想要正统{" "}
                  <BigO o="nlogn" label="O((V + E) log V)" /> 的 JS 版,
                  得自己手写二叉堆(第 9 章)。这里的 O(V²) 版在 LC743
                  的数据规模下足够。
                </>
              ),
            },
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "Three questions people ask about Dijkstra",
            zh: "Dijkstra 的三个常见追问",
          }}
        >
          <T
            en={
              <p>
                (1) <b>Why a min-heap?</b> So that taking the nearest unsettled
                vertex costs O(log V) instead of a linear scan. (2){" "}
                <b>Why do negative weights break it?</b> Dijkstra fixes a
                vertex&rsquo;s distance the moment it leaves the heap and never
                revisits that decision. That is only sound when no weight is
                negative, because a detour can then only cost more. With a
                negative edge, a path found later can be cheaper, so a vertex
                gets settled too early and the answer is wrong. Use{" "}
                <b>Bellman-Ford</b> instead, at{" "}
                <BigO o="n2" label="O(V · E)" />; it also detects a negative
                cycle. (3) <b>What is the complexity?</b> With a binary heap it
                is <BigO o="nlogn" label="O((V + E) log V)" />, which is often
                written O(E log V) when the graph is connected and E is at least
                V - 1.
              </p>
            }
            zh={
              <p>
                ① <b>为什么用小根堆?</b>为了每次 O(log V)
                地取出「当前最近的未定案点」,不用线性扫。②{" "}
                <b>为什么怕负权?</b>Dijkstra 在一个点弹出堆的那一刻就把它的距离
                定死、永不回头,而这只在边权非负时成立
                (绕路只会更贵)。有负边时,后来才发现的路径可能更便宜,
                某个点会被过早定案,答案就错了。这时改用 <b>Bellman-Ford</b>,
                复杂度 <BigO o="n2" label="O(V · E)" />,它还能判负环。③{" "}
                <b>复杂度?</b>用二叉堆是{" "}
                <BigO o="nlogn" label="O((V + E) log V)" />;
                图连通、E ≥ V - 1 时常简写作 O(E log V)。
              </p>
            }
          />
        </Callout>
        <Callout
          tone="warn"
          title={{
            en: "Do not confuse BFS with Dijkstra",
            zh: "别把 BFS 和 Dijkstra 记混",
          }}
        >
          <T
            en={
              <p>
                For a shortest path in an unweighted graph, or one where all
                weights are equal, <b>do not reach for Dijkstra</b> — BFS is
                simpler and faster. Dijkstra is the upgrade you need only when
                the weights differ and are non-negative. When a problem says
                &ldquo;fewest steps&rdquo; or &ldquo;fewest operations&rdquo;,
                think BFS first. When it says &ldquo;shortest distance&rdquo; or
                &ldquo;smallest cost&rdquo; with varying edge weights, think
                Dijkstra.
              </p>
            }
            zh={
              <p>
                无权图(或所有边权相同)求最短路,<b>千万别上 Dijkstra</b> ——
                直接 BFS 更简单更快。Dijkstra 是「边权不同且非负」时才需要的升级款。
                看到「最少步数 / 最少操作次数」优先想 BFS;
                看到「最短距离 / 最小花费 + 边权不一」才想 Dijkstra。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §07 Problem set ================= */}
      <Section
        id="problems"
        index="07"
        title={{
          en: "Problem set: 9 graph problems",
          zh: "高频题单:图 9 题",
        }}
        desc={{
          en: "Grid DFS/BFS, multi-source BFS, topological sort, shortest paths, and implicit graphs. Easy to hard; your checkmarks are stored locally.",
          zh: "覆盖网格 DFS/BFS、多源 BFS、拓扑排序、最短路、隐式图。由易到难,勾选进度存本地",
        }}
        badge={
          <span className="chip">
            <T en="Selected" zh="Hot 精选" />
          </span>
        }
      >
        <ProblemSet ch="graph" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 8 correctly to mark this chapter complete.",
          zh: "8 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="graph" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                <b>A graph is vertices plus edges.</b> The linked list, the tree,
                and the grid are all special cases: a singly linked list is a
                graph with one outgoing edge per vertex laid out in a line, a
                tree is connected with no cycle, and a grid joins each cell to
                the cells above, below, left, and right.
              </>
            ),
            zh: (
              <>
                <b>图 = 顶点 + 边。</b>链表、树、网格都是它的特例 ——
                单链表是「每点一条出边的直线图」,树是「连通且无环的图」,
                网格是「每个格子和上下左右相邻的图」。
              </>
            ),
          },
          {
            en: (
              <>
                Two representations: an <b>adjacency matrix</b> uses O(V²) space
                and tests an edge in O(1); an <b>adjacency list</b> uses O(V + E)
                space and scans neighbors quickly.{" "}
                <b>Use an adjacency list for a sparse graph</b>, which is almost
                every problem you will meet.
              </>
            ),
            zh: (
              <>
                两种表示法:<b>邻接矩阵</b> 占 O(V²) 空间、查边 O(1);
                <b>邻接表</b> 占 O(V + E) 空间、遍历邻居快。
                <b>稀疏图默认邻接表</b>,这是刷题主力。
              </>
            ),
          },
          {
            en: (
              <>
                Two traversals: <b>BFS uses a queue</b> and spreads by distance
                from the start; <b>DFS uses a stack or recursion</b> and goes
                deep first. Both are <b>O(V + E)</b> with an adjacency list. A
                graph can have a cycle, so <b>the visited set is required</b>,
                and in BFS you mark a vertex when you enqueue it, not when you
                dequeue it.
              </>
            ),
            zh: (
              <>
                两种遍历:<b>BFS 用队列</b>,按「离起点多远」一层层扩散;
                <b>DFS 用栈或递归</b>,一条路走到底。用邻接表时都是{" "}
                <b>O(V + E)</b>。图可能有环,所以<b>visited 不能省</b>;
                BFS 里要在入队时标记,而不是出队时。
              </>
            ),
          },
          {
            en: (
              <>
                <b>Grid problems</b> are DFS or BFS on a grid plus a direction
                array <code>dirs</code>. Sinking or coloring writes a new value
                into each visited cell, which serves as the visited set (LC 200
                is the template).
              </>
            ),
            zh: (
              <>
                <b>网格题</b> = 网格上的 DFS/BFS + 方向数组 <code>dirs</code>;
                「淹没 / 染色」把访问过的格子改值,兼任 visited
                (LC200 岛屿是模板)。
              </>
            ),
          },
          {
            en: (
              <>
                <b>Topological sort</b> exists only for a{" "}
                <b>directed acyclic graph</b>. Kahn&rsquo;s algorithm enqueues
                in-degree 0, then decreases the in-degree of each successor on
                dequeue. <b>Vertices left over means a cycle</b> — one of the two
                standard cycle tests for a directed graph; the other is DFS with
                three states. Undirected graphs need a different method.
              </>
            ),
            zh: (
              <>
                <b>拓扑排序</b>只对 <b>有向无环图(DAG)</b> 成立:Kahn 入度法
                (入度 0 入队 → 出队时把后继入度减 1),<b>出不完 = 有环</b>。
                这是有向图判环的两种标准做法之一(另一种是 DFS 三状态);
                无向图判环要用别的方法。
              </>
            ),
          },
          {
            en: (
              <>
                Shortest paths depend on the weights.{" "}
                <b>Unweighted: use BFS</b>, where the layer number is the fewest
                edges. <b>Non-negative weights: use Dijkstra</b> (greedy plus a
                min-heap, O((V + E) log V)).{" "}
                <b>A negative weight breaks Dijkstra</b>, because a settled
                vertex is never reconsidered; use Bellman-Ford at O(V · E)
                instead.
              </>
            ),
            zh: (
              <>
                最短路看边权:<b>无权用 BFS</b>(层数就是最少边数);
                <b>非负权用 Dijkstra</b>(贪心 + 小根堆,O((V + E) log V));
                <b>有负权时 Dijkstra 失效</b>(定案后不再回头),
                改用 Bellman-Ford,复杂度 O(V · E)。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="graph" />
    </main>
  );
}
