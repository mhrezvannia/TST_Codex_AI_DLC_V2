# Business Rules - U01 Platform/Reference Route Foundation

## Source Alignment

Rules trace to U01 `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. Higher authorities remain the W4 scope/security/accessibility contract, LinerCore master, Reference page contract and approved mockups.

## Authorization and Trust Rules

| Rule | Invariant |
| --- | --- |
| BR-001 | Every route evaluates the authenticated subject through Identity for the current request before provider access. |
| BR-002 | Navigation visibility is presentation only; direct links repeat server authorization. |
| BR-003 | DENY or Identity outage fails closed and exposes no provider data. |
| BR-004 | Browser actor, service, assertion, correlation and authorization headers are never trusted. |
| BR-005 | Every public edge location clears the approved eleven trust headers and sets only the approved five replacements. |

## Route and Query Rules

| Rule | Invariant |
| --- | --- |
| BR-010 | Canonical routes use provider-stable `setCode` and `recordId`; direct refresh requires no prior list visit. |
| BR-011 | Set list accepts no query controls. |
| BR-012 | Record list accepts only `includeInactive`, `page`, `size`, and `focus`; browser page is one-based (default 1), size is 25/50/100 (default 25), and only the BFF converts to provider page N-1. |
| BR-013 | Duplicate, unknown, malformed or overlong query values yield `invalid-query` before provider access. |
| BR-014 | Search, selectable sort and client filtering are absent. Provider ordering remains authoritative. |
| BR-015 | Unknown/malformed paths are 404; Reference root is replaced in place and has no invented redirect. |

## Safe Navigation Rules

| Rule | Invariant |
| --- | --- |
| BR-020 | `returnTo` is <=2,048 characters, relative, same-shell, Reference-prefix-bound and query allow-listed. |
| BR-021 | Schemes, hosts, protocol-relative paths, backslashes, control characters, traversal and encoded separators are rejected. |
| BR-022 | Invalid or absent context falls back to the canonical list; it never blocks record readability. |
| BR-023 | Focus restoration occurs only after the target row exists; otherwise focus moves to the list heading/result summary. |

## Provider Truth and Failure Rules

| Rule | Invariant |
| --- | --- |
| BR-030 | UI labels and values come from the approved Reference view models, never raw payload as primary content. |
| BR-031 | `ReadResult<T>` is exhaustively discriminated; no generic catch-all converts failures to success. |
| BR-032 | Last-known data appears only when the authorized owning boundary returns source/time; authorization is never stale. |
| BR-033 | `not-found`, `denied`, `invalid-query`, `stale` and `unavailable` remain distinguishable. |
| BR-034 | Technical evidence remains collapsed/access-appropriate; safe actionable text/reference is primary. |
| BR-035 | Identity outage maps to retryable read `unavailable`/HTTP 503 with zero Reference calls; it is never converted to denied or provider success. |

## UI Ownership and Interaction Rules

| Rule | Invariant |
| --- | --- |
| BR-040 | W2-02 owns `PlatformShell`, registry, tokens and shared primitives; Reference owns routed composition and vocabulary. |
| BR-041 | Missing shared behavior is a W2-02 dependency; no local shell/theme/component fork is allowed. |
| BR-042 | Reference Data has no workflow ribbon, hero, marketing gateway, new palette/font or spinner-only blank page. |
| BR-043 | Stable-size Skeletons precede reads; status is text/non-color; hover/focus does not shift layout. |
| BR-044 | Server components own authority and reads; client components own only supported interaction and focus. |
| BR-045 | `ReferenceRootLayout` renders exactly one shared shell; no route or error state renders another or a fallback shell. |

## Accessibility and Responsive Rules

- BR-050: One h1, ordered headings, skip/main landmarks and persistent labels are mandatory.
- BR-051: All controls and row links are keyboard reachable with visible shared focus rings.
- BR-052: Results/errors/retry changes are announced; status is not color-only; reduced motion is respected.
- BR-053: 375/390 use semantic records; 768 uses labelled keyboard-reachable inner table overflow; 1024/1440 use dense table/detail composition.
- BR-054: Light/dark contrast and 200%/400% zoom/reflow pass with no page-level overflow.

## Scope Rules

U01 is read-only platform/route proof. Create/update, full mutation recovery, lifecycle actions and deeper degradation completion belong to U02. A B01 test may fixture read-only capability but cannot implement deferred commands.

## Rule Verification

Contract tests verify policy-before-provider, query rejection, safe return, result mapping, basePath/assets and exact header policy. Component/route tests verify state and focus semantics. Live Playwright/Compose evidence verifies the real journey, responsiveness, accessibility, performance, demo guards and audits. Static design never equals PASS.
