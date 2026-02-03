import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/Logger';

/**
 * GmailInboxPage Class
 * Page Object for Gmail Inbox Page
 */
export class GmailInboxPage extends BasePage {
  // Navigation Locators
  private readonly composeButton: Locator;
  private readonly inboxLink: Locator;
  private readonly starredLink: Locator;
  private readonly sentLink: Locator;
  private readonly draftsLink: Locator;
  private readonly spamLink: Locator;
  private readonly trashLink: Locator;

  // Search
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;

  // Email List
  private readonly emailRows: Locator;
  private readonly selectAllCheckbox: Locator;
  private readonly refreshButton: Locator;

  // Actions
  private readonly archiveButton: Locator;
  private readonly deleteButton: Locator;
  private readonly markAsReadButton: Locator;
  private readonly moveToButton: Locator;
  private readonly labelsButton: Locator;

  // Compose Email
  private readonly composeToInput: Locator;
  private readonly composeSubjectInput: Locator;
  private readonly composeBodyInput: Locator;
  private readonly composeSendButton: Locator;
  private readonly composeCloseButton: Locator;
  private readonly composeCcLink: Locator;
  private readonly composeBccLink: Locator;

  // User Menu
  private readonly profileButton: Locator;
  private readonly signOutButton: Locator;
  private readonly settingsButton: Locator;

  // Other
  private readonly loadingIndicator: Locator;
  private readonly noEmailsMessage: Locator;
  private readonly unreadCount: Locator;

  constructor(page: Page) {
    super(page, 'GmailInboxPage', 'https://mail.google.com/mail/u/0/#inbox');

    // Initialize locators
    this.composeButton = page.locator('[gh="cm"]').first();
    this.inboxLink = page.locator('a[href*="#inbox"]').first();
    this.starredLink = page.locator('a[href*="#starred"]');
    this.sentLink = page.locator('a[href*="#sent"]');
    this.draftsLink = page.locator('a[href*="#drafts"]');
    this.spamLink = page.locator('a[href*="#spam"]');
    this.trashLink = page.locator('a[href*="#trash"]');

    this.searchInput = page.locator('input[aria-label="Search mail"]');
    this.searchButton = page.locator('button[aria-label="Search mail"]');

    this.emailRows = page.locator('tr.zA');
    this.selectAllCheckbox = page.locator('[gh="tl"] [role="checkbox"]').first();
    this.refreshButton = page.locator('[data-tooltip="Refresh"]');

    this.archiveButton = page.locator('[act="7"]');
    this.deleteButton = page.locator('[act="10"]');
    this.markAsReadButton = page.locator('[act="1"]');
    this.moveToButton = page.locator('[data-tooltip="Move to"]');
    this.labelsButton = page.locator('[data-tooltip="Labels"]');

    this.composeToInput = page.locator('[name="to"], [aria-label="To recipients"]');
    this.composeSubjectInput = page.locator('[name="subjectbox"], input[aria-label="Subject"]');
    this.composeBodyInput = page.locator('[role="textbox"][aria-label*="Message"], div[aria-label="Message Body"]');
    this.composeSendButton = page.locator('[role="button"][data-tooltip*="Send"]');
    this.composeCloseButton = page.locator('[aria-label="Save & close"]');
    this.composeCcLink = page.locator('[aria-label="Add Cc recipients"]');
    this.composeBccLink = page.locator('[aria-label="Add Bcc recipients"]');

    this.profileButton = page.locator('[aria-label*="Account"]').first();
    this.signOutButton = page.locator('a:has-text("Sign out")');
    this.settingsButton = page.locator('[aria-label="Settings"]');

    this.loadingIndicator = page.locator('[role="progressbar"]');
    this.noEmailsMessage = page.locator('text=Your Primary tab is empty');
    this.unreadCount = page.locator('.bsU');
  }

  /**
   * Navigate to Gmail Inbox
   */
  async navigateToInbox(): Promise<void> {
    logger.step(1, 'Navigate to Gmail Inbox');
    await this.navigate();
    await this.waitForInboxLoad();
  }

  /**
   * Wait for inbox to load
   */
  async waitForInboxLoad(): Promise<void> {
    logger.step(2, 'Wait for inbox to load');
    await this.waitForPageLoad();
    try {
      await this.waitForVisible(this.composeButton, 30000);
    } catch {
      // Compose button might not be visible immediately
    }
  }

  /**
   * Click Compose button
   */
  async clickCompose(): Promise<void> {
    logger.action('Click', 'Compose button');
    await this.click(this.composeButton);
    await this.sleep(1000);
  }

