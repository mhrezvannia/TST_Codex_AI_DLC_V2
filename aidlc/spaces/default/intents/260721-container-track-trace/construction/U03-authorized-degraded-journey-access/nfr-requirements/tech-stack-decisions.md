# Tech Stack Decisions - U03 Authorized Degraded Journey Access

## Source Alignment

U03 uses the locked brownfield `technology-stack.md` and the existing
`business-logic-model.md`, `business-rules.md`, and `requirements.md` contracts.

## Decisions

| Concern | Decision | Rationale |
| --- | --- | --- |
| authorization | Existing singular `AuthorizationPort.evaluate`, called fresh per use case | Avoids inventing a batch API or authorization cache |
| degradation | Existing Identity/Reference Data adapters with typed 403/503/last-known DTOs | Fail-closed and truthful freshness without new data source |
| persistence | Existing Spring transaction/PostgreSQL repositories | Exact zero-row/denial-audit write sets |
| UI | Existing Next/React/TypeScript and shared primitives | CMM page ownership only; no shell or packages/ui redesign |
| verification | JUnit, Vitest, Playwright, isolated Compose scripts, `npm run demo:guard` | Evidence for API, UI, accessibility, concurrent isolation, and manager-demo protection |

No RTK, cache, migration, new broker, public DCSA/EDI API, fleet/depot/M&R
module, or production observability platform is added. Acceptance runs use the
isolated `linercore-wave-a` Compose stack only, with `npm run demo:guard` before
and after; a single live acceptance stack is permitted at a time and port 8088
is protected. The prior W1 BLOCKED result remains a BLOCKED waiver, never a
PASS.
