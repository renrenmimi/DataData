"use client";

// Left navigation: brand + every chapter (each numbered dot in its own theme
// hue) + learning progress.
// The chapter list comes from lib/curriculum.ts, progress from lib/progress.tsx.
//
// Up to 960px wide the sidebar is an off-canvas drawer. Whenever it is off
// screen (closed drawer, or collapsed on desktop) it is inert, so its links
// are not tab stops. While the drawer is open the page behind it is inert and
// does not scroll, focus starts in the drawer, and Escape or the scrim closes
// it and returns focus to the menu button.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CHAPTERS, chapterByPath, subLabel } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { useL, T } from "@/lib/i18n";
import { useShell } from "./theme-provider";
import { BrandMark } from "./logo";

/** True when the layout is the narrow one, where the sidebar is a drawer. */
export function useNarrowLayout() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 960px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return narrow;
}

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const L = useL();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useShell();
  const narrow = useNarrowLayout();
  const asideRef = useRef<HTMLElement>(null);
  const restoreFocus = useRef(false);
  const { ready, chapterState, totalProblems, data } = useProgress();

  const current = chapterByPath(path);
  const doneCh = ready
    ? CHAPTERS.filter((c) => chapterState(c.id) === "done").length
    : 0;
  const progress = Math.round((doneCh / CHAPTERS.length) * 100);
  const quizCount = ready ? Object.keys(data.quiz).length : 0;

  const drawerOpen = narrow && sidebarOpen;
  const offScreen = narrow ? !sidebarOpen : sidebarCollapsed;

  // A link was followed: just close
  const close = () => setSidebarOpen(false);
  // Escape or the scrim: close and hand focus back to the menu button
  const dismiss = () => {
    restoreFocus.current = true;
    setSidebarOpen(false);
  };

  // Widening past the breakpoint leaves no drawer to keep open
  useEffect(() => {
    if (!narrow) setSidebarOpen(false);
  }, [narrow, setSidebarOpen]);

  useEffect(() => {
    if (!drawerOpen) {
      if (restoreFocus.current) {
        restoreFocus.current = false;
        document.getElementById("sidebar-toggle")?.focus();
      }
      return;
    }
    const main = document.querySelector<HTMLElement>(".shell-main");
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    main?.setAttribute("inert", "");
    html.style.overflow = "hidden";
    asideRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      main?.removeAttribute("inert");
      html.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // dismiss only touches a ref and a stable setter, so it is not a dependency
  }, [drawerOpen]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        {L({ en: "Skip to content", zh: "跳到正文" })}
      </a>
      <aside
        id="sidebar"
        ref={asideRef}
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        aria-label={L({ en: "DataData chapters", zh: "DataData 章节导航" })}
        inert={offScreen}
      >
        <Link href="/" className="brand" onClick={close} aria-label="DataData">
          <span className="brand-mark" aria-hidden>
            <BrandMark />
          </span>
          <span>
            <span className="brand-name">DataData</span>
            <span className="brand-tagline">
              <T en="Data structures you can see" zh="看得见的数据结构" />
            </span>
          </span>
        </Link>

        <nav
          className="side-nav"
          aria-label={L({ en: "Chapters", zh: "章节" })}
        >
          {CHAPTERS.map((c) => {
            const active = c.id === current.id;
            const state = ready ? chapterState(c.id) : "new";
            const title = L(c.title);
            const sub = subLabel(title, L(c.en));
            return (
              <Link
                key={c.id}
                href={c.href}
                className={`side-link${active ? " active" : ""}`}
                style={{ "--ch-hue": c.hue } as React.CSSProperties}
                aria-current={active ? "page" : undefined}
                onClick={close}
                // Prefetching all 15 chapters on every page load cost about
                // 740 KB; fetch a chapter only when the reader points at it
                prefetch={false}
                onMouseEnter={() => router.prefetch(c.href)}
                onFocus={() => router.prefetch(c.href)}
              >
                <span className="side-num" aria-hidden>
                  {c.num}
                </span>
                <span className="side-title">
                  {title}
                  {sub && <span className="side-en">{sub}</span>}
                </span>
                <span
                  className={`side-state ${state}`}
                  role="img"
                  aria-label={
                    state === "done"
                      ? L({ en: "Completed", zh: "已完成" })
                      : state === "doing"
                        ? L({ en: "In progress", zh: "进行中" })
                        : L({ en: "Not started", zh: "未开始" })
                  }
                />
              </Link>
            );
          })}
        </nav>

        <div className="side-status">
          <div>
            <T
              en={
                <>
                  <b>{totalProblems}</b> problems solved · <b>{quizCount}</b>{" "}
                  quizzes taken · <b>{doneCh}</b>/{CHAPTERS.length} chapters
                  completed
                </>
              }
              zh={
                <>
                  已解答 <b>{totalProblems}</b> 题 · 已做 <b>{quizCount}</b>{" "}
                  个测验 · 完成 <b>{doneCh}</b>/{CHAPTERS.length} 章
                </>
              }
            />
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label={L({ en: "Course progress", zh: "全书进度" })}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </aside>

      <div
        className={`scrim${sidebarOpen ? " open" : ""}`}
        aria-hidden
        onClick={dismiss}
      />
    </>
  );
}
