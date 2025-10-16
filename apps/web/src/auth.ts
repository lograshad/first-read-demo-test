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

          if (email) {
            const { default: prisma } = await import("./lib/prisma");
            user = await prisma.user.findUnique({
              where: { email: email as string, deleted_at: null },
            });
          } else {
            return null;
          }

          if (!user || user.deleted_at) {
            return null;
          }

          if (!user.password) {
            const err = new Error("PASSWORD_NOT_SET") as Error & {
              code?: string;
            };
            err.code = "PASSWORD_NOT_SET";
            throw err;
          }

          const isPasswordValid = await comparePassword(
            password as string,
            user.password
          );
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
          };
        } catch (error) {
          console.error("Authorization error:", error);
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
        token.name = user?.full_name ?? token.name;
        token.email = user?.email ?? token.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.full_name as string;
      }
      return session;
    },
  },
});
