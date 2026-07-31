# Construction to Operation Phase Check

## Upstream artifacts

This boundary check traces all unit `code-summary` artifacts through
`construction/build-and-test/build-and-test-summary.md` and
`construction/build-and-test/build-test-results.md`, together with the current
CI configuration and quality-gate evidence.

## Verification result

**HOLD - Construction has materially improved but is not yet verified for
Operation.**

Revision 6 replaced the earlier static-only evidence with a live
broker-to-database-to-Booking proof. It also corrected the CMM broker consumer,
UN/LOCODE lookup, Booking internal event-consumer authorization, isolated
Keycloak callback, and secured live contract verifier.

## Traceability coverage

| Link | Coverage | Result |
|---|---:|---|
| Construction units with code summaries | 3/3 | PASS |
| Backend/frontend executed tests | All executed checks passed | PASS |
| Static and live contract checks | 195/195 plus 9/9 verifier tests | PASS |
| Live DoD backend observations | Journey, four moves, publication, projection, and two rejection paths | PASS |
| Current-image UI observation | Authenticated fallback image only; movement panel not rendered | BLOCKED |
| Required responsive viewports | 2 observed; 4 approved widths plus state/a11y suite required | PARTIAL |
| Coverage thresholds | 0/2 reports | BLOCKED |
| Performance thresholds | Not executed | BLOCKED |

## Architecture-to-code and code-to-test alignment

- Booking confirmation now reaches CMM over real Kafka/Avro.
- CMM persists a journey and four ordered movements, drains its outbox, and
  publishes schema-registered `containermovement.status` events.
- Booking consumes those events and holds the final latest-per-container
  `GTIN` / `RETURNED_EMPTY` projection.
- Wrong-next and duplicate requests return typed 409 conflicts.
- The current Booking component contains the journey status panel and its tests
  pass, but registry egress prevented rebuilding the frontend image used by the
  isolated browser run.
- Both required audit detectors exit successfully and their W2-04 leads agree
  with the live evidence.
- Revision 8 adds executable lifecycle and Playwright drivers, a passing
  mock-provider acceptance regression, and blocking static workflow steps.

## Remaining blockers

1. Rebuild and run the current frontend image, then capture the final movement
   in the approved UI surface.
2. Complete Playwright evidence at 375/768/1024/1440 with keyboard, loading,
   empty, error, denied, theme, and accessibility checks.
3. Generate backend/frontend coverage and meet the affirmed 85% threshold.
4. Run the approved 20-sample performance populations; the driver now enforces
   the approved thresholds for its core API samples.
5. Restore registry egress and complete the post-upgrade dependency audit.
6. Confirm the exact W2-02 integration commit.
7. Wire confirmed fixture creation, serialized isolated acceptance, Playwright,
   evidence-manifest validation, and `always()` cleanup into CI. Artifact upload
   and static driver validation are now wired.

No pending item is treated as skipped or passed. Deployment readiness is not
claimed, and the historical W1 waiver remains `BLOCKED`/waived.
