import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      logger.error('Missing Supabase environment variables', undefined, {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      return supabaseResponse;
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              supabaseResponse = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            } catch {
              // This happens when cookies are set from a Server Component
              // Log for debugging but don't throw
              logger.debug('Cookie setting in middleware (expected in Server Components)', {
                pathname: request.nextUrl.pathname,
                cookieCount: cookiesToSet.length,
              });
            }
          },
        },
      }
    );

    // Refresh session if expired
    const { error } = await supabase.auth.getUser();

    if (error && error.message !== 'Auth session missing') {
      // Log actual auth errors, but not missing sessions (common for anonymous users)
      logger.warn('Auth session refresh error', {
        error: error.message,
        pathname: request.nextUrl.pathname,
      });
    }
  } catch (error) {
    // Log unexpected errors but don't crash the middleware
    logger.error('Middleware error', error as Error, {
      pathname: request.nextUrl.pathname,
      method: request.method,
    });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};