describe('Email Verification Flow', () => {
  it('should show verification pending message after signup', () => {
    const email = `test${Date.now()}@example.com`
    cy.visit('/auth')
    cy.contains('Sign Up').click()
    cy.get('input[id="signup-name"]').type('Test User')
    cy.get('input[id="signup-email"]').type(email)
    cy.get('input[id="signup-password"]').type('password123')
    cy.get('button[type="submit"]').click()

    cy.contains('Verify your email').should('be.visible')
    cy.contains('verification link').should('be.visible')
  })

  it('should show verification instructions', () => {
    const email = `test${Date.now()}@example.com`
    cy.visit('/auth')
    cy.contains('Sign Up').click()
    cy.get('input[id="signup-name"]').type('Test User')
    cy.get('input[id="signup-email"]').type(email)
    cy.get('input[id="signup-password"]').type('password123')
    cy.get('button[type="submit"]').click()

    cy.contains('Check your email').should('be.visible')
    cy.contains('We\'ve sent a verification link').should('be.visible')
  })

  it('should show troubleshooting tips', () => {
    const email = `test${Date.now()}@example.com`
    cy.visit('/auth')
    cy.contains('Sign Up').click()
    cy.get('input[id="signup-name"]').type('Test User')
    cy.get('input[id="signup-email"]').type(email)
    cy.get('input[id="signup-password"]').type('password123')
    cy.get('button[type="submit"]').click()

    cy.contains('Didn\'t receive the email').should('be.visible')
    cy.contains('Check your spam folder').should('be.visible')
    cy.contains('Wait a few minutes').should('be.visible')
  })

  it('should allow trying a different email', () => {
    const email = `test${Date.now()}@example.com`
    cy.visit('/auth')
    cy.contains('Sign Up').click()
    cy.get('input[id="signup-name"]').type('Test User')
    cy.get('input[id="signup-email"]').type(email)
    cy.get('input[id="signup-password"]').type('password123')
    cy.get('button[type="submit"]').click()

    cy.contains('Try a different email').click()
    cy.get('input[id="signup-email"]').should('have.value', '')
  })

  it('should navigate to resend verification page', () => {
    cy.visit('/auth/verify-email')
    cy.contains('Verify Your Email').should('be.visible')
    cy.contains('Resend Verification Email').should('be.visible')
  })

  it('should show resend button on verify-email page', () => {
    cy.visit('/auth/verify-email')
    cy.contains('button', 'Resend Verification Email').should('be.visible')
    cy.contains('button', 'Resend Verification Email').should('not.be.disabled')
  })

  it('should show error for invalid confirmation token', () => {
    cy.visit('/auth/confirm?token_hash=invalid-token&type=email')
    cy.contains('failed', { matchCase: false }).should('be.visible')
  })

  it('should provide recovery options on confirmation error', () => {
    cy.visit('/auth/confirm?token_hash=invalid-token&type=email')

    cy.contains('Verification Failed').should('be.visible')
    cy.contains('button', 'Resend Verification Email').should('be.visible')
    cy.contains('button', 'Back to Sign In').should('be.visible')
  })

  it('should show loading state during confirmation', () => {
    cy.visit('/auth/confirm?token_hash=test-token&type=email')

    cy.contains('Confirming').should('be.visible')
  })
})