// End-to-end coverage for predict mode on a real chapter page.
//
// Option order is pinned by replacing Math.random before any script runs. The
// shuffle in lib/predict.ts is a Fisher-Yates pass, so with Math.random() === 0
// every element is swapped to the front in turn and the correct answer — which
// enters the list first — always ends up last. The first assertion in the flow
// checks that invariant, so if the shuffle ever changes this test says so
// instead of silently picking the wrong option.

import { expect, test, type Locator, type Page } from "@playwright/test";

/** The array chapter's first walkthrough (LC 283) is a frame-based stepper. */
const CHAPTER = "/array";

const panel = (page: Page) => page.locator(".pf-panel");
const optionsOf = (page: Page) => panel(page).locator(".pf-opt");
const scoreChip = (stepper: Locator) => stepper.locator(".pf-score");

/** The first stepper on the page that offers predict mode. */
function firstPredictStepper(page: Page): Locator {
  return page.locator(".viz").filter({ has: page.locator(".pf-toggle") }).first();
}

async function pinOptionOrder(page: Page) {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
}

async function openStepper(page: Page): Promise<Locator> {
  await page.goto(CHAPTER);
  const stepper = firstPredictStepper(page);
  await stepper.scrollIntoViewIfNeeded();
  await expect(stepper).toBeVisible();
  return stepper;
}

/** Turn predict mode on and open a question. */
async function askQuestion(stepper: Locator) {
  const toggle = stepper.locator(".pf-toggle");
  if ((await toggle.getAttribute("aria-pressed")) !== "true") {
    await toggle.click();
  }
  await stepper.locator(".viz-ctl button").nth(2).click(); // Next
  await expect(stepper.locator(".pf-panel")).toBeVisible();
}

test.describe("predict mode", () => {
  test("a learner answers wrong, then right, and the score follows them across a language switch", async ({
    page,
  }) => {
    await pinOptionOrder(page);
    const stepper = await openStepper(page);

    // --- enable Predict -------------------------------------------------
    const toggle = stepper.locator(".pf-toggle");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    // Autoplay is off-limits while predicting, so a question cannot be skipped.
    await expect(stepper.locator(".viz-ctl button").nth(1)).toBeDisabled();

    // --- press Next: a question appears instead of the next frame -------
    const frameCounter = stepper.locator(".viz-ctl [aria-live]");
    await expect(frameCounter).toHaveText("1 / 7");
    await stepper.locator(".viz-ctl button").nth(2).click();
    await expect(panel(page)).toBeVisible();
    await expect(frameCounter).toHaveText("1 / 7", { timeout: 2000 });

    const options = optionsOf(page);
    await expect(options).toHaveCount(3);
    // Every option describes its board for a screen reader.
    for (const label of await options.evaluateAll((els) =>
      els.map((e) => e.getAttribute("aria-label") ?? ""),
    )) {
      expect(label).toMatch(/^Option [A-C] — cells: /);
    }

    // --- choose an incorrect option -------------------------------------
    await options.first().click();
    await expect(options.first()).toHaveClass(/wrong/);
    // The pinned shuffle puts the answer last; assert it so a change is loud.
    await expect(options.last()).toHaveClass(/right/);

    // --- verify feedback -------------------------------------------------
    const feedback = panel(page).locator(".pf-feedback");
    await expect(feedback).toHaveClass(/no/);
    await expect(feedback).toContainText("Not quite");
    // The verdict names which axis was wrong rather than saying "incorrect".
    await expect(feedback).toContainText(/cells|pointers/);
    await expect(scoreChip(stepper)).toHaveText("0/1");

    // A second pick is refused: the question is already answered.
    await expect(options.last()).toBeDisabled();

    // --- reveal and continue --------------------------------------------
    await feedback.getByRole("button", { name: /Reveal & continue/ }).click();
    await expect(panel(page)).toBeHidden();
    await expect(frameCounter).toHaveText("2 / 7");

    // --- answer a correct option -----------------------------------------
    await askQuestion(stepper);
    await optionsOf(page).last().click();
    await expect(optionsOf(page).last()).toHaveClass(/right/);
    const secondFeedback = panel(page).locator(".pf-feedback");
    await expect(secondFeedback).toHaveClass(/ok/);
    await expect(secondFeedback).toContainText("Correct");

    // --- verify the score -------------------------------------------------
    await expect(scoreChip(stepper)).toHaveText("1/2");

    await secondFeedback.getByRole("button", { name: /Reveal & continue/ }).click();
    await expect(frameCounter).toHaveText("3 / 7");

    // --- switch language ---------------------------------------------------
    await page.getByRole("button", { name: "中文" }).click();
    await expect(stepper.locator(".pf-toggle")).toContainText("预测模式");
    // A language switch is not a new demo, so the score stays.
    await expect(scoreChip(stepper)).toHaveText("1/2");

    // --- verify the interaction remains usable ------------------------------
    await stepper.locator(".viz-ctl button").nth(2).click();
    await expect(panel(page)).toBeVisible();
    await expect(panel(page)).toContainText("预测");
    const zhOptions = optionsOf(page);
    await expect(zhOptions).toHaveCount(3);
    await expect(zhOptions.first()).toHaveAttribute("aria-label", /^选项 [A-C] — 格子:/);

    await zhOptions.last().click();
    await expect(panel(page).locator(".pf-feedback")).toHaveClass(/ok/);
    await expect(panel(page).locator(".pf-feedback")).toContainText("预测正确");
    await expect(scoreChip(stepper)).toHaveText("2/3");

    await panel(page)
      .locator(".pf-feedback")
      .getByRole("button", { name: /揭晓并继续/ })
      .click();
    await expect(panel(page)).toBeHidden();
    await expect(frameCounter).toHaveText("4 / 7");
  });

  test("(9) autoplay is unavailable while predicting and returns when predict is off", async ({
    page,
  }) => {
    const stepper = await openStepper(page);
    const play = stepper.locator(".viz-ctl button").nth(1);
    await expect(play).toBeEnabled();

    await stepper.locator(".pf-toggle").click();
    await expect(play).toBeDisabled();

    await stepper.locator(".pf-toggle").click();
    await expect(play).toBeEnabled();
  });

  test("(10) stepping back discards an unanswered question", async ({ page }) => {
    await pinOptionOrder(page);
    const stepper = await openStepper(page);
    const frameCounter = stepper.locator(".viz-ctl [aria-live]");

    // Move off the first frame so Back is available.
    await stepper.locator(".viz-ctl button").nth(2).click();
    await expect(frameCounter).toHaveText("2 / 7");

    await askQuestion(stepper);
    await stepper.locator(".viz-ctl button").first().click(); // Back
    await expect(panel(page)).toBeHidden();
    await expect(frameCounter).toHaveText("1 / 7");
  });
});

