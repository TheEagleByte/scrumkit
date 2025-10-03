import { test, expect } from '@playwright/test'
import { AuthPage } from '../../pages/AuthPage'

/**
 * Sign Up Flow E2E Tests
 *
 * Comprehensive tests for user sign-up functionality including:
 * - Form validation
 * - Success cases
 * - Error handling
 * - UI/UX across desktop, mobile, and tablet devices
 */
test.describe('Sign Up Flow', () => {
  test.describe('Form Display', () => {
    test('should display signup form when Sign Up tab is clicked', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      await expect(authPage.nameInput).toBeVisible()
      await expect(authPage.emailInput).toBeVisible()
      await expect(authPage.passwordInput).toBeVisible()
      await expect(authPage.confirmPasswordInput).toBeVisible()
      await expect(authPage.signUpButton).toBeVisible()
    })

    test('should show correct welcome message', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      await expect(page.getByText('Welcome')).toBeVisible()
      await expect(
        page.getByText('Sign in to your account or create a new one')
      ).toBeVisible()
    })

    test('should display Create Account button with correct text', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      await expect(authPage.signUpButton).toHaveText('Create Account')
    })

    test('should enforce minimum password length', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      await expect(authPage.passwordInput).toHaveAttribute('minlength', '6')
    })
  })

  test.describe('Form Validation', () => {
    test('should require all fields to be filled', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      // Check that all fields have required attribute
      await expect(authPage.nameInput).toHaveAttribute('required', '')
      await expect(authPage.emailInput).toHaveAttribute('required', '')
      await expect(authPage.passwordInput).toHaveAttribute('required', '')
      await expect(authPage.confirmPasswordInput).toHaveAttribute('required', '')
    })

    test('should validate email format', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      await expect(authPage.emailInput).toHaveAttribute('type', 'email')
    })

    test('should enforce minimum password length', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      await expect(authPage.passwordInput).toHaveAttribute('minlength', '6')
    })

    test('should show error for invalid email format', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      await authPage.nameInput.fill('Test User')
      await authPage.emailInput.fill('invalid-email')
      await authPage.passwordInput.fill('password123')
      await authPage.confirmPasswordInput.fill('password123')

      // HTML5 validation should prevent submission
      const isValid = await authPage.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)
      expect(isValid).toBe(false)
    })

    test('should show error when passwords do not match', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      await authPage.nameInput.fill('Test User')
      await authPage.emailInput.fill('test@example.com')
      await authPage.passwordInput.fill('password123')
      await authPage.confirmPasswordInput.fill('differentpassword')
      await authPage.signUpButton.click()

      // Should show inline error for password mismatch
      await expect(page.getByText('Passwords do not match')).toBeVisible()
    })
  })

  test.describe('Success Cases', () => {
    test('should successfully sign up with valid credentials', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      const uniqueEmail = `test-${Date.now()}@example.com`
      await authPage.signUp('Test User', uniqueEmail, 'password123')

      // Should show success toast
      await expect(
        page.getByText('Account created! Please check your email to verify your account.')
      ).toBeVisible({ timeout: 10000 })
    })
  })



  test.describe('Integration & UI/UX', () => {
    test('should toggle between Sign In and Sign Up tabs', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      // Start on Sign In tab
      await expect(authPage.emailInput).toBeVisible()
      await expect(authPage.nameInput).not.toBeVisible()
      await expect(authPage.confirmPasswordInput).not.toBeVisible()

      // Switch to Sign Up
      await authPage.switchToSignUp()
      await expect(authPage.nameInput).toBeVisible()
      await expect(authPage.confirmPasswordInput).toBeVisible()

      // Switch back to Sign In
      await authPage.switchToSignIn()
      await expect(authPage.nameInput).not.toBeVisible()
      await expect(authPage.confirmPasswordInput).not.toBeVisible()
      await expect(authPage.emailInput).toBeVisible()
    })

    test('should preserve email when switching tabs', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      // Fill email on Sign In tab
      await authPage.emailInput.fill('test@example.com')

      // Switch to Sign Up
      await authPage.switchToSignUp()
      await authPage.nameInput.fill('Test User')

      // Email should be preserved
      const emailValue = await authPage.emailInput.inputValue()
      expect(emailValue).toBe('test@example.com')
    })
  })

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile devices', async ({ page }, testInfo) => {
      // Only run this on mobile projects
      const mobileProjects = ['Mobile Chrome', 'Mobile Safari']
      test.skip(
        !mobileProjects.includes(testInfo.project.name),
        'Mobile-only test'
      )

      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      // All form elements should be visible and accessible on mobile
      await expect(authPage.nameInput).toBeVisible()
      await expect(authPage.emailInput).toBeVisible()
      await expect(authPage.passwordInput).toBeVisible()
      await expect(authPage.confirmPasswordInput).toBeVisible()
      await expect(authPage.signUpButton).toBeVisible()
    })

    test('should display correctly on tablet devices', async ({ page }, testInfo) => {
      // Only run this on tablet/iPad projects
      const tabletProjects = ['iPad', 'iPad Landscape']
      test.skip(
        !tabletProjects.includes(testInfo.project.name),
        'Tablet-only test'
      )

      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      // All form elements should be visible and accessible on tablet
      await expect(authPage.nameInput).toBeVisible()
      await expect(authPage.emailInput).toBeVisible()
      await expect(authPage.passwordInput).toBeVisible()
      await expect(authPage.confirmPasswordInput).toBeVisible()
      await expect(authPage.signUpButton).toBeVisible()
    })
  })
})
