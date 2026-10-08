"use client";

// Top toolbar: sidebar toggle + breadcrumb + interface language + ⌘K +
// preferred code language + theme toggle.
// Interface language (English / Chinese) and preferred code language
// (Java/Python/JS) are two separate things, each with its own .seg segmented
// control; narrow screens keep only the interface language.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { chapterByPath, PAGE_NOT_FOUND } from "@/lib/curriculum";
import { useL, useLang, type Lang } from "@/lib/i18n";
import { useShell, useTheme, type CodeLang } from "./theme-provider";
import { useNarrowLayout } from "./sidebar";

// The browser bar colour follows the in-app theme (values match --bg)
const THEME_COLOR = { dark: "#07080f", light: "#f1f0f6" } as const;

const CODE_LANGS: { id: CodeLang; label: string }[] = [
  { id: "java", label: "Java" },
  { id: "python", label: "Python" },
  { id: "js", label: "JS" },
];

const UI_LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "zh", label: "中文" },
];

export default function Toolbar() {
  const path = usePathname();
  // Outside the course (a 404) the breadcrumb names the page instead
  const ch = chapterByPath(path) ?? PAGE_NOT_FOUND;
  const L = useL();
  const { lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    setCmdkOpen,
    codeLang,
    setCodeLang,
  } = useShell();
  const narrow = useNarrowLayout();

  // Show the shortcut the reader's keyboard actually has
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_COLOR[theme]);
  }, [theme]);

  return (
    <header className="toolbar">
      <button
        type="button"
        id="sidebar-toggle"
        className="tb-btn"
        aria-label={L({ en: "Toggle sidebar", zh: "切换侧栏" })}
        aria-controls="sidebar"
        aria-expanded={narrow ? sidebarOpen : !sidebarCollapsed}
        onClick={() => {
          if (window.innerWidth <= 960) setSidebarOpen((v) => !v);
          else toggleSidebarCollapsed();
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M2 4h12M2 8h12M2 12h12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="tb-crumb">
        <span>DataData</span>
        <span className="sep">/</span>
        {/* Below 400px only the chapter number shows; the title stays in
            the accessibility tree */}
        <b>
          {ch.num !== "✦" && <span className="tb-crumb-num">{ch.num}</span>}
          <span className={ch.num !== "✦" ? "tb-crumb-title" : undefined}>
            {ch.num !== "✦" ? " · " : ""}
            {L(ch.title)}
          </span>
        </b>
      </div>

      <div
        className="seg tb-uilang"
        role="group"
        aria-label={L({ en: "Interface language", zh: "界面语言" })}
      >
        {UI_LANGS.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`seg-btn${lang === l.id ? " on" : ""}`}
            aria-pressed={lang === l.id}
            onClick={() => setLang(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div
        className="seg tb-codelang"
        role="group"
        aria-label={L({ en: "Preferred code language", zh: "偏好代码语言" })}
      >
        {CODE_LANGS.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`seg-btn${codeLang === l.id ? " on" : ""}`}
            aria-pressed={codeLang === l.id}
            onClick={() => setCodeLang(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="tb-btn"
        onClick={() => setCmdkOpen(true)}
        aria-label={L({ en: "Open command palette", zh: "打开命令面板" })}
      >
        {L({ en: "Jump", zh: "跳转" })}{" "}
        <span className="tb-kbd">{isMac ? "⌘K" : "Ctrl K"}</span>
      </button>

      <button
        type="button"
        className="tb-btn"
        onClick={toggleTheme}
        aria-label={
          theme === "dark"
            ? L({ en: "Switch to the light theme", zh: "切换到浅色主题" })
            : L({ en: "Switch to the dark theme", zh: "切换到深色主题" })
        }
      >
        {theme === "dark" ? "☾" : "☀"}
      </button>
    </header>
  );
}
