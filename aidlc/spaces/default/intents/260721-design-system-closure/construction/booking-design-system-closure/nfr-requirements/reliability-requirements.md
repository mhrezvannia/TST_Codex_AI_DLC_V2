# Reliability Requirements — booking-design-system-closure

## Basis and Reliability Model

Reliability derives from the explicit states and recovery paths in `business-logic-model.md`, hard rules in `business-rules.md`, NFR-004/NFR-008/NFR-009 and closure gates in `requirements.md`, and the existing local runtime in `technology-stack.md`. This is deterministic local acceptance, not a new production availability, recovery, retention, or alerting commitment.

## Journey Reliability Requirements

| ID | Scenario | Required outcome |
|---|---|---|
| REL-001 | Loading/deferred data | Stable shared Skeleton, then exactly one named terminal state; no blank/endless state. |
| REL-002 | Validation failure | Valid input retained, specific summary/field details announced, useful focus, correction path available. |
| REL-003 | Recoverable service/transport failure | Last returned Booking/input retained, no false success, safe retry of only the failed command. |
| REL-004 | Authorization denial | Denied state in the shared shell, safe navigation, no forbidden command or blind retry. |
| REL-005 | Partial dependency degradation | Reliable Booking content remains visible; unavailable capability is named and isolated. |
| REL-006 | Confirm timeout/unknown outcome | Confirmation is not asserted; existing idempotency is preserved and retry/reload is explicit. |
| REL-007 | Command concurrency | Exactly zero duplicate network commands from repeated activation while one is pending. |
| REL-008 | Fatal/unexpected UI failure | Route error boundary and retained browser/trace evidence; no swallowed error or generic false retry. |

## Accessibility and Responsive Reliability

- Automated accessibility evaluation reports zero critical and zero serious violations for required canonical cases. If a direct severity-capable checker is absent, add a pinned dev-only Playwright/axe integration; never report the gate from semantic assertions alone.
- Named manual assertions cover keyboard order, visible focus, persistent labels, error association, announcements, dialog focus trap/Escape/restore, reduced motion, and non-color-only status.
- Both shared themes and widths 375, 768, 1024, and 1440 pass with zero page-level overflow, overlapping interactive targets, or clipped primary controls.
- A failed case is retained with route, state setup, theme, viewport, result, screenshot/trace, and retry history.

## Runtime and Demo Safety

| ID | Gate | Failure semantics |
|---|---|---|
| REL-009 | Pre-acceptance `npm run demo:guard` | Stop before any Wave A stack action; retain failure; W2-02 pending. |
| REL-010 | Wrapper/project isolation | Every stack command uses `scripts/wave-a-compose.mjs` and `linercore-wave-a`; any forbidden project evidence fails closure. |
| REL-011 | Real happy path | Authenticated create → validate → price → confirm → detail uses live BFF/backend; any detached/mock completion fails. |
| REL-012 | Final demo guard | Run after acceptance/cleanup; failure keeps closure pending even if UI cases passed. |
| REL-013 | Audits | `aidlc-audit` and `erp-fidelity-audit` direct exit results are green; unavailable/masked/failed is not PASS. |
| REL-014 | Retry cycle | After a correction, rerun affected proof, final guard, and both audits; never overwrite original failure. |

## Observability Requirements

- Correlation identity is propagated through shell adapter/BFF/backend as existing and is captured in safe network/evidence context.
- The browser harness records page errors, console errors relevant to the journey, request/response outcome, command timestamps, and terminal UI state.
- Evidence manifest records commit, environment, canonical base route, Compose project, wrapper command, viewport, theme, state-generation method, artifact paths, and direct exit result.
- Secrets, session cookies, tokens, raw credentials, and sensitive request payloads are excluded/redacted.
- Existing application/service logs and health behavior are preserved; W2-02 adds no production dashboard, alert threshold, log-retention period, or on-call claim.

## Availability and Recovery Non-Targets

No evidence supports a production SLA/SLO, availability percentage, RTO, RPO, MTTR, MTBF, backup policy, disaster-recovery topology, or monitoring retention target. These remain unspecified—not zero and not PASS. Local container startup, health, and one acceptance run do not establish long-term availability.

## Closure Truth

Every story and FR/NFR gate must pass together. Any static, live, accessibility, responsive, guard, build, or audit failure keeps W2-02 acceptance-pending. Historical W1 live proof remains BLOCKED/waived; this Unit cannot reinterpret it.

