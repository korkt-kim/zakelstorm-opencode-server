import { z } from 'zod';

const githubWebhookSchema = z.object({
  action: z.string(),
  number: z.number(),
  pull_request: z.object({
    number: z.number(),
    head: z.object({
      ref: z.string(),
      sha: z.string(),
      repo: z.object({
        clone_url: z.string(),
        full_name: z.string(),
      }),
    }),
    base: z.object({
      ref: z.string(),
      sha: z.string(),
    }),
  }),
  repository: z.object({
    full_name: z.string(),
    clone_url: z.string(),
    owner: z.object({
      login: z.string(),
    }),
    name: z.string(),
  }),
});

export type GithubWebhook = z.infer<typeof githubWebhookSchema>;

export interface ParsedWebhookData {
  provider: 'github';
  repo: string;
  cloneUrl: string;
  host: string;
  pr: number;
  headBranch: string;
  headSha: string;
  baseBranch: string;
  baseSha: string;
  owner: string;
  repoName: string;
}

export function parseGithubWebhook(payload: unknown): ParsedWebhookData {
  const validated = githubWebhookSchema.parse(payload);

  const cloneUrl = validated.repository.clone_url;
  const url = new URL(cloneUrl);
  const host = url.origin;

  return {
    provider: 'github',
    repo: validated.repository.full_name,
    cloneUrl,
    host,
    pr: validated.pull_request.number,
    headBranch: validated.pull_request.head.ref,
    headSha: validated.pull_request.head.sha,
    baseBranch: validated.pull_request.base.ref,
    baseSha: validated.pull_request.base.sha,
    owner: validated.repository.owner.login,
    repoName: validated.repository.name,
  };
}
