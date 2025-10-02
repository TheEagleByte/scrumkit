/// <reference types="cypress" />
// ***********************************************
// Custom commands for testing
// ***********************************************

// Example custom command for logging in with Supabase
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth')
  cy.contains('Sign In').click()
  cy.get('input[id="signin-email"]').type(email)
  cy.get('input[id="signin-password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('not.include', '/auth')
})

// Command to sign up a new user
Cypress.Commands.add('signup', (email: string, password: string, fullName: string) => {
  cy.visit('/auth')
  cy.contains('Sign Up').click()
  cy.get('input[id="signup-name"]').type(fullName)
  cy.get('input[id="signup-email"]').type(email)
  cy.get('input[id="signup-password"]').type(password)
  cy.get('button[type="submit"]').click()
})

// Command to log out
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.contains('Sign out').click()
  cy.url().should('include', '/auth')
})

// Command to create a new board with specified title and template
Cypress.Commands.add('createBoard', (title: string, template: string = 'default') => {
  cy.visit('/boards/new')
  cy.get('input[id="title"]').type(title)
  cy.get(`[data-testid="template-${template}"]`).click()
  cy.contains('button', 'Create Board').click()
  cy.url().should('include', '/retro/')
})

// Command to add a retrospective item to a specific column
Cypress.Commands.add('addRetroItem', (columnTitle: string, text: string) => {
  cy.contains(columnTitle)
    .parent()
    .within(() => {
      cy.contains('button', 'Add Item').click()
      cy.get('textarea').type(text)
      cy.contains('button', 'Save').click()
    })
  // Wait for the item to be visible
  cy.contains(text).should('be.visible')
})

// Command to vote on an item
Cypress.Commands.add('voteOnItem', (itemText: string, count: number = 1) => {
  for (let i = 0; i < count; i++) {
    cy.contains(itemText)
      .parent()
      .within(() => {
        cy.get('button').contains('👍').click()
      })
    // Small wait between votes
    if (i < count - 1) cy.wait(100)
  }
})

// Command to delete a retrospective item
Cypress.Commands.add('deleteRetroItem', (itemText: string) => {
  cy.contains(itemText)
    .parent()
    .within(() => {
      cy.get('button[aria-label="Remove item"]').click()
    })
  // Handle confirmation if present
  cy.get('body').then($body => {
    if ($body.find('button:contains("Confirm")').length) {
      cy.contains('button', 'Confirm').click()
    }
  })
  cy.contains(itemText).should('not.exist')
})

// Command to archive a board
Cypress.Commands.add('archiveBoard', (boardTitle: string) => {
  cy.contains(boardTitle)
    .parents('[data-testid="board-card"]')
    .within(() => {
      cy.get('button[aria-label="Archive board"]').click()
    })
})

// Command to check responsive layout
Cypress.Commands.add('checkResponsive', () => {
  const viewports: Array<{ name: string; width: number; height: number }> = [
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 }
  ]

  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height)
    cy.get('body').should('be.visible')
  })
})

// Command to wait for animation to complete
Cypress.Commands.add('waitForAnimation', () => {
  cy.wait(300) // Standard animation duration
})

// Command to check accessibility with specific focus
Cypress.Commands.add('checkA11y', (selector?: string) => {
  if (selector) {
    cy.get(selector).should('have.attr', 'aria-label')
      .or('have.attr', 'aria-labelledby')
      .or('have.attr', 'alt')
  } else {
    // Check general accessibility
    cy.get('button').each($btn => {
      if (!$btn.text().trim()) {
        cy.wrap($btn).should('have.attr', 'aria-label')
      }
    })
    cy.get('img').should('have.attr', 'alt')
    cy.get('a').should('have.attr', 'href')
  }
})

// Command to navigate using keyboard
Cypress.Commands.add('navigateWithKeyboard', (times: number = 1, key: string = 'tab') => {
  for (let i = 0; i < times; i++) {
    cy.get('body').type(`{${key}}`)
  }
})

// Command to login as an unverified user (from test fixtures)
Cypress.Commands.add('loginAsUnverified', () => {
  cy.fixture('test-users.json').then((users) => {
    const { email, password } = users.unverifiedUser
    cy.login(email, password)
  })
})

// Command to create an unverified user account
Cypress.Commands.add('createUnverifiedUser', (email: string, password: string, fullName: string) => {
  // Note: This requires Supabase to be configured to allow unverified login
  cy.signup(email, password, fullName)
  // Login immediately without waiting for email confirmation
  cy.login(email, password)
})

// Type declarations for TypeScript
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      signup(email: string, password: string, fullName: string): Chainable<void>
      logout(): Chainable<void>
      createBoard(title: string, template?: string): Chainable<void>
      addRetroItem(columnTitle: string, text: string): Chainable<void>
      voteOnItem(itemText: string, count?: number): Chainable<void>
      deleteRetroItem(itemText: string): Chainable<void>
      archiveBoard(boardTitle: string): Chainable<void>
      checkResponsive(): Chainable<void>
      waitForAnimation(): Chainable<void>
      checkA11y(selector?: string): Chainable<void>
      navigateWithKeyboard(times?: number, key?: string): Chainable<void>
      loginAsUnverified(): Chainable<void>
      createUnverifiedUser(email: string, password: string, fullName: string): Chainable<void>
    }
  }
}

export {}