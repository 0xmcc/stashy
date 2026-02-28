import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("hasSeenOnboarding", "true");
  });
  await page.goto("/");
});

test("check tweets with t.co links for article data and LinkCard preview", async ({ page }) => {
  console.log('\n=== Checking page load ===');
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Take a screenshot to see what loaded
  await page.screenshot({ path: 'page-loaded.png', fullPage: true });
  console.log('Screenshot saved as page-loaded.png');
  
  // Check if data source toggle is visible
  const toggleButton = page.locator('button').filter({ hasText: /Saved Tweets|X Bookmarks/i }).first();
  const toggleVisible = await toggleButton.isVisible().catch(() => false);
  console.log('Data source toggle visible:', toggleVisible);
  
  if (toggleVisible) {
    const toggleText = await toggleButton.textContent();
    console.log('Toggle text:', toggleText);
  }
  
  console.log('\n=== Looking for tweets ===');
  
  // Try different selectors
  const articleCount = await page.locator('article').count();
  console.log(`Found ${articleCount} article elements`);
  
  if (articleCount === 0) {
    console.log('No tweets found. Page might require authentication or data.');
    return;
  }
  
  const articles = await page.locator('article').all();
  
  let foundTcoTweet = false;
  
  for (let i = 0; i < Math.min(articles.length, 10); i++) {
    const article = articles[i];
    const text = await article.textContent();
    
    if (text && text.includes('t.co/')) {
      console.log(`\n=== Tweet ${i + 1} contains t.co link ===`);
      console.log('Tweet text preview:', text.slice(0, 200).replace(/\n/g, ' '));
      
      // Check for LinkCard component (it might have class or specific structure)
      const hasLinkCard = await article.locator('div').filter({ hasText: /https?:\/\// }).count() > 0;
      console.log('Has link/card element:', hasLinkCard);
      
      // Look for JSON inspector button
      const jsonButton = article.locator('button').filter({ hasText: /JSON|json|\{/ }).first();
      const jsonButtonVisible = await jsonButton.isVisible().catch(() => false);
      
      if (jsonButtonVisible) {
        console.log('JSON inspector button found, clicking...');
        await jsonButton.click();
        await page.waitForTimeout(1000);
        
        // Look for the popover with JSON
        const jsonPopover = page.locator('[data-testid="tweet-json-popover"]');
        if (await jsonPopover.isVisible({ timeout: 2000 }).catch(() => false)) {
          const jsonContent = await jsonPopover.textContent();
          
          if (jsonContent) {
            const hasArticle = jsonContent.includes('"article"');
            const hasTitle = jsonContent.includes('"title"');
            console.log('Raw JSON contains "article":', hasArticle);
            console.log('Raw JSON contains "title":', hasTitle);
            
            if (hasTitle) {
              const titleMatch = jsonContent.match(/"title"\s*:\s*"([^"]{1,150})/);
              if (titleMatch) {
                console.log('Article title in JSON:', titleMatch[1]);
              }
            }
          }
          
          // Close popover
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }
        
        foundTcoTweet = true;
        break;
      }
    }
  }
  
  if (!foundTcoTweet) {
    console.log('\nNo tweets with t.co links found in first 10 tweets');
  }
});
