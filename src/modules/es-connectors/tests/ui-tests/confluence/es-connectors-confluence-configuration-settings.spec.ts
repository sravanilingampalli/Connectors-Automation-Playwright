import { test, expect } from '@es-connectors/fixtures/esConnectorsFixture';
import { getConfluenceConnectorConfig } from '@es-connectors/test-data/confluence';
import { requireAppManagerProject } from '@core/helpers/testHelper';

test.describe('ESConnectors @ESConnectorsConfluence @ESConnectorsConfluenceConfiguration', () => {
  test.beforeEach(() => {
    requireAppManagerProject();
  });

  test('Verify Connector Configuration Settings', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsConfluence,
  }) => {
    const confluenceConfig = getConfluenceConnectorConfig();

    await test.step('Given a Confluence connector is configured', async () => {
      await enterpriseSearchNavigation.navigateToEnterpriseSearch();
      await esConnectorsAdminPanel.waitForPageLoad();
      await esConnectorsConfluence.openConfiguredConnectorFromSources(confluenceConfig.connectorName);
    });

    await test.step('When I open the connector configuration page', async () => {
      await esConnectorsConfluence.openConfigurationTab();
      await esConnectorsConfluence.enableShowInResults();
    });

    await test.step('Then the Show In Results option should be visible', async () => {
      await esConnectorsConfluence.expectShowInResultsVisible();
      await expect(esConnectorsConfluence.getShowInResultsLabel()).toBeVisible();
      await expect(esConnectorsConfluence.getShowInResultsToggle()).toBeVisible();
    });

    await test.step('And the Show In Results toggle status should be enabled', async () => {
      await esConnectorsConfluence.expectShowInResultsEnabled();
    });

    await test.step('And the API Token should be masked', async () => {
      await esConnectorsConfluence.expectApiTokenMasked(confluenceConfig.apiToken);
      await expect(esConnectorsConfluence.getApiTokenInput()).toHaveAttribute('type', 'password');
    });
  });
});
