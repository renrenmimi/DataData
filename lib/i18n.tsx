"use client";

// Site-wide bilingual infrastructure (English by default, switchable to Chinese).
//  - langScript: writes the language onto <html data-lang> before the first
//    paint to avoid a flash.
//  - LangProvider / useLang: language state + localStorage persistence.
//  - useL(): resolves a Loc<T> ({ en, zh } or a plain value) to the current
//    language.
//  - <T en={…} zh={…} />: inline switch for JSX, usable inside module-level
//    constant arrays.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  isValidElement,
  type ReactNode,
} from "react";

export type Lang = "en" | "zh";

/** A value that may be given per language. Plain values pass through unchanged. */
export type Loc<T> = T | { en: T; zh: T };

const KEY = "dd-lang";

/** Runs before first paint so the page never flashes the wrong language. */
export const langScript = `(function(){var d=document.documentElement;var l="en";try{var s=localStorage.getItem("${KEY}");if(s==="zh")l="zh";}catch(e){}d.dataset.lang=l;d.lang=l==="zh"?"zh-CN":"en";})();`;

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>("en");

  useEffect(() => {
    const d = document.documentElement.dataset.lang;
    if (d === "zh" || d === "en") set(d);
  }, []);

  const setLang = useCallback((l: Lang) => {
    set(l);
    const d = document.documentElement;
    d.dataset.lang = l;
    d.lang = l === "zh" ? "zh-CN" : "en";
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* private mode */
    }
  }, []);

  return (
    <LangContext.Provider
      value={useMemo(() => ({ lang, setLang }), [lang, setLang])}
    >
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);

/** True for `{ en, zh }` pairs — never for React elements or arrays. */
function isPair<T>(v: Loc<T>): v is { en: T; zh: T } {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    !isValidElement(v) &&
    "en" in v &&
    "zh" in v
  );
}

/** Resolver hook: `const L = useL(); L(node)` picks the current language. */
export function useL() {
  const { lang } = useLang();
  return useCallback(<T,>(v: Loc<T>): T => (isPair(v) ? v[lang] : v), [lang]);
}

/** Inline switch usable anywhere in JSX, including module-level constants. */
export function T({ en, zh }: { en: ReactNode; zh: ReactNode }) {
  const { lang } = useLang();
  return <>{lang === "zh" ? zh : en}</>;
}
