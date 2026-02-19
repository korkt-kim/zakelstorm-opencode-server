# Docker Compose로 여러 서버 통합 관리하기

## 📚 목차

1. [문제 상황](#문제-상황)
2. [해결 방법: Docker Compose](#해결-방법-docker-compose)
3. [단계별 구현](#단계별-구현)
4. [멀티 스테이지 빌드](#멀티-스테이지-빌드)
5. [네트워크 설정](#네트워크-설정)
6. [편의 기능 추가](#편의-기능-추가)
7. [최종 결과](#최종-결과)

---

## 문제 상황

개발하다 보면 여러 서버를 동시에 실행해야 하는 경우가 많습니다.

**우리의 경우:**
- **OpenCode Server** (AI 코드 리뷰 서버): `localhost:3001`
- **Webhook Server** (GitHub/GitLab 웹훅 처리): `localhost:8080`

**매번 해야 하는 작업:**
```bash
# 터미널 1
cd opencode-server
npm start

# 터미널 2  
cd webhook-server
npm run dev
```

**불편한 점:**
- ❌ 터미널 2개 필요
- ❌ 순서 신경 써야 함 (OpenCode 먼저 켜야 함)
- ❌ 실수로 하나 안 켜면 에러
- ❌ 종료할 때도 2번 해야 함
- ❌ 환경 변수 설정 번거로움

---

## 해결 방법: Docker Compose

**Docker Compose란?**
- 여러 Docker 컨테이너를 한 번에 관리하는 도구
- YAML 파일로 설정 정의
- 한 명령어로 모든 서비스 시작/종료

**장점:**
- ✅ 한 번에 모든 서버 실행
- ✅ 의존성 관리 자동화
- ✅ 네트워크 자동 구성
- ✅ 환경 일관성 보장

---

## 단계별 구현

### 1단계: Dockerfile 작성

먼저 각 서비스를 Docker 이미지로 만들 수 있어야 합니다.

**기본 Dockerfile:**

```dockerfile
FROM node:24-slim

RUN apt-get update && \
    apt-get install -y git curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/server.js"]
```

**문제점:**
- 개발 환경과 프로덕션 환경이 다른데 하나의 Dockerfile만 있음
- 코드 수정할 때마다 재빌드 필요

---

### 2단계: 멀티 스테이지 빌드로 개선

하나의 Dockerfile에 개발/프로덕션 환경을 모두 정의합니다.

```dockerfile
# 공통 베이스
FROM node:24-slim AS base

RUN apt-get update && \
    apt-get install -y git curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./

# 개발 환경
FROM base AS development

RUN npm install

COPY tsconfig.json ./
COPY src ./src

EXPOSE 8080
CMD ["npm", "run", "dev"]

# 프로덕션 환경
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
```

**핵심 포인트:**

1. **`AS base`**: 공통 부분을 베이스로 분리
2. **`FROM base AS development`**: 베이스에서 개발 환경 생성
3. **`FROM base AS production`**: 베이스에서 프로덕션 환경 생성

**빌드 방법:**

```bash
# 개발용
docker build --target development -t webhook-dev .

# 프로덕션용
docker build --target production -t webhook-prod .

# target 없으면 마지막 스테이지 (production)
docker build -t webhook .
```

**장점:**
- ✅ 하나의 Dockerfile로 관리
- ✅ 공통 부분 재사용
- ✅ 환경별 최적화 가능

---

### 3단계: Docker Compose 파일 작성

여러 서비스를 정의합니다.

**docker-compose.yml (프로덕션):**

```yaml
version: '3.8'

services:
  # OpenCode AI 서버
  opencode-server:
    image: ghcr.io/opencode-ai/opencode:latest
    container_name: opencode-server
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - OPENCODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - code-review-network

  # Webhook 서버
  webhook-server:
    build:
      context: .
      target: production
    container_name: webhook-server
    ports:
      - "8080:8080"
    env_file:
      - .env
    environment:
      - PORT=8080
      - NODE_ENV=production
      - OPENCODE_API_URL=http://opencode-server:3001
    restart: unless-stopped
    depends_on:
      opencode-server:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - code-review-network

networks:
  code-review-network:
    driver: bridge
```

**주요 설정 설명:**

#### 1. `services:`
여러 서비스(컨테이너)를 정의합니다.

#### 2. `image:` vs `build:`
```yaml
# 외부 이미지 사용
image: ghcr.io/opencode-ai/opencode:latest

# 로컬 Dockerfile로 빌드
build:
  context: .           # Dockerfile 위치
  target: production   # 빌드할 스테이지
```

#### 3. `ports:`
```yaml
ports:
  - "호스트포트:컨테이너포트"
  - "8080:8080"  # localhost:8080 → 컨테이너:8080
```

#### 4. `environment:` vs `env_file:`
```yaml
environment:
  - PORT=8080                                    # 직접 지정
  - OPENCODE_API_URL=http://opencode-server:3001 # 서비스명 사용!

env_file:
  - .env  # .env 파일에서 로드
```

#### 5. `depends_on:`
```yaml
depends_on:
  opencode-server:
    condition: service_healthy  # healthcheck 통과할 때까지 대기
```

#### 6. `healthcheck:`
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s    # 30초마다 체크
  timeout: 10s     # 10초 안에 응답 없으면 실패
  retries: 3       # 3번 실패하면 unhealthy
  start_period: 40s # 시작 후 40초는 실패해도 괜찮음
```

#### 7. `networks:`
```yaml
networks:
  - code-review-network  # 이 네트워크에 연결

# 네트워크 정의
networks:
  code-review-network:
    driver: bridge
```

#### 8. `volumes:`
```yaml
volumes:
  - /tmp/code-review:/tmp/code-review  # 호스트:컨테이너
```

---

### 4단계: 개발 환경용 Docker Compose

**docker-compose.dev.yml:**

```yaml
version: '3.8'

services:
  opencode-server:
    image: ghcr.io/opencode-ai/opencode:latest
    container_name: opencode-server-dev
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - OPENCODE_ENV=development
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - code-review-network

  webhook-server:
    build:
      context: .
      target: development  # 개발 스테이지!
    container_name: webhook-server-dev
    ports:
      - "8080:8080"
    env_file:
      - .env
    environment:
      - PORT=8080
      - NODE_ENV=development
      - OPENCODE_API_URL=http://opencode-server:3001
    restart: unless-stopped
    volumes:
      - .:/app                    # 소스 코드 마운트!
      - /app/node_modules         # node_modules는 컨테이너 것 사용
      - /tmp/code-review:/tmp/code-review
    depends_on:
      opencode-server:
        condition: service_healthy
    command: npm run dev          # tsx watch로 실행
    networks:
      - code-review-network

networks:
  code-review-network:
    driver: bridge
```

**개발 환경 특징:**

```yaml
volumes:
  - .:/app              # 현재 디렉토리를 컨테이너의 /app에 마운트
  - /app/node_modules   # node_modules는 덮어쓰지 않음
```

- ✅ 코드 수정하면 즉시 반영 (hot reload)
- ✅ 재빌드 불필요
- ✅ 디버깅 편리

```yaml
command: npm run dev  # CMD 덮어쓰기
```

- Dockerfile의 기본 CMD 대신 개발 명령어 실행

---

## 멀티 스테이지 빌드

### 왜 필요한가?

**문제:**
- 개발: 빠른 시작, hot reload 필요
- 프로덕션: 최적화, 작은 이미지 크기 필요
- 두 환경이 다른데 Dockerfile을 2개 만들어야 하나?

**해결:** 멀티 스테이지 빌드

### 작동 원리

```dockerfile
FROM node:24-slim AS base          # 스테이지 1
FROM base AS development           # 스테이지 2
FROM base AS production            # 스테이지 3
```

**중요:** 모든 스테이지가 실행되는 게 아닙니다!

```bash
# development 스테이지만 빌드
docker build --target development -t app-dev .

# production 스테이지만 빌드  
docker build --target production -t app-prod .

# target 없으면 마지막 스테이지
docker build -t app .  # → production
```

### Docker Compose에서 사용

```yaml
# docker-compose.dev.yml
services:
  webhook-server:
    build:
      target: development  # development 스테이지만!

# docker-compose.yml
services:
  webhook-server:
    build:
      target: production   # production 스테이지만!
```

### 실행 흐름

**개발 환경:**
```
1. FROM node:24-slim AS base
   ├── apt-get update...
   └── COPY package*.json
   
2. FROM base AS development
   ├── npm install (devDependencies 포함)
   ├── COPY src
   └── CMD ["npm", "run", "dev"]
   
⚠️  production 스테이지는 무시됨!
```

**프로덕션 환경:**
```
1. FROM node:24-slim AS base
   ├── apt-get update...
   └── COPY package*.json
   
2. FROM base AS production
   ├── npm ci (devDependencies 제외)
   ├── COPY src
   ├── npm run build
   └── CMD ["node", "dist/server.js"]
   
⚠️  development 스테이지는 무시됨!
```

---

## 네트워크 설정

### Docker 네트워크란?

Docker 컨테이너끼리 통신하기 위한 가상 네트워크입니다.

### 네트워크 정의

```yaml
networks:
  code-review-network:
    driver: bridge
```

### 서비스를 네트워크에 연결

```yaml
services:
  opencode-server:
    networks:
      - code-review-network
      
  webhook-server:
    networks:
      - code-review-network
```

### 서비스 간 통신

**중요:** 같은 네트워크에 있으면 **서비스명**으로 통신 가능!

```yaml
services:
  opencode-server:
    container_name: opencode-server
    
  webhook-server:
    environment:
      - OPENCODE_API_URL=http://opencode-server:3001
      #                          ↑ 서비스명 사용!
```

**내부 통신:**
```
webhook-server → http://opencode-server:3001
(컨테이너 → 컨테이너)
```

**외부 접근:**
```
브라우저 → http://localhost:3001
(호스트 → 컨테이너)
```

### 네트워크 격리

다른 네트워크의 컨테이너와는 통신 불가능합니다.

```yaml
# 프로젝트 A
networks:
  projectA-network:

# 프로젝트 B  
networks:
  projectB-network:
```

프로젝트 A의 컨테이너는 프로젝트 B의 컨테이너에 접근할 수 없습니다.

---

## 편의 기능 추가

### 1. Makefile로 명령어 간소화

**Makefile:**

```makefile
.PHONY: dev prod logs down

dev:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Development environment started!"

prod:
	docker-compose up -d
	@echo "✅ Production environment started!"

logs:
	docker-compose -f docker-compose.dev.yml logs -f

down:
	docker-compose -f docker-compose.dev.yml down
	docker-compose down
```

**사용:**

```bash
make dev    # 개발 환경 시작
make logs   # 로그 확인
make down   # 중지
```

### 2. 시작 스크립트

**start.sh:**

```bash
#!/bin/bash

# .env 파일 체크
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file"
fi

# Docker 실행 체크
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi

# 서비스 시작
docker-compose -f docker-compose.dev.yml up -d

echo "✅ Services started!"
echo "   - OpenCode: http://localhost:3001"
echo "   - Webhook:  http://localhost:8080"
```

```bash
chmod +x start.sh
./start.sh
```

### 3. 헬스체크

서비스가 정상 작동하는지 자동으로 확인합니다.

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

**상태:**
- `starting`: 시작 중
- `healthy`: 정상
- `unhealthy`: 비정상

### 4. 의존성 관리

```yaml
depends_on:
  opencode-server:
    condition: service_healthy
```

- `opencode-server`가 healthy 상태가 될 때까지 `webhook-server`는 대기
- 순서 보장!

---

## 최종 결과

### Before (수동 실행)

```bash
# 터미널 1
cd ~/opencode
npm start
# OpenCode Server started at 3001

# 터미널 2
cd ~/webhook-server
export OPENCODE_API_URL=http://localhost:3001
npm run dev
# Webhook Server started at 8080
```

**문제:**
- ❌ 2개 터미널 필요
- ❌ 순서 신경 써야 함
- ❌ 환경 변수 수동 설정
- ❌ 실수 가능성

### After (Docker Compose)

```bash
make dev
# ✅ Development environment started!
#    - OpenCode Server: http://localhost:3001
#    - Webhook Server: http://localhost:8080
```

**또는:**

```bash
./start.sh
```

**장점:**
- ✅ 한 명령어로 모든 서버 실행
- ✅ 의존성 자동 관리
- ✅ 네트워크 자동 구성
- ✅ 환경 변수 자동 설정
- ✅ 헬스체크로 안정성 보장

### 관리 명령어

```bash
make dev      # 개발 환경 시작
make prod     # 프로덕션 환경 시작
make logs     # 로그 확인
make restart  # 재시작
make down     # 중지
make clean    # 완전 삭제
make status   # 상태 확인
```

---

## 핵심 개념 정리

### 1. 멀티 스테이지 빌드
- 하나의 Dockerfile로 여러 환경 관리
- `--target`으로 원하는 스테이지만 빌드
- 공통 부분 재사용으로 효율적

### 2. Docker Compose
- 여러 컨테이너를 하나의 파일로 정의
- 한 명령어로 모든 서비스 관리
- 네트워크, 볼륨, 의존성 자동 관리

### 3. 네트워크
- 같은 네트워크의 컨테이너는 서비스명으로 통신
- 외부와 격리된 안전한 통신
- `bridge` 드라이버로 자동 DNS 제공

### 4. 헬스체크
- 서비스 상태 자동 모니터링
- 의존성 관리에 활용
- `healthy` 상태 확인 후 다음 서비스 시작

### 5. 개발 환경 최적화
- 소스 코드 마운트로 hot reload
- `node_modules`는 컨테이너 것 사용
- 재빌드 없이 개발 가능

---

## 실전 팁

### 1. 파일 구조

```
project/
├── Dockerfile                 # 멀티 스테이지 빌드
├── docker-compose.yml         # 프로덕션
├── docker-compose.dev.yml     # 개발
├── Makefile                   # 편의 명령어
├── start.sh                   # 시작 스크립트
├── .env                       # 환경 변수 (gitignore)
├── .env.example               # 환경 변수 예시
└── docs/
    └── DOCKER.md              # 사용 가이드
```

### 2. .gitignore

```gitignore
.env
docker-compose.override.yml
```

### 3. 로컬 개발 시

```bash
# 개발 중에는 항상 dev
make dev

# 로그 모니터링 (별도 터미널)
make logs

# 코드 수정 → 자동 재시작
# 환경 변수 변경 → make restart
# Dockerfile 변경 → make rebuild
```

### 4. 문제 해결

```bash
# 상태 확인
make status
docker-compose -f docker-compose.dev.yml ps

# 로그 확인
make logs
docker-compose -f docker-compose.dev.yml logs webhook-server

# 재시작
make restart

# 완전 초기화
make clean
make dev
```

---

## 마치며

**Docker Compose를 사용하면:**
- ✅ 개발 환경 설정 시간 절약
- ✅ 팀원 간 환경 일관성
- ✅ 프로덕션 배포 간소화
- ✅ 복잡한 마이크로서비스 관리 용이

**From:**
```bash
# 터미널 1
cd opencode && npm start

# 터미널 2  
cd webhook && npm run dev
```

**To:**
```bash
make dev
```

이것이 Docker Compose의 힘입니다! 🚀
