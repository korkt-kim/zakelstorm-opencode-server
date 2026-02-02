import { GitHubPlatform } from './github.js';
import { GitLabPlatform } from './gitlab.js';
import { BitBucketPlatform } from './bitbucket.js';
import { GITHUB_TOKEN, GITLAB_TOKEN, BITBUCKET_TOKEN, GITHUB_HOST,GITLAB_HOST,BITBUCKET_HOST } from '../../config.js';

export type Platform = 'github' | 'gitlab' | 'bitbucket';

export interface CommentRequest {
  platform: Platform;
  owner: string;
  repo: string;
  prNumber: number;
  body: string;
  projectPath?: string;
}

export class PlatformService {
  private github: GitHubPlatform;
  private gitlab: GitLabPlatform;
  private bitbucket: BitBucketPlatform;

  constructor() {
    this.github = new GitHubPlatform(GITHUB_HOST, GITHUB_TOKEN);
    this.gitlab = new GitLabPlatform(GITLAB_HOST, GITLAB_TOKEN);
    this.bitbucket = new BitBucketPlatform(BITBUCKET_HOST, 'x-token-auth', BITBUCKET_TOKEN);
  }

  async postReviewComment(request: CommentRequest): Promise<void> {
    switch (request.platform) {
      case 'github':
        await this.github.postComment({
          owner: request.owner,
          repo: request.repo,
          pr: request.prNumber,
          body: request.body,
        });
        break;

      case 'gitlab':
        await this.gitlab.postComment({
          projectPath: request.projectPath || `${request.owner}/${request.repo}`,
          mr: request.prNumber,
          body: request.body,
        });
        break;

      case 'bitbucket':
        await this.bitbucket.postComment({
          owner: request.owner,
          repo: request.repo,
          pr: request.prNumber,
          body: request.body,
        });
        break;

      default:
        throw new Error(`Unsupported platform: ${request.platform}`);
    }
  }
}
