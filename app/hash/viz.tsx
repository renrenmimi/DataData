"use client";

// 第 6 章 · 哈希表的两个专属可视化:
//  - HashLab:输入任意单词,看多项式哈希逐字符累积 → mod 桶数 → 小球落桶;
//    预置 "Aa" / "BB" 这对同哈希单词,亲眼制造一次冲突。
//  - CollisionLab:同一批会撞桶的单词,分别用「链地址法」和「线性探测」
//    逐帧插入,对照两种冲突解决策略(含探测的聚集现象)。

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";

const B = 8; // 桶数

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ================= HashLab ================= */

interface CharStep {
  ch: string;
  code: number;
  before: number;
  after: number;
}

function hashSteps(word: string): { steps: CharStep[]; h: number } {
  let h = 0;
  const steps: CharStep[] = [];
  for (const ch of word) {
    const code = ch.codePointAt(0)!;
    steps.push({ ch, code, before: h, after: h * 31 + code });
    h = h * 31 + code;
  }
  return { steps, h };
}

const PRESETS = ["cat", "dog", "Aa", "BB"];

export function HashLab() {
  const [word, setWord] = useState("cat");
  const [buckets, setBuckets] = useState<string[][]>(() =>
    Array.from({ length: B }, () => []),
  );
  const [chars, setChars] = useState<CharStep[]>([]);
  const [charIdx, setCharIdx] = useState(-1);
  const [accText, setAccText] = useState<ReactNode>(
    <>h 从 0 开始,每读一个字符:h = h × 31 + 字符编码</>,
  );
  const [hot, setHot] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<ReactNode>(
    <>
      输入一个单词(≤ 6 字符)点「投入哈希机」。试完 cat、dog,再试{" "}
      <b>Aa</b> 和 <b>BB</b> —— 有惊喜(坏的那种)。
    </>,
  );

  const run = async (raw?: string) => {
    const w = (raw ?? word).trim().slice(0, 6);
    if (!w || busy) return;
    if (raw) setWord(raw);
    setBusy(true);
    setHot(-1);
    const { steps, h } = hashSteps(w);
    setChars(steps);

    // 1) 逐字符累积
    for (let i = 0; i < steps.length; i++) {
      setCharIdx(i);
      const s = steps[i];
      setAccText(
        <>
          h = {s.before} × 31 + {s.code}
          <span className="dim">(&apos;{s.ch}&apos;)</span> ={" "}
          <b>{s.after}</b>
        </>,
      );
      setMsg(
        <>
          读入字符 &apos;{s.ch}&apos;(编码 {s.code}):旧 h 乘 31 再加上它 ——
          每个字符都被「织」进结果里,换一个字符、换一个位置,h 都会不同。
        </>,
      );
      await sleep(950);
    }
    setCharIdx(steps.length); // 全部 done

    // 2) mod 桶数
    const t = h % B;
    setAccText(
      <>
        h = {h} → {h} mod {B} = <b>{t}</b>
      </>,
    );
    setMsg(
      <>
        哈希值 {h} 太大,当不了下标 —— 对桶数取模:{h} mod {B} ={" "}
        <b>{t}</b>。无论 h 多大,都被压回 0 ~ {B - 1}。
      </>,
    );
    await sleep(1200);

    // 3) 落桶
    const collided = buckets[t].length > 0;
    setHot(t);
    setBuckets((prev) => {
      const nb = prev.map((b) => [...b]);
      nb[t].push(w);
      return nb;
    });
    setMsg(
      collided ? (
        <>
          💥 <b>冲突(collision)!</b>「{w}」和「{buckets[t].join("、")}
          」被分进了同一个 {t} 号桶 —— 不同的 key、相同的桶位。
          怎么办?这正是 §03 的主题。
        </>
      ) : (
        <>
          「{w}」落进 <b>{t} 号桶</b>。下次查它:同样的哈希、同样的取模,
          一步直达 {t} 号桶 —— 这就是 O(1) 的全部秘密。
        </>
      ),
    );
    await sleep(600);
    setBusy(false);
  };

  const reset = () => {
    if (busy) return;
    setBuckets(Array.from({ length: B }, () => []));
    setChars([]);
    setCharIdx(-1);
    setHot(-1);
    setAccText(<>h 从 0 开始,每读一个字符:h = h × 31 + 字符编码</>);
    setMsg(<>桶已清空。再来一轮 —— 记得试试 Aa 和 BB。</>);
  };

  return (
    <div className="viz">
      <div className="viz-title">哈希机实验室 —— 任何单词,三步变下标</div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 8 }}>
        <div className="hs-pipeline">
          <div className="hs-run">
            {chars.length === 0 ? (
              <span className="dim" style={{ fontSize: 13 }}>
                待投入…
              </span>
            ) : (
              chars.map((s, i) => (
                <span
                  key={i}
                  className={`hs-char${
                    charIdx === i ? " lit" : charIdx > i ? " done" : ""
                  }`}
                >
                  {s.ch}
                  <span className="hs-code">{s.code}</span>
                </span>
              ))
            )}
          </div>
          <div className="hs-acc">{accText}</div>
          <div className="hs-buckets">
            {buckets.map((b, i) => (
              <div key={i} className={`hs-bucket${hot === i ? " hot" : ""}`}>
                <span className="hs-bucket-idx">[{i}]</span>
                {b.map((w, j) => (
                  <span
                    key={j}
                    className={`hs-item${b.length > 1 ? " clash" : ""}`}
                  >
                    {w}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {msg}
      </div>
      <div className="viz-ctl">
        <input
          className="hs-input"
          value={word}
          maxLength={6}
          disabled={busy}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") run();
          }}
          aria-label="要哈希的单词"
        />
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => run()}
          disabled={busy || !word.trim()}
        >
          投入哈希机
        </button>
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => run(p)}
            disabled={busy}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-sm"
          onClick={reset}
          disabled={busy}
          style={{ marginLeft: "auto" }}
        >
          清空桶
        </button>
      </div>
    </div>
  );
}

