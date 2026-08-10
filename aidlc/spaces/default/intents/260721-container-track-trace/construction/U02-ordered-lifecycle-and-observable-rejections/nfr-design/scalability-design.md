# Scalability Design - U02 Ordered Lifecycle and Observable Rejections

## Inputs and Ordering Model

This design implements `scalability-requirements.md`,
`business-logic-model.md`, and `tech-stack-decisions.md`. CMM capture uses
stable journey identity plus row locks; Booking uses one receipt per unique
event ID and a deterministic ordering comparator.

## Ten-Delivery Projection

The acceptance fixture serializes delivery outcomes by durable receipt and
records partition/offset evidence. Redelivery returns DUPLICATE delivery/audit
evidence while the original receipt remains immutable; equal/lower unique
positive sequences are STALE; only the strongest positive updates the latest
projection. Invalid booking and unassigned equipment are REJECTED without
projection change. Booking never queries CMM synchronously.

The fixture identities are `E-{run}-L0A`, `P4`, redelivery of `P4`, `P4E`,
`P3`, `P2`, `P1`, `BADBOOK`, `UNASSIGNED`, and `L0B`, in that order, with
booking/equipment identities and legacy occurrence/classifier inputs defined in
the NFR requirements. It awaits durable outcomes rather than relying on arrival
timing and asserts nine unique receipts, APPLIED=2, STALE=5, REJECTED=2,
separate duplicate evidence, and an unchanged strongest projection hash.

## Growth Boundary

Kafka and service boundaries remain independently scalable in ordinary
deployment, but U02 adds no sharding, cache, read replica, sustained throughput,
or production partition-capacity target.
