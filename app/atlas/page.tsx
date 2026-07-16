"use client";

// 终章 · 选型地图 —— 全书的收束:
// ① 交互式决策树(拿到题问什么);② 信号词→结构对照表;③ 终极复杂度表;
// ④ 全书题单总表(汇总各章 PROBLEMS,进度全站互通);⑤ 下一步路线;⑥ 终极测验。

import Link from "next/link";
import "./chapter.css";
import {
  Hero,
  Section,
  Callout,
  BigO,
  KeyPoints,
  ChapterFooter,
  Reveal,
} from "@/lib/kit";
import { Quiz, type QuizItem } from "@/lib/quiz";
import { ProblemSet, type Problem } from "@/lib/problems";
import { useProgress } from "@/lib/progress";
import { CHAPTERS, type ChapterId } from "@/lib/curriculum";
import { DecisionLab } from "./viz";

import { PROBLEMS as P_ARRAY } from "@/lib/array-data";
import { PROBLEMS as P_STRING } from "@/lib/string-data";
import { PROBLEMS as P_LIST } from "@/lib/linked-list-data";
import { PROBLEMS as P_STACK } from "@/lib/stack-data";
import { PROBLEMS as P_QUEUE } from "@/lib/queue-data";
import { PROBLEMS as P_HASH } from "@/lib/hash-data";
import { PROBLEMS as P_BTREE } from "@/lib/binary-tree-data";
import { PROBLEMS as P_BST } from "@/lib/bst-data";
import { PROBLEMS as P_HEAP } from "@/lib/heap-data";
import { PROBLEMS as P_TRIE } from "@/lib/trie-data";
import { PROBLEMS as P_UF } from "@/lib/union-find-data";
import { PROBLEMS as P_GRAPH } from "@/lib/graph-data";
import { PROBLEMS as P_ADV } from "@/lib/advanced-data";

/* ---------- 全书题单分组 ---------- */

const GROUPS: { ch: ChapterId; problems: Problem[] }[] = [
  { ch: "array", problems: P_ARRAY },
  { ch: "string", problems: P_STRING },
  { ch: "linked-list", problems: P_LIST },
  { ch: "stack", problems: P_STACK },
  { ch: "queue", problems: P_QUEUE },
  { ch: "hash", problems: P_HASH },
  { ch: "binary-tree", problems: P_BTREE },
  { ch: "bst", problems: P_BST },
  { ch: "heap", problems: P_HEAP },
  { ch: "trie", problems: P_TRIE },
  { ch: "union-find", problems: P_UF },
  { ch: "graph", problems: P_GRAPH },
  { ch: "advanced", problems: P_ADV },
];

const TOTAL = GROUPS.reduce((s, g) => s + g.problems.length, 0);

/* ---------- 信号词 → 结构 ---------- */

