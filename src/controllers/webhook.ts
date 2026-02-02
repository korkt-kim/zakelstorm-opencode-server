import { Request, Response } from 'express';
import { parseGithubWebhook } from '../webhooks/github.js';
import { parseGitlabWebhook } from '../webhooks/gitlab.js';
import { parseBitbucketWebhook } from '../webhooks/bitbucket.js';
import { GitService } from '../services/git.js';
import { OpenCodeService } from '../services/opencode.js';
import { PlatformService } from '../services/platforms/index.js';

type Provider = 'github' | 'gitlab' | 'bitbucket';

interface WebhookData {
  provider: Provider;
  repo: string;
  cloneUrl: string;
  pr?: number;
  mr?: number;
  headBranch: string;
  headSha: string;
  baseBranch: string;
  baseSha?: string;
  owner: string;
  repoName: string;
}

export async function handleCodeReview(req: Request, res: Response): Promise<void> {
  try {
    const provider = req.query.provider as Provider;

    if (!provider || !['github', 'gitlab', 'bitbucket'].includes(provider)) {
      res.status(400).json({ error: 'Invalid provider' });
      return;
    }

    const webhookData = parseWebhookPayload(req.body, provider);
    const prNumber = webhookData.pr || webhookData.mr || 0;

    res.status(202).json({
      message: 'Code review started',
      pr: prNumber,
      repo: webhookData.repo,
    });

    processCodeReviewAsync(webhookData).catch(error => {
      console.error('[WebhookController] Async review failed:', error);
    });
  } catch (error) {
    console.error('[WebhookController] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function parseWebhookPayload(payload: any, provider: Provider): WebhookData {
  switch (provider) {
    case 'github':
      return parseGithubWebhook(payload) as WebhookData;
    case 'gitlab':
      return parseGitlabWebhook(payload) as WebhookData;
    case 'bitbucket':
      return parseBitbucketWebhook(payload) as WebhookData;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function processCodeReviewAsync(data: WebhookData): Promise<void> {
  const gitService = new GitService();
  const opencodeService = new OpenCodeService();
  const platformService = new PlatformService();

  let repoPath: string | null = null;
  const prNumber = data.pr || data.mr || 0;

  try {
    console.log(`[CodeReview] Starting review for ${data.repo} PR/MR #${prNumber}`);
    repoPath = await gitService.clone({
      url: data.cloneUrl,
      branch: data.headBranch,
    });

    const diffResult = await gitService.getDiff(repoPath, data.baseBranch, data.headBranch);

    const reviewResult = await opencodeService.performReview({
      diff: diffResult.diff,
      filesChanged: diffResult.filesChanged,
      repoName: data.repoName,
      baseBranch: data.baseBranch,
      headBranch: data.headBranch,
      pr: prNumber,
    });

    await platformService.postReviewComment({
      platform: data.provider,
      owner: data.owner,
      repo: data.repoName,
      prNumber,
      body: reviewResult,
      projectPath: data.repo,
    });

    console.log(`[CodeReview] ✅ Review completed for ${data.repo} PR/MR #${prNumber}`);
  } catch (error) {
    console.error(`[CodeReview] ❌ Review failed for ${data.repo} PR/MR #${prNumber}:`, error);
  } finally {
    if (repoPath) {
      await gitService.cleanup(repoPath);
    }
  }
}
