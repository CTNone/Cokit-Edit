# CoKit — Antigravity Integration

## What is CoKit?

CoKit is a collection of **agents, prompts, instructions, and skills** designed to supercharge AI-assisted development workflows. Originally built for GitHub Copilot, this system has been integrated into **Antigravity** (Google Deepmind AI Assistant).

## System Architecture

```
.agents/
├── DEVELOPMENT_RULES.md      ← Global coding standards (always follow)
├── CONTEXT.md                ← This file — project overview
├── workflows/                ← Slash commands for Antigravity
│   ├── ck-ask.md            ← /ck-ask — architectural consultation
│   ├── ck-brainstorm.md     ← /ck-brainstorm — ideation
│   ├── ck-plan.md           ← /ck-plan — full implementation planning
│   ├── ck-plan-fast.md      ← /ck-plan-fast — quick planning
│   ├── ck-cook.md           ← /ck-cook — code implementation
│   ├── ck-review.md         ← /ck-review — code review
│   ├── ck-debug.md          ← /ck-debug — debugging
│   ├── ck-fix.md            ← /ck-fix — intelligent fix routing
│   ├── ck-simplify.md       ← /ck-simplify — code simplification
│   ├── ck-git.md            ← /ck-git — git operations
│   └── ck-run-tests.md      ← /ck-run-tests — manual test runner (xlsx→md→execute→report)
└── skills/                   ← Reusable skill modules
    ├── planning/             ← Planning methodology
    ├── research/             ← Research methodology
    ├── debug/                ← Debugging methodology
    ├── code-review/          ← Code review methodology
    ├── frontend-design/      ← UI/UX design guidelines
    ├── sequential-thinking/  ← Structured reasoning
    ├── web-testing/          ← Automated testing methodology
    └── manual-tester/        ← Manual QA: xlsx→md→execute→report
        └── scripts/
            └── xlsx_to_md.py ← Excel to Markdown converter

.github/                      ← Original GitHub Copilot config (reference)
├── agents/                  ← 12 Copilot agent definitions
├── prompts/                 ← 34 Copilot prompt files
├── instructions/            ← 5 Copilot instruction files
├── skills/                  ← Copilot skill definitions
└── collections/             ← Curated agent collections
```

## Workflow Reference

| Slash Command | Description | Use When |
|---------------|-------------|----------|
| `/ck-ask` | Architectural consultation | Technical questions, design decisions |
| `/ck-brainstorm` | Ideation & evaluation | Exploring solutions, debating approaches |
| `/ck-plan` | Comprehensive planning | New features, complex systems |
| `/ck-plan-fast` | Quick planning | Simple features, time-sensitive |
| `/ck-cook` | Implementation | Executing a plan |
| `/ck-review` | Code review | Before PRs, quality check |
| `/ck-debug` | Root cause analysis | Investigating bugs |
| `/ck-fix` | Smart fix routing | Any code issue |
| `/ck-simplify` | Code cleanup | After implementation |
| `/ck-git` | Version control | Committing, pushing, PRs |
| `/ck-run-tests` | Manual test runner | Run Excel test cases step-by-step with evidence |

## Available Skills

| Skill | Description | Used In |
|-------|-------------|---------|
| `planning` | Create comprehensive plans | `/ck-plan`, `/ck-plan-fast` |
| `research` | Research & synthesize findings | `/ck-plan`, `/ck-ask` |
| `debug` | Structured debugging | `/ck-debug`, `/ck-fix` |
| `code-review` | Comprehensive review | `/ck-review` |
| `frontend-design` | UI/UX design | Design tasks |
| `sequential-thinking` | Step-by-step reasoning | Complex analysis |
| `web-testing` | Automated testing (Playwright, Vitest, k6) | Automated test suites |
| `manual-tester` | Manual QA: xlsx→md→execute→report | `/ck-run-tests` |

## Important Conventions

1. **Read `.agents/DEVELOPMENT_RULES.md`** before any code changes
2. **Check `./docs/`** for project documentation before planning
3. **Save plans** to `plans/{YYMMDD}-{slug}/plan.md`
4. **Save reports** to `plans/reports/{type}-{date}-{slug}.md`
5. **Always use** sequential-thinking for complex multi-step problems

## Source: .github/ Integration Map

| `.github/` File | `.agents/` Equivalent |
|----------------|----------------------|
| `agents/planner.agent.md` | `workflows/ck-plan.md` + `skills/planning/SKILL.md` |
| `agents/debugger.agent.md` | `workflows/ck-debug.md` + `skills/debug/SKILL.md` |
| `agents/brainstormer.agent.md` | `workflows/ck-brainstorm.md` |
| `agents/code-reviewer.agent.md` | `workflows/ck-review.md` + `skills/code-review/SKILL.md` |
| `agents/tester.agent.md` | `skills/web-testing/SKILL.md` |
| `agents/researcher.agent.md` | `skills/research/SKILL.md` |
| `agents/ui-ux-designer.agent.md` | `skills/frontend-design/SKILL.md` |
| `agents/fullstack-developer.agent.md` | `workflows/ck-cook.md` |
| `agents/scout.agent.md` | Built-in search tools |
| `agents/code-simplifier.agent.md` | `workflows/ck-simplify.md` |
| `agents/git-manager.agent.md` | `workflows/ck-git.md` |
| `agents/docs-manager.agent.md` | Documentation conventions |
| `prompts/ck-fix.prompt.md` | `workflows/ck-fix.md` |
| `instructions/*.instructions.md` | `DEVELOPMENT_RULES.md` |
| `skills/planning/SKILL.md` | `skills/planning/SKILL.md` |
| `skills/web-testing/SKILL.md` | `skills/web-testing/SKILL.md` |
| `agents/tester.agent.md` (manual flow) | `workflows/ck-run-tests.md` + `skills/manual-tester/SKILL.md` |
