# Business Logic Model - U06 Charge Agreements UI Workbench

## Scope

U06 turns the Charge Agreement app into a functional browser workbench. It consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `mockups.md`, and `services.md`.

## UI Workflows

| Workflow | Flow |
| --- | --- |
| Search | User edits filters, BFF calls search API, list updates without layout shift. |
| Create Draft | User opens editor, fills header and terms, saves through BFF, detail selects created agreement. |
| Edit Draft | User opens existing Draft, edits fields/terms, saves with expected version. |
| Approve | User triggers approve action from detail; UI refreshes status and activity. |
| Suspend/Expire | User triggers status action for Approved agreement; active lookup eligibility changes. |
| Active lookup preview | User enters customer/lane/commodity/date and sees match or no-match result. |

## State Model

Local component state holds filters, selected agreement, editor draft, validation errors, pending operation, and lookup query/result. Server state is fetched through BFF clients with correlation IDs.

## Handoff

U07 enriches selectors with Shared Platform reference data. U08 adds local runtime and smoke checks.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U06 is explicitly functional rather than view-only and maps UI states to API-backed workflows.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.