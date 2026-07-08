# Security Requirements - U03 Reference Domain API

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` requires authenticated caller context, U02 authorization for protected mutations, audit metadata, and provider APIs. `business-rules.md` prohibits direct database access, requires classification for Party/Customer data, validates search/filter inputs, and requires structured audit signals. `requirements.md` fixes NFR-006 through NFR-010, C-003, C-004, C-008, and the out-of-scope module boundaries.

## Access Control Requirements

- `reference-data-service` is the only owner of canonical state for the nine MVP reference sets.
- Consumers, frontend apps, future modules, and other services must not read or write its database directly.
- Admin create, update, deactivate, and reactivate operations require `identity-service` authorization.
- Provider reads must be authorized when the reference set or caller context requires it.
- Authorization denial must prevent persistence and return a standard error envelope or read-only signal.

## Data Classification Requirements

- Party/Customer records containing PII or commercially sensitive values must be classified as Confidential or Restricted.
- Sensitive reads and administrative mutations must produce structured access/audit signals.
- UI-facing DTOs must expose stable ids and business codes but not internal database keys.
- API responses must not expose unsafe internal fields, stack traces, or persistence details.

## Validation and Input Security

- Admin writes must reject invalid required fields, duplicate business keys, invalid relationships, orphan ports, prohibited port re-parenting, inactive relationship references where not allowed, and stale versions.
- Search/filter inputs must be validated to prevent unbounded queries and injection-style abuse.
- API errors must distinguish validation, duplicate key, not found, conflict, authorization, and dependency unavailable cases.
- Validation-only operations must not persist data or emit domain change facts.

## Audit Requirements

- Successful mutations must record actor, timestamp, operation, before/after summary where practical, reason/change note where supplied, version, and correlation id.
- Reference admin changes must be append-only or tamper-evident from the application perspective.
- Failed validation, authorization, or conflict attempts must produce logs/audit signals where security-relevant.
- Change history queries must be authorized and filtered.

## Threat Considerations

| Threat | Required mitigation |
|---|---|
| Direct database coupling | Provider/admin APIs and events only; no shared DB access. |
| Privilege bypass | Backend authorization through U02 before protected mutations. |
| Sensitive customer data exposure | Classification, safe DTOs, access logging, least privilege. |
| Data integrity break through invalid relationships | Aggregate invariant validation before persistence. |
| Unbounded query abuse | Validated filters, pagination, deterministic sort, bounded search fields. |

## Non-Goals

- No customer-facing identity or self-service.
- No downstream module runtime policies.
- No final retention period decision; `requirements.md` leaves audit/event retention open.

