import { test, expect } from '@playwright/test'
import { AuthPage } from '../../pages/AuthPage'

/**
 * Sign In Flow Tests
 *
 * Tests the authentication sign-in functionality including form validation,
 * error handling, and successful authentication flow.
 */
test.describe('Sign In Flow', () => {
  test('should display signin form by default', async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.goto()

    await expect(authPage.emailInput).toBeVisible()
    await expect(authPage.passwordInput).toBeVisible()
    await expect(authPage.signInButton).toBeVisible()
  })

  test('should require both email and password', async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.goto()

    await authPage.signInButton.click()

    // Form validation should prevent submission
    await expect(authPage.emailInput).toHaveAttribute('required', '')
  })

  test('should show welcome message', async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.goto()

    await expect(page.getByRole('heading', { name: 'ScrumKit' })).toBeVisible()
    await expect(page.getByText('Sign in to unlock all features')).toBeVisible()
  })

  test('should toggle between signin and signup tabs', async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.goto()

    await expect(authPage.emailInput).toBeVisible()

    await authPage.switchToSignUp()
    await expect(authPage.nameInput).toBeVisible()
    await expect(page.locator('input[id="signin-email"]')).not.toBeVisible()

    await authPage.switchToSignIn()
    await expect(authPage.emailInput).toBeVisible()
  })

  test('should handle continue as guest option', async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.goto()

    await authPage.continueAsGuest()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should display OAuth buttons', async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.goto()

    await expect(authPage.googleButton).toBeVisible()
    await expect(authPage.githubButton).toBeVisible()
  })
})
