import { test as base } from '@playwright/test';
import { archiveTestVideo } from '@core/helpers/videoHelper';
import { BasePage } from '@core/ui/pages/basePage';
import { EnterpriseSearchNavigationPage } from '@es-connectors/ui/pages/enterpriseSearchNavigationPage';
import { ESConnectorsAdminPanelPage } from '@es-connectors/ui/pages/esConnectorsAdminPanelPage';
import { ESConnectorConfigurationPage } from '@es-connectors/ui/components/connectorConfigurationForm';
import { ESConnectorsDropboxPage } from '@es-connectors/ui/pages/esConnectorsDropboxPage';
import { ESConnectorsBoxPage } from '@es-connectors/ui/pages/esConnectorsBoxPage';
import { ESConnectorsConfluencePage } from '@es-connectors/ui/pages/esConnectorsConfluencePage';
import { ESConnectorsGoogleDrivePage } from '@es-connectors/ui/pages/esConnectorsGoogleDrivePage';

type EsConnectorsFixtures = {
  basePage: BasePage;
  enterpriseSearchNavigation: EnterpriseSearchNavigationPage;
  esConnectorsAdminPanel: ESConnectorsAdminPanelPage;
  esConnectorConfiguration: ESConnectorConfigurationPage;
  esConnectorsDropbox: ESConnectorsDropboxPage;
  esConnectorsBox: ESConnectorsBoxPage;
  esConnectorsConfluence: ESConnectorsConfluencePage;
  esConnectorsGoogleDrive: ESConnectorsGoogleDrivePage;
};

class ConcreteBasePage extends BasePage {
  constructor(page: import('@playwright/test').Page) {
    super(page);
  }
}

export const test = base.extend<EsConnectorsFixtures>({
  basePage: async ({ page }, use) => {
    await use(new ConcreteBasePage(page));
  },

  enterpriseSearchNavigation: async ({ page }, use) => {
    await use(new EnterpriseSearchNavigationPage(page));
  },

  esConnectorsAdminPanel: async ({ page }, use) => {
    await use(new ESConnectorsAdminPanelPage(page));
  },

  esConnectorConfiguration: async ({ page }, use) => {
    await use(new ESConnectorConfigurationPage(page));
  },

  esConnectorsDropbox: async ({ page }, use) => {
    await use(new ESConnectorsDropboxPage(page));
  },

  esConnectorsBox: async ({ page }, use) => {
    await use(new ESConnectorsBoxPage(page));
  },

  esConnectorsConfluence: async ({ page }, use) => {
    await use(new ESConnectorsConfluencePage(page));
  },

  esConnectorsGoogleDrive: async ({ page }, use) => {
    await use(new ESConnectorsGoogleDrivePage(page));
  },
});

export { expect } from '@playwright/test';

test.afterEach(async ({}, testInfo) => {
  const archivedPath = await archiveTestVideo(testInfo);
  if (archivedPath) {
    console.log(`Archived test video: ${archivedPath}`);
  }
});
