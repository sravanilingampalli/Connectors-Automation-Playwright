import { test as base } from '@playwright/test';
import { BasePage } from '../pages/base.page';
import {
  EnterpriseSearchNavigationPage,
  ESConnectorsAdminPanelPage,
  ESConnectorConfigurationPage,
  ESConnectorsDropboxPage,
  ESConnectorsBoxPage,
  ESConnectorsConfluencePage,
} from '../pages/enterprise-search';

type FrameworkFixtures = {
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

export const test = base.extend<FrameworkFixtures>({
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
