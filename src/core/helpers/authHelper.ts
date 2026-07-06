import { Browser, BrowserContext, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { environment } from '@core/config/environment';
import { getUser, UserRole } from '@core/config/users';
import { LoginPage } from '@core/ui/pages/loginPage';
import { logger } from '@core/utils/logger';
import { AUTH_DIR } from '@core/constants/paths';
export function getAuthFilePath(role: UserRole): string {
  return path.join(AUTH_DIR, `${role}.json`);
}

export async function saveAuthState(context: BrowserContext, role: UserRole): Promise<void> {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const authFile = getAuthFilePath(role);
  await context.storageState({ path: authFile });
  logger.info(`Auth state saved for ${role}: ${authFile}`);
}

export async function loginAs(
  page: Page,
  role: UserRole,
): Promise<void> {
  const user = getUser(role);
  const loginPage = new LoginPage(page);
  await loginPage.login(user.email, user.password);
}

export async function createAuthenticatedContext(
  browser: Browser,
  role: UserRole,
): Promise<BrowserContext> {
  const context = await browser.newContext({ baseURL: environment.baseUrl });
  const page = await context.newPage();

  try {
    await loginAs(page, role);
    await saveAuthState(context, role);
    return context;
  } catch (error) {
    await context.close();
    throw error;
  }
}
