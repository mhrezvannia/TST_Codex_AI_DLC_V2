# Feasibility Assessment — W3-04 Booking Request Completeness

## Executive Determination

**Decision: CONDITIONAL GO.** W3-04 is technically, operationally, and organizationally feasible as an additive brownfield feature on the existing LinerCore platform. No new public cloud, infrastructure service, or product purchase is required. The principal work is to replace thin W1 booking invariants coherently across UI, API, domain, persistence, live reference validation, exact pricing, and confirmation contracts.

The GO remains conditional on five proofs: freeze the field dictionary before Application Design; add authoritative cargo-cutoff/documentation-deadline facts to the Shared Platform voyage contract or explicitly narrow the approved schedule scope; migrate legacy booking snapshots without invention; preserve backward-compatible pricing and `booking.confirmed` contracts; and retain live/audit exit gates.

## Inputs and Evidence Reviewed

- `intent-statement.md` — approved business outcome, commercial baseline, schedule model, seams, and observed DoD.
- `competitive-analysis.md` — market table stakes and trustworthy-operations differentiation.
- `market-trends.md` — structured booking data, integrated schedules/pricing, API interoperability, audit, privacy, and weight-lifecycle trends.
- `build-vs-buy.md` — build the Booking-owned core with selective standards/connectivity reuse.
- Binding environment: `docs/enterprise-technical-environment.md`, root `compose.yaml`, and current infrastructure files.
- Indexed brownfield entry points for Booking aggregate/API/UI, snapshot persistence, Reference Data voyage projection, Charge quantity calculation, and Kafka booking confirmation mapping.

## Business and Product Feasibility

The approved slice has a clear internal customer, measurable live outcome, and closed dependencies. Carrier and enterprise-platform evidence confirms that commodity, equipment type/quantity, weight, requested departure, schedule choice, and reviewable pricing are normal commercial expectations. W3-04 therefore closes a real usability gap without requiring a speculative market bet.

Scope remains controlled: one FCL-dry route, one requested equipment line, USD, no initial physical container, and no reefer/DG, shipping instructions, multi-leg, external self-service, or documentation breadth. Approximately five vertical units remain credible at Standard depth.

## Technical Feasibility

| Area | Current evidence | Required W3-04 change | Feasibility |
|---|---|---|---|
| Booking aggregate | Already holds typed routing/equipment collections and a requested-departure attribute, but `EquipmentAssignment` requires quantity `1` and a valid physical identifier | Separate equipment request from later physical assignment; allow positive quantity and absent `equipmentId`; add typed party/cargo/schedule facts and completeness rules | Feasible, medium-high change concentration |
| API/BFF/shared types | Create requests and responses already carry routing/equipment; both create forms and shared draft validation force physical identifier/quantity `1` | Add the frozen dictionary and typed errors; preserve existing fields additively during compatibility window | Feasible |
| Persistence | `booking_records` stores relational projections plus versioned JSON snapshot; snapshot migration ledger already exists | Introduce the next snapshot version, additive projections/indexes only where justified, safe codec/upcast, and explicit incompleteness | Feasible; migration proof required |
| Reference Data | Live canonical sets and voyage projection exist; voyage includes carrier number, locations, scheduled departure/arrival | Add authoritative cargo cutoff and documentation deadline to the typed voyage model, OHS/event fixtures, seeds, and validation—or reopen schedule scope | Feasible Shared Platform contribution; release condition |
| Pricing | Live provider already calculates by quantity and accepts date/quantity-aware requests | Map the exact confirmed party/commodity/POL/POD/type/date/quantity basis and preserve contract failures/repricing semantics | Feasible; contract proof required |
| Confirmation event | Published schema supports equipment type, quantity, and optional/later identifier; mapper passes nullable values | Ensure domain/event payload omits rather than fabricates `equipmentId`, retain full routing/equipment and BACKWARD compatibility | Feasible |
| UI | Reviewed shared-shell Booking create/detail patterns and shared design system already exist | Extend page composition and state model through `@erp/ui`; no new shell or local theme | Feasible; Refined Mockups gate required later |

## Integration Feasibility

The architecture already uses the exact styles W3-04 needs:

- Browser → Next.js BFF → Booking REST for authenticated synchronous UI work.
- Booking → Reference Data OHS for canonical validation.
- Booking → Charge REST for strongly consistent pricing, with Pact coverage.
- Booking → Kafka/Avro `booking.confirmed` for downstream CMM, with Schema Registry compatibility.

No shared database or duplicated master is necessary. The cutoffs/deadline gap is the only newly discovered contract contribution. Because Reference Data persists a generic attribute snapshot but exposes a typed `Voyage` projection, the change can be additive, yet it must be owned and reviewed by Shared Platform rather than hidden in Booking attributes.

