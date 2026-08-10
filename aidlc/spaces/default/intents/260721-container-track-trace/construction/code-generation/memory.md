# Code Generation Memory

## Interpretations

- 2026-07-22T10:20:00Z - Existing CMM/Booking walking-skeleton seams were extended in place; no new service or shared UI shell was introduced.
- 2026-07-26T09:26:00Z - Read freshness and capture capability belong to the application boundary; the controller now serializes one ordered post-read decision instead of deriving age or re-authorizing each row.
- 2026-07-26T09:52:00Z - Capability denial and capability-provider outage are different operator states; the authorization port now exposes a typed decision while retaining its functional boolean method for existing adapters.
- 2026-07-26T10:36:00Z - Accepted CMM movement state is a four-step canonical sequence (GTOT, LOAD, DISC, GTIN); lifecycle, status-event sequence/classifier/move code, and laden/empty projection are derived from that accepted state.
- 2026-07-26T10:36:00Z - Capture time validity is evaluated against the injected application Clock with zero future skew. Replayed request keys and replayed occurrences are conflicts, not successful idempotent reads.
- 2026-07-26T10:50:00Z - Planned and actual movement concepts use distinct shapes: expected rows carry typed classifier and move code (`PLN` plus `LOAD|DISC`), while accepted actual capture retains the existing event vocabulary.
- 2026-07-26T10:50:00Z - Movement-conflict lifecycle evidence is a first-class tagged HTTP 409 contract (`currentLifecycle`, `requiredNextMove`), not a convention encoded in generic error-field strings.
- 2026-07-26T11:00:00Z - Persisted expected-movement compatibility is owned by the JDBC Jackson boundary: supported legacy planned aliases are upcast into the canonical typed model, while all current writes remain canonical.

## Deviations

- 2026-07-22T10:20:00Z - Maven and broad JavaScript validation were bounded by local dependency/reactor limitations; no live Compose evidence was attempted in this stage.
- 2026-07-26T09:26:00Z - The named code-generation subagent retry produced no patch, so the user selected the protocol's Run inline recovery path and the conductor implemented the focused U03 revision directly.
- 2026-07-26T10:36:00Z - Revision 3 uses the existing audit repository as the durable rejection seam with an independent JDBC transaction; it does not claim the richer immutable attempt/request-disposition ledger from the design.

## Tradeoffs

- 2026-07-22T10:20:00Z - Final remediation prioritized contract-visible lifecycle, conflict, authorization, freshness, and UI evidence while preserving the existing brownfield topology.
- 2026-07-26T09:26:00Z - Reference availability was added as a backward-compatible port default so existing adapters continue to compile; real adapter outage detection remains explicit follow-on wiring rather than an invented cache/provider.
- 2026-07-26T10:36:00Z - Legacy movement status enum values remain readable for persisted snapshot compatibility, while all newly created and captured journeys emit only the canonical lifecycle.
- 2026-07-26T11:00:00Z - The snapshot upcaster accepts only the two known planned aliases and rejects partial, unsupported, or conflicting representations; domain and API types are not weakened with legacy fields.

## Open questions

- 2026-07-22T10:20:00Z - Live broker-to-database-to-Booking and Playwright evidence remain for Build and Test/isolated acceptance after integration synchronization.
- 2026-07-26T10:36:00Z - A full immutable capture attempt/request/rejection ledger requires an approved application port and database migration; outbox equality fencing and Booking receipt behavior still require Build and Test/live integration evidence.
