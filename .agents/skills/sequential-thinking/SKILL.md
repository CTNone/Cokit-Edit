---
name: sequential-thinking
description: 'Break complex problems into sequential thought steps. Use for structured reasoning, multi-step analysis, complex debugging, and decision-making that requires careful step-by-step thinking.'
---

# Sequential Thinking Skill

Transform complex problems into structured, sequential thought chains. Prevents jumping to conclusions and ensures comprehensive analysis.

## When to Use

- Complex debugging requiring multi-step analysis
- Architectural decisions with many interdependencies
- Multi-constraint optimization problems
- When first instinct might be wrong
- Planning tasks with unclear dependencies

## Sequential Thinking Process

### Step 1: Frame the Problem
```
Problem: [Clear, concise statement]
Goal: [What "solved" looks like]
Constraints: [Non-negotiable requirements]
```

### Step 2: Break Into Sub-Problems
List all sub-problems that must be solved:
1. Sub-problem A
2. Sub-problem B
3. Sub-problem C

Identify dependencies:
- B depends on A being solved first
- C can be solved in parallel with A

### Step 3: Solve Sequentially

For each sub-problem in dependency order:
```
Step N: [Action]
- What I'm doing: [explanation]
- Why: [rationale]
- Expected outcome: [what success looks like]
- Actual outcome: [what happened]
- Next step: [what this enables]
```

### Step 4: Validate Chain

After solving all steps:
- Does the solution address the original problem?
- Are all constraints satisfied?
- What edge cases were missed?
- What assumptions were made?

### Step 5: Synthesize

Combine step results into a coherent solution:
- Key decisions made at each step
- Trade-offs chosen and why
- Remaining uncertainties

## Template

```markdown
## Sequential Analysis: {Problem}

### Problem Frame
- Problem: ...
- Goal: ...
- Constraints: ...

### Sub-Problems
1. [Sub-problem A]
2. [Sub-problem B] (depends on A)
3. [Sub-problem C]

### Step-by-Step Solution

**Step 1: [Action for Sub-problem A]**
- Doing: ...
- Why: ...
- Outcome: ...

**Step 2: [Action for Sub-problem B]**
- Doing: ...
- Why: ...
- Outcome: ...

**Step 3: [Action for Sub-problem C]**
- Doing: ...
- Why: ...
- Outcome: ...

### Synthesis
[Combined solution]

### Unresolved Questions
- Question 1
```

## Quality Standards

- Never skip steps even if answers seem obvious
- Document each step's reasoning explicitly
- Revise earlier steps if later steps reveal errors
- Prefer sequential correctness over speed
