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
      await expect(authPage.signUpButton).toBeVisible()
    })

    test('should show correct welcome message', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      await expect(page.getByRole('heading', { name: 'Welcome to ScrumKit' })).toBeVisible()
      await expect(
        page.getByText('Sign in to save your boards and collaborate with your team')
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

    test('should show error when name is empty', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      await authPage.emailInput.fill('test@example.com')
      await authPage.passwordInput.fill('password123')
      await authPage.signUpButton.click()

      await expect(page.getByText('Name required')).toBeVisible()
      await expect(page.getByText('Please enter your full name')).toBeVisible()
    })

    test('should show error when password is too short', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      await authPage.nameInput.fill('Test User')
      await authPage.emailInput.fill('test@example.com')
      await authPage.passwordInput.fill('12345') // Only 5 characters
      await authPage.signUpButton.click()

      await expect(page.getByText('Weak password')).toBeVisible()
      await expect(page.getByText('Password must be at least 6 characters')).toBeVisible()
    })

    test('should show error when name is only whitespace', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      await authPage.nameInput.fill('   ')
      await authPage.emailInput.fill('test@example.com')
      await authPage.passwordInput.fill('password123')
      await authPage.signUpButton.click()

      await expect(page.getByText('Name required')).toBeVisible()
    })
  })

  test.describe('Success Cases', () => {
    test('should successfully sign up with valid credentials', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      const uniqueEmail = `test-${Date.now()}@example.com`
      await authPage.signUp('Test User', uniqueEmail, 'password123')

      // Should show verification message
      await expect(page.getByText('Check your email')).toBeVisible({ timeout: 10000 })
    })

    test('should display email verification message after successful signup', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      const uniqueEmail = `verify-test-${Date.now()}@example.com`
      await authPage.signUp('Verification Test', uniqueEmail, 'password123')

      await expect(page.getByText('Check your email')).toBeVisible({ timeout: 10000 })
      await expect(
        page.getByText(`We've sent a verification link to ${uniqueEmail}`)
      ).toBeVisible()
      await expect(
        page.getByText('Click the link in the email to activate your account.')
      ).toBeVisible()
    })

    test('should show helpful tips in verification message', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      const uniqueEmail = `tips-test-${Date.now()}@example.com`
      await authPage.signUp('Tips Test', uniqueEmail, 'password123')

      await expect(page.getByText('Check your email')).toBeVisible({ timeout: 10000 })
      await expect(page.getByText("Didn't receive the email?")).toBeVisible()
      await expect(page.getByText('Check your spam folder')).toBeVisible()
      await expect(page.getByText('Wait a few minutes and try again')).toBeVisible()
      await expect(page.getByText('Make sure you entered the correct email')).toBeVisible()
    })

    test('should allow trying a different email', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      const uniqueEmail = `different-email-${Date.now()}@example.com`
      await authPage.signUp('Different Email Test', uniqueEmail, 'password123')

      await expect(page.getByText('Check your email')).toBeVisible({ timeout: 10000 })

      const tryDifferentButton = page.getByRole('button', { name: 'Try a different email' })
      await expect(tryDifferentButton).toBeVisible()
      await tryDifferentButton.click()

      // Should return to signup form
      await expect(authPage.nameInput).toBeVisible()
      await expect(authPage.emailInput).toBeVisible()
      await expect(authPage.signUpButton).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('should show error for duplicate email', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      // Use a known test user email
      await authPage.signUp('Test User', 'test.user@example.com', 'password123')

      // Should show signup failed error
      await expect(page.getByText('Signup failed')).toBeVisible({ timeout: 10000 })
    })

    test('should show error for invalid email format', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      await authPage.nameInput.fill('Test User')
      await authPage.emailInput.fill('invalid-email')
      await authPage.passwordInput.fill('password123')

      // HTML5 validation should prevent submission
      const isValid = await authPage.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)
      expect(isValid).toBe(false)
    })
  })

  test.describe('Loading States', () => {
    test('should show loading state during signup', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      const uniqueEmail = `loading-test-${Date.now()}@example.com`
      await authPage.nameInput.fill('Loading Test')
      await authPage.emailInput.fill(uniqueEmail)
      await authPage.passwordInput.fill('password123')

      // Start signup
      await authPage.signUpButton.click()

      // Should show loading text
      const loadingText = page.getByText('Creating account...')
      await expect(loadingText).toBeVisible({ timeout: 2000 })
    })

    test('should disable fields during signup', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      const uniqueEmail = `disable-test-${Date.now()}@example.com`
      await authPage.nameInput.fill('Disable Test')
      await authPage.emailInput.fill(uniqueEmail)
      await authPage.passwordInput.fill('password123')

      await authPage.signUpButton.click()

      // Button should be disabled during submission
      await expect(authPage.signUpButton).toBeDisabled()
    })
  })

  test.describe('Integration & UI/UX', () => {
    test('should toggle between Sign In and Sign Up tabs', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      // Start on Sign In tab
      await expect(authPage.emailInput).toBeVisible()
      await expect(authPage.nameInput).not.toBeVisible()

      // Switch to Sign Up
      await authPage.switchToSignUp()
      await expect(authPage.nameInput).toBeVisible()

      // Switch back to Sign In
      await authPage.switchToSignIn()
      await expect(authPage.nameInput).not.toBeVisible()
      await expect(authPage.emailInput).toBeVisible()
    })

    test('should preserve form state when switching tabs', async ({ page }) => {
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

    test('should show OAuth buttons', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      await expect(authPage.googleButton).toBeVisible()
      await expect(authPage.githubButton).toBeVisible()
    })

    test('should show continue as guest option', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()
      await authPage.switchToSignUp()

      await expect(authPage.continueAsGuestLink).toBeVisible()
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
      await expect(authPage.signUpButton).toBeVisible()
    })
  })
})
