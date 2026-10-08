// If React gives up hydrating the root, it renders it again on the client and
// drops the <html> attributes that the inline scripts wrote before the first
// paint. The providers must then restore the reader's settings from storage,
// not from those attributes, and write the attributes back.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LangProvider, useLang } from "@/lib/i18n";
import { ShellProvider, ThemeProvider, useShell, useTheme } from "@/app/theme-provider";

function Probe() {
  const { lang } = useLang();
  const { theme } = useTheme();
  const { sidebarCollapsed, codeLang } = useShell();
  return <p>{`${lang} ${theme} ${sidebarCollapsed ? "collapsed" : "expanded"} ${codeLang}`}</p>;
}

function renderProviders() {
  render(
    <LangProvider>
      <ThemeProvider>
        <ShellProvider>
          <Probe />
        </ShellProvider>
      </ThemeProvider>
    </LangProvider>,
  );
}

const html = document.documentElement;

beforeEach(() => {
  localStorage.clear();
  // The state after React has rendered the root again: only what it declares
  for (const key of ["lang", "theme", "sidebar"]) delete html.dataset[key];
  html.lang = "en";
});

describe("settings after the root is rendered again on the client", () => {
  it("come back from storage and are written back onto <html>", () => {
    localStorage.setItem("dd-lang", "zh");
    localStorage.setItem("dd-theme", "light");
    localStorage.setItem("dd-sidebar", "collapsed");
    localStorage.setItem("dd-codelang", "java");
    renderProviders();

    expect(screen.getByText("zh light collapsed java")).toBeInTheDocument();
    expect(html.dataset.lang).toBe("zh");
    expect(html.lang).toBe("zh-CN");
    expect(html.dataset.theme).toBe("light");
    expect(html.dataset.sidebar).toBe("collapsed");
  });

  it("fall back to the defaults when nothing is stored", () => {
    renderProviders();

    expect(screen.getByText("en dark expanded python")).toBeInTheDocument();
    expect(html.dataset.lang).toBe("en");
    expect(html.dataset.theme).toBe("dark");
    expect(html.dataset.sidebar).toBe("expanded");
  });

  it("fall back to the defaults when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage is blocked");
    });
    renderProviders();

    expect(screen.getByText("en dark expanded python")).toBeInTheDocument();
    expect(html.dataset.theme).toBe("dark");
  });
});
