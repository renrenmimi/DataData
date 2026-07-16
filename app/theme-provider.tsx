"use client";

// 应用级 client providers。
//  - ThemeProvider:把 data-theme("dark" | "light")镜像到 <html>,localStorage 持久化。
//    首帧前由 <head> 里的内联脚本(themeScript)设好,不闪错主题。
//  - ShellProvider:工作台 UI 状态(移动端抽屉侧栏 / 桌面折叠 / ⌘K 面板 / 偏好代码语言)。
//    「偏好代码语言」是全站联动的:任何一个 CodeTabs 切到 Python,所有代码窗口都跟着切。

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

// 首帧前执行:读回主题 + 侧栏折叠状态,避免闪烁。默认深色 + 展开。
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

// ---------- Shell UI 状态 ----------

type ShellCtx = {
  sidebarOpen: boolean; // 移动端抽屉(≤960px 遮罩滑入)
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  sidebarCollapsed: boolean; // 桌面端折叠
  toggleSidebarCollapsed: () => void;
  cmdkOpen: boolean;
  setCmdkOpen: Dispatch<SetStateAction<boolean>>;
  codeLang: CodeLang; // 全站联动的偏好代码语言
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
