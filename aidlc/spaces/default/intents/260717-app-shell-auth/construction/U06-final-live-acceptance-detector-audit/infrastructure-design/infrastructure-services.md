# Infrastructure Services - U06 Final Live Acceptance and Audit

## Source Context

This infrastructure service design consumes U06 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U06 `business-logic-model.md`. It distinguishes runtime services from local evidence resources.

## Service Inventory

| Service/resource | Existing/New | U06 responsibility | Change |
| --- | --- | --- | --- |
| Nginx | Existing | Accepted browser entrypoint. | No new route beyond U01-U05. |
| `apps-shell`, `apps-auth`, `apps-booking` | Existing from prior units. | Scenario surfaces. | Observe only. |
| booking-service and identity-service | Existing | Authorization/evidence sources. | Observe allow/deny/sign-out outcomes. |
| Evidence package directory | Filesystem artifact | Final acceptance package. | Create/write under `artifacts/w2-01-live/app-shell-auth/`. |
| Detector/audit command outputs | Filesystem artifacts | Command status evidence. | Save exact output files and manifest command entries. |
| Blocker records | Filesystem artifact | Honest BLOCKED handling. | Required for any non-PASS status. |

## Configuration Contract

| Configuration | Owner | Rule |
| --- | --- | --- |
| Evidence root | U06 evidence writer | `artifacts/w2-01-live/app-shell-auth/`. |
| Scenario ids | Scenario runner | `allow-booking-create-detail`, `deny-booking-access`, `sign-out-reauth-stale-call`, `legacy-bookings-compatibility`. |
| Command ids | Command capture | `detector-6d`, `erp-fidelity-audit`, `aidlc-audit`. |
| Decision statuses | Manifest/final decision | `PASS` or `BLOCKED` only. |
| W1 waiver status | Manifest/final decision | BLOCKED at `compose-start`, distinct from W2-01 final decision. |

## Storage and Data Services

Evidence is stored as project files, not a database or runtime service. JSON/JSONL files must be parseable before PASS. Artifact output should remain small and reviewable; excessive/unreviewable output becomes a blocker.

## Service Discovery

Scenario drivers use the local Nginx entrypoint. Command runners execute from the repo root so output paths are deterministic. Existing Compose DNS remains internal runtime detail and is captured only when relevant in readiness evidence.

## Security Services

No new secrets manager or audit service is added. The evidence writer must scrub or omit raw tokens, cookies, service tokens, secrets, and broad PII from saved artifacts.

## Shared Infrastructure Boundary

U06 consumes all prior W2-01 runtime infrastructure but does not own it. It produces final evidence and blockers only; it does not alter shell, Booking, identity, reference-data, platform/eventing, or design-system infrastructure to make evidence easier.

