import { expect, Page } from '@playwright/test';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  private readonly emailInput = () =>
    this.page.getByRole('textbox', { name: /email/i }).or(this.page.locator('#inputOption')).first();
  private readonly passwordInput = () =>
    this.page.getByLabel(/password/i).or(this.page.locator('#inputPassword')).first();
  private readonly continueButton = () => this.page.getByRole('button', { name: 'Continue' });
  private readonly signInButton = () => this.page.getByRole('button', { name: 'Sign in' });

  constructor(page: Page) {
    super(page);
  }

  async isLoggedIn(): Promise<boolean> {
    if (/\/home(?:\/|$|\?)/i.test(this.page.url())) {
      return true;
    }

    const redirectedToHome = await this.page
      .waitForURL(/\/home(?:\/|$|\?)/i, { timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (redirectedToHome) {
      return true;
    }

    return this.page
      .getByRole('searchbox', { name: /search/i })
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
  }

  async waitForLoginOrHome(): Promise<void> {
    await expect(
      this.emailInput().or(this.page.getByRole('searchbox', { name: /search/i })),
    ).toBeVisible({ timeout: 90_000 });
  }

  async open(): Promise<void> {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await this.waitForLoginOrHome();
  }

  async enterEmail(email: string): Promise<void> {
    await expect(this.emailInput()).toBeVisible({ timeout: 60_000 });
    await this.emailInput().fill(email);
    await this.continueButton().click();
    await this.page.waitForURL('**/login/authenticate**', { timeout: 30_000 });
  }

  async enterPassword(password: string): Promise<void> {
    await expect(this.passwordInput()).toBeVisible({ timeout: 60_000 });
    await this.passwordInput().fill(password);
    await this.signInButton().click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.open();

    if (await this.isLoggedIn()) {
      return;
    }

    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.page.waitForURL('**/home**', { timeout: 60_000 });
  }
}
