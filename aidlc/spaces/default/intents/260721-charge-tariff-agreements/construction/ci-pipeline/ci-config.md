# CI Configuration — W2-03 Charge Tariffs and Agreements

## Inputs and selected model

This configuration consumes every unit `code-summary`, the approved
`build-and-test-summary`, and `build-test-results`. It defines a
provider-neutral pipeline-as-code contract over existing repository commands.
No GitHub Actions, Jenkins, CodeBuild/CodePipeline, ECR, CodeArtifact, S3, cloud
account, credential, or production deployment is inferred.

Branch flow follows the program backlog:

- validate changes on `intent/W2-03-charge-tariffs-and-agreements`;
- require the same gates for merge into `integ/main-reconciled`;
- do not create a release/promotion marker while a mandatory live cell is
  `BLOCKED`, `FAIL`, `SKIPPED`, or `UNMEASURED`.

## Pipeline contract

The selected CI provider must implement these ordered lanes with fail-fast
within a lane and parallel execution where independent:

```yaml
pipeline:
  triggers:
    pull_request:
      from: intent/W2-03-charge-tariffs-and-agreements
      to: integ/main-reconciled
    push:
      branches: [intent/W2-03-charge-tariffs-and-agreements, integ/main-reconciled]
  environment:
    node: pinned-by-repository
    java: "21"
    package_install: immutable-lockfile
    docker: required-for-integration-and-acceptance
  lanes:
    fast:
      - charge-and-booking-typecheck
      - charge-and-booking-lint
      - contract-catalog-and-provider-verification
      - u06-node-suite
      - u02-u05-deterministic-evaluators
    build_and_unit:
      - charge-maven-reactor
      - booking-maven-reactor
      - charge-vitest-and-next-build
      - booking-vitest-and-next-build
    security:
      - pinned-secret-scan
      - pinned-sast
      - pinned-dependency-and-license-scan
      - pinned-iac-and-container-scan
    integration:
      - postgres-and-testcontainers
      - live-provider-contracts
      - changed-line-coverage-at-least-80-percent
    acceptance:
      - demo-guard-before
      - isolated-linercore-wave-a-u06
      - demo-guard-after
      - aidlc-audit
      - erp-fidelity-audit
  publish:
    deployables: false
    evidence: bounded-ci-native-artifacts
```

## Command mapping

| CI step | Repository command/evidence |
| --- | --- |
| Contracts | `npm run contracts:validate` and `npm run contracts:verify`; release lane additionally uses `contracts:verify:live` |
| TypeScript static | Charge and Booking workspace `typecheck` and `lint` |
| U06 harness | `node --test --test-isolation=none tests/u06/*.test.mjs` |
| Deterministic evaluators | the ten U02–U05 `*.test.mjs` files recorded in `build-test-results` |
| Charge Java | `mvn -f services/charge-agreement-service/pom.xml test` |
| Booking Java | `mvn -f services/booking-service/pom.xml test`; dependency resolution must use approved immutable artifacts |
| Frontend | each Charge/Booking workspace `test` followed by `build` |
| Live topology | only `node scripts/wave-a-compose.mjs`; never direct Compose mutation |
| Preservation | `npm run demo:guard` before and after the U06 lifecycle |

The existing `scripts/run-quality-gates.mjs` remains useful as a registry, but
a hosted adapter must preserve `PASS`, `FAIL`, `BLOCKED`, `SKIPPED`, and
`UNMEASURED` rather than flattening every non-zero capability result into a
source failure. It must not treat a dry run, skip, or absent scanner as green.

## Caching, secrets, and artifacts

- Cache dependencies only by lockfile digest, runtime version, and OS; never
  cache credentials or acceptance databases.
- Resolve Maven/npm dependencies through immutable locks. A missing dependency
  is a pipeline infrastructure block, not permission to use compile stubs.
- Supply service credentials and signed-session fixtures from the selected CI
  provider's secret store; redact logs and never publish them.
- Publish only bounded test reports, coverage, scan outputs, U06 ledger/
  manifest artifacts, and phase evidence keyed by commit SHA and build ID.
- Use the CI provider's bounded artifact store with a maximum 30-day retention
  until a platform owner approves another policy. Deployable image/package
  publication is disabled.

## Promotion rule

Merge validation requires all runnable source gates to pass. A release or
Operation deployment execution requires every mandatory live/integration/
security/coverage/audit cell to pass as well. Human approval cannot convert a
technical `BLOCKED`, `FAIL`, `SKIPPED`, or `UNMEASURED` cell into `PASS`.