const SIGNALS: { signal: string; struct: string; href: string; why: string }[] = [
  { signal: "「见过吗 / 去重 / 出现次数」", struct: "哈希表 · Set", href: "/hash", why: "O(1) 存取,用空间换时间的标准动作" },
  { signal: "「两数之和 / 配对 / 补数」", struct: "哈希表", href: "/hash", why: "一边扫一边查「我需要的另一半来过吗」" },
  { signal: "「Top-K / 第 K 大 / 最值流」", struct: "堆", href: "/heap", why: "只关心最值就别全排序,K 大用小根堆当门槛" },
  { signal: "「括号 / 嵌套 / 撤销 / 最近的」", struct: "栈", href: "/stack", why: "最近的先处理 = LIFO" },
  { signal: "「下一个更大 / 更小元素」", struct: "单调栈", href: "/stack", why: "被新元素弹掉的那一刻,答案就诞生了" },
  { signal: "「滑动窗口的最大 / 最小值」", struct: "单调队列", href: "/queue", why: "两端都要动,窗口最值的唯一 O(n) 解" },
  { signal: "「连续子数组 / 子串」", struct: "滑动窗口 / 前缀和", href: "/array", why: "窗口内维护可增量更新的量;涉及和就上前缀和" },
  { signal: "「有序数组里找 xx」", struct: "二分查找", href: "/array", why: "有序 + 随机访问 = 每步砍一半" },
  { signal: "「原地删除 / 移动元素」", struct: "双指针", href: "/array", why: "读写分离,slow 左边是已整理区" },
  { signal: "「第 k 个节点 / 环 / 中点」", struct: "链表快慢指针", href: "/linked-list", why: "步差和速差就是答案" },
  { signal: "「前缀 / 自动补全 / 以 xx 开头」", struct: "Trie", href: "/trie", why: "哈希答不了前缀,Trie 按路径共享前缀" },
  { signal: "「朋友圈 / 岛屿合并 / 连通分量」", struct: "并查集", href: "/union-find", why: "只问分组不问路径,near-O(1) 合并查询" },
  { signal: "「先修课 / 依赖 / 编译顺序」", struct: "拓扑排序", href: "/graph", why: "DAG 上按入度剥洋葱" },
  { signal: "「最短路径 / 最少步数」", struct: "BFS / Dijkstra", href: "/graph", why: "无权 BFS 天生最短;带权交给 Dijkstra" },
  { signal: "「范围查询 + 有序遍历」", struct: "BST / TreeMap", href: "/bst", why: "红黑树 O(log n) 全家桶,中序即有序" },
  { signal: "「区间和 / 最值,还要改」", struct: "线段树 / BIT", href: "/advanced", why: "前缀和怕修改,分治树两头兼顾" },
  { signal: "「缓存淘汰 / 最近使用」", struct: "LRU:哈希+双向链表", href: "/advanced", why: "哈希定位 + 链表排新旧,两个 O(1) 拼出来" },
];

/* ---------- 终极测验 ---------- */

