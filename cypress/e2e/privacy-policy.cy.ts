describe('Privacy Policy', () => {
  describe('Page Load and Content', () => {
    it('should load privacy policy page', () => {
      cy.visit('/privacy');
      cy.contains('Privacy Policy').should('exist');
      cy.contains('Last Updated').should('exist');
    });

    it('should have proper page title', () => {
      cy.visit('/privacy');
      cy.title().should('contain', 'Privacy Policy');
    });

    it('should display all required content sections', () => {
      cy.visit('/privacy');

      // Check for main sections
      const sections = [
        'Information We Collect',
        'How We Use Information',
        'Data Storage & Security',
        'Your Rights',
        'Third-Party Services',
        'Cookie Policy',
        'Data Sharing and Disclosure',
        'Contact Us'
      ];

      sections.forEach(section => {
        cy.contains(section).should('exist');
      });
    });

    it('should display last updated date', () => {
      cy.visit('/privacy');
      cy.contains(/Last Updated:.*202\d/).should('exist');
    });

    it('should mention open source nature', () => {
      cy.visit('/privacy');
      cy.contains('open-source', { matchCase: false }).should('exist');
      cy.contains('self-host', { matchCase: false }).should('exist');
    });

    it('should include GDPR and CCPA compliance information', () => {
      cy.visit('/privacy');
      cy.contains('GDPR', { matchCase: false }).should('exist');
      cy.contains('CCPA', { matchCase: false }).should('exist');
    });
  });

  describe('Navigation', () => {
    it('should be accessible from footer', () => {
      cy.visit('/');
      cy.scrollTo('bottom');
      cy.get('footer a[href="/privacy"]').should('exist').click();
      cy.url().should('include', '/privacy');
    });

    it('should have back to home button', () => {
      cy.visit('/privacy');
      cy.contains('Back to Home').should('exist');
    });

    it('should navigate back to home when back button is clicked', () => {
      cy.visit('/privacy');
      cy.contains('Back to Home').first().click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('External Links', () => {
    it('should have working external links for third-party privacy policies', () => {
      cy.visit('/privacy');

      // Check Supabase links
      cy.get('a[href*="supabase.com/privacy"]').should('exist');

      // Check OAuth provider links
      cy.get('a[href*="google.com"]').should('exist');
      cy.get('a[href*="github.com"]').should('exist');
    });

    it('should have link to GitHub repository', () => {
      cy.visit('/privacy');
      cy.get('a[href*="github.com/TheEagleByte/scrumkit"]').should('exist');
    });

    it('should have proper rel attributes on external links', () => {
      cy.visit('/privacy');
      cy.get('a[target="_blank"]').each($link => {
        cy.wrap($link).should('have.attr', 'rel').and('include', 'noopener');
      });
    });
  });

  describe('Content Details', () => {
    it('should mention Supabase as data storage provider', () => {
      cy.visit('/privacy');
      cy.contains('Supabase').should('exist');
    });

    it('should mention OAuth providers', () => {
      cy.visit('/privacy');
      cy.contains('Google').should('exist');
      cy.contains('GitHub').should('exist');
    });

    it('should explain data collection practices', () => {
      cy.visit('/privacy');
      cy.contains('email', { matchCase: false }).should('exist');
      cy.contains('password', { matchCase: false }).should('exist');
    });

    it('should explain user rights', () => {
      cy.visit('/privacy');
      cy.contains('Right to Access', { matchCase: false }).should('exist');
      cy.contains('Right to Erasure', { matchCase: false }).should('exist');
      cy.contains('Right to Data Portability', { matchCase: false }).should('exist');
    });

    it('should explain cookie usage', () => {
      cy.visit('/privacy');
      cy.contains('cookie', { matchCase: false }).should('exist');
      cy.contains('Essential Cookies', { matchCase: false }).should('exist');
    });
  });

  describe('Responsive Design', () => {
    it('should be readable on mobile devices', () => {
      cy.viewport(375, 667);
      cy.visit('/privacy');
      cy.contains('Privacy Policy').should('be.visible');
      cy.get('body').should('be.visible');
    });

    it('should be readable on tablet devices', () => {
      cy.viewport(768, 1024);
      cy.visit('/privacy');
      cy.contains('Privacy Policy').should('be.visible');
      cy.get('body').should('be.visible');
    });

    it('should be readable on desktop', () => {
      cy.viewport(1280, 720);
      cy.visit('/privacy');
      cy.contains('Privacy Policy').should('be.visible');
      cy.get('body').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.visit('/privacy');
      cy.get('h1').should('have.length', 1);
      cy.get('h2').should('have.length.at.least', 1);
    });

    it('should have keyboard navigable links', () => {
      cy.visit('/privacy');
      cy.get('a').first().focus();
      cy.focused().should('have.prop', 'tagName', 'A');
    });

    it('should have visible focus indicators', () => {
      cy.visit('/privacy');
      cy.get('a').first().focus();
      cy.focused().should('be.visible');
    });
  });

  describe('Integration with Auth Form', () => {
    it('should have privacy policy reference in auth form', () => {
      cy.visit('/auth');
      cy.contains('Privacy Policy').should('exist');
    });
  });
});
