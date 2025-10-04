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

  async selectTemplate(templateId: string) {
    // Find the template card by its ID and click it
    const templateCard = this.page.locator(`[data-template-id="${templateId}"]`).first()

    // If no data attribute, find by template name
    if (await templateCard.count() === 0) {
      // Map template IDs to names for fallback
      const templateNames: Record<string, string> = {
        'default': 'Default (What Went Well)',
        'mad-sad-glad': 'Mad, Sad, Glad',
        'start-stop-continue': 'Start, Stop, Continue',
        '4ls': '4Ls (Liked, Learned, Lacked, Longed For)',
        'sailboat': 'Sailboat',
        'plus-delta': 'Plus/Delta',
        'daki': 'DAKI (Drop, Add, Keep, Improve)',
      }

      const templateName = templateNames[templateId]
      if (templateName) {
        await this.page.getByRole('heading', { name: templateName }).click()
      }
    } else {
      await templateCard.click()
    }
  }

  async getTemplateCard(templateId: string) {
    const templateNames: Record<string, string> = {
      'default': 'Default (What Went Well)',
      'mad-sad-glad': 'Mad, Sad, Glad',
      'start-stop-continue': 'Start, Stop, Continue',
      '4ls': '4Ls (Liked, Learned, Lacked, Longed For)',
      'sailboat': 'Sailboat',
      'plus-delta': 'Plus/Delta',
      'daki': 'DAKI (Drop, Add, Keep, Improve)',
    }

    const templateName = templateNames[templateId]
    return this.page.locator('div[role="group"]').filter({ hasText: templateName }).first()
  }

  async getSelectedTemplate() {
    // Find the checked radio button's value
    const checkedRadio = this.page.locator('button[role="radio"][data-state="checked"]')
    return checkedRadio.getAttribute('value')
  }

  async isTemplateSelected(templateId: string) {
    const templateCard = await this.getTemplateCard(templateId)
    const radioButton = templateCard.locator('button[role="radio"]')
    const state = await radioButton.getAttribute('data-state')
    return state === 'checked'
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
    const templateCard = await this.getTemplateCard(templateId)
    const columnBadges = templateCard.locator('.bg-muted')
    return columnBadges.allTextContents()
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
