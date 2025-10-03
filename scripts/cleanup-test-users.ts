#!/usr/bin/env tsx

/**
 * Secure Test User Cleanup Script
 *
 * Safely removes test users created during E2E testing.
 * Multiple safety layers prevent accidental deletion of real users.
 *
 * Usage:
 *   npm run cleanup:test-users              # Dry-run (shows what would be deleted)
 *   npm run cleanup:test-users -- --execute # Actually delete users
 *   npm run cleanup:test-users -- --days=14 # Only delete users older than 14 days
 *   npm run cleanup:test-users -- --limit=50 # Delete max 50 users
 *
 * Safety features:
 *   - Dry-run mode by default
 *   - Only deletes users matching test email pattern
 *   - Environment check (refuses to run in production)
 *   - Age-based filtering (default: 7 days old)
 *   - Batch size limiting
 *   - Detailed logging
 *   - Requires explicit confirmation flag
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as readline from "readline";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Configuration
const TEST_EMAIL_PATTERN = /^test-\d+@example\.com$/;
const DEFAULT_MIN_AGE_DAYS = 7;
const DEFAULT_BATCH_SIZE = 100;
const MAX_BATCH_SIZE = 500;

interface CleanupOptions {
  execute: boolean;
  minAgeDays: number;
  limit: number;
  skipConfirmation: boolean;
}

interface TestUser {
  id: string;
  email: string;
  created_at: string;
}

// Parse command line arguments
function parseArgs(): CleanupOptions {
  const args = process.argv.slice(2);
  const options: CleanupOptions = {
    execute: false,
    minAgeDays: DEFAULT_MIN_AGE_DAYS,
    limit: DEFAULT_BATCH_SIZE,
    skipConfirmation: false,
  };

  for (const arg of args) {
    if (arg === "--execute") {
      options.execute = true;
    } else if (arg === "--yes" || arg === "-y") {
      options.skipConfirmation = true;
    } else if (arg.startsWith("--days=")) {
      const days = parseInt(arg.split("=")[1], 10);
      if (!isNaN(days) && days > 0) {
        options.minAgeDays = days;
      }
    } else if (arg.startsWith("--limit=")) {
      const limit = parseInt(arg.split("=")[1], 10);
      if (!isNaN(limit) && limit > 0) {
        options.limit = Math.min(limit, MAX_BATCH_SIZE);
      }
    }
  }

  return options;
}

// Safety check: Ensure we're not in production
function checkEnvironment(): void {
  const nodeEnv = process.env.NODE_ENV;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Refuse to run in production
  if (nodeEnv === "production") {
    console.error("❌ ERROR: This script cannot run in production environment");
    console.error("   Set NODE_ENV to 'development' or 'test'");
    process.exit(1);
  }

  // Warn if URL looks like production
  if (supabaseUrl && !supabaseUrl.includes("localhost") && !supabaseUrl.includes("127.0.0.1")) {
    console.warn("⚠️  WARNING: Supabase URL does not appear to be localhost");
    console.warn(`   URL: ${supabaseUrl}`);
    console.warn("   Ensure this is a test/development database");
  }
}

// Validate email matches test pattern
function isTestEmail(email: string): boolean {
  return TEST_EMAIL_PATTERN.test(email);
}

// Get user confirmation
async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
    });
  });
}

// Find test users to clean up
async function findTestUsers(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any, // Using any to avoid Supabase client type complications
  minAgeDays: number,
  limit: number
): Promise<TestUser[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - minAgeDays);

  console.log(`🔍 Searching for test users...`);
  console.log(`   Pattern: test-{timestamp}@example.com`);
  console.log(`   Created before: ${cutoffDate.toISOString()}`);
  console.log(`   Limit: ${limit} users\n`);

  // Query profiles table (safer than directly querying auth.users)
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, created_at")
    .ilike("email", "test-%@example.com")
    .lt("created_at", cutoffDate.toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch test users: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Double-check each email matches the exact pattern
  // Explicitly type and validate the results
  const validatedUsers: TestUser[] = [];

  // Cast to any[] to work around Supabase type inference issues
  // We validate each field below anyway
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profiles = data as any[];

  for (const profile of profiles) {
    // Type guard to ensure we have the expected fields
    if (
      profile &&
      typeof profile === 'object' &&
      'id' in profile &&
      'email' in profile &&
      'created_at' in profile &&
      typeof profile.email === 'string' &&
      isTestEmail(profile.email)
    ) {
      validatedUsers.push({
        id: profile.id as string,
        email: profile.email,
        created_at: profile.created_at as string,
      });
    }
  }

  return validatedUsers;
}

// Delete users via Supabase Admin API
async function deleteUsers(
  users: TestUser[],
  execute: boolean
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ ERROR: Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
    console.error("   This is required to delete users from auth.users");
    console.error("   Add it to .env.local from Supabase Dashboard > Settings > API");
    process.exit(1);
  }

  // Create admin client with service role key
  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`\n${execute ? "🗑️  Deleting" : "🔍 Would delete"} ${users.length} test users:\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    const age = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    console.log(
      `   ${execute ? "Deleting" : "Would delete"}: ${user.email} (${age} days old, id: ${user.id.slice(0, 8)}...)`
    );

    if (execute) {
      try {
        // Delete user from auth.users using admin API
        const { error } = await adminClient.auth.admin.deleteUser(user.id);

        if (error) {
          console.error(`   ❌ Failed: ${error.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Deleted successfully`);
          successCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`   ❌ Error: ${error}`);
        errorCount++;
      }
    }
  }

  if (execute) {
    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Deleted: ${successCount}`);
    console.log(`   Failed: ${errorCount}`);
  }
}

// Main cleanup function
async function cleanup() {
  console.log("🧹 Test User Cleanup Script\n");

  const options = parseArgs();

  // Safety checks
  checkEnvironment();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERROR: Missing Supabase environment variables");
    console.error("   Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Find test users
    const users = await findTestUsers(supabase, options.minAgeDays, options.limit);

    if (users.length === 0) {
      console.log("✨ No test users found matching criteria");
      return;
    }

    console.log(`📊 Found ${users.length} test user(s) to clean up\n`);

    // Show what will be deleted
    if (!options.execute) {
      console.log("ℹ️  DRY RUN MODE - No users will be deleted");
      console.log("   Run with --execute flag to actually delete users\n");
    }

    // Require confirmation if executing
    if (options.execute && !options.skipConfirmation) {
      console.log("\n⚠️  WARNING: This will permanently delete these users!");
      const confirmed = await confirm("Are you sure you want to continue?");

      if (!confirmed) {
        console.log("\n❌ Cleanup cancelled");
        process.exit(0);
      }
    }

    // Delete users
    await deleteUsers(users, options.execute);

    if (!options.execute) {
      console.log("\n💡 To actually delete these users, run:");
      console.log("   npm run cleanup:test-users -- --execute");
    }
  } catch (error) {
    console.error("\n❌ Error during cleanup:", error);
    process.exit(1);
  }
}

// Run cleanup
cleanup();
