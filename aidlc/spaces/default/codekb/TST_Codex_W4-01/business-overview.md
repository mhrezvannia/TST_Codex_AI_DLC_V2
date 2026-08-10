# Business Overview — TST_Codex_W4-01

## Business purpose

LinerCore is an internal carrier operations platform that supports the commercial-to-operational shipment lifecycle. The repository implements five bounded business capabilities: identity and authorization, enterprise reference data, customer charge agreements and pricing, customer booking, and container movement tracking. The current W4-01 context focuses on making Reference Data, Charge Agreements, and Container Journeys usable through stable list/detail experiences in the one authenticated LinerCore shell.

Verified evidence: the code scan found five Java services, five frontend applications, shared frontend packages, service-owned PostgreSQL databases, REST interfaces, and Kafka/Avro integration contracts. The code graph contains 112,113 nodes, 134,886 edges, and 142 indexed routes. This is static repository evidence, not proof that the complete stack is currently running.

## Business capabilities

| Capability | Business responsibility | Current implemented surface |
|---|---|---|
| Identity | Authenticate users and authorize actions | Auth gateway/BFF flows plus identity authorization APIs |
| Reference Data | Govern reusable operational codes and records | Reference sets, records, validation, lifecycle, history, and event publication |
| Charge Agreements | Maintain customer commercial terms and calculate attributable pricing | Agreements, versions, rates, lifecycle actions, manual-pricing cases, and pricing requests |
| Booking | Capture, validate, price, confirm, amend, and reconfirm bookings | List/create/detail, pricing snapshot, reference options, and movement-status projection |
| Container Movement | Build and update the shipment journey after booking confirmation | Journey list/detail/lookup, movement capture, and status publication |

The business flow is intentionally split by ownership: Reference Data supplies stable identifiers; Charge Agreements owns pricing authority; Booking owns booking state and stored pricing snapshots; Container Movement owns journey state; Identity owns authorization decisions. Cross-service database reads are not part of the observed design.

## User-facing product state

- `apps/shell` is the canonical authenticated shell but its proven route composition is Booking-centric (`/booking`, `/booking/new`, `/booking/[bookingId]`).
- `apps/reference-data` provides a current workbench and BFF. The scan did not find indexed shareable list/detail page routes.
- `apps/charge-agreements` has list/detail/edit/new and rate/manual-pricing workbench routes, but remains a standalone application with overlapping detail-route shapes.
- No `apps/container-movement` frontend exists. Container Movement backend APIs and Booking journey projection are present.
- All frontend applications consume `@erp/ui`, preserving the shared design-system ownership boundary.

Inference: the principal W4-01 business gap is not missing domain capability; it is incomplete, consistent operational navigation and presentation of existing Reference, Charge, and Container Movement capabilities inside the shared authenticated product shell.

## Evidence boundaries and limitations

Verified claims come from the developer scan, the checked-in Graphify graph, and the codebase-memory index. Inferences are explicitly labeled. No Compose stack, browser journey, audit, test suite, or coverage tool was executed for this synthesis. Exact Nginx routing, hidden CI configuration, production topology, and deployment readiness remain unverified. Absence findings are bounded to indexed source and manifest discovery, and index freshness was not independently proven.
