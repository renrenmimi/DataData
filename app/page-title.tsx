"use client";

// Keeps the browser tab title in the reader's language. The server renders the
// English title from each route's metadata, and Next.js writes it again when
// that metadata hydrates (after this component's first effect) and when a
// navigation commits. So the localized title is reapplied whenever the <title>
// text changes underneath it. The observer lives in a layout effect, so it is
// disconnected during the commit that leaves the page, before the next page's
// title is written; render one PageTitle per page.

import { useLayoutEffect } from "react";
import { useLang, type Loc } from "@/lib/i18n";
import { CHAPTERS, SITE_TITLE, type ChapterId } from "@/lib/curriculum";

// The most recently mounted PageTitle. Only it writes, so two mounted at once
// cannot keep overwriting each other.
let owner: symbol | null = null;

/** `page` is the page's own name, or null for the prologue (the site title). */
export function PageTitle({ page }: { page: Loc<string> | null }) {
  const { lang } = useLang();
  const text =
    page === null
      ? SITE_TITLE[lang]
      : `${typeof page === "string" ? page : page[lang]} · DataData`;

  useLayoutEffect(() => {
    const me = Symbol();
    owner = me;
    const apply = () => {
      if (owner === me && document.title !== text) document.title = text;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    return () => {
      observer.disconnect();
      if (owner === me) owner = null;
    };
  }, [text]);

  return null;
}

export function ChapterTitle({ id }: { id: ChapterId }) {
  return <PageTitle page={CHAPTERS.find((c) => c.id === id)!.title} />;
}
