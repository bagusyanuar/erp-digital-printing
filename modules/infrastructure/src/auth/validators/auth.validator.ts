import { z } from "zod";
import type { LoginInput } from "@core/auth/applications/inputs";

export const loginInputSchema = z.object({
  username: z.string().min(1, "username is required"),
  password: z
    .string()
    .min(1, "password is required")
    .min(6, "password must be at least 6 characters"),
}) as z.ZodType<LoginInput>;
