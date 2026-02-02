import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('8080').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  GITHUB_TOKEN: z.string().optional(),
  GITLAB_TOKEN: z.string().optional(),
  BITBUCKET_TOKEN: z.string().optional(),
  
  GITHUB_WEBHOOK_SECRET: z.string().optional(),
  GITLAB_WEBHOOK_SECRET: z.string().optional(),
  BITBUCKET_WEBHOOK_SECRET: z.string().optional(),
  
  OPENCODE_API_KEY: z.string().optional(),
  OPENCODE_API_URL: z.string().url().optional(),

  MODEL_PROVIDER: z.string(),
  MODEL: z.string(),
});

export type Config = z.infer<typeof envSchema>;

export const config: Config = envSchema.parse(process.env);

export const {
  PORT,
  NODE_ENV,
  GITHUB_TOKEN,
  GITLAB_TOKEN,
  BITBUCKET_TOKEN,
  GITHUB_WEBHOOK_SECRET,
  GITLAB_WEBHOOK_SECRET,
  BITBUCKET_WEBHOOK_SECRET,
  OPENCODE_API_KEY,
  OPENCODE_API_URL,
  MODEL_PROVIDER,
  MODEL
} = config;
