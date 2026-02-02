import { z } from 'zod';

const gitlabWebhookSchema = z.object({
  object_kind: z.literal('merge_request'),
  project: z.object({
    git_http_url: z.string(),
    path_with_namespace: z.string(),
    namespace: z.string(),
    name: z.string(),
  }),
  object_attributes: z.object({
    iid: z.number(),
    source_branch: z.string(),
    target_branch: z.string(),
    last_commit: z.object({
      id: z.string(),
    }),
  }),
});

export type GitlabWebhook = z.infer<typeof gitlabWebhookSchema>;

export interface ParsedWebhookData {
  provider: 'gitlab';
  repo: string;
  cloneUrl: string;
  mr: number;
  headBranch: string;
  headSha: string;
  baseBranch: string;
  owner: string;
  repoName: string;
}

export function parseGitlabWebhook(payload: unknown): ParsedWebhookData {
  const validated = gitlabWebhookSchema.parse(payload);

  return {
    provider: 'gitlab',
    repo: validated.project.path_with_namespace,
    cloneUrl: validated.project.git_http_url,
    mr: validated.object_attributes.iid,
    headBranch: validated.object_attributes.source_branch,
    headSha: validated.object_attributes.last_commit.id,
    baseBranch: validated.object_attributes.target_branch,
    owner: validated.project.namespace,
    repoName: validated.project.name,
  };
}
