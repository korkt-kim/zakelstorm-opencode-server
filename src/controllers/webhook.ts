import { Request, Response } from 'express';
import { parseGithubWebhook } from '../webhooks/github.js';
import { parseGitlabWebhook } from '../webhooks/gitlab.js';
import { parseBitbucketWebhook } from '../webhooks/bitbucket.js';
import { GitService } from '../services/git.js';
import { OpenCodeService } from '../services/opencode.js';
import { PlatformService } from '../services/platforms/index.js';
import { verifyGitHubSignature, verifyGitLabToken, verifyBitbucketSignature } from '../utils/webhook-verification.js';
import { GITHUB_WEBHOOK_SECRET, GITLAB_WEBHOOK_SECRET, BITBUCKET_WEBHOOK_SECRET } from '../config.js';

type Provider = 'github' | 'gitlab' | 'bitbucket';

interface WebhookData {
  provider: Provider;
  repo: string;
  cloneUrl: string;
  host: string;
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

    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (provider === 'github') {
      const signature = req.headers['x-hub-signature-256'] as string | undefined;
      const { action } = req.body
      if(!(action==='opened' || action==='synchronize')) {
        res.status(202).json({ error: 'Invalid action' });
        return;
      }
      if (!verifyGitHubSignature(rawBody, signature, GITHUB_WEBHOOK_SECRET)) {
        console.error('[GitHub] Webhook signature verification failed');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
    } else if (provider === 'gitlab') {
      const token = req.headers['x-gitlab-token'] as string | undefined;
      if (!verifyGitLabToken(token, GITLAB_WEBHOOK_SECRET)) {
        console.error('[GitLab] Webhook token verification failed');
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
    } else if (provider === 'bitbucket') {
      const signature = req.headers['x-hub-signature'] as string | undefined;
      if (!verifyBitbucketSignature(rawBody, signature, BITBUCKET_WEBHOOK_SECRET)) {
        console.error('[Bitbucket] Webhook signature verification failed');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
    }

    const webhookData = parseWebhookPayload(payload, provider);
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
      host: data.host,
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
