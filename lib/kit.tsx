"use client";

// Shared primitives for chapter pages:
//  - Reveal: fades and lifts in when scrolled into view (IntersectionObserver).
//  - Hero: chapter opening (kicker / gradient title / one-line essence / giant
//    number watermark / section-jump chips).
//  - Section: numbered section (§01 · title + description + badge on the
//    right), with Reveal built in.
//  - Callout: notice box (idea/warn/deep/story/win tones).
//  - BigO: complexity badge. KeyPoints: end-of-chapter takeaways.
//    ChapterFooter: prev/next chapter.
//
// Every copy prop accepts Loc<…>: a plain value is shared by both languages,
// { en, zh } switches per language.

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
  /** Gradient title, e.g. <>The <span className="grad">Array</span></> */
  title: Loc<ReactNode>;
  essence: Loc<ReactNode>;
  chips?: HeroChip[];
  /** Custom visual beside or below the hero (the chapter's own animation) */
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

/** o is one of 1 | logn | n | nlogn | n2 | 2n; label defaults to text derived from o */
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
