describe('Terms of Service', () => {
  describe('Page Load and Content', () => {
    it('should load terms of service page', () => {
      cy.visit('/terms');
      cy.contains('Terms of Service').should('exist');
      cy.contains('Last Updated').should('exist');
    });

    it('should have proper page title', () => {
      cy.visit('/terms');
      cy.title().should('contain', 'Terms of Service');
    });

    it('should display all required content sections', () => {
      cy.visit('/terms');

      // Check for main sections
      const sections = [
        'Acceptance of Terms',
        'Description of Service',
        'User Accounts',
        'Acceptable Use',
        'Intellectual Property',
        'Disclaimers & Limitations',
        'Modifications to Terms',
        'Governing Law',
        'Contact Us'
      ];

      sections.forEach(section => {
        cy.contains(section).should('exist');
      });
    });

    it('should display last updated date', () => {
      cy.visit('/terms');
      cy.contains(/Last Updated:.*202\d/).should('exist');
    });

    it('should mention open source nature', () => {
      cy.visit('/terms');
      cy.contains('open-source', { matchCase: false }).should('exist');
      cy.contains('self-host', { matchCase: false }).should('exist');
    });

    it('should include MIT License information', () => {
      cy.visit('/terms');
      cy.contains('MIT License').should('exist');
    });
  });

  describe('Navigation', () => {
    it('should be accessible from footer', () => {
      cy.visit('/');
      cy.scrollTo('bottom');
      cy.get('footer a[href="/terms"]').should('exist').click();
      cy.url().should('include', '/terms');
    });

    it('should have back to home button', () => {
      cy.visit('/terms');
      cy.contains('Back to Home').should('exist');
    });

    it('should navigate back to home when back button is clicked', () => {
      cy.visit('/terms');
      cy.contains('Back to Home').first().click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('External Links', () => {
    it('should have link to GitHub repository', () => {
      cy.visit('/terms');
      cy.get('a[href*="github.com/TheEagleByte/scrumkit"]').should('exist');
    });

    it('should have proper rel attributes on external links', () => {
      cy.visit('/terms');
      cy.get('a[target="_blank"]').each($link => {
        cy.wrap($link).should('have.attr', 'rel').and('include', 'noopener');
      });
    });
  });

  describe('Content Details', () => {
    it('should explain service features', () => {
      cy.visit('/terms');
      cy.contains('Retrospective', { matchCase: false }).should('exist');
      cy.contains('Planning Poker', { matchCase: false }).should('exist');
    });

    it('should mention ScrumKit as open-source software', () => {
      cy.visit('/terms');
      cy.contains('ScrumKit').should('exist');
      cy.contains('open-source', { matchCase: false }).should('exist');
    });

    it('should explain account requirements', () => {
      cy.visit('/terms');
      cy.contains('account', { matchCase: false }).should('exist');
      cy.contains('password', { matchCase: false }).should('exist');
    });

    it('should explain acceptable use policies', () => {
      cy.visit('/terms');
      cy.contains('Prohibited Activities', { matchCase: false }).should('exist');
      cy.contains('Acceptable Use', { matchCase: false }).should('exist');
    });

    it('should explain intellectual property rights', () => {
      cy.visit('/terms');
      cy.contains('Intellectual Property').should('exist');
      cy.contains('MIT License').should('exist');
    });

    it('should include disclaimers and limitations', () => {
      cy.visit('/terms');
      cy.contains('AS IS', { matchCase: false }).should('exist');
      cy.contains('warranty', { matchCase: false }).should('exist');
      cy.contains('liability', { matchCase: false }).should('exist');
    });

    it('should explain modification rights', () => {
      cy.visit('/terms');
      cy.contains('modify', { matchCase: false }).should('exist');
      cy.contains('update', { matchCase: false }).should('exist');
    });

    it('should mention governing law and dispute resolution', () => {
      cy.visit('/terms');
      cy.contains('Governing Law').should('exist');
      cy.contains('Dispute Resolution', { matchCase: false }).should('exist');
    });
  });

  describe('Responsive Design', () => {
    it('should be readable on mobile devices', () => {
      cy.viewport(375, 667);
      cy.visit('/terms');
      cy.contains('Terms of Service').should('be.visible');
      cy.get('body').should('be.visible');
    });

    it('should be readable on tablet devices', () => {
      cy.viewport(768, 1024);
      cy.visit('/terms');
      cy.contains('Terms of Service').should('be.visible');
      cy.get('body').should('be.visible');
    });

    it('should be readable on desktop', () => {
      cy.viewport(1280, 720);
      cy.visit('/terms');
      cy.contains('Terms of Service').should('be.visible');
      cy.get('body').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.visit('/terms');
      cy.get('h1').should('have.length', 1);
      cy.get('h2').should('have.length.at.least', 1);
    });

    it('should have keyboard navigable links', () => {
      cy.visit('/terms');
      cy.get('a').first().focus();
      cy.focused().should('have.prop', 'tagName', 'A');
    });

    it('should have visible focus indicators', () => {
      cy.visit('/terms');
      cy.get('a').first().focus();
      cy.focused().should('be.visible');
    });
  });

  describe('Integration with Auth Form', () => {
    it('should have clickable Terms of Service link in auth form', () => {
      cy.visit('/auth');
      cy.contains('Terms of Service').should('exist');
      cy.get('a[href="/terms"]').should('exist');
    });

    it('should navigate to terms page from auth form link', () => {
      cy.visit('/auth');
      cy.get('a[href="/terms"]').click();
      cy.url().should('include', '/terms');
    });
  });

  describe('Legal Content', () => {
    it('should include MIT License text', () => {
      cy.visit('/terms');
      cy.contains('Permission is hereby granted', { matchCase: false }).should('exist');
    });

    it('should explain user rights and responsibilities', () => {
      cy.visit('/terms');
      cy.contains('responsibilities', { matchCase: false }).should('exist');
      cy.contains('rights', { matchCase: false }).should('exist');
    });

    it('should include contact information', () => {
      cy.visit('/terms');
      cy.contains('Contact Us').should('exist');
      cy.contains('GitHub', { matchCase: false }).should('exist');
    });
  });
});
