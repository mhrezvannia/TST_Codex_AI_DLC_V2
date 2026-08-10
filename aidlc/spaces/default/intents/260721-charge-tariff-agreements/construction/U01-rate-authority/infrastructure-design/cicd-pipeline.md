# CI/CD Pipeline - U01 Rate Authority

## Pipeline objective and deployment boundary

The pipeline proves and packages the additive U01 changes for the existing
Charge backend/app and isolated Wave A Compose environment. It does not deploy
to staging, production, AWS, Kubernetes, or a registry not already approved.
The deployable outcome is a reproducible set of local images plus an evidence
bundle tied to one commit and rendered Compose configuration.

All stages fail closed. A waiver must be explicit, owned, time-bounded, and
must not relabel the preserved W1 blocked/waived run as PASS.

## Source and preflight

1. Check out the exact commit with no generated dependency drift.
2. Record Node, Yarn, Java, Maven, Docker, Compose, PostgreSQL client, and host
   versions.
3. Run secret detection against the diff and relevant history.
4. Run `npm run demo:guard`; abort if the protected manager project/port/image
   baseline is not intact.
5. Render `npm run wave-a:config`; assert project `linercore-wave-a`, network
   `linercore-wave-a-network`, nginx host port `18088`, Charge host port
   `18084`, loopback-only host bindings, Rate authorization mode
   `identity-http`, and absence of manager resource ownership.
6. Validate migration filenames/order/checksums and reject edits to any applied
   migration represented in the accepted baseline.

Preflight never prints resolved passwords, tokens, session secrets, cookies, or
Authorization values. CI uses masked, least-privilege, run-scoped secrets.

## Build, static analysis, and package

| Stage | Command/capability | Blocking criteria |
| --- | --- | --- |
| frontend install | immutable Yarn install | lockfile change or unresolved package |
| frontend lint/typecheck | repository `lint` and `typecheck` scopes | any changed-app/package failure |
| frontend build | Charge app plus affected dependencies | compile/build failure, basePath/route regression |
| backend compile | Maven reactor for affected services | compile or dependency convergence failure |
| unit tests | frontend Vitest + backend Maven tests | any failure |
| SAST | Semgrep 1.136.0: `semgrep scan --config .semgrep.yml --json --output artifacts/security/semgrep.json services apps packages scripts` | execution/config/report failure blocks immediately; findings go to exact waiver evaluation |
| frontend dependencies | Yarn 4.5.3 through `node scripts/run-security-scan.mjs yarn-audit --output artifacts/security/yarn-audit.json -- corepack yarn npm audit --all --recursive --json` | malformed/incomplete execution blocks; findings go to exact waiver evaluation |
| backend dependencies | Trivy 0.64.1: `trivy fs --scanners vuln --severity HIGH,CRITICAL --exit-code 0 --format json --output artifacts/security/trivy-backend-fs.json --skip-dirs target services` | execution/report failure blocks; findings go to exact waiver evaluation |
| secret scan | Gitleaks 8.24.3: `gitleaks detect --source . --config .gitleaks.toml --redact --report-format json --report-path artifacts/security/gitleaks.json --exit-code 1 --no-banner` | any verified credential; waivers cannot permit a live secret |
| SBOM | Syft 1.30.0: `syft scan <image>@<digest> -o cyclonedx-json=<path>` | missing component/license provenance |
| image build | pinned Spring and Next Dockerfiles | mutable/unapproved base, build secret leakage, non-reproducible failure |
| image scan | Trivy 0.64.1: `trivy image --severity HIGH,CRITICAL --exit-code 0 --format json --output <path> <image>@<digest>` | execution/report failure blocks; findings go to exact waiver evaluation |

Images are labeled with source commit and built with an immutable
commit-derived tag. The Wave A alias may be applied only to those exact local
digests. Evidence records both alias and digest so a later rebuild cannot
silently substitute an image.

No AWS-specific `cfn-lint`, `cdk-nag`, or Checkov cloud gate runs because U01
creates no AWS IaC. Compose/Dockerfile/config policy checks are the applicable
IaC security gate.

