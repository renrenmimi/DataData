"use client";

// 第 2 章 · 字符串的两个专属可视化:
//  - EncodeLab:输入任意字符串,逐字符展示 Unicode 码点与 UTF-8 字节
//    (用 codePointAt 逐码点遍历,正确处理 emoji 的 UTF-16 代理对)。
//  - ConcatLab:同一任务两种拼法赛跑 ——「每次 += 全量重建」vs
//    「StringBuilder 追加」,实时累计拷贝的字符数,亲眼看 O(n²) 和 O(n) 拉开差距。

import { useEffect, useMemo, useState } from "react";

/* ================= EncodeLab ================= */

/** 手写 UTF-8 编码:按码点大小分 1/2/3/4 字节 —— 和标准一致,纯教学用 */
function utf8Bytes(cp: number): number[] {
  if (cp <= 0x7f) return [cp]; // ASCII 区:1 字节,最高位 0
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
  /** 这个码点在 UTF-16 里占几个编码单元(1 或 2,2 = 代理对) */
  units: number;
}

/** 用 codePointAt 逐「码点」切分 —— emoji 是代理对,要一次跨过 2 个下标 */
function analyze(input: string): EncRow[] {
  const rows: EncRow[] = [];
  let i = 0;
  while (i < input.length && rows.length < 10) {
    const cp = input.codePointAt(i)!;
    const units = cp > 0xffff ? 2 : 1; // 超出 BMP → 代理对,占 2 个 UTF-16 单元
    rows.push({
      ch: String.fromCodePoint(cp),
      cp,
      bytes: utf8Bytes(cp),
      units,
    });
    i += units; // 关键:按码点前进,不能傻傻地 i++
  }
  return rows;
}

export function EncodeLab() {
  const [text, setText] = useState("A字🙂");
  const rows = useMemo(() => analyze(text), [text]);
  const totalBytes = rows.reduce((s, r) => s + r.bytes.length, 0);
  const totalUnits = rows.reduce((s, r) => s + r.units, 0);

  return (
    <div className="viz">
      <div className="viz-title">编码实验室 —— 输入任何字符,看它的数字身份</div>
      <div style={{ marginBottom: 14 }}>
        <input
          className="str-enc-input"
          value={text}
          maxLength={24}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入字母 / 汉字 / emoji…"
          aria-label="待编码的字符串"
        />
      </div>
      {rows.length === 0 ? (
        <div className="viz-msg">输入点什么 —— 试试「A字🙂」这种混搭。</div>
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
                    十进制 {r.cp}
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
                  UTF-8:{r.bytes.length} 字节
                  <br />
                  UTF-16:{r.units} 单元{r.units === 2 ? "(代理对)" : ""}
                </span>
              </div>
            ))}
          </div>
          <div className="str-enc-total">
            <span>
              人眼字符(码点)<b>{rows.length}</b> 个
            </span>
            <span>
              JS 的 <b>.length = {totalUnits}</b>(数的是 UTF-16 单元)
            </span>
            <span>
              UTF-8 存储 <b>{totalBytes}</b> 字节
            </span>
          </div>
        </>
      )}
      <div className="viz-msg" style={{ marginTop: 12 }}>
        {rows.some((r) => r.units === 2) ? (
          <>
            注意最后一行:这个字符的码点超过了 U+FFFF,UTF-16 里要用
            <b>一对代理对</b>表示 —— 所以 JS 的 length 会把它数成 <b>2</b>,
            <b>charAt 还会把它劈成两半乱码</b>。这就是 §05 的 emoji 大坑。
          </>
        ) : (
          <>
            同一个字符,三个身份:人眼看到的「字」、Unicode 发的「号」(码点)、
            硬盘里存的「字节」。试试输入一个 emoji,看看会发生什么。
          </>
        )}
      </div>
    </div>
  );
}

/* ================= ConcatLab ================= */

const N = 60; // 总共追加 60 个字符

/** 预计算两种策略在第 k 步之后的累计拷贝字符数 */
function precompute() {
  const naive: number[] = [0];
  const builder: number[] = [0];
  let cap = 8; // StringBuilder 初始容量 8
  let len = 0;
  let nSum = 0;
  let bSum = 0;
  for (let k = 1; k <= N; k++) {
    // 朴素 +=:新串长 k,要把旧的 k-1 个字符全部重抄 + 写 1 个新字符
    nSum += k;
    naive.push(nSum);
    // StringBuilder:写 1 个字符;仅当容量满时翻倍并搬家(拷贝 len 个)
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
    // 更新函数保持纯粹:只推进进度,停止播放交给下面的 effect
    const id = setInterval(() => {
      setStep((s) => (s >= N ? s : s + 1));
    }, 90);
    return () => clearInterval(id);
  }, [playing]);

  // 跑到终点自动停
  useEffect(() => {
    if (playing && step >= N) setPlaying(false);
  }, [playing, step]);

  const max = naive[N]; // 用朴素法的总量做比例尺
  const nv = naive[step];
  const bv = builder[step];
  const done = step >= N;

  return (
    <div className="viz">
      <div className="viz-title">
        拼接赛跑 —— 追加 {N} 个字符,谁拷贝得少?
      </div>
      <div className="viz-stage" style={{ flexDirection: "column", gap: 8 }}>
        <div className="str-race">
          <div className="str-race-row">
            <span className="str-race-label">每次 s += c(重建)</span>
            <div className="str-race-track">
              <div
                className="str-race-bar"
                data-kind="naive"
                style={{ width: `${(nv / max) * 100}%` }}
              />
            </div>
            <span className="str-race-num">已拷贝 {nv} 字符</span>
          </div>
          <div className="str-race-row">
            <span className="str-race-label">StringBuilder 追加</span>
            <div className="str-race-track">
              <div
                className="str-race-bar"
                data-kind="builder"
                style={{ width: `${(bv / max) * 100}%` }}
              />
            </div>
            <span className="str-race-num">已拷贝 {bv} 字符</span>
          </div>
        </div>
      </div>
      <div className="viz-msg" aria-live="polite">
        {step === 0 ? (
          <>
            两位选手做同一件事:往字符串尾部追加 {N} 个字符。
            比的不是次数(都一样),是<b>背后总共拷贝了多少字符</b>。
          </>
        ) : done ? (
          <>
            终点:朴素 += 拷贝了 <b>{nv}</b> 字符(≈ n²/2),StringBuilder 只拷贝了{" "}
            <b>{bv}</b>(≈ 2n,含扩容搬家)—— 差 <b>{Math.round(nv / bv)} 倍</b>。
            n 再大十倍,差距就是百倍:这就是 O(n²) 与 O(n) 的区别。
          </>
        ) : (
          <>
            第 {step} 次追加:+= 要新建长度 {step} 的串、重抄全部旧字符(本次拷贝{" "}
            <b>{step}</b> 个);StringBuilder 只往数组空位写 1 个
            {builder[step] - builder[step - 1] > 1 ? (
              <>(这一步刚好触发扩容,额外搬家一次)</>
            ) : null}
            。
          </>
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
          {playing ? "⏸ 暂停" : done ? "↻ 重赛" : "▶ 开跑"}
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => {
            setPlaying(false);
            setStep(0);
          }}
        >
          重置
        </button>
        <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>
          进度 {step} / {N}
          {step > 0 && <> · 当前差距 {(nv / Math.max(bv, 1)).toFixed(1)}×</>}
        </span>
      </div>
    </div>
  );
}
