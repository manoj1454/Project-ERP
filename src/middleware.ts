import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read JWT token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const userRole = token?.role as string | undefined;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isFinancialsRoute = pathname.startsWith("/financials") || pathname.startsWith("/invoices");
  const isInternalErpRoute =
    pathname.startsWith("/crm") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/kanban") ||
    pathname.startsWith("/tasks") ||
    pathname.startsWith("/time-tracking") ||
    pathname.startsWith("/assets");
  const isClientPortalRoute = pathname.startsWith("/portal");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // 1. Redirect authenticated users away from /login and /register
  if (isAuthPage) {
    if (isAuthenticated) {
      if (userRole === "CLIENT") {
        return NextResponse.redirect(new URL("/portal", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // 2. Unauthenticated check for protected routes
  const isProtectedRoute =
    isFinancialsRoute || isInternalErpRoute || isClientPortalRoute || isDashboardRoute;

  if (isProtectedRoute && !isAuthenticated) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
  }

  // 3. Strict RBAC Enforcement
  if (isAuthenticated && userRole) {
    // Financials Route: SUPERADMIN only
    if (isFinancialsRoute && userRole !== "SUPERADMIN") {
      const unauthorizedUrl = new URL("/unauthorized", req.url);
      unauthorizedUrl.searchParams.set("requiredRole", "SUPERADMIN");
      unauthorizedUrl.searchParams.set("currentRole", userRole);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // Internal ERP Routes (CRM, Projects, Tasks, Assets, Time-Tracking): SUPERADMIN and EMPLOYEE
    if (isInternalErpRoute && userRole === "CLIENT") {
      const unauthorizedUrl = new URL("/unauthorized", req.url);
      unauthorizedUrl.searchParams.set("requiredRole", "EMPLOYEE or SUPERADMIN");
      unauthorizedUrl.searchParams.set("currentRole", userRole);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // Client Portal Route: CLIENT and SUPERADMIN
    if (isClientPortalRoute && userRole === "EMPLOYEE") {
      const unauthorizedUrl = new URL("/unauthorized", req.url);
      unauthorizedUrl.searchParams.set("requiredRole", "CLIENT or SUPERADMIN");
      unauthorizedUrl.searchParams.set("currentRole", userRole);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/financials/:path*",
    "/invoices/:path*",
    "/crm/:path*",
    "/projects/:path*",
    "/kanban/:path*",
    "/tasks/:path*",
    "/time-tracking/:path*",
    "/assets/:path*",
    "/portal/:path*",
  ],
};
