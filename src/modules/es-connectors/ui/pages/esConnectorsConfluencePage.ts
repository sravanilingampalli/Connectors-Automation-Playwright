import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '@core/ui/pages/basePage';
import { CONFLUENCE, CONFLUENCE_MESSAGES } from '@es-connectors/constants/confluence.constants';
import { CONNECTOR_FIELDS, ENTERPRISE_SEARCH, MESSAGES } from '@es-connectors/constants';
import { ConfluenceApiTokenConfig, ConfluenceConnectorConfig } from '@es-connectors/test-data/confluence';
import { ESConnectorConfigurationPage } from '@es-connectors/ui/components/connectorConfigurationForm';

export class ESConnectorsConfluencePage extends BasePage {
  private readonly configurationPage: ESConnectorConfigurationPage;

  private readonly confluenceConnectorOption = (): Locator =>
    this.page.getByRole('dialog').getByRole('button', {
      name: new RegExp(`^${ENTERPRISE_SEARCH.confluenceConnector}$`, 'i'),
    });

  private readonly connectorNameInput = (): Locator =>
    this.page.getByRole('textbox', { name: new RegExp(CONNECTOR_FIELDS.connectorName, 'i') });

  private readonly cloudEmailInput = (): Locator =>
    this.page.getByRole('textbox', { name: new RegExp(CONNECTOR_FIELDS.cloudEmail, 'i') });

  private readonly apiTokenInput = (): Locator =>
    this.page.getByLabel(new RegExp(CONNECTOR_FIELDS.apiToken, 'i')).or(
      this.page.getByRole('textbox', { name: new RegExp(CONNECTOR_FIELDS.apiToken, 'i') }),
    );

  private readonly urlLabelInput = (): Locator =>
    this.page.getByRole('textbox', { name: new RegExp(CONNECTOR_FIELDS.urlLabel, 'i') });

