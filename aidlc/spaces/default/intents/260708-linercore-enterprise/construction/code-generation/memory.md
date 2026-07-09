# Code Generation Memory

## Interpretations

- 2026-07-09T12:09:48Z - Treated `contract-platform-catalog` as repository tooling and executable contract assets, not a runtime service; the functional, NFR, and infrastructure designs all place first-release ownership in `contracts/`, validation scripts, generated evidence, and read-only health snapshots.
- 2026-07-09T12:21:45Z - Added AsyncAPI as an executable catalog asset class for this unit; requirements and functional design name AsyncAPI alongside Avro and message-pact, so readiness coverage needed explicit channel files and verifier checks.
- 2026-07-09T12:27:51Z - Treated `local-runtime-foundation` startup verification as dry-run plus script evidence in code generation; Docker Desktop is not reachable in this environment, so real Compose startup belongs to Build and Test or a workstation with Docker running.
- 2026-07-09T13:20:40Z - Treated `shared-platform-identity-security` as a bounded hardening pass over existing auth and Identity Service surfaces; the repo already had package, app, and Java policy layers, so implementation strengthened those boundaries in place instead of adding a parallel identity subsystem.
- 2026-07-09T13:26:47Z - Treated `shared-platform-reference-events` as a Reference Data Service outbox/evidence hardening pass; existing lifecycle, history, validation, and publisher paths were present, so implementation enriched event evidence and tests rather than adding another event subsystem.
- 2026-07-09T13:37:15Z - Treated `booking-lifecycle-domain` as a greenfield Booking Service foundation and limited the first implementation to domain-core and application-service modules; container/API/runtime wiring is deferred until the service contract surface is expanded.
- 2026-07-09T13:43:34Z - Treated `charge-agreement-pricing-domain` as a brownfield extension of the existing Charge Agreement Service; lifecycle and active lookup already existed, so implementation added pricing, manual fallback, and D&D rule evidence in place.

## Deviations

- 2026-07-09T12:09:48Z - Reviewer invocation will be handled inline if the configured architecture reviewer role remains unavailable; the current account previously rejected the reviewer model while preserving the required review findings in the primary artifact.
- 2026-07-09T12:21:45Z - Ran code generation inline after the configured developer subagent failed to start; the failure happened before code edits because the role's fixed `openai.gpt-5.5` model is unsupported for this ChatGPT account.
- 2026-07-09T13:20:40Z - Continued code generation inline for `shared-platform-identity-security` because the harness exposed no `codex exec` agent selector and prior code-generation memory already recorded the configured developer role model mismatch.
- 2026-07-09T13:26:47Z - Did not make further local runtime metadata changes in `shared-platform-reference-events`; the immediately preceding identity/security unit had already added service identity metadata and validation, and this unit only needed contract/outbox evidence alignment.
- 2026-07-09T13:37:15Z - Narrowed the contract-catalog guardrail that previously blocked `services/booking-service`; Booking Service is now in-scope for this enterprise unit, while still-out-of-scope runtime directories remain blocked.
- 2026-07-09T13:43:34Z - Did not modify OpenAPI/Pact fixtures for `charge-agreement-pricing-domain` because the existing contract catalog remained green after service-level pricing additions.

## Tradeoffs

- 2026-07-09T12:09:48Z - Planned bounded contract-platform implementation before downstream service generation; this keeps U02 focused on readiness evidence and avoids creating Booking, Charge, or CMM runtime code outside this unit's ownership.
- 2026-07-09T12:21:45Z - Kept health snapshots as command output/evidence-file payloads instead of committed generated artifacts; this avoids timestamp churn while still giving CI and local scripts machine-readable readiness evidence.
- 2026-07-09T12:27:51Z - Added runtime profile metadata rather than parsing Compose YAML in every readiness path; this gives tests and later UI/readiness surfaces a stable contract while Compose remains the deployment source.
- 2026-07-09T13:20:40Z - Represented Java service subjects with factory helpers and a claim-version marker rather than changing the `AuthenticatedSubject` record shape; this delivered service identity coverage without forcing broad constructor churn through existing modules.
- 2026-07-09T13:26:47Z - Put producer identity, schema subject, deduplication key, and correlation id into the outbox payload while preserving the existing envelope shape; this keeps current publisher ports stable and gives consumers executable evidence fields.
- 2026-07-09T13:37:15Z - Used fakeable ports for Booking authorization, reference validation, pricing, idempotency, audit, and outbox; this gives executable lifecycle behavior without creating cross-service joins or implementing downstream pricing/D&D logic.
- 2026-07-09T13:43:34Z - Kept Charge pricing automatic only when an active agreement and applicable terms exist; missing matches become manual pricing cases rather than hidden defaults, preserving commercial auditability.

## Open questions

- 2026-07-09T12:09:48Z - Confirm during later units whether generated typed clients should be committed or regenerated in service-specific code-generation stages.
