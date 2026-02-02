import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GitService } from '../src/services/git';
import fs from 'fs/promises';
import path from 'path';

describe('GitService', () => {
  let gitService: GitService;
  let testWorkDir: string;

  beforeEach(() => {
    testWorkDir = path.join('/tmp', `git-test-${Date.now()}`);
    gitService = new GitService(testWorkDir);
  });

  afterEach(async () => {
    try {
      await fs.rm(testWorkDir, { recursive: true, force: true });
    } catch {}
  });

  it('should inject GitHub token correctly', () => {
    const service = gitService as any;
    const result = service.injectToken(
      'https://github.com/owner/repo.git',
      'ghp_token123'
    );
    expect(result).toBe('https://x-access-token:ghp_token123@github.com/owner/repo.git');
  });

  it('should inject GitLab token correctly', () => {
    const service = gitService as any;
    const result = service.injectToken(
      'https://gitlab.com/owner/repo.git',
      'glpat_token123'
    );
    expect(result).toBe('https://oauth2:glpat_token123@gitlab.com/owner/repo.git');
  });

  it('should inject BitBucket token correctly', () => {
    const service = gitService as any;
    const result = service.injectToken(
      'https://bitbucket.org/owner/repo.git',
      'app_password123'
    );
    expect(result).toBe('https://x-token-auth:app_password123@bitbucket.org/owner/repo.git');
  });
});
