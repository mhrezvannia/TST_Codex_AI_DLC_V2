# Performance Design - U05 Route Compatibility and Preservation

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It implements local Compose/Nginx performance design for `/bookings*` compatibility and deterministic prior-work preservation evidence.

## Design Decisions

| Decision | Design | Requirement coverage |
| --- | --- | --- |
| PERF-D01 | Implement compatibility as shell-owned Next.js redirect routes; Nginx forwards `/bookings*` to the shell unchanged and shell redirects to canonical `/booking*`. | PERF-01, REL-01 |
| PERF-D02 | Do not perform Booking backend calls before redirect from legacy to canonical route. | PERF-01, SCALE-01, SCALE-02 |
| PERF-D03 | Canonical `/booking*` pages retain the relevant U01/U02 timing targets after compatibility resolution. | PERF-02, REL-03 |
| PERF-D04 | Preservation verification is evidence/build-time diff and targeted-check work, not a runtime dependency. | PERF-03, SCALE-03 |
| PERF-D05 | Do not add new runtime services, route databases, global state libraries, or W4-01 migration surfaces. | SCALE-04, NFR-07 |
| PERF-D06 | Route precedence is exact: `/bookings/new` maps before any dynamic id route; `/bookings/[id]` maps only after validation preserves one safe path segment. | REL-01, REL-02, SEC-03 |

## Latency Budget

| Segment | Local target | Notes |
| --- | --- | --- |
| `/bookings*` compatibility resolution | 1 second p95 | Excludes auth redirect and cold start. |
| Canonical `/booking` list after resolution | U01 route timing target | Auth/session/actor proof still applies. |
| Canonical `/booking/new` create after resolution | U02 create timing target | No duplicate data loading from legacy route. |
| Canonical `/booking/[id]` detail after resolution | U02 detail timing target | Preserve a validated id segment; detail query parameters are dropped for W2-01. |
| Preservation diff report | Deterministic evidence-time artifact | Broad full-suite rerun only when touched prior-work files justify it. |

## Routing Mechanics

U05 chooses redirect, not internal rewrite, as the compatibility mechanism. The shell owns the mapping so implementation and evidence have one source of truth:

| Legacy route | Redirect target | Status | Parameter handling |
| --- | --- | --- | --- |
| `/bookings` and `/bookings/` | `/booking` | 308 for GET | Preserve allowlisted list parameters only. |
| `/bookings/new` and `/bookings/new/` | `/booking/new` | 308 for GET | Drop unknown parameters; no id interpretation. |
| `/bookings/[id]` and `/bookings/[id]/` | `/booking/[id]` | 308 for GET when valid; shell 404 when invalid | Decode the id once, reject invalid percent encoding, encoded slash, path traversal, empty id, or extra segments, then re-encode with `encodeURIComponent` for the canonical redirect. |

Safe query allowlist:

- List route: `page`, `pageSize`, `sort`, `direction`, `status`, `q`.
- Create route: no query parameters are required; unknown query parameters are dropped.
- Detail route: no query parameters are allowed for W2-01; all detail query parameters are dropped.

Allowlisted query values are decoded once by `URLSearchParams` and re-encoded by the redirect URL builder; invalid percent encoding drops that parameter. Duplicate allowlisted query keys keep the first value and drop later duplicates. Unknown query parameters are dropped during redirect. Malformed ids, extra path segments, encoded slash/path traversal, invalid percent encoding in the id, empty ids, or attempts to make `new` an id return shell 404 from the compatibility route without redirecting and without touching booking-service.

## Optimization Strategy

- Use static one-to-one route mapping rather than database-backed lookup.
- Preserve only the named safe query parameters needed for Booking navigation; reject arbitrary redirect targets and drop unknown query parameters.
- Avoid loading Booking data on both compatibility and canonical routes for one user action.
- Keep preservation evidence as path/diff analysis and targeted verification.
- Avoid dependencies prohibited by `tech-stack-decisions.md`: Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.

## Preservation Boundary

U05 NFR Design preserves prior merged work by explicit boundary:

| Prior work | U05 NFR boundary |
| --- | --- |
| W0-01 platform/eventing | Do not redesign eventing, outbox, messaging, telemetry, or platform correlation infrastructure. Any touch requires a W2-01-specific reason and targeted verification. |
| W0-02 reference-data | Do not alter reference-data seed/completeness surfaces or migrate reference-data UI. Any reference-data touch requires explicit W2-01 route/shell justification and targeted verification. |
| W1-01 Booking | Preserve list/detail/create/action semantics and W1 waiver wording. U05 adds compatibility routing only; it does not redefine Booking fields, queries, or W1 live-proof status. |
| W2-02 design-system foundation | Do not add a broad design-system foundation or new styling stack. U05 consumes existing primitives/patterns and records gaps without owning W2-02. |

## Measurement Design

U05 evidence should record:

- Legacy source route and canonical target route.
- Redirect status.
- Query/id handling: allowlisted list query values decoded once and re-encoded, create/detail queries dropped, valid detail id decoded once and re-encoded, invalid ids return shell 404.
- Authenticated subject and correlation id where relevant.
- Canonical route timing after resolution.
- Preservation diff/path report for W0-01, W0-02, W1-01, and W2-02.
- Targeted verification result for every justified prior-work touch.

For each of `/bookings`, `/bookings/new`, and `/bookings/[id]`, PASS requires canonical target evidence, auth/session/actor preservation, no `local-user`, no backend call before redirect, and scoped W0-01/W0-02/W1-01/W2-02 preservation evidence. Performance PASS is not valid if compatibility bypasses shell auth, preloads Booking data before redirect, accepts open redirect input, mishandles `/bookings/new` as an id, or rewrites W1 waiver evidence as PASS.
