---
name: code-review-base
description: 코드 리뷰 기본 로직 - 변경사항 분석, 이슈 식별, 개선 제안 (프로젝트 skill에서 상속 가능)
---

# Code Review Base Skill

PR(Pull Request)의 코드 변경사항을 체계적으로 리뷰하는 기본 로직입니다.

> **Note**: 이 skill은 `code-review` skill 또는 프로젝트의 커스텀 code-review skill에서 호출됩니다.
> 직접 호출: `skill({ name: "code-review-base" })`

## Prerequisites

이 skill이 실행되기 전에 다음이 완료되어 있어야 합니다:
- 레포지토리가 clone되어 있음
- 작업 디렉토리가 clone된 레포지토리로 설정됨
- base branch가 fetch되어 있음 (예: `git fetch origin main`)

## Review Process

### Step 1: 변경사항 파악

```bash
git diff origin/main...HEAD --name-only
git diff origin/main...HEAD --stat
```

변경된 파일 목록과 변경량을 먼저 확인합니다.

### Step 2: 파일별 상세 리뷰

각 변경된 파일에 대해:

```bash
git diff origin/main...HEAD -- <filepath>
```

### Step 3: 리뷰 관점

다음 관점에서 코드를 분석합니다:

1. **버그 가능성**: 런타임 에러, 엣지 케이스, null/undefined 처리
2. **보안**: 인증/인가, 입력 검증, 민감 정보 노출
3. **성능**: 불필요한 연산, N+1 쿼리, 메모리 누수
4. **가독성**: 네이밍, 함수 길이, 복잡도
5. **테스트**: 테스트 커버리지, 엣지 케이스 테스트

### Step 4: 프로젝트 컨벤션 적용

프로젝트의 다음 파일들을 참고하여 컨벤션 준수 여부 확인:
- `AGENTS.md` - AI 에이전트 가이드라인
- `.eslintrc.*` / `eslint.config.*` - ESLint 규칙
- `.prettierrc.*` - Prettier 설정
- `tsconfig.json` - TypeScript 설정
- `CONTRIBUTING.md` - 기여 가이드라인

## Output Format

```markdown
## PR Review Summary

### Critical Issues (must fix)
- [ ] 파일명:라인 - 이슈 설명

### Suggestions (should consider)
- [ ] 파일명:라인 - 제안 내용

### Minor (nice to have)
- [ ] 파일명:라인 - 개선 아이디어

### Good Points
- 잘 작성된 부분에 대한 피드백
```

## Extensibility

프로젝트 skill에서 이 base skill을 확장할 수 있습니다:

```markdown
# My Project Code Review

## Step 1: 기본 리뷰 실행
skill({ name: "code-review-base" })

## Step 2: 프로젝트 특화 규칙
위 기본 리뷰에 추가로 다음을 검토:
- 우리 팀 네이밍 컨벤션
- 금지된 라이브러리 사용 여부
- 특정 패턴 강제
```
