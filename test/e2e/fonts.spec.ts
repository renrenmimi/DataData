// Fonts are self-hosted. English pages never download Noto Sans SC, and
// Chinese pages still render with it.

import { expect, test } from "@playwright/test";

test("an English page downloads no Chinese font", async ({ page }) => {
  const fonts: string[] = [];
  page.on("request", (r) => {
    if (r.resourceType() === "font") fonts.push(r.url());
  });
  await page.goto("/array");
  await page.evaluate(() => document.fonts.ready);
  expect(fonts.length).toBeGreaterThan(0);
  expect(fonts.filter((u) => /noto/i.test(u))).toEqual([]);
  const notoFaces = await page.evaluate(
    () => [...document.fonts].filter((f) => /Noto.?Sans.?SC/.test(f.family) && f.status !== "unloaded").length,
  );
  expect(notoFaces).toBe(0);
});

test("a Chinese page renders with Noto Sans SC", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("dd-lang", "zh"));
  await page.goto("/array");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          [...document.fonts].filter((f) => f.family.includes("Noto Sans SC") && f.status === "loaded")
            .length,
      ),
    )
    .toBeGreaterThan(0);
});
