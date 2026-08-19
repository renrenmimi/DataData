"use client";

// 第 4 章 · 栈的专属可视化:
//  - StackMemFig:§02 静态图解 —— 数组栈(栈顶在尾)vs 链表栈(栈顶在头)。
//  - StackLab:垂直堆叠的盘子,亲手 push / pop / peek,盯住栈顶指针与空栈边界。
//  - CallStackDemo:函数调用栈逐帧(main → f → g),顺便解释栈溢出的来历。
//
// 双语:所有标题、旁白、按钮、帧内文字都通过 <T> / useL() 切换。

import { Fragment, useRef, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { useL, T, type Loc } from "@/lib/i18n";

/* ---------------- StackMemFig ---------------- */

export function StackMemFig() {
  return (
    <div className="grid-2" style={{ marginTop: 18 }}>
      <div className="card">
        <div className="card-kicker">
          <T en="IMPLEMENTATION 1 · ARRAY" zh="实现一 · 顺序栈" />
        </div>
        <div className="card-title">
          <T
            en="Array: the top is the last slot"
            zh="数组实现:栈顶 = 尾部"
          />
        </div>
        <div className="stk-figptrs">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i}>{i === 3 && <span className="ptr">top</span>}</span>
          ))}
        </div>
        <div className="stk-figcells">
          {[3, 7, 1, 9].map((v, i) => (
            <div key={i} className={`cell${i === 3 ? " lit" : ""}`}>
              {v}
              <span className="cell-idx">{i}</span>
            </div>
          ))}
          <div className="cell ghost">
            ·<span className="cell-idx">4</span>
          </div>
          <div className="cell ghost">
            ·<span className="cell-idx">5</span>
          </div>
        </div>
        <p className="stk-fignote">
          <T
            en={
              <>
                ✓ push and pop both happen at the <b>end</b>, so no other
                element moves: O(1).
                <br />✗ If the top were at index 0, every push and pop would
                shift the whole array by one: O(n). That is the lesson from the
                array chapter.
              </>
            }
            zh={
              <>
                ✓ push / pop 全在<b>尾部</b>:不惊动任何其他元素,O(1)。
                <br />✗ 若把栈顶放在头部(下标 0):每次 push / pop 都要全体搬家一格,
                O(n) —— 数组章的教训。
              </>
            }
          />
        </p>
      </div>
      <div className="card">
        <div className="card-kicker">
          <T en="IMPLEMENTATION 2 · LINKED LIST" zh="实现二 · 链式栈" />
        </div>
        <div className="card-title">
          <T
            en="Linked list: the top is the head node"
            zh="链表实现:栈顶 = 头节点"
          />
        </div>
        <div className="stk-figlist">
          {[9, 1, 7, 3].map((v, i) => (
            <Fragment key={i}>
              <div className="stk-lnode">
                {i === 0 ? (
                  <span className="ptr">top</span>
                ) : (
                  <span style={{ height: 22 }} />
                )}
                <div className={`nodec${i === 0 ? " lit" : ""}`}>{v}</div>
              </div>
              <span className="stk-arrow" aria-hidden>
                →
              </span>
            </Fragment>
          ))}
          <span className="stk-null">null</span>
        </div>
        <p className="stk-fignote">
          <T
            en={
              <>
                ✓ The top is the <b>head node</b>: inserting and deleting there
                changes one pointer, O(1) even in the worst case, and there is
                never a resize.
                <br />△ The cost: every push allocates a node, every node
                carries an extra next pointer, and the nodes are scattered on
                the heap, so access is less cache-friendly than an array (see
                the linked list chapter).
              </>
            }
            zh={
              <>
                ✓ 栈顶 = <b>头节点</b>:头插 / 头删只改一根指针,最坏情况也是 O(1),
                而且永不扩容。
                <br />△ 代价:每次 push 都要分配一个节点,每个节点多背一个 next
                指针,节点散落在堆上,访问不如数组缓存友好(链表章讲过)。
              </>
            }
          />
        </p>
      </div>
    </div>
  );
}

/* ---------------- StackLab ---------------- */

const CAPACITY = 7;

