# User Stories Assessment — W4-01 Module List-Detail Uplift

## Decision

**Execute.** User stories add material value for W4-01 and are required before the ordered Refined Mockups stage.

## Rationale

W4-01 is a user-facing brownfield feature spanning three operational modules, five distinct permission/task contexts, one shared authenticated shell, and exact cross-module navigation. The approved `requirements.md` contains 22 functional and 12 non-functional requirements, provider-specific supported and `BLOCKED` capabilities, mutation and degradation states, legacy route retirement, and live acceptance obligations. Stories are needed to turn those contracts into small actor-valued journeys without flattening provider differences or creating frontend-only behavior.

## Factors Considered

- **Project type:** Brownfield feature uplift, not an isolated refactor or infrastructure-only change.
- **User-facing scope:** Reference set/record discovery, Agreement discovery/detail/lifecycle, Journey discovery/detail/capture, exact Booking links, denied/read-only/degraded recovery, and safe return context.
- **Personas and permissions:** Reference administrator, Pricing analyst, Charge reader, Container operator, and Booking operations user have different goals and action authority.
- **Complexity signals:** Three bounded contexts, route retirement, version/lifecycle rules, async movement outcomes, exact links, capability gaps, and responsive/accessibility evidence.
- **Coordination:** UI Driver plus Reference, Charge, Container Movement, Booking, Identity, shell, and `@erp/ui` owners; additive public-contract changes require producer/consumer sign-off.
- **Delivery sequence:** `team-practices.md` makes Reference Data the walking skeleton, then Charge Agreements, then Container Journeys, all inside the one LinerCore shell.

## Areas Where Stories Add Value

1. Preserve one shell-owned find → inspect → act → recover grammar while making unsupported provider controls visibly absent.
2. Separate read-only and mutation-capable outcomes for each operational persona.
3. Make URL/share/refresh/return-context and legacy-retirement behavior testable as user value.
4. Cover accepted, denied, validation, conflict/sequence, pending, degraded, stale, not-found, and empty outcomes without optimistic truth.
5. Bind implementable Journey↔Booking links while retaining the documented Agreement↔Booking `BLOCKED` exits.
6. Carry accessibility, responsive continuity, live Compose evidence, and the W4 quality/security gates into story acceptance rather than treating them as later polish.

## Source Coverage

- Requirements: `aidlc/spaces/default/intents/260803-module-list-uplift/inception/requirements-analysis/requirements.md`
- Business context: `aidlc/spaces/default/codekb/TST_Codex_W4-01/business-overview.md`
- Component inventory: `aidlc/spaces/default/codekb/TST_Codex_W4-01/component-inventory.md`
- Team practices: `aidlc/spaces/default/intents/260803-module-list-uplift/inception/practices-discovery/team-practices.md`

