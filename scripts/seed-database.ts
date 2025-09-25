#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

// Note: Direct SQL execution not supported via client SDK
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log("Starting database seed...");

  try {
    // Read the seed SQL file
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const seedSql = fs.readFileSync(
      path.join(process.cwd(), "supabase", "seed", "seed.sql"),
      "utf8"
    );

    // Note: For production, you would use the Supabase Management API
    // or run this through the Supabase CLI
    console.log("Seed data should be run through Supabase Dashboard SQL editor or Supabase CLI");
    console.log("Run the following command:");
    console.log("psql $DATABASE_URL -f supabase/seed/seed.sql");

    console.log("\nAlternatively, copy the contents of supabase/seed/seed.sql");
    console.log("and run it in the Supabase Dashboard SQL editor");

  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();