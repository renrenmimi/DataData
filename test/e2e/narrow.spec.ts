// On a phone nothing is cut off at the right edge of any page, and printing
// shows every section, without the shell chrome, in the light palette.

import { expect, test } from "@playwright/test";
import { elementsPastViewport } from "./overflow";

const ROUTES = [
  "/",
  "/array",
  "/string",
  "/linked-list",
  "/stack",
  "/queue",
  "/hash",
  "/binary-tree",
  "/bst",
  "/heap",
  "/trie",
  "/union-find",
  "/graph",
  "/advanced",
  "/atlas",
];

for (const width of [360, 390]) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const route of ROUTES) {
      test(`nothing on ${route} is cut off at the right edge`, async ({ page }) => {
        await page.goto(route);
        await page.evaluate(() => document.fonts.ready);
        expect(await elementsPastViewport(page)).toEqual([]);
      });
    }
  });
}

test("printing shows every section, without the shell chrome, in the light palette", async ({
  page,
}) => {
  await page.goto("/array");
  await page.emulateMedia({ media: "print" });
  const unrevealed = await page
    .locator(".reveal")
    .evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity !== "1").length);
  expect(unrevealed).toBe(0);
  await expect(page.locator(".sidebar")).toBeHidden();
  await expect(page.locator(".toolbar")).toBeHidden();

  // The listener is attached after hydration, so retry until it is in place
  await expect(async () => {
    await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light", { timeout: 200 });
  }).toPass();
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
