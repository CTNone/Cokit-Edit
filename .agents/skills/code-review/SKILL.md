---
name: code-review
description: 'Comprehensive code review covering quality, security, performance, type safety, and task completeness. Use after implementation, before PRs, or for quality assessment.'
---

# Code Review Skill

Senior-level code review: correctness, security, performance, type safety, maintainability.

## Review Areas

| Area | What to Check |
|------|--------------|
| **Code Quality** | Standards adherence, readability, tech debt, error handling |
| **Type Safety** | TypeScript checks, stronger typing, any types to fix |
| **Build Validation** | Build success, dependency issues, env config, test coverage |
| **Performance** | Bottlenecks, DB queries, memory usage, async patterns |
| **Security** | OWASP Top 10, auth/authz, injection, input validation, secrets |
| **Task Completeness** | All plan TODOs done, no remaining TODO comments |

## Review Process

### 1. Initial Analysis
```bash
# See what changed
git diff HEAD~1
git status
git log --oneline -5
```

### 2. Severity Triage

| Severity | Examples | Must Fix? |
|----------|---------|-----------|
| **Critical** | Security vulns, data loss, breaking changes | Yes, block PR |
| **High** | Performance issues, type errors, missing error handling | Yes, before merge |
| **Medium** | Code smells, maintainability, doc gaps | Recommended |
| **Low** | Style, minor optimizations | Optional |

### 3. Security Checklist
- [ ] No secrets/credentials in code
- [ ] All user inputs validated
- [ ] SQL queries parameterized (no injection)
- [ ] Authentication checked on protected routes
- [ ] Error messages don't expose internals
- [ ] API rate limiting in place

### 4. Performance Checklist
- [ ] No N+1 database queries
- [ ] Large lists use pagination
- [ ] Expensive operations cached
- [ ] Async operations properly awaited
- [ ] No memory leaks in event listeners

## Report Format

```markdown
## Code Review Report

### Scope
[Files reviewed, commit range]

### Overall Assessment
**[PASS / NEEDS WORK / FAIL]** — [one-line rationale]

### Critical Issues
1. [File:line] — [issue] — [fix]

### High Priority Issues
1. [File:line] — [issue] — [fix]

### Medium Priority Improvements
1. [suggestion]

### Low Priority Suggestions
1. [minor improvement]

### Positive Observations
[Well-written code to acknowledge]

### Recommended Actions
1. [Prioritized list]

### Metrics
- Type coverage: [%]
- Test coverage: [%]

### Unresolved Questions
[Open issues]
```

## Guidelines

- Be constructive and educational — acknowledge good practices
- Provide context for *why* a practice is recommended
- Balance ideal practices with pragmatic solutions
- Focus on issues that truly matter — avoid nitpicking style preferences
- Respect project-specific standards in `./docs/code-standards.md`
