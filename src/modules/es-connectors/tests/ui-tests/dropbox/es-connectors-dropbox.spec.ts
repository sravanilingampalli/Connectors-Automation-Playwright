import { test, expect } from '@es-connectors/fixtures/esConnectorsFixture';
import { ENTERPRISE_SEARCH } from '@es-connectors/constants';
import { getDropboxConnectorConfig } from '@es-connectors/test-data/dropbox';
import { requireAppManagerProject } from '@core/helpers/testHelper';

test.describe.configure({ mode: 'serial' });

test.describe('ESConnectors @ESConnectorsDropBox', () => {
  test.beforeEach(() => {
    requireAppManagerProject();
  });

  test('Setup – Navigate to Enterprise Search | Given Admin user navigates to Enterprise Search', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
  }) => {
    await enterpriseSearchNavigation.navigateToEnterpriseSearch();
    await esConnectorsAdminPanel.waitForPageLoad();
    await esConnectorsAdminPanel.expectAddSourceVisible();
  });

  test('Setup – Add Dropbox Connector | When Admin clicks Add Source and selects Dropbox connector', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsDropbox,
  }) => {
    await enterpriseSearchNavigation.openFromManageMenu();
    await esConnectorsAdminPanel.expectAddSourceVisible();
    await esConnectorsAdminPanel.clickAddSource();
    await esConnectorsAdminPanel.expectSourceListDisplayed();

    const sourceDialog = esConnectorsAdminPanel.getSourcePickerDialog();
    await expect(
      sourceDialog.getByRole('button', { name: new RegExp(`^${ENTERPRISE_SEARCH.dropboxConnector}$`, 'i') }),
    ).toBeVisible();

    await esConnectorsDropbox.selectDropboxConnector();
    await esConnectorsDropbox.expectSetupFormDisplayed();
    await expect(esConnectorsDropbox.getConnectorNameInput()).toBeVisible();
    await expect(esConnectorsDropbox.getAppKeyInput()).toBeVisible();
    await expect(esConnectorsDropbox.getAppSecretInput()).toBeVisible();
    await expect(esConnectorsDropbox.getRefreshTokenInput()).toBeVisible();
  });

  test('Setup – Create Connector with Valid Credentials | Verify Admin can configure and save Dropbox connector', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsDropbox,
  }) => {
    test.setTimeout(180_000);

    const baseConfig = getDropboxConnectorConfig();
    const dropboxConfig = {
      ...baseConfig,
      connectorName: `${baseConfig.connectorName}-${Date.now()}`,
    };

    await enterpriseSearchNavigation.openFromManageMenu();
    await esConnectorsAdminPanel.waitForPageLoad();
    await esConnectorsAdminPanel.clickAddSource();
    await esConnectorsDropbox.selectDropboxConnector();
    await esConnectorsDropbox.expectSetupFormDisplayed();

    await test.step('Enter valid Connector Name, App Key, App Secret, and Refresh Token', async () => {
      await esConnectorsDropbox.configureDropboxConnector(dropboxConfig);
    });

    await test.step('Click Save Configuration', async () => {
      await esConnectorsDropbox.saveConfiguration();
    });

    await test.step('Verify configuration is saved and success message is displayed', async () => {
      await esConnectorsDropbox.expectConnectorCreated(dropboxConfig.connectorName);
      await expect(esConnectorsDropbox.getSuccessMessage()).toBeVisible();
      await expect(esConnectorsDropbox.getSuccessMessage()).toContainText(dropboxConfig.connectorName);
    });
  });
});
