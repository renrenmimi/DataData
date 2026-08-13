"use client";

// 第 11 章 · 并查集 —— 八段式:
// 朋友圈问题 → parent 数组=森林(UFLab)→ 两大优化 → 手写实现 →
// 三语言对照 → 三道精讲(逐帧)→ 题单 → 测验 → 要点。

import {
  Hero,
  Section,
  Callout,
  BigO,
  KeyPoints,
  ChapterFooter,
} from "@/lib/kit";
import { CodeTabs } from "@/lib/code";
import { ArrayStepper, type ArrayFrame } from "@/lib/stepper";
import { ProblemSet } from "@/lib/problems";
import { Quiz } from "@/lib/quiz";
import { PROBLEMS, QUIZ } from "@/lib/union-find-data";
import { UFLab } from "./viz";
import "./chapter.css";

/* ================= 精讲动画帧 ================= */

// LC 547 省份数量:4 城市邻接矩阵,cells = parent 数组,count 从 4 减到 2
const F547: ArrayFrame[] = [
  {
    cells: [{ v: 0, state: "ok" }, { v: 1, state: "ok" }, { v: 2, state: "ok" }, { v: 3, state: "ok" }],
    msg: (
      <>
        4 个城市,parent = [0,1,2,3],人人是根,<b>count = 4</b>。矩阵
        M[i][j]=1 表示 i、j 直连。下面逐格扫上三角(j &gt; i,矩阵对称,下三角不用看)。
      </>
    ),
  },
  {
    cells: [{ v: 1, state: "lit" }, { v: 1, state: "lit" }, { v: 2 }, { v: 3 }],
    ptrs: [
      { i: 0, label: "i" },
      { i: 1, label: "j" },
    ],
    msg: (
      <>
        M[0][1] = 1:union(0, 1)。两根不同(0 和 1)→ parent[0] = 1,
        <b>count 4 → 3</b>。
      </>
    ),
  },
  {
    cells: [{ v: 1 }, { v: 1 }, { v: 2, state: "ghost" }, { v: 3, state: "ghost" }],
    ptrs: [{ i: 0, label: "i" }],
    msg: (
      <>
        M[0][2] = 0、M[0][3] = 0:不认识,跳过 —— 什么都不做,count 不变。
      </>
    ),
  },
  {
    cells: [{ v: 1 }, { v: 2, state: "lit" }, { v: 2, state: "lit" }, { v: 3 }],
    ptrs: [
      { i: 1, label: "i" },
      { i: 2, label: "j" },
    ],
    msg: (
      <>
        M[1][2] = 1:union(1, 2)。find(1)=1、find(2)=2,不同 → parent[1] = 2,
        <b>count 3 → 2</b>。注意 0 也跟着「集体入伙」了:find(0) 会一路爬到 2。
      </>
    ),
  },
  {
    cells: [{ v: 1, state: "ok" }, { v: 2, state: "ok" }, { v: 2, state: "ok" }, { v: 3, state: "lit" }],
    msg: (
      <>
        剩余格子全是 0。扫描结束,<b>count = 2</b> 就是答案:省份 {"{0,1,2}"} 和
        {"{3}"}。全程没做任何遍历搜索 —— 数连通块,count 边合并边数好了。
      </>
    ),
  },
];

// LC 684 冗余连接:逐边 union,遇「已连通还加边」= 环。节点 1..5,cells[0] 占位
const F684: ArrayFrame[] = [
  {
    cells: [
      { v: "·", state: "ghost" },
      { v: 1 },
      { v: 2 },
      { v: 3 },
      { v: 4 },
      { v: 5 },
    ],
    msg: (
      <>
        边:[1,2] [2,3] [3,4] [1,4] [1,5]。树 + 1 条多余边 = 必有一个环。
        逐边 union,谁触发「本来就连通」,谁就是那条多余的边。
      </>
    ),
  },
  {
    cells: [
      { v: "·", state: "ghost" },
      { v: 2, state: "lit" },
      { v: 2, state: "lit" },
      { v: 3 },
      { v: 4 },
      { v: 5 },
    ],
    msg: (
      <>
        边 [1,2]:find(1)=1,find(2)=2,不同 → 合并,parent[1]=2。相安无事。
      </>
    ),
  },
  {
    cells: [
      { v: "·", state: "ghost" },
      { v: 2 },
      { v: 3, state: "lit" },
      { v: 3, state: "lit" },
      { v: 4 },
      { v: 5 },
    ],
    msg: <>边 [2,3]:find(2)=2,find(3)=3,不同 → 合并,parent[2]=3。</>,
  },
  {
    cells: [
      { v: "·", state: "ghost" },
      { v: 2 },
      { v: 3 },
      { v: 4, state: "lit" },
      { v: 4, state: "lit" },
      { v: 5 },
    ],
    msg: (
      <>
        边 [3,4]:find(3)=3,find(4)=4,不同 → 合并,parent[3]=4。此刻 1、2、3、4
        已经在同一棵树里(1→2→3→4)。
      </>
    ),
  },
  {
    cells: [
      { v: "·", state: "ghost" },
      { v: 2, state: "bad" },
      { v: 3 },
      { v: 4 },
      { v: 4, state: "bad" },
      { v: 5 },
    ],
    ptrs: [
      { i: 1, label: "u" },
      { i: 4, label: "v" },
    ],
    msg: (
      <>
        边 [1,4]:find(1) 一路爬 1→2→3→4 = <b>4</b>,find(4) = <b>4</b> ——
        根相同!1 和 4 之间早就有路,这条边一加必成环。<b>答案 [1,4]</b>。
      </>
    ),
  },
  {
    cells: [
      { v: "·", state: "ghost" },
      { v: 2, state: "ok" },
      { v: 3, state: "ok" },
      { v: 4, state: "ok" },
      { v: 4, state: "ok" },
      { v: 5, state: "ghost" },
    ],
    msg: (
      <>
        题目要求返回「最后出现」的那条成环边,而逐边 union 恰好天然满足:
        <b>第一条触发「已连通」的边,就是按输入顺序最后一条形成环的边</b>。
        边 [1,5] 根本不用看。
      </>
    ),
  },
];

