import { test as baseTest } from '@playwright/test';

export function requireAppManagerProject(): void {
  baseTest.skip(
    baseTest.info().project.name !== 'chromium-app-manager',
    'Runs only for App Manager project',
  );
}
