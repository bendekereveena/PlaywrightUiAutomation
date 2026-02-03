import { ExcelReader, UserRegistrationData, LoginTestData, SearchTestData } from './ExcelReader';
import { configManager } from './ConfigManager';
import * as path from 'path';

/**
 * Random Data Generator Interface
 */
export interface RandomUserData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phoneNumber: string;
  birthDate: {
    month: string;
    day: string;
    year: string;
  };
}

/**
 * DataManager Class
 * Centralized data management for test data
 */
export class DataManager {
  private static instance: DataManager;
  private excelReader: ExcelReader;

  private constructor() {
    const testDataConfig = configManager.getTestDataConfig();
    this.excelReader = new ExcelReader(testDataConfig.excelPath);
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  /**
   * Get all user registration test data
   */
  public getUserRegistrationData(): UserRegistrationData[] {
    return this.excelReader.readUserRegistrationData();
  }

  /**
   * Get executable user registration data
   */
  public getExecutableUserRegistrationData(): UserRegistrationData[] {
    return this.excelReader.getExecutableUserRegistrationData();
  }

  /**
   * Get all login test data
   */
  public getLoginTestData(): LoginTestData[] {
    return this.excelReader.readLoginTestData();
  }

  /**
   * Get executable login test data
   */
  public getExecutableLoginData(): LoginTestData[] {
    return this.excelReader.getExecutableLoginData();
  }

  /**
   * Get all search test data
   */
  public getSearchTestData(): SearchTestData[] {
    return this.excelReader.readSearchTestData();
  }

  /**
   * Get executable search test data
   */
  public getExecutableSearchData(): SearchTestData[] {
    return this.excelReader.getExecutableSearchData();
  }

  /**
   * Get specific user registration data by test case ID
   */
  public getUserRegistrationByTestCaseId(testCaseId: string): UserRegistrationData | undefined {
    const allData = this.getUserRegistrationData();
    return this.excelReader.getRowByTestCaseId(allData, testCaseId);
  }

  /**
   * Get specific login data by test case ID
   */
  public getLoginDataByTestCaseId(testCaseId: string): LoginTestData | undefined {
    const allData = this.getLoginTestData();
    return this.excelReader.getRowByTestCaseId(allData, testCaseId);
  }

  /**
   * Generate random user data for testing
   */
  public generateRandomUserData(): RandomUserData {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];

    return {
      firstName,
      lastName,
      email: `test.user.${timestamp}@example.com`,
      username: `testuser${timestamp}${randomNum}`,
      password: this.generateSecurePassword(),
      phoneNumber: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      birthDate: {
        month: months[Math.floor(Math.random() * months.length)],
        day: String(Math.floor(Math.random() * 28) + 1),
        year: String(Math.floor(Math.random() * 30) + 1970),
      },
    };
  }

  /**
   * Generate secure password meeting Google requirements
   */
  public generateSecurePassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=';
    
    let password = '';
    
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill rest of password
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 0; i < 8; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Generate unique username
   */
  public generateUniqueUsername(prefix: string = 'testuser'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Generate unique email
   */
  public generateUniqueEmail(domain: string = 'gmail.com'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `testuser.${timestamp}.${random}@${domain}`;
  }

  /**
   * Get credentials from config
   */
  public getCredentials() {
    return configManager.getCredentials();
  }

  /**
   * Get base URL from config
   */
  public getBaseUrl(): string {
    return configManager.getBaseUrl();
  }

  /**
   * Get Gmail URL from config
   */
  public getGmailUrl(): string {
    return configManager.getGmailUrl();
  }

  /**
   * Get Gmail SignUp URL from config
   */
  public getGmailSignUpUrl(): string {
    return configManager.getGmailSignUpUrl();
  }

  /**
   * Initialize sample test data Excel file
   */
  public initializeSampleData(): void {
    this.excelReader.createSampleTestDataFile();
  }

  /**
   * Mask sensitive data for logging
   */
  public maskSensitiveData(data: string, visibleChars: number = 3): string {
    if (data.length <= visibleChars) {
      return '*'.repeat(data.length);
    }
    return data.substring(0, visibleChars) + '*'.repeat(data.length - visibleChars);
  }

  /**
   * Format phone number
   */
  public formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }
}

// Export singleton instance
export const dataManager = DataManager.getInstance();
