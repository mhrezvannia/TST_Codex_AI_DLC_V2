# Domain Entities - U05 Route Compatibility and Preservation

## Source Context

This entity model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U05 models route aliases and preservation evidence, not new business aggregates.

## Entity Catalog

| Entity / value object | Owner | Attributes | U05 role |
| --- | --- | --- | --- |
| RouteAlias | shell/Nginx route adapter | source path, canonical target, redirect/resolution mode | Maps `/bookings*` to `/booking*`. |
| CanonicalShellRoute | `apps/shell` | path, route id, breadcrumb, active nav | User-facing shell route. |
| PreservationScopeItem | evidence harness | prior intent id, file/path area, allowed interaction | Defines W0-01/W0-02/W1-01/W2-02 boundaries. |
| PriorWorkTouchRecord | evidence harness | file path, prior work, reason, verification result | Records justified touches. |
| CompatibilityEvidenceRecord | evidence harness | source route, canonical route, subject, outcome, correlation id | Proves compatibility route behavior. |
| WaiverReference | evidence harness | source intent, status BLOCKED, blocker `compose-start` | Keeps W1 live-proof waiver explicit. |

## Relationships

| Relationship | Cardinality | Rule |
| --- | --- | --- |
| RouteAlias to CanonicalShellRoute | 1 to 1 | Every `/bookings*` alias has a deterministic `/booking*` target. |
| CanonicalShellRoute to CompatibilityEvidenceRecord | 1 to 0..n | Evidence records route compatibility outcomes. |
| PreservationScopeItem to PriorWorkTouchRecord | 1 to 0..n | Any touched prior-work file is justified and verified. |
| WaiverReference to CompatibilityEvidenceRecord | 1 to many | Evidence package carries W1 waiver state without rewriting it. |

## State Model

| State | Meaning | Transition |
| --- | --- | --- |
| AliasRequested | User opens `/bookings*`. | Route adapter maps to canonical route. |
| CanonicalResolved | Shell route `/booking*` is active. | Protected route and Booking behavior run. |
| CompatibilityVerified | Old URL lands in shell and preserved behavior works. | Evidence captured. |
| PreservationReviewed | Diff review classifies prior-work touches. | Targeted verification or no-touch record. |
| WaiverPreserved | W1 BLOCKED waiver referenced unchanged. | U05 complete. |

## Invariants

- Compatibility aliases cannot bypass authentication or actor propagation.
- Canonical route labels and breadcrumbs remain singular `/booking*`.
- Preservation evidence is not broad reimplementation evidence.
- W1 waiver status remains BLOCKED at `compose-start`.
