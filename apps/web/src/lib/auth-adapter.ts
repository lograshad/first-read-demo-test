import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  VerificationToken,
} from "next-auth/adapters";
import prisma from "./prisma";

export function PrismaAdapter(): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">): Promise<AdapterUser> {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: user.email!,
          deleted_at: null,
        },
      });

      if (existingUser) {
        const restoredUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            deleted_at: null,
            full_name: user.name,
            password: null,
            updated_at: new Date(),
          },
        });

        return {
          id: restoredUser.id,
          email: restoredUser.email ?? "",
          emailVerified: null,
        };
      }

      const newUser = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email: user.email!,
          full_name: user.name,
        },
      });

      return {
        id: newUser.id,
        email: newUser.email ?? "",
        emailVerified: null,
      };
    },

    async getUser(id: string): Promise<AdapterUser | null> {
      const user = await prisma.user.findFirst({
        where: {
          id,
          deleted_at: null,
        },
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email ?? "",
        emailVerified: null,
      };
    },

    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const user = await prisma.user.findFirst({
        where: {
          email,
          deleted_at: null,
        },
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email ?? "",
        emailVerified: null,
      };
    },

    async getUserByAccount(): Promise<AdapterUser | null> {
      return null;
    },

    async updateUser(
      user: Partial<AdapterUser> & Pick<AdapterUser, "id">
    ): Promise<AdapterUser> {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email || undefined,
          updated_at: new Date(),
        },
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email ?? "",
        emailVerified: null,
      };
    },

    async deleteUser(userId: string): Promise<void> {
      await prisma.user.update({
        where: { id: userId },
        data: {
          deleted_at: new Date(),
        },
      });
    },

    async linkAccount(
      account: AdapterAccount
    ): Promise<AdapterAccount | null | undefined> {
      return account;
    },

    async unlinkAccount(): Promise<void> {
      return;
    },

    async createSession(params: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }): Promise<AdapterSession> {
      return {
        sessionToken: params.sessionToken,
        userId: params.userId,
        expires: params.expires,
      };
    },

    async getSessionAndUser(
      sessionToken: string
    ): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
      console.log("getSessionAndUser called with:", sessionToken);
      return null;
    },

    async updateSession(
      session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
    ): Promise<AdapterSession | null | undefined> {
      console.log("updateSession called with:", session);
      return null;
    },

    async deleteSession(sessionToken: string): Promise<void> {
      console.log("deleteSession called with:", sessionToken);
      return;
    },

    async createVerificationToken(params: {
      identifier: string;
      expires: Date;
      token: string;
    }): Promise<VerificationToken | null | undefined> {
      return {
        identifier: params.identifier,
        expires: params.expires,
        token: params.token,
      };
    },

    async useVerificationToken(params: {
      identifier: string;
      token: string;
    }): Promise<VerificationToken | null> {
      console.log("useVerificationToken called with:", params);
      return null;
    },
  };
}
