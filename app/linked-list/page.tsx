"use client";

// 第 3 章 · 链表 —— 十段式:
// 直觉(数组插删之痛 → 只记「下一个在哪」)→ 内存里的样子(散落 + 引用)→
// 核心操作(重点:先接后断 + O(1) 的前提)→ 手写实现(单链表 / 双向链表 / dummy)→
// 三语言对照 → 反转·快慢指针·dummy 三大套路 + 三道精讲 → 题单 → 测验 → 要点。
//
// 双语:所有面向学习者的文案都用 <T en zh> 或 { en, zh },英文为默认语言。
// 代码窗的 code 写成 { en, zh } —— 两版逐行等价,只有注释不同,hl 行号才对得上。

import Link from "next/link";
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
import { PROBLEMS, QUIZ } from "@/lib/linked-list-data";
import { T } from "@/lib/i18n";
import { ScatterMap, LinkedLab, ReverseAnim, CycleAnim, MergeAnim } from "./viz";
import "./chapter.css";

const CHIPS = [
  { id: "intuition", n: "01", label: { en: "Intuition", zh: "直觉" } },
  { id: "memory", n: "02", label: { en: "In memory", zh: "内存里的样子" } },
  { id: "ops", n: "03", label: { en: "Core operations", zh: "核心操作" } },
  { id: "impl", n: "04", label: { en: "Build one", zh: "手写实现" } },
  { id: "langs", n: "05", label: { en: "Three languages", zh: "三语言对照" } },
  {
    id: "patterns",
    n: "06",
    label: { en: "Patterns and walkthroughs", zh: "套路与精讲" },
  },
  { id: "problems", n: "07", label: { en: "Problem set", zh: "高频题单" } },
  { id: "quiz", n: "08", label: { en: "Quiz", zh: "通关测验" } },
];

