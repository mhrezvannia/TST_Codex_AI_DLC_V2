# Functional Design Questions - dnd-exact-historical-calculation

The approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md` resolve the architecture and observable behavior. These questions confirm exact-evidence and presentation posture.

## Q1. Incomplete or mismatched historical evidence

How should the provider handle a pre-W3 or mismatched Standard receipt that cannot prove the full echoed snapshot?

A. Return `404 NO_RATE` without reconstruction, current-authority selection, nearest-version fallback or silent successor upgrade
B. Reconstruct missing fields from current Agreement and Rate tables
C. Select the newest currently effective D&D version
D. Guess applicability from port and equipment only
E. Return a partial zero-valued result
X. Other (please specify)

[Answer]: A

## Q2. Calculation and UI evidence

How should calculation breadth be exposed in this Unit?

A. Keep the pure port-local calendar-day formula and exact Agreement/Tariff/version/timezone evidence in provider and authorised existing detail/audit compositions; add no calculation-preview action
B. Add working-day and holiday exclusion configuration
C. Add progressive rate bands
D. Add a general-purpose UI calculation simulator
E. Hide source versions and timezone from authorised evidence
X. Other (please specify)

[Answer]: A

## Ambiguity check

The selected answers must preserve exact old/successor Agreement and Tariff evidence, zero and non-zero lines, UTC/local boundaries, restart survival and no silent reselection.
