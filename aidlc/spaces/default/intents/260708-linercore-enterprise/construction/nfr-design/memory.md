# NFR Design Memory

## Interpretations

- 2026-07-09T08:47:45Z - Treated `contract-platform-catalog` as artifact-only for design execution; the approved NFR Requirements already resolved timing, security, scale, reliability, and stack decisions, so no additional human question round was needed for this Construction unit.
- 2026-07-09T08:47:45Z - Treated `local-runtime-foundation` readiness as layered rather than binary; container startup, infrastructure readiness, application readiness, and evidence readiness are separate states because the approved requirements explicitly reject false-green local runtime claims.
- 2026-07-09T08:47:45Z - Treated frontend permissions as advisory for `shared-platform-identity-security`; backend authorization remains the enforcement boundary because the approved security requirements explicitly reject route hiding as authorization.
- 2026-07-09T08:47:45Z - Treated Reference Data cacheability as consumer-side optimization only; Reference Data remains the source of truth and consumers must use APIs/events rather than direct database joins.
- 2026-07-09T08:47:45Z - Treated Booking integration latency as orchestration state rather than a Booking-owned SLA; seam-specific timeout and retry budgets belong to integration units while Booking owns pending and exception visibility.
- 2026-07-09T08:47:45Z - Treated Charge calculation results as immutable commercial evidence; later recalculation is review evidence and must not overwrite the original pricing result.
- 2026-07-09T08:47:45Z - Treated CMM status as a materialized projection over durable movement facts; late or out-of-order facts are preserved and either applied deterministically or surfaced as exceptions.
- 2026-07-09T08:47:45Z - Treated Booking-to-Charge pricing degradation as Booking-visible orchestration state; Charge remains the calculation owner while Booking owns timeout, circuit, snapshot, and exception visibility.
- 2026-07-09T08:47:45Z - Treated `booking.confirmed` as the durable boundary between Booking and CMM; CMM journey state is reconciled from event evidence rather than a shared database or synchronous journey command.
- 2026-07-09T08:47:45Z - Treated seed fixtures as deterministic evidence data only; they support setup and validation but must not stand in for implemented business behavior.
- 2026-07-09T08:47:45Z - Treated `containermovement.status` as CMM-owned evidence consumed by Booking; Booking can use it for lifecycle and D&D trigger inputs but must not derive movement status itself.
- 2026-07-09T08:47:45Z - Treated D&D trigger idempotency as distinct from Charge request idempotency; Booking must avoid duplicate D&D requests for the same booking revision and movement boundary before Charge sees the request.
- 2026-07-09T08:47:45Z - Treated Enterprise Web route/action permissions as presentation hints only; backend services remain the enforcement authority and UI route hiding is not security completion.
- 2026-07-09T08:47:45Z - Treated observability/quality readiness as evidence aggregation and gate evaluation rather than ownership of service behavior; owning units must still produce the source behavior and source evidence.

## Deviations

- 2026-07-09T08:47:45Z - Used inline architecture review in the primary artifact; the configured `aidlc-architecture-reviewer-agent` cannot run under the current Codex account/model configuration, so the review was documented directly in `performance-design.md`.

## Tradeoffs

- 2026-07-09T08:47:45Z - Deferred a central contract registry service in favor of generated evidence artifacts and a read-only health model; this preserves local-first validation and avoids first-release persistence and operations scope while keeping a clear path to add a registry later if generated artifacts no longer scale.
- 2026-07-09T08:47:45Z - Kept observability and devtools optional at the profile level; this keeps core local development fast and reliable while still allowing `full` and selected profiles to prove the broader enterprise topology.
- 2026-07-09T08:47:45Z - Used versioned effective-permission caching instead of uncached authorization for every UI guard; this meets lookup budgets while preserving revocation and capability-change safety.
- 2026-07-09T08:47:45Z - Used transactional outbox instead of synchronous Kafka publish in the reference mutation path; this protects API latency and prevents Kafka outages from losing committed reference changes.
- 2026-07-09T08:47:45Z - Modeled Booking confirmation as fast state transition plus exception/pending state rather than waiting indefinitely for every external dependency; this keeps UI feedback bounded while preserving integration evidence.
- 2026-07-09T08:47:45Z - Modeled Charge failures as typed no-price, conflict, timeout, or manual-required states instead of generic errors; this gives Booking stable orchestration semantics without moving pricing ownership.
- 2026-07-09T08:47:45Z - Used materialized status snapshots rather than recalculating CMM status from full movement history on every query; this meets query targets while keeping movement facts as the recoverable source.
- 2026-07-09T08:47:45Z - Used bounded retry only for idempotent pricing requests; this avoids amplifying Charge failures while still allowing safe transient recovery.
- 2026-07-09T08:47:45Z - Kept the primary Booking-to-CMM integration event-driven instead of adding a synchronous journey API fallback; this preserves service ownership and makes replay/deduplication evidence explicit.
- 2026-07-09T08:47:45Z - Used service-owned migration paths instead of a shared enterprise migration schema; this preserves database ownership and no-cross-SQL boundaries at the cost of orchestration complexity.
- 2026-07-09T08:47:45Z - Used quarantine for stale/out-of-order status events rather than discarding them silently; this preserves evidence for operations and debugging while preventing unsafe lifecycle updates.
- 2026-07-09T08:47:45Z - Modeled no-rule and rule-conflict D&D outcomes as typed manual-required states rather than generic calculation failures; this preserves commercial reviewability and keeps Booking orchestration stable.
- 2026-07-09T08:47:45Z - Used lazy evidence panels instead of loading full logs/audit/contract detail with every route; this keeps operational screens fast while still preserving access to proof when requested.
- 2026-07-09T08:47:45Z - Deferred a central evidence database in favor of generated CI/local artifacts and a read-only readiness view; this reduces first-release persistence scope while keeping the evidence model structured enough to evolve later.

## Open questions

- 2026-07-09T08:47:45Z - Code Generation and CI Pipeline still need exact command names, package locations, and validator package selections for the contract validation runner.