  private readonly saveAndSyncButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.saveAndSyncButton, 'i') });

  private readonly step2Heading = (): Locator =>
    this.page.getByRole('heading', {
      name: /Restrict the ingestion of information from Atlassian Confluence Cloud/i,
    });

  private readonly connectorIdHeading = (): Locator => this.page.getByRole('heading', { name: /ID:/i });

  private readonly confirmationDialog = (): Locator =>
    this.page.getByRole('dialog').filter({ hasText: /Setup connector|confirm|ingest/i });

  private readonly confirmIngestionButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(`^${ENTERPRISE_SEARCH.confirmIngestionButton}$`, 'i') });

  private readonly saveConfigurationButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.saveConfigurationButton, 'i') });

  private readonly configurationSavedMessage = (): Locator =>
    this.page.getByText(MESSAGES.confluenceConfigurationSavedSuccess);

  private readonly configuredStatus = (): Locator => this.page.getByText(MESSAGES.connectorStatusConfigured);

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

  private readonly tokenGeneratedMessage = (): Locator =>
    this.page.getByText(CONFLUENCE_MESSAGES.tokenGeneratedSuccess);

  constructor(page: Page) {
    super(page);
    this.configurationPage = new ESConnectorConfigurationPage(page);
  }

  async selectConfluenceConnector(): Promise<void> {
    await this.confluenceConnectorOption().click();
    await this.page.waitForURL('**/confluence/**', { timeout: 30_000 });
  }

  async waitForConfigurationForm(): Promise<void> {
    await this.configurationPage.waitForConfigurationForm();
    await this.cloudEmailInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.apiTokenInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.urlLabelInput().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async expectSetupFormDisplayed(): Promise<void> {
    await this.connectorNameInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.cloudEmailInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.apiTokenInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.urlLabelInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.saveConfigurationButton().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async configureConfluenceConnector(config: ConfluenceConnectorConfig): Promise<void> {
    await this.configurationPage.enterConnectorName(config.connectorName);
    await this.configurationPage.enterCloudEmail(config.cloudEmail);
    await this.configurationPage.enterApiToken(config.apiToken);
    await this.configurationPage.enterUrlLabel(config.urlLabel);
  }

  async configureConfluenceConnectorWithoutApiToken(
    config: Omit<ConfluenceConnectorConfig, 'apiToken'>,
  ): Promise<void> {
    await this.configurationPage.enterConnectorName(config.connectorName);
    await this.configurationPage.enterCloudEmail(config.cloudEmail);
    await this.configurationPage.enterApiToken('');
    await this.configurationPage.enterUrlLabel(config.urlLabel);
  }

  async attemptSaveConfiguration(): Promise<void> {
    const saveButton = this.saveConfigurationButton();
    if (await saveButton.isEnabled()) {
      await saveButton.click();
      return;
    }

    await this.apiTokenInput().evaluate((element) => {
      if ('reportValidity' in element && typeof element.reportValidity === 'function') {
        element.reportValidity();
      }
    });
  }

  getApiTokenValidationError(): Locator {
    return this.page
      .getByRole('alert')
      .filter({ hasText: CONFLUENCE_MESSAGES.apiTokenRequired })
      .or(this.page.getByText(CONFLUENCE_MESSAGES.apiTokenRequired));
  }

  async expectApiTokenValidationMessage(): Promise<void> {
    await this.getApiTokenValidationError().first().waitFor({ state: 'visible', timeout: 15_000 });
  }

  async expectConfigurationSaveBlocked(): Promise<void> {
    await this.page.waitForURL(/confluence/i, { timeout: 15_000 });

    if (await this.step2Heading().isVisible().catch(() => false)) {
      throw new Error('Configuration should not proceed to Step 2 when API Token is empty');
    }

    if (await this.configurationSavedMessage().isVisible().catch(() => false)) {
      throw new Error('Configuration should not be saved when API Token is empty');
    }

    await expect(this.saveConfigurationButton()).toBeVisible();
  }

  async saveConfiguration(): Promise<void> {
    await this.configurationPage.clickSaveConfiguration();
  }

  async waitForConfigurationSavedSuccess(): Promise<void> {
    await this.configurationSavedMessage().waitFor({ state: 'visible', timeout: 60_000 });
  }

  getConfigurationSavedMessage(): Locator {
    return this.configurationSavedMessage();
  }

  async expectConnectorCreated(connectorName: string): Promise<void> {
    await this.waitForConfigurationSavedSuccess();
    await this.connectorIdHeading().waitFor({ state: 'visible', timeout: 30_000 });
    await this.getConfigurationSavedMessage().filter({ hasText: connectorName }).waitFor({
      state: 'visible',
      timeout: 15_000,
    });
  }

  async expectStep2Displayed(): Promise<void> {
    await this.step2Heading().waitFor({ state: 'visible', timeout: 30_000 });
    await this.saveAndSyncButton().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async clickSaveAndSync(): Promise<void> {
    await this.saveAndSyncButton().click();
  }

  async confirmIngestionSetup(): Promise<void> {
    await this.confirmationDialog().waitFor({ state: 'visible', timeout: 30_000 });
    await this.confirmIngestionButton().click();
    await this.page.getByRole('tab', { name: new RegExp(`^${ENTERPRISE_SEARCH.statusTab}$`, 'i') }).waitFor({
      state: 'visible',
      timeout: 60_000,
    });
  }

  async openSourcesList(): Promise<void> {
    await this.page.getByRole('button', { name: new RegExp(`^${ENTERPRISE_SEARCH.sourcesHeading}$`, 'i') }).click();
    await this.page.waitForURL('**/enterpriseSearch/**', { timeout: 30_000 });
  }

  async expectConnectorStatusConfigured(): Promise<void> {
    const statusTab = this.page.getByRole('tab', { name: new RegExp(`^${ENTERPRISE_SEARCH.statusTab}$`, 'i') });
    if (await statusTab.isVisible().catch(() => false)) {
      await statusTab.click();
    }

    const configuredVisible = await this.configuredStatus().first().isVisible().catch(() => false);
    if (configuredVisible) {
      return;
    }

    await this.page.getByText(MESSAGES.connectorSetupComplete).first().waitFor({ state: 'visible', timeout: 60_000 });
  }

  getConfluenceConnectorOption(): Locator {
    return this.confluenceConnectorOption();
  }

  getConnectorNameInput(): Locator {
    return this.connectorNameInput();
  }

  getCloudEmailInput(): Locator {
    return this.cloudEmailInput();
  }

  getApiTokenInput(): Locator {
    return this.apiTokenInput();
  }

  getUrlLabelInput(): Locator {
    return this.urlLabelInput();
  }

  getSaveConfigurationButton(): Locator {
    return this.saveConfigurationButton();
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
    await this.tokenGeneratedMessage().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async copyGeneratedToken(): Promise<void> {
    await this.copyTokenButton().click();
  }

  getGeneratedToken(): Locator {
    return this.generatedToken();
  }

  getSuccessMessage(): Locator {
    return this.tokenGeneratedMessage();
  }

  private readonly configurationTabButton = (): Locator =>
    this.page.getByRole('tab', { name: new RegExp(`^${ENTERPRISE_SEARCH.configurationTab}$`, 'i') });

  private readonly showInResultsToggle = (): Locator =>
    this.page.getByRole('switch', { name: CONFLUENCE.showInResults });

  private readonly showInResultsLabel = (): Locator => this.page.getByText(CONFLUENCE.showInResults);

  async openConfiguredConnectorFromSources(connectorName: string): Promise<void> {
    await this.page.goto('/manage/enterpriseSearch/sources/apps', { waitUntil: 'domcontentloaded' });
    const connectorLink = this.page
      .getByRole('link', { name: new RegExp(`${ENTERPRISE_SEARCH.confluenceConnector}.*${connectorName}`, 'i') })
      .first();
    await connectorLink.waitFor({ state: 'visible', timeout: 30_000 });
    await connectorLink.click();
    await this.page.waitForURL('**/confluence/**', { timeout: 30_000 });
  }

  async openConfigurationTab(): Promise<void> {
    await this.configurationTabButton().click();
    await this.connectorNameInput().waitFor({ state: 'visible', timeout: 30_000 });
  }

  getShowInResultsToggle(): Locator {
    return this.showInResultsToggle();
  }

  getShowInResultsLabel(): Locator {
    return this.showInResultsLabel();
  }

  async expectShowInResultsVisible(): Promise<void> {
    await this.showInResultsLabel().waitFor({ state: 'visible', timeout: 30_000 });
    await this.showInResultsToggle().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async expectShowInResultsEnabled(): Promise<void> {
    await this.expectShowInResultsVisible();
    await expect(this.showInResultsToggle()).toHaveAttribute('aria-checked', 'true');
  }

  async expectApiTokenMasked(plainToken?: string): Promise<void> {
    const tokenInput = this.apiTokenInput();
    await tokenInput.waitFor({ state: 'visible', timeout: 30_000 });

    const inputType = await tokenInput.getAttribute('type');
    if (inputType === 'password') {
      return;
    }

    const value = await tokenInput.inputValue();
    if (plainToken && value.includes(plainToken)) {
      throw new Error('API token is displayed in plain text');
    }

    const isMasked =
      value.length === 0 ||
      /^[*•·.\s]+$/.test(value) ||
      (plainToken ? value !== plainToken : value.length > 0 && !value.startsWith('ATATT'));

    if (!isMasked) {
      throw new Error(`API token does not appear masked. type=${inputType}, value length=${value.length}`);
    }
  }

  async enableShowInResults(): Promise<void> {
    const toggle = this.showInResultsToggle();
    await toggle.waitFor({ state: 'visible', timeout: 30_000 });

    if ((await toggle.getAttribute('aria-checked')) !== 'true') {
      await toggle.click();
    }

    if (await this.saveConfigurationButton().isEnabled().catch(() => false)) {
      await this.saveConfiguration();
      await this.waitForConfigurationSavedSuccess().catch(() => undefined);
    }
  }

  async expectSaveConfigurationDisabled(): Promise<void> {
    await this.saveConfigurationButton().waitFor({ state: 'visible', timeout: 30_000 });
    await expect(this.saveConfigurationButton()).toBeDisabled();
  }

  async expectSaveConfigurationEnabled(): Promise<void> {
    await this.saveConfigurationButton().waitFor({ state: 'visible', timeout: 30_000 });
    await expect(this.saveConfigurationButton()).toBeEnabled();
  }

  async modifyConnectorName(name: string): Promise<void> {
    await this.connectorNameInput().fill(name);
  }

  async toggleShowInResults(): Promise<void> {
    await this.showInResultsToggle().click();
  }

  private readonly statusTabButton = (): Locator =>
    this.page.getByRole('tab', { name: new RegExp(`^${ENTERPRISE_SEARCH.statusTab}$`, 'i') });

  private readonly statusTabPanel = (): Locator =>
    this.page.getByRole('tabpanel', { name: new RegExp(`^${ENTERPRISE_SEARCH.statusTab}$`, 'i') });

  private readonly startSyncButton = (): Locator =>
    this.statusTabPanel().getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.startSyncButton, 'i') });

  private readonly syncMenuButton = (): Locator =>
    this.statusTabPanel().getByRole('button', { name: new RegExp(`^${ENTERPRISE_SEARCH.syncMenuButton}$`, 'i') });

  private readonly syncOptionsMenuButton = (): Locator =>
    this.statusTabPanel().getByRole('button', { name: /^Open menu$/i });

  private readonly fullSyncButton = (): Locator =>
    this.page.getByRole('menuitem', { name: new RegExp(ENTERPRISE_SEARCH.fullSyncButton, 'i') }).or(
      this.page.getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.fullSyncButton, 'i') }),
    ).or(this.page.getByRole('option', { name: new RegExp(ENTERPRISE_SEARCH.fullSyncButton, 'i') }));

  private readonly syncProgressStatus = (): Locator =>
    this.page
      .getByText(MESSAGES.fullSyncStarted)
      .or(this.page.getByText(MESSAGES.syncInProgress))
      .or(this.page.getByText(MESSAGES.syncComplete));

  private readonly updateConnectionDialog = (): Locator =>
    this.page.getByRole('dialog').filter({ hasText: /update connection/i });

  private readonly updateConnectionButton = (): Locator =>
    this.page.getByRole('button', { name: /^Update$/i });

  async confirmConfigurationUpdateIfPresent(): Promise<void> {
    const dialog = this.updateConnectionDialog();
    if (await dialog.isVisible().catch(() => false)) {
      await this.updateConnectionButton().click();
      await dialog.waitFor({ state: 'hidden', timeout: 60_000 });
    }
  }

  async updateUrlLabelAndSave(urlLabel: string): Promise<void> {
    await this.openConfigurationTab();
    await this.configurationPage.enterUrlLabel(urlLabel);

    if (await this.saveConfigurationButton().isEnabled().catch(() => false)) {
      await this.saveConfiguration();
      await this.confirmConfigurationUpdateIfPresent();
      await this.waitForConfigurationSavedSuccess().catch(() => undefined);
    }
  }

  async updateConnectorConfigurationAndSave(config: ConfluenceConnectorConfig): Promise<void> {
    await this.openConfigurationTab();
    await this.configurationPage.enterCloudEmail(config.cloudEmail);
    await this.configurationPage.enterApiToken(config.apiToken);
    await this.configurationPage.enterUrlLabel(config.urlLabel);

    if (await this.saveConfigurationButton().isEnabled().catch(() => false)) {
      await this.saveConfiguration();
      await this.confirmConfigurationUpdateIfPresent();
      await this.waitForConfigurationSavedSuccess().catch(() => undefined);
    }
  }

  async openStatusTab(): Promise<void> {
    await this.updateConnectionDialog().waitFor({ state: 'hidden', timeout: 60_000 }).catch(() => undefined);

    if (this.page.url().includes('/status')) {
      await this.page.getByText(/Sync|Start sync|Total items/i).first().waitFor({ state: 'visible', timeout: 30_000 });
      return;
    }

    await this.statusTabButton().click();
    await this.page.waitForURL(/confluence/i, { timeout: 30_000 });
  }

  async isSyncAlreadyInProgress(): Promise<boolean> {
    return this.getSyncProgressStatus().isVisible().catch(() => false);
  }

  async clickStartSync(): Promise<void> {
    if (await this.isSyncAlreadyInProgress()) {
      return;
    }

    if (await this.startSyncButton().isVisible().catch(() => false)) {
      await this.startSyncButton().click();
      return;
    }

    if (await this.syncMenuButton().isVisible().catch(() => false)) {
      await this.syncMenuButton().click();
      return;
    }

    if (await this.syncOptionsMenuButton().isVisible().catch(() => false)) {
      await this.syncOptionsMenuButton().click();
    }
  }

  async clickFullSync(): Promise<void> {
    if (await this.isSyncAlreadyInProgress()) {
      return;
    }

    const fullSyncOption = this.fullSyncButton().first();
    if (await fullSyncOption.isVisible().catch(() => false)) {
      await fullSyncOption.click();
    }
  }

  async selectFullSync(): Promise<void> {
    await this.clickStartSync();
    await this.clickFullSync();
  }

  async expectFullSyncStarted(): Promise<void> {
    await this.syncProgressStatus().first().waitFor({ state: 'visible', timeout: 120_000 });
  }

  getSyncProgressStatus(): Locator {
    return this.syncProgressStatus().first();
  }

  getStartSyncButton(): Locator {
    return this.startSyncButton().or(this.syncMenuButton()).or(this.syncOptionsMenuButton()).first();
  }

  getSyncOptionsMenuButton(): Locator {
    return this.syncOptionsMenuButton();
  }
}
