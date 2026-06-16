import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { CONNECTOR_FIELDS, ENTERPRISE_SEARCH, MESSAGES } from '../../constants';

export class ESConnectorConfigurationPage extends BasePage {
  private readonly connectorNameInput = (): Locator => this.page.locator('#name');

  private readonly appKeyInput = (): Locator => this.page.locator('#app_key');

  private readonly appSecretInput = (): Locator => this.page.locator('#app_secret');

  private readonly refreshTokenInput = (): Locator => this.page.locator('#refresh_token');

  private readonly saveConfigurationButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.saveConfigurationButton, 'i') });

  private readonly successMessage = (): Locator =>
    this.page.getByText(MESSAGES.configurationSavedSuccess);

  constructor(page: Page) {
    super(page);
  }

  async waitForConfigurationForm(): Promise<void> {
    await this.connectorNameInput().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async enterConnectorName(name: string): Promise<void> {
    await this.connectorNameInput().fill(name);
  }

  async enterAppKey(appKey: string): Promise<void> {
    await this.appKeyInput().fill(appKey);
  }

  async enterAppSecret(appSecret: string): Promise<void> {
    await this.appSecretInput().fill(appSecret);
  }

  async enterRefreshToken(refreshToken: string): Promise<void> {
    await this.refreshTokenInput().fill(refreshToken);
  }

  async clickSaveConfiguration(): Promise<void> {
    await this.saveConfigurationButton().click();
  }

  getSuccessMessage(): Locator {
    return this.successMessage();
  }

  async waitForSuccessMessage(): Promise<void> {
    await this.successMessage().waitFor({ state: 'visible', timeout: 30_000 });
  }
}
