describe('Retrospective Board Navigation', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/boards/new');
    cy.get('input[id="title"]').type('Navigation Test Board');
    cy.contains('button', 'Create Board').click();
    cy.url().should('include', '/retro/', { timeout: 10000 });
    cy.contains('What went well', { timeout: 10000 }).should('be.visible');
  });

  it('should have back button to boards list', () => {
    // Should be on board page
    cy.url().should('include', '/retro/');

    // Should have back button visible
    cy.get('[data-testid="back-to-boards"]').should('be.visible');

    // Back button should have arrow icon
    cy.get('[data-testid="back-to-boards"]').find('svg').should('be.visible');
  });

  it('should navigate to boards list when clicking back button', () => {
    // Verify we're on the board page
    cy.url().should('include', '/retro/');
    cy.contains('Navigation Test Board').should('be.visible');

    // Click the back button
    cy.get('[data-testid="back-to-boards"]').click();

    // Should navigate to boards list
    cy.url().should('include', '/boards');
    cy.url().should('not.include', '/retro/');
  });

  it('should navigate back on Esc key press', () => {
    // Verify we're on the board page
    cy.url().should('include', '/retro/');

    // Press Esc key
    cy.get('body').type('{esc}');

    // Should navigate to boards list
    cy.url().should('include', '/boards');
    cy.url().should('not.include', '/retro/');
  });

  it('should not navigate on Esc when export dialog is open', () => {
    // Open export dialog
    cy.contains('button', 'Export').click();

    // Verify dialog is open (check for dialog content)
    cy.contains('Export Retrospective').should('be.visible');

    // Press Esc key
    cy.get('body').type('{esc}');

    // Should still be on board page (Esc closes dialog, not navigate)
    cy.url().should('include', '/retro/');
  });

  it('should not navigate on Esc when adding an item', () => {
    // Click Add Item button for first column
    cy.get('button').contains('Add Item').first().click();

    // Verify textarea is visible
    cy.get('textarea').should('be.visible');

    // Press Esc key
    cy.get('body').type('{esc}');

    // Should still be on board page (Esc cancels adding item)
    cy.url().should('include', '/retro/');

    // Textarea should be hidden (add mode cancelled)
    cy.get('textarea').should('not.exist');
  });

  it('back button should be responsive on mobile', () => {
    // Set mobile viewport
    cy.viewport('iphone-x');

    // Back button should still be visible
    cy.get('[data-testid="back-to-boards"]').should('be.visible');

    // Text may be hidden on mobile, but button should work
    cy.get('[data-testid="back-to-boards"]').click();

    // Should navigate to boards list
    cy.url().should('include', '/boards');
  });
});
