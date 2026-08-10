# Architecture Decisions - W4-01 Module List-Detail Uplift

## Sources and Status

These proposed ADRs implement approved `requirements.md` and `stories.md`, preserve `architecture.md`, `component-inventory.md`, and `team-practices.md`, incorporate the answered Application Design questions, and bind the approved Refined Mockups. They remain proposed until the Application Design gate is approved.

| ADR | Decision | Reversibility |
| --- | --- | --- |
| ADR-001 | Preserve existing bounded services and owned data | Low |
| ADR-002 | Federate canonical routes while rendering one shared shell implementation | Medium |
| ADR-003 | Add a CMM-owned frontend/BFF deployable | Medium |
| ADR-004 | Use fail-closed BFF authorization and signed provider subject assertions | Low |
| ADR-005 | Add exact CMM v2 media and provider-owned `timelineV1` | Medium |
| ADR-006 | Admit controls and Approval Queue segments only from verified capabilities | Easy |
| ADR-007 | Add no W4 cache; use provider freshness only | Easy |
| ADR-008 | Keep shared UI/navigation gaps in W2-02 ownership | Medium |
| ADR-009 | Preserve event choreography, document controls/gap, and separate outcomes | Low |

## ADR-001: Preserve Existing Bounded Services and Data Ownership

### Context

Identity, Reference, Charge, Booking, and CMM are separate ports-and-adapters services with owned PostgreSQL persistence. W4 is a UI-led vertical uplift.

### Decision

Extend existing services through additive public/query ports only. Add no backend service, database, cross-service SQL, shared cache, Kafka topic, or AWS resource.

### Consequences

- Existing domain authority and migrations remain intact.
- UI must tolerate distributed failures and explicit contract blockers.
- No new replication or shared-write surface appears.

### Alternatives Rejected

- Shared W4 aggregation service/database: creates a new authority and operator.
- Direct BFF database reads: bypass policy and schema ownership.

### Reversibility

Low; changing service/data boundaries is a separate enterprise intent.

## ADR-002: Federated Routes with One Shared Shell Implementation

### Context

Nginx already routes Reference and Charge to independent Next apps. Source inspection also shows three divergent shell implementations: `apps/shell/ShellFrame`, title-derived `@erp/ui/PlatformShell` use in Reference/Charge, and additional noncanonical Booking chrome. A reverse proxy cannot wrap a remote document with `apps/shell` React chrome.

### Decision

Keep domain pages/BFFs in their apps, but make the W2-02-owned `PlatformShell` plus route registry the only canonical shell implementation. `apps/shell`, Reference, Charge, and CMM each invoke that same API in their root layout. `apps/shell` retires `ShellFrame`; domains own no rail, top bar, mobile navigation, skip link, theme root, or auth shell.

Use Next `basePath` equal to each domain's canonical prefix and preserve full URIs at Nginx. Host-wide session cookie `Path=/` crosses prefixes. Every public location clears the exact eleven trust headers and sets the five trusted host/forwarded/correlation values specified in `component-methods.md`; internal service calls bypass that policy. Direct links and refresh render a full document from the target app with the shared shell. Assets stay under `/<prefix>/_next/*`.

### Consequences

- One executable shell/configuration and one accessibility fix path exist across federated deployables.
- W2-02 must release the expanded shell/registry API before W4 integration; no domain fork is an acceptable bridge.
- Edge tests cover roots, direct refresh, assets, cookies, active navigation, one landmark tree, and target-scoped failure.

### Alternatives Rejected

- Proxy-side HTML/React wrapping: not implementable for independent Next documents.
- Move all domain source into `apps/shell`: violates domain ownership and user answer A.
- Retain separate shell implementations: violates FR-001/FR-022.

### Reversibility

Medium. Deployable/mount topology may later change while canonical URLs and shared shell API remain stable.

## ADR-003: CMM-Owned Frontend and BFF

### Context

