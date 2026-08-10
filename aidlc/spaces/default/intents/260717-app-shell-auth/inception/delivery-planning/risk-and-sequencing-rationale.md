# Risk and Sequencing Rationale - W2-01 App Shell and Auth

## Source Context

This rationale consumes `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. It explains why `bolt-plan.md` chooses its Bolt order.

## Heuristic

The plan uses a hybrid of:

- Cockburn walking skeleton: B01 proves the thinnest shell/auth/Booking read path across all layers before wider behavior.
- Risk-first sequencing: B02 through B04 tackle real-subject allow, deny, and sign-out risks before compatibility and final audit packaging.
- Ordinal WSJF-style reasoning: value, time criticality, risk reduction, and size are assessed qualitatively because no numeric economic inputs were supplied.

## Ordinal Scoring

| Bolt | User/business value | Time criticality | Risk reduction | Relative size | Sequencing result |
| --- | --- | --- | --- | --- | --- |
| B01 | High | High | Highest | Medium | First: proves architecture and prevents false evidence from hardcoded actor fallback. |
| B02 | High | High | High | Medium | Second: proves real-subject allow path and Booking preservation before route compatibility. |
| B03 | Medium | High | High | Small | Third: proves denied path after allow-path foundation and before final UX/session closure. |
| B04 | Medium | High | High | Small | Fourth: proves sign-out and stale-call guard before compatibility/final audit. |
| B05 | Medium | Medium | Medium | Small | Fifth: proves prior-link compatibility and preservation after create/detail path exists. |
| B06 | High | High | Medium | Small | Last: packages evidence only after all behavior is demonstrable. |

## Dependency Validation

The order respects `unit-of-work-dependency.md`:

- U01/B01 is dependency-free.
- U02/B02, U03/B03, and U04/B04 depend on U01/B01.
- U05/B05 depends on U01/B01 and U02/B02.
- U06/B06 depends on U02/B02, U03/B03, U04/B04, and U05/B05.

There is no topological deviation. The only parallel opportunity is B03 with B04 after B01; the plan keeps the default serial path because one mob owns shared shell/session state and the final live proof benefits from a stable allow/deny/sign-out sequence.

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Earliest Bolt |
| --- | --- | --- | --- | --- |
| Shell protected route still creates `local-user` through local bypass | Medium | High | B01 requires live read evidence with non-`local-user` actor; detector 6d remains final gate. | B01 |
| Booking BFF fan-in misses one `serviceHeaders` caller | Medium | High | Change central header contract and update all traced fan-in callers; add tests alongside code. | B01/B02 |
| identity-service lacks Booking permissions or `local.booking.user` seed | High | High | B02 owns permission/catalog/fixture work before allow-path gate. | B02 |
| Deny path renders as blank/error outside shell | Medium | Medium | B03 requires in-shell denied surface with real-subject/correlation evidence. | B03 |
| Sign-out leaves stale shell chrome or BFF calls | Medium | High | B04 requires post-sign-out route and BFF fail-closed proof. | B04 |
| `/bookings*` compatibility regresses existing W1 paths | Medium | Medium | B05 drives old routes and preserved list/detail/create behavior live. | B05 |
| Prior merged W0-01/W0-02/W1-01/W2-02 work is rewritten | Medium | High | B05/B06 require scoped diff review and W2-01-specific justification for touched prior-work files. | B05 |
| Docker/Compose dependency blocks live proof | Medium | High | B06 records honest W2-01 BLOCKED evidence if runtime cannot start; never rewrites W1 waiver as PASS. | B06 |

## Preservation Rationale

W2-01 is a vertical shell/auth plus Booking mount intent. It must consume W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system work through stable interfaces. Sequencing keeps preservation proof late enough to inspect the actual W2-01 diff, but not as a substitute for live behavior. W1's live-proof waiver remains explicit as BLOCKED at `compose-start`.
