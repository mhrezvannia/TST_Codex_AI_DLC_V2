# Solution Landscape — W2-03 Charge Tariffs & Agreements

The comparison is anchored to [`intent-statement.md`](../intent-capture/intent-statement.md): one internal Charge-owned pricing slice, not a commercial competitor strategy or umbrella suite selection.

## Alternatives Compared

1. **Extend LinerCore Charge now:** add the distinct owned rates, agreement versioning, real calculation, Booking consumption, and operator evidence on the existing platform boundaries.
2. **Buy a mature transportation-management rating suite:** adopt a product such as Oracle Transportation Management or SAP Transportation Management for broader contract/rate/charge capabilities.
3. **Partner or integrate later:** retain LinerCore Charge as the program authority and introduce an approved external rate/agreement source behind a dedicated adapter or ingestion seam for later breadth.
4. **Status quo:** continue existing agreement terms and hardcoded/insufficiently owned pricing results. This is included only as a baseline and is not a viable target.

## Capability Comparison

Ratings describe fit for the approved W2-03 slice, not overall product quality.

| Criterion | Extend LinerCore | Buy mature suite | Partner/integrate later | Status quo |
|---|---|---|---|---|
| Exact W2-03 scope fit | Strong | Weak: substantially broader | Adequate after a separate integration decision | Absent |
| Charge canonical ownership | Strong | At risk without a new ownership decision | Strong if the adapter preserves Charge authority | Weak |
| Existing W0/W1/W2 seam reuse | Strong | Weak to adequate; migration/integration required | Strong at the internal boundary | Adequate but incomplete |
| Effective/versioned rate depth | Must be built in the slice | Strong | Depends on selected source and mapping | Weak |
| Distinct base/additional-charge modeling | Must be built in the slice | Strong | Depends on mapping fidelity | Weak |
| Itemised Booking result and immutable snapshot | Strong with focused implementation | Requires consumer integration and semantic mapping | Strong if the internal contract remains canonical | Weak |
| No-rate/manual operator workflow | Strong and contract-specific | Product-specific; likely customization | Strong at LinerCore boundary | Weak |
| Advanced dimensions and optimization | Deferred | Stronger breadth | Potential future strength | Absent |
| Procurement and migration burden | Low relative to alternatives; still non-trivial engineering | High and unassessed | Medium and deliberately deferred | Low but fails the intent |
| Wave A delivery risk | Contained by existing architecture and live proof | High due to scope and dependency expansion | High if pulled into W2-03; acceptable as a later intent | Fails DoD |

## Evidence from Mature Suites

### Oracle Transportation Management

Oracle's Rate Manager represents rates as contractual rate offerings and records, with effective and expiration dates, geographic and equipment constraints, base costs, surcharges, and accessorials. That confirms the W2-03 concepts are table stakes. It also illustrates the breadth W2-03 intentionally defers: weight, volume, distance, commodity, special-service, and other rating dimensions.

**Strength for later evaluation:** broad, mature rate-management and integration capability.

**Weakness for W2-03:** adopting the suite now would force procurement, canonical-data, integration, migration, and operating-model decisions that are outside the approved intent and could displace existing Charge/Booking ownership.

### SAP Transportation Management

SAP documents charge calculation from maintained rate tables and freight agreements, valid released agreements, automatic recalculation, additional charge lines, and an external freight-agreement API. These capabilities validate approved-version attribution and repricing as table stakes.

**Strength for later evaluation:** broad agreement, rate, recalculation, and integration support.

**Weakness for W2-03:** the suite is a wider transportation and settlement platform; adopting it is not a thin substitute for completing the existing Charge authority.

### Bounded partnership or integration

A future adapter could ingest externally maintained agreements or rate content while LinerCore retains canonical pricing-basis semantics, Booking contract fields, snapshots, authorization, and manual exception handling. This is an architectural option, not a W2-03 deliverable.

**Strength:** can add breadth without exposing vendor-specific models to Booking.

**Risk:** semantic impedance can obscure provenance or create two pricing authorities unless ownership and precedence are explicitly decided.

## Positioning and Differentiation

W2-03 should not try to differentiate through feature breadth. Its useful project-level differentiation is **contract-true operational coherence**:

- one accountable Charge authority over owned commercial data;
- exact integration with the existing Booking journey rather than a generic rate calculator;
- immutable agreement/rate/Booking snapshot attribution;
- visible itemised lines and manual exceptions in the shared operational shell;
- live evidence on the program's actual Compose stack and honest preservation of historical acceptance records.

This is narrower than a commercial transportation suite and intentionally so.

## Recommendation

Proceed with **Extend LinerCore Charge now** for the approved W2-03 slice. Preserve a clean Charge-owned import/integration boundary as a future option, but do not procure, emulate, or partially embed a full suite in this intent. Revisit buy/partner alternatives only when a later approved need requires material breadth such as bulk external rate distribution, many rating dimensions, optimization, or multi-company commercial operations.

## Sources

- [Oracle Transportation Management Rate Record](https://docs.oracle.com/en/cloud/saas/transportation/26c/otmol/planning/rate_manager/create_rate_record.htm)
- [Oracle Transportation Management Accessorials](https://docs.oracle.com/en/cloud/saas/transportation/26c/otmol/planning/rate_manager/accessorials.htm)
- [SAP Transportation Management Charge Calculation](https://help.sap.com/docs/SAP_TRANSPORTATION_MANAGEMENT/54cf405c9d9e4c96bf091967ea29d6a7/7546cc5219dcd142e10000000a4450e5.html)
- [SAP Transportation Management Charge Calculation Overview](https://help.sap.com/docs/SAP_S4HANA_CLOUD/61e246f4b34c4e1790d8b7651c0b40a8/f27f08ac51b94c83b32790ee4c5c2776.html)
- [SAP freight-agreement integration API](https://help.sap.com/docs/SAP_S4HANA_CLOUD/61e246f4b34c4e1790d8b7651c0b40a8/e2fd938fbf554ac8b719c9207de81d5a.html)

## Open Risks

- No vendor pricing, licensing, migration, data-residency, or implementation proposal was reviewed; no procurement conclusion is implied.
- Suite capabilities describe documented product behavior, not proof of fit for LinerCore's exact carrier-domain model.
- A future partner path would require an explicit source-of-truth decision, field-level mapping, dual sign-off, failure semantics, and live consumer proof.
