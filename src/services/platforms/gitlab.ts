import { Gitlab } from '@gitbeaker/rest';

export interface GitLabComment {
  projectPath: string;
  mr: number;
  body: string;
}

export class GitLabPlatform {
  private gitlab: InstanceType<typeof Gitlab> | null = null;

  constructor(host?:string, token?: string) {
    if (token) {
      this.gitlab = new Gitlab({host, token });
    }
  }

  async postComment(comment: GitLabComment): Promise<void> {
    if (!this.gitlab) {
      throw new Error('GitLab token not configured');
    }

    await this.gitlab.MergeRequestNotes.create(
      comment.projectPath,
      comment.mr,
      comment.body
    );
  }
}
