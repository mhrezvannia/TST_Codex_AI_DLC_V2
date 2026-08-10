# Technology Stack Decisions - U01 Rate Authority

## Brownfield constraint

U01 extends the stack recorded in `technology-stack.md` and the ports/adapters
in its `business-logic-model.md` and `business-rules.md`. The program
`requirements.md` forbids an umbrella pricing service, duplicate master data,
cross-database access, or shared-UI redesign. Therefore this artifact selects
no new deployable, database, cache, broker, frontend state framework, cloud
account, or IaC stack.

## Selected technologies

| Concern | Decision | Rationale/constraint |
| --- | --- | --- |
| domain/application | Java 21 in existing Charge modules | preserves ports-and-adapters, exact `BigDecimal`, typed value objects, and current Maven reactor |
| service/runtime | Spring Boot 3.3.7 | existing container, transactions, validation, health, metrics, configuration profiles |
| persistence | Spring JDBC + PostgreSQL 15 | current service-owned DB; explicit parameterized SQL and PostgreSQL advisory locks/constraints fit authority concurrency |
| migration | Flyway 10.10.0 line already proven by Booking, adopted in Charge | ordered exact-catalog baseline plus additive V2-V4; replaces Charge SQL init after adoption |
| API | existing Spring REST/OpenAPI conventions | additive Rate endpoints and standard errors; no second protocol/generic gateway |
| Identity/Reference | existing HTTP port shapes and service identities | fail-closed exact decisions/records without copied authority or browser-direct calls |
| frontend | Next.js 15.1.3, React 18.3.1, TypeScript 5.7.2 | Charge-owned App Router/BFF pages within the existing workspace |
| UI | existing `@erp/ui` and LinerCore tokens | no `packages/ui`, shell, navigation, typography, or palette ownership change |
| state | route/query/form-local state | RTK is absent/prohibited for this slice; no Redux/TanStack/Zustand introduction into Charge |
| tests | JUnit Jupiter 5.11.3, Spring tests/Testcontainers where present, Vitest 2.1.8, Playwright 1.61.1 | unit, JDBC/migration/concurrency, BFF/component, and live browser evidence |
| telemetry | Spring/Micrometer conventions, Prometheus, existing correlation/OTel/log stack | latency/outcome/lock/pool evidence without a new dashboard platform |
| runtime | checked-in Compose through `scripts/wave-a-compose.mjs` | isolated `linercore-wave-a` on 18088; manager 8088 remains probe-only |

Managed/library versions remain governed by the existing parent/workspace lock;
U01 does not opportunistically upgrade them. An implementation may add the
minimum Flyway module dependency/configuration required for Charge, pinned to the
existing managed line, but may not introduce a competing migration engine.

## Significant decisions and alternatives

### Flyway exact-catalog adoption

Decision: mirror Booking's fail-closed migration strategy, but compare the
complete Charge legacy catalog before baselining V1. Empty schemas migrate;
history-present schemas validate/migrate; exact nonempty legacy schemas baseline
at V1; partial/drifted schemas abort.

Rejected alternatives are continuing mutable SQL init (no ordered upgrade or
checksum), baselining any nonempty schema (hides drift), and destructive rebuild
(violates preservation/recovery). Consequence: more catalog comparison/live-test
work, in exchange for deterministic brownfield safety.

### PostgreSQL transaction/advisory locking

Decision: use `pg_advisory_xact_lock(hashtextextended(canonicalKey,0))`, row
locks, overlap SQL, partial uniqueness, and checks within the existing DB.

Rejected alternatives are JVM mutexes (not multi-instance safe), a new lock
service/cache (scope/operations expansion), and exclusion extensions not already
required. A hash collision can serialize unrelated work but cannot bypass the
authoritative overlap predicate.

### No cache or async command path

Decision: list/detail and commands use authoritative PostgreSQL through current
repositories. Optimize queries/indexes against 10k/50k before adding a cache.
Rate approval remains synchronous and transactional; no new Kafka/outbox workflow
is introduced by U01.

This preserves read-after-write and simple failure semantics. A later measured
capacity problem requires a new decision with invalidation/consistency evidence.

### Existing BFF/UI composition

Decision: use Charge App Router routes, authenticated BFF handlers, existing
primitives/tokens, and a permitted Charge-local DS-01 wrapper. DS-02/DS-03 remain
W2-02 dependencies. No new global state library or shared abstraction is added.

## Tooling and quality gates

Backend compile/test uses the existing Maven reactor; frontend uses Yarn/Turbo
build, lint, typecheck, and test. U01 adds executable migration/concurrency and
authorization/reference contract tests. Changed code must meet the program's
>=80% line coverage requirement; because the baseline lacks committed coverage
instrumentation, implementation must add the minimum module-scoped Java and
Charge-app coverage reporting rather than claiming coverage from test counts.

Security/dependency/secret scans, contract checks, `git diff --check`, both audit
skills, and U06 live evidence remain blocking. Detector exit zero still requires
manual audit review. Playwright is installed but the baseline lacks committed
configuration, so U06 owns the minimal checked-in evidence harness rather than
U01 claiming browser proof from package presence.

## Decision trace

These selections implement FR-101-FR-108, FR-601-FR-603, FR-701-FR-706 and
NFR-002-NFR-010 while preserving C01/C06-C08/C12/C15, service-owned databases,
the Wave A topology, and W2-02 UI ownership.
