import { describe, it, expect } from 'vitest';
import { parseGithubWebhook } from '../src/webhooks/github';
import githubFixture from './fixtures/github_pr_opened.json';

describe('GitHub Webhook Parser', () => {
  it('should parse GitHub pull_request event', () => {
    const result = parseGithubWebhook(githubFixture);

    expect(result).toEqual({
      provider: 'github',
      repo: 'testorg/testrepo',
      cloneUrl: 'https://github.com/testorg/testrepo.git',
      pr: 123,
      headBranch: 'feature-branch',
      headSha: 'abc123def456',
      baseBranch: 'main',
      baseSha: 'def456abc123',
      owner: 'testorg',
      repoName: 'testrepo',
    });
  });
});
