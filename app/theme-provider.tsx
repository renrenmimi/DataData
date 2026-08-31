"use client";

// App-level client providers.
//  - ThemeProvider: mirrors data-theme ("dark" | "light") onto <html> and
//    persists it in localStorage. The inline script in <head> (themeScript)
//    sets it before the first paint, so the wrong theme never flashes.
//  - ShellProvider: workbench UI state (mobile drawer sidebar / desktop
//    collapse / ⌘K palette / preferred code language).
//    The preferred code language is shared site-wide: switch any CodeTabs to
//    Python and every code window on the page follows.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

export type Theme = "dark" | "light";
export type CodeLang = "java" | "python" | "js";

const THEME_KEY = "dd-theme";
const SIDEBAR_KEY = "dd-sidebar";
const CODELANG_KEY = "dd-codelang";

// Runs before the first paint: restores the theme and sidebar collapse state
// to avoid a flash. Defaults to dark + expanded.
export const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark"){t="dark";}d.dataset.theme=t;}catch(e){d.dataset.theme="dark";}try{d.dataset.sidebar=localStorage.getItem("${SIDEBAR_KEY}")==="collapsed"?"collapsed":"expanded";}catch(e){d.dataset.sidebar="expanded";}})();`;

type ThemeCtx = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, set] = useState<Theme>("dark");

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current === "light" || current === "dark") set(current);
  }, []);

  const toggleTheme = useCallback(() => {
    set((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// ---------- Shell UI state ----------

type ShellCtx = {
  sidebarOpen: boolean; // Mobile drawer (slides in over a scrim at ≤960px)
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  sidebarCollapsed: boolean; // Collapsed on desktop
  toggleSidebarCollapsed: () => void;
  cmdkOpen: boolean;
  setCmdkOpen: Dispatch<SetStateAction<boolean>>;
  codeLang: CodeLang; // Preferred code language, shared site-wide
  setCodeLang: (l: CodeLang) => void;
};

const ShellContext = createContext<ShellCtx>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  sidebarCollapsed: false,
  toggleSidebarCollapsed: () => {},
  cmdkOpen: false,
  setCmdkOpen: () => {},
  codeLang: "python",
  setCodeLang: () => {},
});

export function ShellProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [codeLang, setCodeLangState] = useState<CodeLang>("python");

  useEffect(() => {
    setSidebarCollapsed(document.documentElement.dataset.sidebar === "collapsed");
    try {
      const l = window.localStorage.getItem(CODELANG_KEY);
      if (l === "java" || l === "python" || l === "js") setCodeLangState(l);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      document.documentElement.dataset.sidebar = next ? "collapsed" : "expanded";
      try {
        window.localStorage.setItem(SIDEBAR_KEY, next ? "collapsed" : "expanded");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const setCodeLang = useCallback((l: CodeLang) => {
    setCodeLangState(l);
    try {
      window.localStorage.setItem(CODELANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <ShellContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        toggleSidebarCollapsed,
        cmdkOpen,
        setCmdkOpen,
        codeLang,
        setCodeLang,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}

export const useShell = () => useContext(ShellContext);
