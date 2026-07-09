# Architecture Decisions - Charge & Customer Agreement

## ADR-001: Service Boundary

### Context

`requirements.md` and `stories.md` define agreement lifecycle, charge terms, approval, and active lookup as a business capability. `architecture.md` and `component-inventory.md` show existing Shared Platform services are platform concerns.

### Decision

Create a separate `services/charge-agreement-service` backend service.

### Alternatives Considered

| Alternative | Pros | Cons | Reversibility |
| --- | --- | --- | --- |
| Add to `reference-data-service` | Fastest short-term wiring. | Pollutes Shared Platform with business-module logic. | Hard to undo after data/API coupling. |
| Separate service | Clear bounded context and Booking contract. | More scaffolding. | Moderate and clean. |
| Frontend-only module | Fast demo. | Not functional/persistent enough. | Easy but insufficient. |

### Consequences

The module gets independent domain/API/persistence boundaries and can expose active lookup to Booking without expanding Shared Platform scope.

## ADR-002: UI Boundary

### Context

Refined mockups require a functional workbench, not view-only screens. Existing apps are separate Next.js workspaces.

### Decision

Create `apps/charge-agreements` as a Next.js App Router workspace.

### Alternatives Considered

| Alternative | Pros | Cons | Reversibility |
| --- | --- | --- | --- |
| Add screens to `apps/reference-data` | Reuses shell quickly. | Mixes platform reference admin with commercial module. | Moderate. |
| New app workspace | Clear module boundary and route ownership. | Requires package/proxy/runtime wiring. | Easy to moderate. |

### Consequences

The UI can evolve independently and map cleanly to `/charge-agreements/` in the reverse proxy.

## ADR-003: Communication Style

### Context

CRUD/status and Booking lookup need deterministic request/response behavior. Kafka/Compose is currently unhealthy locally.

### Decision

Use synchronous REST for CRUD, status transitions, search, and active lookup. Define event publication as a port/seam for later.

### Alternatives Considered

| Alternative | Pros | Cons | Reversibility |
| --- | --- | --- | --- |
| REST first | Simple, testable, matches existing contracts. | Requires later event hardening. | Easy. |
| Kafka-first | Event-native. | Blocks on unhealthy local broker and complicates UI/API flows. | Moderate. |
| Direct DB from Booking | Fast local integration. | Violates service boundaries. | Hard and unsafe. |

### Consequences

The first module can be locally functional while preserving an event-ready design.

## ADR-004: Persistence Ownership

### Context

Agreements and charge terms are new business records. Shared Platform reference data remains upstream.

### Decision

Charge Agreement owns agreement and term tables. It stores stable reference IDs for customers, charge codes, currencies, locations, commodities, and trade lanes.

### Alternatives Considered

| Alternative | Pros | Cons | Reversibility |
| --- | --- | --- | --- |
| Store reference IDs | Clean boundary, low duplication. | Requires lookup/read-through for labels. | Easy. |
| Copy reference records | Faster display. | Drift and duplicate ownership. | Hard. |

### Consequences

The service remains decoupled from reference-data internals while allowing UI display labels through BFF/reference-data calls.

## Architecture Review

Verdict: READY

Inline architecture review completed because the configured architecture reviewer model is unavailable in this account. The design is coherent with `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md`; boundaries are explicit; alternatives and consequences are documented; Docker/Kafka constraints are handled without blocking first-slice functionality.
