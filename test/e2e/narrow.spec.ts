// On a phone nothing is cut off at the right edge of any page and text fields
// are large enough that iOS does not zoom in; printing shows every section,
// without the shell chrome, in the light palette.

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

test.describe("text fields on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("are at least 16px, so iOS Safari does not zoom in on focus", async ({ page }) => {
    // The labs' inputs are on the page from the start
    for (const route of ["/string", "/hash", "/bst", "/heap", "/trie", "/advanced"]) {
      await page.goto(route);
      const sizes = await page
        .locator('input:not([type]), input[type="text"]')
        .evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
      expect(sizes.length, route).toBeGreaterThan(0);
      for (const size of sizes) expect(size, route).toBeGreaterThanOrEqual(16);
    }
    // A quiz fill-in appears only on its question, and the palette only when
    // open, so measure a field with each of their classes instead
    const shared = await page.evaluate(() =>
      ["q-input", "cmdk-input"].map((cls) => {
        const field = document.createElement("input");
        field.className = cls;
        document.body.append(field);
        const size = parseFloat(getComputedStyle(field).fontSize);
        field.remove();
        return size;
      }),
    );
    for (const size of shared) expect(size).toBeGreaterThanOrEqual(16);
  });
});

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