// LC 200 岛屿数量(UF 视角):2×4 网格拍扁成一维,idx = r*4+c
const F200: ArrayFrame[] = [
  {
    cells: [
      { v: 1 }, { v: 1 }, { v: 0, state: "ghost" }, { v: 1 },
      { v: 1 }, { v: 0, state: "ghost" }, { v: 0, state: "ghost" }, { v: 1 },
    ],
    msg: (
      <>
        2×4 网格拍扁成一维:idx = r×4 + c(前 4 格是第 0 行,后 4 格是第 1 行)。
        5 块陆地(值 1),初始 <b>count = 5</b> —— 先当每块陆地都是独立小岛。
      </>
    ),
  },
  {
    cells: [
      { v: 1, state: "lit" }, { v: 1, state: "lit" }, { v: 0, state: "ghost" }, { v: 1 },
      { v: 1 }, { v: 0, state: "ghost" }, { v: 0, state: "ghost" }, { v: 1 },
    ],
    ptrs: [{ i: 0, label: "(0,0)" }],
    msg: (
      <>
        扫到 (0,0):右邻 (0,1) 也是陆地 → union(0, 1),<b>count 5 → 4</b>。
        每格只看「右」和「下」就够 —— 左和上在之前的格子里已经连过了。
      </>
    ),
  },
  {
    cells: [
      { v: 1, state: "lit" }, { v: 1, state: "ok" }, { v: 0, state: "ghost" }, { v: 1 },
      { v: 1, state: "lit" }, { v: 0, state: "ghost" }, { v: 0, state: "ghost" }, { v: 1 },
    ],
    ptrs: [{ i: 0, label: "(0,0)" }],
    msg: (
      <>
        (0,0) 的下邻 (1,0)(idx = 4)也是陆地 → union(0, 4),<b>count 4 → 3</b>。
        左上角三块陆地已并成一伙。
      </>
    ),
  },
  {
    cells: [
      { v: 1, state: "ok" }, { v: 1, state: "ok" }, { v: 0, state: "ghost" }, { v: 1, state: "lit" },
      { v: 1, state: "ok" }, { v: 0, state: "ghost" }, { v: 0, state: "ghost" }, { v: 1, state: "lit" },
    ],
    ptrs: [{ i: 3, label: "(0,3)" }],
    msg: (
      <>
        (0,1) 右、下都是水,跳过;(0,3):右出界,下邻 (1,3)(idx = 7)是陆地 →
        union(3, 7),<b>count 3 → 2</b>。
      </>
    ),
  },
  {
    cells: [
      { v: 1, state: "ok" }, { v: 1, state: "ok" }, { v: 0, state: "ghost" }, { v: 1, state: "lit" },
      { v: 1, state: "ok" }, { v: 0, state: "ghost" }, { v: 0, state: "ghost" }, { v: 1, state: "lit" },
    ],
    msg: (
      <>
        第 1 行的陆地 (1,0)、(1,3) 右/下都无新陆地。扫描结束:<b>count = 2</b>,
        两座岛 —— {"{(0,0),(0,1),(1,0)}"} 与 {"{(0,3),(1,3)}"}。
      </>
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "why", n: "01", label: "朋友圈问题" },
  { id: "memory", n: "02", label: "一个数组=一片森林" },
  { id: "optimize", n: "03", label: "两大优化" },
  { id: "impl", n: "04", label: "手写实现" },
  { id: "langs", n: "05", label: "三语言对照" },
  { id: "patterns", n: "06", label: "套路与精讲" },
  { id: "problems", n: "07", label: "高频题单" },
  { id: "quiz", n: "08", label: "通关测验" },
];

export default function UnionFindChapter() {
  return (
    <main className="page" data-ch="union-find">
      <Hero
        ch="union-find"
        title={
          <>
            并查集 <span className="grad">Union-Find</span>
          </>
        }
        essence={
          <>
            它只回答一个问题:<strong>「你们是一伙的吗?」</strong>不记路径、不管细节,
            用一个 parent 数组把动态合并 + 连通查询做到<strong>近乎 O(1)</strong>
            —— 可能是性价比最高的数据结构。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 朋友圈问题 ================= */}
      <Section
        id="why"
        index="01"
        title="为什么需要它:朋友圈问题"
        desc="A 和 B 是朋友,B 和 C 是朋友 —— 那 A 和 C 是一伙的吗?"
      >
        <div className="prose">
          <p>
            想象你在维护一个社交网络。消息不断涌进来:「A 和 B 加了好友」
            「C 和 D 加了好友」「B 和 C 加了好友」……与此同时,老板隔三差五来问一句:
            <strong>「A 和 D 现在算一个圈子的吗?」</strong>
            注意,朋友关系会<strong>传递</strong>:A—B、B—C、C—D 连起来,
            A 和 D 哪怕从未说过话,也算同一个圈子。这类问题有个学名:
            <strong>动态连通性(dynamic connectivity)</strong>
            —— 关系在动态增加,查询随时会来。
          </p>
          <p>
            仔细想想,回答老板的问题其实只需要两个操作:
          </p>
        </div>
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">操作一</div>
            <div className="card-title">find(x) —— 你老大是谁?</div>
            <p>
              每个圈子推举一个<b>代表(根)</b>。想知道 A 和 D 是不是一伙,
              不用把中间的关系链摸一遍 —— 问一句「A 的老大是谁?D 的老大是谁?」
              <b>老大相同 = 一伙的</b>。把「连通吗」变成「相等吗」,这是整个结构的灵魂。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">操作二</div>
            <div className="card-title">union(a, b) —— 两伙合并</div>
            <p>
              a 和 b 交了朋友?找到两人各自的老大,让<b>一个老大认另一个当老大</b>
              —— 两个圈子瞬间合成一个,a 圈的所有人自动跟着换阵营,
              一个人都不用挨个通知。
            </p>
          </div>
        </div>
        <div className="prose" style={{ marginTop: 18 }}>
          <p>
            你可能会想:这不就是图的连通性吗?用下一章的 DFS/BFS 从 A 出发走一圈,
            看能不能走到 D,不就行了?<strong>能,但贵。</strong>
            每来一次查询就要重新遍历一遍图,单次 O(V+E);关系还在不断增加,
            遍历的结果没法复用。而并查集(Union-Find,也叫不相交集合
            Disjoint Set Union,简称 <strong>DSU</strong>)把两个操作都做到了
            <strong>均摊近乎 O(1)</strong>:
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>方案</th>
                <th>加一条关系</th>
                <th>查一次连通</th>
                <th>适合场景</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>DFS / BFS 重新遍历</b></td>
                <td><BigO o="1" label="O(1) 存边" /></td>
                <td><BigO o="n" label="O(V+E)" /></td>
                <td>静态图、要具体路径</td>
              </tr>
              <tr>
                <td><b>并查集</b></td>
                <td><BigO o="1" label="α(n) ≈ O(1)" /></td>
                <td><BigO o="1" label="α(n) ≈ O(1)" /></td>
                <td><b>动态加边 + 只问连通性</b></td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="idea" title="并查集的交易:用「失忆」换「闪电」">
          <p>
            它快的秘密是<b>只记结论、不记过程</b>:union 完之后,「A 和 D 之间
            具体怎么连通的」这条路径信息被彻底丢掉,只剩「同属一个集合」这个结论。
            所以它答不了「A 到 D 怎么走」,也删不了边(关系拆不开)——
            但只要你的问题恰好只是「通不通」,它就是断层第一的选择。
          </p>
        </Callout>
        <Callout tone="story" title="它撑起过整个互联网的一角">
          <p>
            并查集是 1964 年就出现的老古董,却至今活跃在第一线:网络布线里的
            Kruskal 最小生成树用它判断「这条线接上会不会成环」;编译器的类型推导用它
            合并等价类型;图像处理用它标记连通区域;甚至 Linux 内核里也有它的身影。
            结构简单到三行核心代码,却在 2005 年才被彻底证明复杂度下界 ——
            简单和深刻,在它身上是同一件事。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 一个数组=一片森林 ================= */}
      <Section
        id="memory"
        index="02"
        title="内存里的样子:一个数组,就是整片森林"
        desc="parent[i] = 我的上级是谁;parent[i] = i,我自己就是老大"
      >
        <div className="prose">
          <p>
            并查集的全部家当,就是<strong>一个 int 数组 parent</strong>。
            规则只有两条:
          </p>
          <ul>
            <li>
              <code>parent[i] = j</code>:节点 i 的<b>上级</b>是 j(不一定是老大,
              可能只是「上级的上级的…」链条中的一环);
            </li>
            <li>
              <code>parent[i] = i</code>:i 的上级是自己 —— 它就是<b>根(root)</b>,
              整个集合的代表。
            </li>
          </ul>
          <p>
            于是 find 的做法自然浮现:<strong>顺藤摸瓜</strong> —— 从 x 出发,
            沿着 parent 一路往上爬,直到遇见「自己指自己」的那个人,他就是老大:
          </p>
        </div>
        <CodeTabs
          title="find_naive"
          java={{
            code: `// 朴素版 find:顺藤摸瓜,直到 parent[x] == x
int find(int x) {
    while (parent[x] != x) {   // 只要上面还有人
        x = parent[x];         // 就往上爬一级
    }
    return x;                  // 爬到头 = 根 = 集合代表
}`,
          }}
          python={{
            code: `# 朴素版 find:顺藤摸瓜,直到 parent[x] == x
def find(self, x: int) -> int:
    while self.parent[x] != x:   # 只要上面还有人
        x = self.parent[x]       # 就往上爬一级
    return x                     # 爬到头 = 根 = 集合代表`,
          }}
          js={{
            code: `// 朴素版 find:顺藤摸瓜,直到 parent[x] === x
find(x) {
  while (this.parent[x] !== x) {  // 只要上面还有人
    x = this.parent[x];           // 就往上爬一级
  }
  return x;                       // 爬到头 = 根 = 集合代表
}`,
          }}
        />
        <div className="prose">
          <p>
            换个角度看这个数组:每个 i 向 parent[i] 连一条「认老大」的箭头,
            整个数组就画成了<strong>一片森林</strong> —— 若干棵树,一棵树 = 一个集合,
            树根 = 集合代表。这是全书<strong>第二次「数组扮演树」</strong>:
            堆用「下标 ×2」隐式编码父子,而并查集更直接 —— 干脆把父节点是谁存进数组。
            树只是逻辑形状,物理上自始至终只有一排连续的 int。
          </p>
          <p>
            亲手玩一下:<strong>点两个节点</strong>,看 union 如何先派 find
            找到两边的根、再让一根挂到另一根下面;盯着下方的 parent 数组,
            确认「图里发生的一切,不过是数组里改了一个数」。然后点
            <strong>「最坏顺序 union」</strong>,看一场灾难:
          </p>
        </div>
        <UFLab />
        <Callout tone="warn" title="灾难复盘:树是怎么退化成链表的?">
          <p>
            union(0,1) 让 0 挂到 1 下面,union(1,2) 又让这棵树的根挂到 2 下面……
            每次都是「老树根」挂给「新光杆」,树一路长高不长胖,最后成了一条
            <b> 10 层的链</b>。此时 find(0) 要爬 9 步 —— O(n),
            并查集引以为傲的速度荡然无存。<b>问题不在结构,在合并的做法</b>:
            这正是下一节两大优化要治的病。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 两大优化 ================= */}
      <Section
        id="optimize"
        index="03"
        title="两大优化:把树按扁,把 O(n) 打回 α(n)"
        desc="路径压缩管 find,按秩合并管 union —— 两个都便宜到近乎免费"
        badge={<span className="chip" data-tone="warn">★ 面试必问</span>}
      >
        <div className="prose">
          <p>
            上一节的病根是<strong>树太高</strong>:find 的成本 = 从节点爬到根的层数。
            所以两大优化的目标完全一致 —— <strong>想尽办法让树矮</strong>。
          </p>
        </div>

        <div className="sec-head" style={{ marginTop: 28 }}>
          <span className="sec-index">优化一</span>
          <h3 className="sec-title" style={{ fontSize: 19 }}>
            路径压缩:摸瓜的同时,把藤拉直
          </h3>
        </div>
        <div className="prose">
          <p>
            find(x) 反正要从 x 一路爬到根,途中经过的每个节点,老大其实都已经确定了
            —— 那为什么还让它们保持「上级的上级的上级…」这种层层转达的关系?
            <strong>爬完之后,顺手把沿途所有节点的 parent 直接改成根</strong>:
          </p>
        </div>
        <div className="uf-cmp">
          <figure>
            <svg viewBox="0 0 210 200" width="210" role="img" aria-label="压缩前:一条链">
              <line className="uf-edge" x1={105} y1={62} x2={105} y2={34} />
              <line className="uf-edge" x1={105} y1={112} x2={105} y2={84} />
              <line className="uf-edge" x1={105} y1={162} x2={105} y2={134} />
              <g className="uf-node root">
                <circle cx={105} cy={20} r={14} />
                <text x={105} y={20}>3</text>
              </g>
              <g className="uf-node">
                <circle cx={105} cy={70} r={14} />
                <text x={105} y={70}>2</text>
              </g>
              <g className="uf-node">
                <circle cx={105} cy={120} r={14} />
                <text x={105} y={120}>1</text>
              </g>
              <g className="uf-node lit">
                <circle cx={105} cy={170} r={14} />
                <text x={105} y={170}>0</text>
              </g>
            </svg>
            <figcaption>
              before:find(0) 要爬 3 步 —— 0→1→2→3
            </figcaption>
          </figure>
          <figure>
            <svg viewBox="0 0 210 200" width="210" role="img" aria-label="压缩后:全部直挂根">
              <line className="uf-edge lit" x1={60} y1={106} x2={95} y2={48} />
              <line className="uf-edge lit" x1={105} y1={106} x2={105} y2={48} />
              <line className="uf-edge lit" x1={150} y1={106} x2={115} y2={48} />
              <g className="uf-node root">
                <circle cx={105} cy={32} r={14} />
                <text x={105} y={32}>3</text>
              </g>
              <g className="uf-node lit">
                <circle cx={60} cy={120} r={14} />
                <text x={60} y={120}>0</text>
              </g>
              <g className="uf-node lit">
                <circle cx={105} cy={120} r={14} />
                <text x={105} y={120}>1</text>
              </g>
              <g className="uf-node lit">
                <circle cx={150} cy={120} r={14} />
                <text x={150} y={120}>2</text>
              </g>
            </svg>
            <figcaption>
              after:0、1、2 全部直挂根,下次 find 都只要 1 步
            </figcaption>
          </figure>
        </div>
        <div className="prose">
          <p>
            代价几乎为零 —— 这条路本来就要走,只是回程多做几次赋值;收益却是
            <strong>永久的</strong>:被压缩过的节点,之后的 find 一步到位。
            树越用越扁,越查越快,像一条越走越平的山路。
          </p>
        </div>

        <div className="sec-head" style={{ marginTop: 36 }}>
          <span className="sec-index">优化二</span>
          <h3 className="sec-title" style={{ fontSize: 19 }}>
            按秩合并:矮树挂到高树下
          </h3>
        </div>
        <div className="prose">
          <p>
            union 时让谁认谁当老大,不是随便选的。想想两棵树合并后的高度:
          </p>
          <ul>
            <li>
              <b>矮树挂到高树下</b>:新高度 = max(高树, 矮树+1) = 高树 ——{" "}
              <b>不变</b>;
            </li>
            <li>
              <b>高树挂到矮树下</b>:新高度 = 高树 + 1 —— 白白<b>长高一层</b>。
            </li>
          </ul>
          <p>
            所以给每个根记一个 <strong>rank(秩,树高的估计值)</strong>:union 时
            rank 小的挂给 rank 大的;一样高时随便挂,但挂完老大的 rank 加 1。
            可以证明:只用这一条,树高就不会超过 <strong>O(log n)</strong> ——
            因为 rank 每 +1,树的规模至少翻倍(两棵等高的树合并),
            翻不了几次就见顶了。这和动态数组「扩容必翻倍」的论证是同一个味道。
            也有实现按 <strong>size(集合大小)</strong>合并 —— 小集合挂给大集合,
            效果同级,还顺便维护了每块的人数。
          </p>
          <p>
            现在回实验室验证:<strong>打开两个开关</strong>,再点一次
            「最坏顺序 union」,看那条 10 层长链变成一棵两三层的扁树:
          </p>
        </div>
        <UFLab defaultPC defaultRank />
        <Callout tone="deep" title="α(n):增长最慢的函数(就量级而言)">
          <p>
            两个优化叠加后,单次操作的均摊复杂度是 <b>O(α(n))</b> —— α 是
            <b>反阿克曼函数(inverse Ackermann)</b>。阿克曼函数是数学里出了名的
            增长狂魔(A(4,4) 的位数就超过宇宙原子总数),它的反函数就慢到了极致:
            <b> n 取宇宙原子数(约 10⁸⁰)时,α(n) 也不超过 5</b>。
            换句话说,任何你能实际遇到的 n,每次操作最多摊 4~5 步 ——
            工程上直接当 O(1) 用。严格证明(Tarjan, 1975)远超本课范围,
            带走直觉就够:<b>「近乎常数,有证明背书」</b>。
          </p>
        </Callout>
        <Callout tone="warn" title="常见误区:路径压缩会不会破坏 rank?">
          <p>
            会 —— 压缩把树按扁后,rank 就不再精确等于树高了,所以它才叫「秩」
            而不是「高度」:<b>一个只增不减的上界估计</b>。好消息是这完全不影响
            正确性和复杂度分析;实践中甚至可以只写路径压缩、省掉 rank
            (均摊 O(log n),刷题足够快)。但面试被问到「两个优化各自的作用」,
            必须答得出:<b>压缩治 find,按秩治 union,叠加才有 α(n)</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 手写实现 ================= */}
      <Section
        id="impl"
        index="04"
        title="手写实现:一个值得背下来的模板"
        desc="parent + rank + count,五个方法,不到 40 行 —— 面试时要能默写"
      >
        <div className="prose">
          <p>
            并查集是极少数<strong>值得逐字背熟</strong>的数据结构:标准库没有它,
            题目里它永远以「手写模板 + 一点建模」的形式出现。下面这版带满两个优化,
            外加 connected(判连通)和 count(连通块计数)两个高频配件:
          </p>
        </div>
        <CodeTabs
          title="union_find"
          java={{
            code: `class UnionFind {
    private final int[] parent;   // parent[i] = i 的上级
    private final int[] rank;     // rank[i] = 以 i 为根的树高上界
    private int count;            // 当前连通块数量

    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];        // 默认全 0,单节点树高 0
        count = n;                // 初始:n 个集合各自为营
        for (int i = 0; i < n; i++) parent[i] = i;  // 自己是自己的老大
    }

    public int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];  // 路径减半:指向祖先节点
            x = parent[x];                  // 再往上爬
        }
        return x;
    }

    public boolean union(int a, int b) {
        int ra = find(a), rb = find(b);     // 先找两边的根!
        if (ra == rb) return false;         // 已是一伙,啥也不做
        if (rank[ra] < rank[rb]) {          // 保证 ra 是高的那棵
            int t = ra; ra = rb; rb = t;
        }
        parent[rb] = ra;                    // 矮树 rb 挂到高树 ra 下
        if (rank[ra] == rank[rb]) rank[ra]++;  // 等高合并才会长高
        count--;                            // 两块并成一块
        return true;                        // 真正发生了合并
    }

    public boolean connected(int a, int b) {
        return find(a) == find(b);          // 老大相同 = 一伙
    }

    public int getCount() { return count; }
}`,
            hl: [14, 15, 16, 17, 23, 24, 29, 30, 31],
            note: (
              <>
                <b>路径减半(halving)</b>:迭代版把「指向祖先节点」代替完整压缩,
                一趟循环搞定、无递归无第二次遍历,复杂度同为 α(n)——
                这是竞赛圈最流行的写法。
              </>
            ),
          }}
          python={{
            code: `class UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))  # parent[i] = i 的上级,初始自指
        self.rank = [0] * n           # 树高上界
        self.count = n                # 连通块数量

    def find(self, x: int) -> int:
        root = x
        while self.parent[root] != root:   # 第一趟:找到根
            root = self.parent[root]
        while self.parent[x] != root:      # 第二趟:沿途全改挂根
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a: int, b: int) -> bool:
        ra, rb = self.find(a), self.find(b)  # 先找两边的根!
        if ra == rb:
            return False                     # 已是一伙,啥也不做
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra                  # 保证 ra 是高的那棵
        self.parent[rb] = ra                 # 矮树挂到高树下
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1               # 等高合并才会长高
        self.count -= 1                      # 两块并成一块
        return True

    def connected(self, a: int, b: int) -> bool:
        return self.find(a) == self.find(b)  # 老大相同 = 一伙`,
            hl: [8, 9, 10, 11, 12, 13, 16, 17, 18, 22],
            note: (
              <>
                <b>易错点:</b>Python 递归默认限深 1000,递归版 find 在长链数据上会
                RecursionError —— 所以这里用「两趟迭代」实现完整路径压缩,
                刷题请坚持迭代写法。
              </>
            ),
          }}
          js={{
            code: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i); // 自指
    this.rank = new Array(n).fill(0);  // 树高上界
    this.count = n;                    // 连通块数量
  }

  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]; // 指向祖先节点
      x = this.parent[x];                           // 再往上爬
    }
    return x;
  }

  union(a, b) {
    let ra = this.find(a), rb = this.find(b); // 先找两边的根!
    if (ra === rb) return false;              // 已是一伙,啥也不做
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;                     // 矮树挂到高树下
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
    this.count--;                             // 两块并成一块
    return true;
  }

  connected(a, b) {
    return this.find(a) === this.find(b);     // 老大相同 = 一伙
  }
}`,
            hl: [9, 10, 11, 17, 18, 19, 20, 21, 22],
            note: (
              <>
                <b>易错点:</b>大数组建议用 <code>Int32Array(n)</code> 存
                parent/rank,内存减半且更快;注意 <code>Int32Array</code>{" "}
                没有 <code>Array.from</code> 的下标初始化便利,要手动 for 一遍。
              </>
            ),
          }}
        />
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            三个细节值得多看一眼,它们都是题目里反复用到的「接口设计」:
          </p>
          <ul>
            <li>
              <b>union 返回 boolean</b>:返回 false 表示「两边本来就连通」——
              LC 684 找环、Kruskal 判环,靠的全是这个返回值;
            </li>
            <li>
              <b>count 的维护</b>:初始 = n,只在真合并时 −1 ——
              LC 547/200 问「有几块」,答案直接读 count,不用最后再数;
            </li>
            <li>
              <b>先 find 后合并</b>:union 里第一行永远是找两边的根 ——
              合并的是集合,不是那两个具体成员。
            </li>
          </ul>
        </div>
      </Section>

      {/* ================= §05 三语言对照 ================= */}
      <Section
        id="langs"
        index="05"
        title="三语言对照:没有内置,模板即标准库"
        desc="Java / Python / JS 都没有官方并查集 —— 差异只在数组怎么开"
      >
        <div className="prose">
          <p>
            三大语言的标准库<strong>都没有</strong>并查集(C++ 也没有;只有 Boost
            或竞赛模板库里有)。为什么?因为它太小了 —— 与其设计一套通用 API,
            不如让你 30 秒手写一个贴合题意的。所以「对照」的重点不是 API,
            而是<strong>容器选型</strong>:
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>关注点</th>
                <th>Java</th>
                <th>Python</th>
                <th>JavaScript</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>parent / rank 容器</b></td>
                <td><code>int[] parent = new int[n]</code></td>
                <td><code>list(range(n))</code></td>
                <td><code>Array</code> 或 <code>Int32Array</code></td>
              </tr>
              <tr>
                <td><b>初始化自指</b></td>
                <td>for 循环 <code>parent[i] = i</code></td>
                <td><code>list(range(n))</code> 一步到位</td>
                <td><code>Array.from({"{length: n}"}, (_, i) =&gt; i)</code></td>
              </tr>
              <tr>
                <td><b>find 写法</b></td>
                <td>迭代(递归也安全,但没必要)</td>
                <td><b>必须迭代</b>(递归限深 1000)</td>
                <td>迭代(深递归同样有栈风险)</td>
              </tr>
              <tr>
                <td><b>性能小抄</b></td>
                <td>原始 int[],无装箱,最快</td>
                <td>list 存的是对象指针,常数偏大</td>
                <td>TypedArray 可避免稀疏化退化</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose" style={{ marginTop: 16 }}>
          <p>
            还有一个高频实战问题:<strong>key 不是 0..n−1 的整数怎么办?</strong>
            比如 LC 721 的 key 是邮箱字符串、LC 128 的 key 是任意整数(可能是负数、
            可能大到 10⁹)。答案是老朋友哈希表(第 6 章):
            <strong>先用哈希表把每个 key 映射成递增编号,再照常开数组</strong>。
            UF 负责合并,哈希负责翻译 —— 各干各的老本行:
          </p>
        </div>
        <CodeTabs
          title="uf_with_string_keys"
          java={{
            code: `// key 是字符串:哈希表编号 + 数组并查集
