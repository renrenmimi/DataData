"use client";

// Chapter 2 · the two visualizations that belong to the string chapter (bilingual):
//  - EncodeLab: type any string and see the Unicode code point and UTF-8 bytes of each
//    character (walked code point by code point with codePointAt, so emoji surrogate
//    pairs in UTF-16 are handled correctly).
//  - ConcatLab: two ways of building the same string race each other — rebuilding the
//    whole string on every += vs. appending into a mutable container — with a running
//    count of copied characters that makes the gap between O(n²) and O(n) visible.

import { useEffect, useMemo, useState } from "react";
import { useL, T } from "@/lib/i18n";

/* ================= EncodeLab ================= */

/** Hand-written UTF-8 encoding: 1/2/3/4 bytes depending on the code point
 *  — matches the standard, for teaching purposes only */
function utf8Bytes(cp: number): number[] {
  if (cp <= 0x7f) return [cp]; // The ASCII range: one byte, high bit 0
  if (cp <= 0x7ff)
    return [0xc0 | (cp >> 6), 0x80 | (cp & 0x3f)]; // 110xxxxx 10xxxxxx
  if (cp <= 0xffff)
    return [
      0xe0 | (cp >> 12), // 1110xxxx
      0x80 | ((cp >> 6) & 0x3f), // 10xxxxxx
      0x80 | (cp & 0x3f), // 10xxxxxx
    ];
  return [
    0xf0 | (cp >> 18), // 11110xxx
    0x80 | ((cp >> 12) & 0x3f),
    0x80 | ((cp >> 6) & 0x3f),
    0x80 | (cp & 0x3f),
  ];
}

const hex = (n: number, w: number) =>
  n.toString(16).toUpperCase().padStart(w, "0");

interface EncRow {
  ch: string;
  cp: number;
  bytes: number[];
  /** How many UTF-16 code units this code point occupies (1 or 2; 2 = surrogate pair) */
  units: number;
}

/** Split by code point using codePointAt — an emoji is a surrogate pair, so skip 2 indices at once */
function analyze(input: string): EncRow[] {
  const rows: EncRow[] = [];
  let i = 0;
  while (i < input.length && rows.length < 10) {
    const cp = input.codePointAt(i)!;
    const units = cp > 0xffff ? 2 : 1; // Beyond the BMP → a surrogate pair, two UTF-16 units
    rows.push({
      ch: String.fromCodePoint(cp),
      cp,
      bytes: utf8Bytes(cp),
      units,
    });
    i += units; // The point: advance by code point, never a naive i++
  }
  return rows;
}

