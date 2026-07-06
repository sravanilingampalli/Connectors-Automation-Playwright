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

function getTraceMode(): 'on' | 'off' | 'retain-on-failure' | 'on-first-retry' {
  if (process.env.RECORD_FULL === '1' || process.env.RECORD_TRACE === 'on') {
    return 'on';
  }
  const mode = process.env.RECORD_TRACE ?? 'retain-on-failure';
  if (mode === 'off' || mode === 'on' || mode === 'retain-on-failure' || mode === 'on-first-retry') {
    return mode;
  }
  return 'retain-on-failure';
}

function getScreenshotMode(): 'on' | 'off' | 'only-on-failure' | 'on-first-retry' {
  if (process.env.RECORD_FULL === '1' || process.env.RECORD_SCREENSHOT === 'on') {
    return 'on';
  }
  const mode = process.env.RECORD_SCREENSHOT ?? 'only-on-failure';
  if (mode === 'off' || mode === 'on' || mode === 'only-on-failure' || mode === 'on-first-retry') {
    return mode;
  }
  return 'only-on-failure';
}

const recordFullSession = process.env.RECORD_FULL === '1';

const recordedSessionConfig = {
  viewport: { width: 1920, height: 1080 },
  trace: 'on' as const,
  screenshot: 'on' as const,
  video: {
    mode: 'on' as const,
    size: { width: 1920, height: 1080 },
  },
};

const sharedBrowserConfig = {
  ...devices['Desktop Chrome'],
  baseURL: environment.baseUrl,
  viewport: recordFullSession ? recordedSessionConfig.viewport : devices['Desktop Chrome'].viewport,
  trace: getTraceMode(),
  screenshot: getScreenshotMode(),
  video: {
    mode: getVideoMode(),
    size: recordFullSession ? recordedSessionConfig.video.size : { width: 1280, height: 720 },
  },
  actionTimeout: 30_000,
  navigationTimeout: 60_000,
};

const confluenceTestDir = path.join(testRoot, 'ui-tests', 'confluence');

export default defineConfig({
  testDir: testRoot,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: recordFullSession ? 900_000 : environment.timeout,
  globalSetup: path.join(PROJECT_ROOT, 'global-setup', 'global-setup.ts'),
  globalTeardown: path.join(PROJECT_ROOT, 'global-teardown', 'global-teardown.ts'),
  reporter: [
    ['list'],
    ['html', { outputFolder: reportFolder, open: 'never' }],
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
    {
      name: 'chromium-app-manager-confluence',
      testDir: confluenceTestDir,
      testMatch: '**/*.spec.ts',
      fullyParallel: false,
      timeout: 3_600_000,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: environment.baseUrl,
        storageState: path.join(AUTH_DIR, 'appManager.json'),
        ...recordedSessionConfig,
        actionTimeout: 30_000,
        navigationTimeout: 60_000,
      },
    },
    {
      name: 'chromium-confluence-only',
      testDir: confluenceTestDir,
      testMatch: '**/*page-deletion*.spec.ts',
      fullyParallel: false,
      timeout: 600_000,
      use: {
        ...devices['Desktop Chrome'],
        ...recordedSessionConfig,
        actionTimeout: 30_000,
        navigationTimeout: 60_000,
      },
    },
    {
      name: 'chromium-end-user-confluence',
      testDir: confluenceTestDir,
      testMatch: '**/*{audience-search-results,new-page-full-sync,smart-answer,page-deletion-search}*.spec.ts',
      fullyParallel: false,
      timeout: 3_600_000,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: environment.baseUrl,
        storageState: path.join(AUTH_DIR, 'endUser.json'),
        ...recordedSessionConfig,
        actionTimeout: 30_000,
        navigationTimeout: 60_000,
      },
    },
  ],
});
