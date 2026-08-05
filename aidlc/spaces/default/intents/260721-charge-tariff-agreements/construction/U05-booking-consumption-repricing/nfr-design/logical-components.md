# Logical Components - U05 Booking Consumption and Repricing

## Component boundary

U05 decomposes the existing Booking `requestPricing` seam without changing its
route or deployable boundary. It keeps Java 21/Spring/JDBC/PostgreSQL and the
existing Booking Next.js region.

## Backend components

| Component | Responsibility |
| --- | --- |
| Pricing command facade | authorize, order capture/remote/completion, map exact outcome |
| Capture/claim bean | public transaction, validate/freeze, receipt replay/CAS/fence |
| Canonical input/receipt codecs | fixed UTF-8 JSON, SHA-256, schema-v1 payload |
| Resilient Charge adapter | fixed media/identity/key/body, exact failure predicates, bounded cancellation/retry/circuit, strict decoder |
| Completion bean | public transaction, lock/revalidate, append/evidence/audit/receipt |
| Pricing history query | current plus bounded typed cursor page and honest Legacy entry |
| Confirmation guard | current marker/fingerprint/sequence eligibility, no Charge call |

The facade is never transactional across the provider call.

## Persistence components

The Booking repository exposes locked aggregate reload and current-pointer CAS.
The widened idempotency adapter owns operation/body/state/owner/fence/lease/due/
payload/status/header/correlation/response revision. The typed snapshot adapter
is insert/read-only with canonical-byte collision comparison. Audit and receipt
complete in the same datasource transaction.

## Frontend components

The existing Booking detail server component loads current/first history page.
A focused pricing-region client component owns requested-date amendment,
Price/Reprice submission, pending prevention, selected historical entry, and
cursor navigation. `@erp/ui` supplies fields, buttons, table, badges, skeleton,
status/evidence, and errors; U05 adds no shell, route, palette, font, RTK, or
shared primitive.

Money shows exact lines/currency/basis/source reference; manual/outage states
show no total; Previous and Legacy evidence are explicit. Loading, empty,
denied, validation, in-progress, changed, conflict, provider-invalid, success,
and degraded states are stable, keyboard accessible, and responsive at
375/768/1024/1440.

## Interaction flow

```text
Booking UI/BFF -> authorize -> Pricing facade
  -> Capture/claim transaction -> replay OR frozen operation
  -> Resilient Charge adapter (no Booking transaction)
  -> Completion transaction [Booking + snapshot/evidence + audit + receipt]
  -> current Booking plus bounded history
```

Amendment is its own Booking transaction. Confirmation/reconfirmation consults
current markers only and never invokes pricing.

## Failure containment

Identity/provider failure cannot bypass authorization or mutate commercial
truth. Charge success without Booking completion is recovered bilaterally.
Booking changes fence stale completion. Circuit state affects admission only;
durable receipts govern replay/reclaim. Frontend errors cannot calculate,
confirm, or overwrite price.

## Verification and traceability

Unit seams support deterministic clocks, provider fixtures, codecs, circuit/
retry transitions, row/fence races, snapshot collisions, cursor pages, and
frontend state/a11y tests. U06 supplies live Compose/Playwright closure.

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.
