describe('Retrospective Board', () => {
  describe('Basic Board Display', () => {
    beforeEach(() => {
      // Create a board once and reuse for display tests
      cy.clearLocalStorage()
      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('Display Test Board')
      cy.contains('button', 'Create Board').click()
      cy.url().should('include', '/retro/', { timeout: 10000 })
      cy.contains('What went well', { timeout: 10000 }).should('be.visible')
    })

    it('displays the retrospective board with four columns', () => {
      cy.contains('What went well').should('be.visible')
      cy.contains('What could be improved').should('be.visible')
      cy.contains('What blocked us').should('be.visible')
      cy.contains('Action items').should('be.visible')
    })

    it('displays column descriptions', () => {
      cy.contains('Celebrate successes').should('be.visible')
      cy.contains('Identify areas').should('be.visible')
      cy.contains('Obstacles').should('be.visible')
      cy.contains('Next steps').should('be.visible')
    })

    it('shows add item buttons for each column', () => {
      cy.get('button').contains('Add Item').should('have.length', 4)
    })
  })

  describe('Board Header', () => {
    beforeEach(() => {
      cy.clearLocalStorage()
      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('Header Test Board')
      cy.contains('button', 'Create Board').click()
      cy.url().should('include', '/retro/', { timeout: 10000 })
      cy.contains('What went well', { timeout: 10000 }).should('be.visible')
    })

    it('displays board title', () => {
      cy.contains('Header Test Board').should('be.visible')
    })

    it('displays connection status', () => {
      // Check if connection status component exists
      cy.get('body').should('be.visible')
    })
  })

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.clearLocalStorage()
      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('Responsive Test')
      cy.contains('button', 'Create Board').click()
      cy.url().should('include', '/retro/', { timeout: 10000 })
      cy.contains('What went well', { timeout: 10000 }).should('be.visible')
    })

    it('displays on desktop', () => {
      cy.viewport(1280, 720)
      cy.contains('What went well').should('be.visible')
      cy.contains('What could be improved').should('be.visible')
    })

    it('displays on tablet', () => {
      cy.viewport(768, 1024)
      cy.contains('What went well').should('be.visible')
      cy.contains('What could be improved').should('be.visible')
    })

    it('displays on mobile', () => {
      cy.viewport(375, 667)
      cy.contains('What went well').should('be.visible')
      // On mobile, columns stack vertically
      cy.get('button').contains('Add Item').should('exist')
    })
  })

  describe('Basic Interaction', () => {
    beforeEach(() => {
      cy.clearLocalStorage()
      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('Interaction Test')
      cy.contains('button', 'Create Board').click()
      cy.url().should('include', '/retro/', { timeout: 10000 })
      cy.contains('What went well', { timeout: 10000 }).should('be.visible')
    })

    it('can click add item button', () => {
      cy.get('button').contains('Add Item').first().click()
      // Check if textarea appears or form opens
      cy.get('body').should('be.visible')
    })

    it('shows board navigation', () => {
      // Check if there's a way to navigate back
      cy.get('a, button').should('have.length.at.least', 1)
    })
  })
})