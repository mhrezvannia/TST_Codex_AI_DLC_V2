# Infrastructure Services - U03 Authorized Degraded Journey Access

## Inputs and Ownership

This design implements U03 `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

CMM owns authorized use cases, repositories, DTOs, and pages; Identity owns
authorization decisions; Reference Data owns active route/equipment/location
facts; Booking remains an independent projection consumer. Indexes cover stable
journey/booking lookup and bounded pagination. Timeouts and safe typed outcomes
are adapter-owned. No authority cache, new database, or synchronous Booking/CMM
query is introduced.

All list, detail, booking-reference, and capture routes share one safe response
union: ready data with correlation/freshness, denied 403 with no protected data,
Identity 503, Reference Data capture 503, and resource 404 only after read
ALLOW. The last-known DTO maps `dataUpdatedAt` only from persisted
`ContainerJourney.updatedAt`; `checkedAt` is the current dependency check and
is never presented as a verification cache timestamp. Tokens, provider URLs,
raw payloads, and stack traces are excluded.
