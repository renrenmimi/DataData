import type { Page } from "@playwright/test";

/**
 * Describes every element that reaches past the right edge of the viewport.
 *
 * html and body clip horizontal overflow (overflow-x: clip), so the document
 * never scrolls sideways and document.scrollWidth cannot reveal a clipped
 * element; this measures the elements instead, including text that overflows
 * its own box. Skipped: aria-hidden decoration such as the aurora, and
 * anything inside a container that scrolls or clips on its own (a code
 * window, a wide table, an SVG viewport). That container is measured itself,
 * so it is reported if it is what runs past the edge.
 */
export function elementsPastViewport(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const limit = document.documentElement.clientWidth + 1;
    const insideContainer = (e: Element) => {
      for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
        if (getComputedStyle(p).overflowX !== "visible") return true;
      }
      return false;
    };
    const out: string[] = [];
    for (const e of document.body.querySelectorAll("*")) {
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(e);
      // An element that clips its own content (an ellipsis) only counts by its box
      const right =
        cs.overflowX === "visible" ? Math.max(r.right, r.left + e.scrollWidth) : r.right;
      if (right <= limit || cs.visibility === "hidden") continue;
      if (e.closest('[aria-hidden="true"]') || insideContainer(e)) continue;
      out.push(`${e.tagName.toLowerCase()}.${[...e.classList].join(".")} reaches ${Math.round(right)}px`);
    }
    return out;
  });
}
