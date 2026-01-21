// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** The user's name. */
      name?: string | null;
      /** The user's email. */
      email?: string | null;
      /** The user's image. */
      image?: string | null;
      /** Custom property to mark admin users */
      isAdmin?: boolean;
      adminToken?: string;
    };
  }

  interface User {
    isAdmin?: boolean;
    adminToken?: string;
  }

  interface JWT {
    isAdmin?: boolean;
    adminToken?: string;
  }
}
