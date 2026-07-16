"use client";

// 第 4 章 · 栈的专属可视化:
//  - StackMemFig:§02 静态图解 —— 数组栈(栈顶在尾)vs 链表栈(栈顶在头)。
//  - StackLab:垂直堆叠的盘子,亲手 push / pop / peek,盯住栈顶指针与空栈边界。
//  - CallStackDemo:函数调用栈逐帧(main → f → g),顺便解释 StackOverflow 的来历。

import { Fragment, useRef, useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

/* ---------------- StackMemFig ---------------- */

export function StackMemFig() {
  return (
    <div className="grid-2" style={{ marginTop: 18 }}>
      <div className="card">
        <div className="card-kicker">实现一 · 顺序栈</div>
        <div className="card-title">数组实现:栈顶 = 尾部</div>
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
          ✓ push / pop 全在<b>尾部</b>:不惊动任何其他元素,O(1)。
          <br />✗ 若把栈顶放在头部(下标 0):每次 push / pop 都要全体搬家一格,
          O(n) —— 数组章的教训。
        </p>
      </div>
      <div className="card">
        <div className="card-kicker">实现二 · 链式栈</div>
        <div className="card-title">链表实现:栈顶 = 头节点</div>
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
          ✓ 栈顶 = <b>头节点</b>:头插 / 头删只改一根指针,O(1),永不扩容。
          <br />△ 代价:每个节点额外背一个 next 指针,节点散落堆上,
          缓存不如数组友好(链表章讲过)。
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
    <>
      一摞盘子已就位。push 压上去、pop 拿下来 —— 盯住 <b>top</b>
      ,它永远跟着最上面那只盘子。
    </>,
  );

  const push = () => {
    setPeeking(false);
    if (items.length >= CAPACITY) {
      setMsg(
        <>
          栈满(容量 {CAPACITY})!定长数组实现会拒绝服务;
          动态数组实现会先 ×2 扩容搬家再收下 —— 数组章的老朋友,均摊后仍是 O(1)。
        </>,
      );
      return;
    }
    const v = ((seq.current * 5) % 9) + 1;
    const id = seq.current++;
    setItems((arr) => [...arr, { id, v }]);
    setPushes((p) => p + 1);
    setMsg(
      <>
        push({v}):新盘子只能放到<b>最上面</b>,不惊动下面任何人 —— <b>O(1)</b>。
        top 自动上移一层。
      </>,
    );
  };

  const pop = () => {
    setPeeking(false);
    if (items.length === 0) {
      setMsg(
        <>
          ⚠ 空栈 pop!Java(ArrayDeque)抛 NoSuchElementException、Python 抛
          IndexError、JS 静默返回 undefined —— 写任何栈代码前,先想好这个边界。
        </>,
      );
      return;
    }
    const top = items[items.length - 1];
    setItems((arr) => arr.slice(0, -1));
    setPops((p) => p + 1);
    setMsg(
      <>
        pop() = <b>{top.v}</b>:只能拿<b>最上面</b>的盘子 —— <b>O(1)</b>。
        想拿栈底的?先把上面的全拿走。这不是缺陷,是纪律。
      </>,
    );
  };

  const peek = () => {
    if (items.length === 0) {
      setMsg(<>空栈 peek:同样的边界 —— 动手前先问一句 isEmpty()。</>);
      return;
    }
    setPeeking(true);
    setMsg(
      <>
        peek() = <b>{items[items.length - 1].v}</b>:只看不拿,栈保持原样。
        很多算法(LC 20 / 739)每一步都靠它「探路」。
      </>,
    );
  };

  return (
    <div className="viz">
      <div className="viz-title">StackLab —— 亲手压一摞盘子</div>
      <div className="viz-stage">
        <div className="stk-well-wrap">
          <div className="stk-well">
            {items.length === 0 && <div className="stk-empty">空栈 ∅</div>}
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
          <div className="stk-base">栈底(封死,无人能动)</div>
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
          size {items.length} · 累计 push {pushes} · 累计 pop {pops}
        </span>
      </div>
    </div>
  );
}

/* ---------------- CallStackDemo ---------------- */

interface CSFrame {
  stack: { fn: string; note: string }[];
  msg: ReactNode;
  boom?: boolean;
}

const CS_FRAMES: CSFrame[] = [
  {
    stack: [{ fn: "main()", note: "局部变量 a · 书签:第 2 行" }],
    msg: (
      <>
        程序一启动,main 的<b>栈帧(stack frame)</b>率先入栈。
        帧里装着这个函数的局部变量和「执行到哪一行」的书签。
      </>
    ),
  },
  {
    stack: [
      { fn: "main()", note: "暂停,等 f 的结果" },
      { fn: "f(2)", note: "局部变量 x=2 · 返回地址 → main" },
    ],
    msg: (
      <>
        main 调用 <b>f(2)</b>:main 被暂停,书签留在原地;f 的新帧
        <b>压到最上面</b>。CPU 永远只执行栈顶那一帧。
      </>
    ),
  },
  {
    stack: [
      { fn: "main()", note: "暂停" },
      { fn: "f(2)", note: "暂停,等 g 的结果" },
      { fn: "g(3)", note: "局部变量 y=3 · 返回地址 → f" },
    ],
    msg: (
      <>
        f 内部又调用 <b>g(3)</b>:再压一帧。最后被调用的 g 必须<b>最先</b>执行完
        —— 函数调用天生就是 LIFO,这正是「调用栈 call stack」用栈的原因。
      </>
    ),
  },
  {
    stack: [
      { fn: "main()", note: "暂停" },
      { fn: "f(2)", note: "从断点继续,拿到 g 的返回值 4" },
    ],
    msg: (
      <>
        g 算出 4,<b>return</b>:g 的帧弹出销毁(它的局部变量随之蒸发),
        CPU 顺着帧里的返回地址回到 f 被打断的那一行。<b>每次 return = 一次 pop</b>。
      </>
    ),
  },
  {
    stack: [{ fn: "main()", note: "从断点继续,拿到 f 的返回值 8" }],
    msg: <>f 拿着 g 的结果算完,返回 8:f 弹出,回到 main。栈又只剩一帧。</>,
  },
  {
    stack: [],
    msg: (
      <>
        main 结束,栈清空,程序退出。第 7 章的<b>递归</b>
        ,本质就是函数反复把「自己」压进这个栈 —— 现在你已经提前看懂它了。
      </>
    ),
  },
  {
    stack: [
      { fn: "main()", note: "最底层" },
      { fn: "f(1)", note: "没有终止条件…" },
      { fn: "f(1)", note: "又调用了自己…" },
      { fn: "f(1)", note: "还在调用自己…" },
    ],
    boom: true,
    msg: (
      <>
        彩蛋:递归忘写终止条件,栈帧无限堆积 ——
        调用栈的地盘(通常只有 1~8 MB)几毫秒就被塞爆,程序崩溃。这就是
        <b>栈溢出 StackOverflow</b>,也是那个著名程序员问答网站名字的来历。
      </>
    ),
  },
];

export function CallStackDemo() {
  const s = useStepper(CS_FRAMES.length, 1600);
  const f = CS_FRAMES[s.step];

  return (
    <div className="viz">
      <div className="viz-title">CallStackDemo —— 函数调用栈逐帧</div>
      <div className="viz-stage">
        <div className="stk-cs">
          <div className="stk-cs-col">
            {f.boom && (
              <>
                <div className="stk-cframe boom">💥 StackOverflowError</div>
                <div className="stk-cframe ghosty">
                  <b>f(1)</b>
                  <span>…还有几万帧…</span>
                </div>
              </>
            )}
            {f.stack.length === 0 && !f.boom && (
              <div className="stk-empty" style={{ textAlign: "center" }}>
                (调用栈已空 —— 程序退出)
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
                <span>{fr.note}</span>
              </div>
            ))}
          </div>
          <div className="stk-cs-lab">调用栈 · 向上生长 · 栈顶正在执行</div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={CS_FRAMES.length} />
    </div>
  );
}
