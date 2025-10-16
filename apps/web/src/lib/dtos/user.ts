import { z } from "zod";

// Registration DTO
export const createUserDto = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      }),
  })


export const getUserByIdDto = z.object({
  id: z.string().uuid({ message: "Invalid user ID" }),
});

export const getUserByEmailDto = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});


// User response DTO (what we return to client)
export const userResponseDto = z.object({
  id: z.string(),
  email: z.string().nullable(),
  full_name: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable()
});

// Type exports
export type CreateUserDto = z.infer<typeof createUserDto>;
export type GetUserByIdDto = z.infer<typeof getUserByIdDto>;
export type GetUserByEmailDto = z.infer<typeof getUserByEmailDto>;
export type UserResponseDto = z.infer<typeof userResponseDto>;

// Action result DTOs
export const actionResultDto = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    fieldErrors: z.record(z.array(z.string())).optional(),
  });
