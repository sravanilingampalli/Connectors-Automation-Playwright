import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { ENTERPRISE_SEARCH, ROUTES } from '../../constants';

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
    await this.page.goto(ROUTES.enterpriseSearchSources, { waitUntil: 'domcontentloaded' });
    await this.waitForEnterpriseSearchPage();
  }

  async openFromManageMenu(): Promise<void> {
    await this.page.goto(ROUTES.home, { waitUntil: 'domcontentloaded' });
    await this.manageMenuItem().click();
    await this.enterpriseSearchLink().first().click();
    await this.waitForEnterpriseSearchPage();
  }

  async openFromProfileMenu(): Promise<void> {
    await this.page.goto(ROUTES.home, { waitUntil: 'domcontentloaded' });
    await this.profileMenuButton().click();
    await this.manageMenuItem().click();
    await this.enterpriseSearchLink().first().click();
    await this.waitForEnterpriseSearchPage();
  }

  async waitForEnterpriseSearchPage(): Promise<void> {
    await this.page.getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.addSourceButton, 'i') }).waitFor({
      state: 'visible',
      timeout: 30_000,
    });
  }
}
