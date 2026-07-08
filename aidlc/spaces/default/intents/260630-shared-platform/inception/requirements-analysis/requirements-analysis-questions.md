# Requirements Analysis Questions - Shared Platform

> Stage: Requirements Analysis
> Intent record: `260630-shared-platform`
> Source context: `intent-statement.md`, `scope-document.md`, `team-practices.md`, Enterprise Technical Environment v1.1, Shared Platform Module Vision/Tech Env.

## Q1. Reference freshness SLA

What initial freshness target should requirements use for reference-change propagation to consumers?

A. 60 seconds p95 from committed reference change to consumer-observable event, to be validated in NFR stages (recommended)
B. 5 minutes p95 from committed change to consumer-observable event
C. Leave freshness SLA as TBD until NFR Requirements
X. Other (please specify)

[Answer]: A. 60s p95 (Recommended)

## Q2. Trade/regulatory footprint handling

How should requirements handle the unresolved MVP trade/regulatory footprint?

A. Support configurable regions/trade lanes and mark exact MVP lane/site residency as an open requirement dependency (recommended)
B. Pick a default non-US trade lane now
C. Block requirements until the exact trade lane and sites are decided
X. Other (please specify)

[Answer]: A. Configurable + dependency (Recommended)

## Q3. Role model scope

What role model should `identity-service` requirements include for MVP?

A. Carrier roles from the module vision: pricing, sales, booking desk, equipment control, customer service, finance-read, reference admin, platform operator, security admin (recommended)
B. Only reference admin and platform operator
C. Only generic admin/user roles
X. Other (please specify)

[Answer]: A. Full carrier roles (Recommended)

## Q4. Reference admin operations

Which admin operations should be Must Have for all nine reference sets?

A. Create, read, update, deactivate/reactivate, search/filter, validation, audit trail, and change publication (recommended)
B. Read and create only
C. Read-only APIs first; admin maintenance later
X. Other (please specify)

[Answer]: A. Full admin lifecycle (Recommended)

## Q5. Event contract scope

Which event scope should requirements include?

A. Nine `referencedata.<entity>.changed` Avro event types, common envelope, outbox, schema compatibility, idempotent consumers (recommended)
B. One generic `referencedata.changed` event for all sets
C. Defer events until downstream modules exist
X. Other (please specify)

[Answer]: A. Nine typed events (Recommended)

## Q6. apps/auth scope

What should `apps/auth` include in MVP requirements?

A. Sign-in, callback, sign-out, access-denied, session display, request-access path; no customer-facing identity (recommended)
B. Include permission-review/admin screens in `apps/auth`
C. Defer `apps/auth` and rely on Keycloak screens only
X. Other (please specify)

[Answer]: A. Sign-in basics (Recommended)

## Q7. PII and audit controls

What should be the baseline for Party/Customer PII and identity authorization changes?

A. Confidential/Restricted classification, least privilege, access logging, immutable audit trail for admin changes, encryption in transit/at rest (recommended)
B. Standard internal classification only
C. Defer PII/audit controls to security design
X. Other (please specify)

[Answer]: A. Restricted + audited (Recommended)

## Q8. API performance target

What initial performance target should requirements use for internal reference read APIs?

A. p95 <= 300 ms for common list/detail reads under expected MVP admin/consumer load, validated later (recommended)
B. p95 <= 1000 ms for all reads
C. Leave response time TBD until performance validation
X. Other (please specify)

[Answer]: A. p95 <= 300 ms (Recommended)