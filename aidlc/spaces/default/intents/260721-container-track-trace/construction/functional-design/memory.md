# Functional Design Memory

## Interpretations

- 2026-07-21T19:57:29Z - U01 is the concrete PB-01 unit selected by the compiled DAG; design only the migration, booking intake, one-leg plan, first GTOT/status/Booking projection, protected read UI, and one out-of-sequence path exercised by its live DoD.
- 2026-07-21T21:14:35Z - U02 completes lifecycle and conflict/recovery depth on the U01 spine; manual 409 rejections and Booking transport dispositions remain separate models even when both rely on idempotency evidence.

## Deviations

- 2026-07-21T19:57:29Z - Do not design later LOAD/DISC/GTIN depth, full duplicate matrix, or outage-state behavior in U01; those belong to U02/U03 even where shared types are introduced additively.

## Tradeoffs

- 2026-07-21T19:57:29Z - Introduce the complete additive schema shape needed for safe evolution in the sole U01 migration chain, but exercise only PB-01 rows and invariants; later units consume the schema without co-owning migration files.
- 2026-07-21T20:16:46Z - Treat U01 as owning the vertical migration outcome while retaining separate CMM and Booking Flyway chains; cross-database SQL would violate bounded ownership even though both upgrades ship in one Bolt.

## Open questions

- 2026-07-21T19:57:29Z - Confirm U01 workflow, reconciliation identity, migration repair, transaction boundaries, error mapping, Booking ordering, and frontend component/state decisions.
- 2026-07-21T19:57:29Z - Recommended answers resolve all seven decisions; ambiguity analysis found no vague outcome, contract mismatch, missing authority, or cross-unit scope leak.
- 2026-07-21T20:16:46Z - Review iteration 1 findings were remediated across all four artifacts; exact wire fields, revision identity, replay recovery, capture atomicity, migration ownership, read authorization, and REST routes are now explicit. Awaiting iteration-2 verdict.
- 2026-07-21T20:22:18Z - Reviewer iteration 2 exhausted the limit with five concrete gaps. Builder remediation fixed sequence types, stable identity, one crash-safe intake transaction, booking-reference link resolution, and exact occurrence-time validation; final independent verdict remains NOT-READY because no third review is permitted.
- 2026-07-21T21:14:35Z - U02 recommended answers were unambiguous and all four Functional Design artifacts were generated for independent review.
- 2026-07-21T21:25:24Z - U02 review iteration 1 NOT-READY findings were remediated across all four artifacts: exact claim/write sets, pre-claim validation evidence, relay fencing, U01 contract evolution, Booking receipt ordering, typed timeline ownership, and reason-specific asynchronous UI recovery are now aligned for iteration 2.
- 2026-07-21T21:42:00Z - U02 review iteration 2 exhausted the limit with six remaining gaps. Builder remediation separated invalid/inactive references from Reference Data outage, completed lease fencing, removed unsupported DUPLICATE_SEQUENCE, unified the response union, added source/transshipment fidelity, and defined Booking-owned receipt/health UI provenance. The final independent verdict remains NOT-READY and is not converted into PASS.
- 2026-07-21T21:43:51Z - U03 confirmed fresh application authorization on every request, Identity-down fail-closed behavior without cached authority, authorized last-known reads with Reference Data-down capture disabled, and inline Container Movement-owned recovery states; all four answers were unambiguous.
- 2026-07-21T21:56:00Z - U03 review iteration 1 NOT-READY findings were remediated: server GET capability is a non-authoritative hint, authentication/read authorization/repository/404 ordering is exact, GET/403/503 response shapes are unified, and real-denial versus outage database/log write sets plus live assertions are explicit for iteration 2.
- 2026-07-21T22:06:00Z - U03 review iteration 2 exhausted the limit with three contradictions. Builder remediation uses two ordered calls to the existing singular AuthorizationPort, replaces invented lastVerifiedAt with truthful existing ContainerJourney.updatedAt labelled dataUpdatedAt, and adds Identity-unavailable to direct-capture UI recovery. The final independent verdict remains NOT-READY and is not converted into PASS.
