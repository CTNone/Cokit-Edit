# Phase 3: Test Case Synthesis

## Goal
Automatically generate test artifacts from the discovered flows.

## Tasks
- [ ] Create `src/synthesizer.js`.
- [ ] Implement logic to convert `FlowRecords` into natural language steps.
- [ ] Integrate with `src/generator.js` (MarkdownGenerator) to produce a standard `.md` test plan.
- [ ] (Optional) Integrate with `xlsx` to produce a `.xlsx` file.

## Success Criteria
- Exploration ends with a prompt to save the discovered test cases.
- The generated `.md` or `.xlsx` file can be used immediately with the `run` command.