export function EncodeLab() {
  const L = useL();
  const [text, setText] = useState("A字🙂");
  const rows = useMemo(() => analyze(text), [text]);
  const totalBytes = rows.reduce((s, r) => s + r.bytes.length, 0);
  const totalUnits = rows.reduce((s, r) => s + r.units, 0);

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en="Encoding lab: type a character and see the numbers behind it"
          zh="编码实验室 —— 输入任何字符,看它的数字身份"
        />
      </div>
      <div style={{ marginBottom: 14 }}>
        <input
          className="str-enc-input"
          value={text}
          maxLength={24}
          onChange={(e) => setText(e.target.value)}
          placeholder={L({
            en: "Type letters, Chinese characters, or emoji…",
            zh: "输入字母 / 汉字 / emoji…",
          })}
          aria-label={L({
            en: "Text to encode",
            zh: "待编码的字符串",
          })}
        />
      </div>
      {rows.length === 0 ? (
        <div className="viz-msg">
          <T
            en="Type something. A mixed input such as “A字🙂” shows the most."
            zh="输入点什么 —— 试试「A字🙂」这种混搭。"
          />
        </div>
      ) : (
        <>
          <div className="str-enc-list">
            {rows.map((r, i) => (
              <div className="str-enc-row" key={i}>
                <span className="str-enc-ch">{r.ch}</span>
                <span className="str-enc-cp">
                  U+{hex(r.cp, 4)}
                  <br />
                  <span style={{ color: "var(--text-3)", fontWeight: 400 }}>
                    <T en={<>decimal {r.cp}</>} zh={<>十进制 {r.cp}</>} />
                  </span>
                </span>
                <span className="str-enc-bytes">
                  {r.bytes.map((b, j) => (
                    <span
                      className="str-byte"
                      data-kind={r.bytes.length === 1 ? "ascii" : undefined}
                      key={j}
                    >
                      {hex(b, 2)}
                    </span>
                  ))}
                </span>
                <span className="str-enc-meta">
                  <T
                    en={
                      <>
                        UTF-8: {r.bytes.length} byte
                        {r.bytes.length === 1 ? "" : "s"}
                        <br />
                        UTF-16: {r.units} unit{r.units === 1 ? "" : "s"}
                        {r.units === 2 ? " (surrogate pair)" : ""}
                      </>
                    }
                    zh={
                      <>
                        UTF-8:{r.bytes.length} 字节
                        <br />
                        UTF-16:{r.units} 单元
                        {r.units === 2 ? "(代理对)" : ""}
                      </>
                    }
                  />
                </span>
              </div>
            ))}
          </div>
          <div className="str-enc-total">
            <span>
              <T
                en={
                  <>
                    <b>{rows.length}</b> code points
                  </>
                }
                zh={
                  <>
                    码点 <b>{rows.length}</b> 个
                  </>
                }
              />
            </span>
            <span>
              <T
                en={
                  <>
                    JavaScript <b>.length = {totalUnits}</b> (UTF-16 code units)
                  </>
                }
                zh={
                  <>
                    JavaScript 的 <b>.length = {totalUnits}</b>(数的是 UTF-16
                    编码单元)
                  </>
                }
              />
            </span>
            <span>
              <T
                en={
                  <>
                    <b>{totalBytes}</b> bytes stored as UTF-8
                  </>
                }
                zh={
                  <>
                    UTF-8 存储 <b>{totalBytes}</b> 字节
                  </>
                }
              />
            </span>
          </div>
        </>
      )}
      <div className="viz-msg" style={{ marginTop: 12 }}>
        {rows.some((r) => r.units === 2) ? (
          <T
            en={
              <>
                Look at the row marked as a surrogate pair. Its code point is
                above U+FFFF, so UTF-16 needs <b>two code units</b> for it. That
                is why JavaScript counts it as <b>2</b> in <code>.length</code>,
                and why <code>charAt</code> returns only half of it. Java behaves
                the same way. This is the trap in §05.
              </>
            }
            zh={
              <>
                看标着「代理对」的那一行:它的码点超过了 U+FFFF,UTF-16 需要
                <b>两个编码单元</b>才能表示它。所以 JavaScript 的{" "}
                <code>.length</code> 把它数成 <b>2</b>,<code>charAt</code>{" "}
                也只能取到它的一半。Java 的行为完全相同 —— 这就是 §05 的那个坑。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                One character, three identities: the shape you see, the number
                Unicode assigned to it (the code point), and the bytes stored on
                disk. Try typing an emoji and watch what changes.
              </>
            }
            zh={
              <>
                同一个字符,三个身份:你看到的字形、Unicode 给它的编号(码点)、
                以及硬盘里存下的字节。试试输入一个 emoji,看看会发生什么。
              </>
            }
          />
        )}
      </div>
    </div>
  );
}

/* ================= ConcatLab ================= */

const N = 60; // 60 characters appended in total

/** Precompute how many characters each strategy has copied in total after step k */
function precompute() {
  const naive: number[] = [0];
  const builder: number[] = [0];
  let cap = 8; // The mutable buffer starts with capacity 8
  let len = 0;
  let nSum = 0;
  let bSum = 0;
  for (let k = 1; k <= N; k++) {
    // Naive +=: the new string has length k, so recopy all k-1 old characters and write 1 new one
    nSum += k;
    naive.push(nSum);
    // Mutable buffer: write 1 character; only when full, double the capacity
    // and relocate (copying len characters)
    if (len === cap) {
      bSum += len;
      cap *= 2;
    }
    bSum += 1;
    len += 1;
    builder.push(bSum);
  }
  return { naive, builder };
}

