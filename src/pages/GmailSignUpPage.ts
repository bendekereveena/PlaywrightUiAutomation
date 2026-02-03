import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/Logger';
import { UserRegistrationData } from '../utils/ExcelReader';

/**
 * GmailSignUpPage Class
 * Page Object for Gmail/Google Account Sign Up Page
 */
export class GmailSignUpPage extends BasePage {
  // Personal Information Locators
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;

  // Date of Birth Locators
  private readonly birthMonthSelect: Locator;
  private readonly birthDayInput: Locator;
  private readonly birthYearInput: Locator;

  // Gender Locator
  private readonly genderSelect: Locator;

  // Recovery Information Locators
  private readonly recoveryEmailInput: Locator;
  private readonly phoneNumberInput: Locator;

  // Buttons
  private readonly nextButton: Locator;
  private readonly createAccountButton: Locator;
  private readonly skipButton: Locator;
  private readonly agreeButton: Locator;

  // Error Messages
  private readonly errorMessage: Locator;
  private readonly usernameError: Locator;
  private readonly passwordError: Locator;

  // Other Elements
  private readonly showPasswordCheckbox: Locator;
  private readonly termsCheckbox: Locator;
  private readonly createAccountHeading: Locator;

  constructor(page: Page) {
    super(page, 'GmailSignUpPage', 'https://accounts.google.com/signup');

    // Initialize locators
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.usernameInput = page.locator('input[name="Username"]');
    this.passwordInput = page.locator('input[name="Passwd"]');
    this.confirmPasswordInput = page.locator('input[name="PasswdAgain"], input[name="ConfirmPasswd"]');

    this.birthMonthSelect = page.locator('#month');
    this.birthDayInput = page.locator('input[name="day"]');
    this.birthYearInput = page.locator('input[name="year"]');

    this.genderSelect = page.locator('#gender');

    this.recoveryEmailInput = page.locator('input[name="recoveryEmail"]');
    this.phoneNumberInput = page.locator('input[name="phoneNumber"], input[type="tel"]');

    this.nextButton = page.locator('button:has-text("Next"), span:has-text("Next")').first();
    this.createAccountButton = page.locator('button:has-text("Create account")');
    this.skipButton = page.locator('button:has-text("Skip")');
    this.agreeButton = page.locator('button:has-text("I agree"), button:has-text("Agree")');

    this.errorMessage = page.locator('[role="alert"], .error-msg');
    this.usernameError = page.locator('[aria-live="polite"]:near(input[name="Username"])');
    this.passwordError = page.locator('[aria-live="polite"]:near(input[name="Passwd"])');

    this.showPasswordCheckbox = page.locator('input[type="checkbox"][aria-label*="Show password"]');
    this.termsCheckbox = page.locator('input[type="checkbox"]').first();
    this.createAccountHeading = page.locator('h1:has-text("Create"), h1:has-text("Sign up")');
  }

  /**
   * Navigate to Gmail sign up page
   */
  async navigateToSignUp(): Promise<void> {
    logger.step(1, 'Navigate to Gmail sign up page');
    await this.navigate('https://accounts.google.com/signup/v2/webcreateaccount?flowName=GlifWebSignIn&flowEntry=SignUp');
    await this.waitForPageLoad();
  }

  /**
   * Enter first name
   */
  async enterFirstName(firstName: string): Promise<void> {
    logger.step(2, `Enter first name: ${firstName}`);
    await this.waitForVisible(this.firstNameInput);
    await this.fill(this.firstNameInput, firstName, 'First Name Input');
  }

  /**
   * Enter last name
   */
  async enterLastName(lastName: string): Promise<void> {
    logger.step(3, `Enter last name: ${lastName}`);
    await this.fill(this.lastNameInput, lastName, 'Last Name Input');
  }

  /**
   * Fill personal information
   */
  async fillPersonalInfo(firstName: string, lastName: string): Promise<void> {
    await this.enterFirstName(firstName);
    await this.enterLastName(lastName);
  }

  /**
   * Click Next button
   */
  async clickNext(): Promise<void> {
    logger.action('Click', 'Next button');
    await this.click(this.nextButton);
    await this.sleep(2000);
  }

