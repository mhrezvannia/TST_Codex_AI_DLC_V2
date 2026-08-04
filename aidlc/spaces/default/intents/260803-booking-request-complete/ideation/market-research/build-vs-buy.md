# Build vs Buy Assessment — W3-04 Booking Request Completeness

## Decision Context

The approved `intent-statement.md` is a brownfield vertical feature on an existing LinerCore program. W1-01, W0-02, W2-02, and W2-03 have already established the live Booking spine, canonical references, shared shell, and live pricing provider. The decision is therefore not greenfield “which booking product should the company adopt?” It is whether W3-04 should extend that owned core, replace it, or route the primary workflow through a partner.

## Options Assessed

### Option A — Build the Booking-owned core on LinerCore

Extend the existing Booking aggregate, API, persistence, canonical UI, live Reference Data validation, Charge seam, and `booking.confirmed` contract. Reuse DCSA terminology and public specifications, existing platform primitives, and approved external connectivity where applicable.

### Option B — Buy an enterprise booking/TMS product

Adopt a broad product such as CargoWise or SAP TM as the system of engagement or record for this workflow, then integrate or migrate existing LinerCore modules.

### Option C — Partner with or embed a carrier/booking portal

Make an external carrier portal or connectivity provider the primary request experience and synchronize results back into LinerCore.

### Option D — Hybrid reuse

Keep LinerCore as the Booking-owned system and selectively buy or partner for non-differentiating capabilities such as reference feeds, carrier connectivity, standards tooling, or future multi-carrier exchange.

## Qualitative Decision Matrix

Ratings are comparative inferences from the approved internal context and cited official product capabilities; they are not vendor commitments.

| Criterion | A. Build core | B. Buy TMS | C. Partner/embed | D. Hybrid reuse |
|---|---:|---:|---:|---:|
| Fits closed LinerCore dependencies | High | Low | Medium-Low | High |
| Preserves Booking/Charge/CMM ownership | High | Low-Medium | Medium | High |
| Delivers only W3-04 scope | High | Low | Medium | High |
| Time lost to migration/integration | Low-Medium | High | Medium-High | Medium |
| Control of exact pricing/event contracts | High | Medium-Low | Low-Medium | High |
| Avoids vendor lock-in | High | Low | Medium-Low | Medium-High |
| Gains broad out-of-box logistics breadth | Low | High | Medium | Medium |
| Supports future selective connectivity | Medium | High | High | High |

## Cost and Commercial Considerations

- **Build core:** incurs engineering, migration, test, and operational ownership, but those costs extend assets already funded and proven in closed intents. The incremental work is bounded to the vertical slice.
- **Buy TMS:** adds license, implementation, configuration, data migration, integration, training, and operating-model change. Official CargoWise and SAP pages demonstrate broad ocean capability but do not provide a directly comparable W3-04 price card; inventing a license estimate would be misleading.
- **Partner/embed:** may reduce some front-door development but introduces identity, UX, data-provenance, contract, support, and availability coupling. Carrier portals are also tied to their own commercial networks and cannot serve as neutral replacements for LinerCore’s internal multi-module record.
- **Hybrid reuse:** retains core ownership while allowing future purchased connectivity or reference feeds where they genuinely reduce undifferentiated work.

Official capability references: [CargoWise Ocean](https://www.cargowise.com/solutions/cargowise-forwarding/ocean/), [CargoWise carrier connectivity](https://cargowise.com/solutions/cargowise-carrier/carrier-connectivity/), [SAP freight-booking process](https://help.sap.com/docs/business-network-freight-collaboration/application-help/freight-booking-process), and [DCSA Booking 2.0 documentation](https://dcsa.org/standards/booking/documentation-booking-2).

## Recommendation

Choose **Option A with Option D discipline**: build the Booking-owned W3-04 core on LinerCore and reuse standards, existing services, and approved connectors. Do not buy or embed a replacement booking product for this intent.

This recommendation follows from five facts:

1. The prerequisite platform seams are already closed and live.
2. W3-04’s differentiating value is exact behavior across those seams, which a replacement would have to re-integrate.
3. Enterprise suites solve a much broader problem and would import migration and operating-model scope disproportionate to one feature.
4. Carrier portals validate table stakes but are carrier-specific sales channels, not neutral internal Booking systems.
5. DCSA supplies the shared language and interface guidance without requiring product replacement.

## What to Build, Reuse, and Defer

**Build now**

- Booking field dictionary, typed completeness rules, schedule provenance/snapshot, quantity without initial assignment, safe legacy upcast, exact pricing mapping, minimal confirmation compatibility, and governed operational UI states.

**Reuse now**

- LinerCore shared shell and `@erp/ui`; Reference Data OHS; Charge provider; published `booking.confirmed`; DCSA-aligned names; UN/LOCODE and ISO equipment codes; existing audit and live-proof mechanisms.

**Evaluate later**

- Multi-carrier connectivity or marketplace services, advanced TMS planning, external customer portal capability, eFTI-certified exchange, shipping instructions/eBL tooling, and special-cargo modules—only within their owning future intents.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Underestimating enterprise-suite capabilities | Treat CargoWise/SAP as benchmarks and revisit only if program strategy changes from owned platform to suite adoption |
| Rebuilding standards or reference masters | Conform to DCSA naming and consume live canonical services; do not copy master data |
| Internal build drifts from market table stakes | Freeze the approved dictionary and prove the live create → validate → price → confirm → reopen journey |
| Hybrid reuse becomes uncontrolled vendor coupling | Require explicit ownership, data, availability, versioning, and exit contracts for any purchased connector |
| Future external-user needs invalidate internal UX assumptions | Keep external self-service deferred and run new discovery before exposing the workflow outside the internal shell |

## Revisit Triggers

Reopen build-vs-buy only if one of the following occurs: the program adopts an enterprise TMS as strategic system of record; an external multi-carrier marketplace becomes a funded requirement; required carrier connectivity cannot be delivered through approved contracts; regulatory certification creates a non-economic build burden; or total ownership evidence materially exceeds an approved commercial alternative.
