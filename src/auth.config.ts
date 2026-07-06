import type { NextAuthConfig } from "next-auth";

// Edge-safe config only: no Prisma, no bcrypt, no Credentials.authorize.
// Middleware runs on the Edge runtime and cannot load Node.js-only modules,
// so it imports this file (via auth.ts's re-export below) instead of the
// full config in auth.ts, which pulls in Prisma.
export default {
  pages: {
    signIn: "/signin",
  },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