export function ConcatLab() {
  const { naive, builder } = useMemo(precompute, []);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    // Keep the updater pure: it only advances progress; stopping playback is the effect below
    const id = setInterval(() => {
      setStep((s) => (s >= N ? s : s + 1));
    }, 90);
    return () => clearInterval(id);
  }, [playing]);

  // Stop automatically once the run reaches the end
  useEffect(() => {
    if (playing && step >= N) setPlaying(false);
  }, [playing, step]);

  const max = naive[N]; // Scale everything against the naive total
  const nv = naive[step];
  const bv = builder[step];
  const done = step >= N;

  return (
    <div className="viz">
      <div className="viz-title">
        <T
          en={<>Concatenation race: append {N} characters, who copies less?</>}
          zh={<>拼接赛跑 —— 追加 {N} 个字符,谁拷贝得少?</>}
        />
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 8 }}>
        <div className="str-race">
          <div className="str-race-row">
            <span className="str-race-label">
              <T en="s += c (rebuild each time)" zh="每次 s += c(重建)" />
            </span>
            <div className="str-race-track">
              <div
                className="str-race-bar"
                data-kind="naive"
                style={{ width: `${(nv / max) * 100}%` }}
              />
            </div>
            <span className="str-race-num">
              <T
                en={<>{nv} chars copied</>}
                zh={<>已拷贝 {nv} 字符</>}
              />
            </span>
          </div>
          <div className="str-race-row">
            <span className="str-race-label">
              <T
                en="Append to a mutable buffer"
                zh="往可变缓冲区追加"
              />
            </span>
            <div className="str-race-track">
              <div
                className="str-race-bar"
                data-kind="builder"
                style={{ width: `${(bv / max) * 100}%` }}
              />
            </div>
            <span className="str-race-num">
              <T
                en={<>{bv} chars copied</>}
                zh={<>已拷贝 {bv} 字符</>}
              />
            </span>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {step === 0 ? (
          <T
            en={
              <>
                Both runners do the same job: append {N} characters to a string.
                The number of appends is identical. What differs is{" "}
                <b>how many characters get copied in total</b>.
              </>
            }
            zh={
              <>
                两位选手做同一件事:往字符串尾部追加 {N} 个字符。
                追加次数完全一样,比的是<b>背后总共拷贝了多少字符</b>。
              </>
            }
          />
        ) : done ? (
          <T
            en={
              <>
                Finish line: <code>+=</code> copied <b>{nv}</b> characters
                (about n²/2), while the mutable buffer copied <b>{bv}</b> (about
                2n, including the resizing). That is a factor of{" "}
                <b>{Math.round(nv / bv)}</b>. Make n ten times larger and the gap
                becomes a hundred times: this is the difference between O(n²) and
                O(n).
              </>
            }
            zh={
              <>
                终点:<code>+=</code> 拷贝了 <b>{nv}</b> 个字符(≈ n²/2),
                可变缓冲区只拷贝了 <b>{bv}</b> 个(≈ 2n,含扩容搬家)——
                相差 <b>{Math.round(nv / bv)}</b> 倍。n 再大十倍,差距就是百倍:
                这就是 O(n²) 与 O(n) 的区别。
              </>
            }
          />
        ) : (
          <T
            en={
              <>
                Append {step}: <code>+=</code> allocates a new string of length{" "}
                {step} and copies every old character into it (<b>{step}</b>{" "}
                copies this step). The mutable buffer writes 1 character into a
                free slot
                {builder[step] - builder[step - 1] > 1
                  ? ", and this step happens to fill the buffer, so it also grows once"
                  : ""}
                .
              </>
            }
            zh={
              <>
                第 {step} 次追加:<code>+=</code> 要新建长度 {step}{" "}
                的串并重抄全部旧字符(本次拷贝 <b>{step}</b> 个);
                可变缓冲区只往数组空位写 1 个
                {builder[step] - builder[step - 1] > 1
                  ? ",这一步刚好装满,顺带扩容搬家一次"
                  : ""}
                。
              </>
            }
          />
        )}
      </div>
      <div className="viz-ctl">
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => {
            if (done) setStep(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? (
            <T en="⏸ Pause" zh="⏸ 暂停" />
          ) : done ? (
            <T en="↻ Race again" zh="↻ 重赛" />
          ) : (
            <T en="▶ Start" zh="▶ 开跑" />
          )}
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => {
            setPlaying(false);
            setStep(0);
          }}
        >
          <T en="Reset" zh="重置" />
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          <T en={<>Step {step} / {N}</>} zh={<>进度 {step} / {N}</>} />
          {step > 0 && <> · {(nv / Math.max(bv, 1)).toFixed(1)}×</>}
        </span>
      </div>
    </div>
  );
}
