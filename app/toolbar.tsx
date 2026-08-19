"use client";

// 顶部工具条:侧栏开关 + 面包屑 + 界面语言 + ⌘K + 偏好代码语言 + 主题切换。
// 「界面语言」(EN / 中文)与「偏好代码语言」(Java/Python/JS)是两件事,
// 分别用两个 .seg 分段控制器;窄屏下只保留界面语言。

import { usePathname } from "next/navigation";
import { chapterByPath } from "@/lib/curriculum";
import { useL, useLang, type Lang } from "@/lib/i18n";
import { useShell, useTheme, type CodeLang } from "./theme-provider";

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
  const ch = chapterByPath(path);
  const L = useL();
  const { lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const {
    setSidebarOpen,
    toggleSidebarCollapsed,
    setCmdkOpen,
    codeLang,
    setCodeLang,
  } = useShell();

  return (
    <header className="toolbar">
      <button
        type="button"
        className="tb-btn"
        aria-label={L({ en: "Toggle sidebar", zh: "切换侧栏" })}
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
        <b>
          {ch.num !== "✦" ? `${ch.num} · ` : ""}
          {L(ch.title)}
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
        {L({ en: "Jump", zh: "跳转" })} <span className="tb-kbd">⌘K</span>
      </button>

      <button
        type="button"
        className="tb-btn"
        onClick={toggleTheme}
        aria-label={L({ en: "Toggle theme", zh: "切换主题" })}
      >
        {theme === "dark" ? "☾" : "☀"}
      </button>
    </header>
  );
}
