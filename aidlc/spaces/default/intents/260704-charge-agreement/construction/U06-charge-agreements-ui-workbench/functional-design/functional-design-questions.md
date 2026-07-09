# Functional Design Questions - U06 Charge Agreements UI Workbench

## Answers

| Question | Answer |
| --- | --- |
| What is the first functional screen? | A single workbench with list/filter, detail, editor, status actions, and active lookup preview. |
| How does the UI write data? | Through Next.js BFF route handlers calling U05 backend APIs. |
| How are validation errors handled? | Preserve draft input, focus/announce summary, and mark invalid fields. |
| What proves it is not view-only? | Browser can create/edit/approve and run active lookup preview against API-backed data. |

## Source Alignment

Answered from `mockups.md`, `requirements.md`, `stories.md`, `components.md`, `component-methods.md`, and `services.md`.
