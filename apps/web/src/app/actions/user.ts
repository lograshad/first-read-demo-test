"use server";

import { UserService } from "@/app/services/user";
import {
  getUserByIdDto,
  getUserByEmailDto,
  type UserResponseDto,
} from "@/lib/dtos/user";
import type { ActionResult } from "@/types/user";
import { z } from "zod";
import { auth } from "@/auth";



export async function getUserData() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }
  const user = await UserService.getUserById(session.user.id);
  if (!user) {
    return {
      success: false,
      error: "User not found",
    };
  }
  
  return {
    success: true,
    data: user as UserResponseDto,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(data: {
  id: string;
}): Promise<ActionResult<UserResponseDto>> {
  try {
    const validatedData = getUserByIdDto.parse(data);
    const user = await UserService.getUserById(validatedData.id);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: user as UserResponseDto,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch user",
    };
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(data: {
  email: string;
}): Promise<ActionResult<UserResponseDto>> {
  try {
    const validatedData = getUserByEmailDto.parse(data);
    const user = await UserService.getUserByEmail(validatedData.email);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: user as UserResponseDto,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch user",
    };
  }
}