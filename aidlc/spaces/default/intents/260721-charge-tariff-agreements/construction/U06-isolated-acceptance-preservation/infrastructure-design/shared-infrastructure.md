# Shared Infrastructure — U06 Isolated Acceptance and Preservation

## Inputs and ownership registry

This artifact consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

| Shared resource | Owner | U06 access |
| --- | --- | --- |
| Charge V1 baseline, V2 Rate, V3 Agreement, V4 pricing Flyway files/catalog/checksum repair | U01/Charge physical schema owner | migrate, hash, restore copy; route any catalog defect to U01 |
| U02 BFF/assertion/security gates | U02 | execute contract/security evidence |
| V3 Agreement/version/link/activity/outbox behavior and probes | U03/Charge behavior owner | execute lifecycle/replay evidence; no migration-file repair |
| V4 pricing receipt/manual-case behavior and probes | U04/Charge behavior owner | execute terminal/manual evidence; no migration-file repair |
| Booking V3/recovery artifact | U05/Booking | consume and integrate |
| shell/UI/nginx | W2-02/platform | observe only through signed edge |
| Wave A wrapper/evidence/registry | U06 | sole acceptance mutation/record owner |
| manager project/8088 | protected external | read-only guard/inventory |

## Network and data isolation

All mutable lifecycle commands use the wrapper and exact Wave A identities.
Charge/Booking/Identity/Reference databases and roles remain separate.
Owner-local bounded queries are stored as redacted assertions; no cross-DB join
or whole-table export is evidence. Browser traffic never uses service ports.

## Filesystem and evidence isolation

Run roots are collision-free and immutable. Registry-generated paths, opened-
handle identity checks, same-volume atomic commits, framed ledger recovery,
versioned manifest publication, and entry-level trace sanitation protect shared
workspace and credentials. Prior-wave evidence is hashed read-only input.

## Capacity and concurrency

Commercial concurrency is exactly 10. Serial mutation/restore/guard/audit gates
cannot overlap. Only declared isolated browser/read cells use a bounded pool
with unique session/fixture namespaces. The driver adds no application resource
limit or production capacity claim.

## Preservation and recovery

Exactly W0-01, W0-02, W1-01, W2-01, and W2-02 are preserved as separate
records; W1 waiver bytes/status are never rewritten. Restore targets are new,
run-owned, source-OID-distinct databases. Cleanup can affect only exact
wrapper-owned targets after revalidation. Manager drift or failed cleanup is
BLOCKED and never auto-repaired.
