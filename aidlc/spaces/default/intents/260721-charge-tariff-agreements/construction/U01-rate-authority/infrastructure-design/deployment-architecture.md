# Deployment Architecture - U01 Rate Authority

## Deployment decision and boundaries

U01 adds Rate authority to the existing `charge-agreement-service` and
`apps-charge-agreements`; it creates no deployable, cluster, cloud account,
region, load balancer, cache, replica, queue, or database. The executable
topology is the repository's `compose.yaml`, parameterized by
`infrastructure/env/wave-a.env.example` and invoked exclusively through
`scripts/wave-a-compose.mjs` as Compose project `linercore-wave-a`.

This is a local development and isolated acceptance architecture, not a
production architecture. It makes no multi-AZ, production availability,
residency, encryption-at-rest, or operational-support claim. Portable
Well-Architected principles are applied as containment checks without
authorizing AWS CDK, CloudFormation, Terraform, or any AWS service.

## Runtime topology

| Boundary | Existing runtime | U01 deployment treatment |
| --- | --- | --- |
| Browser entry | nginx container | Add the already-approved path-preserving `/charge-agreements/` mount; Wave A exposes nginx only on `127.0.0.1:18088` |
| Charge web/BFF | `apps-charge-agreements`, Next.js | Add Rate routes/BFF inside the existing image; no direct browser-to-service URL |
| Charge API/application | `charge-agreement-service`, Spring Boot | Add Rate controller, application, adapters, persistence, Flyway, and telemetry inside the existing image |
| Commercial store | PostgreSQL 15, database `linercore_pricing` | Add V1-V4 forward-only Charge migrations; no cross-database joins or second authority |
| Authorization | `identity-service:8082` | Fixed Compose-DNS URL, Charge-owned service credential, fail-closed bounded adapter |
| Reference validation | `reference-data-service:8083` | Fixed Compose-DNS URL, Charge-owned service credential, fail-closed bounded adapter |
| Observability | optional Compose `observability` profile | Reuse Prometheus, Grafana, Jaeger, and OpenTelemetry Collector |
| Acceptance control | host-side Node scripts | `demo:guard` before/after; Wave A wrapper owns only `linercore-wave-a` |

Request flow is browser -> nginx -> Charge Next.js BFF -> Charge service ->
Identity/Reference Data -> Charge PostgreSQL. Queries authorize and then read
PostgreSQL. Mutations authorize, validate references, and commit Rate data plus
activity atomically. No Rate mutation traverses Kafka, and no browser calls a
backend service directly.

## Network and trust zones

All containers share the named Compose network
`linercore-wave-a-network`. Inter-container discovery uses Compose DNS names,
not host ports. Only the Wave A host mappings are acceptance surfaces:
Charge service `18084`, nginx `18088`, Identity `18082`, Reference Data
`18083`, and PostgreSQL `65432`. Direct service mappings exist for controlled
evidence and diagnostics; human application traffic remains same-origin through
nginx.

Every Wave A host mapping binds to `127.0.0.1`, enforced by an additive
wrapper-owned Compose override and checked in the rendered configuration before
startup. The override changes only binding/containment metadata, not the
service topology. The base Compose file used by protected manager workflows is
not repurposed or mutated at runtime.

Port `8088` and any manager Compose project are outside the control plane. The
wrapper may inspect them only through `npm run demo:guard`; it must never stop,
restart, rebuild, seed, clean, or attach volumes to them. Compose project name,
network name, host ports, and image tag remain explicit in the Wave A env file
so a missing variable cannot silently fall back onto the manager stack.

The browser/BFF, BFF/Charge, Charge/Identity, Charge/Reference Data, and
Charge/PostgreSQL edges are separate trust boundaries. Local HTTP does not
claim production TLS. Any non-local deployment must supply TLS and managed
secret/encryption controls through a separately approved production design.

## Compute, process, and resource sizing

The existing Compose limits are the initial measurable bounds:

| Resource | Existing bound | U01 constraint |
| --- | ---: | --- |
| `charge-agreement-service` | 384 MiB; JVM max RAM 55% | Preserve limit initially; acceptance records RSS, heap, GC, CPU, pool waits, and OOM/restart evidence |
| `apps-charge-agreements` | 256 MiB; Node old-space 160 MiB | Preserve limit; Rate pages use bounded route/query/form state |
| shared PostgreSQL | 256 MiB | Preserve only if 10k Rate/50k version acceptance and restore proof pass; resizing requires evidence and shared-owner review |
| Charge Hikari pool | min idle 2, max 10, acquire <=2 s | Environment-backed; never increase independently of PostgreSQL capacity |
| Identity permits | 10 | <=100 ms permit wait, <=250 ms connect, <=2 s total, <=16 KiB body |
| Reference permits | 50 global, 5/command | Ten five-check commands fit exactly; <=64 KiB/check and <=2 s shared deadline |

