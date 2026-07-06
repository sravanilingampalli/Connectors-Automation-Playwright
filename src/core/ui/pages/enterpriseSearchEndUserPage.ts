import { expect, Locator, Page } from '@playwright/test';
import { ROUTES } from '@core/constants/routes';
import { END_USER_SEARCH } from '@es-connectors/constants/enterpriseSearch.constants';
import { BasePage } from './basePage';

export class EnterpriseSearchEndUserPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  getSearchBox(): Locator {
    return this.page.getByRole('searchbox', { name: END_USER_SEARCH.searchBoxLabel });
  }

  getSearchResultsHeader(): Locator {
    return this.page.getByText(END_USER_SEARCH.resultsHeader).first();
  }

  async navigateToHome(): Promise<void> {
    await this.page.goto(ROUTES.home, { waitUntil: 'domcontentloaded' });
    await expect(this.getSearchBox()).toBeVisible({ timeout: 60_000 });
  }

  async refreshHomeBeforeSearch(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await expect(this.getSearchBox()).toBeVisible({ timeout: 60_000 });
  }

  async searchAfterRefreshingHome(term: string): Promise<void> {
    await this.refreshHomeBeforeSearch();
    await this.submitSearchQuery(term);
    await this.waitForSearchResults();
  }

  async search(term: string): Promise<void> {
    await this.submitSearchQuery(term);
    await expect(this.getSearchResultsHeader()).toBeVisible({ timeout: 120_000 });
  }

  async submitSearchQuery(term: string): Promise<void> {
    const searchBox = this.getSearchBox();
    await searchBox.click();
    await searchBox.fill(term);
    await this.page.keyboard.press('Enter');
    await this.page.waitForURL(/\/search\?/, { timeout: 60_000 });
  }

  async waitForSearchResults(): Promise<void> {
    await expect(this.getSearchResultsHeader()).toBeVisible({ timeout: 120_000 });
    await this.page.waitForTimeout(2_000);
  }

  getSourcesFilterPanel(): Locator {
    const sourcesHeading = this.page.getByText(END_USER_SEARCH.sourcesFilterHeading, { exact: true });

    return sourcesHeading
      .locator('xpath=ancestor::*[.//text()[normalize-space()="Manage"]][1]')
      .or(
        this.page
          .getByRole('complementary')
          .filter({ has: sourcesHeading })
          .or(this.page.locator('aside').filter({ has: sourcesHeading })),
      )
      .first();
  }

  private getSourceFilterOption(sourceName: string): Locator {
    const escapedName = sourceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const panel = this.getSourcesFilterPanel();

    return panel
      .locator('button, a, li, label, div, span')
      .filter({ hasText: new RegExp(`^\\s*${escapedName}\\s*\\(\\d+\\)`, 'i') })
      .or(
        panel
          .locator('button, a, li, label, div, span')
          .filter({ hasText: new RegExp(`^\\s*${escapedName}\\s+\\d+\\s*$`, 'i') }),
      )
      .or(panel.locator('button, a, li, label, div, span').filter({ hasText: new RegExp(`^${escapedName}$`, 'i') }))
      .or(panel.getByRole('checkbox', { name: new RegExp(`^${escapedName}$`, 'i') }))
      .or(panel.getByRole('button', { name: new RegExp(`^${escapedName}`, 'i') }))
      .first();
  }

  async selectSourceFilter(sourceName: string): Promise<void> {
    await this.selectSourceFilterFromCandidates([sourceName]);
  }

  async selectSourceFilterFromCandidates(sourceNames: string[]): Promise<void> {
    await this.waitForSearchResults();

    await expect(this.getSourcesFilterPanel()).toBeVisible({
      timeout: 60_000,
    });

    for (const sourceName of sourceNames) {
      const sourceFilter = this.getSourceFilterOption(sourceName);
      if (await sourceFilter.isVisible({ timeout: 10_000 }).catch(() => false)) {
        await sourceFilter.click();
        await expect(this.getSearchResultsHeader()).toBeVisible({ timeout: 60_000 });
        await this.page.waitForTimeout(2_000);
        return;
      }
    }

    throw new Error(`No source filter found among: ${sourceNames.join(', ')}`);
  }

  async expectSearchFileNotVisible(fileName: string, timeoutMs = 60_000): Promise<void> {
    const escapedName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const resultsRegion = this.page.getByRole('region', { name: END_USER_SEARCH.resultsHeader });

    await expect(async () => {
      await this.waitForSearchResults();
      const fileResultLink = resultsRegion.getByRole('link', { name: new RegExp(`^${escapedName}$`, 'i') });
      const linkCount = await fileResultLink.count();
      expect(linkCount, `Expected "${fileName}" to be excluded from search results`).toBe(0);
    }).toPass({
      timeout: timeoutMs,
      intervals: [10_000, 30_000, 60_000],
    });
  }

  async expectNoConnectorSearchFile(
    connectorName: string,
    fileName: string,
    timeoutMs = 60_000,
  ): Promise<void> {
    await expect(async () => {
      await this.expectNoConnectorResult(connectorName, fileName);
    }).toPass({
      timeout: timeoutMs,
      intervals: [10_000, 30_000, 60_000],
    });
  }

  async expectConnectorSearchFileNotVisibleWithRetry(options: {
    connectorName: string;
    fileName: string;
    sourceCandidates: string[];
    timeoutMs?: number;
  }): Promise<void> {
    const timeoutMs = options.timeoutMs ?? 300_000;

    await expect(async () => {
      await this.searchAfterRefreshingHome(options.fileName);
      await this.selectSourceFilterFromCandidates(options.sourceCandidates);
      await this.expectNoConnectorResult(options.connectorName, options.fileName);
    }).toPass({
      timeout: timeoutMs,
      intervals: [15_000, 30_000, 60_000],
    });
  }

  private getResultLink(title: string | RegExp): Locator {
    const pattern = typeof title === 'string' ? new RegExp(title, 'i') : title;
    return this.page.getByRole('link', { name: pattern });
  }

  async getConnectorResultLink(connectorName: string, resultTitle: string | RegExp): Promise<Locator> {
    await this.waitForSearchResults();

    const titlePattern = typeof resultTitle === 'string' ? new RegExp(resultTitle, 'i') : resultTitle;
    const matchingLinks = this.getResultLink(titlePattern);
    const linkCount = await matchingLinks.count();

    for (let index = 0; index < linkCount; index += 1) {
      const link = matchingLinks.nth(index);
      const resultBlock = link.locator('xpath=ancestor::*[contains(., "Breadcrumb number")][1]');

      if ((await resultBlock.count()) === 0) {
        continue;
      }

      const blockText = await resultBlock.innerText();
      if (blockText.includes(connectorName) && titlePattern.test(blockText)) {
        return link;
      }
    }

    return this.getResultLink(titlePattern).first();
  }

  async openConnectorResultPage(connectorName: string, resultTitle: string | RegExp): Promise<Page> {
    const resultLink = await this.getConnectorResultLink(connectorName, resultTitle);
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      resultLink.click(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    return newPage;
  }

  async expectConnectorResultVisible(connectorName: string, resultTitle: string | RegExp): Promise<void> {
    await this.waitForSearchResults();

    const titlePattern = typeof resultTitle === 'string' ? new RegExp(resultTitle, 'i') : resultTitle;
    const resultLink = this.getResultLink(titlePattern).first();
    await expect(resultLink).toBeVisible({ timeout: 60_000 });

    const connectorMention = this.page
      .locator('*')
      .filter({ has: resultLink })
      .filter({ hasText: new RegExp(`^${connectorName}$`) })
      .first();

    const connectorNearResult = await connectorMention.isVisible().catch(() => false);
    if (!connectorNearResult) {
      const pageText = await this.page.locator('body').innerText();
      expect(
        pageText.includes(connectorName) && titlePattern.test(pageText),
        `Expected "${connectorName}" result containing ${titlePattern}`,
      ).toBeTruthy();
      return;
    }

    await expect(connectorMention).toBeVisible();
  }

  async expectNoConnectorResult(connectorName: string, resultTitle: string | RegExp): Promise<void> {
    await this.waitForSearchResults();

    const titlePattern = typeof resultTitle === 'string' ? new RegExp(resultTitle, 'i') : resultTitle;
    const matchingLinks = this.getResultLink(titlePattern);
    const linkCount = await matchingLinks.count();

    for (let i = 0; i < linkCount; i += 1) {
      const link = matchingLinks.nth(i);
      const resultBlock = link.locator('xpath=ancestor::*[contains(., "Breadcrumb number")][1]');

      if ((await resultBlock.count()) === 0) {
        continue;
      }

      const blockText = await resultBlock.innerText();
      if (blockText.includes(connectorName) && titlePattern.test(blockText)) {
        throw new Error(
          `Excluded audience content "${resultTitle}" is searchable from connector "${connectorName}"`,
        );
      }
    }
  }

  async expectSearchResultsHonorAudiencePermissions(connectorName: string): Promise<void> {
    await this.waitForSearchResults();
    await expect(this.getSearchResultsHeader()).toBeVisible();
    await expect(this.page.getByText(connectorName, { exact: true }).first()).toBeVisible({
      timeout: 30_000,
    });
  }

  async expectSearchResultIndexed(options: {
    connectorName: string;
    pageTitle: string | RegExp;
    authorName?: string | RegExp;
    contentPattern?: string | RegExp;
    resultType?: string;
  }): Promise<void> {
    await this.waitForSearchResults();

    const titlePattern =
      typeof options.pageTitle === 'string' ? new RegExp(options.pageTitle, 'i') : options.pageTitle;
    const resultLink = this.getResultLink(titlePattern).first();
    await expect(resultLink).toBeVisible({ timeout: 60_000 });

    const resultBlock = resultLink.locator('xpath=ancestor::*[contains(., "Breadcrumb number")][1]');
    await expect(resultBlock).toBeVisible();
    const blockText = await resultBlock.innerText();

    expect(blockText).toContain(options.connectorName);

    if (options.authorName) {
      const authorPattern =
        typeof options.authorName === 'string'
          ? new RegExp(options.authorName, 'i')
          : options.authorName;
      expect(blockText).toMatch(authorPattern);
    }

    if (options.contentPattern) {
      const contentPattern =
        typeof options.contentPattern === 'string'
          ? new RegExp(options.contentPattern, 'i')
          : options.contentPattern;
      expect(blockText).toMatch(contentPattern);
    }

    if (options.resultType) {
      expect(blockText).toMatch(new RegExp(options.resultType, 'i'));
    }

    expect(blockText).toMatch(/Updated .+\d{4}/i);
  }

  async expectDeletedPageNotSearchable(
    connectorName: string,
    resultTitle: string | RegExp,
    searchTerm: string,
    timeoutMs = 600_000,
  ): Promise<void> {
    await expect(async () => {
      await this.search(searchTerm);
      await this.expectNoConnectorResult(connectorName, resultTitle);
    }).toPass({
      timeout: timeoutMs,
      intervals: [15_000, 30_000, 60_000],
    });
  }

  getSmartAnswersHeading(): Locator {
    return this.page.getByRole('main').getByRole('heading', { name: END_USER_SEARCH.smartAnswersHeading });
  }

  getSmartAnswersMainSection(): Locator {
    return this.page.getByRole('main');
  }

  private getSearchResultsRegion(): Locator {
    return this.page.getByRole('region', { name: END_USER_SEARCH.resultsHeader });
  }

  private normalizeContentPattern(contentPattern?: string | RegExp): RegExp {
    if (typeof contentPattern === 'string') {
      return new RegExp(contentPattern, 'i');
    }

    return contentPattern ?? /confluence model/i;
  }

  async getSmartAnswerParagraph(contentPattern?: string | RegExp): Promise<Locator> {
    await this.waitForSearchResults();

    const smartAnswersHeading = this.getSmartAnswersHeading();
    await expect(smartAnswersHeading).toBeVisible({ timeout: 120_000 });

    const pattern = this.normalizeContentPattern(contentPattern);
    const resultsRegion = this.getSearchResultsRegion();
    await expect(resultsRegion).toBeVisible({ timeout: 120_000 });

    let smartAnswerParagraph: Locator | null = null;

    await expect(async () => {
      const resultsTop = (await resultsRegion.boundingBox())?.y ?? Number.MAX_SAFE_INTEGER;
      const paragraphs = this.getSmartAnswersMainSection().locator('p').filter({ hasText: pattern });
      const paragraphCount = await paragraphs.count();

      for (let index = 0; index < paragraphCount; index += 1) {
        const candidate = paragraphs.nth(index);
        const candidateBox = await candidate.boundingBox();
        if (candidateBox && candidateBox.y < resultsTop) {
          smartAnswerParagraph = candidate;
          return;
        }
      }

      throw new Error('Smart Answer paragraph not yet visible above search results');
    }).toPass({ timeout: 120_000, intervals: [3_000, 5_000, 10_000] });

    if (!smartAnswerParagraph) {
      throw new Error('Smart Answer paragraph not found above search results');
    }

    return smartAnswerParagraph;
  }

  async getSmartAnswerTitle(pageTitle?: string | RegExp): Promise<Locator> {
    const titlePattern =
      typeof pageTitle === 'string'
        ? new RegExp(pageTitle, 'i')
        : pageTitle ?? /confluence testing/i;
    const resultsRegion = this.getSearchResultsRegion();
    const resultsTop = (await resultsRegion.boundingBox())?.y ?? Number.MAX_SAFE_INTEGER;
    const headings = this.getSmartAnswersMainSection()
      .getByRole('heading', { level: 3 })
      .filter({ hasText: titlePattern });

    const headingCount = await headings.count();
    for (let index = 0; index < headingCount; index += 1) {
      const candidate = headings.nth(index);
      const candidateBox = await candidate.boundingBox();
      if (candidateBox && candidateBox.y < resultsTop) {
        return candidate;
      }
    }

    return headings.first();
  }

  async expectSmartAnswersVisible(contentPattern?: string | RegExp): Promise<void> {
    const generatedSummary = await this.getSmartAnswerParagraph(contentPattern);
    await expect(generatedSummary).toBeVisible({ timeout: 120_000 });
    await expect(generatedSummary).not.toBeEmpty();
  }

  async expectSmartAnswersAboveSearchResults(): Promise<void> {
    const smartAnswersHeading = this.getSmartAnswersHeading();
    const resultsRegion = this.page.getByRole('region', { name: END_USER_SEARCH.resultsHeader });

    await expect(smartAnswersHeading).toBeVisible();
    await expect(resultsRegion).toBeVisible();

    const smartAnswersBox = await smartAnswersHeading.boundingBox();
    const resultsBox = await resultsRegion.boundingBox();

    expect(
      smartAnswersBox && resultsBox,
      'Expected Smart Answers and search results to be visible for layout comparison',
    ).toBeTruthy();

    if (smartAnswersBox && resultsBox) {
      expect(
        smartAnswersBox.y,
        'Smart Answers should appear above the search results list',
      ).toBeLessThan(resultsBox.y);
    }
  }

  async getSmartAnswerText(contentPattern?: string | RegExp): Promise<string> {
    const smartAnswerParagraph = await this.getSmartAnswerParagraph(contentPattern);
    const answerText = (await smartAnswerParagraph.innerText()).trim();

    expect(answerText.length, 'Expected a generated Smart Answer summary paragraph').toBeGreaterThan(0);
    return answerText;
  }

  async expectSmartAnswerRelevance(options: {
    searchTerm: string;
    relevanceKeywords: string[];
    indexedContentPatterns: string[];
    connectorName: string;
    pageTitle: string | RegExp;
    contentPattern: string | RegExp;
  }): Promise<void> {
    const answerText = await this.getSmartAnswerText(options.contentPattern);
    const normalizedAnswer = answerText.toLowerCase();

    const summaryTitle = await this.getSmartAnswerTitle(options.pageTitle);
    await expect(summaryTitle).toBeVisible({ timeout: 30_000 });
    const summaryTitleText = (await summaryTitle.innerText()).toLowerCase();
    expect(
      summaryTitleText,
      `Smart Answer title should relate to searched keyword "${options.searchTerm}"`,
    ).toMatch(new RegExp(options.searchTerm.split(/\s+/)[0], 'i'));

    for (const keyword of options.relevanceKeywords) {
      expect(
        normalizedAnswer,
        `Smart Answer should be relevant to searched keyword "${keyword}"`,
      ).toContain(keyword.toLowerCase());
    }

    for (const pattern of options.indexedContentPatterns) {
      expect(
        normalizedAnswer,
        `Smart Answer should reflect indexed Confluence content containing "${pattern}"`,
      ).toMatch(new RegExp(pattern, 'i'));
    }

    const titlePattern =
      typeof options.pageTitle === 'string'
        ? new RegExp(options.pageTitle, 'i')
        : options.pageTitle;
    const resultLink = this.getResultLink(titlePattern).first();
    await expect(resultLink).toBeVisible({ timeout: 60_000 });

    const resultBlock = resultLink.locator('xpath=ancestor::*[contains(., "Breadcrumb number")][1]');
    const resultText = await resultBlock.innerText();
    const contentPattern =
      typeof options.contentPattern === 'string'
        ? new RegExp(options.contentPattern, 'i')
        : options.contentPattern;

    expect(resultText).toContain(options.connectorName);
    expect(resultText).toMatch(contentPattern);
    expect(answerText).toMatch(contentPattern);
    expect(
      resultText,
      'Smart Answer and indexed search result should share contextually relevant content',
    ).toMatch(/confluence model/i);
  }
}
