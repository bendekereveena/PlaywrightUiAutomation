import { FullConfig } from '@playwright/test';
import { logger } from './Logger';
import { ExcelReader } from './ExcelReader';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global Setup Function
 * Runs once before all tests
 */
async function globalSetup(config: FullConfig): Promise<void> {
  logger.info('═'.repeat(60));
  logger.info('GLOBAL SETUP: Starting test suite initialization');
  logger.info('═'.repeat(60));

  // Create necessary directories
  const directories = [
    'test-results',
    'test-results/artifacts',
    'screenshots',
    'logs',
    'playwright-report',
  ];

  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  }

  // Initialize sample test data if Excel file doesn't exist
  const testDataPath = path.join(process.cwd(), 'src/testdata/testData.xlsx');
  if (!fs.existsSync(testDataPath)) {
    logger.info('Creating sample test data Excel file...');
    const excelReader = new ExcelReader(testDataPath);
    excelReader.createSampleTestDataFile();
    logger.info('Sample test data created successfully');
  }

  // Log configuration
  logger.info('Test Configuration:', {
    testDir: config.projects[0]?.testDir,
    workers: config.workers,
    reporter: config.reporter,
  });

  // Set environment variables if needed
  process.env.TEST_START_TIME = new Date().toISOString();

  logger.info('GLOBAL SETUP: Initialization completed');
  logger.info('═'.repeat(60));
}

export default globalSetup;
