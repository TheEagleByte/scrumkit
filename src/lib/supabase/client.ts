import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        lock: {
          // Disable Navigator LockManager to suppress the warning
          // This is safe for our use case as we're not using multiple tabs
          // with the same session concurrently
          enabled: false
        }
      }
    }
  );
}