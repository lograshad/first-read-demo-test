import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    full_name?: string;
  }

  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    full_name?: string;
  }
}
