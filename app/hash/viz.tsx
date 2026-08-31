"use client";

// Chapter 6 · The two visualizations specific to hash tables:
//  - HashLab: type any word and watch the polynomial hash build up character by character →
//    mod the bucket count → the ball drops into its bucket; the presets "Aa" / "BB" hash to the
//    same value, so a collision can be produced first-hand.
//  - CollisionLab: the same batch of colliding words is inserted frame by frame, once with
//    separate chaining and once with linear probing, to compare the two collision-resolution
//    strategies (probing also shows clustering).
//
// Bilingual: every title, narration, button and figure label switches through <T> / useL().

import { useState, type ReactNode } from "react";
import { useStepper, StepControls } from "@/lib/stepper";
import { useL, T } from "@/lib/i18n";

const B = 8; // Number of buckets

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

const START_ACC = (
  <T
    en={<>h starts at 0. For each character: h = h × 31 + character code</>}
    zh={<>h 从 0 开始,每读一个字符:h = h × 31 + 字符编码</>}
  />
);

export function HashLab() {
  const L = useL();
  const [word, setWord] = useState("cat");
  const [buckets, setBuckets] = useState<string[][]>(() =>
    Array.from({ length: B }, () => []),
  );
  const [chars, setChars] = useState<CharStep[]>([]);
  const [charIdx, setCharIdx] = useState(-1);
  const [accText, setAccText] = useState<ReactNode>(START_ACC);
  const [hot, setHot] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<ReactNode>(
    <T
      en={
        <>
          Type a word of at most 6 characters and press Hash it. Try cat and
          dog, then try <b>Aa</b> and <b>BB</b> — those two are chosen to land
          in the same bucket.
        </>
      }
      zh={
        <>
          输入一个单词(≤ 6 字符)点「投入哈希机」。先试 cat、dog,再试{" "}
          <b>Aa</b> 和 <b>BB</b> —— 这两个词是特意挑的,会落进同一个桶。
        </>
      }
    />,
  );

  const run = async (raw?: string) => {
    const w = (raw ?? word).trim().slice(0, 6);
    if (!w || busy) return;
    if (raw) setWord(raw);
    setBusy(true);
    setHot(-1);
    const { steps, h } = hashSteps(w);
    setChars(steps);

    // 1) accumulate character by character
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
        <T
          en={
            <>
              Read the character &apos;{s.ch}&apos; (code {s.code}). The old h is
              multiplied by 31, then this code is added. Every character changes
              the result, and so does its position, because an earlier character
              gets multiplied by 31 more times.
            </>
          }
          zh={
            <>
              读入字符 &apos;{s.ch}&apos;(编码 {s.code}):旧 h 乘 31,再加上它。
              每个字符都会改变结果,位置也会 —— 越靠前的字符被乘 31 的次数越多。
            </>
          }
        />,
      );
      await sleep(950);
    }
    setCharIdx(steps.length); // Everything is done

    // 2) take it modulo the bucket count
    const t = h % B;
    setAccText(
      <>
        h = {h} → {h} mod {B} = <b>{t}</b>
      </>,
    );
    setMsg(
      <T
        en={
          <>
            The hash {h} is far too large to be an array index, so it is taken
            modulo the bucket count: {h} mod {B} = <b>{t}</b>. However large h
            gets, the result is pushed back into 0 to {B - 1}.
          </>
        }
        zh={
          <>
            哈希值 {h} 太大,当不了数组下标 —— 对桶数取模:{h} mod {B} ={" "}
            <b>{t}</b>。无论 h 多大,结果都被压回 0 ~ {B - 1}。
          </>
        }
      />,
    );
    await sleep(1200);

    // 3) drop into the bucket
    const occupants = buckets[t];
    const collided = occupants.length > 0;
    setHot(t);
    setBuckets((prev) => {
      const nb = prev.map((b) => [...b]);
      nb[t].push(w);
      return nb;
    });
    setMsg(
      collided ? (
        <T
          en={
            <>
              💥 <b>Collision.</b> &quot;{w}&quot; and &quot;
              {occupants.join(", ")}&quot; were sent to the same bucket {t}:
              different keys, same index. What the table does next is the subject
              of §03.
            </>
          }
          zh={
            <>
              💥 <b>冲突(collision)!</b>「{w}」和「{occupants.join("、")}
              」被分进了同一个 {t} 号桶 —— 不同的 key、相同的下标。
              接下来怎么办,就是 §03 的主题。
            </>
          }
        />
      ) : (
        <T
          en={
            <>
              &quot;{w}&quot; goes into <b>bucket {t}</b>. To look it up later,
              the table computes the same hash and the same modulo and jumps
              straight to bucket {t}. No scanning, and that is the whole reason
              lookup is fast.
            </>
          }
          zh={
            <>
              「{w}」落进 <b>{t} 号桶</b>。以后查它:算出同样的哈希、同样的取模,
              一步跳到 {t} 号桶,不需要逐个扫描 —— 这就是查得快的全部原因。
            </>
          }
        />
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
    setAccText(START_ACC);
    setMsg(
      <T
        en={<>The buckets are empty again. Try Aa and BB next.</>}
        zh={<>桶已清空。下一轮试试 Aa 和 BB。</>}
      />,
    );
  };

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Hash lab — any word becomes an index in three steps"
          zh="哈希机实验室 —— 任何单词,三步变下标"
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 8 }}>
        <div className="hs-pipeline">
          <div className="hs-run">
            {chars.length === 0 ? (
              <span className="dim" style={{ fontSize: 13 }}>
                <T en="waiting for a word…" zh="待投入…" />
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
          aria-label={L({ en: "Word to hash", zh: "要哈希的单词" })}
        />
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => run()}
          disabled={busy || !word.trim()}
        >
          <T en="Hash it" zh="投入哈希机" />
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
          <T en="Clear buckets" zh="清空桶" />
        </button>
      </div>
    </div>
  );
}

