"use client";

// 第 10 章 · 前缀树(Trie / 字典树)
// 结构:为什么需要它 → 内存结构 → 操作与复杂度 → 手写实现 → 三语言对照 →
// 套路与三道精讲(LC 208 / 211 / 212)→ 高频题单 → 通关测验 → 要点。

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
import { PROBLEMS, QUIZ } from "@/lib/trie-data";
import {
  TrieLab,
  StaticTrie,
  TrieStepper,
  type TStepNode,
  type TStepFrame,
} from "./viz";
import "./chapter.css";

/* ================= 精讲 A · LC 208 逐帧数据(app / apple) ================= */

const A208_NODES: TStepNode[] = [
  { id: 0, ch: "", x: 120, y: 44 },
  { id: 1, ch: "a", x: 205, y: 112 },
  { id: 2, ch: "p", x: 290, y: 180 },
  { id: 3, ch: "p", x: 375, y: 248, isEnd: true, word: "app" },
  { id: 4, ch: "l", x: 460, y: 316 },
  { id: 5, ch: "e", x: 545, y: 384, isEnd: true, word: "apple" },
];
const A208_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
];
const A208_FRAMES: TStepFrame[] = [
  {
    lit: [0, 1, 2, 3],
    ok: [3],
    dim: [4, 5],
    msg: (
      <>
        insert(<b>&quot;app&quot;</b>):从 root 出发,a、p、p 依次不存在就新建节点连上边。
        走到最后一个 p,把它的 <b>isEnd = true</b> —— 这一步才真正宣告「app 是一个单词」。
      </>
    ),
  },
  {
    lit: [0, 1, 2, 3],
    ok: [4, 5],
    msg: (
      <>
        insert(<b>&quot;apple&quot;</b>):前三个字母 a-p-p <b>已经存在,直接复用</b>(这正是 Trie
        省空间的关键 —— 相同开头只存一份),只需在 p 后面新建 l、e 两个节点,末节点 e 标 isEnd。
      </>
    ),
  },
  {
    lit: [0, 1, 2],
    ok: [3],
    dim: [4, 5],
    msg: (
      <>
        search(<b>&quot;app&quot;</b>):沿 a-p-p 一路走到底,该节点 <b>isEnd = true</b> → 返回{" "}
        <b>true</b>。全程只看了 3 步 = 单词长度。
      </>
    ),
  },
  {
    lit: [0, 1],
    pre: [2],
    dim: [3, 4, 5],
    msg: (
      <>
        search(<b>&quot;ap&quot;</b>):路径确实走得通,但停在的节点 <b>isEnd = false</b> —— ap
        只是别人的前缀,不是插入过的单词。所以 <b>search 返回 false</b>,而 startsWith(&quot;ap&quot;)
        会返回 <b>true</b>。这一格之差,就是「精确匹配」和「前缀匹配」的分水岭。
      </>
    ),
  },
  {
    lit: [0, 1, 2, 3, 4],
    ok: [5],
    msg: (
      <>
        search(<b>&quot;apple&quot;</b>):a-p-p-l-e 一路走到 e,isEnd = true → <b>true</b>。
      </>
    ),
  },
  {
    bad: [0],
    dim: [1, 2, 3, 4, 5],
    msg: (
      <>
        search(<b>&quot;banana&quot;</b>):root 的 children 里根本没有 &apos;b&apos; 这条边 → 第一步就断路,
        <b>立刻返回 false</b>。整个查询只花了 1 步 —— 哪怕树里存了一百万个词,也一样快。
      </>
    ),
  },
];

/* ================= 精讲 B · LC 211 逐帧数据(bad / dad / mad,搜 ".ad") ============ */

const A211_NODES: TStepNode[] = [
  { id: 0, ch: "", x: 320, y: 42 },
  { id: 1, ch: "b", x: 140, y: 120 },
  { id: 2, ch: "a", x: 140, y: 196 },
  { id: 3, ch: "d", x: 140, y: 272, isEnd: true, word: "bad" },
  { id: 4, ch: "d", x: 320, y: 120 },
  { id: 5, ch: "a", x: 320, y: 196 },
  { id: 6, ch: "d", x: 320, y: 272, isEnd: true, word: "dad" },
  { id: 7, ch: "m", x: 500, y: 120 },
  { id: 8, ch: "a", x: 500, y: 196 },
  { id: 9, ch: "d", x: 500, y: 272, isEnd: true, word: "mad" },
];
const A211_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [4, 5],
  [5, 6],
  [0, 7],
  [7, 8],
  [8, 9],
];
const A211_FRAMES: TStepFrame[] = [
  {
    lit: [0, 1, 4, 7],
    msg: (
      <>
        search(<b>&quot;.ad&quot;</b>),第 1 个字符是通配符 <b>&apos;.&apos;</b>:它能匹配任意字母,所以
        root 底下 <b>b / d / m 三条边都得试</b> —— DFS 在这里第一次分叉。
      </>
    ),
  },
  {
    lit: [0, 1, 4, 7, 2, 5, 8],
    msg: (
      <>
        第 2 个字符是普通的 <b>&apos;a&apos;</b>:三条分支各自沿 a 边下沉一层,分别到达 bad、dad、mad
        路径上的 a 节点。普通字符不分叉,只走对应那一条边。
      </>
    ),
  },
  {
    lit: [0, 1, 4, 7, 2, 5, 8],
    ok: [3, 6, 9],
    msg: (
      <>
        第 3 个字符 <b>&apos;d&apos;</b>:三条路都到达 <b>isEnd</b> 节点 → &quot;.ad&quot; 同时命中{" "}
        <b>bad、dad、mad</b>。&apos;.&apos; 让一次 search 在树里「开枝散叶」地并行搜索;最坏(全是点)
        每层要遍历所有 child,这就是通配符的代价。
      </>
    ),
  },
];

