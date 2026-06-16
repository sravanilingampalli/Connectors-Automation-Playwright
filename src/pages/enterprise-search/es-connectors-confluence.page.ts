import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { CONFLUENCE, CONFLUENCE_MESSAGES } from '../../constants/confluence.constants';
import { ConfluenceApiTokenConfig } from '../../data/connectors/confluence';
import { ESConnectorConfigurationPage } from './es-connector-configuration.page';

export class ESConnectorsConfluencePage extends BasePage {
  private readonly configurationPage: ESConnectorConfigurationPage;

  private readonly confluenceConnectorOption = (): Locator =>
    this.page.getByRole('dialog').getByRole('button', {
      name: new RegExp(CONFLUENCE.connectorName, 'i'),
    });

  private readonly createApiTokenButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(CONFLUENCE.createTokenButton, 'i') });

  private readonly generateTokenButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(CONFLUENCE.generateTokenButton, 'i') });

  private readonly copyTokenButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(CONFLUENCE.copyTokenButton, 'i') });

  private readonly expirationInput = (): Locator =>
    this.page.getByLabel(/expiration|expiry|days/i);

  private readonly scopesSection = (): Locator =>
    this.page.getByText(CONFLUENCE_MESSAGES.scopesVisible);

  private readonly generatedToken = (): Locator =>
    this.page.locator('[data-testid="api-token"], input[readonly], code').first();

  private readonly successMessage = (): Locator =>
    this.page.getByText(CONFLUENCE_MESSAGES.tokenGeneratedSuccess);

  constructor(page: Page) {
    super(page);
    this.configurationPage = new ESConnectorConfigurationPage(page);
  }

  async selectConfluenceConnector(): Promise<void> {
    await this.confluenceConnectorOption().click();
    await this.page.waitForURL('**/confluence/**', { timeout: 30_000 });
  }

  async openApiTokenCreation(): Promise<void> {
    await this.createApiTokenButton().click();
  }

  async verifyRequiredScopesVisible(): Promise<void> {
    await this.scopesSection().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async selectRequiredScopes(): Promise<void> {
    const scopeCheckboxes = this.page.getByRole('checkbox');
    const count = await scopeCheckboxes.count();
    if (count > 0) {
      await scopeCheckboxes.first().check();
    }
  }

  async setExpirationDays(days: number): Promise<void> {
    await this.expirationInput().fill(String(days));
  }

  async generateApiToken(): Promise<void> {
    await this.generateTokenButton().click();
  }

  async createScopedApiToken(config: ConfluenceApiTokenConfig): Promise<void> {
    await this.openApiTokenCreation();
    await this.verifyRequiredScopesVisible();
    await this.selectRequiredScopes();
    await this.setExpirationDays(config.expirationDays);
    await this.generateApiToken();
  }

  async waitForTokenGenerated(): Promise<void> {
    await this.successMessage().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async copyGeneratedToken(): Promise<void> {
    await this.copyTokenButton().click();
  }

  getGeneratedToken(): Locator {
    return this.generatedToken();
  }

  getSuccessMessage(): Locator {
    return this.successMessage();
  }
}
