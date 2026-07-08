# Tech Stack Decisions - U07 Contracts DX

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines OpenAPI/Avro publication, examples, message-pact/provider fixtures, Schema Registry compatibility, and read-only catalog views. `business-rules.md` fixes OpenAPI for `reference-data-service` and `identity-service`, nine Avro event contracts, message-pact/provider fixtures, and accessible UI views. `requirements.md` mandates OpenAPI, Avro 1.11, Confluent Schema Registry, Pact/message-pact, Next.js App Router, and no downstream runtime services.

## Decision Summary

U07 uses the mandated contract stack and exposes contract evidence as artifacts and optional read-only app views.

## Stack Decisions

| Concern | Selection | Rationale |
|---|---|---|
| Sync API contracts | OpenAPI | Required for reference-data and identity APIs. |
| Event schemas | Avro 1.11 | Required typed reference-change event format. |
| Schema governance | Confluent Schema Registry compatibility | Required for event evolution checks. |
| Contract tests | Pact/message-pact or equivalent | Required API/message fixture checks. |
| Catalog UI | `apps/reference-data` read-only views | Fits existing admin/developer workspace without new runtime product. |
| Frontend components | Accessible tabs, code blocks, lists, text labels | Required by U07 business rules and WCAG posture. |

## Rejected Alternatives

| Alternative | Rejection reason |
|---|---|
| Generic event only | Violates nine typed event scope. |
| Database schemas as contracts | Violates service ownership and C-008. |
| Unknown compatibility freeze | Explicitly blocked. |
| Downstream runtime stubs | Out of workflow scope. |
| Editable contract UI | Production contract source remains artifact-controlled. |

## Implementation Guidance for Later Units

- U08 enforces U07 evidence as CI gates.
- U06 may display read-only catalog views.
- U10 may surface compatibility status in operational evidence but does not own contracts.

