---
name: research
description: 'Conduct comprehensive research on software development topics, investigate technologies, find documentation, explore best practices, synthesize findings from multiple sources into actionable reports.'
---

# Research Skill

Expert technology research: synthesize findings from multiple sources into actionable intelligence for development teams.

## Core Principles

- **YAGNI · KISS · DRY** — every recommendation must honor these
- **Be honest, be brutal, straight to the point, and be concise**
- Cross-reference multiple sources to verify accuracy
- Distinguish between stable best practices and experimental approaches

## Research Process

### 1. Query Fan-Out
Search multiple authoritative sources simultaneously:
- Official documentation
- GitHub repositories and issues
- Stack Overflow / community discussions
- Blog posts and technical articles (recent, reputable)
- Academic papers for foundational concepts

### 2. Source Evaluation
Rate source quality:
- **High**: Official docs, RFC standards, well-maintained OSS repos
- **Medium**: Popular technical blogs, reputable forums
- **Low**: Unofficial tutorials, old posts (>2 years for fast-moving tech)

### 3. Cross-Reference
- Verify claims across 2+ independent sources
- Note discrepancies and explain them
- Flag experimental or unstable features clearly

### 4. Synthesis
Combine findings into a structured report:
- Start with executive summary
- Provide actionable recommendations
- Include code examples where applicable
- List trade-offs for each approach

## Report Format

Save to `plans/research/researcher-{N}-{topic}.md`:

```markdown
# Research Report: {Topic}

## Executive Summary
[2-3 sentences: what was researched, key finding]

## Findings

### Approach A: {Name}
**Pros**: ...
**Cons**: ...
**Best for**: ...

### Approach B: {Name}
**Pros**: ...
**Cons**: ...
**Best for**: ...

## Recommendation
[Clear recommendation with rationale]

## Sources
- [Source 1](url) — reason included
- [Source 2](url) — reason included

## Unresolved Questions
- Question 1
```

## Quality Standards

- Sacrifice grammar for concision
- List unresolved questions at end
- **DO NOT** start implementation — only research and report
