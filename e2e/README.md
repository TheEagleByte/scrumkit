# ScrumKit E2E Testing with Playwright

## Overview

This directory contains end-to-end (E2E) tests for ScrumKit using [Playwright](https://playwright.dev/). Playwright provides reliable, fast, and cross-browser testing capabilities with excellent developer experience and AI tooling integration.

### Why Playwright?

- **Cross-browser testing**: Chromium, Firefox, and WebKit
- **Mobile & responsive testing**: Built-in device emulation
- **Better debugging**: Trace viewer, UI mode, VS Code integration
- **Faster execution**: Parallel test execution
- **Modern APIs**: Auto-waiting, web-first assertions
- **AI integration**: Better integration with AI-assisted development tools

## Setup

### Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm install`)

### Initial Setup

1. Install Playwright browsers:
```bash
npx playwright install
```

2. (Optional) Install system dependencies:
```bash
sudo npx playwright install-deps
```

3. Ensure environment variables are configured:
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Running Tests

### All Tests

```bash
npm run test:e2e
```

### Specific Browser

```bash
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### Mobile Devices

```bash
npm run test:e2e:mobile
```

### Interactive UI Mode

```bash
npm run test:e2e:ui
```

### Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

### Debug Mode

```bash
npm run test:e2e:debug
```

### View Test Report

```bash
npm run test:e2e:report
```

### Run Specific Test File

```bash
npx playwright test e2e/tests/auth/signin.spec.ts
```

### Run Tests Matching a Pattern

```bash
npx playwright test --grep "sign in"
```

## Directory Structure

```
e2e/
├── README.md                 # This file
├── tests/                    # Test files organized by feature
│   ├── auth/                 # Authentication tests
│   ├── retro/                # Retrospective board tests
│   ├── poker/                # Planning poker tests
│   ├── dashboard/            # Dashboard & navigation tests
│   └── public/               # Public pages tests
├── fixtures/                 # Test data and fixtures
│   ├── test-users.json       # Test user accounts
│   └── ...
├── utils/                    # Helper utilities
│   ├── auth.ts               # Authentication helpers
│   └── ...
└── pages/                    # Page Object Models
    ├── AuthPage.ts           # Auth page POM
    └── ...
```

## Test Categories

### Authentication & User Management

**Authenticated User Tests:**
- ✅ Sign up flow (validation, errors, success, email verification)
- ✅ Sign in flow (validation, errors, success)
- ✅ Email verification and confirmation feedback
- ✅ OAuth flows (Google, GitHub)
- ✅ Session management and persistence
- ✅ Password reset flow
- ✅ Profile management (view, edit, avatar)
- ✅ User settings and preferences

**Unauthenticated/Guest Tests:**
- ✅ Guest access to retrospective boards
- ✅ Anonymous poker session participation
- ✅ Continue as guest functionality
- ✅ Session handling for anonymous users

### Retrospective Boards

**Board Management:**
- ✅ Board creation with different templates
- ✅ Custom board configuration
- ✅ Board listing and navigation
- ✅ Board archive and deletion
- ✅ Board sharing and permissions

**Board Features:**
- ✅ Item CRUD operations (create, read, update, delete)
- ✅ Voting system (upvote, downvote, vote counts)
- ✅ Drag and drop functionality (reordering, column changes)
- ✅ Real-time collaboration (multiple users)
- ✅ Facilitator features (timer, reveal, lock)
- ✅ Export functionality (CSV, JSON)
- ✅ Action items tracking

### Planning Poker

**Session Management:**
- ✅ Session creation with custom settings
- ✅ Estimation sequence selection (Fibonacci, T-Shirt, Linear, Powers of 2)
- ✅ Custom sequence creator (numbers, text, emojis)
- ✅ Session listing and history
- ✅ Session deletion
- ✅ Anonymous session tracking (cookies)

**Session Features:**
- ✅ Story management (CRUD operations)
- ✅ Voting mechanics (submit votes, reveal votes, consensus)
- ✅ Participant management (join, leave, presence)
- ✅ Real-time updates (votes, reveals, participants)
- ✅ Timer functionality
- ✅ Discussion features
- ✅ Import/export functionality
- ✅ Auto-reveal on all votes submitted

### Dashboard & Navigation

- ✅ Dashboard layout and sections
- ✅ Board archive and history
- ✅ Global navigation
- ✅ Breadcrumb navigation
- ✅ Settings navigation
- ✅ Profile navigation
- ✅ Responsive navigation menu

### Public Pages

- ✅ Homepage and marketing content
- ✅ Privacy policy page
- ✅ Terms of service page
- ✅ Footer links (GitHub, documentation)
- ✅ External link handling

### Cross-Cutting Concerns

**Accessibility Testing:**
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ ARIA attributes and roles
- ✅ Focus management
- ✅ Color contrast
- ✅ Alt text for images

**Responsive Testing:**
- ✅ Mobile phones (320px, 375px, 414px)
- ✅ Tablets (768px, 1024px)
- ✅ Desktop (1280px, 1440px, 1920px)
- ✅ Orientation changes (portrait/landscape)
- ✅ Touch interactions
- ✅ Responsive navigation
- ✅ Responsive layouts

**Error Handling & Edge Cases:**
- ✅ Network errors
- ✅ API errors
- ✅ Form validation errors
- ✅ 404 pages
- ✅ 500 errors
- ✅ Offline behavior
- ✅ Invalid URLs

**Loading States & Async Operations:**
- ✅ Loading spinners
- ✅ Skeleton screens
- ✅ Progress indicators
- ✅ Optimistic updates
- ✅ Error boundaries

**Real-time Features:**
- ✅ WebSocket connection handling
- ✅ Real-time updates for boards
- ✅ Real-time updates for poker
- ✅ Presence indicators
- ✅ Connection recovery
- ✅ Offline/online status

**End-to-End User Journeys:**
- ✅ Complete user signup → board creation → collaboration flow
- ✅ Complete poker session creation → voting → completion flow
- ✅ Guest user → signup → claim assets flow

## Writing Tests

### Best Practices

1. **Use Page Object Models**: Keep selectors and page interactions in POM classes
2. **Use Fixtures**: Store test data in JSON fixtures
3. **Use Descriptive Names**: Test names should clearly describe what they test
4. **Avoid Hard Waits**: Use Playwright's auto-waiting features
5. **Test One Thing**: Each test should focus on a single scenario
6. **Clean Up**: Reset state after tests when needed
7. **Use Web-First Assertions**: `expect(locator).toBeVisible()` vs `expect(await locator.isVisible()).toBe(true)`

### Example Test

```typescript
import { test, expect } from '@playwright/test'
import { AuthPage } from '../../pages/AuthPage'

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.goto()

    await authPage.signIn('user@example.com', 'password')

    await expect(page).toHaveURL('/dashboard')
  })
})
```

### Test Organization

- Group related tests using `test.describe()`
- Use `test.beforeEach()` for common setup
- Use `test.afterEach()` for cleanup
- Use `test.skip()` for temporarily disabled tests
- Use `test.only()` for debugging (remove before committing!)

### Test Data & User Management

**Dynamic User Creation:**
- Tests create fresh user accounts dynamically using unique timestamp-based emails (e.g., `test-1234567890@example.com`)
- No need to pre-seed test users in the database
- Each test run is isolated and independent
- Users are created via the actual signup flow, providing true E2E testing

**Example:**
```typescript
async function createTestUser(authPage: AuthPage) {
  const timestamp = Date.now()
  const user = {
    name: 'Test User',
    email: `test-${timestamp}@example.com`,
    password: 'TestPassword123!',
  }

  // Create user via signup
  await authPage.goto()
  await authPage.switchToSignUp()
  await authPage.signUp(user.name, user.email, user.password)

  // Wait for redirect and clear session
  await authPage.page.waitForURL(/\/dashboard/, { timeout: 10000 })
  await authPage.page.context().clearCookies()

  return user
}
```

**Test User Cleanup:**

Test users accumulate in the database over time. A secure cleanup script is provided:

```bash
# Dry-run (shows what would be deleted, safe to run anytime)
npm run cleanup:test-users

