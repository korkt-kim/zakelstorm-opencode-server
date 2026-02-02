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
make dev
```

또는

```bash
docker-compose -f docker-compose.dev.yml up -d
```

이 명령으로 다음 서비스가 시작됩니다:
- **OpenCode Server**: http://localhost:4096
- **Webhook Server**: http://localhost:8080 (hot reload 지원)

### 3. 프로덕션 환경 실행

```bash
make prod
```

또는

```bash
docker-compose up -d
```

## 📋 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `make dev` | 개발 환경 시작 (hot reload) |
| `make prod` | 프로덕션 환경 시작 |
| `make logs` | 모든 서비스 로그 확인 |
| `make logs-webhook` | Webhook 서버 로그만 확인 |
| `make logs-opencode` | OpenCode 서버 로그만 확인 |
| `make down` | 모든 컨테이너 중지 |
| `make restart` | 서비스 재시작 |
| `make rebuild` | 이미지 재빌드 및 재시작 |
| `make clean` | 컨테이너 및 볼륨 삭제 |
| `make status` | 서비스 상태 확인 |
| `make help` | 사용 가능한 명령어 목록 |

## 🔧 상세 설명

### 개발 환경 vs 프로덕션 환경

**개발 환경 (`docker-compose.dev.yml`)**
- 소스 코드가 컨테이너에 마운트됨 (실시간 반영)
- `npm run dev` (tsx watch) 실행
- Hot reload 지원
- 디버깅에 용이

**프로덕션 환경 (`docker-compose.yml`)**
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
# 모든 로그
make logs

# 특정 서비스 로그
docker-compose -f docker-compose.dev.yml logs -f webhook-server
docker-compose -f docker-compose.dev.yml logs -f opencode-server
```

### 컨테이너가 시작되지 않는 경우

```bash
# 상태 확인
docker-compose -f docker-compose.dev.yml ps

# 컨테이너 재시작
make restart

# 완전히 재빌드
make clean
make rebuild
```

### OpenCode 서버 이미지 업데이트

```bash
docker pull ghcr.io/opencode-ai/opencode:latest
make rebuild
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
GITLAB_HOST=https://gitlab.hmc.co.kr/
GITHUB_HOST=https://github.com

# OpenCode는 자동으로 설정됩니다 (Docker Compose 사용 시)
# OPENCODE_API_URL=http://opencode-server:4096
```

## 🎯 일반적인 워크플로우

### 개발 시작

```bash
make dev
make logs
# 코드 수정 → 자동으로 재시작됨
```

### 변경사항 테스트

```bash
# 코드 수정 후
make logs-webhook  # 로그 확인

# 문제가 있으면
make restart       # 재시작
```

### 프로덕션 배포 전 테스트

```bash
make down          # 개발 환경 중지
make prod          # 프로덕션 환경 시작
# 테스트...
make down          # 중지
```

### 완전히 초기화

```bash
make clean         # 모든 컨테이너 및 볼륨 삭제
make dev           # 새로 시작
```

## 💡 팁

1. **개발 중에는 `make dev` 사용**
   - 코드 변경이 즉시 반영됩니다
   - 디버깅이 쉽습니다

2. **로그 모니터링**
   - 별도 터미널에서 `make logs` 실행
   - 실시간으로 로그 확인

3. **빠른 재시작**
   - 코드 변경: 자동 재시작 (개발 모드)
   - 환경 변수 변경: `make restart`
   - Dockerfile 변경: `make rebuild`

4. **리소스 정리**
   - 작업 종료 시 `make down`으로 컨테이너 중지
   - 디스크 공간 확보 시 `make clean`
