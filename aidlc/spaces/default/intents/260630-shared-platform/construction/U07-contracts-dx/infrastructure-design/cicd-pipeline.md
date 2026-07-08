# CI/CD Pipeline - U07 Contracts DX

## Pipeline Stages

| Stage | Checks |
|---|---|
| OpenAPI | Syntax, examples, metadata, diff/compatibility. |
| Avro | Schema syntax, examples, common envelope, typed event coverage. |
| Schema Registry | Compatibility against accepted baseline. |
| Fixtures | Pact/message-pact binding and shape validation. |
| Scope guard | Reject database contracts, editable contract UI, downstream runtime stubs. |
| Freeze | Require compatible status and recorded findings/version impact. |

## Deployment Stages

There is no runtime deployment beyond optional read-only catalog views in `apps/reference-data`.

## Rollback

Contract rollback uses version-control and accepted baseline records. Unknown compatibility cannot be overridden for freeze by this design.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
