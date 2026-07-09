# Personas - Shared Platform Local Functionality

## Context

These personas consume `requirements`, `business-overview`, `component-inventory`, and `team-practices`. They represent users and consumers of the Shared Platform foundation, not downstream Charge, Booking, or Container Movement module users.

## Persona Ranking

| Rank | Persona | Priority | Why this matters |
| --- | --- | --- | --- |
| 1 | Reference Data Administrator | Primary | Needs the UI/API to stop being view-only and operate real reference records. |
| 2 | Platform Operator | Primary | Needs local stack, health, smoke, and quality evidence. |
| 3 | Security / IT Administrator | Primary | Needs Keycloak, authorization, audit, and bypass safeguards. |
| 4 | Downstream Module Developer | Secondary | Needs contracts, events, seeds, and stable service behavior for later modules. |
| 5 | Implementation Developer | Secondary | Needs clear prerequisites, build paths, and tests to complete the platform. |

## Reference Data Administrator

Role: Internal operator who manages canonical reference sets.

Goals:

- Create, update, deactivate, search, and inspect reference records.
- See history, correlation id, and publication status for each change.
- Understand why an action is unavailable when permissions are missing.

Pain points:

- Current workbench is mostly read-only.
- Static local data can make records appear valid without backend persistence.
- Event publication status is not yet tied to real outbox/Kafka behavior.

Context:

- Desktop-first operations workflow.
- Needs keyboard-accessible forms and explicit validation errors.

## Platform Operator

Role: Maintains local and staging Shared Platform runtime.

Goals:

- Verify prerequisites, Compose services, health checks, smoke tests, and quality gates.
- Identify whether a failure is environmental or code-related.
- Start and stop local services predictably.

Pain points:

- Java, Maven, and Docker are current local blockers.
- Compose app images are referenced but not buildable from discovered Dockerfiles.

Context:

- Uses CLI/runbook first; may also consume a readiness UI surface.

## Security / IT Administrator

Role: Owns local identity, authorization, and audit posture.

Goals:

- Bootstrap Keycloak realm, clients, users, and roles.
- Validate `identity-service` authorization decisions.
- Ensure local auth bypass cannot leak into non-local profiles.

Pain points:

- Auth currently has local-session placeholder behavior.
- Static permission state can hide authorization gaps.

Context:

- Requires correlation ids, denial reasons, and auditable role decisions.

## Downstream Module Developer

Role: Future builder of Charge, Booking, or Container Movement modules.

Goals:

- Consume stable OpenAPI, Avro, Pact/message fixtures, and seed data.
- Trust reference-data service behavior and publication status.
- Avoid copying PII-bearing reference data into downstream stores.

Pain points:

- Contracts can drift if not verified against running services.
- Static BFF data gives false confidence.

Context:

- Does not implement downstream modules in this intent.

## Implementation Developer

Role: Developer completing the Shared Platform code.

Goals:

- Follow U01-U12 without scope creep.
- Run focused tests and quality gates.
- Preserve hexagonal backend boundaries and BFF-only browser traffic.

Pain points:

- Graph/index may be stale.
- Toolchain and Docker availability can block live proof.

Context:

- Works inside AI-DLC gates and team practices.
