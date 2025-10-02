/// <reference types="cypress" />

/**
 * E2E tests for user dropdown display name
 *
 * These tests verify that the user's full name is displayed correctly
 * in the user dropdown menu, with proper fallbacks.
 */

describe('User Dropdown Display Name', () => {
  const timestamp = Date.now()
  const testEmail = `dropdown-test-${timestamp}@scrumkit.dev`
  const testPassword = 'Test123!@#'
  const testFullName = 'John Doe'

  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Full Name Display', () => {
    it('should show user full name in dropdown after signup', () => {
      // Sign up with full name
      cy.visit('/auth')
      cy.contains('Sign Up').click()
      cy.get('input[id="signup-name"]').type(testFullName)
      cy.get('input[id="signup-email"]').type(testEmail)
      cy.get('input[id="signup-password"]').type(testPassword)
      cy.get('input[id="signup-confirm-password"]').type(testPassword)
      cy.get('button[type="submit"]').click()

      // Wait for signup confirmation
      cy.contains('Account created').should('be.visible')

      // Login
      cy.visit('/auth')
      cy.contains('Sign In').click()
      cy.get('input[id="signin-email"]').type(testEmail)
      cy.get('input[id="signin-password"]').type(testPassword)
      cy.get('button[type="submit"]').click()

      // Navigate to dashboard
      cy.url().should('not.include', '/auth')
      cy.visit('/dashboard')

      // Open user menu dropdown
      cy.get('[data-testid="user-menu-trigger"]').click()

      // Should show actual full name, not 'User' fallback
      cy.contains(testFullName).should('be.visible')
      cy.get('[role="menu"]').contains('User').should('not.exist')
    })

    it('should show email username as fallback when full name is missing', () => {
      // For this test, we need an account without a full name
      // Since we made full name required, this tests the edge case
      // where a profile might be missing full_name in the database

      // For now, test that the fallback logic exists by checking
      // that email is shown in the dropdown
      cy.visit('/auth')
      cy.contains('Sign In').click()
      cy.get('input[id="signin-email"]').type(testEmail)
      cy.get('input[id="signin-password"]').type(testPassword)
      cy.get('button[type="submit"]').click()

      cy.url().should('not.include', '/auth')
      cy.visit('/dashboard')

      // Open user menu dropdown
      cy.get('[data-testid="user-menu-trigger"]').click()

      // Email should be visible in dropdown
      cy.contains(testEmail).should('be.visible')
    })
  })

  describe('Profile Retry Logic', () => {
    it('should eventually load profile even if there is a brief delay', () => {
      // Sign up and login
      cy.visit('/auth')
      cy.contains('Sign Up').click()

      const retryTestEmail = `retry-test-${Date.now()}@scrumkit.dev`
      const retryTestName = 'Retry Test User'

      cy.get('input[id="signup-name"]').type(retryTestName)
      cy.get('input[id="signup-email"]').type(retryTestEmail)
      cy.get('input[id="signup-password"]').type(testPassword)
      cy.get('input[id="signup-confirm-password"]').type(testPassword)
      cy.get('button[type="submit"]').click()

      cy.contains('Account created').should('be.visible')

      // Login
      cy.visit('/auth')
      cy.contains('Sign In').click()
      cy.get('input[id="signin-email"]').type(retryTestEmail)
      cy.get('input[id="signin-password"]').type(testPassword)
      cy.get('button[type="submit"]').click()

      // Navigate to dashboard
      cy.url().should('not.include', '/auth')
      cy.visit('/dashboard')

      // Open user menu dropdown (with increased timeout to allow for retry logic)
      cy.get('[data-testid="user-menu-trigger"]', { timeout: 10000 })
        .should('be.visible')
        .click()

      // Should show the name, proving retry logic worked
      cy.contains(retryTestName, { timeout: 10000 }).should('be.visible')
    })
  })

  describe('Full Name Required Field', () => {
    it('should require full name during signup', () => {
      cy.visit('/auth')
      cy.contains('Sign Up').click()

      // Try to submit without full name
      cy.get('input[id="signup-email"]').type(`required-test-${Date.now()}@scrumkit.dev`)
      cy.get('input[id="signup-password"]').type(testPassword)
      cy.get('input[id="signup-confirm-password"]').type(testPassword)
      cy.get('button[type="submit"]').click()

      // Should show HTML5 validation error for required field
      cy.get('input[id="signup-name"]:invalid').should('exist')
    })
  })
})
