# Code Generation Memory

## Interpretations

- 2026-07-03T15:24:00Z - Treated the engine directive without `directive.unit` as the B01 walking-skeleton batch; the produced artifacts cover the gated walking-skeleton units from delivery planning instead of one isolated unit.
- 2026-07-03T15:25:00Z - Used inline implementation despite `mode: subagent`; the configured developer/reviewer subagents were unavailable in this account earlier, so this stage records inline fallback and preserves artifacts for review.

## Deviations

- 2026-07-03T15:26:00Z - Proceeded without an additional plan-approval stop; the user explicitly instructed continued execution without optional stage asks until the Shared Platform is locally functional, while the final engine approval gate remains mandatory.
- 2026-07-03T15:27:00Z - Limited code changes to TypeScript BFF/runtime surfaces in this pass; local Java, Maven, Yarn command, Docker daemon, and service ports are unavailable from the shell, blocking safe Java service and full Compose validation.

## Tradeoffs

- 2026-07-03T15:28:00Z - Chose real BFF service clients with explicit 503 errors over static local success responses; this makes local failures visible and keeps browser callers behind the BFF boundary.
- 2026-07-03T15:29:00Z - Added a guarded non-production Reference Data auth bypass path now because the user is blocked by auth/read-only behavior; the bypass is disabled in production and remains explicit in permission reasons.
- 2026-07-03T15:35:00Z - Centralized bypass rules in `@erp/auth`; sharing the guard prevents auth app, proxy, and Reference Data BFF from drifting into different bypass safety behavior.
- 2026-07-03T15:43:00Z - Implemented seed apply through service APIs but left Keycloak Admin user creation out of this pass; the current local functional path uses auth bypass plus identity role assignment, and the missing service runtime is recorded as apply failure evidence.
- 2026-07-03T15:52:00Z - Built the Reference Data workbench as a client component over BFF APIs with fallback data; this keeps the UI usable when services are down while making create/edit behavior real when permissions and services are available.
- 2026-07-03T16:01:00Z - Split contract verification into offline and live modes; offline checks protect catalog/schema/provider-path integrity, while live checks fail with evidence until services are running.
- 2026-07-03T16:08:00Z - Added local readiness aggregation with `blocked` as a first-class status; this prevents missing Docker/Java/service runtime from being confused with code validation failures.

## Open questions

- 2026-07-03T15:30:00Z - Confirm local runtime prerequisites on the user's machine after installing/running Yarn, Java, Maven, and Docker Desktop; the frontend code validates, but full Shared Platform runtime cannot be proven until services listen on 8080, 8082, 8083, and 8088.
