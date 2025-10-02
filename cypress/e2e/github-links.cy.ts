describe('GitHub Links', () => {
  const correctRepo = 'https://github.com/TheEagleByte/scrumkit';

  beforeEach(() => {
    cy.visit('/');
  });

  it('should have correct GitHub repository link in main CTA', () => {
    // Check main CTA GitHub button
    cy.contains('View on GitHub')
      .should('be.visible')
      .parents('a')
      .should('have.attr', 'href', correctRepo);
  });

  it('should have correct GitHub repository link in Star button', () => {
    // Scroll to the open source section
    cy.scrollTo('center');

    // Check Star on GitHub button
    cy.contains('Star on GitHub')
      .should('be.visible')
      .parents('a')
      .should('have.attr', 'href', correctRepo);
  });

  it('should not show Vercel deployment button', () => {
    cy.visit('/');
    // Deploy to Vercel button should be hidden until production-ready (issue #78)
    cy.contains('Deploy to Vercel').should('not.exist');
  });

  it('should have correct GitHub links in footer resources', () => {
    cy.scrollTo('bottom');

    // Check footer GitHub links
    cy.get('footer').within(() => {
      // Documentation link
      cy.contains('Documentation')
        .should('have.attr', 'href', `${correctRepo}/wiki`);

      // Self-Hosting Guide link should be hidden until ready (issue #78)
      cy.contains('Self-Hosting Guide').should('not.exist');

      // Contributing link
      cy.contains('Contributing')
        .should('have.attr', 'href', `${correctRepo}/blob/main/CONTRIBUTING.md`);

      // Changelog link
      cy.contains('Changelog')
        .should('have.attr', 'href', `${correctRepo}/releases`);

      // License link
      cy.contains('License')
        .should('have.attr', 'href', `${correctRepo}/blob/main/LICENSE`);
    });
  });

  it('should have correct GitHub community link in footer', () => {
    cy.scrollTo('bottom');

    cy.get('footer').within(() => {
      // Find the GitHub link in Community section
      cy.contains('Community')
        .parent()
        .within(() => {
          cy.contains('GitHub')
            .should('have.attr', 'href', correctRepo);
        });
    });
  });

  it('should have correct GitHub icon link in footer bottom', () => {
    cy.scrollTo('bottom');

    // Check the GitHub icon link at the bottom of footer
    cy.get('footer a[href*="github.com"]')
      .should('have.length.at.least', 1)
      .each(($el) => {
        cy.wrap($el)
          .should('have.attr', 'href')
          .and('include', 'TheEagleByte/scrumkit');
      });
  });

  it('should not have any links to the old repository URL', () => {
    // Check that no links point to the old repository
    cy.get('a[href*="github.com/scrumkit/scrumkit"]').should('not.exist');
  });

  it('all GitHub links should have correct security attributes', () => {
    cy.get('a[href*="github.com/TheEagleByte/scrumkit"]').each(($el) => {
      // Check for target="_blank"
      cy.wrap($el).should('have.attr', 'target', '_blank');

      // Check for rel="noopener noreferrer"
      cy.wrap($el).should('have.attr', 'rel', 'noopener noreferrer');
    });
  });
});
