# Playwright UI Automation Framework

A comprehensive Playwright-based UI automation framework for Google and Gmail testing, built with TypeScript and following the Page Object Model (POM) design pattern.

## Features

- **Page Object Model (POM)**: Clean separation of test logic and page interactions
- **TypeScript**: Type-safe code with better IDE support
- **Excel Data Management**: Read test data from Excel files using xlsx library
- **Configurable**: JSON-based configuration with environment variable support
- **Comprehensive Utilities**: Common functions for waits, clicks, screenshots, and more
- **Structured Logging**: Winston-based logging for detailed test execution logs
- **Multi-Browser Support**: Chrome, Firefox, Safari, Edge, and mobile viewports
- **Playwright Reporting**: HTML, JSON, and JUnit reports

## Project Structure

```
PlaywrightUIAutomation/
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── playwright.config.ts      # Playwright configuration
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── README.md                # This file
│
├── src/
│   ├── pages/               # Page Object Model classes
│   │   ├── BasePage.ts      # Base page with common methods
│   │   ├── GoogleHomePage.ts    # Google home page
│   │   ├── GmailLoginPage.ts    # Gmail login page
│   │   ├── GmailSignUpPage.ts   # Gmail sign up page
│   │   ├── GmailInboxPage.ts    # Gmail inbox page
│   │   └── index.ts         # Pages export
│   │
│   ├── utils/               # Utility functions
│   │   ├── ConfigManager.ts     # Configuration management
│   │   ├── ExcelReader.ts       # Excel file operations
│   │   ├── DataManager.ts       # Test data management
│   │   ├── CommonUtils.ts       # Common utility functions
│   │   ├── Logger.ts            # Winston logging
│   │   ├── globalSetup.ts       # Global setup
│   │   ├── globalTeardown.ts    # Global teardown
│   │   └── index.ts         # Utils export
│   │
│   ├── config/
│   │   └── config.json      # Configuration file
│   │
│   └── testdata/
│       └── testData.xlsx    # Test data Excel file (auto-generated)
│
├── tests/
│   ├── google/
│   │   └── googleSearch.spec.ts  # Google search tests
│   │
│   └── gmail/
│       ├── gmailLogin.spec.ts    # Gmail login tests
│       └── gmailSignUp.spec.ts   # Gmail signup tests
│
├── playwright-report/       # HTML reports (generated)
├── test-results/           # Test artifacts (generated)
├── screenshots/            # Screenshots (generated)
└── logs/                   # Log files (generated)
```

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Git (optional)

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd PlaywrightUIAutomation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

4. **Set up environment variables (optional):**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
BASE_URL=https://www.google.com
GMAIL_URL=https://mail.google.com
GMAIL_USERNAME=your.test.account
GMAIL_PASSWORD=YourSecurePassword123!
```

### Config File

Edit `src/config/config.json` to customize:

- URLs for Google and Gmail
- Timeouts for different operations
- Browser settings
- Test data file paths

### Test Data (Excel)

The framework automatically creates a sample Excel file on first run at `src/testdata/testData.xlsx` with sheets:

1. **UserRegistration**: User registration test data
2. **LoginData**: Login test data
3. **SearchData**: Search query test data

#### Excel Sheet Structure

**UserRegistration Sheet:**
| Column | Description |
|--------|-------------|
| TestCaseId | Unique test case identifier |
| FirstName | User's first name |
| LastName | User's last name |
| Username | Desired username |
| Password | Password |
| ConfirmPassword | Password confirmation |
| BirthMonth | Birth month |
| BirthDay | Birth day |
| BirthYear | Birth year |
| Gender | Gender selection |
| RecoveryEmail | Recovery email |
| PhoneNumber | Phone number |
| Execute | Yes/No flag to run test |

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
# Gmail tests only
npm run test:gmail

# Google tests only
npm run test:google
```

### Headed Mode (with browser visible)
```bash
npm run test:headed
```

### Debug Mode
```bash
npm run test:debug
```

### UI Mode (interactive)
```bash
npm run test:ui
```

### Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Specific Test File
```bash
npx playwright test tests/gmail/gmailLogin.spec.ts
```

### Specific Test
```bash
npx playwright test -g "TC_LOGIN_001"
```

## Viewing Reports

### HTML Report
```bash
npm run report
```

### Report Files
- `playwright-report/index.html` - Interactive HTML report
- `test-results/results.json` - JSON results
- `test-results/junit-results.xml` - JUnit XML report

## Code Generation

Generate test code using Playwright's codegen:
```bash
npm run codegen
```

## Test Examples

### Using Page Objects
```typescript
import { test, expect } from '@playwright/test';
import { GoogleHomePage } from '../../src/pages/GoogleHomePage';

test('Search on Google', async ({ page }) => {
  const googlePage = new GoogleHomePage(page);
  
  await googlePage.navigateToGoogle();
  await googlePage.search('Playwright testing');
  
  const url = googlePage.getCurrentUrl();
  expect(url).toContain('search');
});
```

### Using Test Data from Excel
```typescript
import { dataManager } from '../../src/utils/DataManager';

test('Data-driven test', async ({ page }) => {
  const testData = dataManager.getExecutableLoginData();
  
  for (const data of testData) {
    // Use data.email, data.password, etc.
  }
});
```

### Using Configuration
```typescript
import { configManager } from '../../src/utils/ConfigManager';

const baseUrl = configManager.getBaseUrl();
const credentials = configManager.getCredentials();
```

## Utilities Available

### CommonUtils
- `safeClick()` - Wait and click
- `safeFill()` - Clear and fill input
- `waitForPageLoad()` - Wait for page load
- `takeScreenshot()` - Capture screenshot
- `scrollToElement()` - Scroll to element
- `retry()` - Retry function execution
- And many more...

### DataManager
- `generateRandomUserData()` - Generate random user
- `generateSecurePassword()` - Generate secure password
- `getExecutableLoginData()` - Get login test data
- `maskSensitiveData()` - Mask passwords for logging

### Logger
- `logger.info()` - Info message
- `logger.error()` - Error message
- `logger.step()` - Test step
- `logger.testStart()` - Test start marker
- `logger.testEnd()` - Test end marker

## Best Practices

1. **Page Objects**: Keep all page-specific locators and methods in page classes
2. **Data-Driven**: Use Excel for test data that changes frequently
3. **Configuration**: Use config files for environment-specific values
4. **Logging**: Use logger for important steps and debugging
5. **Screenshots**: Capture screenshots on failures automatically
6. **Assertions**: Use Playwright's built-in assertions

## Troubleshooting

### Common Issues

1. **Browser not found**
   ```bash
   npx playwright install
   ```

2. **Test timeout**
   - Increase timeout in `playwright.config.ts`
   - Check network connectivity

3. **Element not found**
   - Verify locator is correct
   - Add appropriate waits

4. **Excel file errors**
   - Ensure file exists at configured path
   - Check column names match expected format

## Contributing

1. Follow the existing code structure
2. Add appropriate logging
3. Include screenshots for failures
4. Update README for new features

## License

ISC License
