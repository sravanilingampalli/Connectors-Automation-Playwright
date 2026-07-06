import { test, expect } from '@es-connectors/fixtures/esConnectorsFixture';
import { ENTERPRISE_SEARCH } from '@es-connectors/constants';
import { getConfluenceConnectorConfig } from '@es-connectors/test-data/confluence';
import { requireAppManagerProject } from '@core/helpers/testHelper';

test.describe('ESConnectors @ESConnectorsConfluence @ESConnectorsConfluenceValidation', () => {
  test.beforeEach(() => {
    requireAppManagerProject();
  });

  test('Verify Mandatory Field Validation', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsConfluence,
  }) => {
    const baseConfig = getConfluenceConnectorConfig();
    const confluenceConfig = {
      connectorName: `${baseConfig.connectorName}-Validation-${Date.now()}`,
      cloudEmail: baseConfig.cloudEmail,
      urlLabel: baseConfig.urlLabel,
    };

    await test.step('Given I am configuring a Confluence connector', async () => {
      await enterpriseSearchNavigation.navigateToEnterpriseSearch();
      await esConnectorsAdminPanel.waitForPageLoad();
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
    });

    await test.step('When I leave the API Token field empty', async () => {
      await esConnectorsConfluence.configureConfluenceConnectorWithoutApiToken(confluenceConfig);
      await esConnectorsConfluence.attemptSaveConfiguration();
    });

    await test.step('Then a validation message should be displayed', async () => {
      await esConnectorsConfluence.expectApiTokenValidationMessage();
      await expect(esConnectorsConfluence.getApiTokenValidationError().first()).toBeVisible();
    });

    await test.step('And configuration cannot be saved until mandatory fields are completed', async () => {
      await esConnectorsConfluence.expectConfigurationSaveBlocked();
      await expect(esConnectorsConfluence.getSaveConfigurationButton()).toBeVisible();
    });
  });
});
