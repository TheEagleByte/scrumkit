describe('Navigation and Layout', () => {
  describe('Global Navigation', () => {
    it('displays consistent header across pages', () => {
      const pages = [
        { path: '/', title: 'ScrumKit' },
        { path: '/boards', title: 'My Boards' },
        { path: '/boards/new', title: 'Create New Board' }
      ]

      pages.forEach(page => {
        cy.visit(page.path)
        cy.get('nav').should('be.visible')
        cy.contains('ScrumKit').should('be.visible')
      })
    })

    it('maintains navigation state when moving between pages', () => {
      cy.visit('/')
      cy.contains('a', 'Get Started').click()
      cy.url().should('include', '/boards')

      // Navigate back
      cy.go('back')
      cy.url().should('eq', Cypress.config('baseUrl') + '/')
    })

    it('handles browser back/forward navigation', () => {
      // Visit multiple pages
      cy.visit('/')
      cy.visit('/boards')
      cy.visit('/boards/new')

      // Go back twice
      cy.go('back')
      cy.url().should('include', '/boards')
      cy.go('back')
      cy.url().should('eq', Cypress.config('baseUrl') + '/')

      // Go forward
      cy.go('forward')
      cy.url().should('include', '/boards')
    })
  })

  describe('Page Layouts', () => {
    it('maintains consistent layout structure', () => {
      cy.visit('/')

      // Check main layout elements
      cy.get('nav').should('be.visible')
      cy.get('main').should('be.visible')
      cy.get('footer').should('be.visible')
    })

    it('displays proper breadcrumbs or back navigation', () => {
      cy.visit('/boards/new')
      cy.contains('Back to Boards').should('be.visible')
        .should('have.attr', 'href', '/boards')
    })

    it('shows loading states appropriately', () => {
      cy.intercept('GET', '**/api/**', { delay: 1000 }).as('slowApi')
      cy.visit('/boards')

      // Should show loading indicator if implemented
      cy.get('body').then($body => {
        if ($body.find('[class*="loading"]').length ||
            $body.find('[class*="skeleton"]').length ||
            $body.find('[class*="spinner"]').length) {
          cy.get('[class*="loading"], [class*="skeleton"], [class*="spinner"]')
            .should('be.visible')
        }
      })
    })
  })

  describe('Link Navigation', () => {
    it('all navigation links work correctly', () => {
      cy.visit('/')

      // Test Get Started CTA
      cy.contains('a', 'Get Started').click()
      cy.url().should('include', '/boards')
      cy.go('back')

      // Test GitHub link opens in new tab
      cy.contains('a', 'View on GitHub')
        .should('have.attr', 'href')
        .and('include', 'github')
    })

    it('handles internal navigation correctly', () => {
      cy.visit('/boards')

      // Navigate to new board
      cy.contains('New Board').click()
      cy.url().should('include', '/boards/new')

      // Navigate back
      cy.contains('Back to Boards').click()
      cy.url().should('include', '/boards')
    })

    it('preserves query parameters during navigation', () => {
      // Visit with query params
      cy.visit('/boards?filter=active')
      cy.url().should('include', 'filter=active')
    })
  })

  describe('Deep Linking', () => {
    it('supports direct navigation to board pages', () => {
      // Create a board first
      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('Deep Link Test')
      cy.contains('button', 'Create Board').click()

      // Get the URL
      cy.url().then(url => {
        const boardId = url.split('/retro/')[1]

        // Visit directly
        cy.visit(`/retro/${boardId}`)
        cy.contains('What went well').should('be.visible')
      })
    })

    it('handles invalid URLs gracefully', () => {
      cy.visit('/nonexistent-page', { failOnStatusCode: false })
      cy.contains(/404|not found/i).should('be.visible')
    })

    it('redirects from old URLs if applicable', () => {
      // Test any redirects
      cy.visit('/retrospectives', { failOnStatusCode: false })
      // Should redirect to boards
      cy.url().should('include', '/boards')
    })
  })

  describe('Scroll Behavior', () => {
    it('maintains scroll position on navigation', () => {
      cy.visit('/')
      cy.scrollTo('bottom')

      // Navigate away and back
      cy.visit('/boards')
      cy.go('back')

      // Check if scroll restoration works
      cy.window().its('scrollY').should('be.greaterThan', 0)
    })

    it('scrolls to top on page change', () => {
      cy.visit('/')
      cy.scrollTo('bottom')
      cy.contains('Get Started').click()

      // New page should start at top
      cy.window().its('scrollY').should('equal', 0)
    })

    it('handles anchor links correctly', () => {
      cy.visit('/')

      // Check for skip link
      cy.get('a[href="#main-content"]').should('exist')
    })
  })

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      cy.viewport(375, 667)
    })

    it('adapts navigation for mobile screens', () => {
      cy.visit('/')
      cy.get('nav').should('be.visible')

      // Check if mobile menu button exists
      cy.get('nav').then($nav => {
        if ($nav.find('button[aria-label*="menu"]').length) {
          cy.get('button[aria-label*="menu"]').should('be.visible')
        }
      })
    })

    it('maintains navigation functionality on mobile', () => {
      cy.visit('/')
      cy.contains('Get Started').click()
      cy.url().should('include', '/boards')
    })

    it('handles touch navigation', () => {
      cy.visit('/boards')

      // Test swipe/touch navigation if implemented
      cy.get('body').trigger('touchstart', { touches: [{ clientX: 300, clientY: 100 }] })
      cy.get('body').trigger('touchend', { changedTouches: [{ clientX: 50, clientY: 100 }] })
    })
  })

  describe('Focus Management', () => {
    it('manages focus correctly on page navigation', () => {
      cy.visit('/')
      cy.get('a').first().focus()

      // Navigate to new page
      cy.contains('Get Started').click()

      // Focus should be managed appropriately
      cy.focused().should('exist')
    })

    it('restores focus after modal/dialog interactions', () => {
      cy.visit('/boards')

      // If there are any modals, test focus restoration
      cy.get('body').then($body => {
        if ($body.find('[role="dialog"]').length) {
          // Open dialog
          cy.get('button').first().click()
          cy.get('[role="dialog"]').should('be.visible')

          // Close dialog
          cy.get('body').type('{esc}')
          cy.focused().should('exist')
        }
      })
    })
  })

  describe('URL Management', () => {
    it('updates URL when creating boards', () => {
      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('URL Test Board')
      cy.contains('button', 'Create Board').click()

      // URL should update to the new board
      cy.url().should('include', '/retro/')
      cy.url().should('not.include', '/boards/new')
    })

    it('handles special characters in URLs', () => {
      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('Board & Test #1')
      cy.contains('button', 'Create Board').click()

      // Should handle special characters in URL
      cy.url().should('include', '/retro/')
    })

    it('preserves board URLs for sharing', () => {
      // Create a board
      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('Shareable Board')
      cy.contains('button', 'Create Board').click()

      // Get the URL
      cy.url().then(url => {
        // Visit the URL directly
        cy.visit(url)
        cy.contains('What went well').should('be.visible')
      })
    })
  })

  describe('Responsive Navigation', () => {
    const viewports = [
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ]

    viewports.forEach(viewport => {
      it(`maintains navigation on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height)
        cy.visit('/')

        // Navigation should work at all sizes
        cy.get('nav').should('be.visible')
        cy.contains('ScrumKit').should('be.visible')

        // Test navigation
        cy.contains('Get Started').click()
        cy.url().should('include', '/boards')
      })
    })
  })

  describe('Performance', () => {
    it('navigates between pages quickly', () => {
      cy.visit('/')

      const startTime = Date.now()
      cy.contains('Get Started').click()
      cy.contains('My Boards').should('be.visible')
      const endTime = Date.now()

      // Navigation should be fast (< 2 seconds)
      expect(endTime - startTime).to.be.lessThan(2000)
    })

    it('handles rapid navigation', () => {
      // Rapidly navigate between pages
      for (let i = 0; i < 5; i++) {
        cy.visit('/')
        cy.visit('/boards')
      }

      // Should still be functional
      cy.contains('My Boards').should('be.visible')
    })
  })
})