  /**
   * Enter birth date
   */
  async enterBirthDate(month: string, day: string, year: string): Promise<void> {
    logger.step(4, `Enter birth date: ${month} ${day}, ${year}`);
    
    // Select month - Google uses custom dropdown, not standard select
    try {
      const monthDropdown = this.page.locator('#month');
      if (await monthDropdown.isVisible({ timeout: 3000 })) {
        await this.click(monthDropdown);
        await this.sleep(500);
        // Click on the month option in the dropdown list
        const monthOption = this.page.locator(`[data-value]:has-text("${month}"), [role="option"]:has-text("${month}")`).first();
        if (await monthOption.isVisible({ timeout: 2000 })) {
          await this.click(monthOption);
        } else {
          // Try alternative selector
          await this.page.getByText(month, { exact: true }).click();
        }
        await this.sleep(300);
      }
    } catch (error) {
      logger.warn('Could not select month from dropdown');
    }

    // Enter day
    if (await this.isVisible(this.birthDayInput)) {
      await this.fill(this.birthDayInput, day);
    }

    // Enter year
    if (await this.isVisible(this.birthYearInput)) {
      await this.fill(this.birthYearInput, year);
    }
  }

  /**
   * Select gender
   */
  async selectGender(gender: string): Promise<void> {
    logger.step(5, `Select gender: ${gender}`);
    try {
      const genderDropdown = this.page.locator('#gender');
      if (await genderDropdown.isVisible({ timeout: 3000 })) {
        await this.click(genderDropdown);
        await this.sleep(500);
        // Click on the gender option in the dropdown list
        const genderOption = this.page.locator(`[data-value]:has-text("${gender}"), [role="option"]:has-text("${gender}")`).first();
        if (await genderOption.isVisible({ timeout: 2000 })) {
          await this.click(genderOption);
        } else {
          // Try alternative selector
          await this.page.getByText(gender, { exact: false }).first().click();
        }
        await this.sleep(300);
      }
    } catch (error) {
      logger.warn('Could not select gender from dropdown');
    }
  }

  /**
   * Enter username
   */
  async enterUsername(username: string): Promise<void> {
    logger.step(6, `Enter username: ${username}`);
    await this.waitForVisible(this.usernameInput);
    await this.fill(this.usernameInput, username, 'Username Input');
  }

  /**
   * Enter password
   */
  async enterPassword(password: string): Promise<void> {
    logger.step(7, 'Enter password');
    await this.waitForVisible(this.passwordInput);
    await this.fill(this.passwordInput, password, 'Password Input');
  }

  /**
   * Enter confirm password
   */
  async enterConfirmPassword(password: string): Promise<void> {
    logger.step(8, 'Confirm password');
    if (await this.isVisible(this.confirmPasswordInput)) {
      await this.fill(this.confirmPasswordInput, password, 'Confirm Password Input');
    }
  }

  /**
   * Fill username and password
   */
  async fillCredentials(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.enterConfirmPassword(password);
  }

  /**
   * Enter recovery email
   */
  async enterRecoveryEmail(email: string): Promise<void> {
    logger.step(9, 'Enter recovery email');
    if (await this.isVisible(this.recoveryEmailInput)) {
      await this.fill(this.recoveryEmailInput, email, 'Recovery Email Input');
    }
  }

  /**
   * Enter phone number
   */
  async enterPhoneNumber(phoneNumber: string): Promise<void> {
    logger.step(10, 'Enter phone number');
    if (await this.isVisible(this.phoneNumberInput)) {
      await this.fill(this.phoneNumberInput, phoneNumber, 'Phone Number Input');
    }
  }

  /**
   * Click Skip button
   */
  async clickSkip(): Promise<void> {
    logger.action('Click', 'Skip button');
    if (await this.isVisible(this.skipButton)) {
      await this.click(this.skipButton);
      await this.sleep(1000);
    }
  }

  /**
   * Click Agree/Create Account button
   */
  async clickAgree(): Promise<void> {
    logger.action('Click', 'Agree button');
    await this.click(this.agreeButton);
    await this.sleep(2000);
  }

