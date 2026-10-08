import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./fonts/noto-sans-sc.css";
import "./globals.css";
import {
  ThemeProvider,
  ShellProvider,
  themeScript,
} from "@/app/theme-provider";
import { ProgressProvider } from "@/lib/progress";
import { LangProvider, langScript } from "@/lib/i18n";
import { SITE_TITLE } from "@/lib/curriculum";
import Sidebar from "@/app/sidebar";
import Toolbar from "@/app/toolbar";
import CommandPalette from "@/app/command-palette";

// Three typefaces: Syne (oversized display, strongly geometric), Space Grotesk
// (UI and headings), JetBrains Mono (code and numbers). Chinese pages add Noto
// Sans SC (imported above as plain @font-face rules, sliced by unicode-range);
// the stacks are assembled in globals.css. All four are self-hosted from
// app/fonts, so a build never downloads fonts (see app/fonts/README.md). Each
// Latin file is Google Fonts' latin subset of the variable font.
const syne = localFont({
  src: "./fonts/syne-latin.woff2",
  weight: "600 800",
  variable: "--font-syne",
  display: "swap",
});
const grotesk = localFont({
  src: "./fonts/space-grotesk-latin.woff2",
  weight: "400 700",
  variable: "--font-grotesk",
  display: "swap",
});
const jetbrains = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  weight: "400 700",
  variable: "--font-jb",
  display: "swap",
});

export const metadata: Metadata = {
  // Resolves the canonical and Open Graph URLs set by each chapter layout
  metadataBase: new URL("https://data-data.vercel.app"),
  title: {
    default: SITE_TITLE.en,
    template: "%s · DataData",
  },
  description:
    "Learn data structures in slow motion: memory diagrams, interactive visualizations, Java / Python / JavaScript side by side, and worked LeetCode problems. Available in English and Chinese.",
};

export const viewport: Viewport = {
  themeColor: "#07080f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${grotesk.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
      </head>
      <body>
        <LangProvider>
          <ThemeProvider>
            <ShellProvider>
              <ProgressProvider>
                <div className="aurora" aria-hidden>
                  <div className="aurora-a" />
                  <div className="aurora-b" />
                  <div className="aurora-grid" />
                </div>
                <div className="shell">
                  <Sidebar />
                  <div className="shell-main">
                    <Toolbar />
                    {/* Target of the sidebar's "Skip to content" link */}
                    <div className="shell-content" id="main-content" tabIndex={-1}>
                      {children}
                    </div>
                  </div>
                </div>
                <CommandPalette />
              </ProgressProvider>
            </ShellProvider>
          </ThemeProvider>
        </LangProvider>
      </body>
    </html>
  );
}