CMM backend and Booking projection exist, but no CMM frontend source, route, navigation item, or mount exists.

### Decision

Create `apps/container-movement` with `basePath=/container-movement`, two approved routes, BFF policy/provider adapters, view models, and page composition. It consumes ADR-002's shared shell and adds no domain-local shell/theme/auth/shared primitive. Add internal base-path-aware health and Compose/Nginx integration.

### Consequences

- CMM owns its vocabulary and test surface.
- One frontend deployable/image/health/mount is added; no backend or database is added.

### Alternatives Rejected

- Put CMM pages in Shell: platform would own CMM behavior.
- Put CMM pages in Booking: conflates projection and Journey authority.

### Reversibility

Medium; source can later consolidate without changing canonical routes/contracts.

## ADR-004: Fail-Closed BFF Authorization and Signed Subject Assertion

### Context

Browser actor/capability authority is prohibited. The current CMM controller accepts actor-shaped query/body fields, while the existing Charge BFF demonstrates a method/path/correlation-bound signed subject assertion.

### Decision

Every BFF derives the subject/correlation from the authenticated request, authorizes exact current-request capability, rejects unknown query/body keys, and calls the provider only after ALLOW. CMM v2 uses a dedicated short-lived signed subject assertion verified by the provider. Actor query/body is absent in v2. Identity outage fails closed.

### Consequences

- Provider receives a verifiable subject without trusting browser headers.
- CMM needs assertion verification/key configuration and contract tests.
- Existing actor-shaped v1 remains internal compatibility only and is not exposed through W4 routes.

### Alternatives Rejected

- Client/shell flags: presentation is not enforcement.
- Plain forwarded actor header: spoofable without a trusted internal boundary/assertion.
- `local-user` fallback: privilege ambiguity.

### Reversibility

Low for the security posture; assertion implementation can be replaced by an approved equivalent.

## ADR-005: Versioned Provider-Owned CMM Timeline

### Context

Current Journey JSON exposes expected movements and accepted history separately. Expected state has planned LOAD/DISC, while the domain's accepted sequence is GTOT/LOAD/DISC/GTIN. The browser must not merge or infer lifecycle. Current Journey state does not own received time or event source.

### Decision

Add `application/vnd.linercore.container-journey-v2+json` on existing reads with required `timelineV1`; default JSON remains unchanged. Provider rules map `GTOT|ACT_GTOT`, `ACT_LOAD`, `ACT_DISC`, and `ACT_GTIN` to four canonical stages; derive GTOT/GTIN expected location from LOAD/DISC respectively; retain every accepted record; preserve repeated legacy evidence; put unsupported legacy records under `OTHER`; and emit planned stages only when unrecorded.

Each item declares order, disposition, canonical/readable/provider codes, expected/actual locations, occurrence, event/correlation evidence, validation outcome, and ordering basis. Received/source are absent until producer-owned facts exist. BFF/browser only translate/render.

### Consequences

- One producer-authoritative sequence supports all consumers and exact contract tests.
- Additive producer/consumer media negotiation is required.
- Missing received/source remains visibly unsupported rather than synthesized.

### Alternatives Rejected

- BFF/browser merge: duplicates domain order/next-move rules.
- Mutate default JSON without negotiation: raises compatibility risk.
- Drop legacy/repeated records: loses accepted evidence.

### Reversibility

Medium; v2 can evolve through explicit versioning while v1 stays compatible.

## ADR-006: Verified Capability and Approval Queue Admission

### Context

Provider query/action capabilities differ. Approval Queue is safe only when Agreement and Rate providers independently expose bounded Draft/pending filters and pagination.

### Decision

Render controls only after provider plus Identity capability contracts pass. Duplicate or unknown read-query keys return typed invalid-query/HTTP 400 before provider access. Admit each Approval Queue segment independently; missing segments return unavailable with owner/evidence. Never download or client-merge broad resources. The Charge-to-Reference option port uses the exact bounded method/transport declared in `component-methods.md`. CMM read/capture capabilities use exact proposed strings and remain blocked until Identity registers/tests them.