test.describe("(15) narrow layout", () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test("the panel and its mini boards stay inside a 360px viewport", async ({ page }) => {
    await pinOptionOrder(page);
    const stepper = await openStepper(page);
    await askQuestion(stepper);

    const viewportWidth = page.viewportSize()!.width;

    // The page itself must not gain a horizontal scrollbar.
    const docOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(docOverflow, "document should not scroll horizontally").toBeLessThanOrEqual(1);

    // The panel fits.
    const panelBox = await panel(page).boundingBox();
    expect(panelBox).not.toBeNull();
    expect(panelBox!.x).toBeGreaterThanOrEqual(0);
    expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(viewportWidth + 1);

    // Each option fits, and stacks into a single column at this width.
    const options = optionsOf(page);
    await expect(options).toHaveCount(3);
    const boxes = [];
    for (let i = 0; i < 3; i++) {
      const box = await options.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth + 1);
      boxes.push(box!);
    }
    expect(new Set(boxes.map((b) => Math.round(b.x))).size, "options stack in one column").toBe(1);

    // A mini board is either narrower than its option or reachable by scrolling
    // inside it — never clipped with no way to see the rest.
    const boards = await optionsOf(page).evaluateAll((els) =>
      els.map((el) => {
        const board = el.querySelector(".pf-board") as HTMLElement | null;
        return {
          boardWidth: board?.getBoundingClientRect().width ?? 0,
          clientWidth: el.clientWidth,
          scrollWidth: el.scrollWidth,
          overflowX: getComputedStyle(el).overflowX,
        };
      }),
    );
    for (const b of boards) {
      expect(b.boardWidth).toBeGreaterThan(0);
      if (b.scrollWidth > b.clientWidth + 1) {
        expect(b.overflowX, "an over-wide board must be scrollable").toMatch(/auto|scroll/);
      }
    }

    // Answering still works at this width.
    await optionsOf(page).first().click();
    await expect(panel(page).locator(".pf-feedback")).toBeVisible();
    const feedbackBox = await panel(page).locator(".pf-feedback").boundingBox();
    expect(feedbackBox!.x + feedbackBox!.width).toBeLessThanOrEqual(viewportWidth + 1);
  });
});