export function StackLab() {
  const [items, setItems] = useState<{ id: number; v: number }[]>([
    { id: 1, v: 3 },
    { id: 2, v: 7 },
  ]);
  const [peeking, setPeeking] = useState(false);
  const [pushes, setPushes] = useState(0);
  const [pops, setPops] = useState(0);
  const seq = useRef(3);
  const [msg, setMsg] = useState<ReactNode>(
    <T
      en={
        <>
          Two plates are in place. push adds one on top, pop takes the top one
          off. Watch <b>top</b>: it always points at the highest plate.
        </>
      }
      zh={
        <>
          一摞盘子已就位。push 压上去、pop 拿下来 —— 盯住 <b>top</b>
          ,它永远跟着最上面那只盘子。
        </>
      }
    />,
  );

  const push = () => {
    setPeeking(false);
    if (items.length >= CAPACITY) {
      setMsg(
        <T
          en={
            <>
              The stack is full (capacity {CAPACITY}). A fixed-size array
              implementation refuses the new element. A dynamic array
              implementation resizes to twice the capacity, copies the elements,
              and then accepts it. That copy is the reason push is O(1)
              amortized rather than O(1) in the worst case.
            </>
          }
          zh={
            <>
              栈满(容量 {CAPACITY})!定长数组实现会直接拒绝;
              动态数组实现会先扩容到两倍、复制元素,再收下它 ——
              这次复制正是 push 只能算「均摊 O(1)」而不是最坏 O(1) 的原因。
            </>
          }
        />,
      );
      return;
    }
    const v = ((seq.current * 5) % 9) + 1;
    const id = seq.current++;
    setItems((arr) => [...arr, { id, v }]);
    setPushes((p) => p + 1);
    setMsg(
      <T
        en={
          <>
            push({v}): the new plate can only go on <b>top</b>, and no other
            plate moves — <b>O(1)</b>. top moves up one level.
          </>
        }
        zh={
          <>
            push({v}):新盘子只能放到<b>最上面</b>,不惊动下面任何人 —— <b>O(1)</b>。
            top 自动上移一层。
          </>
        }
      />,
    );
  };

  const pop = () => {
    setPeeking(false);
    if (items.length === 0) {
      setMsg(
        <T
          en={
            <>
              ⚠ pop on an empty stack. Java (ArrayDeque) throws
              NoSuchElementException, Python raises IndexError, and JavaScript
              returns undefined without any error. Decide what your code does
              here before you write it.
            </>
          }
          zh={
            <>
              ⚠ 空栈 pop!Java(ArrayDeque)抛 NoSuchElementException、Python 抛
              IndexError、JS 不报错直接返回 undefined —— 写任何栈代码前,先想好这个边界。
            </>
          }
        />,
      );
      return;
    }
    const top = items[items.length - 1];
    setItems((arr) => arr.slice(0, -1));
    setPops((p) => p + 1);
    setMsg(
      <T
        en={
          <>
            pop() = <b>{top.v}</b>: only the <b>top</b> plate can be taken —{" "}
            <b>O(1)</b>. To reach the bottom plate you have to remove everything
            above it. That is the rule, not a defect.
          </>
        }
        zh={
          <>
            pop() = <b>{top.v}</b>:只能拿<b>最上面</b>的盘子 —— <b>O(1)</b>。
            想拿栈底的?先把上面的全拿走。这不是缺陷,是纪律。
          </>
        }
      />,
    );
  };

  const peek = () => {
    if (items.length === 0) {
      setMsg(
        <T
          en={
            <>
              peek on an empty stack: the same edge case. Ask isEmpty() before
              you touch the top.
            </>
          }
          zh={<>空栈 peek:同样的边界 —— 动手前先问一句 isEmpty()。</>}
        />,
      );
      return;
    }
    setPeeking(true);
    setMsg(
      <T
        en={
          <>
            peek() = <b>{items[items.length - 1].v}</b>: it reads the top
            without removing it, so the stack is unchanged. Algorithms such as
            LC 20 and LC 739 check the top this way at every step.
          </>
        }
        zh={
          <>
            peek() = <b>{items[items.length - 1].v}</b>:只看不拿,栈保持原样。
            LC 20、LC 739 这类算法每一步都靠它先看一眼栈顶。
          </>
        }
      />,
    );
  };

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="StackLab — push a pile of plates yourself"
          zh="StackLab —— 亲手压一摞盘子"
        />
      </div>
      <div className="viz-stage">
        <div className="stk-well-wrap">
          <div className="stk-well">
            {items.length === 0 && (
              <div className="stk-empty">
                <T en="empty stack ∅" zh="空栈 ∅" />
              </div>
            )}
            {[...items].reverse().map((it, ri) => (
              <div
                key={it.id}
                className={`stk-plate${ri === 0 ? " top" : ""}${
                  ri === 0 && peeking ? " peeking" : ""
                }`}
              >
                {it.v}
                {ri === 0 && <span className="stk-top-tag">top</span>}
              </div>
            ))}
          </div>
          <div className="stk-base">
            <T
              en="bottom · closed, no access here"
              zh="栈底(封死,无人能动)"
            />
          </div>
        </div>
      </div>
      <div className="viz-msg">{msg}</div>
      <div className="viz-ctl">
        <button type="button" className="btn btn-sm btn-primary" onClick={push}>
          push
        </button>
        <button type="button" className="btn btn-sm" onClick={pop}>
          pop
        </button>
        <button type="button" className="btn btn-sm" onClick={peek}>
          peek
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          <T
            en={`size ${items.length} · pushes ${pushes} · pops ${pops}`}
            zh={`size ${items.length} · 累计 push ${pushes} · 累计 pop ${pops}`}
          />
        </span>
      </div>
    </div>
  );
}

