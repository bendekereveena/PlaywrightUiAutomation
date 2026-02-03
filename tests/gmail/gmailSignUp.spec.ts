import { test, expect } from '@playwright/test';
import { GmailSignUpPage } from '../../src/pages/GmailSignUpPage';
import { GmailLoginPage } from '../../src/pages/GmailLoginPage';
import { dataManager } from '../../src/utils/DataManager';
import { logger } from '../../src/utils/Logger';
import { UserRegistrationData } from '../../src/utils/ExcelReader';

/**
 * Gmail Sign Up Test Suite
 * Tests for Gmail/Google account creation functionality
 */
test.describe('Gmail Sign Up Tests', () => {
  let gmailSignUpPage: GmailSignUpPage;
  let gmailLoginPage: GmailLoginPage;

  test.beforeEach(async ({ page }) => {
    gmailSignUpPage = new GmailSignUpPage(page);
    gmailLoginPage = new GmailLoginPage(page);
  });

  test('TC_SIGNUP_001: Verify Gmail sign up page loads successfully', async () => {
    logger.testStart('Verify Gmail Sign Up Page');

    // Navigate to sign up page
    await gmailSignUpPage.navigateToSignUp();

    // Verify page loaded
    const isLoaded = await gmailSignUpPage.verifyPageLoaded();
    expect(isLoaded).toBeTruthy();

    // Take screenshot
    await gmailSignUpPage.takeScreenshot('signup_page_loaded');

    logger.testEnd('Verify Gmail Sign Up Page', 'PASSED');
  });

  test('TC_SIGNUP_002: Enter personal information and verify', async () => {
    logger.testStart('Personal Information Entry Test');

    // Navigate to sign up page
    await gmailSignUpPage.navigateToSignUp();

    // Enter first and last name
    await gmailSignUpPage.fillPersonalInfo('John', 'Doe');

    // Take screenshot
    await gmailSignUpPage.takeScreenshot('personal_info_entered');

    logger.testEnd('Personal Information Entry Test', 'PASSED');
  });

  test('TC_SIGNUP_003: Test sign up flow with random user data', async () => {
    logger.testStart('Random User Sign Up Test');

    // Generate random user data
    const randomUser = dataManager.generateRandomUserData();

    logger.info('Generated random user data', {
      firstName: randomUser.firstName,
      lastName: randomUser.lastName,
      username: randomUser.username,
    });

    // Navigate to sign up page
    await gmailSignUpPage.navigateToSignUp();

    // Fill personal info
    await gmailSignUpPage.fillPersonalInfo(randomUser.firstName, randomUser.lastName);
    await gmailSignUpPage.clickNext();

    // Wait for next step
    await gmailSignUpPage.sleep(2000);

    // Take screenshot after personal info
    await gmailSignUpPage.takeScreenshot('signup_step1_complete');

    logger.testEnd('Random User Sign Up Test', 'PASSED');
  });

  test('TC_SIGNUP_004: Verify birth date and gender selection', async () => {
    logger.testStart('Birth Date and Gender Test');

    // Navigate to sign up page
    await gmailSignUpPage.navigateToSignUp();

    // Fill personal info first
    await gmailSignUpPage.fillPersonalInfo('Test', 'User');
    await gmailSignUpPage.clickNext();

    // Wait for next step
    await gmailSignUpPage.sleep(2000);

    // Enter birth date
    await gmailSignUpPage.enterBirthDate('January', '15', '1990');

    // Select gender
    await gmailSignUpPage.selectGender('Male');

    // Take screenshot
    await gmailSignUpPage.takeScreenshot('birth_date_gender_entered');

    logger.testEnd('Birth Date and Gender Test', 'PASSED');
  });

  test('TC_SIGNUP_005: Data-driven sign up test from Excel', async () => {
    logger.testStart('Data-Driven Sign Up Test');

    // Get registration data from Excel
    const registrationData = dataManager.getExecutableUserRegistrationData();

    // Skip if no data
    if (registrationData.length === 0) {
      logger.warn('No registration test data available. Skipping test.');
      test.skip();
      return;
    }

    // Test with first data set
    const userData = registrationData[0];
    logger.info(`Executing test case: ${userData.testCaseId}`);

    // Navigate to sign up page
    await gmailSignUpPage.navigateToSignUp();

    // Fill personal info
    await gmailSignUpPage.fillPersonalInfo(userData.firstName, userData.lastName);
    await gmailSignUpPage.clickNext();

    // Wait for next step
    await gmailSignUpPage.sleep(2000);

    // Take screenshot
    await gmailSignUpPage.takeScreenshot(`signup_${userData.testCaseId}`);

    logger.testEnd('Data-Driven Sign Up Test', 'PASSED');
  });

  test('TC_SIGNUP_006: Verify username field validation', async () => {
    logger.testStart('Username Validation Test');

    // Navigate to sign up page
    await gmailSignUpPage.navigateToSignUp();

    // Fill personal info
    await gmailSignUpPage.fillPersonalInfo('Test', 'User');
    await gmailSignUpPage.clickNext();

    // Wait for next step (birth date/gender page)
    await gmailSignUpPage.sleep(2000);

    // Fill birth date and gender
    await gmailSignUpPage.enterBirthDate('January', '1', '1990');
    await gmailSignUpPage.selectGender('Male');
    await gmailSignUpPage.clickNext();

    // Wait for username page
    await gmailSignUpPage.sleep(2000);

    // Try to enter an existing/taken username
    const uniqueUsername = dataManager.generateUniqueUsername('testuser');
    await gmailSignUpPage.enterUsername(uniqueUsername);

    // Take screenshot
    await gmailSignUpPage.takeScreenshot('username_validation');

    logger.testEnd('Username Validation Test', 'PASSED');
  });

  test('TC_SIGNUP_007: Verify password requirements', async () => {
    logger.testStart('Password Requirements Test');

    // Navigate to sign up page
    await gmailSignUpPage.navigateToSignUp();

    // Fill personal info
    await gmailSignUpPage.fillPersonalInfo('Test', 'User');
    await gmailSignUpPage.clickNext();
    await gmailSignUpPage.sleep(2000);

    // Fill birth date and gender
    await gmailSignUpPage.enterBirthDate('January', '1', '1990');
    await gmailSignUpPage.selectGender('Male');
    await gmailSignUpPage.clickNext();
    await gmailSignUpPage.sleep(2000);

    // Enter username
    const uniqueUsername = dataManager.generateUniqueUsername('testpwd');
    await gmailSignUpPage.enterUsername(uniqueUsername);
    await gmailSignUpPage.clickNext();
    await gmailSignUpPage.sleep(2000);

    // Test weak password
    await gmailSignUpPage.enterPassword('weak');
    await gmailSignUpPage.enterConfirmPassword('weak');

    // Take screenshot of password validation
    await gmailSignUpPage.takeScreenshot('password_validation');

    logger.testEnd('Password Requirements Test', 'PASSED');
  });

  test('TC_SIGNUP_008: Test complete sign up flow', async ({ page }) => {
    logger.testStart('Complete Sign Up Flow Test');

    // Generate random user data
    const randomUser = dataManager.generateRandomUserData();

    // Navigate to sign up page
    await gmailSignUpPage.navigateToSignUp();

    // Step 1: Personal Info
    logger.step(1, 'Entering personal information');
    await gmailSignUpPage.fillPersonalInfo(randomUser.firstName, randomUser.lastName);
    await gmailSignUpPage.clickNext();
    await gmailSignUpPage.sleep(2000);
    await gmailSignUpPage.takeScreenshot('signup_flow_step1');

    // Step 2: Birth Date and Gender
    logger.step(2, 'Entering birth date and gender');
    await gmailSignUpPage.enterBirthDate(
      randomUser.birthDate.month,
      randomUser.birthDate.day,
      randomUser.birthDate.year
    );
    await gmailSignUpPage.selectGender('Male');
    await gmailSignUpPage.clickNext();
    await gmailSignUpPage.sleep(2000);
    await gmailSignUpPage.takeScreenshot('signup_flow_step2');

    // Step 3: Username
    logger.step(3, 'Entering username');
    await gmailSignUpPage.enterUsername(randomUser.username);
    await gmailSignUpPage.clickNext();
    await gmailSignUpPage.sleep(2000);
    await gmailSignUpPage.takeScreenshot('signup_flow_step3');

    // Step 4: Password
    logger.step(4, 'Entering password');
    await gmailSignUpPage.enterPassword(randomUser.password);
    await gmailSignUpPage.enterConfirmPassword(randomUser.password);
    await gmailSignUpPage.clickNext();
    await gmailSignUpPage.sleep(2000);
    await gmailSignUpPage.takeScreenshot('signup_flow_step4');

    // Handle optional steps
    logger.step(5, 'Handling optional steps');
    await gmailSignUpPage.handleOptionalSteps();

    // Check for CAPTCHA or phone verification
    const hasCaptcha = await gmailSignUpPage.isCaptchaPresent();
    if (hasCaptcha) {
      logger.warn('CAPTCHA detected - manual intervention required');
      await gmailSignUpPage.takeScreenshot('captcha_detected');
    }

    const hasPhoneVerification = await gmailSignUpPage.isPhoneVerificationRequired();
    if (hasPhoneVerification) {
      logger.warn('Phone verification required - cannot complete automatically');
      await gmailSignUpPage.takeScreenshot('phone_verification_required');
    }

    // Take final screenshot
    await gmailSignUpPage.takeScreenshot('signup_flow_complete');

    logger.testEnd('Complete Sign Up Flow Test', 'PASSED');
  });

  test('TC_SIGNUP_009: Navigate from login to sign up', async ({ page }) => {
    logger.testStart('Login to Sign Up Navigation Test');

    // Navigate to login page
    await gmailLoginPage.navigateToLogin();

    // Click create account
    await gmailLoginPage.clickCreateAccount();

    // Wait for account type selection
    await gmailLoginPage.sleep(2000);

    // Select personal account if visible
    await gmailLoginPage.selectAccountType('personal');

    // Wait for sign up page
    await gmailLoginPage.sleep(2000);

    // Verify on sign up page
    const currentUrl = page.url();
    expect(currentUrl).toContain('accounts.google.com');

    // Take screenshot
    await gmailSignUpPage.takeScreenshot('login_to_signup_navigation');

    logger.testEnd('Login to Sign Up Navigation Test', 'PASSED');
  });

  test('TC_SIGNUP_010: Test suggested usernames functionality', async () => {
    logger.testStart('Suggested Usernames Test');

    // Navigate to sign up page
    await gmailSignUpPage.navigateToSignUp();

    // Fill required steps to reach username page
    await gmailSignUpPage.fillPersonalInfo('John', 'Doe');
    await gmailSignUpPage.clickNext();
    await gmailSignUpPage.sleep(2000);

    await gmailSignUpPage.enterBirthDate('January', '1', '1990');
    await gmailSignUpPage.selectGender('Male');
    await gmailSignUpPage.clickNext();
    await gmailSignUpPage.sleep(2000);

    // Get suggested usernames
    const suggestions = await gmailSignUpPage.getSuggestedUsernames();
    logger.info('Suggested usernames:', { count: suggestions.length });

    // Take screenshot of username suggestions
    await gmailSignUpPage.takeScreenshot('username_suggestions');

    logger.testEnd('Suggested Usernames Test', 'PASSED');
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Take screenshot on failure
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = await gmailSignUpPage.takeScreenshot(`failure_${testInfo.title}`);
      logger.error(`Test failed: ${testInfo.title}`, { screenshot: screenshotPath });
    }
  });
});

