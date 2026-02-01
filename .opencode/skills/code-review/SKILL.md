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

### Step 4: 프로젝트 컨벤션 확인

프로젝트에 `.opencode/skills/` 또는 `.claude/skills/` 디렉토리가 있다면 해당 skill들을 참고하여 프로젝트 고유의 컨벤션을 확인합니다.

## Output Format

리뷰 결과는 다음 형식으로 제공합니다:

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

## Integration with Project Skills

프로젝트에 정의된 skill이 있다면 `skill({ name: "<skill-name>" })` 도구를 호출하여 프로젝트 특화 리뷰를 수행합니다.
