// The problem list on a real chapter page: completion is reachable from the
// keyboard and the checkbox is easy to hit on a phone.

import { expect, test, type Locator, type Page } from "@playwright/test";

/** The linked-list chapter's second problem is LC 203. */
const CHAPTER = "/linked-list";

const storedProblems = (page: Page) =>
  page.evaluate(
    () => JSON.parse(localStorage.getItem("dd-progress-v1") ?? "{}").problems ?? {},
  );

/**
 * Hydration finishes a moment after the load event, and a key press before it
 * is lost. Repeat the action until the page reacts; the assertion inside
 * guards against acting twice.
 */
async function untilHydrated(action: () => Promise<void>, check: () => Promise<void>) {
  await expect(async () => {
    await action();
    await check();
  }).toPass({ timeout: 10_000 });
}

test.describe("problem list", () => {
  test("a keyboard user can mark a problem as done", async ({ page }) => {
    await page.goto(CHAPTER);
    const row = page.locator(".prob").nth(1);
    const box: Locator = row.getByRole("checkbox", { name: "Mark LC 203 as done" });
    await box.scrollIntoViewIfNeeded();

    await untilHydrated(
      async () => {
        await box.focus();
        await page.keyboard.press("Space");
      },
      async () => expect(box).toHaveAttribute("aria-checked", "true", { timeout: 1000 }),
    );
    // Space recorded the problem and did not expand the row.
    await expect(row).not.toHaveClass(/open/);
    expect(await storedProblems(page)).toHaveProperty(["linked-list/203"], 1);

    // Enter on the title expands it; completion is unaffected.
    await row.locator(".prob-toggle").focus();
    await page.keyboard.press("Enter");
    await expect(row).toHaveClass(/open/);
    await expect(box).toHaveAttribute("aria-checked", "true");
  });

  test.describe("on a phone", () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

    test("the checkbox accepts a tap just outside its 20px box", async ({ page }) => {
      await page.goto(CHAPTER);
      const row = page.locator(".prob").first();
      const box = row.getByRole("checkbox");
      await box.scrollIntoViewIfNeeded();
      const rect = await box.boundingBox();
      expect(rect).not.toBeNull();

      await untilHydrated(
        // 5px left of the visible box: inside the enlarged hit area
        async () => page.touchscreen.tap(rect!.x - 5, rect!.y + rect!.height / 2),
        async () => expect(box).toHaveAttribute("aria-checked", "true", { timeout: 1000 }),
      );
      await expect(row).not.toHaveClass(/open/);
    });
  });
});
