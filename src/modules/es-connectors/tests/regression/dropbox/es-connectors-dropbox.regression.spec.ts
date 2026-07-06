import { test, expect } from '@es-connectors/fixtures/esConnectorsFixture';
import { getDropboxConnectorConfig } from '@es-connectors/test-data/dropbox';
import { requireAppManagerProject } from '@core/helpers/testHelper';

test.describe('ESConnectors Regression @ESConnectorConfiguration @ESConnectorsDropBox', () => {
  test.beforeEach(() => {
    requireAppManagerProject();
  });

  test('Configure Dropbox Connector Successfully - full regression', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsDropbox,
    esConnectorConfiguration,
  }) => {
    const dropboxConfig = getDropboxConnectorConfig();

    await enterpriseSearchNavigation.openFromManageMenu();
    await esConnectorsAdminPanel.clickAddSource();
    await esConnectorsDropbox.selectDropboxConnector();

    await esConnectorConfiguration.enterConnectorName(dropboxConfig.connectorName);
    await esConnectorConfiguration.enterAppKey(dropboxConfig.appKey);
    await esConnectorConfiguration.enterAppSecret(dropboxConfig.appSecret);
    await esConnectorConfiguration.enterRefreshToken(dropboxConfig.refreshToken);
    await esConnectorConfiguration.clickSaveConfiguration();

    await esConnectorConfiguration.waitForSuccessMessage();
    await expect(esConnectorConfiguration.getSuccessMessage()).toBeVisible();
    await expect(esConnectorConfiguration.getSuccessMessage()).toContainText(dropboxConfig.connectorName);
  });
});
