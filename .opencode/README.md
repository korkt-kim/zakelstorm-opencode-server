# OpenCode 디렉토리 구조 가이드

`.opencode/` 디렉토리는 OpenCode 서버의 설정, 캐시, 그리고 커스텀 스킬을 관리합니다.

## 📁 디렉토리 구조

```
.opencode/
├── configs/           # OpenCode 설정 파일
├── cache/            # Provider dependencies & cache
├── skills/           # 커스텀 skills (전역)
└── README.md         # 이 파일
```

---

## 📂 configs/

**용도:** OpenCode 서버의 설정 파일 및 인증 정보

**포함 파일:**
- `opencode.json` - OpenCode 메인 설정 (providers, models, plugins, MCP)
- `auth.json` - 인증 정보 (API keys, OAuth tokens)
- `*.example` - 설정 파일 템플릿

**사용 방법:**

### 1. 설정 파일 생성
```bash
# Example 파일을 실제 파일로 복사
cp .opencode/configs/opencode.json.example .opencode/configs/opencode.json
cp .opencode/configs/auth.json.example .opencode/configs/auth.json
```

### 2. API 키 설정
```json
// auth.json
{
  "h-chat-openai": {
    "type": "api",
    "key": "your_actual_api_key_here"
  }
}
```

### 3. Provider 설정
```json
// opencode.json
{
  "provider": {
    "h-chat-anthropic": {
      "npm": "@fdi/h-chat-anthropic",
      "options": {
        "apiKey": "your_key",
        "baseURL": "https://h-chat-api.autoever.com"
      },
      "models": { ... }
    }
  }
}
```

**Docker 마운트:**
- `.opencode/configs/` → `/root/.config/opencode/` (컨테이너 내부)
- 설정 변경 후 컨테이너 재시작: `docker-compose restart opencode-server`

**보안:**
- ⚠️ `opencode.json`과 `auth.json`은 `.gitignore`에 포함됨 (Git에 커밋되지 않음)
- ✅ `.example` 파일만 Git에 추적됨

---

## 📂 cache/

**용도:** Custom provider의 npm dependencies 및 캐시 데이터

**포함 파일:**
- `package.json` - Provider dependencies 정의
- `package-lock.json` - Dependency lock file
- `node_modules/` - 설치된 npm packages
- `*.example` - 설정 파일 템플릿

**사용 방법:**

### 1. Dependencies 설정
```bash
# Example 파일을 실제 파일로 복사
cp .opencode/cache/package.json.example .opencode/cache/package.json
```

### 2. Dependencies 편집
```json
// package.json
{
  "dependencies": {
    "@fdi/h-chat-anthropic": "latest",
    "@fdi/h-chat-google": "latest",
    "@fdi/h-chat-openai": "latest"
  }
}
```

### 3. Dependencies 설치
```bash
cd .opencode/cache
npm install
```

### 4. Docker 재시작
```bash
docker-compose restart opencode-server
```

**Docker 마운트:**
- `.opencode/cache/` → `/root/.cache/opencode/` (컨테이너 내부)
- Volume으로 마운트되어 컨테이너에서 `node_modules/` 접근 가능

**보안:**
- ⚠️ `node_modules/`, `package.json`, `package-lock.json`은 `.gitignore`에 포함됨
- ✅ `.example` 파일만 Git에 추적됨

**주의사항:**
- OpenCode 이미지에는 `npm`이 없으므로 **호스트에서 설치**해야 함
- Docker 컨테이너 내부에서는 설치 불가능

---

## 📂 skills/

**용도:** OpenCode에서 사용할 커스텀 skills (전역 스킬)

**포함 디렉토리:**
- `code-review/` - 코드 리뷰 스킬
- `your-custom-skill/` - 직접 추가한 스킬

**Skills 구조:**
```
skills/
└── code-review/
    ├── SKILL.md          # 스킬 정의 파일 (필수)
    └── other-files       # 추가 리소스 (선택)
```

**사용 방법:**

### 1. 기존 Skills 사용
OpenCode는 자동으로 `.opencode/skills/` 디렉토리의 모든 스킬을 로드합니다.

