import { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for the Retrospective Board page
 */
export class RetroBoardPage {
  readonly page: Page
  readonly pageHeading: Locator
  readonly backToBoardsLink: Locator
  readonly sortByVotesToggle: Locator
  readonly customizeButton: Locator
  readonly facilitatorButton: Locator
  readonly exportButton: Locator
  readonly connectionBadge: Locator

  constructor(page: Page) {
    this.page = page
    this.pageHeading = page.locator('h1').first()
    this.backToBoardsLink = page.getByTestId('back-to-boards')
    this.sortByVotesToggle = page.getByRole('button', { name: /Sort by votes/i })
    this.customizeButton = page.getByRole('button', { name: /Customize/i })
    this.facilitatorButton = page.getByRole('button', { name: /Facilitator Tools/i })
    this.exportButton = page.getByRole('button', { name: /Export/i })
    this.connectionBadge = page.getByText(/Connected|Connecting/)
  }

  async goto(boardId: string) {
    await this.page.goto(`/retro/${boardId}`)
  }

  /**
   * Get a column card by its title
   */
  getColumn(columnTitle: string): Locator {
    return this.page.getByRole('heading', { name: columnTitle }).locator('../..')
  }

  /**
   * Get the "Add Item" button for a specific column
   */
  getAddItemButton(columnTitle: string): Locator {
    const column = this.getColumn(columnTitle)
    return column.getByRole('button', { name: /Add Item/i })
  }

  /**
   * Get the textarea for adding an item (when visible)
   */
  getItemTextarea(columnTitle: string): Locator {
    const column = this.getColumn(columnTitle)
    return column.getByPlaceholder(/Type your thoughts/i)
  }

  /**
   * Get the "Add" submit button for creating an item
   */
  getItemSubmitButton(columnTitle: string): Locator {
    const column = this.getColumn(columnTitle)
    return column.getByRole('button', { name: /^Add$/i })
  }

  /**
   * Get the "Cancel" button for canceling item creation
   */
  getItemCancelButton(columnTitle: string): Locator {
    const column = this.getColumn(columnTitle)
    return column.getByRole('button', { name: /Cancel/i })
  }

  /**
   * Get all items in a specific column
   */
  getColumnItems(columnTitle: string): Locator {
    const column = this.getColumn(columnTitle)
    // Items are in card elements with a specific structure
    return column.locator('[role="group"]').locator('..')
  }

  /**
   * Get a specific item by its text content
   */
  getItemByText(text: string): Locator {
    return this.page.getByText(text, { exact: false }).locator('../..')
  }

  /**
   * Get the vote button for a specific item
   */
  getItemVoteButton(itemText: string): Locator {
    const item = this.getItemByText(itemText)
    return item.getByRole('button', { name: /vote|👍/i }).first()
  }

  /**
   * Get the edit button for a specific item
   */
  getItemEditButton(itemText: string): Locator {
    const item = this.getItemByText(itemText)
    return item.getByRole('button', { name: /edit/i }).first()
  }

  /**
   * Get the delete button for a specific item
   */
  getItemDeleteButton(itemText: string): Locator {
    const item = this.getItemByText(itemText)
    return item.getByRole('button', { name: /delete|remove/i }).first()
  }

  /**
   * Get the vote count for a specific item
   */
  async getItemVoteCount(itemText: string): Promise<number> {
    const item = this.getItemByText(itemText)
    const voteText = await item.getByText(/👍/).textContent()
    if (!voteText) return 0
    const match = voteText.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }

  /**
   * Get the author name for a specific item
   */
  async getItemAuthor(itemText: string): Promise<string | null> {
    const item = this.getItemByText(itemText)
    const authorElement = item.locator('.text-muted-foreground').first()
    return authorElement.textContent()
  }

  /**
   * Add an item to a column
   */
  async addItem(columnTitle: string, text: string) {
    const addButton = this.getAddItemButton(columnTitle)
    await addButton.click()

    const textarea = this.getItemTextarea(columnTitle)
    await textarea.fill(text)

    const submitButton = this.getItemSubmitButton(columnTitle)
    await submitButton.click()

    // Wait for the item to appear
    await this.page.waitForTimeout(500)
  }

  /**
   * Edit an item's text
   */
  async editItem(oldText: string, newText: string) {
    const editButton = this.getItemEditButton(oldText)
    await editButton.click()

    // Find the textarea for editing
    const item = this.getItemByText(oldText)
    const textarea = item.locator('textarea')
    await textarea.fill(newText)

    // Click the save/check button
    const saveButton = item.getByRole('button', { name: /check|save/i }).first()
    await saveButton.click()

    // Wait for the edit to complete
    await this.page.waitForTimeout(500)
  }

  /**
   * Delete an item
   */
  async deleteItem(itemText: string) {
    const deleteButton = this.getItemDeleteButton(itemText)
    await deleteButton.click()

    // Wait for the item to be removed
    await this.page.waitForTimeout(500)
  }

  /**
   * Vote on an item (toggle vote)
   */
  async voteOnItem(itemText: string) {
    const voteButton = this.getItemVoteButton(itemText)
    await voteButton.click()

    // Wait for the vote to register
    await this.page.waitForTimeout(300)
  }

  /**
   * Check if an item exists on the board
   */
  async itemExists(itemText: string): Promise<boolean> {
    try {
      await this.getItemByText(itemText).waitFor({ state: 'visible', timeout: 2000 })
      return true
    } catch {
      return false
    }
  }

  /**
   * Get the number of items in a column
   */
  async getColumnItemCount(columnTitle: string): Promise<number> {
    const items = this.getColumnItems(columnTitle)
    return items.count()
  }

  /**
   * Toggle sort by votes
   */
  async toggleSortByVotes() {
    await this.sortByVotesToggle.click()
  }

  /**
   * Wait for a success toast message
   */
  async waitForSuccessToast(message?: string) {
    if (message) {
      await this.page.getByText(message).waitFor({ state: 'visible', timeout: 5000 })
    } else {
      await this.page.locator('[data-sonner-toast]').waitFor({ state: 'visible', timeout: 5000 })
    }
  }

  /**
   * Wait for an error toast message
   */
  async waitForErrorToast(message?: string) {
    if (message) {
      await this.page.getByText(message).waitFor({ state: 'visible', timeout: 5000 })
    } else {
      await this.page.locator('[data-sonner-toast]').waitFor({ state: 'visible', timeout: 5000 })
    }
  }

  /**
   * Reload the page and wait for it to load
   */
  async reloadPage() {
    await this.page.reload()
    await this.page.waitForLoadState('networkidle')
  }
}
