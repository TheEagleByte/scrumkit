/// <reference types="cypress" />

/**
 * E2E tests for unverified user login functionality
 *
 * These tests verify that users can login immediately after signup
 * without email verification, and that they see appropriate banners
 * reminding them to verify their email.
 */

describe('Unverified User Login', () => {
  const timestamp = Date.now()
  const testEmail = `unverified-test-${timestamp}@scrumkit.dev`
  const testPassword = 'Test123!@#'
  const testFullName = 'Unverified Test User'

  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Signup and Login Flow', () => {
    it('should allow users to sign up without email verification', () => {
      // Sign up new user
      cy.visit('/auth')
      cy.contains('Sign Up').click()
      cy.get('input[id="signup-name"]').type(testFullName)
      cy.get('input[id="signup-email"]').type(testEmail)
      cy.get('input[id="signup-password"]').type(testPassword)
      cy.get('button[type="submit"]').click()

      // Should see signup confirmation toast
      cy.contains('Account created').should('be.visible')
      cy.contains('check your email').should('be.visible')
    })

    it('should allow login with unverified email immediately after signup', () => {
      // Try to login with the account we just created (unverified)
      cy.visit('/auth')
      cy.contains('Sign In').click()
      cy.get('input[id="signin-email"]').type(testEmail)
      cy.get('input[id="signin-password"]').type(testPassword)
      cy.get('button[type="submit"]').click()

      // Should successfully login and redirect away from auth page
      cy.url().should('not.include', '/auth')

      // Should be on dashboard or other protected page
      cy.url().should('match', /\/(dashboard|boards)/)
    })
  })

  describe('Email Verification Banner', () => {
    beforeEach(() => {
      // Login as unverified user for these tests
      cy.visit('/auth')
      cy.contains('Sign In').click()
      cy.get('input[id="signin-email"]').type(testEmail)
      cy.get('input[id="signin-password"]').type(testPassword)
      cy.get('button[type="submit"]').click()
      cy.url().should('not.include', '/auth')
    })

    it('should show verification banner for unverified users on dashboard', () => {
      cy.visit('/dashboard')

      // Verification banner should be visible
      cy.contains('Verify your email address').should('be.visible')
      cy.contains('Resend verification email').should('be.visible')

      // Should show the user's email address
      cy.contains(testEmail).should('be.visible')
    })

    it('should show verification banner for unverified users on boards page', () => {
      cy.visit('/boards')

      // Verification banner should be visible
      cy.contains('Verify your email address').should('be.visible')
      cy.contains('Resend verification email').should('be.visible')
    })

    it('should allow dismissing the banner', () => {
      cy.visit('/dashboard')

      // Banner should be visible
      cy.contains('Verify your email address').should('be.visible')

      // Dismiss the banner
      cy.contains('Dismiss').click()

      // Banner should be hidden
      cy.contains('Verify your email address').should('not.exist')
    })

    it('should show banner again after page refresh when dismissed', () => {
      cy.visit('/dashboard')

      // Dismiss the banner
      cy.contains('Dismiss').click()
      cy.contains('Verify your email address').should('not.exist')

      // Reload the page
      cy.reload()

      // Banner should reappear
      cy.contains('Verify your email address').should('be.visible')
    })

    it('should allow resending verification email', () => {
      cy.visit('/dashboard')

      // Click resend button
      cy.contains('Resend verification email').click()

      // Should show success toast
      cy.contains('Verification email sent', { timeout: 10000 }).should('be.visible')
    })

    it('should handle rate limiting on resend gracefully', () => {
      cy.visit('/dashboard')

      // Click resend button multiple times quickly
      cy.contains('Resend verification email').click()
      cy.wait(500)
      cy.contains('Resend verification email').click()

      // Should show rate limit message eventually
      // Note: First click might succeed, second should trigger rate limit
      cy.contains(/Verification email sent|Too many requests|wait a moment/i, { timeout: 10000 }).should('be.visible')
    })
  })

  describe('Verified User Experience', () => {
    it('should not show verification banner for verified users', () => {
      // Login with the pre-configured verified test user
      cy.fixture('test-users.json').then((users) => {
        const { email, password } = users.validUser

        cy.visit('/auth')
        cy.contains('Sign In').click()
        cy.get('input[id="signin-email"]').type(email)
        cy.get('input[id="signin-password"]').type(password)
        cy.get('button[type="submit"]').click()

        cy.url().should('not.include', '/auth')

        // Visit dashboard
        cy.visit('/dashboard')

        // Verification banner should NOT be visible
        cy.contains('Verify your email address').should('not.exist')
        cy.contains('Resend verification email').should('not.exist')
      })
    })
  })

  describe('User Can Access Features', () => {
    beforeEach(() => {
      // Login as unverified user
      cy.visit('/auth')
      cy.contains('Sign In').click()
      cy.get('input[id="signin-email"]').type(testEmail)
      cy.get('input[id="signin-password"]').type(testPassword)
      cy.get('button[type="submit"]').click()
      cy.url().should('not.include', '/auth')
    })

    it('should allow unverified users to access boards page', () => {
      cy.visit('/boards')

      // Page should load successfully
      cy.contains('My Boards').should('be.visible')
    })

    it('should allow unverified users to access dashboard', () => {
      cy.visit('/dashboard')

      // Page should load successfully
      cy.contains('ScrumKit').should('be.visible')
    })

    it('should maintain session across page navigation', () => {
      // Navigate between pages
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')

      cy.visit('/boards')
      cy.url().should('include', '/boards')

      // Should still be logged in (banner still visible)
      cy.contains('Verify your email address').should('be.visible')
    })
  })

  after(() => {
    // Cleanup: Sign out after all tests
    cy.visit('/dashboard')
    cy.get('[data-testid="user-menu"]').click()
    cy.contains('Sign out').click()
  })
})
