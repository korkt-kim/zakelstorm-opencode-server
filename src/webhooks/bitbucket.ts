import { z } from 'zod';

const bitbucketWebhookSchema = z.object({
  pullrequest: z.object({
    id: z.number(),
    source: z.object({
      branch: z.object({
        name: z.string(),
      }),
      commit: z.object({
        hash: z.string(),
      }),
    }),
    destination: z.object({
      branch: z.object({
        name: z.string(),
      }),
      commit: z.object({
        hash: z.string(),
      }),
    }),
  }),
  repository: z.object({
    full_name: z.string(),
    owner: z.object({
      username: z.string(),
    }),
    name: z.string(),
    links: z.object({
      clone: z.array(z.object({
        name: z.string(),
        href: z.string(),
      })),
    }),
  }),
});

export type BitbucketWebhook = z.infer<typeof bitbucketWebhookSchema>;

export interface ParsedWebhookData {
  provider: 'bitbucket';
  repo: string;
  cloneUrl: string;
  pr: number;
  headBranch: string;
  headSha: string;
  baseBranch: string;
  baseSha: string;
  owner: string;
  repoName: string;
}


export function parseBitbucketWebhook(payload: unknown): ParsedWebhookData {
  const validated = bitbucketWebhookSchema.parse(payload);

  const httpsClone = validated.repository.links.clone.find(c => c.name === 'https');
  const cloneUrl = httpsClone?.href || validated.repository.links.clone[0].href;

  return {
    provider: 'bitbucket',
    repo: validated.repository.full_name,
    cloneUrl,
    pr: validated.pullrequest.id,
    headBranch: validated.pullrequest.source.branch.name,
    headSha: validated.pullrequest.source.commit.hash,
    baseBranch: validated.pullrequest.destination.branch.name,
    baseSha: validated.pullrequest.destination.commit.hash,
    owner: validated.repository.owner.username,
    repoName: validated.repository.name,
  };
}
