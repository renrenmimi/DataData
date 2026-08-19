"use client";

// 代码窗口组件。
//  - CodeBlock:单语言代码窗(mac 三色点 + 文件名 + 行号 + 可高亮行 + 底部注释)。
//  - CodeTabs:Java / Python / JS 三语言切换窗;切换会写回全站「偏好语言」,
//    所以整个网站的所有代码窗口会跟着一起切 —— 这是三语言对照教学的核心机制。
//
// 双语:title / note / code 都接受 Loc<…>。代码里的注释是教学内容的一部分,
// 需要双语时把整段 code 写成 { en, zh } —— 两版代码必须逐行等价,只有注释不同,
// 否则 hl 高亮行号会对不上。

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
  /** 本语言专属的一句点评(可选),显示在窗口底部 */
  note?: Loc<ReactNode>;
  /** 高亮行号(1 起) */
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
