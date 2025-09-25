import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/profile',
  '/settings',
  '/team',
  '/organization',
];

// Define public routes that should redirect authenticated users
const AUTH_ROUTES = [
  '/auth',
  '/auth/signin',
  '/auth/signup',
];

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

    // Get current user session
    const { data: { user }, error } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

    // Handle protected routes - redirect to auth if not authenticated
    if (isProtectedRoute && !user) {
      const redirectUrl = new URL('/auth', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Handle auth routes - redirect to home if already authenticated
    if (isAuthRoute && user) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/retro';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Log auth errors except for expected "missing session" errors
    if (error && error.message !== 'Auth session missing') {
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