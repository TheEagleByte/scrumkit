describe('Retrospective Board', () => {
  beforeEach(() => {
    // Visit the retrospective board page
    cy.visit('/retrospectives/test-retro')
  })

  it('displays the retrospective board with four columns', () => {
    // Check if all four columns are present
    cy.contains('What went well').should('be.visible')
    cy.contains('What could be improved').should('be.visible')
    cy.contains('Blockers').should('be.visible')
    cy.contains('Action items').should('be.visible')
  })

  it('allows adding a new item to a column', () => {
    // Find the "What went well" column and add an item
    cy.contains('What went well')
      .parent()
      .within(() => {
        cy.get('button').contains('Add Item').click()
        cy.get('textarea').type('Great sprint planning session')
        cy.get('button').contains('Save').click()
      })

    // Verify the item was added
    cy.contains('Great sprint planning session').should('be.visible')
  })

  it('allows voting on an item', () => {
    // Add an item first
    cy.contains('What went well')
      .parent()
      .within(() => {
        cy.get('button').contains('Add Item').click()
        cy.get('textarea').type('Excellent team collaboration')
        cy.get('button').contains('Save').click()
      })

    // Vote on the item
    cy.contains('Excellent team collaboration')
      .parent()
      .within(() => {
        cy.get('button[aria-label*="vote"]').click()
        cy.contains('1').should('be.visible')
      })
  })

  it('allows deleting an item', () => {
    // Add an item first
    cy.contains('What could be improved')
      .parent()
      .within(() => {
        cy.get('button').contains('Add Item').click()
        cy.get('textarea').type('Item to delete')
        cy.get('button').contains('Save').click()
      })

    // Delete the item
    cy.contains('Item to delete')
      .parent()
      .within(() => {
        cy.get('button[aria-label*="delete"]').click()
      })

    // Confirm deletion if there's a confirmation dialog
    cy.get('button').contains('Confirm').click({ force: true })

    // Verify the item was deleted
    cy.contains('Item to delete').should('not.exist')
  })

  it('displays author information for items', () => {
    // Add an item
    cy.contains('Blockers')
      .parent()
      .within(() => {
        cy.get('button').contains('Add Item').click()
        cy.get('textarea').type('CI/CD pipeline issues')
        cy.get('button').contains('Save').click()
      })

    // Check if author info is displayed
    cy.contains('CI/CD pipeline issues')
      .parent()
      .within(() => {
        cy.get('[data-testid="author-name"]').should('exist')
      })
  })

  it('allows editing an existing item', () => {
    // Add an item first
    cy.contains('Action items')
      .parent()
      .within(() => {
        cy.get('button').contains('Add Item').click()
        cy.get('textarea').type('Original text')
        cy.get('button').contains('Save').click()
      })

    // Edit the item
    cy.contains('Original text')
      .parent()
      .within(() => {
        cy.get('button[aria-label*="edit"]').click()
        cy.get('textarea').clear().type('Updated text')
        cy.get('button').contains('Save').click()
      })

    // Verify the item was updated
    cy.contains('Updated text').should('be.visible')
    cy.contains('Original text').should('not.exist')
  })

  it('sorts items by vote count', () => {
    // Add multiple items with different vote counts
    cy.contains('What went well')
      .parent()
      .within(() => {
        // Add first item
        cy.get('button').contains('Add Item').click()
        cy.get('textarea').type('Item with 2 votes')
        cy.get('button').contains('Save').click()

        // Add second item
        cy.get('button').contains('Add Item').click()
        cy.get('textarea').type('Item with 3 votes')
        cy.get('button').contains('Save').click()

        // Add third item
        cy.get('button').contains('Add Item').click()
        cy.get('textarea').type('Item with 1 vote')
        cy.get('button').contains('Save').click()
      })

    // Vote on items differently
    cy.contains('Item with 3 votes')
      .parent()
      .within(() => {
        cy.get('button[aria-label*="vote"]').click()
        cy.get('button[aria-label*="vote"]').click()
        cy.get('button[aria-label*="vote"]').click()
      })

    cy.contains('Item with 2 votes')
      .parent()
      .within(() => {
        cy.get('button[aria-label*="vote"]').click()
        cy.get('button[aria-label*="vote"]').click()
      })

    cy.contains('Item with 1 vote')
      .parent()
      .within(() => {
        cy.get('button[aria-label*="vote"]').click()
      })

    // Verify items are sorted by votes (most votes first)
    cy.get('[data-testid="retrospective-item"]').then(($items) => {
      expect($items.eq(0)).to.contain('Item with 3 votes')
      expect($items.eq(1)).to.contain('Item with 2 votes')
      expect($items.eq(2)).to.contain('Item with 1 vote')
    })
  })
})