import { chromium, FullConfig } from '@playwright/test';
import { environment } from '@core/config/environment';
import { UserRole } from '@core/config/users';
import { createAuthenticatedContext } from '@core/helpers/authHelper';
import { logger } from '@core/utils/logger';

const ROLES_TO_AUTHENTICATE: UserRole[] = ['endUser', 'appManager'];

async function globalSetup(_config: FullConfig): Promise<void> {
  logger.info('Global setup started');
  logger.info(`Environment: ${environment.name}`);
  logger.info(`Base URL: ${environment.baseUrl}`);

  const browser = await chromium.launch();

  try {
    for (const role of ROLES_TO_AUTHENTICATE) {
      logger.info(`Authenticating as ${role}...`);
      const context = await createAuthenticatedContext(browser, role);
      await context.close();
    }
  } catch (error) {
    logger.error('Global setup failed', error);
    throw error;
  } finally {
    await browser.close();
    logger.info('Global setup completed');
  }
}

export default globalSetup;
