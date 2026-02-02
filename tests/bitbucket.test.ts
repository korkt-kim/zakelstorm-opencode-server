import { describe, it, expect } from 'vitest';
import { parseBitbucketWebhook } from '../src/webhooks/bitbucket';
import bitbucketFixture from './fixtures/bitbucket_pr_created.json';

describe('BitBucket Webhook Parser', () => {
  it('should parse BitBucket pullrequest event', () => {
    const result = parseBitbucketWebhook(bitbucketFixture);

    expect(result).toEqual({
      provider: 'bitbucket',
      repo: 'testorg/testrepo',
      cloneUrl: 'https://bitbucket.org/testorg/testrepo.git',
      pr: 789,
      headBranch: 'feature-branch',
      headSha: 'abc123def456',
      baseBranch: 'main',
      baseSha: 'def456abc123',
      owner: 'testorg',
      repoName: 'testrepo',
    });
  });
});
