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

## Execution Checklist
당신은 다음 체크리스트를 **반드시 순서대로** 모두 완료(`[x]`)해야만 작업을 종료할 수 있음. 중간에 멈추지 마.

- [ ] 1. 레포지토리 Clone 및 fetch 수행 (bash 툴 사용)
    ```bash
    git clone --branch <HeadBranch> <RepositoryURL> "<current ISO 8601>_<PRNumber>_<RepoName>"
    cd "<current ISO 8601>_<PRNumber>_<RepoName>"
    git fetch origin <BaseBranch>
    ```
- [ ] 2. 프로젝트 스킬 확인 (`ls` 툴 사용)
    ```bash
    ls "<cloned-repository-name>/".opencode/skills/
    ls "<cloned-repository-name>/".claude/skills/
    ```
- [ ] 3. 다음 두가지 경우에 대해 분기 실행
    - **프로젝트에 연관된 코드리뷰 스킬이 있다면:**
      해당 스킬을 로드: `skill({ name: "<찾은-스킬-이름>" })`.
      프로젝트 스킬의 프로세스를 우선적으로 따름
    - **프로젝트에 스킬이 없다면:**
      프로젝트 skill이 없는 경우, 전역 base skill을 실행합니다:
      ```bash
      skill({ name: "code-review-base" })
      ```
- [ ] 4. 리뷰 결과 출력이 완전히 끝나면, `rm -rf "<cloned-repository-name>"` 실행하여 디렉토리 삭제 (bash 툴 사용)

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

