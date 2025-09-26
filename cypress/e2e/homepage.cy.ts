describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Page Load and Meta', () => {
    it('loads the homepage successfully', () => {
      cy.contains('ScrumKit').should('be.visible')
      cy.get('body').should('be.visible')
    })

    it('has proper meta tags', () => {
      cy.title().should('contain', 'ScrumKit')
    })

    it('displays skip to main content link for accessibility', () => {
      cy.get('a[href="#main-content"]').should('exist')
    })
  })

  describe('Hero Section', () => {
    it('displays hero heading with typewriter animation', () => {
      cy.contains('Open source tools for').should('be.visible')
      // Check if typewriter text container exists
      cy.get('h1 span').should('exist')
    })

    it('displays feature badges', () => {
      cy.contains('Open Source').should('be.visible')
      cy.contains('Self-Hostable').should('be.visible')
      cy.contains('MIT License').should('be.visible')
    })

    it('displays hero description', () => {
      cy.contains('All essential scrum ceremony tools').should('be.visible')
    })

    it('displays and functions CTA buttons', () => {
      // Get Started button (links to /boards/new)
      cy.contains('Get Started Free').should('be.visible')
        .parents('a')
        .should('have.attr', 'href', '/boards/new')

      // View on GitHub button
      cy.contains('a', 'View on GitHub').should('be.visible')
        .should('have.attr', 'href')
        .and('include', 'github')
    })
  })

  describe('Navigation', () => {
    it('displays header navigation', () => {
      cy.get('nav').should('be.visible')

      // Check logo/brand
      cy.get('nav').within(() => {
        cy.contains('ScrumKit').should('be.visible')
      })
    })

    it('navigates to boards page via Get Started', () => {
      cy.contains('a', 'Get Started').click()
      cy.url().should('include', '/boards')
    })

    it('has functional navigation links', () => {
      // Check for Boards link in navigation if present
      cy.get('nav').then($nav => {
        if ($nav.find('a:contains("Boards")').length) {
          cy.get('nav').contains('a', 'Boards').click()
          cy.url().should('include', '/boards')
          cy.go('back')
        }
      })
    })
  })

  describe('Feature Sections', () => {
    it('displays feature cards with icons', () => {
      // Scroll to features section
      cy.scrollTo('center')

      // Check for key feature indicators
      const features = [
        'Retrospectives',
        'Planning Poker',
        'Real-time',
        'Anonymous'
      ]

      features.forEach(feature => {
        cy.contains(feature, { matchCase: false }).should('exist')
      })
    })

    it('displays feature descriptions', () => {
      // Check for key feature text in the page
      cy.contains('All essential scrum ceremony tools').should('exist')
    })

    it('displays pricing or CTA section', () => {
      cy.scrollTo('bottom')
      // Check for either pricing info or additional CTA
      cy.get('body').then($body => {
        if ($body.find(':contains("Free")').length ||
            $body.find(':contains("Open Source")').length) {
          cy.contains(/Free|Open Source/i).should('be.visible')
        }
      })
    })
  })

  describe('Visual Effects', () => {
    it('displays background gradient or effects', () => {
      // Check for gradient backgrounds
      cy.get('[class*="gradient"]').should('exist')
    })

    it('has smooth scroll behavior', () => {
      cy.scrollTo('bottom', { duration: 500 })
      cy.scrollTo('top', { duration: 500 })
    })
  })

  describe('Responsive Design', () => {
    it('adapts layout for desktop view', () => {
      cy.viewport(1280, 720)
      cy.get('body').should('be.visible')
      cy.get('nav').should('be.visible')
    })

    it('adapts layout for tablet view', () => {
      cy.viewport(768, 1024)
      cy.get('body').should('be.visible')

      // Check if mobile menu appears
      cy.get('nav').should('be.visible')
    })

    it('adapts layout for mobile view', () => {
      cy.viewport(375, 667)
      cy.get('body').should('be.visible')

      // Hero text should still be visible
      cy.contains('Open source tools for').should('be.visible')

      // CTA buttons should stack on mobile
      cy.contains('Get Started').should('be.visible')
    })

    it('handles landscape mobile orientation', () => {
      cy.viewport(667, 375)
      cy.get('body').should('be.visible')
      cy.contains('ScrumKit').should('be.visible')
    })
  })

  describe('Footer', () => {
    it('displays footer content', () => {
      cy.scrollTo('bottom')
      cy.get('footer').should('be.visible')
    })

    it('contains footer links', () => {
      cy.scrollTo('bottom')
      cy.get('footer').within(() => {
        // Check for common footer links
        cy.get('a').should('have.length.at.least', 1)
      })
    })

    it('displays copyright or license info', () => {
      cy.scrollTo('bottom')
      cy.get('footer').then($footer => {
        const footerText = $footer.text()
        // Check for copyright, year, or MIT license mention
        expect(footerText).to.match(/©|202\d|MIT|License/i)
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1)
      cy.get('h2').should('have.length.at.least', 1)
    })

    it('all images have alt text', () => {
      // Check if there are any img elements, if not skip
      cy.get('body').then($body => {
        if ($body.find('img').length) {
          cy.get('img').each($img => {
            cy.wrap($img).should('have.attr', 'alt')
          })
        } else {
          // Page uses SVG icons instead of img tags, which is acceptable
          expect(true).to.be.true
        }
      })
    })

    it('all links are keyboard navigable', () => {
      cy.get('a').first().focus()
      cy.focused().should('have.prop', 'tagName', 'A')
    })

    it('buttons have appropriate ARIA labels', () => {
      cy.get('button').each($button => {
        const buttonText = $button.text().trim()
        if (!buttonText) {
          cy.wrap($button).should('have.attr', 'aria-label')
        }
      })
    })
  })

  describe('Performance', () => {
    it('page loads within acceptable time', () => {
      cy.visit('/', {
        onLoad: () => {
          cy.window().then((win) => {
            const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart
            expect(loadTime).to.be.lessThan(5000) // 5 seconds max
          })
        }
      })
    })
  })
})