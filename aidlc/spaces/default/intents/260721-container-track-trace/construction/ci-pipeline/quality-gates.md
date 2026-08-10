# W2-04 Quality Gates

## Upstream artifacts

The gate matrix traces the three unit `code-summary` artifacts through
`construction/build-and-test/build-and-test-summary.md` and
`construction/build-and-test/build-test-results.md`, then adds the revision 6
live-remediation evidence.

## Revision 8 gate matrix

`PASS` is used only for observed commands or live behavior. `PARTIAL` and
`BLOCKED` remain release-blocking under the selected full-gate posture.

| Gate | Revision 8 evidence | Status |
|---|---|---|
| Backend reactors | Container Movement and Booking reactors completed with all executed tests passing | PASS |
| Booking frontend | Vitest 23/23, build, lint, and typecheck completed | PASS |
| Contract regression | `verify-contract-providers.test.mjs` 9/9 | PASS |
| W2-04 acceptance driver | Executable lifecycle/projection/performance evidence driver and passing mock-provider regression | PASS |
| W2-04 CI static wiring | Workflow runs driver regression, contract checks, syntax checks, and dependency audit | PASS |
| W2-04 CI live orchestration | Confirmed fixture creation, isolated run, Playwright, evidence validation, and `always()` cleanup are not wired | BLOCKED |
| Live provider contracts | Secured Identity and Reference Data probes; 195/195 checks | PASS |
| Dependency versions | Next 15.5.21, Vite 6.4.3, Vitest 3.2.6; vulnerable prior versions removed | PASS |
| Remote dependency audit | Registry TCP 443 is filtered, so post-upgrade advisory resolution cannot be queried | BLOCKED |
| Line coverage | No backend/frontend reports proving the affirmed 85% threshold | BLOCKED |
| Live journey | Confirmed Booking created persisted journey and canonical expected moves | PASS |
| Live lifecycle/eventing | GTOT, LOAD, DISC, GTIN persisted; CMM outbox published 4/4 status events | PASS |
| Booking projection | Final latest-per-container projection is GTIN / `RETURNED_EMPTY` | PASS |
| Observable rejection | Wrong-next and duplicate submissions returned typed HTTP 409 | PASS |
| Broker configuration | CMM consumed `booking.events` from configured `kafka:9092` using Avro | PASS |
| Reference integration | USNYC/NLRTM resolved by code through Reference Data | PASS |
| Authenticated browser shell | Keycloak login, Booking list/detail, refresh, missing-record 404 | PASS |
| Current movement timeline UI | Current frontend image could not be rebuilt; fallback image lacks the current panel | BLOCKED |
| Responsive/a11y matrix | 1600x900 and 1280x720 fit checks passed; required 375/768/1024/1440, keyboard, states, and contrast suite incomplete | PARTIAL |
| Performance | Driver enforces p95 <=2s/max <=5s and 30s propagation; approved 20-sample live populations not executed | PARTIAL |
| Demo isolation | Pre/post manager guard passed; isolated project is now absent | PASS |
| Exit audits | Both detector commands exited 0; W2-04 runtime seams manually reconciled | PASS |
| Integration synchronization | Exact W2-02 integration commit was not confirmed in this stage | BLOCKED |

## Runtime identifiers

- Booking: `961aafd6-f42e-4a66-b2fc-86fb20308fc1`
- Booking number: `BKG-760588ae-78c7-4774-9c93-ef6bacbfe40b`
- Journey: `f773edca-4466-4294-a6a5-8d19d39a28d0`
- Container: `MSCU6639870`
- Final projection: `GTIN`, `RETURNED_EMPTY`, `NLRTM`

The Booking projection is intentionally latest-per-container; one final
projection row is correct and does not imply that the four CMM movement-history
rows were lost.

## Scope and preservation gates

The revision did not add EDI ingestion, public DCSA APIs, fleet registry, depot
stock, M&R, cloud infrastructure, or a shared database. It did not redesign
`packages/ui` or the shared shell. The manager demo was not used as a mutable
acceptance target. The historical W1 waiver remains explicit.

## Gate result

**HOLD.** The core broker-to-database-to-Booking vertical slice and both typed
rejection paths are now live-proven. Full promotion remains blocked by the
current-image UI/Playwright evidence, 85% coverage evidence, approved
20-sample performance run, post-upgrade remote advisory audit, exact W2-02
synchronization evidence, and missing isolated fixture/orchestration plus
evidence-manifest validation in the live CI job.
