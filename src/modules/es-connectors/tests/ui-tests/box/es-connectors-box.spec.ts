import { test, expect } from '@es-connectors/fixtures/esConnectorsFixture';
import { ENTERPRISE_SEARCH } from '@es-connectors/constants';
import { getBoxConnectorConfig, getBoxInvalidConnectorConfig } from '@es-connectors/test-data/box';
import { requireAppManagerProject } from '@core/helpers/testHelper';
import { verifyKibanaUserIndexIfConfigured } from '@es-connectors/helpers/kibanaHelper';

test.describe.configure({ mode: 'serial' });

test.describe('ESConnectors @ESConnectorsBox', () => {
  test.beforeEach(() => {
    requireAppManagerProject();
  });

  test('Setup – Add Box Connector | Verify Admin can add Box connector', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsBox,
  }) => {
    await enterpriseSearchNavigation.openFromProfileMenu();
    await esConnectorsAdminPanel.expectAddSourceVisible();
    await esConnectorsAdminPanel.clickAddSource();
    await esConnectorsAdminPanel.expectSourceListDisplayed();

    const sourceDialog = esConnectorsAdminPanel.getSourcePickerDialog();
    await expect(
      sourceDialog.getByRole('button', { name: new RegExp(`^${ENTERPRISE_SEARCH.boxConnector}$`, 'i') }),
    ).toBeVisible();

    await esConnectorsBox.selectBoxConnector();
    await esConnectorsBox.expectSetupFormDisplayed();
    await expect(esConnectorsBox.getConnectorNameInput()).toBeVisible();
  });

  test('Setup – Create Connector with Valid Credentials | Verify Admin can create Box connector successfully', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsBox,
  }) => {
    test.setTimeout(180_000);

    const baseConfig = getBoxConnectorConfig();
    const boxConfig = {
      ...baseConfig,
      connectorName: `${baseConfig.connectorName}-${Date.now()}`,
    };

    await enterpriseSearchNavigation.openFromManageMenu();
    await esConnectorsAdminPanel.waitForPageLoad();
    await esConnectorsAdminPanel.clickAddSource();
    await esConnectorsBox.selectBoxConnector();
    await esConnectorsBox.expectSetupFormDisplayed();
    await esConnectorsBox.configureBoxConnector(boxConfig);
    await esConnectorsBox.saveConfiguration();
    await esConnectorsBox.confirmConnectorCreationIfPresent();

    await esConnectorsBox.expectConnectorCreated(boxConfig.connectorName);
    await expect(esConnectorsBox.getSuccessMessage()).toBeVisible();

    await esConnectorsBox.expectStep2Displayed();
    await esConnectorsBox.clickSaveAndSync();
    await esConnectorsBox.expectFullSyncStarted();
    await expect(esConnectorsBox.getFullSyncStatus()).toBeVisible();
  });

  test.skip('Create Connector with Invalid Credential Format | Verify error is shown when creating Box connector with invalid credential format', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsBox,
  }) => {
    const invalidBoxConfig = getBoxInvalidConnectorConfig();

    await enterpriseSearchNavigation.openFromManageMenu();
    await esConnectorsAdminPanel.waitForPageLoad();
    await esConnectorsAdminPanel.clickAddSource();
    await esConnectorsBox.selectBoxConnector();
    await esConnectorsBox.expectSetupFormDisplayed();
    await esConnectorsBox.configureBoxConnector(invalidBoxConfig);
    await esConnectorsBox.expectInvalidCredentialFormatErrors();
    await esConnectorsBox.attemptSaveConfiguration();

    await expect(esConnectorsBox.getInvalidCredentialError().first()).toBeVisible();
    await esConnectorsBox.expectConnectorCreationBlocked();
    await expect(esConnectorsBox.getSaveConfigurationButton()).toBeDisabled();
  });

  test('Setup – Initial Data Ingestion | Verify initial ingestion of documents and users', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsBox,
    request,
  }) => {
    test.setTimeout(600_000);

    const baseConfig = getBoxConnectorConfig();
    const boxConfig = {
      ...baseConfig,
      connectorName: `${baseConfig.connectorName}-Ingest-${Date.now()}`,
    };

    await enterpriseSearchNavigation.openFromManageMenu();
    await esConnectorsAdminPanel.waitForPageLoad();
    await esConnectorsAdminPanel.clickAddSource();
    await esConnectorsBox.createConnectorAndStartInitialSync(boxConfig);

    const syncSource = await esConnectorsBox.waitForInitialSyncOrFallback('Box sanity');
    await expect(esConnectorsBox.getSyncStatus()).toBeVisible({ timeout: 120_000 });

    if (syncSource === 'created') {
      await enterpriseSearchNavigation.navigateToEnterpriseSearch();
      await esConnectorsBox.openConnectorFromSources(boxConfig.connectorName);
      await esConnectorsBox.openStatusTab();
    }

    await esConnectorsBox.expectDocumentsIngested();
    await expect(esConnectorsBox.getSyncStatus()).toBeVisible();
    await esConnectorsBox.expectTwoYearDocumentIngestionFilter();
    await esConnectorsBox.expectUsersIngestionSupported();

    await test.step('Verify user data availability in Kibana when configured', async () => {
      await verifyKibanaUserIndexIfConfigured(request);
    });
  });
});