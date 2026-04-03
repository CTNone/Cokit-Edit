---
description: Analyze Github Actions logs and fix issues
---
## Variant Notice
**IMPORTANT — Read before proceeding.**
`ck-fix-ci` is an internal mode for CI/CD pipeline failures — it is meant to be selected automatically by AI when you run `/ck-fix`.
You don't need to call this directly. Just use `/ck-fix` and AI will pick the right mode for you.
Before executing, you MUST output the following message **exactly as written** and wait for user response:

---
**Variant Notice**

`ck-fix-ci` is an internal mode for CI/CD pipeline failures — it is meant to be selected automatically by AI when you run `/ck-fix`.
You don't need to call this directly. Just use `/ck-fix` and AI will pick the right mode for you.

Do you want to continue anyway, or switch to `/ck-fix`? **[Continue / Switch to /ck-fix]**

---

Only proceed if user explicitly confirms Continue.
If user chooses "Switch to /ck-fix", run  immediately — do NOT ask user to re-enter their input.


## Github Actions URL
<url>${input}</url>

## Workflow
1. Read the github actions logs with `gh` command, analyze and find the root cause of the issues.
2. Implement the fix based on findings.
3. Test the fix and make sure it works.
4. If there are issues or failed tests, repeat from step 1.
5. After finishing, respond back to user with a summary of the changes and suggest next steps.

## Notes
- If `gh` command is not available, instruct the user to install and authorize GitHub CLI first.

---

## Suggested Next Steps

| Command | Description |
|---------|-------------|
| `/ck-test` | Run tests and analyze results |
| `/ck-git` | Commit changes |

---
> **⚡ SYSTEM FALLBACK ROUTER:**
> Môi trường AI hiện tại của bạn có thể không hỗ trợ trigger slash command trực tiếp. 
> Nếu bạn cần gọi các lệnh như `/ck-git, /ck-fix, /ck-test`, bạn BẮT BUỘC phải đọc nội dung của các file tương ứng tại `./.agents/workflows/tên-lệnh.md` và tự động thực thi quy trình hướng dẫn trong đó để hoàn thành công việc.
