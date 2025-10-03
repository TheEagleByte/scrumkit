describe('Poker Create Page Navigation', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should have back button to sessions list', () => {
    cy.visit('/poker/new');

    // Should have back navigation
    cy.get('[data-testid="back-to-sessions"]').should('be.visible');
  });

  it('should navigate to sessions list when clicking back button', () => {
    cy.visit('/poker/new');

    cy.get('[data-testid="back-to-sessions"]').click();

    cy.url().should('eq', Cypress.config().baseUrl + '/poker');
  });

  it('should navigate back via Cancel button when form is clean', () => {
    cy.visit('/poker/new');

    // Cancel button should navigate directly when no changes
    cy.contains('button', 'Cancel').click();

    cy.url().should('include', '/poker');
  });

  it('should show confirmation if form has changes when clicking Cancel', () => {
    cy.visit('/poker/new');

    // Make changes to the form
    cy.get('input[id="title"]').type('Test Session');

    // Try to cancel
    cy.contains('button', 'Cancel').click();

    // Should show confirmation dialog
    cy.contains('Unsaved changes').should('be.visible');
    cy.contains('Are you sure you want to leave').should('be.visible');
  });

  it('should allow continuing editing from unsaved changes dialog', () => {
    cy.visit('/poker/new');

    // Make changes
    cy.get('input[id="title"]').type('Test Session');

    // Try to cancel
    cy.contains('button', 'Cancel').click();

    // Click Continue editing
    cy.contains('button', 'Continue editing').click();

    // Should still be on the create page
    cy.url().should('include', '/poker/new');

    // Form should still have the changes
    cy.get('input[id="title"]').should('have.value', 'Test Session');
  });

  it('should discard changes and navigate away when confirmed', () => {
    cy.visit('/poker/new');

    // Make changes
    cy.get('input[id="title"]').type('Test Session');

    // Try to cancel
    cy.contains('button', 'Cancel').click();

    // Confirm discard
    cy.contains('button', 'Discard changes').click();

    // Should navigate to poker sessions list
    cy.url().should('eq', Cypress.config().baseUrl + '/poker');
  });

  it('should show confirmation when using back button with unsaved changes', () => {
    cy.visit('/poker/new');

    // Make changes
    cy.get('input[id="title"]').type('Test Session');

    // Click back button
    cy.get('[data-testid="back-to-sessions"]').click();

    // Should show confirmation dialog
    cy.contains('Unsaved changes').should('be.visible');
  });

  it('should handle keyboard shortcut (Escape) when form is clean', () => {
    cy.visit('/poker/new');

    // Press Escape
    cy.get('body').type('{esc}');

    // Should navigate back
    cy.url().should('eq', Cypress.config().baseUrl + '/poker');
  });

  it('should show confirmation on Escape with unsaved changes', () => {
    cy.visit('/poker/new');

    // Make changes
    cy.get('input[id="title"]').type('Test Session');

    // Press Escape
    cy.get('body').type('{esc}');

    // Should show confirmation dialog
    cy.contains('Unsaved changes').should('be.visible');
  });

  it('should not navigate back during form submission', () => {
    cy.visit('/poker/new');

    // Fill in required fields
    cy.get('input[id="title"]').type('Test Session');

    // Intercept the submission to make it slow
    cy.intercept('POST', '**/api/**', { delay: 2000 }).as('createSession');

    // Submit the form
    cy.contains('button', 'Create Session').click();

    // Try to cancel during submission
    cy.contains('button', 'Cancel').should('be.disabled');
  });

  it('should have accessible back navigation', () => {
    cy.visit('/poker/new');

    // Back button should be keyboard accessible
    cy.get('[data-testid="back-to-sessions"]')
      .should('be.visible')
      .focus()
      .should('have.focus');
  });

  it('should maintain navigation consistency across poker pages', () => {
    cy.visit('/poker');

    // Navigate to create page
    cy.contains('New Session').click();
    cy.url().should('include', '/poker/new');

    // Navigate back
    cy.get('[data-testid="back-to-sessions"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/poker');
  });
});
