"use client";

// 左侧导航栏:品牌 + 全部章节(每章自己的主题色圆点编号)+ 学习进度。
// 章节清单来自 lib/curriculum.ts;进度来自 lib/progress.tsx。

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CHAPTERS, chapterByPath, subLabel } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { useL, T } from "@/lib/i18n";
import { useShell } from "./theme-provider";
import { BrandMark } from "./logo";

export default function Sidebar() {
  const path = usePathname();
  const L = useL();
  const { sidebarOpen, setSidebarOpen } = useShell();
  const { ready, chapterState, totalProblems, data } = useProgress();

  const current = chapterByPath(path);
  const doneCh = ready
    ? CHAPTERS.filter((c) => chapterState(c.id) === "done").length
    : 0;
  const progress = Math.round((doneCh / CHAPTERS.length) * 100);
  const quizCount = ready ? Object.keys(data.quiz).length : 0;

  const close = () => setSidebarOpen(false);

  return (
    <>
      <aside
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        aria-label={L({ en: "DataData chapters", zh: "DataData 章节导航" })}
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
                  已刷 <b>{totalProblems}</b> 题 · 完成 <b>{quizCount}</b>{" "}
                  个测验 · 通关 <b>{doneCh}</b>/{CHAPTERS.length} 章
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
        onClick={close}
      />
    </>
  );
}
