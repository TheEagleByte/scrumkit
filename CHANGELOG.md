# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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
