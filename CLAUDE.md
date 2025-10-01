# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build production bundle
npm run build

# Run production server
npm start

# Run linting
npm run lint
```

## Architecture Overview

**ScrumKit** is a Sprint Retrospective Board application built with Next.js 15 and React 19, using the App Router architecture.

### Technology Stack

- **Framework**: Next.js 15 with Turbopack
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS v4 with CSS-in-JS support
- **Forms**: React Hook Form with Zod validation
- **Type Safety**: TypeScript with strict mode enabled
- **Backend**: Supabase for database, authentication, and real-time subscriptions
- **Database**: PostgreSQL with Row Level Security (RLS)

### Key Architectural Patterns

1. **Component Structure**: The application uses a modular component architecture with:
   - Reusable UI primitives in `src/components/ui/`
   - Feature components like `RetrospectiveBoard` managing complex state
   - Client-side interactivity using `"use client"` directive where needed

2. **State Management**: Local component state with React hooks for the retrospective board functionality

3. **Path Aliases**: Uses `@/*` alias for `./src/*` imports

### Core Application Features

**Retrospective Board** (`src/components/RetrospectiveBoard.tsx`):
- Four-column layout (What went well, What could be improved, Blockers, Action items)
- Real-time item creation and deletion
- Voting system for prioritization
- Author attribution for accountability

**Planning Poker** (`src/app/poker/*`):
- Session creation with customizable settings
- Estimation sequences (Fibonacci, T-shirt, Linear, Powers of 2)
- Session management and history
- Cookie-based anonymous session tracking
- Real-time participant presence (future stories)
- Voting and reveal system (future stories)

## Supabase Configuration

### Database Schema

The application uses the following database structure:

**Retrospective Features:**
- **organizations**: Multi-tenant organizations
- **teams**: Development teams within organizations
- **profiles**: User profiles linked to auth.users
- **retrospectives**: Sprint retrospective sessions
- **retrospective_columns**: Column types for each retrospective
- **retrospective_items**: Individual items in each column
- **votes**: User votes on retrospective items
- **action_items**: Follow-up tasks from retrospectives

**Planning Poker Features:**
- **poker_sessions**: Planning poker estimation sessions
- **poker_stories**: Stories/tickets to be estimated
- **poker_participants**: Session participants
- **poker_votes**: Story estimate votes

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Client Configuration

- Browser client: `src/lib/supabase/client.ts`
- Server client: `src/lib/supabase/server.ts`
- TypeScript types: `src/lib/supabase/types.ts`

### Real-time Features

The following tables have real-time enabled:

**Retrospectives:**
- `retrospective_items` - Live updates for board items
- `votes` - Real-time vote tracking
- `retrospectives` - Session status updates
- `action_items` - Action item tracking

**Planning Poker:**
- `poker_sessions` - Session state changes
- `poker_stories` - Story updates
- `poker_participants` - Participant presence
- `poker_votes` - Vote submissions and reveals

### Seed Data

To seed the database with sample data, run the SQL in `supabase/seed/seed.sql` through the Supabase Dashboard SQL editor.

## Authentication Testing

### Running Auth Tests

```bash
# Run all auth tests
npm run cypress -- --spec "cypress/e2e/auth-*.cy.ts"

# Run specific auth test suite
npm run cypress -- --spec "cypress/e2e/auth-signin.cy.ts"

# Run in headless mode
npm run cypress:headless -- --spec "cypress/e2e/auth-*.cy.ts"
```

### Test Users

Test users are defined in `cypress/fixtures/test-users.json`. Ensure these users exist in your test Supabase instance before running tests.

### Auth Flow Overview

1. **Signup**: User provides email, password, full name → email verification sent
2. **Email Verification**: User clicks link from email → account activated, profile created automatically
3. **Signin**: User provides email, password → authenticated session
4. **Session**: Persists across page reloads, managed by Supabase Auth
5. **Signout**: Clears session, redirects to auth page

### Auth Documentation

See `docs/AUTH.md` for comprehensive authentication documentation including:
- User flows and security features
- Protected routes and session management
- Troubleshooting guide
- API reference

## Available MCP Servers

### Supabase MCP Server

The Supabase MCP server is configured and provides access to:

- **Project Management**: Create, pause, restore projects
- **Database Operations**: Execute SQL, apply migrations, manage tables
- **Schema Generation**: Generate TypeScript types from database schema
- **Edge Functions**: Deploy and manage Edge Functions
- **Branch Management**: Create and manage development branches
- **Monitoring**: Get logs, check advisors for security/performance

**When to use**: Use the Supabase MCP server when you need to:
- Apply database migrations
- Generate TypeScript types from the database
- Deploy Edge Functions
- Check logs or security advisors
- Manage development branches

### Other MCP Servers

Additional MCP servers may be available for:
- **context7**: Library documentation and code examples
- **sequential-thinking**: Complex problem-solving and planning
- **playwright**: Browser automation and UI testing
- **ide**: Code diagnostics and execution

**Note**: Use the appropriate MCP server based on the task requirements. Check available servers with their specific capabilities when needed.