const QUIZ: QuizItem[] = [
  {
    type: "choice",
    q: "校验代码编辑器里的括号是否配对(可能多层嵌套),选什么结构?",
    opts: ["栈", "队列", "哈希表", "二叉搜索树"],
    correct: 0,
    wrong: [
      undefined,
      "队列是先来先处理 —— 但括号要匹配的是「最近的那个左括号」,顺序正好相反。",
      "哈希能数出左右括号数量相等,但数不出顺序:)( 也会被它放过。",
      "这里没有「有序查找」的需求,杀鸡用牛刀还杀不对。",
    ],
    why: "「最近打开的最先闭合」= LIFO,栈的定义级应用(LC 20)。",
  },
  {
    type: "choice",
    q: "客服系统要求:永远先服务等待时间最长的用户。选什么?",
    opts: ["队列", "栈", "数组 + 每次遍历找最早", "哈希表"],
    correct: 0,
    wrong: [
      undefined,
      "栈会先服务最新来的 —— 等最久的老用户会被饿死。",
      "能做但每次 O(n);队列出队 O(1),这正是它存在的意义。",
      "哈希表没有任何顺序概念。",
    ],
    why: "先来先服务 = FIFO = 队列。若改成「VIP 优先」,才升级成优先队列(堆)。",
  },
  {
    type: "choice",
    q: "实时游戏排行榜,只展示前 100 名,玩家分数不断刷新流入。选什么?",
    opts: ["容量 100 的小根堆", "每次全量排序", "栈", "并查集"],
    correct: 0,
    wrong: [
      undefined,
      "每次 O(n log n) 排序,而你只关心 100 个名额 —— 堆把它压到 O(log 100)。",
      "栈只管最近,不管最大。",
      "并查集处理连通分组,和排名无关。",
    ],
    why: "Top-K 标准解:小根堆当门槛,堆顶是第 100 名,新分数比它高才进堆(O(log K))。",
  },
  {
    type: "choice",
    q: "社交产品:不断有人互加好友,同时要秒答「A 和 B 是否在同一朋友圈」。选什么?",
    opts: ["并查集", "每次 BFS 遍历", "哈希表存好友对", "二叉树"],
    correct: 0,
    wrong: [
      undefined,
      "每问一次遍历一次 O(V+E);并查集把合并与查询都压到近乎 O(1)。",
      "哈希只能查「直接好友」,答不了「朋友的朋友的朋友」。",
      "朋友关系不是层级结构。",
    ],
    why: "动态合并 + 连通性查询 = 并查集的定义级场景(路径压缩 + 按秩合并)。",
  },
  {
    type: "choice",
    q: "搜索框输入「app」要立刻提示 apple、application…选什么?",
    opts: ["前缀树 Trie", "哈希表", "有序数组 + 二分", "堆"],
    correct: 0,
    wrong: [
      undefined,
      "哈希表查整词 O(1),但「所有以 app 开头的词」它只能全表扫描。",
      "能做(二分到第一个 ≥ app 的词再顺序收集),但插入新词是 O(n);Trie 插入查询都是 O(词长)。",
      "堆只关心最值,和前缀无关。",
    ],
    why: "「前缀」两个字点名 Trie:沿 a→p→p 走三步,子树里全是答案。",
  },
  {
    type: "choice",
    q: "股票系统:海量成交价不断写入,同时要随时查「任意时间区间的成交量总和」。选什么?",
    opts: ["线段树 / 树状数组", "前缀和数组", "哈希表", "排序数组"],
    correct: 0,
    wrong: [
      undefined,
      "前缀和查询 O(1) 很香,但每次写入要重建整条前缀 —— 「还要改」就是它的死穴。",
      "哈希表不擅长「区间」:它连相邻都不知道。",
      "排序数组插入 O(n),区间和还是要现算。",
    ],
    why: "改 + 区间统计 = 线段树 / BIT:两者都是 O(log n) 改、O(log n) 查。",
  },
  {
    type: "choice",
    q: "选课系统要给出一个合法的修课顺序(课程有先修依赖),用什么?",
    opts: ["拓扑排序(图 + 入度)", "按课程号排序", "DFS 随便走", "并查集"],
    correct: 0,
    wrong: [
      undefined,
      "课程号和依赖无关 —— 先修关系是一张有向图。",
      "不记录入度的乱走可能先修没上就选了后续课;拓扑排序保证每门课的前置都已完成。",
      "并查集不分方向,「谁先谁后」它答不了。",
    ],
    why: "依赖排序 = DAG 上的拓扑排序(Kahn 入度法),还能顺便检测循环依赖(LC 207/210)。",
  },
  {
    type: "choice",
    q: "成绩系统:频繁插入新成绩,还要查「80 到 90 分之间有哪些学生」。选什么?",
    opts: ["TreeMap(红黑树)", "HashMap", "数组每次排序", "栈"],
    correct: 0,
    wrong: [
      undefined,
      "HashMap 查单个 key O(1),但「范围」它无能为力 —— 哈希把顺序打得粉碎。",
      "每次排序 O(n log n),TreeMap 插入 O(log n) 且天生有序。",
      "栈与查询无缘。",
    ],
    why: "有序 + 范围查询 = BST 家族(工程用 TreeMap/TreeSet):subMap/ceiling/floor 全是 O(log n)。",
  },
  {
    type: "choice",
    q: "实现「浏览器最多缓存 50 个页面,满了淘汰最久没访问的」,最优组合是?",
    opts: [
      "哈希表 + 双向链表",
      "只用哈希表,再记录每页的访问时间戳",
      "只用数组,按访问时间排序",
      "队列",
    ],
    correct: 0,
    wrong: [
      undefined,
      "找「最久未访问」要扫全表 O(n) —— 时间戳能记录但不能排序。",
      "每次访问都要重排 O(n log n),太贵。",
      "队列淘汰的是「最早进入」(FIFO),不是「最久未使用」(LRU)—— 访问过的老页面应该续命。",
    ],
    why: "LRU = 哈希(O(1) 定位)+ 双向链表(O(1) 摘除搬头):第 13 章手写过的 LC 146。",
  },
  {
    type: "choice",
    q: "无权迷宫求「最少步数」路径,该用 BFS 还是 DFS?为什么?",
    opts: [
      "BFS —— 按层扩散,第一次到达终点时走过的层数就是最短距离",
      "DFS —— 一条路走到黑更快",
      "都一样,反正都能遍历完",
      "Dijkstra —— 最短路只能用它",
    ],
    correct: 0,
    wrong: [
      undefined,
      "DFS 第一次到达终点的路径可能绕了远路,要遍历完所有路径才能确认最短。",
      "都能「到达」,但只有 BFS 保证「首达即最短」—— 这就是选型的意义。",
      "Dijkstra 是带权图的方案;无权图 BFS 就是它的特例,更简单更快。",
    ],
    why: "BFS 按距离分层,第一次碰到终点必然是最短(无权前提)。带权才升级 Dijkstra。",
  },
  {
    type: "multi",
    q: "以下哪些说法是对的?(多选,全书大串讲)",
    opts: [
      "数组、哈希表的桶、堆的存储,底层都靠「首地址 + 偏移」这条公式",
      "链表、树、图的节点都是靠引用(纸条)连起来的",
      "哈希表平均 O(1) 的前提是哈希函数均匀 + 负载因子受控",
      "所有结构里,总有一个「万能最优」的选择",
    ],
    correct: [0, 1, 2],
    missHint: "前三条分别是序章公式、引用、哈希前提 —— 再想想漏了哪条。",
    extraHint: "「万能最优」不存在:每个结构都在用一种代价换另一种收益,这正是这门课的第一课。",
    why: "数据结构 = 组织方式的交易艺术:连续换随机访问,指针换灵活插删,空间换时间 —— 没有银弹,只有匹配。",
  },
];