/* ================= CollisionLab ================= */

// 六个单词的「hash % 8」桶位(用 §02 的 31 进制哈希算出):
// cat→6  dog→4  Aa→0  BB→0(撞 Aa) owl→4(撞 dog) emu→5
const KEYS: { w: string; b: number }[] = [
  { w: "cat", b: 6 },
  { w: "dog", b: 4 },
  { w: "Aa", b: 0 },
  { w: "BB", b: 0 },
  { w: "owl", b: 4 },
  { w: "emu", b: 5 },
];

interface ChainFrame {
  chains: string[][];
  hot: number;
  msg: ReactNode;
}

function buildChainFrames(): ChainFrame[] {
  const frames: ChainFrame[] = [];
  const chains: string[][] = Array.from({ length: B }, () => []);
  frames.push({
    chains: chains.map((c) => [...c]),
    hot: -1,
    msg: (
      <>
        6 个单词依次插入 8 个桶。<b>链地址法</b>:每个桶不再只放一个元素,
        而是挂一条链表 —— 撞了就往链上接。
      </>
    ),
  });
  for (const { w, b } of KEYS) {
    const clash = chains[b].length > 0;
    chains[b].push(w);
    frames.push({
      chains: chains.map((c) => [...c]),
      hot: b,
      msg: clash ? (
        <>
          「{w}」也被哈希到 <b>{b} 号桶</b> —— 发生冲突。处理方式:接到该桶链表的尾部。
          代价:以后查这个桶里的 key,要沿链逐个 equals 比对。
        </>
      ) : (
        <>
          「{w}」哈希到 <b>{b} 号桶</b>,桶是空的,直接入住。
        </>
      ),
    });
  }
  frames.push({
    chains: chains.map((c) => [...c]),
    hot: -1,
    msg: (
      <>
        插入完毕:最长的链也只有 2 个节点,查任何 key 最多比对 2 次 ——
        只要哈希均匀 + 负载因子受控,链长的<b>平均值就是常数</b>,这就是
        「平均 O(1)」的底气。
      </>
    ),
  });
  return frames;
}

interface ProbeFrame {
  slots: (string | null)[];
  scan: number[]; // 探测路过(被占)的格子
  placed: number; // 本帧最终放置位
  msg: ReactNode;
}

