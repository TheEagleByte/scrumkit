describe('Dashboard Planning Poker', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
  });

  it('should show Planning Poker as available', () => {
    cy.contains('ScrumKit Poker').parent().within(() => {
      cy.contains('Available Now').should('exist');
      cy.contains('Coming Soon').should('not.exist');
    });
  });

  it('should have enabled Planning Poker button', () => {
    cy.contains('ScrumKit Poker').parent().within(() => {
      cy.get('a[href="/poker"]').should('exist');
      cy.contains('View Sessions').should('exist');
    });
  });

  it('should navigate to poker sessions when clicked', () => {
    cy.contains('ScrumKit Poker').parent().within(() => {
      cy.get('a[href="/poker"]').click();
    });

    cy.url().should('match', /\/poker/);
  });
});
