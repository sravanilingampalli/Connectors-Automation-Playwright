import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { AUTH_DIR, PROJECT_ROOT, TEST_RESULTS_DIR } from '@core/constants/paths';
import { environment } from '@core/config/environment';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const isCI = !!process.env.CI;
const testRoot = path.join(PROJECT_ROOT, 'src', 'modules', 'es-connectors', 'tests');
const reportFolder = path.join(PROJECT_ROOT, 'playwright-report');

function getVideoMode(): 'on' | 'off' | 'retain-on-failure' | 'on-first-retry' {
  const mode = process.env.RECORD_VIDEO ?? 'on';
  if (mode === 'off' || mode === 'on' || mode === 'retain-on-failure' || mode === 'on-first-retry') {
    return mode;
  }
  return 'on';
}

const sharedBrowserConfig = {
  ...devices['Desktop Chrome'],
  baseURL: environment.baseUrl,
  trace: 'retain-on-failure' as const,
  screenshot: 'only-on-failure' as const,
  video: {
    mode: getVideoMode(),
    size: { width: 1280, height: 720 },
  },
  actionTimeout: 30_000,
  navigationTimeout: 60_000,
};

export default defineConfig({
  testDir: testRoot,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: environment.timeout,
  globalSetup: path.join(PROJECT_ROOT, 'global-setup', 'global-setup.ts'),
  globalTeardown: path.join(PROJECT_ROOT, 'global-teardown', 'global-teardown.ts'),
  reporter: [
    ['list'],
    ['html', { outputFolder: reportFolder, open: isCI ? 'never' : 'on-failure' }],
  ],
  outputDir: TEST_RESULTS_DIR,
  projects: [
    {
      name: 'chromium-end-user',
      testDir: testRoot,
      use: {
        ...sharedBrowserConfig,
        storageState: path.join(AUTH_DIR, 'endUser.json'),
      },
    },
    {
      name: 'chromium-app-manager',
      testDir: testRoot,
      use: {
        ...sharedBrowserConfig,
        storageState: path.join(AUTH_DIR, 'appManager.json'),
      },
    },
  ],
});
