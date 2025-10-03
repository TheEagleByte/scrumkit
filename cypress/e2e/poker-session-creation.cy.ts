describe('Poker Session Creation', () => {
  beforeEach(() => {
    // Poker sessions can be created anonymously, so no login required
    cy.visit('/poker/new');
  });

  it('should display the session creation form', () => {
    cy.contains('Create Planning Poker Session').should('be.visible');
    cy.get('[data-testid="session-title-input"]').should('be.visible');
    cy.get('[data-testid="create-session-button"]').should('be.visible');
  });

  it('should create session successfully with all fields', () => {
    // Fill form
    cy.get('[data-testid="session-title-input"]').type('Sprint 24 Planning');
    cy.get('textarea[name="description"]').type('Estimate stories for next sprint');

    // Verify default Fibonacci sequence is selected
    cy.get('button[role="combobox"]').should('contain', 'Fibonacci');

    // Submit
    cy.get('[data-testid="create-session-button"]').click();

    // Should redirect to new session
    cy.url().should('match', /\/poker\/[a-z0-9]+$/, { timeout: 10000 });
    cy.contains('Sprint 24 Planning').should('be.visible');
  });

  it('should create session with minimal required fields', () => {
    // Only fill title
    cy.get('[data-testid="session-title-input"]').type('Quick Session');

    // Submit
    cy.get('[data-testid="create-session-button"]').click();

    // Should redirect to new session
    cy.url().should('match', /\/poker\/[a-z0-9]+$/, { timeout: 10000 });
    cy.contains('Quick Session').should('be.visible');
  });

  it('should create session with T-Shirt sizing sequence', () => {
    cy.get('[data-testid="session-title-input"]').type('T-Shirt Planning');

    // Select T-Shirt sequence
    cy.get('button[role="combobox"]').click();
    cy.contains('T-Shirt Sizes').click();

    cy.get('[data-testid="create-session-button"]').click();

    // Should create successfully
    cy.url().should('match', /\/poker\/[a-z0-9]+$/, { timeout: 10000 });
  });

  it('should create session with custom sequence', () => {
    cy.get('[data-testid="session-title-input"]').type('Custom Estimation');

    // Select custom sequence
    cy.get('button[role="combobox"]').click();
    cy.contains('Custom Sequence').click();

    // Enter custom values
    cy.get('textarea[name="customSequence"]').type('1, 2, 3, 5, 8, 🚀');

    cy.get('[data-testid="create-session-button"]').click();

    // Should create successfully
    cy.url().should('match', /\/poker\/[a-z0-9]+$/, { timeout: 10000 });
  });

  it('should create session with emoji-only custom sequence', () => {
    cy.get('[data-testid="session-title-input"]').type('Emoji Estimation');

    // Select custom sequence
    cy.get('button[role="combobox"]').click();
    cy.contains('Custom Sequence').click();

    // Enter emoji values
    cy.get('textarea[name="customSequence"]').type('🚀, 🏃, 🚶, 🐌, ☕');

    cy.get('[data-testid="create-session-button"]').click();

    // Should create successfully
    cy.url().should('match', /\/poker\/[a-z0-9]+$/, { timeout: 10000 });
  });

  it('should show validation error for missing title', () => {
    // Try to submit without title
    cy.get('[data-testid="create-session-button"]').click();

    // Should show validation error
    cy.contains('Title is required').should('be.visible');
    // Should stay on creation page
    cy.url().should('include', '/poker/new');
  });

  it('should show error for invalid custom sequence (too few values)', () => {
    cy.get('[data-testid="session-title-input"]').type('Invalid Custom');

    cy.get('button[role="combobox"]').click();
    cy.contains('Custom Sequence').click();

    // Enter too few values (< 3)
    cy.get('textarea[name="customSequence"]').type('1, 2');

    cy.get('[data-testid="create-session-button"]').click();

    // Should show validation error
    cy.contains(/must have between 3 and 20/i).should('be.visible');
    // Should stay on creation page
    cy.url().should('include', '/poker/new');
  });

  it('should show error for empty custom sequence', () => {
    cy.get('[data-testid="session-title-input"]').type('Empty Custom');

    cy.get('button[role="combobox"]').click();
    cy.contains('Custom Sequence').click();

    // Leave custom sequence empty
    cy.get('[data-testid="create-session-button"]').click();

    // Should show validation error
    cy.contains(/must have between 3 and 20/i).should('be.visible');
    // Should stay on creation page
    cy.url().should('include', '/poker/new');
  });

  it('should allow toggling session settings', () => {
    cy.get('[data-testid="session-title-input"]').type('Settings Test');

    // Toggle auto-reveal
    cy.contains('Auto-reveal votes').parent().parent().find('button[role="switch"]').click();
    cy.contains('Auto-reveal votes').parent().parent().find('button[role="switch"]').should('have.attr', 'data-state', 'checked');

    // Toggle allow revote
    cy.contains('Allow revoting').parent().parent().find('button[role="switch"]').click();
    cy.contains('Allow revoting').parent().parent().find('button[role="switch"]').should('have.attr', 'data-state', 'unchecked');

    // Toggle show voter names
    cy.contains('Show voter names').parent().parent().find('button[role="switch"]').click();
    cy.contains('Show voter names').parent().parent().find('button[role="switch"]').should('have.attr', 'data-state', 'unchecked');

    cy.get('[data-testid="create-session-button"]').click();

    // Should create successfully
    cy.url().should('match', /\/poker\/[a-z0-9]+$/, { timeout: 10000 });
  });

  it('should have working cancel button', () => {
    cy.get('[data-testid="session-title-input"]').type('Cancel Test');

    // Click cancel
    cy.get('[data-testid="cancel-session-button"]').click();

    // Should navigate back (or show unsaved changes dialog)
    // The form now has unsaved changes protection, so it might show a dialog
    // If dialog appears, cancel it and verify we stay on the page
    cy.get('body').then(($body) => {
      if ($body.text().includes('Unsaved changes')) {
        cy.contains('Discard changes').click();
      }
    });

    // Should eventually navigate away from /poker/new
    cy.url().should('not.include', '/poker/new');
  });

  it('should have working back button', () => {
    // Click back button
    cy.get('[data-testid="back-to-sessions"]').click();

    // Should navigate back to poker sessions list
    cy.url().should('match', /\/poker$/);
  });

  it('should show unsaved changes dialog when navigating away with changes', () => {
    // Make a change
    cy.get('[data-testid="session-title-input"]').type('Unsaved Test');

    // Try to navigate back
    cy.get('[data-testid="back-to-sessions"]').click();

    // Should show unsaved changes dialog
    cy.contains('Unsaved changes').should('be.visible');
    cy.contains('You have unsaved changes').should('be.visible');

    // Test "Continue editing"
    cy.contains('Continue editing').click();
    cy.url().should('include', '/poker/new');

    // Try again and discard
    cy.get('[data-testid="back-to-sessions"]').click();
    cy.contains('Discard changes').click();

    // Should navigate away
    cy.url().should('match', /\/poker$/);
  });

  it('should disable form controls while submitting', () => {
    cy.get('[data-testid="session-title-input"]').type('Submit Test');

    // Intercept the creation request to slow it down
    cy.intercept('POST', '**/rest/v1/poker_sessions*', (req) => {
      req.on('response', (res) => {
        res.setDelay(1000);
      });
    }).as('createSession');

    cy.get('[data-testid="create-session-button"]').click();

    // Controls should be disabled during submission
    cy.get('[data-testid="session-title-input"]').should('be.disabled');
    cy.get('[data-testid="create-session-button"]').should('be.disabled');
    cy.get('[data-testid="cancel-session-button"]').should('be.disabled');

    // Wait for request to complete
    cy.wait('@createSession');
  });

  it('should create multiple sessions with unique URLs', () => {
    // Create first session
    cy.get('[data-testid="session-title-input"]').type('Session 1');
    cy.get('[data-testid="create-session-button"]').click();

    // Wait for redirect and capture URL
    cy.url().should('match', /\/poker\/[a-z0-9]+$/, { timeout: 10000 });
    cy.url().then((url1) => {
      const sessionUrl1 = url1.split('/').pop();

      // Go back and create another session
      cy.visit('/poker/new');
      cy.get('[data-testid="session-title-input"]').type('Session 2');
      cy.get('[data-testid="create-session-button"]').click();

      // Verify second session has different URL
      cy.url().should('match', /\/poker\/[a-z0-9]+$/, { timeout: 10000 });
      cy.url().then((url2) => {
        const sessionUrl2 = url2.split('/').pop();
        expect(sessionUrl1).to.not.equal(sessionUrl2);
      });
    });
  });

  it('should persist session after creation and page reload', () => {
    cy.get('[data-testid="session-title-input"]').type('Persistence Test');
    cy.get('[data-testid="create-session-button"]').click();

    // Wait for redirect
    cy.url().should('match', /\/poker\/[a-z0-9]+$/, { timeout: 10000 });
    cy.contains('Persistence Test').should('be.visible');

    // Reload page
    cy.reload();

    // Session should still be accessible
    cy.contains('Persistence Test').should('be.visible');
  });

  it('should handle long titles and descriptions', () => {
    const longTitle = 'A'.repeat(200); // Within 255 char limit
    const longDescription = 'B'.repeat(500); // Within 1000 char limit

    cy.get('[data-testid="session-title-input"]').type(longTitle);
    cy.get('textarea[name="description"]').type(longDescription);

    cy.get('[data-testid="create-session-button"]').click();

    // Should create successfully
    cy.url().should('match', /\/poker\/[a-z0-9]+$/, { timeout: 10000 });
  });

  it('should show error for title exceeding max length', () => {
    const tooLongTitle = 'A'.repeat(256); // Exceeds 255 char limit

    cy.get('[data-testid="session-title-input"]').type(tooLongTitle);
    cy.get('[data-testid="create-session-button"]').click();

    // Should show validation error
    cy.contains(/Title is too long/i).should('be.visible');
    cy.url().should('include', '/poker/new');
  });
});
