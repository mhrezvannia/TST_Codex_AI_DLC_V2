# Build vs Buy Assessment — W2-03 Charge Tariffs & Agreements

This assessment applies only to the capability and boundaries in [`intent-statement.md`](../intent-capture/intent-statement.md). It does not authorize procurement or establish a decision for the entire Charge roadmap.

## Decision Summary

**Build the bounded W2-03 slice in LinerCore now.** The capability is part of Charge's canonical business authority, the repository already contains the agreement lifecycle and live Booking pricing seam, and the intended outcome depends on exact integration with LinerCore references, identity, Booking snapshots, UI, audit, and historical evidence. Buying a full suite would introduce a much larger operating-model and migration decision. Preserve a future partner/import seam and reassess when later breadth is approved.

## Decision Criteria

| Factor | Build bounded slice | Buy mature suite now | Partner/integrate later |
|---|---|---|---|
| Core domain authority | Strong: Charge remains canonical owner | Requires a new authority and precedence decision | Strong only if Charge remains canonical at the internal boundary |
| Existing assets | Reuses W0-02 references, W1 pricing seam, W2-01 shell/auth, and W2-02 UI baseline | Existing assets become integration/migration constraints | Reuses them if adapter stays behind Charge |
| Scope alignment | Exact: tariff, surcharge, local charge, agreement version, quote, reprice, no-rate | Poor: mature suites contain much more than W2-03 | Poor if done now; potentially good for a later breadth intent |
| Contract fidelity | Direct control over bilateral fields, errors, idempotency, and Booking snapshots | Requires semantic mapping and consumer migration | Can preserve fidelity through an anti-corruption adapter |
| Time/risk to observed DoD | Lowest relative path, though still a material feature | Unbounded without procurement and migration inputs | Deferred and unbounded without source selection |
| Advanced rating breadth | Deliberately limited | Strong | Potentially strong |
| Audit and evidence control | Native to the existing intent and Compose acceptance model | Requires suite evidence integration | Shared responsibility must be designed |
| Lock-in and exit cost | Internal maintenance burden; high reversibility at the API seam | Product and data-model lock-in risk | Adapter reduces but does not remove partner dependency |
| Costs | Engineering and ongoing maintenance; not numerically estimated | License, implementation, integration, and migration; not estimated | Partner plus adapter and operations; not estimated |

No numeric score is assigned because deal size, staffing, licensing, implementation duration, and operating costs were not provided. An ordinal evidence-based decision is more honest than fabricated precision.

## Why Build Wins for W2-03

1. **Ownership is already decided:** the Program Vision makes Charge the canonical owner of tariffs, surcharges, local charges, agreements, and calculation.
2. **The hard integration risk already exists in LinerCore:** W1-01 provides the live Booking request/response seam and Booking snapshot path; W2-03 must make their content real.
3. **The slice is intentionally thin:** trade lane × equipment type, flat per-container, USD, three charge codes. Mature suites demonstrate future breadth but are not needed to prove this authority.
4. **The proof is program-specific:** shared authentication, reference identities, Booking state, the shared shell, Playwright evidence, Wave A isolation, and both audits cannot be purchased as a generic feature.
5. **The boundary remains reversible:** a later import or external-agreement adapter can be added behind the Charge contract if broader needs justify it.

## What Not to Build in W2-03

- Generic rule engines for arbitrary dimensional rating.
- Public rate distribution, multi-carrier shopping, or spot marketplaces.
- Dynamic/yield optimization, rebate engines, or AI price recommendations.
- D&D rule/rate calculation, invoicing, or settlement.
- Multi-currency conversion or finance-ledger behavior.
- Vendor-neutral abstraction layers with no approved second implementation.

## Future Reassessment Triggers

Open a separate build-vs-buy/partner intent if one or more of these becomes an approved requirement:

- bulk ingestion or distribution of large external rate catalogs;
- commodity, weight, distance, scale, or many-equipment dimensional breadth beyond manageable domain rules;
- multi-company or multi-tenant commercial separation;
- optimizer or yield-management capability;
- a committed enterprise-suite strategy elsewhere in the organization;
- regulatory, data-residency, or support requirements the current team cannot meet;
- measured maintenance cost exceeding the value of owning the core domain.

## Partner-Seam Guardrails

If reassessment later chooses a partner:

- Charge remains the only provider seen by Booking unless a program-level ownership change is approved.
- Vendor identifiers and calculation concepts are translated behind an adapter; Booking contract names do not drift.
- Source rate/agreement version, import timestamp, vendor reference, and internal approved version remain auditable.
- No partner result bypasses LinerCore authorization, validation, no-rate/manual behavior, or immutable Booking snapshots.
- Provider/consumer contract tests and a live integration run remain mandatory.

## Sources

- [Oracle Transportation Management Rate Record](https://docs.oracle.com/en/cloud/saas/transportation/26c/otmol/planning/rate_manager/create_rate_record.htm)
- [Oracle Transportation Management Accessorials](https://docs.oracle.com/en/cloud/saas/transportation/26c/otmol/planning/rate_manager/accessorials.htm)
- [SAP Transportation Management Charge Calculation Overview](https://help.sap.com/docs/SAP_S4HANA_CLOUD/61e246f4b34c4e1790d8b7651c0b40a8/f27f08ac51b94c83b32790ee4c5c2776.html)
- [SAP freight-agreement integration API](https://help.sap.com/docs/SAP_S4HANA_CLOUD/61e246f4b34c4e1790d8b7651c0b40a8/e2fd938fbf554ac8b719c9207de81d5a.html)
- [DCSA Booking 2.0 documentation](https://dcsa.org/standards/booking/documentation-booking-2)

## Conclusion

The build decision confirms the already-approved slice; it does not expand it. W2-03 should deliver the minimal real pricing authority and preserve explicit seams for later breadth. Procurement, suite migration, and advanced rate management remain future program decisions backed by their own evidence and gates.
