// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // List of allowed admin emails
        const adminEmails = [
          "jordanjuniordjimelykheambo@gmail.com",
          "coachcraft.space@gmail.com",
        ];

        // Mark user as admin
        token.isAdmin = adminEmails.includes(user.email ?? "");
        token.adminToken = process.env.ADMIN_API_SECRET;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.adminToken = process.env.ADMIN_API_SECRET;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
