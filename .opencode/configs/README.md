# OpenCode Configuration

이 디렉토리 구조는 OpenCode 서버의 설정과 커스텀 skills를 관리합니다.

## 📁 디렉토리 구조

```
.opencode/
├── configs/                   # OpenCode 설정 파일
│   ├── auth.json             # 실제 인증 정보 (gitignore됨)
│   ├── opencode.json         # 실제 설정 파일 (gitignore됨)
│   ├── auth.json.example     # 인증 정보 예시
│   ├── opencode.json.example # 설정 파일 예시
│   └── README.md             # 이 파일
└── skills/                    # 커스텀 skills (전역)
    └── code-review/
```

## 🔗 Docker 마운트

Docker Compose가 다음과 같이 마운트합니다:

```yaml
volumes:
  - ./.opencode/configs:/root/.config/opencode:ro  # 설정 파일
  - ./.opencode:/root/.opencode:ro                 # Skills & 전역 데이터 (configs 포함)
```

## 🚀 설정 방법

### 1. 예시 파일 복사

```bash
cp .opencode/configs/auth.json.example .opencode/configs/auth.json
cp .opencode/configs/opencode.json.example .opencode/configs/opencode.json
```

### 2. API 키 입력

**auth.json:**
```json
{
  "h-chat-openai": {
    "type": "api",
    "key": "your_actual_api_key_here"
  }
}
```

**opencode.json:**
```json
{
  "provider": {
    "h-chat-anthropic": {
      "options": {
        "apiKey": "your_actual_api_key_here",
        "baseURL": "https://h-chat-api.autoever.com"
      }
    }
  }
}
```

### 3. Docker Compose 실행

```bash
docker-compose up -d
```

설정 파일들이 자동으로 OpenCode 컨테이너에 마운트됩니다:
- `./.opencode/configs/opencode.json` → `/root/.config/opencode/opencode.json`
- `./.opencode/configs/auth.json` → `/root/.config/opencode/auth.json`

## 🔐 보안

- ⚠️ **실제 설정 파일(`auth.json`, `opencode.json`)은 절대 Git에 커밋하지 마세요!**
- ✅ 이미 `.gitignore`에 추가되어 있습니다
- ✅ `.example` 파일만 Git에 커밋됩니다

## 🎓 Skills 설정

`.opencode/skills/` 디렉토리에 커스텀 skills를 추가하면 OpenCode 서버에서 전역으로 사용할 수 있습니다.

### Skills 추가 방법

1. `.opencode/skills/` 디렉토리에 skill 파일 추가
2. Docker Compose 재시작
3. OpenCode가 자동으로 skills를 로드

### 예시

```
.opencode/skills/
├── my-custom-skill.md
├── code-review.md
└── testing-guide.md
```

## 📖 참고 문서

- [OpenCode Providers](https://opencode.ai/docs/providers/)
- [OpenCode Configuration](https://opencode.ai/docs/configuration/)
- [OpenCode Skills](https://opencode.ai/docs/skills/)

## 💡 설정 예시

### H-Chat 프로바이더 설정

```json
{
  "provider": {
    "h-chat-anthropic": {
      "npm": "@fdi/h-chat-anthropic",
      "name": "H-Chat Anthropic Claude",
      "options": {
        "apiKey": "your_key",
        "baseURL": "https://h-chat-api.autoever.com"
      },
      "models": {
        "claude-sonnet-4-5": {
          "name": "Claude Sonnet 4.5",
          "attachment": true
        }
      }
    }
  }
}
```

### Google OAuth 설정

```json
{
  "google": {
    "type": "oauth",
    "refresh": "refresh_token|project_name",
    "access": "access_token",
    "expires": 1234567890
  }
}
```