Map<String, Integer> id = new HashMap<>();
int idx = 0;
for (String key : keys) {
    // 第一次见到的 key,发一个新编号
    if (!id.containsKey(key)) id.put(key, idx++);
}
UnionFind uf = new UnionFind(id.size());
// 之后一律用编号操作:
uf.union(id.get("a@x.com"), id.get("b@x.com"));`,
          }}
          python={{
            code: `# key 是字符串:哈希表编号 + 数组并查集
ids: dict[str, int] = {}
for key in keys:
    # setdefault:没见过就发新编号,见过就返回旧的
    ids.setdefault(key, len(ids))

uf = UnionFind(len(ids))
# 之后一律用编号操作:
uf.union(ids["a@x.com"], ids["b@x.com"])`,
          }}
          js={{
            code: `// key 是字符串:Map 编号 + 数组并查集
const ids = new Map();
for (const key of keys) {
  // 第一次见到的 key,发一个新编号
  if (!ids.has(key)) ids.set(key, ids.size);
}
const uf = new UnionFind(ids.size);
// 之后一律用编号操作:
uf.union(ids.get("a@x.com"), ids.get("b@x.com"));`,
          }}
        />
        <Callout tone="idea" title="也可以用「哈希表版并查集」,但别默认它">
          <p>
            直接拿 <code>Map&lt;String, String&gt;</code> 当 parent(key 映射到
            上级 key)也能实现并查集,省掉编号那一步。代价是每次 find
            都在做哈希查找,常数比数组版大好几倍。经验法则:<b>元素能编号就编号,
            数组永远是并查集的最佳载体</b> —— 这也呼应了数组章的老结论:
            连续内存 + 下标直达,谁用谁快。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 套路与精讲 ================= */}
      <Section
        id="patterns"
        index="06"
        title="并查集的三大套路:计数、找环、等价类"
        desc="所有 UF 题的建模三问:节点是什么?边是什么?问计数还是问连通?"
        badge={<span className="chip" data-tone="warn">★ 面试核心</span>}
      >
        <div className="prose">
          <p>
            并查集题目的代码 90% 是同一份模板,真正的考点是<strong>建模</strong>:
            把题面翻译成「谁是节点、什么算边」。翻译完成后,套路只有三种:
          </p>
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">套路一</div>
            <div className="card-title">连通块计数</div>
            <p>
              「有几个省份/岛屿/组?」count 初始 = n,union 成功一次减 1,
              扫完直接交卷 → LC 547、200、2316。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">套路二</div>
            <div className="card-title">找环 / 判冗余</div>
            <p>
              逐边 union,某条边两端<b>已经连通还要连</b> —— 它就是成环边。
              Kruskal 判环同款 → LC 684、685。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">套路三</div>
            <div className="card-title">等价类合并</div>
            <p>
              「相等/相似/同账户」这类可传递的关系,全部 union 成等价类,
              再做检查或分组 → LC 990、721、839。
            </p>
          </div>
        </div>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 A</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 547 · 省份数量
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>n 个城市,isConnected[i][j] = 1 表示 i、j 直接相连;
            相连关系可传递,求「省份」(连通块)个数。
            <b> 暴力:</b>对每个没访问过的城市做一次 DFS 把整个省份标掉,数发起了几次
            —— 可行(下一章会讲),O(n²)。
            <b> UF 视角:</b>矩阵的每个 1 就是一条边,逐格 union,
            count 从 n 一路减,减剩多少就是几个省 —— 连「访问标记」都不需要:
          </p>
        </div>
        <ArrayStepper title="LC 547 · 逐格 union,count 从 4 减到 2(格子里是 parent 数组)" frames={F547} />
        <CodeTabs
          title="lc547_provinces"
          java={{
            code: `class Solution {
    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        UnionFind uf = new UnionFind(n);   // §04 的模板类
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {   // 矩阵对称,只扫上三角
                if (isConnected[i][j] == 1) {
                    uf.union(i, j);        // 有边就合并,count 自动维护
                }
            }
        }
        return uf.getCount();              // 剩几个连通块 = 几个省
    }
}`,
            hl: [6, 7, 8, 12],
          }}
          python={{
            code: `class Solution:
    def findCircleNum(self, isConnected: list[list[int]]) -> int:
        n = len(isConnected)
        uf = UnionFind(n)              # §04 的模板类
        for i in range(n):
            for j in range(i + 1, n):  # 矩阵对称,只扫上三角
                if isConnected[i][j] == 1:
                    uf.union(i, j)     # 有边就合并,count 自动维护
        return uf.count                # 剩几个连通块 = 几个省`,
            hl: [5, 6, 7, 8, 9],
          }}
          js={{
            code: `var findCircleNum = function (isConnected) {
  const n = isConnected.length;
  const uf = new UnionFind(n);         // §04 的模板类
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {  // 矩阵对称,只扫上三角
      if (isConnected[i][j] === 1) {
        uf.union(i, j);                // 有边就合并,count 自动维护
      }
    }
  }
  return uf.count;                     // 剩几个连通块 = 几个省
};`,
            hl: [4, 5, 6, 7, 10],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n²·α(n))</b>(矩阵本身就有 n² 个格子,读一遍是下限),空间{" "}
            <b>O(n)</b>。追问一:「DFS 也是 O(n²),UF 好在哪?」——
            此题打平;但若城市关系是<b>流式一条条到来</b>、中途要随时报数,
            UF 增量维护完胜。追问二:「为什么只扫上三角?」——
            矩阵对称,i-j 和 j-i 是同一条边,扫两遍只是浪费(union 幂等,不会错)。
          </p>
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 B</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 684 · 冗余连接
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>一棵 n 个节点的树,本该只有 n−1 条边;现在多给了 1 条,
            变成一张恰好含<b>一个环</b>的图。edges 按输入顺序给出,请返回<b>那条多余的边</b>
            —— 若有多条候选,返回<b>在输入里最后出现</b>的那条。
          </p>
          <p>
            <b>思路:</b>「树」的定义就是「n 个点、连通、无环」。我们<b>逐条边</b>做 union:
            正常情况下每条边的两个端点分属不同集合,合并后连通块少一个;可一旦某条边的
            两端<b>在合并前就已经同根(早已连通)</b>,再把它接上,就等于给两段本就通着的
            路径又搭了一根,<b>环必然由它促成</b> —— 它就是要找的冗余边。
          </p>
          <p>
            <b>为什么天然满足「最后出现」?</b>因为我们严格按输入顺序处理,
            <b>第一条触发「已连通」的边,恰好就是按顺序最后一条把环闭合的边</b>,
            找到即可返回,无需额外比较。下面 parent 数组逐边合并,到冲突边把两端标红:
          </p>
        </div>
        <ArrayStepper title="LC 684 · 逐边 union,遇「已连通还加边」= 环(格子里是 parent 数组)" frames={F684} />
        <CodeTabs
          title="lc684_redundant_connection"
          java={{
            code: `class Solution {
    public int[] findRedundantConnection(int[][] edges) {
        int n = edges.length;                 // n 条边 ⇒ 节点恰好是 1..n
        UnionFind uf = new UnionFind(n + 1);  // 节点从 1 编号,多开一格占位
        for (int[] e : edges) {
            int u = e[0], v = e[1];
            if (uf.connected(u, v)) {         // 两端已同根 = 早就连通
                return e;                     // 这条边一加必成环 —— 就是它
            }
            uf.union(u, v);                   // 没连通:正常合并进树
        }
        return new int[0];                    // 题目保证有解,兜底不会到这
    }
}`,
            hl: [7, 8, 10],
            note: (
              <>
                节点编号从 1 开始,所以开 <code>n + 1</code> 格(0 号位闲置)。
                这里用 <code>connected</code> 判「已连通」最直白;也可直接
                <code>if (!uf.union(u, v)) return e;</code> —— §04 让 union 返回
                boolean 就是为这个场景。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def findRedundantConnection(self, edges: list[list[int]]) -> list[int]:
        uf = UnionFind(len(edges) + 1)   # n 条边 ⇒ 节点 1..n,多开一格占位
        for u, v in edges:
            if uf.connected(u, v):       # 两端已同根 = 早就连通
                return [u, v]            # 这条边一加必成环 —— 就是它
            uf.union(u, v)               # 没连通:正常合并进树
        return []                        # 题目保证有解,兜底`,
            hl: [5, 6, 7],
          }}
          js={{
            code: `var findRedundantConnection = function (edges) {
  const uf = new UnionFind(edges.length + 1);  // 节点 1..n,多开一格占位
  for (const [u, v] of edges) {
    if (uf.connected(u, v)) {          // 两端已同根 = 早就连通
      return [u, v];                   // 这条边一加必成环 —— 就是它
    }
    uf.union(u, v);                    // 没连通:正常合并进树
  }
  return [];                           // 题目保证有解,兜底
};`,
            hl: [4, 5, 7],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n·α(n))</b> —— n 条边,每条边一次 union(内含 find),
            均摊近乎常数;空间 <b>O(n)</b> 存 parent。追问:<b>LC 685 冗余连接 II</b>
            把图改成<b>有向</b>,难度陡增 —— 多出来的边会制造两类毛病:某个点
            <b>入度变成 2</b>(冒出两个父节点),或者形成<b>有向环</b>,甚至两者兼有。
            得先分类讨论、锁定候选边,再用 UF 验证,不能像本题一路 union 到底。
            记住这个「有向要分情况」的坑即可。
          </p>
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 C</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 200 · 岛屿数量
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>一张只含 &apos;1&apos;(陆地)和 &apos;0&apos;(水)的网格,
            上下左右相邻的陆地连成一座岛,求岛屿总数。
            <b> 更常见的解法是 DFS/BFS 淹没</b>(下一章图论会细讲),这里换
            <b>并查集视角</b>练手:把每个陆地格子看成一个节点,相邻的两块陆地之间连一条边
            union 起来,最后剩几个连通块,就是几座岛。
          </p>
          <p>
            <b>两个要点:</b>① 二维坐标 (r, c) 要拍扁成一维下标{" "}
            <code>id = r×cols + c</code> 才能塞进 parent 数组 —— 这正是数组章讲过的
            <b>行主序(row-major)</b>展平;② 每格只需向<b>右邻和下邻</b>看齐,
            左邻、上邻在更早处理的格子里已经连过了,重复看纯属浪费(和 547 只扫上三角同理)。
          </p>
          <p>
            count 初始 = 陆地总数(先假设块块独立、各是一座小岛),之后每次<b>成功 union
            一次就少一座岛</b>。下面把 2×4 网格拍扁,扫描 + 合并,看 count 从 5 递减:
          </p>
        </div>
        <ArrayStepper title="LC 200 · 网格拍扁成一维,扫描 + union 相邻陆地,count 递减(1=陆地,0=水)" frames={F200} />
        <CodeTabs
          title="lc200_number_of_islands"
          java={{
            code: `class Solution {
    public int numIslands(char[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        UnionFind uf = new UnionFind(rows * cols);
        int islands = 0;                             // 先把每块陆地当独立小岛
        for (char[] row : grid)
            for (char cell : row)
                if (cell == '1') islands++;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == '0') continue;     // 水格子跳过
                int id = r * cols + c;               // (r,c) 拍扁成一维下标
                if (r + 1 < rows && grid[r + 1][c] == '1'    // 下邻是陆地
                        && uf.union(id, (r + 1) * cols + c)) islands--;
                if (c + 1 < cols && grid[r][c + 1] == '1'    // 右邻是陆地
                        && uf.union(id, r * cols + c + 1)) islands--;
            }
        }
        return islands;                              // 合并后剩几座岛
    }
}`,
            hl: [12, 13, 14, 15, 16],
            note: (
              <>
                <code>uf.union(...)</code> 返回 true 才 <code>islands--</code> ——
                若两块陆地此前已由别的路径连通,union 返回 false,岛数不减,天然去重。
              </>
            ),
          }}
          python={{
            code: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        rows, cols = len(grid), len(grid[0])
        uf = UnionFind(rows * cols)
        islands = sum(row.count('1') for row in grid)  # 先把每块陆地当独立小岛
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '0':
                    continue                            # 水格子跳过
                idx = r * cols + c                      # (r,c) 拍扁成一维下标
                if r + 1 < rows and grid[r + 1][c] == '1':   # 下邻是陆地
                    if uf.union(idx, (r + 1) * cols + c):
                        islands -= 1
                if c + 1 < cols and grid[r][c + 1] == '1':   # 右邻是陆地
                    if uf.union(idx, r * cols + c + 1):
                        islands -= 1
        return islands                                  # 合并后剩几座岛`,
            hl: [10, 11, 12, 14, 15],
          }}
          js={{
            code: `var numIslands = function (grid) {
  const rows = grid.length, cols = grid[0].length;
  const uf = new UnionFind(rows * cols);
  let islands = 0;                               // 先把每块陆地当独立小岛
  for (const row of grid)
    for (const cell of row)
      if (cell === '1') islands++;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '0') continue;          // 水格子跳过
      const id = r * cols + c;                   // (r,c) 拍扁成一维下标
      if (r + 1 < rows && grid[r + 1][c] === '1' // 下邻是陆地
          && uf.union(id, (r + 1) * cols + c)) islands--;
      if (c + 1 < cols && grid[r][c + 1] === '1' // 右邻是陆地
          && uf.union(id, r * cols + c + 1)) islands--;
    }
  }
  return islands;                                // 合并后剩几座岛
};`,
            hl: [11, 12, 13, 14, 15],
          }}
        />
        <Callout tone="deep" title="UF vs DFS 解岛屿:各有主场">
          <p>
            平心而论,这道题 <b>DFS「淹没法」更直观也更短</b>:从任一块陆地出发,
            把整座岛递归染成水,发起了几次染色就是几座岛 ——
            <b>下一章图论会用这个思路把本题再解一遍</b>。并查集在这里其实不占优:
            要多写一个模板类,还得手动做二维转一维,略显笨重。
          </p>
          <p>
            那 UF 的主场在哪?<b>在线动态加陆地</b> —— 见 LC 305《岛屿数量 II》:
            海面上一块块冒出新陆地,每加一块都要<b>立刻</b>报出当前岛数。DFS 每次都得
            重扫全图,而 UF 只需把新格子和它的四邻 union 一下,增量维护、随到随答。
            <b>一句话:静态一次性数块用 DFS,动态持续合并用并查集。</b>
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title="高频题单:并查集 8 题"
        desc="由易到难。先问自己:节点是什么?边是什么?要计数还是要判连通?"
        badge={<span className="chip">连通性专场</span>}
      >
        <ProblemSet ch="union-find" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="7 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="union-find" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            并查集只干两件事:<b>find(找老大)+ union(两伙合并)</b>。
            它把「连通吗」翻译成「根相等吗」,以放弃路径信息为代价,
            换来近 O(1) 的动态连通性维护。
          </>,
          <>
            <b>一个 parent 数组就是整片森林</b>:parent[i] = i 即是根。
            继堆之后,又一次「数组扮演树」—— 树是逻辑形状,数组是物理存储。
          </>,
          <>
            两大优化缺一不可地便宜:<b>路径压缩</b>(find 顺手把藤拉直)+
            <b>按秩合并</b>(矮树挂高树)。叠加后均摊 α(n) ≤ 5,工程上当常数用。
          </>,
          <>
            <b>union 前必先 find 两边的根</b> —— 合并的是集合不是个人;
            连通块计数 = 初始 n,每次「真合并」减 1。
          </>,
          <>
            选型口诀:<b>动态加边 + 只问连通 → 并查集</b>;要具体路径 → BFS/DFS;
            key 不是 0..n−1 的整数 → 先用哈希表映射成编号再上 UF。
          </>,
        ]}
      />

      <ChapterFooter ch="union-find" />
    </main>
  );
}