function buildProbeFrames(): ProbeFrame[] {
  const frames: ProbeFrame[] = [];
  const slots: (string | null)[] = Array.from({ length: B }, () => null);
  frames.push({
    slots: [...slots],
    scan: [],
    placed: -1,
    msg: (
      <>
        同一批单词,这次用<b>开放寻址 · 线性探测</b>:每个桶只放一个元素,
        撞了就往右找下一个空位(到头绕回 0)。
      </>
    ),
  });
  for (const { w, b } of KEYS) {
    const scan: number[] = [];
    let i = b;
    while (slots[i] !== null) {
      scan.push(i);
      i = (i + 1) % B;
    }
    slots[i] = w;
    frames.push({
      slots: [...slots],
      scan,
      placed: i,
      msg:
        scan.length === 0 ? (
          <>
            「{w}」的家 <b>{b} 号</b>是空的,直接入住。
          </>
        ) : (
          <>
            「{w}」的家 {b} 号被占!线性探测:
            {scan.map((s) => `${s} 号有人`).join(" → ")} → 住进{" "}
            <b>{i} 号</b>。查找时也要走同一条探测路线。
          </>
        ),
    });
  }
  frames.push({
    slots: [...slots],
    scan: [],
    placed: -1,
    msg: (
      <>
        注意 4~7 号连成了一片「拥挤区」—— 一次冲突会让后来者跟着挪窝,
        越挤越长,这叫<b>聚集(clustering)</b>。所以开放寻址对负载因子更敏感,
        通常压在 0.5~0.7 就要扩容。
      </>
    ),
  });
  return frames;
}

const CHAIN_FRAMES = buildChainFrames();
const PROBE_FRAMES = buildProbeFrames();

function ChainPlayer() {
  const s = useStepper(CHAIN_FRAMES.length);
  const f = CHAIN_FRAMES[s.step];
  return (
    <>
      <div className="viz-stage" style={{ flexDirection: "column" }}>
        <div className="hs-chains">
          {f.chains.map((chain, i) => (
            <div
              key={i}
              className={`hs-chainrow${f.hot === i ? " hot" : ""}`}
            >
              <span className="hs-chainhead">[{i}]</span>
              {chain.map((w, j) => (
                <span
                  key={j}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  {j > 0 && (
                    <span className="hs-arrow" aria-hidden>
                      →
                    </span>
                  )}
                  <span className={`hs-item${chain.length > 1 ? " clash" : ""}`}>
                    {w}
                  </span>
                </span>
              ))}
              {chain.length === 0 && (
                <span className="hs-arrow" aria-hidden>
                  ∅
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={CHAIN_FRAMES.length} />
    </>
  );
}

function ProbePlayer() {
  const s = useStepper(PROBE_FRAMES.length);
  const f = PROBE_FRAMES[s.step];
  return (
    <>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 4, paddingBottom: 28, flexWrap: "wrap" }}>
          {f.slots.map((w, i) => {
            const scanning = f.scan.includes(i);
            const placed = f.placed === i;
            return (
              <div
                key={i}
                className={`cell${placed ? " lit" : scanning ? " bad" : w ? "" : " ghost"}`}
                style={{ fontSize: 12 }}
              >
                {w ?? "·"}
                <span className="cell-idx">{i}</span>
              </div>
            );
          })}
        </div>
        {f.scan.length > 0 && (
          <span className="hs-probe-scan">
            探测路径:{[...f.scan, f.placed].join(" → ")}(红 = 被占,亮 = 入住)
          </span>
        )}
      </div>
      <div className="viz-msg" aria-live="polite">
        {f.msg}
      </div>
      <StepControls stepper={s} step={s.step} total={PROBE_FRAMES.length} />
    </>
  );
}

export function CollisionLab() {
  const [mode, setMode] = useState<"chain" | "probe">("chain");
  return (
    <div className="viz">
      <div className="viz-title">
        冲突解决实验室 —— 同一批单词,两种活法
        <span className="seg" style={{ marginLeft: "auto" }}>
          <button
            type="button"
            className={`seg-btn${mode === "chain" ? " on" : ""}`}
            onClick={() => setMode("chain")}
          >
            链地址法
          </button>
          <button
            type="button"
            className={`seg-btn${mode === "probe" ? " on" : ""}`}
            onClick={() => setMode("probe")}
          >
            线性探测
          </button>
        </span>
      </div>
      {mode === "chain" ? <ChainPlayer key="c" /> : <ProbePlayer key="p" />}
    </div>
  );
}
