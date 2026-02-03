import { Page, Locator, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Wait Options Interface
 */
export interface WaitOptions {
  timeout?: number;
  state?: 'attached' | 'detached' | 'visible' | 'hidden';
}

/**
 * Screenshot Options Interface
 */
export interface ScreenshotOptions {
  fullPage?: boolean;
  path?: string;
  type?: 'png' | 'jpeg';
  quality?: number;
}

/**
 * CommonUtils Class
 * Collection of common utility functions for test automation
 */
export class CommonUtils {
  
  /**
   * Wait for element to be visible
   */
  static async waitForElementVisible(
    locator: Locator,
    timeout: number = 10000
  ): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  static async waitForElementHidden(
    locator: Locator,
    timeout: number = 10000
  ): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Wait for element to be attached to DOM
   */
  static async waitForElementAttached(
    locator: Locator,
    timeout: number = 10000
  ): Promise<void> {
    await locator.waitFor({ state: 'attached', timeout });
  }

  /**
   * Safe click - waits for element to be visible before clicking
   */
  static async safeClick(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.click();
  }

  /**
   * Safe fill - clears and fills input field
   */
  static async safeFill(
    locator: Locator,
    value: string,
    timeout: number = 10000
  ): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Safe type - types text character by character (simulates real typing)
   */
  static async safeType(
    locator: Locator,
    value: string,
    delay: number = 50,
    timeout: number = 10000
  ): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.clear();
    await locator.type(value, { delay });
  }

  /**
   * Wait for page load
   */
  static async waitForPageLoad(page: Page, timeout: number = 30000): Promise<void> {
    await page.waitForLoadState('load', { timeout });
    await page.waitForLoadState('domcontentloaded', { timeout });
  }

  /**
   * Wait for network idle
   */
  static async waitForNetworkIdle(page: Page, timeout: number = 30000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Wait for URL to contain specific string
   */
  static async waitForUrlContains(
    page: Page,
    urlPart: string,
    timeout: number = 30000
  ): Promise<void> {
    await page.waitForURL(`**/*${urlPart}*`, { timeout });
  }

  /**
   * Take screenshot
   */
  static async takeScreenshot(
    page: Page,
    fileName: string,
    options: ScreenshotOptions = {}
  ): Promise<string> {
    const screenshotDir = path.join(process.cwd(), 'screenshots');
    
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(screenshotDir, `${fileName}_${timestamp}.png`);

    await page.screenshot({
      path: screenshotPath,
      fullPage: options.fullPage ?? true,
      type: options.type ?? 'png',
    });

    console.log(`Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  /**
   * Scroll to element
   */
  static async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Scroll to bottom of page
   */
  static async scrollToBottom(page: Page): Promise<void> {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  /**
   * Scroll to top of page
   */
  static async scrollToTop(page: Page): Promise<void> {
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }

  /**
   * Get element text
   */
  static async getElementText(locator: Locator): Promise<string> {
    return await locator.innerText();
  }

  /**
   * Get element attribute
   */
  static async getElementAttribute(
    locator: Locator,
    attribute: string
  ): Promise<string | null> {
    return await locator.getAttribute(attribute);
  }

  /**
   * Check if element is visible
   */
  static async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  static async isElementEnabled(locator: Locator): Promise<boolean> {
    try {
      return await locator.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Wait and click with retry
   */
  static async waitAndClickWithRetry(
    locator: Locator,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await locator.click({ timeout: 5000 });
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  /**
   * Select dropdown option by value
   */
  static async selectByValue(locator: Locator, value: string): Promise<void> {
    await locator.selectOption({ value });
  }

  /**
   * Select dropdown option by label
   */
  static async selectByLabel(locator: Locator, label: string): Promise<void> {
    await locator.selectOption({ label });
  }

  /**
   * Select dropdown option by index
   */
  static async selectByIndex(locator: Locator, index: number): Promise<void> {
    await locator.selectOption({ index });
  }

  /**
   * Handle alert/confirm/prompt dialogs
   */
  static async handleDialog(
    page: Page,
    action: 'accept' | 'dismiss',
    promptText?: string
  ): Promise<void> {
    page.on('dialog', async (dialog) => {
      if (action === 'accept') {
        await dialog.accept(promptText);
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Get current page URL
   */
  static getCurrentUrl(page: Page): string {
    return page.url();
  }

  /**
   * Get page title
   */
  static async getPageTitle(page: Page): Promise<string> {
    return await page.title();
  }

  /**
   * Switch to new tab/window
   */
  static async switchToNewTab(page: Page): Promise<Page> {
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
    ]);
    await newPage.waitForLoadState();
    return newPage;
  }

  /**
   * Close current tab
   */
  static async closeCurrentTab(page: Page): Promise<void> {
    await page.close();
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random email
   */
  static generateRandomEmail(domain: string = 'test.com'): string {
    const randomPart = this.generateRandomString(8).toLowerCase();
    const timestamp = Date.now();
    return `${randomPart}${timestamp}@${domain}`;
  }

  /**
   * Sleep/delay execution
   */
  static async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Format date to string
   */
  static formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day);
  }

  /**
   * Get current timestamp
   */
  static getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Create directory if not exists
   */
  static createDirectoryIfNotExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Read JSON file
   */
  static readJsonFile<T>(filePath: string): T {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  }

  /**
   * Write JSON file
   */
  static writeJsonFile(filePath: string, data: object): void {
    const dir = path.dirname(filePath);
    this.createDirectoryIfNotExists(dir);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Highlight element (for debugging)
   */
  static async highlightElement(locator: Locator, duration: number = 2000): Promise<void> {
    await locator.evaluate((element, dur) => {
      const originalStyle = element.getAttribute('style') || '';
      element.setAttribute('style', `${originalStyle}; border: 3px solid red !important; background-color: yellow !important;`);
      setTimeout(() => {
        element.setAttribute('style', originalStyle);
      }, dur);
    }, duration);
  }

  /**
   * Get all links on page
   */
  static async getAllLinks(page: Page): Promise<string[]> {
    return await page.$$eval('a[href]', (elements) =>
      elements.map((el) => el.getAttribute('href') || '')
    );
  }

  /**
   * Check if page has specific text
   */
  static async pageContainsText(page: Page, text: string): Promise<boolean> {
    const content = await page.content();
    return content.includes(text);
  }

  /**
   * Retry function execution
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Assert element text equals expected
   */
  static async assertTextEquals(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toHaveText(expectedText);
  }

  /**
   * Assert element contains text
   */
  static async assertTextContains(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toContainText(expectedText);
  }

  /**
   * Assert element is visible
   */
  static async assertVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  /**
   * Assert element is hidden
   */
  static async assertHidden(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden();
  }

  /**
   * Assert URL contains text
   */
  static async assertUrlContains(page: Page, text: string): Promise<void> {
    await expect(page).toHaveURL(new RegExp(text));
  }
}

// Export utility functions for direct use
export const {
  waitForElementVisible,
  waitForElementHidden,
  safeClick,
  safeFill,
  safeType,
  waitForPageLoad,
  waitForNetworkIdle,
  takeScreenshot,
  scrollToElement,
  sleep,
  generateRandomString,
  generateRandomEmail,
  retry,
} = CommonUtils;
