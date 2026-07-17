# Requirements Analysis Questions - W1-01

## Q1 - Event Contract Authority

The checked-in `contracts/avro` files are flat, while the enterprise event contract appendices define canonical `routing[]`, `equipment[]`, and DCSA movement fields. Which source should W1 make executable?

A. Replace the flat Avro/AsyncAPI/examples/service resources with the enterprise appendix schemas and use those exact names everywhere (recommended)
B. Keep the checked-in flat Avro schemas and defer canonical alignment
C. Add a parallel v2 event family while retaining the flat v1 events
X. Other (please specify)

`[Answer]:` A - Replace the flat artifacts with the enterprise appendix schemas and use those exact names everywhere.

## Q2 - Pricing Endpoint Authority

The catalog OpenAPI declares `POST /api/pricing/quote`, while the bilateral enterprise contract declares versioned `POST /pricing-requests`. Which endpoint is binding for W1?

A. Align OpenAPI, provider, and Booking consumer to `POST /pricing-requests` with `application/vnd.api.v1+json` (recommended)
B. Keep `POST /api/pricing/quote` and update the bilateral prose
C. Support both paths temporarily with one implementation
X. Other (please specify)

`[Answer]:` A - Align OpenAPI, Charge, and Booking to `POST /pricing-requests` with `application/vnd.api.v1+json`.

## Q3 - Initial Equipment Identity

The approved thin form says no container number at initial confirmation, but `containermovement.status` requires ISO 6346 `containerRef`. How should the live W1 round trip obtain it?

A. Include one valid ISO 6346 equipment ID in the W1 live-proof fixture/form and emit it in the initial confirmation (recommended for a contract-valid round trip)
B. Open an unassigned CMM journey at confirmation and require a separate assignment step before any status event
C. Make `containerRef` nullable for journey-open status
X. Other (please specify)

`[Answer]:` A - Include one valid ISO 6346 equipment ID in the W1 live-proof fixture/form and initial confirmation.

## Q4 - W1 Latency Gates

Which measurable latency targets should block W1 on the local Compose stack?

A. Pricing p99 <= 800 ms and confirm-to-visible-status p95 <= 5 s after warm-up (recommended)
B. Measure and record both distributions without a blocking threshold in W1
C. Pricing p99 <= 2 s and confirm-to-visible-status p95 <= 15 s
X. Other (please specify)

`[Answer]:` A - Require pricing p99 <= 800 ms and confirm-to-visible-status p95 <= 5 s after warm-up.

## Q5 - Service Authentication Boundary

W2-01 owns app shell/auth, while the pricing contract requires service identity. What must W1 implement?

A. Keep a local-profile-only service identity/bypass for Compose, fail closed outside local, and defer full JWT/RS256 wiring to W2-01 (recommended)
B. Implement service-to-service JWT/RS256 and `pricing:invoke` in W1
C. Leave service authentication unchanged without a non-local guard
X. Other (please specify)

`[Answer]:` A - Keep local-profile-only service identity for Compose, fail closed outside local, and defer full JWT/RS256 wiring to W2-01.

## Upstream Sources

Questions derive from `intent-statement.md`, `scope-document.md`, `business-overview.md`, `architecture.md`, `code-structure.md`, and `team-practices.md`, plus the W1 enterprise contract documents.
