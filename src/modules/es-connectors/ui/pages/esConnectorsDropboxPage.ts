import { Locator, Page } from '@playwright/test';
import { BasePage } from '@core/ui/pages/basePage';
import { CONNECTOR_FIELDS, ENTERPRISE_SEARCH } from '@es-connectors/constants';
import { DropboxConnectorConfig } from '@es-connectors/test-data/dropbox';
import { ESConnectorConfigurationPage } from '@es-connectors/ui/components/connectorConfigurationForm';

export class ESConnectorsDropboxPage extends BasePage {
  private readonly configurationPage: ESConnectorConfigurationPage;

  private readonly dropboxConnectorOption = (): Locator =>
    this.page.getByRole('dialog').getByRole('button', {
      name: new RegExp(`^${ENTERPRISE_SEARCH.dropboxConnector}$`, 'i'),
    });

  private readonly connectorNameInput = (): Locator =>
    this.page.getByRole('textbox', { name: new RegExp(CONNECTOR_FIELDS.connectorName, 'i') });

  private readonly appKeyInput = (): Locator =>
    this.page.getByRole('textbox', { name: new RegExp(CONNECTOR_FIELDS.appKey, 'i') });

  private readonly appSecretInput = (): Locator =>
    this.page.getByRole('textbox', { name: new RegExp(CONNECTOR_FIELDS.appSecret, 'i') });

  private readonly refreshTokenInput = (): Locator =>
    this.page.getByRole('textbox', { name: new RegExp(CONNECTOR_FIELDS.refreshToken, 'i') });

  private readonly saveConfigurationButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.saveConfigurationButton, 'i') });

  constructor(page: Page) {
    super(page);
    this.configurationPage = new ESConnectorConfigurationPage(page);
  }

  async selectDropboxConnector(): Promise<void> {
    await this.dropboxConnectorOption().click();
    await this.page.waitForURL('**/dropbox/setup**', { timeout: 30_000 });
    await this.configurationPage.waitForConfigurationForm();
  }

  async expectSetupFormDisplayed(): Promise<void> {
    await this.connectorNameInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.appKeyInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.appSecretInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.refreshTokenInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.saveConfigurationButton().waitFor({ state: 'visible', timeout: 30_000 });
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

  async expectConnectorCreated(connectorName: string): Promise<void> {
    await this.waitForSuccessMessage();
    await this.page.getByRole('heading', { name: /ID:/i }).waitFor({ state: 'visible', timeout: 30_000 });
    await this.getSuccessMessage().waitFor({ state: 'visible', timeout: 30_000 });
    await this.getSuccessMessage().filter({ hasText: connectorName }).waitFor({ state: 'visible', timeout: 15_000 });
  }

  getDropboxConnectorOption(): Locator {
    return this.dropboxConnectorOption();
  }

  getConnectorNameInput(): Locator {
    return this.connectorNameInput();
  }

  getAppKeyInput(): Locator {
    return this.appKeyInput();
  }

  getAppSecretInput(): Locator {
    return this.appSecretInput();
  }

  getRefreshTokenInput(): Locator {
    return this.refreshTokenInput();
  }

  getSaveConfigurationButton(): Locator {
    return this.saveConfigurationButton();
  }

  getSuccessMessage(): Locator {
    return this.configurationPage.getSuccessMessage();
  }
}
