import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/Logger';

/**
 * GmailLoginPage Class
 * Page Object for Gmail/Google Account Login Page
 */
export class GmailLoginPage extends BasePage {
  // Locators
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly nextButton: Locator;
  private readonly signInButton: Locator;
  private readonly createAccountLink: Locator;
  private readonly forgotEmailLink: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly errorMessage: Locator;
  private readonly googleLogo: Locator;
  private readonly signInHeading: Locator;
  private readonly showPasswordCheckbox: Locator;
  private readonly staySignedInCheckbox: Locator;

  constructor(page: Page) {
    super(page, 'GmailLoginPage', 'https://accounts.google.com/signin');

    // Initialize locators
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.nextButton = page.locator('#identifierNext button, button:has-text("Next")');
    this.signInButton = page.locator('#passwordNext button, button:has-text("Sign in")');
    this.createAccountLink = page.locator('button:has-text("Create account"), a:has-text("Create account")');
    this.forgotEmailLink = page.locator('button:has-text("Forgot email")');
    this.forgotPasswordLink = page.locator('button:has-text("Forgot password"), a:has-text("Forgot password")');
    this.errorMessage = page.locator('[role="alert"], .error-msg, [class*="error"]');
    this.googleLogo = page.locator('img[alt="Google"]');
    this.signInHeading = page.locator('h1:has-text("Sign in")');
    this.showPasswordCheckbox = page.locator('input[type="checkbox"][name="showpassword"]');
    this.staySignedInCheckbox = page.locator('input[type="checkbox"][name="rememberMe"]');
  }

  /**
   * Navigate to Gmail login page
   */
  async navigateToLogin(): Promise<void> {
    logger.step(1, 'Navigate to Gmail login page');
    await this.navigate('https://accounts.google.com/signin/v2/identifier?service=mail');
    await this.waitForPageLoad();
  }

  /**
   * Navigate directly to Gmail
   */
  async navigateToGmail(): Promise<void> {
    logger.step(1, 'Navigate to Gmail');
    await this.navigate('https://mail.google.com');
    await this.waitForPageLoad();
  }

  /**
   * Enter email address
   */
  async enterEmail(email: string): Promise<void> {
    logger.step(2, `Enter email: ${email.substring(0, 3)}***`);
    await this.waitForVisible(this.emailInput);
    await this.fill(this.emailInput, email, 'Email Input');
  }

  /**
   * Click Next button after email
   */
  async clickNextAfterEmail(): Promise<void> {
    logger.step(3, 'Click Next button');
    await this.click(this.nextButton);
    await this.sleep(2000); // Wait for transition
  }

  /**
   * Enter password
   */
  async enterPassword(password: string): Promise<void> {
    logger.step(4, 'Enter password');
    await this.waitForVisible(this.passwordInput, 15000);
    await this.fill(this.passwordInput, password, 'Password Input');
  }

  /**
   * Click Sign In button after password
   */
  async clickSignIn(): Promise<void> {
    logger.step(5, 'Click Sign In button');
    await this.click(this.signInButton);
  }

  /**
   * Perform full login
   */
  async login(email: string, password: string): Promise<void> {
    logger.testStart('Gmail Login');
    
    await this.enterEmail(email);
    await this.clickNextAfterEmail();
    await this.enterPassword(password);
    await this.clickSignIn();
    
    // Wait for inbox or error
    await this.sleep(3000);
  }

  /**
   * Click Create Account link
   */
  async clickCreateAccount(): Promise<void> {
    logger.action('Click', 'Create Account link');
    await this.click(this.createAccountLink);
    await this.sleep(1000);
  }

  /**
   * Click Forgot Email link
   */
  async clickForgotEmail(): Promise<void> {
    await this.click(this.forgotEmailLink);
  }

  /**
   * Click Forgot Password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.click(this.forgotPasswordLink);
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    try {
      await this.waitForVisible(this.errorMessage, 5000);
      return await this.getText(this.errorMessage);
    } catch {
      return '';
    }
  }

  /**
   * Check if error message is displayed
   */
  async isErrorDisplayed(): Promise<boolean> {
    try {
      return await this.isVisible(this.errorMessage);
    } catch {
      return false;
    }
  }

  /**
   * Check if email input is visible
   */
  async isEmailInputVisible(): Promise<boolean> {
    return await this.isVisible(this.emailInput);
  }

  /**
   * Check if password input is visible
   */
  async isPasswordInputVisible(): Promise<boolean> {
    return await this.isVisible(this.passwordInput);
  }

  /**
   * Check if Sign In heading is visible
   */
  async isSignInHeadingVisible(): Promise<boolean> {
    return await this.isVisible(this.signInHeading);
  }

  /**
   * Toggle show password
   */
  async toggleShowPassword(): Promise<void> {
    const checkbox = this.showPasswordCheckbox;
    if (await this.isVisible(checkbox)) {
      await this.click(checkbox);
    }
  }

  /**
   * Verify login page loaded
   */
  async verifyPageLoaded(): Promise<boolean> {
    try {
      await this.waitForVisible(this.emailInput, 10000);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for password page
   */
  async waitForPasswordPage(): Promise<void> {
    await this.waitForVisible(this.passwordInput, 15000);
  }

  /**
   * Handle potential security challenges
   */
  async handleSecurityChallenge(): Promise<void> {
    // Check for phone verification prompt
    const phoneVerification = this.page.locator('text=Verify it\'s you');
    if (await phoneVerification.isVisible({ timeout: 3000 })) {
      logger.warn('Security challenge detected - phone verification required');
      await this.takeScreenshot('security_challenge');
    }

    // Check for CAPTCHA
    const captcha = this.page.locator('[class*="captcha"], iframe[src*="recaptcha"]');
    if (await captcha.isVisible({ timeout: 3000 })) {
      logger.warn('CAPTCHA detected');
      await this.takeScreenshot('captcha_challenge');
    }
  }

  /**
   * Select account type for new account
   */
  async selectAccountType(type: 'personal' | 'business'): Promise<void> {
    const accountTypeOption = type === 'personal' 
      ? this.page.locator('text=For my personal use, button:has-text("For myself")')
      : this.page.locator('text=To manage my business');
    
    if (await accountTypeOption.isVisible({ timeout: 3000 })) {
      await this.click(accountTypeOption);
    }
  }
}
