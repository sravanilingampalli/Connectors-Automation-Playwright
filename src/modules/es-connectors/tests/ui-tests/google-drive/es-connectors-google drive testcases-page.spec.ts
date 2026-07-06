import { test, expect } from '@es-connectors/fixtures/esConnectorsFixture';
import { ENTERPRISE_SEARCH, ROUTES } from '@es-connectors/constants';
import { EsConnectorsSuiteTags } from '@es-connectors/constants/testTags';
import {
  getGoogleDriveConnectorConfig,
  getGoogleDriveSyncConfig,
  getGoogleDriveVerificationConfig,
} from '@es-connectors/test-data/google-drive';
import { GoogleDrive2AudienceFilterConfig } from '@es-connectors/types/connectorTypes';
import { ESConnectorsGoogleDrivePage } from '@es-connectors/ui/pages/esConnectorsGoogleDrivePage';
import { ESConnectorsAdminPanelPage } from '@es-connectors/ui/pages/esConnectorsAdminPanelPage';
import { EnterpriseSearchNavigationPage } from '@es-connectors/ui/pages/enterpriseSearchNavigationPage';
import { Browser, BrowserContext, devices, Page, TestInfo } from '@playwright/test';
import path from 'path';
import { AUTH_DIR } from '@core/constants/paths';
import { environment } from '@core/config/environment';
import { closeContextAndAttachVideo, withRecordedVideo } from '@core/helpers/videoHelper';
import { EnterpriseSearchEndUserPage } from '@core/ui/pages/enterpriseSearchEndUserPage';
import { LoginPage } from '@core/ui/pages/loginPage';
import { getUser } from '@core/config/users';
import { requireAppManagerProject } from '@core/helpers/testHelper';

const recordedViewport = { width: 1920, height: 1080 };

test.describe.configure({ mode: 'serial' });

const GOOGLE_DRIVE_26_CONNECTOR_NAME = 'Google drive 26';

function getGoogleDrive26ConnectorNamePattern(): RegExp {
  const connectorName =
    process.env.GOOGLE_DRIVE_CONNECTOR_NAME?.trim() || GOOGLE_DRIVE_26_CONNECTOR_NAME;
  const escapedName = connectorName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escapedName, 'i');
}

function getGoogleDrive26AudienceFilterConfig(): GoogleDrive2AudienceFilterConfig {
  const filterMode = process.env.GOOGLE_DRIVE_AUDIENCE_FILTER_MODE?.trim();
  return {
    parentAudienceName: process.env.GOOGLE_DRIVE_AUDIENCE_PARENT_NAME?.trim() || 'test',
    audienceName: process.env.GOOGLE_DRIVE_AUDIENCE_NAME?.trim() || 'outlook',
    filterMode: filterMode === 'include' ? 'include' : 'exclude',
  };
}

function getGoogleDrive26ModifiedBeforeFilterConfig(): { day: number; month: string; year: number } {
  return {
    day: Number(process.env.GOOGLE_DRIVE_MODIFIED_BEFORE_DAY ?? 24),
    month: process.env.GOOGLE_DRIVE_MODIFIED_BEFORE_MONTH?.trim() || 'June',
    year: Number(process.env.GOOGLE_DRIVE_MODIFIED_BEFORE_YEAR ?? 2026),
  };
}

function getGoogleDrive26FileSizeFilterConfig(): { size: string } {
  return {
    size: process.env.GOOGLE_DRIVE_FILE_SIZE_LIMIT?.trim() || '1GB',
  };
}

function getGoogleDrive26ExcludedFileTypeConfig(): { fileType: string } {
  return {
    fileType: process.env.GOOGLE_DRIVE_EXCLUDED_FILE_TYPE?.trim() || 'pdf',
  };
}

function getGoogleDrive26IncludeFolderConfig(): { folderUrl: string } {
  return {
    folderUrl:
      process.env.GOOGLE_DRIVE_INCLUDE_FOLDER_URL?.trim() ||
      'https://drive.google.com/drive/u/2/folders/1quZkuJ1XH9UDVJE5r1jhueeyp2nVW6wE',
  };
}

function getGoogleDrive26ExcludeFolderConfig(): { folderUrl: string } {
  return {
    folderUrl:
      process.env.GOOGLE_DRIVE_EXCLUDE_FOLDER_URL?.trim() ||
      'https://drive.google.com/drive/u/2/folders/1quZkuJ1XH9UDVJE5r1jhueeyp2nVW6wE',
  };
}

async function createEndUserBrowserContext(
  browser: Browser,
  testInfo: TestInfo,
  useSavedSession: boolean,
): Promise<{
  context: BrowserContext;
  enterpriseSearchEndUser: EnterpriseSearchEndUserPage;
  page: Page;
}> {
  const context = await browser.newContext(
    withRecordedVideo(testInfo, {
      ...devices['Desktop Chrome'],
      baseURL: environment.baseUrl,
      viewport: recordedViewport,
      ...(useSavedSession ? { storageState: path.join(AUTH_DIR, 'endUser.json') } : {}),
    }),
  );
  const page = await context.newPage();
  return { context, page, enterpriseSearchEndUser: new EnterpriseSearchEndUserPage(page) };
}

