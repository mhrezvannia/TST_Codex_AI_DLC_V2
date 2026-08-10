# Domain Entities - U03 Booking Deny

## Source Context

This entity model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U03 models authorization denial and shell denied state; it does not add new Booking persistence entities.

## Entity Catalog

| Entity / value object | Owner | Attributes | U03 role |
| --- | --- | --- | --- |
| DenyActor | Shell/BFF boundary | subject id `local.reference.admin`, roles/permission summary | Authenticated subject without Booking access. |
| BookingAccessRequest | Booking BFF/booking-service | subject, resource `booking`, action, scope, correlation id | Input to authorization. |
| DenyDecision | identity-service | allowed false, reason, decision reference, correlation id | Source of denied behavior. |
| AccessDeniedViewModel | `apps/shell` | title, explanation, request-access action, back action, correlation/decision reference | User-visible denied state. |
| DenyEvidenceRecord | evidence harness | subject, action, decision, reason/reference, correlation id, timestamp | Audit/evidence for U03. |

## Relationships

| Relationship | Cardinality | Rule |
| --- | --- | --- |
| DenyActor to BookingAccessRequest | 1 to many | Every attempted Booking action carries the real actor. |
| BookingAccessRequest to DenyDecision | 1 to 1 | Authorization response decides the shell state. |
| DenyDecision to AccessDeniedViewModel | 1 to 1 | Deny maps to in-shell denied UI, not blank data. |
| DenyDecision to DenyEvidenceRecord | 1 to 1..n | Evidence preserves subject and correlation. |

## State Model

| State | Meaning | Transition |
| --- | --- | --- |
| AuthenticatedNoBookingAccess | `local.reference.admin` session is valid but lacks Booking permission. | User navigates to `/booking`. |
| AuthorizationRequested | booking-service asks identity-service for Booking access. | Decision returns. |
| Denied | identity-service denies. | BFF/shell maps to denied view. |
| AccessDeniedRendered | Shell shows denied state with actions. | User requests access or returns home. |
| EvidenceCaptured | Deny evidence written/captured. | U03 complete. |

## Invariants

- Denied state requires an authenticated subject; unauthenticated redirect is not enough.
- A deny decision cannot return Booking list/detail data.
- Missing subject and deny are distinct fail-closed outcomes in evidence.
- Deny UI does not migrate non-Booking modules or W4-01 scope into W2-01.
- W0-01, W0-02, W1-01, and W2-02 are consumed through stable interfaces only.
