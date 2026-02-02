import axios, { AxiosInstance } from 'axios';

export interface BitBucketComment {
  owner: string;
  repo: string;
  pr: number;
  body: string;
}

export class BitBucketPlatform {
  private client: AxiosInstance | null = null;

  constructor(host?: string, username?: string, appPassword?: string) {
    if (username && appPassword) {
      this.client = axios.create({
        baseURL: host || 'https://api.bitbucket.org/2.0',
        auth: {
          username,
          password: appPassword,
        },
      });
    }
  }

  async postComment(comment: BitBucketComment): Promise<void> {
    if (!this.client) {
      throw new Error('BitBucket credentials not configured');
    }

    await this.client.post(
      `/repositories/${comment.owner}/${comment.repo}/pullrequests/${comment.pr}/comments`,
      {
        content: {
          raw: comment.body,
        },
      }
    );
  }
}
