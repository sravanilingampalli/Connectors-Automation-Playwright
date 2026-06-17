import { test, expect } from '@es-connectors/fixtures/esConnectorsFixture';
import { getConfluenceConnectorConfig } from '@es-connectors/test-data/confluence';
import { requireAppManagerProject } from '@core/helpers/testHelper';

test.describe('ESConnectors @ESConnectorsConfluence @ESConnectorsConfluenceSync', () => {
  test.beforeEach(() => {
    requireAppManagerProject();
  });

  test('Start Full Sync', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsConfluence,
  }) => {
    test.setTimeout(300_000);

    const confluenceConfig = getConfluenceConnectorConfig();

    await test.step('Given the Confluence connector is configured successfully', async () => {
      await enterpriseSearchNavigation.navigateToEnterpriseSearch();
      await esConnectorsAdminPanel.waitForPageLoad();
      await esConnectorsConfluence.openConfiguredConnectorFromSources(confluenceConfig.connectorName);
      await esConnectorsConfluence.updateConnectorConfigurationAndSave(confluenceConfig);
    });

    await test.step('When I navigate to Status', async () => {
      await esConnectorsConfluence.openStatusTab();
      await expect(esConnectorsConfluence.getStartSyncButton()).toBeVisible();
    });

    await test.step('And I select Start sync', async () => {
      await esConnectorsConfluence.clickStartSync();
      if (!(await esConnectorsConfluence.isSyncAlreadyInProgress())) {
        await expect(esConnectorsConfluence.getSyncOptionsMenuButton()).toBeVisible();
      }
    });

    await test.step('And I select Full Sync', async () => {
      await esConnectorsConfluence.clickFullSync();
    });

    await test.step('Then the sync process should start', async () => {
      await esConnectorsConfluence.expectFullSyncStarted();
      await expect(esConnectorsConfluence.getSyncProgressStatus()).toBeVisible();
    });
  });
});
