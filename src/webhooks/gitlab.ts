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
  host: string;
  mr: number;
  headBranch: string;
  headSha: string;
  baseBranch: string;
  owner: string;
  repoName: string;
}

export function parseGitlabWebhook(payload: unknown): ParsedWebhookData {
  const validated = gitlabWebhookSchema.parse(payload);

  const cloneUrl = validated.project.git_http_url;
  const url = new URL(cloneUrl);
  const host = url.origin;

  return {
    provider: 'gitlab',
    repo: validated.project.path_with_namespace,
    cloneUrl,
    host,
    mr: validated.object_attributes.iid,
    headBranch: validated.object_attributes.source_branch,
    headSha: validated.object_attributes.last_commit.id,
    baseBranch: validated.object_attributes.target_branch,
    owner: validated.project.namespace,
    repoName: validated.project.name,
  };
}
