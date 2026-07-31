# Shared Infrastructure — U05 Booking Consumption and Repricing

## Inputs and ownership

This registry consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

| Resource | Owner | U05 use |
| --- | --- | --- |
| Booking image/database/receipts/snapshots | U05/Booking | mutate through Booking ports only |
| Charge pricing API/cases | U04 | synchronous contract only |
| Rate/Agreement authority | U01/U03 | consume only through Charge result |
| Wave A integration | U06 | later consume U05 recovery artifact and probes |
| Booking V3/recovery artifact | U05/Booking | own migration, backup/isolated restore, and manifest |
| nginx Booking route | platform/W2-02 | consume unchanged; no U05 edit |
| shell/`packages/ui` | W2-02 | consume unchanged |
| Identity/Reference | owning services | bounded auth/validation |

## Database and connection boundary

Booking and Charge retain separate databases/roles with no joins. Booking holds
one existing Hikari connection only during capture, completion, or bounded
read; it holds none during Charge I/O. Stable lock order and database CAS, not
JVM locks/affinity, coordinate instances.

## Network and secret boundary

Existing Compose DNS and ports are reused. Nginx remains the unchanged
platform/W2-02 human edge; manager 8088 is guarded. Human session, Booking service identity, Charge
credential, and database secrets remain distinct, job/runtime-scoped, and
absent from browser/evidence.

## Capacity and isolation

Booking retains 1 CPU/512 MiB/JVM 55%, RSS <=480 MiB, Hikari max 10, HTTP
connections/permits max 10, and request threads max 32; shared PostgreSQL and
sibling services are not resized. Large fixtures, pool/client permits, heap/RSS, cursor plans,
and sibling route/service regressions prove local coexistence. Process-local
circuit state never becomes shared authority; durable receipt state does.

## Change and recovery

Pricing-v1, Booking migration, shared UI, nginx, or Wave A changes require the
named owner and cross-unit evidence. Durable U05 state makes normal recovery
forward-only; reconciliation never overwrites immutable snapshots or completed
receipts. Production HA/retention/DR/paging remains future work.
