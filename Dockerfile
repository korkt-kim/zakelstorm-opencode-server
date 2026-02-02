FROM node:24-slim AS base

RUN apt-get update && \
    apt-get install -y git curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

FROM base AS development

RUN npm install

COPY tsconfig.json ./
COPY src ./src

EXPOSE 8080

CMD ["npm", "run", "dev"]

FROM base AS production

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

RUN npm prune --production

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/server.js"]
