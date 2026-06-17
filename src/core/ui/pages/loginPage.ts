import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  private readonly emailInput = () => this.page.locator('#inputOption');
  private readonly passwordInput = () => this.page.locator('#inputPassword');
  private readonly continueButton = () => this.page.getByRole('button', { name: 'Continue' });
  private readonly signInButton = () => this.page.getByRole('button', { name: 'Sign in' });

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/login');
    await this.emailInput().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async enterEmail(email: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.continueButton().click();
    await this.page.waitForURL('**/login/authenticate**', { timeout: 30_000 });
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput().fill(password);
    await this.signInButton().click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.open();
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.page.waitForURL('**/home**', { timeout: 60_000 });
  }
}