The exact tool versions, download URLs, and binary/container SHA-256 digests
live in checked-in `infrastructure/security-tools.lock.json`. CI verifies each
digest before execution and fails if the lock, binary, config, or report is
missing. `.semgrep.yml` and `.gitleaks.toml` are checked in; no remote
ruleset is fetched at scan time.

Scans are report-first. `scripts/run-security-scan.mjs` distinguishes a
documented finding-bearing exit from a tool/config/network/crash exit, requires
a complete parseable report with tool version and scanned-target registry, and
normalizes it without deciding finding policy. Semgrep and Trivy are configured
to return zero for findings while still returning nonzero for execution/config
failure. Yarn audit's documented finding exit is accepted only when every JSON
line parses and its completion record is present; any other nonzero exit or
missing/truncated report blocks immediately. Gitleaks remains immediately
blocking because verified secrets are non-waivable.

One checked-in command,
`node scripts/verify-security-waivers.mjs --findings-root artifacts/security --waivers security/waivers.yaml --as-of-source-commit`,
normalizes every JSON report and fails any unsuppressed High/Critical. A waiver
must match tool, rule/CVE, artifact, and finding fingerprint and contain owner,
justification, compensating control, approval reference, and UTC expiry.
Missing/ambiguous/expired waivers fail. Live-secret findings and missing scan
execution/report evidence are non-waivable. The verifier emits
`artifacts/security/waiver-evaluation.json` with closed statuses
`blocked|waived-active|not-applicable`; only zero `blocked` entries passes.

## Backend and migration verification

The backend test stage proves:

- Rate domain invariants, lifecycle, money, applicability, optimistic conflict,
  and immutable Approved history;
- exact authorization actions and local/non-local fail-closed beans;
- exact Reference Data set/ID/active/code validation and bounded faults;
- parameterized JDBC, page-bounded queries, query counts and required indexes;
- advisory/row-lock approval and successor races;
- atomic commercial row plus activity behavior under fault injection;
- empty, exact-legacy, history-present, partial, drifted, checksum, repeated
  startup, and complete V1-V4 migration cases;
- restart and isolated restore counts/hashes.

Migration tests use disposable PostgreSQL instances/databases. Restore targets
are newly created and verified as wrapper-owned; no test may point at a
developer or manager database.

## Frontend, contract, and edge verification

The frontend/contract stages prove signed-session extraction, server-side
capability gating, correlation propagation, safe error normalization, entered
value retention, duplicate-submit prevention, route/query behavior, and
accessibility/responsive/theme states for Charge-owned pages.

Provider/consumer checks validate additive pricing compatibility but do not
claim U04/U05 integrated behavior during U01. Edge regression checks validate:

- exact `/charge-agreements` redirect;
- path-preserving Charge deep links, assets, BFF routes, and health;
- existing `/auth`, `/reference-data`, `/booking(s)`, and shell `/` behavior;
- no direct browser backend call;
- no shared `packages/ui`, shell, navigation, typography, or palette redesign.

DS-02 and DS-03 remain unresolved shared dependencies and cannot be promoted to
PASS by a Charge-local test.

## Integration, performance, and resilience jobs

CI unit/integration jobs use Node/Maven processes and per-test Testcontainers;
they do not create a second full-stack Compose project. The only full-stack
integration/performance/resilience job uses
`scripts/wave-a-compose.mjs`, its loopback-only additive override, and exact
project `linercore-wave-a`. It is serialized against other Wave A runs and
executes both manager guards.

Required U01 evidence includes:

- deterministic 10,000 Rate/50,000 version fixture;
- separate post-warm-up read and mutation sample families;
- list/detail p95 <=500 ms and mutation p95 <=750 ms;
- 20 independent approvals across two Spring contexts/pools;
- at least 20 fresh same-key approval/successor race rounds;
- dependency permit/deadline/body/content-type/redirect fault cases;
- process failure before/after commit, activity-write failure, restart <=120 s;
- V1-V4 backup/restore RPO-0 canonical count/hash equality;
- safe metrics/log/trace correlation and redaction scans.

Unexpected outcomes stay in the sample set and fail the job. An unavailable
required capability produces BLOCKED evidence, never PASS.

## Isolated deployment and promotion

The local acceptance deployment sequence is:

