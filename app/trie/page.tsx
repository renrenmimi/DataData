"use client";

// Chapter 10 · Prefix tree (Trie)
// Structure: why it exists → memory layout → operations and complexity → from-scratch
// implementation → three-language comparison → patterns and three walkthroughs
// (LC 208 / 211 / 212) → problem set → quiz → key points.
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
import { PROBLEMS, QUIZ } from "@/lib/trie-data";
import { T } from "@/lib/i18n";
import {
  TrieLab,
  StaticTrie,
  TrieStepper,
  type TStepNode,
  type TStepFrame,
} from "./viz";
import "./chapter.css";

/* ================= Walkthrough A · LC 208 frame data (app / apple) ================= */

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
      <T
        en={
          <>
            insert(<b>&quot;app&quot;</b>): start at the root. a, p and p do not
            exist yet, so create one node per letter and link them. On the last p
            set <b>isEnd = true</b> — that flag is the only thing that says
            &quot;app is a word&quot;. The l and e nodes are faded here because
            they arrive in the next step.
          </>
        }
        zh={
          <>
            insert(<b>&quot;app&quot;</b>):从 root 出发。a、p、p 都还不存在,
            于是每个字母新建一个节点连上边。走到最后一个 p,把它的{" "}
            <b>isEnd = true</b> —— 只有这个标记能说明「app 是一个单词」。
            图中 l、e 两个节点是淡的,它们在下一步才出现。
          </>
        }
      />
    ),
  },
  {
    lit: [0, 1, 2, 3],
    ok: [4, 5],
    msg: (
      <T
        en={
          <>
            insert(<b>&quot;apple&quot;</b>): the first three letters a-p-p{" "}
            <b>already exist, so the walk reuses them</b> — a shared beginning is
            stored once. Only l and e are new, and e gets isEnd = true.
          </>
        }
        zh={
          <>
            insert(<b>&quot;apple&quot;</b>):前三个字母 a-p-p{" "}
            <b>已经存在,直接沿用</b> —— 相同的开头只存一份。只新建 l、e 两个节点,
            末节点 e 标 isEnd = true。
          </>
        }
      />
    ),
  },
  {
    lit: [0, 1, 2],
    ok: [3],
    dim: [4, 5],
    msg: (
      <T
        en={
          <>
            search(<b>&quot;app&quot;</b>): follow a-p-p to the end. That node has{" "}
            <b>isEnd = true</b>, so the answer is <b>true</b>. The walk took 3
            steps, the length of the word.
          </>
        }
        zh={
          <>
            search(<b>&quot;app&quot;</b>):沿 a-p-p 走到底,该节点{" "}
            <b>isEnd = true</b> → 返回 <b>true</b>。全程 3 步 = 单词长度。
          </>
        }
      />
    ),
  },
  {
    lit: [0, 1],
    pre: [2],
    dim: [3, 4, 5],
    msg: (
      <T
        en={
          <>
            search(<b>&quot;ap&quot;</b>): the path exists, but the node it ends
            on has <b>isEnd = false</b>. ap is only the beginning of other words,
            not a word that was inserted, so <b>search returns false</b> while
            startsWith(&quot;ap&quot;) returns <b>true</b>. One flag separates
            exact matching from prefix matching.
          </>
        }
        zh={
          <>
            search(<b>&quot;ap&quot;</b>):路径走得通,但停下的节点{" "}
            <b>isEnd = false</b> —— ap 只是别的词的开头,不是被插入过的单词。
            所以 <b>search 返回 false</b>,而 startsWith(&quot;ap&quot;) 返回{" "}
            <b>true</b>。一个标记之差,分开了「精确匹配」和「前缀匹配」。
          </>
        }
      />
    ),
  },
  {
    lit: [0, 1, 2, 3, 4],
    ok: [5],
    msg: (
      <T
        en={
          <>
            search(<b>&quot;apple&quot;</b>): a-p-p-l-e walks all the way to e,
            which has isEnd = true, so the answer is <b>true</b>.
          </>
        }
        zh={
          <>
            search(<b>&quot;apple&quot;</b>):a-p-p-l-e 一路走到 e,isEnd = true →{" "}
            <b>true</b>。
          </>
        }
      />
    ),
  },
  {
    bad: [0],
    dim: [1, 2, 3, 4, 5],
    msg: (
      <T
        en={
          <>
            search(<b>&quot;banana&quot;</b>): the root has no &apos;b&apos;
            child, so the walk stops at the very first letter and{" "}
            <b>returns false</b>. It cost one step. The tree could hold a million
            words and this lookup would still cost one step.
          </>
        }
        zh={
          <>
            search(<b>&quot;banana&quot;</b>):root 的 children 里没有
            &apos;b&apos; 这条边,第一个字母就断路,<b>立即返回 false</b>,
            只花了 1 步。树里存一百万个词,这次查询也还是 1 步。
          </>
        }
      />
    ),
  },
];

/* ================= Walkthrough B · LC 211 frame data (bad / dad / mad, search ".ad") ============ */

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
      <T
        en={
          <>
            search(<b>&quot;.ad&quot;</b>). The first character is the wildcard{" "}
            <b>&apos;.&apos;</b>, which matches any letter. The walk cannot tell
            which edge to take, so it has to try{" "}
            <b>all three children of the root: b, d and m</b>. This is where the
            DFS branches.
          </>
        }
        zh={
          <>
            search(<b>&quot;.ad&quot;</b>):第 1 个字符是通配符{" "}
            <b>&apos;.&apos;</b>,能匹配任意字母。这一步不知道该走哪条边,
            于是 <b>root 底下的 b、d、m 三条边都要试</b> —— DFS 在这里第一次分叉。
          </>
        }
      />
    ),
  },
  {
    lit: [0, 1, 4, 7, 2, 5, 8],
    msg: (
      <T
        en={
          <>
            The second character is an ordinary <b>&apos;a&apos;</b>. Each of the
            three branches follows its own a edge one level down, reaching the a
            node on the path of bad, dad and mad. An ordinary character never
            branches: it takes the single matching edge.
          </>
        }
        zh={
          <>
            第 2 个字符是普通的 <b>&apos;a&apos;</b>:三条分支各自沿自己的 a
            边下沉一层,分别到达 bad、dad、mad 路径上的 a 节点。
            普通字符不分叉,只走对应的那一条边。
          </>
        }
      />
    ),
  },
  {
    lit: [0, 1, 4, 7, 2, 5, 8],
    ok: [3, 6, 9],
    msg: (
      <T
        en={
          <>
            The third character is <b>&apos;d&apos;</b>. All three paths end on a
            node with <b>isEnd = true</b>, so &quot;.ad&quot; matches{" "}
            <b>bad, dad and mad</b>. The real search returns true as soon as the
            first branch succeeds; all three are shown so you can see what the
            wildcard reaches. The cost of &apos;.&apos; is that every child of the
            current node has to be tried.
          </>
        }
        zh={
          <>
            第 3 个字符 <b>&apos;d&apos;</b>:三条路都停在 <b>isEnd = true</b>{" "}
            的节点上,所以 &quot;.ad&quot; 匹配 <b>bad、dad、mad</b>。
            真实的 search 只要第一条分支成功就返回 true,这里把三条都画出来,
            是为了看清通配符能碰到哪些词。&apos;.&apos; 的代价,
            就是当前节点的每个 child 都得试一遍。
          </>
        }
      />
    ),
  },
];

/* ================= Page ================= */

const CHIPS = [
  { id: "intuition", n: "01", label: { en: "Why it exists", zh: "为什么需要它" } },
  { id: "structure", n: "02", label: { en: "Node structure", zh: "内存结构" } },
  { id: "ops", n: "03", label: { en: "Operations and cost", zh: "操作与复杂度" } },
  { id: "build", n: "04", label: { en: "Build one", zh: "手写实现" } },
  { id: "langs", n: "05", label: { en: "Three languages", zh: "三语言对照" } },
  { id: "patterns", n: "06", label: { en: "Patterns", zh: "套路与精讲" } },
  { id: "problems", n: "07", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "08", label: { en: "Quiz", zh: "通关测验" } },
];

