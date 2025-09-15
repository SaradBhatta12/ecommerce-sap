import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPath = pathname.startsWith("/admin");
  const isDashboardPath = pathname.startsWith("/dashboard");
  const isAuthPath = pathname.startsWith("/auth");

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Skip static files, public assets, and NextAuth internal routes
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images") ||
    /\.(jpg|jpeg|png|gif|svg|ico|css|js|webp)$/i.test(pathname) ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/api/auth/signin") ||
    pathname.startsWith("/api/auth/signout") ||
    pathname.startsWith("/api/auth/session") ||
    pathname.startsWith("/api/auth/csrf") ||
    pathname.startsWith("/api/auth/providers")
  ) {
    return NextResponse.next();
  }

  // Admin path protection
  if (isAdminPath) {
    if (!token || token.role !== "admin") {
      const url = new URL("/auth", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Dashboard path protection
  if (isDashboardPath) {
    if (!token || token.role !== "user") {
      const url = new URL("/auth", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Prevent logged in users from accessing auth page
  if (isAuthPath && token) {
    const redirectPath = token.role === "user" ? "/dashboard" : "/admin";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|robots.txt|sitemap.xml).*)",
    "/api/auth/callback/:path*",
  ],
};
