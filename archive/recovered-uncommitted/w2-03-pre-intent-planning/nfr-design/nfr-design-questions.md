# NFR Design Questions - W2-03 Charge Tariffs and Agreements

## Resolved Decisions

| Focus | Decision | Authority |
| --- | --- | --- |
| Pricing basis | Match one trade lane and equipment type, using flat per-container USD rates. | `docs/intents/W2-03-charge-tariffs-and-agreements.md` |
| Rate composition | Produce separate `FREIGHT`, `SURCHARGE`, and `LOCAL` lines with Shared Platform charge codes. | W2-03 statement and bilateral pricing contract |
| Agreement behavior | An approved agreement references immutable rate versions; a quote records the exact authority and versions used. | W2-03 DoD and audit mandate |
| No-match behavior | Return `MANUAL_PRICING_REQUIRED`; never manufacture a price or silently reuse an unrelated agreement term. | W2-03 DoD |
| Booking seam | Keep synchronous `pricing.request` / `pricing.result`, preserve contract field names, idempotency, and dual sign-off. | Bilateral pricing contract |
| Deployment target | Canonical local Compose first; cloud topology is not a W2-03 release condition. | Project and Construction rules |

## Ambiguity Analysis

No blocking ambiguity remains for this stage. Commodity classes, weight bands, D&D, and multi-currency conversion are explicitly deferred. The bilateral contract's 800 ms booking-time p99 is treated as a provisional design budget that must be measured and reconciled at live acceptance.

## Upstream Coverage

This aggregate resolution supplements the existing per-unit answers and consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md` across U01-U10.
