import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");

  // Auth.js routes always pass through
  if (isApiAuthRoute) return NextResponse.next();

  // API routes require authentication
  if (req.nextUrl.pathname.startsWith("/api")) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (isLoginPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
