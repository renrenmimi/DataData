"use client";

// ⌘K command palette: fuzzy-search chapters (title / English name / tags),
// Enter to jump. The search corpus holds both languages, so a keyword in
// either one matches.
// The global keyboard listener lives here; Esc closes, ↑↓ moves the selection.
//
// It is a modal dialog built on the combobox pattern: focus stays in the
// search box (Tab cannot leave the dialog), the results are a listbox whose
// active option is announced through aria-activedescendant, the page behind
// does not scroll, and closing returns focus to whatever opened it.

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CHAPTERS, searchCorpus, subLabel } from "@/lib/curriculum";
import { useL } from "@/lib/i18n";
import { useShell } from "./theme-provider";

export default function CommandPalette() {
  const { cmdkOpen, setCmdkOpen } = useShell();
  const L = useL();
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      } else if (e.key === "Escape") {
        setCmdkOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCmdkOpen]);

  useEffect(() => {
    if (!cmdkOpen) return;
    opener.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setSel(0);
    // Focus only after the overlay has rendered
    requestAnimationFrame(() => inputRef.current?.focus());
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousOverflow;
      // Back to the button (or field) that opened the palette
      opener.current?.focus?.();
    };
  }, [cmdkOpen]);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CHAPTERS;
    return CHAPTERS.filter((c) => searchCorpus(c).includes(q));
  }, [query]);

  if (!cmdkOpen) return null;

  const go = (href: string) => {
    setCmdkOpen(false);
    router.push(href);
  };

  return (
    <div
      className="cmdk-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) setCmdkOpen(false);
      }}
    >
      <div
        className="cmdk"
        role="dialog"
        aria-modal="true"
        aria-label={L({ en: "Quick jump", zh: "快速跳转" })}
        onKeyDown={(e) => {
          // Focus lives in the search box; Tab must not escape the dialog
          if (e.key === "Tab") {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
      >
        <input
          ref={inputRef}
          className="cmdk-input"
          role="combobox"
          aria-expanded="true"
          aria-controls="cmdk-list"
          aria-autocomplete="list"
          aria-activedescendant={hits[sel] ? `cmdk-opt-${hits[sel].id}` : undefined}
          placeholder={L({
            en: "Search chapters, data structures, tags…",
            zh: "搜索章节、数据结构、标签…",
          })}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((s) => Math.min(s + 1, hits.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((s) => Math.max(s - 1, 0));
            } else if (e.key === "Enter" && hits[sel]) {
              go(hits[sel].href);
            }
          }}
        />
        <div
          className="cmdk-list"
          id="cmdk-list"
          role="listbox"
          aria-label={L({ en: "Chapters", zh: "章节" })}
        >
          {hits.length === 0 && (
            <div className="cmdk-empty">
              {L({
                en: "No chapter matches that. Try another word.",
                zh: "没有匹配的章节 —— 换个关键词?",
              })}
            </div>
          )}
          {hits.map((c, i) => {
            const title = L(c.title);
            const sub = subLabel(title, L(c.en));
            return (
              <button
                key={c.id}
                id={`cmdk-opt-${c.id}`}
                type="button"
                role="option"
                aria-selected={i === sel}
                tabIndex={-1}
                className={`cmdk-item${i === sel ? " sel" : ""}`}
                style={{ "--ch-hue": c.hue } as React.CSSProperties}
                onMouseEnter={() => setSel(i)}
                onClick={() => go(c.href)}
              >
                <span className="side-num">{c.num}</span>
                <span style={{ flex: 1 }}>
                  {title}
                  {sub && <span className="side-en">{sub}</span>}
                </span>
                <span className="dim" style={{ fontSize: 11 }}>
                  {c.tags
                    .slice(0, 2)
                    .map((t) => L(t))
                    .join(" · ")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
