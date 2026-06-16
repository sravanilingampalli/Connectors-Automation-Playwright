import { test, expect } from '../../../src/fixtures';
import { getDropboxConnectorConfig } from '../../../src/data/connectors/dropbox';
import { requireAppManagerProject } from '../../../src/utils/test.helper';

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
