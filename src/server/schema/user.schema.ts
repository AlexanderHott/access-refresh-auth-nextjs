import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string(),
});

export const loginUserSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