export default function LinkedListChapter() {
  return (
    <main className="page" data-ch="linked-list">
      <Hero
        ch="linked-list"
        title={{
          en: (
            <>
              The <span className="grad">Linked List</span>
            </>
          ),
          zh: (
            <>
              链表 <span className="grad">Linked List</span>
            </>
          ),
        }}
        essence={{
          en: (
            <>
              Every node stores one value and the address of the{" "}
              <strong>next node</strong>. A linked list gives up contiguous
              memory and index access. What it gets back:{" "}
              <strong>
                when you already hold the node in front of a position, inserting
                or deleting there is two reference writes and nothing moves
              </strong>
              .
            </>
          ),
          zh: (
            <>
              每个节点只存一个值和<strong>下一个节点的地址</strong>。
              链表交出了连续内存与下标访问,换回来的是:
              <strong>
                只要位置前面那个节点已经在手上,插入或删除就只是改两根引用,谁都不用搬家
              </strong>
              。
            </>
          ),
        }}
        chips={CHIPS}
      />

      {/* ================= §01 直觉 ================= */}
      <Section
        id="intuition"
        index="01"
        title={{
          en: "Intuition: stop moving elements, store the address instead",
          zh: "直觉:与其全体搬家,不如记住「下一个在哪」",
        }}
        desc={{
          en: "A linked list is built for exactly the operation an array is bad at.",
          zh: "数组的痛点在哪,链表就为哪而生",
        }}
      >
        <div className="prose">
          <T
            en={
              <>
                <p>
                  Recall the most expensive moment in the array chapter.
                  Inserting one element in the middle of an array moves{" "}
                  <strong>every element to the right of it</strong> one slot
                  further right. Deleting one moves them all back. With a
                  hundred thousand elements and operations landing in the
                  middle, that O(n) copying is a real cost. There is one cause:
                  an array ties <strong>logical order</strong> to{" "}
                  <strong>physical order</strong>. Two neighbors are neighbors
                  in memory, so there is no room between them.
                </p>
                <p>
                  A <strong>linked list</strong> removes that tie. An element no
                  longer has to live next to its neighbor. Instead each element
                  carries a note that says where the next one is. You are given
                  the first address (<code>head</code>), you follow the note to
                  the second element, then the next, and so on. When a note
                  holds nothing (<code>null</code>), the list is over.
                </p>
                <p>
                  In that world, inserting C between A and B is cheap: write
                  &ldquo;next is B&rdquo; into C, then change the note in A to
                  &ldquo;next is C&rdquo;.{" "}
                  <strong>
                    Two notes change and no other element is touched
                  </strong>
                  . The price is the house number. To reach the hundredth
                  element you have to follow ninety-nine notes from the start.
                  Three rules follow from this:
                </p>
              </>
            }
            zh={
              <>
                <p>
                  先回放第 1 章最贵的一幕:往数组中间插一个元素,插入点右边的
                  <strong>所有元素集体右移一格</strong>;删一个,右边全体左移补位。
                  数据量十万条、操作又频繁落在中间时,这份 O(n)
                  的搬家成本就是实打实的账单。根源只有一个:数组把
                  <strong>逻辑上的相邻</strong>焊死在了<strong>物理上的相邻</strong>
                  上 —— 两个邻居在内存里就是邻居,中间挤不进人。
                </p>
                <p>
                  <strong>链表(linked list)</strong>把这道焊缝拆了:
                  元素不必住在邻居隔壁,只要每人身上带一张纸条,写着「下一个人住在哪」。
                  你拿到第一个地址(<code>head</code>),照纸条找到第二个,再找第三个……
                  纸条上写着「没有了」(<code>null</code>),这条链就到头了。
                </p>
                <p>
                  在这样的世界里,「在 A 和 B 之间插入 C」变得极便宜:
                  C 的纸条写上「下一个是 B」,再把 A 的纸条改成「下一个是 C」——
                  <strong>只改两张纸条,其他元素一个都不动</strong>。
                  代价是门牌号没了:想找第 100 个元素,只能从头一张张纸条追过去。
                  由此有三条家规:
                </p>
              </>
            }
          />
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">RULE 01</div>
            <div className="card-title">
              <T en="Not contiguous" zh="不连续" />
            </div>
            <T
              en={
                <p>
                  Nodes may sit <b>anywhere</b> in memory, far apart from each
                  other. The benefit: no large contiguous block is needed, and
                  the list never has to be copied into a bigger space. The cost:
                  the CPU cannot guess where the next node is, so it cannot load
                  it in advance.
                </p>
              }
              zh={
                <p>
                  节点(node)在内存里<b>想住哪住哪</b>,彼此可以离得很远。
                  好处:不需要一大块连续内存,也永远不会为了扩容整体搬家;
                  代价:CPU 猜不到下一个节点在哪,没法提前把它读进缓存。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 02</div>
            <div className="card-title">
              <T en="Joined by references" zh="靠引用相连" />
            </div>
            <T
              en={
                <p>
                  Each node is <b>one value plus one next reference</b>. The
                  order of the list exists only in those references and has
                  nothing to do with the addresses. That chain of references is
                  what the word &ldquo;linked&rdquo; refers to.
                </p>
              }
              zh={
                <p>
                  每个节点 = <b>一个值 + 一根 next 引用</b>。
                  链表的顺序只存在于这些引用里,和地址毫无关系 ——
                  所谓「链」,指的就是这一串手拉手的引用。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 03</div>
            <div className="card-title">
              <T en="No index" zh="无下标" />
            </div>
            <T
              en={
                <p>
                  There is no &ldquo;address = base + i × size&rdquo; formula
                  here. Reaching element i means starting at head and following
                  i references, so <b>access is O(n)</b>. That is what a linked
                  list pays for cheap insertion and deletion.
                </p>
              }
              zh={
                <p>
                  这里没有「地址 = 首地址 + i × 元素大小」这条公式。
                  想到第 i 个,只能从 head 出发跟 i 次引用 ——
                  <b>访问是 O(n)</b>,这就是它为便宜的插删付出的对价。
                </p>
              }
            />
          </div>
        </div>
        <Callout
          tone="story"
          title={{
            en: "Where linked lists are actually used",
            zh: "它藏在你每天用的系统里",
          }}
        >
          <T
            en={
              <p>
                A memory allocator keeps its unused blocks in a{" "}
                <b>free list</b>, so a freed block is returned by rewriting two
                references instead of moving memory. The FAT file system stores
                each file as a chain of blocks, where every block records the
                number of the next one, which is why a file can be spread over a
                whole disk. And the best known interview combination,{" "}
                <b>the LRU cache (LC 146) = a hash map + a doubly linked list</b>
                , exists because a node reference taken from the hash map can be
                unlinked and relinked in O(1). Chapter 13 builds one.
              </p>
            }
            zh={
              <p>
                内存分配器把空闲块串成一条<b>空闲链表(free list)</b>,
                归还一块内存只是改两根引用,不必搬动任何数据;FAT
                文件系统把文件存成一条块链,每一块记录下一块的编号 ——
                所以一个文件可以散落在整块磁盘上。而面试里最出名的组合 ——
                <b>LRU 缓存(LC 146)= 哈希表 + 双向链表</b> ——
                之所以成立,正是因为从哈希表里拿到的节点引用可以 O(1)
                摘下再挂回。第 13 章我们会亲手拼出它。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §02 内存里的样子 ================= */}
      <Section
        id="memory"
        index="02"
        title={{
          en: "In memory: scattered nodes and invisible lines",
          zh: "内存里的样子:散落的节点,看不见的线",
        }}
        desc={{
          en: "The same values stored two ways, and why a linked list can never have O(1) index access.",
          zh: "同一批值的两种住法 —— 以及为什么链表永远没有 O(1) 下标",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                <Link href="/#refs">Introduction §03</Link> said it already:{" "}
                <strong>a reference is a memory address</strong>, a note that
                says &ldquo;the object is at 2096&rdquo;. A linked list node is
                nothing more than a value and such a note packed together. The
                figure shows the same values [7, 2, 9] stored twice. Notice that
                the physical order of the three nodes (2096 → 3120 → 1432) and
                their logical order (7 → 2 → 9) are{" "}
                <strong>unrelated</strong>:
              </p>
            }
            zh={
              <p>
                <Link href="/#refs">序章 §03</Link> 说过:
                <strong>引用(reference)本质上就是一个内存地址</strong> ——
                一张写着「去 2096 号找它」的纸条。链表的节点无非是把「值」
                和「纸条」打包放在一起。下图是同一批值 [7, 2, 9] 的两种住法,
                注意链表三个节点的物理顺序(2096 → 3120 → 1432)和逻辑顺序
                (7 → 2 → 9)<strong>毫无关系</strong>:
              </p>
            }
          />
        </div>
        <ScatterMap />
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-title">
              <T
                en="Why there is no O(1) index access"
                zh="为什么没有 O(1) 下标访问?"
              />
            </div>
            <T
              en={
                <p>
                  The O(1) of an array comes from the address formula, and that
                  formula works only because the elements are contiguous and all
                  the same size. Linked list nodes are scattered, and the address
                  of node i is recorded <b>only inside node i−1</b>. To learn
                  where it is you must first reach the one before it. Where the
                  information is kept decides how it can be read: O(n) is not a
                  weak implementation, it follows from the structure.
                </p>
              }
              zh={
                <p>
                  数组的 O(1) 来自那条地址公式,而公式成立靠「连续 + 同型」。
                  链表节点散落各处,第 i 个节点的地址
                  <b>只记录在第 i−1 个节点肚子里</b> —— 想知道它在哪,
                  必须先找到前一个。信息的存放方式决定了访问方式:O(n)
                  不是实现不够好,是结构使然。
                </p>
              }
            />
          </div>
          <div className="card">
            <div className="card-title">
              <T en="What a node looks like" zh="节点长什么样?" />
            </div>
            <T
              en={
                <p>
                  <code>{"{ val: 7, next: 1432 }"}</code> — one slot for the
                  value, one slot for an address. In Java, Python, and
                  JavaScript, <code>next</code> is a reference to the next node
                  object. When there is no next node it holds{" "}
                  <code>null / None / null</code>. That is the end of the list,
                  and also the first place to look when a null reference error
                  appears.
                </p>
              }
              zh={
                <p>
                  <code>{"{ val: 7, next: 1432 }"}</code> —— 一格值 + 一格地址。
                  在 Java / Python / JS 里,next 就是一个指向下一个节点对象的引用;
                  没有下一个时记作 <code>null / None / null</code>,
                  它是每条链的终点站,也是空指针异常的第一案发现场。
                </p>
              }
            />
          </div>
        </div>
        <Callout
          tone="deep"
          title={{
            en: "Why a linked list is often slower than the complexity suggests",
            zh: "工程视角:链表为什么常常比复杂度看起来还慢",
          }}
        >
          <T
            en={
              <p>
                The array chapter described the cache line: reading{" "}
                <code>arr[0]</code> brings <code>arr[1..15]</code> into the
                cache at the same time, because they are next to it. A linked
                list gets nothing from that. The address of the next node is
                known only after the current node has been read, so the CPU
                cannot load it in advance, and almost every step can be a{" "}
                <b>cache miss</b> that goes to main memory. Both structures
                still traverse in <b>O(n)</b>. The difference is a{" "}
                <b>constant factor</b>, not a different complexity, but it is a
                large constant: on real hardware, walking an array is commonly
                several times faster. The practical rule:{" "}
                <b>
                  reach for the array family by default, and use a linked list
                  when you really need O(1) insertion or deletion at a node you
                  already hold
                </b>
                .
              </p>
            }
            zh={
              <p>
                第 1 章讲过 CPU 缓存行:读 <code>arr[0]</code> 时,
                <code>arr[1..15]</code> 因为紧挨着它,顺便一起进了缓存。
                链表享受不到这个红利 —— 下一个节点在哪,要读完当前节点才知道,
                CPU 无法提前加载,几乎每跳一步都可能<b>缓存未命中</b>,
                跑一趟主存。两者的遍历<b>都是 O(n)</b>,差的不是复杂度,
                而是<b>常数因子</b> —— 只是这个常数不小:真机上顺序遍历数组
                通常快好几倍。工程上的默认选择:
                <b>
                  先用数组家族,确实需要「拿着节点做 O(1) 插删」时才请链表出场
                </b>
                。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §03 核心操作 ================= */}
      <Section
        id="ops"
        index="03"
        title={{
          en: "Core operations: rewriting references is cheap, finding the place is not",
          zh: "核心操作:改指针便宜,找位置贵",
        }}
        desc={{
          en: "Every O(1) here comes with a condition. The key animation: connect before you disconnect.",
          zh: "每个 O(1) 都挂着一个前提 —— 重点动画:先接后断",
        }}
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>
                  <T en="Operation" zh="操作" />
                </th>
                <th>
                  <T en="Complexity" zh="复杂度" />
                </th>
                <th>
                  <T en="Why" zh="为什么" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>
                    <T
                      en="Read element i / search by value"
                      zh="访问第 i 个 / 按值查找"
                    />
                  </b>
                </td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <T
                    en="There is no address formula, so you follow next from head one node at a time."
                    zh="没有下标公式,只能从 head 一路 next 跳过去"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T
                      en="Insert / delete at the front"
                      zh="头插 / 头删"
                    />
                  </b>
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en="head is already in your hand: one or two reference writes, independent of the length."
                    zh="head 就在手上:改 1~2 根引用,与链长无关"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T
                      en="Insert / delete when you already hold the predecessor"
                      zh="插入 / 删除(已持有前驱)"
                    />
                  </b>
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en={
                      <>
                        Two writes to insert, one to delete —{" "}
                        <b>only if the predecessor is already in your hand.</b>{" "}
                        This single line is where the whole value of a linked
                        list comes from
                      </>
                    }
                    zh={
                      <>
                        改 2 根(插)或 1 根(删)指针 ——{" "}
                        <b>前提是前驱已经在手里!</b>这一行就是链表全部价值的来源
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T
                      en="Insert / delete at position i"
                      zh="按位置 i 插入 / 删除"
                    />
                  </b>
                </td>
                <td>
                  <BigO o="n" />
                </td>
                <td>
                  <T
                    en="O(n) to walk to the predecessor plus O(1) to rewrite references. The cost is in the walking, not the rewriting."
                    zh="找前驱 O(n) + 改指针 O(1) —— 大头在「找」,不在「改」"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <b>
                    <T
                      en="Append at the end (with a tail reference)"
                      zh="尾插(维护 tail 指针)"
                    />
                  </b>
                </td>
                <td>
                  <BigO o="1" />
                </td>
                <td>
                  <T
                    en="tail points at the last node already. Without a tail reference you have to walk the whole list, which is O(n)."
                    zh="tail 直接定位末尾;不维护 tail 就得走全程,O(n)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <T
            en={
              <>
                <p>
                  The third row carries the <strong>condition</strong> that
                  matters most. &ldquo;Insertion and deletion in a linked list
                  are O(1)&rdquo; is repeated far too often without it. The full
                  version is:{" "}
                  <strong>
                    rewriting the references is O(1), and finding which
                    references to rewrite is O(n)
                  </strong>
                  . So a linked list wins when the predecessor, or the node
                  itself, is already in your hand: deleting during a traversal
                  you are already performing, or an LRU cache where a hash map
                  hands you the node.
                </p>
                <p>
                  Inserting takes only two steps, but{" "}
                  <strong>the order of the two decides whether the list
                  survives</strong>. Connect before you disconnect: the new node
                  takes hold of the successor first (
                  <code>newNode.next = cur</code>), and only then does the
                  predecessor switch over (<code>prev.next = newNode</code>).
                  What happens if you swap them? The lab below has a button that
                  does it, so you can lose the second half of a list once and
                  remember it:
                </p>
              </>
            }
            zh={
              <>
                <p>
                  表里最重要的是第三行的<strong>前提</strong>。
                  「链表插删 O(1)」这句话被掐头去尾传得太广,完整版是:
                  <strong>改指针 O(1),找到该改哪根指针 O(n)</strong>。
                  所以链表真正的高光场景,是「前驱或节点引用本来就在手上」——
                  比如遍历途中顺手删除,比如 LRU 缓存里哈希表直接把节点递给你。
                </p>
                <p>
                  插入本身只有两步,但<strong>顺序决定链表的死活</strong>。
                  口诀「先接后断」:新节点先牵住后继(
                  <code>newNode.next = cur</code>),前驱再改口(
                  <code>prev.next = newNode</code>)。顺序反了会怎样?
                  下面实验室里有一个「反面教材」按钮,亲手丢一次后半条链,
                  比背十遍口诀管用:
                </p>
              </>
            }
          />
        </div>
        <LinkedLab />
        <Callout
          tone="idea"
          title={{
            en: "Deleting a node when the node is all you have",
            zh: "只给你一个节点,怎么删掉它?",
          }}
        >
          <T
            en={
              <p>
                Deleting node X normally needs the node before it, so that its
                next can be moved past X. If all you are given is X itself,
                there is a trick (LC 237): copy the value of{" "}
                <code>X.next</code> into X, then delete <code>X.next</code>{" "}
                instead. The list ends up with the right sequence of values in
                O(1). Two limits come with it.{" "}
                <b>It does not work when X is the last node</b>, because there
                is no following value to copy and no way to reach the node
                before X. And the node object that survives is not the one the
                caller pointed at, so any other reference to{" "}
                <code>X.next</code> now points at a node that is no longer part
                of the list.
              </p>
            }
            zh={
              <p>
                删除节点 X 通常需要它的前驱,好让前驱的 next 跳过 X。
                如果只给你 X 本人呢?有个技巧(LC 237):把{" "}
                <code>X.next</code> 的值抄进 X,然后删掉 <code>X.next</code>{" "}
                —— 链表的值序列因此正确,代价 O(1)。但它带着两条限制:
                <b>X 是最后一个节点时不成立</b>,因为没有下一个值可抄,
                也没法回头找到 X 的前驱;而且真正被留下的节点对象已经换了一个,
                别处若还持有 <code>X.next</code> 的引用,
                那个引用现在指向一个已经不在链上的节点。
              </p>
            }
          />
        </Callout>
        <Callout
          tone="warn"
          title={{
            en: "Three bugs that account for most linked list mistakes",
            zh: "链表 bug 三巨头",
          }}
        >
          <T
            en={
              <p>
                (1) <b>Disconnecting before connecting</b>: the second half of
                the list loses its last reference, as the lab just showed. (2){" "}
                <b>Reading a field of null</b>: taking <code>.next</code> of a
                null reference. Test for null first, in the right order (
                <code>cur != null &amp;&amp; cur.next != null</code>; swapping
                the two tests reintroduces the crash, because{" "}
                <code>&amp;&amp;</code> evaluates the left side first and only
                then the right). (3){" "}
                <b>Forgetting the special case for the head</b>: when you delete
                or insert at the front there is no predecessor to rewrite. The
                dummy node in §04 removes that case. Experienced programmers all
                do the same thing before writing linked list code: draw the
                nodes and put the pointer writes in order on paper first.
              </p>
            }
            zh={
              <p>
                ① <b>先断后接</b>:后半条链失去最后一个引用(上面刚演示过)。②{" "}
                <b>对 null 取字段</b>:对空引用取 <code>.next</code>。
                循环条件要先判空,而且顺序不能反(
                <code>cur != null &amp;&amp; cur.next != null</code> ——
                <code>&amp;&amp;</code> 先算左边,左边成立才算右边,
                两个条件对调就又崩了)。③ <b>漏掉头节点的特判</b>:
                删头 / 插头时根本没有前驱可改 —— §04 的 dummy 哨兵专治这个。
                写链表题之前先画图,把指针改动顺序在纸上排好再下手,
                是所有老手的共同习惯。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §04 手写实现 ================= */}
      <Section
        id="impl"
        index="04"
        title={{
          en: "Build one: a singly linked list, a doubly linked list, and a dummy node",
          zh: "手写实现:单链表、双向链表与 dummy 哨兵",
        }}
        desc={{
          en: "A working linked list from nothing, commented line by line in three languages.",
          zh: "从零造一个能用的链表 —— 三语言逐行注释",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                <strong>A complete singly linked list.</strong> It keeps three
                fields: head, tail, and size. tail brings appending down to
                O(1), and size brings the length query down to O(1). Both are
                small decisions that spend a little space to save time. Every
                method follows the same shape:{" "}
                <strong>find the predecessor, then rewrite references</strong>:
              </p>
            }
            zh={
              <p>
                <strong>单链表(singly linked list)完整实现。</strong>
                维护 head、tail、size 三个字段:tail 让尾插降到 O(1),size
                让长度查询降到 O(1) —— 两个「花一点空间买时间」的小决策。
                所有方法的套路都是同一句话:
                <strong>找到前驱,改指针</strong>:
              </p>
            }
          />
        </div>
        <CodeTabs
          title="my_linked_list"
          java={{
            code: {
              en: `// Node: one value plus a reference to the next node
class ListNode {
    int val;
    ListNode next;               // null by default: no next node yet
    ListNode(int v) { val = v; }
}

class MyLinkedList {
    private ListNode head = null; // first node (null when the list is empty)
    private ListNode tail = null; // last node: makes appending O(1)
    private int size = 0;

    // Append at the end: tail is already there, O(1)
    public void push(int v) {
        ListNode node = new ListNode(v);
        if (head == null) { head = tail = node; } // empty: it is head and tail
        else { tail.next = node; tail = node; }   // link after tail, move tail
        size++;
    }

    // Insert at index i: O(n) to find the predecessor, O(1) to rewrite
    public void insertAt(int i, int v) {
        if (i < 0 || i > size) throw new IndexOutOfBoundsException();
        ListNode node = new ListNode(v);
        if (i == 0) {                 // front: no predecessor, own branch
            node.next = head;         // (1) connect
            head = node;              // (2) move head
            if (size == 0) tail = node;
        } else {
            ListNode prev = head;     // walk to node i-1
            for (int k = 0; k < i - 1; k++) prev = prev.next;
            node.next = prev.next;    // (1) connect: new node takes successor
            prev.next = node;         // (2) disconnect: predecessor switches
            if (node.next == null) tail = node; // inserted at the end
        }
        size++;
    }

    // Delete index i: again find the predecessor, then rewrite
    public int removeAt(int i) {
        if (i < 0 || i >= size) throw new IndexOutOfBoundsException();
        ListNode victim;
        if (i == 0) {
            victim = head;
            head = head.next;         // front: head moves to the second node
            if (head == null) tail = null;
        } else {
            ListNode prev = head;
            for (int k = 0; k < i - 1; k++) prev = prev.next;
            victim = prev.next;
            prev.next = victim.next;  // route around victim, GC reclaims it
            if (prev.next == null) tail = prev;
        }
        size--;
        return victim.val;
    }

    // Search by value: index of the first match, O(n)
    public int find(int v) {
        ListNode cur = head;
        for (int i = 0; cur != null; i++, cur = cur.next)
            if (cur.val == v) return i;
        return -1;
    }

    // Reverse in place: three pointers, animated in walkthrough A (§06)
    public void reverse() {
        ListNode prev = null, cur = head;
        tail = head;                  // the old head becomes the new tail
        while (cur != null) {
            ListNode nxt = cur.next;  // (1) save the next node
            cur.next = prev;          // (2) turn the reference around
            prev = cur;               // (3) advance both pointers
            cur = nxt;
        }
        head = prev;                  // prev stopped on the old last node
    }

    // Export to an array, useful for printing while debugging
    public int[] toArray() {
        int[] out = new int[size];
        ListNode cur = head;
        for (int i = 0; i < size; i++, cur = cur.next) out[i] = cur.val;
        return out;
    }
}`,
              zh: `// 节点:值 + 下一站的引用
class ListNode {
    int val;
    ListNode next;               // 默认 null:暂时没有下一站
    ListNode(int v) { val = v; }
}

class MyLinkedList {
    private ListNode head = null; // 第一个节点(空链表时为 null)
    private ListNode tail = null; // 最后一个节点:让尾插 O(1)
    private int size = 0;

    // 尾部追加:有 tail 直达末尾,O(1)
    public void push(int v) {
        ListNode node = new ListNode(v);
        if (head == null) { head = tail = node; } // 空链表:它既是头也是尾
        else { tail.next = node; tail = node; }   // 挂到尾后,tail 前移
        size++;
    }

    // 在下标 i 处插入:找前驱 O(n) + 改两根指针 O(1)
    public void insertAt(int i, int v) {
        if (i < 0 || i > size) throw new IndexOutOfBoundsException();
        ListNode node = new ListNode(v);
        if (i == 0) {                 // 头插:没有前驱,单独处理
            node.next = head;         // ① 先接
            head = node;              // ② 换头
            if (size == 0) tail = node;
        } else {
            ListNode prev = head;     // 走到第 i-1 个节点
            for (int k = 0; k < i - 1; k++) prev = prev.next;
            node.next = prev.next;    // ① 先接:新节点牵住后继
            prev.next = node;         // ② 后断:前驱改挂新节点
            if (node.next == null) tail = node; // 插在了末尾
        }
        size++;
    }

    // 删除下标 i:同样是「找前驱 + 改指针」
    public int removeAt(int i) {
        if (i < 0 || i >= size) throw new IndexOutOfBoundsException();
        ListNode victim;
        if (i == 0) {
            victim = head;
            head = head.next;         // 删头:head 直接后移
            if (head == null) tail = null;
        } else {
            ListNode prev = head;
            for (int k = 0; k < i - 1; k++) prev = prev.next;
            victim = prev.next;
            prev.next = victim.next;  // 绕过 victim,它随后被 GC 回收
            if (prev.next == null) tail = prev;
        }
        size--;
        return victim.val;
    }

    // 按值查找:返回第一次出现的下标,O(n)
    public int find(int v) {
        ListNode cur = head;
        for (int i = 0; cur != null; i++, cur = cur.next)
            if (cur.val == v) return i;
        return -1;
    }

    // 原地反转:三指针,§06 精讲 A 有逐帧动画
    public void reverse() {
        ListNode prev = null, cur = head;
        tail = head;                  // 老头将成为新尾
        while (cur != null) {
            ListNode nxt = cur.next;  // ① 备份下一站
            cur.next = prev;          // ② 箭头调头
            prev = cur;               // ③ 两个指针一起前移
            cur = nxt;
        }
        head = prev;                  // prev 停在原来的最后一个节点上
    }

    // 导出成数组,方便打印调试
    public int[] toArray() {
        int[] out = new int[size];
        ListNode cur = head;
        for (int i = 0; i < size; i++, cur = cur.next) out[i] = cur.val;
        return out;
    }
}`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> every method that changes head or tail
                  has to handle the empty list and the one-node list. Most
                  linked list bugs live at those boundaries. Test in this order:
                  empty, one element, two elements.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>每个会动 head / tail 的方法都要照顾空链表与
                  单节点两种边界 —— 链表 bug 大多出在这里。
                  测试顺序:空表 → 一个元素 → 两个元素。
                </>
              ),
            },
            hl: [32, 33, 51],
          }}
          python={{
            code: {
              en: `class ListNode:
    def __init__(self, val=0):
        self.val = val
        self.next = None          # no next node yet

class MyLinkedList:
    def __init__(self):
        self.head = None          # first node (None when the list is empty)
        self.tail = None          # last node: makes appending O(1)
        self.size = 0

    def push(self, v):
        """Append at the end: tail is already there, O(1)"""
        node = ListNode(v)
        if self.head is None:     # empty list: it is head and tail
            self.head = self.tail = node
        else:
            self.tail.next = node # link after tail, then move tail
            self.tail = node
        self.size += 1

    def insert_at(self, i, v):
        """Insert at index i: O(n) to find the predecessor, O(1) to rewrite"""
        if not 0 <= i <= self.size:
            raise IndexError(i)
        node = ListNode(v)
        if i == 0:                # front: no predecessor, own branch
            node.next = self.head # (1) connect
            self.head = node      # (2) move head
            if self.size == 0:
                self.tail = node
        else:
            prev = self.head      # walk to node i-1
            for _ in range(i - 1):
                prev = prev.next
            node.next = prev.next # (1) connect: new node takes successor
            prev.next = node      # (2) disconnect: predecessor switches
            if node.next is None: # inserted at the end
                self.tail = node
        self.size += 1

    def remove_at(self, i):
        """Delete index i: again find the predecessor, then rewrite"""
        if not 0 <= i < self.size:
            raise IndexError(i)
        if i == 0:
            victim = self.head
            self.head = self.head.next  # front: head moves to the second node
            if self.head is None:
                self.tail = None
        else:
            prev = self.head
            for _ in range(i - 1):
                prev = prev.next
            victim = prev.next
            prev.next = victim.next     # route around victim, GC reclaims it
            if prev.next is None:
                self.tail = prev
        self.size -= 1
        return victim.val

    def find(self, v):
        """Search by value: index of the first match, O(n)"""
        cur, i = self.head, 0
        while cur:
            if cur.val == v:
                return i
            cur, i = cur.next, i + 1
        return -1

    def reverse(self):
        """Reverse in place: three pointers, animated in walkthrough A"""
        prev, cur = None, self.head
        self.tail = self.head     # the old head becomes the new tail
        while cur:
            nxt = cur.next        # (1) save the next node
            cur.next = prev       # (2) turn the reference around
            prev, cur = cur, nxt  # (3) advance both (one line in Python)
        self.head = prev          # prev stopped on the old last node

    def to_array(self):
        """Export to a list, useful for printing while debugging"""
        out, cur = [], self.head
        while cur:
            out.append(cur.val)
            cur = cur.next
        return out`,
              zh: `class ListNode:
    def __init__(self, val=0):
        self.val = val
        self.next = None          # 暂时没有下一站

class MyLinkedList:
    def __init__(self):
        self.head = None          # 第一个节点(空链表时 None)
        self.tail = None          # 最后一个节点:让尾插 O(1)
        self.size = 0

    def push(self, v):
        """尾部追加:有 tail 直达末尾,O(1)"""
        node = ListNode(v)
        if self.head is None:     # 空链表:它既是头也是尾
            self.head = self.tail = node
        else:
            self.tail.next = node # 挂到尾后,tail 前移
            self.tail = node
        self.size += 1

    def insert_at(self, i, v):
        """在下标 i 处插入:找前驱 O(n) + 改两根指针 O(1)"""
        if not 0 <= i <= self.size:
            raise IndexError(i)
        node = ListNode(v)
        if i == 0:                # 头插:没有前驱,单独处理
            node.next = self.head # ① 先接
            self.head = node      # ② 换头
            if self.size == 0:
                self.tail = node
        else:
            prev = self.head      # 走到第 i-1 个节点
            for _ in range(i - 1):
                prev = prev.next
            node.next = prev.next # ① 先接:新节点牵住后继
            prev.next = node      # ② 后断:前驱改挂新节点
            if node.next is None: # 插在了末尾
                self.tail = node
        self.size += 1

    def remove_at(self, i):
        """删除下标 i:同样是「找前驱 + 改指针」"""
        if not 0 <= i < self.size:
            raise IndexError(i)
        if i == 0:
            victim = self.head
            self.head = self.head.next  # 删头:head 直接后移
            if self.head is None:
                self.tail = None
        else:
            prev = self.head
            for _ in range(i - 1):
                prev = prev.next
            victim = prev.next
            prev.next = victim.next     # 绕过 victim,交给 GC
            if prev.next is None:
                self.tail = prev
        self.size -= 1
        return victim.val

    def find(self, v):
        """按值查找:返回第一次出现的下标,O(n)"""
        cur, i = self.head, 0
        while cur:
            if cur.val == v:
                return i
            cur, i = cur.next, i + 1
        return -1

    def reverse(self):
        """原地反转:三指针,§06 精讲 A 有逐帧动画"""
        prev, cur = None, self.head
        self.tail = self.head     # 老头将成为新尾
        while cur:
            nxt = cur.next        # ① 备份下一站
            cur.next = prev       # ② 箭头调头
            prev, cur = cur, nxt  # ③ 两个指针一起前移(Python 可一行)
        self.head = prev          # prev 停在原来的最后一个节点上

    def to_array(self):
        """导出成 list,方便打印调试"""
        out, cur = [], self.head
        while cur:
            out.append(cur.val)
            cur = cur.next
        return out`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> test for empty with{" "}
                  <code>is None</code>, not <code>== None</code>. The multiple
                  assignment <code>prev, cur = cur, nxt</code> evaluates the
                  whole right side first, which fits reversal well. Do not
                  compress all three steps into one line though; readability
                  comes first.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b>判空用 <code>is None</code> 而不是{" "}
                  <code>== None</code>;<code>prev, cur = cur, nxt</code>{" "}
                  这种多重赋值会先把右边整体求值,写反转时特别顺手 ——
                  但别炫技把三步压成一行,可读性优先。
                </>
              ),
            },
            hl: [36, 37, 56],
          }}
          js={{
            code: {
              en: `// Node: one value plus a reference to the next node
class ListNode {
  constructor(val = 0) {
    this.val = val;
    this.next = null;           // no next node yet
  }
}

class MyLinkedList {
  constructor() {
    this.head = null;           // first node (null when the list is empty)
    this.tail = null;           // last node: makes appending O(1)
    this.size = 0;
  }

  // Append at the end: tail is already there, O(1)
  push(v) {
    const node = new ListNode(v);
    if (!this.head) {           // empty list: it is head and tail
      this.head = this.tail = node;
    } else {
      this.tail.next = node;    // link after tail, then move tail
      this.tail = node;
    }
    this.size++;
  }

  // Insert at index i: O(n) to find the predecessor, O(1) to rewrite
  insertAt(i, v) {
    if (i < 0 || i > this.size) throw new RangeError(i);
    const node = new ListNode(v);
    if (i === 0) {              // front: no predecessor, own branch
      node.next = this.head;    // (1) connect
      this.head = node;         // (2) move head
      if (this.size === 0) this.tail = node;
    } else {
      let prev = this.head;     // walk to node i-1
      for (let k = 0; k < i - 1; k++) prev = prev.next;
      node.next = prev.next;    // (1) connect: new node takes successor
      prev.next = node;         // (2) disconnect: predecessor switches
      if (!node.next) this.tail = node; // inserted at the end
    }
    this.size++;
  }

  // Delete index i: again find the predecessor, then rewrite
  removeAt(i) {
    if (i < 0 || i >= this.size) throw new RangeError(i);
    let victim;
    if (i === 0) {
      victim = this.head;
      this.head = this.head.next; // front: head moves to the second node
      if (!this.head) this.tail = null;
    } else {
      let prev = this.head;
      for (let k = 0; k < i - 1; k++) prev = prev.next;
      victim = prev.next;
      prev.next = victim.next;    // route around victim, GC reclaims it
      if (!prev.next) this.tail = prev;
    }
    this.size--;
    return victim.val;
  }

  // Search by value: index of the first match, O(n)
  find(v) {
    let cur = this.head;
    for (let i = 0; cur; i++, cur = cur.next)
      if (cur.val === v) return i;
    return -1;
  }

  // Reverse in place: three pointers, animated in walkthrough A (§06)
  reverse() {
    let prev = null, cur = this.head;
    this.tail = this.head;      // the old head becomes the new tail
    while (cur) {
      const nxt = cur.next;     // (1) save the next node
      cur.next = prev;          // (2) turn the reference around
      prev = cur;               // (3) advance both pointers
      cur = nxt;
    }
    this.head = prev;           // prev stopped on the old last node
  }

  // Export to an array, useful for printing while debugging
  toArray() {
    const out = [];
    for (let cur = this.head; cur; cur = cur.next) out.push(cur.val);
    return out;
  }
}`,
              zh: `// 节点:值 + 下一站的引用
class ListNode {
  constructor(val = 0) {
    this.val = val;
    this.next = null;           // 暂时没有下一站
  }
}

class MyLinkedList {
  constructor() {
    this.head = null;           // 第一个节点(空链表时 null)
    this.tail = null;           // 最后一个节点:让尾插 O(1)
    this.size = 0;
  }

  // 尾部追加:有 tail 直达末尾,O(1)
  push(v) {
    const node = new ListNode(v);
    if (!this.head) {           // 空链表:它既是头也是尾
      this.head = this.tail = node;
    } else {
      this.tail.next = node;    // 挂到尾后,tail 前移
      this.tail = node;
    }
    this.size++;
  }

  // 在下标 i 处插入:找前驱 O(n) + 改两根指针 O(1)
  insertAt(i, v) {
    if (i < 0 || i > this.size) throw new RangeError(i);
    const node = new ListNode(v);
    if (i === 0) {              // 头插:没有前驱,单独处理
      node.next = this.head;    // ① 先接
      this.head = node;         // ② 换头
      if (this.size === 0) this.tail = node;
    } else {
      let prev = this.head;     // 走到第 i-1 个节点
      for (let k = 0; k < i - 1; k++) prev = prev.next;
      node.next = prev.next;    // ① 先接:新节点牵住后继
      prev.next = node;         // ② 后断:前驱改挂新节点
      if (!node.next) this.tail = node; // 插在了末尾
    }
    this.size++;
  }

  // 删除下标 i:同样是「找前驱 + 改指针」
  removeAt(i) {
    if (i < 0 || i >= this.size) throw new RangeError(i);
    let victim;
    if (i === 0) {
      victim = this.head;
      this.head = this.head.next; // 删头:head 直接后移
      if (!this.head) this.tail = null;
    } else {
      let prev = this.head;
      for (let k = 0; k < i - 1; k++) prev = prev.next;
      victim = prev.next;
      prev.next = victim.next;    // 绕过 victim,交给 GC
      if (!prev.next) this.tail = prev;
    }
    this.size--;
    return victim.val;
  }

  // 按值查找:返回第一次出现的下标,O(n)
  find(v) {
    let cur = this.head;
    for (let i = 0; cur; i++, cur = cur.next)
      if (cur.val === v) return i;
    return -1;
  }

  // 原地反转:三指针,§06 精讲 A 有逐帧动画
  reverse() {
    let prev = null, cur = this.head;
    this.tail = this.head;      // 老头将成为新尾
    while (cur) {
      const nxt = cur.next;     // ① 备份下一站
      cur.next = prev;          // ② 箭头调头
      prev = cur;               // ③ 两个指针一起前移
      cur = nxt;
    }
    this.head = prev;           // prev 停在原来的最后一个节点上
  }

  // 导出成数组,方便打印调试
  toArray() {
    const out = [];
    for (let cur = this.head; cur; cur = cur.next) out.push(cur.val);
    return out;
  }
}`,
            },
            note: {
              en: (
                <>
                  <b>Common mistake:</b> <code>if (!cur)</code> is a convenient
                  null test, but <code>if (!cur.val)</code> is also true when
                  the value is 0. Keep &ldquo;does this node exist&rdquo; and
                  &ldquo;what is its value&rdquo; in separate tests.
                </>
              ),
              zh: (
                <>
                  <b>易错点:</b><code>if (!cur)</code> 判空很顺手,
                  但 val 为 0 时 <code>if (!cur.val)</code> 也成立 ——
                  「节点是否存在」和「值是多少」要分开写。
                </>
              ),
            },
            hl: [39, 40, 58],
          }}
        />
        <div className="prose" style={{ marginTop: 24 }}>
          <T
            en={
              <p>
                <strong>A doubly linked list adds the way back.</strong> Each
                node carries one more reference, <code>prev</code>, so you can
                move in both directions from any node. Two things follow. (1){" "}
                <strong>Deleting no longer needs a search</strong>: the node
                already knows its predecessor, so holding the node is enough to
                delete it in O(1). That is what makes an LRU cache work. (2) You
                can walk from the tail to the head. The price: one more
                reference per node, and every insertion or deletion now rewrites{" "}
                <strong>four</strong> references, which is easier to get wrong:
              </p>
            }
            zh={
              <p>
                <strong>双向链表(doubly linked list):把回头路也修上。</strong>
                每个节点多带一根 <code>prev</code> 引用,于是可以从任一节点向两边走。
                两大收益:① <strong>删除不再需要「找前驱」</strong> ——
                节点自己就知道前驱是谁,拿到节点即可 O(1) 删除,
                LRU 缓存正是靠它;② 支持从尾向头遍历。代价:每个节点多一根引用,
                每次插删要改<strong>四根</strong>指针,更容易写错:
              </p>
            }
          />
        </div>
        <CodeTabs
          title="doubly_linked_core"
          java={{
            code: {
              en: `// Doubly linked node: value + previous + next
class DNode {
    int val;
    DNode prev, next;
    DNode(int v) { val = v; }
}

class Doubly {
    // Insert x after node: four references, none of them optional
    static void insertAfter(DNode node, DNode x) {
        x.prev = node;            // (1) x takes hold of its left neighbor
        x.next = node.next;       // (2) x takes hold of its right neighbor
        if (node.next != null)
            node.next.prev = x;   // (3) right neighbor points back (may be absent)
        node.next = x;            // (4) the left neighbor switches last
    }

    // Delete node: no search for a predecessor. This is the point of prev
    static void remove(DNode node) {
        if (node.prev != null) node.prev.next = node.next;
        if (node.next != null) node.next.prev = node.prev;
        node.prev = node.next = null;  // clear both, prevents accidental use
    }
}`,
              zh: `// 双向节点:值 + 前驱 + 后继
class DNode {
    int val;
    DNode prev, next;
    DNode(int v) { val = v; }
}

class Doubly {
    // 在 node 后面插入 x:四根指针,一根都不能少
    static void insertAfter(DNode node, DNode x) {
        x.prev = node;            // ① x 牵住左邻
        x.next = node.next;       // ② x 牵住右邻
        if (node.next != null)
            node.next.prev = x;   // ③ 右邻回牵 x(右邻可能不存在)
        node.next = x;            // ④ 左邻最后改口 —— 还是「先接后断」
    }

    // 删除 node:不用找前驱!这就是 prev 的意义
    static void remove(DNode node) {
        if (node.prev != null) node.prev.next = node.next;
        if (node.next != null) node.next.prev = node.prev;
        node.prev = node.next = null;  // 摘干净,防止误用
    }
}`,
            },
            hl: [11, 12, 14, 15, 20, 21],
          }}
          python={{
            code: {
              en: `class DNode:
    """Doubly linked node: value + previous + next"""
    def __init__(self, val=0):
        self.val = val
        self.prev = None
        self.next = None

def insert_after(node, x):
    """Insert x after node: four references, none of them optional"""
    x.prev = node             # (1) x takes hold of its left neighbor
    x.next = node.next        # (2) x takes hold of its right neighbor
    if node.next:
        node.next.prev = x    # (3) right neighbor points back (may be absent)
    node.next = x             # (4) the left neighbor switches last

def remove(node):
    """Delete node: no search for a predecessor. This is the point of prev"""
    if node.prev:
        node.prev.next = node.next
    if node.next:
        node.next.prev = node.prev
    node.prev = node.next = None   # clear both, prevents accidental use`,
              zh: `class DNode:
    """双向节点:值 + 前驱 + 后继"""
    def __init__(self, val=0):
        self.val = val
        self.prev = None
        self.next = None

def insert_after(node, x):
    """在 node 后面插入 x:四根指针,一根都不能少"""
    x.prev = node             # ① x 牵住左邻
    x.next = node.next        # ② x 牵住右邻
    if node.next:
        node.next.prev = x    # ③ 右邻回牵 x(右邻可能不存在)
    node.next = x             # ④ 左邻最后改口 —— 还是「先接后断」

def remove(node):
    """删除 node:不用找前驱!这就是 prev 的意义"""
    if node.prev:
        node.prev.next = node.next
    if node.next:
        node.next.prev = node.prev
    node.prev = node.next = None   # 摘干净,防止误用`,
            },
            hl: [10, 11, 13, 14, 19, 21],
          }}
          js={{
            code: {
              en: `// Doubly linked node: value + previous + next
class DNode {
  constructor(val = 0) {
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

// Insert x after node: four references, none of them optional
function insertAfter(node, x) {
  x.prev = node;              // (1) x takes hold of its left neighbor
  x.next = node.next;         // (2) x takes hold of its right neighbor
  if (node.next) node.next.prev = x; // (3) right neighbor points back
  node.next = x;              // (4) the left neighbor switches last
}

// Delete node: no search for a predecessor. This is the point of prev
function remove(node) {
  if (node.prev) node.prev.next = node.next;
  if (node.next) node.next.prev = node.prev;
  node.prev = node.next = null;    // clear both, prevents accidental use
}`,
              zh: `// 双向节点:值 + 前驱 + 后继
class DNode {
  constructor(val = 0) {
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

// 在 node 后面插入 x:四根指针,一根都不能少
function insertAfter(node, x) {
  x.prev = node;              // ① x 牵住左邻
  x.next = node.next;         // ② x 牵住右邻
  if (node.next) node.next.prev = x; // ③ 右邻回牵 x
  node.next = x;              // ④ 左邻最后改口 —— 还是「先接后断」
}

// 删除 node:不用找前驱!这就是 prev 的意义
function remove(node) {
  if (node.prev) node.prev.next = node.next;
  if (node.next) node.next.prev = node.prev;
  node.prev = node.next = null;    // 摘干净,防止误用
}`,
            },
            hl: [12, 13, 14, 15, 20, 21],
          }}
        />
        <div className="prose" style={{ marginTop: 24 }}>
          <T
            en={
              <p>
                <strong>A dummy node removes a whole class of bugs.</strong> You
                may have noticed the extra branch for <code>i == 0</code> in
                insertAt and removeAt above. Here is the exact reason:{" "}
                <strong>no node points at the head</strong>. The general rule
                &ldquo;rewrite the next field of the predecessor&rdquo; has
                nothing to rewrite, so the front has to be handled by assigning
                to the head variable itself. A <strong>dummy node</strong>{" "}
                (also called a sentinel) fixes that by placing one fake node in
                front of the head, so <strong>every real node has a
                predecessor</strong>. Compare two versions of the same problem
                (LC 203, delete every node whose value equals val):
              </p>
            }
            zh={
              <p>
                <strong>dummy 哨兵:一个节点换掉一整类 bug。</strong>
                你可能注意到了,上面 insertAt / removeAt 里 <code>i == 0</code>{" "}
                都要单独写一支。原因很具体:<strong>没有任何节点指向头节点</strong>,
                「改前驱的 next」这套通用逻辑在它身上无处落笔,
                只能直接给 head 变量赋值。<strong>dummy(哑结点 / 哨兵结点)</strong>
                的办法很直接:造一个假节点站在 head 前面,让
                <strong>每个真节点都有前驱</strong>。对比同一道题
                (LC 203:删除所有等于 val 的节点)的两个版本:
              </p>
            }
          />
        </div>
        <CodeTabs
          title="dummy_before_after"
          java={{
            code: {
              en: `// (1) No dummy: the head needs its own loop
public ListNode removeElements(ListNode head, int val) {
    while (head != null && head.val == val)
        head = head.next;                 // bad head: move head again
    ListNode cur = head;
    while (cur != null && cur.next != null) {
        if (cur.next.val == val) cur.next = cur.next.next;
        else cur = cur.next;
    }
    return head;
}

// (2) With a dummy: the head is an ordinary node, one loop covers all
public ListNode removeElements(ListNode head, int val) {
    ListNode dummy = new ListNode(0);     // sentinel stands before head
    dummy.next = head;
    ListNode cur = dummy;                 // start there: everyone has a prev
    while (cur.next != null) {
        if (cur.next.val == val) cur.next = cur.next.next;
        else cur = cur.next;
    }
    return dummy.next;                    // the real head is here
}`,
              zh: `// ❶ 没有 dummy:头节点要单独伺候
public ListNode removeElements(ListNode head, int val) {
    while (head != null && head.val == val)
        head = head.next;                 // 头是坏的就一直换头
    ListNode cur = head;
    while (cur != null && cur.next != null) {
        if (cur.next.val == val) cur.next = cur.next.next;
        else cur = cur.next;
    }
    return head;
}

// ❷ 有 dummy:头节点变成普通节点,一套逻辑通吃
public ListNode removeElements(ListNode head, int val) {
    ListNode dummy = new ListNode(0);     // 哨兵站到 head 前面
    dummy.next = head;
    ListNode cur = dummy;                 // 从哨兵出发,人人有前驱
    while (cur.next != null) {
        if (cur.next.val == val) cur.next = cur.next.next;
        else cur = cur.next;
    }
    return dummy.next;                    // 真正的头在这里
}`,
            },
            hl: [15, 16, 17, 22],
          }}
          python={{
            code: {
              en: `# (1) No dummy: the head needs its own loop
def remove_elements(head, val):
    while head and head.val == val:
        head = head.next              # bad head: move head again
    cur = head
    while cur and cur.next:
        if cur.next.val == val:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return head

# (2) With a dummy: the head is an ordinary node, one loop covers all
def remove_elements(head, val):
    dummy = ListNode(0)               # sentinel stands before head
    dummy.next = head
    cur = dummy                       # start there: everyone has a prev
    while cur.next:
        if cur.next.val == val:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return dummy.next                 # the real head is here`,
              zh: `# ❶ 没有 dummy:头节点要单独伺候
def remove_elements(head, val):
    while head and head.val == val:
        head = head.next              # 头是坏的就一直换头
    cur = head
    while cur and cur.next:
        if cur.next.val == val:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return head

# ❷ 有 dummy:头节点变成普通节点,一套逻辑通吃
def remove_elements(head, val):
    dummy = ListNode(0)               # 哨兵站到 head 前面
    dummy.next = head
    cur = dummy                       # 从哨兵出发,人人有前驱
    while cur.next:
        if cur.next.val == val:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return dummy.next                 # 真正的头在这里`,
            },
            hl: [15, 16, 17, 23],
          }}
          js={{
            code: {
              en: `// (1) No dummy: the head needs its own loop
var removeElements = function (head, val) {
  while (head && head.val === val)
    head = head.next;               // bad head: move head again
  let cur = head;
  while (cur && cur.next) {
    if (cur.next.val === val) cur.next = cur.next.next;
    else cur = cur.next;
  }
  return head;
};

// (2) With a dummy: the head is an ordinary node, one loop covers all
var removeElements = function (head, val) {
  const dummy = new ListNode(0);    // sentinel stands before head
  dummy.next = head;
  let cur = dummy;                  // start there: everyone has a prev
  while (cur.next) {
    if (cur.next.val === val) cur.next = cur.next.next;
    else cur = cur.next;
  }
  return dummy.next;                // the real head is here
};`,
              zh: `// ❶ 没有 dummy:头节点要单独伺候
var removeElements = function (head, val) {
  while (head && head.val === val)
    head = head.next;               // 头是坏的就一直换头
  let cur = head;
  while (cur && cur.next) {
    if (cur.next.val === val) cur.next = cur.next.next;
    else cur = cur.next;
  }
  return head;
};

// ❷ 有 dummy:头节点变成普通节点,一套逻辑通吃
var removeElements = function (head, val) {
  const dummy = new ListNode(0);    // 哨兵站到 head 前面
  dummy.next = head;
  let cur = dummy;                  // 从哨兵出发,人人有前驱
  while (cur.next) {
    if (cur.next.val === val) cur.next = cur.next.next;
    else cur = cur.next;
  }
  return dummy.next;                // 真正的头在这里
};`,
            },
            hl: [15, 16, 17, 22],
          }}
        />
        <Callout
          tone="idea"
          title={{
            en: "When should you use a dummy node?",
            zh: "什么时候该请出 dummy?",
          }}
        >
          <T
            en={
              <p>
                One test: <b>use a dummy whenever the head of the answer may
                change</b> — deleted, inserted before, or relinked. Deletion
                problems (LC 203, 19), problems that build a new list (LC 21,
                2), and problems that rearrange a range (LC 92, 24, 25) almost
                all qualify. The cost is one temporary node. What you get is one
                branch fewer and one class of bug fewer, the kind that only
                appears when the operation happens to touch the head. Remember
                to return <code>dummy.next</code> rather than head.
              </p>
            }
            zh={
              <p>
                一句话判据:<b>答案的头节点可能被改动(删除、在它前面插入、
                重新接线)时,就用 dummy</b>。删除类(LC 203、19)、
                构造新链类(LC 21、2)、区间重排类(LC 92、24、25)几乎全中。
                成本是一个临时节点,换来的是少一个分支、
                少一类「恰好动到头节点时才触发」的隐藏 bug。
                记得最后返回 <code>dummy.next</code> 而不是 head。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §05 三语言对照 ================= */}
      <Section
        id="langs"
        index="05"
        title={{
          en: "Three languages: none of them gives you a singly linked list",
          zh: "三语言对照:都没有「现成的单链表」",
        }}
        desc={{
          en: "For interview problems you write ListNode yourself, and Java LinkedList has a well known trap.",
          zh: "刷题全靠手写 ListNode —— 以及 Java LinkedList 的著名陷阱",
        }}
      >
        <div className="prose">
          <T
            en={
              <p>
                A fact that may surprise you:{" "}
                <strong>
                  none of the three languages has a built-in singly linked list
                </strong>{" "}
                that you would use for interview problems. The reason is the
                engineering rule from §02. For general use a dynamic array is
                almost always faster, and the cases where a singly linked list
                is worth it are usually special enough to be worth writing by
                hand. So in problem solving, a linked list is just an agreed{" "}
                <code>ListNode</code> shape that LeetCode defines for you:
              </p>
            }
            zh={
              <p>
                一个可能让你意外的事实:
                <strong>三种语言都没有可以直接拿来刷题的内置单链表</strong>。
                原因正是 §02 那条工程结论 —— 通用场景下动态数组几乎总是更快,
                而单链表值得出场的地方,往往也特殊到值得手写。所以刷题时,
                链表就是一个约定俗成的 <code>ListNode</code>,
                LeetCode 帮你定义好,三语言长这样:
              </p>
            }
          />
        </div>
        <CodeTabs
          title="listnode"
          java={{
            code: {
              en: `// The definition LeetCode gives you (Java)
public class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) {
        this.val = val;
        this.next = next;
    }
}`,
              zh: `// LeetCode 官方定义(Java)
public class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) {
        this.val = val;
        this.next = next;
    }
}`,
            },
            note: {
              en: (
                <>
                  Java does have <code>java.util.LinkedList</code>, but it is a{" "}
                  <b>doubly</b> linked list built for operations at the two
                  ends, and it does not expose its nodes. See the trap below.
                </>
              ),
              zh: (
                <>
                  Java 确实有 <code>java.util.LinkedList</code>,但它是
                  <b>双向</b>链表,为两端操作而设计,而且不暴露节点 ——
                  见下方的陷阱。
                </>
              ),
            },
          }}
          python={{
            code: {
              en: `# The definition LeetCode gives you (Python)
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# The standard library has no linked list. list is a
# dynamic array, and collections.deque is a doubly
# linked list of blocks: O(1) at both ends, but it
# does not expose nodes, so it cannot be used here.`,
              zh: `# LeetCode 官方定义(Python)
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# 标准库里没有链表:list 是动态数组,
# collections.deque 是「块状双向链表」,
# 两端 O(1),但它不暴露节点,
# 不能拿来当刷题链表用 —— 队列章(第 5 章)再见。`,
            },
            note: {
              en: (
                <>
                  The parameter name <code>next</code> shadows the built-in{" "}
                  <code>next()</code> function inside that method. LeetCode
                  writes it this way, but rename it in your own code.
                </>
              ),
              zh: (
                <>
                  参数名 <code>next</code> 会在这个方法内部遮蔽内置函数{" "}
                  <code>next()</code>。LeetCode 模板如此,
                  自己的工程代码里建议改名。
                </>
              ),
            },
          }}
          js={{
            code: {
              en: `// The definition LeetCode gives you (JavaScript)
function ListNode(val, next) {
  this.val = val === undefined ? 0 : val;
  this.next = next === undefined ? null : next;
}

// JavaScript has no linked list at all, and Array is
// a dynamic array. For a queue people usually use an
// array anyway (shift is O(n), so large inputs need a
// hand-written ring buffer or a library).`,
              zh: `// LeetCode 官方定义(JavaScript)
function ListNode(val, next) {
  this.val = val === undefined ? 0 : val;
  this.next = next === undefined ? null : next;
}

// JS 完全没有链表,Array 也是动态数组。
// 需要队列时通常直接用数组
// (shift 是 O(n),数据量大要自己写环形缓冲
//  或者用库)。`,
            },
            note: {
              en: (
                <>
                  You can define it with <code>class</code> syntax instead. What
                  matters is the agreement on the two fields, val and next.
                </>
              ),
              zh: (
                <>
                  用 <code>class</code> 语法自己定义效果一样 ——
                  关键是 val / next 这两个字段的约定。
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
                  <T en="Topic" zh="话题" />
                </th>
                <th>Java</th>
                <th>Python</th>
                <th>JavaScript</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <T en="Built-in singly linked list" zh="内置单链表" />
                </td>
                <td>
                  <T
                    en="None (write ListNode yourself)"
                    zh="无(刷题手写 ListNode)"
                  />
                </td>
                <td>
                  <T en="None (same)" zh="无(同左)" />
                </td>
                <td>
                  <T en="None (same)" zh="无(同左)" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="Default sequence type" zh="默认的序列类型" />
                </td>
                <td>
                  <code>ArrayList</code>{" "}
                  <T en="(dynamic array)" zh="(动态数组)" />
                </td>
                <td>
                  <code>list</code>{" "}
                  <T en="(dynamic array)" zh="(动态数组)" />
                </td>
                <td>
                  <code>Array</code>{" "}
                  <T en="(dynamic array)" zh="(动态数组)" />
                </td>
              </tr>
              <tr>
                <td>
                  <T
                    en="Closest thing in the standard library"
                    zh="最接近链表的现成类"
                  />
                </td>
                <td>
                  <code>LinkedList</code>{" "}
                  <T
                    en={
                      <>
                        (<b>doubly</b> linked, implements List and Deque)
                      </>
                    }
                    zh={
                      <>
                        (<b>双向</b>链表,实现 List + Deque)
                      </>
                    }
                  />
                </td>
                <td>
                  <code>collections.deque</code>{" "}
                  <T
                    en="(doubly linked list of blocks, nodes not exposed)"
                    zh="(块状双向链表,不暴露节点)"
                  />
                </td>
                <td>
                  <T en="None" zh="无" />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="O(1) at both ends" zh="两端 O(1) 操作" />
                </td>
                <td>
                  <code>addFirst / addLast / pollFirst / pollLast</code>
                </td>
                <td>
                  <code>appendleft / append / popleft / pop</code>
                </td>
                <td>
                  <T
                    en={
                      <>
                        Only at the end (<code>push/pop</code>);{" "}
                        <code>shift/unshift</code> at the front are O(n)
                      </>
                    }
                    zh={
                      <>
                        只有尾部(<code>push/pop</code>);头部{" "}
                        <code>shift/unshift</code> 是 O(n)
                      </>
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <T en="The biggest trap" zh="最大陷阱" />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <code>get(i)</code> is <b>O(n)</b> — do not treat it as
                        an array
                      </>
                    }
                    zh={
                      <>
                        <code>get(i)</code> 是 <b>O(n)</b> —— 别当数组用
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en={
                      <>
                        <code>deque[i]</code> in the middle is O(n) as well
                      </>
                    }
                    zh={
                      <>
                        <code>deque[i]</code> 访问中间同样是 O(n)
                      </>
                    }
                  />
                </td>
                <td>
                  <T
                    en="Using an array as a queue and forgetting that shift is O(n)"
                    zh="拿数组模拟队列时忘了 shift 的 O(n)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          tone="warn"
          title={{
            en: "A classic Java accident: using LinkedList like ArrayList",
            zh: "Java 经典事故:把 LinkedList 当 ArrayList 用",
          }}
        >
          <T
            en={
              <p>
                <code>
                  for (int i = 0; i &lt; list.size(); i++) list.get(i)
                </code>{" "}
                costs O(n) on an ArrayList and <b>O(n²)</b> on a{" "}
                <b>LinkedList</b>, because each <code>get(i)</code> walks i
                steps from the head, or from the tail when that end is closer.
                With a hundred thousand elements the first finishes in
                milliseconds and the second takes many seconds. Traverse a
                LinkedList with a for-each loop or an iterator instead: they
                follow next once, so the whole pass is O(n). A more practical
                piece of advice comes from Joshua Bloch, who wrote the class and
                has said he does not use it himself. Use ArrayDeque when you
                need a queue and ArrayList when you need a list; both are
                usually faster.
              </p>
            }
            zh={
              <p>
                <code>
                  for (int i = 0; i &lt; list.size(); i++) list.get(i)
                </code>{" "}
                这段代码对 ArrayList 是 O(n),对 <b>LinkedList 是 O(n²)</b>:
                每次 <code>get(i)</code> 都要从头(或者从更近的尾)重新走 i 步。
                十万条数据,前者毫秒级,后者要好几十秒。遍历 LinkedList
                必须用 for-each 或迭代器 —— 它们沿着 next 走一遍,整体 O(n)。
                更实际的建议来自这个类的作者 Joshua Bloch:他说自己也几乎不用它。
                需要队列用 ArrayDeque,需要列表用 ArrayList,通常都更快。
              </p>
            }
          />
        </Callout>
        <Callout
          tone="deep"
          title={{
            en: "Why Python deque is a linked list of blocks",
            zh: "Python 冷知识:deque 为什么是「块状」的",
          }}
        >
          <T
            en={
              <p>
                <code>collections.deque</code> is not the textbook linked list
                with one element per node. Each node holds{" "}
                <b>a small array of 64 slots</b>, and the blocks are linked to
                each other in both directions. It is a compromise between an
                array and a linked list: both ends stay O(1), while 64 elements
                share one allocation and sit next to each other in memory, so
                the CPU cache works for most of the steps. That removes a large
                part of the cache problem described in §02. Real linked
                structures in production code often look like this.
              </p>
            }
            zh={
              <p>
                <code>collections.deque</code> 不是一个节点一个元素的教科书链表,
                而是<b>每个节点装一块 64 格的小数组</b>,块与块之间双向链接。
                这是链表和数组的折中:两端仍然 O(1),
                同时 64 个元素共享一次内存分配、在内存里紧挨着,
                大部分步伐都能吃到 CPU 缓存 —— §02 说的那个缓存问题被削掉一大半。
                真实工程里的链式结构,大多长这种混血样子。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §06 套路与精讲 ================= */}
      <Section
        id="patterns"
        index="06"
        title={{
          en: "Three patterns: reversal, fast and slow pointers, dummy node",
          zh: "链表的三大招式:反转、快慢指针、dummy",
        }}
        desc={{
          en: "Almost every linked list problem is a combination of these three. Three worked examples, one step at a time.",
          zh: "LeetCode 链表题几乎全是这三招的排列组合 —— 三道代表题,逐帧拆解",
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
                Array problems are usually about finding a clever order to
                visit the elements. Linked list problems are about{" "}
                <strong>
                  getting the order of the pointer writes exactly right
                </strong>
                . The good news is that the patterns are few. Once these three
                are familiar, you have a way into all eleven problems in this
                chapter:
              </p>
            }
            zh={
              <p>
                数组题多半在拼「想到聪明的遍历方式」,链表题则在拼
                <strong>指针改动的顺序一根不错</strong>。
                好消息是套路极其集中 —— 把下面三招练熟,
                本章题单的 11 道题你都能找到入口:
              </p>
            }
          />
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PATTERN 01" zh="招式一" />
            </div>
            <div className="card-title">
              <T en="Three-pointer reversal" zh="三指针反转" />
            </div>
            <T
              en={
                <p>
                  prev, cur, and nxt turn the references around one at a time.
                  Reversing a whole list (206), a range (92), or every group of
                  k (25) are all variations of the same loop. This is the most
                  basic linked list operation there is.
                </p>
              }
              zh={
                <p>
                  prev / cur / nxt 三人小队,把箭头逐个调头。
                  整链反转(206)、区间反转(92)、K 组反转(25)
                  都是同一个循环的变体 —— 这是链表最核心的基本操作。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PATTERN 02" zh="招式二" />
            </div>
            <div className="card-title">
              <T en="Fast and slow pointers" zh="快慢指针" />
            </div>
            <T
              en={
                <p>
                  Two pointers moving at different speeds keep a controlled gap.
                  Fast moves 2 and slow moves 1: find the middle (876) or detect
                  a cycle (141, 142). Move fast n nodes ahead first and the gap
                  stays n: the nth node from the end (19). With the loop
                  condition <b>fast != null &amp;&amp; fast.next != null</b>, an
                  even-length list leaves slow on the <b>second</b> of the two
                  middle nodes.
                </p>
              }
              zh={
                <p>
                  两个指针速度不同,间距因此可控。快 2 慢 1:找中点(876)、
                  判环(141、142);让 fast 先走 n 步,间距就恒为 n:
                  倒数第 n 个(19)。循环条件写成{" "}
                  <b>fast != null &amp;&amp; fast.next != null</b> 时,
                  偶数长度的链表,slow 停在两个中点里的<b>第二个</b>。
                </p>
              }
            />
          </div>
          <div className="card hoverable">
            <div className="card-kicker">
              <T en="PATTERN 03" zh="招式三" />
            </div>
            <div className="card-title">
              <T en="Dummy node" zh="dummy 哨兵" />
            </div>
            <T
              en={
                <p>
                  Might the head change? Put a dummy in front of it, so every
                  node has a predecessor and the special case disappears. It is
                  the standard opening for deletion (203, 19), for building a
                  new list (21, 2), and for rearranging a range (24, 92, 25).
                </p>
              }
              zh={
                <p>
                  头节点可能变动?dummy 站到最前面,人人有前驱,特判归零。
                  删除(203、19)、合并构造(21、2)、
                  重排(24、92、25)的标配起手式。
                </p>
              }
            />
          </div>
        </div>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough A" zh="精讲 A" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 206 · Reverse Linked List" zh="LC 206 · 反转链表" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">
              EASY
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>The problem:</b> reverse a singly linked list and return the
                new head. <b>Brute force:</b> copy the values into an array,
                reverse the array, copy them back. That needs O(n) extra space,
                and copying values does not work at all when a node carries a
                large object.{" "}
                <b>The intended solution:</b> change no values, and{" "}
                <strong>turn each next reference around in place</strong>. The
                difficulty is that the moment you overwrite{" "}
                <code>cur.next</code>, the way to the rest of the list is gone,
                so every round has to save it first. Three pointers, three steps
                per round: <strong>save, turn, advance</strong>:
              </p>
            }
            zh={
              <p>
                <b>题意:</b>反转单链表,返回新的头节点。<b>暴力:</b>
                把值抄进数组、反转数组、再抄回去 —— O(n) 额外空间,
                而且节点携带复杂对象时「抄值」根本不可行。<b>正解:</b>
                不动任何值,<strong>把每根 next 引用原地调头</strong>。
                难点在于:覆盖 <code>cur.next</code> 的瞬间,
                通往后面的路就断了 —— 所以每一轮必须先备份。
                prev / cur / nxt 三人小队,每轮三步:
                <strong>备份 → 调头 → 前移</strong>:
              </p>
            }
          />
        </div>
        <ReverseAnim />
        <CodeTabs
          title="lc206_reverse_list"
          java={{
            code: {
              en: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;        // head of the reversed part (empty now)
        ListNode cur = head;         // the node being processed
        while (cur != null) {
            ListNode nxt = cur.next; // (1) save: cur.next changes next line
            cur.next = prev;         // (2) turn: point backwards
            prev = cur;              // (3) advance: prev follows cur
            cur = nxt;               //     cur moves to the saved node
        }
        return prev;                 // cur is null, so prev is the new head
    }
}`,
              zh: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;        // 已反转部分的头(初始为空)
        ListNode cur = head;         // 正在处理的节点
        while (cur != null) {
            ListNode nxt = cur.next; // ① 备份:下一行就要改 cur.next 了
            cur.next = prev;         // ② 调头:箭头指向身后
            prev = cur;              // ③ 前移:prev 跟上 cur
            cur = nxt;               //    cur 走向刚才备份的节点
        }
        return prev;                 // cur 为 null 时,prev 就是新头
    }
}`,
            },
            hl: [6, 7, 8, 9],
          }}
          python={{
            code: {
              en: `class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        prev = None                # head of the reversed part (empty now)
        cur = head                 # the node being processed
        while cur:
            nxt = cur.next         # (1) save: cur.next changes next line
            cur.next = prev        # (2) turn: point backwards
            prev, cur = cur, nxt   # (3) advance: both move together
        return prev                # cur is None, so prev is the new head`,
              zh: `class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        prev = None                # 已反转部分的头(初始为空)
        cur = head                 # 正在处理的节点
        while cur:
            nxt = cur.next         # ① 备份:下一行就要改 cur.next 了
            cur.next = prev        # ② 调头:箭头指向身后
            prev, cur = cur, nxt   # ③ 前移:两人一起走
        return prev                # cur 为 None 时,prev 就是新头`,
            },
            hl: [6, 7, 8],
          }}
          js={{
            code: {
              en: `var reverseList = function (head) {
  let prev = null;               // head of the reversed part (empty now)
  let cur = head;                // the node being processed
  while (cur) {
    const nxt = cur.next;        // (1) save: cur.next changes next line
    cur.next = prev;             // (2) turn: point backwards
    prev = cur;                  // (3) advance: prev follows cur
    cur = nxt;                   //     cur moves to the saved node
  }
  return prev;                   // cur is null, so prev is the new head
};`,
              zh: `var reverseList = function (head) {
  let prev = null;               // 已反转部分的头(初始为空)
  let cur = head;                // 正在处理的节点
  while (cur) {
    const nxt = cur.next;        // ① 备份:下一行就要改 cur.next 了
    cur.next = prev;             // ② 调头:箭头指向身后
    prev = cur;                  // ③ 前移:prev 跟上 cur
    cur = nxt;                   //    cur 走向刚才备份的节点
  }
  return prev;                   // cur 为 null 时,prev 就是新头
};`,
            },
            hl: [5, 6, 7, 8],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and the usual follow-up questions",
            zh: "复杂度 & 追问",
          }}
        >
          <T
            en={
              <p>
                Time <b>O(n)</b>, one visit per node. Extra space <b>O(1)</b>,
                three pointer variables. Follow-up one:{" "}
                <b>why return prev and not cur?</b> The loop ends when cur is
                null, and at that moment prev is standing on the last node of
                the original list, which is the head of the reversed one.
                Follow-up two: <b>how would you write it recursively?</b>{" "}
                <code>reverseList(head.next)</code> reverses the rest first,
                then <code>head.next.next = head</code> attaches head to the
                end, and <code>head.next = null</code> closes the list. It reads
                well, but the call stack holds one frame per node, so the space
                is <b>O(n)</b>, not O(1), and a long list can exhaust the stack.
                The iterative version is the safer answer.
              </p>
            }
            zh={
              <p>
                时间 <b>O(n)</b>(每个节点处理一次),额外空间 <b>O(1)</b>
                (三个指针变量)。必考追问一:
                <b>为什么返回 prev 而不是 cur?</b> ——
                循环结束的条件是 cur 为 null,此刻 prev 正停在原链的最后一个节点上,
                那就是新链的头。追问二:<b>递归怎么写?</b> ——{" "}
                <code>reverseList(head.next)</code> 先把后面整段反转,再用{" "}
                <code>head.next.next = head</code> 把自己接到末尾,
                最后 <code>head.next = null</code> 收口。写法优雅,
                但调用栈每个节点占一帧,空间是 <b>O(n)</b> 而不是 O(1),
                链一长还可能爆栈 —— 迭代版是更稳妥的答案。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough B" zh="精讲 B" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T en="LC 141 · Linked List Cycle" zh="LC 141 · 环形链表" />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">
              EASY
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>The problem:</b> decide whether a list contains a cycle, that
                is, whether some node&rsquo;s next points back to an earlier
                node. Traversing a list with a cycle never ends, so this is the
                first suspect whenever linked list code hangs.{" "}
                <b>Brute force:</b> record every node you have seen in a hash
                set; seeing one twice means there is a cycle. That is O(n) time
                but O(n) space. <b>The intended solution:</b>{" "}
                Floyd&rsquo;s cycle detection, also called the tortoise and the
                hare. Two pointers start together;{" "}
                <strong>slow moves one node per step and fast moves two</strong>
                . Without a cycle, fast reaches null first. With a cycle, fast
                catches slow inside it:
              </p>
            }
            zh={
              <p>
                <b>题意:</b>判断链表里有没有环 ——
                即是否存在某个节点的 next 指回了前面的节点。
                有环的链表遍历永远不会结束,所以它是「链表操作卡死」的头号嫌犯。
                <b>暴力:</b>用哈希集合记录见过的节点,重逢即有环 —— O(n)
                时间,但要 O(n) 空间。<b>正解:</b>Floyd 判圈,又名龟兔赛跑:
                两个指针同时出发,<strong>slow 每步 1 格,fast 每步 2 格</strong>。
                没有环,fast 先撞上 null;有环,fast 会在环里追上 slow:
              </p>
            }
          />
        </div>
        <CycleAnim />
        <CodeTabs
          title="lc141_linked_list_cycle"
          java={{
            code: {
              en: `public class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        // test fast and fast.next: fast takes two steps at once
        while (fast != null && fast.next != null) {
            slow = slow.next;          // slow moves 1 node
            fast = fast.next.next;     // fast moves 2 nodes
            if (slow == fast) return true; // they meet: there is a cycle
        }
        return false;                  // fast reached null: no cycle
    }
}`,
              zh: `public class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        // fast 和 fast.next 都要判空:fast 一次要走两步
        while (fast != null && fast.next != null) {
            slow = slow.next;          // slow 走 1 格
            fast = fast.next.next;     // fast 走 2 格
            if (slow == fast) return true; // 相遇 = 有环
        }
        return false;                  // fast 撞上 null = 无环
    }
}`,
            },
            hl: [5, 6, 7, 8],
          }}
          python={{
            code: {
              en: `class Solution:
    def hasCycle(self, head: ListNode) -> bool:
        slow = fast = head
        # test fast and fast.next: fast takes two steps at once
        while fast and fast.next:
            slow = slow.next           # slow moves 1 node
            fast = fast.next.next      # fast moves 2 nodes
            if slow is fast:           # they meet: there is a cycle
                return True            # (is compares identity, not value)
        return False                   # fast reached None: no cycle`,
              zh: `class Solution:
    def hasCycle(self, head: ListNode) -> bool:
        slow = fast = head
        # fast 和 fast.next 都要判空:fast 一次要走两步
        while fast and fast.next:
            slow = slow.next           # slow 走 1 格
            fast = fast.next.next      # fast 走 2 格
            if slow is fast:           # 相遇 = 有环
                return True            # (比较的是节点身份,所以用 is)
        return False                   # fast 撞上 None = 无环`,
            },
            hl: [5, 6, 7, 8],
          }}
          js={{
            code: {
              en: `var hasCycle = function (head) {
  let slow = head, fast = head;
  // test fast and fast.next: fast takes two steps at once
  while (fast && fast.next) {
    slow = slow.next;            // slow moves 1 node
    fast = fast.next.next;       // fast moves 2 nodes
    if (slow === fast) return true; // they meet: there is a cycle
  }
  return false;                  // fast reached null: no cycle
};`,
              zh: `var hasCycle = function (head) {
  let slow = head, fast = head;
  // fast 和 fast.next 都要判空:fast 一次要走两步
  while (fast && fast.next) {
    slow = slow.next;            // slow 走 1 格
    fast = fast.next.next;       // fast 走 2 格
    if (slow === fast) return true; // 相遇 = 有环
  }
  return false;                  // fast 撞上 null = 无环
};`,
            },
            hl: [4, 5, 6, 7],
          }}
        />
        <Callout
          tone="deep"
          title={{
            en: "Why must they meet, and why exactly twice the speed?",
            zh: "为什么一定相遇?为什么恰好快 2 倍?",
          }}
        >
          <T
            en={
              <p>
                Measure the distance from fast forward along the cycle to slow.
                Once both are inside the cycle, that distance is a whole number
                that is never negative. Every step, fast advances 2 and slow
                advances 1, so the distance{" "}
                <b>drops by exactly 1</b>. A whole number that decreases by 1
                each step must reach 0, and 0 means both pointers are on the
                same node. There is no way to step over each other. That also
                answers &ldquo;why not three times as fast&rdquo;: with a
                relative speed of 2 the distance drops by 2 and can pass over 0
                without ever equalling it. Two pointers starting from the head
                still meet in that case, but showing it needs modular
                arithmetic rather than this one-line argument. The relative
                speed 1 version has the cleanest proof and the clearest bound:
                after slow enters the cycle, they meet within one lap.
              </p>
            }
            zh={
              <p>
                沿着环,量「从 fast 往前走到 slow」的距离。两者都进环之后,
                这个距离是一个不会变成负数的整数;而每走一步,fast 前进 2、
                slow 前进 1,距离<b>恰好减 1</b>。
                一个每步减 1 的非负整数必然减到 0,
                而 0 就意味着两个指针停在同一个节点上 —— 不存在「擦肩而过」。
                这也回答了「为什么不是快 3 倍」:相对速度变成 2 时,
                距离每步减 2,可能直接跨过 0 而永远不等于 0。
                两个指针都从头出发时最终仍会相遇,
                但那需要用同余去证明,而不是这一句话。
                相对速度为 1 的版本证明最干净、上界也最清楚:
                slow 进环后不到一圈就会相遇。
              </p>
            }
          />
        </Callout>
        <Callout
          tone="win"
          title={{
            en: "Complexity and the usual follow-up question",
            zh: "复杂度 & 追问",
          }}
        >
          <T
            en={
              <p>
                Time <b>O(n)</b>, extra space <b>O(1)</b>, against the O(n)
                space of the hash set version. The follow-up you should expect:{" "}
                <b>how do you find where the cycle starts?</b> (LC 142) After
                they meet, move one pointer back to head and advance both{" "}
                <b>one node per step</b>; the node where they meet again is the
                entrance. Behind it is the equation &ldquo;distance from head to
                the entrance = distance from the meeting point round to the
                entrance, plus a whole number of laps&rdquo;, which follows from
                &ldquo;fast travelled twice as far as slow&rdquo;. Get the
                meeting argument of 141 straight first; 142 is then one step of
                algebra.
              </p>
            }
            zh={
              <p>
                时间 <b>O(n)</b>,额外空间 <b>O(1)</b> ——
                比哈希表解法省掉 O(n) 空间。必考追问:
                <b>环的入口怎么找?</b>(LC 142)相遇后把一个指针放回 head,
                两个指针改为<b>每步一格</b>同速前进,再次相遇处就是入口。
                背后是等式「头到入口的距离 = 相遇点绕回入口的距离 + 整数圈」,
                由「fast 路程 = 2 × slow 路程」推出。
                先把 141 的相遇原理讲顺,142 只是一步代数。
              </p>
            }
          />
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">
            <T en="Walkthrough C" zh="精讲 C" />
          </span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            <T
              en="LC 21 · Merge Two Sorted Lists"
              zh="LC 21 · 合并两个有序链表"
            />
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">
              EASY+
            </span>
          </span>
        </div>
        <div className="prose">
          <T
            en={
              <p>
                <b>The problem:</b> two lists sorted in increasing order, merged
                into one sorted list by relinking the existing nodes, not by
                creating new values. <b>The idea:</b> the same as merging two
                sorted piles of paper. Compare the top sheet of each pile and
                move the smaller one to the result. The comparison is not the
                hard part.{" "}
                <strong>
                  Deciding which node becomes the head of the result is
                </strong>{" "}
                — it may come from l1 or from l2. Rather than writing branches
                for that, start with a <strong>dummy node</strong> and let tail
                append after it:
              </p>
            }
            zh={
              <p>
                <b>题意:</b>两条升序链表,合并成一条升序链表 ——
                复用原有节点重新接线,而不是新建值。<b>思路:</b>
                和「合并两摞已排序的考卷」一样:比较两摞最上面那张,
                取小的放进结果堆。难点不在比较,
                <strong>而在结果链的第一个节点是谁</strong> ——
                它可能来自 l1,也可能来自 l2。不想为此写一堆 if?
                <strong>用 dummy 哨兵起手</strong>,tail 从 dummy 出发一路往后挂:
              </p>
            }
          />
        </div>
        <MergeAnim />
        <CodeTabs
          title="lc21_merge_two_lists"
          java={{
            code: {
              en: `class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0); // sentinel: no "who is head" branch
        ListNode tail = dummy;            // last node of the result so far
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {       // <= keeps the merge stable
                tail.next = l1;           // attach the head node of l1
                l1 = l1.next;
            } else {
                tail.next = l2;
                l2 = l2.next;
            }
            tail = tail.next;             // tail follows
        }
        tail.next = (l1 != null) ? l1 : l2; // attach the whole rest, O(1)
        return dummy.next;                // skip the sentinel, real head
    }
}`,
              zh: `class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0); // 哨兵:免去「谁当头」的特判
        ListNode tail = dummy;            // 结果链当前的最后一个节点
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {       // ≤ 让合并保持稳定
                tail.next = l1;           // 把 l1 的头节点挂到结果尾
                l1 = l1.next;
            } else {
                tail.next = l2;
                l2 = l2.next;
            }
            tail = tail.next;             // 尾巴跟上
        }
        tail.next = (l1 != null) ? l1 : l2; // 剩余整段直接挂上,O(1)
        return dummy.next;                // 跳过哨兵,返回真正的头
    }
}`,
            },
            hl: [3, 4, 15, 16],
          }}
          python={{
            code: {
              en: `class Solution:
    def mergeTwoLists(self, l1: ListNode, l2: ListNode) -> ListNode:
        dummy = ListNode(0)        # sentinel: no "who is head" branch
        tail = dummy               # last node of the result so far
        while l1 and l2:
            if l1.val <= l2.val:   # <= keeps the merge stable
                tail.next = l1     # attach the head node of l1
                l1 = l1.next
            else:
                tail.next = l2
                l2 = l2.next
            tail = tail.next       # tail follows
        tail.next = l1 or l2       # attach the whole rest, O(1)
        return dummy.next          # skip the sentinel, real head`,
              zh: `class Solution:
    def mergeTwoLists(self, l1: ListNode, l2: ListNode) -> ListNode:
        dummy = ListNode(0)        # 哨兵:免去「谁当头」的特判
        tail = dummy               # 结果链当前的最后一个节点
        while l1 and l2:
            if l1.val <= l2.val:   # ≤ 让合并保持稳定
                tail.next = l1     # 把 l1 的头节点挂到结果尾
                l1 = l1.next
            else:
                tail.next = l2
                l2 = l2.next
            tail = tail.next       # 尾巴跟上
        tail.next = l1 or l2       # 剩余整段直接挂上,O(1)
        return dummy.next          # 跳过哨兵,返回真正的头`,
            },
            hl: [3, 4, 13, 14],
          }}
          js={{
            code: {
              en: `var mergeTwoLists = function (l1, l2) {
  const dummy = new ListNode(0);  // sentinel: no "who is head" branch
  let tail = dummy;               // last node of the result so far
  while (l1 && l2) {
    if (l1.val <= l2.val) {       // <= keeps the merge stable
      tail.next = l1;             // attach the head node of l1
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;             // tail follows
  }
  tail.next = l1 || l2;           // attach the whole rest, O(1)
  return dummy.next;              // skip the sentinel, real head
};`,
              zh: `var mergeTwoLists = function (l1, l2) {
  const dummy = new ListNode(0);  // 哨兵:免去「谁当头」的特判
  let tail = dummy;               // 结果链当前的最后一个节点
  while (l1 && l2) {
    if (l1.val <= l2.val) {       // ≤ 让合并保持稳定
      tail.next = l1;             // 把 l1 的头节点挂到结果尾
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;             // 尾巴跟上
  }
  tail.next = l1 || l2;           // 剩余整段直接挂上,O(1)
  return dummy.next;              // 跳过哨兵,返回真正的头
};`,
            },
            hl: [2, 3, 14, 15],
          }}
        />
        <Callout
          tone="win"
          title={{
            en: "Complexity and the usual follow-up questions",
            zh: "复杂度 & 追问",
          }}
        >
          <T
            en={
              <p>
                Time <b>O(n + m)</b>, each node is attached once. Extra space{" "}
                <b>O(1)</b>: two variables, dummy and tail, and every node is
                reused. Look at the last line,{" "}
                <code>tail.next = l1 or l2</code>. Attaching the whole remaining
                segment of a linked list is a single pointer write, O(1);
                merging arrays would have to copy those elements. The follow-up
                to expect: <b>what about K lists?</b> (LC 23, Hard) Merging them
                one pair at a time is O(nK); taking the smallest of the K
                current heads from a min-heap gives O(n log K), which is covered
                in the heap chapter (chapter 09). This merge step is also the
                core of <b>merge sort</b>, which is how a linked list is sorted
                (LC 148).
              </p>
            }
            zh={
              <p>
                时间 <b>O(n + m)</b>(每个节点被挂一次),额外空间{" "}
                <b>O(1)</b>(只多了 dummy 和 tail 两个变量,节点全是复用的)。
                注意最后那行 <code>tail.next = l1 或 l2</code>:
                链表拼接剩余整段只是一次指针写入,O(1);换成数组合并,
                剩下的元素还得逐个复制。必考追问:<b>合并 K 条呢?</b>
                (LC 23,Hard)两两合并是 O(nK);
                用最小堆每次取 K 个当前头节点里最小的,是 O(n log K) ——
                堆章(第 9 章)会讲。这个合并本身也是<b>归并排序</b>的核心步骤,
                链表排序(LC 148)就靠它。
              </p>
            }
          />
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title={{
          en: "Problem set: 11 linked list problems",
          zh: "高频题单:链表 11 题",
        }}
        desc={{
          en: "Deletion, then fast and slow pointers, then dummy nodes, then reversal combinations. Your checkmarks are stored locally.",
          zh: "删除 → 快慢指针 → dummy → 反转综合,由易到难。勾选进度存在本地",
        }}
        badge={
          <span className="chip">
            <T en="Hot 100 selection" zh="Hot 100 精选" />
          </span>
        }
      >
        <ProblemSet ch="linked-list" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title={{ en: "Quiz", zh: "通关测验" }}
        desc={{
          en: "Answer all 7 correctly to light up this chapter.",
          zh: "7 题全对,点亮本章绿灯",
        }}
        badge={
          <span className="chip">
            <T en="✎ Quiz" zh="✎ 通关测验" />
          </span>
        }
      >
        <Quiz ch="linked-list" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          {
            en: (
              <>
                A linked list is nodes of <b>value + next reference</b>{" "}
                scattered in memory. The order lives only in the references, so
                there is no address formula and{" "}
                <b>access and search are O(n)</b>. In exchange it needs no
                contiguous block and never has to be copied to grow.
              </>
            ),
            zh: (
              <>
                链表 = <b>值 + next 引用</b>的节点散落在内存各处,
                顺序只存在于引用里 —— 没有地址公式,
                <b>访问 / 查找都是 O(n)</b>;
                换来的是不需要连续内存、也永远不必为扩容整体搬家。
              </>
            ),
          },
          {
            en: (
              <>
                The full version of &ldquo;insertion and deletion are
                O(1)&rdquo;: <b>rewriting the references is O(1), finding the
                predecessor is O(n)</b>. The real use is when the node reference
                is already in your hand, as in an LRU cache (hash map + doubly
                linked list).
              </>
            ),
            zh: (
              <>
                「插删 O(1)」的完整版:
                <b>改指针 O(1),找前驱 O(n)</b>。
                真正的主场是「节点引用本来就在手上」——
                LRU 缓存(哈希表 + 双向链表)是教科书案例。
              </>
            ),
          },
          {
            en: (
              <>
                Pointer rule: <b>connect before you disconnect</b> (
                <code>newNode.next = cur</code> first,{" "}
                <code>prev.next = newNode</code> second). Reversed, the whole
                second half of the list loses its last reference.{" "}
                <b>Save the next node</b> before you overwrite a next field.
              </>
            ),
            zh: (
              <>
                指针操作铁律:<b>先接后断</b>(
                <code>newNode.next = cur</code> 在前,
                <code>prev.next = newNode</code> 在后)。
                顺序反了,整条后半链会失去最后一个引用。
                改 next 之前<b>先备份下一个节点</b>。
              </>
            ),
          },
          {
            en: (
              <>
                Three patterns: <b>three-pointer reversal</b> (save, turn,
                advance), <b>fast and slow pointers</b> (relative speed 1, so
                the gap drops by 1 per step and a meeting is unavoidable inside
                a cycle), and the <b>dummy node</b> (every node gets a
                predecessor, so the head needs no special case).
              </>
            ),
            zh: (
              <>
                三大招式:<b>三指针反转</b>(备份 → 调头 → 前移)、
                <b>快慢指针</b>(相对速度 1,距离每步减 1,
                在环里必然相遇)、<b>dummy 哨兵</b>
                (人人有前驱,头节点的特判随之消失)。
              </>
            ),
          },
          {
            en: (
              <>
                Choosing and language traps: prefer the array family by default,
                because it is cache friendly. None of the three languages has a
                built-in singly linked list, so you write ListNode yourself.{" "}
                <b>Java LinkedList.get(i) is O(n)</b>, which makes an index loop
                O(n²); it is a deque, not an array.
              </>
            ),
            zh: (
              <>
                选型与语言坑:默认用数组家族(缓存友好);
                三语言都没有内置单链表,刷题手写 ListNode;
                <b>Java 的 LinkedList.get(i) 是 O(n)</b>,
                用下标循环遍历就变成 O(n²) —— 它是双端队列,不是数组。
              </>
            ),
          },
        ]}
      />

      <ChapterFooter ch="linked-list" />
    </main>
  );
}
