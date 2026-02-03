/**
 * Utilities Index File
 * Central export point for all utility modules
 */

// Configuration Manager
export { ConfigManager, configManager, AppConfig } from './ConfigManager';

// Data Manager
export { DataManager, dataManager, RandomUserData } from './DataManager';

// Excel Reader
export {
  ExcelReader,
  excelReader,
  ExcelDataRow,
  UserRegistrationData,
  LoginTestData,
  SearchTestData,
} from './ExcelReader';

// Common Utilities
export {
  CommonUtils,
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
  WaitOptions,
  ScreenshotOptions,
} from './CommonUtils';

// Logger
export { Logger, logger, LogLevel, LoggerConfig } from './Logger';