/* ---------- 页面 ---------- */

const CHIPS = [
  { id: "decision", n: "01", label: "决策树" },
  { id: "signals", n: "02", label: "信号词表" },
  { id: "bigtable", n: "03", label: "终极复杂度表" },
  { id: "problems", n: "04", label: "全书题单" },
  { id: "next", n: "05", label: "下一步" },
  { id: "quiz", n: "06", label: "终极测验" },
];

const CHEAT: { name: string; href: string; ops: [string, string, string, string]; space: string; note: string }[] = [
  { name: "数组", href: "/array", ops: ["1", "n", "n", "n"], space: "n", note: "有序时查找 O(log n)" },
  { name: "动态数组", href: "/array", ops: ["1", "n", "n", "n"], space: "n", note: "尾插均摊 O(1)" },
  { name: "链表", href: "/linked-list", ops: ["n", "n", "1", "1"], space: "n", note: "插删 O(1) 需已持有位置" },
  { name: "栈", href: "/stack", ops: ["—", "—", "1", "1"], space: "n", note: "只碰顶端" },
  { name: "队列 / Deque", href: "/queue", ops: ["—", "—", "1", "1"], space: "n", note: "两端 O(1)" },
  { name: "哈希表", href: "/hash", ops: ["—", "1", "1", "1"], space: "n", note: "平均;最坏 O(n)" },
  { name: "二叉搜索树(平衡)", href: "/bst", ops: ["logn", "logn", "logn", "logn"], space: "n", note: "退化最坏 O(n);中序即有序" },
  { name: "堆", href: "/heap", ops: ["1", "n", "logn", "logn"], space: "n", note: "访问=看堆顶;建堆 O(n)" },
  { name: "Trie", href: "/trie", ops: ["—", "1", "1", "—"], space: "Σ词长", note: "复杂度按词长 L 计" },
  { name: "并查集", href: "/union-find", ops: ["—", "1", "1", "—"], space: "n", note: "近似 O(α(n)) ≈ O(1)" },
  { name: "图(邻接表)", href: "/graph", ops: ["—", "—", "1", "—"], space: "V+E", note: "遍历 O(V+E)" },
  { name: "线段树 / BIT", href: "/advanced", ops: ["—", "logn", "logn", "—"], space: "n", note: "区间查询+单点修改" },
];