  /**
   * Compose and send email
   */
  async composeEmail(to: string, subject: string, body: string): Promise<void> {
    logger.testStart('Compose Email');

    await this.clickCompose();
    
    // Wait for compose dialog
    await this.waitForVisible(this.composeToInput);

    // Enter recipient
    await this.fill(this.composeToInput, to, 'To Input');

    // Enter subject
    await this.fill(this.composeSubjectInput, subject, 'Subject Input');

    // Enter body
    await this.fill(this.composeBodyInput, body, 'Body Input');

    logger.testEnd('Compose Email', 'PASSED');
  }

  /**
   * Send composed email
   */
  async sendEmail(): Promise<void> {
    logger.action('Click', 'Send button');
    await this.click(this.composeSendButton);
    await this.sleep(2000);
  }

  /**
   * Close compose dialog
   */
  async closeComposeDialog(): Promise<void> {
    await this.click(this.composeCloseButton);
  }

  /**
   * Search emails
   */
  async searchEmails(query: string): Promise<void> {
    logger.step(1, `Search for: ${query}`);
    await this.fill(this.searchInput, query);
    await this.click(this.searchButton);
    await this.waitForPageLoad();
  }

  /**
   * Get email count in inbox
   */
  async getEmailCount(): Promise<number> {
    return await this.emailRows.count();
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<string> {
    try {
      return await this.getText(this.unreadCount);
    } catch {
      return '0';
    }
  }

  /**
   * Click on email by index
   */
  async openEmailByIndex(index: number): Promise<void> {
    const email = this.emailRows.nth(index);
    await this.click(email);
    await this.waitForPageLoad();
  }

  /**
   * Click on email by subject
   */
  async openEmailBySubject(subject: string): Promise<void> {
    const email = this.page.locator(`tr.zA:has-text("${subject}")`).first();
    await this.click(email);
    await this.waitForPageLoad();
  }

  /**
   * Select email by index
   */
  async selectEmailByIndex(index: number): Promise<void> {
    const checkbox = this.emailRows.nth(index).locator('[role="checkbox"]');
    await this.click(checkbox);
  }

  /**
   * Select all emails
   */
  async selectAllEmails(): Promise<void> {
    await this.click(this.selectAllCheckbox);
  }

  /**
   * Delete selected emails
   */
  async deleteSelectedEmails(): Promise<void> {
    logger.action('Click', 'Delete button');
    await this.click(this.deleteButton);
  }

  /**
   * Archive selected emails
   */
  async archiveSelectedEmails(): Promise<void> {
    await this.click(this.archiveButton);
  }

  /**
   * Mark selected as read
   */
  async markSelectedAsRead(): Promise<void> {
    await this.click(this.markAsReadButton);
  }

  /**
   * Refresh inbox
   */
  async refreshInbox(): Promise<void> {
    await this.click(this.refreshButton);
    await this.sleep(2000);
  }

  /**
   * Navigate to Sent folder
   */
  async goToSent(): Promise<void> {
    await this.click(this.sentLink);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Drafts folder
   */
  async goToDrafts(): Promise<void> {
    await this.click(this.draftsLink);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Starred folder
   */
  async goToStarred(): Promise<void> {
    await this.click(this.starredLink);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Spam folder
   */
  async goToSpam(): Promise<void> {
    await this.click(this.spamLink);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Trash folder
   */
  async goToTrash(): Promise<void> {
    await this.click(this.trashLink);
    await this.waitForPageLoad();
  }

  /**
   * Open Settings
   */
  async openSettings(): Promise<void> {
    await this.click(this.settingsButton);
    await this.sleep(500);
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    logger.action('Click', 'Profile button');
    await this.click(this.profileButton);
    await this.sleep(1000);
    
    logger.action('Click', 'Sign out button');
    await this.click(this.signOutButton);
    await this.waitForPageLoad();
  }

  /**
   * Verify inbox loaded
   */
  async verifyInboxLoaded(): Promise<boolean> {
    try {
      await this.waitForVisible(this.composeButton, 15000);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if inbox is empty
   */
  async isInboxEmpty(): Promise<boolean> {
    return await this.isVisible(this.noEmailsMessage);
  }

  /**
   * Get email subjects
   */
  async getEmailSubjects(): Promise<string[]> {
    const subjects: string[] = [];
    const count = await this.emailRows.count();
    
    for (let i = 0; i < count; i++) {
      const subject = await this.emailRows.nth(i).locator('[class*="bog"]').textContent();
      if (subject) {
        subjects.push(subject.trim());
      }
    }
    
    return subjects;
  }

  /**
   * Star email by index
   */
  async starEmailByIndex(index: number): Promise<void> {
    const starButton = this.emailRows.nth(index).locator('[data-tooltip="Star"]');
    await this.click(starButton);
  }

  /**
   * Check if email is starred
   */
  async isEmailStarred(index: number): Promise<boolean> {
    const starButton = this.emailRows.nth(index).locator('[data-tooltip="Starred"]');
    return await this.isVisible(starButton);
  }
}
