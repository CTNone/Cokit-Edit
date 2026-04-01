# CoKit Development Rules

## Principles (MUST ALWAYS FOLLOW)

- **YAGNI**: Don't add features until needed
- **KISS**: Prefer simple solutions over complex ones
- **DRY**: Extract repeated code into reusable functions

## Code Standards

- File size: Keep under 200 lines when practical
- Naming: `kebab-case` for files, `camelCase` for variables, `PascalCase` for classes
- No hardcoded secrets or credentials — use environment variables
- Verify before claiming complete — run tests/typecheck

## Quality Gates (Before Any Commit)

- [ ] Run linter: no new warnings or errors
- [ ] All tests pass: `npm test` or equivalent
- [ ] No TODO/FIXME without tracking issues
- [ ] Error handling explicit — no silent failures
- [ ] No secrets, keys, or credentials in code

## Security

- Never commit secrets, keys, or credentials
- Use environment variables for configuration
- Validate all user inputs at boundaries
- Escape outputs to prevent injection
- Parameterize all database queries (no SQL injection)

## Git Hygiene

- Atomic commits (one logical change per commit)
- Conventional commit messages: `type(scope): description`
- No large binary files in repo
- Keep branches short-lived — merge often

## Frontend Guidelines

For `.tsx`, `.jsx`, `.vue`, `.svelte`, `components/**`:
- Use functional components with hooks
- Prefer composition over inheritance
- Handle loading states explicitly
- Design mobile-first, then scale up
- Support keyboard navigation (WCAG AA)
- Google Fonts must support Vietnamese characters

## Backend Guidelines

For `.py`, `.go`, `.rs`, `.java`, `api/**`, `services/**`:
- Validate all external inputs at boundaries
- Handle errors explicitly, no silent failures
- Use transactions for multi-step operations
- Rate limit outbound API calls
- Cache responses when appropriate

## Testing Guidelines

For `*.test.ts`, `*.spec.ts`, `test_*.py`, `*_test.go`:
- One concept per test (single assertion focus)
- Follow Arrange-Act-Assert (AAA) pattern
- Cover happy path, edge cases, and error cases
- Mock external dependencies only (DB, APIs)
- No skipped tests without linked issue
- No flaky tests — fix or delete

## Documentation

- Update `./docs/code-standards.md` when patterns change
- Keep `./docs/codebase-summary.md` up-to-date
- Document architectural decisions in `./docs/system-architecture.md`
- API changes go in `./docs/api-docs.md`
