// Progress across tabs: two pages in one browser context share localStorage,
// exactly like two tabs of the same site.

import { expect, test, type Locator, type Page } from "@playwright/test";

const CHAPTER = "/linked-list";

const storedProblems = (page: Page) =>
  page.evaluate(
    () => JSON.parse(localStorage.getItem("dd-progress-v1") ?? "{}").problems ?? {},
  );

/** Click a problem's checkbox, repeating until hydration has wired it up. */
async function check(row: Locator) {
  await row.scrollIntoViewIfNeeded();
  await expect(async () => {
    if (!/\bdone\b/.test((await row.getAttribute("class")) ?? "")) {
      await row.locator(".prob-check").click();
    }
    await expect(row).toHaveClass(/\bdone\b/, { timeout: 1000 });
  }).toPass({ timeout: 10_000 });
}

test("two tabs keep each other's checkmarks", async ({ context }) => {
  const a = await context.newPage();
  const b = await context.newPage();
  await a.goto(CHAPTER);
  await b.goto(CHAPTER);

  const first = (p: Page) => p.locator(".prob").nth(1);
  const second = (p: Page) => p.locator(".prob").nth(2);

  // Tab A checks one problem; tab B, already open, shows it without a reload.
  await check(first(a));
  await expect(first(b)).toHaveClass(/\bdone\b/);

  // Tab B checks another problem. A reload of tab A must keep both.
  await check(second(b));
  await a.reload();
  await expect(first(a)).toHaveClass(/\bdone\b/);
  await expect(second(a)).toHaveClass(/\bdone\b/);
  expect(Object.keys(await storedProblems(a))).toHaveLength(2);
});
