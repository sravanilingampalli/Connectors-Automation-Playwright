import { test, expect } from '@es-connectors/fixtures/esConnectorsFixture';
import { ENTERPRISE_SEARCH } from '@es-connectors/constants';
import { getConfluenceConnectorConfig } from '@es-connectors/test-data/confluence';
import { requireAppManagerProject } from '@core/helpers/testHelper';

test.describe('ESConnectors @ESConnectorsConfluence', () => {
  test.beforeEach(() => {
    requireAppManagerProject();
  });

  test('Configure Confluence Connector in Zeus', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsConfluence,
  }) => {
    test.setTimeout(180_000);

    const baseConfig = getConfluenceConnectorConfig();
    const confluenceConfig = {
      ...baseConfig,
      connectorName: `${baseConfig.connectorName}-${Date.now()}`,
    };

    await test.step('Given I am logged into Zeus as an Admin User', async () => {
      await enterpriseSearchNavigation.navigateToEnterpriseSearch();
      await esConnectorsAdminPanel.waitForPageLoad();
    });

    await test.step('When I create a new Confluence connector', async () => {
      await esConnectorsAdminPanel.clickAddSource();
      await esConnectorsAdminPanel.expectSourceListDisplayed();

      const sourceDialog = esConnectorsAdminPanel.getSourcePickerDialog();
      await expect(
        sourceDialog.getByRole('button', {
          name: new RegExp(`^${ENTERPRISE_SEARCH.confluenceConnector}$`, 'i'),
        }),
      ).toBeVisible();

      await esConnectorsConfluence.selectConfluenceConnector();
      await esConnectorsConfluence.expectSetupFormDisplayed();
      await expect(esConnectorsConfluence.getConnectorNameInput()).toBeVisible();
      await expect(esConnectorsConfluence.getCloudEmailInput()).toBeVisible();
      await expect(esConnectorsConfluence.getApiTokenInput()).toBeVisible();
      await expect(esConnectorsConfluence.getUrlLabelInput()).toBeVisible();
    });

    await test.step('And I enter Connector Name, Cloud email, API Token, and URL label', async () => {
      await esConnectorsConfluence.configureConfluenceConnector(confluenceConfig);
    });

    await test.step('And I click Save Configuration', async () => {
      await esConnectorsConfluence.saveConfiguration();
    });

    await test.step('Then the configuration should be saved successfully', async () => {
      await esConnectorsConfluence.expectConnectorCreated(confluenceConfig.connectorName);
      await expect(esConnectorsConfluence.getConfigurationSavedMessage()).toBeVisible();
      await expect(esConnectorsConfluence.getConfigurationSavedMessage()).toContainText(
        confluenceConfig.connectorName,
      );
    });

    await test.step('And connector status is shown as Configured', async () => {
      await esConnectorsConfluence.expectStep2Displayed();
      await esConnectorsConfluence.clickSaveAndSync();
      await esConnectorsConfluence.confirmIngestionSetup();
      await esConnectorsConfluence.expectConnectorStatusConfigured();
    });
  });
});
