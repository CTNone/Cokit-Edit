---
agent: 'agent'
description: 'Record browser automation with Playwright and save as video'
argument-hint: '--url <app-url> --steps "<cmd: target | ...>" --output <filename.webm>'
tools: ['execute/runInTerminal', 'execute/getTerminalOutput']
---

## Context

```
Run browser automation with recording: <operation>${input}</operation>
```

## How to execute

Use the `recorder.py` script from the terminal to automate and record browser actions.

**Base Command:**
```powershell
python .agents/skills/browser-automation/scripts/recorder.py --url "<URL>" --steps "<STEPS>" --output "<FILENAME.webm>"
```

### Steps syntax
Steps are separated by `|`. Each step follows `cmd: target, value`.

| CMD | Format | Description |
|-----|--------|-------------|
| `click` | `click: <selector>` | Clicks an element |
| `fill` | `fill: <selector>, <text>` | Fills an input field |
| `press` | `press: <key>` | Presses a keyboard key (e.g., Enter, Tab) |
| `wait` | `wait: <seconds>` | Waits for seconds |
| `screenshot`| `screenshot: <name>` | Saves screenshot to `tests/recordings/` |

**Example:**
To test a login flow:
```powershell
python .agents/skills/browser-automation/scripts/recorder.py --url "http://localhost:3000" --steps "fill: #username, <username> | fill: #password, <password> | click: #login-btn | wait: 2.0 | screenshot: logged-in" --output "login-test.webm"
```

## Tips for the Agent

1. **Selector selection**: Try to find unique IDs or data-attributes when possible.
2. **Timing**: Use `wait: <n>` for transitions or animations if needed.
3. **Evidence**: Always use `--output` with a descriptive name for the recording.
4. **Cleanup**: Recordings are stored in `tests/recordings/`.

## Suggested Next Steps

| Command | Description |
|---------|-------------|
| `/ck-run-tests` | Run a full test plan using this tool |
| `/ck-debug` | Debug failures found during automation |

