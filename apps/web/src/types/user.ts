export interface User {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateUserData {
  email: string;
  password: string;
}

export interface UserRegistrationData {
  email: string;
  password: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export type UserActionResult = ActionResult<User>;
export type RegisterActionResult = ActionResult<User>;
