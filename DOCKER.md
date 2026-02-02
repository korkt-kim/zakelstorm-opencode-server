# Docker 사용 가이드

이 가이드는 Docker Compose를 사용하여 OpenCode 서버와 Webhook 서버를 함께 실행하는 방법을 설명합니다.

## 🚀 빠른 시작

### 1. 환경 변수 설정

`.env` 파일을 생성하고 필요한 설정을 입력하세요:

```bash
cp .env.example .env
# .env 파일을 편집하여 토큰 등을 설정
```

### 2. 개발 환경 실행

```bash
npm run dev
```

이 명령으로 다음 서비스가 시작됩니다:
- **OpenCode Server**: http://localhost:4096
- **Webhook Server**: http://localhost:8080

### 3. 프로덕션 환경 실행

```bash
docker-compose up -d
```

## 🔧 상세 설명

### 프로덕션 환경(`docker-compose.yml`)
- 빌드된 코드로 실행
- 최적화된 이미지 사용
- 안정적인 성능

### 네트워크 구조

두 서비스는 `code-review-network`라는 Docker 네트워크로 연결되어 있습니다.

Webhook 서버는 다음 URL로 OpenCode 서버에 접근합니다:
```
http://opencode-server:4096
```

외부(호스트)에서는 다음 URL로 접근:
```
http://localhost:4096  # OpenCode Server
http://localhost:8080  # Webhook Server
```

### 헬스체크

두 서비스 모두 헬스체크가 설정되어 있습니다:
- OpenCode Server: `http://localhost:4096/health`
- Webhook Server: `http://localhost:8080/health`

Webhook 서버는 OpenCode 서버가 healthy 상태가 될 때까지 대기합니다.

## 🐛 트러블슈팅

### 포트가 이미 사용 중인 경우

```bash
# 포트를 사용 중인 프로세스 확인
lsof -i :4096
lsof -i :8080

# 프로세스 종료 또는 docker-compose.yml에서 포트 변경
```

### 로그 확인

```bash
# 특정 서비스 로그
docker-compose logs -f webhook-server
docker-compose logs -f opencode-server
```

## 📝 환경 변수

`.env` 파일에서 설정할 수 있는 주요 환경 변수:

```bash
# Server Configuration
PORT=8080
NODE_ENV=development

# Platform API Tokens
GITLAB_TOKEN=your_gitlab_token
GITHUB_TOKEN=your_github_token

# Platform Hosts
MODEL_PROVIDER=opencode
MODEL=big-pickle

# OpenCode는 자동으로 설정됩니다 (Docker Compose 사용 시)
# OPENCODE_API_URL=http://opencode-server:4096
```