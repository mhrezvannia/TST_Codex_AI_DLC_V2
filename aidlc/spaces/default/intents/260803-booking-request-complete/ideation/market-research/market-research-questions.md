# Market Research Questions — W3-04 Booking Request Completeness

## Research positioning decisions

1. Which solution categories should the competitive scan compare?
   - A. Ocean-carrier booking portals, digital forwarding/TMS suites, and DCSA-aligned standards or ecosystem solutions (recommended)
   - B. Ocean-carrier portals only
   - C. Enterprise TMS suites only
   - X. Other
   - `[Answer]: A — Three categories.`

2. Which comparison lens matters most for W3-04?
   - A. Commercial field completeness, canonical validation, schedule authority, equipment quantity without premature assignment, exact pricing/confirmation seams, recoverability, and accessibility (recommended)
   - B. Total feature count across each product
   - C. Visual polish and interaction speed only
   - X. Other
   - `[Answer]: A — Operational fidelity.`

3. How should table stakes and differentiation be framed?
   - A. Complete validated booking data and schedule visibility are table stakes; exact cross-module fidelity, explicit degraded states, non-fabricated assignments, and auditability are differentiators (recommended)
   - B. Treat every W3-04 capability as table stakes with no differentiation claim
   - C. Treat fastest possible data entry as the only differentiator
   - X. Other
   - `[Answer]: A — Trustworthy operations.`

4. What build-vs-buy posture should the assessment test?
   - A. Build the Booking-owned workflow on the existing LinerCore platform while reusing standards, canonical reference sources, and approved connectors; do not replace the core with SaaS (recommended)
   - B. Buy a booking-management SaaS and migrate the workflow
   - C. Partner with or embed an external booking portal as the primary workflow
   - X. Other
   - `[Answer]: A — Build the Booking-owned core.`

5. What addressable audience should this feature optimize for?
   - A. Internal booking-desk and customer-service users first, with Charge/CMM/support as secondary consumers and external shipper self-service deferred (recommended)
   - B. External shipper self-service first
   - C. Carrier-partner users first
   - X. Other
   - `[Answer]: A — Internal booking users first.`

6. How deep should the economic comparison go?
   - A. Qualitative total-cost, integration, control, compliance, migration, and lock-in analysis; do not invent unavailable vendor prices (recommended)
   - B. Estimate vendor licensing from public list prices even when scope and terms are not comparable
   - C. Omit economic considerations
   - X. Other
   - `[Answer]: A — Qualitative TCO without invented prices.`

7. What evidence standard should govern market claims?
   - A. Current official standards, carrier/product documentation, and primary vendor sources; clearly label inference and avoid unsupported marketing claims (recommended)
   - B. Secondary analyst summaries are sufficient for all claims
   - C. Use only the repository context without current external evidence
   - X. Other
   - `[Answer]: A — Current primary sources with explicit inference labels.`

## Ambiguity and contradiction analysis

- Every `[Answer]:` tag is resolved; no positioning decision remains open.
- The `intent-statement.md` defines an internal operational capability, so “addressable market” is interpreted as the internal booking-desk/customer-service audience and affected platform consumers, not a speculative external revenue TAM.
- The build-core posture does not mean build every dependency. W3-04 continues to reuse the existing shared shell, Reference Data OHS, Charge provider, published event contract, standards, and approved connectivity seams.
- Market evidence is used to establish table stakes and risk, not to expand scope. Reefer/DG, multi-leg, physical container assignment, shipping instructions, and eBL remain in their named future intents.
- Vendor pages describe capabilities but do not supply a directly comparable W3-04 price card. The economic assessment therefore remains qualitative and labels comparative judgments as inference.
