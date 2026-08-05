# NFR Requirements Questions — booking-design-system-closure

## Context

These decisions refine the presentation/evidence behavior in `business-logic-model.md` and `business-rules.md`, the numbered gates in `requirements.md`, and the brownfield stack in `technology-stack.md`. This closure introduces no backend capacity change, production environment, cloud topology, regulatory scope, or formal certification.

ui-ux-pro-max again supports data density, filters, visible focus, reduced motion, and responsive checks. Its marketing gateway, hero/CTA, alternate palette, remote Fira fonts, and spinner guidance remains rejected by the LinerCore master and executable shared token/Skeleton contract.

## Q1 — Performance Target Boundary

Should W2-02 preserve the existing 2,500 ms Booking BFF request deadline and require no acceptance timeout, unhandled browser error, blank async state, or layout shift, while recording observed command/page durations as a baseline without inventing percentile/throughput SLOs?

- **A (recommended):** Preserve current deadline and collect observed baselines only.
- **B:** Add new p95/p99 and throughput targets without production traffic evidence.

[Answer]: A — Preserve the existing 2,500 ms BFF deadline, collect observed durations, and add no unsupported percentile/throughput SLO.

## Q2 — Scalability and Capacity

Should this presentation closure retain existing pagination/service scaling and verify bounded DOM/render behavior for the accepted page size, with no new load forecast, autoscaling trigger, data-growth target, or load-test claim?

- **A (recommended):** Preserve capacity posture and verify bounded UI behavior only.
- **B:** Introduce a new load/capacity program and infrastructure scaling targets.

[Answer]: A — Retain current pagination/service scaling and verify bounded UI behavior only.

## Q3 — Security and Compliance

Should security acceptance preserve and regression-test the existing shell session, object/action authorization, same-origin command checks, actor/correlation/idempotency propagation, 32,768-byte command limit, 2,500 ms timeout, and safe errors, while making no new SAST/dependency/DAST or regulatory certification claim?

- **A (recommended):** Preserve and test observed controls; record unavailable scanner/compliance evidence honestly.
- **B:** Declare new scanner and formal compliance PASS requirements without installed tooling or an approved framework scope.

[Answer]: A — Preserve and regression-test observed security controls; do not claim unavailable scanners or formal certification.

## Q4 — Accessibility and Responsive Gate

Should acceptance retain the requirements’ WCAG 2.1 AA-oriented gate: zero critical or serious automated accessibility violations, named manual keyboard/focus/label/announcement/reduced-motion checks, both shared themes, and 375/768/1024/1440 widths with no page overflow, overlap, or clipped primary control?

- **A (recommended):** Keep the complete existing measurable matrix.
- **B:** Reduce closure to automated desktop/light-theme checks.

[Answer]: A — Retain the complete automated/manual accessibility, theme, state, and four-viewport matrix.

## Q5 — Reliability and Observability

Should reliability be expressed as deterministic local acceptance—recoverable typed states, value retention, one command in flight, safe retries, correlation continuity, retained failure evidence, green pre/post demo guards, and direct audit exits—without inventing availability, RTO, RPO, MTTR, log-retention, or alerting SLOs?

- **A (recommended):** Use deterministic journey/gate reliability and observed correlation evidence.
- **B:** Add production availability/recovery/monitoring targets to this local closure.

[Answer]: A — Express reliability through deterministic recovery, correlation, guards, retained failures, and direct gate exits without production SLO invention.

## Ambiguity Analysis

All answers set explicit preservation or evidence boundaries. They contain no vague performance, availability, security, or scalability adjective and introduce no unsupported numeric target. Existing numeric controls and acceptance thresholds remain measurable; absent production SLOs are explicitly out of scope rather than left unresolved.
