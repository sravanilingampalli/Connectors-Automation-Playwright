import { test } from '../../src/fixtures';
import { requireAppManagerProject } from '../../src/utils/test.helper';

test.describe('ESConnectors Smoke @ESConnectorsAdminPanel', () => {
  test.beforeEach(() => {
    requireAppManagerProject();
  });

  test('Admin can navigate to Enterprise Search and view Add Source', async ({
    enterpriseSearchNavigation,
    esConnectorsAdminPanel,
  }) => {
    await enterpriseSearchNavigation.navigateToEnterpriseSearch();
    await esConnectorsAdminPanel.waitForPageLoad();
    await esConnectorsAdminPanel.expectAddSourceVisible();
  });
});
