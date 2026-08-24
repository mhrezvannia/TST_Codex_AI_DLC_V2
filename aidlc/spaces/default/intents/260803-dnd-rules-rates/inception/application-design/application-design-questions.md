# Application Design Questions — W3-01 D&D Rules and Rates

## Upstream and Brownfield Basis

This question set derives from the approved [`requirements.md`](../requirements-analysis/requirements.md), [`stories.md`](../user-stories/stories.md), Refined Mockups, brownfield [`architecture.md`](../../../../codekb/TST_Codex_W3-01/architecture.md), [`component-inventory.md`](../../../../codekb/TST_Codex_W3-01/component-inventory.md), and [`team-practices.md`](../practices-discovery/team-practices.md). The approved W2-03 pricing contracts remain binding. The design extends the existing Charge domain/application/JDBC/BFF/UI seams and current Compose topology; it does not introduce a new service, shared-shell change, `@erp/ui` fork, cloud resource, or Booking/CMM runtime trigger.

## Interaction Mode

### Q0 — How should we resolve the design questions?

- A. Guide me through the decisions in short batches **(Recommended)** — highest review clarity and preserves explicit decision evidence.
- B. Show all questions together — faster single review, with more information to assess at once.
- C. Apply every recommended option — fastest, while still recording each recommendation and rationale for the final approval gate.

[Answer]: A — Guide me through the decisions in short batches.

## Architecture Options and Questions

### Q1 — D&D Commercial Aggregate

How should D&D terms be represented inside the existing Charge bounded context?

- A. Add a dedicated versioned `DndTerms` aggregate patterned after W2-03 Rate lifecycle **(Recommended)** — preserves Draft/Approved/successor invariants while keeping DCSA rule semantics, free days, port-local dates, basis snapshots, and relationship lineage cohesive.
- B. Extend the generic W2-03 `Rate` aggregate with D&D-specific fields — reuses more code but couples materially different authority models and risks the approved W2-03 contract.
- C. Expand the legacy three-field `DndRule` placeholder — smallest initial patch but cannot satisfy versioning, applicability, provenance, concurrency, or relationship requirements.

[Answer]: A — Add a dedicated versioned `DndTerms` aggregate patterned after W2-03 Rate lifecycle.

### Q2 — Authorization Resource

Which capability family should protect D&D terms?

- A. Reuse the existing `charge-rates` read/create/edit/approve/create-successor capabilities **(Recommended)** — preserves the approved W2-03 identity and permission boundary without inventing a new entitlement model.
- B. Add a new `dnd-terms` capability family — supports finer-grained future delegation but expands policy, seed, BFF, and acceptance scope.

[Answer]: A — Reuse the existing `charge-rates` read/create/edit/approve/create-successor capabilities.

### Q3 — Port-local Calendar Authority

Where should the Charge service obtain the IANA timezone required for port-local calendar-day calculations?

- A. Add a validated `timeZoneId` attribute to the existing Reference Data `LOCATION` record and consume it through a Charge-owned `PortTimeZoneProvider` **(Recommended)** — keeps port metadata in Reference Data, uses the existing generic attributes seam, and fails closed when missing or invalid.
- B. Store a copied timezone on every D&D terms version — improves calculation isolation but duplicates port authority and requires explicit refresh semantics.
- C. Maintain a Charge-local port/timezone mapping — avoids a Reference Data change but creates a second port master and ownership conflict.

[Answer]: A — Add a validated `timeZoneId` attribute to the existing Reference Data `LOCATION` record and consume it through a Charge-owned `PortTimeZoneProvider`.

### Q4 — D&D Pricing Idempotency Store

How should `POST /dnd-pricing-requests` preserve request identity and terminal replay?

- A. Extend the existing Charge pricing receipt claim/lease/completion pattern with an explicit operation namespace and D&D response payload **(Recommended)** — reuses proven concurrency semantics while keeping W2-03 keys and payloads isolated.
- B. Create an entirely separate D&D receipt mechanism — stronger physical isolation but duplicates tricky claim, takeover, replay, conflict, and completion logic.
- C. Use only an in-memory cache — does not survive restart and cannot meet durable exactly-once terminal replay.

[Answer]: A — Extend the existing Charge pricing receipt claim/lease/completion pattern with an explicit operation namespace and D&D response payload.

### Q5 — Stable Route and Identifier Shape

Which logical route family should Application Design finalize?

- A. Use the approved combined family `/charge-agreements/dnd/terms`, `/new`, and `/[dndTermsId]`, with edit as `?mode=edit` and successor as `/successor` **(Recommended)** — matches Refined Mockups, keeps one resource identity, and follows the existing W2-03 route conventions.
- B. Split `/dnd/rules` and `/dnd/rates` — contradicts the approved combined commercial object and duplicates lifecycle screens.
- C. Reuse `/rates?kind=dnd` — hides D&D-specific semantics inside the generic rate surface and weakens task-oriented navigation.

[Answer]: A — Use `/charge-agreements/dnd/terms`, `/new`, and `/[dndTermsId]`, with edit as `?mode=edit` and successor as `/successor`.

## Ambiguity Check

All five architecture answers select concrete Option A boundaries. No vague qualifiers or cross-answer contradictions remain. Charge owns D&D commercial authority and synchronous calculation; Reference Data owns port timezone metadata; the existing identity boundary and deployment topology remain unchanged; D&D receipt identities and payloads are isolated by an explicit operation namespace; and the stable combined route family is final. Exact API schemas, database constraints, method contracts, failure envelopes, and rollback mechanics are specified in the Application Design artifacts rather than left as open decisions.
