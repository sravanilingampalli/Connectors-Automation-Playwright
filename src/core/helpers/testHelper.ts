import { test as baseTest } from '@playwright/test';

export function requireAppManagerProject(): void {
  const projectName = baseTest.info().project.name;
  const isAppManagerProject =
    projectName === 'chromium-app-manager' || projectName === 'chromium-app-manager-confluence';

  baseTest.skip(!isAppManagerProject, 'Runs only for App Manager project');
}

export function requireEndUserProject(): void {
  const projectName = baseTest.info().project.name;
  const isEndUserProject =
    projectName === 'chromium-end-user' || projectName === 'chromium-end-user-confluence';

  baseTest.skip(!isEndUserProject, 'Runs only for End User project');
}
