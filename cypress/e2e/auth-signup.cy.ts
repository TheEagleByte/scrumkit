describe('Sign Up Flow', () => {
  beforeEach(() => {
    cy.visit('/auth')
    cy.contains('Sign Up').click()
  })

  it('should show signup form with all required fields', () => {
    cy.get('input[id="signup-name"]').should('be.visible')
    cy.get('input[id="signup-email"]').should('be.visible')
    cy.get('input[id="signup-password"]').should('be.visible')
    cy.get('input[id="signup-confirm-password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('should validate required fields', () => {
    cy.get('button[type="submit"]').click()
    cy.get('input[id="signup-name"]:invalid').should('exist')
  })

  it('should validate email format', () => {
    cy.get('input[id="signup-name"]').type('Test User')
    cy.get('input[id="signup-email"]').type('invalid-email')
    cy.get('input[id="signup-password"]').type('password123')
    cy.get('input[id="signup-confirm-password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.get('input[id="signup-email"]:invalid').should('exist')
  })

  it('should enforce password requirements', () => {
    cy.get('input[id="signup-name"]').type('Test User')
    cy.get('input[id="signup-email"]').type('test@example.com')
    cy.get('input[id="signup-password"]').type('12345')
    cy.get('button[type="submit"]').click()
    cy.contains('at least 6 characters').should('be.visible')
  })

  it('should show success message after valid signup', () => {
    const timestamp = Date.now()
    cy.get('input[id="signup-name"]').type('Test User')
    cy.get('input[id="signup-email"]').type(`test${timestamp}@example.com`)
    cy.get('input[id="signup-password"]').type('password123')
    cy.get('input[id="signup-confirm-password"]').type('password123')
    cy.get('button[type="submit"]').click()

    cy.contains('Verify your email').should('be.visible')
    cy.contains('verification link').should('be.visible')
  })

  it('should show loading state during signup', () => {
    const timestamp = Date.now()
    cy.get('input[id="signup-name"]').type('Test User')
    cy.get('input[id="signup-email"]').type(`test${timestamp}@example.com`)
    cy.get('input[id="signup-password"]').type('password123')
    cy.get('input[id="signup-confirm-password"]').type('password123')
    cy.get('button[type="submit"]').click()

    cy.get('button[type="submit"]').should('be.disabled')
    cy.contains('Creating account').should('be.visible')
  })

  it('should toggle between signin and signup tabs', () => {
    cy.get('input[id="signup-name"]').should('be.visible')

    cy.contains('Sign In').click()
    cy.get('input[id="signin-email"]').should('be.visible')
    cy.get('input[id="signup-name"]').should('not.exist')

    cy.contains('Sign Up').click()
    cy.get('input[id="signup-name"]').should('be.visible')
  })
})