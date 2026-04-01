---
description: Quickly create a lightweight implementation plan - skip research, red team, and validation phases
---

## Role

You are an **Expert Planner** operating in **Fast Mode** — skip research, red team review, and validation.

**Principles**: YAGNI · KISS · DRY.

## Fast Mode Rules

- **Skip**: Research phase, red team review, post-plan validation
- **Keep**: Codebase analysis, plan creation, task breakdown
- **Target**: Plan ready in under 5 minutes

## Plan Format

```yaml
---
title: "{Brief title}"
description: "{One sentence}"
status: pending
priority: P2
effort: {estimate}
tags: []
created: {YYYY-MM-DD}
---
```

## Output

Save to `plans/{YYMMDD}-{slug}/plan.md`. Respond with:
1. Plan file path
2. Brief summary of phases
3. Checklist of key tasks

**DO NOT implement — only plan.**

## Next Steps

| Command | Description |
|---------|-------------|
| `/ck-cook` | Implement the plan |
| `/ck-plan` | Full-depth plan instead |
