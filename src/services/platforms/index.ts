import { GitHubPlatform } from './github.js';
import { GitLabPlatform } from './gitlab.js';
import { BitBucketPlatform } from './bitbucket.js';
import { GITHUB_TOKEN, GITLAB_TOKEN, BITBUCKET_TOKEN } from '../../config.js';

export type Platform = 'github' | 'gitlab' | 'bitbucket';

export interface CommentRequest {
  platform: Platform;
  host: string;
  owner: string;
  repo: string;
  prNumber: number;
  body: string;
  projectPath?: string;
}

export class PlatformService {
  async postReviewComment(request: CommentRequest): Promise<void> {
    switch (request.platform) {
      case 'github': {
        const github = new GitHubPlatform(request.host, GITHUB_TOKEN);
        await github.postComment({
          owner: request.owner,
          repo: request.repo,
          pr: request.prNumber,
          body: request.body,
        });
        break;
      }

      case 'gitlab': {
        const gitlab = new GitLabPlatform(request.host, GITLAB_TOKEN);
        await gitlab.postComment({
          projectPath: request.projectPath || `${request.owner}/${request.repo}`,
          mr: request.prNumber,
          body: request.body,
        });
        break;
      }

      case 'bitbucket': {
        const bitbucket = new BitBucketPlatform(request.host, 'x-token-auth', BITBUCKET_TOKEN);
        await bitbucket.postComment({
          owner: request.owner,
          repo: request.repo,
          pr: request.prNumber,
          body: request.body,
        });
        break;
      }

      default:
        throw new Error(`Unsupported platform: ${request.platform}`);
    }
  }
}