/* ---------------- CallStackDemo ---------------- */

interface CSFrame {
  stack: { fn: string; note: Loc<string> }[];
  msg: Loc<ReactNode>;
  boom?: boolean;
}

const CS_FRAMES: CSFrame[] = [
  {
    stack: [
      {
        fn: "main()",
        note: {
          en: "local a · resumes at line 2",
          zh: "局部变量 a · 回到第 2 行继续",
        },
      },
    ],
    msg: (
      <T
        en={
          <>
            When the program starts, the <b>stack frame</b> for main is pushed
            first. A frame holds this function&rsquo;s parameters, its local
            variables, and the address to return to.
          </>
        }
        zh={
          <>
            程序一启动,main 的<b>栈帧(stack frame)</b>率先入栈。
            帧里装着这个函数的参数、局部变量,以及「回到哪一行继续」的返回地址。
          </>
        }
      />
    ),
  },
  {
    stack: [
      {
        fn: "main()",
        note: { en: "paused, waiting for f", zh: "暂停,等 f 的结果" },
      },
      {
        fn: "f(2)",
        note: {
          en: "parameter x = 2 · return address in main",
          zh: "参数 x=2 · 返回地址 → main",
        },
      },
    ],
    msg: (
      <T
        en={
          <>
            main calls <b>f(2)</b>. main is paused and keeps its resume point,
            and the new frame for f is <b>pushed on top</b>. The CPU only ever
            executes the frame on top.
          </>
        }
        zh={
          <>
            main 调用 <b>f(2)</b>:main 暂停,记住自己停在哪;f 的新帧
            <b>压到最上面</b>。CPU 永远只执行栈顶那一帧。
          </>
        }
      />
    ),
  },
  {
    stack: [
      { fn: "main()", note: { en: "paused", zh: "暂停" } },
      {
        fn: "f(2)",
        note: { en: "paused, waiting for g", zh: "暂停,等 g 的结果" },
      },
      {
        fn: "g(3)",
        note: {
          en: "local y = 3 · return address in f",
          zh: "局部变量 y=3 · 返回地址 → f",
        },
      },
    ],
    msg: (
      <T
        en={
          <>
            f calls <b>g(3)</b>, so another frame is pushed. g was called last
            and must finish <b>first</b>. Function calls are LIFO by nature,
            which is why the runtime keeps them on a stack.
          </>
        }
        zh={
          <>
            f 内部又调用 <b>g(3)</b>:再压一帧。最后被调用的 g 必须<b>最先</b>执行完
            —— 函数调用天生就是 LIFO,这正是运行时用栈来管理它们的原因。
          </>
        }
      />
    ),
  },
  {
    stack: [
      { fn: "main()", note: { en: "paused", zh: "暂停" } },
      {
        fn: "f(2)",
        note: {
          en: "resumes, receives 4 from g",
          zh: "从断点继续,拿到 g 的返回值 4",
        },
      },
    ],
    msg: (
      <T
        en={
          <>
            g computes 4 and <b>returns</b>. Its frame is popped and destroyed,
            so its local variables are gone. The CPU continues at the return
            address stored in that frame, back inside f.{" "}
            <b>Every return is one pop.</b>
          </>
        }
        zh={
          <>
            g 算出 4,<b>return</b>:g 的帧被弹出销毁(它的局部变量随之消失),
            CPU 顺着帧里的返回地址回到 f 被打断的那一行。<b>每次 return = 一次 pop。</b>
          </>
        }
      />
    ),
  },
  {
    stack: [
      {
        fn: "main()",
        note: {
          en: "resumes, receives 8 from f",
          zh: "从断点继续,拿到 f 的返回值 8",
        },
      },
    ],
    msg: (
      <T
        en={
          <>
            f finishes with g&rsquo;s result and returns 8. Its frame is popped
            and control is back in main. One frame is left.
          </>
        }
        zh={<>f 拿着 g 的结果算完,返回 8:f 弹出,回到 main。栈又只剩一帧。</>}
      />
    ),
  },
  {
    stack: [],
    msg: (
      <T
        en={
          <>
            main returns, the stack is empty, and the program exits.{" "}
            <b>Recursion</b>, in chapter 07, is a function pushing frames for
            itself onto this same stack.
          </>
        }
        zh={
          <>
            main 结束,栈清空,程序退出。第 7 章的<b>递归</b>
            ,本质就是函数不断把「自己」压进这个栈。
          </>
        }
      />
    ),
  },
  {
    stack: [
      { fn: "main()", note: { en: "the bottom frame", zh: "最底层" } },
      { fn: "f(1)", note: { en: "no base case…", zh: "没有终止条件…" } },
      { fn: "f(1)", note: { en: "calls itself again…", zh: "又调用了自己…" } },
      { fn: "f(1)", note: { en: "still calling itself…", zh: "还在调用自己…" } },
    ],
    boom: true,
    msg: (
      <T
        en={
          <>
            One more case: a recursive function with no base case keeps pushing
            frames. The memory reserved for the call stack, usually 1 to 8 MB,
            fills within milliseconds and the program crashes. This is a{" "}
            <b>stack overflow</b>: StackOverflowError in Java, RecursionError in
            Python. The question-and-answer site Stack Overflow is named after
            it.
          </>
        }
        zh={
          <>
            再看一种情况:递归忘了写终止条件,栈帧不断堆积 ——
            调用栈的地盘(通常 1~8 MB)几毫秒就被填满,程序崩溃。这就是
            <b>栈溢出</b>:Java 的 StackOverflowError、Python 的 RecursionError。
            那个著名的程序员问答网站 Stack Overflow,名字就来自它。
          </>
        }
      />
    ),
  },
];

