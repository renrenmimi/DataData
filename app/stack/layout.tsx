// Server layout: gives the chapter its own <title>, description and canonical
// URL (the page itself is a client component and cannot export metadata).

import type { ReactNode } from "react";
import { chapterMetadata } from "@/lib/curriculum";
import { ChapterTitle } from "@/app/page-title";

export const metadata = chapterMetadata("stack");

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <ChapterTitle id="stack" />
      {children}
    </>
  );
}
