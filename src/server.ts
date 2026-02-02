import express, { Request, Response } from 'express';
import { PORT, NODE_ENV } from './config.js';
import { handleCodeReview } from './controllers/webhook.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/v1/api/pr-code-review', handleCodeReview);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[${NODE_ENV}] Webhook Code Review Server listening on http://0.0.0.0:${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`Webhook endpoint: http://0.0.0.0:${PORT}/v1/api/pr-code-review?provider={github|gitlab|bitbucket}`);
});

export default app;