export function CallStackDemo() {
  const L = useL();
  const s = useStepper(CS_FRAMES.length, 1600);
  const f = CS_FRAMES[s.step];

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="CallStackDemo — the call stack, frame by frame"
          zh="CallStackDemo —— 函数调用栈逐帧"
        />
      </div>
      <div className="viz-stage">
        <div className="stk-cs">
          <div className="stk-cs-col">
            {f.boom && (
              <>
                <div className="stk-cframe boom">💥 StackOverflowError</div>
                <div className="stk-cframe ghosty">
                  <b>f(1)</b>
                  <span>
                    <T
                      en="…tens of thousands more frames…"
                      zh="…还有几万帧…"
                    />
                  </span>
                </div>
              </>
            )}
            {f.stack.length === 0 && !f.boom && (
              <div className="stk-empty" style={{ textAlign: "center" }}>
                <T
                  en="(the call stack is empty — the program has exited)"
                  zh="(调用栈已空 —— 程序退出)"
                />
              </div>
            )}
            {[...f.stack].reverse().map((fr, i) => (
              <div
                key={`${s.step}-${i}`}
                className={`stk-cframe${i === 0 && !f.boom ? " on" : ""}${
                  f.boom ? " ghosty" : ""
                }`}
              >
                <b>{fr.fn}</b>
                <span>{L(fr.note)}</span>
              </div>
            ))}
          </div>
          <div className="stk-cs-lab">
            <T
              en="call stack · grows upward · the top frame is running"
              zh="调用栈 · 向上生长 · 栈顶正在执行"
            />
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {L(f.msg)}
      </div>
      <StepControls stepper={s} step={s.step} total={CS_FRAMES.length} />
    </div>
  );
}
