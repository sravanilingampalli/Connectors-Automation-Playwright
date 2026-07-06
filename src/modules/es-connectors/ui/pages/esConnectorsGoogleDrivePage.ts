import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '@core/ui/pages/basePage';
import { ROUTES } from '@es-connectors/constants';
import { CONNECTOR_FIELDS, ENTERPRISE_SEARCH, AUDIENCE_FILTER, DATA_FILTERS, MESSAGES } from '@es-connectors/constants';
import { GoogleDriveConnectorConfig, GoogleDriveSyncConfig } from '@es-connectors/test-data/google-drive';
import { GoogleDrive2AudienceFilterConfig, SyncHistoryEntry } from '@es-connectors/types/connectorTypes';
import { ESConnectorConfigurationPage } from '@es-connectors/ui/components/connectorConfigurationForm';

export class ESConnectorsGoogleDrivePage extends BasePage {
  private readonly configurationPage: ESConnectorConfigurationPage;

  private readonly googleDriveConnectorOption = (): Locator =>
    this.page.getByRole('dialog').getByRole('button', {
      name: new RegExp(`^${ENTERPRISE_SEARCH.googleDriveConnector}$`, 'i'),
    });

  private readonly connectorNameInput = (): Locator =>
    this.page.getByRole('textbox', { name: new RegExp(CONNECTOR_FIELDS.connectorName, 'i') });

  private readonly adminEmailInput = (): Locator =>
    this.page.getByRole('textbox', { name: new RegExp(CONNECTOR_FIELDS.googleAdminEmail, 'i') });

  private readonly serviceAccountJsonInput = (): Locator =>
    this.page.getByRole('textbox', { name: new RegExp(CONNECTOR_FIELDS.googleServiceAccountJson, 'i') });