CPU is measured rather than invented where Compose currently has no explicit
Charge CPU limit. A later limit change is permitted only after the fixed
acceptance workload records host CPU, container CPU, RSS, heap, GC, datasource
state, and latency percentiles.

The Charge container uses Spring graceful shutdown with a 15-second
per-shutdown-phase deadline and a Compose stop grace period of 20 seconds. It
must stop accepting new requests, allow bounded in-flight transactions either
to commit or roll back, and then close the datasource. A transaction still
running at the deadline is interrupted and must roll back. Healthchecks use
process-local liveness and database/configuration readiness; they do not fan
out to Identity or Reference Data on every probe.

## Storage, migration, and recovery layout

PostgreSQL database `linercore_pricing` is the sole durable Rate authority.
Rate, RateVersion, activity, Flyway history, prepared V3/V4 structures, and
legacy Charge rows remain within that service-owned database. The shared
PostgreSQL container does not imply shared schemas, credentials, repositories,
or cross-service queries.

The Charge image contains immutable ordered migration resources:

1. `V1__charge_baseline.sql` - exact legacy catalog;
2. `V2__versioned_rate_authority.sql` - Rate/version/activity authority;
3. `V3__versioned_agreement_authority.sql` - prepared agreement structures;
4. `V4__pricing_terminal_evidence.sql` - prepared pricing/manual structures.

Startup migrates an empty catalog, validates and migrates a catalog with Flyway
history, or baselines a nonempty no-history catalog at V1 only after exact
catalog comparison. Partial or drifted catalogs remain unready. Applied files
are never edited.

Before an upgrade proof, the acceptance wrapper creates a backup from the
isolated source database and records safe catalog/count/hash evidence. Restore
targets a newly created, wrapper-owned isolated database with verified name,
owner, source/target identity, and containment. It never overwrites the source
or any manager database. RPO-0 proof compares committed canonical counts and
hashes after restart and restore. Recovery is forward repair or verified
restore, never a destructive reset or down migration.

## Environment definitions and configuration

| Environment | Lifecycle | Topology and data |
| --- | --- | --- |
| Developer local | Explicit developer action | Same Compose service graph; disposable or retained developer data; no acceptance claim |
| CI unit/integration | Ephemeral per job | No full-stack Compose project; Maven/Node tests and per-test Testcontainers only, with test-owned database/container identities |
| Wave A acceptance | Isolated retained evidence run | Project `linercore-wave-a`, nginx `18088`, deterministic seeds, fixed 10k/50k performance fixture where required |
| Staging | Not defined | Requires a future approved architecture; must not be inferred from Compose |
| Production | Not defined | Requires threat, availability, residency, encryption, capacity, cost, and operations decisions |

Configuration is supplied through checked-in non-secret examples plus runtime
secret injection. Required settings include datasource URL/user/password,
Identity and Reference Data fixed URLs and credentials, permit/time/body
bounds, Flyway validation mode, and telemetry endpoints. Non-local missing
credentials or unsafe adapter wiring make readiness false. Secrets never enter
images, source, command output, logs, traces, or retained evidence.

Rate authorization uses one mandatory enum property:
`CHARGE_RATE_AUTHORIZATION_MODE=local-map|identity-http`. Both beans are
conditional on the exact property, the property has no default, and a startup
guard proves exactly one `RateAuthorizationPort` bean is present. Developer
local runs may explicitly select `local-map`. Wave A pins
`CHARGE_RATE_AUTHORIZATION_MODE=identity-http`,
`IDENTITY_SERVICE_URL=http://identity-service:8082`, and caller
`charge-agreement-service`; the Spring `local` profile cannot override that
selection. The rendered-config gate rejects any Wave A value other than
`identity-http`.

Acceptance records a safe adapter-mode fingerprint, exercises one real Identity
ALLOW and one real DENY with correlated Identity audit evidence, then makes
Identity unavailable and requires typed 503/readiness evidence with no Rate
commit. A local-map class on the Wave A application context, missing URL, or
multiple/missing authorization beans aborts startup. This proves decision
semantics over the existing internal Identity contract without claiming a
production mTLS or service-token control that the current platform does not
implement.

## Infrastructure-as-code and change control

For this intent, `compose.yaml`, the Wave A env example, nginx configuration,
Dockerfiles, Flyway migrations, Prometheus configuration, and the Wave A wrapper
are the version-controlled infrastructure definition. CI renders
`npm run wave-a:config` and rejects an unexpected project name, network, port,
mount, image, healthcheck, or dependency edge. Console/cloud drift tooling is
not applicable because no cloud resources are provisioned.

Images are built from pinned Dockerfile bases and tagged for the isolated run.
Evidence records source commit, image IDs/digests, rendered Compose
configuration hash, database catalog/Flyway hashes, and host/runtime versions.
The existing manager image lock and W1 blocked/waived artifact remain unchanged.

