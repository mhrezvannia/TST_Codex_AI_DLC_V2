# W2-02 Closure Intent Backlog

This prioritized backlog implements intent-statement.md within feasibility-assessment.md and constraint-register.md.

## Proto-Unit

| Unit | Outcome | Priority | Acceptance boundary |
|---|---|---|---|
| U-W2-02-CLOSE | Existing shared UI foundation is consumed by Booking and proven live | Must | All work slices and audits pass together |

The unit is intentionally vertical and indivisible. Later Units Generation may refine tasks but must preserve this acceptance boundary.

## Ordered Work Slices

| Order | Slice | MoSCoW | Relative size | Risk reduction | Dependency |
|---:|---|---|---:|---:|---|
| 1 | Reconfirm graph/source/evidence gaps and protected baseline | Must | 1 | 5 | None |
| 2 | Complete demonstrated @erp/ui primitive/export/style/test gaps | Must | 2 | 5 | 1 |
| 3 | Migrate applicable Booking reference surfaces and document exceptions | Must | 3 | 5 | 2 |
| 4 | Run focused and workspace static/automated verification | Must | 2 | 4 | 3 |
| 5 | Guard demo and validate isolated Compose configuration/runtime | Must | 2 | 5 | 4 |
| 6 | Execute Playwright state/theme/responsive/keyboard evidence matrix | Must | 3 | 5 | 5 |
| 7 | Run aidlc-audit and erp-fidelity-audit; finalize durable evidence | Must | 2 | 5 | 6 |
| 8 | Close W2-02 backlog status without altering W1 waiver truth | Must | 1 | 3 | 7 |

## Prioritization Rationale

Risk-first dependency sequencing is stronger than a numerical ranking for this single-unit closure. Nevertheless, every Must slice has high cost of delay because missing any one prevents the same final acceptance. No Should or Could item is admitted unless a live DoD failure demonstrates necessity.

## Deferred Backlog

- Additional generic design-system components not required by Booking.
- Other module reference migrations.
- Visual refresh or alternate theme direction.
- External library evaluation or adoption.
- New infrastructure, pipeline, or compliance programs.

## Value Stream Map

Text path:

Source-of-truth gap confirmation → shared package correction → Booking consumption → automated checks → isolated live stack → Playwright operator proof → audit/fidelity evidence → program closure.

At each arrow, failure returns to the immediately preceding implementation or verification slice; it never skips forward through a waiver.
