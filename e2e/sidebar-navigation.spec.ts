import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("hasSeenOnboarding", "true");
  });
  await page.goto("/");
});

test("sidebar tabs remain clickable after opening semantic search on md layout", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });

  const desktopSidebar = page
    .locator("aside")
    .filter({ hasText: "Saved Tweets Viewer" });
  const sidebarButtons = desktopSidebar.locator("nav button");

  // Switch to Twitter first.
  await sidebarButtons.nth(1).click();
  await expect(page.getByRole("button", { name: "Semantic Search" })).toBeVisible();

  // Open semantic panel and expand sidebar.
  await page.getByRole("button", { name: "Semantic Search" }).click();
  await desktopSidebar.hover();

  // Click in the label area of the Facebook button (not icon area).
  await sidebarButtons.nth(2).click({ position: { x: 170, y: 20 } });

  // Facebook view marker.
  await expect(page.getByRole("button", { name: "What's on your mind?" })).toBeVisible();
});
