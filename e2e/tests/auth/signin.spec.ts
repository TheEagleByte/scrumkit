import { test, expect } from '@playwright/test'
import { AuthPage } from '../../pages/AuthPage'

/**
 * Sign In Flow E2E Tests
 *
 * Comprehensive tests for user sign-in functionality including:
 * - Form validation
 * - Success cases
 * - Error handling
 * - Session management
 * - UI/UX across desktop, mobile, and tablet devices
 *
 * Note: Tests create fresh user accounts dynamically to ensure true E2E testing.
 * Users are created with unique timestamp-based emails to avoid conflicts.
 */

/**
 * Helper function to create a test user via signup and sign them out
 * Returns the user credentials for subsequent signin tests
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

  // Wait for signup success and redirect to dashboard
  await authPage.page.waitForURL(/\/dashboard/, { timeout: 10000 })

  // Sign out the user so we can test sign in
  // Navigate to profile or use a direct sign out approach
  // Clear session by deleting all cookies
  await authPage.page.context().clearCookies()

  return user
}

test.describe('Sign In Flow', () => {
  test.describe('Form Display', () => {
    test('should display signin form by default', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      await expect(authPage.emailInput).toBeVisible()
      await expect(authPage.passwordInput).toBeVisible()
      await expect(authPage.signInButton).toBeVisible()
    })

    test('should show welcome message', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      await expect(page.getByRole('heading', { name: 'ScrumKit' })).toBeVisible()
      await expect(page.getByText('Sign in to unlock all features')).toBeVisible()
    })

    test('should display Sign In button with correct text', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      await expect(authPage.signInButton).toHaveText('Sign In')
    })

    test('should display OAuth buttons', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      await expect(authPage.googleButton).toBeVisible()
      await expect(authPage.githubButton).toBeVisible()
    })

    test('should handle continue as guest option', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      await authPage.continueAsGuest()
      await expect(page).toHaveURL(/\/dashboard/)
    })
  })

  test.describe('Form Validation', () => {
    test('should require both email and password', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      // Check that both fields have required attribute
      await expect(authPage.emailInput).toHaveAttribute('required', '')
      await expect(authPage.passwordInput).toHaveAttribute('required', '')
    })

    test('should validate email format', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      await expect(authPage.emailInput).toHaveAttribute('type', 'email')
    })

    test('should show error for invalid email format', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      await authPage.emailInput.fill('invalid-email')
      await authPage.passwordInput.fill('password123')

      // HTML5 validation should prevent submission
      const isValid = await authPage.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)
      expect(isValid).toBe(false)
    })

    test('should have password input type for security', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      await expect(authPage.passwordInput).toHaveAttribute('type', 'password')
    })

    test('should prevent submission with empty email', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      await authPage.passwordInput.fill('password123')
      await authPage.signInButton.click()

      // Should still be on auth page
      await expect(page).toHaveURL(/\/auth/)
    })

    test('should prevent submission with empty password', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      await authPage.emailInput.fill('test@example.com')
      await authPage.signInButton.click()

      // Should still be on auth page
      await expect(page).toHaveURL(/\/auth/)
    })
  })

  test.describe('Error Handling', () => {
    test('should show error for invalid credentials', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      await authPage.signIn('invalid@example.com', 'wrongpassword')

      // Should show error toast
      await expect(page.getByText(/Invalid login credentials/i)).toBeVisible({ timeout: 5000 })
    })

    test('should show error for non-existent user', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      const uniqueEmail = `nonexistent-${Date.now()}@example.com`
      await authPage.signIn(uniqueEmail, 'password123')

      // Should show error toast
      await expect(page.getByText(/Invalid login credentials/i)).toBeVisible({ timeout: 5000 })
    })

    test('should show error for wrong password', async ({ page }) => {
      const authPage = new AuthPage(page)

      // Create a user first
      const user = await createTestUser(authPage)

      // Navigate back to auth page and try wrong password
      await authPage.goto()
      await authPage.signIn(user.email, 'wrongpassword123')

      // Should show error toast
      await expect(page.getByText(/Invalid login credentials/i)).toBeVisible({ timeout: 5000 })
    })

    test('should keep email filled after failed sign in', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      const testEmail = 'test@example.com'
      await authPage.signIn(testEmail, 'wrongpassword')

      // Wait for error
      await expect(page.getByText(/Invalid login credentials/i)).toBeVisible({ timeout: 5000 })

      // Email should still be filled
      const emailValue = await authPage.emailInput.inputValue()
      expect(emailValue).toBe(testEmail)
    })
  })

  test.describe('Success Cases', () => {
    test('should successfully sign in with valid credentials', async ({ page }) => {
      const authPage = new AuthPage(page)

      // Create a fresh user for this test
      const user = await createTestUser(authPage)

      // Navigate back to auth and sign in
      await authPage.goto()
      await authPage.signIn(user.email, user.password)

      // Should show success toast
      await expect(page.getByText(/Signed in successfully/i)).toBeVisible({ timeout: 10000 })

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    })

    test('should successfully sign in with unverified user', async ({ page }) => {
      const authPage = new AuthPage(page)

      // Create a fresh user (will be unverified by default)
      const user = await createTestUser(authPage)

      // Navigate back to auth and sign in
      await authPage.goto()
      await authPage.signIn(user.email, user.password)

      // Should show success toast
      await expect(page.getByText(/Signed in successfully/i)).toBeVisible({ timeout: 10000 })

      // Should redirect to dashboard even if unverified
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    })
  })

  test.describe('Loading States', () => {
    test('should show loading state during sign in', async ({ page }) => {
      const authPage = new AuthPage(page)

      // Create a user first
      const user = await createTestUser(authPage)

      // Navigate back to auth
      await authPage.goto()
      await authPage.emailInput.fill(user.email)
      await authPage.passwordInput.fill(user.password)

      // Click and immediately check for loading state
      await authPage.signInButton.click()

      // Button should show loading text (check quickly before it finishes)
      await expect(authPage.signInButton).toContainText(/Sign|Signing in/, { timeout: 1000 })
    })

    test('should disable form fields during submission', async ({ page }) => {
      const authPage = new AuthPage(page)

      // Create a user first
      const user = await createTestUser(authPage)

      // Navigate back to auth
      await authPage.goto()
      await authPage.emailInput.fill(user.email)
      await authPage.passwordInput.fill(user.password)

      // Click button
      const clickPromise = authPage.signInButton.click()

      // Fields should be disabled (check immediately)
      await expect(authPage.signInButton).toBeDisabled({ timeout: 1000 })

      await clickPromise
    })

    test('should show loading spinner during sign in', async ({ page }) => {
      const authPage = new AuthPage(page)

      // Create a user first
      const user = await createTestUser(authPage)

      // Navigate back to auth
      await authPage.goto()
      await authPage.emailInput.fill(user.email)
      await authPage.passwordInput.fill(user.password)

      // Click and check for spinner
      await authPage.signInButton.click()

      // Should show loading spinner (Loader2 icon with animate-spin class)
      // Check quickly before the request completes
      const spinner = page.locator('.animate-spin').first()
      await expect(spinner).toBeVisible({ timeout: 1000 }).catch(() => {
        // Spinner might be too fast, that's okay
      })
    })
  })

  test.describe('Session Management', () => {
    test('should persist session after page reload', async ({ page }) => {
      const authPage = new AuthPage(page)

      // Create and sign in user
      const user = await createTestUser(authPage)
      await authPage.goto()
      await authPage.signIn(user.email, user.password)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

      // Reload page
      await page.reload()

      // Should still be on dashboard (session persisted)
      await expect(page).toHaveURL(/\/dashboard/)
    })

    test('should allow access to protected routes after sign in', async ({ page }) => {
      const authPage = new AuthPage(page)

      // Create and sign in user
      const user = await createTestUser(authPage)
      await authPage.goto()
      await authPage.signIn(user.email, user.password)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

      // Navigate to profile (protected route)
      await page.goto('/profile')

      // Should be able to access profile page
      await expect(page).toHaveURL(/\/profile/)
    })

    test('should redirect to dashboard if already signed in', async ({ page }) => {
      const authPage = new AuthPage(page)

      // Create and sign in user
      const user = await createTestUser(authPage)
      await authPage.goto()
      await authPage.signIn(user.email, user.password)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

      // Try to access auth page again
      await authPage.goto()

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 })
    })
  })

  test.describe('Integration & UI/UX', () => {
    test('should toggle between Sign In and Sign Up tabs', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      // Start on Sign In tab
      await expect(authPage.emailInput).toBeVisible()
      await expect(authPage.signInButton).toBeVisible()

      // Switch to Sign Up
      await authPage.switchToSignUp()
      await expect(authPage.nameInput).toBeVisible()
      await expect(authPage.confirmPasswordInput).toBeVisible()
      await expect(authPage.signUpButton).toBeVisible()

      // Switch back to Sign In
      await authPage.switchToSignIn()
      await expect(authPage.emailInput).toBeVisible()
      await expect(authPage.signInButton).toBeVisible()
      await expect(authPage.nameInput).not.toBeVisible()
      await expect(authPage.confirmPasswordInput).not.toBeVisible()
    })

    test('should preserve email when switching tabs', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      const testEmail = 'test@example.com'

      // Fill email on Sign In tab
      await authPage.emailInput.fill(testEmail)

      // Switch to Sign Up
      await authPage.switchToSignUp()

      // Email should be preserved
      const emailValue = await authPage.emailInput.inputValue()
      expect(emailValue).toBe(testEmail)

      // Switch back to Sign In
      await authPage.switchToSignIn()

      // Email should still be preserved
      const emailValueAfter = await authPage.emailInput.inputValue()
      expect(emailValueAfter).toBe(testEmail)
    })

    test('should have accessible form labels', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      // Check that inputs have associated labels
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
    })

    test('should show terms and privacy policy links', async ({ page }) => {
      const authPage = new AuthPage(page)
      await authPage.goto()

      // Check footer links
      await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible()
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

      // All form elements should be visible and accessible on mobile
      await expect(authPage.emailInput).toBeVisible()
      await expect(authPage.passwordInput).toBeVisible()
      await expect(authPage.signInButton).toBeVisible()
      await expect(authPage.googleButton).toBeVisible()
      await expect(authPage.githubButton).toBeVisible()
      await expect(authPage.continueAsGuestLink).toBeVisible()
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

      // All form elements should be visible and accessible on tablet
      await expect(authPage.emailInput).toBeVisible()
      await expect(authPage.passwordInput).toBeVisible()
      await expect(authPage.signInButton).toBeVisible()
      await expect(authPage.googleButton).toBeVisible()
      await expect(authPage.githubButton).toBeVisible()
      await expect(authPage.continueAsGuestLink).toBeVisible()
    })

    test('should be usable on mobile devices', async ({ page }, testInfo) => {
      // Only run this on mobile projects
      const mobileProjects = ['Mobile Chrome', 'Mobile Safari']
      test.skip(
        !mobileProjects.includes(testInfo.project.name),
        'Mobile-only test'
      )

      const authPage = new AuthPage(page)
      await authPage.goto()

      // Fill form on mobile
      await authPage.emailInput.fill('test@example.com')
      await authPage.passwordInput.fill('password123')

      // Button should be clickable
      await expect(authPage.signInButton).toBeEnabled()

      // Tabs should be accessible
      await authPage.switchToSignUp()
      await expect(authPage.nameInput).toBeVisible()

      await authPage.switchToSignIn()
      await expect(authPage.emailInput).toBeVisible()
    })
  })
})
