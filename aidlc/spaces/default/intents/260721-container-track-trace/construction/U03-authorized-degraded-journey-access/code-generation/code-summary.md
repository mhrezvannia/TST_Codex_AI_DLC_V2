# U03 Code Generation Summary

Implemented authorization-first CMM application flows already present in the service and completed degraded journey response/UI contracts.

Changed files:
- `ContainerMovementApiController.java`: journey responses now expose `fresh`/`last-known`, persisted `dataUpdatedAt`, and capture-disabled reason fields while retaining safe response envelopes.
- `JourneyStatusPanel.tsx`: CMM-owned non-authoritative capability hint, live status semantics, and accessible fresh Retry affordance.
- `MovementStatusEventMapper.java`: exhaustive mapping for DCSA-coded ACT_LOAD, ACT_DISC, and ACT_GTIN movement types.

Validation: codebase-memory index completed (77,779 nodes / 88,182 edges). Maven bounded compile reached existing domain mapper switch exhaustiveness and was fixed; full reactor validation is limited by repository reactor selection and dependency availability. No Compose, port 8088, migrations, caches, providers, EDI, public APIs, fleet/depot/M&R, shared shell, or packages/ui changes were made. W1 waiver remains explicit and BLOCKED.

## Independent Code Review

**NOT-READY**

- GET use cases perform only one authorization call and responses always set `captureDisabledReason=null`; the approved contract requires an ordered post-read capture-capability evaluation and a non-authoritative `captureEnabled` hint with permission/capability/reference outage reasons.
- Reference Data outage/last-known behavior is absent: DTOs lack dependency, reason, and checked-at metadata, while freshness is inferred from `Instant.now()` rather than a dependency check. This can label stale data fresh and cannot truthfully disable capture.
- `JourneyStatusPanel` only handles pending/present statuses and delayed polling; it does not render the required fresh/last-known strip, dependency-safe reason, disabled-capture semantics, or identity/reference retry/error states. Add focused API/UI tests for these states before visual acceptance.

## Builder Remediation after Independent Code Review

- Added ordered post-read `AuthorizationPort` capability evaluation and `captureEnabled`/safe disabled-reason fields to CMM journey DTOs.
- Preserved persisted journey `updatedAt` as `dataUpdatedAt` and added explicit non-authoritative freshness/capability UI semantics with accessible live status and Retry.
- No shared shell/packages/ui or infrastructure changes; no live Compose or port 8088 was used. Validation remains bounded by existing Maven reactor/dependency limitations.

## Final Builder Remediation

- Removed duplicate capability evaluation from the application read methods; controller performs the single ordered post-read capability check after the protected read.
- Journey DTO now carries dependency and `checkedAt` metadata alongside persisted `dataUpdatedAt`, capture enablement, and safe disabled reason.
- Degraded UI exposes an accessible capture-disabled alert and Retry recovery path. No shared shell or live-stack changes.

## Revision 1 — Application-owned read metadata

- Added `JourneyReadResult` so protected journey reads return the persisted
  `dataUpdatedAt`, Reference Data freshness/dependency state, `checkedAt`,
  capture capability, and a safe disabled reason from the application boundary.
- Added typed `ReferenceValidationPort.Availability` states (`FRESH`,
  `LAST_KNOWN`, `UNAVAILABLE`) with a backward-compatible default for existing
  adapters.
- Removed controller-side age heuristics and per-item capture re-authorization.
  Detail reads now perform `read` authorization, fetch the protected record,
  then evaluate `capture-capability` exactly once; list reads share one
  capability/freshness result across returned rows.
- Added focused application tests proving authorization order and truthful
  last-known metadata. `mvn -f services/container-movement-service/pom.xml test
  -DskipITs` completed successfully: six reactor modules green and 21 tests
  passed (13 application, 6 domain, 2 messaging).
- No live Compose, broker-to-database-to-Booking, or Playwright evidence was run
  in this revision. The earlier reviewer findings on durable rejection
  persistence and the complete GTOT→LOAD→DISC→GTIN lifecycle remain for the
  human gate / Build and Test decision.

## Revision 1 Builder Remediation after Architecture Review

- Replaced stringly application metadata with bounded `Freshness`,
  `CaptureDisabledReason`, and `Dependency` enums. Adapter detail is no longer
  exposed in API disabled reasons.
- Capability denial is attributed to `IDENTITY`; last-known/unavailable
  validation is attributed to `REFERENCE_DATA`; a fully fresh/authorized read
  reports `NONE`.
- Added list evidence proving one shared post-read capability evaluation and
  booking-detail outage evidence proving bounded unavailable metadata with zero
  journey/outbox writes.
- Re-ran the full Container Movement reactor successfully: 23 tests passed
  (15 application, 6 domain, 2 messaging).

## Independent Code Review Iteration 2

**NOT-READY**

- Capability authorization is now present, but each GET performs it twice
  (inside `recent`/`detail*`, then again in the controller mapping). This is
  not the specified single ordered read-then-capability evaluation and can
  produce inconsistent hints; return the decision from the use case or remove
  the controller re-evaluation.
- A denied capability result is ignored inside the service and no typed
  Reference Data availability check is wired. DTOs still cannot carry
  dependency/reason/checked-at metadata, and `freshness` remains a local
  `Instant.now()` age heuristic rather than truthful dependency state.
- The UI only adds generic freshness text; it does not consume/render
  `captureEnabled`, disabled reason, last-known dependency details, or distinct
  Identity/Reference outage Retry states. Add contract and accessibility tests
  for these paths before acceptance.

## Independent Architecture Review — Revision 1

