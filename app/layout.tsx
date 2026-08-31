import type { Metadata, Viewport } from "next";
import {
  Syne,
  Space_Grotesk,
  JetBrains_Mono,
  Noto_Sans_SC,
} from "next/font/google";
import "./globals.css";
import {
  ThemeProvider,
  ShellProvider,
  themeScript,
} from "@/app/theme-provider";
import { ProgressProvider } from "@/lib/progress";
import { LangProvider, langScript } from "@/lib/i18n";
import Sidebar from "@/app/sidebar";
import Toolbar from "@/app/toolbar";
import CommandPalette from "@/app/command-palette";

// Three typefaces: Syne (oversized display, strongly geometric), Space Grotesk
// (UI and headings), JetBrains Mono (code and numbers). Chinese falls back to
// PingFang SC; the stacks are assembled in globals.css.
const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jb",
  display: "swap",
});
// Chinese sans-serif: gives headings a real 900 weight (system PingFang stops
// at 600). CJK glyphs are sharded by unicode-range, so the browser downloads
// only the characters the page actually uses.
const notoSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DataData · Data structures you can see",
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
      className={`${syne.variable} ${grotesk.variable} ${jetbrains.variable} ${notoSC.variable}`}
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
                    <div className="shell-content">{children}</div>
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
