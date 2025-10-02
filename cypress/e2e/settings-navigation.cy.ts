describe('Settings Navigation', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
  });

  describe('Navigation to Settings', () => {
    it('should navigate to settings page from user menu', () => {
      cy.visit('/dashboard');

      // Open user menu
      cy.get('button[class*="rounded-full"]').click();

      // Click settings
      cy.contains('Settings').click();

      // Should navigate to settings
      cy.url().should('include', '/settings');
      cy.contains('h1', 'Settings').should('be.visible');
    });

    it('should allow direct navigation to settings page', () => {
      cy.visit('/settings');

      // Should show settings page
      cy.url().should('include', '/settings');
      cy.contains('h1', 'Settings').should('be.visible');
    });

    it('should redirect unauthenticated users to auth page', () => {
      // Sign out first
      cy.clearCookies();
      cy.clearLocalStorage();

      cy.visit('/settings');

      // Should redirect to auth page
      cy.url().should('include', '/auth');
      cy.url().should('include', 'redirectTo=%2Fsettings');
    });
  });

  describe('Settings Page Layout', () => {
    beforeEach(() => {
      cy.visit('/settings');
    });

    it('should display page header and description', () => {
      cy.contains('h1', 'Settings').should('be.visible');
      cy.contains('Manage your application preferences').should('be.visible');
    });

    it('should display all settings tabs', () => {
      // Check for all tabs
      cy.contains('Account').should('be.visible');
      cy.contains('Notifications').should('be.visible');
      cy.contains('Appearance').should('be.visible');
      cy.contains('Privacy').should('be.visible');
    });

    it('should have accessible tab navigation', () => {
      // Account tab should be selected by default
      cy.get('[role="tablist"]').should('exist');
      cy.get('[role="tab"]').should('have.length', 4);
    });
  });

  describe('Tab Switching', () => {
    beforeEach(() => {
      cy.visit('/settings');
    });

    it('should switch to account tab', () => {
      cy.contains('[role="tab"]', 'Account').click();
      cy.contains('Account Settings').should('be.visible');
      cy.contains('Profile Information').should('be.visible');
    });

    it('should switch to notifications tab', () => {
      cy.contains('[role="tab"]', 'Notifications').click();
      cy.contains('Notification Preferences').should('be.visible');
      cy.contains('Email notifications').should('be.visible');
    });

    it('should switch to appearance tab', () => {
      cy.contains('[role="tab"]', 'Appearance').click();
      cy.contains('Appearance Settings').should('be.visible');
      cy.contains('Theme').should('be.visible');
    });

    it('should switch to privacy tab', () => {
      cy.contains('[role="tab"]', 'Privacy').click();
      cy.contains('Privacy & Security').should('be.visible');
      cy.contains('Data Management').should('be.visible');
    });
  });

  describe('Account Settings Tab', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.contains('[role="tab"]', 'Account').click();
    });

    it('should have link to profile page', () => {
      cy.contains('button', 'Go to Profile').should('be.visible').click();
      cy.url().should('include', '/profile');
    });

    it('should display email preferences section', () => {
      cy.contains('Email Preferences').should('be.visible');
      cy.contains('Marketing emails').should('be.visible');
      cy.contains('Weekly digest').should('be.visible');
    });
  });

  describe('Notifications Tab', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.contains('[role="tab"]', 'Notifications').click();
    });

    it('should display notification options', () => {
      cy.contains('Email notifications').should('be.visible');
      cy.contains('In-app notifications').should('be.visible');
      cy.contains('Board updates').should('be.visible');
      cy.contains('Vote reminders').should('be.visible');
      cy.contains('Planning poker updates').should('be.visible');
    });

    it('should indicate features are coming soon', () => {
      cy.contains('Notification settings will be available in a future update').should('be.visible');
    });
  });

  describe('Appearance Tab - Theme Switcher', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.contains('[role="tab"]', 'Appearance').click();
    });

    it('should display theme options', () => {
      cy.contains('Theme').should('be.visible');
      cy.contains('Light').should('be.visible');
      cy.contains('Dark').should('be.visible');
      cy.contains('System').should('be.visible');
    });

    it('should allow switching to light theme', () => {
      // Select light theme
      cy.get('label[for="light"]').click();

      // Verify theme is applied (check html class or data attribute)
      cy.get('html').should('have.class', 'light');
    });

    it('should allow switching to dark theme', () => {
      // Select dark theme
      cy.get('label[for="dark"]').click();

      // Verify theme is applied
      cy.get('html').should('have.class', 'dark');
    });

    it('should allow switching to system theme', () => {
      // Select system theme
      cy.get('label[for="system"]').click();

      // Verify the radio button is selected
      cy.get('#system').should('be.checked');
    });

    it('should persist theme selection across page reloads', () => {
      // Select light theme
      cy.get('label[for="light"]').click();
      cy.get('html').should('have.class', 'light');

      // Reload page
      cy.reload();

      // Theme should persist
      cy.get('html').should('have.class', 'light');
      cy.get('#light').should('be.checked');
    });

    it('should display additional display options', () => {
      cy.contains('Display').should('be.visible');
      cy.contains('Compact mode').should('be.visible');
      cy.contains('Animations').should('be.visible');
    });
  });

  describe('Privacy Tab', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.contains('[role="tab"]', 'Privacy').click();
    });

    it('should display privacy sections', () => {
      cy.contains('Data Management').should('be.visible');
      cy.contains('Privacy Controls').should('be.visible');
      cy.contains('Sessions').should('be.visible');
    });

    it('should show data export option', () => {
      cy.contains('Export My Data').should('be.visible');
    });

    it('should show privacy control toggles', () => {
      cy.contains('Public profile').should('be.visible');
      cy.contains('Activity tracking').should('be.visible');
    });

    it('should show session management option', () => {
      cy.contains('View Active Sessions').should('be.visible');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport(375, 667);
      cy.visit('/settings');
    });

    it('should display settings page on mobile', () => {
      cy.contains('h1', 'Settings').should('be.visible');
    });

    it('should allow tab navigation on mobile', () => {
      // Tabs should be scrollable/accessible on mobile
      cy.get('[role="tablist"]').should('be.visible');

      // Switch tabs
      cy.contains('[role="tab"]', 'Appearance').click();
      cy.contains('Theme').should('be.visible');
    });

    it('should have mobile-friendly theme toggle', () => {
      cy.contains('[role="tab"]', 'Appearance').click();
      cy.get('label[for="dark"]').click();
      cy.get('#dark').should('be.checked');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.visit('/settings');
    });

    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1);
      cy.get('h1').should('contain', 'Settings');
    });

    it('should have accessible tab controls', () => {
      cy.get('[role="tablist"]').should('exist');
      cy.get('[role="tab"]').each($tab => {
        cy.wrap($tab).should('have.attr', 'aria-selected');
      });
    });

    it('should support keyboard navigation for tabs', () => {
      // Focus on first tab
      cy.get('[role="tab"]').first().focus();

      // Navigate with arrow keys
      cy.focused().type('{rightarrow}');
      cy.focused().should('contain', 'Notifications');
    });

    it('should have accessible form controls', () => {
      cy.contains('[role="tab"]', 'Appearance').click();

      // Radio buttons should have labels
      cy.get('#light').should('exist');
      cy.get('label[for="light"]').should('exist');
    });
  });

  describe('Loading States', () => {
    it('should show loading state while authenticating', () => {
      // Intercept auth check
      cy.intercept('GET', '**/auth/**', { delay: 500 }).as('authCheck');

      cy.visit('/settings');

      // Should show loading spinner
      cy.get('[class*="animate-spin"]').should('exist');
    });
  });

  describe('Navigation Integration', () => {
    it('should maintain header across settings pages', () => {
      cy.visit('/settings');

      // Header should be present
      cy.get('nav').should('be.visible');
      cy.contains('ScrumKit').should('be.visible');
    });

    it('should allow navigation back to dashboard', () => {
      cy.visit('/settings');

      // Click on logo or dashboard link
      cy.contains('ScrumKit').click();

      // Should navigate away from settings
      cy.url().should('not.include', '/settings');
    });
  });
});
