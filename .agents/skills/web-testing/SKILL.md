---
name: web-testing
description: 'Web testing with Playwright, Vitest, k6. E2E/unit/integration/load/security/visual/a11y testing. Multi-language support (JS/TS, Python, Go, Rust, Flutter). Use for test automation, flakiness, Core Web Vitals, mobile, cross-browser.'
---

# Web Testing Skill

Comprehensive testing: unit, integration, E2E, load, security, visual regression, accessibility. Multi-language workflow orchestration with structured QA reporting.

## Core Principle

**NEVER IGNORE FAILING TESTS.** Fix root causes, not symptoms. No mocks/cheats/tricks to pass builds.

## Quick Start

```bash
# JavaScript/TypeScript
npx vitest run                    # Unit tests
npx playwright test               # E2E tests
npm run test:coverage             # Coverage

# Python
pytest --cov=src                  # Unit + coverage

# Go / Rust / Flutter
go test ./... -cover              # Go
cargo test                        # Rust
flutter test --coverage           # Flutter

# Web Quality
k6 run load-test.js               # Load tests
npx @axe-core/cli https://...    # Accessibility
npx lighthouse https://...       # Performance
```

## Testing Strategy

| Model | Structure | Best For |
|-------|-----------|----------|
| Pyramid | Unit 70% > Integration 20% > E2E 10% | Monoliths |
| Trophy | Integration-heavy | Modern SPAs |
| Honeycomb | Contract-centric | Microservices |

## Test Execution Workflow

1. **Identify scope** — recently changed files or explicit scope
2. **Pre-flight checks** — dependencies installed, environment ready
3. **Execute tests** — unit → integration → E2E in order
4. **Analyze results** — check failures, coverage gaps
5. **Coverage analysis** — target 80%+ lines, 70%+ branches
6. **Build verification** — ensure production build succeeds
7. **Report** — structured QA summary

## Tools Integration

- **Test runners**: Vitest, Jest, Mocha, pytest, go test, cargo test, flutter test
- **Coverage**: Istanbul/c8/nyc, pytest-cov, go cover
- **E2E**: Playwright (multi-browser, sharding)
- **Load**: k6
- **Accessibility**: axe-core, WCAG checklist

## Report Format

```markdown
## QA Report

### Summary
- Tests run: X | Passed: X | Failed: X | Skipped: X
- Coverage: X% lines, X% branches, X% functions
- Build: [pass/fail]

### Failed Tests
[List with error messages]

### Coverage Gaps
[Uncovered critical paths]

### Performance
- Test execution time: Xs
- Slow tests: [list if any >5s]

### Recommendations
1. [Actionable improvements]

### Unresolved Questions
[Open issues]
```

## Quality Standards

- All critical paths must have test coverage
- Validate happy path AND error scenarios
- Ensure test isolation — no interdependencies
- Tests must be deterministic and reproducible
- Clean up test data after execution
- Coverage: 80%+ lines, 70%+ branches minimum
