# Build-vs-Buy Assessment — W3-01 D&D Rules & Rates

**Upstream:** [W3-01 intent statement](../intent-capture/intent-statement.md)

## Options assessed

| Option | Benefits | Material limitations | Fit for W3-01 |
| --- | --- | --- | --- |
| Build as an additive Charge vertical | Preserves W2-03 contracts and source ownership; exact agreement/rate version lineage; bounded provider API; testable fixture and live-stack evidence. | Requires implementation of D&D model, calculation, port-local calendar handling, and operational UI. | **Select.** It is the only option that preserves the approved pricing authority and intended W3-02 provider boundary. |
| Buy a full D&D platform | Could provide mature alerts, dashboards, and external-data integrations. Focused tools show these are available capabilities. [CocoonDEM](https://www.demurrage-charges.com/) | Duplicates contract/rate authority, makes version attribution and semantic fit uncertain, adds procurement/integration risk, and risks expanding the release into migration. | Reject for this vertical. Reconsider only after authority is live and a measured gap exists. |
| Partner for a narrow input service | A maintained holiday feed or external event feed could reduce later operational burden. DCSA documents an interoperable event direction. [DCSA Track & Trace](https://dcsa.org/standards/track-and-trace) | Data quality, locality, licensing, availability, and fallback behavior still require product ownership; cannot decide pricing rules. | Defer. Allow only behind an adapter with deterministic fallback and no change to the Charge provider contract. |
| Retain manual/spreadsheet process | Lowest immediate delivery effort. | Fails reproducibility, auditability, API reuse, and live acceptance; invites inconsistent interpretation of contract changes. | Reject. |

## Recommendation and guardrails

Build the minimal Charge-owned D&D authority now. It should be additive to the approved W2-03 model and public contracts: model only rule/rate terms required by the statement; select terms via the existing Agreement and Rate version lineage; calculate by declared calendar and progressive bands; expose a documented provider endpoint with a complete explanation.

The following guardrails make “build” deliberately narrow:

- No migration or replacement of W2-03 Rate, RateVersion, Agreement, AgreementVersion, or the established `pricing.v1` contract.
- No Booking-side invoice trigger in W3-01; W3-02 consumes the approved provider contract rather than Charge internals.
- No external vendor becomes a source of pricing truth. A future adapter may enrich a calendar/event input but must record its source and preserve deterministic replay.
- Acceptance must include provider and consumer-signed API fixtures, Compose-stack evidence, `aidlc-audit`, and `erp-fidelity-audit`.

## Revisit criteria

Re-open buy/partner analysis only if live evidence shows a measured non-core gap that cannot be met by the bounded vertical—such as maintained jurisdictional calendars or external event coverage—and the proposed integration can demonstrate contract compatibility, deterministic fallback, data provenance, and no regression to W2-03 pricing ownership.

