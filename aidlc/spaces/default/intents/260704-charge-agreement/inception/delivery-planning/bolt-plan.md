# Bolt Plan - Charge & Customer Agreement

## Source Alignment

This plan consumes `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`.

## Bolt Sequence

| Bolt | Units | Walking skeleton | Definition of Done | Confidence hypothesis | Expected demo |
| --- | --- | --- | --- | --- | --- |
| B01 | U01 | Yes | New backend service shell, new UI shell, health/page routes, package/Maven wiring compile. | The repo can host a new Charge Agreement service and UI without breaking Shared Platform. | Backend health endpoint and UI landing/workbench shell respond locally. |
| B02 | U02, U03 | No | Domain aggregate, lifecycle rules, charge-term validation, application service ports/use cases, tests pass. | Agreement lifecycle and active lookup logic are testable before adapters. | Unit tests show create/update/approve/suspend/expire and active lookup behavior. |
| B03 | U04, U05 | No | Persistence adapter, REST controller, OpenAPI contract, API tests/contract checks pass. | Backend can persist and expose agreement workflows. | API creates agreement, adds terms, approves, and returns active lookup. |
| B04 | U06, U07 | No | Functional UI workbench and BFF clients consume backend and Shared Platform reference data. | UI is not view-only and uses upstream reference data correctly. | Browser creates/edits/approves agreement and runs lookup preview. |
| B05 | U08, U09, U10 | No | Local runtime/seed/smoke/readiness, Booking handoff docs/examples, event seam tests. | Module is locally demonstrable and ready for Booking handoff. | Readiness evidence includes Charge Agreement checks and active lookup examples. |

## Construction Notes

1. B01 is gated as the walking skeleton.
2. After B01, use the autonomy ladder decision for remaining Bolts.
3. Docker recovery is not part of B01-B04 completion but remains visible for Operation readiness.
4. B05 must not claim full Compose parity unless Docker is healthy.
