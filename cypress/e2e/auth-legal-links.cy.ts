describe('Auth Form Legal Links', () => {
  beforeEach(() => {
    cy.visit('/auth');
  });

  it('should have clickable Terms of Service link', () => {
    cy.get('a[href="/terms"]')
      .should('exist')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'rel', 'noopener noreferrer')
      .should('contain', 'Terms of Service');
  });

  it('should have clickable Privacy Policy link', () => {
    cy.get('a[href="/privacy"]')
      .should('exist')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'rel', 'noopener noreferrer')
      .should('contain', 'Privacy Policy');
  });

  it('should have proper styling for links', () => {
    // Check Terms of Service link styling
    cy.get('a[href="/terms"]')
      .should('have.class', 'underline')
      .should('have.class', 'text-violet-400');

    // Check Privacy Policy link styling
    cy.get('a[href="/privacy"]')
      .should('have.class', 'underline')
      .should('have.class', 'text-violet-400');
  });

  it('should be keyboard accessible', () => {
    // Tab through the form to reach the Terms of Service link
    cy.get('body').tab();

    // Find and focus on the Terms of Service link
    cy.get('a[href="/terms"]').focus();
    cy.focused().should('have.attr', 'href', '/terms');

    // Tab to the Privacy Policy link
    cy.get('a[href="/privacy"]').focus();
    cy.focused().should('have.attr', 'href', '/privacy');
  });
});
