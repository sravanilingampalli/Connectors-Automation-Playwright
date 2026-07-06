import { Locator, Page } from '@playwright/test';
import { BasePage } from '@core/ui/pages/basePage';
import { ENTERPRISE_SEARCH, ROUTES } from '@es-connectors/constants';

export class EnterpriseSearchNavigationPage extends BasePage {
  private readonly profileMenuButton = (): Locator =>
    this.page.getByRole('button', { name: /open user menu|profile|account/i }).first();

  private readonly manageMenuItem = (): Locator =>
    this.page.getByRole('menuitem', { name: ENTERPRISE_SEARCH.manageMenuItem });

  private readonly enterpriseSearchLink = (): Locator =>
    this.page.getByRole('link', { name: new RegExp(ENTERPRISE_SEARCH.enterpriseSearchLink, 'i') });

  constructor(page: Page) {
    super(page);
  }

  async navigateToEnterpriseSearch(): Promise<void> {
    await this.page.goto(ROUTES.enterpriseSearchSources, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await this.closeManageNavigationPanelIfOpen();
    await this.waitForEnterpriseSearchPage();
  }

  async openFromManageMenu(): Promise<void> {
    await this.openFromProfileMenu();
  }

  async clickManageMenu(): Promise<void> {
    await this.manageMenuItem().click();
  }

  async clickEnterpriseSearchLink(): Promise<void> {
    await this.enterpriseSearchLink().first().click();
    await this.waitForEnterpriseSearchPage();
    await this.closeManageNavigationPanelIfOpen();
  }

  async closeManageNavigationPanelIfOpen(): Promise<void> {
    const closeMenuButton = this.page.getByRole('button', { name: /close menu/i });
    if (await closeMenuButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await closeMenuButton.click();
    }
  }

  async openFromProfileMenu(): Promise<void> {
    await this.page.goto(ROUTES.home, { waitUntil: 'domcontentloaded' });
    await this.openProfileMenu();
    await this.manageMenuItem().click();
    await this.enterpriseSearchLink().first().click();
    await this.waitForEnterpriseSearchPage();
  }

  async openProfileMenu(): Promise<void> {
    await this.profileMenuButton().click();
  }

  async waitForEnterpriseSearchPage(): Promise<void> {
    await this.page.waitForURL(/\/manage\/enterpriseSearch/i, { timeout: 60_000 }).catch(() => undefined);
    await this.closeManageNavigationPanelIfOpen();

    const addSourceButton = this.page.getByRole('button', {
      name: new RegExp(ENTERPRISE_SEARCH.addSourceButton, 'i'),
    });
    const sourcesHeading = this.page.getByRole('heading', { name: /^Sources$/i });

    await addSourceButton.or(sourcesHeading).first().waitFor({
      state: 'visible',
      timeout: 60_000,
    });
  }
}