## Upstream traceability

This deployment architecture consumes `performance-design.md`,
`security-design.md`, `scalability-design.md`, `reliability-design.md`,
`logical-components.md`, `components.md`, `services.md`, and
`business-logic-model.md`. It implements their existing-deployable,
Compose-only, PostgreSQL-authority, bounded-adapter, forward-only migration,
Charge-page ownership, and manager-preservation decisions.

## Review

**Final iteration-2 verdict: NOT-READY**

### Blocking findings

1. **High - the image/schema compatibility matrix can mutate the schema it
   claims to test.** `cicd-pipeline.md` section "Rollback and recovery" starts
   previous and candidate images against disposable V1-V4 catalogs, but does
   not define separate upgrade and rollback-test modes. Normal application
   startup runs Flyway, so a candidate tested against V1 can silently migrate it
   to V4, while a previous image can validate or mutate differently; the
   resulting cell does not prove compatibility with the named input catalog.
   Define an upgrade cell that records the expected source-to-target migration
   and a rollback/read-compatibility cell with migration execution disabled or
   validate-only, then prove the catalog/Flyway hash is unchanged by the smoke
   test. A previous-image rollback must depend only on the latter exact-current-
   schema cell.
2. **High - scanner fail-fast behavior bypasses the closed waiver verifier.**
   `cicd-pipeline.md` section "Build, static analysis, and package" invokes
   Semgrep with `--error`, Trivy image with `--exit-code 1`, and Yarn audit with
   a blocking severity while also stating that High/Critical findings are
   decided after `verify-security-waivers.mjs`. Under the pipeline's global
   fail-closed rule, those tools can terminate the stage before the verifier
   evaluates an active approved waiver. Configure scanners to always emit their
   complete report while distinguishing tool/configuration failure from finding
   presence, then make the closed verifier the sole finding-policy exit.
   Gitleaks may remain immediately blocking because live-secret findings are
   explicitly non-waivable. The backend Trivy filesystem row must also provide
   its exact command, output path, and scan inputs rather than prose.

### Prior-blocker validation

- **PASS - topology:** CI unit/integration uses Node/Maven and test-owned
  Testcontainers. The only full-stack job is serialized through
  `scripts/wave-a-compose.mjs` as exact project `linercore-wave-a`, with
  loopback-only rendered bindings and both manager guards.
- **PASS - authorization selection:** required enum
  `CHARGE_RATE_AUTHORIZATION_MODE` has no default and mutually selects one
  typed bean. Wave A pins `identity-http`, rejects local-map presence, and
  records real Identity ALLOW, DENY, and unavailable evidence while honestly
  documenting the current endpoint's lack of production caller-token/mTLS.
- **FAIL - rollback closure:** forward repair is correctly the default and
  automatic post-migration rollback is prohibited, but the generated matrix is
  not trustworthy until its schema-mutation modes are explicit.
- **FAIL - security-tool closure:** versions, digest lock, local rule files, and
  waiver schema are concrete, but command exit behavior prevents the declared
  verifier from being authoritative.
- **PASS - unchanged constraints:** U01 remains Compose-only, adds no AWS or
  production topology, owns only the physical Charge V1-V4 migration chain,
  leaves U03/U04 behavior to downstream units, protects manager port 8088, and
  preserves the W1 waiver as non-PASS. Cross-references resolve and the
  pool/permit/shutdown budgets remain coherent.

### Nonblocking implementation controls

- Distinguish Identity runtime outage from configuration readiness: valid
  `identity-http` wiring may remain ready while Rate operations fail closed
  with typed 503; missing/invalid wiring remains unready.
- Assert every diagnostic host port is loopback-bound in the rendered Wave A
  configuration, not only nginx.
- Keep compatibility matrix databases disposable and hash source catalogs
  before and after every cell.
- Preserve the 15-second Spring shutdown phase and 20-second Compose grace
  period in executable restart/fault tests.

## Post-review lead corrections

The iteration-2 verdict above is immutable. Its two remaining findings are
addressed in `cicd-pipeline.md` without claiming a third reviewer pass:

1. image/schema evidence now separates normal **upgrade** cells from
   **read-compatibility** cells. Compatibility uses required `validate-only`
   migration mode plus a database role without DDL/DML, and requires identical
   before/after catalog, Flyway-history, and canonical data hashes. Only the
   exact-current-schema read-compatibility cell can make a previous image
   rollback-eligible;
2. Semgrep and Trivy emit complete reports without policy exits, Yarn audit is
   captured by a report-validating wrapper that distinguishes findings from
   execution failure, the backend Trivy command/target/output are exact, and
   the closed waiver verifier is the sole High/Critical finding-policy exit.
   Tool/config/report failures and verified secrets still block immediately.
