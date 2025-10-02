describe('Signup Password Confirmation', () => {
  beforeEach(() => {
    cy.visit('/auth')
    cy.contains('Sign Up').click()
  })

  it('should require password confirmation field', () => {
    cy.get('#signup-password').should('exist')
    cy.get('#signup-confirm-password').should('exist')
  })

  it('should show error when passwords do not match', () => {
    cy.get('#signup-password').type('password123')
    cy.get('#signup-confirm-password').type('differentpassword')
    cy.get('#signup-confirm-password').blur()

    cy.contains('Passwords do not match').should('be.visible')
  })

  it('should not show error when passwords match', () => {
    cy.get('#signup-password').type('password123')
    cy.get('#signup-confirm-password').type('password123')
    cy.get('#signup-confirm-password').blur()

    cy.contains('Passwords do not match').should('not.exist')
  })

  it('should disable submit button when passwords do not match', () => {
    cy.get('#signup-name').type('Test User')
    cy.get('#signup-email').type('test@example.com')
    cy.get('#signup-password').type('password123')
    cy.get('#signup-confirm-password').type('differentpassword')
    cy.get('#signup-confirm-password').blur()

    cy.get('button[type="submit"]').should('be.disabled')
  })

  it('should allow submission when passwords match', () => {
    const timestamp = Date.now()
    cy.get('#signup-name').type('Test User')
    cy.get('#signup-email').type(`test${timestamp}@example.com`)
    cy.get('#signup-password').type('password123')
    cy.get('#signup-confirm-password').type('password123')

    cy.get('button[type="submit"]').should('not.be.disabled')
    cy.get('button[type="submit"]').click()

    // Should show success message
    cy.contains('Verify your email').should('be.visible')
  })

  it('should clear error when user corrects password', () => {
    cy.get('#signup-password').type('password123')
    cy.get('#signup-confirm-password').type('wrongpassword')
    cy.get('#signup-confirm-password').blur()

    cy.contains('Passwords do not match').should('be.visible')

    // Clear and retype correct password
    cy.get('#signup-confirm-password').clear()
    cy.get('#signup-confirm-password').type('password123')
    cy.get('#signup-confirm-password').blur()

    cy.contains('Passwords do not match').should('not.exist')
  })

  it('should maintain tab order: Name → Email → Password → Confirm Password', () => {
    cy.get('#signup-name').focus()
    cy.focused().should('have.id', 'signup-name')

    cy.focused().tab()
    cy.focused().should('have.id', 'signup-email')

    cy.focused().tab()
    cy.focused().should('have.id', 'signup-password')

    cy.focused().tab()
    cy.focused().should('have.id', 'signup-confirm-password')
  })

  it('should show error with proper accessibility attributes', () => {
    cy.get('#signup-password').type('password123')
    cy.get('#signup-confirm-password').type('wrongpassword')
    cy.get('#signup-confirm-password').blur()

    // Check aria attributes
    cy.get('#signup-confirm-password')
      .should('have.attr', 'aria-invalid', 'true')
      .should('have.attr', 'aria-describedby', 'password-error')

    // Check error message has role alert
    cy.get('#password-error')
      .should('have.attr', 'role', 'alert')
      .should('contain', 'Passwords do not match')
  })
})
