# Build vs Buy Assessment - LinerCore Enterprise

## Source Context

This artifact consumes `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/intent-capture/intent-statement.md` and market research sources for ocean booking, visibility, D&D, and standards.

## Decision Summary

Build the core LinerCore domain platform. Buy, adopt, or integrate commodity infrastructure and network-heavy capabilities where they do not weaken the carrier-owned domain model.

## Capability Assessment

| Capability | Build / Buy / Partner | Rationale |
|------------|------------------------|-----------|
| Shared Platform reference data | Build and harden existing MVP | Canonical ownership is central to the architecture and already partially exists. |
| Identity authentication | Buy/adopt with Keycloak | Authentication is delegated by enterprise standards; do not hand-model identity. |
| Authorization/capability model | Build | Carrier permissions and service authorization are domain/platform policy. |
| Kafka and Schema Registry | Buy/adopt infrastructure | Commodity infrastructure; configure and operate rather than reimplement. |
| Customer Agreement and tariffs | Build | Core commercial differentiation and source of truth. |
| Pricing determination and itemization | Build | Central business logic, audit, and downstream dependency. |
| D&D rules and calculation | Build | Charge owns free time, rates, and calculation; correctness is a carrier-specific commercial capability. |
| Booking lifecycle and orchestration | Build | Booking owns confirmation, amendments, pricing orchestration, D&D triggers, and exception queues. |
| Container movement management | Build | CMM owns journey state, movement validation, and status publication. |
| DCSA API/schema alignment | Adopt standard, build implementation | Standards reduce ambiguity; implementation must map to LinerCore domain. |
| External ocean booking networks | Partner/integrate later | Network reach is expensive to recreate; keep as integration seam. |
| Visibility data feeds | Partner/integrate where useful | External milestone enrichment can accelerate coverage; CMM remains source of operational state. |
| External finance | Partner/integrate | External system should be behind an anti-corruption adapter and contract tests. |
| Observability stack | Buy/adopt open-source stack | Use Prometheus/Grafana/ELK/Jaeger-style tooling per enterprise standards, not custom observability. |
| CI/CD and local runtime scripts | Build/configure | Required for deterministic local Windows execution and project-specific delivery. |
| Full enterprise UI | Build using Claude UI baseline | UI must map to real permissions, APIs, events, and flows; prototype logic cannot be copied. |

## Scoring

| Factor | Build score | Notes |
|--------|-------------|-------|
| Core differentiator | +2 | Pricing, booking, D&D, and CMM are the product. |
| Time to market | -1 | Building full enterprise scope is slower than adopting a SaaS suite. |
| Customization need | +2 | Carrier-specific rules, module ownership, local runtime, and explicit contracts require high fit. |
| Data sensitivity/control | +2 | Agreements, pricing, movement, audit, and identity require strong control. |
| Team ownership burden | -1 | Enterprise Operation, runtime, and integrations impose real maintenance cost. |
| Vendor substitution risk | +1 | Vendors cover slices, but no single product cleanly matches the required bounded-context design and local runtime. |

Net: build core domain, buy/adopt commodities, partner for network data/connectivity.

## Buy / Adopt Guardrails

- Buying must not introduce cross-module database access.
- Buying must not weaken the domain ownership rules: Booking triggers D&D; Charge calculates D&D; CMM reports movements.
- External data must enter through approved APIs/events/adapters with correlation IDs and audit evidence.
- SaaS-only capabilities cannot be required for the core local runtime.
- Any bought component must support deterministic test fixtures, local development stubs, and contract testing.

## Build Guardrails

- Do not rebuild correct Shared Platform MVP functionality unnecessarily.
- Do not build custom identity authentication when Keycloak is mandated.
- Do not build a generic global carrier network before the product needs external network scale.
- Do not call hardcoded fake pricing, fake movement, or placeholder APIs complete.
- Run reverse engineering before broad brownfield edits, using Graphify first and codebase-memory MCP if available.

## Recommendation

Proceed with the enterprise AI-DLC lifecycle as a build-first program for core domains:

1. Harden Shared Platform and contract infrastructure.
2. Complete Charge/Agreement and D&D rule/calculation ownership.
3. Build Booking as the lifecycle and orchestration owner.
4. Build CMM as the movement reporting and status owner.
5. Implement UI and local runtime against real module contracts.
6. Integrate partner/bought components only through explicit adapters and tests.
