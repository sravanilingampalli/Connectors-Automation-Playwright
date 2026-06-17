import { test, expect } from '@es-connectors/fixtures/esConnectorsFixture';
import { getConfluenceConnectorConfig } from '@es-connectors/test-data/confluence';
import { requireAppManagerProject } from '@core/helpers/testHelper';

test.describe('ESConnectors Regression @ESConnectorConfiguration @ESConnectorsConfluence', () => {
  test.beforeEach(() => {
    requireAppManagerProject();
  });

  test('Configure Confluence Connector in Zeus - full regression', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsConfluence,
    esConnectorConfiguration,
  }) => {
    const baseConfig = getConfluenceConnectorConfig();
    const confluenceConfig = {
      ...baseConfig,
      connectorName: `${baseConfig.connectorName}-${Date.now()}`,
    };

    await enterpriseSearchNavigation.openFromManageMenu();
    await esConnectorsAdminPanel.clickAddSource();
    await esConnectorsConfluence.selectConfluenceConnector();
    await esConnectorsConfluence.waitForConfigurationForm();

    await esConnectorConfiguration.enterConnectorName(confluenceConfig.connectorName);
    await esConnectorConfiguration.enterCloudEmail(confluenceConfig.cloudEmail);
    await esConnectorConfiguration.enterApiToken(confluenceConfig.apiToken);
    await esConnectorConfiguration.enterUrlLabel(confluenceConfig.urlLabel);
    await esConnectorConfiguration.clickSaveConfiguration();

    await esConnectorsConfluence.waitForConfigurationSavedSuccess();
    await expect(esConnectorsConfluence.getConfigurationSavedMessage()).toBeVisible();
    await expect(esConnectorsConfluence.getConfigurationSavedMessage()).toContainText(
      confluenceConfig.connectorName,
    );
    await esConnectorsConfluence.expectStep2Displayed();
    await esConnectorsConfluence.clickSaveAndSync();
    await esConnectorsConfluence.confirmIngestionSetup();
    await esConnectorsConfluence.expectConnectorStatusConfigured();
  });
});
