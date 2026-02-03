import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Excel Data Row Interface
 * Generic interface for Excel row data
 */
export interface ExcelDataRow {
  [key: string]: string | number | boolean | null;
}

/**
 * User Registration Data Interface
 */
export interface UserRegistrationData {
  testCaseId: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  gender: string;
  recoveryEmail: string;
  phoneNumber: string;
  execute: boolean;
}

/**
 * Login Test Data Interface
 */
export interface LoginTestData {
  testCaseId: string;
  email: string;
  password: string;
  expectedResult: string;
  execute: boolean;
}

/**
 * Search Test Data Interface
 */
export interface SearchTestData {
  testCaseId: string;
  searchQuery: string;
  expectedResultContains: string;
  execute: boolean;
}

/**
 * ExcelReader Class
 * Handles reading and writing Excel files for test data management
 */
export class ExcelReader {
  private workbook: XLSX.WorkBook | null = null;
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(__dirname, '../testdata/testData.xlsx');
  }

  /**
   * Load Excel workbook from file
   */
  public loadWorkbook(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        this.workbook = XLSX.readFile(this.filePath);
      } else {
        console.warn(`Excel file not found at ${this.filePath}. Creating new workbook.`);
        this.workbook = XLSX.utils.book_new();
      }
    } catch (error) {
      console.error('Error loading Excel file:', error);
      throw error;
    }
  }

  /**
   * Get all sheet names from workbook
   */
  public getSheetNames(): string[] {
    if (!this.workbook) {
      this.loadWorkbook();
    }
    return this.workbook?.SheetNames || [];
  }

  /**
   * Read data from a specific sheet
   */
  public readSheet<T extends ExcelDataRow>(sheetName: string): T[] {
    if (!this.workbook) {
      this.loadWorkbook();
    }

    const sheet = this.workbook?.Sheets[sheetName];
    if (!sheet) {
      console.warn(`Sheet "${sheetName}" not found in workbook.`);
      return [];
    }

    const data = XLSX.utils.sheet_to_json<T>(sheet, {
      defval: null,
      raw: false,
    });

    return data;
  }

  /**
   * Read user registration data from Excel
   */
  public readUserRegistrationData(): UserRegistrationData[] {
    const data = this.readSheet<ExcelDataRow>('UserRegistration');
    return data.map((row) => ({
      testCaseId: String(row['TestCaseId'] || ''),
      firstName: String(row['FirstName'] || ''),
      lastName: String(row['LastName'] || ''),
      username: String(row['Username'] || ''),
      password: String(row['Password'] || ''),
      confirmPassword: String(row['ConfirmPassword'] || ''),
      birthMonth: String(row['BirthMonth'] || ''),
      birthDay: String(row['BirthDay'] || ''),
      birthYear: String(row['BirthYear'] || ''),
      gender: String(row['Gender'] || ''),
      recoveryEmail: String(row['RecoveryEmail'] || ''),
      phoneNumber: String(row['PhoneNumber'] || ''),
      execute: row['Execute'] === 'Yes' || row['Execute'] === true || row['Execute'] === 'TRUE',
    }));
  }

  /**
   * Read login test data from Excel
   */
  public readLoginTestData(): LoginTestData[] {
    const data = this.readSheet<ExcelDataRow>('LoginData');
    return data.map((row) => ({
      testCaseId: String(row['TestCaseId'] || ''),
      email: String(row['Email'] || ''),
      password: String(row['Password'] || ''),
      expectedResult: String(row['ExpectedResult'] || ''),
      execute: row['Execute'] === 'Yes' || row['Execute'] === true || row['Execute'] === 'TRUE',
    }));
  }

  /**
   * Read search test data from Excel
   */
  public readSearchTestData(): SearchTestData[] {
    const data = this.readSheet<ExcelDataRow>('SearchData');
    return data.map((row) => ({
      testCaseId: String(row['TestCaseId'] || ''),
      searchQuery: String(row['SearchQuery'] || ''),
      expectedResultContains: String(row['ExpectedResultContains'] || ''),
      execute: row['Execute'] === 'Yes' || row['Execute'] === true || row['Execute'] === 'TRUE',
    }));
  }

  /**
   * Get executable test data only (filtered by Execute flag)
   */
  public getExecutableUserRegistrationData(): UserRegistrationData[] {
    return this.readUserRegistrationData().filter((data) => data.execute);
  }

  /**
   * Get executable login data only
   */
  public getExecutableLoginData(): LoginTestData[] {
    return this.readLoginTestData().filter((data) => data.execute);
  }

  /**
   * Get executable search data only
   */
  public getExecutableSearchData(): SearchTestData[] {
    return this.readSearchTestData().filter((data) => data.execute);
  }

  /**
   * Write data to a sheet
   */
  public writeToSheet(sheetName: string, data: ExcelDataRow[]): void {
    if (!this.workbook) {
      this.workbook = XLSX.utils.book_new();
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Remove existing sheet if it exists
    const existingIndex = this.workbook.SheetNames.indexOf(sheetName);
    if (existingIndex !== -1) {
      delete this.workbook.Sheets[sheetName];
      this.workbook.SheetNames.splice(existingIndex, 1);
    }

    XLSX.utils.book_append_sheet(this.workbook, worksheet, sheetName);
  }

  /**
   * Save workbook to file
   */
  public saveWorkbook(outputPath?: string): void {
    if (!this.workbook) {
      throw new Error('No workbook loaded to save.');
    }

    const savePath = outputPath || this.filePath;
    
    // Ensure directory exists
    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    XLSX.writeFile(this.workbook, savePath);
    console.log(`Workbook saved to ${savePath}`);
  }

  /**
   * Create sample test data Excel file
   */
  public createSampleTestDataFile(): void {
    this.workbook = XLSX.utils.book_new();

    // User Registration Sample Data
    const userRegistrationData = [
      {
        TestCaseId: 'TC_REG_001',
        FirstName: 'John',
        LastName: 'Doe',
        Username: 'johndoe.test',
        Password: 'SecurePass123!',
        ConfirmPassword: 'SecurePass123!',
        BirthMonth: 'January',
        BirthDay: '15',
        BirthYear: '1990',
        Gender: 'Male',
        RecoveryEmail: 'recovery@example.com',
        PhoneNumber: '+1234567890',
        Execute: 'Yes',
      },
      {
        TestCaseId: 'TC_REG_002',
        FirstName: 'Jane',
        LastName: 'Smith',
        Username: 'janesmith.test',
        Password: 'TestPass456!',
        ConfirmPassword: 'TestPass456!',
        BirthMonth: 'March',
        BirthDay: '20',
        BirthYear: '1985',
        Gender: 'Female',
        RecoveryEmail: 'jane.recovery@example.com',
        PhoneNumber: '+0987654321',
        Execute: 'Yes',
      },
    ];

    // Login Test Data
    const loginTestData = [
      {
        TestCaseId: 'TC_LOGIN_001',
        Email: 'testuser@gmail.com',
        Password: 'ValidPassword123!',
        ExpectedResult: 'Success',
        Execute: 'Yes',
      },
      {
        TestCaseId: 'TC_LOGIN_002',
        Email: 'invalid@gmail.com',
        Password: 'WrongPassword',
        ExpectedResult: 'InvalidCredentials',
        Execute: 'Yes',
      },
      {
        TestCaseId: 'TC_LOGIN_003',
        Email: '',
        Password: 'SomePassword',
        ExpectedResult: 'EmptyEmail',
        Execute: 'No',
      },
    ];

    // Search Test Data
    const searchTestData = [
      {
        TestCaseId: 'TC_SEARCH_001',
        SearchQuery: 'Playwright automation',
        ExpectedResultContains: 'playwright',
        Execute: 'Yes',
      },
      {
        TestCaseId: 'TC_SEARCH_002',
        SearchQuery: 'TypeScript tutorial',
        ExpectedResultContains: 'typescript',
        Execute: 'Yes',
      },
    ];

    this.writeToSheet('UserRegistration', userRegistrationData);
    this.writeToSheet('LoginData', loginTestData);
    this.writeToSheet('SearchData', searchTestData);

    this.saveWorkbook();
  }

  /**
   * Get specific row by test case ID
   */
  public getRowByTestCaseId<T extends { testCaseId: string }>(
    data: T[],
    testCaseId: string
  ): T | undefined {
    return data.find((row) => row.testCaseId === testCaseId);
  }

  /**
   * Update cell value
   */
  public updateCell(
    sheetName: string,
    rowIndex: number,
    columnName: string,
    value: string | number | boolean
  ): void {
    if (!this.workbook) {
      this.loadWorkbook();
    }

    const sheet = this.workbook?.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found.`);
    }

    // Get column index from header
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    let columnIndex = -1;

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      const cell = sheet[cellAddress];
      if (cell && cell.v === columnName) {
        columnIndex = col;
        break;
      }
    }

    if (columnIndex === -1) {
      throw new Error(`Column "${columnName}" not found in sheet "${sheetName}".`);
    }

    // Update cell
    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 1, c: columnIndex });
    sheet[cellAddress] = { t: typeof value === 'number' ? 'n' : 's', v: value };
  }
}

// Export singleton instance
export const excelReader = new ExcelReader();
