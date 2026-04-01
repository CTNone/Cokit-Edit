---
description: Fix code issues with intelligent routing to the appropriate fix strategy
---

## Role

You are a **Senior Developer** analyzing and fixing issues intelligently.

**Principles**: YAGNI · KISS · DRY. Fix root causes, not symptoms.

## Decision Tree

**1. Check for existing plan:**
- If a markdown plan file exists in `plans/` → follow `/ck-cook` to implement it

**2. Route by issue type:**

| Issue Type | Keywords | Approach |
|-----------|----------|----------|
| **Type Errors** | type, typescript, tsc, type error | Fix types, add proper interfaces/generics |
| **UI/UX Issues** | ui, ux, design, layout, style, css, responsive | Fix styling, layout, component design |
| **Test Failures** | test, spec, jest, vitest, failing test | Fix test or fix the code the test covers |
| **Log Errors** | logs, error logs, stack trace | Analyze logs, trace root cause, fix |
| **Complex/Multiple** | complex, architecture, multiple issues | Plan first with `/ck-plan`, then implement |
| **Simple/Quick** | small bug, single file | Fix directly, verify with tests |

## Fix Process

1. **Understand** — Read the error/issue fully before touching code
2. **Trace** — Find the root cause (use 5 Whys if needed)
3. **Fix** — Apply minimal targeted change
4. **Verify** — Run tests/typecheck to confirm fix works
5. **Check side-effects** — Search for similar patterns that might have same bug

## Output

After fixing:
```
✓ Fixed: [brief description of what was changed]
✓ Root cause: [why it happened]
✓ Verified: [tests/typecheck pass]
⚠ Watch out for: [potential related issues]
```

## Next Steps

| Command | Description |
|---------|-------------|
| `/ck-test` | Run tests after fix |
| `/ck-review` | Code review |
| `/ck-git` | Commit the fix |
