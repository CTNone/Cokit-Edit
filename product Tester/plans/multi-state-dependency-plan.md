# Implementation Plan: Status-Aware Multi-Dependencies

## 1. Problem Statement
The current system only supports a single prerequisite and assumes it must have a `passed` status. Specifically, it fails to recognize statuses like `TC-01-FAILED` as valid dependencies and interprets them as missing scenarios.

## 2. Objectives
- Support multiple prerequisites using comma separation (Implicit AND).
- Support specific status expectations (e.g., `TC1-FAILED`, `TC1-PASSED`).
- Maintain backward compatibility for simple IDs (e.g., `TC1` defaults to `passed`).

## 3. Technical Approach

### Phase 1: Prerequisite Parser
Create a utility in `PlaywrightRunner` to parse strings like `TC1-FAILED, TC2`.
- **Input**: `"TC1-FAILED, TC2"`
- **Output**: `[{ id: 'TC-01', expected: 'failed' }, { id: 'TC-02', expected: 'passed' }]`

### Phase 2: Update `runScenario` Dependency Check
- Loop through all parsed prerequisites.
- For each prerequisite:
    - Trigger `runScenario(prereq.id)`.
    - Compare actual result with `expected`.
    - If mismatch, mark current scenario as `blocked` and stop checking.

### Phase 3: Update `isContinuation` Logic
- If multiple prerequisites exist, continuity should only be applied to the LAST one executed OR the one that most recently left the browser open.
- For simplicity: If ANY prerequisite was just completed in the current run, enable continuity.

## 4. Implementation Steps

### `src/runner.js`
1.  **New Private Method `_parseDependency(raw)`**:
    - Handles splitting by comma.
    - Uses regex to extract status suffix (e.g., `/-(PASSED|FAILED|BLOCKED|SKIPPED)$/i`).
    - Normalizes the base ID using existing logic.
2.  **Update `runScenario`**:
    - Replace the single `prereqId` check with a loop over `_parseDependency`.
    - Implement the "Implicit AND" logic.

### 5. Validation Plan
- **Test Case 1**: `Prerequisite: TC-01-FAILED`. Run TC-01 to fail, then verify TC-03 runs.
- **Test Case 2**: `Prerequisite: TC-01-PASSED, TC-02-PASSED`. Verify both must pass.
- **Test Case 3**: Mixed status.

## 6. Risks
- **Complexity**: Deep chains of status-aware dependencies might be hard to debug.
- **Mitigation**: Add clear logging showing "Dependency matched: TC-01 is FAILED as expected".
