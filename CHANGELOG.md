# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Planning Poker Statistics & Analytics** (Issue #23 - EPIC-003 Story 7)
  - Comprehensive session statistics with key metrics dashboard
  - Consensus percentage calculation and display (votes within 1 step of mode)
  - Estimation velocity tracking (stories per hour, average time per story)
  - Participant contribution breakdown with vote counts
  - Estimate distribution visualization with bar charts
  - Session summary component showing:
    - Stories completed (estimated/pending/skipped)
    - Average and median estimation time per story
    - Overall consensus rate across all stories
    - Active participant count
    - Most common estimates
  - CSV export functionality for session data including:
    - Story details (title, estimate, votes, time taken)
    - Vote distribution and consensus metrics
    - Participant contributions
    - Session summary statistics
  - Real-time statistics updates as stories are estimated
  - Export button with loading states and validation
  - Visual indicators for high consensus (≥70%)
- **Planning Poker Custom Estimation Sequences** (Issue #22 - EPIC-003 Story 6)
  - Custom sequence creator in session setup form
  - Support for numbers, text, and emoji values in custom sequences
  - Validation for 3-20 values in custom sequences
  - Emoji suggestions for fun sequences (speed, size, effort categories)
  - Examples: 🚀, 🏃, 🚶, 🐌, ☕, 🔥, ❄️, etc.
  - Parse and validate custom sequence values automatically
  - Custom sequences stored in database and used during voting
- **Planning Poker Story/Ticket Management** (Issue #18 - EPIC-003 Story 2)
  - Add, edit, and delete stories for estimation
  - Story form with fields: title, description, acceptance criteria, external link
  - Drag-and-drop story reordering with visual feedback
  - Set current story being estimated with clear visual indication
  - Story navigation controls (previous/next/jump to story)
  - Story status tracking (pending, voting, revealed, estimated, skipped)
  - Bulk CSV import for stories with validation and preview
  - CSV template download for easy import
  - Story queue display with action menus
  - Delete stories with 5-second undo capability
  - Real-time story updates across all participants
  - Support for anonymous sessions via cookie-based permissions
- **Planning Poker Session Management** (Issue #17 - EPIC-003 Story 1)
  - Create poker sessions with unique shareable URLs
  - Estimation sequence selection (Fibonacci, T-shirt sizes, Linear, Powers of 2)
  - Configurable session settings (auto-reveal, allow revoting, show voter names)
  - Session listing and history with active/archived filtering
  - End and archive session functionality
  - Delete sessions with undo capability
  - Cookie-based session tracking for anonymous users
  - Session rejoin capability after disconnection
  - Real-time infrastructure for poker sessions (channels and subscriptions)
- **Timer & Facilitation Tools** (Issue #15 - MVP Story 8)
  - Countdown timer component with presets (5, 10, 15, 20 minutes) and custom duration
  - Phase management system with 4 phases: Brainstorm, Group, Vote, Discuss
  - Focus mode to highlight one column at a time with visual dimming of others
  - Facilitator control panel with tabbed interface for all tools
  - Sound notifications for timer completion, phase changes, and focus mode toggles
  - Real-time synchronization of facilitator actions across all connected users
  - Compact displays in board header showing active timer, current phase, and focused column
  - Visual ring effect on focused columns
  - Configurable sound settings stored in localStorage
