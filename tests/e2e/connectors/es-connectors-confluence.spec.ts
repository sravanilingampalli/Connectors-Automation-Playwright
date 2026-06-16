import { test, expect } from '../../../src/fixtures';
import { getConfluenceApiTokenConfig } from '../../../src/data/connectors/confluence';
import { CONFLUENCE } from '../../../src/constants/confluence.constants';
import { requireAppManagerProject } from '../../../src/utils/test.helper';

test.describe('ESConnectors @ESConnectorsConfluence', () => {
  test.beforeEach(() => {
    requireAppManagerProject();
  });

  test('Generate Confluence API Token', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
    esConnectorsConfluence,
  }) => {
    const confluenceConfig = getConfluenceApiTokenConfig();

    // Given I am logged into Confluence (via App Manager session + connector flow)
    await enterpriseSearchNavigation.navigateToEnterpriseSearch();
    await esConnectorsAdminPanel.waitForPageLoad();
    await esConnectorsAdminPanel.clickAddSource();
    await esConnectorsConfluence.selectConfluenceConnector();

    // When I create a scoped API token with the required permissions
    await esConnectorsConfluence.createScopedApiToken(confluenceConfig);

    // Then the required scopes should be visible and selectable
    // And the API token should be generated successfully
    await esConnectorsConfluence.waitForTokenGenerated();
    await expect(esConnectorsConfluence.getSuccessMessage()).toBeVisible();

    // And I should be able to copy the generated token
    await esConnectorsConfluence.copyGeneratedToken();
    await expect(esConnectorsConfluence.getGeneratedToken()).toBeVisible();

    // Expiration date is accepted only between 1 and 365 days
    expect(confluenceConfig.expirationDays).toBeGreaterThanOrEqual(CONFLUENCE.expirationMinDays);
    expect(confluenceConfig.expirationDays).toBeLessThanOrEqual(CONFLUENCE.expirationMaxDays);
  });
});
