import { describe, it, expect } from 'vitest';
import { parseGitlabWebhook } from '../src/webhooks/gitlab';
import gitlabFixture from './fixtures/gitlab_mr_opened.json';

describe('GitLab Webhook Parser', () => {
  it('should parse GitLab merge_request event', () => {
    const result = parseGitlabWebhook(gitlabFixture);

    expect(result).toEqual({
      provider: 'gitlab',
      repo: 'testorg/testrepo',
      cloneUrl: 'https://gitlab.com/testorg/testrepo.git',
      mr: 456,
      headBranch: 'feature-branch',
      headSha: 'abc123def456',
      baseBranch: 'main',
      owner: 'testorg',
      repoName: 'testrepo',
    });
  });
});
