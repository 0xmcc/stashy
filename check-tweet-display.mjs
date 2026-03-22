import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    channel: undefined
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to localhost:3000...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n=== Checking for data source toggle ===');
    const toggleVisible = await page.locator('text=/Saved Tweets|X Bookmarks/i').first().isVisible().catch(() => false);
    console.log('Data source toggle visible:', toggleVisible);

    console.log('\n=== Looking for tweets with t.co links ===');
    const tweetCards = await page.locator('[data-testid="tweet-card"]').all();
    console.log(`Found ${tweetCards.length} tweet cards`);

    let foundTcoTweet = false;
    for (let i = 0; i < Math.min(tweetCards.length, 10); i++) {
      const tweetCard = tweetCards[i];
      const text = await tweetCard.textContent();
      
      if (text && text.includes('t.co/')) {
        console.log(`\n=== Tweet ${i + 1} contains t.co link ===`);
        console.log('Tweet text preview:', text.slice(0, 150));
        
        // Check if LinkCard preview exists
        const linkCardExists = await tweetCard.locator('[class*="link"]').count() > 0;
        console.log('LinkCard preview exists:', linkCardExists);
        
        // Look for JSON inspector button
        const jsonButton = tweetCard.locator('button[title*="JSON"], button[aria-label*="JSON"], [data-testid="json-inspector"]');
        const jsonButtonExists = await jsonButton.count() > 0;
        console.log('JSON inspector button exists:', jsonButtonExists);
        
        if (jsonButtonExists) {
          console.log('Clicking JSON inspector...');
          await jsonButton.first().click();
          await page.waitForTimeout(500);
          
          // Look for JSON content
          const jsonContent = await page.locator('pre, code, [class*="json"]').first().textContent({ timeout: 2000 }).catch(() => null);
          
          if (jsonContent) {
            const hasArticle = jsonContent.includes('"article"') || jsonContent.includes('article');
            const hasTitle = jsonContent.includes('"title"') && jsonContent.includes('://');
            console.log('Raw JSON contains "article":', hasArticle);
            console.log('Raw JSON contains article title:', hasTitle);
            
            if (hasTitle) {
              const titleMatch = jsonContent.match(/"title"\s*:\s*"([^"]{0,100})/);
              if (titleMatch) {
                console.log('Article title in JSON:', titleMatch[1]);
              }
            }
          }
          
          // Close modal if open
          const closeButton = page.locator('button[aria-label="Close"], button:has-text("Close")');
          if (await closeButton.count() > 0) {
            await closeButton.first().click();
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

    console.log('\n=== Check complete - press Ctrl+C to close browser ===');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