export default function AtlasChapter() {
  const { totalProblems } = useProgress();
  const done = Math.min(totalProblems, TOTAL);
  const pct = TOTAL > 0 ? Math.round((done / TOTAL) * 100) : 0;

  return (
    <main className="page" data-ch="atlas">
      <Hero
        ch="atlas"
        title={
          <>
            终章 <span className="grad">选型地图</span>
          </>
        }
        essence={
          <>
            十三种结构都认识了,最后一课只教一件事:<strong>看到问题的那一刻,
            你脑子里应该亮起哪盏灯</strong>。选型没有玄学 —— 把操作需求列出来,
            对着价格表挑就是了。
          </>
        }
        chips={CHIPS}
      />

      {/* §01 决策树 */}
      <Section
        id="decision"
        index="01"
        title="选型决策树"
        desc="拿到任何题,先走一遍这棵树 —— 走多了,它会长在你脑子里"
      >
        <DecisionLab />
        <Callout tone="idea" title="决策树的正确用法">
          <p>
            它不是标准答案,是<b>提问顺序</b>:先问「核心动作是什么」,再问「要不要有序 /
            前缀 / 动态修改」。真实题目常常要<b>组合</b>(LRU = 哈希+链表;
            前 K 个高频 = 哈希+堆)—— 先各自选型,再拼积木。
          </p>
        </Callout>
      </Section>

      {/* §02 信号词 */}
      <Section
        id="signals"
        index="02"
        title="信号词雷达:题目在向你眨眼"
        desc="LeetCode 题面里的这些词,就是结构在自报家门"
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>题面信号</th>
                <th>该亮的灯</th>
                <th>为什么</th>
              </tr>
            </thead>
            <tbody>
              {SIGNALS.map((s) => (
                <tr key={s.signal}>
                  <td className="atl-signal">{s.signal}</td>
                  <td>
                    <Link href={s.href}>
                      <b>{s.struct}</b>
                    </Link>
                  </td>
                  <td>{s.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* §03 终极复杂度表 */}
      <Section
        id="bigtable"
        index="03"
        title="终极复杂度表"
        desc="序章那张表的完全体 —— 现在每一格你都能讲出为什么"
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>结构</th>
                <th>访问</th>
                <th>查找</th>
                <th>插入</th>
                <th>删除</th>
                <th>空间</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              {CHEAT.map((r) => (
                <tr key={r.name}>
                  <td>
                    <Link href={r.href}>
                      <b>{r.name}</b>
                    </Link>
                  </td>
                  {r.ops.map((v, i) =>
                    v === "—" ? (
                      <td key={i} className="dim">
                        —
                      </td>
                    ) : (
                      <td key={i}>
                        <BigO o={v} />
                      </td>
                    ),
                  )}
                  <td className="mono" style={{ fontSize: 12 }}>
                    O({r.space})
                  </td>
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* §04 全书题单 */}
      <Section
        id="problems"
        index="04"
        title={`全书题单总表:${TOTAL} 题`}
        desc="十三章的高频题全在这里,进度与各章互通 —— 这就是你的刷题地图"
      >
        <div className="atl-banner">
          <div>
            <div className="big">
              {done}
              <span style={{ fontSize: 20, opacity: 0.6 }}> / {TOTAL}</span>
            </div>
            <div className="sub">已完成 {pct}%</div>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="sub">
            建议节奏:每章先把 Easy 扫完建立手感,<br />
            二刷只做 Medium,三刷限时。
          </div>
        </div>
        {GROUPS.map((g) => {
          const meta = CHAPTERS.find((c) => c.id === g.ch)!;
          return (
            <Reveal key={g.ch}>
              <div className="atl-group">
                <div
                  className="atl-group-head"
                  style={{ "--gh": meta.hue } as React.CSSProperties}
                >
                  <span className="atl-group-num">{meta.num}</span>
                  <span className="atl-group-title">{meta.title}</span>
                  <Link href={meta.href} className="chip">
                    去复习 →
                  </Link>
                  <span className="atl-group-count">
                    {g.problems.length} 题
                  </span>
                </div>
                <ProblemSet ch={g.ch} items={g.problems} />
              </div>
            </Reveal>
          );
        })}
      </Section>

      {/* §05 下一步 */}
      <Section
        id="next"
        index="05"
        title="学完之后,路通向哪里"
        desc="数据结构是名词,算法是动词 —— 你已经握着全部名词了"
      >
        <div className="grid-2">
          <div className="card hoverable">
            <div className="card-kicker">NEXT 01</div>
            <div className="card-title">🧮 算法专题</div>
            <p>
              沿着本课的伏笔继续:二分的边界变体(旋转数组/答案二分)→
              回溯(递归树,你在二叉树章练过的思维)→ 贪心 → 动态规划
              (Kadane 你已经会了,它就是 DP)。每个专题都建立在你手里的结构上。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">NEXT 02</div>
            <div className="card-title">🏗 系统设计</div>
            <p>
              把结构放大一万倍:哈希 → 一致性哈希与分片;跳表 → Redis zset;
              B+ 树 → 数据库索引;布隆过滤器 → 缓存穿透防护;队列 → Kafka。
              这门课的每个 Callout「工程现场」都是入口。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">NEXT 03</div>
            <div className="card-title">✍️ 刷题闭环</div>
            <p>
              回到 §04 的总表:先扫 Easy 建手感,再限时刷 Medium。
              每道题做完问三句:复杂度多少?为什么能优化?换个数据结构会怎样?
              —— 面试考的就是这三句。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">NEXT 04</div>
            <div className="card-title">🔁 间隔复习</div>
            <p>
              一周后重走一遍每章的「通关测验」,一个月后只看每章的 KeyPoints
              要点卡。侧栏的绿灯会陪你记录这一切 —— 遗忘曲线不可怕,复习节奏对就行。
            </p>
          </div>
        </div>
      </Section>

      {/* §06 终极测验 */}
      <Section
        id="quiz"
        index="06"
        title="终极测验:11 道跨章选型题"
        desc="不考定义,只考选型 —— 这才是面试真正的样子"
        badge={<span className="chip">✎ 全书大考</span>}
      >
        <Quiz ch="atlas" items={QUIZ} />
      </Section>

      <KeyPoints
        title="全书最后一张要点卡"
        points={[
          <>
            选型三步:<b>列出操作需求 → 标出频率最高的操作 → 对着复杂度表挑
            让它最便宜的结构</b>。
          </>,
          <>
            两条物理直觉贯穿一切:连续内存靠<b>「首地址+偏移」公式</b>(数组/哈希桶/堆),
            离散内存靠<b>引用纸条</b>(链表/树/图)。
          </>,
          <>
            复杂题拼积木:LRU = 哈希+双向链表;前 K 高频 = 哈希+堆;
            单词搜索 = Trie+回溯 —— <b>先各自选型,再组合</b>。
          </>,
          <>
            没有万能结构:每个 O(1) 都在别处付了账。能讲清楚<b>「我为什么不用 X」</b>,
            比会用 X 更能打动面试官。
          </>,
          <>
            这门课的终点是你的起点:题单总表刷三遍,每章绿灯点满 ——
            然后,去外面的世界考试吧。🎓
          </>,
        ]}
      />

      <ChapterFooter ch="atlas" />
    </main>
  );
}
