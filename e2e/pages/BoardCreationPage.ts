import { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for the Board Creation page
 */
export class BoardCreationPage {
  readonly page: Page
  readonly titleInput: Locator
  readonly createButton: Locator
  readonly backToBoardsLink: Locator
  readonly pageHeading: Locator
  readonly infoBox: Locator

  constructor(page: Page) {
    this.page = page
    this.titleInput = page.getByLabel('Board Title')
    this.createButton = page.getByRole('button', { name: /Create Board/i })
    this.backToBoardsLink = page.getByRole('link', { name: /Back to Boards/i })
    this.pageHeading = page.getByRole('heading', { name: 'Create New Board' })
    this.infoBox = page.locator('text=No sign-up required!')
  }

  async goto() {
    await this.page.goto('/boards/new')
  }

  async fillTitle(title: string) {
    await this.titleInput.fill(title)
  }

  private getTemplateName(templateId: string): string {
    const templateNames: Record<string, string> = {
      'default': 'Default (What Went Well)',
      'mad-sad-glad': 'Mad, Sad, Glad',
      'start-stop-continue': 'Start, Stop, Continue',
      '4ls': '4Ls (Liked, Learned, Lacked, Longed For)',
      'sailboat': 'Sailboat',
      'plus-delta': 'Plus/Delta',
      'daki': 'DAKI (Drop, Add, Keep, Improve)',
    }
    return templateNames[templateId] || templateId
  }

  async selectTemplate(templateId: string) {
    const templateName = this.getTemplateName(templateId)
    // Find the template by text and click on its parent card
    const templateCard = this.page.getByText(templateName, { exact: true }).locator('..').locator('..')
    await templateCard.click()
  }

  async getTemplateCard(templateId: string) {
    const templateName = this.getTemplateName(templateId)
    // Navigate up to the main card container (5 levels up from the template name)
    return this.page.getByText(templateName, { exact: true }).locator('../../../../..')
  }

  async getSelectedTemplate() {
    // Find the checked radio button
    const checkedRadio = this.page.getByRole('radio', { checked: true }).first()
    return checkedRadio.isVisible()
  }

  async isTemplateSelected(templateId: string) {
    const templateName = this.getTemplateName(templateId)
    // Find the card containing this template name, then check if its radio is checked
    const card = this.page.getByText(templateName, { exact: true }).locator('../../../../..')
    const radio = card.getByRole('radio').first()
    return radio.isChecked()
  }

  async createBoard(title: string, templateId: string = 'default') {
    await this.fillTitle(title)
    await this.selectTemplate(templateId)
    await this.createButton.click()
  }

  async waitForRedirect() {
    // Wait for redirect to the retro board page
    await this.page.waitForURL(/\/retro\/[a-zA-Z0-9-]+/, { timeout: 10000 })
  }

  async getTemplateColumns(templateId: string) {
    const card = await this.getTemplateCard(templateId)
    // Get all generic elements in the column section - they contain column names
    const columnElements = card.locator('> div:last-child > div')
    return columnElements.allTextContents()
  }

  async isCreateButtonEnabled() {
    return this.createButton.isEnabled()
  }

  async isCreateButtonDisabled() {
    return this.createButton.isDisabled()
  }

  async getCreateButtonText() {
    return this.createButton.textContent()
  }
}