### 2. 커스텀 Skill 추가
```bash
# 1. 새 스킬 디렉토리 생성
mkdir -p .opencode/skills/my-custom-skill

# 2. SKILL.md 파일 작성
cat > .opencode/skills/my-custom-skill/SKILL.md <<EOF
# My Custom Skill

## Description
This skill does...

## Usage
Use this skill when...

## Examples
...
EOF

# 3. Docker 재시작
docker-compose restart opencode-server
```

**Docker 마운트:**
- `.opencode/skills/` → `/root/.opencode/skills/` (컨테이너 내부)
- Skills는 OpenCode 서버가 시작할 때 자동 로드됨

**Skill 작성 가이드:**
- `SKILL.md`는 Markdown 형식으로 작성
- OpenCode가 이해할 수 있도록 명확한 설명과 예시 포함
- 프로젝트별 context에 맞게 조정 가능

**참고 문서:**
- [OpenCode Skills Documentation](https://opencode.ai/docs/skills/)

---

## 🔄 전체 워크플로우

### 초기 설정

```bash
# 1. 설정 파일 생성
cp .opencode/configs/opencode.json.example .opencode/configs/opencode.json
cp .opencode/configs/auth.json.example .opencode/configs/auth.json
cp .opencode/cache/package.json.example .opencode/cache/package.json

# 2. 설정 파일 편집 (API 키 입력)
vim .opencode/configs/auth.json
vim .opencode/configs/opencode.json

# 3. Cache dependencies 설치
cd .opencode/cache
npm install
cd ../..

# 4. Docker 시작
docker-compose up -d
```

### 설정 변경 시

```bash
# 1. 설정 파일 수정
vim .opencode/configs/opencode.json

# 2. Docker 재시작
docker-compose restart opencode-server
```

### Dependencies 추가 시

```bash
# 1. package.json 수정
vim .opencode/cache/package.json

# 2. 설치
cd .opencode/cache
npm install
cd ../..

# 3. Docker 재시작
docker-compose restart opencode-server
```

### Skills 추가 시

```bash
# 1. Skill 추가
mkdir -p .opencode/skills/my-skill
vim .opencode/skills/my-skill/SKILL.md

# 2. Docker 재시작
docker-compose restart opencode-server
```

---

## 🔐 보안 주의사항

**절대 커밋하지 말 것:**
- ❌ `.opencode/configs/opencode.json` (API 설정 포함)
- ❌ `.opencode/configs/auth.json` (API 키 포함)
- ❌ `.opencode/cache/package.json` (프로젝트별 설정)
- ❌ `.opencode/cache/node_modules/` (대용량)

**커밋해도 되는 것:**
- ✅ `.opencode/configs/*.example` (템플릿)
- ✅ `.opencode/cache/*.example` (템플릿)
- ✅ `.opencode/skills/**` (커스텀 스킬)
- ✅ `.opencode/README.md` (이 파일)

**`.gitignore`가 자동으로 처리:**
```gitignore
.opencode/configs/auth.json
.opencode/configs/opencode.json
.opencode/cache/*
!.opencode/cache/*.example
```

---

## 📚 참고 문서

- [OpenCode Configuration](https://opencode.ai/docs/configuration/)
- [OpenCode Providers](https://opencode.ai/docs/providers/)
- [OpenCode Skills](https://opencode.ai/docs/skills/)

---

## 💡 FAQ

**Q: OpenCode 서버가 설정을 못 읽어요**
```bash
# 1. 마운트 확인
docker exec opencode-server ls -la /root/.config/opencode/

# 2. 설정 파일 확인
docker exec opencode-server cat /root/.config/opencode/opencode.json

# 3. 로그 확인
docker logs opencode-server
```

**Q: Dependencies가 설치 안 돼요**
```bash
# OpenCode 이미지에는 npm이 없습니다. 호스트에서 설치하세요!
cd .opencode/cache
npm install

# 그 다음 Docker 재시작
docker-compose restart opencode-server
```

**Q: Skills가 적용 안 돼요**
```bash
# 1. Skills 디렉토리 확인
docker exec opencode-server ls -la /root/.opencode/skills/

# 2. Docker 재시작 (필수!)
docker-compose restart opencode-server
```

**Q: 설정 파일이 Git에 커밋되어 버렸어요**
```bash
# Git tracking에서 제거 (파일은 유지됨)
git rm --cached .opencode/configs/opencode.json
git rm --cached .opencode/configs/auth.json
git commit -m "chore: remove config files from tracking"
```
