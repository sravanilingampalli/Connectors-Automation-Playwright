import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '@core/ui/pages/basePage';
import { ENTERPRISE_SEARCH } from '@es-connectors/constants';

export class ESConnectorsAdminPanelPage extends BasePage {
  private readonly addSourceButton = (): Locator =>
    this.page.getByRole('button', { name: new RegExp(ENTERPRISE_SEARCH.addSourceButton, 'i') });

  private readonly sourcePickerDialog = (): Locator => this.page.getByRole('dialog');

  constructor(page: Page) {
    super(page);
  }

  async waitForPageLoad(): Promise<void> {
    await this.addSourceButton().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async clickAddSource(): Promise<void> {
    await this.addSourceButton().click();
    await this.sourcePickerDialog().waitFor({ state: 'visible', timeout: 15_000 });
  }

  async expectAddSourceVisible(): Promise<void> {
    await this.addSourceButton().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async expectSourceListDisplayed(): Promise<void> {
    const dialog = this.sourcePickerDialog();
    await dialog.waitFor({ state: 'visible', timeout: 15_000 });
    await dialog.getByRole('button').first().waitFor({ state: 'visible', timeout: 15_000 });
  }

  async searchSourceInPicker(searchTerm: string): Promise<void> {
    const dialog = this.sourcePickerDialog();
    const searchInput = dialog
      .getByRole('textbox', { name: ENTERPRISE_SEARCH.sourcePickerSearchPlaceholder })
      .or(dialog.getByPlaceholder(ENTERPRISE_SEARCH.sourcePickerSearchPlaceholder))
      .first();

    await searchInput.waitFor({ state: 'visible', timeout: 15_000 });
    await searchInput.fill(searchTerm);
    await dialog.getByRole('button', { name: ENTERPRISE_SEARCH.sourcePickerSearchButton }).click();
    await expect(dialog.getByRole('heading', { name: /no results found/i })).toBeHidden({ timeout: 15_000 });
  }

  getSourcePickerDialog(): Locator {
    return this.sourcePickerDialog();
  }
}
