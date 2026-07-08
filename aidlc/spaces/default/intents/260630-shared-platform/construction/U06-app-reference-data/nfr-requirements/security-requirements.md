# Security Requirements - U06 Reference Data App

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines BFF permission resolution, access denied/read-only states, service calls, validation, event status, and no direct browser backend access. `business-rules.md` requires BFF-only calls, fail-closed protected mutations, safe correlation ids, sensitive-data cues, and no downstream runtime screens. `requirements.md` fixes NFR-006 through NFR-010, NFR-013, NFR-015, C-005, C-007, and C-008.

## Access Control Requirements

- Browser clients call only `apps/reference-data` BFF route handlers.
- BFF handlers call `identity-service` or approved session claims before protected workflows.
- Protected mutations fail closed when authorization data is unavailable.
- Users with read but not write permission receive read-only experience.
- UI hiding/disabling controls is not authoritative security; backend/BFF authorization remains required.

## Data Protection Requirements

- Party/Customer screens show classification/access cues where PII or commercially sensitive fields are present.
- Event id and correlation id are copyable only where safe and with accessible labels.
- UI-facing data must not expose internal database keys, raw tokens, secrets, stack traces, or unauthorized policy internals.
- Browser-visible code must not call backend services directly.

## Validation and Error Security

- Service validation maps to fields and summary without exposing stack traces.
- Duplicate, stale, authorization, not-found, dependency-unavailable, and validation failures remain distinguishable.
- Access-denied states show requested area/action and correlation id without leaking sensitive policy detail.
- Request-access affordance must not grant permissions automatically.

## Non-Goals

- No backend aggregate invariant ownership.
- No downstream Charge, Booking, or Container Movement screens.
- No direct database or service credentials in frontend code.

