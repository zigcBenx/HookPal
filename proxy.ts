import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Routes that don't require login
const publicRoutes = ["/", "/login", "/register"];

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Always allow NextAuth API routes (login/logout/callback handling)
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Logged-in users visiting login/register → send to dashboard
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Not logged in, trying to access protected page → send to login
  if (!isPublicRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes: only admins allowed
  if (pathname.startsWith("/admin") && session?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Tell Next.js which routes the proxy should run on.
// This regex skips static files and images for performance.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
