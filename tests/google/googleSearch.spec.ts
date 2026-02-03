import { test, expect } from '@playwright/test';
import { GoogleHomePage } from '../../src/pages/GoogleHomePage';
import { dataManager } from '../../src/utils/DataManager';
import { logger } from '../../src/utils/Logger';

/**
 * Google Search Test Suite
 * Tests for Google home page and search functionality
 */
test.describe('Google Search Tests', () => {
  let googleHomePage: GoogleHomePage;

  test.beforeEach(async ({ page }) => {
    googleHomePage = new GoogleHomePage(page);
    await googleHomePage.navigateToGoogle();
    await googleHomePage.acceptCookiesIfPresent();
  });

  test('TC_GOOGLE_001: Verify Google home page loads successfully', async () => {
    logger.testStart('Verify Google Home Page');

    // Verify page loaded
    const isLoaded = await googleHomePage.verifyPageLoaded();
    expect(isLoaded).toBeTruthy();

    // Verify search input is visible
    const isSearchVisible = await googleHomePage.isSearchInputVisible();
    expect(isSearchVisible).toBeTruthy();

    // Verify page title
    const title = await googleHomePage.getTitle();
    expect(title.toLowerCase()).toContain('google');

    logger.testEnd('Verify Google Home Page', 'PASSED');
  });

  test('TC_GOOGLE_002: Perform basic search and verify results', async () => {
    logger.testStart('Basic Search Test');

    const searchQuery = 'Playwright automation testing';

    // Perform search
    await googleHomePage.search(searchQuery);

    // Verify URL contains search query
    const currentUrl = googleHomePage.getCurrentUrl();
    expect(currentUrl).toContain('search?q=');

    // Verify search results page loaded
    await googleHomePage.waitForPageLoad();

    logger.testEnd('Basic Search Test', 'PASSED');
  });

  test('TC_GOOGLE_003: Verify search suggestions appear', async ({ page }) => {
    logger.testStart('Search Suggestions Test');

    // Enter partial search query
    await googleHomePage.enterSearchQuery('playwright');
    
    // Wait for suggestions
    await page.waitForTimeout(1500);

    // Take screenshot of suggestions
    await googleHomePage.takeScreenshot('search_suggestions');

    logger.testEnd('Search Suggestions Test', 'PASSED');
  });

  test('TC_GOOGLE_004: Clear search input and verify', async () => {
    logger.testStart('Clear Search Input Test');

    // Enter search query
    await googleHomePage.enterSearchQuery('test query');

    // Verify input has value
    let inputValue = await googleHomePage.getSearchInputValue();
    expect(inputValue).toBe('test query');

    // Clear input
    await googleHomePage.clearSearchInput();

    // Verify input is empty
    inputValue = await googleHomePage.getSearchInputValue();
    expect(inputValue).toBe('');

    logger.testEnd('Clear Search Input Test', 'PASSED');
  });

  test('TC_GOOGLE_005: Navigate to Gmail from Google home', async ({ page }) => {
    logger.testStart('Navigate to Gmail Test');

    // Click Gmail link
    await googleHomePage.clickGmailLink();

    // Wait for navigation
    await page.waitForLoadState('load');

    // Verify navigated to Gmail or Google accounts
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/mail\.google|accounts\.google/);

    logger.testEnd('Navigate to Gmail Test', 'PASSED');
  });

  test('TC_GOOGLE_006: Navigate to Images from Google home', async ({ page }) => {
    logger.testStart('Navigate to Images Test');

    // Click Images link
    await googleHomePage.clickImagesLink();

    // Wait for navigation
    await page.waitForLoadState('load');

    // Verify navigated to Google Images
    const currentUrl = page.url();
    expect(currentUrl).toContain('imghp');

    logger.testEnd('Navigate to Images Test', 'PASSED');
  });

  test('TC_GOOGLE_007: Data-driven search test from Excel', async () => {
    logger.testStart('Data-Driven Search Test');

    // Get search test data from Excel
    const searchData = dataManager.getExecutableSearchData();

    // Skip if no data
    if (searchData.length === 0) {
      logger.warn('No search test data available. Skipping test.');
      test.skip();
      return;
    }

    for (const data of searchData) {
      logger.info(`Executing test case: ${data.testCaseId}`);

      // Navigate back to home
      await googleHomePage.navigateToGoogle();

      // Perform search
      await googleHomePage.search(data.searchQuery);

      // Verify results contain expected text
      const currentUrl = googleHomePage.getCurrentUrl();
      expect(currentUrl.toLowerCase()).toContain('search');

      logger.info(`Test case ${data.testCaseId} completed`);
    }

    logger.testEnd('Data-Driven Search Test', 'PASSED');
  });

  test('TC_GOOGLE_008: Search with special characters', async () => {
    logger.testStart('Special Characters Search Test');

    const specialQuery = 'playwright + typescript & automation';

    // Perform search with special characters
    await googleHomePage.enterSearchQuery(specialQuery);
    await googleHomePage.clickSearchButton();

    // Wait for results
    await googleHomePage.waitForPageLoad();

    // Verify search was performed
    const currentUrl = googleHomePage.getCurrentUrl();
    expect(currentUrl).toContain('search');

    logger.testEnd('Special Characters Search Test', 'PASSED');
  });

  test('TC_GOOGLE_009: Multiple searches in sequence', async () => {
    logger.testStart('Sequential Searches Test');

    const searchQueries = ['TypeScript', 'Node.js', 'Playwright test'];

    for (const query of searchQueries) {
      // Navigate to Google home
      await googleHomePage.navigateToGoogle();

      // Perform search
      await googleHomePage.search(query);

      // Verify results
      const currentUrl = googleHomePage.getCurrentUrl();
      expect(currentUrl).toContain('search');

      logger.info(`Search completed for: ${query}`);
    }

    logger.testEnd('Sequential Searches Test', 'PASSED');
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Take screenshot on failure
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = await googleHomePage.takeScreenshot(`failure_${testInfo.title}`);
      logger.error(`Test failed: ${testInfo.title}`, { screenshot: screenshotPath });
    }
  });
});
