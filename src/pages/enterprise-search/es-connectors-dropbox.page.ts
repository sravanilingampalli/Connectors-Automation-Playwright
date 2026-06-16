import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { ENTERPRISE_SEARCH } from '../../constants';
import { DropboxConnectorConfig } from '../../data/connectors/dropbox';
import { ESConnectorConfigurationPage } from './es-connector-configuration.page';

export class ESConnectorsDropboxPage extends BasePage {
  private readonly configurationPage: ESConnectorConfigurationPage;

  private readonly dropboxConnectorOption = (): Locator =>
    this.page.getByRole('dialog').getByRole('button', {
      name: new RegExp(`^${ENTERPRISE_SEARCH.dropboxConnector}$`, 'i'),
    });

  constructor(page: Page) {
    super(page);
    this.configurationPage = new ESConnectorConfigurationPage(page);
  }

  async selectDropboxConnector(): Promise<void> {
    await this.dropboxConnectorOption().click();
    await this.page.waitForURL('**/dropbox/setup**', { timeout: 30_000 });
    await this.configurationPage.waitForConfigurationForm();
  }

  async configureDropboxConnector(config: DropboxConnectorConfig): Promise<void> {
    await this.configurationPage.enterConnectorName(config.connectorName);
    await this.configurationPage.enterAppKey(config.appKey);
    await this.configurationPage.enterAppSecret(config.appSecret);
    await this.configurationPage.enterRefreshToken(config.refreshToken);
  }

  async saveConfiguration(): Promise<void> {
    await this.configurationPage.clickSaveConfiguration();
  }

  async waitForSuccessMessage(): Promise<void> {
    await this.configurationPage.waitForSuccessMessage();
  }

  getSuccessMessage(): Locator {
    return this.configurationPage.getSuccessMessage();
  }
}
