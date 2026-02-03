import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration Interface
 * Defines the structure of configuration data
 */
export interface AppConfig {
  baseUrl: string;
  gmailUrl: string;
  gmailSignUpUrl: string;
  credentials: {
    username: string;
    password: string;
    recoveryEmail: string;
    recoveryPhone: string;
  };
  timeouts: {
    short: number;
    medium: number;
    long: number;
    pageLoad: number;
  };
  browser: {
    headless: boolean;
    slowMo: number;
    viewport: {
      width: number;
      height: number;
    };
  };
  testData: {
    excelPath: string;
    sheetName: string;
  };
}

/**
 * ConfigManager Class
 * Singleton class for managing application configuration
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;
  private configPath: string;

  private constructor() {
    this.configPath = path.join(__dirname, '../config/config.json');
    this.config = this.loadConfig();
  }

  /**
   * Get singleton instance of ConfigManager
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Load configuration from JSON file
   */
  private loadConfig(): AppConfig {
    try {
      const configFile = fs.readFileSync(this.configPath, 'utf-8');
      const config = JSON.parse(configFile) as AppConfig;
      
      // Override with environment variables if available
      return this.mergeWithEnvVars(config);
    } catch (error) {
      console.error('Error loading config file:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Merge config with environment variables
   */
  private mergeWithEnvVars(config: AppConfig): AppConfig {
    return {
      ...config,
      baseUrl: process.env.BASE_URL || config.baseUrl,
      gmailUrl: process.env.GMAIL_URL || config.gmailUrl,
      credentials: {
        ...config.credentials,
        username: process.env.GMAIL_USERNAME || config.credentials.username,
        password: process.env.GMAIL_PASSWORD || config.credentials.password,
        recoveryEmail: process.env.RECOVERY_EMAIL || config.credentials.recoveryEmail,
        recoveryPhone: process.env.RECOVERY_PHONE || config.credentials.recoveryPhone,
      },
    };
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): AppConfig {
    return {
      baseUrl: 'https://www.google.com',
      gmailUrl: 'https://mail.google.com',
      gmailSignUpUrl: 'https://accounts.google.com/signup',
      credentials: {
        username: '',
        password: '',
        recoveryEmail: '',
        recoveryPhone: '',
      },
      timeouts: {
        short: 5000,
        medium: 10000,
        long: 30000,
        pageLoad: 60000,
      },
      browser: {
        headless: true,
        slowMo: 0,
        viewport: {
          width: 1920,
          height: 1080,
        },
      },
      testData: {
        excelPath: './src/testdata/testData.xlsx',
        sheetName: 'TestData',
      },
    };
  }

  /**
   * Get entire configuration object
   */
  public getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Get base URL
   */
  public getBaseUrl(): string {
    return this.config.baseUrl;
  }

  /**
   * Get Gmail URL
   */
  public getGmailUrl(): string {
    return this.config.gmailUrl;
  }

  /**
   * Get Gmail SignUp URL
   */
  public getGmailSignUpUrl(): string {
    return this.config.gmailSignUpUrl;
  }

  /**
   * Get credentials
   */
  public getCredentials() {
    return this.config.credentials;
  }

  /**
   * Get username
   */
  public getUsername(): string {
    return this.config.credentials.username;
  }

  /**
   * Get password
   */
  public getPassword(): string {
    return this.config.credentials.password;
  }

  /**
   * Get timeouts configuration
   */
  public getTimeouts() {
    return this.config.timeouts;
  }

  /**
   * Get browser configuration
   */
  public getBrowserConfig() {
    return this.config.browser;
  }

  /**
   * Get test data configuration
   */
  public getTestDataConfig() {
    return this.config.testData;
  }

  /**
   * Reload configuration from file
   */
  public reloadConfig(): void {
    this.config = this.loadConfig();
  }

  /**
   * Update configuration value dynamically
   */
  public updateConfig(key: keyof AppConfig, value: any): void {
    (this.config as any)[key] = value;
  }
}

// Export singleton instance
export const configManager = ConfigManager.getInstance();