/* ================= CollisionLab ================= */

// The "hash % 8" bucket of each of the six words (computed with the base-31 hash from §02):
// cat→6  dog→4  Aa→0  BB→0 (hits Aa) owl→4 (hits dog) emu→5
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
      <T
        en={
          <>
            Six words are inserted into eight buckets, one at a time. With{" "}
            <b>separate chaining</b>, a bucket does not hold a single entry. It
            holds a list, and a colliding entry is appended to that list.
          </>
        }
        zh={
          <>
            6 个单词依次插入 8 个桶。<b>链地址法</b>:每个桶不是只放一个元素,
            而是挂一条链表 —— 撞了就接到链上。
          </>
        }
      />
    ),
  });
  for (const { w, b } of KEYS) {
    const clash = chains[b].length > 0;
    chains[b].push(w);
    frames.push({
      chains: chains.map((c) => [...c]),
      hot: b,
      msg: clash ? (
        <T
          en={
            <>
              &quot;{w}&quot; also hashes to <b>bucket {b}</b>, so this is a
              collision. It is appended to the end of that bucket&apos;s list.
              The cost: from now on, a lookup in this bucket has to compare the
              keys in the list one by one.
            </>
          }
          zh={
            <>
              「{w}」也被哈希到 <b>{b} 号桶</b> —— 冲突发生。处理方式:
              接到该桶链表的尾部。代价:以后查这个桶里的 key,
              要沿链逐个比对。
            </>
          }
        />
      ) : (
        <T
          en={
            <>
              &quot;{w}&quot; hashes to <b>bucket {b}</b>. The bucket is empty,
              so it goes straight in.
            </>
          }
          zh={
            <>
              「{w}」哈希到 <b>{b} 号桶</b>,桶是空的,直接入住。
            </>
          }
        />
      ),
    });
  }
  frames.push({
    chains: chains.map((c) => [...c]),
    hot: -1,
    msg: (
      <T
        en={
          <>
            All six are in. The longest list holds 2 entries, so any lookup
            compares at most 2 keys. As long as the hash spreads the keys and the
            load factor stays bounded, the <b>average</b> list length is a
            constant. That is what &quot;O(1) on average&quot; rests on — and
            also why it is only an average: put all six words in one bucket and
            the same lookup compares 6 keys.
          </>
        }
        zh={
          <>
            插入完毕:最长的链只有 2 个节点,查任何 key 最多比对 2 次。
            只要哈希分布均匀、负载因子受控,链长的<b>平均值就是常数</b> ——
            这正是「平均 O(1)」的依据,也说明了它为什么只是平均值:
            把这 6 个词全塞进同一个桶,同样一次查找就要比对 6 次。
          </>
        }
      />
    ),
  });
  return frames;
}

