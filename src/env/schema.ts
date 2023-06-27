import { z } from "zod";

export const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  ENABLE_VC_BUILD: z
    .string()
    .default("1")
    .transform((v) => parseInt(v)),
  POSTGRES_PRISMA_URL: z.string().url(),
  POSTGRES_URL_NON_POOLING: z.string().url(),

  TOKEN_SECRET: z.string(),
  SESSION_SECRET: z.string(),
});

export const clientSchema = z.object({
  MODE: z.enum(["development", "production", "test"]).default("development"),
});
