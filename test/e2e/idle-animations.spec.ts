// An idle page loops no animation on the main thread. The aurora's drift is a
// transform animation the compositor runs on its own; anything else that loops
// forever must be paused while it cannot be seen.

import { expect, test, type Page } from "@playwright/test";

const looping = (page: Page) =>
  page.evaluate(() =>
    [
      ...new Set(
        document
          .getAnimations()
          .filter(
            (a) => a.playState === "running" && a.effect?.getTiming().iterations === Infinity,
          )
          .map((a) => (a as CSSAnimation).animationName),
      ),
    ].sort(),
  );

test("chapter pages loop nothing but the aurora", async ({ page }) => {
  for (const route of ["/array", "/heap", "/graph"]) {
    await page.goto(route);
    expect(await looping(page), route).toEqual(["drift-a", "drift-b"]);
  }
});

test("the home page pauses its figures once they are scrolled away", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => looping(page)).toEqual(["drift-a", "drift-b"]);
});

test.describe("with reduced motion", () => {
  test("the home-page morph starts paused", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Play the shape animation" })).toBeVisible();
    await page.waitForTimeout(3500);
    await expect(page.locator(".hm-caption-zh")).toHaveText("Array");
  });
});
