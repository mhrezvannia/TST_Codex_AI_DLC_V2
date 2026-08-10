# Escalation Matrix - W1-01

## Roles

| Area | Primary owner | Secondary | Escalate when |
|---|---|---|---|
| Release harness and evidence | Release runner | Pipeline/deploy owner | Manifest, attestation, detector, or run ID behavior blocks PASS. |
| Docker and local Compose | Release runner | Platform owner | Required image pull, port, storage, or profile issue blocks compose start. |
| Booking UI and nginx path | Booking app owner | Booking service owner | nginx `/bookings` path fails or browser smoke fails. |
| Booking service and outbox | Booking service owner | Kafka/platform owner | Booking confirmation, outbox, producer, or projection issue appears. |
| CMM service and returned status | CMM service owner | Booking service owner | CMM listener, outbox, returned-status topic, or Booking projection fails. |
| Charge pricing | Charge service owner | Reference Data owner | Pricing endpoint errors, latency breach, or dependency failure appears. |
| Kafka and Schema Registry | Platform owner | Service owner for failing subject | Schema compatibility, producer/consumer, DLT, or subject fingerprint issue appears. |
| Security and evidence integrity | Security reviewer | Release runner | Redaction, key, attestation, or detector integrity issue appears. |

## Severity Escalation

| Severity | First response | Escalation | Communication |
|---|---|---|---|
| P1 | Release runner plus primary service owner immediately | Add platform/security owner if unresolved after 30 minutes or if evidence trust is affected | Record status, impact, evidence path, and next action in operation artifacts. |
| P2 | Primary owner during active work session | Add secondary owner if unresolved after the current remediation attempt | Record blocker and rerun condition before approval. |
| P3 | Owning engineer | Team lead if it blocks planned follow-up work | Track in operation feedback. |

## Decision Authority

Only a PASS manifest from the full live acceptance harness can close W1 release proof. No owner may override `reliability-design.md` fail-fast behavior, `security-design.md` evidence controls, or the nginx user-path requirement from `deployment-architecture.md`.

## Source Coverage

This matrix maps the `alarms.md` severities to owners, uses `dashboards.md` for where responders look first, preserves the `reliability-design.md` no-overwrite rerun rule, applies `security-design.md` evidence integrity ownership, and follows the local service layout from `deployment-architecture.md`.
