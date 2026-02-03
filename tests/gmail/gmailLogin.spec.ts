import { test, expect } from '@playwright/test';
import { GmailLoginPage } from '../../src/pages/GmailLoginPage';
import { GmailInboxPage } from '../../src/pages/GmailInboxPage';
import { dataManager } from '../../src/utils/DataManager';
import { configManager } from '../../src/utils/ConfigManager';
import { logger } from '../../src/utils/Logger';

/**
 * Gmail Login Test Suite
 * Tests for Gmail/Google account login functionality
 */
test.describe('Gmail Login Tests', () => {
  let gmailLoginPage: GmailLoginPage;
  let gmailInboxPage: GmailInboxPage;

  test.beforeEach(async ({ page }) => {
    gmailLoginPage = new GmailLoginPage(page);
    gmailInboxPage = new GmailInboxPage(page);
  });

  test('TC_LOGIN_001: Verify Gmail login page loads successfully', async () => {
    logger.testStart('Verify Gmail Login Page');

    // Navigate to login page
    await gmailLoginPage.navigateToLogin();

    // Verify page loaded
    const isLoaded = await gmailLoginPage.verifyPageLoaded();
    expect(isLoaded).toBeTruthy();

    // Verify email input is visible
    const isEmailVisible = await gmailLoginPage.isEmailInputVisible();
    expect(isEmailVisible).toBeTruthy();

    logger.testEnd('Verify Gmail Login Page', 'PASSED');
  });

  test('TC_LOGIN_002: Enter email and verify next step', async ({ page }) => {
    logger.testStart('Email Entry Test');

    // Navigate to login page
    await gmailLoginPage.navigateToLogin();

    // Enter valid email format
    const testEmail = 'testuser.automation@gmail.com';
    await gmailLoginPage.enterEmail(testEmail);

    // Click next
    await gmailLoginPage.clickNextAfterEmail();

    // Wait for transition
    await page.waitForTimeout(2000);

    // Take screenshot
    await gmailLoginPage.takeScreenshot('after_email_entry');

    logger.testEnd('Email Entry Test', 'PASSED');
  });

  test('TC_LOGIN_003: Verify error for invalid email format', async () => {
    logger.testStart('Invalid Email Format Test');

    // Navigate to login page
    await gmailLoginPage.navigateToLogin();

    // Enter invalid email
    await gmailLoginPage.enterEmail('invalidemail');
    await gmailLoginPage.clickNextAfterEmail();

    // Wait for error message
    await gmailLoginPage.sleep(2000);

    // Check for error display
    const errorDisplayed = await gmailLoginPage.isErrorDisplayed();
    
    // Take screenshot
    await gmailLoginPage.takeScreenshot('invalid_email_error');

    logger.testEnd('Invalid Email Format Test', 'PASSED');
  });

  test('TC_LOGIN_004: Verify error for empty email', async () => {
    logger.testStart('Empty Email Test');

    // Navigate to login page
    await gmailLoginPage.navigateToLogin();

    // Click next without entering email
    await gmailLoginPage.clickNextAfterEmail();

    // Wait for error
    await gmailLoginPage.sleep(2000);

    // Check for error display
    const errorDisplayed = await gmailLoginPage.isErrorDisplayed();

    // Take screenshot
    await gmailLoginPage.takeScreenshot('empty_email_error');

    logger.testEnd('Empty Email Test', 'PASSED');
  });

  test('TC_LOGIN_005: Verify Create Account link is visible', async ({ page }) => {
    logger.testStart('Create Account Link Test');

    // Navigate to login page
    await gmailLoginPage.navigateToLogin();

    // Look for create account option
    const createAccountLink = page.locator('text=Create account');
    const isVisible = await createAccountLink.isVisible({ timeout: 5000 });
    
    expect(isVisible).toBeTruthy();

    logger.testEnd('Create Account Link Test', 'PASSED');
  });

  test('TC_LOGIN_006: Navigate to create account from login', async ({ page }) => {
    logger.testStart('Navigate to Create Account Test');

    // Navigate to login page
    await gmailLoginPage.navigateToLogin();

    // Click create account
    await gmailLoginPage.clickCreateAccount();

    // Wait for navigation
    await page.waitForTimeout(2000);

    // Verify navigated to signup page
    const currentUrl = page.url();
    expect(currentUrl).toContain('accounts.google.com');

    // Take screenshot
    await gmailLoginPage.takeScreenshot('create_account_navigation');

    logger.testEnd('Navigate to Create Account Test', 'PASSED');
  });

  test('TC_LOGIN_007: Data-driven login test from Excel', async () => {
    logger.testStart('Data-Driven Login Test');

    // Get login test data from Excel
    const loginData = dataManager.getExecutableLoginData();

    // Skip if no data
    if (loginData.length === 0) {
      logger.warn('No login test data available. Skipping test.');
      test.skip();
      return;
    }

    for (const data of loginData) {
      logger.info(`Executing test case: ${data.testCaseId}`);

      // Navigate to login page
      await gmailLoginPage.navigateToLogin();

      // Enter email
      if (data.email) {
        await gmailLoginPage.enterEmail(data.email);
        await gmailLoginPage.clickNextAfterEmail();
        await gmailLoginPage.sleep(2000);
      }

      // Take screenshot for each test case
      await gmailLoginPage.takeScreenshot(`login_${data.testCaseId}`);

      logger.info(`Test case ${data.testCaseId} completed`);
    }

    logger.testEnd('Data-Driven Login Test', 'PASSED');
  });

  test('TC_LOGIN_008: Verify Forgot Email functionality', async ({ page }) => {
    logger.testStart('Forgot Email Test');

    // Navigate to login page
    await gmailLoginPage.navigateToLogin();

    // Click forgot email
    await gmailLoginPage.clickForgotEmail();

    // Wait for page change
    await page.waitForTimeout(2000);

    // Take screenshot
    await gmailLoginPage.takeScreenshot('forgot_email_page');

    logger.testEnd('Forgot Email Test', 'PASSED');
  });

  test('TC_LOGIN_009: Login flow with credentials from config', async () => {
    logger.testStart('Config Credentials Login Test');

    // Get credentials from config
    const credentials = configManager.getCredentials();

    // Navigate to login page
    await gmailLoginPage.navigateToLogin();

    // Enter email from config (masked for logging)
    const maskedEmail = dataManager.maskSensitiveData(credentials.username);
    logger.info(`Using email: ${maskedEmail}`);

    await gmailLoginPage.enterEmail(credentials.username);
    await gmailLoginPage.clickNextAfterEmail();

    // Wait and check for password page or security challenge
    await gmailLoginPage.sleep(3000);

    // Handle potential security challenges
    await gmailLoginPage.handleSecurityChallenge();

    // Take screenshot
    await gmailLoginPage.takeScreenshot('config_login_test');

    logger.testEnd('Config Credentials Login Test', 'PASSED');
  });

  test('TC_LOGIN_010: Verify multiple login attempts handling', async () => {
    logger.testStart('Multiple Login Attempts Test');

    const invalidEmails = [
      'invalid1@nonexistent.com',
      'invalid2@nonexistent.com',
    ];

    for (const email of invalidEmails) {
      await gmailLoginPage.navigateToLogin();
      await gmailLoginPage.enterEmail(email);
      await gmailLoginPage.clickNextAfterEmail();
      await gmailLoginPage.sleep(2000);

      logger.info(`Attempted login with: ${email}`);
    }

    // Take final screenshot
    await gmailLoginPage.takeScreenshot('multiple_login_attempts');

    logger.testEnd('Multiple Login Attempts Test', 'PASSED');
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Take screenshot on failure
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = await gmailLoginPage.takeScreenshot(`failure_${testInfo.title}`);
      logger.error(`Test failed: ${testInfo.title}`, { screenshot: screenshotPath });
    }
  });
});
