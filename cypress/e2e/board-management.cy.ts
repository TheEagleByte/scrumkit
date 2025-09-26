describe('Board Management', () => {
  beforeEach(() => {
    // Clear local storage to start fresh
    cy.clearLocalStorage()
    cy.visit('/boards')
  })

  describe('Boards List Page', () => {
    it('displays boards page with proper heading', () => {
      cy.contains('h1', 'My Boards').should('be.visible')
      cy.contains('Manage your retrospective boards').should('be.visible')
    })

    it('displays new board button', () => {
      cy.contains('New Board').should('be.visible')
        .parent()
        .should('have.attr', 'href', '/boards/new')
    })

    it('shows empty state for new users', () => {
      // For anonymous users with no boards
      cy.get('body').then($body => {
        if ($body.find('[data-testid="board-card"]').length === 0) {
          // Should show some indication that there are no boards
          cy.contains(/no boards|create.*first|get started/i).should('exist')
        }
      })
    })

    it('displays info box for anonymous users', () => {
      cy.contains('Your boards are saved locally').should('be.visible')
      cy.contains('Clear your cookies and you').should('be.visible')
    })

    it('shows stats cards when boards exist', () => {
      // Create a board first
      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('Test Board for Stats')
      cy.contains('button', 'Create Board').click()

      // Go back to boards page
      cy.visit('/boards')

      // Check for stats cards
      cy.contains('Active Boards').should('be.visible')
      cy.contains('Templates Used').should('be.visible')
      cy.contains('Total Created').should('be.visible')
    })
  })

  describe('Board Creation', () => {
    beforeEach(() => {
      cy.visit('/boards/new')
    })

    it('displays board creation form', () => {
      cy.contains('h1', 'Create New Board').should('be.visible')
      cy.get('input[id="title"]').should('be.visible')
      cy.contains('Choose a Template').should('be.visible')
    })

    it('shows back to boards navigation', () => {
      cy.contains('Back to Boards').should('be.visible')
        .click()
      cy.url().should('include', '/boards')
    })

    it('validates empty board title', () => {
      cy.contains('button', 'Create Board').click()
      // Should stay on same page or show error
      cy.url().should('include', '/boards/new')
    })

    it('creates board with default template', () => {
      const boardTitle = `Sprint ${Date.now()} Retrospective`

      cy.get('input[id="title"]').type(boardTitle)
      cy.contains('button', 'Create Board').click()

      // Should redirect to the new board
      cy.url().should('include', '/retro/')

      // Board should be functional
      cy.contains('What went well').should('be.visible')
      cy.contains('What could be improved').should('be.visible')
    })

    it('creates board with Mad Sad Glad template', () => {
      const boardTitle = `Mad Sad Glad ${Date.now()}`

      cy.get('input[id="title"]').type(boardTitle)

      // Select Mad Sad Glad template
      cy.contains('Mad Sad Glad').click()
      cy.contains('button', 'Create Board').click()

      cy.url().should('include', '/retro/')
    })

    it('creates board with Start Stop Continue template', () => {
      const boardTitle = `Start Stop Continue ${Date.now()}`

      cy.get('input[id="title"]').type(boardTitle)

      // Select Start Stop Continue template
      cy.contains('Start Stop Continue').click()
      cy.contains('button', 'Create Board').click()

      cy.url().should('include', '/retro/')
    })

    it('creates board with 4 Ls template', () => {
      const boardTitle = `4Ls Retro ${Date.now()}`

      cy.get('input[id="title"]').type(boardTitle)

      // Select 4 Ls template
      cy.contains('4 Ls').click()
      cy.contains('button', 'Create Board').click()

      cy.url().should('include', '/retro/')
    })

    it('creates board with Sailboat template', () => {
      const boardTitle = `Sailboat ${Date.now()}`

      cy.get('input[id="title"]').type(boardTitle)

      // Select Sailboat template
      cy.contains('Sailboat').click()
      cy.contains('button', 'Create Board').click()

      cy.url().should('include', '/retro/')
    })

    it('creates board with Plus Delta template', () => {
      const boardTitle = `Plus Delta ${Date.now()}`

      cy.get('input[id="title"]').type(boardTitle)

      // Select Plus Delta template
      cy.contains('Plus Delta').click()
      cy.contains('button', 'Create Board').click()

      cy.url().should('include', '/retro/')
    })

    it('handles long board titles', () => {
      const longTitle = 'A'.repeat(100) + ' Retrospective'

      cy.get('input[id="title"]').type(longTitle)
      cy.contains('button', 'Create Board').click()

      cy.url().should('include', '/retro/')
    })

    it('handles special characters in board title', () => {
      const specialTitle = 'Test & Review #1 @ 2024! (Sprint)'

      cy.get('input[id="title"]').type(specialTitle)
      cy.contains('button', 'Create Board').click()

      cy.url().should('include', '/retro/')
    })

    it('shows template descriptions', () => {
      cy.contains('The classic retrospective format').should('be.visible')
      cy.contains('Express emotions about the sprint').should('be.visible')
    })

    it('highlights selected template', () => {
      // Click on a template
      cy.contains('Mad Sad Glad').click()

      // Check if it has selected styling (ring or border change)
      cy.contains('Mad Sad Glad')
        .parents('[class*="card"]')
        .should('have.class', 'ring-2')
    })
  })

  describe('Board List Management', () => {
    beforeEach(() => {
      // Create a few test boards
      const boards = [
        'Active Board 1',
        'Active Board 2',
        'Board to Archive'
      ]

      boards.forEach(title => {
        cy.visit('/boards/new')
        cy.get('input[id="title"]').type(title)
        cy.contains('button', 'Create Board').click()
        cy.visit('/boards')
      })
    })

    it('displays created boards in the list', () => {
      cy.contains('Active Board 1').should('be.visible')
      cy.contains('Active Board 2').should('be.visible')
      cy.contains('Board to Archive').should('be.visible')
    })

    it('navigates to board when clicked', () => {
      cy.contains('Active Board 1').click()
      cy.url().should('include', '/retro/')
      cy.contains('What went well').should('be.visible')
    })

    it('displays board metadata', () => {
      // Check for template info or creation date
      cy.get('[data-testid="board-card"]').first().within(() => {
        // Should show template or date info
        cy.get('[class*="text-muted"]').should('exist')
      })
    })

    it('shows correct active board count', () => {
      cy.contains('Active Boards')
        .parent()
        .within(() => {
          cy.contains('3').should('be.visible')
        })
    })
  })

  describe('Board Archiving', () => {
    beforeEach(() => {
      // Create boards to archive
      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('Board to Archive')
      cy.contains('button', 'Create Board').click()
      cy.visit('/boards')
    })

    it('archives a board', () => {
      // Find and archive the board
      cy.contains('Board to Archive')
        .parents('[data-testid="board-card"]')
        .within(() => {
          cy.get('button[aria-label*="archive" i]').click()
        })

      // Board should disappear from active list
      cy.contains('Board to Archive').should('not.exist')

      // Archive count should appear
      cy.contains(/Archived.*1/i).should('be.visible')
    })

    it('shows archived boards when toggled', () => {
      // Archive a board first
      cy.contains('Board to Archive')
        .parents('[data-testid="board-card"]')
        .within(() => {
          cy.get('button[aria-label*="archive" i]').click()
        })

      // Click on archived toggle
      cy.contains('button', /Archived/i).click()

      // Should show archived boards
      cy.contains('Board to Archive').should('be.visible')

      // Should show "Show Active" button
      cy.contains('Show Active').should('be.visible')
    })

    it('unarchives a board', () => {
      // Archive a board
      cy.contains('Board to Archive')
        .parents('[data-testid="board-card"]')
        .within(() => {
          cy.get('button[aria-label*="archive" i]').click()
        })

      // Switch to archived view
      cy.contains('button', /Archived/i).click()

      // Unarchive the board
      cy.contains('Board to Archive')
        .parents('[data-testid="board-card"]')
        .within(() => {
          cy.get('button[aria-label*="unarchive" i]').click()
        })

      // Should automatically switch back to active view
      cy.contains('Board to Archive').should('be.visible')
    })

    it('updates stats when archiving boards', () => {
      // Get initial active count
      cy.contains('Active Boards')
        .parent()
        .within(() => {
          cy.contains('1').should('be.visible')
        })

      // Archive the board
      cy.contains('Board to Archive')
        .parents('[data-testid="board-card"]')
        .within(() => {
          cy.get('button[aria-label*="archive" i]').click()
        })

      // Active count should decrease
      cy.contains('Active Boards')
        .parent()
        .within(() => {
          cy.contains('0').should('be.visible')
        })

      // Archived count should show
      cy.contains(/Archived.*1/i).should('be.visible')
    })
  })

  describe('Local Storage Persistence', () => {
    it('persists boards after page refresh', () => {
      // Create a board
      cy.visit('/boards/new')
      const boardTitle = `Persistent Board ${Date.now()}`
      cy.get('input[id="title"]').type(boardTitle)
      cy.contains('button', 'Create Board').click()

      // Go back to boards
      cy.visit('/boards')
      cy.contains(boardTitle).should('be.visible')

      // Refresh the page
      cy.reload()

      // Board should still be there
      cy.contains(boardTitle).should('be.visible')
    })

    it('boards persist across different pages', () => {
      // Create a board
      cy.visit('/boards/new')
      const boardTitle = `Cross Page Board ${Date.now()}`
      cy.get('input[id="title"]').type(boardTitle)
      cy.contains('button', 'Create Board').click()

      // Navigate to home
      cy.visit('/')

      // Navigate back to boards
      cy.visit('/boards')

      // Board should still be there
      cy.contains(boardTitle).should('be.visible')
    })

    it('clears boards when local storage is cleared', () => {
      // Create a board
      cy.visit('/boards/new')
      const boardTitle = `Clearable Board ${Date.now()}`
      cy.get('input[id="title"]').type(boardTitle)
      cy.contains('button', 'Create Board').click()

      cy.visit('/boards')
      cy.contains(boardTitle).should('be.visible')

      // Clear local storage
      cy.clearLocalStorage()
      cy.reload()

      // Board should be gone
      cy.contains(boardTitle).should('not.exist')
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid board creation', () => {
      for (let i = 0; i < 3; i++) {
        cy.visit('/boards/new')
        cy.get('input[id="title"]').type(`Rapid Board ${i}`)
        cy.contains('button', 'Create Board').click()
      }

      cy.visit('/boards')
      cy.contains('Rapid Board 0').should('be.visible')
      cy.contains('Rapid Board 1').should('be.visible')
      cy.contains('Rapid Board 2').should('be.visible')
    })

    it('handles board creation with empty spaces', () => {
      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('   Trimmed Title   ')
      cy.contains('button', 'Create Board').click()

      cy.url().should('include', '/retro/')
    })

    it('handles navigation during board creation', () => {
      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('Interrupted Board')

      // Navigate away before creating
      cy.visit('/boards')

      // Go back and create
      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('Completed Board')
      cy.contains('button', 'Create Board').click()

      cy.url().should('include', '/retro/')
    })
  })

  describe('Responsive Behavior', () => {
    it('adapts board grid on desktop', () => {
      cy.viewport(1280, 720)
      cy.visit('/boards')

      // Should show grid layout
      cy.get('[data-testid="board-card"]').then($cards => {
        if ($cards.length > 1) {
          // Cards should be in a grid
          const firstCard = $cards[0].getBoundingClientRect()
          const secondCard = $cards[1].getBoundingClientRect()
          expect(firstCard.top).to.be.closeTo(secondCard.top, 10)
        }
      })
    })

    it('stacks boards on mobile', () => {
      cy.viewport(375, 667)
      cy.visit('/boards')

      // Create a couple boards first
      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('Mobile Board 1')
      cy.contains('button', 'Create Board').click()

      cy.visit('/boards/new')
      cy.get('input[id="title"]').type('Mobile Board 2')
      cy.contains('button', 'Create Board').click()

      cy.visit('/boards')

      // Cards should stack vertically on mobile
      cy.get('[data-testid="board-card"]').then($cards => {
        if ($cards.length > 1) {
          const firstCard = $cards[0].getBoundingClientRect()
          const secondCard = $cards[1].getBoundingClientRect()
          expect(secondCard.top).to.be.greaterThan(firstCard.bottom)
        }
      })
    })
  })
})