interface ProbeFrame {
  slots: (string | null)[];
  scan: number[]; // Cells the probe passed over (already taken)
  placed: number; // Where this frame finally puts it
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
      <T
        en={
          <>
            The same six words, this time with <b>open addressing and linear
            probing</b>: every slot holds at most one entry, and a colliding
            entry moves right until it finds a free slot, wrapping back to 0 at
            the end.
          </>
        }
        zh={
          <>
            同一批单词,这次用<b>开放寻址 · 线性探测</b>:每个格子只放一个元素,
            撞了就往右找下一个空位,到头绕回 0。
          </>
        }
      />
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
          <T
            en={
              <>
                &quot;{w}&quot; hashes to <b>slot {b}</b>, which is free, so it
                goes straight in.
              </>
            }
            zh={
              <>
                「{w}」的家 <b>{b} 号</b>是空的,直接入住。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                &quot;{w}&quot; hashes to slot {b}, which is taken. Linear
                probing moves right:{" "}
                {scan.map((s) => `${s} is taken`).join(" → ")} → it settles in{" "}
                <b>slot {i}</b>. A later lookup for &quot;{w}&quot; has to walk
                the same probe path.
              </>
            }
            zh={
              <>
                「{w}」的家 {b} 号被占了。线性探测往右走:
                {scan.map((s) => `${s} 号有人`).join(" → ")} → 住进{" "}
                <b>{i} 号</b>。以后查「{w}」也要走同一条探测路线。
              </>
            }
          />
        ),
    });
  }
  frames.push({
    slots: [...slots],
    scan: [],
    placed: -1,
    msg: (
      <T
        en={
          <>
            Slots 4 to 7 are now a solid run, and it continues through the wrap
            into 0 and 1. One collision pushes an entry sideways, which makes the
            next collision more likely, which makes the run longer. This is
            called <b>clustering</b>. It is why open addressing is more sensitive
            to the load factor than chaining, and why such tables usually grow at
            around 0.5 to 0.7 rather than 0.75.
          </>
        }
        zh={
          <>
            4~7 号已经连成一片,而且绕过末尾一直接到 0、1 号。
            一次冲突把元素挤到旁边,让下一次冲突更容易发生,连片就越来越长 ——
            这叫<b>聚集(clustering)</b>。所以开放寻址比链地址法更怕负载因子,
            通常压到 0.5~0.7 就要扩容,而不是 0.75。
          </>
        }
      />
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
            <T
              en={
                <>
                  Probe path: {[...f.scan, f.placed].join(" → ")} (red = taken,
                  highlighted = where it settled)
                </>
              }
              zh={
                <>
                  探测路径:{[...f.scan, f.placed].join(" → ")}(红 = 被占,亮 =
                  入住)
                </>
              }
            />
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
        <T
          en="Collision lab — the same six words, two strategies"
          zh="冲突解决实验室 —— 同一批单词,两种活法"
        />
        <span className="seg" style={{ marginLeft: "auto" }}>
          <button
            type="button"
            className={`seg-btn${mode === "chain" ? " on" : ""}`}
            onClick={() => setMode("chain")}
          >
            <T en="Chaining" zh="链地址法" />
          </button>
          <button
            type="button"
            className={`seg-btn${mode === "probe" ? " on" : ""}`}
            onClick={() => setMode("probe")}
          >
            <T en="Linear probing" zh="线性探测" />
          </button>
        </span>
      </div>
      {mode === "chain" ? <ChainPlayer key="c" /> : <ProbePlayer key="p" />}
    </div>
  );
}
