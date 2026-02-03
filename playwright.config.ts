import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright Configuration File
 * Configures test execution, browsers, reporting, and other settings
 */

export default defineConfig({
  // Test directory
  testDir: './tests',

  // Test file patterns
  testMatch: '**/*.spec.ts',

  // Maximum time one test can run
  timeout: 60000,

  // Maximum time expect() should wait for condition
  expect: {
    timeout: 10000,
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 1,

  // Number of workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration - Playwright standard reporting
  reporter: [
    ['list'],
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'test-results/results.json' 
    }],
    ['junit', { 
      outputFile: 'test-results/junit-results.xml' 
    }],
  ],

  // Output folder for test artifacts
  outputDir: 'test-results/artifacts',

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: 'https://www.google.com',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'on-first-retry',

    // Browser viewport
    viewport: { width: 1920, height: 1080 },

    // Action timeout
    actionTimeout: 15000,

    // Navigation timeout
    navigationTimeout: 30000,

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Locale
    locale: 'en-US',

    // Timezone
    timezoneId: 'America/New_York',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Branded browsers
    {
      name: 'Microsoft Edge',
      use: { 
        ...devices['Desktop Edge'], 
        channel: 'msedge' 
      },
    },
  ],

  // Global setup/teardown
  globalSetup: path.join(__dirname, 'src/utils/globalSetup.ts'),
  globalTeardown: path.join(__dirname, 'src/utils/globalTeardown.ts'),
});
