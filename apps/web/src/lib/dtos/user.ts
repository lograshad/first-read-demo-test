import { z } from "zod";


export const getUserByIdDto = z.object({
  id: z.string().uuid({ message: "Invalid user ID" }),
});

export const getUserByEmailDto = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});


export const userResponseDto = z.object({
  id: z.string(),
  email: z.string().nullable(),
  full_name: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable()
});

export type GetUserByIdDto = z.infer<typeof getUserByIdDto>;
export type GetUserByEmailDto = z.infer<typeof getUserByEmailDto>;
export type UserResponseDto = z.infer<typeof userResponseDto>;

export const actionResultDto = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    fieldErrors: z.record(z.array(z.string())).optional(),
  });
