# Application Design Questions — W2-03 Charge Tariffs & Agreements

## Upstream and Brownfield Basis

This plan derives from reviewed [`requirements.md`](../requirements-analysis/requirements.md), [`stories.md`](../user-stories/stories.md), brownfield [`architecture.md`](../../../../codekb/TST_Codex_W2-03/architecture.md), [`component-inventory.md`](../../../../codekb/TST_Codex_W2-03/component-inventory.md), and [`team-practices.md`](../practices-discovery/team-practices.md), plus the approved Refined Mockups artifacts. The code graph confirms an existing Charge service with agreement/pricing/idempotency/manual-case seams, a Booking `ChargePricingPortAdapter` and snapshot codec, and a minimal Charge workbench; design extends those seams rather than creating a new umbrella service.

## Architecture Options and Questions

### Q1 — Component Boundary

Where should W2-03 behavior live?

- A. Extend existing Charge domain/application/adapters, Booking pricing port/snapshot, and Charge-owned UI/BFF **(Recommended)** — preserves bounded contexts and deployment topology; moderate brownfield change; reversible internally.
- B. Create a new generic pricing microservice — independent but duplicates Charge authority and adds operational/cross-service complexity.
- C. Put pricing logic in Booking — simplest call path but violates Charge ownership and future D&D authority.

[Answer]: A — Extend existing Charge domain/application/adapters, Booking pricing port/snapshot, and Charge-owned UI/BFF.

### Q2 — Rate and Agreement Model

How should commercial authority be modeled?

- A. Separate versioned Rate aggregates (BASE/SURCHARGE/LOCAL) with immutable Approved versions; Agreement versions link exact Approved rate-version IDs **(Recommended)** — supports tariff reuse/fallback and attribution; requires additive schema/approval guards.
- B. Embed copied rate amounts only inside agreements — simpler agreement pricing but cannot cleanly support standalone tariff fallback or source versions.
- C. Introduce a generic rules engine — flexible but far beyond the flat per-container slice.

[Answer]: A — Separate versioned Rate aggregates with immutable Approved versions; Agreement versions link exact Approved rate-version IDs.

### Q3 — Pricing Contract Evolution

How should Booking-time pricing evolve?

- A. Additive evolution of `contracts/openapi/pricing.v1.yaml` and canonical `POST /pricing-requests`, synchronized provider/Booking consumer evidence **(Recommended)** — backward compatible; requires dual-decode/testing.
- B. New `/v2/pricing` endpoint — isolates change but creates parallel authorities and migration overhead.
- C. Keep wire response opaque and reconstruct lines in Booking — avoids contract change but loses provider truth/provenance.

[Answer]: A — Evolve `contracts/openapi/pricing.v1.yaml` and canonical `POST /pricing-requests` additively with synchronized provider/consumer evidence.

### Q4 — Persistence Strategy

How should new commercial and snapshot data persist?

- A. Ordered additive Flyway tables/columns in each service-owned PostgreSQL database, deterministic backfill, and legacy Booking snapshot decode **(Recommended)** — matches preservation/rollback evidence; more migration/test work.
- B. Continue Charge SQL-init and overwrite Booking flattened maps — smaller patch but violates migration and immutable-history requirements.
- C. Event-source the aggregates — strong history but unjustified architecture expansion.

[Answer]: A — Use ordered additive Flyway migrations in each service-owned PostgreSQL database, deterministic backfill, and legacy Booking snapshot decoding.

### Q5 — UI and BFF Structure

How should the eight Charge routes be implemented?

- A. Next.js App Router pages/loading boundaries + authenticated BFF route handlers + Charge-local domain compositions over existing `@erp/ui`; DS-01/02/03 stay named W2-02 integration dependencies **(Recommended)**
- B. One client-side workbench with direct backend calls — preserves current shape but violates stable routes/BFF and state evidence.
- C. Extend `packages/ui` and shared shell from W2-03 — may close gaps but violates Wave A ownership.

[Answer]: A — Use Next.js App Router pages/loading boundaries, authenticated BFF route handlers, and Charge-local domain compositions over existing `@erp/ui`; retain DS-01/02/03 as W2-02 dependencies.

### Q6 — Pricing/Repricing Orchestration and Runtime

Which orchestration/topology should remain authoritative?

- A. Booking explicitly orchestrates synchronous Charge pricing/repricing through its existing port; Charge performs deterministic all-or-nothing resolution; keep current services and isolated Compose, no new AWS resources **(Recommended)**
- B. Publish an async pricing event and update Booking later — decouples services but contradicts the canonical synchronous critical-path contract.
- C. Move orchestration to a new workflow engine — adds scope, service, and operational burden.

[Answer]: A — Booking explicitly orchestrates synchronous pricing/repricing through its existing Charge port; retain the current services and isolated Compose topology with no new AWS resources.

## Ambiguity Check

All six answers select concrete Option A boundaries. No vague qualifiers, internal contradictions, or missing topology decisions remain. Significant choices and rejected alternatives are recorded in `decisions.md`.
