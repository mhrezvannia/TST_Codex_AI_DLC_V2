# W2-04 CI Configuration

## Decision

W2-04 extends `.github/workflows/quality-gates.yml` on the existing
`[self-hosted, on-prem, linux]` runner. It does not introduce another CI
provider, cloud registry, or public-cloud deployment dependency.

The target topology remains two blocking concerns:

1. static build, test, contract, dependency, and coverage gates;
2. serialized live acceptance against the isolated `linercore-wave-a` stack.

The manager demo on port 8088 is never an acceptance target and is protected by
pre/post `npm run demo:guard` checks.

## Upstream artifacts

This revision traces all three unit `code-summary` artifacts through
`construction/build-and-test/build-and-test-summary.md` and
`construction/build-and-test/build-test-results.md`. The live remediation
evidence below supplements those upstream artifacts without replacing their
recorded results.

## Revision 6 evidence

The local remediation run observed:

- Container Movement and Booking Maven reactors: PASS;
- Booking Vitest 23/23, production build, lint, and typecheck: PASS;
- current frontend dependency upgrades: Next 15.5.21, Vite 6.4.3, and
  Vitest 3.2.6;
- contract verifier regression suite: 9/9 PASS;
- secured live provider verification: 195/195 PASS;
- confirmed Booking to persisted Container Movement journey: PASS;
- expected `LOAD@USNYC` and `DISC@NLRTM` moves: PASS;
- live `GTOT -> LOAD -> DISC -> GTIN` lifecycle: PASS;
- typed wrong-next and duplicate HTTP 409 responses: PASS;
- CMM outbox publication and Booking `RETURNED_EMPTY` projection: PASS;
- authenticated isolated shell and Booking-detail browser checks at 1600x900
  and 1280x720 with no horizontal overflow: PASS;
- isolated Keycloak callback mismatch corrected additively for ports 8088 and
  18088;
- `aidlc-audit` and `erp-fidelity-audit` detector commands: exit 0;
- manager demo guard: PASS before and after acceptance.

Two integration defects found by the live gate are now covered by code and
tests: CMM uses an explicit Avro consumer factory pointed at the configured
broker, and location validation resolves booking UN/LOCODE values through
Reference Data rather than assuming they are record IDs. The live contract
verifier now supplies the configured Reference Data service identity.

## Blocking static commands

```text
corepack yarn install --immutable
mvn -f services/container-movement-service/pom.xml test -DskipITs
mvn -f services/pom.xml test -DskipITs
corepack yarn workspace @erp/app-booking lint
corepack yarn workspace @erp/app-booking typecheck
corepack yarn workspace @erp/app-booking test
corepack yarn workspace @erp/app-booking build
node --test scripts/verify-contract-providers.test.mjs
npm run contracts:validate
npm run contracts:verify
corepack yarn npm audit --all --severity high
```

Backend and frontend coverage reports must fail below the affirmed 85% line
threshold. The local remediation run did not generate those reports, so this
criterion remains open.

## Blocking live job

The self-hosted runner must serialize the live job:

```yaml
concurrency:
  group: linercore-wave-a-acceptance
  cancel-in-progress: false
```

The job must:

1. verify the W2-02 integration base;
2. run the manager demo guard;
3. build commit-SHA-tagged images without using `latest`;
4. start the stack only through `scripts/wave-a-compose.mjs`;
5. drive confirmation, journey creation, four ordered movements, event
   publication, Booking projection, and typed rejection cases;
6. run the current Booking/CMM UI in a real browser at the approved responsive
   viewports and retain screenshots/traces;
7. execute the approved performance populations and thresholds;
8. run both exit-audit detectors;
9. validate a hashed W2-04 evidence manifest;
10. clean the isolated stack and re-run the manager demo guard in `always()`
    steps.

The historical W1 result remains `BLOCKED`/waived and is not rewritten by a
W2-04 result.

## Remaining activation gaps

Revision 8 adds executable `scripts/w2-04-live-acceptance.mjs` and
`scripts/w2-04-playwright.mjs` drivers. The lifecycle driver asserts canonical
expected moves, typed wrong-next and duplicate conflicts, four accepted
movements, `RETURNED_EMPTY`, Booking projection, local p95/max thresholds, and
preservation of the W1 waiver, then writes JSON evidence. Its mock-provider
regression passes. GitHub Actions now blocks on that regression, contract
verification, both driver syntax checks, and the dependency advisory command,
and uploads `artifacts/w2-04-live/**`.

The workflow still needs isolated-stack orchestration that creates and confirms
the priced Booking fixture, passes its ID to the live driver, invokes the
browser driver, validates the evidence manifest, and cleans up in `always()`
steps. The local browser run used manager-tagged frontend fallback images
because registry egress blocked rebuilding frontend images; consequently it
proved authentication, layout fit, and booking data, but not the current
`JourneyStatusPanel` rendering the final movement.

The dependency versions were remediated, but the post-upgrade remote audit
cannot reach the package registry from this workstation. These gaps keep full
CI activation on **HOLD** even though the previously missing backend live seam
and secured contract probe now pass.
