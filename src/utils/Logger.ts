import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Log Level Type
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

/**
 * Logger Configuration Interface
 */
export interface LoggerConfig {
  level: LogLevel;
  logDir: string;
  consoleOutput: boolean;
  fileOutput: boolean;
}

/**
 * Custom Logger Class
 * Provides structured logging for test automation framework
 */
class Logger {
  private static instance: Logger;
  private logger: winston.Logger;
  private config: LoggerConfig;

  private constructor() {
    this.config = {
      level: 'info',
      logDir: path.join(process.cwd(), 'logs'),
      consoleOutput: true,
      fileOutput: true,
    };

    this.ensureLogDirectory();
    this.logger = this.createLogger();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.config.logDir)) {
      fs.mkdirSync(this.config.logDir, { recursive: true });
    }
  }

  /**
   * Create Winston logger instance
   */
  private createLogger(): winston.Logger {
    const timestamp = new Date().toISOString().split('T')[0];
    
    const transports: winston.transport[] = [];

    // Console transport
    if (this.config.consoleOutput) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
          ),
        })
      );
    }

    // File transport for all logs
    if (this.config.fileOutput) {
      transports.push(
        new winston.transports.File({
          filename: path.join(this.config.logDir, `test-${timestamp}.log`),
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.json()
          ),
        })
      );

      // Separate error log file
      transports.push(
        new winston.transports.File({
          filename: path.join(this.config.logDir, `error-${timestamp}.log`),
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.json()
          ),
        })
      );
    }

    return winston.createLogger({
      level: this.config.level,
      transports,
    });
  }

  /**
   * Log info message
   */
  public info(message: string, meta?: object): void {
    this.logger.info(message, meta);
  }

  /**
   * Log error message
   */
  public error(message: string, error?: Error | object): void {
    if (error instanceof Error) {
      this.logger.error(message, {
        errorMessage: error.message,
        stack: error.stack,
      });
    } else {
      this.logger.error(message, error);
    }
  }

  /**
   * Log warning message
   */
  public warn(message: string, meta?: object): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log debug message
   */
  public debug(message: string, meta?: object): void {
    this.logger.debug(message, meta);
  }

  /**
   * Log verbose message
   */
  public verbose(message: string, meta?: object): void {
    this.logger.verbose(message, meta);
  }

  /**
   * Log test step
   */
  public step(stepNumber: number, description: string): void {
    this.info(`Step ${stepNumber}: ${description}`);
  }

  /**
   * Log test start
   */
  public testStart(testName: string): void {
    this.info('═'.repeat(60));
    this.info(`TEST STARTED: ${testName}`);
    this.info('═'.repeat(60));
  }

  /**
   * Log test end
   */
  public testEnd(testName: string, status: 'PASSED' | 'FAILED' | 'SKIPPED'): void {
    this.info('─'.repeat(60));
    this.info(`TEST ${status}: ${testName}`);
    this.info('═'.repeat(60));
  }

  /**
   * Log action
   */
  public action(action: string, element?: string): void {
    const msg = element ? `${action} on element: ${element}` : action;
    this.info(`ACTION: ${msg}`);
  }

  /**
   * Log assertion
   */
  public assertion(description: string, passed: boolean): void {
    const status = passed ? 'PASSED' : 'FAILED';
    this.info(`ASSERTION ${status}: ${description}`);
  }

  /**
   * Log navigation
   */
  public navigation(url: string): void {
    this.info(`NAVIGATION: Navigating to ${url}`);
  }

  /**
   * Log screenshot
   */
  public screenshot(path: string): void {
    this.info(`SCREENSHOT: Captured at ${path}`);
  }

  /**
   * Set log level
   */
  public setLevel(level: LogLevel): void {
    this.config.level = level;
    this.logger.level = level;
  }

  /**
   * Get current log level
   */
  public getLevel(): LogLevel {
    return this.config.level as LogLevel;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export Logger class for custom instances
export { Logger };
