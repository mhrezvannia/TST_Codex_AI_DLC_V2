# Requirements Analysis Questions — W4-01

These questions cover unresolved product requirements only. The approved scope already fixes the three-module outcome, Reference → Charge → Container order, one authenticated shell, shared tokens and `@erp/ui`, real provider behavior, complete states, accessibility/responsive evidence, and live audit gates.

## Q1. Canonical Detail Route Identity

Which stable route contract should requirements bind?

A. Use `/reference-data/[setCode]/[recordId]`, `/charge-agreements/[agreementId]`, and `/container-movement/journeys/[journeyId]`, with provider-stable identifiers and direct-refresh support. **(Recommended)**
B. Use opaque provider IDs for every path segment, including the Reference set segment.
C. Leave exact identifiers unresolved until Application Design and require only an abstract `/<id>` shape now.
X. Other (please specify)

[Answer]: A — Named stable routes (Recommended)

## Q2. Legacy Route Retirement

How should actual superseded Reference Data and Charge entrypoints behave?

A. Permanently redirect only when the canonical target is unambiguous, preserve allow-listed query context, reject unsafe return targets, and return a clear gone/not-found state for ambiguous legacy URLs; create no redirect for the nonexistent Container Movement app. **(Recommended)**
B. Return gone/not-found for every retired route with no redirects.
C. Keep legacy and canonical routes serving equivalent pages indefinitely.
X. Other (please specify)

[Answer]: A — Safe selective redirect (Recommended)

## Q3. List Query and Pagination Contract

How consistent should search, filter, sort, and pagination be across modules?

A. Keep all query operations server/provider-authoritative and URL-backed; publish a per-module capability matrix, use provider-supported defaults/limits, and omit or mark `BLOCKED` unsupported controls rather than adding backend behavior. **(Recommended)**
B. Require a common 25-row default and 25/50/100 page sizes plus identical search/filter/sort capabilities, expanding providers where necessary.
C. Allow client-only filtering, sorting, and pagination over whatever data each current endpoint returns.
X. Other (please specify)

[Answer]: A — Provider authoritative (Recommended)

## Q4. Authorization Presentation

What should users see when capabilities differ?

A. Hide module navigation when read capability is absent, render an explicit denied state for direct links, show read-only truth when read is allowed without mutation, and omit mutation commands with a concise explanation. **(Recommended)**
B. Always show every module and action, then display denial only after the user attempts access or mutation.
C. Hide denied modules and actions completely, including on direct links, by returning not-found.
X. Other (please specify)

[Answer]: A — Capability-shaped UI (Recommended)

## Q5. Stale and Degraded Provider Behavior

When a provider is unavailable, what data may remain visible?

A. Show only authorized, already-persisted last-known data with source/time evidence; disable freshness-dependent mutations and offer Retry. Never cache authorization or invent client data; modules without a trustworthy persisted view show provider error instead. **(Recommended)**
B. Fail every list/detail route closed with no last-known data whenever any provider dependency is unavailable.
C. Let each frontend cache its most recent successful payload and continue reads and mutations optimistically.
X. Other (please specify)

[Answer]: A — Bounded last-known (Recommended)

## Q6. Local Performance Acceptance

No production SLO is approved. Which measurable W4 acceptance target should apply to the isolated stack?

A. After documented warm-up, require p95 BFF list/detail responses at or below 1,000 ms and p95 route operational-readiness at or below 2,500 ms under 10 concurrent local users, with fixture, host, samples, and percentile method recorded. **(Recommended)**
B. Measure and report local performance without a pass/fail threshold.
C. Establish these values as production SLOs and availability commitments.
X. Other (please specify)

[Answer]: A — Measured local target (Recommended)

## Q7. Return Context and Cross-Module Links

How should Back-to-results and Agreement/Journey/Booking cross-links preserve context safely?

A. Use allow-listed internal route/query state or a bounded origin token, restore supported list filters/page and the invoking row focus, keep detail URLs independently shareable, and fall back to the canonical list when context is absent or invalid. **(Recommended)**
B. Rely only on browser history; direct links do not need deterministic return behavior.
C. Accept arbitrary `returnUrl` values so callers can restore any prior location.
X. Other (please specify)

[Answer]: A — Safe bounded context (Recommended)