export default function TrieChapter() {
  return (
    <main className="page" data-ch="trie">
      <Hero
        ch="trie"
        title={{
          en: (
            <>
              The <span className="grad">Trie</span>
            </>
          ),
          zh: (
            <>
              前缀树 <span className="grad">Trie</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              A trie stores a set of words as one tree. The{" "}
              <strong>path from the root spells the word</strong>, so words that
              begin the same way share the same nodes and each shared beginning
              is stored only once. It costs memory, and it answers a question a
              hash table cannot:{" "}
              <strong>which stored words start with this prefix?</strong>
            </>
          ),
          zh: (
            <>
              Trie 把一组单词存成一棵树:<strong>从根走下来的路径拼出单词</strong>,
              开头相同的词因此共用同一段节点,每一段相同的开头只存一份。
              它花掉的是内存,换来的是哈希表答不了的一个问题:
              <strong>哪些已存的词以这段开头?</strong>
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 Why it exists ================= */}
      <Section
        id="intuition"
        index="01"
        title={{
          en: 'Why it exists: a hash table cannot answer "which words start with ca"',
          zh: "为什么需要它:哈希表答不了「哪些词以 ca 开头」",
        }}
        desc={{
          en: "Search suggestions and input prediction all ask the same question about the beginning of a word.",
          zh: "搜索建议、输入法联想 —— 这类需求问的都是「开头」",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Type <code>ca</code> into any search box and a list appears
                  before you finish: cat, car, card, camera, cambridge. Input
                  prediction, code completion in an IDE, and filtering contacts
                  by last name all ask the same thing:{" "}
                  <strong>
                    given the beginning of a word, find every stored word that
                    starts with it.
                  </strong>
                </p>
                <p>
                  Chapter 6 covered the <strong>hash table</strong>, which is
                  built for exact lookups. To check whether <code>cat</code> is
                  in the dictionary it turns the whole word into one number and
                  jumps to that slot. With respect to how many words are stored
                  that is O(1) on average, although it still reads the whole word
                  to compute the hash. The same computation is what makes
                  prefixes hopeless: <code>cat</code> and <code>car</code> get
                  unrelated hash values, and the table{" "}
                  <strong>keeps no record that they share the letters ca</strong>
                  . To list the words that start with ca it has to read all N
                  stored words and compare the beginning of each one, which is
                  O(N·L). The larger the dictionary, the slower the answer.
                </p>
              </>
            }
            zh={
              <>
                <p>
                  在任意搜索框里敲 <code>ca</code>,你还没打完,下面已经弹出一列:
                  cat、car、card、camera、cambridge。输入法联想、IDE
                  的代码补全、通讯录按姓氏筛选,问的都是同一件事:
                  <strong>给我一段开头,找出所有以它开头的词。</strong>
                </p>
                <p>
                  第 6 章的<strong>哈希表</strong>是为精确查找而生的:判断{" "}
                  <code>cat</code> 在不在词典里,它把整个单词算成一个数,
                  直接跳到那个槽位。就「已存词数」而言,这是平均 O(1) ——
                  尽管它仍要读完整个单词才能算出哈希。可正是这次计算,
                  让前缀查询没了指望:<code>cat</code> 和 <code>car</code>{" "}
                  算出的哈希值毫不相干,表里
                  <strong>没有任何东西记得它俩共享 ca 这个开头</strong>。
                  想列出以 ca 开头的词,它只能读遍全部 N 个词、逐个比对开头 ——
                  O(N·L)。词典越大越慢。
                </p>
              </>
            }
          />
          <Callout
            tone="idea"
            title={{
              en: "What gets lost: the structure between keys",
              zh: "问题出在哪:key 之间的结构关系被丢掉了",
            }}
          >
            <T
              en={
                <p>
                  A hash table is fast because it deliberately removes the
                  relationship between keys. It answers <b>equal</b> and nothing
                  else. A prefix is a relationship between keys. To answer prefix
                  questions efficiently, the words have to be stored so that{" "}
                  <b>words with the same beginning sit in the same place</b>.
                  That is the whole motivation for a trie.
                </p>
              }
              zh={
                <p>
                  哈希表快,是因为它有意抹掉了 key 之间的关系 —— 它只回答
                  <b>「相等」</b>,不回答别的。而「前缀」恰恰是一种 key
                  之间的关系。要高效回答前缀问题,就得换一种存法:
                  <b>让开头相同的词,存在同一个地方</b>。这就是 Trie 的全部动机。
                </p>
              }
            />
          </Callout>
          <T
            en={
              <p>
                The idea is plain. Write <code>cat, car, card</code> one under
                the other. The first two letters, <code>ca</code>, are the same
                in all three, so <strong>store them once</strong> and let the
                paths separate after the a. Do this with ten thousand words and
                the result is a tree. Reading the characters along the path from
                the root down to any node gives{" "}
                <strong>a prefix</strong>. To find every word starting with{" "}
                <code>ca</code>, walk to the ca node:{" "}
                <strong>the whole subtree below it is the answer</strong>, and no
                other word is looked at.
              </p>
            }
            zh={
              <p>
                主意很朴素:把 <code>cat、car、card</code> 三个词竖着写,
                前两个字母 <code>ca</code> 一模一样 —— 那就<strong>只存一次</strong>,
                在 a 之后再分叉。一万个单词这么存下来,就长成了一棵树。
                从根走到任意节点,一路读到的字符<strong>就是一个前缀</strong>;
                想找所有以 <code>ca</code> 开头的词,走到 ca 那个节点,
                <strong>它下面整棵子树就是答案</strong>,别的词一眼都不用看。
              </p>
            }
          />
        </div>

        <StaticTrie
          words={["car", "card", "cat", "dog"]}
          caption={{
            en: (
              <>
                A trie built from car, card, cat and dog.{" "}
                <b>car, card and cat share the beginning c-a</b>, which is stored
                once, and the paths separate after the a. dog begins differently,
                so it forms its own branch. A green double circle marks a node
                where a word ends (isEnd). Notice that{" "}
                <b>the r node where car ends still has a child</b>, leading on to
                card. §02 uses that detail.
              </>
            ),
            zh: (
              <>
                由 car、card、cat、dog 建成的 Trie。
                <b>car / card / cat 共享 c-a 这个开头</b>(只存一份),
                到 a 之后才分叉;dog 开头不同,自成一支。绿色双圈 =
                有单词在此结束(isEnd)。注意
                <b>car 结束的那个 r 节点还带着孩子</b>(通向 card)—— §02 会用到这个细节。
              </>
            ),
          }}
        />

        <div className="grid-3" style={{ marginTop: 22 }}>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PROPERTY 01" zh="特性 01" />
            </div>
            <div className="card-title">
              <T
                en="Edges are characters, paths are prefixes"
                zh="边是字符,路径是前缀"
              />
            </div>
            <T
              en={
                <p>
                  Every edge carries one character, so reading from the root down
                  to any node <b>spells a prefix</b>. A prefix query, which is
                  awkward in most structures, becomes walking down a path.
                </p>
              }
              zh={
                <p>
                  每条边上贴着一个字符,从根读到任意节点,
                  <b>拼出来就是一个前缀</b>。前缀查询在别的结构里很别扭,
                  在 Trie 里就是「顺着路往下走」。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PROPERTY 02" zh="特性 02" />
            </div>
            <div className="card-title">
              <T en="A shared beginning is stored once" zh="相同的开头只存一份" />
            </div>
            <T
              en={
                <p>
                  Words that begin the same way share the same nodes. The more
                  the words overlap at the front, as with natural-language words,
                  URLs and file paths, the more nodes are shared. This is why it
                  is also called a <b>prefix tree</b>.
                </p>
              }
              zh={
                <p>
                  开头相同的词共用同一批节点。词与词在开头重叠得越多(自然语言单词、
                  URL、文件路径),共享的节点就越多。它的另一个名字
                  <b>「字典树 / 前缀树」</b>就是这么来的。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PROPERTY 03" zh="特性 03" />
            </div>
            <div className="card-title">
              <T
                en="⚡ The cost follows the length, not the count"
                zh="⚡ 代价只看词长,不看词数"
              />
            </div>
            <T
              en={
                <p>
                  Inserting or looking up one word costs <b>its length L</b>.
                  Whether the tree already holds 10 words or 10 million{" "}
                  <b>does not enter that cost</b>. §03 works through why.
                </p>
              }
              zh={
                <p>
                  插入或查询一个词的代价 = <b>这个词的长度 L</b>。
                  树里已经有 10 个词还是 1000 万个词,<b>不出现在这个代价里</b>。
                  §03 讲清楚为什么。
                </p>
              }
            />
          </div>
        </div>

        <Callout
          tone="story"
          title={{
            en: "Where the name comes from, and how it is said",
            zh: "名字的来历:它读 “try” 还是 “tree”?",
          }}
        >
          <T
            en={
              <p>
                Edward Fredkin introduced the term in 1960, taking it from the
                middle of the word re<b>trie</b>val. That creates a small
                problem: by its origin it should be said like &quot;tree&quot;,
                but tree is already the name of another structure, so most people
                say &quot;try&quot; instead. You will hear both, and neither is
                worth arguing about. The structure is also called a prefix tree
                or a digital tree.
              </p>
            }
            zh={
              <p>
                Trie 一词由 Edward Fredkin 在 1960 年提出,取自单词 re<b>trie</b>
                val(检索)的中间四个字母。于是有点尴尬:按词源应该读作
                “tree”,可 tree 已经是另一种结构的名字了,所以多数人读它作
                “try”。两种读法你都会听到,不必纠结;它的中文名是「前缀树 / 字典树」。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §02 Node structure ================= */}
      <Section
        id="structure"
        index="02"
        title={{
          en: "Inside a node: a table of children and one isEnd flag",
          zh: "节点里有什么:一张孩子表 + 一个 isEnd 标记",
        }}
        desc={{
          en: "What a single trie node holds, and why the boolean flag cannot be left out.",
          zh: "一个 Trie 节点存什么?为什么那个布尔标记不能省?",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                Start with a single node. A binary-tree node from chapter 7 holds
                a value, a left child and a right child. A trie node does not
                hold a value at all. It holds two things:
              </p>
            }
            zh={
              <p>
                先看单个节点。第 7 章二叉树的节点是「值 + 左孩子 +
                右孩子」;Trie 节点连「值」都不存,它只有两样东西:
              </p>
            }
          />
          <ul>
            <li>
              <T
                en={
                  <>
                    <strong>children</strong>: a mapping from a character to a
                    child node. A binary tree has exactly two children; a trie
                    node has as many as the alphabet allows. For lowercase
                    English that is at most 26, so children can be an array of
                    length 26 (<code>TrieNode[26]</code>, index = letter −
                    &apos;a&apos;) or a hash map{" "}
                    <code>Map&lt;Character, Node&gt;</code>. §03 compares
                    the two.
                  </>
                }
                zh={
                  <>
                    <strong>children(孩子表)</strong>:从「字符」到「子节点」的映射。
                    二叉树固定两个孩子,Trie 的孩子数由字符集决定:
                    只处理小写英文字母就是最多 26 个,可以用长度 26 的数组
                    <code>TrieNode[26]</code>(下标 = 字母 − &apos;a&apos;),
                    也可以用哈希表 <code>Map&lt;Character, Node&gt;</code>。
                    两者的取舍见 §03。
                  </>
                }
              />
            </li>
            <li>
              <T
                en={
                  <>
                    <strong>isEnd</strong>: one boolean, answering a single
                    question — <b>does a stored word end exactly here?</b>
                  </>
                }
                zh={
                  <>
                    <strong>isEnd(结束标记)</strong>:一个布尔位,只回答一个问题 ——
                    <b>有没有某个已存的词,正好在这里结束?</b>
                  </>
                }
              />
            </li>
          </ul>
          <T
            en={
              <p>
                One point is easy to miss:{" "}
                <strong>the character is not stored in the node</strong>. It is
                carried by the edge, or equivalently, a node is identified by the
                character its parent used to reach it. So{" "}
                <strong>the key is spelled by the path, not held by the node</strong>
                . The root stands for no character; it is the empty prefix every
                word starts from. Walking k edges down from the root reads k
                characters, which is a prefix of length k.
              </p>
            }
            zh={
              <p>
                有一点容易看漏:<strong>字符并不存在节点里</strong>,
                它贴在边上 —— 等价地说,一个节点是由「父亲用哪个字符找到它」来标识的。
                所以<strong>拼出 key 的是路径,不是节点</strong>。
                根节点不代表任何字符,它是所有词共同的起点,一个空前缀。
                从根往下走 k 条边,读到的 k 个字符,就是一个长度为 k 的前缀。
              </p>
            }
          />
        </div>

        <Callout
          tone="warn"
          title={{
            en: "Why isEnd cannot be left out: cat and cattle",
            zh: "isEnd 为什么不能省:看 cat 与 cattle",
          }}
        >
          <T
            en={
              <p>
                Suppose the trie holds <code>cat</code> and <code>cattle</code>.
                Because cat is the beginning of cattle, the t node reached by
                c-a-t <b>still has a child</b>, continuing with t, l, e. Now ask:
                is <code>cat</code> a stored word? Without isEnd there is{" "}
                <b>no way to answer</b>. Asking whether the node has children
                does not help — this one does have children, for cattle, and cat
                really is a word. And <code>catt</code> is reachable and also has
                a child, yet it is <b>not</b> a word. The node itself holds no
                word, so the answer has nowhere else to live: it has to be a flag
                on the node, <b>isEnd = true</b>, meaning a word ends here.
              </p>
            }
            zh={
              <p>
                假设 Trie 里插了 <code>cat</code> 和 <code>cattle</code>。因为 cat
                是 cattle 的开头,走 c-a-t 到达的那个 t 节点<b>底下还挂着孩子</b>
                (继续接 t-l-e)。现在问:<code>cat</code> 是一个词吗?没有 isEnd
                就<b>无从回答</b>。「这个节点有没有孩子」帮不上忙 ——
                它确实有孩子(为了 cattle),可 cat 确确实实是个词;反过来,
                <code>catt</code> 也走得通、也有孩子,却<b>不是</b>词。
                节点本身并不存词,所以这个答案没有别的地方可放,
                只能是节点上的一个标记 <b>isEnd = true</b>:有词在此结束。
              </p>
            }
          />
        </Callout>

        <StaticTrie
          words={["cat", "cattle"]}
          emphasize={["cat"]}
          caption={{
            en: (
              <>
                cat and cattle share c-a-t. The highlighted{" "}
                <b>t node has isEnd = true</b>, so cat is a stored word, and it{" "}
                <b>still has a child</b> continuing to cattle. Without that flag
                there is no way to tell a stored word from a node you are only
                passing through.
              </>
            ),
            zh: (
              <>
                cat 与 cattle 共享 c-a-t。高亮的 <b>t 节点 isEnd = true</b>,
                说明 cat 是一个已存的词,而它<b>同时还有孩子</b>继续通向 cattle。
                没有这个标记,就分不清「一个已存的词」和「只是路过的节点」。
              </>
            ),
          }}
        />

        <div className="prose" style={{ marginTop: 8 }}>
          <T
            en={
              <p>
                The lab below already holds five words. Insert a new word and
                watch which part of the path is reused, or look one up and watch
                the path light up node by node. Three endings are worth producing
                on purpose: <b>a stored word matches</b>,{" "}
                <b>the string is a prefix but not a word</b>, and{" "}
                <b>the path stops partway</b>.
              </p>
            }
            zh={
              <p>
                下面这个实验室里已经住着 5 个词。插入新词,看路径哪一段被复用;
                查询单词或前缀,看路径怎么逐节点点亮。有三种结局值得亲手制造一遍:
                <b>命中一个已存的词</b>、<b>是前缀但不是词</b>、
                <b>中途断路</b>。
              </p>
            }
          />
        </div>

        <TrieLab />

        <Callout
          tone="deep"
          title={{ en: "Where tries are used", zh: "工程现场:它比你想的常见" }}
        >
          <T
            en={
              <p>
                Tries sit behind <b>autocomplete</b> in search engines and input
                methods, behind <b>longest-prefix matching</b> in routers that
                forward IP packets, and behind spell checking. Databases and file
                systems usually use a compressed form, the{" "}
                <b>radix tree</b> (also called a Patricia trie):{" "}
                <b>any chain of nodes with a single child is merged into one
                edge</b> holding several characters, which removes most of the
                wasted nodes. The price is a more complicated insert, because
                adding a word can require splitting an existing edge in two.
                Redis uses a radix tree for stream IDs, and the Linux kernel used
                one for the page cache. Once the plain trie is clear, these are
                compressed versions of it.
              </p>
            }
            zh={
              <p>
                Trie 藏在你每天用的东西里:搜索引擎和输入法的<b>自动补全</b>、
                路由器转发 IP 包时的<b>最长前缀匹配</b>、拼写检查。
                数据库和文件系统里用的多是它的压缩形态 —— <b>基数树 Radix Tree</b>
                (也叫 Patricia trie):
                <b>把「只有一个孩子的节点链」合并成一条边</b>,一条边上带多个字符,
                省掉大部分空转节点。代价是插入更复杂 ——
                加一个词可能需要把已有的边一分为二。Redis 用基数树存 stream ID,
                Linux 内核也曾用它做页缓存索引。朴素 Trie 想明白了,
                这些不过是它的压缩版。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §03 Operations and cost ================= */}
      <Section
        id="ops"
        index="03"
        title={{
          en: "Operations and cost: three methods, one walk",
          zh: "操作与复杂度:三个方法,一句「沿路径走」",
        }}
        desc={{
          en: "insert, search and startsWith are all O(L) — L is the length of the string, not the number of stored words.",
          zh: "insert / search / startsWith 全是 O(L) —— L 是字符串长度,不是词数",
        }}
        badge={
          <span className="chip" data-tone="warn">
            <T en="★ Core result" zh="★ 核心结论" />
          </span>
        }
      >
        <div className="prose">
          <T
            en={
              <p>
                The three trie operations share one skeleton:{" "}
                <strong>
                  start at the root and take the characters of the input string
                  one at a time, moving down
                </strong>
                . They differ only in what happens when an edge is missing, and
                what is checked on arrival:
              </p>
            }
            zh={
              <p>
                Trie 的三个操作骨架完全一样:
                <strong>从根出发,拿着输入串的字符一个一个往下走</strong>。
                区别只在两处:路上缺边怎么办,以及到达终点后检查什么。
              </p>
            }
          />
          <ul>
            <li>
              <T
                en={
                  <>
                    <strong>insert(word)</strong>: follow the characters, and{" "}
                    <b>create a node wherever the edge is missing</b>. At the end,
                    set <code>isEnd = true</code> on the last node.
                  </>
                }
                zh={
                  <>
                    <strong>insert(word)</strong>:沿字符走,
                    <b>缺哪条边就新建一个节点接上</b>;走完把末节点{" "}
                    <code>isEnd = true</code>。
                  </>
                }
              />
            </li>
            <li>
              <T
                en={
                  <>
                    <strong>search(word)</strong>: follow the characters, and{" "}
                    <b>return false immediately if an edge is missing</b>. On
                    arrival, <b>check isEnd on the last node</b>; if it is false
                    the string is only a prefix, not a stored word.
                  </>
                }
                zh={
                  <>
                    <strong>search(word)</strong>:沿字符走,
                    <b>中途缺边立刻返回 false</b>;走到底后<b>还要检查末节点 isEnd</b>
                    ,为 false 说明它只是前缀,不是已存的词。
                  </>
                }
              />
            </li>
            <li>
              <T
                en={
                  <>
                    <strong>startsWith(prefix)</strong>: the same walk, but{" "}
                    <b>arriving is enough — isEnd is not read</b>.
                  </>
                }
                zh={
                  <>
                    <strong>startsWith(prefix)</strong>:同样地走,但
                    <b>走得通就返回 true,不看 isEnd</b>。
                  </>
                }
              />
            </li>
          </ul>
        </div>

        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Operation" zh="操作" />
                </th>
                <th>
                  <T
                    en="Cost (L = length of the input string)"
                    zh="复杂度(L = 输入串长度)"
                  />
                </th>
                <th>
                  <T en="Why" zh="为什么" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>insert(word)</b>
                </td>
                <td>
                  <BigO o="n" label="O(L)" />
                </td>
                <td>
                  <T
                    en="One step per character. Missing nodes are created along the way, at most L of them."
                    zh="每个字符走一步;缺的节点顺路新建,最多建 L 个。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>search(word)</b>
                </td>
                <td>
                  <BigO o="n" label="O(L)" />
                </td>
                <td>
                  <T
                    en="At most L steps to the end, then one check of isEnd."
                    zh="最多走 L 步到底,再检查一次 isEnd。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>startsWith(prefix)</b>
                </td>
                <td>
                  <BigO o="n" label="O(L)" />
                </td>
                <td>
                  <T
                    en="Walk to the last node of the prefix. isEnd is never read."
                    zh="走到前缀的末节点即可,完全不读 isEnd。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>delete(word)</b>
                </td>
                <td>
                  <BigO o="n" label="O(L)" />
                </td>
                <td>
                  <T
                    en="Walk to the last node and clear isEnd. To reclaim memory, remove nodes bottom-up while they have no children and end no word."
                    zh="走到末节点清掉 isEnd;若要回收内存,自底向上删掉「没有孩子、也不是任何词尾」的节点。"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T
                    en={
                      <>
                        <b>every</b> word starting with X
                      </>
                    }
                    zh={
                      <>
                        以 X 开头的<b>所有</b>词
                      </>
                    }
                  />
                </td>
                <td>
                  <BigO o="n" label="O(L + k)" />
                </td>
                <td>
                  <T
                    en="O(L) to reach the prefix node, then a DFS over its subtree. k is the size of that subtree, so the cost follows the number of results, not the size of the trie."
                    zh="O(L) 走到前缀节点,再 DFS 它的子树;k 是这棵子树的大小,所以代价跟着结果数量走,和整棵树多大无关。"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout
          tone="win"
          title={{
            en: "The cost does not depend on how many words are stored",
            zh: "记住这句话:代价与已存词数无关",
          }}
        >
          <T
            en={
              <p>
                Each step is one child lookup: an array index, or a hash-map
                lookup that is O(1) on average. The number of steps is L,{" "}
                <b>the length of the string you passed in</b>. Whether the
                dictionary holds 10 words or 50 million, looking up{" "}
                <code>apple</code> takes 5 steps. A hash table is also O(L) for
                one exact lookup, because it reads the whole key to compute the
                hash, so a trie is <b>not faster at exact matching</b>. What the
                trie adds is <b>prefix search</b>, and that is what it is chosen
                for.
              </p>
            }
            zh={
              <p>
                每一步只是一次 child 查找(数组下标,或平均 O(1) 的哈希表查找)。
                走多少步?L 步 —— <b>你传进来的字符串有多长</b>。
                词典里是 10 个词还是 5000 万个词,查 <code>apple</code>{" "}
                永远是 5 步。哈希表做一次精确查找也是 O(L)(它要读完整个 key
                才能算哈希),所以 Trie <b>在精确匹配上并不更快</b>。
                Trie 多出来的是<b>前缀查询</b>,选它就是为了这个。
              </p>
            }
          />
        </Callout>

        <h3 className="sec-title" style={{ fontSize: 19, marginTop: 32 }}>
          <T
            en="The cost is memory: a fixed array of 26 vs a hash map"
            zh="代价在内存:26 槽数组 vs 哈希表"
          />
        </h3>
        <div className="prose">
          <T
            en={
              <p>
                The speed is paid for in <strong>memory</strong>. Every character
                on every path needs a node, and every node needs a table of
                children. How that table is stored is the one real design
                decision in a trie:
              </p>
            }
            zh={
              <p>
                这份速度是拿<strong>内存</strong>换的:每条路径上的每个字符都要一个节点,
                而每个节点都得带一张 children 表。这张表怎么存,
                是 Trie 唯一真正的设计抉择:
              </p>
            }
          />
        </div>
        <div className="grid-2" style={{ marginTop: 6 }}>
          <div className="card">
            <div className="card-title">
              <T
                en="Fixed array, TrieNode[26]"
                zh="定长 26 槽数组 TrieNode[26]"
              />
            </div>
            <T
              en={
                <p>
                  The index is <code>character − &apos;a&apos;</code>, so
                  reaching a child is one array read — the smallest constant
                  factor available. Two costs come with it.{" "}
                  <b>Every node holds 26 pointers whether it uses them or not</b>
                  , which wastes a lot of memory when the words are sparse. And
                  26 only covers lowercase ASCII letters: input with digits,
                  uppercase letters or non-ASCII text needs a different table.
                  Good for practice problems that promise lowercase input.
                </p>
              }
              zh={
                <p>
                  下标 = <code>字符 − &apos;a&apos;</code>,一次数组读取就拿到孩子,
                  常数最小。代价有两个:
                  <b>每个节点无论用不用,都占着 26 个指针</b>,
                  词稀疏时浪费惊人;而且 26 只覆盖小写 ASCII 字母 ——
                  输入里有数字、大写字母或非 ASCII 文本,就得换一张表。
                  适合明确「只有小写字母」的刷题场景。
                </p>
              }
            />
          </div>
          <div className="card">
            <div className="card-title">
              <T
                en="Hash map, Map<Character, Node>"
                zh="哈希表 Map<Character, Node>"
              />
            </div>
            <T
              en={
                <p>
                  <b>Only the children that exist are stored</b>, so sparse data
                  costs far less memory, and any character can be a key:
                  uppercase, digits, Chinese, anything outside ASCII. The price
                  is a slightly larger constant factor per lookup than an array
                  index. This is the safer default for real input.
                </p>
              }
              zh={
                <p>
                  <b>有几个孩子就存几个</b>,稀疏数据省下大量内存;
                  而且任何字符都能当键:大写、数字、中文、任意非 ASCII 文本都行。
                  代价是单次查找的常数比数组下标略大。面对真实输入,它是更稳的默认选择。
                </p>
              }
            />
          </div>
        </div>

        <h3 className="sec-title" style={{ fontSize: 19, marginTop: 32 }}>
          <T en="Hash table vs trie" zh="正面对决:哈希表 vs Trie" />
        </h3>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Ability" zh="能力 / 场景" />
                </th>
                <th>
                  <T
                    en="Hash table (HashSet / HashMap)"
                    zh="哈希表(HashSet / HashMap)"
                  />
                </th>
                <th>
                  <T en="Trie" zh="Trie(前缀树)" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <T
                    en="Exact lookup: is this word stored?"
                    zh="精确查找:某个词在不在?"
                  />
                </td>
                <td>
                  <span className="tr-vs-yes">✓</span>{" "}
                  <T
                    en="O(L) on average — O(1) in the number of stored words, but the whole key is read to compute the hash"
                    zh="平均 O(L) —— 对词数而言是 O(1),但要读完整个 key 才能算哈希"
                  />
                </td>
                <td>
                  <span className="tr-vs-yes">✓</span> O(L)
                </td>
              </tr>
              <tr>
                <td>
                  <T
                    en={
                      <>
                        <b>Prefix query: which words start with X?</b>
                      </>
                    }
                    zh={
                      <>
                        <b>前缀查询:哪些词以 X 开头?</b>
                      </>
                    }
                  />
                </td>
                <td>
                  <span className="tr-vs-no">✗</span>{" "}
                  <T
                    en="every stored key has to be read, O(N·L)"
                    zh="只能读遍所有键,O(N·L)"
                  />
                </td>
                <td>
                  <span className="tr-vs-yes">✓</span>{" "}
                  <T
                    en="O(L) to the prefix node, then collect its subtree"
                    zh="O(L) 直达前缀节点,再收集它的子树"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T
                    en="List every word in alphabetical order"
                    zh="按字典序输出所有词"
                  />
                </td>
                <td>
                  <span className="tr-vs-no">✗</span>{" "}
                  <T
                    en="unordered, needs a separate sort"
                    zh="无序,需要额外排序"
                  />
                </td>
                <td>
                  <span className="tr-vs-yes">✓</span>{" "}
                  <T
                    en="a DFS visiting children from a to z is already sorted"
                    zh="按 a→z 顺序 DFS,天然有序"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Memory" zh="内存" />
                </td>
                <td>
                  <T
                    en="compact: one entry per word"
                    zh="紧凑:一个词一条记录"
                  />
                </td>
                <td>
                  <T
                    en="shared beginnings save some, but one node per character plus a children table in each node costs more"
                    zh="共享开头能省一些,但「每字符一个节点 + 每节点一张表」的开销更大"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Availability" zh="现成程度" />
                </td>
                <td>
                  <T en="built into the language" zh="语言内置,拿来即用" />
                </td>
                <td>
                  <T en="usually written by hand (§04)" zh="通常要手写(§04)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="viz-msg">
          <T
            en={
              <>
                How to choose:{" "}
                <b>
                  if the question is only &quot;is it there&quot;, use a hash
                  table. As soon as the question mentions a prefix, a beginning
                  or completion, use a trie.
                </b>
              </>
            }
            zh={
              <>
                一句话选型:
                <b>
                  只问「在不在」,用哈希表;一旦问题里出现「前缀 / 开头 /
                  补全」,就该 Trie 登场。
                </b>
              </>
            }
          />
        </p>
      </Section>

      {/* ================= §04 Build one ================= */}
      <Section
        id="build"
        index="04"
        title={{
          en: "Write a trie (this is LC 208)",
          zh: "手写一个 Trie(这就是 LC 208 原题)",
        }}
        desc={{
          en: "Under 40 lines. The main version stores children in a hash map; each note gives the difference for the fixed 26-slot array.",
          zh: "不到 40 行。正文用哈希表版,注释里给出 26 槽数组版的差异",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                The code below is{" "}
                <strong>
                  a complete accepted answer to LeetCode 208, Implement Trie
                </strong>
                . The three methods share one private helper,{" "}
                <code>find</code>, which walks the path and returns nothing if an
                edge is missing. <code>search</code> and{" "}
                <code>startsWith</code> both call it and differ only in the last
                step. Read it once with the comments, then cover it and write{" "}
                <code>insert</code> from memory.
              </p>
            }
            zh={
              <p>
                下面这段代码,
                <strong>逐字就是 LeetCode 208「实现 Trie」的满分答案</strong>。
                三个方法共用一个私有小工具 <code>find</code>:沿路径走,
                缺边就返回空。<code>search</code> 和 <code>startsWith</code>{" "}
                都调它,只在最后一步分道扬镳。对着注释读一遍,再盖住默写一遍{" "}
                <code>insert</code>,它就是你的了。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="Trie"
          java={{
            code: {
              en: `// LC 208 · children in a hash map (works with any character set)
class Trie {
    // One node: a table from character to child, plus "does a word end here"
    static class Node {
        Map<Character, Node> children = new HashMap<>();
        boolean isEnd = false;
    }

    private final Node root = new Node();   // the root is the empty prefix

    public void insert(String word) {
        Node cur = root;
        for (char c : word.toCharArray()) {
            // create the edge if it is missing; computeIfAbsent does both steps
            cur = cur.children.computeIfAbsent(c, k -> new Node());
        }
        cur.isEnd = true;                   // a word ends here
    }

    public boolean search(String word) {
        Node node = find(word);
        return node != null && node.isEnd;  // arrived AND a word ends here
    }

    public boolean startsWith(String prefix) {
        return find(prefix) != null;        // arriving is enough
    }

    // follow the characters; return the last node, or null if an edge is missing
    private Node find(String s) {
        Node cur = root;
        for (char c : s.toCharArray()) {
            cur = cur.children.get(c);
            if (cur == null) return null;   // this edge does not exist
        }
        return cur;
    }
}`,
              zh: `// LC 208 · children 用哈希表存(字符集不受限)
class Trie {
    // 一个节点:一张「字符 → 子节点」表,加一位「有词在此结束吗」
    static class Node {
        Map<Character, Node> children = new HashMap<>();
        boolean isEnd = false;
    }

    private final Node root = new Node();   // 根节点 = 空前缀

    public void insert(String word) {
        Node cur = root;
        for (char c : word.toCharArray()) {
            // 缺这条边就现建;computeIfAbsent 把「查不到就放进去」一步做完
            cur = cur.children.computeIfAbsent(c, k -> new Node());
        }
        cur.isEnd = true;                   // 有词在此结束
    }

    public boolean search(String word) {
        Node node = find(word);
        return node != null && node.isEnd;  // 走得到,且有词在此结束
    }

    public boolean startsWith(String prefix) {
        return find(prefix) != null;        // 走得到就够了
    }

    // 沿字符走;返回终点节点,中途缺边则返回 null
    private Node find(String s) {
        Node cur = root;
        for (char c : s.toCharArray()) {
            cur = cur.children.get(c);
            if (cur == null) return null;   // 这条边不存在
        }
        return cur;
    }
}`,
            },
            note: {
              en: (
                <>
                  <b>Fixed array version:</b> replace{" "}
                  <code>Map&lt;Character, Node&gt;</code> with{" "}
                  <code>Node[] children = new Node[26]</code> and use{" "}
                  <code>c - &apos;a&apos;</code> as the index. It is faster, with
                  a smaller constant, but every node then holds 26 pointers, and
                  it only works if the input is lowercase ASCII.
                </>
              ),
              zh: (
                <>
                  <b>26 槽数组版:</b>把 <code>Map&lt;Character, Node&gt;</code>{" "}
                  换成 <code>Node[] children = new Node[26]</code>,用{" "}
                  <code>c - &apos;a&apos;</code> 当下标。更快、常数更小,
                  但每个节点从此固定占 26 个指针,而且只在输入为小写 ASCII 时成立。
                </>
              ),
            },
            hl: [15, 17, 22, 26],
          }}
          python={{
            code: {
              en: `# LC 208 · children in a dict (each Trie instance is both a node and a subtree)
class Trie:
    def __init__(self):
        self.children: dict[str, "Trie"] = {}    # character -> child node
        self.is_end = False                      # does a word end here

    def insert(self, word: str) -> None:
        node = self
        for c in word:
            if c not in node.children:           # create the edge if missing
                node.children[c] = Trie()
            node = node.children[c]
        node.is_end = True                       # a word ends here

    def search(self, word: str) -> bool:
        node = self._find(word)
        return node is not None and node.is_end  # arrived AND a word ends here

    def startsWith(self, prefix: str) -> bool:
        return self._find(prefix) is not None    # arriving is enough

    def _find(self, s: str):
        node = self
        for c in s:
            if c not in node.children:
                return None                      # this edge does not exist
            node = node.children[c]
        return node`,
              zh: `# LC 208 · children 用 dict 存(每个 Trie 实例既是节点也是子树)
class Trie:
    def __init__(self):
        self.children: dict[str, "Trie"] = {}    # 字符 → 子节点
        self.is_end = False                      # 有词在这里结束吗

    def insert(self, word: str) -> None:
        node = self
        for c in word:
            if c not in node.children:           # 缺这条边就现建
                node.children[c] = Trie()
            node = node.children[c]
        node.is_end = True                       # 有词在此结束

    def search(self, word: str) -> bool:
        node = self._find(word)
        return node is not None and node.is_end  # 走得到,且有词在此结束

    def startsWith(self, prefix: str) -> bool:
        return self._find(prefix) is not None    # 走得到就够了

    def _find(self, s: str):
        node = self
        for c in s:
            if c not in node.children:
                return None                      # 这条边不存在
            node = node.children[c]
        return node`,
            },
            note: {
              en: (
                <>
                  <b>Shorter:</b> <code>node.children.setdefault(c, Trie())</code>{" "}
                  removes the <code>if</code>. <b>Fixed array version:</b> a list
                  of length 26 indexed by{" "}
                  <code>ord(c) - ord(&apos;a&apos;)</code>.
                </>
              ),
              zh: (
                <>
                  <b>更短的写法:</b>
                  <code>node.children.setdefault(c, Trie())</code> 可以省掉{" "}
                  <code>if</code>。<b>26 槽数组版:</b>换成长度 26 的 list,下标{" "}
                  <code>ord(c) - ord(&apos;a&apos;)</code>。
                </>
              ),
            },
            hl: [11, 13, 17, 20],
          }}
          js={{
            code: {
              en: `// LC 208 · children in a Map (stable iteration order, no prototype keys)
class Trie {
  constructor() {
    this.children = new Map();   // character -> child node
    this.isEnd = false;          // does a word end here
  }

  insert(word) {
    let node = this;
    for (const c of word) {
      if (!node.children.has(c)) node.children.set(c, new Trie()); // create if missing
      node = node.children.get(c);
    }
    node.isEnd = true;           // a word ends here
  }

  search(word) {
    const node = this._find(word);
    return node !== null && node.isEnd;   // arrived AND a word ends here
  }

  startsWith(prefix) {
    return this._find(prefix) !== null;   // arriving is enough
  }

  _find(s) {
    let node = this;
    for (const c of s) {
      if (!node.children.has(c)) return null;  // this edge does not exist
      node = node.children.get(c);
    }
    return node;
  }
}`,
              zh: `// LC 208 · children 用 Map 存(迭代顺序稳定,不会碰到原型上的键)
class Trie {
  constructor() {
    this.children = new Map();   // 字符 → 子节点
    this.isEnd = false;          // 有词在这里结束吗
  }

  insert(word) {
    let node = this;
    for (const c of word) {
      if (!node.children.has(c)) node.children.set(c, new Trie()); // 缺就建
      node = node.children.get(c);
    }
    node.isEnd = true;           // 有词在此结束
  }

  search(word) {
    const node = this._find(word);
    return node !== null && node.isEnd;   // 走得到,且有词在此结束
  }

  startsWith(prefix) {
    return this._find(prefix) !== null;   // 走得到就够了
  }

  _find(s) {
    let node = this;
    for (const c of s) {
      if (!node.children.has(c)) return null;  // 这条边不存在
      node = node.children.get(c);
    }
    return node;
  }
}`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> a plain object <code>{"{}"}</code> also
                  works for children, but a key such as{" "}
                  <code>__proto__</code> would then reach the prototype instead
                  of a child. Use <code>Object.create(null)</code> or a{" "}
                  <code>Map</code>. <b>Fixed array version:</b>{" "}
                  <code>new Array(26)</code> with{" "}
                  <code>c.charCodeAt(0) - 97</code>.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>用普通对象 <code>{"{}"}</code> 存 children
                  也能跑,但键若是 <code>__proto__</code> 之类,
                  取到的会是原型而不是子节点。建议用{" "}
                  <code>Object.create(null)</code> 或 <code>Map</code>。
                  <b>26 槽数组版:</b>
                  <code>new Array(26)</code> + <code>c.charCodeAt(0) - 97</code>。
                </>
              ),
            },
            hl: [11, 14, 19, 23],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Check that you understood it (with the code covered)",
            zh: "检验你真的懂了(合上代码回答)",
          }}
        >
          <T
            en={
              <p>
                1. Which single line is the difference between search and
                startsWith? (the <code>&amp;&amp; isEnd</code> test) 2. Why does
                insert create a missing child while search returns nothing? 3. In
                the cost O(L), is L the <b>length of the word</b> or the{" "}
                <b>number of words</b>? If all three answers come quickly, LC 208
                is yours.
              </p>
            }
            zh={
              <p>
                ① search 和 startsWith 的区别落在哪一行?(答:那个{" "}
                <code>&amp;&amp; isEnd</code>)② 为什么 insert 遇到缺失的 child
                就新建,而 search 遇到就返回空?③ 复杂度 O(L) 里的 L,指的是
                <b>词长</b>还是<b>词数</b>?—— 三问都能秒答,LC 208 就是你的了。
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
          en: "Three languages: no built-in trie, only different children tables",
          zh: "三语言对照:都没有内置 Trie,区别全在 children 怎么存",
        }}
        desc={{
          en: "None of the three standard libraries ships a trie, but each has a convenient container for children.",
          zh: "Java / Python / JavaScript 标准库都不带 Trie —— 但都给了顺手的容器来搭 children",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                Unlike an array or a hash table,{" "}
                <strong>
                  none of the three standard libraries contains a trie
                </strong>
                , so using one in an interview means writing it (§04). The
                comparison here is therefore not about APIs. It is about{" "}
                <strong>
                  which container holds the children of one node
                </strong>
                , and what to watch out for in each language. The decision is the
                same one as before: <b>a fixed-size array</b> (fastest, wasteful,
                lowercase ASCII only) or <b>a hash map</b> (compact on sparse
                data, any character).
              </p>
            }
            zh={
              <p>
                和数组、哈希表不同,<strong>三种语言的标准库里都没有 Trie</strong>
                —— 面试要用就得手写(§04)。所以这一节比的不是 API,而是
                <strong>同一个节点的 children 用什么容器装</strong>,
                以及各自要注意什么。抉择还是那两条:<b>定长数组</b>(最快、
                费内存、只认小写 ASCII)vs <b>哈希表</b>(稀疏数据省内存、
                任意字符集)。
              </p>
            }
          />
        </div>
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Language" zh="语言" />
                </th>
                <th>
                  <T
                    en="Two typical ways to hold children"
                    zh="children 的两种典型写法"
                  />
                </th>
                <th>
                  <T en="What to watch out for" zh="坑 / 注意" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>Java</b>
                </td>
                <td>
                  <code>TrieNode[] next = new TrieNode[26]</code>{" "}
                  <T en="(fast)" zh="(快)" />
                  <br />
                  <T en="or" zh="或" />{" "}
                  <code>Map&lt;Character, TrieNode&gt;</code>{" "}
                  <T en="(general)" zh="(通用)" />
                </td>
                <td>
                  <T
                    en={
                      <>
                        For the array, the index is{" "}
                        <code>c - &apos;a&apos;</code>. For the map,{" "}
                        <code>computeIfAbsent</code> does &quot;look up, or
                        create and store&quot; in one line.
                      </>
                    }
                    zh={
                      <>
                        数组版下标是 <code>c - &apos;a&apos;</code>;Map 版用{" "}
                        <code>computeIfAbsent</code> 一行完成「查不到就新建并存入」。
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>Python</b>
                </td>
                <td>
                  <code>dict</code>: <code>{"self.children = {}"}</code>
                  <br />
                  <T en="or a list of length 26" zh="或长度 26 的 list" />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <code>setdefault</code> or{" "}
                        <code>defaultdict</code> shortens insertion. The shortest
                        version of all is{" "}
                        <b>a nested dict used as the whole tree</b>, which is
                        what the LC 212 solution below does.
                      </>
                    }
                    zh={
                      <>
                        <code>setdefault</code> / <code>defaultdict</code>{" "}
                        让插入更短;最省事的写法是
                        <b>直接用嵌套 dict 当整棵树</b>,下面 LC 212 就是这么写的。
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>JavaScript</b>
                </td>
                <td>
                  <code>Map</code>{" "}
                  <T en="(recommended)" zh="(推荐)" />
                  <br />
                  <T en="or a plain object" zh="或普通对象" />{" "}
                  <code>Object.create(null)</code>
                </td>
                <td>
                  <T
                    en={
                      <>
                        A plain object inherits keys such as{" "}
                        <code>__proto__</code> from its prototype, so a lookup
                        can return something that is not a child.{" "}
                        <code>Map</code> avoids that and keeps insertion order.
                      </>
                    }
                    zh={
                      <>
                        普通对象会从原型上继承 <code>__proto__</code>{" "}
                        之类的键,查 child 可能取到不是子节点的东西;
                        <code>Map</code> 没有这个问题,迭代顺序也稳定。
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
            en: "Does a trie actually save memory?",
            zh: "内存账:Trie 到底省不省?",
          }}
        >
          <T
            en={
              <p>
                The intuition that shared prefixes save space depends on the
                data. When words <b>overlap a lot at the front</b> — natural
                language, URLs, file paths, phone numbers — folding the common
                beginnings does save space. When the words are short and share
                almost nothing, a trie costs <b>more</b> than storing the strings:
                one node per character, plus a children table in every node, with
                26 pointers each in the array version.{" "}
                <b>The pointer overhead can easily exceed the characters saved.</b>{" "}
                Real systems therefore use the compressed forms —{" "}
                <b>radix tree</b> or <b>double-array trie</b> — which merge chains
                of single-child nodes into one edge, at the cost of a more
                complicated insert. The conclusion to keep: a trie is chosen for
                prefix queries, not to save memory.
              </p>
            }
            zh={
              <p>
                「共享前缀 → 省空间」这个直觉,要看数据。词与词
                <b>在开头重叠得多</b>(自然语言、URL、文件路径、电话号码),
                折叠公共开头确实省;可若词很短、彼此几乎没有共同开头,
                Trie 比直接存字符串<b>更费</b>:每个字符一个节点,
                每个节点还带一张 children 表(数组版一律 26 个指针)。
                <b>指针开销很容易超过省下的字符。</b>所以工程里常用它的压缩形态 ——
                <b>基数树 Radix Tree</b> 或<b>双数组 Trie</b>:
                把「只有一个孩子的节点链」合并成一条边,代价是插入更复杂。
                结论:选 Trie 是为了前缀查询,不是为了省内存。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §06 Patterns ================= */}
      <Section
        id="patterns"
        index="06"
        title={{
          en: "Patterns: three problems that cover how a trie is used",
          zh: "套路与精讲:三道题覆盖 Trie 的三种用法",
        }}
        desc={{
          en: "A: walk the template. B: a wildcard turns the walk into a DFS. C: the trie prunes a grid search.",
          zh: "A 走一遍模板 · B 通配符把「走」变成 DFS · C 用 Trie 给网格搜索剪枝",
        }}
        badge={
          <span className="chip" data-tone="warn">
            <T en="★ Interview core" zh="★ 面试核心" />
          </span>
        }
      >
        <div className="prose">
          <T
            en={
              <p>
                Almost every trie problem is the LC 208 template plus one
                addition. <strong>A</strong> walks the template itself, frame by
                frame: how insertion reuses a prefix, and the three ways a lookup
                can end. <strong>B</strong> adds a wildcard to the query, which
                forces the walk to branch at a node and become a DFS.{" "}
                <strong>C</strong> combines the trie with backtracking on a grid,
                where the trie is used to <strong>cut off branches early</strong>
                . That is where a trie helps most.
              </p>
            }
            zh={
              <p>
                Trie 的题目几乎都是「208 模板 + 一点新东西」。<strong>A</strong>{" "}
                把模板本身逐帧走一遍:插入怎么复用前缀,查询有哪三种结局。
                <strong>B</strong> 给查询加一个通配符,逼着「走」在节点处分叉,
                变成 DFS。<strong>C</strong> 把 Trie 和网格回溯结合,
                用它<strong>提前砍掉分支</strong> —— 这是 Trie 最有价值的用法。
              </p>
            }
          />
        </div>

        {/* — Walkthrough A — */}
        <div className="sec-head" style={{ marginTop: 40 }}>
          <span className="sec-index">
            <T en="Deep dive A" zh="精讲 A" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 208 · Implement Trie (walking the template)"
              zh="LC 208 · 实现 Trie(把模板走一遍)"
            />
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
                <b>The task:</b> implement insert, search and startsWith.
                <b> Brute force:</b> keep every word in a{" "}
                <code>HashSet&lt;String&gt;</code>. search is O(L), but
                startsWith has to read every word in the set and compare its
                beginning, which is <b>O(N·L)</b> and fails once the dictionary
                is large.
                <b> The answer</b> is the trie from §04. Instead of
                repeating the code, <strong>run it</strong>: insert{" "}
                <code>app</code>, then insert <code>apple</code> to see the
                prefix reused, then four lookups that show all three possible
                endings.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>实现 insert / search / startsWith 三个方法。
                <b> 暴力:</b>用一个 <code>HashSet&lt;String&gt;</code> 存所有词 ——
                search 确实 O(L),但 startsWith 只能读遍集合里每个词、逐个比对开头,
                <b>O(N·L)</b>,词典一大就废。
                <b> 正解:</b>就是 §04 那份 Trie。代码不再重复,
                我们把它<strong>跑一遍</strong>:先插入 <code>app</code>,
                再插入 <code>apple</code>(看前缀怎么复用),然后做四次查询,
                把三种结局都看一遍。
              </p>
            }
          />
        </div>
        <TrieStepper
          title={{
            en: "LC 208 · insert app and apple, then look words up, one frame at a time",
            zh: "LC 208 · 插入 app / apple 再查询,逐帧慢放",
          }}
          nodes={A208_NODES}
          edges={A208_EDGES}
          frames={A208_FRAMES}
          w={640}
          h={420}
        />
        <Callout
          tone="win"
          title={{
            en: "Cost, and the follow-up questions",
            zh: "复杂度 & 面试追问",
          }}
        >
          <T
            en={
              <p>
                All three methods are <BigO o="n" label="O(L)" />. The space is
                the number of nodes times the size of one children table, and
                the number of nodes is at most the total number of characters
                inserted. Follow-ups to expect: 1.{" "}
                <b>What is the difference between startsWith and search?</b> One{" "}
                <code>isEnd</code> test. 2.{" "}
                <b>How do you delete a word?</b> Walk to the last node and clear
                isEnd; to reclaim memory, remove nodes bottom-up while they have
                no children and end no word. 3.{" "}
                <b>How do you count the words under a prefix?</b> Keep a counter
                on each node and add one to every node along the path during
                insert (the idea behind LC 677).
              </p>
            }
            zh={
              <p>
                三个方法均 <BigO o="n" label="O(L)" />,空间 = 节点数(至多为插入的总字符数)
                × 一张 children 表的大小。追问预备:①{" "}
                <b>「startsWith 和 search 差在哪?」</b>—— 差一个{" "}
                <code>isEnd</code> 判断。②<b>「怎么删除一个词?」</b>——
                走到末节点清掉 isEnd;若要回收内存,自底向上删掉
                「没有孩子、也不是任何词尾」的节点。③
                <b>「怎么统计某前缀下有几个词?」</b>—— 在节点上存一个计数,
                insert 时沿路每个节点 +1(这就是 LC 677 的思路)。
              </p>
            }
          />
        </Callout>

        {/* — Walkthrough B — */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Deep dive B" zh="精讲 B" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 211 · Add and search words (the wildcard '.')"
              zh="LC 211 · 添加与搜索单词(通配符 '.')"
            />
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
                <b>The task:</b> support addWord, and search where the string may
                contain <code>&apos;.&apos;</code>, which{" "}
                <strong>matches any single letter</strong>.
                <b> The difficulty:</b> an ordinary character tells you which
                edge to take, but <code>&apos;.&apos;</code>{" "}
                <strong>does not</strong>, so{" "}
                <strong>every child edge has to be tried</strong>. A loop that
                recurses once per branch is a DFS with backtracking.
                <b> The answer:</b> addWord is LC 208 unchanged. search becomes
                recursive: an ordinary character descends into the one matching
                child; <code>&apos;.&apos;</code> loops over{" "}
                <strong>every</strong> child of the current node and recurses
                into each, returning true as soon as one succeeds.
              </p>
            }
            zh={
              <p>
                <b>题意:</b>设计一个结构支持 addWord,以及 search —— search
                的字符串里可能出现 <code>&apos;.&apos;</code>,它
                <strong>匹配任意一个字母</strong>。
                <b> 卡点:</b>普通字符告诉你该走哪条边,而{" "}
                <code>&apos;.&apos;</code>
                <strong>不告诉你</strong>,于是<strong>每条子边都得试</strong>。
                「对所有分支各递归一次」的循环,就是带回溯的 DFS。
                <b> 正解:</b>addWord 照搬 LC 208;search 改成递归:
                普通字符只钻对应的那个 child,遇到 <code>&apos;.&apos;</code>{" "}
                就遍历当前节点的<strong>所有</strong> child 分别递归,
                任意一条成功就返回 true。
              </p>
            }
          />
        </div>
        <TrieStepper
          title={{
            en: 'LC 211 · the trie holds bad, dad and mad; searching ".ad" branches at the root',
            zh: "LC 211 · Trie 里存 bad / dad / mad,搜索 “.ad” 的分叉过程",
          }}
          nodes={A211_NODES}
          edges={A211_EDGES}
          frames={A211_FRAMES}
          w={640}
          h={320}
        />
        <CodeTabs
          title="WordDictionary"
          java={{
            code: {
              en: `// LC 211 · children in a fixed array of 26 (easy to loop over for '.')
class WordDictionary {
    private final WordDictionary[] children = new WordDictionary[26];
    private boolean isEnd = false;

    public void addWord(String word) {          // identical to LC 208 insert
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
        if (i == word.length()) return node.isEnd;   // at the end: does a word end here
        char c = word.charAt(i);
        if (c == '.') {                              // wildcard: try every branch
            for (WordDictionary nxt : node.children)
                if (dfs(word, i + 1, nxt)) return true;
            return false;
        }
        return dfs(word, i + 1, node.children[c - 'a']); // ordinary: one edge only
    }
}`,
              zh: `// LC 211 · children 用定长 26 数组(遇到 '.' 时便于遍历所有分支)
class WordDictionary {
    private final WordDictionary[] children = new WordDictionary[26];
    private boolean isEnd = false;

    public void addWord(String word) {          // 和 LC 208 的 insert 完全一样
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
        if (i == word.length()) return node.isEnd;   // 走到底:有词在此结束吗
        char c = word.charAt(i);
        if (c == '.') {                              // 通配符:每条分支都试
            for (WordDictionary nxt : node.children)
                if (dfs(word, i + 1, nxt)) return true;
            return false;
        }
        return dfs(word, i + 1, node.children[c - 'a']); // 普通字符:只走一条边
    }
}`,
            },
            note: {
              en: (
                <>
                  <b>Cost:</b> addWord is O(L). With no wildcard, search is O(L).
                  A pattern that begins with several dots fans out towards{" "}
                  <b>O(26^L)</b>, but the search never visits more nodes than the
                  trie contains, and a missing edge stops a branch at once.
                </>
              ),
              zh: (
                <>
                  <b>复杂度:</b>addWord O(L);没有通配符时 search 也是 O(L)。
                  开头是一串 &apos;.&apos; 的模式会朝 <b>O(26^L)</b> 扇出,
                  但搜索访问的节点数不会超过整棵树的节点数,而且缺边会立刻中断一条分支。
                </>
              ),
            },
            hl: [24, 25, 26, 27, 29],
          }}
          python={{
            code: {
              en: `# LC 211 · children in a dict; '.' loops over children.values()
class WordDictionary:
    def __init__(self):
        self.children: dict[str, "WordDictionary"] = {}
        self.is_end = False

    def addWord(self, word: str) -> None:            # same as LC 208 insert
        node = self
        for c in word:
            node = node.children.setdefault(c, WordDictionary())
        node.is_end = True

    def search(self, word: str) -> bool:
        def dfs(i: int, node: "WordDictionary") -> bool:
            if i == len(word):
                return node.is_end                   # at the end: word ends here?
            c = word[i]
            if c == '.':                             # wildcard: try every child
                return any(dfs(i + 1, nxt) for nxt in node.children.values())
            nxt = node.children.get(c)               # ordinary: one edge only
            return dfs(i + 1, nxt) if nxt else False
        return dfs(0, self)`,
              zh: `# LC 211 · children 用 dict;遇到 '.' 就遍历 children.values()
class WordDictionary:
    def __init__(self):
        self.children: dict[str, "WordDictionary"] = {}
        self.is_end = False

    def addWord(self, word: str) -> None:            # 与 LC 208 的 insert 相同
        node = self
        for c in word:
            node = node.children.setdefault(c, WordDictionary())
        node.is_end = True

    def search(self, word: str) -> bool:
        def dfs(i: int, node: "WordDictionary") -> bool:
            if i == len(word):
                return node.is_end                   # 走到底:有词在此结束吗
            c = word[i]
            if c == '.':                             # 通配符:每个 child 都试
                return any(dfs(i + 1, nxt) for nxt in node.children.values())
            nxt = node.children.get(c)               # 普通字符:只走一条边
            return dfs(i + 1, nxt) if nxt else False
        return dfs(0, self)`,
            },
            note: {
              en: (
                <>
                  <code>any(...)</code> stops at the first branch that returns
                  True, so the remaining branches are never tried.
                </>
              ),
              zh: (
                <>
                  <code>any(...)</code> 天然短路:第一条返回 True 的分支之后,
                  其余分支不再尝试。
                </>
              ),
            },
            hl: [18, 19, 20, 21],
          }}
          js={{
            code: {
              en: `// LC 211 · children in a Map; '.' loops over children.values()
class WordDictionary {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }

  addWord(word) {                          // same as LC 208 insert
    let node = this;
    for (const c of word) {
      if (!node.children.has(c)) node.children.set(c, new WordDictionary());
      node = node.children.get(c);
    }
    node.isEnd = true;
  }

  search(word) {
    const dfs = (i, node) => {
      if (i === word.length) return node.isEnd;      // at the end: word ends here?
      const c = word[i];
      if (c === '.') {                               // wildcard: try every branch
        for (const nxt of node.children.values())
          if (dfs(i + 1, nxt)) return true;
        return false;
      }
      const nxt = node.children.get(c);              // ordinary: one edge only
      return nxt ? dfs(i + 1, nxt) : false;
    };
    return dfs(0, this);
  }
}`,
              zh: `// LC 211 · children 用 Map;遇到 '.' 就遍历 children.values()
class WordDictionary {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }

  addWord(word) {                          // 与 LC 208 的 insert 相同
    let node = this;
    for (const c of word) {
      if (!node.children.has(c)) node.children.set(c, new WordDictionary());
      node = node.children.get(c);
    }
    node.isEnd = true;
  }

  search(word) {
    const dfs = (i, node) => {
      if (i === word.length) return node.isEnd;      // 走到底:有词在此结束吗
      const c = word[i];
      if (c === '.') {                               // 通配符:每条分支都试
        for (const nxt of node.children.values())
          if (dfs(i + 1, nxt)) return true;
        return false;
      }
      const nxt = node.children.get(c);              // 普通字符:只走一条边
      return nxt ? dfs(i + 1, nxt) : false;
    };
    return dfs(0, this);
  }
}`,
            },
            note: {
              en: (
                <>
                  The loop only visits children that exist, so the number of
                  paths actually explored is far below 26^L. The shape of the
                  trie does the pruning by itself.
                </>
              ),
              zh: (
                <>
                  循环只走存在的 child,所以真正探索的路径远少于 26^L ——
                  Trie 的结构本身就在剪枝。
                </>
              ),
            },
            hl: [21, 22, 23, 24, 26, 27],
          }}
        />

        {/* — Walkthrough C — */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Deep dive C" zh="精讲 C" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 212 · Word Search II (using a trie to prune)"
              zh="LC 212 · 单词搜索 II(用 Trie 剪枝)"
            />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="hard">
              HARD
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <>
                <p>
                  <b>The task:</b> given a grid of letters and a list of words,
                  find every word that can be spelled by moving between{" "}
                  <strong>adjacent cells</strong> (up, down, left, right) without
                  using a cell twice.
                  <b> Brute force:</b> run one grid search{" "}
                  <strong>per word</strong>. With a few thousand words, many of
                  which begin the same way, the search starting from a given c is
                  repeated over and over, and the solution times out.
                </p>
                <p>
                  <b>Why a trie helps:</b> build one trie from all the words,
                  then walk the grid <strong>once</strong>, moving{" "}
                  <strong>down the trie in step with the DFS</strong>. Two things
                  follow:
                </p>
              </>
            }
            zh={
              <>
                <p>
                  <b>题意:</b>给一个字母网格 board 和一个词表 words,
                  找出所有能在网格中<strong>沿相邻格子</strong>(上下左右、
                  同一格不重复用)拼出的单词。
                  <b> 暴力:</b>对 words 里<strong>每个词</strong>各做一次网格搜索。
                  词表一大(几千个词)、很多词开头还相同,
                  「从某个 c 出发」这件事会被<strong>重复搜千百遍</strong>,稳稳超时。
                </p>
                <p>
                  <b>为什么 Trie 能救场:</b>先把所有词建成一棵 Trie,
                  然后<strong>只在网格上走一次</strong>,
                  <strong>DFS 每走一步,就在 Trie 上同步下沉一步</strong>。
                  两个结果随之而来:
                </p>
              </>
            }
          />
          <ul>
            <li>
              <T
                en={
                  <>
                    <strong>One DFS tests many words at once.</strong> The{" "}
                    <code>c-a</code> spelled out on the grid is the beginning of
                    cat, car and card at the same time, so one walk checks all of
                    them instead of starting again for each word.
                  </>
                }
                zh={
                  <>
                    <strong>一次 DFS 同时测一批词。</strong>网格上走出的{" "}
                    <code>c-a</code>,同时是 cat、car、card 的开头 ——
                    一趟走完就把它们都验了,不必每个词从头再来。
                  </>
                }
              />
            </li>
            <li>
              <T
                en={
                  <>
                    <strong>
                      A missing edge ends the branch immediately, and that is the
                      pruning.
                    </strong>{" "}
                    If the current letter has <strong>no child</strong> at the
                    current trie node, no word starts this way, so every longer
                    path from here is useless. <b>Return at once</b> and the
                    whole branch disappears. This one check is what brings the
                    search back into a workable range.
                  </>
                }
                zh={
                  <>
                    <strong>缺边就立刻结束这条分支 —— 这就是剪枝。</strong>
                    如果当前字母在当前 Trie 节点上<strong>没有对应的 child</strong>,
                    说明没有任何词这样开头,从这里再往下走都是白走。
                    <b>立即返回</b>,整条分支消失。正是这一步把搜索拉回可接受的范围。
                  </>
                }
              />
            </li>
          </ul>
        </div>
        <StaticTrie
          words={["oath", "pea", "eat", "rain"]}
          caption={{
            en: (
              <>
                The word list oath, pea, eat, rain built into a trie. The grid
                DFS moves down this tree in step with each move on the board. As
                soon as a letter has <b>no matching edge here</b>, the search
                turns back: no word starts that way, so continuing is wasted
                work.
              </>
            ),
            zh: (
              <>
                词表 oath / pea / eat / rain 建成的 Trie。网格 DFS
                每走一格,就在这棵树上同步下沉一步。一旦某个字母在树上
                <b>找不到对应的边</b>,立刻掉头 ——
                没有词这样开头,继续搜纯属浪费。
              </>
            ),
          }}
        />
        <div className="prose" style={{ marginTop: 6 }}>
          <T
            en={
              <p>
                Two implementation details help. First,{" "}
                <strong>store the whole word on the node where it ends</strong>{" "}
                instead of only a boolean, so a match can be collected without
                rebuilding the string. Second,{" "}
                <strong>clear that field after collecting it</strong>, which
                removes duplicates without any extra bookkeeping.
              </p>
            }
            zh={
              <p>
                实现上有两个小技巧。其一,
                <strong>在词尾节点直接存整个单词</strong>(而不是只放一个布尔位),
                命中时不必回头拼字符串。其二,
                <strong>收集之后把该字段清空</strong>,
                不用额外记录就完成了去重。
              </p>
            }
          />
        </div>
        <CodeTabs
          title="findWords"
          java={{
            code: {
              en: `// LC 212 · trie (the word is stored at its last node) + grid backtracking
class Solution {
    static class Node {
        Node[] next = new Node[26];
        String word = null;                 // not null = a word ends here
    }
    private final List<String> res = new ArrayList<>();

    public List<String> findWords(char[][] board, String[] words) {
        Node root = build(words);
        for (int r = 0; r < board.length; r++)
            for (int c = 0; c < board[0].length; c++)
                dfs(board, r, c, root);
        return res;
    }

    private Node build(String[] words) {    // build the trie
        Node root = new Node();
        for (String w : words) {
            Node cur = root;
            for (char ch : w.toCharArray()) {
                int i = ch - 'a';
                if (cur.next[i] == null) cur.next[i] = new Node();
                cur = cur.next[i];
            }
            cur.word = w;                    // store the word at its last node
        }
        return root;
    }

    private void dfs(char[][] board, int r, int c, Node node) {
        char ch = board[r][c];
        if (ch == '#' || node.next[ch - 'a'] == null) return; // used already, or no word starts this way
        node = node.next[ch - 'a'];
        if (node.word != null) {             // a complete word ends here
            res.add(node.word);
            node.word = null;                // clear it so it is collected once
        }
        board[r][c] = '#';                   // mark this cell as used
        int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};
        for (int[] d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length)
                dfs(board, nr, nc, node);
        }
        board[r][c] = ch;                    // backtrack: restore the cell
    }
}`,
              zh: `// LC 212 · Trie(词尾节点上存整词)+ 网格回溯
class Solution {
    static class Node {
        Node[] next = new Node[26];
        String word = null;                 // 非 null = 有词在此结束
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
            cur.word = w;                    // 把整词存在它的末节点上
        }
        return root;
    }

    private void dfs(char[][] board, int r, int c, Node node) {
        char ch = board[r][c];
        if (ch == '#' || node.next[ch - 'a'] == null) return; // 本格已用过,或没有词这样开头
        node = node.next[ch - 'a'];
        if (node.word != null) {             // 有一个完整单词在此结束
            res.add(node.word);
            node.word = null;                // 清空,保证只收集一次
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
            },
            note: {
              en: (
                <>
                  <b>Cost:</b> building the trie is O(total characters in the
                  word list). The grid DFS is O(M·N·4^Lmax) in the worst case,
                  but the trie check removes most branches long before that.{" "}
                  <code>node.word = null</code> is what keeps a word from being
                  collected twice.
                </>
              ),
              zh: (
                <>
                  <b>复杂度:</b>建 Trie 是 O(词表总字符数);网格 DFS 最坏
                  O(M·N·4^Lmax),但 Trie 的那一次检查会提前砍掉大部分分支。
                  <code>node.word = null</code> 是「同一个词只收集一次」的关键。
                </>
              ),
            },
            hl: [33, 35, 36, 37],
          }}
          python={{
            code: {
              en: `# LC 212 · a nested dict as the trie (key '#' holds the word), grid backtracking
class Solution:
    def findWords(self, board: list[list[str]], words: list[str]) -> list[str]:
        root = {}
        for w in words:                       # build the trie (nested dicts)
            node = root
            for c in w:
                node = node.setdefault(c, {})
            node['#'] = w                     # '#' holds the word and marks the end

        m, n, res = len(board), len(board[0]), []

        def dfs(r, c, node):
            ch = board[r][c]
            nxt = node.get(ch)
            if nxt is None:                   # no word starts this way -> stop
                return
            w = nxt.get('#')
            if w:                             # a complete word ends here
                res.append(w)
                nxt.pop('#')                  # collect it only once
            board[r][c] = '#'                 # mark this cell as used
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n:
                    dfs(nr, nc, nxt)
            board[r][c] = ch                  # backtrack: restore the cell

        for r in range(m):
            for c in range(n):
                dfs(r, c, root)
        return res`,
              zh: `# LC 212 · 用嵌套 dict 当 Trie('#' 键存整词),网格回溯
class Solution:
    def findWords(self, board: list[list[str]], words: list[str]) -> list[str]:
        root = {}
        for w in words:                       # 建 Trie(嵌套 dict)
            node = root
            for c in w:
                node = node.setdefault(c, {})
            node['#'] = w                     # '#' 存整词,同时兼作结束标记

        m, n, res = len(board), len(board[0]), []

        def dfs(r, c, node):
            ch = board[r][c]
            nxt = node.get(ch)
            if nxt is None:                   # 没有词这样开头 → 停
                return
            w = nxt.get('#')
            if w:                             # 有一个完整单词在此结束
                res.append(w)
                nxt.pop('#')                  # 只收集一次
            board[r][c] = '#'                 # 标记本格已用
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n:
                    dfs(nr, nc, nxt)
            board[r][c] = ch                  # 回溯:还原本格

        for r in range(m):
            for c in range(n):
                dfs(r, c, root)
        return res`,
            },
            note: {
              en: (
                <>
                  A nested dict is the shortest way to write a trie in Python: no
                  node class is needed. A key that is not a letter, here{" "}
                  <code>&apos;#&apos;</code>, stores the word without colliding
                  with a character key.
                </>
              ),
              zh: (
                <>
                  嵌套 dict 是 Python 里最省事的 Trie 写法 —— 连节点类都不用定义。
                  用一个非字母的键(这里是 <code>&apos;#&apos;</code>)存整词,
                  不会和普通字符键冲突。
                </>
              ),
            },
            hl: [15, 16, 17, 19, 20, 21],
          }}
          js={{
            code: {
              en: `// LC 212 · a nested object as the trie (field word holds the word), grid backtracking
var findWords = function (board, words) {
  const root = {};
  for (const w of words) {                 // build the trie
    let node = root;
    for (const c of w) node = node[c] ??= {};
    node.word = w;                          // holds the word and marks the end
  }
  const m = board.length, n = board[0].length, res = [];

  const dfs = (r, c, node) => {
    const ch = board[r][c];
    const nxt = node[ch];
    if (!nxt) return;                        // no word starts this way -> stop
    if (nxt.word) { res.push(nxt.word); nxt.word = null; } // collect once
    board[r][c] = '#';                       // mark this cell as used
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n) dfs(nr, nc, nxt);
    }
    board[r][c] = ch;                        // backtrack: restore the cell
  };

  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++)
      dfs(r, c, root);
  return res;
};`,
              zh: `// LC 212 · 用嵌套对象当 Trie(word 字段存整词),网格回溯
var findWords = function (board, words) {
  const root = {};
  for (const w of words) {                 // 建 Trie
    let node = root;
    for (const c of w) node = node[c] ??= {};
    node.word = w;                          // 存整词,同时兼作结束标记
  }
  const m = board.length, n = board[0].length, res = [];

  const dfs = (r, c, node) => {
    const ch = board[r][c];
    const nxt = node[ch];
    if (!nxt) return;                        // 没有词这样开头 → 停
    if (nxt.word) { res.push(nxt.word); nxt.word = null; } // 只收集一次
    board[r][c] = '#';                       // 标记本格已用
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n) dfs(nr, nc, nxt);
    }
    board[r][c] = ch;                        // 回溯:还原本格
  };

  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++)
      dfs(r, c, root);
  return res;
};`,
            },
            note: {
              en: (
                <>
                  <code>node[c] ??= {"{}"}</code> means &quot;reuse it if it
                  exists, create it if not&quot;. Storing the word in a{" "}
                  <code>word</code> field and setting it to null after collecting
                  does both jobs at once: collect, and remove duplicates. The
                  keys here are single characters, so a plain object is safe.
                </>
              ),
              zh: (
                <>
                  <code>node[c] ??= {"{}"}</code> 就是「有就复用,没有就建」。
                  用 <code>word</code> 字段存整词、收集后置 null,
                  一举完成「收集」和「去重」。这里的键都是单个字符,
                  所以用普通对象是安全的。
                </>
              ),
            },
            hl: [13, 14, 15],
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "The one sentence to remember",
            zh: "一句话记住这道题",
          }}
        >
          <T
            en={
              <p>
                <b>
                  The grid is not searched once per word. One DFS over the grid
                  follows the trie and tests every word on the way.
                </b>{" "}
                The trie plays two parts: words that share a beginning share one
                path, and a beginning that no word has ends the branch at once.
                This is the general shape of multi-pattern matching. Taking it
                further leads to the Aho-Corasick automaton, which adds failure
                links to a trie so the search never has to restart.
              </p>
            }
            zh={
              <p>
                <b>
                  不是「为每个词搜一遍网格」,而是「网格上的一次 DFS 沿着 Trie
                  走,顺路把所有词都测了」。
                </b>{" "}
                Trie 在这里担两个角色:开头相同的词共用一条路径;
                没有任何词有的开头,立刻结束这条分支。这是「多模式串匹配」的通用形状。
                再往前一步就是 AC 自动机(Aho-Corasick):在 Trie 上加失配指针,
                让搜索永远不必从头重来。
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
          en: "Problem set: 8 trie problems",
          zh: "高频题单:前缀树 8 题",
        }}
        desc={{
          en: "From the template up to the 0/1 trie. Progress is stored in your browser. Think for 30 seconds before opening a hint.",
          zh: "从模板题铺到 0/1 Trie。勾选进度存在本地,先想 30 秒再看提示",
        }}
        badge={
          <span className="chip">
            <T en="Grouped by pattern" zh="按套路分组" />
          </span>
        }
      >
        <ProblemSet ch="trie" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Six correct answers light this chapter green.",
          zh: "6 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="trie" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                A trie exists for one reason:{" "}
                <b>
                  a hash table turns the whole key into one number and loses the
                  beginning of the key
                </b>
                , so it cannot answer prefix questions. A trie keeps words with
                the same beginning on the same path, which turns &quot;starts
                with X&quot; into walking down that path.
              </>
            ),
            zh: (
              <>
                Trie 的存在只有一个理由:
                <b>哈希表把整个 key 算成一个数,丢掉了「开头」这个信息</b>,
                因此答不了前缀问题。Trie 让开头相同的词待在同一条路径上,
                「以 X 开头」就退化成「顺着这条路往下走」。
              </>
            ),
          },
          {
            en: (
              <>
                The structure is small: a node holds{" "}
                <b>children (character to child node)</b> and{" "}
                <b>isEnd (a boolean)</b>. The characters sit on the{" "}
                <b>edges</b>, so the path spells the word and the node itself
                stores no word. <b>isEnd is required</b>: without it, cat cannot
                be told apart from the part of cattle that passes through the
                same nodes.
              </>
            ),
            zh: (
              <>
                结构极简:节点 = <b>children(字符 → 子节点)</b> +{" "}
                <b>isEnd(布尔)</b>。字符贴在<b>边</b>上,拼出词的是路径,
                节点本身不存词。<b>isEnd 必不可少</b> —— 没有它,
                就分不清 cat 和「cattle 路过同一批节点」这两回事。
              </>
            ),
          },
          {
            en: (
              <>
                insert, search and startsWith are all <b>O(L)</b>, where L is the{" "}
                <b>length of the string, not the number of words</b>. This
                independence from the size of the dictionary is the point of the
                structure. search differs from startsWith by one{" "}
                <code>isEnd</code> test.
              </>
            ),
            zh: (
              <>
                insert / search / startsWith 全是 <b>O(L)</b>,L 是
                <b>字符串长度,不是词数</b>。这份「与词典大小无关」正是这个结构的意义所在。
                search 比 startsWith 只多一个 <code>isEnd</code> 判断。
              </>
            ),
          },
          {
            en: (
              <>
                The children table is the design decision:{" "}
                <b>a fixed array of 26</b> is fastest but holds 26 pointers per
                node and only accepts lowercase ASCII;{" "}
                <b>a hash map</b> stores only the children that exist and accepts
                any character, with a slightly larger constant. A trie buys
                prefix queries with memory, not the other way round.
              </>
            ),
            zh: (
              <>
                children 表是唯一的设计抉择:<b>定长 26 槽数组</b>最快,
                但每个节点占 26 个指针,而且只认小写 ASCII;
                <b>哈希表</b>只存实际存在的孩子、任意字符都能用,常数略大。
                Trie 是用内存买前缀查询,不是反过来。
              </>
            ),
          },
          {
            en: (
              <>
                Three patterns: <b>the LC 208 template</b> →{" "}
                <b>LC 211, where a wildcard makes the walk branch into a DFS</b>{" "}
                → <b>LC 212, where the trie ends a grid branch as soon as the
                prefix does not exist</b>. Add the <b>0/1 trie</b>, which stores
                integers bit by bit, for maximum XOR. When a problem mentions
                prefixes, completion or a shared beginning, think of a trie.
              </>
            ),
            zh: (
              <>
                三大套路:<b>LC 208 模板</b> →{" "}
                <b>LC 211,通配符让「走」在节点处分叉成 DFS</b> →{" "}
                <b>LC 212,前缀不存在就立刻结束这条网格分支</b>;
                再加一个 <b>0/1 Trie</b>(把整数按比特建树)解最大异或。
                题面里出现「前缀 / 补全 / 共同开头」,就该想到它。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="trie" />
    </main>
  );
}
