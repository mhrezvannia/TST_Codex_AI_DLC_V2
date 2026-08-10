# Performance Design — booking-design-system-closure

## Design Inputs

This design implements `performance-requirements.md` while preserving the controls in `security-requirements.md`, bounds in `scalability-requirements.md`, failure semantics in `reliability-requirements.md`, retained tooling in `tech-stack-decisions.md`, and route/action flow in `business-logic-model.md`.

## Request and Rendering Path

The canonical path remains browser → nginx → server-oriented shell route → shell adapter → Booking BFF → existing services. Performance work is limited to removing duplicate presentation work and bounding the existing path:

- list/detail reads execute once at the server route boundary with `no-store` behavior preserved;
- the list request fixes the accepted page size at 25 and renders at most that page;
- URL query state, not a global store, owns search/filter/pagination continuity;
- focused client components own form/action interaction only;
- each action reducer permits one pending command and one network call;
- shared Skeleton geometry reserves the list/form/detail async area;
- the Table’s own wrapper contains narrow-screen overflow.

No cache, CDN, client query library, global state store, speculative prefetch, connection-pool change, or timeout increase is introduced.

## State Normalization

One route adapter maps unresolved work to loading, empty success to empty, non-empty success to populated, 401/403 to denied, usable partial dependency results to degraded, and other safe failures to error. One action reducer maps idle/pending into success, validationBlocked, recoverableError, denied, degraded, or fatalError.

This removes render-time branching duplication and makes timing measurable at two points:

1. navigation/command start;
2. first named terminal discriminator and stable rendered result.

## Browser Measurement Design

The root Playwright harness attaches before navigation:

- page-error and unhandled-rejection collection;
- relevant console-error collection;
- request/response timing for shell same-origin Booking routes;
- command-call counting;
- route/action terminal-state observation;
- screenshot/trace retention on every failure.

Every non-fatal matrix case must record zero unhandled errors/rejections/timeouts. The fatal-boundary case injects one exact expected failure, asserts the named boundary, and fails on any additional error or timeout. Durations are stored as observed values with commit, route, state, theme, viewport, and Compose project; no percentile is inferred.

## Layout Performance

- Skeleton and terminal content share stable minimum geometry at each route boundary.
- Loading motion uses shared tokens and respects reduced motion.
- Hover/focus styling changes color/border/shadow only and does not transform layout.
- At 375/768/1024/1440, an assertion compares document scroll width to viewport width; any page-level excess fails.
- Table scroll width may exceed its container only when the container itself is the named horizontal scroller.
- Primary commands are asserted visible and not clipped.

## Budget Enforcement

| Budget | Enforcement point | Failure action |
|---|---|---|
| Existing 2,500 ms BFF abort | Booking BFF regression test | Preserve safe 503/error mapping; no deadline increase |
| 25-record page/DOM bound | Shell query plus Playwright row assertion | Fail and correct pagination/adapter |
| One pending command | Action reducer and network counter | Fail duplicate-command test |
| Zero non-fatal browser errors/timeouts | Full Playwright matrix | Retain trace and keep Unit open |
| No production dependency growth | Manifest diff and production build | Remove or justify explicit proven generic need |

## Rejected Optimizations

Caching and automatic retries could stale Booking state or duplicate commands; a global client store would duplicate server truth; virtualization is unnecessary for 25 rows; higher timeouts would hide the existing failure contract. Each remains rejected until a separate measured bottleneck supplies evidence and scope.

