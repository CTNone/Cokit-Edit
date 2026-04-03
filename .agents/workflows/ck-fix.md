---
description: Analyze and fix issues with intelligent routing
---

**Analyze issues and route to specialized fix command:**
<issues>${input}</issues>

## Decision Tree

**1. Check for existing plan:**
- If markdown plan exists → `/ck-cook <path-to-plan>`

**2. Route by issue type:**

**A) Type Errors** (keywords: type, typescript, tsc, type error)
→ `/ck-fix-types`

**B) UI/UX Issues** (keywords: ui, ux, design, layout, style, visual, button, component, css, responsive)
→ `/ck-fix-ui <detailed-description>`

**C) CI/CD Issues** (keywords: github actions, pipeline, ci/cd, workflow, deployment, build failed)
→ `/ck-fix-ci <github-actions-url-or-description>`

**D) Test Failures** (keywords: test, spec, jest, vitest, failing test, test suite)
→ `/ck-fix-test <detailed-description>`

**E) Log Analysis** (keywords: logs, error logs, log file, stack trace)
→ `/ck-fix-logs <detailed-description>`

**F) Complex/Multiple Issues** (keywords: complex, architecture, refactor, major, system-wide, multiple components, 2+ unrelated issues)
→ `/ck-fix-hard <detailed-description>`

**G) Simple/Quick Fixes** (default: small bug, single file, straightforward)
→ `/ck-fix-fast <detailed-description>`

## Notes
- `detailed-description` = enhanced prompt describing issue in detail
- If unclear, ask user for clarification before routing
- Can combine routes: e.g., multiple type errors + UI issue → `/ck-fix-hard`

---

## Suggested Next Steps

| Command | Description |
|---------|-------------|
| `/ck-test` | Run tests and analyze results |
| `/ck-git` | Commit changes |

---
> **⚡ SYSTEM FALLBACK ROUTER:**
> Môi trường AI hiện tại của bạn có thể không hỗ trợ trigger slash command trực tiếp. 
> Nếu bạn cần gọi các lệnh như `/ck-fix-types, /ck-git, /ck-fix-hard, /ck-test`, bạn BẮT BUỘC phải đọc nội dung của các file tương ứng tại `./.agents/workflows/tên-lệnh.md` và tự động thực thi quy trình hướng dẫn trong đó để hoàn thành công việc.
