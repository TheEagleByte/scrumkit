describe('Session Management', () => {
  it('should redirect to auth page when accessing protected routes without session', () => {
    cy.visit('/profile')
    cy.url().should('include', '/auth')
  })

  it('should handle guest access to public routes', () => {
    cy.visit('/retro')
    cy.url().should('include', '/retro')
  })

  it('should show continue as guest option', () => {
    cy.visit('/auth')
    cy.contains('continue as guest').should('be.visible')
  })

  it('should allow guest access via continue button', () => {
    cy.visit('/auth')
    cy.contains('continue as guest').click()
    cy.url().should('include', '/retro')
  })

  it('should maintain auth form state when toggling tabs', () => {
    cy.visit('/auth')

    cy.get('input[id="signin-email"]').type('test@example.com')
    cy.contains('Sign Up').click()
    cy.contains('Sign In').click()

    cy.get('input[id="signin-email"]').should('have.value', 'test@example.com')
  })

  it('should clear form state after successful signup', () => {
    const timestamp = Date.now()
    cy.visit('/auth')
    cy.contains('Sign Up').click()

    cy.get('input[id="signup-name"]').type('Test User')
    cy.get('input[id="signup-email"]').type(`test${timestamp}@example.com`)
    cy.get('input[id="signup-password"]').type('password123')
    cy.get('button[type="submit"]').click()

    cy.contains('Try a different email').click()
    cy.get('input[id="signup-email"]').should('have.value', '')
  })

  it('should show auth page components correctly', () => {
    cy.visit('/auth')

    cy.contains('Welcome to ScrumKit').should('be.visible')
    cy.contains('Sign in to save your boards').should('be.visible')
    cy.get('[role="tablist"]').should('exist')
    cy.contains('Sign In').should('be.visible')
    cy.contains('Sign Up').should('be.visible')
  })

  it('should have properly structured form elements', () => {
    cy.visit('/auth')

    cy.get('form').should('exist')
    cy.get('input[type="email"]').should('exist')
    cy.get('input[type="password"]').should('exist')
    cy.get('button[type="submit"]').should('exist')
  })

  it('should maintain URL redirect parameter', () => {
    cy.visit('/auth?redirectTo=%2Fprofile')
    cy.url().should('include', 'redirectTo=%2Fprofile')
  })
})