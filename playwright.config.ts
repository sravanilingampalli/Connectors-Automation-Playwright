import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { environment } from './src/config/environment';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const isCI = !!process.env.CI;
const reportFolder = path.resolve(__dirname, 'playwright-report');
const authDir = path.resolve(__dirname, 'playwright/.auth');

function getVideoMode(): 'on' | 'off' | 'retain-on-failure' | 'on-first-retry' {
  const mode = process.env.RECORD_VIDEO ?? 'on';
  if (mode === 'off' || mode === 'on' || mode === 'retain-on-failure' || mode === 'on-first-retry') {
    return mode;
  }
  return 'on';
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: environment.timeout,

  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: reportFolder,
        open: isCI ? 'never' : 'on-failure',
      },
    ],
  ],

  globalSetup: require.resolve('./global-setup/global-setup'),
  globalTeardown: require.resolve('./global-teardown/global-teardown'),

  use: {
    baseURL: environment.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: {
      mode: getVideoMode(),
      size: { width: 1280, height: 720 },
    },
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
  },

  projects: [
    {
      name: 'chromium-end-user',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'endUser.json'),
      },
    },
    {
      name: 'chromium-app-manager',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'appManager.json'),
      },
    },
  ],

  outputDir: 'test-results',
});
