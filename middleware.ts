import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPath = pathname.startsWith("/admin");
  const isDashboardPath = pathname.startsWith("/dashboard");
  const isAuthPath = pathname.startsWith("/auth");
  const isApiPath = pathname.startsWith("/api");

  // Skip static files, public assets, and NextAuth internal routes
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public") ||
    /\.(jpg|jpeg|png|gif|svg|ico|css|js|webp|woff|woff2|ttf|eot)$/i.test(pathname) ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/api/auth/signin") ||
    pathname.startsWith("/api/auth/signout") ||
    pathname.startsWith("/api/auth/session") ||
    pathname.startsWith("/api/auth/csrf") ||
    pathname.startsWith("/api/auth/providers") ||
    pathname.startsWith("/api/auth/callback")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // CSP header for better security
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://khalti.s3.ap-south-1.amazonaws.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.khalti.com https://khalti.s3.ap-south-1.amazonaws.com;
    frame-src 'self' https://khalti.com;
  `.replace(/\s{2,}/g, ' ').trim();
  
  response.headers.set('Content-Security-Policy', cspHeader);

  // Admin path protection
  if (isAdminPath) {
    if (!token || (token.role !== "admin" && token.role !== "superadmin")) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Dashboard path protection
  if (isDashboardPath) {
    if (!token) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // API route protection
  if (isApiPath && !pathname.startsWith("/api/auth")) {
    // Add rate limiting headers (basic implementation)
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99');
    
    // Protect admin API routes
    if (pathname.startsWith("/api/admin")) {
      if (!token || (token.role !== "admin" && token.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    
    return response;
  }

  // Prevent logged in users from accessing auth page
  if (isAuthPath && token) {
    const redirectPath = token.role === "admin" || token.role === "superadmin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|public|robots.txt|sitemap.xml).*)",
    "/api/:path*",
  ],
};
