import { FullConfig } from '@playwright/test';
import { logger } from './Logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global Teardown Function
 * Runs once after all tests complete
 */
async function globalTeardown(config: FullConfig): Promise<void> {
  logger.info('═'.repeat(60));
  logger.info('GLOBAL TEARDOWN: Starting test suite cleanup');
  logger.info('═'.repeat(60));

  // Calculate test duration
  const startTime = process.env.TEST_START_TIME;
  if (startTime) {
    const endTime = new Date();
    const duration = endTime.getTime() - new Date(startTime).getTime();
    const durationMinutes = Math.floor(duration / 60000);
    const durationSeconds = Math.floor((duration % 60000) / 1000);
    
    logger.info(`Total test duration: ${durationMinutes}m ${durationSeconds}s`);
  }

  // Generate summary report
  const resultsPath = path.join(process.cwd(), 'test-results/results.json');
  if (fs.existsSync(resultsPath)) {
    try {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
      
      const summary = {
        totalTests: results.suites?.length || 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: results.stats?.duration || 0,
      };

      // Count test results
      const countResults = (suites: any[]) => {
        for (const suite of suites || []) {
          for (const spec of suite.specs || []) {
            for (const test of spec.tests || []) {
              if (test.status === 'passed' || test.status === 'expected') {
                summary.passed++;
              } else if (test.status === 'failed' || test.status === 'unexpected') {
                summary.failed++;
              } else if (test.status === 'skipped') {
                summary.skipped++;
              }
            }
          }
          if (suite.suites) {
            countResults(suite.suites);
          }
        }
      };

      countResults(results.suites);

      logger.info('Test Summary:', summary);

      // Write summary to file
      const summaryPath = path.join(process.cwd(), 'test-results/summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      logger.info(`Summary written to: ${summaryPath}`);
    } catch (error) {
      logger.warn('Could not generate test summary', { error });
    }
  }

  // Cleanup old artifacts (optional - keep last 5 runs)
  const artifactsDir = path.join(process.cwd(), 'test-results/artifacts');
  if (fs.existsSync(artifactsDir)) {
    const files = fs.readdirSync(artifactsDir);
    logger.info(`Artifacts generated: ${files.length} files`);
  }

  logger.info('GLOBAL TEARDOWN: Cleanup completed');
  logger.info('═'.repeat(60));
}

export default globalTeardown;
