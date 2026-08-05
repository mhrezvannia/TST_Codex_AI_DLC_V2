# Logical Components - U01 PB-01 Journey-to-Booking Walking Skeleton

## Inputs and Component Inventory

This inventory bridges `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md` into infrastructure design.

| Component | Ownership | Failure domain | Contract |
|---|---|---|---|
| Booking confirmed adapter | CMM | Kafka intake boundary | Schema/assignment validation and idempotent receipt |
| CMM application/domain | CMM | CMM service + database | Journey, expected/actual ledger, lifecycle, audit |
| CMM outbox/relay | CMM | Relay worker/Kafka producer | Fenced committed status publication |
| Kafka status topic | Platform | Broker transport | Avro `containermovement.status` with sequence |
| Booking consumer/projection | Booking | Booking service + database | Durable receipt and latest projection |
| Identity/Reference Data adapters | Shared dependency | External dependency | Fresh auth and typed validation/timeout outcomes |
| CMM REST/read model | CMM | API/read database | Authorized list/detail/booking resolver |
| Container Movement UI | CMM-owned page | Browser/edge | Timeline, capture, rejection and propagation evidence |

No component adds EDI, public DCSA API, fleet/depot/M&R, shared-shell, or
`packages/ui` ownership. Port 8088 manager demo remains outside the isolated
acceptance blast radius.

