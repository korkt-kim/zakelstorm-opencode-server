# Webhook Code Review Server

Production-ready Express.js webhook server for automated code reviews on GitHub, GitLab, and BitBucket pull requests.

## Features

- ✅ **Multi-Platform Support**: GitHub, GitLab, BitBucket
- ✅ **Webhook Verification**: HMAC-SHA256 (GitHub), Token-based (GitLab), Secret verification (BitBucket)
- ✅ **AI-Powered Reviews**: Integration with OpenCode SDK for intelligent code analysis
- ✅ **Async Processing**: Returns 202 Accepted immediately, processes reviews in background
- ✅ **Docker Ready**: Production-grade containerized deployment
- ✅ **Type-Safe**: Full TypeScript implementation with strict mode
- ✅ **Tested**: Comprehensive test suite with Vitest

## Quick Start

### Prerequisites

- Node.js 24+
- Docker (for containerized deployment)
- Git access tokens for target platforms

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Run in development mode:**
```bash
npm run dev
```

4. **Run tests:**
```bash
npm test
```

### Docker Deployment

1. **Build image:**
```bash
docker build -t webhook-code-review-server .
```

2. **Run with docker-compose:**
```bash
docker-compose up -d
```

3. **Or run directly:**
```bash
docker run -d \
  -p 8080:8080 \
  --env-file .env \
  webhook-code-review-server
```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=8080
NODE_ENV=production

# Platform API Tokens (for posting comments)
GITHUB_TOKEN=ghp_your_github_personal_access_token
GITLAB_TOKEN=glpat_your_gitlab_access_token
BITBUCKET_TOKEN=your_bitbucket_app_password

# OpenCode AI Configuration
OPENCODE_API_KEY=your_opencode_api_key_here
OPENCODE_API_URL=http://localhost:4096  # Optional
```

## API Endpoints

### Webhook Endpoint

**POST** `/v1/api/pr-code-review?provider={github|gitlab|bitbucket}`

Receives webhook events from GitHub, GitLab, or BitBucket.

**Query Parameters:**
- `provider`: `github` | `gitlab` | `bitbucket` (required)

**Response:**
- `202 Accepted`: Review started successfully
- `400 Bad Request`: Invalid provider
- `401 Unauthorized`: Invalid webhook signature
- `500 Internal Server Error`: Processing error

**Example:**
```bash
curl -X POST "http://10.60.96.27:8080/v1/api/pr-code-review?provider=github" \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=..." \
  -d @github_webhook_payload.json
```

### Health Check

**GET** `/health`

Returns server health status.

**Response:**
```json
{
  "status": "ok"
}
```

## Webhook Setup

### GitHub

1. Go to your repository → Settings → Webhooks → Add webhook
2. **Payload URL**: `http://10.60.96.27:8080/v1/api/pr-code-review?provider=github`
3. **Content type**: `application/json`
4. **Secret**: Your `GITHUB_SECRET` value
5. **Events**: Select "Pull requests"
6. **Active**: ✓

### GitLab

1. Go to your project → Settings → Webhooks
2. **URL**: `http://10.60.96.27:8080/v1/api/pr-code-review?provider=gitlab`
3. **Secret token**: Your `GITLAB_SECRET` value
4. **Trigger**: Select "Merge request events"
5. **Enable SSL verification**: ✓ (if using HTTPS)

### BitBucket

1. Go to your repository → Repository settings → Webhooks → Add webhook
2. **URL**: `http://10.60.96.27:8080/v1/api/pr-code-review?provider=bitbucket`
3. **Secret**: Your `BITBUCKET_SECRET` value
4. **Triggers**: Select "Pull request: Created" and "Pull request: Updated"

## Architecture

```
┌─────────────────┐
│   Webhook Event │ (GitHub/GitLab/BitBucket)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Express.js Server (Port 8080)      │
│  /v1/api/pr-code-review?provider=X  │
└────────┬────────────────────────────┘
         │
         ├──► Verify Signature
         │
         ├──► Parse Webhook Payload
         │
         ├──► Return 202 Accepted
         │
         └──► Async Processing:
              ├─► Clone Repository (simple-git)
              ├─► Generate Diff
              ├─► OpenCode AI Review
              └─► Post Comment to PR/MR
```

## Development

### Project Structure

```
src/
├── config.ts                    # Environment variable validation
├── server.ts                    # Express app entry point
├── controllers/
│   └── webhook.ts              # Main webhook controller
├── webhooks/
│   ├── github.ts               # GitHub webhook parser
│   ├── gitlab.ts               # GitLab webhook parser
│   └── bitbucket.ts            # BitBucket webhook parser
├── services/
│   ├── git.ts                  # Git operations (clone, diff)
│   ├── opencode.ts             # OpenCode AI integration
│   └── platforms/
│       ├── github.ts           # GitHub API client
│       ├── gitlab.ts           # GitLab API client
│       ├── bitbucket.ts        # BitBucket API client
│       └── index.ts            # Platform service aggregator
tests/
├── fixtures/                   # Test webhook payloads
└── *.test.ts                  # Test suites
```

### NPM Scripts

- `npm run dev` - Start development server with watch mode
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run test suite

## Security

- **Signature Verification**: All webhooks are verified using platform-specific signature mechanisms
- **Environment Secrets**: Sensitive data stored in environment variables
- **No Persistence**: Stateless design - repositories are cloned to temp directories and cleaned up after review
- **Input Validation**: Zod schema validation for all webhook payloads

## Troubleshooting

### Webhook not triggering

1. Check webhook delivery history in platform settings
2. Verify webhook URL is accessible from the internet
3. Ensure signature verification is passing (check server logs)

### Review not posting

1. Verify API tokens have correct permissions:
   - GitHub: `repo` scope
   - GitLab: `api` scope
   - BitBucket: `pullrequest:write` permission
2. Check server logs for errors

### Docker container fails to start

1. Verify all required environment variables are set
2. Check Docker logs: `docker logs <container_id>`
3. Ensure port 8080 is not already in use

## License

MIT
