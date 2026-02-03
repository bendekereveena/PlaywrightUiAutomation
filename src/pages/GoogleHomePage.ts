import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/Logger';

/**
 * GoogleHomePage Class
 * Page Object for Google Home Page
 */
export class GoogleHomePage extends BasePage {
  // Locators
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly luckyButton: Locator;
  private readonly gmailLink: Locator;
  private readonly imagesLink: Locator;
  private readonly signInButton: Locator;
  private readonly googleAppsButton: Locator;
  private readonly googleLogo: Locator;
  private readonly searchSuggestions: Locator;

  constructor(page: Page) {
    super(page, 'GoogleHomePage', 'https://www.google.com');

    // Initialize locators
    this.searchInput = page.locator('textarea[name="q"], input[name="q"]');
    this.searchButton = page.locator('input[name="btnK"], button[name="btnK"]');
    this.luckyButton = page.locator('input[name="btnI"]');
    this.gmailLink = page.locator('a[href*="mail.google"]').first();
    this.imagesLink = page.locator('a[href*="imghp"]');
    this.signInButton = page.locator('a[href*="accounts.google.com"]').first();
    this.googleAppsButton = page.locator('[aria-label="Google apps"]');
    this.googleLogo = page.locator('img[alt="Google"]');
    this.searchSuggestions = page.locator('[role="listbox"] li');
  }

  /**
   * Navigate to Google home page
   */
  async navigateToGoogle(): Promise<void> {
    logger.step(1, 'Navigate to Google home page');
    await this.navigate();
    await this.waitForPageLoad();
  }

  /**
   * Check if Google logo is visible
   */
  async isGoogleLogoVisible(): Promise<boolean> {
    return await this.isVisible(this.googleLogo);
  }

  /**
   * Enter search query
   */
  async enterSearchQuery(query: string): Promise<void> {
    logger.step(2, `Enter search query: ${query}`);
    await this.waitForVisible(this.searchInput);
    await this.fill(this.searchInput, query, 'Search Input');
  }

  /**
   * Click search button
   */
  async clickSearchButton(): Promise<void> {
    logger.step(3, 'Click search button');
    // Wait for suggestions to appear and then click search
    await this.sleep(500);
    await this.pressKey('Enter');
  }

  /**
   * Perform search
   */
  async search(query: string): Promise<void> {
    await this.enterSearchQuery(query);
    await this.clickSearchButton();
    await this.waitForSearchResults();
  }

  /**
   * Wait for search results to load
   */
  async waitForSearchResults(): Promise<void> {
    logger.step(4, 'Wait for search results');
    await this.waitForUrlContains('search?q=');
    await this.waitForPageLoad();
  }

  /**
   * Click I'm Feeling Lucky button
   */
  async clickImFeelingLucky(): Promise<void> {
    logger.action('Click', "I'm Feeling Lucky button");
    await this.click(this.luckyButton);
  }

  /**
   * Click Gmail link
   */
  async clickGmailLink(): Promise<void> {
    logger.action('Click', 'Gmail link');
    await this.click(this.gmailLink);
  }

  /**
   * Click Images link
   */
  async clickImagesLink(): Promise<void> {
    logger.action('Click', 'Images link');
    await this.click(this.imagesLink);
  }

  /**
   * Click Sign In button
   */
  async clickSignIn(): Promise<void> {
    logger.action('Click', 'Sign In button');
    await this.click(this.signInButton);
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(): Promise<string[]> {
    await this.waitForVisible(this.searchSuggestions.first());
    const suggestions = await this.searchSuggestions.allInnerTexts();
    return suggestions;
  }

  /**
   * Select suggestion by index
   */
  async selectSuggestionByIndex(index: number): Promise<void> {
    const suggestion = this.searchSuggestions.nth(index);
    await this.click(suggestion);
  }

  /**
   * Clear search input
   */
  async clearSearchInput(): Promise<void> {
    await this.clear(this.searchInput);
  }

  /**
   * Get search input value
   */
  async getSearchInputValue(): Promise<string> {
    return await this.getValue(this.searchInput);
  }

  /**
   * Is search input visible
   */
  async isSearchInputVisible(): Promise<boolean> {
    return await this.isVisible(this.searchInput);
  }

  /**
   * Open Google Apps menu
   */
  async openGoogleApps(): Promise<void> {
    await this.click(this.googleAppsButton);
    await this.sleep(500);
  }

  /**
   * Verify Google home page loaded
   */
  async verifyPageLoaded(): Promise<boolean> {
    try {
      await this.waitForVisible(this.searchInput);
      const title = await this.getTitle();
      return title.toLowerCase().includes('google');
    } catch {
      return false;
    }
  }

  /**
   * Accept cookies if dialog appears
   */
  async acceptCookiesIfPresent(): Promise<void> {
    try {
      const acceptButton = this.page.locator('button:has-text("Accept all"), button:has-text("I agree")');
      const isVisible = await acceptButton.isVisible({ timeout: 3000 });
      if (isVisible) {
        await this.click(acceptButton);
        logger.info('Accepted cookies dialog');
      }
    } catch {
      // Cookie dialog not present, continue
    }
  }
}