# Actually delete test users (requires confirmation)
npm run cleanup:test-users -- --execute

# Delete users older than 14 days
npm run cleanup:test-users -- --execute --days=14

# Limit to 50 users max
npm run cleanup:test-users -- --execute --limit=50

# Skip confirmation (for CI/CD automation)
npm run cleanup:test-users -- --execute --yes
```

**Safety Features:**
- ✅ Dry-run mode by default (won't delete unless `--execute` is specified)
- ✅ Only deletes users matching exact pattern: `test-{timestamp}@example.com`
- ✅ Refuses to run in production environment (`NODE_ENV=production`)
- ✅ Warns if Supabase URL doesn't look like localhost
- ✅ Age-based filtering (default: only deletes users older than 7 days)
- ✅ Batch size limiting (default: 100 users, max: 500)
- ✅ Requires confirmation prompt before deletion
- ✅ Detailed logging of all operations
- ✅ Uses Supabase Admin API for proper user deletion

**Requirements:**
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (found in Supabase Dashboard > Settings > API)
- This key has elevated permissions - keep it secret and never commit it

**For CI/CD:**
- Run cleanup periodically (e.g., weekly) or after test runs
- Use `--execute --yes --days=1` to auto-delete recent test users without confirmation
- Consider using a separate test database to avoid cleanup entirely

**Test Data Fixtures:**
- Static test data stored in `e2e/fixtures/*.json`
- Use for non-user test data (settings, configurations, etc.)
- Avoid using fixtures for user accounts - create them dynamically instead

## Debugging

### VS Code Integration

1. Install the [Playwright VS Code extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
2. Set breakpoints in your tests
3. Run tests from the Testing sidebar

### Trace Viewer

When a test fails on first retry, a trace is automatically captured:

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

### Screenshots

Screenshots are automatically taken on failure and stored in `test-results/`

### Headed Mode

Run tests in headed mode to watch them execute:

```bash
npm run test:e2e:headed
```

### Debug Mode

Run tests in debug mode with step-by-step execution:

```bash
npm run test:e2e:debug
```

## Device & Browser Coverage

### Browsers
- Chromium (Chrome, Edge)
- Firefox
- WebKit (Safari)

### Devices
- Desktop (1920x1080, 1280x720)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
- iPad Pro (Portrait & Landscape)

### Viewports
- Mobile: 320px, 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1440px, 1920px

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Pull requests
- Push to main branch
- Manual workflow dispatch

Configuration in `.github/workflows/playwright.yml` (to be created)

### Parallel Execution

Tests run in parallel for faster execution:
- Local: Uses all CPU cores
- CI: Configured for optimal performance

### Artifacts

Test artifacts are uploaded on failure:
- Screenshots
- Videos
- Traces
- Test reports

## Common Issues

### Port Already in Use

If port 3000 is already in use:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

Or update `playwright.config.ts` to use a different port.

### Browser Not Installed

```bash
npx playwright install
```

### Test Timeouts

Increase timeout in test or config:
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000) // 60 seconds
  // ...
})
```

### Flaky Tests

- Use `test.retry()` to retry flaky tests
- Ensure proper waits and assertions
- Check for race conditions
- Review real-time/async interactions

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [VS Code Extension](https://playwright.dev/docs/getting-started-vscode)

## Contributing

When adding new tests:
1. Follow the established directory structure
2. Use Page Object Models for page interactions
3. Add fixtures for test data
4. Include descriptive test names
5. Test across multiple browsers/devices
6. Document any new utilities or helpers
7. Update this README if adding new test categories
