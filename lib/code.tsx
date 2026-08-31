"use client";

// Code window components.
//  - CodeBlock: single-language window (mac traffic lights + filename + line
//    numbers + highlightable lines + footnote).
//  - CodeTabs: tabbed Java / Python / JS window; switching writes back to the
//    site-wide preferred language, so every code window on the site switches
//    with it — the core mechanism of the three-language comparison.
//
// Bilingual: title / note / code all accept Loc<…>. Comments inside the code
// are part of the teaching content, so write the whole snippet as { en, zh }
// when it needs both languages — the two versions must stay line-for-line
// equivalent and differ only in the comments, or the hl line numbers drift.

import { useMemo, type ReactNode } from "react";
import { highlight, type CodeLangId } from "@/lib/highlight";
import { useL, type Loc } from "@/lib/i18n";
import { useShell, type CodeLang } from "@/app/theme-provider";

const LANG_LABEL: Record<CodeLangId, string> = {
  java: "Java",
  python: "Python",
  js: "JavaScript",
};

const LANG_FILE: Record<CodeLangId, string> = {
  java: ".java",
  python: ".py",
  js: ".js",
};

export function CodeLines({
  code,
  lang,
  hl,
}: {
  code: string;
  lang: CodeLangId;
  hl?: number[];
}) {
  const lines = useMemo(() => highlight(code.trimEnd(), lang), [code, lang]);
  const hlSet = useMemo(() => new Set(hl ?? []), [hl]);
  return (
    <div className="codewin-body">
      {lines.map((toks, i) => (
        <div key={i} className={`cl${hlSet.has(i + 1) ? " hl" : ""}`}>
          <span className="cl-n">{i + 1}</span>
          <span className="cl-c">
            {toks.map((tok, j) =>
              tok.t ? (
                <span key={j} className={`tk-${tok.t}`}>
                  {tok.s}
                </span>
              ) : (
                <span key={j}>{tok.s}</span>
              ),
            )}
            {toks.length === 0 && " "}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CodeBlock({
  code,
  lang,
  title,
  hl,
  note,
}: {
  code: Loc<string>;
  lang: CodeLangId;
  title?: Loc<string>;
  hl?: number[];
  note?: Loc<ReactNode>;
}) {
  const L = useL();
  return (
    <div className="codewin">
      <div className="codewin-bar">
        <span className="codewin-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="codewin-name">
          {title === undefined ? LANG_LABEL[lang] : L(title)}
        </span>
        <span style={{ width: 47 }} aria-hidden />
      </div>
      <CodeLines code={L(code)} lang={lang} hl={hl} />
      {note && <div className="codewin-note">{L(note)}</div>}
    </div>
  );
}

export interface LangSnippet {
  code: Loc<string>;
  /** Optional one-line note for this language, shown in the window footer */
  note?: Loc<ReactNode>;
  /** Lines to highlight (1-based) */
  hl?: number[];
}

export function CodeTabs({
  title,
  java,
  python,
  js,
}: {
  title: Loc<string>;
  java: LangSnippet;
  python: LangSnippet;
  js: LangSnippet;
}) {
  const L = useL();
  const { codeLang, setCodeLang } = useShell();
  const snippets: Record<CodeLang, LangSnippet> = { java, python, js };
  const cur = snippets[codeLang];

  return (
    <div className="codewin">
      <div className="codewin-bar">
        <span className="codewin-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="codewin-name">
          {L(title)}
          {LANG_FILE[codeLang]}
        </span>
        <div
          className="codewin-tabs"
          role="tablist"
          aria-label={L({ en: "Switch code language", zh: "切换语言" })}
        >
          {(Object.keys(snippets) as CodeLang[]).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={codeLang === l}
              className={`codewin-tab${codeLang === l ? " on" : ""}`}
              onClick={() => setCodeLang(l)}
            >
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
      </div>
      <CodeLines code={L(cur.code)} lang={codeLang} hl={cur.hl} />
      {cur.note && <div className="codewin-note">{L(cur.note)}</div>}
    </div>
  );
}
