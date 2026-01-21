import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define your admin emails here
const ADMIN_EMAILS = [
  "jordanjuniordjimelykheambo@gmail.com",
  "coachcraft.space@gmail.com",
];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Protect only /admin routes
  if (url.pathname.startsWith("/admin")) {
    // Get the JWT token from NextAuth
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Not logged in? Redirect to login
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Not an admin? Redirect to login
    if (!ADMIN_EMAILS.includes(token.email ?? "")) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Apply middleware only to /admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
