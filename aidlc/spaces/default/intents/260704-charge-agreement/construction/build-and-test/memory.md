# Build and Test Memory

## Interpretations

- 2026-07-05T20:06:00Z - Build and Test covers the implemented B01/U01 walking skeleton because later units have design artifacts but no generated application code yet.

## Deviations

- 2026-07-05T20:06:00Z - Used direct local tool paths and package-level commands because global `yarn` is not on PATH and `yarn install` hit network instability.

## Tradeoffs

- 2026-07-05T20:06:00Z - Treated Docker/Compose as out of scope for B01 evidence; host-runtime build and test evidence is valid for the walking skeleton gate.

## Open questions

- 2026-07-05T20:06:00Z - Re-run `yarn install` when network is stable to regenerate install metadata normally.
