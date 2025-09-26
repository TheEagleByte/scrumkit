# 🚀 ScrumKit - Open Source Scrum Toolkit

<div align="center">

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC)](https://tailwindcss.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/TheEagleByte/scrumkit/pulls)

**Open source tools for better sprints**

[Live Demo](https://scrumkit.dev) • [Documentation](./docs) • [Report Bug](https://github.com/TheEagleByte/scrumkit/issues) • [Request Feature](https://github.com/TheEagleByte/scrumkit/issues)

</div>

## 🎯 Overview

ScrumKit is a modern, self-hostable toolkit for agile development teams. It provides all essential scrum ceremony tools in one unified platform with real-time collaboration, beautiful UX, and deep developer tool integrations.

### ✨ Key Features

- **🔄 Sprint Retrospectives** - Real-time collaborative boards with 10+ built-in templates
- **🎲 Planning Poker** - Estimate stories together with customizable sequences
- **📊 Daily Standups** - Track progress and blockers efficiently
- **💚 Team Health Checks** - Monitor and improve team dynamics
- **🔒 Privacy-First** - Self-host your data or use our cloud version
- **⚡ Real-time Sync** - Live collaboration without refresh
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🔗 Integrations** - Connect with Slack, GitHub, Jira, and more

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/TheEagleByte/scrumkit.git
cd scrumkit

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your database and auth credentials

# Run database migrations
npm run db:push
npm run db:seed # Optional: Add sample data

# Start development server
npm run dev

# Open http://localhost:3000
```

### One-Click Deploy

Deploy your own instance with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TheEagleByte/scrumkit)
[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/template/scrumkit)

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **UI Components:** [Radix UI](https://radix-ui.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Supabase](https://supabase.com/)
- **Real-time:** [Supabase Realtime](https://supabase.com/docs/guides/realtime) (Postgres Changes, Presence, Broadcast)
- **State Management:** [TanStack Query](https://tanstack.com/query) + React Hooks
- **Authentication:** [Supabase Auth](https://supabase.com/auth) with anonymous user support
- **Type Safety:** [TypeScript](https://www.typescriptlang.org/) with strict mode

## 🔄 Real-time Architecture

ScrumKit provides a comprehensive real-time collaboration system built on Supabase Realtime:

### Core Real-time Features

- **📡 Postgres Changes Subscriptions**
  - Automatic synchronization of retrospective items across all clients
  - Real-time vote tracking and updates
  - Live retrospective status changes

- **👥 Presence Tracking**
  - See who's currently viewing the board
  - Color-coded user identification
  - Active/away status detection
  - User count display

- **🖱️ Live Cursor Tracking**
  - Real-time cursor position sharing
  - Smooth animations with throttled updates
  - User name labels on cursors
  - Container-relative positioning

- **🔌 Connection Management**
  - Visual connection status indicator
  - Automatic reconnection with exponential backoff
  - Manual reconnection option
  - Network quality monitoring

### Technical Implementation

The real-time system is implemented through custom React hooks:
- `useRetrospectiveRealtime()` - Manages Postgres change subscriptions
- `usePresence()` - Handles user presence state
- `useCursorTracking()` - Tracks and broadcasts cursor positions
- `useConnectionStatus()` - Monitors connection health
- `useBroadcast()` - Generic message broadcasting

All real-time features work seamlessly for both authenticated and anonymous users.

## 📦 Features

### 🔄 ScrumKit Retro

Create and run sprint retrospectives with your team:

- **Anonymous & Authenticated modes** - Choose your privacy level
- **10+ Templates** - Mad/Sad/Glad, Start/Stop/Continue, 4Ls, and more
- **Real-time collaboration** - See changes as they happen
- **Voting system** - Prioritize discussion topics
- **Action items** - Track follow-ups from retrospectives
- **Export options** - Markdown, PDF, or integrate with your tools

### 🎲 ScrumKit Poker

Estimate stories as a team with planning poker:

- **Multiple sequences** - Fibonacci, T-shirt sizes, custom values
- **Story import** - Pull from GitHub, Jira, or Linear
- **Synchronized reveal** - Show all votes at once
- **Velocity tracking** - Monitor team estimation patterns
- **Discussion timer** - Keep estimation sessions focused

### 📊 ScrumKit Daily

Run efficient daily standups:

- **Yesterday/Today/Blockers** format
- **Parking lot** for off-topic items
- **Round-robin timer** - Equal speaking time
- **Async updates** - Perfect for distributed teams
- **Blocker escalation** - Notify relevant stakeholders

### 💚 ScrumKit Health

Monitor team health and morale:

- **Spotify health check model** - Industry-standard metrics
- **Custom metrics** - Define what matters to your team
- **Trend tracking** - See improvements over time
- **Anonymous feedback** - Honest insights
- **Heat map visualization** - Spot issues quickly

## 🔌 Integrations

### Available Now
- **Slack** - Post summaries, create action items
- **GitHub** - Import/export issues, link PRs

### Coming Soon
- **Jira** - Full sprint synchronization
- **Linear** - Bi-directional issue sync
- **Google Calendar** - Schedule ceremonies
- **Microsoft Teams** - Native integration
- **GitLab** - Issue management

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] Project initialization
- [x] Core retrospective board
- [x] Real-time collaboration (Postgres changes, Presence, Cursor tracking)
- [x] Connection status management
- [x] Anonymous user support
- [ ] Basic planning poker
- [x] Authentication system

### Phase 2: Enhanced Features
- [ ] Team management
- [ ] Slack integration
- [ ] Daily standup board
- [ ] Analytics dashboard

### Phase 3: Scale & Polish
- [ ] Mobile apps
- [ ] Enterprise features
- [ ] Advanced analytics
- [ ] AI-powered insights

View our [detailed roadmap](./docs/ROADMAP.md) for more information.

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

```bash
# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ScrumKit is open source software [licensed as MIT](./LICENSE).

## 💬 Community & Support

- **[GitHub Discussions](https://github.com/TheEagleByte/scrumkit/discussions)** - Ask questions and share ideas
- **[Discord Server](https://discord.gg/scrumkit)** - Real-time chat with the community
- **[Bug Reports](https://github.com/TheEagleByte/scrumkit/issues)** - Report issues you find
- **[Feature Requests](https://github.com/TheEagleByte/scrumkit/issues)** - Suggest new features

## 🙏 Acknowledgments

- Built with amazing open source projects
- Inspired by agile teams worldwide
- Special thanks to all contributors

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/TheEagleByte/scrumkit?style=social)
![GitHub forks](https://img.shields.io/github/forks/TheEagleByte/scrumkit?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/TheEagleByte/scrumkit?style=social)

---

<div align="center">
Made with ❤️ by the ScrumKit Team

[Website](https://scrumkit.dev)
</div>