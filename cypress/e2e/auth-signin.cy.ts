describe('Sign In Flow', () => {
  beforeEach(() => {
    cy.visit('/auth')
  })

  it('should show signin form by default', () => {
    cy.get('input[id="signin-email"]').should('be.visible')
    cy.get('input[id="signin-password"]').should('be.visible')
    cy.contains('button', 'Sign In').should('be.visible')
  })

  it('should require both email and password', () => {
    cy.get('button[type="submit"]').click()
    cy.get('input[id="signin-email"]:invalid').should('exist')
  })

  it('should validate email format', () => {
    cy.get('input[id="signin-email"]').type('invalid-email')
    cy.get('input[id="signin-password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.get('input[id="signin-email"]:invalid').should('exist')
  })

  it('should show loading state during signin', () => {
    cy.get('input[id="signin-email"]').type('test@example.com')
    cy.get('input[id="signin-password"]').type('password123')
    cy.get('button[type="submit"]').click()

    cy.get('button[type="submit"]').should('be.disabled')
    cy.contains('Signing in').should('be.visible')
  })

  it('should handle continue as guest option', () => {
    cy.contains('continue as guest').click()
    cy.url().should('include', '/retro')
  })

  it('should toggle between signin and signup tabs', () => {
    cy.get('input[id="signin-email"]').should('be.visible')

    cy.contains('Sign Up').click()
    cy.get('input[id="signup-name"]').should('be.visible')
    cy.get('input[id="signin-email"]').should('not.exist')

    cy.contains('Sign In').click()
    cy.get('input[id="signin-email"]').should('be.visible')
  })

  it('should have proper form structure', () => {
    cy.get('form').should('exist')
    cy.get('label[for="signin-email"]').should('contain', 'Email')
    cy.get('label[for="signin-password"]').should('contain', 'Password')
  })

  it('should show welcome message', () => {
    cy.contains('Welcome to ScrumKit').should('be.visible')
    cy.contains('Sign in to save your boards').should('be.visible')
  })
})