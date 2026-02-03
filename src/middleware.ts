import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Public paths that bypass authentication.
 * /api/auth handles Better Auth session endpoints (login, register, callback).
 */
const publicPaths = ["/login", "/register", "/api/auth"];

/**
 * Protected route prefixes — unauthenticated users are redirected to /login.
 * Uses Set for O(1) lookup instead of chained OR conditions.
 * NOTE: /dashboard removed - auth handled by layout
 */
const protectedPrefixes = new Set([
  "/companies",
  "/contacts",
  "/deals",
  "/activities",
]);

/** Security headers applied to all responses */
const securityHeaders: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for public routes (login, register, auth API)
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Check Better Auth session cookie for protected routes
  const session = getSessionCookie(request);

  // Redirect authenticated users from / to /overview (dashboard)
  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  // Redirect to login if accessing a protected route without a session
  const isProtected =
    pathname === "/" ||
    [...protectedPrefixes].some((prefix) => pathname.startsWith(prefix));

  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return applySecurityHeaders(NextResponse.next());
}

/** Apply security headers to the response */
function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

/**
 * Matcher config — excludes Next.js internals and static assets.
 * Pattern: match all paths except _next/* and files with extensions (e.g., .css, .js, .png).
 */
export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
