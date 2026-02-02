import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('8080').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  GITHUB_TOKEN: z.string().optional(),
  GITLAB_TOKEN: z.string().optional(),
  BITBUCKET_TOKEN: z.string().optional(),

  GITLAB_HOST: z.string().optional(),
  GITHUB_HOST: z.string().optional(),
  BITBUCKET_HOST: z.string().optional(),
  
  OPENCODE_API_KEY: z.string().optional(),
  OPENCODE_API_URL: z.string().url().optional(),
});

export type Config = z.infer<typeof envSchema>;

export const config: Config = envSchema.parse(process.env);

export const {
  PORT,
  NODE_ENV,
  GITHUB_TOKEN,
  GITLAB_TOKEN,
  GITLAB_HOST,
  GITHUB_HOST,
  BITBUCKET_HOST,
  BITBUCKET_TOKEN,
  OPENCODE_API_KEY,
  OPENCODE_API_URL,
} = config;
