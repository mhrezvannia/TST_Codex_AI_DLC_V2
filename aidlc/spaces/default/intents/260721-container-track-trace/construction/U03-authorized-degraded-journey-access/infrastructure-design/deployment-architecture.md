# Deployment Architecture - U03 Authorized Degraded Journey Access

## Inputs and Topology

This architecture implements U03 `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
application `components.md`/`services.md`, and `business-logic-model.md`.
It retains portable Compose with CMM, Booking, Kafka, Schema Registry,
service-owned PostgreSQL stores, Identity, Reference Data, shared edge, and the
CMM app. No identity/cache platform or cloud resource is added.

## Isolation and Protection

Wave A acceptance is controlled by `scripts/wave-a-compose.mjs` with one live
`linercore-wave-a` stack. `npm run demo:guard` protects port 8088 before/after.
Additive migrations, volumes, W1 BLOCKED waiver, and shared-shell ownership are
preserved; no cache, authority replay, EDI/public API, fleet/depot/M&R, or merged
store is introduced.

## Review Iteration 1

**Verdict: NOT-READY**

The topology is portable and ownership boundaries are correctly scoped to CMM,
Identity, Reference Data, Booking, Kafka/Schema Registry, and service-owned
PostgreSQL stores. Compose isolation, port-8088 demo protection, additive
migrations, W2-02 synchronization, single live acceptance stack, explicit W1
BLOCKED waiver, and excluded-scope boundaries are stated. The following
implementation evidence is still required:

1. Make the exact ten-request authorization matrix executable in CI/CD and
   isolated Compose acceptance, including ordered Identity/Reference Data
   outcomes and proof that protected repositories are untouched before ALLOW.
2. Specify and test one safe DTO/error union for list, detail,
   booking-reference, and direct-capture paths, with redaction of tokens,
   provider URLs, raw payloads, and stack traces. Last-known responses must use
   a truthful persisted timestamp without inventing a cache or migration.
3. Prove write sets: a real DENY produces exactly one denial audit and zero
   business rows; Identity/Reference Data outages produce zero CMM rows and
   only correlated safe logs/metrics. Assert attempt, request, rejection,
   movement/history, lifecycle/version, outbox, and Booking counts before and
   after each case.
4. Show the isolated stack cannot reset shared volumes or manager services;
   include pre/post `npm run demo:guard` evidence and the W2-02 integration-sync
   gate before final visual acceptance.

These are contract/evidence clarifications only; no new platform, store,
shared-shell, EDI/public API, fleet/depot, or M&R scope is authorized.

## Review Iteration 2

**Verdict: READY**

Remediation closes the iteration-one findings. The exact ten-request matrix is
executable with ordered singular `AuthorizationPort.evaluate` calls,
repository-before-ALLOW probes, and safe response snapshots. DTO/error unions
are consistent across read and capture paths, redact sensitive fields, and use
the existing persisted `ContainerJourney.updatedAt` as truthful `dataUpdatedAt`.
Write-set assertions distinguish one-denial-audit/zero-business-row DENY from
zero-CMM-row dependency outages with safe correlated telemetry. Compose remains
volume-preserving and isolated, protects manager port 8088 with pre/post demo
guards, and gates visual acceptance on W2-02 synchronization. W1 remains
explicitly BLOCKED/waived and no excluded scope is introduced.

## Builder Remediation after Review Iteration 1

CI and isolated Compose execute the exact ten-request matrix from
`scalability-requirements.md` with ordered Identity/read/capture and Reference
Data outcomes, repository-before-ALLOW probes, safe DTO/error-union snapshots,
truthful `ContainerJourney.updatedAt` `dataUpdatedAt`, and redaction checks.
Each case snapshots CMM attempt/request/rejection/movement/history/version/
lifecycle/outbox and Booking counts: real DENY is one denial audit plus zero
business rows; Identity/Reference Data outages are zero CMM rows plus only safe
logs/metrics. `scripts/wave-a-compose.mjs` is volume-preserving and cannot
control the manager demo; pre/post `npm run demo:guard` and W2-02 integration
sync are required before final visual acceptance.
