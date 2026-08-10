# Constraint Register

This register is derived from intent-statement.md, competitive-analysis.md, market-trends.md, and build-vs-buy.md.

## Binding Constraints

| ID | Type | Constraint | Verification |
|---|---|---|---|
| C-01 | Baseline | Preserve c2f13dd and ancestry from c96b5b3; no reset or replacement | Git ancestry and final diff review |
| C-02 | Ownership | W2-02 exclusively owns packages/ui, shared tokens/primitives, Booking reference migration, and design-system master | Changed-path review |
| C-03 | Architecture | One authenticated shell; no second frontend, navigation, or module-local theme | Import, route, and style review |
| C-04 | Runtime | Use scripts/wave-a-compose.mjs and Compose project linercore-wave-a only | Config output and container labels |
| C-05 | Demo safety | Protect linercore-shared-platform and 127.0.0.1:8088 with demo:guard before/after | Guard logs |
| C-06 | Evidence | Live Compose, Playwright proof, aidlc-audit, and erp-fidelity-audit must pass | Durable evidence bundle |
| C-07 | Truth | Preserve W1 blocked/waived record; do not relabel it PASS | Artifact diff and audit review |
| C-08 | Scope | Close unresolved DoD gaps only; no external library adoption or redesign | Plan and diff review |
| C-09 | Accessibility | Demonstrate keyboard/focus, responsive states, themes, and feedback in page context | Playwright and screenshots |

## Environmental Constraints

- Docker, Compose, Yarn 4.5.3, browsers for Playwright, and the local service build chain must be available.
- The isolated stack may need an alternate host port if 8088 is occupied by the protected demo; the manager URL itself remains untouched.
- Evidence must use real BFF/backend behavior for the agreed Booking journey, not mock-only substitutes.

## Non-Constraints

- No AWS environment or cost commitment.
- No new external SaaS or component-library procurement.
- No formal accessibility certification or new legal assertion.
