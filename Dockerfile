FROM node:24-slim

RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g opencode-ai

WORKDIR /app

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

COPY AGENTS.md /app/AGENTS.md
COPY .opencode /app/.opencode

ENV REPO_URL=""
ENV PR_NUMBER=""

EXPOSE 3001

ENTRYPOINT ["/app/entrypoint.sh"]
