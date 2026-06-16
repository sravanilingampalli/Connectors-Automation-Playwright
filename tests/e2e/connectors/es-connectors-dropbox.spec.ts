import { test, expect } from '../../../src/fixtures';
import { getDropboxConnectorConfig } from '../../../src/data/connectors/dropbox';
import { requireAppManagerProject } from '../../../src/utils/test.helper';

test.describe('ESConnectors @ESConnectorsDropBox', () => {
  test.beforeEach(() => {
    requireAppManagerProject();
  });

  test('Configure Dropbox Connector Successfully', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsDropbox,
  }) => {
    const dropboxConfig = getDropboxConnectorConfig();

    await enterpriseSearchNavigation.navigateToEnterpriseSearch();
    await esConnectorsAdminPanel.waitForPageLoad();
    await esConnectorsAdminPanel.clickAddSource();
    await esConnectorsDropbox.selectDropboxConnector();
    await esConnectorsDropbox.configureDropboxConnector(dropboxConfig);
    await esConnectorsDropbox.saveConfiguration();

    await esConnectorsDropbox.waitForSuccessMessage();
    await expect(esConnectorsDropbox.getSuccessMessage()).toBeVisible();
    await expect(esConnectorsDropbox.getSuccessMessage()).toContainText(dropboxConfig.connectorName);
  });
});
