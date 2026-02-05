---
name: code-review
description: PR 코드 리뷰 수행 - 변경된 파일 분석, 이슈 식별, 개선 제안
---

# Code Review Skill

PR(Pull Request)의 코드 변경사항을 체계적으로 리뷰하는 skill입니다.

## Activation

이 skill은 다음 상황에서 자동으로 활성화됩니다:
- `/code-review` 명령어 실행 시
- "리뷰해줘", "코드 리뷰", "PR 리뷰" 키워드 감지 시

## Review Process

### Step 0: 레포지토리 준비

프롬프트에서 레포지토리 정보를 추출하여 clone합니다:

```bash
git clone --branch <branch> <repo_url> /workspace
cd /workspace
git fetch origin main
```

필요한 정보:
- `repo_url`: 리뷰할 레포지토리 URL
- `branch`: 리뷰할 브랜치 (PR 소스 브랜치)
- `base_branch`: 비교 대상 브랜치 (기본값: main)

### Step 1: 프로젝트 스킬 확인 (우선 적용)

clone된 프로젝트에 코드리뷰 관련 스킬이 있는지 확인합니다:

```bash
ls .opencode/skills/
ls .claude/skills/
```

**프로젝트에 code-review 스킬이 있다면:**
- 해당 스킬을 로드: `skill({ name: "<project-skill-name>" })`
- 프로젝트 스킬의 프로세스를 우선적으로 따름
- 이후 Step은 무시

> **Tip**: 프로젝트 skill에서 전역 기본 로직을 상속받으려면:
> ```
> skill({ name: "code-review-base" })
> ```
> 이렇게 호출하면 base skill의 리뷰 로직이 먼저 실행됩니다.

**프로젝트에 스킬이 없다면:**
- 아래 Step 2로 진행

### Step 2: 기본 리뷰 로직 실행

프로젝트 skill이 없는 경우, 전역 base skill을 실행합니다:

```
skill({ name: "code-review-base" })
```

## Skill Hierarchy

```
code-review (진입점/라우터)
    │
    ├─→ 프로젝트 skill 있음? → 프로젝트 skill 실행
    │                              │
    │                              └─→ (선택) skill({ name: "code-review-base" }) 호출로 상속
    │
    └─→ 프로젝트 skill 없음? → skill({ name: "code-review-base" }) 직접 실행
```

## Example: 프로젝트 커스텀 Skill

프로젝트에서 `.opencode/skills/code-review/SKILL.md`를 만들어 커스터마이징:

```markdown
---
name: code-review
description: 우리 팀 코드 리뷰 규칙
---

# Our Team Code Review

## Step 1: 전역 기본 리뷰 실행
skill({ name: "code-review-base" })

## Step 2: 팀 특화 규칙 적용
위 기본 리뷰에 추가로 다음을 검토:

### 네이밍 규칙
- 컴포넌트: PascalCase
- 함수/변수: camelCase
- 상수: UPPER_SNAKE_CASE

### 금지 패턴
- `any` 타입 사용 금지
- `console.log` 커밋 금지
- 매직 넘버 사용 금지

## Output Format
(프로젝트 특화 포맷 정의)
```
