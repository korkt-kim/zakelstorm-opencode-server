import simpleGit, { SimpleGit } from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export interface GitCloneOptions {
  url: string;
  branch?: string;
  token?: string;
}

export interface DiffResult {
  baseBranch: string;
  headBranch: string;
  diff: string;
  filesChanged: string[];
}

export class GitService {
  private workDir: string;

  constructor(workDir: string = '/tmp/code-review') {
    this.workDir = workDir;
  }

  async clone(options: GitCloneOptions): Promise<string> {
    const repoId = randomUUID();
    const repoPath = path.join(this.workDir, repoId);

    await fs.mkdir(repoPath, { recursive: true });

    const git: SimpleGit = simpleGit();

    let cloneUrl = options.url;
    if (options.token) {
      cloneUrl = this.injectToken(options.url, options.token);
    }

    await git.clone(cloneUrl, repoPath);

    if (options.branch) {
      const repoGit = simpleGit(repoPath);
      await repoGit.checkout(options.branch);
    }

    return repoPath;
  }

  async getDiff(repoPath: string, baseBranch: string, headBranch: string): Promise<DiffResult> {
    const git: SimpleGit = simpleGit(repoPath);

    await git.fetch(['origin', baseBranch]);
    await git.fetch(['origin', headBranch]);

    const diff = await git.diff([`origin/${baseBranch}...origin/${headBranch}`]);

    const summary = await git.diffSummary([`origin/${baseBranch}...origin/${headBranch}`]);
    const filesChanged = summary.files.map(f => f.file);

    return {
      baseBranch,
      headBranch,
      diff,
      filesChanged,
    };
  }

  async cleanup(repoPath: string): Promise<void> {
    try {
      await fs.rm(repoPath, { recursive: true, force: true });
    } catch (error) {
      console.error(`Failed to cleanup ${repoPath}:`, error);
    }
  }

  private injectToken(url: string, token: string): string {
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes('github.com')) {
      urlObj.username = 'x-access-token';
      urlObj.password = token;
    } else if (urlObj.hostname.includes('gitlab.com')) {
      urlObj.username = 'oauth2';
      urlObj.password = token;
    } else if (urlObj.hostname.includes('bitbucket.org')) {
      urlObj.username = 'x-token-auth';
      urlObj.password = token;
    }

    return urlObj.toString();
  }
}
