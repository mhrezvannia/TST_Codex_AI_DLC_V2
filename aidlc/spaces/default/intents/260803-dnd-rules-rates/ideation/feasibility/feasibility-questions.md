# Feasibility Questions - W3-01 D&D Rules & Rates

**Upstream inputs:** [Intent statement](../intent-capture/intent-statement.md), [competitive analysis](../market-research/competitive-analysis.md), [market trends](../market-research/market-trends.md), and [build-vs-buy assessment](../market-research/build-vs-buy.md)

## Q1. Delivery boundary

Which technical boundary should feasibility assess as fixed for W3-01?

- A. Charge-owned additive D&D terms and provider API; W2-03 pricing contracts stay stable; W3-02 remains a downstream consumer (recommended)
- B. Expand to include Booking triggering and invoice issuance in W3-01
- C. Replace the W2-03 pricing model while adding D&D
- X. Other (please specify)

`[Answer]: Charge provider (Recommended)`

## Q2. Calendar and jurisdiction assumptions

What is the minimum safe holiday/calendar posture for the slice?

- A. Port-local calendar-day calculation with explicit configured calendars and documented fallback; defer external holiday provider selection (recommended)
- B. Use UTC calendar days universally
- C. Integrate an external holiday provider before delivering calculation
- X. Other (please specify)

`[Answer]: Configured port calendars (Recommended)`

## Q3. Compliance framing

How should the FMC/OSRA research be handled?

- A. Treat it as an evidence and lineage requirement for later invoice workflows, not a claim of full legal compliance in W3-01 (recommended)
- B. Declare the calculation endpoint legally compliant for all D&D invoices
- C. Exclude regulatory evidence from this intent
- X. Other (please specify)

`[Answer]: Evidence, not certification (Recommended)`

## Q4. Platform and delivery constraints

What deployment/platform assumption should govern the feasibility assessment?

- A. Reuse the existing Compose-first local stack and established services; no new AWS account/service is required for W3-01 (recommended)
- B. Require a new managed AWS calculation service before implementation
- C. Treat production cloud topology as a prerequisite for the feature
- X. Other (please specify)

`[Answer]: Reuse Compose stack (Recommended)`

## Q5. Acceptance evidence

Which evidence threshold is non-negotiable for the vertical?

- A. Provider and consumer signed API fixtures, live Compose acceptance, aidlc-audit, and erp-fidelity-audit green (recommended)
- B. Unit tests and screenshots only
- C. API documentation review only
- X. Other (please specify)

`[Answer]: Live fixtures and audits (Recommended)`

## Q6. Schedule/blocker posture

What should be considered a release blocker?

- A. Any break to W2-03 pricing contracts, non-reproducible result, missing cross-service fixtures, or failed live/audit evidence (recommended)
- B. Only a build failure
- C. No blocker until W3-02 starts
- X. Other (please specify)

`[Answer]: Contracts or evidence (Recommended)`
