describe('Homepage', () => {
  it('loads the homepage successfully', () => {
    cy.visit('/')
    cy.contains('ScrumKit').should('be.visible')
  })

  it('has proper meta tags', () => {
    cy.visit('/')
    cy.title().should('contain', 'ScrumKit')
  })

  it('displays navigation links', () => {
    cy.visit('/')

    // Check for main navigation elements
    cy.get('nav').should('be.visible')
  })

  it('has responsive design', () => {
    // Desktop view
    cy.viewport(1280, 720)
    cy.visit('/')
    cy.get('body').should('be.visible')

    // Tablet view
    cy.viewport(768, 1024)
    cy.get('body').should('be.visible')

    // Mobile view
    cy.viewport(375, 667)
    cy.get('body').should('be.visible')
  })

  it('navigates to retrospectives page', () => {
    cy.visit('/')

    // Look for a link to retrospectives
    cy.contains('Retrospectives').click()
    cy.url().should('include', '/retrospectives')
  })

  it('displays footer content', () => {
    cy.visit('/')

    cy.scrollTo('bottom')
    cy.get('footer').should('be.visible')
  })
})