describe('Signup Duplicate Email', () => {
  const testPassword = 'password123'
  const testFullName = 'Test User'
  let uniqueEmail: string

  beforeEach(() => {
    // Generate unique email for each test run to avoid conflicts
    uniqueEmail = `test.${Date.now()}@example.com`
    cy.visit('/auth')
  })

  it('should prevent signup with existing email and auto-switch to sign in', () => {
    // First, create an account with the unique email
    cy.contains('Sign Up').click()
    cy.get('#signup-name').type(testFullName)
    cy.get('#signup-email').type(uniqueEmail)
    cy.get('#signup-password').type(testPassword)
    cy.contains('Create Account').click()

    // Wait for signup to complete (success or error)
    cy.wait(1000)

    // Now visit the page again and try to sign up with the same email
    cy.visit('/auth')
    cy.contains('Sign Up').click()

    cy.get('#signup-name').type('Another User')
    cy.get('#signup-email').type(uniqueEmail)
    cy.get('#signup-password').type('newpassword123')
    cy.contains('Create Account').click()

    // Should show error message about account already existing
    cy.contains('already exists', { matchCase: false }).should('be.visible')

    // Should stay on auth page
    cy.url().should('include', '/auth')

    // Should auto-switch to Sign In tab
    cy.get('input[id="signin-email"]').should('be.visible')

    // Email should be pre-filled from signup attempt
    cy.get('input[id="signin-email"]').should('have.value', uniqueEmail)

    // Password field should be empty (cleared for security)
    cy.get('input[id="signin-password"]').should('have.value', '')
  })

  it('should display user-friendly error notification', () => {
    // Create an account first
    cy.contains('Sign Up').click()
    const timestamp = Date.now()
    const uniqueEmail = `test.${timestamp}@example.com`

    cy.get('#signup-name').type(testFullName)
    cy.get('#signup-email').type(uniqueEmail)
    cy.get('#signup-password').type(testPassword)
    cy.contains('Create Account').click()

    cy.wait(1000)

    // Try to sign up again with same email
    cy.visit('/auth')
    cy.contains('Sign Up').click()

    cy.get('#signup-name').type('Another User')
    cy.get('#signup-email').type(uniqueEmail)
    cy.get('#signup-password').type('differentpassword')
    cy.contains('Create Account').click()

    // Verify error toast appears with helpful message
    cy.contains('Account already exists').should('be.visible')
    cy.contains('sign in instead', { matchCase: false }).should('be.visible')
  })

  it('should handle duplicate email with different casing', () => {
    // Create account with lowercase email
    cy.contains('Sign Up').click()
    const timestamp = Date.now()
    const lowerEmail = `test.${timestamp}@example.com`
    const upperEmail = `TEST.${timestamp}@example.com`

    cy.get('#signup-name').type(testFullName)
    cy.get('#signup-email').type(lowerEmail)
    cy.get('#signup-password').type(testPassword)
    cy.contains('Create Account').click()

    cy.wait(1000)

    // Try to sign up with uppercase version of same email
    cy.visit('/auth')
    cy.contains('Sign Up').click()

    cy.get('#signup-name').type('Another User')
    cy.get('#signup-email').type(upperEmail)
    cy.get('#signup-password').type('newpassword')
    cy.contains('Create Account').click()

    // Should still detect as duplicate (Supabase handles email normalization)
    cy.contains('already exists', { matchCase: false }).should('be.visible')
  })
})
