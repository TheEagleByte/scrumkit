# Supabase Development Setup Guide

This guide provides instructions for setting up and working with Supabase in the ScrumKit project.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Environment Configuration](#environment-configuration)
3. [Database Migrations](#database-migrations)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- Docker installed (for local Supabase)
- Supabase CLI installed

### Install Supabase CLI

```bash
# Install via npm
npm install -g supabase

# Or via Homebrew (macOS)
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

### Start Local Supabase

```bash
# Start Supabase services
supabase start

# This will output your local credentials:
# API URL: http://localhost:54321
# GraphQL URL: http://localhost:54321/graphql/v1
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# Inbucket URL: http://localhost:54324
# JWT secret: your-super-secret-jwt-token
# anon key: your-anon-key
# service_role key: your-service-role-key
```

### Stop Local Supabase

```bash
# Stop all services
supabase stop

# Stop and reset database
supabase stop --no-backup
```

## Environment Configuration

### Development Environment

Create a `.env.local` file for local development:

```env
# Local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ScrumKit
```

### Production Environment

For production, use your Supabase cloud project credentials:

```env
# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=ScrumKit
```

## Database Migrations

### Creating a New Migration

```bash
# Create a new migration file
supabase migration new your_migration_name

# This creates a file in supabase/migrations/
# Edit the file with your SQL changes
```

### Running Migrations

```bash
# Run migrations on local database
supabase db push

# Run migrations on remote database
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

# Or link your project and push
supabase link --project-ref your-project-id
supabase db push
```

### Resetting the Database

```bash
# Reset local database (runs all migrations)
supabase db reset

# This will:
# 1. Drop all tables
# 2. Run all migrations
# 3. Run seed data (if configured)
```

### Generate TypeScript Types

```bash
# Generate types from local database
npx supabase gen types typescript --local > src/lib/supabase/types.ts

# Generate types from remote database
npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/types.ts
```

## Development Workflow

### 1. Start Development Environment

```bash
# Start Supabase
supabase start

# Start Next.js development server
npm run dev
```

### 2. Make Database Changes

1. Create a new migration: `supabase migration new feature_name`
2. Write your SQL in the migration file
3. Apply locally: `supabase db push`
4. Generate types: `npm run generate:types`
5. Test your changes

### 3. Seed Development Data

```bash
# Run seed data
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f supabase/seed/seed.sql

# Or using Supabase Studio
# Navigate to http://localhost:54323
# Go to SQL Editor and run the seed SQL
```

### 4. View Database

```bash
# Open Supabase Studio
open http://localhost:54323

# Or connect with any PostgreSQL client
# Connection string: postgresql://postgres:postgres@localhost:54322/postgres
```

## Testing

### Testing RLS Policies

```sql
-- Test as authenticated user
SET LOCAL role TO 'authenticated';
SET LOCAL request.jwt.claims.sub TO 'user-uuid-here';

-- Run your queries
SELECT * FROM retrospectives;

-- Reset role
RESET role;
```

### Testing Real-time Subscriptions

```javascript
// Test in browser console
const supabase = window.supabase; // If exposed globally

// Subscribe to changes
const subscription = supabase
  .channel('test')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'retrospective_items'
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();

// Clean up
subscription.unsubscribe();
```

## Troubleshooting

### Common Issues

#### 1. Connection Refused

```bash
# Check if Supabase is running
supabase status

# Restart if needed
supabase stop
supabase start
```

#### 2. Migration Conflicts

```bash
# View migration history
supabase migration list

# Repair migration history
supabase migration repair --status applied
```

#### 3. Type Generation Issues

```bash
# Clear and regenerate
rm src/lib/supabase/types.ts
npx supabase gen types typescript --local > src/lib/supabase/types.ts
```

#### 4. Auth Issues

- Ensure cookies are enabled
- Check if auth session is expired
- Verify environment variables are correct

### Debugging Tips

1. **Enable Debug Logging**
   ```javascript
   // In development, logs are enabled by default
   // Check browser console for detailed logs
   ```

2. **Check Supabase Logs**
   ```bash
   # View local Supabase logs
   supabase logs
   ```

3. **Inspect Network Requests**
   - Use browser DevTools Network tab
   - Check for failed requests to Supabase

4. **Validate Environment Variables**
   ```bash
   # The app validates on startup
   # Check console for validation errors
   ```

## Scripts

Add these helpful scripts to your `package.json`:

```json
{
  "scripts": {
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:migration:new": "supabase migration new",
    "supabase:migration:push": "supabase db push",
    "supabase:types": "supabase gen types typescript --local > src/lib/supabase/types.ts",
    "supabase:seed": "psql \"$DATABASE_URL\" -f supabase/seed/seed.sql"
  }
}
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [RLS Policy Examples](https://supabase.com/docs/guides/auth/row-level-security)