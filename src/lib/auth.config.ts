import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "fallback-secret-production-key-careerpulse",
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");
      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
      const isApiRegister = nextUrl.pathname.startsWith("/api/register");

      if (isApiAuthRoute || isApiRegister) {
        return true;
      }

      if (isPublicRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/board", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      if (nextUrl.pathname === "/") {
        return Response.redirect(new URL("/board", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
