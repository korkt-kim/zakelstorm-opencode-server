import { Octokit } from '@octokit/rest';

export interface GitHubComment {
  owner: string;
  repo: string;
  pr: number;
  body: string;
}

export class GitHubPlatform {
  private octokit: Octokit | null = null;

  constructor(host?: string, token?: string) {
    if (token) {
      this.octokit = new Octokit({host, auth: token });
    }
  }

  async postComment(comment: GitHubComment): Promise<void> {
    if (!this.octokit) {
      throw new Error('GitHub token not configured');
    }

    await this.octokit.issues.createComment({
      owner: comment.owner,
      repo: comment.repo,
      issue_number: comment.pr,
      body: comment.body,
    });
  }
}