  private readonly saveConfigurationButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.saveConfigurationButton, 'i') });

  private readonly configurationTabButton = (): Locator =>
    this.page.getByRole('tab', { name: new RegExp(`^${ENTERPRISE_SEARCH.configurationTab}$`, 'i') });

  private readonly step2Heading = (): Locator =>
    this.page.getByRole('heading', { name: /Define which content you want to ingest from Google Drive/i });

  private readonly saveAndSyncButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.saveAndSyncButton, 'i') });

  private readonly confirmIngestionButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(`^${ENTERPRISE_SEARCH.confirmIngestionButton}$`, 'i') });

  private readonly confirmationDialog = (): Locator =>
    this.page.getByRole('dialog').filter({ hasText: /Setup connector|confirm|ingest/i });

  private readonly enableShowInResultsDialog = (): Locator =>
    this.page.getByRole('dialog').filter({ hasText: MESSAGES.enableShowInResultsDialog });

  private readonly enableShowInResultsButton = (): Locator =>
    this.enableShowInResultsDialog().getByRole('button', {
      name: new RegExp(`^${ENTERPRISE_SEARCH.enableShowInResultsButton}$`, 'i'),
    });

  private readonly showInResultsToggle = (): Locator =>
    this.showInResultsLabel().locator('xpath=preceding-sibling::*[@role="switch"][1]');

  private readonly showInResultsLabel = (): Locator =>
    this.page.getByText(CONNECTOR_FIELDS.showInResults, { exact: true }).first();

  private readonly successMessage = (): Locator =>
    this.page.getByText(MESSAGES.googleDriveConfigurationSavedSuccess);

  private readonly statusTabButton = (): Locator =>
    this.page.getByRole('tab', { name: new RegExp(`^${ENTERPRISE_SEARCH.statusTab}$`, 'i') });

  private readonly statusTabPanel = (): Locator =>
    this.page.getByRole('tabpanel', { name: new RegExp(`^${ENTERPRISE_SEARCH.statusTab}$`, 'i') });

  private readonly syncMenuButton = (): Locator =>
    this.statusTabPanel().getByRole('button', { name: new RegExp(`^${ENTERPRISE_SEARCH.syncMenuButton}$`, 'i') });

  private readonly syncOptionsMenuButton = (): Locator =>
    this.statusTabPanel().getByRole('button', { name: /^Open menu$/i });

  private readonly startSyncButton = (): Locator =>
    this.statusTabPanel().getByRole('button', { name: new RegExp(`^${ENTERPRISE_SEARCH.startSyncButton}$`, 'i') });

  private readonly resumeSyncButton = (): Locator =>
    this.statusTabPanel().getByRole('button', { name: new RegExp(`^${ENTERPRISE_SEARCH.resumeSyncButton}$`, 'i') });

  private readonly syncInProgressBanner = (): Locator =>
    this.statusTabPanel().getByText(MESSAGES.syncInProgressBanner).first();

  private readonly syncProgressStatus = (): Locator =>
    this.syncInProgressBanner()
      .or(this.statusTabPanel().getByText(MESSAGES.syncPending).first())
      .or(this.statusTabPanel().getByText(MESSAGES.fullSyncStarted).first())
      .or(this.statusTabPanel().getByText(MESSAGES.syncInProgress).first())
      .first();

  async expectStatusTabReady(syncConfig: GoogleDriveSyncConfig, timeoutMs = 30_000): Promise<void> {
    await expect(async () => {
      const panel = this.statusTabPanel();
      const ready =
        (await this.getStartSyncButton(syncConfig).isVisible().catch(() => false)) ||
        (await panel.getByRole('button', { name: /^Stop sync$/i }).isVisible().catch(() => false)) ||
        (await this.getSyncDropdownButton(syncConfig).isVisible().catch(() => false)) ||
        (await this.syncInProgressBanner().isVisible().catch(() => false)) ||
        (await panel.getByText(MESSAGES.syncNotInitiated).isVisible().catch(() => false)) ||
        (await panel.getByText(MESSAGES.syncHistoryTimestamp).first().isVisible().catch(() => false));

      expect(ready).toBeTruthy();
    }).toPass({ timeout: timeoutMs });
  }

  constructor(page: Page) {
    super(page);
    this.configurationPage = new ESConnectorConfigurationPage(page);
  }

  async selectGoogleDriveConnector(): Promise<void> {
    await this.googleDriveConnectorOption().click();
    await this.page.getByRole('dialog').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => undefined);
    await this.page.getByRole('heading', { name: /^Google Drive$/i }).waitFor({ state: 'visible', timeout: 30_000 });
    await this.expectSetupFormDisplayed();
  }

  async expectSetupFormDisplayed(): Promise<void> {
    await this.connectorNameInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.adminEmailInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.serviceAccountJsonInput().waitFor({ state: 'visible', timeout: 30_000 });
    await this.saveConfigurationButton().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async configureGoogleDriveConnector(config: GoogleDriveConnectorConfig): Promise<void> {
    await this.setReactFieldValue(this.connectorNameInput(), config.connectorName);
    await this.setReactFieldValue(this.adminEmailInput(), config.adminEmail);
    await this.setReactFieldValue(this.serviceAccountJsonInput(), config.serviceAccountJson);
    await expect(this.serviceAccountJsonInput()).toHaveValue(/"type"\s*:\s*"service_account"/, {
      timeout: 15_000,
    });
  }

  private async setReactFieldValue(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: 30_000 });
    await locator.scrollIntoViewIfNeeded();
    await locator.click();
    await locator.fill(value);
    await locator.evaluate((element, fieldValue) => {
      const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set;
      if (setter) {
        setter.call(element, fieldValue);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, value);
    await locator.blur();
  }

  async saveConfiguration(): Promise<void> {
    const saveButton = this.saveConfigurationButton();
    await expect(saveButton).toBeEnabled({ timeout: 30_000 });
    await saveButton.scrollIntoViewIfNeeded();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await saveButton.click({ force: attempt > 0 });

      try {
        await this.waitForConfigurationSavedSuccess();
        return;
      } catch (error) {
        const stillOnStep1 = await saveButton.isVisible().catch(() => false);
        if (!stillOnStep1 || attempt === 2) {
          throw error;
        }

        await saveButton.scrollIntoViewIfNeeded();
      }
    }
  }

  async waitForConfigurationSavedSuccess(): Promise<void> {
    await expect(
      this.getSuccessMessage()
        .or(this.page.getByRole('heading', { name: /^ID:$/i }))
        .or(this.step2Heading())
        .first(),
    ).toBeVisible({ timeout: 120_000 });
  }

  async expectConnectorCreated(connectorName: string): Promise<void> {
    await this.expectStep2Displayed();

    if (await this.getSuccessMessage().isVisible().catch(() => false)) {
      await this.getSuccessMessage()
        .filter({ hasText: connectorName })
        .waitFor({ state: 'visible', timeout: 15_000 })
        .catch(() => undefined);
    }
  }

  async expectStep2Displayed(): Promise<void> {
    await this.step2Heading().waitFor({ state: 'visible', timeout: 30_000 });
    await this.saveAndSyncButton().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async confirmIngestionSetupIfPresent(): Promise<void> {
    const dialog = this.confirmationDialog();
    if (!(await dialog.isVisible({ timeout: 30_000 }).catch(() => false))) {
      return;
    }

    const confirmButton = this.confirmIngestionButton();
    if (await confirmButton.isVisible().catch(() => false)) {
      await expect(confirmButton).toBeEnabled({ timeout: 15_000 });
      await confirmButton.click();
    } else {
      await dialog.getByRole('button', { name: /confirm|yes|ok|save|create/i }).first().click();
    }

    await dialog.waitFor({ state: 'hidden', timeout: 60_000 });
  }

  async completeStep2SaveAndSync(): Promise<void> {
    const step2Visible = await this.step2Heading().isVisible({ timeout: 10_000 }).catch(() => false);
    const saveAndSyncVisible = await this.saveAndSyncButton().isVisible({ timeout: 5_000 }).catch(() => false);

    if (!step2Visible && !saveAndSyncVisible) {
      return;
    }

    if (step2Visible) {
      await this.expectStep2Displayed();
    }

    await expect(this.saveAndSyncButton()).toBeEnabled({ timeout: 30_000 });
    await this.saveAndSyncButton().scrollIntoViewIfNeeded();
    await this.saveAndSyncButton().click();
    await this.confirmIngestionSetupIfPresent();

    await this.page
      .getByRole('tab', { name: new RegExp(`^${ENTERPRISE_SEARCH.statusTab}$`, 'i') })
      .or(this.configurationTabButton())
      .first()
      .waitFor({ state: 'visible', timeout: 120_000 });

    await this.step2Heading().waitFor({ state: 'hidden', timeout: 60_000 });
  }

  async openConfiguredConnectorFromSources(connectorName: string): Promise<void> {
    await this.page.goto(ROUTES.enterpriseSearchSources, { waitUntil: 'domcontentloaded' });
    const connectorLink = this.page.getByRole('link', { name: new RegExp(connectorName, 'i') }).first();
    await connectorLink.waitFor({ state: 'visible', timeout: 30_000 });
    await connectorLink.click();
  }

  async tryOpenLatestConnectorFromSources(namePattern: RegExp): Promise<string | null> {
    await this.page.goto(ROUTES.enterpriseSearchSources, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await this.page
      .getByRole('button', { name: /close menu/i })
      .click({ timeout: 5_000 })
      .catch(() => undefined);
    await this.page
      .getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.addSourceButton, 'i') })
      .or(this.page.getByRole('heading', { name: /^Sources$/i }))
      .first()
      .waitFor({ state: 'visible', timeout: 60_000 })
      .catch(() => undefined);

    const connectorLinks = this.page.getByRole('link').filter({ hasText: namePattern });
    const count = await connectorLinks.count();
    if (count === 0) {
      return null;
    }

    return this.openConnectorLink(connectorLinks.last());
  }

  async tryOpenLatestGoogleDriveConnectorFromSources(): Promise<string | null> {
    await this.page.goto(ROUTES.enterpriseSearchSources, { waitUntil: 'domcontentloaded' });
    await this.page
      .getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.addSourceButton, 'i') })
      .waitFor({ state: 'visible', timeout: 30_000 })
      .catch(() => undefined);

    const connectorLinks = this.page.locator('a[href*="/google_drive/"]');
    const count = await connectorLinks.count();
    if (count === 0) {
      return null;
    }

    return this.openConnectorLink(connectorLinks.last());
  }

  private async openConnectorLink(connectorLink: Locator): Promise<string | null> {
    const connectorName = ((await connectorLink.textContent()) ?? '').trim();
    if (!connectorName) {
      return null;
    }

    await connectorLink.click();
    await this.page
      .getByRole('heading', { name: /^Google Drive$/i })
      .waitFor({ state: 'visible', timeout: 30_000 })
      .catch(() => undefined);

    return connectorName;
  }

  async ensureStep2CompletedIfPresent(): Promise<void> {
    const step2Visible = await this.step2Heading().isVisible({ timeout: 60_000 }).catch(() => false);
    if (!step2Visible) {
      return;
    }

    await this.completeStep2SaveAndSync();
  }

  async openConfigurationTabAfterConnectorSave(): Promise<void> {
    await this.ensureStep2CompletedIfPresent();

    await this.configurationTabButton().waitFor({ state: 'visible', timeout: 120_000 });
    await this.configurationTabButton().click();
    await this.expectShowInResultsVisible();
  }

  async openConfigurationTab(connectorName?: string): Promise<void> {
    if (!(await this.configurationTabButton().isVisible({ timeout: 5_000 }).catch(() => false))) {
      if (await this.step2Heading().isVisible({ timeout: 5_000 }).catch(() => false)) {
        await this.completeStep2SaveAndSync();
      } else if (connectorName) {
        await this.openConfiguredConnectorFromSources(connectorName);
      }
    }

    await this.configurationTabButton().waitFor({ state: 'visible', timeout: 60_000 });
    await this.configurationTabButton().click();
    await this.expectShowInResultsVisible();
  }

  getShowInResultsToggle(): Locator {
    return this.showInResultsToggle();
  }

  getShowInResultsLabel(): Locator {
    return this.showInResultsLabel();
  }

  async expectShowInResultsVisible(): Promise<void> {
    await this.showInResultsLabel().waitFor({ state: 'visible', timeout: 30_000 });
    await expect(this.showInResultsToggle()).toBeAttached({ timeout: 30_000 });
  }

  async expectShowInResultsEnabled(): Promise<void> {
    await this.expectShowInResultsVisible();
    await expect(this.showInResultsToggle()).toHaveAttribute('aria-checked', 'true', { timeout: 30_000 });
  }

  async confirmEnableShowInResultsIfPresent(): Promise<void> {
    const dialog = this.enableShowInResultsDialog();
    if (await dialog.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await this.enableShowInResultsButton().click();
      await dialog.waitFor({ state: 'hidden', timeout: 30_000 });
    }
  }

  async enableShowInResults(): Promise<void> {
    const toggle = this.showInResultsToggle();
    await expect(toggle).toBeAttached({ timeout: 30_000 });

    if ((await toggle.getAttribute('aria-checked')) !== 'true') {
      await toggle.scrollIntoViewIfNeeded();
      await toggle.click({ force: true });
      await this.confirmEnableShowInResultsIfPresent();
      await expect(toggle).toHaveAttribute('aria-checked', 'true', { timeout: 10_000 });
    }

    if (await this.saveConfigurationButton().isEnabled({ timeout: 5_000 }).catch(() => false)) {
      await this.saveConfiguration();
      await this.getSuccessMessage()
        .waitFor({ state: 'visible', timeout: 30_000 })
        .catch(() => undefined);
      await expect(this.showInResultsToggle()).toHaveAttribute('aria-checked', 'true', { timeout: 30_000 });
    }
  }

  async openStatusTab(syncConfig?: GoogleDriveSyncConfig): Promise<void> {
    await this.ensureStep2CompletedIfPresent();

    const statusTabLabel = syncConfig?.statusTab ?? ENTERPRISE_SEARCH.statusTab;
    const statusTab = this.page.getByRole('tab', { name: new RegExp(`^${statusTabLabel}$`, 'i') });
    const statusPanelVisible = await this.statusTabPanel().isVisible().catch(() => false);

    if (!statusPanelVisible) {
      await statusTab.waitFor({ state: 'visible', timeout: 30_000 });
      await statusTab.click();
    }

    await this.statusTabPanel().waitFor({ state: 'visible', timeout: 30_000 });
    await this.statusTabPanel()
      .getByText(/Sync|Start sync|Resume Sync|Total items|Last sync/i)
      .first()
      .waitFor({ state: 'visible', timeout: 30_000 });
  }

  async isSyncNotInitiated(syncConfig: GoogleDriveSyncConfig): Promise<boolean> {
    return this.statusTabPanel()
      .getByText(new RegExp(syncConfig.syncNotInitiatedStatus, 'i'))
      .isVisible()
      .catch(() => false);
  }

  getSyncDropdownButton(syncConfig: GoogleDriveSyncConfig): Locator {
    const panel = this.statusTabPanel();
    const stopSyncGroup = panel.getByRole('group').filter({
      has: panel.getByRole('button', { name: /^Stop sync$/i }),
    });
    const syncButtonGroup = panel.getByRole('group').filter({
      has: panel.getByRole('button', { name: new RegExp(`^${syncConfig.syncMenuButton}$`, 'i') }),
    });
    const startSyncGroup = panel.getByRole('group').filter({
      has: panel.getByRole('button', { name: new RegExp(`^${syncConfig.startSyncButton}$`, 'i') }),
    });

    return stopSyncGroup
      .getByRole('button', { name: /^Open menu$/i })
      .or(syncButtonGroup.getByRole('button').last())
      .or(startSyncGroup.getByRole('button').last())
      .or(panel.getByRole('button', { name: new RegExp(syncConfig.syncOptionsMenuButton, 'i') }))
      .first();
  }

  getSyncDropdownMenu(syncConfig: GoogleDriveSyncConfig): Locator {
    return this.page
      .getByRole('menu')
      .filter({ hasText: new RegExp(syncConfig.syncType, 'i') })
      .first();
  }

  async clickSyncDropdown(syncConfig: GoogleDriveSyncConfig): Promise<void> {
    await this.openSyncDropdownMenu(syncConfig);
    await this.getFullSyncOption(syncConfig).waitFor({ state: 'visible', timeout: 15_000 });
  }

  async openSyncDropdownMenu(syncConfig: GoogleDriveSyncConfig): Promise<void> {
    const dropdown = this.getSyncDropdownButton(syncConfig);

    if (await dropdown.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await dropdown.scrollIntoViewIfNeeded();
      await dropdown.click();
      await this.page
        .getByText(/start incremental sync|start full sync/i)
        .first()
        .waitFor({ state: 'visible', timeout: 15_000 });
      return;
    }

    if (await this.isSyncNotInitiated(syncConfig)) {
      return;
    }

    await dropdown.waitFor({ state: 'visible', timeout: 30_000 });
    await dropdown.scrollIntoViewIfNeeded();
    await dropdown.click();
    await this.page
      .getByText(/start incremental sync|start full sync/i)
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 });
  }

  async selectIncrementalSync(syncConfig: GoogleDriveSyncConfig): Promise<void> {
    const incrementalSync = this.getIncrementalSyncOption(syncConfig);
    await incrementalSync.waitFor({ state: 'visible', timeout: 30_000 });
    await incrementalSync.click();
    await this.page
      .getByText(/start incremental sync|start full sync/i)
      .first()
      .waitFor({ state: 'hidden', timeout: 10_000 })
      .catch(async () => {
        await this.page.keyboard.press('Escape');
      });
  }

  async clickSyncAfterIncrementalSelection(syncConfig: GoogleDriveSyncConfig): Promise<void> {
    const panel = this.statusTabPanel();

    if (await this.waitForIncrementalSyncToStart(30_000)) {
      return;
    }

    const syncButton = panel.getByRole('button', { name: new RegExp(`^${syncConfig.syncMenuButton}$`, 'i') });
    if (await syncButton.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await syncButton.click();
      await this.confirmIngestionSetupIfPresent();
      await this.waitForIncrementalSyncToStart(60_000);
      return;
    }

    const resumeAutoSync = panel.getByRole('button', { name: /resume auto-sync/i });
    if (await resumeAutoSync.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await resumeAutoSync.click();
      await this.confirmIngestionSetupIfPresent();
      await this.waitForIncrementalSyncToStart(60_000);
    }
  }

  private async waitForIncrementalSyncToStart(timeoutMs: number): Promise<boolean> {
    const panel = this.statusTabPanel();
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      if (await panel.getByRole('button', { name: /^Stop sync$/i }).isVisible().catch(() => false)) {
        return true;
      }

      if (await panel.getByText(/^Sync in-progress$/i).isVisible().catch(() => false)) {
        return true;
      }

      if (await this.syncProgressStatus().isVisible().catch(() => false)) {
        return true;
      }

      await this.page.waitForTimeout(1_000);
    }

    return false;
  }

  async performStatusIncrementalSyncFlow(syncConfig: GoogleDriveSyncConfig): Promise<void> {
    await this.openStatusTab(syncConfig);
    await this.openSyncDropdownMenu(syncConfig);
    await this.selectIncrementalSync(syncConfig);
    await this.clickSyncAfterIncrementalSelection(syncConfig);
  }

  async expectIncrementalSyncStarted(): Promise<void> {
    await this.expectFullSyncStarted();
  }

  async waitForNoActiveSync(timeoutMs = 600_000): Promise<void> {
    if (!(await this.isSyncActivelyRunning())) {
      return;
    }

    await expect(async () => {
      await this.openStatusTab();
      expect(await this.isSyncActivelyRunning()).toBeFalsy();
    }).toPass({
      timeout: timeoutMs,
      intervals: [15_000, 30_000, 60_000],
    });
  }

  async waitForIncrementalSyncComplete(
    syncConfig: GoogleDriveSyncConfig,
    timeoutMs = 3_600_000,
    latestTimestampBefore?: string,
  ): Promise<void> {
    await this.openStatusTab(syncConfig);
    const baselineTimestamp =
      latestTimestampBefore ?? (await this.getSyncHistoryEntries(syncConfig))[0]?.timestamp;

    await expect(async () => {
      await this.openStatusTab(syncConfig);

      if (await this.isSyncActivelyRunning()) {
        expect(await this.isSyncActivelyRunning()).toBeFalsy();
        return;
      }

      const entries = await this.getSyncHistoryEntries(syncConfig);
      const latestIncremental = entries.find(
        (entry) =>
          /incremental/i.test(entry.syncType) &&
          /sync complete/i.test(entry.status) &&
          entry.timestamp !== baselineTimestamp,
      );

      if (latestIncremental) {
        expect(latestIncremental).toBeTruthy();
        return;
      }

      const bannerComplete = await this.statusTabPanel()
        .getByText(MESSAGES.syncCompleteBanner)
        .isVisible()
        .catch(() => false);
      const historyComplete = await this.statusTabPanel()
        .getByText(new RegExp(syncConfig.syncCompleteStatus, 'i'))
        .isVisible()
        .catch(() => false);
      const syncInProgress = await this.syncInProgressBanner().isVisible().catch(() => false);

      expect(bannerComplete || historyComplete).toBeTruthy();
      if (bannerComplete) {
        expect(syncInProgress).toBeFalsy();
      }
    }).toPass({
      timeout: timeoutMs,
      intervals: [15_000, 30_000, 60_000],
    });
  }

  getSyncHistoryTimestampEntries(): Locator {
    return this.statusTabPanel().getByText(MESSAGES.syncHistoryTimestamp);
  }

  async getSyncHistoryEntries(syncConfig?: GoogleDriveSyncConfig): Promise<SyncHistoryEntry[]> {
    await this.openStatusTab(syncConfig);

    const timestamps = this.getSyncHistoryTimestampEntries();
    const count = await timestamps.count();
    const entries: SyncHistoryEntry[] = [];
    const entryPattern =
      /([A-Z][a-z]{2} \d{1,2}, \d{4} at \d{1,2}:\d{2} (?:AM|PM))\s+(Sync complete|Sync in progress|Sync in-progress|In Progress|Failed)\s+(Full|Incremental)\s+([\d,]+)/i;

    for (let i = 0; i < count; i += 1) {
      const timestampLocator = timestamps.nth(i);
      const rowText = await timestampLocator
        .locator('xpath=ancestor::*[contains(., "Sync")][1]')
        .innerText()
        .catch(async () => timestampLocator.locator('..').innerText());

      const match = rowText.match(entryPattern);
      if (!match) {
        continue;
      }

      entries.push({
        timestamp: match[1],
        status: match[2],
        syncType: match[3],
        itemsSynced: Number(match[4].replace(/,/g, '')),
      });
    }

    if (entries.length > 0) {
      return entries;
    }

    const panelText = await this.statusTabPanel().innerText();
    const historySection = panelText.split('Items synced')[1]?.split('Only the last 5 syncs')[0] ?? '';
    const globalPattern =
      /([A-Z][a-z]{2} \d{1,2}, \d{4} at \d{1,2}:\d{2} (?:AM|PM))\s+(Sync complete|Sync in progress|Sync in-progress|In Progress|Failed)\s+(Full|Incremental)\s+([\d,]+)/gi;

    let match: RegExpExecArray | null = globalPattern.exec(historySection);
    while (match) {
      entries.push({
        timestamp: match[1],
        status: match[2],
        syncType: match[3],
        itemsSynced: Number(match[4].replace(/,/g, '')),
      });
      match = globalPattern.exec(historySection);
    }

    return entries;
  }

  async isSyncActivelyRunning(): Promise<boolean> {
    const panel = this.statusTabPanel();

    if (await panel.getByRole('button', { name: /^Stop sync$/i }).isVisible().catch(() => false)) {
      return true;
    }

    if (await this.syncInProgressBanner().isVisible().catch(() => false)) {
      return true;
    }

    if (await panel.getByText(/^Sync in-progress$/i).isVisible().catch(() => false)) {
      return true;
    }

    return this.syncProgressStatus().isVisible().catch(() => false);
  }

  async selectFullSync(syncConfig: GoogleDriveSyncConfig): Promise<void> {
    const fullSync = this.page
      .getByText(/start full sync/i)
      .or(this.getFullSyncOption(syncConfig))
      .first();

    if (!(await fullSync.isVisible({ timeout: 5_000 }).catch(() => false))) {
      if (await this.isSyncNotInitiated(syncConfig)) {
        return;
      }
    }

    await fullSync.waitFor({ state: 'visible', timeout: 30_000 });
    await fullSync.click();
    await this.page
      .getByText(/start incremental sync|start full sync/i)
      .first()
      .waitFor({ state: 'hidden', timeout: 10_000 })
      .catch(async () => {
        await this.page.keyboard.press('Escape');
      });
  }

  async clickSyncAfterFullSyncSelection(syncConfig: GoogleDriveSyncConfig): Promise<void> {
    const panel = this.statusTabPanel();

    if (await this.waitForSyncToStart(30_000)) {
      return;
    }

    const startButton = panel.getByRole('button', {
      name: new RegExp(`^${syncConfig.startSyncButton}$`, 'i'),
    });
    if (await startButton.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await startButton.scrollIntoViewIfNeeded();
      await expect(startButton).toBeEnabled({ timeout: 15_000 });
      await startButton.click();
      await this.confirmIngestionSetupIfPresent();
      await this.page
        .getByRole('dialog')
        .getByRole('button', { name: /^Confirm$/i })
        .click({ timeout: 15_000 })
        .catch(() => undefined);
      await this.page
        .getByRole('button', { name: /^Confirm$/i })
        .click({ timeout: 5_000 })
        .catch(() => undefined);
      await this.waitForSyncToStart(60_000);
      return;
    }

    const syncButton = panel.getByRole('button', { name: new RegExp(`^${syncConfig.syncMenuButton}$`, 'i') });
    if (await syncButton.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await syncButton.click();
      await this.confirmIngestionSetupIfPresent();
      await this.waitForSyncToStart(60_000);
      return;
    }

    const resumeButton = panel.getByRole('button', {
      name: new RegExp(`^${syncConfig.resumeSyncButton}$`, 'i'),
    });
    if (await resumeButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await resumeButton.click();
      await this.confirmIngestionSetupIfPresent();
      await this.waitForSyncToStart(60_000);
    }
  }

  private async waitForSyncToStart(timeoutMs: number): Promise<boolean> {
    return this.waitForIncrementalSyncToStart(timeoutMs);
  }

  async performStatusFullSyncFlowFromDropdown(syncConfig: GoogleDriveSyncConfig): Promise<void> {
    await this.openStatusTab(syncConfig);
    await this.openSyncDropdownMenu(syncConfig);
    await this.selectFullSync(syncConfig);
    await this.clickSyncAfterFullSyncSelection(syncConfig);
  }

  async clickStartSync(syncConfig: GoogleDriveSyncConfig): Promise<void> {
    const panel = this.statusTabPanel();
    const resumeButton = panel.getByRole('button', {
      name: new RegExp(`^${syncConfig.resumeSyncButton}$`, 'i'),
    });

    if (await resumeButton.isVisible().catch(() => false)) {
      await resumeButton.click();
      await this.confirmIngestionSetupIfPresent();
      return;
    }

    const startButton = panel.getByRole('button', {
      name: new RegExp(`^${syncConfig.startSyncButton}$`, 'i'),
    });
    await startButton.waitFor({ state: 'visible', timeout: 30_000 });
    await startButton.scrollIntoViewIfNeeded();
    await expect(startButton).toBeEnabled({ timeout: 15_000 });
    await startButton.click();
    await this.confirmIngestionSetupIfPresent();
    await this.page
      .getByRole('button', { name: new RegExp(`^${ENTERPRISE_SEARCH.confirmIngestionButton}$`, 'i') })
      .click({ timeout: 10_000 })
      .catch(() => undefined);
    await this.page
      .getByText(MESSAGES.syncInitiatedSuccess)
      .waitFor({ state: 'visible', timeout: 30_000 })
      .catch(() => undefined);
  }

  async performStatusFullSyncFlow(syncConfig: GoogleDriveSyncConfig): Promise<void> {
    await this.openStatusTab(syncConfig);

    if (!(await this.isSyncNotInitiated(syncConfig))) {
      const resumeButton = this.statusTabPanel().getByRole('button', {
        name: new RegExp(`^${syncConfig.resumeSyncButton}$`, 'i'),
      });
      if (await resumeButton.isVisible().catch(() => false)) {
        await resumeButton.click();
        await this.confirmIngestionSetupIfPresent();
      }
      return;
    }

    const panel = this.statusTabPanel();
    const openMenuButton = panel
      .getByRole('group')
      .filter({ has: panel.getByRole('button', { name: /^Stop sync$/i }) })
      .getByRole('button', { name: /^Open menu$/i })
      .or(this.getSyncDropdownButton(syncConfig))
      .first();

    if (await openMenuButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await openMenuButton.scrollIntoViewIfNeeded();
      await openMenuButton.click();
      const fullSyncOption = this.page
        .getByRole('menuitem', { name: /start full sync|full sync/i })
        .or(this.page.getByRole('menuitemradio', { name: /start full sync|full sync/i }))
        .first();
      if (await fullSyncOption.isVisible({ timeout: 10_000 }).catch(() => false)) {
        await fullSyncOption.click();
      } else {
        await this.page.keyboard.press('Escape');
      }
    }

    const startButton = panel.getByRole('button', {
      name: new RegExp(`^${syncConfig.startSyncButton}$`, 'i'),
    });
    await startButton.waitFor({ state: 'visible', timeout: 30_000 });
    await startButton.scrollIntoViewIfNeeded();
    await expect(startButton).toBeEnabled({ timeout: 15_000 });
    await startButton.click();
    await this.confirmIngestionSetupIfPresent();
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: /^Confirm$/i })
      .click({ timeout: 15_000 })
      .catch(() => undefined);
    await this.page
      .getByRole('button', { name: /^Confirm$/i })
      .click({ timeout: 5_000 })
      .catch(() => undefined);
  }

  async expectFullSyncStarted(): Promise<void> {
    await expect(async () => {
      const notInitiated = await this.statusTabPanel()
        .getByText(MESSAGES.syncNotInitiated)
        .isVisible()
        .catch(() => false);
      const progressVisible = await this.syncProgressStatus().isVisible().catch(() => false);
      expect(notInitiated && !progressVisible).toBeFalsy();
    }).toPass({
      timeout: 120_000,
      intervals: [2_000, 5_000, 10_000],
    });
  }

  async waitForFullSyncComplete(
    syncConfig: GoogleDriveSyncConfig,
    timeoutMs = 3_600_000,
  ): Promise<void> {
    await this.openStatusTab(syncConfig);
    const historyBefore = await this.getSyncHistoryEntries(syncConfig);
    const latestTimestampBefore = historyBefore[0]?.timestamp;

    await expect(async () => {
      if (await this.isSyncActivelyRunning()) {
        expect(await this.isSyncActivelyRunning()).toBeFalsy();
        return;
      }

      const entries = await this.getSyncHistoryEntries(syncConfig);
      const latestFull = entries.find(
        (entry) =>
          /full/i.test(entry.syncType) &&
          /sync complete/i.test(entry.status) &&
          entry.timestamp !== latestTimestampBefore,
      );

      if (latestFull) {
        expect(latestFull).toBeTruthy();
        return;
      }

      const bannerComplete = await this.statusTabPanel()
        .getByText(MESSAGES.syncCompleteBanner)
        .isVisible()
        .catch(() => false);
      const historyComplete = await this.statusTabPanel()
        .getByText(new RegExp(syncConfig.syncCompleteStatus, 'i'))
        .isVisible()
        .catch(() => false);
      const syncInProgress = await this.syncInProgressBanner().isVisible().catch(() => false);

      expect(bannerComplete || historyComplete).toBeTruthy();
      if (bannerComplete) {
        expect(syncInProgress).toBeFalsy();
      }
    }).toPass({
      timeout: timeoutMs,
      intervals: [15_000, 30_000, 60_000],
    });
  }

  getStartSyncButton(syncConfig: GoogleDriveSyncConfig): Locator {
    return this.statusTabPanel()
      .getByRole('button', { name: new RegExp(`^${syncConfig.startSyncButton}$`, 'i') })
      .or(this.statusTabPanel().getByRole('button', { name: new RegExp(`^${syncConfig.resumeSyncButton}$`, 'i') }))
      .first();
  }

  getSyncDropdownTrigger(syncConfig: GoogleDriveSyncConfig): Locator {
    return this.getSyncDropdownButton(syncConfig);
  }

  getFullSyncOption(syncConfig: GoogleDriveSyncConfig): Locator {
    const fullSyncPattern = new RegExp(`${syncConfig.syncType}|${ENTERPRISE_SEARCH.fullSyncButton}`, 'i');
    const menu = this.getSyncDropdownMenu(syncConfig);
    return menu
      .getByRole('menuitem', { name: fullSyncPattern })
      .or(menu.getByRole('menuitemradio', { name: fullSyncPattern }))
      .or(menu.getByRole('button', { name: fullSyncPattern }))
      .or(menu.getByRole('option', { name: fullSyncPattern }))
      .or(menu.getByText(fullSyncPattern))
      .or(this.page.getByRole('menuitem', { name: fullSyncPattern }))
      .first();
  }

  getIncrementalSyncOption(syncConfig: GoogleDriveSyncConfig): Locator {
    const incrementalSyncPattern = new RegExp(
      `${syncConfig.incrementalSyncType}|${ENTERPRISE_SEARCH.incrementalSyncButton}|incremental sync`,
      'i',
    );
    return this.page
      .getByText(/start incremental sync/i)
      .or(this.page.getByRole('menuitem', { name: incrementalSyncPattern }))
      .or(this.page.getByRole('menuitemradio', { name: incrementalSyncPattern }))
      .or(this.page.getByRole('radio', { name: incrementalSyncPattern }))
      .or(this.page.getByRole('button', { name: incrementalSyncPattern }))
      .first();
  }

  getSyncCompleteStatus(syncConfig: GoogleDriveSyncConfig): Locator {
    return this.statusTabPanel()
      .getByText(MESSAGES.syncCompleteBanner)
      .or(this.statusTabPanel().getByText(new RegExp(syncConfig.syncCompleteStatus, 'i')))
      .first();
  }

  getSyncProgressStatus(): Locator {
    return this.syncProgressStatus();
  }

  getGoogleDriveConnectorOption(): Locator {
    return this.googleDriveConnectorOption();
  }

  getConnectorNameInput(): Locator {
    return this.connectorNameInput();
  }

  getAdminEmailInput(): Locator {
    return this.adminEmailInput();
  }

  getServiceAccountJsonInput(): Locator {
    return this.serviceAccountJsonInput();
  }

  getSaveConfigurationButton(): Locator {
    return this.saveConfigurationButton();
  }

  getSuccessMessage(): Locator {
    return this.successMessage();
  }

  private dataFiltersTabPanel(): Locator {
    return this.page.getByRole('tabpanel', { name: new RegExp(`^${ENTERPRISE_SEARCH.dataFiltersTab}$`, 'i') });
  }

  private audienceAccessSettingsSwitch(): Locator {
    return this.dataFiltersTabPanel().getByRole('switch').last();
  }

  private modifiedBeforeFilterSection(): Locator {
    return this.dataFiltersTabPanel()
      .locator('div')
      .filter({ hasText: MESSAGES.twoYearIngestionFilter })
      .filter({ has: this.page.getByRole('button', { name: /^Date$/i }) })
      .first();
  }

  private modifiedBeforeDateButton(): Locator {
    return this.dataFiltersTabPanel().getByRole('button', { name: /^Date$/i });
  }

  private modifiedBeforeDatePickerPanel(): Locator {
    return this.page
      .locator('div')
      .filter({ has: this.page.getByRole('grid') })
      .filter({ has: this.page.locator('select') })
      .last();
  }

  private modifiedBeforeFilterSwitch(): Locator {
    return this.modifiedBeforeFilterSection()
      .getByRole('switch')
      .or(this.dataFiltersTabPanel().getByRole('switch').first())
      .first();
  }

  private modifiedBeforeMonthDropdown(): Locator {
    return this.modifiedBeforeDatePickerPanel().locator('select').first();
  }

  private modifiedBeforeYearDropdown(): Locator {
    return this.modifiedBeforeDatePickerPanel().locator('select').last();
  }

  private fileSizesAndTypesSwitch(): Locator {
    return this.dataFiltersTabPanel().getByRole('switch').nth(2);
  }

  private excludeFilesLargerThanSizeDropdown(): Locator {
    return this.dataFiltersTabPanel().getByRole('combobox', {
      name: new RegExp(DATA_FILTERS.excludeFilesLargerThan, 'i'),
    });
  }

  private excludedFileTypesSection(): Locator {
    return this.getExcludeFileTypesLabel().locator('..').locator('..');
  }

  private excludedFileTypesControl(): Locator {
    return this.excludedFileTypesSection()
      .locator('div')
      .filter({ has: this.page.getByRole('combobox') })
      .last();
  }

  private excludedFileTypesCombobox(): Locator {
    return this.excludedFileTypesSection().getByRole('combobox').last();
  }

  private excludedFileTypesInput(): Locator {
    return this.dataFiltersTabPanel().locator('input[id*="react-select"]').last();
  }

  private excludedFileTypeChip(fileType: string): Locator {
    const normalizedType = fileType.replace(/^\./, '');
    return this.dataFiltersTabPanel()
      .getByRole('button', { name: new RegExp(`Remove\\s+\\.?${normalizedType}`, 'i') })
      .or(
        this.dataFiltersTabPanel()
          .locator('[class*="multi-value"]')
          .filter({ hasText: new RegExp(`^\\.?${normalizedType}$`, 'i') }),
      )
      .first();
  }

  private audienceFilterIncludeRadio(): Locator {
    return this.page.getByRole('radio', { name: new RegExp(`^${AUDIENCE_FILTER.include}$`, 'i') });
  }

  private audienceFilterExcludeRadio(): Locator {
    return this.page.getByRole('radio', { name: new RegExp(`^${AUDIENCE_FILTER.exclude}$`, 'i') });
  }

  private audiencePickerTriggerButton(): Locator {
    const panel = this.dataFiltersTabPanel();
    return panel
      .getByRole('button', { name: new RegExp(`^${AUDIENCE_FILTER.browse}$`, 'i') })
      .or(panel.getByRole('button', { name: /Add audience/i }))
      .or(panel.getByRole('button', { name: /^\+$/i }))
      .or(
        panel
          .locator('div')
          .filter({ has: panel.getByText(/^Audiences$/i) })
          .getByRole('button')
          .last(),
      )
      .first();
  }

  private browseAudiencesButton(): Locator {
    return this.audiencePickerTriggerButton();
  }

  private addAudienceButton(): Locator {
    return this.dataFiltersTabPanel().getByRole('button', { name: /Add audience/i });
  }

  private audiencePickerDialog(): Locator {
    return this.page.getByRole('dialog').filter({ hasText: /Audiences/i }).last();
  }

  getAudienceAccessSettingsLabel(): Locator {
    return this.dataFiltersTabPanel().getByRole('heading', {
      name: new RegExp(AUDIENCE_FILTER.audienceAccessSettings, 'i'),
    });
  }

  getAudienceBrowseButton(): Locator {
    return this.browseAudiencesButton();
  }

  getSaveAndSyncButton(): Locator {
    return this.saveAndSyncButton();
  }

  getDataFiltersTab(): Locator {
    return this.page.getByRole('tab', {
      name: new RegExp(`^${ENTERPRISE_SEARCH.dataFiltersTab}$`, 'i'),
    });
  }

  getDataFiltersTabPanel(): Locator {
    return this.dataFiltersTabPanel();
  }

  async openDataFiltersTab(): Promise<void> {
    const dataFiltersTab = this.getDataFiltersTab();
    await dataFiltersTab.waitFor({ state: 'visible', timeout: 30_000 });
    await dataFiltersTab.scrollIntoViewIfNeeded();

    if ((await dataFiltersTab.getAttribute('aria-selected')) !== 'true') {
      await dataFiltersTab.click();
    }

    await expect(dataFiltersTab).toHaveAttribute('aria-selected', 'true', { timeout: 30_000 });
    await this.dataFiltersTabPanel().waitFor({ state: 'visible', timeout: 30_000 });
    await expect(
      this.dataFiltersTabPanel().getByRole('heading', {
        name: /Define which content you want to ingest from Google Drive/i,
      }),
    ).toBeVisible({ timeout: 30_000 });
  }

  private ingestionOptionsSection(): Locator {
    return this.dataFiltersTabPanel()
      .getByRole('heading', {
        name: /Define which content you want to ingest from Google Drive/i,
      })
      .locator('..');
  }

  private includeSpecificFoldersRadio(): Locator {
    return this.dataFiltersTabPanel().getByRole('radio', {
      name: new RegExp(DATA_FILTERS.includeSpecificFolders, 'i'),
    });
  }

  private firstIncludeFolderUrlInput(): Locator {
    return this.ingestionOptionsSection()
      .getByRole('textbox')
      .first()
      .or(this.ingestionOptionsSection().locator('input[type="text"], input:not([type]), textarea').first());
  }

  getIncludeSpecificFoldersRadio(): Locator {
    return this.includeSpecificFoldersRadio();
  }

  async selectIncludeSpecificFolders(): Promise<void> {
    const radio = this.includeSpecificFoldersRadio();
    await radio.scrollIntoViewIfNeeded();
    await expect(radio).toBeVisible({ timeout: 30_000 });

    if (!(await radio.isChecked())) {
      await radio.click({ force: true });
    }

    await expect(radio).toBeChecked({ timeout: 10_000 });
    await expect(this.firstIncludeFolderUrlInput()).toBeVisible({ timeout: 15_000 });
  }

  async clickFirstIncludeFolderUrlCell(): Promise<void> {
    const folderInput = this.firstIncludeFolderUrlInput();
    await folderInput.scrollIntoViewIfNeeded();
    await folderInput.click({ force: true });
  }

  async fillFirstIncludeFolderUrl(folderUrl: string): Promise<void> {
    const folderInput = this.firstIncludeFolderUrlInput();
    await folderInput.waitFor({ state: 'visible', timeout: 15_000 });
    await folderInput.fill(folderUrl);
  }

  async expectFirstIncludeFolderUrlConfigured(folderUrl: string): Promise<void> {
    await expect(this.firstIncludeFolderUrlInput()).toHaveValue(folderUrl, { timeout: 15_000 });
  }

  private excludeSpecificFoldersRadio(): Locator {
    return this.dataFiltersTabPanel().getByRole('radio', {
      name: new RegExp(DATA_FILTERS.excludeSpecificFolders, 'i'),
    });
  }

  private firstExcludeFolderUrlInput(): Locator {
    return this.ingestionOptionsSection()
      .getByRole('textbox')
      .first()
      .or(this.ingestionOptionsSection().locator('input[type="text"], input:not([type]), textarea').first());
  }

  getExcludeSpecificFoldersRadio(): Locator {
    return this.excludeSpecificFoldersRadio();
  }

  async selectExcludeSpecificFolders(): Promise<void> {
    const radio = this.excludeSpecificFoldersRadio();
    await radio.scrollIntoViewIfNeeded();
    await expect(radio).toBeVisible({ timeout: 30_000 });

    if (!(await radio.isChecked())) {
      await radio.click({ force: true });
    }

    await expect(radio).toBeChecked({ timeout: 10_000 });
    await expect(this.firstExcludeFolderUrlInput()).toBeVisible({ timeout: 15_000 });
  }

  async clickFirstExcludeFolderUrlCell(): Promise<void> {
    const folderInput = this.firstExcludeFolderUrlInput();
    await folderInput.scrollIntoViewIfNeeded();
    await folderInput.click({ force: true });
  }

  async fillFirstExcludeFolderUrl(folderUrl: string): Promise<void> {
    const folderInput = this.firstExcludeFolderUrlInput();
    await folderInput.waitFor({ state: 'visible', timeout: 15_000 });
    await folderInput.fill(folderUrl);
  }

  async expectFirstExcludeFolderUrlConfigured(folderUrl: string): Promise<void> {
    await expect(this.firstExcludeFolderUrlInput()).toHaveValue(folderUrl, { timeout: 15_000 });
  }

  async enableAudienceAccessSettings(): Promise<void> {
    await this.getAudienceAccessSettingsLabel().scrollIntoViewIfNeeded();

    const audienceSwitch = this.audienceAccessSettingsSwitch();
    await audienceSwitch.waitFor({ state: 'visible', timeout: 30_000 });

    if ((await audienceSwitch.getAttribute('aria-checked')) !== 'true') {
      await audienceSwitch.scrollIntoViewIfNeeded();
      await audienceSwitch.click({ force: true });
    }

    await expect(
      this.page
        .getByText(/Include or Exclude audiences/i)
        .or(this.audienceFilterIncludeRadio())
        .or(this.browseAudiencesButton())
        .first(),
    ).toBeVisible({ timeout: 30_000 });
  }

  async disableAudienceAccessSettings(): Promise<void> {
    await this.getAudienceAccessSettingsLabel().scrollIntoViewIfNeeded();

    const audienceSwitch = this.audienceAccessSettingsSwitch();
    await audienceSwitch.waitFor({ state: 'visible', timeout: 30_000 });

    if ((await audienceSwitch.getAttribute('aria-checked')) === 'true') {
      await audienceSwitch.scrollIntoViewIfNeeded();
      await audienceSwitch.click({ force: true });
    }

    await expect(audienceSwitch).toHaveAttribute('aria-checked', 'false', { timeout: 10_000 });
    await expect(this.audienceFilterIncludeRadio()).toBeHidden({ timeout: 15_000 });
  }

  async selectAudienceFilterMode(mode: GoogleDrive2AudienceFilterConfig['filterMode']): Promise<void> {
    const radio =
      mode === 'exclude' ? this.audienceFilterExcludeRadio() : this.audienceFilterIncludeRadio();
    await radio.waitFor({ state: 'visible', timeout: 30_000 });

    if (!(await radio.isChecked())) {
      await radio.click({ force: true });
    }

    await expect(radio).toBeChecked({ timeout: 10_000 });
  }

  async isSelectedAudienceVisible(audienceName: string): Promise<boolean> {
    return this.dataFiltersTabPanel()
      .getByText(new RegExp(`^${audienceName}$`, 'i'))
      .first()
      .isVisible()
      .catch(() => false);
  }

  async openAudienceBrowseDialog(): Promise<void> {
    const hierarchyResponse = this.page
      .waitForResponse(
        (response) =>
          response.url().includes('/audiences/hierarchy') &&
          response.request().method() === 'POST' &&
          response.ok(),
        { timeout: 60_000 },
      )
      .catch(() => undefined);

    const browseButton = this.audiencePickerTriggerButton();
    const addAudienceButton = this.addAudienceButton();

    if (await browseButton.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await browseButton.click();
    } else if (await addAudienceButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await addAudienceButton.click();
    } else {
      throw new Error('Audience picker trigger button was not found after selecting Include/Exclude.');
    }

    await this.audiencePickerDialog().waitFor({ state: 'visible', timeout: 30_000 });
    await hierarchyResponse;
    await this.waitForAudiencePickerReady();
  }

  private audienceLabelInPicker(name: string): Locator {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.audiencePickerDialog()
      .locator('p')
      .filter({ hasText: new RegExp(`^\\s*${escapedName}\\s*$`, 'i') });
  }

  private audienceFolderLabelInPicker(folderName: string): Locator {
    return this.audienceLabelInPicker(folderName).first();
  }

  private audienceItemInPicker(name: string): Locator {
    return this.audiencePickerDialog()
      .getByLabel(name, { exact: true })
      .filter({ has: this.page.getByRole('checkbox') })
      .last();
  }

  private showMoreButtonInAudiencePicker(): Locator {
    const dialog = this.audiencePickerDialog();
    return dialog
      .getByRole('button', { name: new RegExp(`^${AUDIENCE_FILTER.showMore}$`, 'i') })
      .or(dialog.getByText(new RegExp(`^${AUDIENCE_FILTER.showMore}$`, 'i')))
      .last();
  }

  private async waitForAudiencePickerReady(): Promise<void> {
    const dialog = this.audiencePickerDialog();
    await expect
      .poll(
        async () => {
          const folderCount = await dialog.locator('p').count();
          const showMoreVisible = await this.showMoreButtonInAudiencePicker()
            .isVisible()
            .catch(() => false);
          return folderCount > 0 || showMoreVisible;
        },
        { timeout: 60_000 },
      )
      .toBeTruthy();
    await expect(this.showMoreButtonInAudiencePicker()).toBeVisible({ timeout: 60_000 });
  }

  async clearAudiencePickerSearchIfNeeded(): Promise<void> {
    const dialog = this.audiencePickerDialog();
    const search = dialog.getByRole('textbox', { name: /Search/i });
    if (!(await search.isVisible({ timeout: 2_000 }).catch(() => false))) {
      return;
    }

    const value = await search.inputValue().catch(() => '');
    if (!value.trim()) {
      return;
    }

    await search.fill('');
    await dialog.getByRole('button', { name: /^Search$/i }).click().catch(async () => {
      await search.press('Enter');
    });
    await this.waitForAudiencePickerReady();
  }

  async revealAudienceFolderViaShowMore(folderName: string): Promise<void> {
    await this.clearAudiencePickerSearchIfNeeded();
    await this.waitForAudiencePickerReady();

    const folderLocator = this.audienceFolderLabelInPicker(folderName);
    const dialog = this.audiencePickerDialog();

    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (await folderLocator.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await folderLocator.scrollIntoViewIfNeeded();
        return;
      }

      const showMore = this.showMoreButtonInAudiencePicker();
      if (!(await showMore.isVisible({ timeout: 5_000 }).catch(() => false))) {
        break;
      }

      const folderCountBefore = await dialog.locator('p').count();
      await showMore.scrollIntoViewIfNeeded();

      const hierarchyResponse = this.page
        .waitForResponse(
          (response) =>
            response.url().includes('/audiences/hierarchy') &&
            response.request().method() === 'POST' &&
            response.ok(),
          { timeout: 30_000 },
        )
        .catch(() => undefined);

      await showMore.click({ force: true });
      await hierarchyResponse;

      await expect
        .poll(async () => {
          if (await folderLocator.isVisible().catch(() => false)) {
            return true;
          }

          const folderCountAfter = await dialog.locator('p').count();
          return folderCountAfter > folderCountBefore;
        }, { timeout: 15_000 })
        .toBeTruthy();
    }

    await expect(folderLocator).toBeVisible({ timeout: 30_000 });
  }

  async expandAudienceFolderInPicker(folderName: string): Promise<void> {
    const folderItem = this.audienceItemInPicker(folderName);
    await folderItem.waitFor({ state: 'visible', timeout: 30_000 });
    await folderItem.scrollIntoViewIfNeeded();
    await folderItem.getByRole('button').first().click();
  }

  private audienceDoneButtonInPicker(): Locator {
    return this.audiencePickerDialog()
      .getByRole('button', { name: new RegExp(`^${AUDIENCE_FILTER.done}$`, 'i') })
      .last();
  }

  async selectAudienceCheckboxInPicker(audienceName: string): Promise<void> {
    const audienceItem = this.audienceItemInPicker(audienceName);
    await audienceItem.waitFor({ state: 'visible', timeout: 30_000 });
    await audienceItem.scrollIntoViewIfNeeded();

    const checkbox = audienceItem.getByRole('checkbox').first();
    await checkbox.waitFor({ state: 'visible', timeout: 10_000 });

    if (!(await checkbox.isChecked())) {
      const checkboxWrapper = audienceItem.locator('[class*="Checkbox"]').first();
      if (await checkboxWrapper.isVisible().catch(() => false)) {
        await checkboxWrapper.click();
      } else {
        await this.audienceLabelInPicker(audienceName).last().click();
      }

      if (!(await checkbox.isChecked())) {
        await checkbox.check({ force: true });
      }
    }

    await expect(checkbox).toBeChecked({ timeout: 10_000 });

    const doneButton = this.audienceDoneButtonInPicker();
    if (await doneButton.isEnabled({ timeout: 5_000 }).catch(() => false)) {
      return;
    }

    if (await checkbox.isChecked()) {
      return;
    }

    await expect(doneButton).toBeEnabled({ timeout: 15_000 });
  }

  async confirmAudienceBrowseSelection(): Promise<void> {
    const dialog = this.audiencePickerDialog();
    const doneButton = this.audienceDoneButtonInPicker();

    await expect(doneButton).toBeVisible({ timeout: 30_000 });

    if (await doneButton.isEnabled({ timeout: 5_000 }).catch(() => false)) {
      await doneButton.scrollIntoViewIfNeeded();
      await doneButton.click();
    } else {
      await this.page.keyboard.press('Escape');
    }

    await expect(dialog).toBeHidden({ timeout: 30_000 });
  }

  async browseAndSelectAudienceViaTree(config: GoogleDrive2AudienceFilterConfig): Promise<void> {
    if (await this.isSelectedAudienceVisible(config.audienceName)) {
      return;
    }

    await this.openAudienceBrowseDialog();
    await this.revealAudienceFolderViaShowMore(config.parentAudienceName);
    await this.expandAudienceFolderInPicker(config.parentAudienceName);
    await this.selectAudienceCheckboxInPicker(config.audienceName);
    await this.confirmAudienceBrowseSelection();
  }

  async saveAudienceFiltersAndSync(): Promise<void> {
    const saveButton = this.saveAndSyncButton();
    await saveButton.scrollIntoViewIfNeeded();

    if (!(await saveButton.isEnabled({ timeout: 5_000 }).catch(() => false))) {
      const syncCompleteVisible = await this.page.getByText(/Sync complete/i).isVisible().catch(() => false);
      if (syncCompleteVisible) {
        return;
      }
    }

    await expect(saveButton).toBeEnabled({ timeout: 120_000 });
    await saveButton.click();
    await this.confirmIngestionSetupIfPresent();
  }

  async expectSelectedAudienceVisible(audienceName: string): Promise<void> {
    await expect(this.dataFiltersTabPanel().getByText(new RegExp(`^${audienceName}$`, 'i')).first()).toBeVisible({
      timeout: 30_000,
    });
  }

  async expectSaveAndSyncEnabled(): Promise<void> {
    await expect(this.saveAndSyncButton()).toBeEnabled({ timeout: 120_000 });
  }

  getModifiedBeforeFilterLabel(): Locator {
    return this.dataFiltersTabPanel().getByText(MESSAGES.twoYearIngestionFilter);
  }

  async enableModifiedBeforeFilter(): Promise<void> {
    const label = this.getModifiedBeforeFilterLabel();
    await label.scrollIntoViewIfNeeded();
    await expect(label).toBeVisible({ timeout: 30_000 });

    const filterSwitch = this.modifiedBeforeFilterSwitch();
    await filterSwitch.waitFor({ state: 'visible', timeout: 30_000 });

    if ((await filterSwitch.getAttribute('aria-checked')) !== 'true') {
      await filterSwitch.scrollIntoViewIfNeeded();
      await filterSwitch.click({ force: true });
    }

    await expect(filterSwitch).toHaveAttribute('aria-checked', 'true', { timeout: 10_000 });
  }

  async openModifiedBeforeDatePicker(): Promise<void> {
    await this.ensureModifiedBeforeDatePickerOpen();
  }

  private async ensureModifiedBeforeDatePickerOpen(): Promise<void> {
    if (await this.modifiedBeforeDatePickerPanel().isVisible().catch(() => false)) {
      return;
    }

    const dateTrigger = this.modifiedBeforeDateButton();
    await expect(dateTrigger).toBeVisible({ timeout: 15_000 });
    await dateTrigger.scrollIntoViewIfNeeded();
    await dateTrigger.click();
    await expect(this.modifiedBeforeDatePickerPanel()).toBeVisible({ timeout: 15_000 });
  }

  async selectModifiedBeforeMonth(month: string): Promise<void> {
    const monthSelect = this.modifiedBeforeMonthDropdown();
    await monthSelect.waitFor({ state: 'attached', timeout: 15_000 });

    const monthAbbreviation = month.slice(0, 3);
    try {
      await monthSelect.selectOption({ label: month });
    } catch {
      await monthSelect.selectOption({ label: monthAbbreviation });
    }
  }

  async selectModifiedBeforeDay(day: number): Promise<void> {
    const dayCell = this.modifiedBeforeDatePickerPanel()
      .getByRole('gridcell', { name: String(day) })
      .or(this.modifiedBeforeDatePickerPanel().getByRole('button', { name: String(day) }));

    await dayCell.first().waitFor({ state: 'visible', timeout: 15_000 });
    await dayCell.first().click();
  }

  async selectModifiedBeforeYear(year: number, confirmDay?: number): Promise<void> {
    await this.ensureModifiedBeforeDatePickerOpen();

    const yearSelect = this.modifiedBeforeYearDropdown();
    await yearSelect.waitFor({ state: 'attached', timeout: 15_000 });
    await yearSelect.selectOption(String(year));

    if (confirmDay !== undefined) {
      await this.selectModifiedBeforeDay(confirmDay);
    }
  }

  async setModifiedBeforeDateUsingDropdowns(options: {
    day: number;
    month: string;
    year: number;
  }): Promise<void> {
    await this.openModifiedBeforeDatePicker();
    await this.selectModifiedBeforeMonth(options.month);
    await this.selectModifiedBeforeDay(options.day);
    await this.selectModifiedBeforeYear(options.year);
  }

  async expectModifiedBeforeDateConfigured(options: {
    day: number;
    month: string;
    year: number;
  }): Promise<void> {
    const monthPattern = options.month.slice(0, 3);
    const datePattern = new RegExp(`0?${options.day}\\s+${monthPattern},?\\s+${options.year}`, 'i');

    await expect(this.modifiedBeforeDateButton()).toContainText(datePattern, { timeout: 15_000 });
  }

  getFileSizesAndTypesFilterLabel(): Locator {
    return this.dataFiltersTabPanel().getByText(new RegExp(DATA_FILTERS.fileSizesAndTypes, 'i'));
  }

  async enableFileSizesAndTypesFilter(): Promise<void> {
    const label = this.getFileSizesAndTypesFilterLabel();
    await label.scrollIntoViewIfNeeded();
    await expect(label).toBeVisible({ timeout: 30_000 });

    const filterSwitch = this.fileSizesAndTypesSwitch();
    await filterSwitch.waitFor({ state: 'visible', timeout: 30_000 });

    if ((await filterSwitch.getAttribute('aria-checked')) !== 'true') {
      await filterSwitch.scrollIntoViewIfNeeded();
      await filterSwitch.click({ force: true });
    }

    await expect(filterSwitch).toHaveAttribute('aria-checked', 'true', { timeout: 10_000 });
  }

  async disableFileSizesAndTypesFilter(): Promise<void> {
    const label = this.getFileSizesAndTypesFilterLabel();
    await label.scrollIntoViewIfNeeded();
    await expect(label).toBeVisible({ timeout: 30_000 });

    const filterSwitch = this.fileSizesAndTypesSwitch();
    await filterSwitch.waitFor({ state: 'visible', timeout: 30_000 });

    if ((await filterSwitch.getAttribute('aria-checked')) === 'true') {
      await filterSwitch.scrollIntoViewIfNeeded();
      await filterSwitch.click({ force: true });
    }

    await expect(filterSwitch).toHaveAttribute('aria-checked', 'false', { timeout: 10_000 });
    await expect(this.excludeFilesLargerThanSizeDropdown()).toBeHidden({ timeout: 15_000 });
  }

  getExcludeFilesLargerThanDropdown(): Locator {
    return this.excludeFilesLargerThanSizeDropdown();
  }

  async expectExcludeFilesLargerThanDropdownVisible(): Promise<void> {
    await expect(this.excludeFilesLargerThanSizeDropdown()).toBeVisible({ timeout: 15_000 });
  }

  async selectFileSizeLimit(size: string): Promise<void> {
    const sizeDropdown = this.excludeFilesLargerThanSizeDropdown();
    await sizeDropdown.waitFor({ state: 'attached', timeout: 15_000 });

    const normalizedSize = size.replace(/(\d+)\s*(GB|MB|KB)/i, '$1 $2').trim();

    try {
      await sizeDropdown.selectOption({ label: normalizedSize });
    } catch {
      await sizeDropdown.selectOption({ label: size });
    }
  }

  getExcludeFileTypesLabel(): Locator {
    return this.dataFiltersTabPanel().getByText(new RegExp(DATA_FILTERS.excludeFileTypesLabel, 'i'));
  }

  async expectExcludeFileTypesFieldVisible(): Promise<void> {
    await expect(this.getExcludeFileTypesLabel()).toBeVisible({ timeout: 15_000 });
    await expect(this.excludedFileTypesCombobox()).toBeVisible({ timeout: 15_000 });
  }

  async clickExcludeFileTypesField(): Promise<void> {
    await this.getExcludeFileTypesLabel().scrollIntoViewIfNeeded();
    await expect(this.getExcludeFileTypesLabel()).toBeVisible({ timeout: 15_000 });

    const placeholder = this.excludedFileTypesSection().getByText(
      new RegExp(DATA_FILTERS.addFileTypePlaceholder, 'i'),
    );
    const fileTypesCell = (await placeholder.isVisible().catch(() => false))
      ? placeholder
      : this.excludedFileTypesCombobox();

    await fileTypesCell.scrollIntoViewIfNeeded();
    await fileTypesCell.click({ force: true });
  }

  async expectExcludedFileTypeSelected(fileType: string): Promise<void> {
    const normalizedType = fileType.replace(/^\./, '');
    await expect(this.excludedFileTypeChip(fileType)).toBeVisible({ timeout: 15_000 });
    await expect(
      this.dataFiltersTabPanel().getByRole('button', {
        name: new RegExp(`Remove\\s+\\.?${normalizedType}`, 'i'),
      }),
    ).toBeVisible({ timeout: 15_000 });
  }

  async removeExcludedFileTypeIfSelected(fileType: string): Promise<void> {
    const normalizedType = fileType.replace(/^\./, '');
    const removeButton = this.dataFiltersTabPanel().getByRole('button', {
      name: new RegExp(`Remove\\s+\\.?${normalizedType}`, 'i'),
    });

    if (await removeButton.isVisible().catch(() => false)) {
      await removeButton.click();
      await expect(removeButton).toBeHidden({ timeout: 15_000 });
    }
  }

  async selectExcludedFileType(fileType: string): Promise<void> {
    const normalizedType = fileType.replace(/^\./, '');

    await this.removeExcludedFileTypeIfSelected(fileType);
    await this.clickExcludeFileTypesField();

    const fileTypeInput = this.excludedFileTypesInput();
    await fileTypeInput.waitFor({ state: 'visible', timeout: 15_000 });
    await fileTypeInput.fill(normalizedType);

    const option = this.page
      .getByRole('option', { name: normalizedType })
      .or(
        this.page
          .locator('[id*="react-select"][id*="option"]')
          .filter({ hasText: new RegExp(`^${normalizedType}$`, 'i') }),
      )
      .first();

    if (await option.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await option.click();
    } else {
      await fileTypeInput.press('ArrowDown');
      await fileTypeInput.press('Enter');
    }

    await this.expectExcludedFileTypeSelected(fileType);
  }

  async saveDataFiltersAndSync(): Promise<void> {
    await this.saveAudienceFiltersAndSync();
  }

  async configureAudienceFiltersOnDataFiltersTab(config: GoogleDrive2AudienceFilterConfig): Promise<void> {
    await this.openDataFiltersTab();
    await this.enableAudienceAccessSettings();
    await this.selectAudienceFilterMode(config.filterMode);
    await this.browseAndSelectAudienceViaTree(config);
    await this.expectSelectedAudienceVisible(config.audienceName);
    await this.saveAudienceFiltersAndSync();
  }
}
