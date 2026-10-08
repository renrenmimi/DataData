// Every chapter has its own tab title, in the reader's language, and a path
// outside the course is a real 404 that does not pretend to be the prologue.

import { expect, test } from "@playwright/test";

const ROUTES = ["/array", "/linked-list", "/bst", "/graph", "/atlas"];

test("each chapter has a distinct title", async ({ page }) => {
  const titles: string[] = [];
  for (const route of ROUTES) {
    await page.goto(route);
    const title = await page.title();
    expect(title).toMatch(/ · DataData$/);
    titles.push(title);
  }
  expect(new Set(titles).size).toBe(ROUTES.length);
});

test("a Chinese reader's tab stays in Chinese across navigation", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("dd-lang", "zh"));
  await page.goto("/array");
  // Next.js rewrites the English title when its metadata hydrates; wait that out
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveTitle("数组 · DataData");
  await page.locator('.side-link[href="/bst"]').click();
  await expect(page).toHaveURL(/\/bst$/);
  await expect(page).toHaveTitle("二叉搜索树 · DataData");
  await page.locator('.side-link[href="/"]').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page).toHaveTitle("DataData · 看得见的数据结构");
  await page.goto("/no-such-chapter");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveTitle("页面不存在 · DataData");
});

test("switching the interface language retitles the tab", async ({ page }) => {
  await page.goto("/heap");
  await expect(page).toHaveTitle("Heap & Priority Queue · DataData");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page).toHaveTitle("堆与优先队列 · DataData");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page).toHaveTitle("Heap & Priority Queue · DataData");
});

test("an unknown path is a 404 with its own breadcrumb", async ({ page }) => {
  const response = await page.goto("/no-such-chapter");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page does not exist");
  await expect(page.locator(".tb-crumb")).toContainText("Page not found");
  await expect(page.locator('.side-link[aria-current="page"]')).toHaveCount(0);
  await expect(page).toHaveTitle("Page not found · DataData");
});
