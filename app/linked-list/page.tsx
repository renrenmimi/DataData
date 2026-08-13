"use client";

// 第 3 章 · 链表 —— 「一场寻宝游戏」。
// 十段式:直觉(数组插删之痛 → 寻宝游戏)→ 内存里的样子(散落 + 引用)→
// 核心操作(重点:先接后断 + O(1) 的前提)→ 手写实现(单链表 / 双向链表 / dummy)→
// 三语言对照 → 反转·快慢指针·dummy 三大套路 + 三道精讲 → 题单 → 测验 → 要点。

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
import { ScatterMap, LinkedLab, ReverseAnim, CycleAnim, MergeAnim } from "./viz";
import "./chapter.css";

const CHIPS = [
  { id: "intuition", n: "01", label: "直觉" },
  { id: "memory", n: "02", label: "内存里的样子" },
  { id: "ops", n: "03", label: "核心操作" },
  { id: "impl", n: "04", label: "手写实现" },
  { id: "langs", n: "05", label: "三语言对照" },
  { id: "patterns", n: "06", label: "套路与精讲" },
  { id: "problems", n: "07", label: "高频题单" },
  { id: "quiz", n: "08", label: "通关测验" },
];

export default function LinkedListChapter() {
  return (
    <main className="page" data-ch="linked-list">
      <Hero
        ch="linked-list"
        title={
          <>
            链表 <span className="grad">Linked List</span>
          </>
        }
        essence={
          <>
            一场寻宝游戏:每个节点只告诉你<strong>下一站在哪</strong>。
            它放弃了数组的连续与下标,换来一件数组永远做不到的事:
            <strong>拿着节点,插入删除只改两根指针 —— O(1),零搬家</strong>。
          </>
        }
        chips={CHIPS}
      />

      {/* ================= §01 直觉 ================= */}
      <Section
        id="intuition"
        index="01"
        title="直觉:从「全体搬家」到「递纸条」"
        desc="数组的痛点在哪,链表就为哪而生"
      >
        <div className="prose">
          <p>
            先回放第 1 章最贵的一幕:往数组中间插一个元素,插入点右边的
            <strong>所有元素集体右移一格</strong>;删一个,右边全体左移补位。
            数据量十万条、操作频繁发生在中间时,这个 O(n)
            的搬家成本就是实打实的性能账单。根源只有一个:数组把「逻辑上的相邻」
            焊死在了「物理上的相邻」上 —— 想在两个邻居之间挤进来,只能推倒重排。
          </p>
          <p>
            链表(linked list)的思路是釜底抽薪:<strong>凭什么相邻的元素必须住在隔壁?</strong>
            让每个元素想住哪住哪,只要每人身上带一张纸条,写着「下一个人住在哪」。
            这就是寻宝游戏:你拿到第一条线索(head,头指针),
            按纸条找到下一站,再下一站……纸条断了(null),宝藏找完了。
          </p>
          <p>
            在这样的世界里,「在 A 和 B 之间插入 C」变得便宜到离谱:
            C 的纸条写上「下一站 B」,再把 A 的纸条改成「下一站 C」——
            <strong>改两张纸条,全世界其他人原地不动</strong>。
            代价呢?你失去了门牌号:想找第 100 个人,只能从头一张张纸条追过去。
            链表的三条家规:
          </p>
        </div>
        <div className="grid-3" style={{ marginTop: 18 }}>
          <div className="card hoverable">
            <div className="card-kicker">RULE 01</div>
            <div className="card-title">不连续</div>
            <p>
              节点(node)在内存里<b>想住哪住哪</b>,彼此可以隔十万八千里。
              好处:不需要一大块连续内存,也永远不用「扩容搬家」;
              代价:CPU 缓存很难替你预读下一个。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 02</div>
            <div className="card-title">靠引用相连</div>
            <p>
              每个节点 = <b>值 + next 引用</b>。逻辑顺序完全由引用织成,
              和物理地址无关 —— 所谓「链」,就是这一串手拉手的引用。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">RULE 03</div>
            <div className="card-title">无下标</div>
            <p>
              没有「地址 = 首地址 + i × 大小」的公式可用。想到第 i 个,
              只能从 head 开始跳 i 次 —— <b>访问是 O(n)</b>,
              这是它为 O(1) 插删付出的对价。
            </p>
          </div>
        </div>
        <Callout tone="story" title="它藏在你每天用的系统里">
          <p>
            操作系统的<b>内存分配器</b>用空闲块链表(free list)串起零散内存;
            文件系统 FAT 用「每块指向下一块」的方式存文件(所以老 U
            盘的文件会碎成一串);Redis 的列表、内核的进程队列、
            浏览器的历史记录,都有链表的影子。而面试里最出名的组合拳 ——{" "}
            <b>LRU 缓存(LC 146)= 哈希表 + 双向链表</b>,正是「拿着节点引用 O(1)
            插删」这个独门绝技的完美舞台,第 13 章我们会亲手拼出它。
          </p>
        </Callout>
      </Section>

      {/* ================= §02 内存里的样子 ================= */}
      <Section
        id="memory"
        index="02"
        title="内存里的样子:散落的节点,看不见的线"
        desc="同一批值的两种住法 —— 以及为什么链表永远没有 O(1) 下标"
      >
        <div className="prose">
          <p>
            <Link href="/#refs">序章 §03</Link> 说过:<strong>引用(reference)
            本质上就是一个内存地址</strong> —— 一张写着「去 2096 号找它」的纸条。
            链表的节点无非是把「值」和「纸条」打包放在一起。
            下图是同一批值 [7, 2, 9] 的两种住法,注意链表三个节点的物理顺序
            (2096 → 3120 → 1432)和逻辑顺序(7 → 2 → 9)<strong>毫无关系</strong>:
          </p>
        </div>
        <ScatterMap />
        <div className="grid-2" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-title">为什么没有 O(1) 下标访问?</div>
            <p>
              数组的 O(1) 来自那条地址公式,而公式成立靠「连续 + 同型」。
              链表节点散落各处,第 i 个节点的地址<b>只记录在第 i−1
              个节点肚子里</b> —— 想知道它在哪,必须先找到前一个,层层递推。
              信息的存放方式决定了访问方式:O(n) 不是实现不够好,是结构使然。
            </p>
          </div>
          <div className="card">
            <div className="card-title">节点长什么样?</div>
            <p>
              <code>{"{ val: 7, next: 1432 }"}</code> —— 一格值 + 一格地址。
              在 Java/Python/JS 里,next 就是一个指向下一个节点对象的引用,
              指向「无」时记作 <code>null / None / null</code>,
              它是每条链的终点站,也是空指针异常的第一案发现场。
            </p>
          </div>
        </div>
        <Callout tone="deep" title="工程视角:链表为什么常常比理论上还慢">
          <p>
            第 1 章讲过 CPU 缓存行:读 arr[0] 时,arr[1..15] 顺便进了缓存。
            链表享受不到这个红利 —— 下一个节点在哪只有运行时才知道,
            CPU 没法预取,几乎每跳一步都可能<b>缓存未命中</b>(去主存取数,
            慢上百倍)。所以「数组和链表遍历都是 O(n)」在纸上成立,
            在真机上数组常快一个数量级。工程铁律:<b>默认用数组家族,
            确有 O(1) 插删需求(且拿得到节点引用)才请链表出山</b>。
          </p>
        </Callout>
      </Section>

      {/* ================= §03 核心操作 ================= */}
      <Section
        id="ops"
        index="03"
        title="核心操作:改指针便宜,找位置贵"
        desc="每个 O(1) 都挂着一个前提 —— 重点动画:先接后断"
      >
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>操作</th>
                <th>复杂度</th>
                <th>为什么</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>访问第 i 个 / 按值查找</b></td>
                <td><BigO o="n" /></td>
                <td>没有下标公式,只能从 head 一路 next 跳过去</td>
              </tr>
              <tr>
                <td><b>头插 / 头删</b></td>
                <td><BigO o="1" /></td>
                <td>head 就在手上:改 1~2 根引用,与链长无关</td>
              </tr>
              <tr>
                <td>
                  <b>插入 / 删除(已持有前驱)</b>
                </td>
                <td><BigO o="1" /></td>
                <td>
                  改 2 根(插)或 1 根(删)指针 ——{" "}
                  <b>前提是前驱已经在手里!</b>这是链表全部价值的来源
                </td>
              </tr>
              <tr>
                <td><b>按位置 i 插入 / 删除</b></td>
                <td><BigO o="n" /></td>
                <td>找前驱 O(n) + 改指针 O(1) —— 大头在「找」,不在「改」</td>
              </tr>
              <tr>
                <td><b>尾插</b>(维护 tail 指针)</td>
                <td><BigO o="1" /></td>
                <td>tail 直接定位末尾;不维护 tail 就得走全程,O(n)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            表里最重要的一行是第三行的<strong>前提</strong>。
            「链表插删 O(1)」这句话掐头去尾流传太广,完整版是:
            <strong>改指针 O(1),找到该改哪根指针 O(n)</strong>。
            所以链表真正的高光场景,是「前驱/节点引用本来就在手上」的情况 ——
            比如遍历途中顺手删除、比如 LRU 缓存里哈希表直接把节点递给你。
          </p>
          <p>
            插入本身只有两步,但<strong>顺序是生死攸关的</strong>。
            口诀「先接后断」:新节点先牵住后继(newNode.next = cur),
            前驱再改口(prev.next = newNode)。顺序反了会怎样?
            下面实验室里有一个「反面教材」按钮,亲手丢一次后半条链,印象比十遍口诀深:
          </p>
        </div>
        <LinkedLab />
        <Callout tone="warn" title="链表 bug 三巨头">
          <p>
            ① <b>先断后接</b>:后半条链失联(上面刚演示过);②{" "}
            <b>空指针</b>:对 null 取 <code>.next</code> ——
            循环条件先判空(<code>cur != null &amp;&amp; cur.next != null</code>
            ,顺序都不能反);③ <b>头节点特判漏写</b>:删头/插头时没有前驱可改
            —— §04 的 dummy 哨兵专治这个。写链表题之前先画图,
            指针改动顺序在纸上排好再下手,是所有老手的共同习惯。
          </p>
        </Callout>
      </Section>

      {/* ================= §04 手写实现 ================= */}
      <Section
        id="impl"
        index="04"
        title="手写实现:单链表、双向链表与 dummy 哨兵"
        desc="从零造一个能用的链表 —— 三语言逐行注释"
      >
        <div className="prose">
          <p>
            <strong>单链表(singly linked list)完整实现。</strong>维护 head、tail、
            size 三个字段:tail 让尾插降到 O(1),size 让长度查询降到 O(1)
            —— 两个「用一点空间买时间」的小决策。所有方法的套路都是一句话:
            <strong>找到前驱,改指针</strong>:
          </p>
        </div>
        <CodeTabs
          title="my_linked_list"
          java={{
            code: `// 节点:值 + 下一站的引用
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
            prev = cur;               // ③ 前移
            cur = nxt;
        }
        head = prev;                  // prev 停在原来的尾 = 新头
    }

    // 导出成数组,方便打印调试
    public int[] toArray() {
        int[] out = new int[size];
        ListNode cur = head;
        for (int i = 0; i < size; i++, cur = cur.next) out[i] = cur.val;
        return out;
    }
}`,
            note: (
              <>
                <b>易错点:</b>每个会动 head/tail 的方法都要照顾空链表与单节点两种边界
                —— 链表 bug 的 80% 出在边界。测试顺序:空表 → 一个元素 → 两个元素。
              </>
            ),
            hl: [33, 34, 52],
          }}
          python={{
            code: `class ListNode:
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
            prev, cur = cur, nxt  # ③ 前移(Python 可一行)
        self.head = prev          # prev 停在原来的尾 = 新头

    def to_array(self):
        """导出成 list,方便打印调试"""
        out, cur = [], self.head
        while cur:
            out.append(cur.val)
            cur = cur.next
        return out`,
            note: (
              <>
                <b>易错点:</b>判空用 <code>is None</code> 而不是 <code>== None</code>;
                <code>prev, cur = cur, nxt</code> 这种多重赋值是右边先整体求值,
                写反转时特别顺手 —— 但也别炫技把三步压成一行,可读性优先。
              </>
            ),
            hl: [36, 37, 57],
          }}
          js={{
            code: `// 节点:值 + 下一站的引用
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
      prev = cur;               // ③ 前移
      cur = nxt;
    }
    this.head = prev;           // prev 停在原来的尾 = 新头
  }

  // 导出成数组,方便打印调试
  toArray() {
    const out = [];
    for (let cur = this.head; cur; cur = cur.next) out.push(cur.val);
    return out;
  }
}`,
            note: (
              <>
                <b>易错点:</b><code>if (!cur)</code> 判空很顺手,但注意 val 为 0
                时 <code>if (!cur.val)</code> 会误判 —— 判节点存在和判值大小要分开写。
              </>
            ),
            hl: [40, 41, 60],
          }}
        />
        <div className="prose" style={{ marginTop: 24 }}>
          <p>
            <strong>双向链表(doubly linked list):回头路也修上。</strong>
            每个节点多带一根 <code>prev</code> 引用,于是可以从任一节点向两边走。
            两大收益:① <strong>删除不再需要「找前驱」</strong> ——
            节点自己就知道前驱是谁,拿到节点即可 O(1) 删除(LRU 缓存的命脉);
            ② 支持从尾向头遍历。代价:每节点多 8 字节,每次插删要维护{" "}
            <strong>4 根</strong>指针,顺序更容易写错:
          </p>
        </div>
        <CodeTabs
          title="doubly_linked_core"
          java={{
            code: `// 双向节点:值 + 前驱 + 后继
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

    // 删除 node:不用找前驱!这就是双向的意义
    static void remove(DNode node) {
        if (node.prev != null) node.prev.next = node.next;
        if (node.next != null) node.next.prev = node.prev;
        node.prev = node.next = null;  // 摘干净,防误用也帮 GC
    }
}`,
            hl: [11, 12, 14, 15, 20, 21],
          }}
          python={{
            code: `class DNode:
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
    """删除 node:不用找前驱!这就是双向的意义"""
    if node.prev:
        node.prev.next = node.next
    if node.next:
        node.next.prev = node.prev
    node.prev = node.next = None   # 摘干净,防误用`,
            hl: [10, 11, 13, 14, 19, 21],
          }}
          js={{
            code: `// 双向节点:值 + 前驱 + 后继
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

// 删除 node:不用找前驱!这就是双向的意义
function remove(node) {
  if (node.prev) node.prev.next = node.next;
  if (node.next) node.next.prev = node.prev;
  node.prev = node.next = null;    // 摘干净,防误用
}`,
            hl: [12, 13, 14, 15, 20, 21],
          }}
        />
        <div className="prose" style={{ marginTop: 24 }}>
          <p>
            <strong>dummy 哨兵:一个节点换掉一类 bug。</strong>你可能注意到了:
            上面 insertAt / removeAt 里,<code>i == 0</code>{" "}
            都要单独写一支代码 —— 因为头节点<strong>没有前驱</strong>,
            「改前驱的 next」这套通用逻辑对它失效。dummy(哑结点/哨兵结点)
            的办法简单粗暴:造一个假节点站在 head 前面,让<strong>人人都有前驱</strong>。
            对比同一道题(LC 203 删除所有等于 val 的节点)的两个版本:
          </p>
        </div>
        <CodeTabs
          title="dummy_before_after"
          java={{
            code: `// ❶ 没有 dummy:头节点要单独伺候
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
    return dummy.next;                    // 真正的头在这里!
}`,
            hl: [15, 16, 17, 22],
          }}
          python={{
            code: `# ❶ 没有 dummy:头节点要单独伺候
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
    return dummy.next                 # 真正的头在这里!`,
            hl: [15, 16, 17, 23],
          }}
          js={{
            code: `// ❶ 没有 dummy:头节点要单独伺候
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
  return dummy.next;                // 真正的头在这里!
};`,
            hl: [15, 16, 17, 22],
          }}
        />
        <Callout tone="idea" title="什么时候该请出 dummy?">
          <p>
            一句话判据:<b>答案的头节点可能被改动(删除、插入、重接)时,就用
            dummy</b>。删除类(LC 203、19)、构造新链类(LC 21、2)、
            区间重排类(LC 92、24、25)几乎全中。成本是一个临时节点,
            换来的是少一支 if、少一处只在「恰好动到头」时才触发的隐藏
            bug —— 面试里它是「熟练度」的直接信号。
          </p>
        </Callout>
      </Section>

      {/* ================= §05 三语言对照 ================= */}
      <Section
        id="langs"
        index="05"
        title="三语言对照:都没有「现成的单链表」"
        desc="刷题全靠手写 ListNode —— 以及 Java LinkedList 的著名陷阱"
      >
        <div className="prose">
          <p>
            一个可能让你意外的事实:<strong>三种语言都没有内置的单链表类型</strong>。
            原因正是 §02 那条工程铁律 —— 通用场景下动态数组几乎总是更快,
            单链表值得出场的地方,往往也特殊到值得手写。所以刷题时,
            链表就是一个约定俗成的 <code>ListNode</code>,LeetCode 帮你定义好,
            三语言长这样:
          </p>
        </div>
        <CodeTabs
          title="listnode"
          java={{
            code: `// LeetCode 官方定义(Java)
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
            note: (
              <>
                Java 另有 <code>java.util.LinkedList</code>(双向链表),
                但它是给「两端操作」用的 —— 见下方陷阱。
              </>
            ),
          }}
          python={{
            code: `# LeetCode 官方定义(Python)
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# 标准库没有链表;collections.deque 是
# 「块状双向链表」:两端 O(1),但它不暴露节点,
# 不能当刷题链表用 —— 队列章(第 5 章)再见。`,
            note: (
              <>
                参数名 <code>next</code> 会遮蔽内置函数 next() ——
                LeetCode 模板如此,自己工程代码里建议改名。
              </>
            ),
          }}
          js={{
            code: `// LeetCode 官方定义(JavaScript)
function ListNode(val, next) {
  this.val = val === undefined ? 0 : val;
  this.next = next === undefined ? null : next;
}

// JS 标准库同样没有链表。
// 需要队列/双端队列时,通常直接用数组
// (shift 是 O(n),数据量大要手写或用库)。`,
            note: (
              <>
                写题时也可以用 class 语法自己定义,效果一样 ——
                关键是 val / next 两个字段的约定。
              </>
            ),
          }}
        />
        <div className="table-wrap">
          <table className="t-table">
            <thead>
              <tr>
                <th>话题</th>
                <th>Java</th>
                <th>Python</th>
                <th>JavaScript</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>内置单链表</td>
                <td>无(刷题手写 ListNode)</td>
                <td>无(同左)</td>
                <td>无(同左)</td>
              </tr>
              <tr>
                <td>现成的链表类</td>
                <td>
                  <code>LinkedList</code>(<b>双向</b>链表,实现 List + Deque)
                </td>
                <td>
                  <code>collections.deque</code>(块状双向链表,不暴露节点)
                </td>
                <td>无</td>
              </tr>
              <tr>
                <td>两端 O(1) 操作</td>
                <td><code>addFirst / addLast / pollFirst / pollLast</code></td>
                <td><code>appendleft / append / popleft / pop</code></td>
                <td>只有尾部(<code>push/pop</code>);头部 <code>shift/unshift</code> 是 O(n)</td>
              </tr>
              <tr>
                <td>最大陷阱</td>
                <td>
                  <code>get(i)</code> 是 <b>O(n)</b> —— 别当数组用
                </td>
                <td>
                  <code>deque[i]</code> 中间访问也是 O(n)
                </td>
                <td>拿数组模拟队列时忘了 shift 的 O(n)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout tone="warn" title="Java 经典事故:把 LinkedList 当 ArrayList 用">
          <p>
            <code>for (int i = 0; i &lt; list.size(); i++) list.get(i)</code> ——
            这段代码对 ArrayList 是 O(n),对 <b>LinkedList 是 O(n²)</b>:
            每次 get(i) 都要从头(或尾)重新走 i 步。十万条数据,
            前者毫秒级,后者要几十秒。遍历 LinkedList 必须用
            for-each 或迭代器(它们沿着 next 走,整体 O(n))。
            更实际的建议来自 LinkedList 作者本人 Joshua Bloch:
            「我自己都几乎不用它」—— 需要队列用 ArrayDeque,需要列表用
            ArrayList,几乎总是更快。
          </p>
        </Callout>
        <Callout tone="deep" title="Python 冷知识:deque 为什么是「块状」的">
          <p>
            <code>collections.deque</code> 不是一个节点一个元素的教科书链表,
            而是<b>每个节点装一块 64 个元素的小数组</b>,块与块之间双向链接。
            这是链表和数组的折中:保留两端 O(1),同时让 64
            个元素共享一次内存分配、挤进同一段缓存行 ——
            把链表「缓存不友好」的缺点稀释掉一大半。真实工程里的链表,
            大多长这种混血样子。
          </p>
        </Callout>
      </Section>

      {/* ================= §06 套路与精讲 ================= */}
      <Section
        id="patterns"
        index="06"
        title="链表的三大招式:反转、快慢指针、dummy"
        desc="LeetCode 链表题几乎全是这三招的排列组合 —— 三道代表题,逐帧拆解"
        badge={<span className="chip" data-tone="warn">★ 面试核心</span>}
      >
        <div className="prose">
          <p>
            链表题和数组题气质完全不同:数组题拼「想到聪明的遍历方式」,
            链表题拼「<strong>指针改动的顺序一根不错</strong>」。
            好消息是套路极其集中 —— 把下面三招练到肌肉记忆,
            本章题单的 11 道题你都能找到入口:
          </p>
        </div>
        <div className="grid-3">
          <div className="card hoverable">
            <div className="card-kicker">招式一</div>
            <div className="card-title">三指针反转</div>
            <p>
              prev / cur / nxt 三人小队,把箭头逐个调头。
              整链反转(206)、区间反转(92)、K 组反转(25)——
              全是它的变体,是链表最核心的基本操作。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">招式二</div>
            <div className="card-title">快慢指针</div>
            <p>
              速度差制造相对位移:快 2 倍 → 找中点(876)、判环(141)、
              找环入口(142);先走 n 步 → 倒数第 k(19)。
              一次遍历解决「位置未知」的问题。
            </p>
          </div>
          <div className="card hoverable">
            <div className="card-kicker">招式三</div>
            <div className="card-title">dummy 哨兵</div>
            <p>
              头节点可能变动?dummy 站到最前面,人人有前驱,
              特判归零。删除(203、19)、合并构造(21、2)、
              重排(24、92、25)的标配起手式。
            </p>
          </div>
        </div>

        {/* —— 精讲 A —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 A</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 206 · 反转链表
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">EASY</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>反转单链表,返回新头。<b>暴力:</b>把值抄进数组、
            反转数组、再抄回去 —— O(n) 额外空间,而且「抄值」在节点携带复杂对象时根本不可行。
            <b> 正解:</b>不动任何值,<strong>把每根 next 箭头原地调头</strong>。
            难点在于:调头 cur.next 的瞬间,通往下一个节点的路就断了 ——
            所以每一轮必须先备份。prev / cur / nxt 三人小队,每轮三步:
            <strong>备份 → 调头 → 前移</strong>:
          </p>
        </div>
        <ReverseAnim />
        <CodeTabs
          title="lc206_reverse_list"
          java={{
            code: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;        // 已反转区的头(初始为空)
        ListNode cur = head;         // 正在处理的节点
        while (cur != null) {
            ListNode nxt = cur.next; // ① 备份:马上要改 cur.next 了
            cur.next = prev;         // ② 调头:箭头指向身后
            prev = cur;              // ③ 前移:prev 跟上
            cur = nxt;               //    cur 走向备份的下一站
        }
        return prev;                 // cur 为 null 时,prev 是新头
    }
}`,
            hl: [6, 7, 8, 9],
          }}
          python={{
            code: `class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        prev = None                # 已反转区的头(初始为空)
        cur = head                 # 正在处理的节点
        while cur:
            nxt = cur.next         # ① 备份:马上要改 cur.next 了
            cur.next = prev        # ② 调头:箭头指向身后
            prev, cur = cur, nxt   # ③ 前移:两人一起走
        return prev                # cur 为 None 时,prev 是新头`,
            hl: [6, 7, 8],
          }}
          js={{
            code: `var reverseList = function (head) {
  let prev = null;               // 已反转区的头(初始为空)
  let cur = head;                // 正在处理的节点
  while (cur) {
    const nxt = cur.next;        // ① 备份:马上要改 cur.next 了
    cur.next = prev;             // ② 调头:箭头指向身后
    prev = cur;                  // ③ 前移:prev 跟上
    cur = nxt;                   //    cur 走向备份的下一站
  }
  return prev;                   // cur 为 null 时,prev 是新头
};`,
            hl: [5, 6, 7, 8],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n)</b>(每节点一次),空间 <b>O(1)</b>(三个指针变量)。
            必考追问一:「<b>为什么返回 prev 不是 cur?</b>」——
            循环结束的条件是 cur == null,此刻 prev 正停在原链的最后一个节点上。
            追问二:「<b>递归怎么写?</b>」—— reverseList(head.next)
            先把后面全反转,再 head.next.next = head 把自己接到尾上;
            优雅,但调用栈 O(n) 空间,还有爆栈风险 —— 迭代版永远是首选答案。
          </p>
        </Callout>

        {/* —— 精讲 B —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 B</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 141 · 环形链表
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">EASY</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>判断链表里有没有环(某个节点的 next 指回了前面)。
            有环的链表遍历永不结束 —— 这是所有「链表操作卡死」的头号嫌犯。
            <b> 暴力:</b>哈希表记录见过的节点,重逢即有环 —— O(n) 时间,
            但要 O(n) 空间。<b>正解:</b>Floyd 判圈,又名<strong>龟兔赛跑</strong>:
            两个指针同时出发,🐢 每次 1 步、🐇 每次 2 步。没有环,🐇 先撞上
            null;有环,🐇 会在环里追上 🐢:
          </p>
        </div>
        <CycleAnim />
        <CodeTabs
          title="lc141_linked_list_cycle"
          java={{
            code: `public class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        // fast 和 fast.next 都要判空:fast 一次要走两步
        while (fast != null && fast.next != null) {
            slow = slow.next;          // 🐢 走 1 步
            fast = fast.next.next;     // 🐇 走 2 步
            if (slow == fast) return true; // 相遇 = 有环
        }
        return false;                  // 🐇 撞上 null = 无环
    }
}`,
            hl: [5, 6, 7, 8],
          }}
          python={{
            code: `class Solution:
    def hasCycle(self, head: ListNode) -> bool:
        slow = fast = head
        # fast 和 fast.next 都要判空:fast 一次要走两步
        while fast and fast.next:
            slow = slow.next           # 🐢 走 1 步
            fast = fast.next.next      # 🐇 走 2 步
            if slow is fast:           # 相遇 = 有环
                return True            # (比较节点身份,用 is)
        return False                   # 🐇 撞上 None = 无环`,
            hl: [5, 6, 7, 8],
          }}
          js={{
            code: `var hasCycle = function (head) {
  let slow = head, fast = head;
  // fast 和 fast.next 都要判空:fast 一次要走两步
  while (fast && fast.next) {
    slow = slow.next;            // 🐢 走 1 步
    fast = fast.next.next;       // 🐇 走 2 步
    if (slow === fast) return true; // 相遇 = 有环
  }
  return false;                  // 🐇 撞上 null = 无环
};`,
            hl: [4, 5, 6, 7],
          }}
        />
        <Callout tone="deep" title="为什么一定相遇?为什么恰好快 2 倍?">
          <p>
            换到 🐢 的参照系看:🐢 静止,🐇 以每步 1 格的<b>相对速度</b>逼近。
            两者都进环后,距离是个有限整数,每步减 1,严格递减 ——
            必然减到 0,不存在「擦肩而过」。这也回答了「为什么不是快 3
            倍」:相对速度 2 时距离每步减 2,奇数距离会跳过 0,
            虽然最终也能相遇(在环里多绕几圈),但「每步减 1」的版本证明最干净、
            步数上界最清晰(🐢 进环后不到一圈必相遇)。面试标准答案就是这段话。
          </p>
        </Callout>
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n)</b>,空间 <b>O(1)</b> —— 完胜哈希表解法的 O(n) 空间。
            必考追问:「<b>环的入口怎么找?</b>」(LC 142):相遇后把一个指针放回
            head,两人改为<b>同速</b>前进,再次相遇处就是入口 —— 背后是等式
            「头到入口的距离 = 相遇点绕到入口的距离 + 整数圈」,由「🐇 路程 =
            2 × 🐢 路程」推出。先把 141 的相遇原理讲顺,142 只是一步代数。
          </p>
        </Callout>

        {/* —— 精讲 C —— */}
        <div className="sec-head" style={{ marginTop: 44 }}>
          <span className="sec-index">精讲 C</span>
          <h3 className="sec-title" style={{ fontSize: 20 }}>
            LC 21 · 合并两个有序链表
          </h3>
          <span className="sec-badge">
            <span className="lc-badge" data-d="easy">EASY+</span>
          </span>
        </div>
        <div className="prose">
          <p>
            <b>题意:</b>两条升序链表,合并成一条升序链表(拼接原节点,不新建值)。
            <b> 思路:</b>和「合并两摞已排序的考卷」一样 ——
            每次比较两摞最上面那张,取小的放进结果堆。难点不在比较,
            在<strong>结果链的第一个节点是谁</strong>:可能来自 l1 也可能来自
            l2,不想写一堆 if?<strong>dummy 哨兵起手</strong>,tail
            从 dummy 出发一路往后挂:
          </p>
        </div>
        <MergeAnim />
        <CodeTabs
          title="lc21_merge_two_lists"
          java={{
            code: `class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0); // 哨兵:免去「谁当头」特判
        ListNode tail = dummy;            // 结果链的尾巴
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {       // ≤ 保证稳定(相等取 l1)
                tail.next = l1;           // 摘下 l1 队头挂到结果尾
                l1 = l1.next;
            } else {
                tail.next = l2;
                l2 = l2.next;
            }
            tail = tail.next;             // 尾巴前移
        }
        tail.next = (l1 != null) ? l1 : l2; // 剩余整段直接挂上,O(1)
        return dummy.next;                // 跳过哨兵,返回真头
    }
}`,
            hl: [3, 4, 15, 16],
          }}
          python={{
            code: `class Solution:
    def mergeTwoLists(self, l1: ListNode, l2: ListNode) -> ListNode:
        dummy = ListNode(0)        # 哨兵:免去「谁当头」特判
        tail = dummy               # 结果链的尾巴
        while l1 and l2:
            if l1.val <= l2.val:   # ≤ 保证稳定(相等取 l1)
                tail.next = l1     # 摘下 l1 队头挂到结果尾
                l1 = l1.next
            else:
                tail.next = l2
                l2 = l2.next
            tail = tail.next       # 尾巴前移
        tail.next = l1 or l2       # 剩余整段直接挂上,O(1)
        return dummy.next          # 跳过哨兵,返回真头`,
            hl: [3, 4, 13, 14],
          }}
          js={{
            code: `var mergeTwoLists = function (l1, l2) {
  const dummy = new ListNode(0);  // 哨兵:免去「谁当头」特判
  let tail = dummy;               // 结果链的尾巴
  while (l1 && l2) {
    if (l1.val <= l2.val) {       // ≤ 保证稳定(相等取 l1)
      tail.next = l1;             // 摘下 l1 队头挂到结果尾
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;             // 尾巴前移
  }
  tail.next = l1 || l2;           // 剩余整段直接挂上,O(1)
  return dummy.next;              // 跳过哨兵,返回真头
};`,
            hl: [2, 3, 14, 15],
          }}
        />
        <Callout tone="win" title="复杂度 & 追问">
          <p>
            时间 <b>O(n+m)</b>(每个节点被挂一次),空间 <b>O(1)</b>
            (只多了 dummy 和 tail 两个变量,节点全是复用的)。
            注意最后那行 <code>tail.next = l1 或 l2</code>:
            链表拼接剩余整段是 O(1) —— 数组合并可没这种好事。必考追问:
            「<b>合并 K 条呢?</b>」(LC 23,Hard):两两合并是 O(nK),
            用最小堆每次取 K 个队头里最小的,O(n log K) —— 堆章(第 9 章)见;
            这个合并本身也是<b>归并排序</b>的核心步骤,链表排序(LC 148)靠它。
          </p>
        </Callout>
      </Section>

      {/* ================= §07 题单 ================= */}
      <Section
        id="problems"
        index="07"
        title="高频题单:链表 11 题"
        desc="删除 → 快慢指针 → dummy → 反转综合,由易到难。勾选进度存在本地"
        badge={<span className="chip">Hot 100 精选</span>}
      >
        <ProblemSet ch="linked-list" items={PROBLEMS} />
      </Section>

      {/* ================= §08 Quiz ================= */}
      <Section
        id="quiz"
        index="08"
        title="通关测验"
        desc="7 题全对,点亮本章绿灯"
        badge={<span className="chip">✎ 通关测验</span>}
      >
        <Quiz ch="linked-list" items={QUIZ} />
      </Section>

      <KeyPoints
        points={[
          <>
            链表 = <b>值 + next 引用</b>的节点散落在内存各处,逻辑顺序只存在于引用里
            → 没有下标公式,<b>访问/查找 O(n)</b>;好处是不需要连续内存、永不扩容搬家。
          </>,
          <>
            「插删 O(1)」的完整版:<b>改指针 O(1),找前驱 O(n)</b>。
            真正的主场是「节点引用已在手上」——
            LRU 缓存(哈希表 + 双向链表)是教科书案例。
          </>,
          <>
            指针操作铁律:<b>先接后断</b>(newNode.next = cur 先行,prev.next =
            newNode 殿后),顺序反了丢整条后半链;改 next 之前<b>先备份</b>。
          </>,
          <>
            三大招式:<b>三指针反转</b>(备份→调头→前移)、<b>快慢指针</b>
            (中点/判环:相对速度 1,距离每步减 1 必相遇)、<b>dummy 哨兵</b>
            (人人有前驱,头特判归零)。
          </>,
          <>
            选型与语言坑:默认数组家族(缓存友好);三语言都没有内置单链表,
            刷题手写 ListNode;<b>Java LinkedList.get(i) 是 O(n)</b>,
            循环下标遍历直接 O(n²) —— 它是双端队列,不是数组。
          </>,
        ]}
      />

      <ChapterFooter ch="linked-list" />
    </main>
  );
}
