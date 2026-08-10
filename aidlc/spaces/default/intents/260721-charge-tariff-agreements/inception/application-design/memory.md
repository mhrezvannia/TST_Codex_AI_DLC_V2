# Application Design Memory

## Interpretations

- 2026-07-21T19:36:00Z — treated AWS guidance as portable Well-Architected validation only; W2-03 has no approved AWS deployment, account, region, IaC, or production-topology scope and remains on the existing isolated Compose topology.

## Deviations

- 2026-07-21T19:35:00Z — restored the missing Application Design memory scaffold after engine advancement; artifact and state transitions remain governed by the AI-DLC tools.

## Tradeoffs

- 2026-07-21T20:18:00Z — retained existing v1 numeric/category/date fields and made the enriched provider set optional-in-schema but all-or-none at runtime; this preserves old-consumer validation while making partial enriched success invalid.
- 2026-07-21T20:18:00Z — selected Booking-local manual-required outage evidence after one retry/circuit-open; Charge OPEN cases remain restricted to no-rate/ambiguity.

## Open questions

- Architecture reviews 1 and 2 were both NOT-READY. Iteration 1's five blockers were remediated; iteration 2's circuit-composition and commodity-key contradictions were corrected after the two-review limit. Both verdicts remain explicit pending the human gate.
