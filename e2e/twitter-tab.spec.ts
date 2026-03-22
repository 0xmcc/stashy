import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("hasSeenOnboarding", "true");
  });
  await page.goto("http://localhost:3001/");
});

test("elementFromPoint for twitter tab", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  const desktopSidebar = page
    .locator("aside")
    .filter({ hasText: "Saved Tweets Viewer" });
  const twitterItem = desktopSidebar.locator("button:has-text('Twitter')");

  const box = await twitterItem.boundingBox();
  if(!box) throw new Error("no box");
  
  // get element at the center of the twitter button
  const elementId = await page.evaluate(({x, y}) => {
    const el = document.elementFromPoint(x, y);
    return el ? el.outerHTML : null;
  }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });

  console.log("Element at center:", elementId);
  expect(elementId).toContain("<button"); // Should be a button
});