1. `npm run demo:guard`;
2. validate/record rendered Wave A config and image digests;
3. create and verify the isolated pre-upgrade backup;
4. start/update only the `linercore-wave-a` project through the wrapper;
5. assert the Charge application context selected `identity-http`, contains no
   local-map Rate bean, and prove real Identity ALLOW/DENY/unavailable outcomes;
6. wait for PostgreSQL and Charge readiness with a 120-second ceiling;
7. run migration, API, UI, concurrency, performance, restart/restore, and
   preservation evidence;
8. run `aidlc-audit` and `erp-fidelity-audit` at the intent exit gate;
9. run `npm run demo:guard` again;
10. publish the checksummed, redacted evidence manifest.

There is no blue-green, canary, or rolling production selection. For the
isolated local stack the mechanism is controlled recreate of stateless
containers against forward-compatible database migrations. Database
compatibility must allow the old image to read the pre-change catalog until the
new image is ready, or the pipeline must halt before deployment.

## Rollback and recovery

Application rollback is disallowed after any V2-V4 migration or W2 write by
default; forward repair is the normal recovery. Database rollback is never an
edited/down migration.

CI generates `artifacts/compatibility/charge-image-schema-matrix.json` with two
different cell classes:

- **upgrade cells** clone an exact V1, V2, V3, or V4 source database, record its
  catalog/Flyway hashes, start the candidate with
  `CHARGE_MIGRATION_EXECUTION_MODE=migrate`, and require the declared
  source-to-V4 migration plus expected target hashes;
- **read-compatibility cells** clone the exact catalog being tested, record its
  hashes, grant the image a read-only role with no DDL or DML privileges, start
  it with `CHARGE_MIGRATION_EXECUTION_MODE=validate-only`, and run liveness,
  legacy-read, schema-introspection, and no-mutation smoke tests. The
  validate-only strategy calls Flyway validation but never migrate/baseline/
  repair. The before/after catalog, Flyway-history, and canonical data hashes
  must be identical.

The migration mode is a required closed enum with no default. Normal Wave A
pins `migrate`; compatibility jobs pin the declared mode and reject any other
value. The read-only database grant independently prevents schema/data mutation
even if application configuration regresses.

Each matrix cell records image digest, cell class, migration mode, database
role/privilege fingerprint, source/target schema version and checksums,
before/after catalog/Flyway/data hashes, process/readiness result, and test IDs.
A previous-image rollback is eligible only from a passing
**read-compatibility** cell for the exact current catalog/checksums and only
when no W2 Rate/agreement/pricing row has been written. Upgrade cells can never
authorize rollback. V3 checks include LEGACY/W2 discriminator filtering,
nullable legacy commodity reads, and prepared activity-table tolerance; V4
checks include prepared terminal/manual columns and indexes.
Missing/stale/mismatched/mutating matrix evidence means rollback-ineligible.

If a forward migration or image fails:

1. stop promotion and preserve diagnostics;
2. leave the source database untouched;
3. use a previous image only if the exact compatibility gate above passes;
   otherwise use a later forward-repair image/migration;
4. when restoration is required, restore the verified backup into a new
   isolated database and validate catalog, Flyway history, counts, hashes, and
   authenticated reads;
5. repoint only the wrapper-owned isolated Charge deployment after explicit
   database identity verification;
6. never clean or modify the manager stack, port 8088, or manager volumes.

No automatic image rollback runs after migration. The pipeline records whether
recovery is compatibility-proven application-only, forward-repair, or isolated
restore and never labels a failed/blocked attempt as deployed.

## CI/CD secrets and supply-chain controls

CI jobs receive the minimum run-scoped datasource and service credentials.
Secrets are masked, excluded from cache/artifacts, and never passed as Docker
build arguments. Third-party actions/tools are version-pinned. Dependency and
image provenance, SBOM, source commit, image digest, Compose hash, and evidence
manifest checksum form the promotion record.

Protected branches require successful build/test/security/contract/migration
and preservation gates. Any exception includes owner, rationale, scope,
expiration, compensating control, and evidence link.

## Upstream traceability

This pipeline consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`. Its gates map
directly to their bounded performance, fail-closed security, capacity,
transaction/migration recovery, component ownership, service compatibility,
and Rate workflow contracts.