test.describe(
  `ESConnectors ${EsConnectorsSuiteTags.GOOGLE_DRIVE} @ESConnectorsGoogleDrive26ConfigurationPage`,
  () => {
    let activeConnectorName = '';

    test.beforeEach(() => {
      requireAppManagerProject();
    });

    async function launchApp(page: Page): Promise<void> {
      await page.goto(ROUTES.home, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/home/i);
    }

    async function navigateToEnterpriseSearch(
      enterpriseSearchNavigation: EnterpriseSearchNavigationPage,
      esConnectorsAdminPanel: ESConnectorsAdminPanelPage,
    ): Promise<void> {
      await enterpriseSearchNavigation.navigateToEnterpriseSearch();
      await esConnectorsAdminPanel.waitForPageLoad();
      await esConnectorsAdminPanel.expectAddSourceVisible();
    }

    async function openGoogleDrive26Connector(
      esConnectorsGoogleDrive: ESConnectorsGoogleDrivePage,
      connectorNamePattern = getGoogleDrive26ConnectorNamePattern(),
    ): Promise<string> {
      const configuredName = process.env.GOOGLE_DRIVE_CONNECTOR_NAME?.trim() || GOOGLE_DRIVE_26_CONNECTOR_NAME;
      const connectorName = await esConnectorsGoogleDrive.tryOpenLatestConnectorFromSources(connectorNamePattern);

      expect(
        connectorName,
        `Expected Google Drive connector "${configuredName}" on Sources. Run the create-connector test first or set GOOGLE_DRIVE_CONNECTOR_NAME in .env.`,
      ).not.toBeNull();
      await esConnectorsGoogleDrive.ensureStep2CompletedIfPresent();
      return connectorName as string;
    }

    test('Create and save Google drive 26 connector', async ({
      page,
      enterpriseSearchNavigation,
      esConnectorsAdminPanel,
      esConnectorsGoogleDrive,
    }) => {
      test.setTimeout(600_000);

      const googleDriveConfig = {
        ...getGoogleDriveConnectorConfig(),
        connectorName: process.env.GOOGLE_DRIVE_CONNECTOR_NAME?.trim() || GOOGLE_DRIVE_26_CONNECTOR_NAME,
      };
      const connectorNamePattern = getGoogleDrive26ConnectorNamePattern();

      await test.step('Given the app manager launches the application', async () => {
        await launchApp(page);
      });

      await test.step('When the user navigates to Enterprise search', async () => {
        await navigateToEnterpriseSearch(enterpriseSearchNavigation, esConnectorsAdminPanel);
      });

      const reusedConnectorName = await test.step(
        'And opens Google drive 26 connector when available',
        async () => esConnectorsGoogleDrive.tryOpenLatestConnectorFromSources(connectorNamePattern),
      );

      if (reusedConnectorName) {
        activeConnectorName = reusedConnectorName;
        await esConnectorsGoogleDrive.ensureStep2CompletedIfPresent();
        return;
      }

      await test.step('And clicks Add source and selects the Google Drive connector', async () => {
        await esConnectorsAdminPanel.clickAddSource();
        await esConnectorsAdminPanel.expectSourceListDisplayed();

        const sourceDialog = esConnectorsAdminPanel.getSourcePickerDialog();
        await expect(
          sourceDialog.getByRole('button', {
            name: new RegExp(`^${ENTERPRISE_SEARCH.googleDriveConnector}$`, 'i'),
          }),
        ).toBeVisible({ timeout: 30_000 });

        await esConnectorsGoogleDrive.selectGoogleDriveConnector();
        await esConnectorsGoogleDrive.expectSetupFormDisplayed();
      });

      await test.step('And enters Connection name, Admin email, and Service account JSON', async () => {
        await esConnectorsGoogleDrive.configureGoogleDriveConnector(googleDriveConfig);
      });

      await test.step('And clicks Save configuration', async () => {
        await esConnectorsGoogleDrive.saveConfiguration();
      });

      await test.step('Then the Google drive 26 connector configuration is saved successfully', async () => {
        activeConnectorName = googleDriveConfig.connectorName;
        await esConnectorsGoogleDrive.expectConnectorCreated(activeConnectorName);
      });
    });

    test('Enable Show in results on Configuration tab', async ({
      page,
      enterpriseSearchNavigation,
      esConnectorsAdminPanel,
      esConnectorsGoogleDrive,
    }) => {
      test.setTimeout(600_000);

      const googleDriveSyncConfig = getGoogleDriveSyncConfig();

      await test.step('Given the app manager launches the application', async () => {
        await launchApp(page);
      });

      await test.step('And opens the Google drive 26 connector', async () => {
        await navigateToEnterpriseSearch(enterpriseSearchNavigation, esConnectorsAdminPanel);
        activeConnectorName = await openGoogleDrive26Connector(esConnectorsGoogleDrive);
      });

      await test.step(`When the user opens Configuration and ${googleDriveSyncConfig.flow.enableShowInResults}`, async () => {
        await esConnectorsGoogleDrive.openConfigurationTabAfterConnectorSave();
        await esConnectorsGoogleDrive.enableShowInResults();
      });

      await test.step('Then the Show in results option should be visible and enabled', async () => {
        await esConnectorsGoogleDrive.expectShowInResultsVisible();
        await expect(esConnectorsGoogleDrive.getShowInResultsLabel()).toBeVisible();
        await expect(esConnectorsGoogleDrive.getShowInResultsToggle()).toBeVisible();
        await esConnectorsGoogleDrive.expectShowInResultsEnabled();
      });
    });

    test('Start full sync from Status dropdown and wait for sync complete', async ({
      page,
      enterpriseSearchNavigation,
      esConnectorsAdminPanel,
      esConnectorsGoogleDrive,
    }) => {
      test.setTimeout(3_600_000);

      const googleDriveSyncConfig = getGoogleDriveSyncConfig();

      await test.step('Given the app manager launches the application', async () => {
        await launchApp(page);
      });

      await test.step('And opens the Google drive 26 connector', async () => {
        activeConnectorName = await openGoogleDrive26Connector(esConnectorsGoogleDrive);
      });

      await test.step(`When the user ${googleDriveSyncConfig.flow.navigateToStatus}`, async () => {
        await esConnectorsGoogleDrive.openStatusTab(googleDriveSyncConfig);
        await esConnectorsGoogleDrive.expectStatusTabReady(googleDriveSyncConfig);
      });

      await test.step(`And ${googleDriveSyncConfig.flow.clickSyncDropdown} on the right side`, async () => {
        await esConnectorsGoogleDrive.openSyncDropdownMenu(googleDriveSyncConfig);
      });

      await test.step(`And ${googleDriveSyncConfig.flow.selectFullSync} from the menu`, async () => {
        await esConnectorsGoogleDrive.selectFullSync(googleDriveSyncConfig);
        await esConnectorsGoogleDrive.clickSyncAfterFullSyncSelection(googleDriveSyncConfig);
      });

      await test.step('Then the full sync process should start or already be in progress', async () => {
        await esConnectorsGoogleDrive.expectFullSyncStarted();
      });

      await test.step(`And ${googleDriveSyncConfig.flow.waitForSyncComplete}`, async () => {
        await esConnectorsGoogleDrive.waitForFullSyncComplete(googleDriveSyncConfig);
        await expect(esConnectorsGoogleDrive.getSyncCompleteStatus(googleDriveSyncConfig)).toBeVisible();
      });
    });

    test('Configure exclude audience filters on Data filters tab', async ({
      page,
      enterpriseSearchNavigation,
      esConnectorsAdminPanel,
      esConnectorsGoogleDrive,
    }) => {
      test.setTimeout(600_000);

      const googleDriveAudienceConfig = getGoogleDrive26AudienceFilterConfig();

      await test.step('Given the app manager launches the application', async () => {
        await launchApp(page);
      });

      await test.step('And opens the Google drive 26 connector', async () => {
        await navigateToEnterpriseSearch(enterpriseSearchNavigation, esConnectorsAdminPanel);
        activeConnectorName = await openGoogleDrive26Connector(esConnectorsGoogleDrive);
      });

      await test.step('When the user opens the Data filters tab', async () => {
        await esConnectorsGoogleDrive.openDataFiltersTab();
        await expect(esConnectorsGoogleDrive.getDataFiltersTab()).toHaveAttribute('aria-selected', 'true');
      });

      await test.step('And enables Audience access settings', async () => {
        await esConnectorsGoogleDrive.enableAudienceAccessSettings();
        await expect(esConnectorsGoogleDrive.getAudienceAccessSettingsLabel()).toBeVisible();
      });

      await test.step('And selects the Exclude radio button so the Browse button is displayed', async () => {
        await esConnectorsGoogleDrive.selectAudienceFilterMode('exclude');
        await expect(esConnectorsGoogleDrive.getAudienceBrowseButton()).toBeVisible({ timeout: 30_000 });
      });

      await test.step('And clicks the Browse button to open the audience popup', async () => {
        await esConnectorsGoogleDrive.openAudienceBrowseDialog();
      });

      await test.step(
        `And clicks Show more, expands ${googleDriveAudienceConfig.parentAudienceName}, and selects ${googleDriveAudienceConfig.audienceName}`,
        async () => {
          await esConnectorsGoogleDrive.revealAudienceFolderViaShowMore(googleDriveAudienceConfig.parentAudienceName);
          await esConnectorsGoogleDrive.expandAudienceFolderInPicker(googleDriveAudienceConfig.parentAudienceName);
          await esConnectorsGoogleDrive.selectAudienceCheckboxInPicker(googleDriveAudienceConfig.audienceName);
        },
      );

      await test.step('And clicks Done on the audience popup', async () => {
        await esConnectorsGoogleDrive.confirmAudienceBrowseSelection();
        await esConnectorsGoogleDrive.expectSelectedAudienceVisible(googleDriveAudienceConfig.audienceName);
      });

      await test.step('Then clicks Save & sync on Data filters', async () => {
        await esConnectorsGoogleDrive.saveAudienceFiltersAndSync();
        await esConnectorsGoogleDrive.expectSelectedAudienceVisible(googleDriveAudienceConfig.audienceName);
      });
    });

    test('Configure exclude modified before date filter on Data filters tab', async ({
      page,
      enterpriseSearchNavigation,
      esConnectorsAdminPanel,
      esConnectorsGoogleDrive,
    }) => {
      test.setTimeout(600_000);

      const modifiedBeforeConfig = getGoogleDrive26ModifiedBeforeFilterConfig();

      await test.step('Given the app manager launches the application', async () => {
        await launchApp(page);
      });

      await test.step('And opens the Google drive 26 connector', async () => {
        await navigateToEnterpriseSearch(enterpriseSearchNavigation, esConnectorsAdminPanel);
        activeConnectorName = await openGoogleDrive26Connector(esConnectorsGoogleDrive);
      });

      await test.step('When the user selects the Data filters tab', async () => {
        await esConnectorsGoogleDrive.openDataFiltersTab();
        await expect(esConnectorsGoogleDrive.getDataFiltersTab()).toHaveAttribute('aria-selected', 'true');
      });

      await test.step('And enables Exclude data files that were last modified before', async () => {
        await esConnectorsGoogleDrive.enableModifiedBeforeFilter();
        await expect(esConnectorsGoogleDrive.getModifiedBeforeFilterLabel()).toBeVisible();
      });

      await test.step('And clicks on the date column', async () => {
        await esConnectorsGoogleDrive.openModifiedBeforeDatePicker();
      });

      await test.step(`And selects ${modifiedBeforeConfig.month} from the first month dropdown`, async () => {
        await esConnectorsGoogleDrive.selectModifiedBeforeMonth(modifiedBeforeConfig.month);
      });

      await test.step(`And clicks on date ${modifiedBeforeConfig.day}`, async () => {
        await esConnectorsGoogleDrive.selectModifiedBeforeDay(modifiedBeforeConfig.day);
      });

      await test.step(`And selects ${modifiedBeforeConfig.year} from the year dropdown`, async () => {
        await esConnectorsGoogleDrive.selectModifiedBeforeYear(
          modifiedBeforeConfig.year,
          modifiedBeforeConfig.day,
        );
      });

      await test.step(
        `Then the modified date should be ${modifiedBeforeConfig.day} ${modifiedBeforeConfig.month}, ${modifiedBeforeConfig.year}`,
        async () => {
          await esConnectorsGoogleDrive.expectModifiedBeforeDateConfigured(modifiedBeforeConfig);
        },
      );

      await test.step('And clicks Save & sync on Data filters', async () => {
        await esConnectorsGoogleDrive.saveDataFiltersAndSync();
      });
    });

    test('Configure include specific folders on Data filters tab', async ({
      page,
      enterpriseSearchNavigation,
      esConnectorsAdminPanel,
      esConnectorsGoogleDrive,
    }) => {
      test.setTimeout(600_000);

      const includeFolderConfig = getGoogleDrive26IncludeFolderConfig();

      await test.step('Given the app manager launches the application', async () => {
        await launchApp(page);
      });

      await test.step('And opens the Google drive 26 connector', async () => {
        await navigateToEnterpriseSearch(enterpriseSearchNavigation, esConnectorsAdminPanel);
        activeConnectorName = await openGoogleDrive26Connector(esConnectorsGoogleDrive);
      });

      await test.step('When the user selects the Data filters tab', async () => {
        await esConnectorsGoogleDrive.openDataFiltersTab();
        await expect(esConnectorsGoogleDrive.getDataFiltersTab()).toHaveAttribute('aria-selected', 'true');
      });

      await test.step('And enables Include specific folders', async () => {
        await esConnectorsGoogleDrive.selectIncludeSpecificFolders();
        await expect(esConnectorsGoogleDrive.getIncludeSpecificFoldersRadio()).toBeChecked();
      });

      await test.step('And clicks the first folder URL cell', async () => {
        await esConnectorsGoogleDrive.clickFirstIncludeFolderUrlCell();
      });

      await test.step(`And enters folder URL ${includeFolderConfig.folderUrl}`, async () => {
        await esConnectorsGoogleDrive.fillFirstIncludeFolderUrl(includeFolderConfig.folderUrl);
      });

      await test.step('Then the first folder URL should be configured', async () => {
        await esConnectorsGoogleDrive.expectFirstIncludeFolderUrlConfigured(includeFolderConfig.folderUrl);
      });

      await test.step('And clicks Save & sync on Data filters', async () => {
        await esConnectorsGoogleDrive.saveDataFiltersAndSync();
      });
    });

    test('Configure exclude specific folders on Data filters tab', async ({
      page,
      enterpriseSearchNavigation,
      esConnectorsAdminPanel,
      esConnectorsGoogleDrive,
    }) => {
      test.setTimeout(600_000);

      const excludeFolderConfig = getGoogleDrive26ExcludeFolderConfig();

      await test.step('Given the app manager launches the application', async () => {
        await launchApp(page);
      });

      await test.step('And opens the Google drive 26 connector', async () => {
        await navigateToEnterpriseSearch(enterpriseSearchNavigation, esConnectorsAdminPanel);
        activeConnectorName = await openGoogleDrive26Connector(esConnectorsGoogleDrive);
      });

      await test.step('When the user selects the Data filters tab', async () => {
        await esConnectorsGoogleDrive.openDataFiltersTab();
        await expect(esConnectorsGoogleDrive.getDataFiltersTab()).toHaveAttribute('aria-selected', 'true');
      });

      await test.step('And enables Exclude specific folders', async () => {
        await esConnectorsGoogleDrive.selectExcludeSpecificFolders();
        await expect(esConnectorsGoogleDrive.getExcludeSpecificFoldersRadio()).toBeChecked();
      });

      await test.step('And clicks the first folder URL cell', async () => {
        await esConnectorsGoogleDrive.clickFirstExcludeFolderUrlCell();
      });

      await test.step(`And enters folder URL ${excludeFolderConfig.folderUrl}`, async () => {
        await esConnectorsGoogleDrive.fillFirstExcludeFolderUrl(excludeFolderConfig.folderUrl);
      });

      await test.step('Then the first folder URL should be configured', async () => {
        await esConnectorsGoogleDrive.expectFirstExcludeFolderUrlConfigured(excludeFolderConfig.folderUrl);
      });

      await test.step('And clicks Save & sync on Data filters', async () => {
        await esConnectorsGoogleDrive.saveDataFiltersAndSync();
      });
    });

    test('Disable audience access settings on Data filters tab', async ({
      page,
      enterpriseSearchNavigation,
      esConnectorsAdminPanel,
      esConnectorsGoogleDrive,
    }) => {
      test.setTimeout(600_000);

      await test.step('Given the app manager launches the application', async () => {
        await launchApp(page);
      });

      await test.step('And opens the Google drive 26 connector', async () => {
        await navigateToEnterpriseSearch(enterpriseSearchNavigation, esConnectorsAdminPanel);
        activeConnectorName = await openGoogleDrive26Connector(esConnectorsGoogleDrive);
      });

      await test.step('When the user opens the Data filters tab', async () => {
        await esConnectorsGoogleDrive.openDataFiltersTab();
        await expect(esConnectorsGoogleDrive.getDataFiltersTab()).toHaveAttribute('aria-selected', 'true');
      });

      await test.step('And disables Audience access settings', async () => {
        await esConnectorsGoogleDrive.disableAudienceAccessSettings();
      });

      await test.step('Then clicks Save & sync on Data filters', async () => {
        await esConnectorsGoogleDrive.saveDataFiltersAndSync();
      });
    });

    test('Configure exclude files larger than 1GB on Data filters tab', async ({
      page,
      enterpriseSearchNavigation,
      esConnectorsAdminPanel,
      esConnectorsGoogleDrive,
    }) => {
      test.setTimeout(600_000);

      const fileSizeConfig = getGoogleDrive26FileSizeFilterConfig();

      await test.step('Given the app manager launches the application', async () => {
        await launchApp(page);
      });

      await test.step('And opens the Google drive 26 connector', async () => {
        await navigateToEnterpriseSearch(enterpriseSearchNavigation, esConnectorsAdminPanel);
        activeConnectorName = await openGoogleDrive26Connector(esConnectorsGoogleDrive);
      });

      await test.step('When the user opens the Data filters tab', async () => {
        await esConnectorsGoogleDrive.openDataFiltersTab();
        await expect(esConnectorsGoogleDrive.getDataFiltersTab()).toHaveAttribute('aria-selected', 'true');
      });

      await test.step('And enables Exclude data file sizes and types', async () => {
        await esConnectorsGoogleDrive.enableFileSizesAndTypesFilter();
        await expect(esConnectorsGoogleDrive.getFileSizesAndTypesFilterLabel()).toBeVisible();
      });

      await test.step('And selects Exclude data files that are larger than', async () => {
        await esConnectorsGoogleDrive.expectExcludeFilesLargerThanDropdownVisible();
      });

      await test.step(`And selects ${fileSizeConfig.size} from the size dropdown`, async () => {
        await esConnectorsGoogleDrive.selectFileSizeLimit(fileSizeConfig.size);
      });

      await test.step('Then clicks Save & sync on Data filters', async () => {
        await esConnectorsGoogleDrive.saveDataFiltersAndSync();
      });
    });

    test('App manager verifies testing.pdf is searchable from Google Drive', async ({ browser }, testInfo) => {
      test.setTimeout(600_000);

      const verificationConfig = getGoogleDriveVerificationConfig();
      const searchFileName =
        process.env.GOOGLE_DRIVE_INDEXED_SEARCH_FILE?.trim() ||
        verificationConfig.excludedSearchFile ||
        'testing.pdf';
      const connectorSourceCandidates = [
        verificationConfig.connectorSourceName,
        'Google Drive',
        activeConnectorName,
      ].filter((name, index, names) => Boolean(name) && names.indexOf(name) === index);
      const appManager = getUser('appManager');
      const searchWaitTimeoutMs = Number(process.env.GOOGLE_DRIVE_SEARCH_WAIT_MS ?? 300_000);

      const { context: appManagerContext, page: appManagerPage, enterpriseSearchEndUser } =
        await createEndUserBrowserContext(browser, testInfo, false);

      try {
        await test.step('Given the app manager opens Zeus login and enters email', async () => {
          const loginPage = new LoginPage(appManagerPage);
          await loginPage.open();
          if (!(await loginPage.isLoggedIn())) {
            await loginPage.enterEmail(appManager.email);
          }
        });

        await test.step('When the app manager enters password and clicks Sign in', async () => {
          const loginPage = new LoginPage(appManagerPage);
          if (await loginPage.isLoggedIn()) {
            return;
          }
          await loginPage.enterPassword(appManager.password);
          await expect(appManagerPage).toHaveURL(/\/home/i, { timeout: 60_000 });
        });

        await test.step('And the app manager is on Zeus home with search bar visible', async () => {
          await expect(enterpriseSearchEndUser.getSearchBox()).toBeVisible({ timeout: 60_000 });
        });

        await test.step(`When the app manager searches for ${searchFileName} and presses Enter`, async () => {
          await enterpriseSearchEndUser.submitSearchQuery(searchFileName);
          await expect(enterpriseSearchEndUser.getSearchResultsHeader()).toBeVisible({ timeout: 120_000 });
        });

        await test.step('Then search results should be visible', async () => {
          await enterpriseSearchEndUser.waitForSearchResults();
        });

        await test.step('And selects Google Drive from Sources on the right', async () => {
          await enterpriseSearchEndUser.selectSourceFilterFromCandidates(connectorSourceCandidates);
        });

        await test.step(`Then ${searchFileName} should be visible from Google Drive`, async () => {
          await expect(async () => {
            await enterpriseSearchEndUser.expectConnectorResultVisible(
              verificationConfig.connectorSourceName,
              searchFileName,
            );
          }).toPass({
            timeout: searchWaitTimeoutMs,
            intervals: [10_000, 30_000, 60_000],
          });
        });
      } finally {
        await closeContextAndAttachVideo(
          appManagerContext,
          appManagerPage,
          testInfo,
          'video-app-manager-testing-pdf-search',
        );
      }
    });

    test('App manager verifies drive2.pdf is searchable from Google Drive', async ({ browser }, testInfo) => {
      test.setTimeout(600_000);

      const verificationConfig = getGoogleDriveVerificationConfig();
      const searchFileName =
        process.env.GOOGLE_DRIVE_SEARCH_FILE?.trim() ||
        verificationConfig.preferredSearchFile ||
        'drive2.pdf';
      const connectorSourceCandidates = [
        verificationConfig.connectorSourceName,
        'Google Drive',
        activeConnectorName,
      ].filter((name, index, names) => Boolean(name) && names.indexOf(name) === index);
      const appManager = getUser('appManager');
      const searchWaitTimeoutMs = Number(process.env.GOOGLE_DRIVE_SEARCH_WAIT_MS ?? 300_000);

      const { context: appManagerContext, page: appManagerPage, enterpriseSearchEndUser } =
        await createEndUserBrowserContext(browser, testInfo, false);

      try {
        await test.step('Given the app manager opens Zeus login and enters email', async () => {
          const loginPage = new LoginPage(appManagerPage);
          await loginPage.open();
          if (!(await loginPage.isLoggedIn())) {
            await loginPage.enterEmail(appManager.email);
          }
        });

        await test.step('When the app manager enters password and clicks Sign in', async () => {
          const loginPage = new LoginPage(appManagerPage);
          if (await loginPage.isLoggedIn()) {
            return;
          }
          await loginPage.enterPassword(appManager.password);
          await expect(appManagerPage).toHaveURL(/\/home/i, { timeout: 60_000 });
        });

        await test.step('And the app manager is on Zeus home with search bar visible', async () => {
          await expect(enterpriseSearchEndUser.getSearchBox()).toBeVisible({ timeout: 60_000 });
        });

        await test.step(`When the app manager searches for ${searchFileName} and presses Enter`, async () => {
          await enterpriseSearchEndUser.submitSearchQuery(searchFileName);
          await expect(enterpriseSearchEndUser.getSearchResultsHeader()).toBeVisible({ timeout: 120_000 });
        });

        await test.step('Then search results should be visible', async () => {
          await enterpriseSearchEndUser.waitForSearchResults();
        });

        await test.step('And selects Google Drive from Sources on the right', async () => {
          await enterpriseSearchEndUser.selectSourceFilterFromCandidates(connectorSourceCandidates);
        });

        await test.step(`Then ${searchFileName} should be visible from Google Drive`, async () => {
          await expect(async () => {
            await enterpriseSearchEndUser.expectConnectorResultVisible(
              verificationConfig.connectorSourceName,
              searchFileName,
            );
          }).toPass({
            timeout: searchWaitTimeoutMs,
            intervals: [10_000, 30_000, 60_000],
          });
        });
      } finally {
        await closeContextAndAttachVideo(
          appManagerContext,
          appManagerPage,
          testInfo,
          'video-app-manager-drive2-pdf-search',
        );
      }
    });

    test('App manager verifies GD.pdf is searchable from Google Drive', async ({ browser }, testInfo) => {
      test.setTimeout(600_000);

      const verificationConfig = getGoogleDriveVerificationConfig();
      const searchFileName = process.env.GOOGLE_DRIVE_GD_SEARCH_FILE?.trim() || 'GD.pdf';
      const connectorSourceCandidates = [
        verificationConfig.connectorSourceName,
        'Google Drive',
        activeConnectorName,
      ].filter((name, index, names) => Boolean(name) && names.indexOf(name) === index);
      const appManager = getUser('appManager');
      const searchWaitTimeoutMs = Number(process.env.GOOGLE_DRIVE_SEARCH_WAIT_MS ?? 300_000);

      const { context: appManagerContext, page: appManagerPage, enterpriseSearchEndUser } =
        await createEndUserBrowserContext(browser, testInfo, false);

      try {
        await test.step('Given the app manager opens Zeus login and enters email', async () => {
          const loginPage = new LoginPage(appManagerPage);
          await loginPage.open();
          if (!(await loginPage.isLoggedIn())) {
            await loginPage.enterEmail(appManager.email);
          }
        });

        await test.step('When the app manager enters password and clicks Sign in', async () => {
          const loginPage = new LoginPage(appManagerPage);
          if (await loginPage.isLoggedIn()) {
            return;
          }
          await loginPage.enterPassword(appManager.password);
          await expect(appManagerPage).toHaveURL(/\/home/i, { timeout: 60_000 });
        });

        await test.step('And the app manager is on Zeus home with search bar visible', async () => {
          await expect(enterpriseSearchEndUser.getSearchBox()).toBeVisible({ timeout: 60_000 });
        });

        await test.step(`When the app manager searches for ${searchFileName} and presses Enter`, async () => {
          await enterpriseSearchEndUser.submitSearchQuery(searchFileName);
          await expect(enterpriseSearchEndUser.getSearchResultsHeader()).toBeVisible({ timeout: 120_000 });
        });

        await test.step('Then search results should be visible', async () => {
          await enterpriseSearchEndUser.waitForSearchResults();
        });

        await test.step('And selects Google Drive from Sources on the right', async () => {
          await enterpriseSearchEndUser.selectSourceFilterFromCandidates(connectorSourceCandidates);
        });

        await test.step(`Then ${searchFileName} should be visible from Google Drive`, async () => {
          await expect(async () => {
            await enterpriseSearchEndUser.expectConnectorResultVisible(
              verificationConfig.connectorSourceName,
              searchFileName,
            );
          }).toPass({
            timeout: searchWaitTimeoutMs,
            intervals: [10_000, 30_000, 60_000],
          });
        });
      } finally {
        await closeContextAndAttachVideo(
          appManagerContext,
          appManagerPage,
          testInfo,
          'video-app-manager-gd-pdf-search',
        );
      }
    });

    test('Configure exclude pdf file type on Data filters tab', async ({
      page,
      enterpriseSearchNavigation,
      esConnectorsAdminPanel,
      esConnectorsGoogleDrive,
    }) => {
      test.setTimeout(600_000);

      const excludedFileTypeConfig = getGoogleDrive26ExcludedFileTypeConfig();

      await test.step('Given the app manager launches the application', async () => {
        await launchApp(page);
      });

      await test.step('And opens the Google drive 26 connector', async () => {
        await navigateToEnterpriseSearch(enterpriseSearchNavigation, esConnectorsAdminPanel);
        activeConnectorName = await openGoogleDrive26Connector(esConnectorsGoogleDrive);
      });

      await test.step('When the user opens the Data filters tab', async () => {
        await esConnectorsGoogleDrive.openDataFiltersTab();
        await expect(esConnectorsGoogleDrive.getDataFiltersTab()).toHaveAttribute('aria-selected', 'true');
      });

      await test.step('And enables Exclude data file sizes and types', async () => {
        await esConnectorsGoogleDrive.enableFileSizesAndTypesFilter();
        await expect(esConnectorsGoogleDrive.getFileSizesAndTypesFilterLabel()).toBeVisible();
      });

      await test.step('And verifies Please specify the file types you would like to exclude is visible', async () => {
        await esConnectorsGoogleDrive.expectExcludeFileTypesFieldVisible();
      });

      await test.step('And clicks on the file types exclude cell', async () => {
        await esConnectorsGoogleDrive.clickExcludeFileTypesField();
      });

      await test.step(`And selects file type ${excludedFileTypeConfig.fileType}`, async () => {
        await esConnectorsGoogleDrive.selectExcludedFileType(excludedFileTypeConfig.fileType);
      });

      await test.step(`Then ${excludedFileTypeConfig.fileType} should appear as a selected excluded file type`, async () => {
        await esConnectorsGoogleDrive.expectExcludedFileTypeSelected(excludedFileTypeConfig.fileType);
      });

      await test.step('And clicks Save & sync on Data filters', async () => {
        await esConnectorsGoogleDrive.saveDataFiltersAndSync();
      });
    });

    test('Google drive 26 incremental sync from Status tab and wait for sync complete', async ({
      page,
      enterpriseSearchNavigation,
      esConnectorsAdminPanel,
      esConnectorsGoogleDrive,
    }) => {
      const incrementalSyncWaitMs = Number(process.env.GOOGLE_DRIVE_INCREMENTAL_SYNC_WAIT_MS ?? 3_600_000);
      test.setTimeout(incrementalSyncWaitMs + 180_000);

      const googleDriveSyncConfig = getGoogleDriveSyncConfig();

      await test.step('Given the app manager launches the application', async () => {
        await launchApp(page);
      });

      await test.step('And opens the Google drive 26 connector', async () => {
        await navigateToEnterpriseSearch(enterpriseSearchNavigation, esConnectorsAdminPanel);
        activeConnectorName = await openGoogleDrive26Connector(esConnectorsGoogleDrive);
      });

      await test.step('When the user goes to the Status tab', async () => {
        await esConnectorsGoogleDrive.openStatusTab(googleDriveSyncConfig);
        await esConnectorsGoogleDrive.expectStatusTabReady(googleDriveSyncConfig);
      });

      await test.step('And waits for any in-progress sync to finish before starting incremental sync', async () => {
        await esConnectorsGoogleDrive.waitForNoActiveSync(incrementalSyncWaitMs);
      });

      let syncHistoryBaseline: string | undefined;
      await test.step('And captures sync history baseline before incremental sync', async () => {
        const historyBefore = await esConnectorsGoogleDrive.getSyncHistoryEntries(googleDriveSyncConfig);
        syncHistoryBaseline = historyBefore[0]?.timestamp;
      });

      await test.step('And clicks the sync dropdown arrow on the right side', async () => {
        await esConnectorsGoogleDrive.openSyncDropdownMenu(googleDriveSyncConfig);
      });

      await test.step('And selects Incremental sync from the menu', async () => {
        await esConnectorsGoogleDrive.selectIncrementalSync(googleDriveSyncConfig);
        await esConnectorsGoogleDrive.clickSyncAfterIncrementalSelection(googleDriveSyncConfig);
      });

      await test.step('Then the incremental sync process should start or already be in progress', async () => {
        await esConnectorsGoogleDrive.expectIncrementalSyncStarted();
      });

      await test.step('And waits until incremental sync completes successfully', async () => {
        await esConnectorsGoogleDrive.waitForIncrementalSyncComplete(
          googleDriveSyncConfig,
          incrementalSyncWaitMs,
          syncHistoryBaseline,
        );
        await expect(esConnectorsGoogleDrive.getSyncCompleteStatus(googleDriveSyncConfig)).toBeVisible();
      });
    });

    test('End user verifies drive2.pdf is not searchable after exclude audience filter', async ({
      browser,
    }, testInfo) => {
      const searchWaitTimeoutMs = Number(process.env.GOOGLE_DRIVE_SEARCH_WAIT_MS ?? 300_000);
      test.setTimeout(searchWaitTimeoutMs + 180_000);

      const verificationConfig = getGoogleDriveVerificationConfig();
      const configuredConnectorName =
        process.env.GOOGLE_DRIVE_CONNECTOR_NAME?.trim() || GOOGLE_DRIVE_26_CONNECTOR_NAME;
      const searchFileName =
        process.env.GOOGLE_DRIVE_SEARCH_FILE?.trim() ||
        verificationConfig.preferredSearchFile ||
        'drive2.pdf';
      const connectorSourceCandidates = [
        verificationConfig.connectorSourceName,
        'Google Drive',
        configuredConnectorName,
        activeConnectorName,
      ].filter((name, index, names) => Boolean(name) && names.indexOf(name) === index);
      const endUser = getUser('endUser');

      const { context: endUserContext, page: endUserPage, enterpriseSearchEndUser } =
        await createEndUserBrowserContext(browser, testInfo, false);

      try {
        await test.step('Given the end user opens Zeus login and enters email', async () => {
          const loginPage = new LoginPage(endUserPage);
          await loginPage.open();
          if (!(await loginPage.isLoggedIn())) {
            await loginPage.enterEmail(endUser.email);
          }
        });

        await test.step('When the end user enters password and clicks Sign in', async () => {
          const loginPage = new LoginPage(endUserPage);
          if (await loginPage.isLoggedIn()) {
            return;
          }
          await loginPage.enterPassword(endUser.password);
          await expect(endUserPage).toHaveURL(/\/home/i, { timeout: 60_000 });
        });

        await test.step('And the end user is on Zeus home with search bar visible', async () => {
          await expect(enterpriseSearchEndUser.getSearchBox()).toBeVisible({ timeout: 60_000 });
        });

        await test.step(`Then ${searchFileName} should not be visible from Google Drive after audience exclude`, async () => {
          await enterpriseSearchEndUser.expectConnectorSearchFileNotVisibleWithRetry({
            connectorName: configuredConnectorName,
            fileName: searchFileName,
            sourceCandidates: connectorSourceCandidates,
            timeoutMs: searchWaitTimeoutMs,
          });
        });
      } finally {
        await closeContextAndAttachVideo(endUserContext, endUserPage, testInfo, 'video-end-user-drive2-exclude-search');
      }
    });
  },
);
