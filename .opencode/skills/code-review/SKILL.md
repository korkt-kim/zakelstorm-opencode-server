---
name: code-review
description: PR 코드 리뷰 수행 - 변경된 파일 분석, 이슈 식별, 개선 제안
---

# Code Review Skill

PR(Pull Request)의 코드 변경사항을 체계적으로 리뷰하는 skill입니다.

## Activation

이 skill은 다음 상황에서 자동으로 활성화됩니다:
- `/review` 명령어 실행 시
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
- 이후로의 Step은 무시한다.

**프로젝트에 스킬이 없다면:**
- 아래 기본 프로세스 진행

### Step 2: 변경사항 파악

```bash
git diff origin/main...HEAD --name-only
git diff origin/main...HEAD --stat
```

변경된 파일 목록과 변경량을 먼저 확인합니다.

### Step 3: 파일별 상세 리뷰

각 변경된 파일에 대해:

```bash
git diff origin/main...HEAD -- <filepath>
```

### Step 4: 리뷰 관점

다음 관점에서 코드를 분석합니다:

1. **버그 가능성**: 런타임 에러, 엣지 케이스, null/undefined 처리
2. **보안**: 인증/인가, 입력 검증, 민감 정보 노출
3. **성능**: 불필요한 연산, N+1 쿼리, 메모리 누수
4. **가독성**: 네이밍, 함수 길이, 복잡도
5. **테스트**: 테스트 커버리지, 엣지 케이스 테스트

### Step 5: 프로젝트 컨벤션 적용

프로젝트의 AGENTS.md, 기타 설정 파일을 참고하여 컨벤션 준수 여부 확인.

## Output Format

프로젝트의 code-review 스킬에 Output Format이 정의되어 있으면 해당 형식을 따르고, 없으면 아래 기본 형식을 사용합니다:

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
