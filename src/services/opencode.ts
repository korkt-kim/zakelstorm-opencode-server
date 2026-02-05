import { createOpencodeClient, OpencodeClient } from '@opencode-ai/sdk';
import { OPENCODE_API_URL,MODEL,MODEL_PROVIDER } from '../config.js';

export interface CodeReviewRequest {
  diff: string;
  filesChanged: string[];
  repoName: string;
  baseBranch: string;
  headBranch: string;
  pr: number;
}

export type CodeReviewResult = string

export class OpenCodeService {
  openCodeClient: OpencodeClient | null = null
  constructor() {
    if (OPENCODE_API_URL) {
      this.openCodeClient = createOpencodeClient({
        baseUrl: OPENCODE_API_URL,
        parseAs: 'auto',
        responseStyle: 'fields',
        throwOnError: true,
      });
    }
  }

  async performReview(request: CodeReviewRequest): Promise<CodeReviewResult> {
    if (!this.openCodeClient) {
      throw new Error('OpenCode client not configured');
    }

    console.log('[OpenCodeService] Starting review for:', {
      repo: request.repoName,
      pr: request.pr,
      filesChanged: request.filesChanged.length,
    });

    const createRes = await this.openCodeClient.session.create({
      body: { title: `${request.repoName}#${request.pr}` },
    });

    if (!createRes.data?.id) {
      throw new Error(`Could not create session: ${JSON.stringify(createRes)}`);
    }

    const sessionId = createRes.data.id;
    console.log('[OpenCodeService] Created session:', sessionId);


    try {
      const promptRes = await this.openCodeClient.session.prompt({
        path: { id: sessionId },
        body: {
          model: {
            providerID: MODEL_PROVIDER,
            modelID: MODEL
          },
          parts: [{
            type: 'text',
            text: `/code-review

## PR Information
- Repository: ${request.repoName}
- PR Number: #${request.pr}
- Base Branch: ${request.baseBranch}
- Head Branch: ${request.headBranch}
- Files Changed: ${request.filesChanged.join(', ')}

## Diff
\`\`\`diff
${request.diff}
\`\`\`

코드 리뷰를 진행해주세요.`,
          }]
        }
      });

      if (!promptRes.data) {
        throw new Error('No data in prompt response');
      }

      const data = promptRes.data as any;

      if (data.parts && Array.isArray(data.parts) && data.parts.length > 0) {
        const textParts = data.parts
          .filter((part: any) => part.type === 'text' && part.text)
          .map((part: any) => part.text)
          .join('\n\n');
        
        if (textParts) {
          console.log('[OpenCodeService] Review completed, length:', textParts.length);
          return textParts;
        }
      }

      console.warn('[OpenCodeService] No text parts found, returning raw data');
      return JSON.stringify(data, null, 2);
    } finally {
      try {
        await this.openCodeClient.session.delete({ path: { id: sessionId } });
        console.log('[OpenCodeService] Deleted session:', sessionId);
      } catch (deleteError) {
        console.warn('[OpenCodeService] Failed to delete session:', sessionId, deleteError);
      }
    }
  }

  // private parseReviewResult(text: string): CodeReviewResult {
  //   const critical: string[] = [];
  //   const suggestions: string[] = [];
  //   const minor: string[] = [];
  //   const goodPoints: string[] = [];

  //   const sections = {
  //     critical: /### Critical Issues.*?\n([\s\S]*?)(?=###|$)/i,
  //     suggestions: /### Suggestions.*?\n([\s\S]*?)(?=###|$)/i,
  //     minor: /### Minor.*?\n([\s\S]*?)(?=###|$)/i,
  //     goodPoints: /### Good Points.*?\n([\s\S]*?)(?=###|$)/i,
  //   };

  //   const extractItems = (sectionText: string): string[] => {
  //     const lines = sectionText.split('\n').filter(l => l.trim().startsWith('- '));
  //     return lines.map(l => l.replace(/^-\s*\[.\]\s*/, '').trim()).filter(Boolean);
  //   };

  //   const criticalMatch = text.match(sections.critical);
  //   if (criticalMatch) critical.push(...extractItems(criticalMatch[1]));

  //   const suggestionsMatch = text.match(sections.suggestions);
  //   if (suggestionsMatch) suggestions.push(...extractItems(suggestionsMatch[1]));

  //   const minorMatch = text.match(sections.minor);
  //   if (minorMatch) minor.push(...extractItems(minorMatch[1]));

  //   const goodPointsMatch = text.match(sections.goodPoints);
  //   if (goodPointsMatch) goodPoints.push(...extractItems(goodPointsMatch[1]));

  //   return {
  //     summary: text,
  //     critical,
  //     suggestions,
  //     minor,
  //     goodPoints,
  //   };
  // }
}
