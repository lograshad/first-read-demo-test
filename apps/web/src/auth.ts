import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { comparePassword } from "./lib/password";

export const { auth, handlers } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,

  trustHost: true,
  debug: process.env.NODE_ENV !== "production",
  providers: [
    Credentials({
      credentials: {
        email: {
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials;

          let user = null;

          // Check if login is via email
          if (email) {
            const { default: prisma } = await import("./lib/prisma");
            // Find user in database with password
            user = await prisma.user.findUnique({
              where: { email: email as string, deleted_at: null },
            });
          } else {
            return null;
          }

          // Check if user exists and is active
          if (!user || user.deleted_at) {
            return null;
          }

          // If user exists but has no password, signal special error for UI to offer set-password
          if (!user.password) {
            const err = new Error("PASSWORD_NOT_SET") as Error & {
              code?: string;
            };
            err.code = "PASSWORD_NOT_SET";
            throw err;
          }

          // Verify password
          const isPasswordValid = await comparePassword(
            password as string,
            user.password
          );
          if (!isPasswordValid) {
            return null;
          }

          // Return user object for NextAuth
          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          // Re-throw so NextAuth surfaces error for client to handle (we'll map to UI states)
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      return user ? true : false;
    },
    async jwt({ token, user, trigger }) {
      if (trigger === "update" || user) {
        token.id = user?.id ?? token.id;
        token.name = user?.name ?? token.name;
        token.email = user?.email ?? token.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
