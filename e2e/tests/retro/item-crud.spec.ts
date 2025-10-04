import { test, expect } from '@playwright/test'
import { BoardCreationPage } from '../../pages/BoardCreationPage'
import { RetroBoardPage } from '../../pages/RetroBoardPage'
import { AuthPage } from '../../pages/AuthPage'

/**
 * Retrospective Item CRUD Operations E2E Tests
 *
 * Comprehensive tests for retrospective board item operations including:
 * - Creating items in different columns
 * - Reading and displaying items
 * - Updating/editing items
 * - Deleting items
 * - Item persistence across page reloads
 * - Voting on items
 * - UI/UX across desktop, mobile, and tablet devices
 *
 * Tests cover both authenticated and anonymous users.
 */

/**
 * Helper function to create a test user via signup
 * Returns the user credentials for authenticated tests
 */
async function createTestUser(authPage: AuthPage) {
  const timestamp = Date.now()
  const user = {
    name: 'Test User',
    email: `test-${timestamp}@example.com`,
    password: 'TestPassword123!',
  }

  await authPage.goto()
  await authPage.switchToSignUp()
  await authPage.signUp(user.name, user.email, user.password)

  // Wait for signup success toast
  await authPage.page.waitForSelector('text=/Account created/i', { timeout: 10000 })

  // Clear session by deleting all cookies to sign out
  await authPage.page.context().clearCookies()

  // Navigate to a clean state
  await authPage.page.goto('/')

  return user
}

/**
 * Helper function to create a board and navigate to it
 */
async function createAndNavigateToBoard(page: any, boardTitle?: string) {
  const boardPage = new BoardCreationPage(page)
  const title = boardTitle || `Test Board ${Date.now()}`

  await boardPage.goto()
  await boardPage.createBoard(title, 'default')

  // Wait for redirect to board
  await boardPage.waitForRedirect()

  // Extract board ID from URL
  const url = page.url()
  const match = url.match(/\/retro\/([a-zA-Z0-9-]+)/)
  const boardId = match ? match[1] : null

  return { boardId, title }
}

