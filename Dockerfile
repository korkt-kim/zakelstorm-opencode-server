FROM node:24-slim

RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g opencode-ai

COPY .opencode .opencode

EXPOSE 3001

CMD ["opencode", "serve", "--hostname", "0.0.0.0", "--port", "3001"]
