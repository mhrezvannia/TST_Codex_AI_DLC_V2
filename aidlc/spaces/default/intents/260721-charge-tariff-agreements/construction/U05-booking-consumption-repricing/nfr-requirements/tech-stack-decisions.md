# Technology Stack Decisions - U05 Booking Consumption and Repricing

## Brownfield constraint

U05 extends existing Booking ports-and-adapters, PostgreSQL persistence, REST
route, BFF, and pricing region. It consumes `business-logic-model.md`,
`business-rules.md`, `requirements.md`, and `technology-stack.md`. It adds no
service, shared database, broker/event, pricing authority, route, shared UI
primitive, or distributed transaction.

## Selected technologies

| Concern | Decision | Constraint/rationale |
| --- | --- | --- |
| domain/application | Java 21 existing Booking modules/value objects | typed requested date, canonical fingerprint, explicit pricing status/sequence, immutable snapshot algebra |
| runtime/transactions | Spring Boot 3.3.7 with separate transactional capture and completion beans | remote call outside DB transaction; row-lock/CAS/fence atomic local commits |
| persistence/migration | Spring JDBC, PostgreSQL 15, existing Booking Flyway 10.10.0 line | additive V3 typed snapshots/fields/receipt widening; no updates/deletes on typed history |
| provider HTTP | existing Booking PricingPort/client, fixed v1 media and service identity | exact body/key/correlation; no browser authority or alternate provider |
| resilience | new minimum Booking application-service dependencies `io.github.resilience4j:resilience4j-retry:2.2.0` and `io.github.resilience4j:resilience4j-circuitbreaker:2.2.0` | plain Java decorators, no Spring starter/AOP; two raw two-second calls; 5/5 100% open; 30-second wait; one half-open probe; process-local truthfully |
| hashing/codec | JDK SHA-256 and application-owned fixed-order UTF-8 JSON codec | deterministic fingerprints and schema-v1 local command receipt, independent of container DTO |
| money validation | Java `BigDecimal` | structural/arithmetic verification only; Booking never recalculates provider price |
| frontend | existing Booking Next app, React 18.3.1, TypeScript range `^5.7.2` (lock 5.9.3) | minimum existing pricing-region change; no Booking page/shell redesign |
| UI/state | existing `@erp/ui`/LinerCore tokens and component/form-local state | no `packages/ui`, navigation, typography, palette, or RTK/new state framework |
| tests | JUnit Jupiter 5.11.3, Spring/Testcontainers, provider/consumer fixtures, Vitest range `^2.1.8` (lock 2.1.9), Playwright 1.61.1 | domain/codec/JDBC/race/resilience/component and U06 live/browser evidence |
| runtime | `scripts/wave-a-compose.mjs`, `linercore-wave-a` | isolated 18088; manager port 8088 probe-only |

## Significant decisions and alternatives

### Separate pricing sequence and immutable history

Only canonical pricing-input change advances `pricingAmendmentSeq`; all accepted
amendments advance general revision. New provider truth appends typed snapshots.
Rejected alternatives are overwriting one flattened price, using general revision
as provider key, pricing a historically selected row, or automatic reconfirm
pricing.

A completion-time mismatch is cause-sensitive while preserving the functional
rule that any frozen revision mismatch first returns `BOOKING_CHANGED` with no
append. Pricing-marker change permanently retires the old key and requires the
new sequence; revision-only change makes the same key immediately eligible for
an explicit higher-fence retry, which consumes Charge's terminal replay and
preserves the newer non-pricing aggregate state.

### Bilateral receipts without distributed transaction

Booking persists a local fenced operation around a no-transaction HTTP call;
Charge has its own durable receipt. Exact keys/body/correlation and replay bridge
lost responses. Rejected alternatives are XA, a new saga/broker/outbox event,
JVM lock, blind retry, or keeping a DB transaction open during HTTP.

### Minimal Resilience4j dependency introduction

The baseline and consumed `technology-stack.md` do not contain or pin
Resilience4j. U05 therefore explicitly introduces only `resilience4j-retry` and
`resilience4j-circuitbreaker` 2.2.0 in the Booking application-service module,
with their core transitive dependency. It does not add the Spring Boot starter,
AOP, bulkhead, rate limiter, time limiter, registry server, or shared platform
wrapper. Maven dependency-tree/lock evidence, Java 21/Spring Boot 3.3.7 compile
and tests, duplicate-class convergence, license/dependency and vulnerability
scans, and the exact deterministic retry/circuit clock tests are blocking.

### Validate but do not reconstruct provider truth

Booking verifies complete W2 structure and arithmetic, then stores exact enriched
truth. It does not calculate/round/substitute. Complete legacy responses retain
the existing path; partial W2 data fails. This preserves service ownership and
old snapshot compatibility.

### Existing UI region and local state

Requested date, Price/Reprice, itemisation/history and exception status stay in
the existing Booking pricing region. No new route, global state library, shared
component, shell, navigation, token, font, or palette is selected.

## Quality and release gates

Backend build/tests, changed-code coverage >=80%, Flyway/legacy codec, canonical
fingerprint/receipt codec, two-context race/fault/resilience matrices, provider/
consumer contracts, deterministic performance/capacity reports, security/
dependency/secret/redaction scans, frontend build/lint/type/component checks,
and `git diff --check` are blocking.

U06 owns live known agreement/tariff, successor Reprice, no-rate/manual, Booking-
visible breakdown/history, API/DB/correlation, responsive/accessibility
Playwright, both `demo:guard` calls, `aidlc-audit`, and `erp-fidelity-audit`.
Until observed, no live PASS is claimed and the W1 waiver remains explicit.

## Upstream coverage

This artifact explicitly consumes `business-logic-model.md`,
`business-rules.md`, `requirements.md`, and `technology-stack.md`, selecting only
the minimum brownfield stack for Booking consumption/repricing.