  /**
   * Toggle show password
   */
  async toggleShowPassword(): Promise<void> {
    if (await this.isVisible(this.showPasswordCheckbox)) {
      await this.click(this.showPasswordCheckbox);
    }
  }

  /**
   * Get error message
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
   * Get username error
   */
  async getUsernameError(): Promise<string> {
    try {
      return await this.getText(this.usernameError);
    } catch {
      return '';
    }
  }

  /**
   * Check if error is displayed
   */
  async isErrorDisplayed(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }

  /**
   * Verify sign up page loaded
   */
  async verifyPageLoaded(): Promise<boolean> {
    try {
      await this.waitForVisible(this.firstNameInput, 10000);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Complete full sign up flow
   */
  async completeSignUp(userData: UserRegistrationData): Promise<void> {
    logger.testStart('Gmail Sign Up');

    // Step 1: Personal Info
    await this.fillPersonalInfo(userData.firstName, userData.lastName);
    await this.clickNext();

    // Step 2: Birth date and Gender
    await this.enterBirthDate(userData.birthMonth, userData.birthDay, userData.birthYear);
    await this.selectGender(userData.gender);
    await this.clickNext();

    // Step 3: Username
    await this.enterUsername(userData.username);
    await this.clickNext();

    // Step 4: Password
    await this.enterPassword(userData.password);
    await this.enterConfirmPassword(userData.confirmPassword);
    await this.clickNext();

    // Step 5: Recovery info (optional)
    if (userData.recoveryEmail) {
      await this.enterRecoveryEmail(userData.recoveryEmail);
    }
    if (userData.phoneNumber) {
      await this.enterPhoneNumber(userData.phoneNumber);
    }

    // Handle optional steps
    await this.handleOptionalSteps();

    logger.testEnd('Gmail Sign Up', 'PASSED');
  }

  /**
   * Handle optional steps in sign up flow
   */
  async handleOptionalSteps(): Promise<void> {
    // Try to skip optional steps
    const skipButton = this.page.locator('button:has-text("Skip")');
    let attempts = 0;
    
    while (attempts < 3) {
      try {
        if (await skipButton.isVisible({ timeout: 3000 })) {
          await this.click(skipButton);
          await this.sleep(1500);
        } else {
          break;
        }
      } catch {
        break;
      }
      attempts++;
    }

    // Accept terms if visible
    try {
      const agreeButton = this.page.locator('button:has-text("I agree")');
      if (await agreeButton.isVisible({ timeout: 3000 })) {
        await this.click(agreeButton);
      }
    } catch {
      // Terms not required
    }
  }

  /**
   * Check if CAPTCHA is present
   */
  async isCaptchaPresent(): Promise<boolean> {
    const captcha = this.page.locator('[class*="captcha"], iframe[src*="recaptcha"]');
    return await captcha.isVisible({ timeout: 3000 });
  }

  /**
   * Check if phone verification is required
   */
  async isPhoneVerificationRequired(): Promise<boolean> {
    const phoneVerification = this.page.locator('text=Verify your phone number, text=phone verification');
    return await phoneVerification.isVisible({ timeout: 3000 });
  }

  /**
   * Get suggested usernames
   */
  async getSuggestedUsernames(): Promise<string[]> {
    try {
      const suggestions = this.page.locator('[data-username]');
      return await suggestions.allTextContents();
    } catch {
      return [];
    }
  }

  /**
   * Select suggested username
   */
  async selectSuggestedUsername(index: number = 0): Promise<void> {
    const suggestions = this.page.locator('[data-username]');
    const suggestion = suggestions.nth(index);
    if (await suggestion.isVisible()) {
      await this.click(suggestion);
    }
  }

  /**
   * Detect current page/step in signup flow
   */
  async detectCurrentStep(): Promise<string> {
    await this.sleep(1000);
    
    // Get page heading for additional context
    const heading = await this.getPageHeading();
    
    // Check for various page elements to determine current step
    if (await this.page.locator('input[name="firstName"]').isVisible({ timeout: 2000 }).catch(() => false)) {
      return 'personal_info';
    }
    if (await this.page.locator('#month, input[name="day"], input[name="year"]').first().isVisible({ timeout: 2000 }).catch(() => false)) {
      return 'birth_gender';
    }
    // Check for username/email creation page - multiple possible selectors
    if (await this.page.locator('input[name="Username"]').isVisible({ timeout: 2000 }).catch(() => false)) {
      return 'username';
    }
    // Check by page heading for email address creation
    if (heading.toLowerCase().includes('email address') || heading.toLowerCase().includes('choose your gmail')) {
      // Look for radio buttons or input fields for email options
      const hasEmailOptions = await this.page.locator('[data-value], input[type="radio"], [role="radio"]').first().isVisible({ timeout: 1000 }).catch(() => false);
      const hasEmailInput = await this.page.locator('input[type="text"], input[type="email"]').first().isVisible({ timeout: 1000 }).catch(() => false);
      if (hasEmailOptions || hasEmailInput) {
        return 'email_selection';
      }
    }
    if (await this.page.locator('input[name="Passwd"]').isVisible({ timeout: 2000 }).catch(() => false)) {
      return 'password';
    }
    if (await this.page.locator('input[type="tel"], input[name="phoneNumber"]').first().isVisible({ timeout: 2000 }).catch(() => false)) {
      return 'phone_verification';
    }
    if (await this.page.locator('input[name="recoveryEmail"]').isVisible({ timeout: 2000 }).catch(() => false)) {
      return 'recovery_email';
    }
    if (await this.page.locator('button:has-text("I agree"), button:has-text("Agree")').first().isVisible({ timeout: 2000 }).catch(() => false)) {
      return 'terms';
    }
    if (await this.page.locator('iframe[src*="recaptcha"], [class*="captcha"]').first().isVisible({ timeout: 2000 }).catch(() => false)) {
      return 'captcha';
    }
    if (await this.page.locator('button:has-text("Skip")').isVisible({ timeout: 2000 }).catch(() => false)) {
      return 'optional_step';
    }
    
    // Check for "Create your own" option which indicates email selection page
    if (await this.page.locator('text=Create your own Gmail address').isVisible({ timeout: 1000 }).catch(() => false)) {
      return 'email_selection';
    }
    
    return 'unknown';
  }

  /**
   * Get page heading/title to understand context
   */
  async getPageHeading(): Promise<string> {
    try {
      const heading = await this.page.locator('h1, [role="heading"]').first().textContent({ timeout: 3000 });
      return heading?.trim() || '';
    } catch {
      return '';
    }
  }

  /**
   * Fill all visible fields on current page dynamically
   */
  async fillCurrentPageFields(userData: {
    firstName?: string;
    lastName?: string;
    username?: string;
    password?: string;
    birthMonth?: string;
    birthDay?: string;
    birthYear?: string;
    gender?: string;
    phoneNumber?: string;
    recoveryEmail?: string;
  }): Promise<void> {
    const currentStep = await this.detectCurrentStep();
    const heading = await this.getPageHeading();
    
    logger.info(`Current step detected: ${currentStep}`);
    logger.info(`Page heading: ${heading}`);

    switch (currentStep) {
      case 'personal_info':
        await this.fillPersonalInfoStep(userData.firstName || 'Test', userData.lastName || 'User');
        break;
      
      case 'birth_gender':
        await this.fillBirthGenderStep(
          userData.birthMonth || 'January',
          userData.birthDay || '15',
          userData.birthYear || '1990',
          userData.gender || 'Prefer not to say'
        );
        break;
      
      case 'username':
        await this.fillUsernameStep(userData.username || `testuser${Date.now()}`);
        break;
      
      case 'email_selection':
        await this.fillEmailSelectionStep(userData.username || `testuser${Date.now()}`);
        break;
      
      case 'password':
        await this.fillPasswordStep(userData.password || 'TestPassword123!');
        break;
      
      case 'phone_verification':
        logger.warn('Phone verification required - this step may need manual intervention');
        if (userData.phoneNumber) {
          await this.fillPhoneStep(userData.phoneNumber);
        }
        break;
      
      case 'recovery_email':
        if (userData.recoveryEmail) {
          await this.fillRecoveryEmailStep(userData.recoveryEmail);
        }
        break;
      
      case 'terms':
        await this.acceptTerms();
        break;
      
      case 'optional_step':
        await this.handleSkipOrContinue();
        break;
      
      case 'captcha':
        logger.warn('CAPTCHA detected - manual intervention required');
        await this.takeScreenshot('captcha_page');
        break;
      
      default:
        logger.warn(`Unknown step encountered: ${currentStep}`);
        // Try to find and click on "Create your own Gmail address" if visible
        await this.tryHandleUnknownPage(userData.username || `testuser${Date.now()}`);
        await this.takeScreenshot('unknown_step');
    }
  }

  /**
   * Fill personal info step (first name, last name)
   */
  async fillPersonalInfoStep(firstName: string, lastName: string): Promise<void> {
    logger.info('Filling personal information step');
    
    const firstNameField = this.page.locator('input[name="firstName"]');
    const lastNameField = this.page.locator('input[name="lastName"]');
    
    if (await firstNameField.isVisible({ timeout: 3000 })) {
      await firstNameField.fill(firstName);
      logger.info(`Entered first name: ${firstName}`);
    }
    
    if (await lastNameField.isVisible({ timeout: 3000 })) {
      await lastNameField.fill(lastName);
      logger.info(`Entered last name: ${lastName}`);
    }
    
    await this.takeScreenshot('personal_info_filled');
  }

  /**
   * Fill birth date and gender step
   */
  async fillBirthGenderStep(month: string, day: string, year: string, gender: string): Promise<void> {
    logger.info('Filling birth date and gender step');
    
    // Handle Month dropdown (Google's custom dropdown)
    const monthDropdown = this.page.locator('#month');
    if (await monthDropdown.isVisible({ timeout: 3000 })) {
      await monthDropdown.click();
      await this.sleep(500);
      
      // Try multiple selectors for month options
      const monthSelectors = [
        `div[data-value]:has-text("${month}")`,
        `[role="option"]:has-text("${month}")`,
        `li:has-text("${month}")`,
        `div[role="listbox"] div:has-text("${month}")`
      ];
      
      for (const selector of monthSelectors) {
        const monthOption = this.page.locator(selector).first();
        if (await monthOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await monthOption.click();
          logger.info(`Selected month: ${month}`);
          break;
        }
      }
      await this.sleep(300);
    }
    
    // Fill Day
    const dayField = this.page.locator('input[name="day"]');
    if (await dayField.isVisible({ timeout: 2000 })) {
      await dayField.fill(day);
      logger.info(`Entered day: ${day}`);
    }
    
    // Fill Year
    const yearField = this.page.locator('input[name="year"]');
    if (await yearField.isVisible({ timeout: 2000 })) {
      await yearField.fill(year);
      logger.info(`Entered year: ${year}`);
    }
    
    // Handle Gender dropdown (Google's custom dropdown)
    const genderDropdown = this.page.locator('#gender');
    if (await genderDropdown.isVisible({ timeout: 3000 })) {
      await genderDropdown.click();
      await this.sleep(500);
      
      // Try multiple selectors for gender options
      const genderSelectors = [
        `div[data-value]:has-text("${gender}")`,
        `[role="option"]:has-text("${gender}")`,
        `li:has-text("${gender}")`,
        `div[role="listbox"] div:has-text("${gender}")`
      ];
      
      for (const selector of genderSelectors) {
        const genderOption = this.page.locator(selector).first();
        if (await genderOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await genderOption.click();
          logger.info(`Selected gender: ${gender}`);
          break;
        }
      }
      await this.sleep(300);
    }
    
    await this.takeScreenshot('birth_gender_filled');
  }

  /**
   * Fill username step
   */
  async fillUsernameStep(username: string): Promise<void> {
    logger.info('Filling username step');
    
    // Check for "Create your own Gmail address" option first
    const createOwnOption = this.page.locator('text=Create your own Gmail address, div:has-text("Create your own")').first();
    if (await createOwnOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createOwnOption.click();
      await this.sleep(500);
    }
    
    const usernameField = this.page.locator('input[name="Username"]');
    if (await usernameField.isVisible({ timeout: 3000 })) {
      await usernameField.fill(username);
      logger.info(`Entered username: ${username}`);
    }
    
    await this.takeScreenshot('username_filled');
  }

  /**
   * Fill email selection step (Google's email address creation page)
   */
  async fillEmailSelectionStep(username: string): Promise<void> {
    logger.info('Handling email selection step');
    
    // Google often shows suggested emails or "Create your own" option
    // First, try to click "Create your own Gmail address"
    const createOwnSelectors = [
      'text=Create your own Gmail address',
      '[data-value*="create"]',
      'div:has-text("Create your own")',
      'label:has-text("Create your own")',
      '[role="radio"]:has-text("Create")',
      'span:has-text("Create your own Gmail address")'
    ];
    
    let clicked = false;
    for (const selector of createOwnSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        await element.click();
        logger.info('Clicked "Create your own Gmail address" option');
        clicked = true;
        await this.sleep(800);
        break;
      }
    }
    
    // After clicking, look for the input field
    const inputSelectors = [
      'input[name="Username"]',
      'input[type="text"]:visible',
      'input[aria-label*="email"]',
      'input[aria-label*="username"]',
      'input[placeholder*="email"]',
      'input:not([type="hidden"]):not([type="password"])'
    ];
    
    for (const selector of inputSelectors) {
      const inputField = this.page.locator(selector).first();
      if (await inputField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await inputField.fill(username);
        logger.info(`Entered email/username: ${username}`);
        break;
      }
    }
    
    await this.takeScreenshot('email_selection_filled');
  }

  /**
   * Try to handle unknown page by looking for common elements
   */
  async tryHandleUnknownPage(username: string): Promise<void> {
    logger.info('Attempting to handle unknown page');
    
    // Try clicking "Create your own Gmail address" if visible
    const createOwnOptions = [
      this.page.locator('text=Create your own Gmail address').first(),
      this.page.locator('div:has-text("Create your own")').first(),
      this.page.locator('[role="radio"]').last(), // Often the custom option is last
    ];
    
    for (const option of createOwnOptions) {
      if (await option.isVisible({ timeout: 1000 }).catch(() => false)) {
        await option.click();
        logger.info('Clicked option on unknown page');
        await this.sleep(800);
        
        // Look for any visible text input
        const textInput = this.page.locator('input[type="text"]:visible').first();
        if (await textInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await textInput.fill(username);
          logger.info(`Filled text input with username: ${username}`);
        }
        break;
      }
    }
    
    // If there's any visible input without a value, try to fill it
    const emptyInputs = this.page.locator('input:visible:not([type="hidden"]):not([type="password"]):not([type="checkbox"]):not([type="radio"])');
    const count = await emptyInputs.count();
    for (let i = 0; i < count; i++) {
      const input = emptyInputs.nth(i);
      const value = await input.inputValue().catch(() => '');
      if (!value) {
        const inputName = await input.getAttribute('name') || '';
        const inputType = await input.getAttribute('type') || 'text';
        
        // Skip inputs that look like they're for other purposes
        if (inputName.toLowerCase().includes('phone') || inputType === 'tel') {
          continue;
        }
        
        await input.fill(username);
        logger.info(`Filled empty input field with username`);
        break;
      }
    }
  }

  /**
   * Fill password step
   */
  async fillPasswordStep(password: string): Promise<void> {
    logger.info('Filling password step');
    
    const passwordField = this.page.locator('input[name="Passwd"]');
    const confirmField = this.page.locator('input[name="PasswdAgain"], input[name="ConfirmPasswd"]');
    
    if (await passwordField.isVisible({ timeout: 3000 })) {
      await passwordField.fill(password);
      logger.info('Entered password');
    }
    
    if (await confirmField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmField.fill(password);
      logger.info('Confirmed password');
    }
    
    await this.takeScreenshot('password_filled');
  }

  /**
   * Fill phone verification step
   */
  async fillPhoneStep(phoneNumber: string): Promise<void> {
    logger.info('Filling phone number step');
    
    const phoneField = this.page.locator('input[type="tel"], input[name="phoneNumber"]').first();
    if (await phoneField.isVisible({ timeout: 3000 })) {
      await phoneField.fill(phoneNumber);
      logger.info('Entered phone number');
    }
    
    await this.takeScreenshot('phone_filled');
  }

  /**
   * Fill recovery email step
   */
  async fillRecoveryEmailStep(email: string): Promise<void> {
    logger.info('Filling recovery email step');
    
    const emailField = this.page.locator('input[name="recoveryEmail"]');
    if (await emailField.isVisible({ timeout: 3000 })) {
      await emailField.fill(email);
      logger.info(`Entered recovery email: ${email}`);
    }
    
    await this.takeScreenshot('recovery_email_filled');
  }

  /**
   * Accept terms and conditions
   */
  async acceptTerms(): Promise<void> {
    logger.info('Accepting terms and conditions');
    
    // Scroll to bottom of terms if needed
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.sleep(500);
    
    const agreeButton = this.page.locator('button:has-text("I agree"), button:has-text("Agree")').first();
    if (await agreeButton.isVisible({ timeout: 3000 })) {
      await agreeButton.click();
      logger.info('Clicked agree button');
    }
    
    await this.takeScreenshot('terms_accepted');
  }

  /**
   * Handle skip or continue options
   */
  async handleSkipOrContinue(): Promise<void> {
    logger.info('Handling optional step');
    
    // Try Skip first
    const skipButton = this.page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
      logger.info('Clicked skip button');
      return;
    }
    
    // Try Next/Continue
    const nextButton = this.page.locator('button:has-text("Next"), button:has-text("Continue")').first();
    if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nextButton.click();
      logger.info('Clicked next/continue button');
    }
  }

  /**
   * Smart complete signup - detects and fills each step automatically
   */
  async smartCompleteSignUp(userData: {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    birthMonth?: string;
    birthDay?: string;
    birthYear?: string;
    gender?: string;
    phoneNumber?: string;
    recoveryEmail?: string;
  }): Promise<void> {
    logger.testStart('Smart Gmail Sign Up');
    
    const maxSteps = 10;
    let stepCount = 0;
    
    while (stepCount < maxSteps) {
      stepCount++;
      logger.info(`Processing step ${stepCount}...`);
      
      // Take screenshot of current state
      await this.takeScreenshot(`signup_step_${stepCount}`);
      
      // Detect and fill current step
      const currentStep = await this.detectCurrentStep();
      
      if (currentStep === 'captcha') {
        logger.warn('CAPTCHA detected - stopping automated flow');
        break;
      }
      
      if (currentStep === 'phone_verification' && !userData.phoneNumber) {
        logger.warn('Phone verification required but no phone number provided');
        // Try to find skip option
        const skipButton = this.page.locator('button:has-text("Skip")');
        if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await skipButton.click();
          await this.sleep(2000);
          continue;
        }
        break;
      }
      
      // Fill the current page
      await this.fillCurrentPageFields(userData);
      
      // Click Next/Continue button
      const nextButton = this.page.locator('button:has-text("Next"), span:has-text("Next")').first();
      if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextButton.click();
        logger.info('Clicked Next button');
        await this.sleep(2500);
      } else {
        // Check if we're done
        const welcomeText = await this.page.locator('text=Welcome, text=Your new account').first().isVisible({ timeout: 2000 }).catch(() => false);
        if (welcomeText) {
          logger.info('Account creation appears successful!');
          break;
        }
        
        // Check for any other continue buttons
        const continueBtn = this.page.locator('button:has-text("Continue"), button:has-text("Done")').first();
        if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await continueBtn.click();
          await this.sleep(2000);
        } else {
          logger.warn('No next button found, may have reached end of flow');
          break;
        }
      }
    }
    
    await this.takeScreenshot('signup_final_state');
    logger.testEnd('Smart Gmail Sign Up', 'COMPLETED');
  }
}
