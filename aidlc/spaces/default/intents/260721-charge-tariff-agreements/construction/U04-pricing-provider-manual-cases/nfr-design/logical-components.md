# Logical Components - U04 Pricing Provider and Manual Cases

## Component boundary

U04 evolves existing Charge modules. `PricingApiController`,
`ChargeAgreementApplicationService`, `PricingRequestRepository`, and
`ManualPricingCaseRepository` remain migration seams, decomposed behind ports
for selection, ownership, exact rendering, and manual evidence. No deployable
service/store is added.

## Request and authorization components

| Component | Responsibility |
| --- | --- |
| Pricing API adapter | media, bounds, idempotency, trusted service subject, exact response |
| Manual-case BFF/API | human session, exact read permission, bounded list/detail |
| Canonical request hasher | normalized snapshot and SHA-256 without raw logging |

Authorization precedes receipt/case access. Controllers contain no candidate,
fencing, or calculation logic.

## Pricing orchestration components

| Component | Responsibility |
| --- | --- |
| Pricing coordinator | claim/replay, bounded candidate snapshot, fenced completion |
| Agreement selector | U03 candidates, integrity, zero/one/ambiguity |
| Tariff selector | U01 BASE/SURCHARGE/LOCAL candidates and precedence |
| Calculator | ordered three-line scale-2 `HALF_UP` itemization |
| Terminal renderer | serialize approved 200/404/422 once |

Tariff selection is unreachable after agreement success, ambiguity, or
integrity error.

## Persistence components

| Port/adapter | Responsibility |
| --- | --- |
| Receipt repository | lookup, claim, fenced takeover/completion, exact evidence |
| Agreement/tariff repositories | bounded authoritative projections |
| Manual-case repository | canonical OPEN create-or-get, page, detail |
| PostgreSQL/Flyway adapter | U01-owned V4 constraints, indexes, byte/snapshot columns |

This replaces object-only `response_snapshot` and case-ID upsert as concurrency
mechanisms while retaining their ports as migration seams.

## Frontend components

Existing Next.js/React/TypeScript/Zod supplies a read-only manual-case page in
the shared operational shell: bounded filter/page model, semantic table, and
`?case=` detail panel. It adds no money edit, assignment, transition, real-time
subscription, RTK change, or shared UI ownership. Loading, empty, forbidden,
unavailable, and malformed states are explicit and accessible.

## Dependency and transaction flow

```text
Pricing API -> authorize -> hash -> Receipt claim/replay
  -> Agreement selector -> Tariff selector only on no agreement
  -> Calculator or manual reason -> Terminal renderer
  -> fenced transaction [optional Case create-or-get + exact Receipt]
  -> exact response

Manual BFF/API -> authorize -> Case repository -> bounded evidence
```

Candidate reads share one bounded read-only `REPEATABLE READ` transaction whose
first query establishes the commercial snapshot; rendering occurs after it
closes. Only terminal completion may couple case and receipt.

## Verification and traceability

Fakes/probes verify authorization-before-query, selection order, no resolver on
replay, claim/fence races, exact bytes, case convergence, and bounded queries.
PostgreSQL tests use two contexts; frontend tests cover permission, Zod schemas,
page bounds, and read-only states.

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.