## Data and Migration Feasibility

An additive rollout is practical because the repository already has versioned booking snapshots and a `booking_snapshot_migration` audit table. The current legacy canonicalizer only succeeds when a voyage and physical equipment identifier can instantiate the old invariant. W3-04 must replace that behavior with deterministic classification:

- Derive only facts supported by authoritative stored values.
- Preserve unknown/legacy attributes until deliberately mapped.
- Mark missing commercial facts explicitly incomplete.
- Block confirmation, not draft read, until required facts are corrected.
- Record source/target version, outcome, and reason without fabricating parties, schedule deadlines, quantities, or container identifiers.

Rolling compatibility requires readers to tolerate old and new snapshots during deployment and contract consumers to accept optional/additive fields before writers rely on them.

## Infrastructure and AWS Landscape

AWS assessment: **N/A by binding design**. LinerCore runs on-premises with Docker Compose; dev/staging/prod isolation is by hosts, networks, and Compose projects, not cloud accounts. There are no AWS services, accounts, regions, CDK stacks, or cloud landing zones to modify.

W3-04 reuses PostgreSQL 15+, Kafka/Confluent Schema Registry, Keycloak/identity, Nginx, Vault, Prometheus/Grafana, ELK, Jaeger, OpenTelemetry, GitHub Actions self-hosted runners, Harbor, and existing Terraform/Ansible/Compose topology. Expected infrastructure impact is configuration/schema migration and normal service/image deployment only.

## Security, Privacy, and Compliance Feasibility

- Party/customer references and customer reference are Confidential and PII-linked; cargo commercial facts are Confidential business data.
- Booking may store stable party references and minimum approved audit snapshots. It must not log raw party/cargo payloads, widen `booking.confirmed`, or copy the Reference Data master.
- Existing controls remain applicable: Keycloak/OIDC, identity-service authorization, BFF-only browser access, HttpOnly tokens, TLS 1.2+, encrypted PostgreSQL/Kafka volumes, Vault-managed secrets, structured/correlation audit logs, OWASP Top 10/API Top 10, CIS hardening, dependency/license gates.
- PCI DSS and HIPAA are not triggered by the approved data. GDPR territorial applicability, residency/retention, and FMC tariff obligations remain tied to the unresolved program trade/regulatory footprint; W3-04 must not invent a geography decision.
- A focused privacy review in Requirements/NFR work must specify purpose, minimum snapshots, masking, authorization, retention linkage, and audit evidence.

## Operational Feasibility

The live Compose stack already contains all services needed for the vertical proof. Required additional operational evidence is bounded: reference degradation and stale selection; pricing timeout/validation/no-rate paths; duplicate submit/idempotency; optimistic conflict; schema-valid event with absent identifier; snapshot migration outcomes; responsive/a11y states; correlation across Booking → Charge and Booking → Kafka.

No new on-call technology is introduced. Existing Prometheus/Grafana, ELK, Jaeger, and OpenTelemetry can carry W3-04 metrics, logs, and traces. Later NFR stages should set thresholds rather than inventing them here.

## Delivery and Resource Feasibility

- Booking team remains the single Driver.
- Shared Platform owns the voyage projection/reference contract contribution.
- Charge reviews the pricing request mapping and provider fixtures.
- CMM reviews but should not need business-domain changes if the optional-identifier event contract is honored.
- LinerCore/W2-02 owner reviews shared UI pattern changes; W3-04 owns only page-level behavior.
- No known change freeze or Wave 3 capacity blocker exists; this is an explicit assumption to revalidate in Delivery Planning.

No monetary or calendar limit is documented. Feasibility therefore protects the approved slice and live DoD; any later fixed-date/budget constraint must return as an explicit scope tradeoff rather than silently weakening contracts or evidence.

## Conditional GO Criteria

1. Requirements Analysis freezes names, requiredness, length/precision/units, temporal semantics, provenance, validation errors, and PII handling.
2. Shared Platform provides typed, authoritative cargo cutoff and documentation deadline facts—or the user explicitly revises the schedule decision.
3. Booking snapshot migration/upcast is additive, restartable/idempotent, observable, and proven on representative old records.
4. Pricing Pact/provider behavior proves exact party/commodity/date/quantity mapping and existing failure semantics.
5. `booking.confirmed` stays BACKWARD-compatible and omits unassigned `equipmentId` without widening to party/cargo PII.
6. Shared-shell states, accessibility/responsive evidence, live Compose journey, `aidlc-audit`, and `erp-fidelity-audit` remain release-blocking.

With these conditions, W3-04 is feasible and should proceed to Scope Definition.

