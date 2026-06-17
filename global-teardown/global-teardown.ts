import { FullConfig } from '@playwright/test';
import path from 'path';
import { logger } from '@core/utils/logger';

async function globalTeardown(_config: FullConfig): Promise<void> {
  logger.info('Global teardown started');

  const reportPath = path.resolve(__dirname, '../playwright-report/index.html');
  logger.info(`Playwright HTML report: ${reportPath}`);
  logger.info('View report anytime with: npm run test:report');

  logger.info('Global teardown completed');
}

export default globalTeardown;
