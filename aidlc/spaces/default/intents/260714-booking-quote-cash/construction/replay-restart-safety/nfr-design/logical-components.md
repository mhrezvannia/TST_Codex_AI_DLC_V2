# Logical Components - U06 Replay and Restart Safety

## Inventory

| Component | Role | Isolation |
|---|---|---|
| Test fault collaborators | transaction crash points | test classpath only |
| Compose restart controller | process/dependency faults | local operator shell |
| Duplicate/out-of-order drivers | Kafka delivery matrix | test/evidence tooling |
| Protected replay control | authorized DLT recovery | separate token/role |
| Flyway/backup verifier | upgrade/restore checks | disposable copy for repair |
| State evidence collector | DB/topic/UI business assertions | read-only credentials |
| Existing service authorities | durable effects/recovery | service-owned DBs |

## Source Coverage

Inventory bridges `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U06 `business-logic-model.md`.
