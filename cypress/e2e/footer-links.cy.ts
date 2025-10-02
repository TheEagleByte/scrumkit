describe('Footer Links', () => {
  it('should not have Twitter link', () => {
    cy.visit('/');
    cy.get('footer').within(() => {
      cy.contains('Twitter').should('not.exist');
      cy.get('a[href*="twitter.com"]').should('not.exist');
    });
  });

  it('should have GitHub and Discord links', () => {
    cy.visit('/');
    cy.get('footer').within(() => {
      cy.contains('GitHub').should('exist');
      cy.contains('Discord').should('exist');
    });
  });
});
