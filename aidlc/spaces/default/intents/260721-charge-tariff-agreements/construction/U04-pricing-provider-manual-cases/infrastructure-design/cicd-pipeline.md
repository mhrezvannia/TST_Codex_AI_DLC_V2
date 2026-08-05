# CI/CD Pipeline — U04 Pricing Provider and Manual Cases

## Input contract and pipeline posture

This pipeline consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

U04 extends the existing Charge/app build and guarded Wave A evidence pipeline.
It creates no second full-stack Compose file, cloud deployment pipeline, or
production rollout claim. All full-stack proof uses
`scripts/wave-a-compose.mjs` and project `linercore-wave-a`.

## Build and static gates

1. install lockfile-pinned JavaScript and JVM dependencies;
2. build/test Charge domain, application, data access, container, OpenAPI, app
   BFF, and manual evidence page;
3. validate the provider/legacy-consumer pricing-v1 fixtures and exact
   200/404/422 replay bytes/content types;
4. validate U01 V4 filename/order/checksum without editing an applied migration;
5. run pinned Semgrep, Gitleaks, Trivy, Syft, Yarn audit, and the closed-schema
   current-runner-UTC waiver verifier established by U01/U02;
6. archive reports and fail on scanner execution/report failure or unwaived
   findings according to the locked policy.

Secrets, resolved environment values, payloads, hashes, owner tokens, case
snapshots, and commercial values are never printed or uploaded.

## Backend and persistence tests

Blocking tests cover authorization-before-query; exact media/key/hash; claim,
live-owner, different-hash, takeover, and stale-owner-token races; one bounded
`REPEATABLE READ` candidate snapshot; Agreement-first precedence; all
zero/ambiguity permutations; exact three-line calculation; atomic terminal
completion; canonical case reuse including incomplete legacy winner; and
byte-identical replay with no resolver/render/case write.

Disposable PostgreSQL 15 tests load 100,000 receipts and 10,000 OPEN cases,
require the manual mixed-order plan to scan at most 10,000 fixture rows, sort
without disk spill in at most 4 MiB, and return at most 100 rows; run 20
two-context races using PostgreSQL-created leases; inject failure before/after every
claim/snapshot/case/serialization/commit seam, and verify restart RPO 0.
Tests use new isolated databases and wrapper-owned targets only.

## UI, contract, and security tests

The manual BFF/page suite proves signed-session identity, exact
`charge-manual-cases:read`, denial before count/query, 1–100 page bounds,
`opened_at DESC NULLS LAST, case_id ASC`, `?case=` detail, legacyEvidence,
read-only controls, Zod failure states, keyboard/focus/accessibility, and
prohibited-data absence.

Proxy regressions cover shell, auth, reference, booking(s), Charge HTML/assets/
BFF, deep links, and reload. No U04 code modifies `packages/ui`, shared shell,
manager project, or port 8088.

## Performance and resource evidence

After 20 warm-ups, each fresh pricing scenario supplies at least 100 calls at
10 clients and must meet p99 <=800 ms. Each approved terminal replay fixture
runs 25 calls and proves exact status/bytes/content type/correlation/time/case
with no resolver probes. Manual list/detail meets p95 <=750 ms. The three-cycle
post-GC heap/RSS gate rejects monotonic retention.

Evidence records image digest, database/migration hashes, host, concurrency,
sample count, nearest-rank method, raw timings, plans, pool readings, and test
IDs. Expected errors remain latency samples.

## Promotion, rollback, and secrets

Promotion renders and validates the checked-in Wave A environment, verifies the
single project/network/ports, runs `npm run demo:guard`, starts the candidate,
waits for readiness with a 120-second ceiling, runs the full evidence suite,
and repeats the manager guard.

The prior image may be used only if the U01 validate-only/read-only
exact-current-schema compatibility cell proves no catalog/data mutation, the
exact `incompatible_u04_rows` query in `deployment-architecture.md` returns
zero, and byte-preserving legacy receipt/case fixtures pass. The pipeline stores
the query text hash, result, role/privilege fingerprint, and before/after
catalog/Flyway/data hashes. Any nonzero result requires a later forward-repair
image/migration or an isolated verified restore; automatic down migration or
destructive reset is forbidden.

A zero result permits the previous image only behind an enforced drain:
pricing/manual mutation routes are disabled and the image uses a database role
with SELECT but no DML/DDL. CI proves mutations are rejected and legacy reads
preserve bytes. The prior image cannot resume writes; forward repair is
required to restore the full endpoint.

CI receives only job-scoped secrets from the established secret boundary.
Nonlocal missing/bypass values fail closed. Waivers have closed schema, owner,
scope, rationale, compensating control, evidence, and expiration evaluated
against trusted current runner UTC.

## Artifact manifest

The immutable evidence manifest contains source commit, dependency locks,
Charge/app image digests, SBOM, scanner reports, waiver decision, OpenAPI/
fixture hashes, V1–V4 migration hashes, test reports, latency/resource/query
evidence, Compose configuration fingerprint, and before/after manager guard.
Promotion consumes that exact manifest; failed/blocked runs are never labeled
deployed.
