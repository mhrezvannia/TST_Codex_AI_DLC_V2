# W3-04 Booking Request Completeness — External Dependency Map

## Source Alignment

This map is based on `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`, with owner topology from Team Formation. It records dependency gates without assuming availability, dates, lead times or acceptable substitutes.

## Readiness Convention

- `READY` requires a named accountable owner, backup, accepted contract/version, required data/environment window and evidence plan.
- `TBD` is not ready. The dependent Bolt is **BLOCKED before commitment** until the listed confirmation is recorded.
- No workaround may copy provider masters, guess schedule/price facts, create a local shared primitive, use fake production adapters, silently dual-publish, weaken authorization or reuse stale evidence.
- Lead time remains `TBD` until the owner supplies it; no calendar promise is inferred.

## B01 Readiness Attestation

On 2026-08-10, the user explicitly answered `confirm` to the B01 readiness request covering ED-01, ED-02, and ED-09 through ED-12. This is the authoritative entry attestation for beginning U01 Functional Design and records that the role owners, backups, required capacity/windows, accepted voyage seam, policy identities, isolated Compose slot, browser/accessibility evidence window, and audit prerequisites are available for B01.

No personal names, credentials, environment addresses, or calendar details were supplied in the answer, so none are invented here. The accountable roles in the dependency table remain the recorded owner identities; sensitive operational details may remain in their controlled runbooks. Readiness must be refreshed before live acceptance, and any failed prerequisite returns B01 to `BLOCKED` rather than permitting a substitute.

## Gated Dependencies

| ID | Dependency / deliverable | Accountable owner | Blocks | Current readiness | Lead time | Readiness evidence | Mitigation if unavailable |
|---|---|---|---|---|---|---|---|
| ED-01 | Named Core Booking cell, backups, capacity and async/synchronous review windows | Delivery facilitator + Booking owner | B01–B08 | TBD | TBD | Roster, backup, capacity/overlap and decision-right record | Do not commit Bolt; replan capacity or return to user gate |
| ED-02 | Confirmation-grade voyage/reference OHS: route compatibility, carrier number, ETD/ETA, cutoff/deadline, version/source and degradation semantics | Shared Platform | B01, B02, B05 | Contract designed; named owner/window TBD | TBD | Owner acceptance, OpenAPI/fixtures, current test data and provider availability window | Dependent Bolt BLOCKED; no guessed/cached master authority |
| ED-03 | Role-aware party, commodity, package, location and equipment option/validation contracts | Shared Platform/Reference Data | B03, B05 | Contract designed; named owner/window TBD | TBD | Owner acceptance, role/status/version fixtures and live provider proof window | Dependent Bolt BLOCKED; no free-text/static master substitute |
| ED-04 | Released compatible W2-02 `TextArea`/counter and LinerCore review window | W2-02/LinerCore owner | B03, B08 | Unconfirmed | TBD | Released `@erp/ui` export, contract compatibility and design/a11y owner approval | B03/B08 BLOCKED; never create a Booking-local primitive or edit `packages/ui` |
| ED-05 | Representative sanitized v0/v1/current Booking corpus plus restart/backfill database window | Booking data owner + operations | B04 | Unconfirmed | TBD | Corpus provenance, backup/restore plan, migration owner/backup and isolated DB slot | B04 BLOCKED; no synthetic corpus-only PASS or destructive migration |
| ED-06 | Exact Booking–Charge contract, full outcome fixtures and real provider verification window | Charge owner | B06 | Designed; owner/window TBD | TBD | Bilateral mapping acceptance, Pact/provider fixtures, correlation/idempotency cases and live slot | B06 BLOCKED; no fallback pricing, guessed total or stub-only acceptance |
| ED-07 | Canonical `booking.confirmed` topic/schema readiness and complete producer/consumer inventory | Booking integration + Kafka/Schema Registry operations | B07 | Designed; inventory/window TBD | TBD | Checked-in Avro compatibility result, topic/subject configuration, inventory and rollback/activation record | B07 BLOCKED; no silent dual publication or unreviewed schema alias |
| ED-08 | Dedicated CMM pending-assignment consumer/persistence and exact booking-journey OHS readiness | CMM owner | B07, B08 | Designed; named owner/window TBD | TBD | Consumer/OHS owner acceptance, quantity/null-ID/replay/read-state fixtures and live consumer slot | B07/B08 BLOCKED; never route canonical event to journey creation or infer acceptance |
| ED-09 | Identity/policy test identities for read/create/correct/validate/price/confirm combinations | Identity/security owner | B01, B04–B08 | Existing mechanism; test identities/window TBD | TBD | Named test identities/roles, privacy-safe denial matrix and session/origin cases | Affected security evidence BLOCKED; do not bundle/infer permissions |
| ED-10 | Isolated Compose, PostgreSQL, Kafka/Schema Registry, provider endpoints, observability and protected demo window | Operations/platform | Every Bolt; full path B08 | Existing topology; slot/owner TBD | TBD | Health checks, isolated data namespace, restart/log/trace access and protected window | Bolt live DoD BLOCKED; mocks/local-only checks cannot substitute |
| ED-11 | Browser/accessibility tooling and required 375/390/768/1024/1440, 200% zoom, keyboard, reduced-motion, light/dark evidence window | Quality + LinerCore/UX | UI-bearing B01–B08; closure B08 | Tooling known; owner/window TBD | TBD | Named reviewer, browser matrix and fresh evidence manifest | UI Bolt completion BLOCKED; design artifact is not runtime evidence |
| ED-12 | `aidlc-audit` and `erp-fidelity-audit` executable prerequisites | Quality/operations | Every unit exit; final B08 | Required; owner/window TBD | TBD | Tool availability, isolated run inputs and green fresh outputs | Intent/Bolt remains BLOCKED; never reuse another intent’s PASS |

## Dependency-to-Bolt View

| Bolt | Required dependency gates before commitment |
|---|---|
| B01 | ED-01, ED-02, ED-09, ED-10, ED-11, ED-12 |
| B02 | ED-01, ED-02, ED-10, ED-11, ED-12 |
| B03 | ED-01, ED-03, ED-04, ED-10, ED-11, ED-12 |
| B04 | ED-01, ED-05, ED-09, ED-10, ED-11, ED-12 |
| B05 | ED-01, ED-02, ED-03, ED-09, ED-10, ED-11, ED-12 |
| B06 | ED-01, ED-06, ED-09, ED-10, ED-11, ED-12 |
| B07 | ED-01, ED-07, ED-08, ED-09, ED-10, ED-11, ED-12 |
| B08 | ED-01, ED-04, ED-08–ED-12 and refreshed availability of any seam exercised by the integrated path |

## Hand-Off and Escalation Protocol

1. The Delivery facilitator requests readiness evidence asynchronously before the Bolt entry gate; “no known blocker” is not confirmation.
2. The accountable owner records contract/version, named participants/backups, lead time/window and evidence path.
3. Booking and quality validate the evidence against the Bolt DoD. Contract disagreement goes to the focused seam mob.
4. If a dependency is unavailable, the Bolt remains BLOCKED. A proposed scope, unit, sequence or contract change returns to the appropriate user/AI-DLC gate.
5. Readiness is refreshed at the consuming Bolt; an earlier review is not assumed current indefinitely.

## External Partner Decision

No verified capability gap currently requires a vendor, contractor, cloud provider or AWS Professional Services. If named internal capacity cannot be secured and enabling support cannot close the gap, Team/Delivery Planning must return to a user gate with evidence before introducing any external partner.
