import { Locator, Page } from '@playwright/test';
import { BasePage } from '@core/ui/pages/basePage';
import { CONNECTOR_FIELDS, ENTERPRISE_SEARCH, MESSAGES } from '@es-connectors/constants';

export class ESConnectorConfigurationPage extends BasePage {
  private readonly connectorNameInput = (): Locator => this.page.locator('#name');

  private readonly appKeyInput = (): Locator => this.page.locator('#app_key');

  private readonly appSecretInput = (): Locator => this.page.locator('#app_secret');

  private readonly refreshTokenInput = (): Locator => this.page.locator('#refresh_token');

  private readonly cloudEmailInput = (): Locator =>
    this.page
      .locator('#cloud_email')
      .or(this.page.getByRole('textbox', { name: new RegExp(CONNECTOR_FIELDS.cloudEmail, 'i') }));

  private readonly apiTokenInput = (): Locator =>
    this.page
      .locator('#api_token')
      .or(this.page.getByLabel(new RegExp(CONNECTOR_FIELDS.apiToken, 'i')))
      .or(this.page.getByRole('textbox', { name: new RegExp(CONNECTOR_FIELDS.apiToken, 'i') }));

  private readonly apiTokenEditButton = (): Locator =>
    this.page.locator('#api_token').locator('..').getByRole('button', { name: /^Edit$/i });

  private readonly urlLabelInput = (): Locator =>
    this.page
      .locator('#url_label')
      .or(this.page.getByRole('textbox', { name: new RegExp(CONNECTOR_FIELDS.urlLabel, 'i') }));

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

  async enterCloudEmail(cloudEmail: string): Promise<void> {
    await this.cloudEmailInput().fill(cloudEmail);
  }

  async enterApiToken(apiToken: string): Promise<void> {
    const input = this.apiTokenInput();
    await input.waitFor({ state: 'visible' });

    if ((await input.getAttribute('readonly')) !== null) {
      const currentValue = await input.inputValue();
      if (currentValue === apiToken) {
        return;
      }

      await this.apiTokenEditButton().click();
    }

    await input.fill(apiToken);
  }

  async enterUrlLabel(urlLabel: string): Promise<void> {
    await this.urlLabelInput().fill(urlLabel);
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
