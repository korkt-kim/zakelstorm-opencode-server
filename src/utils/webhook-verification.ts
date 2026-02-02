import crypto from 'crypto';

export function verifyGitHubSignature(
  payload: string,
  signature: string | undefined,
  secret: string | undefined
): boolean {
  if (!secret) {
    console.warn('[GitHub] Webhook secret not configured, skipping verification');
    return true;
  }

  if (!signature) {
    console.error('[GitHub] Missing X-Hub-Signature-256 header');
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export function verifyGitLabToken(
  token: string | undefined,
  secret: string | undefined
): boolean {
  if (!secret) {
    console.warn('[GitLab] Webhook secret not configured, skipping verification');
    return true;
  }

  if (!token) {
    console.error('[GitLab] Missing X-Gitlab-Token header');
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(secret));
}

export function verifyBitbucketSignature(
  payload: string,
  signature: string | undefined,
  secret: string | undefined
): boolean {
  if (!secret) {
    console.warn('[Bitbucket] Webhook secret not configured, skipping verification');
    return true;
  }

  if (!signature) {
    console.error('[Bitbucket] Missing X-Hub-Signature header');
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
