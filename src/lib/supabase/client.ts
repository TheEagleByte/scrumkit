import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Use a no-op lock function to suppress LockManager warnings
        // This is safe for our use case as we handle auth state properly
        lock: async <T>(_name: string, _acquireTimeout: number, fn: () => Promise<T>): Promise<T> => {
          // Simply execute the function without any locking
          return await fn();
        }
      }
    }
  );
}