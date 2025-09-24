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

### Key Architectural Patterns

1. **Component Structure**: The application uses a modular component architecture with:
   - Reusable UI primitives in `src/components/ui/`
   - Feature components like `RetrospectiveBoard` managing complex state
   - Client-side interactivity using `"use client"` directive where needed

2. **State Management**: Local component state with React hooks for the retrospective board functionality

3. **Path Aliases**: Uses `@/*` alias for `./src/*` imports

### Core Application Flow

The main retrospective board (`src/components/RetrospectiveBoard.tsx`) implements:

- Four-column layout (What went well, What could be improved, Blockers, Action items)
- Real-time item creation and deletion
- Voting system for prioritization
- Author attribution for accountability
