import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url().default("postgresql://app:app@localhost:5434/app?schema=public"),
  REDIS_URL: z.string().url().default("redis://localhost:6380")
});

export const env = envSchema.parse(process.env);