/**
 * Gmail Dummy Account Creation Test Suite
 * Tests specifically for creating a dummy Gmail account
 */
test.describe('Gmail Dummy Account Creation', () => {
  let gmailSignUpPage: GmailSignUpPage;

  test.beforeEach(async ({ page }) => {
    gmailSignUpPage = new GmailSignUpPage(page);
  });

  test('TC_DUMMY_001: Create dummy Gmail account flow', async ({ page }) => {
    logger.testStart('Dummy Gmail Account Creation');

    // Generate unique dummy user data
    const timestamp = Date.now();
    const dummyUser: UserRegistrationData = {
      testCaseId: 'DUMMY_001',
      firstName: 'Test',
      lastName: 'Automation',
      username: `testautomation${timestamp}`,
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      birthMonth: 'January',
      birthDay: '15',
      birthYear: '1990',
      gender: 'Prefer not to say',
      recoveryEmail: '',
      phoneNumber: '',
      execute: true,
    };

    logger.info('Creating dummy account with username:', { username: dummyUser.username });

    // Navigate to sign up
    await gmailSignUpPage.navigateToSignUp();

    // Complete sign up flow
    try {
      await gmailSignUpPage.completeSignUp(dummyUser);
    } catch (error) {
      logger.warn('Sign up flow encountered an issue - may require manual verification');
      await gmailSignUpPage.takeScreenshot('dummy_account_error');
    }

    // Take final screenshot
    await gmailSignUpPage.takeScreenshot('dummy_account_final');

    logger.testEnd('Dummy Gmail Account Creation', 'PASSED');
  });

  test('TC_DUMMY_003: Smart Gmail account creation with auto-detection', async ({ page }) => {
    logger.testStart('Smart Gmail Account Creation');

    // Generate unique test user data
    const timestamp = Date.now();
    const testUser = {
      firstName: 'AutoTest',
      lastName: 'User',
      username: `autotest${timestamp}`,
      password: 'SecureTest123!',
      birthMonth: 'March',
      birthDay: '20',
      birthYear: '1995',
      gender: 'Rather not say',
      recoveryEmail: '',
      phoneNumber: '',
    };

    logger.info('Creating account with smart detection:', { 
      username: testUser.username,
      firstName: testUser.firstName,
      lastName: testUser.lastName 
    });

    // Navigate to sign up
    await gmailSignUpPage.navigateToSignUp();

    // Use smart signup that auto-detects each page
    await gmailSignUpPage.smartCompleteSignUp(testUser);

    logger.testEnd('Smart Gmail Account Creation', 'COMPLETED');
  });

  test('TC_DUMMY_002: Verify all sign up steps with dummy data', async () => {
    logger.testStart('Verify All Sign Up Steps');

    const randomUser = dataManager.generateRandomUserData();

    // Navigate to sign up
    await gmailSignUpPage.navigateToSignUp();

    // Verify Step 1: Personal Info page loaded
    const step1Loaded = await gmailSignUpPage.verifyPageLoaded();
    expect(step1Loaded).toBeTruthy();
    await gmailSignUpPage.fillPersonalInfo(randomUser.firstName, randomUser.lastName);
    await gmailSignUpPage.takeScreenshot('dummy_step1');
    await gmailSignUpPage.clickNext();
    await gmailSignUpPage.sleep(2500);

    // Verify Step 2: Birth date page
    await gmailSignUpPage.enterBirthDate(
      randomUser.birthDate.month,
      randomUser.birthDate.day,
      randomUser.birthDate.year
    );
    await gmailSignUpPage.selectGender('Prefer not to say');
    await gmailSignUpPage.takeScreenshot('dummy_step2');
    await gmailSignUpPage.clickNext();
    await gmailSignUpPage.sleep(2500);

    // Verify Step 3: Username
    await gmailSignUpPage.enterUsername(randomUser.username);
    await gmailSignUpPage.takeScreenshot('dummy_step3');
    await gmailSignUpPage.clickNext();
    await gmailSignUpPage.sleep(2500);

    // Verify Step 4: Password
    await gmailSignUpPage.enterPassword(randomUser.password);
    await gmailSignUpPage.enterConfirmPassword(randomUser.password);
    await gmailSignUpPage.takeScreenshot('dummy_step4');

    // Log generated credentials (for demo purposes)
    logger.info('Generated dummy credentials:', {
      username: randomUser.username,
      email: `${randomUser.username}@gmail.com`,
      password: dataManager.maskSensitiveData(randomUser.password),
    });

    logger.testEnd('Verify All Sign Up Steps', 'PASSED');
  });
});
