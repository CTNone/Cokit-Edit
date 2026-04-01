---
name: debug
description: 'Systematically investigate and diagnose issues — analyze logs, trace errors, identify root causes using structured debugging methodology.'
---

# Debug Skill

Systematic issue investigation using structured debugging methodology. Find root causes, don't treat symptoms.

## Core Principle

**Always verify assumptions with concrete evidence.** Never guess — trace, log, measure.

## Debugging Methodology

### Phase 1: Reproduce
1. Get exact error message and stack trace
2. Identify minimal reproduction steps
3. Check if error is consistent or intermittent
4. Confirm environment (dev/staging/prod)

### Phase 2: Gather Evidence
- Application logs around the error timestamp
- Recent code changes (`git log --since="24h ago"`)
- Environment variables and configuration
- System resources (memory, CPU, disk)
- Database query performance (if applicable)

### Phase 3: Hypothesis Formation
Use the **5 Whys** technique:
- Why did X happen? → Because of Y
- Why did Y happen? → Because of Z
- (Continue 3-5 times to find root cause)

Prioritize hypotheses by likelihood:
1. **Most likely**: Recent code changes, configuration drift
2. **Likely**: Dependency updates, data edge cases
3. **Less likely**: Infrastructure issues, race conditions
4. **Unlikely but check**: Memory leaks, external APIs

### Phase 4: Validate Hypothesis
- Write a test that reproduces the bug
- Verify the fix resolves the test
- Check for related issues in other code paths

### Phase 5: Fix & Prevent
- Apply minimal targeted fix
- Add regression test
- Check for similar patterns elsewhere in codebase
- Propose monitoring improvements

## Common Debugging Patterns

### JavaScript/TypeScript
```bash
# Add verbose logging
DEBUG=* npm start

# Check recent changes
git diff HEAD~5

# Find error origin
node --stack-trace-limit=50
```

### Node.js Memory Leak
```bash
node --inspect app.js
# Open chrome://inspect
```

### Slow Database Queries
```sql
EXPLAIN ANALYZE SELECT ...;
-- Look for Seq Scan on large tables
```

## Report Format

```markdown
## Debug Report: {Issue}

### Executive Summary
- Issue: [description]
- Root Cause: [identified cause]
- Severity: [critical/high/medium/low]

### Timeline
- [timestamp]: Event A
- [timestamp]: Event B

### Evidence
[Relevant logs/stack traces]

### Root Cause Analysis
[5 Whys or systematic analysis]

### Fix Applied
[What was changed and why]

### Prevention
[How to prevent recurrence]

### Unresolved Questions
[Open issues]
```

## Quality Standards

- Document investigation process for knowledge sharing
- Sacrifice grammar for concision in reports
- List unresolved questions at end of every report
