---
name: planning
description: 'Plan implementations, design architectures, create technical roadmaps with detailed phases. Use for feature planning, system design, solution architecture, implementation strategy.'
---

# Planning Skill

Create detailed technical implementation plans through research, codebase analysis, solution design, and comprehensive documentation.

## When to Use

Use this skill when:
- Planning new feature implementations
- Architecting system designs
- Evaluating technical approaches
- Creating implementation roadmaps
- Breaking down complex requirements
- Assessing technical trade-offs

## Core Principles

Always honoring **YAGNI**, **KISS**, and **DRY** principles.
**Be honest, be brutal, straight to the point, and be concise.**

## Planning Workflow

### 1. Research & Analysis
- Investigate existing solutions, patterns, and best practices
- Read relevant documentation and codebases
- **Skip if:** Provided with researcher reports

### 2. Codebase Understanding
- Read `./docs/codebase-summary.md` if it exists
- Scan `./docs/` directory for relevant docs
- Use grep/search to find relevant code patterns

### 3. Solution Design
- Define clear boundaries and interfaces
- Identify dependencies and risks
- Consider multiple approaches with trade-offs
- Choose the simplest approach that meets requirements

### 4. Plan Creation

Every `plan.md` MUST start with YAML frontmatter:

```yaml
---
title: "{Brief title}"
description: "{One sentence for card preview}"
status: pending
priority: P2
effort: {sum of phases, e.g., 4h}
tags: [relevant, tags]
created: {YYYY-MM-DD}
---
```

### 5. Task Breakdown

Create a checklist per phase:
```markdown
## Phase Checklist

- [ ] Phase 1: Setup (1h) — no dependencies
- [ ] Phase 2: Core Logic (2h) — depends on Phase 1
- [ ] Phase 3: Testing (1h) — depends on Phase 2
```

## Plan Directory Structure

```
plans/
└── {YYMMDD}-{slug}/
    ├── research/
    │   └── researcher-01-report.md
    ├── reports/
    │   └── XX-report.md
    ├── plan.md
    ├── phase-01-setup.md
    ├── phase-02-core.md
    └── phase-03-testing.md
```

## Output Requirements

- DO NOT implement code — only create plans
- Respond with plan file path and brief summary
- Ensure self-contained plans with necessary context
- Include code snippets/pseudocode when clarifying
- Provide multiple options with trade-offs when appropriate

## Quality Standards

- Be thorough and specific
- Consider long-term maintainability
- Address security and performance concerns
- Make plans detailed enough for junior developers
- Validate against existing codebase patterns

**Remember:** Plan quality determines implementation success. Be comprehensive and consider all aspects.
