// The workbench shell: the sidebar as a phone drawer and as a collapsible
// desktop column, the skip link, and the command palette, driven by keyboard.

import { expect, test, type Page } from "@playwright/test";

const CHAPTER = "/array";

const focusedInside = (page: Page, selector: string) =>
  page.evaluate((s) => !!document.activeElement?.closest(s), selector);

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("the closed drawer is skipped by Tab; the open one holds focus until Escape", async ({
    page,
  }) => {
    await page.goto(CHAPTER);
    // Hydrated once the off-screen drawer has been made inert
    await expect(page.locator("#sidebar")).toHaveAttribute("inert", "");

    await page.keyboard.press("Tab");
    await expect(page.locator(".skip-link")).toBeFocused();
    await page.keyboard.press("Tab");
    const toggle = page.locator("#sidebar-toggle");
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    // Open: focus moves into the drawer, the page behind is inert and locked
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect.poll(() => focusedInside(page, "#sidebar")).toBe(true);
    await expect(page.locator(".shell-main")).toHaveAttribute("inert", "");
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      expect(await focusedInside(page, ".shell-main")).toBe(false);
    }
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.scrollY)).toBe(before);

    // Escape closes and returns focus to the menu button
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await expect(page.locator(".shell-main")).not.toHaveAttribute("inert", "");
  });
});

test.describe("on a desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("a collapsed sidebar takes its links out of the tab order", async ({ page }) => {
    await page.goto(CHAPTER);
    const toggle = page.locator("#sidebar-toggle");
    const sidebar = page.locator("#sidebar");
    await expect(async () => {
      await toggle.click();
      await expect(sidebar).toHaveAttribute("inert", "", { timeout: 1000 });
    }).toPass({ timeout: 10_000 });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    // Expand again for the next test run in the same storage
    await toggle.click();
    await expect(sidebar).not.toHaveAttribute("inert", "");
  });

  test("the command palette is modal and gives focus back on Escape", async ({ page }) => {
    await page.goto(CHAPTER);
    const jump = page.getByRole("button", { name: "Open command palette" });
    const dialog = page.getByRole("dialog", { name: "Quick jump" });
    await expect(async () => {
      await jump.click();
      await expect(dialog).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10_000 });

    await expect(dialog).toHaveAttribute("aria-modal", "true");
    const box = page.getByRole("combobox");
    await expect(box).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(box).toHaveAttribute("aria-activedescendant", /cmdk-opt-/);
    await page.keyboard.press("Tab");
    await expect(box).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(jump).toBeFocused();
  });
});
