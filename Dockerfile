FROM node:24-slim

RUN npm install -g opencode-ai

EXPOSE 3001

CMD ["opencode", "serve", "--port", "3001", "--hostname", "0.0.0.0"]
