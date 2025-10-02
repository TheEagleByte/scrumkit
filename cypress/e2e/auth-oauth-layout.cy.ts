describe('OAuth Button Layout', () => {
  beforeEach(() => {
    cy.visit('/auth');
  });

  it('should display OAuth buttons vertically', () => {
    // Get positions of both buttons
    cy.contains('button', 'Google').then(($google) => {
      cy.contains('button', 'GitHub').then(($github) => {
        const googlePos = $google[0].getBoundingClientRect();
        const githubPos = $github[0].getBoundingClientRect();

        // GitHub should be below Google (higher Y coordinate)
        expect(githubPos.top).to.be.greaterThan(googlePos.bottom);
      });
    });
  });

  it('should have full-width OAuth buttons', () => {
    cy.contains('button', 'Google').should('have.class', 'w-full');
    cy.contains('button', 'GitHub').should('have.class', 'w-full');
  });

  it('should display Google button before GitHub button', () => {
    // Get all OAuth buttons
    cy.get('button').contains('Google').parent().parent().within(() => {
      cy.get('button').first().should('contain', 'Google');
      cy.get('button').last().should('contain', 'GitHub');
    });
  });

  it('should maintain consistent spacing between OAuth buttons', () => {
    cy.contains('button', 'Google').parent().should('have.class', 'gap-2');
  });

  it('should be mobile responsive', () => {
    // Test mobile viewport
    cy.viewport('iphone-x');

    cy.contains('button', 'Google').should('be.visible');
    cy.contains('button', 'GitHub').should('be.visible');

    // Verify buttons are still vertically stacked on mobile
    cy.contains('button', 'Google').then(($google) => {
      cy.contains('button', 'GitHub').then(($github) => {
        const googlePos = $google[0].getBoundingClientRect();
        const githubPos = $github[0].getBoundingClientRect();

        expect(githubPos.top).to.be.greaterThan(googlePos.bottom);
      });
    });
  });

  it('should have proper button styling', () => {
    // Check Google button has proper styling
    cy.contains('button', 'Google')
      .should('have.class', 'w-full')
      .should('be.visible')
      .within(() => {
        cy.get('svg').should('exist');
      });

    // Check GitHub button has proper styling
    cy.contains('button', 'GitHub')
      .should('have.class', 'w-full')
      .should('be.visible')
      .within(() => {
        cy.get('svg').should('exist');
      });
  });
});
