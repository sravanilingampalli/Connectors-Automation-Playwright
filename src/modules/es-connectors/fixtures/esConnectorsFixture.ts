import { test as base } from '@playwright/test';
import { BasePage } from '@core/ui/pages/basePage';
import { EnterpriseSearchNavigationPage } from '@es-connectors/ui/pages/enterpriseSearchNavigationPage';
import { ESConnectorsAdminPanelPage } from '@es-connectors/ui/pages/esConnectorsAdminPanelPage';
import { ESConnectorConfigurationPage } from '@es-connectors/ui/components/connectorConfigurationForm';
import { ESConnectorsDropboxPage } from '@es-connectors/ui/pages/esConnectorsDropboxPage';
import { ESConnectorsBoxPage } from '@es-connectors/ui/pages/esConnectorsBoxPage';
import { ESConnectorsConfluencePage } from '@es-connectors/ui/pages/esConnectorsConfluencePage';

type EsConnectorsFixtures = {
  basePage: BasePage;
  enterpriseSearchNavigation: EnterpriseSearchNavigationPage;
  esConnectorsAdminPanel: ESConnectorsAdminPanelPage;
  esConnectorConfiguration: ESConnectorConfigurationPage;
  esConnectorsDropbox: ESConnectorsDropboxPage;
  esConnectorsBox: ESConnectorsBoxPage;
  esConnectorsConfluence: ESConnectorsConfluencePage;
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
});

export { expect } from '@playwright/test';
