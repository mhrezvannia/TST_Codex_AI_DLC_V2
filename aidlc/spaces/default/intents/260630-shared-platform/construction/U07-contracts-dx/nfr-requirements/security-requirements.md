# Security Requirements - U07 Contracts DX

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines safe contract publication, review, examples, fixtures, and no downstream runtime code. `business-rules.md` prohibits database contracts, downstream stubs, editable production contract source from UI, and requires standard error envelopes/correlation ids. `requirements.md` fixes NFR-006 through NFR-010, C-007, C-008, and contract testing requirements.

## Contract Safety Requirements

- Contracts must not expose service database tables as integration contracts.
- OpenAPI examples must not include secrets, tokens, production identifiers, or unsafe PII.
- Event payload examples must respect Party/Customer classification and avoid unnecessary sensitive fields.
- Identity-service examples expose only safe authorization/session summaries.
- Contract catalog views are read-only and cannot edit production contract source.

## Access Requirements

- Contract views may be shown only to authorized internal users where the app exposes them.
- Downstream reviewers receive contract artifacts and findings, not runtime access or databases.
- Compatibility findings must not leak internal stack traces or credentials.

## Boundary Requirements

- Charge, Booking, and Container Movement appear only as future external consumers, reviewers, or example personas.
- U07 must not create downstream runtime services, UI screens, implementation stubs, or shared database contracts.

## Non-Goals

- No production contract editing UI.
- No downstream service authorization.
- No public external developer portal.

