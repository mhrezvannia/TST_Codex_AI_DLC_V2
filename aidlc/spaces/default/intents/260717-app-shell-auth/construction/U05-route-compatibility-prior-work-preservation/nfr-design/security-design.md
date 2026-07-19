# Security Design - U05 Route Compatibility and Preservation

## Source Context

This design consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. U05 security design ensures legacy `/bookings*` compatibility cannot bypass protected shell auth/session checks, actor propagation, or prior-work guardrails.

## Route Security Design

| Control | Design |
| --- | --- |
| Protected compatibility | `/bookings*` compatibility lands in the same protected shell route behavior as canonical `/booking*`. |
| Fixed mapping | Only shell-owned Next.js redirect mappings are allowed: `/bookings` -> `/booking`, `/bookings/new` -> `/booking/new`, `/bookings/[id]` -> `/booking/[id]`. |
| Route precedence | `/bookings/new` is matched before any dynamic id route; dynamic ids allow one safe segment only and return shell 404 for invalid percent encoding, encoded slash, traversal, empty id, or extra path segments. |
| Open redirect prevention | Compatibility must not honor arbitrary external or user-supplied redirect targets; unknown query parameters are dropped. |
| Actor preservation | Compatibility cannot bypass shell actor propagation or reach Booking as `local-user`. |
| Correlation | Compatibility route evidence retains correlation id where a protected Booking action occurs. |

## Preservation Security Design

| Control | Design |
| --- | --- |
| Protected prior-work set | W0-01, W0-02, W1-01, and W2-02 files are unchanged or touched only with W2-01-specific justification. |
| Guard preservation | No prior-work security guard can be weakened to simplify shell routing. |
| W1 waiver | W1 live-proof waiver remains BLOCKED at `compose-start`; no false PASS wording. |
| Targeted verification | Any touched prior-work file gets targeted verification tied to the reason for touch. |

## Data Protection

- Legacy routes do not disclose Booking data until the canonical protected route completes its normal auth/session/actor checks.
- Query preservation is allowlist-only: list route keeps `page`, `pageSize`, `sort`, `direction`, `status`, and `q`; create and detail routes drop all query parameters for W2-01.
- Encoded value handling is deterministic: allowlisted query values are decoded once by `URLSearchParams` and re-encoded by the redirect URL builder; invalid percent encoding drops that parameter; duplicate allowlisted keys keep the first value. Valid detail ids are decoded once and re-encoded with `encodeURIComponent`; invalid detail ids return shell 404 before redirect or backend access.
- Preservation reports include file paths, touch reasons, and verification outcomes, not secrets or raw tokens.
- Route evidence may include QA-safe subject, source/target path, route result, and correlation id.

## Threat Controls

| Threat | Mitigation |
| --- | --- |
| Auth bypass via legacy URL | Legacy route maps into protected shell route behavior before Booking data loads. |
| Open redirect | Static route map only; no arbitrary redirect target input. |
| Actor fallback | Same BFF/backend actor contract as canonical `/booking*`; no `local-user` compatibility mode. |
| Scope creep | Diff review rejects broad prior-work rewrites without W2-01 reason. |
| Waiver laundering | Evidence explicitly keeps W1 waiver BLOCKED at `compose-start`. |

## Verification Design

- Route tests/live proof cover `/bookings`, `/bookings/new`, and `/bookings/[id]` mapping.
- Security tests/code review confirm no open redirect, no backend call before compatibility redirect, route precedence for `/bookings/new`, trailing slash handling, shell 404 for malformed ids, deterministic encoded id/query handling, and unknown query dropping.
- BFF/backend evidence confirms actor propagation and no `local-user` fallback.
- Diff/path review records W0-01, W0-02, W1-01, and W2-02 preservation status.
