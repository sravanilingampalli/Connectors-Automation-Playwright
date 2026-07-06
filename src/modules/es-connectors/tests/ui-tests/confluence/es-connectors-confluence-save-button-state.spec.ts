import { test, expect } from '@es-connectors/fixtures/esConnectorsFixture';
import { getConfluenceConnectorConfig } from '@es-connectors/test-data/confluence';
import { requireAppManagerProject } from '@core/helpers/testHelper';

test.describe('ESConnectors @ESConnectorsConfluence @ESConnectorsConfluenceSaveButton', () => {
  test.beforeEach(() => {
    requireAppManagerProject();
  });

  test('Verify Save Configuration Button State', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsConfluence,
  }) => {
    const confluenceConfig = getConfluenceConnectorConfig();

    await test.step('Given a connector configuration already exists', async () => {
      await enterpriseSearchNavigation.navigateToEnterpriseSearch();
      await esConnectorsAdminPanel.waitForPageLoad();
      await esConnectorsConfluence.openConfiguredConnectorFromSources(confluenceConfig.connectorName);
      await esConnectorsConfluence.openConfigurationTab();
    });

    await test.step('When I do not modify any configuration values', async () => {
      await esConnectorsConfluence.expectSetupFormDisplayed();
    });

    await test.step('Then the Save Configuration button should remain disabled', async () => {
      await esConnectorsConfluence.expectSaveConfigurationDisabled();
      await expect(esConnectorsConfluence.getSaveConfigurationButton()).toBeDisabled();
    });

    await test.step('And button becomes enabled only after valid modifications', async () => {
      const currentName = await esConnectorsConfluence.getConnectorNameInput().inputValue();
      await esConnectorsConfluence.modifyConnectorName(`${currentName}-modified`);
      await esConnectorsConfluence.expectSaveConfigurationEnabled();
      await expect(esConnectorsConfluence.getSaveConfigurationButton()).toBeEnabled();
    });
  });
});
