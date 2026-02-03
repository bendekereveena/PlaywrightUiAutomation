import { Page, Locator, expect } from '@playwright/test';
import { logger } from '../utils/Logger';
import { CommonUtils } from '../utils/CommonUtils';
import { configManager } from '../utils/ConfigManager';

/**
 * BasePage Class
 * Abstract base class for all page objects
 * Implements common page methods and utilities
 */
export abstract class BasePage {
  protected page: Page;
  protected pageName: string;
  protected pageUrl: string;

  constructor(page: Page, pageName: string, pageUrl: string = '') {
    this.page = page;
    this.pageName = pageName;
    this.pageUrl = pageUrl;
  }

  /**
   * Navigate to page URL
   */
  async navigate(url?: string): Promise<void> {
    const targetUrl = url || this.pageUrl;
    logger.navigation(targetUrl);
    await this.page.goto(targetUrl);
    await this.waitForPageLoad();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('load');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click element
   */
  async click(locator: Locator, description?: string): Promise<void> {
    logger.action('Click', description || 'element');
    await locator.click();
  }

  /**
   * Fill input field
   */
  async fill(locator: Locator, value: string, description?: string): Promise<void> {
    logger.action(`Fill with "${value}"`, description || 'input');
    await locator.fill(value);
  }

  /**
   * Type text with delay (simulates real typing)
   */
  async type(locator: Locator, value: string, delay: number = 50): Promise<void> {
    await locator.type(value, { delay });
  }

  /**
   * Clear input field
   */
  async clear(locator: Locator): Promise<void> {
    await locator.clear();
  }

  /**
   * Get element text
   */
  async getText(locator: Locator): Promise<string> {
    return await locator.innerText();
  }

  /**
   * Get input value
   */
  async getValue(locator: Locator): Promise<string> {
    return await locator.inputValue();
  }

  /**
   * Get element attribute
   */
  async getAttribute(locator: Locator, attribute: string): Promise<string | null> {
    return await locator.getAttribute(attribute);
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
    const timeoutValue = timeout || configManager.getTimeouts().medium;
    await locator.waitFor({ state: 'visible', timeout: timeoutValue });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(locator: Locator, timeout?: number): Promise<void> {
    const timeoutValue = timeout || configManager.getTimeouts().medium;
    await locator.waitFor({ state: 'hidden', timeout: timeoutValue });
  }

  /**
   * Wait for element with custom timeout
   */
  async waitForElement(
    locator: Locator,
    state: 'attached' | 'detached' | 'visible' | 'hidden' = 'visible',
    timeout?: number
  ): Promise<void> {
    const timeoutValue = timeout || configManager.getTimeouts().medium;
    await locator.waitFor({ state, timeout: timeoutValue });
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Hover over element
   */
  async hover(locator: Locator): Promise<void> {
    await locator.hover();
  }

  /**
   * Double click element
   */
  async doubleClick(locator: Locator): Promise<void> {
    await locator.dblclick();
  }

  /**
   * Right click element
   */
  async rightClick(locator: Locator): Promise<void> {
    await locator.click({ button: 'right' });
  }

  /**
   * Press keyboard key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Select option from dropdown by value
   */
  async selectByValue(locator: Locator, value: string): Promise<void> {
    await locator.selectOption({ value });
  }

  /**
   * Select option from dropdown by label
   */
  async selectByLabel(locator: Locator, label: string): Promise<void> {
    await locator.selectOption({ label });
  }

  /**
   * Select option from dropdown by index
   */
  async selectByIndex(locator: Locator, index: number): Promise<void> {
    await locator.selectOption({ index });
  }

  /**
   * Check checkbox
   */
  async check(locator: Locator): Promise<void> {
    await locator.check();
  }

  /**
   * Uncheck checkbox
   */
  async uncheck(locator: Locator): Promise<void> {
    await locator.uncheck();
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name?: string): Promise<string> {
    const fileName = name || `${this.pageName}_${Date.now()}`;
    return await CommonUtils.takeScreenshot(this.page, fileName);
  }

  /**
   * Wait for URL to contain specific text
   */
  async waitForUrlContains(urlPart: string, timeout?: number): Promise<void> {
    const timeoutValue = timeout || configManager.getTimeouts().long;
    await this.page.waitForURL(`**/*${urlPart}*`, { timeout: timeoutValue });
  }

  /**
   * Assert element is visible
   */
  async assertVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  /**
   * Assert element text equals
   */
  async assertText(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toHaveText(expectedText);
  }

  /**
   * Assert element contains text
   */
  async assertContainsText(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toContainText(expectedText);
  }

  /**
   * Assert URL contains text
   */
  async assertUrlContains(text: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(text));
  }

  /**
   * Assert page title
   */
  async assertTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Assert page title contains
   */
  async assertTitleContains(text: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(text));
  }

  /**
   * Wait and retry click
   */
  async clickWithRetry(locator: Locator, maxRetries: number = 3): Promise<void> {
    await CommonUtils.waitAndClickWithRetry(locator, maxRetries);
  }

  /**
   * Sleep/delay
   */
  async sleep(ms: number): Promise<void> {
    await CommonUtils.sleep(ms);
  }

  /**
   * Get locator by role
   */
  getByRole(
    role: 'button' | 'checkbox' | 'link' | 'textbox' | 'heading' | 'combobox' | 'listbox' | 'option',
    options?: { name?: string | RegExp; exact?: boolean }
  ): Locator {
    return this.page.getByRole(role, options);
  }

  /**
   * Get locator by text
   */
  getByText(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByText(text, options);
  }

  /**
   * Get locator by label
   */
  getByLabel(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByLabel(text, options);
  }

  /**
   * Get locator by placeholder
   */
  getByPlaceholder(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByPlaceholder(text, options);
  }

  /**
   * Get locator by test ID
   */
  getByTestId(testId: string | RegExp): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Get locator by selector
   */
  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Frame locator
   */
  frameLocator(selector: string) {
    return this.page.frameLocator(selector);
  }

  /**
   * Get page instance
   */
  getPage(): Page {
    return this.page;
  }

  /**
   * Get page name
   */
  getPageName(): string {
    return this.pageName;
  }

  /**
   * Reload page
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Go forward
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
    await this.waitForPageLoad();
  }

  /**
   * Accept dialog
   */
  async acceptDialog(promptText?: string): Promise<void> {
    this.page.on('dialog', async (dialog) => {
      await dialog.accept(promptText);
    });
  }

  /**
   * Dismiss dialog
   */
  async dismissDialog(): Promise<void> {
    this.page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  }
}
