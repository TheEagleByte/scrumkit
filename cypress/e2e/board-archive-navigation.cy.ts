describe('Board Archive Navigation', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/boards')
  })

  it('should auto-switch to active tab when unarchiving last archived board', () => {
    // Create a single board
    cy.visit('/boards/new')
    cy.get('input[id="title"]').type('Only Archived Board')
    cy.contains('button', 'Create Board').click()

    // Go back to boards page
    cy.visit('/boards')

    // Archive the board
    cy.contains('Only Archived Board')
      .parents('[data-testid="board-card"]')
      .within(() => {
        cy.get('button[aria-haspopup="menu"]').click()
      })
    cy.contains('Archive').click()

    // Verify board is archived
    cy.contains('Only Archived Board').should('not.exist')
    cy.contains(/Archived.*1/i).should('be.visible')

    // Switch to archived view
    cy.contains('button', /Archived/i).click()
    cy.contains('Only Archived Board').should('be.visible')
    cy.contains('Show Active').should('be.visible')

    // Unarchive the board
    cy.contains('Only Archived Board')
      .parents('[data-testid="board-card"]')
      .within(() => {
        cy.get('button[aria-haspopup="menu"]').click()
      })
    cy.contains('Restore Board').click()

    // Should auto-switch to active tab
    cy.contains('Switched to active boards').should('be.visible')
    cy.contains('Show Active').should('not.exist')
    cy.contains('Only Archived Board').should('be.visible')

    // Archived button should not be visible when count is 0
    cy.contains('button', /Archived/i).should('not.exist')
  })

  it('should keep archived view when multiple boards remain after unarchiving', () => {
    // Create two boards
    cy.visit('/boards/new')
    cy.get('input[id="title"]').type('Archived Board 1')
    cy.contains('button', 'Create Board').click()

    cy.visit('/boards/new')
    cy.get('input[id="title"]').type('Archived Board 2')
    cy.contains('button', 'Create Board').click()

    cy.visit('/boards')

    // Archive both boards
    cy.contains('Archived Board 1')
      .parents('[data-testid="board-card"]')
      .within(() => {
        cy.get('button[aria-haspopup="menu"]').click()
      })
    cy.contains('Archive').click()

    cy.contains('Archived Board 2')
      .parents('[data-testid="board-card"]')
      .within(() => {
        cy.get('button[aria-haspopup="menu"]').click()
      })
    cy.contains('Archive').click()

    // Switch to archived view
    cy.contains('button', /Archived.*2/i).click()

    // Verify both boards are visible
    cy.contains('Archived Board 1').should('be.visible')
    cy.contains('Archived Board 2').should('be.visible')
    cy.contains('Show Active').should('be.visible')

    // Unarchive one board
    cy.contains('Archived Board 1')
      .parents('[data-testid="board-card"]')
      .within(() => {
        cy.get('button[aria-haspopup="menu"]').click()
      })
    cy.contains('Restore Board').click()

    // Should stay in archived view
    cy.contains('Show Active').should('be.visible')
    cy.contains('Archived Board 2').should('be.visible')
    cy.contains('Archived Board 1').should('not.exist')

    // Should NOT auto-switch or show success toast
    cy.contains('Switched to active boards').should('not.exist')
  })

  it('should not show archived button when no archived boards exist', () => {
    // Create a single active board
    cy.visit('/boards/new')
    cy.get('input[id="title"]').type('Active Board Only')
    cy.contains('button', 'Create Board').click()

    cy.visit('/boards')

    // Archived button should not be visible
    cy.contains('button', /Archived/i).should('not.exist')

    // Board should be visible in active view
    cy.contains('Active Board Only').should('be.visible')
  })

  it('should handle rapid archive/unarchive operations', () => {
    // Create a single board
    cy.visit('/boards/new')
    cy.get('input[id="title"]').type('Rapid Test Board')
    cy.contains('button', 'Create Board').click()

    cy.visit('/boards')

    // Archive the board
    cy.contains('Rapid Test Board')
      .parents('[data-testid="board-card"]')
      .within(() => {
        cy.get('button[aria-haspopup="menu"]').click()
      })
    cy.contains('Archive').click()

    // Switch to archived view
    cy.contains('button', /Archived/i).click()

    // Unarchive
    cy.contains('Rapid Test Board')
      .parents('[data-testid="board-card"]')
      .within(() => {
        cy.get('button[aria-haspopup="menu"]').click()
      })
    cy.contains('Restore Board').click()

    // Should be in active view
    cy.contains('Rapid Test Board').should('be.visible')
    cy.contains('button', /Archived/i).should('not.exist')

    // Archive again
    cy.contains('Rapid Test Board')
      .parents('[data-testid="board-card"]')
      .within(() => {
        cy.get('button[aria-haspopup="menu"]').click()
      })
    cy.contains('Archive').click()

    // Should show archived count
    cy.contains('button', /Archived.*1/i).should('be.visible')
  })
})
