<!-- WORKED EXAMPLE — vertical Units of Work for the Booking Quote-to-Cash intent. Contrast with the charge-agreement units, which were layer-based (U02 domain, U03 app-service, U04 persistence, U05 REST, U06 UI). Here every unit is a thin end-to-end increment. -->

# Units of Work — Booking Quote-to-Cash (thin vertical slice)

## Source Alignment

Consumes: `intent-statement.md` (this folder), the three enterprise contracts, `program-vision-document.md` §3–§5, the Booking/CMM knowledge-base entries, and the `domain-entities.md` template (DCSA field naming).

## Slicing Rule (do not remove)

Units are **vertical increments**, not architectural layers. Each unit after the skeleton moves one thin capability through every layer it needs (UI → API → domain → persistence → any cross-module seam) and its DoD is an **observed end-to-end behavior on the running stack** — never "layer X tests pass," never "without live proof." A unit whose DoD can be met without running the app is mis-sliced.

## Units

| Unit | Name | Vertical scope (layers) | Definition of Done (observed on live stack) |
|---|---|---|---|
| U01 | Walking skeleton | UI→API→domain→DB | On the running stack, the booking create form POSTs and a row persists; detail route renders it; health green. |
| U02 | DCSA booking aggregate + create/read | UI·API·domain·DB | Create a draft with `routing[]` (one leg, UN/LOCODE) + `equipment[]` (one line, `equipmentTypeCode`); detail page renders the real structure; **field names match booking.confirmed.avsc** (erp-fidelity-audit green). |
| U03 | Validate against live reference data | UI·API·domain·reference seam | In the running stack, validate calls reference-data-service live; a booking with an inactive port/party is rejected with the right reason; a valid one moves to VALIDATED. |
| U04 | Price via real Charge call | UI·API·Charge sync seam | Confirm on the running stack that Booking makes a **real HTTP** `pricing.request` to charge-agreement-service and stores the returned quote; UI shows the quote. |
| U05 | Confirm → real `booking.confirmed` event → CMM opens journey | UI·API·domain·**async event seam** | On the live stack, confirm emits `booking.confirmed` to the **real Kafka topic** (SR-validated, full `routing[]`+`equipment[]`); CMM consumes it and opens a journey row. **A placeholder publisher does NOT satisfy this DoD.** |
| U06 | Status event returns → Booking detail renders it | **async event seam**·domain·UI | CMM emits `containermovement.status`; Booking consumes (deduped on envelope id) and the detail page renders movement status; restart proves persistence + idempotency. |

## Cross-Module Seams In This Intent

- **U04** exercises `pricing.request`/`pricing.result` live (real HTTP to Charge). DoD requires the real call.
- **U05** exercises `booking.confirmed` live (real broker publish + real CMM consumer). Placeholder publisher forbidden.
- **U06** exercises `containermovement.status` live (real event back to Booking).

## Dependency DAG

```yaml
units:
  - id: U01
    depends_on: []
  - id: U02
    depends_on: [U01]
  - id: U03
    depends_on: [U02]
  - id: U04
    depends_on: [U03]
  - id: U05
    depends_on: [U04]
  - id: U06
    depends_on: [U05]
```

## Exit Gate

Intent `complete` only when U01→U06 have been driven as one continuous flow on the real Docker Compose runtime, and `aidlc-audit` + `erp-fidelity-audit` are green with evidence written to `artifacts/`.

## Open Questions

1. Should U05 and U06 be one unit (full round-trip) or two (out, then back)?
   - A. Two units — publish/consume out (U05), status return (U06) — smaller, safer increments (recommended)
   - B. One unit covering the full round-trip
   - X. Other
   - `[Answer]:`
