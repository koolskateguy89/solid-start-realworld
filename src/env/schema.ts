import { z } from "zod";

export const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  ENABLE_VC_BUILD: z
    .string()
    .default("1")
    .transform((v) => parseInt(v)),
  DATABASE_URL: z.string(),

  TOKEN_SECRET: z.string(),
});

export const clientSchema = z.object({
  MODE: z.enum(["development", "production", "test"]).default("development"),
});