/* ================= 页面 ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: "为什么需要它" },
  { id: "structure", n: "02", label: "内存结构" },
  { id: "ops", n: "03", label: "操作与复杂度" },
  { id: "build", n: "04", label: "手写实现" },
  { id: "langs", n: "05", label: "三语言对照" },
  { id: "patterns", n: "06", label: "套路与精讲" },
  { id: "problems", n: "07", label: "高频题单" },
  { id: "quiz", n: "08", label: "通关测验" },
];

export default function TrieChapter() {
  return (
    <main className="page" data-ch="trie">
      <Hero
        ch="trie"
        title={
          <>
            前缀树 <span className="grad">Trie</span>
          </>
        }
        essence={
          <>
            把一万个单词<strong>叠</strong>成一棵树,让所有相同的开头只存一份。它用「每个字符一个节点」
            的空间,换来一件哈希表做不到的事:<strong>以某段开头为线索,秒答「都有哪些词」</strong>。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 为什么 ================= */}
      <Section
        id="intuition"
        index="01"
        title="为什么需要它:哈希表答不了「以 ca 开头的有哪些」"
        desc="搜索框补全、输入法联想 —— 这类「前缀」需求,是 Trie 的专属战场"
      >
        <div className="prose">
          <p>
            打开任意一个搜索框,敲下 <code>ca</code>,下面立刻弹出一列建议:
            cat、car、card、camera、cambridge……你还没打完,它已经猜到你想要什么。
            输入法的联想、IDE 的代码补全、通讯录按姓氏筛选,背后都是同一个问题:
            <strong>给我一段开头,把所有以它打头的词找出来。</strong>
          </p>
          <p>
            第 6 章的<strong>哈希表(hash table)</strong>是查找之王 —— 判断「
            <code>cat</code> 在不在词典里」,它把整个单词打散成一个哈希值,一步 O(1) 命中。
            可正是这个「打散」,让它在前缀问题上彻底失灵:<code>cat</code> 和{" "}
            <code>car</code> 的哈希值天各一方,哈希表<strong>根本不知道它俩共享 ca 这个开头</strong>。
            想找「以 ca 开头的词」,它只能把整张表 N 个词<strong>全部遍历一遍</strong>,一个个看开头 ——
            O(N·L)。词典越大越慢,这跟「查找之王」的人设完全相反。
          </p>
          <Callout tone="idea" title="问题出在哪:信息在存进去的那一刻就被丢了">
            <p>
              哈希表为了 O(1),故意抹掉了 key 之间的<b>结构关系</b> —— 它只关心「相等」,不关心「相似」。
              而「前缀」恰恰是一种结构关系。要高效回答前缀问题,就得换一种存法:
              <b>让共享开头的词,在物理上也住在一起。</b>这就是 Trie 的全部动机。
            </p>
          </Callout>
          <p>
            Trie 的主意朴素得像小学生:把 <code>cat、car、card</code> 三个词竖着写,
            你会发现它们的开头 <code>ca</code> 一模一样 —— 那就<strong>只写一次</strong>,
            在 <code>a</code> 之后再分叉。一万个单词这么「叠」起来,相同的每一段开头都只存一份,
            就长成了一棵树。从根走到某个节点,一路读下来的字符<strong>就是一个前缀</strong>;
            想找「以 ca 开头的词」?走到 ca 那个节点,<strong>它底下整棵子树就是答案</strong>,
            不用看别人一眼。
          </p>
        </div>

        <StaticTrie
          words={["car", "card", "cat", "dog"]}
          caption={
            <>
              car、card、cat、dog 四个词叠成的 Trie。<b>car / card / cat 共享 c-a 这段开头</b>(只存一份),
              到 a 之后才分叉;dog 开头不同,自成一支。绿色双圈 = 某个单词在此结束(isEnd)。
              注意 <b>car 结束的 r 节点还长着孩子</b>(通向 card)—— 记住这个细节,§02 会用它解释一个关键设计。
            </>
          }
        />

        <div className="grid-3" style={{ marginTop: 22 }}>
          <div className="card hoverable">
            <div className="card-kicker">特性 01</div>
            <div className="card-title">边是字符,路径是前缀</div>
            <p>
              树的每条边贴着一个字符,从根到任意节点<b>一路拼起来就是一个前缀</b>。
              「查前缀」在别处是难题,在 Trie 里退化成「顺着路往下走」。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">特性 02</div>
            <div className="card-title">共享开头,天然省空间</div>
            <p>
              所有相同的开头只存一份。词典里前缀重叠越多(英文单词、URL、文件路径),
              叠得越省。这也是它另一个名字<b>「字典树」</b>的由来。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">特性 03</div>
            <div className="card-title">⚡ 快慢只看词长,不看词数</div>
            <p>
              插入 / 查询一个词的代价 = <b>词的长度 L</b>,和词典里已经有 10 个还是 1000 万个词
              <b>完全无关</b>。这是 Trie 最反直觉的核心能力,§03 细讲。
            </p>
          </div>
        </div>

        <Callout tone="story" title="名字的来历:它到底读 “try” 还是 “tree”?">
          <p>
            Trie 一词由 Edward Fredkin 在 1960 年提出,取自单词 re<b>trie</b>val(检索)的中间四个字母。
            于是尴尬来了:按词源该读作 “tree”,但那样就和 tree(树)撞音了 —— 所以大多数人读它作
            “try”,以示区别。你会两种读法都听到,不必纠结,知道它就是「字典树 / 前缀树」即可。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 结构 ================= */}
      <Section
        id="structure"
        index="02"
        title="内存里的样子:节点 = 一排孩子 + 一个 isEnd 标记"
        desc="一个 Trie 节点长什么样?为什么非要那个 isEnd 布尔位不可?"
      >
        <div className="prose">
          <p>
            先看单个节点。回忆第 7 章二叉树的节点是「值 + 左孩子 + 右孩子」;Trie 节点连自己的「值」都不存,
            它只有两样东西:
          </p>
          <ul>
            <li>
              <strong>children(孩子表)</strong>:从「字符」到「子节点」的映射。二叉树固定两个孩子,
              Trie 的孩子数 = 字符集大小。只处理小写英文,就是最多 26 个孩子;可以用一个长度 26 的数组
              <code>TrieNode[26]</code>(下标 = 字母 − &apos;a&apos;),也可以用一张哈希表{" "}
              <code>Map&lt;字符, 节点&gt;</code>。两种选择的取舍留到 §03。
            </li>
            <li>
              <strong>isEnd(结束标记)</strong>:一个布尔位,回答「<b>到我这里,是否正好是一个完整单词的结尾</b>」。
            </li>
          </ul>
          <p>
            注意一个反直觉的点:<strong>字符不是存在节点里,而是「贴在边上」</strong>。或者等价地说,
            节点是靠「父亲用哪个字符找到它」来标识的。根节点(root)不代表任何字符,它是所有词共同的起点 ——
            一个空前缀。从根往下走 k 条边,读到的 k 个字符,就是一个长度为 k 的前缀。
          </p>
        </div>

        <Callout tone="warn" title="isEnd 为什么是必需的?看 cat 与 cattle">
          <p>
            假设 Trie 里插了 <code>cat</code> 和 <code>cattle</code>。因为 cat 是 cattle 的开头,
            走 c-a-t 到达的那个「t」节点,<b>底下还挂着孩子</b>(继续接 t-l-e 通向 cattle)。
            现在问:<code>cat</code> 是一个词吗?如果没有 isEnd,你<b>无从判断</b> —— 光看「t 节点有没有孩子」
            没用,它明明有孩子(为了 cattle),可 cat 确确实实是个词。反过来,
            <code>catt</code> 走得通、也有孩子,却<b>不是</b>词。唯一能区分的,就是在 t 节点上
            立一块牌子 <b>isEnd = true</b>:「一个单词到此为止」。
          </p>
        </Callout>

        <StaticTrie
          words={["cat", "cattle"]}
          emphasize={["cat"]}
          caption={
            <>
              cat 与 cattle 共享 c-a-t。绿色高亮的 <b>t 节点 isEnd = true</b>(「cat 是个词」),
              但它<b>同时还有孩子</b>继续通向 cattle。没有 isEnd 这块牌子,你就分不清一个走得通的路径
              到底是「一个真单词」还是「只是路过的前缀」。
            </>
          }
        />

        <div className="prose" style={{ marginTop: 8 }}>
          <p>
            概念都齐了,不如亲手玩一棵。下面这个实验室里已经住着 5 个词,你可以插入新词看它「长」出来
            (注意相同开头会被复用),也可以查询单词或前缀,观察路径怎么逐节点点亮,
            以及三种截然不同的结局:<b>命中完整单词</b>、<b>是前缀但不是单词</b>、<b>中途断路未命中</b>。
          </p>
        </div>

        <TrieLab />

        <Callout tone="deep" title="工程现场:它比你想的更常见">
          <p>
            Trie 藏在你每天用的东西里:搜索引擎和输入法的<b>自动补全</b>、路由器和 IP 网络里的
            <b>最长前缀匹配</b>(把 IP 前缀做成 Trie 转发路由)、拼写检查、以及数据库和文件系统里
            压缩过的 <b>Radix Tree / 基数树</b>(把「只有一个孩子的链」压成一条边的 Trie 变体,
            Redis、Linux 内核页表都在用)。理解了朴素 Trie,这些高级变体只是它的「压缩版」。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 操作与复杂度 ================= */}
      <Section
        id="ops"
        index="03"
        title="操作与复杂度:三个方法,一句「沿路径走」"
        desc="insert / search / startsWith 全都 O(L) —— 这个 L 是词长,不是词数"
        badge={<span className="chip" data-tone="warn">★ 核心结论</span>}
      >
        <div className="prose">
          <p>
            Trie 的三个招牌操作,骨架完全一样:<strong>从根出发,拿着输入串的字符一个个往下走</strong>。
            区别只在「走的过程中怎么处理缺口」和「走到终点后看什么」:
          </p>
          <ul>
            <li>
              <strong>insert(word)</strong>:沿字符走,遇到缺失的 child <b>就新建一个</b>接上;
              走完把末节点 <code>isEnd = true</code>。
            </li>
            <li>
              <strong>search(word)</strong>:沿字符走,<b>中途缺 child 立刻返回 false</b>;
              走到底后,<b>还要检查末节点 isEnd</b> 是否为 true(否则只是前缀,不算命中)。
            </li>
            <li>
              <strong>startsWith(prefix)</strong>:和 search 一样走,但<b>走得通就返回 true,不看 isEnd</b>。
            </li>
          </ul>
        </div>

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>操作</th>
                <th>复杂度(L = 输入串长度)</th>
                <th>为什么</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>insert(word)</b></td>
                <td><BigO o="n" label="O(L)" /></td>
                <td>沿 L 个字符各走一步,缺一个建一个,最多建 L 个节点</td>
              </tr>
              <tr>
                <td><b>search(word)</b></td>
                <td><BigO o="n" label="O(L)" /></td>
                <td>最多走 L 步到底,再看一眼末节点 isEnd</td>
              </tr>
              <tr>
                <td><b>startsWith(prefix)</b></td>
                <td><BigO o="n" label="O(L)" /></td>
                <td>走到前缀末节点即可,连 isEnd 都不用看</td>
              </tr>
              <tr>
                <td><b>delete(word)</b></td>
                <td><BigO o="n" label="O(L)" /></td>
                <td>走到词尾把 isEnd 清掉;若要回收,自底向上删「没孩子又非词尾」的节点</td>
              </tr>
              <tr>
                <td>「以 X 开头的<b>所有</b>词」</td>
                <td><BigO o="n" label="O(L + k)" /></td>
                <td>O(L) 走到前缀节点,再 DFS 收集子树里 k 个词</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout tone="win" title="把这句话刻进脑子:复杂度与词典大小无关">
          <p>
            每一步是一次 child 查找(数组下标 O(1),或哈希表均摊 O(1))。走多少步?就 L 步 ——
            <b>输入这个词有多长</b>。词典里是 10 个词还是 5000 万个词,查 <code>apple</code>{" "}
            永远是 5 步。哈希表也是 O(L)(它要读完整个 key 才能算哈希),但 Trie 白送了
            <b>前缀查询</b>这个哈希表给不了的能力。这就是「复杂度只由词长决定」的含义,
            也是几乎所有 Trie 面试题的题眼。
          </p>
        </Callout>

        <h3 className="sec-title" style={{ fontSize: 19, marginTop: 32 }}>
          空间的代价:26 叉数组 vs 哈希表
        </h3>
        <div className="prose">
          <p>
            天下没有免费的午餐。Trie 的时间核心能力,是拿<strong>空间</strong>换的 —— 每个字符都要一个节点,
            而每个节点都得带一张 children 表。这张表怎么存,是 Trie 唯一真正的设计抉择:
          </p>
        </div>
        <div className="grid-2" style={{ marginTop: 6 }}>
          <div className="card">
            <div className="card-title">26 叉数组 TrieNode[26]</div>
            <p>
              下标 = <code>字符 − &apos;a&apos;</code>,访问一步到位,常数极小、最快。
              代价:<b>不管有几个孩子,每个节点都硬占 26 个指针槽</b>。词稀疏时(比如只有几个词),
              绝大多数槽是空的,内存浪费惊人。适合:字符集小而固定(纯小写字母)、追求极致速度的刷题场景。
            </p>
          </div>
          <div className="card">
            <div className="card-title">哈希表 Map&lt;字符, 节点&gt;</div>
            <p>
              <b>有几个孩子就存几个</b>,按需分配,稀疏时省下大量内存;而且天然支持大小写混合、
              Unicode、中文等任意字符集,不受 26 限制。代价:哈希的常数比数组下标略大。
              适合:字符集大 / 不定、或数据稀疏、工程通用场景。
            </p>
          </div>
        </div>

        <h3 className="sec-title" style={{ fontSize: 19, marginTop: 32 }}>
          正面对决:哈希表 vs Trie
        </h3>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>能力 / 场景</th>
                <th>哈希表(HashSet / HashMap)</th>
                <th>Trie(前缀树)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>精确查「某个词在不在」</td>
                <td><span className="tr-vs-yes">✓</span> 均摊 O(L)</td>
                <td><span className="tr-vs-yes">✓</span> O(L)</td>
              </tr>
              <tr>
                <td><b>前缀查「以 X 开头有哪些」</b></td>
                <td><span className="tr-vs-no">✗</span> 只能遍历全表 O(N·L)</td>
                <td><span className="tr-vs-yes">✓</span> O(L) 直达子树,再收集</td>
              </tr>
              <tr>
                <td>按字典序输出所有词</td>
                <td><span className="tr-vs-no">✗</span> 无序,需额外排序</td>
                <td><span className="tr-vs-yes">✓</span> DFS(按 a→z)天然有序</td>
              </tr>
              <tr>
                <td>空间</td>
                <td>紧凑,每个词独立存</td>
                <td>共享前缀省一截,但「每字符一节点 + 指针」开销大</td>
              </tr>
              <tr>
                <td>实现</td>
                <td>语言内置,拿来即用</td>
                <td>通常要手写(§04)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="viz-msg">
          一句话选型:<b>只问「在不在」用哈希表;一旦出现「前缀 / 开头 / 补全 / 共同开头」,就该 Trie 登场。</b>
        </p>
      </Section>

      {/* ================= §04 手写实现 ================= */}
      <Section
        id="build"
        index="04"
        title="手写一个 Trie(这就是 LC 208 原题)"
        desc="不到 40 行,亲手造出搜索补全的内核 —— children 用哈希表版打底,注释里给 26 叉数组版差异"
      >
        <div className="prose">
          <p>
            这一节写的代码,<strong>逐字就是 LeetCode 208「实现 Trie」的满分答案</strong>。
            三个方法(insert / search / startsWith)全靠一个私有小工具 <code>find</code>
            —— 它把「沿路径走,缺就返回空」这段公共逻辑抽出来,search 和 startsWith 都调它,只在最后一步分道扬镳。
            对着注释读一遍,再盖住自己默写一遍 insert,你就拥有它了。
          </p>
        </div>
        <CodeTabs
          title="Trie"
          java={{
            code: `// LC 208 · 用哈希表存 children(通用版,字符集不受限)
class Trie {
    // 一个节点:一张「字符 → 子节点」表 + 一个「我是词尾吗」的布尔位
    static class Node {
        Map<Character, Node> children = new HashMap<>();
        boolean isEnd = false;
    }

    private final Node root = new Node();   // 根 = 空前缀,不代表任何字符

    public void insert(String word) {
        Node cur = root;
        for (char c : word.toCharArray()) {
            // 没有这条边就现建一个;computeIfAbsent 帮我们「查不到就放进去」
            cur = cur.children.computeIfAbsent(c, k -> new Node());
        }
        cur.isEnd = true;                   // 走到词尾,立牌子
    }

    public boolean search(String word) {
        Node node = find(word);
        return node != null && node.isEnd;  // 关键:走得到 + 是词尾,才算命中
    }

    public boolean startsWith(String prefix) {
        return find(prefix) != null;        // 走得到就行,不管是不是词尾
    }

    // 沿字符串走,返回终点节点;中途断路则返回 null
    private Node find(String s) {
        Node cur = root;
        for (char c : s.toCharArray()) {
            cur = cur.children.get(c);
            if (cur == null) return null;   // 这条边不存在 → 断路
        }
        return cur;
    }
}`,
            note: (
              <>
                <b>26 叉数组版差异:</b>把 <code>Map&lt;Character, Node&gt;</code> 换成{" "}
                <code>Node[] children = new Node[26]</code>,用 <code>c - &apos;a&apos;</code> 当下标即可 ——
                更快、常数更小,但每个节点固定占 26 个指针,词稀疏时费内存。刷纯小写字母题常用数组版。
              </>
            ),
            hl: [15, 21, 26],
          }}
          python={{
            code: `# LC 208 · 用 dict 存 children(每个 Trie 实例既是节点也是子树)
class Trie:
    def __init__(self):
        self.children: dict[str, "Trie"] = {}   # 字符 → 子节点
        self.is_end = False                      # 我是不是某个词的结尾

    def insert(self, word: str) -> None:
        node = self
        for c in word:
            if c not in node.children:           # 没这条边就现建
                node.children[c] = Trie()
            node = node.children[c]
        node.is_end = True                       # 词尾立牌子

    def search(self, word: str) -> bool:
        node = self._find(word)
        return node is not None and node.is_end  # 走得到 + 是词尾

    def startsWith(self, prefix: str) -> bool:
        return self._find(prefix) is not None    # 走得到就行

    def _find(self, s: str):
        node = self
        for c in s:
            if c not in node.children:
                return None                      # 断路
            node = node.children[c]
        return node`,
            note: (
              <>
                <b>更 Pythonic:</b>用 <code>collections.defaultdict</code> 或
                <code>node.children.setdefault(c, Trie())</code> 能省掉 if 判断。
                <b>26 叉数组版:</b>换成长度 26 的 list,下标 <code>ord(c) - ord(&apos;a&apos;)</code>。
              </>
            ),
            hl: [13, 18, 23],
          }}
          js={{
            code: `// LC 208 · 用 Map 存 children(迭代顺序稳定、无原型污染)
class Trie {
  constructor() {
    this.children = new Map();   // 字符 → 子节点
    this.isEnd = false;          // 我是不是某个词的结尾
  }

  insert(word) {
    let node = this;
    for (const c of word) {
      if (!node.children.has(c)) node.children.set(c, new Trie()); // 缺就建
      node = node.children.get(c);
    }
    node.isEnd = true;           // 词尾立牌子
  }

  search(word) {
    const node = this._find(word);
    return node !== null && node.isEnd;   // 走得到 + 是词尾
  }

  startsWith(prefix) {
    return this._find(prefix) !== null;   // 走得到就行
  }

  _find(s) {
    let node = this;
    for (const c of s) {
      if (!node.children.has(c)) return null;  // 断路
      node = node.children.get(c);
    }
    return node;
  }
}`,
            note: (
              <>
                <b>易错点:</b>用普通对象 <code>{"{}"}</code> 存 children 也行,但要防原型污染
                (键若是 <code>__proto__</code> 之类)—— 建议 <code>Object.create(null)</code> 或直接用{" "}
                <code>Map</code>。<b>26 叉数组版:</b><code>new Array(26)</code> + <code>c.charCodeAt(0)-97</code>。
              </>
            ),
            hl: [11, 18, 23],
          }}
        />
        <Callout tone="win" title="检验你真的懂了(合上代码回答)">
          <p>
            ① search 和 startsWith 唯一的区别是哪一行?(答:要不要 <code>&& isEnd</code>)
            ② 为什么 insert 里「缺 child 就建」而 search 里「缺 child 就返回 null」?
            ③ 如果把三个方法的时间复杂度写出来,那个字母 L 指的是<b>词长</b>还是<b>词数</b>?
            —— 三问都能秒答,LC 208 就是你的了。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 三语言对照 ================= */}
      <Section
        id="langs"
        index="05"
        title="三语言对照:没有内置 Trie,区别全在 children 怎么存"
        desc="Java / Python / JavaScript 标准库都不带 Trie —— 但都给了顺手的容器来搭 children"
      >
        <div className="prose">
          <p>
            和数组、哈希表不同,<strong>三种语言的标准库都没有现成的 Trie</strong> —— 面试要用就得手写(§04)。
            所以「三语言对照」在这一章不是比 API,而是比<strong>同一个节点的 children 用什么容器实现</strong>,
            以及各自的坑。核心抉择还是那两条路:<b>固定大小的数组</b>(快、费内存)vs{" "}
            <b>哈希表 / 字典</b>(省、通用)。
          </p>
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>语言</th>
                <th>children 的两种典型写法</th>
                <th>坑 / 注意</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Java</b></td>
                <td>
                  <code>TrieNode[] next = new TrieNode[26]</code>(快)<br />
                  或 <code>Map&lt;Character, TrieNode&gt;</code>(通用)
                </td>
                <td>
                  数组版记得下标 <code>c - &apos;a&apos;</code>;Map 版
                  <code>computeIfAbsent</code> 一行搞定「查不到就新建」
                </td>
              </tr>
              <tr>
                <td><b>Python</b></td>
                <td>
                  <code>dict</code>:<code>{"self.children = {}"}</code><br />
                  或长度 26 的 <code>list</code>
                </td>
                <td>
                  <code>setdefault</code> / <code>defaultdict</code> 让插入更短;
                  最省事的写法是<b>直接用嵌套 dict 当整棵树</b>(LC 212 里就这么干)
                </td>
              </tr>
              <tr>
                <td><b>JavaScript</b></td>
                <td>
                  <code>Map</code>(推荐)或普通对象 <code>Object.create(null)</code>
                </td>
                <td>
                  普通对象当表要防 <code>__proto__</code> 原型污染;
                  <code>Map</code> 更安全、迭代顺序稳定
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="deep" title="内存账:Trie 到底省不省?">
          <p>
            直觉说「共享前缀 → 省空间」,但要看数据。词典里<b>前缀重叠多</b>(自然语言单词、URL、
            文件路径、电话号码),Trie 把公共开头折叠掉,能省;可若词很短、彼此毫无共同开头,
            Trie 反而更亏 —— 每个字符一个节点、每个节点一张 children 表(数组版还固定 26 槽),
            <b>指针开销可能远超省下的字符</b>。所以工程里常用它的压缩变体
            <b>Radix Tree / 双数组 Trie</b>,把「独苗链」压成一条边,兼顾速度与内存。
            结论:Trie 换来的从来不是「省内存」,而是<b>「前缀查询」这项独门能力</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 套路与精讲 ================= */}
      <Section
        id="patterns"
        index="06"
        title="套路与精讲:三道题吃透 Trie 的三种玩法"
        desc="A 模板搭建 · B 通配符分叉 DFS · C Trie + 网格回溯剪枝 —— Trie 面试题的全景"
        badge={<span className="chip" data-tone="warn">★ 面试核心</span>}
      >
        <div className="prose">
          <p>
            Trie 的题目几乎都是「208 的模板 + 一点新花样」。三道精讲覆盖了全部套路:
            <strong>A</strong> 把模板本身走一遍(逐帧看插入怎么复用前缀、查询怎么分三种结局);
            <strong>B</strong> 给查询加一个通配符,逼出「在节点处分叉 DFS」;
            <strong>C</strong> 把 Trie 和网格回溯结合,用它来<strong>剪枝</strong>—— 这是 Trie 最高光的杀手锏。
          </p>
        </div>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 40 }}>
          <span className="sec-index">精讲 A</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 208 · 实现 Trie(把模板走一遍)
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>实现 insert / search / startsWith 三个方法。
            <b> 暴力:</b>拿一个 <code>HashSet&lt;String&gt;</code> 存所有词 —— search 确实 O(L),
            但 startsWith 只能遍历整个集合逐个比开头,<b>O(N·L)</b>,词典一大就废。
            <b> 正解:</b>就是 §04 那份 Trie。代码不再重复,我们把它<strong>跑一遍</strong>:
            先插入 <code>app</code>,再插入 <code>apple</code>(看前缀复用),然后做四种查询,
            亲眼分辨「命中单词 / 是前缀非单词 / 未命中」。
          </p>
        </div>
        <TrieStepper
          title="LC 208 · 插入 app / apple 再查询,逐帧慢放"
          nodes={A208_NODES}
          edges={A208_EDGES}
          frames={A208_FRAMES}
          w={640}
          h={420}
        />
        <Callout tone="win" title="复杂度 & 面试追问">
          <p>
            三个方法均 <BigO o="n" label="O(L)" />,空间 O(总字符数 × 分支因子)。追问预备:
            ① <b>「startsWith 和 search 差在哪?」</b>——差一个 <code>isEnd</code> 判断。
            ② <b>「怎么删除一个词?」</b>——走到词尾清 isEnd;若要回收空间,自底向上删掉
            「既没孩子、又非任何词尾」的节点。③ <b>「怎么统计以某前缀开头的词有几个?」</b>
            ——在节点上再存一个计数字段(见 LC 677 的思路),insert 时沿路 +1。
          </p>
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 B</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 211 · 添加与搜索单词(通配符 &apos;.&apos;)
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="medium">MEDIUM</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>设计一个数据结构支持 addWord,以及 search —— 但 search 的字符串里可能出现
            <code>&apos;.&apos;</code>,它能<strong>匹配任意一个字母</strong>。
            <b> 卡点:</b>普通字符你知道该走哪条边;可遇到 <code>&apos;.&apos;</code>,你<strong>不知道走哪条</strong>,
            于是只能<strong>每条子边都试一遍</strong> —— 循环里出现「对所有分支各递归一次」,这就是 DFS / 回溯。
            <b> 正解:</b>addWord 照搬 208;search 改成递归:普通字符只往对应 child 钻,遇到{" "}
            <code>&apos;.&apos;</code> 就遍历当前节点的<strong>所有</strong> child 分别递归,任意一条成功即返回 true。
          </p>
        </div>
        <TrieStepper
          title="LC 211 · Trie 里存 bad / dad / mad,搜索 “.ad” 的分叉过程"
          nodes={A211_NODES}
          edges={A211_EDGES}
          frames={A211_FRAMES}
          w={640}
          h={320}
        />
        <CodeTabs
          title="WordDictionary"
          java={{
            code: `// LC 211 · 用 26 叉数组存 children(便于遇到 '.' 时遍历所有分支)
class WordDictionary {
    private final WordDictionary[] children = new WordDictionary[26];
    private boolean isEnd = false;

    public void addWord(String word) {          // 和 LC 208 的 insert 一样
        WordDictionary cur = this;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (cur.children[i] == null) cur.children[i] = new WordDictionary();
            cur = cur.children[i];
        }
        cur.isEnd = true;
    }

    public boolean search(String word) {
        return dfs(word, 0, this);
    }

    private boolean dfs(String word, int i, WordDictionary node) {
        if (node == null) return false;
        if (i == word.length()) return node.isEnd;   // 走到底,看是不是词尾
        char c = word.charAt(i);
        if (c == '.') {                              // 通配符:所有分支都试
            for (WordDictionary nxt : node.children)
                if (dfs(word, i + 1, nxt)) return true;
            return false;
        }
        return dfs(word, i + 1, node.children[c - 'a']); // 普通字符:只走一条
    }
}`,
            note: (
              <>
                <b>复杂度:</b>addWord O(L);search 无通配符时 O(L),最坏(开头就是一串
                &apos;.&apos;)会分叉到 <b>O(26^L)</b>,但真实数据里断路剪枝极快。
              </>
            ),
            hl: [23, 24, 25, 26, 27],
          }}
          python={{
            code: `# LC 211 · 用 dict 存 children,遇到 '.' 遍历 children.values()
class WordDictionary:
    def __init__(self):
        self.children: dict[str, "WordDictionary"] = {}
        self.is_end = False

    def addWord(self, word: str) -> None:            # 同 LC 208 insert
        node = self
        for c in word:
            node = node.children.setdefault(c, WordDictionary())
        node.is_end = True

    def search(self, word: str) -> bool:
        def dfs(i: int, node: "WordDictionary") -> bool:
            if i == len(word):
                return node.is_end                   # 走到底看词尾
            c = word[i]
            if c == '.':                             # 通配符:所有子节点都试
                return any(dfs(i + 1, nxt) for nxt in node.children.values())
            nxt = node.children.get(c)               # 普通字符:只走一条
            return dfs(i + 1, nxt) if nxt else False
        return dfs(0, self)`,
            note: (
              <>
                <code>any(...)</code> 天然短路:只要有一条分支返回 True 就停,不再试其余分支。
              </>
            ),
            hl: [17, 18, 19, 20],
          }}
          js={{
            code: `// LC 211 · 用 Map 存 children,遇到 '.' 遍历 children.values()
class WordDictionary {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }

  addWord(word) {                          // 同 LC 208 insert
    let node = this;
    for (const c of word) {
      if (!node.children.has(c)) node.children.set(c, new WordDictionary());
      node = node.children.get(c);
    }
    node.isEnd = true;
  }

  search(word) {
    const dfs = (i, node) => {
      if (i === word.length) return node.isEnd;      // 走到底看词尾
      const c = word[i];
      if (c === '.') {                               // 通配符:所有分支都试
        for (const nxt of node.children.values())
          if (dfs(i + 1, nxt)) return true;
        return false;
      }
      const nxt = node.children.get(c);              // 普通字符:只走一条
      return nxt ? dfs(i + 1, nxt) : false;
    };
    return dfs(0, this);
  }
}`,
            note: (
              <>
                <code>&apos;.&apos;</code> 分叉时,<b>断路的分支会立刻返回 false</b>,所以实际探索的路径远少于
                26^L —— Trie 的结构本身就是剪枝。
              </>
            ),
            hl: [20, 21, 22, 23, 24],
          }}
        />

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 C</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 212 · 单词搜索 II(Trie 的杀手锏:剪枝)
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="hard">HARD</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>给一个字母网格 board 和一个词表 words,找出所有能在网格中<strong>连续相邻</strong>
            (上下左右、不重复用格子)拼出的单词。
            <b> 暴力:</b>对 words 里<strong>每个词</strong>各做一次网格回溯搜索。词表一大(几千个词)、
            很多词开头相同,你会把「从某个 c 出发」这件事<strong>重复搜千百遍</strong> —— 稳稳超时。
          </p>
          <p>
            <b>为什么 Trie 能救场:</b>关键洞察是把词表「反过来用」。先把所有 words 建成一棵 Trie,
            然后<strong>只在网格上回溯一次</strong>,DFS 每往相邻格子走一步,就<strong>同步在 Trie 上往下走一步</strong>。
            两个好处一次拿到:
          </p>
          <ul>
            <li>
              <strong>共享前缀 = 一次搜完一批词。</strong>网格上走出的 <code>c-a</code>,同时是
              cat、car、card 的开头 —— 一趟 DFS 顺带在验证所有这些词,不必每个词从头来。
            </li>
            <li>
              <strong>前缀不存在 = 立刻回头(这就是剪枝)。</strong>DFS 走到某格,若当前字母在 Trie
              的对应位置<strong>没有 child</strong>,说明「这个开头压根不是任何词的前缀」,
              再往下走一万步也拼不出词 —— <b>立即 return,砍掉整条分支</b>。这一刀,
              把指数级的盲目搜索压回可控范围。
            </li>
          </ul>
        </div>
        <StaticTrie
          words={["oath", "pea", "eat", "rain"]}
          caption={
            <>
              把词表 oath / pea / eat / rain 建成 Trie 后,DFS 在网格里每走一格就在这棵树上同步下沉。
              一旦某格字母在树上<b>找不到对应的边</b>,立刻回头 —— 前缀不存在,继续搜纯属浪费。
            </>
          }
        />
        <div className="prose" style={{ marginTop: 6 }}>
          <p>
            实现上有两个好用的小技巧:①<strong>在词尾节点直接存整个单词字符串</strong>(而不是只标 isEnd),
            这样命中时无需回溯拼接,直接收集;②收集后<strong>把该词尾清空</strong>去重,天然避免同一个词被加两次。
          </p>
        </div>
        <CodeTabs
          title="findWords"
          java={{
            code: `// LC 212 · Trie(词尾存整词)+ 网格回溯,前缀不存在即剪枝
class Solution {
    static class Node {
        Node[] next = new Node[26];
        String word = null;                 // 非 null = 一个单词在此结束
    }
    private final List<String> res = new ArrayList<>();

    public List<String> findWords(char[][] board, String[] words) {
        Node root = build(words);
        for (int r = 0; r < board.length; r++)
            for (int c = 0; c < board[0].length; c++)
                dfs(board, r, c, root);
        return res;
    }

    private Node build(String[] words) {    // 建 Trie
        Node root = new Node();
        for (String w : words) {
            Node cur = root;
            for (char ch : w.toCharArray()) {
                int i = ch - 'a';
                if (cur.next[i] == null) cur.next[i] = new Node();
                cur = cur.next[i];
            }
            cur.word = w;                    // 词尾存整词
        }
        return root;
    }

    private void dfs(char[][] board, int r, int c, Node node) {
        char ch = board[r][c];
        if (ch == '#' || node.next[ch - 'a'] == null) return; // 越界/前缀不存在 → 剪枝
        node = node.next[ch - 'a'];
        if (node.word != null) {             // 命中一个完整单词
            res.add(node.word);
            node.word = null;                // 去重
        }
        board[r][c] = '#';                   // 标记本格已用
        int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};
        for (int[] d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length)
                dfs(board, nr, nc, node);
        }
        board[r][c] = ch;                    // 回溯:还原本格
    }
}`,
            note: (
              <>
                <b>复杂度:</b>建 Trie O(词表总字符数);网格 DFS 最坏 O(M·N·4^Lmax),但 Trie
                剪枝让实测远快于此。<code>node.word = null</code> 是去重关键。
              </>
            ),
            hl: [34, 35, 36],
          }}
          python={{
            code: `# LC 212 · 用嵌套 dict 当 Trie('#' 键存整词),网格回溯 + 剪枝
class Solution:
    def findWords(self, board: list[list[str]], words: list[str]) -> list[str]:
        root = {}
        for w in words:                       # 建 Trie(嵌套 dict)
            node = root
            for c in w:
                node = node.setdefault(c, {})
            node['#'] = w                     # '#' 键存整词,兼作结束标记

        m, n, res = len(board), len(board[0]), []

        def dfs(r, c, node):
            ch = board[r][c]
            nxt = node.get(ch)
            if nxt is None:                   # 前缀不存在 → 剪枝
                return
            w = nxt.get('#')
            if w:                             # 命中完整单词
                res.append(w)
                nxt.pop('#')                  # 去重
            board[r][c] = '#'                 # 标记本格已用
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n:
                    dfs(nr, nc, nxt)
            board[r][c] = ch                  # 回溯还原

        for r in range(m):
            for c in range(n):
                dfs(r, c, root)
        return res`,
            note: (
              <>
                嵌套 dict 是 Python 写 Trie 最省事的做法 —— 连节点类都不用定义。
                用 <code>&apos;#&apos;</code>(非字母)当特殊键存整词,不会和普通字符冲突。
              </>
            ),
            hl: [15, 16, 17],
          }}
          js={{
            code: `// LC 212 · 用嵌套对象当 Trie(word 字段存整词),网格回溯 + 剪枝
var findWords = function (board, words) {
  const root = {};
  for (const w of words) {                 // 建 Trie
    let node = root;
    for (const c of w) node = node[c] ??= {};
    node.word = w;                          // 存整词,兼作结束标记
  }
  const m = board.length, n = board[0].length, res = [];

  const dfs = (r, c, node) => {
    const ch = board[r][c];
    const nxt = node[ch];
    if (!nxt) return;                        // 前缀不存在 → 剪枝
    if (nxt.word) { res.push(nxt.word); nxt.word = null; } // 命中并去重
    board[r][c] = '#';                       // 标记本格已用
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n) dfs(nr, nc, nxt);
    }
    board[r][c] = ch;                        // 回溯还原
  };

  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++)
      dfs(r, c, root);
  return res;
};`,
            note: (
              <>
                <code>node[c] ??= {"{}"}</code> 是「没有就建、有就复用」的极简写法。
                用 <code>word</code> 字段存整词并在命中后置 null,同时完成「收集」和「去重」。
              </>
            ),
            hl: [13, 14, 15],
          }}
        />
        <Callout tone="deep" title="一句话记住这道题的灵魂">
          <p>
            <b>不是「为每个词搜网格」,而是「让网格的一次 DFS,沿着 Trie 顺便把所有词都查了」。</b>
            Trie 在这里扮演两个角色:共享前缀(一趟搜完一批词)+ 前缀剪枝(不对的开头立刻回头)。
            这也是「多模式串匹配」的通用思路 —— 更进一步会通向 AC 自动机(Aho-Corasick),
            那是 Trie + KMP 失配指针的合体,进阶章可以再会。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title="高频题单:前缀树 8 题"
        desc="从模板题铺到 0-1 Trie。勾选进度存在本地,先想 30 秒再看提示"
        badge={<span className="chip">按套路分组</span>}
      >
        <ProblemSet ch="trie" items={PROBLEMS} />
      </Section>

      {/* ================= §08 测验 ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="6 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="trie" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            Trie 的一切从一个动机来:<b>哈希表把 key 打散、丢掉了「开头」信息</b>,答不了前缀查询;
            Trie 让共享开头的词物理上住在一起,「以 X 开头」退化成「顺着路往下走」。
          </>,
          <>
            结构极简:节点 = <b>children(字符→子节点)+ isEnd(布尔)</b>。字符贴在<b>边</b>上,
            根到节点的路径就是一个前缀。<b>isEnd 是必需的</b> —— 没它就分不清 cat 是「单词」还是「cattle 的前缀」。
          </>,
          <>
            insert / search / startsWith 全是 <b>O(L)</b>,L 是<b>词长不是词数</b>。
            这条「复杂度与词典大小无关」是几乎所有 Trie 题的题眼;search 比 startsWith 只多一个 <code>isEnd</code> 判断。
          </>,
          <>
            children 存法二选一:<b>26 叉数组</b>(快、常数小,但每节点固定 26 槽费内存)vs
            <b>哈希表 / dict</b>(省内存、支持任意字符集,常数略大)。Trie 换来的是能力,不是省空间。
          </>,
          <>
            三大套路:<b>208 模板</b> → <b>211 通配符在节点处分叉 DFS</b> → <b>212 Trie + 网格回溯,
            靠「前缀不存在立刻剪枝」压掉指数搜索</b>;再加 <b>0-1 Trie</b>(把整数按比特建树)解最大异或。
            看到「前缀 / 补全 / 共同开头」,就该想到它。
          </>,
        ]}
      />

      <ChapterFooter ch="trie" />
    </main>
  );
}
