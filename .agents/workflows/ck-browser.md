---
description: Run browser automation with Playwright and record video evidence
---

# Browser Automation (Playwright)

**Skill:** `web-testing`, `manual-tester`

Use this workflow to automate and record browser interaction sessions, usually for manual test cases or visual verification.

## Basic Usage

```powershell
python .agents/skills/browser-automation/scripts/recorder.py --url "<URL>" --steps "<STEPS>" --output "<FILENAME.webm>"
```

### Steps syntax
Steps are pipe-separated (`|`).
Format: `cmd: target, value`

| Step Type | Example |
|-----------|---------|
| `click`     | `click: button.login-btn` |
| `fill`      | `fill: #id, my-value` |
| `press`     | `press: Enter` |
| `wait`      | `wait: 2.0` (seconds) |
| `screenshot`| `screenshot: login-page` |

## Workflow

1.  **Configure Environment**: Ensure Playwright is installed via `pip install playwright`.
2.  **Define Steps**: Break down the test case into a sequence of browser actions.
3.  **Run with Recording**: Execute the `recorder.py` script from the terminal.
4.  **Verify Evidence**: Check `tests/recordings/` for the produced `.webm` video.
5.  **Clean up**: Remove unnecessary or temporary recordings if needed.

## Integration Note

-   **Copilot**: Command `/ck-browser` is configured to use this script.
-   **Automated Tests**: Use this script within `/ck-run-tests` to capture video evidence for each test case automatically.

## Troubleshooting

-   **Selector not found**: If the script fails, double-check the CSS selectors in the step configuration.
-   **Timeout**: Increase `wait` if elements take too long to load.
-   **Headless vs Headed**: Currently set to `headless=False` for visual verification and recording.