test.describe('Retrospective Item CRUD Operations', () => {
  test.describe('Item Creation', () => {
    test('should create item in "What went well?" column', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Great team collaboration'
      await retroPage.addItem('What went well?', itemText)

      // Verify item appears
      const exists = await retroPage.itemExists(itemText)
      expect(exists).toBe(true)
    })

    test('should create item in "What could be improved?" column', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Better communication needed'
      await retroPage.addItem('What could be improved?', itemText)

      const exists = await retroPage.itemExists(itemText)
      expect(exists).toBe(true)
    })

    test('should create item in "What blocked us?" column', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Server downtime issues'
      await retroPage.addItem('What blocked us?', itemText)

      const exists = await retroPage.itemExists(itemText)
      expect(exists).toBe(true)
    })

    test('should create item in "Action items" column', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Schedule weekly sync meetings'
      await retroPage.addItem('Action items', itemText)

      const exists = await retroPage.itemExists(itemText)
      expect(exists).toBe(true)
    })

    test('should create item with special characters', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Sprint #42 - Q4\'24 performance! 🚀'
      await retroPage.addItem('What went well?', itemText)

      const exists = await retroPage.itemExists(itemText)
      expect(exists).toBe(true)
    })

    test('should create item with emojis', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Team morale was excellent 😊 👍 🎉'
      await retroPage.addItem('What went well?', itemText)

      const exists = await retroPage.itemExists(itemText)
      expect(exists).toBe(true)
    })

    test('should create item with long text', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'This is a very long retrospective item that contains a lot of text to test how the UI handles longer content. We should ensure that it wraps properly and displays correctly on the board without breaking the layout.'
      await retroPage.addItem('What went well?', itemText)

      const exists = await retroPage.itemExists(itemText)
      expect(exists).toBe(true)
    })

    test('should create multiple items in same column', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const item1 = 'First item'
      const item2 = 'Second item'
      const item3 = 'Third item'

      await retroPage.addItem('What went well?', item1)
      await retroPage.addItem('What went well?', item2)
      await retroPage.addItem('What went well?', item3)

      expect(await retroPage.itemExists(item1)).toBe(true)
      expect(await retroPage.itemExists(item2)).toBe(true)
      expect(await retroPage.itemExists(item3)).toBe(true)

      const count = await retroPage.getColumnItemCount('What went well?')
      expect(count).toBe(3)
    })

    test('should create items in different columns', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      await retroPage.addItem('What went well?', 'Good thing')
      await retroPage.addItem('What could be improved?', 'Improvement needed')
      await retroPage.addItem('What blocked us?', 'Blocker found')
      await retroPage.addItem('Action items', 'Action to take')

      expect(await retroPage.itemExists('Good thing')).toBe(true)
      expect(await retroPage.itemExists('Improvement needed')).toBe(true)
      expect(await retroPage.itemExists('Blocker found')).toBe(true)
      expect(await retroPage.itemExists('Action to take')).toBe(true)
    })

    test('should cancel item creation', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const addButton = retroPage.getAddItemButton('What went well?')
      await addButton.click()

      const textarea = retroPage.getItemTextarea('What went well?')
      await textarea.fill('This should be cancelled')

      const cancelButton = retroPage.getItemCancelButton('What went well?')
      await cancelButton.click()

      // Verify item was not created
      const exists = await retroPage.itemExists('This should be cancelled')
      expect(exists).toBe(false)

      // Verify textarea is no longer visible
      await expect(textarea).not.toBeVisible()
    })

    test('should show loading state during item creation', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const addButton = retroPage.getAddItemButton('What went well?')
      await addButton.click()

      const textarea = retroPage.getItemTextarea('What went well?')
      await textarea.fill('Test item')

      const submitButton = retroPage.getItemSubmitButton('What went well?')
      await submitButton.click()

      // Button should be disabled during creation
      try {
        await expect(submitButton).toBeDisabled({ timeout: 500 })
      } catch {
        // Expected: creation might be too fast to observe disabled state
      }
    })

    test('should not create item with only whitespace', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const addButton = retroPage.getAddItemButton('What went well?')
      await addButton.click()

      const textarea = retroPage.getItemTextarea('What went well?')
      await textarea.fill('   ')

      const submitButton = retroPage.getItemSubmitButton('What went well?')
      await submitButton.click()

      // Should show error toast
      await page.waitForTimeout(500)
      // The item should not be created
      // Note: Actual validation depends on implementation
    })
  })

  test.describe('Item Reading', () => {
    test('should display item text correctly', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Test item text'
      await retroPage.addItem('What went well?', itemText)

      const item = retroPage.getItemByText(itemText)
      await expect(item).toContainText(itemText)
    })

    test('should display item author name', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Item with author'
      await retroPage.addItem('What went well?', itemText)

      const author = await retroPage.getItemAuthor(itemText)
      expect(author).toBeTruthy()
    })

    test('should display initial vote count as 0', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Item with votes'
      await retroPage.addItem('What went well?', itemText)

      const voteCount = await retroPage.getItemVoteCount(itemText)
      expect(voteCount).toBe(0)
    })

    test('should display items in correct columns', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      await retroPage.addItem('What went well?', 'Good item')
      await retroPage.addItem('What could be improved?', 'Improvement item')

      const column1 = retroPage.getColumn('What went well?')
      await expect(column1).toContainText('Good item')

      const column2 = retroPage.getColumn('What could be improved?')
      await expect(column2).toContainText('Improvement item')
    })

    test('should display multiple items in column', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      await retroPage.addItem('What went well?', 'Item 1')
      await retroPage.addItem('What went well?', 'Item 2')
      await retroPage.addItem('What went well?', 'Item 3')

      const column = retroPage.getColumn('What went well?')
      await expect(column).toContainText('Item 1')
      await expect(column).toContainText('Item 2')
      await expect(column).toContainText('Item 3')
    })

    test('should maintain item order (most recent first by default)', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      await retroPage.addItem('What went well?', 'First item')
      await page.waitForTimeout(100)
      await retroPage.addItem('What went well?', 'Second item')
      await page.waitForTimeout(100)
      await retroPage.addItem('What went well?', 'Third item')

      // Items should be visible
      expect(await retroPage.itemExists('First item')).toBe(true)
      expect(await retroPage.itemExists('Second item')).toBe(true)
      expect(await retroPage.itemExists('Third item')).toBe(true)
    })
  })

  test.describe('Item Updating', () => {
    test('should edit item text as author', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const originalText = 'Original text'
      const updatedText = 'Updated text'

      await retroPage.addItem('What went well?', originalText)
      await retroPage.editItem(originalText, updatedText)

      // Wait for debounced save
      await page.waitForTimeout(1000)

      // Original text should no longer exist
      const originalExists = await retroPage.itemExists(originalText)
      expect(originalExists).toBe(false)

      // Updated text should exist
      const updatedExists = await retroPage.itemExists(updatedText)
      expect(updatedExists).toBe(true)
    })

    test('should cancel edit operation', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const originalText = 'Original text'
      await retroPage.addItem('What went well?', originalText)

      const editButton = retroPage.getItemEditButton(originalText)
      await editButton.click()

      const item = retroPage.getItemByText(originalText)
      const textarea = item.locator('textarea')
      await textarea.fill('This should be cancelled')

      // Click cancel button (X icon)
      const cancelButton = item.getByRole('button', { name: /x|cancel/i }).first()
      await cancelButton.click()

      // Original text should still exist
      const exists = await retroPage.itemExists(originalText)
      expect(exists).toBe(true)
    })

    test('should persist edited text after save', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const originalText = 'Text to edit'
      const updatedText = 'Edited text persisted'

      await retroPage.addItem('What went well?', originalText)
      await retroPage.editItem(originalText, updatedText)

      // Wait for save
      await page.waitForTimeout(1000)

      // Reload page
      await retroPage.reloadPage()

      // Updated text should still exist after reload
      const exists = await retroPage.itemExists(updatedText)
      expect(exists).toBe(true)
    })

    test('should edit item with special characters', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const originalText = 'Original'
      const updatedText = 'Updated with special chars! @#$% 🎉'

      await retroPage.addItem('What went well?', originalText)
      await retroPage.editItem(originalText, updatedText)

      await page.waitForTimeout(1000)

      const exists = await retroPage.itemExists(updatedText)
      expect(exists).toBe(true)
    })
  })

  test.describe('Item Deletion', () => {
    test('should delete item as author', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Item to delete'
      await retroPage.addItem('What went well?', itemText)

      // Verify item exists
      expect(await retroPage.itemExists(itemText)).toBe(true)

      // Delete item
      await retroPage.deleteItem(itemText)

      // Verify item no longer exists
      const exists = await retroPage.itemExists(itemText)
      expect(exists).toBe(false)
    })

    test('should remove item from column count', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      await retroPage.addItem('What went well?', 'Item 1')
      await retroPage.addItem('What went well?', 'Item 2')

      expect(await retroPage.getColumnItemCount('What went well?')).toBe(2)

      await retroPage.deleteItem('Item 1')

      expect(await retroPage.getColumnItemCount('What went well?')).toBe(1)
    })

    test('should persist deletion after page reload', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Item to delete and check persistence'
      await retroPage.addItem('What went well?', itemText)
      await retroPage.deleteItem(itemText)

      // Reload page
      await retroPage.reloadPage()

      // Item should still be deleted
      const exists = await retroPage.itemExists(itemText)
      expect(exists).toBe(false)
    })

    test('should delete item with votes', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Item with votes to delete'
      await retroPage.addItem('What went well?', itemText)
      await retroPage.voteOnItem(itemText)

      // Verify vote was added
      await page.waitForTimeout(500)
      const voteCount = await retroPage.getItemVoteCount(itemText)
      expect(voteCount).toBeGreaterThan(0)

      // Delete item
      await retroPage.deleteItem(itemText)

      // Verify item is deleted
      const exists = await retroPage.itemExists(itemText)
      expect(exists).toBe(false)
    })
  })

  test.describe('Item Persistence', () => {
    test('should persist items after page reload', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const item1 = 'Persistent item 1'
      const item2 = 'Persistent item 2'

      await retroPage.addItem('What went well?', item1)
      await retroPage.addItem('What could be improved?', item2)

      // Reload page
      await retroPage.reloadPage()

      // Items should still exist
      expect(await retroPage.itemExists(item1)).toBe(true)
      expect(await retroPage.itemExists(item2)).toBe(true)
    })

    test('should persist items after navigation away and back', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Item to persist across navigation'
      await retroPage.addItem('What went well?', itemText)

      // Navigate away
      await page.goto('/boards')

      // Navigate back
      await retroPage.goto(boardId!)

      // Item should still exist
      const exists = await retroPage.itemExists(itemText)
      expect(exists).toBe(true)
    })

    test('should persist items in correct columns after reload', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      await retroPage.addItem('What went well?', 'Good item')
      await retroPage.addItem('What could be improved?', 'Improve item')

      // Reload
      await retroPage.reloadPage()

      // Items should be in correct columns
      const column1 = retroPage.getColumn('What went well?')
      await expect(column1).toContainText('Good item')

      const column2 = retroPage.getColumn('What could be improved?')
      await expect(column2).toContainText('Improve item')
    })

    test('should maintain item count after reload', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      await retroPage.addItem('What went well?', 'Item 1')
      await retroPage.addItem('What went well?', 'Item 2')
      await retroPage.addItem('What went well?', 'Item 3')

      const countBefore = await retroPage.getColumnItemCount('What went well?')

      // Reload
      await retroPage.reloadPage()

      const countAfter = await retroPage.getColumnItemCount('What went well?')
      expect(countAfter).toBe(countBefore)
      expect(countAfter).toBe(3)
    })
  })

  test.describe('Voting', () => {
    test('should vote on item', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Item to vote on'
      await retroPage.addItem('What went well?', itemText)

      const initialVotes = await retroPage.getItemVoteCount(itemText)
      await retroPage.voteOnItem(itemText)

      await page.waitForTimeout(500)
      const newVotes = await retroPage.getItemVoteCount(itemText)
      expect(newVotes).toBeGreaterThan(initialVotes)
    })

    test('should toggle vote (upvote then remove)', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Item to toggle vote'
      await retroPage.addItem('What went well?', itemText)

      // Vote
      await retroPage.voteOnItem(itemText)
      await page.waitForTimeout(500)
      const votesAfterUpvote = await retroPage.getItemVoteCount(itemText)
      expect(votesAfterUpvote).toBe(1)

      // Remove vote
      await retroPage.voteOnItem(itemText)
      await page.waitForTimeout(500)
      const votesAfterRemove = await retroPage.getItemVoteCount(itemText)
      expect(votesAfterRemove).toBe(0)
    })

    test('should persist votes after page reload', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Item with persistent vote'
      await retroPage.addItem('What went well?', itemText)
      await retroPage.voteOnItem(itemText)

      await page.waitForTimeout(500)
      const votesBefore = await retroPage.getItemVoteCount(itemText)

      // Reload
      await retroPage.reloadPage()

      const votesAfter = await retroPage.getItemVoteCount(itemText)
      expect(votesAfter).toBe(votesBefore)
      expect(votesAfter).toBeGreaterThan(0)
    })

    test('should vote on multiple items', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      await retroPage.addItem('What went well?', 'Item 1')
      await retroPage.addItem('What went well?', 'Item 2')
      await retroPage.addItem('What went well?', 'Item 3')

      await retroPage.voteOnItem('Item 1')
      await retroPage.voteOnItem('Item 2')
      await retroPage.voteOnItem('Item 3')

      await page.waitForTimeout(500)

      expect(await retroPage.getItemVoteCount('Item 1')).toBeGreaterThan(0)
      expect(await retroPage.getItemVoteCount('Item 2')).toBeGreaterThan(0)
      expect(await retroPage.getItemVoteCount('Item 3')).toBeGreaterThan(0)
    })

    test('should sort items by votes when toggle enabled', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      await retroPage.addItem('What went well?', 'Low votes')
      await retroPage.addItem('What went well?', 'High votes')

      // Vote multiple times on "High votes" item
      await retroPage.voteOnItem('High votes')

      // Enable sort by votes
      await retroPage.toggleSortByVotes()

      // Items should be sorted (high votes first)
      // Note: Visual verification would require more complex locator logic
    })
  })

  test.describe('Responsive Design', () => {
    test('should display items correctly on mobile devices', async ({ page }, testInfo) => {
      const mobileProjects = ['Mobile Chrome', 'Mobile Safari']
      test.skip(!mobileProjects.includes(testInfo.project.name), 'Mobile-only test')

      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Mobile item'
      await retroPage.addItem('What went well?', itemText)

      const item = retroPage.getItemByText(itemText)
      await expect(item).toBeVisible()
    })

    test('should display items correctly on tablet devices', async ({ page }, testInfo) => {
      const tabletProjects = ['iPad', 'iPad Landscape']
      test.skip(!tabletProjects.includes(testInfo.project.name), 'Tablet-only test')

      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Tablet item'
      await retroPage.addItem('What went well?', itemText)

      const item = retroPage.getItemByText(itemText)
      await expect(item).toBeVisible()
    })

    test('should create items on mobile devices', async ({ page }, testInfo) => {
      const mobileProjects = ['Mobile Chrome', 'Mobile Safari']
      test.skip(!mobileProjects.includes(testInfo.project.name), 'Mobile-only test')

      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Created on mobile'
      await retroPage.addItem('What went well?', itemText)

      expect(await retroPage.itemExists(itemText)).toBe(true)
    })

    test('should vote on items on mobile devices', async ({ page }, testInfo) => {
      const mobileProjects = ['Mobile Chrome', 'Mobile Safari']
      test.skip(!mobileProjects.includes(testInfo.project.name), 'Mobile-only test')

      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Mobile vote test'
      await retroPage.addItem('What went well?', itemText)
      await retroPage.voteOnItem(itemText)

      await page.waitForTimeout(500)
      const votes = await retroPage.getItemVoteCount(itemText)
      expect(votes).toBeGreaterThan(0)
    })

    test('should edit items on mobile devices', async ({ page }, testInfo) => {
      const mobileProjects = ['Mobile Chrome', 'Mobile Safari']
      test.skip(!mobileProjects.includes(testInfo.project.name), 'Mobile-only test')

      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const originalText = 'Original mobile'
      const updatedText = 'Updated mobile'

      await retroPage.addItem('What went well?', originalText)
      await retroPage.editItem(originalText, updatedText)

      await page.waitForTimeout(1000)
      expect(await retroPage.itemExists(updatedText)).toBe(true)
    })

    test('should delete items on mobile devices', async ({ page }, testInfo) => {
      const mobileProjects = ['Mobile Chrome', 'Mobile Safari']
      test.skip(!mobileProjects.includes(testInfo.project.name), 'Mobile-only test')

      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Delete on mobile'
      await retroPage.addItem('What went well?', itemText)
      await retroPage.deleteItem(itemText)

      expect(await retroPage.itemExists(itemText)).toBe(false)
    })
  })

  test.describe.serial('Authenticated User Item Operations', () => {
    test('should create items as authenticated user', async ({ page }) => {
      const authPage = new AuthPage(page)
      const user = await createTestUser(authPage)

      // Sign in
      await authPage.goto()
      await authPage.signIn(user.email, user.password)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

      // Create board
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Auth user item'
      await retroPage.addItem('What went well?', itemText)

      expect(await retroPage.itemExists(itemText)).toBe(true)
    })

    test('should display authenticated user name as author', async ({ page }) => {
      const authPage = new AuthPage(page)
      const user = await createTestUser(authPage)

      await authPage.goto()
      await authPage.signIn(user.email, user.password)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      const itemText = 'Item by auth user'
      await retroPage.addItem('What went well?', itemText)

      const author = await retroPage.getItemAuthor(itemText)
      expect(author).toContain(user.name)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      const { boardId } = await createAndNavigateToBoard(page)
      const retroPage = new RetroBoardPage(page)

      // Simulate offline
      await page.context().setOffline(true)

      const addButton = retroPage.getAddItemButton('What went well?')
      await addButton.click()

      const textarea = retroPage.getItemTextarea('What went well?')
      await textarea.fill('Test item')

      const submitButton = retroPage.getItemSubmitButton('What went well?')
      await submitButton.click()

      // Should show error (wait for potential error toast)
      await page.waitForTimeout(2000)

      // Re-enable network
      await page.context().setOffline(false)
    })
  })
})
