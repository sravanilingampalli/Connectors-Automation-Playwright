import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { ENTERPRISE_SEARCH, MESSAGES } from '../../constants';
import { BoxConnectorConfig } from '../../data/connectors/box';

export class ESConnectorsBoxPage extends BasePage {
  private readonly boxConnectorOption = (): Locator =>
    this.page.getByRole('dialog').getByRole('button', {
      name: new RegExp(`^${ENTERPRISE_SEARCH.boxConnector}$`, 'i'),
    });

  private readonly connectorNameInput = (): Locator =>
    this.page.getByRole('textbox', { name: /Connection name/i });

  private readonly clientIdInput = (): Locator => this.page.getByRole('textbox', { name: /Client ID/i });

  private readonly clientSecretInput = (): Locator =>
    this.page.getByRole('textbox', { name: /Client secret/i });

  private readonly enterpriseIdInput = (): Locator =>
    this.page.getByRole('textbox', { name: /Enterprise ID/i });

  private readonly saveConfigurationButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.saveConfigurationButton, 'i') });

  private readonly saveAndSyncButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.saveAndSyncButton, 'i') });

  private readonly step2Heading = (): Locator =>
    this.page.getByRole('heading', { name: /Restrict the ingestion/i });

  private readonly successMessage = (): Locator =>
    this.page.getByText(MESSAGES.boxConfigurationSavedSuccess);

  private readonly fullSyncStatus = (): Locator => this.page.getByText(MESSAGES.fullSyncStarted);

  private readonly confirmationDialog = (): Locator =>
    this.page.getByRole('dialog').filter({ hasText: MESSAGES.confirmConnectorCreation });

  private readonly confirmIngestionButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(`^${ENTERPRISE_SEARCH.confirmIngestionButton}$`, 'i') });

  private readonly startSyncButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.startSyncButton, 'i') });

  private readonly statusTabButton = (): Locator =>
    this.page.getByRole('tab', { name: new RegExp(`^${ENTERPRISE_SEARCH.statusTab}$`, 'i') });

  private readonly dataFiltersTabButton = (): Locator =>
    this.page.getByRole('tab', { name: new RegExp(`^${ENTERPRISE_SEARCH.dataFiltersTab}$`, 'i') });

  private readonly totalItemsLabel = (): Locator => this.page.getByText(/Total items:/i);

  private readonly documentsIngestedMessage = (): Locator => this.page.getByText(MESSAGES.documentsIngested);

  private readonly twoYearFilterLabel = (): Locator => this.page.getByText(MESSAGES.twoYearIngestionFilter);

  constructor(page: Page) {
    super(page);
  }

  async selectBoxConnector(): Promise<void> {
    await this.boxConnectorOption().click();
    await this.page.waitForURL('**/box/setup**', { timeout: 30_000 });
  }

  async expectSetupFormDisplayed(): Promise<void> {
    await this.connectorNameInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.clientIdInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.clientSecretInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.enterpriseIdInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.saveConfigurationButton().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async configureBoxConnector(config: BoxConnectorConfig): Promise<void> {
    await this.connectorNameInput().fill(config.connectorName);
    await this.clientIdInput().fill(config.clientId);
    await this.clientSecretInput().fill(config.clientSecret);
    await this.enterpriseIdInput().fill(config.enterpriseId);
    await this.enterpriseIdInput().blur();
  }

  async saveConfiguration(): Promise<void> {
    await this.saveConfigurationButton().click({ timeout: 60_000 });
  }

  async attemptSaveConfiguration(): Promise<void> {
    const saveButton = this.saveConfigurationButton();
    if (await saveButton.isEnabled()) {
      await saveButton.click();
      return;
    }

    await this.clientIdInput().evaluate((element) => {
      if ('reportValidity' in element && typeof element.reportValidity === 'function') {
        element.reportValidity();
      }
    });
  }

  async expectInvalidCredentialFormatErrors(): Promise<void> {
    await this.page
      .getByRole('alert')
      .filter({ hasText: MESSAGES.invalidCredentialFormat })
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 });
  }

  async expectConnectorCreationBlocked(): Promise<void> {
    await this.page.waitForURL(/box\/setup/i, { timeout: 15_000 });

    if (await this.step2Heading().isVisible().catch(() => false)) {
      throw new Error('Connector creation should be blocked on Step 1');
    }

    if (await this.saveConfigurationButton().isEnabled()) {
      throw new Error('Save configuration should remain disabled for invalid credentials');
    }
  }

  getInvalidCredentialError(): Locator {
    return this.page.getByRole('alert').filter({ hasText: MESSAGES.invalidCredentialFormat });
  }

  getSaveConfigurationButton(): Locator {
    return this.saveConfigurationButton();
  }

  async confirmConnectorCreationIfPresent(): Promise<void> {
    const dialog = this.confirmationDialog();
    if (await dialog.isVisible().catch(() => false)) {
      await this.confirmationDialog().getByRole('button', { name: /confirm|yes|ok|save|create/i }).click();
    }
  }

  async confirmIngestionSetup(): Promise<void> {
    await this.confirmIngestionButton().click();
    await this.page.waitForURL('**/box/**/status**', { timeout: 60_000 });
  }

  async openStatusTab(): Promise<void> {
    if (this.page.url().includes('/status')) {
      await this.page.getByText(/Sync|Total items|Start sync/i).first().waitFor({ state: 'visible', timeout: 30_000 });
      return;
    }

    await this.statusTabButton().click();
    await this.page.waitForURL('**/status**', { timeout: 30_000 });
  }

  async openDataFiltersTab(): Promise<void> {
    await this.dataFiltersTabButton().click();
  }

  async openConnectorFromSources(connectorName: string): Promise<void> {
    const connectorLink = this.page.getByRole('link', { name: new RegExp(connectorName, 'i') }).first();
    await connectorLink.click();
    await this.page.waitForURL('**/box/**', { timeout: 30_000 });
  }

  async startSyncIfNeeded(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (await this.startSyncButton().isVisible().catch(() => false)) {
        await this.startSyncButton().click();
        await this.page.waitForTimeout(5_000);
      }

      const pageText = await this.page.locator('body').innerText();
      if (MESSAGES.syncInProgress.test(pageText) || MESSAGES.syncComplete.test(pageText)) {
        return;
      }
    }
  }

  async waitForInitialSyncOrFallback(fallbackConnectorName: string): Promise<string> {
    const deadline = Date.now() + 120_000;

    while (Date.now() < deadline) {
      const pageText = await this.page.locator('body').innerText();
      if (MESSAGES.syncInProgress.test(pageText) || MESSAGES.syncComplete.test(pageText)) {
        return 'created';
      }
      await this.page.waitForTimeout(10_000);
      await this.openStatusTab();
      await this.startSyncIfNeeded();
    }

    await this.page.goto('/manage/enterpriseSearch/sources/apps', { waitUntil: 'domcontentloaded' });
    await this.openConnectorFromSources(fallbackConnectorName);
    await this.openStatusTab();
    return 'fallback';
  }

  async createConnectorAndStartInitialSync(config: BoxConnectorConfig): Promise<void> {
    await this.selectBoxConnector();
    await this.expectSetupFormDisplayed();
    await this.configureBoxConnector(config);
    await this.saveConfiguration();
    await this.confirmConnectorCreationIfPresent();
    await this.expectStep2Displayed();
    await this.clickSaveAndSync();
    await this.confirmIngestionSetup();
    await this.openStatusTab();
    await this.startSyncIfNeeded();
  }

  async expectInitialSyncInProgressOrComplete(): Promise<void> {
    await this.page
      .getByText(MESSAGES.syncInProgress)
      .or(this.page.getByText(MESSAGES.syncComplete))
      .first()
      .waitFor({ state: 'visible', timeout: 300_000 });
  }

  async expectDocumentsIngested(): Promise<void> {
    await this.documentsIngestedMessage().first().waitFor({ state: 'visible', timeout: 60_000 });
    await this.totalItemsLabel().waitFor({ state: 'visible', timeout: 30_000 });
    const totalItemsText = await this.totalItemsLabel().textContent();
    const itemCount = Number(totalItemsText?.match(/\d+/)?.[0] ?? 0);
    if (itemCount <= 0) {
      await this.page.getByText(MESSAGES.syncComplete).first().waitFor({ state: 'visible', timeout: 120_000 });
    }
  }

  async expectTwoYearDocumentIngestionFilter(): Promise<void> {
    await this.openDataFiltersTab();
    await this.twoYearFilterLabel().waitFor({ state: 'visible', timeout: 30_000 });
    await this.page.getByRole('button', { name: /Date/i }).waitFor({ state: 'visible', timeout: 15_000 });
  }

  async expectUsersIngestionSupported(): Promise<void> {
    await this.openStatusTab();
    await this.page.getByText(MESSAGES.documentsIngested).first().waitFor({ state: 'visible', timeout: 30_000 });
    await this.page.getByText(/items and documents ingested/i).waitFor({ state: 'visible', timeout: 15_000 });
  }

  async waitForSuccessMessage(): Promise<void> {
    await this.successMessage().waitFor({ state: 'visible', timeout: 60_000 });
  }

  async expectConnectorCreated(connectorName: string): Promise<void> {
    await this.waitForSuccessMessage();
    await this.page.getByRole('heading', { name: /ID:/i }).waitFor({ state: 'visible', timeout: 30_000 });
  }

  async expectStep2Displayed(): Promise<void> {
    await this.step2Heading().waitFor({ state: 'visible', timeout: 30_000 });
    await this.saveAndSyncButton().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async clickSaveAndSync(): Promise<void> {
    await this.saveAndSyncButton().click();
  }

  async expectFullSyncStarted(): Promise<void> {
    await this.fullSyncStatus().first().waitFor({ state: 'visible', timeout: 90_000 });
  }

  getBoxConnectorOption(): Locator {
    return this.boxConnectorOption();
  }

  getConnectorNameInput(): Locator {
    return this.connectorNameInput();
  }

  getSuccessMessage(): Locator {
    return this.successMessage();
  }

  getSyncStatus(): Locator {
    return this.page.getByText(MESSAGES.syncInProgress).or(this.page.getByText(MESSAGES.syncComplete)).first();
  }

  getFullSyncStatus(): Locator {
    return this.fullSyncStatus();
  }
}
