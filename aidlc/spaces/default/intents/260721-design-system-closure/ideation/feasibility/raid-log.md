# RAID Log

This RAID log operationalizes intent-statement.md, competitive-analysis.md, market-trends.md, and build-vs-buy.md.

## Risks

| ID | Risk | Likelihood | Impact | Treatment |
|---|---|---:|---:|---|
| R-01 | Primitive migration changes Booking behavior or form semantics | Medium | High | Incremental migration with focused tests and live journey replay |
| R-02 | Shared package lacks a state primitive needed by Booking | Medium | Medium | Add the smallest reusable primitive in packages/ui; avoid local substitute |
| R-03 | Isolated verification accidentally targets the protected demo | Low | Critical | Use only wave-a wrapper; inspect config; demo:guard before/after |
| R-04 | Automated component checks miss page-context accessibility defects | Medium | High | Playwright keyboard/focus/theme/responsive matrix on live routes |
| R-05 | Evidence is generated but not durable or auditable | Medium | High | Store commands, results, screenshots, and audit outputs under artifacts/w2-02-live |

## Assumptions

| ID | Assumption | Validation |
|---|---|---|
| A-01 | c2f13dd remains the protected baseline | Git ancestry check before and after implementation |
| A-02 | Existing Booking and @erp/ui code is the implementation to preserve | Graph and targeted source review |
| A-03 | Local prerequisites can run the isolated stack | local:check and wave-a config/ps |
| A-04 | No new data processing or infrastructure contract is introduced | Final diff and architecture review |

## Issues

| ID | Observed issue | Required resolution |
|---|---|---|
| I-01 | Booking TSX does not yet prove @erp/ui consumption | Migrate applicable page primitives |
| I-02 | No formal shared Skeleton proof was found in the closure preflight | Implement/export/consume if confirmed by source inspection |
| I-03 | Keyboard, theme, responsive, and state evidence is incomplete | Execute and retain the full Playwright matrix |

## Dependencies

| ID | Dependency | Failure response |
|---|---|---|
| D-01 | Protected manager demo remains healthy | Halt if pre/post demo:guard fails |
| D-02 | linercore-wave-a Compose project and real Booking services | Diagnose isolated stack only |
| D-03 | Shared package API and Booking route contracts | Preserve or repair regressions before approval |
| D-04 | aidlc-audit and erp-fidelity-audit tooling | Intent cannot close until both are green |
