"use client";

// 章节页通用原语:
//  - Reveal:滚动进入视口时淡入上移(IntersectionObserver)。
//  - Hero:章节开场(眉题 / 渐变大标题 / 本质一句话 / 巨型编号水印 / 段落跳转 chips)。
//  - Section:编号章节段(§01 · 标题 + 描述 + 右侧徽章),自带 Reveal。
//  - Callout:提示框(idea/warn/deep/story/win 五种语气)。
//  - BigO:复杂度徽章。 KeyPoints:章末要点卡。 ChapterFooter:上一章/下一章。
//
// 所有文案类 prop 都接受 Loc<…>:直接给值 = 两种语言共用,给 { en, zh } = 按语言切换。

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { CHAPTERS, prevNext, type ChapterId } from "@/lib/curriculum";
import { useL, T, type Loc } from "@/lib/i18n";

/* ---------- Reveal ---------- */

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${inView ? " in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ---------- Hero ---------- */

export interface HeroChip {
  id: string;
  label: Loc<string>;
  n: string;
}

export function Hero({
  ch,
  title,
  essence,
  chips,
  children,
}: {
  ch: ChapterId;
  /** 渐变标题,例如 <>数组 <span className="grad">Array</span></> */
  title: Loc<ReactNode>;
  essence: Loc<ReactNode>;
  chips?: HeroChip[];
  /** hero 右侧/下方的自定义视觉(每章专属动画) */
  children?: ReactNode;
}) {
  const L = useL();
  const meta = CHAPTERS.find((c) => c.id === ch)!;
  return (
    <header className="hero">
      <div className="hero-watermark" aria-hidden>
        {meta.num}
      </div>
      <div className="hero-eyebrow">
        CHAPTER {meta.num} · {L(meta.en)}
      </div>
      <h1 className="hero-title">{L(title)}</h1>
      <p className="hero-essence">{L(essence)}</p>
      {children}
      {chips && chips.length > 0 && (
        <nav
          className="hero-nav"
          aria-label={L({ en: "Sections in this chapter", zh: "本章段落" })}
        >
          {chips.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="hero-chip">
              <span className="n">§{c.n}</span>
              {L(c.label)}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

/* ---------- Section ---------- */

export function Section({
  id,
  index,
  title,
  desc,
  badge,
  children,
}: {
  id?: string;
  index: string;
  title: Loc<ReactNode>;
  desc?: Loc<ReactNode>;
  badge?: Loc<ReactNode>;
  children: ReactNode;
}) {
  const L = useL();
  return (
    <Reveal>
      <section className="sec" id={id}>
        <div className="sec-head">
          <span className="sec-index">§{index}</span>
          <h2 className="sec-title">{L(title)}</h2>
          {badge && <span className="sec-badge">{L(badge)}</span>}
        </div>
        {desc && <p className="sec-desc">{L(desc)}</p>}
        {children}
      </section>
    </Reveal>
  );
}

/* ---------- Callout ---------- */

const TONE_ICO: Record<string, string> = {
  idea: "💡",
  warn: "⚠️",
  deep: "🔬",
  story: "📖",
  win: "🏆",
};

export function Callout({
  tone = "idea",
  ico,
  title,
  children,
}: {
  tone?: "idea" | "warn" | "deep" | "story" | "win";
  ico?: string;
  title?: Loc<ReactNode>;
  children: ReactNode;
}) {
  const L = useL();
  return (
    <div className="callout" data-tone={tone}>
      <span className="ico" aria-hidden>
        {ico ?? TONE_ICO[tone]}
      </span>
      <div>
        {title && (
          <p>
            <b>{L(title)}</b>
          </p>
        )}
        {typeof children === "string" ? <p>{children}</p> : children}
      </div>
    </div>
  );
}

/* ---------- BigO ---------- */

/** o 取值:1 | logn | n | nlogn | n2 | 2n,label 缺省按 o 生成 */
export function BigO({ o, label }: { o: string; label?: Loc<string> }) {
  const L = useL();
  const text =
    (label === undefined ? undefined : L(label)) ??
    {
      "1": "O(1)",
      logn: "O(log n)",
      n: "O(n)",
      nlogn: "O(n log n)",
      n2: "O(n²)",
      "2n": "O(2ⁿ)",
    }[o] ??
    o;
  return (
    <span className="big-o" data-o={o}>
      {text}
    </span>
  );
}

/* ---------- KeyPoints ---------- */

const KP_TITLE: Loc<ReactNode> = {
  en: "What to take away from this chapter",
  zh: "这一章,真正要带走的",
};

export function KeyPoints({
  title = KP_TITLE,
  points,
}: {
  title?: Loc<ReactNode>;
  points: Loc<ReactNode>[];
}) {
  const L = useL();
  return (
    <Reveal>
      <div className="kp">
        <div className="kp-title">
          <span aria-hidden>✦</span>
          {L(title)}
        </div>
        <ul>
          {points.map((p, i) => (
            <li key={i}>
              <span>{L(p)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

/* ---------- ChapterFooter ---------- */

export function ChapterFooter({ ch }: { ch: ChapterId }) {
  const L = useL();
  const { prev, next } = prevNext(ch);
  return (
    <nav
      className="ch-footer"
      aria-label={L({ en: "Chapter navigation", zh: "章节导航" })}
    >
      {prev ? (
        <Link
          href={prev.href}
          className="ch-footer-link"
          style={{ "--ch-hue": prev.hue } as CSSProperties}
        >
          <span className="lab">
            <T en="← Previous chapter" zh="← 上一章" />
          </span>
          <span className="name">
            <span className="n">{prev.num}</span>
            {L(prev.title)}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className="ch-footer-link next"
          style={{ "--ch-hue": next.hue } as CSSProperties}
        >
          <span className="lab">
            <T en="Next chapter →" zh="下一章 →" />
          </span>
          <span className="name">
            <span className="n">{next.num}</span>
            {L(next.title)}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
