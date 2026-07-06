import { test, expect } from '@es-connectors/fixtures/esConnectorsFixture';
import { getConfluenceApiTokenConfig } from '@es-connectors/test-data/confluence';
import { CONFLUENCE } from '@es-connectors/constants/confluence.constants';
import { requireAppManagerProject } from '@core/helpers/testHelper';

test.describe('ESConnectors @ESConnectorsConfluence @ESConnectorsConfluenceApiToken', () => {
  test.beforeEach(() => {
    requireAppManagerProject();
  });

  test('Generate Confluence API Token', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsConfluence,
  }) => {
    const confluenceConfig = getConfluenceApiTokenConfig();

    await test.step('Given I am logged into Zeus as an Admin User', async () => {
      await enterpriseSearchNavigation.navigateToEnterpriseSearch();
      await esConnectorsAdminPanel.waitForPageLoad();
    });

    await test.step('When I navigate to Confluence connector setup', async () => {
      await esConnectorsAdminPanel.clickAddSource();
      await esConnectorsConfluence.selectConfluenceConnector();
    });

    await test.step('And I create a scoped API token with the required permissions', async () => {
      await esConnectorsConfluence.createScopedApiToken(confluenceConfig);
    });

    await test.step('Then the API token should be generated successfully', async () => {
      await esConnectorsConfluence.waitForTokenGenerated();
      await expect(esConnectorsConfluence.getSuccessMessage()).toBeVisible();
    });

    await test.step('And I should be able to copy the generated token', async () => {
      await esConnectorsConfluence.copyGeneratedToken();
      await expect(esConnectorsConfluence.getGeneratedToken()).toBeVisible();
    });

    expect(confluenceConfig.expirationDays).toBeGreaterThanOrEqual(CONFLUENCE.expirationMinDays);
    expect(confluenceConfig.expirationDays).toBeLessThanOrEqual(CONFLUENCE.expirationMaxDays);
  });
});
