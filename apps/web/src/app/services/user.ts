import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import type { UserResponseDto } from "@/lib/dtos/user";

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(data: {
    email: string;
    password: string;
  }): Promise<UserResponseDto> {
    const { email, password } = data;

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      if (!existingUser.deleted_at) {
        if (email && existingUser.email === email) {
          throw new Error("An error occured while creating user");
        }
      }

      const hashedPassword = await hashPassword(password);

      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          full_name: null,
          deleted_at: null,
          password: hashedPassword,
          updated_at: new Date(),
        },
      });

      return updatedUser;
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
      },
    });

    return user;
  }

  /**
   * Get user by id
   */
  static async getUserById(id: string): Promise<UserResponseDto | null> {
    const user = await prisma.user.findUnique({
      where: { id, deleted_at: null },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await prisma.user.findUnique({
      where: { email, deleted_at: null },
    });

    if (!user) {
      return null;
    }

    return user;
  }


  /**
   * Get user by email
   */
  static async getUserByEmailWithPassword(email: string) {
    return prisma.user.findUnique({
      where: { email, deleted_at: null },
    });
  }

  /**
   * Get all users with pagination
   */
  static async getUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { deleted_at: null },
        select: {
          id: true,
          email: true,
          created_at: true,
          updated_at: true,
        },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.user.count({
        where: { deleted_at: null },
      }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