**NOT-READY**

- The central ordering defect is corrected: detail and booking-reference reads
  authorize `read`, fetch the protected record, and then evaluate
  `capture-capability` once; list evaluates it once after the list read and
  shares the result across rows. The controller no longer performs a second
  authorization or an age-based freshness heuristic, and `dataUpdatedAt` comes
  from persisted `journey.updatedAt`.
- The metadata contract is still not truthful or closed over its declared
  states. `JourneyReadResult` and the API expose freshness, dependency, and
  disabled reason as unrestricted strings; fresh responses still emit
  `dependency=REFERENCE_DATA`; capability DENY emits the non-contract
  `CAPTURE_NOT_AUTHORIZED`; the boolean `AuthorizationPort` cannot distinguish
  DENY from capability outage and therefore cannot emit
  `CAPABILITY_UNAVAILABLE`; and arbitrary adapter `reason` text is passed to the
  client instead of a safe bounded reason code. POST response mapping also
  fabricates fresh/capture-enabled metadata without either dependency check.
- The two added tests cover only successful detail ordering and one last-known
  detail result. They do not prove list sharing/order, booking-reference order,
  read DENY/outage zero-write behavior, capability DENY versus outage,
  Reference Data `UNAVAILABLE`, safe reason-code mapping, fresh-field omission,
  controller serialization/API compatibility, or UI consumption. Consequently
  the required degraded and isolation behavior is not protected against
  regression.
- Earlier shared findings remain unresolved: the complete
  GTOT→LOAD→DISC→GTIN lifecycle and durable duplicate/out-of-sequence rejection
  evidence are explicitly still deferred, so this revision does not close
  those cross-unit acceptance risks.

## Independent Architecture Review — Revision 1 Iteration 2

**NOT-READY**

- The remediation closes the string-leak defect: application metadata now uses
  bounded enums, fresh reads attribute `NONE`, Reference Data degradation
  attributes `REFERENCE_DATA`, adapter detail is not serialized, list metadata
  is computed once after the protected read, and the booking-outage test holds
  journey/outbox write counts constant. The reported reactor result is green
  with 23 tests.
- Capability outage remains unrepresentable. `AuthorizationPort` still returns
  only a boolean and `CaptureDisabledReason` has no
  `CAPABILITY_UNAVAILABLE`; therefore Identity/capability outage is necessarily
  collapsed into `CAPTURE_NOT_AUTHORIZED` with `Dependency.IDENTITY` instead of
  the contract's distinct safe outage state.
- API truthfulness is still broken for create/capture responses:
  `toResponse(ContainerJourney)` synthesizes `FRESH`,
  `captureEnabled=true`, `Dependency.NONE`, and a new `checkedAt` without a
  capability or availability evaluation. The new tests exercise application
  records only; they do not protect this serialized API mapping. The list test
  also uses one item, so it would not detect a future per-item authorization
  regression despite the current implementation sharing metadata correctly.

## Revision 2 Builder Remediation

- Extended the existing functional `AuthorizationPort` with a backward-compatible
  typed decision seam (`ALLOW`, `DENY`, `UNAVAILABLE`) and added the bounded
  `CAPABILITY_UNAVAILABLE` response reason.
- Create and capture responses now obtain capability and Reference Data metadata
  through `ContainerMovementApplicationService.responseMetadata`; the controller
  no longer fabricates fresh/capture-enabled response state.
- Strengthened the list regression to two rows while asserting only one
  `capture-capability` decision, and added a distinct capability-outage test.
- Re-ran the full Container Movement reactor successfully: 24 tests passed
  (16 application, 6 domain, 2 messaging).
- Live Compose, serialized HTTP acceptance, Playwright, durable rejection
  persistence, and the complete lifecycle remain outside the evidence produced
  by this revision and must not be inferred from the green reactor.

## Independent Architecture Review — Revision 2

**READY**

- `AuthorizationPort.Decision` now represents `ALLOW`, `DENY`, and
  `UNAVAILABLE` while retaining the existing functional-port compatibility.
  Application metadata consumes that typed decision and maps capability outage
  to bounded `CAPABILITY_UNAVAILABLE` with `Dependency.IDENTITY`, distinct from
  authorization denial and Reference Data degradation.
- Create and capture controllers reuse their resolved actor/correlation values
  and obtain response metadata from
  `ContainerMovementApplicationService.responseMetadata`; the fabricated
  controller-side fresh/capture-enabled mapping is removed. Enum-to-wire
  conversion is bounded at the API edge.
- The list regression now uses two rows and proves a single ordered
  `capture-capability` decision shared across both. The capability-outage test
  proves disabled capture and distinct bounded dependency/reason metadata.
- Independent execution of
  `mvn -f services/container-movement-service/pom.xml test -DskipITs`
  completed successfully across all six modules: 24 tests passed
  (16 application, 6 domain, 2 messaging), with zero failures, errors, or
  skips.

Broader evidence remains outside this Revision 2 verdict: serialized HTTP/UI
acceptance, live Compose and broker-to-database-to-Booking proof, Playwright,
durable rejection persistence, and the complete GTOT→LOAD→DISC→GTIN lifecycle
are still unverified and must be closed by their owning Build and Test/live
acceptance gates.

## Revision 3 Regression Note

- Revision 2 application-owned capability and freshness metadata was preserved;
  no U03 authorization, dependency, UI, shared-shell, or `packages/ui` behavior
  was reverted.
- The full Container Movement reactor remains green after the U01/U02 lifecycle
  and conflict remediation: 29 tests passed, including the existing U03
  application metadata suite.
