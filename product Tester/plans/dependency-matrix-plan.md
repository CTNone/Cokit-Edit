# Implementation Plan: Dependency Matrix (Cây phả hệ)

## 1. Problem Statement
When running multiple selected test cases (e.g., `--select TC-01,TC-06`), the current system executes them as independent units. TC-01 runs and closes the browser. TC-06 starts and realizes it depends on TC-01, but since TC-01's page is closed, TC-06 must start a new session, losing UI state (like open menus).

## 2. Proposed Solution
Build a **Dependency Matrix** before execution to identify which scenarios serve as prerequisites for others in the current run. Use this matrix to manage the browser page lifecycle smarter.

## 3. Implementation Details

### Phase 1: Dependency Analysis Utility
Add a method `getDependencyGraph(selectedCases)` to `PlaywrightRunner` or a helper:
- It should map each Scenario ID to its set of dependents within the current run.
- Identify the "Last Use" of any scenario that acts as a prerequisite.

### Phase 2: Orchestration Update (`src/index.js`)
- Before the main execution loop, call the dependency analysis.
- Inform the runner about the execution queue or the pre-calculated dependency map.

### Phase 3: Runner Lifecycle Update (`src/runner.js`)
- In `runScenario`, before finishing:
    - Check if the current scenario ID is a prerequisite for any *subsequent* scenarios in the remainig queue.
    - If yes, set `keepOpen = true` automatically.
- Ensure that if a scenario fails, we STILL close the page to avoid carrying over a corrupted state to dependents (or mark dependents as blocked).

## 4. Proposed Changes

### `src/runner.js`
- Update `constructor` to support tracking the execution queue.
- Implement `setExecutionQueue(cases)`.
- Update `runScenario` finalize logic:
    ```javascript
    const willBeNeededByOthers = this.remainingQueue.some(tc => 
      this.normalizeId(tc.prerequisite || tc.Prerequisite) === scenarioId
    );
    if (keepOpen || willBeNeededByOthers) {
      // Keep activePage open
    } else {
      await page.close();
      this.activePage = null;
    }
    ```

### `src/index.js`
- Pass the `casesToRun` list to the runner before starting the loop.

## 5. Validation Plan
- **Command**: `node src/index.js run --select TC-01,TC-06`
- **Expected Logs**:
    - TC-01 runs successfully.
    - TC-01 finishes but **log shows it is keeping the page open** for TC-06.
    - TC-06 starts with `[Continuity]` and reuses the page.
    - Summary shows 2 Passed.

## 6. Risks & Mitigations
- **Risk**: Circular dependencies.
- **Mitigation**: The runner already has cache (`completedScenarios`), so it won't loop infinitely, but we should log a warning if detected.
- **Risk**: Memory leaks if many pages are kept open.
- **Mitigation**: We only keep ONE `activePage` at a time. New scenarios either reuse it or replace it.