### Consequences

- UI remains provider-truthful and bounded.
- Some similar pages intentionally expose different controls.

### Alternatives Rejected

- Generic uniform controls: false behavior.
- Client filtering/merge: incomplete and unbounded authority.

### Reversibility

Easy; admit controls after contract evidence.

## ADR-007: No New W4 Cache

### Context

No approved cache owner, retention, authorization, or invalidation contract exists.

### Decision

Show last-known only when an owning authorized service/BFF returns persisted facts with source/time. Add no browser, BFF, Redis, or shared cache. Authorization is never last-known.

### Consequences

- No silent authority drift or cache subsystem.
- More outages show explicit error/Retry.

### Alternatives Rejected

- Browser/session cache and shared cache: unowned staleness/security/infrastructure.

### Reversibility

Easy through a future approved caching intent.

## ADR-008: Platform Ownership for Shared UI and Navigation

### Context

W4 needs one shell, tokens, accessible primitives, safe navigation, responsive patterns, and focus recovery; shared executable behavior may be incomplete.

### Decision

Consume `@erp/ui`, auth, API/config, and shell registry. Domain apps may compose semantic page markup with shared tokens, but general behavior gaps go to W2-02 and stay BLOCKED until released. Same-module return context is prefix/query allow-listed; Booking/Journey cross-links use a signed bounded origin token with canonical fallback. No local theme/shell/component fork or arbitrary return URL is allowed.

### Consequences

- Coherent product behavior and one fix path.
- W4 sequencing depends on platform releases.

### Alternatives Rejected

- Temporary forks: permanent drift.
- Relax accessibility/navigation validation: security/WCAG defects.

### Reversibility

Medium; component implementation can evolve, ownership invariant remains.

## ADR-009: Preserve Event Choreography and Make Its Gap Explicit

### Context

Booking confirmation and CMM status already use Kafka/Avro/outbox patterns. Verified controls include publisher retry/permanent dispositions, CMM Booking-event idempotency/revision guards, and Booking movement-event receipts/stale suppression. Listener factories have no verified bounded retry, poison, DLQ, or replay contract.

### Decision

Keep existing topics and choreography; add no synchronous creation/direct Booking write and no W4 Kafka topic. UI presents persistence, publication, and Booking application separately. Unknown capture outcomes refetch using the same signed attempt token before retry.

Document current poison blast radius: one bad record may block its partition, while other partitions, owning aggregate truth, synchronous module reads, and direct relationship lookup continue. Event acceptance remains BLOCKED until owners provide verified replay/poison controls or approve a bounded change.

### Consequences

- Existing ownership/idempotency are preserved without false reliability claims.
- Runtime event-path approval has an explicit owner/evidence dependency.

### Alternatives Rejected

- Synchronous Booking/CMM orchestration: temporal coupling and duplicate contract.
- Claim implicit retries as DLQ/replay: unsupported.
- New dead-letter topic in W4: outside approved no-new-topic boundary.

### Reversibility

Low for event ownership; operational failure handling may be added by approved change.

## Cross-ADR Security, NFR, and AWS Assessment

Together these decisions provide implementable route/base-path/session/header composition, fail-closed identity, consistent BFF outcomes, provider-owned timeline semantics, exact Booking ownership, provider-truth controls, and honest event failure containment. Production availability, cloud scaling, backup, DR, cost, and AWS Well-Architected decisions remain out of scope.

## Gate Decision

Application Design approval accepts ADR-001 through ADR-009 as the implementation basis and accepts the disclosed platform/provider/event dependencies as blockers that must be closed or remain explicitly blocked at their later gates. It does not authorize a second shell, local theme/shared fork, client-authoritative operation, new backend/database/topic, or unsupported acceptance claim.
