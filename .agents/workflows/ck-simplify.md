---
description: Simplify and refine code for clarity and maintainability
---

## Context
Scope:
<scope>${input}</scope>

**Principles:** YAGNI, KISS, DRY | Preserve functionality | Token efficiency

## Simplification Rules

- Reduce unnecessary nesting — prefer early returns and guard clauses
- Eliminate redundant code and abstractions
- Improve variable and function names for clarity
- Consolidate related logic
- Remove comments that describe obvious code
- Choose clarity over brevity — explicit > compact
- Never combine too many concerns into single functions
- Never remove helpful abstractions that improve organization

## Process

1. **Identify scope**: Use `${input}` or default to recent `git diff` changes
2. **Analyze**: Find complexity reduction opportunities
3. **Apply standards**: Follow `./docs/code-standards.md` conventions
4. **Refine**: Simplify without changing behavior
5. **Verify**: Run typecheck + linter to confirm no breakage

## Scope Rules

- **Default**: Only refine recently modified code (git diff)
- **Explicit path**: Review specified files/directories
- **Never**: Refactor unrelated code or change architecture

---

## Suggested Next Steps

| Command | Description |
|---------|-------------|
| `/ck-test` | Run tests to verify nothing broke |
| `/ck-review` | Code review the simplified code |
| `/ck-git` | Commit changes |

---
> **⚡ SYSTEM FALLBACK ROUTER:**
> Môi trường AI hiện tại của bạn có thể không hỗ trợ trigger slash command trực tiếp. 
> Nếu bạn cần gọi các lệnh như `/ck-git, /ck-review, /ck-test`, bạn BẮT BUỘC phải đọc nội dung của các file tương ứng tại `./.agents/workflows/tên-lệnh.md` và tự động thực thi quy trình hướng dẫn trong đó để hoàn thành công việc.
